import {
  kitBox as box,
  kitCyl as cyl,
  kitWorn as worn,
  type Part,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import {
  lifeAside as aside,
  lifeFinish as finish,
  lifeMake as make,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import * as trades from "@/lib/scene-trades";

/* ================================================================== *
 * MAYA BALLCOURT: the Great Ball Court of Chichen Itza
 *
 * Not a stadium. Two long parallel platforms face each other across a
 * playing alley, their inner faces a sloping bench below a sheer wall with
 * a stone ring set high in its middle; a small temple closes each end.
 * Built along z (north is -z).
 * ================================================================== */

export type MayaBallcourtSpec = {
  kind: "maya-ballcourt";
  /** Cited: the whole court, end temple to end temple, and across. */
  courtLength: number;
  courtWidth: number;
  /** Cited: each of the two parallel platforms flanking the alley. */
  platformLength: number;
  /** Cited: the sheer walls of the platforms. */
  wallHeight: number;
  /** Modelled: the playing alley between the benches. */
  alleyWidth: number;
};

export function mayaBallcourtParts(spec: MayaBallcourtSpec): Part[] {
  const parts: Part[] = [];
  const Lc = spec.courtLength;
  const Wc = spec.courtWidth;
  const Lp = spec.platformLength;
  const H = spec.wallHeight;
  const A = spec.alleyWidth;
  const platDepth = (Wc - A) / 2;

  // The plastered floor of the alley and the end zones.
  parts.push(box("limestone", [0, 0, 0], [A + 0.2, 0.06, Lc - 30]));

  for (const side of [-1, 1]) {
    const inner = side * (A / 2);
    // The sloping bench at the foot of the wall, carved with the ballplayers.
    parts.push(worn(box("limestone", [inner + side * 1.4, 0, 0], [2.8, 1.4, Lp]), 0.03));
    // The platform behind it: its inner face the sheer playing wall.
    const cx = inner + side * (2.8 + (platDepth - 2.8) / 2);
    parts.push(worn(box("limestone", [cx, 0, 0], [platDepth - 2.8, H, Lp]), 0.05));
    parts.push(box("stone", [cx, H, 0], [platDepth - 2.6, 0.3, Lp + 0.2]));
    // The stone ring, set high in the middle of the wall, its hole across the alley.
    const ringY = H * 0.78;
    const face = inner + side * 2.8;
    parts.push(
      cyl("stone", [face - side * 0.35, ringY, 0], 1.1, 1.1, 0.35, 20, {
        rotX: Math.PI / 2,
        rotY: Math.PI / 2,
      }),
    );
    parts.push(
      cyl("shadow", [face - side * 0.55, ringY, 0], 0.35, 0.35, 0.06, 12, {
        rotX: Math.PI / 2,
        rotY: Math.PI / 2,
      }),
    );
  }

  // The Temple of the Jaguars on the east platform, at its south end.
  const ex = A / 2 + 2.8 + (platDepth - 2.8) / 2;
  const tz = Lp / 2 - 9;
  parts.push(worn(box("limestone", [ex, H + 0.3, tz], [12, 5.5, 13]), 0.03));
  parts.push(box("shadow", [ex - 6.03, H + 0.3, tz], [0.06, 3.2, 5]));
  parts.push(box("paintRed", [ex - 6.05, H + 4.2, tz], [0.06, 1.2, 12]));

  // The end temples: a small one on the north, a larger one on the south.
  for (const [end, w, d, h] of [
    [-1, 16, 12, 6],
    [1, 30, 14, 8],
  ] as const) {
    const z = end * (Lc / 2 - d / 2);
    parts.push(worn(box("limestone", [0, 0, z], [w, h - 3, d]), 0.04));
    parts.push(box("limestone", [0, h - 3, z + end * 2], [w * 0.6, 3, d * 0.55]));
    parts.push(box("shadow", [0, h - 3, z + end * 2 - end * (d * 0.275 + 0.03)], [2.2, 2.2, 0.06]));
    // Its stair, down to the court.
    for (let s = 0; s < 8; s += 1) {
      parts.push(
        box("stone", [0, 0, z - end * (d / 2 + 0.4 + s * 0.45)], [5, ((8 - s) * (h - 3)) / 8, 0.5]),
      );
    }
  }

  return parts;
}

export function mayaBallcourtWalkStart(spec: MayaBallcourtSpec): WalkStart {
  return {
    at: [0, spec.platformLength / 2 + 8],
    floor: 0.06,
    look: [0, spec.wallHeight * 0.6, -spec.platformLength / 2],
  };
}

export function mayaBallcourtLife(spec: MayaBallcourtSpec, era: Era): SceneLife {
  const b = make(era, 1168);
  const { cast } = b;
  // Players in the alley, and onlookers at the open ends.
  for (const [x, z] of [
    [-6, -10],
    [5, -4],
    [-3, 8],
    [7, 14],
  ] as const) {
    cast.add({ at: [x, 0.06, z], rotY: x < 0 ? Math.PI / 2 : -Math.PI / 2, action: "stand" });
  }
  cast.group([0, 0.06, -spec.platformLength / 2 - 10], 4, 1.1);
  cast.group([6, 0.06, spec.platformLength / 2 + 12], 3, 0.9);
  const x = aside(b, 9161);
  trades.hawker(x, [-8, 0.06, spec.platformLength / 2 + 16], Math.PI);
  return finish(b);
}
