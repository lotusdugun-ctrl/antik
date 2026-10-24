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
import { ledgeAt, ledgeHeight, rockOffset, type RockFace } from "@/lib/models/rockface";

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
  /*
   * Below the ledge the rock falls away to the valley floor. Modelled: the
   * real monastery stands about 300 m over the Altındere; here the drop is
   * shortened to 80 m, so the building and the depth under it fit one view.
   */
  const valley = -80;
  // Where the walls of the range and the court stand on the rock below the ledge.
  const foot = -14;
  /*
   * The path along the slope from the west: level along the ledge from the
   * foot of the stair to `pathTurn`, then down across the face to `pathEnd`.
   * It runs between `pathFront`, the edge with its parapet, and `pathBack`.
   */
  const pathTurn = -80;
  const pathEnd = -128;
  const pathFront = -6.8;
  const pathBack = -1.5;
  // A grassy shelf of rock east of the range, a storey under the ledge: goats graze there.
  const pasture: Vec3 = [51, foot, -7];
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
    valley,
    foot,
    pathTurn,
    pathEnd,
    pathFront,
    pathBack,
    pasture,
  };
}

/**
 * The parapets and rails along every edge a visitor can reach: chest-high,
 * and too high to be climbed onto by someone walking through the model.
 */
const PARAPET = 1.35;

/** How steeply the path drops west of `pathTurn`: a rise of 27 cm a metre. */
const PATH_GRADE = 0.27;

/** The height of the path at x: on the ledge east of the turn, falling west of it. */
export function pathLevel(L: ReturnType<typeof monasteryLayout>, x: number) {
  return (Math.max(L.pathEnd, Math.min(L.pathTurn, x)) - L.pathTurn) * PATH_GRADE;
}

/**
 * The level of the open ground round a model: the valley floor here, far
 * below the ledge the monastery stands on (see `groundOf` in reconstruction-parts).
 */
