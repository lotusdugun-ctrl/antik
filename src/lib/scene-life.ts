import { TEXTS, type EpigraphicText } from "@/lib/epigraphy";
import { inscription } from "@/lib/reconstruction-detail";
import {
  bankHeight,
  boundsOf,
  partsFor,
  stadiumLayout as layoutOfStadium,
  theatreLayout,
  horseStatue,
  ornateAltar,
  stadiumLayout,
  walkStartFor,
  type FigureIdentity,
  type FigurePaint,
  type Material,
  type Part,
  type Vec3,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import type { ScanId } from "@/lib/scans";
import { hittiteGateLayout, type HittiteGateSpec } from "@/lib/models/hattusa-aslanli-kapi";
import { troyLayout, type TroyCitadelSpec } from "@/lib/models/troya-vi-surlari";
import { townLayout, type NeolithicTownSpec } from "@/lib/models/catalhoyuk-dogu-hoyugu";
import type { CathedralSpec } from "@/lib/models/ani-katedrali";
import { nymphaeumLife } from "@/lib/models/sagalassos-antoninler-cesmesi-life";
import { villaLife } from "@/lib/models/zeugma-villa-life";
import { monasteryLife } from "@/lib/models/sumela-manastiri-life";
import { lighthouseLife } from "@/lib/models/patara-deniz-feneri-life";
import * as trades from "@/lib/scene-trades";
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
export type Era =
  | "neolithic"
  | "hellenistic"
  | "roman"
  | "commagene"
  | "carian"
  /** The Neolithic town: hides, and cloth woven from plant fibre. */
  | "village-neolithic"
  /** Hittite Anatolia in the Late Bronze Age. */
  | "hittite"
  /** The Late Bronze Age Troad. */
  | "bronze-age"
  /** Medieval Armenia, under the Bagratid kings. */
  | "medieval"
  /** An Orthodox monastery of the Pontic mountains: monks, lay brothers, pilgrims. */
  | "byzantine";

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
  | "veil"
  | "wreath"
  | "petasos"
  | "phrygian"
  | "tiara"
  | "helmet"
  | "mask"
  | "fillet"
  | "polos"
  /** A tall pointed cap, or a pointed helmet. */
  | "conical"
  | "turban"
  /** A pointed hood, as monks and priests wore it. */
  | "hood"
  /**
   * The felt cap of craftsmen, sailors and travellers — Hephaistos wears it on
   * the vases, and every potter and smith in the street did.
   */
  | "pilos"
  /** The broad, peaked straw sun-hat of the Tanagra women. */
  | "tholia"
  /** A close leather or felt skullcap: a mason's, a smith's, a medieval workman's. */
  | "skullcap"
  /** A working woman's headscarf, knotted at the nape: not a veil. */
  | "kerchief";

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
  | "barsom"
  /* The tools of the trades, each where that trade holds it. */
  /** The distaff with its wool, held up in the left hand to spin from. */
  | "distaff"
  /** A merchant's hand balance: a beam and two pans. */
  | "balance"
  | "cleaver"
  | "ladle"
  /** The mason's and sculptor's wooden mallet, in the other hand from the chisel. */
  | "mallet"
  | "saw"
  | "brush"
  | "broom"
  | "hoe"
  /** A begging bowl, or a busker's for the coins. */
  | "bowl"
  /** The shallow libation dish. */
  | "phiale"
  /** The tympanon, the frame drum of the dancers. */
  | "drum"
  | "hoop"
  /** A shepherd's crook. */
  | "crook"
  /** A bundle of reeds on the shoulder, for roofs and mats. */
  | "reeds"
  /** A sack of grain on the shoulder. */
  | "sack"
  /** A bound book, a codex: the monks' Gospels. */
  | "book"
  /**
   * A capsa: the round leather box, with its lid and carrying strap, that
   * Roman readers and library slaves carried rolls in, standing on end.
   */
  | "capsa"
  | "candle"
  /** The wooden board a monk beats to call the brothers to church. */
  | "semantron"
  /** The handles of an ard, the scratch plough, its beam running ahead. */
  | "plough"
  /** The stylus that writes on wax, or the reed on clay. */
  | "stylus"
  /** One end of the carrying pole two porters share (see `SceneLife.links`). */
  | "pole"
  /** A plasterer's float. */
  | "trowel"
  /** A fish held up for a buyer. */
  | "fish"
  /** The juggler's balls, kept in the air. */
  | "balls";

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
  | "drive"
  /* The trades. */
  /** At the wheel, seated low, both hands on the clay. */
  | "pot"
  /** At the upright loom, passing the weft and beating it up. */
  | "weave"
  /** Spinning: the distaff held up, the spindle twirling below the other hand. */
  | "spin"
  /** Writing on a tablet held in the other hand, or on the knee. */
  | "write"
  /** Counting coins out on a table. */
  | "count"
  /** Holding up a balance to weigh what is sold. */
  | "weigh"
  /** Bargaining: both hands open, the head shaking. */
  | "haggle"
  /** Crying wares: a hand at the mouth, the other waving. */
  | "call"
  /** Kneading dough on a board. */
  | "knead"
  /** Kneeling at a quern, pushing the rubbing stone to and fro. */
  | "grind"
  /** Bringing a cleaver down: a butcher, a fishmonger. */
  | "chop"
  /** Stirring a pot over the fire. */
  | "stir"
  /** Mallet and chisel at a block of stone. */
  | "carve"
  | "saw"
  /** A brush on a wall: a painter, or plaster smoothed with a float. */
  | "paint"
  | "sweep"
  /** Hoeing the ground. */
  | "hoe"
  /** Sitting on the ground with a hand held out. */
  | "beg"
  /** Pouring a libation from a dish. */
  | "pour"
  | "dance"
  | "juggle"
  /** An athlete loosening up: the arms swung over, the body bent. */
  | "stretch"
  /** Two wrestlers locked together (each one of the pair). */
  | "wrestle"
  /** The discus swung back to be thrown. */
  | "throw"
  /** Marching in step, the spear at the shoulder. */
  | "march"
  /** Throwing a ball to someone and catching it (see `SceneLife.links`). */
  | "toss"
  /** Squatting on the heels: knucklebones, or a closer look at something. */
  | "crouch"
  /** Leaning back against a wall, arms folded. */
  | "lean"
  /** Pointing something out. */
  | "point"
  /** Looking up at a building, hands behind the back. */
  | "gaze"
  /** Seated, and talking with the hands. */
  | "chat"
  /** Teaching: the scroll in one hand, the other raised to make the point. */
  | "lecture"
  /** Walking behind the plough, both hands on its handles. */
  | "plough"
  /** Beating the semantron. */
  | "strike";

/** How someone is built: most are neither, and the renderer leaves them as they are. */
export type Build = "slim" | "heavy";

/** How a man's beard is cut, when he has one. */
export type BeardStyle = "stubble" | "short" | "long" | "pointed";

/** A pattern woven into the main cloth. */
export type Pattern = "stripes" | "checks" | "dots";

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
  /** How the hair is dressed (see `HairStyle`). */
  hairStyle?: HairStyle;
  /** Gold earrings and a necklace, for a woman dressed to go out. */
  jewels?: boolean;
  build?: Build;
  /** Grey or white hair, a stoop, a slower walk. */
  old?: boolean;
  /** A man gone bald on top, the hair left round the sides. */
  bald?: boolean;
  beardStyle?: BeardStyle;
  pattern?: Pattern;
  /** A leather or linen apron, the colour given: the craftsman's. */
  apron?: number;
  /** A bag slung from the shoulder: a traveller's, a pilgrim's. */
  bag?: number;
  /** A purse at the belt: a trader's. */
  purse?: boolean;
  /** A wool shawl round the shoulders. */
  shawl?: number;
};

/**
 * How the hair is dressed. A woman's, when no veil covers it: a knot at the
 * nape, a braid wound round the head, the Roman "nodus" roll over the brow
 * with a knot behind, or long hair tied and falling down the back. A man's:
 * cropped short, in curls, worn long, or long and tied up behind.
 */
export type HairStyle =
  | "bun"
  | "crown"
  | "nodus"
  | "fall"
  /**
   * The Trajanic "orbis": a high crescent of tight curls built up over the
   * brow on a frame, the hair behind braided and coiled into a nest at the
   * crown — the fashion of the empress Plotina and of the well-off women of
   * the years the library was built.
   */
  | "orbis"
  | "short"
  | "curls"
  | "long"
  | "tied";
const HAIR_STYLES: HairStyle[] = ["bun", "crown", "nodus", "fall"];
/** In the Roman East of the second century, the orbis joins them. */
const ROMAN_HAIR_STYLES: HairStyle[] = [...HAIR_STYLES, "orbis"];

/**
 * A choice made from colours already rolled, so it costs no extra roll of
 * the die: every later roll — where people stand, which way they walk —
 * stays exactly as it was.
 */
const choose = (seed: number, n: number) => (((seed * 2654435761) >>> 0) >>> 8) % n;

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
  /**
   * A walker who stops now and then — to look, to rest, to greet someone —
   * for this share of the time, in pauses of a few seconds.
   */
  pause?: number;
  /**
   * A hand held out to the side to hold somebody else's: a parent's to a
   * child walking beside them, a couple's. -1 the right hand, 1 the left.
   */
  holds?: -1 | 1;
};

/**
 * Two people doing one thing together: two porters with an amphora slung
 * from the pole on their shoulders, two children throwing a ball. Indices
 * into `SceneLife.people`.
 */
export type Link = { a: number; b: number; kind: "pole" | "ball" };

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

export type Species =
  | "horse"
  | "ox"
  | "dog"
  | "goat"
  | "sheep"
  | "donkey"
  | "gazelle"
  /** The caravans of the Silk Road came into Ani on the backs of camels. */
  | "camel";

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
  /** People doing one thing together (see `Link`). */
  links?: Link[];
  /** Where a walk through the scene begins (see `walkStartFor`). */
  walkStart?: WalkStart;
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
  return individualise(baseDress(rand, era, role, female), era, role);
}

const GREY_HAIR = 0x9a948a;
const WHITE_HAIR = 0xd9d4ca;
/** Fairer skins, more common in the north — the Pontic valleys, the Caucasus. */
const FAIR_SKIN = [0xe0bc98, 0xd9b08c, 0xe6c4a2];
/**
 * Darker skins: the ports of Roman Asia had Egyptian, Nubian and Syrian
 * sailors and traders in their streets, and Commagene looked south as well
 * as west.
 */
const DARK_SKIN = [0x6e4630, 0x7c5236, 0x8a5a3a];

/** How the men of each period wore their hair, most usual first. */
const MEN_HAIR: Record<Era, HairStyle[]> = {
  roman: ["short", "short", "curls", "short", "curls"],
  hellenistic: ["curls", "short", "long", "curls"],
  carian: ["curls", "short", "long"],
  // Long, curled hair under the cap, as the Nemrut reliefs show it.
  commagene: ["long", "curls", "curls"],
  neolithic: ["long", "tied", "long", "short"],
  "village-neolithic": ["long", "tied", "short", "long"],
  // The Hittite reliefs give men long hair down the back, curled at the end.
  hittite: ["long", "long", "tied"],
  "bronze-age": ["long", "curls", "short"],
  medieval: ["short", "long", "curls"],
  byzantine: ["short", "curls", "long"],
};

/** Beards by period: the Antonine full beard, the philosopher's long one, the pointed Persian. */
const BEARDS: Record<Era, BeardStyle[]> = {
  roman: ["short", "short", "long", "stubble"],
  hellenistic: ["short", "long", "pointed", "stubble"],
  carian: ["short", "long", "pointed"],
  commagene: ["pointed", "long", "short"],
  neolithic: ["long", "short"],
  "village-neolithic": ["short", "long"],
  hittite: ["short", "pointed"],
  "bronze-age": ["short", "pointed", "long"],
  medieval: ["pointed", "short", "long"],
  byzantine: ["long", "long", "short"],
};

const LEATHERS = [0x6b4a30, 0x7a5a3c, 0x5e4430, 0x8a6a48];

/**
 * What makes one person not another: age, build, the hair and beard a man
 * wore, a cap, a purse, a shawl, a woven pattern, a darker or fairer skin.
 * Every choice is drawn from the colours `baseDress` already rolled, never
 * from a roll of its own, so nobody in a scene moves for it.
 */
function individualise(look: Look, era: Era, role: Role): Look {
  const out: Look = { ...look };
  const k =
    ((look.main * 7) ^
      (look.trim * 13) ^
      (look.skin * 3) ^
      (look.hair * 5) ^
      (look.female ? 0x9e37 : 0)) >>>
    0;
  const c = (salt: number, n: number) => choose(k ^ salt, n);
  const classical = era === "roman" || era === "hellenistic" || era === "carian";
  const neolithic = era === "neolithic" || era === "village-neolithic";
  const grown = role !== "child";
  const masked = look.headwear === "mask";

  // Skin: the mix each region had.
  if (classical && c(0x11, 13) === 0) out.skin = DARK_SKIN[c(0x12, 2)]!;
  else if (classical && c(0x13, 10) === 0) out.skin = FAIR_SKIN[c(0x14, 3)]!;
  else if (era === "commagene" && c(0x11, 7) === 0) out.skin = DARK_SKIN[2]!;
  else if ((era === "byzantine" || era === "medieval") && c(0x15, 3) === 0)
    out.skin = FAIR_SKIN[c(0x16, 3)]!;
  else if ((era === "hittite" || era === "bronze-age") && c(0x15, 9) === 0)
    out.skin = FAIR_SKIN[c(0x16, 3)]!;

  // Age: the old, grey or white, more often among priests and magistrates.
  const ageless = !grown || role === "athlete" || role === "soldier" || role === "actor" || masked;
  const odds = role === "priest" || role === "official" || role === "mourner" ? 3 : 6;
  if (!ageless && c(0x21, odds) === 0) {
    out.old = true;
    out.hair = c(0x22, 2) === 0 ? WHITE_HAIR : GREY_HAIR;
    // Hittite men were shaven, by the reliefs; elsewhere an old man let his beard grow.
    if (!out.female && era !== "hittite" && c(0x23, 3) !== 0) out.beard = true;
  }

  // Build: some slight, some heavy; athletes and children as they are.
  if (grown && role !== "athlete") {
    const b = c(0x31, 10);
    if (b < 2) out.build = "slim";
    else if (b < 4 && role !== "soldier") out.build = "heavy";
  }

  // A man's hair and beard.
  if (!out.female && !masked) {
    const styles = MEN_HAIR[era];
    out.hairStyle =
      era === "byzantine" && role === "priest" ? "tied" : styles[c(0x41, styles.length)]!;
    if (grown && (out.old ? c(0x42, 2) === 0 : c(0x43, 14) === 0)) out.bald = true;
    if (out.beard) {
      const cuts = BEARDS[era];
      out.beardStyle = out.old && c(0x44, 3) !== 0 ? "long" : cuts[c(0x45, cuts.length)]!;
    } else if (grown && !neolithic && era !== "hittite" && c(0x46, 7) === 0) {
      // A few days unshaven.
      out.beard = true;
      out.beardStyle = "stubble";
    }
  }

  // Caps and hats where the period wore them, for those still bareheaded.
  if (!out.headwear) {
    if (classical && role === "worker" && c(0x51, 3) === 0) out.headwear = "pilos";
    else if (classical && out.female && role === "citizen" && c(0x52, 11) === 0)
      out.headwear = "tholia";
    else if (era === "byzantine" && !out.female && role !== "priest" && c(0x54, 3) === 0)
      out.headwear = "pilos";
    else if (
      (era === "medieval" || era === "hittite" || era === "bronze-age") &&
      role === "worker" &&
      c(0x55, 3) === 0
    )
      out.headwear = "skullcap";
    else if (era === "village-neolithic" && c(0x57, 5) === 0) out.headwear = "fillet";
    else if (era === "medieval" && out.female && role === "citizen" && c(0x58, 4) === 0)
      out.headwear = "kerchief";
  } else if (era === "commagene" && look.headwear === "phrygian" && role !== "priest") {
    // A Persian-influenced court: some men wound a cloth round the head instead.
    if (c(0x53, 4) === 0) out.headwear = "turban";
    else if (c(0x59, 6) === 0) delete out.headwear;
  }

  // What is worn besides: a purse, a bag, a shawl.
  if (
    grown &&
    !out.female &&
    !neolithic &&
    role !== "soldier" &&
    role !== "athlete" &&
    c(0x61, 5) === 0
  )
    out.purse = true;
  if (grown && role !== "soldier" && role !== "athlete" && role !== "actor" && c(0x62, 9) === 0)
    out.bag = LEATHERS[c(0x63, LEATHERS.length)]!;
  if (out.female && out.headwear !== "veil" && c(0x64, out.old ? 2 : 6) === 0)
    out.shawl = c(0x65, 2) === 0 ? shade(look.trim, 0.85) : WORK_CLOTH[c(0x66, WORK_CLOTH.length)]!;

  // Woven patterns, where the period's cloth carried them.
  const woven = out.garment === "tunic" || out.garment === "robe";
  if (
    woven &&
    (era === "hittite" ||
      era === "bronze-age" ||
      era === "medieval" ||
      era === "village-neolithic") &&
    role !== "priest" &&
    role !== "soldier"
  ) {
    const p = c(0x71, 6);
    if (p === 0) out.pattern = "stripes";
    else if (p === 1) out.pattern = "checks";
  } else if (era === "commagene" && out.garment === "persian" && c(0x72, 3) === 0) {
    // The Nemrut reliefs dress king and gods in cloth sown with rosettes.
    out.pattern = "dots";
  } else if (
    classical &&
    out.female &&
    (out.garment === "chiton" || out.garment === "peplos") &&
    role === "citizen" &&
    c(0x73, 6) === 0
  ) {
    out.pattern = "dots";
  }
  return out;
}

