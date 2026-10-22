/**
 * What each 3D model sounds like: which recordings play under it, what
 * happens now and then, and how both change from noon to night.
 *
 * Pure data, so it can be tested without a browser; src/lib/ambience.ts is
 * the player. Recordings are in public/ambience (see CREDITS.txt there and
 * scripts/build_ambience.py for where each came from: public-domain (CC0)
 * recordings, and sounds synthesised for this app); the spoken Greek is in
 * public/ambience/voices, recorded on the owner's computer with a Piper voice
 * by scripts/generate_ambience_voices.py, and every scene works without it.
 */
import { SYNTH_CALLS } from "./ambience-synth";
import type { Reconstruction } from "./reconstructions";

export type TimeOfDay = "day" | "golden" | "night";

/** A recording in public/ambience. */
export const CLIPS = {
  // Beds: long, looped with crossfades at random offsets.
  birds: 25,
  market: 60,
  murmur: 25,
  fountain: 21,
  sea: 16,
  fire: 13,
  crickets: 17,
  hooves: 9,
  aulos: 40,
  lyre: 30,
  // One-shots.
  applause1: 5,
  applause2: 5,
  applause3: 5,
  cheer: 5,
  laugh1: 5,
  laugh2: 5,
  laugh3: 5,
  neigh1: 1.5,
  neigh2: 1.4,
  neigh3: 1.2,
  moo1: 4.1,
  moo2: 2.1,
  moo3: 5,
  sheep: 5,
  dog1: 5,
  dog2: 5,
  rooster: 5,
  crow: 5,
  saw: 5,
  footsteps: 5,
  anvil: 1.9,
  stone: 3.4,
  drum: 1.4,
} as const satisfies Record<string, number>;

export type Clip = keyof typeof CLIPS;

export const clipUrl = (clip: Clip) => `/ambience/${clip}.mp3`;

/** The spoken clips the owner's voice script records (see its CLIPS). */
export const VOICES = [
  "actor-oedipus-1",
  "actor-oedipus-2",
  "actor-oedipus-3",
  "actor-frogs-1",
  "actor-frogs-2",
  "actor-antigone",
  "crowd-euge",
  "crowd-nika",
  "crowd-axios",
  "crowd-kalos",
  "crowd-iou",
  "herald-akouete",
  "herald-pindar",
  "hymn-artemis",
  "hymn-apollo",
  "hymn-zeus",
  "hymn-cleanthes",
  "vendor-oil",
  "vendor-bread",
  "vendor-fish",
  "vendor-figs",
  "vendor-wine",
  "house-come",
  "house-water",
  "nemrut-antiochos-1",
  "nemrut-antiochos-2",
  "lament-andromache",
] as const;

export type Voice = (typeof VOICES)[number];

/**
 * Sounds made in the browser (src/lib/ambience-synth.ts), where no recording
 * with a licence that allows it was to be had, or where a recording would
 * repeat: birds, insects and frogs, goat bells and a donkey, hammers and
 * querns, footsteps on stone, gravel and planks, voices without words, water
 * lapping, wind gusts, bells, a wooden semantron, chant, and music made new
 * each time on the aulos, the lyre and the drum.
 */
export const CALLS = SYNTH_CALLS;

export type Call = (typeof CALLS)[number];

export const VOICE_MANIFEST = "/ambience/voices/manifest.json";
export const voiceUrl = (file: string) => `/ambience/voices/${file}`;

/**
 * Where in the model a sound comes from. Each is found in the model itself
 * (src/lib/sound-spots.ts): the middle of the stage, the altar's fire, the
 * market stalls and the fountain the scene sets down, the race track.
 */
export const SPOTS = ["stage", "altar", "stalls", "fountain", "track"] as const;

export type Spot = (typeof SPOTS)[number];

export type Point = [number, number, number];

/**
 * A spot as found in a model: a point or a few (the nearest is the one
 * heard), or a line (a track, heard from its nearest stretch), and the
 * distance at which a sound there plays at the level the soundscape gives it.
 */
export type Place = { points: Point[]; line?: boolean; ref: number };

export type Places = Partial<Record<Spot, Place>>;

/** A level for each time of day; a bare number is the same all day. */
export type Levels = number | Partial<Record<TimeOfDay, number>>;

export const levelAt = (levels: Levels, time: TimeOfDay): number =>
  typeof levels === "number" ? levels : (levels[time] ?? 0);

/** A recording that plays all the time. */
export type Bed = {
  clip: Clip;
  level: Levels;
  /** Muffled, as through a wall or from far away: a low-pass in Hz. */
  muffle?: number;
  /** Where it sits left to right, -1..1. Each pass of the loop wanders round it. */
  pan?: number;
  /** How much of it reaches the reverb, 0..1. */
  wet?: number;
  /** Where it comes from, if from one place: louder there, panned towards it. */
  at?: Spot;
};

/** Something that happens now and then: a dog, a hammer, a cow. */
export type Happening = {
  /** One of these, at random; a voice plays only if it has been recorded. */
  sounds: readonly (Clip | Voice | Call)[];
  /** Seconds between, at random within the range. */
  every: readonly [number, number];
  level: Levels;
  /** Spread left to right: picks a pan in -spread..spread. */
  spread?: number;
  /** Playback-rate range: a little pitch variation hides repetition. */
  rate?: readonly [number, number];
  muffle?: number;
  wet?: number;
  /** Play only part of a long clip, in seconds. */
  max?: number;
  /** Where it comes from, if from one place. */
  at?: Spot;
  /** The chance that another answers it a moment later (a dog barking back). */
  answer?: number;
};

/**
 * The longer stories some places tell: a play with its applause, a race with
 * its roar, a procession with its pipes, a rite with its drum.
 */
export type Director = "theatre" | "races" | "procession" | "rite";

/** Synthesised layers, for what no recording here covers. */
export type Synth = {
  /** Wind, 0..1: a sheltered court to a bare summit. */
  wind: number;
  /** Cicadas in the trees at noon. */
  cicadas: boolean;
  /** Sparks over the fire bed, when there is one. */
  crackle: boolean;
};

/** Reverb: an open bowl of stone, a colonnaded court, a room, open land. */
export type Space = { seconds: number; wet: number; early: number };

export type Soundscape = {
  /** The kind of place, for tests and for anyone reading this. */
  character:
    | "theatre"
    | "stadium"
    | "sanctuary"
    | "agora"
    | "house"
    | "harbour"
    | "mountain"
    | "neolithic"
    | "citadel"
    | "church";
  beds: Bed[];
  happenings: Happening[];
  director?: Director;
  /** For a procession or a rite: the hymns, the readings. */
  voices?: readonly Voice[];
  synth: Synth;
  space: Space;
  /** How busy the place is: above 1 things happen more often, below 1 less. */
  density?: number;
};

