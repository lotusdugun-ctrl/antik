import {
  kitBox as box,
  kitCyl as cyl,
  kitPrism as prism,
  kitWorn as worn,
  type Part,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { lifeFinish as finish, lifeMake as make, type Era, type SceneLife } from "@/lib/scene-life";

/* ================================================================== *
 * NABATAEAN ROCK FAÇADE: Petra's Treasury and Monastery
 *
 * Not a free-standing Roman front but a front carved back into the cliff:
 * a lower storey of columns, and above it a round tholos under a conical
 * roof and an urn, between two halves of a broken pediment. The Treasury
 * (`khazneh`) has a columned portico and a pediment over its lower storey;
 * the Monastery (`deir`) is broader and plainer, half-columns and one tall
 * door. Built facing -z, the cliff behind it on +z.
 * ================================================================== */

export type NabataeanFacadeSpec = {
  kind: "nabataean-facade";
  /** Cited: the carved front. */
  facadeHeight: number;
  facadeWidth: number;
  /** Cited for the Monastery: its door. Modelled otherwise. */
  doorHeight: number;
  style: "khazneh" | "deir";
};

export function nabataeanFacadeParts(spec: NabataeanFacadeSpec): Part[] {
  const parts: Part[] = [];
  const H = spec.facadeHeight;
  const W = spec.facadeWidth;
  const rockMat = "terracotta" as const;
  const khazneh = spec.style === "khazneh";

  /* ---- The cliff the front is cut back into ---- */
  const cliffW = W * 2.2;
  const cliffH = H * 1.35;
  const depth = 24;
  // Behind the front, and either side of it standing forward.
  parts.push(worn(box(rockMat, [0, 0, depth / 2], [cliffW, cliffH, depth]), 0.6));
  const side = (cliffW - W - 2) / 2;
  for (const sx of [-1, 1]) {
    parts.push(worn(box(rockMat, [sx * (W / 2 + 1 + side / 2), 0, -2.5], [side, cliffH, 5]), 0.8));
  }
  // The rough-cut floor of the recess.
  parts.push(box(rockMat, [0, 0, -3], [W + 2, 0.4, 6]));

  /* ---- Lower storey ---- */
  const lowerH = H * (khazneh ? 0.46 : 0.42);
  const colH = lowerH * 0.78;
  const colR = khazneh ? 0.6 : 0.75;
  const cols = khazneh ? 6 : 8;
  const frontZ = khazneh ? -3 : -0.9;
  // The back wall of the storey.
  parts.push(worn(box(rockMat, [0, 0.4, 0.5], [W, lowerH, 1]), 0.04));
  for (let i = 0; i < cols; i += 1) {
    const t = i / (cols - 1);
    // Khazneh: the middle pair wider apart, to frame the door.
    const x = khazneh
      ? [-W * 0.42, -W * 0.28, -W * 0.1, W * 0.1, W * 0.28, W * 0.42][i]!
      : -W * 0.44 + t * W * 0.88;
    parts.push(cyl(rockMat, [x, 0.4, frontZ], colR, colR * 0.88, colH, 14));
    // The capital.
    parts.push(box(rockMat, [x, 0.4 + colH, frontZ], [colR * 2.6, 0.8, colR * 2.6]));
  }
  // Entablature across the lower storey.
  const entY = 0.4 + colH + 0.8;
  const entD = khazneh ? 4.2 : 2.2;
  parts.push(
    box(rockMat, [0, entY, frontZ + entD / 2 - colR * 1.3], [W, lowerH - colH - 1.2, entD]),
  );
  // The doorway in the back wall.
  const doorW = khazneh ? 3.4 : spec.doorHeight * 0.45;
  parts.push(box("shadow", [0, 0.4, -0.03], [doorW, spec.doorHeight, 0.06]));
  if (khazneh) {
    // The pediment over the central four columns.
    parts.push(prism(rockMat, [0, 0.4 + lowerH, frontZ + 1.2], [W * 0.62, H * 0.08, 2.4]));
    // Riders between the outer columns, in the shade of the portico.
    for (const sx of [-1, 1]) {
      parts.push(box("shadow", [sx * W * 0.35, 0.4, 0.43 - 1.03], [2.4, colH * 0.85, 0.06]));
    }
  }

  /* ---- Upper storey: tholos between two half-pavilions ---- */
  const upY = 0.4 + lowerH + (khazneh ? H * 0.08 : 0.6);
  const upH = H - upY - H * 0.1;
  const tholosR = W * (khazneh ? 0.13 : 0.12);
  // The back wall of the upper storey.
  parts.push(worn(box(rockMat, [0, upY, 1], [W * 0.96, upH, 1.2]), 0.04));
  // The tholos drum, its columns, its conical roof and the urn on top.
  parts.push(cyl(rockMat, [0, upY, -tholosR + 0.4], tholosR, tholosR, upH * 0.82, 20));
  for (let k = 0; k < 5; k += 1) {
    const a = Math.PI * (0.15 + (k * 0.7) / 4);
    parts.push(
      cyl(
        rockMat,
        [Math.cos(a) * (tholosR + 0.4), upY, -tholosR + 0.4 - Math.sin(a) * (tholosR + 0.4)],
        0.45,
        0.4,
        upH * 0.72,
        10,
      ),
    );
  }
  const roofY = upY + upH * 0.82;
  parts.push(cyl(rockMat, [0, roofY, -tholosR + 0.4], tholosR * 1.08, 0.6, upH * 0.18, 20));
  parts.push(cyl(rockMat, [0, roofY + upH * 0.18, -tholosR + 0.4], 0.9, 0.5, H * 0.08, 12));
  // The half-pavilions either side, each with half a pediment on top.
  const pavW = W * 0.27;
  for (const sx of [-1, 1]) {
    const px = sx * (W / 2 - pavW / 2);
    parts.push(worn(box(rockMat, [px, upY, -1.2], [pavW, upH * 0.7, 3]), 0.03));
    for (const cx of [-1, 1]) {
      parts.push(cyl(rockMat, [px + cx * (pavW / 2 - 0.8), upY, -2.9], 0.45, 0.4, upH * 0.62, 10));
    }
    parts.push(box(rockMat, [px, upY + upH * 0.7, -1.5], [pavW + 0.6, 0.9, 3.6]));
    parts.push(
      box(rockMat, [px + sx * pavW * 0.2, upY + upH * 0.7 + 0.9, -1.5], [pavW * 0.6, H * 0.05, 3]),
    );
  }

  return parts;
}

export function nabataeanFacadeWalkStart(spec: NabataeanFacadeSpec): WalkStart {
  return {
    at: [0, -spec.facadeWidth * 1.2],
    floor: 0,
    look: [0, spec.facadeHeight * 0.45, 0],
  };
}

export function nabataeanFacadeLife(spec: NabataeanFacadeSpec, era: Era): SceneLife {
  const b = make(era, 3313);
  const { cast } = b;
  const front = -spec.facadeWidth * 0.5 - 6;
  cast.group([-4, 0, front], 3, 0.8);
  cast.add({ at: [3, 0, front - 2], rotY: 0, action: "stand", carry: "basket" });
  cast.walk(
    [
      [-spec.facadeWidth * 0.6, 0, front - 6],
      [spec.facadeWidth * 0.6, 0, front - 6],
    ],
    { speed: 0.85 },
  );
  return finish(b);
}
