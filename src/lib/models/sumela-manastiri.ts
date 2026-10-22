import { ashlar, FACING, tiledSlope } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitCyl as cyl,
  kitPrism as prism,
  kitScenery as scenery,
  kitSeeded as seeded,
  kitWorn as worn,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { arch, broadleaf, conifer } from "@/lib/models/craft";
import { ledgeAt, rockOffset } from "@/lib/models/rockface";

/**
 * A monastery built into a cliff: a cave turned into a church, its outer wall
 * painted, chapels and cells round a narrow court, a tall range of rooms with
 * balconies standing on the cliff edge, and an aqueduct bringing water along
 * the rock. Modelled on Sümela above the Altındere valley as it stood in the
 * nineteenth century, before it was emptied in 1923.
 */
export type CliffMonasterySpec = {
  kind: "cliff-monastery";
  /**
   * Cited: the height above the sea, which decides the forest round it — at
   * 1,200 m on the Pontic slope spruce and fir outnumber the beech.
   */
  altitude: number;
  /** Modelled. */
  storeys: number;
  storeyHeight: number;
  rangeLength: number;
  courtLevel: number;
  caveWidth: number;
  caveHeight: number;
  aqueductArches: number;
};

/** Where things are, in plan: the cliff face, the cave, the court, the range. */
export function monasteryLayout(spec: CliffMonasterySpec) {
  const C = spec.courtLevel;
  const cliff = 4;
  const caveBack = cliff + 9;
  const caveLeft = -spec.caveWidth + 4;
  const caveRight = 4;
  const rangeFront = -8;
  const rangeLeft = 0;
  const rangeTop = C + spec.storeys * spec.storeyHeight;
  const courtFront = -6;
  const courtLeft = caveLeft - 8;
  return {
    C,
    cliff,
    caveBack,
    caveLeft,
    caveRight,
    rangeFront,
    rangeLeft,
    rangeTop,
    courtFront,
    courtLeft,
  };
}

