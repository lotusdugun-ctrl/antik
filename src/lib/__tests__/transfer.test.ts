import { describe, expect, test } from "bun:test";
import {
  mergeStates,
  sanitizeState,
  XP_PER_CORRECT,
  XP_PER_STAMP,
  XP_PER_VISIT,
} from "@/lib/transfer";

const blank = {
  visited: [] as string[],
  favorites: [] as string[],
  recent: [] as string[],
  xp: 0,
  gamesPlayed: 0,
  correctAnswers: 0,
  visits: {},
  stamps: {},
};

describe("merge XP", () => {
  test("is rebuilt from the merged visits instead of taking the larger total", () => {
    // Each device visited a different site; one also answered two questions.
    const a = { ...blank, visited: ["efes"], xp: XP_PER_VISIT + 2 * XP_PER_CORRECT };
    const b = {
      ...blank,
      visited: ["milet"],
      xp: XP_PER_VISIT + XP_PER_STAMP,
      stamps: { milet: { slug: "milet", at: "2026-10-12T09:00:00Z", distance: 5 } },
    };
    const merged = mergeStates(a, b);
    expect(merged.xp).toBe(2 * XP_PER_VISIT + XP_PER_STAMP + 2 * XP_PER_CORRECT);
    // Merging is idempotent: the shared part is not counted twice.
    expect(mergeStates(merged, merged).xp).toBe(merged.xp);
  });

  test("never goes below what the visits are worth", () => {
    // An XP total lower than its visits (an old un-tick bug) clamps at 0 extra.
    const a = { ...blank, visited: ["efes", "milet"], xp: 10 };
    expect(mergeStates(a, blank).xp).toBe(2 * XP_PER_VISIT);
  });
});

describe("sanitizeState", () => {
  test("keeps well-formed fields, repairs partial entries, drops malformed ones", () => {
    const state = sanitizeState({
      visited: ["efes", 3, null],
      favorites: "milet",
      xp: "100",
      gamesPlayed: Infinity,
      correctAnswers: 4,
      visits: {
        efes: { slug: "efes", date: "2026-10-12", note: "harika", photo: 7 },
        old: { note: "eski not", photo: "data:image/jpeg;base64,AAAA" },
        list: [],
      },
      stamps: {
        efes: { slug: "efes", at: "2026-10-12T09:00:00Z", distance: 12 },
        nan: { slug: "nan", at: "x", distance: NaN },
      },
    });
    expect(state.visited).toEqual(["efes"]);
    expect(state.favorites).toEqual([]);
    expect(state.recent).toEqual([]);
    expect(state.xp).toBe(0);
    expect(state.gamesPlayed).toBe(0);
    expect(state.correctAnswers).toBe(4);
    // An older entry missing slug/date keeps its note and photo.
    expect(state.visits).toEqual({
      efes: { slug: "efes", date: "2026-10-12", note: "harika" },
      old: { slug: "old", date: "", note: "eski not", photo: "data:image/jpeg;base64,AAAA" },
    });
    expect(state.stamps["nan"]).toEqual({ slug: "nan", at: "x", distance: 0 });
  });

  test("turns anything that is not an object into the empty record", () => {
    expect(sanitizeState(null)).toEqual(blank);
    expect(sanitizeState([1, 2])).toEqual(blank);
  });
});
