import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Columns2,
  Download,
  Footprints,
  Glasses,
  Maximize2,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
  Moon,
  RotateCcw,
  RotateCw,
  Square,
  Sun,
  Sunset,
  Tag,
  TagsIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { createAmbience, type Ambience, type AmbienceScene } from "@/lib/ambience";
import { partsFor } from "@/lib/reconstruction-parts";
import { lifeFor } from "@/lib/scene-life";
import { soundscapeFor } from "@/lib/soundscapes";
import type { Reconstruction } from "@/lib/reconstructions";
import { useI18n } from "@/lib/i18n";
import { reconstructionGuide } from "@/lib/narration";
import { applyStories, type StoryText } from "@/lib/narration-stories";
import { structurePhotoFor } from "@/lib/structure-photos";
import { useTheme } from "@/lib/theme";
import { AudioGuide } from "./AudioGuide";
import { CompareSlider } from "./CompareSlider";
import { arSupport, openQuickLook, startWebXR, type ARMode } from "./ar/launch-ar";
import type { AtmosMode } from "./Reconstruction3DInner";
import type { Biome } from "./scene/landscape";

/**
 * What grows round each model. Olive and cypress are the default because most
 * of these buildings stand near the Aegean or Mediterranean coast; the three
 * that do not are named, since trees in the wrong place are a claim too.
 */
const BIOME: Partial<Record<string, Biome>> = {
  "gobeklitepe-d-yapisi": "steppe",
  "aizanoi-zeus-tapinagi": "steppe",
  "nemrut-dogu-terasi": "mountain",
};

/** The photograph of what stands there today, for the before/after slider. */
function todayPhotoFor(item: Reconstruction): string | undefined {
  return structurePhotoFor(item.siteSlug, item.structure.tr);
}

// three.js reaches for `window` and a canvas as it initialises, and it is the
// heaviest thing this app can load — so it stays out of the SSR graph and out
// of every bundle but this one.
const Inner = lazy(() => import("./Reconstruction3DInner"));

function Skeleton({ height, label }: { height: string; label: string }) {
  return (
    <div
      className="grid animate-pulse place-items-center rounded-2xl border border-border bg-muted text-sm text-muted-foreground"
      style={{ height }}
    >
      {label}
    </div>
  );
}

const control =
  "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary";

/** A round button floating over the model itself. */
const floating =
  "inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card/85 px-2.5 text-sm font-semibold shadow-md backdrop-blur transition-colors hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground";

/** The prefixed names Safari still uses for element full screen. */
type WebkitElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};
/** Where the visitor's choice to silence the models is remembered. */
const AMBIENCE_KEY = "antik-ambience";

const fullscreenElement = () =>
  document.fullscreenElement ?? (document as WebkitDocument).webkitFullscreenElement ?? null;

