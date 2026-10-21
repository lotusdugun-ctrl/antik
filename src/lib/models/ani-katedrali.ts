import { ashlar, FACING, onFace } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitCyl as cyl,
  kitPrism as prism,
  kitSetting as setting,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { slopedSlab } from "./masonry";

/**
 * The Cathedral of Ani, as Trdat built it between 989 and 1001, with the
 * drum and dome that fell in the earthquake of 1319 — and, behind it, a
 * stretch of the city's double wall with its round towers.
 *
 * A domed basilica in smooth tuff ashlar: a rectangle outside, the cross of
 * its plan showing only in the gables of its roofs, a drum over the
 * crossing. Round all four sides runs a blind arcade of tall arches on
 * slender paired shafts; deep triangular niches cut into the walls mark
 * where the inner walls meet the outer ones; there are doors on the west,
 * north and south.
 *
 * Plan: the long axis runs along z, the west front looking towards `-z`.
 */
export type CathedralSpec = {
  kind: "medieval-cathedral";
  /** Cited. */
  portals: number;
  /** Modelled: see the uncertainty note. */
  length: number;
  width: number;
  eaveHeight: number;
  gableHeight: number;
  drumDiameter: number;
  drumHeight: number;
  coneHeight: number;
  /** The city wall behind: its length and its towers. */
  wallLength: number;
  wallTowers: number;
};

/** How deep the façade walls are: room for the niches cut into them. */
const FACE = 1.8;
const PLINTH = 1.05;
const STONE: Material = "conglomerate";

type Opening =
  | { kind: "niche"; at: number }
  | { kind: "door"; at: number; width: number; height: number }
  | { kind: "window"; at: number; y: number };

/** An arch outline: the band of an arch of radius `r` sitting on `springing`. */
function archBand(r: number, band: number, springing: number, n = 9): [number, number][] {
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= n; i += 1) {
    const a = Math.PI - (Math.PI * i) / n;
    outer.push([Math.cos(a) * (r + band / 2), springing + Math.sin(a) * (r + band / 2)]);
    inner.push([Math.cos(a) * (r - band / 2), springing + Math.sin(a) * (r - band / 2)]);
  }
  return [...outer, ...inner.reverse()];
}

/** A semicircle filled, for the head of a window or a door. */
function halfDisc(r: number, springing: number, n = 8): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i += 1) {
    const a = (Math.PI * i) / n;
    out.push([Math.cos(a) * r, springing + Math.sin(a) * r]);
  }
  return out;
}

/**
 * One front of the church: the wall, `FACE` deep, between its niches; the
 * niches themselves, two slanting faces meeting in a vertical crease under a
 * half-round head; the doors and windows; the coursing of the ashlar; and
 * the blind arcade standing a hand's breadth proud of it all.
 */
