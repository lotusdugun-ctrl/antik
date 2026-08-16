import { useCallback, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { imageAt, srcSetFor } from "@/lib/images";
import { creditLine } from "@/lib/photo-credits";

/**
 * The whole photo, uncropped.
 *
 * Every photo on a page is framed to fit its slot: the hero fills a 52vh band,
 * a thumbnail fills a 112×80 box, the structure dialog fills a 208px strip.
 * That framing is `object-cover`, which crops — fine for a banner, wrong as the
 * answer to "let me see this photo". Clicking a photo opens it here instead,
 * where `object-contain` inside a viewport-sized box guarantees the entire
 * frame is on screen whatever its aspect ratio, portrait or panorama.
 *
 * It deliberately does not reuse `DialogContent`: that one is a centred card
 * with padding and a max width, and a photo shown inside it would be boxed
 * back down to the size this component exists to escape.
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  alt,
}: {
  /** Every photo the viewer can page through, in display order. */
  images: string[];
  /** Which one is open, or `null` when the lightbox is closed. */
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
  /** Base alt text; the position is appended when there is more than one. */
  alt: string;
}) {
  const { t } = useI18n();
  const open = index !== null && index >= 0 && index < images.length;
  const many = images.length > 1;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  // Radix handles Escape; the arrow keys are ours.
  useEffect(() => {
    if (!open || !many) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, many, step]);

  if (!open) return null;

  const src = images[index]!;
  const credit = creditLine(src);

  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0"
          // Clicking the backdrop closes; clicking the photo itself must not.
          onClick={onClose}
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

          <figure
            className="flex max-h-full max-w-full flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageAt(src, 1280)}
              srcSet={srcSetFor(src)}
              sizes="100vw"
              alt={many ? `${alt} ${index + 1}/${images.length}` : alt}
              // max-h leaves room for the caption; object-contain is the point
              // of the whole component — the image is never cropped.
              className="max-h-[82vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />
            {(credit || many) && (
              <figcaption className="flex items-center gap-2 text-[11px] text-white/70">
                {many && (
                  <span className="tabular-nums">
                    {index + 1}/{images.length}
                  </span>
                )}
                {credit && <span>{credit}</span>}
              </figcaption>
            )}
          </figure>

          {many && (
            <>
              <button
                type="button"
                aria-label={t("photo_prev")}
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/75 sm:left-4"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label={t("photo_next")}
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/75 sm:right-4"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <DialogPrimitive.Close
            aria-label={t("photo_close")}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/75"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
