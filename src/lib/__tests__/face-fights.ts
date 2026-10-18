import type { Part } from "@/lib/reconstruction-parts";

/*
 * Two faces that look the same way and lie within a few centimetres of each
 * other fight over the same pixels: the depth buffer cannot tell which is in
 * front, and the losing colour shows through in stripes that crawl as the
 * camera moves. On a desktop GPU the stripes need a long view to appear; on a
 * phone they show across a theatre. This finds them in a part list.
 *
 * Box faces and the flat front and back of carvings are compared. A pair is
 * ignored when the face in front is a paint layer drawn over the stone on
 * purpose (it is pulled forward by a polygon offset, see `DECALS` in the
 * renderer), and when the place they overlap is buried inside some other
 * solid block, where no camera can see it.
 */

type V = [number, number, number];

/** The renderer's paint layers, in the order of how hard each is pulled forward. */
const DECALS = [
  "paintRed",
  "paintBlue",
  "paintGold",
  "shadow",
  "stoneDark",
  "timber",
  "lettering",
  "letteringDark",
  "fadedRed",
  "fadedBlue",
];
const pull = (material: string) => DECALS.indexOf(material) + 1;
/** Materials the renderer draws in one flat colour, without a tint for each piece. */
const UNTINTED = [
  "shadow",
  "human",
  "paintRed",
  "paintBlue",
  "paintGold",
  "bronze",
  "foliage",
  "linen",
  "lettering",
  "letteringDark",
];

type Face = {
  /** Unit normal and the plane's offset along it. */
  n: V;
  d: number;
  /** Corners, in order, in world space. */
  pts: V[];
  index: number;
  material: string;
};

type Solid = {
  index: number;
  min: V;
  max: V;
  inside: (p: V) => boolean;
};

const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** A box's local point to world: up from its base, tipped by rotX, turned by rotY. */
function boxFrame(part: Extract<Part, { kind: "box" }>) {
  const rx = part.rotX ?? 0;
  const ry = part.rotY ?? 0;
  const [cx, sx, cy, sy] = [Math.cos(rx), Math.sin(rx), Math.cos(ry), Math.sin(ry)];
  const rotate = (x: number, y: number, z: number): V => {
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    return [x * cy + z1 * sy, y1, -x * sy + z1 * cy];
  };
  const toWorld = (x: number, y: number, z: number): V => {
    const r = rotate(x, y, z);
    return [r[0] + part.at[0], r[1] + part.at[1], r[2] + part.at[2]];
  };
  // The inverse, for asking whether a point is inside.
  const toLocal = (p: V): V => {
    const x0 = p[0] - part.at[0];
    const y0 = p[1] - part.at[1];
    const z0 = p[2] - part.at[2];
    const x = x0 * cy - z0 * sy;
    const z1 = x0 * sy + z0 * cy;
    const y = y0 * cx + z1 * sx;
    const z = -y0 * sx + z1 * cx;
    return [x, y, z];
  };
  return { rotate, toWorld, toLocal };
}

function boxFaces(part: Extract<Part, { kind: "box" }>, index: number): Face[] {
  const [w, h, depth] = part.size;
  const { rotate, toWorld } = boxFrame(part);
  const [hw, hd] = [w / 2, depth / 2];
  const sides: [V, [number, number, number][]][] = [
    [
      [1, 0, 0],
      [
        [hw, 0, -hd],
        [hw, h, -hd],
        [hw, h, hd],
        [hw, 0, hd],
      ],
    ],
    [
      [-1, 0, 0],
      [
        [-hw, 0, -hd],
        [-hw, 0, hd],
        [-hw, h, hd],
        [-hw, h, -hd],
      ],
    ],
    [
      [0, 1, 0],
      [
        [-hw, h, -hd],
        [-hw, h, hd],
        [hw, h, hd],
        [hw, h, -hd],
      ],
    ],
    [
      [0, -1, 0],
      [
        [-hw, 0, -hd],
        [hw, 0, -hd],
        [hw, 0, hd],
        [-hw, 0, hd],
      ],
    ],
    [
      [0, 0, 1],
      [
        [-hw, 0, hd],
        [hw, 0, hd],
        [hw, h, hd],
        [-hw, h, hd],
      ],
    ],
    [
      [0, 0, -1],
      [
        [-hw, 0, -hd],
        [-hw, h, -hd],
        [hw, h, -hd],
        [hw, 0, -hd],
      ],
    ],
  ];
  // A letter stroke is only its front face.
  const strokeOnly = part.material === "lettering" || part.material === "letteringDark";
  return sides
    .filter(([n]) => !strokeOnly || n[2] === 1)
    .map(([nl, corners]) => {
      const n = rotate(...nl);
      const pts = corners.map(([x, y, z]) => toWorld(x, y, z));
      return { n, d: dot(n, pts[0]!), pts, index, material: part.material };
    });
}

