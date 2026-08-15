import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Castle } from "lucide-react";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";
import { historicPlaces } from "@/lib/sites";

export const Route = createFileRoute("/tarihi-mekanlar")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return {
      ...seoTags({
        lang,
        pathname: "/tarihi-mekanlar",
        title: translate("seo_places_title", lang),
        description: translate("seo_places_desc", lang),
      }),
      scripts: [
        ...itemListTags(
          historicPlaces.map((site) => ({
            name: site.name[lang],
            pathname: `/kent/${site.slug}`,
          })),
          { lang, name: translate("nav_places", lang) },
        ),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("nav_places", lang), pathname: "/tarihi-mekanlar" },
          ],
          lang,
        ),
      ],
    };
  },
  component: PlacesPage,
});

/**
 * The heritage that is still standing, as opposed to the excavated cities.
 *
 * A visitor planning a day rarely separates a mosque from a ruin, but they do
 * separate "somewhere I walk through a building" from "somewhere I walk over
 * foundations", and until now the second answer buried the first: a hundred
 * ancient cities sat between the two mosques in the list. This page is that
 * answer on its own, and museums — which are a third kind of visit again —
 * keep their own page next door.
 */
function PlacesPage() {
  const { t, L } = useI18n();
  const { isVisited } = useProgress();
  const visited = useMemo(
    () => historicPlaces.filter((site) => isVisited(site.slug)).length,
    [isVisited],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          <Castle className="h-7 w-7 text-primary" /> {t("nav_places")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("places_sub")}
        </p>
        <p className="mt-2 text-sm font-medium">
          {historicPlaces.length} {L({ tr: "yer", en: "places" })} · {visited}{" "}
          {t("collection_visited")}
        </p>
      </header>

      <div className="mb-6">
        <SiteMap sites={historicPlaces} height="360px" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {historicPlaces.map((site) => (
          <SiteCard key={site.slug} site={site} />
        ))}
      </div>
    </div>
  );
}
