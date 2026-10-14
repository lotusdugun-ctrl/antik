/**
 * Excavation news, from Google News' public RSS search.
 *
 * Only headlines, the outlet's name, the date and the link are shown — the
 * story itself stays on the publisher's site. The query is built here from a
 * site name (never a URL the client chose), so the server route cannot be
 * used to fetch anything else.
 */
export type NewsItem = { title: string; source: string; url: string; date: string };

const LOCALE: Record<string, { hl: string; gl: string; ceid: string; dig: string }> = {
  tr: { hl: "tr", gl: "TR", ceid: "TR:tr", dig: "kazı OR arkeoloji" },
  en: { hl: "en-US", gl: "US", ceid: "US:en", dig: "excavation OR archaeology" },
  de: { hl: "de", gl: "DE", ceid: "DE:de", dig: "Ausgrabung OR Archäologie" },
  ru: { hl: "ru", gl: "RU", ceid: "RU:ru", dig: "раскопки OR археология" },
};

export function newsFeedUrl(subject: string, lang: string): string {
  const l = LOCALE[lang] ?? LOCALE["tr"]!;
  const q = `"${subject.replace(/"/g, "").slice(0, 80)}" (${l.dig}) when:365d`;
  const params = new URLSearchParams({ q, hl: l.hl, gl: l.gl, ceid: l.ceid });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

function decode(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => safeCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n: string) => safeCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]!) : "";
}

/** A small RSS 2.0 reader: enough for <item> title/link/pubDate/source. */
export function parseRss(xml: string, limit = 8): NewsItem[] {
  const items: NewsItem[] = [];
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1]!;
    const source = tag(block, "source");
    let title = tag(block, "title");
    // Google appends " - Outlet" to every headline; the outlet is shown apart.
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    const url = tag(block, "link");
    const date = tag(block, "pubDate");
    if (!title || !/^https:\/\//.test(url)) continue;
    // One unparsable pubDate used to throw and drop the whole feed.
    const when = date ? new Date(date) : undefined;
    const iso = when && !Number.isNaN(when.getTime()) ? when.toISOString() : "";
    items.push({ title, source, url, date: iso });
    if (items.length >= limit) break;
  }
  return items;
}

/** A numeric entity's character; anything out of range becomes nothing. */
function safeCodePoint(code: number): string {
  return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
}
