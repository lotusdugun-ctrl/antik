import type * as THREE_NS from "three";
import { noise2, planLandscape, smooth, type Biome, type BiomeLook } from "@/lib/landscape-plan";
import type { Part } from "@/lib/reconstruction-parts";

/**
 * The country round a building: the ground rising into hills past the edge of
 * the site, and the trees of the region standing in it.
 *
 * None of it is a finding. It is there because a building on a disc in an
 * empty sky reads as a model, and the same building with a horizon reads as
 * a place — scale comes from the cypresses as much as from the scale figure.
 * So it is deliberately generic (no attempt at the real skyline behind
 * Aspendos), it keeps well clear of anything measured, and it is left out of
 * the model export along with the clouds and the birds.
 *
 * Where everything goes is planned in `src/lib/landscape-plan.ts`, which also
 * keeps the trees and rocks out of the water, the walls, the roads and the
 * model's own scenery; this file only builds the meshes.
 */
export type { Biome };

type Options = {
  centre: THREE_NS.Vector3;
  span: number;
  /** The level the building stands on. */
  groundY: number;
  /** Half the footprint's diagonal: nothing grows or rises inside it. */
  footprint: number;
  biome: Biome;
  /** The model's parts, its scenery and its life's furniture: kept clear of. */
  parts?: readonly Part[];
};

