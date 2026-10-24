import { FACING, onFace } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitCyl as cyl,
  kitScenery as scenery,
  kitSeeded as seeded,
  kitSetting as setting,
  kitWorn as worn,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { gateLion } from "@/lib/beasts";
import { bands, pitchedFace, polygonalFace, slopedSlab, steppedRamp } from "./masonry";

/**
 * The Lion Gate of Hattusa: the south-west gate of the Upper City, in the
 * wall that runs along the crest of an earthen rampart.
 *
 * Two towers flank the way in. Between them the passage is closed at each
 * end by an arch built from a pair of enormous monoliths that lean towards
 * each other until they meet in a pointed, parabolic curve, and the two
 * stones of the outer arch carry, cut from the jambs themselves, the
 * foreparts of the two lions that name the gate. The socles of wall and
 * towers are polygonal masonry, the blocks fitted along slanting joints; the
 * walls above them were mud brick, laced with timber, under crenellations.
 * The rampart's outer slope was faced with stone, and the road came up to
 * the gate along the face of the rampart.
 *
 * Plan: the wall runs along x; outside the city is `-z`. The ground outside
 * is `y = 0`; the rampart, the gate and the city behind it are at
 * `rampartHeight`.
 */
export type HittiteGateSpec = {
  kind: "hittite-gate";
  /** Cited. */
  gateWidth: number;
  lions: number;
  towers: number;
  /** Modelled: see the uncertainty note. */
  archHeight: number;
  rampartHeight: number;
  wallThickness: number;
  wallHeight: number;
  socleHeight: number;
  towerWidth: number;
  towerDepth: number;
  towerHeight: number;
  lionHeight: number;
  wallLength: number;
};

/** The width of each jamb monolith at its foot. */
const JAMB = 1.6;
/** How deep the arch stones are, through the wall. */
const ARCH_DEPTH = 1.5;

/** Where everything is, worked out once from the spec. */
export function hittiteGateLayout(spec: HittiteGateSpec) {
  const R = spec.rampartHeight;
  const T = spec.wallThickness;
  const P = spec.gateWidth + 2 * JAMB;
  const projOut = (spec.towerDepth - T) * 0.62;
  const zo = -T / 2 - projOut;
  const zi = zo + spec.towerDepth;
  // The forecourt the road climbs to, and the berm along the wall.
  const berm = zo - 1.6;
  const glacisRun = R / Math.tan((33 * Math.PI) / 180);
  const toe = berm - glacisRun;
  const court = {
    x0: -(P / 2 + spec.towerWidth + 1),
    x1: P / 2 + spec.towerWidth + 7,
    z0: toe - 4.6,
    z1: berm,
  };
  const ramp = { z: toe - 2.4, width: 4.2, run: R * 6, top: court.x1 };
  const half = spec.wallLength / 2;
  return { R, T, P, projOut, zo, zi, berm, glacisRun, toe, court, ramp, half };
}

/**
 * One of the gate lions, standing out of the face of its jamb: the forepart
 * only — the forelegs planted side by side, the deep chest, the mane in rows
 * of flame-shaped locks, and the head with its jaws open and the eye sockets
 * that held the inlay — carved as one body out of the stone it is cut from
 * (see `gateLion` in `beasts.ts`). The frame is the foot of the lion on the
 * face of the jamb, `+z` straight out of the stone; `size` is its height to
 * the top of the mane.
 */
export function hittiteLion(material: Material, at: Vec3, rotY: number, size: number): Part[] {
  return [
    {
      kind: "sculpt",
      material,
      at,
      rotY,
      masses: gateLion(size),
      cell: size * 0.013,
      // Its back is the face of the jamb, and is not drawn.
      back: size * 0.01,
      statue: "Lion",
    },
  ];
}

/**
 * The opening of a parabolic arch at height `y` above its floor: the half
 * width of the passage there, closing to nothing at `height`.
 */
export const archHalfWidth = (gateWidth: number, height: number, y: number) =>
  (gateWidth / 2) * Math.sqrt(Math.max(0, 1 - y / height));

/**
 * One end of the gate passage: two jamb monoliths leaning in along the curve
 * and a crown stone closing it, each a slab cut to its outline, in the plane
 * `z` that `rotY` faces out of. `half` is half the width between the towers.
 */
