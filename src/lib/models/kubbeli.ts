import { ashlar, FACING } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitColumn as column,
  kitCornice as cornice,
  kitCyl as cyl,
  kitSetting as setting,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";

/**
 * A great domed hall: a central dome on four (or eight) piers, carried on a
 * ring of windows, buttressed by half-domes and smaller domes round it.
 *
 * `byzantine`: Hagia Sophia (537) — a shallow ribbed dome on a drum of
 * windows, half-domes east and west along the long axis, the massive
 * buttress towers north and south, and the atrium before the narthex.
 * `longitudinal`: Sinan's Süleymaniye (1550-57) — the same plan in cut stone,
 * a half-dome either side along the axis, galleries of small domes down the
 * flanks, a courtyard before it and four minarets at the courtyard corners.
 * `octagonal`: Sinan's Selimiye at Edirne (1568-74) — one dome on eight
 * piers, a half-dome in each corner of the square, four minarets at the
 * corners of the prayer hall.
 *
 * Model axes: the entrance looks -z; the apse or mihrab is at +z.
 */
export type DomedSpec = {
  kind: "domed-sanctuary";
  variant: "byzantine" | "longitudinal" | "octagonal";
  /** Cited, where the record says so. */
  domeDiameter: number;
  /** The height of the inside of the dome's crown above the floor. */
  domeHeight: number;
  hallWidth: number;
  hallLength: number;
  /** None on the church as Justinian built it. */
  minarets?: number;
  minaretHeight?: number;
  /** Balconies on each of the tallest minarets. */
  serefe?: number;
  courtWidth: number;
  courtLength: number;
  /** Modelled. */
  wallHeight: number;
  /** How far the dome rises above its springing, as a share of its radius. */
  rise: number;
  windows: number;
};

const LEAD: Material = "stoneDark";

/** The hall's own frame of reference, shared with its life. */
export function domedLayout(spec: DomedSpec) {
  const R = spec.domeDiameter / 2;
  const rise = R * spec.rise;
  const spring = spec.domeHeight - rise;
  const drum = spec.variant === "byzantine" ? 2.4 : 3.2;
  const base = spring - drum;
  const front = -spec.hallLength / 2;
  const back = spec.hallLength / 2;
  const courtFront = front - spec.courtLength;
  return { R, rise, spring, drum, base, front, back, courtFront };
}

/**
 * A dome as a stack of thin drums following its curve: `segments` round,
 * `rings` up. With `half` it is a half-dome, open towards the centre of the
 * hall along `facing` (0: opens towards -z, its body at +z).
 */
function dome(
  material: Material,
  at: Vec3,
  radius: number,
  rise: number,
  rings = 14,
  half?: number,
): Part[] {
  const parts: Part[] = [];
  for (let k = 0; k < rings; k += 1) {
    const a0 = (k / rings) * (Math.PI / 2);
    const a1 = ((k + 1) / rings) * (Math.PI / 2);
    const r0 = radius * Math.cos(a0);
    const r1 = Math.max(0.05, radius * Math.cos(a1));
    const y0 = rise * Math.sin(a0);
    const y1 = rise * Math.sin(a1);
    parts.push(
      cyl(material, [at[0], at[1] + y0, at[2]], r0, r1, Math.max(0.05, y1 - y0), 48, {
        ...(half !== undefined ? { thetaStart: half - Math.PI / 2, thetaLength: Math.PI } : {}),
      }),
    );
  }
  return parts;
}

/** A row of arched windows along a wall face: a dark opening and a moulded head. */
function windows(
  at: Vec3,
  rotY: number,
  length: number,
  count: number,
  w: number,
  h: number,
): Part[] {
  const parts: Part[] = [];
  const s = Math.sin(rotY);
  const c = Math.cos(rotY);
  for (let i = 0; i < count; i += 1) {
    const u = -length / 2 + (length * (i + 0.5)) / count;
    const x = at[0] + c * u + s * 0.02;
    const z = at[2] - s * u + c * 0.02;
    parts.push(box("shadow", [x, at[1], z], [w, h, 0.04], rotY));
    parts.push(
      cyl("shadow", [x, at[1] + h, z], w / 2, w / 2, 0.04, 12, {
        rotX: Math.PI / 2,
        rotY,
        thetaStart: -Math.PI / 2,
        thetaLength: Math.PI,
      }),
    );
  }
  return parts;
}

