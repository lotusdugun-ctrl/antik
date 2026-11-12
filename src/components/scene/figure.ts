import type * as THREE_NS from "three";
import type { Action, Carry, Era, Look, Person } from "@/lib/scene-life";

/**
 * The close-up figure: the same person as the plain one in `life.ts`, built
 * again with a face, hands and feet, and clothes that hang in folds — for the
 * few people near enough to the camera for it to show.
 *
 * Everything is still one shared material coloured per vertex, so a border
 * pattern is a run of coloured faces, a pleat is a vertex pushed out of the
 * ring, a sandal strap is a band of leather-coloured faces on the foot. No
 * textures, nothing that costs a draw call.
 *
 * The dress follows the period. A Greek woman's chiton is sleeved, the
 * sleeves pinned along the arm, and girdled so the cloth bags over the belt
 * (the kolpos); her peplos has its overfold (the apoptygma) and a pin at each
 * shoulder. A man's himation goes over the left shoulder, across the back and
 * under the right arm, its end falling down the left side; a toga has its
 * curved front fold (the sinus), the pouch pulled out over it (the umbo), and
 * the purple edge of a magistrate's. Roman tunics carry the two clavi stripes.
 * A Commagenian wears the Persian dress of the Nemrut reliefs: sleeved coat,
 * trousers, soft boots, a cloak. Neolithic hides are fringed.
 *
 * Variation never takes a roll of the die: it is derived from the colours
 * already chosen, so nobody moves when the figures change.
 */

type ThreeModule = typeof import("three");
type Geo = THREE_NS.BufferGeometry;
type V3 = [number, number, number];

/* At one metre tall. */
export const HIP = 0.5;
export const SHOULDER = 0.8;
export const UPPER = 0.17;
export const FORE = 0.15;
export const THIGH = 0.235;
export const SHIN = 0.23;

/** The height of the neck, where the head turns: its pieces hang from here. */
export const NECK = 0.86;

/** Everything done sitting, kneeling or squatting: the legs fold, the skirt with them. */
export const SEATED: ReadonlySet<Action> = new Set<Action>([
  "sit",
  "kneel",
  "ride",
  "pot",
  "write",
  "count",
  "chat",
  "beg",
  "grind",
  "crouch",
]);

/** Seated on something, so a long skirt lies over the lap and falls from the knees. */
export const LAP: ReadonlySet<Action> = new Set<Action>([
  "sit",
  "pot",
  "write",
  "count",
  "chat",
  "beg",
]);

/** What the figure borrows from the plain builder, so both agree. */
export type Kit = {
  paint: (geometry: Geo, hex: number) => Geo;
  carried: (look: Look, action: Person["action"], carry?: Carry, carryLeft?: Carry) => Geo[];
  hairdo: (look: Look) => Geo[];
  headwear: (look: Look) => Geo[];
  handItems: (carry?: Carry, action?: Action, left?: boolean) => Geo[];
  menHair: (look: Look, near: boolean) => Geo[];
  beard: (look: Look, near: boolean) => Geo[];
  accessories: (look: Look, action: Action, near: boolean) => Geo[];
};

const GOLD = 0xc9a43c;
const LEATHER = 0x6b4a30;
const SOLE = 0x4e3624;
const BRONZE = 0xa8843e;
const TAU = Math.PI * 2;
/** The front of a ring, in the angle the lofts use (0 is +x, the left side). */
const FRONT = Math.PI / 2;

/** A deterministic number from a look, for choices that cost no die roll. */
export const lookHash = (look: Look) =>
  ((((look.main * 31) ^ (look.trim * 17) ^ (look.skin * 7) ^ look.hair) * 2654435761) >>> 0) >>> 4;

/**
 * Borders woven or painted on the hem, four rows of faces on a grid four
 * columns wide: a key (meander), a running wave, a line of dots between
 * two lines, or plain double bands. Row 0 is the bottom.
 */
const PATTERNS: ((row: number, col: number) => boolean)[] = [
  // Meander, as simple as a loom's key: a hooked step on a ground line.
  (row, col) =>
    row === 0 ||
    (row === 1 && col === 0) ||
    (row === 2 && col !== 3 && col !== 1) ||
    (row === 3 && col !== 3),
  // A running wave.
  (row, col) => row === 0 || row <= [0, 1, 2, 3][col]!,
  // Dots between lines.
  (row, col) =>
    row === 0 || row === 3 || (row === 2 && col % 2 === 0) || (row === 1 && col % 2 === 0),
  // Double band.
  (row) => row === 0 || row === 2,
];

/** Eras whose borders are plain woven bands rather than Greek patterns. */
const BANDED: ReadonlySet<Era> = new Set([
  "village-neolithic",
  "hittite",
  "bronze-age",
  "medieval",
  "egyptian",
  "mesopotamian",
  "achaemenid",
  "indus",
  "vijayanagara",
  "khmer",
  "andean",
  "chinese",
  "japanese",
]);

