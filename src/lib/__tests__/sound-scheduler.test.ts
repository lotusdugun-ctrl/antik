import { describe, expect, test } from "bun:test";
import { SYNTH_CALLS } from "@/lib/ambience-synth";
import { reconstructions } from "@/lib/reconstructions";
import {
  bedPiece,
  createPicker,
  drumming,
  hourDensity,
  melody,
  MODES,
  nextGap,
  seeded,
  vary,
} from "@/lib/sound-scheduler";
import { CALLS, isClip, soundscapeFor, sourcesOf } from "@/lib/soundscapes";

describe("the scheduler that keeps a soundscape from repeating", () => {
  test("a pool never plays the same variant twice running", () => {
    const rng = seeded(1);
    for (const size of [2, 3, 4, 7]) {
      const items = Array.from({ length: size }, (_, i) => i);
      const pick = createPicker(items, rng);
      let last = -1;
      let beforeLast = -1;
      const seen = new Set<number>();
      for (let i = 0; i < 2000; i += 1) {
        const v = pick()!;
        expect(v).not.toBe(last);
        // With four or more, not within two plays either.
        if (size >= 4) expect(v).not.toBe(beforeLast);
        seen.add(v);
        beforeLast = last;
        last = v;
      }
      // And every variant is heard.
      expect(seen.size).toBe(size);
    }
  });

  test("a pool of one still plays, and a filter it cannot meet plays nothing", () => {
    const pick = createPicker(["only"], seeded(2));
    expect(pick()).toBe("only");
    expect(pick()).toBe("only");
    expect(pick(() => false)).toBeUndefined();
  });

  test("gaps are random, with a floor, averaging the middle of the range", () => {
    const rng = seeded(3);
    const every = [20, 60] as const;
    const gaps = Array.from({ length: 20000 }, () => nextGap(every, rng));
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(60 * 2.2 + 1e-9);
    expect(mean).toBeGreaterThan(33);
    expect(mean).toBeLessThan(42);
    // Not a metronome: the spread is wide (an exponential tail has CV near 1).
    const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length);
    expect(sd / mean).toBeGreaterThan(0.4);
    // Rarely held at the ceiling.
    expect(gaps.filter((g) => g >= 60 * 2.2 - 1e-9).length / gaps.length).toBeLessThan(0.03);
    // Short gaps are the commonest (exponential), not the middle (uniform).
    const low = gaps.filter((g) => g < 25).length;
    const mid = gaps.filter((g) => g >= 35 && g < 40).length;
    expect(low / 15).toBeGreaterThan(mid / 5);
  });

  test("a busy place and a busy hour shorten the gaps; a quiet one lengthens them", () => {
    const mean = (density: number) => {
      const rng = seeded(4);
      let sum = 0;
      for (let i = 0; i < 5000; i += 1) sum += nextGap([10, 30], rng, density);
      return sum / 5000;
    };
    expect(mean(1.5)).toBeLessThan(mean(1));
    expect(mean(0.5)).toBeGreaterThan(mean(1) * 1.8);
    expect(hourDensity(0.1, 0.4)).toBeLessThan(hourDensity(0.4, 0.4));
    expect(hourDensity(0, 0.4)).toBe(0);
  });

  test("every play of a sound differs: speed, loudness, side, distance", () => {
    const rng = seeded(5);
    const plays = Array.from({ length: 400 }, () =>
      vary(rng, { rate: [0.9, 1.1], spread: 0.8, muffle: 5000, wet: 0.3 }),
    );
    for (const key of ["rate", "gain", "pan", "cutoff"] as const) {
      const values = new Set(plays.map((p) => p[key].toFixed(4)));
      expect(values.size).toBeGreaterThan(340);
    }
    for (const p of plays) {
      expect(p.rate).toBeGreaterThanOrEqual(0.9);
      expect(p.rate).toBeLessThanOrEqual(1.1);
      expect(Math.abs(p.pan)).toBeLessThanOrEqual(0.8);
      expect(p.gain).toBeLessThanOrEqual(10 ** (1.5 / 20) + 1e-9);
    }
    // Further is quieter and duller.
    const far = plays.filter((p) => p.distance > 0.7);
    const near = plays.filter((p) => p.distance < 0.2);
    const avg = (list: typeof plays, k: "gain" | "cutoff") =>
      list.reduce((a, p) => a + p[k], 0) / list.length;
    expect(avg(far, "gain")).toBeLessThan(avg(near, "gain"));
    expect(avg(far, "cutoff")).toBeLessThan(avg(near, "cutoff"));
  });

  test("a bed plays stretches of its recording, never the same stretch twice running", () => {
    const rng = seeded(6);
    for (const duration of [9, 16, 25, 60]) {
      let last: number | undefined;
      for (let i = 0; i < 300; i += 1) {
        const piece = bedPiece(duration, rng, last);
        expect(piece.offset).toBeGreaterThanOrEqual(0);
        expect(piece.offset + piece.length).toBeLessThanOrEqual(duration + 1e-9);
        expect(piece.length).toBeGreaterThan(Math.min(5, duration * 0.8) - 1e-9);
        expect(piece.fade * 2).toBeLessThanOrEqual(piece.length + 1e-9);
        if (last !== undefined && duration > 14)
          expect(Math.abs(piece.offset - last)).toBeGreaterThan(0.01);
        last = piece.offset;
      }
    }
  });

  test("melodies are made new each time, in their mode", () => {
    const rng = seeded(7);
    const tunes = Array.from({ length: 30 }, () =>
      melody(rng, { mode: "dorian", tonic: 220, seconds: 12 }),
    );
    const keys = new Set(tunes.map((t) => t.map((n) => Math.round(n.f)).join(",")));
    expect(keys.size).toBe(30);
    const allowed = new Set<number>(MODES.dorian);
    for (const tune of tunes)
      for (const note of tune) {
        const semis = Math.round(12 * Math.log2(note.f / 220));
        expect(allowed.has(((semis % 12) + 12) % 12)).toBe(true);
      }
  });

  test("drumming changes its pattern as it goes", () => {
    const rng = seeded(8);
    const runs = Array.from({ length: 20 }, () => drumming(rng, 12));
    const keys = new Set(
      runs.map((r) => r.map((b) => `${b.tone}${Math.round(b.t / 0.05)}`).join(" ")),
    );
    expect(keys.size).toBe(20);
    for (const run of runs) {
      expect(run.some((b) => b.tone === "dum")).toBe(true);
      expect(run.some((b) => b.tone === "tek")).toBe(true);
    }
  });
});

