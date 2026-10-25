import { pick, type Lang, type Localized } from "@/lib/i18n";

/**
 * Discovery quests for walking through a model: "find the statue of Sophia",
 * "walk to the orchestra", "read the inscription by the stair".
 *
 * Nothing here is written per model. The quests are made from what a model
 * already names — its hotspots, its named statues, its inscriptions — so a
 * model added tomorrow has its quests the day it lands. A quest is done by
 * standing in a place (a floor-level hotspot) or by looking at a thing from
 * near enough (anything raised, a statue, an inscription), checked from the
 * walker's eye a few times a second.
 */

export type Vec3 = [number, number, number];

export type QuestKind = "reach" | "aim" | "statue" | "read";

export type Quest = {
  /** `<model>:<what>`, stable across visits: the badge store keys on it. */
  id: string;
  kind: QuestKind;
  at: Vec3;
  /** Metres: how close to stand for "reach", how big the target is otherwise. */
  radius: number;
  /** How far away a look still counts, for the kinds that are looked at. */
  range: number;
  /** What the quest is about: a hotspot's label, a statue's name. */
  subject?: Localized;
};

export type QuestSource = {
  modelId: string;
  hotspots: { label: Localized; at: Vec3 }[];
  statues: { name: string; at: Vec3; height: number }[];
  plates: { at: Vec3; width: number; height: number }[];
  groundY: number;
  span: number;
};

/** The statues worth a quest, by the name the model gives them. */
export const STATUE_NAMES: Record<string, Localized> = {
  Sophia: { tr: "Sophia", en: "Sophia", de: "Sophia", ru: "Софии" },
  Arete: { tr: "Arete", en: "Arete", de: "Arete", ru: "Ареты" },
  Ennoia: { tr: "Ennoia", en: "Ennoia", de: "Ennoia", ru: "Эннойи" },
  Episteme: { tr: "Episteme", en: "Episteme", de: "Episteme", ru: "Эпистемы" },
  "Artemis Ephesia": {
    tr: "Efesli Artemis",
    en: "Artemis of Ephesus",
    de: "Artemis Ephesia",
    ru: "Артемиды Эфесской",
  },
  Maussollos: { tr: "Maussollos", en: "Maussollos", de: "Maussollos", ru: "Мавсола" },
  "Artemisia II": {
    tr: "II. Artemisia",
    en: "Artemisia II",
    de: "Artemisia II.",
    ru: "Артемисии II",
  },
  Athena: { tr: "Athena", en: "Athena", de: "Athena", ru: "Афины" },
  Zeus: { tr: "Zeus", en: "Zeus", de: "Zeus", ru: "Зевса" },
  Asklepios: { tr: "Asklepios", en: "Asclepius", de: "Asklepios", ru: "Асклепия" },
  Apollon: { tr: "Apollon", en: "Apollo", de: "Apollon", ru: "Аполлона" },
  Hermes: { tr: "Hermes", en: "Hermes", de: "Hermes", ru: "Гермеса" },
  Dionysos: { tr: "Dionysos", en: "Dionysus", de: "Dionysos", ru: "Диониса" },
  Herakles: { tr: "Herakles", en: "Heracles", de: "Herakles", ru: "Геракла" },
  Nike: { tr: "Nike", en: "Nike", de: "Nike", ru: "Ники" },
  Tyche: { tr: "Tykhe", en: "Tyche", de: "Tyche", ru: "Тюхе" },
  Aphrodite: { tr: "Afrodit", en: "Aphrodite", de: "Aphrodite", ru: "Афродиты" },
  Pan: { tr: "Pan", en: "Pan", de: "Pan", ru: "Пана" },
};

const STATUE_ORDER = Object.keys(STATUE_NAMES);

/** Above this height over the ground a hotspot is looked at, not stood in. */
const STAND_HEIGHT = 2.5;
const MAX_QUESTS = 6;
const MAX_STATUES = 2;

