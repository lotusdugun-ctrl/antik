import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutGrid, MapIcon } from "lucide-react";
import { OfflinePanel } from "@/components/OfflinePanel";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { parseLang, translate, useI18n, pick } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { seoTags } from "@/lib/seo";
import { regions, regionCoverImage, sitesByRegion, type RegionId } from "@/lib/sites";

export const Route = createFileRoute("/bolge/$id")({
  loader: ({ params }) => {
    const region = regions.find((r) => r.id === params.id);
    if (!region) throw notFound();
    return { id: region.id, name: region.name, blurb: region.blurb };
  },
  head: ({ match, loaderData }) => {
    const lang = parseLang(match.search.lang);
    if (!loaderData) {
      return seoTags({
        lang,
        pathname: match.pathname,
        title: translate("seo_not_found", lang),
        description: "",
        noIndex: true,
      });
    }
    return seoTags({
      lang,
      pathname: match.pathname,
      title: `${pick(loaderData.name, lang)} ${translate("seo_region_suffix", lang)} | ${translate("appName", lang)}`,
      description: pick(loaderData.blurb, lang),
      image: regionCoverImage(loaderData.id),
      imageAlt: pick(loaderData.name, lang),
    });
  },
  component: RegionDetail,
});

function RegionDetail() {
  const { id } = Route.useParams();
  const { t, L } = useI18n();
  const { regionProgress } = useProgress();
  const [view, setView] = useState<"list" | "map">("list");

  const region = regions.find((r) => r.id === (id as RegionId))!;
  const list = sitesByRegion(id as RegionId);
  const p = regionProgress().find((x) => x.region === id);

  const center: [number, number] = [
    list.reduce((sum, s) => sum + s.lat, 0) / (list.length || 1),
    list.reduce((sum, s) => sum + s.lng, 0) / (list.length || 1),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{L(region.name)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{L(region.blurb)}</p>
        </div>
        <div className="flex shrink-0 items-center rounded-full border border-border bg-card p-0.5">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> {t("list_view")}
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <MapIcon className="h-3.5 w-3.5" /> {t("map_view")}
          </button>
        </div>
      </header>

      <div className="mb-6 rounded-2xl surface-panel p-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>{t("progress")}</span>
          <span className="text-primary">
            {p?.visited ?? 0}/{list.length} · %{p?.percent ?? 0} {t("completion")}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${p?.percent ?? 0}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <OfflinePanel
          compact
          sites={list}
          packId={`region:${id}`}
          sub={t("offline_region_sub").replace("{n}", String(list.length))}
        />
      </div>

      {view === "map" ? (
        <SiteMap sites={list} center={center} zoom={7} height="70vh" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
