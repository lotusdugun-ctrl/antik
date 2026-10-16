import type { Material, Part, Vec3 } from "@/lib/reconstruction-parts";

/**
 * The small things that make a big building read as built: the lettering cut
 * into its stone, the tiles on its roof, the paint left on its mouldings.
 *
 * None of it is measured, and none of it pretends to be. The lettering is not
 * text — no Greek or Latin is invented here — but rows of letter-shaped cuts
 * in the proportions of an inscription, so that from a few metres away a
 * statue base or an architrave reads as inscribed, which it was. The tiles are
 * laid at the spacing Greek and Roman roofs used; the paint is kept faded.
 *
 * Every helper works in a face's own frame and returns ordinary parts, so the
 * renderer merges them with the rest of the stone: a row of a hundred letters
 * costs no extra draw call.
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

/*
 * The strokes of a letter, in a unit cell (x across, y up), as rectangles
 * [x0, y0, x1, y1] before the stroke's own thickness is added. Only upright
 * and level strokes: the capitals of a Greek or Latin inscription are mostly
 * those, and a row of them reads as lettering long before any one of them can
 * be read as a letter.
 */
const V = (x: number, y0 = 0, y1 = 1): [number, number, number, number] => [x, y0, x, y1];
const H = (y: number, x0 = 0, x1 = 1): [number, number, number, number] => [x0, y, x1, y];
const GLYPHS: [number, number, number, number][][] = [
  [V(0.5)], // I
  [V(0), H(1), H(0.5, 0, 0.8), H(0)], // E
  [V(0), V(1), H(0.5)], // H
  [V(0), V(1), H(1)], // Π
  [H(1), V(0.5)], // T
  [V(0), H(1, 0, 0.85)], // Γ
  [V(0), V(1), H(1), H(0)], // O, squared as the stone-cutter's chisel leaves it
  [H(1), H(0.5, 0.15, 0.85), H(0)], // Ξ
  [V(0), H(1, 0, 0.9), H(0.5, 0, 0.9), V(1, 0.5, 1)], // P
  [V(0, 0, 0.85), V(1, 0, 0.85), H(0.85, 0.1, 0.9), H(0.42)], // A
  [H(1), H(0), H(0.5, 0.2, 0.6)], // Σ
  [V(0), V(1), V(0.5, 0.3, 1)], // M, N
  [V(0), H(0)], // L
  [V(0), V(1, 0.5, 1), V(1, 0, 0.5), H(0.5)], // K, cut square
];
/** How often each letter turns up: the vowels and the commoner consonants more. */
const WEIGHTS = [5, 6, 3, 3, 5, 2, 6, 1, 3, 6, 5, 4, 2, 2];
const WEIGHT_SUM = WEIGHTS.reduce((a, c) => a + c, 0);

const pickGlyph = (random: () => number) => {
  let roll = random() * WEIGHT_SUM;
  for (let i = 0; i < GLYPHS.length; i += 1) {
    roll -= WEIGHTS[i]!;
    if (roll <= 0) return GLYPHS[i]!;
  }
  return GLYPHS[0]!;
};

export type InscriptionOptions = {
  /** The bottom centre of the block of lettering, on the face itself. */
  at: Vec3;
  /** Turns `+z` onto the face's outward normal (see `FACING`). */
  rotY: number;
  /** The length of a line. */
  width: number;
  /** How tall the letters are cut. */
  letter: number;
  rows?: number;
  seed: number;
  material?: Material;
  /** How full the last line runs, 0-1: inscriptions rarely end flush. */
  lastLine?: number;
  /** Interpuncts between the words, as Roman lettering has. */
  stops?: boolean;
};

/**
 * Rows of lettering cut into a face. Each letter is a few strokes standing a
 * millimetre or two proud of the stone and stopping short in it — enough to
 * catch the light — in the darker material that weathered, paint-filled
 * letters read as from the ground.
 *
 * Returns parts in line order, top line first.
 */
export function inscription(options: InscriptionOptions): Part[] {
  const { at, rotY, width, letter, seed } = options;
  const rows = options.rows ?? 1;
  const material = options.material ?? "lettering";
  const random = seeded(seed);
  const parts: Part[] = [];
  const cell = letter * 0.7;
  const gap = letter * 0.24;
  const stroke = Math.max(0.012, letter * 0.13);
  const depth = Math.max(0.01, letter * 0.08);
  // The strokes sit mostly proud of the face, their backs sunk in it.
  const z = depth * 0.2;
  const leading = letter * 1.5;
  const perLine = Math.max(1, Math.floor((width + gap) / (cell + gap)));
  for (let row = 0; row < rows; row += 1) {
    const y = (rows - 1 - row) * leading;
    const last = row === rows - 1;
    const count = last ? Math.max(1, Math.round(perLine * (options.lastLine ?? 1))) : perLine;
    const lineWidth = count * cell + (count - 1) * gap;
    let word = 2 + Math.floor(random() * 6);
    for (let i = 0; i < count; i += 1) {
      const left = -lineWidth / 2 + i * (cell + gap);
      word -= 1;
      if (word < 0 && i < count - 1) {
        // A word break: a stop at mid height, or a plain space.
        word = 2 + Math.floor(random() * 6);
        if (options.stops !== false) {
          const s = stroke * 1.3;
          parts.push(
            box(
              material,
              onFace(at, rotY, left + cell / 2, y + letter * 0.42, z),
              [s, s, depth],
              rotY,
            ),
          );
        }
        continue;
      }
      for (const [x0, y0, x1, y1] of pickGlyph(random)) {
        // The stroke's rectangle, thickened and kept inside the letter's cell.
        const xl = x0 * (cell - stroke);
        const xr = x1 * (cell - stroke) + stroke;
        const yb = y0 * (letter - stroke);
        const yt = y1 * (letter - stroke) + stroke;
        parts.push(
          box(
            material,
            onFace(at, rotY, left + (xl + xr) / 2, y + yb, z),
            [xr - xl, yt - yb, depth],
            rotY,
          ),
        );
      }
    }
  }
  return parts;
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
  letter + (rows - 1) * letter * 1.5;

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
  rows: number;
  seed: number;
  lastLine?: number;
}): Part[] {
  const { at, rotY, width, height, material, letter, rows, seed } = options;
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
  const block = inscriptionHeight(letter, rows);
  parts.push(
    ...inscription({
      at: onFace(at, rotY, 0, (height - block) / 2, proud),
      rotY,
      width: width - bead * 2 - letter * 0.8,
      letter,
      rows,
      seed,
      ...(options.lastLine !== undefined ? { lastLine: options.lastLine } : {}),
    }),
  );
  return parts;
}

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
