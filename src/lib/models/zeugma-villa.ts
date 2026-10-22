import { ashlar, FACING, tiledSlope } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitColumn as column,
  kitCyl as cyl,
  kitScenery as scenery,
  kitSetting as setting,
  kitWorn as worn,
  type Part,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import {
  chequer,
  broadleaf,
  frame,
  lozengeBand,
  meander,
  mosaicFloor,
  paintedWall,
  rosette,
  type Rect,
} from "@/lib/models/craft";

/**
 * A Roman town house of Zeugma on its terrace above the Euphrates: rooms
 * round a colonnaded court with a pool, the reception room at its head, and
 * every floor laid in mosaic. The type of the villas excavated before the
 * Birecik dam flooded the lower town — the House of Poseidon, the House of
 * Dionysos — not any one of them.
 */
export type TerraceVillaSpec = {
  kind: "terrace-villa";
  /** Modelled, all of it: see the record's `uncertainty`. */
  courtWidth: number;
  courtDepth: number;
  courtColumns: number;
  porticoWidth: number;
  wallHeight: number;
  roomDepth: number;
  terraceHeight: number;
  poolWidth: number;
};

const WALL = 0.6;

export function villaLayout(spec: TerraceVillaSpec) {
  const F = spec.terraceHeight;
  const cw = spec.courtWidth / 2;
  const cd = spec.courtDepth / 2;
  // The portico's back walls, and the outer shell of the house.
  const px = cw + spec.porticoWidth;
  const pz = cd + spec.porticoWidth;
  const ox = px + WALL + spec.roomDepth;
  const north = pz + WALL + spec.roomDepth * 1.1;
  const south = -(pz + WALL + spec.roomDepth * 0.9);
  // The terrace's edge before the house, and the river below.
  const edge = south - WALL - 5;
  return { F, cw, cd, px, pz, ox, north, south, edge };
}

