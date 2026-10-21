import { FACING, onFace } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitSetting as setting,
  kitWorn as worn,
  kitScenery as scenery,
  kitSeeded as seeded,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { bands, slopedSlab, steppedRamp } from "./masonry";

/**
 * The citadel wall of Troy VI, at its East Gate.
 *
 * The lower wall is limestone, its outer face battered — sloping back as it
 * rises — and dressed in courses, and every few metres the face steps back
 * a little: the shallow offsets that make a Troy VI wall recognisable at a
 * glance. On it stood a vertical wall of mud brick. The East Gate is not an
 * opening through the wall but a passage between two of its ends: the wall
 * east of the gate runs on outside the end of the wall west of it, and the
 * way in climbs between the two before turning into the citadel. A tower
 * stands forward of the wall beyond the gate, and inside, on the terraces,
 * stand the large free-standing houses of the period.
 *
 * Plan: the west stretch runs along x at `z = 0`; outside is `-z`. The
 * plain is `y = 0` and the citadel terrace `terrace` above it.
 */
export type TroyCitadelSpec = {
  kind: "troy-citadel";
  /** Cited (see the uncertainty note). */
  wallThickness: number;
  /** Modelled. */
  stoneHeight: number;
  brickHeight: number;
  batter: number;
  offsetSpacing: number;
  offsetDepth: number;
  passageWidth: number;
  terrace: number;
  towerWidth: number;
  towerDepth: number;
  houses: number;
};

export function troyLayout(spec: TroyCitadelSpec) {
  const T = spec.wallThickness;
  const westFoot = -T / 2 - spec.batter;
  const eastInner = westFoot - spec.passageWidth;
  const eastOuter = eastInner - T;
  return {
    T,
    west: { x0: -46, x1: 20, inner: T / 2, outer: -T / 2, foot: westFoot },
    east: { x0: 8, x1: 46, inner: eastInner, outer: eastOuter, foot: eastOuter - spec.batter },
    tower: { x0: 27, x1: 27 + spec.towerWidth },
  };
}

/**
 * One sloping limestone face: a slab laid to the batter, rising from its
 * foot towards `+z` once `rotY` has turned it, and the joints of its
 * masonry drawn on it a few centimetres proud — courses of uneven height,
 * and the upright joints between blocks staggered course by course.
 */
function batteredFace(
  spec: TroyCitadelSpec,
  foot: Vec3,
  rotY: number,
  width: number,
  seed: number,
): Part[] {
  const H = spec.stoneHeight;
  const angle = Math.atan2(H, spec.batter);
  const random = seeded(seed);
  const parts: Part[] = [slopedSlab("limestone", foot, rotY, width, spec.batter, H, 0.7)];
  const n0 = Math.cos(angle);
  const n1 = -Math.sin(angle);
  const onSlope = (u: number, y: number): Vec3 =>
    onFace(foot, rotY, u, y + n0 * 0.035, (y / H) * spec.batter + n1 * 0.035);
  const strip = (at: Vec3, size: Vec3): Part => ({
    kind: "box",
    material: "stoneDark",
    at,
    size,
    rotY,
    rotX: -angle,
  });
  let y = 0;
  let course = 0;
  while (y < H - 0.3) {
    const h = Math.min(H - y, 0.42 + random() * 0.32);
    if (y > 0) parts.push(strip(onSlope(0, y), [width - 0.06, 0.04, 0.04]));
    // The upright joints of this course, a block's length apart.
    const len = (1.1 + random() * 0.5) * (h / 0.55);
    let u = -width / 2 + (course % 2 ? len * 0.5 : len) + random() * 0.3;
    const rise = h / Math.sin(angle);
    while (u < width / 2 - 0.3) {
      parts.push(strip(onSlope(u, y + h / 2), [0.04, 0.04, rise - 0.04]));
      u += len * (0.75 + random() * 0.5);
    }
    y += h;
    course += 1;
  }
  return parts;
}

/**
 * A battered stretch of wall face in segments, each turned a little so that
 * it stands forward at its western end and the next begins set back — the
 * offsets. `outer` is the line of the top of the face, which slopes out to
 * `outer - batter` at the foot.
 */
function batteredRun(
  spec: TroyCitadelSpec,
  x0: number,
  x1: number,
  outer: number,
  seed: number,
): Part[] {
  const parts: Part[] = [];
  const n = Math.max(1, Math.round((x1 - x0) / spec.offsetSpacing));
  for (let i = 0; i < n; i += 1) {
    const a = x0 + ((x1 - x0) * i) / n;
    const b = x0 + ((x1 - x0) * (i + 1)) / n;
    const len = b - a;
    const rotY = -Math.asin(spec.offsetDepth / len);
    const foot: Vec3 = [(a + b) / 2, 0, outer - spec.batter - spec.offsetDepth / 2];
    parts.push(...batteredFace(spec, foot, rotY, len + 0.02, seed + i * 13));
  }
  return parts;
}

