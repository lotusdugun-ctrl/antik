import type { Lang, Localized } from "@/lib/i18n";
import type { Reconstruction } from "@/lib/reconstructions";
import { heritageTypeName, type Site } from "@/lib/sites";
import type { SiteDetail } from "@/lib/site-details";

/**
 * The audio guide's script.
 *
 * Nothing in here is new writing about a site. Every sentence a visitor hears
 * is one the page already shows — the summary, the history, the structure
 * blurbs, the facts — put in the order a guide would say them and joined by a
 * few spoken connectives. That is deliberate: the page's text has been checked
 * and corrected over many commits, and a narration that paraphrased it would
 * be a second, unchecked version of the same claims.
 *
 * A guide is a list of chapters so the player can skip, show where it is, and
 * — on a reconstruction — turn the camera to the part being described.
 */
export type Chapter = {
  /** Stable within a guide; used for pre-recorded file names. */
  id: string;
  title: Localized;
  text: Localized;
  /** On a reconstruction tour: the hotspot index the camera should face. */
  hotspot?: number;
};

export type Guide = {
  /** `site:<slug>` or `recon:<id>`; the key pre-recorded audio is filed under. */
  key: string;
  title: Localized;
  chapters: Chapter[];
};

const l = (tr: string, en: string): Localized => ({ tr, en });

/** A sentence ends with a full stop, so two joined texts never run together. */
function sentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function join(...parts: (string | undefined)[]): string {
  return parts
    .map((part) => (part ? sentence(part) : ""))
    .filter(Boolean)
    .join(" ");
}

function both(fn: (lang: Lang) => string): Localized {
  return { tr: fn("tr"), en: fn("en") };
}

/** Lowercase the first letter, for a type name dropped mid-sentence. */
function lower(text: string, lang: Lang): string {
  if (!text) return text;
  return text.charAt(0).toLocaleLowerCase(lang === "tr" ? "tr-TR" : "en-GB") + text.slice(1);
}

function list(items: string[], lang: Lang): string {
  if (items.length <= 1) return items.join("");
  const and = lang === "tr" ? " ve " : " and ";
  return `${items.slice(0, -1).join(", ")}${and}${items.at(-1)}`;
}

/**
 * The page's facts were written in different passes and a few say the same
 * thing twice in different words. Read aloud, that is a guide repeating
 * itself, so a fact sharing most of its words with an earlier one is dropped.
 */
function distinct(facts: Localized[]): Localized[] {
  const words = (text: string) =>
    new Set(
      text
        .toLocaleLowerCase("en")
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length > 3),
    );
  const kept: { fact: Localized; words: Set<string> }[] = [];
  for (const fact of facts) {
    const own = words(fact.en);
    const repeat = kept.some((k) => {
      let shared = 0;
      for (const w of own) if (k.words.has(w)) shared += 1;
      return shared / Math.max(1, Math.min(own.size, k.words.size)) > 0.6;
    });
    if (!repeat) kept.push({ fact, words: own });
  }
  return kept.map((k) => k.fact);
}

export type StructureBlurb = (name: Localized) => Localized | undefined;

/**
 * A site's guide: welcome, history, one chapter per named structure, the
 * facts, and a goodbye. Structures without a curated blurb are still named —
 * a guide that skipped the Faustina Baths because nobody had written it up
 * yet would be leaving a building out of the walk.
 */
