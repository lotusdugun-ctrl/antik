import { FACING } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitCyl as cyl,
  kitPrism as prism,
  kitSetting as setting,
  kitWorn as worn,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";

/* ================================================================== *
 * 1. MAYA & MESOAMERICA: Stepped Pyramid, Sanctuary & Stelae
 * ================================================================== */

export type SteppedPyramidSpec = {
  kind: "stepped-pyramid";
  /** Foundation base width and depth in metres. */
  baseWidth: number;
  baseDepth: number;
  /** Total height to the summit of the roof comb, in metres. */
  totalHeight: number;
  /** Number of stepped terraced tiers (typically 4 to 9). */
  tiers: number;
  /** Width of the steep central ceremonial stairway. */
  stairWidth: number;
  /** Dimensions of the summit sanctuary temple. */
  templeWidth: number;
  templeDepth: number;
  /** Height of the carved stone roof comb (crestería) towering over the sanctuary. */
  roofCombHeight: number;
  /** Number of carved portrait stelae standing in the plaza at the foot. */
  stelaeCount?: number;
  /** Zoomorphic carved boulder altars (as at Quiriguá). */
  zoomorphs?: number;
  palaceWidth?: number;
  /** Stairways: one up the front, or one up each of the four sides (El Castillo). */
  stairways?: 1 | 4;
  /** Height of the summit temple, when it is known; otherwise worked out. */
  templeHeight?: number;
  /** A roofed hall of square pillars beside the pyramid (Temple of the Warriors). */
  colonnade?: { rows: number; columns: number };
};

export function steppedPyramidParts(spec: SteppedPyramidSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.baseWidth;
  const D = spec.baseDepth;
  const H = spec.totalHeight;
  const N = spec.tiers;
  const stairW = spec.stairWidth;

  // The setting: tropical limestone plaza and lush greenery.
  parts.push(
    ...setting(Math.max(W, D) + 25, 3819, {
      hills: 0.3,
      stone: 0.5,
      grass: 1.5,
      ground: "limestone",
    }),
  );

  // Summit temple and roof comb height allocation:
  const combH = spec.roofCombHeight;
  const templeH = spec.templeHeight ?? Math.min(6.5, (H - combH) * 0.28);
  const pyramidH = H - combH - templeH;
  const tierH = pyramidH / N;

  const topW = spec.templeWidth + 4;
  const topD = spec.templeDepth + 4;

  /* ---- 1. Stepped Tiers (Talud / Terraces) ---- */
  for (let i = 0; i < N; i += 1) {
    const t = i / (N - 1 || 1);
    const tw = W - (W - topW) * t;
    const td = D - (D - topD) * t;
    const y = i * tierH;
    // Main tier body in weathered jungle limestone:
    parts.push(worn(box("limestone", [0, y, 0], [tw, tierH - 0.08, td]), 0.08));
    // Projecting stone coping cornice around each tier:
    parts.push(box("stone", [0, y + tierH - 0.08, 0], [tw + 0.35, 0.08, td + 0.35]));
  }

  /* ---- 2. Steep Central Axial Stairway (or one on every side) ---- */
  const stepsCount = Math.max(12, Math.floor(pyramidH / 0.35));
  const stepRise = pyramidH / stepsCount;
  const sides = spec.stairways === 4 ? 4 : 1;
  for (let side = 0; side < sides; side += 1) {
    // Side 0 climbs the front (-z); the others turn a quarter at a time.
    const depth = side % 2 === 0 ? D : W;
    const top = side % 2 === 0 ? topD : topW;
    const stairFrontZ = -depth / 2 - 2.8;
    const stairTopZ = -top / 2 - 0.8;
    const stairRun = Math.abs(stairFrontZ - stairTopZ);
    const stepTread = stairRun / stepsCount;
    const turn = (side * Math.PI) / 2;
    const c = Math.cos(turn);
    const sn = Math.sin(turn);
    const put = (x: number, y: number, z: number, size: Vec3): Part =>
      box("stone", [x * c + z * sn, y, -x * sn + z * c], size, turn);
    for (let s = 0; s < stepsCount; s += 1) {
      const sy = s * stepRise;
      const sz = stairFrontZ + s * stepTread;
      // Solid to the ground, so no tread hangs in the air off the face.
      parts.push(put(0, 0, sz + stepTread / 2, [stairW, sy + stepRise, stepTread + 0.25]));
      // The balustrade either side climbs with the flight, a little proud of it.
      for (const bs of [-1, 1]) {
        parts.push({
          ...put(bs * (stairW / 2 + 0.4), 0, sz + stepTread / 2, [
            0.8,
            sy + stepRise + 0.6,
            stepTread + 0.25,
          ]),
          material: "limestone",
        });
      }
    }
  }
  const stairFrontZ = -D / 2 - 2.8;

  /* ---- 3. Summit Sanctuary Temple ---- */
  const templeY = pyramidH;
  const tW = spec.templeWidth;
  const tD = spec.templeDepth;
  // Sanctuary podium / crepis:
  parts.push(box("stone", [0, templeY, 0], [tW + 1.2, 0.5, tD + 1.2]));

  // Sanctuary exterior thick stone walls:
  const wallH = templeH - 0.5;
  const wallThick = 1.4;
  // Back wall:
  parts.push(box("limestone", [0, templeY + 0.5, tD / 2 - wallThick / 2], [tW, wallH, wallThick]));
  // Side walls:
  for (const side of [-1, 1]) {
    parts.push(
      box(
        "limestone",
        [side * (tW / 2 - wallThick / 2), templeY + 0.5, 0],
        [wallThick, wallH, tD - wallThick * 2],
      ),
    );
  }
  // Front facade with Maya corbelled doorway:
  const doorW = Math.min(3.2, tW * 0.35);
  const pierW = (tW - doorW) / 2;
  for (const side of [-1, 1]) {
    parts.push(
      box(
        "limestone",
        [side * (tW / 2 - pierW / 2), templeY + 0.5, -tD / 2 + wallThick / 2],
        [pierW, wallH, wallThick],
      ),
    );
  }
  // Massive stone lintel over the corbelled entrance:
  parts.push(
    box(
      "stone",
      [0, templeY + 0.5 + wallH * 0.65, -tD / 2 + wallThick / 2],
      [doorW + 0.6, wallH * 0.35, wallThick + 0.2],
    ),
  );

  // Upper frieze and entablature of sanctuary:
  parts.push(box("stone", [0, templeY + wallH + 0.5, 0], [tW + 0.6, 0.7, tD + 0.6]));

  /* ---- 4. Towering Roof Comb (CresterÃ­a) ---- */
  if (combH > 0) {
    const combY = templeY + templeH + 0.7;
    const combW = tW * 0.75;
    const combThick = 1.2;
    // Lattice-carved openwork crest:
    parts.push(box("limestone", [0, combY, 0], [combW, combH, combThick]));
    // Openings / slits in the comb where light pierces through:
    const slots = 3;
    for (let k = 0; k < slots; k += 1) {
      const kx = -combW * 0.3 + (k * combW * 0.6) / (slots - 1 || 1);
      parts.push(box("shadow", [kx, combY + combH * 0.3, 0], [0.8, combH * 0.45, combThick + 0.1]));
    }
  }

  /* ---- 5. Maya Portrait Stelae & Altars in Front Plaza ---- */
  const stelaeCount = spec.stelaeCount ?? 0;
  const plazaZ = stairFrontZ - 6;
  const half = Math.ceil(stelaeCount / 2);
  for (let i = 0; i < stelaeCount; i += 1) {
    const side = i < half ? -1 : 1;
    const rank = i < half ? i : i - half;
    const sx = side * (stairW / 2 + 3.0 + rank * 3.2);
    const sz = plazaZ - (rank % 2) * 2.5;
    // Stele base slab:
    parts.push(box("stone", [sx, 0, sz], [1.8, 0.3, 1.8]));
    // Tall monolithic portrait stele (carved with king figure and glyphs):
    const steleH = 3.5 + (i % 3) * 0.6;
    parts.push(box("stoneDark", [sx, 0.3, sz], [1.1, steleH, 0.75]));
    // Round ceremonial drum altar set before each stele:
    parts.push(cyl("stone", [sx, 0, sz - 1.5], 0.65, 0.65, 0.45));
  }

  /* ---- 6. The pillared hall beside it, roofed in stone and plaster ---- */
  if (spec.colonnade) {
    const { rows, columns } = spec.colonnade;
    const pitch = 4.5;
    const x0 = W / 2 + 6;
    const span = (columns - 1) * pitch;
    const pillarH = 4.2;
    for (let r = 0; r < rows; r += 1) {
      for (let k = 0; k < columns; k += 1) {
        const px = x0 + r * pitch;
        const pz = -span / 2 + k * pitch;
        parts.push(worn(box("limestone", [px, 0, pz], [0.95, pillarH, 0.95]), 0.02));
        // The warrior carved on the pillar's face, once painted.
        parts.push(box("fadedRed", [px - 0.49, 0.8, pz], [0.04, 2.4, 0.6]));
      }
    }
    parts.push(
      box(
        "limestone",
        [x0 + ((rows - 1) * pitch) / 2, pillarH, 0],
        [(rows - 1) * pitch + 3, 0.7, span + 3],
      ),
    );
  }

  // Zoomorph boulder altars (as seen at QuiriguÃ¡):
  if (spec.zoomorphs) {
    for (let z = 0; z < spec.zoomorphs; z += 1) {
      const zx = (z % 2 === 0 ? -1 : 1) * (W * 0.45);
      const zz = plazaZ - 9;
      parts.push(cyl("stoneDark", [zx, 0, zz], 1.6, 1.2, 1.8, 16));
    }
  }

  return parts;
}

