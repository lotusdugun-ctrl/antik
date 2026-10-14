import { pick } from "@/lib/i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { recordingFor } from "@/lib/audio-manifest";
import type { Lang } from "@/lib/i18n";
import { speakableChunks, spokenText, type Guide } from "@/lib/narration";

export type GuideStatus = "idle" | "playing" | "paused" | "ended";

export type VoiceInfo = {
  /** A voice for the language exists at all. */
  available: boolean;
  /** The engine published any voices at all. */
  listed: boolean;
  /** It runs on the device, so it keeps talking with no signal. */
  offline: boolean;
  name?: string | undefined;
};

const BCP47: Record<Lang, string> = { tr: "tr-TR", en: "en-GB", de: "de-DE", ru: "ru-RU" };

/**
 * The best voice the device has for a language. On-device voices first — the
 * guide is meant for ruins, which is where the signal is not — and among
 * those, the ones whose names say they are the good, neural kind.
 */
function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | undefined {
  const prefix = lang;
  const matching = voices.filter((voice) => voice.lang.toLowerCase().startsWith(prefix));
  if (matching.length === 0) return undefined;
  const score = (voice: SpeechSynthesisVoice) => {
    // A neural voice (Edge's "Online (Natural)" ones, Apple's premium ones)
    // first, then Google's, and the old robotic local voices only as a last
    // resort: on Windows those are what made the guide sound like a machine.
    let s = 0;
    if (/natural|neural|enhanced|premium|siri|yelda/i.test(voice.name)) s += 6;
    if (/google/i.test(voice.name)) s += 4;
    if (voice.localService) s += 1;
    if (voice.lang.replace("_", "-") === BCP47[lang]) s += 1;
    return s;
  };
  return [...matching].sort((a, b) => score(b) - score(a))[0];
}

function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * One guide, played chapter by chapter.
 *
 * Each chapter is a recorded file when one exists and the device's voice when
 * not. Speech is fed a sentence or two at a time, and "pause" cancels and
 * remembers the sentence rather than calling `speechSynthesis.pause()`, which
 * Android's Chrome ignores and Safari sometimes never resumes from.
 */
export function useAudioGuide(
  guide: Guide,
  lang: Lang,
  options: { onChapter?: ((index: number) => void) | undefined } = {},
) {
  const [status, setStatus] = useState<GuideStatus>("idle");
  const [chapter, setChapter] = useState(0);
  const [rate, setRateState] = useState(1);
  const [voice, setVoice] = useState<VoiceInfo>({
    available: false,
    listed: false,
    offline: false,
  });

  const onChapterRef = useRef(options.onChapter);
  onChapterRef.current = options.onChapter;
  const state = useRef({ chapter: 0, chunk: 0, rate: 1, token: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined);

  // Voices arrive asynchronously in Chrome; listen until they do.
  useEffect(() => {
    if (!speechSupported()) return;
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      const chosen = pickVoice(voices, lang);
      voiceRef.current = chosen;
      setVoice({
        available: Boolean(chosen),
        listed: voices.length > 0,
        offline: Boolean(chosen?.localService),
        name: chosen?.name,
      });
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [lang]);

  const silence = useCallback(() => {
    state.current.token += 1;
    if (speechSupported()) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
  }, []);

  const playFrom = useCallback(
    (index: number, chunk = 0) => {
      silence();
      if (index >= guide.chapters.length) {
        setStatus("ended");
        return;
      }
      const token = state.current.token;
      const current = guide.chapters[index]!;
      state.current.chapter = index;
      state.current.chunk = chunk;
      setChapter(index);
      setStatus("playing");
      if (chunk === 0) onChapterRef.current?.(index);

      const next = () => {
        if (state.current.token !== token) return;
        playFrom(index + 1);
      };

      const recorded = recordingFor(
        current.source?.key ?? guide.key,
        lang,
        current.source?.id ?? current.id,
        pick(current.text, lang),
      );
      if (recorded) {
        const audio = new Audio(recorded);
        audio.playbackRate = state.current.rate;
        audio.onended = next;
        audioRef.current = audio;
        // A missing or unplayable file falls back to the voice, not to silence.
        audio.play().catch(() => {
          if (state.current.token !== token) return;
          audioRef.current = null;
          speakChunks();
        });
        return;
      }
      speakChunks();

      function speakChunks() {
        if (!speechSupported()) {
          setStatus("idle");
          return;
        }
        const chunks = speakableChunks(spokenText(pick(current.text, lang), lang));
        const say = (i: number) => {
          if (state.current.token !== token) return;
          if (i >= chunks.length) {
            next();
            return;
          }
          state.current.chunk = i;
          const utterance = new SpeechSynthesisUtterance(chunks[i]);
          utterance.lang = BCP47[lang];
          if (voiceRef.current) utterance.voice = voiceRef.current;
          utterance.rate = state.current.rate;
          utterance.onend = () => say(i + 1);
          utterance.onerror = (event) => {
            // "interrupted"/"canceled" is our own pause or skip.
            if (event.error === "interrupted" || event.error === "canceled") return;
            say(i + 1);
          };
          window.speechSynthesis.speak(utterance);
        };
        say(chunk);
      }
    },
    [guide, lang, silence],
  );

  const play = useCallback(() => {
    if (status === "idle") track("Guide played", { guide: guide.key, lang });
    if (status === "paused") {
      if (audioRef.current) {
        void audioRef.current.play();
        setStatus("playing");
        return;
      }
      playFrom(state.current.chapter, state.current.chunk);
      return;
    }
    playFrom(status === "ended" ? 0 : state.current.chapter);
  }, [playFrom, status, guide.key, lang]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      state.current.token += 1;
      if (speechSupported()) window.speechSynthesis.cancel();
    }
    setStatus("paused");
  }, []);

  const goTo = useCallback((index: number) => playFrom(index), [playFrom]);
  const nextChapter = useCallback(
    () => playFrom(Math.min(state.current.chapter + 1, guide.chapters.length - 1)),
    [playFrom, guide.chapters.length],
  );
  const prevChapter = useCallback(
    () => playFrom(Math.max(state.current.chapter - 1, 0)),
    [playFrom],
  );

  const stop = useCallback(() => {
    silence();
    state.current.chapter = 0;
    state.current.chunk = 0;
    setChapter(0);
    setStatus("idle");
  }, [silence]);

  const setRate = useCallback(
    (value: number) => {
      state.current.rate = value;
      setRateState(value);
      if (audioRef.current) audioRef.current.playbackRate = value;
      else if (status === "playing") playFrom(state.current.chapter, state.current.chunk);
    },
    [playFrom, status],
  );

  // A new guide or language starts over; leaving the page stops the voice.
  useEffect(() => {
    stop();
    return silence;
  }, [guide.key, lang, stop, silence]);

  const recorded = guide.chapters.some((c) =>
    recordingFor(c.source?.key ?? guide.key, lang, c.source?.id ?? c.id, pick(c.text, lang)),
  );

  return {
    status,
    chapter,
    rate,
    voice,
    recorded,
    supported: speechSupported() || recorded,
    play,
    pause,
    stop,
    goTo,
    next: nextChapter,
    prev: prevChapter,
    setRate,
  };
}
