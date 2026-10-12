import { describe, expect, test } from "bun:test";
import { civilizations } from "@/lib/civilizations";
import {
  civilizationsAt,
  formatYear,
  posToYear,
  sitesAt,
  siteSpan,
  TIMELINE_END,
  TIMELINE_START,
  yearToPos,
} from "@/lib/history";
import type { Localized } from "@/lib/i18n";
import { people } from "@/lib/people";
import { getSite, sites } from "@/lib/sites";

const full = (l: Localized) => Boolean(l.tr && l.en && l.de && l.ru);

describe("civilizations", () => {
  test("ids are unique, texts complete in four languages, spans ordered", () => {
    expect(new Set(civilizations.map((c) => c.id)).size).toBe(civilizations.length);
    for (const civ of civilizations) {
      expect(civ.id).toMatch(/^[a-z0-9-]+$/);
      expect(civ.start).toBeLessThan(civ.end);
      for (const l of [civ.name, civ.periodLabel, civ.summary, ...civ.highlights]) {
        expect(full(l)).toBe(true);
      }
      if (civ.capital) expect(full(civ.capital)).toBe(true);
      expect(civ.sources.length).toBeGreaterThan(0);
      for (const s of civ.sources) expect(s.url).toStartWith("https://");
    }
  });

  test("every match is a value the site data really uses", () => {
    const used = new Set(sites.flatMap((s) => s.civilizations));
    for (const civ of civilizations) for (const m of civ.matches) expect(used.has(m)).toBe(true);
  });

  test("a value belongs to one civilization only", () => {
    const all = civilizations.flatMap((c) => c.matches);
    expect(new Set(all).size).toBe(all.length);
  });

  test("the common civilizations of the data all have a page", () => {
    const counts = new Map<string, number>();
    for (const s of sites) for (const c of s.civilizations) counts.set(c, (counts.get(c) ?? 0) + 1);
    const covered = new Set(civilizations.flatMap((c) => c.matches));
    const missing = [...counts].filter(([v, n]) => n >= 3 && !covered.has(v)).map(([v]) => v);
    expect(missing).toEqual([]);
  });
});

describe("people", () => {
  test("ids unique, matches used by the data, civilizations exist", () => {
    expect(new Set(people.map((p) => p.id)).size).toBe(people.length);
    const figures = new Set(sites.flatMap((s) => s.figures));
    const civIds = new Set(civilizations.map((c) => c.id));
    for (const p of people) {
      for (const m of p.matches) expect(figures.has(m)).toBe(true);
      for (const c of p.civilizations) expect(civIds.has(c)).toBe(true);
      expect(p.start).toBeLessThanOrEqual(p.end);
      for (const l of [p.name, p.role, p.bio, p.lifeLabel]) expect(full(l)).toBe(true);
    }
  });
});

describe("timeline", () => {
  test("the scale is monotonic and inverts", () => {
    let last = -1;
    for (let y = TIMELINE_START; y <= TIMELINE_END; y += 250) {
      const p = yearToPos(y);
      expect(p).toBeGreaterThan(last);
      last = p;
    }
    for (const y of [-7000, -1300, -500, 150, 1200, 1550]) {
      expect(Math.abs(posToYear(yearToPos(y)) - y)).toBeLessThanOrEqual(250);
    }
  });

  test("500 BCE has the Persians and Lycians, 1300 CE the Seljuks or beyliks", () => {
    const at500 = civilizationsAt(-500).map((c) => c.id);
    expect(at500).toContain("pers");
    expect(at500).toContain("likya");
    const at1300 = civilizationsAt(1300).map((c) => c.id);
    expect(at1300.some((id) => id === "selcuklu" || id === "beylikler")).toBe(true);
    expect(sitesAt(-1300).map((s) => s.slug)).toContain("hattusa");
  });

  test("a site's span comes from its civilizations", () => {
    const span = siteSpan(getSite("efes")!)!;
    expect(span.start).toBeLessThan(0);
    expect(span.end).toBeGreaterThan(1000);
  });

  test("years read naturally in each language", () => {
    expect(formatYear(-546, "tr")).toBe("MÖ 546");
    expect(formatYear(-546, "en")).toBe("546 BCE");
    expect(formatYear(1453, "de")).toBe("1453");
  });
});

describe("history index", () => {
  test("matches the full data (rerun scripts/build-history-index.ts if not)", async () => {
    const { civilizationIndex, peopleIndex } = await import("@/lib/history-index");
    const slim = (l: { id: string; name: Localized; matches: string[] }[]) =>
      l.map(({ id, name, matches }) => ({ id, name, matches }));
    expect(civilizationIndex).toEqual(slim(civilizations));
    expect(peopleIndex).toEqual(slim(people));
  });
});

describe("teacher worksheet", () => {
  test("questions have four distinct options and one right answer, and are reproducible", async () => {
    const { worksheetQuestions, tripOrder } = await import("@/lib/worksheet");
    const list = ["efes", "milet", "priene", "didim"]
      .map((s) => getSite(s))
      .filter((s) => s !== undefined);
    const a = worksheetQuestions(list, 3, "tr", 7);
    expect(a.length).toBeGreaterThan(list.length);
    for (const q of a) {
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
    expect(worksheetQuestions(list, 3, "tr", 7)).toEqual(a);
    const trip = tripOrder(list);
    expect(trip.map((s) => s.site.slug).sort()).toEqual(list.map((s) => s.slug).sort());
  });
});