export function Reconstruction3D({
  item,
  stories,
  height = "clamp(320px, 62vh, 640px)",
}: {
  item: Reconstruction;
  /** The tour's written chapters, when it has them (see narration-stories). */
  stories?: StoryText | undefined;
  height?: string;
}) {
  const { t, L } = useI18n();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const [atmos, setAtmos] = useState<AtmosMode>("day");
  const [view, setView] = useState<{ name: "front" | "above" | "corner"; token: number } | null>(
    null,
  );

  useEffect(() => setMounted(true), []);

  /*
   * Full screen: the model, its labels and the buttons over it, as large as
   * the screen. The real Fullscreen API where the browser has it for an
   * element; where it does not — an iPhone's Safari only does it for video —
   * the same box is pinned over the whole page instead, above the app's tab
   * bar, with the page behind it held still.
   */
  const stageRef = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState<"native" | "pseudo" | null>(null);
  const enterFull = () => {
    const stage = stageRef.current as WebkitElement | null;
    if (!stage) return;
    const doc = document as WebkitDocument;
    const enabled = document.fullscreenEnabled || doc.webkitFullscreenEnabled === true;
    const request = stage.requestFullscreen
      ? () => stage.requestFullscreen()
      : stage.webkitRequestFullscreen
        ? () => stage.webkitRequestFullscreen?.()
        : null;
    track("3D fullscreen", { model: item.id });
    if (!enabled || !request) {
      setFull("pseudo");
      return;
    }
    try {
      // `fullscreenchange` says when it worked; a refusal falls back.
      void Promise.resolve(request()).catch(() => setFull("pseudo"));
    } catch {
      setFull("pseudo");
    }
  };
  const exitFull = () => {
    if (full === "native" && fullscreenElement()) {
      const doc = document as WebkitDocument;
      if (document.exitFullscreen) void document.exitFullscreen().catch(() => setFull(null));
      else void doc.webkitExitFullscreen?.();
      return;
    }
    setFull(null);
  };
  const toggleFull = () => (full ? exitFull() : enterFull());
  useEffect(() => {
    // Esc, the browser's own button, or the system gesture all end up here.
    const onChange = () => {
      const now = fullscreenElement();
      setFull((was) =>
        now && now === stageRef.current ? "native" : was === "native" ? null : was,
      );
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);
  useEffect(() => {
    if (full !== "pseudo") return;
    // The page behind stays where it was, and Esc works as it does natively.
    const root = document.documentElement;
    const was = [root.style.overflow, document.body.style.overflow];
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFull(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = was[0] ?? "";
      document.body.style.overflow = was[1] ?? "";
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  /* Walking: first person, at eye height, inside the model. */
  const [walking, setWalking] = useState(false);
  const [touchFirst, setTouchFirst] = useState(false);
  useEffect(() => setTouchFirst(window.matchMedia("(pointer: coarse)").matches), []);
  const onWalkEnd = useCallback(() => setWalking(false), []);
  const padLabels = useMemo(
    () => ({
      forward: t("recon_move_forward"),
      back: t("recon_move_back"),
      left: t("recon_move_left"),
      right: t("recon_move_right"),
    }),
    [t],
  );

  /* High quality: ambient occlusion. On by default where there is a mouse —
     a desktop GPU — and off on touch devices, where it costs battery. */
  const [quality, setQuality] = useState(false);
  useEffect(() => {
    // Desktop-class only: a fine pointer, and enough cores and memory that
    // the extra pass costs frames rather than the whole page.
    const nav = navigator as Navigator & { deviceMemory?: number };
    const capable =
      !window.matchMedia("(pointer: coarse)").matches &&
      (navigator.hardwareConcurrency ?? 4) >= 6 &&
      (nav.deviceMemory ?? 8) >= 4;
    setQuality(capable);
  }, []);

  /*
   * The sound of the place. On by default — the owner wants every model to be
   * heard — but a browser lets nothing play before the visitor has touched the
   * page, so it starts on the first tap, click or key (at once, if they
   * already have). Turning it off is remembered.
   */
  const ambienceRef = useRef<Ambience | null>(null);
  const [ambient, setAmbient] = useState(true);
  useEffect(() => {
    try {
      if (window.localStorage.getItem(AMBIENCE_KEY) === "off") setAmbient(false);
    } catch {
      /* storage blocked: keep the default */
    }
  }, []);
  const scape = useMemo(() => soundscapeFor(item), [item]);
  const ambientScene = useMemo<AmbienceScene>(() => ({ scape, time: atmos }), [scape, atmos]);
  const sceneRef = useRef(ambientScene);
  sceneRef.current = ambientScene;
  const startAmbience = useCallback(() => {
    ambienceRef.current ??= createAmbience();
    const engine = ambienceRef.current;
    if (!engine) return;
    engine.setScene(sceneRef.current);
    void engine.start();
  }, []);
  useEffect(() => {
    if (!ambient || !mounted) return;
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
      .userActivation;
    if (activation?.hasBeenActive) {
      startAmbience();
      return;
    }
    const gestures = ["pointerdown", "keydown", "touchend"] as const;
    const onGesture = () => {
      gestures.forEach((name) => window.removeEventListener(name, onGesture, true));
      startAmbience();
    };
    gestures.forEach((name) => window.addEventListener(name, onGesture, true));
    return () => gestures.forEach((name) => window.removeEventListener(name, onGesture, true));
  }, [ambient, mounted, startAmbience]);
  const toggleAmbient = () => {
    const next = !ambient;
    try {
      window.localStorage.setItem(AMBIENCE_KEY, next ? "on" : "off");
    } catch {
      /* not remembered, but still obeyed */
    }
    track("3D ambience", { model: item.id, on: next ? "on" : "off" });
    setAmbient(next);
    if (next) startAmbience();
    else ambienceRef.current?.stop();
  };
  useEffect(() => {
    ambienceRef.current?.setScene(ambientScene);
  }, [ambientScene]);
  useEffect(
    () => () => {
      ambienceRef.current?.dispose();
      ambienceRef.current = null;
    },
    [],
  );

  /* The narrated tour turns the camera to each hotspot as the voice gets to it. */
  const guide = useMemo(() => applyStories(reconstructionGuide(item), stories), [item, stories]);
  const onChapter = useCallback(
    (index: number) => {
      // The tour moves the camera, so a walk in progress ends first.
      setWalking(false);
      const chapter = guide.chapters[index];
      if (chapter?.hotspot !== undefined) {
        setShowLabels(true);
        setActive(chapter.hotspot);
      } else {
        setActive(null);
        setView({ name: index === 0 ? "front" : "corner", token: Date.now() });
      }
    },
    [guide],
  );
  const onGuideStatus = useCallback((playing: boolean) => {
    ambienceRef.current?.duck(playing);
  }, []);

  /* AR: which route this device has, if any. */
  const [arMode, setArMode] = useState<ARMode | null>(null);
  const [arReady, setArReady] = useState(false);
  const arDataRef = useRef<ArrayBuffer | null>(null);
  const launchAR = () => {
    const data = arDataRef.current;
    if (!data) return;
    track("AR started", { model: item.id, mode: arMode ?? "none" });
    const launch =
      arMode === "quicklook"
        ? openQuickLook(data, item.id)
        : startWebXR(data, {
            realSize: t("recon_ar_real"),
            tabletop: t("recon_ar_tabletop"),
            exit: t("recon_ar_exit"),
            hint: t("recon_ar_place"),
          });
    launch.catch(() => toast.error(t("recon_ar_unsupported")));
  };
  useEffect(() => {
    void arSupport().then(setArMode);
  }, []);

  /* Before / after: a still of the model beside today's photograph. */
  const todayPhoto = todayPhotoFor(item);
  const [captureToken, setCaptureToken] = useState(0);
  const [still, setStill] = useState<string | null>(null);
  const onCaptured = useCallback((url: string) => setStill(url), []);
  // Rebuilding the geometry on every render would rebuild the whole scene.
  const parts = useMemo(() => partsFor(item.model), [item.model]);
  // The people, fires and furniture of the place, and whether they are shown.
  const life = useMemo(() => lifeFor(item), [item]);
  const [showLife, setShowLife] = useState(true);
  // Same for the labels: a new array every render would rebuild every pin.
  const labels = useMemo(
    () => item.hotspots.map((spot) => ({ text: L(spot.label), at: spot.at })),
    [item.hotspots, L],
  );
  const onPickLabel = useCallback(
    (index: number) => setActive((current) => (current === index ? null : index)),
    [],
  );

  /*
   * The model, handed over as a file. Everything here is generated from
   * measurements at runtime, so until this there was nothing anyone could open
   * in Blender — only a picture of it.
   */
  const [exportToken, setExportToken] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportFor, setExportFor] = useState<"download" | "ar">("download");
  // Until the scene is built there is nothing to export; the buttons wait.
  const [sceneReady, setSceneReady] = useState(false);
  const onExported = useCallback(
    (data: ArrayBuffer | null) => {
      if (!data) {
        // No scene yet, or the exporter threw: free the button again.
        setExporting(false);
        toast.error(t("offline_failed"));
        return;
      }
      if (exportFor === "ar") {
        // AR has to start inside a tap, and building the file can outlast the
        // browser's patience with the first one — so it is kept, and the
        // button asks for a second tap that launches at once.
        arDataRef.current = data;
        setExporting(false);
        setArReady(true);
        return;
      }
      const url = URL.createObjectURL(new Blob([data], { type: "model/gltf-binary" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.id}.glb`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    },
    [item.id, exportFor, t],
  );

  const chosen = active === null ? undefined : item.hotspots[active];

  return (
    <div>
      {/* The stage: the model with the buttons and labels over it — the box
          that goes full screen, so everything on it comes along. */}
      <div
        ref={stageRef}
        onDoubleClick={(event) => {
          // A double click on the model itself, not on a label or a button,
          // and not while walking, where a drag is a look round.
          if (event.target instanceof HTMLCanvasElement && !walking) toggleFull();
        }}
        className={
          full
            ? "fixed inset-0 z-[1100] h-full w-full bg-background"
            : "relative overflow-hidden rounded-2xl border border-border bg-card"
        }
      >
        {mounted ? (
          <Suspense
            fallback={<Skeleton height={full ? "100%" : height} label={t("recon_loading")} />}
          >
            <Inner
              parts={parts}
              kind={item.model.kind}
              theme={theme}
              atmos={atmos}
              autoRotate={spinning}
              resetToken={resetToken}
              label={`${L(item.title)} — ${t("recon_unavailable")}`}
              height={full ? "100%" : height}
              labels={labels}
              showLabels={showLabels}
              activeLabel={active}
              onPickLabel={onPickLabel}
              view={view}
              exportToken={exportToken}
              onExported={onExported}
              onReady={setSceneReady}
              exportWithoutGround={exportFor === "ar"}
              biome={BIOME[item.id] ?? "mediterranean"}
              quality={quality}
              captureToken={captureToken}
              onCaptured={onCaptured}
              life={life}
              showLife={showLife}
              walk={walking}
              onWalkEnd={onWalkEnd}
              padLabels={padLabels}
            />
          </Suspense>
        ) : (
          <Skeleton height={height} label={t("recon_loading")} />
        )}

        {/* Walk and full screen, on the model where the eye already is. */}
        <div className="absolute right-[max(0.5rem,env(safe-area-inset-right))] top-[max(0.5rem,env(safe-area-inset-top))] z-10 flex gap-2">
          <button
            type="button"
            onClick={() => setWalking((on) => !on)}
            disabled={!sceneReady}
            aria-pressed={walking}
            title={walking ? t("recon_walk_exit") : t("recon_walk")}
            className={`${floating} disabled:opacity-60`}
          >
            <Footprints className="h-4 w-4" />
            <span>{walking ? t("recon_walk_exit") : t("recon_walk")}</span>
          </button>
          <button
            type="button"
            onClick={toggleFull}
            aria-label={full ? t("recon_fullscreen_exit") : t("recon_fullscreen")}
            title={full ? t("recon_fullscreen_exit") : t("recon_fullscreen")}
            className={floating}
          >
            {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* How to walk, while walking; and in full screen, what a chosen label
            is, since the note under the model is off screen there. */}
        {(walking || (full && chosen)) && (
          <div className="pointer-events-none absolute left-[max(0.5rem,env(safe-area-inset-left))] top-[max(0.5rem,env(safe-area-inset-top))] z-10 flex max-w-[min(26rem,calc(100%-12rem))] flex-col gap-2 max-sm:top-[calc(max(0.5rem,env(safe-area-inset-top))+3rem)] max-sm:max-w-[calc(100%-1rem)]">
            {walking && (
              <p className="rounded-xl bg-black/55 px-3 py-2 text-xs leading-snug text-white backdrop-blur">
                {touchFirst ? t("recon_walk_hint_touch") : t("recon_walk_hint_keys")}
              </p>
            )}
            {full && chosen && (
              <p className="flex items-start gap-2 rounded-xl border-l-4 border-primary bg-secondary/90 p-3 text-sm leading-relaxed text-secondary-foreground backdrop-blur">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong className="font-semibold">{L(chosen.label)}</strong> — {L(chosen.note)}
                </span>
              </p>
            )}
          </div>
        )}

        {/* In full screen the toolbars under the model are out of sight, so
            the ones that change what is on screen come along as icons. */}
        {full && (
          <div className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.5rem,env(safe-area-inset-left))] z-10 flex max-w-[calc(100%-11rem)] flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowLabels((on) => !on)}
              aria-pressed={showLabels}
              aria-label={showLabels ? t("recon_labels_hide") : t("recon_labels_show")}
              title={showLabels ? t("recon_labels_hide") : t("recon_labels_show")}
              className={floating}
            >
              <TagsIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowLife((on) => !on)}
              aria-pressed={showLife}
              aria-label={showLife ? t("recon_life_hide") : t("recon_life_show")}
              title={showLife ? t("recon_life_hide") : t("recon_life_show")}
              className={floating}
            >
              <Users className="h-4 w-4" />
            </button>
            {!walking && (
              <button
                type="button"
                onClick={() => setSpinning((on) => !on)}
                aria-pressed={spinning}
                aria-label={spinning ? t("recon_spin_stop") : t("recon_spin")}
                title={spinning ? t("recon_spin_stop") : t("recon_spin")}
                className={floating}
              >
                {spinning ? <Square className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setWalking(false);
                setActive(null);
                setResetToken((n) => n + 1);
              }}
              aria-label={t("recon_reset")}
              title={t("recon_reset")}
              className={floating}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            {(
              [
                ["day", Sun],
                ["golden", Sunset],
                ["night", Moon],
              ] as const
            ).map(([mode, Icon]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAtmos(mode)}
                aria-pressed={atmos === mode}
                aria-label={t(`recon_light_${mode}` as const)}
                title={t(`recon_light_${mode}` as const)}
                className={floating}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* What a chosen label is for. It sits directly under the model rather
          than in a side panel, so the eye does not have to leave the thing it
          just clicked. */}
      {chosen && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border-l-4 border-primary bg-secondary p-3 text-sm leading-relaxed text-secondary-foreground">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <strong className="font-semibold">{L(chosen.label)}</strong> — {L(chosen.note)}
          </span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowLabels((on) => !on)}
          aria-pressed={showLabels}
          className={control}
        >
          <TagsIcon className="h-4 w-4" />
          {showLabels ? t("recon_labels_hide") : t("recon_labels_show")}
        </button>
        <button
          onClick={() => setShowLife((on) => !on)}
          aria-pressed={showLife}
          title={t("recon_life_hint")}
          className={control}
        >
          <Users className="h-4 w-4" />
          {showLife ? t("recon_life_hide") : t("recon_life_show")}
        </button>
        <button
          onClick={() => setSpinning((on) => !on)}
          aria-pressed={spinning}
          className={control}
        >
          {spinning ? <Square className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
          {spinning ? t("recon_spin_stop") : t("recon_spin")}
        </button>
        <button
          onClick={() => {
            setWalking(false);
            setActive(null);
            setResetToken((n) => n + 1);
          }}
          className={control}
        >
          <RotateCcw className="h-4 w-4" /> {t("recon_reset")}
        </button>
      </div>

      {/* Named viewpoints, so the model can be met from the angles it was
          built to be met from without anyone having to drag their way there. */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("recon_views")}
        </span>
        {(["front", "corner", "above"] as const).map((name) => (
          <button
            key={name}
            onClick={() => {
              setWalking(false);
              setView({ name, token: Date.now() });
            }}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
          >
            {t(`recon_view_${name}` as const)}
          </button>
        ))}
        <button
          onClick={() => {
            setExportFor("download");
            setExporting(true);
            setExportToken((n) => n + 1);
          }}
          disabled={exporting || !sceneReady}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {exporting ? t("recon_exporting") : t("recon_export")}
        </button>
        <p className="text-xs text-muted-foreground">{t("recon_hint")}</p>
      </div>

      {/* Light: the same building under a high sun, a low one, or the moon. */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("recon_light")}
        </span>
        {(
          [
            ["day", Sun],
            ["golden", Sunset],
            ["night", Moon],
          ] as const
        ).map(([mode, Icon]) => (
          <button
            key={mode}
            onClick={() => setAtmos(mode)}
            aria-pressed={atmos === mode}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
          >
            <Icon className="h-3.5 w-3.5" />
            {t(`recon_light_${mode}` as const)}
          </button>
        ))}{" "}
        <p className="text-xs text-muted-foreground">{t("recon_light_hint")}</p>
      </div>

      {/* Realism, sound, AR, and the photograph of today. */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setQuality((on) => !on)}
          aria-pressed={quality}
          title={t("recon_quality_hint")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary ${
            quality ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> {t("recon_quality")}
        </button>
        <button
          onClick={toggleAmbient}
          aria-pressed={ambient}
          title={t("ambience_hint")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary ${
            ambient ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
          }`}
        >
          {ambient ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {ambient ? t("ambience_off") : t("ambience_on")}
        </button>
        {arMode && (
          <button
            onClick={() => {
              if (arReady) {
                launchAR();
                return;
              }
              setExportFor("ar");
              setExporting(true);
              setExportToken((n) => n + 1);
            }}
            disabled={exporting || (!arReady && !sceneReady)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <Glasses className="h-3.5 w-3.5" />
            {exporting && exportFor === "ar"
              ? t("recon_ar_preparing")
              : arReady
                ? t("recon_ar_start")
                : t("recon_ar")}
          </button>
        )}
        {todayPhoto && (
          <button
            onClick={() => setCaptureToken((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary"
          >
            <Columns2 className="h-3.5 w-3.5" /> {t("recon_compare")}
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("recon_scale")} {t("recon_landscape_note")} {t("recon_life_note")}{" "}
        {t("recon_face_credit")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("ambience_credit")} (
        <a
          href="https://www.wildfiregames.com/"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          Wildfire Games
        </a>
        ,{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/"
          target="_blank"
          rel="noreferrer license"
          className="hover:underline"
        >
          CC BY-SA 3.0
        </a>
        ) {t("ambience_credit_rest")}{" "}
        <a href="/ambience/CREDITS.txt" target="_blank" rel="noreferrer" className="underline">
          {t("ambience_credit_all")}
        </a>
      </p>

      {still && todayPhoto && (
        <div className="mt-4">
          <CompareSlider
            before={todayPhoto}
            after={still}
            beforeLabel={t("recon_compare_today")}
            afterLabel={t("recon_compare_then")}
            alt={L(item.title)}
            onClose={() => setStill(null)}
          />
          <p className="mt-2 text-xs text-muted-foreground">{t("recon_compare_hint")}</p>
        </div>
      )}

      <div className="mt-4">
        <AudioGuide
          guide={guide}
          title={t("guide_tour_title")}
          onChapter={onChapter}
          onStatus={onGuideStatus}
          compact
        />
      </div>
    </div>
  );
}
