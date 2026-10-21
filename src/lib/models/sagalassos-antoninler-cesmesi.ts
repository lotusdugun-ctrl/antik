import { ashlar, FACING } from "@/lib/reconstruction-detail";
import {
  kitBox as box,
  kitColumn as column,
  kitCornice as cornice,
  kitCyl as cyl,
  kitPrism as prism,
  kitRing as ring,
  kitScenery as scenery,
  kitSetting as setting,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { segmentPediment } from "@/lib/models/craft";
import type { ScanId } from "@/lib/scans";

/**
 * A Roman monumental fountain: a long basin before a wall of columned
 * aediculae, the statues in their niches, the water falling from spouts in
 * the podium into the basin. Modelled on the Antonine Nymphaeum on the north
 * side of the Upper Agora at Sagalassos, re-erected and running again.
 */
export type NymphaeumSpec = {
  kind: "nymphaeum";
  /** Cited. */
  facadeLength: number;
  facadeHeight: number;
  /** Modelled: how the façade divides, and how deep the basin runs. */
  aediculae: number;
  basinDepth: number;
  podiumHeight: number;
  columnDiameter: number;
  columnHeight: number;
  apseWidth: number;
};

/** The statues in the niches, as the scans that stand in for them. */
const NICHE_STATUES: ScanId[] = ["muse-thalia", "ephesus-portrait", "muse-polyhymnia", "caryatid"];

export function nymphaeumLayout(spec: NymphaeumSpec) {
  const half = spec.facadeLength / 2;
  const entablature = 0.8;
  const top = spec.podiumHeight + spec.columnHeight + entablature;
  // The basin's front parapet, and the depth the aedicula pedestals stand out.
  const front = -spec.basinDepth - 0.4;
  const pedestal = 1.1;
  // Aedicula centres along each wing, outward from the middle.
  const wing = half - spec.apseWidth / 2 - 1.2;
  const perSide = Math.max(1, Math.floor(spec.aediculae / 2));
  const centres: number[] = [];
  for (let i = 0; i < perSide; i += 1) {
    centres.push(spec.apseWidth / 2 + 1.2 + (wing * (i + 0.5)) / perSide);
  }
  return { half, entablature, top, front, pedestal, centres, waterTop: 0.72 };
}

export function nymphaeumParts(spec: NymphaeumSpec): Part[] {
  const parts: Part[] = [];
  const L = nymphaeumLayout(spec);
  const { half, top, front } = L;
  const P = spec.podiumHeight;
  const d = spec.columnDiameter;
  const wallDepth = 1.4;
  const apseR = spec.apseWidth / 2;

  /* ---- the agora round it ---- */
  parts.push(...setting(24, 1452, { hills: 1.7, stone: 1.1, grass: 0.8, ground: "limestone" }));
  // The paving of the Upper Agora, its joints drawn in a darker stone.
  parts.push(scenery(box("limestone", [0, -0.14, -14], [64, 0.14, 40])));
  for (let i = -26; i <= 26; i += 1)
    parts.push(scenery(box("stoneDark", [i * 1.2, 0, -14], [0.025, 0.006, 40])));
  for (let k = 0; k < 18; k += 1)
    parts.push(scenery(box("stoneDark", [0, 0, front - 1 - k * 2.1], [64, 0.006, 0.025])));

  /* ---- the basin ---- */
  // Its floor, the water in it, the parapet in front and the returns at the ends.
  parts.push(box("limestone", [0, 0, front / 2], [spec.facadeLength - 0.8, 0.12, -front - 0.4]));
  parts.push(
    box(
      "water",
      [0, 0.12, (front + 0.4) / 2 - 0.2],
      [spec.facadeLength - 0.9, L.waterTop - 0.12, -front - 0.6],
    ),
  );
  parts.push(box("marble", [0, 0, front + 0.2], [spec.facadeLength, 0.95, 0.4]));
  parts.push(box("marble", [0, 0.95, front + 0.2], [spec.facadeLength + 0.12, 0.12, 0.56]));
  // Carved panels on the parapet's outer face: framed fields between pilasters.
  for (let i = 0; i < 10; i += 1) {
    const x = -half + 1.4 + ((spec.facadeLength - 2.8) * (i + 0.5)) / 10;
    parts.push(box("marbleWorn", [x, 0.16, front - 0.03], [2.2, 0.62, 0.06]));
    parts.push(box("fadedBlue", [x, 0.24, front - 0.065], [1.9, 0.46, 0.012]));
  }
  for (const s of [-1, 1]) {
    parts.push(box("marble", [s * (half - 0.2), 0, front / 2], [0.4, 3.1, -front]));
    parts.push(...cornice("marble", [s * (half - 0.2), 3.1, front / 2], 0.4, -front, 0.36));
  }

  /* ---- the back wall ---- */
  // The wall in two wings either side of the apse, ashlar on its face.
  const wingLength = half - apseR - 0.6;
  for (const s of [-1, 1]) {
    const cx = s * (apseR + 0.6 + wingLength / 2);
    parts.push(box("limestone", [cx, 0, wallDepth / 2], [wingLength, top - 0.8, wallDepth]));
    // The podium course along the foot of the wall, where the spouts are.
    parts.push(box("marble", [cx, 0, -0.25], [wingLength, P, 0.5]));
    parts.push(box("marble", [cx, P - 0.18, -0.32], [wingLength, 0.18, 0.64]));
  }
  // Behind the apse, the block it is hollowed out of.
  parts.push(box("limestone", [0, 0, apseR + 0.8], [spec.apseWidth + 1.6, top - 0.8, 1.2]));
  for (const s of [-1, 1])
    parts.push(box("limestone", [s * (apseR + 0.3), 0, apseR / 2], [0.6, top - 0.8, apseR + 0.4]));
  // The rear face, seen from the street behind.
  parts.push(
    ...ashlar({
      at: [0, 0, apseR + 1.4],
      rotY: FACING.north,
      length: spec.facadeLength - 0.2,
      height: top - 1.2,
      material: "limestone",
      blocks: 1.2,
    }),
  );
  // The entablature along the whole wall, and its cornice.
  parts.push(
    box("marble", [0, top - 0.8, wallDepth / 2 - 0.1], [spec.facadeLength, 0.8, wallDepth + 0.2]),
  );
  parts.push(box("fadedRed", [0, top - 0.42, -0.215], [spec.facadeLength - 0.4, 0.2, 0.014]));
  parts.push(
    ...cornice("marble", [0, top, wallDepth / 2 - 0.1], spec.facadeLength, wallDepth + 0.2, 0.42),
  );

  /* ---- the apse, its conch and its god ---- */
  parts.push(ring("marble", 0, apseR - 0.01, apseR + 0.3, P, 0, Math.PI, [0, 0]));
  parts.push(
    ring("limestone", P, apseR, apseR + 0.3, top - 0.8 - P - apseR * 0.7, 0, Math.PI, [0, 0]),
  );
  // The half dome, stepped in courses that close towards its crown.
  const springing = top - 0.8 - apseR * 0.7;
  for (let i = 0; i < 6; i += 1) {
    const a0 = (Math.PI / 2) * (i / 6);
    const a1 = (Math.PI / 2) * ((i + 1) / 6);
    const r1 = apseR * Math.cos(a1);
    parts.push(
      ring(
        i % 2 ? "marbleWorn" : "marble",
        springing + apseR * 0.7 * Math.sin(a0),
        Math.max(0.05, r1),
        apseR + 0.3,
        apseR * 0.7 * (Math.sin(a1) - Math.sin(a0)),
        0,
        Math.PI,
        [0, 0],
      ),
    );
  }
  // The apse's floor: the podium carried round under the niche.
  parts.push(box("marble", [0, 0, -0.25], [spec.apseWidth, P, 0.5]));
  parts.push(
    cyl("marble", [0, 0, 0], apseR, apseR, P, 24, {
      thetaStart: -Math.PI / 2,
      thetaLength: Math.PI,
    }),
  );
  // Dionysos on his base in the apse: the god of the fountain's statue group.
  parts.push(cyl("marble", [0, P, apseR * 0.45], 0.55, 0.6, 0.55, 20));
  parts.push(
    statue([0, P + 0.55, apseR * 0.45], 2.25, "antinous", {
      name: "Dionysos",
      sex: "male",
      bearded: false,
      hair: "long",
      dress: "chiton",
    }),
  );

  /* ---- the aediculae ---- */
  const aedicula = (
    cx: number,
    width: number,
    pediment: "triangle" | "segment",
    scan: ScanId | null,
  ) => {
    const colX = width / 2 - d * 0.7;
    const z = -L.pedestal + 0.15;
    for (const s of [-1, 1]) {
      // A pedestal standing in the basin, a column on it.
      parts.push(box("marble", [cx + s * colX, 0, z], [d * 1.7, P, d * 1.9]));
      parts.push(box("marble", [cx + s * colX, P - 0.2, z], [d * 1.9, 0.2, d * 2.1]));
      parts.push(
        ...column(
          "pavonazzetto",
          [cx + s * colX, P, z],
          d,
          spec.columnHeight,
          "composite",
          0,
          true,
        ),
      );
    }
    // The entablature it carries, broken forward over the columns.
    const beamY = P + spec.columnHeight;
    const depth = -z + 0.5;
    parts.push(box("marble", [cx, beamY, z / 2 + 0.2], [width, L.entablature, depth]));
    parts.push(box("fadedRed", [cx, beamY + 0.38, z - d * 0.5 - 0.03], [width - 0.1, 0.2, 0.014]));
    parts.push(...cornice("marble", [cx, top, z / 2 + 0.2], width, depth, 0.42));
    const crown = top + 0.42 * 1.0;
    const rise = spec.facadeHeight - crown;
    if (pediment === "triangle") {
      parts.push(prism("marble", [cx, crown, z / 2 + 0.2], [width + 0.3, rise, depth]));
    } else {
      parts.push(...segmentPediment("marble", cx, crown, z - 0.25, width + 0.3, rise, depth));
    }
    // The niche behind it, and the statue in the niche.
    if (scan) {
      const nicheW = width - d * 3;
      parts.push(box("shadow", [cx, P + 0.1, -0.01], [nicheW, spec.columnHeight * 0.78, 0.02]));
      parts.push(box("marble", [cx, P, -0.62], [nicheW + 0.2, 0.28, 0.24]));
      parts.push(statue([cx, P + 0.28, -0.5], 1.95, scan));
    }
    // The spout under it, pouring into the basin.
    parts.push(cyl("bronze", [cx, P * 0.55, -0.5], 0.07, 0.07, 0.42, 10, { rotX: -Math.PI / 2 }));
    parts.push(box("water", [cx, L.waterTop, -1.0], [0.16, P * 0.55 - L.waterTop + 0.05, 0.1]));
  };
  // The middle aedicula frames the apse, and rises highest.
  aedicula(0, spec.apseWidth + 1.3, "segment", null);
  L.centres.forEach((c, i) => {
    for (const s of [-1, 1]) {
      const scan = NICHE_STATUES[(i * 2 + (s > 0 ? 1 : 0)) % NICHE_STATUES.length]!;
      aedicula(s * c, 3.0, i % 2 ? "segment" : "triangle", scan);
    }
  });

  // Water from lion-mouth spouts along the podium between the aediculae.
  for (const s of [-1, 1]) {
    const xs = [L.centres[0]! - 2.4, ...L.centres.slice(1).map((c, i) => (c + L.centres[i]!) / 2)];
    for (const x of xs) {
      const at: Vec3 = [s * x, P * 0.6, -0.55];
      parts.push(cyl("marble", at, 0.12, 0.1, 0.18, 10, { rotX: -Math.PI / 2 }));
      parts.push(
        box("water", [s * x, L.waterTop, -0.82], [0.12, P * 0.6 - L.waterTop + 0.04, 0.08]),
      );
    }
  }

  /* ---- the two honorific columns standing on the agora ---- */
  for (const s of [-1, 1]) {
    const at: Vec3 = [s * (half + 5), 0, front - 6];
    parts.push(scenery(box("limestone", at, [1.6, 1.9, 1.6])));
    parts.push(...column("limestone", [at[0], 1.9, at[2]], 0.9, 10, "plain", 0).map(scenery));
    parts.push(scenery(box("limestone", [at[0], 11.9, at[2]], [1.2, 0.4, 1.2])));
  }

  return parts;
}

/** A statue in a scan, standing where its niche puts it, facing the agora. */
function statue(
  at: Vec3,
  height: number,
  scan: ScanId,
  identity?: Extract<Part, { kind: "figure" }>["identity"],
): Part {
  return {
    kind: "figure",
    material: "marble" as Material,
    at,
    height,
    rotY: Math.PI,
    ...(identity ? { identity } : {}),
    scan: { id: scan },
  };
}

/** On the agora paving before the basin, a little to one side, facing the fountain. */
export function nymphaeumWalkStart(spec: NymphaeumSpec): WalkStart {
  const L = nymphaeumLayout(spec);
  return {
    at: [3.5, L.front - 7],
    floor: 0,
    look: [0, spec.facadeHeight * 0.45, 0],
  };
}
