import { DEFAULT_LANG, LANGS, type Lang } from "@/lib/i18n";
import type { Site } from "@/lib/sites";

/**
 * Absolute origin of the deployed site, needed because canonical and hreflang
 * URLs have to be fully qualified — a relative `href` in an alternate link is
 * ignored.
 *
 * Set `VITE_SITE_URL` to pin it. Without that we fall back to whatever the
 * runtime can tell us, and if nothing can, we return "" and the callers below
 * emit no canonical or alternate tags at all. Saying nothing is recoverable;
 * pointing every page at the wrong domain is not.
 */
const configured = import.meta.env["VITE_SITE_URL"] as string | undefined;

export function siteOrigin(): string {
  if (configured) return configured.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  if (typeof process !== "undefined") {
    const vercel = process.env["VERCEL_PROJECT_PRODUCTION_URL"];
    if (vercel) return `https://${vercel}`;
  }
  return "";
}

/** The address a given page has in a given language. */
export function urlFor(pathname: string, lang: Lang, origin = siteOrigin()): string {
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const query = lang === DEFAULT_LANG ? "" : `?lang=${lang}`;
  return `${origin}${path}${query}`;
}

type MetaTag = Record<string, string>;

const OG_LOCALE: Record<Lang, string> = { tr: "tr_TR", en: "en_US", de: "de_DE", ru: "ru_RU" };
type LinkTag = Record<string, string>;

/**
 * The meta and link tags every page needs, in the language it is rendering in.
 * `hreflang` pairs the two versions so a search engine indexes both instead of
 * treating one as a duplicate of the other.
 */
export function seoTags(options: {
  lang: Lang;
  pathname: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
}): { meta: MetaTag[]; links: LinkTag[] } {
  const { lang, pathname, title, description, image, imageAlt, noIndex } = options;
  const origin = siteOrigin();

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: OG_LOCALE[lang] },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  if (origin) meta.push({ property: "og:url", content: urlFor(pathname, lang, origin) });
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
    if (imageAlt) meta.push({ property: "og:image:alt", content: imageAlt });
  }
  if (noIndex) meta.push({ name: "robots", content: "noindex" });

  const links: LinkTag[] = [];
  if (origin && !noIndex) {
    links.push({ rel: "canonical", href: urlFor(pathname, lang, origin) });
    for (const alternate of LANGS) {
      links.push({
        rel: "alternate",
        hrefLang: alternate,
        href: urlFor(pathname, alternate, origin),
      });
    }
    links.push({
      rel: "alternate",
      hrefLang: "x-default",
      href: urlFor(pathname, DEFAULT_LANG, origin),
    });
  }

  return { meta, links };
}

/* ————— Structured data ————— */

type ScriptTag = { type: string; children: string };

/**
 * One `application/ld+json` block, in the shape a route's `head()` expects.
 *
 * `<` is escaped because the payload is inlined into a `<script>` element: an
 * unescaped `</` inside any string — a site name, a description — would close
 * the tag early and spill the rest of the JSON into the document.
 */
function jsonLd(data: Record<string, unknown>): ScriptTag {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

/** Trail entries are ordered root-first; the last one is the current page. */
export function breadcrumbTags(
  trail: readonly { name: string; pathname: string }[],
  lang: Lang,
): ScriptTag[] {
  const origin = siteOrigin();
  if (!origin || trail.length === 0) return [];
  return [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: urlFor(crumb.pathname, lang, origin),
      })),
    }),
  ];
}

/**
 * A single ancient site, as `LandmarksOrHistoricalBuildings` — the schema.org
 * type that actually fits a ruin, and specific enough that a search engine can
 * place it on a map from the coordinates rather than guessing from the prose.
 */
export function siteTags(
  site: Site,
  options: { lang: Lang; description: string; image?: string; regionName: string },
): ScriptTag[] {
  const origin = siteOrigin();
  if (!origin) return [];
  const name = site.name[options.lang];

  return [
    jsonLd({
      "@context": "https://schema.org",
      "@type": ["LandmarksOrHistoricalBuildings", "TouristAttraction"],
      name,
      description: options.description,
      url: urlFor(`/kent/${site.slug}`, options.lang, origin),
      ...(options.image ? { image: options.image } : {}),
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.lat,
        longitude: site.lng,
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "TR",
        addressRegion: options.regionName,
        addressLocality: site.province[options.lang],
      },
      // Only asserted when we know: an unknown fee is not evidence of a paid site.
      ...(site.fee === undefined ? {} : { isAccessibleForFree: site.fee === 0 }),
      touristType: "Cultural",
      ...(site.unesco === "listed"
        ? {
            award: options.lang === "tr" ? "UNESCO Dünya Mirası" : "UNESCO World Heritage Site",
          }
        : {}),
    }),
  ];
}

/** An ordered list of sites — used by the city index and the collection pages. */
export function itemListTags(
  items: readonly { name: string; pathname: string }[],
  options: { lang: Lang; name: string; description?: string },
): ScriptTag[] {
  const origin = siteOrigin();
  if (!origin || items.length === 0) return [];
  return [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: options.name,
      ...(options.description ? { description: options.description } : {}),
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: urlFor(item.pathname, options.lang, origin),
      })),
    }),
  ];
}

/** Site-wide identity, emitted once from the root route. */
export function websiteTags(options: {
  lang: Lang;
  name: string;
  description: string;
}): ScriptTag[] {
  const origin = siteOrigin();
  if (!origin) return [];
  return [
    jsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: options.name,
      description: options.description,
      url: urlFor("/", options.lang, origin),
      inLanguage: OG_LOCALE[options.lang].replace("_", "-"),
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${origin}/kentler?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    }),
  ];
}
