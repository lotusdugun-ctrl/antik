import { ashlar, FACING } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitCyl as cyl,
  kitScenery as scenery,
  kitSetting as setting,
  kitWorn as worn,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";

/* ================================================================== *
 * The Galata Tower
 * ================================================================== */

/**
 * A round stone tower with a conical cap: the Galata Tower, raised by the
 * Genoese in 1348 as the crown of their colony's walls. A shaft of rubble
 * stone four metres thick, slit windows up it, a gallery round the top under
 * the arched windows of the upper floors, and the lead cone over them.
 *
 * Model axes: the door looks -z, onto the little square at its foot.
 */
export type TowerSpec = {
  kind: "round-tower";
  /** Cited. */
  height: number;
  outerDiameter: number;
  innerDiameter: number;
  wallThickness: number;
  galleryHeight: number;
  /** Modelled. */
  capHeight: number;
};

export function towerParts(spec: TowerSpec): Part[] {
  const parts: Part[] = [];
  const R = spec.outerDiameter / 2;
  const gy = spec.galleryHeight;
  const capBase = spec.height - spec.capHeight;

  parts.push(...setting(22, 1348, { hills: 0.4, stone: 0.1, grass: 0.2, ground: "limestone" }));
  // The square at its foot, paved, and the houses of Galata round it.
  parts.push(box("limestone", [0, -0.1, 0], [44, 0.12, 44]));
  const random = (() => {
    let s = 1348;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  })();
  for (let i = 0; i < 14; i += 1) {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    if (Math.abs(Math.sin(a)) < 0.25 && Math.cos(a) < 0) continue; // the street to the door
    const r = 19 + random() * 4;
    const w = 7 + random() * 4;
    const h = 9 + random() * 7;
    const at: Vec3 = [Math.sin(a) * r, 0, Math.cos(a) * r];
    parts.push(box("limestone", at, [w, h, 8], a));
    parts.push(
      cyl("terracotta", [at[0], h, at[2]], w * 0.72, 0.1, 2.2, 4, { rotY: a + Math.PI / 4 }),
    );
    for (const fy of [3, 6.2])
      parts.push(
        box(
          "shadow",
          [at[0] - Math.sin(a) * 4.02, fy, at[2] - Math.cos(a) * 4.02],
          [1.1, 1.6, 0.04],
          a,
        ),
      );
  }

  /* ---- the shaft ---- */
  // A battered foot, then the shaft in stages, each a little narrower.
  parts.push(worn(cyl("limestone", [0, 0, 0], R + 0.6, R, 4, 40), 0.03));
  const stages = 4;
  const shaftTop = gy - 2.2;
  for (let k = 0; k < stages; k += 1) {
    const y0 = 4 + ((shaftTop - 4) * k) / stages;
    const h = (shaftTop - 4) / stages;
    const r0 = R - k * 0.08;
    parts.push(worn(cyl("stone", [0, y0, 0], r0, r0 - 0.08, h, 40), 0.04));
    parts.push(cyl("limestone", [0, y0 + h - 0.25, 0], r0 + 0.05, r0 + 0.05, 0.25, 40));
  }
  // The door, and the slit windows lighting the stair, round and up the shaft.
  parts.push(box("shadow", [0, 0.4, -R - 0.55], [1.6, 3.4, 0.06]));
  parts.push(box("limestone", [0, 3.8, -R - 0.6], [2.4, 0.5, 0.2]));
  for (let i = 0; i < 18; i += 1) {
    const a = i * 2.39996;
    const y = 7 + ((shaftTop - 10) * i) / 18;
    const r = R - 0.06 * Math.floor((i * stages) / 18) + 0.01;
    parts.push(box("shadow", [Math.sin(a) * r, y, Math.cos(a) * r], [0.35, 1.6, 0.06], a));
  }

  /* ---- the gallery on its corbels, and the upper floors ---- */
  for (let i = 0; i < 32; i += 1) {
    const a = (i / 32) * Math.PI * 2;
    parts.push(
      box(
        "limestone",
        [Math.sin(a) * (R + 0.3), shaftTop, Math.cos(a) * (R + 0.3)],
        [0.5, 2.2, 0.9],
        a,
      ),
    );
  }
  parts.push(cyl("limestone", [0, gy - 0.3, 0], R + 1.3, R + 1.3, 0.3, 48));
  // The railing round the gallery.
  for (let i = 0; i < 48; i += 1) {
    const a = (i / 48) * Math.PI * 2;
    parts.push(
      cyl("bronze", [Math.sin(a) * (R + 1.2), gy, Math.cos(a) * (R + 1.2)], 0.04, 0.04, 1.1, 4),
    );
  }
  parts.push(cyl("bronze", [0, gy + 1.1, 0], R + 1.22, R + 1.22, 0.06, 48));
  // The upper drum, set back, with its ring of arched windows.
  const ur = R - 0.9;
  parts.push(cyl("stone", [0, gy, 0], ur, ur, capBase - gy, 40));
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2;
    for (const y of [gy + 1.2, gy + 5.2]) {
      parts.push(
        box(
          "shadow",
          [Math.sin(a) * (ur + 0.01), y, Math.cos(a) * (ur + 0.01)],
          [1.0, 2.6, 0.05],
          a,
        ),
      );
      parts.push(
        box(
          "limestone",
          [Math.sin(a) * (ur + 0.05), y + 2.6, Math.cos(a) * (ur + 0.05)],
          [1.3, 0.25, 0.12],
          a,
        ),
      );
    }
  }
  parts.push(cyl("limestone", [0, capBase - 0.5, 0], ur + 0.4, ur + 0.4, 0.5, 40));

  /* ---- the cap ---- */
  parts.push(cyl("stoneDark", [0, capBase, 0], ur + 0.5, 0.15, spec.capHeight - 1.6, 40));
  parts.push(cyl("bronze", [0, spec.height - 1.6, 0], 0.12, 0.04, 1.6, 8));
  return parts;
}

