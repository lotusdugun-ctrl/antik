import { extent, layout, LEADING, type EpigraphicText } from "@/lib/epigraphy";
import type { Material, Part, Vec3 } from "@/lib/reconstruction-parts";

/**
 * The small things that make a big building read as built: the lettering cut
 * into its stone, the tiles on its roof, the paint left on its mouldings.
 *
 * The lettering is real: each block of it is a text that stood on the
 * building, or a formula of the kind it carried, read from the corpora and
 * cited in `epigraphy.ts`. The tiles are laid at the spacing Greek and Roman
 * roofs used; the paint is kept faded.
 *
 * Every helper works in a face's own frame and returns ordinary parts, so the
 * renderer merges them with the rest of the stone; the lettering of a whole
 * building is drawn from one texture.
 */

const TAU = Math.PI * 2;

/** A repeatable random source, so the same lettering is cut every time. */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * A point given in a face's frame — `x` along it, `y` up, `z` out of it —
 * turned by `rotY` and moved to `at`, exactly as the renderer turns a part.
 */
export const onFace = (at: Vec3, rotY: number, x: number, y: number, z: number): Vec3 => [
  at[0] + x * Math.cos(rotY) + z * Math.sin(rotY),
  at[1] + y,
  at[2] - x * Math.sin(rotY) + z * Math.cos(rotY),
];

/**
 * The faces looking each way, as the `rotY` that turns a part's `+z` onto
 * them: a face looking towards `-z` (the front of most of these buildings) is
 * `FACING.south`, and so on.
 */
export const FACING = {
  north: 0,
  east: Math.PI / 2,
  south: Math.PI,
  west: -Math.PI / 2,
} as const;

export type InscriptionOptions = {
  /** The bottom centre of the block of lettering, on the face itself. */
  at: Vec3;
  /** Turns `+z` onto the face's outward normal (see `FACING`). */
  rotY: number;
  /** The longest a line may run. */
  width: number;
  /** How tall the letters are cut, at most: a long text is cut smaller to fit. */
  letter: number;
  /** What is written (see `epigraphy.ts`). */
  text: EpigraphicText;
  /** The most lines a wrapped text may take. */
  rows?: number;
  /** The most height the block may take, metres. */
  height?: number;
  /** Whether `at` is the block's bottom centre (the default) or its middle. */
  middle?: boolean;
  material?: Material;
};

/**
 * A text cut into a face: one thin plate lying on the stone, as wide and as
 * tall as the lettering, which carries the laid-out lines. The renderer draws
 * the letters themselves on it (see `components/scene/lettering.ts`); here it
 * is a part like any other, so tests can find it on its face and the bounds
 * of a block can leave it out where a neighbour covers it.
 *
 * The plate sits mostly proud of the face, its back sunk a few millimetres
 * into it, so the letters can never be lost inside the stone.
 */
export function inscription(options: InscriptionOptions): Part[] {
  const { at, rotY } = options;
  const lettering = layout(options.text, {
    width: options.width,
    letter: options.letter,
    ...(options.rows !== undefined ? { rows: options.rows } : {}),
    ...(options.height !== undefined ? { height: options.height } : {}),
  });
  if (lettering.lines.length === 0 || lettering.lines.every((line) => !line)) return [];
  const [width, height] = extent(lettering);
  const depth = 0.01;
  return [
    {
      kind: "box",
      material: options.material ?? "lettering",
      at: onFace(at, rotY, 0, options.middle ? -height / 2 : 0, depth * 0.2),
      size: [width, height, depth],
      rotY,
      lettering,
    },
  ];
}

/**
 * Leaves out the letters that a neighbouring block covers: a face cut on all
 * four sides, as the Pergamon podium's are, has stretches built against the
 * next block, and lettering there would be drawn and never seen.
 */
export function uncovered(parts: Part[]): Part[] {
  const blocks = parts.filter(
    (part): part is Extract<Part, { kind: "box" }> =>
      part.kind === "box" && !part.rotX && !part.material.startsWith("lettering"),
  );
  return parts.filter((letter) => {
    if (letter.kind !== "box" || !letter.material.startsWith("lettering")) return true;
    const reach = letter.size[2] / 2 + 0.003;
    const x = letter.at[0] + Math.sin(letter.rotY) * reach;
    const y = letter.at[1] + letter.size[1] / 2;
    const z = letter.at[2] + Math.cos(letter.rotY) * reach;
    return !blocks.some((block) => {
      const dx = x - block.at[0];
      const dz = z - block.at[2];
      const u = dx * Math.cos(block.rotY) - dz * Math.sin(block.rotY);
      const v = dx * Math.sin(block.rotY) + dz * Math.cos(block.rotY);
      return (
        Math.abs(u) < block.size[0] / 2 &&
        Math.abs(v) < block.size[2] / 2 &&
        y > block.at[1] &&
        y < block.at[1] + block.size[1]
      );
    });
  });
}

