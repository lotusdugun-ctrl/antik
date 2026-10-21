import {
  kitBox as box,
  kitCyl as cyl,
  kitLoft as loft,
  kitScenery as scenery,
  type Material,
  type Part,
  type Vec3,
} from "@/lib/reconstruction-parts";

/**
 * Pieces the Sagalassos, Zeugma, Sümela and Patara models share: a true arch
 * laid in voussoirs, a mosaic floor drawn in tesserae-coloured skins, the
 * painted panels of a wall, and the trees of a wooded slope.
 *
 * The mosaic and fresco designs here are this app's own: borders, meanders,
 * rosettes and chequers of the kinds Roman floors and Byzantine walls used,
 * not copies of any surviving floor or painting.
 */

const TAU = Math.PI * 2;

/**
 * A round arch of `pieces` voussoirs, standing in the plane `z = centre[2]`
 * (or `x = centre[0]` when `alongZ`): its intrados a half circle of `radius`
 * round `centre`, each stone `thickness` deep radially and `depth` through
 * the wall. A voussoir is a box tipped by `rotX` and turned by `rotY`, so the
 * arch is built of the same blocks the renderer already draws.
 */
export function arch(
  material: Material,
  centre: Vec3,
  radius: number,
  thickness: number,
  depth: number,
  pieces = 9,
  alongZ = false,
): Part[] {
  const parts: Part[] = [];
  const step = Math.PI / pieces;
  for (let i = 0; i < pieces; i += 1) {
    const a = -Math.PI / 2 + step * (i + 0.5);
    const length = 2 * radius * Math.tan(step / 2) * 1.04;
    const s = Math.sin(a);
    const c = Math.cos(a);
    if (alongZ) {
      // Tipped about x: the radial direction runs (0, cos a, sin a).
      parts.push({
        kind: "box",
        material,
        at: [centre[0], centre[1] + radius * c, centre[2] + radius * s],
        size: [depth, thickness, length],
        rotY: 0,
        rotX: a,
      });
    } else {
      // Tipped about x, then turned a quarter: the radial direction runs (sin a, cos a, 0).
      parts.push({
        kind: "box",
        material,
        at: [centre[0] + radius * s, centre[1] + radius * c, centre[2]],
        size: [depth, thickness, length],
        rotY: Math.PI / 2,
        rotX: a,
      });
    }
  }
  return parts;
}

/**
 * A segmental pediment: a low arc of moulding over a filled tympanum, `width`
 * across at its foot and `rise` high, its front at `z` and `depth` deep
 * (running back towards +z). A half drum, which is what a round pediment is
 * usually modelled as, reads as a dome when the arc has to span the whole
 * width; a real segmental pediment is a slice of a much larger circle.
 */
export function segmentPediment(
  material: Material,
  x: number,
  y: number,
  z: number,
  width: number,
  rise: number,
  depth: number,
): Part[] {
  const parts: Part[] = [];
  const half = width / 2;
  const r = (half * half + rise * rise) / (2 * rise);
  const cy = y + rise - r;
  const band = Math.min(0.3, rise * 0.3);
  const inner = r - band;
  const reach = Math.asin(Math.min(1, half / r));
  const pieces = 9;
  const step = (2 * reach) / pieces;
  for (let i = 0; i < pieces; i += 1) {
    const a = -reach + step * (i + 0.5);
    parts.push({
      kind: "box",
      material,
      at: [x + inner * Math.sin(a), cy + inner * Math.cos(a), z + depth / 2],
      size: [depth, band, 2 * inner * Math.tan(step / 2) * 1.06],
      rotY: Math.PI / 2,
      rotX: a,
    });
  }
  // The tympanum under the arc, in courses that narrow as they rise.
  const courses = 4;
  for (let k = 0; k < courses; k += 1) {
    const top = y + ((rise - band) * (k + 1)) / courses;
    const w = 2 * Math.sqrt(Math.max(0, inner * inner - (top - cy) ** 2));
    parts.push(
      box(
        material,
        [x, y + ((rise - band) * k) / courses, z + depth / 2 + 0.06],
        [w, (rise - band) / courses, depth - 0.12],
      ),
    );
  }
  return parts;
}

/* ------------------------------------------------------------------ *
 * Mosaic floors
 * ------------------------------------------------------------------ */

/** A skin of tesserae a centimetre proud of the floor it is laid on. */
const SKIN = 0.012;

/** A rectangle on the floor: centre, size along x and along z. */
export type Rect = { x: number; z: number; w: number; d: number };

const tile = (
  material: Material,
  y: number,
  x: number,
  z: number,
  w: number,
  d: number,
  rotY = 0,
) => box(material, [x, y, z], [w, SKIN, d], rotY);

/**
 * A frame of four bands round a rectangle, `inset` in from its edge. The
 * long bands run the full length and the short ones stop against them, so
 * no two skins lie on top of each other.
 */
