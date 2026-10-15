import type { Lang } from "@/lib/i18n";
import { storyFolder, type StoryText } from "@/lib/narration-stories";

/*
 * Each story file is its own small chunk, fetched only for the guide being
 * opened: all of them together are several hundred KB a page never needs.
 * Kept apart from `narration-stories.ts` because `import.meta.glob` exists
 * only under Vite, and that module is also used by tests and scripts.
 */
const files = import.meta.glob<Record<string, string>>("./narration-stories/*/*.json", {
  import: "default",
});

/** The written chapters of one guide, in every language that has them. */
export async function loadStories(key: string): Promise<StoryText | undefined> {
  const folder = storyFolder(key);
  const found = Object.keys(files).filter((path) => path.endsWith(`/${folder}.json`));
  if (found.length === 0) return undefined;
  const entries = await Promise.all(
    found.map(async (path) => {
      const lang = path.split("/").at(-2) as Lang;
      try {
        return [lang, await files[path]!()] as const;
      } catch {
        return undefined;
      }
    }),
  );
  const stories: StoryText = {};
  for (const entry of entries) if (entry) stories[entry[0]] = entry[1];
  return stories;
}
