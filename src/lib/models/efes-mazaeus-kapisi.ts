import { ashlar, FACING, inscription, tiledSlope } from "@/lib/reconstruction-detail";
import { TEXTS } from "@/lib/epigraphy";
import {
  kitBox as box,
  kitCyl as cyl,
  kitCornice as cornice,
  kitPerson,
  kitPrism as prism,
  lionSpout,
  type Material,
  type Part,
  type Vec3,
} from "@/lib/reconstruction-parts";

/**
 * The Library of Celsus did not stand in a field. It closed the west side of
 * a small paved square at the foot of Curetes Street, where Marble Street
 * turned off north; on the square's north side, at right angles to the
 * library's front, stood the older Gate of Mazaeus and Mithridates (4/3 BC),
 * the south-east entrance of the commercial agora.
 *
 * The gate is drawn as the triumphal-arch front the re-erected building
 * shows: three arched openings, the middle one wider and set back 1.5 m
 * behind the two side bays, the dedications in gilded bronze letters over
 * the three openings — Latin to Augustus and Livia on the left, Latin to
 * Agrippa and Julia on the right, Greek in the middle — and the vault on the
 * library side lined with black marble, the one on the agora side with white.
 * No published measurements were found, so the size and the order (plain
 * pilasters, an attic) are the model's proportion, not a survey.
 *
 * Model axes, as in `romanFacadeParts`: the library faces -z (real east),
 * real north is -x. The gate's front looks +x (real south) onto the square.
 */

/** Where the gate stands: front of the side bays, of the recessed middle, and its back. */
export const GATE = {
  front: -15,
  recess: -16.5,
  back: -19.5,
  /** Along z, the middle of the middle opening. */
  centre: -9.2,
  /** Half the gate's length along z. */
  half: 8.4,
} as const;

/** The square's paving, from the library's stair to Curetes Street. */
export const SQUARE = { x0: GATE.front + 0.05, x1: 15.5, z0: -23, z1: -3.9 } as const;

/** An arch's spandrel wall: a rectangle from spring to top, the round head cut out of it. */
function spandrel(
  material: Material,
  at: Vec3,
  span: number,
  spring: number,
  top: number,
  depth: number,
): Part {
  const r = span / 2;
  const outline: [number, number][] = [
    [-r, spring],
    [-r, top],
    [r, top],
    [r, spring],
  ];
  for (let k = 1; k < 20; k += 1) {
    const a = (k / 20) * Math.PI;
    outline.push([Math.cos(a) * r, spring + Math.sin(a) * r]);
  }
  return { kind: "carving", material, at, outline, depth, sink: 0, rotY: Math.PI / 2 };
}

/** A half-annulus band round an arch head, `inner` to `outer`, extruded `depth` along +x. */
function archBand(material: Material, at: Vec3, inner: number, outer: number, depth: number): Part {
  const outline: [number, number][] = [];
  const n = 20;
  for (let k = 0; k <= n; k += 1) {
    const a = (k / n) * Math.PI;
    outline.push([Math.cos(a) * outer, Math.sin(a) * outer]);
  }
  for (let k = n; k >= 0; k -= 1) {
    const a = (k / n) * Math.PI;
    outline.push([Math.cos(a) * inner, Math.sin(a) * inner]);
  }
  return { kind: "carving", material, at, outline, depth, sink: 0, rotY: Math.PI / 2 };
}