export function frame(
  material: Material,
  y: number,
  r: Rect,
  inset: number,
  width: number,
): Part[] {
  const w = r.w - inset * 2;
  const d = r.d - inset * 2;
  if (w <= width * 2 || d <= width * 2) return [];
  return [
    tile(material, y, r.x, r.z - d / 2 + width / 2, w, width),
    tile(material, y, r.x, r.z + d / 2 - width / 2, w, width),
    tile(material, y, r.x - w / 2 + width / 2, r.z, width, d - width * 2),
    tile(material, y, r.x + w / 2 - width / 2, r.z, width, d - width * 2),
  ];
}

/** A chequer of dark squares over a rectangle; the floor itself is the light ones. */
export function chequer(material: Material, y: number, r: Rect, cell: number): Part[] {
  const parts: Part[] = [];
  const nx = Math.max(1, Math.floor(r.w / cell));
  const nz = Math.max(1, Math.floor(r.d / cell));
  const cx = r.w / nx;
  const cz = r.d / nz;
  for (let i = 0; i < nx; i += 1)
    for (let k = 0; k < nz; k += 1)
      if ((i + k) % 2 === 0)
        parts.push(
          tile(
            material,
            y,
            r.x - r.w / 2 + cx * (i + 0.5),
            r.z - r.d / 2 + cz * (k + 0.5),
            cx * 0.98,
            cz * 0.98,
          ),
        );
  return parts;
}

/**
 * A band of lozenges, turned squares standing point to point along it, in
 * two colours by turns: the simplest of the running borders.
 */
export function lozengeBand(
  materials: Material[],
  y: number,
  from: [number, number],
  to: [number, number],
  width: number,
): Part[] {
  const parts: Part[] = [];
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const count = Math.max(1, Math.floor(length / width));
  const side = (width / Math.SQRT2) * 0.86;
  const along = Math.atan2(to[0] - from[0], to[1] - from[1]);
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    parts.push(
      tile(
        materials[i % materials.length]!,
        y,
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        side,
        side,
        along + Math.PI / 4,
      ),
    );
  }
  return parts;
}

/**
 * A meander along a band: the squared key of Greek and Roman borders, as a
 * run of hooks drawn in strokes of one colour. `from` to `to` is the band's
 * middle line, `width` its breadth.
 */
export function meander(
  material: Material,
  y: number,
  from: [number, number],
  to: [number, number],
  width: number,
): Part[] {
  const parts: Part[] = [];
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const ux = (to[0] - from[0]) / length;
  const uz = (to[1] - from[1]) / length;
  // Across the band: the left-hand normal.
  const vx = -uz;
  const vz = ux;
  const stroke = width / 5;
  const unit = width;
  const count = Math.max(1, Math.floor(length / unit));
  const start = (length - count * unit) / 2;
  const rotAlong = Math.atan2(ux, uz);
  const at = (s: number, t: number): [number, number] => [
    from[0] + ux * s + vx * t,
    from[1] + uz * s + vz * t,
  ];
  // A stroke from (s0, t0) to (s1, t1) in the band's own frame.
  const bar = (s0: number, t0: number, s1: number, t1: number) => {
    const [x, z] = at((s0 + s1) / 2, (t0 + t1) / 2);
    const ls = Math.abs(s1 - s0);
    const lt = Math.abs(t1 - t0);
    // Running along the band: long in its own z; across it: long in its x.
    if (ls >= lt) parts.push(tile(material, y, x, z, stroke, ls + stroke, rotAlong));
    else parts.push(tile(material, y, x, z, lt + stroke, stroke, rotAlong));
  };
  const h = width / 2 - stroke / 2;
  // The base line under the hooks, then one hook to every unit.
  bar(start, -h, start + count * unit, -h);
  for (let i = 0; i < count; i += 1) {
    const s = start + i * unit;
    const g = unit * 0.2;
    bar(s + g, -h + stroke, s + g, h);
    bar(s + g + stroke, h, s + unit - g, h);
    bar(s + unit - g, h - stroke, s + unit - g, -h + width * 0.42);
    bar(s + unit - g - stroke, -h + width * 0.42, s + unit * 0.5, -h + width * 0.42);
  }
  return parts;
}

/**
 * A rosette: petals radiating from a centre, a ring of dots round them and a
 * gilded boss. The boss is a disc, so it may lie over the petals' crossing
 * without two skins sharing a plane.
 */