export function buildLandscape(THREE: typeof THREE_NS, options: Options) {
  const { centre, span, groundY, footprint, biome } = options;
  const plan = planLandscape({
    centre: { x: centre.x, z: centre.z },
    span,
    groundY,
    footprint,
    biome,
    parts: options.parts ?? [],
  });
  const { look, heightAt, tint } = plan;
  const group = new THREE.Group();
  group.name = "landscape";
  const owned: { dispose: () => void }[] = [];

  /* ---- the ground ---- */

  const size = span * 11;
  const terrain = new THREE.PlaneGeometry(size, size, 180, 180);
  terrain.rotateX(-Math.PI / 2);
  const position = terrain.attributes["position"] as THREE_NS.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const swatch = look.palette.map((hex) => new THREE.Color(hex));
  const mix = new THREE.Color();
  // Wet sand and silt at the water's edge, not the colour of the dry fields.
  const shore = new THREE.Color(0x8a7d62);
  /*
   * Round the site the ground is trodden bare — the colour of the paved
   * apron, which fades out over it — and the fields only begin where the
   * hills do, so there is no line where the one stops and the other starts.
   */
  // Leaning to the country's own soil, so bare limestone stays grey.
  const trodden = new THREE.Color(0xb3a283).lerp(new THREE.Color(look.palette[0]), 0.4);
  const clear = footprint * 1.25;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i) + centre.x;
    const z = position.getZ(i) + centre.z;
    const y = heightAt(x, z);
    position.setXYZ(i, x, y, z);
    const t = tint(x / (span * 0.6), z / (span * 0.6));
    mix.copy(swatch[0]!).lerp(swatch[1]!, smooth(0.35, 0.65, t));
    mix.lerp(swatch[2]!, smooth(0.55, 0.9, tint(z / (span * 0.25), x / (span * 0.25))) * 0.6);
    const fromSite = Math.hypot(x - centre.x, z - centre.z);
    const bare =
      1 - smooth(clear * 0.8, clear * 1.25 + span * 0.35, fromSite + (t - 0.5) * span * 0.4);
    if (bare > 0) mix.lerp(trodden, bare * 0.85);
    for (const w of plan.water) {
      if (w.hx * w.hz < 40) continue;
      const above = y - w.top;
      if (above < 1.2) mix.lerp(shore, (1 - smooth(0, 1.2, above)) * 0.7);
    }
    colors[i * 3] = mix.r;
    colors[i * 3 + 1] = mix.g;
    colors[i * 3 + 2] = mix.b;
  }
  terrain.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  terrain.computeVertexNormals();
  /*
   * The colours above are laid per vertex, metres apart; close to, the ground
   * needs grain — tufts, bare patches, pebbles — or it reads as felt. A small
   * tiling texture multiplies it, one tile every five metres or so; far off
   * its mipmaps average to grey and leave the field colours alone.
   */
  const detail = groundDetail(THREE, options.biome);
  detail.repeat.set(size / 5, size / 5);
  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 0,
    map: detail,
  });
  owned.push(detail);
  /*
   * The terrain is a square; its far edge goes into the fog completely, on
   * a circle round the site, whatever the fog's own reach — so the scene's
   * fog can stay thin (distant hills keep their colour) and the land still
   * runs seamlessly into the hazy foot of the skyline.
   */
  const edge = { value: new THREE.Vector4(centre.x, centre.z, size * 0.33, size * 0.47) };
  /*
   * Surf along the shore of the largest sea or river: a band of foam just
   * over the water's line, broken up and breathing in and out with the
   * clock, and dark wet sand above it. Worked out from the height of each
   * point of ground, so it follows the shore however the grid crosses it.
   * One extra noise in the ground's shader; `foam.strength` 0 turns it off.
   */
  const sea = plan.water
    .filter((w) => w.hx * w.hz >= 40)
    .sort((a, b) => b.hx * b.hz - a.hx * a.hz)[0];
  const foam = {
    rect: { value: new THREE.Vector4(sea?.x ?? 0, sea?.z ?? 0, sea?.hx ?? -1, sea?.hz ?? -1) },
    turn: { value: sea?.rot ?? 0 },
    top: { value: sea?.top ?? -1e6 },
    strength: { value: sea ? 1 : 0 },
    time: { value: 0 },
  };
  terrainMaterial.onBeforeCompile = (shader) => {
    shader.uniforms["uEdge"] = edge;
    shader.uniforms["uFoamRect"] = foam.rect;
    shader.uniforms["uFoamTurn"] = foam.turn;
    shader.uniforms["uFoamTop"] = foam.top;
    shader.uniforms["uFoam"] = foam.strength;
    shader.uniforms["uFoamTime"] = foam.time;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vEdgeWorld;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvEdgeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vEdgeWorld;
uniform vec4 uEdge;
uniform vec4 uFoamRect;
uniform float uFoamTurn;
uniform float uFoamTop;
uniform float uFoam;
uniform float uFoamTime;
float foamNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
if (uFoam > 0.0) {
  vec2 q = vEdgeWorld.xz - uFoamRect.xy;
  float c = cos(uFoamTurn);
  float s = sin(uFoamTurn);
  q = abs(vec2(q.x * c - q.y * s, q.x * s + q.y * c)) - uFoamRect.zw;
  float away = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  float near = 1.0 - smoothstep(2.0, 9.0, away);
  if (near > 0.0) {
    float h = vEdgeWorld.y - uFoamTop;
    float n = foamNoise(vEdgeWorld.xz * 0.8 + vec2(uFoamTime * 0.2, uFoamTime * 0.07));
    float line = 0.07 + 0.06 * sin(uFoamTime * 0.9 + n * 6.0);
    float band = 1.0 - smoothstep(0.04, 0.16 + 0.1 * n, abs(h - line));
    float wet = (1.0 - smoothstep(0.0, 0.5, h)) * step(-0.2, h);
    diffuseColor.rgb *= 1.0 - 0.3 * wet * near * uFoam;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.92, 0.9), band * near * uFoam * (0.45 + 0.55 * n));
  }
}`,
      )
      .replace(
        "#include <fog_fragment>",
        `#include <fog_fragment>
