import type * as THREE_NS from "three";
import { planLandscape, smooth, type Biome } from "@/lib/landscape-plan";
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
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i) + centre.x;
    const z = position.getZ(i) + centre.z;
    const y = heightAt(x, z);
    position.setXYZ(i, x, y, z);
    const t = tint(x / (span * 0.6), z / (span * 0.6));
    mix.copy(swatch[0]!).lerp(swatch[1]!, smooth(0.35, 0.65, t));
    mix.lerp(swatch[2]!, smooth(0.55, 0.9, tint(z / (span * 0.25), x / (span * 0.25))) * 0.6);
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
  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 0,
  });
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
      8,
    );
    const mesh = instanced(
      spindle,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 }),
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
    const crown = new THREE.IcosahedronGeometry(1, 1);
    const crownPos = crown.attributes["position"] as THREE_NS.BufferAttribute;
    let k = 0.37;
    for (let i = 0; i < crownPos.count; i += 1) {
      k = (k * 9301 + 0.49297) % 1;
      const s = 0.82 + k * 0.32;
      crownPos.setXYZ(i, crownPos.getX(i) * s, crownPos.getY(i) * s * 0.72, crownPos.getZ(i) * s);
    }
    crown.computeVertexNormals();
    const mesh = instanced(
      crown,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, flatShading: true }),
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
      7,
    );
    const mesh = instanced(
      cone,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }),
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

  return {
    group,
    /** The ground's own material, for the light of the hour to tint. */
    terrain: terrainMaterial,
    dispose: () => owned.forEach((item) => item.dispose()),
  };
}
