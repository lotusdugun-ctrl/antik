import { useState } from "react";
import { Columns2 } from "lucide-react";
import { Photo } from "@/components/Photo";
import { useI18n } from "@/lib/i18n";
import { compareViewsFor } from "@/lib/compare-views";

/** "Today / when it stood": drag the handle to wipe between the ruin and the render. */
export function CompareSlider({ id }: { id: string }) {
  const { L, lang } = useI18n();
  const views = compareViewsFor(id);
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(50);
  const v = views[Math.min(index, views.length - 1)];
  if (!v) return null;
  const tr = lang === "tr";

  return (
    <section className="mt-10">
      <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-semibold">
        <Columns2 className="h-5 w-5 text-primary" /> {tr ? "Bugün ve sağlamken" : "Today and when it stood"}
      </h2>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        {tr
          ? "Çizgiyi kaydırın: solda yapının bugünkü fotoğrafı, sağda aynı yerden yapının sağlam hâli."
          : "Drag the line: on the left a photograph of the site today, on the right the same view with the building whole."}
      </p>
      <div className="overflow-hidden rounded-2xl surface-panel">
        <div className="relative aspect-[3/2] w-full select-none overflow-hidden bg-muted">
          <img src={v.intact} alt={L(v.title)} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Photo
              src={v.today}
              alt={L(v.title)}
              sizes="(min-width: 1024px) 960px, 100vw"
              fallbackWidth={1280}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow" style={{ left: `${pos}%` }} />
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white">
            {tr ? "Bugün" : "Today"}
          </span>
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white">
            {tr ? "Sağlamken (canlandırma)" : "Whole (reconstruction)"}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={tr ? "Karşılaştırma çizgisi" : "Comparison divider"}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        {views.length > 1 && (
          <div className="flex flex-wrap gap-2 p-3">
            {views.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  i === index ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
                }`}
              >
                {L(x.title)}
              </button>
            ))}
          </div>
        )}
        {v.note && <p className="px-4 py-3 text-sm text-muted-foreground">{L(v.note)}</p>}
      </div>
    </section>
  );
}