/* ------------------------------------------------------------------ */

const NIGHT_INSECTS: Bed = { clip: "crickets", level: { golden: 0.25, night: 0.8 }, wet: 0.15 };
const BIRDS = (day = 0.55): Bed => ({
  clip: "birds",
  level: { day, golden: day * 0.8, night: 0 },
  wet: 0.2,
});

const DOGS: Happening = {
  sounds: ["dog1", "dog2"],
  every: [55, 140],
  level: { day: 0.35, golden: 0.35, night: 0.3 },
  spread: 0.9,
  rate: [0.92, 1.06],
  muffle: 2600,
  wet: 0.5,
  max: 3.2,
};

/** A scops owl in the dark, the Mediterranean night's one-note clock. */
const OWL: Happening = {
  sounds: ["owl"],
  every: [25, 60],
  level: { night: 0.28 },
  spread: 1,
  muffle: 5000,
  wet: 0.45,
};

const DOVES: Happening = {
  sounds: ["dove"],
  every: [30, 75],
  level: { day: 0.2, golden: 0.22 },
  spread: 0.9,
  muffle: 3500,
  wet: 0.35,
};

const OPEN_BOWL: Space = { seconds: 1.7, wet: 0.2, early: 0.5 };

function theatre(): Soundscape {
  return {
    character: "theatre",
    beds: [
      // The audience: thousands talking, which the director hushes for the play.
      { clip: "murmur", level: { day: 0.75, golden: 0.75, night: 0.12 }, wet: 0.25, muffle: 5200 },
      BIRDS(0.3),
      NIGHT_INSECTS,
    ],
    happenings: [
      // Somebody laughing at something said in the row behind.
      {
        sounds: ["laugh1", "laugh2", "laugh3"],
        every: [25, 70],
        level: { day: 0.18, golden: 0.18 },
        spread: 0.8,
        rate: [0.92, 1.1],
        muffle: 4000,
        wet: 0.5,
        max: 2.6,
      },
      DOGS,
      OWL,
    ],
    director: "theatre",
    synth: { wind: 0.15, cicadas: true, crackle: false },
    space: OPEN_BOWL,
  };
}

function stadium(): Soundscape {
  return {
    character: "stadium",
    beds: [
      { clip: "murmur", level: { day: 0.85, golden: 0.8, night: 0.08 }, wet: 0.4, muffle: 5500 },
      BIRDS(0.25),
      NIGHT_INSECTS,
    ],
    happenings: [
      // The teams waiting in the stalls.
      {
        at: "track",
        sounds: ["neigh1", "neigh2", "neigh3"],
        every: [14, 40],
        level: { day: 0.32, golden: 0.32, night: 0.18 },
        spread: 0.9,
        rate: [0.92, 1.06],
        muffle: 4500,
        wet: 0.4,
      },
      // A shout from the stands.
      {
        sounds: ["crowd-euge", "crowd-nika", "crowd-axios", "crowd-iou"],
        every: [18, 45],
        level: { day: 0.22, golden: 0.22 },
        spread: 0.9,
        rate: [0.94, 1.08],
        muffle: 3800,
        wet: 0.5,
      },
      DOGS,
      OWL,
    ],
    director: "races",
    synth: { wind: 0.35, cicadas: true, crackle: false },
    space: { seconds: 1.4, wet: 0.25, early: 0.35 },
  };
}

function sanctuary(hymns: readonly Voice[], opts: { exposed: boolean; masons: boolean }) {
  const happenings: Happening[] = [
    // The victims waiting by the altar.
    {
      at: "altar",
      sounds: ["moo1", "moo2", "moo3"],
      every: [30, 75],
      level: { day: 0.3, golden: 0.3, night: 0.12 },
      spread: 0.7,
      rate: [0.94, 1.04],
      muffle: 5000,
      wet: 0.35,
      max: 3,
    },
    {
      at: "altar",
      sounds: ["sheep"],
      every: [45, 110],
      level: { day: 0.22, golden: 0.22 },
      spread: 0.8,
      rate: [0.95, 1.12],
      muffle: 5000,
      wet: 0.3,
      max: 2.5,
    },
    DOGS,
    OWL,
    DOVES,
  ];
  if (opts.masons) {
    // Didyma was still being built when work stopped for good: the masons
    // were part of the place for six hundred years.
    happenings.push({
      sounds: ["stone"],
      every: [6, 16],
      level: { day: 0.3, golden: 0.18 },
      spread: 0.8,
      rate: [0.85, 1.1],
      muffle: 6000,
      wet: 0.45,
    });
  }
  return {
    character: "sanctuary",
    beds: [
      BIRDS(opts.exposed ? 0.35 : 0.6),
      { clip: "fire", level: { day: 0.12, golden: 0.2, night: 0.35 }, wet: 0.2, at: "altar" },
      NIGHT_INSECTS,
    ],
    happenings,
    director: "procession",
    voices: hymns,
    synth: { wind: opts.exposed ? 0.6 : 0.35, cicadas: !opts.exposed, crackle: true },
    space: { seconds: 1.2, wet: 0.22, early: 0.35 },
  } satisfies Soundscape;
}

function agora(): Soundscape {
  return {
    character: "agora",
    beds: [
      { clip: "market", level: { day: 0.75, golden: 0.55, night: 0 }, wet: 0.3, at: "stalls" },
      {
        clip: "fountain",
        level: { day: 0.3, golden: 0.32, night: 0.4 },
        pan: 0.45,
        wet: 0.25,
        at: "fountain",
      },
      BIRDS(0.3),
      NIGHT_INSECTS,
    ],
    happenings: [
      {
        at: "stalls",
        sounds: ["vendor-oil", "vendor-bread", "vendor-fish", "vendor-figs", "vendor-wine"],
        every: [12, 30],
        level: { day: 0.35, golden: 0.28 },
        spread: 0.9,
        rate: [0.96, 1.04],
        muffle: 6000,
        wet: 0.35,
      },
      {
        sounds: ["footsteps"],
        every: [9, 26],
        level: { day: 0.3, golden: 0.3, night: 0.22 },
        spread: 0.8,
        rate: [0.9, 1.1],
        wet: 0.3,
      },
      // A carpenter's saw, a smith's hammer behind the shops.
      {
        sounds: ["saw", "anvil"],
        every: [20, 50],
        level: { day: 0.2, golden: 0.12 },
        spread: 0.9,
        rate: [0.9, 1.05],
        muffle: 3500,
        wet: 0.45,
        max: 3.5,
      },
      {
        sounds: ["moo1", "neigh2"],
        every: [60, 150],
        level: { day: 0.18, golden: 0.15 },
        spread: 0.9,
        rate: [0.95, 1.05],
        muffle: 3000,
        wet: 0.45,
      },
      DOGS,
      DOVES,
      OWL,
    ],
    synth: { wind: 0.2, cicadas: true, crackle: false },
    space: { seconds: 1.1, wet: 0.2, early: 0.45 },
  };
}

