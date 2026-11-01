import { ashlar, FACING } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitCyl as cyl,
  kitPrism as prism,
  kitScenery as scenery,
  kitSeeded as seeded,
  kitSetting as setting,
  kitWorn as worn,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { arch } from "@/lib/models/craft";
import type { RockFace } from "@/lib/models/rockface";
import { hittiteLion } from "@/lib/models/hattusa-aslanli-kapi";

/* ================================================================== *
 * An aqueduct bridge with its pressure towers (Aspendos)
 * ================================================================== */

/**
 * The siphon bridge of the Aspendos aqueduct: a long arcade carrying the
 * stone pressure pipe across the plain, and at each bend a square tower
 * the water rose up and fell down again to vent the pipe.
 * Model axes: the arcade runs along x.
 */
export type AqueductSpec = {
  kind: "aqueduct";
  /** Cited. */
  arches: number;
  archHeight: number;
  towerSide: number;
  towerHeight: number;
  /** Modelled. */
  span: number;
  pier: number;
  width: number;
};

export function aqueductLayout(spec: AqueductSpec) {
  const bay = spec.span + spec.pier;
  const length = spec.arches * bay + spec.pier;
  const x0 = -length / 2;
  /** The road through the plain passes under the thirteenth arch. */
  const road = x0 + spec.pier + spec.span / 2 + 12 * bay;
  return { bay, length, x0, x1: length / 2, road };
}

export function aqueductParts(spec: AqueductSpec): Part[] {
  const parts: Part[] = [];
  const L = aqueductLayout(spec);
  const W = spec.width;
  const H = spec.archHeight;
  parts.push(
    ...setting(L.length / 2 + 20, 2251, {
      hills: 0.7,
      stone: 0.4,
      grass: 1.1,
      ground: "limestone",
    }),
  );
  // The piers, each with an offset at the springing; the arches between; the
  // solid course over them carrying the pipe.
  const r = spec.span / 2;
  const spring = H - r - 1.6;
  for (let i = 0; i <= spec.arches; i += 1) {
    const x = L.x0 + spec.pier / 2 + i * L.bay;
    parts.push(worn(box("limestone", [x, 0, 0], [spec.pier, spring, W]), 0.03));
    parts.push(box("limestone", [x, spring - 0.3, 0], [spec.pier + 0.3, 0.3, W + 0.3]));
  }
  for (let i = 0; i < spec.arches; i += 1) {
    const x = L.x0 + spec.pier + r + i * L.bay;
    parts.push(...arch("limestone", [x, spring, 0], r, 0.7, W, 11, false));
  }
  parts.push(box("limestone", [0, spring + r, 0], [L.length, H - spring - r, W]));
  for (const s of [-1, 1])
    parts.push(
      ...ashlar({
        at: [0, spring + r, s * (W / 2)],
        rotY: s > 0 ? FACING.north : FACING.south,
        length: L.length,
        height: H - spring - r,
        material: "limestone",
        course: 0.5,
        blocks: 1.1,
        coping: true,
      }),
    );
  // The pipe of stone blocks on top, bored through, joined end to end.
  for (let x = L.x0 + 0.6; x < L.x1; x += 1.2)
    parts.push(box("stone", [x, H, 0], [1.15, 0.9, 1.0]));
  // The two towers at the ends, the pipe climbing them in a ramp, a basin on top.
  const T = spec.towerSide;
  for (const s of [-1, 1]) {
    const x = s * (L.length / 2 + T / 2);
    parts.push(worn(box("limestone", [x, 0, 0], [T, spec.towerHeight, T]), 0.03));
    for (const [rotY, out] of [
      [FACING.south, -T / 2],
      [FACING.north, T / 2],
    ] as const)
      parts.push(
        ...ashlar({
          at: [x, 0, out],
          rotY,
          length: T,
          height: spec.towerHeight,
          material: "limestone",
          course: 0.55,
          blocks: 1.0,
          coping: false,
        }),
      );
    parts.push(box("limestone", [x, spec.towerHeight, 0], [T + 0.4, 0.4, T + 0.4]));
    parts.push(box("water", [x, spec.towerHeight + 0.05, 0], [T - 1.2, 0.28, T - 1.2]));
    // Arched openings through the tower at its foot, and windows up it.
    parts.push(box("shadow", [x, 0, -T / 2 - 0.09], [2.2, 4.6, 0.02]));
    for (const y of [10, 18, 25])
      parts.push(box("shadow", [x, y, -T / 2 - 0.09], [0.8, 1.6, 0.02]));
    // The ramp of the pipe up the outer side of the tower.
    const steps = 12;
    for (let k = 0; k < steps; k += 1) {
      const y = H + ((spec.towerHeight - H) * k) / steps;
      parts.push(box("stone", [x + s * (T / 2 + 1.5 + (steps - k) * 1.6), 0, 0], [1.7, y, 1.4]));
    }
  }
  // The road through the plain, under the arches.
  parts.push(scenery(box("ground", [L.road, -0.1, 0], [3.2, 0.12, 120], 0)));
  return parts;
}