#ifdef USE_FOG
gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, smoothstep(uEdge.z, uEdge.w, length(vEdgeWorld.xz - uEdge.xy)));
#endif`,
      );
  };
  terrainMaterial.customProgramCacheKey = () => "antik-terrain";
  const terrainMesh = new THREE.Mesh(terrain, terrainMaterial);
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);
  owned.push(terrain, terrainMaterial);

  /* ---- the trees ---- */

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const at = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const colour = new THREE.Color();
  const tinted = (base: number, shade: number) =>
    colour.setHex(base).multiplyScalar(0.82 + shade * 0.36);

  const byKind = {
    cypress: plan.trees.filter((t) => t.kind === "cypress"),
    crown: plan.trees.filter((t) => t.kind === "crown"),
    conifer: plan.trees.filter((t) => t.kind === "conifer"),
  };

  const instanced = (
    geometry: THREE_NS.BufferGeometry,
    material: THREE_NS.Material,
    count: number,
  ) => {
    const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, count));
    mesh.count = count;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    owned.push(geometry, material);
    group.add(mesh);
    return mesh;
  };

  if (byKind.cypress.length) {
    // Italian cypress: a spindle, 10-16 m.
    const spindle = new THREE.LatheGeometry(
      [
        [0, 0],
        [0.32, 0.03],
        [0.5, 0.18],
        [0.48, 0.45],
        [0.34, 0.72],
        [0.15, 0.92],
        [0, 1],
      ].map(([r, y]) => new THREE.Vector2(r!, y!)),
      10,
    );
    roughen(spindle, 0.07, 3.1);
    shadeUp(THREE, spindle, 0.55);
    const mesh = instanced(
      spindle,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, vertexColors: true }),
      byKind.cypress.length,
    );
    byKind.cypress.forEach((t, i) => {
      quaternion.setFromAxisAngle(up, t.rot);
      matrix.compose(at.set(t.x, t.y - 0.3, t.z), quaternion, scale.set(t.w, t.h, t.w));
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, tinted(0x334a2a, t.shade));
    });
  }

  const trunkFor = (list: typeof plan.trees, share: number) => {
    const trunk = new THREE.CylinderGeometry(0.12, 0.2, 1, 6);
    trunk.translate(0, 0.5, 0);
    const mesh = instanced(
      trunk,
      new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 1 }),
      list.length,
    );
    list.forEach((t, i) => {
      quaternion.setFromAxisAngle(up, t.rot);
      const girth = Math.max(1.2, t.h * 0.09);
      matrix.compose(
        at.set(t.x, t.y - 0.15, t.z),
        quaternion,
        scale.set(girth, t.h * share, girth),
      );
      mesh.setMatrixAt(i, matrix);
    });
  };

  if (byKind.crown.length) {
    // Olive (coast), scrub (steppe), beech (Pontus), juniper (Taurus): a
    // lumpy crown on a short trunk.
    /*
     * Two lumps of leaves, not one ball: an olive's or an oak's crown is
     * uneven, heavier on one side, with light coming through between masses.
     * Darker underneath, where the leaves shade each other.
     */
    const crown = crownGeometry(THREE);
    const mesh = instanced(
      crown,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, vertexColors: true }),
      byKind.crown.length,
    );
    byKind.crown.forEach((t, i) => {
      const trunkH = t.h * 0.38;
      quaternion.setFromAxisAngle(up, t.rot);
      matrix.compose(
        at.set(t.x, t.y + trunkH + t.h * 0.25, t.z),
        quaternion,
        scale.set(t.w, t.h * 0.55, t.w),
      );
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, tinted(look.crownColour, t.shade));
    });
    trunkFor(byKind.crown, 0.42);
  }

  if (byKind.conifer.length) {
    // Spruce, fir or black pine: tiers of branches narrowing to a point.
    const tiers: [number, number][] = [[0, 0]];
    for (let i = 0; i < 4; i += 1) {
      const y = 0.18 + i * 0.2;
      const r = 0.5 * (1 - i * 0.21);
      tiers.push([r, y], [r * 0.45, y + 0.12]);
    }
    tiers.push([0, 1]);
    const cone = new THREE.LatheGeometry(
      tiers.map(([r, y]) => new THREE.Vector2(r, y)),
      8,
    );
    roughen(cone, 0.06, 5.3);
    shadeUp(THREE, cone, 0.5);
    const mesh = instanced(
      cone,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, vertexColors: true }),
      byKind.conifer.length,
    );
    byKind.conifer.forEach((t, i) => {
      quaternion.setFromAxisAngle(up, t.rot);
      matrix.compose(at.set(t.x, t.y - 0.2, t.z), quaternion, scale.set(t.w, t.h, t.w));
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, tinted(look.coniferColour, t.shade));
    });
    trunkFor(byKind.conifer, 0.2);
  }

  /* ---- scattered rock ---- */

  if (plan.rocks.length) {
    const rock = new THREE.DodecahedronGeometry(1, 0);
    const mesh = instanced(
      rock,
      new THREE.MeshStandardMaterial({ color: look.rockColour, roughness: 1, flatShading: true }),
      plan.rocks.length,
    );
    const euler = new THREE.Euler();
    plan.rocks.forEach((r, i) => {
      quaternion.setFromEuler(euler.set(r.rx, r.ry, r.rz));
      matrix.compose(at.set(r.x, r.y, r.z), quaternion, scale.set(r.s, r.sy, r.sz));
      mesh.setMatrixAt(i, matrix);
    });
  }

  /* ---- bushes ---- */

  let shrubMesh: THREE_NS.InstancedMesh | null = null;
  if (plan.shrubs.length) {
    const bush = new THREE.IcosahedronGeometry(1, 1);
    roughen(bush, 0.22, 7.7);
    bush.translate(0, 0.35, 0);
    shadeUp(THREE, bush, 0.45);
    // Low enough that their shadows are lost in the grass: none cast.
    shrubMesh = instanced(
      bush,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, vertexColors: true }),
      plan.shrubs.length,
    );
    shrubMesh.castShadow = false;
    plan.shrubs.forEach((b, i) => {
      quaternion.setFromAxisAngle(up, b.rot);
      matrix.compose(at.set(b.x, b.y - 0.08, b.z), quaternion, scale.set(b.s, b.sy, b.s * 0.85));
      shrubMesh!.setMatrixAt(i, matrix);
      shrubMesh!.setColorAt(i, tinted(look.shrubColour, b.shade));
    });
  }

  const skyline = buildSkyline(THREE, look, Math.round(span * 7));
  owned.push(skyline.mesh.geometry, skyline.mesh.material as THREE_NS.Material);

  return {
    group,
    /** The ground's own material, for the light of the hour to tint. */
    terrain: terrainMaterial,
    /**
     * The surf on the shore: tick it with the clock, and turn it off (0) for a
     * weak device. Nothing to do where the site has no sea or river.
     */
    surf: {
      tick: (seconds: number) => {
        foam.time.value = seconds;
      },
      setOn: (on: boolean) => {
        foam.strength.value = on && sea ? 1 : 0;
      },
    },
    /**
     * The far hills on the horizon, a backdrop of unit size: the caller keeps
     * it round the camera with the sky and colours it with the hour's haze.
     */
    skyline,
    /** The bushes, which a weak device can do without. */
    shrubs: shrubMesh,
    dispose: () => owned.forEach((item) => item.dispose()),
  };
}

