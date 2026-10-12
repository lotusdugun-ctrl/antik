import { ExternalLink, Newspaper } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { NewsItem } from "@/lib/news";

/**
 * Recent excavation headlines, fetched when the section scrolls into view.
 * Nothing is shown while loading or when there is no news: an empty "News"
 * heading on a quiet site would look broken.
 */
export function NewsList({
  site,
  limit = 5,
  always = false,
}: {
  site?: string;
  limit?: number;
  /** On the news page itself, say so when the list is empty. */
  always?: boolean;
}) {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(null);
    const el = box.current;
    if (!el) return;
    let done = false;
    const load = () => {
      if (done) return;
      done = true;
      const params = new URLSearchParams({ lang, ...(site ? { site } : {}) });
      fetch(`/api/haberler?${params}`)
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((data: { items: NewsItem[] }) => setItems(data.items.slice(0, limit)))
        .catch(() => setItems([]));
    };
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && load(),
      {
        rootMargin: "200px",
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [site, lang, limit]);

  const empty = items !== null && items.length === 0;

  return (
    <div ref={box}>
      {items && items.length > 0 && (
        <section className="rounded-2xl surface-panel p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
            <Newspaper className="h-5 w-5 text-primary" /> {t("news_title")}
          </h2>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 py-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug group-hover:underline">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.source}
                      {item.date && ` · ${new Date(item.date).toLocaleDateString(lang)}`}
                    </span>
                  </span>
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">{t("news_note")}</p>
        </section>
      )}
      {always && empty && (
        <p className="rounded-2xl surface-panel p-8 text-center text-sm text-muted-foreground">
          {t("news_empty")}
        </p>
      )}
    </div>
  );
}
