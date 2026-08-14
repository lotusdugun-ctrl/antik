import { siteDetails } from "@/lib/site-details";
import { coverImage, sites, type Site } from "@/lib/sites";
import type { Localized } from "@/lib/i18n";

const structuresOf = (site: Site): Localized[] => siteDetails[site.slug]?.structures ?? [];

export type QuizMode = "photo" | "who" | "tf" | "map" | "structure";

export type Question = {
  mode: QuizMode;
  /** Slug of the site the question is about, so callers can avoid repeats. */
  slug: string;
  prompt: string;
  image?: string;
  options: string[];
  answer: string;
};

export type Localize = (value: Localized) => string;

/**
 * Source of randomness, injected rather than reached for.
 *
 * The mini games want a different question every time, but the daily challenge
 * has to hand every player on earth the same five questions — which is only
 * possible if the whole builder draws from one replaceable stream instead of
 * calling `Math.random` in five places.
 */
export type Rng = () => number;

const OPTION_COUNT = 4;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Which sites list each structure, counted per language.
 *
 * The reason this index exists: "Tiyatro" appears in 32 of the 100 sites,
 * "Agora" in 28, "Stadyum" in 10. Asking *which city has a theatre* has no
 * single right answer, so the structure round may only ever use a name that
 * belongs to exactly one site.
 *
 * Both languages are counted because uniqueness does not survive translation:
 * "Büyük Tiyatro" and "Tiyatro" are two names in Turkish but collapse toward
 * the same English one, so a structure unique in Turkish can still be shared
 * in English. A name qualifies only if it is unique in both.
 */
const structureOwners = (() => {
  const index = new Map<string, string[]>();
  const add = (key: string, slug: string) => {
    const owners = index.get(key);
    if (owners) owners.push(slug);
    else index.set(key, [slug]);
  };
  for (const site of sites) {
    for (const structure of structuresOf(site)) {
      add(`tr:${structure.tr}`, site.slug);
      add(`en:${structure.en}`, site.slug);
    }
  }
  return index;
})();

function structureIsUnique(structure: Localized) {
  return (
    structureOwners.get(`tr:${structure.tr}`)?.length === 1 &&
    structureOwners.get(`en:${structure.en}`)?.length === 1
  );
}

/** Same problem, same fix: a figure tied to two cities identifies neither. */
const figureOwners = (() => {
  const index = new Map<string, string[]>();
  for (const site of sites) {
    for (const figure of site.figures) {
      const owners = index.get(figure);
      if (owners) owners.push(site.slug);
      else index.set(figure, [site.slug]);
    }
  }
  return index;
})();

const sitesWithUniqueStructure = sites.filter((site) => structuresOf(site).some(structureIsUnique));

const sitesWithUniqueFigure = sites.filter((site) =>
  site.figures.some((f) => figureOwners.get(f)?.length === 1),
);

/**
 * Distractors that are wrong *and* look it. `axisOf` returns the value the
 * question is actually testing — a city name, a province — and every option
 * must differ from the answer and from the others on that axis. Without this
 * the same province could appear twice among four options, with only one of
 * the two scored correct.
 */
function pickDistractors(
  pool: Site[],
  target: Site,
  axisOf: (site: Site) => string,
  rng: Rng,
  count = OPTION_COUNT - 1,
): Site[] {
  const answer = axisOf(target);
  const taken = new Set([answer]);
  const chosen: Site[] = [];
  for (const site of shuffle(pool, rng)) {
    if (chosen.length === count) break;
    const value = axisOf(site);
    if (taken.has(value)) continue;
    taken.add(value);
    chosen.push(site);
  }
  return chosen;
}

function choose<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)]!;
}

/** Prefers a site the player has not just been asked about. */
function pickTarget(pool: Site[], recent: ReadonlySet<string>, rng: Rng): Site {
  const fresh = pool.filter((s) => !recent.has(s.slug));
  return choose(fresh.length > 0 ? fresh : pool, rng);
}

export function buildQuestion(
  mode: QuizMode,
  L: Localize,
  recent: ReadonlySet<string> = new Set(),
  rng: Rng = Math.random,
): Question {
  const byName = (site: Site) => L(site.name);
  const byProvince = (site: Site) => L(site.province);

  if (mode === "who") {
    const target = pickTarget(sitesWithUniqueFigure, recent, rng);
    const figure = choose(
      target.figures.filter((f) => figureOwners.get(f)?.length === 1),
      rng,
    );
    const distractors = pickDistractors(sites, target, byName, rng);
    return {
      mode,
      slug: target.slug,
      prompt: figure,
      options: shuffle([target, ...distractors].map(byName), rng),
      answer: byName(target),
    };
  }

  if (mode === "tf") {
    const target = pickTarget(sites, recent, rng);
    const claimTruth = rng() < 0.5;
    // The false variant needs a province that genuinely is not this site's —
    // drawing one at random can land on another site in the same province and
    // produce a true statement marked false.
    const elsewhere = sites.filter((s) => L(s.province) !== byProvince(target));
    const province = claimTruth || elsewhere.length === 0 ? target : choose(elsewhere, rng);
    const isTrue = byProvince(province) === byProvince(target);
    return {
      mode,
      slug: target.slug,
      prompt: `${byName(target)} · ${byProvince(province)}`,
      options: ["✓", "✗"],
      answer: isTrue ? "✓" : "✗",
    };
  }

  if (mode === "map") {
    const target = pickTarget(sites, recent, rng);
    const distractors = pickDistractors(sites, target, byProvince, rng);
    return {
      mode,
      slug: target.slug,
      prompt: byName(target),
      options: shuffle([target, ...distractors].map(byProvince), rng),
      answer: byProvince(target),
    };
  }

  if (mode === "structure") {
    const target = pickTarget(sitesWithUniqueStructure, recent, rng);
    const structure = choose(structuresOf(target).filter(structureIsUnique), rng);
    const distractors = pickDistractors(sites, target, byName, rng);
    return {
      mode,
      slug: target.slug,
      prompt: L(structure),
      options: shuffle([target, ...distractors].map(byName), rng),
      answer: byName(target),
    };
  }

  const target = pickTarget(sites, recent, rng);
  const distractors = pickDistractors(sites, target, byName, rng);
  return {
    mode: "photo",
    slug: target.slug,
    prompt: byProvince(target),
    image: coverImage(target),
    options: shuffle([target, ...distractors].map(byName), rng),
    answer: byName(target),
  };
}
