import {
  horseStatue,
  ornateAltar,
  stadiumLayout,
  type FigureIdentity,
  type FigurePaint,
  type Material,
  type Part,
  type Vec3,
} from "@/lib/reconstruction-parts";
import type { ScanId } from "@/lib/scans";
import type {
  GreatAltarSpec,
  IonicDipterosSpec,
  MausoleumSpec,
  NeolithicEnclosureSpec,
  PeristyleHouseSpec,
  Reconstruction,
  RomanFacadeSpec,
  RomanTheatreSpec,
  StadiumSpec,
  TumulusSanctuarySpec,
} from "@/lib/reconstructions";

/**
 * The life of a place, as opposed to its stone.
 *
 * `reconstruction-parts.ts` builds what was measured; this module fills it with
 * what was not — the people, fires and furniture that a building existed for.
 * None of it is a claim about a particular day: the dress, the offerings and
 * the lamps follow what each period wore and used, and where they stand
 * follows the building, but the scene itself is an illustration. That is why
 * it lives apart from the measured parts, never enters the bounding box, never
 * goes into an exported model, and can be switched off in the viewer.
 *
 * Renderer-free, like the parts module, so the tests can check that nobody is
 * standing inside a wall or floating over a stair.
 */

/** Who the people are, which decides what they wear. */
export type Era = "neolithic" | "hellenistic" | "roman" | "commagene" | "carian";

/**
 * The garment, as the renderer builds it.
 *
 * `chiton`, `peplos`, `himation` and `toga` are the long Greek and Roman
 * dress; `tunic` is the knee-length working tunic, `exomis` the same pinned on
 * one shoulder; `persian` the sleeved coat, trousers and cloak of Commagene and
 * its priests; `hide` the skins of the Neolithic; `armour` a hoplite's
 * cuirass and kilt; `robe` a long priestly gown.
 */
export type Garment =
  | "chiton"
  | "peplos"
  | "himation"
  | "toga"
  | "tunic"
  | "exomis"
  | "persian"
  | "hide"
  | "armour"
  | "robe";

export type Headwear =
  "veil" | "wreath" | "petasos" | "phrygian" | "tiara" | "helmet" | "mask" | "fillet" | "polos";

/** What a person carries, and where the renderer puts it. */
export type Carry =
  | "amphora"
  | "scroll"
  | "basket"
  | "torch"
  | "spear"
  | "offering"
  | "lyre"
  | "aulos"
  | "staff"
  | "tablet"
  | "incense"
  | "jar"
  | "chisel"
  | "shield"
  /** The bundle of rods a Persian priest held before him at the altar. */
  | "barsom";

/**
 * What they are doing. `walk` follows `route`; the others stay where they are
 * and move the way that activity moves — a speaker's hand, a reader's bowed
 * head, the raised arms of prayer, an actor playing to the back row.
 */
export type Action =
  | "stand"
  | "walk"
  | "talk"
  | "sit"
  | "read"
  | "pray"
  | "perform"
  | "tend"
  | "kneel"
  | "run"
  | "play"
  /** Astride a horse; `at` is the horse's back. */
  | "ride"
  /** Applauding: hands brought together again and again. */
  | "cheer"
  /** Standing in a chariot, the reins in both hands. */
  | "drive";

export type Look = {
  garment: Garment;
  /** The main cloth. */
  main: number;
  /** The mantle, the cloak, a border: the second colour. */
  trim: number;
  hair: number;
  skin: number;
  female: boolean;
  beard: boolean;
  headwear?: Headwear;
};

export type Person = {
  /** Where their feet are, or the seat under them when seated. */
  at: Vec3;
  rotY: number;
  height: number;
  look: Look;
  action: Action;
  carry?: Carry;
  /** In the other hand, or on the arm: a shield with a spear. */
  carryLeft?: Carry;
  /**
   * A walk, as a loop of points: the walker goes round it for ever. Two points
   * make a there-and-back. The first point is where they start.
   */
  route?: Vec3[];
  /** Metres a second along the route. */
  speed?: number;
  /** Offsets their animation, so a crowd does not move in step. */
  phase: number;
};

/** A fire: a torch, a lamp, a brazier, an altar. */
export type Flame = {
  at: Vec3;
  /** Height of the flame in metres. */
  size: number;
  /**
   * Whether it really lights the scene at night. Lights are expensive, so a
   * scene asks for a handful and the renderer keeps the strongest of those.
   */
  light?: boolean;
  /** A column of smoke over it: an altar, a sacrifice. */
  smoke?: boolean;
};

/** A seat in a crowd, drawn as one instance of a seated spectator. */
export type Seat = { at: Vec3; rotY: number; cloth: number; skin: number; hair: number };

export type Species = "horse" | "ox" | "dog" | "goat" | "sheep" | "donkey" | "gazelle";

/**
 * An animal. Horses for the races, the white ox garlanded for the altar,
 * goats and sheep on the mountain, a donkey with its panniers, the dogs
 * that every ancient town had underfoot, gazelle on the Harran plain.
 */
export type Animal = {
  species: Species;
  at: Vec3;
  rotY: number;
  /** Coat colour. */
  colour: number;
  action: "stand" | "walk" | "gallop" | "graze" | "lie";
  route?: Vec3[];
  speed?: number;
  phase: number;
  /** A garland on the horns, or a saddle cloth: the second colour. */
  dressed?: number;
  /** Somebody on its back. */
  rider?: Look;
  /** Panniers slung across a donkey. */
  load?: boolean;
};

/** A racing chariot: a car on two wheels, its driver, and its team. */
export type Chariot = {
  route: Vec3[];
  speed: number;
  phase: number;
  team: 2 | 4;
  horses: number[];
  driver: Look;
  /** The car's painted colour: the colour of the faction. */
  colour: number;
};

export type SceneLife = {
  era: Era;
  people: Person[];
  flames: Flame[];
  /** Furniture and offerings: ordinary parts, all `decor`. */
  props: Part[];
  crowd: Seat[];
  animals: Animal[];
  chariots: Chariot[];
  /**
   * Where the action is that a crowd follows: the crowd claps hardest where
   * the racers are passing. Empty for a crowd that cheers at random.
   */
  cheerFor?: "racers";
};

/* ------------------------------------------------------------------ *
 * Colour: what the dyes of each period actually gave
 * ------------------------------------------------------------------ */

/**
 * Undyed wool and linen were what most people wore; colour cost money. Madder
 * gave the reds, weld and saffron the yellows, woad the blues, and the murex
 * the purple only the rich could afford. These are those colours, a little
 * faded, as cloth that has been washed and worn is.
 */
const DYE = {
  linen: 0xe8dfca,
  wool: 0xd6c8a8,
  oat: 0xc4b08a,
  madder: 0xa4462f,
  rose: 0xc4806c,
  weld: 0xcfa548,
  ochre: 0xb3843e,
  woad: 0x4b6a8f,
  sky: 0x87a0ba,
  purple: 0x6a2f5d,
  green: 0x6f7d4c,
  brown: 0x7a5a3c,
  grey: 0x7d776c,
  white: 0xf0ece2,
  black: 0x3b3833,
};

const SKIN = [0xc99b75, 0xb7865f, 0xd8ad88, 0xa0704c, 0xc08a62, 0x8f603f];
const HAIR = [0x2a1d14, 0x3d2a1a, 0x553722, 0x1b1511, 0x6e4a2c, 0x8c8478];

const GREEK_CLOTH = [
  DYE.linen,
  DYE.wool,
  DYE.oat,
  DYE.madder,
  DYE.rose,
  DYE.weld,
  DYE.woad,
  DYE.sky,
  DYE.green,
  DYE.ochre,
];
const WORK_CLOTH = [DYE.wool, DYE.oat, DYE.brown, DYE.grey, DYE.ochre, DYE.green];
const HIDE = [0x7a5a3c, 0x8a6a48, 0x6b4a30, 0x9a7a55, 0x5e4430];

/** A repeatable random source, so a scene is the same scene every visit. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

type Rand = () => number;
const pick = <T>(rand: Rand, list: readonly T[]): T => list[Math.floor(rand() * list.length)]!;
const between = (rand: Rand, a: number, b: number) => a + rand() * (b - a);

const TAU = Math.PI * 2;
/** The turn that points a figure's +z down the direction (dx, dz). */
const facing = (dx: number, dz: number) => Math.atan2(dx, dz);

/* ------------------------------------------------------------------ *
 * People
 * ------------------------------------------------------------------ */

type Role =
  | "citizen"
  | "worker"
  | "priest"
  | "priestess"
  | "soldier"
  | "actor"
  | "musician"
  | "athlete"
  | "child"
  | "mourner"
  | "official";

/**
 * Dress someone for their period and their part in the scene. The rules are
 * broad on purpose — a Roman in a provincial city mostly wore a tunic and a
 * Greek mantle, not a toga; a woman went out with her mantle drawn over her
 * head; a Commagenian priest wore the Persian dress the king's law laid down
 * for him — and within them every choice is a die roll, so no two people in
 * a crowd are dressed alike.
 */
function dress(rand: Rand, era: Era, role: Role, female?: boolean): Look {
  const isFemale =
    female ??
    (role === "priestess"
      ? true
      : role === "soldier" || role === "athlete" || role === "actor"
        ? false
        : rand() < 0.42);
  const skin = pick(rand, SKIN);
  const hair = rand() < 0.12 && role !== "child" ? HAIR[5]! : pick(rand, HAIR.slice(0, 5));
  const base = { skin, hair, female: isFemale, beard: false } as const;

  if (era === "neolithic") {
    return {
      ...base,
      garment: "hide",
      main: pick(rand, HIDE),
      // A fox pelt at the belt, as carved on the central pillars here.
      trim: rand() < 0.5 ? 0xb4652e : pick(rand, HIDE),
      hair: pick(rand, HAIR.slice(0, 4)),
      beard: !isFemale && rand() < 0.7,
    };
  }

  if (era === "commagene" && role !== "child" && role !== "worker") {
    const priest = role === "priest";
    return {
      ...base,
      female: priest ? false : isFemale,
      garment: "persian",
      main: priest ? pick(rand, [DYE.purple, DYE.madder, DYE.white]) : pick(rand, GREEK_CLOTH),
      trim: priest ? DYE.weld : pick(rand, [DYE.madder, DYE.woad, DYE.weld, DYE.purple]),
      beard: !isFemale && rand() < 0.75,
      headwear: priest ? (rand() < 0.5 ? "tiara" : "phrygian") : isFemale ? "veil" : "phrygian",
    };
  }

  switch (role) {
    case "worker":
      return {
        ...base,
        female: false,
        garment: rand() < 0.5 ? "exomis" : "tunic",
        main: pick(rand, WORK_CLOTH),
        trim: pick(rand, WORK_CLOTH),
        beard: rand() < 0.5,
        ...(rand() < 0.3 ? { headwear: "petasos" as const } : {}),
      };
    case "priest":
      return {
        ...base,
        female: false,
        garment: era === "roman" ? "toga" : "robe",
        main: DYE.white,
        trim: era === "roman" ? DYE.purple : DYE.weld,
        beard: rand() < 0.7,
        headwear: era === "roman" ? "veil" : "wreath",
      };
    case "priestess":
      return {
        ...base,
        female: true,
        garment: "chiton",
        main: DYE.white,
        trim: pick(rand, [DYE.weld, DYE.purple, DYE.sky]),
        headwear: rand() < 0.5 ? "wreath" : "fillet",
      };
    case "soldier":
      return {
        ...base,
        female: false,
        garment: "armour",
        main: 0xa8843e,
        trim: DYE.madder,
        beard: rand() < 0.6,
        headwear: "helmet",
      };
    case "actor":
      return {
        ...base,
        female: false,
        garment: "chiton",
        main: pick(rand, [DYE.madder, DYE.weld, DYE.woad, DYE.purple, DYE.green]),
        trim: pick(rand, [DYE.weld, DYE.white, DYE.black]),
        headwear: "mask",
      };
    case "musician":
      return {
        ...base,
        garment: "chiton",
        main: pick(rand, [DYE.white, DYE.rose, DYE.sky]),
        trim: pick(rand, [DYE.weld, DYE.purple]),
        beard: !isFemale && rand() < 0.4,
        headwear: "wreath",
      };
    case "athlete":
      return {
        ...base,
        female: false,
        garment: "exomis",
        main: DYE.white,
        trim: DYE.white,
        beard: rand() < 0.3,
      };
    case "child":
      return {
        ...base,
        garment: "tunic",
        main: pick(rand, [DYE.linen, DYE.rose, DYE.sky, DYE.weld, DYE.wool]),
        trim: DYE.linen,
        beard: false,
      };
    case "mourner":
      return {
        ...base,
        garment: isFemale ? "peplos" : "himation",
        main: pick(rand, [DYE.black, DYE.grey, DYE.brown]),
        trim: pick(rand, [DYE.black, DYE.grey]),
        beard: !isFemale && rand() < 0.7,
        ...(isFemale ? { headwear: "veil" as const } : {}),
      };
    case "official":
      return {
        ...base,
        female: false,
        garment: era === "roman" ? "toga" : "himation",
        main: DYE.white,
        trim: DYE.purple,
        beard: rand() < 0.6,
        ...(era !== "roman" ? { headwear: "wreath" as const } : {}),
      };
    default: {
      if (isFemale) {
        return {
          ...base,
          garment: rand() < 0.55 ? "peplos" : "chiton",
          main: pick(rand, GREEK_CLOTH),
          trim: pick(rand, GREEK_CLOTH),
          ...(rand() < 0.55 ? { headwear: "veil" as const } : {}),
        };
      }
      // A citizen of a Roman city in Asia wore the Greek mantle over a tunic;
      // the toga was for the few with Roman citizenship, on formal days.
      const toga = era === "roman" && rand() < 0.18;
      const mantle = rand() < 0.65;
      return {
        ...base,
        garment: toga ? "toga" : mantle ? "himation" : "tunic",
        main: toga ? DYE.white : pick(rand, GREEK_CLOTH),
        trim: toga ? (rand() < 0.3 ? DYE.purple : DYE.white) : pick(rand, GREEK_CLOTH),
        beard: rand() < (era === "roman" ? 0.55 : 0.6),
        ...(rand() < 0.08 ? { headwear: "petasos" as const } : {}),
      };
    }
  }
}