function house(): Soundscape {
  return {
    character: "house",
    beds: [
      // The peristyle's fountain, a few steps away.
      {
        clip: "fountain",
        level: { day: 0.5, golden: 0.5, night: 0.55 },
        pan: -0.2,
        wet: 0.3,
        at: "fountain",
      },
      // The street outside the walls.
      { clip: "market", level: { day: 0.22, golden: 0.16, night: 0 }, muffle: 900, wet: 0.1 },
      BIRDS(0.45),
      { clip: "fire", level: { night: 0.12 }, muffle: 3500, wet: 0.15 },
      NIGHT_INSECTS,
    ],
    happenings: [
      {
        sounds: ["house-come", "house-water"],
        every: [35, 80],
        level: { day: 0.25, golden: 0.25, night: 0.12 },
        spread: 0.6,
        muffle: 4500,
        wet: 0.45,
      },
      {
        sounds: ["footsteps"],
        every: [14, 35],
        level: { day: 0.22, golden: 0.22, night: 0.12 },
        spread: 0.7,
        rate: [0.85, 1.0],
        muffle: 5000,
        wet: 0.4,
      },
      {
        sounds: ["rooster"],
        every: [90, 200],
        level: { golden: 0.16, day: 0.08 },
        spread: 0.9,
        muffle: 2500,
        wet: 0.3,
        max: 3.5,
      },
      // Someone in the house practising the lyre.
      {
        sounds: ["lyre"],
        every: [70, 160],
        level: { golden: 0.16, night: 0.1 },
        spread: 0.5,
        muffle: 3200,
        wet: 0.55,
        max: 14,
      },
      { ...DOGS, level: { day: 0.2, golden: 0.2, night: 0.25 }, muffle: 1800 },
      { ...DOVES, level: { day: 0.26, golden: 0.26 }, muffle: 4500 },
      OWL,
    ],
    synth: { wind: 0.12, cicadas: true, crackle: false },
    space: { seconds: 0.7, wet: 0.3, early: 0.7 },
  };
}

function harbour(): Soundscape {
  return {
    character: "harbour",
    beds: [
      { clip: "sea", level: { day: 0.45, golden: 0.5, night: 0.5 }, pan: 0.5, wet: 0.2 },
      { clip: "market", level: { day: 0.45, golden: 0.35, night: 0 }, muffle: 2200, wet: 0.2 },
      BIRDS(0.4),
      NIGHT_INSECTS,
    ],
    happenings: [
      // The shipwrights on the slipways.
      {
        sounds: ["saw", "anvil"],
        every: [18, 45],
        level: { day: 0.18, golden: 0.1 },
        spread: 0.9,
        muffle: 2500,
        wet: 0.5,
        max: 3.5,
      },
      {
        sounds: ["vendor-fish", "vendor-wine", "vendor-oil"],
        every: [25, 60],
        level: { day: 0.22, golden: 0.18 },
        spread: 0.9,
        muffle: 3500,
        wet: 0.4,
      },
      {
        sounds: ["footsteps"],
        every: [15, 40],
        level: { day: 0.22, golden: 0.22, night: 0.15 },
        spread: 0.8,
        rate: [0.9, 1.1],
        wet: 0.3,
      },
      // Gulls over the harbour below the tomb.
      {
        sounds: ["gull"],
        every: [12, 35],
        level: { day: 0.26, golden: 0.26, night: 0.05 },
        spread: 1,
        muffle: 6000,
        wet: 0.4,
      },
      // Artemisia's mourning for Mausolus: a woman's lament, and the funeral
      // pipe, from the precinct of the tomb.
      {
        sounds: ["lament-andromache"],
        every: [70, 150],
        level: { day: 0.26, golden: 0.3, night: 0.18 },
        spread: 0.5,
        muffle: 4500,
        wet: 0.5,
      },
      {
        sounds: ["aulos"],
        every: [80, 170],
        level: { day: 0.16, golden: 0.2, night: 0.12 },
        spread: 0.5,
        rate: [0.88, 0.92],
        muffle: 2600,
        wet: 0.55,
        max: 14,
      },
      DOGS,
      OWL,
    ],
    synth: { wind: 0.4, cicadas: true, crackle: false },
    space: { seconds: 1.0, wet: 0.18, early: 0.3 },
  };
}

function mountain(): Soundscape {
  return {
    character: "mountain",
    beds: [
      { clip: "fire", level: { day: 0.2, golden: 0.3, night: 0.45 }, wet: 0.1, at: "altar" },
      BIRDS(0.15),
      { ...NIGHT_INSECTS, level: { golden: 0.1, night: 0.35 } },
    ],
    happenings: [
      // Ravens over the summit.
      {
        sounds: ["crow"],
        every: [25, 70],
        level: { day: 0.3, golden: 0.3 },
        spread: 1,
        rate: [0.8, 0.95],
        muffle: 5000,
        wet: 0.5,
        max: 3,
      },
      // Goats on the slopes: a sheep's bleat, a little higher.
      {
        sounds: ["sheep"],
        every: [40, 100],
        level: { day: 0.2, golden: 0.2 },
        spread: 0.9,
        rate: [1.1, 1.25],
        muffle: 3500,
        wet: 0.4,
        max: 2.5,
      },
      { ...OWL, level: { night: 0.22 }, muffle: 3500 },
    ],
    director: "rite",
    voices: ["nemrut-antiochos-1", "nemrut-antiochos-2"],
    synth: { wind: 0.9, cicadas: false, crackle: true },
    space: { seconds: 1.6, wet: 0.12, early: 0.05 },
  };
}

function neolithic(): Soundscape {
  return {
    character: "neolithic",
    beds: [
      { clip: "fire", level: { day: 0.25, golden: 0.35, night: 0.5 }, wet: 0.15, at: "altar" },
      // People at the enclosure: talk, but too far off to be in any language.
      { clip: "murmur", level: { day: 0.12, golden: 0.12 }, muffle: 700, wet: 0.2 },
      BIRDS(0.25),
      { ...NIGHT_INSECTS, level: { golden: 0.2, night: 0.6 } },
    ],
    happenings: [
      // Flint knapped and limestone dressed: the pillars were cut here.
      {
        sounds: ["stone"],
        every: [4, 12],
        level: { day: 0.42, golden: 0.3 },
        spread: 0.8,
        rate: [0.8, 1.15],
        wet: 0.25,
      },
      {
        sounds: ["crow"],
        every: [40, 100],
        level: { day: 0.2, golden: 0.2 },
        spread: 1,
        rate: [0.85, 1],
        muffle: 4000,
        wet: 0.4,
        max: 3,
      },
      { ...DOGS, level: { day: 0.18, golden: 0.2, night: 0.22 } },
      // Larks high over the steppe.
      {
        sounds: ["lark"],
        every: [25, 60],
        level: { day: 0.2, golden: 0.12 },
        spread: 0.8,
        muffle: 7000,
        wet: 0.2,
      },
      OWL,
    ],
    // A frame drum and a rattle by the fire: no words, and no Greek — this was
    // seven thousand years before anyone spoke it.
    director: "rite",
    voices: [],
    synth: { wind: 0.75, cicadas: false, crackle: true },
    space: { seconds: 0.6, wet: 0.08, early: 0.05 },
  };
}

