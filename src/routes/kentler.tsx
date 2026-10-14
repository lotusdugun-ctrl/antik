import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HeritageIndex } from "@/components/HeritageIndex";
import { parseIndexSearch, type IndexSearch } from "@/lib/index-search";
import { parseLang, translate, useI18n, pick } from "@/lib/i18n";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";
import { sites } from "@/lib/sites";

export const Route = createFileRoute("/kentler")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => parseIndexSearch(search),
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return {
      ...seoTags({
        lang,
        pathname: "/kentler",
        title: translate("seo_explore_title", lang),
        description: translate("seo_explore_desc", lang),
      }),
      // The unfiltered list, so a crawler reading this page finds every site
      // URL even though the visible grid is filterable.
      scripts: [
        ...itemListTags(
          sites.map((site) => ({ name: pick(site.name, lang), pathname: `/kent/${site.slug}` })),
          { lang, name: translate("seo_explore_title", lang) },
        ),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("nav_explore", lang), pathname: "/kentler" },
          ],
          lang,
        ),
      ],
    };
  },
  component: AllPage,
});

/** Everything at once — the tab a search from the home page lands on. */
function AllPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  return (
    <HeritageIndex
      scope="hepsi"
      title={t("nav_explore")}
      subtitle={t("explore_sub")}
      search={search}
      setParam={(patch) => navigate({ search: (prev: IndexSearch) => ({ ...prev, ...patch }) })}
      clearFilters={() => navigate({ search: {} as IndexSearch })}
    />
  );
}