export function steppedPyramidWalkStart(spec: SteppedPyramidSpec): WalkStart {
  const frontZ = -spec.baseDepth / 2 - 12;
  return {
    at: [0, frontZ],
    floor: 0,
    look: [0, spec.totalHeight * 0.4, 0],
  };
}

/* ================================================================== *
 * 2. EAST ASIAN: Chinese Tang & Japanese Palace / Pagoda / Gate
 * ================================================================== */

export type AsianHallSpec = {
  kind: "asian-hall";
  /** Width across the facade, in metres. */
  width: number;
  /** Depth of the hall, in metres. */
  depth: number;
  /** Total height to the ridge of the curved tile roof, in metres. */
  totalHeight: number;
  /** Height of the stone / marble terrace podium (e.g. 2 to 4 m). */
  podiumHeight: number;
  /** Number of column bays across the front (odd number: 7, 9, 11). */
  columnsX: number;
  /** Number of bays deep (e.g. 5 or 7). */
  columnsZ: number;
  /** Height of the wooden column colonnade. */
  columnHeight: number;
  /** Number of curved eaves storeys (1 for hall, 2 for grand hall, 3-5 for pagoda). */
  storeys: number;
  /** Roof type: hip-and-gable (irimoya) or pagoda tower. */
  roofStyle?: "hip-and-gable" | "pagoda";
  /** Mythological roof ridge finials: shibi / chiwen horns. */
  finial?: "shibi" | "chiwen" | "gold-spire";
};

export function asianHallParts(spec: AsianHallSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.width;
  const D = spec.depth;
  const P = spec.podiumHeight;
  const storeys = spec.storeys;
  const isPagoda = spec.roofStyle === "pagoda";

  // Setting: Imperial stone flagstone esplanade with pines:
  parts.push(
    ...setting(Math.max(W, D) + 30, 7129, {
      hills: 0.2,
      stone: 0.6,
      grass: 0.8,
      ground: "limestone",
    }),
  );

  /* ---- 1. Elevated Terraced Stone Podium ---- */
  parts.push(worn(box("marbleWorn", [0, 0, 0], [W + 4, P, D + 4]), 0.05));
  // White marble balustrade surrounding the terrace:
  const railH = 0.9;
  for (const side of [-1, 1]) {
    // Back and front rails:
    parts.push(box("marble", [0, P, side * (D / 2 + 1.6)], [W + 3.6, railH, 0.25]));
    // Side rails:
    parts.push(box("marble", [side * (W / 2 + 1.6), P, 0], [0.25, railH, D + 3.2]));
  }

  // Triple imperial processional stairs on the front:
  const stairRun = P * 2.2;
  const middleW = Math.min(8, W * 0.2);
  // Center carved dragon ramp slab:
  parts.push(
    box("marbleWorn", [0, 0, -D / 2 - 2 - stairRun / 2], [middleW * 0.4, P * 0.5, stairRun], 0),
  );
  // Left and right pedestrian stair runs:
  for (const side of [-1, 1]) {
    const sx = side * (middleW * 0.8);
    for (let s = 0; s < 10; s += 1) {
      const sy = (s * P) / 10;
      const sz = -D / 2 - 2 - stairRun + (s * stairRun) / 10;
      parts.push(
        box("marble", [sx, 0, sz], [middleW * 0.5, sy + P / 10 + 0.02, stairRun / 10 + 0.1]),
      );
    }
  }

  /* ---- 2. Red Lacquered Timber Pillars & Enclosure ---- */
  const colH = spec.columnHeight;
  const colsX = spec.columnsX;
  const colsZ = spec.columnsZ;
  const stepX = W / (colsX - 1);
  const stepZ = D / (colsZ - 1);
  const colR = 0.45;

  let currentY = P;
  const availStoreyH = Math.max(3.5, (spec.totalHeight - P) / storeys);
  for (let lvl = 0; lvl < storeys; lvl += 1) {
    const scale = isPagoda ? 1 - lvl * 0.18 : lvl === 0 ? 1 : 0.82;
    const curW = W * scale;
    const curD = D * scale;
    const curColH = Math.min(colH, availStoreyH * 0.52);

    // Vermilion lacquered pillars around perimeter:
    for (let ix = 0; ix < colsX; ix += 1) {
      const px = -curW / 2 + ix * (curW / (colsX - 1));
      for (const side of [-1, 1]) {
        const pz = side * (curD / 2);
        // Column base stone:
        parts.push(cyl("stone", [px, currentY, pz], colR * 1.3, colR * 1.3, 0.25));
        // Vermilion column:
        parts.push(cyl("paintRed", [px, currentY + 0.25, pz], colR, colR, curColH));
      }
    }
    for (let iz = 1; iz < colsZ - 1; iz += 1) {
      const pz = -curD / 2 + iz * (curD / (colsZ - 1));
      for (const side of [-1, 1]) {
        const px = side * (curW / 2);
        parts.push(cyl("stone", [px, currentY, pz], colR * 1.3, colR * 1.3, 0.25));
        parts.push(cyl("paintRed", [px, currentY + 0.25, pz], colR, colR, curColH));
      }
    }

    // Interior walls & wooden lattice partitions:
    // Set back one bay from the colonnade, but never thinner than half the
    // hall (a two-column-deep gate has no bay to spare).
    const inW = Math.max(curW * 0.5, curW - stepX * 1.6);
    const inD = Math.max(curD * 0.5, curD - stepZ * 1.6);
    parts.push(box("paintRed", [0, currentY + 0.25, 0], [inW, curColH, inD]));
    // Gilded door portals on front facade:
    parts.push(
      box("paintGold", [0, currentY + 0.25, -curD / 2 + 0.05], [inW * 0.7, curColH * 0.75, 0.15]),
    );

    /* ---- 3. Dougong Wooden Bracket Clusters & Interlocking Beams ---- */
    const beamY = currentY + 0.25 + curColH;
    const bracketH = 0.85;
    // Tie-beams (Changling):
    parts.push(box("paintRed", [0, beamY, 0], [curW + 0.6, 0.45, curD + 0.6]));
    // Stepped brackets projecting outwards:
    parts.push(box("paintGold", [0, beamY + 0.45, 0], [curW + 1.5, bracketH, curD + 1.5]));

    /* ---- 4. Flaring Curved Eaves & Terracotta Tile Roof ---- */
    const roofBaseY = beamY + 0.45 + bracketH;
    const overhang = 2.4;
    const eaveW = curW + overhang * 2;
    const eaveD = curD + overhang * 2;
    const roofH = isPagoda
      ? 2.2
      : Math.max(2.2, lvl === storeys - 1 ? spec.totalHeight - roofBaseY : 2.5);

    // The tiled roof, hipped and swept: courses stepping in as they rise,
    // shallow at the eaves and steep towards the ridge, so the roof reads as
    // the concave curve of a Tang or Nara hall rather than as one flat slab.
    const courses = [
      { w: 1.0, d: 1.0, h: 0.14 },
      { w: 0.9, d: 0.84, h: 0.14 },
      { w: 0.8, d: 0.66, h: 0.18 },
      { w: 0.72, d: 0.46, h: 0.22 },
      { w: 0.66, d: 0.24, h: 0.32 },
    ];
    let cy = roofBaseY;
    for (const c of courses) {
      const h = Math.max(0.2, roofH * c.h);
      parts.push(worn(box("stoneDark", [0, cy, 0], [eaveW * c.w, h, eaveD * c.d]), 0.04));
      cy += h;
    }
    // Swept-up corner eaves (flying eaves):
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(
          box(
            "paintGold",
            [sx * (eaveW / 2 - 0.5), roofBaseY + roofH * 0.45, sz * (eaveD / 2 - 0.5)],
            [1.4, 0.4, 1.4],
          ),
        );
      }
    }

    currentY = roofBaseY + roofH;
  }

  /* ---- 5. Roof Ridge & Gold Shibi / Chiwen Finials ---- */
  const ridgeY = currentY;
  const ridgeW = W * 0.55;
  // Main ridge roll (Zhengji):
  parts.push(box("stoneDark", [0, ridgeY, 0], [ridgeW, 0.6, 1.1]));

  if (spec.finial === "gold-spire" || isPagoda) {
    // Pagoda sacred bronze mast (tiansha / sorin):
    parts.push(cyl("paintGold", [0, ridgeY, 0], 0.35, 0.12, 6.5));
    for (let r = 0; r < 7; r += 1) {
      parts.push(
        cyl("paintGold", [0, ridgeY + 1.2 + r * 0.65, 0], 0.9 - r * 0.08, 0.9 - r * 0.08, 0.2),
      );
    }
  } else {
    // Twin mythical horn/fish-tail finials (Shibi / Chiwen) guarding the ridge:
    for (const side of [-1, 1]) {
      const fx = side * (ridgeW / 2);
      parts.push(box("paintGold", [fx, ridgeY + 0.3, 0], [0.9, 1.8, 0.8]));
    }
  }

  return parts;
}

