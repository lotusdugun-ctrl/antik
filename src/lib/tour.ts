import { estimateSeconds, type Guide } from "@/lib/narration";
import type { Hotspot } from "@/lib/reconstructions";

/**
 * The guided tour ("Rehberli tur"): the camera flown from one named part of a
 * model to the next while the audio guide reads the matching chapter.
 *
 * The narration is the reconstruction's own guide (`reconstructionGuide`), so
 * a tour says nothing the page does not. What this module adds is the order
 * and the shots: an opening view of the whole, then each hotspot, then a wide
 * closing view while "what we don't know" is read.
 *
 * Order. A guide whose chapters were written to be spoken in sequence (the
 * stories in `narration-stories`) keeps its order — they lead from one part
 * to the next in words. A guide built from the bare hotspot notes has no such
 * thread, and its hotspots are listed in whatever order the model's author
 * typed them, which can send the camera back and forth across a theatre; it
 * is re-ordered into the shortest walk that starts at the first hotspot.
 */

export type Vec3 = [number, number, number];

export type TourStop =
  | { chapter: number; kind: "view"; view: "front" | "corner" | "above" }
  | { chapter: number; kind: "spot"; hotspot: number; at: Vec3 };

export type TourPlan = {
  /** The guide as the tour plays it: the same chapters, perhaps re-ordered. */
  guide: Guide;
  /** One shot per chapter of `guide`, in the same order. */
  stops: TourStop[];
};

const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * The shortest open path through `points` that starts at `points[start]`:
 * nearest neighbour first, then 2-opt until no swap of two legs shortens it.
 * A model has at most a dozen hotspots, so this is exact enough and instant.
 */
export function orderByPath(points: Vec3[], start = 0): number[] {
  const n = points.length;
  if (n <= 2) return points.map((_, i) => i);
  const first = Math.min(Math.max(0, start), n - 1);
  const order = [first];
  const left = new Set(points.map((_, i) => i).filter((i) => i !== first));
  while (left.size > 0) {
    const from = points[order[order.length - 1]!]!;
    let best = -1;
    let bestD = Infinity;
    for (const i of left) {
      const d = dist(from, points[i]!);
      // Ties go to the lower index, so the result never depends on Set order.
      if (d < bestD - 1e-9 || (Math.abs(d - bestD) <= 1e-9 && i < best)) {
        bestD = d;
        best = i;
      }
    }
    order.push(best);
    left.delete(best);
  }
  // 2-opt on an open path with a fixed first point.
  let improved = true;
  let guard = 0;
  while (improved && guard < 200) {
    improved = false;
    guard += 1;
    for (let i = 1; i < n - 1; i += 1) {
      for (let k = i + 1; k < n; k += 1) {
        const a = points[order[i - 1]!]!;
        const b = points[order[i]!]!;
        const c = points[order[k]!]!;
        const d = k + 1 < n ? points[order[k + 1]!]! : null;
        const before = dist(a, b) + (d ? dist(c, d) : 0);
        const after = dist(a, c) + (d ? dist(b, d) : 0);
        if (after < before - 1e-6) {
          const middle = order.slice(i, k + 1).reverse();
          order.splice(i, middle.length, ...middle);
          improved = true;
        }
      }
    }
  }
  return order;
}

/** Total length of a path through `points` in `order`. */
export function pathLength(points: Vec3[], order: number[]): number {
  let total = 0;
  for (let i = 1; i < order.length; i += 1)
    total += dist(points[order[i - 1]!]!, points[order[i]!]!);
  return total;
}

/**
 * The tour for a guide. `reorder` is whether the hotspot chapters may be put
 * in path order (false for a guide with written stories, see above).
 */
export function planTour(guide: Guide, hotspots: Hotspot[], reorder: boolean): TourPlan {
  const spotChapters = guide.chapters
    .map((chapter, index) => ({ chapter, index }))
    .filter(({ chapter }) => chapter.hotspot !== undefined && hotspots[chapter.hotspot]);
  const others = guide.chapters
    .map((chapter, index) => ({ chapter, index }))
    .filter(({ chapter }) => chapter.hotspot === undefined || !hotspots[chapter.hotspot]);

  let chapters = guide.chapters;
  if (reorder && spotChapters.length > 2) {
    const points = spotChapters.map(({ chapter }) => hotspots[chapter.hotspot!]!.at);
    const order = orderByPath(points, 0).map((i) => spotChapters[i]!.chapter);
    // Whatever came before the first hotspot stays first, whatever came after
    // the last stays last; the hotspots fill the middle in path order.
    const firstSpot = spotChapters[0]!.index;
    const lastSpot = spotChapters[spotChapters.length - 1]!.index;
    const head = others.filter(({ index }) => index < firstSpot).map(({ chapter }) => chapter);
    const tail = others.filter(({ index }) => index > lastSpot).map(({ chapter }) => chapter);
    const between = others
      .filter(({ index }) => index > firstSpot && index < lastSpot)
      .map(({ chapter }) => chapter);
    chapters = [...head, ...order, ...between, ...tail];
  }

  const lastIndex = chapters.length - 1;
  const stops: TourStop[] = chapters.map((chapter, index): TourStop => {
    const spot = chapter.hotspot !== undefined ? hotspots[chapter.hotspot] : undefined;
    if (spot && chapter.hotspot !== undefined)
      return { chapter: index, kind: "spot", hotspot: chapter.hotspot, at: spot.at };
    // The opening shot is the whole model from the front; anything else that
    // is not about one part — the closing "what we don't know" — pulls back
    // to the corner, and a long tour's very last word from above.
    const view = index === 0 ? "front" : index === lastIndex && lastIndex > 3 ? "corner" : "above";
    return { chapter: index, kind: "view", view };
  });
  return { guide: { ...guide, chapters }, stops };
}

/**
 * How long to hold a stop when nothing tells the tour that the voice has
 * finished — no speech engine, or a muted one: the guide's own estimate of
 * the spoken length, never less than six seconds of looking.
 */
export function dwellSeconds(text: string, rate = 1): number {
  return Math.max(6, estimateSeconds(text, rate));
}
