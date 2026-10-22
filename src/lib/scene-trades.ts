import type { Part, Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAnimal as animal,
  lifeBox as box,
  lifeBrazier as brazier,
  lifeCyl as cyl,
  lifeDecor as decor,
  lifeFire as fire,
  lifeJar as jar,
  lifeLoft as loft,
  lifeSmallAmphora as smallAmphora,
  lifeStoneBench as stoneBench,
  lifeTable as table,
  type Animal,
  type Carry,
  type LifeBuilder as Builder,
  type LifeRole as Role,
  type Look,
  type Person,
} from "@/lib/scene-life";

/**
 * The trades and pastimes of a street: each a person (or a few) and the
 * furniture they work at, set down at a point and turned to face `rotY`
 * (their own +z, the way `scene-life` turns everything). The scenes call
 * these through a builder from `aside`, so whatever they add takes none of
 * the scene's own dice and nobody already there moves.
 *
 * What each one shows follows the evidence of its period: the potter's kick
 * wheel and the warp-weighted loom of the vase paintings and the loom
 * weights found everywhere; the wax tablet and stylus; the hand balance of
 * the market inspectors; the domed bread oven of Pompeii and Ephesus; the
 * mallet and chisel of the masons' reliefs; the ard and its yoke of oxen.
 */

const TAU = Math.PI * 2;

/** A local point turned by `rotY` about `at`, the way three.js turns a part. */
export const turn = (at: Vec3, rotY: number, x: number, y: number, z: number): Vec3 => [
  at[0] + x * Math.cos(rotY) + z * Math.sin(rotY),
  at[1] + y,
  at[2] - x * Math.sin(rotY) + z * Math.cos(rotY),
];

/** The turn that points a figure's +z down the direction (dx, dz). */
export const facing = (dx: number, dz: number) => Math.atan2(dx, dz);

/** An apron, a cap: what each trade wore to work. */
const APRON = { leather: 0x6b4a30, linen: 0xd9cdb2, clay: 0x9a7a5a, dark: 0x4e3a2a };

type Opts = { role?: Role; female?: boolean; outfit?: Partial<Look> };

const who = (o: Opts | undefined, fallback: Opts): Opts => ({ ...fallback, ...(o ?? {}) });

/* ------------------------------------------------------------------ *
 * Crafts
 * ------------------------------------------------------------------ */

/** A potter at the kick wheel on a low stool, finished pots drying on a board beside him. */
export function potter(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  b.props.push(box("timber", at, [0.34, 0.3, 0.3], rotY));
  const wheel = turn(at, rotY, 0, 0, 0.52);
  b.props.push(cyl("timber", wheel, 0.3, 0.3, 0.06, 14));
  b.props.push(cyl("timber", [wheel[0], wheel[1] + 0.06, wheel[2]], 0.035, 0.035, 0.3, 6));
  b.props.push(cyl("timber", [wheel[0], wheel[1] + 0.36, wheel[2]], 0.2, 0.2, 0.04, 14));
  b.props.push(
    loft(
      "terracotta",
      [wheel[0], wheel[1] + 0.4, wheel[2]],
      [
        [0, 0.07],
        [0.08, 0.1],
        [0.16, 0.085],
        [0.21, 0.05],
        [0.23, 0.055],
      ],
    ),
  );
  // The board of pots drying in the shade.
  const board = turn(at, rotY, 0.85, 0, 0.15);
  b.props.push(box("timber", board, [0.32, 0.42, 1.0], rotY));
  for (let i = 0; i < 3; i += 1)
    b.props.push(...jar(turn(board, rotY, 0, 0.42, -0.32 + i * 0.32), 0.24 + (i % 2) * 0.04));
  const opts = who(o, { role: "worker", outfit: { apron: APRON.clay } });
  return b.cast.add({ ...opts, at: [at[0], at[1] + 0.3, at[2]], rotY, action: "pot" });
}

