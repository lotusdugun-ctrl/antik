import {
  kitBox as box,
  kitCyl as cyl,
  kitPrism as prism,
  kitWorn as worn,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { lifeFinish as finish, lifeMake as make, type Era, type SceneLife } from "@/lib/scene-life";

/* ================================================================== *
 * PROPYLAIA: the Greek gate-building of the Athenian Acropolis
 *
 * Not a Roman arch. A Doric hall with a six-column front on each side, a
 * cross-wall pierced by five doorways, the way up through it between two
 * rows of Ionic columns; and two wings projecting west, each fronted by
 * three Doric columns between antae at two-thirds the scale, the northern
 * one finished (the Pinakotheke), the southern cut short. Faces -z.
 * ================================================================== */

export type PropylaiaSpec = {
  kind: "propylaia";
  /** Cited: the Doric front of the central hall, its doorways, each wing's columns. */
  frontColumns: number;
  doorways: number;
  wingColumns: number;
  /** Modelled: the central hall's width and depth, its Doric columns' height. */
  hallWidth: number;
  hallDepth: number;
  columnHeight: number;
};

const M = "marble" as const;

function doric(parts: Part[], at: Vec3, h: number, d: number) {
  parts.push(cyl(M, at, d / 2, d * 0.4, h - d * 0.35, 20, { flutes: 20 }));
  // Echinus and abacus.
  parts.push(cyl(M, [at[0], at[1] + h - d * 0.35, at[2]], d * 0.4, d * 0.62, d * 0.2, 20));
  parts.push(box(M, [at[0], at[1] + h - d * 0.15, at[2]], [d * 1.25, d * 0.15, d * 1.25]));
}

export function propylaiaParts(spec: PropylaiaSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.hallWidth;
  const D = spec.hallDepth;
  const H = spec.columnHeight;
  const colD = H / 5.5;
  const base = 1.2;

  /* ---- The crepis and the floor of the central hall ---- */
  for (let s = 0; s < 4; s += 1) {
    parts.push(worn(box(M, [0, s * 0.3, 0], [W + 3 - s * 0.6, 0.3, D + 3 - s * 0.6]), 0.01));
  }

  /* ---- The two hexastyle Doric fronts ---- */
  const n = spec.frontColumns;
  const span = W - colD * 1.4;
  // The middle intercolumniation is wider, for the processional way.
  const xs = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const x = -span / 2 + t * span;
    return x + Math.sign(x) * (Math.abs(x) < span * 0.25 ? colD * 0.4 : 0);
  });
  for (const z of [-D / 2 + colD, D / 2 - colD]) {
    const h = z < 0 ? H : H * 0.94;
    for (const x of xs) doric(parts, [x, base, z], h, colD);
    // Entablature and pediment.
    parts.push(box(M, [0, base + h, z], [W, H * 0.24, colD * 1.3]));
    parts.push(box("paintBlue", [0, base + h + H * 0.12, z - colD * 0.66], [W, H * 0.1, 0.05]));
    parts.push(prism(M, [0, base + h + H * 0.24, z], [W + 0.4, H * 0.22, colD * 1.4]));
  }

  /* ---- Side walls and the roof ---- */
  for (const sx of [-1, 1]) {
    parts.push(worn(box(M, [sx * (W / 2 - 0.5), base, 0], [1, H, D - colD * 3]), 0.01));
  }
  parts.push(box(M, [0, base + H * 1.24, 0], [W, 0.6, D - colD * 2.4]));
  parts.push(
    prism("terracotta", [0, base + H * 1.24 + 0.6, 0], [W + 0.6, H * 0.2, D - colD * 2.4]),
  );

  /* ---- The cross-wall with its five doorways ---- */
  const wallZ = D * 0.18;
  const doors = spec.doorways;
  const doorSpan = W - 2;
  const pitch = doorSpan / doors;
  for (let k = 0; k <= doors; k += 1) {
    const x = -doorSpan / 2 + k * pitch;
    parts.push(box(M, [x, base, wallZ], [pitch * 0.35, H * 1.2, 1.2]));
  }
  for (let k = 0; k < doors; k += 1) {
    const x = -doorSpan / 2 + (k + 0.5) * pitch;
    // The middle doorway tallest, the outer ones lowest.
    const rank = Math.abs(k - (doors - 1) / 2);
    const dh = H * (0.95 - rank * 0.15);
    parts.push(box(M, [x, base + dh, wallZ], [pitch * 0.66, H * 1.2 - dh, 1.2]));
  }

  /* ---- The Ionic columns lining the way through the west hall ---- */
  const westZ0 = -D / 2 + colD * 2.5;
  for (const sx of [-1, 1]) {
    for (let r = 0; r < 3; r += 1) {
      const z = westZ0 + r * ((wallZ - westZ0 - 1.5) / 2.5);
      const x = sx * (xs[n / 2]! - colD * 0.1);
      parts.push(cyl(M, [x, base, z], colD * 0.36, colD * 0.32, H * 1.12, 20, { flutes: 24 }));
      parts.push(box(M, [x, base + H * 1.12, z], [colD * 1.0, colD * 0.25, colD * 0.55]));
    }
  }

  /* ---- The wings, projecting west, each with three columns in antis ---- */
  const wingH = H * (2 / 3);
  const wingD = wingH / 5.5;
  for (const sx of [-1, 1]) {
    const north = sx < 0;
    const wW = north ? W * 0.75 : W * 0.5;
    const wD = north ? D * 0.75 : D * 0.45;
    const cx = sx * (W / 2 + wW / 2 + 2);
    const cz = -D / 2 - wD / 2 + 2;
    for (let s = 0; s < 3; s += 1) {
      parts.push(box(M, [cx, s * 0.3, cz], [wW + 2 - s * 0.6, 0.3, wD + 2 - s * 0.6]));
    }
    // The room: back and end walls, open to the passage on its inner side.
    parts.push(worn(box(M, [cx + sx * (wW / 2 - 0.5), 0.9, cz], [1, wingH, wD]), 0.01));
    parts.push(worn(box(M, [cx, 0.9, cz - wD / 2 + 0.5], [wW, wingH, 1]), 0.01));
    parts.push(worn(box(M, [cx, 0.9, cz + wD / 2 - 0.5], [wW, wingH, 1]), 0.01));
    // The columns between the antae, on the inner side facing the way up.
    const ix = cx - sx * (wW / 2 - wingD);
    for (let k = 0; k < spec.wingColumns; k += 1) {
      const z = cz - wD / 2 + ((k + 1) * wD) / (spec.wingColumns + 1);
      doric(parts, [ix, 0.9, z], wingH, wingD);
    }
    parts.push(box(M, [cx, 0.9 + wingH, cz], [wW + 0.4, wingH * 0.22, wD + 0.4]));
    parts.push(
      prism("terracotta", [cx, 0.9 + wingH * 1.22, cz], [wW + 0.6, wingH * 0.18, wD + 0.6]),
    );
  }

  /* ---- The ramp up to the central opening ---- */
  for (let s = 0; s < 10; s += 1) {
    parts.push(box("stone", [0, 0, -D / 2 - 1.8 - s * 1.2], [6, base - s * 0.11, 1.3]));
  }
  return parts;
}

export function propylaiaWalkStart(spec: PropylaiaSpec): WalkStart {
  return {
    at: [0, -spec.hallDepth / 2 - 20],
    floor: 0,
    look: [0, spec.columnHeight * 0.6, 0],
  };
}

export function propylaiaLife(spec: PropylaiaSpec, era: Era): SceneLife {
  const b = make(era, 4377);
  const { cast } = b;
  const front = -spec.hallDepth / 2 - 18;
  cast.walk(
    [
      [-1.5, 0, front - 6],
      [-1.5, 0, front + 2],
    ],
    { speed: 0.7, carry: "offering" },
  );
  cast.group([-10, 0, front - 4], 3, 0.8);
  cast.add({ at: [8, 0, front - 2], rotY: 0, action: "talk" });
  cast.add({ at: [9, 0, front - 2.8], rotY: Math.PI, action: "talk" });
  return finish(b);
}
