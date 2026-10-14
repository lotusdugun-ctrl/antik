import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { ReportIssue } from "@/components/ReportIssue";
import { SiteCard } from "@/components/SiteCard";
import { getCivilization } from "@/lib/civilizations";
import { sitesOfPerson } from "@/lib/history";
import { parseLang, pick, translate, useI18n } from "@/lib/i18n";
import { getPerson } from "@/lib/people";
import { breadcrumbTags, personTags, seoTags } from "@/lib/seo";

export const Route = createFileRoute("/kisi/$id")({
  loader: async ({ params }) => {
    // Imported here rather than at the top: whatever `head()` and a
    // synchronous loader touch stays in the entry bundle every page downloads.
    const { getPerson } = await import("@/lib/people");
    const person = getPerson(params.id);
    if (!person) throw notFound();
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      lifeLabel: person.lifeLabel,
      bio: person.bio,
      sources: person.sources.map((source) => ({ url: source.url })),
    };
  },
  head: ({ match, loaderData }) => {
    const lang = parseLang(match.search.lang);
    const person = loaderData;
    if (!person) {
      return seoTags({
        lang,
        pathname: match.pathname,
        title: translate("seo_not_found", lang),
        description: "",
        noIndex: true,
      });
    }
    const name = pick(person.name, lang);
    const description = `${pick(person.role, lang)} (${pick(person.lifeLabel, lang)}). ${pick(person.bio, lang)}`;
    const pathname = `/kisi/${person.id}`;
    return {
      ...seoTags({
        lang,
        pathname,
        title: `${name} | ${translate("appName", lang)}`,
        description: description.slice(0, 300),
      }),
      scripts: [
        ...personTags({
          lang,
          pathname,
          name,
          description: pick(person.role, lang),
          sameAs: person.sources.map((source) => source.url),
        }),
        ...breadcrumbTags(
          [
            { name: translate("appName", lang), pathname: "/" },
            { name: translate("nav_history", lang), pathname: "/medeniyetler" },
            { name, pathname },
          ],
          lang,
        ),
      ],
    };
  },
  component: PersonPage,
});

function PersonPage() {
  const { id } = Route.useParams();
  const { t, L } = useI18n();
  const person = getPerson(id)!;
  const list = sitesOfPerson(person);
  const civs = person.civilizations.map(getCivilization).filter((c) => c !== undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/medeniyetler"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("civ_back")}
      </Link>

      <header className="mt-3 max-w-3xl">
        <p className="text-sm font-semibold text-primary">{L(person.role)}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{L(person.name)}</h1>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium">
          <Clock className="h-3.5 w-3.5 text-primary" /> {L(person.lifeLabel)}
        </p>
        <p className="mt-4 text-base leading-relaxed">{L(person.bio)}</p>
      </header>

      {civs.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("person_civs")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {civs.map((civ) => (
              <Link
                key={civ.id}
                to="/medeniyet/$id"
                params={{ id: civ.id }}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold hover:border-primary"
              >
                {L(civ.name)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {list.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-semibold">
            {t("person_sites")} · {list.length}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          {person.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer" className="hover:underline">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
        <ReportIssue subject={L(person.name)} className="mt-3" />
      </section>
    </div>
  );
}