export function aqueductWalkStart(spec: AqueductSpec): WalkStart {
  const L = aqueductLayout(spec);
  return { at: [L.road, -22], floor: 0, look: [L.road + L.bay * 8, spec.archHeight * 0.6, 0] };
}

/* ================================================================== *
 * An underground city, cut open (Derinkuyu)
 * ================================================================== */

/**
 * The underground city of Derinkuyu, drawn as a cut through the hill: the
 * village on top, and under it the levels hollowed out of the soft tuff —
 * stables and wine presses near the top, store rooms and dwellings below, the
 * church on the lowest — joined by stairs and sloping passages, closed by
 * rolling stone doors, and the central shaft that brought air and water
 * down through all of them. The section is drawn standing out of the plain,
 * the way a museum model is: the hill's surface is the village street.
 */
export type UndergroundSpec = {
  kind: "underground-city";
  /** Cited. */
  depth: number;
  levels: number;
  shaftDepth: number;
  shaftWidth: number;
  shaftLength: number;
  /** Modelled. */
  width: number;
  thickness: number;
};

export function undergroundLayout(spec: UndergroundSpec) {
  const top = spec.depth;
  const step = (spec.depth - 4) / spec.levels;
  /** The floor of each level, top first, and the height of its rooms. */
  const levels = Array.from({ length: spec.levels }, (_, i) => ({
    y: top - step * (i + 1),
    h: i === spec.levels - 1 ? 5.2 : 2.8,
  }));
  const face = -spec.thickness / 2;
  /** How far back into the hill the rooms run from the cut. */
  const room = 6;
  const shaftX = spec.width * 0.18;
  return { top, step, levels, face, room, shaftX };
}

/** The rooms of one level, as x ranges between the walls left standing. */
export function undergroundRooms(spec: UndergroundSpec, level: number) {
  const W = spec.width;
  const n = 4 + (level % 2);
  const walls = Array.from({ length: n + 1 }, (_, k) => -W / 2 + 1 + (k * (W - 2)) / n);
  return walls.slice(0, -1).map((x, k) => ({ x0: x + 0.6, x1: walls[k + 1]! - 0.6 }));
}

