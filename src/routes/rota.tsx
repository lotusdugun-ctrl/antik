import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Car,
  Clock,
  MapPin,
  Route as RouteIcon,
  TriangleAlert,
} from "lucide-react";
import { AudioGuide } from "@/components/AudioGuide";
import { OfflinePanel } from "@/components/OfflinePanel";
import { SiteMap } from "@/components/SiteMap";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { routeGuide } from "@/lib/route-guide";
import type { StoryText } from "@/lib/narration-stories";
import { loadStories } from "@/lib/narration-stories-load";
import { buildRouteServerFn } from "@/lib/routing";
import { seoTags } from "@/lib/seo";
import { getSite, sites, type Site } from "@/lib/sites";

export const Route = createFileRoute("/rota")({
  // Optional, so that linking to /rota without a chosen start is legal.
  validateSearch: (search: Record<string, unknown>): { start?: string | undefined } => ({
    start: typeof search["start"] === "string" ? search["start"] : undefined,
  }),
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/rota",
      title: translate("seo_route_title", lang),
      description: translate("seo_route_desc", lang),
    });
  },
  component: RouteBuilderPage,
});

function RouteBuilderPage() {
  const { t, L } = useI18n();
  const search = Route.useSearch();
  const initialSlug = sites.some((s) => s.slug === search.start)
    ? (search.start as string)
    : sites[0]!.slug;
  const [startSlug, setStartSlug] = useState(initialSlug);
  const [days, setDays] = useState(1);
  const [highlights, setHighlights] = useState(true);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["route", startSlug, days],
    queryFn: () => buildRouteServerFn({ data: { startSlug, days } }),
    staleTime: 10 * 60 * 1000,
  });

  const ordered = useMemo(
    () => (data ? data.slugs.map(getSite).filter((s): s is Site => Boolean(s)) : []),
    [data],
  );
  const driving = data?.usingDriving ?? false;
  const center: [number, number] =
    ordered.length > 0
      ? [
          ordered.reduce((sum, s) => sum + s.lat, 0) / ordered.length,
          ordered.reduce((sum, s) => sum + s.lng, 0) / ordered.length,
        ]
      : [39.2, 33.5];

  // Each stop's written chapters, fetched once the route is known; until they
  // arrive the stops speak their assembled text.
  const [stories, setStories] = useState<Record<string, StoryText | undefined>>({});
  useEffect(() => {
    let live = true;
    void Promise.all(
      ordered.map(async (s) => [s.slug, await loadStories(`site:${s.slug}`)] as const),
    ).then((entries) => {
      if (live) setStories(Object.fromEntries(entries));
    });
    return () => {
      live = false;
    };
  }, [ordered]);

  const guide = useMemo(
    () =>
      data && ordered.length > 0
        ? routeGuide(ordered, data.legs, { highlights, stories })
        : undefined,
    [data, ordered, highlights, stories],
  );

  const daysArr = useMemo(() => {
    if (ordered.length === 0) return [];
    const PER_DAY = 3;
    const arr: Site[][] = [];
    for (let i = 0; i < ordered.length; i += PER_DAY) {
      arr.push(ordered.slice(i, i + PER_DAY));
    }
    return arr;
  }, [ordered]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold sm:text-4xl">
          <RouteIcon className="h-8 w-8 text-primary" /> {t("route_title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("route_sub")}</p>
      </header>

      <div className="mb-6 grid gap-3 rounded-2xl surface-panel p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-end">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("route_start")}
          </span>
          <select
            value={startSlug}
            onChange={(e) => setStartSlug(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
          >
            {sites.map((s) => (
              <option key={s.slug} value={s.slug}>
                {L(s.name)} — {L(s.province)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("route_days")}
          </span>
          <div className="flex items-center rounded-xl border border-border bg-card p-0.5">
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`flex items-center gap-1 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                  days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" /> {d}
              </button>
            ))}
          </div>
        </label>

        <div className="flex items-end gap-3 sm:flex-col sm:gap-1 sm:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {driving ? t("route_total") : t("route_crow_distance")}
          </span>
          <span className="font-display text-xl font-semibold text-primary">
            {isLoading ? "…" : `${data?.totalKm ?? 0} ${t("route_km")}`}
          </span>
        </div>

        <div className="flex items-end gap-3 sm:flex-col sm:gap-1 sm:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {driving ? t("route_est_time") : t("route_rough_time")}
          </span>
          <span className="font-display text-xl font-semibold text-primary">
            {isLoading ? "…" : `${driving ? "" : "~"}${data?.totalMin ?? 0} ${t("route_min")}`}
          </span>
        </div>
      </div>

      <p className="mb-5 flex items-start gap-1.5 text-xs text-muted-foreground">
        {driving ? (
          <Car className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        ) : (
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
        )}
        {driving ? t("route_auto_note") : t("route_crow_note")}
      </p>

      {isLoading && (
        <div className="space-y-4">
          <div className="h-56 animate-pulse rounded-2xl surface-panel" />
          <div className="h-[50vh] animate-pulse rounded-2xl surface-panel" />
        </div>
      )}

      {isError && (
        <p className="rounded-2xl surface-panel p-10 text-center text-sm text-muted-foreground">
          {t("no_results")}
        </p>
      )}

      {!isLoading && !isError && ordered.length > 0 && data && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            {daysArr.map((day, di) => (
              <section key={di} className="rounded-2xl surface-panel p-5">
                <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {di + 1}
                  </span>
                  {t("route_day")} {di + 1}
                </h2>
                <ol className="space-y-2">
                  {day.map((site, si) => {
                    const globalIdx = di * 3 + si;
                    const isLast = globalIdx === ordered.length - 1;
                    const leg = data.legs[globalIdx];
                    return (
                      <li key={site.slug}>
                        <Link
                          to="/kent/$slug"
                          params={{ slug: site.slug }}
                          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                            {globalIdx + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{L(site.name)}</span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {L(site.province)}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                        {!isLast && leg && (
                          <p className="ml-11 mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>
                              {globalIdx === 0 ? t("route_from_start") : t("route_to_next")}:{" "}
                              <span className="font-semibold text-primary">
                                {leg.km} {t("route_km")}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> ~{leg.min} {t("route_min")}
                            </span>
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>

          {guide && (
            <section className="space-y-3 rounded-2xl surface-panel p-5 lg:col-span-2 lg:order-first">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {t("route_audio_sub")}
                </p>
                <div className="flex shrink-0 items-center rounded-full border border-border bg-card p-0.5">
                  {([true, false] as const).map((on) => (
                    <button
                      key={String(on)}
                      onClick={() => setHighlights(on)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        highlights === on
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {on ? t("route_audio_short") : t("route_audio_full")}
                    </button>
                  ))}
                </div>
              </div>
              <AudioGuide guide={guide} title={t("route_audio_title")} compact />
              <OfflinePanel
                compact
                sites={ordered}
                packId={`route:${startSlug}:${days}`}
                sub={t("offline_route_sub")}
                label={t("offline_download_route")}
              />
            </section>
          )}

          <div className="lg:sticky lg:top-20 lg:self-start">
            <SiteMap
              sites={ordered}
              center={center}
              zoom={6}
              height="62vh"
              path={ordered.map((s) => [s.lat, s.lng])}
            />
          </div>
        </div>
      )}
    </div>
  );
}
