import { getSite, sites, type Site } from "@/lib/sites";
import type { Localized } from "@/lib/i18n";

/**
 * Themed sets of sites.
 *
 * The filter page answers "show me everything in Muğla"; these answer the
 * question people actually arrive with — what can I see in a weekend, what
 * costs nothing, what is left of the Hittites. They are also the pages worth
 * indexing: a single URL for "Lycia in a weekend" beats a query string.
 *
 * A collection is either a hand-ordered list, where the order is the itinerary
 * and matters, or a rule, where the set has to stay in step with the data.
 */
export type Collection = {
  id: string;
  title: Localized;
  blurb: Localized;
  /** Hand-picked and ordered. Unknown slugs are dropped, not rendered blank. */
  slugs?: readonly string[];
  /** Derived from the data instead, for sets that must not drift. */
  rule?: (site: Site) => boolean;
  /** How a derived collection orders itself; hand-picked ones keep their order. */
  sort?: (a: Site, b: Site) => number;
};

const byPopularity = (a: Site, b: Site) => b.popularity - a.popularity;

export const collections: Collection[] = [
  {
    id: "likya-hafta-sonu",
    title: { tr: "Likya'da bir hafta sonu", en: "A weekend in Lycia" },
    blurb: {
      tr: "Kaya mezarları, birlik meclisi ve deniz kenarındaki tiyatrolar — Fethiye ile Antalya arasına sığan bir güzergâh.",
      en: "Rock tombs, a federal assembly and theatres by the sea — an itinerary that fits between Fethiye and Antalya.",
    },
    slugs: [
      "tlos",
      "pinara",
      "xanthos",
      "letoon",
      "patara",
      "myra",
      "limyra",
      "arykanda",
      "olympos",
      "phaselis",
    ],
  },
  {
    id: "ege-klasikleri",
    title: { tr: "Ege'nin klasikleri", en: "The Aegean classics" },
    blurb: {
      tr: "Mermer caddeler, kütüphaneler ve dünyanın ilk parasının basıldığı kent. Bir haftalık klasik Ege turu.",
      en: "Marble streets, libraries and the city that struck the world's first coins: the classic week in the Aegean.",
    },
    slugs: [
      "efes",
      "pergamon",
      "priene",
      "milet",
      "didyma",
      "aphrodisias",
      "hierapolis",
      "laodikeia",
      "sardes",
    ],
  },
  {
    id: "tarimdan-once",
    title: { tr: "Tarımdan önce", en: "Before farming" },
    blurb: {
      tr: "Henüz çanak çömlek, tekerlek ve yazı yokken yapılanlar. İnsanlığın yerleşik hayata geçişini anlatan yerler.",
      en: "Built before pottery, the wheel or writing — the places that tell how people came to settle down.",
    },
    slugs: ["gobeklitepe", "karahan-tepe", "nevali-cori", "asikli-hoyuk", "catalhoyuk"],
  },
  {
    id: "hitit-izinde",
    title: { tr: "Hititlerin izinde", en: "On the Hittite trail" },
    blurb: {
      tr: "Başkentten arşiv kentlerine, aslanlı kapılardan çift dilli yazıtlara: Anadolu'nun ilk imparatorluğu.",
      en: "From the capital to the archive cities, from lion gates to bilingual inscriptions: Anatolia's first empire.",
    },
    slugs: ["hattusa", "sapinuwa", "alacahoyuk", "kultepe", "karatepe", "carchemish", "sam-al"],
  },
  {
    id: "urartu-kaleleri",
    title: { tr: "Urartu kaleleri", en: "Fortresses of Urartu" },
    blurb: {
      tr: "Van Gölü çevresindeki yüksek kaleler, kayaya oyulmuş kral mezarları ve çivi yazılı yıllıklar.",
      en: "High fortresses around Lake Van, rock-cut royal tombs and cuneiform annals.",
    },
    slugs: ["tuspa", "cavustepe", "ayanis", "altintepe", "palu"],
  },
  {
    id: "denize-bakanlar",
    title: { tr: "Denize bakanlar", en: "Facing the sea" },
    blurb: {
      tr: "Limanı, burnu ve kumsalı olan antik kentler. Yüzmeyi geziye katmak isteyenler için.",
      en: "Ancient cities with a harbour, a headland or a beach — for anyone who wants a swim in the itinerary.",
    },
    slugs: [
      "knidos",
      "assos",
      "phaselis",
      "olympos",
      "side",
      "anemurium",
      "elaiussa-sebaste",
      "amastris",
      "sinope",
      "kaunos",
    ],
  },
  {
    id: "antalya-bir-gun",
    title: { tr: "Antalya'dan bir günlük", en: "A day out from Antalya" },
    blurb: {
      tr: "Şehirden bir saat içindeki dört büyük kent: bir tiyatro, bir stadyum, bir liman ve bir kartal yuvası.",
      en: "Four great cities within an hour of the city: a theatre, a stadium, a harbour and an eagle's nest.",
    },
    slugs: ["perge", "aspendos", "side", "termessos"],
  },
  {
    id: "kayip-harikalar",
    title: { tr: "Kayıp harikalar", en: "Lost wonders" },
    blurb: {
      tr: "Bir zamanlar dünyanın en görkemli yapıları buradaydı. Bugün geriye kalan, temeller ve tek bir sütun.",
      en: "Some of the most magnificent buildings in the world stood here. What is left is foundations and a single column.",
    },
    slugs: ["efes", "halikarnassos", "kyzikos", "didyma", "magnesia", "nemrut"],
  },
  {
    id: "ucretsiz",
    title: { tr: "Ücretsiz ören yerleri", en: "Sites that cost nothing" },
    blurb: {
      tr: "Girişi ücretsiz olan antik kentler. Çoğu açık arazidir; erken git, gölge az olur.",
      en: "Ancient cities with no entry fee. Most are open ground: go early, there is little shade.",
    },
    rule: (site) => site.fee === 0,
    sort: byPopularity,
  },
  {
    id: "unesco",
    title: { tr: "UNESCO Dünya Mirası", en: "UNESCO World Heritage" },
    blurb: {
      tr: "Türkiye'den UNESCO Dünya Mirası Listesi'ne girmiş antik kentler ve höyükler.",
      en: "The ancient cities and mounds in Türkiye inscribed on the UNESCO World Heritage List.",
    },
    rule: (site) => site.unesco === "listed",
    sort: byPopularity,
  },
];

export function getCollection(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}

export function collectionSites(collection: Collection): Site[] {
  if (collection.slugs) {
    return collection.slugs.map(getSite).filter((site): site is Site => site !== undefined);
  }
  const matched = collection.rule ? sites.filter(collection.rule) : [];
  return collection.sort ? [...matched].sort(collection.sort) : matched;
}
