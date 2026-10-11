import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, MapPin, Sparkles } from "lucide-react";
import { Photo } from "@/components/Photo";
import { useStoryEndings } from "@/hooks/use-story-endings";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { seoTags } from "@/lib/seo";
import { coverImage, getSite } from "@/lib/sites";
import { endingsOf, stories } from "@/lib/stories";

export const Route = createFileRoute("/hikayeler")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/hikayeler",
      title: translate("seo_stories_title", lang),
      description: translate("seo_stories_desc", lang),
    });
  },
  component: StoriesPage,
});

function StoriesPage() {
  const { t, L } = useI18n();
  const { found } = useStoryEndings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          <BookOpen className="h-7 w-7 text-primary" /> {t("stories_title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("stories_intro")}
        </p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {stories.map((story) => {
          const site = getSite(story.siteSlug);
          const endings = endingsOf(story).length;
          const reached = found[story.id]?.length ?? 0;
          return (
            <Link
              key={story.id}
              to="/hikaye/$id"
              params={{ id: story.id }}
              className="group overflow-hidden rounded-2xl surface-panel transition-transform hover:-translate-y-0.5"
            >
              {site && (
                <div className="aspect-[16/7] overflow-hidden bg-muted">
                  <Photo
                    src={coverImage(site)}
                    alt={L(site.name)}
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="p-5">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  <MapPin className="h-3.5 w-3.5" /> {site ? `${L(site.name)} · ` : ""}
                  {L(story.period)}
                </p>
                <h2 className="mt-1.5 font-display text-xl font-semibold">{L(story.title)}</h2>
                <p className="mt-1 text-sm font-medium">{L(story.role)}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {L(story.blurb)}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  {t("stories_found")}: {reached}/{endings}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