/** A warp-weighted loom against the wall, and the weaver at it. */
export function loomWeaver(
  b: Builder,
  at: Vec3,
  rotY: number,
  cloth: Part["material"] = "paintBlue",
  o?: Opts,
): Person {
  const c = turn(at, rotY, 0, 0, 0.55);
  for (const side of [-1, 1])
    b.props.push(box("timber", turn(c, rotY, side * 0.72, 0, 0), [0.08, 2.0, 0.08], rotY));
  b.props.push(box("timber", turn(c, rotY, 0, 1.88, 0), [1.6, 0.09, 0.1], rotY));
  // What is woven hangs from the beam; the warp below it, the weights at its foot.
  b.props.push(box(cloth, turn(c, rotY, 0, 1.2, 0), [1.3, 0.66, 0.02], rotY));
  b.props.push(box("linen", turn(c, rotY, 0, 0.55, 0), [1.3, 0.65, 0.012], rotY));
  b.props.push(box("timber", turn(c, rotY, 0, 1.15, 0.04), [1.4, 0.04, 0.04], rotY));
  for (let i = 0; i < 7; i += 1)
    b.props.push(cyl("terracotta", turn(c, rotY, -0.6 + i * 0.2, 0.42, 0.03), 0.04, 0.05, 0.1, 6));
  const opts = who(o, { female: true });
  return b.cast.add({ ...opts, at, rotY, action: "weave" });
}

/** A scribe, a schoolboy, a clerk: seated on a stool, writing on the tablet on the knee. */
export function scribe(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  b.props.push(box("timber", at, [0.36, 0.42, 0.32], rotY));
  const opts = who(o, {});
  return b.cast.add({
    ...opts,
    at: [at[0], at[1] + 0.42, at[2]],
    rotY,
    action: "write",
    carry: "stylus",
    carryLeft: "tablet",
  });
}

/**
 * A seller weighing out at a table — grain, spice, wool — and a customer
 * across it with an opinion about the price.
 */
export function weigher(b: Builder, at: Vec3, rotY: number, o?: Opts, buyer?: Opts): Person[] {
  const t = turn(at, rotY, 0, 0, 0.6);
  b.props.push(...table(t, 1.3, 0.62, 0.82, rotY));
  for (const [x, m] of [
    [-0.42, "linen"],
    [-0.12, "hide"],
    [0.38, "linen"],
  ] as const) {
    const p = turn(t, rotY, x, 0.82, 0.05);
    b.props.push(cyl(m, p, 0.11, 0.13, 0.22, 9));
    b.props.push(
      cyl(x > 0 ? "paintRed" : "paintGold", [p[0], p[1] + 0.22, p[2]], 0.1, 0.03, 0.06, 9),
    );
  }
  const seller = b.cast.add({
    ...who(o, { role: "worker", outfit: { purse: true } }),
    at,
    rotY,
    action: "weigh",
    carry: "balance",
  });
  const customer = b.cast.add({
    ...who(buyer, { outfit: { purse: true } }),
    at: turn(at, rotY, 0.1, 0, 1.3),
    rotY: rotY + Math.PI,
    action: "haggle",
  });
  return [seller, customer];
}

/** A money-changer at his table, coins stacked in front of him and a strongbox at his feet. */
export function changer(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  b.props.push(box("timber", at, [0.36, 0.42, 0.32], rotY));
  const t = turn(at, rotY, 0, 0, 0.55);
  b.props.push(...table(t, 1.0, 0.56, 0.74, rotY));
  for (let i = 0; i < 6; i += 1) {
    const p = turn(t, rotY, -0.32 + i * 0.13, 0.74, (i % 2) * 0.1 - 0.05);
    b.props.push(
      cyl(i % 3 === 0 ? "bronze" : "paintGold", p, 0.026, 0.026, 0.02 + (i % 3) * 0.018, 8),
    );
  }
  b.props.push(box("timber", turn(at, rotY, 0.55, 0, 0.1), [0.42, 0.3, 0.3], rotY));
  b.props.push(box("bronze", turn(at, rotY, 0.55, 0.3, 0.1), [0.1, 0.03, 0.05], rotY));
  const opts = who(o, { role: "citizen", female: false, outfit: { purse: true } });
  return b.cast.add({ ...opts, at: [at[0], at[1] + 0.42, at[2]], rotY, action: "count" });
}