export function asianHallWalkStart(spec: AsianHallSpec): WalkStart {
  const frontZ = -spec.depth / 2 - 14;
  return {
    at: [0, frontZ],
    floor: 0,
    look: [0, spec.totalHeight * 0.4, 0],
  };
}

/* ================================================================== *
 * 3. ANCIENT EGYPT: Colossal Pylon, Obelisk & Sphinx Dromos
 * ================================================================== */

export type EgyptianPylonSpec = {
  kind: "egyptian-pylon";
  /** Overall width of the two pylon towers and portal, in metres. */
  facadeWidth: number;
  /** Height of the pylon towers. */
  pylonHeight: number;
  /** Depth of the pylon towers at base. */
  pylonDepth: number;
  /** Width and height of the central monumental portal. */
  portalWidth: number;
  portalHeight: number;
  /** Height of the pink granite obelisk (e.g. 25 m). 0 for none. */
  obeliskHeight?: number;
  /** Number of colossal seated pharaoh statues fronting the pylon (2 or 4). */
  colossiCount?: number;
  colossusHeight?: number;
  /** Number of sphinx pairs flanking the processional avenue. */
  sphinxCount?: number;
  sphinxAvenueLength?: number;
  /** True for rock-cut cliff temple facade (Abu Simbel). */
  isRockCut?: boolean;
};

export function egyptianPylonParts(spec: EgyptianPylonSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.facadeWidth;
  const H = spec.pylonHeight;
  const D = spec.pylonDepth;
  const portW = spec.portalWidth;
  const portH = spec.portalHeight;
  const towerW = (W - portW) / 2;

  // Nilotic sandstone desert setting with palm grove & river esplanade:
  parts.push(
    ...setting(W + 35, 1341, { hills: 0.25, stone: 0.6, grass: 0.3, ground: "limestone" }),
  );

  /* ---- 1. Twin Battered Pylon Towers (Inward-Sloping Sandstone) ---- */
  for (const side of [-1, 1]) {
    const tx = side * (portW / 2 + towerW / 2);
    // Battered pylon modeled as solid mass:
    parts.push(worn(box("limestone", [tx, 0, 0], [towerW, H, D]), 0.08));

    // Classical Egyptian Torus Roll along the vertical corners:
    for (const cz of [-D / 2 + 0.25, D / 2 - 0.25]) {
      const cx = tx + side * (towerW / 2 - 0.25);
      parts.push(cyl("stoneDark", [cx, 0, cz], 0.25, 0.25, H));
    }

    // Grand Cavetto Cornice projecting forward at the summit:
    parts.push(box("stone", [tx, H - 1.2, 0], [towerW + 0.8, 1.2, D + 0.8]));
    parts.push(box("paintGold", [tx, H - 0.3, -D / 2 - 0.45], [towerW * 0.9, 0.25, 0.15]));

    // Vertical flagstaff niches (recesses) carved on the pylon face:
    for (const nx of [-towerW * 0.25, towerW * 0.25]) {
      parts.push(box("shadow", [tx + nx, 0.5, -D / 2 - 0.05], [0.65, H * 0.8, 0.12]));
      // Tall timber flagstaff standing in each niche:
      parts.push(cyl("timber", [tx + nx, 0, -D / 2 - 0.2], 0.22, 0.12, H + 4.5));
    }
  }

  /* ---- 2. Monumental Central Gateway Portal ---- */
  const doorThick = D * 0.85;
  // Jambs:
  for (const side of [-1, 1]) {
    parts.push(box("stoneDark", [side * (portW / 2 - 0.6), 0, 0], [1.2, portH, doorThick]));
  }
  // Colossal Architrave & Cavetto Cornice over the portal:
  parts.push(box("stoneDark", [0, portH, 0], [portW + 1.2, 2.2, doorThick + 0.6]));
  parts.push(box("paintGold", [0, portH + 0.8, -doorThick / 2 - 0.35], [portW * 0.8, 0.5, 0.1]));
  // Shadowed entrance opening:
  parts.push(box("shadow", [0, 0, 0], [portW - 1.2, portH, doorThick - 0.2]));

  /* ---- 3. Colossal Seated Pharaoh Statues (Ramses Colossi) ---- */
  const colossiCount = spec.colossiCount ?? 2;
  const colossusH = spec.colossusHeight ?? 14;
  const colossiX: number[] =
    colossiCount === 4
      ? [-W * 0.36, -W * 0.15, W * 0.15, W * 0.36]
      : [-portW / 2 - towerW * 0.45, portW / 2 + towerW * 0.45];

  for (const cx of colossiX) {
    const cz = -D / 2 - 2.5;
    // Throne pedestal:
    const throneW = colossusH * 0.28;
    const throneD = colossusH * 0.42;
    const seatH = colossusH * 0.45;
    parts.push(box("stoneDark", [cx, 0, cz], [throneW, seatH, throneD]));
    // Seated torso and nemes headdress:
    const torsoH = colossusH * 0.4;
    parts.push(
      box("stone", [cx, seatH, cz + throneD * 0.1], [throneW * 0.85, torsoH, throneD * 0.5]),
    );
    // Pharaoh head with royal beard & crown:
    const headH = colossusH * 0.25;
    parts.push(
      cyl("stone", [cx, seatH + torsoH, cz + throneD * 0.1], throneW * 0.32, throneW * 0.28, headH),
    );
    // Double Crown of Upper & Lower Egypt (Pschent):
    parts.push(
      cyl(
        "paintGold",
        [cx, seatH + torsoH + headH, cz + throneD * 0.1],
        throneW * 0.18,
        0.05,
        headH * 0.8,
      ),
    );
  }

  /* ---- 4. Monolithic Rose Granite Obelisk ---- */
  if (spec.obeliskHeight && spec.obeliskHeight > 0) {
    const oH = spec.obeliskHeight;
    const ox = -portW / 2 - 4.5;
    const oz = -D / 2 - 8;
    const obeliskBase = oH * 0.09;
    // Massive granite pedestal base:
    parts.push(box("granite", [ox, 0, oz], [obeliskBase * 1.8, 1.8, obeliskBase * 1.8]));
    // Tapering four-sided monolith shaft:
    parts.push(box("granite", [ox, 1.8, oz], [obeliskBase, oH - 1.8, obeliskBase]));
    // Gilded pyramidion summit reflecting the morning sun (Benben):
    parts.push(
      box("paintGold", [ox, oH, oz], [obeliskBase * 0.85, obeliskBase * 1.2, obeliskBase * 0.85]),
    );
  }

  /* ---- 5. Avenue of Sphinxes (Dromos) ---- */
  const sphinxPairs = spec.sphinxCount ?? 6;
  const dromosLen = spec.sphinxAvenueLength ?? 45;
  const avenueStart = -D / 2 - 7;
  const dromosW = portW + 4;

  for (let k = 0; k < sphinxPairs; k += 1) {
    const sz = avenueStart - (k * dromosLen) / sphinxPairs;
    for (const side of [-1, 1]) {
      const sx = side * (dromosW / 2);
      // High stone pedestal:
      parts.push(box("limestone", [sx, 0, sz], [1.4, 0.8, 2.8]));
      // Sphinx body resting in repose:
      parts.push(box("stone", [sx, 0.8, sz], [1.1, 0.9, 2.4]));
      // Ram / human head with royal nemes headdress:
      parts.push(cyl("stone", [sx, 1.7, sz - 0.7], 0.45, 0.4, 0.75));
    }
  }

  return parts;
}

export function egyptianPylonWalkStart(spec: EgyptianPylonSpec): WalkStart {
  const frontZ = -(spec.pylonDepth / 2) - 25;
  return {
    at: [0, frontZ],
    floor: 0,
    look: [0, spec.pylonHeight * 0.4, 0],
  };
}

/* ================================================================== *
 * 4. ANDEAN / PRE-INCA: Tiwanaku Megalithic Platform & Sun Gate
 * ================================================================== */

export type MegalithicPlatformSpec = {
  kind: "megalithic-platform";
  /** Platform width and length in metres. */
  platformWidth: number;
  platformLength: number;
  /** Total height of the terraced pyramid platform (Akapana). */
  platformHeight: number;
  /** Number of megalithic stone tiers (e.g. 3 to 7). */
  tiers: number;
  /** Dimensions of the central ceremonial Sun Gate (Puerta del Sol). */
  sunGateWidth: number;
  sunGateHeight: number;
  /** Standing anthropomorphic portrait stelae (Ponce / Fraile monoliths). */
  monolithHeight?: number;
  /** Number of vertical megalithic orthostats (standing pillars) lining the court. */
  orthostats?: number;
  /** Number of precision-cut andesite H-blocks (Pumapunku). */
  hBlocks?: number;
  palaceWidth?: number;
  sunTempleWidth?: number;
  ceremonialCourtWidth?: number;
};

