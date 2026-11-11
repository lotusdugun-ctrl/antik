import {
  kitBox as box,
  kitCyl as cyl,
  kitPrism as prism,
  kitWorn as worn,
  type Material,
  type Part,
} from "@/lib/reconstruction-parts";

/* ================================================================== *
 * The fabric of a city: the houses, shops and yards between its monuments
 * ================================================================== */

/**
 * A city was never a few temples standing in an empty field: the monuments
 * rose out of a mass of ordinary houses, and what those houses were made of
 * and how they were laid out is what most tells one civilisation's city from
 * another's. Each style here is the common house of one culture, as
 * excavation and the standard reconstructions show it:
 *
 * - roman: insulae and domus behind rows of shops, rendered walls, terracotta
 *   tiled roofs, on a regular grid (Pompeii, Ostia, Timgad).
 * - greek: whitewashed courtyard houses on a Hippodamian grid, low tiled roofs
 *   (Priene, Olynthos).
 * - hellenistic-egypt: Alexandria's mixed town: rendered stone houses with
 *   flat roofs and roof terraces on the Greek grid.
 * - egyptian: mud-brick houses, flat roofs used as terraces, a light shelter
 *   on the roof, tiny high windows (Deir el-Medina, Amarna).
 * - mesopotamian: blind mud-brick courtyard houses packed along crooked lanes,
 *   flat roofs with a parapet (Ur's AH site, Babylon's Merkes quarter).
 * - persian: mud brick on stone footings, flat roofs, timber porch posts.
 * - indus: burnt-brick houses of one and two storeys on a strict grid of
 *   streets, flat roofs, blank walls to the street (Mohenjo-daro).
 * - levant: stone houses with flat roofs, stair to the roof (Petra, Jerash,
 *   Byblos, Palmyra's houses).
 * - khmer: timber houses on stilts with steep thatched roofs; only the gods
 *   lived in stone at Angkor.
 * - maya: plastered houses on low stone platforms under tall palm-thatch
 *   roofs, scattered in household groups among trees.
 * - mesoamerican: Teotihuacan's apartment compounds: windowless rendered
 *   blocks with flat roofs, painted red bands.
 * - andean: Inca fieldstone houses with steep thatched gables, grouped round
 *   a yard (kancha).
 * - chimu: Chan Chan's adobe: high blank walls and flat roofs.
 * - chinese: walled courtyard houses (siheyuan) with grey tiled roofs inside
 *   the walled wards (fang) of Chang'an and Luoyang.
 * - japanese: timber houses with grey tile or bark roofs on Heijō-kyō's and
 *   Heian-kyō's grid.
 */
export type FabricStyle =
  | "roman"
  | "greek"
  | "hellenistic-egypt"
  | "egyptian"
  | "mesopotamian"
  | "persian"
  | "indus"
  | "levant"
  | "khmer"
  | "maya"
  | "mesoamerican"
  | "andean"
  | "chimu"
  | "chinese"
  | "japanese";

export type FabricSpec = {
  style: FabricStyle;
  /** How many houses to build, nearest the monuments first. */
  houses?: number;
  /** Half the side of the square the houses fill, where the city has no walls (metres). */
  extent?: number;
  /** A turn of the street grid, degrees. */
  gridTurn?: number;
};

/** One house plot: centre, size (x along the street front, z deep), turn, and its form. */
export type Plot = {
  x: number;
  z: number;
  w: number;
  d: number;
  /** Radians about the vertical; the house's door faces its local -z. */
  rot: number;
  storeys: number;
  variant: number;
};

type Layout = "grid" | "cluster" | "scatter";

const STYLE: Record<
  FabricStyle,
  { layout: Layout; block: number; lane: number; size: [number, number]; houses: number }
