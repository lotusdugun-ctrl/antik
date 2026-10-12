import { guideForSite } from "@/lib/guide-sources";
import { pick, type Lang, type Localized } from "@/lib/i18n";
import type { Chapter, Guide } from "@/lib/narration";
import type { Site } from "@/lib/sites";

export type Leg = { km: number; min: number };

const ALL: Lang[] = ["tr", "en", "de", "ru"];

/** How many chapters of each stop's guide "Highlights" keeps. */
export const HIGHLIGHT_CHAPTERS = 3;

function announce(index: number, site: Site, leg: Leg | undefined, first: boolean): Localized {
  const n = index + 1;
  const tr = pick(site.name, "tr");
  const en = pick(site.name, "en");
  const de = pick(site.name, "de");
  const ru = pick(site.name, "ru");
  if (first || !leg) {
    return {
      tr: `Durak ${n}: ${tr}.`,
      en: `Stop ${n}: ${en}.`,
      de: `Station ${n}: ${de}.`,
      ru: `Остановка ${n}: ${ru}.`,
    };
  }
  return {
    tr: `Sıradaki durak, ${n}. durak: ${tr}. Önceki duraktan yaklaşık ${leg.km} kilometre, ${leg.min} dakika.`,
    en: `Next, stop ${n}: ${en}. About ${leg.km} kilometres and ${leg.min} minutes from the last stop.`,
    de: `Als Nächstes Station ${n}: ${de}. Etwa ${leg.km} Kilometer und ${leg.min} Minuten von der letzten Station.`,
    ru: `Следующая остановка ${n}: ${ru}. Примерно ${leg.km} километров и ${leg.min} минут от предыдущей.`,
  };
}

/**
 * One guide for a whole route: each stop's own guide in order, with a short
 * announcement of the next place and how far it is. The borrowed chapters keep
 * pointing at their original recordings (`source`), so a site recorded with a
 * studio voice still plays that file inside the route.
 *
 * `legs[i]` is the drive from stop i to stop i + 1, as `buildRoute` returns.
 */
export function routeGuide(
  stops: Site[],
  legs: Leg[],
  options: { highlights?: boolean } = {},
): Guide {
  const chapters: Chapter[] = [];
  let langs = [...ALL];

  stops.forEach((site, i) => {
    const guide = guideForSite(site.slug);
    const own = guide
      ? options.highlights
        ? guide.chapters.slice(0, HIGHLIGHT_CHAPTERS)
        : guide.chapters
      : [];
    if (guide) langs = langs.filter((l) => guide.langs.includes(l));

    const intro = announce(i, site, legs[i - 1], i === 0);
    chapters.push({ id: `${site.slug}~stop`, title: site.name, text: intro });
    for (const chapter of own) {
      chapters.push({
        ...chapter,
        id: `${site.slug}~${chapter.id}`,
        title: Object.fromEntries(
          ALL.map((l) => [l, `${pick(site.name, l)} · ${pick(chapter.title, l)}`]),
        ) as Localized,
        source: chapter.source ?? { key: guide!.key, id: chapter.id },
      });
    }
  });

  return {
    key: `route:${stops.map((s) => s.slug).join(",")}:${options.highlights ? "h" : "f"}`,
    title: {
      tr: "Rota rehberi",
      en: "Route guide",
      de: "Routenführer",
      ru: "Гид по маршруту",
    },
    chapters,
    langs: langs.includes("tr") ? langs : ["tr", "en", ...langs],
  };
}
