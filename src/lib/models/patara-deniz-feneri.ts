import { ashlar, FACING } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitCornice as cornice,
  kitCyl as cyl,
  kitScenery as scenery,
  kitSetting as setting,
  kitWorn as worn,
  type Part,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { arch } from "@/lib/models/craft";

/**
 * A Roman harbour lighthouse: a cylindrical tower on a square base at the end
 * of the mole, the fire burning in a lantern on its top. Modelled on the
 * lighthouse of Patara, raised under Nero in AD 64-65, found in the sand at
 * the harbour mouth and rebuilt from its own blocks.
 */
export type LighthouseSpec = {
  kind: "lighthouse";
  /** Modelled: see the record's `uncertainty`. */
  baseSide: number;
  baseHeight: number;
  towerDiameter: number;
  towerHeight: number;
  moleLength: number;
  moleWidth: number;
};

/** The quay's top: the level everything on the mole stands on. */
const QUAY = 0;
/** The sea, a little under the quay's edge. */
const SEA = -0.4;

export function lighthouseLayout(spec: LighthouseSpec) {
  const towerTop = spec.baseHeight + spec.towerHeight;
  // The mole runs inland (+x) from the lighthouse at its head.
  const moleStart = -spec.baseSide / 2 - 3;
  const moleEnd = moleStart + spec.moleLength;
  return { towerTop, moleStart, moleEnd, lantern: towerTop + 0.6 };
}