/** A carving's frame: its outline turned in its own plane, then about the vertical. */
function carvingFrame(part: Extract<Part, { kind: "carving" }>) {
  const rz = part.rotZ ?? 0;
  const ry = part.rotY ?? 0;
  const [cz, sz, cy, sy] = [Math.cos(rz), Math.sin(rz), Math.cos(ry), Math.sin(ry)];
  const bevel = Math.min(0.02, part.depth * 0.3);
  const back = -part.depth * (part.sink ?? 0.4) - bevel;
  const front = part.depth * (1 - (part.sink ?? 0.4)) + bevel;
  const rotate = (x: number, y: number, z: number): V => {
    const x1 = x * cz - y * sz;
    const y1 = x * sz + y * cz;
    return [x1 * cy + z * sy, y1, -x1 * sy + z * cy];
  };
  const toWorld = (x: number, y: number, z: number): V => {
    const r = rotate(x, y, z);
    return [r[0] + part.at[0], r[1] + part.at[1], r[2] + part.at[2]];
  };
  const toLocal = (p: V): V => {
    const x0 = p[0] - part.at[0];
    const y0 = p[1] - part.at[1];
    const z0 = p[2] - part.at[2];
    const x1 = x0 * cy - z0 * sy;
    const z = x0 * sy + z0 * cy;
    return [x1 * cz + y0 * sz, -x1 * sz + y0 * cz, z];
  };
  return { rotate, toWorld, toLocal, back, front };
}

function carvingFaces(part: Extract<Part, { kind: "carving" }>, index: number): Face[] {
  const { rotate, toWorld, back, front } = carvingFrame(part);
  const faces: Face[] = [];
  for (const [z, sign] of [
    [front, 1],
    [back, -1],
  ] as const) {
    const n = rotate(0, 0, sign);
    const pts = part.outline.map(([u, v]) => toWorld(u, v, z));
    faces.push({ n, d: dot(n, pts[0]!), pts, index, material: part.material });
  }
  return faces;
}

function insidePolygon(u: number, v: number, outline: [number, number][]) {
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i, i += 1) {
    const [ui, vi] = outline[i]!;
    const [uj, vj] = outline[j]!;
    if (vi > v !== vj > v && u < ((uj - ui) * (v - vi)) / (vj - vi) + ui) inside = !inside;
  }
  return inside;
}

function solidOf(part: Part, index: number): Solid | null {
  if (part.kind === "box") {
    if (part.material === "lettering" || part.material === "letteringDark") return null;
    const [w, h, depth] = part.size;
    const { toWorld, toLocal } = boxFrame(part);
    const e = 0.002;
    const corners = [-1, 1].flatMap((a) =>
      [0, 1].flatMap((b) => [-1, 1].map((c) => toWorld((a * w) / 2, b * h, (c * depth) / 2))),
    );
    return {
      index,
      min: [0, 1, 2].map((k) => Math.min(...corners.map((p) => p[k]!))) as V,
      max: [0, 1, 2].map((k) => Math.max(...corners.map((p) => p[k]!))) as V,
      inside: (p) => {
        const [x, y, z] = toLocal(p);
        return Math.abs(x) < w / 2 - e && y > e && y < h - e && Math.abs(z) < depth / 2 - e;
      },
    };
  }
  if (part.kind === "carving") {
    const { toWorld, toLocal, back, front } = carvingFrame(part);
    const corners = part.outline.flatMap(([u, v]) => [toWorld(u, v, back), toWorld(u, v, front)]);
    return {
      index,
      min: [0, 1, 2].map((k) => Math.min(...corners.map((p) => p[k]!))) as V,
      max: [0, 1, 2].map((k) => Math.max(...corners.map((p) => p[k]!))) as V,
      inside: (p) => {
        const [u, v, z] = toLocal(p);
        return z > back + 0.002 && z < front - 0.002 && insidePolygon(u, v, part.outline);
      },
    };
  }
  return null;
}

