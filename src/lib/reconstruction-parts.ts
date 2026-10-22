import { distanceTo, waterOf } from "./landscape-plan";
import type { RockFace } from "./models/rockface";
import {
  ashlar,
  FACING,
  onFace,
  gableTiles,
  inscribedPanel,
  inscription,
  paintBand,
  paintedRun,
  tiledSlope,
  uncovered,
} from "@/lib/reconstruction-detail";
import {
  asCut,
  flowing,
  measure,
  runs,
  single,
  TEXTS,
  type EpigraphicText,
  type Lettering,
} from "@/lib/epigraphy";
import type { ScanId } from "@/lib/scans";
import { hittiteGateParts, hittiteGateWalkStart } from "@/lib/models/hattusa-aslanli-kapi";
import { troyCitadelParts, troyWalkStart } from "@/lib/models/troya-vi-surlari";
import { neolithicTownParts, neolithicTownWalkStart } from "@/lib/models/catalhoyuk-dogu-hoyugu";
import { cathedralParts, cathedralWalkStart } from "@/lib/models/ani-katedrali";
import { nymphaeumParts, nymphaeumWalkStart } from "@/lib/models/sagalassos-antoninler-cesmesi";
import { villaParts, villaWalkStart } from "@/lib/models/zeugma-villa";
import { cliffMonasteryParts, monasteryWalkStart } from "@/lib/models/sumela-manastiri";
import { lighthouseParts, lighthouseWalkStart } from "@/lib/models/patara-deniz-feneri";
import type {
  GreatAltarSpec,
  IonicDipterosSpec,
  MausoleumSpec,
  ModelSpec,
  NeolithicEnclosureSpec,
  PeristyleHouseSpec,
  RomanFacadeSpec,
  RomanTheatreSpec,
  TheatreCharacter,
  StadiumSpec,
  TumulusSanctuarySpec,
} from "@/lib/reconstructions";

/**
 * The geometry half of a reconstruction, kept deliberately free of three.js.
 *
 * A builder here turns a measured spec into a flat list of primitives — boxes,
 * tapered cylinders, annulus sectors, triangular prisms — in metres, with `y`
 * up and `at` naming the *bottom* centre of each part rather than its middle,
 * because every one of these buildings is described from the ground upwards.
 *
 * Keeping this module renderer-free is what makes a reconstruction checkable:
 * the tests can assert that the top row of a theatre lands at the radius its
 * cited diameter implies, without a canvas, a GPU or a browser anywhere in
 * sight. `Reconstruction3DInner.tsx` is then only a translator from these
 * parts into meshes.
 */

export type Vec3 = [number, number, number];

export type Material =
  | "marble"
  | "marbleWorn"
  | "limestone"
  | "stone"
  | "stoneDark"
  | "terrazzo"
  | "shadow"
  | "human"
  /** Burnt summer grass, and the thin soil it grows out of. */
  | "grass"
  | "ground"
  /*
   * Paint. A Roman marble front was not white: the panels behind the columns
   * were coloured, the mouldings picked out, the ornament gilded. The bare
   * stone everyone pictures is what eleven centuries of weather left, not what
   * was built — so a reconstruction that shows the building new has to show it
   * painted, and say that the colours come from a published reconstruction
   * rather than from surviving pigment.
   */
  | "paintRed"
  | "paintBlue"
  | "paintGold"
  | "timber"
  | "bronze"
  /*
   * What the life of a scene is made of (see `scene-life.ts`): fired clay for
   * jars, lamps and roof tiles, linen on a couch, the leaves of a laurel, the
   * pale end of a rolled papyrus, a skin stretched to dry.
   */
  | "terracotta"
  | "linen"
  | "foliage"
  | "papyrus"
  | "hide"
  /** Coloured marbles and granite for show columns. */
  | "granite"
  | "gialloAntico"
  | "pavonazzetto"
  /** The warm, pebbly conglomerate Aspendos is built of. */
  | "conglomerate"
  /** Open water: a harbour basin. */
  | "water"
  /** The raked sand of a race track: matt, with no shine at a low sun. */
  | "sand"
  /** Living rock: a cliff, grey and weathered (see `models/rockface.ts`). */
  | "rock"
  /*
   * What is left on the stone after two thousand years: the letters of an
   * inscription, darker where the cut holds dirt and the trace of the red
   * that once filled it, and paint faded to a stain — a dusty red, a grey
   * blue — on mouldings and behind carving. Faint on purpose, so marble
   * still reads as marble.
   */
  | "lettering"
  /** The same cuts in a dark stone, where they read as shadow. */
  | "letteringDark"
  | "fadedRed"
  | "fadedBlue";

/**
 * A photograph of the real carving, wrapped onto the surface that carried it.
 *
 * Procedural boxes and cylinders cannot cut a Gigantomachy, a Medusa or the
 * folds of a draped statue, and inventing an approximation of a famous relief
 * would be worse than leaving the stone blank. A photograph of the thing
 * itself is neither: it is the carving, on the surface it belongs to.
 *
 * Every URL here must be a freely licensed Wikimedia Commons file with an
 * entry in `photo-credits.ts` — the test suite asserts it, and the page prints
 * the credits under the model.
 */
export type Carving = {
  /** Commons thumbnail URL, pinned to a width Commons actually serves. */
  url: string;
  /** How many times it tiles across the surface. */
  repeat?: [number, number];
  /**
   * How far the carving stands out of the stone, in metres.
   *
   * The photograph doubles as a height map: a `relief` panel is a finely
   * divided surface, and every vertex on it is pushed outwards by the
   * brightness of the pixel in front of it. So the carving is not a picture of
   * depth — it is depth. It catches a raking light and throws its own shadow,
   * and turning the model shows it from the side.
   *
   * Brightness is not really height, which is why the number stays small:
   * enough for the carving to read as cut into the stone, not so much that the
   * photograph's own shadows turn into craters.
   */
  relief?: number;
  /**
   * What the photograph contributes.
   *
   * `"colour"` shows the picture itself — right for a fresco or a mosaic,
   * which *are* colour, and for a statue standing in shadow. `"depth"` throws
   * the picture away after using it as the height map, so the carving is cut
   * into the surrounding stone in the surrounding stone's own colour. A relief
   * shown in colour reads as a photograph stuck to the wall; the same relief
   * shown as depth reads as carving, because that is what it now is.
   */
  blend?: "colour" | "depth";
};

/**
 * A photogrammetric scan of the real piece, standing in for this part's own
 * geometry (see `scans.ts`). The part keeps its place in the list — its
 * bounds still frame the camera, and the data it carries still counts — but
 * what is drawn there is the scan, fitted into the space the part describes:
 * a figure's height, a panel's rectangle, or a column drum's diameter.
 */
export type ScanFit = {
  id: ScanId;
  /** For a drum wrapped round a column: the column's axis at the drum's base. */
  centre?: Vec3;
  diameter?: number;
};

type Base = {
  material: Material;
  carving?: Carving;
  scan?: ScanFit;
  /**
   * Scenery rather than building: loose stone on the ground, and anything else
   * that sets the scene without being part of what is being reconstructed.
   *
   * `boundsOf` skips it, so the camera frames the enclosure rather than the
   * scatter of rock around it — a metre of rubble on every side pushed
   * Göbeklitepe far enough away that its carvings became invisible.
   */
  decor?: boolean;
  /**
   * How hard the weather has worked on this stone, in metres of wander.
   *
   * A block carrying a weather figure is subdivided and every vertex pushed
   * along its own normal by that much noise, so the faces bow, the arrises
   * chip, and no two stones come out alike. Limestone that has stood in the
   * open for eleven thousand years is not a box — and a ring of identical
   * boxes is the one thing that most gives a reconstruction away.
   */
  weather?: number;
  /**
   * The statue this piece belongs to, when a statue is built of many pieces —
   * the enthroned gods of Nemrut and their guardians. The renderer does not
   * need it; the tests use it to find a statue again in the flat list.
   */
  statue?: string;
  /**
   * A cliff: the block's front (-z, before `rotY`) is a rock face standing
   * out of it by up to `relief` — ledges, fissures, an overhang (see
   * `models/rockface.ts`). Boxes only.
   */
  rock?: RockFace;
  /**
   * A wall painting drawn over the block's front (+z, before `rotY`):
   * registers of saints, made from the seed (see `scene/fresco.ts`). The
   * block itself is not drawn. Boxes only.
   */
  fresco?: { seed: number; registers: number; perRow: number };
};

export type Part =
  | (Base & {
      kind: "box";
      at: Vec3;
      size: Vec3;
      rotY: number;
      /**
       * Tips the block about its own x axis, pivoting on the middle of its
       * base, before `rotY` turns it: a slab of roof tiles laid to a pitch.
       */
      rotX?: number;
      /**
       * A text cut on the block's front (`+z`) face: the block is then only
       * the plate the letters are drawn on (see `inscription`).
       */
      lettering?: Lettering;
    })
  | (Base & {
      kind: "cylinder";
      at: Vec3;
      radiusBottom: number;
      radiusTop: number;
      height: number;
      segments: number;
      /**
       * Tips the cylinder over after it is stood up, so its axis runs along +z
       * from `at`. A half drum laid this way is a segmental pediment.
       */
      rotX?: number;
      /** Turns it about the vertical, applied after `rotX`. */
      rotY?: number;
      /** A slice of the drum rather than the whole of it. */
      thetaStart?: number;
      thetaLength?: number;
      /**
       * Flutes cut down the shaft. A Greek column without them reads as a pipe:
       * the grooves are what break the light into vertical stripes and make a
       * 19.7 m shaft look like quarried stone.
       */
      flutes?: number;
    })
  /** An annulus sector standing on its base — seat rows, walls, floors. */
  | (Base & {
      kind: "ring";
      at: Vec3;
      inner: number;
      outer: number;
      height: number;
      thetaStart: number;
      thetaLength: number;
    })
  /**
   * Earth banked up in an arc and falling away smoothly: highest (`height`)
   * at radius `inner` and down to the ground `reach` further out, steep at
   * the wall and flattening into the plain (see `bankHeight`).
   */
  | (Base & {
      kind: "bank";
      at: Vec3;
      inner: number;
      reach: number;
      height: number;
      thetaStart: number;
      thetaLength: number;
    })
  /**
   * A carved panel: a finely divided surface that the carving's own photograph
   * pushes into relief. Faces +z before `rotY` turns it, and `at` is the
   * bottom centre like everything else.
   */
  | (Base & {
      kind: "relief";
      at: Vec3;
      size: [number, number];
      rotY: number;
      /**
       * Tips the panel over before `rotY` turns it. `-π/2` lays it flat and
       * face up, which is what a mosaic floor is; without it a floor stands on
       * edge and disappears.
       */
      rotX?: number;
    })
  /** A triangular prism, apex centred: pediments and gable ends. */
  | (Base & { kind: "prism"; at: Vec3; size: Vec3; rotY: number })
  /** A stylised human, for scale. `at` is the ground under their feet. */
  | (Base & {
      kind: "figure";
      at: Vec3;
      height: number;
      rotY: number;
      /**
       * A beard, drawn under the jaw. `true` makes a male figure; without it a
       * bronze horseman, a marble Celsus or the Didyma Apollo would share the
       * hair-bun of the four Celsus virtues.
       */
      bearded?: boolean;
      /**
       * Standing on the ground under `at`, or astride a horse whose back is
       * at `at` — for a rider the point given is the seat, not the feet, and
       * `height` is still how tall they would stand.
       */
      pose?: "standing" | "riding" | "seated";
      /**
       * Who this is. A statue with no identity is a generic draped figure —
       * fine for the nameless crowd between the Mausoleum's columns, wrong
       * for Zeus, who wore a tiara, or for Herakles, who leaned on a club.
       */
      identity?: FigureIdentity;
      /**
       * The colour that was on the stone. Hellenistic and Roman marble
       * statues were painted — the mantle coloured, the hem bordered, the
       * hair and lips picked out — and analysis of surviving traces has
       * shown how much. The tints here are kept faded, the way the traces
       * read, so the marble still reads as marble.
       */
      paint?: FigurePaint;
    })
  /**
   * A silhouette cut in relief: an outline drawn in the plane of a face and
   * pushed out of it, the edges bevelled so the light catches them. `at` is
   * the point on the face the outline is drawn from, `u` across it and `v`
   * up it, and the carving stands out along local `+z` before `rotY` turns
   * that onto the face's own normal. This is what a Göbeklitepe animal is —
   * a flat raised shape with the ground chipped back around it — and what a
   * crest of mane or a fold of cloth can be cut as too.
   */
  | (Base & {
      kind: "carving";
      at: Vec3;
      outline: [number, number][];
      /** Cut-outs inside the outline: a drilled eye. */
      holes?: [number, number][][];
      /** How far the whole carving is, front to back. */
      depth: number;
      /**
       * The share of `depth` buried behind the face, so the bevel runs into
       * the stone it is cut from rather than leaving a hairline. `0.4` unless
       * said otherwise; `0.5` centres a fin in a surface.
       */
      sink?: number;
      rotY: number;
      /** Turns the outline in its own plane first: a beast leaping downwards. */
      rotZ?: number;
    })
  /**
   * A skin lofted over elliptical cross-sections along a path: the body of a
   * horse, a neck, a limb, a fold of cloth. Each section is an ellipse `rx`
   * wide across the path and `ry` tall, centred at `c` relative to `at`, and
   * the surface runs smoothly through all of them.
   */
  | (Base & {
      kind: "loft";
      at: Vec3;
      rotY: number;
      sections: LoftSection[];
    });

/**
 * How high a bank stands `r` metres from its centre (0 beyond its reach). Given
 * an angle too, the bank also tapers off over the last stretch at each end of
 * its arc, so it fades into the ground there instead of ending in a cut face.
 */
export const bankHeight = (
  part: { inner: number; reach: number; height: number; thetaStart: number; thetaLength: number },
  r: number,
  theta?: number,
): number => {
  const t = Math.min(1, Math.max(0, (r - part.inner) / part.reach));
  let h = part.height * (1 - t) ** 1.6;
  if (theta !== undefined && part.thetaLength < Math.PI * 2 - 1e-6) {
    const edge = Math.min(theta - part.thetaStart, part.thetaStart + part.thetaLength - theta);
    const fade = Math.min(1, Math.max(0, edge / (part.thetaLength * 0.12)));
    h *= fade * fade * (3 - 2 * fade);
  }
  return h;
};

/** One cross-section of a loft, in metres relative to the part's `at`. */
export type LoftSection = { c: Vec3; rx: number; ry: number };

/** Colours for a painted statue, as hex; anything left out stays bare marble. */
export type FigurePaint = {
  /** The chiton, peplos or tunic. */
  cloth?: number;
  /** The mantle, its roll and its falls. */
  mantle?: number;
  hair?: number;
  /** Headgear, held things, borders. */
  accent?: number;
  /** Skin, very lightly: Greek sculpture tinted flesh rather than painting it. */
  skin?: number;
};

/** What a statue wears on its head. */
export type Headgear =
  /** The tall, rounded Persian cap with lappets: Zeus-Oromasdes at Nemrut. */
  | "persianTiara"
  /** The five-pointed Armenian tiara of the Commagene kings. */
  | "armenianTiara"
  /** The soft cap with its peak bent forward: Apollo-Mithras. */
  | "phrygianCap"
  /** A basket-crown heaped with fruit and grain: Kommagene, Tyche. */
  | "polos"
  /** A thin fillet round the brow. */
  | "diadem"
  /** A veil drawn up over the head and down the back. */
  | "veil"
  /** The crested Corinthian helmet pushed up off the face: Athena. */
  | "helmet"
  /** The tall mural crown of Artemis of Ephesus, with its veil behind. */
  | "muralCrown";

/** How the hair is worn. `bun` is the default for a woman, `short` for a man. */
export type Hair = "bun" | "short" | "long" | "curls";

/**
 * The dress. A `peplos` has the overfold turned down from the shoulders;
 * a `chiton` is the thinner tunic under a mantle; a `himation` is the heavy
 * mantle a Greek man wrapped himself in, and a `toga` the Roman one.
 */
export type Dress =
  | "peplos"
  | "chiton"
  | "himation"
  | "toga"
  /**
   * The close sheath of Artemis of Ephesus: the body from the waist down a
   * tapering column banded with beasts, and the rows of egg-shaped pendants
   * hung across the chest that are her best-known attribute.
   */
  | "ependytes";

/** What a hand holds. */
export type Held =
  | "scroll"
  | "tablet"
  | "club"
  | "cornucopia"
  /** The bundle of rods a Persian priest or king held in front of him. */
  | "barsom"
  | "sceptre"
  | "bow"
  | "wheat"
  | "spear"
  | "shield"
  /** The shallow libation bowl, held out flat. */
  | "phiale"
  /** Zeus's thunderbolt, a double-ended bundle of flame. */
  | "thunderbolt"
  /** A wreath held out, for a victor or a god. */
  | "wreath";

/** What the right hand does when it holds nothing. */
export type Gesture =
  | "rest"
  | "chin"
  | "raised"
  /** The hand drawing the veil forward at the shoulder, the mourning woman's gesture. */
  | "veil"
  /** Both forearms held straight out, palms up, as Artemis of Ephesus holds hers. */
  | "forward";

/**
 * The particulars that tell one statue from another.
 *
 * A reconstruction that shows every figure as the same draped woman with a
 * bun is a reconstruction of nobody. What the sculptors used to tell a god
 * from a king was never the face — it was the tiara, the beard, the club,
 * the horn of plenty. Those are cheap to model and impossible to mistake,
 * so they are what the identity carries. The `name` is for the tests and
 * the reader, not for rendering.
 */
/**
 * The particulars of a face, each around 1: a longer or shorter nose, a
 * heavier brow, a wider jaw. Anything left out is dealt from the figure's
 * own seed, so no two statues share a face by accident.
 */
export type FaceShape = {
  nose?: number;
  noseWidth?: number;
  brow?: number;
  jaw?: number;
  chin?: number;
  lips?: number;
  cheek?: number;
  eye?: number;
  /** How long the face is, top to bottom. */
  length?: number;
  /** From 0, smooth and young, to 1, lined. */
  age?: number;
};

export type FigureIdentity = {
  name: string;
  face?: FaceShape;
  sex?: "female" | "male";
  bearded?: boolean;
  hair?: Hair;
  headgear?: Headgear;
  dress?: Dress;
  /** In the left hand. */
  left?: Held;
  /** In the right hand. */
  right?: Held;
  gesture?: Gesture;
};

/**
 * The named statues, by building. Poses and attributes follow the
 * surviving originals where they survive — the Nemrut colossi and their
 * heads, the Celsus virtues in Vienna, the Mausoleum figures in London —
 * and published reconstructions where they do not.
 */
export const IDENTITIES = {
  /** The four virtues in the lower niches of the Celsus front, left to right. */
  celsusVirtues: [
    {
      name: "Sophia",
      sex: "female",
      dress: "chiton",
      headgear: "veil",
      hair: "long",
      left: "scroll",
      gesture: "rest",
    },
    {
      name: "Arete",
      sex: "female",
      dress: "peplos",
      hair: "bun",
      headgear: "diadem",
      gesture: "raised",
    },
    {
      name: "Ennoia",
      sex: "female",
      dress: "chiton",
      hair: "bun",
      gesture: "chin",
    },
    {
      name: "Episteme",
      sex: "female",
      dress: "peplos",
      hair: "bun",
      left: "tablet",
      gesture: "rest",
    },
  ],
  /** The father and son on the upper podia. */
  celsus: {
    name: "Tiberius Iulius Celsus Polemaeanus",
    sex: "male",
    bearded: true,
    hair: "short",
    dress: "toga",
    left: "scroll",
    gesture: "rest",
  },
  aquila: {
    name: "Tiberius Iulius Aquila Polemaeanus",
    sex: "male",
    bearded: false,
    hair: "curls",
    dress: "toga",
    left: "scroll",
    gesture: "raised",
  },
  /**
   * The five enthroned colossi of the east terrace, left to right as seen
   * from the court. Each is known from its head, found at its feet: the
   * king in the Armenian tiara, the goddess crowned with fruit, Zeus in the
   * Persian cap, Apollo in the Phrygian one, Herakles bare-headed with his
   * club.
   */
  nemrutColossi: [
    {
      name: "Antiochos I",
      face: {
        nose: 1.28,
        noseWidth: 1.0,
        brow: 0.9,
        jaw: 1.15,
        chin: 1.2,
        lips: 1.0,
        cheek: 0.9,
        eye: 1.05,
        length: 1.1,
        age: 0.25,
      },
      sex: "male",
      bearded: false,
      hair: "short",
      headgear: "armenianTiara",
      dress: "himation",
      left: "barsom",
      right: "sceptre",
    },
    {
      name: "Kommagene",
      face: {
        nose: 0.9,
        noseWidth: 0.85,
        brow: 0.55,
        jaw: 0.78,
        chin: 0.9,
        lips: 1.3,
        cheek: 1.2,
        eye: 1.18,
        length: 1.0,
        age: 0,
      },
      sex: "female",
      hair: "long",
      headgear: "polos",
      dress: "chiton",
      left: "cornucopia",
      right: "wheat",
    },
    {
      name: "Zeus-Oromasdes",
      face: {
        nose: 1.15,
        noseWidth: 1.25,
        brow: 1.45,
        jaw: 1.1,
        chin: 1.0,
        lips: 0.9,
        cheek: 1.0,
        eye: 0.95,
        length: 1.12,
        age: 0.85,
      },
      sex: "male",
      bearded: true,
      hair: "long",
      headgear: "persianTiara",
      dress: "himation",
      left: "barsom",
      right: "sceptre",
    },
    {
      name: "Apollon-Mithras-Helios-Hermes",
      face: {
        nose: 1.0,
        noseWidth: 0.82,
        brow: 0.75,
        jaw: 0.9,
        chin: 1.15,
        lips: 1.25,
        cheek: 1.1,
        eye: 1.12,
        length: 1.04,
        age: 0,
      },
      sex: "male",
      bearded: false,
      hair: "curls",
      headgear: "phrygianCap",
      dress: "himation",
      left: "barsom",
      right: "sceptre",
    },
    {
      name: "Herakles-Artagnes-Ares",
      face: {
        nose: 0.88,
        noseWidth: 1.4,
        brow: 1.35,
        jaw: 1.4,
        chin: 1.1,
        lips: 1.05,
        cheek: 1.25,
        eye: 0.9,
        length: 0.98,
        age: 0.6,
      },
      sex: "male",
      bearded: true,
      hair: "curls",
      dress: "himation",
      right: "club",
    },
  ],
  /** The pair in the quadriga on the summit of the Mausoleum. */
  maussollos: {
    name: "Maussollos",
    sex: "male",
    bearded: true,
    hair: "long",
    dress: "himation",
    gesture: "rest",
  },
  artemisia: {
    name: "Artemisia II",
    sex: "female",
    hair: "long",
    headgear: "veil",
    dress: "chiton",
    gesture: "rest",
  },
  /** The archaic cult statue of the oracle: a young god with his bow. */
  didymaApollo: {
    name: "Apollon Philesios",
    sex: "male",
    bearded: false,
    hair: "long",
    headgear: "diadem",
    dress: "chiton",
    left: "bow",
    gesture: "raised",
  },
  /**
   * The cult statue of the Artemision: not the huntress of the Greek
   * mainland but the old goddess of Ephesus, known from the Roman marble
   * copies in the Selçuk museum — the mural crown, the forearms held out,
   * the egg-shaped pendants across the breast and the sheath of beasts.
   */
  artemisEphesia: {
    name: "Artemis Ephesia",
    sex: "female",
    hair: "long",
    headgear: "muralCrown",
    dress: "ependytes",
    gesture: "forward",
  },
  /** Zeus of Aizanoi, standing, with his sceptre and his thunderbolt. */
  zeus: {
    name: "Zeus",
    sex: "male",
    bearded: true,
    hair: "long",
    headgear: "diadem",
    dress: "himation",
    left: "sceptre",
    right: "thunderbolt",
  },
  /**
   * The family of the dynasty between the Mausoleum's columns. The statues
   * found on the site are of men and women of the Hekatomnid house, in the
   * dress and the poses of the fourth century — and no two alike: a veiled
   * woman drawing her mantle forward, a man pouring a libation, one in
   * thought, one with a spear.
   */
  hekatomnids: [
    {
      name: "Hekatomnid",
      sex: "male",
      bearded: true,
      hair: "long",
      dress: "himation",
      gesture: "rest",
    },
    {
      name: "Hekatomnid",
      sex: "female",
      hair: "long",
      headgear: "veil",
      dress: "chiton",
      gesture: "veil",
    },
    {
      name: "Hekatomnid",
      sex: "male",
      bearded: true,
      hair: "short",
      dress: "himation",
      right: "phiale",
    },
    {
      name: "Hekatomnid",
      sex: "female",
      hair: "bun",
      headgear: "diadem",
      dress: "peplos",
      right: "wreath",
    },
    {
      name: "Hekatomnid",
      sex: "male",
      bearded: true,
      hair: "curls",
      dress: "himation",
      gesture: "chin",
    },
    {
      name: "Hekatomnid",
      sex: "female",
      hair: "bun",
      dress: "chiton",
      left: "scroll",
      gesture: "raised",
    },
    {
      name: "Hekatomnid",
      sex: "male",
      bearded: false,
      hair: "curls",
      dress: "chiton",
      right: "spear",
    },
    {
      name: "Hekatomnid",
      sex: "female",
      hair: "long",
      headgear: "veil",
      dress: "peplos",
      right: "phiale",
    },
  ],
} satisfies Record<string, FigureIdentity | FigureIdentity[]>;

/**
 * The scans the Mausoleum's dynasts stand in. No statue of the family
 * survives whole enough to scan, so each stands in a scanned statue of its
 * kind from the same tradition: a man in the himation, bearded, as the
 * so-called Maussollos in the British Museum is (the Asklepios type), or with
 * it drawn over his head; a woman wrapped in her mantle, or standing in the
 * Ionic chiton of the Erechtheion's maidens. They are seen thirty metres up,
 * twenty of them, so they come from reduced copies of the scans.
 */
function dynastScan(who: FigureIdentity, index: number): ScanId {
  const men: ScanId[] = ["asklepios-lod", "tiberius-velatus-lod"];
  const women: ScanId[] = ["ephesus-portrait-lod", "caryatid-lod"];
  const choices = who.sex === "female" ? women : men;
  return choices[Math.floor(index / 2) % choices.length]!;
}

/**
 * The paint on the statues. Pigment survives as traces — Egyptian blue, red
 * and yellow ochre, madder, gold leaf — and these follow the published
 * colour reconstructions of Hellenistic and Roman marbles: coloured mantles
 * over paler tunics, borders in a contrasting colour, hair in brown, a warm
 * wash on the skin. All faded, because that is what the traces show, and
 * because a statue painted at full strength reads as a doll.
 */
export const PAINT = {
  celsusVirtues: [
    { cloth: 0xe9e0cc, mantle: 0x7e98b4, hair: 0x6e4a2c, accent: 0xc8a24a, skin: 0xf2dcc6 },
    { cloth: 0xead8b4, mantle: 0xb4644f, hair: 0x5a3a22, accent: 0xc8a24a, skin: 0xf2dcc6 },
    { cloth: 0xdde4d0, mantle: 0x8a7a4a, hair: 0x6e4a2c, accent: 0x7e98b4, skin: 0xf2dcc6 },
    { cloth: 0xefe2c8, mantle: 0x8a5a7e, hair: 0x4a3020, accent: 0xc8a24a, skin: 0xf2dcc6 },
  ],
  celsus: { cloth: 0xf2ece0, mantle: 0xf0e9dc, hair: 0x5a4a3a, accent: 0x8a4a6e, skin: 0xefd6be },
  aquila: { cloth: 0xf2ece0, mantle: 0xf0e9dc, hair: 0x5a3a22, accent: 0x8a4a6e, skin: 0xefd6be },
  artemisEphesia: {
    cloth: 0xc9a24e,
    mantle: 0xb88a48,
    hair: 0x4a3020,
    accent: 0xd4ae52,
    skin: 0xe6c8a8,
  },
  zeus: { cloth: 0xe8dcc4, mantle: 0x8a5a7e, hair: 0x5a4a3a, accent: 0xc8a24a, skin: 0xeed2b6 },
  apollo: { cloth: 0xe8dcc4, mantle: 0x7e98b4, hair: 0x8a6a3a, accent: 0xc8a24a, skin: 0xeed2b6 },
  maussollos: {
    cloth: 0xe8dcc4,
    mantle: 0xa45a46,
    hair: 0x4a3020,
    accent: 0xc8a24a,
    skin: 0xeed2b6,
  },
  artemisia: {
    cloth: 0xe9e0cc,
    mantle: 0x6e86a4,
    hair: 0x4a3020,
    accent: 0xc8a24a,
    skin: 0xf2dcc6,
  },
  hekatomnids: [
    { cloth: 0xe8dcc4, mantle: 0x9a5a46, hair: 0x4a3020, accent: 0xc8a24a, skin: 0xeed2b6 },
    { cloth: 0xe9e0cc, mantle: 0x6e86a4, hair: 0x5a3a22, accent: 0xc8a24a, skin: 0xf2dcc6 },
    { cloth: 0xeae4d4, mantle: 0x7a8a58, hair: 0x3a2a1c, accent: 0xb4644f, skin: 0xeed2b6 },
    { cloth: 0xd8c08a, mantle: 0xc4806c, hair: 0x6e4a2c, accent: 0xc8a24a, skin: 0xf2dcc6 },
    { cloth: 0xe8dcc4, mantle: 0x8a6a8e, hair: 0x5a4a3a, accent: 0xc8a24a, skin: 0xeed2b6 },
    { cloth: 0xe4ecf0, mantle: 0xc9a24e, hair: 0x4a3020, accent: 0x6e86a4, skin: 0xf2dcc6 },
    { cloth: 0xc4806c, mantle: 0xe9e0cc, hair: 0x8a6a3a, accent: 0xc8a24a, skin: 0xe6c8a8 },
    { cloth: 0xe9e0cc, mantle: 0x5a6e8e, hair: 0x3a2a1c, accent: 0xc8a24a, skin: 0xf2dcc6 },
  ],
} satisfies Record<string, FigurePaint | FigurePaint[]>;

const TAU = Math.PI * 2;

/**
 * How many drums a shaft is built from. Exported because the tests count
 * columns by counting drums, and a column that quietly changed how many
 * pieces it is made of would otherwise look like a column that vanished.
 */
export const SHAFT_DRUMS = 7;

/**
 * The carvings, each a photograph of the surviving original.
 *
 * Chosen for being shot square-on: a picture taken at an angle carries its own
 * perspective into the texture and reads as a photograph stuck to a wall. That
 * ruled out several otherwise excellent photographs — the whole stage front at
 * Aspendos among them, which is why that wall is carved in geometry instead.
 */
export const CARVINGS = {
  /** A sculpted drum from the Artemision, now in the British Museum. */
  artemisionDrum: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Column_drum_from_the_temple_of_Artemis_at_Ephesus_%28British_Museum%29.jpg/1280px-Column_drum_from_the_temple_of_Artemis_at_Ephesus_%28British_Museum%29.jpg",
    relief: 0.16,
    blend: "depth" as const,
  },
  /** The Gigantomachy frieze, as re-erected in the Pergamonmuseum. */
  gigantomachy: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pergamonmuseum_-_Antikensammlung_-_Pergamonaltar_31.JPG/1280px-Pergamonmuseum_-_Antikensammlung_-_Pergamonaltar_31.JPG",
    repeat: [3, 1] as [number, number],
    // High relief: the giants come almost fully out of the ground behind them.
    relief: 0.3,
    blend: "depth" as const,
  },
  /** The Medusa head from the frieze of the temple at Didyma. */
  medusa: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/A_stone-carved_Medusa_head%2C_Apollo_Temple%2C_Didyma.jpg/1280px-A_stone-carved_Medusa_head%2C_Apollo_Temple%2C_Didyma.jpg",
    relief: 0.28,
    blend: "depth" as const,
  },
  /** Animals carved on a pillar at Göbeklitepe. */
  gobekliReliefs: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Animal_hunting_scene._Gobekli_Tepe.jpg/1280px-Animal_hunting_scene._Gobekli_Tepe.jpg",
    // Low relief, chipped a few centimetres into limestone with flint.
    relief: 0.09,
    blend: "depth" as const,
  },
  /**
   * A row of animals cut across the face of a pillar in Enclosure C — the
   * clearest square-on photograph of Göbeklitepe carving there is.
   */
  gobekliPillarFace: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/G%C3%B6beklitepe_Building_C_3143.jpg/1280px-G%C3%B6beklitepe_Building_C_3143.jpg",
    relief: 0.085,
    blend: "depth" as const,
  },
  /** A single beast, with the drilled hole beside it, on another C pillar. */
  gobekliBeast: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/G%C3%B6beklitepe_Building_C_3145.jpg/1280px-G%C3%B6beklitepe_Building_C_3145.jpg",
    relief: 0.08,
    blend: "depth" as const,
  },
  /**
   * A wall painting from the House of the Muses at Ephesus. Paint, not
   * carving: it lies flat on the plaster, so it takes no relief at all.
   */
  terraceFresco: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Ephesus_Terrace_Houses_fresco_in_house_with_muses_in_2015_2718.jpg/1280px-Ephesus_Terrace_Houses_fresco_in_house_with_muses_in_2015_2718.jpg",
  },
  /** The geometric mosaic of a terrace house floor. */
  terraceMosaic: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Ephesus_Terrace_Houses_Geometric_mosaic_in_2015_2743.jpg/1280px-Ephesus_Terrace_Houses_Geometric_mosaic_in_2015_2743.jpg",
    repeat: [2, 2] as [number, number],
    // Tesserae sit slightly unevenly, which is what a mosaic floor feels like.
    relief: 0.014,
  },
  /** Dionysus, in mosaic, on the floor of the reception room. */
  terraceDionysus: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Ephesus_Terrace_Houses_Dionysus_mosaic_in_2015_2730.jpg/1280px-Ephesus_Terrace_Houses_Dionysus_mosaic_in_2015_2730.jpg",
    relief: 0.014,
  },
} satisfies Record<string, Carving>;

const box = (material: Material, at: Vec3, size: Vec3, rotY = 0, carving?: Carving): Part => ({
  kind: "box",
  material,
  at,
  size,
  rotY,
  ...(carving ? { carving } : {}),
});

const cyl = (
  material: Material,
  at: Vec3,
  radiusBottom: number,
  radiusTop: number,
  height: number,
  segments = 24,
  extra: {
    rotX?: number;
    rotY?: number;
    thetaStart?: number;
    thetaLength?: number;
    flutes?: number;
  } = {},
): Part => ({
  kind: "cylinder",
  material,
  at,
  radiusBottom,
  radiusTop,
  height,
  segments,
  ...extra,
});

/**
 * The round-topped pediment that alternates with the triangular one along a
 * Roman façade: a drum laid on its side, sunk into the cornice so that only a
 * shallow arc shows. A full half-circle sitting on top reads as a dome, which
 * is what the first attempt at the Celsus front looked like.
 */
const segmentalPediment = (material: Material, at: Vec3, radius: number, depth: number): Part =>
  cyl(material, [at[0], at[1] - radius * 0.62, at[2]], radius, radius, depth, 26, {
    rotX: Math.PI / 2,
    thetaStart: Math.PI / 2,
    thetaLength: Math.PI,
  });

const ring = (
  material: Material,
  y: number,
  inner: number,
  outer: number,
  height: number,
  thetaStart = 0,
  thetaLength = TAU,
  centre: [number, number] = [0, 0],
): Part => ({
  kind: "ring",
  material,
  at: [centre[0], y, centre[1]],
  inner,
  outer,
  height,
  thetaStart,
  thetaLength,
});

const prism = (material: Material, at: Vec3, size: Vec3, rotY = 0): Part => ({
  kind: "prism",
  material,
  at,
  size,
  rotY,
});

/** The same stone, but weathered: hand it a part, get an eroded one back. */
const worn = <T extends Part>(part: T, metres: number): T => ({ ...part, weather: metres });

/** Scenery: in the picture, but not part of what is being reconstructed. */
const scenery = <T extends Part>(part: T): T => ({ ...part, decor: true });

/**
 * The place a building stands in.
 *
 * Every one of these sites is somewhere: a limestone plateau above the Harran
 * plain, a silted Aegean river mouth, a hillside over the Pamphylian coast.
 * Without any of that a reconstruction is an object on a turntable, and the
 * mind reads it as a model rather than as a building — the scale stops meaning
 * anything the moment there is nothing beside it that has a known size.
 *
 * All of it is `scenery`, so it never enters the bounding box: the camera goes
 * on framing the building, and the county behind it is just there.
 *
 * `character` is what makes one site not look like another. Stone is how much
 * rock breaks the surface, grass how much survives the summer, and hills how
 * near the skyline closes in — `0` for a coastal plain that runs to the sea.
 */
function setting(
  radius: number,
  seed: number,
  character: { stone?: number; grass?: number; hills?: number; ground?: Material } = {},
): Part[] {
  const parts: Part[] = [];
  const random = seeded(seed);
  const stone = character.stone ?? 1;
  const grass = character.grass ?? 1;
  const hills = character.hills ?? 1;
  const bed = character.ground ?? "limestone";

  parts.push(
    ...rubble(
      bed,
      Math.round(46 * stone),
      radius * 1.05,
      radius * 1.9,
      seed + 7,
      0.9 * (radius / 15) ** 0.4,
    ).map(scenery),
  );

  // Bedrock breaking the surface, in long low slabs rather than boulders.
  for (let i = 0; i < Math.round(26 * stone); i += 1) {
    const theta = random() * TAU;
    const r = radius * (1.15 + random() * 1.5);
    const scale = (radius / 15) ** 0.5;
    parts.push(
      scenery(
        worn(
          box(
            bed,
            [Math.cos(theta) * r, -0.12, Math.sin(theta) * r],
            [
              (1.6 + random() * 4.5) * scale,
              (0.3 + random() * 0.34) * scale,
              (1.2 + random() * 3) * scale,
            ],
            random() * TAU,
          ),
          0.12 * scale,
        ),
      ),
    );
  }

  // Dry grass, in the clumps it grows in on thin soil.
  for (let i = 0; i < Math.round(260 * grass); i += 1) {
    const theta = random() * TAU;
    const r = radius * (1.02 + random() * 2.1);
    const blades = 3 + Math.floor(random() * 4);
    for (let b = 0; b < blades; b += 1) {
      parts.push(
        scenery(
          box(
            "grass",
            [
              Math.cos(theta) * r + (random() - 0.5) * 0.45,
              -0.02,
              Math.sin(theta) * r + (random() - 0.5) * 0.45,
            ],
            [0.035, 0.2 + random() * 0.3, 0.035],
            random() * TAU,
          ),
        ),
      );
    }
  }

  // The ridges on the skyline, far enough out to read as distance.
  if (hills > 0) {
    for (let i = 0; i < 22; i += 1) {
      const theta = (TAU * i) / 22 + (random() - 0.5) * 0.2;
      const r = radius * (7 + random() * 4) * (1 / hills);
      parts.push(
        scenery(
          worn(
            cyl(
              "ground",
              [Math.cos(theta) * r, -6 * hills, Math.sin(theta) * r],
              radius * (1.6 + random() * 1.4),
              radius * (0.8 + random() * 0.9),
              (8 + random() * 9) * hills,
              9,
            ),
            1.4,
          ),
        ),
      );
    }
  }

  return parts;
}

