import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HeritageIndex, parseIndexSearch, type IndexSearch } from "@/components/HeritageIndex";
import { parseLang, translate, useI18n, pick } from "@/lib/i18n";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";
import { ancientCities } from "@/lib/sites";

export const Route = createFileRoute("/antik-kentler")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => parseIndexSearch(search),
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return {
      ...seoTags({
        lang,
        pathname: "/antik-kentler",
        title: translate("seo_ancient_title", lang),
        description: translate("seo_ancient_desc", lang),
      }),
      scripts: [
        ...itemListTags(
          ancientCities.map((site) => ({
            name: pick(site.name, lang),
            pathname: `/kent/${site.slug}`,
          })),
          { lang, name: translate("nav_ancient", lang) },
        ),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("nav_ancient", lang), pathname: "/antik-kentler" },
          ],
          lang,
        ),
      ],
    };
  },
  component: AncientPage,
});

/**
 * The excavated half on its own tab.
 *
 * These are most of the data and most of the reason a visitor comes here, and
 * until now they had no address: you reached Ephesus through a list that also
 * held mosques, bridges and museums.
 */
function AncientPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  return (
    <HeritageIndex
      scope="antik"
      title={t("nav_ancient")}
      subtitle={t("ancient_sub")}
      search={search}
      setParam={(patch) => navigate({ search: (prev: IndexSearch) => ({ ...prev, ...patch }) })}
      clearFilters={() => navigate({ search: {} as IndexSearch })}
    />
  );
}
