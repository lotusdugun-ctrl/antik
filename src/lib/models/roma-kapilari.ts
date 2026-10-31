import { ashlar, FACING } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitColumn as column,
  kitCornice as cornice,
  kitCyl as cyl,
  kitPerson as person,
  kitPrism as prism,
  kitScenery as scenery,
  kitSetting as setting,
  kitWorn as worn,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";

/**
 * Two Roman gateways of the 2nd century AD that a street ran through.
 *
 * `arch`: Hadrian's Gate at Attaleia (Antalya), the city gate built for the
 * emperor's visit — three equal arches between four piers, a column on a
 * tall pedestal in front of each pier on both faces carrying the entablature,
 * a lost upper storey, and a tower either side in the city wall.
 *
 * `tetrapylon`: the Tetrapylon at Aphrodisias (c. AD 200), the monumental
 * gateway from the main street into the forecourt of the sanctuary of
 * Aphrodite — four rows of four columns, a pediment over each front.
 *
 * Model axes: the street runs along z through the gate; its outer face (the
 * way in from the country, or from the main street) looks -z.
 */
export type RomanGateSpec = {
  kind: "roman-gate";
  variant: "arch" | "tetrapylon";
  /** Cited where the record says so; see its `uncertainty`. */
  openings: number;
  archSpan: number;
  archHeight: number;
  totalHeight: number;
  entablatureHeight: number;
  columnHeight: number;
  columnDiameter: number;
  /** Columns across one face (a tetrapylon: across each of its rows). */
  columnsPerFace: number;
  /** The tetrapylon's rows of columns, front to back. */
  rows?: number;
  /** The width of a bay of the lost upper storey, from its pier bases. */
  upperBay?: number;
  /** Modelled. */
  pierWidth: number;
  depth: number;
  upperHeight?: number;
  towerSide?: number;
  towerHeight?: number;
};

const ENTAB_MAT: Material = "marble";

/** An arch's spandrel wall, the round head cut out of it, facing -z, extruded `depth` along +z. */
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
    [r, spring],
    [r, top],
    [-r, top],
    [-r, spring],
  ];
  for (let k = 19; k >= 1; k -= 1) {
    const a = (k / 20) * Math.PI;
    outline.push([Math.cos(a) * r, spring + Math.sin(a) * r]);
  }
  return { kind: "carving", material, at, outline, depth, sink: 0, rotY: 0 };
}

/** A half-annulus round an arch head, `inner` to `outer`, extruded `depth` along +z. */
function archBand(material: Material, at: Vec3, inner: number, outer: number, depth: number): Part {
  const outline: [number, number][] = [];
  const n = 22;
  for (let k = 0; k <= n; k += 1) {
    const a = (k / n) * Math.PI;
    outline.push([Math.cos(a) * outer, Math.sin(a) * outer]);
  }
  for (let k = n; k >= 0; k -= 1) {
    const a = (k / n) * Math.PI;
    outline.push([Math.cos(a) * inner, Math.sin(a) * inner]);
  }
  return { kind: "carving", material, at, outline, depth, sink: 0, rotY: 0 };
}

export function gateLayout(spec: RomanGateSpec) {
  const S = spec.archSpan;
  const P = spec.pierWidth;
  const width = spec.openings * S + (spec.openings + 1) * P;
  const beamFoot = spec.totalHeight - spec.entablatureHeight;
  const pedestal = Math.max(0.2, beamFoot - spec.columnHeight);
  // Middle of each opening and of each pier, across the face.
  const openingsX = Array.from(
    { length: spec.openings },
    (_, i) => -width / 2 + P + S / 2 + i * (S + P),
  );
  const piersX = Array.from(
    { length: spec.openings + 1 },
    (_, i) => -width / 2 + P / 2 + i * (S + P),
  );
  return { width, beamFoot, pedestal, openingsX, piersX };
}

/**
 * A column standing on a moulded pedestal, its shaft of grey granite (the
 * marble column is drawn under a granite sleeve over the shaft, so its base
 * and capital stay white).
 */
