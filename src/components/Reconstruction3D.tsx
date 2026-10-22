import { Suspense, lazy, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Aperture,
  Camera,
  Check,
  Circle,
  Clock,
  Cloud,
  Columns2,
  Crosshair,
  Gauge,
  MessageCircle,
  Pause,
  Play,
  Route,
  Ruler,
  SkipBack,
  SkipForward,
  Smartphone,
  Trophy,
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
import type { Ambience } from "@/lib/ambience";
import { partsFor } from "@/lib/reconstruction-parts";
import type { Material } from "@/lib/reconstruction-parts";
import type { SceneLife } from "@/lib/scene-life";
import type { Places } from "@/lib/soundscapes";
import type { Reconstruction } from "@/lib/reconstructions";
import { useI18n } from "@/lib/i18n";
import { reconstructionGuide } from "@/lib/narration";
import { applyStories, type StoryText } from "@/lib/narration-stories";
import { useTheme } from "@/lib/theme";
import { assessDevice, framesTooSlow, isHeavy } from "@/lib/device-tier";
import type * as PersonStories from "@/lib/person-stories";
import { creditLine } from "@/lib/photo-credits";
import {
  badgeId,
  generateQuests,
  markQuestDone,
  questHit,
  questTitle,
  readQuests,
  type Quest,
} from "@/lib/quests";
import { boundsOf, type Part } from "@/lib/reconstruction-parts";
import { RS, fill } from "@/lib/recon-strings";
import { todayPhotoFor } from "@/lib/today-photo";
import { planTour, type TourStop } from "@/lib/tour";
import { defaultWeather } from "@/lib/weather";
import { claimSpeech } from "@/hooks/use-audio-guide";
import { useGuidedTour } from "@/hooks/use-guided-tour";
import type { Localized } from "@/lib/i18n";
import { AudioGuide } from "./AudioGuide";
import { CompareSlider } from "./CompareSlider";
import { WalkJoystick } from "./WalkJoystick";
import { arSupport, openQuickLook, startWebXR, type ARMode } from "./ar/launch-ar";
import type { AtmosMode, PersonHit, SceneExtras, SceneInfo } from "./Reconstruction3DInner";
import { biomeFor } from "@/lib/landscape-plan";

/**
 * What grows round each model. Olive and cypress are the default because most
 * of these buildings stand near the Aegean or Mediterranean coast; the three
 * that do not are named, since trees in the wrong place are a claim too.
 */

/** Where the visitor's own choice of quality is remembered: "high" or "lite". */
const QUALITY_KEY = "antik-3d-quality";

const readKey = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeKey = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* not remembered, but still obeyed */
  }
};

/** The named statues and the inscriptions of a model, for its quests. */
function questSources(parts: Part[], props: Part[], stone: readonly Material[]) {
  const statues: { name: string; at: [number, number, number]; height: number }[] = [];
  const plates: { at: [number, number, number]; width: number; height: number }[] = [];
  for (const part of [...parts, ...props]) {
    if (part.kind === "figure" && part.identity && stone.includes(part.material))
      statues.push({ name: part.identity.name, at: part.at, height: part.height });
    if (part.kind === "box" && (part as { lettering?: unknown }).lettering)
      plates.push({ at: part.at, width: part.size[0], height: part.size[1] });
  }
  return { statues, plates };
}

// three.js reaches for `window` and a canvas as it initialises, and it is the
// heaviest thing this app can load — so it stays out of the SSR graph and out
// of every bundle but this one.
const loadInner = () => import("./Reconstruction3DInner");
const Inner = lazy(loadInner);

/*
 * The life of the scene — who stands where, in what clothes, doing what —
 * is a few hundred kilobytes of data and rules, needed only once the 3D view
 * is about to be built. It is fetched alongside the renderer instead of with
 * the page, so the page's own text and pictures do not wait for it.
 */
