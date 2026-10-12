import { createFileRoute } from "@tanstack/react-router";
import { newsFeedUrl, parseRss, type NewsItem } from "@/lib/news";
import { getSite } from "@/lib/sites";

const TTL = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; items: NewsItem[] }>();

/**
 * GET /api/haberler?site=efes&lang=tr — recent excavation headlines for a
 * site, or for Anatolian archaeology in general without `site`.
 * Cached for six hours here and at the edge; on any failure it answers an
 * empty list, and the page simply shows no news section.
 */
export const Route = createFileRoute("/api/haberler")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const lang = ["tr", "en", "de", "ru"].includes(params.get("lang") ?? "")
          ? params.get("lang")!
          : "tr";
        const site = params.get("site") ? getSite(params.get("site")!) : undefined;
        if (params.get("site") && !site) return Response.json({ items: [] }, { status: 404 });
        const subject = site
          ? lang === "tr"
            ? site.name.tr
            : site.name.en
          : lang === "tr"
            ? "Türkiye"
            : "Turkey";
        const key = `${lang}:${subject}`;
        const hit = cache.get(key);
        let items: NewsItem[] = [];
        if (hit && Date.now() - hit.at < TTL) {
          items = hit.items;
        } else {
          try {
            const res = await fetch(newsFeedUrl(subject, lang), {
              headers: { "user-agent": "AntikTurkiye/1.0 (+news headlines)" },
              signal: AbortSignal.timeout(6000),
            });
            if (res.ok) items = parseRss(await res.text());
            cache.set(key, { at: Date.now(), items });
          } catch {
            items = [];
          }
        }
        return Response.json(
          { items },
          { headers: { "cache-control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
        );
      },
    },
  },
});