/** A panel of carving, standing proud of the surface behind it. */
const relief = (
  material: Material,
  at: Vec3,
  size: [number, number],
  carving: Carving | undefined,
  rotY = 0,
  rotX?: number,
): Part => ({
  kind: "relief",
  material,
  at,
  size,
  rotY,
  ...(carving ? { carving } : {}),
  ...(rotX ? { rotX } : {}),
});

/** A mosaic floor: a panel laid flat, its near edge at `at`, running back. */
const floorPanel = (material: Material, at: Vec3, size: [number, number], carving: Carving): Part =>
  relief(material, at, size, carving, 0, -Math.PI / 2);

const person = (
  at: Vec3,
  height = 1.75,
  rotY = 0,
  material: Material = "human",
  /** A named statue, or just whether a nameless one wears a beard. */
  who?: FigureIdentity | boolean,
  paint?: FigurePaint,
): Part => ({
  kind: "figure",
  material,
  at,
  height,
  rotY,
  ...(typeof who === "boolean" ? { bearded: who } : {}),
  ...(typeof who === "object" ? { identity: who } : {}),
  ...(paint ? { paint } : {}),
});

/** A lofted skin: see the `loft` part kind. */
const loft = (material: Material, at: Vec3, rotY: number, sections: LoftSection[]): Part => ({
  kind: "loft",
  material,
  at,
  rotY,
  sections,
});

/**
 * A point given in a figure's own frame, turned by `rotY` and moved to `at` —
 * the same turn three.js applies, so a rider computed here sits where the
 * horse's own parts end up.
 */
const placed = (at: Vec3, rotY: number, local: Vec3): Vec3 => [
  at[0] + local[0] * Math.cos(rotY) + local[2] * Math.sin(rotY),
  at[1] + local[1],
  at[2] - local[0] * Math.sin(rotY) + local[2] * Math.cos(rotY),
];

/**
 * A repeatable pseudo-random source.
 *
 * Fallen blocks scattered by `Math.random()` would move every time the page
 * rendered, and no test could ever pin them down. Seeded, a ruin lands its
 * rubble in the same place forever.
 */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Blocks fallen off the building, strewn in a band around it.
 *
 * Kept inside the model's own footprint on purpose: anything further out
 * enlarges the bounding box, and the camera then frames the rubble instead of
 * the building.
 */
function rubble(
  material: Material,
  count: number,
  innerRadius: number,
  outerRadius: number,
  seed: number,
  scale = 1,
): Part[] {
  const random = seeded(seed);
  const parts: Part[] = [];
  for (let i = 0; i < count; i += 1) {
    const theta = random() * TAU;
    const r = innerRadius + random() * (outerRadius - innerRadius);
    const w = (0.5 + random() * 1.1) * scale;
    const h = (0.25 + random() * 0.5) * scale;
    const d = (0.4 + random() * 0.9) * scale;
    parts.push({
      ...(box(
        random() > 0.55 ? "marbleWorn" : material,
        [Math.cos(theta) * r, -0.05, Math.sin(theta) * r],
        [w, h, d],
        random() * TAU,
      ) as Extract<Part, { kind: "box" }>),
      decor: true,
    });
  }
  return parts;
}

/**
 * A classical column, from the moulded base up to the abacus.
 *
 * `order` decides what sits on top: an Ionic capital gets the pair of volutes
 * that name it — modelled as two drums laid on their sides, which is what a
 * volute is before the carver spirals it.
 */
function column(
  material: Material,
  at: Vec3,
  diameter: number,
  height: number,
  order: "ionic" | "composite" | "plain" = "ionic",
  /**
   * Flutes, or `0` for a smooth shaft. Roman imperial marble columns — the
   * Celsus façade, the stage front at Aspendos — are monolithic and polished,
   * not fluted, and giving them grooves makes them read as Greek.
   */
  fluting?: number,
  /**
   * The paint a capital kept: the eyes of the Ionic volutes gilded and the
   * channel between them washed blue, or the bell of a composite capital
   * coloured behind its leaves. Faded, as the traces are.
   */
  paint = false,
): Part[] {
  const parts: Part[] = [];
  const [x, y, z] = at;
  const radius = diameter / 2;
  const baseHeight = height * 0.035;
  const capitalHeight = height * 0.055;
  const shaft = height - baseHeight - capitalHeight;
  const flutes = fluting ?? (diameter > 1.2 ? 24 : 20);

  // Base: a plinth, then — for the Ionic order — the Attic profile of a
  // lower torus, the hollow scotia and an upper torus; a plain torus else.
  parts.push(box(material, [x, y, z], [diameter * 1.25, baseHeight * 0.45, diameter * 1.25]));
  if (order === "ionic") {
    parts.push(
      cyl(
        material,
        [x, y + baseHeight * 0.45, z],
        radius * 1.2,
        radius * 1.18,
        baseHeight * 0.2,
        24,
      ),
    );
    parts.push(
      cyl(
        material,
        [x, y + baseHeight * 0.65, z],
        radius * 1.0,
        radius * 0.96,
        baseHeight * 0.14,
        24,
      ),
    );
    parts.push(
      cyl(
        material,
        [x, y + baseHeight * 0.79, z],
        radius * 1.1,
        radius * 1.04,
        baseHeight * 0.21,
        24,
      ),
    );
  } else {
    parts.push(
      cyl(
        material,
        [x, y + baseHeight * 0.45, z],
        radius * 1.16,
        radius * 1.04,
        baseHeight * 0.55,
        20,
      ),
    );
  }

  /*
   * The shaft, built as the drums it was actually built from.
   *
   * Two things come of that. One is entasis: the profile is not a straight
   * cone but swells a little around the lower third, the correction Greek
   * masons cut so a tall shaft would not look pinched — a single tapered
   * cylinder reads as a factory-made tube. The other is the joints between
   * drums, which catch the light as faint rings all the way up.
   */
  const drums = SHAFT_DRUMS;
  const segments = flutes ? flutes * 2 : 28;
  const profile = (t: number) => {
    const taper = 1 - 0.18 * t;
    const swell = 1 + 0.022 * Math.sin(Math.PI * Math.min(1, t * 1.15));
    return radius * taper * swell;
  };
  for (let i = 0; i < drums; i += 1) {
    const from = i / drums;
    const to = (i + 1) / drums;
    parts.push(
      cyl(
        material,
        [x, y + baseHeight + shaft * from, z],
        profile(from),
        profile(to),
        (shaft / drums) * 0.985,
        segments,
        flutes ? { flutes } : {},
      ),
    );
  }

  const capitalBase = y + baseHeight + shaft;
  if (order === "plain") {
    parts.push(box(material, [x, capitalBase, z], [diameter * 1.2, capitalHeight, diameter * 1.2]));
    return parts;
  }

  // The echinus the capital sits on, and then the capital itself.
  parts.push(
    cyl(material, [x, capitalBase, z], radius * 0.82, radius * 0.95, capitalHeight * 0.4, 20),
  );
  if (order === "ionic") {
    // The egg-and-dart round the echinus: a ring of ovolo eggs.
    const eggs = 16;
    for (let i = 0; i < eggs; i += 1) {
      const theta = (TAU * i) / eggs;
      parts.push(
        cyl(
          material,
          [
            x + Math.cos(theta) * radius * 0.93,
            capitalBase + capitalHeight * 0.08,
            z + Math.sin(theta) * radius * 0.93,
          ],
          radius * 0.09,
          radius * 0.06,
          capitalHeight * 0.3,
          6,
        ),
      );
    }
    /*
     * The volutes, wound rather than stamped: each is four drums of shrinking
     * radius stepped along a spiral, so the scroll actually curls inwards and
     * the eye at its centre sits proud of the coil around it. One flat drum
     * per side reads as a bolt head.
     */
    const volute = radius * 0.62;
    const turns = 4;
    for (const side of [-1, 1]) {
      for (let i = 0; i < turns; i += 1) {
        const t = i / turns;
        const coil = volute * (1 - t * 0.62);
        const angle = t * Math.PI * 1.5;
        parts.push(
          cyl(
            material,
            [
              x + side * radius * 0.86 + Math.cos(angle) * volute * 0.24 * t,
              capitalBase + capitalHeight * 0.4 + volute - Math.sin(angle) * volute * 0.24 * t,
              z - volute * (1 - t * 0.16),
            ],
            coil,
            coil,
            volute * (2 - t * 0.9),
            14,
            { rotX: Math.PI / 2 },
          ),
        );
      }
    }
    parts.push(
      box(
        material,
        [x, capitalBase + capitalHeight * 0.4, z],
        [diameter * 1.9, capitalHeight * 0.35, diameter * 0.85],
      ),
    );
    if (paint) {
      const eye = volute * (1 - 0.75 * 0.62) * 0.5;
      for (const side of [-1, 1]) {
        const t = 0.75;
        const ex = x + side * radius * 0.86 + Math.cos(t * Math.PI * 1.5) * volute * 0.24 * t;
        const ey =
          capitalBase +
          capitalHeight * 0.4 +
          volute -
          Math.sin(t * Math.PI * 1.5) * volute * 0.24 * t;
        // The gilded eye in front, and on the back face of the outer coil.
        parts.push(
          cyl("paintGold", [ex, ey, z - volute * 0.88 - 0.012], eye, eye, 0.02, 8, {
            rotX: Math.PI / 2,
          }),
        );
        parts.push(
          cyl(
            "paintGold",
            [
              x + side * radius * 0.86,
              capitalBase + capitalHeight * 0.4 + volute,
              z + volute - 0.008,
            ],
            eye,
            eye,
            0.02,
            8,
            { rotX: Math.PI / 2 },
          ),
        );
      }
      // The channel between the volutes, washed blue on both faces.
      for (const face of [-1, 1]) {
        parts.push(
          box(
            "fadedBlue",
            [x, capitalBase + capitalHeight * 0.46, z + face * (diameter * 0.425 + 0.006)],
            [diameter * 1.3, capitalHeight * 0.2, 0.014],
          ),
        );
      }
    }
  } else {
    /*
     * A composite capital: the bell, two ranks of acanthus leaves round it,
     * and a volute at each corner. Eight leaves below and eight above, the
     * upper rank set half a leaf across from the lower — which is how the
     * carving reads from the ground, as a basket of foliage rather than a
     * moulding.
     */
    const bell = capitalHeight * 0.72;
    parts.push(
      cyl(
        paint ? "fadedBlue" : material,
        [x, capitalBase + capitalHeight * 0.28, z],
        radius * 0.92,
        radius * 1.1,
        bell,
        16,
      ),
    );
    /*
     * The leaves themselves, as leaves rather than as blocks: each one a
     * tapering form tipped outwards from the bell, so it comes to a point away
     * from the stone and throws a shadow underneath. Upright boxes read as a
     * row of teeth; acanthus curls away from what it grows on.
     */
    for (const rank of [0, 1]) {
      const leaves = 8;
      const lift = capitalHeight * (0.22 + rank * 0.3);
      const leafLength = capitalHeight * (0.46 + rank * 0.06);
      const lean = rank === 0 ? 0.62 : 0.86;
      const r = radius * (0.82 + rank * 0.1);
      for (let i = 0; i < leaves; i += 1) {
        const theta = (TAU * (i + rank * 0.5)) / leaves;
        parts.push(
          cyl(
            material,
            [x + Math.cos(theta) * r, capitalBase + lift, z + Math.sin(theta) * r],
            radius * 0.2,
            radius * 0.05,
            leafLength,
            5,
            // `rotX` tips the leaf away from vertical, `rotY` aims that tilt
            // outwards along the radius it grows on.
            { rotX: lean, rotY: Math.PI / 2 - theta },
          ),
        );
      }
    }
    // The four corner volutes, each a small drum turned to lie along the face.
    const volute = radius * 0.4;
    for (let i = 0; i < 4; i += 1) {
      const theta = Math.PI / 4 + (TAU * i) / 4;
      const r = radius * 1.18;
      parts.push(
        cyl(
          material,
          [
            x + Math.cos(theta) * r,
            capitalBase + capitalHeight * 0.86 - volute,
            z + Math.sin(theta) * r,
          ],
          volute,
          volute * 0.86,
          volute * 1.5,
          12,
          { rotX: Math.PI / 2, rotY: -theta },
        ),
      );
    }
  }
  parts.push(
    box(
      material,
      [x, capitalBase + capitalHeight - capitalHeight * 0.25, z],
      [diameter * 1.55, capitalHeight * 0.25, diameter * 1.55],
    ),
  );
  return parts;
}

/**
 * A cornice: three stepped courses rather than one slab, because the shadow
 * line a cornice throws is the whole reason it projects.
 */
function cornice(
  material: Material,
  at: Vec3,
  width: number,
  depth: number,
  height: number,
): Part[] {
  const [x, y, z] = at;
  const course = height / 3;
  /*
   * Each course steps out by a share of the cornice's own height, the same
   * on every side, as a moulding is cut. Stepped out by a share of the
   * block's length instead, the crown of a 26 m podium overhung it by two
   * metres front and back — a slab a visitor walked into at the top of the
   * Pergamon stair, and a shelf round the Mausoleum.
   */
  const out1 = height * 0.1;
  const out2 = height * 0.32;
  const midWidth = width + 2 * out1;
  const midDepth = depth + 2 * out1;
  const parts: Part[] = [
    box(material, [x, y, z], [width, course, depth]),
    box(material, [x, y + course, z], [midWidth, course, midDepth]),
    box(material, [x, y + course * 2, z], [width + 2 * out2, course, depth + 2 * out2]),
  ];
  /*
   * The dentils: the row of small square blocks under the crown of an Ionic
   * or Corinthian cornice, the stone memory of the ends of roof joists. They
   * are what turns a stepped slab into a Greek cornice, because they break
   * its shadow into a row of teeth.
   */
  const tooth = course * 0.55;
  const spacing = Math.max(tooth * 1.7, 0.1);
  const lip = course * 0.18;
  const dentils = (length: number, along: "x" | "z", offset: number) => {
    const count = Math.min(140, Math.floor(length / spacing));
    for (let i = 0; i < count; i += 1) {
      const t = -length / 2 + spacing * (i + 0.5) + (length - count * spacing) / 2;
      parts.push(
        box(
          material,
          along === "x"
            ? [x + t, y + course * 2 - tooth * 0.9, z + offset]
            : [x + offset, y + course * 2 - tooth * 0.9, z + t],
          along === "x" ? [tooth, tooth, lip * 2] : [lip * 2, tooth, tooth],
        ),
      );
    }
  };
  if (course > 0.08) {
    for (const side of [-1, 1]) {
      dentils(midWidth, "x", side * (midDepth / 2 + lip));
      dentils(midDepth, "z", side * (midWidth / 2 + lip));
    }
  }
  return parts;
}

/* ------------------------------------------------------------------ *
 * Low-relief figures cut into a standing face
 * ------------------------------------------------------------------ */

/**
 * The animals of the Göbeklitepe pillars, each traced from photographs of the
 * carving it stands for and cut as a silhouette a few centimetres proud of
 * the stone — which is exactly what the originals are: flat raised outlines,
 * the ground chipped back around them with flint, a drilled eye, the legs
 * split by a groove.
 *
 * Outlines are drawn in a unit frame, the animal about one unit long with
 * its feet on `v = 0`, facing `-u`. `animalCarving` scales them into metres.
 * Traced from: the fox on the flank of Pillar 18 and the fox of Pillar 10;
 * the boar of Pillar 12; the aurochs, fox and crane stacked on Pillar 2;
 * the vulture, scorpion and cranes of Pillar 43 (the "Vulture Stone"); the
 * snakes of Pillar 1; the gazelles of Enclosure C; the H-sign that recurs on
 * the central pillars of Enclosure D.
 */
export type Animal =
  "fox" | "boar" | "aurochs" | "vulture" | "crane" | "snake" | "scorpion" | "symbol" | "gazelle";

type Outline = [number, number][];

/** A snake sliding down the face: a tapering wave with a spade of a head. */
function snakeOutline(): Outline {
  const left: Outline = [];
  const right: Outline = [];
  const steps = 22;
  for (let i = 0; i <= steps; i += 1) {
    const v = 0.08 + (i / steps) * 0.78;
    const t = i / steps;
    const centre = Math.sin(t * Math.PI * 2.4 + 0.6) * 0.14;
    // Thick behind the head, thinning to a tail at the bottom.
    const half = 0.025 + t * 0.045;
    left.push([centre - half, v]);
    right.push([centre + half, v]);
  }
  const top = right[right.length - 1]!;
  const head: Outline = [
    [top[0] + 0.02, top[1] + 0.02],
    [top[0] + 0.09, top[1] + 0.1],
    [top[0] + 0.02, top[1] + 0.2],
    [top[0] - 0.11, top[1] + 0.2],
    [top[0] - 0.17, top[1] + 0.1],
    [top[0] - 0.1, top[1] + 0.02],
  ];
  return [...right, ...head, ...left.reverse()];
}

/**
 * Every outline runs once round the figure without crossing itself; a
 * silhouette that folds back over its own edge will not extrude.
 */
// prettier-ignore
export const ANIMAL_SHAPES: Record<Animal, { outline: Outline; eye?: [number, number, number] }> =
  {
    fox: {
      outline: [
        [-0.5, 0.42], [-0.44, 0.47], [-0.36, 0.52], [-0.33, 0.62], [-0.3, 0.72], [-0.26, 0.6],
        [-0.18, 0.59], [0.0, 0.61], [0.18, 0.59], [0.3, 0.55], [0.4, 0.6], [0.52, 0.52],
        [0.5, 0.43], [0.4, 0.44], [0.34, 0.37], [0.37, 0.02], [0.3, 0.02], [0.29, 0.18],
        [0.27, 0.02], [0.2, 0.02], [0.2, 0.31], [0.1, 0.34], [-0.02, 0.34], [-0.06, 0.3],
        [-0.04, 0.02], [-0.11, 0.02], [-0.12, 0.18], [-0.14, 0.02], [-0.21, 0.02], [-0.2, 0.31],
        [-0.28, 0.38], [-0.36, 0.4], [-0.46, 0.38],
      ],
      eye: [-0.38, 0.5, 0.022],
    },
    boar: {
      outline: [
        [-0.5, 0.3], [-0.48, 0.38], [-0.4, 0.46], [-0.3, 0.56], [-0.26, 0.66], [-0.22, 0.57],
        [-0.12, 0.63], [0.05, 0.65], [0.22, 0.61], [0.36, 0.53], [0.44, 0.46], [0.46, 0.36],
        [0.41, 0.34], [0.37, 0.3], [0.39, 0.02], [0.32, 0.02], [0.31, 0.14], [0.29, 0.02],
        [0.22, 0.02], [0.21, 0.24], [0.05, 0.22], [-0.08, 0.22], [-0.12, 0.24], [-0.1, 0.02],
        [-0.17, 0.02], [-0.18, 0.14], [-0.2, 0.02], [-0.27, 0.02], [-0.26, 0.26], [-0.34, 0.3],
        [-0.42, 0.26], [-0.46, 0.2], [-0.48, 0.26],
      ],
      eye: [-0.4, 0.42, 0.022],
    },
    aurochs: {
      outline: [
        [-0.5, 0.4], [-0.5, 0.48], [-0.44, 0.56], [-0.42, 0.6], [-0.48, 0.72], [-0.42, 0.82],
        [-0.4, 0.7], [-0.36, 0.62], [-0.32, 0.7], [-0.28, 0.82], [-0.24, 0.7], [-0.26, 0.6],
        [-0.14, 0.64], [0.0, 0.68], [0.18, 0.64], [0.32, 0.6], [0.42, 0.58], [0.44, 0.2],
        [0.4, 0.2], [0.39, 0.5], [0.36, 0.36], [0.37, 0.02], [0.3, 0.02], [0.29, 0.16],
        [0.27, 0.02], [0.2, 0.02], [0.2, 0.32], [0.06, 0.3], [-0.08, 0.3], [-0.14, 0.32],
        [-0.12, 0.02], [-0.19, 0.02], [-0.2, 0.16], [-0.22, 0.02], [-0.29, 0.02], [-0.28, 0.32],
        [-0.38, 0.36], [-0.46, 0.36],
      ],
      eye: [-0.42, 0.52, 0.022],
    },
    vulture: {
      outline: [
        [-0.3, 0.72], [-0.34, 0.66], [-0.26, 0.64], [-0.22, 0.58], [-0.22, 0.44], [-0.2, 0.3],
        [-0.12, 0.24], [-0.12, 0.02], [-0.06, 0.02], [-0.06, 0.22], [0.04, 0.22], [0.04, 0.02],
        [0.1, 0.02], [0.1, 0.24], [0.16, 0.22], [0.26, 0.26], [0.24, 0.36], [0.3, 0.44],
        [0.44, 0.62], [0.5, 0.8], [0.46, 0.82], [0.4, 0.7], [0.38, 0.84], [0.34, 0.72],
        [0.32, 0.86], [0.28, 0.74], [0.24, 0.8], [0.2, 0.66], [0.12, 0.66], [0.02, 0.7],
        [-0.02, 0.86], [-0.06, 0.74], [-0.08, 0.88], [-0.12, 0.76], [-0.14, 0.86], [-0.18, 0.72],
        [-0.2, 0.78], [-0.22, 0.8], [-0.28, 0.8],
      ],
      eye: [-0.27, 0.73, 0.016],
    },
    crane: {
      outline: [
        [-0.4, 0.86], [-0.36, 0.9], [-0.26, 0.9], [-0.22, 0.84], [-0.18, 0.7], [-0.14, 0.6],
        [0.0, 0.62], [0.16, 0.58], [0.3, 0.52], [0.34, 0.44], [0.24, 0.4], [0.12, 0.34],
        [0.06, 0.32], [0.07, 0.02], [0.02, 0.02], [0.01, 0.3], [-0.04, 0.3], [-0.03, 0.02],
        [-0.08, 0.02], [-0.09, 0.32], [-0.14, 0.38], [-0.18, 0.48], [-0.22, 0.6], [-0.26, 0.72],
        [-0.3, 0.8], [-0.4, 0.83],
      ],
      eye: [-0.29, 0.86, 0.014],
    },
    snake: { outline: snakeOutline() },
    scorpion: {
      outline: [
        // Claws raised at the top, a segmented tail curling up on the right.
        [-0.34, 0.86], [-0.24, 0.9], [-0.2, 0.82], [-0.26, 0.78], [-0.16, 0.74], [-0.06, 0.76],
        [0.02, 0.82], [0.08, 0.92], [0.14, 0.86], [0.1, 0.76], [0.14, 0.66], [0.26, 0.6],
        [0.36, 0.5], [0.4, 0.36], [0.36, 0.22], [0.42, 0.14], [0.36, 0.08], [0.3, 0.18],
        [0.32, 0.34], [0.26, 0.46], [0.16, 0.52], [0.12, 0.44], [0.24, 0.38], [0.26, 0.32],
        [0.14, 0.36], [0.1, 0.3], [0.22, 0.24], [0.24, 0.18], [0.1, 0.22], [0.04, 0.2],
        [0.04, 0.02], [-0.02, 0.02], [-0.02, 0.2], [-0.1, 0.22], [-0.22, 0.18], [-0.2, 0.24],
        [-0.08, 0.3], [-0.12, 0.36], [-0.24, 0.32], [-0.22, 0.38], [-0.1, 0.44], [-0.14, 0.52],
        [-0.24, 0.5], [-0.24, 0.56], [-0.14, 0.6], [-0.2, 0.68], [-0.3, 0.72], [-0.38, 0.8],
      ],
    },
    symbol: {
      outline: [
        [-0.3, 0.0], [-0.3, 0.9], [-0.14, 0.9], [-0.14, 0.52], [0.14, 0.52], [0.14, 0.9],
        [0.3, 0.9], [0.3, 0.0], [0.14, 0.0], [0.14, 0.38], [-0.14, 0.38], [-0.14, 0.0],
      ],
    },
    gazelle: {
      outline: [
        [-0.44, 0.62], [-0.42, 0.68], [-0.36, 0.72], [-0.34, 0.74], [-0.28, 0.9], [-0.26, 0.92],
        [-0.3, 0.76], [-0.32, 0.74], [-0.22, 0.66], [-0.12, 0.6], [0.04, 0.6], [0.2, 0.58],
        [0.3, 0.54], [0.36, 0.5], [0.36, 0.42], [0.32, 0.44], [0.3, 0.36], [0.33, 0.02],
        [0.28, 0.02], [0.26, 0.22], [0.24, 0.02], [0.19, 0.02], [0.2, 0.34], [0.08, 0.36],
        [-0.06, 0.36], [-0.1, 0.36], [-0.08, 0.02], [-0.13, 0.02], [-0.14, 0.22], [-0.16, 0.02],
        [-0.21, 0.02], [-0.2, 0.36], [-0.26, 0.44], [-0.3, 0.56], [-0.38, 0.6],
      ],
      eye: [-0.38, 0.66, 0.018],
    },
  };

/** A small drilled circle, the way the carvers made an eye. */
function eyeHole(centre: [number, number], radius: number): Outline {
  const points: Outline = [];
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * TAU;
    points.push([centre[0] + Math.cos(a) * radius, centre[1] + Math.sin(a) * radius]);
  }
  return points;
}

/**
 * One animal, about `scale` metres long, on the plane through `base` whose
 * outward normal is `out`. Cut in the pillar's own limestone so it reads as
 * carved out of the stone rather than stuck onto it; each one is a few
 * degrees off level and a little different in size, the way hand-cut ones
 * are. `flip` turns the animal to face the other way, and `tilt` tips it over
 * in the face — the Pillar 18 fox is cut leaping head-first down the flank.
 */
function animalCarving(
  animal: Animal,
  base: Vec3,
  out: [number, number],
  seed: number,
  scale = 1,
  options: { flip?: boolean; tilt?: number } = {},
): Part[] {
  const shape = ANIMAL_SHAPES[animal];
  const random = seeded(seed);
  const size = scale * (0.92 + random() * 0.16);
  const mirror = options.flip ? -1 : 1;
  const lean = (random() - 0.5) * 0.08 + (options.tilt ?? 0);
  const scaled = (points: Outline): Outline =>
    points.map(([u, v]) => [u * size * mirror, v * size]);
  return [
    {
      kind: "carving",
      material: "limestone",
      at: base,
      outline: scaled(shape.outline),
      ...(shape.eye
        ? { holes: [scaled(eyeHole([shape.eye[0], shape.eye[1]], shape.eye[2]))] }
        : {}),
      // Flint chipped the ground back this far around the animal; a little
      // of the depth is sunk so the bevel runs into the bowed, weathered face.
      depth: 0.075,
      rotY: Math.atan2(out[0], out[1]),
      ...(lean ? { rotZ: lean } : {}),
    },
  ];
}

/* ------------------------------------------------------------------ *
 * A bronze horse and rider
 * ------------------------------------------------------------------ */

/**
 * A horse, built the way a sculptor builds one: as a skin lofted over the
 * animal's cross-sections. Rump, loin, barrel, girth and chest; a neck that
 * rises and thins to the poll; a head that tapers to the muzzle with pricked
 * ears; four legs with the joints a horse has — stifle, hock and fetlock
 * behind, elbow, knee and fetlock in front — and a tail falling from the
 * dock. The proportions are those of the Capitoline Marcus Aurelius, the one
 * Roman bronze horseman that survives whole: withers at about 1.5 m, the body
 * as long as it is tall, the near foreleg raised with the hoof hanging.
 *
 * The horse stands at `at` facing `-z` before `rotY` turns it, one unit of
 * `scale` being a life-sized animal. The mane is a serrated crest cut along
 * the neck; the rider is a bearded figure astride, arm out in address.
 */
export function horseStatue(
  material: Material,
  at: Vec3,
  rotY: number,
  scale = 1,
  raised: -1 | 1 = -1,
): Part[] {
  const parts: Part[] = [];
  const S = (c: Vec3, rx: number, ry: number): LoftSection => ({
    c: [c[0] * scale, c[1] * scale, c[2] * scale],
    rx: rx * scale,
    ry: ry * scale,
  });
  const skin = (sections: LoftSection[]) => parts.push(loft(material, at, rotY, sections));

  /*
   * The body, from the dock of the tail forward to the point of the breast:
   * the croup rounding down behind, the back dipping a little behind the
   * withers, the belly hanging lower than the girth, the chest deep and
   * narrow between the forelegs.
   */
  skin([
    S([0, 1.12, 0.86], 0.06, 0.08),
    S([0, 1.12, 0.78], 0.17, 0.2),
    S([0, 1.1, 0.62], 0.26, 0.3),
    S([0, 1.06, 0.42], 0.29, 0.34),
    S([0, 1.0, 0.2], 0.3, 0.38),
    S([0, 0.98, 0.0], 0.31, 0.4),
    S([0, 1.0, -0.22], 0.31, 0.39),
    S([0, 1.04, -0.44], 0.29, 0.38),
    S([0, 1.06, -0.62], 0.24, 0.36),
    S([0, 1.06, -0.78], 0.17, 0.3),
    S([0, 1.06, -0.9], 0.1, 0.2),
    S([0, 1.06, -0.95], 0.04, 0.08),
  ]);
  // The muscles that make a horse a horse rather than a tube: the shoulder
  // blade and the forearm on each side, and the great mass of the quarters.
  for (const side of [-1, 1]) {
    skin([
      S([side * 0.12, 1.32, -0.5], 0.06, 0.08),
      S([side * 0.2, 1.18, -0.62], 0.1, 0.16),
      S([side * 0.21, 0.98, -0.72], 0.1, 0.15),
      S([side * 0.19, 0.82, -0.7], 0.08, 0.1),
      S([side * 0.17, 0.74, -0.68], 0.04, 0.05),
    ]);
    skin([
      S([side * 0.1, 1.3, 0.36], 0.08, 0.1),
      S([side * 0.2, 1.22, 0.52], 0.13, 0.18),
      S([side * 0.21, 1.02, 0.6], 0.13, 0.19),
      S([side * 0.19, 0.82, 0.6], 0.1, 0.13),
      S([side * 0.17, 0.66, 0.62], 0.05, 0.06),
    ]);
  }
  // The neck, arched from the withers to the poll, thick at the base and
  // fine at the throat.
  skin([
    S([0, 1.14, -0.56], 0.22, 0.36),
    S([0, 1.32, -0.78], 0.2, 0.36),
    S([0, 1.52, -0.98], 0.17, 0.32),
    S([0, 1.72, -1.16], 0.14, 0.26),
    S([0, 1.88, -1.3], 0.115, 0.2),
    S([0, 1.98, -1.39], 0.1, 0.15),
    S([0, 2.03, -1.44], 0.09, 0.12),
  ]);
  /*
   * The head, lowered against the rein: the flat forehead, the long face
   * narrowing down the nose, the soft muzzle — and laid over it the round
   * plates of the cheek, the eyes set out at the side, the flared nostrils.
   */
  skin([
    S([0, 2.04, -1.4], 0.095, 0.13),
    S([0, 1.98, -1.49], 0.115, 0.18),
    S([0, 1.9, -1.58], 0.11, 0.17),
    S([0, 1.8, -1.68], 0.09, 0.13),
    S([0, 1.72, -1.77], 0.08, 0.11),
    S([0, 1.65, -1.85], 0.082, 0.1),
    S([0, 1.6, -1.91], 0.08, 0.092),
    S([0, 1.575, -1.95], 0.068, 0.075),
    S([0, 1.565, -1.97], 0.035, 0.04),
  ]);
  for (const side of [-1, 1]) {
    // The jowl.
    skin([
      S([side * 0.05, 1.92, -1.45], 0.03, 0.05),
      S([side * 0.07, 1.86, -1.52], 0.055, 0.12),
      S([side * 0.065, 1.81, -1.6], 0.045, 0.09),
      S([side * 0.04, 1.78, -1.68], 0.015, 0.03),
    ]);
    // The eye, and the bone ridge over it.
    skin([
      S([side * 0.085, 2.0, -1.55], 0.012, 0.02),
      S([side * 0.098, 2.0, -1.575], 0.02, 0.022),
      S([side * 0.09, 2.0, -1.6], 0.012, 0.016),
    ]);
    // The nostril, flared.
    skin([
      S([side * 0.045, 1.63, -1.88], 0.012, 0.015),
      S([side * 0.055, 1.62, -1.91], 0.026, 0.03),
      S([side * 0.045, 1.6, -1.95], 0.012, 0.016),
    ]);
  }
  // Ears pricked forward.
  for (const side of [-1, 1]) {
    skin([
      S([side * 0.06, 2.04, -1.42], 0.035, 0.025),
      S([side * 0.085, 2.14, -1.44], 0.025, 0.02),
      S([side * 0.1, 2.22, -1.46], 0.006, 0.006),
    ]);
  }
  // The forelock, falling between the ears onto the forehead.
  skin([
    S([0, 2.08, -1.42], 0.03, 0.02),
    S([0, 2.05, -1.5], 0.04, 0.02),
    S([0, 1.98, -1.56], 0.03, 0.015),
  ]);

  /*
   * The legs. Each has a forearm or gaskin full of muscle, a bony knee or
   * hock, a slender cannon, the knob of the fetlock, a short sloping
   * pastern and a hoof that flares to the ground.
   */
  const leg = (x: number, path: [Vec3, number, number][]) =>
    skin(path.map(([c, rx, ry]) => S([x + c[0], c[1], c[2]], rx * 1.15, ry * 1.12)));
  for (const side of [-1, 1]) {
    const x = side * 0.17;
    if (side === raised) {
      // The near foreleg lifted: knee brought up and forward, cannon hanging.
      leg(x, [
        [[0, 1.02, -0.66], 0.11, 0.14],
        [[0, 0.86, -0.78], 0.085, 0.1],
        [[0, 0.72, -0.92], 0.06, 0.07],
        [[0, 0.66, -0.98], 0.058, 0.066],
        [[0, 0.52, -0.97], 0.04, 0.05],
        [[0, 0.4, -0.93], 0.04, 0.05],
        [[0, 0.34, -0.9], 0.05, 0.058],
        [[0, 0.28, -0.84], 0.042, 0.048],
        [[0, 0.22, -0.82], 0.058, 0.064],
        [[0, 0.17, -0.81], 0.066, 0.07],
      ]);
    } else {
      leg(x, [
        [[0, 1.02, -0.64], 0.11, 0.14],
        [[0, 0.8, -0.67], 0.085, 0.1],
        [[0, 0.6, -0.68], 0.06, 0.07],
        [[0, 0.52, -0.68], 0.058, 0.068],
        [[0, 0.4, -0.67], 0.042, 0.052],
        [[0, 0.24, -0.66], 0.042, 0.05],
        [[0, 0.17, -0.665], 0.052, 0.06],
        [[0, 0.1, -0.69], 0.044, 0.05],
        [[0, 0.05, -0.71], 0.06, 0.066],
        [[0, 0.0, -0.72], 0.068, 0.074],
      ]);
    }
    const hx = side * 0.16;
    leg(hx, [
      [[0, 1.0, 0.44], 0.14, 0.17],
      [[0, 0.76, 0.56], 0.1, 0.13],
      [[0, 0.56, 0.68], 0.06, 0.09],
      [[0, 0.5, 0.7], 0.055, 0.08],
      [[0, 0.4, 0.64], 0.045, 0.055],
      [[0, 0.22, 0.6], 0.042, 0.05],
      [[0, 0.15, 0.59], 0.052, 0.06],
      [[0, 0.09, 0.6], 0.044, 0.05],
      [[0, 0.05, 0.6], 0.06, 0.066],
      [[0, 0.0, 0.6], 0.068, 0.074],
    ]);
  }
  // The tail: a thick dock, then the hair falling in three locks.
  skin([
    S([0, 1.12, 0.84], 0.05, 0.06),
    S([0, 1.06, 0.94], 0.07, 0.08),
    S([0, 0.94, 1.0], 0.08, 0.09),
  ]);
  for (const k of [-1, 0, 1]) {
    skin([
      S([k * 0.02, 0.96, 0.99], 0.04, 0.05),
      S([k * 0.04, 0.72, 1.03], 0.05, 0.05),
      S([k * 0.05, 0.48, 1.0 + k * 0.02], 0.04, 0.04),
      S([k * 0.05, 0.28, 0.96], 0.02, 0.02),
    ]);
  }

  // The mane, falling over the off side of the neck in heavy locks.
  for (let i = 0; i < 9; i += 1) {
    const t = i / 8;
    const z = -0.6 - t * 0.82;
    const y = 1.42 + t * 0.66 - t * t * 0.06;
    const fall = 0.2 - t * 0.08;
    skin([
      S([0.0, y + 0.04, z], 0.03, 0.03),
      S([0.07, y - fall * 0.4, z - 0.01], 0.045, 0.035),
      S([0.12, y - fall, z + 0.01], 0.025, 0.02),
    ]);
  }

  /*
   * The mane: a crest of clipped tufts standing along the top of the neck,
   * cut as one serrated silhouette in the plane of the neck. Its foot is
   * buried in the neck so it grows out of it rather than sitting on it.
   */
  const crest: [number, number][] = [
    [-0.56, 1.42],
    [-0.86, 1.68],
    [-1.08, 1.88],
    [-1.26, 2.02],
    [-1.4, 2.1],
    [-1.46, 2.13],
  ];
  const crestAt = (z: number) => {
    for (let i = 0; i < crest.length - 1; i += 1) {
      const [z0, y0] = crest[i]!;
      const [z1, y1] = crest[i + 1]!;
      if (z <= z0 && z >= z1) return y0 + ((z - z0) / (z1 - z0)) * (y1 - y0);
    }
    return z > crest[0]![0] ? crest[0]![1] : crest[crest.length - 1]![1];
  };
  const mane: [number, number][] = [];
  const tufts = 14;
  const zFrom = -0.58;
  const zTo = -1.44;
  // Along the top, one tuft after another; the outline's `u` runs towards
  // the head, which the carving's turn below maps onto the horse's `-z`.
  for (let i = 0; i <= tufts; i += 1) {
    const z = zFrom + ((zTo - zFrom) * i) / tufts;
    const tall = i % 2 === 0 ? 0.13 : 0.08;
    mane.push([-z * scale, (crestAt(z) + tall) * scale]);
  }
  // Then back along the foot, inside the neck.
  for (let i = tufts; i >= 0; i -= 1) {
    const z = zFrom + ((zTo - zFrom) * i) / tufts;
    mane.push([-z * scale, (crestAt(z) - 0.1) * scale]);
  }
  parts.push({
    kind: "carving",
    material,
    at,
    outline: mane,
    depth: 0.06 * scale,
    sink: 0.5,
    // A quarter turn lays the silhouette in the horse's own x = 0 plane.
    rotY: rotY + Math.PI / 2,
  });

  return parts;
}

/* ------------------------------------------------------------------ *
 * The sculpture of Nemrut Dağı: enthroned gods, eagles and lions
 * ------------------------------------------------------------------ */