/** Pushes each vertex in or out along its direction by a smooth noise, then re-normals. */
function roughen(geometry: THREE_NS.BufferGeometry, amount: number, seed: number) {
  const n = noise2(Math.round(seed * 1000));
  const p = geometry.attributes["position"] as THREE_NS.BufferAttribute;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const k = 1 + (n(x * 2.3 + y * 1.7 + 4, z * 2.3 - y * 1.1 + 4) - 0.5) * 2 * amount;
    // Only sideways for lathed shapes (their axis stays put).
    p.setXYZ(i, x * k, y * (1 + (k - 1) * 0.4), z * k);
  }
  geometry.computeVertexNormals();
}

/** Darker at the foot of a shape than at its top: leaves shading leaves. */
function shadeUp(THREE: typeof THREE_NS, geometry: THREE_NS.BufferGeometry, dark: number) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const p = geometry.attributes["position"] as THREE_NS.BufferAttribute;
  const colours = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i += 1) {
    const t = (p.getY(i) - box.min.y) / Math.max(1e-6, box.max.y - box.min.y);
    const v = dark + (1 - dark) * Math.pow(t, 0.7);
    colours[i * 3] = v;
    colours[i * 3 + 1] = v;
    colours[i * 3 + 2] = v;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
}

/** A broadleaf crown: two lumpy masses of leaves, one a little off to the side. */
function crownGeometry(THREE: typeof THREE_NS) {
  const a = new THREE.IcosahedronGeometry(1, 1);
  const b = new THREE.IcosahedronGeometry(0.72, 1);
  b.translate(0.48, 0.28, 0.22);
  const positions: number[] = [];
  for (const g of [a, b]) {
    const flat = g.index ? g.toNonIndexed() : g;
    positions.push(...(flat.attributes["position"]!.array as Float32Array));
    if (flat !== g) flat.dispose();
    g.dispose();
  }
  const crown = new THREE.BufferGeometry();
  crown.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const p = crown.attributes["position"] as THREE_NS.BufferAttribute;
  const n = noise2(4242);
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const k = 0.84 + n(x * 1.9 + 7, z * 1.9 + y * 1.3 + 7) * 0.32;
    p.setXYZ(i, x * k, y * k * 0.74, z * k);
  }
  crown.translate(-0.2, 0, -0.08);
  // Shared corners again, so the lumps shade smoothly rather than as facets.
  crown.deleteAttribute("normal");
  const welded = mergeByPosition(THREE, crown);
  welded.computeVertexNormals();
  shadeUp(THREE, welded, 0.5);
  return welded;
}