const near = (a: Vec3, b: Vec3, d: number) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < d;

/** The quests for one model, at most six, statues and inscriptions first. */
export function generateQuests(source: QuestSource): Quest[] {
  const { modelId, hotspots, statues, plates, groundY, span } = source;
  const quests: Quest[] = [];
  const lookRange = Math.max(14, Math.min(60, span * 0.5));

  // Statues: the named ones, each name once, a lone statue of a name before
  // one of a pair (the Sophia among four virtues, not one of twin Nikes).
  const byName = new Map<string, { name: string; at: Vec3; height: number }[]>();
  for (const statue of statues) {
    if (!STATUE_NAMES[statue.name]) continue;
    const list = byName.get(statue.name) ?? [];
    list.push(statue);
    byName.set(statue.name, list);
  }
  const named = [...byName.entries()]
    .sort(
      ([a, x], [b, y]) => x.length - y.length || STATUE_ORDER.indexOf(a) - STATUE_ORDER.indexOf(b),
    )
    .slice(0, MAX_STATUES);
  for (const [name, list] of named) {
    const statue = list[0]!;
    quests.push({
      id: `${modelId}:statue-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      kind: "statue",
      at: [statue.at[0], statue.at[1] + statue.height * 0.6, statue.at[2]],
      radius: Math.max(1.2, statue.height * 0.6),
      range: Math.max(12, Math.min(40, lookRange)),
      subject: STATUE_NAMES[name]!,
    });
  }

  // The widest inscription, named after the hotspot nearest it if one is close.
  const plate = [...plates].sort((a, b) => b.width - a.width)[0];
  if (plate) {
    const centre: Vec3 = [plate.at[0], plate.at[1] + plate.height / 2, plate.at[2]];
    let nearest: { label: Localized; d: number } | null = null;
    for (const spot of hotspots) {
      const d = Math.hypot(spot.at[0] - centre[0], spot.at[1] - centre[1], spot.at[2] - centre[2]);
      if (d < Math.max(8, span * 0.12) && (!nearest || d < nearest.d))
        nearest = { label: spot.label, d };
    }
    quests.push({
      id: `${modelId}:read`,
      kind: "read",
      at: centre,
      radius: Math.max(1, plate.width / 2),
      range: Math.max(10, Math.min(18, plate.width * 6)),
      ...(nearest ? { subject: nearest.label } : {}),
    });
  }

  // The hotspots, in the model's own order, until there are six; a hotspot
  // on top of a statue already asked for is the same quest twice and skipped.
  hotspots.forEach((spot, index) => {
    if (quests.length >= MAX_QUESTS) return;
    if (quests.some((q) => q.kind === "statue" && near(q.at, spot.at, 3))) return;
    const low = spot.at[1] - groundY < STAND_HEIGHT;
    quests.push({
      id: `${modelId}:spot-${index + 1}`,
      kind: low ? "reach" : "aim",
      at: spot.at,
      radius: low ? Math.max(3, Math.min(10, span * 0.05)) : Math.max(2, span * 0.04),
      range: lookRange,
      subject: spot.label,
    });
  });
  return quests;
}

/** Eye height the walker carries, so a floor point is compared with the feet. */
const EYE = 1.6;

/**
 * Whether the walker, eye at `eye` looking along unit vector `dir`, has done
 * the quest: standing within its radius (on the same level, give or take a
 * storey), or looking at it from within range with it near the middle of
 * the view.
 */
export function questHit(quest: Quest, eye: Vec3, dir: Vec3): boolean {
  const dx = quest.at[0] - eye[0];
  const dy = quest.at[1] - eye[1];
  const dz = quest.at[2] - eye[2];
  if (quest.kind === "reach") {
    return Math.hypot(dx, dz) <= quest.radius && Math.abs(eye[1] - EYE - quest.at[1]) < 3.5;
  }
  const d = Math.hypot(dx, dy, dz);
  if (d > quest.range) return false;
  if (d < 0.5) return true;
  const cos = (dx * dir[0] + dy * dir[1] + dz * dir[2]) / d;
  // The target fills its own angle; never stricter than ±7°, never looser than ±25°.
  const half = Math.min(0.44, Math.max(0.12, Math.atan(quest.radius / d)));
  return cos >= Math.cos(half);
}

/** The quest as it is shown: the instruction, in the reader's language. */
export function questTitle(quest: Quest, lang: Lang): string {
  const subject = quest.subject ? pick(quest.subject, lang) : "";
  // "The orchestra" reads as "walk to the orchestra"; a bare name keeps a colon.
  const lc = (text: string) => (/^The\s/.test(text) ? `t${text.slice(1)}` : null);
  switch (quest.kind) {
    case "statue":
      return {
        tr: `${subject} heykelini bul`,
        en: `Find the statue of ${subject}`,
        de: `Finde die Statue: ${subject}`,
        ru: `Найдите статую ${subject}`,
      }[lang];
    case "read":
      return subject
        ? {
            tr: `Yazıtı bul ve oku: ${subject}`,
            en: lc(subject)
              ? `Read the inscription by ${lc(subject)}`
              : `Read the inscription: ${subject}`,
            de: `Lies die Inschrift: ${subject}`,
            ru: `Прочитайте надпись: ${subject}`,
          }[lang]
        : {
            tr: "Bir yazıt bul ve oku",
            en: "Find and read an inscription",
            de: "Finde und lies eine Inschrift",
            ru: "Найдите и прочитайте надпись",
          }[lang];
    case "reach":
      return {
        tr: `Oraya yürü: ${subject}`,
        en: lc(subject) ? `Walk to ${lc(subject)}` : `Walk to: ${subject}`,
        de: `Geh dorthin: ${subject}`,
        ru: `Дойдите до места: ${subject}`,
      }[lang];
    default:
      return {
        tr: `Bul ve bak: ${subject}`,
        en: lc(subject) ? `Find ${lc(subject)}` : `Find: ${subject}`,
        de: `Finde: ${subject}`,
        ru: `Найдите: ${subject}`,
      }[lang];
  }
}

/* ------------------------------------------------------------------ *
 * Badges: which quests are done, kept on this device
 * ------------------------------------------------------------------ */

export const QUEST_KEY = "antik-quests";
/** Told whenever the store changes, so a profile page open elsewhere can follow. */
export const QUEST_EVENT = "antik-quests-changed";

export type QuestStore = Record<string, string[]>;

export function readQuests(): QuestStore {
  try {
    const raw = window.localStorage.getItem(QUEST_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const store: QuestStore = {};
    for (const [model, ids] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(ids))
        store[model] = ids.filter((id): id is string => typeof id === "string");
    }
    return store;
  } catch {
    return {};
  }
}

/** Marks a quest done; returns the model's done list (unchanged if storage is blocked). */
export function markQuestDone(modelId: string, questId: string): string[] {
  const store = readQuests();
  const done = new Set(store[modelId] ?? []);
  done.add(questId);
  store[modelId] = [...done];
  try {
    window.localStorage.setItem(QUEST_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(QUEST_EVENT));
  } catch {
    /* not remembered, but still celebrated */
  }
  return store[modelId]!;
}

/** The badge a model gives when all its quests are done, kept beside them. */
export const badgeId = (modelId: string) => `${modelId}:badge`;

/** Totals for the profile page: quests done, and models whose every quest is. */
export function questTotals(store: QuestStore): { quests: number; badges: number } {
  let quests = 0;
  let badges = 0;
  for (const [model, ids] of Object.entries(store)) {
    for (const id of ids) {
      if (id === badgeId(model)) badges += 1;
      else quests += 1;
    }
  }
  return { quests, badges };
}