/*
 * One workshop cut every figure on the terrace, out of the same local
 * limestone, in the same manner: big, simple, rounded masses, the forms
 * read from across the court rather than from arm's length. So the gods,
 * the eagles and the lions here are built the same way — every one of them
 * lofted from the same smooth skins, in the same stone, at one scale — and
 * none of them is a scan. A photographed marble lion of Delos beside a
 * lofted god read as two different sets, and that is not what stood here.
 *
 * Each builder works in its own frame — `+z` the way the statue looks, `y`
 * up, the origin on the surface it rests on — and every piece is turned by
 * `rotY` and moved to `at`, so a whole statue can be set down in one call.
 * The pieces carry `statue`, naming the figure they belong to, so the tests
 * can find a statue again in the flat list of parts.
 */

/** How high a colossus reaches above its seat, in heads: Zeus's tiara tip. */
export const NEMRUT_CROWN = 4.98;
/** How far below its seat a colossus's soles rest, in heads. */
export const NEMRUT_SOLE = 2.0;

/** The places a colossus's frame needs: lofts, rods and blocks, all turned together. */
function sculptor(material: Material, at: Vec3, rotY: number, unit: number, statue: string) {
  const parts: Part[] = [];
  const S = (x: number, y: number, z: number, rx: number, ry: number): LoftSection => ({
    c: [x * unit, y * unit, z * unit],
    rx: rx * unit,
    ry: ry * unit,
  });
  const skin = (sections: LoftSection[]) => {
    parts.push({ ...loft(material, at, rotY, sections), statue });
  };
  /** A small round mass — a curl, a fruit, a knuckle — as a three-ring loft. */
  const ball = (x: number, y: number, z: number, r: number, squash = 1) =>
    skin([
      S(x, y, z - r * 0.92, r * 0.35, r * 0.35 * squash),
      S(x, y, z, r, r * squash),
      S(x, y, z + r * 0.92, r * 0.35, r * 0.35 * squash),
    ]);
  /**
   * A straight rod from A to B in the statue's frame: a sceptre, a rod of the
   * barsom, the shaft of a club. A cylinder stood up, tipped by `rotX` and
   * turned by `rotY` — the only turns a cylinder part has — so its axis lands
   * on the line from A to B whatever the statue's own turn.
   */
  const rod = (a: Vec3, b: Vec3, r1: number, r2: number, segments = 8) => {
    const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const length = Math.hypot(d[0], d[1], d[2]);
    const tilt = Math.acos(Math.max(-1, Math.min(1, d[1] / length)));
    const turn = Math.atan2(d[0], d[2]);
    parts.push({
      ...cyl(
        material,
        placed(at, rotY, [a[0] * unit, a[1] * unit, a[2] * unit]),
        r1 * unit,
        r2 * unit,
        length * unit,
        segments,
        { rotX: tilt, rotY: rotY + turn },
      ),
      statue,
    });
  };
  return { parts, S, skin, ball, rod };
}

/**
 * One of the enthroned gods of the east terrace — or the king among them.
 *
 * The frame is the seat: the origin is on the throne under the middle of the
 * hips, and `unit` is the height of the head from chin to crown. The figure
 * is built to the proportions of the seated colossi themselves, which are a
 * heroic body's rather than a man's: the head about a seventh of the height
 * the figure would stand, shoulders two heads across, thighs level along the
 * throne, the shins straight down to the footstool two heads below the seat,
 * and both hands laid on the knees — the hieratic pose, the one every figure
 * on the terrace shares — unless they hold the god's attribute.
 *
 * The heads are what the terrace is famous for, and what tells one god from
 * the next: a broad, smooth face with heavy-lidded almond eyes under a ridge
 * of brow, a straight nose, full lips; a beard for Zeus and for Herakles and
 * none for the king or for Apollo; and over it the headdress — the king's
 * Armenian tiara with its five points, Zeus's tall Persian cap, Apollo's
 * Phrygian cap with its peak bent forward, the goddess's basket of fruit,
 * and nothing on Herakles but his curls. Every cap has the lappets that hang
 * down beside the face and over the neck.
 *
 * Read from across the court, a colossus is about fifteen thousand
 * triangles: enough for the forms to turn smoothly in a raking light, few
 * enough that five of them, two eagles and two lions are lighter together
 * than one of the scans they replace.
 */
export function nemrutColossus(
  material: Material,
  at: Vec3,
  rotY: number,
  unit: number,
  identity: FigureIdentity,
): Part[] {
  const { parts, S, skin, ball, rod } = sculptor(material, at, rotY, unit, identity.name);
  const male = identity.sex !== "female";
  const broad = male ? 1 : 0.88;

  /*
   * The body, seated upright: hips on the throne, a long column of trunk
   * swelling to the chest, and the shoulders square and heavy — the cloth
   * of the tunic is read in the masses, not in folds.
   */
  skin([
    S(0, 0.04, -0.05, 0.8 * broad, 0.54),
    S(0, 0.6, 0.0, 0.74 * broad, 0.5),
    S(0, 1.2, 0.05, 0.8 * broad, 0.52),
    S(0, 1.75, 0.05, 0.92 * broad, 0.55),
    S(0, 2.18, -0.02, 1.0 * broad, 0.5),
    S(0, 2.36, -0.03, 0.84 * broad, 0.45),
    S(0, 2.48, -0.04, 0.45 * broad, 0.32),
  ]);
  // The neck, into the head.
  const slim = male ? 1 : 0.85;
  skin([
    S(0, 2.3, 0.0, 0.34 * slim, 0.31 * slim),
    S(0, 2.62, 0.03, 0.28 * slim, 0.26 * slim),
    S(0, 2.94, 0.05, 0.23 * slim, 0.22 * slim),
  ]);
  if (!male) {
    // The breasts under the chiton.
    for (const side of [-1, 1]) ball(side * 0.33, 1.72, 0.48, 0.24, 0.9);
  }
  /*
   * The legs. Thighs level along the throne, a little apart; the lap of the
   * garment sagging between them; the shins straight down to the footstool
   * with the hem flaring over the ankles; and between the shins the fall of
   * the cloth, set back from them so the legs read through it.
   */
  for (const side of [-1, 1]) {
    skin([
      S(side * 0.42, 0.42, -0.1, 0.44, 0.42),
      S(side * 0.48, 0.39, 1.3, 0.39, 0.36),
      S(side * 0.5, 0.35, 1.92, 0.28, 0.28),
    ]);
    skin([
      S(side * 0.52, 0.46, 1.9, 0.31, 0.32),
      S(side * 0.52, -1.6, 2.0, 0.26, 0.26),
      S(side * 0.53, -1.94, 2.0, 0.32, 0.3),
    ]);
    // The foot, its toes coming out under the hem onto the footstool.
    skin([
      S(side * 0.54, -1.88, 1.95, 0.17, 0.12),
      S(side * 0.57, -1.9, 2.32, 0.19, 0.1),
      S(side * 0.6, -1.94, 2.62, 0.09, 0.04),
      S(side * 0.6, -1.95, 2.66, 0.02, 0.01),
    ]);
  }
  skin([S(0, 0.58, 0.25, 0.4, 0.18), S(0, 0.48, 1.2, 0.34, 0.15), S(0, 0.4, 1.78, 0.28, 0.12)]);
  skin([S(0, 0.3, 1.86, 0.3, 0.1), S(0, -1.0, 1.92, 0.28, 0.08), S(0, -1.95, 1.95, 0.36, 0.1)]);
  // Three folds down the fall between the shins.
  for (const x of [-0.14, 0, 0.14]) rod([x, -1.95, 2.02], [x * 0.8, 0.2, 1.97], 0.045, 0.03, 6);

  /*
   * The mantle: a heavy roll of cloth from the left shoulder across the chest
   * to the right hip, the one line of drapery the sculptors of Nemrut cut on
   * every god.
   */
  skin([
    S(-0.78, 2.3, 0.12, 0.17, 0.15),
    S(-0.32, 1.85, 0.5, 0.16, 0.14),
    S(0.32, 1.18, 0.56, 0.15, 0.13),
    S(0.78, 0.66, 0.36, 0.15, 0.13),
  ]);

  /*
   * The arms: each one a single skin from the shoulder through the elbow to
   * the wrist, so the bend is smooth, and a broad hand at the end of it laid
   * over the knee — or closed round what the god holds.
   */
  const arm = (side: number, wrist: Vec3, elbow: Vec3) =>
    skin([
      S(side * 0.98 * broad, 2.16, -0.02, 0.33, 0.33),
      S(side * 1.07 * broad, 1.6, 0.0, 0.29, 0.29),
      S(elbow[0], elbow[1], elbow[2], 0.25, 0.25),
      S(wrist[0], wrist[1], wrist[2], 0.17, 0.15),
    ]);
  const handOnKnee = (side: number) => {
    arm(side, [side * 0.62, 0.86, 1.52], [side * 1.08, 1.0, 0.25]);
    skin([
      S(side * 0.6, 0.84, 1.55, 0.18, 0.1),
      S(side * 0.58, 0.8, 1.85, 0.2, 0.08),
      S(side * 0.56, 0.7, 2.1, 0.17, 0.06),
    ]);
  };
  /** A fist, closed round a shaft standing at `grip`. */
  const fistAt = (side: number, grip: Vec3) => {
    arm(side, [grip[0] - side * 0.12, grip[1], grip[2] - 0.22], [side * 1.12, 1.05, 0.3]);
    ball(grip[0], grip[1], grip[2], 0.2, 0.95);
  };

  const right = identity.right;
  const left = identity.left;
  if (right === "sceptre") {
    // The sceptre stands on the footstool outside the right knee.
    const grip: Vec3 = [0.98, 1.0, 1.72];
    fistAt(1, grip);
    rod([0.98, -1.98, 1.78], [0.98, 2.75, 1.68], 0.07, 0.06);
    ball(0.98, 2.82, 1.68, 0.12);
  } else if (right === "club") {
    // Herakles's club, its heavy end on the footstool, the grip under his hand.
    const grip: Vec3 = [0.98, 0.95, 1.7];
    fistAt(1, grip);
    skin([
      S(0.98, -1.95, 1.95, 0.24, 0.24),
      S(0.98, -1.2, 1.9, 0.22, 0.22),
      S(0.98, 0.0, 1.8, 0.15, 0.15),
      S(0.98, 1.2, 1.68, 0.1, 0.1),
    ]);
    // The knots where the branches were lopped off.
    for (const [y, a] of [
      [-1.5, 0.4],
      [-0.9, 2.6],
      [-0.3, 4.4],
    ] as const)
      ball(0.98 + Math.sin(a) * 0.21, y, 1.9 + Math.cos(a) * 0.21, 0.07);
  } else if (right === "wheat") {
    handOnKnee(1);
    // Ears of wheat held in the hand on the knee, leaning out over it.
    for (const lean of [-0.12, 0, 0.12])
      rod([0.6, 0.8, 1.9], [0.78 + lean, 1.75, 2.05 + lean], 0.025, 0.02, 5);
  } else {
    handOnKnee(1);
  }
  if (left === "barsom") {
    // The barsom: a bundle of rods held in the hand on the knee, against the chest.
    handOnKnee(-1);
    for (const [dx, dz] of [
      [0, 0],
      [0.07, 0.05],
      [-0.07, 0.05],
      [0.04, -0.06],
      [-0.04, -0.06],
    ] as const)
      rod([-0.62 + dx, 0.72, 1.85 + dz], [-0.48 + dx, 2.05, 0.92 + dz], 0.035, 0.035, 5);
  } else if (left === "cornucopia") {
    // The horn of plenty in the crook of her left arm, heaped with fruit.
    handOnKnee(-1);
    skin([
      S(-0.6, 0.86, 1.62, 0.07, 0.07),
      S(-0.75, 1.45, 1.35, 0.13, 0.13),
      S(-0.92, 2.15, 1.0, 0.2, 0.2),
      S(-1.0, 2.6, 0.82, 0.27, 0.27),
    ]);
    for (const [dx, dz] of [
      [0, 0],
      [0.14, 0.08],
      [-0.1, -0.1],
    ] as const)
      ball(-1.0 + dx, 2.72, 0.82 + dz, 0.13);
  } else {
    handOnKnee(-1);
  }

  /*
   * The head. One skin from the chin to the crown, its front flattened into
   * the broad face of the Nemrut heads; then the features laid onto it — the
   * ridge of the brow, the almond eyes beneath it, the straight nose, the
   * lips — each a small skin of its own.
   */
  skin([
    S(0, 2.9, 0.3, 0.14 * slim, 0.12),
    S(0, 3.0, 0.17, 0.28 * slim, 0.3),
    S(0, 3.25, 0.12, 0.37 * (male ? 1 : 0.95), 0.4),
    S(0, 3.5, 0.08, 0.4, 0.44),
    S(0, 3.72, 0.04, 0.39, 0.44),
    S(0, 3.88, 0.0, 0.31, 0.37),
    S(0, 3.97, -0.02, 0.12, 0.15),
  ]);
  skin([S(0, 3.52, 0.49, 0.06, 0.05), S(0, 3.32, 0.58, 0.08, 0.07), S(0, 3.2, 0.6, 0.07, 0.05)]);
  for (const side of [-1, 1])
    skin([
      S(side * 0.03, 3.56, 0.52, 0.03, 0.03),
      S(side * 0.15, 3.585, 0.5, 0.045, 0.04),
      S(side * 0.3, 3.55, 0.41, 0.025, 0.025),
    ]);
  for (const side of [-1, 1]) {
    skin([
      S(side * 0.07, 3.46, 0.47, 0.035, 0.035),
      S(side * 0.16, 3.46, 0.49, 0.055, 0.05),
      S(side * 0.26, 3.47, 0.44, 0.035, 0.035),
    ]);
  }
  skin([
    S(-0.09, 3.1, 0.45, 0.015, 0.014),
    S(0, 3.1, 0.47, 0.03, 0.022),
    S(0.09, 3.1, 0.45, 0.015, 0.014),
  ]);
  if (identity.bearded) {
    // The beard, from the cheeks over the chin and down onto the chest, and
    // the moustache over the lips.
    skin([
      S(0, 3.24, 0.24, 0.41, 0.28),
      S(0, 2.98, 0.32, 0.37, 0.3),
      S(0, 2.72, 0.36, 0.28, 0.24),
      S(0, 2.5, 0.36, 0.13, 0.12),
    ]);
    skin([
      S(-0.2, 3.13, 0.44, 0.035, 0.035),
      S(0, 3.17, 0.53, 0.05, 0.04),
      S(0.2, 3.13, 0.44, 0.035, 0.035),
    ]);
  }

  /*
   * The headdress. Every cap sits on the brow and covers the back of the
   * head, and the Persian ones have lappets falling beside the face to the
   * shoulders and a neck-guard behind.
   */
  const lappets = () => {
    for (const side of [-1, 1]) {
      skin([
        S(side * 0.42, 3.62, 0.0, 0.07, 0.3),
        S(side * 0.45, 3.0, -0.06, 0.07, 0.32),
        S(side * 0.52, 2.5, -0.06, 0.06, 0.3),
      ]);
    }
    skin([
      S(0, 3.62, -0.36, 0.4, 0.08),
      S(0, 3.0, -0.42, 0.44, 0.09),
      S(0, 2.55, -0.42, 0.48, 0.08),
    ]);
  };
  switch (identity.headgear) {
    case "armenianTiara": {
      // The king's tiara: upright, flat-topped, with five points round its crown.
      skin([
        S(0, 3.58, 0.0, 0.45, 0.48),
        S(0, 4.0, -0.02, 0.46, 0.48),
        S(0, 4.55, -0.04, 0.48, 0.5),
        S(0, 4.62, -0.04, 0.4, 0.42),
      ]);
      for (let i = 0; i < 5; i += 1) {
        const a = -Math.PI / 2 + (i * Math.PI) / 4;
        const p: Vec3 = [Math.sin(a) * 0.4, 4.5, -0.04 + Math.cos(a) * 0.42];
        rod(p, [p[0], 4.95, p[2]], 0.13, 0.0, 8);
      }
      lappets();
      break;
    }
    case "persianTiara": {
      // Zeus's cap: tall and rounded, its tip leaning a little forward.
      skin([
        S(0, 3.58, 0.0, 0.46, 0.49),
        S(0, 4.1, -0.02, 0.47, 0.49),
        S(0, 4.55, 0.02, 0.4, 0.42),
        S(0, 4.85, 0.1, 0.24, 0.25),
        S(0, 4.98, 0.16, 0.08, 0.08),
      ]);
      lappets();
      break;
    }
    case "phrygianCap": {
      // Apollo's soft cap, its peak bent forward over the brow.
      skin([
        S(0, 3.58, 0.0, 0.45, 0.48),
        S(0, 4.0, 0.0, 0.44, 0.46),
        S(0, 4.32, 0.1, 0.3, 0.32),
        S(0, 4.48, 0.3, 0.15, 0.16),
        S(0, 4.42, 0.46, 0.05, 0.05),
      ]);
      lappets();
      break;
    }
    case "polos": {
      // The goddess's basket-crown, heaped with fruit, over long hair.
      skin([
        S(0, 3.7, -0.15, 0.42, 0.3),
        S(0, 3.2, -0.3, 0.47, 0.26),
        S(0, 2.65, -0.34, 0.52, 0.2),
        S(0, 2.38, -0.3, 0.46, 0.12),
      ]);
      skin([
        S(0, 3.62, -0.02, 0.41, 0.45),
        S(0, 4.05, -0.02, 0.45, 0.48),
        S(0, 4.32, -0.02, 0.5, 0.52),
        S(0, 4.36, -0.02, 0.44, 0.46),
      ]);
      for (let i = 0; i < 4; i += 1) {
        const a = (i / 4) * TAU + Math.PI / 4;
        ball(Math.sin(a) * 0.26, 4.42, -0.02 + Math.cos(a) * 0.28, 0.16);
      }
      ball(0, 4.55, -0.02, 0.18);
      break;
    }
    default: {
      // Bare-headed: a cap of short curls, ringed with a row of them over the brow.
      skin([
        S(0, 3.5, -0.03, 0.43, 0.46),
        S(0, 3.78, 0.0, 0.42, 0.46),
        S(0, 3.95, -0.02, 0.33, 0.38),
        S(0, 4.04, -0.04, 0.12, 0.15),
      ]);
      for (let i = 0; i < 5; i += 1) {
        const a = -1.1 + (i * 2.2) / 4;
        ball(Math.sin(a) * 0.4, 3.72, 0.0 + Math.cos(a) * 0.44, 0.1);
      }
      break;
    }
  }
  return parts;
}

/**
 * A lion seated upright on its haunches, the guardian at each end of the
 * row, looking straight out over the court: a deep chest, long straight
 * forelegs ending in heavy paws with the toes cut, the haunches bunched at
 * its sides and the tail curled round onto the base. The head is the lion of
 * Commagene's own sculptors — a long muzzle ending in a flat nose, a heavy
 * brow, the line of the closed jaw — and round it the mane, cut as rows of
 * stiff flame-shaped locks that frame the face and fall over the chest.
 * `size` is its height from the base to the top of the mane.
 */
