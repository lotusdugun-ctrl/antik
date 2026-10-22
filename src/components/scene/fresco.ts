import type * as THREE_NS from "three";
import type { Part } from "@/lib/reconstruction-parts";

/**
 * Wall paintings in the late Byzantine manner, drawn on a canvas: registers
 * of standing saints on a deep blue ground between red borders, each with a
 * gilded halo, a face (eyes, brows, nose, beard or none), a tunic and a
 * mantle hung in folds, a hand raised in blessing or holding a book or a
 * cross, and the name written either side of the head. The figures and their
 * names are this app's own design, made from a seed — not a copy of any
 * painting at Sümela or anywhere else — and the plaster is faded and cracked,
 * as paintings that have stood in the open are.
 */
export type FrescoSpec = NonNullable<Part["fresco"]>;

export type FrescoPart = Extract<Part, { kind: "box" }> & { fresco: FrescoSpec };

export const isFresco = (part: Part): part is FrescoPart =>
  part.kind === "box" && part.fresco !== undefined;

const NAMES = [
  "ΓΕΩΡΓΙΟΣ",
  "ΔΗΜΗΤΡΙΟΣ",
  "ΝΙΚΟΛΑΟΣ",
  "ΒΑΣΙΛΕΙΟΣ",
  "ΙΩΑΝΝΗΣ",
  "ΘΕΟΔΩΡΟΣ",
  "ΠΕΤΡΟΣ",
  "ΠΑΥΛΟΣ",
  "ΓΡΗΓΟΡΙΟΣ",
  "ΕΥΓΕΝΙΟΣ",
  "ΒΑΡΒΑΡΑ",
  "ΑΙΚΑΤΕΡΙΝΗ",
  "ΣΑΒΒΑΣ",
  "ΣΩΦΡΟΝΙΟΣ",
];

const ROBES = ["#8c2f24", "#2f4f7a", "#6b4a2b", "#3f6a4a", "#a87b2c", "#5a2f4f", "#c8b89a"];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lighter or darker by `k` (-1..1), for folds and highlights. */
function tone(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) =>
    Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k))
      .toString(16)
      .padStart(2, "0");
  return `#${mix(n >> 16)}${mix((n >> 8) & 255)}${mix(n & 255)}`;
}

