import {
  kitBox as box,
  kitCyl as cyl,
  kitPrism as prism,
  kitWorn as worn,
  type Part,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import {
  lifeAnimal as animal,
  lifeAside as aside,
  lifeFinish as finish,
  lifeFire as fire,
  lifeAltar as altar,
  lifeMake as make,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import * as trades from "@/lib/scene-trades";

/* ================================================================== *
 * INCA CITADEL: Machu Picchu
 *
 * Not a platform with a gate on it (the Tiwanaku kit this site used to
 * borrow) but a saddle between two peaks, walled in terraces: the urban
 * sector on top, round its long grass plaza, and the farming terraces
 * stepping down to the south. Plan x is east, z is south; the ridge runs
 * north - south, with Huayna Picchu beyond the north end.
 * ================================================================== */

export type IncaCitadelSpec = {
  kind: "inca-citadel";
  /** Cited: the terrace the Temple of the Three Windows stands on, square. */
  threeWindowsTerrace: number;
  /** Modelled: the urban sector on top of the saddle, east-west and north-south. */
  urbanWidth: number;
  urbanLength: number;
  /** Modelled: how high the urban sector stands over the foot of its terraces. */
  saddleHeight: number;
  /** Modelled: terraces walling the urban sector all round. */
  terraces: number;
  /** Modelled: the farming terraces running down the south slope. */
  farmTerraces: number;
  /** Modelled: houses round the plaza, in two rows of kanchas. */
  houses: number;
  /** Cited: how far Huayna Picchu rises above the town, beyond its north end. */
  huaynaPicchuHeight: number;
};

/** Steep thatch of ichu grass over fieldstone walls: the Inca house. */
function wayrona(
  parts: Part[],
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  rot: number,
) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const put = (part: Part): Part => {
    const [lx, ly, lz] = part.at;
    const at: [number, number, number] = [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
    return "rotY" in part ? ({ ...part, at, rotY: part.rotY + rot } as Part) : { ...part, at };
  };
  const wallH = 2.7;
  parts.push(put(worn(box("stone", [0, 0, 0], [w, wallH, d]), 0.03)));
  // The trapezoidal door, narrower at the lintel: two dark steps of opening.
  parts.push(put(box("shadow", [0, 0, -d / 2 - 0.03], [1.1, 1.3, 0.06])));
  parts.push(put(box("shadow", [0, 1.3, -d / 2 - 0.03], [0.85, 0.7, 0.06])));
  parts.push(put(box("shadow", [w * 0.3, 1.2, -d / 2 - 0.03], [0.45, 0.6, 0.06])));
  parts.push(put(prism("papyrus", [0, wallH, 0], [w + 1.2, 3.4, d + 1.0])));
}

export function incaCitadelParts(spec: IncaCitadelSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.urbanWidth;
  const L = spec.urbanLength;
  const H = spec.saddleHeight;
  const N = spec.terraces;
  const rise = H / N;
  const tread = 3.5;

  /* ---- 1. The saddle, walled in terraces on every side ---- */
  for (let i = 0; i < N; i += 1) {
    const out = (N - 1 - i) * tread;
    const y = i * rise;
    parts.push(worn(box("stone", [0, y, 0], [W + 2 * out, rise, L + 2 * out]), 0.06));
    // Soil and grass on every tread.
    parts.push(box("grass", [0, y + rise, 0], [W + 2 * out - 0.4, 0.08, L + 2 * out - 0.4]));
  }

  /* ---- 2. The farming terraces down the south slope ---- */
  const M = spec.farmTerraces;
  const farmW = W * 0.72;
  const farmTread = 4.2;
  const farmStart = L / 2 - 2;
  for (let k = 0; k < M; k += 1) {
    const h = (H * (M - k)) / (M + 1);
    const z = farmStart + k * farmTread + farmTread / 2;
    parts.push(worn(box("stone", [0, 0, z], [farmW, h, farmTread + 0.3]), 0.05));
    parts.push(box("grass", [0, h, z + 0.15], [farmW - 0.3, 0.08, farmTread - 0.3]));
  }

  /* ---- 3. The stair up the east terraces ---- */
  const stairOut = W / 2 + (N - 1) * tread + 2;
  const steps = Math.ceil(H / 0.3);
  const stepRun = (stairOut - W / 2) / steps;
  for (let s = 0; s < steps; s += 1) {
    const x = stairOut - (s + 0.5) * stepRun;
    parts.push(box("stoneDark", [x, 0, 6], [stepRun + 0.12, ((s + 1) * H) / steps + 0.04, 3]));
  }

  /* ---- 4. The urban sector: two rows of houses round the plaza ---- */
  const top = H + 0.08;
  const perRow = Math.ceil(spec.houses / 2);
  const rowStart = -L / 2 + 62;
  const rowEnd = L / 2 - 14;
  for (let k = 0; k < perRow; k += 1) {
    const z = rowStart + ((k + 0.5) * (rowEnd - rowStart)) / perRow;
    // West row, doors east onto the plaza.
    wayrona(parts, -W / 2 + 12, top, z, 7, 10, -Math.PI / 2);
    // East row, doors west; the Torreón takes a stretch of it.
    if (Math.abs(z - L * 0.18) > 14) wayrona(parts, W / 2 - 12, top, z, 7, 10, Math.PI / 2);
  }

  /* ---- 5. The Sacred Plaza: Temple of the Three Windows ---- */
  const T = spec.threeWindowsTerrace;
  const twX = -W / 2 + 20;
  const twZ = -L / 2 + 42;
  parts.push(worn(box("stone", [twX, top, twZ], [T, 1.2, T]), 0.04));
  const hallY = top + 1.2;
  const hallH = 4.2;
  // The window wall faces east over the plaza; the hall is open to the west.
  parts.push(box("stone", [twX + 5.5, hallY, twZ], [1.2, hallH, 12]));
  for (const wz of [-3.6, 0, 3.6]) {
    // Trapezoidal windows: wide below, narrow above.
    parts.push(box("shadow", [twX + 6.13, hallY + 1.4, twZ + wz], [0.06, 0.9, 1.3]));
    parts.push(box("shadow", [twX + 6.13, hallY + 2.3, twZ + wz], [0.06, 0.6, 0.95]));
  }
  for (const side of [-1, 1]) {
    parts.push(box("stone", [twX + 0.5, hallY, twZ + side * 5.4], [9, hallH, 1.2]));
  }
  parts.push(prism("papyrus", [twX + 0.5, hallY + hallH, twZ], [10.4, 3, 13.4], Math.PI / 2));

  // The Principal Temple beside it: three walls of great polygonal blocks.
  const ptX = twX;
  const ptZ = twZ - T / 2 - 10;
  parts.push(worn(box("stoneDark", [ptX, top, ptZ - 3.5], [12, 4.6, 1.4]), 0.03));
  for (const side of [-1, 1]) {
    parts.push(worn(box("stoneDark", [ptX + side * 5.3, top, ptZ], [1.4, 4.6, 6]), 0.03));
  }
  parts.push(box("stone", [ptX, top, ptZ - 2.3], [5, 0.9, 0.9]));

  /* ---- 6. The Intihuatana hill at the north end ---- */
  const ihX = -W / 2 + 26;
  const ihZ = -L / 2 + 14;
  const hillTiers = 4;
  for (let i = 0; i < hillTiers; i += 1) {
    const size = 24 - i * 5;
    parts.push(worn(box("stone", [ihX, top + i * 2.4, ihZ], [size, 2.4, size * 0.8]), 0.05));
  }
  const ihTop = top + hillTiers * 2.4;
  parts.push(worn(box("rock", [ihX, ihTop, ihZ], [3.2, 0.9, 2.4]), 0.08));
  // The "hitching post of the sun": a stone pillar carved out of the rock.
  parts.push(worn(box("rock", [ihX, ihTop + 0.9, ihZ], [0.6, 1.6, 0.6]), 0.03));
  // Its stair, climbing from the plaza side.
  for (let s = 0; s < hillTiers * 6; s += 1) {
    parts.push(box("stoneDark", [ihX + 6, top, ihZ + 11.5 - s * 0.38], [2.2, (s + 1) * 0.4, 0.5]));
  }

  /* ---- 7. The Torreón: a curved tower on its rock, above the royal tomb ---- */
  const toX = W / 2 - 16;
  const toZ = L * 0.18;
  parts.push(worn(box("rock", [toX, top, toZ], [14, 2.4, 11]), 0.15));
  parts.push(box("shadow", [toX + 7.03, top, toZ], [0.06, 1.6, 2.4]));
  const towerY = top + 2.4;
  parts.push(worn(cyl("stone", [toX + 1.5, towerY, toZ], 4.4, 4.2, 4.6, 28), 0.02));
  parts.push(box("shadow", [toX + 1.5, towerY + 2.2, toZ - 4.33], [0.7, 0.9, 0.12]));
  parts.push(box("shadow", [toX + 5.53, towerY + 2.2, toZ - 1.6], [0.12, 0.9, 0.7]));
  // The rooms behind it, under thatch.
  wayrona(parts, toX - 5, towerY, toZ, 5, 8, Math.PI / 2);

  /* ---- 8. The city wall and Main Gate across the south of the urban sector ---- */
  const gateZ = L / 2 - 4;
  for (const side of [-1, 1]) {
    parts.push(box("stone", [side * (W / 4 + 1.25), top, gateZ], [W / 2 - 2.5, 3.2, 1.4]));
  }
  // The double-jambed trapezoidal gateway and its single lintel block.
  parts.push(box("stoneDark", [0, top + 2.7, gateZ], [3.0, 0.8, 1.6]));
  parts.push(box("stoneDark", [-1.2, top, gateZ], [0.4, 2.7, 1.6]));
  parts.push(box("stoneDark", [1.2, top, gateZ], [0.4, 2.7, 1.6]));

  /* ---- 9. Huayna Picchu, the peak closing the view to the north ---- */
  // Its summit stands the cited height above the plaza. Outskirts: in the
  // view, but the first frame stays on the town.
  parts.push({
    ...worn(cyl("ground", [0, 0, -L / 2 - 230], 150, 14, H + spec.huaynaPicchuHeight, 32), 5),
    outskirts: true,
  });

  return parts;
}

export function incaCitadelWalkStart(spec: IncaCitadelSpec): WalkStart {
  return {
    at: [0, spec.urbanLength / 2 - 12],
    floor: spec.saddleHeight + 0.08,
    look: [0, spec.saddleHeight + 4, -spec.urbanLength / 2],
  };
}

/* ------------------------------------------------------------------ *
 * Life on the saddle: farmers on the terraces, llama-herds, priests at
 * the Intihuatana. Everybody stands on a tread the parts above build.
 * ------------------------------------------------------------------ */

export function incaCitadelLife(spec: IncaCitadelSpec, era: Era): SceneLife {
  const b = make(era, 1438);
  const { cast } = b;
  const W = spec.urbanWidth;
  const L = spec.urbanLength;
  const top = spec.saddleHeight + 0.08;

  // An offering fire on the plaza, below the Sacred Plaza.
  fire(b, altar([-6, top, -L / 2 + 70], 2, 1.2, 0.8), 0.8, true, true);
  cast.add({ at: [-6, top, -L / 2 + 67.5], rotY: Math.PI, action: "tend", role: "priest" });
  cast.add({ at: [-8.5, top, -L / 2 + 68], rotY: Math.PI * 0.8, action: "pray", role: "priest" });

  // People crossing the long plaza from the gate to the Sacred Plaza.
  cast.walk(
    [
      [2, top, L / 2 - 12],
      [2, top, -L / 2 + 66],
    ],
    { speed: 0.9, carry: "basket" },
  );
  cast.walk(
    [
      [-3, top, -L / 2 + 75],
      [-3, top, L / 2 - 16],
    ],
    { speed: 1.0 },
  );
  cast.group([8, top, 10], 3, 0.8);
  cast.group([-10, top, 40], 2, 0.7);

  // Llamas led along the plaza.
  animal(b, "llama", [6, top, 30], 0, "walk", {
    route: [
      [6, top, 30],
      [6, top, -20],
    ],
    speed: 0.6,
  });

  // Farmers on the treads of the south terraces.
  const M = spec.farmTerraces;
  const x = aside(b, 7741);
  for (const k of [1, 3, 5]) {
    if (k >= M) continue;
    const h = (spec.saddleHeight * (M - k)) / (M + 1) + 0.08;
    const z = L / 2 - 2 + k * 4.2 + 2.25;
    x.cast.add({ at: [-W * 0.2 + k * 3, h, z], rotY: 0, action: "stand", role: "citizen" });
  }
  trades.cook(x, [W / 2 - 24, top, -10], -Math.PI / 2);

  return finish(b);
}
