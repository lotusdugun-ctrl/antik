import type { Lang } from "@/lib/i18n";
import manifest from "./audio-manifest.json";
import voiceCredits from "./voice-credits.json";

/**
 * Pre-recorded narration, where someone has made it.
 *
 * The guide speaks with the device's own voice by default. A recorded file —
 * made once, on the owner's computer, by `scripts/generate_audio_piper.py`
 * with an open-source Piper voice whose licence allows commercial
 * redistribution (see docs/SESLER.md) — wins over it chapter by chapter, but
 * only while it still says what the page says: each entry carries a hash of
 * the text it was recorded from, and a chapter whose text has since been
 * corrected falls back to the device voice rather than reading out the old
 * version.
 *
 * Only entries that name the Piper engine are ever played. Recordings made
 * earlier with other engines (Microsoft Edge's online voices, whose output may
 * not be redistributed) cannot slip back in through an old manifest: without
 * `engine: "piper"` and a voice listed in voice-credits.json they are ignored
 * and the device speaks instead.
 *
 * Shape: guide key (`site:efes`) → language → chapter id → { url, hash, engine, voice }.
 */
export type Recording = { url: string; hash: string; v?: number; engine?: string; voice?: string };

/** A recorded voice and the licence that allows us to publish its output. */
export type VoiceCredit = {
  /** Piper voice id, e.g. "de_DE-thorsten-medium". */
  voice: string;
  /** The dataset the voice was trained on, as its model card names it. */
  dataset: string;
  license: string;
  licenseUrl?: string;
  /** The voice's model card, where the licence is stated. */
  card: string;
};

/** Per language ("tr", "en", "de", "ru", and "el" for the 3D models' Greek). */
export const voiceCreditsByLang = voiceCredits as Partial<Record<Lang | "el", VoiceCredit>>;

function playable(entry: Recording | undefined, lang: Lang): entry is Recording {
  if (!entry || entry.engine !== "piper") return false;
  const credit = voiceCreditsByLang[lang];
  return Boolean(credit && entry.voice === credit.voice);
}
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
  return playable(entry, lang) && entry.hash === textHash(text) ? entry.url : undefined;
}

/** Every recorded file a guide has, for the offline download. */
export function recordingsFor(key: string): string[] {
  const byLang = recordedAudio[key];
  if (!byLang) return [];
  return (Object.entries(byLang) as [Lang, Record<string, Recording> | undefined][]).flatMap(
    ([lang, chapters]) =>
      Object.values(chapters ?? {})
        .filter((entry) => playable(entry, lang))
        .map((entry) => entry.url),
  );
}