/*
 * The Bronze Age gates, the Neolithic town and the medieval cathedral. Only
 * the recordings and calls this file already has: no words in any language,
 * since none of these places spoke one that is recorded here.
 */

/** A Bronze Age citadel gate: wind on the walls, the road, the herds below. */
function citadel(horses: boolean): Soundscape {
  return {
    character: "citadel",
    beds: [
      { clip: "fire", level: { day: 0.12, golden: 0.2, night: 0.35 }, wet: 0.1, at: "altar" },
      // People at the gate and in the forecourt, too far off to make out.
      { clip: "murmur", level: { day: 0.16, golden: 0.14, night: 0.03 }, muffle: 900, wet: 0.2 },
      BIRDS(0.35),
      { ...NIGHT_INSECTS, level: { golden: 0.2, night: 0.6 } },
    ],
    happenings: [
      {
        sounds: ["footsteps"],
        every: [12, 30],
        level: { day: 0.25, golden: 0.2 },
        spread: 0.7,
        rate: [0.9, 1.1],
        wet: 0.3,
        max: 3,
      },
      {
        sounds: horses ? ["neigh1", "neigh2", "neigh3"] : ["moo1", "moo2", "moo3"],
        every: [35, 90],
        level: { day: 0.22, golden: 0.2 },
        spread: 1,
        rate: [0.92, 1.05],
        muffle: 3000,
        wet: 0.4,
      },
      {
        sounds: ["sheep"],
        every: [30, 80],
        level: { day: 0.2, golden: 0.22 },
        spread: 0.9,
        rate: [0.95, 1.1],
        muffle: 3000,
        wet: 0.4,
        max: 3,
      },
      {
        sounds: ["crow"],
        every: [40, 100],
        level: { day: 0.18, golden: 0.2 },
        spread: 1,
        rate: [0.85, 1],
        muffle: 4500,
        wet: 0.45,
        max: 3,
      },
      { ...DOGS, level: { day: 0.2, golden: 0.25, night: 0.3 } },
      {
        sounds: ["lark"],
        every: [30, 70],
        level: { day: 0.16, golden: 0.1 },
        spread: 0.8,
        muffle: 7000,
        wet: 0.2,
      },
      OWL,
    ],
    synth: { wind: horses ? 0.6 : 0.7, cicadas: horses, crackle: true },
    space: { seconds: 1.1, wet: 0.14, early: 0.25 },
  };
}

/** Çatalhöyük: voices without words over the roofs, stone tools, the flocks. */
function village(): Soundscape {
  const base = neolithic();
  return {
    ...base,
    beds: [
      { clip: "fire", level: { day: 0.2, golden: 0.3, night: 0.45 }, wet: 0.12, at: "altar" },
      { clip: "murmur", level: { day: 0.2, golden: 0.18, night: 0.04 }, muffle: 800, wet: 0.18 },
      BIRDS(0.3),
      { ...NIGHT_INSECTS, level: { golden: 0.2, night: 0.6 } },
    ],
    happenings: [
      ...base.happenings,
      {
        sounds: ["sheep"],
        every: [25, 70],
        level: { day: 0.22, golden: 0.24 },
        spread: 0.8,
        rate: [1.0, 1.2],
        muffle: 3500,
        wet: 0.3,
        max: 3,
      },
    ],
  };
}

/** Ani: the square before the cathedral, the wind over the plateau. */
function church(): Soundscape {
  return {
    character: "church",
    beds: [
      { clip: "murmur", level: { day: 0.3, golden: 0.28, night: 0.05 }, muffle: 2400, wet: 0.3 },
      { clip: "hooves", level: { day: 0.08, golden: 0.06 }, muffle: 2000, wet: 0.2 },
      BIRDS(0.35),
      { ...NIGHT_INSECTS, level: { golden: 0.2, night: 0.55 } },
    ],
    happenings: [
      {
        sounds: ["footsteps"],
        every: [8, 22],
        level: { day: 0.28, golden: 0.24 },
        spread: 0.7,
        rate: [0.9, 1.1],
        wet: 0.45,
        max: 3,
      },
      {
        sounds: ["moo1", "moo2"],
        every: [60, 140],
        level: { day: 0.16, golden: 0.14 },
        spread: 1,
        muffle: 2500,
        wet: 0.4,
      },
      DOVES,
      { ...DOGS, level: { day: 0.2, golden: 0.25, night: 0.3 } },
      {
        sounds: ["crow"],
        every: [45, 110],
        level: { day: 0.16, golden: 0.18 },
        spread: 1,
        rate: [0.85, 1],
        muffle: 4500,
        wet: 0.5,
        max: 3,
      },
      OWL,
    ],
    synth: { wind: 0.75, cicadas: false, crackle: false },
    space: { seconds: 1.4, wet: 0.2, early: 0.4 },
  };
}

/** Which hymn belongs to which god's house. */
const HYMNS: Record<string, readonly Voice[]> = {
  "artemis-tapinagi": ["hymn-artemis"],
  "didyma-apollon-tapinagi": ["hymn-apollo"],
  "aizanoi-zeus-tapinagi": ["hymn-zeus", "hymn-cleanthes"],
  "pergamon-zeus-sunagi": ["hymn-cleanthes", "hymn-zeus"],
};

/**
 * A monumental fountain on a mountain agora: the water louder than the market,
 * and the wind of 1,500 metres over it (the Antonine Nymphaeum, Sagalassos).
 */
function fountainHouse(): Soundscape {
  const base = agora();
  return {
    ...base,
    // The stalls are off at the square's edge, heard but not placed.
    beds: base.beds.map((bed) => {
      if (bed.clip === "fountain") return { ...bed, level: { day: 0.6, golden: 0.62, night: 0.7 } };
      const { at: _at, ...rest } = bed;
      return bed.at === "stalls" ? { ...rest, muffle: 3000 } : bed;
    }),
    happenings: base.happenings.map((h) => {
      const { at: _at, ...rest } = h;
      return h.at === "stalls" ? rest : h;
    }),
    synth: { wind: 0.45, cicadas: true, crackle: false },
  };
}