function parabolicArch(
  spec: HittiteGateSpec,
  floor: number,
  z: number,
  rotY: number,
  half: number,
): Part[] {
  const h = spec.archHeight;
  const springing = h * 0.74;
  const curve = (from: number, to: number, n: number): [number, number][] => {
    const out: [number, number][] = [];
    for (let i = 0; i <= n; i += 1) {
      const y = from + ((to - from) * i) / n;
      out.push([archHalfWidth(spec.gateWidth, h, y), y]);
    }
    return out;
  };
  const parts: Part[] = [];
  // In the face's own frame, u runs along -x once it faces south; outlines
  // are drawn in world x and mirrored to match.
  const flip = Math.cos(rotY) < 0 ? -1 : 1;
  const u = ([x, y]: [number, number]): [number, number] => [x * flip, y];
  for (const side of [-1, 1]) {
    const inner = curve(0, springing, 10).map(([x, y]) => [side * x, y] as [number, number]);
    const outline: [number, number][] = [
      [side * half, 0],
      [side * half, springing + 0.55],
      ...[...inner].reverse(),
    ];
    // Keep it counter-clockwise either way round.
    const ordered = side > 0 ? outline : [...outline].reverse();
    parts.push(
      worn(
        {
          kind: "carving",
          material: "stone",
          at: [0, floor, z],
          outline: ordered.map(u),
          depth: ARCH_DEPTH,
          sink: 0.5,
          rotY,
        },
        0.02,
      ),
    );
  }
  // The crown stone over the top of the curve.
  const top = curve(springing, h, 8);
  const crown: [number, number][] = [
    [-half, springing + 0.55],
    ...top.map(([x, y]) => [-x, y] as [number, number]),
    ...[...top]
      .reverse()
      .slice(1)
      .map(([x, y]) => [x, y] as [number, number]),
    [half, springing + 0.55],
    [half, h + 0.9],
    [-half, h + 0.9],
  ];
  parts.push({
    kind: "carving",
    material: "stone",
    at: [0, floor, z],
    outline: crown.map(u),
    depth: ARCH_DEPTH,
    sink: 0.5,
    rotY,
  });
  return parts;
}

/** A mud-brick face with its timber lacing, standing on a stone socle. */
function mudBrick(
  at: Vec3,
  size: Vec3,
  rotY: number,
  faces: { at: Vec3; rotY: number; width: number }[],
): Part[] {
  const parts: Part[] = [box("terrazzo", at, size, rotY)];
  const h = size[1];
  const lacing: number[] = [];
  for (let y = 1.4; y < h - 0.8; y += 2.1) lacing.push(y);
  for (const face of faces)
    parts.push(...bands("timber", face.at, face.rotY, face.width, lacing, 0.12));
  return parts;
}

/** A row of merlons along an edge, from `a` to `b` on the top at height `y`. */
function merlons(a: [number, number], b: [number, number], y: number, thick = 0.7): Part[] {
  const parts: Part[] = [];
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const rotY = Math.atan2(b[0] - a[0], b[1] - a[1]) + Math.PI / 2;
  const count = Math.max(1, Math.floor(length / 1.7));
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const x = a[0] + (b[0] - a[0]) * t;
    const z = a[1] + (b[1] - a[1]) * t;
    parts.push(box("terrazzo", [x, y, z], [1.0, 1.05, thick], rotY));
    // A thin cap of plaster, slightly overhanging, to shed rain.
    parts.push(box("limestone", [x, y + 1.05, z], [1.1, 0.12, thick + 0.08], rotY));
  }
  return parts;
}