export function cliffMonasteryParts(spec: CliffMonasterySpec): Part[] {
  const parts: Part[] = [];
  const L = monasteryLayout(spec);
  const {
    C,
    cliff,
    caveBack,
    caveLeft,
    caveRight,
    rangeFront,
    rangeLeft,
    rangeTop,
    courtFront,
    courtLeft,
  } = L;
  const S = spec.storeyHeight;
  const rangeRight = rangeLeft + spec.rangeLength;

  /* ---- the cliff ---- */
  /*
   * The face is built of upright blocks of living rock a few metres wide,
   * each its own height — tallest over the monastery, falling away to either
   * side into the forested slope — and each with a rock face of its own
   * (see `rockface.ts`): ledges with shrubs on them, joints running up it,
   * the top leaning out over the buildings. A single block 200 m wide read
   * from any distance as what it was, a flat slab.
   */
  const RELIEF = 2.6;
  const random = seeded(1923);
  const sky = 78;
  const back = caveBack + 32;
  const rockBlock = (x0: number, x1: number, y0: number, top: number, z0: number) => {
    const w = x1 - x0;
    const h = top - y0;
    if (w <= 0.5 || h <= 0.5) return;
    const ledges: number[] = [];
    for (let y = 5 + random() * 6; y < h - 6; y += 7 + random() * 9) ledges.push(y);
    const face = {
      relief: RELIEF,
      seed: Math.floor(random() * 1e6),
      ledges,
      overhang: top > 50 ? 0.4 + random() * 0.5 : 0,
    };
    const front = z0 + RELIEF;
    // A weathered crag along its top, so the crest is broken, not sawn.
    if (top > C + spec.caveHeight + 4)
      parts.push(
        scenery(
          worn(
            box("rock", [(x0 + x1) / 2, top - 2.5, front + 3], [w + 1.5, 3 + random() * 4, 8]),
            1.4,
          ),
        ),
      );
    parts.push(
      scenery({
        ...box("rock", [(x0 + x1) / 2, y0, (front + back) / 2], [w, h, back - front]),
        rock: face,
      }),
    );
    // Shrubs and a few small trees on the ledges, where a ledge is there.
    face.ledges.forEach((y, k) => {
      for (let u = -w / 2 + 1.2; u < w / 2 - 1.2; u += 1.6 + random() * 2.4) {
        if (!ledgeAt(face, k, u) || random() < 0.35) continue;
        const shelf = rockOffset(face, w, h, u, y - 0.2) * RELIEF;
        const at: Vec3 = [(x0 + x1) / 2 + u, y0 + y, front - shelf * 0.55];
        if (random() < 0.2) parts.push(...conifer(at, 2.5 + random() * 3));
        else {
          const r = 0.4 + random() * 0.6;
          parts.push(scenery(cyl("foliage", at, r * 0.6, r, r * 0.9, 7)));
        }
      }
    });
  };
  // The skyline: a slow wave of crags rather than a row of organ pipes.
  const crest = [random(), random(), random()].map((p) => p * Math.PI * 2);
  const heightAt = (x: number) => {
    const fall = Math.min(1, Math.max(0, (Math.abs(x - 5) - 55) / 50));
    const wave =
      Math.sin(x / 23 + crest[0]!) * 4.5 +
      Math.sin(x / 9 + crest[1]!) * 2.2 +
      Math.sin(x / 4.3 + crest[2]!) * 1.1;
    return sky * (1 - 0.62 * fall * fall * (3 - 2 * fall)) + wave;
  };
  for (let x = -112; x < 112;) {
    const w = 13 + random() * 10;
    const x0 = x;
    const x1 = Math.min(112, x + w);
    x = x1;
    const top = heightAt((x0 + x1) / 2);
    const z0 = cliff + (random() - 0.5) * 0.8;
    if (x1 <= caveLeft || x0 >= caveRight) rockBlock(x0, x1, 0, top, z0);
    else {
      // Over the cave: the rock starts at its roof; either side, from the ground.
      if (x0 < caveLeft) rockBlock(x0, caveLeft, 0, top, z0);
      rockBlock(Math.max(x0, caveLeft), Math.min(x1, caveRight), C + spec.caveHeight, top, cliff);
      if (x1 > caveRight) rockBlock(caveRight, x1, 0, top, z0);
    }
  }
  // The back of the cave, and the rock behind it.
  parts.push(
    scenery(
      worn(
        box(
          "rock",
          [(caveLeft + caveRight) / 2, 0, (caveBack + back) / 2],
          [caveRight - caveLeft, sky - 10, back - caveBack],
        ),
        0.6,
      ),
    ),
  );
  // The overhang that leans out over the range of rooms.
  const lean = rangeTop + 6;
  parts.push(
    scenery({
      ...box("rock", [10, lean, cliff - 1.5], [90, sky - 14 - lean, 5]),
      rock: { relief: RELIEF, seed: 77, ledges: [], overhang: 0.6 },
    }),
  );
  // Buttresses of rock standing out of the face, and the forest clinging to them.
  for (let i = 0; i < 14; i += 1) {
    const x = -95 + random() * 190;
    if (x > courtLeft - 50 && x < rangeRight + 4) continue;
    const h = 10 + random() * 40;
    const w = 4 + random() * 8;
    const z = cliff - 2 - random() * 3;
    parts.push(
      scenery({
        ...box("rock", [x, 0, z + 2.5], [w, h, 5 + random() * 3]),
        rock: { relief: 1.6, seed: i * 13 + 5, ledges: [h * 0.5], overhang: 0 },
      }),
    );
    parts.push(...conifer([x + (random() - 0.5) * 3, h, z + 2], 4 + random() * 4));
  }
  // The forest on the slope below and to either side: the higher, the more of it conifer.
  const coniferShare = Math.min(0.9, Math.max(0.2, (spec.altitude - 400) / 1100));
  for (let i = 0; i < 150; i += 1) {
    const x = -110 + random() * 220;
    const z = cliff - 6 - random() * 70;
    // Clear before the buildings, and thin in the line of sight to them.
    const clear =
      (x > courtLeft - 40 && x < rangeRight + 6 && z > courtFront - 24) ||
      (x > courtLeft - 50 && x < rangeRight + 20 && random() < 0.75);
    if (clear) continue;
    const h = 9 + random() * 13;
    if (random() < coniferShare) parts.push(...conifer([x, 0, z], h));
    else parts.push(...broadleaf([x, 0, z], h * 0.75));
  }

  // The forest floor: green under the trees, not the dry ground of the coast.
  parts.push(scenery(box("foliage", [0, -0.14, cliff - 87], [240, 0.12, 150])));

  /* ---- the court before the cave, on its platform ---- */
  // The platform the court stands on: masonry from the slope up.
  parts.push(
    box(
      "stone",
      [(courtLeft + caveRight) / 2, 0, (courtFront + caveBack) / 2],
      [caveRight - courtLeft, C - 0.1, caveBack - courtFront],
    ),
  );
  parts.push(
    box(
      "limestone",
      [(courtLeft + caveRight) / 2, C - 0.1, (courtFront + caveBack) / 2],
      [caveRight - courtLeft, 0.1, caveBack - courtFront],
    ),
  );
  parts.push(
    ...ashlar({
      at: [(courtLeft + rangeLeft) / 2, 0, courtFront],
      rotY: FACING.south,
      length: rangeLeft - courtLeft,
      height: C - 0.12,
      material: "stone",
      blocks: 1.1,
      course: 0.5,
      coping: false,
    }),
  );
  // A parapet along the court's open edge.
  parts.push(
    box(
      "stone",
      [(courtLeft + 6 + rangeLeft) / 2, C, courtFront + 0.25],
      [rangeLeft - courtLeft - 6, 1.0, 0.5],
    ),
  );

  /* ---- the rock church ---- */
  // The wall built across the cave's mouth, its outside painted over.
  const churchL = caveLeft + 1;
  const churchR = caveRight - 7;
  const churchZ = caveBack - 4;
  const wallH = 8.5;
  const cw = churchR - churchL;
  const cx = (churchL + churchR) / 2;
  const door = churchL + 4.15;
  parts.push(box("stone", [churchL + 1.8, C, churchZ], [3.6, wallH, 0.8]));
  parts.push(
    box("stone", [(door + 0.55 + churchR) / 2, C, churchZ], [churchR - door - 0.55, wallH, 0.8]),
  );
  parts.push(box("stone", [door, C + 2.6, churchZ], [1.1, wallH - 2.6, 0.8]));
  parts.push(box("timber", [door, C, churchZ + 0.2], [1.0, 2.6, 0.12]));
  // Inside, the dark of the cave.
  parts.push(box("shadow", [cx, C, caveBack - 0.4], [cw, wallH, 0.2]));
  // The roof over the church in the cave, a lean-to against the rock.
  parts.push(
    box(
      "timber",
      [cx, C + wallH, (churchZ + caveBack) / 2],
      [cw + 0.4, 0.3, caveBack - churchZ + 0.6],
    ),
  );
  // The paintings: registers of saints on the outer wall (the app's own design).
  parts.push(...frescoes([cx, C + 0.4, churchZ - 0.4], FACING.south, cw - 0.4, wallH - 0.8, 3, 11));

  /* ---- a chapel at the west end of the court ---- */
  const chx = courtLeft + 4;
  const chz = cliff + 1;
  parts.push(box("stone", [chx, C, chz], [5, 5.2, 6]));
  parts.push(prism("terracotta", [chx, C + 5.2, chz], [5.6, 2.0, 6.6]));
  parts.push(box("timber", [chx + 2.52, C, chz - 1.2], [0.06, 2.2, 1.0]));
  parts.push(...frescoes([chx + 2.5, C + 2.6, chz + 0.8], FACING.east, 3.4, 2.4, 1, 5));
  parts.push(...arch("stone", [chx + 2.55, C + 2.2, chz - 1.2], 0.55, 0.22, 0.4, 7, true));

  /* ---- the holy spring under the rock ---- */
  const spring: Vec3 = [caveRight - 3.5, C, caveBack - 1.8];
  parts.push(box("marble", spring, [2.6, 0.7, 1.6]));
  parts.push(box("water", [spring[0], C + 0.45, spring[2]], [2.3, 0.2, 1.3]));
  parts.push(
    cyl("bronze", [spring[0], C + 1.2, spring[2] + 0.7], 0.05, 0.05, 0.4, 8, {
      rotX: -Math.PI / 2,
    }),
  );

  /* ---- the range of rooms on the cliff edge ---- */
  const sections: { x0: number; x1: number; storeys: number; back: number }[] = [];
  const split = [0, 0.4, 0.75, 1];
  for (let i = 0; i < 3; i += 1) {
    sections.push({
      x0: rangeLeft + spec.rangeLength * split[i]!,
      x1: rangeLeft + spec.rangeLength * split[i + 1]!,
      storeys: i === 2 ? spec.storeys - 1 : spec.storeys,
      back: i === 1 ? 1 : 0,
    });
  }
  for (const [i, sec] of sections.entries()) {
    const w = sec.x1 - sec.x0;
    const x = (sec.x0 + sec.x1) / 2;
    const front = rangeFront + sec.back;
    const top = C + sec.storeys * S;
    // The lower walls rise from the slope as a plain substructure; the
    // storeys over the court level are plastered and windowed.
    parts.push(box("stone", [x, 0, (front + cliff) / 2], [w, C, cliff - front]));
    parts.push(box("limestone", [x, C, (front + cliff) / 2], [w, top - C, cliff - front]));
    parts.push(
      ...ashlar({
        at: [x, 0, front],
        rotY: FACING.south,
        length: w,
        height: C,
        material: "stone",
        blocks: 1.0,
        course: 0.5,
        coping: false,
      }),
    );
    // Windows, storey by storey, and a balcony along the upper ones.
    for (let f = 0; f < sec.storeys; f += 1) {
      const y = C + f * S;
      const n = Math.floor(w / 2.1);
      for (let k = 0; k < n; k += 1) {
        const wx = sec.x0 + (w * (k + 0.5)) / n;
        parts.push(box("shadow", [wx, y + 0.9, front - 0.02], [0.8, 1.35, 0.04]));
        parts.push(box("timber", [wx, y + 0.84, front - 0.06], [1.0, 0.07, 0.1]));
      }
      if (f >= 1) parts.push(...balcony([x, y, front], w - 0.6, i + f));
    }
    // Slit windows lighting the cellars in the substructure.
    for (let k = 0; k < Math.floor(w / 4); k += 1)
      parts.push(box("shadow", [sec.x0 + 2 + k * 4, C * 0.55, front - 0.02], [0.3, 0.9, 0.04]));
    // The roof: a lean-to of tiles from the front eave back to the rock.
    parts.push(box("timber", [x, top, (front + cliff) / 2], [w + 0.6, 0.18, cliff - front + 0.6]));
    parts.push(
      ...tiledSlope({
        eave: [x, top + 0.18, front - 0.3],
        rotY: FACING.north,
        width: w + 0.6,
        run: cliff - front + 0.3,
        rise: 1.8,
        spacing: 0.5,
        cover: 0.07,
      }),
    );
  }

  /* ---- the stair and the gate ---- */
  // Up the slope from the path, along the foot of the court's platform.
  const gateX = courtLeft - 4;
  const gateZ = courtFront + 2;
  const steps = Math.round((C + 1.2) / 0.2);
  for (let i = 0; i < steps; i += 1) {
    const h = 0.2 * (i + 1);
    parts.push(box("stone", [gateX - 0.36 * (steps - i) + 0.18, 0, gateZ], [0.36, h, 2.4]));
  }
  // The landing at the top, the gatehouse over it, and steps down into the court.
  parts.push(box("stone", [gateX + 2, 0, gateZ], [4, C + 1.2, 4.8]));
  for (const s of [-1, 1])
    parts.push(box("stone", [gateX + 2, C + 1.2, gateZ + s * 2.1], [4, 4.2, 0.6]));
  parts.push(box("stone", [gateX + 2, C + 5.4, gateZ], [4.2, 0.5, 4.9]));
  parts.push(prism("terracotta", [gateX + 2, C + 5.9, gateZ], [5.2, 1.2, 4.6], Math.PI / 2));
  for (let i = 0; i < 6; i += 1)
    parts.push(box("stone", [courtLeft + 0.18 + i * 0.36, C, gateZ], [0.36, 1.2 - i * 0.2, 2.6]));

  /* ---- the aqueduct along the cliff ---- */
  const n = spec.aqueductArches;
  const span = 5.2;
  const pier = 1.5;
  const channel = C + 9;
  const aqRight = courtLeft - 9;
  const aqZ = cliff - 1.8;
  for (let i = 0; i <= n; i += 1) {
    const x = aqRight - i * (span + pier);
    parts.push(box("stone", [x, 0, aqZ], [pier, channel - span / 2, 1.6]));
  }
  for (let i = 0; i < n; i += 1) {
    const x = aqRight - pier / 2 - span / 2 - i * (span + pier);
    parts.push(...arch("stone", [x, channel - span / 2, aqZ], span / 2, 0.5, 1.6, 9));
    // The spandrels over the arch, up to the channel.
    for (const s of [-1, 1])
      parts.push(
        box(
          "stone",
          [x + s * (span / 2 - 0.55), channel - span / 2 + 1.2, aqZ],
          [1.1, span / 2 - 1.2, 1.6],
        ),
      );
  }
  const aqLength = n * (span + pier) + pier;
  parts.push(box("stone", [aqRight + pier / 2 - aqLength / 2, channel, aqZ], [aqLength, 0.6, 1.8]));
  parts.push(
    box("water", [aqRight + pier / 2 - aqLength / 2, channel + 0.6, aqZ], [aqLength, 0.06, 0.5]),
  );
  for (const s of [-1, 1])
    parts.push(
      box(
        "stone",
        [aqRight + pier / 2 - aqLength / 2, channel + 0.6, aqZ + s * 0.6],
        [aqLength, 0.4, 0.3],
      ),
    );
  // From the aqueduct's end, a channel across to the court along the rock.
  parts.push(
    box("stone", [(aqRight + courtLeft) / 2, channel, aqZ], [courtLeft - aqRight, 0.6, 1.8]),
  );

  return parts;
}

