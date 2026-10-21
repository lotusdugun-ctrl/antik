/**
 * Excavation news, as links only.
 *
 * Nothing is fetched, copied or shown here: every link opens a news search
 * or an official page in the browser, and the stories stay on their
 * publishers' sites. The search is built from a site name (never a URL a
 * visitor typed).
 */
export type NewsLink = { kind: "search" | "excavations" | "museums"; url: string };

const LOCALE: Record<string, { hl: string; gl: string; ceid: string; dig: string }> = {
  tr: { hl: "tr", gl: "TR", ceid: "TR:tr", dig: "kazı OR arkeoloji" },
  en: { hl: "en-US", gl: "US", ceid: "US:en", dig: "excavation OR archaeology" },
  de: { hl: "de", gl: "DE", ceid: "DE:de", dig: "Ausgrabung OR Archäologie" },
  ru: { hl: "ru", gl: "RU", ceid: "RU:ru", dig: "раскопки OR археология" },
};

/** A news search for a place (or the country), opened on the search engine's own site. */
export function newsSearchUrl(subject: string, lang: string): string {
  const l = LOCALE[lang] ?? LOCALE["tr"]!;
  const q = `"${subject.replace(/"/g, "").slice(0, 80)}" (${l.dig})`;
  const params = new URLSearchParams({ q, hl: l.hl, gl: l.gl, ceid: l.ceid });
  return `https://news.google.com/search?${params.toString()}`;
}

/** The links the news panel shows: a search, and the Ministry's official pages. */
export function newsLinks(subject: string, lang: string): NewsLink[] {
  return [
    { kind: "search", url: newsSearchUrl(subject, lang) },
    { kind: "excavations", url: "https://kvmgm.ktb.gov.tr/" },
    { kind: "museums", url: "https://muze.gov.tr/" },
  ];
}
