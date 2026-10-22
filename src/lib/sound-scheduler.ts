/**
 * The arithmetic that keeps a soundscape from repeating itself, kept apart
 * from the Web Audio player (src/lib/ambience.ts) so it can be tested:
 *
 * - which variant of a sound plays next (never the one just heard),
 * - how long until the next one (random, with a floor, thinned by the hour
 *   and by how busy the place is — not a metronome),
 * - how each play differs from the last (pitch, speed, loudness, side,
 *   distance),
 * - which stretch of a long recording a bed plays next, and for how long,
 * - and the music: melodies made afresh in the old modes, drum rhythms put
 *   together from cells, so no two phrases are the same.
 */

export type Rng = () => number;

/** A small seeded generator (mulberry32), for tests and for repeatable mixes. */
export function seeded(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = (rng: Rng, lo: number, hi: number) => lo + rng() * (hi - lo);

/**
 * Picks from a pool so that the same variant never comes twice running, and
 * in a pool of four or more not within two plays either. A pool of one has
 * nothing to choose, and says so by repeating.
 */
export function createPicker<T>(items: readonly T[], rng: Rng) {
  const recent: number[] = [];
  return (allowed: (item: T) => boolean = () => true): T | undefined => {
    const ok = items.map((item, i) => (allowed(item) ? i : -1)).filter((i) => i >= 0);
    if (ok.length === 0) return undefined;
    const memory = ok.length >= 4 ? 2 : ok.length >= 2 ? 1 : 0;
    const fresh = ok.filter((i) => !recent.slice(-memory).includes(i));
    const pool = fresh.length > 0 && memory > 0 ? fresh : ok;
    const i = pool[Math.floor(rng() * pool.length)]!;
    recent.push(i);
    if (recent.length > 4) recent.shift();
    return items[i];
  };
}

/**
 * Seconds until something happens again. Events in a real place arrive
 * roughly at random (a Poisson process: exponential gaps), but never on top
 * of one another — so the gap is a floor of half the shortest given, plus an
 * exponential tail whose mean puts the average in the middle of the range.
 * `density` above 1 (a crowded scene) shortens the gaps, below 1 lengthens.
 */
export function nextGap(every: readonly [number, number], rng: Rng, density = 1) {
  const [lo, hi] = every;
  const floor = lo * 0.5;
  const mean = (lo + hi) / 2 - floor;
  const tail = -Math.log(1 - rng() * 0.999) * mean;
  const gap = Math.min(floor + tail, hi * 2.2);
  return gap / Math.max(0.2, density);
}

/** How often a happening fires at an hour, from its level then against its loudest. */
export function hourDensity(now: number, loudest: number) {
  if (loudest <= 0 || now <= 0) return 0;
  return 0.45 + 0.55 * Math.min(1, now / loudest);
}

export type Variation = {
  /** Playback rate (speed and pitch together). */
  rate: number;
  /** Linear gain multiplier. */
  gain: number;
  pan: number;
  /** Low-pass cutoff in Hz. */
  cutoff: number;
  /** Extra reverb send: far things are more room than source. */
  wet: number;
  /** 0 near .. 1 far. */
  distance: number;
};

/**
 * How one play of a sound differs from the last: a little faster or slower,
 * louder or softer, off to one side, nearer or further — and further means
 * quieter, duller and more of the room.
 */
export function vary(
  rng: Rng,
  base: {
    rate?: readonly [number, number] | undefined;
    spread?: number | undefined;
    muffle?: number | undefined;
    wet?: number | undefined;
  } = {},
): Variation {
  const [r0, r1] = base.rate ?? [0.95, 1.05];
  const distance = rng() ** 1.4;
  const db = between(rng, -3.5, 1.5) - distance * 7;
  const spread = base.spread ?? 0.6;
  const muffle = base.muffle ?? 14000;
  return {
    rate: between(rng, r0, r1),
    gain: 10 ** (db / 20),
    pan: between(rng, -spread, spread),
    cutoff: Math.max(500, muffle * 2 ** (between(rng, -0.35, 0.35) - distance * 1.1)),
    wet: (base.wet ?? 0.3) + distance * 0.25,
    distance,
  };
}

/**
 * The next stretch of a bed recording to play: somewhere other than the
 * last one, for a length of its own, a hair faster or slower. Pieces overlap
 * by their fades, so a bed is an endless patchwork of a recording rather
 * than the recording going round.
 */
export function bedPiece(duration: number, rng: Rng, previous?: number) {
  const length = Math.min(duration * 0.8, Math.max(5, between(rng, 0.3, 0.65) * duration), 22);
  const room = Math.max(0, duration - length);
  let offset = rng() * room;
  if (previous !== undefined && room > 0) {
    for (let tries = 0; tries < 6 && Math.abs(offset - previous) < duration * 0.22; tries += 1)
      offset = rng() * room;
  }
  const fade = Math.min(Math.max(length * 0.3, 1.5), 4);
  return { offset, length, rate: between(rng, 0.97, 1.03), fade };
}

/* ---- Music ----------------------------------------------------------- */

/** The modes the Greek tunings are closest to, as semitones above the tonic. */
export const MODES = {
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  hypodorian: [0, 2, 3, 5, 7, 8, 10],
  // Byzantine first plagal / a chant mode: a minor colour with a raised sixth.
  echos: [0, 2, 3, 5, 7, 9, 10],
} as const satisfies Record<string, readonly number[]>;

export type Mode = keyof typeof MODES;

export type MelodyNote = { t: number; len: number; f: number; accent: number };

/** Rhythmic cells, in beats: long-short, short-short-long, even, a held note... */
const CELLS: readonly (readonly number[])[] = [
  [1, 1],
  [1.5, 0.5],
  [0.5, 0.5, 1],
  [2],
  [1, 0.5, 0.5],
  [0.75, 0.25, 1],
  [3],
  [0.5, 0.5, 0.5, 0.5],
];

/**
 * A melody made now: a walk over the mode's degrees that prefers steps to
 * leaps, built of rhythmic cells, breathing between phrases and coming home
 * to the tonic or the fifth at the end of each. `tonic` in Hz.
 */
export function melody(
  rng: Rng,
  o: { mode: Mode; tonic: number; seconds: number; beat?: number; range?: number },
): MelodyNote[] {
  const scale = MODES[o.mode];
  const beat = o.beat ?? between(rng, 0.32, 0.5);
  const range = o.range ?? 9;
  const freq = (degree: number) => {
    const octave = Math.floor(degree / scale.length);
    const step = scale[((degree % scale.length) + scale.length) % scale.length]!;
    return o.tonic * 2 ** ((octave * 12 + step) / 12);
  };
  const out: MelodyNote[] = [];
  let t = 0;
  let degree = Math.floor(rng() * 5);
  while (t < o.seconds) {
    // One phrase: two to five cells.
    const cells = 2 + Math.floor(rng() * 4);
    for (let c = 0; c < cells && t < o.seconds; c += 1) {
      const cell = CELLS[Math.floor(rng() * CELLS.length)]!;
      for (const beats of cell) {
        const r = rng();
        const move = r < 0.35 ? 1 : r < 0.7 ? -1 : r < 0.8 ? 0 : r < 0.9 ? 2 : -2;
        degree = Math.max(-2, Math.min(range, degree + move));
        out.push({ t, len: beats * beat * 0.95, f: freq(degree), accent: c === 0 ? 1 : 0.8 });
        t += beats * beat;
      }
    }
    // The cadence: home to the tonic or the fifth, held.
    degree = rng() < 0.6 ? 0 : 4;
    out.push({ t, len: beat * between(rng, 1.8, 3), f: freq(degree), accent: 0.9 });
    t += beat * between(rng, 2.5, 4.5);
  }
  return out;
}

export type DrumBeat = { t: number; accent: number; tone: "dum" | "tek" };

/** Bars of a frame drum: a few patterns, each varied as it is played. */
const BARS: readonly (readonly (0 | 1 | 2)[])[] = [
  // 2 = dum (low, struck in the middle), 1 = tek (high, at the rim), 0 = rest.
  [2, 0, 1, 0, 2, 1, 0, 1],
  [2, 0, 0, 1, 2, 0, 1, 0],
  [2, 1, 1, 0, 2, 0, 1, 1],
  [2, 0, 2, 0, 1, 0, 1, 0],
  [2, 0, 0, 0, 2, 0, 0, 0],
  [2, 0, 1, 1, 0, 1, 2, 0],
];

/**
 * A run of drumming `seconds` long: a pattern chosen for each bar from a
 * small family, a beat that drifts a little, now and then a beat dropped or
 * an ornament added, and a swell in and out.
 */
export function drumming(rng: Rng, seconds: number, step = between(rng, 0.16, 0.24)): DrumBeat[] {
  const out: DrumBeat[] = [];
  let t = 0;
  let bar = BARS[Math.floor(rng() * BARS.length)]!;
  while (t < seconds) {
    if (rng() < 0.35) bar = BARS[Math.floor(rng() * BARS.length)]!;
    for (const hit of bar) {
      const swell = Math.min(1, (t + 0.5) / 3, (seconds - t) / 3);
      if (hit && rng() > 0.06) {
        out.push({
          t: t + between(rng, -0.012, 0.012),
          accent: (hit === 2 ? 1 : 0.55) * between(rng, 0.8, 1.05) * Math.max(0.15, swell),
          tone: hit === 2 ? "dum" : "tek",
        });
      } else if (!hit && rng() < 0.08) {
        out.push({ t, accent: 0.3 * Math.max(0.15, swell), tone: "tek" });
      }
      t += step * between(rng, 0.97, 1.03);
    }
  }
  return out.filter((b) => b.t < seconds);
}
