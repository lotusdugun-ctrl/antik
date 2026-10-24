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
  lifeAside as aside,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import { lighthouseLayout, type LighthouseSpec } from "@/lib/models/patara-deniz-feneri";
import * as trades from "@/lib/scene-trades";

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

  /*
   * More of the quay: two porters with an amphora slung from a pole, the
   * morning's catch sold off a table, a man shouldering a sack of grain for
   * the ship, and two boys throwing a ball at the foot of the tower.
   */
  const x = aside(b, 6466);
  const m0 = L.moleStart;
  trades.porters(x, [
    [m0 + 18, 0, -mw / 2 + 1.8],
    [m0 + 34, 0, -mw / 2 + 1.8],
    [m0 + 34, 0, -mw / 2 + 1.3],
    [m0 + 18, 0, -mw / 2 + 1.3],
  ]);
  trades.fishmonger(x, [m0 + 17, 0, 0.6], 0);
  x.cast.walk(
    [
      [m0 + 36, 0, -mw / 2 + 0.75],
      [m0 + 16, 0, -mw / 2 + 0.75],
    ],
    { role: "worker", carry: "sack", speed: 0.7 },
  );
  trades.ballGame(x, [spec.baseSide / 2 + 1.5, 0, -2.6], [spec.baseSide / 2 + 4.6, 0, -1.6]);
  return finish(b);
}

/**
 * A small merchant ship along the quay: a beamy hull planked up to a
 * bulwark above the deck, the stern drawn up into a post curling forward
 * (the goose-neck of Roman merchantmen), a mast with the yard and the sail
 * furled on it, and the steering oar at the stern quarter.
 */
function ship(at: Vec3): Part[] {
  const [x, , z] = at;
  const parts: Part[] = [];
  // Half the beam at points along the hull, stern (-x) to bow (+x).
  const plan: [number, number][] = [
    [-6.4, 0.25],
    [-5.0, 1.25],
    [-2.2, 1.85],
    [2.0, 1.85],
    [4.8, 1.35],
    [6.6, 0.2],
  ];
  const sea = -0.4;
  const deck = 0.32;
  const rail = 0.8;
  for (let i = 0; i + 1 < plan.length; i += 1) {
    const [x0, h0] = plan[i]!;
    const [x1, h1] = plan[i + 1]!;
    const mid = (x0 + x1) / 2;
    const length = Math.hypot(x1 - x0, h1 - h0);
    // The deck over this stretch, as wide as its narrower end.
    parts.push(
      box("timber", [x + mid, deck - 0.06, z], [x1 - x0 + 0.02, 0.06, 2 * Math.min(h0, h1)]),
    );

    for (const side of [-1, 1]) {
      // The planking, up to the rail: a board along each side of the stretch.
      const angle = Math.atan2(side * (h1 - h0), x1 - x0);
      parts.push(
        hung(
          [x + mid, rail, z + (side * (h0 + h1)) / 2],
          [length + 0.12, rail - sea + 0.3, 0.12],
          -angle,
        ),
      );
      // The rail capping it, a shade paler where hands have worn it.
      parts.push(
        box(
          "hide",
          [x + mid, rail, z + (side * (h0 + h1)) / 2],
          [length + 0.12, 0.08, 0.18],
          -angle,
        ),
      );
    }
  }
  // Under the deck the body of the hull, rounding down into the water.
  parts.push({
    kind: "loft",
    material: "timber",
    at: [x, 0, z],
    rotY: Math.PI / 2,
    sections: plan.map(([u, h]) => ({
      c: [0, -0.5, u] as Vec3,
      rx: Math.max(0.15, h - 0.04),
      ry: 0.78,
    })),
  });
  // The sternpost, rising out of the stern and curling forward over the deck.
  let px = x - 6.45;
  let py = deck;
  let lean = -0.35;
  for (let k = 0; k < 4; k += 1) {
    const len = 0.75;
    parts.push(
      cyl("timber", [px, py, z], 0.14 - k * 0.02, 0.12 - k * 0.02, len, 6, {
        rotX: lean,
        rotY: Math.PI / 2,
      }),
    );
    px += Math.sin(lean) * len;
    py += Math.cos(lean) * len;
    lean += 0.55;
  }
  // The mast, the yard across it, and the sail furled along the yard.
  parts.push(cyl("timber", [x - 0.5, deck, z], 0.12, 0.09, 8.5, 8));
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
  // The steering oar over the quarter, its blade in the water.
  parts.push(cyl("timber", [x - 5.2, 1.0, z + 1.35], 0.07, 0.07, 2.5, 6, { rotX: Math.PI - 0.35 }));
  parts.push(hung([x - 5.2, 0, z + 2.05], [0.06, 0.8, 0.45], 0));
  return parts.map((part) => ({ ...part, decor: true }));
}

/** A timber hanging down from `top`: a part of the hull below the waterline. */
function hung(top: Vec3, size: Vec3, rotY: number): Part {
  return { kind: "box", material: "timber", at: top, size, rotY, rotX: Math.PI };
}