export function siteGuide(
  site: Site,
  detail: SiteDetail | undefined,
  facts: Localized[],
  blurbFor: StructureBlurb,
): Guide {
  const chapters: Chapter[] = [];
  const type = heritageTypeName(site.heritageType);

  const article = (name: string) => (/^[aeiou]/i.test(name) ? "an" : "a");
  chapters.push({
    id: "intro",
    title: l("Hoş geldiniz", "Welcome"),
    text: both((lang) =>
      join(
        lang === "tr"
          ? `${site.name.tr} sesli rehberine hoş geldiniz. Burası ${site.province.tr} ilinde bir ${lower(type.tr, "tr")}`
          : `Welcome to the audio guide to ${site.name.en}, ${article(type.en)} ${lower(type.en, "en")} in ${site.province.en} province`,
        lang === "tr" ? `Dönemi: ${site.era.tr}` : `Its period: ${site.era.en}`,
        site.summary[lang],
      ),
    ),
  });

  if (detail) {
    chapters.push({
      id: "history",
      title: l("Tarihçe", "History"),
      text: both((lang) => detail.history[lang]),
    });

    // A structure with something to say gets a chapter of its own; the rest
    // are named together, rather than padded out with filler a guide would
    // never actually say.
    const unspoken: Localized[] = [];
    detail.structures.forEach((structure, index) => {
      const blurb = blurbFor(structure);
      if (!blurb) {
        unspoken.push(structure);
        return;
      }
      chapters.push({
        id: `structure-${index + 1}`,
        title: structure,
        text: both((lang) => join(structure[lang], blurb[lang])),
      });
    });
    if (unspoken.length > 0) {
      chapters.push({
        id: "highlights",
        title: l("Görülecekler", "What to see"),
        text: both((lang) =>
          join(
            lang === "tr"
              ? `${unspoken.length > 1 ? "Gezerken şunları kaçırmayın" : "Gezerken şunu kaçırmayın"}: ${list(
                  unspoken.map((u) => u.tr),
                  "tr",
                )}`
              : `As you walk round, don't miss ${list(
                  unspoken.map((u) => `the ${u.en}`),
                  "en",
                )}`,
          ),
        ),
      });
    }
  }

  const allFacts = distinct([...(detail ? [detail.funFact] : []), ...facts]);
  if (allFacts.length > 0) {
    chapters.push({
      id: "facts",
      title: l("Biliyor muydunuz?", "Did you know?"),
      text: both((lang) =>
        join(
          lang === "tr" ? "Biliyor muydunuz?" : "Did you know?",
          ...allFacts.map((f) => f[lang]),
        ),
      ),
    });
  }

  chapters.push({
    id: "outro",
    title: l("Kapanış", "Farewell"),
    text: both((lang) => {
      const museum = site.heritageType === "museum";
      return lang === "tr"
        ? join(
            `${site.name.tr} turumuz burada sona eriyor`,
            museum
              ? "Eserlere dokunmamaya ve flaşsız fotoğraf çekmeye özen gösterin. İyi gezmeler"
              : "Kalıntılara dokunmamaya, işaretli yollarda kalmaya ve yanınızda su bulundurmaya özen gösterin. İyi gezmeler",
          )
        : join(
            `This brings our tour of ${site.name.en} to an end`,
            museum
              ? "Please leave the objects untouched and take photographs without flash. Enjoy your visit"
              : "Please leave the stones untouched, keep to the marked paths and carry water. Enjoy your visit",
          );
    }),
  });

  return { key: `site:${site.slug}`, title: site.name, chapters };
}

/**
 * A reconstruction's guide: the blurb, then each hotspot in turn — the camera
 * follows, so a hotspot's chapter carries its index — and, last and spoken
 * aloud like everything else, what the model does not know.
 */
export function reconstructionGuide(item: Reconstruction): Guide {
  const chapters: Chapter[] = [
    {
      id: "intro",
      title: item.title,
      text: both((lang) => join(item.title[lang], item.period[lang], item.blurb[lang])),
    },
    ...item.hotspots.map((spot, index): Chapter => ({
      id: `spot-${index + 1}`,
      title: spot.label,
      text: both((lang) => join(spot.label[lang], spot.note[lang])),
      hotspot: index,
    })),
    {
      id: "uncertainty",
      title: l("Bilinmeyenler", "What we don't know"),
      text: both((lang) =>
        join(
          lang === "tr"
            ? "Son olarak, bu modelin bilmediği şeyler"
            : "Finally, what this model does not know",
          item.uncertainty[lang],
        ),
      ),
    },
  ];
  return { key: `recon:${item.id}`, title: item.title, chapters };
}

/**
 * Speech engines cut long utterances short (Chrome stops after about fifteen
 * seconds of one), and a pause button that can only act between chapters is
 * useless. So a chapter is spoken a sentence or two at a time, never more than
 * `max` characters.
 */
export function speakableChunks(text: string, max = 220): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]+["'”’)]*\s*|[^.!?…]+$/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const raw of sentences) {
    const piece = raw.trim();
    if (!piece) continue;
    if (piece.length > max) {
      if (current) chunks.push(current);
      current = "";
      // A sentence too long on its own is split at its commas and semicolons.
      let rest = "";
      for (const clause of piece.split(/(?<=[,;:])\s+/)) {
        if ((rest + " " + clause).trim().length > max && rest) {
          chunks.push(rest.trim());
          rest = clause;
        } else {
          rest = `${rest} ${clause}`.trim();
        }
      }
      if (rest) chunks.push(rest);
      continue;
    }
    if (`${current} ${piece}`.trim().length > max && current) {
      chunks.push(current);
      current = piece;
    } else {
      current = `${current} ${piece}`.trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Rough spoken length, for the chapter list: ~14 characters a second. */
export function estimateSeconds(text: string, rate = 1): number {
  return Math.max(3, Math.round(text.length / 14 / rate));
}
