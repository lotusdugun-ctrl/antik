import type { ScanId } from "@/lib/scans";
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
  | "water";

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
};

export type Part =
  | (Base & { kind: "box"; at: Vec3; size: Vec3; rotY: number })
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
        material,
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
  const parts: Part[] = [
    box(material, [x, y, z], [width, course, depth]),
    box(material, [x, y + course, z], [width * 1.02, course, depth * 1.08]),
    box(material, [x, y + course * 2, z], [width * 1.05, course, depth * 1.16]),
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
      dentils(width * 1.02, "x", side * ((depth * 1.08) / 2 + lip));
      dentils(depth * 1.08, "z", side * ((width * 1.02) / 2 + lip));
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

/**
 * A bronze horse with its rider astride at the withers, turned to face the
 * way the horse does: the pair on the Celsus court.
 */
function bronzeHorseman(at: Vec3, rotY: number, scale = 1.1, raised: -1 | 1 = -1): Part[] {
  return [
    ...horseStatue("bronze", at, rotY, scale, raised),
    {
      kind: "figure",
      material: "bronze",
      at: placed(at, rotY, [0, 1.38 * scale, -0.3 * scale]),
      height: 1.85 * scale,
      rotY: rotY + Math.PI,
      pose: "riding",
      // A benefactor of the city, laurelled, in the cuirass of command.
      identity: {
        name: "Horseman",
        sex: "male",
        bearded: true,
        hair: "curls",
        headgear: "diadem",
        face: { brow: 1.2, jaw: 1.15, nose: 1.1, age: 0.5 },
      },
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Animals in the round: an eagle (the lions are scans; see scans.ts)
 * ------------------------------------------------------------------ */

/**
 * An eagle standing with its wings folded, the bird that guards the rows of
 * gods on Nemrut Dağı. About 0.8 m tall at a scale of one, facing `-z`.
 */
function eagleStatue(material: Material, at: Vec3, rotY: number, scale = 1): Part[] {
  const parts: Part[] = [];
  const S = (c: Vec3, rx: number, ry: number): LoftSection => ({
    c: [c[0] * scale, c[1] * scale, c[2] * scale],
    rx: rx * scale,
    ry: ry * scale,
  });
  const skin = (sections: LoftSection[]) => parts.push(loft(material, at, rotY, sections));
  // The body stands nearly upright, the breast forward, the tail low behind.
  skin([
    S([0, 0.12, 0.2], 0.14, 0.12),
    S([0, 0.35, 0.1], 0.24, 0.22),
    S([0, 0.55, 0.0], 0.22, 0.2),
    S([0, 0.72, -0.08], 0.13, 0.12),
  ]);
  skin([
    S([0, 0.74, -0.1], 0.1, 0.1),
    S([0, 0.8, -0.2], 0.1, 0.1),
    S([0, 0.78, -0.28], 0.06, 0.06),
  ]);
  // The hooked beak.
  skin([
    S([0, 0.78, -0.28], 0.04, 0.04),
    S([0, 0.76, -0.34], 0.03, 0.03),
    S([0, 0.72, -0.37], 0.01, 0.01),
  ]);
  for (const side of [-1, 1]) {
    // A folded wing, lying along the flank and crossing over the tail.
    skin([
      S([side * 0.2, 0.66, -0.02], 0.06, 0.16),
      S([side * 0.22, 0.5, 0.15], 0.05, 0.2),
      S([side * 0.21, 0.3, 0.35], 0.03, 0.12),
      S([side * 0.2, 0.2, 0.48], 0.01, 0.04),
    ]);
    skin([
      S([side * 0.08, 0.3, 0.0], 0.05, 0.05),
      S([side * 0.08, 0.05, 0.0], 0.035, 0.035),
      S([side * 0.08, 0.0, -0.08], 0.09, 0.03),
    ]);
  }
  skin([S([0, 0.2, 0.28], 0.12, 0.05), S([0, 0.1, 0.45], 0.16, 0.03)]);
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
export function romanFacadeParts(spec: RomanFacadeSpec): Part[] {
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
  parts.push(box("marbleWorn", [0, 0, depth / 2 - 0.7], [w + 1.4, podium, depth + 1.4]));

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
    openings: { centre: number; width: number }[],
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
      // depth when you cannot cut a hole in a box.
      parts.push(
        box("shadow", [opening.centre, base, wallDepth - 0.06], [opening.width, height, 0.12]),
      );
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

  const doors = bays.map((bay) => ({ centre: bay.centre, width: bay.width * 0.72 }));
  wallCourse(y0, doorHeight, doors);

  /*
   * Timber doors in the three openings, panelled and studded. The library shut
   * at night like any other building, and a black hole where a door belongs is
   * the detail that most makes a reconstruction look unfinished.
   */
  for (const door of doors) {
    const leaf = door.width / 2 - 0.04;
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
      box("paintRed", [door.centre, y0 + doorHeight + 0.75, 0.06], [door.width * 1.15, 1.5, 0.12]),
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
            wallDepth - 0.12,
          ],
          [0.045, windowHeight, 0.045],
        ),
      );
    }
    for (let i = 1; i < rows; i += 1) {
      parts.push(
        box(
          "paintGold",
          [window.centre, windowBase + (windowHeight * i) / rows, wallDepth - 0.12],
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
  ) => {
    const pedestal = height * 0.26;
    const shaft = height * 0.58;
    const entablature = height - pedestal - shaft;
    const z = -(project + diameter / 2);

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
    // Sophia and Arete stand in the scans of their copies in the niches; the
    // other two copies are too blurred in the only free scan to be used.
    // Celsus and Aquila above are lost; a real togate portrait statue of the
    // period, the Arringatore, stands in for both.
    const scanned: ScanId | null =
      who.name === "Sophia"
        ? "celsus-sophia"
        : who.name === "Arete"
          ? "celsus-arete"
          : who.dress === "toga"
            ? "arringatore"
            : null;
    // The Arringatore leans back from his raised arm: he is stood further out
    // of the niche, or his shoulders would be in its back wall.
    const out = scanned === "arringatore" ? 0.42 : 0;
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
    const face = wallDepth + bandDepth - 0.04;
    parts.push(box("paintBlue", [0, level + 0.06, face], [w * 0.995, 0.2, 0.06]));
    parts.push(box("paintGold", [0, level + 0.26, face], [w * 0.995, 0.07, 0.07]));
    parts.push(box("paintRed", [0, level + 0.33, face], [w * 0.995, 0.14, 0.06]));
    parts.push(box("paintGold", [0, level + 0.47, face], [w * 0.995, 0.07, 0.07]));
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
      // The tympanum behind the raking cornice was painted, not left bare.
      parts.push(
        prism("paintRed", [0, top + 0.1, pedimentZ - 0.05], [width * 0.86, width * 0.24, 0.12]),
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
      parts.push(
        segmentalPediment(
          "paintRed",
          [bay.centre, top + 0.08, pedimentZ - pedimentDepth * 0.52],
          width * 0.43,
          0.1,
        ),
      );
    }
    // The gilded band along the top of the entablature under each pediment.
    parts.push(
      box("paintGold", [bay.centre, top - 0.16, pedimentZ], [width, 0.1, pedimentDepth * 1.04]),
    );
  });

  /*
   * The two bronze horsemen on the courtyard, one either side of the stairs.
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
    // The horse and its rider, a little over life size, each turned a touch
    // towards the stair so the pair address whoever climbs it.
    parts.push(
      ...bronzeHorseman([px, 2.94, pz + 0.05], side > 0 ? -0.3 : 0.3, 1.1, side > 0 ? -1 : 1),
    );
  }

  /* The hall: side walls, rear wall and apse, stopped at the height the
     masonry actually survives to. */
  const hallFront = spec.porchDepth + wallDepth;
  const hallBack = hallFront + spec.hallDepth;
  const wallThickness = 0.9;
  const halfHall = spec.hallWidth / 2;
  const hallHeight = spec.wallHeight;

  parts.push(
    box("stone", [0, y0 - 0.1, (hallFront + hallBack) / 2], [spec.hallWidth, 0.12, spec.hallDepth]),
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
   * What the seats rest on: earth where the theatre lies in a hillside, the
   * vaulted mass of the substructure where it stands up out of a plain. Seen
   * from the end of a wing, the bank is solid, not a flight of floating rings.
   */
  const fill: Material = ch.ground === "hillside" ? "ground" : "stoneDark";
  for (const [first, last] of [
    [0, spec.lowerRows - 1],
    ...(middle > 0 ? [[spec.lowerRows, spec.lowerRows + middle - 1]] : []),
    [spec.lowerRows + middle, rows - 1],
  ] as [number, number][]) {
    const lo = rowAt(first);
    const hi = rowAt(last);
    const [start, length] = rowSpan(last);
    parts.push(ring(fill, 0, lo.inner, hi.outer + diazoma, lo.y, start, length));
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
  /** Earth banked against the outer wall, falling away in shallow steps. */
  const slope = (from: number, height: number, reach: number, start: number, length: number) => {
    const steps = 40;
    const out: Part[] = [];
    for (let k = 0; k < steps; k += 1) {
      const t = k / steps;
      // An easing curve: steep at the wall, flattening out into the plain.
      const h = height * (1 - t) ** 1.6;
      out.push(
        scenery(
          ring(
            "ground",
            0,
            from + reach * t - 0.2,
            from + reach * (t + 1 / steps),
            h,
            start,
            length,
          ),
        ),
      );
    }
    return out;
  };
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
    for (let i = 0; i <= arcadeColumns; i += 1) {
      const theta = fullStart + (fullLength * i) / arcadeColumns;
      const r = galleryInner + 0.5;
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
        box(wallStone, [x, 0, -1.2], [spec.lowerRows * spec.seatTread * 0.8, rowAt(6).y, 2.4]),
      );
      parts.push(
        box("marbleWorn", [x, rowAt(6).y, -1.2], [spec.lowerRows * spec.seatTread * 0.8, 1.1, 2.6]),
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
  // The stage floor, and the front of it the actors played above.
  const floorWidth = Math.min(stageWidth * 0.94, spec.caveaDiameter * 0.62);
  parts.push(box("timber", [0, 0, wallZ / 2], [floorWidth, stageTop, spec.stageDepth]));
  parts.push(box(screenStone, [0, 0, -0.2], [floorWidth, stageTop - 0.05, 0.4]));
  // Niches in the low stage front: square and round in turn.
  const niches = Math.round(floorWidth / 4);
  for (let i = 0; i < niches; i += 1) {
    const x = -floorWidth / 2 + (i + 0.5) * (floorWidth / niches);
    if (i % 2 === 0) {
      parts.push(
        cyl("shadow", [x, 0.25, 0.02], 0.7, 0.7, stageTop * 0.6, 12, {
          thetaStart: Math.PI / 2,
          thetaLength: Math.PI,
        }),
      );
    } else {
      parts.push(box("shadow", [x, 0.25, 0.02], [1.2, stageTop * 0.55, 0.06]));
    }
  }

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
      if (ch.screen === "miletus") {
        // Paired columns, close together.
        aedicula(x - bayWidth * 0.14, storey.base, storey.height, project, shaft);
        aedicula(x + bayWidth * 0.14, storey.base, storey.height, project, shaft);
      } else {
        aedicula(x, storey.base, storey.height, project, shaft);
      }
    }
    // The continuous cornice the aediculae break forward from.
    parts.push(
      ...cornice(
        screenStone,
        [0, storey.base + storey.height - 0.7, wallZ + 0.5],
        stageWidth * 0.94,
        1.5,
        0.7,
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
    // The pediment over the middle bay of the upper storey, with Dionysos
    // rising out of acanthus in the gable.
    const upper = storeys[1]!;
    parts.push(
      prism(
        screenStone,
        [0, upper.base + upper.height * 0.72, wallZ + 2.0],
        [bayWidth * 1.8, 2.2, 1.4],
      ),
    );
    parts.push(
      cyl(
        "marble",
        [0, upper.base + upper.height * 0.72 + 0.6, wallZ + 2.72],
        0.55,
        0.55,
        0.2,
        14,
        { rotX: Math.PI / 2 },
      ),
    );
    /*
     * The roof over the stage: a timber ceiling sloping down from the top of
     * the wall towards the audience. It is gone, but the sockets of its beams
     * are still in the wall.
     */
    const reach = spec.stageDepth + 0.5;
    const drop = 3.2;
    parts.push(
      relief(
        "timber",
        [0, crown + 1.2 - drop / 2, wallZ + reach / 2],
        [floorWidth, Math.hypot(reach, drop)],
        undefined,
        0,
        Math.PI / 2 - Math.atan2(drop, reach),
      ),
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
      parts.push(
        scenery(box("terracotta", [x * 0.82, 5.3, behind - length / 2], [4.6, 0.3, length])),
      );
    }
  } else if (ch.annex === "harbour") {
    const cz = behind - 70;
    parts.push(scenery(box("water", [0, 0.02, cz], [spec.caveaDiameter * 1.8, 0.05, 110])));
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

  for (let i = 0; i < spec.crepidomaSteps; i += 1) {
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
    parts.push(...column("marble", [x, y0, z], spec.columnDiameter, spec.columnHeight, "ionic"));
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
      const course = (y: number, h: number, depth: number, material: Material = "marble") => {
        const grow = depth - t;
        parts.push(
          box(
            material,
            [r.c[0] + (r.out[0] * grow) / 2, y, r.c[2] + (r.out[2] * grow) / 2],
            r.along === "z" ? [depth, h, r.len + grow] : [r.len + grow, h, depth],
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
  // The front wall of the court, pierced by the great portal nobody walked
  // through: the opening sits above the floor of the porch.
  const portalWidth = 5.6;
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
  parts.push(
    box("shadow", [0, y0, courtCentre - halfCL - wallThickness], [portalWidth, portalHeight, 0.3]),
  );
  // The court floor sits below the porch, reached by the two sloping tunnels.
  parts.push(box("stone", [0, y0 - 1.4, courtCentre], [courtWidth, 0.3, courtLength]));

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
    const courses = 20;
    const pitch = roofHalf * 0.36;
    for (let i = 0; i < courses; i += 1) {
      const width = 2 * roofHalf * (1 - i / courses);
      parts.push(
        box(
          "marbleWorn",
          [0, eaves + (pitch * i) / courses, 0],
          [width, pitch / courses + 0.02, roofLength],
        ),
      );
    }
    for (const side of [-1, 1]) {
      parts.push(
        prism("marble", [0, eaves, side * (roofLength / 2 - 0.6)], [roofHalf * 2, pitch, 1.2]),
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
      // Zeus stands in a real Roman scan of the bearded god of the type.
      ...(spec.cultStatue === "zeus" ? { scan: { id: "neptune" as const } } : {}),
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

  // The five steps that run round the building, open where the stair cuts in.
  for (let i = 0; i < spec.steps; i += 1) {
    const grow = (spec.steps - i) * stepRun;
    const w = spec.baseWidth + 2 * grow;
    const d = spec.baseDepth + 2 * grow;
    parts.push(
      box("marbleWorn", [0, i * stepRise, halfD + grow - stepRun / 2], [w, stepRise, stepRun]),
    );
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "marbleWorn",
          [side * (halfW + grow - stepRun / 2), i * stepRise, 0],
          [stepRun, stepRise, d],
        ),
      );
      const from = side * halfStair;
      const to = side * (halfW + grow);
      parts.push(
        box(
          "marbleWorn",
          [(from + to) / 2, i * stepRise, -(halfD + grow - stepRun / 2)],
          [Math.abs(to - from), stepRise, stepRun],
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
  };

  podiumBlock(0, halfD - backDepth / 2, spec.baseWidth, backDepth);
  /*
   * The Athena group, from a cast of it, on the east face where it belongs —
   * a little right of the middle as seen from the east, beside Zeus. It is
   * set just proud of the photographed frieze, which carries on either side.
   */
  {
    const eastFace = halfD - backDepth / 2 + (backDepth + 0.5) / 2 + 0.02;
    const athenaWidth = spec.friezeHeight * 1.64;
    parts.push({
      ...relief(
        "marble",
        [-spec.baseWidth * 0.08, friezeBase, eastFace],
        [athenaWidth, spec.friezeHeight],
        undefined,
        0,
      ),
      scan: { id: "pergamon-athena" },
    });
  }
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
      parts.push(...column("marble", [x, terrace, z], spec.columnDiameter, columnHeight, "ionic"));
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
  parts.push(...ornateAltar([0, terrace, 2], 4.4, 3.2, 2.0));

  // The altar stood on a terrace cut into the acropolis, high above the plain,
  // so the skyline is close and the ground is rock.
  parts.push(...setting(spec.baseWidth * 0.55, 6607, { stone: 0.8, grass: 0.5, hills: 0.9 }));
  return parts;
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

  parts.push(box("stone", [0, 0, 0], [spec.arenaWidth + 2 * (spec.bow ?? 0), 0.12, endCentre * 2]));
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
          box("shadow", [side * (outerRadius + 0.05), 0, zc], [0.1, spring + r * 0.9, opening]),
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
  parts.push(box("stoneDark", [0, 0, 0], [pool + 0.4, 0.22, pool + 0.4]));
  parts.push(box("shadow", [0, 0.02, 0], [pool, 0.18, pool]));

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
  const courses = 4;
  for (const side of [-1, 1]) {
    for (let c = 0; c < courses; c += 1) {
      const inset = (eaveWidth * (c + 0.5)) / courses;
      const y = eaveTop - ((c * 0.28) / courses) * 2;
      parts.push(
        box(
          "terracotta",
          [0, y, side * (halfD + wall - inset)],
          [spec.courtWidth + wall * 2, 0.06, eaveWidth / courses + 0.02],
        ),
      );
      parts.push(
        box(
          "terracotta",
          [side * (halfW + wall - inset), y, 0],
          [eaveWidth / courses + 0.02, 0.06, spec.courtDepth + wall * 2],
        ),
      );
    }
    // Cover tiles running down the slope, and the antefix at each eave end.
    const along = Math.floor((spec.courtWidth + wall * 2) / 0.45);
    for (let i = 0; i < along; i += 1) {
      const x = -(spec.courtWidth / 2 + wall) + 0.45 * (i + 0.5);
      parts.push(
        cyl("terracotta", [x, eaveTop + 0.04, side * (halfD + wall)], 0.06, 0.06, eaveWidth, 6, {
          rotX: Math.PI / 2,
          rotY: side > 0 ? Math.PI : 0,
        }),
      );
      parts.push(
        prism(
          "terracotta",
          [x, eaveTop - 0.56, side * (halfD + wall - eaveWidth - 0.02)],
          [0.22, 0.24, 0.04],
        ),
      );
    }
    const across = Math.floor((spec.courtDepth + wall * 2) / 0.45);
    for (let i = 0; i < across; i += 1) {
      const z = -(spec.courtDepth / 2 + wall) + 0.45 * (i + 0.5);
      parts.push(
        cyl("terracotta", [side * (halfW + wall), eaveTop + 0.04, z], 0.06, 0.06, eaveWidth, 6, {
          rotX: Math.PI / 2,
          rotY: side > 0 ? -Math.PI / 2 : Math.PI / 2,
        }),
      );
      parts.push(
        prism(
          "terracotta",
          [side * (halfW + wall - eaveWidth - 0.02), eaveTop - 0.56, z],
          [0.22, 0.24, 0.04],
          Math.PI / 2,
        ),
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
        box("paintRed", [face - side * 0.01, 0.61, z], [0.03, spec.wallHeight * 0.62 - 0.12, w]),
      );
    }
    // A dark dado along the foot of the wall, as Roman walls had.
    parts.push(box("stoneDark", [face, 0, 0], [0.03, 0.55, spec.courtDepth]));
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
  // Water in the pool, and a marble Eros over it as the fountain.
  parts.push(box("paintBlue", [0, 0.17, 0], [pool - 0.05, 0.04, pool - 0.05]));
  parts.push(cyl("marble", [0, 0.2, 0], 0.25, 0.3, 0.7, 14));
  parts.push(
    person([0, 0.9, 0], 0.95, Math.PI, "marble", {
      name: "Eros",
      sex: "male",
      bearded: false,
      hair: "curls",
      dress: "chiton",
      right: "phiale",
    }),
  );

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
    parts.push(...cornice("marble", [0, y + tierHeight - band, 0], w + 0.5, d + 0.5, band));
  }
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
        ...column("marble", [x, podiumTop, z], spec.columnDiameter, spec.columnHeight, "ionic"),
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
    // Facing outwards from the cella.
    const facing = Math.atan2(mid[0], -mid[2]);
    parts.push(
      person(
        mid,
        2.6,
        facing + Math.PI,
        "marble",
        IDENTITIES.hekatomnids[placed % IDENTITIES.hekatomnids.length]!,
        PAINT.hekatomnids[(placed * 3) % PAINT.hekatomnids.length]!,
      ),
    );
    placed += 1;
  }
  // The cella inside the ring.
  parts.push(box("marbleWorn", [0, podiumTop, 0], [gridW - 5, spec.columnHeight, gridD - 5]));
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
  parts.push(
    person(
      [-0.3 * horseScale, groupY + 0.55 * horseScale, chariotZ],
      1.55 * horseScale,
      Math.PI,
      "marble",
      IDENTITIES.maussollos,
      PAINT.maussollos,
    ),
  );
  parts.push(
    person(
      [0.3 * horseScale, groupY + 0.55 * horseScale, chariotZ],
      1.45 * horseScale,
      Math.PI,
      "marble",
      IDENTITIES.artemisia,
      PAINT.artemisia,
    ),
  );

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

  // The colossi, facing east across the court; left to right as seen from
  // the court, the king first and Herakles last. A viewer in the court looks
  // west, so their left is +z and the row runs down it.
  const colossi = IDENTITIES.nemrutColossi;
  const throne = spec.throneHeight;
  const seated = spec.statueHeight - throne;
  for (let i = 0; i < spec.colossi; i += 1) {
    const z = ((spec.colossi - 1) / 2 - i) * (spec.throneBase + 0.8);
    parts.push(
      worn(box("limestone", [-1.0, seatY, z], [spec.throneBase, throne, spec.throneBase]), 0.04),
    );
    // A low footstool in front of the throne.
    parts.push(
      box("limestone", [spec.throneBase / 2 - 0.2, seatY, z], [1.6, 0.6, spec.throneBase * 0.7]),
    );
    parts.push({
      kind: "figure",
      material: "limestone",
      at: [-1.5, seatY + throne, z],
      // A seated figure is measured from the seat to the crown.
      height: seated / 0.52,
      rotY: Math.PI / 2,
      pose: "seated",
      identity: colossi[i % colossi.length]!,
    });
  }
  // The guardians: an eagle then a lion beyond the last throne at each end,
  // turned the other way from the figures because an animal faces -z.
  const edge = ((spec.colossi - 1) / 2) * (spec.throneBase + 0.8) + spec.throneBase / 2;
  for (const side of [-1, 1]) {
    const eagleZ = side * (edge + 1.6);
    const lionZ = side * (edge + 4.6);
    parts.push(box("limestone", [-1.0, seatY, eagleZ], [2.6, 0.6, 2.4]));
    parts.push(
      ...eagleStatue(
        "limestone",
        [-1.0, seatY + 0.6, eagleZ],
        -Math.PI / 2,
        spec.guardianHeight / 0.8,
      ),
    );
    parts.push(box("limestone", [-1.0, seatY, lionZ], [3.2, 0.6, 3.0]));
    parts.push({
      kind: "figure",
      material: "limestone",
      at: [-1.0, seatY + 0.6, lionZ],
      height: spec.guardianHeight,
      rotY: -Math.PI / 2 + Math.PI,
      scan: { id: "lion-delos" },
    });
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
    if (part.kind === "box" || part.kind === "prism") {
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
    } else if (part.kind === "ring") {
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
        for (const r of [part.inner, part.outer]) {
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
