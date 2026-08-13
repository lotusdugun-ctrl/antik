import { describe, expect, test } from "bun:test";
import { buildQuestion, type Localize, type QuizMode } from "@/lib/quiz";
import { getSiteDetail } from "@/lib/site-details";
import { sites, type Site } from "@/lib/sites";
import type { Localized } from "@/lib/i18n";

const tr: Localize = (v: Localized) => v.tr;
const en: Localize = (v: Localized) => v.en;
const MODES: QuizMode[] = ["photo", "who", "tf", "map", "structure"];
const ROUNDS = 2000;

const bySlug = new Map(sites.map((s) => [s.slug, s]));

/** Structures live beside the site record, not on it. */
const structuresOf = (site: Site): Localized[] => getSiteDetail(site.slug)?.structures ?? [];

const LANGUAGES: [string, Localize][] = [
  ["tr", tr],
  ["en", en],
];

describe.each(LANGUAGES)("buildQuestion (%s)", (_lang, L) => {
  test.each(MODES)("%s: the answer is always among the options", (mode) => {
    for (let i = 0; i < ROUNDS; i++) {
      const q = buildQuestion(mode, L);
      expect(q.options).toContain(q.answer);
    }
  });

  test.each(MODES)("%s: no option appears twice", (mode) => {
    for (let i = 0; i < ROUNDS; i++) {
      const q = buildQuestion(mode, L);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  test("true/false statements are scored by what they actually claim", () => {
    for (let i = 0; i < ROUNDS; i++) {
      const q = buildQuestion("tf", L);
      const site = bySlug.get(q.slug)!;
      // The prompt is "<city> · <province>"; the claim is true exactly when
      // that province really is the site's own.
      const claimed = q.prompt.split(" · ")[1]!;
      const truthful = claimed === L(site.province);
      expect(q.answer).toBe(truthful ? "✓" : "✗");
    }
  });

  test("only one option can own the asked structure", () => {
    for (let i = 0; i < ROUNDS; i++) {
      const q = buildQuestion("structure", L);
      const owners = sites.filter((s) => structuresOf(s).some((st) => L(st) === q.prompt));
      const named = owners.filter((s) => q.options.includes(L(s.name)));
      expect(named).toHaveLength(1);
      expect(L(named[0]!.name)).toBe(q.answer);
    }
  });

  test("only one option can own the asked figure", () => {
    for (let i = 0; i < ROUNDS; i++) {
      const q = buildQuestion("who", L);
      const owners = sites.filter((s) => s.figures.includes(q.prompt));
      const named = owners.filter((s) => q.options.includes(L(s.name)));
      expect(named).toHaveLength(1);
      expect(L(named[0]!.name)).toBe(q.answer);
    }
  });

  test("the province round offers four different provinces", () => {
    for (let i = 0; i < ROUNDS; i++) {
      const q = buildQuestion("map", L);
      const site = bySlug.get(q.slug)!;
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBe(L(site.province));
    }
  });

  test.each(MODES)("%s: the recent list is respected", (mode) => {
    // Everything but a handful of sites is off limits; the builder must still
    // pick from what is left rather than reaching for the excluded ones.
    const eligible = new Set<string>();
    for (let i = 0; i < 200; i++) eligible.add(buildQuestion(mode, L).slug);
    const allowed = [...eligible].slice(0, 3);
    const recent = new Set(sites.map((s) => s.slug).filter((s) => !allowed.includes(s)));
    for (let i = 0; i < 200; i++) {
      expect(allowed).toContain(buildQuestion(mode, L, recent).slug);
    }
  });
});
