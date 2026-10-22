/**
 * A rock face: how far the surface of a cliff stands out at each point of a
 * block's front, as a share (0..about 1.3) of the block's `relief`.
 *
 * Shared by the model, which needs to know where the ledges are to set the
 * tufts of grass and the little trees on them, and by the renderer, which
 * pushes the front of the block out by it. Weathered rock is a few things
 * at once, so the surface is too: an uneven, lumpy base; ledges that run a
 * way along the face and stop, each a shelf with a flat top; vertical
 * fissures, the joints the rock splits along; and the top of a tall face
 * leaning out over everything below it.
 */
export type RockFace = {
  /** Metres: how far the most prominent rock stands out of the block's front. */
  relief: number;
  seed: number;
  /** Heights of the ledges above the block's foot, in metres. */
  ledges: readonly number[];
  /** How far the top of the face leans out, as a share of `relief`. */
  overhang?: number;
};

function hash(seed: number, x: number, y: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth value noise, 0..1. */
function noise(seed: number, x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(seed, xi, yi);
  const b = hash(seed, xi + 1, yi);
  const c = hash(seed, xi, yi + 1);
  const d = hash(seed, xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

const fbm = (seed: number, x: number, y: number) =>
  noise(seed, x, y) * 0.55 +
  noise(seed + 1, x * 2.3, y * 2.3) * 0.3 +
  noise(seed + 2, x * 5.1, y * 5.1) * 0.15;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Where along a ledge it is really there: ledges run a way and stop. */
export function ledgeAt(face: RockFace, k: number, u: number) {
  return noise(face.seed + 31 * (k + 1), u / 6 + k * 3.7, k) > 0.42;
}

/** How deep a ledge's shelf is, in metres, where it is there. */
export const SHELF = 0.62;

/**
 * The surface at (u, v): u across the face from its middle (-w/2..w/2), v up
 * it from its foot (0..h). Returns how far it stands out, as a share of relief.
 */
export function rockOffset(face: RockFace, w: number, h: number, u: number, v: number) {
  const s = face.seed;
  let f = 0.15 + 0.3 * fbm(s, u / 7, v / 9);
  // Ledges: a bulge rising to a flat shelf, then straight back.
  face.ledges.forEach((y, k) => {
    if (v > y || v < y - 2.6 || !ledgeAt(face, k, u)) return;
    const t = smooth(y - 2.6, y - 0.15, v);
    f = Math.max(f, 0.35 + SHELF * t);
  });
  // Fissures: a few vertical joints, wandering a little as they go up.
  for (let k = 0; k < 3; k += 1) {
    const x0 = (hash(s, k, 7) - 0.5) * w * 0.9;
    const x = x0 + Math.sin(v / 6 + k) * 0.8 + (noise(s + k, v / 4, k) - 0.5) * 1.2;
    const width = 0.35 + hash(s, k, 9) * 0.5;
    f *= 1 - 0.85 * Math.exp(-(((u - x) / width) ** 2));
  }
  // The top of a tall face leans out.
  if (face.overhang) f += face.overhang * smooth(h - 12, h - 1, v);
  // Back to the block's own front at its edges, so neighbouring blocks meet.
  const edge = Math.min(u + w / 2, w / 2 - u);
  f *= smooth(0, 1.2, edge) * smooth(0, 0.6, h - v + 0.6);
  return Math.max(0, f);
}

/** How dark the rock is at a point: dark in the joints, light on the shelves. */
export function rockShade(face: RockFace, w: number, h: number, u: number, v: number) {
  const f = rockOffset(face, w, h, u, v);
  const grain = fbm(face.seed + 9, u / 2.5, v / 3.5);
  return Math.min(1.15, Math.max(0.45, 0.62 + f * 0.35 + (grain - 0.5) * 0.35));
}