export function nemrutLion(material: Material, at: Vec3, rotY: number, size: number): Part[] {
  const { parts, S, skin, rod } = sculptor(material, at, rotY, size, "Lion");
  /** One lock of the mane: a flame from its root to its point. */
  const lock = (from: Vec3, to: Vec3, r: number, swell = true) =>
    skin([
      S(from[0], from[1], from[2], r, r * 0.85),
      ...(swell
        ? [S((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2, r * 0.8, r * 0.7)]
        : []),
      S(to[0], to[1], to[2], r * 0.2, r * 0.18),
    ]);
  for (const side of [-1, 1]) {
    // The haunch, bunched at the side, and the hind paw forward beside it.
    skin([
      S(side * 0.15, 0.15, -0.26, 0.08, 0.09),
      S(side * 0.165, 0.18, -0.1, 0.12, 0.17),
      S(side * 0.16, 0.14, 0.05, 0.1, 0.12),
      S(side * 0.15, 0.07, 0.11, 0.05, 0.06),
    ]);
    skin([
      S(side * 0.19, 0.035, 0.04, 0.05, 0.035),
      S(side * 0.2, 0.03, 0.18, 0.055, 0.03),
      S(side * 0.2, 0.025, 0.215, 0.02, 0.01),
    ]);
    // The foreleg, long and straight, and the paw with its four toes.
    skin([
      S(side * 0.085, 0.58, 0.11, 0.065, 0.08),
      S(side * 0.085, 0.38, 0.15, 0.05, 0.06),
      S(side * 0.085, 0.12, 0.17, 0.042, 0.05),
      S(side * 0.085, 0.04, 0.175, 0.05, 0.05),
    ]);
    skin([S(side * 0.085, 0.032, 0.14, 0.055, 0.032), S(side * 0.085, 0.03, 0.235, 0.06, 0.03)]);
    for (let toe = 0; toe < 4; toe += 1) {
      const x = side * 0.085 + (toe - 1.5) * 0.028;
      rod([x, 0.022, 0.225], [x, 0.016, 0.27], 0.017, 0.013, 6);
    }
  }
  // The body, from the rump on the base up to the deep chest.
  skin([
    S(0, 0.15, -0.22, 0.15, 0.14),
    S(0, 0.3, -0.12, 0.17, 0.18),
    S(0, 0.48, 0.0, 0.16, 0.2),
    S(0, 0.64, 0.05, 0.13, 0.15),
  ]);
  // The ruff the locks grow from, round the neck and behind the head.
  skin([
    S(0, 0.56, 0.04, 0.15, 0.13),
    S(0, 0.72, 0.05, 0.21, 0.17),
    S(0, 0.9, 0.03, 0.2, 0.16),
    S(0, 0.99, 0.0, 0.03, 0.03),
  ]);
  // Two rings of locks round the face, the outer ones longer.
  for (let i = 0; i < 11; i += 1) {
    const a = -2.7 + (i * 5.4) / 10;
    const c = 0.81;
    lock(
      [Math.sin(a) * 0.15, c + Math.cos(a) * 0.15, 0.18],
      [Math.sin(a) * 0.23, c + Math.cos(a) * 0.23, 0.12],
      0.06,
    );
  }
  for (let i = 0; i < 8; i += 1) {
    const a = -2.45 + (i * 4.9) / 7;
    const c = 0.8;
    lock(
      [Math.sin(a) * 0.2, c + Math.cos(a) * 0.2, 0.08],
      [Math.sin(a) * 0.29, c + Math.cos(a) * 0.29, 0.0],
      0.075,
      false,
    );
  }
  // And the locks falling down over the chest.
  for (const [x, y] of [
    [-0.08, 0.64],
    [0.08, 0.64],
    [0, 0.6],
  ] as const)
    lock([x, y, 0.16], [x * 1.1, y - 0.08, 0.185], 0.06);
  // The head: the skull, narrowing to the long muzzle and its flat nose.
  skin([
    S(0, 0.84, 0.1, 0.12, 0.12),
    S(0, 0.85, 0.18, 0.12, 0.11),
    S(0, 0.83, 0.25, 0.1, 0.09),
    S(0, 0.8, 0.32, 0.075, 0.07),
    S(0, 0.79, 0.38, 0.065, 0.058),
    S(0, 0.792, 0.402, 0.05, 0.04),
    S(0, 0.795, 0.412, 0.025, 0.018),
  ]);
  // The bridge of the nose, and the lower jaw closed under the muzzle.
  skin([
    S(0, 0.875, 0.24, 0.035, 0.03),
    S(0, 0.84, 0.38, 0.03, 0.025),
    S(0, 0.83, 0.41, 0.026, 0.02),
  ]);
  skin([
    S(0, 0.735, 0.2, 0.07, 0.04),
    S(0, 0.74, 0.33, 0.055, 0.035),
    S(0, 0.748, 0.375, 0.03, 0.02),
  ]);
  // The heavy brow, an arch over each eye, and the small round ears.
  for (const side of [-1, 1]) {
    skin([
      S(side * 0.015, 0.885, 0.275, 0.022, 0.02),
      S(side * 0.06, 0.9, 0.27, 0.03, 0.03),
      S(side * 0.11, 0.885, 0.22, 0.02, 0.02),
    ]);
    skin([S(side * 0.1, 0.95, 0.14, 0.04, 0.035), S(side * 0.11, 0.97, 0.17, 0.008, 0.008)]);
  }
  // The tail, round the right flank and onto the base, its tuft forward.
  skin([
    S(0.15, 0.06, -0.3, 0.03, 0.03),
    S(0.27, 0.035, -0.12, 0.026, 0.026),
    S(0.28, 0.035, 0.08, 0.024, 0.024),
    S(0.26, 0.045, 0.17, 0.045, 0.04),
    S(0.25, 0.045, 0.21, 0.008, 0.008),
  ]);
  return parts;
}

/**
 * An eagle standing tall and upright with its wings folded, the bird that
 * guards the rows of gods: the breast a keel tapering down to the legs, a
 * ruff of feathers round the neck, and the head turned aside to show the
 * short beak hooked sharply down under a jutting brow. The wings lie folded
 * down the flanks, their flight feathers stepped along the lower edge and
 * crossing behind over a fanned tail that rests on the base; the legs are
 * feathered to the ankle and the talons grip the front edge of the base.
 * `size` is its height from the base to the crown of the head.
 */
export function nemrutEagle(material: Material, at: Vec3, rotY: number, size: number): Part[] {
  const { parts, S, skin, rod } = sculptor(material, at, rotY, size, "Eagle");
  /** A tapering feather, from its root to its tip. */
  const feather = (from: Vec3, to: Vec3, w: number, t: number) =>
    skin([S(from[0], from[1], from[2], w, t), S(to[0], to[1], to[2], w * 0.15, t * 0.5)]);
  // The breast, a keel tapering down, and the ridge of the keel itself.
  skin([
    S(0, 0.2, -0.06, 0.07, 0.08),
    S(0, 0.36, -0.01, 0.1, 0.12),
    S(0, 0.56, 0.05, 0.125, 0.16),
    S(0, 0.7, 0.06, 0.115, 0.15),
    S(0, 0.8, 0.05, 0.075, 0.09),
  ]);
  skin([S(0, 0.34, 0.08, 0.03, 0.03), S(0, 0.54, 0.17, 0.04, 0.035), S(0, 0.7, 0.17, 0.03, 0.025)]);
  // The ruff of neck feathers.
  for (let i = 0; i < 9; i += 1) {
    const a = -2.4 + (i * 4.8) / 8;
    feather(
      [Math.sin(a) * 0.07, 0.83, 0.05 + Math.cos(a) * 0.075],
      [Math.sin(a) * 0.1, 0.75, 0.05 + Math.cos(a) * 0.105],
      0.04,
      0.025,
    );
  }
  /*
   * The head, turned a third of the way to its right: the skull, the brow
   * jutting over each eye, and the beak — short, deep at the root, and
   * hooked sharply down at the tip.
   */
  const turn = 0.6;
  const big = 1.3;
  const along = (t: number, y: number, across = 0): Vec3 => [
    (Math.sin(turn) * t + Math.cos(turn) * across) * big,
    0.84 + (y - 0.84) * big,
    0.05 + (Math.cos(turn) * t - Math.sin(turn) * across) * big,
  ];
  const H = (t: number, y: number, rx: number, ry: number, across = 0) => {
    const [x, yy, z] = along(t, y, across);
    return S(x, yy, z, rx * big, ry * big);
  };
  skin([
    H(-0.07, 0.875, 0.045, 0.045),
    H(-0.02, 0.888, 0.072, 0.07),
    H(0.05, 0.888, 0.068, 0.064),
    H(0.11, 0.878, 0.052, 0.054),
  ]);
  skin([
    H(0.09, 0.876, 0.05, 0.056),
    H(0.155, 0.872, 0.04, 0.046),
    H(0.2, 0.86, 0.028, 0.035),
    H(0.224, 0.836, 0.016, 0.021),
    H(0.224, 0.81, 0.004, 0.006),
  ]);
  for (const side of [-1, 1])
    skin([H(-0.01, 0.915, 0.02, 0.018, side * 0.05), H(0.09, 0.905, 0.006, 0.006, side * 0.035)]);

  for (const side of [-1, 1]) {
    /*
     * The folded wing, lying close down the flank from the shoulder, its tip
     * crossing behind the tail; a ridge where the coverts end, and below it
     * the stepped primaries.
     */
    skin([
      S(side * 0.095, 0.82, -0.02, 0.035, 0.05),
      S(side * 0.13, 0.72, -0.02, 0.045, 0.09),
      S(side * 0.14, 0.52, -0.06, 0.04, 0.1),
      S(side * 0.1, 0.3, -0.13, 0.03, 0.07),
      S(side * 0.02, 0.15, -0.22, 0.018, 0.04),
      S(-side * 0.04, 0.08, -0.27, 0.006, 0.01),
    ]);
    skin([
      S(side * 0.16, 0.52, 0.09, 0.015, 0.018),
      S(side * 0.175, 0.48, -0.02, 0.02, 0.022),
      S(side * 0.155, 0.44, -0.13, 0.012, 0.015),
    ]);
    for (let k = 0; k < 4; k += 1)
      feather(
        [side * 0.15, 0.42 - k * 0.04, 0.07 - k * 0.055],
        [side * (0.12 - k * 0.025), 0.25 - k * 0.035, -0.02 - k * 0.06],
        0.022,
        0.035,
      );
    // The leg, feathered to the ankle, and the talons over the base's edge.
    skin([
      S(side * 0.06, 0.27, 0.0, 0.065, 0.07),
      S(side * 0.065, 0.13, 0.03, 0.055, 0.06),
      S(side * 0.06, 0.07, 0.05, 0.03, 0.032),
    ]);
    rod([side * 0.06, 0.07, 0.05], [side * 0.06, 0.03, 0.07], 0.022, 0.02, 6);
    for (const k of [-1, 0, 1]) {
      const tip: Vec3 = [side * 0.06 + k * 0.035, 0.008, 0.165];
      rod([side * 0.06, 0.025, 0.07], tip, 0.018, 0.014, 6);
      rod(tip, [tip[0], -0.03, tip[2] + 0.012], 0.013, 0.006, 6);
    }
    rod([side * 0.06, 0.025, 0.07], [side * 0.06, 0.01, 0.0], 0.016, 0.01, 6);
  }
  // The tail, fanned out behind and resting its tip on the base.
  skin([
    S(0, 0.22, -0.13, 0.05, 0.03),
    S(0, 0.1, -0.22, 0.09, 0.022),
    S(0, 0.012, -0.29, 0.12, 0.012),
  ]);
  return parts;
}

/* ------------------------------------------------------------------ *
 * A two-storey Roman façade, and the hall behind it
 * ------------------------------------------------------------------ */

/**
 * The façade faces the viewer down -z; the building runs back into +z.
 *
 * Laid out from photographs of the re-erected front rather than from a
 * generic idea of a Roman façade, because this one is specific and famous:
 *
 * - four aediculae below, each a pair of columns on one tall shared pedestal,
 *   with a statue standing in the niche the pair frames;
 * - three doorways in the bays between them, the middle one wider;
 * - an entablature that breaks forward over every pair, so the front is a row
 *   of projections and recesses rather than a flat wall;
 * - four more aediculae above, set half a step inwards, framing three large
 *   windows — the windows are upstairs, not down;
 * - three pediments over those windows, the middle triangular and the outer
 *   two segmental, all of them broken.
 *
 * The columns are smooth, not fluted: these are Roman monolithic shafts.
 * The hall behind stops at the height its masonry actually survives to.
 */
/** The four virtues' bases at the Library of Celsus, by the statue they carry. */
const VIRTUE_BASES: Record<string, EpigraphicText> = {
  Sophia: TEXTS.celsusSophia,
  Arete: TEXTS.celsusArete,
  Ennoia: TEXTS.celsusEnnoia,
  Episteme: TEXTS.celsusEpisteme,
};

export function romanFacadeParts(spec: RomanFacadeSpec): Part[] {
  /*
   * Celsus and Aquila above are lost, and so are two of the virtues below.
   * Each empty place takes a different real statue of the period, so the
   * front does not repeat one figure four times.
   */
  const upperStandIns: ScanId[] = [
    "tiberius-velatus",
    "arringatore",
    "ephesus-portrait",
    "augustus",
  ];
  let upperIndex = 0;
  const parts: Part[] = [];
  const w = spec.facadeWidth;
  const stepRise = 0.18;
  const stepTread = 0.44;
  const podium = spec.steps * stepRise;
  const depth = spec.porchDepth + spec.hallDepth + 1.4;
  const wallDepth = 0.7;

  // Nine steps the full width of the building, each one a slab under the last.
  for (let i = 0; i < spec.steps; i += 1) {
    const run = (spec.steps - i) * stepTread;
    parts.push(box("marbleWorn", [0, i * stepRise, -run / 2], [w, stepRise, run]));
  }
  // The podium the hall stands on, starting where the top step ends. Run
  // 1.4 m further forward, it swallowed the top two treads and left the
  // ninth step a 54 cm riser.
  parts.push(box("marbleWorn", [0, 0, depth / 2], [w + 1.4, podium, depth]));

  const y0 = podium;

  /* The bay rhythm across 21 m: four aediculae 3.2 m wide, two side bays of
     2.4 m and a middle bay of 3.2 m. */
  const aediculaWidth = w * 0.152;
  const sideBay = w * 0.114;
  const middleBay = w * 0.152;
  const aediculaCentres = [
    -(middleBay / 2 + aediculaWidth + sideBay + aediculaWidth / 2),
    -(middleBay / 2 + aediculaWidth / 2),
    middleBay / 2 + aediculaWidth / 2,
    middleBay / 2 + aediculaWidth + sideBay + aediculaWidth / 2,
  ];
  const bays = [
    { centre: -(middleBay / 2 + aediculaWidth + sideBay / 2), width: sideBay },
    { centre: 0, width: middleBay },
    { centre: middleBay / 2 + aediculaWidth + sideBay / 2, width: sideBay },
  ];

  const lowerTop = y0 + spec.lowerOrderHeight;
  const upperHeight = spec.facadeHeight - spec.lowerOrderHeight;

  /* The wall behind, built as piers so the doorways are holes rather than
     dark paint. Doors below, windows above: the reading room was lit from the
     upper storey, and the ground floor carried carved panels instead. */
  const doorHeight = spec.lowerOrderHeight * 0.56;
  const windowBase = lowerTop + upperHeight * 0.22;
  const windowHeight = upperHeight * 0.46;

  const wallCourse = (
    base: number,
    height: number,
    openings: { centre: number; width: number; open?: boolean }[],
  ) => {
    let cursor = -w / 2;
    for (const opening of openings) {
      const from = opening.centre - opening.width / 2;
      const to = opening.centre + opening.width / 2;
      if (from > cursor) {
        parts.push(
          box(
            "marble",
            [(cursor + from) / 2, base, wallDepth / 2],
            [from - cursor, height, wallDepth],
          ),
        );
      }
      // The reveal at the back of the opening, which is what gives a doorway
      // depth when you cannot cut a hole in a box — except where the door
      // stands open and the hall behind is there to be seen.
      if (!opening.open) {
        parts.push(
          box("shadow", [opening.centre, base, wallDepth - 0.06], [opening.width, height, 0.12]),
        );
      }
      cursor = to;
    }
    parts.push(
      box(
        "marble",
        [(cursor + w / 2) / 2, base, wallDepth / 2],
        [w / 2 - cursor, height, wallDepth],
      ),
    );
  };

  // The middle door stands open: the hall with its book cupboards and its
  // Athena is built, and shut doors left a walker on the top step with no way
  // in to it.
  const doors = bays.map((bay) => ({
    centre: bay.centre,
    width: bay.width * 0.72,
    open: bay.centre === 0,
  }));
  wallCourse(y0, doorHeight, doors);

  /*
   * Timber doors in the three openings, panelled and studded. The library shut
   * at night like any other building, and a black hole where a door belongs is
   * the detail that most makes a reconstruction look unfinished.
   */
  for (const door of doors) {
    const leaf = door.width / 2 - 0.04;
    if (door.open) {
      // Swung back into the vestibule, flat against the reveals.
      for (const side of [-1, 1]) {
        parts.push(
          box(
            "timber",
            [door.centre + side * (door.width / 2 - 0.06), y0, wallDepth + leaf / 2],
            [leaf, doorHeight, 0.1],
            Math.PI / 2,
          ),
        );
      }
      continue;
    }
    for (const side of [-1, 1]) {
      const cx = door.centre + side * (leaf / 2 + 0.02);
      parts.push(box("timber", [cx, y0, wallDepth - 0.14], [leaf, doorHeight, 0.1]));
      // Two sunk panels per leaf, and the frame that holds them.
      for (let panel = 0; panel < 2; panel += 1) {
        parts.push(
          box(
            "timber",
            [cx, y0 + 0.25 + panel * (doorHeight * 0.46), wallDepth - 0.2],
            [leaf * 0.68, doorHeight * 0.38, 0.06],
          ),
        );
      }
      parts.push(
        box(
          "paintGold",
          [cx - side * leaf * 0.36, y0 + doorHeight * 0.44, wallDepth - 0.22],
          [0.09, 0.16, 0.06],
        ),
      );
    }
  }

  // Above each doorway: a moulded lintel, then the panelled wall to the top of
  // the lower order.
  parts.push(box("marble", [0, y0 + doorHeight, wallDepth / 2], [w, 0.55, wallDepth]));
  for (const door of doors) {
    // The painted panel over each door, framed in gilded moulding.
    parts.push(
      box("paintRed", [door.centre, y0 + doorHeight + 0.75, 0.03], [door.width * 1.15, 1.5, 0.12]),
    );
    parts.push(
      box("paintGold", [door.centre, y0 + doorHeight + 0.68, 0.02], [door.width * 1.3, 0.09, 0.08]),
    );
    parts.push(
      box("paintGold", [door.centre, y0 + doorHeight + 2.25, 0.02], [door.width * 1.3, 0.09, 0.08]),
    );
  }
  parts.push(
    box(
      "marble",
      [0, y0 + doorHeight + 0.55, wallDepth / 2],
      [w, lowerTop - y0 - doorHeight - 0.55, wallDepth],
    ),
  );

  // Upper storey: solid to the sill, then the three windows, then solid again.
  parts.push(box("marble", [0, lowerTop, wallDepth / 2], [w, windowBase - lowerTop, wallDepth]));
  const windows = bays.map((bay) => ({ centre: bay.centre, width: bay.width * 0.78 }));
  wallCourse(windowBase, windowHeight, windows);

  /*
   * The windows were not open holes: they carried a lattice, gilded, which is
   * what the sources mean by the openings above the doors being "fitted with
   * glass or latticework". Modelled as the grid it is — the light through it
   * is half the character of the front.
   */
  for (const window of windows) {
    const bars = 7;
    const rows = 5;
    for (let i = 1; i < bars; i += 1) {
      parts.push(
        box(
          "paintGold",
          [
            window.centre - window.width / 2 + (window.width * i) / bars,
            windowBase,
            wallDepth - 0.17,
          ],
          [0.045, windowHeight, 0.045],
        ),
      );
    }
    for (let i = 1; i < rows; i += 1) {
      parts.push(
        box(
          "paintGold",
          [window.centre, windowBase + (windowHeight * i) / rows, wallDepth - 0.17],
          [window.width, 0.045, 0.045],
        ),
      );
    }
    // The sill and the moulded frame round the opening.
    parts.push(
      box("paintGold", [window.centre, windowBase - 0.12, 0.02], [window.width * 1.18, 0.12, 0.1]),
    );
  }
  parts.push(
    box(
      "marble",
      [0, windowBase + windowHeight, wallDepth / 2],
      [w, y0 + spec.facadeHeight - windowBase - windowHeight, wallDepth],
    ),
  );

  /**
   * One aedicula: the pair of columns, the pedestal they share, the statue in
   * the niche between them, and the entablature broken forward over the top.
   */
  const aedicula = (
    base: number,
    height: number,
    centre: number,
    spread: number,
    diameter: number,
    statueHeight: number,
    project: number,
    /** What this one is wearing: the robes were painted, not left white. */
    robe: Material,
    /** Which of the eight this niche holds. */
    who: FigureIdentity,
    paint?: FigurePaint,
    /** What the pedestal's die says. */
    label?: EpigraphicText,
    /** This pair's stretch of the architrave's dedication. */
    frieze?: string,
  ) => {
    const pedestal = height * 0.26;
    const shaft = height * 0.58;
    const entablature = height - pedestal - shaft;
    const z = -(project + diameter / 2);

    // The lower storey's pedestals project over the stair: each stands on a
    // block of the podium carried forward through the steps, not on air.
    if (base <= y0 + 1e-6) {
      parts.push(
        box("marbleWorn", [centre, 0, z], [spread * 2 + diameter * 2.2, base, diameter * 2.6]),
      );
    }
    // One pedestal under both columns, moulded top and bottom.
    parts.push(
      box("marble", [centre, base, z], [spread * 2 + diameter * 2.2, 0.16, diameter * 2.6]),
    );
    parts.push(
      box(
        "marble",
        [centre, base + 0.16, z],
        [spread * 2 + diameter * 1.7, pedestal - 0.32, diameter * 2.2],
      ),
    );
    parts.push(
      box(
        "marble",
        [centre, base + pedestal - 0.16, z],
        [spread * 2 + diameter * 2.2, 0.16, diameter * 2.6],
      ),
    );

    for (const side of [-1, 1]) {
      parts.push(
        ...column(
          "marble",
          [centre + side * spread, base + pedestal, z],
          diameter,
          shaft,
          "composite",
          0,
        ),
      );
    }

    /*
     * The niche, and the statue standing clear of the wall in it. Eight
     * statues lived on this front — the four virtues below and Celsus with his
     * son above — and each is modelled in the round, a draped figure on its
     * own stepped pedestal, rather than drawn as a photograph. The dress, the
     * poses and which virtue wears which colour are the reconstruction's
     * reading; the surviving originals are in Vienna.
     */
    parts.push(
      box("paintRed", [centre, base + pedestal, 0.02], [spread * 1.5, statueHeight + 1.3, 0.1]),
    );
    // Sophia and Arete stand in the scans of their copies in the niches.
    // Ennoia's place takes a Muse wrapped in her mantle, Episteme's a
    // caryatid; above, one of the stand-ins is a portrait statue found at
    // Ephesus and carved in the very years the library was built.
    const scanned: ScanId | null =
      who.name === "Sophia"
        ? "celsus-sophia"
        : who.name === "Arete"
          ? "celsus-arete"
          : who.name === "Ennoia"
            ? "muse-polyhymnia"
            : who.name === "Episteme"
              ? "caryatid"
              : who.dress === "toga"
                ? upperStandIns[upperIndex++ % upperStandIns.length]!
                : null;
    // Statues with a raised arm lean back from it: they stand further out of
    // the niche, or their shoulders would be in its back wall.
    const out = scanned === "arringatore" || scanned === "augustus" ? 0.42 : scanned ? 0.15 : 0;
    parts.push({
      ...person(
        [centre, base + pedestal - 0.02, -0.045 - out],
        statueHeight,
        Math.PI,
        robe,
        who,
        paint,
      ),
      ...(scanned ? { scan: { id: scanned } } : {}),
    });
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "marble",
          [centre + side * spread * 0.82, base + pedestal, 0.06],
          [spread * 0.22, statueHeight + 1.2, 0.24],
        ),
      );
    }
    parts.push(
      ...cornice(
        "marble",
        [centre, base + pedestal + statueHeight + 1.2, 0.06],
        spread * 1.95,
        0.3,
        0.3,
      ),
    );

    // The entablature over the pair, in three courses so it throws a shadow.
    parts.push(
      ...cornice(
        "marble",
        [centre, base + pedestal + shaft, z],
        spread * 2 + diameter * 2.4,
        diameter * 2.8,
        entablature,
      ),
    );
    /*
     * The lettering: the statue's name on the die of the pedestal under it —
     * the four virtues are named on theirs, "Sophia of Celsus" and the rest,
     * and Celsus' own bases above carry the family's dedications — and on the
     * lower order the building inscription running on along the architrave
     * of each pair.
     */
    if (label) {
      const die = pedestal - 0.32;
      parts.push(
        ...inscription({
          at: [centre, base + 0.16 + die / 2, z - diameter * 1.1],
          rotY: FACING.south,
          width: spread * 2 + diameter * 1.7 - 0.3,
          letter: 0.12,
          height: die * 0.86,
          middle: true,
          text: label,
        }),
      );
    }
    if (frieze) {
      const course = entablature / 3;
      parts.push(
        ...inscription({
          at: [centre, base + pedestal + shaft + course * 0.18, z - diameter * 1.4],
          rotY: FACING.south,
          width: spread * 2 + diameter * 2.4 - 0.4,
          letter: course * 0.3,
          rows: 2,
          text: { ...TEXTS.celsusArchitrave, text: frieze },
        }),
      );
    }
  };

  const lowerSpread = aediculaWidth * 0.42;
  const upperSpread = aediculaWidth * 0.38;

  /* The entablature runs the whole width of the front and breaks forward over
     each pair. Without the continuous band between the projections the façade
     falls apart into four separate porches. */
  const bandDepth = 0.5;
  const lowerBand = spec.lowerOrderHeight * 0.16;
  parts.push(
    ...cornice(
      "marble",
      [0, lowerTop - lowerBand, wallDepth / 2 + bandDepth / 2],
      w,
      bandDepth + wallDepth,
      lowerBand,
    ),
  );
  const upperBand = upperHeight * 0.16;
  const facadeTop = y0 + spec.facadeHeight;
  parts.push(
    ...cornice(
      "marble",
      [0, facadeTop - upperBand, wallDepth / 2 + bandDepth / 2],
      w,
      bandDepth + wallDepth,
      upperBand,
    ),
  );

  /*
   * The painted courses that run the width of both entablatures. Roman
   * mouldings were not left in the marble: the frieze took a colour and the
   * enrichments above and below it were picked out and gilded, which is what
   * makes an entablature read as bands rather than as a shelf.
   */
  for (const level of [lowerTop - lowerBand, facadeTop - upperBand]) {
    // Laid over the cornice's face, three centimetres and more proud of it:
    // set into it, the paint showed only where the depth buffer let it.
    const face = wallDepth + bandDepth + 0.005;
    parts.push(box("paintBlue", [0, level + 0.06, face], [w * 0.995, 0.2, 0.06]));
    parts.push(box("paintGold", [0, level + 0.26, face], [w * 0.995, 0.07, 0.07]));
    parts.push(box("paintRed", [0, level + 0.33, face], [w * 0.995, 0.14, 0.06]));
    parts.push(box("paintGold", [0, level + 0.47, face], [w * 0.995, 0.07, 0.07]));
  }

  /*
   * The building inscription (IEph 5101) runs along the architrave the width
   * of the lower order: in the stretches between the pairs, over the doors,
   * and on across the entablature broken forward over each pair — so it is
   * laid out as one text divided between the pieces of stone, left to
   * right, each piece taking as much of it as it is wide.
   */
  const architrave: string[] = [];
  {
    const reach = lowerSpread + spec.columnDiameter * 1.2 + 0.2;
    const edges = [
      -w / 2 + 0.4,
      ...aediculaCentres.flatMap((c) => [c - reach, c + reach]),
      w / 2 - 0.4,
    ];
    const pairWidth = lowerSpread * 2 + spec.columnDiameter * 2.4 - 0.4;
    // The stretches of the band and the pairs between them;
    // a stretch too short to letter (the ends, outside the outer pairs) is passed over.
    const pieces: { from: number; to: number; pair: number | null }[] = [];
    for (let i = 0; i + 1 < edges.length; i += 2) {
      if (edges[i + 1]! - edges[i]! >= 0.8)
        pieces.push({ from: edges[i]!, to: edges[i + 1]!, pair: null });
      if (i + 2 < edges.length) pieces.push({ from: 0, to: pairWidth, pair: i / 2 });
    }
    // Read from the square, the front's left is +x: the text starts there.
    pieces.reverse();
    const texts = runs(
      TEXTS.celsusArchitrave.text,
      pieces.map((piece) => piece.to - piece.from),
      TEXTS.celsusArchitrave.script,
    );
    pieces.forEach((piece, k) => {
      if (piece.pair !== null) {
        architrave[piece.pair] = texts[k]!;
        return;
      }
      parts.push(
        ...inscription({
          at: [(piece.from + piece.to) / 2, lowerTop - lowerBand + (lowerBand / 3) * 0.16, -0.001],
          rotY: FACING.south,
          width: piece.to - piece.from - 0.2,
          letter: (lowerBand / 3) * 0.3,
          rows: 2,
          text: { ...TEXTS.celsusArchitrave, text: texts[k]! },
        }),
      );
    });
  }

  // Wisdom, Knowledge, Intelligence and Virtue, in the white marble the
  // surviving figures are cut from. The paint is on the niche behind each of
  // them, which is what makes a pale statue read against a pale front.
  const robes: Material[] = ["marble", "marble", "marble", "marble"];
  aediculaCentres.forEach((centre, index) => {
    aedicula(
      y0,
      spec.lowerOrderHeight,
      centre,
      lowerSpread,
      spec.columnDiameter,
      2,
      1.0,
      robes[index % robes.length]!,
      IDENTITIES.celsusVirtues[index % IDENTITIES.celsusVirtues.length]!,
      PAINT.celsusVirtues[index % PAINT.celsusVirtues.length]!,
      VIRTUE_BASES[IDENTITIES.celsusVirtues[index % IDENTITIES.celsusVirtues.length]!.name],
      architrave[index],
    );
  });
  // The upper order is set back and drawn in, which is what makes the front
  // read as two storeys rather than one tall one. Where the virtues stand
  // below, the four podia above carried Celsus and his son Aquila — white
  // marble by now, not painted, the bearded father and the clean-shaven son.
  aediculaCentres.forEach((centre, index) => {
    const inward = Math.sign(centre) * aediculaWidth * 0.12;
    aedicula(
      lowerTop,
      upperHeight,
      centre - inward,
      upperSpread,
      spec.columnDiameter * 0.86,
      1.9,
      0.72,
      "marbleWorn",
      index % 2 === 0 ? IDENTITIES.celsus : IDENTITIES.aquila,
      index % 2 === 0 ? PAINT.celsus : PAINT.aquila,
      /*
       * Celsus' bases carry two of the dedications his family set up to him
       * (IEph 5104 by his daughter, 5106 by his grandson); no base text for
       * Aquila's statue is known, so his die is left uncut.
       */
      index === 0 ? TEXTS.celsusByDaughter : index === 2 ? TEXTS.celsusByGrandson : undefined,
    );
  });

  /* Three pediments over the three window bays: triangular in the middle,
     segmental either side, and all of them broken at the centre — which is
     what the fragments show and what the re-erected front carries. */
  const top = y0 + spec.facadeHeight;
  const pedimentDepth = spec.columnDiameter * 2.4;
  const pedimentZ = -(0.72 + spec.columnDiameter * 0.43);
  bays.forEach((bay, index) => {
    const width = bay.width + aediculaWidth * 0.9;
    if (index === 1) {
      parts.push(prism("marble", [0, top, pedimentZ], [width, width * 0.3, pedimentDepth]));
      // The tympanum behind the raking cornice was painted, not left bare. It
      // is laid on the pediment's front face: centred on the prism, as it
      // once was, it sat buried inside the stone and the middle pediment
      // showed none of its red.
      parts.push(
        prism(
          "paintRed",
          [0, top + 0.1, pedimentZ - pedimentDepth / 2 - 0.02],
          [width * 0.86, width * 0.24, 0.08],
        ),
      );
    } else {
      parts.push(
        segmentalPediment(
          "marble",
          [bay.centre, top, pedimentZ - pedimentDepth / 2],
          width / 2,
          pedimentDepth,
        ),
      );
      // Its painted field stands a few centimetres proud of the gilded band
      // below: level with it, the two fought over the same pixels.
      parts.push(
        segmentalPediment(
          "paintRed",
          [bay.centre, top + 0.08, pedimentZ - pedimentDepth * 0.52 - 0.04],
          width * 0.43,
          0.14,
        ),
      );
    }
    // The gilded band along the top of the entablature under each pediment.
    parts.push(
      box("paintGold", [bay.centre, top - 0.16, pedimentZ], [width, 0.1, pedimentDepth * 1.04]),
    );
  });

  /*
   * The two bronze statues on the courtyard, one either side of the stairs.
   * They stand on their own inscribed plinths, and they are the reason the
   * front reads as the end of a public square rather than as a building in a
   * field: the eye gets something at ground level to measure the steps by.
   */
  for (const side of [-1, 1]) {
    const px = side * (w * 0.56);
    const pz = -spec.steps * stepTread - 2.6;
    parts.push(box("marbleWorn", [px, 0, pz], [2.6, 0.28, 3.4]));
    parts.push(box("marble", [px, 0.28, pz], [2.2, 2.4, 3.0]));
    parts.push(box("marbleWorn", [px, 2.68, pz], [2.6, 0.26, 3.4]));
    /*
     * The inscriptions that gave the statues their reason: Celsus' career,
     * and his son Aquila who set the statue up — the Latin on the front, to
     * the square, and the long Greek text on the face turned to the stair,
     * as the library's bilingual bases carry both (IEph 5102; the Latin as
     * ILS 8971).
     */
    const front = TEXTS.celsusRiderLatin;
    const inner = flowing(TEXTS.celsusRiderGreek);
    parts.push(
      ...inscribedPanel({
        at: [px, 0.62, pz - 1.5],
        rotY: FACING.south,
        width: 1.8,
        height: 1.7,
        material: "marble",
        letter: 0.1,
        text: front,
      }),
      ...inscribedPanel({
        at: [px - side * 1.1, 0.62, pz],
        rotY: side > 0 ? FACING.west : FACING.east,
        width: 2.5,
        height: 1.7,
        material: "marble",
        letter: 0.1,
        rows: 40,
        text: inner,
      }),
    );
    /*
     * The statue on it, in bronze, a little over life size, turned a touch
     * towards the stair so the pair address whoever climbs it. What stood
     * here is lost; the two stand in scans of Roman togate statues — the
     * Arringatore, the one bronze honorific statue of a magistrate to
     * survive whole, and the veiled Tiberius — which is what such bases
     * carried.
     */
    parts.push({
      kind: "figure",
      material: "bronze",
      at: [px, 2.94, pz + 0.05],
      height: 2.3,
      rotY: Math.PI + (side > 0 ? -0.3 : 0.3),
      identity: {
        name: "Benefactor",
        sex: "male",
        bearded: false,
        hair: "short",
        dress: "toga",
        gesture: "raised",
      },
      scan: { id: side < 0 ? "arringatore" : "tiberius-velatus" },
    });
  }

  /* The hall: side walls, rear wall and apse, stopped at the height the
     masonry actually survives to. */
  const hallFront = spec.porchDepth + wallDepth;
  const hallBack = hallFront + spec.hallDepth;
  const wallThickness = 0.9;
  const halfHall = spec.hallWidth / 2;
  const hallHeight = spec.wallHeight;

  parts.push(
    // The floor stands four centimetres over the podium it is laid on: two
    // were not enough to keep the two stones apart on a phone.
    box(
      "stone",
      [0, y0 - 0.08, (hallFront + hallBack) / 2],
      [spec.hallWidth, 0.12, spec.hallDepth],
    ),
  );
  for (const side of [-1, 1]) {
    parts.push(
      box(
        "stone",
        [side * (halfHall + wallThickness / 2), y0, (hallFront + hallBack) / 2],
        [wallThickness, hallHeight, spec.hallDepth],
      ),
    );
    parts.push(
      box(
        "stone",
        [side * (halfHall - 0.5), y0, (hallFront + hallBack) / 2],
        [1, 1, spec.hallDepth],
      ),
    );
  }

  const apseHalf = spec.apseWidth / 2;
  for (const side of [-1, 1]) {
    const from = side * apseHalf;
    const to = side * (halfHall + wallThickness);
    parts.push(
      box(
        "stone",
        [(from + to) / 2, y0, hallBack + wallThickness / 2],
        [Math.abs(to - from), hallHeight, wallThickness],
      ),
    );
  }
  parts.push(
    ring("stone", y0, apseHalf, apseHalf + wallThickness, hallHeight, 0, Math.PI, [0, hallBack]),
  );
  // The podium carried on round the apse, which reaches past the end of the
  // rectangle: without it the apse wall stood on air and its floor was a
  // hole a walker fell through to the ground.
  parts.push(ring("marbleWorn", 0, 0, apseHalf + wallThickness, y0, 0, Math.PI, [0, hallBack]));

  // Ten shelf niches per storey: four at the back, three down each side.
  const nicheWidth = 1.1;
  const nicheDepth = 0.35;
  for (let storey = 0; storey < 2; storey += 1) {
    const base = y0 + 1 + storey * (spec.nicheHeight + 0.5);
    if (base + spec.nicheHeight > y0 + hallHeight) continue;
    for (let i = 0; i < 4; i += 1) {
      const x = -halfHall + (halfHall * 2 * (i + 0.5)) / 4;
      if (Math.abs(x) < apseHalf + 0.8) continue;
      parts.push(
        box(
          "shadow",
          [x, base, hallBack - nicheDepth / 2],
          [nicheWidth, spec.nicheHeight, nicheDepth],
        ),
      );
    }
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i += 1) {
        const z = hallFront + (spec.hallDepth * (i + 0.5)) / 3;
        parts.push(
          box(
            "shadow",
            [side * (halfHall - nicheDepth / 2), base, z],
            [nicheDepth, spec.nicheHeight, nicheWidth],
          ),
        );
      }
    }
  }

  /*
   * The walls' own finish. Outside, the hall is laid in courses of squared
   * stone on a moulded foot. Inside, the back of the façade — the wall a
   * reader saw on the way out — was revetted like the hall: a dado of
   * coloured marble panels, purple-veined pavonazzetto and yellow giallo
   * antico framed in white, under a moulding, between the three doors.
   */
  {
    const hallLength = spec.hallDepth;
    for (const side of [-1, 1]) {
      parts.push(
        ...ashlar({
          at: [side * (halfHall + wallThickness), y0, (hallFront + hallBack) / 2],
          rotY: side > 0 ? FACING.east : FACING.west,
          length: hallLength,
          height: hallHeight,
          material: "stone",
          blocks: 1.3,
        }),
      );
      const outer = halfHall + wallThickness;
      parts.push(
        ...ashlar({
          at: [
            side * (apseHalf + wallThickness + (outer - apseHalf - wallThickness) / 2),
            y0,
            hallBack + wallThickness,
          ],
          rotY: FACING.north,
          length: outer - apseHalf - wallThickness,
          height: hallHeight,
          material: "stone",
          blocks: 1.3,
        }),
      );
    }
    const doorGaps = doors.map(
      (door) =>
        [door.centre - door.width / 2 - 0.1, door.centre + door.width / 2 + 0.1] as [
          number,
          number,
        ],
    );
    const inner = wallDepth;
    const dado = 1.6;
    let k = 0;
    const edges = [-w / 2 + 0.3, ...doorGaps.flat(), w / 2 - 0.3];
    for (let i = 0; i + 1 < edges.length; i += 2) {
      const from = edges[i]!;
      const to = edges[i + 1]!;
      const panels = Math.max(1, Math.round((to - from) / 1.6));
      const pitch = (to - from) / panels;
      for (let p = 0; p < panels; p += 1) {
        const x = from + (p + 0.5) * pitch;
        parts.push(box("marble", [x, y0 + 0.2, inner + 0.03], [pitch - 0.02, dado - 0.3, 0.06]));
        parts.push(
          box(
            k++ % 2 === 0 ? "pavonazzetto" : "gialloAntico",
            [x, y0 + 0.36, inner + 0.076],
            [pitch - 0.34, dado - 0.62, 0.032],
          ),
        );
      }
      parts.push(
        box("marble", [(from + to) / 2, y0 + dado - 0.1, inner + 0.06], [to - from, 0.16, 0.12]),
      );
      parts.push(box("marble", [(from + to) / 2, y0, inner + 0.08], [to - from, 0.2, 0.16]));
    }
    // Above the dado, the inside of the front in the courses it was built
    // in: round the doors, and on over them up to the windows.
    parts.push(
      ...ashlar({
        at: [0, y0 + dado + 0.06, inner],
        rotY: FACING.north,
        length: w - 0.6,
        height: doorHeight - dado - 0.06,
        foot: false,
        coping: false,
        gaps: doorGaps,
        material: "marble",
      }),
      ...ashlar({
        at: [0, y0 + doorHeight, inner],
        rotY: FACING.north,
        length: w - 0.6,
        height: windowBase - y0 - doorHeight,
        foot: false,
        material: "marble",
      }),
    );
  }

  // Someone at the foot of the stairs, so 16 metres reads as 16 metres.
  /*
   * The library stood on a paved courtyard in the middle of a city, so the
   * ground round it is worked stone, not countryside: little rock, no grass,
   * and Bülbül Dağı well back on the skyline.
   */
  parts.push(...setting(w * 0.62, 4101, { stone: 0.35, grass: 0.12, hills: 0.55 }));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Roman theatre
 * ------------------------------------------------------------------ */

/**
 * The plan of a theatre, shared by the stone (here) and its life
 * (`scene-life.ts`), so that the audience sits on the seats that are built
 * and the statues stand in the bays of the stage front that is built.
 */
export function theatreLayout(spec: RomanTheatreSpec) {
  const character: TheatreCharacter = spec.character ?? {
    stone: "limestone",

    ground: "plain",
    facade: "arcade",
    screen: "aspendos",
    storeys: 2,
    topGallery: true,
  };
  const outerRadius = spec.caveaDiameter / 2;
  const orchestraRadius = spec.orchestraDiameter / 2;
  const middle = spec.middleRows ?? 0;
  const rows = spec.lowerRows + middle + spec.upperRows;
  const diazoma = 1.8;
  const podiumOuter = orchestraRadius + 0.7;
  const rowAt = (index: number) => {
    // One walkway above the lower tier, and another above the middle one.
    const walkways =
      (index >= spec.lowerRows ? diazoma : 0) +
      (middle > 0 && index >= spec.lowerRows + middle ? diazoma : 0);
    const inner = podiumOuter + index * spec.seatTread + walkways;
    return { inner, outer: inner + spec.seatTread, y: spec.podiumHeight + index * spec.seatRise };
  };
  /*
   * A Roman theatre closes its seating with a semicircle and bonds its stage
   * building to the ends of it, across the full width. One built on a Greek
   * theatre keeps the Greek horseshoe: the seating wraps further round, and
   * the stage building is a shorter block standing inside the wings.
   */
  const sweep = ((character.sweep ?? 0) * Math.PI) / 180;
  const stageWidth =
    sweep > 0 ? Math.min(spec.caveaDiameter, spec.orchestraDiameter * 2.3) : spec.caveaDiameter;
  const rowSpan = (index: number): [number, number] =>
    rowAt(index).inner > stageWidth / 2 + 2 ? [-sweep, Math.PI + 2 * sweep] : [0, Math.PI];
  const wallZ = -spec.stageDepth;
  const stageTop = character.stageHeight ?? 1.5;
  const fractions = character.storeys === 3 ? [0.4, 0.32, 0.28] : [0.55, 0.45];
  const storeys = fractions.map((f, i) => ({
    base: stageTop + fractions.slice(0, i).reduce((a, c) => a + c, 0) * spec.scaenaeHeight,
    height: f * spec.scaenaeHeight,
  }));
  const bays = character.bays ?? 10;
  const screenSpan = stageWidth * 0.86;
  const bayWidth = screenSpan / bays;
  const doors: [number, number, number][] = [
    [0, 4.2, 8],
    [-stageWidth * 0.16, 2.8, 6.4],
    [stageWidth * 0.16, 2.8, 6.4],
    [-stageWidth * 0.36, 2.4, 5.6],
    [stageWidth * 0.36, 2.4, 5.6],
  ].map(([x, w, h]) => [x!, w!, Math.min(h!, storeys[0]!.height * 0.82)]);
  /** Where the stage front's statues stand: in the bays, clear of the doors. */
  const statueSlots: { at: Vec3; height: number }[] = [];
  storeys.forEach((storey, s) => {
    for (let i = 0; i < bays; i += 1) {
      const x = -(screenSpan / 2) + (i + 0.5) * bayWidth;
      if (s === 0 && doors.some(([d, w]) => Math.abs(d - x) < w / 2 + 1.6)) continue;
      statueSlots.push({
        at: [x, storey.base, wallZ + 0.7 + 0.2 * s],
        height: storey.height * (s === 0 ? 0.42 : 0.55),
      });
    }
  });
  return {
    character,
    outerRadius,
    orchestraRadius,
    middle,
    rows,
    diazoma,
    podiumOuter,
    rowAt,
    rowSpan,
    sweep,
    stageWidth,
    wallZ,
    stageTop,
    storeys,
    bays,
    screenSpan,
    bayWidth,
    doors,
    statueSlots,
  };
}