/** A harbour with its light: sea, gulls, the quay at work, the keeper's fire at night. */
function lighthouse(): Soundscape {
  return {
    character: "harbour",
    beds: [
      { clip: "sea", level: { day: 0.55, golden: 0.6, night: 0.6 }, pan: -0.4, wet: 0.2 },
      { clip: "market", level: { day: 0.3, golden: 0.22, night: 0 }, muffle: 2400, wet: 0.2 },
      { clip: "fire", level: { day: 0.05, golden: 0.12, night: 0.2 }, muffle: 3000, wet: 0.3 },
      BIRDS(0.3),
      NIGHT_INSECTS,
    ],
    happenings: [
      {
        sounds: ["gull"],
        every: [8, 25],
        level: { day: 0.3, golden: 0.3, night: 0.05 },
        spread: 1,
        muffle: 6000,
        wet: 0.4,
      },
      {
        sounds: ["vendor-fish", "vendor-wine", "vendor-oil"],
        every: [30, 70],
        level: { day: 0.2, golden: 0.16 },
        spread: 0.9,
        muffle: 3500,
        wet: 0.4,
      },
      {
        sounds: ["saw", "anvil"],
        every: [25, 60],
        level: { day: 0.15, golden: 0.08 },
        spread: 0.9,
        muffle: 2500,
        wet: 0.5,
        max: 3.5,
      },
      {
        sounds: ["footsteps"],
        every: [15, 40],
        level: { day: 0.22, golden: 0.22, night: 0.12 },
        spread: 0.8,
        rate: [0.9, 1.1],
        wet: 0.3,
      },
      DOGS,
      OWL,
    ],
    synth: { wind: 0.5, cicadas: true, crackle: false },
    space: { seconds: 0.9, wet: 0.15, early: 0.25 },
  };
}

/**
 * A monastery in a forest gorge (Sümela): birds in the trees, the spring in
 * the cave, ravens off the cliff, goats on the slope, the wind in the valley,
 * and at night the owl and the brazier. No chant: no recording of one with a
 * licence that allows it is in the app.
 */
function monastery(): Soundscape {
  return {
    character: "mountain",
    beds: [
      BIRDS(0.6),
      {
        clip: "fountain",
        level: { day: 0.18, golden: 0.2, night: 0.26 },
        muffle: 3500,
        wet: 0.5,
        at: "fountain",
      },
      { clip: "fire", level: { day: 0.06, golden: 0.15, night: 0.3 }, wet: 0.2 },
      { ...NIGHT_INSECTS, level: { golden: 0.12, night: 0.4 } },
    ],
    happenings: [
      {
        sounds: ["crow"],
        every: [30, 80],
        level: { day: 0.26, golden: 0.26 },
        spread: 1,
        rate: [0.8, 0.95],
        muffle: 5000,
        wet: 0.6,
        max: 3,
      },
      {
        sounds: ["sheep"],
        every: [45, 110],
        level: { day: 0.18, golden: 0.18 },
        spread: 0.9,
        rate: [1.1, 1.25],
        muffle: 3000,
        wet: 0.5,
        max: 2.5,
      },
      {
        sounds: ["footsteps"],
        every: [18, 45],
        level: { day: 0.2, golden: 0.2, night: 0.08 },
        spread: 0.6,
        rate: [0.85, 1.0],
        wet: 0.5,
      },
      DOVES,
      { ...OWL, level: { night: 0.3 }, wet: 0.6 },
    ],
    synth: { wind: 0.6, cicadas: false, crackle: true },
    space: { seconds: 2.2, wet: 0.28, early: 0.6 },
  };
}

export function soundscapeFor(item: Pick<Reconstruction, "id"> & { model: { kind: string } }) {
  return flavour(item.id, kindScape(item));
}

/* ---- What makes one place not sound like another --------------------- */

type Extra = Partial<Happening> & Pick<Happening, "sounds" | "every" | "level">;
const ev = (h: Extra): Happening => ({ spread: 0.9, wet: 0.35, ...h });

const DAYTIME = { day: 1, golden: 0.7 };
const lvl = (k: number, shape: Partial<Record<TimeOfDay, number>> = DAYTIME): Levels =>
  Object.fromEntries(Object.entries(shape).map(([t, v]) => [t, +(v * k).toFixed(3)]));

/** Songbirds in the trees and the bushes, each kind its own call. */
const SONGBIRDS = (k = 1, kinds: Call[] = ["blackbird", "sparrow", "finch"]) =>
  ev({ sounds: kinds, every: [9, 30], level: lvl(0.5 * k, { day: 1, golden: 0.8 }), muffle: 9000 });
/** Swifts screaming over the roofs of a town. */
const SWIFTS = (k = 1) =>
  ev({
    sounds: ["swift"],
    every: [25, 70],
    level: lvl(0.5 * k, { day: 1, golden: 1.2 }),
    spread: 1,
  });
/** Crickets chirping in rhythms of their own, the night's other clock. */
const CRICKETS = (k = 1) =>
  ev({
    sounds: ["cricket"],
    every: [6, 18],
    level: lvl(0.5 * k, { golden: 0.4, night: 1 }),
    spread: 1,
  });
const FROGS = (k = 1) =>
  ev({
    sounds: ["frog"],
    every: [8, 25],
    level: lvl(0.5 * k, { golden: 0.7, night: 1, day: 0.25 }),
    muffle: 5000,
    wet: 0.3,
  });
const GUSTS = (k = 1) =>
  ev({
    sounds: ["gust"],
    every: [10, 30],
    level: lvl(0.6 * k, { day: 1, golden: 1, night: 0.8 }),
    spread: 0.8,
    wet: 0.1,
  });
const STEPS = (surface: Call[], k = 1) =>
  ev({
    sounds: surface,
    every: [12, 35],
    level: lvl(0.5 * k, { day: 1, golden: 0.9, night: 0.3 }),
    spread: 0.7,
    wet: 0.3,
  });
/** People talking, laughing, calling out: no words in any language. */
const PEOPLE = (k = 1, sounds: Call[] = ["chatter", "laugh", "shout"]) =>
  ev({
    sounds,
    every: [10, 32],
    level: lvl(0.5 * k, { day: 1, golden: 0.9, night: 0.15 }),
    spread: 0.9,
    muffle: 4200,
    wet: 0.4,
  });
const GOATS = (k = 1) =>
  ev({ sounds: ["goatbells"], every: [25, 70], level: lvl(0.5 * k), muffle: 6000, wet: 0.35 });
