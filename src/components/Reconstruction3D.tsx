import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { Download, RotateCcw, RotateCw, Square, Tag, TagsIcon } from "lucide-react";
import { partsFor } from "@/lib/reconstruction-parts";
import type { Reconstruction } from "@/lib/reconstructions";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

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
  const [view, setView] = useState<{ name: "front" | "above" | "corner"; token: number } | null>(
    null,
  );

  useEffect(() => setMounted(true), []);

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
  const onExported = useCallback(
    (data: ArrayBuffer) => {
      const url = URL.createObjectURL(new Blob([data], { type: "model/gltf-binary" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.id}.glb`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    },
    [item.id],
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

      <p className="mt-2 text-xs text-muted-foreground">{t("recon_scale")}</p>
    </div>
  );
}