export function mazaeusGateParts(): Part[] {
  const parts: Part[] = [];
  const { front: F, recess: R, back: B, centre: zc } = GATE;
  /** From the gate's own `u` (along its front, + to the viewer's right) to world z. */
  const Z = (u: number) => zc - u;
  const top = 6.6;

  // Openings: [centre u, span, spring height]; the middle one wider and taller.
  const openings = [
    { u: -4.8, span: 2.8, spring: 3.4, front: F },
    { u: 0, span: 3.6, spring: 3.8, front: R },
    { u: 4.8, span: 2.8, spring: 3.4, front: F },
  ];
  // Piers: [from u, to u]; the inner ones run forward to the side bays' front.
  const piers: [number, number][] = [
    [-8.4, -6.2],
    [-3.4, -1.8],
    [1.8, 3.4],
    [6.2, 8.4],
  ];

  for (const [u0, u1] of piers) {
    parts.push(box("marble", [(B + F) / 2, 0, Z((u0 + u1) / 2)], [F - B, top, u1 - u0]));
  }
  for (const o of openings) {
    const depth = o.front - B;
    parts.push(spandrel("marble", [B, 0, Z(o.u)], o.span, o.spring, top, depth));

    /*
     * The vault's lining: black marble on the half towards the library,
     * white on the agora's — as the gate's two vaults still show. The black
     * runs down the jambs to a moulded foot.
     */
    const mid = B + depth / 2;
    const r = o.span / 2;
    parts.push(archBand("marbleBlack", [mid, o.spring, Z(o.u)], r - 0.03, r + 0.04, o.front - mid));
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "marbleBlack",
          [(mid + o.front) / 2, 0.3, Z(o.u + side * (r - 0.015))],
          [o.front - mid, o.spring - 0.3, 0.06],
        ),
      );
    }
    // The impost moulding the arch springs from, on both faces of the gate.
    for (const [x, out] of [
      [o.front, 1],
      [B, -1],
    ] as const) {
      for (const side of [-1, 1]) {
        parts.push(
          box(
            "marble",
            [x + out * 0.05, o.spring - 0.22, Z(o.u + side * (r + 0.25))],
            [0.14, 0.22, 0.5],
          ),
        );
      }
      // The archivolt: a moulded band round the head, a hand proud of the face.
      parts.push(
        archBand("marble", [out > 0 ? x : x - 0.1, o.spring, Z(o.u)], r + 0.02, r + 0.38, 0.1),
      );
      // The keystone.
      parts.push(box("marble", [x + out * 0.08, o.spring + r - 0.05, Z(o.u)], [0.2, 0.6, 0.42]));
    }
  }

  /*
   * Pilasters on the piers, front and back, carrying the entablature: a
   * moulded base, a plain shaft and a capital block. The order is not known
   * from a published drawing, so the capitals are left as plain blocks.
   */
  const pilaster = (x: number, out: number, u: number) => {
    parts.push(box("marble", [x + out * 0.11, 0, Z(u)], [0.22, 0.4, 0.95]));
    parts.push(box("marble", [x + out * 0.08, 0.4, Z(u)], [0.16, top - 0.95, 0.72]));
    parts.push(box("marble", [x + out * 0.12, top - 0.55, Z(u)], [0.24, 0.55, 0.92]));
  };
  for (const u of [-7.3, -2.6, 2.6, 7.3]) {
    pilaster(F, 1, u);
    pilaster(B, -1, u);
  }

  /*
   * The entablature, broken forward over the side bays: architrave in two
   * fasciae, a frieze carrying the dedications, and a cornice. The side
   * bays come out to the front; the middle one stays 1.5 m back.
   */
  const zones = [
    { u0: -8.4, u1: -1.8, front: F, text: TEXTS.gateAugustus },
    { u0: -1.8, u1: 1.8, front: R, text: TEXTS.gateGreek },
    { u0: 1.8, u1: 8.4, front: F, text: TEXTS.gateAgrippa },
  ];
  const architrave = 0.6;
  const frieze = 0.95;
  const crown = 0.6;
  for (const zone of zones) {
    const length = zone.u1 - zone.u0;
    const z = Z((zone.u0 + zone.u1) / 2);
    const x0 = B - 0.12;
    const x1 = zone.front + 0.12;
    parts.push(box("marble", [(x0 + x1) / 2, top, z], [x1 - x0, architrave * 0.5, length]));
    parts.push(
      box(
        "marble",
        [(x0 + x1) / 2 + 0.02, top + architrave * 0.5, z],
        [x1 - x0 + 0.04, architrave * 0.5, length],
      ),
    );
    parts.push(
      box("marble", [(x0 + x1) / 2, top + architrave, z], [x1 - x0 - 0.04, frieze, length]),
    );
    parts.push(
      ...cornice("marble", [(x0 + x1) / 2, top + architrave + frieze, z], x1 - x0, length, crown),
    );
    // The dedication, in bronze letters gilded and pinned to the frieze.
    parts.push(
      ...inscription({
        at: [x1 - 0.02, top + architrave + frieze / 2, z],
        rotY: FACING.east,
        width: length - 0.5,
        letter: 0.17,
        rows: 3,
        height: frieze - 0.12,
        middle: true,
        text: zone.text,
      }),
    );
  }

  /*
   * The attic, set back over the whole gate: a plain wall with its own
   * crowning moulding, which is what lifts a three-way gate into a
   * monument rather than a doorway in the agora wall.
   */
  const atticBase = top + architrave + frieze + crown;
  const ax0 = B + 0.2;
  const ax1 = R + 0.15;
  parts.push(
    box("marble", [(ax0 + ax1) / 2, atticBase, zc], [ax1 - ax0, 0.25, GATE.half * 2 + 0.2]),
  );
  parts.push(
    box("marble", [(ax0 + ax1) / 2, atticBase + 0.25, zc], [ax1 - ax0 - 0.2, 1.3, GATE.half * 2]),
  );
  parts.push(
    ...cornice(
      "marble",
      [(ax0 + ax1) / 2, atticBase + 1.55, zc],
      ax1 - ax0 - 0.2,
      GATE.half * 2,
      0.42,
    ),
  );

  /*
   * The agora's south wall, running on from either end of the gate: west
   * behind the library's north flank, east to where Marble Street turned off.
   * Laid in squared courses on the face to the square.
   */
  const wallTop = 5.2;
  const runs: [number, number][] = [
    [Z(8.4), Z(8.4) - 8],
    [Z(-8.4) + 16, Z(-8.4)],
  ];
  for (const [za, zb] of runs) {
    const z0 = Math.min(za, zb);
    const z1 = Math.max(za, zb);
    parts.push(box("stone", [B + 1, 0, (z0 + z1) / 2], [2, wallTop, z1 - z0]));
    parts.push(
      ...ashlar({
        at: [B + 2, 0, (z0 + z1) / 2],
        rotY: FACING.east,
        length: z1 - z0,
        height: wallTop,
        material: "stone",
        blocks: 1.3,
      }),
    );
  }

  return parts.map((part) => ({ ...part, decor: true }));
}