export function villaParts(spec: TerraceVillaSpec): Part[] {
  const parts: Part[] = [];
  const L = villaLayout(spec);
  const { F, cw, cd, px, pz, ox, north, south, edge } = L;
  const H = spec.wallHeight;

  /* ---- the slope, the river and the terrace ---- */
  parts.push(...setting(30, 2531, { hills: 0.8, stone: 0.7, grass: 0.9, ground: "limestone" }));
  // The Euphrates, broad and slow, below the terrace.
  // Its surface lies a little under the plain; the landscape shelves its bed
  // down under it (see landscape-plan.ts), and a low bank carries the path.
  parts.push(scenery(box("water", [0, -2, edge - 76], [360, 1.7, 120])));
  parts.push(scenery(worn(box("ground", [0, -0.4, edge - 14.5], [360, 0.55, 3]), 0.2)));
  for (let i = 0; i < 24; i += 1) {
    const x = -70 + i * 6.2 + ((i * 37) % 5);
    parts.push(...broadleaf([x, 0, edge - 11.5 - ((i * 13) % 2)], 6 + ((i * 7) % 5)));
  }

  // The terrace the house stands on: a platform faced in ashlar towards the river.
  const tw = ox + WALL + 1.5;
  const mid = (north + WALL + edge) / 2;
  parts.push(box("limestone", [0, 0, mid], [tw * 2, F - 0.12, north + WALL - edge]));
  // Its paving, the top the house's own floors are flush with.
  parts.push(box("limestone", [0, F - 0.12, mid], [tw * 2, 0.12, north + WALL - edge]));
  parts.push(
    ...ashlar({
      at: [0, 0, edge],
      rotY: FACING.south,
      length: tw * 2,
      height: F,
      material: "limestone",
      blocks: 1.3,
      coping: false,
    }),
  );
  for (const s of [-1, 1])
    parts.push(
      ...ashlar({
        at: [s * tw, 0, (north + WALL + edge) / 2],
        rotY: s > 0 ? FACING.east : FACING.west,
        length: north + WALL - edge,
        height: F,
        material: "limestone",
        blocks: 1.3,
        coping: false,
      }),
    );
  // The stair down to the river path, against the terrace wall.
  const steps = Math.round(F / 0.2);
  for (let i = 0; i < steps; i += 1) {
    parts.push(
      box("limestone", [0, 0, edge - 0.32 * (steps - i) + 0.16], [2.6, 0.2 * (i + 1), 0.32]),
    );
  }
  // A parapet along the terrace edge, open at the stair.
  for (const s of [-1, 1])
    parts.push(box("limestone", [(s * (tw + 1.6)) / 2, F, edge + 0.2], [tw - 1.6, 0.9, 0.35]));

  /* ---- floors ---- */
  const floor = (r: Rect, pattern: (y: number) => Part[]) =>
    parts.push(...mosaicFloor(F, r, pattern));
  // The court: paved round the pool.
  floor({ x: 0, z: 0, w: cw * 2, d: cd * 2 }, (y) => [
    ...frame("stoneDark", y, { x: 0, z: 0, w: cw * 2, d: cd * 2 }, 0.25, 0.12),
  ]);
  // The four walks of the portico: a meander down the middle of each.
  const walk = spec.porticoWidth;
  for (const s of [-1, 1]) {
    const zr: Rect = { x: 0, z: s * (cd + walk / 2), w: px * 2, d: walk };
    floor(zr, (y) => [
      ...frame("paintRed", y, zr, 0.18, 0.1),
      ...meander("shadow", y, [-px + 0.9, zr.z], [px - 0.9, zr.z], 0.62),
    ]);
    const xr: Rect = { x: s * (cw + walk / 2), z: 0, w: walk, d: cd * 2 };
    floor(xr, (y) => [
      ...lozengeBand(["stoneDark", "paintRed"], y, [xr.x, -cd + 0.5], [xr.x, cd - 0.5], 0.7),
    ]);
  }

  // The reception room at the head of the court: couches stood on the plain
  // band round three sides, and the picture panel lay in the middle of it.
  const tri: Rect = {
    x: 0,
    z: pz + WALL + (north - pz - WALL) / 2,
    w: px * 2 - 2 * WALL - 4,
    d: north - pz - WALL,
  };
  floor(tri, (y) => {
    const out: Part[] = [];
    out.push(...frame("stoneDark", y, tri, 0.12, 0.12));
    // The panel itself: frames of black, red and gold round a meander.
    const panel: Rect = { x: 0, z: tri.z - 0.4, w: tri.w - 3.4, d: tri.d - 2.8 };
    out.push(...frame("shadow", y, panel, 0, 0.14));
    out.push(...frame("paintRed", y, panel, 0.24, 0.1));
    // Meanders closing the two ends, and three rosettes between them.
    for (const e of [-1, 1]) {
      const mx = panel.x + e * (panel.w / 2 - 0.62);
      out.push(
        ...meander(
          "shadow",
          y,
          [mx, panel.z - panel.d / 2 + 0.45],
          [mx, panel.z + panel.d / 2 - 0.45],
          0.5,
        ),
      );
      out.push(
        ...rosette("paintBlue", "paintRed", "paintGold", y, [panel.x + e * 2.55, panel.z], 0.85, 6),
      );
    }
    // In the middle, the largest, in a ring of lozenges: the app's own design.
    const r = panel.d / 2 - 0.62;
    out.push(...rosette("paintRed", "paintBlue", "paintGold", y, [panel.x, panel.z], r, 8));
    for (let i = 0; i < 16; i += 1) {
      const a = (Math.PI * 2 * i) / 16;
      out.push(
        box(
          i % 2 ? "stoneDark" : "fadedRed",
          [panel.x + Math.sin(a) * (r + 0.24), y, panel.z + Math.cos(a) * (r + 0.24)],
          [0.16, 0.012, 0.16],
          a + Math.PI / 4,
        ),
      );
    }
    // The threshold panel at the doorway: a band of lozenges.
    out.push(
      ...lozengeBand(
        ["paintRed", "stoneDark"],
        y,
        [-2.6, pz + WALL + 0.55],
        [2.6, pz + WALL + 0.55],
        0.6,
      ),
    );
    return out;
  });
  // The side rooms of the north wing: chequers and lozenge grids.
  for (const s of [-1, 1]) {
    const r: Rect = {
      x: s * (tri.w / 2 + WALL + (ox - tri.w / 2 - WALL) / 2),
      z: tri.z,
      w: ox - tri.w / 2 - WALL,
      d: tri.d,
    };
    floor(r, (y) => [
      ...frame("stoneDark", y, r, 0.15, 0.12),
      ...chequer(
        s > 0 ? "stoneDark" : "paintRed",
        y,
        { x: r.x, z: r.z, w: r.w - 1.0, d: r.d - 1.0 },
        0.42,
      ),
    ]);
  }
  // The rooms of the side wings, two to a side.
  const sideX = px + WALL + spec.roomDepth / 2;
  const half = cd + walk;
  for (const s of [-1, 1]) {
    for (const t of [-1, 1]) {
      const r: Rect = { x: s * sideX, z: t * (half / 2 + 0.15), w: spec.roomDepth, d: half - 0.3 };
      floor(r, (y) => {
        const out = [
          ...frame("stoneDark", y, r, 0.15, 0.1),
          ...frame("paintRed", y, r, 0.42, 0.08),
        ];
        if (t > 0)
          out.push(...rosette("stoneDark", "paintRed", "paintGold", y, [r.x, r.z], 1.9, 12));
        else
          for (let k = 0; k < 4; k += 1)
            out.push(
              ...lozengeBand(
                ["fadedBlue", "stoneDark"],
                y,
                [r.x - r.w / 2 + 1, r.z - 2.4 + k * 1.6],
                [r.x + r.w / 2 - 1, r.z - 2.4 + k * 1.6],
                0.55,
              ),
            );
        return out;
      });
    }
  }
  // The street range: a vestibule and plain floors of crushed brick.
  const sz = (south + (-pz - WALL)) / 2;
  const sd = -pz - WALL - south;
  parts.push(box("fadedRed", [0, F, sz], [ox * 2, 0.012, sd]));

  /* ---- walls ---- */
  /** A run of wall along x at depth z, from x0 to x1, with openings. */
  const wallX = (z: number, x0: number, x1: number, h: number, gaps: [number, number][] = []) => {
    let from = x0;
    for (const [g0, g1] of [...gaps, [x1, x1] as [number, number]]) {
      if (g0 - from > 0.05) parts.push(box("stone", [(from + g0) / 2, F, z], [g0 - from, h, WALL]));
      if (g1 < x1 && g1 > g0)
        parts.push(box("timber", [(g0 + g1) / 2, F + 2.7, z], [g1 - g0 + 0.3, 0.25, WALL * 0.9]));
      from = g1;
    }
  };
  const wallZ = (x: number, z0: number, z1: number, h: number, gaps: [number, number][] = []) => {
    let from = z0;
    for (const [g0, g1] of [...gaps, [z1, z1] as [number, number]]) {
      if (g0 - from > 0.05) parts.push(box("stone", [x, F, (from + g0) / 2], [WALL, h, g0 - from]));
      if (g1 < z1 && g1 > g0)
        parts.push(box("timber", [x, F + 2.7, (g0 + g1) / 2], [WALL * 0.9, 0.25, g1 - g0 + 0.3]));
      from = g1;
    }
  };
  const nz = pz + WALL / 2;
  const nOut = north + WALL / 2;
  const sIn = -pz - WALL / 2;
  const sOut = south - WALL / 2;
  const xIn = px + WALL / 2;
  const xOut = ox + WALL / 2;
  // Between the portico and the rooms: wide doors, the reception room's widest.
  const sideDoor = tri.w / 2 + WALL + (ox - tri.w / 2 - WALL) / 2;
  wallX(nz, -xOut, xOut, H, [
    [-sideDoor - 0.7, -sideDoor + 0.7],
    [-tri.w / 2 + 1.2, tri.w / 2 - 1.2],
    [sideDoor - 0.7, sideDoor + 0.7],
  ]);
  wallX(sIn, -xOut, xOut, H, [[-1.2, 1.2]]);
  wallX(nOut, -xOut - WALL / 2, xOut + WALL / 2, H);
  wallX(sOut, -xOut - WALL / 2, xOut + WALL / 2, H, [[-1.1, 1.1]]);
  for (const s of [-1, 1]) {
    wallZ(s * xIn, -pz, pz, H, [
      [-half / 2 - 0.6, -half / 2 + 0.8],
      [half / 2 - 0.8, half / 2 + 0.6],
    ]);
    wallZ(s * xOut, sOut + WALL / 2, nOut - WALL / 2, H);
    // The room partitions.
    wallZ(s * (tri.w / 2 + WALL / 2), nz + WALL / 2, nOut - WALL / 2, H);
    wallX(
      0,
      s > 0 ? xIn + WALL / 2 : -xOut + WALL / 2,
      s > 0 ? xOut - WALL / 2 : -xIn - WALL / 2,
      H,
    );
    wallZ(s * 2.2, sOut + WALL / 2, sIn - WALL / 2, H);
  }

  // Painted walls: inside the reception room and the side rooms, and the
  // portico's back walls facing the court.
  parts.push(
    ...paintedWall([0, F, nOut - WALL / 2], FACING.south, tri.w, H, "paintRed", "paintGold"),
  );
  for (const s of [-1, 1]) {
    parts.push(
      ...paintedWall(
        [s * (tri.w / 2), F, tri.z],
        s > 0 ? FACING.west : FACING.east,
        tri.d - 0.2,
        H,
        "paintRed",
        "paintGold",
      ),
    );
    parts.push(
      ...paintedWall(
        [s * (xOut - WALL / 2), F, half / 2 + 0.15],
        s > 0 ? FACING.west : FACING.east,
        half - 0.6,
        H,
        "paintBlue",
        "paintGold",
      ),
    );
    parts.push(
      ...paintedWall(
        [s * px, F, -half / 2 - 0.15],
        s > 0 ? FACING.west : FACING.east,
        half - 1.8,
        H,
        "paintGold",
        "paintRed",
      ),
    );
  }
  for (const [x0, x1] of [
    [-px, -1.2],
    [1.2, px],
  ] as const) {
    parts.push(
      ...paintedWall(
        [(x0 + x1) / 2, F, -pz],
        FACING.north,
        x1 - x0 - 0.2,
        H,
        "paintRed",
        "paintGold",
      ),
    );
  }

  /* ---- the court ---- */
  // The colonnade.
  const n = spec.courtColumns;
  const shaft = H * 0.84;
  const posts: [number, number][] = [];
  for (let i = 0; i < n; i += 1) {
    const x = -cw + (spec.courtWidth * i) / (n - 1);
    posts.push([x, -cd], [x, cd]);
  }
  const m = Math.max(2, Math.round((n * spec.courtDepth) / spec.courtWidth));
  for (let i = 1; i < m - 1; i += 1) {
    const z = -cd + (spec.courtDepth * i) / (m - 1);
    posts.push([-cw, z], [cw, z]);
  }
  for (const [x, z] of posts)
    parts.push(...column("limestone", [x, F, z], 0.44, shaft, "ionic", 0));
  // The beams over them, and the roofs of the walks, draining into the court.
  for (const s of [-1, 1]) {
    parts.push(box("limestone", [0, F + shaft, s * cd], [spec.courtWidth + 0.48, 0.36, 0.48]));
    parts.push(box("limestone", [s * cw, F + shaft, 0], [0.48, 0.36, spec.courtDepth + 0.48]));
  }
  const eave = F + shaft + 0.36;
  for (const s of [-1, 1]) {
    for (const [along, span] of [
      ["z", px * 2 + WALL],
      ["x", pz * 2 + WALL],
    ] as const) {
      const reach = along === "z" ? cd - 0.25 : cw - 0.25;
      parts.push(
        ...tiledSlope({
          eave: along === "z" ? [0, eave, s * reach] : [s * reach, eave, 0],
          rotY:
            along === "z"
              ? s > 0
                ? FACING.north
                : FACING.south
              : s > 0
                ? FACING.east
                : FACING.west,
          width: span,
          run: walk + 0.25,
          rise: H - shaft + 0.2,
          spacing: 0.45,
          cover: 0.06,
        }),
      );
    }
  }
  // The pool, and the statue of the sea god at its head.
  const pw = spec.poolWidth;
  const pd = pw * 0.5;
  for (const s of [-1, 1]) {
    parts.push(box("marble", [s * (pw / 2 + 0.12), F, 0], [0.24, 0.4, pd + 0.48]));
    parts.push(box("marble", [0, F, s * (pd / 2 + 0.12)], [pw, 0.4, 0.24]));
  }
  parts.push(box("stoneDark", [0, F + 0.02, 0], [pw, 0.06, pd]));
  parts.push(box("water", [0, F + 0.08, 0], [pw - 0.02, 0.22, pd - 0.02]));
  parts.push(box("marble", [0, F, pd / 2 + 0.75], [1.0, 0.7, 0.8]));
  parts.push({
    kind: "figure",
    material: "marble",
    at: [0, F + 0.7, pd / 2 + 0.75],
    height: 1.8,
    rotY: Math.PI,
    identity: {
      name: "Poseidon",
      sex: "male",
      bearded: true,
      hair: "curls",
      dress: "himation",
      right: "sceptre",
    },
    scan: { id: "neptune" },
  });
  // Planting beds in the court's corners.
  for (const [x, z] of [
    [-cw + 1.6, -cd + 1.4],
    [cw - 1.6, -cd + 1.4],
    [-cw + 1.6, cd - 1.4],
    [cw - 1.6, cd - 1.4],
  ] as const) {
    // A kerb round a bed of earth, the earth a little under its top.
    for (const k of [-1, 1]) {
      parts.push(box("stone", [x, F, z + k * 0.725], [2.0, 0.34, 0.15]));
      parts.push(box("stone", [x + k * 0.925, F, z], [0.15, 0.34, 1.3]));
    }
    parts.push(box("ground", [x, F, z], [1.7, 0.28, 1.3]));
  }

  /* ---- the street door ---- */
  parts.push(box("timber", [0, F, sOut - 0.06], [2.0, 2.9, 0.12]));
  parts.push(box("limestone", [0, F + 2.9, sOut - 0.1], [2.8, 0.4, 0.3]));
  // Windows high in the street front, for light without a view in.
  for (const x of [-ox + 2.5, -ox + 6.5, ox - 6.5, ox - 2.5])
    parts.push(box("shadow", [x, F + 2.9, sOut - WALL / 2 - 0.02], [0.7, 0.9, 0.04]));
  parts.push(cyl("terracotta", [ox - 1.0, F, south + 1.4], 0.35, 0.3, 1.0, 12));
  return parts;
}

/** In the portico at the court's south side, looking up the court to the reception room. */
export function villaWalkStart(spec: TerraceVillaSpec): WalkStart {
  const L = villaLayout(spec);
  return {
    at: [L.cw * 0.45, -L.cd - spec.porticoWidth / 2],
    floor: L.F,
    look: [0, L.F + 1.4, L.north - 2],
  };
}
