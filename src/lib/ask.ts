import { guideForSite } from "@/lib/guide-sources";
import { civilizationFor, personFor, type IndexEntry } from "@/lib/history-index";
import { pick, type Lang, type Localized } from "@/lib/i18n";
import { reconstructionsFor, type Measure, type Reconstruction } from "@/lib/reconstructions";
import { factsFor } from "@/lib/site-facts";
import { getSiteDetail } from "@/lib/site-details";
import { MINISTRY_HOURS, type Site } from "@/lib/sites";

/**
 * "Ask the guide": a question in plain words, answered from the app's own
 * data and nothing else.
 *
 * There is no language model behind this, on purpose. Every answer is a
 * sentence the app already holds — a measurement with its source, the era,
 * a fact from the guide — found by matching what the question is about.
 * When nothing matches well enough it says it does not know, which is the
 * right answer for a guide that must not make things up at a ruin.
 */

export type Answer = {
  text: string;
  /** Where the answer comes from, shown under it. */
  source?: string | undefined;
  /** The matcher found nothing and says so; there is no answer to show. */
  unknown?: boolean | undefined;
};

type Intent =
  | "population"
  | "capacity"
  | "height"
  | "diameter"
  | "length"
  | "width"
  | "count"
  | "when"
  | "who"
  | "where"
  | "fee"
  | "hours"
  | "unesco"
  | "structures";

/** Lowercase and fold the letters people type without (ı→i, ş→s, ä→a, ё→е). */
export function fold(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ё/g, "е")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Cue words per intent, in the four languages, already folded. Stems rather
 * than words ("yuksek" catches yüksek, yüksekliği, yüksekliğinde).
 */
const CUES: Record<Intent, string[]> = {
  /*
   * How many lived in the city — not how many a theatre seated. "Kaç kişi
   * yaşıyordu" also contains the capacity cue "kaç kişi", so this one wins.
   */
  population: [
    "nufus",
    "yasiyor",
    "yasardi",
    "yasadi",
    "yasayan",
    "sakin",
    "population",
    "inhabitant",
    "lived",
    "live there",
    "einwohner",
    "bevolkerung",
    "lebten",
    "населен",
    "жител",
    "жило",
    "жили",
  ],
  capacity: [
    "kac kisi",
    "kisilik",
    "seyirci",
    "kapasite",
    "capacity",
    "how many people",
    "seat",
    "spectator",
    "platz",
    "zuschauer",
    "fasst",
    "вмест",
    "зрител",
  ],
  height: ["yuksek", "height", "how tall", "how high", "hoch", "hohe", "высот", "высок"],
  diameter: [" cap", "diameter", "durchmesser", "диаметр"],
  length: ["uzun", "length", "how long", "lang", "lange", "длин"],
  width: ["genis", "width", "wide", "breit", "ширин"],
  count: ["kac tane", "kac sutun", "kac sira", "how many", "wie viele", "сколько"],
  when: [
    "ne zaman",
    "kac yil",
    "hangi donem",
    "hangi yuzyil",
    "kuruldu",
    "kurulus",
    "yapildi",
    "insa",
    "when",
    "how old",
    "built",
    "century",
    "wann",
    "jahrhundert",
    "gebaut",
    "когда",
    "век",
    "построен",
  ],
  who: [
    "kim",
    "kimler",
    "medeniyet",
    "uygarlik",
    "who",
    "civilization",
    "people",
    "wer",
    "kultur",
    "кто",
    "цивилизац",
  ],
  where: [
    "nerede",
    "hangi il",
    "hangi sehir",
    "where",
    "province",
    "wo ",
    "provinz",
    "где",
    "провинц",
  ],
  fee: [
    "ucret",
    "bilet",
    "fiyat",
    "kac lira",
    "para",
    "fee",
    "ticket",
    "price",
    "cost",
    "eintritt",
    "preis",
    "билет",
    "цен",
    "стоим",
  ],
  hours: [
    "saat",
    "acik",
    "kapan",
    "ziyaret saat",
    "open",
    "hours",
    "close",
    "geoffnet",
    "offnungs",
    "часы",
    "открыт",
  ],
  unesco: ["unesco", "dunya miras", "world heritage", "welterbe", "всемирн"],
  structures: [
    "ne var",
    "neler var",
    "yapilar",
    "gorulecek",
    "what to see",
    "buildings",
    "structures",
    "sehenswurd",
    "zu sehen",
    "gebaude",
    "что посмотреть",
    "постройк",
  ],
};

/** Measurement labels, folded, that tell which dimension a measure is. */
const MEASURE_CUES: Partial<Record<Intent, string[]>> = {
  height: ["yukseklig", "height", "hohe", "высот"],
  diameter: [" cap", "diameter", "durchmesser", "диаметр"],
  length: ["uzunlug", "length", "lange", "длин"],
  width: ["genislig", "width", "breite", "ширин"],
};

