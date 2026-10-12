import { Suspense, lazy, useEffect, useState } from "react";
import { ExternalLink, ScanLine } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SCANS, type ScanId } from "@/lib/scans";

const Viewer = lazy(() => import("./ScanViewer"));

/**
 * The real pieces behind a reconstruction: each scan shown on its own, with
 * what it is and whose work it is. The credit is a licence term — every scan
 * here is CC BY or CC BY-NC-SA — so it is printed in full, not tucked away.
 */
export function ScanGallery({ ids }: { ids: ScanId[] }) {
  const { t, L } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (ids.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-semibold">
        <ScanLine className="h-5 w-5 text-primary" /> {t("scans_title")}
      </h2>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">{t("scans_intro")}</p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) => {
          const scan = SCANS[id];
          return (
            <li key={id} className="overflow-hidden rounded-2xl surface-panel p-3">
              {mounted ? (
                <Suspense
                  fallback={
                    <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
                  }
                >
                  <Viewer id={id} label={L(scan.title)} />
                </Suspense>
              ) : (
                <div className="aspect-square w-full rounded-xl bg-muted" />
              )}
              <h3 className="mt-3 font-display text-base font-semibold">{L(scan.title)}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{L(scan.note)}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t("scans_by")} {scan.author} ·{" "}
                <a
                  href={scan.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-primary"
                >
                  {scan.license}
                </a>{" "}
                ·{" "}
                <a
                  href={scan.source}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 underline hover:text-primary"
                >
                  Sketchfab <ExternalLink className="h-3 w-3" />
                </a>
                {t("scans_reduced")}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
