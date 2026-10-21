import { useCallback, useEffect, useRef, useState } from "react";
import { pick, type Lang } from "@/lib/i18n";
import type { Guide } from "@/lib/narration";
import { dwellSeconds, type TourStop } from "@/lib/tour";
import { useAudioGuide } from "@/hooks/use-audio-guide";

/**
 * The guided tour's player: the audio guide's chapters, read one after the
 * other, each turning the camera to its stop.
 *
 * With a voice — a recording or the device's speech — the tour moves on when
 * the chapter has been said. Without one (no speech engine, or no voice for
 * the language) it still goes round, holding each stop for as long as the
 * chapter would take to say, so the tour works with the sound off too.
 */
export function useGuidedTour({
  guide,
  stops,
  lang,
  onStop,
  onEnd,
}: {
  guide: Guide;
  stops: TourStop[];
  lang: Lang;
  /** Turn the camera to stop `index`. */
  onStop: (stop: TourStop, index: number) => void;
  /** The last stop has been said, or the tour was left. */
  onEnd: () => void;
}) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeRef = useRef(false);
  const stopRef = useRef(onStop);
  stopRef.current = onStop;
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  const stopsRef = useRef(stops);
  stopsRef.current = stops;

  const onChapter = useCallback((i: number) => {
    if (!activeRef.current) return;
    setIndex(i);
    const stop = stopsRef.current[i];
    if (stop) stopRef.current(stop, i);
  }, []);
  const audio = useAudioGuide(guide, lang, { onChapter });
  // No voice at all: the tour keeps time itself.
  // A voice that gives out mid-tour (no voice installed after all) hands over to the clock too.
  const [voiceFailed, setVoiceFailed] = useState(false);
  const silent =
    voiceFailed ||
    !audio.supported ||
    (audio.voice.listed && !audio.voice.available && !audio.recorded);
  const userPaused = useRef(false);

  /* The silent tour's clock. */
  const timer = useRef<number | undefined>(undefined);
  const clear = () => window.clearTimeout(timer.current);
  const hold = useCallback(
    (i: number) => {
      clear();
      if (!activeRef.current) return;
      if (i >= guide.chapters.length) {
        activeRef.current = false;
        setActive(false);
        endRef.current();
        return;
      }
      onChapter(i);
      const text = pick(guide.chapters[i]!.text, lang);
      timer.current = window.setTimeout(() => hold(i + 1), dwellSeconds(text) * 1000);
    },
    [guide, lang, onChapter],
  );

  const start = useCallback(() => {
    activeRef.current = true;
    userPaused.current = false;
    setActive(true);
    setPaused(false);
    if (silent) hold(0);
    else audio.goTo(0);
  }, [silent, hold, audio]);

  const exit = useCallback(() => {
    clear();
    activeRef.current = false;
    setActive(false);
    setPaused(false);
    audio.stop();
    endRef.current();
  }, [audio]);

  const pause = useCallback(() => {
    userPaused.current = true;
    setPaused(true);
    if (silent) clear();
    else audio.pause();
  }, [silent, audio]);

  const resume = useCallback(() => {
    userPaused.current = false;
    setPaused(false);
    if (silent) hold(index);
    else audio.play();
  }, [silent, hold, index, audio]);

  const next = useCallback(() => {
    setPaused(false);
    if (index >= guide.chapters.length - 1) {
      exit();
      return;
    }
    if (silent) hold(index + 1);
    else audio.goTo(index + 1);
  }, [silent, hold, index, audio, guide.chapters.length, exit]);

  const prev = useCallback(() => {
    setPaused(false);
    const to = Math.max(0, index - 1);
    if (silent) hold(to);
    else audio.goTo(to);
  }, [silent, hold, index, audio]);

  // The voice reached the end, or was paused by someone else taking the engine.
  useEffect(() => {
    if (!activeRef.current || silent) return;
    if (audio.status === "ended") {
      activeRef.current = false;
      setActive(false);
      endRef.current();
    } else if (audio.status === "paused") {
      if (userPaused.current) setPaused(true);
      else {
        // Nobody asked for the pause: the voice failed. Go on without it.
        setVoiceFailed(true);
        hold(index);
      }
    } else if (audio.status === "playing") setPaused(false);
  }, [audio.status, silent, hold, index]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    active,
    index,
    paused,
    total: guide.chapters.length,
    start,
    exit,
    pause,
    resume,
    next,
    prev,
  };
}
