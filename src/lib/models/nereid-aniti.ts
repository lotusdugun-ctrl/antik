import { ashlar, FACING, paintBand } from "@/lib/reconstruction-detail";
import type { ScanId } from "@/lib/scans";
import {
  kitBox as box,
  kitColumn as column,
  kitCornice as cornice,
  kitPerson as person,
  kitPrism as prism,
  kitRelief as relief,
  kitScenery as scenery,
  kitSetting as setting,
  kitWorn as worn,
  type FigureIdentity,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";

/**
 * A Lycian heroon: a small Ionic temple on a tall podium, a tomb built to
 * look like a shrine. Modelled on the Nereid Monument at Xanthos (c. 390-380
 * BC), the tomb of the dynast Arbinas: four by six columns, statues of
 * running sea-nymphs between them, two bands of frieze round the podium —
 * battles below, the siege of a city on each side above — and a gabled roof
 * with sculpture in its pediments. It stood on the edge of the city's hill,
 * above the Xanthos valley; its remains are in the British Museum.
 *
 * Model axes: the entrance front looks -z (real east).
 */
export type LycianHeroonSpec = {
  kind: "lycian-heroon";
  /** Cited. */
  columnsShort: number;
  columnsLong: number;
  /** Blocks in each of the two podium friezes. */
  friezeBlocks: number;
  /** The Nereids between the columns: as many as survive. */
  nereids: number;
  /** Modelled: see the record's `uncertainty`. */
  podiumWidth: number;
  podiumLength: number;
  podiumHeight: number;
  columnHeight: number;
  columnDiameter: number;
  entablatureHeight: number;
};

/** A statue drawn from a scan (every statue in the app is): see `scans.ts`. */
const statue = (at: Vec3, h: number, rotY: number, id: ScanId): Part => ({
  ...person(at, h, rotY, "marble", true),
  scan: { id },
});

const NEREID: FigureIdentity = {
  name: "Nereid",
  sex: "female",
  hair: "long",
  dress: "chiton",
  gesture: "forward",
};

export function heroonParts(spec: LycianHeroonSpec): Part[] {
  const parts: Part[] = [];
  const W = spec.podiumWidth;
  const D = spec.podiumLength;
  const P = spec.podiumHeight;

  parts.push(...setting(22, 3809, { hills: 1.4, stone: 1.0, grass: 0.8, ground: "limestone" }));
  // The rock of the hill's edge it stands on, falling away to the west.
  parts.push(scenery(worn(box("rock", [0, -3.5, 2], [W + 9, 3.5, D + 9]), 0.9)));

  /* ---- the podium: two stepped courses at its foot, then the friezes ---- */
  parts.push(box("limestone", [0, 0, 0], [W + 1.2, 0.4, D + 1.2]));
  parts.push(box("limestone", [0, 0.4, 0], [W + 0.6, 0.4, D + 0.6]));
  parts.push(box("marbleWorn", [0, 0.8, 0], [W, P - 1.1, D]));
  const faces = [
    { rotY: FACING.south, length: W, out: D / 2 },
    { rotY: FACING.north, length: W, out: D / 2 },
    { rotY: FACING.west, length: D, out: W / 2 },
    { rotY: FACING.east, length: D, out: W / 2 },
  ] as const;
  for (const f of faces)
    parts.push(
      ...ashlar({
        at: [Math.sin(f.rotY) * f.out, 0.8, Math.cos(f.rotY) * f.out],
        rotY: f.rotY,
        length: f.length,
        height: P * 0.45,
        material: "marbleWorn",
        course: 0.62,
        blocks: 1.3,
        coping: false,
      }),
    );
  /*
   * The two friezes: a deeper one of battles over the plain courses, a
   * shallower one of a city besieged near the top, each of `friezeBlocks`
   * slabs round the four sides, set out in proportion to each side's length.
   */
  const band = (y: number, h: number, seed: number) => {
    const perimeter = 2 * (W + D);
    let k = 0;
    for (const f of faces) {
      const count = Math.max(2, Math.round((spec.friezeBlocks * f.length) / perimeter));
      const slab = f.length / count;
      for (let i = 0; i < count; i += 1, k += 1) {
        const u = -f.length / 2 + slab * (i + 0.5);
        const c = Math.cos(f.rotY);
        const s = Math.sin(f.rotY);
        const at: Vec3 = [s * (f.out + 0.03) + c * u, y, c * (f.out + 0.03) - s * u];
        parts.push(relief("marble", at, [slab - 0.04, h], undefined, f.rotY));
        // On the battle band, a fighter to a slab, standing out from its ground.
        if (seed === 0)
          parts.push(
            statue(
              [s * (f.out + 0.1) + c * u, y + 0.04, c * (f.out + 0.1) - s * u],
              h * 0.88,
              f.rotY + (k % 2 ? 0.5 : -0.5),
              k % 2 ? "asklepios-lod" : "caryatid-lod",
            ),
          );
      }
    }
    parts.push(paintBand("fadedBlue", [0, y + h * 0.05, -D / 2 - 0.035], FACING.south, W, h * 0.9));
  };
  band(P * 0.45 + 0.85, 0.95, 0);
  parts.push(box("marble", [0, P * 0.45 + 1.8, 0], [W + 0.1, 0.18, D + 0.1]));
  band(P - 0.95, 0.62, 1);
  parts.push(...cornice("marble", [0, P - 0.3, 0], W + 0.5, D + 0.5, 0.3));

  /* ---- the colonnade, the Nereids between its columns ---- */
  const inset = spec.columnDiameter * 1.2;
  const gw = W - 2 * inset;
  const gd = D - 2 * inset;
  const at: Vec3[] = [];
  for (let i = 0; i < spec.columnsShort; i += 1)
    for (let k = 0; k < spec.columnsLong; k += 1) {
      const edge = i === 0 || i === spec.columnsShort - 1 || k === 0 || k === spec.columnsLong - 1;
      if (!edge) continue;
      const x = -gw / 2 + (gw * i) / (spec.columnsShort - 1);
      const z = -gd / 2 + (gd * k) / (spec.columnsLong - 1);
      at.push([x, P, z]);
      parts.push(
        ...column("marble", [x, P, z], spec.columnDiameter, spec.columnHeight, "ionic", 20, true),
      );
    }
  // Each Nereid on her small base, running, her drapery blown back, a sea
  // creature under her feet: in the intercolumniations of the fronts and sides.
  let placed = 0;
  const stepX = gw / (spec.columnsShort - 1);
  const stepZ = gd / (spec.columnsLong - 1);
  const slots: [Vec3, number][] = [];
  for (let i = 0; i + 1 < spec.columnsShort; i += 1) {
    const x = -gw / 2 + stepX * (i + 0.5);
    slots.push([[x, P, -gd / 2], Math.PI], [[x, P, gd / 2], 0]);
  }
  for (let k = 0; k + 1 < spec.columnsLong; k += 1) {
    const z = -gd / 2 + stepZ * (k + 0.5);
    slots.push([[-gw / 2, P, z], -Math.PI / 2], [[gw / 2, P, z], Math.PI / 2]);
  }
  for (const [p, rotY] of slots) {
    if (placed >= spec.nereids) break;
    parts.push(box("marble", p, [0.7, 0.3, 0.7]));
    parts.push(box("paintBlue", [p[0], p[1] + 0.3, p[2]], [0.62, 0.12, 0.62]));
    parts.push({
      ...person(
        [p[0], p[1] + 0.42, p[2]],
        1.45,
        rotY + (placed % 2 ? 0.35 : -0.35),
        "marble",
        NEREID,
      ),
      // One of the monument's own Nereids, and the flying Nike of the same pose.
      scan: { id: placed % 2 ? "nike" : "nereid-xanthos" },
    });
    placed += 1;
  }
  // The cella, its walls laid in courses, the door on the front.
  const cw = gw - stepX * 1.05;
  const cd = gd - stepZ * 1.3;
  parts.push(box("marbleWorn", [0, P, 0], [cw, spec.columnHeight, cd]));
  parts.push(
    ...ashlar({
      at: [0, P, -cd / 2],
      rotY: FACING.south,
      length: cw,
      height: spec.columnHeight,
      material: "marble",
      course: 0.5,
      coping: false,
      gaps: [[-0.55, 0.55]],
    }),
  );
  parts.push(box("shadow", [0, P, -cd / 2 - 0.01], [1.1, spec.columnHeight * 0.68, 0.02]));
  // A frieze of the dynast's banquet and sacrifice along the top of the cella wall.
  parts.push(
    relief(
      "marble",
      [0, P + spec.columnHeight - 0.62, -cd / 2 - 0.03],
      [cw - 0.2, 0.5],
      undefined,
      FACING.south,
    ),
  );

  /* ---- the entablature, the pediments, the roof and its acroteria ---- */
  const top = P + spec.columnHeight;
  const H = spec.entablatureHeight;
  const ew = gw + spec.columnDiameter * 2.4;
  const ed = gd + spec.columnDiameter * 2.4;
  parts.push(box("marble", [0, top, 0], [ew, H * 0.4, ed]));
  // The architrave's own frieze: the hunt, the offering-bearers, the feast.
  for (const f of [
    { rotY: FACING.south, length: ew, out: ed / 2 },
    { rotY: FACING.north, length: ew, out: ed / 2 },
  ])
    parts.push(
      paintBand(
        "fadedRed",
        [0, top + H * 0.05, Math.cos(f.rotY) * (f.out + 0.01)],
        f.rotY,
        f.length,
        H * 0.3,
      ),
    );
  // Dentils, and the cornice.
  for (let x = -ew / 2 + 0.12; x < ew / 2; x += 0.24)
    for (const s of [-1, 1])
      parts.push(box("marble", [x, top + H * 0.45, s * (ed / 2 + 0.04)], [0.13, 0.16, 0.12]));
  parts.push(box("marble", [0, top + H * 0.4, 0], [ew - 0.1, H * 0.22, ed - 0.1]));
  parts.push(...cornice("marble", [0, top + H * 0.62, 0], ew + 0.3, ed + 0.3, H * 0.38));
  const roofY = top + H;
  const pitch = ew * 0.2;
  parts.push(prism("terracotta", [0, roofY, 0], [ew + 0.3, pitch, ed + 0.3], 0));
  for (const s of [-1, 1]) {
    const z = s * (ed / 2 + 0.16);
    parts.push(prism("marble", [0, roofY, z], [ew + 0.3, pitch, 0.06], 0));
    parts.push(
      paintBand(
        "fadedBlue",
        [0, roofY + 0.15, z + s * 0.035],
        s < 0 ? FACING.south : FACING.north,
        ew * 0.55,
        pitch * 0.45,
      ),
    );
    // The figures of the pediment: the dynast and his wife enthroned on the
    // front, a battle at the back — sketched as figures, standing in the field.
    for (const u of [-0.9, 0.9])
      parts.push(
        statue(
          [u, roofY + 0.12, z + s * 0.08],
          0.95,
          s < 0 ? Math.PI : 0,
          u < 0 ? "caryatid-lod" : "tiberius-velatus-lod",
        ),
      );
    // An acroterion at the apex.
    parts.push({
      ...person([0, roofY + pitch, z], 1.2, s < 0 ? Math.PI : 0, "marble", NEREID),
      scan: { id: "nike" },
    });
  }
  return parts;
}

/** Before the front of the tomb, a few steps back on the hill, looking up at it. */
export function heroonWalkStart(spec: LycianHeroonSpec): WalkStart {
  return {
    at: [1.5, -spec.podiumLength / 2 - 9],
    floor: 0,
    look: [0, spec.podiumHeight + spec.columnHeight * 0.5, 0],
  };
}