export function undergroundParts(spec: UndergroundSpec): Part[] {
  const parts: Part[] = [];
  const L = undergroundLayout(spec);
  const W = spec.width;
  const D = spec.thickness;
  const z0 = L.face;
  const zr = L.face + L.room;
  parts.push(
    ...setting(Math.max(50, W), 1923, { hills: 1.2, stone: 0.6, grass: 0.5, ground: "limestone" }),
  );
  // The body of tuff behind the rooms, rough on its sides and back.
  const rough: RockFace = { relief: 1.2, seed: 1923, ledges: [], strata: 0.9 };
  parts.push({ ...box("sand", [0, 0, (zr + D / 2) / 2], [W, L.top, D / 2 - zr]), rock: rough });
  // In front of it, the cut: solid bands of tuff between the levels, split
  // either side of the air shaft that runs down through them.
  const sx0 = L.shaftX - spec.shaftWidth / 2;
  const sx1 = L.shaftX + spec.shaftWidth / 2;
  const shaftFoot = L.top - spec.shaftDepth;
  const band = (y0: number, y1: number) => {
    if (y1 - y0 < 0.05) return;
    const pieces: [number, number][] =
      y1 > shaftFoot + 0.01
        ? [
            [-W / 2, sx0],
            [sx1, W / 2],
          ]
        : [[-W / 2, W / 2]];
    if (y1 > shaftFoot + 0.01 && y0 < shaftFoot - 0.01) {
      band(y0, shaftFoot);
      band(shaftFoot, y1);
      return;
    }
    for (const [a, b] of pieces)
      parts.push(box("sand", [(a + b) / 2, y0, (z0 + zr) / 2], [b - a, y1 - y0, L.room]));
  };
  let ceiling = L.top;
  for (const lv of L.levels) {
    band(lv.y + lv.h, ceiling);
    ceiling = lv.y;
  }
  band(0, ceiling);
  // The rooms of each level: walls of tuff left standing between them, a
  // dark doorway at the back of each room into the passages, a rolling stone
  // door by the stair.
  L.levels.forEach((lv, i) => {
    const rooms = undergroundRooms(spec, i);
    const edges = [-W / 2, ...rooms.flatMap((r) => [r.x0, r.x1]), W / 2];
    for (let k = 0; k < edges.length; k += 2) {
      const a = edges[k]!;
      const b = edges[k + 1]!;
      // Not across the shaft: it stays open the whole way down.
      if (lv.y < shaftFoot || b < sx0 || a > sx1)
        parts.push(box("sand", [(a + b) / 2, lv.y, (z0 + zr) / 2], [b - a, lv.h, L.room]));
      else {
        if (sx0 - a > 0.05)
          parts.push(box("sand", [(a + sx0) / 2, lv.y, (z0 + zr) / 2], [sx0 - a, lv.h, L.room]));
        if (b - sx1 > 0.05)
          parts.push(box("sand", [(sx1 + b) / 2, lv.y, (z0 + zr) / 2], [b - sx1, lv.h, L.room]));
      }
    }
    for (const r of rooms) {
      const w = r.x1 - r.x0;
      parts.push(
        box(
          "shadow",
          [(r.x0 + r.x1) / 2, lv.y, zr - 0.02],
          [Math.min(1.2, w * 0.4), Math.min(1.9, lv.h - 0.3), 0.04],
        ),
      );
    }
    const door = rooms[0]!;
    parts.push(
      cyl("stone", [door.x1 - 0.5, lv.y, zr - 0.45], 0.85, 0.85, 0.5, 18, { rotX: Math.PI / 2 }),
    );
  });
  // The stairs and sloping tunnels between the levels, seen in section: a
  // run of dark openings stepping down through the rock from one level's
  // floor to the ceiling of the next, alternately left and right.
  L.levels.slice(0, -1).forEach((lv, i) => {
    const next = L.levels[i + 1]!;
    const dir = i % 2 ? -1 : 1;
    const xa = dir * (W / 2 - 4);
    const xb = dir * (W / 2 - 16);
    const ya = lv.y - 0.2;
    const yb = next.y + next.h + 1.6;
    const n = Math.max(6, Math.round((ya - yb) / 1.1));
    for (let k = 0; k <= n; k += 1) {
      const t = k / n;
      parts.push(
        box("shadow", [xa + (xb - xa) * t, ya + (yb - ya) * t - 1.4, z0 - 0.02], [1.3, 1.6, 0.04]),
      );
    }
  });
  // The cut runs on either side as a face of bare tuff, the hill over it
  // (the landscape climbs to the top of the cut: see \`fallFor\`).
  for (const sd of [-1, 1])
    parts.push(
      scenery({
        ...box("sand", [sd * (W / 2 + 45), 0, z0 + 7], [90, L.top, 14]),
        rock: {
          relief: 1.6,
          seed: 1930 + (sd > 0 ? 10 : 0),
          ledges: [L.top * 0.3, L.top * 0.62],
          strata: 1,
          scree: 0.5,
        },
      }),
    );
  // The shaft's back and the light at its foot.
  parts.push(
    box("shadow", [L.shaftX, shaftFoot, zr - 0.02], [spec.shaftWidth, spec.shaftDepth, 0.04]),
  );
  // The village on the surface: low houses of cut tuff with flat roofs, and
  // the kerb round the mouth of the shaft.
  const random = seeded(85);
  for (let i = 0; i < 6; i += 1) {
    const x = -W / 2 + 5 + i * ((W - 10) / 5);
    if (Math.abs(x - L.shaftX) < 5) continue;
    const w = 4 + random() * 2.5;
    parts.push(
      box("sand", [x, L.top, zr + 6 + random() * 4], [w, 3 + random() * 1.6, 5 + random() * 2]),
    );
  }
  for (const e of [-1, 1])
    parts.push(
      box(
        "sand",
        [L.shaftX + e * (spec.shaftWidth / 2 + 0.3), L.top, z0 + 0.4 + spec.shaftLength / 2],
        [0.6, 0.8, spec.shaftLength],
      ),
    );
  return parts;
}

export function undergroundWalkStart(spec: UndergroundSpec): WalkStart {
  const L = undergroundLayout(spec);
  return { at: [3, L.face - 34], floor: 0, look: [0, spec.depth * 0.45, L.face] };
}

/* ================================================================== *
 * Rock churches in the fairy chimneys (Göreme)
 * ================================================================== */

