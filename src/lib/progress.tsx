import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { sites, totalSites, type RegionId } from "@/lib/sites";
import type { Localized } from "@/lib/i18n";
import { mergeStates } from "@/lib/transfer";

/**
 * Local-first progress store.
 * Everything lives in localStorage today; the shape mirrors what a user
 * account row would hold, so it can be synced to a backend later without
 * changing the UI layer.
 */
export type VisitEntry = {
  slug: string;
  date: string;
  // Explicitly `| undefined`: clearing a note or a photo is a real edit, so
  // callers need to be able to pass the absence, not just omit the key.
  note?: string | undefined;
  photo?: string | undefined;
};

/** A passport stamp: proof, as far as a phone can give it, of being there. */
export type Stamp = {
  slug: string;
  /** ISO timestamp of the stamp. */
  at: string;
  /** Distance from the site's marker when stamped, in metres. */
  distance: number;
};

export type ProgressState = {
  visited: string[];
  favorites: string[];
  recent: string[];
  xp: number;
  gamesPlayed: number;
  correctAnswers: number;
  visits: Record<string, VisitEntry>;
  stamps: Record<string, Stamp>;
};

const KEY = "antik-tr-progress";

const empty: ProgressState = {
  visited: [],
  favorites: [],
  recent: [],
  xp: 0,
  gamesPlayed: 0,
  correctAnswers: 0,
  visits: {},
  stamps: {},
};

/** Version stamp on exported backups, so a future format change can migrate. */
const BACKUP_VERSION = 1;
const BACKUP_KIND = "antik-tr-backup";

export const XP_PER_VISIT = 50;
export const XP_PER_CORRECT = 10;
/** On top of the visit itself: being there is worth more than ticking a box. */
export const XP_PER_STAMP = 25;

export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentFloor = (level - 1) ** 2 * 100;
  const nextFloor = level ** 2 * 100;
  return {
    level,
    currentFloor,
    nextFloor,
    progress: Math.min(100, Math.round(((xp - currentFloor) / (nextFloor - currentFloor)) * 100)),
    toNext: Math.max(0, nextFloor - xp),
  };
}

export type Badge = {
  id: string;
  name: Localized;
  description: Localized;
  earned: boolean;
  icon: string;
};

type Ctx = {
  state: ProgressState;
  ready: boolean;
  isVisited: (slug: string) => boolean;
  isFavorite: (slug: string) => boolean;
  toggleVisited: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  pushRecent: (slug: string) => void;
  addGameResult: (correct: boolean) => void;
  getVisit: (slug: string) => VisitEntry | undefined;
  saveVisit: (slug: string, entry: Partial<VisitEntry>) => void;
  removeVisit: (slug: string) => void;
  getStamp: (slug: string) => Stamp | undefined;
  /** Stamps the passport, marking the site visited if it was not. */
  addStamp: (slug: string, distance: number) => void;
  stampList: () => Stamp[];
  visitEntries: () => VisitEntry[];
  /** The whole store as a backup document, ready to be written to a file. */
  exportBackup: () => string;
  /** Replaces the store from a backup document. Returns false if unreadable. */
  importBackup: (raw: string) => boolean;
  /** Merges a record from another device into this one. */
  mergeIn: (incoming: ProgressState) => void;
  reset: () => void;
  regionProgress: () => { region: RegionId; visited: number; total: number; percent: number }[];
  badges: () => Badge[];
};