/** The bakery: the domed oven, its fire, and the baker kneading at the board. */
export function bakery(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  const oven = turn(at, rotY, -1.25, 0, 0.55);
  b.props.push(box("stone", oven, [1.0, 0.55, 1.0], rotY));
  b.props.push(
    loft(
      "terracotta",
      [oven[0], oven[1] + 0.55, oven[2]],
      [
        [0, 0.46],
        [0.2, 0.44],
        [0.38, 0.33],
        [0.52, 0.14],
        [0.56, 0.02],
      ],
    ),
  );
  const mouth = turn(oven, rotY, 0, 0.58, 0.47);
  b.props.push(box("stoneDark", mouth, [0.3, 0.2, 0.06], rotY));
  b.flames.push({ at: turn(oven, rotY, 0, 0.62, 0.5), size: 0.16 });
  const t = turn(at, rotY, 0, 0, 0.55);
  b.props.push(...table(t, 1.2, 0.6, 0.84, rotY));
  for (let i = 0; i < 5; i += 1)
    b.props.push(
      cyl("papyrus", turn(t, rotY, -0.45 + i * 0.16, 0.84, (i % 2) * 0.12), 0.07, 0.08, 0.05, 9),
    );
  b.props.push(cyl("linen", turn(t, rotY, 0.32, 0.84, 0), 0.16, 0.18, 0.06, 10));
  // A basket of the morning's loaves on the ground.
  const basket = turn(at, rotY, 0.9, 0, 0.3);
  b.props.push(cyl("papyrus", basket, 0.2, 0.25, 0.22, 10));
  b.props.push(cyl("hide", [basket[0], basket[1] + 0.2, basket[2]], 0.22, 0.08, 0.08, 10));
  const opts = who(o, { role: "worker", outfit: { apron: APRON.linen } });
  return b.cast.add({ ...opts, at, rotY, action: "knead" });
}

/** The butcher at his block, joints hanging from the rail behind him. */
export function butcher(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  const block = turn(at, rotY, 0, 0, 0.55);
  b.props.push(cyl("timber", block, 0.27, 0.3, 0.74, 12));
  b.props.push(
    box("fadedRed", [block[0], block[1] + 0.74, block[2]], [0.22, 0.06, 0.14], rotY + 0.4),
  );
  const rail = turn(at, rotY, 0, 0, -0.75);
  for (const side of [-1, 1])
    b.props.push(box("timber", turn(rail, rotY, side * 0.75, 0, 0), [0.08, 2.1, 0.08], rotY));
  b.props.push(box("timber", turn(rail, rotY, 0, 1.98, 0), [1.6, 0.07, 0.07], rotY));
  for (let i = 0; i < 3; i += 1) {
    const p = turn(rail, rotY, -0.45 + i * 0.45, 1.25 + (i % 2) * 0.1, 0);
    b.props.push(cyl("bronze", [p[0], p[1] + 0.48, p[2]], 0.006, 0.006, 0.25, 4));
    b.props.push(
      loft("fadedRed", p, [
        [0, 0.04],
        [0.18, 0.11],
        [0.36, 0.09],
        [0.48, 0.03],
      ]),
    );
  }
  const opts = who(o, { role: "worker", outfit: { apron: APRON.linen } });
  return b.cast.add({ ...opts, at, rotY, action: "chop", carry: "cleaver" });
}

/** A fish stall: the catch laid out on a board, and its seller crying it. */
export function fishmonger(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  const t = turn(at, rotY, 0, 0, 0.6);
  b.props.push(...table(t, 1.3, 0.6, 0.78, rotY));
  for (let i = 0; i < 7; i += 1) {
    const p = turn(t, rotY, -0.5 + (i % 4) * 0.3, 0.8, -0.18 + Math.floor(i / 4) * 0.28);
    b.props.push(
      cyl(i % 3 === 0 ? "stoneDark" : "marbleWorn", p, 0.035, 0.008, 0.28, 6, {
        rotX: Math.PI / 2,
        rotY: rotY + 0.3 * ((i % 3) - 1),
      }),
    );
  }
  b.props.push(cyl("papyrus", turn(at, rotY, -0.8, 0, 0.2), 0.2, 0.24, 0.3, 10));
  const opts = who(o, { role: "worker", outfit: { apron: APRON.dark } });
  return b.cast.add({ ...opts, at, rotY, action: "call", carryLeft: "fish" });
}

