import { createFileRoute } from "@tanstack/react-router";
import { civilizations } from "@/lib/civilizations";
import { collections } from "@/lib/collections";
import { people } from "@/lib/people";
import { reconstructions } from "@/lib/reconstructions";
import { DEFAULT_LANG, LANGS } from "@/lib/i18n";
import { siteOrigin } from "@/lib/seo";
import { regions, sites } from "@/lib/sites";
import { stories } from "@/lib/stories";

/**
 * The sitemap is generated per request rather than committed as a static file
 * so it always matches the data layer — a hand-maintained list would drift the
 * first time a site is added. The origin is the configured one when there is
 * one — the same one canonical and hreflang use, so a `*.vercel.app` alias does
 * not list URLs every page then canonicalises elsewhere — and the request's own
 * otherwise.
 *
 * Each entry carries `xhtml:link` alternates for both languages. That pairing
 * is what tells a crawler `/kent/efes` and `/kent/efes?lang=en` are the same
 * page in two languages rather than one duplicating the other.
 */

/** `/profil` is deliberately absent: it is personal and marked noindex. */
const staticPaths = [
  "/",
  "/kentler",
  "/antik-kentler",
  "/tarihi-yerler",
  "/muzeler",
  "/harita",
  "/bolgeler",
  "/koleksiyonlar",
  "/rota",
  "/oyunlar",
  "/hikayeler",
  "/rekonstruksiyonlar",
  "/medeniyetler",
  "/zaman-cizelgesi",
  "/haberler",
  "/ogretmen",
  "/gorseller",
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlEntry(origin: string, path: string, priority: string): string {
  const href = (lang: string) =>
    escapeXml(`${origin}${path}${lang === DEFAULT_LANG ? "" : `?lang=${lang}`}`);

  const alternates = [...LANGS, "x-default"]
    .map((lang) => {
      const target = lang === "x-default" ? DEFAULT_LANG : lang;
      return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href(target)}" />`;
    })
    .join("\n");

  return [
    "  <url>",
    `    <loc>${href(DEFAULT_LANG)}</loc>`,
    alternates,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = siteOrigin() || new URL(request.url).origin;

        const entries = [
          ...staticPaths.map((path) => urlEntry(origin, path, path === "/" ? "1.0" : "0.8")),
          ...regions.map((region) => urlEntry(origin, `/bolge/${region.id}`, "0.7")),
          ...collections.map((c) => urlEntry(origin, `/koleksiyon/${c.id}`, "0.7")),
          ...sites.map((site) => urlEntry(origin, `/kent/${site.slug}`, "0.9")),
          ...stories.map((story) => urlEntry(origin, `/hikaye/${story.id}`, "0.6")),
          ...reconstructions.map((item) => urlEntry(origin, `/rekonstruksiyon/${item.id}`, "0.7")),
          ...civilizations.map((civ) => urlEntry(origin, `/medeniyet/${civ.id}`, "0.7")),
          ...people.map((person) => urlEntry(origin, `/kisi/${person.id}`, "0.6")),
        ];

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
          '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries,
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
