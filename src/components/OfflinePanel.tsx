import { useEffect, useState } from "react";
import { CloudDownload, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { imageAt } from "@/lib/images";
import { useProgress } from "@/lib/progress";
import { galleryImages } from "@/lib/site-details";
import { coverImage, getSite } from "@/lib/sites";

const PRECACHE_MESSAGE = "antik-tr-precache";

type Report = { done: number; total: number; failed: number; finished?: boolean };

/**
 * Download the favourites for offline use.
 *
 * The service worker already caches whatever has been visited, but that is the
 * wrong half of the trip: you browse at home on wifi and read at the ruin,
 * where there is no signal. This fetches the pages and photographs of the
 * cities you have starred, on purpose, while there is still a connection.
 */
export function OfflinePanel() {
  const { t, lang } = useI18n();
  const { state } = useProgress();
  const [supported, setSupported] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported("serviceWorker" in navigator);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data as (Report & { type?: string }) | undefined;
      if (!data || data.type !== PRECACHE_MESSAGE) return;
      setReport(data);
      if (data.finished) {
        setBusy(false);
        if (data.failed > 0) toast.message(`${t("offline_ready")} · ${data.failed} ✕`);
        else toast.success(t("offline_ready"));
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [t]);

  async function download() {
    const favorites = state.favorites.map(getSite).filter((s) => s !== undefined);
    if (favorites.length === 0) {
      toast.message(t("offline_needs_favorites"));
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) {
      toast.error(t("offline_failed"));
      return;
    }

    const suffix = lang === "tr" ? "" : "?lang=en";
    const urls = favorites.flatMap((site) => [
      `${window.location.origin}/kent/${site.slug}${suffix}`,
      // The widths the page will actually request, not the stored ceiling:
      // caching a 1280px file does not satisfy a request for the 500px one.
      ...[coverImage(site), ...galleryImages(site)].flatMap((photo) => [
        imageAt(photo, 500),
        imageAt(photo, 1280),
      ]),
    ]);

    setBusy(true);
    setReport({ done: 0, total: urls.length, failed: 0 });
    registration.active.postMessage({ type: PRECACHE_MESSAGE, urls: [...new Set(urls)] });
  }

  if (!supported) return null;

  const percent = report && report.total > 0 ? Math.round((report.done / report.total) * 100) : 0;

  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
        <WifiOff className="h-5 w-5 text-primary" /> {t("offline_title")}
      </h2>
      <div className="rounded-2xl surface-panel p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{t("offline_sub")}</p>
        <button
          onClick={download}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <CloudDownload className="h-4 w-4" />
          {busy ? t("offline_working") : t("offline_download")}
        </button>

        {report && (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {report.done} / {report.total}
              {report.finished && ` · ${t("offline_ready")}`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
