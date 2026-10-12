import { pick, type Lang } from "@/lib/i18n";
import { factsFor } from "@/lib/site-facts";
import { getSiteDetail } from "@/lib/site-details";
import { distanceKm, sites, type Site } from "@/lib/sites";

/**
 * Teacher mode: a printable worksheet for a class trip or lesson.
 *
 * Questions are built only from facts the data states plainly (province,
 * founding era, structures), with distractors checked against the right
 * answer so no question has two correct options. A seed makes the sheet
 * reproducible: the same selection and seed print the same questions, so a
 * teacher can hand out copies made on different days.
 */
export type WorksheetQuestion = {
  site: string;
  prompt: string;
  options: string[];
  answer: number;
};

/** Mulberry32: small, fast, good enough to shuffle a worksheet. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Three wrong answers from other sites, distinct from the right one and each other. */
function distractors(right: string, pool: string[], rng: () => number): string[] | null {
  const norm = (s: string) => s.toLocaleLowerCase("tr").trim();
  const seen = new Set([norm(right)]);
  const out: string[] = [];
  for (const candidate of shuffle(pool, rng)) {
    if (!candidate || seen.has(norm(candidate))) continue;
    seen.add(norm(candidate));
    out.push(candidate);
    if (out.length === 3) return out;
  }
  return null;
}

const PROMPTS: Record<Lang, { province: string; era: string; structure: string }> = {
  tr: {
    province: "{site} hangi ildedir?",
    era: "{site} hangi dönemde kurulmuştur?",
    // Phrased without a suffix on the name: "Efes'te" but "Priene'de".
    structure: "{site}: Aşağıdaki yapılardan hangisi burada bulunur?",
  },
  en: {
    province: "In which province is {site}?",
    era: "When was {site} founded?",
    structure: "Which of these structures is at {site}?",
  },
  de: {
    province: "In welcher Provinz liegt {site}?",
    era: "Wann wurde {site} gegründet?",
    structure: "Welches dieser Bauwerke befindet sich in {site}?",
  },
  ru: {
    province: "В какой провинции находится {site}?",
    era: "Когда был основан {site}?",
    structure: "Какое из этих сооружений находится в {site}?",
  },
};

/*
 * Kinds of building most ancient cities had. A distractor named only by its
 * kind ("Two harbours", "Workshops") may be true of the site in question
 * even if the data does not list it, so such names are never offered.
 */
const GENERIC =
  /liman|sur|nekropol|mezar|agora|tiyatro|hamam|tapına|kilise|cami|stadyum|sarnıç|kemer|çeşme|işlik|ev(ler)?\b|kapı|cadde|yol|kazı|alan|villa|kule|şehir|konak|depo|yapı|mozaik|harbo|wall|necropol|tomb|theat|bath|temple|church|mosque|stadium|cistern|aqueduct|fountain|workshop|house|gate|street|road|excavation|tower|city|mosaic|building|site\b/;

function build(
  site: Site,
  kind: "province" | "era" | "structure",
  lang: Lang,
  rng: () => number,
): WorksheetQuestion | null {
  const L = (v: { tr: string; en: string }) => pick(v, lang);
  // Distractors come from the same kind of place: a ruin's founding era
  // offered against a museum's opening year gives the answer away.
  const others = sites.filter((s) => s.slug !== site.slug && s.heritageType === site.heritageType);
  let right: string | undefined;
  let pool: string[] = [];

  if (kind === "province") {
    right = L(site.province);
    pool = others.map((s) => L(s.province));
  } else if (kind === "era") {
    right = L(site.era);
    pool = others.map((s) => L(s.era));
  } else {
    const own = getSiteDetail(site.slug)?.structures.map(L) ?? [];
    const ownSet = new Set(own.map((s) => s.toLocaleLowerCase("tr")));
    // A name another site also has ("Tiyatro") could be right for both;
    // only ask about one that belongs to this site alone.
    const elsewhere = new Set(
      others.flatMap(
        (s) => getSiteDetail(s.slug)?.structures.map((x) => L(x).toLocaleLowerCase("tr")) ?? [],
      ),
    );
    const unique = own.filter((s) => !elsewhere.has(s.toLocaleLowerCase("tr")));
    if (unique.length === 0) return null;
    right = unique[Math.floor(rng() * unique.length)]!;
    // Only names that belong to one other site each: a generic "City walls"
    // offered as wrong could well be standing at this site too.
    const counts = new Map<string, number>();
    for (const name of sites.flatMap((s) => getSiteDetail(s.slug)?.structures.map(L) ?? [])) {
      const k = name.toLocaleLowerCase("tr");
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    // And from another region: a Serapeion listed for one Aegean city may
    // well have stood in its neighbour too, even if the data does not say so.
    pool = others
      .filter((s) => s.region !== site.region)
      .flatMap((s) => getSiteDetail(s.slug)?.structures.map(L) ?? [])
      .filter(
        (s) =>
          !ownSet.has(s.toLocaleLowerCase("tr")) &&
          counts.get(s.toLocaleLowerCase("tr")) === 1 &&
          !GENERIC.test(s.toLocaleLowerCase("tr")),
      );
  }

  const wrong = right ? distractors(right, pool, rng) : null;
  if (!right || !wrong) return null;
  const options = shuffle([right, ...wrong], rng);
  return {
    site: site.slug,
    prompt: PROMPTS[lang][kind].replace("{site}", L(site.name)),
    options,
    answer: options.indexOf(right),
  };
}

export function worksheetQuestions(
  list: Site[],
  perSite: number,
  lang: Lang,
  seed: number,
): WorksheetQuestion[] {
  const rng = seeded(seed);
  const kinds = ["structure", "province", "era"] as const;
  return list.flatMap((site) => {
    const out: WorksheetQuestion[] = [];
    for (const kind of shuffle([...kinds], rng)) {
      if (out.length >= perSite) break;
      const q = build(site, kind, lang, rng);
      if (q) out.push(q);
    }
    return out;
  });
}

/** A reading line per site: the start of its history plus one fact. */
export function readingFor(site: Site, lang: Lang): { history: string; fact: string | undefined } {
  const detail = getSiteDetail(site.slug);
  const history = detail ? pick(detail.history, lang) : pick(site.summary, lang);
  const fact = factsFor(site.slug)[0];
  return { history, fact: fact ? pick(fact, lang) : undefined };
}

/**
 * Visiting order for a trip: nearest neighbour from the first site. Not the
 * shortest tour, but sensible for the handful of stops a class makes, and it
 * never doubles back across the country.
 */
export function tripOrder(list: Site[]): { site: Site; km: number }[] {
  if (list.length === 0) return [];
  const left = [...list.slice(1)];
  const out = [{ site: list[0]!, km: 0 }];
  while (left.length > 0) {
    const last = out[out.length - 1]!.site;
    let best = 0;
    for (let i = 1; i < left.length; i += 1) {
      if (
        distanceKm(last.lat, last.lng, left[i]!.lat, left[i]!.lng) <
        distanceKm(last.lat, last.lng, left[best]!.lat, left[best]!.lng)
      )
        best = i;
    }
    const next = left.splice(best, 1)[0]!;
    out.push({ site: next, km: distanceKm(last.lat, last.lng, next.lat, next.lng) });
  }
  return out;
}