function pedestalColumn(spec: RomanGateSpec, at: Vec3, pedestal: number, granite: boolean): Part[] {
  const [x, y, z] = at;
  const d = spec.columnDiameter;
  const parts: Part[] = [];
  const pw = d * 1.9;
  parts.push(box("marble", [x, y, z], [pw + 0.16, 0.22, pw + 0.16]));
  parts.push(box("marble", [x, y + 0.22, z], [pw, pedestal - 0.44, pw]));
  parts.push(box("marble", [x, y + pedestal - 0.22, z], [pw + 0.14, 0.22, pw + 0.14]));
  parts.push(...column("marble", [x, y + pedestal, z], d, spec.columnHeight, "composite", 0));
  if (granite) {
    const r = d / 2 + 0.012;
    parts.push(
      cyl(
        "granite",
        [x, y + pedestal + d * 0.42, z],
        r,
        r * 0.86,
        spec.columnHeight - d * 1.65,
        18,
      ),
    );
  }
  return parts;
}

/** A street of large paving slabs, the wheel ruts worn into it. */
function street(z0: number, z1: number, width: number): Part[] {
  const parts: Part[] = [box("limestone", [0, -0.12, (z0 + z1) / 2], [width, 0.14, z1 - z0])];
  for (let z = z0 + 1.1; z < z1; z += 1.1)
    parts.push(box("stoneDark", [0, 0.015, z], [width - 0.2, 0.012, 0.025]));
  for (const s of [-0.75, 0.75])
    parts.push(box("stoneDark", [s, 0.016, (z0 + z1) / 2], [0.22, 0.012, z1 - z0]));
  return parts;
}

export function gateParts(spec: RomanGateSpec): Part[] {
  return spec.variant === "tetrapylon" ? tetrapylonParts(spec) : archGateParts(spec);
}