const ProgressCtx = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(empty);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...(JSON.parse(raw) as Partial<ProgressState>) });
    } catch {
      /* corrupted storage — start fresh */
    }
    loaded.current = true;
    setReady(true);
  }, []);

  const persist = useCallback((next: ProgressState) => {
    // Before the stored record is read, `state` is the empty default, and a
    // write built from it would replace everything on disk. Child effects run
    // before this provider's, so a page that records itself on mount (the
    // city page's "recently viewed") used to wipe the whole store whenever a
    // city was opened straight from a link or a refresh.
    if (!loaded.current) return;
    setState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full or unavailable — keep in-memory state */
    }
  }, []);

  const value = useMemo<Ctx>(() => {
    const isVisited = (slug: string) => state.visited.includes(slug);
    const isFavorite = (slug: string) => state.favorites.includes(slug);

    return {
      state,
      ready,
      isVisited,
      isFavorite,
      toggleVisited: (slug) => {
        const on = !isVisited(slug);
        const visits = { ...state.visits };
        if (on) {
          visits[slug] = visits[slug] ?? { slug, date: new Date().toISOString().slice(0, 10) };
        } else {
          delete visits[slug];
        }
        persist({
          ...state,
          visited: on ? [...state.visited, slug] : state.visited.filter((x) => x !== slug),
          xp: Math.max(0, state.xp + (on ? XP_PER_VISIT : -XP_PER_VISIT)),
          visits,
        });
        return on;
      },
      toggleFavorite: (slug) =>
        persist({
          ...state,
          favorites: isFavorite(slug)
            ? state.favorites.filter((x) => x !== slug)
            : [...state.favorites, slug],
        }),
      pushRecent: (slug) => {
        if (state.recent[0] === slug) return;
        persist({
          ...state,
          recent: [slug, ...state.recent.filter((x) => x !== slug)].slice(0, 8),
        });
      },
      addGameResult: (correct) =>
        persist({
          ...state,
          gamesPlayed: state.gamesPlayed + 1,
          correctAnswers: state.correctAnswers + (correct ? 1 : 0),
          xp: state.xp + (correct ? XP_PER_CORRECT : 0),
        }),
      getVisit: (slug) => state.visits[slug],
      saveVisit: (slug, entry) => {
        const prev = state.visits[slug] ?? {
          slug,
          date: new Date().toISOString().slice(0, 10),
        };
        persist({
          ...state,
          visits: { ...state.visits, [slug]: { ...prev, ...entry, slug } },
        });
      },
      removeVisit: (slug) => {
        const visits = { ...state.visits };
        delete visits[slug];
        persist({ ...state, visits });
      },
      getStamp: (slug) => state.stamps[slug],
      addStamp: (slug, distance) => {
        if (state.stamps[slug]) return;
        const date = new Date().toISOString();
        const wasVisited = isVisited(slug);
        persist({
          ...state,
          visited: wasVisited ? state.visited : [...state.visited, slug],
          visits: wasVisited
            ? state.visits
            : { ...state.visits, [slug]: { slug, date: date.slice(0, 10) } },
          stamps: { ...state.stamps, [slug]: { slug, at: date, distance: Math.round(distance) } },
          xp: state.xp + XP_PER_STAMP + (wasVisited ? 0 : XP_PER_VISIT),
        });
      },
      stampList: () => Object.values(state.stamps).sort((a, b) => b.at.localeCompare(a.at)),
      visitEntries: () =>
        Object.values(state.visits)
          .filter((v) => v.slug)
          .sort((a, b) => (b.date || "").localeCompare(a.date || "")),
      exportBackup: () =>
        JSON.stringify(
          { kind: BACKUP_KIND, version: BACKUP_VERSION, savedAt: new Date().toISOString(), state },
          null,
          2,
        ),
      importBackup: (raw) => {
        try {
          const parsed = JSON.parse(raw) as { kind?: string; state?: Partial<ProgressState> };
          // Checked rather than trusted: dropping an unrelated JSON file onto
          // the restore button would otherwise wipe the store with nothing.
          if (parsed.kind !== BACKUP_KIND || !parsed.state) return false;
          if (!Array.isArray(parsed.state.visited)) return false;
          persist({
            ...empty,
            ...parsed.state,
            visits: parsed.state.visits ?? {},
            stamps: parsed.state.stamps ?? {},
          });
          return true;
        } catch {
          return false;
        }
      },
      mergeIn: (incoming) => persist(mergeStates(state, incoming)),
      reset: () => persist(empty),
      regionProgress: () => {
        const map = new Map<RegionId, { visited: number; total: number }>();
        for (const site of sites) {
          const entry = map.get(site.region) ?? { visited: 0, total: 0 };
          entry.total += 1;
          if (isVisited(site.slug)) entry.visited += 1;
          map.set(site.region, entry);
        }
        return Array.from(map.entries()).map(([region, v]) => ({
          region,
          visited: v.visited,
          total: v.total,
          percent: Math.round((v.visited / v.total) * 100),
        }));
      },
      badges: () => {
        const v = state.visited.length;
        const unescoVisited = sites.filter(
          (x) => x.unesco === "listed" && state.visited.includes(x.slug),
        ).length;
        const stamps = Object.keys(state.stamps).length;
        const regionTotals = new Map<RegionId, { visited: number; total: number }>();
        for (const site of sites) {
          const entry = regionTotals.get(site.region) ?? { visited: 0, total: 0 };
          entry.total += 1;
          if (state.visited.includes(site.slug)) entry.visited += 1;
          regionTotals.set(site.region, entry);
        }
        const regionDone = [...regionTotals.values()].some((r) => r.visited === r.total);
        const regionsCovered = new Set(
          sites.filter((x) => state.visited.includes(x.slug)).map((x) => x.region),
        ).size;
        return [
          {
            id: "first-step",
            icon: "footprints",
            name: { tr: "İlk Adım", en: "First Step", de: "Erster Schritt", ru: "Первый шаг" },
            description: {
              tr: "İlk antik kentini ziyaret et",
              en: "Visit your first ancient city",
              de: "Besuche deine erste antike Stadt",
              ru: "Посетите свой первый античный город",
            },
            earned: v >= 1,
          },
          {
            id: "explorer",
            icon: "compass",
            name: { tr: "Kâşif", en: "Explorer", de: "Entdecker", ru: "Исследователь" },
            description: {
              tr: "5 antik kent ziyaret et",
              en: "Visit 5 ancient cities",
              de: "Besuche 5 antike Städte",
              ru: "Посетите 5 античных городов",
            },
            earned: v >= 5,
          },
          {
            id: "archaeologist",
            icon: "shovel",
            name: { tr: "Arkeolog", en: "Archaeologist", de: "Archäologe", ru: "Археолог" },
            description: {
              tr: "15 antik kent ziyaret et",
              en: "Visit 15 ancient cities",
              de: "Besuche 15 antike Städte",
              ru: "Посетите 15 античных городов",
            },
            earned: v >= 15,
          },
          {
            id: "unesco",
            icon: "landmark",
            name: {
              tr: "Miras Avcısı",
              en: "Heritage Hunter",
              de: "Erbe-Jäger",
              ru: "Охотник за наследием",
            },
            description: {
              tr: "3 UNESCO Dünya Mirası alanı gez",
              en: "Visit 3 UNESCO World Heritage sites",
              de: "Besuche 3 UNESCO-Welterbestätten",
              ru: "Посетите 3 объекта Всемирного наследия ЮНЕСКО",
            },
            earned: unescoVisited >= 3,
          },
          {
            id: "regions",
            icon: "map",
            name: {
              tr: "Yedi Bölge",
              en: "Seven Regions",
              de: "Sieben Regionen",
              ru: "Семь регионов",
            },
            description: {
              tr: "4 farklı bölgede kent gez",
              en: "Visit cities in 4 regions",
              de: "Besuche Städte in 4 Regionen",
              ru: "Посетите города в 4 регионах",
            },
            earned: regionsCovered >= 4,
          },
          {
            id: "scholar",
            icon: "graduation-cap",
            name: { tr: "Bilge", en: "Scholar", de: "Gelehrter", ru: "Учёный" },
            description: {
              tr: "Oyunlarda 25 doğru cevap",
              en: "Answer 25 quiz questions correctly",
              de: "Beantworte 25 Quizfragen richtig",
              ru: "Ответьте правильно на 25 вопросов",
            },
            earned: state.correctAnswers >= 25,
          },
          {
            id: "passport",
            icon: "stamp",
            name: {
              tr: "Pasaport Sahibi",
              en: "Passport Holder",
              de: "Passinhaber",
              ru: "Владелец паспорта",
            },
            description: {
              tr: "Bir ören yerinde ilk damganı al",
              en: "Collect your first stamp at a site",
              de: "Hol dir deinen ersten Stempel vor Ort",
              ru: "Получите первый штамп на месте",
            },
            earned: stamps >= 1,
          },
          {
            id: "traveller",
            icon: "stamp",
            name: { tr: "Gezgin", en: "Traveller", de: "Reisender", ru: "Путешественник" },
            description: {
              tr: "10 farklı yerde damga topla",
              en: "Collect stamps at 10 different places",
              de: "Sammle Stempel an 10 verschiedenen Orten",
              ru: "Соберите штампы в 10 разных местах",
            },
            earned: stamps >= 10,
          },
          {
            id: "region-master",
            icon: "map",
            name: {
              tr: "Bölge Ustası",
              en: "Region Master",
              de: "Kenner der Region",
              ru: "Знаток региона",
            },
            description: {
              tr: "Bir bölgedeki tüm yerleri gez",
              en: "Visit every place in one region",
              de: "Besuche alle Orte einer Region",
              ru: "Посетите все места одного региона",
            },
            earned: regionDone,
          },
          {
            id: "completionist",
            icon: "trophy",
            name: { tr: "Tamamlayıcı", en: "Completionist", de: "Vollender", ru: "Перфекционист" },
            description: {
              tr: "Tüm antik kentleri gez",
              en: "Visit every ancient city",
              de: "Besuche alle antiken Städte",
              ru: "Посетите все античные города",
            },
            earned: v >= totalSites,
          },
        ];
      },
    };
  }, [state, ready, persist]);

  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
