import { ashlar, FACING } from "@/lib/reconstruction-detail";
import type { ScanId } from "@/lib/scans";
import {
  kitBox as box,
  kitColumn as column,
  kitCornice as cornice,
  kitCyl as cyl,
  kitPerson as person,
  kitPrism as prism,
  kitSetting as setting,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";

/**
 * A small prostyle temple fronting a street: the so-called Temple of Hadrian
 * on Curetes Street at Ephesus (AD 117/118). Its porch has two Corinthian
 * columns between two corner pillars; over the middle two a Syrian arch rises
 * into the pediment, a bust of Tyche on its keystone; inside the porch a
 * frieze of the founding of Ephesus runs over the door, and in the lunette
 * over the door a woman rises out of acanthus. The cella behind is small and
 * wider than it is deep. Four statue bases stand before it on the street.
 *
 * Model axes: the façade looks -z onto the street, which runs along x.
 */
export type ProstyleTempleSpec = {
  kind: "prostyle-temple";
  /** Cited. */
  columns: number;
  pillars: number;
  statueBases: number;
  /** Modelled: see the record's `uncertainty`. */
  facadeWidth: number;
  columnHeight: number;
  columnDiameter: number;
  porchDepth: number;
  cellaDepth: number;
  podiumHeight: number;
  entablatureHeight: number;
};

export function prostyleLayout(spec: ProstyleTempleSpec) {
  const front = -spec.porchDepth;
  const street = front - 1.6 - (spec.podiumHeight / 0.25) * 0.32;
  return { front, street, top: spec.podiumHeight + spec.columnHeight };
}

const STONE: Material = "marble";

/** Every statue in the app is drawn from a scan (see `scans.ts`). */
const scanned = (part: Part, id: ScanId): Part => ({ ...part, scan: { id } });

export function prostyleParts(spec: ProstyleTempleSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.facadeWidth;
  const P = spec.podiumHeight;
  const L = prostyleLayout(spec);
  const H = spec.entablatureHeight;
  const top = L.top;
  const back = spec.cellaDepth;

  parts.push(...setting(26, 1180, { hills: 1.2, stone: 0.5, grass: 0.7, ground: "limestone" }));

  /* ---- the street, its stoa opposite, and the neighbours' fronts ---- */
  const sz = L.street;
  parts.push(box("marbleWorn", [0, -0.12, sz - 2], [60, 0.14, 11]));
  for (let x = -29; x <= 29; x += 1.3)
    parts.push(box("stoneDark", [x, 0.015, sz - 2], [0.02, 0.012, 11]));
  // A colonnade along the far side of the street, shops behind it.
  const fz = sz - 7.6;
  for (let x = -27; x <= 27; x += 3)
    parts.push(...column("marble", [x, 0, fz], 0.5, 4.6, "ionic", 0));
  parts.push(box("marble", [0, 4.6, fz - 1.5], [56, 0.6, 3.6]));
  parts.push(box("limestone", [0, 0, fz - 3.6], [56, 5.2, 0.6]));
  parts.push(prism("terracotta", [0, 5.2, fz - 1.8], [4.2, 0.9, 56], FACING.east));
  for (let x = -25; x <= 25; x += 5) parts.push(box("shadow", [x, 0, fz - 3.29], [1.6, 2.6, 0.02]));
  // Shops either side of the temple on its own side of the street, lower than
  // it and roofed in tile, a door to each.
  for (const s of [-1, 1]) {
    const x = s * (W / 2 + 0.6 + 7);
    const hz0 = L.front - 1;
    const hd = back + 1 - hz0;
    const hh = 5.2;
    parts.push(box("limestone", [x, 0, hz0 + hd / 2], [14, hh, hd]));
    parts.push(
      ...ashlar({
        at: [x, 0, hz0 - 0.01],
        rotY: FACING.south,
        length: 14,
        height: hh,
        material: "limestone",
        course: 0.45,
        blocks: 1.1,
        gaps: [
          [-5, -3.4],
          [-0.8, 0.8],
          [3.4, 5],
        ],
      }),
    );
    for (const u of [-4.2, 0, 4.2])
      parts.push(box("shadow", [x + u, 0, hz0 - 0.005], [1.6, 2.6, 0.02]));
    parts.push(prism("terracotta", [x, hh, hz0 + hd / 2], [14.3, 1.2, hd + 0.4], 0));
  }

  /* ---- the podium and its steps ---- */
  const D = back + spec.porchDepth;
  parts.push(box("marble", [0, 0, D / 2 - spec.porchDepth], [W + 0.6, P, D]));
  parts.push(...cornice("marble", [0, P - 0.25, D / 2 - spec.porchDepth], W + 0.8, D + 0.2, 0.25));
  const steps = Math.ceil(P / 0.25);
  for (let i = 0; i < steps; i += 1) {
    const d = (steps - i) * 0.32;
    parts.push(
      box("marble", [0, (i * P) / steps, L.front - d / 2], [W + 0.6, P / steps, d + 0.02]),
    );
  }

  /* ---- the porch: pillars at the corners, columns between them ---- */
  const d = spec.columnDiameter;
  const n = spec.columns + spec.pillars;
  const span = W - d * 1.4;
  const xs = Array.from({ length: n }, (_, i) => -span / 2 + (i * span) / (n - 1));
  const z0 = L.front + d * 0.8;
  xs.forEach((x, i) => {
    const pillar = i === 0 || i === n - 1;
    if (pillar) {
      parts.push(box(STONE, [x, P, z0], [d * 1.1, 0.35, d * 1.1]));
      parts.push(box(STONE, [x, P + 0.35, z0], [d * 0.95, spec.columnHeight - 1.0, d * 0.95]));
      parts.push(box(STONE, [x, top - 0.65, z0], [d * 1.15, 0.65, d * 1.15]));
      // The anta runs back to the cella wall.
      parts.push(box(STONE, [x, P, (z0 + 0.3) / 2], [d * 0.7, spec.columnHeight, 0.3 - z0]));
    } else parts.push(...column(STONE, [x, P, z0], d, spec.columnHeight, "composite", 24, true));
  });

  /* ---- the entablature, rising in the middle as the Syrian arch ---- */
  const inner = Math.abs(xs[1]!);
  const r = inner;
  const arch = H * 0.45;
  for (const s of [-1, 1]) {
    const x0 = s * inner;
    const x1 = s * (W / 2 + 0.1);
    const mid = (x0 + x1) / 2;
    const len = Math.abs(x1 - x0) + d * 0.6;
    parts.push(box(STONE, [mid, top, z0], [len, arch * 0.5, d * 1.3]));
    parts.push(box(STONE, [mid, top + arch * 0.5, z0], [len, arch * 0.5, d * 1.34]));
    parts.push(box("paintBlue", [mid, top + arch, z0], [len, H * 0.25, d * 1.32]));
    parts.push(
      ...cornice(STONE, [mid, top + arch + H * 0.25, z0], len, d * 1.5, H - arch - H * 0.25),
    );
  }
  // The arch: the architrave's three fasciae bent up over the middle bay.
  const archOutline = (ri: number, ro: number): [number, number][] => {
    const o: [number, number][] = [];
    const k = 18;
    for (let j = 0; j <= k; j += 1) {
      const a = (j / k) * Math.PI;
      o.push([Math.cos(a) * ro, Math.sin(a) * ro]);
    }
    for (let j = k; j >= 0; j -= 1) {
      const a = (j / k) * Math.PI;
      o.push([Math.cos(a) * ri, Math.sin(a) * ri]);
    }
    return o;
  };
  parts.push({
    kind: "carving",
    material: STONE,
    at: [0, top, z0 - d * 0.85],
    outline: archOutline(r - d * 0.3, r + H * 0.55),
    depth: d * 1.7,
    sink: 0,
    rotY: 0,
  });
  // The keystone, and the bust of Tyche on it with her crown of walls.
  parts.push(box(STONE, [0, top + r - d * 0.3, z0 - d * 0.85 - 0.1], [0.5, H * 0.85, 0.2]));
  parts.push(
    scanned(
      person([0, top + r - d * 0.1, z0 - d * 0.85 - 0.3], 0.75, Math.PI, "marble", {
        name: "Tyche",
        sex: "female",
        hair: "bun",
        headgear: "muralCrown",
        dress: "chiton",
        gesture: "rest",
      }),
      "ephesus-portrait-lod",
    ),
  );

  /* ---- the pediment over the whole, the arch rising into it ---- */
  const crown = top + H;
  const pitch = Math.max(r + H * 0.7 - H + 0.4, W * 0.18);
  parts.push(prism(STONE, [0, crown, z0 + 0.2], [W + 0.3, pitch, d * 1.2], 0));
  for (const x of [-W / 2, 0, W / 2])
    parts.push(
      box(STONE, [x, x === 0 ? crown + pitch - 0.1 : crown, z0 + 0.2], [0.55, 0.75, 0.35]),
    );
  // The roof behind, pitched front to back.
  parts.push(
    prism("terracotta", [0, crown, (z0 + back) / 2 + 0.3], [W + 0.3, pitch * 0.95, back - z0], 0),
  );

  /* ---- the porch inside: the frieze, the door and its lunette ---- */
  const wallZ = 0;
  parts.push(box("marble", [0, P, wallZ + back / 2], [W - 0.6, spec.columnHeight + H * 0.6, back]));
  parts.push(
    ...ashlar({
      at: [0, P, wallZ - 0.01],
      rotY: FACING.south,
      length: 2 * (xs[n - 1]! - d * 0.36),
      height: spec.columnHeight - 1.2,
      material: "marble",
      course: 0.5,
      blocks: 1.4,
      coping: false,
      foot: true,
      gaps: [[-1.1, 1.1]],
    }),
  );
  // The founding frieze of Ephesus over the door: a band of figures in relief.
  const fy = top - 1.0;
  parts.push(box("marble", [0, fy, wallZ - 0.12], [2 * (xs[n - 1]! - d * 0.36) - 0.1, 0.95, 0.12]));
  for (let i = 0; i < 13; i += 1) {
    const x = -W / 2 + 0.6 + (i * (W - 1.2)) / 12;
    parts.push(
      scanned(
        person([x, fy + 0.06, wallZ - 0.22], 0.82, Math.PI, "marble", i % 3 === 0),
        i % 2 ? "asklepios-lod" : "caryatid-lod",
      ),
    );
  }
  // The doorway, its moulded frame and the lunette with the acanthus woman.
  const doorH = Math.min(3.6, spec.columnHeight - 2.4);
  parts.push(box("shadow", [0, P, wallZ - 0.03], [1.9, doorH, 0.04]));
  for (const s of [-1, 1])
    parts.push(box("marble", [s * 1.1, P, wallZ - 0.08], [0.3, doorH + 0.3, 0.14]));
  parts.push(box("marble", [0, P + doorH, wallZ - 0.1], [2.6, 0.32, 0.18]));
  parts.push(
    cyl("marble", [0, P + doorH + 0.32, wallZ - 0.1], 1.2, 1.2, 0.12, 20, {
      rotX: Math.PI / 2,
      thetaStart: -Math.PI / 2,
      thetaLength: Math.PI,
    }),
  );
  parts.push(
    scanned(
      person([0, P + doorH + 0.34, wallZ - 0.22], 0.9, Math.PI, "marble", {
        name: "acanthus woman",
        sex: "female",
        hair: "long",
        dress: "chiton",
        gesture: "raised",
      }),
      "caryatid",
    ),
  );
  // The ceiling of the porch.
  parts.push(box("marble", [0, top + H * 0.2, (z0 + wallZ) / 2], [W - 0.2, 0.2, -z0]));

  /* ---- the statue bases on the street, the tetrarchs on them ---- */
  const step = spec.statueBases > 1 ? (W - 1.2) / (spec.statueBases - 1) : 0;
  for (let i = 0; i < spec.statueBases; i += 1) {
    const x = -W / 2 + 0.6 + i * step;
    const at: Vec3 = [x, 0, L.street + 0.6];
    parts.push(box("marble", at, [0.95, 0.25, 0.95]));
    parts.push(box("marble", [x, 0.25, at[2]], [0.78, 1.25, 0.78]));
    parts.push(box("marble", [x, 1.5, at[2]], [0.95, 0.2, 0.95]));
    parts.push(
      scanned(
        person([x, 1.7, at[2]], 2.0, Math.PI, "marble", {
          name: "tetrarch",
          sex: "male",
          bearded: true,
          hair: "short",
          dress: "toga",
          right: "sceptre",
          gesture: "raised",
        }),
        i % 2 ? "hadrian-troy" : "tiberius-velatus",
      ),
    );
  }
  return parts;
}

/** On Curetes Street, across from the temple, looking at its front. */
export function prostyleWalkStart(spec: ProstyleTempleSpec): WalkStart {
  const L = prostyleLayout(spec);
  return {
    at: [2.2, L.street - 4.5],
    floor: 0,
    look: [0, spec.podiumHeight + spec.columnHeight * 0.6, 0],
  };
}
