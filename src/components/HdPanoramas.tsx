import { Suspense, lazy, useEffect, useState } from "react";
import { Orbit } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { panoramasFor } from "@/lib/panoramas";

const Viewer = lazy(() => import("./PanoramaViewer"));

/** The HD 360° views of a reconstruction, one at a time, with a picker. */
export function HdPanoramas({ id }: { id: string }) {
  const { t, L } = useI18n();
  const list = panoramasFor(id);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = list[Math.min(index, list.length - 1)];
  if (!current) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-semibold">
        <Orbit className="h-5 w-5 text-primary" /> {t("hd_title")}
      </h2>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">{t("hd_intro")}</p>
      <div className="overflow-hidden rounded-2xl surface-panel">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
          {mounted ? (
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
              <Viewer src={current.src} label={L(current.title)} />
            </Suspense>
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white">
            {t("hd_drag")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                i === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {L(p.title)}
            </button>
          ))}
        </div>
        {current.note && (
          <p className="px-4 pb-4 text-sm text-muted-foreground">{L(current.note)}</p>
        )}
        {current.credit && (
          <p className="px-4 pb-3 text-[11px] text-muted-foreground/80">{L(current.credit)}</p>
        )}
      </div>
    </section>
  );
}