export function paintFresco(ctx: CanvasRenderingContext2D, W: number, H: number, spec: FrescoSpec) {
  const random = rng(spec.seed);
  const band = H * 0.045;
  const regH = (H - band * (spec.registers + 1)) / spec.registers;
  // Plaster, then the blue ground with its brushwork.
  ctx.fillStyle = "#d8ccb4";
  ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < spec.registers; r += 1) {
    const y0 = band + r * (regH + band);
    ctx.fillStyle = "#1f3a66";
    ctx.fillRect(0, y0, W, regH);
    for (let i = 0; i < 260; i += 1) {
      ctx.fillStyle = `rgba(${random() < 0.5 ? "20,40,80" : "60,90,140"},${0.15 + random() * 0.2})`;
      ctx.fillRect(random() * W, y0 + random() * regH, 4 + random() * 18, 2 + random() * 6);
    }
  }
  // The red borders, with a white line inside each.
  for (let r = 0; r <= spec.registers; r += 1) {
    const y = r * (regH + band);
    ctx.fillStyle = "#963826";
    ctx.fillRect(0, y, W, band);
    ctx.fillStyle = "#efe6d2";
    ctx.fillRect(0, y + band * 0.78, W, Math.max(1, band * 0.08));
    ctx.fillRect(0, y + band * 0.14, W, Math.max(1, band * 0.08));
  }

  for (let r = 0; r < spec.registers; r += 1) {
    const y0 = band + r * (regH + band);
    const slot = W / spec.perRow;
    for (let k = 0; k < spec.perRow; k += 1) {
      const cx = slot * (k + 0.5);
      saint(ctx, cx, y0, slot, regH, random);
    }
  }

  // Time: faded patches where the paint has gone back to plaster, and cracks.
  for (let i = 0; i < 14; i += 1) {
    const x = random() * W;
    const y = random() * H;
    const rr = (0.02 + random() * 0.05) * Math.min(W, H);
    ctx.fillStyle = `rgba(200,188,165,${0.12 + random() * 0.18})`;
    ctx.beginPath();
    // A ragged flake, not a disc.
    for (let a = 0; a < 12; a += 1) {
      const t = (a / 12) * Math.PI * 2;
      const k = rr * (0.5 + random() * 0.7);
      ctx.lineTo(x + Math.cos(t) * k * 1.4, y + Math.sin(t) * k);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(40,30,20,0.35)";
  ctx.lineWidth = Math.max(1, W / 900);
  for (let i = 0; i < 12; i += 1) {
    let x = random() * W;
    let y = random() * H;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 8; s += 1) {
      x += (random() - 0.5) * W * 0.04;
      y += random() * H * 0.04;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function saint(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y0: number,
  slot: number,
  regH: number,
  random: () => number,
) {
  const h = regH * 0.9;
  const top = y0 + regH * 0.06;
  const head = Math.min(slot * 0.13, h * 0.075);
  const headY = top + head * 2.3;
  const shoulders = Math.min(slot * 0.32, head * 3.4);
  const hem = top + h * 0.96;
  const robe = ROBES[Math.floor(random() * ROBES.length)]!;
  let mantle = ROBES[Math.floor(random() * ROBES.length)]!;
  if (mantle === robe) mantle = "#7a1f1a";
  const woman = random() < 0.15;
  const bearded = !woman && random() < 0.75;
  const greyBeard = random() < 0.5;

  // The halo: gold, outlined, with a lighter rim.
  ctx.fillStyle = "#c89a3c";
  ctx.beginPath();
  ctx.arc(cx, headY, head * 1.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a5520";
  ctx.lineWidth = head * 0.12;
  ctx.stroke();
  ctx.strokeStyle = "#ead08a";
  ctx.lineWidth = head * 0.06;
  ctx.beginPath();
  ctx.arc(cx, headY, head * 1.55, 0, Math.PI * 2);
  ctx.stroke();

  // The tunic: a long tapering robe to the feet.
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.moveTo(cx - shoulders * 0.5, headY + head * 1.4);
  ctx.lineTo(cx + shoulders * 0.5, headY + head * 1.4);
  ctx.lineTo(cx + shoulders * 0.62, hem);
  ctx.lineTo(cx - shoulders * 0.62, hem);
  ctx.closePath();
  ctx.fill();
  // Its folds: long dark strokes, a light one beside each.
  for (let f = -2; f <= 2; f += 1) {
    const x = cx + f * shoulders * 0.18;
    ctx.strokeStyle = tone(robe, -0.45);
    ctx.lineWidth = head * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, headY + head * 3);
    ctx.quadraticCurveTo(x + head * 0.3 * f, (headY + hem) / 2, x + f * head * 0.25, hem);
    ctx.stroke();
    ctx.strokeStyle = tone(robe, 0.35);
    ctx.lineWidth = head * 0.05;
    ctx.beginPath();
    ctx.moveTo(x + head * 0.18, headY + head * 3.2);
    ctx.quadraticCurveTo(
      x + head * 0.4 * f + head * 0.18,
      (headY + hem) / 2,
      x + f * head * 0.25 + head * 0.18,
      hem - head * 0.1,
    );
    ctx.stroke();
  }
  // The mantle: over one shoulder and wrapped across, to the knee.
  const side = random() < 0.5 ? -1 : 1;
  ctx.fillStyle = mantle;
  ctx.beginPath();
  ctx.moveTo(cx - side * shoulders * 0.55, headY + head * 1.3);
  ctx.quadraticCurveTo(
    cx + side * shoulders * 0.1,
    headY + head * 2.2,
    cx + side * shoulders * 0.6,
    headY + head * 1.5,
  );
  ctx.lineTo(cx + side * shoulders * 0.66, top + h * 0.7);
  ctx.quadraticCurveTo(cx, top + h * 0.78, cx - side * shoulders * 0.58, top + h * 0.66);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = tone(mantle, -0.5);
  ctx.lineWidth = head * 0.09;
  for (let f = 0; f < 4; f += 1) {
    ctx.beginPath();
    const y = headY + head * (2.6 + f * 1.6);
    ctx.moveTo(cx - side * shoulders * 0.5, y);
    ctx.quadraticCurveTo(cx, y + head * 1.2, cx + side * shoulders * 0.6, y - head * 0.4);
    ctx.stroke();
  }
  ctx.strokeStyle = tone(mantle, 0.4);
  ctx.lineWidth = head * 0.05;
  ctx.beginPath();
  ctx.moveTo(cx - side * shoulders * 0.45, headY + head * 3.4);
  ctx.quadraticCurveTo(cx, headY + head * 4.4, cx + side * shoulders * 0.55, headY + head * 3);
  ctx.stroke();

  // The neck and the face: an oval, shadowed down one side.
  ctx.fillStyle = "#b98a64";
  ctx.fillRect(cx - head * 0.3, headY + head * 0.7, head * 0.6, head * 0.8);
  ctx.fillStyle = "#c99a74";
  ctx.beginPath();
  ctx.ellipse(cx, headY, head * 0.78, head, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(110,70,40,0.45)";
  ctx.beginPath();
  ctx.ellipse(cx + head * 0.35, headY + head * 0.1, head * 0.4, head * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair over the brow; a veil for a woman saint.
  ctx.fillStyle = woman ? "#5a2f2a" : greyBeard ? "#8a8278" : "#3b2a1e";
  ctx.beginPath();
  ctx.ellipse(cx, headY - head * 0.55, head * 0.85, head * 0.55, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  if (woman) {
    ctx.beginPath();
    ctx.moveTo(cx - head * 0.95, headY - head * 0.3);
    ctx.lineTo(cx - head * 1.1, headY + head * 1.6);
    ctx.lineTo(cx + head * 1.1, headY + head * 1.6);
    ctx.lineTo(cx + head * 0.95, headY - head * 0.3);
    ctx.quadraticCurveTo(cx, headY - head * 1.4, cx - head * 0.95, headY - head * 0.3);
    ctx.fill();
    ctx.fillStyle = "#c99a74";
    ctx.beginPath();
    ctx.ellipse(cx, headY + head * 0.1, head * 0.62, head * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (bearded) {
    ctx.fillStyle = greyBeard ? "#9a9286" : "#3b2a1e";
    ctx.beginPath();
    ctx.moveTo(cx - head * 0.7, headY + head * 0.25);
    ctx.quadraticCurveTo(
      cx - head * 0.6,
      headY + head * (random() < 0.5 ? 1.9 : 1.4),
      cx,
      headY + head * 1.7,
    );
    ctx.quadraticCurveTo(cx + head * 0.6, headY + head * 1.6, cx + head * 0.7, headY + head * 0.25);
    ctx.quadraticCurveTo(cx, headY + head * 0.75, cx - head * 0.7, headY + head * 0.25);
    ctx.fill();
  }
  // Eyes, brows, nose and mouth: the few dark lines a painter gave a face.
  ctx.strokeStyle = "#2a1a10";
  ctx.lineWidth = Math.max(1, head * 0.08);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + s * head * 0.32, headY - head * 0.25, head * 0.22, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.fillStyle = "#1e140c";
    ctx.beginPath();
    ctx.ellipse(
      cx + s * head * 0.32,
      headY - head * 0.08,
      head * 0.13,
      head * 0.07,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(cx, headY - head * 0.15);
  ctx.lineTo(cx - head * 0.06, headY + head * 0.32);
  ctx.lineTo(cx + head * 0.1, headY + head * 0.36);
  ctx.stroke();
  ctx.strokeStyle = "#8a2a20";
  ctx.beginPath();
  ctx.moveTo(cx - head * 0.16, headY + head * 0.58);
  ctx.lineTo(cx + head * 0.16, headY + head * 0.58);
  ctx.stroke();

  // A hand: raised in blessing, holding a book, or a martyr's cross.
  const hold = random();
  const hx = cx - side * shoulders * 0.12;
  const hy = headY + head * 3.4;
  if (hold < 0.4) {
    ctx.fillStyle = "#8c2f24";
    ctx.fillRect(hx - head * 0.55, hy - head * 0.4, head * 1.1, head * 1.4);
    ctx.strokeStyle = "#e0b04a";
    ctx.lineWidth = head * 0.1;
    ctx.strokeRect(hx - head * 0.45, hy - head * 0.3, head * 0.9, head * 1.2);
    ctx.beginPath();
    ctx.moveTo(hx, hy - head * 0.2);
    ctx.lineTo(hx, hy + head * 0.8);
    ctx.moveTo(hx - head * 0.3, hy + head * 0.2);
    ctx.lineTo(hx + head * 0.3, hy + head * 0.2);
    ctx.stroke();
  } else if (hold < 0.7) {
    ctx.strokeStyle = "#f0e8d6";
    ctx.lineWidth = head * 0.14;
    ctx.beginPath();
    ctx.moveTo(hx, hy - head * 1.4);
    ctx.lineTo(hx, hy + head * 0.6);
    ctx.moveTo(hx - head * 0.45, hy - head * 0.9);
    ctx.lineTo(hx + head * 0.45, hy - head * 0.9);
    ctx.stroke();
  }
  ctx.fillStyle = "#c99a74";
  ctx.beginPath();
  ctx.ellipse(hx, hy, head * 0.28, head * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  // The feet, under the hem.
  ctx.fillStyle = "#2a1a10";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(
      cx + s * head * 0.4,
      hem + head * 0.12,
      head * 0.35,
      head * 0.14,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // The name, in white either side of the halo: ‘the saint’ and the name.
  const name = NAMES[Math.floor(random() * NAMES.length)]!;
  ctx.fillStyle = "#f2ead8";
  const size = Math.max(6, head * 0.42);
  ctx.font = `600 ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const left = cx - head * 2.4;
  const right = cx + head * 2.4;
  ctx.fillText(woman ? "Η" : "Ο", left, headY - head * 0.9);
  ctx.fillText("ΑΓ", left, headY - head * 0.9 + size * 1.05);
  const letters = [...name];
  const half = Math.ceil(letters.length / 2);
  ctx.fillText(letters.slice(0, half).join(""), right, headY - head * 0.9);
  ctx.fillText(letters.slice(half).join(""), right, headY - head * 0.9 + size * 1.05);
}

/** The paintings of a model, each on a sheet laid over its wall. */
export function buildFrescoes(THREE: typeof THREE_NS, parts: FrescoPart[], anisotropy: number) {
  const group = new THREE.Group();
  group.name = "frescoes";
  const owned: { dispose: () => void }[] = [];
  if (typeof document === "undefined") return { group, dispose: () => {} };
  for (const part of parts) {
    const [w, h] = part.size;
    const scale = Math.min(2048 / w, 2048 / h, 140);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(64, Math.round(w * scale));
    canvas.height = Math.max(64, Math.round(h * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    paintFresco(ctx, canvas.width, canvas.height, part.fresco);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = anisotropy;
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0 });
    // Drawn over the wall without fighting it for the same pixels.
    material.polygonOffset = true;
    material.polygonOffsetUnits = -4;
    const geometry = new THREE.PlaneGeometry(w, h);
    geometry.translate(0, h / 2, part.size[2] / 2);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...part.at);
    mesh.rotation.y = part.rotY;
    mesh.receiveShadow = true;
    group.add(mesh);
    owned.push(texture, material, geometry);
  }
  return { group, dispose: () => owned.forEach((o) => o.dispose()) };
}
