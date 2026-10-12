import type { Lang } from "@/lib/i18n";
import manifest from "./audio-manifest.json";

/**
 * Pre-recorded narration, where someone has made it.
 *
 * The guide speaks with the device's own voice by default. A recorded file —
 * a natural neural voice rendered once by `scripts/generate_audio_edge.py` —
 * wins over it chapter by chapter, but only while it still says what the page
 * says: each entry carries a hash of the text it was recorded from, and a
 * chapter whose text has since been corrected falls back to the device voice
 * rather than reading out the old version.
 *
 * Shape: guide key (`site:efes`) → language → chapter id → { url, hash }.
 */
export type Recording = { url: string; hash: string };
export type RecordedAudio = Record<string, Partial<Record<Lang, Record<string, Recording>>>>;

export const recordedAudio = manifest as RecordedAudio;

/**
 * FNV-1a over the UTF-16 code units, as eight hex digits. Mirrored exactly in
 * the Python generator; the two must agree or no recording will ever play.
 */
export function textHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function recordingFor(
  key: string,
  lang: Lang,
  chapterId: string,
  text: string,
): string | undefined {
  const entry = recordedAudio[key]?.[lang]?.[chapterId];
  return entry && entry.hash === textHash(text) ? entry.url : undefined;
}

/** Every recorded file a guide has, for the offline download. */
export function recordingsFor(key: string): string[] {
  const byLang = recordedAudio[key];
  if (!byLang) return [];
  return Object.values(byLang).flatMap((chapters) =>
    Object.values(chapters ?? {}).map((entry) => entry.url),
  );
}
