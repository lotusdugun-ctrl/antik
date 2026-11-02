import { useRef, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Today's photograph and the model, one over the other, split by a line the
 * visitor drags. Both are cropped to the same frame; the angles are close, not
 * matched, and the caption under it says so.
 */
export function CompareSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  alt,
  onClose,
}: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [split, setSplit] = useState(50);
  // Offline, today's photograph may not load; say so rather than show alt text.
  const [missing, setMissing] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    setSplit(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={box}
      className="relative aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-muted"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        move(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.buttons) move(event.clientX);
      }}
    >
      <img
        src={after}
        alt={`${alt} — ${afterLabel}`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <img
        src={before}
        alt={`${alt} — ${beforeLabel}`}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)`, opacity: missing ? 0 : 1 }}
        draggable={false}
        onError={() => setMissing(true)}
      />
      {missing && (
        <div
          className="absolute inset-y-0 left-0 grid place-items-center bg-muted p-4 text-center text-xs text-muted-foreground"
          style={{ width: `${split}%` }}
        >
          {t("photo_unavailable")}
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.25)]"
        style={{ left: `${split}%` }}
      >
        <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-bold text-black shadow">
          ⇆
        </span>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
        {afterLabel}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(split)}
        onChange={(event) => setSplit(Number(event.target.value))}
        aria-label={`${beforeLabel} / ${afterLabel}`}
        className="sr-only"
      />
      <button
        onClick={onClose}
        onPointerDown={(event) => event.stopPropagation()}
        aria-label={t("recon_compare_close")}
        className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