> = {
  roman: { layout: "grid", block: 34, lane: 6, size: [10, 15], houses: 170 },
  greek: { layout: "grid", block: 30, lane: 5, size: [11, 14], houses: 150 },
  "hellenistic-egypt": { layout: "grid", block: 32, lane: 6, size: [10, 14], houses: 160 },
  egyptian: { layout: "cluster", block: 22, lane: 3.5, size: [7, 10], houses: 170 },
  mesopotamian: { layout: "cluster", block: 24, lane: 3, size: [8, 12], houses: 180 },
  persian: { layout: "cluster", block: 26, lane: 4, size: [9, 13], houses: 120 },
  indus: { layout: "grid", block: 28, lane: 5, size: [9, 12], houses: 170 },
  levant: { layout: "cluster", block: 24, lane: 4, size: [8, 11], houses: 150 },
  khmer: { layout: "scatter", block: 16, lane: 0, size: [6, 9], houses: 110 },
  maya: { layout: "scatter", block: 20, lane: 0, size: [5, 8], houses: 90 },
  mesoamerican: { layout: "grid", block: 60, lane: 8, size: [24, 34], houses: 60 },
  andean: { layout: "scatter", block: 22, lane: 0, size: [6, 9], houses: 90 },
  chimu: { layout: "cluster", block: 26, lane: 4, size: [9, 13], houses: 130 },
  chinese: { layout: "grid", block: 36, lane: 7, size: [14, 18], houses: 120 },
  japanese: { layout: "grid", block: 30, lane: 6, size: [10, 14], houses: 130 },
};

/** A small deterministic generator, so a city is laid out the same every time. */
function rng(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type KeepOut = { minX: number; maxX: number; minZ: number; maxZ: number };
export type Corridor = { x1: number; z1: number; x2: number; z2: number; half: number };

/**
 * Where the houses go. The monuments, the streets and the visitor's own
 * standing place are kept clear; within the area left the plots are taken
 * nearest the chief monument first, so the town is densest round its heart
 * and thins out towards the walls or the fields.
 */
export function fabricPlots(
  fabric: FabricSpec,
  area: { halfX: number; halfZ: number },
  keepOut: KeepOut[],
  corridors: Corridor[],
  heart: [number, number],
  seed: number,
): Plot[] {
  const style = STYLE[fabric.style];
  const rand = rng(seed);
  const turn = ((fabric.gridTurn ?? 0) * Math.PI) / 180;
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  const toWorld = (x: number, z: number): [number, number] => [x * c + z * s, -x * s + z * c];
  const [s0, s1] = style.size;
  const candidates: Plot[] = [];

  if (style.layout === "scatter") {
    const tries = style.houses * 12;
    for (let k = 0; k < tries; k += 1) {
      const x = (rand() * 2 - 1) * area.halfX;
      const z = (rand() * 2 - 1) * area.halfZ;
      const w = s0 + rand() * (s1 - s0);
      candidates.push({
        x,
        z,
        w,
        d: w * (0.7 + rand() * 0.3),
        rot: rand() * Math.PI * 2,
        storeys: 1,
        variant: Math.floor(rand() * 4),
      });
    }
  } else {
    const B = style.block;
    const lane = style.lane;
    const nx = Math.floor((area.halfX * 2) / B);
    const nz = Math.floor((area.halfZ * 2) / B);
    for (let i = 0; i < nx; i += 1) {
      for (let j = 0; j < nz; j += 1) {
        const bx = -area.halfX + (i + 0.5) * B;
        const bz = -area.halfZ + (j + 0.5) * B;
        const inner = B - lane;
        // A block is cut into plots along its two long sides, back to back.
        const along = Math.max(1, Math.round(inner / ((s0 + s1) / 2)));
        const pw = inner / along;
        const rows = style.layout === "cluster" ? 2 : inner > 2 * s1 ? 2 : 1;
        const pd = inner / rows;
        for (let a = 0; a < along; a += 1) {
          for (let r = 0; r < rows; r += 1) {
            if (style.layout === "cluster" && rand() < 0.12) continue; // a yard, a ruin, a garden
            const lx = bx - inner / 2 + (a + 0.5) * pw;
            const lz = bz - inner / 2 + (r + 0.5) * pd;
            const jit = style.layout === "cluster" ? 0.5 : 0;
            const [wx, wz] = toWorld(lx + (rand() - 0.5) * jit, lz + (rand() - 0.5) * jit);
            // Back-to-back rows: the front row's door faces out to the near lane.
            const faceOut = rows === 1 ? (rand() < 0.5 ? 0 : Math.PI) : r === 0 ? 0 : Math.PI;
            candidates.push({
              x: wx,
              z: wz,
              w: pw - (style.layout === "cluster" ? 1.2 : 0.6),
              d: pd - (style.layout === "cluster" ? 1.2 : 0.6),
              rot: turn + faceOut,
              storeys: rand() < 0.35 ? 2 : 1,
              variant: Math.floor(rand() * 4),
            });
          }
        }
      }
    }
  }

  const clear = (p: Plot) => {
    const r = Math.hypot(p.w, p.d) / 2;
    if (Math.abs(p.x) + r > area.halfX || Math.abs(p.z) + r > area.halfZ) return false;
    for (const k of keepOut)
      if (p.x + r > k.minX && p.x - r < k.maxX && p.z + r > k.minZ && p.z - r < k.maxZ)
        return false;
    for (const cor of corridors) {
      const dx = cor.x2 - cor.x1;
      const dz = cor.z2 - cor.z1;
      const L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((p.x - cor.x1) * dx + (p.z - cor.z1) * dz) / L2));
      if (Math.hypot(p.x - cor.x1 - t * dx, p.z - cor.z1 - t * dz) < cor.half + r) return false;
    }
    return true;
  };

  const picked: Plot[] = [];
  const want = fabric.houses ?? style.houses;
  const scored = candidates
    .filter(clear)
    .map((p) => ({ p, k: Math.hypot(p.x - heart[0], p.z - heart[1]) * (0.85 + rand() * 0.3) }))
    .sort((a, b) => a.k - b.k);
  for (const { p } of scored) {
    if (picked.length >= want) break;
    if (style.layout === "scatter") {
      // Households keep their distance from each other.
      const gap = (p.w + 6) * 0.9;
      if (picked.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < gap + q.w * 0.5)) continue;
    }
    picked.push(p);
  }
  return picked;
}