/**
 * The square's paving: big marble slabs laid in rows across it, each one a
 * piece of its own so the renderer tints it a shade of its own, the joints
 * left as hairlines of ground. It runs on through the gate's openings into
 * the agora, and stops at the library's stair.
 */
export function squarePaving(): Part[] {
  const parts: Part[] = [];
  const slab = { x: 1.6, z: 1.1, gap: 0.04, y: -0.01, h: 0.04 };
  let row = 0;
  for (let z = SQUARE.z1; z > SQUARE.z0; z -= slab.z) {
    const shift = row++ % 2 === 0 ? 0 : slab.x / 2;
    for (let x = SQUARE.x0 - shift; x < SQUARE.x1; x += slab.x) {
      const a = Math.max(x, SQUARE.x0);
      const b = Math.min(x + slab.x, SQUARE.x1);
      if (b - a < 0.2) continue;
      parts.push(
        box(
          "marbleWorn",
          [(a + b) / 2, slab.y, z - slab.z / 2],
          [b - a - slab.gap, slab.h, slab.z - slab.gap],
        ),
      );
    }
  }
  // Under the three openings, out to the agora behind.
  for (const [u, span] of [
    [-4.8, 2.8],
    [0, 3.6],
    [4.8, 2.8],
  ] as const) {
    parts.push(
      box(
        "marbleWorn",
        [(GATE.back - 3 + GATE.front) / 2, slab.y, GATE.centre - u],
        [GATE.front - GATE.back + 3, slab.h, span - 0.02],
      ),
    );
  }
  return parts.map((part) => ({ ...part, decor: true }));
}

/** Whether a point falls on the gate, its walls or the paving: scenery is kept off them. */
export function onGateOrSquare(x: number, z: number, margin = 0.6): boolean {
  const inGate =
    x > GATE.back - 2 - margin &&
    x < GATE.front + margin &&
    z > GATE.centre - GATE.half - 8 - margin &&
    z < GATE.centre + GATE.half + 16 + margin;
  const inSquare =
    x > SQUARE.x0 - margin &&
    x < SQUARE.x1 + margin &&
    z > SQUARE.z0 - margin &&
    z < SQUARE.z1 + margin;
  return inGate || inSquare;
}

/* ------------------------------------------------------------------ *
 * The streets off the square
 * ------------------------------------------------------------------ */

/**
 * Where the two streets run. Curetes Street comes down to the square from
 * the east (model -z); Marble Street leaves its north-east corner northwards
 * (model -x), along the agora's east side. Widths and the stoas are the
 * model's reading of the excavated streets, not a survey.
 */