/**
 * A valley of fairy chimneys, cones of soft tuff under caps of harder rock,
 * with churches and chapels cut into them: a carved front with a door and
 * windows, a blind arcade, and inside, out of sight, the frescoed nave.
 */
export type RockChurchSpec = {
  kind: "rock-churches";
  /** Modelled. */
  chimneys: number;
  churches: number;
  height: number;
  valleyWidth: number;
};

export function rockChurchLayout(spec: RockChurchSpec) {
  const random = seeded(1104);
  const cones: {
    x: number;
    z: number;
    h: number;
    r: number;
    church: boolean;
    /** How far the top leans over, and which way: no two chimneys stand alike. */
    lean: [number, number];
    /** Worn round, its hard cap fallen; and a smaller twin grown into its side. */
    capped: boolean;
    twin: number;
  }[] = [];
  for (let i = 0; i < spec.chimneys; i += 1) {
    const side = i % 2 ? 1 : -1;
    const x =
      -spec.valleyWidth * 1.4 + (i * spec.valleyWidth * 2.8) / spec.chimneys + (random() - 0.5) * 4;
    const z = side * (spec.valleyWidth / 2 + random() * 8);
    const h = spec.height * (0.6 + random() * 0.6);
    cones.push({
      x,
      z,
      h,
      r: h * (0.21 + random() * 0.06),
      church: i < spec.churches * 2 && i % 2 === 0,
      lean: [(random() - 0.5) * h * 0.14, side * random() * h * 0.08],
      capped: random() > 0.3,
      twin: random() > 0.55 ? 0.45 + random() * 0.25 : 0,
    });
  }
  return cones;
}

export function rockChurchParts(spec: RockChurchSpec): Part[] {
  const parts: Part[] = [];
  parts.push(...setting(55, 1104, { hills: 1.4, stone: 0.8, grass: 0.6, ground: "limestone" }));
  for (const c of rockChurchLayout(spec)) {
    // The cone in three tapering drums, its dark cap of basalt on top.
    const h1 = c.h * 0.45;
    const [lx, lz] = c.lean;
    parts.push(worn(cyl("sand", [c.x, 0, c.z], c.r * 1.25, c.r, h1, 24), 0.25));
    parts.push(
      worn(cyl("sand", [c.x + lx * 0.4, h1, c.z + lz * 0.4], c.r, c.r * 0.6, c.h * 0.35, 20), 0.2),
    );
    parts.push(
      worn(
        cyl(
          "sand",
          [c.x + lx * 0.8, h1 + c.h * 0.35, c.z + lz * 0.8],
          c.r * 0.6,
          c.capped ? c.r * 0.32 : c.r * 0.08,
          c.h * 0.2,
          16,
        ),
        0.12,
      ),
    );
    if (c.capped)
      parts.push(
        worn(
          cyl("stoneDark", [c.x + lx, c.h, c.z + lz], c.r * 0.55, c.r * 0.45, c.r * 0.35, 12),
          0.08,
        ),
      );
    if (c.twin) {
      // A smaller chimney grown out of its flank, on the side away from the valley.
      const t = c.twin;
      const tx = c.x + (lx > 0 ? -1 : 1) * c.r * 0.9;
      const tz = c.z + Math.sign(c.z) * c.r * 0.7;
      parts.push(worn(cyl("sand", [tx, 0, tz], c.r * t * 1.2, c.r * t * 0.5, c.h * t, 18), 0.2));
      parts.push(
        worn(
          cyl("stoneDark", [tx, c.h * t, tz], c.r * t * 0.55, c.r * t * 0.4, c.r * t * 0.3, 10),
          0.06,
        ),
      );
    }
    // Pigeon-holes and the windows of rooms cut high in it.
    for (let k = 0; k < 5; k += 1) {
      const a = (k / 5) * Math.PI * 2 + c.x;
      const y = h1 + 1 + k * 1.1;
      const rr = c.r * (1 - ((y - h1) / (c.h * 0.35)) * 0.4) - 0.02;
      parts.push(
        box("shadow", [c.x + Math.sin(a) * rr, y, c.z + Math.cos(a) * rr], [0.45, 0.6, 0.04], a),
      );
    }
    if (c.church) {
      // The carved front towards the valley: an arched door, two windows, a
      // blind arcade over them and a cross cut in the rock.
      const out = c.z > 0 ? -1 : 1;
      const fz = c.z + out * (c.r * 1.25 + 0.05);
      const rot = out < 0 ? FACING.south : FACING.north;
      parts.push(box("sand", [c.x, 0, fz - out * 1.0], [5.4, 6.4, 2.0], rot));
      parts.push(box("shadow", [c.x, 0, fz + out * 0.01], [1.3, 2.4, 0.02], rot));
      for (const e of [-1, 1])
        parts.push(box("shadow", [c.x + e * 1.6, 2.6, fz + out * 0.01], [0.5, 0.8, 0.02], rot));
      for (let k = 0; k < 4; k += 1)
        parts.push(
          box("sand", [c.x - 1.8 + k * 1.2, 4.2, fz + out * 0.08], [0.25, 1.6, 0.14], rot),
        );
      parts.push(box("sand", [c.x, 5.8, fz + out * 0.08], [5.2, 0.3, 0.16], rot));
      parts.push(box("paintRed", [c.x, 4.6, fz + out * 0.03], [0.12, 0.8, 0.02], rot));
      parts.push(box("paintRed", [c.x, 5.0, fz + out * 0.03], [0.5, 0.12, 0.02], rot));
    }
  }
  // The path along the valley floor.
  parts.push(scenery(box("ground", [0, -0.08, 0], [spec.valleyWidth * 2.8, 0.1, 3.4])));
  return parts;
}

