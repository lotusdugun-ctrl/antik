import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Columns2,
  Download,
  Glasses,
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
} from "lucide-react";
import { toast } from "sonner";
import { createAmbience, type Ambience } from "@/lib/ambience";
import { partsFor } from "@/lib/reconstruction-parts";
import type { Reconstruction } from "@/lib/reconstructions";
import { useI18n } from "@/lib/i18n";
import { reconstructionGuide } from "@/lib/narration";
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

export function Reconstruction3D({
  item,
  height = "clamp(320px, 62vh, 640px)",
}: {
  item: Reconstruction;
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

  /* High quality: ambient occlusion. On by default where there is a mouse —
     a desktop GPU — and off on touch devices, where it costs battery. */
  const [quality, setQuality] = useState(false);
  useEffect(() => {
    setQuality(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  /* Ambient sound. Created on the first press: an AudioContext may only
     start inside a user gesture. */
  const ambienceRef = useRef<Ambience | null>(null);
  const [ambient, setAmbient] = useState(false);
  const ambientScene = useMemo(
    () => ({
      time: atmos,
      crowd: item.model.kind === "roman-theatre" || item.model.kind === "stadium",
      exposed: BIOME[item.id] === "mountain" || BIOME[item.id] === "steppe",
    }),
    [atmos, item.model.kind, item.id],
  );
  const toggleAmbient = () => {
    if (ambient) {
      ambienceRef.current?.stop();
      setAmbient(false);
      return;
    }
    ambienceRef.current ??= createAmbience();
    if (!ambienceRef.current) return;
    ambienceRef.current.setScene(ambientScene);
    void ambienceRef.current.start();
    setAmbient(true);
  };
  useEffect(() => {
    ambienceRef.current?.setScene(ambientScene);
  }, [ambientScene]);
  useEffect(() => () => ambienceRef.current?.dispose(), []);

  /* The narrated tour turns the camera to each hotspot as the voice gets to it. */
  const guide = useMemo(() => reconstructionGuide(item), [item]);
  const onChapter = useCallback(
    (index: number) => {
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
  const onExported = useCallback(
    (data: ArrayBuffer) => {
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
    [item.id, exportFor],
  );

  const chosen = active === null ? undefined : item.hotspots[active];

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {mounted ? (
          <Suspense fallback={<Skeleton height={height} label={t("recon_loading")} />}>
            <Inner
              parts={parts}
              kind={item.model.kind}
              theme={theme}
              atmos={atmos}
              autoRotate={spinning}
              resetToken={resetToken}
              label={`${L(item.title)} — ${t("recon_unavailable")}`}
              height={height}
              labels={labels}
              showLabels={showLabels}
              activeLabel={active}
              onPickLabel={onPickLabel}
              view={view}
              exportToken={exportToken}
              onExported={onExported}
              exportWithoutGround={exportFor === "ar"}
              biome={BIOME[item.id] ?? "mediterranean"}
              quality={quality}
              captureToken={captureToken}
              onCaptured={onCaptured}
            />
          </Suspense>
        ) : (
          <Skeleton height={height} label={t("recon_loading")} />
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
          onClick={() => setSpinning((on) => !on)}
          aria-pressed={spinning}
          className={control}
        >
          {spinning ? <Square className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
          {spinning ? t("recon_spin_stop") : t("recon_spin")}
        </button>
        <button
          onClick={() => {
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
            onClick={() => setView({ name, token: Date.now() })}
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
          disabled={exporting}
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
            disabled={exporting}
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
        {t("recon_scale")} {t("recon_landscape_note")}
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
