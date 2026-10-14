// Kept out of `history.ts` so the timeline route can validate `?yil=` without
// pulling every civilization and person into the entry bundle.

/*
 * The timeline's scale. Linear time would spend nine tenths of the width on
 * the Stone Age, so it is piecewise: prehistory is squeezed, the Bronze Age
 * onward gets the room. Position runs 0 → 1.
 */
export const STOPS: [year: number, pos: number][] = [
  [-20000, 0],
  [-10000, 0.06],
  [-3000, 0.16],
  [-1000, 0.36],
  [0, 0.54],
  [1000, 0.76],
  [1923, 1],
];

export const TIMELINE_START = STOPS[0]![0];
export const TIMELINE_END = STOPS[STOPS.length - 1]![0];