export function rockChurchWalkStart(spec: RockChurchSpec): WalkStart {
  return {
    at: [-spec.valleyWidth * 0.3, 0],
    floor: 0,
    look: [spec.valleyWidth * 0.4, spec.height * 0.4, 0],
  };
}

/* ================================================================== *
 * A Seljuk mosque and hospital with carved portals (Divriği)
 * ================================================================== */

/**
 * The Great Mosque and Hospital of Divriği: one block of cut stone, the
 * mosque and the hospital side by side, a pyramid roof over the dome before
 * the mihrab, and portals carved deep with vegetal and geometric ornament —
 * the north portal of the mosque standing far out of the wall.
 * Model axes: the north portal looks -z.
 */
export type SeljukSpec = {
  kind: "seljuk-complex";
  /** Cited. */
  portals: number;
  /** Modelled. */
  length: number;
  depth: number;
  wallHeight: number;
  portalHeight: number;
};

/** A portal carved deep: a frame of mouldings, ornament standing out of it, a niche and the door. */
function portal(at: Vec3, out: -1 | 1, w: number, h: number, rich: boolean): Part[] {
  const parts: Part[] = [];
  const [x, , z] = at;
  const rot = out < 0 ? FACING.south : FACING.north;
  const p = (dx: number, dz: number): Vec3 => [x + dx, 0, z + out * dz];
  // The frame stands out of the wall; the niche is a real recess in it, its
  // back the wall itself, closed at the top by a hood of stalactite tiers.
  const nw = w * 0.5;
  const nh = h * 0.7;
  for (const e of [-1, 1])
    parts.push(box("limestone", p(e * (nw / 2 + (w - nw) / 4), 0.9), [(w - nw) / 2, h, 1.8], rot));
  parts.push(box("limestone", [x, nh, z + out * 0.9], [nw, h - nh, 1.8], rot));
  // The muqarnas hood: rows of little cells stepping out and in across the top.
  for (let row = 0; row < 4; row += 1) {
    const cells = 3 + row * 2;
    const y = nh - 0.55 * (row + 1);
    const depth = 1.8 - row * 0.4;
    for (let k = 0; k < cells; k += 1) {
      const cx = x - nw / 2 + (nw * (k + 0.5)) / cells;
      parts.push(
        box(
          "limestone",
          [cx, y, z + out * (0.9 + (1.8 - depth) / 2 + (k % 2) * 0.12)],
          [nw / cells - 0.06, 0.5, depth],
          rot,
        ),
      );
    }
  }
  // The door at the back of the niche.
  parts.push(box("timber", [x, 0, z + out * 0.14], [w * 0.22, h * 0.32, 0.1], rot));
  parts.push(box("shadow", [x, h * 0.32, z + out * 0.12], [w * 0.22, 0.4, 0.04], rot));
  // Bands of ornament round the niche, standing out further the richer it is.
  const rings = rich ? 5 : 3;
  for (let k = 0; k < rings; k += 1) {
    const ww = w * (0.56 + k * 0.08);
    const hh = h * (0.74 + k * 0.04);
    const depth = 0.1 + (rich ? 0.15 * (k % 2) : 0.05);
    for (const e of [-1, 1])
      parts.push(
        box(
          "limestone",
          [x + e * (ww / 2), 0, z + out * (1.8 + depth / 2)],
          [0.22, hh, depth],
          rot,
        ),
      );
    parts.push(
      box("limestone", [x, hh, z + out * (1.8 + depth / 2)], [ww + 0.22, 0.22, depth], rot),
    );
  }
  if (rich)
    // The great bosses and palmettes that stand out of the north portal.
    for (const [dx, y] of [
      [-w * 0.33, h * 0.55],
      [w * 0.33, h * 0.55],
      [-w * 0.33, h * 0.3],
      [w * 0.33, h * 0.3],
      [0, h * 0.88],
    ] as const) {
      parts.push(
        cyl("limestone", [x + dx, y, z + out * 2.0], 0.6, 0.45, 0.5, 12, {
          rotX: (out * Math.PI) / 2,
        }),
      );
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        parts.push(
          box(
            "limestone",
            [x + dx + Math.cos(a) * 0.75, y + Math.sin(a) * 0.75, z + out * 1.95],
            [0.22, 0.36, 0.3],
            rot,
          ),
        );
      }
    }
  return parts;
}

