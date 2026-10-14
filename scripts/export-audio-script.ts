/**
 * Write the narration that is to be recorded to `scripts/audio-script.json`,
 * for `generate_audio_edge.py` to read.
 *
 *   bun scripts/export-audio-script.ts            # every site and every 3D tour
 *   bun scripts/export-audio-script.ts efes troya # just these sites
 *
 * The JSON is committed, so recording needs only Python — not this project's
 * toolchain — on the machine that does it. Re-run this after the page text
 * changes; the generator then re-records only the chapters whose text moved.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { textHash } from "@/lib/audio-manifest";
import { loadContentTranslations, pick } from "@/lib/i18n";
import { guideForSite } from "@/lib/guide-sources";
import { reconstructionGuide, spokenText, type Guide } from "@/lib/narration";
import { reconstructions } from "@/lib/reconstructions";
import { sites } from "@/lib/sites";

/*
 * Where each recording lives. The 20 most visited sites and the 3D tours, in
 * Turkish and English, ship inside the app (`public/audio`); everything else
 * — the other sites, and German and Russian — is published from a separate
 * repository on GitHub Pages, because all of it together is several hundred
 * megabytes and has no business in the app's own history.
 */
await loadContentTranslations();

const TOP = 20;
const args = process.argv.slice(2);
const top = new Set(
  [...sites]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, TOP)
    .map((s) => s.slug),
);
const slugs = args.length ? args : sites.map((s) => s.slug);

const guides: Guide[] = slugs.map((slug) => {
  const guide = guideForSite(slug);
  if (!guide) throw new Error(`Unknown site: ${slug}`);
  return guide;
});
if (!args.length) guides.push(...reconstructions.map(reconstructionGuide));

const bundled = (key: string, lang: string) =>
  (lang === "tr" || lang === "en") && (key.startsWith("recon:") || top.has(key.slice(5)));

const items = guides.flatMap((guide) =>
  guide.langs.flatMap((lang) =>
    guide.chapters.map((chapter) => {
      const text = pick(chapter.text, lang);
      return {
        key: guide.key,
        folder: guide.key.replace(":", "-"),
        lang,
        chapter: chapter.id,
        text,
        // What the voice is given: the same text with abbreviations, units
        // and year ranges written out (see spokenText).
        speech: spokenText(text, lang),
        hash: textHash(text),
        target: bundled(guide.key, lang) ? "app" : "remote",
      };
    }),
  ),
);

writeFileSync(
  join(import.meta.dir, "audio-script.json"),
  JSON.stringify({ guides: guides.map((g) => g.key), items }, null, 1) + "\n",
);
const remote = items.filter((i) => i.target === "remote").length;
console.log(
  `${guides.length} guides, ${items.length} chapters (${items.length - remote} in the app, ${remote} remote).`,
);