const DONKEY = (k = 1) =>
  ev({
    sounds: ["donkey"],
    every: [80, 200],
    level: lvl(0.4 * k),
    muffle: 3000,
    wet: 0.45,
    answer: 0.15,
  });
const WORK = (sounds: Call[], k = 1) =>
  ev({
    sounds,
    every: [14, 40],
    level: lvl(0.5 * k, { day: 1, golden: 0.5 }),
    muffle: 6000,
    wet: 0.4,
  });
const HARBOUR = (k = 1) => [
  ev({
    sounds: ["rigging"],
    every: [8, 24],
    level: lvl(0.45 * k, { day: 1, golden: 1, night: 0.8 }),
    muffle: 5000,
    wet: 0.3,
  }),
  ev({
    sounds: ["lapping"],
    every: [5, 14],
    level: lvl(0.5 * k, { day: 1, golden: 1, night: 1 }),
    muffle: 4000,
    wet: 0.2,
  }),
];
const RAPTORS = (k = 1, kinds: Call[] = ["hoopoe", "partridge"]) =>
  ev({ sounds: kinds, every: [30, 80], level: lvl(0.4 * k), muffle: 7000, wet: 0.3 });

/**
 * Each model's own additions: the river under Zeugma, the masons at
 * Aphrodisias, the bell over Ani, the forest and the monks round Sümela —
 * and how busy each is. Every model ends up with a soundscape of its own.
 */
const FLAVOUR: Record<string, { add: Happening[]; beds?: Bed[]; density?: number }> = {
  "celsus-kutuphanesi": {
    add: [
      SONGBIRDS(0.8, ["sparrow", "blackbird"]),
      SWIFTS(),
      PEOPLE(1.1),
      STEPS(["steps-stone"]),
      DONKEY(),
      CRICKETS(),
    ],
    density: 1.2,
  },
  "aspendos-tiyatrosu": {
    // The Eurymedon on the plain below the theatre.
    add: [
      SWIFTS(0.8),
      PEOPLE(0.8, ["chatter", "laugh"]),
      FROGS(0.7),
      CRICKETS(),
      STEPS(["steps-stone"], 0.7),
    ],
    density: 1.1,
  },
  "didyma-apollon-tapinagi": {
    add: [
      WORK(["chisel", "hammer"], 0.9),
      RAPTORS(0.8, ["hoopoe"]),
      SONGBIRDS(0.7, ["finch", "sparrow"]),
      CRICKETS(0.8),
    ],
  },
  "gobeklitepe-d-yapisi": {
    add: [RAPTORS(1, ["partridge"]), GUSTS(1), WORK(["chisel"], 0.6), CRICKETS(0.6)],
    density: 0.7,
  },
  "artemis-tapinagi": {
    // The marshes of the Kaystros round the temple.
    add: [
      FROGS(1),
      ev({ sounds: ["beeeater"], every: [20, 60], level: lvl(0.45) }),
      SONGBIRDS(1, ["blackbird", "finch"]),
      CRICKETS(),
    ],
  },
  "pergamon-zeus-sunagi": {
    add: [
      GUSTS(0.7),
      SWIFTS(1.1),
      SONGBIRDS(0.6, ["blackbird"]),
      PEOPLE(0.6, ["chatter", "shout"]),
      CRICKETS(0.7),
    ],
  },
  "aphrodisias-stadyumu": {
    // The city of sculptors: marble being worked in the workshops beyond the stands.
    add: [
      WORK(["chisel", "hammer"], 1),
      SWIFTS(0.8),
      PEOPLE(0.9, ["shout", "laugh"]),
      CRICKETS(0.6),
    ],
    density: 1.2,
  },
  "hierapolis-tiyatrosu": {
    // The hot springs running down the travertine.
    add: [
      ev({
        sounds: ["brook"],
        every: [6, 16],
        level: lvl(0.5, { day: 1, golden: 1, night: 1 }),
        muffle: 5000,
      }),
      GUSTS(0.5),
      SONGBIRDS(0.6, ["finch", "sparrow"]),
      CRICKETS(),
    ],
  },
  "milet-buyuk-tiyatro": {
    // The Theatre Harbour below the stage building.
    add: [
      ...HARBOUR(0.7),
      ev({
        sounds: ["gull"],
        every: [15, 45],
        level: lvl(0.35, { day: 1, golden: 1, night: 0.15 }),
        muffle: 6000,
      }),
      PEOPLE(0.7, ["chatter", "shout"]),
      CRICKETS(0.7),
    ],
  },
  "efes-yamac-evler": {
    add: [
      SONGBIRDS(0.9, ["sparrow", "blackbird", "finch"]),
      STEPS(["steps-wood", "steps-stone"], 0.8),
      PEOPLE(0.6, ["chatter", "laugh"]),
      CRICKETS(0.8),
    ],
    density: 0.9,
  },
  "efes-buyuk-tiyatro": {
    add: [
      SWIFTS(1.1),
      DONKEY(0.8),
      PEOPLE(1, ["chatter", "shout", "laugh"]),
      STEPS(["steps-stone"], 0.6),
      CRICKETS(0.7),
    ],
    density: 1.3,
  },
  "side-tiyatrosu": {
    // The sea on three sides of the town.
    add: [
      ...HARBOUR(0.5),
      SONGBIRDS(0.6, ["sparrow"]),
      PEOPLE(0.7, ["chatter", "laugh"]),
      CRICKETS(),
    ],
    beds: [
      {
        clip: "sea",
        level: { day: 0.18, golden: 0.22, night: 0.26 },
        muffle: 1800,
        pan: -0.5,
        wet: 0.2,
      },
    ],
  },
  "perge-stadyumu": {
    add: [
      RAPTORS(0.8, ["hoopoe"]),
      SONGBIRDS(0.7, ["sparrow", "finch"]),
      PEOPLE(0.8, ["shout", "chatter"]),
      STEPS(["steps-gravel"], 0.7),
      CRICKETS(0.7),
    ],
  },
  "aizanoi-zeus-tapinagi": {
    add: [RAPTORS(1, ["partridge"]), GOATS(0.8), GUSTS(0.6), CRICKETS(0.8)],
    density: 0.8,
  },
  "halikarnas-mozolesi": {
    add: [...HARBOUR(0.8), PEOPLE(0.6, ["chatter"]), STEPS(["steps-stone"], 0.6), CRICKETS(0.7)],
  },
  "nemrut-dogu-terasi": {
    add: [
      GUSTS(1.3),
      RAPTORS(0.8, ["partridge"]),
      GOATS(0.5),
      ev({ sounds: ["lark"], every: [40, 100], level: lvl(0.25), muffle: 7000 }),
      CRICKETS(0.5),
    ],
    density: 0.6,
  },
  "hattusa-aslanli-kapi": {
    add: [
      GOATS(0.7),
      DONKEY(0.9),
      WORK(["hammer"], 0.7),
      GUSTS(0.8),
      RAPTORS(0.7, ["partridge", "hoopoe"]),
      CRICKETS(0.7),
    ],
  },
  "troya-vi-surlari": {
    // The wind off the Dardanelles, and the bee-eaters of the Scamander plain.
    add: [
      GUSTS(1.1),
      ev({ sounds: ["beeeater"], every: [18, 50], level: lvl(0.45) }),
      WORK(["hammer"], 0.6),
      STEPS(["steps-gravel"], 0.6),
      CRICKETS(),
    ],
  },
  "catalhoyuk-dogu-hoyugu": {
    // A village of mud-brick roofs: querns grinding grain, fires, dogs, talk
    // with no words, the marsh of the Çarşamba with its frogs.
    add: [
      WORK(["grind"], 1.1),
      PEOPLE(0.9, ["chatter", "laugh", "shout"]),
      { ...DOGS, every: [30, 80], answer: 0.4 },
      FROGS(0.7),
      STEPS(["steps-gravel"], 0.6),
      CRICKETS(),
    ],
    density: 1.2,
  },
  "ani-katedrali": {
    add: [
      ev({
        sounds: ["bell"],
        every: [90, 200],
        level: lvl(0.55, { day: 1, golden: 1.2, night: 0.4 }),
        muffle: 7000,
        wet: 0.5,
        spread: 0.3,
      }),
      ev({
        sounds: ["chant"],
        every: [70, 160],
        level: lvl(0.35, { golden: 1, night: 0.8, day: 0.5 }),
        muffle: 2600,
        wet: 0.6,
        spread: 0.2,
      }),
      GUSTS(1),
      PEOPLE(0.8, ["chatter", "shout"]),
      DONKEY(0.8),
      WORK(["hammer"], 0.5),
    ],
    beds: [
      { clip: "market", level: { day: 0.16, golden: 0.12, night: 0 }, muffle: 1600, wet: 0.2 },
    ],
  },
  "sagalassos-antoninler-cesmesi": {
    add: [
      ev({
        sounds: ["brook"],
        every: [5, 12],
        level: lvl(0.45, { day: 1, golden: 1, night: 1 }),
        at: "fountain",
        muffle: 7000,
      }),
      GUSTS(0.8),
      GOATS(0.6),
      WORK(["chisel"], 0.5),
      SWIFTS(0.7),
      CRICKETS(0.6),
    ],
  },
  "zeugma-villa": {
    // The Euphrates below the terrace.
    add: [
      FROGS(0.9),
      ev({ sounds: ["beeeater"], every: [20, 55], level: lvl(0.4) }),
      SONGBIRDS(0.8, ["blackbird", "sparrow"]),
      ev({
        sounds: ["lapping"],
        every: [8, 20],
        level: lvl(0.3, { day: 1, golden: 1, night: 1 }),
        muffle: 2500,
      }),
      CRICKETS(),
    ],
  },
  "sumela-manastiri": {
    // The forest of the gorge, the stream far below, the monks.
    add: [
      SONGBIRDS(1.2, ["blackbird", "finch"]),
      ev({
        sounds: ["cuckoo"],
        every: [40, 110],
        level: lvl(0.45, { day: 1, golden: 0.8 }),
        muffle: 6000,
        wet: 0.5,
      }),
      ev({
        sounds: ["woodpecker"],
        every: [30, 90],
        level: lvl(0.5, { day: 1, golden: 0.6 }),
        muffle: 7000,
        wet: 0.5,
      }),
      ev({
        sounds: ["brook"],
        every: [5, 12],
        level: lvl(0.35, { day: 1, golden: 1, night: 1 }),
        muffle: 3000,
        wet: 0.5,
      }),
      ev({
        sounds: ["chant"],
        every: [60, 150],
        level: lvl(0.45, { day: 0.6, golden: 1, night: 0.9 }),
        muffle: 2200,
        wet: 0.65,
        spread: 0.3,
      }),
      ev({
        sounds: ["semantron"],
        every: [150, 320],
        level: lvl(0.45, { day: 0.8, golden: 1, night: 0.5 }),
        muffle: 5000,
        wet: 0.6,
        spread: 0.3,
      }),
      ev({
        sounds: ["bell"],
        every: [160, 360],
        level: lvl(0.35, { day: 1, golden: 1, night: 0.4 }),
        muffle: 5000,
        wet: 0.65,
        spread: 0.3,
      }),
      GUSTS(0.6),
      GOATS(0.5),
      CRICKETS(0.6),
    ],
    beds: [
      {
        clip: "fountain",
        level: { day: 0.12, golden: 0.12, night: 0.14 },
        muffle: 1200,
        pan: 0.4,
        wet: 0.5,
      },
    ],
    density: 0.9,
  },
  "patara-deniz-feneri": {
    add: [
      ...HARBOUR(1.1),
      PEOPLE(0.8, ["chatter", "shout"]),
      STEPS(["steps-wood", "steps-stone"], 0.7),
      WORK(["hammer"], 0.6),
      CRICKETS(0.6),
    ],
    density: 1.1,
  },
};