export function seljukParts(spec: SeljukSpec): Part[] {
  const parts: Part[] = [];
  const Lx = spec.length;
  const D = spec.depth;
  const H = spec.wallHeight;
  parts.push(...setting(40, 1228, { hills: 1.6, stone: 0.8, grass: 0.6, ground: "limestone" }));
  parts.push(box("limestone", [0, 0, 0], [Lx, H, D]));
  for (const [rotY, length, ox, oz] of [
    [FACING.south, Lx, 0, -D / 2],
    [FACING.north, Lx, 0, D / 2],
    [FACING.west, D, -Lx / 2, 0],
    [FACING.east, D, Lx / 2, 0],
  ] as const)
    parts.push(
      ...ashlar({
        at: [ox, 0, oz],
        rotY,
        length,
        height: H,
        material: "limestone",
        course: 0.42,
        blocks: 0.9,
        coping: true,
        foot: true,
      }),
    );
  // Small windows high in the walls.
  for (let i = 0; i < 9; i += 1) {
    const x = -Lx / 2 + 4 + i * ((Lx - 8) / 8);
    parts.push(box("shadow", [x, H * 0.62, -D / 2 - 0.02], [0.7, 1.3, 0.04]));
  }
  // The roof: flat, with the pyramid roof over the mihrab dome, and the
  // little octagonal lantern over the hospital's court.
  parts.push(box("stoneDark", [0, H, 0], [Lx - 0.2, 0.3, D - 0.2]));
  parts.push(cyl("limestone", [Lx * 0.12, H + 0.3, D * 0.2], 5.2, 5.2, 3.2, 8));
  parts.push(cyl("stoneDark", [Lx * 0.12, H + 3.5, D * 0.2], 5.8, 0.1, 5.4, 8));
  parts.push(cyl("limestone", [-Lx * 0.3, H + 0.3, 0], 3.2, 3.2, 2.2, 8));
  parts.push(cyl("stoneDark", [-Lx * 0.3, H + 2.5, 0], 3.6, 0.1, 3.0, 8));
  // The minaret at the north-west corner of the mosque.
  parts.push(box("limestone", [Lx * 0.42, H, -D / 2 + 2], [3, 2.4, 3]));
  parts.push(cyl("limestone", [Lx * 0.42, H + 2.4, -D / 2 + 2], 1.2, 1.0, 9, 12));
  parts.push(cyl("stoneDark", [Lx * 0.42, H + 11.4, -D / 2 + 2], 1.3, 0.05, 2.6, 12));
  // The portals: the north one of the mosque, rich; the west of the mosque;
  // the hospital's on the west front, under its great pointed arch.
  const ph = spec.portalHeight;
  const all: [Vec3, -1 | 1, number, number, boolean][] = [
    [[Lx * 0.18, 0, -D / 2], -1, 11, ph, true],
    [[Lx * 0.42, 0, D / 2], 1, 7, ph * 0.75, false],
    [[-Lx * 0.3, 0, -D / 2], -1, 9, ph * 0.9, true],
    [[-Lx * 0.05, 0, D / 2], 1, 6, ph * 0.65, false],
  ];
  all
    .slice(0, spec.portals)
    .forEach(([at, out, w, h, rich]) => parts.push(...portal(at, out, w, h, rich)));
  return parts;
}

export function seljukWalkStart(spec: SeljukSpec): WalkStart {
  return {
    at: [spec.length * 0.08, -spec.depth / 2 - 14],
    floor: 0,
    look: [spec.length * 0.18, spec.portalHeight * 0.5, -spec.depth / 2],
  };
}