/** A tower: a stone socle in polygonal masonry, mud brick above, crenellated. */
function tower(
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  floor: number,
  socle: number,
  height: number,
  seed: number,
  skip: { west?: boolean; east?: boolean } = {},
  chamber?: [number, number],
): Part[] {
  const parts: Part[] = [];
  const w = x1 - x0;
  const d = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const inset = 0.08;
  parts.push(box("stone", [cx, floor, cz], [w - 2 * inset, socle, d - 2 * inset]));
  const face = (at: Vec3, rotY: number, width: number, s: number) =>
    parts.push(
      ...polygonalFace({
        material: "stone",
        at,
        rotY,
        width,
        height: socle,
        size: 1.15,
        seed: s,
        proud: 0.1,
        gap: 0.07,
      }),
    );
  face([cx, floor, z0], FACING.south, w, seed);
  face([cx, floor, z1], FACING.north, w, seed + 1);
  if (!skip.west) face([x0, floor, cz], FACING.west, d, seed + 2);
  else if (chamber)
    face(
      [x0, floor, (chamber[0] + chamber[1]) / 2],
      FACING.west,
      chamber[1] - chamber[0],
      seed + 2,
    );
  if (!skip.east) face([x1, floor, cz], FACING.east, d, seed + 3);
  else if (chamber)
    face(
      [x1, floor, (chamber[0] + chamber[1]) / 2],
      FACING.east,
      chamber[1] - chamber[0],
      seed + 3,
    );
  // Mud brick above, set back a hand's breadth on the socle.
  const set = 0.12;
  const top = floor + socle;
  const brick = height - socle;
  parts.push(
    ...mudBrick([cx, top, cz], [w - 2 * set, brick, d - 2 * set], 0, [
      { at: [cx, top, z0 + set], rotY: FACING.south, width: w - 2 * set },
      { at: [cx, top, z1 - set], rotY: FACING.north, width: w - 2 * set },
      { at: [x0 + set, top, cz], rotY: FACING.west, width: d - 2 * set },
      { at: [x1 - set, top, cz], rotY: FACING.east, width: d - 2 * set },
    ]),
  );
  // Small windows high up, as the clay models of Hittite towers show them.
  for (const [at, rotY, span] of [
    [[cx, 0, z0 + set], FACING.south, w],
    [[x0 + set, 0, cz], FACING.west, d],
    [[x1 - set, 0, cz], FACING.east, d],
  ] as [Vec3, number, number][]) {
    const n = Math.max(1, Math.floor(span / 3.2));
    for (let i = 0; i < n; i += 1) {
      const along = -span / 2 + (span * (i + 0.5)) / n;
      parts.push(
        box(
          "shadow",
          onFace([at[0], floor + height - 2.6, at[2]], rotY, along, 0, 0.004),
          [0.45, 0.65, 0.02],
          rotY,
        ),
      );
    }
  }
  // The ends of the beams of the top floor, standing out of the brick under
  // the parapet, as the clay models of Hittite towers show them.
  for (const [at, rotY, span] of [
    [[cx, 0, z0 + set], FACING.south, w - 2 * set],
    [[cx, 0, z1 - set], FACING.north, w - 2 * set],
    [[x0 + set, 0, cz], FACING.west, d - 2 * set],
    [[x1 - set, 0, cz], FACING.east, d - 2 * set],
  ] as [Vec3, number, number][]) {
    const n = Math.max(2, Math.floor(span / 1.05));
    for (let i = 0; i < n; i += 1) {
      const along = -span / 2 + (span * (i + 0.5)) / n;
      parts.push(
        box(
          "timber",
          onFace([at[0], floor + height - 0.62, at[2]], rotY, along, 0, 0.17),
          [0.2, 0.2, 0.38],
          rotY,
        ),
      );
    }
  }
  // The crenellations round the top.
  const y = floor + height;
  const e = set + 0.35;
  parts.push(
    ...merlons([x0 + e, z0 + e], [x1 - e, z0 + e], y),
    ...merlons([x1 - e, z1 - e], [x0 + e, z1 - e], y),
    ...merlons([x0 + e, z1 - e - 1.2], [x0 + e, z0 + e + 1.2], y),
    ...merlons([x1 - e, z0 + e + 1.2], [x1 - e, z1 - e - 1.2], y),
  );
  return parts;
}