/* ------------------------------------------------------------------ *
 * The houses themselves, built at the origin facing -z, then placed
 * ------------------------------------------------------------------ */

/** Dark openings on the front face: a door and a few windows. */
function openings(
  parts: Part[],
  w: number,
  d: number,
  h: number,
  door: [number, number],
  windows: number,
  winY: number,
  winSize: [number, number],
) {
  parts.push(box("shadow", [w * 0.18, 0, -d / 2 - 0.03], [door[0], door[1], 0.06]));
  for (let k = 0; k < windows; k += 1) {
    const x = -w / 2 + ((k + 0.5) * w) / windows;
    if (Math.abs(x - w * 0.18) < door[0]) continue;
    if (winY + winSize[1] > h - 0.2) continue;
    parts.push(box("shadow", [x, winY, -d / 2 - 0.03], [winSize[0], winSize[1], 0.06]));
  }
}

function roman(p: Plot): Part[] {
  const parts: Part[] = [];
  const { w, d } = p;
  const h = 3.6 * p.storeys + 0.6;
  const wall: Material = ["limestone", "conglomerate", "linen", "sand"][p.variant] as Material;
  // The house round its atrium: the front range and the back range under
  // tiled roofs, the atrium between them open to the sky.
  const front = d * 0.42;
  parts.push(worn(box(wall, [0, 0, -d / 2 + front / 2], [w, h, front]), 0.03));
  parts.push(worn(box(wall, [0, 0, d / 2 - front / 2], [w, h - 0.6, front]), 0.03));
  for (const side of [-1, 1])
    parts.push(box(wall, [side * (w / 2 - 0.3), 0, 0], [0.6, h - 1.2, d - front * 2 + 0.2]));
  parts.push(prism("terracotta", [0, h, -d / 2 + front / 2], [w + 0.5, 1.5, front + 0.5]));
  parts.push(prism("terracotta", [0, h - 0.6, d / 2 - front / 2], [w + 0.5, 1.4, front + 0.5]));
  // A shop open to the street, and the house door.
  parts.push(box("shadow", [-w * 0.25, 0, -d / 2 - 0.03], [2.4, 2.6, 0.06]));
  openings(parts, w, d, h, [1.4, 2.6], 4, 4.4, [0.7, 0.9]);
  return parts;
}

