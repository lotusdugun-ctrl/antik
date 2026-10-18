import { ExternalLink, Landmark, Newspaper, Search } from "lucide-react";
import { useI18n, type TKey } from "@/lib/i18n";
import { newsLinks, type NewsLink } from "@/lib/news";
import { getSite } from "@/lib/sites";

const LABEL: Record<NewsLink["kind"], TKey> = {
  search: "news_search",
  excavations: "news_excavations",
  museums: "news_museums",
};

const ICON = { search: Search, excavations: Landmark, museums: Landmark } as const;

/**
 * "Excavation news": links that open news searches and the Ministry's own
 * pages in the browser. No headline, snippet or feed is fetched, copied or
 * shown here (see src/lib/news.ts for why).
 */
export function NewsList({ site }: { site?: string }) {
  const { t, lang, L } = useI18n();
  const found = site ? getSite(site) : undefined;
  const subject = found ? (lang === "tr" ? found.name.tr : found.name.en) : t("news_country");
  return (
    <section className="rounded-2xl surface-panel p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
        <Newspaper className="h-5 w-5 text-primary" /> {t("news_title")}
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">
        {found ? `${L(found.name)} — ` : ""}
        {t("news_links_sub")}
      </p>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {newsLinks(subject, lang).map((link) => {
          const Icon = ICON[link.kind];
          return (
            <li key={link.kind}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium hover:border-primary"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                {t(LABEL[link.kind])}
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