/** A cook stirring the pot over a brazier. */
export function cook(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  const fireAt = turn(at, rotY, 0, 0, 0.62);
  const made = brazier(fireAt, 0.85);
  b.props.push(...made.parts);
  b.props.push(cyl("bronze", [fireAt[0], fireAt[1] + 0.77, fireAt[2]], 0.21, 0.17, 0.2, 12));
  b.flames.push({ at: [fireAt[0], fireAt[1] + 0.74, fireAt[2]], size: 0.14, smoke: true });
  const opts = who(o, { role: "worker", outfit: { apron: APRON.linen } });
  return b.cast.add({ ...opts, at, rotY, action: "stir", carry: "ladle" });
}

/** A mason dressing a block with mallet and chisel, the chips round his feet. */
export function mason(
  b: Builder,
  at: Vec3,
  rotY: number,
  stone: Part["material"] = "limestone",
  o?: Opts,
): Person {
  const block = turn(at, rotY, 0, 0, 0.66);
  b.props.push(box(stone, block, [0.95, 0.62, 0.62], rotY + 0.05));
  for (let i = 0; i < 7; i += 1)
    b.props.push(
      box(
        stone,
        turn(at, rotY, -0.5 + (i % 4) * 0.33, 0, 0.18 + Math.floor(i / 4) * 0.5 + (i % 2) * 0.12),
        [0.06, 0.03, 0.05],
        i,
      ),
    );
  const opts = who(o, { role: "worker", outfit: { apron: APRON.leather, headwear: "skullcap" } });
  return b.cast.add({ ...opts, at, rotY, action: "carve", carry: "mallet", carryLeft: "chisel" });
}

/** A carpenter sawing a plank across two trestles. */
export function carpenter(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  for (const x of [-0.75, 0.15]) {
    b.props.push(box("timber", turn(at, rotY, x, 0, 0.5), [0.08, 0.62, 0.42], rotY));
  }
  b.props.push(box("timber", turn(at, rotY, -0.15, 0.62, 0.5), [2.0, 0.05, 0.3], rotY));
  b.props.push(box("timber", turn(at, rotY, 0.85, 0, -0.1), [0.9, 0.06, 0.25], rotY + 0.2));
  const opts = who(o, { role: "worker", outfit: { apron: APRON.leather } });
  return b.cast.add({ ...opts, at, rotY, action: "saw", carry: "saw" });
}

/** A sculptor at a figure still in the rough, on its plinth. */
export function sculptor(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  const base = turn(at, rotY, 0, 0, 0.72);
  b.props.push(box("marbleWorn", base, [0.62, 0.36, 0.62], rotY));
  b.props.push(
    loft(
      "marble",
      [base[0], base[1] + 0.36, base[2]],
      [
        [0, 0.24],
        [0.45, 0.2],
        [0.85, 0.2],
        [1.15, 0.22],
        [1.32, 0.12],
        [1.36, 0.06],
        [1.42, 0.1],
        [1.56, 0.09],
        [1.64, 0.02],
      ],
    ),
  );
  const opts = who(o, { role: "worker", outfit: { apron: APRON.linen, headwear: "pilos" } });
  return b.cast.add({ ...opts, at, rotY, action: "carve", carry: "mallet", carryLeft: "chisel" });
}

/**
 * A painter on a trestle platform at a wall, pots of colour beside him.
 * `at` is the floor where the platform stands; the wall is `reach` ahead.
 */
