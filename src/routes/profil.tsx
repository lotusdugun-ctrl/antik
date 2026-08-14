import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, Lock, MapPin, RotateCcw, Trash2, Trophy } from "lucide-react";
import { BackupPanel } from "@/components/BackupPanel";
import { OfflinePanel } from "@/components/OfflinePanel";
import { Photo } from "@/components/Photo";
import { SiteCard } from "@/components/SiteCard";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { levelFromXp, useProgress } from "@/lib/progress";
import { seoTags } from "@/lib/seo";
import { coverImage, getSite, regions, totalSites } from "@/lib/sites";

export const Route = createFileRoute("/profil")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/profil",
      title: translate("seo_profile_title", lang),
      description: translate("seo_profile_desc", lang),
      // A personal, device-local page has nothing to offer a search index.
      noIndex: true,
    });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { t, L } = useI18n();
  const { state, badges, regionProgress, reset, visitEntries, removeVisit } = useProgress();
  const lvl = levelFromXp(state.xp);
  const visitedSites = state.visited.map(getSite).filter(Boolean);
  const favoriteSites = state.favorites.map(getSite).filter(Boolean);
  const entries = visitEntries();
  const percent = Math.round((state.visited.length / totalSites) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl font-semibold sm:text-4xl">
            {t("nav_profile")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("profile_sub")}</p>
        </div>
        <button
          onClick={reset}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-destructive"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t("reset_progress")}
        </button>
      </header>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("total_visited"), value: state.visited.length },
          { label: t("remaining"), value: totalSites - state.visited.length },
          {
            label: `%${percent} ${t("completion")}`,
            value: `${state.visited.length}/${totalSites}`,
          },
          { label: `${t("level")} ${lvl.level}`, value: `${state.xp} XP` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl surface-panel p-5">
            <p className="font-display text-3xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* Region progress */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-semibold">{t("progress")}</h2>
        <div className="space-y-3 rounded-2xl surface-panel p-5">
          {regionProgress().map((rp) => {
            const region = regions.find((r) => r.id === rp.region)!;
            return (
              <div key={rp.region}>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{L(region.name)}</span>
                  <span className="text-muted-foreground">
                    {rp.visited}/{rp.total} · %{rp.percent}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${rp.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <Trophy className="h-5 w-5 text-gold" /> {t("badges")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges().map((badge) => (
            <div
              key={badge.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                badge.earned ? "border-gold bg-secondary" : "border-border opacity-60"
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  badge.earned ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {badge.earned ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{L(badge.name)}</p>
                <p className="text-xs text-muted-foreground">{L(badge.description)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visit log */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <BookOpen className="h-5 w-5 text-primary" /> {t("visit_log")}
        </h2>
        {entries.length === 0 ? (
          <p className="rounded-2xl surface-panel p-8 text-center text-sm text-muted-foreground">
            {t("visit_log_empty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => {
              const site = getSite(entry.slug);
              if (!site) return null;
              return (
                <li key={entry.slug} className="flex gap-4 rounded-2xl surface-panel p-4">
                  <Link to="/kent/$slug" params={{ slug: site.slug }} className="shrink-0">
                    <Photo
                      src={entry.photo ?? coverImage(site)}
                      alt={L(site.name)}
                      sizes="112px"
                      fallbackWidth={250}
                      className="h-20 w-28 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/kent/$slug"
                      params={{ slug: site.slug }}
                      className="block truncate font-display text-lg font-semibold hover:underline"
                    >
                      {L(site.name)}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {entry.date ? new Date(entry.date).toLocaleDateString() : t("visit_no_date")}
                    </p>
                    {entry.note && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeVisit(entry.slug)}
                    aria-label={t("visit_delete")}
                    className="grid h-9 w-9 shrink-0 place-items-center self-center rounded-full border border-border text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Visited */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-semibold">{t("total_visited")}</h2>
        {visitedSites.length === 0 ? (
          <p className="rounded-2xl surface-panel p-8 text-center text-sm text-muted-foreground">
            {t("empty_visits")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visitedSites.map((site) => (site ? <SiteCard key={site.slug} site={site} /> : null))}
          </div>
        )}
      </section>

      {/* Favorites */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-semibold">{t("favorites")}</h2>
        {favoriteSites.length === 0 ? (
          <p className="rounded-2xl surface-panel p-8 text-center text-sm text-muted-foreground">
            {t("empty_favorites")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {favoriteSites.map((site) => (site ? <SiteCard key={site.slug} site={site} /> : null))}
          </div>
        )}
      </section>

      <OfflinePanel />
      <BackupPanel />
    </div>
  );
}