export const STREETS = {
  curetes: { x0: 0.5, x1: 9.5, z0: -62, z1: SQUARE.z0 },
  marble: { x0: -62, x1: SQUARE.x0, z0: -33, z1: -26 },
} as const;

/**
 * A street colonnade's column, kept light: there are dozens of them, seen
 * from across a street. A moulded base, a smooth shaft drawn in at the top,
 * a cushion capital and its abacus — a Doric column of the Roman kind.
 */
export function lightColumn(
  material: Material,
  at: Vec3,
  diameter: number,
  height: number,
): Part[] {
  const [x, y, z] = at;
  const r = diameter / 2;
  return [
    box(material, [x, y, z], [diameter * 1.3, 0.12, diameter * 1.3]),
    cyl(material, [x, y + 0.12, z], r * 1.12, r * 1.02, 0.14, 12),
    cyl(material, [x, y + 0.26, z], r, r * 0.84, height - 0.26 - 0.32, 12),
    cyl(material, [x, y + height - 0.32, z], r * 0.86, r * 1.18, 0.18, 12),
    box(material, [x, y + height - 0.14, z], [diameter * 1.32, 0.14, diameter * 1.32]),
  ];
}

/** Big paving slabs over a rectangle, in staggered rows across `along`. */
function paving(
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  along: "x" | "z",
  material: Material = "marbleWorn",
): Part[] {
  const parts: Part[] = [];
  const long = 1.6;
  const short = 1.1;
  const gap = 0.04;
  let row = 0;
  if (along === "z") {
    for (let z = z1; z > z0 + 0.1; z -= short) {
      const zz = Math.max(z - short, z0);
      const shift = row++ % 2 === 0 ? 0 : long / 2;
      for (let x = x0 - shift; x < x1; x += long) {
        const a = Math.max(x, x0);
        const b = Math.min(x + long, x1);
        if (b - a < 0.2) continue;
        parts.push(
          box(material, [(a + b) / 2, -0.01, (z + zz) / 2], [b - a - gap, 0.04, z - zz - gap]),
        );
      }
    }
  } else {
    for (let x = x1; x > x0 + 0.1; x -= short) {
      const xx = Math.max(x - short, x0);
      const shift = row++ % 2 === 0 ? 0 : long / 2;
      for (let z = z0 - shift; z < z1; z += long) {
        const a = Math.max(z, z0);
        const b = Math.min(z + long, z1);
        if (b - a < 0.2) continue;
        parts.push(
          box(material, [(x + xx) / 2, -0.01, (a + b) / 2], [x - xx - gap, 0.04, b - a - gap]),
        );
      }
    }
  }
  return parts;
}

/**
 * A stoa along a street: a stylobate, a row of columns, a lean-to roof of
 * tiles falling to the street, and a back wall with shop doors in it.
 * `face` is the direction the colonnade looks (+1/-1 along `axis`'s
 * crossing direction); the stoa runs `from`-`to` along the street.
 */