export function painter(b: Builder, at: Vec3, rotY: number, reach = 0.5, o?: Opts): Person {
  const h = 0.55;
  for (const x of [-0.75, 0.75])
    b.props.push(box("timber", turn(at, rotY, x, 0, 0), [0.08, h, 0.46], rotY));
  b.props.push(box("timber", turn(at, rotY, 0, h, 0), [1.8, 0.05, 0.46], rotY));
  for (const [x, m] of [
    [0.45, "paintRed"],
    [0.6, "paintBlue"],
    [0.52, "paintGold"],
  ] as const) {
    const p = turn(at, rotY, x, h + 0.05, x === 0.52 ? -0.12 : 0.08);
    b.props.push(cyl("terracotta", p, 0.05, 0.045, 0.08, 8));
    b.props.push(cyl(m, [p[0], p[1] + 0.08, p[2]], 0.04, 0.04, 0.005, 8));
  }
  void reach;
  const opts = who(o, { role: "worker", outfit: { apron: APRON.linen } });
  return b.cast.add({
    ...opts,
    at: [at[0], at[1] + h + 0.05, at[2]],
    rotY,
    action: "paint",
    carry: "brush",
  });
}

/** Someone sweeping along a path, slowly. */
export function sweeper(b: Builder, route: Vec3[], o?: Opts): Person {
  const opts = who(o, { role: "worker" });
  return b.cast.walk(route, { ...opts, carry: "broom", gait: "sweep", speed: 0.28 });
}

/* ------------------------------------------------------------------ *
 * Children
 * ------------------------------------------------------------------ */

/** Two children squatting over a game of knucklebones, a third looking on. */
export function knucklebones(b: Builder, at: Vec3, rotY: number, watcher = true): Person[] {
  const out: Person[] = [];
  for (const side of [-1, 1]) {
    out.push(
      b.cast.add({
        at: turn(at, rotY, 0, 0, side * 0.36),
        rotY: side < 0 ? rotY : rotY + Math.PI,
        action: "crouch",
        role: "child",
      }),
    );
  }
  for (let i = 0; i < 5; i += 1) {
    b.props.push(
      box(
        "marble",
        turn(at, rotY, -0.08 + (i % 3) * 0.07, 0, -0.05 + (i % 2) * 0.09),
        [0.026, 0.02, 0.034],
        i * 1.3,
      ),
    );
  }
  if (watcher)
    out.push(
      b.cast.add({
        at: turn(at, rotY, 0.62, 0, 0.1),
        rotY: rotY - Math.PI / 2,
        action: "stand",
        role: "child",
      }),
    );
  return out;
}

/** Two children throwing a ball between them. */
export function ballGame(b: Builder, a: Vec3, c: Vec3): Person[] {
  const one = b.cast.add({
    at: a,
    rotY: facing(c[0] - a[0], c[2] - a[2]),
    action: "toss",
    role: "child",
  });
  const two = b.cast.add({
    at: c,
    rotY: facing(a[0] - c[0], a[2] - c[2]),
    action: "toss",
    role: "child",
  });
  b.cast.link(one, two, "ball");
  return [one, two];
}

/** A child running a hoop along with a stick. */
export function hoop(b: Builder, route: Vec3[]): Person {
  return b.cast.walk(route, { role: "child", carry: "hoop", gait: "run", speed: 1.9 });
}

/** Two children chasing each other round a little loop. */
export function chase(b: Builder, centre: Vec3, rx: number, rz: number, rotY = 0): Person[] {
  const loop: Vec3[] = [];
  for (let i = 0; i < 10; i += 1) {
    const a = (TAU * i) / 10;
    loop.push(turn(centre, rotY, Math.cos(a) * rx, 0, Math.sin(a) * rz));
  }
  const first = b.cast.walk(loop, { role: "child", gait: "run", speed: 2.1 });
  const second = b.cast.walk([...loop.slice(2), ...loop.slice(0, 2)], {
    role: "child",
    gait: "run",
    speed: 2.1,
  });
  // A step behind, the whole way round.
  second.phase = first.phase;
  void second;
  return [first, second];
}

/* ------------------------------------------------------------------ *
 * Talk, rest, and the street's other business
 * ------------------------------------------------------------------ */

