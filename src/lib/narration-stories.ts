import type { Lang } from "@/lib/i18n";
import type { Guide } from "@/lib/narration";

/**
 * Narration written for the ear.
 *
 * The chapters `narration.ts` assembles are the page's own sentences in a
 * guide's order — accurate, but they read like an index card ("Dönemi: MÖ 10.
 * yüzyıl"). A story file rewrites a guide's chapters as a guide would speak
 * them, keeping every fact and number of the original (a test checks the
 * numbers), so the voice has something to perform.
 *
 * Files live in `narration-stories/<lang>/<guide folder>.json`, one object of
 * `chapter id → text` per guide and language. A chapter without one keeps its
 * assembled text, so guides can move over one at a time.
 */
export type StoryText = Partial<Record<Lang, Record<string, string>>>;

/** `site:efes` → `site-efes`, the file and recording folder name. */
export const storyFolder = (key: string) => key.replace(":", "-");

/** The guide with each written chapter swapped in for its assembled text. */
export function applyStories(guide: Guide, stories: StoryText | undefined): Guide {
  if (!stories) return guide;
  const langs = Object.keys(stories) as Lang[];
  if (langs.length === 0) return guide;
  return {
    ...guide,
    chapters: guide.chapters.map((chapter) => {
      let text = chapter.text;
      for (const lang of langs) {
        const written = stories[lang]?.[chapter.id];
        // Only languages the guide already speaks: a story must not make a
        // German guide appear where the rest of it was never translated.
        if (written && guide.langs.includes(lang)) text = { ...text, [lang]: written };
      }
      return text === chapter.text ? chapter : { ...chapter, text };
    }),
  };
}
