import { civilizationFor, civilizations } from "@/lib/civilizations";
import type { Civilization, Person } from "@/lib/history-types";
import type { Lang } from "@/lib/i18n";
import { people, personFor } from "@/lib/people";
import { sites, type Site } from "@/lib/sites";

/**
 * The links between places, peoples and persons, and the timeline built on
 * them. A site carries no dates of its own; its span on the timeline is the
 * span of the civilizations it is tagged with. That is coarse — a site tagged
 * "Roma" was not necessarily occupied for all five centuries — and the
 * timeline page says so.
 */

export function sitesOf(civ: Civilization): Site[] {
  return sites
    .filter((site) => site.civilizations.some((value) => civ.matches.includes(value)))
    .sort((a, b) => b.popularity - a.popularity);
}

export function sitesOfPerson(person: Person): Site[] {
  return sites
    .filter((site) => site.figures.some((value) => person.matches.includes(value)))
    .sort((a, b) => b.popularity - a.popularity);
}

export function peopleOf(civ: Civilization): Person[] {
  return people.filter((person) => person.civilizations.includes(civ.id));
}

/** The civilization entries a site is tagged with, deduplicated, oldest first. */
export function civilizationsOfSite(site: Site): Civilization[] {
  const found = new Map<string, Civilization>();
  for (const value of site.civilizations) {
    const civ = civilizationFor(value);
    if (civ) found.set(civ.id, civ);
  }
  return [...found.values()].sort((a, b) => a.start - b.start);
}

export function peopleOfSite(site: Site): Person[] {
  const found = new Map<string, Person>();
  for (const value of site.figures) {
    const person = personFor(value);
    if (person) found.set(person.id, person);
  }
  return [...found.values()].sort((a, b) => a.start - b.start);
}

export function siteSpan(site: Site): { start: number; end: number } | undefined {
  const civs = civilizationsOfSite(site);
  if (civs.length === 0) return undefined;
  return {
    start: Math.min(...civs.map((c) => c.start)),
    end: Math.max(...civs.map((c) => c.end)),
  };
}

export function civilizationsAt(year: number): Civilization[] {
  return civilizations.filter((civ) => civ.start <= year && year <= civ.end);
}

/** Sites tagged with a civilization that was there in `year`. */
export function sitesAt(year: number): Site[] {
  const active = new Set(civilizationsAt(year).flatMap((civ) => civ.matches));
  return sites
    .filter((site) => site.civilizations.some((value) => active.has(value)))
    .sort((a, b) => b.popularity - a.popularity);
}

const ERA: Record<Lang, { bce: string; ce: string; before: boolean }> = {
  tr: { bce: "MÖ", ce: "MS", before: true },
  en: { bce: "BCE", ce: "CE", before: false },
  de: { bce: "v. Chr.", ce: "n. Chr.", before: false },
  ru: { bce: "до н. э.", ce: "н. э.", before: false },
};

/** -546 → "MÖ 546" / "546 BCE"; 1453 → "1453" (the era is only said before 500 CE). */
export function formatYear(year: number, lang: Lang): string {
  const era = ERA[lang];
  const abs = Math.abs(Math.round(year));
  // Years are not grouped ("1453", never "1.453"); only prehistory's five
  // digits are, as "10.000" / "10,000".
  const n = abs < 10000 ? String(abs) : abs.toLocaleString(lang === "en" ? "en-US" : lang);
  if (year >= 500) return n;
  const label = year < 0 ? era.bce : era.ce;
  return era.before ? `${label} ${n}` : `${n} ${label}`;
}

/*
 * The timeline's scale. Linear time would spend nine tenths of the width on
 * the Stone Age, so it is piecewise: prehistory is squeezed, the Bronze Age
 * onward gets the room. Position runs 0 → 1.
 */
const STOPS: [year: number, pos: number][] = [
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

export function yearToPos(year: number): number {
  const y = Math.min(TIMELINE_END, Math.max(TIMELINE_START, year));
  for (let i = 1; i < STOPS.length; i += 1) {
    const [y1, p1] = STOPS[i]!;
    const [y0, p0] = STOPS[i - 1]!;
    if (y <= y1) return p0 + ((y - y0) / (y1 - y0)) * (p1 - p0);
  }
  return 1;
}

export function posToYear(pos: number): number {
  const p = Math.min(1, Math.max(0, pos));
  for (let i = 1; i < STOPS.length; i += 1) {
    const [y1, p1] = STOPS[i]!;
    const [y0, p0] = STOPS[i - 1]!;
    if (p <= p1) {
      const year = y0 + ((p - p0) / (p1 - p0)) * (y1 - y0);
      // Round to a step that suits the scale: millennia far back, decades late.
      const step = year < -5000 ? 500 : year < -1000 ? 50 : year < 0 ? 25 : 10;
      return Math.round(year / step) * step;
    }
  }
  return TIMELINE_END;
}

/** Labelled ticks under the timeline. */
export const TIMELINE_TICKS = [-10000, -3000, -2000, -1000, -500, 0, 500, 1000, 1500, 1923];