type LifeKit = {
  lifeFor: typeof import("@/lib/scene-life").lifeFor;
  statueMaterials: readonly Material[];
  spotsFor: typeof import("@/lib/sound-spots").spotsFor;
};
let lifeKitLoad: Promise<LifeKit> | null = null;
const loadLifeKit = () => {
  lifeKitLoad ??= Promise.all([import("@/lib/scene-life"), import("@/lib/sound-spots")]).then(
    ([life, spots]) => ({
      lifeFor: life.lifeFor,
      statueMaterials: life.STATUE_MATERIALS,
      spotsFor: spots.spotsFor,
    }),
  );
  lifeKitLoad.catch(() => {
    lifeKitLoad = null;
  });
  return lifeKitLoad;
};

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
  const { t, L, lang } = useI18n();
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

  // While walking or full screen, the app's tab bar steps aside so it never
  // sits over the thumb stick or the control bar (see AppShell's MobileTabs).
  useEffect(() => {
    if (!walking && !full) return;
    const root = document.documentElement;
    root.dataset["immersive"] = "";
    return () => {
      delete root.dataset["immersive"];
    };
  }, [walking, full]);

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
  /*
   * The sound engine and the soundscapes (a hundred kilobytes of synthesis
   * and scores) are fetched only when the sound is about to start, so the
   * page and the model never wait on them, and a visitor who keeps the sound
   * off never downloads them.
   */
  const audioRef = useRef<{
    createAmbience: typeof import("@/lib/ambience").createAmbience;
    soundscapeFor: typeof import("@/lib/soundscapes").soundscapeFor;
  } | null>(null);
  const audioLoad = useRef<Promise<void> | null>(null);
  const aliveRef = useRef(true);
  const itemRef = useRef(item);
  itemRef.current = item;
  const atmosRef = useRef(atmos);
  atmosRef.current = atmos;
  const sceneNow = () => {
    const audio = audioRef.current;
    return audio ? { scape: audio.soundscapeFor(itemRef.current), time: atmosRef.current } : null;
  };
  // Where the stage, the altar, the stalls are: set below, once the scene's life is.
  const placesRef = useRef<Places>({});
  // Whether the sound should be playing now: it may be switched off while
  // the engine is still on its way.
  const wantSoundRef = useRef(false);
  const startAmbience = useCallback(() => {
    wantSoundRef.current = true;
    audioLoad.current ??= Promise.all([import("@/lib/ambience"), import("@/lib/soundscapes")])
      .then(([ambience, scapes]) => {
        audioRef.current = {
          createAmbience: ambience.createAmbience,
          soundscapeFor: scapes.soundscapeFor,
        };
      })
      .catch(() => {
        // Offline and never fetched: no sound, and another try next time.
        audioLoad.current = null;
      });
    void audioLoad.current.then(() => {
      const audio = audioRef.current;
      if (!audio || !aliveRef.current || !wantSoundRef.current) return;
      ambienceRef.current ??= audio.createAmbience();
      const engine = ambienceRef.current;
      const scene = sceneNow();
      if (!engine || !scene) return;
      engine.setPlaces(placesRef.current);
      engine.setScene(scene);
      void engine.start();
    });
    // `sceneNow` reads refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    else {
      wantSoundRef.current = false;
      ambienceRef.current?.stop();
    }
  };
  useEffect(() => {
    const scene = sceneNow();
    if (scene) ambienceRef.current?.setScene(scene);
    // `sceneNow` reads the refs these two keep current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, atmos]);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      ambienceRef.current?.dispose();
      ambienceRef.current = null;
    };
  }, []);

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
  // The comparison is a dialog over the page: Esc closes it, and the page
  // behind does not scroll while it is open.
  useEffect(() => {
    if (!still) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStill(null);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [still]);
  const onCaptured = useCallback((url: string) => setStill(url), []);
  // Rebuilding the geometry on every render would rebuild the whole scene.
  const parts = useMemo(() => partsFor(item.model), [item.model]);
  // The people, fires and furniture of the place, and whether they are shown.
  const [lifeKit, setLifeKit] = useState<LifeKit | null>(null);
  const [lifeRetry, setLifeRetry] = useState(0);
  useEffect(() => {
    let live = true;
    // The renderer's own chunk is asked for at the same moment, not after.
    void loadInner().catch(() => {});
    loadLifeKit().then(
      (kit) => live && setLifeKit(kit),
      // Offline before it was ever fetched: try again when the network is back.
      () => {
        const again = () => live && setLifeRetry((n) => n + 1);
        window.addEventListener("online", again, { once: true });
      },
    );
    return () => {
      live = false;
    };
  }, [lifeRetry]);
  const life = useMemo<SceneLife | null>(
    () => (lifeKit ? lifeKit.lifeFor(item) : null),
    [lifeKit, item],
  );
  // The sound's spots are found in the same model and life, and the camera
  // is the listener: near the stage the actor is louder, and to the side he is on.
  const places = useMemo<Places>(
    () => (lifeKit && life ? lifeKit.spotsFor(item, life) : {}),
    [lifeKit, item, life],
  );
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
   * The model, built in memory for AR only. The 3D models are not offered as
   * files to download; AR needs the geometry handed to the phone's viewer,
   * and that copy never leaves the page.
   */
  const [exportToken, setExportToken] = useState(0);
  const [exporting, setExporting] = useState(false);
  // Until the scene is built there is nothing to show in AR; the button waits.
  const [sceneReady, setSceneReady] = useState(false);
  // How far the scene's build has got (see `onProgress`); 1 once it is drawn.
  const [buildProgress, setBuildProgress] = useState(0);
  useEffect(() => setBuildProgress(0), [item.id]);
  const onExported = useCallback(
    (data: ArrayBuffer | null) => {
      if (!data) {
        // No scene yet, or the exporter threw: free the button again.
        setExporting(false);
        toast.error(t("offline_failed"));
        return;
      }
      // AR has to start inside a tap, and building the model can outlast the
      // browser's patience with the first one — so it is kept, and the
      // button asks for a second tap that launches at once.
      arDataRef.current = data;
      setExporting(false);
      setArReady(true);
    },
    [t],
  );

  const chosen = active === null ? undefined : item.hotspots[active];

  /* ---- The scene's newer abilities (see SceneExtras in the inner view) ---- */
  const [extras, setExtras] = useState<SceneExtras | null>(null);
  const extrasRef = useRef<SceneExtras | null>(null);
  extrasRef.current = extras;
  const reducedMotion = useRef(false);
  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  /* ---- Guided tour ---- */
  const plan = useMemo(
    () => planTour(guide, item.hotspots, !stories),
    [guide, item.hotspots, stories],
  );
  const onTourStop = useCallback((stop: TourStop, index: number) => {
    setWalking(false);
    setSpinning(false);
    setActive(null);
    extrasRef.current?.tourShot(
      stop.kind === "spot" ? { at: stop.at } : { view: stop.view },
      true,
      index % 2 === 0 ? 1 : -1,
    );
  }, []);
  const onTourEnd = useCallback(() => extrasRef.current?.endTour(), []);
  const tour = useGuidedTour({
    guide: plan.guide,
    stops: plan.stops,
    lang,
    onStop: onTourStop,
    onEnd: onTourEnd,
  });
  const tourChapter = tour.active ? plan.guide.chapters[tour.index] : undefined;
  const tourSpot =
    tourChapter?.hotspot !== undefined ? item.hotspots[tourChapter.hotspot] : undefined;
  const toggleTour = () => {
    if (tour.active) {
      tour.exit();
      return;
    }
    track("3D tour", { model: item.id });
    setMore(false);
    tour.start();
  };

  /* ---- Talking people ---- */
  const [speech, setSpeech] = useState<{ role: Localized; text: Localized; key: string } | null>(
    null,
  );
  const taps = useRef(new Map<string, number>());
  /*
   * What people say (well over a hundred kilobytes of lines in five
   * languages) is fetched once the model is up, in idle time, rather than
   * with the page: nobody can tap a person before then.
   */
  const storiesRef = useRef<typeof PersonStories | null>(null);
  const storiesLoad = useRef<Promise<typeof PersonStories> | null>(null);
  const loadStories = useCallback(() => {
    storiesLoad.current ??= import("@/lib/person-stories").then((module) => {
      storiesRef.current = module;
      return module;
    });
    storiesLoad.current.catch(() => {
      storiesLoad.current = null;
    });
    return storiesLoad.current;
  }, []);
  const onPerson = useCallback(
    (hit: PersonHit | null) => {
      if (!hit) {
        setSpeech(null);
        return;
      }
      const key = hit.kind === "person" ? `p${hit.index}` : `c${hit.seat}`;
      const count = taps.current.get(key) ?? 0;
      taps.current.set(key, count + 1);
      void loadStories().then(({ personLine, spectatorLine, ROLE_NAMES }) => {
        if (!life) return;
        const said =
          hit.kind === "person"
            ? life.people[hit.index]
              ? personLine(life.era, life.people[hit.index]!, hit.index, count)
              : null
            : spectatorLine(life.era, hit.seat, count);
        if (!said) return;
        track("3D person", { model: item.id, role: said.role });
        setQuestsOpen(false);
        setSpeech({ role: ROLE_NAMES[said.role], text: said.text, key: `${key}-${count}` });
      });
    },
    [life, item.id, loadStories],
  );
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const stories = storiesRef.current;
    if (!stories) return;
    claimSpeech("person-card");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = stories.SPEECH_LANG[lang];
    window.speechSynthesis.speak(utterance);
  };
  const [peopleHint, setPeopleHint] = useState(false);
  useEffect(() => {
    if (!sceneReady || !life || (life.people.length === 0 && life.crowd.length === 0)) return;
    const run = () => void loadStories().catch(() => {});
    if ("requestIdleCallback" in window) window.requestIdleCallback(run);
    else setTimeout(run, 1500);
  }, [sceneReady, life, loadStories]);
  const peopleCount = life?.people.length ?? 0;
  useEffect(() => {
    if (!sceneReady || peopleCount === 0) return;
    try {
      if (window.sessionStorage.getItem("antik-people-hint")) return;
      window.sessionStorage.setItem("antik-people-hint", "1");
    } catch {
      /* show it anyway */
    }
    setPeopleHint(true);
    const timer = window.setTimeout(() => setPeopleHint(false), 7000);
    return () => window.clearTimeout(timer);
  }, [sceneReady, peopleCount]);

  /* ---- Looking with the phone ---- */
  const [gyroOn, setGyroOn] = useState(false);
  const [gyroAble, setGyroAble] = useState(false);
  useEffect(() => {
    setGyroAble(
      window.matchMedia("(pointer: coarse)").matches &&
        typeof DeviceOrientationEvent !== "undefined",
    );
  }, []);
  const toggleGyro = () => {
    if (gyroOn) {
      setGyroOn(false);
      return;
    }
    // iOS asks for permission, and only inside the tap itself.
    const ask = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
      .requestPermission;
    if (typeof ask === "function") {
      ask()
        .then((answer) => {
          if (answer === "granted") setGyroOn(true);
          else toast.error(L(RS.gyroDenied));
        })
        .catch(() => toast.error(L(RS.gyroDenied)));
      return;
    }
    setGyroOn(true);
  };
  const onGyroSilent = useCallback(() => {
    setGyroOn(false);
    toast.error(L(RS.gyroUnavailable));
  }, [L]);
  useEffect(() => {
    extras?.setGyro(gyroOn && walking);
  }, [extras, gyroOn, walking]);

  /* ---- Time passing, weather, scale ---- */
  const [timeFlow, setTimeFlow] = useState(false);
  const [weatherOn, setWeatherOn] = useState(false);
  const weatherKind = useMemo(
    () =>
      defaultWeather({
        id: item.id,
        siteSlug: item.siteSlug,
        biome: biomeFor(item.id),
        kind: item.model.kind,
      }),
    [item],
  );
  const [scaleOn, setScaleOn] = useState(false);
  useEffect(() => {
    extras?.setTimeFlow(timeFlow);
  }, [extras, timeFlow]);
  useEffect(() => {
    extras?.setWeather(weatherOn ? weatherKind : "off");
  }, [extras, weatherOn, weatherKind]);
  useEffect(() => {
    extras?.setScaleRefs(
      scaleOn
        ? {
            person: L(RS.scalePerson),
            bus: L(RS.scaleBus),
            block: L(RS.scaleBlock),
            pitch: L(RS.scalePitch),
          }
        : null,
    );
  }, [extras, scaleOn, L]);

  /* ---- Lite mode for weak devices ---- */
  const [lite, setLite] = useState(false);
  const [liteNotice, setLiteNotice] = useState(false);
  useEffect(() => {
    if (!liteNotice) return;
    const timer = window.setTimeout(() => setLiteNotice(false), 12000);
    return () => window.clearTimeout(timer);
  }, [liteNotice]);
  const autoLite = useCallback(() => {
    setLite(true);
    setLiteNotice(true);
  }, []);
  useEffect(() => {
    const chosenQuality = readKey(QUALITY_KEY);
    if (chosenQuality === "lite") {
      setLite(true);
      return;
    }
    if (chosenQuality === "high") return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const tier = assessDevice({
      memory: nav.deviceMemory,
      cores: navigator.hardwareConcurrency,
      touch: window.matchMedia("(pointer: coarse)").matches,
      dpr: window.devicePixelRatio,
    });
    if (tier === "low") autoLite();
  }, [autoLite]);
  const onInfo = useCallback(
    (info: SceneInfo) => {
      if (readKey(QUALITY_KEY)) return;
      const nav = navigator as Navigator & { deviceMemory?: number };
      const weakGpu =
        assessDevice({
          memory: nav.deviceMemory,
          cores: navigator.hardwareConcurrency,
          touch: window.matchMedia("(pointer: coarse)").matches,
          gpu: info.gpu,
        }) === "low";
      const heavy = isHeavy(info.triangles) || item.model.kind === "mausoleum";
      if (weakGpu || framesTooSlow(info.samples ?? [], heavy)) autoLite();
    },
    [autoLite, item.model.kind],
  );
  useEffect(() => {
    extras?.setLite(lite);
  }, [extras, lite]);
  const chooseLite = (on: boolean) => {
    writeKey(QUALITY_KEY, on ? "lite" : "high");
    setLite(on);
    setLiteNotice(false);
    if (!on) setQuality(true);
  };

  /* ---- Photo mode ---- */
  const [photo, setPhoto] = useState(false);
  const [vignette, setVignette] = useState(true);
  const [dof, setDof] = useState(false);
  const [shooting, setShooting] = useState(false);
  useEffect(() => {
    if (!photo) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhoto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photo]);
  const enterPhoto = () => {
    setMore(false);
    if (tour.active) tour.exit();
    setSpeech(null);
    setPhoto(true);
    track("3D photo mode", { model: item.id });
  };
  const shoot = async () => {
    if (!extras || shooting) return;
    setShooting(true);
    try {
      const blob = await extras.takePhoto({ vignette, dof, mark: L(RS.watermark) });
      if (!blob) {
        toast.error(L(RS.photoFailed));
        return;
      }
      const { sharePhoto } = await import("./scene/photo");
      const outcome = await sharePhoto(blob, `antik-turkiye-${item.id}.png`, L(item.title));
      if (outcome === "saved") toast.success(L(RS.photoSaved));
      track("3D photo", { model: item.id, outcome });
    } catch {
      toast.error(L(RS.photoFailed));
    } finally {
      setShooting(false);
    }
  };

  /* ---- Discovery quests ---- */
  const quests = useMemo(() => {
    const { statues, plates } = questSources(
      parts,
      life?.props ?? [],
      lifeKit?.statueMaterials ?? [],
    );
    const bounds = boundsOf(parts);
    return generateQuests({
      modelId: item.id,
      hotspots: item.hotspots,
      statues,
      plates,
      groundY: bounds.min[1],
      span: Math.max(
        bounds.max[0] - bounds.min[0],
        bounds.max[1] - bounds.min[1],
        bounds.max[2] - bounds.min[2],
      ),
    });
  }, [parts, life, lifeKit, item.id, item.hotspots]);
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => setDone(readQuests()[item.id] ?? []), [item.id]);
  const [questsOpen, setQuestsOpen] = useState(false);
  const [cheer, setCheer] = useState<{ text: string; all: boolean; key: number } | null>(null);
  useEffect(() => {
    if (!cheer) return;
    const timer = window.setTimeout(() => setCheer(null), 4500);
    return () => window.clearTimeout(timer);
  }, [cheer]);
  const questState = useRef({ quests, done, lang });
  questState.current = { quests, done, lang };
  const onPose = useCallback(
    (eye: [number, number, number], dir: [number, number, number]) => {
      const { quests: list, done: finished, lang: language } = questState.current;
      const hit = list.find((quest) => !finished.includes(quest.id) && questHit(quest, eye, dir));
      if (!hit) return;
      let next = markQuestDone(item.id, hit.id);
      if (!next.includes(hit.id)) next = [...finished, hit.id];
      const all = list.every((quest) => next.includes(quest.id));
      if (all && !next.includes(badgeId(item.id))) next = markQuestDone(item.id, badgeId(item.id));
      questState.current.done = next;
      setDone(next);
      setCheer({ text: questTitle(hit, language), all, key: Date.now() });
      track("3D quest", { model: item.id, quest: hit.id });
    },
    [item.id],
  );
  const doneCount = quests.filter((quest: Quest) => done.includes(quest.id)).length;

  /* ---- Room for the "more" panel above the bar ---- */
  const [stageHeight, setStageHeight] = useState(600);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => setStageHeight(stage.clientHeight));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  /** The whole overlay steps aside in photo mode. */
  const hideUi = photo;

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
        {mounted && life ? (
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
              showLabels={showLabels && !photo}
              activeLabel={active}
              onPickLabel={onPickLabel}
              view={view}
              exportToken={exportToken}
              onExported={onExported}
              onReady={setSceneReady}
              exportWithoutGround
              biome={biomeFor(item.id)}
              quality={quality && !lite}
              captureToken={captureToken}
              onCaptured={onCaptured}
              life={life}
              showLife={showLife}
              walk={walking}
              onWalkEnd={onWalkEnd}
              walkStick={walkStick}
              onListen={ambient ? onListen : undefined}
              onExtras={setExtras}
              onPerson={onPerson}
              onPose={onPose}
              onInfo={onInfo}
              onProgress={setBuildProgress}
              lite={lite}
              onGyroSilent={onGyroSilent}
            />
          </Suspense>
        ) : (
          <Skeleton height={height} label={t("recon_loading")} />
        )}
        {mounted && life && buildProgress > 0 && buildProgress < 1 && (
          <div
            className="pointer-events-none absolute inset-0 z-[1] grid place-items-center bg-muted text-sm text-muted-foreground"
            role="status"
          >
            <div className="flex w-48 flex-col items-center gap-2">
              <span>{t("recon_loading")}</span>
              <span className="h-1 w-full overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${Math.round(buildProgress * 100)}%` }}
                />
              </span>
            </div>
          </div>
        )}

        {/* Top right: the tour, walking, and full screen. */}
        <div
          className={`absolute right-[max(0.5rem,env(safe-area-inset-right))] top-[max(0.5rem,env(safe-area-inset-top))] z-10 flex items-center gap-1 rounded-2xl p-1 ${glass} ${hideUi ? "hidden" : ""}`}
        >
          <button
            type="button"
            onClick={toggleTour}
            disabled={!sceneReady}
            aria-pressed={tour.active}
            aria-label={tour.active ? L(RS.tourExit) : L(RS.tour)}
            title={L(RS.tourHint)}
            data-tour-toggle
            className={tool}
          >
            <Route className="h-4 w-4" />
            <span className="hidden @lg:inline">{L(RS.tour)}</span>
          </button>
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

        {/* Top left: the quests, and while walking on a phone, looking by turning it. */}
        {!hideUi && (quests.length > 0 || (walking && gyroAble)) && (
          <div
            className={`absolute left-[max(0.5rem,env(safe-area-inset-left))] top-[max(0.5rem,env(safe-area-inset-top))] z-10 flex items-center gap-1 rounded-2xl p-1 ${glass}`}
          >
            {quests.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSpeech(null);
                  setQuestsOpen((open) => !open);
                }}
                aria-expanded={questsOpen}
                aria-label={`${L(RS.questsTitle)}: ${doneCount}/${quests.length}`}
                title={L(RS.questsTitle)}
                data-quests-toggle
                className={tool}
              >
                <Trophy className="h-4 w-4" />
                <span className="tabular-nums">
                  {doneCount}/{quests.length}
                </span>
              </button>
            )}
            {walking && gyroAble && (
              <button
                type="button"
                onClick={toggleGyro}
                aria-pressed={gyroOn}
                aria-label={L(RS.gyro)}
                title={L(RS.gyro)}
                className={tool}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            )}
            {walking && gyroOn && (
              <button
                type="button"
                onClick={() => extras?.recentreGyro()}
                aria-label={L(RS.gyroRecentre)}
                title={L(RS.gyroRecentre)}
                className={tool}
              >
                <Crosshair className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Under the top row: how to walk, as a chip that goes by itself; and
            in full screen, what a chosen label is, since the note under the
            model is off screen there. */}
        <div
          className={`pointer-events-none absolute bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+8.5rem)] left-[max(0.5rem,env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))] top-[calc(max(0.5rem,env(safe-area-inset-top))+3.25rem)] z-10 flex flex-col items-start gap-2 overflow-hidden ${hideUi ? "hidden" : ""}`}
        >
          {questsOpen && quests.length > 0 && (
            <div
              role="group"
              aria-label={L(RS.questsTitle)}
              className={`pointer-events-auto w-[min(20rem,100%)] rounded-2xl p-3 text-xs ${glass}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-semibold">{L(RS.questsTitle)}</p>
                <button
                  type="button"
                  onClick={() => setQuestsOpen(false)}
                  aria-label={t("nav_close")}
                  className="grid h-7 w-7 place-items-center rounded-full text-white/70 hover:bg-white/15 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <ul className="space-y-1.5">
                {quests.map((quest) => {
                  const finished = done.includes(quest.id);
                  return (
                    <li key={quest.id} className="flex items-start gap-2">
                      <span
                        className={`mt-px grid h-4 w-4 shrink-0 place-items-center rounded-full ${finished ? "bg-primary text-primary-foreground" : "border border-white/40"}`}
                      >
                        {finished && <Check className="h-3 w-3" />}
                      </span>
                      <span className={finished ? "text-white/60 line-through" : ""}>
                        {questTitle(quest, lang)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-white/65">{walking ? L(RS.questsHint) : L(RS.questsWalk)}</p>
            </div>
          )}
          {tour.active && tourChapter && (
            <div
              role="region"
              aria-label={L(RS.tour)}
              aria-live="polite"
              data-tour-panel
              className={`pointer-events-auto flex w-[min(26rem,100%)] flex-col gap-1.5 rounded-2xl p-2 ${glass}`}
            >
              <div className="flex items-center gap-2">
                <Route className="ml-1 h-4 w-4 shrink-0 text-primary" />
                <p className="min-w-0 flex-1 truncate text-xs">
                  <span className="tabular-nums text-white/65">
                    {tour.index + 1}/{tour.total}
                  </span>{" "}
                  <strong className="font-semibold">{L(tourChapter.title)}</strong>
                </p>
                <button
                  type="button"
                  onClick={tour.prev}
                  disabled={tour.index === 0}
                  aria-label={L(RS.tourPrev)}
                  title={L(RS.tourPrev)}
                  className={tool}
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={tour.paused ? tour.resume : tour.pause}
                  aria-label={tour.paused ? L(RS.tourResume) : L(RS.tourPause)}
                  title={tour.paused ? L(RS.tourResume) : L(RS.tourPause)}
                  className={tool}
                >
                  {tour.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={tour.next}
                  aria-label={L(RS.tourNext)}
                  title={L(RS.tourNext)}
                  className={tool}
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={tour.exit}
                  aria-label={L(RS.tourExit)}
                  title={L(RS.tourExit)}
                  className={tool}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {tourSpot && (
                <p className="line-clamp-3 px-1 pb-0.5 text-xs leading-snug text-white/85">
                  {L(tourSpot.note)}
                </p>
              )}
            </div>
          )}
          {speech && (
            <div
              key={speech.key}
              role="status"
              data-person-card
              className={`pointer-events-auto flex w-[min(24rem,100%)] items-start gap-2 rounded-2xl p-3 text-sm leading-snug ${glass}`}
            >
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  {L(speech.role)}
                </p>
                <p className="mt-0.5">“{L(speech.text)}”</p>
                <p className="mt-1 text-[10px] text-white/55">{L(RS.personNote)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => speak(L(speech.text))}
                  aria-label={L(RS.personListen)}
                  title={L(RS.personListen)}
                  className="grid h-7 w-7 place-items-center rounded-full text-white/80 hover:bg-white/15 hover:text-white"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSpeech(null)}
                  aria-label={L(RS.personClose)}
                  title={L(RS.personClose)}
                  className="grid h-7 w-7 place-items-center rounded-full text-white/70 hover:bg-white/15 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
          {cheer && (
            <div
              key={cheer.key}
              role="status"
              data-quest-cheer
              className={`pointer-events-auto flex max-w-[24rem] items-center gap-2.5 rounded-2xl p-2.5 pr-3.5 text-sm ${glass}`}
            >
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-gold-foreground">
                <span className="absolute inset-0 rounded-full bg-gold/60 motion-safe:animate-ping" />
                <Trophy className="relative h-4 w-4" />
              </span>
              <span className="min-w-0">
                <strong className="block font-semibold">
                  {cheer.all ? L(RS.questsAll) : L(RS.questDone)}
                </strong>
                <span className="block truncate text-xs text-white/75">{cheer.text}</span>
              </span>
            </div>
          )}
          {liteNotice && (
            <div
              role="status"
              className={`pointer-events-auto flex max-w-[26rem] items-center gap-2 rounded-full py-1.5 pl-3.5 pr-1.5 text-xs leading-snug ${glass}`}
            >
              <Gauge className="h-3.5 w-3.5 shrink-0 text-white/70" />
              <span>{L(RS.liteAuto)}</span>
              <button
                type="button"
                onClick={() => chooseLite(false)}
                className="shrink-0 rounded-full bg-white px-2.5 py-1 font-semibold text-neutral-900 hover:bg-white/90"
              >
                {L(RS.liteHigh)}
              </button>
              <button
                type="button"
                onClick={() => setLiteNotice(false)}
                aria-label={t("nav_close")}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/15 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {peopleHint && !speech && !tour.active && (
            <div
              role="status"
              className={`pointer-events-auto flex max-w-[24rem] items-center gap-2 rounded-full py-1.5 pl-3.5 pr-3.5 text-xs leading-snug ${glass}`}
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0 text-white/70" />
              <span>{L(RS.personHint)}</span>
            </div>
          )}
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
          {full && chosen && !tour.active && (
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
        {walking && !hideUi && (
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
          className={`absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.5rem,env(safe-area-inset-right))] z-10 flex items-end gap-1.5 ${hideUi ? "hidden" : ""}`}
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
                  onClick={() => {
                    setTimeFlow(false);
                    setAtmos(mode);
                  }}
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
                className={`absolute bottom-full right-0 mb-2 w-[min(17rem,calc(100cqw-1rem))] space-y-3 overflow-y-auto overscroll-contain rounded-2xl p-3 ${glass}`}
                style={{ maxHeight: Math.max(160, stageHeight - 80) }}
              >
                <div className="space-y-1">
                  <div className={`${cramped} space-y-1`}>{toggles(true)}</div>
                  {switchRow(
                    "quality",
                    quality && !lite,
                    () => {
                      if (lite) chooseLite(false);
                      else setQuality((on) => !on);
                    },
                    Sparkles,
                    t("recon_ctl_quality"),
                    t("recon_quality_hint"),
                  )}
                  {switchRow(
                    "lite",
                    lite,
                    () => chooseLite(!lite),
                    Gauge,
                    L(RS.lite),
                    L(RS.liteHint),
                  )}
                  {switchRow(
                    "time",
                    timeFlow,
                    () => setTimeFlow((on) => !on),
                    Clock,
                    L(RS.timeFlow),
                    L(RS.timeFlowHint),
                  )}
                  {switchRow(
                    "weather",
                    weatherOn,
                    () => setWeatherOn((on) => !on),
                    Cloud,
                    `${L(RS.weather)}: ${L(
                      weatherKind === "mist"
                        ? RS.weatherMist
                        : weatherKind === "dust"
                          ? RS.weatherDust
                          : RS.weatherClouds,
                    )}`,
                  )}
                  {switchRow(
                    "scale",
                    scaleOn,
                    () => setScaleOn((on) => !on),
                    Ruler,
                    L(RS.scale),
                    L(RS.scaleHint),
                  )}
                  <button
                    type="button"
                    onClick={enterPhoto}
                    disabled={!sceneReady}
                    data-photo-mode
                    className="flex h-9 w-full items-center gap-2 rounded-xl px-2 text-xs font-semibold text-white/90 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-left">{L(RS.photo)}</span>
                  </button>
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
        {/* Photo mode: the frame, a vignette preview, and only the camera's own controls. */}
        {photo && vignette && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]"
          />
        )}
        {photo && (
          <div
            role="toolbar"
            aria-label={L(RS.photo)}
            data-photo-toolbar
            className={`absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-2xl p-1.5 ${glass}`}
          >
            <button
              type="button"
              aria-pressed={vignette}
              onClick={() => setVignette((on) => !on)}
              aria-label={L(RS.photoVignette)}
              title={L(RS.photoVignette)}
              className={tool}
            >
              <Circle className="h-4 w-4" />
            </button>
            {quality && !lite && (
              <button
                type="button"
                aria-pressed={dof}
                onClick={() => setDof((on) => !on)}
                aria-label={L(RS.photoDof)}
                title={L(RS.photoDof)}
                className={tool}
              >
                <Aperture className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setTimeFlow(false);
                setAtmos((now) => (now === "day" ? "golden" : now === "golden" ? "night" : "day"));
              }}
              aria-label={`${L(RS.photoLight)}: ${t(LIGHTS.find(([mode]) => mode === atmos)![2])}`}
              title={L(RS.photoLight)}
              className={tool}
            >
              {atmos === "day" ? (
                <Sun className="h-4 w-4" />
              ) : atmos === "golden" ? (
                <Sunset className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => void shoot()}
              disabled={shooting || !extras}
              aria-label={L(RS.photoTake)}
              title={L(RS.photoTake)}
              data-shutter
              className="mx-1 grid h-12 w-12 place-items-center rounded-full border-4 border-white/80 bg-white text-neutral-900 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60 motion-reduce:transition-none"
            >
              <Camera className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setPhoto(false)}
              aria-label={L(RS.photoExit)}
              title={L(RS.photoExit)}
              className={tool}
            >
              <X className="h-4 w-4" />
            </button>
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

      {/* Under the model, only what takes the model elsewhere: AR and the
          photograph of today. Everything that changes the view is on it. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {arMode && (
          <button
            onClick={() => {
              if (arReady) {
                launchAR();
                return;
              }
              setExporting(true);
              setExportToken((n) => n + 1);
            }}
            disabled={exporting || (!arReady && !sceneReady)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <Glasses className="h-3.5 w-3.5" />
            {exporting ? t("recon_ar_preparing") : arReady ? t("recon_ar_start") : t("recon_ar")}
          </button>
        )}
        {todayPhoto && (
          <button
            onClick={() => {
              // The comparison opens over the page; a full-screen model would hide it.
              if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
              setCaptureToken((n) => n + 1);
            }}
            className={chip}
          >
            <Columns2 className="h-3.5 w-3.5" /> {t("recon_compare")}
          </button>
        )}
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
        /*
         * Shown over the page, not below the model: below it sat out of sight
         * on a phone, and pressing the button seemed to do nothing.
         */
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("recon_compare")}
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setStill(null);
          }}
        >
          <div className="w-full max-w-5xl rounded-2xl bg-background p-3 shadow-2xl sm:p-4">
            <CompareSlider
              before={todayPhoto}
              after={still}
              beforeLabel={t("recon_compare_today")}
              afterLabel={t("recon_compare_then")}
              alt={L(item.title)}
              onClose={() => setStill(null)}
            />
            <p className="mt-2 text-xs text-muted-foreground">{t("recon_compare_hint")}</p>
            {creditLine(todayPhoto) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {L(RS.compareCredit)} {creditLine(todayPhoto)}
              </p>
            )}
          </div>
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
