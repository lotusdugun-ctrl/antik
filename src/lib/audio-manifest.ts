import type { Lang } from "@/lib/i18n";

/**
 * Pre-recorded narration, where someone has made it.
 *
 * The guide speaks with the device's own voice by default — free, and on most
 * phones it works with no signal. A recorded file always wins over it, chapter
 * by chapter: `scripts/generate-audio.ts` renders the same script through a
 * text-to-speech service, writes the files under `public/audio/` and rewrites
 * this table. A chapter left out here simply falls back to the device voice.
 *
 * Shape: guide key (`site:efes`, `recon:celsus-kutuphanesi`) → language →
 * chapter id → URL.
 */
export type RecordedAudio = Record<string, Partial<Record<Lang, Record<string, string>>>>;

export const recordedAudio: RecordedAudio = {};

export function recordingFor(key: string, lang: Lang, chapterId: string): string | undefined {
  return recordedAudio[key]?.[lang]?.[chapterId];
}

/** Every recorded file a guide has, for the offline download. */
export function recordingsFor(key: string): string[] {
  const byLang = recordedAudio[key];
  if (!byLang) return [];
  return Object.values(byLang).flatMap((chapters) => Object.values(chapters ?? {}));
}
