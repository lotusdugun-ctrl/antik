import type { Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAnimal as animal,
  lifeAside as aside,
  lifeBrazier as brazier,
  lifeDog as dog,
  lifeFinish as finish,
  lifeFire as fire,
  lifeFlock as flock,
  lifeJar as jar,
  lifeMake as make,
  lifeTorchStand as torchStand,
  lifeAltar as altar,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import {
  aqueductLayout,
  rockChurchLayout,
  sphinxGateLayout,
  undergroundLayout,
  undergroundRooms,
  type AqueductSpec,
  type MudbrickSpec,
  type RockChurchSpec,
  type SeljukSpec,
  type SphinxGateSpec,
  type UndergroundSpec,
} from "@/lib/models/anadolu-yeni";
import * as trades from "@/lib/scene-trades";

const PI = Math.PI;

/**
 * The aqueduct in the plain: travellers and a donkey on the road under the
 * arches, men up on the pipe re-setting a block, a shepherd with his flock
 * and his fire, a ploughman in the field beside it.
 */
export function aqueductLife(spec: AqueductSpec, era: Era): SceneLife {
  const b = make(era, 2251);
  const { cast, rand } = b;
  const L = aqueductLayout(spec);
  const r = L.road;
  for (let i = 0; i < 7; i += 1) {
    const x = r + (i % 2 ? 0.7 : -0.7);
    const route: Vec3[] = [
      [x, 0, -34 - i * 1.5],
      [x, 0, 34 + i * 1.2],
    ];
    cast.walk(i % 2 ? [...route].reverse() : route, {
      speed: 0.5 + rand() * 0.3,
      carry: (["basket", "jar", "staff", "basket", "amphora", "staff", "jar"] as const)[i]!,
      female: i === 3,
    });
  }
  animal(b, "donkey", [r + 0.6, 0, -18], 0, "walk", {
    route: [
      [r + 0.6, 0, -30],
      [r + 0.6, 0, 30],
    ],
    speed: 0.7,
  });
  // On the top of the bridge, beside the pipe: two masons re-setting a block.
  const top = spec.archHeight + 0.9;
  cast.add({
    at: [r + 12, top, 0],
    rotY: PI / 2,
    action: "carve",
    role: "worker",
    carry: "chisel",
  });
  cast.add({
    at: [r + 14, top, 0],
    rotY: -PI / 2,
    action: "tend",
    role: "worker",
    carry: "mallet",
  });
  // On the ground below them, a block being dressed and a man with the rope.
  cast.add({ at: [r + 13, 0, -3.6], rotY: 0, action: "carve", role: "worker", carry: "chisel" });
  cast.add({ at: [r + 15.5, 0, -3.4], rotY: -0.4, action: "point", role: "official" });
  // The shepherd, his flock among the piers and his fire.
  const sx = r - 26;
  trades.shepherd(b, [sx, 0, -14], 0.4);
  flock(b, "sheep", [sx + 4, 0, -9], 9, 4);
  fire(b, brazier([sx - 2.5, 0, -15.5], 0.7), 0.35, true, true);
  cast.add({ at: [sx - 2.5, 0, -16.6], rotY: 0, action: "sit", role: "child" });
  // The field on the other side of the road.
  trades.ploughing(b, [
    [r + 22, 0, -16],
    [r + 42, 0, -16],
    [r + 42, 0, -28],
    [r + 22, 0, -28],
  ]);
  const x = aside(b, 2252);
  trades.grinder(x, [sx - 5, 0, -12], 0.8);
  dog(b, [sx + 7, 0, -13]);
  return finish(b);
}

/**
 * The underground city on a day it was lived in: people at work in the rooms
 * of each level — grinding grain, filling jars, at the wine press, at prayer
 * in the church on the lowest level — the village going about its day on
 * the hill above, and people coming and going at its foot.
 */
export function undergroundLife(spec: UndergroundSpec, era: Era): SceneLife {
  const b = make(era, 1923);
  const { cast, rand } = b;
  const L = undergroundLayout(spec);
  const mid = (L.face + L.face + L.room) / 2;
  const jobs = ["grind", "store", "press", "talk", "store"] as const;
  L.levels.forEach((lv, i) => {
    const rooms = undergroundRooms(spec, i);
    rooms.forEach((room, k) => {
      if (
        room.x1 > L.shaftX - spec.shaftWidth / 2 - 0.4 &&
        room.x0 < L.shaftX + spec.shaftWidth / 2 + 0.4
      )
        return;
      const cx = (room.x0 + room.x1) / 2;
      const at = (dx: number, dz: number): Vec3 => [cx + dx, lv.y, mid + dz];
      if (i === L.levels.length - 1 && k === 1) {
        // The church: the priest at the altar, a few people at prayer.
        fire(b, torchStand(at(-1.6, 1.8), 1.6), 0.25, true);
        cast.add({
          female: false,
          at: at(0, 1.6),
          rotY: 0,
          action: "pray",
          role: "priest",
          carry: "incense",
        });
        for (let p = 0; p < 4; p += 1)
          cast.add({
            female: false,
            at: at(-1.5 + p, -0.8),
            rotY: 0,
            action: p % 2 ? "kneel" : "pray",
          });
        return;
      }
      const job = jobs[(i + k) % jobs.length]!;
      if (job === "grind") {
        b.props.push(...jar(at(-0.6, 1.8), 1.1));
        cast.add({ female: false, at: at(0.3, 0.2), rotY: PI, action: "pray" });
      } else if (job === "store") {
        b.props.push(...jar(at(-0.8, 1.6), 1));
        b.props.push(...jar(at(0.2, 1.8), 0.9));
        cast.add({
          female: false,
          at: at(0.6, -0.4),
          rotY: PI * 0.8,
          action: "tend",
          role: "worker",
          carry: "jar",
        });
      } else if (job === "press") {
        cast.add({
          female: false,
          at: at(-0.5, 0),
          rotY: 0,
          action: "tend",
          role: "worker",
          carry: "basket",
        });
        cast.add({ female: false, at: at(0.8, -0.6), rotY: -0.5, action: "talk", carry: "jar" });
      } else {
        cast.add({ female: false, at: at(-0.4, 0), rotY: 0.5, action: "talk" });
        cast.add({ female: false, at: at(0.5, 0.2), rotY: -2.4, action: "talk" });
      }
    });
  });
  // The village on top of the hill: a bread oven smoking, people at the shaft.
  const yTop = L.top;
  const back = L.face + L.room;
  fire(b, brazier([L.shaftX + 6, yTop, L.face + 2.5], 0.7), 0.35, true, true);
  cast.add({
    female: false,
    at: [L.shaftX - 3, yTop, L.face + 2],
    rotY: 0.6,
    action: "tend",
    carry: "jar",
  });
  cast.add({ female: false, at: [L.shaftX - 5, yTop, L.face + 3.2], rotY: 2.2, action: "talk" });
  for (let i = 0; i < 4; i += 1)
    cast.walk(
      [
        [-spec.width / 2 + 3 + i, yTop, back + 1.5],
        [spec.width / 2 - 3 - i, yTop, back + 1.5],
      ],
      { female: false, speed: 0.45 + rand() * 0.2, ...(i % 2 ? { carry: "basket" as const } : {}) },
    );
  // At the foot of the cut, people looking up at it and passing by.
  for (let i = 0; i < 6; i += 1) {
    const z = L.face - 4 - i * 1.3;
    const route: Vec3[] = [
      [-spec.width / 2 - 6, 0, z],
      [spec.width / 2 + 6, 0, z],
    ];
    cast.walk(i % 2 ? [...route].reverse() : route, { female: false, speed: 0.5 + rand() * 0.3 });
  }
  const x = aside(b, 1924);
  trades.gazer(x, [-4, 0, L.face - 9], [-4, spec.depth * 0.5, L.face], {}, true);
  animal(b, "donkey", [10, 0, L.face - 6], PI / 2, "stand");
  cast.add({
    female: false,
    at: [11.2, 0, L.face - 6.6],
    rotY: -PI / 2,
    action: "tend",
    role: "worker",
  });
  dog(b, [-12, 0, L.face - 8]);
  return finish(b);
}

/**
 * The valley of the churches on a feast day: monks and pilgrims along the
 * path, people gathered at the carved fronts, a painter at work on a front,
 * goats grazing, a fire before the refectory.
 */
export function rockChurchLife(spec: RockChurchSpec, era: Era): SceneLife {
  const b = make(era, 1104);
  const { cast, rand } = b;
  const cones = rockChurchLayout(spec);
  for (let i = 0; i < 10; i += 1) {
    const z = (i % 2 ? 0.8 : -0.8) + (rand() - 0.5) * 0.4;
    const route: Vec3[] = [
      [-spec.valleyWidth * 1.3, 0, z],
      [spec.valleyWidth * 1.3, 0, z],
    ];
    cast.walk(i % 3 === 0 ? [...route].reverse() : route, {
      role: i % 4 === 0 ? "priest" : "citizen",
      speed: 0.4 + rand() * 0.3,
      ...(i % 4 === 1 ? { carry: "offering" as const } : {}),
    });
  }
  const churches = cones.filter((c) => c.church);
  churches.forEach((c, i) => {
    const out = c.z > 0 ? -1 : 1;
    const fz = c.z + out * (c.r * 1.25 + 1.6);
    if (i === 0) {
      // The priest at the door with incense, people waiting to go in.
      cast.add({
        female: false,
        at: [c.x, 0, fz],
        rotY: out > 0 ? 0 : PI,
        action: "pray",
        role: "priest",
        carry: "incense",
      });
      for (let p = 0; p < 4; p += 1)
        cast.add({
          female: false,
          at: [c.x - 1.5 + p, 0, fz + out * 2.4],
          rotY: out > 0 ? PI : 0,
          action: p % 2 ? "talk" : "stand",
        });
    } else if (i === 1) {
      // A painter retouching the cross over the door.
      cast.add({ female: false, at: [c.x + 1.2, 0, fz], rotY: out > 0 ? PI : 0, action: "point" });
    } else {
      cast.add({
        female: false,
        at: [c.x - 0.8, 0, fz + out * 0.6],
        rotY: out > 0 ? PI : 0,
        action: "kneel",
      });
    }
  });
  // The fire before the refectory, and bread being made beside it.
  const c0 = churches[0] ?? cones[0]!;
  const out0 = c0.z > 0 ? -1 : 1;
  const fx = c0.x + 7;
  const fz = c0.z + out0 * (c0.r * 1.25 + 2.5);
  fire(b, brazier([fx, 0, fz], 0.7), 0.35, true, true);
  cast.add({
    female: false,
    at: [fx - 1.4, 0, fz],
    rotY: PI / 2,
    action: "tend",
    role: "worker",
    carry: "basket",
  });
  const x = aside(b, 1105);
  x.cast.add({
    female: false,
    at: [spec.valleyWidth * 0.9, 0, 3.2],
    rotY: -1.2,
    action: "stand",
    carry: "staff",
  });
  flock(x, "goat", [spec.valleyWidth * 0.9 + 4, 0, 4], 6, 2.5);
  dog(b, [-spec.valleyWidth * 0.6, 0, 2.6]);
  return finish(b);
}

/**
 * Before the north portal on a Friday: men coming to prayer, a few stopped
 * to look up at the carving, a stone-carver at work on the portal, a patient
 * helped to the hospital door, a water-seller.
 */
export function seljukLife(spec: SeljukSpec, era: Era): SceneLife {
  const b = make(era, 1228);
  const { cast, rand } = b;
  const front = -spec.depth / 2;
  const nx = spec.length * 0.18;
  const hx = -spec.length * 0.3;
  for (let i = 0; i < 9; i += 1) {
    const x = nx + (i % 3) - 1;
    cast.walk(
      [
        [x - 18 + i, 0, front - 16 - (i % 2)],
        [x, 0, front - 4.4],
      ],
      { female: false, speed: 0.5 + rand() * 0.25 },
    );
  }
  for (let i = 0; i < 3; i += 1)
    cast.add({
      female: false,
      at: [nx - 2 + i * 2, 0, front - 6],
      rotY: 0,
      action: i === 1 ? "point" : "stand",
    });
  // A stone-carver on a low bench by the portal, finishing a boss.
  cast.add({
    female: false,
    at: [nx + 6.5, 0, front - 3],
    rotY: 0.3,
    action: "carve",
    role: "worker",
    carry: "chisel",
  });
  // At the hospital: a patient helped in, the physician at the door.
  cast.add({
    female: false,
    at: [hx, 0, front - 4.4],
    rotY: PI,
    action: "talk",
    role: "official",
    carry: "scroll",
  });
  cast.walk(
    [
      [hx - 10, 0, front - 12],
      [hx - 0.8, 0, front - 5.2],
    ],
    { female: false, speed: 0.3, carry: "staff" },
  );
  cast.walk(
    [
      [hx - 9.4, 0, front - 12.4],
      [hx + 0.2, 0, front - 5.6],
    ],
    { female: false, speed: 0.3, role: "worker" },
  );
  const x = aside(b, 1229);
  trades.hawker(x, [nx - 9, 0, front - 10], 0.5);
  trades.elders(x, [hx + 7, 0, front - 6], 0, 2, true);
  fire(b, torchStand([nx - 3.6, 0, front - 2.6], 2.0), 0.3, true);
  fire(b, torchStand([nx + 3.6, 0, front - 2.6], 2.0), 0.3, false);
  dog(b, [nx + 14, 0, front - 12]);
  return finish(b);
}

/**
 * The temples on the mound at the end of the 4th millennium BC: people
 * bringing grain to the store rooms to be measured out and sealed, the
 * official sealing the jars, offerings burning before the temple, children
 * and goats on the lower terrace.
 */
export function mudbrickLife(spec: MudbrickSpec, era: Era): SceneLife {
  const b = make(era, 3350);
  const { cast, rand } = b;
  const T = spec.terrace;
  // Up the stair from the lower terrace, with baskets of grain.
  for (let i = 0; i < 6; i += 1)
    cast.walk(
      [
        [-0.8 + (i % 2) * 1.6, T * 0.5, -20 + i * 0.3],
        [-0.8 + (i % 2) * 1.6, T * 0.5, -12.9],
        [-0.8 + (i % 2) * 1.6, T, -10.2],
        [-0.8 + (i % 2) * 1.6, T, -9.4],
        [-0.8 + (i % 2) * 1.6, T, -4 - i * 0.3],
        [-0.8 + (i % 2) * 1.6, T, -9.4],
        [-0.8 + (i % 2) * 1.6, T, -10.2],
        [-0.8 + (i % 2) * 1.6, T * 0.5, -12.9],
      ],
      { carry: "basket", speed: 0.45 + rand() * 0.2, female: i % 3 === 1 },
    );
  // The official sealing the jars before the store rooms.
  b.props.push(...jar([-20, T, -10 + 0.2], 0.9));
  b.props.push(...jar([-19, T, -10 + 0.3], 1));
  cast.add({ at: [-18, T, -9.6], rotY: PI, action: "point", role: "official" });
  cast.add({
    at: [-16.6, T, -9.5],
    rotY: -PI / 2,
    action: "talk",
    role: "worker",
    carry: "basket",
  });
  // Offerings burning before the temple.
  const az = 12 - 7 - 2.2;
  fire(b, altar([12, T, az], 1.2, 0.9, 0.9), 0.6, true, true);
  cast.add({ at: [12, T, az - 1.2], rotY: 0, action: "pray", role: "priest" });
  for (let i = 0; i < 4; i += 1)
    cast.add({
      at: [9 + i * 2, T, az - 3],
      rotY: 0,
      action: i % 2 ? "pray" : "stand",
      female: i === 1,
    });
  // On the lower terrace: a woman grinding, children, goats.
  cast.add({ at: [-12, T * 0.5, -18], rotY: 0.6, action: "tend", carry: "basket" });
  cast.add({ at: [8, T * 0.5, -19], rotY: 0, action: "run", role: "child" });
  flock(b, "goat", [14, T * 0.5, -17], 5, 2.5);
  const x = aside(b, 3351);
  trades.potter(x, [-6, T * 0.5, -20], 0.2);
  dog(b, [5, T * 0.5, -21]);
  return finish(b);
}

/**
 * A feast day at the Sphinx Gate: a procession coming up the mound with
 * offerings and a bull for the god, musicians with them, the gatekeeper and
 * the guards at the jambs, a fire burning before the gate.
 */
export function sphinxGateLife(spec: SphinxGateSpec, era: Era): SceneLife {
  const b = make(era, 1430);
  const { cast, rand } = b;
  const L = sphinxGateLayout(spec);
  for (let i = 0; i < 8; i += 1) {
    const x = (i % 2 ? 0.8 : -0.8) + (rand() - 0.5) * 0.3;
    cast.walk(
      [
        [x, 0, -26 + i * 0.9],
        [x, 0, -3.2],
        [x * 0.5, 0, 6],
      ],
      {
        speed: 0.4,
        ...(i % 3 === 0
          ? { carry: "basket" as const }
          : i % 3 === 1
            ? { carry: "jar" as const }
            : {}),
        female: i % 4 === 1,
      },
    );
  }
  animal(b, "ox", [1.6, 0, -11], 0, "walk", {
    route: [
      [1.6, 0, -24],
      [1.6, 0, -5],
    ],
    speed: 0.35,
  });
  cast.add({
    at: [-L.jx - 2.4, 0, -2.2],
    rotY: 0.3,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });
  cast.add({
    at: [L.jx + 2.4, 0, -2.2],
    rotY: -0.3,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });
  cast.add({ at: [-2.6, 0, -6], rotY: 0.2, action: "pray", role: "priest" });
  cast.add({ at: [3.4, 0, -7], rotY: -0.6, action: "tend", role: "worker", carry: "staff" });
  fire(b, brazier([-2.6, 0, -4.6], 0.7), 0.4, true, true);
  const x = aside(b, 1431);
  x.cast.add({ at: [L.rowEnd - 1.5, 0, -3.5], rotY: PI, action: "point" });
  x.cast.add({ at: [L.rowEnd - 2.5, 0, -3.8], rotY: PI * 0.8, action: "talk" });
  dog(b, [-6, 0, -12]);
  return finish(b);
}
