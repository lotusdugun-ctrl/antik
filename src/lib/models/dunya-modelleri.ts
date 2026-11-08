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
};

export function steppedPyramidParts(spec: SteppedPyramidSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.baseWidth;
  const D = spec.baseDepth;
  const H = spec.totalHeight;
  const N = spec.tiers;
  const stairW = spec.stairWidth;

  // The setting: tropical limestone plaza and lush greenery.
  parts.push(...setting(Math.max(W, D) + 25, 3819, { hills: 0.3, stone: 0.5, grass: 1.5, ground: "limestone" }));

  // Summit temple and roof comb height allocation:
  const combH = spec.roofCombHeight;
  const templeH = Math.min(6.5, (H - combH) * 0.28);
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

  /* ---- 2. Steep Central Axial Stairway ---- */
  const stepsCount = Math.max(12, Math.floor(pyramidH / 0.35));
  const stepRise = pyramidH / stepsCount;
  const stairFrontZ = -D / 2 - 2.8;
  const stairTopZ = -topD / 2 - 0.8;
  const stairRun = Math.abs(stairFrontZ - stairTopZ);
  const stepTread = stairRun / stepsCount;

  for (let s = 0; s < stepsCount; s += 1) {
    const sy = s * stepRise;
    const sz = stairFrontZ + s * stepTread;
    parts.push(box("stone", [0, sy, sz + stepTread / 2], [stairW, stepRise, stepTread + 0.25]));
  }

  // Sloping stairway balustrades (parapets) flanking the steps:
  for (const side of [-1, 1]) {
    const bx = side * (stairW / 2 + 0.4);
    parts.push(
      box("limestone", [bx, pyramidH * 0.5, (stairFrontZ + stairTopZ) / 2], [0.8, pyramidH, stairRun + 0.8], 0),
    );
  }

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
      box("limestone", [side * (tW / 2 - wallThick / 2), templeY + 0.5, 0], [wallThick, wallH, tD - wallThick * 2]),
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
    box("stone", [0, templeY + 0.5 + wallH * 0.65, -tD / 2 + wallThick / 2], [doorW + 0.6, wallH * 0.35, wallThick + 0.2]),
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
  const stelaeCount = spec.stelaeCount ?? 4;
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
  parts.push(...setting(Math.max(W, D) + 30, 7129, { hills: 0.2, stone: 0.6, grass: 0.8, ground: "limestone" }));

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
  parts.push(box("marbleWorn", [0, 0, -D / 2 - 2 - stairRun / 2], [middleW * 0.4, P * 0.5, stairRun], 0));
  // Left and right pedestrian stair runs:
  for (const side of [-1, 1]) {
    const sx = side * (middleW * 0.8);
    for (let s = 0; s < 10; s += 1) {
      const sy = (s * P) / 10;
      const sz = -D / 2 - 2 - stairRun + (s * stairRun) / 10;
      parts.push(box("marble", [sx, sy, sz], [middleW * 0.5, P / 10 + 0.02, stairRun / 10 + 0.1]));
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
    const inW = curW - stepX * 1.6;
    const inD = curD - stepZ * 1.6;
    parts.push(box("paintRed", [0, currentY + 0.25, 0], [inW, curColH, inD]));
    // Gilded door portals on front facade:
    parts.push(box("paintGold", [0, currentY + 0.25, -curD / 2 + 0.05], [inW * 0.7, curColH * 0.75, 0.15]));

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
    const roofH = isPagoda ? 2.2 : Math.max(2.2, lvl === storeys - 1 ? (spec.totalHeight - roofBaseY) : 2.5);

    // Curved eave tier in dark glazed roof tile material:
    parts.push(worn(box("stoneDark", [0, roofBaseY, 0], [eaveW, roofH * 0.65, eaveD]), 0.15));
    // Swept-up corner eaves (flying eaves):
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(
          box("paintGold", [sx * (eaveW / 2 - 0.5), roofBaseY + roofH * 0.45, sz * (eaveD / 2 - 0.5)], [1.4, 0.4, 1.4]),
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
      parts.push(cyl("paintGold", [0, ridgeY + 1.2 + r * 0.65, 0], 0.9 - r * 0.08, 0.9 - r * 0.08, 0.2));
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
  parts.push(...setting(W + 35, 1341, { hills: 0.25, stone: 0.6, grass: 0.3, ground: "limestone" }));

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
    parts.push(box("stone", [cx, seatH, cz + throneD * 0.1], [throneW * 0.85, torsoH, throneD * 0.5]));
    // Pharaoh head with royal beard & crown:
    const headH = colossusH * 0.25;
    parts.push(cyl("stone", [cx, seatH + torsoH, cz + throneD * 0.1], throneW * 0.32, throneW * 0.28, headH));
    // Double Crown of Upper & Lower Egypt (Pschent):
    parts.push(cyl("paintGold", [cx, seatH + torsoH + headH, cz + throneD * 0.1], throneW * 0.18, 0.05, headH * 0.8));
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
    parts.push(box("paintGold", [ox, oH, oz], [obeliskBase * 0.85, obeliskBase * 1.2, obeliskBase * 0.85]));
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
};

export function megalithicPlatformParts(spec: MegalithicPlatformSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.platformWidth;
  const L = spec.platformLength;
  const H = spec.platformHeight;
  const N = spec.tiers;

  // High-altitude Andean Altiplano setting with golden ichu grass and dark andesite ridges:
  parts.push(...setting(Math.max(W, L) + 25, 5917, { hills: 0.45, stone: 0.7, grass: 0.9, ground: "stoneDark" }));

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
    parts.push(box("stone", [0, sy, sz], [stairW, H / steps + 0.05, stairRun / steps + 0.2]));
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
  parts.push(box("stone", [0, summitY + openingH + lintelH * 0.2, gateZ - gateThick / 2 - 0.03], [gateW * 0.9, lintelH * 0.6, 0.06]));
  // Sunken gate opening:
  parts.push(box("shadow", [0, summitY, gateZ], [openingW, openingH, gateThick * 0.5]));

  /* ---- 3. Ponce / Fraile Anthropomorphic Monoliths ---- */
  const monoH = spec.monolithHeight ?? 4.0;
  // Standing monolithic andesite statue of the high priest:
  parts.push(box("stone", [gateW * 0.9, summitY, gateZ - 2], [1.1, monoH, 0.9]));
  // Crown and ritual kero cup carved details:
  parts.push(box("stoneDark", [gateW * 0.9, summitY + monoH * 0.75, gateZ - 2], [1.15, monoH * 0.25, 0.95]));

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