function greek(p: Plot): Part[] {
  const parts: Part[] = [];
  const { w, d } = p;
  const h = 3.4 * p.storeys;
  // Whitewashed rooms along the north side of a walled court (the pastas house).
  const rooms = d * 0.45;
  parts.push(worn(box("linen", [0, 0, d / 2 - rooms / 2], [w, h, rooms]), 0.02));
  parts.push(prism("terracotta", [0, h, d / 2 - rooms / 2], [w + 0.4, 1.2, rooms + 0.4]));
  parts.push(box("linen", [0, 0, -d / 2 + 0.3], [w, 2.6, 0.6]));
  for (const side of [-1, 1])
    parts.push(box("linen", [side * (w / 2 - 0.3), 0, -rooms / 2], [0.6, 2.6, d - rooms]));
  // The portico (pastas) on the court, on timber posts.
  for (let k = 0; k < 4; k += 1)
    parts.push(
      cyl("timber", [-w / 2 + ((k + 0.5) * w) / 4, 0, d / 2 - rooms - 1.2], 0.14, 0.14, 2.8, 5),
    );
  parts.push(box("terracotta", [0, 2.8, d / 2 - rooms - 0.7], [w, 0.2, 1.6]));
  parts.push(box("shadow", [w * 0.2, 0, -d / 2 - 0.03], [1.3, 2.2, 0.06]));
  return parts;
}

function flatRoofed(
  p: Plot,
  wall: Material,
  trim: Material,
  storeyH: number,
  opts: {
    parapet?: boolean;
    shelter?: boolean;
    window?: boolean;
    court?: boolean;
    band?: Material;
  } = {},
): Part[] {
  const parts: Part[] = [];
  const { w, d } = p;
  const h = storeyH * p.storeys;
  if (opts.court && w > 7 && d > 7) {
    // Rooms round a small open court.
    const t = Math.min(3.2, w * 0.3);
    parts.push(worn(box(wall, [0, 0, -d / 2 + t / 2], [w, h, t]), 0.04));
    parts.push(worn(box(wall, [0, 0, d / 2 - t / 2], [w, h, t]), 0.04));
    for (const side of [-1, 1])
      parts.push(worn(box(wall, [side * (w / 2 - t / 2), 0, 0], [t, h, d - 2 * t]), 0.04));
    parts.push(box("ground", [0, 0, 0], [w - 2 * t, 0.1, d - 2 * t]));
  } else {
    parts.push(worn(box(wall, [0, 0, 0], [w, h, d]), 0.04));
  }
  // The roof: timber and packed earth over the walls, a lip at the edge.
  parts.push(box(trim, [0, h, 0], [w + 0.2, 0.18, d + 0.2]));
  if (opts.parapet) {
    for (const side of [-1, 1]) {
      parts.push(box(wall, [0, h + 0.18, side * (d / 2 - 0.15)], [w, 0.7, 0.3]));
      parts.push(box(wall, [side * (w / 2 - 0.15), h + 0.18, 0], [0.3, 0.7, d - 0.6]));
    }
  }
  if (opts.band) parts.push(box(opts.band, [0, h - 0.5, -d / 2 - 0.02], [w, 0.35, 0.04]));
  if (opts.shelter && p.variant % 2 === 0) {
    // A light shelter of poles and matting on the roof, for sleeping in summer.
    const sx = w * 0.25;
    for (const [px, pz] of [
      [-sx, -1],
      [sx, -1],
      [-sx, 1],
      [sx, 1],
    ] as const)
      parts.push(cyl("timber", [px, h + 0.18, pz], 0.07, 0.07, 1.9, 6));
    parts.push(box("papyrus", [0, h + 2.05, 0], [w * 0.5 + 0.4, 0.08, 2.4]));
  }
  parts.push(box("shadow", [w * 0.2, 0, -d / 2 - 0.03], [1.0, 1.9, 0.06]));
  if (opts.window) {
    for (const x of [-w * 0.25, w * 0.35])
      parts.push(box("shadow", [x, h - 1.0, -d / 2 - 0.03], [0.45, 0.35, 0.06]));
  }
  return parts;
}