export function megalithicPlatformParts(spec: MegalithicPlatformSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.platformWidth;
  const L = spec.platformLength;
  const H = spec.platformHeight;
  const N = spec.tiers;

  // High-altitude Andean Altiplano setting with golden ichu grass and dark andesite ridges:
  parts.push(
    ...setting(Math.max(W, L) + 25, 5917, {
      hills: 0.45,
      stone: 0.7,
      grass: 0.9,
      ground: "stoneDark",
    }),
  );

  /* ---- 1. Terraced Akapana Andesite Platform ---- */
  const tierH = H / N;
  const topW = W * 0.55;
  const topL = L * 0.55;

  for (let i = 0; i < N; i += 1) {
    const t = i / (N - 1 || 1);
    const tw = W - (W - topW) * t;
    const tl = L - (L - topL) * t;
    const y = i * tierH;
    // Massive dressed andesite stone terrace:
    parts.push(worn(box("stoneDark", [0, y, 0], [tw, tierH - 0.1, tl]), 0.08));
    // Dressed stone coping:
    parts.push(box("stone", [0, y + tierH - 0.1, 0], [tw + 0.3, 0.1, tl + 0.3]));
  }

  // Megalithic ceremonial stairway climbing the western axis:
  const stairW = 8;
  const stairFrontZ = -L / 2 - 1.5;
  const stairTopZ = -topL / 2;
  const stairRun = Math.abs(stairFrontZ - stairTopZ);
  const steps = 14;
  for (let s = 0; s < steps; s += 1) {
    const sy = (s * H) / steps;
    const sz = stairFrontZ + (s * stairRun) / steps;
    parts.push(box("stone", [0, 0, sz], [stairW, sy + H / steps + 0.05, stairRun / steps + 0.2]));
  }

  /* ---- 2. Sun Gate (Puerta del Sol) Monolith ---- */
  const gateW = spec.sunGateWidth;
  const gateH = spec.sunGateHeight;
  const gateThick = 0.65;
  const summitY = H;
  const gateZ = 0;

  // Single monolithic block of dark andesite:
  const openingW = gateW * 0.32;
  const openingH = gateH * 0.65;
  const jambW = (gateW - openingW) / 2;
  // Left and right monolithic jambs:
  for (const side of [-1, 1]) {
    parts.push(
      box("stoneDark", [side * (gateW / 2 - jambW / 2), summitY, gateZ], [jambW, gateH, gateThick]),
    );
  }
  // Monolithic frieze beam spanning the top:
  const lintelH = gateH - openingH;
  parts.push(box("stoneDark", [0, summitY + openingH, gateZ], [openingW, lintelH, gateThick]));
  // Carved sun god bas-relief (Staff God / Viracocha frieze):
  parts.push(
    box(
      "stone",
      [0, summitY + openingH + lintelH * 0.2, gateZ - gateThick / 2 - 0.03],
      [gateW * 0.9, lintelH * 0.6, 0.06],
    ),
  );
  // Sunken gate opening:
  parts.push(box("shadow", [0, summitY, gateZ], [openingW, openingH, gateThick * 0.5]));

  /* ---- 3. Ponce / Fraile Anthropomorphic Monoliths ---- */
  const monoH = spec.monolithHeight ?? 4.0;
  // Standing monolithic andesite statue of the high priest:
  parts.push(box("stone", [gateW * 0.9, summitY, gateZ - 2], [1.1, monoH, 0.9]));
  // Crown and ritual kero cup carved details:
  parts.push(
    box("stoneDark", [gateW * 0.9, summitY + monoH * 0.75, gateZ - 2], [1.15, monoH * 0.25, 0.95]),
  );

  /* ---- 4. Kalasasaya Standing Orthostats (Megalithic Pillars) ---- */
  const orthostats = spec.orthostats ?? 8;
  const courtW = topW * 0.85;
  const courtL = topL * 0.85;
  for (let k = 0; k < orthostats; k += 1) {
    const ox = -courtW / 2 + (k * courtW) / (orthostats - 1 || 1);
    for (const side of [-1, 1]) {
      const oz = side * (courtL / 2);
      // Tall standing orthostat pillar:
      parts.push(box("stoneDark", [ox, summitY, oz], [0.95, 2.8, 0.85]));
    }
  }

  /* ---- 5. Precision-Cut Pumapunku H-Blocks ---- */
  const hCount = spec.hBlocks ?? 0;
  if (hCount > 0) {
    const hZ = stairFrontZ - 5;
    for (let h = 0; h < hCount; h += 1) {
      const hx = -12 + h * 3.5;
      // Precision andesite H-Block geometry:
      const hw = 1.6;
      const hh = 1.4;
      const hd = 1.2;
      // Two vertical uprights and crossbar of the H:
      for (const side of [-1, 1]) {
        parts.push(box("stoneDark", [hx + side * 0.55, 0, hZ], [0.45, hh, hd]));
      }
      parts.push(box("stoneDark", [hx, 0.35, hZ], [0.75, hh * 0.5, hd * 0.8]));
      // Precision bronze cramp mortise grooves:
      parts.push(box("shadow", [hx, hh * 0.85, hZ], [0.35, 0.15, hd * 0.9]));
    }
  }

  return parts;
}

export function megalithicPlatformWalkStart(spec: MegalithicPlatformSpec): WalkStart {
  const frontZ = -(spec.platformLength / 2) - 15;
  return {
    at: [0, frontZ],
    floor: 0,
    look: [0, spec.platformHeight * 0.4, 0],
  };
}

/* ================================================================== *
 * 5. MESOPOTAMIA: Ziggurat, Glazed Brick Temple & Processional Way
 * ================================================================== */

export type ZigguratSpec = {
  kind: "ziggurat";
  /** Foundation base width and depth in metres. */
  baseWidth: number;
  baseDepth: number;
  /** Total height to the summit shrine, in metres. */
  totalHeight: number;
  /** Number of stepped terraced tiers (3 for Ur, 7 for Babylon). */
  tiers: number;
  /** Width of the monumental central ceremonial ramp/stairway. */
  stairWidth: number;
  /** Dimensions of the summit shrine (Nanna or Marduk temple). */
  shrineWidth: number;
  shrineDepth: number;
  shrineHeight: number;
  /** Glazed blue lapis lazuli bricks on the summit shrine (Babylon). */
  glazedBlue?: boolean;
  /** Triple converging stairways (classic Ur design: central + 2 flank ramps). */
  tripleStairs?: boolean;
  /** Ishtar processional gate towers at the foot. */
  processionalGate?: boolean;
  gateHeight?: number;
  gateWidth?: number;
  palaceWidth?: number;
};

