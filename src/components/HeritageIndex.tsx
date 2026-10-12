import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { LayoutGrid, MapIcon, Search, X } from "lucide-react";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { civilizationFor } from "@/lib/history-index";
import { useI18n, type TKey } from "@/lib/i18n";
import {
  allCivilizations,
  allProvinces,
  heritageTypeName,
  regions,
  scopeSites,
  usedHeritageTypes,
  type HeritageType,
  type RegionId,
  type Scope,
} from "@/lib/sites";

/**
 * The browse list, shared by all four tabs.
 *
 * There used to be two pages doing this — one for everything and one for the
 * standing landmarks — under labels a visitor could not tell apart, while the
 * ancient cities, which are most of the data and most of the reason to be
 * here, had no address of their own. One list, four scopes, one tab bar.
 *
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

const TABS: { scope: Scope; to: string; key: TKey }[] = [
  { scope: "hepsi", to: "/kentler", key: "nav_explore" },
  { scope: "antik", to: "/antik-kentler", key: "nav_ancient" },
  { scope: "tarihi", to: "/tarihi-yerler", key: "nav_places" },
  { scope: "muze", to: "/muzeler", key: "nav_museums" },
];

function ScopeTabs({ active }: { active: Scope }) {
  const { t } = useI18n();
  return (
    <nav
      aria-label={t("type")}
      className="-mx-4 mb-6 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
    >
      {TABS.map((tab) => (
        <Link
          key={tab.scope}
          to={tab.to}
          aria-current={tab.scope === active ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            tab.scope === active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          {t(tab.key)} <span className="opacity-90">{scopeSites(tab.scope).length}</span>
        </Link>
      ))}
    </nav>
  );
}

export function HeritageIndex({
  scope,
  title,
  subtitle,
  search,
  setParam,
  clearFilters,
}: {
  scope: Scope;
  title: string;
  subtitle: string;
  search: IndexSearch;
  /**
   * Supplied by the route rather than derived here: `useNavigate` is typed
   * against the route it is called from, and a `from` passed down as a plain
   * string erases that type, so each tab wires its own navigation.
   */
  setParam: (patch: Partial<IndexSearch>) => void;
  clearFilters: () => void;
}) {
  const { t, L, lang } = useI18n();
  const pool = scopeSites(scope);

  const filtered = useMemo(() => {
    const q = search.q?.toLocaleLowerCase(lang === "tr" ? "tr" : "en") ?? "";
    return pool.filter((site) => {
      if (search.region && site.region !== search.region) return false;
      if (search.province && site.province.tr !== search.province) return false;
      if (search.civ && !site.civilizations.includes(search.civ)) return false;
      if (search.type && site.heritageType !== search.type) return false;
      if (search.unesco && site.unesco !== "listed") return false;
      if (search.free && site.fee !== 0) return false;
      if (!q) return true;
      const haystack = [
        site.name.tr,
        site.name.en,
        site.province.tr,
        site.province.en,
        ...site.civilizations,
        ...site.figures,
      ]
        .join(" ")
        .toLocaleLowerCase(lang === "tr" ? "tr" : "en");
      return haystack.includes(q);
    });
  }, [pool, search, lang]);

  const hasFilters = Boolean(
    search.q ||
    search.region ||
    search.province ||
    search.civ ||
    search.type ||
    search.unesco ||
    search.free,
  );
  const isMap = search.view === "map";
  // Offered per tab, so the museums tab does not list "Mosque and complex".
  const types = useMemo(() => usedHeritageTypes(pool), [pool]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ScopeTabs active={scope} />

      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      </header>

      {/* Search + view toggle */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search.q ?? ""}
            onChange={(e) => setParam({ q: e.target.value || undefined })}
            placeholder={t("search_placeholder")}
            aria-label={t("search_placeholder")}
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex shrink-0 items-center rounded-full border border-border bg-card p-0.5">
          <button
            onClick={() => setParam({ view: undefined })}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${!isMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> {t("list_view")}
          </button>
          <button
            onClick={() => setParam({ view: "map" })}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <MapIcon className="h-3.5 w-3.5" /> {t("map_view")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={search.region ?? ""}
          aria-label={t("region")}
          onChange={(e) => setParam({ region: (e.target.value || undefined) as RegionId })}
          className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">
            {t("region")}: {t("all")}
          </option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {L(r.name)}
            </option>
          ))}
        </select>
        <select
          value={search.province ?? ""}
          aria-label={t("province")}
          onChange={(e) => setParam({ province: e.target.value || undefined })}
          className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">
            {t("province")}: {t("all")}
          </option>
          {allProvinces().map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={search.civ ?? ""}
          aria-label={t("civilization")}
          onChange={(e) => setParam({ civ: e.target.value || undefined })}
          className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">
            {t("civilization")}: {t("all")}
          </option>
          {allCivilizations().map((c) => {
            // The filter keeps the data's own values; where one has a page of
            // its own, the reader sees that page's name in their language.
            const civ = civilizationFor(c);
            return (
              <option key={c} value={c}>
                {civ && civ.matches.length === 1 ? L(civ.name) : c}
              </option>
            );
          })}
        </select>
        {types.length > 1 && (
          <select
            value={search.type ?? ""}
            aria-label={t("type")}
            onChange={(e) => setParam({ type: (e.target.value || undefined) as HeritageType })}
            className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">
              {t("type")}: {t("all")}
            </option>
            {types.map((type) => (
              <option key={type} value={type}>
                {L(heritageTypeName(type))}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => setParam({ unesco: search.unesco ? undefined : true })}
          className={`h-9 rounded-full border px-3 text-xs font-semibold ${search.unesco ? "border-gold bg-gold text-gold-foreground" : "border-border bg-card text-muted-foreground"}`}
        >
          UNESCO
        </button>
        <button
          onClick={() => setParam({ free: search.free ? undefined : true })}
          className={`h-9 rounded-full border px-3 text-xs font-semibold ${search.free ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground"}`}
        >
          {t("free")}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-destructive"
          >
            <X className="h-3.5 w-3.5" /> {t("clear_filters")}
          </button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} {t("results")}
        </span>
      </div>

      {/* Results */}
      <div className="mt-6">
        {isMap ? (
          <SiteMap sites={filtered} height="72vh" />
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl surface-panel p-10 text-center text-sm text-muted-foreground">
            {t("no_results")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
