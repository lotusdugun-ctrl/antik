import type { Part, Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAmphora as amphora,
  lifeAnimal as animal,
  lifeBox as box,
  lifeBrazier as brazier,
  lifeCyl as cyl,
  lifeDog as dog,
  lifeFinish as finish,
  lifeFire as fire,
  lifeMake as make,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import { lighthouseLayout, type LighthouseSpec } from "@/lib/models/patara-deniz-feneri";

/**
 * The harbour at dusk: the keeper feeding the fire on the tower, a merchant
 * ship moored along the mole with its crew handing amphorae ashore, porters
 * carrying them to the warehouse, a clerk checking the cargo, a fisherman
 * mending his net at the water's edge.
 */
export function lighthouseLife(spec: LighthouseSpec, era: Era): SceneLife {
  const b = make(era, 6465);
  const { cast } = b;
  const L = lighthouseLayout(spec);
  const mw = spec.moleWidth;
  const R = spec.towerDiameter / 2;

  /* The fire on the tower, and the keeper tending it. */
  const top = L.towerTop + 0.45 + 0.6;
  b.flames.push({ at: [0, top + 0.85, 0], size: 1.4, light: true, smoke: true });
  const rt = R - 0.45;
  cast.add({
    at: [(rt + 0.9) / 2 + 0.05, top, 0.3],
    rotY: -Math.PI / 2,
    action: "tend",
    role: "worker",
  });

  /* A merchant ship moored along the harbour side of the mole. */
  const shipX = L.moleStart + 24;
  const shipZ = mw / 2 + 3.2;
  b.props.push(...ship([shipX, 0, shipZ]));
  for (const [dx, action] of [
    [-3, "tend"],
    [1.5, "stand"],
    [4, "talk"],
  ] as const) {
    cast.add({ at: [shipX + dx, 0.32, shipZ], rotY: Math.PI, action, role: "worker" });
  }
  // The gangplank, and the porters walking the cargo to the warehouse.
  b.props.push(box("timber", [shipX - 1.0, 0, mw / 2 + 0.9], [0.7, 0.06, 1.8]));
  const store: Vec3 = [L.moleEnd - 4, 0, -mw / 2 + 4.9];
  for (let i = 0; i < 3; i += 1) {
    const route: Vec3[] = [
      [shipX - 1.0 + i * 0.6, 0, mw / 2 - 1.2],
      [store[0] - 1.5 + i * 0.8, 0, store[2] + 0.9],
    ];
    cast.walk(i % 2 ? [...route].reverse() : route, {
      role: "worker",
      carry: "amphora",
      speed: 0.55 + i * 0.08,
    });
  }
  // The cargo stacked on the quay, and the clerk counting it.
  for (let i = 0; i < 9; i += 1)
    b.props.push(
      ...amphora([shipX + 4 + (i % 3) * 0.45, 0, -0.6 - Math.floor(i / 3) * 0.45], 0.95),
    );
  cast.add({
    at: [shipX + 5, 0, 1.2],
    rotY: Math.PI * 0.8,
    action: "read",
    carry: "tablet",
    role: "official",
  });
  cast.group([L.moleEnd - 14, 0, -1.5], 3);

  /* At the water's edge, a fisherman and his basket. */
  cast.add({ at: [L.moleStart + 14, 0, -mw / 2 + 0.6], rotY: Math.PI, action: "sit" });
  b.props.push(cyl("hide", [L.moleStart + 15, 0, -mw / 2 + 0.9], 0.25, 0.3, 0.35, 10));
  // Someone come out to look at the sea, beside the tower.
  cast.add({
    at: [-spec.baseSide / 2 - 1.6, 0, 2.4],
    rotY: -Math.PI / 2,
    action: "stand",
    female: true,
  });

  /* A mule with panniers on the quay, a dog, a brazier at the warehouse. */
  animal(b, "donkey", [L.moleEnd - 9, 0, -2.6], Math.PI / 2, "stand", { load: true });
  dog(b, [shipX + 7, 0, 2.6]);
  fire(b, brazier([store[0] + 3.6, 0, store[2] - 0.2], 0.9), 0.3, true);
  return finish(b);
}

/**
 * A small merchant ship along the quay: a round hull, a deck, a mast with the
 * yard and the sail furled on it, and the steering oar at the stern.
 */
function ship(at: Vec3): Part[] {
  const [x, , z] = at;
  const parts: Part[] = [];
  // The hull, lofted from stern to bow along x, its keel under the water.
  parts.push({
    kind: "loft",
    material: "timber",
    at: [x, 0, z],
    rotY: Math.PI / 2,
    decor: true,
    sections: [
      { c: [0, 0.2, -6.5], rx: 0.4, ry: 0.5 },
      { c: [0, 0.0, -5.2], rx: 1.4, ry: 0.75 },
      { c: [0, -0.1, -2], rx: 2.0, ry: 0.85 },
      { c: [0, -0.1, 2], rx: 2.0, ry: 0.85 },
      { c: [0, 0.0, 5], rx: 1.5, ry: 0.8 },
      { c: [0, 0.35, 6.6], rx: 0.35, ry: 0.55 },
    ],
  });
  parts.push(box("timber", [x, 0.26, z], [11.4, 0.06, 3.6]));
  parts.push(cyl("timber", [x - 0.5, 0.32, z], 0.12, 0.09, 8.5, 8));
  parts.push(
    cyl("timber", [x - 0.5 - 4, 7.4, z], 0.07, 0.07, 8, 6, {
      rotX: Math.PI / 2,
      rotY: Math.PI / 2,
    }),
  );
  parts.push(
    cyl("linen", [x - 0.5 - 3.6, 7.2, z], 0.22, 0.22, 7.2, 8, {
      rotX: Math.PI / 2,
      rotY: Math.PI / 2,
    }),
  );
  parts.push(box("timber", [x + 6.2, 0.3, z + 1.2], [0.15, 0.15, 2.6]));
  return parts;
}
