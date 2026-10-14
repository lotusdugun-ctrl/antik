import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";
import { civilizations } from "@/lib/civilizations";
import { sitesOf, sitesOfPerson } from "@/lib/history";
import { parseLang, pick, translate, useI18n } from "@/lib/i18n";
import { people } from "@/lib/people";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";

export const Route = createFileRoute("/medeniyetler")({
  loaderDeps: ({ search }) => ({ lang: parseLang(search.lang) }),
  loader: async ({ deps }) => {
    // Imported here rather than at the top: whatever `head()` and a
    // synchronous loader touch stays in the entry bundle every page downloads.
    const { civilizations } = await import("@/lib/civilizations");
    return {
      items: civilizations.map((civ) => ({
        name: pick(civ.name, deps.lang),
        pathname: `/medeniyet/${civ.id}`,
      })),
    };
  },
  head: ({ match, loaderData }) => {
    const lang = parseLang(match.search.lang);
    const title = translate("seo_history_title", lang);
    const description = translate("civs_sub", lang);
    return {
      ...seoTags({ lang, pathname: "/medeniyetler", title, description }),
      scripts: [
        ...itemListTags(loaderData?.items ?? [], {
          lang,
          name: translate("nav_history", lang),
          description,
        }),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("nav_history", lang), pathname: "/medeniyetler" },
          ],
          lang,
        ),
      ],
    };
  },
  component: HistoryPage,
});

function HistoryPage() {
  const { t, L } = useI18n();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("nav_history")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("civs_sub")}</p>
        </div>
        <Link
          to="/zaman-cizelgesi"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Clock className="h-4 w-4" /> {t("nav_timeline")}
        </Link>
      </header>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {civilizations.map((civ) => (
          <li key={civ.id}>
            <Link
              to="/medeniyet/$id"
              params={{ id: civ.id }}
              className="flex h-full flex-col rounded-2xl surface-panel p-5 lift"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {L(civ.periodLabel)}
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold">{L(civ.name)}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {L(civ.summary)}
              </p>
              <p className="mt-auto flex items-center gap-1.5 pt-3 text-xs font-semibold text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {sitesOf(civ).length} {t("civs_places")}
                <ArrowRight className="ml-auto h-4 w-4 text-primary" />
              </p>
            </Link>
          </li>
        ))}
      </ol>

      <section className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
          <Users className="h-6 w-6 text-primary" /> {t("civs_people")}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {people.map((person) => (
            <li key={person.id}>
              <Link
                to="/kisi/$id"
                params={{ id: person.id }}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <span className="font-semibold">{L(person.name)}</span>
                <span className="text-xs text-muted-foreground">{L(person.role)}</span>
                <span className="mt-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                  <span>{L(person.lifeLabel)}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {sitesOfPerson(person).length}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