/*
 * Checked in this order: the specific before the general, so "how much is a
 * ticket" is a fee question even though "how much/сколько" is also a count.
 */
const PRIORITY: Intent[] = [
  "fee",
  "hours",
  "unesco",
  "population",
  "capacity",
  "height",
  "diameter",
  "length",
  "width",
  "when",
  "who",
  "where",
  "structures",
  "count",
];

/*
 * A cue matches at the start of a word, never inside one: "wer" is German for
 * "who", but it is also the end of "tower", and "век" (century) is the middle
 * of "человек" (person). A cue's own leading space was an older way of saying
 * the same thing; a trailing one ("wo ") still means "the whole word".
 */
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const CUE_PATTERNS = Object.fromEntries(
  Object.entries(CUES).map(([intent, cues]) => [
    intent,
    cues.map((cue) => new RegExp(`(^|[^\\p{L}\\p{N}])${escape(cue.trimStart())}`, "u")),
  ]),
) as Record<Intent, RegExp[]>;

export function intentsOf(question: string): Intent[] {
  const q = ` ${fold(question)} `;
  const found = PRIORITY.filter((intent) => CUE_PATTERNS[intent].some((cue) => cue.test(q)));
  // A question about who lived there is never answered with a seat count.
  return found.includes("population")
    ? found.filter((i) => i !== "capacity" && i !== "who" && i !== "count")
    : found;
}

/** Words that make a head count a seat count, folded. */
const SEATING_WORDS =
  /(seat|capacity|spectator|theat|kisilik|seyirci|tiyatro|kapasite|zuschauer|sitzpl|theater|зрител|мест|театр)/u;

/** Words a sentence about a city's population uses, folded. */
const POPULATION_WORDS =
  /(^|\s)(nufus|sakin|population|inhabitant|resident|home to|einwohner|bevolkerung|heimat|населен|жител)/u;

function fmt(value: number, lang: Lang) {
  return value.toLocaleString(lang === "en" ? "en-US" : lang);
}

const UNIT: Record<Lang, { m: string; people: string; count: string }> = {
  tr: { m: "m", people: "kişi", count: "" },
  en: { m: "m", people: "people", count: "" },
  de: { m: "m", people: "Personen", count: "" },
  ru: { m: "м", people: "человек", count: "" },
};

function measureText(m: Measure, lang: Lang) {
  const unit = UNIT[lang][m.unit];
  return `${pick(m.label, lang)}: ${fmt(m.value, lang)}${unit ? ` ${unit}` : ""}`;
}

const SAYS = {
  tr: {
    source3d: "3D rekonstrüksiyonun ölçüleri",
    era: "Kuruluş dönemi",
    civs: "Burada iz bırakanlar",
    people: "İlgili kişiler",
    where: "konumu",
    fee: "Giriş ücreti (gösterge)",
    free: "Giriş ücretsiz.",
    feeUnknown: "Bu yer için güncel ücret bilgimiz yok; muze.gov.tr'den kontrol et.",
    hours: "Bakanlığın genel ören yeri saatleri",
    unescoYes: "UNESCO Dünya Mirası Listesi'nde.",
    unescoTent: "UNESCO Dünya Mirası Geçici Listesi'nde.",
    unescoNo: "UNESCO listesinde değil.",
    structures: "Görülecek yapılar",
    guide: "Sesli rehberden",
    facts: "Bunu biliyor muydun?",
    unknown: "Bunu bilmiyorum; bu yer için elimdeki bilgiler bu soruyu cevaplamıyor.",
  },
  en: {
    source3d: "Measurements of the 3D reconstruction",
    era: "Founded",
    civs: "Left their mark here",
    people: "People",
    where: "location",
    fee: "Entry fee (indicative)",
    free: "Entry is free.",
    feeUnknown: "We have no current fee for this place; check muze.gov.tr.",
    hours: "The ministry's general site hours",
    unescoYes: "On the UNESCO World Heritage List.",
    unescoTent: "On UNESCO's World Heritage Tentative List.",
    unescoNo: "Not on the UNESCO list.",
    structures: "What to see",
    guide: "From the audio guide",
    facts: "Did you know?",
    unknown: "I don't know; what I hold about this place does not answer that.",
  },
  de: {
    source3d: "Maße der 3D-Rekonstruktion",
    era: "Gründungszeit",
    civs: "Hier hinterließen Spuren",
    people: "Personen",
    where: "Lage",
    fee: "Eintritt (Richtwert)",
    free: "Der Eintritt ist frei.",
    feeUnknown: "Für diesen Ort haben wir keinen aktuellen Preis; siehe muze.gov.tr.",
    hours: "Allgemeine Öffnungszeiten des Ministeriums",
    unescoYes: "Auf der UNESCO-Welterbeliste.",
    unescoTent: "Auf der Tentativliste der UNESCO.",
    unescoNo: "Nicht auf der UNESCO-Liste.",
    structures: "Sehenswert",
    guide: "Aus dem Audioguide",
    facts: "Schon gewusst?",
    unknown: "Das weiß ich nicht; meine Angaben zu diesem Ort beantworten das nicht.",
  },
  ru: {
    source3d: "Размеры 3D-реконструкции",
    era: "Время основания",
    civs: "Здесь оставили след",
    people: "Личности",
    where: "расположение",
    fee: "Входной билет (ориентировочно)",
    free: "Вход бесплатный.",
    feeUnknown: "Актуальной цены для этого места нет; проверьте muze.gov.tr.",
    hours: "Общие часы работы объектов министерства",
    unescoYes: "Входит в список Всемирного наследия ЮНЕСКО.",
    unescoTent: "В предварительном списке ЮНЕСКО.",
    unescoNo: "Не входит в список ЮНЕСКО.",
    structures: "Что посмотреть",
    guide: "Из аудиогида",
    facts: "А вы знали?",
    unknown: "Я не знаю: мои сведения об этом месте на это не отвечают.",
  },
} satisfies Record<Lang, Record<string, string>>;

