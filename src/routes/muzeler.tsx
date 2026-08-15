import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Building2 } from "lucide-react";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";
import { sites } from "@/lib/sites";

/** Museums, most visited first. Computed once: the data does not change. */
const museums = sites
  .filter((site) => site.heritageType === "museum")
  .sort((a, b) => b.popularity - a.popularity);

export const Route = createFileRoute("/muzeler")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return {
      ...seoTags({
        lang,
        pathname: "/muzeler",
        title: translate("seo_museums_title", lang),
        description: translate("seo_museums_desc", lang),
      }),
      scripts: [
        ...itemListTags(
          museums.map((site) => ({ name: site.name[lang], pathname: `/kent/${site.slug}` })),
          { lang, name: translate("nav_museums", lang) },
        ),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("nav_museums", lang), pathname: "/muzeler" },
          ],
          lang,
        ),
      ],
    };
  },
  component: MuseumsPage,
});

/**
 * Museums get their own address rather than a filter on the heritage list.
 *
 * They answer a different question — where is what was dug up — and a visitor
 * planning a rainy day wants the list, not a query string. It also gives the
 * set a page a search engine can index under its own name.
 */
function MuseumsPage() {
  const { t } = useI18n();
  const { isVisited } = useProgress();
  const visited = useMemo(() => museums.filter((site) => isVisited(site.slug)).length, [isVisited]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          <Building2 className="h-7 w-7 text-primary" /> {t("nav_museums")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("museums_sub")}
        </p>
        <p className="mt-2 text-sm font-medium">
          {museums.length} {t("nav_museums").toLocaleLowerCase("tr")} · {visited}{" "}
          {t("collection_visited")}
        </p>
      </header>

      {museums.length > 0 && (
        <div className="mb-6">
          <SiteMap sites={museums} height="360px" />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {museums.map((site) => (
          <SiteCard key={site.slug} site={site} />
        ))}
      </div>
    </div>
  );
}