/** A minaret: a fluted shaft on a square base, its balconies, and a lead cone. */
function minaret(x: number, z: number, height: number, serefe: number, radius = 1.9): Part[] {
  const parts: Part[] = [];
  const baseH = Math.min(14, height * 0.2);
  parts.push(box("limestone", [x, 0, z], [radius * 2.6, baseH, radius * 2.6]));
  parts.push(cyl("limestone", [x, baseH, z], radius * 1.25, radius, 1.4, 12));
  const capH = height * 0.16;
  const shaftTop = height - capH;
  parts.push(
    cyl("limestone", [x, baseH + 1.4, z], radius, radius * 0.88, shaftTop - baseH - 1.4, 16),
  );
  for (let k = 0; k < serefe; k += 1) {
    const y = baseH + 1.4 + ((shaftTop - baseH - 1.4) * (k + 1)) / (serefe + 0.4);
    parts.push(cyl("limestone", [x, y - 0.9, z], radius * 0.9, radius * 1.55, 0.9, 16));
    parts.push(cyl("limestone", [x, y, z], radius * 1.6, radius * 1.6, 0.25, 16));
    // The balustrade round the balcony.
    parts.push(cyl("limestone", [x, y + 0.25, z], radius * 1.58, radius * 1.58, 1.0, 16, {}));
  }
  parts.push(cyl(LEAD, [x, shaftTop, z], radius * 0.95, 0.06, capH, 16));
  parts.push(cyl("bronze", [x, height, z], 0.06, 0.06, 1.4, 6));
  return parts;
}

