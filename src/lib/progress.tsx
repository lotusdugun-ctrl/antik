import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sites, totalSites, type RegionId } from "@/lib/sites";
import type { Localized } from "@/lib/i18n";

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

export type ProgressState = {
  visited: string[];
  favorites: string[];
  recent: string[];
  xp: number;
  gamesPlayed: number;
  correctAnswers: number;
  visits: Record<string, VisitEntry>;
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
};

/** Version stamp on exported backups, so a future format change can migrate. */
const BACKUP_VERSION = 1;
const BACKUP_KIND = "antik-tr-backup";

export const XP_PER_VISIT = 50;
export const XP_PER_CORRECT = 10;

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
  visitEntries: () => VisitEntry[];
  /** The whole store as a backup document, ready to be written to a file. */
  exportBackup: () => string;
  /** Replaces the store from a backup document. Returns false if unreadable. */
  importBackup: (raw: string) => boolean;
  reset: () => void;
  regionProgress: () => { region: RegionId; visited: number; total: number; percent: number }[];
  badges: () => Badge[];
};

const ProgressCtx = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...empty, ...(JSON.parse(raw) as Partial<ProgressState>) });
    } catch {
      /* corrupted storage — start fresh */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: ProgressState) => {
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
          persist({ ...empty, ...parsed.state, visits: parsed.state.visits ?? {} });
          return true;
        } catch {
          return false;
        }
      },
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
        const regionsCovered = new Set(
          sites.filter((x) => state.visited.includes(x.slug)).map((x) => x.region),
        ).size;
        return [
          {
            id: "first-step",
            icon: "footprints",
            name: { tr: "İlk Adım", en: "First Step" },
            description: {
              tr: "İlk antik kentini ziyaret et",
              en: "Visit your first ancient city",
            },
            earned: v >= 1,
          },
          {
            id: "explorer",
            icon: "compass",
            name: { tr: "Kâşif", en: "Explorer" },
            description: { tr: "5 antik kent ziyaret et", en: "Visit 5 ancient cities" },
            earned: v >= 5,
          },
          {
            id: "archaeologist",
            icon: "shovel",
            name: { tr: "Arkeolog", en: "Archaeologist" },
            description: { tr: "15 antik kent ziyaret et", en: "Visit 15 ancient cities" },
            earned: v >= 15,
          },
          {
            id: "unesco",
            icon: "landmark",
            name: { tr: "Miras Avcısı", en: "Heritage Hunter" },
            description: {
              tr: "3 UNESCO Dünya Mirası alanı gez",
              en: "Visit 3 UNESCO World Heritage sites",
            },
            earned: unescoVisited >= 3,
          },
          {
            id: "regions",
            icon: "map",
            name: { tr: "Yedi Bölge", en: "Seven Regions" },
            description: { tr: "4 farklı bölgede kent gez", en: "Visit cities in 4 regions" },
            earned: regionsCovered >= 4,
          },
          {
            id: "scholar",
            icon: "graduation-cap",
            name: { tr: "Bilge", en: "Scholar" },
            description: {
              tr: "Oyunlarda 25 doğru cevap",
              en: "Answer 25 quiz questions correctly",
            },
            earned: state.correctAnswers >= 25,
          },
          {
            id: "completionist",
            icon: "trophy",
            name: { tr: "Tamamlayıcı", en: "Completionist" },
            description: { tr: "Tüm antik kentleri gez", en: "Visit every ancient city" },
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
