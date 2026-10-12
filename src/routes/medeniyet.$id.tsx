import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Landmark, Users } from "lucide-react";
import { ReportIssue } from "@/components/ReportIssue";
import { SiteCard } from "@/components/SiteCard";
import { SiteMap } from "@/components/SiteMap";
import { civilizations, getCivilization } from "@/lib/civilizations";
import { peopleOf, sitesOf } from "@/lib/history";
import { parseLang, pick, translate, useI18n } from "@/lib/i18n";
import { breadcrumbTags, itemListTags, seoTags } from "@/lib/seo";

export const Route = createFileRoute("/medeniyet/$id")({
  loader: ({ params }) => {
    const civ = getCivilization(params.id);
    if (!civ) throw notFound();
    return { id: civ.id };
  },
  head: ({ match, loaderData }) => {
    const lang = parseLang(match.search.lang);
    const civ = loaderData ? getCivilization(loaderData.id) : undefined;
    if (!civ) {
      return seoTags({
        lang,
        pathname: match.pathname,
        title: translate("seo_not_found", lang),
        description: "",
        noIndex: true,
      });
    }
    const name = pick(civ.name, lang);
    const description = pick(civ.summary, lang);
    return {
      ...seoTags({
        lang,
        pathname: `/medeniyet/${civ.id}`,
        title: `${name} | ${translate("appName", lang)}`,
        description,
      }),
      scripts: [
        ...itemListTags(
          sitesOf(civ).map((site) => ({
            name: pick(site.name, lang),
            pathname: `/kent/${site.slug}`,
          })),
          { lang, name, description },
        ),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("nav_history", lang), pathname: "/medeniyetler" },
            { name, pathname: `/medeniyet/${civ.id}` },
          ],
          lang,
        ),
      ],
    };
  },
  component: CivilizationPage,
});

function CivilizationPage() {
  const { id } = Route.useParams();
  const { t, L } = useI18n();
  const civ = getCivilization(id)!;
  const list = sitesOf(civ);
  const persons = peopleOf(civ);
  const index = civilizations.findIndex((c) => c.id === civ.id);
  const prev = civilizations[index - 1];
  const next = civilizations[index + 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/medeniyetler"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("civ_back")}
      </Link>

      <header className="mt-3 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{L(civ.name)}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-medium">
            <Clock className="h-3.5 w-3.5 text-primary" /> {L(civ.periodLabel)}
          </span>
          {civ.capital && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-medium">
              <Landmark className="h-3.5 w-3.5 text-primary" /> {t("civ_capital")}: {L(civ.capital)}
            </span>
          )}
        </div>
        <p className="mt-4 text-base leading-relaxed">{L(civ.summary)}</p>
      </header>

      <section className="mt-6 max-w-3xl rounded-2xl surface-panel p-5">
        <h2 className="mb-2 font-display text-lg font-semibold">{t("civ_highlights")}</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          {civ.highlights.map((item, i) => (
            <li key={i}>{L(item)}</li>
          ))}
        </ul>
        <ReportIssue subject={L(civ.name)} className="mt-3" />
      </section>

      {persons.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
            <Users className="h-5 w-5 text-primary" /> {t("civ_people")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {persons.map((person) => (
              <Link
                key={person.id}
                to="/kisi/$id"
                params={{ id: person.id }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary"
              >
                {L(person.name)}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {L(person.lifeLabel)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {list.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-semibold">
            {t("civ_sites")} · {list.length}
          </h2>
          <SiteMap sites={list} height="360px" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 text-sm">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <BookOpen className="h-4 w-4 text-primary" /> {t("history_sources")}
        </h2>
        <ul className="space-y-1 text-muted-foreground">
          {civ.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer" className="hover:underline">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <nav className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            to="/medeniyet/$id"
            params={{ id: prev.id }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">{t("civ_prev")}</span>
              <span className="block truncate font-semibold">{L(prev.name)}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to="/medeniyet/$id"
            params={{ id: next.id }}
            className="flex items-center justify-end gap-3 rounded-2xl border border-border bg-card p-4 text-right hover:border-primary"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">{t("civ_next")}</span>
              <span className="block truncate font-semibold">{L(next.name)}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
          </Link>
        )}
      </nav>
    </div>
  );
}