/* ================================================================== *
 * A temple and palace complex of mud brick (Arslantepe)
 * ================================================================== */

/**
 * The public buildings on top of the mound at Arslantepe at the end of the
 * 4th millennium BC: two temples on terraces, a corridor with painted walls,
 * store rooms where the clay sealings were found, all of mud brick on stone
 * footings, plastered and whitewashed, with flat roofs of timber and earth.
 */
export type MudbrickSpec = {
  kind: "mudbrick-complex";
  /** Cited. */
  buildings: number;
  /** Modelled. */
  wallHeight: number;
  terrace: number;
};

export function mudbrickParts(spec: MudbrickSpec): Part[] {
  const parts: Part[] = [];
  const H = spec.wallHeight;
  const T = spec.terrace;
  parts.push(...setting(36, 3350, { hills: 1.0, stone: 0.5, grass: 0.8, ground: "limestone" }));
  // The mound's top terrace, and a lower one stepped down from it.
  parts.push(box("ground", [0, 0, 6], [56, T, 32]));
  parts.push(box("ground", [0, 0, -16], [46, T * 0.5, 12]));
  const building = (
    x: number,
    z: number,
    w: number,
    d: number,
    y: number,
    rooms: number,
    label: number,
  ) => {
    const t = 0.9;
    parts.push(box("stone", [x, y, z], [w + 0.4, 0.5, d + 0.4]));
    for (const s of [-1, 1]) {
      parts.push(box("sand", [x + s * (w / 2 - t / 2), y + 0.5, z], [t, H, d]));
      parts.push(box("sand", [x, y + 0.5, z + s * (d / 2 - t / 2)], [w, H, t]));
    }
    // Cross walls into rooms, niches on the walls, the door.
    for (let k = 1; k < rooms; k += 1)
      parts.push(box("sand", [x - w / 2 + (k * w) / rooms, y + 0.5, z], [0.6, H, d - 1]));
    parts.push(box("shadow", [x, y + 0.5, z - d / 2 - 0.01], [1.2, 2.1, 0.02]));
    for (let k = 0; k < 3; k += 1)
      parts.push(
        box("shadow", [x - w / 3 + k * (w / 3), y + 1.8, z - d / 2 - 0.01], [0.5, 1.1, 0.02]),
      );
    // The flat roof of poles and earth, a parapet round it.
    parts.push(box("ground", [x, y + 0.5 + H, z], [w + 0.4, 0.45, d + 0.4]));
    for (let k = 0; k < Math.round(w / 0.8); k += 1)
      parts.push(
        cyl(
          "timber",
          [x - w / 2 + 0.4 + k * 0.8, y + 0.35 + H, z - d / 2 - 0.25],
          0.09,
          0.09,
          0.5,
          6,
          { rotX: Math.PI / 2 },
        ),
      );
    void label;
  };
  // Temple B and Temple A, the store rooms, and the corridor between them.
  const plan: [number, number, number, number, number, number][] = [
    [-14, 10, 16, 12, T, 3],
    [12, 12, 18, 14, T, 3],
    [-16, -5.8, 12, 7, T, 4],
    [16, -5.8, 14, 8, T, 4],
  ];
  plan
    .slice(0, spec.buildings)
    .forEach(([x, z, w, d, y, rooms], i) => building(x, z, w, d, y, rooms, i));
  // The corridor: a long passage of plastered walls, painted with figures.
  for (const s of [-1, 1]) parts.push(box("sand", [-6, T, 1 + s * 1.4], [16, H * 0.8, 0.7]));
  for (let k = 0; k < 6; k += 1)
    parts.push(
      box(
        k % 3 === 0 ? "paintRed" : "stoneDark",
        [-12.5 + k * 2.6, T + 1.1, 1.4 - 0.36],
        [0.5, 1.1, 0.04],
        FACING.north,
      ),
    );
  // The stair up from the lower terrace.
  for (let k = 0; k < 8; k += 1)
    parts.push(
      box("stone", [0, T * 0.5, -10 - (7 - k) * 0.35 - 0.18], [4, ((k + 1) * T * 0.5) / 8, 0.36]),
    );
  return parts;
}

export function mudbrickWalkStart(spec: MudbrickSpec): WalkStart {
  return {
    at: [2, -14],
    floor: spec.terrace * 0.5,
    look: [0, spec.terrace + spec.wallHeight * 0.5, 8],
  };
}

/* ================================================================== *
 * A Hittite town gate with sphinxes and carved orthostats (Alacahöyük)
 * ================================================================== */