function stoa(options: {
  axis: "z" | "x";
  /** The column line, across the street's direction. */
  line: number;
  /** Which way, across the street, the back wall lies from the columns. */
  back: 1 | -1;
  from: number;
  to: number;
  depth: number;
  height: number;
}): Part[] {
  const parts: Part[] = [];
  const { axis, line, back, from, to, depth, height } = options;
  const length = to - from;
  const mid = (from + to) / 2;
  const wallLine = line + back * depth;
  /** A point given as (along the street, across it). */
  const P = (a: number, c: number, y = 0): Vec3 => (axis === "z" ? [c, y, a] : [a, y, c]);
  /** A size given as (along, across). */
  const S = (a: number, h: number, c: number): Vec3 => (axis === "z" ? [c, h, a] : [a, h, c]);

  // Stylobate: one step up from the street.
  parts.push(
    box("marbleWorn", P(mid, line + (back * depth) / 2 - back * 0.5), S(length, 0.24, depth + 1)),
  );
  parts.push(box("stone", P(mid, line + (back * depth) / 2, 0.24), S(length, 0.02, depth - 0.6)));

  // The columns, about 3.2 m apart: plain Roman Doric, smooth-shafted.
  const bays = Math.max(2, Math.round(length / 3.2));
  const shaft = height - 0.9;
  for (let i = 0; i <= bays; i += 1) {
    const a = from + (length * i) / bays;
    parts.push(...lightColumn("marble", P(a, line, 0.24), 0.46, shaft));
  }
  // The entablature over them.
  parts.push(box("marble", P(mid, line, 0.24 + shaft), S(length + 0.6, 0.5, 0.62)));
  parts.push(box("marble", P(mid, line - back * 0.04, 0.74 + shaft), S(length + 0.7, 0.18, 0.78)));

  // The back wall, with shop doorways at every other bay.
  const wallH = height + 1.4;
  parts.push(box("stone", P(mid, wallLine + back * 0.35, 0.24), S(length, wallH, 0.7)));
  for (let i = 0; i < bays; i += 1) {
    if (i % 2 === 1) continue;
    const a = from + (length * (i + 0.5)) / bays;
    parts.push(box("shadow", P(a, wallLine - back * 0.01, 0.24), S(1.6, 2.4, 0.06)));
    parts.push(box("timber", P(a, wallLine - back * 0.04, 2.64), S(2.0, 0.22, 0.12)));
  }
  // The ceiling under the roof, and the roof itself falling to the street.
  parts.push(
    box("timber", P(mid, line + (back * depth) / 2, height + 0.05), S(length, 0.12, depth)),
  );
  parts.push(
    ...tiledSlope({
      eave: P(mid, line - back * 0.5, height + 0.17),
      rotY:
        axis === "z"
          ? back > 0
            ? FACING.east
            : FACING.west
          : back > 0
            ? FACING.north
            : FACING.south,
      width: length + 0.8,
      run: depth + 0.85,
      rise: 1.2,
      antefixes: false,
    }),
  );
  return parts;
}

/** A statue on an inscribed base at a street's edge, looking across the street. */
function honoured(at: Vec3, rotY: number, index: number): Part[] {
  const [x, , z] = at;
  const face = rotY;
  const parts: Part[] = [];
  const along = Math.abs(Math.sin(rotY)) > 0.5;
  const size = (w: number, h: number, d: number): Vec3 => (along ? [d, h, w] : [w, h, d]);
  parts.push(box("marbleWorn", [x, 0, z], size(1.3, 0.3, 1.1)));
  parts.push(box("marble", [x, 0.3, z], size(1.0, 1.25, 0.82)));
  parts.push(box("marbleWorn", [x, 1.55, z], size(1.3, 0.25, 1.1)));
  const front: Vec3 = [x + Math.sin(face) * 0.42, 0.92, z + Math.cos(face) * 0.42];
  parts.push(
    ...inscription({
      at: front,
      rotY: face,
      width: 0.86,
      letter: 0.085,
      height: 1.0,
      middle: true,
      text: index % 2 === 0 ? TEXTS.ephesusHonorificCouncil : TEXTS.ephesusHonorificPeople,
    }),
  );
  const who = [
    {
      name: "Benefactor",
      sex: "male",
      bearded: true,
      hair: "short",
      dress: "himation",
      gesture: "rest",
    },
    {
      name: "Benefactor",
      sex: "male",
      bearded: false,
      hair: "short",
      dress: "toga",
      right: "scroll",
    },
    {
      name: "Benefactress",
      sex: "female",
      hair: "bun",
      headgear: "veil",
      dress: "chiton",
      gesture: "veil",
    },
    {
      name: "Benefactor",
      sex: "male",
      bearded: true,
      hair: "curls",
      dress: "himation",
      right: "scroll",
    },
  ] as const;
  /*
   * The statue itself is lost, as nearly all of them are: it is stood in by
   * the lighter scans of real Roman portrait statues of the period (a man in
   * his mantle, the veiled Tiberius, the Ephesian portrait, a draped woman),
   * in white marble.
   */
  const scans = [
    "ephesus-portrait-lod",
    "tiberius-velatus-lod",
    "caryatid-lod",
    "asklepios-lod",
  ] as const;
  const statue = kitPerson([x, 1.8, z], 1.95, rotY, "marble", who[index % who.length], {
    // Faded paint on the mantle's border and the hair, as on the library's statues.
    mantle: 0xe9e0cf,
    hair: 0x6a5642,
    accent: 0x8a4a6e,
  });
  parts.push({ ...statue, scan: { id: scans[index % scans.length]! } });
  return parts;
}

/**
 * A street fountain at the corner where Curetes Street opens onto the
 * square: a basin with a parapet, a back wall in two storeys of niches and
 * a lion's head spouting into it. Ephesus had many; this one is generic.
 */
