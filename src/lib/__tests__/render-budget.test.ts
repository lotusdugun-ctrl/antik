import { describe, expect, test } from "bun:test";
import { AdaptiveResolution, FrameGate, detailed } from "@/lib/render-budget";

/** Frames drawn in one second of a screen refreshing at `hz`. */
const drawnAt = (hz: number) => {
  const gate = new FrameGate(60);
  let drawn = 0;
  for (let i = 0; i < hz * 4; i += 1) if (gate.tick((i * 1000) / hz)) drawn += 1;
  return drawn / 4;
};

describe("frame gate", () => {
  test("a 60 Hz screen draws every refresh", () => {
    expect(drawnAt(60)).toBeGreaterThanOrEqual(59);
  });
  test("90 and 120 Hz screens are held to about 60 frames a second", () => {
    expect(drawnAt(120)).toBeGreaterThanOrEqual(58);
    expect(drawnAt(120)).toBeLessThanOrEqual(61);
    expect(drawnAt(90)).toBeGreaterThanOrEqual(55);
    expect(drawnAt(90)).toBeLessThanOrEqual(61);
  });
  test("a slow device draws every frame it is offered", () => {
    expect(drawnAt(20)).toBe(20);
  });
  test("after a stall it does not race to catch up", () => {
    const gate = new FrameGate(60);
    expect(gate.tick(0)).toBe(true);
    expect(gate.tick(5000)).toBe(true);
    expect(gate.tick(5008)).toBe(false);
    expect(gate.tick(5017)).toBe(true);
  });
});

/** Feed `frames` frames of `ms` each, starting at second `from`; the ratios it chose. */
const run = (res: AdaptiveResolution, ms: number, frames: number, from = 0) => {
  const changes: number[] = [];
  let now = from;
  for (let i = 0; i < frames; i += 1) {
    now += ms / 1000;
    const r = res.sample(ms, now);
    if (r !== null) changes.push(r);
  }
  return { changes, now };
};

describe("adaptive resolution", () => {
  test("a device that keeps up is never touched", () => {
    const res = new AdaptiveResolution({ max: 2, min: 1 });
    expect(run(res, 16.6, 3000).changes).toEqual([]);
    expect(res.ratio).toBe(2);
  });
  test("slow frames step the ratio down, never below the floor", () => {
    const res = new AdaptiveResolution({ max: 1.5, min: 0.75 });
    const { changes } = run(res, 40, 2000);
    expect(changes.length).toBeGreaterThan(0);
    for (let i = 1; i < changes.length; i += 1) expect(changes[i]!).toBeLessThan(changes[i - 1]!);
    expect(res.ratio).toBe(0.75);
  });
  test("one step is at most a quarter", () => {
    const res = new AdaptiveResolution({ max: 2, min: 0.5 });
    const { changes } = run(res, 200, 40);
    expect(changes[0]).toBe(1.5);
  });
  test("steps are spaced by the cool-down", () => {
    const res = new AdaptiveResolution({ max: 2, min: 0.5, cooldown: 2 });
    // 30 frames of 25 ms is under a second: only one change in two seconds.
    const { changes } = run(res, 25, 75);
    expect(changes.length).toBe(1);
  });
  test("one hitch in a window of good frames changes nothing", () => {
    const res = new AdaptiveResolution({ max: 2, min: 1 });
    let now = 0;
    for (let i = 0; i < 300; i += 1) {
      now += 0.0166;
      expect(res.sample(i % 30 === 7 ? 120 : 16.6, now)).toBeNull();
    }
  });
  test("once frames are fast again it climbs back to the maximum", () => {
    const res = new AdaptiveResolution({ max: 1.5, min: 0.75 });
    const slow = run(res, 40, 600);
    expect(res.ratio).toBeLessThan(1.5);
    run(res, 12, 6000, slow.now);
    expect(res.ratio).toBe(1.5);
  });
  test("stalls and hidden-tab gaps are ignored", () => {
    const res = new AdaptiveResolution({ max: 2, min: 1 });
    expect(run(res, 5000, 100).changes).toEqual([]);
    expect(res.ratio).toBe(2);
  });
  test("a new ceiling is taken at once", () => {
    const res = new AdaptiveResolution({ max: 2, min: 0.75 });
    expect(res.setMax(1)).toBe(1);
    expect(res.ratio).toBe(1);
    run(res, 12, 6000);
    expect(res.ratio).toBe(1);
    expect(res.setMax(2)).toBe(2);
  });
});

describe("level of detail with a margin", () => {
  const sq = (d: number) => d * d;
  test("full detail inside the near distance, plain beyond the far one", () => {
    expect(detailed(false, sq(10), 24, 28)).toBe(true);
    expect(detailed(true, sq(30), 24, 28)).toBe(false);
  });
  test("between the two it keeps whatever it was, so nobody flickers", () => {
    expect(detailed(false, sq(26), 24, 28)).toBe(false);
    expect(detailed(true, sq(26), 24, 28)).toBe(true);
  });
  test("walking away and back switches once each way", () => {
    let on = false;
    const switches: number[] = [];
    const path = [30, 26, 23, 25, 27, 26, 29, 27, 25, 23];
    for (const d of path) {
      const next = detailed(on, sq(d), 24, 28);
      if (next !== on) switches.push(d);
      on = next;
    }
    expect(switches).toEqual([23, 29, 23]);
  });
});
