import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Landmark,
  MapPin,
  Pause,
  RotateCcw,
  Undo2,
  Volume2,
} from "lucide-react";
import { useAudioGuide } from "@/hooks/use-audio-guide";
import { track } from "@/lib/analytics";
import { useStoryEndings } from "@/hooks/use-story-endings";
import { hasLang, LANGS, parseLang, translate, useI18n, pick } from "@/lib/i18n";
import type { Guide } from "@/lib/narration";
import { seoTags, storyTags } from "@/lib/seo";
import { getSite } from "@/lib/sites";
import { endingsOf, getStory, type Story } from "@/lib/stories";

export const Route = createFileRoute("/hikaye/$id")({
  loader: ({ params }) => {
    const story = getStory(params.id);
    if (!story) throw notFound();
    return { id: story.id, title: story.title, blurb: story.blurb };
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
    const story = getStory(loaderData.id)!;
    const place = getSite(story.siteSlug);
    return {
      ...seoTags({
        lang,
        pathname: `/hikaye/${loaderData.id}`,
        title: `${pick(loaderData.title, lang)} — ${translate("stories_title", lang)} | ${translate("appName", lang)}`,
        description: pick(loaderData.blurb, lang),
      }),
      scripts: storyTags({
        lang,
        pathname: `/hikaye/${loaderData.id}`,
        title: pick(story.title, lang),
        description: pick(story.blurb, lang),
        placeName: place ? pick(place.name, lang) : story.siteSlug,
        period: pick(story.period, lang),
      }),
    };
  },
  component: StoryPage,
});

/** The scene, read aloud by the same engine as the audio guide. */
function useSceneVoice(story: Story, sceneId: string) {
  const { lang } = useI18n();
  const scene = story.scenes[sceneId]!;
  const guide = useMemo<Guide>(
    () => ({
      key: `story:${story.id}:${sceneId}`,
      title: story.title,
      chapters: [{ id: sceneId, title: story.title, text: scene.text }],
      langs: LANGS.filter((l) => hasLang(scene.text, l)),
    }),
    [story, sceneId, scene.text],
  );
  return useAudioGuide(guide, guide.langs.includes(lang) ? lang : "en");
}

function StoryPage() {
  const { id } = Route.useParams();
  const { t, L } = useI18n();
  const story = getStory(id)!;
  const site = getSite(story.siteSlug);
  const [path, setPath] = useState<string[]>([story.start]);
  const sceneId = path.at(-1)!;
  const scene = story.scenes[sceneId]!;
  const { found, record } = useStoryEndings();
  const voice = useSceneVoice(story, sceneId);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (scene.ending) {
      record(story.id, sceneId);
      track("Story ended", { story: story.id, ending: sceneId });
    }
  }, [scene.ending, record, story.id, sceneId]);

  // A new scene starts at the top, where its first line is.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sceneId]);

  const endings = endingsOf(story);
  const reached = found[story.id] ?? [];
  const reading = voice.status === "playing";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/hikayeler"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("stories_all")}
      </Link>

      <header className="mt-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
          <BookOpen className="h-3 w-3" /> {t("stories_title")}
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{L(story.title)}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {site && (
            <Link
              to="/kent/$slug"
              params={{ slug: site.slug }}
              className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
            >
              <MapPin className="h-4 w-4 text-primary" /> {L(site.name)}
            </Link>
          )}
          <span>{L(story.period)}</span>
        </p>
        <p className="mt-1 text-sm font-medium">{L(story.role)}</p>
        <p className="mt-2 text-xs italic text-muted-foreground">{t("stories_fiction")}</p>
      </header>

      <article className="mt-6 rounded-2xl surface-panel p-5 sm:p-7" aria-live="polite">
        {scene.ending && (
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gold">
            {t("stories_end")} · {L(scene.ending.title)}
          </p>
        )}
        <p className="font-display text-lg leading-relaxed sm:text-xl">{L(scene.text)}</p>

        {mounted && voice.supported && (
          <button
            onClick={reading ? voice.pause : voice.play}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
          >
            {reading ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {reading ? t("guide_pause") : t("stories_listen")}
          </button>
        )}

        {scene.history && (
          <aside className="mt-5 rounded-xl border-l-4 border-gold bg-secondary p-4">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
              <Landmark className="h-3.5 w-3.5 text-gold" /> {t("stories_history_note")}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-secondary-foreground">
              {L(scene.history)}
            </p>
          </aside>
        )}

        {scene.choices.length > 0 && (
          <ul className="mt-6 grid gap-2">
            {scene.choices.map((choice) => (
              <li key={choice.to + choice.label.tr}>
                <button
                  onClick={() => setPath((p) => [...p, choice.to])}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-semibold transition-colors hover:border-primary hover:bg-secondary"
                >
                  {L(choice.label)}
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {path.length > 1 && (
            <button
              onClick={() => setPath((p) => p.slice(0, -1))}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
            >
              <Undo2 className="h-3.5 w-3.5" /> {t("stories_back")}
            </button>
          )}
          {(scene.ending || path.length > 2) && (
            <button
              onClick={() => setPath([story.start])}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {t("stories_restart")}
            </button>
          )}
          <span className="ml-auto text-xs font-semibold text-muted-foreground">
            {t("stories_found")}: {reached.length}/{endings.length}
          </span>
        </div>
      </article>

      {scene.ending && (
        <section className="mt-6">
          <ul className="grid gap-2 sm:grid-cols-3">
            {endings.map((endingId) => {
              const done = reached.includes(endingId);
              const ending = story.scenes[endingId]!.ending!;
              return (
                <li
                  key={endingId}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                    done
                      ? "bg-secondary"
                      : "border border-dashed border-border text-muted-foreground"
                  }`}
                >
                  {done ? L(ending.title) : "?"}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
