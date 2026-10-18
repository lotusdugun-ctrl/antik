import { Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { useMemo, useState, type ReactNode } from "react";
import { LayoutGrid, MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { civilizationFor } from "@/lib/history-index";
import { useI18n, type TKey } from "@/lib/i18n";
import { foldForSearch, type IndexSearch } from "@/lib/index-search";
import {
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
 * Its search params live in `@/lib/index-search`.
 */

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

const selectClass =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

/** Everything the sheet sets, cleared at once by its Reset button. */
const EMPTY_SHEET = {
  region: undefined,
  province: undefined,
  civ: undefined,
  type: undefined,
  unesco: undefined,
  free: undefined,
} satisfies Partial<IndexSearch>;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
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
  const { t, L } = useI18n();
  const pool = scopeSites(scope);

  // Folded once per tab rather than on every keystroke.
  const haystacks = useMemo(
    () =>
      new Map(
        pool.map((site) => [
          site.slug,
          foldForSearch(
            [
              site.name.tr,
              site.name.en,
              site.province.tr,
              site.province.en,
              ...site.civilizations,
              ...site.figures,
            ].join(" "),
          ),
        ]),
      ),
    [pool],
  );

  const filtered = useMemo(() => {
    const q = search.q ? foldForSearch(search.q.trim()) : "";
    return pool.filter((site) => {
      if (search.region && site.region !== search.region) return false;
      if (search.province && site.province.tr !== search.province) return false;
      if (search.civ && !site.civilizations.includes(search.civ)) return false;
      if (search.type && site.heritageType !== search.type) return false;
      if (search.unesco && site.unesco !== "listed") return false;
      if (search.free && site.fee !== 0) return false;
      if (!q) return true;
      return haystacks.get(site.slug)?.includes(q) ?? false;
    });
  }, [pool, search, haystacks]);

  const isMap = search.view === "map";
  const [sheet, setSheet] = useState(false);

  // Only what this tab holds, and the provinces of the chosen region.
  const provinces = useMemo(
    () =>
      Array.from(
        new Set(
          pool
            .filter((x) => !search.region || x.region === search.region)
            .map((x) => x.province.tr),
        ),
      ).sort((a, b) => a.localeCompare(b, "tr")),
    [pool, search.region],
  );
  const civs = useMemo(
    () =>
      Array.from(new Set(pool.flatMap((x) => x.civilizations))).sort((a, b) =>
        a.localeCompare(b, "tr"),
      ),
    [pool],
  );
  // The filter keeps the data's own values; where one has a page of its own,
  // the reader sees that page's name in their language.
  const civName = (c: string) => {
    const civ = civilizationFor(c);
    return civ && civ.matches.length === 1 ? L(civ.name) : c;
  };
  const pickRegion = (region: RegionId | undefined) => {
    const keep =
      search.province &&
      region &&
      pool.some((x) => x.region === region && x.province.tr === search.province);
    setParam({ region, province: keep ? search.province : undefined });
  };
  const sheetCount = [search.province, search.civ, search.type, search.unesco, search.free].filter(
    Boolean,
  ).length;
  const active: { key: string; label: string; clear: () => void }[] = [];
  if (search.q)
    active.push({ key: "q", label: `“${search.q}”`, clear: () => setParam({ q: undefined }) });
  if (search.province)
    active.push({
      key: "province",
      label: search.province,
      clear: () => setParam({ province: undefined }),
    });
  if (search.civ)
    active.push({
      key: "civ",
      label: civName(search.civ),
      clear: () => setParam({ civ: undefined }),
    });
  if (search.type)
    active.push({
      key: "type",
      label: L(heritageTypeName(search.type)),
      clear: () => setParam({ type: undefined }),
    });
  if (search.unesco)
    active.push({ key: "unesco", label: "UNESCO", clear: () => setParam({ unesco: undefined }) });
  if (search.free)
    active.push({ key: "free", label: t("free"), clear: () => setParam({ free: undefined }) });
  // Offered per tab, so the museums tab does not list "Mosque and complex".
  const types = useMemo(() => usedHeritageTypes(pool), [pool]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ScopeTabs active={scope} />

      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      </header>

      {/* One search box, a filter button and the list/map switch; under it
          one row of region chips. Everything else waits in the sheet. */}
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search.q ?? ""}
            onChange={(e) => setParam({ q: e.target.value || undefined })}
            placeholder={t("search_placeholder")}
            aria-label={t("search_placeholder")}
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={() => setSheet(true)}
          data-filter-trigger
          aria-haspopup="dialog"
          className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="max-sm:sr-only">{t("filter_button")}</span>
          {sheetCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground max-sm:absolute max-sm:-right-1 max-sm:-top-1">
              {sheetCount}
            </span>
          )}
        </button>
        <div
          role="group"
          aria-label={`${t("list_view")} / ${t("map_view")}`}
          className="flex h-11 shrink-0 items-center rounded-full border border-border bg-card p-1"
        >
          {(
            [
              [false, LayoutGrid, t("list_view")],
              [true, MapIcon, t("map_view")],
            ] as const
          ).map(([map, Icon, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setParam({ view: map ? "map" : undefined })}
              aria-pressed={isMap === map}
              aria-label={label}
              title={label}
              className={`flex h-full items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors sm:px-3 ${isMap === map ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* The regions, as the one filter most people reach for. */}
      <div
        role="radiogroup"
        aria-label={t("region")}
        className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {[
          { id: undefined, label: t("all") },
          ...regions.map((r) => ({ id: r.id, label: L(r.name) })),
        ].map((chip) => {
          const on = search.region === chip.id;
          return (
            <button
              key={chip.id ?? "all"}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => pickRegion(chip.id)}
              className={`h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* What is on, each with its own ×, and the count. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {active.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.clear}
            aria-label={`${t("filter_remove")}: ${chip.label}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary/10 pl-3 pr-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            {chip.label}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
        {active.length > 1 && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-8 rounded-full px-2 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("clear_filters")}
          </button>
        )}
        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} {t("results")}
        </span>
      </div>

      <Dialog.Root open={sheet} onOpenChange={setSheet}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[1100] bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-[1100] flex max-h-[88vh] flex-col rounded-t-3xl border-t border-border bg-background shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom motion-reduce:animate-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[28rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border sm:hidden" />
            <div className="flex items-center justify-between px-5 pb-2 pt-3">
              <Dialog.Title className="font-display text-lg font-semibold">
                {t("filters")}
              </Dialog.Title>
              <Dialog.Close
                aria-label={t("nav_close")}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            <div className="space-y-4 overflow-y-auto px-5 py-2">
              <Field label={t("region")}>
                <select
                  value={search.region ?? ""}
                  onChange={(e) =>
                    pickRegion((e.target.value || undefined) as RegionId | undefined)
                  }
                  className={selectClass}
                >
                  <option value="">{t("all")}</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {L(r.name)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("province")}>
                <select
                  value={search.province ?? ""}
                  onChange={(e) => setParam({ province: e.target.value || undefined })}
                  className={selectClass}
                >
                  <option value="">{t("all")}</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("civilization")}>
                <select
                  value={search.civ ?? ""}
                  onChange={(e) => setParam({ civ: e.target.value || undefined })}
                  className={selectClass}
                >
                  <option value="">{t("all")}</option>
                  {civs.map((c) => (
                    <option key={c} value={c}>
                      {civName(c)}
                    </option>
                  ))}
                </select>
              </Field>
              {types.length > 1 && (
                <Field label={t("type")}>
                  <select
                    value={search.type ?? ""}
                    onChange={(e) =>
                      setParam({ type: (e.target.value || undefined) as HeritageType | undefined })
                    }
                    className={selectClass}
                  >
                    <option value="">{t("all")}</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {L(heritageTypeName(type))}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("filter_other")}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["unesco", "UNESCO"],
                      ["free", t("free")],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={Boolean(search[key])}
                      onClick={() => setParam({ [key]: search[key] ? undefined : true })}
                      className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${search[key] ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="flex gap-2 border-t border-border px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <button
                type="button"
                onClick={() => setParam({ ...EMPTY_SHEET })}
                disabled={sheetCount === 0 && !search.region}
                className="h-11 rounded-full px-4 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {t("filter_reset")}
              </button>
              <Dialog.Close className="h-11 flex-1 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
                {t("filter_show")} ({filtered.length})
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
