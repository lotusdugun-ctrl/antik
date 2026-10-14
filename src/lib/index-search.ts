import type { HeritageType, RegionId } from "@/lib/sites";

/*
 * The browse list's search params, kept apart from the list component so a
 * route's `validateSearch` can use them without pulling the site data into the
 * entry bundle.
 */

/**
 * Every filter is optional, and declared optional rather than
 * always-present-but-undefined: the router reads a required key as one the
 * caller must supply, which would force every partial `navigate({ search })`
 * to spell out all eight of them.
 */
export type IndexSearch = {
  q?: string | undefined;
  region?: RegionId | undefined;
  province?: string | undefined;
  civ?: string | undefined;
  /** Ancient city, museum, mosque, cave… — see `HeritageType`. */
  type?: HeritageType | undefined;
  unesco?: boolean | undefined;
  free?: boolean | undefined;
  view?: "list" | "map" | undefined;
};

/** Shared by all four routes, so their URLs stay interchangeable. */
export function parseIndexSearch(search: Record<string, unknown>): IndexSearch {
  return {
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    region: typeof search["region"] === "string" ? (search["region"] as RegionId) : undefined,
    province: typeof search["province"] === "string" ? search["province"] : undefined,
    civ: typeof search["civ"] === "string" ? search["civ"] : undefined,
    type: typeof search["type"] === "string" ? (search["type"] as HeritageType) : undefined,
    unesco: search["unesco"] === true || search["unesco"] === "true" ? true : undefined,
    free: search["free"] === true || search["free"] === "true" ? true : undefined,
    view: search["view"] === "map" ? "map" : undefined,
  };
}

/**
 * Folds text for matching typed queries against names.
 *
 * Case-folding alone fails on Turkish: in English "İstanbul" lowercases to
 * "i̇stanbul" (with a combining dot) and "Istanbul" typed on a Turkish keyboard
 * lowercases to "ıstanbul", so neither matched "istanbul". Every dotted and
 * dotless i becomes a plain i, and diacritics are dropped, so "nevsehir",
 * "goreme" and "İvriz" all find what a visitor without a Turkish keyboard
 * means.
 */
export function foldForSearch(text: string): string {
  return text.replace(/[İIı]/g, "i").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