export function zigguratParts(spec: ZigguratSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.baseWidth;
  const D = spec.baseDepth;
  const H = spec.totalHeight;
  const N = Math.max(2, spec.tiers);
  const stairW = Math.max(3, spec.stairWidth);

  // Arid Mesopotamian plain setting:
  parts.push(
    ...setting(Math.max(W, D) + 25, 4129, {
      hills: 0.15,
      stone: 0.3,
      grass: 0.2,
      ground: "ground",
    }),
  );

  const shrineH = Math.max(3, spec.shrineHeight);
  const pyramidH = Math.max(6, H - shrineH);
  const tierH = pyramidH / N;

  const topW = Math.max(spec.shrineWidth + 6, W * 0.35);
  const topD = Math.max(spec.shrineDepth + 6, D * 0.35);

  /* ---- 1. Stepped Mudbrick Tiers with Mesopotamian Buttresses ---- */
  for (let i = 0; i < N; i += 1) {
    const t = i / (N - 1 || 1);
    const tw = W - (W - topW) * t;
    const td = D - (D - topD) * t;
    const y = i * tierH;

    // Mass of burnt terracotta / sun-dried brick:
    parts.push(worn(box("terracotta", [0, y, 0], [tw, tierH - 0.1, td]), 0.08));
    // Projecting stone/baked coping:
    parts.push(box("stoneDark", [0, y + tierH - 0.1, 0], [tw + 0.3, 0.1, td + 0.3]));

    // Rhythmical recessed vertical pilasters / buttresses along all four sides:
    const buttressSpacing = 5.5;
    const numButtX = Math.max(2, Math.floor(tw / buttressSpacing));
    for (let bx = 0; bx <= numButtX; bx += 1) {
      const px = -tw / 2 + (bx * tw) / numButtX;
      for (const side of [-1, 1]) {
        parts.push(box("terracotta", [px, y, side * (td / 2 + 0.15)], [0.75, tierH - 0.1, 0.3]));
      }
    }
  }

  /* ---- 2. Monumental Stairways (Triple Converging or Axial Ramp) ---- */
  if (spec.tripleStairs) {
    // Ur-style triple converging flights meeting at a 1st-tier gateway:
    const tier1H = tierH;
    const rampRun = 16;
    const stairFrontZ = -D / 2 - rampRun;
    const stairTopZ = -D / 2 + (D - topW) * (1 / (N - 1 || 1)) * 0.3;
    const steps = 18;

    // Central perpendicular flight:
    for (let s = 0; s < steps; s += 1) {
      const sy = (s * tier1H) / steps;
      const sz = stairFrontZ + (s * Math.abs(stairFrontZ - stairTopZ)) / steps;
      // Each step a solid block down to the ground, so the flight is a ramp of brick, not treads in the air.
      parts.push(box("terracotta", [0, 0, sz], [stairW, sy + tier1H / steps + 0.05, 1.1]));
    }

    // Left and right diagonal flanking ramps:
    const sideW = W * 0.32;
    for (const side of [-1, 1]) {
      for (let s = 0; s < steps; s += 1) {
        const sy = (s * tier1H) / steps;
        const sx = side * (sideW * (1 - s / steps) + stairW * 0.6);
        const sz = -D / 2 - 2.5 + (s * 2.5) / steps;
        parts.push(box("terracotta", [sx, 0, sz], [1.8, sy + tier1H / steps + 0.05, 1.2]));
      }
    }

    // Domed / arched gatehouse pavilion on Tier 1 landing:
    parts.push(box("terracotta", [0, tier1H, -D / 2 + 1], [stairW + 2.5, 4.2, 4.0]));
    parts.push(box("shadow", [0, tier1H, -D / 2 - 0.8], [stairW * 0.6, 3.2, 1.2]));

    // Upper central stairway climbing from gatehouse to summit shrine:
    const upperSteps = 22;
    const upperH = pyramidH - tier1H;
    const upperRun = Math.abs(-D / 2 - -topD / 2);
    for (let s = 0; s < upperSteps; s += 1) {
      const sy = tier1H + (s * upperH) / upperSteps;
      const sz = -D / 2 + 3 + (s * upperRun) / upperSteps;
      parts.push(
        box(
          "terracotta",
          [0, tier1H, sz],
          [stairW * 0.8, sy - tier1H + upperH / upperSteps + 0.05, 1.1],
        ),
      );
    }
  } else {
    // Babylon-style monumental central processional ramp ascending all tiers:
    const rampRun = Math.max(22, D * 0.45);
    const stairFrontZ = -D / 2 - rampRun;
    const stairTopZ = -topD / 2;
    const steps = 32;
    const totalRun = Math.abs(stairFrontZ - stairTopZ);
    for (let s = 0; s < steps; s += 1) {
      const sy = (s * pyramidH) / steps;
      const sz = stairFrontZ + (s * totalRun) / steps;
      const rise = sy + pyramidH / steps + 0.05;
      parts.push(box("terracotta", [0, 0, sz], [stairW, rise, totalRun / steps + 0.25]));
      // The parapet either side follows the flight up, a metre above each step
      // (it was once one 50 m wall standing on end beside the stair).
      for (const side of [-1, 1]) {
        parts.push(
          box(
            "stoneDark",
            [side * (stairW / 2 + 0.4), 0, sz],
            [0.8, rise + 1, totalRun / steps + 0.25],
          ),
        );
      }
    }
  }

  /* ---- 3. Summit Shrine (Marduk / Nanna Temple) ---- */
  const sW = spec.shrineWidth;
  const sD = spec.shrineDepth;
  const summitY = pyramidH;
  const shrineMat = spec.glazedBlue ? "paintBlue" : "terracotta";

  // Massive shrine podium:
  parts.push(box("stoneDark", [0, summitY, 0], [sW + 1.2, 0.6, sD + 1.2]));

  // Temple walls in glazed lapis-lazuli blue or terracotta:
  parts.push(box(shrineMat, [0, summitY + 0.6, 0], [sW, shrineH - 1.2, sD]));

  // Golden or bronze battlements / crenellations along the roofline:
  const battlementMat = spec.glazedBlue ? "paintGold" : "stoneDark";
  parts.push(box(battlementMat, [0, summitY + shrineH - 0.6, 0], [sW + 0.4, 0.6, sD + 0.4]));

  // Arched portal into the inner sanctuary:
  parts.push(
    box("shadow", [0, summitY + 0.6, -sD / 2 - 0.05], [stairW * 0.55, shrineH * 0.55, 0.4]),
  );

  /* ---- 4. Ishtar Processional Gate (Babylon) ---- */
  if (spec.processionalGate) {
    // Out at the foot of the processional way, clear of the stair.
    const gateZ = -D / 2 - Math.max(22, D * 0.45) - 30;
    const gateW = 22;
    const gateH = 14;
    // Twin soaring gate towers in vibrant blue:
    for (const side of [-1, 1]) {
      parts.push(box("paintBlue", [side * 8, 0, gateZ], [6, gateH, 6]));
      // Gold crenellation cap:
      parts.push(box("paintGold", [side * 8, gateH, gateZ], [6.4, 0.8, 6.4]));
    }
    // Central arched passage span:
    parts.push(box("paintBlue", [0, gateH * 0.6, gateZ], [10, gateH * 0.4, 4]));
    parts.push(box("paintGold", [0, gateH, gateZ], [10.4, 0.8, 4.4]));
    parts.push(box("shadow", [0, 0, gateZ], [6, gateH * 0.6, 4.2]));
  }

  return parts;
}

export function zigguratWalkStart(spec: ZigguratSpec): WalkStart {
  const frontZ = -(spec.baseDepth / 2) - (spec.processionalGate ? 38 : 18);
  return {
    at: [0, frontZ],
    floor: 0,
    look: [0, spec.totalHeight * 0.42, 0],
  };
}

/* ================================================================== *
 * 6. PERSIA / ACHAEMENID: Persepolis Apadana & Tomb of Cyrus
 * ================================================================== */

export type PersianApadanaSpec = {
  kind: "persian-apadana";
  /** Elevated stone platform terrace width and depth in metres. */
  platformWidth: number;
  platformDepth: number;
  /** Platform terrace height above plain level. */
  platformHeight: number;
  /** Total height including columns and cedar roof beams. */
  totalHeight: number;
  /** Number of monumental fluted columns (typically 16 to 72). */
  columns: number;
  /** Height of the soaring fluted stone columns (e.g. 19m). */
  columnHeight: number;
  columnDiameter: number;
  /** Style: "apadana-hall" (Persepolis) or "cyrus-tomb" (Pasargadae). */
  style: "apadana-hall" | "cyrus-tomb";
  /** Gate of All Nations twin colossal bull guardians (Lamassu). */
  gateOfNations?: boolean;
  gateHeight?: number;
  palaceWidth?: number;
};

export function persianApadanaParts(spec: PersianApadanaSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.platformWidth;
  const D = spec.platformDepth;
  const platH = Math.max(1.5, spec.platformHeight);
  const totalH = Math.max(8, spec.totalHeight);

  // Dry Zagros mountain plateau setting:
  parts.push(
    ...setting(Math.max(W, D) + 25, 6219, {
      hills: 0.5,
      stone: 0.8,
      grass: 0.2,
      ground: "limestone",
    }),
  );

  if (spec.style === "cyrus-tomb") {
    /* ---- Pasargadae: Monumental 6-Tier Stepped Tomb of Cyrus the Great ---- */
    const N = 6;
    const plinthH = platH;
    const tierH = plinthH / N;
    const topW = W * 0.45;
    const topD = D * 0.45;

    // Six stepped limestone megalithic tiers:
    for (let i = 0; i < N; i += 1) {
      const t = i / (N - 1 || 1);
      const tw = W - (W - topW) * t;
      const td = D - (D - topD) * t;
      const y = i * tierH;
      parts.push(worn(box("limestone", [0, y, 0], [tw, tierH - 0.05, td]), 0.05));
      parts.push(box("stone", [0, y + tierH - 0.05, 0], [tw + 0.15, 0.05, td + 0.15]));
    }

    // Gabled stone tomb chamber atop the plinth:
    const chamberW = topW * 0.75;
    const chamberD = topD * 0.75;
    const chamberH = Math.max(3.5, totalH - plinthH - 1.5);
    const chamberY = plinthH;

    // Heavy ashlar stone walls:
    parts.push(box("limestone", [0, chamberY, 0], [chamberW, chamberH, chamberD]));

    // Low, narrow entrance doorway (Cyrus' burial cell entrance):
    parts.push(box("shadow", [0, chamberY, -chamberD / 2 - 0.05], [1.4, 2.0, 0.3]));

    // Pitched triangular stone gabled roof and pediment:
    const roofH = totalH - plinthH - chamberH;
    parts.push(
      prism("limestone", [0, chamberY + chamberH, 0], [chamberW + 0.6, roofH, chamberD + 0.6], 0),
    );

    // Peribolos perimeter column bases in the sanctuary garden:
    const peribolosW = W * 1.35;
    const peribolosD = D * 1.35;
    const cols = Math.min(16, spec.columns);
    for (let k = 0; k < cols; k += 1) {
      const cx = -peribolosW / 2 + (k * peribolosW) / (cols - 1 || 1);
      for (const side of [-1, 1]) {
        parts.push(cyl("limestone", [cx, 0, side * (peribolosD / 2)], 0.45, 0.45, 4.5));
      }
    }

    return parts;
  }

  /* ---- Persepolis: Apadana Grand Audience Hall & Column Forest ---- */

  // 1. High ashlar limestone terrace platform:
  parts.push(worn(box("limestone", [0, 0, 0], [W, platH, D]), 0.06));
  parts.push(box("stoneDark", [0, platH, 0], [W + 0.4, 0.12, D + 0.4]));

  // 2. Grand Double-Reverse Monumental Staircase on northern front:
  const stairW = 5.5;
  const stairRun = 12;
  const stairFrontZ = -D / 2 - stairRun;
  const stairSteps = 16;
  for (const side of [-1, 1]) {
    for (let s = 0; s < stairSteps; s += 1) {
      const sy = (s * platH) / stairSteps;
      const sx = side * (stairW * 1.2 + (s * (W * 0.22)) / stairSteps);
      const sz = -D / 2 - 1 - (s * stairRun * 0.8) / stairSteps;
      parts.push(box("limestone", [sx, 0, sz], [stairW, sy + platH / stairSteps + 0.04, 1.2]));
    }
  }
  // Carved parapet walls depicting imperial tribute bearers, standing on the
  // ground before the terrace and as high as it (they once floated half its
  // height in the air):
  for (const side of [-1, 1]) {
    parts.push(
      box(
        "stoneDark",
        [side * (W * 0.3), 0, -D / 2 - stairRun * 0.5],
        [0.6, platH + 1.2, stairRun],
      ),
    );
  }

  // 3. Grid of Soaring Fluted Columns with Double-Bull Protome Capitals:
  const colCount = Math.max(16, spec.columns);
  const gridN = Math.round(Math.sqrt(colCount));
  const colH = Math.max(6, spec.columnHeight);
  const colR = Math.max(0.4, spec.columnDiameter / 2);
  const hallSpanX = W * 0.72;
  const hallSpanZ = D * 0.72;

  for (let ix = 0; ix < gridN; ix += 1) {
    const cx = -hallSpanX / 2 + (ix * hallSpanX) / (gridN - 1 || 1);
    for (let iz = 0; iz < gridN; iz += 1) {
      const cz = -hallSpanZ / 2 + (iz * hallSpanZ) / (gridN - 1 || 1);

      // Bell-shaped ornate base:
      parts.push(box("stoneDark", [cx, platH, cz], [colR * 2.6, 0.4, colR * 2.6]));
      // Slender soaring column shaft:
      parts.push(cyl("limestone", [cx, platH + 0.4, cz], colR, colR, colH - 1.8));
      // Double-bull protome capital (two kneeling bulls back-to-back):
      parts.push(box("stoneDark", [cx, platH + colH - 1.4, cz], [colR * 3.2, 1.2, colR * 2.4]));
    }
  }

  // 4. Heavy Cedar Roof Beams (Lebanese Cedar) & Dentiled Entablature:
  const roofY = platH + colH;
  for (let ix = 0; ix < gridN; ix += 1) {
    const cx = -hallSpanX / 2 + (ix * hallSpanX) / (gridN - 1 || 1);
    // Longitudinal cedar beams:
    parts.push(box("timber", [cx, roofY, 0], [0.85, 0.85, hallSpanZ + 2]));
  }
  // Coffer ceiling and parapet:
  parts.push(box("stone", [0, roofY + 0.85, 0], [hallSpanX + 3.5, 0.4, hallSpanZ + 3.5]));

  // 5. Gate of All Nations (Xerxes' Gateway) with Twin Colossal Bull Protectors:
  if (spec.gateOfNations) {
    const gateZ = -D / 2 - 28;
    const gateSize = 16;
    const gateWallH = 12;

    // Square gateway pavilion:
    // Two masses either side of a passage 5.5 m wide, and the lintel over it:
    // a real way through, not a dark panel painted on a solid cube.
    const passW = 5.5;
    const passH = 9.5;
    const pierW = (gateSize - passW) / 2;
    for (const side of [-1, 1]) {
      parts.push(
        box("limestone", [side * (passW / 2 + pierW / 2), 0, gateZ], [pierW, gateWallH, gateSize]),
      );
    }
    parts.push(box("limestone", [0, passH, gateZ], [passW, gateWallH - passH, gateSize]));

    // Twin Colossal Winged Bulls (Lamassu) flanking the entrance portals:
    for (const side of [-1, 1]) {
      const lx = side * 3.8;
      // Front portal guardians:
      parts.push(box("stoneDark", [lx, 0, gateZ - gateSize / 2 - 0.5], [1.6, 6.5, 4.0]));
      // Horned crown and wings:
      parts.push(box("paintGold", [lx, 6.5, gateZ - gateSize / 2 - 0.5], [1.7, 0.8, 2.5]));
      // Rear portal guardians:
      parts.push(box("stoneDark", [lx, 0, gateZ + gateSize / 2 + 0.5], [1.6, 6.5, 4.0]));
    }
  }

  return parts;
}

