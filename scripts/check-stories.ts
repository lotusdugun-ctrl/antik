/**
 * Checks the written narration (src/lib/narration-stories) against the text it
 * rewrites, so storytelling cannot quietly change the facts.
 *
 *   bun scripts/check-stories.ts              # every story file
 *   bun scripts/check-stories.ts site:efes    # just these guides
 *
 * For every chapter of every story file:
 *  - the chapter exists in the guide, and every chapter of the guide is written;
 *  - every number in the original chapter is still there (as digits);
 *  - no number appears that the guide's original text never had;
 *  - no capitalised name appears mid-sentence that the original never had;
 *  - the length stays within reason (0.8×–1.6× the original, or +350 chars
 *    for very short chapters).
 * Exits non-zero on any failure.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { guideForSite } from "@/lib/guide-sources";
import { loadContentTranslations, pick, type Lang } from "@/lib/i18n";
import { reconstructionGuide, type Guide } from "@/lib/narration";
import { storyFolder } from "@/lib/narration-stories";
import { getReconstruction } from "@/lib/reconstructions";

await loadContentTranslations();

const ROOT = join(import.meta.dir, "..", "src", "lib", "narration-stories");
const LANGS: Lang[] = ["tr", "en"];

function originalGuide(key: string): Guide | undefined {
  const [kind, id] = key.split(":") as [string, string];
  if (kind === "site") return guideForSite(id);
  if (kind === "recon") {
    const item = getReconstruction(id);
    return item ? reconstructionGuide(item) : undefined;
  }
  return undefined;
}

/** "24.000", "1970-78", "10." → "24000", "1970", "78", "10" */
function numbers(text: string): string[] {
  return (text.match(/\d[\d.,]*\d|\d/g) ?? []).flatMap((n) => {
    const plain = n.replace(/[.,](?=\d{3}\b)/g, "");
    return plain.split(/[.,]/).filter(Boolean);
  });
}

const fold = (w: string) =>
  w
    .toLocaleLowerCase("tr")
    .replace(/[’'].*$/, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .slice(0, 5);

/** Capitalised words that do not start a sentence. */
function midSentenceNames(text: string): string[] {
  const out: string[] = [];
  for (const sentence of text.split(/(?<=[.!?…:;])\s+|\s[—–-]\s/)) {
    const words = sentence.trim().split(/\s+/).slice(1);
    for (const raw of words) {
      const w = raw.replace(/^[("“'«]+|[)"”'».,!?;:…]+$/g, "");
      if (/^\p{Lu}/u.test(w) && w.length > 1) out.push(w);
    }
  }
  return out;
}

const wanted = new Set(process.argv.slice(2));
let failures = 0;
let checked = 0;

for (const lang of LANGS) {
  const dir = join(ROOT, lang);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const key = file.replace(/\.json$/, "").replace("-", ":");
    if (wanted.size && !wanted.has(key)) continue;
    const guide = originalGuide(key);
    const problems: string[] = [];
    if (!guide) {
      console.log(`✗ ${lang}/${file}: no guide ${key}`);
      failures += 1;
      continue;
    }
    if (storyFolder(guide.key) !== file.replace(/\.json$/, "")) problems.push("file name");
    let story: Record<string, string>;
    try {
      story = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch (error) {
      console.log(`✗ ${lang}/${file}: invalid JSON (${String(error)})`);
      failures += 1;
      continue;
    }
    const all = guide.chapters.map((c) => pick(c.text, lang)).join(" ");
    const allOther = guide.chapters.map((c) => pick(c.text, lang === "tr" ? "en" : "tr")).join(" ");
    const known = new Set(numbers(all));
    const knownNames = new Set(
      `${all} ${allOther} ${pick(guide.title, "tr")} ${pick(guide.title, "en")}`
        .split(/\s+/)
        .map((w) => fold(w.replace(/^[("“'«]+|[)"”'».,!?;:…]+$/g, "")))
        .filter(Boolean),
    );
    const ids = new Set(guide.chapters.map((c) => c.id));
    for (const id of Object.keys(story)) if (!ids.has(id)) problems.push(`unknown chapter ${id}`);
    for (const chapter of guide.chapters) {
      const written = story[chapter.id];
      if (typeof written !== "string" || !written.trim()) {
        problems.push(`missing chapter ${chapter.id}`);
        continue;
      }
      const original = pick(chapter.text, lang);
      const have = new Set(numbers(written));
      const lost = [...new Set(numbers(original))].filter((n) => !have.has(n));
      if (lost.length) problems.push(`${chapter.id}: lost number(s) ${lost.join(", ")}`);
      const invented = [...have].filter((n) => !known.has(n));
      if (invented.length) problems.push(`${chapter.id}: new number(s) ${invented.join(", ")}`);
      const names = [...new Set(midSentenceNames(written))].filter((n) => !knownNames.has(fold(n)));
      if (names.length) problems.push(`${chapter.id}: name(s) not in the original: ${names.join(", ")}`);
      const ratio = written.length / Math.max(1, original.length);
      if (ratio < 0.8 && original.length > 80) problems.push(`${chapter.id}: too short (${ratio.toFixed(2)}×)`);
      if (ratio > 1.6 && written.length - original.length > 350)
        problems.push(`${chapter.id}: too long (${ratio.toFixed(2)}×)`);
      if (/[*#_`]|\n\s*[-•]/.test(written)) problems.push(`${chapter.id}: markdown`);
    }
    checked += 1;
    if (problems.length) {
      failures += 1;
      console.log(`✗ ${lang}/${file}`);
      for (const p of problems) console.log(`    ${p}`);
    }
  }
}

console.log(`${checked} story files checked, ${failures} with problems.`);
process.exit(failures ? 1 : 0);