function persian(p: Plot): Part[] {
  const parts = flatRoofed(p, "sand", "timber", 3.6, { parapet: true, court: true });
  // A timber porch (talar) on the front.
  for (const x of [-p.w * 0.25, p.w * 0.25])
    parts.push(cyl("timber", [x, 0, -p.d / 2 - 1.2], 0.16, 0.16, 3.2, 8));
  parts.push(box("timber", [0, 3.2, -p.d / 2 - 0.8], [p.w * 0.7, 0.25, 1.8]));
  return parts;
}

/** A steep thatched roof over walls: the house of the tropics and the Andes. */
function thatched(
  p: Plot,
  wall: Material,
  thatch: Material,
  wallH: number,
  roofH: number,
  plinth?: { material: Material; height: number },
  stilts?: number,
): Part[] {
  const parts: Part[] = [];
  const { w, d } = p;
  let y = 0;
  if (plinth) {
    parts.push(worn(box(plinth.material, [0, 0, 0], [w + 1.6, plinth.height, d + 1.6]), 0.05));
    parts.push(box(plinth.material, [w * 0.2, 0, -d / 2 - 1.1], [1.4, plinth.height * 0.5, 0.6]));
    y = plinth.height;
  }
  if (stilts) {
    for (const sx of [-1, 1])
      for (const sz of [-1, 0, 1])
        parts.push(
          cyl("timber", [sx * (w / 2 - 0.3), 0, sz * (d / 2 - 0.3)], 0.13, 0.13, stilts, 6),
        );
    parts.push(box("timber", [0, stilts, 0], [w, 0.25, d]));
    // The ladder up to the door.
    parts.push(box("timber", [w * 0.2, 0, -d / 2 - 0.9], [0.9, stilts, 0.12]));
    y = stilts + 0.25;
  }
  parts.push(worn(box(wall, [0, y, 0], [w, wallH, d]), 0.03));
  parts.push(box("shadow", [w * 0.2, y, -d / 2 - 0.03], [0.9, Math.min(1.9, wallH - 0.2), 0.06]));
  // Thatch: the gable roof running the length of the house, with deep eaves.
  parts.push(prism(thatch, [0, y + wallH, 0], [w + 1.4, roofH, d + 1.2]));
  return parts;
}

function chinese(p: Plot): Part[] {
  const parts: Part[] = [];
  const { w, d } = p;
  const wallH = 3.2;
  // The compound wall, rendered, with a grey tiled coping, and the gate in it.
  for (const side of [-1, 1]) {
    parts.push(box("linen", [0, 0, side * (d / 2 - 0.25)], [w, wallH, 0.5]));
    parts.push(box("linen", [side * (w / 2 - 0.25), 0, 0], [0.5, wallH, d - 1]));
  }
  parts.push(box("andesite", [0, wallH, -d / 2 + 0.25], [w + 0.3, 0.3, 0.9]));
  parts.push(box("andesite", [0, wallH, d / 2 - 0.25], [w + 0.3, 0.3, 0.9]));
  parts.push(box("paintRed", [-w * 0.3, 0, -d / 2 - 0.05], [1.6, 2.4, 0.1]));
  parts.push(prism("andesite", [-w * 0.3, wallH, -d / 2 + 0.2], [2.6, 1.0, 1.6]));
  // The main hall across the back of the court and a side hall: timber posts,
  // grey tiled roofs.
  const hall = (x: number, z: number, hw: number, hd: number, rot: number) => {
    const hh = 3.4;
    parts.push(box("stone", [x, 0, z], [hw + 0.6, 0.45, hd + 0.6], rot));
    // Red posts and doors below, a white plastered frieze above.
    parts.push(box("paintRed", [x, 0.45, z], [hw, hh * 0.75, hd], rot));
    parts.push(box("linen", [x, 0.45 + hh * 0.75, z], [hw, hh * 0.25, hd], rot));
    parts.push(prism("andesite", [x, 0.45 + hh, z], [hw + 1.6, 1.9, hd + 1.4], rot));
  };
  hall(0, d / 2 - 3.6, w - 2.4, 5, 0);
  if (w > 12) hall(w / 2 - 3, -0.8, 4.2, d * 0.35, 0);
  // A tree in the court.
  parts.push(cyl("timber", [-w * 0.15, 0, -d * 0.05], 0.18, 0.14, 2.6, 6));
  parts.push(cyl("foliage", [-w * 0.15, 2.4, -d * 0.05], 1.6, 0.6, 2.4, 8));
  return parts;
}