/** A free-standing house of the citadel: stone socle, mud brick, a flat roof. */
function house(at: Vec3, rotY: number, w: number, d: number, seed: number): Part[] {
  const parts: Part[] = [];
  const random = seeded(seed);
  const wall = 0.9;
  const socle = 1.1;
  const brick = 3.0;
  const P = (x: number, z: number, y = 0): Vec3 => onFace(at, rotY, x, y, z);
  // Long walls run on past the front as antae, making a porch.
  const porch = 2.2;
  for (const side of [-1, 1]) {
    parts.push(box("limestone", P(side * (w / 2 - wall / 2), 0), [wall, socle, d + porch], rotY));
    parts.push(
      box(
        "terrazzo",
        P(side * (w / 2 - wall / 2), 0, socle),
        [wall - 0.1, brick, d + porch - 0.1],
        rotY,
      ),
    );
  }
  // The back wall, and the front wall with its door.
  const back = -(d + porch) / 2 + wall / 2;
  const front = (d + porch) / 2 - porch - wall / 2;
  parts.push(box("limestone", P(0, back), [w - 2 * wall, socle, wall], rotY));
  parts.push(box("terrazzo", P(0, back, socle), [w - 2 * wall, brick, wall - 0.1], rotY));
  const door = 1.5;
  const leaf = (w - 2 * wall - door) / 2;
  for (const side of [-1, 1]) {
    parts.push(box("limestone", P(side * (door / 2 + leaf / 2), front), [leaf, socle, wall], rotY));
    parts.push(
      box(
        "terrazzo",
        P(side * (door / 2 + leaf / 2), front, socle),
        [leaf, brick, wall - 0.1],
        rotY,
      ),
    );
  }
  parts.push(box("terrazzo", P(0, front, socle + 2.0), [door, brick - 2.0, wall - 0.1], rotY));
  parts.push(box("timber", P(0, front, socle + 1.92), [door + 0.4, 0.14, wall + 0.06], rotY));
  // The roof: beams, then a thick flat layer of earth, a low kerb round it.
  const top = socle + brick;
  parts.push(box("ground", P(0, -porch / 2 + 0.0, top), [w + 0.3, 0.35, d + porch + 0.3], rotY));
  // The ends of the beams show along the side walls, under the roof.
  for (let z = back + wall + 0.4; z < front - wall - 0.4; z += 0.9) {
    for (const side of [-1, 1])
      parts.push(box("timber", P(side * (w / 2 + 0.1), z, top - 0.2), [0.3, 0.18, 0.18], rotY));
  }
  parts.push(box("ground", P(0, -porch / 2 + 0.0, top + 0.35), [w + 0.3, 0.3, 0.3], rotY));
  void random;
  return parts;
}

