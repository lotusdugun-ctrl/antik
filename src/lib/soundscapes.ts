/**
 * What each 3D model sounds like: which recordings play under it, what
 * happens now and then, and how both change from noon to night.
 *
 * Pure data, so it can be tested without a browser; src/lib/ambience.ts is
 * the player. Recordings are in public/ambience (see CREDITS.txt there and
 * scripts/build_ambience.py for where each came from); the spoken Greek is in
 * public/ambience/voices, recorded on the owner's computer by
 * scripts/generate_ambience_voices.py, and every scene works without it.
 */
import type { Reconstruction } from "./reconstructions";

export type TimeOfDay = "day" | "golden" | "night";

/** A recording in public/ambience. */
export const CLIPS = {
  // Beds: long, looped with crossfades at random offsets.
  birds: 26,
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
  moo1: 2.1,
  moo2: 2.7,
  moo3: 5,
  sheep: 5,
  dog1: 5,
  dog2: 5,
  rooster: 5,
  crow: 5,
  saw: 5,
  footsteps: 3,
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
 * Calls made in the browser, where no recording with a licence that allows it
 * was to be had: a scops owl's note, a collared dove, herring gulls, a lark.
 * All are close to pure tones, which is what synthesis does well.
 */
export const CALLS = ["owl", "dove", "gull", "lark"] as const;

export type Call = (typeof CALLS)[number];

export const VOICE_MANIFEST = "/ambience/voices/manifest.json";
export const voiceUrl = (file: string) => `/ambience/voices/${file}`;

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
    "theatre" | "stadium" | "sanctuary" | "agora" | "house" | "harbour" | "mountain" | "neolithic";
  beds: Bed[];
  happenings: Happening[];
  director?: Director;
  /** For a procession or a rite: the hymns, the readings. */
  voices?: readonly Voice[];
  synth: Synth;
  space: Space;
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
      { clip: "fire", level: { day: 0.12, golden: 0.2, night: 0.35 }, wet: 0.2 },
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
      { clip: "market", level: { day: 0.75, golden: 0.55, night: 0 }, wet: 0.3 },
      { clip: "fountain", level: { day: 0.3, golden: 0.32, night: 0.4 }, pan: 0.45, wet: 0.25 },
      BIRDS(0.3),
      NIGHT_INSECTS,
    ],
    happenings: [
      {
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
      { clip: "fountain", level: { day: 0.5, golden: 0.5, night: 0.55 }, pan: -0.2, wet: 0.3 },
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
      { clip: "fire", level: { day: 0.2, golden: 0.3, night: 0.45 }, wet: 0.1 },
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
      { clip: "fire", level: { day: 0.25, golden: 0.35, night: 0.5 }, wet: 0.15 },
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

/** Which hymn belongs to which god's house. */
const HYMNS: Record<string, readonly Voice[]> = {
  "artemis-tapinagi": ["hymn-artemis"],
  "didyma-apollon-tapinagi": ["hymn-apollo"],
  "aizanoi-zeus-tapinagi": ["hymn-zeus", "hymn-cleanthes"],
  "pergamon-zeus-sunagi": ["hymn-cleanthes", "hymn-zeus"],
};

export function soundscapeFor(item: Pick<Reconstruction, "id"> & { model: { kind: string } }) {
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
  return [...out];
}
