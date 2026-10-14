import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HeritageIndex } from "@/components/HeritageIndex";
import { parseIndexSearch, type IndexSearch } from "@/lib/index-search";
import { parseLang, translate, useI18n, pick } from "@/lib/i18n";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";
import { historicPlaces } from "@/lib/sites";

export const Route = createFileRoute("/tarihi-yerler")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => parseIndexSearch(search),
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return {
      ...seoTags({
        lang,
        pathname: "/tarihi-yerler",
        title: translate("seo_places_title", lang),
        description: translate("seo_places_desc", lang),
      }),
      scripts: [
        ...itemListTags(
          historicPlaces.map((site) => ({
            name: pick(site.name, lang),
            pathname: `/kent/${site.slug}`,
          })),
          { lang, name: translate("nav_places", lang) },
        ),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("nav_places", lang), pathname: "/tarihi-yerler" },
          ],
          lang,
        ),
      ],
    };
  },
  component: PlacesPage,
});

/** The heritage still standing: mosques, castles, bridges, hans, old towns. */
function PlacesPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  return (
    <HeritageIndex
      scope="tarihi"
      title={t("nav_places")}
      subtitle={t("places_sub")}
      search={search}
      setParam={(patch) => navigate({ search: (prev: IndexSearch) => ({ ...prev, ...patch }) })}
      clearFilters={() => navigate({ search: {} as IndexSearch })}
    />
  );
}