export function figureKit(THREE: ThreeModule, kit: Kit, era: Era) {
  const tmp = new THREE.Color();
  const tmp2 = new THREE.Color();
  const mix = (a: number, b: number, t: number) => tmp.set(a).lerp(tmp2.set(b), t).getHex();
  const shade = (hex: number, k: number) => tmp.set(hex).multiplyScalar(k).getHex();
  /**
   * The cloth's woven pattern, face by face (row `k`, column `j`): stripes
   * of the trim colour, a darker check, or a scatter of dots. Only on the
   * main cloth (`on`), never on a border.
   */
  const patterned = (look: Look, cloth: number, k: number, j: number, on = true) => {
    if (!on || !look.pattern) return cloth;
    switch (look.pattern) {
      case "stripes":
        return j % 4 === 0 ? (look.trim === look.main ? shade(cloth, 0.7) : look.trim) : cloth;
      case "checks":
        return (Math.floor(j / 2) + Math.floor(k / 2)) % 2 === 0 ? shade(cloth, 0.78) : cloth;
      case "dots":
        return (j + 2 * k) % 5 === 0 && k % 2 === 0 ? look.trim : cloth;
    }
  };

  /**
   * A skin over rings of vertices, each vertex placed by `vertex(k, j, a)`
   * (ring k, column j at angle a), coloured per face by `colour(k, j)` for
   * the quad from ring k to k + 1. Normals are smooth unless `flat`, which
   * shows sharp pleats as light and shade.
   */
  const loftBy = (
    rings: number,
    around: number,
    vertex: (k: number, j: number, a: number) => V3,
    colour: number | ((k: number, j: number) => number),
    o: { bottom?: boolean; top?: boolean; flat?: boolean } = {},
  ) => {
    const pos: number[] = [];
    for (let k = 0; k < rings; k += 1)
      for (let j = 0; j < around; j += 1) pos.push(...vertex(k, j, (j / around) * TAU));
    const index: number[] = [];
    const quad: number[] = [];
    for (let k = 0; k < rings - 1; k += 1) {
      for (let j = 0; j < around; j += 1) {
        const a = k * around + j;
        const b = k * around + ((j + 1) % around);
        const c = (k + 1) * around + j;
        const d = (k + 1) * around + ((j + 1) % around);
        index.push(a, c, b, b, c, d);
        quad.push(k, j, k, j);
      }
    }
    const centre = (k: number) => {
      let x = 0;
      let y = 0;
      let z = 0;
      for (let j = 0; j < around; j += 1) {
        x += pos[(k * around + j) * 3]!;
        y += pos[(k * around + j) * 3 + 1]!;
        z += pos[(k * around + j) * 3 + 2]!;
      }
      return [x / around, y / around, z / around];
    };
    const rad = new Float32Array(rings * around);
    const vShade = new Float32Array(rings * around + 2);
    vShade.fill(1);
    for (let k = 0; k < rings; k += 1) {
      const [cx, , cz] = centre(k);
      let rMean = 0;
      for (let j = 0; j < around; j += 1) {
        const idx = k * around + j;
        const dx = pos[idx * 3]! - cx!;
        const dz = pos[idx * 3 + 2]! - cz!;
        const r = Math.hypot(dx, dz);
        rad[idx] = r;
        rMean += r;
      }
      rMean /= Math.max(1, around);
      const v = rings > 1 ? k / (rings - 1) : 0.5;
      const vert = 0.94 + 0.08 * v;
      for (let j = 0; j < around; j += 1) {
        const idx = k * around + j;
        const r = rad[idx]!;
        const rPrev = rad[k * around + ((j - 1 + around) % around)]!;
        const rNext = rad[k * around + ((j + 1) % around)]!;
        const rAvg = 0.5 * (rPrev + rNext);
        const rel = rAvg > 1e-4 ? (r - rAvg) / rAvg : 0;
        const wave = rMean > 1e-4 ? (r - rMean) / rMean : 0;
        const foldSignal = Math.max(-0.24, Math.min(0.16, rel * 2.1 + wave * 0.95));
        vShade[idx] = Math.max(0.72, Math.min(1.08, vert * (1 + foldSignal)));
      }
    }
    if (o.bottom) {
      const c = pos.length / 3;
      vShade[c] = 0.88;
      pos.push(...centre(0));
      for (let j = 0; j < around; j += 1) {
        index.push(c, j, (j + 1) % around);
        quad.push(0, j);
      }
    }
    if (o.top) {
      const c = pos.length / 3;
      vShade[c] = 1.03;
      pos.push(...centre(rings - 1));
      const last = (rings - 1) * around;
      for (let j = 0; j < around; j += 1) {
        index.push(c, last + ((j + 1) % around), last + j);
        quad.push(Math.max(0, rings - 2), j);
      }
    }
    const indexed = new THREE.BufferGeometry();
    indexed.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    indexed.setIndex(index);
    indexed.computeVertexNormals();
    const geometry = indexed.toNonIndexed();
    indexed.dispose();
    if (o.flat) {
      const smoothN = (geometry.attributes["normal"]!.array as Float32Array).slice();
      geometry.computeVertexNormals();
      const flatN = geometry.attributes["normal"]!.array as Float32Array;
      for (let i = 0; i < flatN.length; i += 3) {
        const nx = smoothN[i]! * 0.65 + flatN[i]! * 0.35;
        const ny = smoothN[i + 1]! * 0.65 + flatN[i + 1]! * 0.35;
        const nz = smoothN[i + 2]! * 0.65 + flatN[i + 2]! * 0.35;
        const len = Math.hypot(nx, ny, nz) || 1;
        flatN[i] = nx / len;
        flatN[i + 1] = ny / len;
        flatN[i + 2] = nz / len;
      }
    }
    const triangles = index.length / 3;
    const colours = new Float32Array(triangles * 9);
    for (let t = 0; t < triangles; t += 1) {
      tmp.set(typeof colour === "number" ? colour : colour(quad[t * 2]!, quad[t * 2 + 1]!));
      for (let v = 0; v < 3; v += 1) {
        const s = vShade[index[t * 3 + v]!] ?? 1;
        colours[t * 9 + v * 3] = Math.min(1, tmp.r * s);
        colours[t * 9 + v * 3 + 1] = Math.min(1, tmp.g * s);
        colours[t * 9 + v * 3 + 2] = Math.min(1, tmp.b * s);
      }
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    return geometry;
  };

  type Ring = { y: number; x?: number; z?: number; rx: number; rz: number };
  /** A loft over plain ellipses, each vertex pushed out by `fold` (a fraction). */
  const loft = (
    rings: Ring[],
    around: number,
    colour: number | ((k: number, j: number) => number),
    o: {
      fold?: (k: number, j: number, a: number) => number;
      lift?: (k: number, j: number, a: number) => number;
      bottom?: boolean;
      top?: boolean;
      flat?: boolean;
    } = {},
  ) =>
    loftBy(
      rings.length,
      around,
      (k, j, a) => {
        const r = rings[k]!;
        const f = 1 + (o.fold?.(k, j, a) ?? 0);
        return [
          (r.x ?? 0) + Math.cos(a) * r.rx * f,
          r.y + (o.lift?.(k, j, a) ?? 0),
          (r.z ?? 0) + Math.sin(a) * r.rz * f,
        ];
      },
      colour,
      o,
    );

  /** Recolour every face of a geometry by where its middle is. */
  const tint = (geometry: Geo, colour: (x: number, y: number, z: number) => number) => {
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    flat.deleteAttribute("uv");
    const p = flat.attributes["position"]!.array as Float32Array;
    const colours = new Float32Array(p.length);
    for (let t = 0; t < p.length; t += 9) {
      tmp.set(
        colour(
          (p[t]! + p[t + 3]! + p[t + 6]!) / 3,
          (p[t + 1]! + p[t + 4]! + p[t + 7]!) / 3,
          (p[t + 2]! + p[t + 5]! + p[t + 8]!) / 3,
        ),
      );
      for (let v = 0; v < 9; v += 3) {
        colours[t + v] = tmp.r;
        colours[t + v + 1] = tmp.g;
        colours[t + v + 2] = tmp.b;
      }
    }
    flat.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    return flat;
  };

  /** Colour every vertex smoothly by its own position and surface normal. */
  const tintSmooth = (
    geometry: Geo,
    colour: (x: number, y: number, z: number, nx: number, ny: number, nz: number) => number,
  ) => {
    if (!geometry.attributes["normal"]) geometry.computeVertexNormals();
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    flat.deleteAttribute("uv");
    const p = flat.attributes["position"]!.array as Float32Array;
    const n = flat.attributes["normal"]!.array as Float32Array;
    const colours = new Float32Array(p.length);
    for (let v = 0; v < p.length; v += 3) {
      tmp.set(colour(p[v]!, p[v + 1]!, p[v + 2]!, n[v]!, n[v + 1]!, n[v + 2]!));
      colours[v] = tmp.r;
      colours[v + 1] = tmp.g;
      colours[v + 2] = tmp.b;
    }
    flat.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    return flat;
  };

  /** Strand-textured hair and beard colouring with crown sheen and root depth. */
  const tintHair = (geometry: Geo, hex: number) =>
    tintSmooth(geometry, (x, y, z, _nx, ny) => {
      const a = Math.atan2(x, z);
      const strand = Math.sin(a * 22 + y * 58) * 0.5 + Math.cos(a * 11 - y * 34) * 0.5;
      const sheen = Math.max(0, ny) * 0.12 + Math.max(0, (y - 0.88) * 0.9);
      const root = Math.max(0, -ny) * 0.16;
      const k = Math.max(0.72, Math.min(1.16, 0.94 + strand * 0.1 + sheen - root));
      return shade(hex, k);
    });

  const ball = (r: number, at: V3, scale: V3, hex: number, w = 8, h = 6) => {
    const g = new THREE.SphereGeometry(r, w, h);
    g.scale(...scale);
    g.translate(...at);
    return kit.paint(g, hex);
  };
  const pin = (at: V3, hex: number, r = 0.008) =>
    kit.paint(new THREE.OctahedronGeometry(r).translate(...at), hex);

  /* ---------------- the body's shape ---------------- */

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const gauss = (x: number, w: number) => Math.exp(-((x / w) ** 2));
  /** Angular distance, wrapped. */
  const dA = (a: number, b: number) => {
    let d = (((a - b) % TAU) + TAU) % TAU;
    if (d > Math.PI) d -= TAU;
    return d;
  };

  // Height, half-width, half-depth, forward shift: hips, waist, chest, shoulders, neck.
  const TORSO_M: [number, number, number, number][] = [
    [0.47, 0.112, 0.086, 0],
    [0.52, 0.106, 0.082, 0],
    [0.57, 0.098, 0.074, 0],
    [0.62, 0.104, 0.077, 0],
    [0.67, 0.118, 0.085, 0.002],
    [0.695, 0.124, 0.088, 0.004],
    [0.72, 0.128, 0.088, 0.004],
    [0.76, 0.136, 0.084, 0.002],
    [0.79, 0.136, 0.076, 0],
    [0.808, 0.118, 0.066, -0.003],
    [0.824, 0.07, 0.05, -0.004],
    [0.835, 0.036, 0.034, -0.004],
  ];
  const TORSO_F: [number, number, number, number][] = [
    [0.47, 0.122, 0.09, 0],
    [0.52, 0.112, 0.084, 0],
    [0.57, 0.09, 0.07, 0],
    [0.62, 0.096, 0.072, 0],
    [0.67, 0.108, 0.078, 0.002],
    [0.695, 0.112, 0.08, 0.003],
    [0.72, 0.116, 0.08, 0.003],
    [0.76, 0.122, 0.078, 0.002],
    [0.79, 0.124, 0.072, 0],
    [0.808, 0.108, 0.062, -0.003],
    [0.824, 0.064, 0.047, -0.004],
    [0.835, 0.034, 0.032, -0.004],
  ];
  const torsoTable = (female: boolean) => (female ? TORSO_F : TORSO_M);
  /** A point on the body's surface at height y and angle a, above the hips or below. */
  const surface = (female: boolean, y: number, a: number, chest = 0): [number, number] => {
    let rx: number;
    let rz: number;
    let cz = 0;
    if (y < 0.47) {
      // The legs inside a long garment: a cone flaring to the ankles.
      const t = Math.max(0, (0.47 - y) / 0.44);
      rx = lerp(female ? 0.122 : 0.112, 0.152, t ** 0.9);
      rz = lerp(female ? 0.09 : 0.086, 0.122, t ** 0.9);
    } else {
      const T = torsoTable(female);
      let i = 0;
      while (i < T.length - 2 && T[i + 1]![0] < y) i += 1;
      const lo = T[i]!;
      const hi = T[i + 1]!;
      const t = Math.min(1, Math.max(0, (y - lo[0]) / (hi[0] - lo[0])));
      rx = lerp(lo[1], hi[1], t);
      rz = lerp(lo[2], hi[2], t);
      cz = lerp(lo[3], hi[3], t);
    }
    let x = Math.cos(a) * rx;
    let z = Math.sin(a) * rz + cz;
    // The bust, or the chest muscles of a cuirass.
    const swell = female ? 0.022 : chest;
    if (swell > 0 && y > 0.6 && y < 0.78) {
      const k =
        swell *
        gauss(y - (female ? 0.695 : 0.71), female ? 0.035 : 0.04) *
        (gauss(dA(a, FRONT + 0.45), 0.32) + gauss(dA(a, FRONT - 0.45), 0.32));
      const len = Math.hypot(x, z) || 1;
      x += (x / len) * k;
      z += (z / len) * k;
    }
    return [x, z];
  };
  /** The same point pushed `off` further out. */
  const outside = (female: boolean, y: number, a: number, off: number, chest = 0): V3 => {
    const [x, z] = surface(female, y, a, chest);
    const len = Math.hypot(x, z) || 1;
    const s = 1 + off / len;
    return [x * s, y, z * s];
  };

  /** Fine pleats, every other vertex in and out. */
  const pleats = (j: number) => (j % 2 === 0 ? 1 : -1);

  /* ---------------- the head ---------------- */

  const headPieces = (look: Look) => {
    const out: Geo[] = [];
    const masked = look.headwear === "mask";
    const head = new THREE.SphereGeometry(1, 28, 22);
    // Put the seam at the back, so a column of vertices runs down the face.
    head.rotateY(-Math.PI / 2);
    const p = head.attributes["position"]!;
    for (let i = 0; i < p.count; i += 1) {
      const ux = p.getX(i);
      const uy = p.getY(i);
      const uz = p.getZ(i);
      const jaw = uy < 0 ? 1 - 0.23 * (-uy) ** 1.55 : 1;
      let x = ux * 0.056 * jaw;
      const y = uy * 0.066;
      let z = uz * 0.062 * (uz < 0 ? 1.05 : 1) * (uy < 0 ? 1 - 0.05 * -uy : 1);
      if (uz > 0.15 && !masked) {
        const ax = Math.abs(ux);
        // Nose bridge, tip, and nostril wings.
        z += 0.0155 * gauss(ux, 0.125) * gauss(uy + 0.23, 0.14);
        z += 0.0055 * gauss(ux, 0.11) * gauss(uy - 0.04, 0.14);
        z += 0.0038 * gauss(ax - 0.095, 0.055) * gauss(uy + 0.25, 0.065);
        // Brow arch and glabella.
        z += 0.004 * gauss(uy - 0.21, 0.085) * (ax < 0.62 ? 1 : 0);
        // Eye sockets.
        z -= 0.0055 * gauss(ax - 0.37, 0.14) * gauss(uy - 0.02, 0.105);
        // Cheekbones (zygomatic arch).
        z += 0.0036 * gauss(ax - 0.45, 0.18) * gauss(uy + 0.14, 0.14);
        x += Math.sign(ux) * 0.002 * gauss(ax - 0.56, 0.18) * gauss(uy + 0.1, 0.15);
        // Upper & lower lips with parting line and mentolabial hollow.
        const mouthW = gauss(ux, 0.22);
        z += 0.0038 * mouthW * gauss(uy + 0.43, 0.055);
        z += 0.0044 * mouthW * gauss(uy + 0.54, 0.06);
        z -= 0.002 * mouthW * gauss(uy + 0.485, 0.025);
        z -= 0.0022 * gauss(ux, 0.22) * gauss(uy + 0.63, 0.06);
        // Chin.
        z += 0.0065 * gauss(ux, 0.29) * gauss(uy + 0.79, 0.15);
      }
      p.setXYZ(i, x, y + 0.925, z + 0.005);
    }
    head.computeVertexNormals();
    const upperLip = mix(look.skin, 0x743028, look.female ? 0.38 : 0.28);
    const lowerLip = mix(look.skin, 0x944236, look.female ? 0.34 : 0.24);
    const lipCrease = mix(look.skin, 0x3b1713, 0.48);
    const blush = mix(look.skin, 0xc46652, look.female ? 0.18 : 0.11);
    out.push(
      tintSmooth(head, (x, y, z, _nx, ny) => {
        if (masked) return look.skin;
        const cy = y - 0.925;
        const ax = Math.abs(x);
        if (z > 0.038 && ax < 0.0155 && cy < -0.023 && cy > -0.041) {
          if (Math.abs(cy + 0.032) < 0.0022) return lipCrease;
          return cy >= -0.032 ? upperLip : lowerLip;
        }
        let c = look.skin;
        if (z > 0.02) {
          // Warm blush on cheeks and nose tip.
          const cheek = gauss(ax - 0.027, 0.014) * gauss(cy + 0.011, 0.013);
          const noseWarm = gauss(ax, 0.009) * gauss(cy + 0.015, 0.009) * 0.55;
          const w = Math.min(1, cheek + noseWarm);
          if (w > 0.05) c = mix(c, blush, w);
          // Orbital eye-socket shadow.
          const socket = gauss(ax - 0.0205, 0.011) * gauss(cy - 0.001, 0.0085);
          if (socket > 0.05) c = shade(c, 1 - 0.18 * socket);
          // Sub-nose and mentolabial crease shadow.
          const philtrum = gauss(ax, 0.008) * gauss(cy + 0.021, 0.005);
          const subLip = gauss(ax, 0.012) * gauss(cy + 0.043, 0.005);
          if (philtrum + subLip > 0.05) c = shade(c, 1 - 0.13 * Math.min(1, philtrum + subLip));
        }
        // Under-jaw AO and brow/crown warmth.
        if (ny < -0.2) c = shade(c, Math.max(0.82, 1 + (ny + 0.2) * 0.22));
        else if (ny > 0.25 && z > 0.02) c = shade(c, 1 + Math.min(0.06, (ny - 0.25) * 0.09));
        return c;
      }),
    );
    if (!masked) {
      const h = lookHash(look);
      const irisPalette = [0x3b2618, 0x4c3420, 0x2c1d13, 0x4a4228];
      const irisHex = irisPalette[h % irisPalette.length]!;
      const lashHex = mix(look.skin, look.hair, 0.58);
      const browHex = shade(look.hair, 0.86);
      for (const side of [-1, 1]) {
        const ex = side * 0.0208;
        const ey = 0.9262;
        const ez = 0.0558;
        // Sclera (white of the eye, softly shaded at the corners).
        const sclera = new THREE.SphereGeometry(0.0088, 10, 7);
        sclera.scale(1.12, 0.68, 0.46);
        sclera.translate(ex, ey, ez);
        out.push(
          tintSmooth(sclera, (x, y) => {
            const corner = Math.min(1, Math.hypot((x - ex) / 0.009, (y - ey) / 0.006));
            return mix(0xf3ece0, look.skin, 0.28 * corner ** 1.6);
          }),
        );
        // Iris & pupil set slightly forward on the cornea.
        const iris = new THREE.SphereGeometry(0.0054, 10, 7);
        iris.scale(0.92, 0.92, 0.38);
        iris.translate(side * 0.0204, ey, ez + 0.0026);
        out.push(
          tintSmooth(iris, (x, y) => {
            const r = Math.hypot(x - side * 0.0204, y - ey);
            return r < 0.0022 ? 0x0e0a08 : r > 0.0042 ? shade(irisHex, 0.72) : irisHex;
          }),
        );
        // Upper eyelid and lash fold.
        out.push(ball(0.0092, [ex, ey + 0.0023, ez + 0.0005], [1.14, 0.34, 0.48], lashHex, 9, 5));
        // Sculpted eyebrow arch.
        out.push(
          roll(
            [
              [side * 0.0095, 0.9368, 0.0608],
              [side * 0.0205, 0.9388, 0.0595],
              [side * 0.0305, 0.9352, 0.0535],
            ],
            look.female ? 0.0022 : 0.0028,
            browHex,
            false,
            6,
          ),
        );
      }
    }
    // Ears with inner concha depth.
    for (const side of [-1, 1]) {
      const ear = new THREE.SphereGeometry(0.015, 8, 6);
      ear.scale(0.36, 1, 0.68);
      ear.translate(side * 0.054, 0.921, -0.004);
      out.push(
        tintSmooth(ear, (x, _y, z) =>
          Math.abs(x) < 0.0545 && z > -0.006 ? shade(look.skin, 0.84) : look.skin,
        ),
      );
    }
    // Contoured neck with sub-chin shadow.
    out.push(
      loft(
        [
          { y: 0.824, z: -0.004, rx: 0.033, rz: 0.031 },
          { y: 0.855, z: -0.004, rx: 0.028, rz: 0.028 },
          { y: 0.892, z: -0.003, rx: 0.027, rz: 0.027 },
        ],
        14,
        (k) => (k === 1 ? shade(look.skin, 0.86) : look.skin),
      ),
    );
    if (!masked) {
      if (look.bald && !look.female) {
        // Bald on the crown: the hair left round the back and over the ears.
        const fringe = new THREE.SphereGeometry(
          0.0695,
          18,
          6,
          Math.PI * 0.85,
          Math.PI * 1.3,
          Math.PI * 0.36,
          Math.PI * 0.22,
        );
        fringe.scale(0.93, 0.94, 1);
        fringe.rotateX(-0.18);
        fringe.translate(0, 0.925, -0.004);
        out.push(tintHair(fringe, look.hair));
      } else {
        // Hair: a cap from a hairline over the brow to the nape.
        const cap = new THREE.SphereGeometry(0.0695, 24, 10, 0, TAU, 0, Math.PI / 2);
        cap.scale(0.93, look.female ? 1.0 : 0.94, 1);
        cap.rotateX(-0.42);
        cap.translate(0, 0.929, -0.004);
        out.push(tintHair(cap, look.hair));
      }
      if (look.female) {
        if (look.headwear !== "veil") out.push(...kit.hairdo(look));
      } else out.push(...kit.menHair(look, true));
      if (look.beard) out.push(...kit.beard(look, true));
    }
    if (look.headwear === "helmet") out.push(...helmet(look));
    else if (look.headwear === "phrygian") out.push(...phrygian(look));
    else out.push(...kit.headwear(look));
    if (look.female && look.jewels && !masked) {
      for (const side of [-1, 1])
        out.push(ball(0.008, [side * 0.055, 0.898, 0.0], [1, 1.5, 1], GOLD, 5, 4));
      out.push(
        kit.paint(
          new THREE.TorusGeometry(0.039, 0.005, 4, 18)
            .rotateX(Math.PI / 2 - 0.3)
            .translate(0, 0.832, 0.012),
          GOLD,
        ),
      );
    }
    return out;
  };

  /**
   * The soft cap of Commagene and Phrygia, open at the face: a crown that
   * rises and folds forward at the top, and flaps over the ears and nape.
   */
  const phrygian = (look: Look) => {
    const out: Geo[] = [];
    const crown = new THREE.SphereGeometry(0.073, 16, 6, 0, TAU, 0, Math.PI / 2);
    crown.scale(0.95, 1, 1.04);
    crown.rotateX(-0.36);
    crown.translate(0, 0.93, -0.004);
    out.push(kit.paint(crown, look.trim));
    out.push(
      loft(
        [
          { y: 0.975, z: -0.01, rx: 0.058, rz: 0.06 },
          { y: 1.01, z: 0.0, rx: 0.045, rz: 0.046 },
          { y: 1.04, z: 0.02, rx: 0.03, rz: 0.03 },
          { y: 1.055, z: 0.05, rx: 0.017, rz: 0.016 },
          { y: 1.05, z: 0.07, rx: 0.006, rz: 0.006 },
        ],
        10,
        look.trim,
        { top: true },
      ),
    );
    for (const side of [-1, 1])
      out.push(
        kit.paint(
          new THREE.BoxGeometry(0.014, 0.085, 0.042).translate(side * 0.061, 0.878, -0.012),
          look.trim,
        ),
      );
    out.push(
      kit.paint(new THREE.BoxGeometry(0.1, 0.07, 0.014).translate(0, 0.875, -0.066), look.trim),
    );
    return out;
  };

  /** A bronze helmet open at the face: bowl, cheek pieces, neck guard, crest. */
  const helmet = (look: Look) => {
    const out: Geo[] = [];
    const bowl = new THREE.SphereGeometry(0.074, 16, 7, 0, TAU, 0, Math.PI * 0.56);
    bowl.scale(0.95, 0.98, 1.05);
    bowl.rotateX(-0.3);
    bowl.translate(0, 0.932, -0.004);
    out.push(kit.paint(bowl, BRONZE));
    for (const side of [-1, 1]) {
      out.push(
        kit.paint(
          new THREE.BoxGeometry(0.008, 0.06, 0.05)
            .rotateY(side * -0.35)
            .translate(side * 0.058, 0.895, 0.02),
          BRONZE,
        ),
      );
    }
    // The crest: a holder along the top and the horsehair falling behind.
    const curve = new THREE.CatmullRomCurve3(
      [
        [0, 1.0, 0.055],
        [0, 1.05, 0.0],
        [0, 1.03, -0.07],
        [0, 0.96, -0.11],
        [0, 0.88, -0.1],
      ].map((q) => new THREE.Vector3(...(q as V3))),
    );
    const crest = new THREE.TubeGeometry(curve, 14, 0.024, 6, false);
    crest.scale(0.4, 1, 1);
    out.push(kit.paint(crest, look.trim));
    return out;
  };

  /* ---------------- clothing ---------------- */

  /** Colour of a hem border's face, or `null` for the cloth itself. */
  const border = (style: number, k: number, j: number, rows = 4) =>
    k < rows ? (PATTERNS[style]!(k, j % 4) ? true : false) : null;

  /**
   * A skirt from `hem` to the hips: a border woven into the bottom rows, the
   * cloth darkening a little towards the dusty hem, folds that are deepest at
   * the bottom, and a ragged or tabbed edge if `lift` says so.
   */
  const skirt = (
    look: Look,
    hem: number,
    top: number,
    flare: number,
    around: number,
    o: {
      cloth: number;
      edge?: number;
      style?: number;
      rows?: number;
      folds: (j: number, a: number) => number;
      depth: number;
      flat?: boolean;
      lift?: (k: number, j: number) => number;
      colour?: (k: number, j: number, cloth: number) => number;
    },
  ) => {
    const B = 0.011;
    const rows = o.style === undefined ? 1 : (o.rows ?? 4);
    const ys: number[] = [];
    for (let i = 0; i <= rows; i += 1) ys.push(hem + i * B);
    const rest = 4;
    for (let i = 1; i <= rest; i += 1) ys.push(lerp(hem + rows * B, top, i / rest));
    const span = top - hem;
    return loftBy(
      ys.length,
      around,
      (k, j, a) => {
        const y = ys[k]! + (o.lift?.(k, j) ?? 0);
        const t = Math.max(0, Math.min(1, (top - ys[k]!) / span));
        const [x, z] = surface(look.female, Math.max(0.47, y), a);
        const grow = 1 + flare * t ** 1.4 + o.depth * (0.25 + 0.75 * t) * o.folds(j, a);
        return [x * grow, y, z * grow];
      },
      (k, j) => {
        const cloth = patterned(
          look,
          shade(o.cloth, 0.93 + 0.07 * Math.min(1, k / (ys.length - 1) + 0.2)),
          k,
          j,
          o.cloth === look.main,
        );
        if (o.colour) return o.colour(k, j, cloth);
        if (o.style !== undefined && o.edge !== undefined) {
          const b = border(o.style, k, j, rows);
          if (b !== null) return b ? o.edge : cloth;
        } else if (o.edge !== undefined && k === 0) return o.edge;
        return cloth;
      },
      { flat: o.flat ?? false },
    );
  };

  /**
   * A mantle wrapped round the body between two edges that run round it at
   * heights `bottom(a)` and `top(a)`, standing `off` clear of the body, with
   * folds that `fold` describes. Open at both edges, like cloth.
   */
  const wrap = (
    look: Look,
    bottom: (a: number) => number,
    top: (a: number) => number,
    off: number,
    around: number,
    ts: number[],
    fold: (t: number, a: number, j: number) => number,
    colour: (k: number, j: number) => number,
    o: { flat?: boolean; lift?: (k: number, j: number) => number } = {},
  ) =>
    loftBy(
      ts.length,
      around,
      (k, j, a) => {
        const t = ts[k]!;
        const y = lerp(bottom(a), top(a), t) + (o.lift?.(k, j) ?? 0);
        return outside(look.female, y, a, off + fold(t, a, j));
      },
      colour,
      { flat: o.flat ?? false },
    );

  /** A rolled edge round a closed loop of points. */
  const roll = (points: V3[], r: number, hex: number, closed = true, segs = 24) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((q) => new THREE.Vector3(...q)),
      closed,
    );
    return kit.paint(new THREE.TubeGeometry(curve, segs, r, 5, closed), hex);
  };

  /**
   * An open sheet of cloth over a grid of vertices, `vertex(k, j)` for row k
   * and column j, coloured by row. Drawn from both sides, since a fold of
   * cloth is seen from behind as often as from in front.
   */
  const sheetBy = (
    rows: number,
    cols: number,
    vertex: (k: number, j: number) => V3,
    colour: (k: number) => number,
  ) => {
    const pos: number[] = [];
    for (let k = 0; k < rows; k += 1) for (let j = 0; j < cols; j += 1) pos.push(...vertex(k, j));
    const sides: Geo[] = [];
    for (const flip of [false, true]) {
      const index: number[] = [];
      const row: number[] = [];
      for (let k = 0; k < rows - 1; k += 1) {
        for (let j = 0; j < cols - 1; j += 1) {
          const a = k * cols + j;
          const b = a + 1;
          const c = a + cols;
          const d = c + 1;
          if (flip) index.push(a, b, c, b, d, c);
          else index.push(a, c, b, b, c, d);
          row.push(k, k);
        }
      }
      const indexed = new THREE.BufferGeometry();
      indexed.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      indexed.setIndex(index);
      indexed.computeVertexNormals();
      const geometry = indexed.toNonIndexed();
      indexed.dispose();
      const colours = new Float32Array(row.length * 9);
      row.forEach((k, t) => {
        tmp.set(colour(k));
        for (let v = 0; v < 3; v += 1) {
          colours[t * 9 + v * 3] = tmp.r;
          colours[t * 9 + v * 3 + 1] = tmp.g;
          colours[t * 9 + v * 3 + 2] = tmp.b;
        }
      });
      geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
      sides.push(geometry);
    }
    return sides;
  };

  /** A belt, a little clear of whatever it is buckled over. */
  const belt = (look: Look, y: number, off: number, hex: number, h = 0.018) =>
    loftBy(2, 24, (k, _j, a) => outside(look.female, y + (k - 0.5) * h, a, off), hex);

  /** The cloak of a soldier or a Persian, hanging behind from the shoulders. */
  const cloak = (hex: number, bottom: number, wide = 0.16) =>
    loft(
      [
        { y: bottom, z: -0.13, rx: wide + 0.02, rz: 0.035 },
        { y: bottom + 0.012, z: -0.13, rx: wide + 0.02, rz: 0.035 },
        { y: 0.5, z: -0.115, rx: wide + 0.01, rz: 0.035 },
        { y: 0.72, z: -0.095, rx: wide, rz: 0.035 },
        { y: 0.81, z: -0.06, rx: wide - 0.02, rz: 0.03 },
      ],
      16,
      (k) => (k === 0 ? shade(hex, 0.75) : hex),
      { fold: (k, j) => (k < 3 ? 0.08 * Math.cos(j * 1.6) : 0), top: true },
    );

  /** What the body wears, by garment: the static body and the swinging hem. */
  const bodyPieces = (
    look: Look,
    action: Person["action"],
    carry: Carry | undefined,
    carryLeft: Carry | undefined,
    seated: boolean,
  ) => {
    const body: Geo[] = [];
    const hem: Geo[] = [];
    const h = lookHash(look);
    // The Greek key is Greek: earlier and later dress takes plain bands.
    const style = BANDED.has(era) ? 3 : h % PATTERNS.length;
    const g = look.garment;
    const female = look.female;
    const trimEdge = look.trim === look.main ? shade(look.main, 0.62) : look.trim;
    const roman = era === "roman";
    const neckline = 0.805;

    /* The torso, coloured by what covers it. */
    const torsoColour = (y: number, a: number): number => {
      if (y > neckline) return look.skin;
      const plain = torsoPlain(y, a);
      return plain === look.main
        ? patterned(look, plain, Math.round(y * 60), Math.floor((a / TAU) * 24))
        : plain;
    };
    const torsoPlain = (y: number, a: number): number => {
      const x = Math.cos(a);
      switch (g) {
        case "exomis": {
          const s = Math.min(1, Math.max(0, -x * 1.2 - 0.2));
          return y > 0.8 - 0.13 * s ? look.skin : look.main;
        }
        case "hide":
          return female ? look.main : look.skin;
        case "armour":
          return y > 0.5 ? look.main : look.trim;
        case "tunic":
          if (roman && Math.abs(Math.abs(dA(a, FRONT)) - 0.42) < 0.14) return shade(0x6a2f5d, 1);
          if (roman && Math.abs(Math.abs(dA(a, -FRONT)) - 0.42) < 0.14) return shade(0x6a2f5d, 1);
          return look.main;
        case "persian":
          // The coat's edge down the front and a collar of the border colour.
          if (Math.abs(dA(a, FRONT)) < 0.16) return look.trim;
          if (y > 0.78 && Math.abs(dA(a, FRONT)) < 0.9) return look.trim;
          return look.main;
        default:
          return look.main;
      }
    };
    const TT = torsoTable(female);
    const chest = g === "armour" ? 0.012 : 0;
    const torsoColumns = 28;
    body.push(
      loftBy(
        TT.length,
        torsoColumns,
        (k, _j, a) => {
          const y = TT[k]![0];
          const [x, z] = surface(female, y, a, chest);
          const clothed = y <= neckline && g !== "armour" && torsoPlain(y, a) !== look.skin;
          if (!clothed) return [x, y, z];
          // Natural catenary & waist-gathered cloth folds on the upper garment.
          const waistGather = gauss(y - 0.58, 0.09);
          const fold =
            (0.025 + 0.03 * waistGather) *
            (0.65 * Math.cos(a * 10 + (h % 5)) + 0.35 * Math.sin(a * 6 - y * 18));
          const s = 1 + fold;
          return [x * s, y, z * s];
        },
        (k, j) => {
          const a = ((j + 0.5) / torsoColumns) * TAU;
          const midY = (TT[k]![0] + TT[k + 1]![0]) / 2;
          const c = torsoColour(midY, a);
          // Subtle collar rim shadow where the neck meets the garment neckline.
          if (k === TT.length - 3 && c !== look.skin) return shade(c, 0.86);
          return c;
        },
        { bottom: true },
      ),
    );

    const long =
      g === "chiton" || g === "peplos" || g === "himation" || g === "toga" || g === "robe";
    const showSkirt = !seated || !long;
    if (long && LAP.has(action)) {
      // Sitting, the long skirt lies over the lap and falls from the knees.
      const cloth =
        g === "himation" || g === "toga" ? (g === "toga" ? look.main : look.trim) : look.main;
      const lap = loft(
        [
          { y: -0.02, z: -0.5, rx: 0.12, rz: 0.07 },
          { y: 0.1, z: -0.5, rx: 0.13, rz: 0.066 },
          { y: 0.22, z: -0.505, rx: 0.135, rz: 0.062 },
          { y: 0.3, z: -0.49, rx: 0.13, rz: 0.06 },
        ],
        16,
        cloth,
        { fold: (_k, j) => 0.03 * Math.cos(j * 2.1), top: true },
      );
      // Built along y, then turned to lie along +z at the height of the hips.
      lap.rotateX(Math.PI / 2);
      body.push(lap);
      const ys = [0.235, 0.246, 0.257, 0.268, 0.279, 0.38, 0.47];
      body.push(
        loft(
          ys.map((y, k) => ({
            y,
            z: 0.25,
            rx: 0.118 + (6 - k) * 0.004,
            rz: 0.062 + (6 - k) * 0.003,
          })),
          24,
          (k, j) => {
            const b = border(style, k, j);
            return b === null ? cloth : b ? trimEdge : cloth;
          },
          { fold: (k, j) => 0.06 * pleats(j) * (1 - k / 8), flat: true, top: true },
        ),
      );
    }
    const swirl = (n: number) => (j: number, a: number) => Math.cos(a * n + (h % 7));

    /* The skirt, and what is worn over it. */
    switch (g) {
      case "chiton": {
        if (showSkirt)
          hem.push(
            skirt(look, 0.03, HIP + 0.02, 0.36, 32, {
              cloth: look.main,
              edge: trimEdge,
              style,
              folds: pleats,
              depth: 0.045,
              flat: true,
            }),
          );
        // The kolpos: the cloth pulled up through the girdle and bagging over it.
        body.push(
          wrap(
            look,
            () => 0.575,
            () => 0.64,
            0.004,
            24,
            [0, 0.35, 1],
            (t, _a, j) => (t > 0 && t < 1 ? 0.012 + 0.004 * pleats(j) : 0.002),
            () => look.main,
            { flat: true },
          ),
        );
        body.push(belt(look, 0.578, 0.008, shade(trimEdge, 0.8), 0.014));
        if (!female) {
          // A light mantle over the shoulders and down the right side.
          body.push(
            roll(
              [
                [0.13, 0.8, -0.03],
                [0, 0.825, -0.085],
                [-0.13, 0.8, -0.03],
                [-0.155, 0.6, 0.02],
              ],
              0.024,
              look.trim,
              false,
              14,
            ),
          );
        }
        break;
      }
      case "peplos": {
        if (showSkirt)
          hem.push(
            skirt(look, 0.03, HIP + 0.02, 0.4, 32, {
              cloth: look.main,
              folds: swirl(9),
              depth: 0.05,
            }),
          );
        // The overfold, from the shoulders to the hips, with its border.
        const ts = [0, 0.03, 0.06, 0.09, 0.12, 0.4, 0.7, 0.9, 1];
        body.push(
          wrap(
            look,
            () => 0.43,
            () => 0.805,
            0.006,
            28,
            ts,
            (t, a) => (1 - t) ** 2 * (0.03 + 0.012 * Math.cos(a * 7 + (h % 5))),
            (k, j) => {
              const b = border(style, k, j);
              return b === null ? look.main : b ? trimEdge : look.main;
            },
          ),
        );
        body.push(belt(look, 0.6, 0.016, shade(trimEdge, 0.8), 0.016));
        // The pins at the shoulders.
        for (const side of [-1, 1]) body.push(pin([side * 0.075, 0.808, 0.028], GOLD, 0.009));
        break;
      }
      case "robe": {
        if (showSkirt)
          hem.push(
            skirt(look, 0.03, HIP + 0.02, 0.34, 32, {
              cloth: look.main,
              edge: trimEdge,
              style,
              folds: swirl(10),
              depth: 0.035,
            }),
          );
        body.push(belt(look, 0.59, 0.006, shade(trimEdge, 0.8), 0.018));
        // A stole round the neck, both ends falling in front.
        for (const side of [-1, 1])
          body.push(
            loft(
              [
                { y: 0.25, x: side * 0.06, z: 0.112, rx: 0.026, rz: 0.008 },
                { y: 0.55, x: side * 0.068, z: 0.1, rx: 0.025, rz: 0.008 },
                { y: 0.8, x: side * 0.055, z: 0.06, rx: 0.024, rz: 0.008 },
              ],
              6,
              (k) => (k === 0 ? shade(look.trim, 0.8) : look.trim),
              { bottom: true },
            ),
          );
        break;
      }
      case "himation":
      case "toga": {
        const toga = g === "toga";
        const cloth = toga ? look.main : look.trim;
        const praetexta = toga && look.trim !== look.main ? look.trim : null;
        // The tunic or chiton underneath, showing at the feet.
        if (showSkirt)
          hem.push(
            skirt(look, 0.035, HIP + 0.02, 0.32, 28, {
              cloth: toga ? shade(look.main, 0.94) : look.main,
              folds: pleats,
              depth: 0.03,
              flat: true,
            }),
          );
        // Over the left shoulder, across the back, under the right arm and
        // diagonally across the chest: the top edge runs round the body
        // high on the left (+x) and low on the right.
        const top = (a: number) => 0.645 + 0.165 * Math.cos(a);
        const low = seated ? 0.47 : toga ? 0.08 : 0.2;
        const bottom = () => low;
        const ts = [0, 0.025, 0.05, 0.075, 0.1, 0.3, 0.5, 0.7, 0.86, 1];
        const mantleStyle = toga ? 3 : style;
        body.push(
          wrap(
            look,
            bottom,
            top,
            0.016,
            28,
            ts,
            (t, a) =>
              (toga ? 0.018 : 0.013) *
              (0.35 + (1 - t)) *
              (0.5 + 0.5 * Math.sin(a * 6 + t * 7 + (h % 5))),
            (k, j) => {
              const b = toga ? null : border(mantleStyle, k, j);
              if (b !== null) return b ? shade(cloth, 0.62) : cloth;
              return k === 0 ? shade(cloth, 0.9) : cloth;
            },
          ),
        );
        // The rolled upper edge.
        const edge: V3[] = [];
        for (let i = 0; i < 12; i += 1) {
          const a = (i / 12) * TAU;
          edge.push(outside(female, top(a), a, 0.022));
        }
        body.push(roll(edge, toga ? 0.013 : 0.012, praetexta ?? cloth, true, 22));
        // The end thrown over the left shoulder, falling in folds down the side.
        body.push(
          loft(
            [
              { y: seated ? 0.45 : low + 0.06, x: 0.152, rx: 0.046, rz: 0.07 },
              { y: (seated ? 0.45 : low + 0.06) + 0.012, x: 0.152, rx: 0.046, rz: 0.07 },
              { y: 0.5, x: 0.155, rx: 0.042, rz: 0.064 },
              { y: 0.7, x: 0.148, rx: 0.036, rz: 0.058 },
              { y: 0.81, x: 0.13, rx: 0.032, rz: 0.05 },
            ],
            10,
            (k) => (k === 0 ? (praetexta ?? shade(cloth, 0.75)) : cloth),
            {
              fold: (_k, j) => 0.12 * Math.cos(j * 2.4),
              lift: (k, j) => (k === 0 ? -0.025 * Math.abs(Math.sin(j * 0.9)) : 0),
              top: true,
            },
          ),
        );
        if (toga && !seated) {
          // The sinus, the deep fold sweeping across the front to the knee,
          // and the umbo pulled out over the band across the chest.
          /*
           * The sinus is a sheet, not a rope: the cloth hangs from the band
           * that crosses the chest from the left shoulder to the right hip
           * and sags in a deep curve to the knee, bellying out a little and
           * breaking into a few soft folds that deepen towards its edge.
           */
          const ROWS = 7;
          const COLS = 13;
          const sinus = sheetBy(
            ROWS,
            COLS,
            (k, j) => {
              const u = j / (COLS - 1);
              const v = k / (ROWS - 1);
              // Across the body from the left (+x) round to the right side.
              const a = lerp(0.42, 2.55, u);
              const topY = lerp(0.745, 0.5, u);
              const hemY = 0.335 + 0.29 * (u - 0.42) ** 2 * (u < 0.42 ? 2.2 : 1.05);
              const y = lerp(topY, hemY, v ** 0.9);
              const off =
                0.03 +
                0.022 * Math.sin(Math.PI * v) +
                0.012 * v * Math.sin(u * Math.PI * 5 + (h % 3)) +
                0.012 * v;
              return outside(female, y, a, off);
            },
            (k) =>
              k === ROWS - 2 && praetexta
                ? praetexta
                : k === ROWS - 2
                  ? shade(cloth, 0.9)
                  : shade(cloth, 1 - 0.035 * k),
          );
          body.push(...sinus);
          // The umbo: the pouch of cloth pulled up out over the band.
          body.push(ball(0.036, [0.035, 0.66, 0.1], [1.1, 0.6, 0.55], cloth, 8, 6));
        }
        break;
      }
      case "tunic":
      case "exomis": {
        // To the knee, belted, a plain darker band at the hem; Roman tunics
        // carry the clavi down to it.
        const clavus = g === "tunic" && roman ? 0x6a2f5d : null;
        hem.push(
          skirt(look, 0.335, HIP + 0.02, 0.26, 24, {
            cloth: look.main,
            folds: pleats,
            depth: 0.04,
            flat: true,
            colour: (k, j, cloth) => {
              if (k === 0) return shade(look.main, 0.72);
              const a = ((j + 0.5) / 24) * TAU;
              if (
                clavus &&
                (Math.abs(Math.abs(dA(a, FRONT)) - 0.42) < 0.14 ||
                  Math.abs(Math.abs(dA(a, -FRONT)) - 0.42) < 0.14)
              )
                return clavus;
              return cloth;
            },
          }),
        );
        body.push(
          wrap(
            look,
            () => 0.575,
            () => 0.635,
            0.004,
            24,
            [0, 0.4, 1],
            (t, _a, j) => (t > 0 && t < 1 ? 0.01 + 0.004 * pleats(j) : 0.002),
            (_k, j) => {
              const a = ((j + 0.5) / 24) * TAU;
              if (clavus && Math.abs(Math.abs(dA(a, FRONT)) - 0.42) < 0.14) return clavus;
              if (clavus && Math.abs(Math.abs(dA(a, -FRONT)) - 0.42) < 0.14) return clavus;
              return look.main;
            },
            { flat: true },
          ),
        );
        body.push(
          belt(look, 0.578, 0.008, g === "exomis" ? 0x5e4430 : shade(look.trim, 0.65), 0.014),
        );
        break;
      }
      case "persian": {
        // The sleeved coat, to the knee for a man and lower for a woman,
        // bordered, and closed down the front with a band of the trim.
        const coatHem = female ? 0.2 : 0.3;
        hem.push(
          skirt(look, coatHem, HIP + 0.02, 0.32, 28, {
            cloth: look.main,
            edge: look.trim,
            style,
            folds: swirl(7),
            depth: 0.03,
            colour: (k, j, cloth) => {
              const b = border(style, k, j);
              if (b !== null) return b ? look.trim : cloth;
              const a = ((j + 0.5) / 28) * TAU;
              return Math.abs(dA(a, FRONT)) < 0.14 ? look.trim : cloth;
            },
          }),
        );
        body.push(belt(look, 0.578, 0.006, shade(look.trim, 0.7), 0.02));
        body.push(cloak(look.trim, female ? 0.12 : 0.2));
        body.push(pin([0, 0.79, 0.07], GOLD, 0.011));
        break;
      }
      case "armour": {
        // Under the cuirass, the tunic's hem; the leather strips (pteruges)
        // hanging in a fringe from its waist.
        hem.push(
          skirt(look, 0.355, HIP + 0.02, 0.24, 24, {
            cloth: look.trim,
            folds: pleats,
            depth: 0.035,
            flat: true,
          }),
        );
        body.push(
          loftBy(
            4,
            28,
            (k, j, a) => {
              const y = [0.395, 0.43, 0.47, 0.51]![k]! - (k === 0 && j % 2 === 1 ? 0.012 : 0);
              const [x, z] = surface(false, Math.max(0.47, y), a);
              const s = 1.17 - k * 0.04;
              return [x * s, y, z * s];
            },
            (k, j) => (j % 2 === 0 ? (k === 0 ? 0xbcae8a : 0xd8cfb4) : 0x8f7f5c),
            { flat: true },
          ),
        );
        body.push(belt(look, 0.53, 0.012, 0x5e4430, 0.022));
        body.push(cloak(look.trim, 0.16, 0.15));
        break;
      }
      case "hide": {
        // A fringed skin skirt; a man's chest bare under a hide over the left shoulder.
        hem.push(
          skirt(look, female ? 0.28 : 0.34, HIP + 0.02, 0.2, 24, {
            cloth: look.main,
            folds: (j) => Math.cos(j * 1.3),
            depth: 0.03,
            lift: (k, j) => (k === 0 ? (j % 2 ? -0.02 : 0) : 0),
            colour: (k, _j, cloth) => (k === 0 ? shade(cloth, 0.82) : cloth),
          }),
        );
        if (!female) {
          const top = (a: number) => 0.645 + 0.165 * Math.cos(a);
          body.push(
            wrap(
              look,
              (a) => top(a) - 0.15,
              top,
              0.01,
              24,
              [0, 0.15, 0.6, 1],
              (t) => 0.004 * (1 - t),
              (k) => (k === 0 ? shade(look.main, 0.8) : look.main),
              { lift: (k, j) => (k === 0 ? (j % 2 ? -0.02 : 0) : 0) },
            ),
          );
        }
        body.push(belt(look, 0.56, 0.008, look.trim, 0.018));
        // The fox pelt hanging from the belt, as on the central pillars.
        body.push(
          loft(
            [
              { y: 0.28, x: -0.02, z: 0.125, rx: 0.014, rz: 0.012 },
              { y: 0.36, x: -0.015, z: 0.125, rx: 0.03, rz: 0.016 },
              { y: 0.46, x: -0.01, z: 0.118, rx: 0.045, rz: 0.02 },
              { y: 0.56, x: 0, z: 0.11, rx: 0.03, rz: 0.016 },
            ],
            8,
            (k) => (k === 0 ? 0xf0e6d6 : look.trim),
            { bottom: true, top: true },
          ),
        );
        break;
      }
      default:
        break;
    }

    if (g === "armour") {
      // Shoulder guards of the cuirass.
      for (const side of [-1, 1])
        body.push(ball(0.05, [side * 0.1, 0.792, 0], [1.05, 0.35, 1.1], look.main, 10, 5));
    }
    const head = headPieces(look);
    body.push(...kit.accessories(look, action, true));
    body.push(...kit.carried(look, action, carry, carryLeft));
    return { body, hem, head };
  };

  /* ---------------- limbs ---------------- */

  /** One arm, hanging from the shoulder: the upper arm and the forearm with its hand. */
  const armPieces = (look: Look, side: -1 | 1, carry: Carry | undefined, action?: Action) => {
    const g = look.garment;
    const left = side > 0;
    // How far down the upper arm the cloth comes: 0 bare, 1 to the shoulder
    // cap, 2 a short sleeve, 4 to the elbow.
    let rows = 0;
    let cloth = look.main;
    switch (g) {
      case "chiton":
      case "robe":
      case "persian":
        rows = 4;
        break;
      case "tunic":
        rows = 2;
        break;
      case "armour":
        rows = 2;
        cloth = look.trim;
        break;
      case "himation":
        rows = left ? 4 : 2;
        cloth = left ? look.trim : look.main;
        break;
      case "toga":
        rows = left ? 4 : 2;
        break;
      case "exomis":
        rows = left ? 1 : 0;
        break;
      case "hide":
        rows = look.female ? 2 : 0;
        break;
      default:
        rows = 0;
    }
    const upper: Geo[] = [
      loft(
        [
          { y: 0.016, rx: 0.022, rz: 0.024 },
          { y: -0.002, rx: 0.038, rz: 0.04 },
          { y: -0.04, rx: 0.037, rz: 0.035 },
          { y: -0.11, rx: 0.03, rz: 0.029 },
          { y: -UPPER, rx: 0.027, rz: 0.027 },
        ],
        14,
        (k) => (k < rows ? cloth : look.skin),
        {
          fold: (k, _j, a) =>
            k < rows ? 0.04 + 0.03 * Math.cos(a * 4 + side) : 0.015 * Math.cos(a * 2),
          top: true,
          bottom: true,
        },
      ),
    ];
    if (g === "chiton" && look.female) {
      // The Ionic sleeve: loose, flaring, pinned along the top of the arm.
      /*
       * Fitted over the round of the shoulder where it is pinned, and
       * widening as it falls, its hem dipping behind: a smooth taper from
       * the shoulder cap rather than a cylinder stood on it, with the folds
       * growing from nothing at the pins to their deepest at the hem.
       */
      const ys = [-0.122, -0.112, -0.085, -0.05, -0.015, 0.008, 0.022, 0.03];
      const radii: [number, number][] = [
        [0.055, 0.052],
        [0.054, 0.051],
        [0.05, 0.048],
        [0.045, 0.044],
        [0.04, 0.04],
        [0.033, 0.034],
        [0.022, 0.024],
        [0.008, 0.009],
      ];
      const hemEdge = look.trim === look.main ? shade(look.main, 0.7) : look.trim;
      upper.push(
        loftBy(
          ys.length,
          14,
          (k, _j, a) => {
            const [rx, rz] = radii[k]!;
            const fall = Math.max(0, 1 - (ys[k]! + 0.12) / 0.13);
            const f = 1 + 0.075 * fall * Math.cos(a * 4 + side);
            // The hem hangs lower at the back of the arm than at the front.
            const dip = k < 2 ? -0.022 * Math.max(0, -Math.sin(a)) : 0;
            return [
              side * 0.002 * fall - side * 0.008 * (1 - fall) + Math.cos(a) * rx * f,
              ys[k]! + dip,
              Math.sin(a) * rz * f,
            ];
          },
          (k) => (k === 0 ? hemEdge : look.main),
          { top: true },
        ),
      );
      for (const y of [0.0, -0.035, -0.07]) upper.push(pin([side * 0.044, y, 0], GOLD, 0.006));
    }
    // Forearm, sculpted palm, four articulated fingers and thumb.
    const sleeve = g === "persian" ? 2 : g === "robe" || (g === "toga" && left) ? 1 : 0;
    const palmShade = shade(look.skin, 0.91);
    const knuckleHighlight = shade(look.skin, 1.04);
    const fore: Geo[] = [
      loft(
        [
          { y: 0, rx: 0.028, rz: 0.028 },
          { y: -0.05, rx: 0.026, rz: 0.025 },
          { y: -0.125, rx: 0.019, rz: 0.017 },
          { y: -0.145, rx: 0.015, rz: 0.016, z: 0.001 },
          { y: -0.164, rx: 0.0115, rz: 0.022, z: 0.003 },
          { y: -0.181, rx: 0.0105, rz: 0.021, z: 0.004 },
        ],
        14,
        (k, j) => {
          if (k < sleeve) return look.main;
          if (k === sleeve && g === "persian") return look.trim;
          if (k >= 4) {
            const a = ((j + 0.5) / 14) * TAU;
            return Math.cos(a) * side > 0.2 ? knuckleHighlight : palmShade;
          }
          return look.skin;
        },
        {
          fold: (k, _j, a) => (k < sleeve ? 0.045 * (1 + 0.4 * Math.cos(a * 4)) : 0),
          top: true,
          bottom: true,
        },
      ),
    ];
    // Four fingers (index, middle, ring, little) slightly curled inward toward the palm.
    const fingerSpecs: readonly [zOff: number, len: number, r: number, curl: number][] = [
      [0.0165, 0.035, 0.0044, 0.16],
      [0.0065, 0.039, 0.0046, 0.19],
      [-0.0035, 0.036, 0.0044, 0.22],
      [-0.0125, 0.029, 0.0039, 0.25],
    ];
    for (let f = 0; f < fingerSpecs.length; f += 1) {
      const [zOff, len, r, curl] = fingerSpecs[f]!;
      const fingerHex = f % 2 === 1 ? shade(look.skin, 0.95) : look.skin;
      fore.push(
        loft(
          [
            { y: -0.179, x: 0, z: zOff, rx: r, rz: r * 1.05 },
            {
              y: -0.179 - len * 0.52,
              x: -side * len * curl * 0.35,
              z: zOff + 0.002,
              rx: r * 0.88,
              rz: r * 0.92,
            },
            {
              y: -0.179 - len,
              x: -side * len * curl,
              z: zOff + 0.0045,
              rx: r * 0.65,
              rz: r * 0.7,
            },
          ],
          6,
          (k) => (k === 1 ? shade(fingerHex, 0.94) : fingerHex),
          { bottom: true },
        ),
      );
    }
    // Sculpted two-segment thumb opposing the palm.
    fore.push(
      loft(
        [
          { y: -0.153, x: -side * 0.002, z: 0.015, rx: 0.0068, rz: 0.0072 },
          { y: -0.168, x: -side * 0.004, z: 0.023, rx: 0.0056, rz: 0.006 },
          { y: -0.183, x: -side * 0.006, z: 0.027, rx: 0.0042, rz: 0.0045 },
        ],
        6,
        look.skin,
        { bottom: true, top: true },
      ),
    );
    fore.push(...kit.handItems(carry, action, side > 0));
    return { upper, fore };
  };

  /** One leg from the hip, with the foot and what is on it. */
  const legPieces = (look: Look, robedSeated: boolean, feetOnly: boolean) => {
    const g = look.garment;
    const trousers = g === "persian";
    const legCloth = trousers ? shade(look.main, 0.72) : robedSeated ? look.main : look.skin;
    // The Hittites wore shoes with the toe turned up; the Neolithic went barefoot.
    const upturned = era === "hittite";
    const shoe: "sandal" | "boot" | "shoe" | "bare" =
      era === "village-neolithic" || g === "hide"
        ? "bare"
        : g === "persian"
          ? "boot"
          : g === "toga" || upturned
            ? "shoe"
            : "sandal";
    const shoeHex = upturned
      ? 0x6a4630
      : g === "toga"
        ? look.trim !== look.main
          ? 0x6a2a22
          : 0x3a2a20
        : 0x4a3426;
    const greaves = g === "armour";
    const thigh: Geo[] = feetOnly
      ? []
      : [
          loft(
            [
              { y: 0.04, rx: 0.056, rz: 0.058 },
              { y: -0.06, rx: 0.055, rz: 0.058 },
              { y: -0.16, rx: 0.045, rz: 0.047 },
              { y: -THIGH, rx: 0.037, rz: 0.039 },
            ],
            14,
            legCloth,
            {
              fold: (k, _j, a) => (trousers ? 0.055 * Math.cos(a * 5 + k * 1.3) : 0),
              bottom: true,
            },
          ),
        ];
    const shin: Geo[] = [];
    if (!feetOnly) {
      shin.push(
        loft(
          [
            { y: 0.015, rx: 0.035, rz: 0.035 },
            { y: -0.055, rx: 0.036, rz: 0.039, z: -0.008 },
            { y: -0.14, rx: 0.027, rz: 0.028 },
            { y: -0.2, rx: 0.021, rz: 0.022 },
            { y: -SHIN - 0.002, rx: 0.02, rz: 0.021 },
          ],
          14,
          (k) => {
            if (greaves && k < 3) return BRONZE;
            if (shoe === "boot" && k >= 2) return 0x4a3426;
            if (shoe === "shoe" && k === 3) return shoeHex;
            if (shoe === "sandal" && k === 3) return LEATHER;
            return legCloth;
          },
          {
            fold: (k, _j, a) => (trousers && k < 2 ? 0.06 * Math.cos(a * 5 + k * 1.5) : 0),
            top: true,
          },
        ),
      );
    }
    // The foot, lofted heel to toe and turned to lie along +z.
    const foot = loft(
      [
        { y: -0.036, z: 0.016, rx: 0.016, rz: 0.012 },
        { y: -0.025, z: 0.012, rx: 0.021, rz: 0.016 },
        { y: 0, z: 0.006, rx: 0.024, rz: 0.022 },
        { y: 0.04, z: 0.016, rx: 0.028, rz: 0.012 },
        { y: 0.075, z: 0.021, rx: 0.029, rz: 0.007 },
        { y: 0.095, z: 0.023, rx: 0.022, rz: 0.005 },
        { y: 0.106, z: 0.024, rx: 0.007, rz: 0.003 },
      ],
      14,
      (k, j) => {
        if (shoe === "boot") return 0x4a3426;
        if (shoe === "shoe") return shoeHex;
        if (shoe === "bare") {
          return k >= 4 && j % 2 === 0 ? shade(look.skin, 0.92) : look.skin;
        }
        // Sandal straps: round the heel and ankle, across the instep, and
        // the thong between the toes.
        const upperSide = j >= 4;
        if (k === 1) return LEATHER;
        if (k === 3 && upperSide) return LEATHER;
        if (k === 4 && (j === 5 || j === 6)) return LEATHER;
        return k >= 4 && j % 2 === 0 ? shade(look.skin, 0.93) : look.skin;
      },
      { top: true, bottom: true },
    );
    foot.rotateX(Math.PI / 2);
    foot.translate(0, -SHIN, 0);
    shin.push(foot);
    if (upturned) {
      // The point of the shoe, carried on past the toes and curled up.
      const tip = loft(
        [
          { y: 0.09, z: 0.022, rx: 0.02, rz: 0.008 },
          { y: 0.115, z: 0.016, rx: 0.012, rz: 0.007 },
          { y: 0.132, z: 0.0, rx: 0.007, rz: 0.006 },
          { y: 0.138, z: -0.02, rx: 0.003, rz: 0.003 },
        ],
        6,
        shoeHex,
        { top: true },
      );
      tip.rotateX(Math.PI / 2);
      tip.translate(0, -SHIN, 0);
      shin.push(tip);
    }
    if (shoe !== "bare")
      shin.push(
        kit.paint(
          new THREE.BoxGeometry(0.06, 0.007, 0.152).translate(0, -SHIN - 0.0315, 0.033),
          shoe === "sandal" ? SOLE : shade(shoeHex, 0.7),
        ),
      );
    return { thigh, shin };
  };

  return { bodyPieces, armPieces, legPieces };
}
