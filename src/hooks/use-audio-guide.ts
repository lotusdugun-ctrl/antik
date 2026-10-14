import { pick } from "@/lib/i18n";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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

/*
 * The page has one speech engine and several things that talk through it: the
 * guide player (sometimes two of them) and "ask the guide". Any of them calling
 * `speechSynthesis.cancel()` silences the others without telling them, which
 * left a player saying "playing" over silence. So whoever is about to speak
 * claims the engine first, and the others step back to "paused".
 */
const speechOwner = new EventTarget();

export function claimSpeech(owner: string) {
  speechOwner.dispatchEvent(new CustomEvent<string>("claim", { detail: owner }));
}

function onSpeechClaimed(listener: (owner: string) => void): () => void {
  const handle = (event: Event) => listener((event as CustomEvent<string>).detail);
  speechOwner.addEventListener("claim", handle);
  return () => speechOwner.removeEventListener("claim", handle);
}

/*
 * Chrome stops firing `onend` on an utterance it has cut short, and the guide
 * would wait on it forever. Speech runs at roughly 12-14 characters a second;
 * past the slow end of that, plus a margin for a voice that is slow to start,
 * the chunk is taken as finished.
 */
const CHARS_PER_SECOND = 12;
const WATCHDOG_MARGIN_MS = 4000;

function online(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

/** Let go of a recording's element, so the browser stops buffering it. */
function release(audio: HTMLAudioElement) {
  audio.onended = null;
  audio.onerror = null;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

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
    // With no signal a network voice says nothing at all; any on-device voice
    // beats the best one that needs the internet.
    if (voice.localService && !online()) s += 20;
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
  const [status, setStatusState] = useState<GuideStatus>("idle");
  const [chapter, setChapter] = useState(0);
  // A new guide (a route losing a stop, the highlights switch) can be shorter
  // than the chapter the old one was on. Reset in the same render, before the
  // player's chapter index is ever read against the new list; the effect below
  // stops the sound.
  const [guideKey, setGuideKey] = useState(`${guide.key}|${lang}`);
  if (guideKey !== `${guide.key}|${lang}`) {
    setGuideKey(`${guide.key}|${lang}`);
    setChapter(0);
    setStatusState("idle");
  }
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
  // Chrome garbage-collects an utterance nobody references and its `onend`
  // never fires; holding it here keeps it alive until it has finished.
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const watchdogRef = useRef<number | undefined>(undefined);
  const statusRef = useRef<GuideStatus>("idle");
  const owner = useId();

  const setStatus = useCallback((next: GuideStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const clearWatchdog = useCallback(() => {
    window.clearTimeout(watchdogRef.current);
    watchdogRef.current = undefined;
  }, []);

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
    // Losing the signal changes which voice can still speak.
    window.addEventListener("online", load);
    window.addEventListener("offline", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.removeEventListener("online", load);
      window.removeEventListener("offline", load);
    };
  }, [lang]);

  // Someone else took the speech engine: whatever we were saying is gone, so
  // say "paused" rather than "playing", and resume from the same sentence.
  useEffect(
    () =>
      onSpeechClaimed((by) => {
        if (by === owner || statusRef.current !== "playing") return;
        clearWatchdog();
        if (audioRef.current) audioRef.current.pause();
        else state.current.token += 1;
        setStatus("paused");
      }),
    [owner, clearWatchdog, setStatus],
  );

  const silence = useCallback(() => {
    state.current.token += 1;
    clearWatchdog();
    utteranceRef.current = null;
    if (speechSupported()) window.speechSynthesis.cancel();
    if (audioRef.current) {
      release(audioRef.current);
      audioRef.current = null;
    }
  }, [clearWatchdog]);

  const playFrom = useCallback(
    (index: number, chunk = 0) => {
      claimSpeech(owner);
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
        // A missing or unplayable file falls back to the voice, not to silence
        // — whether it fails before playing starts or halfway through.
        const fallBack = () => {
          if (state.current.token !== token || audioRef.current !== audio) return;
          release(audio);
          audioRef.current = null;
          speakChunks();
        };
        audio.onerror = fallBack;
        audio.play().catch((err: unknown) => {
          // AbortError is a pause() landing before play() resolved: the
          // listener asked for quiet, not for the device voice.
          if (err instanceof Error && err.name === "AbortError") return;
          fallBack();
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
        const say = (i: number, retry = false) => {
          if (state.current.token !== token) return;
          clearWatchdog();
          if (i >= chunks.length) {
            utteranceRef.current = null;
            next();
            return;
          }
          state.current.chunk = i;
          const text = chunks[i]!;
          const rate = state.current.rate;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = BCP47[lang];
          if (retry) {
            // The chosen voice failed (often a network voice with no signal):
            // try an on-device one, or the engine's default for the language.
            const local = window.speechSynthesis
              .getVoices()
              .find(
                (v) =>
                  v.localService && v.lang.toLowerCase().startsWith(lang) && v !== voiceRef.current,
              );
            if (local) utterance.voice = local;
          } else if (voiceRef.current) {
            utterance.voice = voiceRef.current;
          }
          utterance.rate = rate;
          // Whichever of onend and the watchdog comes first moves on; the
          // other is then ignored.
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            say(i + 1);
          };
          utterance.onend = finish;
          utterance.onerror = (event) => {
            if (settled) return;
            // "interrupted"/"canceled" is our own pause or skip.
            if (event.error === "interrupted" || event.error === "canceled") return;
            settled = true;
            clearWatchdog();
            if (state.current.token !== token) return;
            // Skipping on every error raced through a whole chapter in
            // silence. One more try with another voice; then stop on this
            // sentence, so "resume" picks up where the voice gave out.
            if (!retry) {
              say(i, true);
              return;
            }
            utteranceRef.current = null;
            state.current.token += 1;
            setStatus("paused");
          };
          utteranceRef.current = utterance;
          const expected = (text.length / CHARS_PER_SECOND / rate) * 1000 + WATCHDOG_MARGIN_MS;
          // Slow voices (and slow starts) can outlast the estimate. A voice
          // still speaking gets one more estimate's worth before it is cut —
          // Chrome's stuck engine also reports `speaking`, so it cannot be
          // trusted forever.
          let extended = false;
          const watch = () => {
            if (settled || state.current.token !== token) return;
            if (!extended && window.speechSynthesis.speaking) {
              extended = true;
              watchdogRef.current = window.setTimeout(watch, expected);
              return;
            }
            // Unstick the engine before handing it the next sentence.
            settled = true;
            window.speechSynthesis.cancel();
            say(i + 1);
          };
          watchdogRef.current = window.setTimeout(watch, expected);
          window.speechSynthesis.speak(utterance);
        };
        say(chunk);
      }
    },
    [guide, lang, silence, owner, clearWatchdog, setStatus],
  );

  const play = useCallback(() => {
    if (status === "idle") track("Guide played", { guide: guide.key, lang });
    if (status === "paused") {
      if (audioRef.current) {
        claimSpeech(owner);
        void audioRef.current.play();
        setStatus("playing");
        return;
      }
      playFrom(state.current.chapter, state.current.chunk);
      return;
    }
    playFrom(status === "ended" ? 0 : state.current.chapter);
  }, [playFrom, status, guide.key, lang, owner, setStatus]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      state.current.token += 1;
      clearWatchdog();
      utteranceRef.current = null;
      if (speechSupported()) window.speechSynthesis.cancel();
    }
    setStatus("paused");
  }, [clearWatchdog, setStatus]);

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
  }, [silence, setStatus]);

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