function fountain(x: number, z: number): Part[] {
  const parts: Part[] = [];
  const w = 4.2;
  const d = 1.6;
  // Basin walls and floor, the water a hand under the rim.
  parts.push(box("marble", [x, 0, z], [d, 0.2, w]));
  parts.push(box("marble", [x - d / 2 + 0.1, 0, z], [0.2, 0.85, w]));
  for (const side of [-1, 1])
    parts.push(box("marble", [x, 0, z + side * (w / 2 - 0.1)], [d, 0.85, 0.2]));
  parts.push(box("water", [x + 0.05, 0.2, z], [d - 0.3, 0.5, w - 0.4]));
  // The back wall: an aedicula of two small columns round a niche.
  const bx = x + d / 2 + 0.3;
  parts.push(box("marble", [bx, 0, z], [0.6, 4.2, w + 0.6]));
  parts.push(box("paintBlue", [bx - 0.31, 1.0, z], [0.02, 2.1, 1.6]));
  for (const side of [-1, 1]) {
    parts.push(...lightColumn("marble", [bx - 0.5, 0.85, z + side * 1.3], 0.26, 2.6));
  }
  parts.push(box("marble", [bx - 0.25, 3.45, z], [1.0, 0.35, 3.3]));
  parts.push(prism("marble", [bx - 0.25, 3.8, z], [3.3, 0.6, 0.8], Math.PI / 2));
  parts.push(...lionSpout("marble", [bx - 0.31, 1.15, z], -Math.PI / 2, 0.42));
  return parts;
}

export function streetParts(): Part[] {
  const parts: Part[] = [];
  const C = STREETS.curetes;
  const M = STREETS.marble;
  parts.push(...paving(C.x0, C.x1, C.z0, C.z1, "z"));
  parts.push(...paving(M.x0, M.x1, M.z0, M.z1, "x"));
  // The pavement under the statues on Curetes Street's north side.
  parts.push(...paving(C.x0 - 2.4, C.x0 - 0.3, C.z0, C.z1, "z", "stone"));
  // Kerbs along both streets.
  for (const x of [C.x0 - 0.15, C.x1 + 0.15])
    parts.push(box("stone", [x, 0, (C.z0 + C.z1) / 2], [0.3, 0.16, C.z1 - C.z0]));
  for (const z of [M.z0 - 0.15, M.z1 + 0.15])
    parts.push(box("stone", [(M.x0 + M.x1) / 2, 0, z], [M.x1 - M.x0, 0.16, 0.3]));

  // Curetes Street: a stoa along its south side, statues on bases along the north.
  parts.push(
    ...stoa({
      axis: "z",
      line: C.x1 + 0.9,
      back: 1,
      from: C.z0 + 2,
      to: C.z1 - 3.6,
      depth: 5,
      height: 5.2,
    }),
  );
  [-27.5, -33.5, -39.5, -45.5, -51.5].forEach((z, i) => {
    parts.push(...honoured([C.x0 - 0.9, 0, z], FACING.east, i));
  });
  // Marble Street: the agora's east wall on one side, a stoa on the other.
  parts.push(box("stone", [(M.x0 + GATE.back) / 2, 0, M.z1 + 0.7], [GATE.back - M.x0, 5.2, 1.2]));
  parts.push(
    ...stoa({
      axis: "x",
      line: M.z0 - 0.9,
      back: -1,
      from: M.x0 + 2,
      to: M.x1 - 2,
      depth: 4.5,
      height: 5,
    }),
  );
  [-22, -30, -38].forEach((x, i) =>
    parts.push(...honoured([x, 0, M.z1 - 0.8], FACING.north - Math.PI, i + 1)),
  );

  // The fountain where Curetes Street opens onto the square.
  parts.push(...fountain(13.2, -20.6));

  return parts.map((part) => ({ ...part, decor: true }));
}

/** Whether a point is on the streets, their stoas or the fountain. */
export function onStreets(x: number, z: number, margin = 0.6): boolean {
  const C = STREETS.curetes;
  const M = STREETS.marble;
  return (
    (x > C.x0 - 2 - margin && x < C.x1 + 7 + margin && z > C.z0 - margin && z < C.z1 + margin) ||
    (x > M.x0 - margin && x < M.x1 + margin && z > M.z0 - 6.5 - margin && z < M.z1 + 2 + margin) ||
    (x > 11 && x < 15.5 && z > -24 && z < -17)
  );
}
