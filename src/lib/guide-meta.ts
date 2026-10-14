import { recordingFor } from "@/lib/audio-manifest";
import { guideForSite } from "@/lib/guide-sources";
import { pick, type Lang } from "@/lib/i18n";

/** What the audio guide offers this page, for its structured data. */
export function guideMeta(slug: string, lang: Lang) {
  const guide = guideForSite(slug);
  if (!guide) return undefined;
  const intro = guide.chapters[0]!;
  const spoken = guide.langs.includes(lang) ? lang : "en";
  return {
    languages: guide.langs,
    chapters: guide.chapters.length,
    recording: recordingFor(guide.key, spoken, intro.id, pick(intro.text, spoken)),
  };
}
