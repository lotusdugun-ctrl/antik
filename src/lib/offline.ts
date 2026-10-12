import { useCallback, useEffect, useState } from "react";
import { recordingsFor } from "@/lib/audio-manifest";
import type { Lang } from "@/lib/i18n";
import { imageAt } from "@/lib/images";
import { reconstructionsFor } from "@/lib/reconstructions";
import { SCANS, scansFor } from "@/lib/scans";
import { galleryImages } from "@/lib/site-details";
import { coverImage, type Site } from "@/lib/sites";

/** The message the service worker answers precache jobs on (see public/sw.js). */
export const PRECACHE_MESSAGE = "antik-tr-precache";

export type PrecacheReport = { done: number; total: number; failed: number; finished?: boolean };

/**
 * Everything a set of cities needs to work with no signal: the city pages,
 * their photographs at the widths the pages ask for, the recorded audio guide
 * (both the files in the app and the ones on the audio host), and — for the
 * cities that have them — the reconstruction pages and the scanned statues.
 */
export function offlineUrls(list: Site[], lang: Lang, origin: string): string[] {
  const suffix = lang === "tr" ? "" : `?lang=${lang}`;
  const urls = list.flatMap((site) => {
    const recons = reconstructionsFor(site.slug);
    return [
      `${origin}/kent/${site.slug}${suffix}`,
      ...[coverImage(site), ...galleryImages(site)].flatMap((photo) => [
        imageAt(photo, 500),
        imageAt(photo, 1280),
      ]),
      ...recordingsFor(`site:${site.slug}`),
      ...recons.flatMap((item) => [
        `${origin}/rekonstruksiyon/${item.id}${suffix}`,
        ...recordingsFor(`recon:${item.id}`),
        ...scansFor(item.id).map((id) => SCANS[id].url),
      ]),
    ];
  });
  return [...new Set(urls.map((url) => new URL(url, origin).href))];
}

const PACKS_KEY = "antik-tr-offline-packs";

/** When each pack was last downloaded on this device: pack id → ISO date. */
function readPacks(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(PACKS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writePack(id: string) {
  try {
    const packs = readPacks();
    packs[id] = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
  } catch {
    /* storage unavailable — the files are still cached */
  }
}

/**
 * Drive one precache job and follow its progress. `packId` names the download
 * ("region:ege", "route:efes-2", "favorites") so the page can say it is done.
 */
export function usePrecache(packId: string) {
  const [supported, setSupported] = useState(false);
  const [report, setReport] = useState<PrecacheReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedOn, setSavedOn] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSupported("serviceWorker" in navigator);
    setSavedOn(readPacks()[packId]);
  }, [packId]);

  useEffect(() => {
    if (!busy || !("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data as (PrecacheReport & { type?: string }) | undefined;
      if (!data || data.type !== PRECACHE_MESSAGE) return;
      setReport(data);
      if (data.finished) {
        setBusy(false);
        if (data.failed < data.total) {
          writePack(packId);
          setSavedOn(readPacks()[packId]);
        }
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [busy, packId]);

  const start = useCallback(async (urls: string[]): Promise<boolean> => {
    if (!("serviceWorker" in navigator) || urls.length === 0) return false;
    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) return false;
    setBusy(true);
    setReport({ done: 0, total: urls.length, failed: 0 });
    registration.active.postMessage({ type: PRECACHE_MESSAGE, urls });
    return true;
  }, []);

  const percent = report && report.total > 0 ? Math.round((report.done / report.total) * 100) : 0;
  return { supported, report, busy, percent, savedOn, start };
}