/** Seat rows fan over +z; the stage building closes the theatre across -z. */
export function romanTheatreParts(spec: RomanTheatreSpec): Part[] {
  const parts: Part[] = [];
  const layout = theatreLayout(spec);
  const {
    character: ch,
    outerRadius,
    orchestraRadius,
    middle,
    rows,
    diazoma,
    podiumOuter,
    rowAt,
    rowSpan,
    sweep,
    stageWidth,
    wallZ,
    stageTop,
    storeys,
    bays,
    screenSpan,
    bayWidth,
    doors,
  } = layout;
  // The stone each theatre is built of: the warm conglomerate of Aspendos,
  // the white Dokimeion marble of Hierapolis, the marble seats of Ephesus.
  const seatStone: Material =
    ch.stone === "marble" ? "marbleWorn" : ch.stone === "conglomerate" ? "conglomerate" : "stone";
  const wallStone: Material =
    ch.stone === "conglomerate" ? "conglomerate" : ch.stone === "marble" ? "limestone" : "stone";
  const screenStone: Material = ch.stone === "marble" ? "marble" : "marbleWorn";
  const fullStart = -sweep;
  const fullLength = Math.PI + 2 * sweep;

  // The orchestra floor. The ground under it all is the renderer's to lay.
  parts.push(ring("stone", 0, 0, orchestraRadius, 0.12, 0, Math.PI));
  // The podium wall that separated the orchestra from the first row — raised
  // into a parapet where the theatre was later used for beast fights.
  const podiumHeight = ch.arenaWall ? Math.max(spec.podiumHeight, 2.2) : spec.podiumHeight;
  parts.push(ring(wallStone, 0, orchestraRadius, podiumOuter, podiumHeight, 0, Math.PI));
  if (ch.arenaWall) {
    parts.push(
      ring(
        "stoneDark",
        podiumHeight,
        orchestraRadius - 0.05,
        orchestraRadius + 0.3,
        0.25,
        0,
        Math.PI,
      ),
    );
  }

  for (let i = 0; i < rows; i += 1) {
    const { inner, outer, y } = rowAt(i);
    const [start, length] = rowSpan(i);
    parts.push(ring(seatStone, y, inner, outer, spec.seatRise + 0.06, start, length));
  }
  /*
   * Miletus' seats still say whose they were: "place of the Jews, who are
   * also God-fearers", and the goldsmiths' places, one of them the Blues'
   * (Milet VI,2 940). They are cut on the fronts of seats in the lower
   * tier, a little off the axis, where they are read today.
   */
  if (ch.screen === "miletus") {
    const seats: [number, number, EpigraphicText][] = [
      [4, 0.5, TEXTS.miletusJews],
      [3, -0.5, TEXTS.miletusGoldsmiths],
      [5, -0.5, TEXTS.miletusGoldsmiths2],
    ];
    for (const [index, offset, text] of seats) {
      const { inner, y } = rowAt(index);
      // Halfway between the middle stair and the next, clear of both.
      const [, length] = rowSpan(index);
      const theta = Math.PI / 2 + offset * (length / spec.stairways);
      // The plate is flat and the seat front curved: it is set out from the
      // curve far enough that its ends do not sink into it.
      const r = inner - 0.022;
      parts.push(
        ...inscription({
          at: [Math.cos(theta) * r, y + 0.11, Math.sin(theta) * r],
          rotY: Math.atan2(-Math.cos(theta), -Math.sin(theta)),
          width: 1.6,
          letter: 0.09,
          height: spec.seatRise - 0.12,
          text,
        }),
      );
    }
  }

  /*
   * What the seats rest on: earth where the theatre lies in a hillside, the
   * vaulted mass of the substructure where it stands up out of a plain. Seen
   * from the end of a wing, the bank is solid, not a flight of floating rings.
   */
  const fill: Material = ch.ground === "hillside" ? "ground" : "stoneDark";
  /*
   * Under every row, from the ground up to it, and under each walkway: one
   * block per tier, only as high as the tier's first row, left the rows above
   * it as stepped shelves over a hollow — seen from the ends of the wings and
   * from anywhere a walker got under them.
   */
  const lastOfTier = new Set(
    middle > 0 ? [spec.lowerRows - 1, spec.lowerRows + middle - 1] : [spec.lowerRows - 1],
  );
  for (let i = 0; i < rows; i += 1) {
    const { inner, outer, y } = rowAt(i);
    const [start, length] = rowSpan(i);
    parts.push(ring(fill, 0, inner, outer, y, start, length));
    if (lastOfTier.has(i)) {
      const [nextStart, nextLength] = rowSpan(i + 1);
      parts.push(ring(fill, 0, outer, outer + diazoma, y + spec.seatRise, nextStart, nextLength));
    }
  }

  // The walkways that split the bank: one, or two where there are three tiers.
  for (const last of middle > 0
    ? [spec.lowerRows - 1, spec.lowerRows + middle - 1]
    : [spec.lowerRows - 1]) {
    const below = rowAt(last);
    const [start, length] = rowSpan(last + 1);
    parts.push(
      ring(
        "stoneDark",
        below.y + spec.seatRise,
        below.outer,
        below.outer + diazoma,
        0.12,
        start,
        length,
      ),
    );
  }

  // Radial stairs, laid over the rows rather than cut into them.
  const top = rowAt(rows - 1);
  for (let s = 0; s < spec.stairways; s += 1) {
    for (let i = 0; i < rows; i += 1) {
      const { inner, outer, y } = rowAt(i);
      const [start, length] = rowSpan(i);
      const theta = start + (length * (s + 0.5)) / spec.stairways;
      const width = 1.1 / inner;
      parts.push(
        ring("stoneDark", y + 0.02, inner, outer, spec.seatRise + 0.08, theta - width / 2, width),
      );
    }
  }

  // The rim above the top row, and the outer wall holding it up.
  const galleryInner = top.outer;
  const galleryTop = top.y + spec.seatRise;
  parts.push(ring(wallStone, galleryTop, galleryInner, outerRadius, 0.3, fullStart, fullLength));

  /*
   * The outer face. Side stands free in a flat town, so its whole curve is
   * two storeys of arches; Aspendos shows a tall plain wall pierced by doors
   * and small windows; Miletus heaped its seating on an artificial mound and
   * only the top tier stands on vaults. A theatre cut into a hill has no
   * outer face at all — the slope runs on up behind it.
   */
  const wallThickness = 1.4;
  const arcade = (y0: number, height: number, bays: number) => {
    const spring = y0 + height * 0.55;
    const archRadius = ((fullLength * outerRadius) / bays) * 0.3;
    for (let i = 0; i < bays; i += 1) {
      const centreTheta = fullStart + (fullLength * (i + 0.5)) / bays;
      const bayAngle = fullLength / bays;
      const opening = bayAngle * 0.56;
      parts.push(
        ring(
          wallStone,
          y0,
          outerRadius,
          outerRadius + wallThickness,
          height,
          centreTheta + opening / 2,
          bayAngle - opening,
        ),
      );
      parts.push(
        ring(
          wallStone,
          spring + archRadius,
          outerRadius,
          outerRadius + wallThickness,
          y0 + height - spring - archRadius,
          centreTheta - opening / 2,
          opening,
        ),
      );
      parts.push(
        cyl(
          "stoneDark",
          [Math.cos(centreTheta) * outerRadius, spring, Math.sin(centreTheta) * outerRadius],
          archRadius,
          archRadius,
          wallThickness,
          14,
          {
            rotX: Math.PI / 2,
            rotY: Math.PI / 2 - centreTheta,
            thetaStart: Math.PI / 2,
            thetaLength: Math.PI,
          },
        ),
      );
      // The pilaster on the pier, and the string course over the storey.
      const pier = centreTheta + bayAngle / 2;
      parts.push(
        box(
          wallStone,
          [
            Math.cos(pier) * (outerRadius + wallThickness + 0.15),
            y0,
            Math.sin(pier) * (outerRadius + wallThickness + 0.15),
          ],
          [0.9, height, 0.3],
          Math.PI / 2 - pier,
        ),
      );
    }
    parts.push(
      ring(
        wallStone,
        y0 + height - 0.5,
        outerRadius + wallThickness,
        outerRadius + wallThickness + 0.35,
        0.5,
        fullStart,
        fullLength,
      ),
    );
  };
  /**
   * Earth banked against the outer wall, falling away smoothly. It used to be
   * forty stacked rings, and from any distance the bank read as a flight of
   * giant steps.
   */
  const slope = (from: number, height: number, reach: number, start: number, length: number) => [
    scenery<Part>({
      kind: "bank",
      material: "ground",
      at: [0, 0, 0],
      inner: from - 0.2,
      reach,
      height,
      thetaStart: start,
      thetaLength: length,
    }),
  ];
  if (ch.facade === "arcade") {
    if (ch.ground === "mound") {
      // The mound, and only the top third carried on vaults.
      const mound = galleryTop * 0.62;
      parts.push(...slope(outerRadius, mound, 34, fullStart, fullLength));
      arcade(mound, galleryTop - mound, 28);
    } else {
      const bays = Math.round(outerRadius / 1.9);
      arcade(0, galleryTop / 2, bays);
      arcade(galleryTop / 2, galleryTop / 2, bays);
    }
  } else if (ch.facade === "wall") {
    parts.push(
      ring(
        wallStone,
        0,
        outerRadius,
        outerRadius + wallThickness,
        galleryTop,
        fullStart,
        fullLength,
      ),
    );
    // Two rows of openings: doors to the corridors, small windows above.
    const openings = 22;
    for (let i = 0; i < openings; i += 1) {
      const theta = fullStart + (fullLength * (i + 0.5)) / openings;
      const r = outerRadius + wallThickness + 0.02;
      for (const [y, w, h] of [
        [0, 1.8, 3.2],
        [galleryTop * 0.62, 1.0, 1.6],
      ] as const) {
        parts.push(
          box(
            "shadow",
            [Math.cos(theta) * r, y, Math.sin(theta) * r],
            [w, h, 0.1],
            Math.PI / 2 - theta,
          ),
        );
      }
    }
    parts.push(
      ring(
        wallStone,
        galleryTop * 0.58,
        outerRadius + wallThickness,
        outerRadius + wallThickness + 0.3,
        0.4,
        fullStart,
        fullLength,
      ),
    );
  }
  if (ch.ground === "hillside") {
    // The hill the seating is laid into, falling away from the rim.
    parts.push(...slope(outerRadius, galleryTop + 0.3, 48, fullStart - 0.3, fullLength + 0.6));
  } else if (ch.facade === "wall") {
    // At Aspendos only the back of the bank leans on the citadel hill.
    parts.push(
      ...slope(outerRadius + wallThickness, galleryTop * 0.55, 30, Math.PI * 0.3, Math.PI * 0.4),
    );
  }

  if (ch.topGallery) {
    // The colonnaded gallery round the top of the seating.
    const arcadeColumns = Math.round(fullLength * 11);
    const r = galleryInner + 0.5;
    // The end columns stand clear of the end walls, not with a plinth in their face.
    const margin = 0.6 / r;
    for (let i = 0; i <= arcadeColumns; i += 1) {
      const theta = fullStart + margin + ((fullLength - margin * 2) * i) / arcadeColumns;
      parts.push(
        ...column(
          screenStone,
          [Math.cos(theta) * r, galleryTop + 0.3, Math.sin(theta) * r],
          0.72,
          3.6,
          "plain",
        ),
      );
    }
    parts.push(
      ring(
        wallStone,
        galleryTop + 3.9,
        galleryInner,
        outerRadius + wallThickness,
        0.6,
        fullStart,
        fullLength,
      ),
    );
    parts.push(
      ring(
        wallStone,
        galleryTop + 0.3,
        outerRadius - 0.6,
        outerRadius + 0.2,
        3.6,
        fullStart,
        fullLength,
      ),
    );
  } else {
    // A plain parapet; at Side, a row of benches with backs along it.
    parts.push(
      ring(
        wallStone,
        galleryTop + 0.3,
        outerRadius - 0.5,
        outerRadius + 0.2,
        1.1,
        fullStart,
        fullLength,
      ),
    );
  }

  parts.push(
    ...theatreWingEnds(spec, layout, { wallStone, screenStone, wallThickness, galleryTop }),
  );

  // Post holes for the awning masts, one mast each, around the rim.
  const masts = spec.velariumMasts ?? 0;
  for (let i = 0; i < masts; i += 1) {
    const theta = fullStart + (fullLength * (i + 0.5)) / masts;
    const r = outerRadius + 0.6;
    parts.push(
      cyl(
        "stoneDark",
        [Math.cos(theta) * r, galleryTop + (ch.topGallery ? 4.5 : 1.4), Math.sin(theta) * r],
        0.12,
        0.1,
        3,
        8,
      ),
    );
  }

  /*
   * Boxes for the magistrates: the two tribunalia over the side entrances at
   * Aspendos, the imperial exedra on the axis at Hierapolis, and at Miletus
   * the box in the seating marked by four columns and a canopy.
   */
  if (ch.box === "tribunalia") {
    for (const side of [-1, 1]) {
      const x = side * (podiumOuter + spec.lowerRows * spec.seatTread * 0.5);
      parts.push(
        box(wallStone, [x, 0, -1.3], [spec.lowerRows * spec.seatTread * 0.8, rowAt(6).y, 2.4]),
      );
      parts.push(
        box("marbleWorn", [x, rowAt(6).y, -1.3], [spec.lowerRows * spec.seatTread * 0.8, 1.1, 2.6]),
      );
    }
  } else if (ch.box === "exedra" || ch.box === "canopy") {
    const row = rowAt(Math.floor(spec.lowerRows * 0.55));
    const r = row.inner + spec.seatTread * 2;
    const at: Vec3 = [0, row.y + spec.seatRise, r];
    parts.push(box("marble", at, [7, 0.4, 5]));
    if (ch.box === "canopy") {
      for (const [dx, dz] of [
        [-3, -2],
        [3, -2],
        [-3, 2],
        [3, 2],
      ] as const) {
        parts.push(...column("marble", [dx, at[1] + 0.4, r + dz], 0.45, 4.2, "composite", 0));
      }
      parts.push(box("marble", [0, at[1] + 4.6, r], [7.4, 0.6, 5.2]));
      parts.push(prism("paintRed", [0, at[1] + 5.2, r], [7.6, 1.2, 5.4]));
    } else {
      parts.push(
        cyl("marble", [0, at[1] + 0.4, r + 1.5], 3.2, 3.2, 2.2, 20, {
          thetaStart: Math.PI / 2,
          thetaLength: Math.PI,
        }),
      );
      parts.push(box("marble", [0, at[1] + 0.4, r - 0.5], [6.6, 1.1, 0.6]));
    }
  }

  /* The stage building. A Roman one is bonded to the seating bank across the
     full width of the theatre; on a Greek horseshoe it stands inside the
     wings, and the side entrances run between the two. */
  const wallHeight = storeys[storeys.length - 1]!.base + storeys[storeys.length - 1]!.height + 1.8;
  const backWall: Material = ch.stone === "conglomerate" ? "conglomerate" : wallStone;
  parts.push(box(backWall, [0, 0, wallZ - 0.9], [stageWidth, wallHeight, 1.8]));
  parts.push(box(backWall, [0, 0, wallZ - 5.4], [stageWidth, wallHeight, 7.2]));
  /*
   * The back of the stage building, the face the town saw. It was never a
   * blank cliff: at Aspendos, where it stands to its full height, it is a
   * wall of dressed stone with doorways at ground level into the rooms
   * behind the stage, rows of small windows lighting the storeys, string
   * courses marking the floors, and near the top the projecting brackets
   * that held the masts of the awning. The others are drawn the same way.
   */
  {
    const face = wallZ - 9.0;
    const out = (x: number, y: number, size: Vec3, material: Material = backWall) =>
      parts.push(box(material, [x, y, face - size[2] / 2 + 0.02], size));
    // Doorways into the rooms behind the stage, under heavy lintels.
    const doorsBehind = Math.max(3, Math.round(stageWidth / 18) | 1);
    for (let i = 0; i < doorsBehind; i += 1) {
      const x = -stageWidth / 2 + ((i + 0.5) * stageWidth) / doorsBehind;
      const w = i === (doorsBehind - 1) / 2 ? 3 : 2.2;
      out(x, 0, [w, 3.8, 0.1], "shadow");
      out(x, 3.8, [w + 0.9, 0.55, 0.32]);
      for (const side of [-1, 1]) out(x + side * (w / 2 + 0.22), 0, [0.44, 3.8, 0.18]);
    }
    // A string course at every floor above the doors.
    for (const storey of storeys)
      if (storey.base > 4.6) out(0, storey.base, [stageWidth, 0.32, 0.26]);
    out(0, 4.6, [stageWidth, 0.32, 0.26]);
    // Rows of small windows, a sill under each.
    const windows = Math.max(6, Math.round(stageWidth / 6));
    storeys.forEach((storey, s) => {
      for (let i = 0; i < windows; i += 1) {
        // Staggered between storeys, as the rooms behind were laid out.
        const x = -stageWidth / 2 + ((i + 0.5 + (s % 2) * 0.5) * stageWidth) / (windows + (s % 2));
        const y = storey.base + storey.height * 0.42;
        out(x, y, [0.8, 1.3, 0.1], "shadow");
        out(x, y - 0.14, [1.1, 0.14, 0.22]);
      }
    });
    /*
     * At Ephesus the parodos wall carried the long dossier of C. Vibius
     * Salutaris' foundation of AD 104 (IEph 27); its opening lines are set
     * on the end of the stage building where the south passage runs by.
     */
    if (ch.screen === "ephesus") {
      parts.push(
        ...inscribedPanel({
          at: [-stageWidth / 2, 1.1, wallZ - 4.5],
          rotY: FACING.west,
          width: 6.6,
          height: 2.3,
          material: "marble",
          letter: 0.16,
          text: flowing(TEXTS.ephesusSalutaris),
          rows: 12,
        }),
      );
    }
    // The awning's mast brackets, in pairs under the top.
    const brackets = Math.max(8, Math.round(stageWidth / 4.5));
    for (let i = 0; i < brackets; i += 1) {
      const x = -stageWidth / 2 + ((i + 0.5) * stageWidth) / brackets;
      for (const y of [wallHeight - 1.3, wallHeight - 4.6]) out(x, y, [0.45, 0.5, 0.6]);
    }
  }
  // The stage floor, and the front of it the actors played above.
  const floorWidth = Math.min(stageWidth * 0.94, spec.caveaDiameter * 0.62);
  /*
   * The front is stone, the deck timber, and the two never share a face:
   * the deck is a plank floor laid over the top of the stone front, the
   * timber framing under it stops behind the stone. Laid one inside the
   * other, two centimetres apart, the timber's face came through the stone's
   * in dark stripes on a phone, whose depth buffer cannot tell them apart.
   */
  const frontFace = 0.02;
  const frontDepth = 0.8;
  const deck = 0.12;
  const deckBase = stageTop - deck;
  parts.push(
    box("timber", [0, deckBase, (wallZ + frontFace) / 2], [floorWidth, deck, frontFace - wallZ]),
    box(
      "timber",
      [0, 0, (wallZ + frontFace - frontDepth) / 2],
      [floorWidth, deckBase, frontFace - frontDepth - wallZ],
    ),
  );
  /*
   * The stone front, with niches cut into it — wide and narrow in turn —
   * as real recesses: a plinth under them, a band over them, piers between,
   * and the back of each recess set well in. A dark panel laid on the face
   * instead was three centimetres off it, close enough to fight it too.
   */
  /** A block of the front from `x0` to `x1` and `y0` to `y1`, its face `back` behind the line. */
  const front = (
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    back = 0,
    m: Material = screenStone,
  ) =>
    parts.push(
      box(
        m,
        [(x0 + x1) / 2, y0, frontFace - (back + frontDepth) / 2],
        [x1 - x0, y1 - y0, frontDepth - back],
      ),
    );
  const niches = Math.round(floorWidth / 4);
  const nicheFoot = 0.25;
  const nicheTop = Math.min(deckBase - 0.2, nicheFoot + stageTop * 0.58);
  const half = floorWidth / 2;
  front(-half, half, 0, nicheFoot);
  front(-half, half, nicheTop, deckBase);
  let pier = -half;
  for (let i = 0; i < niches; i += 1) {
    const x = -half + (i + 0.5) * (floorWidth / niches);
    const w = i % 2 === 0 ? 1.4 : 1.1;
    front(pier, x - w / 2, nicheFoot, nicheTop);
    front(x - w / 2, x + w / 2, nicheFoot, nicheTop, 0.32, "shadow");
    pier = x + w / 2;
  }
  front(pier, half, nicheFoot, nicheTop);

  /*
   * The scaenae frons. Two storeys of aediculae at Aspendos and Side, three
   * at Hierapolis and Ephesus; at Miletus the columns stand in pairs on one
   * long podium. Each pair stands clear of the wall on its own base.
   */
  const aedicula = (x: number, base: number, height: number, project: number, shaft: Material) => {
    const diameter = height * 0.11;
    parts.push(
      box(screenStone, [x, base, wallZ + project], [diameter * 2.4, height * 0.09, diameter * 2.4]),
    );
    const made = column(
      screenStone,
      [x, base + height * 0.09, wallZ + project],
      diameter,
      height * 0.78,
      "composite",
      0,
      true,
    );
    for (const piece of made) {
      parts.push(
        piece.kind === "cylinder" && piece.segments >= 28 ? { ...piece, material: shaft } : piece,
      );
    }
    parts.push(
      ...cornice(
        screenStone,
        [x, base + height * 0.87, wallZ + project],
        diameter * 2.6,
        diameter * 2.6,
        height * 0.13,
      ),
    );
  };
  const shafts: Material[][] =
    ch.screen === "hierapolis"
      ? [["marble"], ["pavonazzetto"], ["marble"]]
      : ch.screen === "ephesus"
        ? [["granite"], ["marble", "pavonazzetto"], ["marble"]]
        : ch.screen === "side"
          ? [["granite", "gialloAntico"], ["marble"]]
          : ch.screen === "miletus"
            ? [["pavonazzetto"], ["marble"]]
            : [["granite", "pavonazzetto"], ["gialloAntico"]];
  storeys.forEach((storey, s) => {
    const project = 1.2 + s * 0.3;
    for (let i = 0; i <= bays; i += 1) {
      const x = -(screenSpan / 2) + i * bayWidth;
      const pick = shafts[s]!;
      const shaft = pick[i % pick.length]!;
      /*
       * The aediculae of the ground storey frame the doors; none stands in
       * one. On the regular grid a column fell on the axis of the royal door
       * and others across the guest doors, so an actor coming on met a
       * pedestal, and the doors read as blocked.
       */
      const half = ch.screen === "miletus" ? bayWidth * 0.14 : 0;
      if (
        s === 0 &&
        doors.some(([d, w]) => Math.abs(d - x) < w / 2 + half + storey.height * 0.11 * 1.2)
      )
        continue;
      if (ch.screen === "miletus") {
        // Paired columns, close together.
        aedicula(x - bayWidth * 0.14, storey.base, storey.height, project, shaft);
        aedicula(x + bayWidth * 0.14, storey.base, storey.height, project, shaft);
      } else {
        aedicula(x, storey.base, storey.height, project, shaft);
      }
    }
    // The continuous cornice the aediculae break forward from. The top
    // storey's is the crowning cornice below, laid over the same stone.
    if (s < storeys.length - 1)
      parts.push(
        ...cornice(
          screenStone,
          [0, storey.base + storey.height - 0.7, wallZ + 0.5],
          stageWidth * 0.94,
          1.5,
          0.7,
        ),
      );
    // Its middle course picked out in a red that has faded to a stain.
    if (s < storeys.length - 1)
      parts.push(
        paintBand(
          "fadedRed",
          [0, storey.base + storey.height - 0.7 + 0.233 + 0.03, wallZ + 0.5 + 0.75 + 0.07],
          FACING.north,
          stageWidth * 0.94 + 0.14,
          0.08,
        ),
      );
    // Windows in the upper storeys at Ephesus, where the wall was long and low.
    if (ch.screen === "ephesus" && s > 0) {
      for (let i = 0; i < bays; i += 1) {
        const x = -(screenSpan / 2) + (i + 0.5) * bayWidth;
        parts.push(
          box(
            "shadow",
            [x, storey.base + storey.height * 0.3, wallZ + 0.02],
            [bayWidth * 0.35, storey.height * 0.42, 0.12],
          ),
        );
      }
    }
  });
  const crown = storeys[storeys.length - 1]!.base + storeys[storeys.length - 1]!.height;

  /*
   * The carved friezes. At Hierapolis the bands between the storeys ran with
   * the myths of Apollo and Artemis, Dionysos and Demeter; at Side the base
   * of the wall carried the childhood of Dionysos and a row of masks. Shown
   * as a band of figures in low relief — the scenes themselves are not
   * modelled.
   */
  if (ch.screen === "hierapolis" || ch.screen === "side") {
    const bands =
      ch.screen === "hierapolis"
        ? storeys.slice(0, 2).map((s) => s.base + s.height - 1.6)
        : [stageTop + 0.1];
    for (const y of bands) {
      parts.push(box(screenStone, [0, y, wallZ + 0.35], [screenSpan, 0.9, 0.5]));
      // The ground the figures stand out from was painted, a blue gone grey.
      parts.push(paintBand("fadedBlue", [0, y + 0.05, wallZ + 0.6], FACING.north, screenSpan, 0.8));
      const figures = Math.floor(screenSpan / 0.55);
      const random = seeded(Math.round(y * 100));
      for (let i = 0; i < figures; i += 1) {
        const x = -screenSpan / 2 + (i + 0.5) * (screenSpan / figures);
        const h = 0.45 + random() * 0.35;
        parts.push(
          box(screenStone, [x, y + 0.08, wallZ + 0.64], [0.16 + random() * 0.12, h, 0.14]),
        );
        if (random() > 0.5)
          parts.push(cyl(screenStone, [x, y + 0.08 + h, wallZ + 0.66], 0.07, 0.07, 0.12, 6));
      }
    }
    if (ch.screen === "side") {
      // The masks along the stage front.
      for (let i = 0; i < 18; i += 1) {
        const x = -floorWidth / 2 + (i + 0.5) * (floorWidth / 18);
        parts.push(
          cyl(screenStone, [x, stageTop - 0.55, 0.05], 0.22, 0.22, 0.12, 12, { rotX: Math.PI / 2 }),
        );
      }
    }
  }

  // The crowning cornice, and what stood over the middle of it.
  parts.push(...cornice(screenStone, [0, crown - 0.8, wallZ + 0.7], stageWidth * 0.94, 1.8, 0.8));
  if (ch.screen === "side") {
    // A round pediment with a head crowned by Victories.
    parts.push(segmentalPediment(screenStone, [0, crown + 0.2, wallZ + 1.4], 4.2, 2.4));
    parts.push(
      cyl(screenStone, [0, crown + 1.4, wallZ + 2.65], 0.9, 0.9, 0.3, 18, { rotX: Math.PI / 2 }),
    );
  } else {
    parts.push(prism(screenStone, [0, crown, wallZ + 1.4], [16, 3, 2.6]));
  }
  if (ch.screen === "aspendos") {
    // Dionysos rising out of acanthus, in the gable of the central pediment.
    // (The timber roof over the stage is left out: only the sockets of its
    // beams survive, and a dark lid over the stage hid the wall it sheltered.)
    parts.push(
      cyl("marble", [0, crown + 1.0, wallZ + 2.75], 0.75, 0.75, 0.2, 16, { rotX: Math.PI / 2 }),
    );
  }

  // Beam sockets: a row of small square holes across each storey.
  for (const storey of storeys) {
    for (let i = 0; i < 26; i += 1) {
      const x = -(stageWidth * 0.44) + (stageWidth * 0.88 * i) / 25;
      parts.push(
        box("shadow", [x, storey.base + storey.height * 0.62, wallZ + 0.02], [0.55, 0.55, 0.12]),
      );
    }
  }

  /*
   * The dedication of the stage building, cut along the frieze of the lower
   * storey over the royal door. Aspendos' is known in both its languages —
   * the Curtii's gift "to the gods of the fatherland and the house of the
   * Augusti" (CIG 4342d4) — and is cut Latin on the left, Greek on the
   * right; Hierapolis' names Apollo Archegetes and the emperors. At Ephesus
   * and Side, where the stage building's own text is lost, the formula of
   * the place stands in for it, and Miletus' frieze is left plain: its
   * theatre speaks through its seats.
   */
  {
    const storey = storeys[0]!;
    const half = storey.height * 0.11 * 1.3;
    const clear = (x: number) =>
      doors.some(([d, dw]) => Math.abs(d - x) < dw / 2 + storey.height * 0.11 * 1.2);
    let edge = bayWidth;
    for (let i = 0; i <= bays; i += 1) {
      const x = -(screenSpan / 2) + i * bayWidth;
      if (x > 0 && !clear(x)) {
        edge = x - half - (ch.screen === "miletus" ? bayWidth * 0.14 : 0);
        break;
      }
    }
    const course = 0.7 / 3;
    const y = storey.base + storey.height - 0.7 + course * 0.1;
    const z = wallZ + 0.5 + 0.75;
    const span = Math.max(3, 2 * edge - 0.6);
    const dedications: Record<TheatreCharacter["screen"], EpigraphicText[]> = {
      // Aspendos' is cut larger on a frieze of its own, below.
      aspendos: [],
      hierapolis: [TEXTS.hierapolisDedication],
      ephesus: [TEXTS.ephesusStage],
      side: [TEXTS.sideStage],
      miletus: [],
    };
    const texts = dedications[ch.screen];
    // One line along the lowest course of the cornice, below its projection.
    texts.forEach((text, i) => {
      const width = span / texts.length;
      parts.push(
        ...inscription({
          at: [-span / 2 + width * (i + 0.5), y + course * 0.08, z],
          rotY: FACING.north,
          width: width - 0.4,
          letter: course * 0.62,
          text: { ...text, text: flowing(text).text as string },
        }),
      );
    });
  }

  /*
   * At Aspendos the dedication is meant to be read from the seats: a plain
   * marble frieze under the cornice of the lower storey, between the
   * aediculae and clear of the door cornices, its letters cut nearly a
   * quarter of a metre high in one line and painted red — the Latin across the left
   * half of the stage front, the Greek across the right.
   */
  if (ch.screen === "aspendos") {
    const storey = storeys[0]!;
    const diameter = storey.height * 0.11;
    const top = storey.base + storey.height - 0.7;
    const bottom =
      Math.max(...doors.filter(([x]) => x !== 0).map(([, , h]) => stageTop + h + 0.7)) + 0.06;
    // Clear of each aedicula's capital and broken-forward entablature.
    const clearOf = diameter * 1.3 + storey.height * 0.13 * 0.32 + 0.15;
    const royal = doors.find(([x]) => x === 0)!;
    const standing: number[] = [];
    for (let i = 0; i <= bays; i += 1) {
      const x = -(screenSpan / 2) + i * bayWidth;
      if (!doors.some(([d, w]) => Math.abs(d - x) < w / 2 + diameter * 1.2)) standing.push(x);
    }
    const edges = [-stageWidth * 0.47, ...standing, stageWidth * 0.47];
    const stretches: [number, number][] = [];
    for (let i = 0; i < edges.length - 1; i += 1) {
      const a = edges[i]! + (i === 0 ? 0 : clearOf);
      const b = edges[i + 1]! - (i === edges.length - 2 ? 0 : clearOf);
      // The royal door's cornice rises into the frieze; the halves stop at it.
      for (const [u, v] of a < 0 && b > 0
        ? [
            [a, -(royal[1] / 2 + 0.75)],
            [royal[1] / 2 + 0.75, b],
          ]
        : [[a, b]]) {
        if (v! - u! > 1.8) stretches.push([u!, v!]);
      }
    }
    const z = wallZ + 0.02;
    for (const [u, v] of stretches) {
      parts.push(box(screenStone, [(u + v) / 2, bottom, z + 0.04], [v - u, top - bottom, 0.12]));
    }
    const h = top - bottom;
    const margin = 0.2;
    const friezes: {
      text: EpigraphicText;
      half: [number, number][];
      pieces: string[];
      fit: number;
    }[] = [];
    for (const [text, half] of [
      [TEXTS.aspendosLatin, stretches.filter(([u]) => u < 0)],
      [TEXTS.aspendosGreek, stretches.filter(([u]) => u > 0)],
    ] as const) {
      const widths = half.map(([u, v]) => v - u - margin * 2);
      const lines = text.text as string[];
      // Latin words are parted by stops, not spaces: each stop is a place to
      // break, and the stone's own line ends get one when run together.
      const flat = text.script === "latin" ? lines.join("·").replace(/·/g, "· ") : lines.join(" ");
      const words = asCut(flat, text.script).split(" ");
      // Filled stretch by stretch, at the largest letter that takes it all.
      const pack = (letter: number) => {
        const out: string[] = [];
        let k = 0;
        for (const width of widths) {
          const line: string[] = [];
          while (k < words.length && measure([...line, words[k]].join(" ")) * letter <= width)
            line.push(words[k++]!);
          out.push(line.join(" "));
        }
        return k === words.length ? out : null;
      };
      let lo = 0.03;
      let hi = h - 0.3;
      for (let i = 0; i < 24; i += 1) {
        const mid = (lo + hi) / 2;
        if (pack(mid)) lo = mid;
        else hi = mid;
      }
      friezes.push({ text, half, pieces: pack(lo) ?? [], fit: lo });
    }
    // Both languages at one height, the smaller of the two that fit.
    const fit = Math.min(...friezes.map((f) => f.fit));
    for (const { text, half, pieces } of friezes) {
      pieces.forEach((piece, i) => {
        if (!piece) return;
        const [u, v] = half[i]!;
        parts.push(
          ...inscription({
            at: [(u + v) / 2, bottom + (h - fit) / 2, z + 0.1],
            rotY: FACING.north,
            width: v - u - margin * 2,
            letter: fit,
            text: { ...text, text: [piece], finish: "rubricated" },
          }),
        );
      });
    }
  }

  // Five doorways at stage level: the royal door in the middle, the guest
  // doors either side of it, and one at each end of the wall.
  for (const [x, width, height] of doors) {
    parts.push(box("shadow", [x, stageTop, wallZ + 0.02], [width, height, 0.14]));
    parts.push(...cornice(screenStone, [x, stageTop + height, wallZ + 0.3], width + 1.4, 1.1, 0.7));
  }

  /*
   * In front of the Hellenistic stage at Ephesus stood the proskenion, a low
   * colonnade the Roman stage kept. Its columns are a row along the front.
   */
  if (ch.screen === "ephesus") {
    const count = Math.round(floorWidth / 2.6);
    for (let i = 0; i <= count; i += 1) {
      const x = -floorWidth / 2 + (i * floorWidth) / count;
      parts.push(...column("marbleWorn", [x, 0, -0.5], 0.42, stageTop - 0.3, "plain", 0));
    }
  }

  /*
   * What lay beyond the stage building. At Side the stage backs straight on
   * to the square colonnaded agora, with the round temple of Tyche in the
   * middle of it; at Ephesus the theatre looks down Harbour Street, the
   * Arkadiane, colonnaded all the way to the harbour; at Miletus the theatre
   * stood over the Theatre Harbour itself.
   */
  const behind = wallZ - 9;
  if (ch.annex === "agora") {
    const side = 72;
    const cz = behind - side / 2 - 2;
    parts.push(scenery(box("terrazzo", [0, 0, cz], [side, 0.08, side])));
    const step = 4.5;
    const n = Math.round(side / step);
    for (let i = 0; i <= n; i += 1) {
      const u = -side / 2 + i * step;
      for (const [x, z] of [
        [u, cz - side / 2],
        [u, cz + side / 2],
        [-side / 2, cz + u],
        [side / 2, cz + u],
      ] as const) {
        for (const piece of column("marbleWorn", [x, 0.08, z], 0.6, 5.4, "ionic"))
          parts.push(scenery(piece));
      }
    }
    for (const [x, z, w, d] of [
      [0, cz - side / 2 - 3, side + 8, 0.8],
      [-side / 2 - 3, cz, 0.8, side],
      [side / 2 + 3, cz, 0.8, side],
    ] as const) {
      parts.push(scenery(box("stone", [x, 0, z], [w, 6, d])));
    }
    // The porticoes' tiled lean-to roofs, from the colonnades up to the walls.
    for (const [ex, ez, rotY, length] of [
      [0, cz - side / 2, FACING.south, side + 0.6],
      [-side / 2, cz, FACING.west, side + 0.6],
      [side / 2, cz, FACING.east, side + 0.6],
    ] as const) {
      parts.push(
        ...tiledSlope({
          eave: [ex, 5.5, ez],
          rotY,
          width: length,
          run: 2.6,
          rise: 0.5,
          antefixPaint: "fadedRed",
        }).map(scenery),
      );
    }
    // The tholos of Tyche, twelve columns in a ring on a stepped base.
    parts.push(scenery(cyl("marbleWorn", [0, 0, cz], 5.2, 5.2, 1, 24)));
    for (let i = 0; i < 12; i += 1) {
      const a = (TAU * i) / 12;
      for (const piece of column(
        "marble",
        [Math.cos(a) * 4.3, 1, cz + Math.sin(a) * 4.3],
        0.55,
        5.5,
        "composite",
        0,
      )) {
        parts.push(scenery(piece));
      }
    }
    parts.push(scenery(cyl("marble", [0, 6.5, cz], 4.9, 4.9, 0.8, 24)));
    parts.push(scenery(cyl("terracotta", [0, 7.3, cz], 5, 0.4, 2.4, 24)));
  } else if (ch.annex === "harbour-street") {
    const length = 160;
    const width = 11;
    parts.push(scenery(box("marbleWorn", [0, 0, behind - length / 2], [width, 0.1, length])));
    for (let i = 0; i <= length / 5; i += 1) {
      const z = behind - i * 5;
      for (const x of [-width / 2 - 0.6, width / 2 + 0.6]) {
        for (const piece of column("marbleWorn", [x, 0.1, z], 0.55, 5.2, "composite", 0))
          parts.push(scenery(piece));
      }
    }
    for (const x of [-width / 2 - 5, width / 2 + 5]) {
      parts.push(scenery(box("stone", [x, 0, behind - length / 2], [0.8, 6.2, length])));
      // The portico's lean-to roof, tiled, from the colonnade up to the back wall.
      const side = Math.sign(x);
      const eaveX = side * (width / 2 + 0.6);
      parts.push(
        ...tiledSlope({
          eave: [eaveX, 5.32, behind - length / 2],
          rotY: side > 0 ? FACING.east : FACING.west,
          width: length,
          run: Math.abs(x) - 0.4 - Math.abs(eaveX),
          rise: 0.86,
          antefixPaint: "fadedRed",
        }).map(scenery),
      );
    }
  } else if (ch.annex === "harbour") {
    const cz = behind - 70;
    parts.push(scenery(box("water", [0, -0.6, cz], [spec.caveaDiameter * 1.8, 0.4, 110])));
    parts.push(scenery(box("stone", [0, 0, behind - 13], [spec.caveaDiameter * 1.8, 1.0, 4])));
  }

  /*
   * The country round it: a hillside rising behind Ephesus and Hierapolis,
   * the flat town round Side, the coastal plain under Aspendos and Miletus.
   */
  parts.push(
    ...setting(outerRadius, 8803 + Math.round(spec.caveaDiameter), {
      stone: ch.ground === "plain" ? 0.4 : 0.7,
      grass: ch.ground === "plain" ? 0.5 : 0.8,
      hills: ch.ground === "hillside" ? 0.9 : 0.55,
    }),
  );
  return parts;
}

/**
 * The ends of the seating: the analemmata, the retaining walls that close
 * each wing of the cavea where it meets the side entrance. They were never
 * the bare cut of the fill the model used to show. They were the most
 * carefully built walls of the theatre, because everyone came in past them:
 * coursed ashlar with drafted margins round each block (the lower courses,
 * within reach, left with a raised face), a moulded foot, and a moulded
 * coping that runs up the rake of the seats as a parapet. Where the stage
 * building is bonded to the wings (Aspendos, Hierapolis, Side) the side
 * entrance between them is a barrel-vaulted passage with an arched mouth;
 * where a Greek horseshoe leaves the end wall standing free (Ephesus,
 * Miletus), a flight of steps runs up the outside of it to the first
 * walkway. Each end has a statue niche with an inscribed panel under it —
 * the parodoi were where cities put up their benefactors — carrying only
 * the formula such bases open with, not an invented name.
 */
function theatreWingEnds(
  spec: RomanTheatreSpec,
  L: ReturnType<typeof theatreLayout>,
  o: { wallStone: Material; screenStone: Material; wallThickness: number; galleryTop: number },
): Part[] {
  const parts: Part[] = [];
  const { character: ch, rows, rowAt, rowSpan, diazoma, orchestraRadius, outerRadius } = L;
  const { wallStone, screenStone, galleryTop } = o;
  /** How far the wall stands out from the cut end of the fill. */
  const face = 0.4;
  const parapet = 0.9;
  const coping = 0.42;
  const course = 0.66;
  const seatTop = (i: number) => rowAt(i).y + spec.seatRise + 0.06;
  const tiers = new Set(
    L.middle > 0 ? [spec.lowerRows - 1, spec.lowerRows + L.middle - 1] : [spec.lowerRows - 1],
  );
  const firstDiazoma = rowAt(spec.lowerRows - 1).outer;
  const rimTop = galleryTop + (ch.topGallery ? 4.5 : 1.4);
  const endR = outerRadius + (ch.facade === "none" ? 0.2 : o.wallThickness);
  // Rows that end at the same angle are closed by one wall: all of them on a
  // Roman plan, the lower and the upper rows apart on a horseshoe.
  const groups: { theta: number; from: number; to: number }[] = [];
  for (let i = 0; i < rows; i += 1) {
    const theta = rowSpan(i)[0];
    const last = groups[groups.length - 1];
    if (last && Math.abs(last.theta - theta) < 1e-9) last.to = i;
    else groups.push({ theta, from: i, to: i });
  }
  const roman = groups.length === 1;
  const hillside = ch.ground === "hillside";

  for (const side of [1, -1] as const) {
    groups.forEach((group, g) => {
      const outermost = g === groups.length - 1;
      const theta = side > 0 ? group.theta : Math.PI - group.theta;
      const radial: [number, number] = [Math.cos(theta), Math.sin(theta)];
      // Out of the end of the seating, away from the rows it closes.
      const n: [number, number] =
        side > 0 ? [Math.sin(theta), -Math.cos(theta)] : [-Math.sin(theta), Math.cos(theta)];
      const rotY = Math.atan2(n[0], n[1]);
      // The face's own x runs along the radius one way or the other.
      const sense = Math.cos(rotY) * radial[0] - Math.sin(rotY) * radial[1] > 0 ? 1 : -1;
      const r0 = group.from === 0 ? orchestraRadius : rowAt(group.from - 1).outer;
      const r1 = outermost ? endR : rowAt(group.to).outer;
      /** A point on the wall's front, `r` out along it, `y` up, `out` further forward. */
      const on = (r: number, y: number, out = 0): Vec3 => [
        radial[0] * r + n[0] * (face + out),
        y,
        radial[1] * r + n[1] * (face + out),
      ];
      const strip = (
        material: Material,
        ra: number,
        rb: number,
        y: number,
        h: number,
        out: number,
      ) =>
        // From a centimetre inside the wall to `out` in front of its face,
        // which the bevel of the wall's own edge sets two centimetres out.
        box(material, on((ra + rb) / 2, y, (out + 0.01) / 2), [rb - ra, h, out + 0.03], rotY);
      /** The stretches of `[ra, rb]` clear of the steps and the niche. */
      const clear = (ra: number, rb: number): [number, number][] => {
        let runs: [number, number][] = [[ra, rb]];
        for (const [h0, h1] of holes)
          runs = runs.flatMap(([a, b]): [number, number][] =>
            b <= h0 || a >= h1
              ? [[a, b]]
              : [
                  ...(a < h0 ? [[a, h0] as [number, number]] : []),
                  ...(b > h1 ? [[h1, b] as [number, number]] : []),
                ],
          );
        return runs.filter(([a, b]) => b - a > 0.05);
      };

      /*
       * The top of the wall: the seat line of the rows it closes, a parapet's
       * height above it, dropping to the walkway where a diazoma comes out
       * through it, and up to the rim behind the top row.
       */
      const line: [number, number][] = [];
      if (group.from === 0) line.push([orchestraRadius, spec.podiumHeight + parapet]);
      for (let i = group.from; i <= group.to; i += 1) {
        const { inner, outer } = rowAt(i);
        const first = i === group.from || tiers.has(i - 1);
        if (first && i > 0 && tiers.has(i - 1)) {
          // The walkway: open at the wall, so it can be reached from outside.
          const walk = seatTop(i - 1) + 0.06;
          line.push([inner - diazoma, walk], [inner, walk]);
        }
        if (first) line.push([inner, seatTop(i) + parapet]);
        if (tiers.has(i) || i === group.to) line.push([outer, seatTop(i) + parapet]);
      }
      if (outermost) line.push([rowAt(rows - 1).outer + 0.4, rimTop], [r1, rimTop]);
      // The walls: a slab standing proud of the fill, its outline the line above.
      const outline: [number, number][] = [
        [sense * r0, 0],
        [sense * r1, 0],
        ...[...line].reverse().map(([r, y]): [number, number] => [sense * r, y]),
      ];
      if (line[0]![0] > r0 + 1e-6) outline.push([sense * r0, line[0]![1]]);
      parts.push({
        kind: "carving",
        material: wallStone,
        at: [0, 0, 0],
        outline,
        depth: face + 0.05,
        sink: 0.05 / (face + 0.05),
        rotY,
      });
      /** How high the coursed face runs at radius `r`, under the coping. */
      const topAt = (r: number) => {
        for (let k = 0; k < line.length - 1; k += 1) {
          const [ra, ya] = line[k]!;
          const [rb, yb] = line[k + 1]!;
          if (r >= ra && r <= rb)
            return (
              (rb - ra < 1e-6 ? Math.min(ya, yb) : ya + ((r - ra) / (rb - ra)) * (yb - ya)) - coping
            );
        }
        return r < line[0]![0] ? line[0]![1] - coping : line[line.length - 1]![1] - coping;
      };
      /** Where the coursed face first reaches `y`, going out from the orchestra. */
      const startAt = (y: number) => {
        for (let r = r0; r < r1; r += 0.25) if (topAt(r) >= y && topAt(r + 0.25) >= y) return r;
        return r1;
      };
      /*
       * Where the steps and the niche go, worked out before the courses so
       * the raised block faces stop short of them.
       */
      const holes: [number, number][] = [];
      const x0 = Math.min(L.stageWidth * 0.94, spec.caveaDiameter * 0.62) / 2;
      const x1 = hillside ? outerRadius - 0.2 : r1;
      const stairTop = firstDiazoma + diazoma / 2;
      const level = seatTop(spec.lowerRows - 1) + 0.06;
      const rise = 0.25;
      const tread = 0.32;
      const steps = Math.ceil(level / rise);
      const landing = diazoma / 2 + 0.3;
      const stairFoot = stairTop + landing + (steps - 1) * tread;
      const niche = roman
        ? Math.max(x0 + 2.5, x1 - 4.5)
        : Math.min(r1 - 4, stairFoot + (r1 - stairFoot) * 0.45);
      if (outermost) {
        if (!roman) holes.push([stairTop - landing, stairFoot + 0.4]);
        holes.push([niche - 1.3, niche + 1.3]);
      }
      // The moulded foot.
      parts.push(strip(wallStone, r0, r1, 0, 0.5, 0.12), strip(wallStone, r0, r1, 0.5, 0.12, 0.05));
      /*
       * The courses. Within reach (the lowest ones), each block's face is
       * left raised inside a drafted margin; above, only the joints.
       */
      const joint: Material = wallStone === "limestone" ? "stone" : "stoneDark";
      const blockLength = 1.6;
      let row = 0;
      for (let y = 0.62; y < rimTop - coping - 0.2; y += course, row += 1) {
        const from = startAt(y + course);
        if (from >= r1 - 0.3) continue;
        if (y + course > 5.6) {
          for (const [a, b] of clear(startAt(y), r1))
            parts.push(strip(joint, a, b, y, 0.05, 0.035));
          continue;
        }
        // The joints and margins read dark between the raised faces.
        // Three and a half centimetres proud of the wall, and the faces as far
        // again: any closer and a phone's depth buffer mixes the two.
        for (const [a, b] of clear(from, r1)) parts.push(strip(joint, a, b, y, course, 0.035));
        for (let r = from + (row % 2 ? blockLength / 2 : 0); r < r1 - 0.3; r += blockLength) {
          const ra = Math.max(r, from);
          const rb = Math.min(r + blockLength, r1);
          if (rb - ra < 0.6) continue;
          if (holes.some(([h0, h1]) => rb > h0 && ra < h1)) continue;
          parts.push(strip(wallStone, ra + 0.05, rb - 0.05, y + 0.05, course - 0.1, 0.07));
        }
      }
      // The coping up the rake: a fascia, and a crown over it.
      for (let k = 0; k < line.length - 1; k += 1) {
        const [ra, ya] = line[k]!;
        const [rb, yb] = line[k + 1]!;
        if (rb - ra < 1e-3) continue;
        for (const [below, above, out] of [
          [coping, 0.1, 0.1],
          [0.1, 0, 0.18],
        ] as const) {
          parts.push({
            kind: "carving",
            material: wallStone,
            at: [0, 0, 0],
            outline: [
              [sense * ra, ya - below],
              [sense * rb, yb - below],
              [sense * rb, yb - above],
              [sense * ra, ya - above],
            ],
            depth: face + out + 0.05,
            sink: 0.05 / (face + out + 0.05),
            rotY,
          });
        }
      }
      if (!outermost) return;

      /* ---- The side entrance, the steps, the statue ---------------------- */
      if (roman) {
        /*
         * The vaulted passage between the end wall and the stage building,
         * from the end of the stage out to the town, and its arched mouth.
         */
        const near = -face;
        const far = L.wallZ;
        const radius = (near - far) / 2;
        const zc = (near + far) / 2;
        // The passage's own across-coordinate runs along -z on the right, +z on the left.
        const uc = side > 0 ? -zc : zc;
        const spring = 4.2;
        const crown = spring + radius + 0.8;
        const arc: [number, number][] = [];
        for (let k = 1; k < 16; k += 1) {
          const a = (k / 16) * Math.PI;
          arc.push([uc + radius * Math.cos(a), spring + radius * Math.sin(a)]);
        }
        parts.push({
          kind: "carving",
          material: wallStone,
          at: [side * x0, 0, 0],
          outline: [
            [uc - radius, spring],
            [uc - radius, crown],
            [uc + radius, crown],
            [uc + radius, spring],
            ...arc,
          ],
          depth: x1 - x0,
          sink: 0,
          rotY: side * (Math.PI / 2),
        });
        if (!hillside) {
          // The mouth: a moulded archivolt on pilasters, a keystone, and a
          // pier carrying it on the stage building's side.
          const mouth = side * (x1 + 0.02);
          const archivolt: [number, number][] = [];
          for (let k = 0; k <= 16; k += 1) {
            const a = (k / 16) * Math.PI;
            archivolt.push([(radius + 0.6) * Math.cos(a), spring + (radius + 0.6) * Math.sin(a)]);
          }
          for (let k = 16; k >= 0; k -= 1) {
            const a = (k / 16) * Math.PI;
            archivolt.push([radius * Math.cos(a), spring + radius * Math.sin(a)]);
          }
          parts.push({
            kind: "carving",
            material: screenStone,
            at: [mouth, 0, zc],
            outline: archivolt,
            depth: 0.3,
            sink: 0.3,
            rotY: side > 0 ? FACING.east : FACING.west,
          });
          const stageEnd = L.stageWidth / 2;
          if (stageEnd < x1 - 0.05) {
            parts.push(
              box(
                wallStone,
                [side * ((stageEnd + x1) / 2), 0, far - 0.45],
                [x1 - stageEnd, crown, 0.9],
              ),
            );
          }
          for (const zp of [near + 0.3, far - 0.3]) {
            parts.push(
              box(screenStone, [mouth + side * 0.13, 0, zp], [0.16, spring - 0.32, 0.6]),
              box(screenStone, [mouth + side * 0.2, spring - 0.32, zp], [0.3, 0.34, 0.8]),
            );
          }
          parts.push(
            // The keystone, standing well out of the arch's own face.
            box(screenStone, [mouth + side * 0.15, spring + radius - 0.1, zc], [0.3, 0.85, 0.6]),
          );
        }
      } else {
        /*
         * The steps up the outside of the end wall to the first walkway,
         * which comes out through the wall at the top of them.
         */
        const width = 1.6;
        // The landing, against the wall where the walkway comes out.
        parts.push(box(wallStone, on(stairTop, 0, width / 2), [landing * 2, level, width], rotY));
        for (let k = 0; k < steps - 1; k += 1) {
          const r = stairTop + landing + (k + 0.5) * tread;
          parts.push(
            box(
              wallStone,
              on(r, 0, width / 2),
              [tread + 0.01, level - (k + 1) * rise, width],
              rotY,
            ),
          );
        }
        // Its parapet, raking down with the flight.
        parts.push({
          kind: "carving",
          material: wallStone,
          at: [n[0] * (face + width), 0, n[1] * (face + width)],
          outline: [
            [sense * (stairTop - landing), level],
            [sense * (stairTop + landing), level],
            [sense * stairFoot, 0.3],
            [sense * stairFoot, 1.2],
            [sense * (stairTop + landing), level + 0.95],
            [sense * (stairTop - landing), level + 0.95],
          ],
          depth: 0.3,
          sink: 0.5,
          rotY,
        });
      }

      /*
       * The statue niche: a round-headed recess framed by an archivolt on two
       * pilasters, a benefactor in it, and an inscribed panel under it.
       */
      const nw = 1.5;
      const nh = 3.2;
      const sill = 1.6;
      parts.push(
        box("shadow", on(niche, sill, 0.01), [nw, nh - nw / 2, 0.06], rotY),
        cyl("shadow", on(niche, sill + nh - nw / 2, 0.01), nw / 2, nw / 2, 0.06, 14, {
          rotX: Math.PI / 2,
          rotY,
          thetaStart: Math.PI / 2,
          thetaLength: Math.PI,
        }),
      );
      const frame: [number, number][] = [];
      for (let k = 0; k <= 12; k += 1) {
        const a = (k / 12) * Math.PI;
        frame.push([(nw / 2 + 0.22) * Math.cos(a), nh - nw / 2 + (nw / 2 + 0.22) * Math.sin(a)]);
      }
      frame.push([-(nw / 2 + 0.22), 0], [-nw / 2, 0]);
      for (let k = 12; k >= 0; k -= 1) {
        const a = (k / 12) * Math.PI;
        frame.push([(nw / 2) * Math.cos(a), nh - nw / 2 + (nw / 2) * Math.sin(a)]);
      }
      frame.push([nw / 2, 0], [nw / 2 + 0.22, 0]);
      parts.push({
        kind: "carving",
        material: screenStone,
        at: on(niche, sill),
        outline: frame,
        depth: 0.14,
        sink: 0.3,
        rotY,
      });
      // The ledge the statue stands on, deep enough to carry it.
      parts.push(box(screenStone, on(niche, sill - 0.2, 0.42), [nw + 0.8, 0.2, 0.9], rotY));
      /*
       * The benefactor in the niche, in the round: a togate statue standing
       * on the ledge, from the scans of the Arringatore and the veiled
       * Tiberius, one each side. It was once cut as a silhouette in relief,
       * which read as a cardboard cut-out from anywhere but square on.
       */
      parts.push({
        kind: "figure",
        material: screenStone,
        at: on(niche, sill, 0.4),
        height: 2.5,
        rotY,
        identity: {
          name: "Benefactor",
          sex: "male",
          bearded: false,
          hair: "short",
          dress: "toga",
          left: "scroll",
        },
        scan: { id: side > 0 ? "arringatore" : "tiberius-velatus" },
      });
      // Under it, the panel with its text: the formula such bases open with.
      parts.push(
        ...inscribedPanel({
          // Over the moulded foot, not sunk into it.
          at: on(niche, 0.66, 0.02),
          rotY,
          width: 1.3,
          height: 0.72,
          material: screenStone,
          letter: 0.075,
          text: TEXTS.honorificFormula,
        }),
      );
    });
  }
  return parts;
}