/** Old men on a bench, talking with their hands. */
export function elders(b: Builder, at: Vec3, rotY: number, count = 2, bench = true): Person[] {
  if (bench) b.props.push(...stoneBench(at, 2.2, rotY));
  const out: Person[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = count === 1 ? 0 : -0.55 + (1.1 * i) / (count - 1);
    out.push(
      b.cast.add({
        at: turn(at, rotY, x, 0.46, 0.04),
        rotY: rotY + (i === 0 ? 0.35 : -0.35),
        action: i === 0 ? "chat" : "sit",
        outfit: { old: true },
      }),
    );
  }
  return out;
}

/** A teacher, or a philosopher, and those listening to him. */
export function lecture(b: Builder, at: Vec3, rotY: number, listeners = 3): Person[] {
  const out: Person[] = [
    b.cast.add({
      at,
      rotY,
      action: "lecture",
      carryLeft: "scroll",
      female: false,
      outfit: { old: true, beard: true, beardStyle: "long", garment: "himation" },
    }),
  ];
  for (let i = 0; i < listeners; i += 1) {
    const a = rotY + (i - (listeners - 1) / 2) * 0.55;
    const p: Vec3 = [at[0] + Math.sin(a) * 1.5, at[1], at[2] + Math.cos(a) * 1.5];
    out.push(
      b.cast.add({
        at: p,
        rotY: facing(at[0] - p[0], at[2] - p[2]),
        action: i === 1 ? "point" : "stand",
      }),
    );
  }
  return out;
}

/** A street musician, a bowl on the ground for the coins. */
export function busker(b: Builder, at: Vec3, rotY: number, instrument: Carry, o?: Opts): Person {
  b.props.push(cyl("terracotta", turn(at, rotY, 0.25, 0, 0.55), 0.1, 0.06, 0.06, 10));
  const opts = who(o, { role: "musician" });
  return b.cast.add({ ...opts, at, rotY, action: "play", carry: instrument });
}

/** A beggar sitting at the foot of a wall, a hand out. */
export function beggar(b: Builder, at: Vec3, rotY: number): Person {
  return b.cast.add({
    at,
    rotY,
    action: "beg",
    carry: "bowl",
    role: "worker",
    outfit: { old: true, main: 0x8a7a62, trim: 0x6e6252 },
  });
}

/** A juggler, and a few who have stopped to watch. */
export function juggler(b: Builder, at: Vec3, rotY: number, watchers = 3): Person[] {
  const out = [
    b.cast.add({
      at,
      rotY,
      action: "juggle",
      carry: "balls",
      role: "worker",
      outfit: { main: 0xc4806c, trim: 0xcfa548 },
    }),
  ];
  for (let i = 0; i < watchers; i += 1) {
    const a = rotY + (i - (watchers - 1) / 2) * 0.6;
    const p: Vec3 = [at[0] + Math.sin(a) * 2.1, at[1], at[2] + Math.cos(a) * 2.1];
    out.push(
      b.cast.add({
        at: p,
        rotY: facing(at[0] - p[0], at[2] - p[2]),
        action: i === 1 ? "cheer" : i === 0 ? "point" : "stand",
        ...(i === 2 ? { role: "child" as const } : {}),
      }),
    );
  }
  return out;
}

/** Dancers turning in a ring to the drum and the pipe. */
export function dancers(b: Builder, centre: Vec3, count = 3, music = true): Person[] {
  const out: Person[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (TAU * i) / count;
    const p: Vec3 = [centre[0] + Math.cos(a) * 0.9, centre[1], centre[2] + Math.sin(a) * 0.9];
    out.push(b.cast.add({ at: p, rotY: a, action: "dance", female: true }));
  }
  if (music) {
    out.push(
      b.cast.add({
        at: [centre[0] + 1.9, centre[1], centre[2] + 0.4],
        rotY: facing(-1.9, -0.4),
        action: "play",
        carry: "drum",
        role: "musician",
        female: true,
      }),
    );
  }
  return out;
}