type PersonInit = Omit<Person, "look" | "height" | "phase"> & {
  role?: Role;
  female?: boolean;
  height?: number;
};

class Cast {
  people: Person[] = [];
  constructor(
    private rand: Rand,
    private era: Era,
  ) {}
  add(init: PersonInit): Person {
    const { role = "citizen", female, height, ...rest } = init;
    const look = dress(this.rand, this.era, role, female);
    const person: Person = {
      ...rest,
      look,
      height:
        height ??
        (role === "child"
          ? between(this.rand, 1.05, 1.3)
          : look.female
            ? between(this.rand, 1.52, 1.68)
            : between(this.rand, 1.62, 1.82)),
      phase: this.rand() * TAU,
    };
    this.people.push(person);
    return person;
  }
  /** Someone walking a loop, starting at its first point. */
  walk(route: Vec3[], init: Omit<PersonInit, "at" | "rotY" | "action" | "route"> = {}) {
    const [a, b] = [route[0]!, route[1] ?? route[0]!];
    return this.add({
      ...init,
      at: a,
      rotY: facing(b[0] - a[0], b[2] - a[2]),
      action: init.carry === "torch" || init.role !== "athlete" ? "walk" : "run",
      route,
      speed: init.speed ?? between(this.rand, 0.9, 1.35),
    });
  }
  /** Two or three people facing each other in conversation. */
  group(centre: Vec3, count: number, radius = 0.75, role: Role = "citizen") {
    const start = this.rand() * TAU;
    for (let i = 0; i < count; i += 1) {
      const a = start + (TAU * i) / count + between(this.rand, -0.25, 0.25);
      const at: Vec3 = [
        centre[0] + Math.cos(a) * radius,
        centre[1],
        centre[2] + Math.sin(a) * radius,
      ];
      this.add({
        at,
        rotY: facing(centre[0] - at[0], centre[2] - at[2]),
        action: i === 0 ? "talk" : this.rand() < 0.5 ? "talk" : "stand",
        role,
      });
    }
  }
}

/* ------------------------------------------------------------------ *
 * Props, built from the same primitives as the buildings
 * ------------------------------------------------------------------ */

/**
 * Statues for which a real scan of an ancient statue of the same type exists
 * stand in that scan rather than in the procedural figure: Athena in the
 * Minerva of Arezzo, Zeus in the bearded Neptune of Nîmes, and a togate
 * emperor or magistrate in the Arringatore. Bronze and gilt figures keep their
 * own geometry, since the scans are of marble and plaster.
 */
const SCAN_OF: Partial<Record<string, ScanId>> = {
  Athena: "athena-arezzo",
  Zeus: "neptune",
  Emperor: "arringatore",
};

const decor = (part: Part): Part => {
  const scan =
    part.kind === "figure" &&
    !part.scan &&
    (part.material === "marble" || part.material === "marbleWorn") &&
    part.identity
      ? SCAN_OF[part.identity.name]
      : undefined;
  return { ...part, decor: true, ...(scan ? { scan: { id: scan } } : {}) };
};

const box = (material: Material, at: Vec3, size: Vec3, rotY = 0): Part =>
  decor({ kind: "box", material, at, size, rotY });

const cyl = (
  material: Material,
  at: Vec3,
  rBottom: number,
  rTop: number,
  height: number,
  segments = 12,
  extra: { rotX?: number; rotY?: number } = {},
): Part =>
  decor({
    kind: "cylinder",
    material,
    at,
    radiusBottom: rBottom,
    radiusTop: rTop,
    height,
    segments,
    ...extra,
  });

const loft = (material: Material, at: Vec3, sections: [number, number][]): Part =>
  decor({
    kind: "loft",
    material,
    at,
    rotY: 0,
    sections: sections.map(([y, r]) => ({ c: [0, y, 0] as Vec3, rx: r, ry: r })),
  });

/** A local point turned by `rotY` about `at`, the way three.js turns a part. */
const turn = (at: Vec3, rotY: number, x: number, y: number, z: number): Vec3 => [
  at[0] + x * Math.cos(rotY) + z * Math.sin(rotY),
  at[1] + y,
  at[2] - x * Math.sin(rotY) + z * Math.cos(rotY),
];

/** A transport amphora, standing on its foot (or leant in a stand). */
function amphora(at: Vec3, scale = 1): Part[] {
  const s = scale;
  return [
    loft("terracotta", at, [
      [0.0 * s, 0.025 * s],
      [0.12 * s, 0.07 * s],
      [0.35 * s, 0.17 * s],
      [0.52 * s, 0.18 * s],
      [0.66 * s, 0.12 * s],
      [0.74 * s, 0.05 * s],
      [0.86 * s, 0.045 * s],
      [0.9 * s, 0.055 * s],
    ]),
  ];
}

/** A wide storage jar, a pithos, or a household hydria at smaller scale. */
function jar(at: Vec3, scale = 1): Part[] {
  const s = scale;
  return [
    loft("terracotta", at, [
      [0, 0.12 * s],
      [0.1 * s, 0.22 * s],
      [0.35 * s, 0.3 * s],
      [0.6 * s, 0.26 * s],
      [0.74 * s, 0.14 * s],
      [0.8 * s, 0.15 * s],
    ]),
  ];
}

/** A torch on a bronze stand, and where its flame burns. */
function torchStand(at: Vec3, height = 1.9): { parts: Part[]; flame: Vec3 } {
  return {
    parts: [
      cyl("bronze", at, 0.22, 0.18, 0.06, 12),
      cyl("bronze", [at[0], at[1] + 0.06, at[2]], 0.035, 0.03, height - 0.25, 8),
      cyl("bronze", [at[0], at[1] + height - 0.2, at[2]], 0.05, 0.12, 0.2, 10),
    ],
    flame: [at[0], at[1] + height, at[2]],
  };
}

/** A bronze brazier on three legs, coals in the bowl. */
function brazier(at: Vec3, scale = 1): { parts: Part[]; flame: Vec3 } {
  const s = scale;
  const parts: Part[] = [];
  for (let i = 0; i < 3; i += 1) {
    const a = (TAU * i) / 3;
    parts.push(
      cyl(
        "bronze",
        [at[0] + Math.cos(a) * 0.22 * s, at[1], at[2] + Math.sin(a) * 0.22 * s],
        0.025 * s,
        0.03 * s,
        0.75 * s,
        6,
      ),
    );
  }
  parts.push(cyl("bronze", [at[0], at[1] + 0.72 * s, at[2]], 0.16 * s, 0.34 * s, 0.18 * s, 16));
  parts.push(cyl("stoneDark", [at[0], at[1] + 0.84 * s, at[2]], 0.28 * s, 0.28 * s, 0.05 * s, 16));
  return { parts, flame: [at[0], at[1] + 0.9 * s, at[2]] };
}

/** A tall bronze lampstand, a candelabrum, with its oil lamp on top. */
function lampstand(at: Vec3, height = 1.5): { parts: Part[]; flame: Vec3 } {
  return {
    parts: [
      cyl("bronze", at, 0.16, 0.06, 0.12, 10),
      cyl("bronze", [at[0], at[1] + 0.12, at[2]], 0.022, 0.018, height - 0.16, 8),
      cyl("bronze", [at[0], at[1] + height - 0.06, at[2]], 0.12, 0.09, 0.04, 12),
      cyl("terracotta", [at[0], at[1] + height - 0.02, at[2]], 0.06, 0.05, 0.05, 10),
    ],
    flame: [at[0] + 0.05, at[1] + height + 0.05, at[2]],
  };
}

/** A wooden table, square or round, and what is set on it. */
function table(at: Vec3, w: number, d: number, h = 0.75, rotY = 0): Part[] {
  const parts: Part[] = [box("timber", [at[0], at[1] + h - 0.05, at[2]], [w, 0.05, d], rotY)];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      parts.push(
        box(
          "timber",
          turn(at, rotY, sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06)),
          [0.06, h - 0.05, 0.06],
          rotY,
        ),
      );
    }
  }
  return parts;
}

/** A bench. */
function bench(at: Vec3, length: number, rotY = 0): Part[] {
  return [
    box("timber", [at[0], at[1] + 0.4, at[2]], [length, 0.06, 0.36], rotY),
    box("timber", turn(at, rotY, -length / 2 + 0.12, 0, 0), [0.08, 0.4, 0.3], rotY),
    box("timber", turn(at, rotY, length / 2 - 0.12, 0, 0), [0.08, 0.4, 0.3], rotY),
  ];
}

/** A scroll lying on a surface, or a few of them in a pile. */
function scrolls(at: Vec3, count: number, rotY: number, rand: Rand): Part[] {
  const out: Part[] = [];
  for (let i = 0; i < count; i += 1) {
    const p = turn(
      at,
      rotY,
      (i - (count - 1) / 2) * 0.09,
      0.035 + (i % 2) * 0.05,
      between(rand, -0.04, 0.04),
    );
    out.push(
      cyl("papyrus", p, 0.035, 0.035, 0.28, 8, {
        rotX: Math.PI / 2,
        rotY: rotY + Math.PI / 2 + between(rand, -0.2, 0.2),
      }),
    );
  }
  return out;
}

/**
 * The cupboard in a library wall niche: shelves, and the scrolls stacked on
 * them end-on with a coloured tag hanging from each, as the armaria of a Roman
 * library are described and drawn. `out` is the way the niche faces.
 */
function armarium(at: Vec3, width: number, height: number, rotY: number, rand: Rand): Part[] {
  const parts: Part[] = [];
  const shelves = 4;
  const gap = height / shelves;
  // Frame and back board.
  parts.push(box("timber", turn(at, rotY, 0, 0, -0.02), [width, height, 0.04], rotY));
  for (const side of [-1, 1]) {
    parts.push(
      box("timber", turn(at, rotY, side * (width / 2 - 0.03), 0, 0.12), [0.06, height, 0.3], rotY),
    );
  }
  for (let s = 0; s <= shelves; s += 1) {
    parts.push(
      box(
        "timber",
        turn(at, rotY, 0, s * gap - (s === shelves ? 0.04 : 0), 0.12),
        [width, 0.04, 0.3],
        rotY,
      ),
    );
  }
  const tags: Material[] = ["paintRed", "paintBlue", "paintGold", "linen"];
  for (let s = 0; s < shelves; s += 1) {
    const perRow = Math.floor((width - 0.1) / 0.085);
    for (let k = 0; k < perRow; k += 1) {
      for (let layer = 0; layer < 2; layer += 1) {
        if (rand() < 0.12) continue;
        const x = -width / 2 + 0.08 + k * 0.085 + layer * 0.04;
        const y = s * gap + 0.04 + 0.037 + layer * 0.07;
        parts.push(
          cyl("papyrus", turn(at, rotY, x, y, 0.02), 0.035, 0.035, 0.26, 7, {
            rotX: Math.PI / 2,
            rotY,
          }),
        );
        if (rand() < 0.35) {
          parts.push(
            box(pick(rand, tags), turn(at, rotY, x, y - 0.065, 0.28), [0.03, 0.05, 0.005], rotY),
          );
        }
      }
    }
  }
  return parts;
}

