import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { NewsList } from "@/components/NewsList";
import { parseLang, translate, useI18n } from "@/lib/i18n";
import { newsSearchUrl } from "@/lib/news";
import { seoTags } from "@/lib/seo";
import { sites } from "@/lib/sites";

export const Route = createFileRoute("/haberler")({
  head: ({ match }) => {
    const lang = parseLang(match.search.lang);
    return seoTags({
      lang,
      pathname: "/haberler",
      title: `${translate("news_title", lang)} | ${translate("appName", lang)}`,
      description: translate("news_sub", lang),
    });
  },
  component: NewsPage,
});

/**
 * Where to read about the digs. The app shows no headlines of its own: it
 * links to news searches and official pages, which open in the browser.
 */
function NewsPage() {
  const { t, lang, L } = useI18n();
  const popular = [...sites].sort((a, b) => b.popularity - a.popularity).slice(0, 16);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t("news_title")}</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">{t("news_sub")}</p>
      <NewsList />
      <section className="mt-6">
        <h2 className="font-display text-lg font-semibold">{t("news_by_site")}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {popular.map((site) => (
            <li key={site.slug}>
              <a
                href={newsSearchUrl(lang === "tr" ? site.name.tr : site.name.en, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium hover:border-primary"
              >
                {L(site.name)}
                <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-6 text-xs text-muted-foreground">{t("news_note")}</p>
    </div>
  );
}
