import type { Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAnimal as animal,
  lifeAside as aside,
  lifeBox as box,
  lifeBrazier as brazier,
  lifeCyl as cyl,
  lifeDog as dog,
  lifeFinish as finish,
  lifeFire as fire,
  lifeMake as make,
  lifeTorchStand as torchStand,
  lifeAltar as altar,
  lifeAmphora as amphora,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import { gateLayout, type RomanGateSpec } from "@/lib/models/roma-kapilari";
import { prostyleLayout, type ProstyleTempleSpec } from "@/lib/models/hadrian-tapinagi";
import type { LycianHeroonSpec } from "@/lib/models/nereid-aniti";
import { tombsLayout, type RockTombsSpec } from "@/lib/models/kaunos-kaya-mezarlari";
import * as trades from "@/lib/scene-trades";

const PI = Math.PI;

/**
 * A city gate in the morning: country people coming in with their beasts and
 * baskets, a carter, a soldier of the watch at the tower door checking who
 * passes, townspeople going out, a beggar at the pier; at Aphrodisias, the
 * gateway to the sanctuary, pilgrims with offerings and a sculptor at work.
 */
export function gateLife(spec: RomanGateSpec, era: Era, id: string): SceneLife {
  const b = make(era, id.length * 733 + 17);
  const { cast, rand } = b;
  const D = spec.depth;
  if (spec.variant === "arch") {
    const L = gateLayout(spec);
    const lanes = L.openingsX;
    // Through the three arches, in and out.
    for (let i = 0; i < 9; i += 1) {
      const x = lanes[i % lanes.length]! + (rand() - 0.5) * 1.6;
      const route: Vec3[] = [
        [x, 0, -D / 2 - 18 - rand() * 8],
        [x + (rand() - 0.5), 0, D / 2 + 16 + rand() * 8],
      ];
      cast.walk(i % 3 === 1 ? [...route].reverse() : route, {
        ...(i % 4 === 0
          ? { carry: "basket" as const }
          : i % 4 === 2
            ? { carry: "amphora" as const }
            : {}),
        ...(i % 5 === 3 ? { female: true } : {}),
        speed: 0.65 + rand() * 0.3,
      });
    }
    // A peasant leading a donkey with panniers through the middle arch.
    animal(b, "donkey", [lanes[1]! + 0.6, 0, -D / 2 - 6], 0, "walk", {
      load: true,
      route: [
        [lanes[1]! + 0.6, 0, -D / 2 - 22],
        [lanes[1]! + 0.6, 0, D / 2 + 20],
      ],
      speed: 0.6,
    });
    cast.walk(
      [
        [lanes[1]! - 0.3, 0, -D / 2 - 23],
        [lanes[1]! - 0.3, 0, D / 2 + 19],
      ],
      { role: "worker", carry: "staff", speed: 0.6 },
    );
    // An ox cart waiting outside, its driver talking with the watch.
    const cx = lanes[0]! - 6.5;
    animal(b, "ox", [cx - 0.7, 0, -D / 2 - 11], 0.1, "stand");
    animal(b, "ox", [cx + 0.7, 0, -D / 2 - 11], 0.1, "stand");
    b.props.push(box("timber", [cx, 0.6, -D / 2 - 14], [1.8, 0.5, 3]));
    for (const s of [-1, 1])
      b.props.push(
        cyl("timber", [cx + s * 1.0, 0.55, -D / 2 - 14], 0.55, 0.55, 0.12, 14, {
          rotX: PI / 2,
          rotY: PI / 2,
        }),
      );
    for (let i = 0; i < 4; i += 1)
      b.props.push(
        ...amphora([cx - 0.5 + (i % 2) * 0.5, 0.85, -D / 2 - 14.6 + Math.floor(i / 2) * 0.5], 0.8),
      );
    const T = spec.towerSide ?? 7;
    const guardX = lanes[0]! - 1.8;
    cast.add({
      at: [guardX, 0, -D / 2 - 3],
      rotY: PI * 0.8,
      action: "stand",
      role: "soldier",
      carry: "spear",
    });
    cast.add({
      at: [guardX - 1.1, 0, -D / 2 - 3.8],
      rotY: PI * 0.4,
      action: "talk",
      role: "soldier",
      carry: "shield",
    });
    cast.add({ at: [cx + 1.6, 0, -D / 2 - 9.5], rotY: -PI * 0.3, action: "talk", role: "worker" });
    const beggarZ = -D / 2 - (spec.columnDiameter ? spec.columnDiameter * 1.2 + 1.2 : 2.5);
    trades.beggar(b, [L.piersX[2]!, 0, beggarZ], PI);
    // A crowd at the sellers outside the gate.
    cast.group([L.width / 2 + T + 2, 0, -D / 2 - 8.2], 3, 0.7);
    // Inside the walls: children playing and a man drawing water.
    const x = aside(b, 4128);
    trades.ballGame(x, [-6, 0, D / 2 + 9], [-2.5, 0, D / 2 + 10.5]);
    trades.elders(x, [9, 0, D / 2 + 7], -PI / 2, 2, true);
    dog(b, [lanes[2]! + 1.5, 0, D / 2 + 5]);
    fire(b, torchStand([guardX, 0, -D / 2 - 1.2], 2.2), 0.32, true);
    fire(b, torchStand([-guardX, 0, -D / 2 - 1.2], 2.2), 0.32, true);
  } else {
    // The tetrapylon: pilgrims coming from the street into the sanctuary.
    const S = spec.archSpan;
    for (let i = 0; i < 10; i += 1) {
      const x =
        (i % 3 === 0 ? 0 : (i % 3 === 1 ? -1 : 1) * (S / 2 + spec.pierWidth / 2)) +
        (rand() - 0.5) * 0.7;
      const route: Vec3[] = [
        [x, 0, -D / 2 - 14 - rand() * 6],
        [x, 0, D / 2 + 13 + rand() * 4],
      ];
      cast.walk(i % 4 === 3 ? [...route].reverse() : route, {
        carry: (["offering", "basket", "incense", "jar", "offering"] as const)[i % 5]!,
        ...(i % 2 ? { female: true } : {}),
        speed: 0.55 + rand() * 0.3,
      });
    }
    // A priestess of Aphrodite with an attendant, a dove-seller by the gate.
    cast.add({
      at: [1.2, 0, D / 2 + 6],
      rotY: PI,
      action: "stand",
      role: "priestess",
      carry: "phiale",
    });
    cast.add({
      at: [2.2, 0, D / 2 + 6.4],
      rotY: PI,
      action: "play",
      role: "musician",
      carry: "aulos",
    });
    // Aphrodisias was a city of sculptors: one finishing a statue by the court.
    const x = aside(b, 4212);
    trades.sculptor(x, [-9, 0, D / 2 + 7], PI / 2);
    trades.elders(x, [9.5, 0, D / 2 + 5], -PI / 2, 3, true);
    fire(b, altar([6.5, 0, D / 2 + 11], 2.4, 1.4, 1.2), 0.7, true, true);
    fire(b, torchStand([-4.6, 0, -D / 2 - 1.5], 2.0), 0.3, true);
    fire(b, torchStand([4.6, 0, -D / 2 - 1.5], 2.0), 0.3, false);
    dog(b, [6, 0, -D / 2 - 9]);
  }
  return finish(b);
}

/**
 * Curetes Street outside the little temple: people going up and down the
 * street, a magistrate and his clerk on the temple steps, a woman with an
 * offering at the door, shopkeepers in the colonnade opposite.
 */
export function prostyleLife(spec: ProstyleTempleSpec, era: Era): SceneLife {
  const b = make(era, 1181);
  const { cast, rand } = b;
  const L = prostyleLayout(spec);
  const sz = L.street;
  const fz = sz - 7.6;
  for (let i = 0; i < 12; i += 1) {
    const z = sz - 1 - rand() * 4.5;
    const route: Vec3[] = [
      [-26, 0, z],
      [26, 0, z + (rand() - 0.5)],
    ];
    cast.walk(i % 2 ? [...route].reverse() : route, {
      ...(i % 3 === 0 ? { female: true } : {}),
      ...(i % 4 === 1
        ? { carry: "basket" as const }
        : i % 4 === 3
          ? { carry: "scroll" as const }
          : {}),
      speed: 0.6 + rand() * 0.35,
    });
  }
  // On the steps: a magistrate in his toga and a clerk with his tablets.
  const steps = Math.ceil(spec.podiumHeight / 0.25);
  const stepZ = L.front - (steps - 1.5) * 0.32;
  cast.add({ at: [-1.6, 0.25, stepZ], rotY: PI, action: "talk", role: "official" });
  cast.add({
    at: [-0.6, 0.25, stepZ - 0.2],
    rotY: PI * 0.8,
    action: "write",
    role: "worker",
    carry: "tablet",
  });
  // A woman with her offering at the temple door, the lamp lit before it.
  cast.add({
    at: [0.4, spec.podiumHeight, -0.9],
    rotY: 0,
    action: "pray",
    female: true,
    carry: "offering",
  });
  fire(b, brazier([1.3, spec.podiumHeight, -1.2], 0.7), 0.25, true, true);
  // Buyers at the shops in the colonnade across the street.
  for (const x of [-15, -5, 10, 20]) cast.group([x + 1.5, 0, fz + 3.6], 2, 0.5);
  const x = aside(b, 1182);
  trades.weigher(x, [5, 0, fz + 2.8], PI);
  trades.sweeper(x, [
    [-12, 0, sz - 0.7],
    [-6, 0, sz - 0.7],
  ]);
  trades.knucklebones(x, [13, 0, sz - 5.8], 0);
  for (const s of [-1, 1])
    fire(b, torchStand([s * (spec.facadeWidth / 2 + 0.9), 0, L.street + 0.4], 2.0), 0.3, s > 0);
  dog(b, [-9, 0, sz - 3]);
  return finish(b);
}

/**
 * The tomb of the dynast on a feast of the dead: a priest offering at the
 * altar before its front, mourners and the dynast's household bringing
 * gifts, musicians, and a few of the city come to watch.
 */
export function heroonLife(spec: LycianHeroonSpec, era: Era): SceneLife {
  const b = make(era, 3810);
  const { cast, rand } = b;
  const front = -spec.podiumLength / 2;
  const az = front - 2.4;
  fire(b, altar([0, 0, az], 1.6, 1.0, 1.1), 0.7, true, true);
  cast.add({ at: [0, 0, az + 1.0], rotY: PI, action: "pour", role: "priest", carry: "phiale" });
  cast.add({
    at: [-1.4, 0, az + 0.4],
    rotY: PI * 0.7,
    action: "play",
    role: "musician",
    carry: "aulos",
  });
  cast.add({
    at: [1.5, 0, az + 0.4],
    rotY: -PI * 0.7,
    action: "play",
    role: "musician",
    carry: "lyre",
  });
  // The household: women mourning, men bringing jars and baskets.
  for (let i = 0; i < 6; i += 1) {
    const x = -3 + (i % 3) * 3 + (rand() - 0.5);
    const z = az - 2.2 - Math.floor(i / 3) * 1.4;
    cast.add({
      at: [x, 0, z],
      rotY: 0,
      action: i % 3 === 0 ? "pray" : "stand",
      role: i < 3 ? "mourner" : "citizen",
      ...(i < 3 ? { female: true } : { carry: i % 2 ? ("jar" as const) : ("basket" as const) }),
    });
  }
  // More coming up the path from the city.
  for (let i = 0; i < 4; i += 1)
    cast.walk(
      [
        [-14 + i * 0.8, 0, az - 16],
        [-2.5 + i * 0.9, 0, az - 4.5],
      ],
      {
        carry: (["offering", "jar", "torch", "offering"] as const)[i]!,
        speed: 0.55,
        ...(i % 2 ? { female: true } : {}),
      },
    );
  // Bystanders along the side of the tomb, and a goat for the sacrifice.
  cast.group([spec.podiumWidth / 2 + 3.5, 0, front + 1.5], 3, 0.7);
  animal(b, "goat", [2.6, 0, az - 1.4], PI / 2, "stand");
  cast.add({ at: [3.3, 0, az - 1.5], rotY: -PI / 2, action: "tend", role: "worker" });
  for (const s of [-1, 1])
    fire(b, torchStand([s * (spec.podiumWidth / 2 + 0.8), 0, front - 0.8], 2.0), 0.32, s > 0);
  const x = aside(b, 3811);
  trades.elders(x, [-spec.podiumWidth / 2 - 4, 0, 0], PI / 2, 2, true);
  dog(b, [5, 0, az - 7]);
  return finish(b);
}

/**
 * The river under the tombs: a boat bringing a funeral party to the landing,
 * mourners climbing the steps to a tomb and gathered on its porch, a mason
 * cutting the front of a new one high on the cliff, fishermen in a boat and
 * reed-cutters on the bank.
 */
export function rockTombLife(spec: RockTombsSpec, era: Era): SceneLife {
  const b = make(era, 4418);
  const { cast } = b;
  const L = tombsLayout(spec);
  // The funeral party come ashore, walking to the steps of the great tomb.
  const main = L.tombs[Math.floor(L.tombs.length / 2)]!;
  const foot: Vec3 = [main.x - spec.facadeWidth * main.scale * 0.5 - 1.8, 0, L.face - 1.6];
  for (let i = 0; i < 6; i += 1)
    cast.walk(
      [
        [8 + (i % 2) * 0.6, 0, L.bank - 1 - i * 0.7],
        [8, 0, L.face - 4],
        [foot[0] + 1.5 + i * 0.6, 0, L.face - 3.4],
      ],
      {
        role: i < 3 ? "mourner" : "citizen",
        ...(i < 3 ? { female: true } : { carry: "jar" as const }),
        speed: 0.5,
      },
    );
  // On the porch of the great tomb: the priest at a small fire, two mourners.
  const py = main.y + 0.5;
  fire(b, brazier([main.x, py, 0.6], 0.6), 0.25, true, true);
  cast.add({
    at: [main.x - 0.5, py, 0.9],
    rotY: 0,
    action: "pour",
    role: "priest",
    carry: "phiale",
  });
  cast.add({
    at: [main.x + 0.6, py, 0.9],
    rotY: -0.3,
    action: "pray",
    role: "mourner",
    female: true,
  });
  // A mason cutting the front of another tomb, on his ledge.
  const other = L.tombs[1]!;
  cast.add({
    at: [other.x + 1, other.y + 0.5, 0.0],
    rotY: 0,
    action: "carve",
    role: "worker",
    carry: "chisel",
  });
  // On the bank: reed-cutters and a fisherman.
  cast.add({
    at: [-12, 0, L.bank + 0.4],
    rotY: PI,
    action: "chop",
    role: "worker",
    carry: "reeds",
  });
  cast.add({ at: [-14.5, 0, L.bank + 0.6], rotY: PI * 0.9, action: "crouch", role: "worker" });
  cast.add({ at: [20, 0, L.bank + 0.3], rotY: PI, action: "sit", role: "worker" });
  animal(b, "donkey", [-6, 0, L.face - 3.2], PI / 2, "stand", { load: true });
  dog(b, [2, 0, L.face - 3.6]);
  return finish(b);
}