/** A tree: a trunk and a few masses of leaf. Laurel, olive or cypress. */
function tree(at: Vec3, kind: "laurel" | "olive" | "cypress", rand: Rand, scale = 1): Part[] {
  const s = scale;
  if (kind === "cypress") {
    return [
      cyl("timber", at, 0.12 * s, 0.1 * s, 0.8 * s, 7),
      loft(
        "foliage",
        [at[0], at[1] + 0.5 * s, at[2]],
        [
          [0, 0.3 * s],
          [1.2 * s, 0.75 * s],
          [3.2 * s, 0.7 * s],
          [5.4 * s, 0.4 * s],
          [6.6 * s, 0.05 * s],
        ],
      ),
    ];
  }
  const trunkH = (kind === "olive" ? 1.4 : 1.8) * s;
  const parts: Part[] = [cyl("timber", at, 0.18 * s, 0.12 * s, trunkH, 7)];
  const masses = kind === "olive" ? 4 : 5;
  for (let i = 0; i < masses; i += 1) {
    const a = rand() * TAU;
    const r = between(rand, 0.3, 0.9) * s;
    const y = at[1] + trunkH + between(rand, -0.3, 1.2) * s;
    const size = between(rand, 0.75, 1.15) * s;
    parts.push(
      decor({
        kind: "loft",
        material: "foliage",
        at: [at[0] + Math.cos(a) * r, y, at[2] + Math.sin(a) * r],
        rotY: 0,
        sections: [
          { c: [0, 0, 0], rx: size * 0.35, ry: size * 0.35 },
          { c: [0, size * 0.45, 0], rx: size, ry: size * 0.9 },
          { c: [0, size * 1.05, 0], rx: size * 0.8, ry: size * 0.7 },
          { c: [0, size * 1.45, 0], rx: size * 0.2, ry: size * 0.2 },
        ],
      }),
    );
  }
  return parts;
}

/** A market stall: a table under a striped awning on four posts. */
function stall(at: Vec3, rotY: number, rand: Rand, goods: "pottery" | "fruit" | "shrines"): Part[] {
  const parts: Part[] = [...table(at, 2.2, 0.9, 0.85, rotY)];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      parts.push(box("timber", turn(at, rotY, sx * 1.15, 0, sz * 0.55), [0.07, 2.3, 0.07], rotY));
    }
  }
  const awning: Material[] = ["paintRed", "linen"];
  for (let i = 0; i < 6; i += 1) {
    parts.push(
      box(
        awning[i % 2]!,
        turn(at, rotY, -1.25 + (i + 0.5) * (2.5 / 6), 2.3, 0),
        [2.5 / 6, 0.04, 1.4],
        rotY,
      ),
    );
  }
  const top = at[1] + 0.85;
  for (let i = 0; i < 6; i += 1) {
    const p = turn([at[0], top, at[2]], rotY, -0.9 + i * 0.36, 0, between(rand, -0.2, 0.2));
    if (goods === "pottery") parts.push(...jar(p, between(rand, 0.28, 0.4)));
    else if (goods === "shrines") {
      // The little silver shrines of the goddess that Ephesian smiths sold.
      parts.push(box("paintGold", p, [0.16, 0.2, 0.1], rotY));
      parts.push(
        decor({
          kind: "prism",
          material: "paintGold",
          at: [p[0], p[1] + 0.2, p[2]],
          size: [0.18, 0.07, 0.1],
          rotY,
        }),
      );
    } else {
      parts.push(cyl("timber", p, 0.17, 0.2, 0.12, 10));
      for (let k = 0; k < 4; k += 1) {
        parts.push(
          decor({
            kind: "loft",
            material: pick(rand, ["paintRed", "paintGold", "foliage"] as const),
            at: [p[0] + between(rand, -0.08, 0.08), p[1] + 0.12, p[2] + between(rand, -0.08, 0.08)],
            rotY: 0,
            sections: [
              { c: [0, 0, 0], rx: 0.02, ry: 0.02 },
              { c: [0, 0.05, 0], rx: 0.055, ry: 0.055 },
              { c: [0, 0.1, 0], rx: 0.02, ry: 0.02 },
            ],
          }),
        );
      }
    }
  }
  return parts;
}

/** A dressed stone altar — garlands, bolsters, fire-tray — and its fire. */
function altar(
  at: Vec3,
  w: number,
  d: number,
  h: number,
  rotY = 0,
): { parts: Part[]; flame: Vec3 } {
  return {
    parts: ornateAltar(at, w, d, h, rotY).map(decor),
    flame: [at[0], at[1] + h * 0.98, at[2]],
  };
}

/* ------------------------------------------------------------------ *
 * The scenes, one per kind of building
 * ------------------------------------------------------------------ */

type Builder = {
  cast: Cast;
  rand: Rand;
  props: Part[];
  flames: Flame[];
  crowd: Seat[];
  animals: Animal[];
  chariots: Chariot[];
  era: Era;
  cheerFor?: "racers";
};

function make(era: Era, seed: number): Builder {
  const rand = seeded(seed);
  return {
    cast: new Cast(rand, era),
    rand,
    props: [],
    flames: [],
    crowd: [],
    animals: [],
    chariots: [],
    era,
  };
}

function finish(b: Builder): SceneLife {
  return {
    era: b.era,
    people: b.cast.people,
    flames: b.flames,
    props: b.props,
    crowd: b.crowd,
    animals: b.animals,
    chariots: b.chariots,
    ...(b.cheerFor ? { cheerFor: b.cheerFor } : {}),
  };
}

const COATS: Record<Species, number[]> = {
  horse: [0x5a3a22, 0x7a4a2a, 0x2a1d14, 0x8a7a6a, 0xd8d0c0, 0x9a6a3a],
  ox: [0xe8e0d0, 0xd8ccb4, 0x8a6a48],
  dog: [0xb08a5a, 0x3a2e24, 0xd0b890, 0x7a5a3a],
  goat: [0x3a2e24, 0x6a4a30, 0xd8cdb8, 0x8a7058],
  sheep: [0xe6dccb, 0xd8ccb4, 0x4a3e34],
  donkey: [0x8a8070, 0x6e6458, 0x9a8e7c],
  gazelle: [0xc49a62, 0xb88a52],
};

/** An animal of the scene, its coat picked from what that kind comes in. */
function animal(
  b: Builder,
  species: Species,
  at: Vec3,
  rotY: number,
  action: Animal["action"],
  extra: Partial<Animal> = {},
): Animal {
  const a: Animal = {
    species,
    at,
    rotY,
    action,
    colour: pick(b.rand, COATS[species]),
    phase: b.rand() * TAU,
    ...extra,
  };
  b.animals.push(a);
  return a;
}

/** A small flock grazing round a point, each head turned its own way. */
function flock(b: Builder, species: Species, centre: Vec3, count: number, radius: number) {
  for (let i = 0; i < count; i += 1) {
    const a = b.rand() * TAU;
    const r = Math.sqrt(b.rand()) * radius;
    animal(
      b,
      species,
      [centre[0] + Math.cos(a) * r, centre[1], centre[2] + Math.sin(a) * r],
      b.rand() * TAU,
      b.rand() < 0.75 ? "graze" : b.rand() < 0.5 ? "lie" : "stand",
    );
  }
}

/** A dog wandering a loop, or asleep where it fell. */
function dog(b: Builder, route: Vec3[] | Vec3) {
  if (Array.isArray(route[0])) {
    const r = route as Vec3[];
    animal(b, "dog", r[0]!, 0, "walk", { route: r, speed: between(b.rand, 0.7, 1.1) });
  } else {
    animal(b, "dog", route as Vec3, b.rand() * TAU, "lie");
  }
}

const fire = (
  b: Builder,
  made: { parts: Part[]; flame: Vec3 },
  size: number,
  light = false,
  smoke = false,
) => {
  b.props.push(...made.parts);
  b.flames.push({ at: made.flame, size, ...(light ? { light } : {}), ...(smoke ? { smoke } : {}) });
};

const seatColour = (rand: Rand, era: Era) =>
  era === "roman" || era === "hellenistic"
    ? rand() < 0.35
      ? pick(rand, [DYE.white, DYE.linen, DYE.wool])
      : pick(rand, GREEK_CLOTH)
    : pick(rand, WORK_CLOTH);

function seat(b: Builder, at: Vec3, rotY: number) {
  b.crowd.push({
    at,
    rotY,
    cloth: seatColour(b.rand, b.era),
    skin: pick(b.rand, SKIN),
    hair: pick(b.rand, HAIR),
  });
}

/**
 * The Library of Celsus on a working morning: readers on the steps and at the
 * tables, scrolls carried in, the city crossing the square — and inside the
 * hall, the cupboards in the niches filled with what the building was for.
 */
function facadeLife(spec: RomanFacadeSpec, era: Era): SceneLife {
  const b = make(era, 9001);
  const { cast, rand } = b;
  const w = spec.facadeWidth;
  const rise = 0.18;
  const tread = 0.44;
  const y0 = spec.steps * rise;
  const stairFoot = -spec.steps * tread;
  const hallFront = spec.porchDepth + 0.7;
  const hallBack = hallFront + spec.hallDepth;
  const halfHall = spec.hallWidth / 2;
  const floor = y0 + 0.02;
  const stepTop = (i: number): Vec3 => [
    0,
    (i + 1) * rise,
    -(spec.steps - i) * tread + tread * 0.55,
  ];

  // The square in front: people crossing it, and stopping to talk.
  for (let i = 0; i < 9; i += 1) {
    const z = between(rand, stairFoot - 9, stairFoot - 3.2);
    const dir = rand() < 0.5 ? 1 : -1;
    const x0 = dir * -12;
    cast.walk(
      [
        [x0, 0, z],
        [-x0, 0, z + between(rand, -1.5, 1.5)],
      ],
      {
        role: rand() < 0.25 ? "worker" : "citizen",
        ...(rand() < 0.3
          ? { carry: pick(rand, ["amphora", "basket", "jar", "scroll"] as const) }
          : {}),
      },
    );
  }
  cast.group([-4.5, 0, stairFoot - 2.4], 3);
  cast.group([5.2, 0, stairFoot - 4.2], 2, 0.6);
  cast.group([-8.5, 0, stairFoot - 6.5], 2, 0.6);
  // Up and down the nine steps, to the doors and back.
  for (const x of [-2.4, 1.2, 3.8]) {
    cast.walk(
      [
        [x, 0, stairFoot - 2.5],
        [x, 0, stairFoot - 0.3],
        [x, y0, -0.5],
      ],
      { carry: x > 3 ? "basket" : "scroll", role: x > 3 ? "worker" : "citizen", speed: 0.8 },
    );
  }
  // Readers sitting on the steps in the sun, scrolls open on their knees.
  for (const [x, step] of [
    [-6.2, 2],
    [-5.4, 2],
    [6.8, 3],
    [-1.0, 5],
  ] as const) {
    const p = stepTop(step);
    cast.add({
      at: [x, p[1], p[2]],
      rotY: Math.PI,
      action: rand() < 0.7 ? "read" : "talk",
      carry: "scroll",
    });
  }
  // A teacher and his pupils at the foot of the steps.
  cast.add({
    at: [-8.6, 0, stairFoot - 1.4],
    rotY: Math.PI * 0.85,
    action: "talk",
    carry: "scroll",
    role: "official",
  });
  for (let i = 0; i < 3; i += 1) {
    cast.add({
      at: [-8.0 + i * 0.7, 0, stairFoot - 2.6 - (i % 2) * 0.4],
      rotY: facing(-0.6 - i * 0.7, 1.2),
      action: "stand",
      role: "child",
    });
  }

  // A stall selling ink, pens and papyrus at the edge of the square.
  b.props.push(...stall([-11.8, 0, stairFoot - 7.5], 0.35, rand, "pottery"));
  cast.add({ at: [-11.4, 0, stairFoot - 8.4], rotY: 0.35, action: "talk", role: "worker" });

  // Torches either side of each door, and a brazier at each horseman.
  const bayCentres = [
    -((w * 0.152) / 2 + w * 0.152 + (w * 0.114) / 2),
    0,
    (w * 0.152) / 2 + w * 0.152 + (w * 0.114) / 2,
  ];
  const doorHalf = [w * 0.114 * 0.36, w * 0.152 * 0.36, w * 0.114 * 0.36];
  bayCentres.forEach((cx, i) => {
    for (const side of [-1, 1]) {
      fire(b, torchStand([cx + side * (doorHalf[i]! + 0.35), y0, -0.55], 1.7), 0.32, i === 1);
    }
  });
  for (const side of [-1, 1]) {
    fire(b, brazier([side * (w * 0.56 - 2.2), 0, stairFoot - 1.2], 1), 0.45, true);
  }

  /* The hall. */
  // The cupboards in the niches, two storeys of them.
  const nicheWidth = 1.1;
  for (let storey = 0; storey < 2; storey += 1) {
    const base = y0 + 1 + storey * (spec.nicheHeight + 0.5);
    if (base + spec.nicheHeight > y0 + spec.wallHeight) continue;
    for (let i = 0; i < 4; i += 1) {
      const x = -halfHall + (halfHall * 2 * (i + 0.5)) / 4;
      if (Math.abs(x) < spec.apseWidth / 2 + 0.8) continue;
      b.props.push(
        ...armarium([x, base, hallBack - 0.38], nicheWidth - 0.08, spec.nicheHeight, Math.PI, rand),
      );
    }
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i += 1) {
        const z = hallFront + (spec.hallDepth * (i + 0.5)) / 3;
        b.props.push(
          ...armarium(
            [side * (halfHall - 0.38), base, z],
            nicheWidth - 0.08,
            spec.nicheHeight,
            side > 0 ? -Math.PI / 2 : Math.PI / 2,
            rand,
          ),
        );
      }
    }
  }
  // Athena in the apse, goddess of wisdom, over the tomb of the founder.
  b.props.push(box("marbleWorn", [0, floor, hallBack + 0.9], [1.6, 1.0, 1.2]));
  b.props.push(
    decor({
      kind: "figure",
      material: "marble",
      at: [0, floor + 1.0, hallBack + 0.9],
      height: 3.1,
      rotY: Math.PI,
      identity: STATUES.athena,
      paint: { cloth: 0xe7dcc4, mantle: 0x8fa4b8, hair: 0x7a5a3c, accent: 0xc8a24a },
    }),
  );
  // Reading tables down the middle of the hall, and lamps between them.
  for (const [tz, tx] of [
    [hallFront + 2.6, -2.6],
    [hallFront + 2.6, 2.6],
    [hallFront + 6.4, -2.6],
    [hallFront + 6.4, 2.6],
  ] as const) {
    b.props.push(...table([tx, floor, tz], 2.2, 0.9));
    b.props.push(...scrolls([tx, floor + 0.75, tz], 3, 0, rand));
    for (const side of [-1, 1]) {
      b.props.push(...bench([tx, floor, tz + side * 0.85], 2.0));
    }
    const readers = 1 + Math.floor(rand() * 3);
    for (let r = 0; r < readers; r += 1) {
      const side = r % 2 === 0 ? -1 : 1;
      cast.add({
        at: [tx - 0.7 + r * 0.7, floor + 0.46, tz + side * 0.85],
        rotY: side < 0 ? 0 : Math.PI,
        action: "read",
        carry: "scroll",
      });
    }
  }
  for (const [lx, lz] of [
    [0, hallFront + 1.2],
    [0, hallFront + 4.5],
    [0, hallFront + 8.2],
    [-6.2, hallFront + 4.5],
    [6.2, hallFront + 4.5],
  ] as const) {
    fire(b, lampstand([lx, floor, lz], 1.6), 0.12, lx === 0 && lz > hallFront + 4);
  }
  // A librarian fetching from the shelves, and a slave carrying the box of
  // scrolls a reader asked for.
  cast.add({
    at: [-5.9, floor, hallBack - 1.3],
    rotY: 0,
    action: "read",
    carry: "scroll",
    role: "official",
  });
  cast.walk(
    [
      [-6.6, floor, hallFront + 1.6],
      [-6.6, floor, hallBack - 1.6],
      [6.6, floor, hallBack - 1.6],
      [6.6, floor, hallFront + 1.6],
    ],
    { role: "worker", carry: "basket", speed: 0.7 },
  );
  // A donkey with panniers led across the square, and the town's dogs.
  animal(b, "donkey", [12, 0, stairFoot - 5.6], 0, "walk", {
    route: [
      [12, 0, stairFoot - 5.6],
      [-12, 0, stairFoot - 6.4],
    ],
    speed: 0.75,
    load: true,
  });
  cast.walk(
    [
      [12.9, 0, stairFoot - 5.6],
      [-11.1, 0, stairFoot - 6.4],
    ],
    { role: "worker", carry: "staff", speed: 0.75 },
  );
  dog(b, [
    [-9, 0, stairFoot - 3],
    [-3, 0, stairFoot - 8],
    [4, 0, stairFoot - 4],
  ]);
  dog(b, [7.6, 0, stairFoot - 1.6]);
  return finish(b);
}