function archGateParts(spec: RomanGateSpec): Part[] {
  const parts: Part[] = [];
  const L = gateLayout(spec);
  const S = spec.archSpan;
  const r = S / 2;
  const spring = spec.archHeight - r;
  const D = spec.depth;
  const W = L.width;
  const top = L.beamFoot;
  const front = -D / 2;

  parts.push(...setting(34, 4127, { hills: 0.6, stone: 0.4, grass: 0.8, ground: "limestone" }));
  parts.push(...street(-38, 38, S + 1.5));

  /* ---- the piers and the arches through them ---- */
  for (const x of L.piersX) parts.push(box("marble", [x, 0, 0], [spec.pierWidth, top, D]));
  for (const x of L.openingsX) {
    parts.push(spandrel("marble", [x, 0, front], S, spring, top, D));
    // The soffit, in coffers: ribs across the vault, a rosette in each coffer.
    for (let k = 0; k <= 4; k += 1) {
      const z = front + 0.25 + (k * (D - 0.5)) / 4;
      parts.push(archBand("marble", [x, spring, z - 0.09], r - 0.12, r + 0.01, 0.18));
    }
    for (let k = 0; k < 4; k += 1) {
      const z = front + 0.25 + ((k + 0.5) * (D - 0.5)) / 4;
      for (const a of [Math.PI * 0.3, Math.PI * 0.5, Math.PI * 0.7]) {
        parts.push(
          box(
            "marble",
            [x + Math.cos(a) * (r - 0.06), spring + Math.sin(a) * (r - 0.06), z],
            [0.32, 0.32, 0.32],
            0,
          ),
        );
      }
    }
    for (const [z, out] of [
      [front, -1],
      [-front, 1],
    ] as const) {
      // The archivolt, a moulded band round the head, and the impost blocks it springs from.
      parts.push(archBand("marble", [x, spring, out < 0 ? z - 0.12 : z], r + 0.02, r + 0.42, 0.12));
      for (const s of [-1, 1])
        parts.push(
          box("marble", [x + s * (r + 0.22), spring - 0.26, z + out * 0.06], [0.5, 0.26, 0.14]),
        );
      // The keystone, carved with a bust as Roman keystones were.
      parts.push(box("marble", [x, spring + r - 0.08, z + out * 0.09], [0.46, 0.7, 0.18]));
    }
  }
  // A plinth along the foot of the gate.
  parts.push(box("marble", [0, 0, 0], [W + 0.2, 0.35, D + 0.2]));

  /* ---- the columns on their pedestals, on both faces ---- */
  const colZ = (side: number) => side * (D / 2 + spec.columnDiameter * 1.2);
  for (const side of [-1, 1]) {
    for (const x of L.piersX)
      parts.push(...pedestalColumn(spec, [x, 0, colZ(side)], L.pedestal, true));
  }

  /* ---- the entablature, broken forward over each column ---- */
  const H = spec.entablatureHeight;
  const arch = H * 0.36;
  const frieze = H * 0.3;
  const crown = H - arch - frieze;
  const beam = (x: number, z: number, w: number, d: number) => {
    parts.push(box(ENTAB_MAT, [x, top, z], [w, arch * 0.5, d]));
    parts.push(box(ENTAB_MAT, [x, top + arch * 0.5, z], [w + 0.04, arch * 0.5, d + 0.04]));
    parts.push(box(ENTAB_MAT, [x, top + arch, z], [w, frieze, d]));
    parts.push(...cornice(ENTAB_MAT, [x, top + arch + frieze, z], w, d, crown));
  };
  beam(0, 0, W, D);
  for (const side of [-1, 1])
    for (const x of L.piersX) {
      const reach = spec.columnDiameter * 1.2 + spec.columnDiameter * 0.6;
      beam(x, side * (D / 2 + reach / 2 - 0.05), spec.columnDiameter * 1.5, reach + 0.1);
    }
  // A palmette cresting along the cornice of the outer face.
  for (let x = -W / 2 + 0.4; x < W / 2 - 0.2; x += 0.62)
    parts.push(box("marble", [x, spec.totalHeight, front - 0.05], [0.2, 0.22, 0.08]));

  /* ---- the upper storey, lost: a row of pilasters on their pier bases ---- */
  const up = spec.upperHeight ?? 3;
  const bay = spec.upperBay ?? 2.36;
  const y1 = spec.totalHeight;
  parts.push(box("marbleWorn", [0, y1, 0], [W - 0.6, up, D - 0.6]));
  const n = Math.floor((W - 1.2) / bay);
  for (let i = 0; i <= n; i += 1) {
    const x = -(n * bay) / 2 + i * bay;
    for (const side of [-1, 1]) {
      const z = side * ((D - 0.6) / 2 + 0.1);
      parts.push(box("marble", [x, y1, z], [0.62, 0.36, 0.3]));
      parts.push(box("marble", [x, y1 + 0.36, z], [0.46, up - 0.82, 0.2]));
      parts.push(box("marble", [x, y1 + up - 0.46, z], [0.6, 0.3, 0.3]));
    }
  }
  // Panels between them, and the cornice over the whole.
  for (let i = 0; i < n; i += 1) {
    const x = -(n * bay) / 2 + (i + 0.5) * bay;
    for (const side of [-1, 1])
      parts.push(
        box("marble", [x, y1 + 0.7, side * ((D - 0.6) / 2 + 0.04)], [bay - 1.0, up - 1.6, 0.08]),
      );
  }
  parts.push(...cornice("marble", [0, y1 + up - 0.16, 0], W - 0.3, D - 0.3, 0.5));

  /* ---- the towers either side, and the wall running off from them ---- */
  const T = spec.towerSide ?? 7;
  const TH = spec.towerHeight ?? 14;
  for (const s of [-1, 1]) {
    const tx = s * (W / 2 + T / 2);
    parts.push(worn(box("limestone", [tx, 0, 0.6], [T, TH, T]), 0.02));
    for (const [rotY, length, ox, oz] of [
      [FACING.south, T, 0, -T / 2 + 0.6],
      [s > 0 ? FACING.east : FACING.west, T, s * (T / 2), 0.6],
    ] as const)
      parts.push(
        ...ashlar({
          at: [tx + ox, 0, oz],
          rotY,
          length,
          height: TH,
          material: "limestone",
          course: 0.62,
          blocks: 1.3,
          coping: false,
        }),
      );
    parts.push(box("limestone", [tx, TH, 0.6], [T + 0.3, 0.35, T + 0.3]));
    for (let i = 0; i < 4; i += 1)
      for (const [dx, dz] of [
        [-T / 2 + 0.5 + i * ((T - 1) / 3), -T / 2 + 0.45],
        [-T / 2 + 0.5 + i * ((T - 1) / 3), T / 2 - 0.45],
      ])
        parts.push(box("limestone", [tx + dx!, TH + 0.35, 0.6 + dz!], [0.9, 1.0, 0.6]));
    // Slit windows lighting the stair inside.
    for (const y of [4, 8, 11.5])
      parts.push(box("shadow", [tx, y, 0.6 - T / 2 - 0.01], [0.3, 1.1, 0.04]));
    // The city wall running off from the tower.
    const wl = 26;
    const wx = s * (W / 2 + T - 0.3 + wl / 2);
    parts.push(box("limestone", [wx, 0, 1.4], [wl, TH - 4, 3]));
    parts.push(
      ...ashlar({
        at: [wx, 0, -0.1],
        rotY: FACING.south,
        length: wl,
        height: TH - 4,
        material: "limestone",
        course: 0.6,
        blocks: 1.4,
        coping: false,
      }),
    );
    for (let i = 0; i < 16; i += 1)
      parts.push(
        box("limestone", [wx - wl / 2 + 0.8 + i * ((wl - 1.6) / 15), TH - 4, 0.1], [0.8, 0.9, 0.5]),
      );
  }
  return parts;
}

