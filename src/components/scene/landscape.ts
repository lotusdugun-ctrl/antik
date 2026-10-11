import type * as THREE_NS from "three";

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
 * `biome` is the one thing that is chosen per site, because getting it wrong
 * would be a claim: olive and cypress belong on the Aegean coast, not on the
 * Harran plain round Göbeklitepe or on Nemrut's bare summit.
 */
export type Biome = "mediterranean" | "steppe" | "mountain";

type Options = {
  centre: THREE_NS.Vector3;
  span: number;
  /** The level the building stands on. */
  groundY: number;
  /** Half the footprint's diagonal: nothing grows or rises inside it. */
  footprint: number;
  biome: Biome;
};

/** Deterministic, so a page reload grows the same trees in the same places. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise on a lattice; cheap and good enough for hills. */
function noise2(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const fade = (t: number) => t * t * (3 - 2 * t);
  const at = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (x: number, y: number) =>
    at(x, y) * 0.55 + at(x * 2.1, y * 2.1) * 0.28 + at(x * 4.3, y * 4.3) * 0.17;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function buildLandscape(THREE: typeof THREE_NS, options: Options) {
  const { centre, span, groundY, footprint, biome } = options;
  const random = rng(Math.round(span * 1000));
  const hills = noise2(7);
  const tint = noise2(19);
  const group = new THREE.Group();
  group.name = "landscape";
  const owned: { dispose: () => void }[] = [];

  /* ---- the ground ---- */

  const size = span * 11;
  const relief = biome === "mountain" ? 0.75 : biome === "steppe" ? 0.18 : 0.42;
  const clear = footprint * 1.25;
  const heightAt = (x: number, z: number) => {
    const dx = x - centre.x;
    const dz = z - centre.z;
    const d = Math.hypot(dx, dz);
    const rise = smooth(clear, clear + span * 1.1, d);
    const far = smooth(span * 2.2, span * 5, d);
    const n = hills(dx / (span * 1.3), dz / (span * 1.3));
    return -0.12 + rise * (n * span * relief * 0.55 + far * span * relief);
  };

  const terrain = new THREE.PlaneGeometry(size, size, 180, 180);
  terrain.rotateX(-Math.PI / 2);
  const position = terrain.attributes["position"] as THREE_NS.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const palette =
    biome === "mediterranean"
      ? [0x9b8e5c, 0x7a7d46, 0xa38866]
      : biome === "steppe"
        ? [0xb59f6e, 0xa69060, 0xc0aa7c]
        : [0x8f8478, 0x7c7266, 0xa49a8c];
  const swatch = palette.map((hex) => new THREE.Color(hex));
  const mix = new THREE.Color();
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i) + centre.x;
    const z = position.getZ(i) + centre.z;
    position.setXYZ(i, x, groundY + heightAt(x, z), z);
    const t = tint(x / (span * 0.6), z / (span * 0.6));
    mix.copy(swatch[0]!).lerp(swatch[1]!, smooth(0.35, 0.65, t));
    mix.lerp(swatch[2]!, smooth(0.55, 0.9, tint(z / (span * 0.25), x / (span * 0.25))) * 0.6);
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

  if (biome !== "mountain") {
    const inner = clear * 1.05;
    const outer = span * 2.8;
    const area = Math.PI * (outer * outer - inner * inner);
    const budget = biome === "steppe" ? 0.25 : 1;
    const count = Math.min(700, Math.round((area / 900) * budget));
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const place = (minR = inner) => {
      // Trees cluster: accept a spot more readily where the noise is high.
      for (let tries = 0; tries < 12; tries += 1) {
        const a = random() * Math.PI * 2;
        const r = Math.sqrt(minR * minR + random() * (outer * outer - minR * minR));
        const x = centre.x + Math.cos(a) * r;
        const z = centre.z + Math.sin(a) * r;
        // Thinning with distance keeps the far hills from reading as a wall
        // of trees floating in the haze.
        const thin = (r - minR) / (outer - minR);
        if (
          random() > thin * 0.75 &&
          tint(x / (span * 0.4) + 3, z / (span * 0.4)) > 0.38 + random() * 0.3
        ) {
          return new THREE.Vector3(x, groundY + heightAt(x, z), z);
        }
      }
      return null;
    };

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
    const cypressMaterial = new THREE.MeshStandardMaterial({ color: 0x334a2a, roughness: 0.95 });
    // Olive (coast) or poplar-like scrub (steppe): a lumpy crown on a short trunk.
    const crown = new THREE.IcosahedronGeometry(1, 1);
    const crownPos = crown.attributes["position"] as THREE_NS.BufferAttribute;
    for (let i = 0; i < crownPos.count; i += 1) {
      const k = 0.82 + random() * 0.32;
      crownPos.setXYZ(i, crownPos.getX(i) * k, crownPos.getY(i) * k * 0.72, crownPos.getZ(i) * k);
    }
    crown.computeVertexNormals();
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: biome === "steppe" ? 0x6f7442 : 0x6d7a4f,
      roughness: 0.92,
      flatShading: true,
    });
    const trunk = new THREE.CylinderGeometry(0.12, 0.2, 1, 6);
    trunk.translate(0, 0.5, 0);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 1 });
    owned.push(spindle, cypressMaterial, crown, crownMaterial, trunk, trunkMaterial);

    const cypressCount = biome === "steppe" ? 0 : Math.round(count * 0.3);
    const crownCount = count - cypressCount;
    const cypresses = new THREE.InstancedMesh(spindle, cypressMaterial, Math.max(1, cypressCount));
    const crowns = new THREE.InstancedMesh(crown, crownMaterial, Math.max(1, crownCount));
    const trunks = new THREE.InstancedMesh(trunk, trunkMaterial, Math.max(1, crownCount));
    let placed = 0;
    for (let i = 0; i < cypressCount; i += 1) {
      const at = place();
      if (!at) continue;
      const h = 10 + random() * 6;
      const w = h * (0.13 + random() * 0.05);
      quaternion.setFromAxisAngle(up, random() * Math.PI * 2);
      matrix.compose(at.setY(at.y - 0.3), quaternion, new THREE.Vector3(w, h, w));
      cypresses.setMatrixAt(placed, matrix);
      placed += 1;
    }
    cypresses.count = placed;
    placed = 0;
    for (let i = 0; i < crownCount; i += 1) {
      const at = place();
      if (!at) continue;
      const h = biome === "steppe" ? 3 + random() * 3 : 4 + random() * 3;
      const w = h * (0.55 + random() * 0.25);
      const trunkH = h * 0.38;
      quaternion.setFromAxisAngle(up, random() * Math.PI * 2);
      matrix.compose(at.clone().setY(at.y - 0.1), quaternion, new THREE.Vector3(1.2, trunkH, 1.2));
      trunks.setMatrixAt(placed, matrix);
      matrix.compose(
        at.clone().setY(at.y + trunkH + h * 0.25),
        quaternion,
        new THREE.Vector3(w, h * 0.55, w),
      );
      crowns.setMatrixAt(placed, matrix);
      placed += 1;
    }
    crowns.count = placed;
    trunks.count = placed;
    for (const mesh of [cypresses, crowns, trunks]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  }

  /* ---- scattered rock, the one thing every biome has ---- */

  const rock = new THREE.DodecahedronGeometry(1, 0);
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: biome === "mountain" ? 0x8a8076 : 0x9c9284,
    roughness: 1,
    flatShading: true,
  });
  owned.push(rock, rockMaterial);
  const rockCount = biome === "mountain" ? 260 : 90;
  const rocks = new THREE.InstancedMesh(rock, rockMaterial, rockCount);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let rocksPlaced = 0;
  for (let i = 0; i < rockCount; i += 1) {
    const a = random() * Math.PI * 2;
    const r = clear * 1.3 + random() * span * 2.5;
    const x = centre.x + Math.cos(a) * r;
    const z = centre.z + Math.sin(a) * r;
    const s = (0.3 + random() * 0.8) * (biome === "mountain" ? 1.8 : 1);
    q.setFromEuler(new THREE.Euler(random() * 3, random() * 3, random() * 3));
    m.compose(
      new THREE.Vector3(x, groundY + heightAt(x, z) - s * 0.3, z),
      q,
      new THREE.Vector3(s, s * (0.65 + random() * 0.35), s * (0.75 + random() * 0.4)),
    );
    rocks.setMatrixAt(rocksPlaced, m);
    rocksPlaced += 1;
  }
  rocks.count = rocksPlaced;
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  group.add(rocks);

  return {
    group,
    dispose: () => owned.forEach((item) => item.dispose()),
  };
}