/**
 * A theatre in the middle of a play: the seats more than half full, actors in
 * their masks on the stage, the chorus turning in the orchestra, a piper
 * beside them, sellers working the walkways.
 */
function theatreLife(spec: RomanTheatreSpec, era: Era, seed: number): SceneLife {
  const b = make(era, seed);
  const { cast, rand } = b;
  const orchestra = spec.orchestraDiameter / 2;
  const middle = spec.middleRows ?? 0;
  const rows = spec.lowerRows + middle + spec.upperRows;
  const diazoma = 1.8;
  const podiumOuter = orchestra + 0.7;
  const rowAt = (index: number) => {
    const walkways =
      (index >= spec.lowerRows ? diazoma : 0) +
      (middle > 0 && index >= spec.lowerRows + middle ? diazoma : 0);
    const inner = podiumOuter + index * spec.seatTread + walkways;
    return { inner, y: spec.podiumHeight + index * spec.seatRise };
  };

  /*
   * The audience. Fuller near the front, thinner at the back and the ends,
   * with blocks left empty the way a real house fills — and capped, because
   * every one of them is drawn.
   */
  const budget = 2600;
  const totalSeats = Array.from(
    { length: rows },
    (_, i) => (Math.PI * rowAt(i).inner) / 0.55,
  ).reduce((a, c) => a + c, 0);
  const density = Math.min(0.62, budget / totalSeats);
  const stairWidthAngle = (r: number) => 1.3 / r;
  for (let i = 0; i < rows; i += 1) {
    const { inner, y } = rowAt(i);
    const r = inner + spec.seatTread * 0.42;
    const count = Math.floor((Math.PI * r) / 0.55);
    const frontBias = 1.15 - (i / rows) * 0.55;
    for (let k = 0; k < count; k += 1) {
      const t = (Math.PI * (k + 0.5)) / count;
      // Keep the stairs clear.
      let onStair = false;
      for (let s = 0; s < spec.stairways; s += 1) {
        const theta = (Math.PI * (s + 0.5)) / spec.stairways;
        if (Math.abs(t - theta) < stairWidthAngle(r)) onStair = true;
      }
      if (onStair) continue;
      // Wedges that are emptier than the rest.
      const wedge = Math.floor((t / Math.PI) * spec.stairways);
      const wedgeFill = 0.55 + 0.45 * Math.sin(wedge * 2.3 + seed);
      if (rand() > density * frontBias * wedgeFill * 1.25) continue;
      const at: Vec3 = [Math.cos(t) * r, y + spec.seatRise + 0.06, Math.sin(t) * r];
      seat(b, at, facing(-at[0], -at[2]));
    }
  }

  // The stage: three actors in masks, and a fourth waiting at the royal door.
  const stageY = 1.5;
  const stageZ = -spec.stageDepth * 0.45;
  cast.add({
    at: [-2.2, stageY, stageZ],
    rotY: 0.25,
    action: "perform",
    role: "actor",
    carry: "staff",
  });
  cast.add({ at: [0.6, stageY, stageZ + 0.6], rotY: -0.1, action: "perform", role: "actor" });
  cast.add({ at: [3.0, stageY, stageZ - 0.4], rotY: -0.45, action: "perform", role: "actor" });
  cast.add({ at: [0, stageY, -spec.stageDepth + 0.8], rotY: 0, action: "stand", role: "actor" });
  // The chorus, circling the orchestra.
  const chorusCentre: Vec3 = [0, 0.12, orchestra * 0.42];
  const chorusRadius = orchestra * 0.3;
  const loop: Vec3[] = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (TAU * i) / 12;
    loop.push([
      chorusCentre[0] + Math.cos(a) * chorusRadius,
      0.12,
      chorusCentre[2] + Math.sin(a) * chorusRadius,
    ]);
  }
  for (let i = 0; i < 8; i += 1) {
    const offset = Math.floor((i * 12) / 8);
    const route = [...loop.slice(offset), ...loop.slice(0, offset)];
    cast.walk(route, { role: "actor", speed: 0.55 });
  }
  // The piper and a lyre player at the edge of the orchestra.
  cast.add({
    at: [-orchestra * 0.62, 0.12, 1.2],
    rotY: 0.9,
    action: "play",
    role: "musician",
    carry: "aulos",
  });
  cast.add({
    at: [orchestra * 0.62, 0.12, 1.2],
    rotY: -0.9,
    action: "play",
    role: "musician",
    carry: "lyre",
  });
  // Late arrivals climbing a stair, and a seller of nuts and water along the
  // walkway between the tiers.
  const stairTheta = (Math.PI * (Math.floor(spec.stairways / 2) + 0.5)) / spec.stairways;
  const lower = rowAt(0);
  const upper = rowAt(spec.lowerRows - 1);
  for (let i = 0; i < 2; i += 1) {
    const dt = (i - 0.5) * 0.004;
    cast.walk(
      [
        [
          Math.cos(stairTheta + dt) * (lower.inner - 0.3),
          lower.y,
          Math.sin(stairTheta + dt) * (lower.inner - 0.3),
        ],
        [
          Math.cos(stairTheta + dt) * (upper.inner + 0.3),
          upper.y + spec.seatRise,
          Math.sin(stairTheta + dt) * (upper.inner + 0.3),
        ],
      ],
      { speed: 0.6 },
    );
  }
  const walkway = rowAt(spec.lowerRows - 1);
  const wr = walkway.inner + spec.seatTread + diazoma / 2;
  const wy = walkway.y + spec.seatRise + 0.12;
  const arc: Vec3[] = [];
  for (let i = 0; i <= 10; i += 1) {
    const a = 0.25 + (i / 10) * (Math.PI - 0.5);
    arc.push([Math.cos(a) * wr, wy, Math.sin(a) * wr]);
  }
  cast.walk(arc, { role: "worker", carry: "basket", speed: 0.7 });
  cast.walk([...arc].reverse(), { role: "worker", carry: "amphora", speed: 0.6 });

  // Torches along the front of the stage, and braziers at its ends.
  const stageHalf = spec.caveaDiameter * 0.31;
  for (let i = 0; i < 6; i += 1) {
    const x = -stageHalf * 0.8 + (stageHalf * 1.6 * i) / 5;
    fire(b, torchStand([x, stageY, -0.4], 1.6), 0.3, i === 1 || i === 4);
  }
  for (const side of [-1, 1]) {
    fire(b, brazier([side * (orchestra - 1.2), 0.12, 0.8], 1.1), 0.5, true);
  }
  /*
   * The stage front was a gallery of statues: gods, Muses, the emperor and
   * the city's benefactors stood between the columns of both storeys.
   */
  const stageWidth = spec.caveaDiameter;
  const wallZ = -spec.stageDepth;
  const screenLower = spec.scaenaeHeight * 0.55;
  const screenUpper = spec.scaenaeHeight - screenLower;
  const span = stageWidth * 0.86;
  const bay = span / 10;
  const doors = [0, -stageWidth * 0.16, stageWidth * 0.16, -stageWidth * 0.36, stageWidth * 0.36];
  for (let i = 0; i < 10; i += 1) {
    const x = -(span / 2) + (i + 0.5) * bay;
    statue(b, [x, stageY + screenLower, wallZ + 0.9], screenUpper * 0.55, 0, i + seed);
    if (doors.every((d) => Math.abs(d - x) > 3.2)) {
      statue(b, [x, stageY, wallZ + 0.7], screenLower * 0.42, 0, i + seed + 5);
    }
  }
  return finish(b);
}

/**
 * A great Ionic temple on a festival day: a procession with offerings coming
 * to the altar in front, the priest at the fire, worshippers on the platform
 * between the columns — and what was particular to each sanctuary inside.
 */