/** Two wrestlers locked together. */
export function wrestlers(b: Builder, at: Vec3, rotY: number): Person[] {
  const one = b.cast.add({
    at: turn(at, rotY, 0, 0, -0.3),
    rotY,
    action: "wrestle",
    role: "athlete",
  });
  const two = b.cast.add({
    at: turn(at, rotY, 0, 0, 0.3),
    rotY: rotY + Math.PI,
    action: "wrestle",
    role: "athlete",
  });
  // Not in step: one gives as the other pushes.
  two.phase = one.phase + Math.PI;
  return [one, two];
}

/** A file of soldiers marching round a loop, a pace and a half apart. */
export function patrol(
  b: Builder,
  loop: Vec3[],
  count: number,
  shields = true,
  spacing = 1.3,
): Person[] {
  const out: Person[] = [];
  for (let i = 0; i < count; i += 1) {
    const s = b.cast.walk(loop, {
      role: "soldier",
      carry: "spear",
      ...(shields ? { carryLeft: "shield" as const } : {}),
      gait: "march",
      speed: 0.95,
    });
    out.push(s);
  }
  // In step, one behind the other.
  for (let i = 1; i < out.length; i += 1) out[i]!.phase = out[0]!.phase - (i * spacing) / 7;
  return out;
}

/** A mother or a father walking with a child by the hand, round a loop. */
export function handInHand(
  b: Builder,
  loop: Vec3[],
  gap = 0.48,
  adult: Opts = {},
  childToo = true,
): Person[] {
  const off = (route: Vec3[], d: number) => offsetLoop(route, d);
  const grown = b.cast.walk(off(loop, gap / 2), { ...adult, speed: childToo ? 0.75 : 0.95 });
  grown.holds = -1;
  const other = b.cast.walk(
    off(loop, -gap / 2),
    childToo ? { role: "child", speed: 0.75 } : { speed: 0.95, female: !(adult.female ?? false) },
  );
  other.holds = 1;
  other.phase = grown.phase;
  other.speed = grown.speed!;
  return [grown, other];
}

/**
 * A closed loop moved sideways by `d` (to the walker's left when positive),
 * corner by corner along the bisector, so two walkers keep their distance
 * all the way round.
 */
export function offsetLoop(loop: Vec3[], d: number): Vec3[] {
  const n = loop.length;
  return loop.map((p, i) => {
    const prev = loop[(i - 1 + n) % n]!;
    const next = loop[(i + 1) % n]!;
    const t1 = norm(p[0] - prev[0], p[2] - prev[2]);
    const t2 = norm(next[0] - p[0], next[2] - p[2]);
    // The left of a direction (dx, dz) is (dz, -dx) in the turn three.js uses.
    const l1: [number, number] = [t1[1], -t1[0]];
    const l2: [number, number] = [t2[1], -t2[0]];
    const bx = l1[0] + l2[0];
    const bz = l1[1] + l2[1];
    const bl = Math.hypot(bx, bz) || 1;
    const cos = (bx / bl) * l1[0] + (bz / bl) * l1[1];
    const k = d / Math.max(0.4, cos);
    return [p[0] + (bx / bl) * k, p[1], p[2] + (bz / bl) * k];
  });
}

const norm = (x: number, z: number): [number, number] => {
  const l = Math.hypot(x, z) || 1;
  return [x / l, z / l];
};

/** Two porters with an amphora slung from the pole between their shoulders. */
export function porters(b: Builder, loop: Vec3[], gap = 1.7): Person[] {
  const front = b.cast.walk(loop, {
    role: "worker",
    carry: "pole",
    speed: 0.7,
    outfit: { build: "heavy" },
  });
  const back = b.cast.walk(loop, { role: "worker", carry: "pole", speed: 0.7 });
  back.phase = front.phase - gap / 7;
  back.speed = front.speed!;
  b.cast.link(front, back, "pole");
  return [front, back];
}

/**
 * A ploughman behind his yoke of oxen, going round the field. The oxen and
 * the man share one loop, so the ard's beam always reaches the yoke.
 */