export function troyCitadelParts(spec: TroyCitadelSpec): Part[] {
  const L = troyLayout(spec);
  const { T } = L;
  const H = spec.stoneHeight;
  const parts: Part[] = [];

  // The west stretch: battered face, core, mud brick, parapet.
  const w = L.west;
  parts.push(...batteredRun(spec, w.x0, w.x1, w.outer, 61));
  const wlen = w.x1 - w.x0;
  const wcx = (w.x0 + w.x1) / 2;
  parts.push(box("limestone", [wcx, 0, 0.05], [wlen, H, T - 0.1]));
  parts.push(box("terrazzo", [wcx, H, 0.3], [wlen, spec.brickHeight, T - 0.7]));
  parts.push(...bands("timber", [wcx, H, -T / 2 + 0.35], FACING.south, wlen, [1.3], 0.14));
  parts.push(box("terrazzo", [wcx, H + spec.brickHeight, -T / 2 + 0.75], [wlen, 1.2, 0.7]));

  // The east stretch, standing outside the end of the west one: the gate.
  const e = L.east;
  parts.push(...batteredRun(spec, e.x0, e.x1, e.outer, 67));
  const elen = e.x1 - e.x0;
  const ecx = (e.x0 + e.x1) / 2;
  const ez = (e.inner + e.outer) / 2;
  parts.push(box("limestone", [ecx, 0, ez + 0.05], [elen, H, T - 0.1]));
  parts.push(box("terrazzo", [ecx, H, ez + 0.3], [elen, spec.brickHeight, T - 0.7]));
  parts.push(...bands("timber", [ecx, H, e.outer + 0.35], FACING.south, elen, [1.3], 0.14));
  parts.push(box("terrazzo", [ecx, H + spec.brickHeight, e.outer + 0.75], [elen, 1.2, 0.7]));
  // The end of the east stretch at the mouth of the passage, battered too.
  parts.push(...batteredFace(spec, [e.x0 - spec.batter, 0, ez], FACING.east, T - 0.1, 71));

  // The passage, climbing between the two to the level of the citadel.
  const pz = (w.foot + e.inner) / 2;
  parts.push(
    ...steppedRamp(
      "limestone",
      [e.x0 - 4, 0, pz],
      FACING.east,
      spec.passageWidth,
      w.x1 - e.x0 + 4,
      spec.terrace,
      0.32,
    ),
  );

  // The tower beyond the gate, forward of the east stretch.
  const t = L.tower;
  const tcx = (t.x0 + t.x1) / 2;
  const tz0 = e.outer - spec.towerDepth;
  parts.push(
    box(
      "limestone",
      [tcx, 0, (tz0 + e.outer) / 2 + 0.05],
      [spec.towerWidth - 0.1, H, spec.towerDepth],
    ),
  );
  parts.push(
    ...batteredFace(spec, [tcx, 0, tz0 - spec.batter], 0, spec.towerWidth + 2 * spec.batter, 73),
  );
  for (const side of [-1, 1]) {
    const x = side < 0 ? t.x0 : t.x1;
    parts.push(
      ...batteredFace(
        spec,
        [x + side * spec.batter, 0, (tz0 + e.outer) / 2 - spec.batter / 2],
        side < 0 ? FACING.east : FACING.west,
        spec.towerDepth + spec.batter + 0.02,
        79 + side,
      ),
    );
  }
  const tb = spec.brickHeight + 2.4;
  parts.push(
    box(
      "terrazzo",
      [tcx, H, (tz0 + e.outer) / 2 + 0.2],
      [spec.towerWidth - 0.4, tb, spec.towerDepth + 0.4],
    ),
  );
  parts.push(
    ...bands("timber", [tcx, H, tz0 + 0.2], FACING.south, spec.towerWidth - 0.4, [1.3, 3.6], 0.14),
  );
  for (const x of [-2.4, 0, 2.4])
    parts.push(box("shadow", [tcx + x, H + tb - 1.6, tz0 + 0.19], [0.4, 0.6, 0.02]));
  parts.push(box("terrazzo", [tcx, H + tb, tz0 + 0.55], [spec.towerWidth - 0.4, 1.1, 0.7]));

  // The citadel terrace behind the walls.
  const back = 42;
  parts.push(
    box(
      "ground",
      [(w.x0 + w.x1) / 2, 0, (T / 2 + back) / 2],
      [w.x1 - w.x0, spec.terrace, back - T / 2],
    ),
  );
  parts.push(
    box(
      "ground",
      [(w.x1 + e.x1) / 2, 0, (e.inner + back) / 2],
      [e.x1 - w.x1, spec.terrace, back - e.inner],
    ),
  );
  // A lane of beaten earth and stone up from the gate.
  parts.push(box("limestone", [23.5, spec.terrace, 8], [3, 0.06, 26]));

  // The houses of the terrace.
  const spots: [number, number, number, number, number][] = [
    [-22, 16, 0.06, 9, 15],
    [-4, 19, -0.04, 8, 13],
    [33, 14, 0.08, 10, 14],
    [12, 30, 0.02, 8.5, 12],
  ];
  spots.slice(0, spec.houses).forEach(([x, z, r, hw, hd], i) => {
    parts.push(...house([x, spec.terrace, z], r, hw, hd, 900 + i));
  });

  // Stones fallen at the foot, and the plain of the Troad.
  const random = seeded(19);
  for (let i = 0; i < 12; i += 1) {
    const x = -40 + random() * 40;
    parts.push(
      scenery(
        worn(
          box(
            "limestone",
            [x, 0, w.foot - 1.2 - random() * 3],
            [0.5 + random() * 0.6, 0.3 + random() * 0.3, 0.4 + random() * 0.5],
            random() * 6,
          ),
          0.06,
        ),
      ),
    );
  }
  parts.push(...setting(55, 4417, { stone: 0.5, grass: 1.1, hills: 0.6, ground: "limestone" }));
  return parts;
}

/** On the plain before the gate, looking into the passage. */
export function troyWalkStart(spec: TroyCitadelSpec): WalkStart {
  const L = troyLayout(spec);
  return {
    at: [1, L.west.foot - 5],
    floor: 0,
    look: [L.east.x0 + 4, 2.4, (L.west.foot + L.east.inner) / 2],
  };
}