export function rosette(
  petal: Material,
  dot: Material,
  boss: Material,
  y: number,
  centre: [number, number],
  radius: number,
  petals = 8,
): Part[] {
  const parts: Part[] = [];
  const width = Math.min(0.16, radius * 0.22);
  for (let i = 0; i < petals; i += 1) {
    const a = (TAU * i) / petals;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const r0 = radius * 0.18;
    const r1 = radius * 0.78;
    parts.push(
      tile(
        petal,
        y,
        centre[0] + dx * ((r0 + r1) / 2),
        centre[1] + dz * ((r0 + r1) / 2),
        width,
        r1 - r0,
        a,
      ),
    );
  }
  const dots = petals * 2;
  for (let i = 0; i < dots; i += 1) {
    const a = (TAU * (i + 0.5)) / dots;
    const s = Math.min(0.09, radius * 0.1);
    parts.push(
      tile(
        dot,
        y,
        centre[0] + Math.sin(a) * radius * 0.92,
        centre[1] + Math.cos(a) * radius * 0.92,
        s,
        s,
        a,
      ),
    );
  }
  parts.push(cyl(boss, [centre[0], y, centre[1]], radius * 0.2, radius * 0.2, SKIN * 2.4, 16));
  return parts;
}

/**
 * A floor slab with its mosaic: the light bedding the tesserae are set in, as
 * a slab whose top is the floor, and whatever pattern is drawn on it.
 */
export function mosaicFloor(y: number, r: Rect, pattern: (y: number) => Part[]): Part[] {
  return [box("limestone", [r.x, y - 0.12, r.z], [r.w, 0.12, r.d]), ...pattern(y)];
}

/* ------------------------------------------------------------------ *
 * Painted walls
 * ------------------------------------------------------------------ */

/**
 * A wall painted in the Roman manner on one face: a dark dado, coloured
 * fields framed in a lighter band, and a frieze along the top. `at` is the
 * middle of the wall's foot on that face, `rotY` turns `+z` onto the face's
 * outward normal.
 */
export function paintedWall(
  at: Vec3,
  rotY: number,
  length: number,
  height: number,
  field: Material,
  frameColour: Material,
): Part[] {
  const parts: Part[] = [];
  const out = (x: number, y: number, depth: number): Vec3 => [
    at[0] + x * Math.cos(rotY) + depth * Math.sin(rotY),
    at[1] + y,
    at[2] - x * Math.sin(rotY) + depth * Math.cos(rotY),
  ];
  const skin = (material: Material, x: number, y: number, w: number, h: number) =>
    parts.push(box(material, out(x, y, 0.008), [w, h, 0.016], rotY));
  const dado = Math.min(0.8, height * 0.18);
  skin("stoneDark", 0, 0, length, dado);
  const panels = Math.max(1, Math.round(length / 2.2));
  const pw = length / panels;
  const top = height * 0.82;
  for (let i = 0; i < panels; i += 1) {
    const x = -length / 2 + pw * (i + 0.5);
    // The frame is four strips round the field, not a slab behind it.
    const fw = pw * 0.8;
    const fh = top - dado - 0.3;
    const band = 0.07;
    skin(field, x, dado + 0.15 + band, fw - band * 2, fh - band * 2);
    skin(frameColour, x, dado + 0.15, fw, band);
    skin(frameColour, x, dado + 0.15 + fh - band, fw, band);
    skin(frameColour, x - fw / 2 + band / 2, dado + 0.15 + band, band, fh - band * 2);
    skin(frameColour, x + fw / 2 - band / 2, dado + 0.15 + band, band, fh - band * 2);
  }
  skin(frameColour === "paintGold" ? "paintBlue" : "paintGold", 0, top, length, 0.18);
  return parts;
}

/* ------------------------------------------------------------------ *
 * Trees
 * ------------------------------------------------------------------ */

/** A spruce or fir of the Pontic slopes: a trunk and three stacked cones. */
export function conifer(at: Vec3, height: number): Part[] {
  const r = height * 0.2;
  return [
    scenery(cyl("timber", at, height * 0.025, height * 0.018, height * 0.3, 6)),
    scenery(cyl("foliage", [at[0], at[1] + height * 0.18, at[2]], r, r * 0.45, height * 0.36, 7)),
    scenery(
      cyl("foliage", [at[0], at[1] + height * 0.42, at[2]], r * 0.78, r * 0.3, height * 0.32, 7),
    ),
    scenery(
      cyl("foliage", [at[0], at[1] + height * 0.64, at[2]], r * 0.55, 0.02, height * 0.36, 7),
    ),
  ];
}

/** A beech or an alder: a trunk under a rounded crown. */
export function broadleaf(at: Vec3, height: number): Part[] {
  const r = height * 0.32;
  return [
    scenery(cyl("timber", at, height * 0.035, height * 0.025, height * 0.5, 6)),
    scenery(
      loft("foliage", [at[0], at[1] + height * 0.4, at[2]], 0, [
        { c: [0, 0, 0], rx: r * 0.3, ry: r * 0.3 },
        { c: [0, height * 0.18, 0], rx: r, ry: r },
        { c: [0, height * 0.42, 0], rx: r * 0.8, ry: r * 0.8 },
        { c: [0, height * 0.6, 0], rx: r * 0.1, ry: r * 0.1 },
      ]),
    ),
  ];
}
