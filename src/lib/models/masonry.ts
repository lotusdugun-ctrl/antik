import { onFace } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitSeeded as seeded,
  type Material,
  type Part,
  type Vec3,
} from "@/lib/reconstruction-parts";

/**
 * Walling for the Bronze Age, Neolithic and medieval models (Hattusa, Troy,
 * Çatalhöyük, Ani): the polygonal masonry of a Hittite socle, a slab laid to
 * a slope, a stepped ramp a person can walk up, and a face of mud plaster.
 *
 * Everything here returns ordinary parts in metres, `y` up and `at` the
 * bottom centre, the same as `reconstruction-parts.ts`.
 */

type Outline = [number, number][];

/** Linear interpolation of a polyline given as sorted [x, y] knots. */
function heightOn(knots: Outline, x: number): number {
  if (x <= knots[0]![0]) return knots[0]![1];
  for (let i = 1; i < knots.length; i += 1) {
    const [x1, y1] = knots[i]!;
    if (x <= x1) {
      const [x0, y0] = knots[i - 1]!;
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
  }
  return knots[knots.length - 1]![1];
}

/**
 * A face of polygonal masonry: big stones, no two alike, fitted to one
 * another along joints that run at a slant rather than in level courses —
 * the way the socles of the Hattusa walls and gates were laid.
 *
 * Each stone is a slab cut to its own outline and pushed out of the face by a
 * few centimetres, its edges bevelled, so the joints read as dark lines and
 * every block catches the light on its own. The face is the plane through
 * `at` (its bottom centre) that `rotY` turns `+z` out of; `width` and
 * `height` are its extent, `size` the average stone.
 */
export function polygonalFace(options: {
  material: Material;
  at: Vec3;
  rotY: number;
  width: number;
  height: number;
  size: number;
  seed: number;
  /** How far each stone stands proud of the plane, at most. */
  proud?: number;
  /** A level top course, where a mud-brick wall sits on the stone. */
  levelTop?: boolean;
  /**
   * How wide the joints open between the stones. The faces of Hittite
   * stones were dressed with a rounded margin, so even a tight joint reads
   * as a dark line a few centimetres wide.
   */
  gap?: number;
}): Part[] {
  const { material, at, rotY, width, height, size } = options;
  const random = seeded(options.seed);
  const proud = options.proud ?? 0.06;
  const gap = options.gap ?? 0;
  const half = width / 2;
  // The course lines: a jagged polyline across the face every course.
  const lines: Outline[] = [];
  const courses = Math.max(1, Math.round(height / size));
  for (let c = 0; c <= courses; c += 1) {
    const base = (height * c) / courses;
    if (c === 0 || (c === courses && options.levelTop !== false)) {
      lines.push([
        [-half, base],
        [half, base],
      ]);
      continue;
    }
    const knots: Outline = [[-half, base + (random() - 0.5) * size * 0.3]];
    let x = -half + size * (0.4 + random() * 0.6);
    while (x < half - size * 0.3) {
      knots.push([x, base + (random() - 0.5) * size * 0.42]);
      x += size * (0.5 + random() * 0.8);
    }
    knots.push([half, base + (random() - 0.5) * size * 0.3]);
    lines.push(knots);
  }
  const parts: Part[] = [];
  for (let c = 0; c < courses; c += 1) {
    const below = lines[c]!;
    const above = lines[c + 1]!;
    // Upright joints, each leaning its own way.
    const joints: [number, number][] = [[-half, -half]];
    let x = -half + size * (0.7 + random() * 0.9);
    while (x < half - size * 0.45) {
      const lean = (random() - 0.5) * size * 0.5;
      joints.push([x - lean / 2, x + lean / 2]);
      x += size * (0.75 + random() * 1.0);
    }
    joints.push([half, half]);
    for (let j = 0; j < joints.length - 1; j += 1) {
      const [bl, tl] = joints[j]!;
      const [br, tr] = joints[j + 1]!;
      const outline: Outline = [[bl, heightOn(below, bl)]];
      for (const knot of below) if (knot[0] > bl + 0.05 && knot[0] < br - 0.05) outline.push(knot);
      outline.push([br, heightOn(below, br)]);
      outline.push([tr, heightOn(above, tr)]);
      for (const knot of [...above].reverse())
        if (knot[0] < tr - 0.05 && knot[0] > tl + 0.05) outline.push(knot);
      outline.push([tl, heightOn(above, tl)]);
      const out = proud * (0.35 + random() * 0.65);
      parts.push({
        kind: "carving",
        material,
        at: onFace(at, rotY, 0, 0, out - 0.1),
        outline: gap > 0 ? shrunk(outline, gap / 2) : outline,
        depth: 0.2,
        sink: 0.5,
        rotY,
      });
    }
  }
  if (gap > 0) {
    // The joints: the dark of the packing and the shadow between the stones,
    // a plate on the face behind them that shows only where they part.
    // Its back is buried in the wall behind, where it meets nothing.
    // Short of the corners and the top, where it would lie in another face.
    parts.push(
      box("stoneDark", onFace(at, rotY, 0, 0, -0.043), [width - 0.26, height - 0.05, 0.11], rotY),
    );
  }
  return parts;
}

/**
 * An outline pulled in towards its middle by `by` metres, near enough: each
 * corner moved along the line to the centroid. Enough to open a joint between
 * two stones that were cut along the same line.
 */
function shrunk(outline: Outline, by: number): Outline {
  let cx = 0;
  let cy = 0;
  for (const [x, y] of outline) {
    cx += x;
    cy += y;
  }
  cx /= outline.length;
  cy /= outline.length;
  return outline.map(([x, y]) => {
    const d = Math.hypot(cx - x, cy - y);
    const k = d > by * 3 ? by / d : 0.3;
    // Keep the corners on their side of the middle, and more than a hair
    // apart: the extrusion's triangulation wants a clean outline.
    return [x + (cx - x) * k, y + (cy - y) * k];
  });
}

/**
 * The stone facing of a rampart slope: courses of rough slabs laid up the
 * slope, each a block of its own length, set a little proud of one another
 * so every stone catches the light and the joints between them read dark.
 * From `foot` (the middle of the bottom edge) it rises `rise` over `run`
 * towards `+z` once `rotY` has turned it, on top of a dark bedding slab.
 */
export function pitchedFace(options: {
  material: Material;
  foot: Vec3;
  rotY: number;
  width: number;
  run: number;
  rise: number;
  /** The average stone, along the face and up the slope. */
  size: [number, number];
  seed: number;
}): Part[] {
  const { material, foot, rotY, width, run, rise, size } = options;
  const random = seeded(options.seed);
  const angle = Math.atan2(rise, run);
  const length = Math.hypot(run, rise);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const thick = 0.24;
  const gap = 0.05;
  const parts: Part[] = [];
  // Each stone: centre `s` up the slope and `u` along it, standing `proud`
  // above the bedding, tipped to the slope.
  const stone = (u: number, s: number, w: number, l: number, proud: number) =>
    parts.push({
      kind: "box",
      material,
      at: onFace(foot, rotY, u, s * sin + (proud - thick) * cos, s * cos - (proud - thick) * sin),
      size: [w, thick, l],
      rotY,
      rotX: -angle,
    });
  // A margin all round, so no stone's edge lies in the edge of the bed.
  const margin = 0.06;
  const span = width / 2 - margin;
  const courses = Math.max(1, Math.round((length - 2 * margin) / size[1]));
  const step = (length - 2 * margin) / courses;
  for (let c = 0; c < courses; c += 1) {
    const s = margin + (c + 0.5) * step;
    let u = -span;
    // Stagger the first joint of every course.
    let w = size[0] * (c % 2 ? 0.55 : 1) * (0.7 + random() * 0.5);
    while (u < span - 0.05) {
      w = Math.min(w, span - u);
      // A last sliver is folded into the stone before it.
      if (span - u - w < size[0] * 0.35) w = span - u;
      stone(u + w / 2, s, w - gap, step - gap, 0.04 + random() * 0.05);
      u += w;
      w = size[0] * (0.6 + random() * 0.8);
    }
  }
  return parts;
}

/**
 * A slab laid to a slope, rising from its low edge at `foot` towards `+z`
 * once `rotY` has turned it: `run` across the plan, `rise` up. A glacis, a
 * ramp's paving, a pitched roof.
 */
export function slopedSlab(
  material: Material,
  foot: Vec3,
  rotY: number,
  width: number,
  run: number,
  rise: number,
  thickness = 0.3,
): Part {
  const angle = Math.atan2(rise, run);
  const length = Math.hypot(run, rise);
  return {
    kind: "box",
    material,
    at: onFace(
      foot,
      rotY,
      0,
      rise / 2 - thickness * Math.cos(angle),
      run / 2 + thickness * Math.sin(angle),
    ),
    size: [width, thickness, length],
    rotY,
    rotX: -angle,
  };
}

/**
 * A ramp climbed in low treads, solid to the ground under every one: from
 * `foot` (the middle of its bottom edge) it rises `rise` over `run` towards
 * `+z` once `rotY` has turned it. Each tread is a block standing on the
 * ground, so someone walking it stands on stone the whole way up.
 */
export function steppedRamp(
  material: Material,
  foot: Vec3,
  rotY: number,
  width: number,
  run: number,
  rise: number,
  tread = 0.7,
): Part[] {
  const steps = Math.max(1, Math.round(run / tread));
  const parts: Part[] = [];
  for (let i = 0; i < steps; i += 1) {
    const h = (rise * (i + 1)) / steps;
    parts.push(
      box(
        material,
        onFace(foot, rotY, 0, 0, (run * (i + 0.5)) / steps),
        [width, h, run / steps],
        rotY,
      ),
    );
  }
  return parts;
}

/**
 * Lines drawn across a face a hair proud of it: the joints of the courses of
 * an ashlar wall, or the timber lacing of a mud-brick one. `ys` are heights
 * up the face from `at`.
 */
export function bands(
  material: Material,
  at: Vec3,
  rotY: number,
  width: number,
  ys: number[],
  height: number,
  proud = 0.035,
): Part[] {
  return ys.map((y) =>
    box(material, onFace(at, rotY, 0, y, proud / 2), [width, height, proud + 0.008], rotY),
  );
}

/** A full turn. */
export const TAU = Math.PI * 2;
