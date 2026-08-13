import { createFileRoute } from "@tanstack/react-router";
import { SiteMap } from "@/components/SiteMap";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { seoTags } from "@/lib/seo";
import { sites } from "@/lib/sites";

export const Route = createFileRoute("/harita")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/harita",
      title: translate("seo_map_title", lang),
      description: translate("seo_map_desc", lang),
    });
  },
  component: MapPage,
});

function MapPage() {
  const { t } = useI18n();
  const { state } = useProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("nav_map")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sites.length} {t("cities")} · {state.visited.length} {t("visited_done").toLowerCase()}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" /> {t("nav_explore")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-success" /> {t("visited_done")}
          </span>
        </div>
      </header>
      <SiteMap sites={sites} height="76vh" />
    </div>
  );
}