function front(
  spec: CathedralSpec,
  centre: Vec3,
  rotY: number,
  width: number,
  openings: Opening[],
  seed: number,
): Part[] {
  const parts: Part[] = [];
  const E = spec.eaveHeight;
  const P = (x: number, y: number, z: number) => onFace(centre, rotY, x, y, z);
  const bays = Math.max(3, Math.round(width / 2.15));
  const bay = width / bays;
  // Windows open in the middle of a bay of the arcade.
  const inBay = (x: number) => -width / 2 + (Math.round((x + width / 2) / bay - 0.5) + 0.5) * bay;
  const niches = openings.filter((o) => o.kind === "niche").map((o) => o.at);
  const gap = 1.3;
  const nicheTop = E - 4.2;
  // The wall, in runs between the niches.
  let from = -width / 2;
  const runs: [number, number][] = [];
  for (const n of [...niches].sort((a, b) => a - b)) {
    runs.push([from, n - gap / 2]);
    from = n + gap / 2;
  }
  runs.push([from, width / 2]);
  for (const [a, b] of runs)
    parts.push(box(STONE, P((a + b) / 2, PLINTH, -FACE / 2), [b - a, E - PLINTH, FACE], rotY));
  for (const n of niches) {
    // The two slanting faces, meeting 1.5 m in.
    const depth = 1.5;
    const half = gap / 2;
    const slant = Math.atan2(half, depth);
    const len = Math.hypot(half, depth);
    for (const side of [-1, 1]) {
      parts.push(
        box(
          STONE,
          P(n + (side * half) / 2, PLINTH, -depth / 2 - 0.12),
          [0.24, nicheTop - PLINTH, len],
          rotY + side * slant,
        ),
      );
    }
    // The wall closing over the niche, and the half-round head of it.
    parts.push(box(STONE, P(n, nicheTop, -FACE / 2), [gap + 0.02, E - nicheTop, FACE], rotY));
    parts.push({
      kind: "carving",
      material: STONE,
      at: P(n, nicheTop - 0.66, 0.06),
      outline: archBand(gap / 2 + 0.12, 0.2, 0),
      depth: 0.12,
      sink: 0.5,
      rotY,
    });
  }
  // The coursing of the ashlar.
  parts.push(
    ...ashlar({
      at: P(0, PLINTH, 0),
      rotY,
      length: width,
      height: E - PLINTH,
      course: 0.48,
      material: STONE,
      joint: "stoneDark",
      blocks: 1.1,
      foot: false,
      coping: false,
      gaps: [
        ...niches.map((n) => [n - gap / 2 - 0.02, n + gap / 2 + 0.02] as [number, number]),
        ...openings.flatMap((o) =>
          o.kind === "door"
            ? [[o.at - o.width / 2 - 0.4, o.at + o.width / 2 + 0.4] as [number, number]]
            : [],
        ),
      ],
    }),
  );
  // Doors: a dark opening in a moulded frame under a pointed hood.
  for (const o of openings) {
    if (o.kind === "door") {
      for (const side of [-1, 1])
        parts.push(
          box(
            STONE,
            P(o.at + side * (o.width / 2 + 0.2), PLINTH, 0.12),
            [0.4, o.height + 0.4, 0.24],
            rotY,
          ),
        );
      parts.push(box(STONE, P(o.at, PLINTH + o.height, 0.12), [o.width + 0.8, 0.4, 0.24], rotY));
      parts.push(box("timber", P(o.at, PLINTH, 0.008), [o.width, o.height, 0.014], rotY));
      parts.push({
        kind: "carving",
        material: STONE,
        at: P(o.at, PLINTH + o.height + 0.4, 0.14),
        outline: archBand(o.width / 2 + 0.55, 0.3, 0, 12),
        depth: 0.2,
        sink: 0.5,
        rotY,
      });
    } else if (o.kind === "window") {
      const overDoor = openings.some((d) => d.kind === "door" && Math.abs(d.at - o.at) < 1.5);
      const at = overDoor ? o.at : inBay(o.at);
      parts.push(box("shadow", P(at, o.y, 0.006), [0.55, 2.0, 0.012], rotY));
      parts.push({
        kind: "carving",
        material: "shadow",
        at: P(at, o.y + 2.0, 0.006),
        outline: halfDisc(0.275, 0),
        depth: 0.006,
        sink: 0.3,
        rotY,
      });
      parts.push({
        kind: "carving",
        material: STONE,
        at: P(at, o.y + 2.0, 0.07),
        outline: archBand(0.42, 0.14, 0),
        depth: 0.1,
        sink: 0.5,
        rotY,
      });
    }
  }
  // The blind arcade: paired shafts at every bay, arches springing from them.
  const shaftTop = E - 3.2;
  const blocked = (x: number) =>
    openings.some(
      (o) =>
        (o.kind === "niche" && Math.abs(x - o.at) < gap / 2 + 0.25) ||
        (o.kind === "door" && Math.abs(x - o.at) < o.width / 2 + 0.6),
    );
  for (let i = 0; i <= bays; i += 1) {
    const x = -width / 2 + i * bay;
    if (blocked(x) || i === 0 || i === bays) continue;
    for (const d of [-0.13, 0.13]) {
      parts.push(cyl(STONE, P(x + d, PLINTH, 0.11), 0.085, 0.085, shaftTop - PLINTH, 8));
      parts.push(box(STONE, P(x + d, shaftTop, 0.11), [0.24, 0.22, 0.24], rotY));
    }
  }
  for (let i = 0; i < bays; i += 1) {
    const x = -width / 2 + (i + 0.5) * bay;
    if (blocked(x - bay / 2) && blocked(x + bay / 2)) continue;
    parts.push({
      kind: "carving",
      material: STONE,
      at: P(x, shaftTop + 0.22, 0.11),
      outline: archBand(bay / 2 - 0.13, 0.16, 0, 9),
      depth: 0.18,
      sink: 0.5,
      rotY,
    });
  }
  // A cornice under the eave.
  parts.push(box(STONE, P(0, E - 0.35, 0.12), [width + 0.24, 0.35, 0.3], rotY));
  void seed;
  return parts;
}