describe("every model sounds like itself", () => {
  test("each has many distinct sources", () => {
    for (const item of reconstructions) {
      const n = sourcesOf(soundscapeFor(item)).length;
      expect(`${item.id}: ${n >= 14}`).toBe(`${item.id}: true`);
    }
  });

  test("no two models have the same soundscape", () => {
    const seen = new Map<string, string>();
    for (const item of reconstructions) {
      const scape = soundscapeFor(item);
      const key = JSON.stringify([sourcesOf(scape), scape.beds, scape.happenings, scape.density]);
      expect(`${item.id} = ${seen.get(key) ?? "none"}`).toBe(`${item.id} = none`);
      seen.set(key, item.id);
    }
  });

  test("a happening with one recording still varies it: its speed, or which stretch", () => {
    for (const item of reconstructions) {
      for (const h of soundscapeFor(item).happenings) {
        if (h.sounds.length !== 1 || !isClip(h.sounds[0]!)) continue;
        expect(`${item.id} ${h.sounds[0]}: ${Boolean(h.rate || h.max)}`).toBe(
          `${item.id} ${h.sounds[0]}: true`,
        );
      }
    }
  });

  test("the eight newest have the sounds of their own places", () => {
    const of = (id: string) => sourcesOf(soundscapeFor(reconstructions.find((r) => r.id === id)!));
    expect(of("sumela-manastiri")).toEqual(
      expect.arrayContaining([
        "brook",
        "chant",
        "bell",
        "semantron",
        "woodpecker",
        "cuckoo",
        "wind",
      ]),
    );
    expect(of("patara-deniz-feneri")).toEqual(
      expect.arrayContaining(["sea", "gull", "rigging", "lapping"]),
    );
    expect(of("catalhoyuk-dogu-hoyugu")).toEqual(
      expect.arrayContaining(["grind", "fire", "dog1", "chatter", "frog"]),
    );
    expect(of("ani-katedrali")).toEqual(expect.arrayContaining(["bell", "gust", "market", "wind"]));
    expect(of("zeugma-villa")).toEqual(expect.arrayContaining(["frog", "lapping", "fountain"]));
    expect(of("sagalassos-antoninler-cesmesi")).toEqual(
      expect.arrayContaining(["fountain", "brook", "gust", "goatbells"]),
    );
    expect(of("hattusa-aslanli-kapi")).toEqual(expect.arrayContaining(["goatbells", "donkey"]));
    expect(of("troya-vi-surlari")).toEqual(expect.arrayContaining(["gust", "beeeater", "neigh1"]));
  });

  test("every synthesised sound is the player's own", () => {
    expect([...CALLS]).toEqual([...SYNTH_CALLS]);
  });
});