export const monasteryGround = (spec: CliffMonasterySpec) => monasteryLayout(spec).valley;

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
  const retaining = (x: number, face: number, length: number) =>
    retainingWall(x, face, length, L.foot);
  const buttress = (x: number, face: number, top: number) => buttressAt(x, face, L.foot, top);

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
  type BlockOptions = {
    /** Where the block's body ends behind its face (default: deep in the mountain). */
    back?: number;
    /** Counted in the model's bounds: the rock the building's frame reaches down to. */
    solid?: boolean;
    relief?: number;
    /** The chance a spot on a ledge carries a plant at all. */
    green?: number;
    /** How far the top of the face leans out (see `RockFace.overhang`). */
    lean?: number;
    /** Turned about the middle of its face, radians: no two faces quite parallel. */
    turn?: number;
    /** Only scrub on its ledges, no trees: the faces seen from across the valley. */
    scrub?: boolean;
    rng?: () => number;
    /**
     * One of a run of blocks that make one cliff: the rock is laid out in
     * the cliff's coordinates from this seed, the ledges are the cliff's (world
     * heights), and the edges named run straight on into the neighbours.
     */
    cliffOf?: {
      seed: number;
      ledges: number[];
      open: [[number, number][], [number, number][]];
      leanBetween?: [number, number];
    };
    /** How strongly bedded the rock is (see `RockFace.strata`). */
    strata?: number;
    /** Where the block's middle is along its cliff, if not its `x`: a turned face. */
    along?: number;
  };
  const rockBlock = (
    x0: number,
    x1: number,
    y0: number,
    top: number,
    z0: number,
    options: BlockOptions = {},
  ) => {
    const w = x1 - x0;
    const h = top - y0;
    if (w <= 0.5 || h <= 0.5) return;
    const rand = options.rng ?? random;
    const relief = options.relief ?? RELIEF;
    const ledges: number[] = [];
    const of = options.cliffOf;
    if (of) {
      for (const y of of.ledges) if (y - y0 > 4 && y - y0 < h - 5) ledges.push(y - y0);
    } else for (let y = 5 + rand() * 6; y < h - 6; y += 7 + rand() * 9) ledges.push(y);
    const mid = (x0 + x1) / 2;
    const face: RockFace = {
      relief,
      seed: of ? of.seed : Math.floor(rand() * 1e6),
      ledges,
      overhang: options.lean ?? (top > 50 ? 0.4 + rand() * 0.5 : 0),
      ...(of
        ? {
            origin: [options.along ?? mid, y0] as const,
            open: of.open,
            ...(of.leanBetween ? { leanBetween: of.leanBetween } : {}),
          }
        : { origin: [mid, y0] as const }),
      ...(options.strata ? { strata: options.strata } : {}),
    };
    const front = z0 + relief;
    const end = options.back ?? back;
    // A weathered crag along its top, so the crest is broken, not sawn.
    if (top > C + spec.caveHeight + 4)
      parts.push(
        scenery(
          worn(
            box("rock", [(x0 + x1) / 2, top - 2.5, front + 3], [w + 1.5, 3 + rand() * 4, 8]),
            1.4,
          ),
        ),
      );
    const turn = options.turn ?? 0;
    const sin = Math.sin(turn);
    const cos = Math.cos(turn);
    const depth = end - front;
    const body: Part = {
      ...box("rock", [mid + (sin * depth) / 2, y0, front + (cos * depth) / 2], [w, h, depth], turn),
      rock: face,
    };
    parts.push(options.solid ? body : scenery(body));
    // Shrubs and a few small trees on the ledges, where a ledge is there.
    const green = options.green ?? 0.65;
    face.ledges.forEach((_, k) => {
      for (let u = -w / 2 + 1.2; u < w / 2 - 1.2; u += 1.6 + rand() * 2.4) {
        if (!ledgeAt(face, k, u) || rand() < 1 - green) continue;
        const y = ledgeHeight(face, k, u);
        // The shelf is cut by the mesh a metre or so a cell, so its top is a
        // slope back to the face: a plant is set down into the rock and back
        // from the lip, where there is rock all round its foot.
        const shelf = rockOffset(face, w, h, u, y - 1.2) * relief;
        const out = shelf * 0.4;
        const at: Vec3 = [mid + u * cos - out * sin, y0 + y - 0.9, front - u * sin - out * cos];
        if (!options.scrub && rand() < 0.2) parts.push(...conifer(at, 3 + rand() * 3));
        else {
          // A low, rounded bush rather than a bowl.
          const r = 0.5 + rand() * 0.6;
          parts.push(
            scenery(
              worn(cyl("foliage", at, r, r * 0.35, r * 1.5, options.scrub ? 5 : 7), r * 0.12),
            ),
          );
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
  // Lower towards either end, where the side of the gorge falls away into the forest.
  const capAt = (x: number) =>
    x < L.pathEnd
      ? pathLevel(L, L.pathEnd) - 3 - (L.pathEnd - x) * 1.6
      : x > 103
        ? -(x - 103) * 1.6
        : 0;
  const ledgeTop = (x: number) => Math.min(0, capAt(x));
  /*
   * The cliff over the ledge is one face of rock: its blocks stand on one
   * line and share one grain, one set of beds and ledges, one lean at the
   * top, so the rock runs on from block to block; only their tops differ,
   * the crest broken by the crags along it.
   */
  const crags: { x0: number; x1: number; y0: number; top: number }[] = [];
  for (let x = -112; x < 112;) {
    const w = 13 + random() * 10;
    const x0 = x;
    const x1 = Math.min(112, x + w);
    x = x1;
    const top = heightAt((x0 + x1) / 2);
    // Drawn and not used, so everything after it is placed as before.
    random();
    const y0 = ledgeTop((x0 + x1) / 2);
    if (x1 <= caveLeft || x0 >= caveRight) crags.push({ x0, x1, y0, top });
    else {
      // Over the cave: the rock starts at its roof; either side, from the ledge.
      if (x0 < caveLeft) crags.push({ x0, x1: caveLeft, y0, top });
      crags.push({
        x0: Math.max(x0, caveLeft),
        x1: Math.min(x1, caveRight),
        y0: C + spec.caveHeight,
        top,
      });
      if (x1 > caveRight) crags.push({ x0: caveRight, x1, y0, top });
    }
  }
  const cliffLedges: number[] = [];
  {
    const r = seeded(4471);
    for (let y = 7 + r() * 4; y < sky; y += 8 + r() * 7) cliffLedges.push(y);
  }
  crags.forEach((b, i) => {
    // Where each neighbour stands beside this block, up its edge.
    const beside = (n: (typeof crags)[number] | undefined): [number, number][] =>
      n && n.x1 - n.x0 > 0.5
        ? [[Math.max(b.y0, n.y0) - b.y0 + 0.5, Math.min(b.top, n.top) - b.y0 - 1.5]]
        : [];
    rockBlock(b.x0, b.x1, b.y0, b.top, cliff, {
      lean: 0.55,
      strata: 0.55,
      cliffOf: {
        seed: 6060,
        ledges: cliffLedges,
        open: [beside(crags[i - 1]), beside(crags[i + 1])],
        leanBetween: [sky - 24, sky - 4],
      },
    });
  });
  /*
   * The crest itself: each block of the cliff ends in a flat top, and side
   * by side they stepped along the skyline like a flight of stairs. A row
   * of weathered boulders along the lip, each sized to reach the smooth
   * skyline the blocks were cut from, rounds the steps off and breaks the
   * flat tops into crags. From a stream of its own, so nothing else moves.
   */
  {
    const r = seeded(7717);
    for (let x = -110 + r() * 2; x < 110; x += 4.5 + r() * 3) {
      const block = crags.find((b) => x >= b.x0 && x < b.x1);
      if (!block) continue;
      const smoothTop = heightAt(x);
      const s = 2.6 + r() * 3.2;
      const lift = Math.max(0, smoothTop - block.top);
      const tall = s + lift;
      // A squat cone of few sides, broken up by the weather: a crag for a
      // couple of hundred triangles, not a subdivided block of thousands.
      parts.push(
        scenery(
          worn(
            cyl(
              "rock",
              [x, block.top - s * 0.45, cliff + RELIEF + 1.5 + r() * 3],
              s * (0.85 + r() * 0.35),
              s * (0.25 + r() * 0.25),
              tall,
              5,
            ),
            Math.min(1.2, s * 0.28),
          ),
        ),
      );
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
  // The overhang that leans out over the range of rooms: one mass of rock,
  // in stretches whose undersides hang lower or higher, the rock running on
  // from one into the next.
  const lean = rangeTop + 6;
  {
    const hang = [
      [-35, -18, 2.2],
      [-18, -2, 0],
      [-2, 13, 3.4],
      [13, 31, 1.1],
      [31, 44, 4.2],
      [44, 55, 6.5],
    ] as const;
    hang.forEach(([x0, x1, up], i) => {
      const y0 = lean + up;
      const top = sky - 14 - (i === 0 || i === hang.length - 1 ? 5 : 0);
      const beside = (n: (typeof hang)[number] | undefined): [number, number][] =>
        n ? [[Math.max(y0, lean + n[2]) - y0 + 0.5, top - y0 - 1]] : [];
      parts.push(
        scenery({
          ...box("rock", [(x0 + x1) / 2, y0, cliff - 1.5], [x1 - x0, top - y0, 5]),
          rock: {
            relief: RELIEF,
            seed: 77,
            ledges: [],
            overhang: 0.6,
            origin: [(x0 + x1) / 2, y0],
            open: [beside(hang[i - 1]), beside(hang[i + 1])],
            strata: 0.55,
            hung: true,
          },
        }),
      );
    });
  }
  // Buttresses of rock standing out of the face, and the forest clinging to them.
  for (let i = 0; i < 14; i += 1) {
    const x = -95 + random() * 190;
    if (x > courtLeft - 50 && x < rangeRight + 4) continue;
    const h = 10 + random() * 40;
    const w = 4 + random() * 8;
    const z = cliff - 2 - random() * 3;
    const d = 5 + random() * 3;
    // Kept off the path, which runs along the foot of the face to the west.
    const mid = Math.max(z + 2.5, L.pathBack + 0.4 + d / 2);
    parts.push(
      scenery({
        ...box("rock", [x, ledgeTop(x), mid], [w, h, d]),
        rock: { relief: 1.6, seed: i * 13 + 5, ledges: [h * 0.5], overhang: 0 },
      }),
    );
    parts.push(
      ...conifer([x + (random() - 0.5) * 3, ledgeTop(x) + h, mid - 0.5], 4 + random() * 4),
    );
  }

  /* ---- the drop below the ledge ---- */
  /*
   * The monastery's ledge is a shelf on a mountainside, not the floor of
   * the valley. Under it the rock goes on down near enough sheer: face
   * under face, each standing a little out from the one above, with a
   * narrow shelf between them where a spruce or a bush has taken hold, to
   * the scree and the forest at the foot (the landscape banks the ground up
   * against the lowest faces, see `landscape-plan.ts`) and the valley floor
   * (`valley`). Each face is the same living rock as the cliff above, with
   * a face of its own, so the cliff and the drop under it read as one
   * mountain. Under the court and the range the first shelf is where their
   * walls stand (`foot`); east of the range a wider one is a goats' pasture.
   */
  const drop = seeded(1461);
  const DROP_RELIEF = 2.4;
  const fixed = [
    -152,
    L.pathEnd,
    -112,
    -96,
    L.pathTurn,
    courtLeft,
    -12,
    2,
    16,
    rangeRight,
    L.pasture[0] - 7,
    L.pasture[0] + 7,
    142,
  ];
  // Columns of rock across the mountainside, each its own width.
  const breaks: number[] = [];
  for (let i = 0; i + 1 < fixed.length; i += 1) {
    const a = fixed[i]!;
    const b = fixed[i + 1]!;
    breaks.push(a);
    const n = Math.max(1, Math.round((b - a) / 18));
    for (let k = 1; k < n; k += 1) breaks.push(a + ((b - a) * (k + (drop() - 0.5) * 0.5)) / n);
  }
  breaks.push(fixed[fixed.length - 1]!);
  const columns: {
    x0: number;
    x1: number;
    bank: number;
    faces: { top: number; front: number; turn: number }[];
  }[] = [];
  for (let i = 0; i + 1 < breaks.length; i += 1) {
    const x0 = breaks[i]!;
    const x1 = breaks[i + 1]!;
    const xm = (x0 + x1) / 2;
    const built = xm > courtLeft && xm < rangeRight;
    const grazed = Math.abs(xm - L.pasture[0]) < 7;
    const onPath = xm < L.pathTurn && xm > L.pathEnd;
    // The line of the face wanders a little, not a metre at a time.
    const wobble = Math.sin(xm / 17 + 1.3) * 1.2 + Math.sin(xm / 7.3) * 0.6;
    // Under the path, the shelf it is built on; elsewhere the ledge at the cliff's foot.
    let top = onPath ? pathLevel(L, x0) - 0.6 : ledgeTop(xm);
    let front = built ? -1.5 : xm < courtLeft ? -10.2 + wobble * 0.3 : -3.4 + wobble;
    const faces: { top: number; front: number; turn: number; square: boolean }[] = [];
    const end = i === 0 || i + 2 === breaks.length;
    while (top > L.valley + 1) {
      const first = faces.length === 0;
      // The faces the path, the parapet and the walls stand on stay square to them.
      const square = end || first || (faces.length === 1 && (built || grazed));
      faces.push({ top, front, turn: square ? 0 : (drop() - 0.5) * 0.22, square });
      top -= first && (built || grazed) ? top - L.foot : 12 + drop() * 16;
      // Too little left for another face: this one goes down to the valley floor.
      if (top < L.valley + 10) break;
      front -= first && built ? 12.5 : first && grazed ? 8.5 : 1.6 + drop() * 2.6;
    }
    const column = { x0, x1, faces, bank: 0 };
    columns.push(column);
    faces.forEach((f, k) => {
      const below = faces[k + 1];
      // A metre into the face below, so no seam opens between them.
      const bottom = below ? below.top - 1 : L.valley;
      // The lowest face under the monastery is counted in the model's frame,
      // so the view is set from the valley floor up; it reaches back only as
      // far as the face above it.
      const solid = !below && k > 0 && x0 >= L.pathTurn && x1 <= rangeRight;
      const lean = f.top - bottom > 14 ? drop() * 0.6 : 0;
      /*
       * A face nothing stands on is broken along its top into crags of its
       * own widths, some standing up past the shelf, some a little short of
       * it, the rock running on from one to the next: its lip is a ragged
       * line, not the edge of a slab. (Never lower than the face above
       * reaches down, or a slot would open under it.)
       */
      const width = x1 - x0;
      const pieces: [number, number, number][] = [];
      if (f.square || f.top - bottom < 8) pieces.push([-width / 2, width / 2, 0]);
      else {
        let u = -width / 2;
        while (u < width / 2 - 0.1) {
          let w = 4 + drop() * 5;
          if (width / 2 - u - w < 3) w = width / 2 - u;
          pieces.push([u, u + w, -0.7 + drop() * 2.9]);
          u += w;
        }
      }
      const ledges: number[] = [];
      for (let y = bottom + 5 + drop() * 4; y < f.top - 4; y += 7 + drop() * 7) ledges.push(y);
      const seed = Math.floor(drop() * 1e6);
      const cos = Math.cos(f.turn);
      const sin = Math.sin(f.turn);
      pieces.forEach(([u0, u1, dy], j) => {
        const uc = (u0 + u1) / 2;
        const cx = (x0 + x1) / 2 + uc * cos;
        const top = f.top + dy;
        const beside = (n: [number, number, number] | undefined): [number, number][] =>
          n ? [[0.5, Math.min(top, f.top + n[2]) - bottom - 1.5]] : [];
        rockBlock(cx - (u1 - u0) / 2, cx + (u1 - u0) / 2, bottom, top, f.front - uc * sin, {
          rng: drop,
          scrub: true,
          strata: 0.5,
          relief: DROP_RELIEF,
          green: 0.06,
          lean,
          turn: f.turn,
          along: (x0 + x1) / 2 + uc,
          cliffOf: {
            seed,
            ledges,
            open: [beside(pieces[j - 1]), beside(pieces[j + 1])],
            leanBetween: [f.top - 12, f.top - 1],
          },
          ...(solid ? { solid: true, back: faces[k - 1]!.front + 3 } : {}),
        });
      });
      const shelfAt = (x: number) => {
        const u = (x - (x0 + x1) / 2) / cos;
        const piece = pieces.find(([a, b]) => u >= a && u <= b) ?? pieces[0]!;
        return f.top + piece[2];
      };
      if (k === 0 || (k === 1 && (built || grazed))) return;
      // On the shelf in front of the face above: spruce, a beech, scrub.
      const z0 = f.front + DROP_RELIEF + 0.2 + Math.abs(Math.sin(f.turn)) * ((x1 - x0) / 2);
      const z1 = faces[k - 1]!.front + 0.6;
      if (z1 < z0) return;
      for (let x = x0 + 1.2 + drop() * 2; x < x1 - 1.2; x += 3 + drop() * 4) {
        const z = z0 + drop() * (z1 - z0);
        const r = drop();
        if (r < 0.2) continue;
        const y = shelfAt(x);
        if (r < 0.62) parts.push(...spruce([x, y, z], 4 + drop() * (k > 1 ? 11 : 5)));
        else if (r < 0.72) parts.push(...broadleaf([x, y, z], 6 + drop() * 4));
        else parts.push(scenery(cyl("foliage", [x, y, z], 0.9, 0.5, 0.9 + drop() * 0.6, 6)));
      }
    });
    if (onPath) {
      // Above the path, the rock it is cut into: up to the ledge under the
      // cliff, and past the cliff's end a lower crag of its own.
      const bank = x0 < -112 ? 6 + drop() * 8 : 0;
      column.bank = bank;
      rockBlock(x0, x1, faces[0]!.top - 0.5, bank, L.pathBack, {
        rng: drop,
        relief: 0.5,
        green: 0.3,
      });
      if (bank > 0) parts.push(...spruce([xm, bank, L.pathBack + 3 + drop() * 4], 6 + drop() * 6));
    }
    if (grazed && faces[1]) {
      // The pasture: grass on the shelf.
      const z0 = faces[1].front + DROP_RELIEF + 0.2;
      const z1 = faces[0]!.front + 0.3;
      parts.push(
        scenery(box("foliage", [xm, L.foot, (z0 + z1) / 2], [x1 - x0 - 0.4, 0.05, z1 - z0])),
      );
    }
  }
  /*
   * Ribs of rock standing out of the face where two columns meet, as the
   * rock splits along its joints: they break the line of every shelf, so no
   * step runs straight along the mountain like a course of masonry.
   */
  for (let i = 0; i + 1 < columns.length; i += 1) {
    const a = columns[i]!;
    const b = columns[i + 1]!;
    const x = a.x1 + (drop() - 0.5) * 2;
    const under = x > courtLeft - 2 && x < rangeRight + 2;
    const levels = Math.min(a.faces.length, b.faces.length);
    for (let k = under ? 2 : 0; k < levels; k += 1) {
      if (drop() < 0.4) continue;
      const fa = a.faces[k]!;
      const fb = b.faces[k]!;
      const below = Math.max(a.faces[k + 1]?.top ?? L.valley, b.faces[k + 1]?.top ?? L.valley);
      const top = Math.min(fa.top, fb.top) - 0.5 - drop() * 5;
      const w = 3.5 + drop() * 3;
      rockBlock(
        x - w / 2,
        x + w / 2,
        Math.max(L.valley, below - 1),
        top,
        Math.min(fa.front, fb.front) - 0.6,
        {
          rng: drop,
          scrub: true,
          relief: 1.6,
          green: 0.08,
          back: Math.max(fa.front, fb.front) + 4,
        },
      );
    }
  }

  /*
   * The two ends of the mountain as modelled: the side of the cliff, of the
   * crag over the path and of the drop, each a face of rock of its own
   * looking out along the valley rather than the plain side of a block.
   */
  const endFace = (x: number, outward: 1 | -1, za: number, zb: number, y0: number, top: number) =>
    rockBlock(x - (zb - za) / 2, x + (zb - za) / 2, y0, top, (za + zb) / 2 - DROP_RELIEF, {
      rng: drop,
      scrub: true,
      relief: DROP_RELIEF,
      green: 0.03,
      turn: (-outward * Math.PI) / 2,
      back: (za + zb) / 2 - DROP_RELIEF + 8,
    });
  const westmost = columns[0]!;
  const eastmost = columns[columns.length - 1]!;
  const crag = columns.find((c) => c.x0 < -112 && c.x1 > -120);
  endFace(-112, -1, cliff + 2, back, crag ? crag.bank : 0, heightAt(-112));
  endFace(112, 1, cliff + 2, back, ledgeTop(112), heightAt(112));
  if (crag && crag.bank > 0)
    endFace(crag.x0, -1, L.pathBack + 1, back, crag.faces[0]!.top, crag.bank);
  endFace(westmost.x0, -1, westmost.faces[0]!.front + 3, back, L.valley, westmost.faces[0]!.top);
  endFace(eastmost.x1, 1, eastmost.faces[0]!.front + 3, back, L.valley, eastmost.faces[0]!.top);
  // Spruce on the broad tops of the two ends, where the mountainside runs on into forest.
  for (const c of [westmost, eastmost])
    for (let k = 0; k < 5; k += 1)
      parts.push(
        ...spruce(
          [
            c.x0 + 3 + drop() * (c.x1 - c.x0 - 6),
            c.faces[0]!.top,
            c.faces[0]!.front + 6 + drop() * 30,
          ],
          9 + drop() * 8,
        ),
      );

  /* ---- the valley floor and the Altındere ---- */
  // The stream along the floor of the valley, below the forest at the foot of the rock.
  parts.push(scenery(box("water", [-20, L.valley - 0.15, -64], [340, 0.4, 6.5], 0.035)));

  /* ---- the court before the cave, on its platform ---- */
  // The platform the court stands on: masonry from the rock below the ledge up.
  parts.push(
    box(
      "stone",
      [(courtLeft + caveRight) / 2, L.foot, (courtFront + caveBack) / 2],
      [caveRight - courtLeft, C - 0.1 - L.foot, caveBack - courtFront],
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
  // Below the ledge the retaining wall goes on down to the rock, coarser, with buttresses.
  parts.push(...retaining((courtLeft + rangeLeft) / 2, courtFront, rangeLeft - courtLeft));
  for (const x of [courtLeft + 6, courtLeft + 17]) parts.push(...buttress(x, courtFront, C - 1));
  // A parapet along the court's open edge, and along its west end behind the
  // gate: chest-high, over a drop of twenty-odd metres to the rock.
  parts.push(
    box(
      "stone",
      [(courtLeft + rangeLeft) / 2, C, courtFront + 0.25],
      [rangeLeft - courtLeft, PARAPET, 0.5],
    ),
  );
  parts.push(box("stone", [courtLeft + 0.25, C, 0.7], [0.5, PARAPET, 4.6]));

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
    parts.push(box("stone", [x, L.foot, (front + cliff) / 2], [w, C - L.foot, cliff - front]));
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
    parts.push(...retaining(x, front, w));
    // Slit windows lighting the cellars in the substructure, and the stores under them.
    for (let k = 0; k < Math.floor(w / 4); k += 1)
      for (const y of [C * 0.55, L.foot + 7])
        parts.push(box("shadow", [sec.x0 + 2 + k * 4, y, front - 0.02], [0.3, 0.9, 0.04]));
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

  // Buttresses against the range's substructure, where its sections meet and at its ends.
  for (const t of [0, 0.4, 0.75, 1])
    parts.push(
      ...buttress(
        Math.min(rangeRight - 1, Math.max(rangeLeft + 1, rangeLeft + spec.rangeLength * t)),
        rangeFront,
        C - 1,
      ),
    );

  /* ---- the stair and the gate ---- */
  // Up from the path along the ledge, along the foot of the court's platform.
  const gateX = courtLeft - 4;
  const gateZ = courtFront + 2;
  const steps = Math.round((C + 1.2) / 0.2);
  for (let i = 0; i < steps; i += 1) {
    const h = 0.2 * (i + 1);
    parts.push(box("stone", [gateX - 0.36 * (steps - i) + 0.18, 0, gateZ], [0.36, h, 2.4]));
  }
  // Its side walls, stepping up with it a few treads at a time.
  for (let i0 = 0; i0 < steps; i0 += 6) {
    const i1 = Math.min(steps, i0 + 6);
    const xa = gateX - 0.36 * (steps - i0);
    const xb = gateX - 0.36 * (steps - i1);
    for (const s of [-1, 1])
      parts.push(
        box("stone", [(xa + xb) / 2, 0, gateZ + s * 1.4], [xb - xa, 0.2 * i1 + PARAPET, 0.4]),
      );
  }
  // The landing at the top, the gatehouse over it, and steps down into the court.
  parts.push(box("stone", [gateX + 2, 0, gateZ], [4, C + 1.2, 4.8]));
  for (const s of [-1, 1])
    parts.push(box("stone", [gateX + 2, C + 1.2, gateZ + s * 2.1], [4, 4.2, 0.6]));
  parts.push(box("stone", [gateX + 2, C + 5.4, gateZ], [4.2, 0.5, 4.9]));
  parts.push(prism("terracotta", [gateX + 2, C + 5.9, gateZ], [5.2, 1.2, 4.6], Math.PI / 2));
  for (let i = 0; i < 6; i += 1)
    parts.push(box("stone", [courtLeft + 0.18 + i * 0.36, C, gateZ], [0.36, 1.2 - i * 0.2, 2.6]));

  /* ---- the path along the slope ---- */
  /*
   * The way in comes along the mountainside from the west: level along the
   * ledge, under the aqueduct, to the foot of the stair, and before that
   * down across the face on a terrace built out from the rock — a parapet
   * on the ledge, a timber rail where it hangs over the drop.
   */
  const pathMid = (L.pathFront + L.pathBack) / 2;
  const pathWidth = L.pathBack - L.pathFront;
  const stairFoot = gateX - 0.36 * steps;
  parts.push(
    box(
      "ground",
      [(L.pathTurn + stairFoot) / 2, 0, pathMid],
      [stairFoot - L.pathTurn, 0.05, pathWidth],
    ),
  );
  parts.push(
    box(
      "stone",
      [(L.pathTurn + gateX) / 2, 0, L.pathFront - 0.2],
      [gateX - L.pathTurn, PARAPET, 0.4],
    ),
  );
  const grade = Math.atan(PATH_GRADE);
  const run = 8;
  for (let x = L.pathTurn; x > L.pathEnd + 0.1; x -= run) {
    const xm = x - run / 2;
    const y = pathLevel(L, xm);
    const length = run / Math.cos(grade) + 0.3;
    // The built terrace, and the trodden earth on it.
    const slab = (material: "stone" | "ground", depth: number, width: number, z: number, up = 0) =>
      scenery({
        ...box(
          material,
          [xm, y + up - depth / Math.cos(grade), z],
          [width, depth, length],
          Math.PI / 2,
        ),
        rotX: -grade,
      });
    parts.push(slab("stone", 5, pathWidth + 0.3, pathMid - 0.15));
    parts.push(slab("ground", 0.05, pathWidth - 0.1, pathMid, 0.02));
    // The rail on the drop side, on its posts.
    parts.push(
      scenery({
        ...box(
          "timber",
          [xm, y + PARAPET - 0.09, L.pathFront + 0.12],
          [0.09, 0.09, length],
          Math.PI / 2,
        ),
        rotX: -grade,
      }),
    );
    for (const u of [0, 0.34, 0.67]) {
      const px = x - run * u - 0.1;
      parts.push(
        scenery(
          box(
            "timber",
            [px, pathLevel(L, px) - 0.1, L.pathFront + 0.12],
            [0.12, PARAPET + 0.1, 0.12],
          ),
        ),
      );
    }
  }
  // Where it comes up out of the forest at the foot of the face.
  parts.push(
    scenery(
      box(
        "stone",
        [L.pathEnd - 0.2, pathLevel(L, L.pathEnd) - 0.4, pathMid],
        [0.4, PARAPET + 0.4, pathWidth],
      ),
    ),
  );

  /* ---- the aqueduct along the cliff ---- */
  const n = spec.aqueductArches;
  const span = 5.2;
  const pier = 1.5;
  const channel = C + 9;
  const aqRight = courtLeft - 9;
  const aqZ = cliff - 1.8;
  for (let i = 0; i <= n; i += 1) {
    const x = aqRight - i * (span + pier);
    // Each pier runs up to the channel, carrying the arches either side of it.
    parts.push(box("stone", [x, 0, aqZ], [pier, channel, 1.6]));
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

/**
 * The lower part of a retaining wall, from the ledge down to the rock it
 * stands on: plainer, bigger stones than above, laid in courses.
 */
function retainingWall(x: number, face: number, length: number, foot: number): Part[] {
  return ashlar({
    at: [x, foot, face],
    rotY: FACING.south,
    length,
    height: -foot,
    material: "stone",
    course: 1.1,
    foot: false,
    coping: false,
  });
}

/**
 * A buttress against a retaining wall: three set-offs stepping back as it
 * rises from the rock, each capped with a slab of paler stone.
 */
function buttressAt(x: number, face: number, foot: number, top: number): Part[] {
  const parts: Part[] = [];
  let y = foot;
  for (const [share, depth, width] of [
    [0.4, 3.0, 2.0],
    [0.72, 2.1, 1.8],
    [1, 1.2, 1.6],
  ] as const) {
    const y1 = foot + (top - foot) * share;
    // Built a metre and a half into the wall, so where the wall steps back it still meets it.
    parts.push(box("stone", [x, y, face - depth / 2 + 0.75], [width, y1 - y, depth + 1.5]));
    parts.push(
      box("limestone", [x, y1 - 0.19, face - depth / 2 + 0.7], [width + 0.1, 0.25, depth + 1.5]),
    );
    y = y1;
  }
  return parts;
}

/** A spruce on a rock shelf: a trunk and two tiers of branches, light enough to plant by the dozen. */
function spruce(at: Vec3, height: number): Part[] {
  const [x, y, z] = at;
  return [
    scenery(cyl("timber", at, height * 0.03, height * 0.02, height * 0.3, 4)),
    scenery(
      cyl("foliage", [x, y + height * 0.15, z], height * 0.2, height * 0.07, height * 0.5, 5),
    ),
    scenery(cyl("foliage", [x, y + height * 0.45, z], height * 0.14, 0.02, height * 0.55, 5)),
  ];
}
