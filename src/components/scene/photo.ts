/**
 * Photo mode's picture: the view as it is, drawn again at twice the screen's
 * resolution, with an optional vignette and a small "Antik Türkiye" mark.
 *
 * The WebGL canvas is not kept between frames (no `preserveDrawingBuffer`,
 * which costs every frame on a phone), so the high-resolution frame is drawn
 * and copied onto a 2D canvas in the same task, before the browser can clear
 * it. Everything after that — the vignette, the mark, the PNG — is 2D.
 */

/** Pixels on the long side a photo is never larger than (GPU limits, memory). */
export const MAX_PHOTO_SIDE = 4096;

/** The scale to draw at: twice the screen, held under the size limit. */
export function photoScale(width: number, height: number, ratio: number): number {
  const wanted = ratio * 2;
  const cap = MAX_PHOTO_SIDE / Math.max(1, width, height);
  return Math.max(1, Math.min(wanted, cap));
}

/** Darkens the corners, the way an old lens did. */
export function paintVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.35,
    w / 2,
    h / 2,
    Math.hypot(w, h) / 2,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/** The mark, bottom right, sized to the picture. */
export function paintWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, text: string) {
  const size = Math.max(14, Math.round(Math.min(w, h) * 0.028));
  ctx.font = `600 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  const pad = Math.round(size * 0.9);
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = size * 0.4;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillText(text, w - pad, h - pad);
  ctx.shadowBlur = 0;
}

/** A canvas as a PNG blob, or null where the browser will not make one. */
export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    } catch {
      resolve(null);
    }
  });
}

/**
 * Hands the picture on: the system share sheet where it takes files, a
 * download otherwise. Resolves to what happened.
 */
export async function sharePhoto(
  blob: Blob,
  fileName: string,
  title: string,
): Promise<"shared" | "saved" | "cancelled"> {
  const file = new File([blob], fileName, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
      // Any other refusal falls through to a download.
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "saved";
}