export function cathedralParts(spec: CathedralSpec): Part[] {
  const parts: Part[] = [];
  const L = spec.length;
  const W = spec.width;
  const E = spec.eaveHeight;
  const hx = W / 2;
  const hz = L / 2;

  // The stepped platform.
  for (let s = 0; s < 3; s += 1) {
    const grow = (3 - s) * 0.45;
    parts.push(box(STONE, [0, s * 0.35, 0], [W + 2 * grow, 0.35, L + 2 * grow]));
  }
  // The core inside the fronts.
  parts.push(box(STONE, [0, PLINTH, 0], [W - 2 * FACE + 0.02, E - PLINTH, L - 2 * FACE + 0.02]));
  // The four fronts. West: the main door and windows over it.
  parts.push(
    ...front(
      spec,
      [0, 0, -hz],
      FACING.south,
      W,
      [
        { kind: "door", at: 0, width: 2.2, height: 4.6 },
        { kind: "window", at: 0, y: 8.6 },
        { kind: "window", at: -6.4, y: 8 },
        { kind: "window", at: 6.4, y: 8 },
      ],
      1,
    ),
    ...front(
      spec,
      [0, 0, hz],
      FACING.north,
      W,
      [
        { kind: "niche", at: -3.6 },
        { kind: "niche", at: 3.6 },
        { kind: "window", at: 0, y: 7.6 },
        { kind: "window", at: -7.6, y: 8 },
        { kind: "window", at: 7.6, y: 8 },
      ],
      2,
    ),
    ...front(
      spec,
      [-hx, 0, 0],
      FACING.west,
      L - 2 * FACE,
      [
        { kind: "door", at: 0, width: 1.8, height: 4.0 },
        { kind: "niche", at: -8.2 },
        { kind: "niche", at: 8.2 },
        { kind: "window", at: 0, y: 8.4 },
        { kind: "window", at: -4.2, y: 8 },
        { kind: "window", at: 4.2, y: 8 },
      ],
      3,
    ),
    ...front(
      spec,
      [hx, 0, 0],
      FACING.east,
      L - 2 * FACE,
      [
        { kind: "door", at: 0, width: 1.8, height: 4.0 },
        { kind: "niche", at: -8.2 },
        { kind: "niche", at: 8.2 },
        { kind: "window", at: 0, y: 8.4 },
        { kind: "window", at: -4.2, y: 8 },
        { kind: "window", at: 4.2, y: 8 },
      ],
      4,
    ),
  );

  // The roofs: flat stone over the corners, gables over the cross arms.
  const roofY = E;
  parts.push(box("stoneDark", [0, roofY, 0], [W + 0.4, 0.28, L + 0.4]));
  const arm = 13;
  const rise = spec.gableHeight - E - 0.28;
  const top = roofY + 0.28;
  // Gable walls in the stone of the fronts, then slabs of the roof on them.
  parts.push(prism(STONE, [0, top, 0], [arm, rise - 0.3, L], 0));
  parts.push(prism(STONE, [0, top, 0], [arm, rise - 0.3, W], Math.PI / 2));
  for (const side of [-1, 1]) {
    parts.push(
      slopedSlab(
        "stoneDark",
        [side * (arm / 2 + 0.3), top, 0],
        side < 0 ? FACING.east : FACING.west,
        L + 0.6,
        arm / 2 + 0.3,
        rise,
        0.3,
      ),
      slopedSlab(
        "stoneDark",
        [0, top, side * (arm / 2 + 0.3)],
        side < 0 ? FACING.north : FACING.south,
        W + 0.6,
        arm / 2 + 0.3,
        rise,
        0.3,
      ),
    );
  }
  // A cornice along the gables' rakes on the fronts.
  // The drum on its square base over the crossing, and the cone on it.
  const r = spec.drumDiameter / 2;
  const base = spec.gableHeight + 0.2;
  parts.push(box(STONE, [0, top + 1, 0], [r * 2 + 1.2, base - top - 1 + 0.6, r * 2 + 1.2]));
  const d0 = base + 0.6;
  parts.push(cyl(STONE, [0, d0, 0], r, r, spec.drumHeight, 32));
  parts.push(cyl(STONE, [0, d0 + spec.drumHeight - 0.4, 0], r + 0.28, r + 0.28, 0.4, 32));
  const around = 16;
  for (let i = 0; i < around; i += 1) {
    const a = (Math.PI * 2 * i) / around;
    const mid = a + Math.PI / around;
    // Paired shafts between the arches, a window in every other bay.
    for (const d of [-0.05, 0.05]) {
      const b = a + d;
      parts.push(
        cyl(
          STONE,
          [Math.sin(b) * (r + 0.08), d0 + 0.3, Math.cos(b) * (r + 0.08)],
          0.07,
          0.07,
          spec.drumHeight - 1.9,
          8,
        ),
      );
    }
    const at: Vec3 = [
      Math.sin(mid) * (r + 0.07),
      d0 + spec.drumHeight - 1.6,
      Math.cos(mid) * (r + 0.07),
    ];
    const chord = 2 * r * Math.sin(Math.PI / around);
    parts.push({
      kind: "carving",
      material: STONE,
      at,
      outline: archBand(chord / 2 - 0.1, 0.12, 0, 7),
      depth: 0.12,
      sink: 0.5,
      rotY: mid,
    });
    if (i % 2 === 0) {
      parts.push(
        box(
          "shadow",
          [Math.sin(mid) * (r + 0.006), d0 + 1.3, Math.cos(mid) * (r + 0.006)],
          [0.42, 1.9, 0.012],
          mid,
        ),
      );
    }
  }
  parts.push(cyl("stoneDark", [0, d0 + spec.drumHeight, 0], r + 0.45, 0.25, spec.coneHeight, 32));
  // A stone cross on the point of the cone.
  const tip = d0 + spec.drumHeight + spec.coneHeight;
  parts.push(
    box(STONE, [0, tip - 0.1, 0], [0.22, 1.7, 0.22]),
    box(STONE, [0, tip + 0.95, 0], [0.9, 0.2, 0.22]),
  );

  // The city wall behind the apse: the inner wall high, with round towers
  // standing out from it, and the lower outer wall beyond.
  const wz = hz + 26;
  const len = spec.wallLength;
  parts.push(box(STONE, [0, 0, wz], [len, 11, 3.2]));
  parts.push(box(STONE, [0, 0, wz + 11], [len, 5.5, 2.2]));
  const merlon = (x: number, y: number, z: number, rot = 0) =>
    box(STONE, [x, y, z], [0.9, 1.1, 0.7], rot);
  for (let x = -len / 2 + 0.8; x < len / 2 - 0.5; x += 1.6) {
    parts.push(merlon(x, 11, wz + 1.25), merlon(x, 5.5, wz + 11.75));
  }
  parts.push(
    ...ashlar({
      at: [0, 0, wz - 1.6],
      rotY: FACING.south,
      length: len,
      height: 11,
      course: 0.55,
      material: STONE,
      joint: "stoneDark",
      blocks: 1.2,
      foot: false,
      coping: false,
    }),
  );
  for (let i = 0; i < spec.wallTowers; i += 1) {
    const x = -len / 2 + (len * (i + 0.5)) / spec.wallTowers;
    const R = 4;
    parts.push(
      cyl(STONE, [x, 0, wz + 1.6], R, R - 0.3, 13, 20, {
        thetaStart: -Math.PI / 2,
        thetaLength: Math.PI,
      }),
    );
    for (let k = 0; k < 9; k += 1) {
      const a = -Math.PI / 2 + ((k + 0.5) * Math.PI) / 9;
      parts.push(merlon(x + Math.sin(a) * (R - 0.6), 13, wz + 1.6 + Math.cos(a) * (R - 0.6), a));
    }
    // A cross set in dark stone on the face of the tower, as on Ani's walls.
    const cz = wz + 1.6 + R - 0.15;
    parts.push({
      kind: "carving",
      material: "stoneDark",
      at: [x, 7.5, cz],
      outline: [
        [-0.15, 0],
        [0.15, 0],
        [0.15, 0.9],
        [0.5, 0.9],
        [0.5, 1.2],
        [0.15, 1.2],
        [0.15, 1.6],
        [-0.15, 1.6],
        [-0.15, 1.2],
        [-0.5, 1.2],
        [-0.5, 0.9],
        [-0.15, 0.9],
      ],
      depth: 0.08,
      sink: 0.4,
      rotY: 0,
    });
  }

  // The plateau between the Arpaçay and the Bostanlar gorges: grass and rock.
  parts.push(...setting(40, 9091, { stone: 0.9, grass: 0.9, hills: 0.5, ground: "stone" }));
  return parts;
}

/** In front of the west door, looking up at the front and the dome. */
export function cathedralWalkStart(spec: CathedralSpec): WalkStart {
  return {
    at: [2.5, -spec.length / 2 - 12],
    floor: 0,
    look: [0, spec.eaveHeight * 0.55, -spec.length / 2],
  };
}
