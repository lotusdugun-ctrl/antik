/**
 * Write the narration that is to be recorded to `scripts/audio-script.json`,
 * for `generate_audio_edge.py` to read.
 *
 *   bun scripts/export-audio-script.ts            # the 20 most popular sites + every 3D tour
 *   bun scripts/export-audio-script.ts efes troya # just these
 *
 * The JSON is committed, so recording needs only Python — not this project's
 * toolchain — on the machine that does it. Re-run this after the page text
 * changes; the generator then re-records only the chapters whose text moved.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { textHash } from "@/lib/audio-manifest";
import { guideForSite } from "@/lib/guide-sources";
import { reconstructionGuide, type Guide } from "@/lib/narration";
import { reconstructions } from "@/lib/reconstructions";
import { sites } from "@/lib/sites";

const TOP = 20;
const args = process.argv.slice(2);
const slugs = args.length
  ? args
  : [...sites]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, TOP)
      .map((s) => s.slug);

const guides: Guide[] = slugs.map((slug) => {
  const guide = guideForSite(slug);
  if (!guide) throw new Error(`Unknown site: ${slug}`);
  return guide;
});
if (!args.length) guides.push(...reconstructions.map(reconstructionGuide));

const items = guides.flatMap((guide) =>
  (["tr", "en"] as const).flatMap((lang) =>
    guide.chapters.map((chapter) => ({
      key: guide.key,
      folder: guide.key.replace(":", "-"),
      lang,
      chapter: chapter.id,
      text: chapter.text[lang],
      hash: textHash(chapter.text[lang]),
    })),
  ),
);

writeFileSync(
  join(import.meta.dir, "audio-script.json"),
  JSON.stringify({ guides: guides.map((g) => g.key), items }, null, 1) + "\n",
);
console.log(`${guides.length} guides, ${items.length} chapters.`);
