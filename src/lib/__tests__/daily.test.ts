import { describe, expect, test } from "bun:test";
import { DAILY_QUESTIONS, dailyQuestions, dayKey, shareText } from "@/lib/daily";
import type { Localized } from "@/lib/i18n";

const tr = (v: Localized) => v.tr;
const en = (v: Localized) => v.en;

/**
 * The daily challenge has one hard requirement: two people opening it on the
 * same day must be given the same puzzle, or the shared score means nothing.
 * Everything below is a way of asserting that.
 */
describe("the daily challenge", () => {
  test("the same day always builds the same questions", () => {
    const first = dailyQuestions(tr, "2026-03-14");
    const second = dailyQuestions(tr, "2026-03-14");
    expect(second.map((q) => [q.mode, q.slug, q.prompt, q.answer])).toEqual(
      first.map((q) => [q.mode, q.slug, q.prompt, q.answer]),
    );
    // Option order is part of the puzzle, so it has to be stable too.
    expect(second.map((q) => q.options)).toEqual(first.map((q) => q.options));
  });

  test("a different day builds a different set", () => {
    const monday = dailyQuestions(tr, "2026-03-16").map((q) => q.slug);
    const tuesday = dailyQuestions(tr, "2026-03-17").map((q) => q.slug);
    expect(tuesday).not.toEqual(monday);
  });

  test("both languages ask about the same places, in the same order", () => {
    const day = "2026-07-01";
    expect(dailyQuestions(en, day).map((q) => q.slug)).toEqual(
      dailyQuestions(tr, day).map((q) => q.slug),
    );
  });

  test("a day never asks about the same site twice", () => {
    for (const day of ["2026-01-01", "2026-06-15", "2027-02-28"]) {
      const slugs = dailyQuestions(tr, day).map((q) => q.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  test("every question is answerable — the answer is one of the options", () => {
    for (const day of ["2026-01-01", "2026-06-15", "2026-12-31"]) {
      const questions = dailyQuestions(tr, day);
      expect(questions).toHaveLength(DAILY_QUESTIONS);
      for (const question of questions) {
        expect(question.options).toContain(question.answer);
        expect(new Set(question.options).size).toBe(question.options.length);
      }
    }
  });

  test("the day key is UTC, so the world rolls over together", () => {
    // 23:30 in Istanbul on the 5th is still the 4th in UTC.
    expect(dayKey(new Date("2026-03-04T21:30:00Z"))).toBe("2026-03-04");
    expect(dayKey(new Date("2026-03-04T23:59:59Z"))).toBe("2026-03-04");
    expect(dayKey(new Date("2026-03-05T00:00:01Z"))).toBe("2026-03-05");
  });

  test("the shared result gives away the score but never an answer", () => {
    const text = shareText({
      day: "2026-03-14",
      results: [true, false, true, true, false],
      streak: 4,
      title: "Günün Antik Kenti",
      streakLabel: "günlük seri",
    });
    expect(text).toContain("3/5");
    expect(text).toContain("🟩⬜🟩🟩⬜");
    expect(text).toContain("🔥 4");
    // No city names, no options, nothing to spoil for whoever reads it.
    for (const question of dailyQuestions(tr, "2026-03-14")) {
      expect(text).not.toContain(question.answer);
    }
  });

  test("a streak of one is not worth announcing", () => {
    const text = shareText({
      day: "2026-03-14",
      results: [true],
      streak: 1,
      title: "T",
      streakLabel: "s",
    });
    expect(text).not.toContain("🔥");
  });
});