/** The kind's soundscape with the model's own sources and pace added. */
function flavour(id: string, base: Soundscape): Soundscape {
  const extra = FLAVOUR[id];
  if (!extra) return base;
  return {
    ...base,
    beds: [...base.beds, ...(extra.beds ?? [])],
    happenings: [...base.happenings, ...extra.add],
    density: extra.density ?? base.density ?? 1,
  };
}

function kindScape(item: Pick<Reconstruction, "id"> & { model: { kind: string } }): Soundscape {
  const { id } = item;
  switch (item.model.kind) {
    case "roman-theatre":
      return theatre();
    case "stadium":
      return stadium();
    case "ionic-dipteros":
    case "great-altar":
      return sanctuary(HYMNS[id] ?? ["hymn-zeus"], {
        exposed: id === "aizanoi-zeus-tapinagi",
        masons: id === "didyma-apollon-tapinagi",
      });
    case "roman-facade":
      return agora();
    case "peristyle-house":
      return house();
    case "mausoleum":
      return harbour();
    case "tumulus-sanctuary":
      return mountain();
    case "neolithic-enclosure":
      return neolithic();
    case "hittite-gate":
      return citadel(false);
    case "troy-citadel":
      return citadel(true);
    case "neolithic-town":
      return village();
    case "medieval-cathedral":
      return church();
    case "nymphaeum":
      return fountainHouse();
    case "terrace-villa":
      return house();
    case "cliff-monastery":
      return monastery();
    case "lighthouse":
      return lighthouse();
    default:
      // A kind added later still gets birds, wind and the night.
      return {
        character: "agora",
        beds: [BIRDS(0.5), NIGHT_INSECTS],
        happenings: [DOGS],
        synth: { wind: 0.4, cicadas: true, crackle: false },
        space: { seconds: 1, wet: 0.15, early: 0.3 },
      } satisfies Soundscape;
  }
}