/* ------------------------------------------------------------------ *
 * A dipteral Ionic temple
 * ------------------------------------------------------------------ */

/** Length runs along z, width along x; the front (pronaos) faces -z. */
export function ionicDipterosParts(spec: IonicDipterosSpec): Part[] {
  const parts: Part[] = [];
  const stepRise = 0.5;
  const platform = spec.crepidomaSteps * stepRise;
  const insetW = (spec.crepidomaWidth - spec.stylobateWidth) / 2 / spec.crepidomaSteps;
  const insetL = (spec.crepidomaLength - spec.stylobateLength) / 2 / spec.crepidomaSteps;

  const crepidoma: number[] = [];
  for (let i = 0; i < spec.crepidomaSteps; i += 1) {
    crepidoma.push(parts.length);
    parts.push(
      box(
        "marbleWorn",
        [0, i * stepRise, 0],
        [spec.crepidomaWidth - 2 * i * insetW, stepRise, spec.crepidomaLength - 2 * i * insetL],
      ),
    );
  }

  const y0 = platform;
  const radius = spec.columnDiameter / 2;
  // Counted as they go up, because the count is a claim the model has to meet:
  // Pliny said the Artemision stood on 127 columns, and it does.
  let raised = 0;
  const raise = (x: number, z: number) => {
    if (raised >= spec.totalColumns) return;
    raised += 1;
    parts.push(
      ...column(
        "marble",
        [x, y0, z],
        spec.columnDiameter,
        spec.columnHeight,
        "ionic",
        undefined,
        true,
      ),
    );
  };

  // Two rings of columns: 10 x 21 outside, one intercolumniation in, 8 x 19.
  const gridWidth = spec.stylobateWidth - 3;
  const gridLength = spec.stylobateLength - 3;
  const stepX = gridWidth / (spec.outerColumnsShort - 1);
  const stepZ = gridLength / (spec.outerColumnsLong - 1);

  const perimeter = (cols: number, rowsAlong: number, halfW: number, halfL: number) => {
    for (let i = 0; i < cols; i += 1) {
      for (let k = 0; k < rowsAlong; k += 1) {
        const onEdge = i === 0 || i === cols - 1 || k === 0 || k === rowsAlong - 1;
        if (!onEdge) continue;
        const x = -halfW + (2 * halfW * i) / (cols - 1);
        const z = -halfL + (2 * halfL * k) / (rowsAlong - 1);
        raise(x, z);
      }
    }
  };

  const dipteral = (spec.rings ?? 2) === 2;
  perimeter(spec.outerColumnsShort, spec.outerColumnsLong, gridWidth / 2, gridLength / 2);
  // A pseudodipteros keeps the second ring's spacing and leaves its place empty.
  if (dipteral) {
    perimeter(
      spec.outerColumnsShort - 2,
      spec.outerColumnsLong - 2,
      gridWidth / 2 - stepX,
      gridLength / 2 - stepZ,
    );
  }

  // Architrave, frieze and cornice, carried only over the colonnade: the court
  // inside was open to the sky and never took a roof.
  const beamTop = y0 + spec.columnHeight;
  /*
   * The outer entablature, as an Ionic one is built: an architrave of three
   * stepped fasciae, a frieze painted blue behind its ornament, a row of
   * dentils, the cornice, and the sima along the top with its lion-head
   * waterspouts. The inner one is left a plain beam, since it is seen only
   * from below.
   */
  const ionicBeam = (halfW: number, halfL: number) => {
    const H = spec.entablatureHeight;
    const t = radius * 2.6;
    const runs: { c: Vec3; len: number; along: "x" | "z"; out: Vec3 }[] = [];
    for (const side of [-1, 1]) {
      runs.push({ c: [side * halfW, 0, 0], len: halfL * 2 + t, along: "z", out: [side, 0, 0] });
      runs.push({ c: [0, 0, side * halfL], len: halfW * 2 + t, along: "x", out: [0, 0, side] });
    }
    for (const r of runs) {
      /*
       * A course from the inner face of the beam out to `depth`, running on
       * at each end to the outer face of the run it meets, so the two meet
       * flush rather than two centimetres short. Paint is a skin on the
       * outside, not a block reaching back to the inner face, where it lay
       * in the same plane as the marble and fought it.
       */
      const course = (y: number, h: number, depth: number, material: Material = "marble") => {
        const grow = depth - t;
        const paint = material === "paintBlue" || material === "paintGold";
        const skin = paint ? Math.min(depth, grow + 0.1) : depth;
        const mid = depth - t / 2 - skin / 2;
        parts.push(
          box(
            material,
            [r.c[0] + r.out[0] * mid, y, r.c[2] + r.out[2] * mid],
            r.along === "z" ? [skin, h, r.len + grow * 2] : [r.len + grow * 2, h, skin],
          ),
        );
      };
      // The three fasciae, each a little proud of the one below.
      course(beamTop, H * 0.13, t);
      course(beamTop + H * 0.13, H * 0.13, t + 0.06);
      course(beamTop + H * 0.26, H * 0.13, t + 0.12);
      // The frieze, and its painted ground.
      course(beamTop + H * 0.39, H * 0.24, t);
      course(beamTop + H * 0.42, H * 0.18, t + 0.04, "paintBlue");
      // A gilded moulding, the dentils, the cornice and the sima.
      course(beamTop + H * 0.63, H * 0.04, t + 0.18, "paintGold");
      const toothH = H * 0.09;
      const spacing = toothH * 1.6;
      const count = Math.min(240, Math.floor(r.len / spacing));
      for (let i = 0; i < count; i += 1) {
        const u = -r.len / 2 + spacing * (i + 0.5);
        const off = (t + 0.3) / 2;
        parts.push(
          box(
            "marble",
            r.along === "z"
              ? [r.c[0] + r.out[0] * off, beamTop + H * 0.67, u]
              : [u, beamTop + H * 0.67, r.c[2] + r.out[2] * off],
            r.along === "z" ? [0.18, toothH, toothH] : [toothH, toothH, 0.18],
          ),
        );
      }
      course(beamTop + H * 0.67, H * 0.09, t + 0.12);
      course(beamTop + H * 0.76, H * 0.14, t + 0.6);
      course(beamTop + H * 0.9, H * 0.1, t + 0.56, "paintRed");
      /*
       * The egg-and-dart under the cornice of the two fronts, its eggs and
       * darts told apart by colour — what is left of it a stain of red and
       * a grey ghost of blue.
       */
      if (r.along === "x") {
        parts.push(
          ...paintedRun(
            ["fadedRed", "fadedBlue"],
            [r.c[0], beamTop + H * 0.78, r.c[2] + r.out[2] * (0.3 + (t + 0.6) / 2)],
            r.out[2] < 0 ? FACING.south : FACING.north,
            r.len,
            H * 0.08,
            0.42,
          ),
        );
      }
      // Lion-head spouts along the sima of the long sides.
      if (r.along === "z") {
        const spouts = Math.floor(r.len / 3.2);
        for (let i = 0; i < spouts; i += 1) {
          const u = -r.len / 2 + 3.2 * (i + 0.5);
          const px = r.c[0] + r.out[0] * ((t + 0.56) / 2 + 0.1);
          parts.push(
            cyl("marble", [px, beamTop + H * 0.95, u], H * 0.06, H * 0.05, 0.25, 10, {
              rotX: Math.PI / 2,
              rotY: r.out[0] * (Math.PI / 2),
            }),
          );
          parts.push(
            cyl(
              "marble",
              [px + r.out[0] * 0.05, beamTop + H * 0.9, u],
              H * 0.025,
              H * 0.02,
              0.35,
              6,
              { rotX: Math.PI / 2, rotY: r.out[0] * (Math.PI / 2) },
            ),
          );
        }
      }
    }
  };
  const beam = (halfW: number, halfL: number) => {
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "marble",
          [side * halfW, beamTop, 0],
          [radius * 2.6, spec.entablatureHeight, halfL * 2 + radius * 2.6],
        ),
      );
      parts.push(
        box(
          "marble",
          [0, beamTop, side * halfL],
          [halfW * 2 + radius * 2.6, spec.entablatureHeight, radius * 2.6],
        ),
      );
    }
  };
  ionicBeam(gridWidth / 2, gridLength / 2);
  if (dipteral) beam(gridWidth / 2 - stepX, gridLength / 2 - stepZ);
  /*
   * The dedication, cut along the top fascia of the front architrave over
   * the middle of the front — where the Romans put the name of the god and
   * of whoever paid for a temple. None of these three temples' own
   * architrave texts survives, so each carries the dedication formula of its
   * sanctuary, as its votive inscriptions give it: to Artemis of Ephesus, to
   * Apollo of Didyma, to Zeus of the Aizanoi and the emperor (see
   * `epigraphy.ts`, where each is marked as a formula, not the text).
   */
  {
    const H = spec.entablatureHeight;
    const t = radius * 2.6;
    const face = -(gridLength / 2) - t / 2 - 0.12;
    const text =
      spec.cultStatue === "artemis"
        ? TEXTS.artemisDedication
        : spec.cultStatue === "zeus"
          ? TEXTS.aizanoiDedication
          : TEXTS.didymaDedication;
    parts.push(
      ...inscription({
        at: [0, beamTop + H * 0.26 + H * 0.13 * 0.18, face],
        rotY: FACING.south,
        width: gridWidth * (spec.interior === "cella" ? 0.62 : 0.44),
        letter: H * 0.13 * 0.62,
        text,
      }),
    );
  }

  if (spec.interior === "open-court") {
    /*
     * The frieze that ran above the outer colonnade, carrying the Medusa heads
     * that are the one piece of Didyma everybody has seen. Photographed from
     * the block lying on the site, and set on the front where the visitor
     * meets it.
     */
    const friezeHeight = spec.entablatureHeight * 0.42;
    const friezeZ = -(gridLength / 2 + radius * 1.3);
    parts.push(
      box(
        "marble",
        [0, beamTop + spec.entablatureHeight, friezeZ],
        [gridWidth * 0.62, friezeHeight, 0.5],
      ),
    );
    // The block itself, from its scan; the photograph stays as the fallback
    // the part carries, and is what the credits list for it.
    parts.push({
      ...relief(
        "marble",
        [0, beamTop + spec.entablatureHeight, friezeZ - 0.27],
        [friezeHeight * 1.6, friezeHeight],
        CARVINGS.medusa,
        Math.PI,
      ),
      scan: { id: "didyma-medusa" },
    });
  } else {
    /*
     * The columnae caelatae: Pliny counts 36 columns carved in relief at the
     * base, and here they are — the sculpted drum photographed in the British
     * Museum, wrapped round the lowest drum of the front columns.
     */
    let carved = 0;
    for (let i = 0; i < spec.outerColumnsShort && carved < (spec.reliefColumns ?? 0); i += 1) {
      for (const z of [-(gridLength / 2), -(gridLength / 2 - stepZ)]) {
        if (carved >= (spec.reliefColumns ?? 0)) break;
        const x = -gridWidth / 2 + (gridWidth * i) / (spec.outerColumnsShort - 1);
        // The surviving drum itself, scanned in the round and wrapped about
        // the column's axis rather than laid on its face.
        parts.push({
          ...relief(
            "marble",
            [x, y0 + spec.columnHeight * 0.035, z - spec.columnDiameter * 0.48],
            [spec.columnDiameter * 0.92, spec.columnHeight * 0.1],
            CARVINGS.artemisionDrum,
            Math.PI,
          ),
          scan: {
            id: "artemision-drum",
            centre: [x, y0 + spec.columnHeight * 0.035, z],
            diameter: spec.columnDiameter * 1.16,
          },
        });
        carved += 1;
      }
    }
  }

  /* What the columns surround: at Didyma an open court walled to 25 m, at the
     Artemision a roofed cella. */
  const courtWidth = spec.courtWidth;
  const courtLength = spec.courtLength;
  const wallThickness = 2.4;
  const courtCentre = gridLength / 2 - stepZ - courtLength / 2 - 5;
  const halfCW = courtWidth / 2;
  const halfCL = courtLength / 2;

  for (const side of [-1, 1]) {
    parts.push(
      box(
        "marbleWorn",
        [side * (halfCW + wallThickness / 2), y0, courtCentre],
        [wallThickness, spec.sekosWallHeight, courtLength + wallThickness * 2],
      ),
    );
  }
  parts.push(
    box(
      "marbleWorn",
      [0, y0, courtCentre + halfCL + wallThickness / 2],
      [courtWidth + wallThickness * 2, spec.sekosWallHeight, wallThickness],
    ),
  );
  const portalWidth = 5.6;
  /*
   * The dressing of the sekos walls. A Greek temple wall is not a slab: it
   * stands on a moulded foot (the toichobate), is laid in courses of
   * squared blocks whose joints draw lines along it, and is finished under
   * the roof by a crowning moulding. At Didyma the walls of the open court
   * were articulated inside by pilasters standing on a socle higher than a
   * man, and the court's sunken floor is ringed by it.
   */
  {
    const H = spec.sekosWallHeight;
    const outerX = halfCW + wallThickness;
    const backZ = courtCentre + halfCL + wallThickness;
    const frontZ = courtCentre - halfCL - wallThickness;
    const longRun = courtLength + wallThickness * 2;
    const crossRun = courtWidth + wallThickness * 2;
    // Each outer face: where it is, which way it looks, and how long it runs.
    const faces: { at: [number, number]; rotY: number; length: number; front?: boolean }[] = [
      { at: [outerX, courtCentre], rotY: FACING.east, length: longRun },
      { at: [-outerX, courtCentre], rotY: FACING.west, length: longRun },
      { at: [0, backZ], rotY: FACING.north, length: crossRun },
      { at: [0, frontZ], rotY: FACING.south, length: crossRun, front: true },
    ];
    const course = 0.72;
    for (const face of faces) {
      const band = (y: number, height: number, proud: number, material: Material) => {
        const c = Math.cos(face.rotY);
        const sn = Math.sin(face.rotY);
        const make = (u: number, length: number) =>
          parts.push(
            box(
              material,
              [face.at[0] + sn * (proud / 2) + c * u, y, face.at[1] + c * (proud / 2) - sn * u],
              [length, height, proud],
              face.rotY,
            ),
          );
        if (face.front) {
          // Interrupted by the portal.
          const piece = (face.length - portalWidth) / 2;
          for (const side of [-1, 1]) {
            const u = side * (portalWidth / 2 + piece / 2);
            // At Aizanoi the joints stop at the lettered field beside the door
            // (below), rather than running across its face.
            const field = spec.cultStatue === "zeus" && y > y0 + 1.45 && y < y0 + 4.25;
            if (field && c * u < 0) {
              for (const end of [-1, 1]) make(u + end * (piece / 2 - 0.3), 0.6);
            } else make(u, piece);
          }
        } else make(0, face.length);
      };
      band(y0, 0.62, 0.16, "marble");
      band(y0 + 0.62, 0.14, 0.08, "marble");
      for (let y = y0 + 0.76 + course; y < y0 + H - 1; y += course) {
        // A joint every course, proud so it can catch the light — and far
        // enough out that a phone's depth buffer still parts it from the wall.
        band(y, 0.04, 0.035, "stone");
      }
      band(y0 + H - 0.62, 0.62, 0.18, "marble");
    }
    if (spec.cultStatue === "zeus") {
      /*
       * Aizanoi's temple walls carried the city's correspondence with Rome
       * about the sanctuary's land, cut in Hadrian's time. A proconsul's
       * letter to the city (MAMA IX List 179 P24) is set on the front wall
       * of the cella, beside the door, on a dressed field.
       */
      const piece = (crossRun - portalWidth) / 2;
      parts.push(
        ...inscribedPanel({
          at: [-(portalWidth / 2 + piece / 2), y0 + 1.5, frontZ],
          rotY: FACING.south,
          width: piece - 1.2,
          height: 2.7,
          material: "marble",
          letter: 0.075,
          text: TEXTS.aizanoiLetter,
        }),
      );
    }
    if (spec.interior !== "cella") {
      // Inside the court: the socle, and pilasters on it carrying the wall's top.
      const floor = y0 - 1.1;
      const socle = 5.3;
      const pilasters = Math.max(6, Math.round(courtLength / 6));
      for (const side of [-1, 1]) {
        const x = side * halfCW;
        parts.push(
          box(
            "marble",
            [x - side * 0.15, floor + socle - 0.4, courtCentre],
            [0.3, 0.4, courtLength],
          ),
        );
        for (let i = 0; i < pilasters; i += 1) {
          const z = courtCentre - halfCL + ((i + 0.5) * courtLength) / pilasters;
          const top = y0 + H - 1.6;
          parts.push(
            box("marble", [x - side * 0.14, floor + socle, z], [0.28, top - floor - socle, 1.1]),
          );
          parts.push(box("marble", [x - side * 0.2, top, z], [0.4, 0.7, 1.5]));
        }
      }
      parts.push(
        box(
          "marble",
          [0, floor + socle - 0.4, courtCentre + halfCL - 0.15],
          [courtWidth, 0.4, 0.3],
        ),
      );
    }
  }

  // The front wall of the court, pierced by the great portal nobody walked
  // through: the opening sits above the floor of the porch.
  // Didyma's portal is 14 m; a cella door is a door. Either way it has to stay
  // inside the wall it is cut through.
  const portalHeight = Math.min(14, spec.sekosWallHeight * 0.72);
  for (const side of [-1, 1]) {
    const from = side * (portalWidth / 2);
    const to = side * (halfCW + wallThickness);
    parts.push(
      box(
        "marbleWorn",
        [(from + to) / 2, y0, courtCentre - halfCL - wallThickness / 2],
        [Math.abs(to - from), spec.sekosWallHeight, wallThickness],
      ),
    );
  }
  parts.push(
    box(
      "marbleWorn",
      [0, y0 + portalHeight, courtCentre - halfCL - wallThickness / 2],
      [portalWidth, spec.sekosWallHeight - portalHeight, wallThickness],
    ),
  );
  /*
   * Didyma's portal is drawn as the dark mouth it was — its sill stood well
   * above the porch floor, and the court was reached by the tunnels. A cella
   * door is a door: the room behind it is built, with its god in it, so it
   * is left open to see into and to walk through. Filled with the dark
   * panel, it was a wall to a walker and a black slab seen from inside.
   */
  if (spec.interior !== "cella") {
    parts.push(
      box(
        "shadow",
        [0, y0, courtCentre - halfCL - wallThickness],
        [portalWidth, portalHeight, 0.3],
      ),
    );
  }
  // The court floor sits below the porch, reached by the two sloping tunnels.
  parts.push(box("stone", [0, y0 - 1.4, courtCentre], [courtWidth, 0.3, courtLength]));
  if (spec.interior !== "cella") {
    /*
     * So the upper steps of the platform stop at the court's edge. Laid as
     * solid slabs right across, they buried the sunken floor under a metre
     * of marble — and with it the naiskos's base, the laurels' roots and the
     * shins of everyone standing in the court.
     */
    const floorTop = y0 - 1.1;
    for (const index of [...crepidoma].reverse()) {
      const step = parts[index] as Extract<Part, { kind: "box" }>;
      if (step.at[1] + step.size[1] <= floorTop + 1e-6) continue;
      const [W, H, L] = step.size;
      const y = step.at[1];
      const front = courtCentre - halfCL;
      const back = courtCentre + halfCL;
      parts.splice(
        index,
        1,
        box("marbleWorn", [-(W / 2 + halfCW) / 2, y, 0], [W / 2 - halfCW, H, L]),
        box("marbleWorn", [(W / 2 + halfCW) / 2, y, 0], [W / 2 - halfCW, H, L]),
        box("marbleWorn", [0, y, (-L / 2 + front) / 2], [courtWidth, H, front + L / 2]),
        box("marbleWorn", [0, y, (back + L / 2) / 2], [courtWidth, H, L / 2 - back]),
      );
    }
  }

  // Pronaos: rows of columns in front of the portal, and then as many more
  // rows as it takes to stand up the number the sources count.
  const pronaosFront = courtCentre - halfCL - wallThickness - 2.5;
  for (let row = 0; raised < spec.totalColumns && row < spec.pronaosRows + 6; row += 1) {
    for (let i = 0; i < spec.pronaosPerRow; i += 1) {
      const x = -halfCW + (courtWidth * i) / (spec.pronaosPerRow - 1);
      raise(x, pronaosFront - row * stepZ * 0.62);
    }
  }

  if (spec.interior === "cella") {
    /*
     * A roofed cella, and a gabled roof over the whole peristyle. The slope is
     * built as a stack of narrowing courses rather than as tilted planes: the
     * part list has no way to tip a slab, and a stepped gable at least carries
     * the right silhouette and the right shadow.
     */
    const eaves = beamTop + spec.entablatureHeight;
    const roofHalf = gridWidth / 2 + radius * 1.3;
    const roofLength = gridLength + radius * 2.6;
    const pitch = roofHalf * 0.36;
    /*
     * The roof itself is one gabled mass, its slopes laid in tiles: flat pans
     * and the half-round covers over their joints in rows down to the eaves,
     * where each row ends in an antefix with a painted palmette. It stands a
     * few centimetres over the pediments' raking edges, so their stone and
     * its clay never share a plane.
     */
    const lift = 0.06;
    const roofWidth = roofHalf + lift / (pitch / roofHalf);
    parts.push(prism("terracotta", [0, eaves, 0], [roofWidth * 2, pitch + lift, roofLength]));
    /*
     * The ceiling over the walkways, laid on the architraves: looking up
     * between the columns, a visitor saw a coffered ceiling, not the black
     * underside of the clay roof (which is what the walk showed until now).
     * Its edges stay inside the entablature, so it shows only from below.
     */
    parts.push(
      box(
        "marbleWorn",
        [0, eaves - 0.32, 0],
        [gridWidth + radius * 1.6, 0.18, gridLength + radius * 1.6],
      ),
    );
    parts.push(
      ...gableTiles({
        at: [0, eaves, 0],
        rotY: 0,
        halfWidth: roofWidth,
        length: roofLength - 0.2,
        pitch: pitch + lift,
        slab: false,
        cover: 0.11,
        antefixPaint: "fadedRed",
      }),
    );
    // The pediments stand 3 cm proud of the stepped roof's ends: flush with
    // them, the two stones fought over every pixel of the gable.
    for (const side of [-1, 1]) {
      parts.push(
        prism("marble", [0, eaves, side * (roofLength / 2 - 0.57)], [roofHalf * 2, pitch, 1.2]),
      );
    }
    // The cult statue, standing in the dark at the back of the cella.
    parts.push(box("marbleWorn", [0, y0, courtCentre + halfCL - 6], [4, 1.2, 4]));
    parts.push({
      ...person(
        [0, y0 + 1.2, courtCentre + halfCL - 6],
        6,
        Math.PI,
        "marbleWorn",
        spec.cultStatue === "artemis"
          ? IDENTITIES.artemisEphesia
          : spec.cultStatue === "zeus"
            ? IDENTITIES.zeus
            : IDENTITIES.didymaApollo,
        spec.cultStatue === "artemis"
          ? PAINT.artemisEphesia
          : spec.cultStatue === "zeus"
            ? PAINT.zeus
            : PAINT.apollo,
      ),
      /*
       * Zeus stands in a real Roman scan of the bearded god of the type, and
       * the Ephesian Artemis in the Cybele of Pergamon: the same old mother
       * goddess of Anatolia, standing frontal in her mural crown between her
       * lions, as the Ephesian goddess stood between her beasts.
       */
      ...(spec.cultStatue === "zeus"
        ? { scan: { id: "neptune" as const } }
        : spec.cultStatue === "artemis"
          ? { scan: { id: "cybele" as const } }
          : {}),
    });
  } else {
    // The naiskos: a small temple standing alone in the open court, over the
    // spring the oracle answered from.
    const nx = spec.naiskosWidth;
    const nz = spec.naiskosLength;
    const naiskosZ = courtCentre + halfCL - nz / 2 - 6;
    parts.push(box("marble", [0, y0 - 1.4, naiskosZ], [nx + 1.6, 1.1, nz + 1.6]));
    parts.push(box("marble", [0, y0 - 0.3, naiskosZ + 2.4], [nx, 6.4, nz - 4.8]));
    for (let i = 0; i < 4; i += 1) {
      const x = -nx / 2 + 0.9 + (i * (nx - 1.8)) / 3;
      parts.push(...column("marble", [x, y0 - 0.3, naiskosZ - nz / 2 + 1.2], 1, 6.4, "ionic"));
    }
    parts.push(box("marble", [0, y0 + 6.1, naiskosZ], [nx + 0.8, 0.8, nz + 0.8]));
    parts.push(prism("marble", [0, y0 + 6.9, naiskosZ - nz / 2 + 0.4], [nx + 0.8, 2, 0.8]));
  }

  /*
   * Both temples stand on flat, open ground — Didyma on the Milesian
   * peninsula, the Artemision on the marshy floor of the Cayster. Scrub and
   * thin soil, and the horizon a long way off.
   */
  parts.push(
    ...setting(Math.max(spec.crepidomaWidth, spec.crepidomaLength) * 0.42, 5501, {
      stone: 0.55,
      grass: 1.1,
      hills: 0.45,
    }),
  );
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Neolithic enclosure
 * ------------------------------------------------------------------ */