/** How tall a block of lettering stands, for setting it in a field. */
export const inscriptionHeight = (letter: number, rows: number) =>
  letter + (rows - 1) * letter * LEADING;

/**
 * An inscribed panel: a smooth field set a little proud of the face, framed
 * by a thin moulding, and lettered. What a statue base or a building's
 * dedication carried.
 */
export function inscribedPanel(options: {
  at: Vec3;
  rotY: number;
  width: number;
  height: number;
  material: Material;
  letter: number;
  text: EpigraphicText;
  rows?: number;
}): Part[] {
  const { at, rotY, width, height, material, letter } = options;
  const proud = 0.03;
  const parts: Part[] = [
    box(material, onFace(at, rotY, 0, 0, proud / 2 - 0.01), [width, height, proud + 0.02], rotY),
  ];
  // The frame: a bead round the field, a hair proud of it.
  const bead = Math.max(0.02, letter * 0.18);
  for (const y of [0, height - bead]) {
    parts.push(box(material, onFace(at, rotY, 0, y, proud), [width, bead, 0.03], rotY));
  }
  for (const side of [-1, 1]) {
    parts.push(
      box(
        material,
        onFace(at, rotY, side * (width / 2 - bead / 2), 0, proud),
        [bead, height, 0.03],
        rotY,
      ),
    );
  }
  // The text, centred in the field inside the frame.
  const field = height - bead * 2 - letter * 0.8;
  const cut = inscription({
    at: onFace(at, rotY, 0, 0, proud),
    rotY,
    width: width - bead * 2 - letter * 0.8,
    letter,
    text: options.text,
    height: field,
    ...(options.rows !== undefined ? { rows: options.rows } : {}),
  });
  for (const part of cut) {
    if (part.kind !== "box") continue;
    part.at = onFace(at, rotY, 0, (height - part.size[1]) / 2, proud + 0.002);
  }
  parts.push(...cut);
  return parts;
}

/* ------------------------------------------------------------------ *
 * Walls
 * ------------------------------------------------------------------ */

/**
 * The dressing of a plain stretch of ashlar wall: a moulded foot, the joint
 * of every course drawn along it a hair proud of the face so it catches the
 * light, and a coping under the top. `at` is the middle of the wall's foot
 * on its face, `rotY` turns `+z` onto the face's outward normal, and `gaps`
 * are stretches along it (from, to, in the face's own x) left bare for doors.
 */
export function ashlar(options: {
  at: Vec3;
  rotY: number;
  length: number;
  height: number;
  course?: number;
  material?: Material;
  /** The colour the joints read in: a darker stone than the face. */
  joint?: Material;
  /** Draw the upright joints too, staggered course by course, blocks this long. */
  blocks?: number;
  foot?: boolean;
  coping?: boolean;
  gaps?: [number, number][];
}): Part[] {
  const { at, rotY, length, height } = options;
  const course = options.course ?? 0.62;
  const material = options.material ?? "marbleWorn";
  const joint = options.joint ?? JOINTS[material] ?? material;
  const parts: Part[] = [];
  const gaps = [...(options.gaps ?? [])].sort((a, b) => a[0] - b[0]);
  // The runs of wall between the gaps.
  const runs: [number, number][] = [];
  let from = -length / 2;
  for (const [g0, g1] of gaps) {
    if (g0 > from) runs.push([from, Math.min(g0, length / 2)]);
    from = Math.max(from, g1);
  }
  if (from < length / 2) runs.push([from, length / 2]);
  const band = (y: number, h: number, proud: number, stone: Material) => {
    for (const [u0, u1] of runs) {
      if (u1 - u0 < 0.05) continue;
      parts.push(
        box(
          stone,
          onFace(at, rotY, (u0 + u1) / 2, y, proud / 2 - 0.004),
          [u1 - u0, h, proud + 0.008],
          rotY,
        ),
      );
    }
  };
  let bottom = 0;
  if (options.foot !== false) {
    band(0, 0.5, 0.14, material);
    band(0.5, 0.12, 0.07, material);
    bottom = 0.62;
  }
  const top = options.coping !== false ? height - 0.45 : height;
  let row = 0;
  for (let y = bottom; y < top - 0.2; y += course) {
    if (y > bottom) band(y, 0.025, 0.012, joint);
    if (options.blocks) {
      // The upright joints of this course, half a block along from the last.
      const next = Math.min(y + course, top);
      for (const [u0, u1] of runs) {
        for (
          let u = u0 + (row % 2 ? options.blocks / 2 : options.blocks);
          u < u1 - 0.2;
          u += options.blocks
        ) {
          parts.push(box(joint, onFace(at, rotY, u, y, 0.002), [0.022, next - y, 0.012], rotY));
        }
      }
    }
    row += 1;
  }
  if (options.coping !== false) band(top, 0.45, 0.12, material);
  return parts;
}

