import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { collectionSites, getCollection } from "@/lib/collections";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";

export const Route = createFileRoute("/koleksiyon/$id")({
  loader: ({ params }) => {
    const collection = getCollection(params.id);
    if (!collection) throw notFound();
    return {
      id: collection.id,
      title: collection.title,
      blurb: collection.blurb,
      // Only what `head()` needs: the page itself re-reads the full records.
      items: collectionSites(collection).map((site) => ({ slug: site.slug, name: site.name })),
    };
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
    const title = loaderData.title[lang];
    const description = loaderData.blurb[lang];
    return {
      ...seoTags({
        lang,
        pathname: `/koleksiyon/${loaderData.id}`,
        title: `${title} | ${translate("appName", lang)}`,
        description,
      }),
      scripts: [
        ...itemListTags(
          loaderData.items.map((item) => ({
            name: item.name[lang],
            pathname: `/kent/${item.slug}`,
          })),
          { lang, name: title, description },
        ),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("collections_title", lang), pathname: "/koleksiyonlar" },
            { name: title, pathname: `/koleksiyon/${loaderData.id}` },
          ],
          lang,
        ),
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { id } = Route.useParams();
  const { t, L } = useI18n();
  const { isVisited } = useProgress();
  const collection = getCollection(id)!;
  const list = collectionSites(collection);
  const visited = list.filter((site) => isVisited(site.slug)).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/koleksiyonlar"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("collection_back")}
      </Link>

      <header className="mt-3">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{L(collection.title)}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {L(collection.blurb)}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium">
          <MapPin className="h-4 w-4 text-primary" />
          {list.length} {t("collection_sites")} · {visited} {t("collection_visited")}
        </p>
      </header>

      {list.length > 0 && (
        <div className="mt-6">
          <SiteMap sites={list} height="380px" />
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((site, index) => (
          <div key={site.slug} className="relative">
            {collection.slugs && (
              // A hand-ordered collection is an itinerary, so the number is
              // information, not decoration.
              <span className="absolute -left-1 -top-1 z-10 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                {index + 1}
              </span>
            )}
            <SiteCard site={site} />
          </div>
        ))}
      </div>
    </div>
  );
}