function japanese(p: Plot): Part[] {
  const parts: Part[] = [];
  const { w, d } = p;
  const h = 3.2;
  parts.push(box("stone", [0, 0, 0], [w + 0.4, 0.5, d + 0.4]));
  parts.push(box("timber", [0, 0.5, 0], [w, h, d]));
  // Plastered panels between the posts, and the sliding doors on the front.
  parts.push(box("linen", [0, 0.5 + h * 0.55, -d / 2 - 0.02], [w * 0.92, h * 0.35, 0.04]));
  parts.push(box("shadow", [w * 0.15, 0.5, -d / 2 - 0.03], [w * 0.4, h * 0.5, 0.05]));
  // Hipped roof of grey tile or cypress bark, with deep eaves.
  const roof: Material = p.variant % 2 === 0 ? "andesite" : "hide";
  parts.push(box(roof, [0, 0.5 + h, 0], [w + 0.5, 0.25, d + 0.5]));
  parts.push(prism(roof, [0, 0.75 + h, 0], [w + 0.3, 2.2, d + 0.3]));
  // The fence of the plot.
  parts.push(box("timber", [0, 0, -d / 2 - 2.2], [w + 2, 1.4, 0.12]));
  return parts;
}

function mesoamerican(p: Plot): Part[] {
  // Teotihuacan apartment compound: a blank rendered block round courts,
  // painted red bands under the roofline.
  return flatRoofed(p, "linen", "conglomerate", 4.2, {
    parapet: true,
    court: true,
    band: "paintRed",
  });
}

const BUILD: Record<FabricStyle, (p: Plot) => Part[]> = {
  roman,
  greek,
  "hellenistic-egypt": (p) =>
    flatRoofed(p, p.variant % 2 ? "limestone" : "linen", "stone", 3.6, {
      parapet: true,
      window: true,
      court: true,
    }),
  egyptian: (p) =>
    flatRoofed(p, "sand", "timber", 3.0, { parapet: true, shelter: true, window: true }),
  mesopotamian: (p) => flatRoofed(p, "sand", "conglomerate", 3.4, { parapet: true, court: true }),
  persian,
  indus: (p) => flatRoofed(p, "terracotta", "timber", 3.2, { parapet: true, court: true }),
  levant: (p) => flatRoofed(p, "limestone", "stone", 3.4, { parapet: true, window: true }),
  khmer: (p) => thatched(p, "timber", "papyrus", 2.6, 3.4, undefined, 2.2),
  maya: (p) => thatched(p, "linen", "papyrus", 2.4, 3.6, { material: "limestone", height: 0.9 }),
  mesoamerican,
  andean: (p) => thatched(p, "stone", "papyrus", 2.6, 3.2),
  chimu: (p) => flatRoofed(p, "sand", "conglomerate", 3.6, { parapet: true, court: true }),
  chinese,
  japanese,
};

/** The houses of a city, each built and then turned and moved onto its plot. */
export function fabricParts(style: FabricStyle, plots: Plot[]): Part[] {
  const out: Part[] = [];
  for (const p of plots) {
    const c = Math.cos(p.rot);
    const s = Math.sin(p.rot);
    for (const part of BUILD[style](p)) {
      const [lx, y, lz] = part.at;
      const at: [number, number, number] = [p.x + lx * c + lz * s, y, p.z - lx * s + lz * c];
      if ("rotY" in part) out.push({ ...part, at, rotY: part.rotY + p.rot } as Part);
      else out.push({ ...part, at } as Part);
    }
  }
  return out;
}