/** The stone a wall's joints read in, by the stone of its face. */
const JOINTS: Partial<Record<Material, Material>> = {
  marble: "marbleWorn",
  marbleWorn: "stone",
  stone: "stoneDark",
  limestone: "stone",
  conglomerate: "stoneDark",
};

/* ------------------------------------------------------------------ *
 * Roof tiles
 * ------------------------------------------------------------------ */

export type TiledSlope = {
  /** The middle of the eave: the lowest edge of the tiled surface. */
  eave: Vec3;
  /** Turns local `+z` — from the eave up towards the ridge — onto the plan. */
  rotY: number;
  /** Length along the eave. */
  width: number;
  /** Plan distance from eave to ridge, and the height climbed over it. */
  run: number;
  rise: number;
  /** Lay a slab of pan tiles under the cover tiles; off where a solid roof is already there. */
  slab?: boolean;
  /** Centre to centre of the rows of cover tiles. */
  spacing?: number;
  /** Radius of a cover tile. */
  cover?: number;
  /** An antefix closing each row of cover tiles at the eave. */
  antefixes?: boolean;
  /** Paint on the antefixes' palmettes. */
  antefixPaint?: Material;
  material?: Material;
};

/**
 * One slope of a tiled roof: the flat pan tiles as a slab, the rows of
 * half-round cover tiles over their joints running up the slope, the lines
 * where each course of pans laps the one below, and an antefix standing up
 * at the foot of every row.
 *
 * The cover tiles are what make a roof read as tiled from any distance —
 * their ridges throw a stripe of shadow every seventy centimetres — and they
 * are cheap: a half drum of five facets each.
 */
export function tiledSlope(slope: TiledSlope): Part[] {
  return tiledSlopeParts(slope).map((part) =>
    /*
     * The tiles lie on a roof already inside the building's frame, and a
     * drum's bounds are reckoned generously — a cover tile's as twice its
     * length either way — so counted, a temple's tiles framed a box three
     * times its size. They are left out of the frame, as scenery is; the
     * slab of pans under them, where there is one, still counts.
     */
    part.kind === "box" ? part : { ...part, decor: true },
  );
}

function tiledSlopeParts(slope: TiledSlope): Part[] {
  const { eave, rotY, width, run, rise } = slope;
  const material = slope.material ?? "terracotta";
  const spacing = slope.spacing ?? 0.68;
  const cover = slope.cover ?? 0.1;
  const angle = Math.atan2(rise, run);
  const length = Math.hypot(run, rise);
  const parts: Part[] = [];
  const point = (x: number, y: number, z: number) => onFace(eave, rotY, x, y, z);
  if (slope.slab !== false) {
    const t = 0.06;
    // Tipped by -angle about its own x, a slab's top face runs up the slope.
    parts.push({
      kind: "box",
      material,
      at: point(0, rise / 2 - t * Math.cos(angle), run / 2 + t * Math.sin(angle)),
      size: [width, t, length],
      rotY,
      rotX: -angle,
    });
  }
  // The rows of cover tiles, each a half drum lying up the slope.
  const rows = Math.max(1, Math.floor(width / spacing));
  const first = -((rows - 1) * spacing) / 2;
  for (let i = 0; i < rows; i += 1) {
    const x = first + i * spacing;
    parts.push({
      kind: "cylinder",
      material,
      at: point(x, 0.004, -0.02),
      radiusBottom: cover,
      radiusTop: cover,
      height: length + 0.02,
      segments: 5,
      rotX: Math.PI / 2 - angle,
      rotY,
      thetaStart: Math.PI / 2,
      thetaLength: Math.PI,
    });
    if (slope.antefixes !== false) {
      // A palmette-topped plate, upright, closing the end of the row.
      const plate = cover * 2.6;
      parts.push({
        kind: "prism",
        material,
        at: point(x, -cover * 0.5, -0.03),
        size: [plate, plate * 1.15, 0.04],
        rotY,
      });
      if (slope.antefixPaint) {
        parts.push({
          kind: "prism",
          material: slope.antefixPaint,
          at: point(x, -cover * 0.5 + plate * 0.18, -0.055),
          size: [plate * 0.55, plate * 0.7, 0.01],
          rotY,
        });
      }
    }
  }
  // The laps between courses of pan tiles: a fine line across the slope.
  const course = 0.9;
  for (let k = 1; k * course < length - 0.2; k += 1) {
    const along = k * course;
    parts.push({
      kind: "cylinder",
      material,
      at: point(-width / 2, along * Math.sin(angle) + 0.006, along * Math.cos(angle)),
      radiusBottom: 0.022,
      radiusTop: 0.022,
      height: width,
      segments: 3,
      rotX: Math.PI / 2,
      rotY: rotY + Math.PI / 2,
    });
  }
  return parts;
}