export function persianApadanaWalkStart(spec: PersianApadanaSpec): WalkStart {
  const frontZ = -(spec.platformDepth / 2) - (spec.gateOfNations ? 35 : 18);
  return {
    at: [0, frontZ],
    floor: 0,
    look: [0, spec.platformHeight + spec.columnHeight * 0.4, 0],
  };
}

/* ================================================================== *
 * 7. KHMER / CAMBODIA: Angkor Wat Quincunx Towers & Bayon Face Towers
 * ================================================================== */

export type KhmerTempleSpec = {
  kind: "khmer-temple";
  /** Base terrace width and depth in metres. */
  baseWidth: number;
  baseDepth: number;
  /** Total height of the central lotus-bud prasat tower. */
  totalHeight: number;
  /** Number of stepped terraced tiers (typically 3 concentric enclosures). */
  tiers: number;
  /** Style: "quincunx-prasat" (Angkor Wat 5 towers) or "face-towers" (Bayon). */
  style: "quincunx-prasat" | "face-towers";
  /** Perimeter galleried cloister corridors with sandstone balusters. */
  galleries: boolean;
  /** Ceremonial causeway extending across the sacred moat. */
  causewayLength: number;
  topWidth?: number;
  galleryWidth?: number;
  gateHeight?: number;
};

export function khmerTempleParts(spec: KhmerTempleSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.baseWidth;
  const D = spec.baseDepth;
  const H = Math.max(12, spec.totalHeight);
  const N = Math.max(2, spec.tiers);

  // Tropical jungle setting with sandstone platforms and water:
  parts.push(
    ...setting(Math.max(W, D) + 30, 7129, {
      hills: 0.25,
      stone: 0.7,
      grass: 1.8,
      ground: "granite",
    }),
  );

  // Sacred Water Moat in front of the temple complex:
  const moatW = W + 40;
  const moatL = 24;
  const moatZ = -D / 2 - spec.causewayLength / 2 - 4;
  parts.push(box("water", [0, -0.6, moatZ], [moatW, 0.6, moatL]));

  // Monumental Sandstone Causeway with Naga Serpent Balustrades:
  const bridgeW = 8.4;
  parts.push(box("granite", [0, 0, moatZ], [bridgeW, 0.8, moatL + 6]));
  // Multi-headed Naga serpent balustrades on left and right:
  for (const side of [-1, 1]) {
    parts.push(box("stoneDark", [side * 3.8, 0.81, moatZ], [0.5, 0.9, moatL + 6]));
    // Rearing 7-headed Naga hood at the causeway head:
    parts.push(box("stoneDark", [side * 3.8, 0.81, moatZ - moatL / 2 - 2], [0.8, 2.5, 0.8]));
  }

  /* ---- 1. Stepped Concentric Sandstone & Laterite Enclosures ---- */
  const terraceH = (H * 0.45) / N;
  const topW = W * 0.4;
  const topD = D * 0.4;

  for (let i = 0; i < N; i += 1) {
    const t = i / (N - 1 || 1);
    const tw = W - (W - topW) * t;
    const td = D - (D - topD) * t;
    const y = i * terraceH;

    // Massive laterite foundation and carved sandstone terrace:
    parts.push(worn(box("granite", [0, y, 0], [tw, terraceH - 0.1, td]), 0.08));
    parts.push(box("stoneDark", [0, y + terraceH - 0.1, 0], [tw + 0.3, 0.1, td + 0.3]));

    // Perimeter Galleried Cloister Corridors (Bas-relief galleries):
    if (spec.galleries && i === 0) {
      const galW = tw * 0.96;
      const galD = td * 0.96;
      const galH = 4.2;
      // Continuous outer gallery roofs:
      for (const side of [-1, 1]) {
        parts.push(box("stoneDark", [side * (galW / 2), y + terraceH, 0], [2.4, 0.5, galD]));
        parts.push(box("stoneDark", [0, y + terraceH, side * (galD / 2)], [galW, 0.5, 2.4]));
      }
    }
  }

  /* ---- 2. Soaring Central & Corner Prasat Towers ---- */
  const summitY = terraceH * N;
  const towerTotalH = H - summitY;

  if (spec.style === "quincunx-prasat") {
    // Angkor Wat 5 Quincunx Lotus-Bud Towers (1 central + 4 corners):
    const positions: [number, number, number, boolean][] = [
      [0, 0, towerTotalH, true], // Central colossal tower (Meru peak)
      [-topW * 0.32, -topD * 0.32, towerTotalH * 0.72, false],
      [topW * 0.32, -topD * 0.32, towerTotalH * 0.72, false],
      [-topW * 0.32, topD * 0.32, towerTotalH * 0.72, false],
      [topW * 0.32, topD * 0.32, towerTotalH * 0.72, false],
    ];

    for (const [tx, tz, th, isCenter] of positions) {
      const baseR = isCenter ? 6.5 : 4.5;
      const stages = 6;
      const stageH = th / stages;

      for (let s = 0; s < stages; s += 1) {
        const factor = 1 - (s / stages) * 0.65;
        const sy = summitY + s * stageH;
        // Receding tiered lotus-petal stage:
        parts.push(
          box("stoneDark", [tx, sy, tz], [baseR * factor * 2, stageH * 0.88, baseR * factor * 2]),
        );
        // Projecting lotus-petal antefix ridge:
        parts.push(
          box(
            "granite",
            [tx, sy + stageH * 0.88, tz],
            [baseR * factor * 2.15, stageH * 0.12, baseR * factor * 2.15],
          ),
        );
      }

      // Pointed lotus conical spire and gilded finial:
      const spireY = summitY + th;
      parts.push(cyl("stoneDark", [tx, spireY, tz], 1.2, 0.4, 3.5));
      parts.push(cyl("paintGold", [tx, spireY + 3.5, tz], 0.4, 0.05, 1.8));
    }
  } else {
    // Bayon Style: Multi-Face Towers with Smiling Bodhisattva Avalokiteshvara:
    const facePositions: [number, number, number][] = [
      [0, 0, towerTotalH],
      [-topW * 0.28, 0, towerTotalH * 0.75],
      [topW * 0.28, 0, towerTotalH * 0.75],
      [0, -topD * 0.28, towerTotalH * 0.75],
      [0, topD * 0.28, towerTotalH * 0.75],
      [-topW * 0.25, -topD * 0.25, towerTotalH * 0.65],
      [topW * 0.25, -topD * 0.25, towerTotalH * 0.65],
    ];

    for (const [tx, tz, th] of facePositions) {
      const towerW = 6.0;
      // Lower tower shaft:
      parts.push(box("stoneDark", [tx, summitY, tz], [towerW, th * 0.45, towerW]));

      // Upper stage: Four giant smiling stone faces looking toward the four cardinal directions:
      const faceY = summitY + th * 0.45;
      const faceH = th * 0.45;
      parts.push(box("stoneDark", [tx, faceY, tz], [towerW * 0.95, faceH, towerW * 0.95]));

      // Smiling lips and serene closed eyelids carved relief bands:
      for (const side of [-1, 1]) {
        // North / South faces:
        parts.push(
          box(
            "granite",
            [tx, faceY + faceH * 0.35, tz + side * (towerW * 0.48)],
            [towerW * 0.55, 0.4, 0.15],
          ),
        );
        // East / West faces:
        parts.push(
          box(
            "granite",
            [tx + side * (towerW * 0.48), faceY + faceH * 0.35, tz],
            [0.15, 0.4, towerW * 0.55],
          ),
        );
      }

      // Lotus crown finial:
      parts.push(cyl("stoneDark", [tx, faceY + faceH, tz], 1.4, 0.5, th * 0.1));
    }
  }

  return parts;
}

