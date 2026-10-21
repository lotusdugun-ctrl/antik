/**
 * Telling a weak phone from a capable one, so the 3D view can draw less on
 * the first and keep its frame rate.
 *
 * Two kinds of evidence. Before anything is drawn: what the browser says
 * about the device (memory, cores, the GPU's name, a coarse pointer). After
 * the first seconds: how long frames actually took — the only measure that
 * cannot be wrong about the model in front of it, which matters for the
 * Halicarnassus Mausoleum, several times heavier than a tomb its size.
 */

export type DeviceHints = {
  /** `navigator.deviceMemory`, GB (Chrome rounds down to 0.25..8). */
  memory?: number | undefined;
  /** `navigator.hardwareConcurrency`. */
  cores?: number | undefined;
  /** The unmasked WebGL renderer string, when the browser gives it. */
  gpu?: string | undefined;
  /** A touch screen is the main pointer. */
  touch: boolean;
  /** Device pixel ratio. */
  dpr?: number | undefined;
};

/** GPUs that struggle with this scene: old or entry-level mobile parts, and software renderers. */
const WEAK_GPU =
  /(adreno \(tm\) (3\d\d|4\d\d|50\d|51\d|60\d|61\d)|adreno (3\d\d|4\d\d|50\d|51\d|60\d|61\d)|mali-(4\d\d|t\d+|g3\d|g5[12])|powervr (sgx|rogue ge)|swiftshader|llvmpipe|software|intel\(r\) hd graphics [2-5]\d{3}|apple a(8|9|10)\b)/i;

/**
 * A first guess, before any frame is drawn: "low" when the device says it is
 * small or its GPU is one of the weak ones, "high" for a desktop with room to
 * spare, "mid" otherwise. Unknowns count as capable — most browsers that hide
 * the numbers are Safari on recent hardware.
 */
export function assessDevice(hints: DeviceHints): "low" | "mid" | "high" {
  const memory = hints.memory ?? 8;
  const cores = hints.cores ?? 8;
  if (hints.gpu && WEAK_GPU.test(hints.gpu)) return "low";
  if (memory <= 2) return "low";
  if (hints.touch && (cores <= 4 || memory <= 3)) return "low";
  if (!hints.touch && cores >= 6 && memory >= 4) return "high";
  return "mid";
}

/**
 * The verdict from measured frames (milliseconds each, the first second or
 * so left out as the scene warms up): too slow when the median frame takes
 * longer than the budget — 45 ms, about 22 frames a second, or 38 ms for a
 * model known to be heavy, where the next view in will be slower still.
 */
export function framesTooSlow(samples: number[], heavy = false): boolean {
  const usable = samples.filter((ms) => Number.isFinite(ms) && ms > 0 && ms < 2000);
  if (usable.length < 20) return false;
  const sorted = [...usable].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  return median > (heavy ? 38 : 45);
}

/** What the low setting changes, so the renderer and the tests agree. */
export const LOW_SETTINGS = {
  /** Cap on the device pixel ratio. */
  pixelRatio: 1,
  /** People drawn in full detail only this close, in metres (normally 24). */
  peopleDetail: 12,
  /** Scans further than this are hidden, as a share of the model's span. */
  scanReach: 0.6,
  shadows: false,
  effects: false,
} as const;

/** Whether a model is heavy enough that low-end devices should be stricter. */
export function isHeavy(triangles: number): boolean {
  return triangles > 900_000;
}