function templeLife(spec: IonicDipterosSpec, era: Era, id: string): SceneLife {
  const b = make(era, id.length * 977);
  const { cast, rand } = b;
  const platform = spec.crepidomaSteps * 0.5;
  const front = -spec.crepidomaLength / 2;
  const gridWidth = spec.stylobateWidth - 3;
  const gridLength = spec.stylobateLength - 3;
  const stepZ = gridLength / (spec.outerColumnsLong - 1);
  const stepX = gridWidth / (spec.outerColumnsShort - 1);

  // The altar in front of the temple, and its fire.
  const altarZ = front - Math.min(17, spec.crepidomaWidth * 0.3);
  const altarW = Math.min(9, spec.crepidomaWidth * 0.18);
  fire(b, altar([0, 0, altarZ], altarW, altarW * 0.55, 1.5), 1.1, true, true);
  // Priests at the altar.
  const priestly: "priest" | "priestess" = id === "artemis-tapinagi" ? "priestess" : "priest";
  cast.add({
    at: [0, 0, altarZ + altarW * 0.42],
    rotY: Math.PI,
    action: "tend",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [-altarW * 0.55, 0, altarZ + 0.6],
    rotY: Math.PI * 0.75,
    action: "pray",
    role: priestly,
  });
  cast.add({
    at: [altarW * 0.55, 0, altarZ + 0.6],
    rotY: -Math.PI * 0.75,
    action: "play",
    role: "musician",
    carry: "aulos",
  });
  // The procession: offerings carried up the sacred way to the altar.
  const wayLength = 24;
  for (let i = 0; i < 10; i += 1) {
    const x = (i % 2 === 0 ? -1 : 1) * 1.1;
    const z0 = altarZ - wayLength + (i * wayLength) / 10;
    cast.walk(
      [
        [x, 0, z0],
        [x, 0, altarZ - altarW * 0.6],
        [x * 3.5, 0, altarZ - altarW * 0.6],
        [x * 3.5, 0, altarZ - wayLength],
      ],
      {
        role: i === 0 ? "official" : i < 3 ? priestly : "citizen",
        carry: pick(rand, ["offering", "basket", "jar", "torch", "offering", "lyre"] as const),
        speed: 0.75,
      },
    );
  }
  // Worshippers on the front of the platform, between the first two rows of
  // columns, and a few on the steps.
  const pteronZ = -gridLength / 2 + stepZ * 0.5;
  for (let i = 0; i < 4; i += 1) {
    const z = pteronZ + between(rand, -0.6, 0.6);
    cast.walk(
      [
        [-gridWidth / 2 + stepX * 0.5, platform, z],
        [gridWidth / 2 - stepX * 0.5, platform, z],
      ],
      { speed: between(rand, 0.6, 0.9), ...(rand() < 0.4 ? { carry: "offering" as const } : {}) },
    );
  }
  cast.group([-stepX * 1.5, platform, pteronZ - 0.2], 3, 0.7);
  cast.group([stepX * 2.5, platform, pteronZ + 0.3], 2, 0.6);
  for (let i = 0; i < 3; i += 1) {
    const s = 1 + Math.floor(rand() * (spec.crepidomaSteps - 2));
    const insetL = (spec.crepidomaLength - spec.stylobateLength) / 2 / spec.crepidomaSteps;
    const z = front + s * insetL + insetL * 0.4;
    cast.add({
      at: [between(rand, -gridWidth * 0.4, gridWidth * 0.4), (s + 1) * 0.5, z],
      rotY: Math.PI,
      action: rand() < 0.5 ? "sit" : "talk",
    });
  }
  // Torches along the front of the platform, braziers by the altar.
  for (let i = 0; i < 6; i += 1) {
    const x = -gridWidth / 2 + stepX * 0.5 + (i * (gridWidth - stepX)) / 5;
    fire(b, torchStand([x, platform, -spec.stylobateLength / 2 + 0.6], 1.9), 0.32, i === 2);
  }
  for (const side of [-1, 1]) {
    fire(b, brazier([side * (altarW * 0.9), 0, altarZ - 1.5], 1.1), 0.45, side > 0);
  }

  const courtCentre = gridLength / 2 - stepZ - spec.courtLength / 2 - 5;
  if (id === "didyma-apollon-tapinagi") {
    /*
     * Didyma's court never had a roof: the oracle's laurel grove grew in it,
     * round the spring and the little naiskos where the prophetess sat.
     */
    const courtY = platform - 1.4 + 0.3;
    const naiskosZ = courtCentre + spec.courtLength / 2 - spec.naiskosLength / 2 - 6;
    for (let i = 0; i < 9; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const z = courtCentre - spec.courtLength / 2 + 5 + i * 3.6;
      if (
        Math.abs(z - naiskosZ) < spec.naiskosLength / 2 + 2 &&
        Math.abs(side * 7.5) < spec.naiskosWidth
      )
        continue;
      b.props.push(
        ...tree(
          [side * between(rand, 5.2, 6.4), courtY, z],
          "laurel",
          rand,
          between(rand, 1.6, 2.0),
        ),
      );
    }
    const prophetZ = naiskosZ - spec.naiskosLength / 2 - 1.8;
    b.props.push(box("bronze", [0, courtY, prophetZ], [0.5, 0.6, 0.5]));
    cast.add({
      at: [0, courtY + 0.6, prophetZ],
      rotY: Math.PI,
      action: "sit",
      role: "priestess",
      carry: "staff",
    });
    fire(b, brazier([1.4, courtY, prophetZ - 0.4], 0.9), 0.35, true, true);
    for (let i = 0; i < 4; i += 1) {
      cast.add({
        at: [between(rand, -3, 3), courtY, prophetZ - between(rand, 3, 8)],
        rotY: 0,
        action: rand() < 0.5 ? "pray" : "stand",
        carry: rand() < 0.5 ? "offering" : "tablet",
      });
    }
  } else {
    // Inside the cella: lamps before the cult statue.
    const statueZ = courtCentre + spec.courtLength / 2 - 6;
    for (const side of [-1, 1]) {
      fire(b, lampstand([side * 3.2, platform, statueZ - 2.4], 1.8), 0.18, side > 0);
    }
    fire(b, brazier([0, platform, statueZ - 4], 1), 0.3, false, true);
    cast.add({ at: [-1.4, platform, statueZ - 5.5], rotY: 0, action: "pray", role: priestly });
    cast.add({ at: [1.6, platform, statueZ - 5.8], rotY: 0, action: "pray", role: "citizen" });
  }

  if (id === "artemis-tapinagi") {
    // The silversmiths' stalls, selling little shrines of the goddess.
    b.props.push(...stall([-16, 0, altarZ - 10], 0.4, rand, "shrines"));
    b.props.push(...stall([16, 0, altarZ - 12], -0.4, rand, "shrines"));
    cast.add({ at: [-15.6, 0, altarZ - 11], rotY: 0.4, action: "talk", role: "worker" });
    cast.add({ at: [15.6, 0, altarZ - 13], rotY: -0.4, action: "talk", role: "worker" });
    cast.group([-13.5, 0, altarZ - 12.2], 2, 0.6);
  } else {
    for (const side of [-1, 1]) {
      b.props.push(
        ...tree([side * (spec.crepidomaWidth / 2 + 8), 0, altarZ - 6], "cypress", rand, 1.1),
      );
      b.props.push(
        ...tree([side * (spec.crepidomaWidth / 2 + 9), 0, altarZ + 6], "cypress", rand, 1.0),
      );
    }
  }
  /*
   * The victims: a white ox garlanded with ribbons, led at the head of the
   * procession, and a few sheep and goats driven behind it.
   */
  const lead = (offset: number, species: Species, scale: number) => {
    const z0 = altarZ - wayLength + offset;
    const route: Vec3[] = [
      [0, 0, z0],
      [0, 0, altarZ - altarW * 0.9],
      [2.5, 0, altarZ - altarW * 0.9],
      [2.5, 0, altarZ - wayLength],
    ];
    animal(b, species, route[0]!, 0, "walk", {
      route,
      speed: 0.75,
      ...(species === "ox" ? { colour: 0xece6d8, dressed: 0xc0392b } : {}),
    });
    void scale;
  };
  lead(4, "ox", 1);
  lead(9, "sheep", 1);
  lead(10.5, "goat", 1);
  lead(12, "sheep", 1);
  dog(b, [-altarW, 0, altarZ - 6]);
  /*
   * The roof's sculpture: figures standing in the pediment against a blue
   * ground, as the traces of paint on Greek pediments show, a gilded Nike on
   * the apex and gilded acroteria at the corners.
   */
  if (spec.interior === "cella") {
    const radius = spec.columnDiameter / 2;
    const eaves = platform + spec.columnHeight + spec.entablatureHeight;
    const roofHalf = gridWidth / 2 + radius * 1.3;
    const roofLength = gridLength + radius * 2.6;
    const pitch = roofHalf * 0.36;
    for (const end of [-1, 1]) {
      const face = end * (roofLength / 2);
      const out = end * 0.25;
      b.props.push(
        decor({
          kind: "prism",
          material: "paintBlue",
          at: [0, eaves + 0.15, face + out * 0.4],
          size: [roofHalf * 1.7, pitch * 0.82, 0.06],
          rotY: 0,
        }),
      );
      const figures = 9;
      for (let i = 0; i < figures; i += 1) {
        const t = (i - (figures - 1) / 2) / ((figures - 1) / 2);
        const x = t * roofHalf * 0.72;
        const room = pitch * 0.8 * (1 - Math.abs(x) / (roofHalf * 0.86));
        if (room < 0.9) continue;
        statue(
          b,
          [x, eaves + 0.15, face + out * 2.4],
          room * 0.82,
          end < 0 ? Math.PI : 0,
          i * 3 + (end > 0 ? 1 : 0),
          "marble",
          false,
        );
      }
      // The apex Nike, gilded, and the corner acroteria.
      b.props.push(
        decor({
          kind: "figure",
          material: "paintGold",
          at: [0, eaves + pitch, face],
          height: Math.max(1.6, pitch * 0.45),
          rotY: end < 0 ? Math.PI : 0,
          identity: PANTHEON[7]!,
        }),
      );
      for (const side of [-1, 1]) {
        b.props.push(
          loft(
            "paintGold",
            [side * (roofHalf - 0.6), eaves, face],
            [
              [0, 0.25],
              [0.4, 0.15],
              [0.9, 0.35],
              [1.4, 0.18],
              [1.7, 0.02],
            ],
          ),
        );
      }
    }
  }
  return finish(b);
}

/**
 * Göbeklitepe at a gathering: a fire in the enclosure, people in hides sitting
 * on the benches round the wall, a carver at work on a pillar with a flint, and
 * the great stone troughs that may have held the feast's drink.
 */
function enclosureLife(spec: NeolithicEnclosureSpec, era: Era): SceneLife {
  const b = make(era, 1133);
  const { cast, rand } = b;
  const inner = spec.enclosureDiameter / 2 - spec.wallThickness;
  const floor = 0.14;

  // The hearth, ringed with stones, and the people round it.
  const hearth: Vec3 = [3.6, floor, -4.2];
  for (let i = 0; i < 9; i += 1) {
    const a = (TAU * i) / 9;
    b.props.push(
      box(
        "limestone",
        [hearth[0] + Math.cos(a) * 0.7, floor, hearth[2] + Math.sin(a) * 0.7],
        [0.3, 0.2, 0.25],
        -a,
      ),
    );
  }
  for (let i = 0; i < 6; i += 1) {
    const a = rand() * TAU;
    b.props.push(
      cyl(
        "timber",
        [hearth[0] + Math.cos(a) * 0.2, floor + 0.05, hearth[2] + Math.sin(a) * 0.2],
        0.05,
        0.04,
        0.7,
        6,
        { rotX: Math.PI / 2 - 0.35, rotY: a },
      ),
    );
  }
  b.flames.push({ at: [hearth[0], floor + 0.1, hearth[2]], size: 0.9, light: true, smoke: true });
  for (let i = 0; i < 5; i += 1) {
    const a = 0.6 + i * 1.05;
    const at: Vec3 = [hearth[0] + Math.cos(a) * 1.7, floor, hearth[2] + Math.sin(a) * 1.7];
    cast.add({
      at,
      rotY: facing(hearth[0] - at[0], hearth[2] - at[2]),
      action: i === 2 ? "talk" : i % 2 ? "kneel" : "stand",
    });
  }
  // On the benches round the wall.
  for (let i = 0; i < 6; i += 1) {
    const a = 1.9 + i * 0.32 + (i > 2 ? 1.2 : 0);
    const r = inner - 0.4;
    const at: Vec3 = [Math.cos(a) * r, floor + spec.benchHeight, Math.sin(a) * r];
    cast.add({ at, rotY: facing(-at[0], -at[2]), action: rand() < 0.6 ? "sit" : "talk" });
  }
  // A carver kneeling at a ring pillar, cutting an animal with a flint.
  const pillarA = (TAU * 3) / spec.ringPillars;
  const pr = inner - spec.pillarThickness - 0.55;
  const carver: Vec3 = [Math.cos(pillarA) * pr, floor, Math.sin(pillarA) * pr];
  cast.add({
    at: carver,
    rotY: facing(Math.cos(pillarA), Math.sin(pillarA)),
    action: "kneel",
    carry: "chisel",
  });
  // Hunters back with their spears, and someone carrying water.
  cast.walk(
    [
      [-6, floor, 6],
      [4, floor, 8.5],
      [6.5, floor, 2],
    ],
    { carry: "spear", speed: 0.8 },
  );
  cast.add({ at: [-3.2, floor, -6.4], rotY: 0.6, action: "talk", carry: "spear" });
  cast.add({ at: [-2.4, floor, -7.1], rotY: -2.4, action: "stand", carry: "spear" });
  cast.walk(
    [
      [-8, floor, -2],
      [-2, floor, 3],
    ],
    { carry: "jar", speed: 0.7 },
  );
  cast.add({ at: [-1.5, floor, 1.5], rotY: 1.2, action: "play", role: "child" });

  // The stone troughs, and the grinding slabs beside them.
  for (const [x, z, r] of [
    [-6.2, -3.2, 0.5],
    [-7.0, -1.8, 0.42],
    [6.8, 5.6, 0.55],
  ] as const) {
    b.props.push(cyl("limestone", [x, floor, z], r, r * 1.1, 0.55, 12));
    b.props.push(cyl("shadow", [x, floor + 0.53, z], r * 0.8, r * 0.8, 0.03, 12));
  }
  b.props.push(box("limestone", [-5.4, floor, -4.6], [0.8, 0.16, 0.5], 0.4));
  // A hide stretched on a frame to dry.
  b.props.push(box("timber", [8.4, floor, -1.4], [0.06, 1.6, 0.06]));
  b.props.push(box("timber", [8.4, floor, 0.4], [0.06, 1.6, 0.06]));
  b.props.push(box("timber", [8.4, floor + 1.5, -0.5], [0.06, 0.06, 1.9]));
  b.props.push(box("hide", [8.4, floor + 0.35, -0.5], [0.03, 1.1, 1.5]));
  // Brands stuck in the floor by the central pillars, for light after dark.
  for (const [x, z] of [
    [-1.9, 1.2],
    [1.9, -1.2],
  ] as const) {
    b.props.push(cyl("timber", [x, floor, z], 0.04, 0.035, 1.3, 6));
    b.flames.push({ at: [x, floor + 1.32, z], size: 0.3 });
  }
  // Dogs by the fire — they were already living with people here — and
  // gazelle grazing on the plain beyond the wall.
  dog(b, [hearth[0] + 1.2, floor, hearth[2] + 1.1]);
  dog(b, [
    [-5, floor, 4],
    [2, floor, 9],
    [7, floor, 3],
    [1, floor, -2],
  ]);
  flock(b, "gazelle", [24, 0, -12], 6, 5);
  flock(b, "gazelle", [-20, 0, 18], 4, 4);
  return finish(b);
}