/** A colour a little darker or lighter. */
function shade(hex: number, k: number): number {
  const r = Math.min(255, Math.round(((hex >> 16) & 255) * k));
  const g = Math.min(255, Math.round(((hex >> 8) & 255) * k));
  const b = Math.min(255, Math.round((hex & 255) * k));
  return (r << 16) | (g << 8) | b;
}

function baseDress(rand: Rand, era: Era, role: Role, female?: boolean): Look {
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

  if (era === "village-neolithic") {
    // Skins, and plain cloth woven from plant fibre: both were found here.
    const woven = rand() < 0.45;
    return {
      ...base,
      garment: woven ? "tunic" : "hide",
      main: woven ? pick(rand, [DYE.linen, DYE.oat, DYE.wool, 0xb59a70]) : pick(rand, HIDE),
      trim: woven ? pick(rand, HIDE) : rand() < 0.4 ? 0xb4652e : pick(rand, HIDE),
      hair: pick(rand, HAIR.slice(0, 4)),
      beard: !isFemale && rand() < 0.6,
      ...(isFemale ? { hairStyle: rand() < 0.5 ? ("fall" as const) : ("bun" as const) } : {}),
    };
  }

  if (era === "hittite" || era === "bronze-age") {
    const hittite = era === "hittite";
    const cloth = [
      DYE.linen,
      DYE.wool,
      DYE.oat,
      DYE.madder,
      DYE.weld,
      DYE.ochre,
      DYE.woad,
      DYE.brown,
    ];
    if (role === "priest" || role === "priestess") {
      const female = role === "priestess";
      return {
        ...base,
        female,
        garment: "robe",
        main: DYE.white,
        trim: female ? pick(rand, [DYE.madder, DYE.woad]) : hittite ? DYE.madder : DYE.weld,
        beard: false,
        // The tall pointed cap of the Hittite priest and king; at Troy a fillet.
        headwear: female ? "polos" : hittite ? "conical" : "fillet",
        ...(female ? { jewels: true } : {}),
      };
    }
    if (role === "soldier") {
      return {
        ...base,
        female: false,
        garment: "tunic",
        main: pick(rand, [DYE.wool, DYE.oat, DYE.linen]),
        // The trim colours the belt and the pointed bronze helmet.
        trim: 0xa8843e,
        beard: !hittite && rand() < 0.5,
        headwear: "conical",
      };
    }
    if (role === "worker" || role === "child") {
      return {
        ...base,
        ...(role === "worker" ? { female: false } : {}),
        garment: "tunic",
        main: pick(rand, role === "child" ? [DYE.linen, DYE.wool, DYE.weld] : WORK_CLOTH),
        trim: pick(rand, WORK_CLOTH),
        beard: role === "worker" && rand() < (hittite ? 0.2 : 0.5),
      };
    }
    if (isFemale) {
      // A long gown; the hair long down the back, sometimes under a tall cap.
      const capped = hittite && rand() < 0.3;
      return {
        ...base,
        garment: "robe",
        main: pick(rand, cloth),
        trim: pick(rand, cloth),
        hairStyle: rand() < 0.6 ? "fall" : "bun",
        ...(capped
          ? { headwear: "polos" as const }
          : rand() < 0.3
            ? { headwear: "fillet" as const }
            : {}),
        jewels: rand() < 0.6,
      };
    }
    const long = rand() < (hittite ? 0.45 : 0.35);
    return {
      ...base,
      garment: long ? "robe" : "tunic",
      main: pick(rand, cloth),
      trim: pick(rand, cloth),
      // Hittite men are shown clean-shaven on the reliefs, as a rule.
      beard: rand() < (hittite ? 0.15 : 0.55),
      ...(hittite && long && rand() < 0.3 ? { headwear: "conical" as const } : {}),
    };
  }

  if (era === "byzantine") {
    // Monks in black, with the hood drawn up; pilgrims and lay brothers in
    // the undyed and dark homespun of mountain villages.
    if (role === "priest")
      return {
        ...base,
        female: false,
        garment: "robe",
        main: 0x23211e,
        trim: 0x34312c,
        beard: true,
        headwear: "hood",
      };
    if (isFemale)
      return {
        ...base,
        garment: "robe",
        main: pick(rand, [DYE.black, DYE.brown, DYE.madder, DYE.woad]),
        trim: pick(rand, [DYE.white, DYE.weld]),
        headwear: "veil",
      };
    return {
      ...base,
      female: false,
      garment: rand() < 0.5 ? "tunic" : "robe",
      main: pick(rand, [DYE.brown, DYE.grey, DYE.wool, DYE.black]),
      trim: pick(rand, WORK_CLOTH),
      beard: role !== "child" && rand() < 0.8,
    };
  }

  if (era === "medieval") {
    if (role === "priest") {
      return {
        ...base,
        female: false,
        garment: "robe",
        main: 0x2b2723,
        trim: 0x3e3a34,
        beard: true,
        headwear: "hood",
      };
    }
    if (role === "soldier") {
      return {
        ...base,
        female: false,
        garment: "persian",
        main: pick(rand, [DYE.madder, DYE.brown, DYE.woad, DYE.green]),
        trim: 0x8f8d86,
        beard: rand() < 0.8,
        headwear: "conical",
      };
    }
    if (role === "worker" || role === "child") {
      return {
        ...base,
        ...(role === "worker" ? { female: false } : {}),
        garment: "tunic",
        main: pick(rand, WORK_CLOTH),
        trim: pick(rand, WORK_CLOTH),
        beard: role === "worker" && rand() < 0.7,
      };
    }
    if (isFemale) {
      const veiled = rand() < 0.5;
      return {
        ...base,
        garment: "robe",
        main: pick(rand, [DYE.madder, DYE.woad, DYE.green, DYE.purple, DYE.linen, DYE.ochre]),
        trim: pick(rand, [DYE.weld, DYE.white, DYE.madder, DYE.black]),
        ...(veiled ? { headwear: "veil" as const } : { hairStyle: "fall" as const }),
        jewels: rand() < 0.5,
      };
    }
    return {
      ...base,
      garment: "persian",
      main: pick(rand, [DYE.madder, DYE.woad, DYE.green, DYE.brown, DYE.wool, DYE.ochre]),
      trim: pick(rand, [DYE.weld, DYE.white, DYE.black, DYE.madder]),
      beard: rand() < 0.85,
      ...(rand() < 0.55 ? { headwear: "turban" as const } : {}),
    };
  }

  if (era === "commagene" && role !== "child" && role !== "worker") {
    const priest = role === "priest";
    const look: Look = {
      ...base,
      female: priest ? false : isFemale,
      garment: "persian",
      main: priest ? pick(rand, [DYE.purple, DYE.madder, DYE.white]) : pick(rand, GREEK_CLOTH),
      trim: priest ? DYE.weld : pick(rand, [DYE.madder, DYE.woad, DYE.weld, DYE.purple]),
      beard: !isFemale && rand() < 0.75,
      headwear: priest ? (rand() < 0.5 ? "tiara" : "phrygian") : isFemale ? "veil" : "phrygian",
    };
    // A Commagenian woman: veiled only now and then, her hair dressed otherwise.
    if (look.female && !priest && choose(look.main ^ skin, 3) !== 0) {
      delete look.headwear;
      look.hairStyle = HAIR_STYLES[choose(look.trim ^ hair, HAIR_STYLES.length)]!;
      look.jewels = true;
    }
    return look;
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
        hairStyle: HAIR_STYLES[choose(skin ^ hair, HAIR_STYLES.length)]!,
        jewels: true,
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
        // Half the women mourners draw the mantle over the head; the rest
        // wear the hair loose down the back, the other sign of grief.
        ...(isFemale
          ? choose(skin ^ hair, 2) === 0
            ? { headwear: "veil" as const }
            : { hairStyle: "fall" as const }
          : {}),
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
        const garment: Garment = rand() < 0.55 ? "peplos" : "chiton";
        const main = pick(rand, GREEK_CLOTH);
        const trim = pick(rand, GREEK_CLOTH);
        /*
         * Most women in the street went bareheaded, their hair dressed; a
         * mantle drawn up over the head was for some — a matron at a rite,
         * or out in the sun — not the rule.
         */
        const veiled = rand() < 0.12;
        const styles = era === "roman" ? ROMAN_HAIR_STYLES : HAIR_STYLES;
        const style = styles[choose(main ^ (trim << 1) ^ skin, styles.length)]!;
        const band = choose(trim ^ hair, 5);
        return {
          ...base,
          garment,
          main,
          trim,
          ...(veiled
            ? { headwear: "veil" as const }
            : {
                hairStyle: style,
                // A ribbon or a fillet in the hair, now and then.
                ...(band === 0 ? { headwear: "fillet" as const } : {}),
              }),
          jewels: choose(main ^ hair, 3) !== 0,
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
  /** What the part needs over what the die gave: an apron, a cap, old age. */
  outfit?: Partial<Look>;
};

type WalkInit = Omit<PersonInit, "at" | "rotY" | "action" | "route"> & {
  /** How they go: a march, a sweep of the broom, a run — a walk by default. */
  gait?: Action;
};

class Cast {
  people: Person[] = [];
  /** Pairs doing one thing together, resolved to indices when the scene is finished. */
  links: [Person, Person, Link["kind"]][] = [];
  constructor(
    private rand: Rand,
    private era: Era,
  ) {}
  add(init: PersonInit): Person {
    const { role = "citizen", female, height, outfit, ...rest } = init;
    const rolled = dress(this.rand, this.era, role, female);
    const look: Look = outfit ? { ...rolled, ...outfit } : rolled;
    if (outfit?.old && outfit.hair === undefined && !rolled.old) {
      look.hair = choose(rolled.main ^ rolled.skin, 2) === 0 ? WHITE_HAIR : GREY_HAIR;
    }
    // Children from four or five years old to ten or so; grown people of every height.
    const tall =
      height ??
      (role === "child"
        ? between(this.rand, 1.02, 1.34)
        : look.female
          ? between(this.rand, 1.48, 1.7)
          : between(this.rand, 1.58, 1.86));
    const person: Person = {
      ...rest,
      look,
      // The old stoop, and stand a little shorter for it.
      height: look.old && height === undefined ? tall * 0.97 : tall,
      phase: this.rand() * TAU,
    };
    // The old go slower about the town; a procession keeps its own pace.
    if (look.old && person.speed !== undefined && person.speed > 0.85) person.speed *= 0.72;
    this.people.push(person);
    return person;
  }
  /** Someone walking a loop, starting at its first point. */
  walk(route: Vec3[], init: WalkInit = {}) {
    const [a, b] = [route[0]!, route[1] ?? route[0]!];
    const { gait, ...rest } = init;
    return this.add({
      ...rest,
      at: a,
      rotY: facing(b[0] - a[0], b[2] - a[2]),
      action: gait ?? (init.carry === "torch" || init.role !== "athlete" ? "walk" : "run"),
      route,
      speed: init.speed ?? between(this.rand, 0.9, 1.35),
    });
  }
  /** Two people doing one thing together. */
  link(a: Person, b: Person, kind: Link["kind"]) {
    this.links.push([a, b, kind]);
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
 * Every statue stands in a real scan of an ancient statue of the same type,
 * never in the procedural figure, which reads as a doll: Athena in a
 * caryatid of her own Erechtheion, Zeus in the bearded Neptune of Nîmes, an
 * emperor in the veiled Tiberius. A bronze or gilded statue takes the same
 * scans; the renderer gives the surface the colour of the metal.
 */
const SCAN_OF: Partial<Record<string, ScanId[]>> = {
  /** A goddess draped and standing: no scan of an Aphrodite of the kind survives here. */
  Aphrodite: ["ephesus-portrait", "caryatid"],
  /** Athena in her peplos: a maiden of her own temple on the Acropolis. */
  Athena: ["caryatid"],
  Zeus: ["neptune"],
  Emperor: ["tiberius-velatus", "hadrian-troy"],
  Apollon: ["apollo-kitharoidos"],
  Dionysos: ["magdalensberg-youth", "antinous"],
  Hermes: ["hermes-sandal"],
  /**
   * Herakles as the young athlete-hero, the type of the Lansdowne Herakles: a
   * nude youth of the same Polykleitan-Lysippan build stands in for him. (The
   * cast of the Lansdowne Herakles once used here was licensed for
   * non-commercial use only.)
   */
  Herakles: ["magdalensberg-youth", "hermes-sandal", "antinous"],
  Pan: ["pan"],
  Asklepios: ["asklepios"],
  Nike: ["nike"],
  /** Tyche wore the same mural crown as the Cybele of Pergamon. */
  Tyche: ["cybele"],
  Amazon: ["amazon-wounded"],
  /** The Muse who sits with her hand to her chin, as the "Penelope" does. */
  "Muse (thinking)": ["penelope", "muse-clio"],
  "Muse (with tablet)": ["muse-polyhymnia"],
  "Muse (veiled)": ["muse-thalia"],
};

/** The same statue type need not be the same statue: pick one by place. */
const pickScan = (choices: ScanId[], at: Vec3): ScanId => {
  const h = Math.abs(Math.round(at[0] * 7.3 + at[1] * 3.1 + at[2] * 5.7));
  return choices[h % choices.length]!;
};

/** What a statue can be made of: stone, or metal laid over a scan. */
export const STATUE_MATERIALS: Material[] = ["marble", "marbleWorn", "bronze", "paintGold"];

const decor = (part: Part): Part => {
  const scan =
    part.kind === "figure" &&
    !part.scan &&
    STATUE_MATERIALS.includes(part.material) &&
    part.identity
      ? SCAN_OF[part.identity.name]
      : undefined;
  const scanId = scan ? pickScan(scan, part.at) : undefined;
  return { ...part, decor: true, ...(scanId ? { scan: { id: scanId } } : {}) };
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

/**
 * A small amphora as a seller sets it out: body, shoulder and neck as three
 * drums. A lofted jar is a thousand triangles, and a stall of them is ten.
 */
function smallAmphora(at: Vec3, scale = 1): Part[] {
  const s = scale;
  return [
    cyl("terracotta", at, 0.05 * s, 0.15 * s, 0.32 * s, 8),
    cyl("terracotta", [at[0], at[1] + 0.32 * s, at[2]], 0.15 * s, 0.05 * s, 0.14 * s, 8),
    cyl("terracotta", [at[0], at[1] + 0.46 * s, at[2]], 0.04 * s, 0.05 * s, 0.14 * s, 6),
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
      box("timber", turn(at, rotY, side * (width / 2 - 0.03), 0, 0.11), [0.06, height, 0.3], rotY),
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
type Goods = "pottery" | "fruit" | "shrines" | "amphorae" | "cloth" | "baskets" | "books";
function stall(at: Vec3, rotY: number, rand: Rand, goods: Goods): Part[] {
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
    else if (goods === "amphorae") parts.push(...smallAmphora(p, between(rand, 0.8, 1)));
    else if (goods === "cloth") {
      // Bolts of dyed wool and linen, laid across the counter.
      parts.push(
        cyl(pick(rand, BOLTS), [p[0], p[1] + 0.09, p[2]], 0.09, 0.09, 0.62, 8, {
          rotX: Math.PI / 2,
          rotY: rotY + between(rand, -0.15, 0.15),
        }),
      );
    } else if (goods === "books") {
      /*
       * A bookseller's counter: rolls laid in twos and threes, a round
       * leather capsa of them stood on end, and an inkpot.
       */
      if (i % 3 === 1) {
        parts.push(cyl("hide", p, 0.11, 0.11, 0.3, 10));
        parts.push(cyl("timber", [p[0], p[1] + 0.3, p[2]], 0.115, 0.115, 0.04, 10));
      } else parts.push(...scrolls(p, 2 + (i % 2), rotY, rand));
      if (i === 5) parts.push(cyl("terracotta", [p[0], p[1], p[2] + 0.25], 0.04, 0.05, 0.07, 8));
    } else if (goods === "baskets") {
      // Wicker baskets heaped with what the country brought in.
      parts.push(cyl("papyrus", p, 0.13, 0.17, 0.16, 9));
      parts.push(
        cyl(
          pick(rand, ["foliage", "paintRed", "paintGold", "terracotta"] as const),
          [p[0], p[1] + 0.12, p[2]],
          0.15,
          0.05,
          0.09,
          8,
        ),
      );
    } else if (goods === "shrines") {
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

/** The dyes a cloth-seller's bolts came in. */
const BOLTS: Material[] = ["linen", "paintRed", "paintBlue", "fadedRed", "fadedBlue", "paintGold"];

/* ------------------------------------------------------------------ *
 * Street furniture: what stood where people gathered
 * ------------------------------------------------------------------ */

/**
 * A street fountain: a stone basin brimming with water, and behind it the
 * slab the pipe came through, its bronze spout over the basin. `rotY` turns
 * the open side (`+z`) to face the street.
 */
function fountain(at: Vec3, rotY: number): Part[] {
  const w = 2.0;
  const d = 0.9;
  const h = 0.7;
  const t = 0.14;
  const parts: Part[] = [
    box("marbleWorn", turn(at, rotY, 0, 0, 0), [w, 0.12, d], rotY),
    box("marbleWorn", turn(at, rotY, 0, 0, d / 2 - t / 2), [w, h, t], rotY),
    box("marbleWorn", turn(at, rotY, 0, 0, -d / 2 + t / 2), [w, h, t], rotY),
    box("marbleWorn", turn(at, rotY, -w / 2 + t / 2, 0, 0), [t, h, d - 2 * t], rotY),
    box("marbleWorn", turn(at, rotY, w / 2 - t / 2, 0, 0), [t, h, d - 2 * t], rotY),
    box("water", turn(at, rotY, 0, h - 0.12, 0), [w - 2 * t, 0.04, d - 2 * t], rotY),
    // The slab behind, with a moulded top, and the spout.
    box("marble", turn(at, rotY, 0, 0, -d / 2 - 0.18), [w + 0.2, 1.9, 0.36], rotY),
    box("marbleWorn", turn(at, rotY, 0, 1.9, -d / 2 - 0.18), [w + 0.4, 0.14, 0.5], rotY),
    cyl("bronze", turn(at, rotY, 0, 1.15, -d / 2), 0.045, 0.045, 0.32, 8, {
      rotX: Math.PI / 2 + 0.25,
      rotY,
    }),
  ];
  return parts;
}

/** A stone trough for the animals, full of water. */
function trough(at: Vec3, rotY: number): Part[] {
  const w = 1.8;
  const d = 0.6;
  const h = 0.55;
  const t = 0.1;
  return [
    box("stone", turn(at, rotY, 0, 0, 0), [w, 0.1, d], rotY),
    box("stone", turn(at, rotY, 0, 0, d / 2 - t / 2), [w, h, t], rotY),
    box("stone", turn(at, rotY, 0, 0, -d / 2 + t / 2), [w, h, t], rotY),
    box("stone", turn(at, rotY, -w / 2 + t / 2, 0, 0), [t, h, d - 2 * t], rotY),
    box("stone", turn(at, rotY, w / 2 - t / 2, 0, 0), [t, h, d - 2 * t], rotY),
    box("water", turn(at, rotY, 0, h - 0.1, 0), [w - 2 * t, 0.04, d - 2 * t], rotY),
  ];
}

/**
 * A perirrhanterion: the marble basin on a stand at a sanctuary's entrance,
 * where everyone going in washed their hands.
 */
function lustralBasin(at: Vec3): Part[] {
  return [
    cyl("marbleWorn", at, 0.32, 0.28, 0.12, 14),
    cyl("marble", [at[0], at[1] + 0.12, at[2]], 0.11, 0.09, 0.72, 12),
    cyl("marble", [at[0], at[1] + 0.84, at[2]], 0.12, 0.6, 0.16, 18),
    cyl("water", [at[0], at[1] + 0.97, at[2]], 0.52, 0.52, 0.02, 18),
  ];
}

/** A two-wheeled cart, its shafts down on the ground, a load of jars on its bed. */
function cart(at: Vec3, rotY: number, rand: Rand): Part[] {
  const parts: Part[] = [
    box("timber", turn(at, rotY, 0, 0.62, 0), [1.3, 0.08, 2.0], rotY),
    box("timber", turn(at, rotY, -0.62, 0.7, 0), [0.06, 0.28, 2.0], rotY),
    box("timber", turn(at, rotY, 0.62, 0.7, 0), [0.06, 0.28, 2.0], rotY),
    box("timber", turn(at, rotY, 0, 0.7, -0.97), [1.3, 0.28, 0.06], rotY),
  ];
  for (const side of [-1, 1]) {
    // The wheels, solid boards with an iron tyre, their axle under the bed.
    parts.push(
      cyl("timber", turn(at, rotY, side * 0.72 - 0.05, 0.55, 0.15), 0.55, 0.55, 0.1, 14, {
        rotX: Math.PI / 2,
        rotY: rotY + Math.PI / 2,
      }),
    );
    // A shaft, running forward and down to rest on the ground.
    parts.push(
      decor({
        kind: "box",
        material: "timber",
        at: turn(at, rotY, side * 0.45, 0.32, 1.3),
        size: [0.07, 0.07, 1.9],
        rotY,
        rotX: 0.33,
      }),
    );
  }
  for (let i = 0; i < 4; i += 1) {
    parts.push(
      ...smallAmphora(
        turn(at, rotY, (i % 2) * 0.6 - 0.3, 0.7, Math.floor(i / 2) * 0.8 - 0.5),
        between(rand, 1.2, 1.5),
      ),
    );
  }
  return parts;
}

/**
 * The honorific statues of benefactors, in turn: a man in his toga, as the
 * veiled Tiberius is, or wrapped in the Greek mantle, as the bearded
 * Asklepios is; a woman wrapped in her mantle, the Ephesian portrait statue,
 * or standing in her Ionic chiton.
 */
const HONORIFIC_SCANS: Record<"male" | "female", ScanId[]> = {
  male: ["asklepios", "tiberius-velatus"],
  female: ["ephesus-portrait", "caryatid"],
};

/**
 * An honorific statue: a moulded base, the inscription naming who was
 * honoured and by whom, and a bronze of a benefactor of the city on top.
 */
function honorific(
  at: Vec3,
  rotY: number,
  female: boolean,
  text: EpigraphicText,
  index: number,
): Part[] {
  const parts: Part[] = [
    box("marbleWorn", at, [1.1, 0.2, 1.1], rotY),
    box("marble", [at[0], at[1] + 0.2, at[2]], [0.86, 1.25, 0.86], rotY),
    box("marbleWorn", [at[0], at[1] + 1.45, at[2]], [1.05, 0.16, 1.05], rotY),
    ...inscription({
      at: turn(at, rotY, 0, 0.84, 0.43),
      rotY,
      width: 0.7,
      letter: 0.07,
      height: 1.05,
      middle: true,
      text,
    }).map(decor),
  ];
  parts.push(
    decor({
      kind: "figure",
      material: "bronze",
      at: [at[0], at[1] + 1.61, at[2]],
      height: 1.95,
      rotY,
      identity: female
        ? {
            name: "Benefactress",
            sex: "female",
            hair: "bun",
            dress: "himation",
            gesture: "veil",
          }
        : {
            name: "Benefactor",
            sex: "male",
            bearded: true,
            hair: "short",
            dress: "himation",
            left: "scroll",
          },
      scan: { id: HONORIFIC_SCANS[female ? "female" : "male"][index % 2]! },
    }),
  );
  return parts;
}

/** A stone bench, a slab on two blocks: what a street or a forecourt offered to sit on. */
function stoneBench(at: Vec3, length: number, rotY: number): Part[] {
  return [
    box("marbleWorn", turn(at, rotY, 0, 0.36, 0), [length, 0.1, 0.48], rotY),
    box("stone", turn(at, rotY, -length / 2 + 0.25, 0, 0), [0.3, 0.36, 0.42], rotY),
    box("stone", turn(at, rotY, length / 2 - 0.25, 0, 0), [0.3, 0.36, 0.42], rotY),
  ];
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
  /** The casts of `aside`, joined to this one when the scene is finished. */
  extras: Cast[];
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
    extras: [],
  };
}

/**
 * The same scene, with a die of its own: what is added through it — more
 * people, their benches and workshops — takes none of the scene's own rolls,
 * so everyone already there stays exactly where they were.
 */
function aside(b: Builder, salt: number): Builder {
  const rand = seeded((salt * 2654435761) >>> 0);
  const cast = new Cast(rand, b.era);
  b.extras.push(cast);
  return { ...b, rand, cast };
}

function finish(b: Builder): SceneLife {
  const casts = [b.cast, ...b.extras];
  const people = casts.flatMap((c) => c.people);
  const links: Link[] = casts.flatMap((c) =>
    c.links.map(([x, y, kind]) => ({ a: people.indexOf(x), b: people.indexOf(y), kind })),
  );
  return {
    era: b.era,
    people,
    flames: b.flames,
    props: b.props,
    crowd: b.crowd,
    animals: b.animals,
    chariots: b.chariots,
    ...(b.cheerFor ? { cheerFor: b.cheerFor } : {}),
    ...(links.length ? { links } : {}),
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
  camel: [0xb08a5a, 0x9a7a52, 0xc4a070],
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
  const floor = y0 + 0.04;
  const stepTop = (i: number): Vec3 => [
    0,
    (i + 1) * rise,
    -(spec.steps - i) * tread + tread * 0.55,
  ];

  /*
   * The square in front: people crossing it, and stopping to talk. They
   * cross in front of the horsemen's plinths (2.6 m before the stair, 3.4 m
   * deep), not through them, which is where a crossing ending at x = ±12
   * had walked a third of them.
   */
  const plinthFront = stairFoot - 2.6 - 1.7;
  for (let i = 0; i < 9; i += 1) {
    const z = between(rand, stairFoot - 9, plinthFront - 2);
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
  /*
   * Through the Gate of Mazaeus and Mithridates (`models/efes-mazaeus-kapisi.ts`):
   * people coming out of the agora by the middle opening, crossing the square,
   * and going back in by the side ones.
   */
  // (Not by the opening on the library side: the horseman's plinth stands in front of it.)
  for (let i = 0; i < 4; i += 1) {
    const lane = [-9.2, -9.2, -14.0, -14.0][i]!;
    const off = between(rand, -0.3, 0.3);
    cast.walk(
      [
        [-27, 0, lane + off],
        [-13.5, 0, lane + off],
        [between(rand, -7, -3), 0, between(rand, stairFoot - 14, stairFoot - 5.8)],
        [-13.5, 0, lane - off],
      ],
      {
        role: rand() < 0.4 ? "worker" : "citizen",
        ...(rand() < 0.5
          ? { carry: pick(rand, ["amphora", "basket", "jar", "scroll"] as const) }
          : {}),
      },
    );
  }
  /*
   * Down Curetes Street to the square, and back up it; and along Marble
   * Street from the north (`models/efes-mazaeus-kapisi.ts`).
   */
  for (let i = 0; i < 5; i += 1) {
    const x = between(rand, 2.2, 7.8);
    cast.walk(
      [
        [x, 0, -50],
        [x + between(rand, -0.6, 0.6), 0, -24],
        [between(rand, 3, 8), 0, between(rand, stairFoot - 14, stairFoot - 6)],
        [x, 0, -24],
      ],
      {
        role: rand() < 0.35 ? "worker" : "citizen",
        ...(rand() < 0.4 ? { carry: pick(rand, ["amphora", "basket", "jar"] as const) } : {}),
      },
    );
  }
  for (let i = 0; i < 3; i += 1) {
    const z = between(rand, -31.8, -27.8);
    cast.walk(
      [
        [-50, 0, z],
        [-14, 0, z],
        [between(rand, -9, -4), 0, between(rand, stairFoot - 15, stairFoot - 8)],
        [-14, 0, z],
      ],
      { role: rand() < 0.5 ? "worker" : "citizen" },
    );
  }
  cast.group([4.6, 0, -40], 2, 0.6);
  cast.group([-40, 0, -30.4], 3);
  cast.group([-4.5, 0, stairFoot - 2.4], 3);
  cast.group([5.2, 0, stairFoot - 4.2], 2, 0.6);
  cast.group([-8.5, 0, stairFoot - 6.5], 2, 0.6);
  // The three doors, the middle one the widest.
  const bayCentres = [
    -((w * 0.152) / 2 + w * 0.152 + (w * 0.114) / 2),
    0,
    (w * 0.152) / 2 + w * 0.152 + (w * 0.114) / 2,
  ];
  // Up and down the nine steps, to the doors and back — in line with a
  // door, not with the podium of an aedicula between two of them.
  // Tread by tread, and back down the same way.
  const stair = (x: number): Vec3[] => {
    const up: Vec3[] = [[x, 0, stairFoot - 2.5]];
    for (let i = 0; i < spec.steps; i += 1) {
      const z = -(spec.steps - i) * tread;
      up.push([x, i * rise, z - 0.08], [x, (i + 1) * rise, z + 0.08]);
    }
    up.push([x, y0, -0.5]);
    return [...up, ...up.slice(1, -1).reverse()];
  };
  for (const x of [bayCentres[0]! + 0.4, 1.2, bayCentres[2]! - 0.4]) {
    cast.walk(stair(x), {
      carry: x > 3 ? "basket" : x > 0 ? "capsa" : "scroll",
      role: x > 3 ? "worker" : "citizen",
      speed: 0.8,
    });
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
    action: "lecture",
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
  b.props.push(...stall([-11.8, 0, stairFoot - 7.5], 0.35, rand, "books"));
  cast.add({ at: [-11.4, 0, stairFoot - 8.4], rotY: 0.35, action: "talk", role: "worker" });

  // Torches either side of each door, and a brazier at each horseman.
  const doorHalf = [w * 0.114 * 0.36, w * 0.152 * 0.36, w * 0.114 * 0.36];
  bayCentres.forEach((cx, i) => {
    for (const side of [-1, 1]) {
      fire(b, torchStand([cx + side * (doorHalf[i]! + 0.35), y0, -0.22], 1.7), 0.32, i === 1);
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
  /*
   * Portraits of the authors, as Roman libraries had them: herms of the
   * historians and philosophers on pillars along the hall — Herodotus of
   * Halicarnassus among them, from just down the coast.
   */
  const herms: ScanId[] = [
    "herm-thucydides-herodotus",
    "herm-plato",
    "herm-socrates-seneca",
    "herm-epicurus-metrodorus",
  ];
  herms.forEach((id, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (halfHall - 1.7);
    const z = hallFront + (i < 2 ? 1.4 : spec.hallDepth - 1.8);
    b.props.push(box("marbleWorn", [x, floor, z], [0.5, 1.15, 0.5]));
    b.props.push(
      decor({
        kind: "figure",
        material: "marble",
        at: [x, floor + 1.15, z],
        height: 0.62,
        rotY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
        scan: { id },
      }),
    );
  });
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
  // Down the hall inside the line of the herms, not through them.
  cast.walk(
    [
      [-5.7, floor, hallFront + 1.6],
      [-5.7, floor, hallBack - 1.6],
      [5.7, floor, hallBack - 1.6],
      [5.7, floor, hallFront + 1.6],
    ],
    // A library slave fetching rolls from the cupboards, in their round box.
    { role: "worker", carry: "capsa", speed: 0.7 },
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

  /*
   * The square's own business, beside the library's: children at
   * knucklebones by the steps, a letter-writer for those who could not
   * write, a money-changer at the corner by the agora gate, a philosopher
   * with his listeners, a piper, a beggar at the horseman's base, a slave
   * sweeping the foot of the stair, porters under a pole, old men on a bench.
   */
  const x = aside(b, 9002);
  const sf = stairFoot;
  trades.knucklebones(x, [-1.2, 0, sf - 4.8], 0.4);
  trades.scribe(x, [-3.1, 0, sf - 1.3], Math.PI, { outfit: { old: true } });
  trades.changer(x, [-11.5, 0, sf - 11.5], Math.PI / 2);
  trades.lecture(x, [-5.5, 0, sf - 15.2], 0, 2);
  trades.busker(x, [3.0, 0, sf - 12.9], 0, "aulos");
  trades.beggar(x, [10.0, 0, sf - 4.7], Math.PI);
  trades.sweeper(x, [
    [-3, 0, sf - 0.9],
    [3.4, 0, sf - 0.9],
  ]);
  trades.porters(x, [
    [-10, 0, sf - 9.4],
    [9, 0, sf - 9.4],
    [9, 0, sf - 8.95],
    [-10, 0, sf - 8.95],
  ]);
  trades.handInHand(
    x,
    [
      [-8, 0, sf - 10],
      [6, 0, sf - 10],
      [6, 0, sf - 9.6],
      [-8, 0, sf - 9.6],
    ],
    0.46,
    { female: true },
  );
  trades.gazer(x, [3.0, 0, sf - 5.2], [1.5, 6, 0], {}, true);
  trades.elders(x, [5.2, 0, sf - 15.0], 0);
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
  const layout = theatreLayout(spec);
  const orchestra = layout.orchestraRadius;
  const { rows, diazoma, rowAt, rowSpan } = layout;

  /*
   * The audience. Fuller near the front, thinner at the back and the ends,
   * with blocks left empty the way a real house fills — and capped, because
   * every one of them is drawn.
   */
  const budget = 2600;
  const totalSeats = Array.from(
    { length: rows },
    (_, i) => (rowSpan(i)[1] * rowAt(i).inner) / 0.55,
  ).reduce((a, c) => a + c, 0);
  const density = Math.min(0.62, budget / totalSeats);
  const stairWidthAngle = (r: number) => 1.3 / r;
  for (let i = 0; i < rows; i += 1) {
    const { inner, y } = rowAt(i);
    const r = inner + spec.seatTread * 0.42;
    const [start, length] = rowSpan(i);
    const count = Math.floor((length * r) / 0.55);
    const frontBias = 1.15 - (i / rows) * 0.55;
    for (let k = 0; k < count; k += 1) {
      const t = start + (length * (k + 0.5)) / count;
      // Keep the stairs clear.
      let onStair = false;
      for (let s = 0; s < spec.stairways; s += 1) {
        const theta = start + (length * (s + 0.5)) / spec.stairways;
        if (Math.abs(t - theta) < stairWidthAngle(r)) onStair = true;
      }
      if (onStair) continue;
      // Wedges that are emptier than the rest.
      const wedge = Math.floor(((t - start) / length) * spec.stairways);
      const wedgeFill = 0.55 + 0.45 * Math.sin(wedge * 2.3 + seed);
      if (rand() > density * frontBias * wedgeFill * 1.25) continue;
      const at: Vec3 = [Math.cos(t) * r, y + spec.seatRise + 0.06, Math.sin(t) * r];
      seat(b, at, facing(-at[0], -at[2]));
    }
  }

  // The stage: three actors in masks, and a fourth waiting at the royal door.
  const stageY = layout.stageTop;
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
  // The stair just left of the middle one: with an odd count the middle one
  // runs up the axis, where Miletus set its magistrates' box across it.
  const stairTheta =
    (Math.PI * (Math.max(0, Math.floor(spec.stairways / 2) - 1) + 0.5)) / spec.stairways;
  const lower = rowAt(0);
  const upper = rowAt(spec.lowerRows - 1);
  /*
   * Step by step: across each tread, then up its riser before reaching it.
   * A straight line from the bottom row to the top one ran under every
   * nosing, the feet sunk in the stone the whole way up. The stair's top is
   * the row's, plus the 10 cm its slabs stand proud.
   */
  const climb = (radius: (r: number) => number): Vec3[] => {
    // From the first row: the wall round the orchestra is too high to step
    // up from where Ephesus raised it for the arena.
    const up: [number, number][] = [];
    for (let row = 0; row < spec.lowerRows; row += 1) {
      const { inner, outer, y } = rowAt(row);
      const tread = y + spec.seatRise + 0.1;
      up.push([row === 0 ? inner + 0.15 : inner - 0.02, tread], [outer - 0.12, tread]);
    }
    up.push([upper.outer + 0.3, upper.y + spec.seatRise + 0.1]);
    void upper;
    // Up, and back down the same way: a route of more than two points is a
    // loop, and closing it straight would cut back through the seats.
    const path = [...up, ...up.slice(1, -1).reverse()];
    return path.map(([r, y]) => [
      Math.cos(stairTheta) * radius(r),
      y,
      Math.sin(stairTheta) * radius(r),
    ]);
  };
  for (let i = 0; i < 2; i += 1) {
    const off = (i - 0.5) * 0.45;
    const route = climb((r) => r).map(([x, y, z]): Vec3 => [
      x - Math.sin(stairTheta) * off,
      y,
      z + Math.cos(stairTheta) * off,
    ]);
    // The two start at opposite ends, one going up as the other comes down.
    cast.walk(
      i === 0 ? route : [...route.slice(route.length / 2), ...route.slice(0, route.length / 2)],
      {
        speed: 0.6,
      },
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
  /*
   * Along the walkway and back. A route of more than two points is a loop,
   * and this one used to close with a straight line from one end of the
   * walkway to the other — so the seller flew across the cavea, nine metres
   * up, every lap.
   */
  const lap = [...arc, ...arc.slice(1, -1).reverse()];
  cast.walk(lap, { role: "worker", carry: "basket", speed: 0.7 });
  cast.walk([...lap.slice(arc.length - 1), ...lap.slice(0, arc.length - 1)], {
    role: "worker",
    carry: "amphora",
    speed: 0.6,
  });

  // Torches along the front of the stage, and braziers at its ends.
  const stageHalf = Math.min(layout.stageWidth, spec.caveaDiameter * 0.62) / 2;
  // At Aspendos the magistrates' boxes over the side entrances come down onto
  // the ends of the stage: the row of torches stops short of them.
  const torchReach =
    layout.character.box === "tribunalia"
      ? Math.min(stageHalf * 0.8, layout.podiumOuter + 0.1 * spec.lowerRows * spec.seatTread - 0.8)
      : stageHalf * 0.8;
  for (let i = 0; i < 6; i += 1) {
    const x = -torchReach + (torchReach * 2 * i) / 5;
    fire(b, torchStand([x, stageY, -0.4], 1.6), 0.3, i === 1 || i === 4);
  }
  for (const side of [-1, 1]) {
    fire(b, brazier([side * (orchestra - 1.2), 0.12, 0.8], 1.1), 0.5, true);
  }
  /*
   * The stage front was a gallery of statues: gods, Muses, the emperor and
   * the city's benefactors stood between the columns of every storey. Which
   * god stands where is dealt from this theatre's own seed, so no two stage
   * fronts carry the same company in the same order.
   */
  layout.statueSlots.forEach((slot, i) => {
    statue(b, slot.at, slot.height, 0, i * 7 + seed, "marble", true);
  });

  /*
   * Behind the stage building, the town goes about its day while the play
   * is on: what is there depends on what the theatre backs onto.
   */
  const x = aside(b, (seed ^ 0x51d3) >>> 0);
  const behind = layout.wallZ - 9;
  const annex = layout.character.annex;
  if (annex === "harbour-street") {
    // Ephesus: Harbour Street, colonnaded down to the sea, its paving 10 cm up.
    const y = 0.1;
    trades.fishmonger(x, [2.7, y, behind - 21], -Math.PI / 2);
    trades.weigher(x, [-2.6, y, behind - 6.5], Math.PI / 2);
    trades.ballGame(x, [-1.6, y, behind - 29], [1.9, y, behind - 31.5]);
    trades.beggar(x, [4.7, y, behind - 11.5], -Math.PI / 2);
    trades.porters(x, [
      [0.55, y, behind - 3],
      [0.55, y, behind - 44],
      [-0.55, y, behind - 44],
      [-0.55, y, behind - 3],
    ]);
    trades.handInHand(
      x,
      [
        [-1.75, y, behind - 24],
        [-1.75, y, behind - 42],
        [-1.25, y, behind - 42],
        [-1.25, y, behind - 24],
      ],
      0.46,
      {},
    );
    trades.juggler(x, [0.4, y, behind - 38], 0, 2);
  } else if (annex === "agora") {
    // Side: the square agora behind the stage, its stoas full of shops.
    const y = 0.08;
    trades.bakery(x, [-30, y, behind - 12], Math.PI / 2);
    trades.butcher(x, [-30, y, behind - 24], Math.PI / 2);
    trades.fishmonger(x, [-30, y, behind - 35], Math.PI / 2);
    trades.changer(x, [30, y, behind - 12], -Math.PI / 2);
    trades.weigher(x, [30, y, behind - 24], -Math.PI / 2);
    trades.cook(x, [30, y, behind - 36], -Math.PI / 2);
    trades.juggler(x, [-12, y, behind - 40], 0, 2);
    trades.knucklebones(x, [16, y, behind - 40], 0.6);
    trades.porters(x, [
      [-24, y, behind - 8],
      [22, y, behind - 8],
      [22, y, behind - 8.5],
      [-24, y, behind - 8.5],
    ]);
    trades.elders(x, [-22, y, behind - 30], Math.PI / 2);
  } else {
    // Open ground behind the stage: the street round the theatre.
    trades.beggar(x, [6.5, 0, behind - 0.7], Math.PI);
    trades.ballGame(x, [-8, 0, behind - 8], [-4.5, 0, behind - 9.5]);
    trades.porters(x, [
      [-20, 0, behind - 6.5],
      [20, 0, behind - 6.5],
      [20, 0, behind - 7],
      [-20, 0, behind - 7],
    ]);
    trades.elders(x, [15, 0, behind - 3], Math.PI);
    trades.hawker(x, [-16, 0, behind - 5.5], Math.PI);
    trades.handInHand(
      x,
      [
        [-18, 0, behind - 10],
        [12, 0, behind - 10],
        [12, 0, behind - 10.4],
        [-18, 0, behind - 10.4],
      ],
      0.46,
      { female: true },
    );
    trades.juggler(x, [17, 0, behind - 8], Math.PI, 2);
    if (annex === "harbour") {
      // Miletus: fish sold straight off the quay of the Theatre Harbour.
      trades.fishmonger(x, [10, 1.0, behind - 14.2], 0);
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
    // Strung out along the way up to the altar, none of them starting inside it.
    const z0 = altarZ - wayLength + (i * (wayLength - altarW * 0.7)) / 10;
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

  /*
   * Round the altar and the forecourt: a priest pouring the libation, a
   * pilgrim looking up at the columns, a beggar at the way in, a seller of
   * offering cakes, old men on a bench, children chasing. Didyma was never
   * finished — masons worked on it for five centuries, and the building
   * accounts were kept on stone — so its forecourt has a mason's yard and
   * the clerk who wrote them; at Aizanoi a sculptor works on a votive
   * statue; at Ephesus the girls dance for Artemis.
   */
  const x = aside(b, id.length * 977 + 31);
  x.cast.add({
    at: [2.4, 0, altarZ + altarW * 0.42 + 0.1],
    rotY: Math.PI,
    action: "pour",
    role: "priest",
    carry: "phiale",
  });
  trades.gazer(x, [11, 0, front - 4.8], [0, 12, front + 10]);
  trades.beggar(x, [-7.5, 0, altarZ - 11], Math.PI / 2);
  trades.hawker(x, [9.5, 0, altarZ - 11], -Math.PI / 2);
  trades.elders(x, [24, 0, front - 4], -Math.PI / 2);
  trades.chase(x, [-24, 0, front - 3], 2, 1.3);
  if (id === "didyma-apollon-tapinagi") {
    trades.mason(x, [-20, 0, front - 6], Math.PI / 2, "marble");
    trades.mason(x, [-20, 0, front - 9], Math.PI / 2, "marble");
    trades.scribe(x, [-17.6, 0, front - 7.6], -Math.PI / 2, { role: "official" });
  } else if (id === "artemis-tapinagi") {
    trades.dancers(x, [-19, 0, altarZ - 13], 3);
  } else {
    trades.sculptor(x, [-20, 0, front - 6], Math.PI / 2);
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
  // Midway between two pillars, where the bench runs: one sitter had been
  // put where a pillar stands, on a bench that is not there.
  for (const gap of [3, 4, 5, 7, 8, 9]) {
    const a = ((gap + 0.5) * TAU) / spec.ringPillars;
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
    // Round the north of the central pair, not between their feet.
    [4.5, floor, 0.5],
  ]);
  flock(b, "gazelle", [24, 0, -12], 6, 5);
  flock(b, "gazelle", [-20, 0, 18], 4, 4);

  /*
   * The work of the gathering: wild grain ground on a quern — the site has
   * given up thousands of grinding stones — a knapper squatting over his
   * flint with a child watching, a hide scraped on its frame, and somebody
   * bringing in a basket of grain.
   */
  const x = aside(b, 1134);
  trades.grinder(x, [-3.0, floor, 4.2], Math.PI);
  const knapper: Vec3 = [1.0, floor, 9.6];
  x.cast.add({ at: knapper, rotY: Math.PI, action: "crouch", carry: "chisel" });
  for (let i = 0; i < 8; i += 1)
    x.props.push(
      box(
        "stoneDark",
        [knapper[0] - 0.3 + (i % 4) * 0.16, floor, knapper[2] - 0.45 - Math.floor(i / 4) * 0.14],
        [0.05, 0.015, 0.035],
        i * 0.8,
      ),
    );
  x.cast.add({ at: [2.2, floor, 9.0], rotY: -2.0, action: "crouch", role: "child" });
  x.cast.add({ at: [7.65, floor, -0.5], rotY: Math.PI / 2, action: "tend", carry: "chisel" });
  x.cast.walk(
    [
      [-11, floor, -4],
      [-5, floor, -9],
    ],
    { carry: "basket", female: true, speed: 0.7 },
  );
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
  /*
   * Up the stair: the procession, from the square over the five steps round
   * the building and then the flight between the wings, tread by tread (see
   * greatAltarParts: risers of 0.3 m, the flight 8.5 m deep) — and back down
   * the same way. Drawn as a straight ramp from a starting point already at
   * the top of the five steps, it floated over the square and sank through
   * every nosing; closed as a loop, it came back down through the building.
   */
  const flight = Math.max(2, Math.round((terrace - ground) / 0.3));
  const flightRise = (terrace - ground) / flight;
  const flightRun = 8.5 / flight;
  const climb = (x: number): Vec3[] => {
    const up: Vec3[] = [[x, 0, foot - 6]];
    for (let s = 0; s < spec.steps; s += 1) {
      const z = foot + s * 0.55;
      up.push([x, s * 0.3, z - 0.12], [x, (s + 1) * 0.3, z + 0.08]);
    }
    for (let s = 0; s < flight; s += 1) {
      const z = -halfD + s * flightRun;
      up.push([x, ground + s * flightRise, z - 0.12], [x, ground + (s + 1) * flightRise, z + 0.08]);
    }
    up.push([x * 0.5, terrace, courtZ - 5]);
    return [...up, ...up.slice(1, -1).reverse()];
  };
  for (let i = 0; i < 8; i += 1) {
    const x = (i % 2 ? 1 : -1) * between(rand, 1.5, 5);
    cast.walk(climb(x), {
      role: i < 2 ? "musician" : i < 4 ? "priestess" : "citizen",
      carry:
        i < 2
          ? i
            ? "lyre"
            : "aulos"
          : pick(rand, ["offering", "basket", "jar", "torch"] as const),
      speed: 0.55,
    });
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
  // Guards either side of the foot of the stair, on the square — not where
  // they stood before, a metre up in the air over the second step.
  cast.add({
    at: [-spec.stairWidth / 2 + 1, 0, foot - 0.8],
    rotY: 0.3,
    action: "stand",
    role: "soldier",
    carry: "spear",
    carryLeft: "shield",
  });
  cast.add({
    at: [spec.stairWidth / 2 - 1, 0, foot - 0.8],
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
  const led = (x: number, back: number, last: number): Vec3[] => {
    const route = climb(x);
    route[0] = [x, 0, foot - back];
    const top = route.length / 2;
    route[top] = [x, terrace, courtZ - last];
    return route;
  };
  const oxRoute = led(-2, 8, 5.5);
  animal(b, "ox", oxRoute[0]!, 0, "walk", {
    colour: 0x2a1d14,
    dressed: 0xd4ae52,
    route: oxRoute,
    speed: 0.5,
  });
  cast.walk(led(-3, 7.4, 5), { role: "priest", carry: "staff", speed: 0.5 });
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
      if (n % 3 === 2)
        b.props.push(...horseStatue("marble", at, rotY + Math.PI, 0.9, -1, 0.032).map(decor));
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

  /*
   * The square at the foot: a scribe at work — Pergamon gave its name to
   * parchment — a philosopher holding forth, children chasing each other,
   * a beggar at the edge of the crowd; and in the court a priest pouring
   * the libation of wine on the fire altar.
   */
  const x = aside(b, 7311);
  trades.scribe(x, [-5.5, 0, foot - 10], 0);
  trades.lecture(x, [14, 0, foot - 10], Math.PI, 2);
  trades.chase(x, [4.5, 0, foot - 11.5], 1.8, 1.2);
  trades.beggar(x, [13.5, 0, foot - 1.6], Math.PI);
  x.cast.add({
    at: [-2.2, terrace, courtZ + 3.2],
    rotY: Math.PI,
    action: "pour",
    role: "priest",
    carry: "phiale",
  });
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

  /*
   * Along the arena's edge, outside the chariots' lanes: athletes waiting
   * their turn — wrestlers at grips with their trainer watching, one
   * stretching, one swinging a discus.
   */
  const x = aside(b, (seed ^ 0x2c41) >>> 0);
  const edge = arenaHalf - 2;
  trades.wrestlers(x, [-edge, 0.12, L.trackMin + 22], 0);
  x.cast.add({
    at: [-edge + 0.9, 0.12, L.trackMin + 20.4],
    rotY: -0.6,
    action: "point",
    role: "official",
    carry: "staff",
  });
  x.cast.add({
    at: [-edge, 0.12, L.trackMin + 31],
    rotY: Math.PI / 2,
    action: "stretch",
    role: "athlete",
  });
  x.cast.add({
    at: [edge, 0.12, L.trackMin + 26],
    rotY: -Math.PI / 2,
    action: "throw",
    role: "athlete",
  });
  if (spec.vaults) {
    /*
     * The other shops under the seats: a potter, a butcher, a baker, a
     * money-changer, a cook selling hot food, a carpenter — each in front of
     * its own arch.
     */
    const bay = (2 * endCentre) / spec.vaults;
    const outer = L.halfWidth + 1.2;
    const shops = [
      trades.potter,
      trades.butcher,
      trades.bakery,
      trades.changer,
      trades.cook,
      trades.carpenter,
      trades.weigher,
      trades.fishmonger,
    ] as const;
    shops.forEach((shop, k) => {
      const i = 4 + k * 3;
      if (i > spec.vaults! - 4) return;
      const side = k % 2 === 0 ? 1 : -1;
      const z = -endCentre + bay * (i + 0.5);
      shop(x, [side * (outer + 1.0), 0, z], side > 0 ? Math.PI / 2 : -Math.PI / 2);
    });
  } else {
    // Outside, where the crowd came in: hot food, and children at play.
    const out = L.halfWidth + 1.2 + (spec.bow ?? 0) + 4.5;
    trades.cook(x, [out - 2.2, 0, 7], -Math.PI / 2);
    trades.ballGame(x, [out - 2.5, 0, 40], [out - 1.6, 0, 44.5]);
    trades.hawker(x, [out - 1.8, 0, -31], -Math.PI / 2);
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
      // And back the same way: closed straight, the loop cut through the wall.
      [dx - 1.2, 0, -halfD - 1.0],
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
  cast.add({ at: [loomX + 0.6, 0, -0.3], rotY: -Math.PI / 2, action: "weave", female: true });
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
  // A garden statue on its plinth in one corner: goat-legged Pan, the god of
  // the countryside, a favourite of Roman gardens.
  b.props.push(box("marbleWorn", [-halfW + 1, 0, -halfD + 1], [0.7, 0.4, 0.9]));
  b.props.push(
    decor({
      kind: "figure",
      material: "marble",
      at: [-halfW + 1, 0.4, -halfD + 1],
      height: 1.0,
      rotY: Math.PI / 4,
      scan: { id: "pan" },
    }),
  );
  for (const [x, z] of [
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
  // Glykon, the snake god of Abonoteichos, coiled in front of the Lares.
  b.props.push(
    decor({
      kind: "figure",
      material: "marble",
      at: [wallX + 0.22, 1.12, lz],
      height: 0.24,
      rotY: Math.PI / 2,
      scan: { id: "glykon" },
    }),
  );
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
  /*
   * The two Lares, little bronzes of youths: the household's statuettes
   * are lost, so they stand in scans of two Roman youths of the same
   * Polykleitan kind, the Youth of the Magdalensberg and the Antinous of
   * Delphi, cast in bronze.
   */
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
        scan: { id: dz < 0 ? "magdalensberg-youth" : "antinous" },
      }),
    );
  }
  fire(b, lampstand([wallX + 0.45, 0, lz], 1.15), 0.08, false);

  /*
   * The household's day besides the dinner: a painter freshening the
   * frescoes of the side room — the Terrace Houses were repainted again and
   * again — a slave sweeping the colonnade, a boy at his letters with his
   * tutor, and a woman spinning.
   */
  const x = aside(b, 2719);
  // On a trestle at the painted wall of the room, between the shelves and the shrine.
  trades.painter(x, [-(sideX + spec.roomDepth / 2) + 0.6, 0, 0.05], -Math.PI / 2);
  trades.sweeper(x, [
    [-halfW + 1.6, 0, -halfD + 2.9],
    [-halfW + 1.6, 0, halfD - 1.9],
  ]);
  trades.scribe(x, [1.2, 0, halfD - 1.8], Math.PI, { role: "child" });
  x.cast.add({
    at: [2.2, 0, halfD - 2.9],
    rotY: facing(-1.0, 1.1),
    action: "lecture",
    carryLeft: "scroll",
    outfit: { old: true },
  });
  x.cast.add({
    at: [ox - 0.4, 0, 2.2],
    rotY: Math.PI / 2,
    action: "spin",
    carryLeft: "distaff",
    female: true,
  });
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
    // The corner it started past is walked round too, last: without it the
    // loop closed on a diagonal, straight through the podium.
    route.push(a);
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

  /*
   * The funeral games: wrestlers, a discus thrower winding up, a runner
   * loosening his limbs, people cheering them on. And at the side, the
   * sculptors still at work: Pliny says they went on with the building
   * after Artemisia died, for their own glory.
   */
  const x = aside(b, 3532);
  trades.wrestlers(x, [-12, 0, altarZ - 10], 0.2);
  for (const [px, pz, r] of [
    [-10.2, altarZ - 11.2, -0.9],
    [-13.9, altarZ - 7.8, 2.4],
  ] as const)
    x.cast.add({ at: [px, 0, pz], rotY: r, action: "cheer" });
  x.cast.add({ at: [10, 0, altarZ - 12], rotY: -0.6, action: "throw", role: "athlete" });
  x.cast.add({ at: [4, 0, altarZ - 13], rotY: 0.3, action: "stretch", role: "athlete" });
  trades.sculptor(x, [28, 0, -8], -Math.PI / 2);
  trades.mason(x, [28, 0, -3.5], -Math.PI / 2, "marble");
  void rand;
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
    // Past the stepped altar on one side of it or the other, not through it,
    // and back the way they came.
    const pass = (z < 0 ? -1 : 1) * Math.max(Math.abs(z) * 0.7, 4.8);
    const there: Vec3[] = [
      [spec.courtDepth + 3, 0, z],
      [altarX + 4.5, 0, pass],
      [altarX - 4.5, 0, pass],
      [8, 0, z * 0.8],
      [6, 0, z],
    ];
    cast.walk([...there, ...there.slice(1, -1).reverse()], {
      role: i === 0 ? "official" : i % 4 === 0 ? "worker" : "citizen",
      carry: pick(rand, ["offering", "jar", "basket", "amphora", "torch"] as const),
      speed: 0.6,
    });
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
    carry: "crook",
  });

  /*
   * The feast the law ordered, being made ready: meat cut up from the
   * sacrifice and boiled in the cauldrons, a lyre at the tables, a priest
   * pouring wine on the ground before the gods, the king's scribe at the
   * end of the court, an old pilgrim looking up at the colossi.
   */
  const x = aside(b, 6235);
  trades.cook(x, [24.5, 0, halfCourt - 3.5], Math.PI);
  trades.butcher(x, [24.5, 0, -halfCourt + 3.5], 0);
  x.cast.add({
    at: [altarX - 3.6, 0, -3.4],
    rotY: Math.PI / 2,
    action: "pour",
    role: "priest",
    carry: "phiale",
  });
  trades.scribe(x, [27, 0, -halfCourt + 2.2], 0, { role: "official" });
  x.cast.add({
    at: [14.6, 0, halfCourt - 1.3],
    rotY: -2.6,
    action: "play",
    role: "musician",
    carry: "lyre",
  });
  trades.gazer(x, [5.6, 0, -4.6], [-1, 8, -4.6], { outfit: { old: true } });
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
  {
    name: "Muse (thinking)",
    sex: "female",
    hair: "bun",
    dress: "chiton",
    left: "scroll",
    gesture: "chin",
  },
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
    name: "Muse (with tablet)",
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
  {
    name: "Muse (veiled)",
    sex: "female",
    hair: "bun",
    headgear: "veil",
    dress: "chiton",
    gesture: "veil",
  },
  { name: "Amazon", sex: "female", hair: "bun", dress: "chiton" },
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
  { name: "Hermes", sex: "male", bearded: false, hair: "curls", dress: "chiton" },
  { name: "Pan", sex: "male", bearded: true, hair: "curls", dress: "himation" },
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
  const foot: Vec3 = [at[0], at[1] + base, at[2]];
  /*
   * The scan is picked by place, as everywhere; but a scan already standing
   * twice in this scene gives way to the next of its type, so a gallery of
   * statues does not show one figure three times over.
   */
  const choices = SCAN_OF[who.name];
  let scan: ScanId | undefined;
  if (choices && STATUE_MATERIALS.includes(material)) {
    const placed = pickScan(choices, foot);
    const uses = (id: ScanId) => b.props.filter((part) => part.scan?.id === id).length;
    const start = choices.indexOf(placed);
    scan = placed;
    for (let k = 0; k < choices.length; k += 1) {
      const next = choices[(start + k) % choices.length]!;
      if (uses(next) < 2) {
        scan = next;
        break;
      }
    }
  }
  if (plinth) b.props.push(box("marbleWorn", at, [height * 0.36, base, height * 0.32], rotY));
  b.props.push(
    decor({
      kind: "figure",
      material,
      at: foot,
      height,
      rotY,
      identity: who,
      ...(scan ? { scan: { id: scan } } : {}),
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
  "hattusa-aslanli-kapi": "hittite",
  "troya-vi-surlari": "bronze-age",
  "catalhoyuk-dogu-hoyugu": "village-neolithic",
  "ani-katedrali": "medieval",
  "sagalassos-antoninler-cesmesi": "roman",
  "zeugma-villa": "roman",
  "sumela-manastiri": "byzantine",
  "patara-deniz-feneri": "roman",
};

/** The scene for one reconstruction. */
export function lifeFor(item: Reconstruction): SceneLife {
  return { ...furnish(item, sceneFor(item)), walkStart: walkStartFor(item.model) };
}

function sceneFor(item: Reconstruction): SceneLife {
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
    case "hittite-gate":
      return hittiteGateLife(spec, era);
    case "troy-citadel":
      return troyLife(spec, era);
    case "neolithic-town":
      return townLife(spec, era);
    case "medieval-cathedral":
      return cathedralLife(spec, era);
    case "nymphaeum":
      return nymphaeumLife(spec, era);
    case "terrace-villa":
      return villaLife(spec, era);
    case "cliff-monastery":
      return monasteryLife(spec, era);
    case "lighthouse":
      return lighthouseLife(spec, era);
  }
}

/* ------------------------------------------------------------------ *
 * The market and the street: furniture where people gathered
 * ------------------------------------------------------------------ */

type PieceKind =
  "stall" | "fountain" | "trough" | "bench" | "cart" | "honorific" | "basin" | "torch";

/** One piece of street furniture, wanted at `at`, its front (`+z`) turned by `rotY`. */
type Piece = { kind: PieceKind; at: Vec3; rotY: number; goods?: Goods };

/**
 * Each piece's footprint in its own frame — half-widths across and along,
 * and how far its middle sits from `at` along `z` — including the place a
 * stallholder stands behind the counter.
 */
const FOOTPRINT: Record<PieceKind, { hx: number; hz: number; cz: number }> = {
  stall: { hx: 1.3, hz: 1.05, cz: -0.25 },
  fountain: { hx: 1.2, hz: 0.7, cz: -0.22 },
  trough: { hx: 0.9, hz: 0.3, cz: 0 },
  bench: { hx: 1.1, hz: 0.25, cz: 0 },
  cart: { hx: 0.82, hz: 1.65, cz: 0.6 },
  honorific: { hx: 0.55, hz: 0.55, cz: 0 },
  basin: { hx: 0.6, hz: 0.6, cz: 0 },
  torch: { hx: 0.25, hz: 0.25, cz: 0 },
};

/** Where each scene's crowd gathers: the pieces it would like, in order of want. */
function marketFor(item: Reconstruction): Piece[] {
  const spec = item.model;
  const p = (kind: PieceKind, x: number, z: number, rotY = 0, goods?: Goods): Piece => ({
    kind,
    at: [x, 0, z],
    rotY,
    ...(goods ? { goods } : {}),
  });
  const E = Math.PI / 2;
  switch (spec.kind) {
    case "roman-facade": {
      // The square before the library: the city's market came up to its steps.
      const sf = -spec.steps * 0.44;
      return [
        // (Its north side is the Mazaeus-Mithridates gate: the stalls there
        // stand out in the square instead.)
        p("stall", -8.4, sf - 10.4, 0, "amphorae"),
        p("stall", 15.2, sf - 3.9, -E, "cloth"),
        p("stall", 9.2, sf - 10.6, 0, "baskets"),
        p("stall", 15.2, sf - 6.7, -E, "amphorae"),
        p("fountain", 0, sf - 11.6, 0),
        p("honorific", -15, sf + 0.6, E),
        p("honorific", 15, sf + 0.6, -E),
        p("bench", -6, sf - 12.2, 0),
        p("bench", 6, sf - 12.2, 0),
        p("torch", -14, sf - 2.2),
        p("torch", 14, sf - 2.2),
      ];
    }
    case "ionic-dipteros": {
      // The forecourt: basins at the way in, statues along the sacred way,
      // and the sellers of offerings by the road.
      const front = -spec.crepidomaLength / 2;
      const altarZ = front - Math.min(17, spec.crepidomaWidth * 0.3);
      const side = spec.crepidomaWidth / 2;
      return [
        p("basin", -6.5, front - 3),
        p("basin", 6.5, front - 3),
        p("honorific", -9.5, altarZ + 4, E),
        p("honorific", 9.5, altarZ + 4, -E),
        p("honorific", -9.5, altarZ - 6, E),
        p("honorific", 9.5, altarZ - 6, -E),
        p("stall", -14, altarZ - 3, E, "baskets"),
        p("stall", 14, altarZ - 3, -E, "amphorae"),
        p("bench", -(side + 3), front + 12, E),
        p("bench", side + 3, front + 12, -E),
        p("cart", 19, altarZ - 4, -0.3),
        p("trough", 21.5, altarZ + 1.5, -0.3),
      ];
    }
    case "great-altar": {
      const foot = -spec.baseDepth / 2 - spec.steps * 0.55;
      const edge = spec.baseWidth / 2;
      return [
        p("honorific", -(edge + 3.5), foot - 3, 0.3),
        p("honorific", edge + 3.5, foot - 3, -0.3),
        p("basin", -(edge + 1.2), foot - 1.6),
        p("basin", edge + 1.2, foot - 1.6),
        p("bench", -(edge + 4.2), foot + 6, E),
        p("bench", edge + 4.2, foot + 6, -E),
        p("stall", -(edge + 3), foot - 6, 0.4, "amphorae"),
        p("fountain", edge + 3, foot - 6, -0.4),
      ];
    }
    case "roman-theatre": {
      // At the side entrances, where the audience came in from the town.
      const L = theatreLayout(spec);
      const R = L.outerRadius + 1.4;
      const pieces: Piece[] = [];
      for (const s of [-1, 1]) {
        const toward = s > 0 ? -E : E;
        pieces.push(
          p("stall", s * (R + 6), -4.5, toward, s > 0 ? "baskets" : "amphorae"),
          p("fountain", s * (R + 6.5), L.wallZ - 7, toward),
          p("honorific", s * (R + 2.8), 2.5, toward),
          p("torch", s * (L.stageWidth / 2 + 1.2), -1),
          p("bench", s * (R + 3), 8, toward),
        );
      }
      pieces.push(p("cart", R + 10, L.wallZ - 12, 0.3), p("trough", R + 11.5, L.wallZ - 7.5, 0.3));
      const behind = L.wallZ - 9;
      // And behind the stage building, where its own doors let out.
      pieces.push(
        p("stall", -12, behind - 4, Math.PI, "amphorae"),
        p("fountain", 9, behind - 4.5, Math.PI),
        p("honorific", -4, behind - 3, Math.PI),
        p("bench", 3.5, behind - 3.2, Math.PI),
      );
      if (L.character.annex === "harbour-street") {
        pieces.push(
          p("stall", -3.4, behind - 14, E, "cloth"),
          p("stall", 3.4, behind - 26, -E, "amphorae"),
          p("fountain", -3.6, behind - 34, E),
          p("honorific", 3.8, behind - 8, -E),
        );
      } else if (L.character.annex === "agora") {
        const cz = behind - 38;
        pieces.push(
          p("stall", -12, cz + 9, E, "cloth"),
          p("stall", 12, cz + 9, -E, "baskets"),
          p("stall", -12, cz - 6, E, "amphorae"),
          p("fountain", 0, cz + 16, 0),
          p("honorific", -7, cz + 22, 0),
          p("honorific", 7, cz + 22, 0),
        );
      }
      return pieces;
    }
    case "stadium": {
      const L = layoutOfStadium(spec);
      const outer = L.halfWidth + 1.2;
      if (spec.vaults) {
        const gz = -L.endCentre;
        return [
          p("honorific", -(L.arenaHalf + 1.6), gz - 2.6, Math.PI),
          p("honorific", L.arenaHalf + 1.6, gz - 2.6, Math.PI),
          p("fountain", -(L.arenaHalf + 5), gz - 6, Math.PI),
          p("stall", L.arenaHalf + 6, gz - 8, -2.6, "baskets"),
          p("torch", -L.arenaHalf / 3 - 0.9, gz - 1.6),
          p("torch", L.arenaHalf / 3 + 0.9, gz - 1.6),
          p("trough", outer + 7.6, -L.endCentre * 0.45, -E),
          p("cart", outer + 8.4, L.endCentre * 0.25, 0.2),
          p("bench", outer + 7.4, L.endCentre * 0.6, -E),
        ];
      }
      // Outside the long side away from the city wall, where the crowd came in.
      const x = outer + (spec.bow ?? 0) + 4.5;
      return [
        p("stall", x, -18, -E, "baskets"),
        p("stall", x, 16, -E, "amphorae"),
        p("fountain", x + 0.6, -2, -E),
        p("honorific", x - 1.5, -36, -E),
        p("honorific", x - 1.5, 34, -E),
        p("cart", x + 4, 26, Math.PI + 0.2),
        p("trough", x + 4.2, 6, -E),
        p("bench", x - 0.5, -26, -E),
      ];
    }
    case "peristyle-house": {
      // The street below the house: a fountain, a benefactor, a seat.
      const halfD = spec.courtDepth / 2;
      const shell = spec.courtWidth / 2 + 0.45 + spec.roomDepth;
      return [
        p("fountain", shell - 1.6, -halfD - 4.6, Math.PI),
        p("honorific", -(shell - 1.2), -halfD - 4.4, Math.PI),
        p("bench", -(shell - 3.6), -halfD - 5.2, Math.PI),
        p("stall", 1.5, -halfD - 7.6, Math.PI, "cloth"),
      ];
    }
    case "mausoleum": {
      const hw = spec.baseWidth / 2 + 4;
      const hd = spec.baseDepth / 2 + 4;
      return [
        p("honorific", -(hw - 4), -hd - 2.2, Math.PI),
        p("honorific", hw - 4, -hd - 2.2, Math.PI),
        p("basin", -(hw + 2.2), -hd + 4),
        p("bench", hw + 3, 2, -E),
        p("bench", -(hw + 3), 2, E),
      ];
    }
    default:
      return [];
  }
}

/**
 * Where the scene's stalls and fountains are asked for: for the sound, which
 * needs only to know where the market is, not which stall fitted.
 */
export function marketSpots(item: Reconstruction): { stalls: Vec3[]; fountains: Vec3[] } {
  const wanted = marketFor(item);
  return {
    stalls: wanted.filter((p) => p.kind === "stall").map((p) => p.at),
    fountains: wanted.filter((p) => p.kind === "fountain").map((p) => p.at),
  };
}

/** A plan rectangle, turned: the ground a piece covers. */
type Rect = { x: number; z: number; hx: number; hz: number; rotY: number };

const rectOf = (piece: Piece, pad = 0): Rect => {
  const f = FOOTPRINT[piece.kind];
  const c = turn(piece.at, piece.rotY, 0, 0, f.cz);
  return { x: c[0], z: c[2], hx: f.hx + pad, hz: f.hz + pad, rotY: piece.rotY };
};

const inRect = (r: Rect, x: number, z: number) => {
  const dx = x - r.x;
  const dz = z - r.z;
  const u = dx * Math.cos(r.rotY) - dz * Math.sin(r.rotY);
  const v = dx * Math.sin(r.rotY) + dz * Math.cos(r.rotY);
  return Math.abs(u) <= r.hx && Math.abs(v) <= r.hz;
};

/** Points a quarter metre apart over a rectangle, edges included. */
function samplesOf(r: Rect): [number, number][] {
  const out: [number, number][] = [];
  const nx = Math.max(1, Math.ceil((r.hx * 2) / 0.25));
  const nz = Math.max(1, Math.ceil((r.hz * 2) / 0.25));
  for (let i = 0; i <= nx; i += 1) {
    for (let k = 0; k <= nz; k += 1) {
      const u = -r.hx + (2 * r.hx * i) / nx;
      const v = -r.hz + (2 * r.hz * k) / nz;
      out.push([
        r.x + u * Math.cos(r.rotY) + v * Math.sin(r.rotY),
        r.z - u * Math.sin(r.rotY) + v * Math.cos(r.rotY),
      ]);
    }
  }
  return out;
}

/** Whether a part occupies the point (x, y, z) — a solid, or water underfoot. */
function occupies(part: Part, x: number, y: number, z: number): boolean {
  if (part.material === "grass" || part.material === "human") return false;
  if (part.kind === "box" || part.kind === "prism") {
    const dx = x - part.at[0];
    const dz = z - part.at[2];
    const u = dx * Math.cos(part.rotY) - dz * Math.sin(part.rotY);
    const v = dx * Math.sin(part.rotY) + dz * Math.cos(part.rotY);
    const tilt =
      part.kind === "box" && part.rotX ? part.size[2] * Math.abs(Math.sin(part.rotX)) : 0;
    const top = part.at[1] + part.size[1] + tilt;
    const bottom = part.material === "water" ? part.at[1] - 2 : part.at[1] - tilt;
    return (
      Math.abs(u) < part.size[0] / 2 &&
      Math.abs(v) < part.size[2] / 2 + tilt &&
      y > bottom &&
      y < top
    );
  }
  if (part.kind === "cylinder") {
    const r = Math.max(part.radiusBottom, part.radiusTop);
    if (part.rotX) {
      const b = boundsOf([{ ...part, decor: false }]);
      return (
        x > b.min[0] && x < b.max[0] && z > b.min[2] && z < b.max[2] && y > b.min[1] && y < b.max[1]
      );
    }
    return (
      Math.hypot(x - part.at[0], z - part.at[2]) < r &&
      y > part.at[1] &&
      y < part.at[1] + part.height
    );
  }
  if (part.kind === "ring" || part.kind === "bank") {
    const dx = x - part.at[0];
    const dz = z - part.at[2];
    const r = Math.hypot(dx, dz);
    const theta = Math.atan2(dz, dx);
    const turnTo = (((theta - part.thetaStart) % TAU) + TAU) % TAU;
    if (turnTo > part.thetaLength) return false;
    if (part.kind === "bank") {
      return y < part.at[1] + bankHeight(part, r, part.thetaStart + turnTo) - 0.05;
    }
    return r > part.inner && r < part.outer && y > part.at[1] && y < part.at[1] + part.height;
  }
  if (
    part.kind === "relief" ||
    part.kind === "carving" ||
    part.kind === "loft" ||
    part.kind === "sculpt" ||
    part.kind === "figure"
  ) {
    const b = boundsOf([{ ...part, decor: false }]);
    return (
      x > b.min[0] && x < b.max[0] && z > b.min[2] && z < b.max[2] && y > b.min[1] && y < b.max[1]
    );
  }
  return false;
}

/**
 * What an honorific base in the square says. Where a real statue base of the
 * place has been read — the Asiarch Apollodoros at Miletus, the high priest
 * Kleon at Ephesus — the first statue carries it; any other carries only the
 * formula such bases open with ("the council and the people honoured"), the
 * name below worn away rather than invented.
 */
function honorificText(id: string, index: number, female: boolean): EpigraphicText {
  if (index === 1 && !female) {
    if (id === "milet-buyuk-tiyatro") return TEXTS.miletusApollodoros;
    if (
      ["celsus-kutuphanesi", "efes-buyuk-tiyatro", "efes-yamac-evler", "artemis-tapinagi"].includes(
        id,
      )
    )
      return TEXTS.ephesusHonorific;
  }
  return TEXTS.honorificFormula;
}

/**
 * Sets the scene's street furniture down where it fits: on open ground the
 * landscape leaves flat, clear of the building and of everything else in
 * the scene, and out of the way of everyone who walks — a piece in the path
 * of a walker is left out rather than walked through. Built from its own
 * random source, so the rest of the scene is exactly what it was.
 */
function furnish(item: Reconstruction, life: SceneLife): SceneLife {
  const wanted = marketFor(item);
  if (wanted.length === 0) return life;
  const era = life.era;
  const rand = seeded([...item.id].reduce((h, c) => (h * 33 + c.charCodeAt(0)) >>> 0, 911));
  const cast = new Cast(rand, era);
  const parts = partsFor(item.model);
  const bounds = boundsOf(parts);
  const centre = [(bounds.min[0] + bounds.max[0]) / 2, (bounds.min[2] + bounds.max[2]) / 2];
  // The ground stays flat out to here (see `landscape.ts`).
  const flat =
    Math.hypot((bounds.max[0] - bounds.min[0]) / 2, (bounds.max[2] - bounds.min[2]) / 2) * 1.25;
  // Where people and animals go, a quarter metre at a time, and where they stand.
  const trodden: [number, number][] = [];
  const tread = (route: Vec3[]) => {
    const loop = route.length > 2 ? [...route, route[0]!] : route;
    for (let i = 0; i < loop.length; i += 1) {
      const a = loop[i]!;
      trodden.push([a[0], a[2]]);
      const b = loop[i + 1];
      if (!b) continue;
      const n = Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.25);
      for (let k = 1; k < n; k += 1) {
        trodden.push([a[0] + ((b[0] - a[0]) * k) / n, a[2] + ((b[2] - a[2]) * k) / n]);
      }
    }
  };
  for (const person of life.people) tread([person.at, ...(person.route ?? [])]);
  for (const a of life.animals) tread([a.at, ...(a.route ?? [])]);
  for (const c of life.chariots) tread(c.route);
  const solid = [...parts, ...life.props];
  const near = (r: Rect) => {
    const reach = Math.hypot(r.hx, r.hz) + 1;
    return solid.filter((part) => {
      const b = boundsOf([{ ...part, decor: false }]);
      return (
        b.min[0] < r.x + reach &&
        b.max[0] > r.x - reach &&
        b.min[2] < r.z + reach &&
        b.max[2] > r.z - reach
      );
    });
  };
  const props: Part[] = [];
  const flames: Flame[] = [];
  const fits = (piece: Piece) => {
    const body = rectOf(piece);
    const corners = samplesOf(body);
    if (corners.some(([x, z]) => Math.hypot(x - centre[0]!, z - centre[1]!) > flat)) return false;
    const walked = rectOf(piece, 0.45);
    if (trodden.some(([x, z]) => inRect(walked, x, z))) return false;
    const around = near(body);
    return !corners.some(([x, z]) =>
      [0.12, 0.9, 1.9].some((y) => around.some((part) => occupies(part, x, y, z))),
    );
  };
  /*
   * Each piece where it was asked for, or failing that a step or two to one
   * side: the scatter of rock round a site is random, and a piece is moved
   * off a boulder rather than dropped.
   */
  const NUDGES: [number, number][] = [
    [0, 0],
    [1.5, 0],
    [-1.5, 0],
    [0, 1.5],
    [0, -1.5],
    [2.5, 2.5],
    [-2.5, 2.5],
    [2.5, -2.5],
    [-2.5, -2.5],
  ];
  // Statues are the dearest thing in a scene to draw: two to a square.
  let statues = 0;
  for (const asked of wanted) {
    if (asked.kind === "honorific" && statues >= 2) continue;
    const piece = NUDGES.map(([dx, dz]): Piece => ({
      ...asked,
      at: [asked.at[0] + dx, asked.at[1], asked.at[2] + dz],
    })).find((option) => fits(option));
    if (!piece) continue;
    const { at, rotY } = piece;
    let made: Part[];
    switch (piece.kind) {
      case "stall":
        made = stall(at, rotY, rand, piece.goods ?? "amphorae");
        cast.add({
          at: turn(at, rotY, between(rand, -0.4, 0.4), 0, -0.85),
          rotY,
          action: "talk",
          role: "worker",
        });
        break;
      case "fountain":
        made = fountain(at, rotY);
        break;
      case "trough":
        made = trough(at, rotY);
        break;
      case "bench":
        made = stoneBench(at, 2.2, rotY);
        break;
      case "cart":
        made = cart(at, rotY, rand);
        break;
      case "honorific":
        statues += 1;
        {
          const female = rand() < 0.35;
          made = honorific(at, rotY, female, honorificText(item.id, statues, female), statues);
        }
        break;
      case "basin":
        made = lustralBasin(at);
        break;
      case "torch": {
        const torch = torchStand(at, 1.9);
        made = torch.parts;
        flames.push({ at: torch.flame, size: 0.3 });
        break;
      }
    }
    props.push(...made);
    solid.push(...made);
    // What is set down is in the way of what comes after it, and so is its keeper.
    for (const person of cast.people.slice(-1)) trodden.push([person.at[0], person.at[2]]);
  }
  return {
    ...life,
    people: [...life.people, ...cast.people],
    props: [...life.props, ...props],
    flames: [...life.flames, ...flames],
  };
}

/* ------------------------------------------------------------------ *
 * The Bronze Age, Neolithic and medieval models (in src/lib/models/)
 * ------------------------------------------------------------------ */

/**
 * The Lion Gate on an ordinary day of the Hittite empire: guards at the
 * towers, a priest and priestess pouring an offering before the lions, a
 * farmer and his donkey climbing the ramp, an oxcart waiting at its foot,
 * sentries on the wall walk, sheep on the slope below.
 */
function hittiteGateLife(spec: HittiteGateSpec, era: Era): SceneLife {
  const b = make(era, 5141);
  const { cast, rand } = b;
  const L = hittiteGateLayout(spec);
  const R = L.R;
  const floor = R + 0.1;
  const paving = R + 0.06;
  const front = L.zo;
  const S = Math.PI;

  // Guards before the towers, spears grounded, facing the road.
  for (const side of [-1, 1]) {
    cast.add({
      at: [side * 4.6, R, front - 1.3],
      rotY: S,
      action: "stand",
      role: "soldier",
      carry: "spear",
    });
    fire(b, torchStand([side * 5.6, R, front - 0.75], 1.9), 0.35, side < 0);
  }
  // An offering before the left lion: the priest's hands raised, the
  // priestess with the jar, a stone stand with a bowl on it.
  b.props.push(box("stone", [-2.5, R, front - 1.7], [0.7, 0.75, 0.55]));
  b.props.push(cyl("terracotta", [-2.5, R + 0.75, front - 1.7], 0.12, 0.2, 0.09, 12));
  cast.add({ at: [-2.4, R, front - 2.7], rotY: 0, action: "pray", role: "priest" });
  cast.add({
    at: [-3.5, R, front - 2.9],
    rotY: 0.3,
    action: "tend",
    role: "priestess",
    carry: "jar",
  });
  fire(b, brazier([-6.5, R, front - 3.6], 1), 0.55, true, true);

  // Up the ramp from the plain, through the gate and into the city, and back.
  const ramp = L.ramp;
  const z = ramp.z + 0.3;
  const up: Vec3[] = [
    [ramp.top + ramp.run + 1.3, 0, z],
    [ramp.top + ramp.run - 0.05, 0, z],
    [ramp.top + 0.8, R, z],
    [6, R, front - 5.5],
    // Round the right-hand lion, not through it, and in at the middle.
    [0.7, R, front - 2.6],
    [0.7, floor, front + 1.5],
    [0.7, paving, L.zi + 14],
  ];
  const there = (route: Vec3[]) => [...route, ...route.slice(1, -1).reverse()];
  cast.walk(there(up), { role: "worker", carry: "basket", speed: 0.8 });
  animal(b, "donkey", up[0]!, -Math.PI / 2, "walk", {
    route: there(up.map(([x, y, zz]) => [x, y, zz + 1.0] as Vec3)),
    speed: 0.8,
    load: true,
  });
  cast.walk(there([...up].reverse().map(([x, y, zz]) => [x, y, zz - 0.7] as Vec3)), {
    role: "citizen",
    female: true,
    carry: "jar",
    speed: 0.9,
  });
  cast.walk(there(up.slice(1).map(([x, y, zz]) => [x, y, zz - 1.3] as Vec3)), {
    role: "citizen",
    speed: 1.1,
  });
  // In the forecourt: people talking, children, a dog asleep.
  cast.group([9, R, front - 9], 3);
  cast.group([-8, R, front - 8], 2);
  cast.add({ at: [3.5, R, front - 11], rotY: 1.1, action: "play", role: "child" });
  cast.add({ at: [4.3, R, front - 11.6], rotY: -2, action: "play", role: "child" });
  dog(b, [10.8, R, front - 6.4]);
  // Storage jars set down by a trader.
  for (let i = 0; i < 4; i += 1)
    b.props.push(...jar([14 + (i % 2) * 0.8, R, front - 12 - Math.floor(i / 2) * 0.8], 1.1));
  cast.add({ at: [14.4, R, front - 10.6], rotY: S, action: "call", role: "worker" });

  // Sentries on the wall walk east of the gate.
  const walk = R + spec.wallHeight - 1.25;
  const gx = L.P / 2 + spec.towerWidth;
  cast.walk(
    [
      [gx + 1.5, walk, 0.8],
      [gx + 10, walk, 0.8],
    ],
    { role: "soldier", carry: "spear", speed: 0.6 },
  );
  cast.add({ at: [-gx - 6, walk, -1], rotY: S, action: "stand", role: "soldier", carry: "spear" });

  // Inside: the street into the Upper City.
  cast.walk(
    [
      [-1.6, paving, L.zi + 3],
      [-1.6, paving, L.zi + 16],
    ],
    { role: "citizen", female: true, carry: "basket" },
  );
  cast.walk(
    [
      [1.8, paving, L.zi + 15],
      [1.2, floor, front + 2],
    ],
    { role: "priest", speed: 0.7 },
  );
  dog(b, [
    [-2.2, paving, L.zi + 6],
    [-1.4, paving, L.zi + 15],
  ]);

  // An oxcart at the foot of the ramp, the pair still yoked, the driver by them.
  const cartAt: Vec3 = [ramp.top + ramp.run + 4.6, 0, ramp.z - 3.6];
  const yaw = -Math.PI / 2;
  b.props.push(...cart(cartAt, yaw, rand));
  for (const side of [-1, 1]) {
    animal(b, "ox", turn(cartAt, yaw, side * 0.6, 0, 2.9), yaw, "stand", { dressed: 0x8a6a48 });
  }
  cast.add({
    at: turn(cartAt, yaw, 1.5, 0, 3.4),
    rotY: yaw,
    action: "stand",
    role: "worker",
    carry: "staff",
  });

  // Sheep on the plain below the rampart, and their shepherd.
  flock(b, "sheep", [22, 0, ramp.z - 13], 9, 5);
  flock(b, "goat", [6, 0, ramp.z - 11], 4, 3);
  cast.add({
    at: [17, 0, ramp.z - 10],
    rotY: 0.6,
    action: "stand",
    role: "worker",
    carry: "crook",
  });

  /*
   * The gate's business: a scribe at the gate taking down what comes in on
   * a tablet, a patrol before the towers (no round shields: the Hittites
   * carried tall waisted ones, not the hoplite's), a caravan of donkeys
   * following the first one up the ramp with their driver, a woman at the
   * quern, another spinning.
   */
  const x = aside(b, 5142);
  trades.scribe(x, [-10.5, R, front - 4.5], Math.PI / 2, { role: "official" });
  trades.patrol(
    x,
    [
      [-13, R, front - 2.2],
      [-8.4, R, front - 2.2],
      [-8.4, R, front - 2.8],
      [-13, R, front - 2.8],
    ],
    3,
    false,
  );
  const lead = b.animals.find((a) => a.species === "donkey")!;
  for (let i = 1; i <= 2; i += 1) {
    const d = animal(x, "donkey", lead.route![0]!, lead.rotY, "walk", {
      route: lead.route!,
      speed: lead.speed!,
      load: true,
    });
    d.phase = lead.phase - (i * 2.3) / 5;
  }
  const driver = x.cast.walk(lead.route!, { role: "worker", carry: "staff", speed: lead.speed! });
  driver.phase = (lead.phase * 5 - 3 * 2.3 - 0.4) / 7;
  trades.grinder(x, [11.0, R, front - 13.2], 0);
  x.cast.add({
    at: [-11.2, R, front - 9.6],
    rotY: 0.9,
    action: "spin",
    carryLeft: "distaff",
    female: true,
  });
  return finish(b);
}

/**
 * Troy VI: people and a loaded donkey climbing the passage of the East Gate,
 * a guard at its head and one on the tower, a two-horse chariot driven out
 * on the plain, horses and sheep grazing, and the household by its hearth.
 */
function troyLife(spec: TroyCitadelSpec, era: Era): SceneLife {
  const b = make(era, 6113);
  const { cast, rand } = b;
  const L = troyLayout(spec);
  const t = spec.terrace;
  const there = (route: Vec3[]) => [...route, ...route.slice(1, -1).reverse()];
  const lane = L.east.inner + 1.0;
  const up: Vec3[] = [
    [-3, 0, lane],
    [L.east.x0 - 4 - 0.05, 0, lane],
    [L.west.x1 - 0.3, t, lane],
    [22.6, t, -3],
    [23.4, t + 0.06, 14],
  ];
  const shift = (route: Vec3[], dz: number, dx = 0) =>
    route.map(([x, y, z]) => [x + dx, y, z + dz] as Vec3);
  cast.walk(there(up), { role: "worker", carry: "amphora", speed: 0.8 });
  animal(b, "donkey", up[0]!, Math.PI / 2, "walk", {
    route: there(shift(up, -0.3)),
    speed: 0.75,
    load: true,
  });
  cast.walk(there(shift([...up].reverse(), 0.3)), {
    role: "citizen",
    female: true,
    carry: "basket",
    speed: 0.9,
  });
  cast.walk(there(shift(up.slice(1), -0.5)), { role: "citizen", speed: 1.1 });
  // A guard where the passage turns in, another on the tower.
  cast.add({
    at: [21.6, t, -5.9],
    rotY: -Math.PI / 2,
    action: "stand",
    role: "soldier",
    carry: "spear",
    carryLeft: "shield",
  });
  const towerTop = spec.stoneHeight + spec.brickHeight + 2.4;
  const tcx = L.tower.x0 + spec.towerWidth / 2;
  cast.add({
    at: [tcx - 2, towerTop, L.east.outer - spec.towerDepth / 2],
    rotY: Math.PI,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });
  fire(b, torchStand([21.8, t, -3.2], 1.8), 0.33, true);

  // The household before the first house: a hearth, a loom, jars.
  const hx = -22;
  const hz = 16 + 13.5;
  fire(b, brazier([hx + 6, t, hz - 4], 0.9), 0.5, true, true);
  cast.add({
    at: [hx + 6.9, t, hz - 4.6],
    rotY: -0.9,
    action: "tend",
    role: "citizen",
    female: true,
  });
  cast.add({ at: [hx + 5, t, hz - 5], rotY: 0.8, action: "sit", role: "child" });
  b.props.push(
    box("timber", [hx - 2.6, t, hz - 2], [0.08, 1.9, 0.08]),
    box("timber", [hx - 1.0, t, hz - 2], [0.08, 1.9, 0.08]),
  );
  b.props.push(box("timber", [hx - 1.8, t + 1.8, hz - 2], [1.8, 0.08, 0.09]));
  b.props.push(box("hide", [hx - 1.8, t + 0.5, hz - 2], [1.5, 1.25, 0.02]));
  cast.add({
    at: [hx - 1.8, t, hz - 1.4],
    rotY: Math.PI,
    action: "weave",
    role: "citizen",
    female: true,
  });
  for (let i = 0; i < 3; i += 1) b.props.push(...jar([hx + 3 + i * 0.75, t, hz - 1.4], 1));
  cast.group([4, t, 8], 3);
  cast.group([-12, t, 6.5], 2);
  dog(b, [hx + 7.5, t, hz - 2.6]);
  dog(b, [
    [0, t, 5],
    [14, t, 6],
  ]);

  // Out on the plain: a chariot, the horses Troy was famous for, the flocks.
  const coat = COATS.horse;
  b.chariots.push({
    route: [
      [-40, 0, -24],
      [8, 0, -27],
      [38, 0, -36],
      [-30, 0, -40],
    ],
    speed: 4.5,
    phase: 0,
    team: 2,
    horses: [coat[0]!, coat[1]!],
    driver: dress(rand, era, "soldier"),
    colour: 0x8a5a3a,
  });
  flock(b, "horse", [-26, 0, -33], 4, 4);
  flock(b, "sheep", [18, 0, -46], 8, 5);
  cast.add({ at: [14, 0, -43], rotY: 0.4, action: "stand", role: "worker", carry: "crook" });

  /*
   * More of the citadel and the plain: a potter at his wheel between the
   * houses, a woman spinning by the hearth, another fetching water, children
   * with knucklebones; out on the plain a ploughman behind his oxen, and a
   * rider on one of the horses Troy was famous for.
   */
  const x = aside(b, 6114);
  trades.potter(x, [4.5, t, 17], Math.PI / 2);
  x.cast.add({
    at: [hx + 9.5, t, hz - 2],
    rotY: -Math.PI / 2,
    action: "spin",
    carryLeft: "distaff",
    female: true,
  });
  x.cast.walk(
    [
      [-8, t, hz + 0.5],
      [6, t, hz + 0.5],
    ],
    { carry: "jar", female: true, speed: 0.75 },
  );
  trades.knucklebones(x, [-3.0, t, 6.5], 0.3, false);
  trades.ploughing(x, [
    [-40, 0, -13],
    [-18, 0, -13],
    [-18, 0, -16],
    [-40, 0, -16],
  ]);
  dog(x, [12.8, 0, -42]);
  const ride: Vec3[] = [
    [20, 0, -22],
    [40, 0, -22],
    [40, 0, -28],
    [20, 0, -28],
  ];
  animal(x, "horse", ride[0]!, Math.PI / 2, "walk", {
    route: ride,
    speed: 1.6,
    rider: dress(x.rand, era, "citizen", false),
  });
  return finish(b);
}

/**
 * Çatalhöyük on a working day: people on the roofs, which were the streets
 * and the workplaces — grinding grain, knapping obsidian, minding a fire,
 * drying a hide — and inside the open house, a woman at the oven, a child
 * on the platform; sheep and goats in the yard, dogs everywhere.
 */
function townLife(spec: NeolithicTownSpec, era: Era): SceneLife {
  const b = make(era, 7201);
  const { cast } = b;
  const L = townLayout(spec);
  const h = L.houses;
  const roof = (i: number) => h[i]!.roof;
  const on = (i: number, dx: number, dz: number): Vec3 => [h[i]!.cx + dx, roof(i), h[i]!.cz + dz];

  // Grinding grain on a quern.
  b.props.push(box("limestone", on(0, -0.8, 1.5), [0.7, 0.14, 0.42], 0.3));
  b.props.push(
    box(
      "stone",
      [on(0, -0.8, 1.5)[0], roof(0) + 0.14, on(0, -0.8, 1.5)[2]],
      [0.3, 0.07, 0.16],
      0.3,
    ),
  );
  cast.add({ at: on(0, -0.8, 2.15), rotY: Math.PI, action: "kneel", female: true });
  // Knapping obsidian, the flakes scattered round him.
  cast.add({ at: on(3, -0.7, 1.2), rotY: 0.5, action: "kneel", carry: "chisel", female: false });
  for (let i = 0; i < 6; i += 1)
    b.props.push(
      box(
        "stoneDark",
        on(3, -0.5 + (i % 3) * 0.12, 1.6 + Math.floor(i / 3) * 0.1),
        [0.06, 0.02, 0.04],
        i,
      ),
    );
  // Neighbours talking on a roof.
  cast.group(on(5, -1.0, 1.4), 3);
  // A hide stretched to dry, and someone pacing past it.
  b.props.push(
    box("timber", on(6, -1.4, -0.6), [0.07, 1.7, 0.07]),
    box("timber", on(6, 0.2, -0.6), [0.07, 1.7, 0.07]),
  );
  b.props.push(
    box("timber", [on(6, -0.6, -0.6)[0], roof(6) + 1.62, on(6, -0.6, -0.6)[2]], [1.7, 0.07, 0.08]),
  );
  b.props.push(
    box("hide", [on(6, -0.6, -0.6)[0], roof(6) + 0.45, on(6, -0.6, -0.6)[2]], [1.4, 1.1, 0.02]),
  );
  cast.walk([on(6, -1.8, 1.8), on(6, 1.8, 1.8)], { female: true, carry: "basket", speed: 0.6 });
  // A fire on a roof, ringed with stones, smoke going up.
  const fireAt = on(8, -1.2, 1.5);
  for (let i = 0; i < 7; i += 1) {
    const a = (TAU * i) / 7;
    b.props.push(
      box(
        "stone",
        [fireAt[0] + Math.cos(a) * 0.42, fireAt[1], fireAt[2] + Math.sin(a) * 0.42],
        [0.2, 0.14, 0.16],
        -a,
      ),
    );
  }
  b.flames.push({
    at: [fireAt[0], fireAt[1] + 0.06, fireAt[2]],
    size: 0.7,
    light: true,
    smoke: true,
  });
  cast.add({ at: on(8, -0.3, 1.9), rotY: -2.2, action: "tend", female: true });
  cast.add({ at: on(8, -1.9, 2.4), rotY: 2.6, action: "stand", female: false });
  cast.add({ at: on(9, -0.6, 1.2), rotY: 1.4, action: "play", role: "child" });
  cast.add({ at: on(9, 0.4, 1.8), rotY: -1.7, action: "talk", female: true });
  dog(b, on(9, 1.2, 2.4));
  cast.add({ at: on(7, 0.5, 1.4), rotY: 0.4, action: "talk", female: false });
  cast.add({ at: on(7, 1.1, 2.1), rotY: -2.4, action: "talk", female: true });
  cast.walk([on(10, -1.2, 1.5), on(10, 1.6, 1.5)], { female: true, carry: "jar", speed: 0.5 });
  cast.add({ at: on(1, -1.2, 2.2), rotY: 2.8, action: "stand", female: false, carry: "staff" });

  // Inside the open house.
  const open = h[2]!;
  const z0 = open.cz - open.d / 2 + spec.wallThickness;
  cast.add({
    at: [open.cx + 0.2, 0.04, z0 + 0.55],
    rotY: -Math.PI / 2,
    action: "kneel",
    female: true,
  });
  cast.add({
    at: [open.cx - 1.5, spec.platformHeight, z0 + spec.roomDepth - 0.7],
    rotY: Math.PI,
    action: "sit",
    role: "child",
  });
  cast.add({
    at: [open.cx - 2.0, 0.04, z0 + 2.1],
    rotY: Math.PI / 2,
    action: "talk",
    female: false,
  });
  b.flames.push({ at: [open.cx - 0.8, 0.22, z0 + 0.9], size: 0.28, light: true });
  for (let i = 0; i < 3; i += 1)
    b.props.push(
      ...jar([open.cx - 2.1 + i * 0.4, spec.platformHeight, z0 + spec.roomDepth - 0.25], 0.55),
    );

  // The yard: sheep and goats, and their keeper.
  const y = L.yard;
  flock(b, "sheep", [y.cx, 0.12, y.cz + 0.5], 4, 1.6);
  flock(b, "goat", [y.cx - 0.5, 0.12, y.cz - 1.6], 2, 0.9);
  cast.add({
    at: [y.cx + 1.6, 0.12, y.cz - 2.3],
    rotY: -0.6,
    action: "stand",
    carry: "staff",
    female: false,
  });
  dog(b, [
    [y.cx - 1.8, 0.12, y.cz + 2.4],
    [y.cx + 1.8, 0.12, y.cz + 2.4],
  ]);
  // On the slope below the houses, someone coming up with water.
  const south = Math.min(...h.map((house) => house.cz - house.d / 2)) - 2;
  cast.walk(
    [
      [-14, 0, south],
      [9, 0, south],
    ],
    { female: true, carry: "jar", speed: 0.7 },
  );

  /*
   * More of the roofs' work: reeds carried over for matting and roofing, a
   * second quern, a spinner — spindle whorls are common finds here — and
   * children with a handful of sheep's knucklebones, which the houses also
   * give up.
   */
  const x = aside(b, 7202);
  x.cast.walk([on(3, -2.0, -1.0), on(3, 1.8, -1.0)], { carry: "reeds", speed: 0.55 });
  trades.grinder(x, on(10, 0.5, -0.8), 0);
  trades.knucklebones(x, on(1, -1.4, -1.0), 0.3);
  x.cast.add({
    at: on(7, -1.4, -0.9),
    rotY: 0.5,
    action: "spin",
    carryLeft: "distaff",
    female: true,
  });
  return finish(b);
}

/**
 * Ani in the eleventh century: priests at the west door of the cathedral,
 * the faithful coming up the steps, a merchant's donkeys crossing the
 * square, an oxcart, and guards on the city wall behind.
 */
function cathedralLife(spec: CathedralSpec, era: Era): SceneLife {
  const b = make(era, 1001);
  const { cast, rand } = b;
  const front = -spec.length / 2;
  const step = 1.05;
  // The clergy at the door, a censer swinging.
  cast.add({
    at: [-1.3, step, front - 0.35],
    rotY: Math.PI,
    action: "stand",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [1.3, step, front - 0.35],
    rotY: Math.PI,
    action: "pray",
    role: "citizen",
    female: true,
  });
  cast.add({
    at: [0, step, front - 0.4],
    rotY: Math.PI,
    action: "talk",
    role: "priest",
    carry: "staff",
  });
  for (const side of [-1, 1])
    fire(b, torchStand([side * 3.3, step, front - 0.38], 1.9), 0.34, true);
  // People coming up the steps to the door, and going back down.
  const there = (route: Vec3[]) => [...route, ...route.slice(1, -1).reverse()];
  for (const [x, dx, female] of [
    [2.2, 6, true],
    [-2.0, -7, false],
    [3.0, 11, false],
  ] as const) {
    cast.walk(
      there([
        [x + dx, 0, front - 15],
        [x, 0, front - 1.38],
        [x, 0.35, front - 1.2],
        [x, 0.7, front - 0.75],
        [x, step, front - 0.35],
      ]),
      { role: "citizen", female, speed: 0.8 },
    );
  }
  cast.group([-7, 0, front - 8], 3);
  cast.group([8, 0, front - 6], 2);
  cast.add({ at: [5.5, 0, front - 4], rotY: 2.4, action: "play", role: "child" });
  cast.add({ at: [6.2, 0, front - 4.6], rotY: -0.8, action: "play", role: "child" });
  // A merchant's donkeys crossing the square, the Silk Road trade of Ani.
  const across: Vec3[] = [
    [-30, 0, front - 12],
    [30, 0, front - 13],
  ];
  cast.walk(across, { role: "worker", carry: "staff", speed: 0.75 });
  for (let i = 1; i <= 3; i += 1)
    animal(b, "donkey", [-30 - i * 2.4, 0, front - 12], Math.PI / 2, "walk", {
      route: across.map(([x, y, z]) => [x - i * 2.4, y, z] as Vec3),
      speed: 0.75,
      load: true,
    });
  // An oxcart waiting at the side of the square.
  const cartAt: Vec3 = [-17, 0, front - 4];
  b.props.push(...cart(cartAt, 0.2, rand));
  for (const side of [-1, 1]) animal(b, "ox", turn(cartAt, 0.2, side * 0.6, 0, 2.9), 0.2, "stand");
  cast.add({
    at: turn(cartAt, 0.2, 1.6, 0, 3.2),
    rotY: 0.2,
    action: "stand",
    role: "worker",
    carry: "staff",
  });
  dog(b, [9, 0, front - 10]);
  dog(b, [
    [-12, 0, 2],
    [-12, 0, -10],
  ]);
  // Guards on the city wall behind the apse.
  const wz = spec.length / 2 + 26;
  cast.walk(
    [
      [-30, 11, wz - 0.6],
      [-6, 11, wz - 0.6],
    ],
    { role: "soldier", carry: "spear", speed: 0.5 },
  );
  cast.add({ at: [20, 11, wz - 0.4], rotY: 0, action: "stand", role: "soldier", carry: "spear" });
  // People along the foot of the wall.
  cast.walk(
    [
      [-25, 0, wz - 6],
      [25, 0, wz - 6],
    ],
    { role: "citizen", female: true, carry: "basket" },
  );

  /*
   * Ani as the Silk Road knew it: a camel caravan coming across the square
   * with its driver, a merchant weighing out spice for a customer, a
   * money-changer, masons at work on the church's dressed tuff, and the
   * clergy going round the cathedral with the Gospel book and a candle.
   */
  const x = aside(b, 1002);
  const road: Vec3[] = [
    [32, 0, front - 19],
    [-32, 0, front - 20],
  ];
  const camels = [0, 1].map((i) =>
    animal(x, "camel", road[0]!, -Math.PI / 2, "walk", { route: road, speed: 0.7, load: true }),
  );
  camels[1]!.phase = camels[0]!.phase - 3.2 / 5;
  const driver = x.cast.walk(road, {
    role: "worker",
    carry: "staff",
    speed: 0.7,
    outfit: { headwear: "turban", purse: true, bag: 0x6b4a30 },
  });
  driver.phase = (camels[0]!.phase * 5 + 2.4) / 7;
  trades.weigher(x, [16, 0, front - 6], -Math.PI / 2, { role: "citizen", outfit: { purse: true } });
  trades.changer(x, [-22, 0, front - 16], Math.PI / 2);
  trades.mason(x, [-17, 0, 6], Math.PI / 2, "conglomerate");
  trades.mason(x, [-17, 0, 9.5], Math.PI / 2, "conglomerate");
  const round: Vec3[] = [
    [-14, 0, front - 2.6],
    [14, 0, front - 2.6],
    [14.5, 0, spec.length / 2 + 2],
    [-14.5, 0, spec.length / 2 + 2],
  ];
  const priest = x.cast.walk(round, { role: "priest", carry: "book", speed: 0.45 });
  const deacon = x.cast.walk(round, { role: "priest", carry: "candle", speed: 0.45 });
  deacon.phase = priest.phase - 1.3 / 7;
  return finish(b);
}

/*
 * The scene-building pieces, for the scenes kept beside their models in
 * `src/lib/models/` (the Sagalassos, Zeugma, Sümela and Patara ones). Used
 * only inside functions there, so the import cycle is harmless.
 */
export {
  make as lifeMake,
  finish as lifeFinish,
  fire as lifeFire,
  animal as lifeAnimal,
  flock as lifeFlock,
  dog as lifeDog,
  box as lifeBox,
  cyl as lifeCyl,
  amphora as lifeAmphora,
  jar as lifeJar,
  bench as lifeBench,
  stall as lifeStall,
  torchStand as lifeTorchStand,
  brazier as lifeBrazier,
  lampstand as lifeLampstand,
  aside as lifeAside,
  loft as lifeLoft,
  decor as lifeDecor,
  table as lifeTable,
  stoneBench as lifeStoneBench,
  smallAmphora as lifeSmallAmphora,
};
export type { Builder as LifeBuilder, Role as LifeRole };