export function hittiteGateParts(spec: HittiteGateSpec): Part[] {
  const L = hittiteGateLayout(spec);
  const { R, T, P, zo, zi, berm, toe, court, ramp, half } = L;
  const parts: Part[] = [];
  const TW = spec.towerWidth;
  const gx = P / 2 + TW;
  const wallMin = -half;
  const wallMax = half;

  // The rampart: the city behind at the height of the gate, and the stone-
  // faced slope falling away outside.
  const backZ = zi + 22;
  parts.push(
    box(
      "ground",
      [(wallMin + wallMax) / 2, 0, (berm + backZ) / 2],
      [wallMax - wallMin, R, backZ - berm],
    ),
  );
  // The glacis: a bed of earth and packing, and on it the facing of rough
  // slabs laid in courses up the slope (left out where the forecourt covers it).
  parts.push(
    slopedSlab(
      "stoneDark",
      [(wallMin + wallMax) / 2, 0, toe],
      0,
      wallMax - wallMin,
      berm - toe,
      R,
      0.35,
    ),
  );
  for (const [a, b, s] of [
    [wallMin, court.x0 - 0.02, 61],
    [court.x1 + 0.02, wallMax, 67],
  ] as const) {
    parts.push(
      ...pitchedFace({
        material: "stone",
        foot: [(a + b) / 2, 0, toe],
        rotY: 0,
        width: b - a,
        run: berm - toe,
        rise: R,
        size: [1.45, 1.05],
        seed: s,
      }),
    );
  }
  // The forecourt the road arrives at, retained in stone.
  const cw = court.x1 - court.x0;
  parts.push(
    box(
      "stone",
      [(court.x0 + court.x1) / 2, 0, (court.z0 + court.z1) / 2],
      [cw, R, court.z1 - court.z0],
    ),
  );
  parts.push(
    ...polygonalFace({
      material: "stone",
      at: [(court.x0 + court.x1) / 2, 0, court.z0 - 0.02],
      rotY: FACING.south,
      width: cw,
      height: R,
      size: 1.0,
      seed: 41,
      proud: 0.1,
      gap: 0.07,
    }),
    ...polygonalFace({
      material: "stone",
      at: [court.x0 - 0.02, 0, (court.z0 + court.z1) / 2],
      rotY: FACING.west,
      width: court.z1 - court.z0,
      height: R,
      size: 1.0,
      seed: 43,
      proud: 0.1,
      gap: 0.07,
    }),
    ...polygonalFace({
      material: "stone",
      at: [court.x1 + 0.02, 0, (court.z0 + court.z1) / 2],
      rotY: FACING.east,
      width: court.z1 - court.z0,
      height: R,
      size: 1.0,
      seed: 47,
      proud: 0.1,
      gap: 0.07,
    }),
  );
  // The ramp up to it, along the foot of the rampart.
  parts.push(
    ...steppedRamp(
      "stone",
      [ramp.top + ramp.run, 0, ramp.z],
      FACING.west,
      ramp.width,
      ramp.run,
      R,
      0.75,
    ),
  );
  // A low kerb along its outer edge.
  for (let i = 0; i < 8; i += 1) {
    const t0 = i / 8;
    const x = ramp.top + ramp.run * (1 - t0 - 1 / 16);
    const y = R * (t0 + 1 / 16);
    parts.push(
      box("stoneDark", [x, y, ramp.z - ramp.width / 2 + 0.2], [ramp.run / 8 - 0.3, 0.35, 0.4]),
    );
  }
  // Paving through the gate and on into the city.
  parts.push(box("stone", [0, R, (zo + zi) / 2], [P, 0.1, zi - zo]));
  parts.push(box("stone", [0, R, zi + 9], [P - 1, 0.06, 18]));
  for (let k = 0; k < 9; k += 1)
    parts.push(box("stoneDark", [0, R + 0.06, zi + 1 + k * 2], [P - 1.1, 0.012, 0.05]));

  // The two gate towers.
  const chamber: [number, number] = [zo + ARCH_DEPTH, zi - ARCH_DEPTH];
  const towerSocle = spec.socleHeight + 1.2;
  parts.push(
    ...tower(-gx, -P / 2, zo, zi, R, towerSocle, spec.towerHeight, 101, { east: true }, chamber),
  );
  parts.push(
    ...tower(P / 2, gx, zo, zi, R, towerSocle, spec.towerHeight, 111, { west: true }, chamber),
  );

  // The arches, outer and inner, and the brick over each.
  parts.push(...parabolicArch(spec, R + 0.1, zo + ARCH_DEPTH / 2, FACING.south, P / 2));
  parts.push(...parabolicArch(spec, R + 0.1, zi - ARCH_DEPTH / 2, FACING.north, P / 2));
  const over = R + 0.1 + spec.archHeight + 0.9;
  for (const z of [zo + ARCH_DEPTH / 2, zi - ARCH_DEPTH / 2]) {
    parts.push(
      ...mudBrick([0, over, z], [P + 0.24, R + spec.wallHeight - over - 0.2, ARCH_DEPTH], 0, []),
    );
    parts.push(
      ...merlons(
        [-P / 2 + 0.5, z - ARCH_DEPTH / 2 + 0.4],
        [P / 2 - 0.5, z - ARCH_DEPTH / 2 + 0.4],
        R + spec.wallHeight - 0.2,
        0.6,
      ),
    );
  }
  // The leaves of the outer doors, timber sheathed in bronze, standing open
  // against the walls of the gate chamber.
  const leaf = spec.gateWidth / 2;
  for (const side of [-1, 1]) {
    const x = side * (P / 2 - 0.1);
    parts.push(
      box(
        "timber",
        [x, R + 0.1, chamber[0] + 0.15 + leaf / 2],
        [0.14, spec.archHeight * 0.62, leaf],
        0,
      ),
    );
    for (const y of [0.4, 1.5, 2.6])
      parts.push(
        box(
          "bronze",
          [x - side * 0.095, R + 0.1 + y, chamber[0] + 0.15 + leaf / 2],
          [0.05, 0.14, leaf - 0.1],
          0,
        ),
      );
  }

  // The lions, standing out of the outer jambs.
  for (const side of [-1, 1]) {
    const x = side * (spec.gateWidth / 2 + JAMB / 2 + 0.05);
    parts.push(...hittiteLion("stone", [x, R, zo], Math.PI, spec.lionHeight));
  }

  // The city wall either side: a casemate socle of two stone shells with
  // rubble between, mud brick above, a walk along its top behind merlons.
  const runs: [number, number][] = [
    [wallMin, -gx],
    [gx, wallMax],
  ];
  // Two wall towers along the stretch, one each side of the gate.
  const wallTowers = [-gx - 15, gx + 15];
  let seed = 200;
  for (const [a, b] of runs) {
    const pieces: [number, number][] = [];
    const tx = wallTowers.find((t) => t > a && t < b)!;
    pieces.push([a, tx - 4.5], [tx + 4.5, b]);
    for (const [x0, x1] of pieces) {
      const w = x1 - x0;
      const cx = (x0 + x1) / 2;
      const shell = 1.6;
      parts.push(box("stone", [cx, R, -T / 2 + shell / 2], [w, spec.socleHeight, shell - 0.12]));
      parts.push(box("stone", [cx, R, T / 2 - shell / 2], [w, spec.socleHeight, shell - 0.12]));
      parts.push(box("stoneDark", [cx, R, 0], [w, spec.socleHeight - 0.25, T - 2 * shell]));
      parts.push(
        ...polygonalFace({
          material: "stone",
          at: [cx, R, -T / 2],
          rotY: FACING.south,
          width: w,
          height: spec.socleHeight,
          size: 1.1,
          seed: seed++,
          proud: 0.1,
          gap: 0.07,
        }),
        ...polygonalFace({
          material: "stone",
          at: [cx, R, T / 2],
          rotY: FACING.north,
          width: w,
          height: spec.socleHeight,
          size: 1.1,
          seed: seed++,
          proud: 0.1,
          gap: 0.07,
        }),
      );
      const top = R + spec.socleHeight;
      const brick = spec.wallHeight - spec.socleHeight - 1.25;
      parts.push(
        ...mudBrick([cx, top, 0], [w, brick, T - 0.3], 0, [
          { at: [cx, top, -T / 2 + 0.15], rotY: FACING.south, width: w },
          { at: [cx, top, T / 2 - 0.15], rotY: FACING.north, width: w },
        ]),
      );
      parts.push(...merlons([x0 + 0.6, -T / 2 + 0.5], [x1 - 0.6, -T / 2 + 0.5], top + brick, 0.6));
    }
    // The wall tower: a little higher, standing forward of the wall.
    parts.push(
      ...tower(
        tx - 4.5,
        tx + 4.5,
        -T / 2 - 3.6,
        T / 2 + 0.6,
        R,
        spec.socleHeight,
        spec.wallHeight + 2.2,
        seed++,
      ),
    );
  }
  // The section at each end of the stretch shows the casemates: a cross wall
  // tying the two shells, and the rubble fill behind it.
  for (const x of [wallMin + 0.55, wallMax - 0.55]) {
    parts.push(box("stone", [x, R, 0], [1.2, spec.socleHeight - 0.02, T - 3.3]));
  }

  // A few rubble stones fallen at the foot of the slope, and the country.
  const random = seeded(77);
  for (let i = 0; i < 14; i += 1) {
    const x = wallMin + random() * (wallMax - wallMin - 30);
    parts.push(
      scenery(
        worn(
          box(
            "stone",
            [x, 0, toe - 1 - random() * 3],
            [0.6 + random(), 0.4 + random() * 0.4, 0.5 + random() * 0.8],
            random() * 6,
          ),
          0.08,
        ),
      ),
    );
  }
  parts.push(...setting(58, 3301, { stone: 1.2, grass: 0.8, hills: 0.9, ground: "stone" }));
  // Rocky outcrops inside the Upper City, the bedrock it was built over.
  for (const [x, z, s] of [
    [-28, zi + 15, 2.2],
    [24, zi + 18, 3],
  ] as const) {
    parts.push(scenery(worn(cyl("stone", [x, R - 0.2, z], s * 1.4, s * 0.6, s, 9), 0.4)));
  }
  return parts;
}

/** In the forecourt before the lions, looking up at the arch. */
export function hittiteGateWalkStart(spec: HittiteGateSpec): WalkStart {
  const L = hittiteGateLayout(spec);
  return {
    at: [1.2, L.zo - 8.5],
    floor: L.R,
    look: [0, L.R + spec.archHeight * 0.45, L.zo],
  };
}
