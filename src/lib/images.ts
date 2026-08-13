/**
 * Responsive sizing for the Wikimedia Commons photos in the data layer.
 *
 * Two Commons rules shape everything here:
 *
 * 1. Thumbnails exist only at a fixed set of widths. Asking for 400, 480, 640
 *    or 800 does not resize anything — it answers `400 Use thumbnail sizes
 *    listed on https://w.wiki/GHai` and the image is simply broken. The ladder
 *    below is therefore not a preference, it is the set of widths verified to
 *    respond 200.
 * 2. Commons never upscales. A file 800px wide has no 1280px thumbnail.
 *
 * Rule 2 is why every URL in `sites.ts` / `structures.ts` is stored as a
 * `/thumb/` URL pinned to the largest width its source file can produce. That
 * pinned number is the ceiling: we may ask for anything at or below it, never
 * above. `srcSetFor` reads the ceiling straight out of the URL, so the data
 * layer stays the single source of truth about what each photo can deliver.
 */
const WIDTHS = [250, 330, 500, 960, 1280] as const;

/** `…/thumb/<h>/<hh>/<file>/<width>px-<file>` split around the width. */
const THUMB =
  /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/[^/]+\/)(\d+)(px-[^/]+)$/;

type Parsed = { prefix: string; ceiling: number; suffix: string };

function parse(url: string): Parsed | null {
  const m = THUMB.exec(url);
  if (!m) return null;
  return { prefix: m[1]!, ceiling: Number(m[2]), suffix: m[3]! };
}

/** Widths this photo can actually serve, smallest first. */
function ladderFor(ceiling: number): number[] {
  const rungs = WIDTHS.filter((w) => w < ceiling);
  return [...rungs, ceiling];
}

/**
 * The same photo at (at most) `want` pixels wide. Falls back to the closest
 * available rung, and returns non-Commons URLs — bundled assets, mainly —
 * untouched.
 */
export function imageAt(url: string, want: number): string {
  const parsed = parse(url);
  if (!parsed) return url;
  const ladder = ladderFor(parsed.ceiling);
  const width = ladder.find((w) => w >= want) ?? parsed.ceiling;
  return `${parsed.prefix}${width}${parsed.suffix}`;
}

/**
 * A `srcSet` covering every width this photo can serve, or `undefined` when
 * there is nothing to choose between (single rung, or a bundled asset).
 */
export function srcSetFor(url: string): string | undefined {
  const parsed = parse(url);
  if (!parsed) return undefined;
  const ladder = ladderFor(parsed.ceiling);
  if (ladder.length < 2) return undefined;
  return ladder.map((w) => `${parsed.prefix}${w}${parsed.suffix} ${w}w`).join(", ");
}