export function khmerTempleWalkStart(spec: KhmerTempleSpec): WalkStart {
  const frontZ = -(spec.baseDepth / 2) - spec.causewayLength - 6;
  return {
    at: [0, frontZ],
    floor: 0,
    look: [0, spec.totalHeight * 0.4, 0],
  };
}

/* ================================================================== *
 * 8. INDIA & INDUS: Hampi Gopuram & Mohenjo-daro Great Bath
 * ================================================================== */

export type IndicMonumentSpec = {
  kind: "indic-monument";
  /** Monument type: "gopuram" (Hampi) or "great-bath" (Mohenjo-daro). */
  monumentType: "gopuram" | "great-bath";
  baseWidth: number;
  baseDepth: number;
  totalHeight: number;
  baseHeight?: number;
  /** Number of stepped tiers / storeys (for gopuram). */
  storeys?: number;
  /** Golden kalasa pot finials crowning the shikhara. */
  kalasaCount?: number;
  /** Stone Chariot (Garuda shrine) in the temple courtyard. */
  stoneChariot?: boolean;
  /** Dimensions of the water basin (for Mohenjo-daro). */
  bathLength?: number;
  bathWidth?: number;
  bathDepth?: number;
  palaceWidth?: number;
  chariotWidth?: number;
};

export function indicMonumentParts(spec: IndicMonumentSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.baseWidth;
  const D = spec.baseDepth;
  const H = Math.max(8, spec.totalHeight);

  if (spec.monumentType === "great-bath") {
    /* ---- Mohenjo-daro: Indus Valley Great Bath & Fired Brick Citadel ---- */
    parts.push(
      ...setting(Math.max(W, D) + 25, 8319, {
        hills: 0.15,
        stone: 0.3,
        grass: 0.4,
        ground: "ground",
      }),
    );

    const bL = spec.bathLength ?? 12;
    const bW = spec.bathWidth ?? 7;
    const platH = 0.6;

    // Raised brick-paved courtyard platform:
    parts.push(worn(box("terracotta", [0, 0, 0], [W, platH, D]), 0.08));

    // Sunken water basin lined with bitumen waterproof asphalt:
    parts.push(box("shadow", [0, -0.6, 0], [bL + 1.2, 0.8, bW + 1.2]));
    // Open water basin:
    parts.push(box("water", [0, 0.1, 0], [bL, 0.3, bW]));

    // Descending broad brick steps on northern and southern ends:
    const steps = 7;
    for (const side of [-1, 1]) {
      for (let s = 0; s < steps; s += 1) {
        const sy = platH - (s * 0.7) / steps;
        const sz = side * (bW / 2 - (s * (bW * 0.35)) / steps);
        parts.push(box("terracotta", [0, sy, sz], [bL * 0.5, 0.7 / steps + 0.05, 0.6]));
      }
    }

    // Colonnaded cloister rooms and dressing alcoves around the bath:
    const cloisterW = W * 0.85;
    const cloisterD = D * 0.85;
    const pierCount = 8;
    for (let k = 0; k < pierCount; k += 1) {
      const px = -cloisterW / 2 + (k * cloisterW) / (pierCount - 1 || 1);
      for (const side of [-1, 1]) {
        parts.push(box("terracotta", [px, platH, side * (cloisterD / 2)], [1.1, 3.2, 1.1]));
      }
    }

    // Fired-brick Granary Platform & Citadel Stupa Mound in background:
    parts.push(box("terracotta", [W * 0.32, platH, D * 0.3], [16, 5.5, 12]));
    parts.push(cyl("terracotta", [W * 0.32, platH + 5.5, D * 0.3], 3.5, 3.5, 3.0));

    return parts;
  }

  /* ---- Hampi: Vijayanagara Virupaksha Monumental Gopuram Tower ---- */
  parts.push(
    ...setting(Math.max(W, D) + 25, 9119, {
      hills: 0.6,
      stone: 0.8,
      grass: 0.5,
      ground: "granite",
    }),
  );

  // 1. Massive Granite Gateway Base with Soaring Corbelled Portal:
  const baseH = Math.min(10, H * 0.22);
  parts.push(worn(box("stoneDark", [0, 0, 0], [W, baseH, D]), 0.06));

  // Central entrance passage (arched corbelled portal):
  const portalW = Math.max(5, W * 0.22);
  parts.push(box("shadow", [0, 0, 0], [portalW, baseH * 0.85, D + 0.2]));

  // 2. Multi-Storey Stepped Pyramidal Gopuram Tower:
  const storeys = Math.max(5, spec.storeys ?? 9);
  const towerH = H - baseH - 4.5;
  const storeyH = towerH / storeys;
  const topW = W * 0.38;
  const topD = D * 0.42;

  for (let s = 0; s < storeys; s += 1) {
    const t = s / (storeys - 1 || 1);
    const sw = W - (W - topW) * t;
    const sd = D - (D - topD) * t;
    const sy = baseH + s * storeyH;

    // Brick and stucco tier adorned with miniature shrines:
    parts.push(box("terracotta", [0, sy, 0], [sw, storeyH - 0.15, sd]));
    // Projecting cornice eaves:
    parts.push(box("stone", [0, sy + storeyH - 0.15, 0], [sw + 0.4, 0.15, sd + 0.4]));

    // Sculptural decorative niches:
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "stoneDark",
          [0, sy + storeyH * 0.25, side * (sd / 2 + 0.1)],
          [sw * 0.4, storeyH * 0.5, 0.2],
        ),
      );
    }
  }

  // 3. Barrel-Vaulted Shikhara Crown & Golden Kalasa Finials:
  const shikharaY = baseH + towerH;
  const shikharaH = 4.5;
  // Vaulted stone crown:
  parts.push(box("terracotta", [0, shikharaY, 0], [topW * 1.05, shikharaH, topD * 0.95]));

  // Row of Gleaming Golden Kalasa Pot Finials:
  const kalasas = Math.max(3, spec.kalasaCount ?? 7);
  for (let k = 0; k < kalasas; k += 1) {
    const kx = -topW * 0.35 + (k * (topW * 0.7)) / (kalasas - 1 || 1);
    parts.push(cyl("paintGold", [kx, shikharaY + shikharaH, 0], 0.35, 0.05, 1.4));
  }

  // 4. Vittala Stone Chariot (Garuda Shrine in Courtyard):
  if (spec.stoneChariot) {
    const chZ = -D / 2 - 14;
    // Chariot plinth:
    parts.push(box("granite", [0, 0, chZ], [4.5, 0.8, 5.5]));
    // 4 Monolithic Stone Wheels with floral spokes:
    for (const wx of [-2.4, 2.4]) {
      for (const wz of [-1.8, 1.8]) {
        parts.push(cyl("stoneDark", [wx, 0.9, chZ + wz], 0.9, 0.9, 0.3, 16, { rotX: Math.PI / 2 }));
      }
    }
    // Miniature Dravidian shrine body and vaulted shikhara:
    parts.push(box("stoneDark", [0, 0.8, chZ], [3.2, 2.8, 3.8]));
    parts.push(box("granite", [0, 3.6, chZ], [2.8, 1.2, 3.4]));
    // Twin sculpted stone elephants guarding the chariot ramp:
    for (const side of [-1, 1]) {
      parts.push(box("granite", [side * 1.2, 0, chZ - 3.2], [0.75, 1.4, 1.2]));
    }
  }

  return parts;
}