export function ploughing(b: Builder, loop: Vec3[], speed = 0.6): { man: Person; oxen: Animal[] } {
  const ahead = 2.6;
  const oxen: Animal[] = [];
  for (const side of [-1, 1]) {
    const route = offsetLoop(loop, side * 0.55);
    oxen.push(
      animal(b, "ox", route[0]!, 0, "walk", {
        route,
        speed,
        colour: side < 0 ? 0xd8ccb4 : 0x8a6a48,
      }),
    );
  }
  oxen[1]!.phase = oxen[0]!.phase;
  const man = b.cast.walk(loop, {
    role: "worker",
    carry: "plough",
    gait: "plough",
    speed,
    outfit: { headwear: "pilos" },
  });
  // The man walks `ahead` metres behind the yoke: animals run on phase × 5, people on phase × 7.
  man.phase = (oxen[0]!.phase * 5 - ahead) / 7;
  return { man, oxen };
}

/** A shepherd leaning on his crook by his flock. */
export function shepherd(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  const opts = who(o, { role: "worker", outfit: { bag: 0x6b4a30 } });
  return b.cast.add({ ...opts, at, rotY, action: "stand", carry: "crook" });
}

/** A quern on the ground and the woman kneeling at it. */
export function grinder(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  const q = turn(at, rotY, 0, 0, 0.5);
  b.props.push(box("limestone", q, [0.42, 0.13, 0.62], rotY));
  b.props.push(box("stone", turn(q, rotY, 0, 0.13, 0.05), [0.3, 0.06, 0.14], rotY + Math.PI / 2));
  b.props.push(cyl("papyrus", turn(at, rotY, 0.55, 0, 0.35), 0.16, 0.2, 0.18, 9));
  const opts = who(o, { female: true });
  return b.cast.add({ ...opts, at, rotY, action: "grind" });
}

/** Somebody stopped to look up at a building, or pointing something out on it. */
export function gazer(b: Builder, at: Vec3, target: Vec3, o?: Opts, pointing = false): Person {
  const opts = who(o, {});
  return b.cast.add({
    ...opts,
    at,
    rotY: facing(target[0] - at[0], target[2] - at[2]),
    action: pointing ? "point" : "gaze",
  });
}

/** A seller crying wares beside a basket, with a buyer on the way. */
export function hawker(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  b.props.push(cyl("papyrus", turn(at, rotY, 0.45, 0, 0.2), 0.18, 0.23, 0.26, 10));
  b.props.push(cyl("foliage", turn(at, rotY, 0.45, 0.24, 0.2), 0.19, 0.06, 0.08, 9));
  const opts = who(o, { role: "worker" });
  return b.cast.add({ ...opts, at, rotY, action: "call" });
}

/** Garden beds and a monk or a farmer hoeing between them. */
export function garden(b: Builder, at: Vec3, rotY: number, o?: Opts): Person {
  for (const x of [-0.75, 0.75]) {
    const bed = turn(at, rotY, x, 0, 0.6);
    b.props.push(box("hide", bed, [0.8, 0.1, 1.8], rotY));
    for (let i = 0; i < 4; i += 1)
      b.props.push(
        decor({
          kind: "loft",
          material: "foliage",
          at: turn(bed, rotY, 0, 0.1, -0.6 + i * 0.4),
          rotY: 0,
          sections: [
            { c: [0, 0, 0], rx: 0.08, ry: 0.08 },
            { c: [0, 0.1, 0], rx: 0.16, ry: 0.16 },
            { c: [0, 0.2, 0], rx: 0.03, ry: 0.03 },
          ],
        }),
      );
  }
  const opts = who(o, { role: "worker" });
  return b.cast.add({ ...opts, at, rotY, action: "hoe", carry: "hoe" });
}

/** A water jar, the amphora a porter set down: small things for a scene's corners. */
export function setDown(b: Builder, at: Vec3, kind: "amphora" | "jar", scale = 1) {
  b.props.push(...(kind === "amphora" ? smallAmphora(at, scale) : jar(at, scale)));
}

export { fire as tradeFire };
