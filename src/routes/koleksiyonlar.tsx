import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, MapPin } from "lucide-react";
import { Photo } from "@/components/Photo";
import { collections, collectionSites } from "@/lib/collections";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { seoTags } from "@/lib/seo";
import { coverImage } from "@/lib/sites";

export const Route = createFileRoute("/koleksiyonlar")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/koleksiyonlar",
      title: translate("seo_collections_title", lang),
      description: translate("seo_collections_desc", lang),
    });
  },
  component: CollectionsPage,
});

function CollectionsPage() {
  const { t, L } = useI18n();
  const { isVisited } = useProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          <Layers className="h-7 w-7 text-primary" /> {t("collections_title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("collections_sub")}
        </p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const list = collectionSites(collection);
          const visited = list.filter((site) => isVisited(site.slug)).length;
          const cover = list[0];

          return (
            <Link
              key={collection.id}
              to="/koleksiyon/$id"
              params={{ id: collection.id }}
              className="group overflow-hidden rounded-2xl surface-panel lift"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                {cover && (
                  <Photo
                    src={coverImage(cover)}
                    alt={L(collection.title)}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    fallbackWidth={500}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 hero-scrim" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h2 className="font-display text-lg font-semibold leading-tight text-white">
                    {L(collection.title)}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/90">
                    <MapPin className="h-3 w-3" />
                    {list.length} {t("collection_sites")}
                    {visited > 0 && (
                      <span>
                        · {visited} {t("collection_visited")}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <p className="line-clamp-3 p-4 text-sm text-muted-foreground">
                {L(collection.blurb)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
