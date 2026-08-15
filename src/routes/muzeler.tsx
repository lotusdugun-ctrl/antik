import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HeritageIndex, parseIndexSearch, type IndexSearch } from "@/components/HeritageIndex";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";
import { museums } from "@/lib/sites";

export const Route = createFileRoute("/muzeler")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => parseIndexSearch(search),
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
 * Museums get their own tab rather than a filter on the heritage list.
 *
 * They answer a different question — where is what was dug up — and a visitor
 * planning a rainy day wants the list, not a query string. It also gives the
 * set a page a search engine can index under its own name.
 */
function MuseumsPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  return (
    <HeritageIndex
      scope="muze"
      title={t("nav_museums")}
      subtitle={t("museums_sub")}
      search={search}
      setParam={(patch) => navigate({ search: (prev: IndexSearch) => ({ ...prev, ...patch }) })}
      clearFilters={() => navigate({ search: {} as IndexSearch })}
    />
  );
}
