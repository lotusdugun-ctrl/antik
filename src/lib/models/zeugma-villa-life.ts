import type { Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAmphora as amphora,
  lifeBox as box,
  lifeBrazier as brazier,
  lifeCyl as cyl,
  lifeDog as dog,
  lifeFinish as finish,
  lifeFire as fire,
  lifeJar as jar,
  lifeLampstand as lampstand,
  lifeMake as make,
  lifeAside as aside,
  lifeAnimal as animal,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import { villaLayout, type TerraceVillaSpec } from "@/lib/models/zeugma-villa";
import * as trades from "@/lib/scene-trades";

/**
 * The house in the evening: a dinner laid in the reception room, a slave
 * coming up from the kitchen with the wine, the lyre, the loom in a side
 * room, a child at the pool, and below the terrace a boatman on the river
 * that gave the town its name — zeugma, the bridge of boats.
 */
export function villaLife(spec: TerraceVillaSpec, era: Era): SceneLife {
  const b = make(era, 25300);
  const { cast } = b;
  const L = villaLayout(spec);
  const { F, cw, cd, pz, ox, north, south, edge } = L;
  const walk = spec.porticoWidth;
  const triZ = pz + 0.6 + (north - pz - 0.6) / 2;

  /* The dinner: three couches round the panel, open to the court. */
  const couch = (at: Vec3, rotY: number) => {
    b.props.push(box("timber", at, [2.2, 0.42, 0.95], rotY));
    b.props.push(box("linen", [at[0], at[1] + 0.42, at[2]], [2.15, 0.12, 0.9], rotY));
  };
  const back = north - 1.0;
  couch([0, F, back], 0);
  couch([-3.4, F, triZ + 0.4], Math.PI / 2);
  couch([3.4, F, triZ + 0.4], -Math.PI / 2);
  b.props.push(cyl("timber", [0, F, triZ + 0.6], 0.45, 0.5, 0.5, 14));
  b.props.push(...jar([0.1, F + 0.5, triZ + 0.55], 0.3));
  for (const [x, z, r] of [
    [-0.6, back, Math.PI],
    [0.7, back, Math.PI],
    [-3.4, triZ + 0.9, Math.PI / 2],
    [3.4, triZ, -Math.PI / 2],
  ] as const) {
    cast.add({ at: [x, F + 0.54, z], rotY: r, action: x > 0 ? "talk" : "sit" });
  }
  cast.add({
    at: [-1.6, F, triZ - 1.2],
    rotY: Math.PI / 4,
    action: "play",
    role: "musician",
    carry: "lyre",
    female: true,
  });
  for (const [x, light] of [
    [-2.2, true],
    [2.2, false],
  ] as const)
    fire(b, lampstand([x, F, back - 1.3], 1.45), 0.12, light);

  /* The slave with the wine, up from the street range round the portico. */
  const out: Vec3[] = [
    [0, F, -pz - 1.6],
    [0, F, -cd - walk / 2],
    [-cw - walk / 2, F, -cd - walk / 2],
    [-cw - walk / 2, F, cd + walk / 2],
    [0, F, cd + walk / 2],
    [0, F, pz + 1.2],
  ];
  cast.walk([...out, ...out.slice(1, -1).reverse()], {
    role: "worker",
    carry: "amphora",
    speed: 0.6,
  });

  /* The court: a child at the pool, a reader in the colonnade. */
  cast.add({
    at: [spec.poolWidth / 2 + 0.7, F, -0.4],
    rotY: -Math.PI / 2,
    action: "play",
    role: "child",
  });
  cast.add({ at: [cw + 1.2, F, -1.4], rotY: -Math.PI / 2, action: "read", carry: "scroll" });
  cast.add({
    at: [-cw - 1.4, F, 1.0],
    rotY: Math.PI / 2,
    action: "stand",
    female: true,
    carry: "jar",
  });
  dog(b, [-spec.poolWidth / 2 - 0.9, F, -1.0]);

  /* A side room: the loom, and the woman at it. */
  const loomX = -(cw + walk + 0.6 + spec.roomDepth / 2);
  const loomZ = cd + walk - 2;
  b.props.push(box("timber", [loomX - 1.0, F, loomZ], [0.08, 2.0, 0.08]));
  b.props.push(box("timber", [loomX + 1.0, F, loomZ], [0.08, 2.0, 0.08]));
  b.props.push(box("timber", [loomX, F + 1.9, loomZ], [2.1, 0.1, 0.1]));
  b.props.push(box("paintBlue", [loomX, F + 0.7, loomZ], [1.7, 1.2, 0.02]));
  cast.add({ at: [loomX, F, loomZ - 0.7], rotY: 0, action: "weave", female: true });

  /* The kitchen in the street range: the hearth, and the cook at it. */
  const kx = ox - 3.2;
  const kz = (south - pz - 0.6) / 2;
  b.props.push(box("stone", [kx, F, kz + 0.9], [1.8, 0.8, 0.9]));
  b.props.push(box("stoneDark", [kx, F + 0.8, kz + 0.9], [1.5, 0.04, 0.7]));
  b.props.push(cyl("bronze", [kx + 0.4, F + 0.84, kz + 0.9], 0.18, 0.22, 0.2, 12));
  b.flames.push({ at: [kx - 0.3, F + 0.86, kz + 0.95], size: 0.25, light: true, smoke: true });
  cast.add({ at: [kx, F, kz - 0.2], rotY: 0, action: "tend", female: true, role: "worker" });
  b.props.push(...amphora([kx - 2.0, F, kz + 1.0]), ...amphora([kx - 2.5, F, kz + 1.1], 0.92));

  /* On the terrace before the house, and on the river below it. */
  fire(b, brazier([-4.5, F, edge + 2.2], 0.9), 0.28, true);
  cast.group([-6.5, F, edge + 2.6], 2);
  cast.add({ at: [5.5, F, edge + 1.0], rotY: Math.PI, action: "stand" });
  // A boatman walking the river path, and a porter climbing to the house.
  cast.walk(
    [
      [-20, 0, edge - 7],
      [20, 0, edge - 7],
    ],
    { role: "worker", carry: "basket", speed: 0.8 },
  );

  /*
   * Zeugma is its mosaics: a mosaicist squats over a new floor in the side
   * room, his tesserae in heaps beside him. A steward does the accounts by
   * the door, a mother walks the colonnade with her child, a woman spins on
   * the terrace, and on the river path a donkey goes by with its load.
   */
  const x = aside(b, 25301);
  const mx = cw + walk + 2.6;
  x.cast.add({
    at: [mx, F, -2.6],
    rotY: -Math.PI / 2,
    action: "crouch",
    carry: "chisel",
    role: "worker",
    outfit: { apron: 0x9a7a5a },
  });
  const tesserae = ["paintRed", "paintBlue", "marble", "stoneDark", "paintGold"] as const;
  tesserae.forEach((m, i) =>
    x.props.push(box(m, [mx + 0.25 + (i % 2) * 0.18, F, -2.2 - i * 0.16], [0.12, 0.05, 0.1], i)),
  );
  trades.scribe(x, [-6, F, -11], Math.PI / 2, { role: "official" });
  trades.handInHand(
    x,
    [
      [-4, F, -3.2],
      [4, F, -3.2],
      [4, F, 3.2],
      [-4, F, 3.2],
    ],
    0.46,
    { female: true },
  );
  x.cast.add({
    at: [-1.0, F, edge + 1.6],
    rotY: 0.4,
    action: "spin",
    carryLeft: "distaff",
    female: true,
  });
  const path: Vec3[] = [
    [18, 0, edge - 7.4],
    [-18, 0, edge - 7.4],
  ];
  const donkey = animal(x, "donkey", path[0]!, -Math.PI / 2, "walk", {
    route: path,
    speed: 0.6,
    load: true,
  });
  const driver = x.cast.walk(path, { role: "worker", carry: "staff", speed: 0.6 });
  driver.phase = (donkey.phase * 5 - 1.6) / 7;
  return finish(b);
}
