import {
  kitBox as box,
  kitColumn as column,
  kitCornice as cornice,
  kitCyl as cyl,
  kitPrism as prism,
  kitScenery as scenery,
  kitSeeded as seeded,
  kitSetting as setting,
  kitWorn as worn,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { ledgeAt, ledgeHeight, type RockFace } from "@/lib/models/rockface";
import { conifer } from "@/lib/models/craft";

/**
 * Rock tombs cut into a cliff over a river, their fronts carved as the fronts
 * of temples: two Ionic columns between antae, an architrave with a dentil
 * frieze, a pediment with palmette acroteria, and behind them a door into the
 * burial chamber. Modelled on the six tombs of the kings of Kaunos over the
 * Dalyan river (4th to 2nd century BC), seen as they were cut, from the
 * river bank opposite and from the boats on it.
 *
 * Model axes: the cliff runs along x; its face looks -z, over the river.
 */
export type RockTombsSpec = {
  kind: "rock-tombs";
  /** Cited. */
  tombs: number;
  columnsPerTomb: number;
  /** Modelled: see the record's `uncertainty`. */
  cliffHeight: number;
  facadeWidth: number;
  facadeHeight: number;
  /** How far in front of the cliff the river's near bank is. */
  bankDistance: number;
  riverWidth: number;
};

/** The cliff face's plane, and the river's two banks. */
export function tombsLayout(spec: RockTombsSpec) {
  const face = 0;
  const bank = face - spec.bankDistance;
  const far = bank - spec.riverWidth;
  // Each tomb: the middle of its front, the floor of its porch, how big (the
  // largest first; the others smaller, cut higher or lower on the cliff).
  const random = seeded(4417);
  const tombs: { x: number; y: number; scale: number }[] = [];
  const spread = spec.facadeWidth * 1.45;
  for (let i = 0; i < spec.tombs; i += 1) {
    const k = i - (spec.tombs - 1) / 2;
    const scale = i === Math.floor(spec.tombs / 2) ? 1 : 0.62 + random() * 0.3;
    tombs.push({ x: k * spread + (random() - 0.5) * 2, y: 6 + random() * 9 + (i % 2) * 4, scale });
  }
  return { face, bank, far, tombs };
}

export function rockTombParts(spec: RockTombsSpec): Part[] {
  const parts: Part[] = [];
  const L = tombsLayout(spec);
  const H = spec.cliffHeight;
  const span = spec.tombs * spec.facadeWidth * 1.45 + 60;

  parts.push(...setting(40, 4417, { hills: 1.6, stone: 0.8, grass: 1.0, ground: "limestone" }));

  /* ---- the cliff: one face of limestone in a run of blocks ---- */
  const ledges = [9, 17, 27, 36];
  const blocks = 8;
  const bw = span / blocks;
  for (let i = 0; i < blocks; i += 1) {
    const x0 = -span / 2 + i * bw;
    const mid = x0 + bw / 2;
    const top =
      H +
      Math.sin(mid / 13) * 5 +
      Math.sin(mid / 5.1) * 1.8 -
      Math.max(0, Math.abs(mid) - span * 0.3) * 0.5;
    const face: RockFace = {
      relief: 2.2,
      seed: 4417,
      ledges: ledges.filter((y) => y < top - 4),
      origin: [mid, 0],
      open: [[[0, top]], [[0, top]]],
      strata: 0.7,
      overhang: 0.25,
      scree: 0.08,
      leanBetween: [H * 0.7, H + 6],
    };
    parts.push({
      ...box("rock", [mid, 0, L.face + 2.4 + 22], [bw + 0.02, top, 44]),
      rock: face,
      decor: true,
    });
    // Pine and scrub on its ledges and along its crest.
    const rand = seeded(91 + i);
    face.ledges.forEach((_, k) => {
      for (let u = -bw / 2 + 1; u < bw / 2 - 1; u += 2.5 + rand() * 3) {
        if (!ledgeAt(face, k, u) || rand() < 0.4) continue;
        const y = ledgeHeight(face, k, u);
        const at: Vec3 = [mid + u, y - 0.8, L.face + 0.5];
        if (rand() < 0.3) parts.push(...conifer(at, 3 + rand() * 4));
        else parts.push(scenery(worn(cyl("foliage", at, 0.7, 0.25, 1.0, 6), 0.1)));
      }
    });
    for (let u = -bw / 2 + 2; u < bw / 2; u += 4 + rand() * 4)
      parts.push(...conifer([mid + u, top - 0.5, L.face + 5 + rand() * 6], 5 + rand() * 6));
  }

  /* ---- the tombs ---- */
  for (const t of L.tombs) parts.push(...tomb(spec, t.x, t.y, t.scale));
  // The path along the foot of the cliff (the tombs were reached by paths cut up the rock).
  parts.push(scenery(box("limestone", [0, -0.1, L.face - 2.5], [span, 0.12, 5])));
  /* ---- the river, its reeds, and the far bank ---- */
  const riverZ = (L.bank + L.far) / 2;
  parts.push(scenery(box("water", [0, -1.4, riverZ], [span * 3, 1.0, spec.riverWidth])));
  // The near bank between the path and the water: a strip of meadow.
  parts.push(
    scenery(box("ground", [0, -0.3, (L.bank + L.face - 5) / 2], [span, 0.3, L.face - 5 - L.bank])),
  );
  const rand = seeded(733);
  for (let i = 0; i < 140; i += 1) {
    const x = (rand() - 0.5) * span * 1.6;
    const z = rand() < 0.5 ? L.bank - rand() * 2.4 : L.far + rand() * 2.4;
    const h = 1.4 + rand() * 1.4;
    parts.push(scenery(cyl("grass", [x, -0.6, z], 0.03, 0.01, h, 4)));
  }
  // A jetty on the near bank where the boats come in.
  parts.push(scenery(box("timber", [8, -0.15, L.bank - 3.5], [2.2, 0.15, 7])));
  for (const dz of [-6.6, -3.5, -0.6])
    for (const dx of [-1, 1])
      parts.push(scenery(cyl("timber", [8 + dx, -1.4, L.bank + dz], 0.1, 0.1, 1.25, 6)));
  // The boats: one at the jetty, one out on the river.
  parts.push(...boat([10, -0.9, L.bank - 4.5], 0), ...boat([-24, -0.9, riverZ], 0.4));
  return parts;
}

/**
 * One tomb front, cut back into the rock: the recess it stands in, the two
 * Ionic columns between the antae, the architrave and dentil frieze, the
 * pediment with its acroteria, and the door into the chamber behind.
 */
function tomb(spec: RockTombsSpec, x: number, y: number, s: number): Part[] {
  const parts: Part[] = [];
  const W = spec.facadeWidth * s;
  const Hh = spec.facadeHeight * s;
  const colH = Hh * 0.56;
  const d = colH / 8.5;
  const z = -0.1;
  const back = z + W * 0.28;
  const pitch = W * 0.2;
  const entab = Hh * 0.17;
  const total = 0.5 + colH + entab + pitch;
  // The recess: the rock cut away round the front, a smooth frame either side and over it.
  for (const e of [-1, 1])
    parts.push(
      box("limestone", [x + e * (W / 2 + 0.6), y - 0.3, z + 1.0], [1.2, total + 0.9, 3.4]),
    );
  parts.push(box("limestone", [x, y + total + 0.1, z + 1.0], [W + 2.4, 0.9, 3.4]));
  parts.push(box("limestone", [x, y - 0.6, z - 0.6], [W + 2.4, 0.6, 2.2]));
  // The porch floor and the back wall with the doors.
  parts.push(box("limestone", [x, y, (z + back) / 2], [W, 0.5, back - z]));
  parts.push(box("limestone", [x, y + 0.5, back + 0.3], [W, colH + entab, 0.6]));
  parts.push(box("shadow", [x, y + 0.5, back - 0.01], [W * 0.26, colH * 0.62, 0.02]));
  parts.push(box("limestone", [x, y + 0.5 + colH * 0.62, back - 0.08], [W * 0.34, 0.25, 0.16]));
  for (const e of [-1, 1])
    parts.push(
      box("limestone", [x + e * W * 0.15, y + 0.5, back - 0.06], [0.16, colH * 0.62, 0.12]),
    );
  // Antae and columns.
  for (const e of [-1, 1])
    parts.push(
      box(
        "limestone",
        [x + e * (W / 2 - d * 0.6), y + 0.5, (z + back) / 2],
        [d * 1.2, colH, back - z],
      ),
    );
  const cols = spec.columnsPerTomb;
  for (let i = 0; i < cols; i += 1) {
    const cx = x - W / 2 + (W * (i + 1)) / (cols + 1);
    parts.push(...column("limestone", [cx, y + 0.5, z + d], d, colH, "ionic", 20));
  }
  // Architrave in three fasciae, the dentils, the cornice.
  const ey = y + 0.5 + colH;
  parts.push(box("limestone", [x, ey, (z + back) / 2], [W, entab * 0.45, back - z]));
  parts.push(box("limestone", [x, ey + entab * 0.15, z - 0.02], [W, entab * 0.15, 0.06]));
  parts.push(box("limestone", [x, ey + entab * 0.3, z - 0.04], [W, entab * 0.15, 0.08]));
  for (let u = -W / 2 + 0.12; u < W / 2; u += 0.26 * s + 0.08)
    parts.push(
      box("limestone", [x + u, ey + entab * 0.47, z - 0.08], [0.14 * s + 0.04, entab * 0.18, 0.16]),
    );
  parts.push(
    ...cornice(
      "limestone",
      [x, ey + entab * 0.65, (z + back) / 2 - 0.1],
      W + 0.3,
      back - z + 0.2,
      entab * 0.35,
    ),
  );
  // The pediment, and its acroteria shaped as palm leaves.
  const py = ey + entab;
  parts.push(prism("limestone", [x, py, (z + back) / 2], [W + 0.3, pitch, back - z + 0.2], 0));
  parts.push(box("shadow", [x, py + pitch * 0.12, z - 0.02], [W * 0.62, pitch * 0.42, 0.02]));
  for (const [ax, ay] of [
    [0, pitch],
    [-W / 2, 0],
    [W / 2, 0],
  ] as const) {
    parts.push(
      box("limestone", [x + ax, py + ay - 0.05, z + 0.1], [0.5 * s + 0.15, 0.9 * s + 0.2, 0.2]),
    );
  }
  return parts;
}

/** On the jetty at the foot of the cliff, looking up at the tombs. */
export function rockTombWalkStart(spec: RockTombsSpec): WalkStart {
  const L = tombsLayout(spec);
  return {
    at: [7.4, L.bank - 5.5],
    floor: 0,
    look: [0, spec.facadeHeight + 6, 0],
  };
}

/** A flat-bottomed river boat: a hull of planks, a thwart, an oar. */
function boat(at: Vec3, rotY: number) {
  const [x, y, z] = at;
  const c = Math.cos(rotY);
  const s = Math.sin(rotY);
  const p = (u: number, v: number): Vec3 => [x + u * c + v * s, y, z - u * s + v * c];
  return [
    box("timber", p(0, 0), [5.42, 0.12, 1.4], rotY),
    box("timber", p(0, 0.75), [5.5, 0.45, 0.08], rotY),
    box("timber", p(0, -0.75), [5.5, 0.45, 0.08], rotY),
    box("timber", p(2.75, 0), [0.08, 0.55, 1.62], rotY),
    box("timber", p(-2.75, 0), [0.08, 0.55, 1.62], rotY),
    box("timber", p(0.4, 0), [0.3, 0.32, 1.3], rotY),
    cyl("timber", p(-2.3, 0.9), 0.04, 0.04, 2.6, 6, { rotX: 1.2, rotY }),
  ].map((part) => ({ ...part, decor: true }));
}