/** What each director plays, beyond the scene's own beds and happenings. */
export const DIRECTOR_CLIPS: Record<Director | "none", readonly Clip[]> = {
  theatre: [
    "aulos",
    "lyre",
    "applause1",
    "applause2",
    "applause3",
    "cheer",
    "laugh1",
    "laugh2",
    "laugh3",
  ],
  races: [
    "hooves",
    "footsteps",
    "cheer",
    "applause1",
    "applause2",
    "applause3",
    "neigh1",
    "neigh2",
    "neigh3",
  ],
  procession: ["aulos", "drum", "moo1", "moo2", "moo3"],
  rite: ["drum"],
  none: [],
};

/** What each director makes in the browser: music made new every time. */
export const DIRECTOR_CALLS: Record<Director | "none", readonly Call[]> = {
  theatre: ["aulos-phrase", "lyre-phrase"],
  races: [],
  procession: ["aulos-phrase", "drum-phrase"],
  rite: ["drum-phrase"],
  none: [],
};

/** The lines a director speaks, when they have been recorded. */
export const STAGE_LINES = [
  "actor-oedipus-1",
  "actor-oedipus-2",
  "actor-oedipus-3",
  "actor-frogs-1",
  "actor-frogs-2",
  "actor-antigone",
] as const satisfies readonly Voice[];

export const DIRECTOR_VOICES: Record<Director | "none", readonly Voice[]> = {
  theatre: [...STAGE_LINES, "crowd-euge", "crowd-axios", "crowd-kalos"],
  races: ["herald-akouete", "herald-pindar", "crowd-nika", "crowd-euge", "crowd-iou"],
  procession: [],
  rite: [],
  none: [],
};

/** Where each director's story is played: the stage, the track, the altar. */
export const DIRECTOR_SPOT: Record<Director, Spot> = {
  theatre: "stage",
  races: "track",
  procession: "altar",
  rite: "altar",
};

/** Every place a soundscape's sounds come from. */
export function spotsOf(scape: Soundscape): Spot[] {
  const out = new Set<Spot>();
  for (const bed of scape.beds) if (bed.at) out.add(bed.at);
  for (const h of scape.happenings) if (h.at) out.add(h.at);
  if (scape.director) out.add(DIRECTOR_SPOT[scape.director]);
  return [...out];
}

/* ---- Hearing a place from where the camera is ----------------------- */

/** The quietest a placed sound gets, however far off: the place still carries. */
export const FAR_GAIN = 0.15;
/** The loudest, right beside it. */
export const NEAR_GAIN = 1.8;

/** The point of a place nearest to `p`. */
export function nearestOn(place: Place, p: Point): Point {
  const { points } = place;
  if (points.length === 0) return p;
  let best: Point = points[0]!;
  let bestD = Infinity;
  const consider = (q: Point) => {
    const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = q;
    }
  };
  if (place.line && points.length > 1) {
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i]!;
      const b = points[i + 1]!;
      const ab: Point = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const len = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
      const t =
        len > 0
          ? Math.max(
              0,
              Math.min(
                1,
                ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / len,
              ),
            )
          : 0;
      consider([a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]);
    }
  } else for (const q of points) consider(q);
  return best;
}

/**
 * How a sound at `source` is heard by a listener at `at` looking along
 * `forward` (x, z): its gain, as the inverse of distance (the level the
 * soundscape gives it at `ref` metres, louder nearer, quieter further, never
 * lost entirely), and its pan, -1 left to 1 right, by the bearing of the
 * source from the way the listener faces — eased to the middle when it is
 * nearly overhead or underfoot, so it does not flip from ear to ear.
 */
export function hearing(
  at: Point,
  forward: readonly [number, number],
  source: Point,
  ref: number,
): { gain: number; pan: number } {
  const dx = source[0] - at[0];
  const dz = source[2] - at[2];
  const flat = Math.hypot(dx, dz);
  const distance = Math.hypot(flat, source[1] - at[1]);
  const gain = Math.max(FAR_GAIN, Math.min(NEAR_GAIN, ref / Math.max(distance, 1e-3)));
  const facing = Math.hypot(forward[0], forward[1]);
  if (flat < 1e-6 || facing < 1e-6) return { gain, pan: 0 };
  // The listener's right, for a camera looking along (fx, fz): (-fz, fx).
  const side = (dx * -forward[1] + dz * forward[0]) / (flat * facing);
  const pan = Math.max(-1, Math.min(1, side)) * 0.85 * Math.min(1, flat / 3);
  return { gain, pan };
}

/** Every recording a soundscape may ask for, for preloading and for tests. */
export function clipsOf(scape: Soundscape): Clip[] {
  const out = new Set<Clip>();
  for (const bed of scape.beds) out.add(bed.clip);
  for (const h of scape.happenings) for (const s of h.sounds) if (isClip(s)) out.add(s);
  for (const c of DIRECTOR_CLIPS[scape.director ?? "none"]) out.add(c);
  return [...out];
}

/** Every spoken clip a soundscape may use, if it has been recorded. */
export function voicesOf(scape: Soundscape): Voice[] {
  const out = new Set<Voice>(scape.voices ?? []);
  for (const h of scape.happenings) for (const s of h.sounds) if (isVoice(s)) out.add(s);
  for (const v of DIRECTOR_VOICES[scape.director ?? "none"]) out.add(v);
  return [...out];
}

export function isVoice(sound: string): sound is Voice {
  return (VOICES as readonly string[]).includes(sound);
}

export function isCall(sound: string): sound is Call {
  return (CALLS as readonly string[]).includes(sound);
}

export function isClip(sound: string): sound is Clip {
  return Object.prototype.hasOwnProperty.call(CLIPS, sound);
}

/** Every synthesised call a soundscape may make. */
export function callsOf(scape: Soundscape): Call[] {
  const out = new Set<Call>();
  for (const h of scape.happenings) for (const s of h.sounds) if (isCall(s)) out.add(s);
  for (const c of DIRECTOR_CALLS[scape.director ?? "none"]) out.add(c);
  return [...out];
}

/**
 * Every distinct thing a soundscape can make heard: each recording and each
 * synthesised call, the synthesised wind and cicadas.
 */
export function sourcesOf(scape: Soundscape): string[] {
  const out = new Set<string>([...clipsOf(scape), ...callsOf(scape)]);
  if (scape.synth.wind > 0) out.add("wind");
  if (scape.synth.cicadas) out.add("cicadas");
  if (scape.synth.crackle) out.add("sparks");
  return [...out].sort();
}
