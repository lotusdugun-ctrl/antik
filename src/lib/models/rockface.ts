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
  /**
   * Where the block stands in the cliff it belongs to: the middle of its foot,
   * as a distance along the cliff and a height. Given, the grain of the rock,
   * its ledges and its joints are laid out in the cliff's own coordinates
   * rather than the block's, so blocks side by side with the same seed carry
   * on one another's rock: one cliff, not a row of separate pillars. The
   * ledges are still given as heights above the block's own foot, and wander
   * up and down as they run along the cliff, as beds of rock do.
   */
  origin?: readonly [number, number];
  /**
   * Stretches up the block's left and right edges (heights above its foot)
   * where a neighbour carries the same rock on: there the face runs straight
   * on into the next block instead of turning back to the block's front.
   */
  open?: readonly [readonly [number, number][], readonly [number, number][]];
  /**
   * How strongly the rock is bedded: layers a metre or two thick, each
   * standing a little out or falling a little back, running a long way across
   * the face — the banding that makes a limestone cliff read as rock.
   */
  strata?: number;
  /**
   * With `origin`: the heights in the cliff over which its top leans out, the
   * same for every block, so the lean does not jump where two blocks meet.
   */
  leanBetween?: readonly [number, number];
  /** The face turns back to the block's front at its foot too: a block hanging free. */
  hung?: boolean;
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

/**
 * Which ledge this is, cliff-wide: its index in the block, or, for a block
 * placed in a cliff, its height in the cliff, so the same ledge keeps its
 * name from one block to the next.
 */
const ledgeKey = (face: RockFace, k: number) =>
  face.origin ? Math.round(face.ledges[k]! + face.origin[1]) : k;

/** Where along a ledge it is really there: ledges run a way and stop. */
export function ledgeAt(face: RockFace, k: number, u: number) {
  const key = ledgeKey(face, k);
  const U = u + (face.origin?.[0] ?? 0);
  return noise(face.seed + 31 * (key + 1), U / 6 + key * 3.7, key) > 0.42;
}

/**
 * The height of ledge `k` at `u` above the block's foot: level on a block of
 * its own, wandering up and down along a cliff.
 */
export function ledgeHeight(face: RockFace, k: number, u: number) {
  const y = face.ledges[k]!;
  if (!face.origin) return y;
  const key = ledgeKey(face, k);
  const U = u + face.origin[0];
  return y + Math.sin(U / 17 + key * 1.9) * 1.1 + (noise(face.seed + key, U / 9, 3) - 0.5) * 1.4;
}

/** How deep a ledge's shelf is, in metres, where it is there. */
export const SHELF = 0.62;

/**
 * The surface at (u, v): u across the face from its middle (-w/2..w/2), v up
 * it from its foot (0..h). Returns how far it stands out, as a share of relief.
 */
export function rockOffset(face: RockFace, w: number, h: number, u: number, v: number) {
  const s = face.seed;
  const U = u + (face.origin?.[0] ?? 0);
  const V = v + (face.origin?.[1] ?? 0);
  let f = 0.15 + 0.3 * fbm(s, U / 7, V / 9);
  if (face.strata) {
    // Beds: long bands up the face, each its own way out or in, and the lip
    // of each bed broken along its length.
    const bed = noise(s + 5, U / 38, V / 1.6);
    const lip = noise(s + 6, U / 9, V / 1.6);
    f += face.strata * ((bed - 0.5) * 0.55 + (lip - 0.5) * 0.3);
  }
  // Ledges: a bulge rising to a flat shelf, then straight back.
  face.ledges.forEach((_, k) => {
    const y = ledgeHeight(face, k, u);
    if (v > y || v < y - 2.6 || !ledgeAt(face, k, u)) return;
    const t = smooth(y - 2.6, y - 0.15, v);
    f = Math.max(f, 0.35 + SHELF * t);
  });
  if (face.origin) {
    // Joints: on a cliff, wherever the cliff puts them — one in most
    // stretches of nine metres, some running the whole height, some dying out.
    const cell = Math.floor(U / 9);
    for (let c = cell - 1; c <= cell + 1; c += 1) {
      if (hash(s, c, 3) < 0.3) continue;
      const from = hash(s, c, 4) < 0.5 ? -1e9 : hash(s, c, 5) * 60;
      if (V < from) continue;
      const x = (c + 0.15 + hash(s, c, 7) * 0.7) * 9 + Math.sin(V / 6 + c) * 0.8;
      const wander = (noise(s + c, V / 4, c) - 0.5) * 1.4;
      const width = 0.3 + hash(s, c, 9) * 0.55;
      f *= 1 - 0.85 * Math.exp(-(((U - x - wander) / width) ** 2));
    }
  } else {
    // Fissures: a few vertical joints, wandering a little as they go up.
    for (let k = 0; k < 3; k += 1) {
      const x0 = (hash(s, k, 7) - 0.5) * w * 0.9;
      const x = x0 + Math.sin(v / 6 + k) * 0.8 + (noise(s + k, v / 4, k) - 0.5) * 1.2;
      const width = 0.35 + hash(s, k, 9) * 0.5;
      f *= 1 - 0.85 * Math.exp(-(((u - x) / width) ** 2));
    }
  }
  // The top of a tall face leans out.
  if (face.overhang) {
    const [a, b] = face.origin && face.leanBetween ? face.leanBetween : [h - 12, h - 1];
    f += face.overhang * smooth(a, b, face.origin && face.leanBetween ? V : v);
  }
  // Back to the block's own front at its edges, so neighbouring blocks meet;
  // not where a neighbour carries the rock straight on.
  const shut = (side: 0 | 1, edge: number) =>
    face.open?.[side].some(([lo, hi]) => v >= lo && v <= hi) ? 1 : smooth(0, 1.2, edge);
  f *= shut(0, u + w / 2) * shut(1, w / 2 - u) * smooth(0, 0.6, h - v + 0.6);
  if (face.hung) f *= smooth(0, 1.6, v);
  return Math.max(0, f);
}

/** How dark the rock is at a point: dark in the joints, light on the shelves. */
export function rockShade(face: RockFace, w: number, h: number, u: number, v: number) {
  const f = rockOffset(face, w, h, u, v);
  const grain = fbm(
    face.seed + 9,
    (u + (face.origin?.[0] ?? 0)) / 2.5,
    (v + (face.origin?.[1] ?? 0)) / 3.5,
  );
  return Math.min(1.15, Math.max(0.45, 0.62 + f * 0.35 + (grain - 0.5) * 0.35));
}