/**
 * A pitched roof over a rectangle: two tiled slopes meeting at a ridge along
 * local `z`, and the ridge capped. `at` is the centre of the eaves level;
 * `halfWidth` is eave to ridge in plan, `length` the ridge's run.
 */
export function gableTiles(options: {
  at: Vec3;
  rotY: number;
  halfWidth: number;
  length: number;
  pitch: number;
  slab?: boolean;
  spacing?: number;
  cover?: number;
  antefixPaint?: Material;
  material?: Material;
}): Part[] {
  const { at, rotY, halfWidth, length, pitch } = options;
  const material = options.material ?? "terracotta";
  const parts: Part[] = [];
  for (const side of [-1, 1]) {
    // Each slope's own +z runs from its eave in towards the ridge.
    parts.push(
      ...tiledSlope({
        eave: onFace(at, rotY, side * halfWidth, 0, 0),
        rotY: rotY + (side > 0 ? -Math.PI / 2 : Math.PI / 2),
        width: length,
        run: halfWidth,
        rise: pitch,
        material,
        ...(options.slab !== undefined ? { slab: options.slab } : {}),
        ...(options.spacing !== undefined ? { spacing: options.spacing } : {}),
        ...(options.cover !== undefined ? { cover: options.cover } : {}),
        ...(options.antefixPaint ? { antefixPaint: options.antefixPaint } : {}),
      }),
    );
  }
  // The ridge tiles: one long half-round cap along the top.
  parts.push({
    decor: true,
    kind: "cylinder",
    material,
    at: onFace(at, rotY, 0, pitch, -length / 2),
    radiusBottom: (options.cover ?? 0.1) * 1.5,
    radiusTop: (options.cover ?? 0.1) * 1.5,
    height: length,
    segments: 6,
    rotX: Math.PI / 2,
    rotY,
    thetaStart: Math.PI / 2,
    thetaLength: Math.PI,
  });
  return parts;
}

/* ------------------------------------------------------------------ *
 * Paint
 * ------------------------------------------------------------------ */

/**
 * A faded painted band laid on a face: a moulding picked out in colour, or
 * the ground behind a frieze. A centimetre proud of the stone so the two do
 * not fight over the same pixels.
 */
export function paintBand(
  material: Material,
  at: Vec3,
  rotY: number,
  width: number,
  height: number,
): Part {
  return box(material, onFace(at, rotY, 0, 0, 0.008), [width, height, 0.014], rotY);
}

/**
 * Painted enrichment on a moulding: a run of alternating short blocks — the
 * egg-and-dart or the bead-and-reel as colour sees it from the ground.
 */
export function paintedRun(
  materials: Material[],
  at: Vec3,
  rotY: number,
  width: number,
  height: number,
  pitch: number,
): Part[] {
  const parts: Part[] = [];
  const count = Math.max(1, Math.floor(width / pitch));
  for (let i = 0; i < count; i += 1) {
    const x = -width / 2 + (i + 0.5) * (width / count);
    parts.push(
      box(
        materials[i % materials.length]!,
        onFace(at, rotY, x, 0, 0.01),
        [(width / count) * 0.55, height, 0.016],
        rotY,
      ),
    );
  }
  return parts;
}

function box(material: Material, at: Vec3, size: Vec3, rotY: number): Part {
  return { kind: "box", material, at, size, rotY };
}

/** Full turn, for callers laying things round a circle. */
export { TAU };