/**
 * The Great Altar during a sacrifice: smoke rising from the fire altar in the
 * court on the terrace, priests round it, a procession climbing the stair with
 * offerings and music, and the city gathered at the foot.
 */
function altarLife(spec: GreatAltarSpec, era: Era): SceneLife {
  const b = make(era, 7310);
  const { cast, rand } = b;
  const halfD = spec.baseDepth / 2;
  const ground = spec.steps * 0.3;
  const terrace = ground + 1.4 + spec.friezeHeight + 0.5 + 0.9;
  const courtZ = 2;
  const foot = -halfD - spec.steps * 0.55;

  b.flames.push({ at: [0, terrace + 1.95, courtZ], size: 1.6, light: true, smoke: true });
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i - 2) * 0.62;
    const at: Vec3 = [Math.cos(a) * 3.4, terrace, courtZ + Math.sin(a) * 3.4];
    cast.add({
      at,
      rotY: facing(-at[0], courtZ - at[2]),
      action: i === 2 ? "tend" : "pray",
      role: i === 2 ? "priest" : i % 2 ? "priestess" : "priest",
      ...(i === 2 ? { carry: "offering" as const } : {}),
    });
  }
  // Up the stair: the procession.
  for (let i = 0; i < 8; i += 1) {
    const x = (i % 2 ? 1 : -1) * between(rand, 1.5, 5);
    cast.walk(
      [
        [x, ground, foot - 6],
        [x, ground, -halfD],
        [x, terrace, -halfD + 8.5],
        [x * 0.5, terrace, courtZ - 5],
      ],
      {
        role: i < 2 ? "musician" : i < 4 ? "priestess" : "citizen",
        carry:
          i < 2
            ? i
              ? "lyre"
              : "aulos"
            : pick(rand, ["offering", "basket", "jar", "torch"] as const),
        speed: 0.55,
      },
    );
  }
  // The city at the foot of the steps.
  for (let i = 0; i < 18; i += 1) {
    const at: Vec3 = [
      between(rand, -spec.baseWidth * 0.45, spec.baseWidth * 0.45),
      0,
      foot - between(rand, 2, 9),
    ];
    if (Math.abs(at[0]) < 6 && at[2] > foot - 7) continue;
    cast.add({
      at,
      rotY: facing(between(rand, -2, 2), 6),
      action: rand() < 0.3 ? "talk" : rand() < 0.5 ? "pray" : "stand",
    });
  }
  cast.add({
    at: [-spec.stairWidth / 2 - 2, ground, foot + 1],
    rotY: 0.3,
    action: "stand",
    role: "soldier",
    carry: "spear",
    carryLeft: "shield",
  });
  cast.add({
    at: [spec.stairWidth / 2 + 2, ground, foot + 1],
    rotY: -0.3,
    action: "stand",
    role: "soldier",
    carry: "spear",
    carryLeft: "shield",
  });
  // Torches at the head of the stair; braziers at its foot.
  for (const side of [-1, 1]) {
    fire(b, torchStand([side * (spec.stairWidth / 2 - 1), terrace, -halfD + 8.8], 2), 0.36, true);
    fire(b, brazier([side * (spec.stairWidth / 2 + 1.5), 0, foot - 2], 1.2), 0.5, false, true);
  }
  // The bull for the sacrifice, led up the great stair to the court.
  animal(b, "ox", [-2, ground, foot - 8], 0, "walk", {
    colour: 0x2a1d14,
    dressed: 0xd4ae52,
    route: [
      [-2, ground, foot - 8],
      [-2, ground, -halfD],
      [-2, terrace, -halfD + 8.5],
      [-2, terrace, courtZ - 5.5],
    ],
    speed: 0.5,
  });
  cast.walk(
    [
      [-3, ground, foot - 7.4],
      [-3, ground, -halfD + 0.6],
      [-3, terrace, -halfD + 9],
      [-3, terrace, courtZ - 5],
    ],
    { role: "priest", carry: "staff", speed: 0.5 },
  );
  dog(b, [spec.baseWidth * 0.3, 0, foot - 5]);
  /*
   * The roof of the colonnade carried statues — gods, and horses — standing
   * along the cornice above the columns; and in the court, the god and his
   * daughter stand either side of the fire.
   */
  const roof = spec.totalHeight;
  const cw = spec.baseWidth / 2 - 1.2;
  const cd = halfD - 1.2;
  let n = 0;
  const along = (from: Vec3, to: Vec3, count: number, rotY: number) => {
    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      const at: Vec3 = [from[0] + (to[0] - from[0]) * t, roof, from[2] + (to[2] - from[2]) * t];
      if (Math.abs(at[0]) < spec.stairWidth / 2 - 1 && at[2] < 0) continue;
      if (n % 3 === 2) b.props.push(...horseStatue("marble", at, rotY + Math.PI, 0.9).map(decor));
      else statue(b, at, 2.3, rotY, n);
      n += 1;
    }
  };
  along([-cw, 0, -cd], [cw, 0, -cd], 8, Math.PI);
  along([-cw, 0, cd], [cw, 0, cd], 8, 0);
  along([-cw, 0, -cd + 3], [-cw, 0, cd - 3], 6, -Math.PI / 2);
  along([cw, 0, -cd + 3], [cw, 0, cd - 3], 6, Math.PI / 2);
  b.props.push(box("marbleWorn", [-4.2, terrace, courtZ + 3.5], [1.0, 0.6, 1.0]));
  b.props.push(
    decor({
      kind: "figure",
      material: "marble",
      at: [-4.2, terrace + 0.6, courtZ + 3.5],
      height: 3.0,
      rotY: Math.PI,
      identity: PANTHEON[8]!,
      paint: PALETTES[3]!,
    }),
  );
  b.props.push(box("marbleWorn", [4.2, terrace, courtZ + 3.5], [1.0, 0.6, 1.0]));
  b.props.push(
    decor({
      kind: "figure",
      material: "marble",
      at: [4.2, terrace + 0.6, courtZ + 3.5],
      height: 2.9,
      rotY: Math.PI,
      identity: STATUES.athena,
      paint: PALETTES[0]!,
    }),
  );
  return finish(b);
}

/** Race day: runners down the track, judges at the line, a crowd on the banks. */
function stadiumLife(spec: StadiumSpec, era: Era, seed: number): SceneLife {
  const b = make(era, seed);
  const { cast, rand } = b;
  const L = stadiumLayout(spec);
  const { arenaHalf, endCentre, tread, bowAt } = L;

  /*
   * The crowd along both banks, following the curve of the sides where they
   * bow, thickest opposite the finish.
   */
  const budget = 1900;
  const perRow = (2 * endCentre) / 0.55;
  const total = perRow * 2 * spec.rows;
  const density = Math.min(0.55, budget / total);
  const finishZ = L.trackMax - 6;
  for (let row = 0; row < spec.rows; row += 1) {
    const r = arenaHalf + row * tread + tread * 0.42;
    const y = row * spec.seatRise + spec.seatRise + 0.06;
    for (const side of [-1, 1]) {
      for (let k = 0; k < perRow; k += 1) {
        const z = -endCentre + (k + 0.5) * 0.55;
        const near = 1 - Math.abs(z - finishZ) / (endCentre * 2);
        if (rand() > density * (0.6 + near)) continue;
        const slope = (bowAt(z + 0.5) - bowAt(z - 0.5)) * side;
        seat(b, [side * (r + bowAt(z)), y, z], (side > 0 ? -Math.PI / 2 : Math.PI / 2) - slope);
      }
    }
  }

  // The footrace, there and back down the middle, inside the chariots' line.
  const mid = (L.trackMin + L.trackMax) / 2;
  const half = (L.trackMax - L.trackMin) / 2 - 6;
  for (let i = 0; i < 4; i += 1) {
    const x = arenaHalf * (-0.22 + i * 0.12);
    cast.walk(
      [
        [x, 0.12, mid - half * 0.8],
        [x, 0.12, mid + half * 0.8],
      ],
      { role: "athlete", speed: between(rand, 5.2, 6.4) },
    );
  }
  // Turning posts, the starting line and the finishZ.
  for (const z of [L.trackMin, L.trackMax]) {
    b.props.push(cyl("marble", [0, 0.12, z], 0.3, 0.25, 2.4, 10));
    b.props.push(cyl("paintGold", [0, 2.52, z], 0.14, 0.02, 0.5, 8));
  }
  b.props.push(box("marbleWorn", [0, 0.12, finishZ], [spec.arenaWidth * 0.8, 0.04, 0.3]));
  // The judges in purple at the finishZ, on a little dais, and a trumpeter.
  b.props.push(box("marbleWorn", [arenaHalf - 2.2, 0.12, finishZ], [1.6, 0.4, 3]));
  for (let i = 0; i < 3; i += 1) {
    cast.add({
      at: [arenaHalf - 2.2, 0.52, finishZ + (i - 1) * 0.8],
      rotY: -Math.PI / 2,
      action: i === 1 ? "talk" : "stand",
      role: "official",
    });
  }
  cast.add({
    at: [-arenaHalf + 2.5, 0.12, finishZ],
    rotY: Math.PI / 2,
    action: "play",
    role: "musician",
    carry: "aulos",
  });
  cast.group([-arenaHalf + 3, 0.12, L.trackMin + 4], 3, 0.7, "athlete");
  for (let i = 0; i < 6; i += 1) {
    const z = L.trackMin + (i * (L.trackMax - L.trackMin)) / 5;
    for (const side of [-1, 1])
      fire(
        b,
        torchStand([side * (arenaHalf - 0.8 + bowAt(z)), 0.12, z], 1.8),
        0.3,
        i === 2 && side > 0,
      );
  }

  /*
   * The races: chariots in the colours of their factions, round the turning
   * posts, and a pair of riders on horseback.
   */
  b.cheerFor = "racers";
  const factions = [0x9c3a2c, 0x2f5b86, 0x4f7a3a, 0xe8e0d0];
  const track = (x: number): Vec3[] => {
    const pts: Vec3[] = [];
    const turn = 10;
    for (let k = 0; k <= turn; k += 1) {
      const a = Math.PI + (k / turn) * Math.PI;
      pts.push([Math.cos(a) * x, 0.12, L.trackMax + Math.sin(-a) * x * 0.6]);
    }
    for (let k = 0; k <= turn; k += 1) {
      const a = (k / turn) * Math.PI;
      pts.push([Math.cos(a) * x, 0.12, L.trackMin - Math.sin(a) * x * 0.6]);
    }
    return pts;
  };
  const big = spec.overallWidth > 50;
  const teams = big ? 4 : 3;
  for (let i = 0; i < teams; i += 1) {
    const lane = arenaHalf * (0.38 + i * 0.12);
    b.chariots.push({
      route: track(lane),
      speed: between(rand, 9, 11),
      phase: i * 0.8,
      team: big ? 4 : 2,
      horses: Array.from({ length: 4 }, () => pick(rand, COATS.horse)),
      driver: { ...dress(rand, b.era, "athlete"), main: factions[i]!, trim: factions[i]! },
      colour: factions[i]!,
    });
  }
  for (let i = 0; i < 2; i += 1) {
    const route = track(arenaHalf * (0.2 + i * 0.06));
    animal(b, "horse", route[0]!, 0, "gallop", {
      route,
      speed: between(rand, 10, 12),
      rider: { ...dress(rand, b.era, "athlete"), main: factions[(i + 2) % 4]! },
      dressed: factions[(i + 2) % 4]!,
    });
  }

  if (L.arenaWall) {
    // In the arena at the east end, two gladiators circle each other, the
    // referee between them with his staff.
    const z = L.arenaWall.z + 16;
    cast.add({
      at: [-1.4, 0.12, z],
      rotY: Math.PI / 2,
      action: "perform",
      role: "soldier",
      carry: "spear",
      carryLeft: "shield",
    });
    cast.add({
      at: [1.4, 0.12, z + 0.4],
      rotY: -Math.PI / 2,
      action: "perform",
      role: "soldier",
      carry: "spear",
      carryLeft: "shield",
    });
    cast.add({
      at: [0, 0.12, z + 3],
      rotY: Math.PI,
      action: "talk",
      role: "official",
      carry: "staff",
    });
  }

  if (spec.vaults) {
    /*
     * Perge's chambers under the seats were shops, opening outwards under
     * their arches — the inscriptions on them still name who sold what.
     * Awnings over a few of them, goods set out, shopkeepers and customers.
     */
    const bay = (2 * endCentre) / spec.vaults;
    const outer = L.halfWidth + 1.2;
    const goods = ["pottery", "fruit", "pottery", "fruit"] as const;
    for (const side of [-1, 1]) {
      for (let i = 2; i < spec.vaults - 2; i += 3) {
        const z = -endCentre + bay * (i + 0.5);
        const x = side * (outer + 1.4);
        b.props.push(
          ...stall([x, 0, z], side > 0 ? -Math.PI / 2 : Math.PI / 2, rand, goods[i % 4]!),
        );
        cast.add({
          at: [side * (outer + 0.5), 0, z],
          rotY: side > 0 ? Math.PI / 2 : -Math.PI / 2,
          action: "talk",
          role: "worker",
        });
        if (rand() < 0.7) {
          cast.add({
            at: [side * (outer + 2.6), 0, z + between(rand, -0.6, 0.6)],
            rotY: side > 0 ? -Math.PI / 2 : Math.PI / 2,
            action: rand() < 0.5 ? "talk" : "stand",
            ...(rand() < 0.4 ? { carry: "basket" as const } : {}),
          });
        }
      }
      cast.walk(
        [
          [side * (outer + 4), 0, -endCentre],
          [side * (outer + 4), 0, endCentre],
        ],
        {
          speed: 1,
          ...(rand() < 0.5 ? { carry: "amphora" as const, role: "worker" as const } : {}),
        },
      );
    }
    animal(b, "donkey", [outer + 5, 0, 0], 0, "walk", {
      route: [
        [outer + 5, 0, -endCentre * 0.8],
        [outer + 5, 0, endCentre * 0.8],
      ],
      speed: 0.7,
      load: true,
    });
  }
  return finish(b);
}