export function domedParts(spec: DomedSpec): Part[] {
  const parts: Part[] = [];
  const L = domedLayout(spec);
  const W = spec.hallWidth;
  const D = spec.hallLength;
  const H = spec.wallHeight;
  const R = L.R;
  const byz = spec.variant === "byzantine";
  const wall: Material = byz ? "gialloAntico" : "limestone";
  const t = byz ? 3 : 2.6;

  parts.push(
    ...setting(Math.max(W, D) * 0.55, byz ? 537 : 1557, {
      hills: 0.5,
      stone: 0.15,
      grass: 0.4,
      ground: "limestone",
    }),
  );

  /* ---- the floor, and the outer walls with their rows of windows ---- */
  parts.push(box("marble", [0, -0.1, 0], [W - 0.3, 0.12, D - 0.3]));
  for (const s of [-1, 1]) {
    // The side walls.
    parts.push(box(wall, [s * (W / 2 - t / 2), 0, 0], [t, H, D]));
    parts.push(
      ...windows(
        [s * (W / 2 + 0.01), 3.2, 0],
        s > 0 ? FACING.east : FACING.west,
        D - 8,
        Math.round(D / 5),
        1.4,
        2.6,
      ),
    );
    parts.push(
      ...windows(
        [s * (W / 2 + 0.01), H * 0.55, 0],
        s > 0 ? FACING.east : FACING.west,
        D - 8,
        Math.round(D / 5),
        1.5,
        3.2,
      ),
    );
    // The end walls, the entrance with its doors at the front.
    const z = s * (D / 2 - t / 2);
    parts.push(box(wall, [0, 0, z], [W, H, t]));
    parts.push(
      ...windows(
        [0, H * 0.55, s * (D / 2 + 0.01)],
        s > 0 ? FACING.north : FACING.south,
        W - 8,
        Math.round(W / 5),
        1.5,
        3.2,
      ),
    );
  }
  for (const x of [-W / 4, 0, W / 4])
    parts.push(
      box("shadow", [x, 0, L.front - 0.02], [x === 0 ? 3.2 : 2.2, x === 0 ? 5.5 : 4.2, 0.04]),
    );
  if (!byz)
    for (const s of [-1, 1])
      parts.push(
        ...ashlar({
          at: [s * (W / 2), 0, 0],
          rotY: s > 0 ? FACING.east : FACING.west,
          length: D,
          height: H,
          material: "limestone",
          course: 0.55,
          blocks: 1.3,
          coping: false,
          foot: true,
        }),
      );
  parts.push(...cornice(wall, [0, H, 0], W + 0.6, D + 0.6, 0.7));

  /* ---- the piers, the great arches and the square the dome stands on ---- */
  const sq = spec.variant === "octagonal" ? R * 2 : R * 2;
  const pier = byz ? 7 : 5;
  const piers: [number, number][] =
    spec.variant === "octagonal"
      ? Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return [Math.sin(a) * (R + 1.2), Math.cos(a) * (R + 1.2)];
        })
      : [
          [-R - pier / 2, -R - pier / 2],
          [R + pier / 2, -R - pier / 2],
          [-R - pier / 2, R + pier / 2],
          [R + pier / 2, R + pier / 2],
        ];
  const pw = spec.variant === "octagonal" ? 3.2 : pier;
  // Up to the pendentive block over them, a little into it.
  for (const [x, z] of piers)
    parts.push(
      box(wall === "gialloAntico" ? "marbleWorn" : "limestone", [x, 0, z], [pw, L.base - 5.9, pw]),
    );
  // The square block under the drum: the pendentives and the crowns of the arches.
  const ring = sq + pw * 2;
  for (const s of [-1, 1]) {
    parts.push(box(wall, [s * (R + pw / 2), L.base - 6, 0], [pw, 6, ring + 0.3]));
    parts.push(box(wall, [0, L.base - 6, s * (R + pw / 2)], [ring + 0.3, 6, pw]));
  }
  // The roof over the rest of the hall, round the dome's square.
  const roofY = H + 0.7;
  const side = (W - ring) / 2;
  if (side > 0.5)
    for (const s of [-1, 1])
      parts.push(box(LEAD, [s * (ring / 2 + side / 2), roofY, 0], [side, 0.5, D]));

  /* ---- the drum of windows, and the dome ---- */
  parts.push(cyl(wall, [0, L.base, 0], R + 1.2, R + 1.0, L.drum, 48));
  const nWin = spec.windows;
  for (let i = 0; i < nWin; i += 1) {
    const a = (i / nWin) * Math.PI * 2;
    const r = R + 1.12;
    parts.push(
      box(
        "shadow",
        [Math.sin(a) * r, L.base + 0.5, Math.cos(a) * r],
        [Math.min(1.6, (2 * Math.PI * r) / nWin - 0.9), L.drum - 1.0, 0.1],
        a,
      ),
    );
    // A buttress between each pair, as the dome's ribs come down to them.
    if (byz) {
      const b = a + Math.PI / nWin;
      parts.push(
        box(
          wall,
          [Math.sin(b) * (r + 0.5), L.base, Math.cos(b) * (r + 0.5)],
          [0.8, L.drum + 0.6, 1.4],
          b,
        ),
      );
    }
  }
  parts.push(...dome(LEAD, [0, L.spring, 0], R + 1.0, L.rise + 0.6, 16));
  parts.push(cyl("bronze", [0, L.spring + L.rise + 0.55, 0], 0.25, 0.08, byz ? 1.8 : 3.6, 8));

  /* ---- what buttresses it ---- */
  if (spec.variant === "octagonal") {
    // A half-dome in each corner of the square, and four turrets over the piers.
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const r = R * 0.95;
      parts.push(
        ...dome(LEAD, [Math.sin(a) * r, L.base - 4, Math.cos(a) * r], R * 0.42, R * 0.4, 8, a),
      );
    }
    for (const [x, z] of piers)
      parts.push(
        cyl("limestone", [x, L.base - 1, z], 1.4, 1.1, 8, 8),
        cyl(LEAD, [x, L.base + 7, z], 1.3, 0.05, 2.6, 8),
      );
  } else {
    // The great half-domes front and back, each with its own smaller exedrae.
    for (const s of [-1, 1]) {
      const z = s * (R + pier / 2);
      // Each half-dome's crown comes up to the foot of the main dome's drum.
      const halfRise = R * (byz ? 0.6 : 0.85);
      const hy = L.base - halfRise;
      parts.push(...dome(LEAD, [0, hy, z], R, halfRise, 12, s > 0 ? 0 : Math.PI));
      for (const e of [-1, 1])
        parts.push(
          ...dome(
            LEAD,
            [e * R * 0.62, hy - R * 0.4, z + s * R * 0.62],
            R * 0.38,
            R * 0.36,
            8,
            s > 0 ? 0 : Math.PI,
          ),
        );
      // The wall the half-dome stands on, up from the roof.
      parts.push(box(wall, [0, H, z + s * R * 0.5], [R * 2, Math.max(0.5, hy - H), R]));
    }
    // The buttresses along the sides.
    for (const s of [-1, 1])
      for (const z of [-R - pier / 2, R + pier / 2]) {
        const bh = byz ? H + 8 : L.base - 2;
        parts.push(box(wall, [s * (W / 2 + (byz ? 4 : 1.2)), 0, z], [byz ? 9 : 3.4, bh, pier + 2]));
        parts.push(
          cyl(LEAD, [s * (W / 2 + (byz ? 4 : 1.2)), bh, z], byz ? 2 : 1.3, 0.1, byz ? 2.2 : 3, 8),
        );
      }
    if (!byz)
      // The galleries of small domes down the flanks.
      for (const s of [-1, 1])
        for (let k = 0; k < 5; k += 1) {
          const z = -D / 2 + 5 + k * ((D - 10) / 4);
          parts.push(...dome(LEAD, [s * (W / 2 - 4.5), roofY + 0.5, z], 3.2, 2.4, 6));
        }
  }

  /* ---- the forecourt: an atrium of porticoes, or Sinan's domed court ---- */
  if (spec.courtLength > 0) {
    const CW = spec.courtWidth;
    const zc = L.front - spec.courtLength / 2;
    parts.push(box("marble", [0, -0.1, zc], [CW, 0.12, spec.courtLength]));
    const bay = byz ? 4.2 : 5.2;
    const portico = (x0: number, z0: number, x1: number, z1: number, inward: [number, number]) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const n = Math.max(2, Math.round(len / bay));
      for (let i = 0; i <= n; i += 1) {
        const x = x0 + ((x1 - x0) * i) / n;
        const z = z0 + ((z1 - z0) * i) / n;
        parts.push(
          ...column(
            "marble",
            [x + inward[0] * 4.6, 0, z + inward[1] * 4.6],
            0.75,
            5.2,
            byz ? "composite" : "plain",
            0,
          ),
        );
        if (!byz && i < n)
          parts.push(
            ...dome(
              LEAD,
              [
                x + ((x1 - x0) / n) * 0.5 + inward[0] * 2.4,
                6.4,
                z + ((z1 - z0) / n) * 0.5 + inward[1] * 2.4,
              ],
              2.4,
              1.8,
              6,
            ),
          );
      }
      // The back wall, and the roof over the walk.
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;
      const rot = Math.atan2(x1 - x0, z1 - z0);
      parts.push(box(wall, [mx, 0, mz], [1.2, 7.2, len + 1.2], rot));
      parts.push(
        box(
          byz ? "terracotta" : "limestone",
          [mx + inward[0] * 2.6, 5.2, mz + inward[1] * 2.6],
          [5.4, 1.2, len],
          rot,
        ),
      );
    };
    const x0 = -CW / 2;
    const x1 = CW / 2;
    const zf = L.courtFront;
    portico(x0, zf, x0, L.front - 0.6, [1, 0]);
    portico(x1, zf, x1, L.front - 0.6, [-1, 0]);
    portico(x0, zf, x1, zf, [0, 1]);
    // The gate in the middle of the front, and the fountain in the middle of the court.
    parts.push(box(wall, [0, 0, zf - 0.5], [7, byz ? 9 : 12, 2.6]));
    parts.push(box("shadow", [0, 0, zf - 1.82], [3, 5, 0.04]));
    parts.push(cyl("marble", [0, 0, zc], 3.2, 3.2, 1.1, 8));
    if (!byz) {
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        parts.push(
          cyl("marble", [Math.sin(a) * 4.4, 0, zc + Math.cos(a) * 4.4], 0.22, 0.22, 4.2, 8),
        );
      }
      parts.push(cyl(LEAD, [0, 4.2, zc], 5.4, 0.2, 2.6, 16));
    } else parts.push(cyl("water", [0, 1.05, zc], 2.9, 2.9, 0.06, 24));
  }

  /* ---- the minarets ---- */
  if (spec.minarets && spec.minaretHeight) {
    const mh = spec.minaretHeight;
    const serefe = spec.serefe ?? 2;
    const where: [number, number][] =
      spec.variant === "octagonal"
        ? [
            [-W / 2 - 2.5, L.front - 2.5],
            [W / 2 + 2.5, L.front - 2.5],
            [-W / 2 - 2.5, L.back + 2.5],
            [W / 2 + 2.5, L.back + 2.5],
          ]
        : [
            [-W / 2 - 2.5, L.front - 2],
            [W / 2 + 2.5, L.front - 2],
            [-spec.courtWidth / 2 - 2.5, L.courtFront - 2],
            [spec.courtWidth / 2 + 2.5, L.courtFront - 2],
          ];
    where.slice(0, spec.minarets).forEach(([x, z], i) => {
      const tall = spec.variant === "octagonal" || i < 2;
      parts.push(...minaret(x, z, tall ? mh : mh * 0.8, tall ? serefe : 2));
    });
  }
  return parts;
}

/** In the court (or before the doors), looking at the front of the hall and up at its dome. */
export function domedWalkStart(spec: DomedSpec): WalkStart {
  const L = domedLayout(spec);
  const z = spec.courtLength > 0 ? L.courtFront + spec.courtLength * 0.3 : L.front - 14;
  return { at: [3.5, z], floor: 0, look: [0, L.spring * 0.7, L.front] };
}