export function towerWalkStart(spec: TowerSpec): WalkStart {
  return {
    at: [2, -spec.outerDiameter / 2 - 9],
    floor: 0,
    look: [0, spec.height * 0.55, 0],
  };
}

/* ================================================================== *
 * The Basilica Cistern
 * ================================================================== */

/**
 * The Basilica Cistern: a hall under the city held up by rows of columns
 * carrying brick cross-vaults, its floor under water. Shown cut open: the
 * street over it and most of its vaults are left off, so that the forest of
 * columns, the water and the walkways through it can be seen from above;
 * a strip of the vaults along one side is kept to show how it was roofed.
 *
 * Model axes: the long side runs along x.
 */
export type CisternSpec = {
  kind: "cistern";
  /** Cited. */
  length: number;
  width: number;
  rows: number;
  columnsPerRow: number;
  columnHeight: number;
  wallThickness: number;
  /** Modelled. */
  waterDepth: number;
  vaultRows: number;
};

export function cisternLayout(spec: CisternSpec) {
  const sx = spec.length / spec.columnsPerRow;
  const sz = spec.width / spec.rows;
  const floor = 0;
  const water = floor + spec.waterDepth;
  const walk = water + 0.5;
  return { sx, sz, floor, water, walk };
}

export function cisternParts(spec: CisternSpec): Part[] {
  const parts: Part[] = [];
  const L = cisternLayout(spec);
  const Lx = spec.length;
  const Wz = spec.width;
  const H = spec.columnHeight;
  const t = spec.wallThickness;

  // The hall stands at the level of the ground round it (it is drawn as dug
  // into a terrace): the ground runs up to the top of its walls.
  parts.push(
    ...setting(Lx * 0.55, 532, { hills: 0.3, stone: 0.1, grass: 0.2, ground: "limestone" }),
  );

  /* ---- the walls, the floor and the water ---- */
  parts.push(box("terracotta", [0, -0.3, 0], [Lx + 2 * t, 0.3, Wz + 2 * t]));
  for (const s of [-1, 1]) {
    parts.push(box("terracotta", [0, 0, s * (Wz / 2 + t / 2)], [Lx + 2 * t, H + 3, t]));
    parts.push(box("terracotta", [s * (Lx / 2 + t / 2), 0, 0], [t, H + 3, Wz]));
    parts.push(
      ...ashlar({
        at: [0, 0, s * (Wz / 2)],
        rotY: s > 0 ? FACING.south : FACING.north,
        length: Lx,
        height: H + 3,
        material: "terracotta",
        course: 0.35,
        blocks: 0.6,
        coping: false,
        foot: false,
      }),
    );
  }
  parts.push(box("water", [0, 0, 0], [Lx, spec.waterDepth, Wz]));

  /* ---- the columns ---- */
  const random = (() => {
    let s = 336;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  })();
  for (let i = 0; i < spec.columnsPerRow; i += 1)
    for (let k = 0; k < spec.rows; k += 1) {
      const x = -Lx / 2 + L.sx * (i + 0.5);
      const z = -Wz / 2 + L.sz * (k + 0.5);
      // Spolia: columns of every kind, Ionic, Corinthian, plain.
      const r = random();
      const tear = i === 3 && k === 1;
      // A plain shaft and a block capital each: 336 full columns are more
      // than the scene can carry, and down here they are seen in the dark.
      const m = r < 0.25 ? "marbleWorn" : r < 0.35 ? "granite" : "marble";
      parts.push(cyl(m, [x, 0, z], 0.36, 0.31, H - 0.9, 12, tear ? { flutes: 24 } : {}));
      parts.push(box("marble", [x, H - 0.9, z], [0.85, 0.5, 0.85]));
    }
  // The two Medusa heads under columns in the far corner, one on its side, one upside down.
  for (const [x, z, rot] of [
    [-Lx / 2 + L.sx * 0.5, Wz / 2 - L.sz * 0.5, Math.PI / 2],
    [-Lx / 2 + L.sx * 1.5, Wz / 2 - L.sz * 0.5, Math.PI],
  ] as const) {
    parts.push(box("marble", [x, 0, z], [1.5, 1.4, 1.5]));
    parts.push({
      kind: "figure",
      material: "marble",
      at: [x, 1.4 - (rot === Math.PI ? 1.4 : 0.2), z - 0.76],
      height: 1.0,
      rotY: Math.PI,
      scan: { id: "didyma-medusa" },
    });
  }

  /* ---- the vaults: kept over a strip along the north wall ---- */
  for (let i = 0; i < spec.columnsPerRow; i += 1)
    for (let k = spec.rows - spec.vaultRows; k < spec.rows; k += 1) {
      const x = -Lx / 2 + L.sx * (i + 0.5);
      const z = -Wz / 2 + L.sz * (k + 0.5);
      // Two crossing brick barrels over each bay.
      parts.push(
        cyl("terracotta", [x, H, z], L.sx / 2, L.sx / 2, L.sz, 12, {
          rotX: Math.PI / 2,
          thetaStart: -Math.PI / 2,
          thetaLength: Math.PI,
        }),
      );
      parts.push(
        cyl("terracotta", [x, H, z], L.sz / 2, L.sz / 2, L.sx, 12, {
          rotX: Math.PI / 2,
          rotY: Math.PI / 2,
          thetaStart: -Math.PI / 2,
          thetaLength: Math.PI,
        }),
      );
    }
  // Over the rest, where the vaults are cut away, only the springing of
  // their arches is left on each capital, as stubs either way.
  for (let i = 0; i < spec.columnsPerRow; i += 1)
    for (let k = 0; k < spec.rows - spec.vaultRows; k += 1) {
      const x = -Lx / 2 + L.sx * (i + 0.5);
      const z = -Wz / 2 + L.sz * (k + 0.5);
      parts.push(box("terracotta", [x, H - 0.4, z], [L.sx * 0.45, 0.6, 0.6]));
      parts.push(box("terracotta", [x, H - 0.4, z], [0.6, 0.6, L.sz * 0.45]));
    }

  /* ---- the walkways on piles over the water ---- */
  const wz = [-L.sz * 2, L.sz * 1];
  for (const z of wz) {
    parts.push(box("timber", [0, L.walk - 0.12, z], [Lx - 2, 0.12, 2.2]));
    for (let x = -Lx / 2 + 2; x < Lx / 2 - 1; x += 3)
      for (const e of [-1, 1])
        parts.push(cyl("timber", [x, 0, z + e * 1.0], 0.07, 0.07, L.walk - 0.12, 6));
    // The handrails.
    for (const e of [-1, 1])
      parts.push(box("timber", [0, L.walk + 0.9, z + e * 1.08], [Lx - 2, 0.06, 0.06]));
  }
  // A cross walk joining them at the west end, and the stair down from the street.
  parts.push(
    box(
      "timber",
      [-Lx / 2 + 4, L.walk - 0.12, (wz[0]! + wz[1]!) / 2],
      [2.2, 0.12, wz[1]! - wz[0]! + 2.2],
    ),
  );
  const n = Math.ceil((H + 3 - L.walk) / 0.22);
  for (let i = 0; i < n; i += 1)
    parts.push(
      box(
        "limestone",
        [-Lx / 2 + 1.5, L.walk + i * 0.22, -Wz / 2 + 1.5 + i * 0.3],
        [2.6, 0.22, 0.32],
      ),
    );
  // The street level over it, where the walls stop.
  parts.push(scenery(box("limestone", [0, H + 3, -Wz / 2 - t - 6], [Lx + 2 * t + 12, 0.2, 12])));
  return parts;
}

export function cisternWalkStart(spec: CisternSpec): WalkStart {
  const L = cisternLayout(spec);
  return {
    at: [-spec.length / 2 + 9.5, -L.sz * 2],
    floor: L.walk,
    look: [0, spec.columnHeight * 0.4, 0],
  };
}
