import { describe, expect, test } from "bun:test";
import { newsFeedUrl, parseRss } from "@/lib/news";

const sample = `<?xml version="1.0"?><rss><channel>
<item><title>Efes'te yeni mozaik bulundu - Örnek Haber</title><link>https://news.google.com/rss/articles/abc</link><pubDate>Mon, 05 Oct 2026 08:00:00 GMT</pubDate><source url="https://ornek.example">Örnek Haber</source></item>
<item><title><![CDATA[Kazıda &quot;altın&quot; sikke &amp; mühür]]></title><link>https://news.google.com/rss/articles/def</link><pubDate>Sun, 04 Oct 2026 08:00:00 GMT</pubDate><source url="https://x.example">X</source></item>
<item><title>Bad link</title><link>javascript:alert(1)</link></item>
</channel></rss>`;

describe("news", () => {
  test("parses items, strips the outlet suffix and drops unsafe links", () => {
    const items = parseRss(sample);
    expect(items).toHaveLength(2);
    expect(items[0]!.title).toBe("Efes'te yeni mozaik bulundu");
    expect(items[0]!.source).toBe("Örnek Haber");
    expect(items[1]!.title).toBe('Kazıda "altın" sikke & mühür');
    expect(items[0]!.date).toStartWith("2026-10-05");
  });

  test("the feed URL is built from the subject only", () => {
    const url = new URL(newsFeedUrl('Efes" OR evil', "tr"));
    expect(url.host).toBe("news.google.com");
    expect(url.searchParams.get("q")).toContain('"Efes OR evil"');
    expect(url.searchParams.get("hl")).toBe("tr");
  });
});