/**
 * The Sphinx Gate of Alacahöyük: not a towered fortress gate like Hattusa's
 * but a modest gateway on top of the mound — two great monolithic jambs with
 * sphinxes carved out of their fronts, and to either side a row of carved
 * orthostats along the foot of the town wall (the king and queen before the
 * bull, musicians, acrobats, a hunt), the wall of mud brick on a stone socle.
 * Model axes: the gate looks -z, down the slope of the mound.
 */
export type SphinxGateSpec = {
  kind: "sphinx-gate";
  /** Modelled. */
  gateWidth: number;
  sphinxHeight: number;
  orthostats: number;
  wallLength: number;
  wallHeight: number;
  /** How high the mound stands over the plain. */
  mound: number;
};

export function sphinxGateLayout(spec: SphinxGateSpec) {
  const jamb = 2.2;
  const jx = spec.gateWidth / 2 + jamb / 2;
  const slab = 1.7;
  const rowStart = spec.gateWidth / 2 + jamb + 0.2;
  return { jamb, jx, slab, rowStart, rowEnd: rowStart + spec.orthostats * slab, face: -1.3 };
}

/** A carved orthostat: a slab of dark stone with a few figures in low relief. */
function orthostat(x: number, face: number, w: number, h: number, seed: number): Part[] {
  const parts: Part[] = [];
  const random = seeded(seed);
  parts.push(box("stoneDark", [x, 0.6, face - 0.25], [w - 0.06, h, 0.5]));
  const figures = 1 + Math.floor(random() * 3);
  for (let i = 0; i < figures; i += 1) {
    const fx = x - w / 2 + (w * (i + 0.5)) / figures + (random() - 0.5) * 0.15;
    const tall = 0.75 + random() * 0.25;
    // A figure in profile: body, head, an arm raised or holding something.
    parts.push(box("stoneDark", [fx, 0.75, face - 0.53], [0.26, tall * 0.7, 0.07]));
    parts.push(box("stoneDark", [fx + 0.03, 0.75 + tall * 0.7, face - 0.53], [0.17, 0.2, 0.07]));
    parts.push(
      box(
        "stoneDark",
        [fx + 0.16, 0.75 + tall * (0.35 + random() * 0.3), face - 0.53],
        [0.22, 0.06, 0.06],
      ),
    );
  }
  return parts;
}

export function sphinxGateParts(spec: SphinxGateSpec): Part[] {
  const parts: Part[] = [];
  const L = sphinxGateLayout(spec);
  const H = spec.wallHeight;
  parts.push(...setting(32, 1430, { hills: 0.8, stone: 0.5, grass: 0.9, ground: "limestone" }));
  // The jambs: two monoliths, the sphinxes carved out of their fronts.
  for (const s of [-1, 1]) {
    parts.push(worn(box("stone", [s * L.jx, 0, 0.2], [L.jamb, 4.6, 3]), 0.04));
    parts.push(...hittiteLion("stone", [s * L.jx, 0, L.face], Math.PI, spec.sphinxHeight, true));
  }
  // The passage, paved, running in through the wall to the town.
  parts.push(box("stone", [0, 0, 3], [spec.gateWidth + 0.2, 0.12, 16]));
  // The town wall either side: a stone socle with the orthostats along its foot,
  // mud brick over it.
  for (const s of [-1, 1]) {
    const x0 = spec.gateWidth / 2 + L.jamb;
    const x1 = spec.wallLength / 2;
    const cx = (s * (x0 + x1)) / 2;
    parts.push(box("stone", [cx, 0, 1.6], [x1 - x0, 1.4, 3.2]));
    parts.push(box("sand", [cx, 1.4, 1.6], [x1 - x0 - 0.2, H - 1.4, 3.0]));
    for (let k = 0; k < spec.orthostats; k += 1) {
      const x = s * (L.rowStart + (k + 0.5) * L.slab);
      parts.push(...orthostat(x, 0, L.slab, 1.3, 1430 + k * 7 + (s > 0 ? 100 : 0)));
    }
    // The plinth the orthostats stand on.
    parts.push(
      box(
        "stone",
        [(s * (L.rowStart + L.rowEnd)) / 2, 0, -0.35],
        [L.rowEnd - L.rowStart, 0.6, 0.7],
      ),
    );
  }
  // The road climbing the mound to the gate.
  parts.push(scenery(box("ground", [0, -0.1, -14], [4, 0.12, 24])));
  return parts;
}

export function sphinxGateWalkStart(spec: SphinxGateSpec): WalkStart {
  return { at: [0.8, -15], floor: 0, look: [0, spec.sphinxHeight * 0.8, 0] };
}