function tetrapylonParts(spec: RomanGateSpec): Part[] {
  const parts: Part[] = [];
  const rows = spec.rows ?? 4;
  const n = spec.columnsPerFace;
  const d = spec.columnDiameter;
  const S = spec.archSpan;
  // The middle passage is the wide one, the two outer ones narrower.
  const xs = [-(S / 2 + spec.pierWidth), -S / 2, S / 2, S / 2 + spec.pierWidth];
  const W = xs[n - 1]! - xs[0]! + d * 2.6;
  const D = spec.depth;
  const zs = Array.from({ length: rows }, (_, i) => -D / 2 + (i * D) / (rows - 1));
  const pedestal = Math.max(0.6, spec.totalHeight - spec.entablatureHeight - spec.columnHeight);
  const top = pedestal + spec.columnHeight;

  parts.push(...setting(30, 4211, { hills: 0.9, stone: 0.35, grass: 1.0, ground: "limestone" }));
  // The paved square in front, and the court of the sanctuary behind.
  parts.push(box("marbleWorn", [0, -0.12, 0], [W + 14, 0.14, D + 30]));
  for (let x = -W / 2 - 6.5; x <= W / 2 + 6.5; x += 1.6)
    parts.push(box("stoneDark", [x, 0.015, 0], [0.025, 0.012, D + 30]));
  // The pedestals stand on the paving itself: the street runs on through the gate.
  const base = 0;

  zs.forEach((z, row) => {
    const outer = row === 0 || row === rows - 1;
    xs.forEach((x) => {
      const pw = d * 1.7;
      parts.push(box("marble", [x, base, z], [pw + 0.12, 0.2, pw + 0.12]));
      parts.push(box("marble", [x, base + 0.2, z], [pw, pedestal - base - 0.4, pw]));
      parts.push(box("marble", [x, pedestal - 0.2, z], [pw + 0.12, 0.2, pw + 0.12]));
      // The columns of the two fronts were fluted (in a spiral, on the street
      // side); the inner rows plain.
      parts.push(
        ...column(
          "marble",
          [x, pedestal, z],
          d,
          spec.columnHeight,
          "composite",
          outer ? 20 : 0,
          outer,
        ),
      );
    });
    // The entablature over each row, carried across the gate.
    const H = spec.entablatureHeight;
    parts.push(box("marble", [0, top, z], [W, H * 0.4, d * 1.4]));
    parts.push(box("paintBlue", [0, top + H * 0.42, z], [W - 0.1, H * 0.22, d * 1.34]));
    parts.push(...cornice("marble", [0, top + H * 0.62, z], W + 0.2, d * 1.5, H * 0.38));
  });
  // Coffered ceilings over the bays between the rows.
  const ceilY = top + spec.entablatureHeight * 0.4;
  for (let i = 0; i + 1 < rows; i += 1) {
    const zc = (zs[i]! + zs[i + 1]!) / 2;
    const dz = zs[i + 1]! - zs[i]! - d * 1.4;
    parts.push(box("marble", [0, ceilY + spec.entablatureHeight * 0.3, zc], [W, 0.3, dz + 0.1]));
    // The coffers: a grid of ribs under the ceiling slab.
    for (let c = 0; c <= 6; c += 1)
      parts.push(
        box(
          "marble",
          [-W / 2 + (W * c) / 6, ceilY + spec.entablatureHeight * 0.3 - 0.16, zc],
          [0.16, 0.16, dz - 0.2],
        ),
      );
    parts.push(
      box("marble", [0, ceilY + spec.entablatureHeight * 0.3 - 0.16, zc], [W, 0.16, 0.16]),
    );
  }

  /*
   * The two fronts: a pediment over each, its middle broken by an arch over
   * the wide passage — the Syrian pediment of the eastern Roman provinces —
   * with acroteria at its corners.
   */
  const crownY = top + spec.entablatureHeight;
  const pitch = 1.9;
  for (const [i, out] of [
    [0, -1],
    [rows - 1, 1],
  ] as const) {
    const z = zs[i]!;
    const pd = d * 1.5;
    parts.push(prism("marble", [0, crownY, z], [W + 0.2, pitch, pd], 0));
    // The raking cornices, a step proud of the tympanum.
    const rake = Math.atan2(pitch, W / 2);
    const len = Math.hypot(W / 2, pitch);
    for (const s of [-1, 1])
      parts.push({
        kind: "box",
        material: "marble",
        at: [s * (W / 4), crownY + pitch / 2 - 0.1, z],
        size: [pd + 0.2, 0.24, len + 0.3],
        rotY: -s * (Math.PI / 2),
        rotX: -rake,
      });
    // The arch rising into the pediment over the wide passage.
    parts.push(
      archBand(
        "marble",
        [0, crownY - 0.7, out < 0 ? z - pd / 2 - 0.36 : z + pd / 2 + 0.22],
        S / 2 - 0.1,
        S / 2 + 0.35,
        0.14,
      ),
    );
    // Reliefs in the tympana: Erotes among acanthus, drawn as figures in the field.
    for (const s of [-1, 1])
      parts.push({
        ...person(
          [s * (S / 2 + 1.1), crownY + 0.05, z + out * (d * 0.76)],
          0.75,
          out < 0 ? Math.PI : 0,
          "marble",
          false,
        ),
        scan: { id: "magdalensberg-youth" },
      });
    for (const x of [-W / 2 + 0.2, W / 2 - 0.2, 0])
      parts.push(box("marble", [x, x === 0 ? crownY + S / 2 + 0.45 : crownY, z], [0.5, 0.7, 0.3]));
  }
  // The roof over the whole, behind the pediments.
  parts.push(box("marbleWorn", [0, crownY, 0], [W - 0.6, 0.5, D - d * 2]));
  return parts;
}

/** On the street before the outer face, looking through the gate. */
export function gateWalkStart(spec: RomanGateSpec): WalkStart {
  return {
    at: [1.6, -spec.depth / 2 - 13],
    floor: 0,
    look: [0, spec.totalHeight * 0.45, 0],
  };
}
