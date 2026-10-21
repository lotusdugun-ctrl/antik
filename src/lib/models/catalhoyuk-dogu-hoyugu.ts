import { ANIMAL_SHAPES } from "@/lib/reconstruction-parts";
import {
  kitBox as box,
  kitCyl as cyl,
  kitScenery as scenery,
  kitSeeded as seeded,
  kitSetting as setting,
  kitWorn as worn,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";

/**
 * A cluster of houses on the East Mound of Çatalhöyük.
 *
 * The town had no streets. The mud-brick houses were built wall against
 * wall, each with its own walls, and people walked across the flat roofs and
 * came down into their houses by a ladder through a hole in the roof, next
 * to the oven. Inside, the walls and floors were plastered white and
 * replastered again and again; raised platforms ran along the walls, the
 * dead were buried beneath them, the horns of wild bulls were set into the
 * walls and benches, and some walls were painted. Here and there a house
 * had fallen out of use and its space became an open yard where rubbish and
 * ash were thrown.
 *
 * Two houses are shown with their roofs off, so that the inside can be
 * seen; one of them keeps its roof beams.
 */
export type NeolithicTownSpec = {
  kind: "neolithic-town";
  /** Modelled: see the uncertainty note. */
  houses: number;
  roomWidth: number;
  roomDepth: number;
  storeDepth: number;
  wallHeight: number;
  wallThickness: number;
  platformHeight: number;
};

type House = {
  cx: number;
  cz: number;
  /** Outside size: x by z. */
  w: number;
  d: number;
  /** The level of the roof's top. */
  roof: number;
  /** Shown open: roof off, or roof off but its beams left. */
  open?: "full" | "beams";
};

/** The plan of the cluster, and where each house's roof hole is. */
export function townLayout(spec: NeolithicTownSpec) {
  const t = spec.wallThickness;
  const w = spec.roomWidth + 2 * t;
  const d = spec.roomDepth + spec.storeDepth + 3 * t;
  const gap = 0.18;
  const cells: [number, number, number, House["open"]?][] = [
    [-2, -1, 0],
    [-1, -1, 0.3],
    [0, -1, 0, "full"],
    [-2, 0, -0.3],
    [-1, 0, 0, "beams"],
    [0, 0, 0.3],
    [1, 0, 0],
    [-1, 1, -0.3],
    [0, 1, 0],
    [1, 1, 0.3],
    [-2, 1, 0],
  ];
  const houses: House[] = cells.slice(0, spec.houses).map(([i, j, dy, open]) => ({
    cx: i * (w + gap),
    cz: j * (d + gap),
    w,
    d,
    roof: spec.wallHeight + 0.25 + dy,
    ...(open ? { open } : {}),
  }));
  // The yards where houses once stood: east of the first row.
  const yard = { cx: 1 * (w + gap), cz: -1 * (d + gap), w, d };
  /** The roof hole of a house: its middle, near the south wall. */
  const hole = (h: House): [number, number] => [h.cx + 0.9, h.cz - h.d / 2 + t + 0.75];
  return { t, w, d, houses, yard, hole };
}

/** Thin plates of white plaster laid on the inside of the walls. */
function plaster(at: Vec3, size: Vec3, rotY = 0): Part {
  return box("terrazzo", at, size, rotY);
}

/** A ladder from the floor up through the roof hole, leaning south. */
function ladder(foot: Vec3, top: number, lean: number, material: Material = "timber"): Part[] {
  const parts: Part[] = [];
  const length = Math.hypot(top - foot[1], lean);
  const angle = Math.atan2(lean, top - foot[1]);
  for (const side of [-1, 1]) {
    parts.push({
      kind: "box",
      material,
      at: [foot[0] + side * 0.24, foot[1], foot[2]],
      size: [0.07, length, 0.07],
      rotY: 0,
      rotX: -angle,
    });
  }
  for (let y = 0.35; y < length - 0.2; y += 0.38) {
    const f = y / length;
    parts.push(
      box(
        material,
        [foot[0], foot[1] + (top - foot[1]) * f - 0.02, foot[2] - lean * f],
        [0.5, 0.045, 0.05],
      ),
    );
  }
  return parts;
}

/** A pair of horns of the wild bull, set in plaster, pointing out from a wall facing `+z`. */
function bucranium(at: Vec3, rotY: number): Part[] {
  const out = (x: number, z: number): Vec3 => [
    at[0] + x * Math.cos(rotY) + z * Math.sin(rotY),
    at[1],
    at[2] - x * Math.sin(rotY) + z * Math.cos(rotY),
  ];
  const parts: Part[] = [];
  // The plastered skull, modelled over the bone.
  parts.push(box("terrazzo", out(0, 0.09), [0.3, 0.42, 0.18], rotY));
  parts.push(box("terrazzo", out(0, 0.2), [0.18, 0.2, 0.08], rotY));
  for (const side of [-1, 1]) {
    // Each horn sweeps out and up in two pieces.
    const base = out(side * 0.13, 0.12);
    parts.push(
      cyl("linen", [base[0], at[1] + 0.32, base[2]], 0.06, 0.045, 0.32, 8, {
        rotX: Math.PI / 2 - 0.25,
        rotY: rotY + side * 1.25,
      }),
    );
    const tip = out(side * 0.42, 0.16);
    parts.push(
      cyl("linen", [tip[0], at[1] + 0.36, tip[2]], 0.045, 0.012, 0.32, 8, { rotX: 0.35, rotY }),
    );
  }
  return parts;
}

/** A painted silhouette on a plastered wall facing `rotY`. */
function painted(
  material: Material,
  at: Vec3,
  rotY: number,
  outline: [number, number][],
  scale: number,
): Part {
  return {
    kind: "carving",
    material,
    at,
    outline: outline.map(([u, v]) => [u * scale, v * scale]),
    depth: 0.006,
    sink: 0.2,
    rotY,
  };
}

/** A small hunter: legs apart, one arm raised with a weapon. */
const HUNTER: [number, number][] = [
  [-0.12, 0],
  [-0.05, 0.42],
  [0.05, 0.42],
  [0.12, 0],
  [0.16, 0],
  [0.07, 0.48],
  [0.06, 0.78],
  [0.22, 1.02],
  [0.18, 1.06],
  [0.04, 0.86],
  [0.05, 0.94],
  [0.0, 1.02],
  [-0.05, 0.94],
  [-0.06, 0.8],
  [-0.18, 0.62],
  [-0.15, 0.58],
  [-0.06, 0.72],
  [-0.07, 0.48],
  [-0.16, 0],
];

/** The inside of an open house: platforms, oven and hearth, ladder, horns, paintings. */
function interior(spec: NeolithicTownSpec, h: House, hole: [number, number], seed: number): Part[] {
  const parts: Part[] = [];
  const t = spec.wallThickness;
  const x0 = h.cx - h.w / 2 + t;
  const x1 = h.cx + h.w / 2 - t;
  const z0 = h.cz - h.d / 2 + t;
  const z1 = z0 + spec.roomDepth;
  const H = h.roof - 0.25;
  const random = seeded(seed);
  // Floor plaster, and the platforms along the north and east walls.
  parts.push(plaster([h.cx, 0, (z0 + z1) / 2], [x1 - x0, 0.04, z1 - z0]));
  const ph = spec.platformHeight;
  parts.push(plaster([(x0 + x1) / 2 - 0.4, 0, z1 - 0.8], [x1 - x0 - 0.8, ph, 1.6]));
  parts.push(plaster([x1 - 0.7, 0, (z0 + z1) / 2 + 0.6], [1.4, ph + 0.12, z1 - z0 - 2.8]));
  // A low kerb round the hearth in front of the oven.
  const [hx, hz] = hole;
  parts.push(box("terrazzo", [hx - 1.7, 0, z0 + 1.55], [0.85, 0.09, 0.85]));
  parts.push(box("shadow", [hx - 1.7, 0.09, z0 + 1.55], [0.6, 0.01, 0.6]));
  // The oven against the south wall, domed, its mouth facing north.
  parts.push(cyl("ground", [hx - 1.7, 0, z0 + 0.42], 0.5, 0.36, 0.55, 14));
  parts.push(cyl("ground", [hx - 1.7, 0.55, z0 + 0.42], 0.36, 0.08, 0.3, 14));
  parts.push(box("shadow", [hx - 1.7, 0.08, z0 + 0.86], [0.32, 0.26, 0.02]));
  // The ladder up through the hole in the roof.
  parts.push(...ladder([hx, 0.04, z0 + 1.6], H + 1.1, 1.0));
  // White plaster on the walls, and on it the paintings.
  parts.push(plaster([h.cx, 0.04, z1 - 0.02], [x1 - x0, H - 0.04, 0.04]));
  parts.push(plaster([x1 - 0.02, 0.04, (z0 + z1) / 2], [0.04, H - 0.04, z1 - z0]));
  parts.push(plaster([x0 + 0.02, 0.04, (z0 + z1) / 2], [0.04, H - 0.04, z1 - z0]));
  parts.push(plaster([h.cx, 0.04, z0 + 0.02], [x1 - x0, H - 0.04, 0.04]));
  // A geometric panel in red on the north wall above the platform.
  const north = z1 - 0.045;
  for (let i = 0; i < 9; i += 1) {
    for (let r = 0; r < 3; r += 1) {
      if ((i + r) % 2) continue;
      parts.push(
        box(
          r === 1 ? "paintRed" : "fadedRed",
          [h.cx - 1.6 + i * 0.36, ph + 0.5 + r * 0.32, north],
          [0.3, 0.26, 0.008],
          Math.PI,
        ),
      );
    }
  }
  parts.push(box("paintRed", [h.cx - 0.04, ph + 0.42, north], [3.4, 0.05, 0.008], Math.PI));
  parts.push(box("paintRed", [h.cx - 0.04, ph + 1.5, north], [3.4, 0.05, 0.008], Math.PI));
  // On the west wall a hunt: a great bull among small running men.
  const west = x0 + 0.045;
  const face = Math.PI / 2;
  parts.push(
    painted("paintRed", [west, 1.0, (z0 + z1) / 2 - 0.2], face, ANIMAL_SHAPES.aurochs.outline, 1.5),
  );
  for (let k = 0; k < 6; k += 1) {
    const z = z0 + 0.5 + k * 0.7 + (random() - 0.5) * 0.2;
    const y = k % 2 ? 0.85 : 2.0;
    parts.push(painted(k % 3 ? "letteringDark" : "paintRed", [west, y, z], face, HUNTER, 0.36));
  }
  // The horns: one pair high on the east wall, two set in the platform edge.
  parts.push(...bucranium([x1 - 0.04, 1.55, (z0 + z1) / 2 - 0.3], -Math.PI / 2));
  for (const z of [z1 - 1.0, (z0 + z1) / 2 - 0.4])
    parts.push(...bucranium([x1 - 1.45, ph + 0.12, z], -Math.PI / 2));
  // A post set in the wall, plastered over.
  parts.push(box("terrazzo", [x0 + 0.14, 0, z1 - 0.14], [0.24, H, 0.24]));
  // The store room behind, through a low hole in the wall.
  parts.push(box("shadow", [h.cx - 1, 0.05, z1 + t / 2], [0.7, 0.75, t + 0.1]));
  return parts;
}

export function neolithicTownParts(spec: NeolithicTownSpec): Part[] {
  const L = townLayout(spec);
  const { t } = L;
  const parts: Part[] = [];
  L.houses.forEach((h, k) => {
    const H = h.roof - 0.25;
    const x0 = h.cx - h.w / 2;
    const x1 = h.cx + h.w / 2;
    const z0 = h.cz - h.d / 2;
    const z1 = h.cz + h.d / 2;
    // Each house its own four walls, and a cross wall to the store room.
    parts.push(box("ground", [h.cx, 0, z0 + t / 2], [h.w, H, t]));
    parts.push(box("ground", [h.cx, 0, z1 - t / 2], [h.w, H, t]));
    parts.push(box("ground", [x0 + t / 2, 0, h.cz], [t, H, h.d - 2 * t]));
    parts.push(box("ground", [x1 - t / 2, 0, h.cz], [t, H, h.d - 2 * t]));
    const cross = z0 + t + spec.roomDepth;
    parts.push(box("ground", [h.cx, 0, cross + t / 2], [h.w - 2 * t, H, t]));
    const hole = L.hole(h);
    if (h.open) {
      parts.push(...interior(spec, h, hole, 300 + k));
      if (h.open === "beams") {
        for (let x = x0 + 0.6; x < x1 - 0.3; x += 0.55)
          parts.push(box("timber", [x, H - 0.16, h.cz], [0.14, 0.16, h.d - 0.1]));
      }
      // The store room keeps its roof.
      parts.push(box("ground", [h.cx, H, (cross + z1) / 2], [h.w, 0.25, z1 - cross]));
      return;
    }
    // The roof: earth on reeds on beams, in four pieces round the hole.
    const [hx, hz] = hole;
    const hw = 0.5;
    const hd = 0.6;
    parts.push(box("ground", [h.cx, H, (hz + hd + z1) / 2], [h.w, 0.25, z1 - hz - hd]));
    parts.push(box("ground", [h.cx, H, (z0 + hz - hd) / 2], [h.w, 0.25, hz - hd - z0]));
    parts.push(box("ground", [(x0 + hx - hw) / 2, H, hz], [hx - hw - x0, 0.25, 2 * hd]));
    parts.push(box("ground", [(hx + hw + x1) / 2, H, hz], [x1 - hx - hw, 0.25, 2 * hd]));
    parts.push(box("shadow", [hx, H + 0.01, hz], [2 * hw, 0.01, 2 * hd]));
    // The top of the ladder standing out of the hole.
    parts.push(...ladder([hx, H - 1.4, hz + 0.25], H + 1.05, 0.55));
    // A low kerb of mud round the hole, against the rain.
    parts.push(box("ground", [hx, h.roof, hz - hd - 0.06], [2 * hw + 0.24, 0.1, 0.12]));
    parts.push(box("ground", [hx, h.roof, hz + hd + 0.06], [2 * hw + 0.24, 0.1, 0.12]));
  });
  // The yard: trodden ash and rubbish where a house had been.
  const y = L.yard;
  parts.push(box("stone", [y.cx, 0, y.cz], [y.w - 0.6, 0.12, y.d - 0.6]));
  const random = seeded(51);
  for (let i = 0; i < 18; i += 1) {
    parts.push(
      scenery(
        worn(
          box(
            random() < 0.5 ? "stoneDark" : "ground",
            [y.cx + (random() - 0.5) * (y.w - 1.6), 0.12, y.cz + (random() - 0.5) * (y.d - 1.6)],
            [0.3 + random() * 0.6, 0.08 + random() * 0.2, 0.3 + random() * 0.5],
            random() * 6,
          ),
          0.04,
        ),
      ),
    );
  }
  // The mound falls away beyond the houses, and the plain runs flat to the hills.
  parts.push(...setting(26, 7071, { stone: 0.05, grass: 1.3, hills: 0.5, ground: "ground" }));
  return parts;
}

/** On a roof beside the open house, looking down into it. */
export function neolithicTownWalkStart(spec: NeolithicTownSpec): WalkStart {
  const L = townLayout(spec);
  const from = L.houses[1]!;
  const open = L.houses[2]!;
  return {
    at: [from.cx + 0.6, from.cz + 1.6],
    floor: from.roof,
    look: [open.cx + 1.5, 0.8, open.cz + 0.5],
  };
}
