import { DEFAULT_LANG, LANGS, type Lang } from "@/lib/i18n";

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
    { property: "og:locale", content: lang === "tr" ? "tr_TR" : "en_US" },
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
