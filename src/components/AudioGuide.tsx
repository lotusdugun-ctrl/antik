import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Headphones,
  LocateFixed,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  WifiOff,
  Wifi,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import { useAudioGuide } from "@/hooks/use-audio-guide";
import { useI18n, pick, type Lang } from "@/lib/i18n";
import { estimateSeconds, type Guide } from "@/lib/narration";
import { distanceKm } from "@/lib/sites";

const RATES = [0.85, 1, 1.15, 1.3];
/** How close counts as "arrived" for the hands-free start. */
export const ARRIVAL_KM = 1;

function formatKm(km: number, lang: Lang) {
  const text = km < 10 ? km.toFixed(1) : String(Math.round(km));
  return lang === "en" ? text : text.replace(".", ",");
}

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * The player. Used twice: on a city page, where it reads the whole site, and
 * under a 3D model, where `onChapter` turns the camera to each hotspot as the
 * voice reaches it.
 */
export function AudioGuide({
  guide,
  title,
  onChapter,
  onStatus,
  arrival,
  compact = false,
}: {
  guide: Guide;
  title?: string;
  onChapter?: (index: number) => void;
  onStatus?: (playing: boolean) => void;
  /** Where the site is, for "start on arrival". */
  arrival?: { lat: number; lng: number };
  compact?: boolean;
}) {
  const { t, L, lang } = useI18n();
  // A guide not yet translated into this language is read in English, by an
  // English voice, rather than in a mixture.
  const voiceLang = guide.langs.includes(lang) ? lang : "en";
  const player = useAudioGuide(guide, voiceLang, { onChapter });
  const [mounted, setMounted] = useState(false);
  const [showText, setShowText] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    onStatus?.(player.status === "playing");
  }, [player.status, onStatus]);

  /*
   * Start on arrival. The button press that turns it on is also what lets the
   * page speak later: browsers only allow speech after a user gesture, and
   * that permission sticks for the life of the page.
   */
  const [watching, setWatching] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const watchId = useRef<number | null>(null);
  const arrived = useRef(false);
  const playRef = useRef(player.play);
  playRef.current = player.play;

  const stopWatching = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setWatching(false);
  };
  useEffect(
    () => () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    },
    [],
  );

  const startWatching = () => {
    if (!arrival || !("geolocation" in navigator)) return;
    // Prime the speech engine inside the gesture; an empty utterance is silent.
    if ("speechSynthesis" in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }
    arrived.current = false;
    setWatching(true);
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const km = distanceKm(
          position.coords.latitude,
          position.coords.longitude,
          arrival.lat,
          arrival.lng,
        );
        setDistance(km);
        if (km <= ARRIVAL_KM && !arrived.current) {
          arrived.current = true;
          toast.success(t("guide_geo_arrived"));
          playRef.current();
          stopWatching();
        }
      },
      (err) => {
        // Only a refusal is final. A timeout or a lost fix (common among
        // ruins, under trees, in a valley) is temporary, and the watch keeps
        // trying on its own.
        if (err.code !== err.PERMISSION_DENIED) return;
        toast.error(t("guide_geo_denied"));
        stopWatching();
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 30_000 },
    );
  };

  if (!mounted) return null;

  const total = guide.chapters.reduce(
    (sum, c) => sum + estimateSeconds(pick(c.text, voiceLang)),
    0,
  );
  const playing = player.status === "playing";
  // The hook resets to chapter 0 when the guide changes, but a guide can
  // also be empty; never index past the end of it.
  const current = guide.chapters[player.chapter] ?? guide.chapters[0];
  // With no voice list at all (some engines never publish one) the engine
  // still speaks with its default; with a list that lacks the language, it
  // would read Turkish in an English voice, which is worse than not reading.
  const canPlay =
    player.supported && (player.voice.available || !player.voice.listed || player.recorded);

  const iconButton =
    "grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:border-primary disabled:opacity-40";

  return (
    <section
      className="rounded-2xl surface-panel p-4 sm:p-5"
      aria-label={title ?? t("guide_title")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Headphones className="h-5 w-5 text-primary" /> {title ?? t("guide_title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {guide.chapters.length} {t("guide_chapter_count")} · ~
            {Math.max(1, Math.round(total / 60))} {t("guide_minutes")}
          </p>
        </div>
        {player.recorded ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold">
            <Mic className="h-3 w-3" /> {t("guide_recorded")}
          </span>
        ) : null}
      </div>

      {!player.supported ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("guide_unsupported")}</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={playing ? player.pause : player.play}
              disabled={!canPlay}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : player.status === "ended" ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {playing
                ? t("guide_pause")
                : player.status === "paused"
                  ? t("guide_resume")
                  : player.status === "ended"
                    ? t("guide_replay")
                    : t("guide_play")}
            </button>
            <button
              onClick={player.prev}
              disabled={!canPlay || player.chapter === 0}
              className={iconButton}
              aria-label={t("guide_prev")}
              title={t("guide_prev")}
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={player.next}
              disabled={!canPlay || player.chapter >= guide.chapters.length - 1}
              className={iconButton}
              aria-label={t("guide_next")}
              title={t("guide_next")}
            >
              <SkipForward className="h-4 w-4" />
            </button>
            {player.status !== "idle" && (
              <button
                onClick={player.stop}
                className={iconButton}
                aria-label={t("guide_stop")}
                title={t("guide_stop")}
              >
                <Square className="h-4 w-4" />
              </button>
            )}
            <label className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              {t("guide_speed")}
              <select
                value={player.rate}
                onChange={(event) => player.setRate(Number(event.target.value))}
                className="rounded-full border border-border bg-card px-2 py-1 text-xs text-foreground"
              >
                {RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}×
                  </option>
                ))}
              </select>
            </label>
          </div>

          {player.status !== "idle" && current && (
            <p className="mt-3 text-sm" aria-live="polite">
              <span className="font-semibold">
                {player.chapter + 1}/{guide.chapters.length}
              </span>{" "}
              · {L(current.title)}
            </p>
          )}

          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            {player.recorded || player.voice.offline ? (
              <>
                <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("guide_offline_ok")}
              </>
            ) : player.voice.available || !player.voice.listed ? (
              <>
                <Wifi className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("guide_online_voice")}
              </>
            ) : (
              t("guide_no_voice")
            )}
          </p>
        </>
      )}

      {!compact && (
        <ol className="mt-4 grid gap-1 sm:grid-cols-2">
          {guide.chapters.map((c, index) => (
            <li key={c.id}>
              <button
                onClick={() => player.goTo(index)}
                disabled={!canPlay}
                aria-current={
                  player.status !== "idle" && index === player.chapter ? "step" : undefined
                }
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary disabled:hover:bg-transparent ${
                  player.status !== "idle" && index === player.chapter
                    ? "bg-secondary font-semibold"
                    : ""
                }`}
              >
                <span className="truncate">
                  <span className="mr-1.5 tabular-nums text-muted-foreground">{index + 1}.</span>
                  {L(c.title)}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {clock(estimateSeconds(pick(c.text, voiceLang)))}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowText((on) => !on)}
          aria-expanded={showText}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
        >
          <FileText className="h-3.5 w-3.5" />
          {showText ? t("guide_hide_text") : t("guide_show_text")}
        </button>
        {arrival && "geolocation" in navigator && (
          <button
            onClick={watching ? stopWatching : startWatching}
            aria-pressed={watching}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary ${
              watching ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
            }`}
          >
            <LocateFixed className="h-3.5 w-3.5" />
            {watching ? t("guide_geo_on") : t("guide_geo")}
          </button>
        )}
      </div>
      {watching && distance !== null && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("guide_geo_hint").replace("{km}", formatKm(distance, lang))}
        </p>
      )}

      {showText && (
        <div className="mt-3 max-h-80 space-y-3 overflow-y-auto rounded-xl bg-secondary/60 p-4 text-sm leading-relaxed">
          {guide.chapters.map((c, index) => (
            <p
              key={c.id}
              className={
                index === player.chapter && playing ? "text-foreground" : "text-muted-foreground"
              }
            >
              <strong className="font-semibold text-foreground">{L(c.title)}.</strong>{" "}
              {pick(c.text, voiceLang)}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