/** T-pillars stand in a ring wall, broad faces turned to the two at the centre. */
export function neolithicEnclosureParts(spec: NeolithicEnclosureSpec): Part[] {
  const parts: Part[] = [];
  const outer = spec.enclosureDiameter / 2;
  const inner = outer - spec.wallThickness;
  const headHeight = 0.9;
  const centralHead = 1.1;

  // A terrazzo floor of burnt lime, poured inside the ring.
  parts.push(ring("terrazzo", 0, 0, inner, 0.14, 0, TAU));

  const pillarAngle = (index: number) => (TAU * index) / spec.ringPillars;

  /*
   * The wall runs between the pillars, not through them — and it is laid up
   * from unworked stone, so it is built here as stones rather than as a smooth
   * band. A clean extruded ring read as poured concrete, which is the one thing
   * a Neolithic dry-stone wall is not.
   */
  const gapAngle = (spec.pillarWidth * 1.25) / inner;
  const random = seeded(97);
  for (let i = 0; i < spec.ringPillars; i += 1) {
    const from = pillarAngle(i) + gapAngle / 2;
    const span = TAU / spec.ringPillars - gapAngle;
    const courses = 4;
    const stones = Math.max(3, Math.round((span * inner) / 0.85));
    for (let course = 0; course < courses; course += 1) {
      const y = course * 0.36;
      // Each course is offset half a stone, the way a wall is actually laid.
      const shift = course % 2 === 0 ? 0 : 0.5;
      for (let s = 0; s < stones; s += 1) {
        const theta = from + (span * (s + 0.5 + shift)) / stones;
        if (theta > from + span) continue;
        const r = inner + spec.wallThickness / 2 + (random() - 0.5) * 0.12;
        const width = 0.55 + random() * 0.45;
        parts.push(
          worn(
            box(
              "limestone",
              [Math.cos(theta) * r, y, Math.sin(theta) * r],
              [spec.wallThickness * (0.8 + random() * 0.3), 0.34 + random() * 0.06, width],
              -theta + (random() - 0.5) * 0.12,
            ),
            0.035,
          ),
        );
      }
    }
    // Benches for sitting, against the inside of the wall.
    parts.push(ring("limestone", 0.14, inner - 0.75, inner, spec.benchHeight, from, span));
  }

  /*
   * Twelve pillars set into the ring, each turned to face the centre — and
   * every one of them carved. Nearly all the excavated pillars at Göbeklitepe
   * carry animals; a ring of blank stones is the one thing this place was not.
   * Three of them wear a photograph of a real carved face as depth; the rest
   * carry animals cut as silhouettes in the stone, one to three a pillar,
   * dealt round the ring the way the excavated programme runs — the aurochs,
   * fox and crane stacked on Pillar 2, the boars of Pillar 12, the vulture
   * and scorpion of Pillar 43, snakes, gazelles and the H-sign — so that no
   * two neighbours repeat and every face shows real relief.
   */
  const faces = [CARVINGS.gobekliPillarFace, CARVINGS.gobekliBeast, CARVINGS.gobekliReliefs];
  const programme: { animals: Animal[]; photo?: number; tilt?: number }[] = [
    { animals: ["fox"], photo: 0 },
    { animals: ["crane", "fox", "aurochs"] },
    { animals: ["boar"] },
    { animals: ["snake"] },
    { animals: ["gazelle"], photo: 1 },
    { animals: ["scorpion", "vulture"] },
    { animals: ["symbol", "boar"] },
    { animals: ["fox", "crane"] },
    { animals: ["boar"], photo: 2 },
    { animals: ["fox"], tilt: 1.15 },
    { animals: ["symbol", "gazelle"] },
    { animals: ["vulture"] },
  ];
  const shapes = seeded(613);
  for (let i = 0; i < spec.ringPillars; i += 1) {
    const theta = pillarAngle(i);
    /*
     * No two of these stones are the same. The cited 3.5 m is the *average*
     * height of the Layer III pillars, so a ring of identical 3.5 m posts is
     * further from the excavation than a ring that scatters around it: each
     * one is quarried to its own height, width and thickness, set a little in
     * or out of the wall line, and stood a few degrees off square.
     */
    const tall = 0.78 + shapes() * 0.44;
    const wide = 0.84 + shapes() * 0.34;
    const thick = 0.86 + shapes() * 0.3;
    const lean = (shapes() - 0.5) * 0.14;
    const r = inner + spec.wallThickness / 2 + (shapes() - 0.5) * 0.22;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const rotY = -theta + lean;
    const height = spec.ringPillarHeight * tall;
    const head = headHeight * (0.85 + shapes() * 0.3);
    const shaft = height - head;
    const width = spec.pillarWidth * wide;
    const depth = spec.pillarThickness * thick;
    parts.push(worn(box("limestone", [x, 0, z], [depth, shaft, width], rotY), 0.05));
    parts.push(worn(box("limestone", [x, shaft, z], [depth, head, width * 1.45], rotY), 0.045));
    // The carving, on the inner face — the one the pillar turns to the centre.
    const faceRadius = r - depth / 2;
    const faceCentre: [number, number] = [
      Math.cos(theta) * faceRadius,
      Math.sin(theta) * faceRadius,
    ];
    const inward: [number, number] = [-Math.cos(theta), -Math.sin(theta)];
    const plan = programme[i % programme.length]!;
    // How long an animal can be on this stone, and where the next one goes.
    const size = Math.min(1.0, width * 0.78);
    let y = 0.32;
    if (plan.photo !== undefined) {
      parts.push(
        relief(
          "limestone",
          [faceCentre[0], 0.42, faceCentre[1]],
          [width * 0.86, shaft * 0.5],
          faces[plan.photo]!,
          -theta - Math.PI / 2 + lean,
        ),
      );
      y = 0.42 + shaft * 0.5 + 0.12;
    }
    plan.animals.forEach((animal, order) => {
      const shake = seeded(9000 + i * 7 + order);
      const scale = plan.tilt ? size * 1.15 : size * (animal === "snake" ? 1.3 : 1);
      // A tilted beast is pinned by its middle, so it is lifted up the face.
      const lift = plan.tilt ? shaft * 0.42 : 0;
      parts.push(
        ...animalCarving(
          animal,
          [faceCentre[0], y + lift + (shake() - 0.5) * 0.08, faceCentre[1]],
          inward,
          4000 + i * 11 + order,
          scale,
          { flip: (i + order) % 3 === 1, ...(plan.tilt ? { tilt: plan.tilt } : {}) },
        ),
      );
      y += scale * (animal === "snake" || animal === "symbol" ? 0.98 : 0.78) + 0.1;
    });
  }

  // The two at the centre: taller, thicker, facing one another across the floor.
  const centreOffset = 1.6;
  for (const side of [-1, 1]) {
    const x = side * centreOffset;
    const shaft = spec.centralPillarHeight - centralHead;
    parts.push(worn(box("limestone", [x, 0, 0], [1.9, 0.45, 1.9]), 0.05));
    parts.push(
      worn(box("limestone", [x, 0.45 - spec.pedestalSocket, 0], [0.62, shaft, 1.5]), 0.04),
    );
    parts.push(
      worn(
        box("limestone", [x, 0.45 - spec.pedestalSocket + shaft, 0], [0.62, centralHead, 2.2]),
        0.04,
      ),
    );
    const base = 0.45 - spec.pedestalSocket;
    // The animals, cut into the broad face that turns towards the other
    // pillar — carved into the stone as depth, not painted onto it.
    parts.push(
      relief(
        "limestone",
        [x - side * 0.32, base + 0.4, 0],
        [1.34, shaft * 0.55],
        CARVINGS.gobekliReliefs,
        side > 0 ? -Math.PI / 2 : Math.PI / 2,
      ),
    );
    // Above the photographed panel, more figures risen straight out of the
    // stone: a vulture with spread wings over a scorpion on one pillar, like
    // Pillar 43, a boar under a fox on the other — all carved as silhouettes.
    const upper = base + 0.4 + shaft * 0.56;
    const broad: [number, number] = side < 0 ? [1, 0] : [-1, 0];
    if (side < 0) {
      parts.push(
        ...animalCarving("scorpion", [x - side * 0.31, upper, 0], broad, 7001, 0.55),
        ...animalCarving("vulture", [x - side * 0.31, upper + 0.62, 0], broad, 7002, 0.95),
      );
    } else {
      parts.push(
        ...animalCarving("boar", [x - side * 0.31, upper, 0], broad, 7003, 0.9),
        ...animalCarving("fox", [x - side * 0.31, upper + 0.7, 0], broad, 7004, 0.85, {
          flip: true,
        }),
      );
    }
    // And on the narrow flank of each, below the belt, the fox of Pillar 18 —
    // cut leaping head-first down the stone the way it is on the original,
    // and small enough to fit between the edges of a 62 cm flank.
    parts.push(
      ...animalCarving("fox", [x, base + shaft * 0.16, side * 0.75], [0, side], 7005 + side, 0.5, {
        tilt: side > 0 ? 1.15 : -1.15,
        flip: side > 0,
      }),
    );

    /*
     * What makes these two stones people rather than posts, carved in the
     * lowest relief the excavators describe: an arm folded down each narrow
     * side, the hands brought together above a belt, and a fox-pelt loincloth
     * hanging from it. Modelled as geometry, a few centimetres proud, because
     * that is exactly how deep the carving is.
     */
    const proud = 0.035;
    const armTop = base + shaft * 0.72;
    const beltY = base + shaft * 0.42;
    for (const edge of [-1, 1]) {
      // The upper arm, running down the narrow side of the pillar.
      parts.push(
        box(
          "limestone",
          [x, armTop - shaft * 0.3, edge * (0.75 + proud / 2)],
          [0.62, shaft * 0.3, proud],
        ),
      );
      // The forearm, turning in across the face towards the belt.
      parts.push(
        box(
          "limestone",
          [x - side * (0.31 + proud / 2), beltY + 0.18, edge * 0.45],
          [proud, 0.16, 0.62],
        ),
      );
      // A hand, five fingers wide, laid over the belt.
      parts.push(
        box(
          "limestone",
          [x - side * (0.31 + proud / 2), beltY + 0.1, edge * 0.16],
          [proud, 0.22, 0.28],
        ),
      );
    }
    // The belt, running round three faces, with its buckle at the front.
    parts.push(box("limestone", [x, beltY, 0], [0.62 + proud * 2, 0.16, 1.5 + proud * 2]));
    parts.push(box("limestone", [x - side * (0.31 + proud), beltY - 0.02, 0], [proud, 0.2, 0.3]));
    // The loincloth hanging below it.
    parts.push(
      box("limestone", [x - side * (0.31 + proud / 2), beltY - 0.62, 0], [proud, 0.62, 0.78]),
    );
  }

  // A limestone plateau above the Harran plain: bare rock through thin soil,
  // burnt grass, and the Germuş ridges close on the skyline.
  parts.push(...setting(outer, 2207, { stone: 1.3, grass: 1, hills: 1 }));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Hellenistic altar on a stepped podium
 * ------------------------------------------------------------------ */

/**
 * The stair cuts a recess into the -z front; the frieze wraps everything else.
 *
 * The recess is why the podium is built as four blocks rather than one: a
 * staircase drawn on top of a solid podium is a staircase to nowhere, and the
 * two wings the stair climbs between are the altar's most recognisable feature.
 */
export function greatAltarParts(spec: GreatAltarSpec): Part[] {
  const parts: Part[] = [];
  const halfW = spec.baseWidth / 2;
  const halfD = spec.baseDepth / 2;
  const halfStair = spec.stairWidth / 2;
  const stepRise = 0.3;
  const stepRun = 0.55;
  const ground = spec.steps * stepRise;

  /*
   * The five steps that run round the building — across the front of the
   * stair too, which climbs on from the top of them. Left open where the
   * stair cuts in, they left the stair's first tread a metre and a half up
   * in the air with nothing under it.
   */
  for (let i = 0; i < spec.steps; i += 1) {
    const grow = (spec.steps - i) * stepRun;
    const w = spec.baseWidth + 2 * grow;
    const d = spec.baseDepth + 2 * grow;
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "marbleWorn",
          [0, i * stepRise, side * (halfD + grow - stepRun / 2)],
          [w, stepRise, stepRun],
        ),
      );
      parts.push(
        box(
          "marbleWorn",
          [side * (halfW + grow - stepRun / 2), i * stepRise, 0],
          [stepRun, stepRise, d],
        ),
      );
    }
  }

  /* The podium: a back block, two wings, and the recess between the wings that
     the stair climbs through. */
  const socle = 1.4;
  const friezeBase = ground + socle;
  const bandTop = friezeBase + spec.friezeHeight;
  const corniceHeight = 0.9;
  const terrace = bandTop + 0.5 + corniceHeight;
  const stairRun = 8.5;
  const backDepth = spec.baseDepth - stairRun;

  /*
   * The names (IvP I 87-126): seventeen gods' names and seven giants' have
   * survived well enough to read, and they are cut in turn round the podium,
   * with the gaps between them where the rest are lost.
   * Which slab each stood over is the publication's business; here the names
   * are the altar's own, their order along it is not.
   */
  let gods = 0;
  let giants = 0;
  let slot = 0;
  let blocks = 0;
  const podiumBlock = (x: number, z: number, w: number, d: number) => {
    parts.push(box("marbleWorn", [x, ground, z], [w, socle, d]));
    // The frieze stands slightly proud of everything above and below it, which
    // is what let 2.3 m of carving read from the ground — and it carries the
    // Gigantomachy, cut into all four faces as depth rather than laid on them
    // as a picture.
    parts.push(box("marble", [x, friezeBase, z], [w + 0.5, spec.friezeHeight, d + 0.5]));
    const halfBW = (w + 0.5) / 2;
    const halfBD = (d + 0.5) / 2;
    for (const side of [-1, 1]) {
      parts.push(
        relief(
          "marble",
          [x, friezeBase, z + side * (halfBD + 0.01)],
          [w + 0.5, spec.friezeHeight],
          CARVINGS.gigantomachy,
          side > 0 ? 0 : Math.PI,
        ),
      );
      parts.push(
        relief(
          "marble",
          [x + side * (halfBW + 0.01), friezeBase, z],
          [d + 0.5, spec.friezeHeight],
          CARVINGS.gigantomachy,
          side > 0 ? Math.PI / 2 : -Math.PI / 2,
        ),
      );
    }
    parts.push(box("marbleWorn", [x, bandTop, z], [w + 0.9, 0.5, d + 0.9]));
    parts.push(...cornice("marbleWorn", [x, bandTop + 0.5, z], w + 1.1, d + 1.1, corniceHeight));
    /*
     * The names. Each god in the frieze was named in the moulding over his
     * head and each giant in the base under his feet, and the sculptors
     * signed along the bottom — so the stone above and below the battle is
     * strung with short inscriptions a few metres apart. And the cornice's ovolo kept its paint: eggs and
     * darts in a red and a blue now faded nearly to the marble.
     */
    const faces = [
      { c: [x, z - d / 2] as const, rotY: FACING.south, length: w },
      { c: [x, z + d / 2] as const, rotY: FACING.north, length: w },
      { c: [x - w / 2, z] as const, rotY: FACING.west, length: d },
      { c: [x + w / 2, z] as const, rotY: FACING.east, length: d },
    ];
    for (const face of faces) {
      const normal: [number, number] = [Math.sin(face.rotY), Math.cos(face.rotY)];
      const at = (out: number, y: number): Vec3 => [
        face.c[0] + normal[0] * out,
        y,
        face.c[1] + normal[1] * out,
      ];
      const names = Math.max(1, Math.floor(face.length / 2.8));
      for (let i = 0; i < names; i += 1) {
        const u = -face.length / 2 + (face.length * (i + 0.5)) / names;
        const along = (out: number, y: number): Vec3 => {
          const p = at(out, y);
          return [p[0] + Math.cos(face.rotY) * u, y, p[2] - Math.sin(face.rotY) * u];
        };
        // The one surviving sculptor's signature, Theorretos, was cut on the
        // cornice of a risalit; it takes the first slot on the first wing.
        // Where a wing stands against the back block, the names would be
        // cut into stone no one can see; those slots are passed over.
        const hidden =
          (blocks === 0 && face.rotY === FACING.south && Math.abs(u) > spec.stairWidth / 2) ||
          (blocks > 0 && face.rotY === FACING.north);
        if (hidden) continue;
        const signed = blocks === 1 && i === 0 && face === faces[0];
        slot += 1;
        if (signed || (slot % 2 === 0 && gods < 17)) {
          parts.push(
            ...inscription({
              at: along(0.45, bandTop + 0.17),
              rotY: face.rotY,
              width: 2.4,
              letter: 0.16,
              text: signed ? TEXTS.pergamonSignature : single("pergamonGods", gods++),
            }),
          );
        }
        if (slot % 5 === 2 && giants < 7) {
          parts.push(
            ...inscription({
              at: along(0, friezeBase - 0.32),
              rotY: face.rotY,
              width: 2.4,
              letter: 0.12,
              text: single("pergamonGiants", giants++),
            }),
          );
        }
      }
      parts.push(
        ...paintedRun(
          ["fadedRed", "fadedBlue"],
          at(0.55 + corniceHeight * 0.1, bandTop + 0.5 + corniceHeight / 3 + 0.06),
          face.rotY,
          face.length + 1.1,
          corniceHeight / 3 - 0.2,
          0.36,
        ),
      );
    }
    blocks += 1;
  };

  podiumBlock(0, halfD - backDepth / 2, spec.baseWidth, backDepth);
  /*
   * The east face carries the photographed Gigantomachy round its whole
   * length, like the other three. (A scan of the Athena group used to be set
   * in here; the only one available was licensed for non-commercial use, so
   * the frieze runs on unbroken instead.)
   */
  for (const side of [-1, 1]) {
    const wingWidth = halfW - halfStair;
    podiumBlock(side * (halfStair + wingWidth / 2), -halfD + stairRun / 2, wingWidth, stairRun);
  }

  // The stair itself, climbing the recess from the ground to the terrace.
  const flight = Math.max(2, Math.round((terrace - ground) / stepRise));
  for (let i = 0; i < flight; i += 1) {
    const run = stairRun / flight;
    parts.push(
      box(
        "marbleWorn",
        [0, ground + i * ((terrace - ground) / flight), -halfD + run * (i + 0.5)],
        [spec.stairWidth, (terrace - ground) / flight, run],
      ),
    );
  }

  /* The colonnade round the terrace, and the entablature it carries — four
     beams, not a lid: the court inside the columns was open. */
  const columnHeight = spec.totalHeight - terrace - 1.4;
  const cw = halfW - 1.2;
  const cd = halfD - 1.2;
  const along = (from: number, to: number, fixed: number, axis: "x" | "z") => {
    const count = Math.max(2, Math.round(Math.abs(to - from) / spec.columnSpacing));
    for (let i = 0; i <= count; i += 1) {
      const t = from + ((to - from) * i) / count;
      const x = axis === "x" ? t : fixed;
      const z = axis === "x" ? fixed : t;
      // Nothing stands in the mouth of the stair.
      if (z < -cd + 0.5 && Math.abs(x) < halfStair - 0.5) continue;
      parts.push(
        ...column(
          "marble",
          [x, terrace, z],
          spec.columnDiameter,
          columnHeight,
          "ionic",
          undefined,
          true,
        ),
      );
    }
  };
  along(-cw, cw, cd, "x");
  along(-cw, cw, -cd, "x");
  along(-cd + spec.columnSpacing, cd - spec.columnSpacing, -cw, "z");
  along(-cd + spec.columnSpacing, cd - spec.columnSpacing, cw, "z");

  const beamTop = terrace + columnHeight;
  const beamWidth = spec.columnDiameter * 2.2;
  for (const side of [-1, 1]) {
    parts.push(...cornice("marble", [side * cw, beamTop, 0], beamWidth, cd * 2 + beamWidth, 1.4));
    parts.push(...cornice("marble", [0, beamTop, side * cd], cw * 2 + beamWidth, beamWidth, 1.4));
  }

  // The court on top, and the fire altar standing in the middle of it.
  const half = spec.courtSide / 2;
  const courtHeight = columnHeight * 0.72;
  for (const side of [-1, 1]) {
    parts.push(box("marbleWorn", [side * half, terrace, 2], [0.9, courtHeight, spec.courtSide]));
  }
  parts.push(box("marbleWorn", [0, terrace, 2 + half], [spec.courtSide + 1.8, courtHeight, 0.9]));
  /*
   * The court's walls were not bare: inside ran the Telephos frieze, the
   * story of Pergamon's founder in a band of relief at eye height, and the
   * walls round it were laid in fine courses. The frieze's slabs are in
   * Berlin and too broken to draw from; its band is given here as the
   * moulded zone it filled, its ground kept in the faded blue such relief
   * grounds were painted, between courses of squared marble.
   */
  {
    const inner: { at: Vec3; rotY: number; length: number }[] = [
      { at: [-half + 0.45, terrace, 2], rotY: FACING.east, length: spec.courtSide },
      { at: [half - 0.45, terrace, 2], rotY: FACING.west, length: spec.courtSide },
      { at: [0, terrace, 2 + half - 0.45], rotY: FACING.south, length: spec.courtSide - 0.9 },
    ];
    for (const face of inner) {
      parts.push(
        ...ashlar({
          at: face.at,
          rotY: face.rotY,
          length: face.length,
          height: courtHeight,
          blocks: 1.4,
        }),
      );
      const zone = (y: number, h: number, proud: number, material: Material) =>
        parts.push(
          box(
            material,
            onFace(face.at, face.rotY, 0, y, proud / 2),
            [face.length - 0.2, h, proud],
            face.rotY,
          ),
        );
      zone(1.3, 1.7, 0.06, "marble");
      // The painted ground: a skin on the slab's face, not a block.
      parts.push(
        box(
          "fadedBlue",
          onFace(face.at, face.rotY, 0, 1.38, 0.068),
          [face.length - 0.3, 1.54, 0.016],
          face.rotY,
        ),
      );
      zone(1.22, 0.12, 0.14, "marble");
      zone(3.0, 0.14, 0.14, "marble");
    }
  }
  parts.push(...ornateAltar([0, terrace, 2], 4.4, 3.2, 2.0));

  // The altar stood on a terrace cut into the acropolis, high above the plain,
  // so the skyline is close and the ground is rock.
  parts.push(...setting(spec.baseWidth * 0.55, 6607, { stone: 0.8, grass: 0.5, hills: 0.9 }));
  return uncovered(parts);
}

/* ------------------------------------------------------------------ *
 * A Roman stadium
 * ------------------------------------------------------------------ */

/** The long axis runs along z; both ends are curved, as at Aphrodisias. */
/**
 * The plan of a stadium, shared with the scene that fills it: where the curved
 * ends are centred, how far the long sides bow out at a given point, where
 * the arena wall stands if there is one, and how much of the track is left
 * for racing.
 */
/**
 * A Greek altar dressed as the surviving ones are: a step to stand on in
 * front, a moulded base, the die hung with garlands swung between ox-skulls,
 * a crowning moulding, and on top the two rolled bolsters at the sides with
 * the fire-tray between them. `rotY` turns the front (the `-z` face) round.
 */
export function ornateAltar(
  at: Vec3,
  width: number,
  depth: number,
  height: number,
  rotY = 0,
): Part[] {
  const parts: Part[] = [];
  const turn = (x: number, y: number, z: number): Vec3 => [
    at[0] + x * Math.cos(rotY) + z * Math.sin(rotY),
    at[1] + y,
    at[2] - x * Math.sin(rotY) + z * Math.cos(rotY),
  ];
  const step = height * 0.14;
  parts.push(box("marbleWorn", turn(0, 0, -depth * 0.28), [width * 1.25, step, depth * 1.7], rotY));
  parts.push(
    box("marbleWorn", turn(0, step, 0), [width * 1.12, height * 0.08, depth * 1.12], rotY),
  );
  parts.push(
    box(
      "marble",
      turn(0, step + height * 0.08, 0),
      [width * 1.05, height * 0.05, depth * 1.05],
      rotY,
    ),
  );
  const dieBase = step + height * 0.13;
  const dieH = height * 0.58;
  parts.push(box("marble", turn(0, dieBase, 0), [width, dieH, depth], rotY));
  // Garlands and bucrania along the front and back.
  for (const face of [-1, 1]) {
    const zf = face * (depth / 2 + 0.02);
    const skulls = 4;
    for (let i = 0; i < skulls; i += 1) {
      const u = -width / 2 + (width * (i + 0.5)) / skulls;
      parts.push(
        box(
          "marbleWorn",
          turn(u, dieBase + dieH * 0.62, zf),
          [width * 0.06, dieH * 0.22, 0.08],
          rotY,
        ),
      );
      if (i < skulls - 1) {
        const u1 = u + width / skulls;
        parts.push({
          kind: "loft",
          material: "marble",
          at: turn(0, 0, 0),
          rotY,
          sections: [
            { c: [u, dieBase + dieH * 0.7, zf], rx: 0.03, ry: 0.03 },
            {
              c: [(u + u1) / 2, dieBase + dieH * 0.42, zf + face * 0.04],
              rx: dieH * 0.07,
              ry: dieH * 0.07,
            },
            { c: [u1, dieBase + dieH * 0.7, zf], rx: 0.03, ry: 0.03 },
          ],
        });
        // A ribbon hanging from each swag.
        parts.push(
          box(
            "paintRed",
            turn((u + u1) / 2, dieBase + dieH * 0.18, zf + face * 0.03),
            [0.04, dieH * 0.2, 0.02],
            rotY,
          ),
        );
      }
    }
  }
  const crown = dieBase + dieH;
  parts.push(box("marble", turn(0, crown, 0), [width * 1.06, height * 0.05, depth * 1.06], rotY));
  parts.push(
    box(
      "marbleWorn",
      turn(0, crown + height * 0.05, 0),
      [width * 1.12, height * 0.06, depth * 1.12],
      rotY,
    ),
  );
  // The bolsters, rolled along the sides, their ends carved as volutes.
  const top = crown + height * 0.11;
  for (const side of [-1, 1]) {
    parts.push(
      cyl(
        "marble",
        turn(side * width * 0.46, top + height * 0.07, -depth * 0.53),
        height * 0.07,
        height * 0.07,
        depth * 1.06,
        16,
        {
          rotX: Math.PI / 2,
          rotY,
        },
      ),
    );
    for (const end of [-1, 1]) {
      parts.push(
        cyl(
          "paintGold",
          turn(side * width * 0.46, top + height * 0.07, end * depth * 0.53 - (end > 0 ? 0 : 0.03)),
          height * 0.04,
          height * 0.04,
          0.03,
          12,
          {
            rotX: Math.PI / 2,
            rotY,
          },
        ),
      );
    }
  }
  parts.push(box("bronze", turn(0, top, 0), [width * 0.6, height * 0.05, depth * 0.7], rotY));
  return parts;
}

export function stadiumLayout(spec: StadiumSpec) {
  const halfWidth = spec.overallWidth / 2;
  const arenaHalf = spec.arenaWidth / 2;
  const endCentre = spec.overallLength / 2 - halfWidth;
  const bow = spec.bow ?? 0;
  const bowAt = (z: number) => bow * Math.max(0, 1 - (z / endCentre) ** 2);
  const arenaWall = spec.arenaEnd
    ? { z: endCentre - spec.arenaWidth * 1.4, radius: arenaHalf }
    : null;
  return {
    halfWidth,
    arenaHalf,
    endCentre,
    tread: (halfWidth - arenaHalf) / spec.rows,
    bowAt,
    arenaWall,
    // The stretch of track the races use, kept clear of the arena wall.
    trackMin: -endCentre * 0.62,
    trackMax: arenaWall ? arenaWall.z - arenaWall.radius - 10 : endCentre * 0.62,
  };
}

export function stadiumParts(spec: StadiumSpec): Part[] {
  const parts: Part[] = [];
  const L = stadiumLayout(spec);
  const { halfWidth, arenaHalf, endCentre, tread, bowAt } = L;
  const bowed = (spec.bow ?? 0) > 0;
  // A bowed side is laid as a run of short straight pieces following the curve.
  const pieces = bowed ? 18 : 1;

  /** A straight run along one long side, following the bow if there is one. */
  const run = (
    material: Material,
    side: number,
    inner: number,
    width: number,
    y: number,
    height: number,
  ) => {
    for (let k = 0; k < pieces; k += 1) {
      const z0 = -endCentre + (2 * endCentre * k) / pieces;
      const z1 = -endCentre + (2 * endCentre * (k + 1)) / pieces;
      const zc = (z0 + z1) / 2;
      const slope = (bowAt(z1) - bowAt(z0)) / (z1 - z0);
      const length = (z1 - z0) * Math.hypot(1, slope) * (bowed ? 1.015 : 1);
      parts.push(
        box(
          material,
          [side * (inner + width / 2 + bowAt(zc)), y, zc],
          [width, height, length],
          side * Math.atan(slope),
        ),
      );
    }
  };

  // The track's paving stops inside the podium wall, not in the plane of its back.
  parts.push(
    box("sand", [0, 0, 0], [spec.arenaWidth + 2 * (spec.bow ?? 0) - 0.1, 0.12, endCentre * 2]),
  );
  for (const side of [-1, 1]) {
    if (spec.openEnd && side < 0) continue;
    parts.push(
      ring("stone", 0, 0, arenaHalf, 0.12, side > 0 ? 0 : Math.PI, Math.PI, [0, side * endCentre]),
    );
  }

  // The podium wall round the track, with a painted coping, and the seats.
  for (const side of [-1, 1]) run("marbleWorn", side, arenaHalf - 0.35, 0.35, 0, 1.3);
  for (let row = 0; row < spec.rows; row += 1) {
    const inner = arenaHalf + row * tread;
    const outer = inner + tread;
    const y = row * spec.seatRise;
    for (const side of [-1, 1]) run("stone", side, inner, tread, y, spec.seatRise + 0.06);
    for (const side of [-1, 1]) {
      if (spec.openEnd && side < 0) continue;
      parts.push(
        ring("stone", y, inner, outer, spec.seatRise + 0.06, side > 0 ? 0 : Math.PI, Math.PI, [
          0,
          side * endCentre,
        ]),
      );
    }
  }
  // Stairs climbing the banks, every so often, in a darker stone.
  const stairs = Math.round((2 * endCentre) / 22);
  for (let i = 0; i < stairs; i += 1) {
    const z = -endCentre + (2 * endCentre * (i + 0.5)) / stairs;
    for (const side of [-1, 1]) {
      for (let row = 0; row < spec.rows; row += 1) {
        const inner = arenaHalf + row * tread + bowAt(z);
        parts.push(
          box(
            "stoneDark",
            [side * (inner + tread / 2), row * spec.seatRise + 0.02, z],
            [tread, spec.seatRise + 0.08, 1.0],
          ),
        );
      }
    }
  }

  if (spec.inscribedSeats) {
    /*
     * Reserved places, cut into the fronts of the seats along the rows above
     * the podium wall: "place", a tribe's place, the Blues' and the Greens'
     * — the circus factions of late antiquity — and a bare letter numbering
     * a seat, each as it is read on the stadium's own seats (Roueché,
     * Performers and Partisans 45).
     */
    const seatTexts: EpigraphicText[] = [
      TEXTS.aphrodisiasBlues,
      TEXTS.aphrodisiasPlace,
      TEXTS.aphrodisiasGreens,
      TEXTS.aphrodisiasPlaceTribe,
      TEXTS.aphrodisiasAlpha,
    ];
    const random = seeded(2707);
    for (let k = 0; k < 14; k += 1) {
      const side = random() < 0.5 ? -1 : 1;
      const row = 4 + Math.floor(random() * 10);
      // In the middle of one of the straight runs the bowed side is laid in,
      // turned with it, so the letters lie on its face and not in it.
      const piece = 2 + Math.floor(random() * (pieces - 4));
      const z0 = -endCentre + (2 * endCentre * piece) / pieces;
      const z1 = -endCentre + (2 * endCentre * (piece + 1)) / pieces;
      const z = (z0 + z1) / 2;
      const turn = side * Math.atan((bowAt(z1) - bowAt(z0)) / (z1 - z0));
      const x = side * (arenaHalf + row * tread + bowAt(z) - 0.004);
      parts.push(
        ...inscription({
          at: [x, row * spec.seatRise + 0.1, z],
          rotY: (side > 0 ? FACING.west : FACING.east) + turn,
          width: 1.2,
          letter: 0.095,
          text: seatTexts[k % seatTexts.length]!,
        }),
      );
    }
  }

  /*
   * The mouths of the vaulted passages that brought the crowd in at track
   * level. Only the mouths: a tunnel driven through the bank would push its
   * dark box up through the seats above it, since nothing here can cut a hole.
   */
  const bankTop = spec.rows * spec.seatRise;
  for (let i = 0; i < spec.entrances; i += 1) {
    const z = -endCentre + (2 * endCentre * (i + 0.5)) / spec.entrances;
    for (const side of [-1, 1]) {
      parts.push(box("shadow", [side * (arenaHalf + 0.6 + bowAt(z)), 0, z], [1.4, 2.6, 3.2]));
    }
  }

  // The outer wall, and the walkway along the top of the seating.
  const outerRadius = halfWidth;
  const wallT = 1.2;
  if (spec.vaults) {
    /*
     * Perge: the seats carried on vaulted chambers, each opening outwards
     * under an arch as a shop. Piers between the arches, the barrel vault
     * turned over each opening, and the wall carried on up to the walkway.
     */
    const bays = spec.vaults;
    const bay = (2 * endCentre) / bays;
    const opening = bay * 0.62;
    const spring = bankTop * 0.42;
    const r = opening / 2;
    for (const side of [-1, 1]) {
      const x = side * (outerRadius + wallT / 2);
      for (let i = 0; i < bays; i += 1) {
        const zc = -endCentre + bay * (i + 0.5);
        parts.push(
          box(
            "stoneDark",
            [x, 0, zc - bay / 2 + (bay - opening) / 4],
            [wallT, bankTop + 1.2, (bay - opening) / 2],
          ),
        );
        parts.push(
          box(
            "stoneDark",
            [x, 0, zc + bay / 2 - (bay - opening) / 4],
            [wallT, bankTop + 1.2, (bay - opening) / 2],
          ),
        );
        /*
         * The wall over the opening, cut as one outline with the arch taken
         * out of it, so the opening really is round-headed instead of a
         * rectangle with a half-drum stuck in its top.
         */
        const top = bankTop + 1.2;
        const outline: [number, number][] = [
          [-opening / 2, spring],
          [-opening / 2, top],
          [opening / 2, top],
          [opening / 2, spring],
        ];
        for (let k = 1; k < 16; k += 1) {
          const a = (k / 16) * Math.PI;
          outline.push([Math.cos(a) * r, spring + Math.sin(a) * r]);
        }
        parts.push({
          kind: "carving",
          material: "stoneDark",
          at: [x, 0, zc],
          outline,
          depth: wallT,
          sink: 0.5,
          rotY: side * (Math.PI / 2),
        });
        // The dark of the chamber behind the opening.
        parts.push(
          box("shadow", [side * (outerRadius + 0.09), 0, zc], [0.1, spring + r * 0.9, opening]),
        );
        /*
         * A keystone standing a hand proud of the arch. The shops' own
         * painted and cut signs are not preserved well enough to copy, so
         * none is invented.
         */
        parts.push(
          box(
            "stone",
            [side * (outerRadius + wallT + 0.03), spring + r - 0.12, zc],
            [0.12, 0.62, 0.46],
          ),
        );
      }
      // A projecting cornice along the top of the arcade.
      parts.push(
        box(
          "stone",
          [side * (outerRadius + wallT / 2), bankTop + 1.2, 0],
          [wallT + 0.4, 0.35, endCentre * 2 + 0.4],
        ),
      );
    }
    // The closed north end, on its own arches.
    parts.push(
      ring("stoneDark", 0, outerRadius, outerRadius + wallT, bankTop + 1.2, 0, Math.PI, [
        0,
        endCentre,
      ]),
    );
    /*
     * The open south end, where the track met the city: a gateway of piers
     * and a lintel across the width of the track, double timber doors in its
     * middle passage.
     */
    const gz = -endCentre;
    for (const x of [-arenaHalf, -arenaHalf / 3, arenaHalf / 3, arenaHalf]) {
      parts.push(box("marble", [x, 0, gz], [1.4, 6.4, 1.6]));
      parts.push(box("marbleWorn", [x, 6.4, gz], [1.7, 0.4, 1.9]));
    }
    parts.push(...cornice("marble", [0, 6.8, gz], spec.arenaWidth + 2, 2.0, 1.1));
    /*
     * And the gate's dedication along its architrave, facing the city: to
     * Artemis of Perge, "the inviolable", in the formula of the city's own
     * dedications — the gate's own text is not preserved.
     */
    parts.push(
      ...inscription({
        // On the architrave's lowest course, under the projection of the next.
        at: [0, 6.8 + 0.05, gz - 1.0],
        rotY: FACING.south,
        width: spec.arenaWidth * 0.8,
        letter: 0.26,
        height: 0.27,
        text: TEXTS.pergeGate,
      }),
    );
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "timber",
          [side * (arenaHalf / 6), 0, gz + 0.2],
          [arenaHalf / 3 - 1.5, 4.6, 0.14],
          side * 0.6,
        ),
      );
    }
  } else {
    for (const side of [-1, 1])
      run("stoneDark", side, outerRadius - (spec.bow ?? 0) * 0, wallT, 0, bankTop + 1.2);
    /*
     * The outside of the long sides. The stadium's outer wall was the face
     * it showed the city: piers standing out of it at regular intervals, a
     * string course at the level of the upper rows, a coping, and arched
     * doorways at ground level into the stairs that fed the seats.
     */
    for (const side of [-1, 1]) {
      const H = bankTop + 1.2;
      for (let k = 0; k < pieces; k += 1) {
        const z0 = -endCentre + (2 * endCentre * k) / pieces;
        const z1 = -endCentre + (2 * endCentre * (k + 1)) / pieces;
        const zc = (z0 + z1) / 2;
        const slope = (bowAt(z1) - bowAt(z0)) / (z1 - z0);
        const length = (z1 - z0) * Math.hypot(1, slope);
        const rotY = side * (Math.PI / 2 + Math.atan(slope));
        const at: Vec3 = [side * (outerRadius + wallT + bowAt(zc)), 0, zc];
        const out = (x: number, y: number, size: Vec3, material: Material = "stoneDark") =>
          parts.push(box(material, onFace(at, rotY, x, y, size[2] / 2 - 0.02), size, rotY));
        for (const u of [-length / 2 + 0.5, 0]) out(u, 0, [0.9, H - 0.3, 0.3], "stone");
        out(0, H * 0.62, [length, 0.3, 0.22], "stone");
        // The coping rises three centimetres over the wall's top, not level with it.
        out(0, H - 0.35, [length, 0.38, 0.3], "stone");
        if (k % 2 === 1) {
          for (const u of [-length / 4, length / 4]) {
            out(u, 0, [2.0, 3.0, 0.08], "shadow");
            out(u, 3.0, [2.6, 0.5, 0.26], "stone");
          }
        }
      }
    }
    for (const side of [-1, 1]) {
      if (spec.openEnd && side < 0) continue;
      parts.push(
        ring(
          "stoneDark",
          0,
          outerRadius,
          outerRadius + wallT,
          bankTop + 1.2,
          side > 0 ? 0 : Math.PI,
          Math.PI,
          [0, side * endCentre],
        ),
      );
    }
    // A colonnade along the top of the seating, as the walkway carried.
    for (const side of [-1, 1]) {
      const count = Math.round((2 * endCentre) / 6);
      for (let i = 0; i <= count; i += 1) {
        const z = -endCentre + (2 * endCentre * i) / count;
        parts.push(
          ...column(
            "marbleWorn",
            [side * (outerRadius + 0.5 + bowAt(z)), bankTop + 1.2, z],
            0.42,
            3.2,
            "plain",
            0,
          ),
        );
      }
    }
  }

  if (L.arenaWall) {
    /*
     * Aphrodisias, late in its life: when the theatre was ruined, the east end
     * of the track was walled off into an oval arena for the shows the
     * theatre had held. A podium wall high enough to keep beasts off the
     * crowd, with a gate in the middle of it.
     */
    const { z, radius } = L.arenaWall;
    const r = radius + bowAt(z);
    for (const half of [0, 1]) {
      parts.push(
        ring(
          "marbleWorn",
          0,
          r - 0.8,
          r,
          3.0,
          Math.PI + half * (Math.PI / 2 + 0.08),
          Math.PI / 2 - 0.08,
          [0, z],
        ),
      );
    }
    parts.push(box("marble", [0, 3.0, z - r + 0.4], [5, 0.6, 1.2]));
  }

  if (spec.cityWall) {
    /*
     * The north side of the stadium was the city wall: the late-antique
     * circuit was run up to it and along it, towers and all, so the bank of
     * seats is also the rampart.
     */
    // On the far side from the view, so the rampart backs the seats rather
    // than hiding them.
    const x = -(outerRadius + wallT + 1.0);
    const reach = spec.overallLength / 2 + 70;
    parts.push(
      scenery(worn(box("limestone", [x - 1.2, 0, 0], [2.4, bankTop + 3, reach * 2]), 0.08)),
    );
    const towers = Math.round((reach * 2) / 34);
    for (let i = 0; i <= towers; i += 1) {
      const z = -reach + (reach * 2 * i) / towers;
      parts.push(scenery(worn(box("limestone", [x - 3, 0, z], [6, bankTop + 6, 6.5]), 0.08)));
      for (let k = 0; k < 4; k += 1) {
        parts.push(
          scenery(box("limestone", [x - 0.4 - k * 1.7, bankTop + 6, z - 2.6], [0.8, 0.9, 0.8])),
        );
        parts.push(
          scenery(box("limestone", [x - 0.4 - k * 1.7, bankTop + 6, z + 2.6], [0.8, 0.9, 0.8])),
        );
      }
    }
    for (let i = 0; i < reach / 1.6; i += 1) {
      const z = -reach + i * 3.2;
      parts.push(scenery(box("limestone", [x - 2.2, bankTop + 3, z], [0.5, 0.8, 1.4])));
    }
  }

  if (spec.hillside) {
    /*
     * Perge's stadium lies at the foot of the hill whose slope carries the
     * theatre, so one side looks onto rising ground: a ridge of rock and
     * scrub climbing away from the long side.
     */
    const ridge = seeded(4417);
    for (let i = 0; i < 16; i += 1) {
      const z = -endCentre * 1.6 + (endCentre * 3.2 * i) / 15;
      const back = 44 + ridge() * 14;
      parts.push(
        scenery(
          worn(
            cyl(
              "grass",
              [-(outerRadius + back), -2, z],
              30 + ridge() * 14,
              8 + ridge() * 6,
              16 + ridge() * 12,
              18,
            ),
            3,
          ),
        ),
      );
      // Rock breaking through the slope.
      parts.push(
        scenery(
          worn(
            box(
              "limestone",
              [-(outerRadius + back - 12 + ridge() * 6), 4 + ridge() * 6, z + ridge() * 8],
              [6 + ridge() * 5, 3, 4 + ridge() * 4],
              ridge() * 3,
            ),
            0.6,
          ),
        ),
      );
    }
  }

  // The stadium sits against the city wall on flat ground, with the Baba Dağı
  // ridge behind it and dry scrub either side.
  parts.push(...setting(spec.overallWidth * 0.62, 9203, { stone: 0.5, grass: 1.2, hills: 0.6 }));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Roman house round a colonnaded court
 * ------------------------------------------------------------------ */

/**
 * Cut open on the -z side so the court can be seen into, the way the terrace
 * houses are visited today: the rooms on that side are left off rather than
 * walled, and the model is an interior first and a building second.
 *
 * This is the one model here whose surfaces matter more than its mass. The
 * floors are mosaic and the walls are fresco, both of them photographs of the
 * house's own decoration, and the mosaics carry a millimetre or so of relief
 * so the tesserae catch the light unevenly, the way a laid floor does.
 */