export function indicMonumentWalkStart(spec: IndicMonumentSpec): WalkStart {
  const frontZ = -(spec.baseDepth / 2) - 15;
  return {
    at: [0, frontZ],
    floor: 0,
    look: [0, spec.totalHeight * 0.4, 0],
  };
}

/* ================================================================== *
 * 9. EGYPT: Hypostyle Hall (Karnak, Luxor)
 * ================================================================== */

/**
 * A hall of columns under a stone roof, as the Egyptians built it behind a
 * pylon: a raised central nave of tall open-papyrus columns lit by a
 * clerestory of stone grilles, and to either side a forest of shorter
 * closed-bud columns under a lower roof, the whole shut in by blank walls.
 * Karnak's Great Hypostyle Hall (134 columns, 103 m by 52 m, the central 12
 * columns some 21 m high) is the type; Luxor's court of Amenhotep III is the
 * same idea with its roof gone. Before this kind existed both were drawn as
 * a Greek Ionic temple.
 */
export type EgyptianHypostyleSpec = {
  kind: "egyptian-hypostyle";
  /** Cited: outer width (across the axis) and depth (along it), metres. */
  width: number;
  depth: number;
  /** Cited: all the columns of the hall. */
  totalColumns: number;
  /** Cited: the height of the nave's open-papyrus columns. */
  naveColumnHeight: number;
  /** Modelled. */
  sideColumnHeight: number;
  naveColumnDiameter: number;
  sideColumnDiameter: number;
  /** The roof left off (Luxor's court stands open to the sky). */
  open?: boolean;
};

export function egyptianHypostyleParts(spec: EgyptianHypostyleSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.width;
  const D = spec.depth;
  const navH = spec.naveColumnHeight;
  const sideH = spec.sideColumnHeight;
  const wallT = 2.4;

  parts.push(
    ...setting(Math.max(W, D) + 30, 1427, {
      hills: 0.25,
      stone: 0.5,
      grass: 0.2,
      ground: "limestone",
    }),
  );

  // Floor of the hall, a step up from the court.
  parts.push(box("stone", [0, 0, 0], [W, 0.6, D]));
  const floor = 0.6;

  // The blank enclosing walls: back and both sides, the front left open to
  // the pylon's gateway, with a doorway in the back wall on the axis.
  const wallH = (spec.open ? sideH * 0.75 : sideH + 2.4) + floor;
  for (const side of [-1, 1]) {
    parts.push(worn(box("limestone", [side * (W / 2 - wallT / 2), 0, 0], [wallT, wallH, D]), 0.06));
    // Painted register of offering scenes along the inner face.
    parts.push(
      box("paintBlue", [side * (W / 2 - wallT - 0.02), wallH * 0.55, 0], [0.04, 0.7, D - 6]),
    );
    parts.push(
      box("paintRed", [side * (W / 2 - wallT - 0.02), wallH * 0.42, 0], [0.04, 0.5, D - 6]),
    );
  }
  const backDoor = 8;
  for (const side of [-1, 1]) {
    const w = (W - backDoor) / 2;
    parts.push(
      worn(
        box("limestone", [side * (backDoor / 2 + w / 2), 0, D / 2 - wallT / 2], [w, wallH, wallT]),
        0.06,
      ),
    );
  }
  const doorH = Math.min(10, wallH - 1.5);
  parts.push(box("limestone", [0, doorH, D / 2 - wallT / 2], [backDoor, wallH - doorH, wallT]));
  parts.push(box("shadow", [0, floor, D / 2 - wallT - 0.02], [backDoor, doorH - floor, 0.04]));

  // The column grid. Two rows of nave columns on the axis; the rest of the
  // count is shared between the side halls, in rows along the axis.
  const naveRows = 2;
  const sideCount = spec.totalColumns;
  const naveSpacingX = Math.max(spec.naveColumnDiameter * 2.6, 7);
  const sideSpacing = Math.max(spec.sideColumnDiameter * 2.1, 4.2);
  const naveHalf = naveSpacingX / 2 + spec.naveColumnDiameter;
  const sideZone = W / 2 - wallT - 1.5 - (naveHalf + 2.5);
  const colsPerRowSide = Math.max(1, Math.floor(sideZone / sideSpacing) + 1);
  // Rows along the axis, chosen so the total comes out at the cited count.
  // nave: naveRows * rows ; sides: 2 * colsPerRowSide * rows.
  const perRow = naveRows + 2 * colsPerRowSide;
  const rows = Math.max(2, Math.round(sideCount / perRow));
  const rowSpacing = (D - wallT * 2 - 6) / Math.max(1, rows - 1);
  let placed = 0;
  const z0 = -D / 2 + wallT + 3;
  const column = (x: number, z: number, h: number, dia: number, open: boolean) => {
    if (placed >= spec.totalColumns) return;
    placed += 1;
    const r = dia / 2;
    parts.push(box("stone", [x, floor, z], [dia * 1.25, 0.6, dia * 1.25]));
    // Shaft, swelling slightly at the foot as papyrus stems do.
    parts.push(
      cyl("limestone", [x, floor + 0.6, z], r * 1.06, r * 0.92, h - (open ? 3.2 : 2.4) - 0.6, 16),
    );
    // Painted bands near the top of the shaft.
    parts.push(
      cyl("paintBlue", [x, floor + h - (open ? 4.2 : 3.4), z], r * 0.95, r * 0.95, 0.5, 16),
    );
    parts.push(
      cyl("paintRed", [x, floor + h - (open ? 3.7 : 2.9), z], r * 0.94, r * 0.94, 0.4, 16),
    );
    if (open) {
      // Open papyrus umbel, flaring out wide under the abacus.
      parts.push(cyl("paintGold", [x, floor + h - 3.2, z], r * 0.92, r * 1.75, 2.4, 16));
    } else {
      // Closed bud: swelling and closing again.
      parts.push(cyl("limestone", [x, floor + h - 2.4, z], r * 0.92, r * 1.18, 1.0, 16));
      parts.push(cyl("limestone", [x, floor + h - 1.4, z], r * 1.18, r * 0.75, 0.8, 16));
    }
    // Square abacus block carrying the architraves.
    parts.push(box("stone", [x, floor + h - 0.6, z], [dia * 1.1, 0.6, dia * 1.1]));
  };
  for (let k = 0; k < rows; k += 1) {
    const z = z0 + k * rowSpacing;
    for (const side of [-1, 1])
      column(side * (naveSpacingX / 2), z, navH, spec.naveColumnDiameter, true);
    for (let c = 0; c < colsPerRowSide; c += 1) {
      const x = naveHalf + 2.5 + c * sideSpacing;
      for (const side of [-1, 1]) column(side * x, z, sideH, spec.sideColumnDiameter, false);
    }
  }

  // Architraves along each row, and the roof.
  const zA = z0;
  const zB = z0 + (rows - 1) * rowSpacing;
  const runD = zB - zA + spec.sideColumnDiameter * 1.1;
  for (const side of [-1, 1]) {
    parts.push(
      box(
        "stone",
        [side * (naveSpacingX / 2), floor + navH, (zA + zB) / 2],
        [spec.naveColumnDiameter * 1.1, 1.2, runD],
      ),
    );
  }
  if (!spec.open) {
    // Side roofs over the closed-bud halls, at their own height.
    const sideInner = naveSpacingX / 2 + spec.naveColumnDiameter * 0.55;
    const sideOuter = W / 2 - wallT;
    const sideW = sideOuter - sideInner;
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "stone",
          [side * (sideInner + sideW / 2), floor + sideH, (zA + zB) / 2],
          [sideW, 1.0, D - wallT * 2],
        ),
      );
    }
    // The clerestory: stone grilles standing on the side roofs up to the
    // nave roof, letting slots of light down into the dark hall.
    const clerH = navH - sideH;
    for (const side of [-1, 1]) {
      const x = side * (naveSpacingX / 2 + spec.naveColumnDiameter * 0.55);
      parts.push(box("stone", [x, floor + sideH + 1, (zA + zB) / 2], [0.8, clerH - 1, runD]));
      const slots = Math.max(3, Math.floor(runD / 4));
      for (let s = 0; s < slots; s += 1) {
        const z = zA + ((s + 0.5) * runD) / slots - spec.sideColumnDiameter * 0.55;
        parts.push(
          box(
            "shadow",
            [x + side * 0.42, floor + sideH + 1.8, z],
            [0.04, Math.max(1, clerH - 3), 1.6],
          ),
        );
      }
    }
    // Nave roof slabs, painted blue with gold stars on the underside.
    parts.push(
      box(
        "stone",
        [0, floor + navH + 1.2, (zA + zB) / 2],
        [naveSpacingX + spec.naveColumnDiameter * 2.2, 1.0, D - wallT * 2],
      ),
    );
    parts.push(
      box("paintBlue", [0, floor + navH + 1.15, (zA + zB) / 2], [naveSpacingX - 0.5, 0.05, runD]),
    );
  }

  return parts;
}

export function egyptianHypostyleWalkStart(spec: EgyptianHypostyleSpec): WalkStart {
  return {
    at: [0, -spec.depth / 2 + 4],
    floor: 0.6,
    look: [0, spec.naveColumnHeight * 0.6, spec.depth / 2],
  };
}