/** The reconstruction the question is about: one named in it, or the only one. */
function reconFor(site: Site, question: string): Reconstruction[] {
  const all = reconstructionsFor(site.slug);
  const q = fold(question);
  const named = all.filter((r) =>
    [r.structure.tr, r.structure.en, r.title.tr, r.title.en].some((name) =>
      fold(name)
        .split(" ")
        .filter((w) => w.length > 3)
        .some((w) => q.includes(w.slice(0, Math.max(4, w.length - 2)))),
    ),
  );
  return named.length > 0 ? named : all;
}

function measuresAnswer(site: Site, question: string, intent: Intent, lang: Lang): Answer | null {
  const says = SAYS[lang];
  for (const recon of reconFor(site, question)) {
    const matching = recon.measures.filter((m) => {
      if (intent === "capacity") return m.unit === "people";
      if (intent === "count") return m.unit === "count";
      const cues = MEASURE_CUES[intent] ?? [];
      const label = fold(`${m.label.tr} ${m.label.en}`);
      return m.unit === "m" && cues.some((c) => label.includes(c));
    });
    if (matching.length > 0) {
      // "How tall are the statues?" — keep the measures whose label shares
      // a word with the question, when any do.
      const allCues = Object.values(CUES)
        .flat()
        .map((c) => c.trim());
      const subject = fold(question)
        .split(" ")
        .filter((w) => w.length > 3 && !allCues.some((c) => w.startsWith(c) || c.startsWith(w)))
        .join(" ");
      const named = subject
        ? matching.filter((m) => overlap(subject, `${m.label.tr} ${m.label.en}`) > 0)
        : [];
      const shown = named.length > 0 ? named : matching;
      return {
        text: `${pick(recon.title, lang)} — ${shown.map((m) => measureText(m, lang)).join("; ")}.`,
        source: says.source3d,
      };
    }
  }
  return null;
}

/** Word overlap between the question and a sentence, ignoring short words. */
function overlap(question: string, sentence: string): number {
  const words = new Set(
    fold(question)
      .split(" ")
      .filter((w) => w.length > 3),
  );
  if (words.size === 0) return 0;
  const target = fold(sentence);
  let hits = 0;
  for (const w of words) if (target.includes(w.slice(0, Math.max(4, w.length - 3)))) hits += 1;
  return hits / words.size;
}

/** Every "Did you know?" fact and audio-guide sentence for a site, with where it is from. */
function sentencesOf(site: Site, lang: Lang): { text: string; source: string }[] {
  const says = SAYS[lang];
  const L = (value: Localized) => pick(value, lang);
  const guide = guideForSite(site.slug);
  return [
    ...factsFor(site.slug).map((fact) => ({ text: L(fact), source: says.facts })),
    ...(guide?.chapters ?? []).flatMap((chapter) =>
      L(chapter.text)
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => ({ text: sentence, source: `${says.guide}: ${L(chapter.title)}` })),
    ),
  ];
}