export function peristyleHouseParts(spec: PeristyleHouseSpec): Part[] {
  const parts: Part[] = [];
  const halfW = spec.courtWidth / 2;
  const halfD = spec.courtDepth / 2;
  const wall = 0.45;
  const upper = spec.wallHeight * 0.82;

  // The court floor, in mosaic, with the impluvium pool set into it.
  parts.push(box("stone", [0, -0.12, 0], [spec.courtWidth, 0.12, spec.courtDepth]));
  parts.push(
    floorPanel(
      "marbleWorn",
      [0, 0.001, halfD],
      [spec.courtWidth, spec.courtDepth],
      CARVINGS.terraceMosaic,
    ),
  );
  const pool = spec.poolWidth;
  // The kerb, a frame round the pool: laid as one solid block, its top was a
  // centimetre over the water and hid it.
  for (const side of [-1, 1]) {
    parts.push(box("stoneDark", [side * (pool / 2 + 0.1), 0, 0], [0.2, 0.22, pool + 0.4]));
    parts.push(box("stoneDark", [0, 0, side * (pool / 2 + 0.1)], [pool, 0.22, 0.2]));
  }
  // Its dark bed, well under the water's surface rather than a centimetre.
  parts.push(box("shadow", [0, 0.02, 0], [pool, 0.13, pool]));

  /* The rooms round three sides: a floor, walls, and the fresco on the wall
     that faces into the court. */
  const room = (
    centre: [number, number],
    size: [number, number],
    frescoRot: number,
    frescoAt: Vec3,
    frescoSize: [number, number],
    floor: Carving,
  ) => {
    const [cx, cz] = centre;
    const [w, d] = size;
    parts.push(box("stone", [cx, -0.12, cz], [w, 0.12, d]));
    parts.push(floorPanel("marbleWorn", [cx, 0.001, cz + d / 2], [w, d], floor));
    parts.push(relief("marbleWorn", frescoAt, frescoSize, CARVINGS.terraceFresco, frescoRot));
  };

  const sideCentre = halfW + wall + spec.roomDepth / 2;
  room(
    [0, halfD + wall + spec.roomDepth / 2],
    [spec.courtWidth, spec.roomDepth],
    Math.PI,
    [0, 0.4, halfD + wall + spec.roomDepth - 0.06],
    [spec.courtWidth * 0.8, spec.wallHeight * 0.72],
    CARVINGS.terraceDionysus,
  );
  for (const side of [-1, 1]) {
    room(
      [side * sideCentre, 0],
      [spec.roomDepth, spec.courtDepth],
      side > 0 ? -Math.PI / 2 : Math.PI / 2,
      [side * (sideCentre + spec.roomDepth / 2 - 0.06), 0.4, 0],
      [spec.courtDepth * 0.75, spec.wallHeight * 0.72],
      CARVINGS.terraceMosaic,
    );
  }

  // The walls: the outer shell, and the piers between court and rooms.
  const outer = (x: number, z: number, w: number, d: number, height: number) =>
    parts.push(box("marbleWorn", [x, 0, z], [w, height, d]));
  const shellHalfW = sideCentre + spec.roomDepth / 2;
  const shellBack = halfD + wall + spec.roomDepth;
  // The back wall carries the upper storey; the two side walls are cut down to
  // the ground floor, because a house modelled with all four walls at full
  // height is a box with a lid, and nobody can see the mosaics inside it.
  outer(0, shellBack + wall / 2, shellHalfW * 2 + wall, wall, spec.wallHeight + upper);
  for (const side of [-1, 1]) {
    outer(
      side * (shellHalfW + wall / 2),
      (shellBack - halfD) / 2 - halfD / 2,
      wall,
      shellBack + halfD + wall,
      spec.wallHeight * 0.62,
    );
  }
  // The piers that carry the upper storey over the rooms.
  for (const side of [-1, 1]) {
    parts.push(
      box(
        "marbleWorn",
        [side * (halfW + wall / 2), 0, 0],
        [wall, spec.wallHeight, spec.courtDepth],
      ),
    );
  }
  parts.push(
    box(
      "marbleWorn",
      [0, 0, halfD + wall / 2],
      [spec.courtWidth + wall * 2, spec.wallHeight, wall],
    ),
  );

  /* The colonnade round the court, and the roof it carries over the walkway.
     The court itself stays open: that is where the light and the rain came in. */
  const columns: [number, number][] = [];
  for (let i = 0; i < spec.courtColumns; i += 1) {
    const t = i / (spec.courtColumns - 1);
    columns.push([-halfW + spec.courtWidth * t, -halfD]);
    columns.push([-halfW + spec.courtWidth * t, halfD]);
  }
  for (let i = 1; i < spec.courtColumns - 1; i += 1) {
    const t = i / (spec.courtColumns - 1);
    columns.push([-halfW, -halfD + spec.courtDepth * t]);
    columns.push([halfW, -halfD + spec.courtDepth * t]);
  }
  for (const [x, z] of columns) {
    parts.push(
      ...column("marble", [x, 0, z], spec.columnDiameter, spec.wallHeight * 0.86, "ionic"),
    );
  }
  // The architrave over them, and the lean-to roof behind it.
  const beam = spec.wallHeight * 0.86;
  for (const side of [-1, 1]) {
    parts.push(box("marbleWorn", [0, beam, side * halfD], [spec.courtWidth + 0.6, 0.34, 0.42]));
    parts.push(box("marbleWorn", [side * halfW, beam, 0], [0.42, 0.34, spec.courtDepth + 0.6]));
  }
  parts.push(box("stoneDark", [0, beam + 0.34, 0], [spec.courtWidth + wall * 2, 0.16, wall]));

  /*
   * What makes it a house. The court's roof drained inwards: a ring of
   * terracotta eaves sloping down towards the open sky, cover tiles laid in
   * ridges over the joints and an antefix at the end of each. The walls that
   * face the court were painted in panels — red fields framed in ochre — as
   * the plaster in the terrace houses still is. The back wall carried the
   * upper storey with its windows and a timber balcony over the court, and
   * the rooms opened off the court through panelled doors.
   */
  const eaveTop = spec.wallHeight + 0.1;
  const eaveWidth = 1.3;
  const drop = 0.42;
  /*
   * Each of the four roofs is one pitched slab of pan tiles, the cover tiles
   * laid down it and an antefix at the foot of each row, over the court.
   * (Laid as level courses stepping down, the cover tiles floated over the
   * lower ones by up to forty centimetres.)
   */
  for (const side of [-1, 1]) {
    for (const [along, span] of [
      ["z", spec.courtWidth + wall * 2],
      ["x", spec.courtDepth + wall * 2],
    ] as const) {
      const reach = (along === "z" ? halfD : halfW) + wall - eaveWidth;
      parts.push(
        ...tiledSlope({
          eave:
            along === "z"
              ? [0, eaveTop - drop + 0.03, side * reach]
              : [side * reach, eaveTop - drop + 0.03, 0],
          rotY:
            along === "z"
              ? side > 0
                ? FACING.north
                : FACING.south
              : side > 0
                ? FACING.east
                : FACING.west,
          width: span,
          run: eaveWidth,
          rise: drop,
          spacing: 0.45,
          cover: 0.06,
        }),
      );
    }
  }

  // Painted panels on the court faces of the side piers.
  for (const side of [-1, 1]) {
    const face = side * (halfW + 0.005);
    const panels = 3;
    for (let i = 0; i < panels; i += 1) {
      const z = -halfD + (spec.courtDepth * (i + 0.5)) / panels;
      const w = (spec.courtDepth / panels) * 0.7;
      parts.push(box("paintGold", [face, 0.55, z], [0.03, spec.wallHeight * 0.62, w + 0.12]));
      parts.push(
        box("paintRed", [face - side * 0.03, 0.61, z], [0.03, spec.wallHeight * 0.62 - 0.12, w]),
      );
    }
    // A dark dado along the foot of the wall, as Roman walls had.
    parts.push(box("stoneDark", [face, 0, 0], [0.03, 0.55, spec.courtDepth]));
  }

  /*
   * The court face of the back wall, painted like the sides: a dark dado,
   * red fields framed in ochre between and beside the doors, and a blue
   * band under the architrave. Over the left-hand door a painted "good
   * fortune" — the formula Ephesian texts open with — and on a side panel
   * the same wish scratched into the plaster by someone passing, as the
   * terrace houses' walls are scratched all over.
   */
  {
    const face = halfD - 0.005;
    parts.push(box("stoneDark", [0, 0, face], [spec.courtWidth, 0.55, 0.03]));
    const doorsAt = [-halfW * 0.5, halfW * 0.5];
    const edges = [
      -halfW + 0.2,
      doorsAt[0]! - 1,
      doorsAt[0]! + 1,
      doorsAt[1]! - 1,
      doorsAt[1]! + 1,
      halfW - 0.2,
    ];
    for (let i = 0; i + 1 < edges.length; i += 2) {
      const from = edges[i]!;
      const to = edges[i + 1]!;
      if (to - from < 0.6) continue;
      const x = (from + to) / 2;
      parts.push(box("paintGold", [x, 0.55, face], [to - from, spec.wallHeight * 0.62, 0.03]));
      parts.push(
        box(
          "paintRed",
          [x, 0.61, face - 0.03],
          [to - from - 0.12, spec.wallHeight * 0.62 - 0.12, 0.03],
        ),
      );
    }
    parts.push(box("paintBlue", [0, beam - 0.32, face], [spec.courtWidth, 0.22, 0.03]));
    parts.push(
      ...inscription({
        at: [doorsAt[0]!, 2.78, face - 0.015],
        rotY: FACING.south,
        width: 1.4,
        letter: 0.11,
        text: TEXTS.houseGoodLuck,
      }),
    );
    const side = 1;
    parts.push(
      ...inscription({
        at: [side * (halfW + 0.005) - side * 0.045, 1.45, -halfD + spec.courtDepth / 6 + 0.3],
        rotY: FACING.west,
        width: 0.5,
        letter: 0.05,
        text: TEXTS.houseGraffito,
      }),
    );
    // Outside, the shell is squared stone in courses on a moulded foot.
    for (const s of [-1, 1]) {
      parts.push(
        ...ashlar({
          at: [s * (shellHalfW + wall), 0, (shellBack - halfD) / 2 - halfD / 2],
          rotY: s > 0 ? FACING.east : FACING.west,
          length: shellBack + halfD + wall,
          height: spec.wallHeight * 0.62,
          coping: false,
          blocks: 1.1,
        }),
      );
    }
    parts.push(
      ...ashlar({
        at: [0, 0, shellBack + wall],
        rotY: FACING.north,
        length: shellHalfW * 2 + wall,
        height: spec.wallHeight + upper,
        blocks: 1.1,
      }),
    );
  }

  // Doors from the court into the back room.
  for (const x of [-halfW * 0.5, halfW * 0.5]) {
    const z = halfD + 0.02;
    parts.push(box("marble", [x, 0, z - 0.04], [1.5, 2.6, 0.08]));
    parts.push(box("timber", [x, 0, z - 0.1], [1.2, 2.4, 0.08]));
    for (const dy of [0.35, 1.35]) {
      parts.push(box("timber", [x - 0.3, dy, z - 0.16], [0.42, 0.8, 0.04]));
      parts.push(box("timber", [x + 0.3, dy, z - 0.16], [0.42, 0.8, 0.04]));
    }
    parts.push(box("bronze", [x + 0.48, 1.15, z - 0.17], [0.05, 0.12, 0.04]));
  }

  // The upper storey: its windows in the back wall, over the court.
  const floorY = spec.wallHeight + 0.4;
  for (let i = 0; i < 4; i += 1) {
    const x = -halfW * 0.75 + (halfW * 1.5 * i) / 3;
    parts.push(box("shadow", [x, floorY + 0.9, shellBack - 0.02], [0.9, 1.3, 0.06]));
    parts.push(box("timber", [x, floorY + 0.85, shellBack - 0.06], [1.05, 0.08, 0.12]));
  }
  /*
   * Water in the pool, and a marble youth over it as the fountain, from the
   * scan of a Roman youth of the kind set up in houses and gardens (the
   * Magdalensberg youth): the boy statues of peristyle fountains were of
   * this type, Eros or a young satyr or simply a boy.
   */
  parts.push(box("paintBlue", [0, 0.17, 0], [pool - 0.05, 0.04, pool - 0.05]));
  parts.push(cyl("marble", [0, 0.2, 0], 0.25, 0.3, 0.7, 14));
  parts.push({
    ...person([0, 0.9, 0], 1.0, Math.PI, "marble", {
      name: "Youth",
      sex: "male",
      bearded: false,
      hair: "curls",
      dress: "chiton",
    }),
    scan: { id: "magdalensberg-youth" },
  });

  // Someone standing in the court, because a room is the one place where the
  // scale figure is the whole point.
  return parts;
}

/* ------------------------------------------------------------------ *
 * A tomb on a podium under a stepped pyramid
 * ------------------------------------------------------------------ */

/**
 * The Mausoleum at Halicarnassus, as the ancient descriptions and the
 * excavated foundation give it: a podium in three tiers, a ring of thirty-six
 * Ionic columns round a cella, a pyramid of twenty-four steps, and on the
 * summit a marble chariot drawn by four horses. The lions that lined the
 * podium and the statues that stood between the columns are here too — the
 * building carried some four hundred figures, and a bare version of it would
 * be a different building.
 */
export function mausoleumParts(spec: MausoleumSpec): Part[] {
  const parts: Part[] = [];
  const tiers = 3;
  const tierHeight = spec.podiumHeight / tiers;
  const setback = 1.4;
  const band = 0.9;

  // The podium, each tier set in and crowned by a moulded band.
  for (let t = 0; t < tiers; t += 1) {
    const w = spec.baseWidth - 2 * t * setback;
    const d = spec.baseDepth - 2 * t * setback;
    const y = t * tierHeight;
    parts.push(box("marble", [0, y, 0], [w, tierHeight - band, d]));
    /*
     * The podium was built of great squared blocks of marble in courses,
     * the joints of which give the tiers their scale; the lowest tier, on
     * the ground at the passer-by's eye, is drawn block by block.
     */
    for (const [rotY, length, out] of [
      [FACING.south, w, d / 2],
      [FACING.north, w, d / 2],
      [FACING.west, d, w / 2],
      [FACING.east, d, w / 2],
    ] as const) {
      parts.push(
        ...ashlar({
          at: [Math.sin(rotY) * out, y, Math.cos(rotY) * out],
          rotY,
          length,
          // Under the Amazon frieze on the top tier, not through it.
          height: tierHeight - band - (t === tiers - 1 ? 1.05 : 0),
          course: 0.9,
          material: "marble",
          foot: t === 0,
          coping: false,
          ...(t === 0 ? { blocks: 2.2 } : {}),
        }),
      );
    }
    parts.push(...cornice("marble", [0, y + tierHeight - band, 0], w + 0.5, d + 0.5, band));
    // The ovolo of each crowning moulding kept its eggs and darts in paint.
    for (const [rotY, length, out] of [
      [FACING.south, w + 0.68, (d + 0.5) / 2 + 0.09],
      [FACING.north, w + 0.68, (d + 0.5) / 2 + 0.09],
      [FACING.west, d + 0.68, (w + 0.5) / 2 + 0.09],
      [FACING.east, d + 0.68, (w + 0.5) / 2 + 0.09],
    ] as const) {
      parts.push(
        ...paintedRun(
          ["fadedRed", "fadedBlue"],
          [Math.sin(rotY) * out, y + tierHeight - band + band / 3 + 0.04, Math.cos(rotY) * out],
          rotY,
          length,
          band / 3 - 0.16,
          0.5,
        ),
      );
    }
  }
  /*
   * No inscription from the Mausoleum's own walls survives, so its podium
   * carries none here: a tomb of a dynast did not need to say whose it was.
   */
  const podiumTop = spec.podiumHeight;

  /*
   * The Amazon frieze, from scans of slabs in the British Museum, run round
   * the top tier under its crowning moulding. Where on the building it ran is
   * argued over; the podium crown is one of the readings. Only two scans are
   * free, so they alternate — the real frieze never repeated.
   */
  {
    const friezeH = 0.9;
    const w = spec.baseWidth - 4 * setback;
    const d = spec.baseDepth - 4 * setback;
    const y = podiumTop - band - friezeH - 0.05;
    const slabs = [
      { id: "mausoleum-amazon-1" as const, aspect: 2.95 },
      { id: "mausoleum-amazon-2" as const, aspect: 2.03 },
    ];
    const faces: { length: number; at: (u: number) => Vec3; rotY: number }[] = [
      { length: w, at: (u) => [u, y, -d / 2 - 0.02], rotY: Math.PI },
      { length: w, at: (u) => [-u, y, d / 2 + 0.02], rotY: 0 },
      { length: d, at: (u) => [w / 2 + 0.02, y, u], rotY: Math.PI / 2 },
      { length: d, at: (u) => [-w / 2 - 0.02, y, -u], rotY: -Math.PI / 2 },
    ];
    let k = 0;
    for (const face of faces) {
      const widths: number[] = [];
      let used = 0;
      for (;;) {
        const next = friezeH * slabs[(k + widths.length) % 2]!.aspect;
        if (used + next > face.length - 0.4) break;
        widths.push(next);
        used += next;
      }
      let u = -used / 2;
      for (const width of widths) {
        const slab = slabs[k % 2]!;
        parts.push({
          ...relief("marble", face.at(u + width / 2), [width, friezeH], undefined, face.rotY),
          scan: { id: slab.id },
        });
        u += width;
        k += 1;
      }
    }
  }

  // The lions, pacing the ledge below the top tier, all facing outwards.
  const ledgeY = 2 * tierHeight;
  const lw = spec.baseWidth / 2 - setback - 0.35;
  const ld = spec.baseDepth / 2 - setback - 0.35;
  const perimeter = 4 * (lw + ld);
  for (let i = 0; i < spec.lions; i += 1) {
    let s = (perimeter * (i + 0.5)) / spec.lions;
    let at: Vec3;
    let rotY: number;
    if (s < 2 * ld) {
      at = [lw, ledgeY, -ld + s];
      rotY = -Math.PI / 2;
    } else if ((s -= 2 * ld) < 2 * lw) {
      at = [lw - s, ledgeY, ld];
      rotY = Math.PI;
    } else if ((s -= 2 * lw) < 2 * ld) {
      at = [-lw, ledgeY, ld - s];
      rotY = Math.PI / 2;
    } else {
      s -= 2 * ld;
      at = [-lw + s, ledgeY, -ld];
      rotY = 0;
    }
    // From the scan of a Greek tomb lion of the same tradition (see scans.ts).
    // The procedural lion faces -z, a scan +z: hence the half turn.
    parts.push({
      kind: "figure",
      material: "marbleWorn",
      at,
      height: 1.15,
      rotY: rotY + Math.PI,
      scan: { id: "lion-met" },
    });
  }

  // Thirty-six columns, nine by eleven, one intercolumniation in from the edge.
  const topW = spec.baseWidth - 2 * (tiers - 1) * setback;
  const topD = spec.baseDepth - 2 * (tiers - 1) * setback;
  const gridW = topW - 3;
  const gridD = topD - 3;
  let raised = 0;
  const columnsAt: Vec3[] = [];
  for (let i = 0; i < spec.columnsShort; i += 1) {
    for (let k = 0; k < spec.columnsLong; k += 1) {
      const onEdge =
        i === 0 || i === spec.columnsShort - 1 || k === 0 || k === spec.columnsLong - 1;
      if (!onEdge || raised >= spec.columns) continue;
      raised += 1;
      const x = -gridW / 2 + (gridW * i) / (spec.columnsShort - 1);
      const z = -gridD / 2 + (gridD * k) / (spec.columnsLong - 1);
      columnsAt.push([x, podiumTop, z]);
      parts.push(
        ...column(
          "marble",
          [x, podiumTop, z],
          spec.columnDiameter,
          spec.columnHeight,
          "ionic",
          undefined,
          true,
        ),
      );
    }
  }
  // Statues between the columns: draped figures on the front and the sides.
  let placed = 0;
  for (let i = 0; i < columnsAt.length - 1 && placed < spec.statues; i += 1) {
    const a = columnsAt[i]!;
    const b = columnsAt[i + 1]!;
    if (Math.hypot(a[0] - b[0], a[2] - b[2]) > gridW / (spec.columnsShort - 1) + 0.5) continue;
    const mid: Vec3 = [(a[0] + b[0]) / 2, podiumTop, (a[2] + b[2]) / 2];
    // Facing straight out from the side of the colonnade it stands in: a
    // figure's front is its +z, turned by rotY onto (sin, cos). (Turned by
    // the angle from the middle, mirrored in z as it was, the figures down
    // the long sides stood with their backs to the street.)
    const sideways = Math.abs(mid[0]) / gridW > Math.abs(mid[2]) / gridD;
    const facing = sideways ? (Math.sign(mid[0]) * Math.PI) / 2 : mid[2] < 0 ? Math.PI : 0;
    const who = IDENTITIES.hekatomnids[placed % IDENTITIES.hekatomnids.length]!;
    parts.push({
      ...person(
        mid,
        2.6,
        facing,
        "marble",
        who,
        PAINT.hekatomnids[(placed * 3) % PAINT.hekatomnids.length]!,
      ),
      scan: { id: dynastScan(who, placed) },
    });
    placed += 1;
  }
  // The cella inside the ring, its walls laid in courses on a moulded foot.
  parts.push(box("marbleWorn", [0, podiumTop, 0], [gridW - 5, spec.columnHeight, gridD - 5]));
  for (const [rotY, length, out] of [
    [FACING.south, gridW - 5, (gridD - 5) / 2],
    [FACING.north, gridW - 5, (gridD - 5) / 2],
    [FACING.west, gridD - 5, (gridW - 5) / 2],
    [FACING.east, gridD - 5, (gridW - 5) / 2],
  ] as const) {
    parts.push(
      ...ashlar({
        at: [Math.sin(rotY) * out, podiumTop, Math.cos(rotY) * out],
        rotY,
        length,
        height: spec.columnHeight,
        course: 0.75,
        coping: false,
      }),
    );
  }
  // Architrave, frieze and cornice over the colonnade.
  const beamTop = podiumTop + spec.columnHeight;
  parts.push(
    ...cornice(
      "marble",
      [0, beamTop, 0],
      gridW + spec.columnDiameter * 2.4,
      gridD + spec.columnDiameter * 2.4,
      spec.entablatureHeight,
    ),
  );
  parts.push(box("marbleWorn", [0, beamTop, 0], [gridW - 5, spec.entablatureHeight, gridD - 5]));
  // The frieze course of the entablature: its ground was blue, now a grey ghost.
  {
    const W = gridW + spec.columnDiameter * 2.4;
    const D = gridD + spec.columnDiameter * 2.4;
    const course = spec.entablatureHeight / 3;
    for (const [rotY, length, out] of [
      [FACING.south, W, D / 2],
      [FACING.north, W, D / 2],
      [FACING.west, D, W / 2],
      [FACING.east, D, W / 2],
    ] as const) {
      parts.push(
        paintBand(
          "fadedBlue",
          [Math.sin(rotY) * out, beamTop + course * 0.2, Math.cos(rotY) * out],
          rotY,
          length,
          course * 0.6,
        ),
      );
    }
  }

  // The pyramid: twenty-four steps closing to the platform the chariot stands on.
  const pyramidBase = beamTop + spec.entablatureHeight;
  const stepH = spec.pyramidHeight / spec.pyramidSteps;
  const fromW = gridW + spec.columnDiameter * 2.4;
  const fromD = gridD + spec.columnDiameter * 2.4;
  const summit = 7;
  for (let s = 0; s < spec.pyramidSteps; s += 1) {
    const t = s / spec.pyramidSteps;
    const w = fromW + (summit - fromW) * t;
    const d = fromD + (summit - fromD) * t;
    parts.push(box("marble", [0, pyramidBase + s * stepH, 0], [w, stepH, d]));
  }

  // The quadriga: a pedestal, four horses abreast, the chariot and the two
  // figures riding in it, all in marble, the whole group the cited height.
  const summitY = pyramidBase + spec.pyramidHeight;
  const pedestal = 1.0;
  parts.push(box("marble", [0, summitY, 0], [summit, pedestal, summit]));
  const horseScale = (spec.quadrigaHeight - pedestal) / 2.3;
  const groupY = summitY + pedestal;
  for (const x of [-1.5, -0.5, 0.5, 1.5]) {
    parts.push(
      ...horseStatue(
        "marble",
        [x * 1.05 * horseScale, groupY, 0.6 * horseScale],
        0,
        horseScale,
        x < 0 ? -1 : 1,
      ),
    );
  }
  const chariotZ = 1.9 * horseScale;
  parts.push(
    box("marble", [0, groupY, chariotZ], [1.3 * horseScale, 0.55 * horseScale, 0.9 * horseScale]),
  );
  parts.push(
    box(
      "marble",
      [0, groupY + 0.55 * horseScale, chariotZ + 0.12 * horseScale],
      [1.3 * horseScale, 0.55 * horseScale, 0.12 * horseScale],
    ),
  );
  for (const side of [-1, 1]) {
    parts.push(
      cyl(
        "marble",
        [side * 0.72 * horseScale, groupY + 0.42 * horseScale, chariotZ],
        0.42 * horseScale,
        0.42 * horseScale,
        0.1 * horseScale,
        18,
        { rotY: Math.PI / 2, rotX: Math.PI / 2 },
      ),
    );
  }
  // Mausolus, bearded, and Artemisia beside him, standing in the car.
  parts.push({
    ...person(
      [-0.3 * horseScale, groupY + 0.55 * horseScale, chariotZ],
      1.55 * horseScale,
      Math.PI,
      "marble",
      IDENTITIES.maussollos,
      PAINT.maussollos,
    ),
    scan: { id: "asklepios-lod" },
  });
  parts.push({
    ...person(
      [0.3 * horseScale, groupY + 0.55 * horseScale, chariotZ],
      1.45 * horseScale,
      Math.PI,
      "marble",
      IDENTITIES.artemisia,
      PAINT.artemisia,
    ),
    scan: { id: "ephesus-portrait-lod" },
  });

  // On the low ground of the city, with the harbour hills behind.
  parts.push(...setting(spec.baseDepth * 0.7, 3531, { stone: 0.5, grass: 0.9, hills: 0.45 }));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A tumulus with a terrace of enthroned colossi
 * ------------------------------------------------------------------ */

/**
 * The east terrace of Nemrut Dağı, with the gravel tumulus rising behind it.
 *
 * Five colossi sit enthroned in a row with their backs to the mound — the
 * king, the goddess of Commagene, Zeus, Apollo and Herakles under the names
 * Antiochus gave them — with an eagle and a lion closing the row at either
 * end, and the stepped altar facing them across the court. The tumulus is
 * scenery: the camera frames the terrace, and the mound is what stands behind
 * it. The heads that today lie at the statues' feet are back on their
 * shoulders, because this is the sanctuary as built.
 */
export function tumulusSanctuaryParts(spec: TumulusSanctuarySpec): Part[] {
  const parts: Part[] = [];
  const R = spec.tumulusDiameter / 2;
  // The mound, its foot just behind the plinth the statues sit on.
  parts.push(
    scenery(worn(cyl("stone", [-R - 2.5, -0.5, 0], R, R * 0.06, spec.tumulusHeight, 72), 1.6)),
  );

  // The terrace: the paved court, and the plinth along its west side.
  const halfCourt = spec.courtWidth / 2;
  parts.push(
    box(
      "stone",
      [spec.courtDepth / 2 + 1, -0.3, 0],
      [spec.courtDepth + 6, 0.3, spec.courtWidth + 12],
    ),
  );
  const plinthHeight = 0.9;
  const rowWidth = spec.courtWidth + 8;
  parts.push(box("limestone", [-0.5, 0, 0], [5.4, plinthHeight, rowWidth]));
  parts.push(box("limestone", [-1.2, plinthHeight, 0], [4.0, 0.5, rowWidth - 1]));
  const seatY = plinthHeight + 0.5;

  /*
   * The colossi, facing east across the court; left to right as seen from
   * the court, the king first and Herakles last. A viewer in the court looks
   * west, so their left is +z and the row runs down it.
   *
   * One unit sizes every figure on the terrace: the head of a god, chin to
   * crown, fixed so that Zeus — the one whose height is measured — reaches
   * the cited height from the foot of his throne to the tip of his tiara.
   * The others are cut to the same scale, so a bare-headed Herakles stands
   * lower than a tiara'd king, as the real ones did.
   */
  const colossi = IDENTITIES.nemrutColossi;
  const throne = spec.throneHeight;
  const unit = (spec.statueHeight - throne) / NEMRUT_CROWN;
  const footstool = throne - NEMRUT_SOLE * unit;
  for (let i = 0; i < spec.colossi; i += 1) {
    const z = ((spec.colossi - 1) / 2 - i) * (spec.throneBase + 0.8);
    // The throne: a block to sit on, and a slab for the god's back.
    parts.push(
      worn(box("limestone", [-1.0, seatY, z], [spec.throneBase, throne, spec.throneBase]), 0.04),
    );
    parts.push(
      worn(
        box(
          "limestone",
          [-1.0 - spec.throneBase / 2 + 0.25, seatY + throne, z],
          [0.5, unit * 2, spec.throneBase],
        ),
        0.03,
      ),
    );
    /*
     * Antiochus' law for the sanctuary — who was to be honoured, on which
     * days, and how the priests were to dress — was cut in long columns on
     * the backs of the thrones' bases, facing the mound. Its opening lines
     * (IGLSyr 1, 1), the king's titles and the reason he gives for building,
     * are cut here in turn across the backs, six lines to a throne; set a
     * few centimetres off the weathered face so the noise of the stone does
     * not swallow them.
     */
    {
      const nomos = TEXTS.nemrutNomos.text;
      const share = Math.ceil(nomos.length / spec.colossi);
      const lines = nomos.slice(i * share, (i + 1) * share);
      if (lines.length) {
        parts.push(
          ...inscription({
            at: [-1.0 - spec.throneBase / 2 - 0.02, seatY + throne * 0.55, z],
            rotY: FACING.west,
            width: spec.throneBase - 0.5,
            letter: 0.1,
            height: throne * 0.6,
            middle: true,
            text: { ...TEXTS.nemrutNomos, text: lines },
          }),
        );
      }
    }
    // The footstool in front of the throne, as wide as it, at the height the
    // god's feet come down to.
    parts.push(
      box("limestone", [spec.throneBase / 2 - 0.2, seatY, z], [1.6, footstool, spec.throneBase]),
    );
    parts.push(
      ...nemrutColossus(
        "limestone",
        [-1.5, seatY + throne, z],
        Math.PI / 2,
        unit,
        colossi[i % colossi.length]!,
      ),
    );
  }
  // The guardians: an eagle then a lion beyond the last throne at each end,
  // looking out over the court with the gods, in the same stone and cut in
  // the same way.
  const edge = ((spec.colossi - 1) / 2) * (spec.throneBase + 0.8) + spec.throneBase / 2;
  for (const side of [-1, 1]) {
    const eagleZ = side * (edge + 1.6);
    const lionZ = side * (edge + 4.6);
    parts.push(box("limestone", [-1.0, seatY, eagleZ], [3.0, 0.6, 3.0]));
    parts.push(
      // Set forward so its talons grip the front edge of its base.
      ...nemrutEagle(
        "limestone",
        [0.5 - 0.17 * spec.guardianHeight, seatY + 0.6, eagleZ],
        Math.PI / 2,
        spec.guardianHeight,
      ),
    );
    parts.push(box("limestone", [-1.0, seatY, lionZ], [3.2, 0.6, 3.0]));
    parts.push(
      ...nemrutLion("limestone", [-1.3, seatY + 0.6, lionZ], Math.PI / 2, spec.guardianHeight),
    );
  }

  // The stepped altar across the court from the gods.
  const altarX = spec.courtDepth - 4;
  for (let s = 0; s < spec.altarSteps; s += 1) {
    const w = 7 - s * 1.1;
    parts.push(worn(box("limestone", [altarX, s * 0.8, 0], [w, 0.8, w]), 0.03));
  }
  // The rows of stelae with the king's ancestors, along both long sides.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i += 1) {
      const x = 5 + i * 3.2;
      parts.push(worn(box("limestone", [x, 0, side * (halfCourt + 1)], [1.5, 2.6, 0.4]), 0.03));
      /*
       * Each stele carried a relief: the king shaking hands with a god, or
       * an ancestor in his regalia. Cut here as two low silhouettes facing
       * each other with their right hands joined — the dexiosis that is the
       * signature image of Commagene.
       */
      const face = side * (halfCourt + 1) - side * 0.2;
      const scale = 1.75;
      const figure = (flip: number, tall: boolean): [number, number][] => {
        const pts: [number, number][] = [
          [-0.1, 0],
          [0.1, 0],
          [0.12, 0.45],
          [0.16, 0.62],
          [0.3, 0.66],
          [0.31, 0.7],
          [0.15, 0.74],
          [0.11, 0.8],
          [0.07, 0.82],
          [0.1, 0.9],
          [0.06, tall ? 1.08 : 1.0],
          [-0.04, tall ? 1.1 : 1.0],
          [-0.09, 0.92],
          [-0.07, 0.83],
          [-0.15, 0.78],
          [-0.17, 0.5],
          [-0.12, 0.45],
        ];
        return pts.map(([u, v]) => [u * flip * scale * 0.55, v * scale * 0.95 + 0.25]);
      };
      for (const [offset, flip, tall] of [
        [-0.32, 1, true],
        [0.32, -1, i % 2 === 0],
      ] as const) {
        parts.push({
          kind: "carving",
          material: "limestone",
          at: [x + offset * (side > 0 ? -1 : 1), 0, face],
          outline: figure(flip * (side > 0 ? -1 : 1), tall),
          depth: 0.05,
          rotY: side > 0 ? Math.PI : 0,
        });
      }
      parts.push(box("limestone", [x, 0, side * (halfCourt + 1)], [2.0, 0.4, 1.0]));
    }
  }

  // A bare summit above the tree line: rock and thin scrub, ridges all round.
  parts.push(
    ...setting(spec.courtDepth * 0.9, 6234, {
      stone: 1.4,
      grass: 0.4,
      hills: 1.1,
      ground: "stone",
    }),
  );
  return parts;
}

export function partsFor(spec: ModelSpec): Part[] {
  return dryScenery(buildParts(spec));
}

/**
 * Scenery scattered round a site (loose stone, bedrock, the ridges on the
 * skyline) is laid out in rings with no idea where the river or the sea is;
 * whatever of it fell into the water is taken out again, so no slab floats on
 * the Euphrates and no hill stands in the bay at Patara.
 */
function dryScenery(parts: Part[]): Part[] {
  const water = waterOf(parts).filter((w) => w.hx * w.hz >= 40);
  if (water.length === 0) return parts;
  return parts.filter(
    (part) =>
      !part.decor ||
      part.material === "water" ||
      !water.some((w) => distanceTo(w, part.at[0], part.at[2]) < -0.5),
  );
}

function buildParts(spec: ModelSpec): Part[] {
  switch (spec.kind) {
    case "roman-facade":
      return romanFacadeParts(spec);
    case "roman-theatre":
      return romanTheatreParts(spec);
    case "ionic-dipteros":
      return ionicDipterosParts(spec);
    case "neolithic-enclosure":
      return neolithicEnclosureParts(spec);
    case "great-altar":
      return greatAltarParts(spec);
    case "peristyle-house":
      return peristyleHouseParts(spec);
    case "stadium":
      return stadiumParts(spec);
    case "mausoleum":
      return mausoleumParts(spec);
    case "tumulus-sanctuary":
      return tumulusSanctuaryParts(spec);
    case "hittite-gate":
      return hittiteGateParts(spec);
    case "troy-citadel":
      return troyCitadelParts(spec);
    case "neolithic-town":
      return neolithicTownParts(spec);
    case "medieval-cathedral":
      return cathedralParts(spec);
    case "nymphaeum":
      return nymphaeumParts(spec);
    case "terrace-villa":
      return villaParts(spec);
    case "cliff-monastery":
      return cliffMonasteryParts(spec);
    case "lighthouse":
      return lighthouseParts(spec);
  }
}

/**
 * Where a walk through the model begins: the point on the plan to stand on,
 * the height of the floor expected there, and what to look at.
 *
 * Not outside the building where a visitor arrives, but where its life is:
 * in a theatre a few rows up on the axis, looking down at the stage; in a
 * stadium at the edge of the track, looking along it; at a temple, a tomb or
 * an altar in the forecourt at the foot of the steps, facing the front; in
 * the library square before the façade; in the court of a house; inside the
 * ring of Göbeklitepe; and in the court at Nemrut, facing the gods.
 */
export type WalkStart = { at: [number, number]; floor: number; look: Vec3 };

export function walkStartFor(spec: ModelSpec): WalkStart {
  switch (spec.kind) {
    case "roman-theatre": {
      const L = theatreLayout(spec);
      // Third row, on the axis: the stage straight ahead and the orchestra below.
      const row = L.rowAt(Math.min(2, L.rows - 1));
      return {
        at: [0, row.inner + spec.seatTread * 0.6],
        floor: row.y + spec.seatRise + 0.06,
        look: [0, L.stageTop + 1.6, L.wallZ],
      };
    }
    case "stadium": {
      const L = stadiumLayout(spec);
      // On the track by its edge, halfway down, looking along it.
      const z = (L.trackMin + L.trackMax) / 2;
      const x = L.arenaHalf - 2.5;
      return { at: [x, z], floor: 0, look: [-L.arenaHalf * 0.3, 1.6, L.trackMax] };
    }
    case "ionic-dipteros":
      return {
        at: [0, -spec.crepidomaLength / 2 - 6],
        floor: 0,
        look: [0, spec.columnHeight * 0.45, -spec.crepidomaLength / 2],
      };
    case "great-altar":
      return {
        at: [0, -spec.baseDepth / 2 - 7],
        floor: 0,
        look: [0, spec.totalHeight * 0.4, -spec.baseDepth / 2 + 4],
      };
    case "roman-facade": {
      const front = spec.steps * 0.44;
      return {
        at: [0, -front - 9],
        floor: 0,
        look: [0, spec.facadeHeight * 0.4, 0],
      };
    }
    case "peristyle-house":
      return {
        at: [spec.courtWidth * 0.22, -spec.courtDepth / 2 + 1.2],
        floor: 0,
        look: [0, spec.wallHeight * 0.45, spec.courtDepth / 2 + spec.roomDepth],
      };
    case "neolithic-enclosure":
      return {
        at: [0, -spec.enclosureDiameter * 0.28],
        floor: 0.14,
        look: [0, spec.centralPillarHeight * 0.5, 0],
      };
    case "mausoleum":
      return {
        // Before the offering table in the forecourt, not inside it.
        at: [0, -spec.baseDepth / 2 - 12.5],
        floor: 0,
        look: [0, spec.podiumHeight * 0.8, -spec.baseDepth / 2],
      };
    case "tumulus-sanctuary":
      return {
        at: [spec.courtDepth * 0.55, 0],
        floor: 0,
        look: [-1.5, spec.statueHeight * 0.55, 0],
      };
    case "hittite-gate":
      return hittiteGateWalkStart(spec);
    case "troy-citadel":
      return troyWalkStart(spec);
    case "neolithic-town":
      return neolithicTownWalkStart(spec);
    case "medieval-cathedral":
      return cathedralWalkStart(spec);
    case "nymphaeum":
      return nymphaeumWalkStart(spec);
    case "terrace-villa":
      return villaWalkStart(spec);
    case "cliff-monastery":
      return monasteryWalkStart(spec);
    case "lighthouse":
      return lighthouseWalkStart(spec);
  }
}

/** The axis-aligned box every part of a model fits inside, in metres. */
export function boundsOf(parts: Part[]): { min: Vec3; max: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];

  const grow = (x: number, y: number, z: number) => {
    min[0] = Math.min(min[0], x);
    min[1] = Math.min(min[1], y);
    min[2] = Math.min(min[2], z);
    max[0] = Math.max(max[0], x);
    max[1] = Math.max(max[1], y);
    max[2] = Math.max(max[2], z);
  };

  /** The footprint of a yawed rectangle, exactly rather than by its diagonal. */
  const yawed = (x: number, z: number, width: number, depth: number, rotY: number) => {
    const c = Math.abs(Math.cos(rotY));
    const s = Math.abs(Math.sin(rotY));
    return {
      hx: (width / 2) * c + (depth / 2) * s,
      hz: (width / 2) * s + (depth / 2) * c,
      x,
      z,
    };
  };

  for (const part of parts) {
    if (part.decor) continue;
    const [x, y, z] = part.at;
    if (part.kind === "box" && part.rotX) {
      // A tipped slab: every corner, turned as the renderer turns it.
      const [w, h, d] = part.size;
      const cx = Math.cos(part.rotX);
      const sx = Math.sin(part.rotX);
      const cy = Math.cos(part.rotY);
      const sy = Math.sin(part.rotY);
      for (const u of [-w / 2, w / 2])
        for (const v of [0, h])
          for (const t of [-d / 2, d / 2]) {
            const ty = v * cx - t * sx;
            const tz = v * sx + t * cx;
            grow(x + u * cy + tz * sy, y + ty, z - u * sy + tz * cy);
          }
    } else if (part.kind === "box" || part.kind === "prism") {
      // Taking the half-diagonal instead used to inflate a 60 x 120 m platform
      // to 134 m square, and the camera framed the empty air around it.
      const { hx, hz } = yawed(x, z, part.size[0], part.size[2], part.rotY);
      grow(x - hx, y, z - hz);
      grow(x + hx, y + part.size[1], z + hz);
    } else if (part.kind === "cylinder") {
      const r = Math.max(part.radiusBottom, part.radiusTop);
      if (part.rotX) {
        // Tipped over: the axis lies flat, so its length is a plan dimension.
        const { hx, hz } = yawed(x, z, r * 2, part.height * 2, part.rotY ?? 0);
        grow(x - hx, y - r, z - hz);
        grow(x + hx, y + r, z + hz);
      } else {
        grow(x - r, y, z - r);
        grow(x + r, y + part.height, z + r);
      }
    } else if (part.kind === "ring" || part.kind === "bank") {
      // A half ring covers half a circle, and saying otherwise put the centre
      // of a theatre 25 m behind its stage.
      const from = part.thetaStart;
      const to = part.thetaStart + part.thetaLength;
      const angles = [from, to];
      for (let quarter = -4; quarter <= 8; quarter += 1) {
        const angle = (quarter * Math.PI) / 2;
        if (angle > from && angle < to) angles.push(angle);
      }
      for (const angle of angles) {
        const outer = part.kind === "ring" ? part.outer : part.inner + part.reach;
        for (const r of [part.inner, outer]) {
          const px = x + Math.cos(angle) * r;
          const pz = z + Math.sin(angle) * r;
          grow(px, y, pz);
          grow(px, y + part.height, pz);
        }
      }
    } else if (part.kind === "relief") {
      // A panel has no depth worth counting; its width is what it spans.
      const { hx, hz } = yawed(x, z, part.size[0], 0.2, part.rotY);
      grow(x - hx, y, z - hz);
      grow(x + hx, y + part.size[1], z + hz);
    } else if (part.kind === "carving") {
      // A tilted outline can swing any of its extent into any direction, so
      // one is taken for all three; a level one only reaches as high as it is.
      let reach = 0;
      let top = 0;
      for (const [u, v] of part.outline) {
        reach = Math.max(reach, Math.abs(u), Math.abs(v));
        top = Math.max(top, v);
      }
      const { hx, hz } = yawed(x, z, reach * 2, part.depth * 2, part.rotY);
      grow(x - hx, y - (part.rotZ ? reach : 0), z - hz);
      grow(x + hx, y + (part.rotZ ? reach : top), z + hz);
    } else if (part.kind === "loft") {
      const c = Math.cos(part.rotY);
      const s = Math.sin(part.rotY);
      for (const section of part.sections) {
        const r = Math.max(section.rx, section.ry);
        const px = x + section.c[0] * c + section.c[2] * s;
        const py = y + section.c[1];
        const pz = z - section.c[0] * s + section.c[2] * c;
        grow(px - r, py - r, pz - r);
        grow(px + r, py + r, pz + r);
      }
    } else {
      // A figure: a rider's legs hang below the seat given as `at`.
      const r = part.height * 0.25;
      const foot =
        part.pose === "riding"
          ? y - part.height * 0.5
          : part.pose === "seated"
            ? y - part.height * 0.3
            : y;
      const top =
        part.pose === "riding" || part.pose === "seated" ? y + part.height * 0.62 : y + part.height;
      grow(x - r, foot, z - r);
      grow(x + r, top, z + r);
    }
  }

  return { min, max };
}

/*
 * The primitives and the larger pieces built from them, for the models that
 * live in their own files under `src/lib/models/` — each of those exports a
 * builder that `partsFor` hands its spec to. Used only inside functions
 * there, never at load time, so the import cycle this makes is harmless.
 */
export {
  box as kitBox,
  cyl as kitCyl,
  ring as kitRing,
  prism as kitPrism,
  relief as kitRelief,
  person as kitPerson,
  loft as kitLoft,
  worn as kitWorn,
  scenery as kitScenery,
  segmentalPediment as kitSegmentalPediment,
  column as kitColumn,
  cornice as kitCornice,
  setting as kitSetting,
  rubble as kitRubble,
  seeded as kitSeeded,
};
