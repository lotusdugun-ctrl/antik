import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { LayoutGrid, MapIcon, Search, X } from "lucide-react";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { seoTags } from "@/lib/seo";
import { allCivilizations, allProvinces, regions, sites, type RegionId } from "@/lib/sites";

/**
 * Every filter is optional, and declared optional rather than
 * always-present-but-undefined: the router reads a required key as one the
 * caller must supply, which would force `<Link to="/kentler">` and every
 * partial `navigate({ search })` to spell out all seven of them.
 */
type SearchParams = {
  q?: string | undefined;
  region?: RegionId | undefined;
  province?: string | undefined;
  civ?: string | undefined;
  unesco?: boolean | undefined;
  free?: boolean | undefined;
  view?: "list" | "map" | undefined;
};

export const Route = createFileRoute("/kentler")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    region: typeof search["region"] === "string" ? (search["region"] as RegionId) : undefined,
    province: typeof search["province"] === "string" ? search["province"] : undefined,
    civ: typeof search["civ"] === "string" ? search["civ"] : undefined,
    unesco: search["unesco"] === true || search["unesco"] === "true" ? true : undefined,
    free: search["free"] === true || search["free"] === "true" ? true : undefined,
    view: search["view"] === "map" ? "map" : undefined,
  }),
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/kentler",
      title: translate("seo_explore_title", lang),
      description: translate("seo_explore_desc", lang),
    });
  },
  component: ExplorePage,
});

function ExplorePage() {
  const { t, L, lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const setParam = (patch: Partial<SearchParams>) =>
    navigate({ search: (prev: SearchParams) => ({ ...prev, ...patch }) });

  const filtered = useMemo(() => {
    const q = search.q?.toLocaleLowerCase(lang === "tr" ? "tr" : "en") ?? "";
    return sites.filter((site) => {
      if (search.region && site.region !== search.region) return false;
      if (search.province && site.province.tr !== search.province) return false;
      if (search.civ && !site.civilizations.includes(search.civ)) return false;
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
  }, [search, lang]);

  const hasFilters = Boolean(
    search.q || search.region || search.province || search.civ || search.unesco || search.free,
  );
  const isMap = search["view"] === "map";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("nav_explore")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("region_sub")}</p>
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
          onChange={(e) => setParam({ civ: e.target.value || undefined })}
          className="h-9 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">
            {t("civilization")}: {t("all")}
          </option>
          {allCivilizations().map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
            onClick={() => navigate({ search: {} as SearchParams })}
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