/**
 * A timber balcony along a storey: its floor on brackets, a rail on posts,
 * and a little roof of boards over it.
 */
function balcony(at: Vec3, length: number, seed: number): Part[] {
  const parts: Part[] = [];
  const [x, y, z] = at;
  const depth = 1.1;
  parts.push(box("timber", [x, y - 0.12, z - depth / 2], [length, 0.12, depth]));
  const posts = Math.max(2, Math.round(length / 1.6));
  for (let i = 0; i <= posts; i += 1) {
    const px = x - length / 2 + 0.1 + ((length - 0.2) * i) / posts;
    parts.push(box("timber", [px, y, z - depth + 0.06], [0.09, 1.0, 0.09]));
    parts.push(box("timber", [px, y - 0.5, z - 0.12], [0.08, 0.38, 0.08]));
  }
  parts.push(box("timber", [x, y + 1.0, z - depth + 0.06], [length, 0.07, 0.11]));
  parts.push(box("timber", [x, y + 0.45, z - depth + 0.06], [length, 0.05, 0.05]));
  // Every other balcony carries a little roof.
  if (seed % 2 === 0)
    parts.push(box("timber", [x, y + 2.55, z - depth / 2 - 0.05], [length, 0.08, depth + 0.2]));
  return parts;
}

/**
 * A wall of painted saints, in registers, after the manner of late Byzantine
 * painting: one sheet over the wall, painted by the renderer from the seed
 * (see `scene/fresco.ts`) — haloed figures with faces, robes in folds, their
 * names beside them, red borders, a deep blue ground. The app's own design,
 * not a copy of any figure at Sümela.
 */
function frescoes(
  at: Vec3,
  rotY: number,
  width: number,
  height: number,
  registers: number,
  seed: number,
): Part[] {
  // A hair in front of the wall, along the wall's own outward normal.
  const out: Vec3 = [at[0] + 0.012 * Math.sin(rotY), at[1], at[2] + 0.012 * Math.cos(rotY)];
  const perRow = Math.max(1, Math.round(width / 1.45));
  return [
    { ...box("paintBlue", out, [width, height, 0.004], rotY), fresco: { seed, registers, perRow } },
  ];
}

/** In the court before the rock church, looking at its painted wall. */
export function monasteryWalkStart(spec: CliffMonasterySpec): WalkStart {
  const L = monasteryLayout(spec);
  const cx = (L.caveLeft + 1 + L.caveRight - 7) / 2;
  return {
    at: [cx + 3, L.courtFront + 2.5],
    floor: L.C,
    look: [cx, L.C + 3.5, L.caveBack - 4],
  };
}
