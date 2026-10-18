import { Suspense, lazy, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Columns2,
  Download,
  Ellipsis,
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
  Sun,
  Sunset,
  Tag,
  TagsIcon,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { createAmbience, type Ambience, type AmbienceScene } from "@/lib/ambience";
import { partsFor } from "@/lib/reconstruction-parts";
import { lifeFor } from "@/lib/scene-life";
import { spotsFor } from "@/lib/sound-spots";
import { soundscapeFor, type Places } from "@/lib/soundscapes";
import type { Reconstruction } from "@/lib/reconstructions";
import { useI18n } from "@/lib/i18n";
import { reconstructionGuide } from "@/lib/narration";
import { applyStories, type StoryText } from "@/lib/narration-stories";
import { structurePhotoFor } from "@/lib/structure-photos";
import { useTheme } from "@/lib/theme";
import { AudioGuide } from "./AudioGuide";
import { CompareSlider } from "./CompareSlider";
import { WalkJoystick } from "./WalkJoystick";
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

/** The dark glass every panel over the model is made of, in either theme. */
const glass =
  "border border-white/15 bg-neutral-950/55 text-white shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-neutral-950/45";

/** A button inside a glass panel: icon, and a short label where there is room. */
const tool =
  "inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-white/85 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50 aria-pressed:bg-white aria-pressed:text-neutral-900 aria-checked:bg-white aria-checked:text-neutral-900 aria-checked:hover:bg-white";

/** A secondary action under the model. */
const chip =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-semibold transition-colors hover:border-primary disabled:opacity-60";

const LIGHTS = [
  ["day", Sun, "recon_light_day"],
  ["golden", Sunset, "recon_light_sunset"],
  ["night", Moon, "recon_light_night"],
] as const;

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
  // The thumb stick's push, read by the view every frame (see WalkJoystick).
  const walkStick = useRef({ forward: 0, right: 0 });
  // How to walk: said once as the walk starts, then out of the way.
  const [hintShown, setHintShown] = useState(false);
  useEffect(() => {
    setHintShown(walking);
    if (!walking) return;
    const timer = window.setTimeout(() => setHintShown(false), 6000);
    return () => window.clearTimeout(timer);
  }, [walking]);

  /* The control bar's "more" panel: closed by Escape or a tap elsewhere. */
  const [more, setMore] = useState(false);
  const moreId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!more) return;
    const onDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setMore(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMore(false);
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [more]);

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
  // Where the stage, the altar, the stalls are: set below, once the scene's life is.
  const placesRef = useRef<Places>({});
  const startAmbience = useCallback(() => {
    ambienceRef.current ??= createAmbience();
    const engine = ambienceRef.current;
    if (!engine) return;
    engine.setPlaces(placesRef.current);
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
  // The sound's spots are found in the same model and life, and the camera
  // is the listener: near the stage the actor is louder, and to the side he is on.
  const places = useMemo(() => spotsFor(item, life), [item, life]);
  placesRef.current = places;
  useEffect(() => {
    ambienceRef.current?.setPlaces(places);
  }, [places]);
  const onListen = useCallback((at: [number, number, number], forward: [number, number]) => {
    ambienceRef.current?.setListener(at, forward);
  }, []);
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

  /*
   * Labels, people and sound: in the bar where the stage has room for them
   * beside the light (and, while walking, beside the stick too), and as rows
   * in the "more" panel where it does not. Container queries, so a stage in
   * a narrow column and a phone in full screen get the same treatment.
   */
  const roomy = walking ? "hidden @2xl:flex" : "hidden @md:flex";
  const cramped = walking ? "@2xl:hidden" : "@md:hidden";
  const switchRow = (
    key: string,
    on: boolean,
    flip: () => void,
    Icon: typeof Sun,
    label: string,
    hint?: string,
  ) => (
    <button
      key={key}
      type="button"
      role="switch"
      aria-checked={on}
      onClick={flip}
      title={hint}
      className="flex h-9 w-full items-center gap-2 rounded-xl px-2 text-xs font-semibold text-white/90 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${on ? "bg-primary" : "bg-white/25"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] motion-reduce:transition-none ${on ? "left-[1.125rem]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
  const toggles = (inPanel: boolean) =>
    (
      [
        [
          "labels",
          showLabels,
          () => setShowLabels((on) => !on),
          TagsIcon,
          "recon_ctl_labels",
          undefined,
        ],
        [
          "life",
          showLife,
          () => setShowLife((on) => !on),
          Users,
          "recon_ctl_people",
          t("recon_life_hint"),
        ],
        [
          "sound",
          ambient,
          toggleAmbient,
          ambient ? Volume2 : VolumeX,
          "recon_ctl_sound",
          t("ambience_hint"),
        ],
      ] as const
    ).map(([key, on, flip, Icon, label, hint]) =>
      inPanel ? (
        switchRow(key, on, flip, Icon, t(label), hint)
      ) : (
        <button
          key={key}
          type="button"
          aria-pressed={on}
          aria-label={t(label)}
          title={hint ?? t(label)}
          onClick={flip}
          className={tool}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden @3xl:inline">{t(label)}</span>
        </button>
      ),
    );

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
        className={`${
          full
            ? "fixed inset-0 z-[1100] h-full w-full bg-background"
            : "relative overflow-hidden rounded-2xl border border-border bg-card"
        } @container`}
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
              walkStick={walkStick}
              onListen={ambient ? onListen : undefined}
            />
          </Suspense>
        ) : (
          <Skeleton height={height} label={t("recon_loading")} />
        )}

        {/* Top right: walking, and full screen. */}
        <div
          className={`absolute right-[max(0.5rem,env(safe-area-inset-right))] top-[max(0.5rem,env(safe-area-inset-top))] z-10 flex items-center gap-1 rounded-2xl p-1 ${glass}`}
        >
          <button
            type="button"
            onClick={() => setWalking((on) => !on)}
            disabled={!sceneReady}
            data-walk-toggle
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50 ${
              walking
                ? "bg-white text-neutral-900 hover:bg-white/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {walking ? <X className="h-4 w-4" /> : <Footprints className="h-4 w-4" />}
            <span>{walking ? t("recon_walk_exit") : t("recon_walk")}</span>
          </button>
          <button
            type="button"
            onClick={toggleFull}
            aria-label={full ? t("recon_fullscreen_exit") : t("recon_fullscreen")}
            title={full ? t("recon_fullscreen_exit") : t("recon_fullscreen")}
            className={tool}
          >
            {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Under the top row: how to walk, as a chip that goes by itself; and
            in full screen, what a chosen label is, since the note under the
            model is off screen there. */}
        <div className="pointer-events-none absolute left-[max(0.5rem,env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))] top-[calc(max(0.5rem,env(safe-area-inset-top))+3.25rem)] z-10 flex flex-col items-start gap-2">
          {walking && (
            <div
              role="status"
              className={`pointer-events-auto flex max-w-[26rem] items-center gap-2 rounded-full py-1.5 pl-3.5 pr-1.5 text-xs leading-snug transition-opacity duration-700 motion-reduce:transition-none ${glass} ${
                hintShown ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!hintShown}
            >
              <Footprints className="h-3.5 w-3.5 shrink-0 text-white/70" />
              <span>{touchFirst ? t("recon_walk_hint_touch") : t("recon_walk_hint_keys")}</span>
              <button
                type="button"
                onClick={() => setHintShown(false)}
                aria-label={t("nav_close")}
                tabIndex={hintShown ? 0 : -1}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/15 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {full && chosen && (
            <p
              className={`flex max-w-[26rem] items-start gap-2 rounded-2xl p-3 text-sm leading-relaxed ${glass}`}
            >
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold">{L(chosen.label)}</strong> — {L(chosen.note)}
              </span>
            </p>
          )}
        </div>

        {/* Bottom left, while walking: the thumb stick. */}
        {walking && (
          <WalkJoystick
            label={t("recon_joystick")}
            stick={walkStick}
            className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] z-10"
          />
        )}

        {/* Bottom right: the control bar. The light is always there; the
            three toggles join it where the stage is wide enough, and fold
            into "more" where it is not, so nothing ever covers the stick. */}
        <div
          ref={barRef}
          className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.5rem,env(safe-area-inset-right))] z-10 flex items-end gap-1.5"
        >
          <div
            role="radiogroup"
            aria-label={t("recon_light")}
            className={`flex gap-0.5 rounded-2xl p-1 ${glass}`}
          >
            {LIGHTS.map(([mode, Icon, key]) => {
              const on = atmos === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={t(key)}
                  title={t(key)}
                  onClick={() => setAtmos(mode)}
                  className={tool}
                >
                  <Icon className="h-4 w-4" />
                  <span className={on ? "pr-0.5" : "hidden pr-0.5 @3xl:inline"}>{t(key)}</span>
                </button>
              );
            })}
          </div>
          <div className={`${roomy} gap-0.5 rounded-2xl p-1 ${glass}`}>{toggles(false)}</div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMore((on) => !on)}
              aria-expanded={more}
              aria-controls={moreId}
              aria-label={t("recon_more")}
              title={t("recon_more")}
              className={`grid h-11 w-11 place-items-center rounded-2xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/70 ${glass} ${more ? "bg-white! text-neutral-900!" : "hover:bg-neutral-950/70"}`}
            >
              {more ? <X className="h-4 w-4" /> : <Ellipsis className="h-5 w-5" />}
            </button>
            {more && (
              <div
                id={moreId}
                role="group"
                aria-label={t("recon_more")}
                className={`absolute bottom-full right-0 mb-2 w-[min(17rem,calc(100cqw-1rem))] space-y-3 rounded-2xl p-3 ${glass}`}
              >
                <div className="space-y-1">
                  <div className={`${cramped} space-y-1`}>{toggles(true)}</div>
                  {switchRow(
                    "quality",
                    quality,
                    () => setQuality((on) => !on),
                    Sparkles,
                    t("recon_ctl_quality"),
                    t("recon_quality_hint"),
                  )}
                  {!walking &&
                    switchRow(
                      "spin",
                      spinning,
                      () => setSpinning((on) => !on),
                      RotateCw,
                      t("recon_spin"),
                    )}
                </div>
                <div>
                  <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    {t("recon_ctl_view")}
                  </p>
                  <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_auto] gap-1 rounded-xl bg-white/10 p-1">
                    {(["front", "corner", "above"] as const).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setWalking(false);
                          setView({ name, token: Date.now() });
                        }}
                        className="h-8 truncate rounded-lg px-1 text-xs font-semibold text-white/85 outline-none hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        {t(`recon_view_${name}` as const)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setWalking(false);
                        setActive(null);
                        setResetToken((n) => n + 1);
                      }}
                      aria-label={t("recon_reset")}
                      title={t("recon_reset")}
                      className="grid h-8 w-8 place-items-center rounded-lg text-white/85 outline-none hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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

      {/* Under the model, only what takes the model elsewhere: AR, the file,
          the photograph of today. Everything that changes the view is on it. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
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
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
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
          <button onClick={() => setCaptureToken((n) => n + 1)} className={chip}>
            <Columns2 className="h-3.5 w-3.5" /> {t("recon_compare")}
          </button>
        )}
        <button
          onClick={() => {
            setExportFor("download");
            setExporting(true);
            setExportToken((n) => n + 1);
          }}
          disabled={exporting || !sceneReady}
          className={chip}
        >
          <Download className="h-3.5 w-3.5" />
          {exporting && exportFor === "download" ? t("recon_exporting") : t("recon_export")}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("recon_hint")}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("recon_scale")} {t("recon_landscape_note")} {t("recon_life_note")}{" "}
        {t("recon_face_credit")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("ambience_credit")}{" "}
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