/** The area of the overlap of two convex polygons in one plane, and its corners. */
function overlap(a: [number, number][], b: [number, number][]): [number, number][] {
  const ccw = (p: [number, number][]) => (signedArea(p) < 0 ? [...p].reverse() : p);
  let out = ccw(a);
  const clipper = ccw(b);
  for (let i = 0; i < clipper.length && out.length > 0; i += 1) {
    const p0 = clipper[i]!;
    const p1 = clipper[(i + 1) % clipper.length]!;
    const side = (p: [number, number]) =>
      (p1[0] - p0[0]) * (p[1] - p0[1]) - (p1[1] - p0[1]) * (p[0] - p0[0]);
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j += 1) {
      const p = input[j]!;
      const q = input[(j + 1) % input.length]!;
      const sp = side(p);
      const sq = side(q);
      if (sp >= 0) out.push(p);
      if (sp >= 0 !== sq >= 0) {
        const t = sp / (sp - sq);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    }
  }
  return out;
}

function signedArea(p: [number, number][]) {
  let s = 0;
  for (let i = 0; i < p.length; i += 1) {
    const [x1, y1] = p[i]!;
    const [x2, y2] = p[(i + 1) % p.length]!;
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}

/** Whether a carving's outline is convex, which the overlap needs. */
function convex(p: [number, number][]) {
  let sign = 0;
  for (let i = 0; i < p.length; i += 1) {
    const [ax, ay] = p[i]!;
    const [bx, by] = p[(i + 1) % p.length]!;
    const [cx, cy] = p[(i + 2) % p.length]!;
    const z = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (Math.abs(z) < 1e-9) continue;
    if (sign === 0) sign = Math.sign(z);
    else if (Math.sign(z) !== sign) return false;
  }
  return true;
}

export type Fight = {
  front: Part;
  back: Part;
  gap: number;
  area: number;
  /** Where the two overlap, roughly. */
  at: V;
  normal: V;
};

export function faceFights(
  parts: Part[],
  options: { gap?: number; area?: number; scatter?: boolean } = {},
): Fight[] {
  // Three centimetres, less a hair for the rounding of parts laid exactly 3 cm apart.
  const maxGap = options.gap ?? 0.0295;
  const minArea = options.area ?? 0.02;
  const faces: Face[] = [];
  const solids: Solid[] = [];
  parts.forEach((part, index) => {
    // A scan is drawn in place of the part, and a weathered block is pushed
    // about by noise until no face of it is a plane.
    if (part.scan || part.weather) return;
    if (part.kind === "box") {
      // A lettered plate and a block carrying a photograph are drawn by
      // their own passes, not as a plain box.
      if (part.lettering || part.carving) return;
      faces.push(...boxFaces(part, index));
    } else if (part.kind === "carving") {
      faces.push(...carvingFaces(part, index));
    } else return;
    const solid = solidOf(part, index);
    if (solid) solids.push(solid);
  });

  // Solids in a coarse grid, for the question "is this point inside anything?".
  const CELL = 4;
  const grid = new Map<string, Solid[]>();
  for (const solid of solids) {
    const [x0, y0, z0] = solid.min.map((v) => Math.floor(v / CELL));
    const [x1, y1, z1] = solid.max.map((v) => Math.floor(v / CELL));
    if ((x1! - x0! + 1) * (y1! - y0! + 1) * (z1! - z0! + 1) > 4000) continue;
    for (let x = x0!; x <= x1!; x += 1)
      for (let y = y0!; y <= y1!; y += 1)
        for (let z = z0!; z <= z1!; z += 1) {
          const key = `${x},${y},${z}`;
          const list = grid.get(key);
          if (list) list.push(solid);
          else grid.set(key, [solid]);
        }
  }
  const buried = (p: V, skip: number[]) => {
    const key = p.map((v) => Math.floor(v / CELL)).join(",");
    for (const solid of grid.get(key) ?? [])
      if (!skip.includes(solid.index) && solid.inside(p)) return true;
    return false;
  };

  // Faces bucketed by which way they look.
  const buckets = new Map<string, Face[]>();
  for (const face of faces) {
    const key = face.n.map((v) => Math.round(v * 500)).join(",");
    const list = buckets.get(key);
    if (list) list.push(face);
    else buckets.set(key, [face]);
  }
  const fights: Fight[] = [];
  for (const list of buckets.values()) {
    list.sort((a, b) => a.d - b.d);
    const n = list[0]!.n;
    // An underside is seen only from beneath: the bed of a block, a slab on
    // the ground, the soffit over a seat. None is in view from where people go.
    if (n[1] < -0.5) continue;
    const helper: V = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u0 = cross(helper, n);
    const ul = Math.hypot(...u0);
    const u: V = [u0[0] / ul, u0[1] / ul, u0[2] / ul];
    const v = cross(n, u);
    const flat = (f: Face) => f.pts.map((p): [number, number] => [dot(p, u), dot(p, v)]);
    const flats = new Map<Face, [number, number][]>();
    const convexity = new Map<Face, boolean>();
    const convexFace = (f: Face) => {
      let got = convexity.get(f);
      if (got === undefined) convexity.set(f, (got = convex(flatOf(f))));
      return got;
    };
    const flatOf = (f: Face) => {
      let got = flats.get(f);
      if (!got) flats.set(f, (got = flat(f)));
      return got;
    };
    for (let i = 0; i < list.length; i += 1) {
      const a = list[i]!;
      for (let j = i + 1; j < list.length && list[j]!.d - a.d < maxGap; j += 1) {
        const b = list[j]!;
        if (a.index === b.index || dot(a.n, b.n) < 0.99999) continue;
        // Two stones of the scatter on the ground, wherever chance put them.
        if (options.scatter !== false && parts[a.index]!.decor && parts[b.index]!.decor) continue;
        // Which is in front, and whether it is meant to be drawn over the other.
        const gap = b.d - a.d;
        const [front, back] = [b, a];
        // Paint over stone is meant; one paint over another is not, as a dark
        // kerb laid over a pool's water once showed.
        if (pull(front.material) > 0 && pull(back.material) === 0) continue;
        // One stone in one plane differs only by the tint of each block, and
        // paint or shadow, which takes no tint, not even by that.
        if (front.material === back.material && (gap < 0.001 || UNTINTED.includes(front.material)))
          continue;
        const pa = flatOf(a);
        const pb = flatOf(b);
        // A quick rejection on the extents first.
        const ext = (p: [number, number][], k: 0 | 1) => [
          Math.min(...p.map((q) => q[k])),
          Math.max(...p.map((q) => q[k])),
        ];
        const [ax0, ax1] = ext(pa, 0);
        const [bx0, bx1] = ext(pb, 0);
        if (ax1! <= bx0! || bx1! <= ax0!) continue;
        const [ay0, ay1] = ext(pa, 1);
        const [by0, by1] = ext(pb, 1);
        if (ay1! <= by0! || by1! <= ay0!) continue;
        // The clipping needs the clipper convex; a box always is.
        const shared = convexFace(b) ? overlap(pa, pb) : convexFace(a) ? overlap(pb, pa) : [];
        const area = shared.length >= 3 ? Math.abs(signedArea(shared)) : 0;
        if (area < minArea) continue;
        // Seen from in front of the front face, is the overlap buried?
        const cu = shared.reduce((s, p) => s + p[0], 0) / shared.length;
        const cv = shared.reduce((s, p) => s + p[1], 0) / shared.length;
        const samples: [number, number][] = [
          [cu, cv],
          ...shared.map(([pu, pv]): [number, number] => [
            cu + (pu - cu) * 0.8,
            cv + (pv - cv) * 0.8,
          ]),
        ];
        const lift = front.d + 0.01;
        const world = ([su, sv]: [number, number]): V => [
          u[0] * su + v[0] * sv + n[0] * lift,
          u[1] * su + v[1] * sv + n[1] * lift,
          u[2] * su + v[2] * sv + n[2] * lift,
        ];
        if (samples.every((s) => buried(world(s), [a.index, b.index]))) continue;
        fights.push({
          front: parts[front.index]!,
          back: parts[back.index]!,
          gap,
          area,
          at: world([cu, cv]),
          normal: n,
        });
      }
    }
  }
  return fights;
}
