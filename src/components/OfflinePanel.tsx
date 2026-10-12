import { CheckCircle2, CloudDownload, WifiOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { offlineUrls, usePrecache } from "@/lib/offline";
import { useProgress } from "@/lib/progress";
import { getSite, type Site } from "@/lib/sites";

/**
 * Download a set of cities for offline use.
 *
 * The service worker already caches whatever has been visited, but that is the
 * wrong half of the trip: you browse at home on wifi and read at the ruin,
 * where there is no signal. This fetches the pages, photographs, recorded
 * guide and 3D scans of the chosen cities, on purpose, while there is still a
 * connection. Without `sites` it downloads the favourites.
 */
export function OfflinePanel({
  sites,
  packId = "favorites",
  title,
  sub,
  compact = false,
  label,
}: {
  sites?: Site[] | undefined;
  packId?: string;
  title?: string;
  sub?: string;
  compact?: boolean;
  /** The download button, when the pack is not a region. */
  label?: string;
}) {
  const { t, lang } = useI18n();
  const { state } = useProgress();
  const pack = usePrecache(packId);
  const finished = useRef(false);

  useEffect(() => {
    const report = pack.report;
    if (!report?.finished || finished.current) return;
    finished.current = true;
    if (report.failed >= report.total) toast.error(t("offline_failed"));
    else if (report.failed > 0) toast.message(`${t("offline_ready")} · ${report.failed} ✕`);
    else toast.success(t("offline_ready"));
  }, [pack.report, t]);

  async function download() {
    const list = sites ?? state.favorites.map(getSite).filter((s): s is Site => s !== undefined);
    if (list.length === 0) {
      toast.message(t("offline_needs_favorites"));
      return;
    }
    finished.current = false;
    const ok = await pack.start(offlineUrls(list, lang, window.location.origin));
    if (!ok) toast.error(t("offline_failed"));
    else track("Offline pack", { pack: packId, cities: list.length });
  }

  if (!pack.supported) return null;

  const report = pack.report;
  const body = (
    <>
      <p className="text-sm leading-relaxed text-muted-foreground">{sub ?? t("offline_sub")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={download}
          disabled={pack.busy}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <CloudDownload className="h-4 w-4" />
          {pack.busy
            ? t("offline_working")
            : sites
              ? pack.savedOn
                ? t("offline_update")
                : (label ?? t("offline_download_pack"))
              : t("offline_download")}
        </button>
        {pack.savedOn && !pack.busy && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("offline_saved_on")} {new Date(pack.savedOn).toLocaleDateString(lang)}
          </span>
        )}
      </div>

      {report && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${pack.percent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {report.done} / {report.total}
            {report.finished && ` · ${t("offline_ready")}`}
          </p>
        </div>
      )}
    </>
  );

  if (compact) return <div className="rounded-2xl surface-panel p-4">{body}</div>;

  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
        <WifiOff className="h-5 w-5 text-primary" /> {title ?? t("offline_title")}
      </h2>
      <div className="rounded-2xl surface-panel p-5">{body}</div>
    </section>
  );
}