/**
 * A terrace house at dinner: the family on their couches in the back room, a
 * servant bringing wine, someone at the loom, a child by the pool, lamps lit.
 */
function houseLife(spec: PeristyleHouseSpec, era: Era): SceneLife {
  const b = make(era, 2718);
  const { cast, rand } = b;
  const halfW = spec.courtWidth / 2;
  const halfD = spec.courtDepth / 2;
  const wall = 0.45;
  const backZ = halfD + wall + spec.roomDepth / 2;
  const sideX = halfW + wall + spec.roomDepth / 2;

  /*
   * The dining room. In the house it was the room behind the court, but that
   * room sits behind a full-height wall from every angle the model is seen
   * from, so the dinner is laid in the open side room instead: three couches
   * round a low table, the way a triclinium was set.
   */
  const dx = sideX;
  const couch = (at: Vec3, rotY: number) => {
    b.props.push(box("timber", at, [2.0, 0.42, 0.9], rotY));
    b.props.push(box("linen", [at[0], at[1] + 0.42, at[2]], [1.95, 0.12, 0.85], rotY));
    b.props.push(
      box("paintRed", turn([at[0], at[1] + 0.54, at[2]], rotY, -0.8, 0, 0), [0.3, 0.14, 0.7], rotY),
    );
  };
  couch([dx + 1.5, 0, 0], -Math.PI / 2);
  couch([dx, 0, 1.75], 0);
  couch([dx, 0, -1.75], Math.PI);
  b.props.push(cyl("timber", [dx, 0, 0], 0.4, 0.45, 0.55, 14));
  b.props.push(...jar([dx + 0.1, 0.55, -0.1], 0.3));
  b.props.push(cyl("bronze", [dx - 0.18, 0.55, 0.15], 0.12, 0.08, 0.04, 12));
  for (const [x, z, r] of [
    [dx + 1.5, 0.4, -Math.PI / 2],
    [dx + 1.5, -0.5, -Math.PI / 2],
    [dx - 0.3, 1.75, Math.PI],
    [dx + 0.4, -1.75, 0],
  ] as const) {
    cast.add({ at: [x, 0.54, z], rotY: r, action: rand() < 0.5 ? "talk" : "sit" });
  }
  // The servant with the wine, coming from the store at the front.
  cast.walk(
    [
      // Round the end of the pier, since the court and the room do not open
      // onto each other in the model.
      [halfW - 0.8, 0, -halfD - 1.4],
      [dx - 1.2, 0, -halfD - 1.0],
      [dx - 1.0, 0, -0.9],
    ],
    { role: "worker", carry: "amphora", speed: 0.55 },
  );
  cast.add({
    at: [dx - 1.2, 0, 1.0],
    rotY: Math.PI / 2,
    action: "play",
    role: "musician",
    carry: "lyre",
    female: true,
  });
  // A woman at the loom in the other side room.
  const loomX = -sideX - 0.8;
  b.props.push(box("timber", [loomX, 0, -1.2], [0.08, 2.0, 0.08]));
  b.props.push(box("timber", [loomX, 0, 0.6], [0.08, 2.0, 0.08]));
  b.props.push(box("timber", [loomX, 1.9, -0.3], [0.1, 0.1, 2.0]));
  b.props.push(box("paintBlue", [loomX, 0.7, -0.3], [0.02, 1.2, 1.6]));
  for (let i = 0; i < 6; i += 1)
    b.props.push(cyl("terracotta", [loomX, 0.55, -1.0 + i * 0.28], 0.04, 0.05, 0.1, 6));
  cast.add({ at: [loomX + 0.6, 0, -0.3], rotY: -Math.PI / 2, action: "tend", female: true });
  // A child at the pool, and someone reading in the colonnade.
  cast.add({
    at: [spec.poolWidth / 2 + 0.6, 0, -0.6],
    rotY: -Math.PI / 2,
    action: "play",
    role: "child",
  });
  cast.add({
    at: [-halfW + 0.9, 0, -halfD + 2.2],
    rotY: Math.PI / 2,
    action: "read",
    carry: "scroll",
  });
  cast.add({
    at: [-spec.poolWidth / 2 - 0.5, 0, 0.8],
    rotY: Math.PI / 2,
    action: "stand",
    carry: "jar",
    female: true,
  });
  cast.walk(
    [
      [-halfW + 0.7, 0, -halfD + 0.7],
      [halfW - 0.7, 0, -halfD + 0.7],
      [halfW - 0.7, 0, halfD - 0.7],
      [-halfW + 0.7, 0, halfD - 0.7],
    ],
    { role: "worker", speed: 0.5 },
  );
  // Plants in pots round the pool, and lamps on stands for the evening.
  for (const [x, z] of [
    [-halfW + 1, -halfD + 1],
    [halfW - 1, -halfD + 1],
    [-halfW + 1, halfD - 1],
    [halfW - 1, halfD - 1],
  ] as const) {
    b.props.push(cyl("terracotta", [x, 0, z], 0.22, 0.3, 0.5, 12));
    b.props.push(
      decor({
        kind: "loft",
        material: "foliage",
        at: [x, 0.45, z],
        rotY: 0,
        sections: [
          { c: [0, 0, 0], rx: 0.2, ry: 0.2 },
          { c: [0, 0.35, 0], rx: 0.5, ry: 0.5 },
          { c: [0, 0.8, 0], rx: 0.35, ry: 0.35 },
          { c: [0, 1.0, 0], rx: 0.05, ry: 0.05 },
        ],
      }),
    );
  }
  for (const [x, z, light] of [
    [dx - 0.9, 2.2, true],
    [dx - 0.9, -2.3, false],
    [loomX + 1.2, 0.8, false],
  ] as const) {
    fire(b, lampstand([x, 0, z], 1.4), 0.12, light);
  }
  fire(b, brazier([halfW - 1.1, 0, halfD - 2.2], 0.8), 0.3, true);
  b.props.push(...amphora([halfW - 0.5, 0, -halfD - 1.6]));
  b.props.push(...amphora([halfW - 0.9, 0, -halfD - 1.8], 0.95));
  void backZ;
  dog(b, [spec.poolWidth / 2 + 0.9, 0, 1.3]);
  /*
   * The rest of the household. In the left-hand room, behind the loom: the
   * kitchen hearth with its pots, shelves of jars, a bed with its bolster in
   * the far corner, and the lararium — the little painted shrine of the
   * household gods, a lamp burning in front of it.
   */
  const ox = -sideX;
  const wallX = -(sideX + spec.roomDepth / 2) + 0.35;
  // Hearth.
  b.props.push(box("stone", [ox + 0.6, 0, -halfD + 1.4], [1.6, 0.8, 0.9]));
  b.props.push(box("stoneDark", [ox + 0.6, 0.8, -halfD + 1.4], [1.3, 0.04, 0.7]));
  b.props.push(...jar([ox + 0.2, 0.84, -halfD + 1.4], 0.32));
  b.props.push(cyl("bronze", [ox + 0.95, 0.84, -halfD + 1.3], 0.16, 0.2, 0.18, 12));
  b.flames.push({ at: [ox + 0.85, 0.86, -halfD + 1.5], size: 0.25, light: true, smoke: true });
  cast.add({ at: [ox + 0.6, 0, -halfD + 2.4], rotY: Math.PI, action: "tend", female: true });
  // Shelves of jars and bowls on the outer wall.
  for (const y of [0.9, 1.6]) {
    b.props.push(box("timber", [wallX, y, -halfD + 3.3], [0.35, 0.05, 2.2]));
    for (let k = 0; k < 5; k += 1)
      b.props.push(...jar([wallX, y + 0.05, -halfD + 2.4 + k * 0.45], 0.18 + (k % 2) * 0.05));
  }
  // The bed.
  b.props.push(box("timber", [wallX + 0.6, 0, halfD - 1.4], [1.0, 0.5, 2.0]));
  b.props.push(box("linen", [wallX + 0.6, 0.5, halfD - 1.4], [0.95, 0.14, 1.95]));
  b.props.push(box("paintBlue", [wallX + 0.6, 0.64, halfD - 1.0], [0.9, 0.06, 1.1]));
  b.props.push(
    cyl("paintRed", [wallX + 0.6 - 0.4, 0.72, halfD - 2.25], 0.1, 0.1, 0.8, 10, {
      rotX: Math.PI / 2,
      rotY: Math.PI / 2,
    }),
  );
  // The lararium.
  const lz = 1.6;
  b.props.push(box("marble", [wallX, 1.0, lz], [0.4, 0.12, 1.0]));
  b.props.push(box("paintRed", [wallX - 0.12, 1.12, lz], [0.04, 0.8, 0.9]));
  for (const dz of [-0.38, 0.38])
    b.props.push(cyl("marble", [wallX + 0.1, 1.12, lz + dz], 0.04, 0.035, 0.7, 10));
  b.props.push(
    decor({
      kind: "prism",
      material: "marble",
      at: [wallX + 0.05, 1.82, lz],
      size: [1.0, 0.25, 0.35],
      rotY: Math.PI / 2,
    }),
  );
  for (const dz of [-0.18, 0.18]) {
    b.props.push(
      decor({
        kind: "figure",
        material: "bronze",
        at: [wallX + 0.05, 1.12, lz + dz],
        height: 0.32,
        rotY: Math.PI / 2,
        identity: {
          name: "Lar",
          sex: "male",
          bearded: false,
          hair: "curls",
          dress: "chiton",
          right: "phiale",
          left: "cornucopia",
        },
      }),
    );
  }
  fire(b, lampstand([wallX + 0.45, 0, lz], 1.15), 0.08, false);
  return finish(b);
}

/**
 * The Mausoleum at the funeral games for the dynast: a procession of mourners
 * and torch-bearers round the podium, the priest at the altar in front, guards
 * at the corners, and offerings laid out.
 */