export function lighthouseParts(spec: LighthouseSpec): Part[] {
  const parts: Part[] = [];
  const L = lighthouseLayout(spec);
  const B = spec.baseSide;
  const hb = spec.baseHeight;
  const R = spec.towerDiameter / 2;
  const mw = spec.moleWidth;

  /* ---- the bay, the dunes and the hills of the Lycian shore ---- */
  parts.push(...setting(26, 6465, { hills: 1.3, stone: 0, grass: 0, ground: "limestone" }));
  parts.push(scenery(box("water", [0, -1.2, 0], [420, 1.2 + SEA, 420])));

  /* ---- the mole ---- */
  // Squared blocks from the sea bed to the quay, the lighthouse on its head.
  const mx = (L.moleStart + L.moleEnd) / 2;
  parts.push(box("limestone", [mx, -1, 0], [spec.moleLength, 1 + QUAY, mw]));
  for (const s of [-1, 1])
    parts.push(
      ...ashlar({
        at: [mx, -1, s * (mw / 2)],
        rotY: s > 0 ? FACING.north : FACING.south,
        length: spec.moleLength,
        height: 1 + QUAY,
        material: "limestone",
        foot: false,
        coping: false,
        course: 0.45,
        blocks: 1.4,
      }),
    );
  // The rounded head of the mole, out in the sea before the tower.
  parts.push(
    cyl("limestone", [L.moleStart, -1, 0], mw / 2, mw / 2, 1 + QUAY, 24, {
      thetaStart: Math.PI,
      thetaLength: Math.PI,
    }),
  );
  // Bollards along the harbour side, and steps down to the water.
  for (let i = 0; i < 6; i += 1)
    parts.push(
      cyl("stoneDark", [L.moleStart + 12 + i * 6, QUAY, mw / 2 - 0.5], 0.22, 0.26, 0.6, 10),
    );
  for (let i = 0; i < 3; i += 1)
    parts.push(
      box(
        "limestone",
        [L.moleEnd - 9, QUAY - 0.25 * (i + 1), mw / 2 + 0.3 + i * 0.32],
        [3.2, 0.25, 0.32],
      ),
    );
  // A warehouse at the landward end of the mole, for what the ships brought.
  parts.push(box("limestone", [L.moleEnd - 4, QUAY, -mw / 2 + 2.2], [7, 4.2, 4]));
  parts.push(box("terracotta", [L.moleEnd - 4, QUAY + 4.2, -mw / 2 + 2.2], [7.4, 0.2, 4.4]));
  parts.push(box("timber", [L.moleEnd - 4, QUAY, -mw / 2 + 4.21], [1.8, 2.6, 0.04]));

  /* ---- the base ---- */
  // Two steps round it, the square block, a cornice.
  parts.push(box("limestone", [0, QUAY, 0], [B + 1.2, 0.3, B + 1.2]));
  parts.push(box("limestone", [0, QUAY + 0.3, 0], [B + 0.6, 0.3, B + 0.6]));
  parts.push(box("limestone", [0, QUAY + 0.6, 0], [B, hb - 0.6, B]));
  for (const [rotY, x, z] of [
    [FACING.south, 0, -B / 2],
    [FACING.north, 0, B / 2],
    [FACING.east, B / 2, 0],
    [FACING.west, -B / 2, 0],
  ] as const) {
    parts.push(
      ...ashlar({
        at: [x, QUAY + 0.6, z],
        rotY,
        length: B,
        height: hb - 0.6,
        material: "limestone",
        foot: false,
        coping: false,
        course: 0.55,
        blocks: 1.25,
      }),
    );
  }
  parts.push(...cornice("limestone", [0, hb, 0], B, B, 0.45));
  /*
   * The dedication was set on the seaward face in bronze letters, pinned into
   * the stone; the letters are gone and only their dowel holes are left. The
   * text is not drawn here (see the record's `uncertainty`): the panel stands
   * empty, as its frame does today.
   */
  const panelY = hb * 0.38;
  parts.push(box("marbleWorn", [-B / 2 - 0.04, panelY, 0], [0.08, hb * 0.42, B * 0.78]));
  parts.push(
    box("stoneDark", [-B / 2 - 0.09, panelY + 0.12, 0], [0.02, hb * 0.42 - 0.24, B * 0.78 - 0.24]),
  );
  for (const s of [-1, 1])
    parts.push(
      box(
        "marbleWorn",
        [-B / 2 - 0.04, panelY + hb * 0.21 - 0.3, s * (B * 0.39 + 0.3)],
        [0.08, 0.6, 0.6],
      ),
    );

  /* ---- the stair to the door ---- */
  // Up the landward face: a flight against the base, its door in the tower.
  const flight = Math.round(hb / 0.24);
  for (let i = 0; i < flight; i += 1)
    parts.push(
      box(
        "limestone",
        [B / 2 + 0.6, QUAY, -B / 2 + 0.6 + i * 0.3 + 0.15],
        [1.2, 0.24 * (i + 1), 0.3],
      ),
    );

  /* ---- the tower ---- */
  const rise = spec.towerHeight;
  const bands = 3;
  for (let i = 0; i < bands; i += 1) {
    const y0 = hb + 0.45 + (rise * i) / bands;
    const h = rise / bands - 0.3;
    const r0 = R - i * 0.15;
    parts.push(worn(cyl("limestone", [0, y0, 0], r0, r0 - 0.15, h, 36), 0.025));
    // The bed joints of its courses, a line every half metre or so.
    for (let y = y0 + 0.55; y < y0 + h - 0.2; y += 0.55) {
      const r = r0 - (0.15 * (y - y0)) / h + 0.035;
      parts.push(cyl("stoneDark", [0, y, 0], r, r, 0.03, 36));
    }
    // A string course between the stages.
    parts.push(cyl("limestone", [0, y0 + h, 0], r0 - 0.05, r0 - 0.1, 0.3, 36));
  }
  // The door on the landward side, and slit windows lighting the stair inside.
  parts.push(box("shadow", [R - 0.02, hb + 0.45, 0], [0.12, 2.2, 1.1], 0));
  parts.push(...arch("limestone", [R + 0.05, hb + 0.45 + 2.2, 0], 0.55, 0.28, 0.5, 7, true));
  for (let i = 0; i < 5; i += 1) {
    const a = (i * 2.4) % (Math.PI * 2);
    const y = hb + 3 + (i * (rise - 4)) / 5;
    const r = R - 0.15 * Math.floor((i * bands) / 5) - 0.1;
    parts.push(
      box("shadow", [Math.cos(a) * r, y, Math.sin(a) * r], [0.14, 0.9, 0.24], Math.PI / 2 - a),
    );
  }
  /* ---- the lantern on top ---- */
  const top = L.towerTop + 0.45;
  const rt = R - 0.15 * bands;
  parts.push(cyl("limestone", [0, top, 0], rt + 0.35, rt, 0.4, 36));
  parts.push(cyl("limestone", [0, top + 0.4, 0], rt + 0.3, rt + 0.3, 0.2, 36));
  // A parapet round the fire, with openings for its light.
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI * 2 * i) / 12;
    parts.push(
      box(
        "limestone",
        [Math.cos(a) * (rt + 0.1), top + 0.6, Math.sin(a) * (rt + 0.1)],
        [0.35, 1.0, 0.7],
        Math.PI / 2 - a,
      ),
    );
  }
  // The hearth the fire burned on.
  parts.push(cyl("stoneDark", [0, top + 0.6, 0], 0.9, 1.0, 0.5, 18));
  parts.push(cyl("bronze", [0, top + 1.1, 0], 0.75, 0.6, 0.3, 18));
  return parts;
}

/** On the mole, a little landward of the tower, looking up at it. */
export function lighthouseWalkStart(spec: LighthouseSpec): WalkStart {
  return {
    at: [spec.baseSide / 2 + 9, -spec.moleWidth / 2 + 2],
    floor: QUAY,
    look: [0, spec.baseHeight + spec.towerHeight * 0.4, 0],
  };
}