/** Joins vertices at the same place (the faces of a non-indexed shape). */
function mergeByPosition(THREE: typeof THREE_NS, geometry: THREE_NS.BufferGeometry) {
  const p = geometry.attributes["position"] as THREE_NS.BufferAttribute;
  const seen = new Map<string, number>();
  const out: number[] = [];
  const index: number[] = [];
  for (let i = 0; i < p.count; i += 1) {
    const key = `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
    let at = seen.get(key);
    if (at === undefined) {
      at = out.length / 3;
      seen.set(key, at);
      out.push(p.getX(i), p.getY(i), p.getZ(i));
    }
    index.push(at);
  }
  geometry.dispose();
  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
  merged.setIndex(index);
  return merged;
}

/**
 * The grain of the ground, painted once: a pale, nearly white tile (it
 * multiplies the field colours) of soft patches, dry stalks and pebbles.
 * Not colour-managed, so a value of 0.95 darkens by five per cent.
 */
function groundDetail(THREE: typeof THREE_NS, biome: Biome) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  // Tileable value noise: lattices that wrap at the tile's edge.
  const lattice = (cells: number, seed: number) => {
    let s = seed;
    const values: number[] = [];
    for (let i = 0; i < cells * cells; i += 1) {
      s = (s * 16807) % 2147483647;
      values.push(s / 2147483647);
    }
    return (x: number, y: number) => {
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      const at = (cx: number, cy: number) => values[(cy % cells) * cells + (cx % cells)]!;
      return (
        (at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy) +
        (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy
      );
    };
  };
  const big = lattice(4, 11);
  const mid = lattice(16, 23);
  const fine = lattice(64, 37);
  // Grassier country is greener in its light patches; dry country browner.
  const green = biome === "pontic" ? 0.05 : biome === "mediterranean" ? 0.03 : 0;
  let s = 99;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const patch = big(x, y);
      const v = 0.9 + (patch - 0.5) * 0.12 + (mid(x, y) - 0.5) * 0.12 + (fine(x, y) - 0.5) * 0.1;
      // Specks: a dark one is a pebble or the shade in a tuft, a light one a dry stalk.
      const r = random();
      const speck = r < 0.035 ? -0.22 : r > 0.975 ? 0.1 : 0;
      const value = Math.min(1, Math.max(0, v + speck));
      const i = (y * size + x) * 4;
      const tint = (patch - 0.5) * green * 2;
      image.data[i] = Math.round(255 * Math.min(1, value * (1 - tint)));
      image.data[i + 1] = Math.round(255 * Math.min(1, value * (1 + tint)));
      image.data[i + 2] = Math.round(255 * Math.min(1, value * (1 - tint * 1.5) * 0.97));
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * The far skyline: two rings of ridges round the horizon, the nearer darker
 * and sharper, the farther paler — aerial perspective, the blue of the air
 * between the eye and a hill twenty kilometres off. Unit radius, drawn as
 * part of the sky (behind everything, without depth) so it never cuts into
 * the model and always sits the same few degrees over the horizon, the way
 * real far mountains do however the camera moves. Its foot is the fog's own
 * colour, so the terrain's hazy edge runs into it without a seam.
 */
function buildSkyline(THREE: typeof THREE_NS, look: BiomeLook, seed: number) {
  const around = 192;
  const positions: number[] = [];
  const haze: number[] = [];
  const indices: number[] = [];
  const ridgeNoise = noise2(seed);
  const layers = [
    { r: 1, height: 1, haze: 0.5, offset: 0 },
    { r: 0.8, height: 0.6, haze: 0.26, offset: 37 },
  ];
  for (const layer of layers) {
    const base = positions.length / 3;
    for (let i = 0; i <= around; i += 1) {
      const a = (i / around) * Math.PI * 2;
      // Sampled round a circle in the noise, so the ridge closes on itself.
      const nx = Math.cos(a) * 2.2 + layer.offset;
      const nz = Math.sin(a) * 2.2 + layer.offset;
      const soft = ridgeNoise(nx, nz);
      const sharp = 1 - Math.abs(ridgeNoise(nx * 2.7 + 9, nz * 2.7 + 9) * 2 - 1);
      const shape = soft * (1 - look.jagged * 0.6) + sharp * look.jagged * 0.6;
      const h = look.ridge * layer.height * (0.25 + 1.1 * shape * shape) * layer.r;
      const x = Math.cos(a) * layer.r;
      const z = Math.sin(a) * layer.r;
      positions.push(x, -0.3 * layer.r, z, x, h, z);
      haze.push(1, layer.haze);
      if (i < around) {
        const k = base + i * 2;
        indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("haze", new THREE.Float32BufferAttribute(haze, 1));
  geometry.setIndex(indices);
  const uniforms = {
    land: { value: new THREE.Color(look.ridgeColour) },
    /** The fog's colour as it reaches the screen (sRGB), like three.js's own fog uniform. */
    air: { value: new THREE.Color(0xdfe6ec) },
    sunDir: { value: new THREE.Vector3(0, 1, 0) },
    sunLight: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      attribute float haze;
      varying float vHaze;
      varying vec3 vWorldDir;
      varying float vHeight;
      void main() {
        vHaze = haze;
        vWorldDir = normalize(vec3(position.x, 0.0, position.z));
        vHeight = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 land;
      uniform vec3 air;
      uniform vec3 sunDir;
      uniform float sunLight;
      varying float vHaze;
      varying vec3 vWorldDir;
      varying float vHeight;
      void main() {
        // The slopes facing the sun a little brighter, the far side darker.
        vec2 s = normalize(sunDir.xz + vec2(1e-4));
        float facing = -dot(vWorldDir.xz, s);
        vec3 lit = land * (1.0 + sunLight * 0.35 * facing);
        // Thicker haze low down, where the eye looks through more air.
        float h = clamp(vHaze + (1.0 - vHaze) * smoothstep(0.02, -0.06, vHeight), 0.0, 1.0);
        gl_FragColor = vec4(lit, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        // Mixed in after the output transform, as three.js mixes its fog, so
        // the foot of the hills is exactly the fogged terrain's colour.
        gl_FragColor.rgb = mix(gl_FragColor.rgb, air, h);
      }`,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "skyline";
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}