function mausoleumLife(spec: MausoleumSpec, era: Era): SceneLife {
  const b = make(era, 3531);
  const { cast, rand } = b;
  const hw = spec.baseWidth / 2 + 4;
  const hd = spec.baseDepth / 2 + 4;
  const loop: Vec3[] = [
    [-hw, 0, -hd],
    [hw, 0, -hd],
    [hw, 0, hd],
    [-hw, 0, hd],
  ];
  const perimeter = 4 * (hw + hd);
  for (let i = 0; i < 14; i += 1) {
    // Spread the procession round the loop by starting each at a different corner
    // and point along its first side.
    const corner = i % 4;
    const route = [...loop.slice(corner), ...loop.slice(0, corner)];
    const a = route[0]!;
    const n = route[1]!;
    const t = (i / 14) * 0.9;
    route[0] = [a[0] + (n[0] - a[0]) * t, 0, a[2] + (n[2] - a[2]) * t];
    cast.walk(route, {
      role: i % 3 === 0 ? "priest" : "mourner",
      ...(i % 2 === 0
        ? { carry: "torch" as const }
        : i % 3 === 1
          ? { carry: "offering" as const }
          : {}),
      speed: 0.5,
    });
  }
  void perimeter;
  const altarZ = -spec.baseDepth / 2 - 9;
  fire(b, altar([0, 0, altarZ], 3.2, 2, 1.3), 0.9, true, true);
  cast.add({
    at: [0, 0, altarZ + 1.6],
    rotY: Math.PI,
    action: "tend",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [-2.2, 0, altarZ + 0.6],
    rotY: Math.PI * 0.7,
    action: "play",
    role: "musician",
    carry: "aulos",
  });
  for (let i = 0; i < 8; i += 1) {
    const at: Vec3 = [between(rand, -9, 9), 0, altarZ - between(rand, 2.5, 7)];
    cast.add({
      at,
      rotY: facing(-at[0] * 0.2, 1),
      action: rand() < 0.5 ? "pray" : "stand",
      role: "mourner",
    });
  }
  for (const [x, z] of [
    [-spec.baseWidth / 2 - 1.5, -spec.baseDepth / 2 - 1.5],
    [spec.baseWidth / 2 + 1.5, -spec.baseDepth / 2 - 1.5],
    [-spec.baseWidth / 2 - 1.5, spec.baseDepth / 2 + 1.5],
    [spec.baseWidth / 2 + 1.5, spec.baseDepth / 2 + 1.5],
  ] as const) {
    cast.add({
      at: [x, 0, z],
      rotY: facing(x, z),
      action: "stand",
      role: "soldier",
      carry: "spear",
      carryLeft: "shield",
    });
    fire(b, brazier([x * 0.92, 0, z * 0.92 + (z < 0 ? 1.4 : -1.4)], 1.2), 0.5, z < 0, true);
  }
  // Offerings at the foot of the podium: amphorae and baskets.
  for (let i = 0; i < 6; i += 1) {
    b.props.push(
      ...amphora([between(rand, -6, 6), 0, -spec.baseDepth / 2 - 0.9], between(rand, 0.85, 1)),
    );
  }
  // The horses of the funeral games, led round; an ox for the altar.
  for (let i = 0; i < 3; i += 1) {
    const corner = (i + 2) % 4;
    const route = [...loop.slice(corner), ...loop.slice(0, corner)];
    animal(b, "horse", route[0]!, 0, "walk", {
      route,
      speed: 0.5,
      dressed: pick(rand, [0x9c3a2c, 0x2f5b86, 0xc19a3e]),
      ...(i === 0 ? { rider: dress(rand, b.era, "soldier") } : {}),
    });
  }
  animal(b, "ox", [2.6, 0, altarZ - 1.2], -Math.PI / 2, "stand", {
    colour: 0xece6d8,
    dressed: 0xc0392b,
  });
  return finish(b);
}

/**
 * Nemrut on the king's birthday, as his own law ordered it kept: the priests
 * in the Persian dress he gave them, incense on the altars before each god, a
 * fire on the stepped altar, and the people of Commagene come up the mountain
 * to feast.
 */
function tumulusLife(spec: TumulusSanctuarySpec, era: Era): SceneLife {
  const b = make(era, 6234);
  const { cast, rand } = b;
  const altarX = spec.courtDepth - 4;
  const altarTop = spec.altarSteps * 0.8;
  const halfCourt = spec.courtWidth / 2;

  b.flames.push({ at: [altarX, altarTop, 0], size: 1.5, light: true, smoke: true });
  cast.add({
    at: [altarX - 0.8, altarTop, 0.3],
    rotY: Math.PI / 2,
    action: "tend",
    role: "priest",
    carry: "incense",
  });
  cast.add({ at: [altarX - 4.3, 0, -1.6], rotY: -Math.PI / 2, action: "pray", role: "priest" });
  cast.add({
    at: [altarX - 4.3, 0, 1.6],
    rotY: -Math.PI / 2,
    action: "play",
    role: "musician",
    carry: "aulos",
  });
  // An incense burner before each god, and a priest at it.
  for (let i = 0; i < spec.colossi; i += 1) {
    const z = ((spec.colossi - 1) / 2 - i) * (spec.throneBase + 0.8);
    fire(b, brazier([3.6, 0, z], 0.9), 0.32, i === 2, true);
    if (i % 2 === 0) {
      cast.add({
        at: [4.5, 0, z + 0.5],
        rotY: -Math.PI / 2,
        action: "pray",
        role: "priest",
        carry: i === 0 ? "barsom" : "incense",
      });
    }
  }
  // Pilgrims coming up into the court from the east with their offerings.
  for (let i = 0; i < 10; i += 1) {
    const z = between(rand, -halfCourt + 2, halfCourt - 2);
    cast.walk(
      [
        [spec.courtDepth + 3, 0, z],
        [altarX + 4.5, 0, z * 0.7],
        [8, 0, z * 0.8],
        [6, 0, z],
      ],
      {
        role: i === 0 ? "official" : i % 4 === 0 ? "worker" : "citizen",
        carry: pick(rand, ["offering", "jar", "basket", "amphora", "torch"] as const),
        speed: 0.6,
      },
    );
  }
  // Feasting along the stelae, as the law laid down: wine and meat for all.
  for (const side of [-1, 1]) {
    const z = side * (halfCourt - 2);
    b.props.push(...table([12, 0, z], 4, 0.9, 0.75, 0));
    b.props.push(...jar([11, 0.75, z], 0.3));
    b.props.push(...jar([13, 0.75, z], 0.28));
    for (let k = 0; k < 4; k += 1) {
      cast.add({
        at: [10.6 + k * 0.95, 0, z - side * 0.9],
        rotY: side > 0 ? 0 : Math.PI,
        action: rand() < 0.6 ? "talk" : "stand",
      });
    }
    b.props.push(...amphora([15, 0, z + side * 0.4]));
    b.props.push(...amphora([15.5, 0, z - side * 0.2], 0.9));
  }
  cast.add({
    at: [20, 0, -halfCourt + 1.5],
    rotY: 0.4,
    action: "stand",
    role: "soldier",
    carry: "spear",
    carryLeft: "shield",
  });
  cast.add({
    at: [20, 0, halfCourt - 1.5],
    rotY: Math.PI - 0.4,
    action: "stand",
    role: "soldier",
    carry: "spear",
    carryLeft: "shield",
  });
  // Torches along the rows of stelae.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i += 2) {
      fire(b, torchStand([6.6 + i * 3.2, 0, side * (halfCourt - 0.2)], 2), 0.34, i === 2);
    }
  }
  // The sacrificial ox at the altar, and a herd on the slope below the
  // terrace with its shepherd.
  animal(b, "ox", [altarX - 4.6, 0, 3.4], Math.PI / 2, "stand", {
    colour: 0xece6d8,
    dressed: 0xd4ae52,
  });
  flock(b, "goat", [spec.courtDepth + 9, 0, -halfCourt - 6], 9, 5);
  flock(b, "sheep", [spec.courtDepth + 4, 0, halfCourt + 8], 8, 4);
  cast.add({
    at: [spec.courtDepth + 6, 0, -halfCourt - 3],
    rotY: 2.4,
    action: "stand",
    role: "worker",
    carry: "staff",
  });
  return finish(b);
}

/* ------------------------------------------------------------------ *
 * The statues this module adds, and the era of each scene
 * ------------------------------------------------------------------ */

export const STATUES = {
  /** Athena, helmeted, with spear and shield: wisdom, for a library. */
  athena: {
    name: "Athena",
    sex: "female",
    hair: "long",
    headgear: "helmet",
    dress: "peplos",
    right: "spear",
    left: "shield",
  },
} satisfies Record<string, FigureIdentity>;

/**
 * The gods, Muses and worthies a Roman stage front or a temple roof was
 * crowded with. Each has the attribute that names it — Dionysos's cup and
 * thyrsos, Tyche's crown and horn, a Muse's scroll — and is dealt its own
 * face, so a row of them reads as a company of individuals.
 */
const PANTHEON: FigureIdentity[] = [
  {
    name: "Dionysos",
    sex: "male",
    bearded: false,
    hair: "long",
    headgear: "diadem",
    dress: "himation",
    right: "phiale",
    left: "sceptre",
  },
  { name: "Muse", sex: "female", hair: "bun", dress: "chiton", left: "scroll", gesture: "chin" },
  {
    name: "Apollon",
    sex: "male",
    bearded: false,
    hair: "long",
    headgear: "diadem",
    dress: "chiton",
    left: "bow",
    gesture: "raised",
  },
  {
    name: "Tyche",
    sex: "female",
    hair: "long",
    headgear: "muralCrown",
    dress: "peplos",
    left: "cornucopia",
    right: "phiale",
  },
  {
    name: "Emperor",
    sex: "male",
    bearded: true,
    hair: "curls",
    dress: "toga",
    left: "scroll",
    gesture: "raised",
  },
  {
    name: "Muse",
    sex: "female",
    hair: "long",
    headgear: "diadem",
    dress: "peplos",
    left: "tablet",
    gesture: "rest",
  },
  { name: "Herakles", sex: "male", bearded: true, hair: "curls", dress: "himation", right: "club" },
  { name: "Nike", sex: "female", hair: "bun", dress: "chiton", right: "wreath" },
  {
    name: "Zeus",
    sex: "male",
    bearded: true,
    hair: "long",
    headgear: "diadem",
    dress: "himation",
    left: "sceptre",
    right: "thunderbolt",
  },
  { name: "Muse", sex: "female", hair: "bun", headgear: "veil", dress: "chiton", gesture: "veil" },
  {
    name: "Asklepios",
    sex: "male",
    bearded: true,
    hair: "long",
    dress: "himation",
    right: "sceptre",
  },
  {
    name: "Aphrodite",
    sex: "female",
    hair: "bun",
    headgear: "diadem",
    dress: "chiton",
    right: "phiale",
    gesture: "rest",
  },
];

const PALETTES: FigurePaint[] = [
  { cloth: 0xe9e0cc, mantle: 0x7e98b4, hair: 0x6e4a2c, accent: 0xc8a24a, skin: 0xf2dcc6 },
  { cloth: 0xead8b4, mantle: 0xb4644f, hair: 0x5a3a22, accent: 0xc8a24a, skin: 0xeed2b6 },
  { cloth: 0xdde4d0, mantle: 0x8a7a4a, hair: 0x4a3020, accent: 0x7e98b4, skin: 0xf2dcc6 },
  { cloth: 0xefe2c8, mantle: 0x8a5a7e, hair: 0x3a2a1c, accent: 0xc8a24a, skin: 0xeed2b6 },
  { cloth: 0xe4ecf0, mantle: 0xc9a24e, hair: 0x6e4a2c, accent: 0x6e86a4, skin: 0xf2dcc6 },
  { cloth: 0xc4806c, mantle: 0xe9e0cc, hair: 0x8a6a3a, accent: 0xc8a24a, skin: 0xe6c8a8 },
];

/** A painted marble statue on a little plinth, as scenery. */
function statue(
  b: Builder,
  at: Vec3,
  height: number,
  rotY: number,
  index: number,
  material: Material = "marble",
  plinth = true,
) {
  const who = PANTHEON[index % PANTHEON.length]!;
  const base = plinth ? height * 0.08 : 0;
  if (plinth) b.props.push(box("marbleWorn", at, [height * 0.36, base, height * 0.32], rotY));
  b.props.push(
    decor({
      kind: "figure",
      material,
      at: [at[0], at[1] + base, at[2]],
      height,
      rotY,
      identity: who,
      ...(material === "marble" ? { paint: PALETTES[(index * 5) % PALETTES.length]! } : {}),
    }),
  );
}

const ERA: Record<string, Era> = {
  "celsus-kutuphanesi": "roman",
  "aspendos-tiyatrosu": "roman",
  "didyma-apollon-tapinagi": "hellenistic",
  "gobeklitepe-d-yapisi": "neolithic",
  "artemis-tapinagi": "hellenistic",
  "pergamon-zeus-sunagi": "hellenistic",
  "aphrodisias-stadyumu": "roman",
  "hierapolis-tiyatrosu": "roman",
  "milet-buyuk-tiyatro": "roman",
  "efes-yamac-evler": "roman",
  "efes-buyuk-tiyatro": "roman",
  "side-tiyatrosu": "roman",
  "perge-stadyumu": "roman",
  "aizanoi-zeus-tapinagi": "roman",
  "halikarnas-mozolesi": "carian",
  "nemrut-dogu-terasi": "commagene",
};

/** The scene for one reconstruction. */
export function lifeFor(item: Reconstruction): SceneLife {
  const era = ERA[item.id] ?? "roman";
  const seed = [...item.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const spec = item.model;
  switch (spec.kind) {
    case "roman-facade":
      return facadeLife(spec, era);
    case "roman-theatre":
      return theatreLife(spec, era, seed);
    case "ionic-dipteros":
      return templeLife(spec, era, item.id);
    case "neolithic-enclosure":
      return enclosureLife(spec, era);
    case "great-altar":
      return altarLife(spec, era);
    case "stadium":
      return stadiumLife(spec, era, seed);
    case "peristyle-house":
      return houseLife(spec, era);
    case "mausoleum":
      return mausoleumLife(spec, era);
    case "tumulus-sanctuary":
      return tumulusLife(spec, era);
  }
}
