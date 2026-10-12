/**
 * The digital passport: a stamp for being at a site, not for saying so.
 *
 * A site in the data is one point, but a ruin is a field: Ephesus runs for
 * well over two kilometres from the Magnesian Gate to the harbour. So a stamp
 * is given within a radius of that point, widened by however unsure the phone
 * is of its own position — but only up to a limit, or a phone that reports a
 * five-kilometre guess from the hotel would pass.
 */
export const STAMP_RADIUS_M = 2000;
const MAX_ACCURACY_ALLOWANCE_M = 500;

/** Great-circle distance in metres. */
export function distanceMetres(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type StampCheck = { ok: true; distance: number } | { ok: false; distance: number };

export function checkStamp(
  site: { lat: number; lng: number },
  position: { latitude: number; longitude: number; accuracy: number },
): StampCheck {
  const distance = distanceMetres(position.latitude, position.longitude, site.lat, site.lng);
  const allowance = Math.min(Math.max(position.accuracy, 0), MAX_ACCURACY_ALLOWANCE_M);
  return { ok: distance - allowance <= STAMP_RADIUS_M, distance };
}

export type PassportCard = {
  appName: string;
  title: string;
  stamps: { name: string; date: string }[];
  stampCount: number;
  stampsLabel: string;
  visited: number;
  visitedLabel: string;
  badges: number;
  badgesLabel: string;
  level: string;
  url: string;
};

/**
 * A shareable image of the passport, 1080 × 1350 (the portrait size most
 * social apps show uncropped). Drawn on a canvas so it needs no server and
 * works offline; the person decides where it goes.
 */
export function drawPassportCard(card: PassportCard): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Paper and border, in the app's terracotta and sand.
  ctx.fillStyle = "#f7f1e6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#a4472c";
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  ctx.fillStyle = "#a4472c";
  ctx.textAlign = "center";
  ctx.font = "600 34px Manrope, system-ui, sans-serif";
  ctx.fillText(card.appName.toUpperCase(), W / 2, 130);
  ctx.fillStyle = "#2b2118";
  ctx.font = "700 76px Fraunces, Georgia, serif";
  ctx.fillText(card.title, W / 2, 220);

  // Three figures.
  const stats = [
    [String(card.stampCount), card.stampsLabel],
    [String(card.visited), card.visitedLabel],
    [String(card.badges), card.badgesLabel],
  ] as const;
  stats.forEach(([value, label], i) => {
    const x = W / 2 + (i - 1) * 300;
    ctx.fillStyle = "#a4472c";
    ctx.font = "700 88px Fraunces, Georgia, serif";
    ctx.fillText(value, x, 360);
    ctx.fillStyle = "#6b5a4a";
    ctx.font = "500 28px Manrope, system-ui, sans-serif";
    ctx.fillText(label, x, 405);
  });

  // Up to nine stamps, as round ink stamps a little askew.
  const shown = card.stamps.slice(0, 9);
  const cols = 3;
  const cell = 290;
  const top = 470;
  shown.forEach((stamp, i) => {
    // A short last row is centred rather than left-aligned.
    const row = Math.floor(i / cols);
    const inRow = Math.min(cols, shown.length - row * cols);
    const cx = W / 2 + ((i % cols) - (inRow - 1) / 2) * cell;
    const cy = top + Math.floor(i / cols) * cell + cell / 2 - 10;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((((i * 37) % 17) - 8) * (Math.PI / 180));
    const ink = ["#a4472c", "#2f5d62", "#7a4e9a", "#3f6b2f"][i % 4]!;
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.88;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 118, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 102, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = "700 34px Fraunces, Georgia, serif";
    wrap(ctx, stamp.name, 0, -6, 180, 38);
    ctx.font = "600 22px Manrope, system-ui, sans-serif";
    ctx.fillText(stamp.date, 0, 62);
    ctx.restore();
  });

  if (shown.length === 0) {
    ctx.fillStyle = "#6b5a4a";
    ctx.font = "500 34px Manrope, system-ui, sans-serif";
    ctx.fillText("—", W / 2, top + 200);
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = "#2b2118";
  ctx.font = "600 34px Manrope, system-ui, sans-serif";
  ctx.fillText(card.level, W / 2, H - 150);
  ctx.fillStyle = "#6b5a4a";
  ctx.font = "500 28px Manrope, system-ui, sans-serif";
  ctx.fillText(card.url, W / 2, H - 100);
  return canvas;
}

/** Centred text on up to two lines, shrinking the second if it must. */
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  line: number,
) {
  ctx.textAlign = "center";
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > width && current) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  const kept = lines.slice(0, 2);
  if (lines.length > 2) kept[1] = `${kept[1]}…`;
  const start = y - ((kept.length - 1) * line) / 2;
  kept.forEach((l, i) => ctx.fillText(l, x, start + i * line, width));
}