export function answer(site: Site, question: string, lang: Lang): Answer {
  const says = SAYS[lang];
  const L = (value: Localized) => pick(value, lang);
  const intents = intentsOf(question);

  for (const intent of intents) {
    switch (intent) {
      case "population": {
        // Only a sentence that is about people living there, with a number in it.
        const about = sentencesOf(site, lang).filter((c) => {
          const f = fold(c.text);
          if (!/\d/.test(c.text)) return false;
          if (POPULATION_WORDS.test(f)) return true;
          // "with over 200,000 people" — a head count, unless it is a seat count.
          return /\d[\d.,\s]*\s(people|menschen|человек|kisi)/u.test(f) && !SEATING_WORDS.test(f);
        });
        about.sort((a, b) => overlap(question, b.text) - overlap(question, a.text));
        if (about[0]) return { text: about[0].text, source: about[0].source };
        break;
      }
      case "capacity":
      case "height":
      case "diameter":
      case "length":
      case "width":
      case "count": {
        const found = measuresAnswer(site, question, intent, lang);
        if (found) return found;
        break;
      }
      case "when":
        return { text: `${says.era}: ${L(site.era)}.` };
      case "who": {
        // The slim index, not the full records: a city page should not
        // download every biography to name who lived there.
        const named = (values: string[], find: (v: string) => IndexEntry | undefined) => [
          ...new Set(
            values
              .map((v) => find(v))
              .filter((e) => e !== undefined)
              .map((e) => L(e.name)),
          ),
        ];
        const civs = named(site.civilizations, civilizationFor);
        const persons = named(site.figures, personFor);
        const parts = [
          civs.length ? `${says.civs}: ${civs.join(", ")}.` : "",
          persons.length ? `${says.people}: ${persons.join(", ")}.` : "",
        ].filter(Boolean);
        if (parts.length) return { text: parts.join(" ") };
        break;
      }
      case "where":
        return { text: `${L(site.name)} — ${L(site.province)} (${says.where}).` };
      case "fee":
        if (site.fee === 0) return { text: says.free };
        if (site.fee === undefined) return { text: says.feeUnknown };
        return { text: `${says.fee}: ${site.fee} ₺.`, source: "muze.gov.tr" };
      case "hours":
        return {
          text: site.hours
            ? L(site.hours)
            : `${says.hours}: ${L(MINISTRY_HOURS.summer)} · ${L(MINISTRY_HOURS.winter)}`,
          source: "muze.gov.tr",
        };
      case "unesco":
        return {
          text:
            site.unesco === "listed"
              ? says.unescoYes
              : site.unesco === "tentative"
                ? says.unescoTent
                : says.unescoNo,
        };
      case "structures": {
        const list = getSiteDetail(site.slug)?.structures.map(L) ?? [];
        if (list.length) return { text: `${says.structures}: ${list.join(", ")}.` };
        break;
      }
    }
  }

  // No intent answered: look for the sentence that best matches the words.
  const candidates = sentencesOf(site, lang);
  let best: { text: string; source: string; score: number } | null = null;
  for (const c of candidates) {
    const score = overlap(question, c.text);
    if (!best || score > best.score) best = { ...c, score };
  }
  if (best && best.score >= 0.5) return { text: best.text, source: best.source };
  return { text: says.unknown, unknown: true };
}

/** Example questions shown as chips, so people know what can be asked. */
export function suggestions(site: Site, lang: Lang): string[] {
  const hasPeople = reconstructionsFor(site.slug).some((r) =>
    r.measures.some((m) => m.unit === "people"),
  );
  const hasHeight = reconstructionsFor(site.slug).some((r) =>
    r.measures.some((m) => fold(`${m.label.tr} ${m.label.en}`).includes("yukseklig")),
  );
  const S: Record<
    Lang,
    { cap: string; height: string; when: string; who: string; fee: string; see: string }
  > = {
    tr: {
      cap: "Kaç kişilikti?",
      height: "Ne kadar yüksek?",
      when: "Ne zaman kuruldu?",
      who: "Burada kimler yaşadı?",
      fee: "Giriş ücreti ne kadar?",
      see: "Neler var?",
    },
    en: {
      cap: "How many people did it hold?",
      height: "How tall is it?",
      when: "When was it founded?",
      who: "Who lived here?",
      fee: "How much is the ticket?",
      see: "What is there to see?",
    },
    de: {
      cap: "Wie viele Zuschauer fasste es?",
      height: "Wie hoch ist es?",
      when: "Wann wurde es gegründet?",
      who: "Wer lebte hier?",
      fee: "Was kostet der Eintritt?",
      see: "Was gibt es zu sehen?",
    },
    ru: {
      cap: "Сколько зрителей вмещал?",
      height: "Какой высоты?",
      when: "Когда основан?",
      who: "Кто здесь жил?",
      fee: "Сколько стоит билет?",
      see: "Что посмотреть?",
    },
  };
  const s = S[lang];
  return [hasPeople ? s.cap : null, hasHeight ? s.height : null, s.when, s.who, s.see, s.fee]
    .filter((x): x is string => Boolean(x))
    .slice(0, 5);
}
