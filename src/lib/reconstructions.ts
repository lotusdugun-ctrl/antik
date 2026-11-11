import type { Localized } from "@/lib/i18n";
import type { HittiteGateSpec } from "@/lib/models/hattusa-aslanli-kapi";
import type { TroyCitadelSpec } from "@/lib/models/troya-vi-surlari";
import type { NeolithicTownSpec } from "@/lib/models/catalhoyuk-dogu-hoyugu";
import type { CathedralSpec } from "@/lib/models/ani-katedrali";
import type { NymphaeumSpec } from "@/lib/models/sagalassos-antoninler-cesmesi";
import type { TerraceVillaSpec } from "@/lib/models/zeugma-villa";
import type { CliffMonasterySpec } from "@/lib/models/sumela-manastiri";
import type { LighthouseSpec } from "@/lib/models/patara-deniz-feneri";
import type { RomanGateSpec } from "@/lib/models/roma-kapilari";
import type { ProstyleTempleSpec } from "@/lib/models/hadrian-tapinagi";
import type { LycianHeroonSpec } from "@/lib/models/nereid-aniti";
import type { RockTombsSpec } from "@/lib/models/kaunos-kaya-mezarlari";
import type { DomedSpec } from "@/lib/models/kubbeli";
import type { CisternSpec, TowerSpec } from "@/lib/models/galata-yerebatan";
import type {
  AqueductSpec,
  MudbrickSpec,
  RockChurchSpec,
  SeljukSpec,
  SphinxGateSpec,
  UndergroundSpec,
} from "@/lib/models/anadolu-yeni";
import type {
  SteppedPyramidSpec,
  AsianHallSpec,
  EgyptianPylonSpec,
  MegalithicPlatformSpec,
  ZigguratSpec,
  PersianApadanaSpec,
  KhmerTempleSpec,
  IndicMonumentSpec,
  EgyptianHypostyleSpec,
} from "@/lib/models/dunya-modelleri";
import { SAGALASSOS_ZEUGMA_SUMELA_PATARA } from "@/lib/models/sagalassos-zeugma-sumela-patara";
import { ON_YENI } from "@/lib/models/on-yeni-kayitlar";
import { ISTANBUL } from "@/lib/models/istanbul-kayitlar";
import { EGE_ANADOLU } from "@/lib/models/ege-anadolu-kayitlar";
import { ANADOLU_YENI } from "@/lib/models/anadolu-yeni-kayitlar";

/**
 * Measured reconstructions — the structures the app can show in three
 * dimensions instead of only in photographs.
 *
 * The rule this module exists to enforce: **a number that shapes the model has
 * to come from somewhere.** A 3D reconstruction is an argument about a building
 * that mostly no longer stands, and an unsourced argument dressed in shaded
 * geometry is worse than no reconstruction at all — it looks like evidence.
 *
 * So every dimension a visitor is shown lives in `measures`, carries the source
 * it was read from, and is asserted by the test suite to be a number the model
 * actually uses. The numbers that are *not* excavated — how the two storeys of
 * a façade divide 16 metres between them, how deep a seat row is — are not
 * quietly mixed in with them. They stay in the spec, and `uncertainty` says out
 * loud which parts of what you are looking at are inference.
 */

/** Where a measurement was read. */
export type Source = {
  key: string;
  title: Localized;
  url: string;
  /**
   * Read for what the record says in words — the date, the order, who built
   * it — rather than for a number in `measures`. Where no source that could be
   * opened gives the building's dimensions, this is the only kind it has.
   */
  context?: true;
};

/**
 * One cited number.
 *
 * `unit` is what the value counts, and the test suite treats the three
 * differently: metres and counts must appear in the model — a dimension shown
 * beside a building it did not shape is a lie by juxtaposition — while people
 * (audience capacity) is context, not geometry.
 */
export type Measure = {
  value: number;
  unit: "m" | "count" | "people";
  label: Localized;
  /** `key` of a source in the same record. */
  source: string;
};

/**
 * A two-storey Roman aedicular façade, and the hall behind it.
 * Modelled on the Library of Celsus, whose façade was re-erected in 1970-78.
 */
export type RomanFacadeSpec = {
  kind: "roman-facade";
  /** Cited. */
  facadeWidth: number;
  facadeHeight: number;
  lowerColumns: number;
  steps: number;
  doors: number;
  porchDepth: number;
  hallWidth: number;
  hallDepth: number;
  apseWidth: number;
  nicheHeight: number;
  /** Cited: what survives of the rear wall, which is where the model stops. */
  wallHeight: number;
  /** Modelled: how the 16 m of façade divides between the two orders. */
  lowerOrderHeight: number;
  upperColumns: number;
  columnDiameter: number;
  inscribed?: boolean;
};

/** A Roman theatre built as one block with its stage building. */
export type RomanTheatreSpec = {
  kind: "roman-theatre";
  /** Cited. */
  caveaDiameter: number;
  orchestraDiameter: number;
  scaenaeHeight: number;
  /** Omitted where the post holes have not been counted. */
  velariumMasts?: number;
  /** Modelled: seat geometry, and therefore the row count. See `uncertainty`. */
  seatTread: number;
  seatRise: number;
  podiumHeight: number;
  stageDepth: number;
  stairways: number;
  lowerRows: number;
  upperRows: number;
  /** A third tier between the two, as at Ephesus; one walkway more. */
  middleRows?: number;
  /** What makes this theatre itself rather than a copy of the next one. */
  character?: TheatreCharacter;
};

/**
 * The particulars of one theatre, from its photographs and the theatrum.de
 * survey: no two of the five were built alike.
 */
export type TheatreCharacter = {
  /** What the seats and walls are built of. */
  stone: "conglomerate" | "limestone" | "marble";
  /** Degrees the seating wraps past a semicircle at each end: a Greek horseshoe. */
  sweep?: number;
  /** Laid into a hillside, standing on a plain, or heaped on an artificial mound. */
  ground: "hillside" | "plain" | "mound" | "summit";
  /** On a summit: how far the mountain falls away behind the stage building, in metres. */
  drop?: number;
  /** On a peninsula (Side): how far off the sea is, on either side. */
  sea?: number;
  /** The outer face: arcades, a tall pierced wall, or none (the hill runs on). */
  facade: "arcade" | "wall" | "none";
  /** Whose stage front this is. */
  screen: "aspendos" | "hierapolis" | "ephesus" | "side" | "miletus" | "plain";
  storeys: 1 | 2 | 3;
  bays?: number;
  /** Height of the stage platform, where it is known. */
  stageHeight?: number;
  /** A colonnaded gallery round the top of the seating. */
  /** A gallery round the top of the seating: columns, or (Aspendos) arches on piers. */
  topGallery: boolean | "arcade";
  box?: "tribunalia" | "exedra" | "canopy";
  /** A parapet round the orchestra, for the beast fights of later centuries. */
  arenaWall?: boolean;
  /** What lay beyond the stage building. */
  annex?: "agora" | "harbour-street" | "harbour";
};

/**
 * A dipteral Ionic temple: two rings of columns around what they enclose.
 *
 * The two temples modelled with it enclose different things, which is what
 * `interior` selects — Didyma's colonnade rings an open court that never took
 * a roof, the Artemision's rings a roofed cella.
 */
export type IonicDipterosSpec = {
  kind: "ionic-dipteros";
  /** Cited. */
  stylobateWidth: number;
  stylobateLength: number;
  crepidomaWidth: number;
  crepidomaLength: number;
  crepidomaSteps: number;
  columnHeight: number;
  outerColumnsShort: number;
  outerColumnsLong: number;
  pronaosRows: number;
  pronaosPerRow: number;
  /** How many columns the finished design stands up, all told. */
  totalColumns: number;
  /** Of those, how many carried carving at the base. Omitted where none did. */
  reliefColumns?: number;
  sekosWallHeight: number;
  naiskosWidth: number;
  naiskosLength: number;
  /** Modelled. */
  interior: "open-court" | "cella";
  /**
   * Who stands in the cella. Each temple housed its own god: the old goddess
   * at Ephesus, Zeus at Aizanoi — not one statue for all of them.
   */
  cultStatue?: "apollo" | "artemis" | "zeus" | "athena";
  /**
   * The order of the capitals: Ionic, or Corinthian for the Roman temples
   * (their acanthus bell drawn as the composite's, which carries it).
   */
  order?: "ionic" | "corinthian" | "doric";
  /** What it is built of, where it is not marble: the dark andesite of Assos. */
  stone?: "andesite";
  /** On a summit: how far the land falls away round it, from how far out, over what run. */
  hill?: { drop: number; edge: number; run?: number };
  /** Which text runs along the front architrave (a key of `TEXTS`), where not the god's formula; `"none"` for none. */
  dedication?: string;
  /**
   * Built on a high Roman podium reached by a stair on the front, instead of
   * a stepped crepis all round: the height of the podium, in metres.
   */
  podium?: number;
  /** Left unfinished, as at Sardis: the shafts behind the east porch never got their flutes. */
  unfinished?: boolean;
  /**
   * The head of a colossal statue found in the cella (Sardis: Faustina the
   * Elder's, 1.76 m): the statue is drawn eight heads tall from it.
   */
  colossusHead?: number;
  /**
   * Rings of columns round the building: two for a true dipteros, one for a
   * pseudodipteros, which keeps the second ring's spacing and leaves its
   * place empty. Two unless said otherwise.
   */
  rings?: 1 | 2;
  courtWidth: number;
  courtLength: number;
  columnDiameter: number;
  entablatureHeight: number;
};

/**
 * A Hellenistic altar on a stepped podium, wrapped in a sculpted frieze and
 * crowned by a colonnade, with a stair cut into one front. The Great Altar of
 * Pergamon is the one everybody means.
 */
export type GreatAltarSpec = {
  kind: "great-altar";
  /** Cited. */
  baseWidth: number;
  baseDepth: number;
  steps: number;
  friezeHeight: number;
  friezeLength: number;
  stairWidth: number;
  totalHeight: number;
  courtSide: number;
  /** Modelled. */
  columnDiameter: number;
  columnSpacing: number;
};

/**
 * A Roman town house built round a colonnaded court, its floors in mosaic and
 * its walls in fresco. The terrace houses at Ephesus are the ones that kept
 * both, under a modern roof.
 */
export type PeristyleHouseSpec = {
  kind: "peristyle-house";
  /** Cited. */
  residences: number;
  storeys: number;
  /** Modelled. */
  courtWidth: number;
  courtDepth: number;
  courtColumns: number;
  wallHeight: number;
  roomDepth: number;
  columnDiameter: number;
  poolWidth: number;
};

/** A Roman stadium: two straight banks of seats closed by a curved end. */
export type StadiumSpec = {
  kind: "stadium";
  /** Cited. */
  overallLength: number;
  overallWidth: number;
  rows: number;
  /** Modelled. */
  arenaWidth: number;
  seatRise: number;
  entrances: number;
  /** One end left open, as at Perge, instead of both closed. */
  openEnd?: boolean;
  /**
   * How far the long sides bow outwards at the middle, in metres. The long
   * sides at Aphrodisias are not straight but slightly curved, so that the
   * spectators along them could see the whole track.
   */
  bow?: number;
  /**
   * Vaulted chambers carrying the seats along each long side, opening to the
   * outside as shops — Perge's thirty a side, their shopkeepers named in
   * inscriptions on the arches.
   */
  vaults?: number;
  /** The late-antique wall that closed the east end off as an arena. */
  arenaEnd?: boolean;
  /** Built into the city's fortification wall along one long side. */
  cityWall?: boolean;
  /**
   * Seats with names cut in their fronts — the places reserved for guilds,
   * families and city tribes, as hundreds of the Aphrodisias seats are.
   */
  inscribedSeats?: boolean;
  /** Set at the foot of a hill that rises behind one long side. */
  hillside?: boolean;
};

/**
 * A Roman amphitheatre: an oval arena ringed by tiers of seating, the whole
 * wrapped in an outer arcade. The three modelled here are the ones that still
 * shape their cities - Pompeii's, Nimes' and Trier's.
 */
export type AmphitheatreSpec = {
  kind: "roman-amphitheatre";
  /** Cited: the overall oval, outside the outer wall. */
  outerLength: number;
  outerWidth: number;
  /** Cited: the arena at the bottom. */
  arenaLength: number;
  arenaWidth: number;
  /** Cited: how high the outer wall stands above the ground. */
  wallHeight: number;
  /** Modelled: the seating, and therefore how many rows fit. */
  rows: number;
  tiers: number;
  seatRise: number;
  seatTread: number;
  podiumHeight: number;
  /** Arched bays in the outer wall, per tier. */
  bays: number;
  /** What the seats and walls are built of. */
  stone: "limestone" | "marble" | "conglomerate";
  /** How much of the outer arcade survives: Nimes whole, Pompeii low. */
  outerWall: "arcade" | "low" | "none";
};

/**
 * One building on a city plan: the monument's own spec, the point on the
 * ground where it stands, and which way it faces (degrees clockwise).
 */
export type CityPlacement = {
  spec: ModelSpec;
  /** Plan position, metres: x east, z south. */
  at: [number, number];
  /** Degrees clockwise about the vertical. Omitted for no turn. */
  rotate?: number;
};

/**
 * A city: its monuments placed on one plan, under one sky.
 *
 * The alternative - one new builder per city - would have meant four more
 * copies of the theatre, temple and house already modelled here. A city is
 * therefore a composition: each monument is built by its own builder and then
 * set down on the plan, so Pompeii's theatre is the same measured theatre the
 * rest of the app uses, only standing in Pompeii.
 */
export type CitySpec = {
  kind: "city";
  /** Radius of the ground the city stands on, in metres. */
  radius: number;
  places: CityPlacement[];
  /** The fortification circuit, where the city still had one. */
  walls?: {
    /** West-east and north-south sides, metres. */
    length: number;
    width: number;
    height: number;
    thickness: number;
    towers: number;
    gates: number;
    /** The gap left for each gate, metres. */
    gateWidth: number;
  };
  /** Paved streets: from x,z to x,z, and how wide. */
  streets?: [number, number, number, number, number][];
  /** A mountain the city sits under, as at Pompeii. */
  hill?: { angle: number; distance: number; height: number; radius: number };
  /** Where a visitor stands on the plan (`at`, metres) and what they look at. */
  viewpoint?: { at: [number, number]; look: [number, number, number] };
};

/** A Pre-Pottery Neolithic enclosure: a ring of T-shaped pillars in a wall. */
export type NeolithicEnclosureSpec = {
  kind: "neolithic-enclosure";
  /** Cited. */
  enclosureDiameter: number;
  centralPillarHeight: number;
  ringPillarHeight: number;
  ringPillars: number;
  pedestalSocket: number;
  /** Modelled. */
  wallThickness: number;
  benchHeight: number;
  pillarWidth: number;
  pillarThickness: number;
  /** Pillars left mostly bare, a snake on some (Karahan Tepe), not Göbeklitepe's beasts. */
  plain?: boolean;
};

/**
 * A tomb on a tall podium, ringed by columns and roofed by a stepped pyramid
 * with a chariot on the summit — the Mausoleum at Halicarnassus, which gave
 * every later mausoleum its name.
 */
export type MausoleumSpec = {
  kind: "mausoleum";
  /** Cited. */
  baseWidth: number;
  baseDepth: number;
  podiumHeight: number;
  columns: number;
  columnsShort: number;
  columnsLong: number;
  pyramidSteps: number;
  pyramidHeight: number;
  quadrigaHeight: number;
  totalHeight: number;
  lions: number;
  /** Modelled. */
  columnHeight: number;
  columnDiameter: number;
  entablatureHeight: number;
  statues: number;
};

/**
 * A hilltop tumulus with a terrace of colossal enthroned figures at its foot:
 * the tomb-sanctuary of Antiochus I on Nemrut Dağı.
 */
export type TumulusSanctuarySpec = {
  kind: "tumulus-sanctuary";
  /** Cited. */
  tumulusHeight: number;
  tumulusDiameter: number;
  courtWidth: number;
  courtDepth: number;
  statueHeight: number;
  throneBase: number;
  colossi: number;
  /** Modelled. */
  throneHeight: number;
  guardianHeight: number;
  altarSteps: number;
};

export type ModelSpec =
  | RomanFacadeSpec
  | RomanTheatreSpec
  | IonicDipterosSpec
  | NeolithicEnclosureSpec
  | GreatAltarSpec
  | StadiumSpec
  | AmphitheatreSpec
  | CitySpec
  | PeristyleHouseSpec
  | MausoleumSpec
  | TumulusSanctuarySpec
  | HittiteGateSpec
  | TroyCitadelSpec
  | NeolithicTownSpec
  | CathedralSpec
  | NymphaeumSpec
  | TerraceVillaSpec
  | CliffMonasterySpec
  | LighthouseSpec
  | RomanGateSpec
  | ProstyleTempleSpec
  | LycianHeroonSpec
  | RockTombsSpec
  | DomedSpec
  | TowerSpec
  | CisternSpec
  | AqueductSpec
  | UndergroundSpec
  | RockChurchSpec
  | SeljukSpec
  | MudbrickSpec
  | SphinxGateSpec
  | SteppedPyramidSpec
  | AsianHallSpec
  | EgyptianPylonSpec
  | MegalithicPlatformSpec
  | ZigguratSpec
  | PersianApadanaSpec
  | KhmerTempleSpec
  | IndicMonumentSpec
  | EgyptianHypostyleSpec;

/**
 * A named part of the building, pinned to the point in the model where it is.
 *
 * This is what turns a shape into a lesson: a visitor who has never met the
 * word "diazoma" can see the walkway it names, on the theatre, from where they
 * are standing. The label floats at `at`, in the same metres as the geometry.
 */
export type Hotspot = {
  label: Localized;
  at: [number, number, number];
  /** One line on what it was for, shown when the label is chosen. */
  note: Localized;
};

export type Reconstruction = {
  id: string;
  /** A slug in `sites.ts`. */
  siteSlug: string;
  /** Must be one of the structures that site's detail record lists. */
  structure: Localized;
  title: Localized;
  blurb: Localized;
  /** When the thing being modelled stood, not when it was excavated. */
  period: Localized;
  measures: Measure[];
  /** What the model infers rather than knows. Shown, not buried. */
  uncertainty: Localized;
  /** The parts worth naming, pinned where they are on the model. */
  hotspots: Hotspot[];
  sources: Source[];
  model: ModelSpec;
};

const spot = (
  at: [number, number, number],
  labelTr: string,
  labelEn: string,
  noteTr: string,
  noteEn: string,
): Hotspot => ({ at, label: l(labelTr, labelEn), note: l(noteTr, noteEn) });

const l = (tr: string, en: string): Localized => ({ tr, en });

const wiki = (
  key: "tr" | "en" | "de",
  host: string,
  slug: string,
  tr: string,
  en: string,
): Source => ({
  key,
  title: l(tr, en),
  url: `https://${host}.wikipedia.org/wiki/${slug}`,
});

export const reconstructions: Reconstruction[] = [
  {
    id: "celsus-kutuphanesi",
    siteSlug: "efes",
    structure: l("Celsus Kütüphanesi", "Library of Celsus"),
    title: l("Celsus Kütüphanesi", "The Library of Celsus"),
    blurb: l(
      "Efes'in mermer cephesi bir kütüphanenin değil, bir mezar anıtının önyüzüdür: Celsus'un lahdi hâlâ apsisin altındaki odada duruyor. Model, 1970-78'de yeniden dikilen cepheyi tam yüksekliğiyle, arkasındaki salonu ise duvarların ayakta kaldığı yüksekliğe kadar gösterir.",
      "The marble front at Ephesus is not the face of a library but of a tomb: Celsus' sarcophagus still lies in the chamber beneath the apse. The model shows the façade re-erected in 1970-78 at its full height, and the hall behind it only as high as its walls survive.",
    ),
    period: l("MS 110'lar - 135", "AD 110s - 135"),
    measures: [
      { value: 21, unit: "m", label: l("Cephe genişliği", "Façade width"), source: "de" },
      {
        value: 16,
        unit: "m",
        label: l("Cephe yüksekliği (en az)", "Façade height (at least)"),
        source: "de",
      },
      {
        value: 8,
        unit: "count",
        label: l("Alt kattaki kompozit sütun (dört çift)", "Composite columns below (four pairs)"),
        source: "en",
      },
      {
        value: 3,
        unit: "count",
        label: l("Cephedeki kapı", "Doorways in the façade"),
        source: "en",
      },
      {
        value: 9,
        unit: "count",
        label: l("Cepheyi boydan boya kaplayan basamak", "Steps the full width of the building"),
        source: "en",
      },
      {
        value: 2.5,
        unit: "m",
        label: l("Cephe ile salon arasındaki sundurma", "Depth of the porch behind the façade"),
        source: "de",
      },
      { value: 16.7, unit: "m", label: l("Salon uzunluğu", "Length of the hall"), source: "de" },
      { value: 10.9, unit: "m", label: l("Salon derinliği", "Depth of the hall"), source: "de" },
      { value: 4.5, unit: "m", label: l("Apsis genişliği", "Width of the apse"), source: "de" },
      {
        value: 2.6,
        unit: "m",
        label: l(
          "Rulo raflarının oturduğu niş yüksekliği",
          "Height of the niches that held the shelves",
        ),
        source: "de",
      },
      {
        value: 7,
        unit: "m",
        label: l("Arka duvarın korunmuş yüksekliği", "Surviving height of the rear wall"),
        source: "de",
      },
    ],
    uncertainty: l(
      "Cephenin genişliği ve yüksekliği ölçülmüştür. Aralıkların düzeni — dört sütun çifti, aralarındaki üç kapı, üst kattaki üç pencere ve onların üzerindeki üçgen/yay alınlıklar — 1970-78'de yeniden dikilmiş cephenin fotoğraflarından çıkarılmıştır; iki katın 16 metreyi nasıl paylaştığı, sütun çapları ve heykellerin duruşu ise orantıdır, ölçü değil. Nişlerdeki dört erdem ve üst kattaki iki erkek figür kumaş kıvrımlarına kadar modellenmiştir ama Viyana'daki özgün heykellerin kopyası değildir; duruşları ve giysileri yorumdur. Merdivenin iki yanındaki kaidelerin bronz heykelleri kayıptır; yerlerinde iki gerçek Roma heykelinin taramaları durur: mantolu, sakallı bir Asklepios ve togalı, başı örtülü Tiberius. Başlıkların akant yaprakları ve volütleri modellenmiştir ama taştaki işçiliğin kopyası değildir; arşitravlardaki ve kaidelerdeki yazıtlar gerçek Yunanca ve Latince metinleriyle gösterilmiştir, ama satır bölünmeleri ve harf boyları modelindir ve Ennoia kaidesi öteki üçünün örneğine göre yazılmıştır; frizlerin bezemesi modelde yoktur. **Renkler de ölçü değil, yorumdur:** Roma mermer cepheleri boyalıydı ve bugün Efes'te boya izi kalmamıştır — modeldeki kırmızı panolar, mavi-altın silmeler, ahşap kapılar ve altın kafes pencereler yayımlanmış bir rekonstrüksiyon resminden alınmıştır, kazıdan değil; kapıların bronz kaplaması, kapı çerçeveleri, sütun çiftlerinin altındaki kasetli tavanlar ve üst kat pencerelerinin altındaki damarlı mermer panolar ise modelin yorumudur. Salonda duvar boyunca uzanan podyumun üstündeki sütunlara oturan galeri de yorumdur: üst sıra nişlere ancak böyle bir galeriden ulaşılabilirdi, ama yüksekliği, derinliği, korkuluğu ve galeriye çıkan merdivenler bilinmez. Salonun tavanı da yoktur: yapının iki katlı mı üç katlı mı olduğu tartışmalıdır. Kütüphanenin önündeki meydanın döşemesi ve meydanın kuzey yanındaki Mazaeus ve Mithridates Kapısı (MÖ 4/3) da gösterilir: üç kemerli açıklık, ortadakinin 1,5 m geride oluşu, kütüphane yanındaki tonozun siyah mermer kaplaması ve kemerlerin üstündeki üç yazıt (solda Augustus ile Livia'ya, sağda Agrippa ile Iulia'ya Latince, ortada Yunanca) kaynaklara dayanır; yazıtların yaldızlı bronz harfleri kayıptır, yalnız yuvaları kalmıştır. Kapının ölçüleri, pilastrları ve attikası yayımlanmış bir rölöveden değil, orantıdan gelir; frizdeki bitki bezemesi modelde yoktur.",
      "The façade's width and height are measured. The rhythm of the front — four pairs of columns, three doorways between them, three windows above and the triangular and segmental pediments over those — is read off photographs of the front re-erected in 1970-78; how the two orders divide the 16 metres, the column diameters and the poses of the statues are proportion rather than measurement. The four virtues in the niches and the two male figures above are modelled down to the folds of their dress, but they are not copies of the originals in Vienna; their poses and clothing are interpretation. The bronze statues on the two bases by the stair are lost; in their place stand scans of two real Roman statues: a bearded Asklepios in his mantle and the veiled Tiberius in his toga. The acanthus and volutes of the capitals are modelled but are not a copy of the carving on the stone, the inscriptions on the architraves and bases carry their real Greek and Latin texts, though their line breaks and letter sizes are the model's and the Ennoia base is lettered on the pattern of the other three, and the ornament of the friezes is absent. **The colour is interpretation, not measurement:** Roman marble fronts were painted, and no pigment survives at Ephesus — the red panels, the blue and gilded mouldings, the timber doors and the gilded window lattices are taken from a published reconstruction painting, not from the excavation; the doors' bronze sheathing, the door frames, the coffered soffits between the column pairs and the veined marble panels under the upper windows are the model's own reading. So is the gallery in the hall, carried on columns standing on the podium that runs round the walls: the upper niches could only have been reached from such a gallery, but its height, depth and railing, and the stairs up to it, are not known. So is the hall's ceiling absent: whether the building had two storeys or three is disputed. The paved square in front of the library and the Gate of Mazaeus and Mithridates on its north side (4/3 BC) are shown too: the three arched openings, the middle one set back 1.5 m, the black marble lining of the vault on the library side and the three dedications over the arches (Latin to Augustus and Livia on the left, Latin to Agrippa and Julia on the right, Greek in the middle) follow the sources; the gilded bronze letters are lost and only their sockets survive. The gate's dimensions, pilasters and attic come from proportion, not from a published survey, and the floral ornament of its frieze is absent.",
    ),
    hotspots: [
      spot(
        [-8.8, 4.2, -1],
        "Sophia heykeli",
        "The statue of Sophia",
        "Bilgelik: cephedeki dört erdemden biri. Özgün heykel bugün Viyana'da.",
        "Wisdom, one of the four virtues on the front. The original is now in Vienna.",
      ),
      spot(
        [0, 3.4, -1.2],
        "Orta kapı",
        "The central doorway",
        "Üç kapının en genişi; ardındaki sundurmadan okuma salonuna geçilirdi.",
        "The widest of the three doors; through the porch behind it lay the reading room.",
      ),
      spot(
        [0, 13.4, -1.2],
        "Üst kat penceresi",
        "Upper-storey window",
        "Salonu aydınlatan ışık buradan girerdi; raflar duvar nişlerindeydi.",
        "The light that lit the hall came in here; the shelves stood in niches along the walls.",
      ),
      spot(
        [6, 18.2, -1.4],
        "Yay alınlık",
        "Segmental pediment",
        "Üstteki üç alınlık dönüşümlüdür: ortada üçgen, yanlarda yay.",
        "The three pediments alternate: triangular in the middle, segmental either side.",
      ),
      spot(
        [0, 0.9, -3.4],
        "Dokuz basamak",
        "The nine steps",
        "Yapıyı boydan boya kaplayan basamaklar avludan cepheye çıkar.",
        "Steps the full width of the building climb from the courtyard to the front.",
      ),
      spot(
        [0, 4.5, 12.5],
        "Apsis",
        "The apse",
        "Salonun dibindeki yarım yuvarlak niş. Altındaki odada Celsus'un lahdi durur.",
        "The semicircular niche at the back of the hall; Celsus' sarcophagus lies beneath it.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Library_of_Celsus",
        "Wikipedia (İngilizce): Library of Celsus",
        "Wikipedia: Library of Celsus",
      ),
      wiki(
        "de",
        "de",
        "Celsus-Bibliothek",
        "Wikipedia (Almanca): Celsus-Bibliothek",
        "Wikipedia (German): Celsus-Bibliothek",
      ),
    ],
    model: {
      kind: "roman-facade",
      facadeWidth: 21,
      facadeHeight: 16,
      lowerColumns: 8,
      steps: 9,
      doors: 3,
      porchDepth: 2.5,
      hallWidth: 16.7,
      hallDepth: 10.9,
      apseWidth: 4.5,
      nicheHeight: 2.6,
      wallHeight: 7,
      lowerOrderHeight: 9.2,
      upperColumns: 8,
      columnDiameter: 0.62,
    },
  },
  {
    id: "aspendos-tiyatrosu",
    siteSlug: "aspendos",
    structure: l("Roma Tiyatrosu", "Roman Theatre"),
    title: l("Aspendos Tiyatrosu", "The Theatre of Aspendos"),
    blurb: l(
      "Antik dünyanın ayakta kalan en bütün tiyatrosu. Oturma bölümü ile sahne binası tek bir blok hâlinde birleşir; Selçuklular kervansaray olarak kullanmayı sürdürdüğü için yıkılmadan bugüne geldi.",
      "The most completely preserved theatre of antiquity. Its seating bank and stage building are bonded into a single block, and it came down to us intact because the Seljuqs kept it in use as a caravanserai.",
    ),
    period: l("MS 155", "AD 155"),
    measures: [
      {
        value: 96,
        unit: "m",
        label: l("Oturma bölümünün (cavea) çapı", "Diameter of the seating bank"),
        source: "en",
      },
      {
        value: 23.9,
        unit: "m",
        label: l("Orkestra çapı", "Diameter of the orchestra"),
        source: "en",
      },
      {
        value: 15.7,
        unit: "m",
        label: l(
          "Sahne duvarındaki sütun düzeninin yüksekliği",
          "Height of the stage backdrop's column screen",
        ),
        source: "en",
      },
      {
        value: 58,
        unit: "count",
        label: l("Üst galeride tente direği yuvası", "Post holes for the velarium masts"),
        source: "en",
      },
      {
        value: 7000,
        unit: "people",
        label: l("Oturma kapasitesi", "Seated capacity"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Modeldeki sıra sayısı ölçülmüş değil, türetilmiştir: 96 metrelik dış çap ile 23,9 metrelik orkestra arasındaki yamaç, 0,75 m basamak derinliği ve üstteki tonozlu galeri payıyla 40 sıraya bölünmüştür. Sahne duvarının düzeni — iki kat sütunlu niş, beş kapı, kirişlerin bıraktığı kare yuva sıraları — yapının fotoğraflarından çıkarılmıştır. Cephenin heykelleri, ahşap çatısı ve tentesi modelde yoktur; sahnenin üzerindeki eğimli ahşap ses yansıtıcı zaten antik çağda kaybolmuştu.",
      "The row count in the model is derived, not measured: the slope between the 96 m outer diameter and the 23.9 m orchestra is divided into 40 rows at a tread of 0.75 m, allowing for the vaulted gallery on top. The arrangement of the stage wall — two storeys of aediculae, five doorways, the rows of square sockets left by its beams — is read off photographs of the building. The statuary of that front, its wooden roof and the awning are not modelled; the sloping wooden sounding-board over the stage was already lost in antiquity.",
    ),
    hotspots: [
      spot(
        [0, 0.8, 7],
        "Orkestra",
        "The orchestra",
        "Koronun ve müzisyenlerin yeri; çapı 23,9 metre.",
        "Where the chorus and the musicians stood: 23.9 metres across.",
      ),
      spot(
        [0, 12, -7.8],
        "Sahne duvarı",
        "The scaenae frons",
        "İki kat sütunlu niş ve beş kapı. Oyunun dekoru bu duvardı.",
        "Two storeys of aediculae and five doorways: this wall was the scenery.",
      ),
      spot(
        [0, 9.5, 30],
        "Diazoma",
        "The diazoma",
        "Oturma bölümünü ikiye ayıran yatay geçit; seyirci sıralarına buradan dağılırdı.",
        "The walkway splitting the seating in two; the crowd spread to their rows from here.",
      ),
      spot(
        [26, 6, 26],
        "Cavea",
        "The cavea",
        "Kırk sıra oturma basamağı, on merdivenle dilimlere ayrılmış.",
        "Forty rows of seats, cut into wedges by ten stairways.",
      ),
      spot(
        [0, 19, 46],
        "Üst galeri",
        "The upper gallery",
        "Kemerli arkadın üstündeki tonozlu galeri; en üst sıraya gölge ve giriş verir.",
        "The vaulted gallery over the arcade, giving the top row its shade and its entrance.",
      ),
      spot(
        [-22, 21, 45],
        "Tente direkleri",
        "The velarium masts",
        "Elli sekiz direk yuvası: seyirciyi güneşten koruyan tenteyi bunlar taşırdı.",
        "Fifty-eight post holes: these carried the awning that kept the sun off the audience.",
      ),
    ],
    sources: [
      wiki("en", "en", "Aspendos", "Wikipedia (İngilizce): Aspendos", "Wikipedia: Aspendos"),
    ],
    model: {
      kind: "roman-theatre",
      caveaDiameter: 96,
      orchestraDiameter: 23.9,
      scaenaeHeight: 15.7,
      velariumMasts: 58,
      seatTread: 0.75,
      seatRise: 0.38,
      podiumHeight: 1.1,
      stageDepth: 7,
      stairways: 10,
      lowerRows: 21,
      upperRows: 19,
      character: {
        stone: "conglomerate",
        ground: "plain",
        facade: "wall",
        screen: "aspendos",
        storeys: 2,
        topGallery: "arcade",
        box: "tribunalia",
      },
    },
  },
  {
    id: "didyma-apollon-tapinagi",
    siteSlug: "didyma",
    structure: l("Apollon Tapınağı", "Temple of Apollo"),
    title: l("Didyma Apollon Tapınağı", "The Temple of Apollo at Didyma"),
    blurb: l(
      "Antik dünyanın en büyük tapınaklarından biri: yaklaşık 500 yıl inşa edildi ve hiçbir zaman bitirilemedi. Çatısı hiç olmadı — sütun ormanının ardındaki avlu açıktı, kehanet pınarı ile defne ağacı oradaydı.",
      "One of the largest temples ever attempted: some 500 years in the building, and never finished. It never had a roof — behind the forest of columns lay an open court holding the oracle spring and the laurel tree.",
    ),
    period: l("MÖ 300 - MS 2. yüzyıl", "300 BC - 2nd century AD"),
    measures: [
      {
        value: 51,
        unit: "m",
        label: l("Stylobat genişliği", "Width of the stylobate"),
        source: "en",
      },
      {
        value: 109,
        unit: "m",
        label: l("Stylobat uzunluğu", "Length of the stylobate"),
        source: "en",
      },
      {
        value: 60,
        unit: "m",
        label: l("Basamaklı temel genişliği", "Width across the stepped platform"),
        source: "en",
      },
      {
        value: 120,
        unit: "m",
        label: l("Basamaklı temel uzunluğu", "Length across the stepped platform"),
        source: "en",
      },
      {
        value: 7,
        unit: "count",
        label: l("Çevredeki basamak sırası", "Steps in the crepidoma"),
        source: "en",
      },
      {
        value: 19.7,
        unit: "m",
        label: l("Sütun yüksekliği", "Height of each column"),
        source: "en",
      },
      {
        value: 10,
        unit: "count",
        label: l("Kısa kenardaki sütun", "Columns along the short side"),
        source: "en",
      },
      {
        value: 21,
        unit: "count",
        label: l("Uzun kenardaki sütun", "Columns along the long side"),
        source: "en",
      },
      {
        value: 25,
        unit: "m",
        label: l("Avluyu çeviren duvarın yüksekliği", "Height of the walls around the court"),
        source: "en",
      },
      {
        value: 8.24,
        unit: "m",
        label: l("Avludaki naiskosun genişliği", "Width of the naiskos in the court"),
        source: "en",
      },
      {
        value: 14.23,
        unit: "m",
        label: l("Naiskosun uzunluğu", "Length of the naiskos"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Model tapınağın tasarımını gösterir, inşa edilmiş hâlini değil: sütunların tamamı antik çağın sonunda bile dikilmemişti. Sütun çapları, başlıklar ve saçaklık yüksekliği ölçülerden değil İon düzeninin oranlarından modellenmiştir; kabartmalı sütun kaideleri de basitleştirilmiştir.",
      "The model shows the temple as designed, not as built: not all of the columns had been raised even by the end of antiquity. Column diameters, capitals and the height of the entablature are modelled from the proportions of the Ionic order rather than measured, and the carved column bases are simplified.",
    ),
    hotspots: [
      spot(
        [0, 6, 16],
        "Adyton",
        "The adyton",
        "Çatısız iç avlu: kehanet pınarı ve kutsal defne ağacı buradaydı.",
        "The unroofed inner court: the oracle spring and the sacred laurel stood here.",
      ),
      spot(
        [0, 11, 21.9],
        "Naiskos",
        "The naiskos",
        "Avlunun içindeki küçük tapınak; Apollon'un tunç kült heykelini barındırırdı.",
        "The small temple inside the court, which housed the bronze cult image of Apollo.",
      ),
      spot(
        [27, 13, -20],
        "Sütun ormanı",
        "The forest of columns",
        "Çift sıra İon sütunu; her biri 19,7 metre, Yunan dünyasının en yükseği.",
        "A double file of Ionic columns, each 19.7 m: the tallest in the Greek world.",
      ),
      spot(
        [0, 25, -55],
        "Medusa frizi",
        "The Medusa frieze",
        "Saçaklığı dolaşan başlardan biri; devrilmiş bir tanesi bugün kalıntıların arasında durur.",
        "One of the heads that ran round the entablature; a fallen block still lies among the ruins.",
      ),
      spot(
        [0, 1.4, -58],
        "Krepidoma",
        "The crepidoma",
        "Yedi basamaklı temel: 60 × 120 metrelik bir taş platform.",
        "Seven steps of platform: 60 by 120 metres of stone.",
      ),
    ],
    sources: [wiki("en", "en", "Didyma", "Wikipedia (İngilizce): Didyma", "Wikipedia: Didyma")],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 51,
      stylobateLength: 109,
      crepidomaWidth: 60,
      crepidomaLength: 120,
      crepidomaSteps: 7,
      columnHeight: 19.7,
      outerColumnsShort: 10,
      outerColumnsLong: 21,
      pronaosRows: 3,
      pronaosPerRow: 4,
      totalColumns: 120,
      sekosWallHeight: 25,
      naiskosWidth: 8.24,
      naiskosLength: 14.23,
      interior: "open-court",
      courtWidth: 21.7,
      courtLength: 53.6,
      columnDiameter: 1.94,
      entablatureHeight: 3.6,
    },
  },
  {
    id: "gobeklitepe-d-yapisi",
    siteSlug: "gobeklitepe",
    structure: l("A–D yapıları", "Enclosures A–D"),
    title: l("Göbeklitepe, D Yapısı", "Göbeklitepe, Enclosure D"),
    blurb: l(
      "Dünyanın bilinen en eski anıtsal yapılarından biri ve tarihi en erkene giden çember. Ortadaki iki dikilitaşın kolları, elleri ve kemeri vardır: taşlar insan biçimindedir ve birbirlerine bakarlar.",
      "One of the oldest monumental structures known, and the earliest dated of the circles. The two pillars at its centre have arms, hands and a belt: the stones are human in form, and they face one another.",
    ),
    period: l("MÖ 10. binyılın ikinci yarısı", "Second half of the 10th millennium BC"),
    measures: [
      { value: 30, unit: "m", label: l("Yapının çapı", "Diameter of the enclosure"), source: "tr" },
      {
        value: 5.5,
        unit: "m",
        label: l("Merkezdeki iki dikilitaşın yüksekliği", "Height of the two central pillars"),
        source: "tr",
      },
      {
        value: 3.5,
        unit: "m",
        label: l(
          "Çevredeki dikilitaşların ortalama yüksekliği",
          "Average height of the surrounding pillars",
        ),
        source: "tr",
      },
      {
        value: 12,
        unit: "count",
        label: l(
          "Daire üzerindeki dikilitaş (10-12 arasında)",
          "Pillars set around the circle (10-12)",
        ),
        source: "tr",
      },
      {
        value: 0.15,
        unit: "m",
        label: l(
          "Merkez dikilitaşların kaide oyuğu",
          "Depth of the sockets holding the central pillars",
        ),
        source: "tr",
      },
    ],
    uncertainty: l(
      "Yapının çapı için yayınlarda 20 ile 30 metre arasında değerler geçer; model 30 metreyi esas alır. Dikilitaşların yüzündeki hayvan kabartmaları çizilmemiştir: kazıda çıkan kabartmaların fotoğrafları yükseklik haritası olarak kullanılıp taşa oyulmuştur, yani derinlik gerçektir ve gölgesini kendi düşürür. Gerçek olmayan, hangi hayvanın hangi taşın neresinde durduğudur — fotoğraflar C Yapısı'nın taşlarından gelir, model ise D Yapısı'nı gösterir. Merkezdeki iki taşın kolları, elleri, kemeri ve peştamalı D Yapısı için belgelenmiştir ve alçak kabartma olarak modellenmiştir. Çemberin üstünün örtülü olup olmadığı bilinmiyor; model açık bırakır.",
      "Published diameters for the enclosure range from 20 to 30 metres; the model takes 30. The animals on the pillars are not drawn: photographs of the excavated reliefs are used as height maps and cut into the stone, so the depth is real and throws its own shadow. What is not real is which animal stood where on which pillar — the photographs come from the pillars of Enclosure C, while the model shows Enclosure D. The arms, hands, belt and loincloth of the two central stones are documented for D, and are modelled as the low relief they are. Whether the circle was roofed is unknown, and the model leaves it open.",
    ),
    hotspots: [
      spot(
        [0, 6.2, 0],
        "Merkez dikilitaşlar",
        "The central pillars",
        "5,5 metrelik iki T taşı birbirine bakar: kolları, elleri ve kemeriyle insan biçimindedirler.",
        "Two T-shaped stones 5.5 m tall face one another: human in form, with arms, hands and a belt.",
      ),
      spot(
        [13, 4.2, 4],
        "Çevre dikilitaşları",
        "The ring of pillars",
        "On iki dikilitaş daire üzerinde dizili; hepsi merkeze döner.",
        "Twelve pillars set around the circle, every one turned towards the centre.",
      ),
      spot(
        [0, 1.8, 14],
        "Kuru duvar",
        "The dry-stone wall",
        "Dikilitaşların arası işlenmemiş taşla örülmüştür; taşlar duvarın içinde durur.",
        "The gaps between the pillars are filled with unworked stone: they stand inside the wall.",
      ),
      spot(
        [-9, 0.7, -9],
        "Terrazzo zemin",
        "The terrazzo floor",
        "Yakılmış kireçten dökme zemin — bilinen en eski örneklerinden biri.",
        "A floor poured from burnt lime, among the earliest known anywhere.",
      ),
      spot(
        [9, 1, 9],
        "Seki",
        "The bench",
        "Duvarın iç yüzü boyunca dolaşan oturma sekisi.",
        "The bench for sitting that runs round the inside of the wall.",
      ),
    ],
    sources: [
      wiki(
        "tr",
        "tr",
        "Göbeklitepe",
        "Wikipedia (Türkçe): Göbeklitepe",
        "Wikipedia (Turkish): Göbeklitepe",
      ),
    ],
    model: {
      kind: "neolithic-enclosure",
      enclosureDiameter: 30,
      centralPillarHeight: 5.5,
      ringPillarHeight: 3.5,
      ringPillars: 12,
      pedestalSocket: 0.15,
      wallThickness: 1.2,
      benchHeight: 0.5,
      pillarWidth: 1.2,
      pillarThickness: 0.42,
    },
  },
  {
    id: "artemis-tapinagi",
    siteSlug: "efes",
    structure: l("Artemis Tapınağı", "Temple of Artemis"),
    title: l("Efes Artemis Tapınağı", "The Temple of Artemis at Ephesus"),
    blurb: l(
      "Dünyanın Yedi Harikası'ndan biri; bugün yerinde, parçalarından yeniden dikilmiş tek bir sütunu duruyor: bataklık bir arazide, 137 metre uzunluğunda bir mermer orman. Plinius'a göre 36 sütunun kaidesi kabartmalıydı. Model, MÖ 4. yüzyılda yeniden inşa edilen üçüncü tapınağı gösterir.",
      "One of the Seven Wonders, of which a single column, re-erected from fragments, stands today: a marble forest 137 metres long, raised on marshy ground. Pliny says 36 of the columns were carved in relief at the base. The model shows the third temple, rebuilt in the 4th century BC.",
    ),
    period: l("MÖ 4. yüzyıl - MS 401", "4th century BC - AD 401"),
    measures: [
      {
        value: 137,
        unit: "m",
        label: l("Tapınağın uzunluğu", "Length of the temple"),
        source: "en",
      },
      {
        value: 69,
        unit: "m",
        label: l("Tapınağın genişliği", "Width of the temple"),
        source: "en",
      },
      { value: 18, unit: "m", label: l("Yüksekliği", "Height"), source: "en" },
      {
        value: 127,
        unit: "count",
        label: l("Sütun sayısı (Plinius'a göre)", "Columns, as Pliny counted them"),
        source: "en",
      },
      {
        value: 36,
        unit: "count",
        label: l("Kaidesi kabartmalı sütun", "Columns carved in relief at the base"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Tapınaktan geriye temel ve dağınık parçalar kaldığı için planı tartışmalıdır: kaynaklar boyutları ve 127 sütunu verir, sütunların ızgara düzenini değil. Model 127 sütunu tutturacak biçimde kurulmuştur ama sütun aralıkları, çatının eğimi ve alınlığın bezemesi tamamen modellemedir. Kabartmalı sütun kaideleri düz bırakılmıştır.",
      "Only foundations and scattered fragments survive, so the plan is disputed: the sources give the dimensions and Pliny's 127 columns, not the grid they stood in. The model is laid out to reach 127, but the spacing, the pitch of the roof and the ornament of the pediment are all inference. The carved column bases are left plain.",
    ),
    hotspots: [
      spot(
        [0, 22, 20],
        "Cella",
        "The cella",
        "Çatılı iç mekân: Artemis'in kült heykeli burada dururdu.",
        "The roofed inner room, where the cult statue of Artemis stood.",
      ),
      spot(
        [0, 2.4, -70],
        "Kabartmalı tambur",
        "The sculpted drum",
        "Plinius otuz altı sütunun kaidesinin kabartmalı olduğunu yazar; bir tanesi British Museum'da.",
        "Pliny says thirty-six columns were carved at the base; one of them is in the British Museum.",
      ),
      spot(
        [33, 11, 0],
        "Çift sütun sırası",
        "The double colonnade",
        "Dipteros: gövdeyi iki sıra sütun çevreler, toplamı 127.",
        "A dipteros: two rows of columns wrap the building, 127 in all.",
      ),
      spot(
        [0, 38.4, 45],
        "Beşik çatı",
        "The gabled roof",
        "İki ucunda alınlık bulunan çatı; modelde kademeli olarak kurulmuştur.",
        "The roof, with a pediment at either end, built up in steps in the model.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Temple_of_Artemis",
        "Wikipedia (İngilizce): Temple of Artemis",
        "Wikipedia: Temple of Artemis",
      ),
    ],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 69,
      stylobateLength: 137,
      crepidomaWidth: 78,
      crepidomaLength: 146,
      crepidomaSteps: 9,
      columnHeight: 18,
      outerColumnsShort: 8,
      outerColumnsLong: 21,
      pronaosRows: 3,
      pronaosPerRow: 8,
      totalColumns: 127,
      reliefColumns: 36,
      sekosWallHeight: 13,
      naiskosWidth: 9,
      naiskosLength: 14,
      interior: "cella",
      cultStatue: "artemis",
      courtWidth: 22,
      courtLength: 70,
      columnDiameter: 1.8,
      entablatureHeight: 3.4,
    },
  },
  {
    id: "pergamon-zeus-sunagi",
    siteSlug: "pergamon",
    structure: l("Zeus Sunağı terası", "Great Altar terrace"),
    title: l("Pergamon Zeus Sunağı", "The Great Altar of Pergamon"),
    blurb: l(
      "Bir sunaktan çok bir sahne: 113 metrelik Gigantomakhia frizi, yapının çevresini dolaşan taştan bir savaş anlatısıdır. 1878-86'da sökülüp Berlin'e taşındı; Bergama'da bugün yalnızca terası ve temeli var.",
      "Less an altar than a stage: the 113-metre Gigantomachy frieze wraps the building in a battle told in stone. It was dismantled and shipped to Berlin between 1878 and 1886; what stands at Pergamon now is the terrace and the footings.",
    ),
    period: l("MÖ 170 - 159 civarı", "c. 170 - 159 BC"),
    measures: [
      { value: 35.64, unit: "m", label: l("Taban genişliği", "Width of the base"), source: "en" },
      { value: 33.4, unit: "m", label: l("Taban derinliği", "Depth of the base"), source: "en" },
      {
        value: 5,
        unit: "count",
        label: l("Yapıyı çevreleyen basamak", "Steps surrounding the structure"),
        source: "en",
      },
      { value: 2.3, unit: "m", label: l("Friz yüksekliği", "Height of the frieze"), source: "en" },
      { value: 113, unit: "m", label: l("Frizin uzunluğu", "Length of the frieze"), source: "en" },
      {
        value: 20,
        unit: "m",
        label: l("Ön merdivenin genişliği", "Width of the front stairway"),
        source: "en",
      },
      {
        value: 12,
        unit: "m",
        label: l("Yapının yüksekliği (Ampelius)", "Height of the structure, per Ampelius"),
        source: "en",
      },
      {
        value: 13,
        unit: "m",
        label: l("Üstteki iç avlunun kenarı", "Side of the inner court on top"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Taban ölçüleri, friz ve merdiven genişliği kazılmış parçalardan bilinir; 12 metrelik yükseklik ise Ampelius'un antik notundan gelir ve tartışmalıdır. Üstteki sütun dizisinin oranları, çatının olup olmadığı ve kanatların ayrıntıları modellemedir. Friz bandında Berlin'deki Pergamon Müzesi'nde yeniden kurulmuş Gigantomakhia'nın fotoğrafı dolanır: kabartma gerçek, ama 113 metrelik anlatının hangi sahnesinin yapının hangi yüzünde durduğu modelde doğru değildir.",
      "The base, the frieze and the width of the stairway are known from excavated blocks; the height of 12 metres comes from Ampelius' ancient note and is disputed. The proportions of the colonnade on top, whether it was roofed, and the detail of the wings are inference. The frieze band carries a photograph of the Gigantomachy as re-erected in the Pergamonmuseum in Berlin: the carving is real, but which scene of that 113-metre narrative sat on which face of the building is not what the model shows.",
    ),
    hotspots: [
      spot(
        [-13.9, 4, -17],
        "Gigantomakhia frizi",
        "The Gigantomachy frieze",
        "113 metrelik yüksek kabartma: tanrılarla devlerin savaşı, yapının çevresini dolaşır.",
        "113 metres of high relief: the gods against the giants, wrapping the whole building.",
      ),
      spot(
        [0, 3.9, -13],
        "Ön merdiven",
        "The great stairway",
        "Yirmi metre genişliğinde; iki kanadın arasından terasa çıkar.",
        "Twenty metres wide, climbing to the terrace between the two wings.",
      ),
      spot(
        [0, 10.5, 6],
        "Sütunlu galeri",
        "The colonnade",
        "Terası çeviren İon sütun dizisi.",
        "The Ionic colonnade that runs round the terrace.",
      ),
      spot(
        [0, 9, 2],
        "Sunak",
        "The fire altar",
        "Asıl sunak yukarıdaki avlunun ortasındaydı; friz onun sahnesiydi.",
        "The altar itself stood in the court on top; the frieze was its stage.",
      ),
      spot(
        [14, 7, -14],
        "Kanat",
        "The wing",
        "Merdivenin iki yanında öne çıkan kanatlar frizi kesmeden döndürür.",
        "The wings projecting either side of the stair carry the frieze round without breaking it.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Pergamon_Altar",
        "Wikipedia (İngilizce): Pergamon Altar",
        "Wikipedia: Pergamon Altar",
      ),
    ],
    model: {
      kind: "great-altar",
      baseWidth: 35.64,
      baseDepth: 33.4,
      steps: 5,
      friezeHeight: 2.3,
      friezeLength: 113,
      stairWidth: 20,
      totalHeight: 12,
      courtSide: 13,
      columnDiameter: 0.78,
      columnSpacing: 2.35,
    },
  },
  {
    id: "aphrodisias-stadyumu",
    siteSlug: "aphrodisias",
    structure: l("Stadyum", "Stadium"),
    title: l("Aphrodisias Stadyumu", "The Stadium at Aphrodisias"),
    blurb: l(
      "Antik dünyanın en iyi korunmuş stadyumu: iki ucu da ayakta, otuz sıra oturma basamağı çepeçevre dolanıyor. Kentin surlarının içinde, kuzey kenarına gömülü.",
      "The best-preserved stadium of the ancient world: both ends still standing, thirty rows of seats running the whole way round. It sits inside the city walls, tucked against their northern edge.",
    ),
    period: l("MS 1. yüzyıl", "1st century AD"),
    measures: [
      { value: 270, unit: "m", label: l("Uzunluk", "Length"), source: "en" },
      { value: 60, unit: "m", label: l("Genişlik", "Width"), source: "en" },
      {
        value: 30,
        unit: "count",
        label: l("Her iki yandaki oturma sırası", "Rows of seats on each side"),
        source: "en",
      },
      { value: 30000, unit: "people", label: l("Kapasite", "Capacity"), source: "en" },
    ],
    uncertainty: l(
      "Dış ölçüler ve sıra sayısı ölçülmüştür; pistin genişliği, basamak derinliği ve girişlerin yeri bunlardan türetilmiştir. Stadyumun uzun kenarları hafifçe dışa kavislidir — böylece her sıradan pistin tamamı görülür — ama modeldeki kavis ölçülmüş değil, oranlardan verilmiştir.",
      "The overall dimensions and the row count are measured; the width of the track, the depth of each step and the placing of the entrances are derived from them. The long sides bow outwards slightly, so that every row can see the whole track, but the curve in the model is proportional rather than surveyed.",
    ),
    hotspots: [
      spot(
        [0, 0.6, 0],
        "Pist",
        "The track",
        "Otuz metre eninde, iki ucu kavisli koşu alanı.",
        "The running floor, thirty metres wide and rounded at both ends.",
      ),
      spot(
        [22, 6, 40],
        "Oturma sıraları",
        "The seating",
        "Her iki yanda otuz sıra; toplam otuz bin kişi.",
        "Thirty rows on each side: thirty thousand people in all.",
      ),
      spot(
        [0, 7, 118],
        "Kavisli uç",
        "The curved end",
        "İki ucu da kapalıdır; antik dünyanın en bütün stadyumu olmasının sebebi budur.",
        "Both ends are closed, which is why this is the most complete stadium of antiquity.",
      ),
      spot(
        [16, 1.6, 60],
        "Tonozlu giriş",
        "The vaulted entrance",
        "Seyirci pist seviyesindeki tonozlu geçitlerden girerdi.",
        "The crowd came in through vaulted passages at track level.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Aphrodisias",
        "Wikipedia (İngilizce): Aphrodisias",
        "Wikipedia: Aphrodisias",
      ),
    ],
    model: {
      kind: "stadium",
      overallLength: 270,
      overallWidth: 60,
      rows: 30,
      arenaWidth: 30,
      seatRise: 0.33,
      entrances: 4,
      bow: 4.5,
      arenaEnd: true,
      cityWall: true,
      inscribedSeats: true,
    },
  },
  {
    id: "hierapolis-tiyatrosu",
    siteSlug: "hierapolis",
    structure: l("Tiyatro", "Theatre"),
    title: l("Hierapolis Tiyatrosu", "The Theatre at Hierapolis"),
    blurb: l(
      "Pamukkale'nin travertenlerine bakan yamaca oyulmuş 15.000 kişilik tiyatro. Sahne binasının üç sıra sütunlu cephesi büyük ölçüde ayakta ve 2004-2014 arasında yeniden dikildi.",
      "A theatre for 15,000 cut into the slope above the travertines of Pamukkale. Its stage front, three ranks of columns deep, survives in large part and was re-erected between 2004 and 2014.",
    ),
    period: l("MS 2. yüzyıl", "2nd century AD"),
    measures: [
      { value: 15000, unit: "people", label: l("Kapasite", "Capacity"), source: "en" },
      {
        value: 20,
        unit: "count",
        label: l("Alt bölümdeki sıra", "Rows in the lower bank"),
        source: "en",
      },
      {
        value: 25,
        unit: "count",
        label: l("Üst bölümdeki sıra", "Rows in the upper bank"),
        source: "en",
      },
      {
        value: 8,
        unit: "count",
        label: l("Caveayı bölen merdiven", "Stairways dividing the cavea"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Aynı kaynak tiyatroyu hem 50 sıralı hem de 20 alt + 25 üst sıralı diye anlatır; model ikinci sayıyı esas alır ve 45 sıra kurar. Cavea ile orkestranın çapı ölçülmüş değildir: sıra sayısından ve 0,75 m basamak derinliğinden türetilmiştir. Sahne cephesinin heykelleri ile imparator locası modelde yoktur.",
      "The same source describes the theatre both as having 50 rows and as having 20 below and 25 above; the model takes the second and raises 45. The diameters of the cavea and the orchestra are not measured but derived from the row count and a 0.75 m tread. The statuary of the stage front and the imperial box are not modelled.",
    ),
    hotspots: [
      spot(
        [0, 0.8, 6],
        "Orkestra",
        "The orchestra",
        "Modelde yaklaşık yirmi metre çapında bir yarım daire; bu çap ölçülmüş değil, türetilmiştir.",
        "A half circle about twenty metres across in the model — a derived figure, not a measured one.",
      ),
      spot(
        [0, 12, -7.8],
        "Sahne cephesi",
        "The stage front",
        "Üç sıra sütunlu cephe 2004-2014 arasında yeniden dikildi.",
        "The front, three ranks of columns deep, was re-erected between 2004 and 2014.",
      ),
      spot(
        [0, 10, 31],
        "Diazoma",
        "The diazoma",
        "Alt yirmi sırayı üstteki yirmi beşten ayıran geçit.",
        "The walkway dividing the twenty rows below from the twenty-five above.",
      ),
      spot(
        [28, 7, 28],
        "Cavea",
        "The cavea",
        "Sekiz merdiven caveayı yedi dilime böler; kapasitesi 15.000 kişiydi.",
        "Eight stairways cut the cavea into seven wedges; it held 15,000.",
      ),
    ],
    sources: [
      wiki("en", "en", "Hierapolis", "Wikipedia (İngilizce): Hierapolis", "Wikipedia: Hierapolis"),
    ],
    model: {
      kind: "roman-theatre",
      caveaDiameter: 99,
      orchestraDiameter: 20,
      scaenaeHeight: 16,
      velariumMasts: 46,
      seatTread: 0.75,
      seatRise: 0.38,
      podiumHeight: 1.1,
      stageDepth: 7,
      stairways: 8,
      lowerRows: 20,
      upperRows: 25,
      character: {
        stone: "marble",
        ground: "hillside",
        facade: "none",
        screen: "hierapolis",
        storeys: 3,
        stageHeight: 3.66,
        topGallery: true,
        box: "exedra",
      },
    },
  },
  {
    id: "milet-buyuk-tiyatro",
    siteSlug: "milet",
    structure: l("Büyük Tiyatro", "Great Theatre"),
    title: l("Milet Büyük Tiyatrosu", "The Great Theatre of Miletus"),
    blurb: l(
      "Anadolu'nun en büyük tiyatrolarından biri: caveası 140 metreye yakın çapıyla yamaca yaslanmış bir stadyum gibi açılır. MÖ 250-225'te Yunan mimarlarınca kurulmuş, MS 68-96'da üç katlı taş sahne binası getirilerek Roma döneminde yeniden inşa edilmiştir; bugün o sahne duvarı -arkasındaki işlikleriyle birlikte- en bütün örneklerden biridir.",
      "One of the largest theatres in Anatolia: its cavea, nearly 140 m across, opens like a stadium set against the hillside. Built by Greek architects in 250-225 BC, it was rebuilt under Rome in AD 68-96 with a three-storey stone stage building — a front that survives, with the workshops behind it, among the most complete anywhere.",
    ),
    period: l("MÖ 250 - MS 3. yüzyıl", "250 BC - 3rd century AD"),
    measures: [
      {
        value: 139.8,
        unit: "m",
        label: l("Cavea (oturma bölümü) çapı", "Diameter of the cavea (seating bank)"),
        source: "archive",
      },
      {
        value: 27.34,
        unit: "m",
        label: l("Orkestra çapı", "Diameter of the orchestra"),
        source: "archive",
      },
      {
        value: 14800,
        unit: "people",
        label: l("Oturma kapasitesi (14.800-18.500)", "Seated capacity (14,800-18,500)"),
        source: "archive",
      },
    ],
    uncertainty: l(
      "Kaynaklı olan yalnızca iki çap ve kapasitedir; gerisi türetmedir. 140 metreye yaklaşan bir caveada oturma sırasının sayısı yayınlarda tek biçimli değildir: model, 27,34 metrelik orkestradan 69,9 metrelik dış kenara, 0,75 m basamak derinliği ve ortadaki 1,8 m geçit payıyla 56 sıra dağıtır. Sahne binasının yüksekliği, sahne derinliği, on bir merdiven ve üst galeriye dizilen sütunlar orantı ile yapının fotoğraflarından çıkarılmıştır; tente direkleri Milet için kazıda belgelenmemiştir ve varsayımdır. Model MS 68-96'daki Roma evresini gösterir: Yunan kuruluşunun ahşap sahnesini üç katlı taş bina çoktan değiştirmişti, ama sahne duvarını süsleyen heykeller modelde yoktur.",
      "Only the two diameters and the capacity are cited; the rest is derivation. In a cavea nearly 140 m across the row count varies between publications: the model distributes 56 rows from the 27.34 m orchestra to the 69.9 m outer edge at a 0.75 m tread with a 1.8 m walkway in between. The height of the stage building, the depth of the stage, the eleven stairways and the columns lining the upper gallery are proportion read off photographs of the building; the velarium masts are not documented by excavation at Miletus and are assumed. The model shows the Roman phase of AD 68-96: the timber stage of the Greek foundation had long been replaced by the three-storey building, but the statuary that adorned its front is not modelled.",
    ),
    hotspots: [
      spot(
        [0, 0.8, 7],
        "Orkestra",
        "The orchestra",
        "Yirmi yedi metre çapında yarım daire — MÖ 250-225'teki Yunan kuruluşunun bugüne kalan ana kütlesi.",
        "A half circle 27.34 m across: the surviving mass of the Greek foundation of 250-225 BC.",
      ),
      spot(
        [0, 12, -7.4],
        "Sahne cephesi",
        "The stage front",
        "Üç katlı Roma sahne binası (MS 68-96); arkasındaki tonozlu işlikleriyle bugüne ulaşmıştır.",
        "The three-storey Roman stage building (AD 68-96), surviving with the vaulted workshops behind it.",
      ),
      spot(
        [0, 12, 38],
        "Diazoma",
        "The diazoma",
        "Caveayı ikiye bölen geçit: aşağıda otuz sıra, yukarıda yirmi altı.",
        "The walkway splitting the seating: thirty rows below, twenty-six above.",
      ),
      spot(
        [34, 8, 34],
        "Cavea",
        "The cavea",
        "On bir merdiven oturma bölümünü dilimlere ayırır; kapasitesi 14.800 ile 18.500 arası sayılır.",
        "Eleven stairways cut the seating bank into wedges; its capacity is put between 14,800 and 18,500.",
      ),
      spot(
        [0, 15, 58],
        "Üst galeri",
        "The upper gallery",
        "En üst sıranın ardındaki geniş galeri; Milet'te Roma caveası taşıyıcı duvarla yamaca bağlanmıştı.",
        "The broad gallery behind the top row; at Miletus the Roman cavea was tied to the slope by a supporting wall.",
      ),
    ],
    sources: [
      {
        key: "archive",
        title: l("Ancient Theatre Archive: Miletus", "The Ancient Theatre Archive: Miletus"),
        url: "https://www.whitman.edu/theatre/theatretour/miletus/miletus.htm",
      },
    ],
    model: {
      kind: "roman-theatre",
      caveaDiameter: 139.8,
      orchestraDiameter: 27.34,
      scaenaeHeight: 15.5,
      velariumMasts: 34,
      seatTread: 0.75,
      seatRise: 0.38,
      podiumHeight: 1.1,
      stageDepth: 8,
      stairways: 11,
      lowerRows: 30,
      upperRows: 26,
      character: {
        stone: "marble",
        sweep: 12,
        ground: "mound",
        facade: "arcade",
        screen: "miletus",
        storeys: 2,
        bays: 8,
        topGallery: false,
        box: "canopy",
        annex: "harbour",
      },
    },
  },
  {
    id: "efes-yamac-evler",
    siteSlug: "efes",
    structure: l("Yamaç Evler", "Terrace Houses"),
    title: l("Efes Yamaç Evler", "The Terrace Houses at Ephesus"),
    blurb: l(
      "Kuretler Caddesi'nin karşısındaki yamaca kurulmuş altı lüks konut: yerler mozaik, duvarlar fresko. Tabandan ısıtma, kapalı kanalizasyon ve cam pencerelerle, MS 1. yüzyılda bir Roma zenginin evinin nasıl bir yer olduğunu gösteren tek yerdir. Model, peristilli avlusuyla bir konut biriminin içini gösterir.",
      "Six luxury residences on the slope opposite Curetes Street, their floors in mosaic and their walls in fresco. With underfloor heating, enclosed drains and glazed windows, they are the one place that shows what a rich Roman's house was actually like in the first century AD. The model shows the inside of one unit, around its colonnaded court.",
    ),
    period: l("MS 1. - 7. yüzyıl", "1st - 7th century AD"),
    measures: [
      {
        value: 6,
        unit: "count",
        label: l("Yamaçtaki konut birimi", "Residences on the slope"),
        source: "en",
      },
      {
        value: 2,
        unit: "count",
        label: l("Konutların kat sayısı", "Storeys the houses rise to"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Bu modelin ölçüleri değil, malzemesi belgelidir: kaynak konutların sayısını, iki katlı oluşunu, yerlerin mozaik ve duvarların fresko olduğunu verir — tek tek odaların boyutlarını değil. Avlunun ölçüsü, sütun sayısı ve oda derinlikleri Roma peristilli evinin bilinen oranlarından modellenmiştir. Duvardaki fresko ile yerdeki mozaikler bu evlerin kendi fotoğraflarıdır, ama hangi resmin hangi odada durduğu modelde doğru değildir; ayrıca gerçek yapı bugün modern bir koruma çatısı altındadır ve model o çatıyı göstermez.",
      "What is documented here is the material rather than the measurements: the source gives the number of residences, that they rise two storeys, and that the floors are mosaic and the walls fresco — not the size of any one room. The court, the number of columns round it and the depth of the rooms are modelled from the known proportions of a Roman peristyle house. The fresco on the wall and the mosaics on the floor are photographs of these houses, but which picture belonged in which room is not what the model shows — and the real building now stands under a modern protective roof, which the model leaves off.",
    ),
    hotspots: [
      spot(
        [0, 1.4, 0],
        "Peristil avlu",
        "The peristyle court",
        "Sütunlarla çevrili avlu: ev ışığını ve yağmur suyunu buradan alırdı.",
        "The colonnaded court: the house took its light and its rainwater from here.",
      ),
      spot(
        [0, 0.4, 0],
        "İmpluvium",
        "The impluvium",
        "Avlunun ortasındaki havuz, çatıdan inen yağmuru toplar.",
        "The pool in the middle of the court, catching the rain off the roof.",
      ),
      spot(
        [8.5, 2.4, 0],
        "Fresko",
        "The fresco",
        "Duvarlar sıva üzerine boyalıydı; Musalar Evi'nin resimleri bugün de duruyor.",
        "The walls were painted on plaster; the pictures in the House of the Muses survive.",
      ),
      spot(
        [0, 0.3, 9],
        "Mozaik zemin",
        "The mosaic floor",
        "Odaların zemini renkli taş tesseralarla döşeliydi.",
        "The floors of the rooms were laid with coloured stone tesserae.",
      ),
      spot(
        [-4.5, 3.8, -5.5],
        "Sütun sırası",
        "The colonnade",
        "Avluyu çeviren sütunlar üst katı da taşırdı.",
        "The columns round the court carried the storey above as well.",
      ),
    ],
    sources: [wiki("en", "en", "Ephesus", "Wikipedia (İngilizce): Ephesus", "Wikipedia: Ephesus")],
    model: {
      kind: "peristyle-house",
      residences: 6,
      storeys: 2,
      courtWidth: 9,
      courtDepth: 11,
      courtColumns: 4,
      wallHeight: 4.2,
      roomDepth: 5.5,
      columnDiameter: 0.42,
      poolWidth: 3.2,
    },
  },
  {
    id: "efes-buyuk-tiyatro",
    siteSlug: "efes",
    structure: l("Büyük Tiyatro", "Great Theatre"),
    title: l("Efes Büyük Tiyatrosu", "The Great Theatre of Ephesus"),
    blurb: l(
      "Antik dünyanın en büyük tiyatrolarından biri: Panayır Dağı'nın yamacına oyulmuş üç katlı cavea, liman caddesinin ucundan Roma sahne binasına bakar. Elçilerin İşleri'ndeki gümüşçüler ayaklanması bu tiyatroda geçer.",
      "One of the largest theatres of antiquity: a three-tiered cavea cut into the slope of Mount Pion, looking down the Harbour Street at a Roman stage building. The riot of the silversmiths in the Acts of the Apostles takes place here.",
    ),
    period: l("MÖ 3. yüzyıl - MS 2. yüzyıl", "3rd century BC - 2nd century AD"),
    measures: [
      {
        value: 142,
        unit: "m",
        label: l("Oturma bölümünün (cavea) çapı", "Diameter of the seating bank"),
        source: "archive",
      },
      {
        value: 26,
        unit: "m",
        label: l("Orkestra çapı", "Diameter of the orchestra"),
        source: "archive",
      },
      {
        value: 24,
        unit: "count",
        label: l("Alt kattaki (ima cavea) sıra", "Rows in the lower tier"),
        source: "archive",
      },
      {
        value: 22,
        unit: "count",
        label: l("Orta kattaki (media cavea) sıra", "Rows in the middle tier"),
        source: "archive",
      },
      {
        value: 21,
        unit: "count",
        label: l("Üst kattaki (summa cavea) sıra", "Rows in the upper tier"),
        source: "archive",
      },
      {
        value: 21500,
        unit: "people",
        label: l("Oturma kapasitesi", "Seated capacity"),
        source: "archive",
      },
    ],
    uncertainty: l(
      "Caveanın çapı, orkestranın çapı ve üç kattaki sıra sayıları arşiv kaydından alınmıştır; basamak derinliği (0,7 m), sıra yüksekliği ve iki diazomanın genişliği ise bunları 142 metreye sığdıracak biçimde türetilmiştir. Sahne binasının üç katlı cephesi ölçülmüş değil, Nero döneminde iki kat olarak yapılıp 2. yüzyılda üçüncü katın eklendiği bilgisinden 18 metre olarak orantılanmıştır; kapı ve niş düzeni Aspendos'taki gibi genel bir Roma sahne duvarıdır, Efes'inkinin kopyası değildir. 3. yüzyılda orkestranın arenaya çevrilişi, merdiven sayısı ve tente direkleri modelde yoktur.",
      "The diameter of the cavea and the orchestra and the row counts of the three tiers come from the archive record; the seat tread (0.7 m), the riser and the width of the two walkways are derived to fit them into 142 metres. The three-storey stage front is not measured: it is proportioned to 18 metres from the record that it was built two storeys high under Nero and given its third in the 2nd century, and its doorways and aediculae are a generic Roman stage wall, as at Aspendos, not a copy of the one at Ephesus. The 3rd-century conversion of the orchestra into an arena, the exact stairway count and the awning masts are not modelled.",
    ),
    hotspots: [
      spot(
        [0, 0.8, 8],
        "Orkestra",
        "The orchestra",
        "26 metre çapında; 3. yüzyılda etrafı duvarla çevrilip arenaya dönüştürüldü.",
        "26 metres across; walled round in the 3rd century and turned into an arena.",
      ),
      spot(
        [0, 12, -7.8],
        "Sahne binası",
        "The stage building",
        "Nero döneminde iki katlı yapıldı, üçüncü kat 2. yüzyılda eklendi.",
        "Built two storeys high under Nero; the third storey was added in the 2nd century.",
      ),
      spot(
        [0, 10, 31],
        "Birinci diazoma",
        "The first walkway",
        "Alt kat ile orta katı ayıran geçit; alt katta 24 sıra vardır.",
        "The walkway between the lower and middle tiers; the lower tier has 24 rows.",
      ),
      spot(
        [0, 18, 48],
        "İkinci diazoma",
        "The second walkway",
        "Orta kat ile üst katı ayırır; üst kat 1. yüzyılda eklendi.",
        "Separates the middle tier from the upper one, which was added in the 1st century.",
      ),
      spot(
        [-30, 12, 45],
        "Üç katlı cavea",
        "The three-tiered cavea",
        "24, 22 ve 21 sıra: toplam 67 sıra. Kapasitesi genellikle yaklaşık 24.000 kişi olarak verilir; bazı tahminler 21.500 der.",
        "24, 22 and 21 rows: 67 in all. It is usually said to have seated about 24,000; some estimates give 21,500.",
      ),
      spot(
        [0, 26, 69],
        "Üst galeri",
        "The upper gallery",
        "Yamacın tepesinde, en üst sıranın arkasındaki örtülü geçit.",
        "The covered passage behind the top row, at the crest of the slope.",
      ),
    ],
    sources: [
      {
        key: "archive",
        title: l("Ancient Theatre Archive: Ephesus", "The Ancient Theatre Archive: Ephesus"),
        url: "https://ancienttheatrearchive.com/theatre/ephesus-modern-selcuk-turkey/",
      },
    ],
    model: {
      kind: "roman-theatre",
      caveaDiameter: 142,
      orchestraDiameter: 26,
      scaenaeHeight: 18,
      seatTread: 0.7,
      seatRise: 0.36,
      podiumHeight: 1.2,
      stageDepth: 7,
      stairways: 10,
      lowerRows: 24,
      middleRows: 22,
      upperRows: 21,
      character: {
        stone: "marble",
        sweep: 14,
        ground: "hillside",
        facade: "none",
        screen: "ephesus",
        storeys: 3,
        bays: 12,
        stageHeight: 2.6,
        topGallery: false,
        arenaWall: true,
        annex: "harbour-street",
      },
    },
  },
  {
    id: "side-tiyatrosu",
    siteSlug: "side",
    structure: l("Tiyatro", "Theatre"),
    title: l("Side Tiyatrosu", "The Theatre of Side"),
    blurb: l(
      "Pamphylia'nın en büyük tiyatrosu ve yamaca değil, düz zemine kurulmuş nadir örneklerden: cavea iki katlı tonozlu bir alt yapı üzerinde yükselir. Üç katlı sahne binası kentin sütunlu caddesine cephe verirdi.",
      "The largest theatre in Pamphylia, and one of the rare ones built on level ground rather than a hillside: the cavea stands on a two-storey vaulted substructure. Its three-storey stage building faced the colonnaded street of the city.",
    ),
    period: l("MS 150 - 175", "AD 150 - 175"),
    measures: [
      {
        value: 120,
        unit: "m",
        label: l("Oturma bölümünün (cavea) çapı", "Diameter of the seating bank"),
        source: "archive",
      },
      {
        value: 29,
        unit: "m",
        label: l("Orkestra çapı", "Diameter of the orchestra"),
        source: "archive",
      },
      {
        value: 30,
        unit: "count",
        label: l("Alt kattaki sıra", "Rows in the lower tier"),
        source: "archive",
      },
      {
        value: 25,
        unit: "count",
        label: l("Üst kattaki sıra", "Rows in the upper tier"),
        source: "archive",
      },
      {
        value: 0.805,
        unit: "m",
        label: l("Orkestrayı çevreleyen podyum duvarı", "Podium wall round the orchestra"),
        source: "archive",
      },
      {
        value: 6,
        unit: "m",
        label: l("Sahne platformunun derinliği", "Depth of the stage platform"),
        source: "archive",
      },
      {
        value: 15000,
        unit: "people",
        label: l("Kapasite", "Capacity"),
        source: "de",
      },
    ],
    uncertainty: l(
      "Caveanın ve orkestranın çapı, iki kattaki sıra sayıları, podyum duvarı ve sahnenin derinliği arşiv kaydından; kapasite Almanca Wikipedia'dan alınmıştır. Basamak derinliği (0,7 m) ve sıra yüksekliği bunları 120 metreye sığdıracak biçimde türetilmiştir. Üç katlı sahne binasının 63 metrelik genişliği bilinir ama yüksekliği ölçülmüş değildir; model onu 17 metreye orantılar ve cephenin nişleriyle kapılarını genel bir Roma sahne duvarı olarak çizer. Caveayı taşıyan iki katlı tonozlu alt yapı modelde kemerli bir dış cephe olarak gösterilir; orkestranın sonradan arenaya çevrilirken örülen 2 metrelik duvar yoktur.",
      "The cavea and orchestra diameters, the row counts of the two tiers, the podium wall and the stage depth come from the archive record; the capacity from the German Wikipedia. The seat tread (0.7 m) and the riser are derived to fit them into 120 metres. The three-storey stage building is known to be 63 m wide but its height is not measured; the model proportions it to 17 metres and draws its niches and doorways as a generic Roman stage wall. The two-storey vaulted substructure that carries the cavea is shown as an arcaded outer face, and the 2 m wall built round the orchestra when it became an arena is not modelled.",
    ),
    hotspots: [
      spot(
        [0, 0.8, 8],
        "Orkestra",
        "The orchestra",
        "29 metre çapında; 80 santimlik podyum duvarı seyirciyi arenadan ayırırdı.",
        "29 metres across; an 80 cm podium wall kept the audience off the floor.",
      ),
      spot(
        [0, 3.5, -3],
        "Sahne platformu",
        "The stage platform",
        "Altı metre derinliğinde, orkestradan üç metre yukarıda taş bir platform.",
        "A stone platform six metres deep, standing three metres above the orchestra.",
      ),
      spot(
        [0, 11, -7],
        "Sahne binası",
        "The stage building",
        "Üç katlı, 63 metre genişliğinde; sütunlu caddeye bakan cephesi heykellerle doluydu.",
        "Three storeys and 63 metres wide, its street front once crowded with statues.",
      ),
      spot(
        [0, 12, 37],
        "Diazoma",
        "The diazoma",
        "Otuz sıralık alt kat ile yirmi beş sıralık üst katı ayıran geçit.",
        "The walkway between the thirty rows below and the twenty-five above.",
      ),
      spot(
        [0, 21, 58],
        "Tonozlu alt yapı",
        "The vaulted substructure",
        "Yamaç olmadığı için cavea iki kat tonoz üstünde durur; dıştan kemerli bir cephe.",
        "With no hillside, the cavea rests on two storeys of vaults: an arcaded face outside.",
      ),
    ],
    sources: [
      {
        key: "archive",
        title: l("Ancient Theatre Archive: Side", "The Ancient Theatre Archive: Side"),
        url: "https://ancienttheatrearchive.com/theatre/side-modern-eski-turkey/",
      },
      wiki(
        "de",
        "de",
        "Side_(Pamphylien)",
        "Wikipedia (Almanca): Side (Pamphylien)",
        "Wikipedia (German): Side (Pamphylien)",
      ),
    ],
    model: {
      kind: "roman-theatre",
      caveaDiameter: 120,
      orchestraDiameter: 29,
      scaenaeHeight: 17,
      seatTread: 0.7,
      seatRise: 0.36,
      podiumHeight: 0.805,
      stageDepth: 6,
      stairways: 10,
      lowerRows: 30,
      upperRows: 25,
      character: {
        stone: "limestone",
        ground: "plain",
        facade: "arcade",
        screen: "side",
        storeys: 2,
        topGallery: false,
        arenaWall: true,
        annex: "agora",
        sea: 230,
      },
    },
  },
  {
    id: "perge-stadyumu",
    siteSlug: "perge",
    structure: l("Stadyum", "Stadium"),
    title: l("Perge Stadyumu", "The Stadium at Perge"),
    blurb: l(
      "Anadolu'nun en iyi korunmuş stadyumlarından biri: oturma sıraları yetmiş tonozun üstünde taşınır, tonozların her üçüncüsü giriş, kalanı dükkândı. Kuzey ucu at nalı gibi kapalı, güney ucu açıktır.",
      "One of the best-preserved stadiums in Anatolia: the seating is carried on seventy vaults, every third one an entrance and the rest shops. The north end closes in a horseshoe; the south end is open.",
    ),
    period: l("MS 1. yüzyılın ikinci yarısı", "Second half of the 1st century AD"),
    measures: [
      { value: 234, unit: "m", label: l("Uzunluk", "Length"), source: "tr" },
      { value: 34, unit: "m", label: l("Genişlik", "Width"), source: "tr" },
      {
        value: 11,
        unit: "count",
        label: l("Oturma sırası", "Rows of seats"),
        source: "tr",
      },
      {
        value: 0.436,
        unit: "m",
        label: l("Bir sıranın yüksekliği", "Height of one row"),
        source: "tr",
      },
      { value: 12000, unit: "people", label: l("Kapasite", "Capacity"), source: "tr" },
    ],
    uncertainty: l(
      "Uzunluk, genişlik, sıra sayısı ve sıranın yüksekliği Türkçe Wikipedia'dan alınmıştır; kaynağın verdiği 0,63 metrelik sıra derinliği ile pistin genişliği (20,1 m) bunlardan türetilmiştir. Yetmiş tonozun dıştan görünen kemerleri, dükkânları ve kuzey ucun içindeki geçitler modelde yalnızca giriş ağızları olarak gösterilir; güney ucun açık bırakılışı kaynağa dayanır ama oradaki anıtsal girişin biçimi bilinmediğinden çizilmemiştir.",
      "Length, width, the row count and the height of a row come from the Turkish Wikipedia; the 0.63 m tread the source gives and the width of the track (20.1 m) are derived from them. The seventy vaults' outer arches, their shops and the passages inside the north end appear only as entrance mouths, and while the open south end follows the source, the form of the monumental entrance there is unknown and is not drawn.",
    ),
    hotspots: [
      spot(
        [0, 0.6, 0],
        "Pist",
        "The track",
        "Yaklaşık 20 metre eninde, 234 metre boyunda koşu alanı.",
        "The running floor, about 20 metres wide and 234 long.",
      ),
      spot(
        [13, 3, 40],
        "Oturma sıraları",
        "The seating",
        "Her iki yanda on bir sıra, her biri 43,6 santim yüksekliğinde.",
        "Eleven rows on each side, each 43.6 centimetres high.",
      ),
      spot(
        [0, 5, 110],
        "Kapalı kuzey ucu",
        "The closed north end",
        "At nalı biçiminde kapanan uç; sıralar buradan kesintisiz döner.",
        "The end that closes in a horseshoe; the rows run round it unbroken.",
      ),
      spot(
        [0, 1, -101.5],
        "Açık güney ucu",
        "The open south end",
        "Pistin bu ucu kapatılmamıştı; anıtsal giriş buradaydı.",
        "This end of the track was left open; the monumental entrance stood here.",
      ),
      spot(
        [18, 1.6, 30],
        "Tonozlar",
        "The vaults",
        "Yetmiş tonoz sıraları taşır: her üçüncüsü giriş, ötekiler dükkân.",
        "Seventy vaults carry the seats: every third an entrance, the others shops.",
      ),
    ],
    sources: [wiki("tr", "tr", "Perge", "Wikipedia (Türkçe): Perge", "Wikipedia (Turkish): Perge")],
    model: {
      kind: "stadium",
      overallLength: 234,
      overallWidth: 34,
      rows: 11,
      arenaWidth: 20.14,
      seatRise: 0.436,
      entrances: 12,
      openEnd: true,
      vaults: 30,
      hillside: true,
    },
  },
  {
    id: "aizanoi-zeus-tapinagi",
    siteSlug: "aizanoi",
    structure: l("Zeus Tapınağı", "Temple of Zeus"),
    title: l("Aizanoi Zeus Tapınağı", "The Temple of Zeus at Aizanoi"),
    blurb: l(
      "Anadolu'nun en iyi korunmuş Zeus tapınağı: sekize on beş sütunlu bir pseudodipteros, altında ışık pencereli tonozlu bir mahzenle. Domitianus döneminde adanmış; sütunlarının çoğu hâlâ ayakta.",
      "The best-preserved temple of Zeus in Anatolia: a pseudodipteros of eight by fifteen columns over a vaulted chamber lit by windows. Dedicated under Domitian, most of its columns still stand.",
    ),
    period: l("MS 92 - 95", "AD 92 - 95"),
    measures: [
      {
        value: 35,
        unit: "m",
        label: l("Stylobat genişliği", "Width of the stylobate"),
        source: "en",
      },
      {
        value: 53,
        unit: "m",
        label: l("Stylobat uzunluğu", "Length of the stylobate"),
        source: "en",
      },
      {
        value: 8,
        unit: "count",
        label: l("Kısa kenardaki sütun", "Columns on the short sides"),
        source: "en",
      },
      {
        value: 15,
        unit: "count",
        label: l("Uzun kenardaki sütun", "Columns on the long sides"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Stylobatın ölçüleri ve kenarlardaki sütun sayıları İngilizce Wikipedia'dan alınmıştır; 42 sütunluk toplam bunlardan çıkar. Sütun yüksekliği (9 m), çapı, saçaklık, çatı ve cellanın duvarları ölçülmüş değil, İon düzeninin oranlarından verilmiştir. Pseudodipteros düzeninde ikinci sütun halkasının yeri boş bırakılmış, cella o kadar geriye çekilmiştir. Tapınağın altındaki tonozlu mahzen ve ışık pencereleri modelde yoktur; podyum yalnızca basamaklı bir krepis olarak gösterilir.",
      "The stylobate dimensions and the column counts on the sides come from the English Wikipedia; the total of 42 columns follows from them. The column height (9 m), the diameter, the entablature, the roof and the cella walls are not measured but proportioned from the Ionic order. In the pseudodipteral plan the place of the second ring of columns is left empty and the cella set back by that much. The vaulted chamber beneath the temple and its light windows are not modelled; the podium is shown only as a stepped crepis.",
    ),
    hotspots: [
      spot(
        [-16, 6, -25],
        "Köşe sütunu",
        "The corner column",
        "Sekize on beş sütun: köşeler ortak sayılınca kırk iki.",
        "Eight by fifteen columns: forty-two once the corners are shared.",
      ),
      spot(
        [0, 5, -24],
        "Pronaos",
        "The pronaos",
        "Cellanın önündeki derin sundurma; kapı buradan içeri açılırdı.",
        "The deep porch before the cella; the door opened inwards from here.",
      ),
      spot(
        [0, 9, 2],
        "Cella",
        "The cella",
        "Zeus'un kült heykelinin durduğu kapalı oda.",
        "The closed chamber that held the cult statue of Zeus.",
      ),
      spot(
        [10, 4, 8],
        "Pseudodipteros",
        "The pseudodipteros",
        "Sütun halkası ile cella arasında bir halka genişliğinde boşluk bırakılmıştır.",
        "A gap one ring wide is left between the colonnade and the cella.",
      ),
      spot(
        [0, 1.2, 20],
        "Tonozlu mahzen",
        "The vaulted chamber",
        "Tapınağın altında ışık pencereli bir tonoz uzanır; kült için kullanıldığı sanılıyor. Mahzen modelde gösterilmez; bu işaret yalnızca yerini belirtir.",
        "A barrel vault lit by windows runs beneath the temple, probably a cult room. It is not modelled; this marker only shows where it lies.",
      ),
    ],
    sources: [wiki("en", "en", "Aizanoi", "Wikipedia (İngilizce): Aizanoi", "Wikipedia: Aizanoi")],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 35,
      stylobateLength: 53,
      crepidomaWidth: 39,
      crepidomaLength: 57,
      crepidomaSteps: 5,
      columnHeight: 9,
      outerColumnsShort: 8,
      outerColumnsLong: 15,
      pronaosRows: 1,
      pronaosPerRow: 2,
      totalColumns: 42,
      sekosWallHeight: 10,
      naiskosWidth: 6,
      naiskosLength: 8,
      interior: "cella",
      cultStatue: "zeus",
      rings: 1,
      courtWidth: 14,
      courtLength: 30,
      columnDiameter: 1.0,
      entablatureHeight: 2.2,
    },
  },
  {
    id: "halikarnas-mozolesi",
    siteSlug: "halikarnassos",
    structure: l("Mausoleion", "Mausoleum"),
    title: l("Halikarnas Mozolesi", "The Mausoleum at Halicarnassus"),
    blurb: l(
      "Dünyanın Yedi Harikası'ndan biri ve 'mozole' sözcüğünün kaynağı: Karia satrapı Mausolos için kız kardeşi ve eşi Artemisia'nın yaptırdığı mezar. Yüksek bir podyum, otuz altı sütun, basamaklı bir piramit ve tepede dört atlı bir araba.",
      "One of the Seven Wonders, and the building every mausoleum is named after: the tomb Artemisia, his sister and wife, raised for Mausolus, satrap of Caria. A tall podium, thirty-six columns, a stepped pyramid and a four-horse chariot on the summit.",
    ),
    period: l("MÖ 353 - 350", "353 - 350 BC"),
    measures: [
      {
        value: 32,
        unit: "m",
        label: l("Temel genişliği", "Width of the foundation"),
        source: "de",
      },
      {
        value: 38.4,
        unit: "m",
        label: l("Temel uzunluğu", "Length of the foundation"),
        source: "de",
      },
      {
        value: 18.5,
        unit: "m",
        label: l("Podyumun yüksekliği", "Height of the podium"),
        source: "de",
      },
      {
        value: 36,
        unit: "count",
        label: l("İon sütunu (dokuza on bir)", "Ionic columns (nine by eleven)"),
        source: "de",
      },
      {
        value: 24,
        unit: "count",
        label: l("Piramidin basamağı", "Steps of the pyramid"),
        source: "de",
      },
      {
        value: 7,
        unit: "m",
        label: l("Piramidin yüksekliği", "Height of the pyramid"),
        source: "de",
      },
      {
        value: 6,
        unit: "m",
        label: l("Kaidesiyle quadriga", "The quadriga with its base"),
        source: "de",
      },
      { value: 46, unit: "m", label: l("Toplam yükseklik", "Total height"), source: "de" },
      {
        value: 20,
        unit: "count",
        label: l("Bulunan aslan heykeli", "Lion statues found"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Temelin ölçüleri, podyumun, piramidin ve quadriganın yüksekliği, sütun ve basamak sayıları Almanca Wikipedia'dan; aslan sayısı İngilizce Wikipedia'dan alınmıştır. Yapı 15. yüzyılda sökülüp Bodrum Kalesi'ne taş olduğu için gerisi Plinius'un anlatımına ve kazılan temele dayanan bir yorumdur: podyumun üç kademesi, sütunların 12 metrelik yüksekliği, cellanın biçimi, piramidin tepesindeki platform ve quadriganın duruşu orantıdır, ölçü değil. Podyumu saran üç kabartma frizi (Amazonomakhia, Kentauromakhia, araba yarışı) ve dört yüz heykelin büyük kısmı modelde yoktur; sütun aralarındaki figürler ile aslanlar yerleşimi göstermek için konmuştur.",
      "The foundation dimensions, the heights of the podium, pyramid and quadriga, and the column and step counts come from the German Wikipedia; the lion count from the English one. Because the building was quarried into Bodrum Castle in the 15th century, the rest is interpretation from Pliny's description and the excavated foundation: the three tiers of the podium, the 12 m column height, the shape of the cella, the summit platform and the pose of the quadriga are proportion, not measurement. The three relief friezes round the podium (Amazons, centaurs, a chariot race) and most of the four hundred statues are absent; the figures between the columns and the lions are there to show the arrangement.",
    ),
    hotspots: [
      spot(
        [0, 9, -19.5],
        "Podyum",
        "The podium",
        "18,5 metre yüksekliğinde, üç kademeli; frizler bu kademeleri sarardı.",
        "18.5 metres high, in three tiers; the friezes wrapped these tiers.",
      ),
      spot(
        [14, 13.5, -14],
        "Aslanlar",
        "The lions",
        "Podyumun çevresinde yirmi aslan heykeli bulundu; hepsi dışarı bakar.",
        "Twenty lion statues were found round the podium, all facing outwards.",
      ),
      spot(
        [0, 25, -16.5],
        "Sütun halkası",
        "The colonnade",
        "Dokuza on bir, otuz altı İon sütunu; aralarında heykeller dururdu.",
        "Thirty-six Ionic columns, nine by eleven, with statues standing between them.",
      ),
      spot(
        [0, 37, -9],
        "Piramit",
        "The pyramid",
        "Yirmi dört basamakla yedi metre yükselen çatı.",
        "A roof rising seven metres in twenty-four steps.",
      ),
      spot(
        [0, 44, 0],
        "Quadriga",
        "The quadriga",
        "Tepedeki mermer araba: dört at, Mausolos ve Artemisia. Atın başı bugün Londra'da.",
        "The marble chariot on top: four horses, Mausolus and Artemisia. A horse's head is in London.",
      ),
    ],
    sources: [
      wiki(
        "de",
        "de",
        "Mausoleum_von_Halikarnassos",
        "Wikipedia (Almanca): Mausoleum von Halikarnassos",
        "Wikipedia (German): Mausoleum von Halikarnassos",
      ),
      wiki(
        "en",
        "en",
        "Mausoleum_at_Halicarnassus",
        "Wikipedia (İngilizce): Mausoleum at Halicarnassus",
        "Wikipedia: Mausoleum at Halicarnassus",
      ),
    ],
    model: {
      kind: "mausoleum",
      baseWidth: 32,
      baseDepth: 38.4,
      podiumHeight: 18.5,
      columns: 36,
      columnsShort: 9,
      columnsLong: 11,
      pyramidSteps: 24,
      pyramidHeight: 7,
      quadrigaHeight: 6,
      totalHeight: 46,
      lions: 20,
      columnHeight: 12,
      columnDiameter: 1.05,
      entablatureHeight: 2.5,
      statues: 20,
    },
  },
  {
    id: "nemrut-dogu-terasi",
    siteSlug: "nemrut",
    structure: l("Doğu terası", "East terrace"),
    title: l("Nemrut Dağı, Doğu Terası", "Mount Nemrut, the East Terrace"),
    blurb: l(
      "Kommagene kralı I. Antiokhos'un 2.150 metrede kurduğu mezar-tapınak: çakıl tümülüsün eteğinde, tahtlarında oturan sekiz-dokuz metrelik tanrılar — kral, Kommagene, Zeus, Apollon, Herakles — iki yanda kartal ve aslan, karşılarında basamaklı sunak. Model başları omuzlarına geri koyar.",
      "The tomb-sanctuary King Antiochus I of Commagene built at 2,150 metres: at the foot of a gravel tumulus, gods eight to nine metres tall sit enthroned — the king, Commagene, Zeus, Apollo and Herakles — with an eagle and a lion at either end and a stepped altar facing them. The model puts the heads back on their shoulders.",
    ),
    period: l("MÖ 1. yüzyılın ikinci yarısı", "Second half of the 1st century BC"),
    measures: [
      {
        value: 49,
        unit: "m",
        label: l("Tümülüsün yüksekliği", "Height of the tumulus"),
        source: "en",
      },
      {
        value: 152,
        unit: "m",
        label: l("Tümülüsün çapı", "Diameter of the tumulus"),
        source: "en",
      },
      {
        value: 26,
        unit: "m",
        label: l("Doğu terası avlusunun uzunluğu", "Length of the east terrace court"),
        source: "de",
      },
      {
        value: 21,
        unit: "m",
        label: l("Doğu terası avlusunun genişliği", "Width of the east terrace court"),
        source: "de",
      },
      {
        value: 8.75,
        unit: "m",
        label: l("Zeus heykelinin yüksekliği", "Height of the statue of Zeus"),
        source: "de",
      },
      {
        value: 3,
        unit: "m",
        label: l("Tahtların taban kenarı", "Side of a throne's base"),
        source: "de",
      },
      {
        value: 5,
        unit: "count",
        label: l("Tahtta oturan dev heykel", "Enthroned colossi"),
        source: "de",
      },
    ],
    uncertainty: l(
      "Tümülüsün yüksekliği ve çapı İngilizce, avlunun ölçüleri, Zeus heykelinin yüksekliği, tahtların tabanı ve heykellerin sırası Almanca Wikipedia'dan alınmıştır. Yalnızca Zeus'un boyu ölçülüdür; beş heykel de onun ölçeğinde çizilmiştir, bu yüzden tiarasız Herakles daha alçakta kalır; tahtın oturma yüksekliği (3 m), kartal ile aslanın 4,75 metrelik boyu (kaynak 4,5-5 m der), sunağın basamakları ve atalar dizisinin stelleri orantıdır. Heykeller bugün başsızdır — başlar önlerinde, yere düşmüş durur — model kutsal alanı kurulduğu hâliyle, başları yerinde gösterir; yüzler ve tiara biçimleri gerçek heykellerin kopyası değildir. Aslanlar Delos'taki oturan bir mermer aslanın, kartallar ise 16. yüzyıldan bir mermer kartalın taramasıdır ve terasın kireçtaşıyla çizilmiştir: Nemrut'un kendi aslan ve kartallarından yalnızca parçalar kalmıştır ve onlar Kommagene'nin kendi üslubundaydı. Batı ve kuzey terasları modelde yoktur.",
      "The height and diameter of the tumulus come from the English Wikipedia; the court dimensions, the height of Zeus, the throne bases and the order of the figures from the German one. Only Zeus is measured; all five colossi are drawn at his scale, so the bare-headed Herakles stands lower than the others; the seat height of the thrones (3 m), the 4.75 m of the eagle and the lion (the source says 4.5-5 m), the altar steps and the stelae of the ancestors are proportion. The statues stand headless today, their heads on the ground before them; the model shows the sanctuary as built, heads in place, and the faces and tiaras are not copies of the originals. The lions are a scan of a seated marble lion from Delos and the eagles a scan of a 16th-century marble eagle, both drawn in the terrace's limestone: only fragments of Nemrut's own lions and eagles survive, and they were in Commagene's own style. The west and north terraces are not modelled.",
    ),
    hotspots: [
      spot(
        [1, 8, 0],
        "Zeus-Oromasdes",
        "Zeus-Oromasdes",
        "Sıranın ortasında, 8,75 metre boyunda; Yunan ve Pers tanrısının birleşimi.",
        "In the middle of the row at 8.75 metres: Greek Zeus and Persian Ahura Mazda in one.",
      ),
      spot(
        [1, 8, 7.6],
        "I. Antiokhos",
        "Antiochus I",
        "Kral, tanrıların arasında ve onlarla aynı boyda oturur.",
        "The king sits among the gods, and at their height.",
      ),
      spot(
        [1, 8, -7.6],
        "Herakles-Artagnes-Ares",
        "Herakles-Artagnes-Ares",
        "Sıranın sağ ucundaki tanrı; ardından kartal ve aslan gelir.",
        "The god at the right end of the row; beyond him the eagle and the lion.",
      ),
      spot(
        [0, 5, 14],
        "Aslan",
        "The lion",
        "Her sıranın iki ucunu bir kartal ve bir aslan kapatır.",
        "An eagle and a lion close each end of the row.",
      ),
      spot(
        [22, 4, 0],
        "Basamaklı sunak",
        "The stepped altar",
        "Tanrıların karşısında, avlunun doğu ucunda; ateş sunağı.",
        "Facing the gods at the east end of the court: the fire altar.",
      ),
      spot(
        [12, 2.5, 11.5],
        "Atalar dizisi",
        "The ancestor stelae",
        "Avlunun iki yanında kralın Pers ve Makedon atalarını gösteren steller sıralanırdı.",
        "Along both sides of the court stood stelae of the king's Persian and Macedonian ancestors.",
      ),
      spot(
        [-30, 22, 0],
        "Tümülüs",
        "The tumulus",
        "Kırk dokuz metre yüksekliğinde çakıl yığını; mezar odası hâlâ bulunamadı.",
        "A gravel mound forty-nine metres high; the burial chamber has never been found.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Mount_Nemrut",
        "Wikipedia (İngilizce): Mount Nemrut",
        "Wikipedia: Mount Nemrut",
      ),
      wiki(
        "de",
        "de",
        "Nemrut_Dağı_(Adıyaman)",
        "Wikipedia (Almanca): Nemrut Dağı (Adıyaman)",
        "Wikipedia (German): Nemrut Dağı (Adıyaman)",
      ),
    ],
    model: {
      kind: "tumulus-sanctuary",
      tumulusHeight: 49,
      tumulusDiameter: 152,
      courtWidth: 21,
      courtDepth: 26,
      statueHeight: 8.75,
      throneBase: 3,
      colossi: 5,
      throneHeight: 3,
      guardianHeight: 4.75,
      altarSteps: 5,
    },
  },
  {
    id: "hattusa-aslanli-kapi",
    siteSlug: "hattusa",
    structure: l("Aslanlı Kapı", "Lion Gate"),
    title: l("Hattuşa, Aslanlı Kapı", "Hattusa, the Lion Gate"),
    blurb: l(
      "Hitit başkentinin Yukarı Şehir surundaki güneybatı kapısı: iki kulenin arasında, birbirine doğru eğilerek parabolik bir kemerde buluşan dev söve taşları, ve dış sövelerin taşından yontulmuş iki aslan. Sur, toprak bir setin sırtında yürür; yol kapıya setin yüzü boyunca bir rampayla çıkar.",
      "The south-west gate in the Upper City wall of the Hittite capital: between two towers, huge jamb stones leaning towards each other until they meet in a parabolic arch, and two lions cut from the stone of the outer jambs. The wall runs along the crest of an earthen rampart; the road climbs to the gate along its face on a ramp.",
    ),
    period: l(
      "Hitit İmparatorluk dönemi, MÖ 14.–13. yüzyıl",
      "Hittite Empire, 14th–13th century BC",
    ),
    measures: [
      {
        value: 2,
        unit: "count",
        label: l("Söve taşlarından yontulmuş aslan", "Lions carved from the jamb stones"),
        source: "en",
      },
      {
        value: 2,
        unit: "count",
        label: l("Kapıyı iki yandan kuşatan kule", "Towers flanking the gate"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Kaynaktan alınan yalnızca kapının düzenidir: iki kule arasında parabolik kemerli bir geçit ve dış sövelerdeki iki aslan. Bu modelin hazırlandığı sırada kaynaklara erişilemediği için hiçbir metre ölçüsü doğrulanmamıştır: kemerin genişliği (3,3 m) ve yüksekliği (5 m), kulelerin boyu, surun kalınlığı ve yüksekliği, setin yüksekliği ve aslanların boyu fotoğraflara ve yayımlanmış rekonstrüksiyon çizimlerine dayanan orantılardır ve yayınlarla karşılaştırılmalıdır. Taş kaidelerin üstündeki kerpiç duvarlar, ahşap hatıllar, mazgallar ve kule pencereleri Hitit kule biçimli kaplarından ve Boğazköy'de yeniden kurulmuş sur parçasından tanınan türdendir; ölçüleri tahmindir. Kapı odasının üstünün örtülü olup olmadığı bilinmiyor; model açık bırakır. Kemerin taşları ve aslanlar tek tek taşlar olarak değil, söve bloklarıyla birlikte yontulmuş olarak gösterilir. Kapının tarihi tartışmalıdır: Yukarı Şehir'in bir kısmı bugün MÖ 16. yüzyıla tarihleniyor.",
      "What the source gives is only the arrangement of the gate: a passage with parabolic arches between two towers, and the two lions on the outer jambs. The sources could not be reached while this model was made, so no metre figure here has been checked: the width (3.3 m) and height (5 m) of the arch, the towers, the thickness and height of the wall, the height of the rampart and the size of the lions are proportions taken from photographs and published reconstruction drawings, and should be checked against the publications. The mud-brick walls on the stone socles, their timber lacing, the crenellations and the tower windows are of the kind known from Hittite tower-shaped vessels and from the stretch of wall rebuilt at Boğazköy; their sizes are estimates. Whether the gate chamber was roofed is unknown, and the model leaves it open. The date is debated: parts of the Upper City are now dated as early as the 16th century BC.",
    ),
    hotspots: [
      spot(
        [-2.5, 6.6, -9.6],
        "Aslanlar",
        "The lions",
        "Ağzı açık iki aslanın ön gövdesi, dış sövelerin taşından yontulmuştur; gözleri bir zamanlar kakmaydı.",
        "The foreparts of two roaring lions, cut from the stone of the outer jambs; their eyes were once inlaid.",
      ),
      spot(
        [0, 9.6, -8.4],
        "Parabolik kemer",
        "The parabolic arch",
        "Birbirine doğru eğilen iki dev taş ve tepedeki taş: kemer bir sivri parabol çizer.",
        "Two huge stones leaning together and a crown stone on top: the opening is a pointed parabola.",
      ),
      spot(
        [0, 6.4, -1],
        "Kapı odası",
        "The gate chamber",
        "Dış ve iç kemer arasındaki oda; kapı kanatları ahşap ve tunç kaplamaydı.",
        "The chamber between the outer and inner arches; the door leaves were timber, sheathed in bronze.",
      ),
      spot(
        [-7.8, 15, -9.3],
        "Kapı kulesi",
        "Gate tower",
        "Çokgen taşlı kaide üstünde kerpiç, ahşap hatıllar ve mazgallar.",
        "Mud brick with timber lacing and crenellations, on a socle of polygonal stones.",
      ),
      spot(
        [-50.3, 6.5, 0],
        "Kazamat duvar",
        "The casemate wall",
        "İki taş kabuk ve aralarında moloz dolgu; üstünde kerpiç.",
        "Two stone shells with rubble fill between them, mud brick above.",
      ),
      spot(
        [-30, 3.4, -14.4],
        "Toprak set",
        "The rampart",
        "Sur yapay bir setin sırtında yürür; dış yamacı taşla kaplıdır.",
        "The wall runs on an artificial rampart; its outer slope is faced with stone.",
      ),
      spot(
        [34, 3.2, -20.7],
        "Rampa",
        "The ramp",
        "Yol kapıya setin önünden, sura paralel bir rampayla çıkar.",
        "The road climbs to the gate along the front of the rampart, parallel to the wall.",
      ),
    ],
    sources: [wiki("en", "en", "Hattusa", "Wikipedia (İngilizce): Hattusa", "Wikipedia: Hattusa")],
    model: {
      kind: "hittite-gate",
      gateWidth: 3.3,
      lions: 2,
      towers: 2,
      archHeight: 5,
      rampartHeight: 5,
      wallThickness: 8,
      wallHeight: 9,
      socleHeight: 3,
      towerWidth: 9,
      towerDepth: 16,
      towerHeight: 14,
      lionHeight: 2.1,
      wallLength: 100,
    },
  },
  {
    id: "troya-vi-surlari",
    siteSlug: "troya",
    structure: l("Kent surları", "City walls"),
    title: l("Troya VI, Doğu Kapısı ve surlar", "Troy VI, the East Gate and its walls"),
    blurb: l(
      "Geç Tunç Çağı'nda Troya'nın kale surları: dışa doğru eğimli, düzgün kesme kireçtaşından alt duvar, birkaç metrede bir hafifçe geri çekilen yüzü, üstünde kerpiç. Doğu Kapısı duvardaki bir açıklık değil, iki sur ucunun arasından kıvrılarak yükselen bir geçittir; ötesinde öne çıkan bir kule ve terasların üstünde serbest duran büyük evler.",
      "The citadel walls of Troy in the Late Bronze Age: a lower wall of dressed limestone with a sloping, battered face that steps back a little every few metres, and mud brick on top of it. The East Gate is not an opening through the wall but a passage climbing between two of its ends; beyond it a tower stands forward of the wall, and on the terraces inside stand large free-standing houses.",
    ),
    period: l("Troya VI, yaklaşık MÖ 1700–1250", "Troy VI, about 1700–1250 BC"),
    measures: [
      {
        value: 5,
        unit: "m",
        label: l(
          "Sur duvarının kalınlığı (doğrulanmadı)",
          "Thickness of the citadel wall (unverified)",
        ),
        source: "en",
      },
    ],
    uncertainty: l(
      "Höyükte üst üste dokuz kent katmanı (Troya I–IX) vardır; model yalnızca Troya VI'nın surlarını gösterir. Bugün en çok görülen taş rampa Troya II'ye, bin yıl daha eskiye aittir ve Troya VI zamanında toprak altındaydı; bu yüzden modelde yoktur — buradaki rampa Doğu Kapısı geçidinin kendi yükselen zeminidir. Bu model hazırlanırken kaynaklara erişilemedi: duvar kalınlığı (5 m) bellekteki yayınlanmış değerdir ve doğrulanmalıdır; taş duvarın yüksekliği (6 m), kerpicin yüksekliği, eğimin miktarı, geri çekilmelerin aralığı (yaklaşık 9,5 m) ve derinliği, geçidin genişliği, kulenin ölçüleri ve evlerin yerleri orantıdır. Kerpiç üst duvarın biçimi, korkulukları ve pencereleri bilinmiyor; düz bir korkuluk gösterilir. Evler tek tek kazılmış Troya VI evlerinin kopyası değil, o türden evlerdir.",
      "The mound holds nine cities one above another (Troy I–IX); the model shows only the walls of Troy VI. The stone ramp most visitors see today belongs to Troy II, a thousand years older, and lay buried in Troy VI's time, so it is not in the model — the ramp here is the climbing floor of the East Gate passage itself. The sources could not be reached while this model was made: the wall thickness (5 m) is the published figure as remembered and should be checked; the height of the stone wall (6 m), the mud brick, the amount of batter, the spacing (about 9.5 m) and depth of the offsets, the width of the passage, the tower and the placing of the houses are proportion. The form of the mud-brick upper wall, its parapet and windows is unknown; a plain parapet is shown. The houses are of the Troy VI type, not copies of particular excavated ones.",
    ),
    hotspots: [
      spot(
        [-20, 3, -3.7],
        "Eğimli duvar yüzü",
        "The battered face",
        "Kireçtaşı alt duvar yükseldikçe geriye yaslanır; taşlar düzgün sıralar halinde kesilmiştir.",
        "The limestone lower wall leans back as it rises, cut and laid in regular courses.",
      ),
      spot(
        [-5.5, 4.5, -3.5],
        "Geri çekilmeler",
        "The offsets",
        "Yüz birkaç metrede bir hafifçe geri basamak yapar: Troya VI surunun imzası.",
        "Every few metres the face steps back slightly: the signature of a Troy VI wall.",
      ),
      spot(
        [14, 4.2, -5.3],
        "Doğu Kapısı",
        "The East Gate",
        "İki sur ucunun arasındaki geçit: içeri giren, sağ yanını surun yüzüne vermek zorundadır.",
        "A passage between two ends of the wall: whoever came in had to walk along the face of the wall.",
      ),
      spot(
        [10, 1.8, -5.3],
        "Yükselen geçit",
        "The climbing passage",
        "Geçidin zemini ovadan kale terasına doğru yükselir.",
        "The floor of the passage climbs from the plain to the citadel terrace.",
      ),
      spot(
        [32, 9, -18.2],
        "Kule",
        "The tower",
        "Kapının ötesinde surun önüne çıkan kule.",
        "The tower that stands forward of the wall beyond the gate.",
      ),
      spot(
        [-30, 7.5, -2.4],
        "Kerpiç üst duvar",
        "The mud-brick upper wall",
        "Taş duvarın üstünde, ahşap hatıllı kerpiç.",
        "Mud brick, laced with timber, on top of the stone wall.",
      ),
      spot(
        [-4, 5, 19],
        "Teras evleri",
        "The terrace houses",
        "Taş temelli, kerpiç duvarlı, serbest duran büyük evler.",
        "Large free-standing houses on stone socles with mud-brick walls.",
      ),
      spot(
        [10, 3.6, 34],
        "Katmanlar",
        "The layers",
        "Ayağınızın altında beş eski kent, üstünüzde sonraki üç kent: Troya dokuz katmandır.",
        "Five older cities lie underfoot and three later ones would rise above: Troy is nine layers deep.",
      ),
    ],
    sources: [wiki("en", "en", "Troy", "Wikipedia (İngilizce): Troy", "Wikipedia: Troy")],
    model: {
      kind: "troy-citadel",
      wallThickness: 5,
      stoneHeight: 6,
      brickHeight: 3.5,
      batter: 1.5,
      offsetSpacing: 9.5,
      offsetDepth: 0.3,
      passageWidth: 3.2,
      terrace: 3,
      towerWidth: 10,
      towerDepth: 6,
      houses: 4,
    },
  },
  {
    id: "catalhoyuk-dogu-hoyugu",
    siteSlug: "catalhoyuk",
    structure: l("Kuzey kazı alanı", "North excavation shelter"),
    title: l("Çatalhöyük, Doğu Höyüğü'nde evler", "Çatalhöyük, houses on the East Mound"),
    blurb: l(
      "Sokağı olmayan bir kasaba: kerpiç evler duvar duvara yapılmış, insanlar düz damların üstünde yürür ve evlerine damdaki bir delikten, ocağın yanından inen merdivenle girerdi. İçeride beyaz sıvalı duvarlar ve sekiler, duvarlara gömülü yaban boğası boynuzları, duvar resimleri. İki evin damı içini göstermek için açık bırakılmıştır.",
      "A town without streets: the mud-brick houses were built wall against wall, people walked across the flat roofs and came down into their houses by a ladder through a hole in the roof, beside the oven. Inside, white-plastered walls and platforms, the horns of wild bulls set into the walls, and paintings. Two houses are shown with their roofs off so that the inside can be seen.",
    ),
    period: l("Neolitik, yaklaşık MÖ 7400–6200", "Neolithic, about 7400–6200 BC"),
    measures: [
      {
        value: 8000,
        unit: "people",
        label: l(
          "Nüfus tahmini, en yüksek (3.500–8.000)",
          "Estimated population, upper figure (3,500–8,000)",
        ),
        source: "en",
      },
    ],
    uncertainty: l(
      "Evlerin damdan girilmesi, duvar duvara yapılması, sıvalı sekiler, fırın ve ocak, boğa boynuzları ve duvar resimleri kazıdan bilinir; burada gösterilen ise belirli bir kazılmış ev grubunun planı değil, o türden bir kümedir. Bu model hazırlanırken kaynaklara erişilemedi; nüfus aralığı bellekteki yayınlanmış değerdir ve doğrulanmalıdır. Odaların boyu (yaklaşık 5 × 4,4 m), duvar kalınlığı ve yüksekliği, sekilerin yüksekliği, dam deliklerinin yeri ve damların düzeyleri orantıdır. Duvar resimleri gerçek resimlerin kopyası değildir: kırmızı geometrik pano ile boğa ve avcılar sahnesi, Çatalhöyük'te bulunan türden resimlerin bu uygulamada yeniden çizilmiş benzerleridir. Yazı yoktu; modelde yazı yoktur.",
      "That the houses were entered from the roof, built wall against wall, and had plastered platforms, an oven and hearth, bulls' horns and wall paintings is known from excavation; what is shown is a cluster of that kind, not the plan of a particular excavated group. The sources could not be reached while this model was made; the population range is the published figure as remembered and should be checked. The room size (about 5 × 4.4 m), the thickness and height of the walls, the height of the platforms, the place of the roof holes and the levels of the roofs are proportion. The paintings are not copies: the red geometric panel and the bull among hunters are this app's redrawings of the kinds of painting found at Çatalhöyük. There was no writing, and the model has none.",
    ),
    hotspots: [
      spot(
        [0.9, 3.7, -2.33],
        "Damdaki giriş",
        "The way in through the roof",
        "Eve damdaki bir delikten, merdivenle inilirdi; dumanın çıktığı yer de burasıydı.",
        "You came down into the house by a ladder through a hole in the roof, which was also where the smoke went out.",
      ),
      spot(
        [5.88, 3.8, 1.5],
        "Sokak yerine damlar",
        "Roofs for streets",
        "Sokak yoktu: komşular damların üstünden birbirine giderdi.",
        "There were no streets: neighbours crossed from roof to roof.",
      ),
      spot(
        [-0.8, 0.9, -9.6],
        "Fırın ve ocak",
        "Oven and hearth",
        "Güney duvarında, merdivenin dibinde kubbeli fırın ve önünde ocak.",
        "The domed oven against the south wall at the foot of the ladder, and the hearth before it.",
      ),
      spot(
        [1.5, 0.7, -6.4],
        "Sekiler",
        "The platforms",
        "Beyaz sıvalı sekiler; ölüler bunların altına gömülürdü.",
        "White-plastered platforms; the dead were buried beneath them.",
      ),
      spot(
        [2.3, 1.9, -8.2],
        "Boğa boynuzları",
        "Bulls' horns",
        "Yaban boğalarının sıvayla kaplanmış başları ve boynuzları duvara ve sekilere yerleştirilirdi.",
        "The plastered heads and horns of wild bulls were set into the walls and platforms.",
      ),
      spot(
        [-2.3, 1.7, -8.1],
        "Duvar resimleri",
        "Wall paintings",
        "Beyaz sıva üstüne kırmızı ve siyah: geometrik desenler, büyük bir boğa ve çevresinde küçük avcılar.",
        "Red and black on white plaster: geometric patterns, and a great bull ringed by small hunters.",
      ),
      spot(
        [5.88, 0.6, -7.03],
        "Avlu",
        "The yard",
        "Terk edilmiş bir evin yeri; kül ve çöp buraya atılırdı.",
        "Where a house had stood empty; ash and rubbish were thrown here.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "%C3%87atalh%C3%B6y%C3%BCk",
        "Wikipedia (İngilizce): Çatalhöyük",
        "Wikipedia: Çatalhöyük",
      ),
    ],
    model: {
      kind: "neolithic-town",
      houses: 11,
      roomWidth: 5,
      roomDepth: 4.4,
      storeDepth: 1.4,
      wallHeight: 2.8,
      wallThickness: 0.35,
      platformHeight: 0.3,
    },
  },
  {
    id: "ani-katedrali",
    siteSlug: "ani",
    structure: l("Ani Katedrali", "Ani Cathedral"),
    title: l("Ani Katedrali ve kent surları", "The Cathedral of Ani and the city walls"),
    blurb: l(
      "Mimar Trdat'ın 989–1001 yılları arasında yaptığı kubbeli bazilika, 1319 depreminde çöken kasnağı ve kubbesiyle: dışta düz bir dikdörtgen, haçın kolları yalnızca çatıların alınlıklarında görünür. Dört cepheyi ince çift sütunçeler üstünde yükselen kör kemerler dolaşır, derin üçgen nişler duvarlara oyulmuştur. Arkada, yuvarlak kuleli çift surun bir parçası.",
      "The domed basilica the architect Trdat built between 989 and 1001, with the drum and dome that fell in the earthquake of 1319: a plain rectangle outside, the arms of its cross showing only in the gables of the roofs. A blind arcade of tall arches on slender paired shafts runs round all four sides, and deep triangular niches are cut into the walls. Behind it, a stretch of the city's double wall with its round towers.",
    ),
    period: l("Bagratlı Ermeni krallığı, 989–1001", "Bagratid Armenian kingdom, 989–1001"),
    measures: [
      {
        value: 3,
        unit: "count",
        label: l("Kapı: batı, kuzey ve güney", "Doors: west, north and south"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Kubbe ve kasnağı 1319 depreminde çöktü; model onları yerinde gösterir, ama biçimleri ve yükseklikleri (kasnak çapı 10,4 m, yüksekliği 6,5 m, külah 5 m) Ermeni kiliselerinin benzerlerinden alınmış orantılardır. Bu model hazırlanırken kaynaklara erişilemedi; yapının boyu (34 m), eni (21,5 m), saçak (14 m) ve alınlık (18,5 m) yükseklikleri bellekteki değerlerdir ve doğrulanmalıdır. Nişlerin ve pencerelerin yeri ve sayısı, kör kemerlerin aralığı ve kapı çerçeveleri yaklaşıktır. Kraliçe Katranide'nin güney cephedeki inşa kitabesi modelde yazılı değildir: Ermeni harfleri bu uygulamanın yazı çiziminde yoktur ve metin doğrulanamadı. İç mekân modellenmemiştir. Surlar katedralden çok uzaktadır; burada arkaya, yakına konmuşlardır ve ölçüleri tahmindir; kulelerdeki haçlar Ani surlarında bulunan türdendir.",
      "The dome and its drum fell in the earthquake of 1319; the model shows them in place, but their form and heights (a drum 10.4 m across and 6.5 m high, a 5 m cone) are proportion taken from Armenian churches of the kind. The sources could not be reached while this model was made; the length (34 m), width (21.5 m), eave (14 m) and gable (18.5 m) heights are figures as remembered and should be checked. The placing and number of the niches and windows, the spacing of the blind arcade and the door frames are approximate. Queen Katranide's building inscription on the south front is not lettered: the app's lettering has no Armenian script, and the text could not be checked. The interior is not modelled. The walls stand far from the cathedral; here they are set close behind it, and their sizes are estimates; the crosses on the towers are of the kind set into Ani's walls.",
    ),
    hotspots: [
      spot(
        [0, 22, -5.7],
        "Kasnak ve kubbe",
        "Drum and dome",
        "1319 depreminde çöktü; model onu yerinde gösterir.",
        "It fell in the earthquake of 1319; the model shows it in place.",
      ),
      spot(
        [0, 6.5, -17.6],
        "Batı kapısı",
        "The west door",
        "Üç kapının en büyüğü; kapı batı, kuzey ve güneyde.",
        "The largest of three doors, on the west, north and south.",
      ),
      spot(
        [-11.2, 8, -8],
        "Kör kemerler",
        "The blind arcade",
        "Dört cepheyi dolaşan, ince çift sütunçeler üstünde yüksek kemerler.",
        "Tall arches on slender paired shafts running round all four fronts.",
      ),
      spot(
        [3.6, 5, 17.5],
        "Üçgen nişler",
        "The triangular niches",
        "Duvara oyulmuş derin nişler, içerideki duvarların dış duvara kavuştuğu yeri belli eder.",
        "Deep niches cut into the wall mark where the inner walls meet the outer ones.",
      ),
      spot(
        [0, 19.2, -14],
        "Haç planlı çatılar",
        "The roofs of the cross",
        "Dışarıdan dikdörtgen olan yapının haç planı çatılarda görünür.",
        "The cross of the plan, hidden in the rectangle of the walls, shows in the roofs.",
      ),
      spot(
        [0, 9, 41],
        "Çift sur",
        "The double wall",
        "Yüksek iç sur, önünden çıkan yuvarlak kuleler ve dışta alçak ön sur.",
        "The high inner wall with its round towers, and the lower outer wall beyond.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Cathedral_of_Ani",
        "Wikipedia (İngilizce): Cathedral of Ani",
        "Wikipedia: Cathedral of Ani",
      ),
    ],
    model: {
      kind: "medieval-cathedral",
      portals: 3,
      length: 34,
      width: 21.5,
      eaveHeight: 14,
      gableHeight: 18.5,
      drumDiameter: 10.4,
      drumHeight: 6.5,
      coneHeight: 5,
      wallLength: 80,
      wallTowers: 4,
    },
  },
  {
    id: "pompeii-kenti",
    siteSlug: "pompeii",
    structure: l("Kent planı", "The City Plan"),
    title: l("Pompeii", "The City of Pompeii"),
    blurb: l(
      "MS 79'da Vezüv'ün patlamasıyla ölen kentin duvarları, freskleri ve evleri ayakta bırakır; forum, Capitolium, basilika, Apollo Tapınağı, iki tiyatrosu ve amfitiyatrosu tek bir planda.",
      "The city of Pompeii as it stood when Vesuvius buried it: walls, frescoes and houses left standing, the forum, the Capitolium, the basilica, the Temple of Apollo, two theatres and the amphitheatre in one pattern.",
    ),
    period: l("MÖ 6. - MS 79", "6th century BC - AD 79"),
    measures: [
      {
        value: 135,
        unit: "m",
        label: l("Amfitiyatrosunun oval ölçüü", "Amphitheatre: its oval"),
        source: "wiki-amfi",
      },
      {
        value: 67,
        unit: "m",
        label: l("Amfitiyatrosunun arenası", "Amphitheatre: arena length"),
        source: "wiki-amfi",
      },
      {
        value: 6,
        unit: "count",
        label: l("Capitolium'daki sütun sayısı", "Capitolium: column count"),
        source: "wiki-cap",
      },
      {
        value: 34,
        unit: "m",
        label: l("Basilikasin genişi", "Basilica: width"),
        source: "wiki-bas",
      },
    ],
    uncertainty: l(
      "Kentin sur duvarları plan üzerindeki konumları HD betiğinden okunur; forumun kare ölçüesi kanık olarak okunmaz, tahmin. Evlerin ve sokaklarını yerleri tahmin.",
      "The city's walls are read off from their places on the plan in the HD script; the forum's square is not directly measurable, it is estimated. The houses and the streets are estimates.",
    ),
    hotspots: [
      spot(
        [0, 16, -64],
        "Capitolium",
        "The Capitolium",
        "Forumun tam merkezinde MS 2. yüzyılda Lucius Iulius Collatinus tarafından yaptırılan tanrı evi; forumun karnında.",
        "At the very centre of the forum, built there in the second century AD by Lucius Iulius Collatinus: the god's house of the forum.",
      ),
      spot(
        [24, 9, -2],
        "Basilika",
        "The Basilica",
        "Ticaret, yargı ve kamu işleri için kullanılan iki katlı basilika; MS 2. yüzyılda yaptırıldı.",
        "The two-storey basilica for commerce, law and public business, built in the second century AD.",
      ),
      spot(
        [170, 18, 98],
        "Amfitiyatrosu",
        "The Amphitheatre",
        "MS 70'de inşa edilmiş, MS 79 Vesuv patlamasından önce ayakta kalan antik dunyanın en eski amfitiyatrosu.",
        "Built around AD 70 and still standing when Vesuvius erupted in AD 79: the oldest stone amphitheatre of antiquity.",
      ),
    ],
    sources: [
      {
        key: "wiki-amfi",
        title: l(
          "Wikipedia (English): Amphitheatre of Pompeii",
          "Wikipedia: Amphitheatre of Pompeii",
        ),
        url: "https://en.wikipedia.org/wiki/Amphitheatre_of_Pompeii",
      },
      {
        key: "wiki-cap",
        title: l("Wikipedia (English): Pompeii", "Wikipedia: Pompeii"),
        url: "https://en.wikipedia.org/wiki/Pompeii",
      },
      {
        key: "wiki-bas",
        title: l("Wikipedia (English): Pompeii", "Wikipedia: Pompeii"),
        url: "https://en.wikipedia.org/wiki/Pompeii",
      },
    ],
    model: {
      kind: "city",
      radius: 420,
      places: [
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 17,
            columnHeight: 12,
            columnDiameter: 1.2,
            porchDepth: 4,
            cellaDepth: 20,
            podiumHeight: 3,
            entablatureHeight: 3,
          },
          at: [0, -70],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 34,
            facadeHeight: 15,
            lowerColumns: 4,
            steps: 3,
            doors: 1,
            porchDepth: 3,
            hallWidth: 26,
            hallDepth: 8,
            apseWidth: 6,
            nicheHeight: 2.5,
            wallHeight: 5,
            lowerOrderHeight: 7,
            upperColumns: 4,
            columnDiameter: 1,
            inscribed: false,
          },
          at: [40, 0],
          rotate: 90,
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 14,
            columnHeight: 10,
            columnDiameter: 1.1,
            porchDepth: 3,
            cellaDepth: 14,
            podiumHeight: 2,
            entablatureHeight: 2,
          },
          at: [-55, 30],
          rotate: -90,
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 60,
            orchestraDiameter: 22,
            scaenaeHeight: 12,
            seatTread: 0.72,
            seatRise: 0.42,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 7,
            lowerRows: 13,
            upperRows: 12,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [-90, 90],
        },
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 135,
            outerWidth: 104,
            arenaLength: 67,
            arenaWidth: 35,
            wallHeight: 21,
            rows: 24,
            tiers: 2,
            seatRise: 0.24,
            seatTread: 0.65,
            podiumHeight: 3.2,
            bays: 60,
            outerWall: "low",
            stone: "limestone",
          },
          at: [170, 150],
        },
      ],
      walls: {
        length: 1100,
        width: 850,
        height: 8,
        thickness: 3,
        towers: 20,
        gates: 7,
        gateWidth: 12,
      },
      streets: [
        [-40, -60, -90, 50, 8],
        [-60, -60, 95, 100, 8],
        [40, -60, 40, -25, 6],
      ],
      hill: { angle: 270, distance: 900, height: 500, radius: 260 },
      viewpoint: { at: [0, 90], look: [0, 12, -120] },
    },
  },
  {
    id: "eboracum-kenti",
    siteSlug: "eboracum",
    structure: l("Kent planı", "The City Plan"),
    title: l("Eboracum", "Eboracum (York)"),
    blurb: l(
      "MS 71'de Britanya'ya kurulan en böyük garnizonun sur planı: VI. Victrix lejyonu, ordunun suyunu, hamamini ve karargahını barındıran kale ve evler.",
      "The fortress plan of the largest garrison Rome ever built in Britain: the walls, houses and the VIth Victrix carrying the army's water, baths and headquarters.",
    ),
    period: l("MS 71 - MS 5. yüzyıl", "AD 71 - 5th century AD"),
    measures: [
      {
        value: 60,
        unit: "m",
        label: l("Karargah: genişi", "Headquarters: width"),
        source: "wiki-eb",
      },
      {
        value: 6,
        unit: "count",
        label: l("Kale: kule sayısı", "Fortress: tower count"),
        source: "wiki-eb",
      },
    ],
    uncertainty: l(
      "Ordunun su yolu kalenin içi ile dışı arasında planlanırdı; hamam ve karargahının ince duvarları plan üzerinden okunmaz, tahmin.",
      "The army's water course is planned between the fortress and the town; the baths and the headquarters are read off thin walls, estimated.",
    ),
    hotspots: [
      spot(
        [0, 12, -10],
        "Karargah",
        "The headquarters",
        "Ordunun karargahında ticaret, yargı ve askeri idari; MS 120'ler.",
        "The headquarters of the army's administration, commerce, law and military command; AD 120s.",
      ),
      spot(
        [0, 10, -70],
        "Kale",
        "The fortress",
        "VI. Victrix lejyonunun surları; MS 71'den MS 410'a kadar ayakta.",
        "The walls of the VIth Victrix, standing from AD 71 to AD 410.",
      ),
    ],
    sources: [
      {
        key: "wiki-eb",
        title: l("Wikipedia (English): Eboracum", "Wikipedia: Eboracum"),
        url: "https://en.wikipedia.org/wiki/Eboracum",
      },
    ],
    model: {
      kind: "city",
      radius: 320,
      places: [
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 60,
            facadeHeight: 14,
            lowerColumns: 6,
            steps: 2,
            doors: 1,
            porchDepth: 6,
            hallWidth: 42,
            hallDepth: 16,
            apseWidth: 8,
            nicheHeight: 4,
            wallHeight: 6,
            lowerOrderHeight: 8,
            upperColumns: 6,
            columnDiameter: 1.2,
            inscribed: false,
          },
          at: [0, 30],
          rotate: 0,
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 1,
            facadeWidth: 12,
            columnHeight: 9,
            columnDiameter: 1.1,
            porchDepth: 3,
            cellaDepth: 10,
            podiumHeight: 2,
            entablatureHeight: 2,
          },
          at: [0, -85],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 40,
            facadeHeight: 12,
            lowerColumns: 4,
            steps: 2,
            doors: 1,
            porchDepth: 4,
            hallWidth: 28,
            hallDepth: 10,
            apseWidth: 6,
            nicheHeight: 2.5,
            wallHeight: 5,
            lowerOrderHeight: 7,
            upperColumns: 4,
            columnDiameter: 1,
            inscribed: false,
          },
          at: [0, -10],
          rotate: 180,
        },
      ],
      walls: {
        length: 700,
        width: 600,
        height: 9,
        thickness: 4,
        towers: 6,
        gates: 4,
        gateWidth: 14,
      },
      streets: [
        [-38, -110, -38, 60, 8],
        [-38, -60, 90, -60, 8],
      ],
      viewpoint: { at: [0, 60], look: [0, 10, -80] },
    },
  },
  {
    id: "nimes-kenti",
    siteSlug: "nimes",
    structure: l("Kent planı", "The City Plan"),
    title: l("Nimes", "Nimes"),
    blurb: l(
      "MS 1. yüzyıl yılda Augustus'un Galya kolonisi olan Nimes'in en belirgin bölünülmeleri: 24.000 seyirci kapasiteli arena, Maison Carrée ve kenti sulayan Pont du Gard.",
      "The most striking remains of Nimes, Augustus's colony in Gaul: a 24,000-seat arena, the Maison Carrée and the Pont du Gard aqueduct that fed it.",
    ),
    period: l("M.Ö. 1. - MS 5. yüzyıl", "1st century BC - 5th century AD"),
    measures: [
      {
        value: 133,
        unit: "m",
        label: l("Amfitiyatrosunun oval ölçüü", "Amphitheatre: its oval"),
        source: "wiki-amfi-n",
      },
      {
        value: 69,
        unit: "m",
        label: l("Amfitiyatrosunun arenası", "Amphitheatre: arena length"),
        source: "wiki-amfi-n",
      },
      {
        value: 26,
        unit: "m",
        label: l("Maison Carrée'nin genişi", "Maison Carrée: width"),
        source: "wiki-maison",
      },
    ],
    uncertainty: l(
      "Arena tabanına kazınma yerleri, MS 90'ların Titus imparatorluğu ile ilişi olarak tahmin. Arenanın kapasitesi koltuk sayısı ile hesaplandı.",
      "The arena floor's excavations belong to Titus's age and are estimated. The capacity comes from the row count.",
    ),
    hotspots: [
      spot(
        [0, 20, 40],
        "Arena",
        "The arena",
        "133 x 101 metrelik oval, MS 90'lar Titus tarafından inşa edilen, MS 5. yüzyıl ile ilişi.",
        "The 133 by 101 metre oval, built by Titus in the 90s AD, in the fifth century.",
      ),
      spot(
        [0, 23, 128],
        "Maison Carrée",
        "The Maison Carrée",
        "MS 19'da Augustus'un torunları için inşa edilen, 26 x 13 metrelik dikgen tapınak.",
        "Built in AD 19 for Augustus's grandsons, the 26 by 13 metre temple.",
      ),
    ],
    sources: [
      {
        key: "wiki-amfi-n",
        title: l("Wikipedia (English): Nimes Arena", "Wikipedia: Nimes Arena"),
        url: "https://en.wikipedia.org/wiki/Nimes_Arena",
      },
      {
        key: "wiki-maison",
        title: l("Wikipedia (English): Maison Carrée", "Wikipedia: Maison Carrée"),
        url: "https://en.wikipedia.org/wiki/Maison_Carr%C3%A9e",
      },
    ],
    model: {
      kind: "city",
      radius: 340,
      places: [
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 133,
            outerWidth: 101,
            arenaLength: 69,
            arenaWidth: 38,
            wallHeight: 21,
            rows: 24,
            tiers: 2,
            seatRise: 0.24,
            seatTread: 0.6,
            podiumHeight: 3,
            bays: 60,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [0, 40],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 26,
            columnHeight: 17,
            columnDiameter: 1.2,
            porchDepth: 4,
            cellaDepth: 12,
            podiumHeight: 2.5,
            entablatureHeight: 2.5,
          },
          at: [0, 130],
          rotate: 180,
        },
        {
          spec: {
            kind: "aqueduct",
            arches: 22,
            archHeight: 20,
            towerSide: 3,
            towerHeight: 18,
            span: 12,
            pier: 2,
            width: 3.4,
          },
          at: [-160, -60],
        },
      ],
      walls: {
        length: 900,
        width: 700,
        height: 8,
        thickness: 2.5,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [75, -60, 75, 140, 8],
        [-60, -30, 80, -30, 8],
      ],
      viewpoint: { at: [0, -30], look: [0, 10, 40] },
    },
  },
  {
    id: "trier-kenti",
    siteSlug: "trier",
    structure: l("Kent planı", "The City Plan"),
    title: l("Augusta Treverorum", "Augusta Treverorum (Trier)"),
    blurb: l(
      "MS 16'da kurulan ve MS 4. yüzyıl başlında Batı Roma baskentine dönen Augusta Treverorum'un planı: Porta Nigra, amfitiyatro, Konstantin Bazilikası ve imparatorluk hamamları.",
      "The plan of Augusta Treverorum, founded in Gaul around 16 BC and made the capital of the western empire in AD 4: the Porta Nigra, the amphitheatre, the Basilica of Constantine and the imperial baths.",
    ),
    period: l("M.Ö. 16 - MS 5. yüzyıl", "16 BC - 5th century AD"),
    measures: [
      {
        value: 145,
        unit: "m",
        label: l("Amfitiyatrosunun oval ölçüü", "Amphitheatre: its oval"),
        source: "wiki-amfi-t",
      },
      {
        value: 67,
        unit: "m",
        label: l("Konstantin Bazilikasinin genişi", "Basilica: width"),
        source: "wiki-bas-t",
      },
      {
        value: 2,
        unit: "count",
        label: l("Porta Nigra'daki giris sayısı", "Porta Nigra: number of openings"),
        source: "wiki-porta",
      },
    ],
    uncertainty: l(
      "Amfitiyatronun tabanına kazınma yerleri, MS 2. yüzyıl Titus imparatorluğu ile ilişi; Konstantin Bazilikasının planı MS 4. yüzyıl imparatorluğu ile ilgilidir.",
      "The amphitheatre's floor excavations belong to Titus's age; the basilica's plan belongs to the fourth-century empire.",
    ),
    hotspots: [
      spot(
        [0, 31, -300],
        "Porta Nigra",
        "The Porta Nigra",
        "MS 100 civarında Roma kolonisine yaptırılan sur kapısı; MS 4. yüzyılinde Batı Roma baskentine dönüştü.",
        "The city gate built for a Roman colony around the first century AD; it became the capital of the western empire in the fourth century AD.",
      ),
      spot(
        [240, 20, 40],
        "Amfitiyatrosu",
        "The amphitheatre",
        "MS 2. yüzyıl Titus imparatorluğu tarafından inşa edilen amfitiyatro; MS 4. yüzyıl depremi sonrasında tabanına kazınmışlar var.",
        "The amphitheatre built by Titus in the second century AD; later ruin shows on the arena floor.",
      ),
    ],
    sources: [
      {
        key: "wiki-amfi-t",
        title: l("Wikipedia (English): Trier Amphitheatre", "Wikipedia: Trier Amphitheatre"),
        url: "https://en.wikipedia.org/wiki/Trier_Amphitheatre",
      },
      {
        key: "wiki-bas-t",
        title: l("Wikipedia (English): Aula Palatina", "Wikipedia: Aula Palatina"),
        url: "https://en.wikipedia.org/wiki/Aula_Palatina",
      },
      {
        key: "wiki-porta",
        title: l("Wikipedia (English): Porta Nigra", "Wikipedia: Porta Nigra"),
        url: "https://en.wikipedia.org/wiki/Porta_Nigra",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 2,
            archSpan: 12,
            archHeight: 12,
            totalHeight: 30,
            entablatureHeight: 6,
            columnHeight: 9,
            columnDiameter: 1.2,
            columnsPerFace: 2,
            pierWidth: 2,
            depth: 6,
          },
          at: [0, -300],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 145,
            outerWidth: 120,
            arenaLength: 75,
            arenaWidth: 50,
            wallHeight: 16,
            rows: 26,
            tiers: 2,
            seatRise: 0.22,
            seatTread: 0.58,
            podiumHeight: 2.8,
            bays: 60,
            outerWall: "low",
            stone: "limestone",
          },
          at: [240, 40],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 67,
            facadeHeight: 33,
            lowerColumns: 8,
            steps: 4,
            doors: 1,
            porchDepth: 8,
            hallWidth: 50,
            hallDepth: 30,
            apseWidth: 12,
            nicheHeight: 6,
            wallHeight: 15,
            lowerOrderHeight: 18,
            upperColumns: 8,
            columnDiameter: 1.6,
            inscribed: false,
          },
          at: [0, 60],
          rotate: 90,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 10,
        thickness: 3,
        towers: 16,
        gates: 6,
        gateWidth: 12,
      },
      streets: [
        [0, -200, 0, -60, 8],
        [0, -60, 160, 40, 8],
      ],
      viewpoint: { at: [0, 100], look: [0, 14, -260] },
    },
  },
  {
    id: "emerita-augusta-kenti",
    siteSlug: "emerita-augusta",
    structure: l("Kent planı", "The City Plan"),
    title: l("Emerita Augusta", "Emerita Augusta (Mérida)"),
    blurb: l(
      "MÖ 25'te kurulan Lusitania eyalet başkenti: 86 metrelik iki katlı Roma tiyatrosu, Diana Tapınağı, amfitiyatro ve Guadiana köprüsü.",
      "The Roman capital of Lusitania: its 86-metre two-tier theatre, Temple of Diana, amphitheatre and the long bridge over the Guadiana.",
    ),
    period: l("MÖ 25 - MS 5. yüzyıl", "25 BC - 5th century AD"),
    measures: [
      {
        value: 86,
        unit: "m",
        label: l("Roma Tiyatrosu: cavea çapı", "Theatre: cavea diameter"),
        source: "wiki-merida-theatre",
      },
      {
        value: 64,
        unit: "m",
        label: l("Amfitiyatro: arena uzunluğu", "Amphitheatre: arena length"),
        source: "wiki-merida-amphi",
      },
      {
        value: 20,
        unit: "m",
        label: l("Diana Tapınağı: cephe genişliği", "Temple of Diana: facade width"),
        source: "wiki-merida-diana",
      },
    ],
    uncertainty: l(
      "Tiyatro ve amfitiyatronun plan üzerindeki konumları arkeolojik kazı rölövelerinden alınmıştır; Roma köprüsünün kente bağlandığı kapı ve ara sokaklar tahmindir.",
      "The locations of the theatre and amphitheatre on the plan are based on excavation surveys; the gate where the bridge meets the city and the side streets are estimates.",
    ),
    hotspots: [
      spot(
        [80, 14, 60],
        "Roma Tiyatrosu",
        "The Roman Theatre",
        "MÖ 16'da Agrippa tarafından yaptırılan iki katlı mermer scaenae frons cepheli tiyatro.",
        "The two-tier marble theatre erected around 16 BC under Marcus Agrippa.",
      ),
      spot(
        [200, 16, 90],
        "Amfitiyatro",
        "The Amphitheatre",
        "MÖ 8'de açılan, gladyatör ve vahşi hayvan dövüşlerine ev sahipliği yapan arena.",
        "Opened in 8 BC to host gladiatorial combats and wild beast hunts.",
      ),
      spot(
        [-90, 12, -50],
        "Diana Tapınağı",
        "The Temple of Diana",
        "Kentin forumunda yükselen altı sütunlu mermer imparatorluk kültü tapınağı.",
        "The hexastyle Corinthian temple of the imperial cult crowning the municipal forum.",
      ),
    ],
    sources: [
      {
        key: "wiki-merida-theatre",
        title: l("Wikipedia: Roman Theatre of Mérida", "Wikipedia: Roman Theatre of Mérida"),
        url: "https://en.wikipedia.org/wiki/Roman_Theatre_of_M%C3%A9rida",
      },
      {
        key: "wiki-merida-amphi",
        title: l("Wikipedia: Mérida Amphitheatre", "Wikipedia: Mérida Amphitheatre"),
        url: "https://en.wikipedia.org/wiki/Emerita_Augusta",
      },
      {
        key: "wiki-merida-diana",
        title: l("Wikipedia: Temple of Diana, Mérida", "Wikipedia: Temple of Diana, Mérida"),
        url: "https://en.wikipedia.org/wiki/Emerita_Augusta",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 86,
            orchestraDiameter: 26,
            scaenaeHeight: 16,
            seatTread: 0.75,
            seatRise: 0.44,
            podiumHeight: 1.4,
            stageDepth: 8,
            stairways: 8,
            lowerRows: 14,
            upperRows: 12,
            character: {
              stone: "marble",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 2,
              topGallery: true,
            },
          },
          at: [80, 60],
        },
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 126,
            outerWidth: 102,
            arenaLength: 64,
            arenaWidth: 41,
            wallHeight: 18,
            rows: 22,
            tiers: 2,
            seatRise: 0.24,
            seatTread: 0.62,
            podiumHeight: 2.8,
            bays: 56,
            outerWall: "low",
            stone: "limestone",
          },
          at: [200, 90],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 20,
            columnHeight: 12,
            columnDiameter: 1.2,
            porchDepth: 5,
            cellaDepth: 24,
            podiumHeight: 3,
            entablatureHeight: 3,
          },
          at: [-90, -50],
          rotate: 180,
        },
      ],
      walls: {
        length: 900,
        width: 750,
        height: 8,
        thickness: 3,
        towers: 18,
        gates: 6,
        gateWidth: 12,
      },
      streets: [
        [0, -140, 0, 140, 8],
        [-140, 0, 140, 0, 8],
      ],
      viewpoint: { at: [0, 80], look: [80, 14, 60] },
    },
  },
  {
    id: "italica-kenti",
    siteSlug: "italica",
    structure: l("Kent planı", "The City Plan"),
    title: l("Italica", "The City of Italica"),
    blurb: l(
      "İmparator Trajan ve Hadrianus'un memleketi: 156 metrelik devasa Roma amfitiyatrosu, Traianeum tapınağı ve mermer caddeler.",
      "Birthplace of emperors Trajan and Hadrian: a colossal 156-metre amphitheatre, the Traianeum and broad colonnades.",
    ),
    period: l("MÖ 206 - MS 4. yüzyıl", "206 BC - 4th century AD"),
    measures: [
      {
        value: 156,
        unit: "m",
        label: l("Amfitiyatro: dış uzunluk", "Amphitheatre: outer length"),
        source: "wiki-italica-amphi",
      },
      {
        value: 71,
        unit: "m",
        label: l("Amfitiyatro: arena uzunluğu", "Amphitheatre: arena length"),
        source: "wiki-italica-amphi",
      },
      {
        value: 28,
        unit: "m",
        label: l("Traianeum: cephe genişliği", "Traianeum: facade width"),
        source: "wiki-italica-trajan",
      },
    ],
    uncertainty: l(
      "Amfitiyatronun planı ve boyutları tam kazı ölçümlerine dayanır; Hadrianus döneminde genişleyen yeni kentin konut adaları ve sütunlu caddeleri orantılı tahmindir.",
      "The amphitheatre plan and dimensions are grounded in full archaeological excavation; the residential blocks and colonnades of Hadrian's Nova Urbs are proportioned estimates.",
    ),
    hotspots: [
      spot(
        [150, 18, 90],
        "Büyük Amfitiyatro",
        "The Grand Amphitheatre",
        "25.000 seyirci kapasiteli, İmparatorluğun en büyük üçüncü amfitiyatrosu.",
        "Seating 25,000 spectators, the third largest arena in the Roman Empire.",
      ),
      spot(
        [-120, 15, -60],
        "Traianeum Tapınağı",
        "The Traianeum Temple",
        "Hadrianus'un evlatlık babası tanrılaştırılmış Trajan için yaptırdığı dev tapınak.",
        "The grand octastyle sanctuary dedicated by Hadrian to his deified adoptive father Trajan.",
      ),
      spot(
        [0, 10, 0],
        "Cardo Maximus",
        "The Cardo Maximus",
        "Mozaikli aristokrat konaklarının arasından geçen sütunlu geniş cadde.",
        "The paved colonnaded avenue running between mosaic-floored aristocrat villas.",
      ),
    ],
    sources: [
      {
        key: "wiki-italica-amphi",
        title: l("Wikipedia: Italica Amphitheatre", "Wikipedia: Italica"),
        url: "https://en.wikipedia.org/wiki/Italica",
      },
      {
        key: "wiki-italica-trajan",
        title: l("Wikipedia: Traianeum (Italica)", "Wikipedia: Italica"),
        url: "https://en.wikipedia.org/wiki/Italica",
      },
    ],
    model: {
      kind: "city",
      radius: 400,
      places: [
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 156,
            outerWidth: 130,
            arenaLength: 71,
            arenaWidth: 48,
            wallHeight: 22,
            rows: 28,
            tiers: 3,
            seatRise: 0.24,
            seatTread: 0.65,
            podiumHeight: 3.2,
            bays: 64,
            outerWall: "low",
            stone: "limestone",
          },
          at: [150, 90],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 8,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 28,
            columnHeight: 14,
            columnDiameter: 1.4,
            porchDepth: 6,
            cellaDepth: 32,
            podiumHeight: 3.5,
            entablatureHeight: 3.5,
          },
          at: [-120, -60],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 44,
            facadeHeight: 16,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 36,
            hallDepth: 14,
            apseWidth: 8,
            nicheHeight: 3,
            wallHeight: 8,
            lowerOrderHeight: 8,
            upperColumns: 6,
            columnDiameter: 1.1,
            inscribed: false,
          },
          at: [-100, 80],
          rotate: 90,
        },
      ],
      walls: {
        length: 950,
        width: 800,
        height: 9,
        thickness: 3,
        towers: 20,
        gates: 6,
        gateWidth: 12,
      },
      streets: [
        [0, -140, 0, 140, 8],
        [-140, 0, 140, 0, 8],
      ],
      viewpoint: { at: [0, 90], look: [150, 18, 40] },
    },
  },
  {
    id: "delfi-kenti",
    siteSlug: "delfi",
    structure: l("Kent planı", "The City Plan"),
    title: l("Delfi", "The Sanctuary of Delphi"),
    blurb: l(
      "Parnassos Dağı'nın yamacında Apollon kâhini: Apollon Tapınağı, Kutsal Yol, antik dağ tiyatrosu ve dağ stadyumu.",
      "The oracle of Apollo on Mount Parnassus: the Temple of Apollo, Sacred Way, mountain theatre and stadium.",
    ),
    period: l("MÖ 6. - MS 4. yüzyıl", "6th century BC - 4th century AD"),
    measures: [
      {
        value: 22,
        unit: "m",
        label: l("Apollon Tapınağı: cephe genişliği", "Temple of Apollo: facade width"),
        source: "wiki-delphi-temple",
      },
      {
        value: 54,
        unit: "m",
        label: l("Antik Tiyatro: cavea çapı", "Theatre: cavea diameter"),
        source: "wiki-delphi-theatre",
      },
      {
        value: 178,
        unit: "m",
        label: l("Delfi Stadyumu: pist uzunluğu", "Stadium: track length"),
        source: "wiki-delphi-stadium",
      },
    ],
    uncertainty: l(
      "Apollon Tapınağı ve dağ tiyatrosunun teras kotları Fransız Arkeoloji Enstitüsü rölövelerine dayanır; kutsal alandaki hazine binalarının ve adak heykellerinin tam dağılımı tahmindir.",
      "The terrace elevations of the Apollo Temple and theatre follow French Archaeological School surveys; the detailed distribution of treasuries and votive bronzes is estimated.",
    ),
    hotspots: [
      spot(
        [-60, 16, -30],
        "Apollon Tapınağı",
        "The Temple of Apollo",
        "Pythia'nın defne yaprakları yakarak kehanetlerde bulunduğu ulu Dor tapınağı.",
        "The monumental Doric temple where Pythia delivered oracular prophecies.",
      ),
      spot(
        [0, 14, 50],
        "Antik Tiyatro",
        "The Ancient Theatre",
        "Pythian Oyunları'nda müzik ve şiir yarışmalarının düzenlendiği 5.000 kişilik tiyatro.",
        "The 5,000-seat mountain theatre hosting musical and poetic contests of the Pythian Games.",
      ),
      spot(
        [130, 8, 110],
        "Delfi Stadyumu",
        "The Delphi Stadium",
        "Yunanistan'ın en yüksek stadyumu, 178 metrelik koşu pisti.",
        "The highest ancient stadium in Greece, spanning 178 metres along Mount Parnassus.",
      ),
    ],
    sources: [
      {
        key: "wiki-delphi-temple",
        title: l("Wikipedia: Temple of Apollo (Delphi)", "Wikipedia: Delphi"),
        url: "https://en.wikipedia.org/wiki/Delphi",
      },
      {
        key: "wiki-delphi-theatre",
        title: l("Wikipedia: Theatre of Delphi", "Wikipedia: Delphi"),
        url: "https://en.wikipedia.org/wiki/Delphi",
      },
      {
        key: "wiki-delphi-stadium",
        title: l("Wikipedia: Stadium of Delphi", "Wikipedia: Delphi"),
        url: "https://en.wikipedia.org/wiki/Delphi",
      },
    ],
    model: {
      kind: "city",
      radius: 350,
      places: [
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 22,
            columnHeight: 11,
            columnDiameter: 1.8,
            porchDepth: 4,
            cellaDepth: 38,
            podiumHeight: 2.5,
            entablatureHeight: 3,
          },
          at: [-60, -30],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 54,
            orchestraDiameter: 18,
            scaenaeHeight: 8,
            seatTread: 0.7,
            seatRise: 0.42,
            podiumHeight: 1,
            stageDepth: 6,
            stairways: 7,
            lowerRows: 12,
            upperRows: 10,
            character: {
              stone: "limestone",
              ground: "hillside",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [0, 50],
        },
        {
          spec: {
            kind: "stadium",
            overallLength: 178,
            overallWidth: 32,
            rows: 8,
            arenaWidth: 18,
            seatRise: 0.35,
            entrances: 2,
          },
          at: [130, 110],
        },
      ],
      streets: [
        [-100, -80, 0, -80, 6],
        [0, -80, 0, 10, 6],
        [0, 10, 80, 10, 6],
      ],
      hill: { angle: 0, distance: 400, height: 350, radius: 200 },
      viewpoint: { at: [0, 70], look: [-60, 16, -30] },
    },
  },
  {
    id: "olimpiya-kenti",
    siteSlug: "olimpiya",
    structure: l("Kent planı", "The City Plan"),
    title: l("Olimpiya", "The Sanctuary of Olympia"),
    blurb: l(
      "Antik Olimpiyat Oyunları'nın doğduğu kutsal alan: Phidias'ın heykeline ev sahipliği yapan Zeus Tapınağı, Hera Tapınağı ve stadyum.",
      "The sanctuary of the ancient Olympic Games: the Temple of Zeus, Hera's temple and the 192-metre running stadium.",
    ),
    period: l("MÖ 5. - MS 4. yüzyıl", "5th century BC - 4th century AD"),
    measures: [
      {
        value: 27,
        unit: "m",
        label: l("Zeus Tapınağı: cephe genişliği", "Temple of Zeus: facade width"),
        source: "wiki-olympia-zeus",
      },
      {
        value: 192,
        unit: "m",
        label: l("Antik Stadyum: pist uzunluğu", "Olympic Stadium: track length"),
        source: "wiki-olympia-stadium",
      },
      {
        value: 16,
        unit: "m",
        label: l("Hera Tapınağı: cephe genişliği", "Temple of Hera: facade width"),
        source: "wiki-olympia-hera",
      },
    ],
    uncertainty: l(
      "Zeus ve Hera tapınaklarının yerleşimi ve 192 metrelik koşu pisti Alman Arkeoloji Enstitüsü kazı rölövelerine dayanır; kutsal Altis koruluğundaki ağaçlar ve sunaklar tahmindir.",
      "The layout of the temples of Zeus and Hera and the 192-metre stadium track reflect German Archaeological Institute excavations; the sacred Altis groves and secondary altars are estimated.",
    ),
    hotspots: [
      spot(
        [-60, 16, -50],
        "Zeus Tapınağı",
        "The Temple of Zeus",
        "Phidias'ın altın ve fildişi heykeline ev sahipliği yapan ulu Dor tapınağı.",
        "The classical Doric temple that once housed Phidias' chryselephantine Zeus.",
      ),
      spot(
        [120, 10, 20],
        "Antik Stadyum",
        "The Olympic Stadium",
        "Antik dünyanın en hızlı koşucularının yarıştığı 192 metrelik koşu pisti.",
        "The 192-metre sprint track where ancient athletes competed for olive wreaths.",
      ),
      spot(
        [-60, 12, 60],
        "Hera Tapınağı",
        "The Temple of Hera",
        "MÖ 600 civarında inşa edilen Olympia'nın en eski anıtsal tapınağı.",
        "Built around 600 BC, the oldest surviving monumental temple at Olympia.",
      ),
    ],
    sources: [
      {
        key: "wiki-olympia-zeus",
        title: l("Wikipedia: Temple of Zeus, Olympia", "Wikipedia: Olympia"),
        url: "https://en.wikipedia.org/wiki/Temple_of_Zeus,_Olympia",
      },
      {
        key: "wiki-olympia-stadium",
        title: l("Wikipedia: Stadium at Olympia", "Wikipedia: Olympia"),
        url: "https://en.wikipedia.org/wiki/Olympia,_Greece",
      },
      {
        key: "wiki-olympia-hera",
        title: l("Wikipedia: Temple of Hera, Olympia", "Wikipedia: Olympia"),
        url: "https://en.wikipedia.org/wiki/Temple_of_Hera,_Olympia",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 27,
            columnHeight: 10.4,
            columnDiameter: 2.2,
            porchDepth: 5,
            cellaDepth: 44,
            podiumHeight: 3,
            entablatureHeight: 3.5,
          },
          at: [-60, -50],
          rotate: 180,
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 16,
            columnHeight: 8,
            columnDiameter: 1.3,
            porchDepth: 4,
            cellaDepth: 32,
            podiumHeight: 2,
            entablatureHeight: 2.5,
          },
          at: [-60, 60],
          rotate: 180,
        },
        {
          spec: {
            kind: "stadium",
            overallLength: 192,
            overallWidth: 36,
            rows: 6,
            arenaWidth: 22,
            seatRise: 0.3,
            entrances: 2,
          },
          at: [120, 20],
        },
      ],
      streets: [
        [0, -120, 0, 120, 8],
        [0, 0, 70, 0, 8],
      ],
      viewpoint: { at: [0, 70], look: [-60, 16, -50] },
    },
  },
  {
    id: "iskenderiye-kenti",
    siteSlug: "iskenderiye",
    structure: l("Kent planı", "The City Plan"),
    title: l("İskenderiye", "The City of Alexandria"),
    blurb: l(
      "Büyük İskender'in kurduğu metropol: 110 metrelik Pharos Feneri, Serapeum tapınağı ve sütunlu Kanopik Caddesi.",
      "Alexander's metropolis on the Mediterranean: the 110-metre Pharos Lighthouse, the Serapeum and colonnaded Canopic Way.",
    ),
    period: l("MÖ 3. - MS 4. yüzyıl", "3rd century BC - 4th century AD"),
    measures: [
      {
        value: 55,
        unit: "m",
        label: l("İskenderiye Feneri: kaide yüksekliği", "Pharos Lighthouse: base height"),
        source: "wiki-alex-pharos",
      },
      {
        value: 30,
        unit: "m",
        label: l("İskenderiye Feneri: taban genişliği", "Pharos: base width"),
        source: "wiki-alex-pharos",
      },
      {
        value: 24,
        unit: "m",
        label: l("Serapeum: cephe genişliği", "Serapeum: facade width"),
        source: "wiki-alex-serapeum",
      },
    ],
    uncertainty: l(
      "Pharos Feneri'nin kademeli katları ve genel oranları antik nümizmatik kanıtlar ve Arap coğrafyacıların ölçümlerine dayanır; liman rıhtımları ve şehir içi caddeleri tahmindir.",
      "The tiered storeys and proportions of the Pharos follow ancient coin representations and medieval Arab chronicles; the inner harbour quays and street grid are hypothetical.",
    ),
    hotspots: [
      spot(
        [0, 25, -160],
        "İskenderiye Feneri",
        "The Pharos Lighthouse",
        "Antik Dünyanın 7 Harikasından biri, 110 metre yüksekliğinde deniz feneri.",
        "One of the Seven Wonders of the Ancient World, projecting light across the sea.",
      ),
      spot(
        [-50, 16, 40],
        "Serapeum",
        "The Serapeum",
        "Serapis'e adanmış ve Pompey Sütunu'nu barındıran anıtsal tepe tapınağı.",
        "The grand acropolis sanctuary dedicated to Serapis, marked by Pompey's Pillar.",
      ),
      spot(
        [0, 8, -20],
        "Kanopik Caddesi",
        "The Canopic Way",
        "Kenti boydan boya kat eden sütunlu geniş Roma/Ptolemaios anayolu.",
        "The grand paved colonnaded avenue running east-west through the metropolis.",
      ),
    ],
    sources: [
      {
        key: "wiki-alex-pharos",
        title: l("Wikipedia: Lighthouse of Alexandria", "Wikipedia: Lighthouse of Alexandria"),
        url: "https://en.wikipedia.org/wiki/Lighthouse_of_Alexandria",
      },
      {
        key: "wiki-alex-serapeum",
        title: l("Wikipedia: Serapeum of Alexandria", "Wikipedia: Alexandria"),
        url: "https://en.wikipedia.org/wiki/Serapeum_of_Alexandria",
      },
    ],
    model: {
      kind: "city",
      radius: 420,
      places: [
        {
          spec: {
            kind: "lighthouse",
            baseSide: 30,
            baseHeight: 55,
            towerDiameter: 18,
            towerHeight: 55,
            moleLength: 80,
            moleWidth: 20,
          },
          at: [0, -180],
          rotate: 180,
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 24,
            columnHeight: 14,
            columnDiameter: 1.5,
            porchDepth: 5,
            cellaDepth: 28,
            podiumHeight: 4,
            entablatureHeight: 3.5,
          },
          at: [-50, 40],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 40,
            facadeHeight: 18,
            lowerColumns: 6,
            steps: 4,
            doors: 2,
            porchDepth: 4,
            hallWidth: 32,
            hallDepth: 12,
            apseWidth: 8,
            nicheHeight: 3,
            wallHeight: 7,
            lowerOrderHeight: 8,
            upperColumns: 6,
            columnDiameter: 1.1,
            inscribed: false,
          },
          at: [50, 20],
          rotate: -90,
        },
      ],
      walls: {
        length: 1000,
        width: 850,
        height: 10,
        thickness: 3.5,
        towers: 22,
        gates: 6,
        gateWidth: 14,
      },
      streets: [
        [-100, -20, 100, -20, 10],
        [0, -155, 0, 80, 8],
      ],
      viewpoint: { at: [0, 90], look: [0, 50, -180] },
    },
  },
  {
    id: "karnak-kenti",
    siteSlug: "karnak",
    structure: l("Kent planı", "The City Plan"),
    title: l("Karnak Tapınağı", "The Temple Precinct of Karnak"),
    blurb: l(
      "Antik Mısır'ın en büyük dini külliyesi: 134 dev sütunlu Büyük Hipostil Salonu, Amun-Ra pilon kapısı ve kutsal göl.",
      "The colossal sanctuary of Amun-Ra: the Great Hypostyle Hall of 134 stone columns, monumental pylons and sacred lake.",
    ),
    period: l("MÖ 2. binyıl - MÖ 1. yüzyıl", "2nd millennium BC - 1st century BC"),
    measures: [
      {
        value: 102,
        unit: "m",
        label: l("Büyük Hipostil Salonu: genişlik", "Hypostyle Hall: width"),
        source: "wiki-karnak-hall",
      },
      {
        value: 21,
        unit: "m",
        label: l("Hipostil sütunları: tepe yüksekliği", "Central columns: height"),
        source: "wiki-karnak-hall",
      },
      {
        value: 32,
        unit: "m",
        label: l("Pilon Kapısı: toplam yükseklik", "First Pylon: total height"),
        source: "wiki-karnak-pylon",
      },
    ],
    uncertainty: l(
      "Büyük Hipostil Salonu ve pilon kapısının mimari aksı Mısır Eski Eserler Kurumu rölövelerine dayanır; kutsal göl çevresindeki depolar ve koç başlı sfenks dizilimleri tahmindir.",
      "The architectural axis of the Great Hypostyle Hall and monumental pylons draws on Egyptian Antiquities surveys; perimeter storehouses and the sphinx avenue density are estimated.",
    ),
    hotspots: [
      spot(
        [0, 18, -74],
        "Büyük Hipostil Salonu",
        "The Great Hypostyle Hall",
        "134 dev kumtaşı sütunun göğe yükseldiği antik dünyanın en görkemli tapınak salonu.",
        "Supported by 134 colossal columns, the most massive religious hall of antiquity.",
      ),
      spot(
        [0, 22, -110],
        "Birinci Pilon Kapısı",
        "The First Pylon Gate",
        "Nil kıyısından tapınak avlusuna açılan anıtsal Mısır pilon kapısı.",
        "The massive monumental pylon gateway fronting the main processional axis from the Nile.",
      ),
    ],
    sources: [
      {
        key: "wiki-karnak-hall",
        title: l("Wikipedia: Great Hypostyle Hall", "Wikipedia: Karnak"),
        url: "https://en.wikipedia.org/wiki/Karnak",
      },
      {
        key: "wiki-karnak-pylon",
        title: l("Wikipedia: Karnak Pylons", "Wikipedia: Karnak"),
        url: "https://en.wikipedia.org/wiki/Karnak",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "egyptian-pylon",
            facadeWidth: 102,
            pylonHeight: 32,
            pylonDepth: 18,
            portalWidth: 10,
            portalHeight: 20,
            obeliskHeight: 29,
            colossiCount: 2,
            colossusHeight: 14,
            sphinxCount: 16,
            sphinxAvenueLength: 60,
          },
          at: [0, -110],
        },
        {
          spec: {
            kind: "egyptian-hypostyle",
            width: 102,
            depth: 53,
            totalColumns: 134,
            naveColumnHeight: 21,
            sideColumnHeight: 13,
            naveColumnDiameter: 3.6,
            sideColumnDiameter: 2.6,
          },
          at: [0, -74],
        },
      ],
      streets: [
        [-140, -15, -45, -15, 8],
        [45, -15, 140, -15, 8],
      ],
      viewpoint: { at: [0, -150], look: [0, 20, -110] },
    },
  },
  {
    id: "petra-kenti",
    siteSlug: "petra",
    structure: l("Kent planı", "The City Plan"),
    title: l("Petra", "The Rock City of Petra"),
    blurb: l(
      "Kızıl kumtaşı kanyonlarında Nebati başkenti: Al-Khazneh (Hazine), kayaya oyulmuş amfitiyatro ve sütunlu cadde.",
      "The rose-red rock city of the Nabataeans: Al-Khazneh (The Treasury), rock-cut theatre and colonnaded street.",
    ),
    period: l("MÖ 1. yüzyıl - MS 2. yüzyıl", "1st century BC - 2nd century AD"),
    measures: [
      {
        value: 39,
        unit: "m",
        label: l("Al-Khazneh: cephe yüksekliği", "Al-Khazneh: facade height"),
        source: "wiki-petra-khazneh",
      },
      {
        value: 25,
        unit: "m",
        label: l("Al-Khazneh: cephe genişliği", "Al-Khazneh: facade width"),
        source: "wiki-petra-khazneh",
      },
      {
        value: 45,
        unit: "m",
        label: l("Kaya Tiyatrosu: cavea çapı", "Rock Theatre: cavea diameter"),
        source: "wiki-petra-theatre",
      },
    ],
    uncertainty: l(
      "Al-Khazneh cephesinin oyma mimarisi ve kaya tiyatrosunun basamakları yerinde ölçümlere dayanır; Siq çıkışından sonraki cadde yapıları ve Nebati pazar alanları tahmindir.",
      "The carved facade of Al-Khazneh and the rock-cut theatre steps are based on in situ surveys; the civic structures past the Siq and marketplace layouts are estimated.",
    ),
    hotspots: [
      spot(
        [-60, 20, -40],
        "Al-Khazneh (Hazine)",
        "Al-Khazneh (The Treasury)",
        "Doğrudan kızıl kumtaşı kayaya oyulmuş 39 metrelik anıtsal Helenistik/Nebati cephe.",
        "The 39-metre Hellenistic facade chiseled directly out of the rose-red cliff face.",
      ),
      spot(
        [60, 16, 50],
        "Kaya Tiyatrosu",
        "The Rock-cut Theatre",
        "4.000 seyirci kapasiteli, dağın yamacına oyulmuş antik tiyatro.",
        "Carved entirely into the solid mountain sandstone, seating over 4,000 spectators.",
      ),
      spot(
        [-70, 12, 70],
        "Büyük Tapınak",
        "The Great Temple",
        "Nebati krallarının törensel kabul ve tapınma için kullandığı anıtsal külliye.",
        "The monumental Nabataean temple complex used for royal ceremonial gatherings.",
      ),
    ],
    sources: [
      {
        key: "wiki-petra-khazneh",
        title: l("Wikipedia: Al-Khazneh", "Wikipedia: Petra"),
        url: "https://en.wikipedia.org/wiki/Al-Khazneh",
      },
      {
        key: "wiki-petra-theatre",
        title: l("Wikipedia: Petra Theatre", "Wikipedia: Petra"),
        url: "https://en.wikipedia.org/wiki/Petra",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 25,
            facadeHeight: 39,
            lowerColumns: 6,
            steps: 3,
            doors: 1,
            porchDepth: 4,
            hallWidth: 20,
            hallDepth: 10,
            apseWidth: 6,
            nicheHeight: 4,
            wallHeight: 16,
            lowerOrderHeight: 20,
            upperColumns: 6,
            columnDiameter: 1.1,
            inscribed: false,
          },
          at: [-60, -40],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 45,
            orchestraDiameter: 16,
            scaenaeHeight: 8,
            seatTread: 0.65,
            seatRise: 0.4,
            podiumHeight: 1,
            stageDepth: 5,
            stairways: 6,
            lowerRows: 12,
            upperRows: 10,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [60, 50],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 22,
            columnHeight: 11,
            columnDiameter: 1.3,
            porchDepth: 5,
            cellaDepth: 26,
            podiumHeight: 3,
            entablatureHeight: 3,
          },
          at: [-70, 70],
          rotate: 180,
        },
      ],
      streets: [
        [0, -120, 0, 120, 8],
        [-120, 0, 120, 0, 8],
      ],
      hill: { angle: 180, distance: 150, height: 180, radius: 120 },
      viewpoint: { at: [0, 70], look: [-60, 20, -40] },
    },
  },
  {
    id: "ceras-kenti",
    siteSlug: "ceras",
    structure: l("Kent planı", "The City Plan"),
    title: l("Gerasa", "The City of Gerasa (Jerash)"),
    blurb: l(
      "Dekapolis'in en iyi korunan Roma kenti: eşsiz Oval Forum, 800 metrelik Cardo Maximus ve Artemis Tapınağı.",
      "The best-preserved Roman city of the Decapolis: the unique Oval Forum, Cardo Maximus and elevated Temple of Artemis.",
    ),
    period: l("MÖ 1. - MS 3. yüzyıl", "1st century BC - 3rd century AD"),
    measures: [
      {
        value: 56,
        unit: "m",
        label: l("Güney Tiyatrosu: cavea çapı", "South Theatre: cavea diameter"),
        source: "wiki-jerash-theatre",
      },
      {
        value: 24,
        unit: "m",
        label: l("Artemis Tapınağı: cephe genişliği", "Temple of Artemis: facade width"),
        source: "wiki-jerash-artemis",
      },
      {
        value: 22,
        unit: "m",
        label: l("Hadrianus Kemeri: toplam yükseklik", "Arch of Hadrian: total height"),
        source: "wiki-jerash-forum",
      },
    ],
    uncertainty: l(
      "Oval Forum'un elips planı ve Cardo Maximus aksı yerinde ölçülmüş rölövelere dayanır; agora çevresindeki dükkân sıraları ve Bizans öncesi konutlar tahmindir.",
      "The elliptical layout of the Oval Forum and Cardo Maximus alignment are surveyed in situ; shops along the forum perimeter and pre-Byzantine houses are estimated.",
    ),
    hotspots: [
      spot(
        [0, 10, -50],
        "Oval Forum",
        "The Oval Forum",
        "56 İyonik sütunla çevrelenmiş antik dünyanın tek asimetrik eliptik meydanı.",
        "Encircled by 56 Ionic columns, the only asymmetrical elliptical plaza of antiquity.",
      ),
      spot(
        [80, 14, 50],
        "Güney Tiyatrosu",
        "The South Theatre",
        "Akustiğiyle ünlü, 3.000 seyirci kapasiteli iki katlı Roma tiyatrosu.",
        "The remarkably acoustic two-tier theatre seating 3,000 spectators.",
      ),
      spot(
        [-80, 20, 50],
        "Artemis Tapınağı",
        "The Temple of Artemis",
        "Kentin en yüksek tepesinde yükselen 13 metrelik sütunlu anıtsal tapınak.",
        "The monumental hexastyle Corinthian sanctuary dominating the highest terrace.",
      ),
    ],
    sources: [
      {
        key: "wiki-jerash-forum",
        title: l("Wikipedia: Oval Forum, Jerash", "Wikipedia: Jerash"),
        url: "https://en.wikipedia.org/wiki/Jerash",
      },
      {
        key: "wiki-jerash-theatre",
        title: l("Wikipedia: South Theatre, Jerash", "Wikipedia: Jerash"),
        url: "https://en.wikipedia.org/wiki/Jerash",
      },
      {
        key: "wiki-jerash-artemis",
        title: l("Wikipedia: Temple of Artemis, Jerash", "Wikipedia: Jerash"),
        url: "https://en.wikipedia.org/wiki/Jerash",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 56,
            orchestraDiameter: 20,
            scaenaeHeight: 11,
            seatTread: 0.72,
            seatRise: 0.42,
            podiumHeight: 1.2,
            stageDepth: 7,
            stairways: 7,
            lowerRows: 14,
            upperRows: 12,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 2,
              topGallery: false,
            },
          },
          at: [80, 50],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 24,
            columnHeight: 13,
            columnDiameter: 1.4,
            porchDepth: 5,
            cellaDepth: 34,
            podiumHeight: 4,
            entablatureHeight: 3.5,
          },
          at: [-80, 50],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 3,
            archSpan: 10,
            archHeight: 12,
            totalHeight: 22,
            entablatureHeight: 5,
            columnHeight: 10,
            columnDiameter: 1.1,
            columnsPerFace: 4,
            pierWidth: 3,
            depth: 6,
          },
          at: [0, -140],
          rotate: 180,
        },
      ],
      walls: {
        length: 850,
        width: 750,
        height: 8,
        thickness: 3,
        towers: 16,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -90, 0, 120, 8],
        [-120, 0, 120, 0, 8],
      ],
      viewpoint: { at: [0, 80], look: [0, 10, -50] },
    },
  },
  {
    id: "baalbek-kenti",
    siteSlug: "baalbek",
    structure: l("Kent planı", "The City Plan"),
    title: l("Baalbek", "The Sanctuary of Heliopolis (Baalbek)"),
    blurb: l(
      "Roma dünyasının en devasa tapınak kompleksi: 20 metrelik sütunlarıyla Jüpiter Tapınağı, kusursuz Bacchus Tapınağı ve altıgen avlu.",
      "The most colossal sanctuary of Rome: the Temple of Jupiter with 20-metre columns, the near-complete Temple of Bacchus and hexagonal court.",
    ),
    period: l("MS 1. - MS 3. yüzyıl", "1st century AD - 3rd century AD"),
    measures: [
      {
        value: 48,
        unit: "m",
        label: l("Jüpiter Tapınağı: cephe genişliği", "Temple of Jupiter: facade width"),
        source: "wiki-baalbek-jupiter",
      },
      {
        value: 20,
        unit: "m",
        label: l("Jüpiter sütunları: yükseklik", "Jupiter columns: height"),
        source: "wiki-baalbek-jupiter",
      },
      {
        value: 36,
        unit: "m",
        label: l("Bacchus Tapınağı: cephe genişliği", "Temple of Bacchus: facade width"),
        source: "wiki-baalbek-bacchus",
      },
    ],
    uncertainty: l(
      "Jüpiter ve Bacchus tapınaklarının plan ve sütun yükseklikleri Alman arkeolog Theodor Wiegand ve Lübnan Eski Eserler Genel Müdürlüğü rölövelerine dayanır; Propylaea önündeki merdiven kurgusu tahmindir.",
      "The layout and column orders of Jupiter and Bacchus follow Theodor Wiegand's surveys and Lebanese Directorate of Antiquities records; the forecourt stairs are partially inferred.",
    ),
    hotspots: [
      spot(
        [0, 24, 60],
        "Jüpiter Tapınağı",
        "The Temple of Jupiter",
        "20 metre boyunda 54 dev Korint sütununa ve Trilithon bloklarına sahip ulu tapınak.",
        "The colossal temple ringed by 54 twenty-metre columns above the massive Trilithon.",
      ),
      spot(
        [80, 20, -40],
        "Bacchus Tapınağı",
        "The Temple of Bacchus",
        "Kabartmaları ve kapı lentolarıyla günümüze neredeyse eksiksiz ulaşan Roma tapınağı.",
        "The exceptionally preserved octastyle temple famed for its lavish architectural carving.",
      ),
      spot(
        [-80, 14, -40],
        "Altıgen Ön Avlu",
        "The Hexagonal Court",
        "Ziyaretçileri tapınak terasına kabul eden anıtsal altıgen revaklı avlu.",
        "The monumental colonnaded hexagonal court serving as an entrance vestibule.",
      ),
    ],
    sources: [
      {
        key: "wiki-baalbek-jupiter",
        title: l("Wikipedia: Temple of Jupiter (Baalbek)", "Wikipedia: Baalbek"),
        url: "https://en.wikipedia.org/wiki/Baalbek",
      },
      {
        key: "wiki-baalbek-bacchus",
        title: l("Wikipedia: Temple of Bacchus", "Wikipedia: Baalbek"),
        url: "https://en.wikipedia.org/wiki/Temple_of_Bacchus",
      },
    ],
    model: {
      kind: "city",
      radius: 400,
      places: [
        {
          spec: {
            kind: "prostyle-temple",
            columns: 10,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 48,
            columnHeight: 20,
            columnDiameter: 2.4,
            porchDepth: 8,
            cellaDepth: 60,
            podiumHeight: 5,
            entablatureHeight: 4.5,
          },
          at: [0, 60],
          rotate: 180,
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 8,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 36,
            columnHeight: 16,
            columnDiameter: 1.8,
            porchDepth: 6,
            cellaDepth: 46,
            podiumHeight: 4,
            entablatureHeight: 4,
          },
          at: [80, -40],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 50,
            facadeHeight: 22,
            lowerColumns: 6,
            steps: 5,
            doors: 1,
            porchDepth: 6,
            hallWidth: 40,
            hallDepth: 20,
            apseWidth: 10,
            nicheHeight: 4,
            wallHeight: 10,
            lowerOrderHeight: 12,
            upperColumns: 6,
            columnDiameter: 1.5,
            inscribed: false,
          },
          at: [-80, -40],
          rotate: 90,
        },
      ],
      walls: {
        length: 850,
        width: 750,
        height: 10,
        thickness: 4,
        towers: 16,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [0, -140, 0, -10, 10],
        [-140, -10, 140, -10, 10],
      ],
      viewpoint: { at: [0, 90], look: [0, 24, 60] },
    },
  },
  {
    id: "biblos-kenti",
    siteSlug: "biblos",
    structure: l("Kent planı", "The City Plan"),
    title: l("Biblos", "The Ancient City of Byblos"),
    blurb: l(
      "Yedi bin yıllık Fenike limanı: Dikilitaş Tapınağı, denize nazır Roma tiyatrosu ve antik liman kalesi.",
      "The ancient Phoenician harbour: Temple of the Obelisks, seaside Roman theatre and coastal fortress.",
    ),
    period: l("MÖ 2. binyıl - MS 3. yüzyıl", "2nd millennium BC - 3rd century AD"),
    measures: [
      {
        value: 32,
        unit: "m",
        label: l("Roma Tiyatrosu: cavea çapı", "Theatre: cavea diameter"),
        source: "wiki-byblos-theatre",
      },
      {
        value: 26,
        unit: "m",
        label: l("Dikilitaş Tapınağı: cephe genişliği", "Temple of Obelisks: facade width"),
        source: "wiki-byblos-temple",
      },
      {
        value: 24,
        unit: "m",
        label: l("Biblos Kalesi: kule yüksekliği", "Castle: tower height"),
        source: "wiki-byblos-castle",
      },
    ],
    uncertainty: l(
      "Roma tiyatrosu ve Fenike tapınaklarının konumları Fransız arkeolog Maurice Dunand'ın kazı planlarına dayanır; liman rıhtımları ve antik mendirek hattı tahmindir.",
      "The locations of the theatre and Phoenician sanctuaries draw on Maurice Dunand's excavation surveys; the ancient quays and breakwater are reconstructed estimates.",
    ),
    hotspots: [
      spot(
        [60, 12, 40],
        "Roma Tiyatrosu",
        "The Roman Theatre",
        "Akdeniz'e bakan yarım daire biçimli taş basamaklı antik tiyatro.",
        "The semicircular Roman theatre overlooking the Mediterranean shoreline.",
      ),
      spot(
        [-60, 14, 30],
        "Dikilitaş Tapınağı",
        "The Temple of the Obelisks",
        "Avlusunda onlarca adak dikilitaşı barındıran MÖ 2. binyıl Fenike tapınağı.",
        "The second-millennium BC sanctuary studded with votive limestone obelisks.",
      ),
      spot(
        [0, 20, -80],
        "Biblos Kalesi",
        "The Byblos Castle",
        "Antik Fenike surları üzerinde yükselen kalın taş kuleli sahil kalesi.",
        "The massive stone-towered coastal castle built over ancient Phoenician foundations.",
      ),
    ],
    sources: [
      {
        key: "wiki-byblos-theatre",
        title: l("Wikipedia: Byblos Theatre", "Wikipedia: Byblos"),
        url: "https://en.wikipedia.org/wiki/Byblos",
      },
      {
        key: "wiki-byblos-temple",
        title: l("Wikipedia: Temple of the Obelisks", "Wikipedia: Byblos"),
        url: "https://en.wikipedia.org/wiki/Temple_of_the_Obelisks",
      },
      {
        key: "wiki-byblos-castle",
        title: l("Wikipedia: Byblos Castle", "Wikipedia: Byblos"),
        url: "https://en.wikipedia.org/wiki/Byblos_Castle",
      },
    ],
    model: {
      kind: "city",
      radius: 340,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 32,
            orchestraDiameter: 12,
            scaenaeHeight: 6,
            seatTread: 0.65,
            seatRise: 0.38,
            podiumHeight: 0.8,
            stageDepth: 4.5,
            stairways: 5,
            lowerRows: 10,
            upperRows: 8,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [60, 40],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 4,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 26,
            columnHeight: 8,
            columnDiameter: 1,
            porchDepth: 4,
            cellaDepth: 22,
            podiumHeight: 2,
            entablatureHeight: 2,
          },
          at: [-60, 30],
          rotate: 180,
        },
        {
          spec: {
            kind: "round-tower",
            height: 24,
            outerDiameter: 16,
            innerDiameter: 11,
            wallThickness: 2.5,
            galleryHeight: 16,
            capHeight: 4,
          },
          at: [0, -80],
        },
      ],
      walls: {
        length: 700,
        width: 600,
        height: 8,
        thickness: 3,
        towers: 14,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -40, 0, 80, 6],
        [-100, 0, 100, 0, 6],
      ],
      viewpoint: { at: [0, 70], look: [60, 12, 40] },
    },
  },
  {
    id: "herculaneum-kenti",
    siteSlug: "herculaneum",
    structure: l("Kent planı", "The City Plan"),
    title: l("Herculaneum", "Herculaneum"),
    blurb: l(
      "Vezüv'ün koruduğu lüks sahil kenti: ahşap çatılı iki katlı villalar, anıtsal hamamlar, palaestra ve antik tiyatro.",
      "The seaside resort sealed by Vesuvius: preserved timber-framed villas, central baths, grand palaestra and theatre.",
    ),
    period: l("MÖ 1. - MS 1. yüzyıl", "1st century BC - 1st century AD"),
    measures: [
      {
        value: 52,
        unit: "m",
        label: l("Tiyatro: cavea çapı", "Theatre: cavea diameter"),
        source: "wiki-herculaneum",
      },
      {
        value: 32,
        unit: "m",
        label: l("Merkezi Hamamlar: cephe genişliği", "Central Baths: facade width"),
        source: "wiki-herculaneum",
      },
    ],
    uncertainty: l(
      "Kentin kamu binaları ve hamamları güncel kazı planlarına dayanır; sahil şeridi ve palaestra revakları tahmindir.",
      "The public baths and street grid follow modern archaeological surveys; the shoreline promenade and palaestra stoas are reconstructed.",
    ),
    hotspots: [
      spot(
        [0, 10, -45],
        "Merkezi Hamamlar",
        "The Central Baths",
        "Erkekler ve kadınlar bölümleri ayrı olan kentin ana termal yıkanma kompleksi.",
        "The civic thermal bathhouse featuring separate men's and women's caldarium suites.",
      ),
      spot(
        [70, 12, 40],
        "Herculaneum Tiyatrosu",
        "The Theatre",
        "2.500 seyirci kapasiteli, falez yamacına inşa edilmiş mermer kaplı tiyatro.",
        "A 2,500-seat theatre built into the volcanic rock with fine marble statues.",
      ),
      spot(
        [-60, 8, 40],
        "Kutsal Alan",
        "The Sacred Area",
        "Venüs ve Vulcanus'a adanmış podyumlu kutsal tapınak terası.",
        "A raised sacred terrace crowned with shrines dedicated to Venus and Vulcan.",
      ),
    ],
    sources: [
      {
        key: "wiki-herculaneum",
        title: l("Wikipedia: Herculaneum", "Wikipedia: Herculaneum"),
        url: "https://en.wikipedia.org/wiki/Herculaneum",
      },
    ],
    model: {
      kind: "city",
      radius: 320,
      places: [
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 32,
            facadeHeight: 14,
            lowerColumns: 4,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 26,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 6,
            lowerOrderHeight: 7,
            upperColumns: 4,
            columnDiameter: 0.9,
            inscribed: false,
          },
          at: [0, -45],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 4,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 16,
            columnHeight: 9,
            columnDiameter: 1.0,
            porchDepth: 4,
            cellaDepth: 20,
            podiumHeight: 2.5,
            entablatureHeight: 2.2,
          },
          at: [-60, 40],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 52,
            orchestraDiameter: 18,
            lowerRows: 14,
            upperRows: 8,
            scaenaeHeight: 12,
            seatTread: 0.65,
            seatRise: 0.38,
            podiumHeight: 1.1,
            stageDepth: 7.5,
            stairways: 4,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [70, 40],
        },
      ],
      walls: {
        length: 700,
        width: 600,
        height: 7,
        thickness: 2.5,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -20, 0, 50, 6],
        [-35, 10, 35, 10, 6],
      ],
      viewpoint: { at: [0, -10], look: [0, 10, -45] },
    },
  },
  {
    id: "aquae-sulis-kenti",
    siteSlug: "aquae-sulis",
    structure: l("Kent planı", "The City Plan"),
    title: l("Aquae Sulis", "Aquae Sulis"),
    blurb: l(
      "Britanya'nın kutsal kaplıcası: kurşun kaplı Büyük Roma Hamamı, Sulis Minerva Tapınağı ve anıtsal sıcak su galerileri.",
      "The sacred thermal springs of Britannia: the lead-lined Great Bath, Temple of Sulis Minerva and hot steam halls.",
    ),
    period: l("MS 1. - 4. yüzyıl", "1st - 4th century AD"),
    measures: [
      {
        value: 36,
        unit: "m",
        label: l("Büyük Hamam: giriş cephesi genişliği", "Great Bath: facade width"),
        source: "wiki-bath",
      },
      {
        value: 18,
        unit: "m",
        label: l(
          "Sulis Minerva Tapınağı: cephe genişliği",
          "Temple of Sulis Minerva: facade width",
        ),
        source: "wiki-bath",
      },
    ],
    uncertainty: l(
      "Büyük Hamam ve tapınak podyumu günümüze ulaşan orijinal Roma kalıntılarına dayanır; ahşap ve kiremit tonoz çatı tahmindir.",
      "The bath reservoir and temple podium follow surviving Roman remains; the vaulted barrel roof and outer porticoes are conjectural.",
    ),
    hotspots: [
      spot(
        [40, 10, -20],
        "Büyük Roma Hamamı",
        "The Great Bath",
        "46°C doğal mineralli sıcak suyla beslenen kurşun tabanlı dev termal havuz.",
        "A monumental lead-lined thermal pool fed by natural hot mineral water.",
      ),
      spot(
        [-40, 10, -20],
        "Sulis Minerva Tapınağı",
        "Temple of Sulis Minerva",
        "Kelt ve Roma bilgelik tanrıçasına adanmış heksastil tetrastil tapınak.",
        "The classical sanctuary dedicated to the syncretic healing goddess Sulis Minerva.",
      ),
      spot(
        [0, 8, 45],
        "Kuzey Giriş Kapısı",
        "The North Gate",
        "Fosse Way Roma anayolundan kaplıcaya gelen hacıların girdiği anıtsal kapı.",
        "The arched city gate greeting travellers and pilgrims arriving along the Fosse Way.",
      ),
    ],
    sources: [
      {
        key: "wiki-bath",
        title: l("Wikipedia: Roman Baths (Bath)", "Wikipedia: Aquae Sulis"),
        url: "https://en.wikipedia.org/wiki/Roman_Baths_(Bath)",
      },
    ],
    model: {
      kind: "city",
      radius: 300,
      places: [
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 36,
            facadeHeight: 15,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 28,
            hallDepth: 14,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 6,
            lowerOrderHeight: 7,
            upperColumns: 6,
            columnDiameter: 0.95,
            inscribed: false,
          },
          at: [40, -20],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 4,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 18,
            columnHeight: 10,
            columnDiameter: 1.1,
            porchDepth: 4,
            cellaDepth: 24,
            podiumHeight: 2.2,
            entablatureHeight: 2.4,
          },
          at: [-40, -20],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 8,
            archHeight: 10,
            totalHeight: 18,
            entablatureHeight: 3.5,
            columnHeight: 8,
            columnDiameter: 0.9,
            columnsPerFace: 2,
            pierWidth: 5,
            depth: 7,
          },
          at: [0, 50],
          rotate: 180,
        },
      ],
      walls: {
        length: 650,
        width: 550,
        height: 7,
        thickness: 2.4,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -25, 0, 5, 6],
        [-15, 0, 15, 0, 6],
      ],
      viewpoint: { at: [0, 15], look: [40, 8, -20] },
    },
  },
  {
    id: "arelate-kenti",
    siteSlug: "arelate",
    structure: l("Kent planı", "The City Plan"),
    title: l("Arelate", "Arelate (Arles)"),
    blurb: l(
      "Galya'nın Küçük Roma'sı: iki katlı 120 kemerli anıtsal amfitiyatro, Augustus tiyatrosu ve forum sütunları.",
      "The Little Rome of Gaul: a colossal 120-arched two-tier amphitheatre, Augustan theatre and forum porticoes.",
    ),
    period: l("MÖ 1. - MS 4. yüzyıl", "1st century BC - 4th century AD"),
    measures: [
      {
        value: 136,
        unit: "m",
        label: l("Amfitiyatro: dış uzunluk", "Amphitheatre: outer length"),
        source: "wiki-arles",
      },
      {
        value: 109,
        unit: "m",
        label: l("Amfitiyatro: dış genişlik", "Amphitheatre: outer width"),
        source: "wiki-arles",
      },
      {
        value: 52,
        unit: "m",
        label: l("Antik Tiyatro: cavea çapı", "Theatre: cavea diameter"),
        source: "wiki-arles",
      },
    ],
    uncertainty: l(
      "Amfitiyatro ve tiyatro kalıntıları ayaktadır; forumun üst kat binaları ve nehir rıhtımları dönemin Galya-Roma mimarisine göre türetilmiştir.",
      "The amphitheatre and theatre retain monumental standing fabric; the forum basilica and Rhône river quays are hypothetically reconstructed.",
    ),
    hotspots: [
      spot(
        [120, 18, 90],
        "Arles Amfitiyatrosu",
        "The Roman Amphitheatre",
        "20.000 seyirci kapasiteli, 120 adet iki katlı yarım sütunlu kemere sahip arena.",
        "A 20,000-seat arena ringed by 120 grand arches across two classical orders.",
      ),
      spot(
        [-70, 12, -60],
        "Augustus Tiyatrosu",
        "The Theatre of Augustus",
        "102 metre genişliğinde ve korint mermer sütunlu anıtsal scaenae frons.",
        "An early Augustan theatre framed by fine Carrara marble columns.",
      ),
      spot(
        [-60, 10, 60],
        "Forum ve Cryptoporticus",
        "The Forum & Cryptoporticus",
        "Yeraltı tonoz galerileri üzerine kurulu anıtsal forum meydanı ve revakları.",
        "The monumental civic forum built over the U-shaped vaulted cryptoporticus.",
      ),
    ],
    sources: [
      {
        key: "wiki-arles",
        title: l("Wikipedia: Arles Amphitheatre", "Wikipedia: Arles"),
        url: "https://en.wikipedia.org/wiki/Arles_Amphitheatre",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 136,
            outerWidth: 109,
            arenaLength: 68,
            arenaWidth: 42,
            wallHeight: 21,
            rows: 24,
            tiers: 2,
            seatRise: 0.26,
            seatTread: 0.65,
            podiumHeight: 3.0,
            bays: 60,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [120, 90],
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 52,
            orchestraDiameter: 18,
            lowerRows: 16,
            upperRows: 10,
            scaenaeHeight: 12,
            seatTread: 0.65,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 6,
            stairways: 6,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [-70, -60],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 38,
            facadeHeight: 16,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 30,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 7,
            lowerOrderHeight: 8,
            upperColumns: 6,
            columnDiameter: 1.0,
            inscribed: false,
          },
          at: [-60, 60],
        },
      ],
      walls: {
        length: 900,
        width: 750,
        height: 8.5,
        thickness: 3,
        towers: 18,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [0, -90, 0, 90, 8],
        [-110, 0, 50, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [120, 15, 90] },
    },
  },
  {
    id: "colonia-kenti",
    siteSlug: "colonia",
    structure: l("Kent planı", "The City Plan"),
    title: l("Colonia Agrippina", "Colonia Agrippina (Cologne)"),
    blurb: l(
      "Germania Inferior başkenti: Ren kıyısındaki vali sarayı Praetorium, anıtsal Kuzey Kapısı ve Capitolium Tapınağı.",
      "The capital of Germania Inferior on the Rhine: the riverfront Praetorium palace, North Gate and Capitolium.",
    ),
    period: l("MÖ 1. - MS 5. yüzyıl", "1st century BC - 5th century AD"),
    measures: [
      {
        value: 46,
        unit: "m",
        label: l("Praetorium: cephe genişliği", "Praetorium: facade width"),
        source: "wiki-cologne",
      },
      {
        value: 22,
        unit: "m",
        label: l("Capitolium Tapınağı: cephe genişliği", "Capitolium: facade width"),
        source: "wiki-cologne",
      },
      {
        value: 17,
        unit: "m",
        label: l("Kuzey Kapısı: yükseklik", "North Gate: height"),
        source: "wiki-cologne",
      },
    ],
    uncertainty: l(
      "Praetorium temelleri ve Kuzey Kapısı'nın kemer blokları kazılarda bulunmuştur; üst kat pencereleri ve çatı hattı tahmindir.",
      "The palace foundations and arch blocks of the North Gate are documented archaeologically; the upper storeys are conjectural.",
    ),
    hotspots: [
      spot(
        [60, 12, -30],
        "Praetorium Sarayı",
        "The Praetorium Palace",
        "Roma eyalet valisinin Ren Nehri kıyısındaki devasa idari sarayı.",
        "The colossal imperial governor's palace complex commanding the Rhine waterfront.",
      ),
      spot(
        [0, 10, -70],
        "Roma Kuzey Kapısı",
        "The Roman North Gate",
        "Orta kemerinde CCAA yazıtı taşıyan anıtsal üç kemerli şehir kapısı.",
        "The monumental triple-arched gate inscribed with the colony's imperial title CCAA.",
      ),
      spot(
        [-50, 12, 40],
        "Capitolium Tapınağı",
        "The Capitolium Temple",
        "Jüpiter, Juno ve Minerva üçlüsüne adanmış podyumlu Roma tapınağı.",
        "The grand classical sanctuary dedicated to the Capitoline triad.",
      ),
    ],
    sources: [
      {
        key: "wiki-cologne",
        title: l("Wikipedia: Colonia Claudia Ara Agrippinensium", "Wikipedia: Roman Cologne"),
        url: "https://en.wikipedia.org/wiki/Colonia_Claudia_Ara_Agrippinensium",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 46,
            facadeHeight: 18,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 36,
            hallDepth: 14,
            apseWidth: 8,
            nicheHeight: 3,
            wallHeight: 8,
            lowerOrderHeight: 8,
            upperColumns: 6,
            columnDiameter: 1.1,
            inscribed: false,
          },
          at: [60, -30],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 3,
            archSpan: 6,
            archHeight: 8,
            totalHeight: 17,
            entablatureHeight: 3.5,
            columnHeight: 7,
            columnDiameter: 0.85,
            columnsPerFace: 2,
            pierWidth: 4.5,
            depth: 8,
          },
          at: [0, -80],
          rotate: 180,
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 22,
            columnHeight: 12,
            columnDiameter: 1.2,
            porchDepth: 5,
            cellaDepth: 28,
            podiumHeight: 3,
            entablatureHeight: 3,
          },
          at: [-50, 40],
          rotate: 180,
        },
      ],
      walls: {
        length: 850,
        width: 700,
        height: 9,
        thickness: 3,
        towers: 18,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [0, -40, 0, 70, 8],
        [-80, 0, 80, 0, 8],
      ],
      viewpoint: { at: [0, -40], look: [60, 10, -30] },
    },
  },
  {
    id: "kartaca-kenti",
    siteSlug: "kartaca",
    structure: l("Kent planı", "The City Plan"),
    title: l("Kartaca", "Carthage"),
    blurb: l(
      "Akdeniz'in kadim deniz başkenti: Antoninus Hamamları, Byrsa Tepesi Pön Akropolü ve anıtsal tiyatro.",
      "The ancient maritime capital: Antonine Baths, Byrsa Hill acropolis and the grand Roman theatre.",
    ),
    period: l("MÖ 9. yüzyıl - MS 7. yüzyıl", "9th century BC - 7th century AD"),
    measures: [
      {
        value: 48,
        unit: "m",
        label: l("Antoninus Hamamları: giriş cephesi genişliği", "Antonine Baths: facade width"),
        source: "wiki-carthage",
      },
      {
        value: 50,
        unit: "m",
        label: l("Kartaca Roma Tiyatrosu: cavea çapı", "Roman Theatre: cavea diameter"),
        source: "wiki-carthage",
      },
      {
        value: 20,
        unit: "m",
        label: l("Byrsa Akropol Tapınağı: cephe genişliği", "Byrsa Acropolis Temple: facade width"),
        source: "wiki-carthage",
      },
    ],
    uncertainty: l(
      "Hamam temelleri ve tiyatro caveası kazılardan bilinir; Byrsa tepesindeki Pön tapınaklarının üst katları tahmindir.",
      "Bath foundations and theatre cavea follow archaeological excavations; upper levels of Byrsa temples are conjectural.",
    ),
    hotspots: [
      spot(
        [50, 12, -20],
        "Antoninus Hamamları",
        "The Antonine Baths",
        "Akdeniz kıyısında Roma dünyasının en büyük üçüncü hamam kompleksi.",
        "The third-largest thermal bath complex in the Roman world lining the Mediterranean shore.",
      ),
      spot(
        [-50, 14, 30],
        "Kartaca Roma Tiyatrosu",
        "The Roman Theatre",
        "Byrsa yamacına kurulu mermer sütunlu anıtsal tiyatro.",
        "The monumental theatre set on the slope with fine marble columns.",
      ),
      spot(
        [0, 10, 60],
        "Byrsa Akropol Tapınağı",
        "Byrsa Acropolis Temple",
        "Kentin en yüksek tepesinde yükselen anıtsal kutsal alan.",
        "The grand sanctuary commanding the highest summit of the ancient citadel.",
      ),
    ],
    sources: [
      {
        key: "wiki-carthage",
        title: l("Wikipedia: Carthage", "Wikipedia: Carthage"),
        url: "https://en.wikipedia.org/wiki/Carthage",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 48,
            facadeHeight: 18,
            lowerColumns: 6,
            steps: 3,
            doors: 3,
            porchDepth: 4,
            hallWidth: 38,
            hallDepth: 14,
            apseWidth: 8,
            nicheHeight: 3,
            wallHeight: 8,
            lowerOrderHeight: 8,
            upperColumns: 6,
            columnDiameter: 1.1,
            inscribed: false,
          },
          at: [50, -20],
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 50,
            orchestraDiameter: 18,
            lowerRows: 16,
            upperRows: 10,
            scaenaeHeight: 12,
            seatTread: 0.65,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 6,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [-50, 30],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 20,
            columnHeight: 11,
            columnDiameter: 1.1,
            porchDepth: 5,
            cellaDepth: 26,
            podiumHeight: 2.8,
            entablatureHeight: 2.6,
          },
          at: [0, 60],
          rotate: 180,
        },
      ],
      walls: {
        length: 900,
        width: 750,
        height: 8.5,
        thickness: 3,
        towers: 16,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [0, -30, 0, 25, 6],
        [-25, 0, 25, 0, 6],
      ],
      viewpoint: { at: [0, -35], look: [50, 10, -20] },
    },
  },
  {
    id: "el-cem-kenti",
    siteSlug: "el-cem",
    structure: l("Kent planı", "The City Plan"),
    title: l("El Cem (Thysdrus)", "El Jem (Thysdrus)"),
    blurb: l(
      "Afrika'nın Colosseum'u: 35.000 seyirci kapasiteli devasa amfitiyatro, forum bazilikası ve anıtsal zafer takı.",
      "The Colosseum of Africa: the colossal 35,000-seat amphitheatre, forum basilica and triumphal gate.",
    ),
    period: l("MS 2. - 3. yüzyıl", "2nd - 3rd century AD"),
    measures: [
      {
        value: 148,
        unit: "m",
        label: l("El Cem Amfitiyatrosu: dış uzunluk", "Amphitheatre: outer length"),
        source: "wiki-el-jem",
      },
      {
        value: 122,
        unit: "m",
        label: l("El Cem Amfitiyatrosu: dış genişlik", "Amphitheatre: outer width"),
        source: "wiki-el-jem",
      },
      {
        value: 30,
        unit: "m",
        label: l("El Cem Amfitiyatrosu: dış cephe yüksekliği", "Amphitheatre: wall height"),
        source: "wiki-el-jem",
      },
    ],
    uncertainty: l(
      "Amfitiyatro duvarları ve kemerleri günümüze neredeyse eksiksiz ulaşmıştır; forum yapıları kalıntılara dayalı rekonstrüksiyondur.",
      "The amphitheatre arches and tiers are exceptionally well-preserved; the surrounding civic buildings follow archaeological foundations.",
    ),
    hotspots: [
      spot(
        [100, 20, 80],
        "El Cem Roma Amfitiyatrosu",
        "The Amphitheatre of El Jem",
        "Düz ovada yükselen 3 katlı, 30 metre yüksekliğindeki 35.000 kişilik dev arena.",
        "The freestanding 35,000-seat Roman arena soaring 30 metres above the coastal plain.",
      ),
      spot(
        [-50, 10, -30],
        "Forum Bazilikası",
        "The Forum Basilica",
        "Zeytinyağı ticaretinin yönetildiği Thysdrus adli ve idari bazilikası.",
        "The judicial basilica at the civic core of the olive-trading metropolis.",
      ),
      spot(
        [0, 8, -70],
        "Anıtsal Şehir Kapısı",
        "The Triumphal City Gate",
        "Kente gelen tüccarları karşılayan tek kemerli anıtsal giriş takı.",
        "The monumental arched portal greeting merchants entering from the plain.",
      ),
    ],
    sources: [
      {
        key: "wiki-el-jem",
        title: l("Wikipedia: Amphitheatre of El Jem", "Wikipedia: El Jem"),
        url: "https://en.wikipedia.org/wiki/Amphitheatre_of_El_Jem",
      },
    ],
    model: {
      kind: "city",
      radius: 400,
      places: [
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 148,
            outerWidth: 122,
            arenaLength: 65,
            arenaWidth: 39,
            wallHeight: 30,
            rows: 26,
            tiers: 3,
            seatRise: 0.28,
            seatTread: 0.65,
            podiumHeight: 3.2,
            bays: 64,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [100, 80],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 36,
            facadeHeight: 14,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 28,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 6,
            lowerOrderHeight: 7,
            upperColumns: 6,
            columnDiameter: 0.95,
            inscribed: false,
          },
          at: [-50, -30],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 7,
            archHeight: 9,
            totalHeight: 16,
            entablatureHeight: 3.2,
            columnHeight: 7,
            columnDiameter: 0.85,
            columnsPerFace: 2,
            pierWidth: 4.5,
            depth: 7,
          },
          at: [0, -80],
          rotate: 180,
        },
      ],
      walls: {
        length: 900,
        width: 750,
        height: 8,
        thickness: 2.8,
        towers: 16,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [0, -25, 0, 45, 8],
        [-60, 0, 60, 0, 8],
      ],
      viewpoint: { at: [0, -40], look: [100, 18, 80] },
    },
  },
  {
    id: "timgad-kenti",
    siteSlug: "timgad",
    structure: l("Kent planı", "The City Plan"),
    title: l("Timgad (Thamugadi)", "Timgad (Thamugadi)"),
    blurb: l(
      "Kusursuz Roma ızgara planı: Traianus Zafer Takı, Decumanus Maximus caddesi, halk kütüphanesi ve antik tiyatro.",
      "The pinnacle of Roman grid planning: Trajan's Arch, Decumanus Maximus, public library and theatre.",
    ),
    period: l("MS 1. - 3. yüzyıl", "1st - 3rd century AD"),
    measures: [
      {
        value: 12,
        unit: "m",
        label: l("Traianus Zafer Takı: yükseklik", "Trajan's Arch: height"),
        source: "wiki-timgad",
      },
      {
        value: 34,
        unit: "m",
        label: l("Halk Kütüphanesi ve Bazilika: cephe genişliği", "Public Library: facade width"),
        source: "wiki-timgad",
      },
      {
        value: 52,
        unit: "m",
        label: l("Timgad Roma Tiyatrosu: cavea çapı", "Roman Theatre: cavea diameter"),
        source: "wiki-timgad",
      },
    ],
    uncertainty: l(
      "Sokak ızgara planı, tak ve tiyatro podyumu günümüze eksiksiz ulaşmıştır; kütüphanenin üst tonoz çatısı tahmindir.",
      "The grid street network, triumphal arch and theatre survive intact; the library's vaulted ceiling is conjectural.",
    ),
    hotspots: [
      spot(
        [0, 8, -70],
        "Traianus Zafer Takı",
        "Trajan's Triumphal Arch",
        "12 metre yüksekliğinde, yivli korint sütunlu üç kemerli anıtsal batı şehir kapısı.",
        "The monumental 12-metre triple-arched gate commanding the western approach to the city.",
      ),
      spot(
        [-40, 10, -20],
        "Antik Halk Kütüphanesi",
        "The Public Library",
        "Duvarlarındaki nişlerde 20.000 papirüs rulosunu barındıran yarım daire kütüphane.",
        "The semicircular reading hall designed to store over 20,000 papyrus rolls.",
      ),
      spot(
        [50, 12, 30],
        "Timgad Roma Tiyatrosu",
        "The Roman Theatre",
        "3.500 seyirci kapasiteli, güneye bakan akustiği kusursuz antik tiyatro.",
        "The 3,500-seat theatre hewn gracefully into the gentle southern hillside.",
      ),
    ],
    sources: [
      {
        key: "wiki-timgad",
        title: l("Wikipedia: Timgad", "Wikipedia: Timgad"),
        url: "https://en.wikipedia.org/wiki/Timgad",
      },
    ],
    model: {
      kind: "city",
      radius: 350,
      places: [
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 3,
            archSpan: 5.5,
            archHeight: 7,
            totalHeight: 12,
            entablatureHeight: 2.8,
            columnHeight: 6,
            columnDiameter: 0.75,
            columnsPerFace: 2,
            pierWidth: 3.5,
            depth: 7,
          },
          at: [0, -80],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 34,
            facadeHeight: 14,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 26,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 6,
            lowerOrderHeight: 7,
            upperColumns: 6,
            columnDiameter: 0.9,
            inscribed: false,
          },
          at: [-40, -20],
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 52,
            orchestraDiameter: 18,
            lowerRows: 14,
            upperRows: 8,
            scaenaeHeight: 12,
            seatTread: 0.65,
            seatRise: 0.38,
            podiumHeight: 1.1,
            stageDepth: 7.5,
            stairways: 4,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [50, 30],
        },
      ],
      walls: {
        length: 750,
        width: 700,
        height: 7.5,
        thickness: 2.5,
        towers: 14,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -40, 0, 45, 7],
        [-25, 0, 25, 0, 6],
      ],
      viewpoint: { at: [0, -40], look: [50, 10, 30] },
    },
  },
  {
    id: "djemila-kenti",
    siteSlug: "djemila",
    structure: l("Kent planı", "The City Plan"),
    title: l("Djemila (Cuicul)", "Djémila (Cuicul)"),
    blurb: l(
      "Dağ yamacında anıtsal Roma kolonisi: Caracalla Zafer Takı, Septimius Severus Tapınağı ve yamaç antik tiyatrosu.",
      "The mountain colony: Arch of Caracalla, Temple of Septimius Severus and hillside theatre.",
    ),
    period: l("MS 1. - 4. yüzyıl", "1st - 4th century AD"),
    measures: [
      {
        value: 13,
        unit: "m",
        label: l("Caracalla Zafer Takı: yükseklik", "Arch of Caracalla: height"),
        source: "wiki-djemila",
      },
      {
        value: 18,
        unit: "m",
        label: l("Septimius Severus Tapınağı: cephe genişliği", "Severan Temple: facade width"),
        source: "wiki-djemila",
      },
      {
        value: 52,
        unit: "m",
        label: l("Cuicul Yamaç Tiyatrosu: cavea çapı", "Hillside Theatre: cavea diameter"),
        source: "wiki-djemila",
      },
    ],
    uncertainty: l(
      "Caracalla Takı ve tapınak merdivenleri yerinde sağlamdır; tapınak ahşap tavanı ve kiremit çatısı tahmindir.",
      "The Arch of Caracalla and temple podium stand intact; the temple's coffered ceiling is conjectural.",
    ),
    hotspots: [
      spot(
        [0, 8, -65],
        "Caracalla Zafer Takı",
        "The Arch of Caracalla",
        "İmparator ve annesi Julia Domna onuruna dikilmiş tek kemerli anıtsal zafer takı.",
        "The single-vaulted triumphal arch dedicated to Emperor Caracalla and Julia Domna.",
      ),
      spot(
        [-40, 10, 30],
        "Septimius Severus Tapınağı",
        "The Severan Temple",
        "Severus Forumu'na bakan yüksek podyumlu, anıtsal merdivenli korint tapınağı.",
        "The grand classical sanctuary dominating the Severan Forum from its high podium.",
      ),
      spot(
        [45, 10, 20],
        "Cuicul Yamaç Tiyatrosu",
        "The Hillside Theatre",
        "Vadi manzarasına açılan 3.000 kişilik dik dağ yamacı tiyatrosu.",
        "The 3,000-seat amphitheatre hewn directly into the mountain slope.",
      ),
    ],
    sources: [
      {
        key: "wiki-djemila",
        title: l("Wikipedia: Djémila", "Wikipedia: Djémila"),
        url: "https://en.wikipedia.org/wiki/Dj%C3%A9mila",
      },
    ],
    model: {
      kind: "city",
      radius: 340,
      places: [
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 6,
            archHeight: 8,
            totalHeight: 13,
            entablatureHeight: 3,
            columnHeight: 6.5,
            columnDiameter: 0.8,
            columnsPerFace: 2,
            pierWidth: 4,
            depth: 6,
          },
          at: [0, -75],
          rotate: 180,
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 18,
            columnHeight: 10,
            columnDiameter: 1.0,
            porchDepth: 4.5,
            cellaDepth: 24,
            podiumHeight: 2.8,
            entablatureHeight: 2.4,
          },
          at: [-40, 30],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 52,
            orchestraDiameter: 18,
            lowerRows: 14,
            upperRows: 8,
            scaenaeHeight: 12,
            seatTread: 0.65,
            seatRise: 0.38,
            podiumHeight: 1.1,
            stageDepth: 7.5,
            stairways: 4,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [45, 20],
        },
      ],
      walls: {
        length: 700,
        width: 600,
        height: 7.5,
        thickness: 2.5,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -35, 0, 45, 6],
        [-10, 0, 20, 0, 6],
      ],
      viewpoint: { at: [0, -35], look: [-40, 10, 30] },
    },
  },
  {
    id: "volubilis-kenti",
    siteSlug: "volubilis",
    structure: l("Kent planı", "The City Plan"),
    title: l("Volubilis (Valili)", "Volubilis (Walili)"),
    blurb: l(
      "Mauretania Tingitana başkenti: Caracalla Zafer Takı, korint sütunlu Bazilika ve Capitolium Tapınağı.",
      "The capital of Mauretania Tingitana: Arch of Caracalla, grand Basilica and Capitoline Temple.",
    ),
    period: l("MÖ 3. yüzyıl - MS 3. yüzyıl", "3rd century BC - 3rd century AD"),
    measures: [
      {
        value: 14,
        unit: "m",
        label: l("Caracalla Zafer Takı: yükseklik", "Arch of Caracalla: height"),
        source: "wiki-volubilis",
      },
      {
        value: 38,
        unit: "m",
        label: l("Anıtsal Bazilika: cephe genişliği", "Judicial Basilica: facade width"),
        source: "wiki-volubilis",
      },
      {
        value: 16,
        unit: "m",
        label: l("Capitolium Tapınağı: cephe genişliği", "Capitoline Temple: facade width"),
        source: "wiki-volubilis",
      },
    ],
    uncertainty: l(
      "Caracalla Takı ve bazilika sütun dizisi kazılarda ayağa kaldırılmıştır; üst korniş heykelleri tahmindir.",
      "The Triumphal Arch and basilica arcades were restored by anastylosis; upper statuary is conjectural.",
    ),
    hotspots: [
      spot(
        [0, 8, -65],
        "Caracalla Zafer Takı",
        "The Arch of Caracalla",
        "Decumanus Maximus caddesini taçlandıran 14 metre yüksekliğindeki zafer takı.",
        "The 14-metre triumphal gateway framing the Decumanus Maximus across the plain.",
      ),
      spot(
        [40, 10, -20],
        "Anıtsal Roma Bazilikası",
        "The Judicial Basilica",
        "Kentin adli ve idari işlerinin yürütüldüğü çift katlı korint sütunlu bazilika.",
        "The grand two-tier judicial hall commanding the civic forum.",
      ),
      spot(
        [-40, 10, 25],
        "Capitolium Tapınağı",
        "The Capitoline Temple",
        "Jüpiter, Juno ve Minerva üçlüsüne adanmış podyumlu tapınak.",
        "The classical sanctuary dedicated to the Capitoline triad on a stepped podium.",
      ),
    ],
    sources: [
      {
        key: "wiki-volubilis",
        title: l("Wikipedia: Volubilis", "Wikipedia: Volubilis"),
        url: "https://en.wikipedia.org/wiki/Volubilis",
      },
    ],
    model: {
      kind: "city",
      radius: 350,
      places: [
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 6.5,
            archHeight: 8.5,
            totalHeight: 14,
            entablatureHeight: 3.2,
            columnHeight: 7,
            columnDiameter: 0.85,
            columnsPerFace: 2,
            pierWidth: 4.2,
            depth: 6,
          },
          at: [0, -75],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 38,
            facadeHeight: 15,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 30,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 7,
            lowerOrderHeight: 7.5,
            upperColumns: 6,
            columnDiameter: 0.95,
            inscribed: false,
          },
          at: [40, -20],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 4,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 16,
            columnHeight: 9.5,
            columnDiameter: 1.0,
            porchDepth: 4,
            cellaDepth: 22,
            podiumHeight: 2.5,
            entablatureHeight: 2.2,
          },
          at: [-40, 25],
          rotate: 180,
        },
      ],
      walls: {
        length: 750,
        width: 650,
        height: 7.5,
        thickness: 2.6,
        towers: 14,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -35, 0, 45, 6],
        [-10, 0, 20, 0, 6],
      ],
      viewpoint: { at: [0, -35], look: [40, 10, -20] },
    },
  },
  {
    id: "liksus-kenti",
    siteSlug: "liksus",
    structure: l("Kent planı", "The City Plan"),
    title: l("Liksus (Lixus)", "Lixus"),
    blurb: l(
      "Atlantik kıyısında kadim liman: Loukkos amfitiyatrosu, akropol Melqart tapınakları ve garum üretim merkezi.",
      "The ancient Atlantic port: Loukkos amphitheatre, acropolis sanctuary and garum complex.",
    ),
    period: l("MÖ 8. yüzyıl - MS 5. yüzyıl", "8th century BC - 5th century AD"),
    measures: [
      {
        value: 90,
        unit: "m",
        label: l("Liksus Amfitiyatrosu: dış uzunluk", "Amphitheatre: outer length"),
        source: "wiki-lixus",
      },
      {
        value: 18,
        unit: "m",
        label: l("Akropol Melqart Tapınağı: cephe genişliği", "Acropolis Temple: facade width"),
        source: "wiki-lixus",
      },
      {
        value: 30,
        unit: "m",
        label: l("Liman İdare Binası: cephe genişliği", "Harbour Basilica: facade width"),
        source: "wiki-lixus",
      },
    ],
    uncertainty: l(
      "Dairesel amfitiyatro ve garum havuzları kazılarda ortaya çıkarılmıştır; akropol tapınaklarının üst çatısı tahmindir.",
      "The circular theatre-amphitheatre and fish-salting basins are excavated; the upper temple roof is conjectural.",
    ),
    hotspots: [
      spot(
        [60, 12, 40],
        "Liksus Amfitiyatrosu",
        "The Amphitheatre of Lixus",
        "Atlantik kıyısında hem tiyatro hem arena işlevli dairesel taş yapı.",
        "The unique circular hybrid theatre-amphitheatre overlooking the Loukkos estuary.",
      ),
      spot(
        [-40, 12, -20],
        "Akropol Melqart Tapınağı",
        "The Acropolis Temple",
        "Tepenin zirvesinde Herakles/Melqart kültüne adanmış podyumlu kutsal alan.",
        "The hilltop sanctuary dedicated to the Phoenician-Greco hero god Melqart.",
      ),
      spot(
        [0, 8, -40],
        "Garum İdare Binası",
        "The Garum Administration",
        "Antik dünyanın en büyük balık sosu ticaretini yöneten revaklı idare binası.",
        "The commercial portico commanding the sprawling fish-salting factories.",
      ),
    ],
    sources: [
      {
        key: "wiki-lixus",
        title: l("Wikipedia: Lixus (ancient city)", "Wikipedia: Lixus"),
        url: "https://en.wikipedia.org/wiki/Lixus_(ancient_city)",
      },
    ],
    model: {
      kind: "city",
      radius: 320,
      places: [
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 90,
            outerWidth: 75,
            arenaLength: 45,
            arenaWidth: 30,
            wallHeight: 14,
            rows: 16,
            tiers: 2,
            seatRise: 0.26,
            seatTread: 0.65,
            podiumHeight: 2.2,
            bays: 40,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [60, 40],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 4,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 18,
            columnHeight: 10,
            columnDiameter: 1.0,
            porchDepth: 4,
            cellaDepth: 24,
            podiumHeight: 2.2,
            entablatureHeight: 2.4,
          },
          at: [-40, -20],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 30,
            facadeHeight: 12,
            lowerColumns: 4,
            steps: 3,
            doors: 2,
            porchDepth: 3.5,
            hallWidth: 24,
            hallDepth: 10,
            apseWidth: 5,
            nicheHeight: 2.5,
            wallHeight: 5.5,
            lowerOrderHeight: 6,
            upperColumns: 4,
            columnDiameter: 0.85,
            inscribed: false,
          },
          at: [0, -40],
        },
      ],
      walls: {
        length: 650,
        width: 550,
        height: 7,
        thickness: 2.4,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -15, 0, 40, 6],
        [-10, 0, 20, 0, 6],
      ],
      viewpoint: { at: [0, 10], look: [60, 10, 40] },
    },
  },
  {
    id: "leptis-magna-kenti",
    siteSlug: "leptis-magna",
    structure: l("Kent planı", "The City Plan"),
    title: l("Leptis Magna", "Leptis Magna"),
    blurb: l(
      "Akdeniz'in mermer metropolü: devasa Severus Bazilikası, dört ayaklı zafer takı ve sahil antik tiyatrosu.",
      "The marble metropolis: colossal Severan Basilica, four-way triumphal arch and maritime theatre.",
    ),
    period: l("MÖ 7. yüzyıl - MS 7. yüzyıl", "7th century BC - 7th century AD"),
    measures: [
      {
        value: 46,
        unit: "m",
        label: l("Severus Bazilikası: cephe genişliği", "Severan Basilica: facade width"),
        source: "wiki-leptis",
      },
      {
        value: 16,
        unit: "m",
        label: l("Severus Zafer Takı: yükseklik", "Arch of Septimius Severus: height"),
        source: "wiki-leptis",
      },
      {
        value: 50,
        unit: "m",
        label: l("Leptis Sahil Tiyatrosu: cavea çapı", "Maritime Theatre: cavea diameter"),
        source: "wiki-leptis",
      },
    ],
    uncertainty: l(
      "Bazilika sütunları, tiyatro ve tak kalıntıları dünyanın en iyi korunanları arasındadır; üst ahşap çatı tahmindir.",
      "The basilica colonnades, theatre and triumphal arch stand remarkably intact; timber roof spans are conjectural.",
    ),
    hotspots: [
      spot(
        [50, 12, -20],
        "Severus Bazilikası",
        "The Severan Basilica",
        "92 metre uzunluğunda, iki katlı mermer sütunlu anıtsal adli ve idari salon.",
        "The colossal two-storey marble hall adorned with Medusa reliefs and towering apses.",
      ),
      spot(
        [0, 8, -65],
        "Septimius Severus Dört Ayaklı Takı",
        "The Quadrifrons Arch",
        "Dört yöne açılan kemerleriyle kavşağı taçlandıran 16 metre yüksekliğindeki anıt.",
        "The four-faced tetrapylon triumphal arch dedicated to Emperor Septimius Severus.",
      ),
      spot(
        [-50, 12, 35],
        "Leptis Sahil Tiyatrosu",
        "The Maritime Theatre",
        "Akdeniz esintisine açılan, korint sütunlu scaenae frons cephesine sahip tiyatro.",
        "The majestic seaside theatre whose cavea opens toward the blue Mediterranean.",
      ),
    ],
    sources: [
      {
        key: "wiki-leptis",
        title: l("Wikipedia: Leptis Magna", "Wikipedia: Leptis Magna"),
        url: "https://en.wikipedia.org/wiki/Leptis_Magna",
      },
    ],
    model: {
      kind: "city",
      radius: 400,
      places: [
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 46,
            facadeHeight: 18,
            lowerColumns: 6,
            steps: 3,
            doors: 3,
            porchDepth: 4,
            hallWidth: 36,
            hallDepth: 14,
            apseWidth: 8,
            nicheHeight: 3,
            wallHeight: 8,
            lowerOrderHeight: 8,
            upperColumns: 6,
            columnDiameter: 1.1,
            inscribed: false,
          },
          at: [50, -20],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 3,
            archSpan: 6,
            archHeight: 8,
            totalHeight: 16,
            entablatureHeight: 3.2,
            columnHeight: 7,
            columnDiameter: 0.85,
            columnsPerFace: 2,
            pierWidth: 4.2,
            depth: 8,
          },
          at: [0, -75],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 50,
            orchestraDiameter: 18,
            lowerRows: 16,
            upperRows: 10,
            scaenaeHeight: 12,
            seatTread: 0.65,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 6,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [-50, 35],
        },
      ],
      walls: {
        length: 950,
        width: 800,
        height: 9,
        thickness: 3,
        towers: 18,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [0, -25, 0, 50, 8],
        [-10, 0, 20, 0, 6],
      ],
      viewpoint: { at: [0, -40], look: [50, 10, -20] },
    },
  },
  {
    id: "sabratha-kenti",
    siteSlug: "sabratha",
    structure: l("Kent planı", "The City Plan"),
    title: l("Sabratha", "Sabratha"),
    blurb: l(
      "Akdeniz kıyısında tiyatro mucizesi: 96 mermer sütunlu üç katlı sahil tiyatrosu, Antoninus Tapınağı ve deniz forumu.",
      "The maritime wonder: three-storey theatre of 96 marble columns, Antonine Temple and forum.",
    ),
    period: l("MÖ 5. yüzyıl - MS 4. yüzyıl", "5th century BC - 4th century AD"),
    measures: [
      {
        value: 50,
        unit: "m",
        label: l("Sabratha Deniz Tiyatrosu: cavea çapı", "Maritime Theatre: cavea diameter"),
        source: "wiki-sabratha",
      },
      {
        value: 20,
        unit: "m",
        label: l("Antoninus Tapınağı: cephe genişliği", "Temple of Antoninus: facade width"),
        source: "wiki-sabratha",
      },
      {
        value: 36,
        unit: "m",
        label: l("Forum Bazilikası: cephe genişliği", "Forum Basilica: facade width"),
        source: "wiki-sabratha",
      },
    ],
    uncertainty: l(
      "96 mermer sütunlu scaenae frons anastilosis ile ayağa kaldırılmıştır; tapınak iç tonozu tahmindir.",
      "The three-tier scaenae frons was reconstructed using original elements; temple interior is conjectural.",
    ),
    hotspots: [
      spot(
        [50, 14, 30],
        "Sabratha Deniz Tiyatrosu",
        "The Maritime Theatre",
        "96 adet beyaz ve pembe mermer sütunun Akdeniz mavisine karşı yükseldiği 3 katlı sahne.",
        "The three-storey scaenae frons of 96 marble columns standing against the Mediterranean.",
      ),
      spot(
        [-40, 10, 25],
        "Antoninus Tapınağı",
        "The Temple of Antoninus",
        "Forum meydanında mermer basamaklar üzerinde yükselen korint tapınak.",
        "The classical Corinthian sanctuary commanding the civic forum from its high podium.",
      ),
      spot(
        [0, 8, -30],
        "Forum Bazilikası",
        "The Forum Basilica",
        "Akdeniz kıyısındaki deniz hamamları ve sütunlu caddelerle bağlantılı adli bazilika.",
        "The judicial basilica linked to the colonnaded coastal street and ocean baths.",
      ),
    ],
    sources: [
      {
        key: "wiki-sabratha",
        title: l("Wikipedia: Sabratha", "Wikipedia: Sabratha"),
        url: "https://en.wikipedia.org/wiki/Sabratha",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 50,
            orchestraDiameter: 18,
            lowerRows: 16,
            upperRows: 10,
            scaenaeHeight: 14,
            seatTread: 0.65,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 6,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [50, 30],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 20,
            columnHeight: 11,
            columnDiameter: 1.1,
            porchDepth: 5,
            cellaDepth: 26,
            podiumHeight: 2.6,
            entablatureHeight: 2.5,
          },
          at: [-40, 25],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 36,
            facadeHeight: 14,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 28,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 6,
            lowerOrderHeight: 7,
            upperColumns: 6,
            columnDiameter: 0.95,
            inscribed: false,
          },
          at: [0, -45],
        },
      ],
      walls: {
        length: 800,
        width: 650,
        height: 8,
        thickness: 2.8,
        towers: 14,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -20, 0, 45, 6],
        [-10, 0, 20, 0, 6],
      ],
      viewpoint: { at: [0, -10], look: [50, 10, 30] },
    },
  },
  {
    id: "palmira-kenti",
    siteSlug: "palmira",
    structure: l("Kent planı", "The City Plan"),
    title: l("Palmira (Tadmor)", "Palmyra (Tadmur)"),
    blurb: l(
      "Çölün Gelini: anıtsal Sütunlu Cadde, Bel Tapınağı Kutsal Alanı, Zafer Takı ve antik tiyatro.",
      "The Bride of the Desert: Grand Colonnade, Temple of Bel, Triumphal Arch and Roman theatre.",
    ),
    period: l("MÖ 1. - MS 3. yüzyıl", "1st century BC - 3rd century AD"),
    measures: [
      {
        value: 24,
        unit: "m",
        label: l("Bel Tapınağı: cephe genişliği", "Temple of Bel: facade width"),
        source: "wiki-palmyra",
      },
      {
        value: 15,
        unit: "m",
        label: l("Anıtsal Zafer Takı: yükseklik", "Monumental Arch: height"),
        source: "wiki-palmyra",
      },
      {
        value: 52,
        unit: "m",
        label: l("Palmira Roma Tiyatrosu: cavea çapı", "Roman Theatre: cavea diameter"),
        source: "wiki-palmyra",
      },
    ],
    uncertainty: l(
      "Sütunlu cadde ve tiyatro caveası kazılardan bilinir; Bel Tapınağı'nın iç bronz kaplamaları tahmindir.",
      "Colonnaded street and theatre are well-documented; internal bronze finishes of Bel Temple are conjectural.",
    ),
    hotspots: [
      spot(
        [-50, 12, 40],
        "Bel Tapınağı Kutsal Alanı",
        "The Temple of Bel",
        "Geniş peristilli avlu ortasında yükselen anıtsal Semitik-Greko-Romen tapınak.",
        "The grand classical sanctuary dedicated to the supreme Mesopotamian-Palmyrene god Bel.",
      ),
      spot(
        [0, 8, -65],
        "Anıtsal Zafer Takı",
        "The Monumental Arch",
        "Caddedeki 30 derecelik açı dönüşünü gizleyen dahi çift cepheli anıtsal tak.",
        "The ingenious two-faced monumental arch disguising the bend in the Grand Colonnade.",
      ),
      spot(
        [50, 10, 20],
        "Palmira Roma Tiyatrosu",
        "The Roman Theatre",
        "Çölün kalbinde korint sütunlu scaenae frons cephesine sahip zarif tiyatro.",
        "The finely restored theatre nestled into the civic heart of the oasis metropolis.",
      ),
    ],
    sources: [
      {
        key: "wiki-palmyra",
        title: l("Wikipedia: Palmyra", "Wikipedia: Palmyra"),
        url: "https://en.wikipedia.org/wiki/Palmyra",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "prostyle-temple",
            columns: 8,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 24,
            columnHeight: 13,
            columnDiameter: 1.3,
            porchDepth: 5,
            cellaDepth: 32,
            podiumHeight: 3.2,
            entablatureHeight: 3.0,
          },
          at: [-50, 40],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 3,
            archSpan: 6,
            archHeight: 8,
            totalHeight: 15,
            entablatureHeight: 3,
            columnHeight: 6.5,
            columnDiameter: 0.8,
            columnsPerFace: 2,
            pierWidth: 3.8,
            depth: 7,
          },
          at: [0, -75],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 52,
            orchestraDiameter: 18,
            lowerRows: 14,
            upperRows: 8,
            scaenaeHeight: 12,
            seatTread: 0.65,
            seatRise: 0.38,
            podiumHeight: 1.1,
            stageDepth: 7.5,
            stairways: 4,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [50, 20],
        },
      ],
      walls: {
        length: 900,
        width: 750,
        height: 8,
        thickness: 2.8,
        towers: 16,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [0, -35, 0, 50, 8],
        [-10, 0, 20, 0, 6],
      ],
      viewpoint: { at: [0, -35], look: [-50, 10, 40] },
    },
  },
  {
    id: "bosra-kenti",
    siteSlug: "bosra",
    structure: l("Kent planı", "The City Plan"),
    title: l("Bosra (Bostra)", "Bosra (Bostra)"),
    blurb: l(
      "Siyah bazalt Roma tiyatrosu mucizesi: 15.000 kişilik tiyatro, Nebati Zafer Takı ve Decumanus caddesi.",
      "The black basalt wonder: 15,000-seat theatre, Nabataean Arch and Decumanus Maximus.",
    ),
    period: l("MS 1. - 3. yüzyıl", "1st - 3rd century AD"),
    measures: [
      {
        value: 52,
        unit: "m",
        label: l("Bosra Roma Tiyatrosu: cavea çapı", "Roman Theatre: cavea diameter"),
        source: "wiki-bosra",
      },
      {
        value: 14,
        unit: "m",
        label: l("Nebati Zafer Takı: yükseklik", "Nabataean Arch: height"),
        source: "wiki-bosra",
      },
      {
        value: 36,
        unit: "m",
        label: l("Decumanus Forum Bazilikası: cephe genişliği", "Forum Basilica: facade width"),
        source: "wiki-bosra",
      },
    ],
    uncertainty: l(
      "Siyah bazalt tiyatro dünyada en kusursuz korunmuş yapıdır; Nebati zafer takının üst kornişi rekonstrüksiyondur.",
      "The black basalt theatre is among the finest preserved in the world; the Nabataean arch cornice is conjectural.",
    ),
    hotspots: [
      spot(
        [50, 14, 30],
        "Bosra Roma Tiyatrosu",
        "The Roman Theatre of Bosra",
        "Tamamı siyah bazalt taşından inşa edilmiş, 15.000 kişilik kusursuz korunan arena.",
        "The pristine 15,000-seat theatre hewn completely from dark local volcanic basalt.",
      ),
      spot(
        [0, 8, -65],
        "Nebati Zafer Takı",
        "The Nabataean Triumphal Arch",
        "Kentin batı girişini süsleyen Nebati pilasterli anıtsal kapı.",
        "The monumental western gateway featuring distinct Nabataean architectural pilasters.",
      ),
      spot(
        [-40, 10, -20],
        "Decumanus Forum Bazilikası",
        "The Forum Basilica",
        "Arabia Petraea eyaletinin idari ve adli merkezi olan bazilika.",
        "The judicial basilica at the crossroads of the imperial caravan thoroughfare.",
      ),
    ],
    sources: [
      {
        key: "wiki-bosra",
        title: l("Wikipedia: Bosra", "Wikipedia: Bosra"),
        url: "https://en.wikipedia.org/wiki/Bosra",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 52,
            orchestraDiameter: 18,
            lowerRows: 16,
            upperRows: 10,
            scaenaeHeight: 14,
            seatTread: 0.65,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 6,
            character: {
              stone: "limestone",
              ground: "plain",
              facade: "wall",
              screen: "plain",
              storeys: 1,
              topGallery: false,
            },
          },
          at: [50, 30],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 6.5,
            archHeight: 8.5,
            totalHeight: 14,
            entablatureHeight: 3.2,
            columnHeight: 7,
            columnDiameter: 0.85,
            columnsPerFace: 2,
            pierWidth: 4.2,
            depth: 6,
          },
          at: [0, -75],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 36,
            facadeHeight: 14,
            lowerColumns: 6,
            steps: 3,
            doors: 2,
            porchDepth: 4,
            hallWidth: 28,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 6,
            lowerOrderHeight: 7,
            upperColumns: 6,
            columnDiameter: 0.95,
            inscribed: false,
          },
          at: [-40, -20],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 2.8,
        towers: 14,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -35, 0, 45, 8],
        [-10, 0, 20, 0, 6],
      ],
      viewpoint: { at: [0, -35], look: [50, 10, 30] },
    },
  },
  {
    id: "babil-kenti",
    siteSlug: "babil",
    structure: l("Kent planı", "The City Plan"),
    title: l("Babil (Babylon)", "Babylon"),
    blurb: l(
      "Mezopotamya'nın taç mücevheri: mavi sırlı İştar Kapısı, Etemenanki Zigguratı ve anıtsal saraylar.",
      "The jewel of Mesopotamia: glazed Ishtar Gate, Etemenanki Ziggurat and royal palace courts.",
    ),
    period: l("MÖ 7. - 6. yüzyıl", "7th - 6th century BC"),
    measures: [
      {
        value: 14,
        unit: "m",
        label: l("İştar Kapısı: anıtsal yükseklik", "Ishtar Gate: height"),
        source: "wiki-babylon",
      },
      {
        value: 46,
        unit: "m",
        label: l("Güney Sarayı ve Taht Odası: cephe genişliği", "Southern Palace: facade width"),
        source: "wiki-babylon",
      },
      {
        value: 22,
        unit: "m",
        label: l("Marduk Tapınağı: cephe genişliği", "Temple of Marduk: facade width"),
        source: "wiki-babylon",
      },
    ],
    uncertainty: l(
      "İştar Kapısı ve tören yolu kazılardan tam bilinir; Etemenanki Zigguratı'nın üst katları tablet kayıtlarına dayanır.",
      "The Ishtar Gate and Processional Way are fully excavated; the upper ziggurat terraces follow cuneiform tablets.",
    ),
    hotspots: [
      spot(
        [0, 15.5, -81],
        "İştar Kapısı ve Tören Yolu",
        "The Ishtar Gate",
        "Mavi sırlı tuğlalar üzerinde ejderha Muşhuşşu ve boğaların parıldadığı tören kapısı.",
        "The shimmering blue glazed gate adorned with dragons and bulls leading to the Processional Way.",
      ),
      spot(
        [0, 54.5, 15],
        "Etemenanki Zigguratı ve Marduk Tapınağı",
        "Etemenanki Ziggurat and Marduk Temple",
        "7 katlı mavi sırlı kulesiyle göğün ve yerin temelini birleştiren devasa Babil kulesi.",
        "The 7-tiered ziggurat crowned with the lapis-lazuli glazed sanctuary of Marduk.",
      ),
      spot(
        [80, 5, -40],
        "Güney Sarayı ve Taht Odası",
        "The Southern Palace",
        "Kral II. Nebukadnezar'ın devasa avluları ve mavi sırlı taht salonu.",
        "The monumental imperial residence of Nebuchadnezzar II overlooking the Euphrates.",
      ),
    ],
    sources: [
      {
        key: "wiki-babylon",
        title: l("Wikipedia: Babylon", "Wikipedia: Babylon"),
        url: "https://en.wikipedia.org/wiki/Babylon",
      },
    ],
    model: {
      kind: "city",
      radius: 400,
      places: [
        {
          spec: {
            kind: "ziggurat",
            baseWidth: 70,
            baseDepth: 70,
            totalHeight: 54,
            tiers: 7,
            stairWidth: 8,
            shrineWidth: 22,
            shrineDepth: 20,
            shrineHeight: 10,
            glazedBlue: true,
            processionalGate: true,
            gateHeight: 14,
            palaceWidth: 46,
          },
          at: [0, 15],
        },
        {
          spec: {
            kind: "mudbrick-complex",
            buildings: 4,
            wallHeight: 5,
            terrace: 1.6,
          },
          at: [80, -40],
        },
      ],
      walls: {
        length: 950,
        width: 800,
        height: 9,
        thickness: 3.2,
        towers: 18,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [-45, -60, 45, -60, 6],
        [-65, -60, -65, 35, 6],
      ],
      viewpoint: { at: [0, -62], look: [0, 25, 15] },
    },
  },
  {
    id: "ur-kenti",
    siteSlug: "ur",
    structure: l("Kent planı", "The City Plan"),
    title: l("Ur (Ur Kasdim)", "Ur"),
    blurb: l(
      "Uygarlığın beşiği Sümer başkenti: Ay Tanrısı Nanna Zigguratı, kraliyet mezarları ve saray avluları.",
      "The Sumerian cradle: Great Ziggurat of moon god Nanna, royal tombs and palatial courts.",
    ),
    period: l("MÖ 21. yüzyıl", "21st century BC"),
    measures: [
      {
        value: 26,
        unit: "m",
        label: l("Ur Zigguratı Kutsal Alanı: cephe genişliği", "Ziggurat Sanctuary: facade width"),
        source: "wiki-ur",
      },
      {
        value: 12,
        unit: "m",
        label: l("Nanna Kutsal Giriş Kapısı: yükseklik", "Sanctuary Gateway: height"),
        source: "wiki-ur",
      },
      {
        value: 38,
        unit: "m",
        label: l("Sümer Kraliyet Sarayı: cephe genişliği", "Sumerian Palace: facade width"),
        source: "wiki-ur",
      },
    ],
    uncertainty: l(
      "Zigguratın devasa alt teras podyumu ve rampaları ayaktadır; üst kutsal tapınak hücresi tahmindir.",
      "The massive ziggurat terrace and monumental staircases survive; the uppermost summit shrine is conjectural.",
    ),
    hotspots: [
      spot(
        [0, 15, 20],
        "Ur Büyük Zigguratı ve Nanna Tapınağı",
        "The Great Ziggurat of Ur",
        "Ay Tanrısı Nanna'ya adanmış üç kademeli pişmiş tuğla tapınak dağı ve üçlü tören merdiveni.",
        "The colossal stepped temple tower dedicated to the moon god Nanna with triple converging stairs.",
      ),
      spot(
        [0, 12, -22],
        "Üçlü Tören Merdiveni Kapı Köşkü",
        "Triple Stairway Gateway",
        "Üç anıtsal merdivenin birinci terasta birleştiği kemerli kapı köşkü.",
        "The monumental gateway landing where the three grand stairways converge on the first terrace.",
      ),
      spot(
        [75, 5, -35],
        "Sümer Kraliyet Sarayı",
        "The Sumerian Royal Palace",
        "III. Ur Hanedanı krallarının idare sarayı ve çivi yazısı tablet arşivi.",
        "The administrative residence of the Ur-Nammu dynasty and royal tablet archives.",
      ),
    ],
    sources: [
      {
        key: "wiki-ur",
        title: l("Wikipedia: Ur", "Wikipedia: Ur"),
        url: "https://en.wikipedia.org/wiki/Ur",
      },
    ],
    model: {
      kind: "city",
      radius: 340,
      places: [
        {
          spec: {
            kind: "ziggurat",
            baseWidth: 64,
            baseDepth: 45,
            totalHeight: 30,
            tiers: 3,
            stairWidth: 6,
            shrineWidth: 26,
            shrineDepth: 12,
            shrineHeight: 6,
            tripleStairs: true,
            gateHeight: 12,
            palaceWidth: 38,
          },
          at: [0, 15],
        },
        {
          spec: {
            kind: "mudbrick-complex",
            buildings: 4,
            wallHeight: 5,
            terrace: 1.6,
          },
          at: [75, -35],
        },
      ],
      walls: {
        length: 750,
        width: 650,
        height: 7.5,
        thickness: 2.6,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -35], look: [0, 15, 15] },
    },
  },
  {
    id: "persepolis-kenti",
    siteSlug: "persepolis",
    structure: l("Kent planı", "The City Plan"),
    title: l("Persepolis (Taht-ı Cemşid)", "Persepolis (Takht-e Jamshid)"),
    blurb: l(
      "Pers İmparatorluğu'nun törensel başkenti: Tüm Milletler Kapısı, 72 sütunlu Apadana Sarayı ve Taçara.",
      "Ceremonial seat of the Persian Empire: Gate of All Nations, 72-column Apadana and Tachara palace.",
    ),
    period: l("MÖ 6. - 4. yüzyıl", "6th - 4th century BC"),
    measures: [
      {
        value: 48,
        unit: "m",
        label: l("Apadana Kabul Sarayı: cephe genişliği", "Apadana Palace: facade width"),
        source: "wiki-persepolis",
      },
      {
        value: 15,
        unit: "m",
        label: l("Tüm Milletler Kapısı: yükseklik", "Gate of All Nations: height"),
        source: "wiki-persepolis",
      },
      {
        value: 22,
        unit: "m",
        label: l("Taçara Sarayı Tapınağı: cephe genişliği", "Tachara Palace: facade width"),
        source: "wiki-persepolis",
      },
    ],
    uncertainty: l(
      "Taş teras, Lamassu boğa heykelleri ve Apadana sütunları ayaktadır; sedir ahşap kasetli tavanlar tahmindir.",
      "The colossal stone terrace, Lamassu portals and Apadana columns stand firm; cedar roof ceilings are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 16, 20],
        "Apadana Sarayı",
        "The Apadana Palace",
        "72 dev sütunun taşıdığı, çift boğa başlıklı ve sedir tavanlı anıtsal kabul salonu.",
        "The monumental audience hall of Darius supported by soaring double-bull-headed columns.",
      ),
      spot(
        [0, 8, -10],
        "Tüm Milletler Kapısı ve Kanatlı Boğalar (Lamassu)",
        "Gate of All Nations",
        "Kanatlı ve insan başlı devasa Asur tarzı Lamassu boğalarının beklediği anıtsal kapı köşkü.",
        "The imperial gateway guarded by imposing colossal winged bull colossi (Lamassu).",
      ),
      spot(
        [-80, 8, -25],
        "Taçara Darius Sarayı",
        "The Tachara Palace of Darius",
        "Cilalı gri taştan yapılmış, 'Ayna Salonu' olarak bilinen Darius'un özel sarayı.",
        "The finely polished private palace of Darius the Great overlooking the terrace.",
      ),
    ],
    sources: [
      {
        key: "wiki-persepolis",
        title: l("Wikipedia: Persepolis", "Wikipedia: Persepolis"),
        url: "https://en.wikipedia.org/wiki/Persepolis",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "persian-apadana",
            style: "apadana-hall",
            platformWidth: 48,
            platformDepth: 48,
            platformHeight: 3.5,
            totalHeight: 22,
            columns: 36,
            columnHeight: 18,
            columnDiameter: 1.4,
            gateOfNations: true,
            gateHeight: 15,
            palaceWidth: 48,
          },
          at: [0, 15],
        },
        {
          spec: {
            kind: "persian-apadana",
            style: "apadana-hall",
            platformWidth: 30,
            platformDepth: 40,
            platformHeight: 2.5,
            totalHeight: 12,
            columns: 12,
            columnHeight: 8,
            columnDiameter: 0.9,
          },
          at: [-80, -25],
        },
      ],
      walls: {
        length: 900,
        width: 750,
        height: 8.5,
        thickness: 3,
        towers: 16,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [-45, -60, 45, -60, 6],
        [-65, -60, -65, 35, 6],
      ],
      viewpoint: { at: [0, -40], look: [0, 16, 15] },
    },
  },
  {
    id: "pasargad-kenti",
    siteSlug: "pasargad",
    structure: l("Kent planı", "The City Plan"),
    title: l("Pasargad (Pasargadae)", "Pasargadae"),
    blurb: l(
      "Pers İmparatorluğu'nun kurucu başkenti: Büyük Kiros'un Anıt Mezarı, Saray P Kabul Salonu ve Çaharbağ.",
      "The dynastic cradle: Tomb of Cyrus the Great, Palace P and earliest royal Chahar Bagh.",
    ),
    period: l("MÖ 6. yüzyıl", "6th century BC"),
    measures: [
      {
        value: 16,
        unit: "m",
        label: l("Büyük Kiros'un Anıt Mezarı: taban genişliği", "Tomb of Cyrus: base width"),
        source: "wiki-pasargadae",
      },
      {
        value: 40,
        unit: "m",
        label: l("Saray P Kabul Salonu: cephe genişliği", "Palace P: facade width"),
        source: "wiki-pasargadae",
      },
    ],
    uncertainty: l(
      "Büyük Kiros'un piramidal anıt mezarı bütünüyle ayaktadır; sarayların sedir ahşap tavanları tahmindir.",
      "The stepped stone mausoleum of Cyrus stands fully intact; timber palace roofs are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 12, 15],
        "Büyük Kiros'un Anıt Mezarı",
        "The Tomb of Cyrus the Great",
        "Altı basamaklı beyaz kireçtaşı piramidal podyum üzerinde yükselen gabled anıt mezar odası.",
        "The stepped pyramidal megalithic chamber tomb commanding the sacred Morghab plain.",
      ),
      spot(
        [80, 6, -30],
        "Saray P Kabul Salonu",
        "The Residential Palace P",
        "Büyük Kiros'un elçileri kabul ettiği iki sıra sütunlu hipostil kabul salonu ve bahçeler.",
        "The grand colonnaded hypostyle hall where Cyrus received foreign ambassadors.",
      ),
      spot(
        [0, 5, -35],
        "Saray R ve Çaharbağ Bahçe Aksı",
        "Palace R and Royal Garden",
        "Dört kanatlı koruyucu cin kabartmasının bulunduğu anıtsal giriş kapısı ve sulama kanalları.",
        "The monumental royal portal bearing the relief of the Winged Genius and stone water channels.",
      ),
    ],
    sources: [
      {
        key: "wiki-pasargadae",
        title: l("Wikipedia: Pasargadae", "Wikipedia: Pasargadae"),
        url: "https://en.wikipedia.org/wiki/Pasargadae",
      },
    ],
    model: {
      kind: "city",
      radius: 350,
      places: [
        {
          spec: {
            kind: "persian-apadana",
            style: "cyrus-tomb",
            platformWidth: 38,
            platformDepth: 34,
            platformHeight: 5.5,
            totalHeight: 11.2,
            columns: 16,
            columnHeight: 5.5,
            columnDiameter: 0.75,
            palaceWidth: 40,
          },
          at: [0, 15],
        },
        {
          spec: {
            kind: "persian-apadana",
            style: "apadana-hall",
            platformWidth: 32,
            platformDepth: 40,
            platformHeight: 1.2,
            totalHeight: 10,
            columns: 30,
            columnHeight: 7,
            columnDiameter: 0.8,
          },
          at: [80, -30],
        },
      ],
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -35], look: [0, 8, 15] },
    },
  },
  {
    id: "mohencodaro-kenti",
    siteSlug: "mohencodaro",
    structure: l("Kent planı", "The City Plan"),
    title: l("Mohenjo-daro (Mohenco-daro)", "Mohenjo-daro"),
    blurb: l(
      "İndus Vadisi Uygarlığı'nın ızgara metropolü: zift yalıtımlı Büyük Hamam, tahıl ambarı ve drenaj sokakları.",
      "The Indus Valley grid metropolis: bitumen-lined Great Bath, granary and brick sewer streets.",
    ),
    period: l("MÖ 26. - 19. yüzyıl", "26th - 19th century BC"),
    measures: [
      {
        value: 24,
        unit: "m",
        label: l("Büyük Hamam Kutsal Podyumu: cephe genişliği", "Great Bath Complex: facade width"),
        source: "wiki-mohenjodaro",
      },
      {
        value: 38,
        unit: "m",
        label: l("Büyük Tahıl Ambarı: cephe genişliği", "Great Granary: facade width"),
        source: "wiki-mohenjodaro",
      },
      {
        value: 12,
        unit: "m",
        label: l("Şehir Giriş Kapısı: yükseklik", "City Gate: height"),
        source: "wiki-mohenjodaro",
      },
    ],
    uncertainty: l(
      "Büyük Hamam ve sokak drenaj kanalları yerinde eksiksiz korunmuştur; binaların ikinci kat ahşap damları tahmindir.",
      "The Great Bath and brick drainage systems are preserved; second-storey timber structures are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 2, 15],
        "Büyük Hamam ve Zift Yalıtımlı Havuz",
        "The Great Bath",
        "Doğal zift tabakasıyla yalıtılmış, tuğla basamaklı tarihin ilk halka açık su havuzu ve revaklar.",
        "The world's earliest public water tank waterproofed with natural bitumen, flanked by brick colonnades.",
      ),
      spot(
        [75, 5, -35],
        "Büyük Tahıl Ambarı ve Stupa Höyüğü",
        "The Great Granary and Stupa Mound",
        "Hava kanallı masif pişmiş tuğla podyum üzerine kurulu devasa tahıl deposu ve idari tepe.",
        "The massive brick storage podium with raised wooden air ducts for grain storage.",
      ),
      spot(
        [0, 4, -30],
        "Höyük Giriş Kapısı ve Drenaj Caddesi",
        "The Citadel Gate and Drain Street",
        "Kentin yüksek idari tepesine açılan korunaklı tuğla giriş kapısı ve fırınlanmış tuğla kanalizasyon.",
        "The fortified brick portal commanding access to the elevated citadel mound and drainage network.",
      ),
    ],
    sources: [
      {
        key: "wiki-mohenjodaro",
        title: l("Wikipedia: Mohenjo-daro", "Wikipedia: Mohenjo-daro"),
        url: "https://en.wikipedia.org/wiki/Mohenjo-daro",
      },
    ],
    model: {
      kind: "city",
      radius: 350,
      places: [
        {
          spec: {
            kind: "indic-monument",
            monumentType: "great-bath",
            baseWidth: 24,
            baseDepth: 42,
            totalHeight: 14,
            bathLength: 12,
            bathWidth: 7,
            bathDepth: 2.4,
            palaceWidth: 38,
          },
          at: [0, 15],
        },
        {
          spec: {
            kind: "mudbrick-complex",
            buildings: 4,
            wallHeight: 5,
            terrace: 1.6,
          },
          at: [75, -35],
        },
      ],
      walls: {
        length: 750,
        width: 650,
        height: 7.5,
        thickness: 2.6,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -30], look: [0, 4, 15] },
    },
  },
  {
    id: "hampi-kenti",
    siteSlug: "hampi",
    structure: l("Kent planı", "The City Plan"),
    title: l("Hampi (Vijayanagara)", "Hampi (Vijayanagara)"),
    blurb: l(
      "Vijayanagara'nın granit imparatorluk başkenti: Virupaksha Gopuram'ı, Vittala Taş Arabası ve Fil Ahırları.",
      "The granite capital of Vijayanagara: Virupaksha Gopuram, Vittala Stone Chariot and Elephant Stables.",
    ),
    period: l("14. - 16. yüzyıl", "14th - 16th century"),
    measures: [
      {
        value: 18,
        unit: "m",
        label: l("Virupaksha Gopuram Kulesi: yükseklik", "Virupaksha Gopuram: height"),
        source: "wiki-hampi",
      },
      {
        value: 20,
        unit: "m",
        label: l(
          "Vittala Taş Araba Podyumu: cephe genişliği",
          "Vittala Chariot Shrine: facade width",
        ),
        source: "wiki-hampi",
      },
      {
        value: 42,
        unit: "m",
        label: l("Fil Ahırları ve Lotus Mahal: cephe genişliği", "Elephant Stables: facade width"),
        source: "wiki-hampi",
      },
    ],
    uncertainty: l(
      "Gopuram kuleleri ve monolitik taş araba sağlamdır; ahşap kraliyet sarayları kalıntılara dayalı tahmindir.",
      "The soaring gopuram towers and stone chariot stand intact; wooden royal palace pavilions are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 50, 15],
        "Virupaksha Gopuram Kulesi",
        "Virupaksha Gopuram",
        "Tungabhadra nehrine bakan 9 katlı anıtsal granit ve tuğla tapınak giriş kulesi ve altın kalasalar.",
        "The monumental multi-tiered gateway tower crowned by golden kalasa finials.",
      ),
      spot(
        [0, 4, -14],
        "Vittala Taş Araba Tapınağı",
        "The Stone Chariot of Vittala",
        "Yekpare granit bloktan yontulmuş, mitolojik tekerlekli kutsal Garuda tapınak arabası.",
        "The iconic monolithic shrine carved to resemble an imperial temple chariot on wheels.",
      ),
      spot(
        [80, 5, -35],
        "Kraliyet Fil Ahırları ve Lotus Mahal",
        "The Royal Elephant Stables and Lotus Mahal",
        "Kubbeli 11 bölmesiyle imparatorun savaş fillerini barındıran anıtsal yapı ve saray köşkü.",
        "The grand 11-domed stables that housed ceremonial elephants and the royal pavilion.",
      ),
    ],
    sources: [
      {
        key: "wiki-hampi",
        title: l("Wikipedia: Hampi", "Wikipedia: Hampi"),
        url: "https://en.wikipedia.org/wiki/Hampi",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "indic-monument",
            monumentType: "gopuram",
            baseWidth: 38,
            baseDepth: 32,
            totalHeight: 48,
            baseHeight: 18,
            storeys: 9,
            kalasaCount: 7,
            stoneChariot: true,
            chariotWidth: 20,
            palaceWidth: 42,
          },
          at: [0, 15],
        },
        {
          spec: {
            kind: "mudbrick-complex",
            buildings: 4,
            wallHeight: 5,
            terrace: 1.6,
          },
          at: [80, -35],
        },
      ],
      walls: {
        length: 850,
        width: 700,
        height: 8,
        thickness: 2.8,
        towers: 14,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -35], look: [0, 20, 15] },
    },
  },
  {
    id: "angkor-vat-kenti",
    siteSlug: "angkor-vat",
    structure: l("Kent planı", "The City Plan"),
    title: l("Angkor Wat (Angkor Vat)", "Angkor Wat"),
    blurb: l(
      "Meru Dağı'nın taştan simgesi: Beş Nilüfer Kulesi, anıtsal su hendeği ve kabartmalı kutsal galeriler.",
      "The earthly Mount Meru: Five Lotus Towers, monumental sacred moat and relief galleries.",
    ),
    period: l("12. yüzyıl", "12th century"),
    measures: [
      {
        value: 28,
        unit: "m",
        label: l("Meru Dağı Nilüfer Kuleleri: cephe genişliği", "Five Lotus Towers: facade width"),
        source: "wiki-angkor-wat",
      },
      {
        value: 16,
        unit: "m",
        label: l("Batı Giriş Gopurası: yükseklik", "West Entrance Gopura: height"),
        source: "wiki-angkor-wat",
      },
      {
        value: 48,
        unit: "m",
        label: l(
          "Süt Denizi Kabartma Galerisi: cephe genişliği",
          "Bas-Relief Gallery: facade width",
        ),
        source: "wiki-angkor-wat",
      },
    ],
    uncertainty: l(
      "Beş kule ve taş hendek aksı günümüze sağlam ulaşmıştır; kule doruklarındaki altın varak kaplamalar tahmindir.",
      "The five towers and moat causeway stand firm; gilded bronze finials on tower pinnacles are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 71, 20],
        "Meru Dağı Beş Nilüfer Kulesi (Quincunx)",
        "The Five Lotus Towers",
        "Hindu evreninin merkezini simgeleyen 65 metre yüksekliğindeki anıtsal prasat kuleleri grubu.",
        "The soaring quincunx of lotus bud towers symbolizing the sacred peaks of Mount Meru.",
      ),
      spot(
        [0, 4, -40],
        "Naga Yılanlı Taş Köprü ve Kutsal Su Hendeği",
        "The Naga Causeway and Sacred Moat",
        "190 metrelik kutsal hendek üzerinden ana tapınağa bağlanan yedi başlı yılan balustradlı taş köprü.",
        "The monumental sandstone causeway crossing the sacred 190-metre-wide moat flanked by multi-headed Nagas.",
      ),
      spot(
        [35, 11, 20],
        "Süt Denizi Çalkalanması Galerisi",
        "Gallery of the Churning of the Ocean",
        "Tapınağın çevresini saran kabartmalı sütunlu galeri koridorları.",
        "The vast galleried colonnades enclosing the sacred tiered enclosures.",
      ),
    ],
    sources: [
      {
        key: "wiki-angkor-wat",
        title: l("Wikipedia: Angkor Wat", "Wikipedia: Angkor Wat"),
        url: "https://en.wikipedia.org/wiki/Angkor_Wat",
      },
    ],
    model: {
      kind: "city",
      radius: 400,
      places: [
        {
          spec: {
            kind: "khmer-temple",
            style: "quincunx-prasat",
            baseWidth: 80,
            baseDepth: 80,
            totalHeight: 65,
            topWidth: 28,
            tiers: 3,
            galleries: true,
            galleryWidth: 48,
            causewayLength: 16,
          },
          at: [0, 20],
        },
      ],
      walls: {
        length: 950,
        width: 850,
        height: 8.5,
        thickness: 3.2,
        towers: 16,
        gates: 4,
        gateWidth: 12,
      },
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -56], look: [0, 25, 20] },
    },
  },
  {
    id: "bayon-kenti",
    siteSlug: "bayon",
    structure: l("Kent planı", "The City Plan"),
    title: l("Bayon (Angkor Thom)", "Bayon (Angkor Thom)"),
    blurb: l(
      "Gülümseyen taş yüzlerin kutsal kenti: 216 Gülen Yüz Kulesi, dış tarihsel galeri ve Zafer Kapısı.",
      "The temple of stone smiles: 216 Serene Face Towers, outer narrative gallery and Victory Gate.",
    ),
    period: l("12. - 13. yüzyıl", "12th - 13th century"),
    measures: [
      {
        value: 24,
        unit: "m",
        label: l(
          "216 Gülen Yüz Kulesi Tapınağı: cephe genişliği",
          "Face Towers Temple: facade width",
        ),
        source: "wiki-bayon",
      },
      {
        value: 44,
        unit: "m",
        label: l("Dış Galeri Kabartma Cephesi: genişlik", "Outer Relief Gallery: width"),
        source: "wiki-bayon",
      },
      {
        value: 15,
        unit: "m",
        label: l("Angkor Thom Güney Kapısı: yükseklik", "South Gate: height"),
        source: "wiki-bayon",
      },
    ],
    uncertainty: l(
      "Taş yüz kuleleri ve kabartma duvarları bütünüyle ayaktadır; tapınak ahşap pavyon çatıları tahmindir.",
      "The face towers and bas-relief walls stand intact; wooden shrine pavilions are conjectural.",
    ),
    hotspots: [
      spot(
        [4, 38, 15],
        "216 Gülen Yüz Kulesi",
        "The 216 Face Towers",
        "54 kulede yükselen, her yöne bilgece tebessüm eden devasa bodhisattva Avalokiteshvara yüzleri.",
        "The 54 sanctuary towers bearing 216 colossal smiling faces of compassionate Avalokiteshvara.",
      ),
      spot(
        [25, 6, -5],
        "Dış Galeri Kabartmaları",
        "Outer Narrative Gallery",
        "Khmer halkının göl savaşlarını ve pazar yaşamını betimleyen olağanüstü kabartmalı galeri.",
        "The dynamic stone reliefs depicting historical battles, festivals and 12th-century life.",
      ),
      spot(
        [0, 4, -30],
        "Angkor Thom Güney Kapısı ve Naga Köprüsü",
        "The South Gate of Angkor Thom",
        "Tanrılar ve iblislerin taşıdığı kutsal yılan köprüsüyle korunan anıtsal giriş kapısı.",
        "The monumental gateway framed by the famous avenue of 54 devas and asuras pulling the serpent.",
      ),
    ],
    sources: [
      {
        key: "wiki-bayon",
        title: l("Wikipedia: Bayon", "Wikipedia: Bayon"),
        url: "https://en.wikipedia.org/wiki/Bayon",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "khmer-temple",
            style: "face-towers",
            baseWidth: 65,
            baseDepth: 65,
            totalHeight: 43,
            topWidth: 24,
            tiers: 3,
            galleries: true,
            galleryWidth: 44,
            causewayLength: 20,
            gateHeight: 15,
          },
          at: [0, 15],
        },
      ],
      walls: {
        length: 850,
        width: 750,
        height: 8,
        thickness: 2.8,
        towers: 14,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -53], look: [0, 20, 15] },
    },
  },
  {
    id: "teotihuacan-kenti",
    siteSlug: "teotihuacan",
    structure: l("Kent planı", "The City Plan"),
    title: l("Teotihuacan", "Teotihuacan"),
    blurb: l(
      "Tanrıların Şehri: 65 metre yüksekliğindeki Güneş Piramidi, Ölüler Yolu ve Tüylü Yılan Tapınağı.",
      "The City of the Gods: 65-metre Pyramid of the Sun, Avenue of the Dead and Feathered Serpent Temple.",
    ),
    period: l("MÖ 1. - MS 7. yüzyıl", "1st century BC - 7th century AD"),
    measures: [
      {
        value: 32,
        unit: "m",
        label: l("Güneş Piramidi Masif Podyumu: genişlik", "Pyramid of the Sun: podium width"),
        source: "wiki-teotihuacan",
      },
      {
        value: 46,
        unit: "m",
        label: l("Tüylü Yılan Tapınağı: cephe genişliği", "Feathered Serpent Temple: facade width"),
        source: "wiki-teotihuacan",
      },
      {
        value: 14,
        unit: "m",
        label: l("Ciudadela Giriş Kapısı: yükseklik", "Ciudadela Gate: height"),
        source: "wiki-teotihuacan",
      },
    ],
    uncertainty: l(
      "Piramit terasları ve Ölüler Yolu caddesi kesindir; piramit doruklarındaki orijinal ahşap tapınaklar tahmindir.",
      "The pyramid terraces and Avenue of the Dead are archaeologically mapped; wooden summit shrines are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 55, 25],
        "Güneş Piramidi Tepe Sunağı",
        "The Pyramid of the Sun",
        "65 metre yüksekliğinde, bir milyon metreküp hacminde Kolomb öncesi Amerika'nın en büyük anıtı.",
        "The colossal 65-metre pyramid towering above the sacred Valley of Teotihuacan.",
      ),
      spot(
        [75, 19.5, -80],
        "Tüylü Yılan (Quetzalcoatl) Tapınağı",
        "Temple of the Feathered Serpent",
        "Taştan oyulmuş yüzlerce tüylü yılan ve su tanrısı Tlaloc büstüyle bezeli anıtsal saray avlusu.",
        "The iconic sanctuary adorned with sculpted high-relief heads of Quetzalcoatl.",
      ),
      spot(
        [0, 4, -40],
        "Calzada de los Muertos (Ölüler Caddesi)",
        "The Avenue of the Dead",
        "Ciudadela'dan Ay Piramidi'ne uzanan 4 kilometrelik anıtsal tören aksı.",
        "The monumental processional avenue anchoring the entire cosmic grid of Teotihuacan.",
      ),
    ],
    sources: [
      {
        key: "wiki-teotihuacan",
        title: l("Wikipedia: Teotihuacan", "Wikipedia: Teotihuacan"),
        url: "https://en.wikipedia.org/wiki/Teotihuacan",
      },
    ],
    model: {
      kind: "city",
      radius: 400,
      places: [
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 65,
            baseDepth: 65,
            totalHeight: 62,
            tiers: 5,
            stairWidth: 14,
            templeWidth: 32,
            templeDepth: 16,
            roofCombHeight: 5,
            stelaeCount: 2,
            palaceWidth: 46,
          },
          at: [0, 25],
        },
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 35,
            baseDepth: 35,
            totalHeight: 19,
            tiers: 6,
            stairWidth: 8,
            templeWidth: 10,
            templeDepth: 8,
            roofCombHeight: 1,
          },
          at: [75, -80],
        },
      ],
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -35], look: [0, 25, 25] },
    },
  },
  {
    id: "cisen-itza-kenti",
    siteSlug: "cisen-itza",
    structure: l("Kent planı", "The City Plan"),
    title: l("Chichen Itza (Çiçen İtza)", "Chichen Itza"),
    blurb: l(
      "Maya astronomisinin zirvesi: El Castillo (Kukulkan) Piramidi, Büyük Top Sahası ve Savaşçılar Tapınağı.",
      "The Maya astronomical wonder: El Castillo (Kukulcán) Pyramid, Great Ballcourt and Warriors Temple.",
    ),
    period: l("MS 7. - 13. yüzyıl", "7th - 13th century AD"),
    measures: [
      {
        value: 26,
        unit: "m",
        label: l("El Castillo Kukulkan Piramidi: genişlik", "El Castillo Pyramid: width"),
        source: "wiki-chichen-itza",
      },
      {
        value: 44,
        unit: "m",
        label: l("Savaşçılar Tapınağı Cephesi: genişlik", "Temple of the Warriors: width"),
        source: "wiki-chichen-itza",
      },
      {
        value: 14,
        unit: "m",
        label: l("Büyük Top Sahası Girişi: yükseklik", "Great Ballcourt Portal: height"),
        source: "wiki-chichen-itza",
      },
    ],
    uncertainty: l(
      "El Castillo piramidi ve top sahası taş duvarları sağlamdır; tapınak iç ahşap hatılları tahmindir.",
      "El Castillo pyramid and the Great Ballcourt stand intact; wooden interior beams are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 26, 20],
        "El Castillo (Kukulkan Piramidi)",
        "El Castillo (Temple of Kukulcán)",
        "Dört cephesindeki basamakları yılın 365 gününe denk gelen 9 basamaklı Maya piramidi.",
        "The iconic stepped pyramid designed as a monumental physical calendar of 365 days.",
      ),
      spot(
        [65, 10, -45],
        "Savaşçılar Tapınağı",
        "Temple of the Warriors",
        "Yüzlerce yontma taş sütunla çevrili, Chac Mool heykelinin beklediği anıtsal tapınak.",
        "The grand step-pyramid framed by rows of carved square stone warrior columns.",
      ),
      spot(
        [-55, 3, -15],
        "Büyük Top Sahası (Juego de Pelota)",
        "Great Ballcourt",
        "168 metre uzunluğundaki Mezoamerika'nın en büyük kutsal top oyun alanı ve taş halkalar.",
        "The monumental arena of the sacred Mesoamerican ballgame flanked by vertical stone rings.",
      ),
    ],
    sources: [
      {
        key: "wiki-chichen-itza",
        title: l("Wikipedia: Chichen Itza", "Wikipedia: Chichen Itza"),
        url: "https://en.wikipedia.org/wiki/Chichen_Itza",
      },
    ],
    model: {
      kind: "city",
      radius: 380,
      places: [
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 55,
            baseDepth: 55,
            totalHeight: 30,
            tiers: 9,
            stairWidth: 8.5,
            templeWidth: 14,
            templeDepth: 14,
            roofCombHeight: 3.5,
            stelaeCount: 4,
          },
          at: [0, 20],
        },
        {
          spec: {
            kind: "stadium",
            overallLength: 100,
            overallWidth: 44,
            rows: 6,
            arenaWidth: 26,
            seatRise: 0.45,
            entrances: 2,
          },
          at: [-55, -20],
        },
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 40,
            baseDepth: 40,
            totalHeight: 12,
            tiers: 4,
            stairWidth: 10,
            templeWidth: 20,
            templeDepth: 14,
            roofCombHeight: 1,
          },
          at: [65, -45],
        },
      ],
      streets: [
        [38, -45, 38, 45, 6],
        [-10, -45, 40, -45, 6],
      ],
      viewpoint: { at: [0, -35], look: [0, 16, 20] },
    },
  },
  {
    id: "macu-picu-kenti",
    siteSlug: "macu-picu",
    structure: l("Kent planı", "The City Plan"),
    title: l("Machu Picchu (Maçu Piçu)", "Machu Picchu"),
    blurb: l(
      "Bulutların üstündeki İnka kalesi: Güneş Tapınağı (Torreón), Intihuatana Taşı ve tarım terasları.",
      "The Inca citadel in the clouds: Temple of the Sun (Torreón), Intihuatana and farming terraces.",
    ),
    period: l("MS 15. - 16. yüzyıl", "15th - 16th century AD"),
    measures: [
      {
        value: 18,
        unit: "m",
        label: l("Güneş Tapınağı Torreón: genişlik", "Temple of the Sun: width"),
        source: "wiki-machu-picchu",
      },
      {
        value: 36,
        unit: "m",
        label: l(
          "Kraliyet Sarayı ve Üç Pencereli Tapınak: cephe genişliği",
          "Royal Quarter: facade width",
        ),
        source: "wiki-machu-picchu",
      },
    ],
    uncertainty: l(
      "Kavisli andezit taş duvarlar ve teraslar eksiksizdir; binaların dik saz (ichu otu) çatıları tahmindir.",
      "Mortarless andesite masonry walls survive intact; thatched ichu grass roofs are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 16, 15],
        "Intihuatana ve Güneş Tapınağı (Torreón)",
        "Intihuatana and Sun Temple",
        "Güneşi bağlayan kutsal monolit taş ve doğal granit kaya üzerine oturtulmuş kavisli tapınak.",
        "The sacred astronomical hitching stone of the sun and the finely curved Torreón.",
      ),
      spot(
        [70, 4, -35],
        "Kraliyet Mahallesi ve Üç Pencereli Tapınak",
        "The Royal Quarter and Temple of Three Windows",
        "İmparator Pachacuti'nin ikametgahı ve kutsal And dağlarına bakan trapezoidal taş pencereler.",
        "The imperial residence and the iconic three trapezoidal windows framing the sacred peaks.",
      ),
      spot(
        [0, 4, -30],
        "Ana Şehir Kapısı ve Tarım Terasları",
        "The Main City Gate and Terraces",
        "İnka Yolu'ndan gelen ziyaretçileri karşılayan taş kilitli anıtsal trapezoidal kapı ve teraslar.",
        "The single fortified trapezoidal gateway controlling access from the Inca Trail.",
      ),
    ],
    sources: [
      {
        key: "wiki-machu-picchu",
        title: l("Wikipedia: Machu Picchu", "Wikipedia: Machu Picchu"),
        url: "https://en.wikipedia.org/wiki/Machu_Picchu",
      },
    ],
    model: {
      kind: "city",
      radius: 340,
      places: [
        {
          spec: {
            kind: "megalithic-platform",
            platformWidth: 54,
            platformLength: 46,
            platformHeight: 16,
            tiers: 5,
            sunGateWidth: 4.2,
            sunGateHeight: 3.2,
            monolithHeight: 3.2,
            orthostats: 8,
            sunTempleWidth: 18,
            palaceWidth: 36,
          },
          at: [0, 15],
        },
        {
          spec: {
            kind: "megalithic-platform",
            platformWidth: 30,
            platformLength: 24,
            platformHeight: 4,
            tiers: 2,
            sunGateWidth: 2,
            sunGateHeight: 2.6,
          },
          at: [70, -35],
        },
      ],
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -30], look: [0, 12, 15] },
    },
  },
  {
    id: "can-can-kenti",
    siteSlug: "can-can",
    structure: l("Kent planı", "The City Plan"),
    title: l("Chan Chan (Çan Çan)", "Chan Chan"),
    blurb: l(
      "Dünyanın en büyük kerpiç şehri: Tschudi Saray Kalesi, kabartmalı tören duvarları ve Huachaque göleti.",
      "The largest adobe city: Tschudi Citadel (Nik An), marine relief walls and Huachaque reservoir.",
    ),
    period: l("MS 9. - 15. yüzyıl", "9th - 15th century AD"),
    measures: [
      {
        value: 22,
        unit: "m",
        label: l(
          "Tschudi Tören Podyumu: cephe genişliği",
          "Tschudi Ceremonial Podium: facade width",
        ),
        source: "wiki-chan-chan",
      },
      {
        value: 42,
        unit: "m",
        label: l("Pelikan Kabartmalı Galeri Duvarı: genişlik", "Marine Relief Gallery: width"),
        source: "wiki-chan-chan",
      },
      {
        value: 12,
        unit: "m",
        label: l("Nik An Kale Giriş Kapısı: yükseklik", "Nik An Citadel Gate: height"),
        source: "wiki-chan-chan",
      },
    ],
    uncertainty: l(
      "Kerpiç kale duvarları ve kabartma panolar yerinde korunmuştur; çatıların saz ve ahşap örtüsü tahmindir.",
      "The massive adobe citadel walls and friezes survive; cane and reed roof coverings are conjectural.",
    ),
    hotspots: [
      spot(
        [0, 12, 15],
        "Tschudi Tören Podyumu (Nik An)",
        "Tschudi Ceremonial Court",
        "Chimú krallarının dinsel törenleri yönettiği yüksek kerpiç podyumlu kutsal meydan.",
        "The elevated ceremonial court where Chimú monarchs conducted state rituals.",
      ),
      spot(
        [75, 5, -35],
        "Pelikan ve Balık Kabartmalı Galeri",
        "Pelican and Fish Relief Wall",
        "Pasifik Okyanusu canlılarını betimleyen eşsiz petek örgülü kerpiç kabartma panolar ve avlular.",
        "The lattice-patterned adobe walls adorned with high reliefs of pelicans and rolling waves.",
      ),
      spot(
        [0, 4, -30],
        "Nik An Kale Giriş Kapısı ve Siq Duvarı",
        "The Nik An Citadel Gate",
        "12 metre yüksekliğindeki masif kerpiç surların koruduğu saray kalesinin ana giriş portalı.",
        "The monumental entrance through the tapered 12-metre-high adobe defensive perimeter.",
      ),
    ],
    sources: [
      {
        key: "wiki-chan-chan",
        title: l("Wikipedia: Chan Chan", "Wikipedia: Chan Chan"),
        url: "https://en.wikipedia.org/wiki/Chan_Chan",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "megalithic-platform",
            platformWidth: 65,
            platformLength: 55,
            platformHeight: 12,
            tiers: 4,
            sunGateWidth: 5.2,
            sunGateHeight: 3.6,
            orthostats: 12,
            ceremonialCourtWidth: 22,
            palaceWidth: 42,
          },
          at: [0, 15],
        },
        {
          spec: {
            kind: "mudbrick-complex",
            buildings: 4,
            wallHeight: 5,
            terrace: 1.6,
          },
          at: [75, -35],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [-55, -55, 55, -55, 6],
        [-60, -55, -60, 45, 6],
      ],
      viewpoint: { at: [0, -30], look: [0, 8, 15] },
    },
  },
  {
    id: "ostia-antica-kenti",
    siteSlug: "ostia-antica",
    structure: l("Kent planı", "The City Plan"),
    title: l("Ostia Antica", "Ostia Antica"),
    blurb: l(
      "Antik Roma'nın Tiber ağzındaki ana liman kenti: anıtsal Capitolium, tiyatro, mozaikli termal hamamlar ve çok katlı apartmanlar.",
      "Ancient Rome's primary harbour city: monumental Capitolium, Roman theatre, mosaic baths and multi-storey insula apartments.",
    ),
    period: l("MÖ 4. yüzyıl – MS 5. yüzyıl", "4th century BC – 5th century AD"),
    measures: [
      {
        value: 88,
        unit: "m",
        label: l("Ostia Roma Tiyatrosu: cavea çapı", "Roman Theatre of Ostia: cavea diameter"),
        source: "wiki-ostia-theatre",
      },
      {
        value: 16,
        unit: "m",
        label: l("Capitolium Tapınağı: cephe genişliği", "Capitolium Temple: facade width"),
        source: "wiki-ostia-capitolium",
      },
      {
        value: 28,
        unit: "m",
        label: l("Horrea Epagathiana: avlu genişliği", "Horrea Epagathiana: courtyard width"),
        source: "wiki-ostia-horrea",
      },
    ],
    uncertainty: l(
      "Tiyatro caveası ve Capitolium podyumu kazılarla ortaya çıkarılmıştır; Horrea'nın üst kat balkonları ve çatı konstrüksiyonu analojiyle tamamlanmıştır.",
      "The theatre cavea and Capitolium podium are verified by excavation; the upper storeys and roofs of the horrea are reconstructed by architectural analogy.",
    ),
    hotspots: [
      spot(
        [65, 12, 45],
        "Ostia Roma Tiyatrosu",
        "Roman Theatre of Ostia",
        "Augustus çağında Agrippa tarafından yaptırılan, Piazzale delle Corporazioni ile bütünleşik 4.000 kişilik tiyatro.",
        "Built under Agrippa in the Augustan era, seating 4,000 spectators adjacent to the Piazzale delle Corporazioni.",
      ),
      spot(
        [-45, 10, -35],
        "Capitolium Tapınağı",
        "Capitolium Temple",
        "Hadrianus döneminde inşa edilen, yüksek tuğla podyumuyla forumu taçlandıran dev mabet.",
        "Built under Emperor Hadrian, dominating the forum from a dramatic high brick podium.",
      ),
      spot(
        [-40, 6, 45],
        "Horrea Epagathiana",
        "Horrea Epagathiana",
        "Zengin tüccarların ithal mallarını depoladığı, iki katlı anıtsal kapılı tahıl ambarı.",
        "A monumental two-storey courtyard warehouse where wealthy merchants stored imported grain and luxury cargo.",
      ),
    ],
    sources: [
      {
        key: "wiki-ostia-theatre",
        title: l("Ostia Antica: Roman Theatre", "Ostia Antica: Roman Theatre"),
        url: "https://www.ostia-antica.org/regio2/2/2-1.htm",
      },
      {
        key: "wiki-ostia-capitolium",
        title: l("Ostia Antica: Capitolium", "Ostia Antica: Capitolium"),
        url: "https://www.ostia-antica.org/regio1/11/11-1.htm",
      },
      {
        key: "wiki-ostia-horrea",
        title: l("Ostia Antica: Horrea Epagathiana", "Ostia Antica: Horrea Epagathiana"),
        url: "https://www.ostia-antica.org/regio1/8/8-1.htm",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 88,
            orchestraDiameter: 25,
            scaenaeHeight: 15,
            seatTread: 0.75,
            seatRise: 0.44,
            podiumHeight: 1.4,
            stageDepth: 7.5,
            stairways: 8,
            lowerRows: 16,
            upperRows: 12,
            character: {
              stone: "limestone",
              storeys: 2,
              facade: "wall",
              screen: "plain",
              topGallery: false,
              ground: "plain",
            },
          },
          at: [65, 45],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 16,
            columnHeight: 13,
            columnDiameter: 1.3,
            porchDepth: 5.5,
            cellaDepth: 24,
            podiumHeight: 5,
            entablatureHeight: 2.8,
          },
          at: [-45, -35],
          rotate: 180,
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 2,
            courtWidth: 28,
            courtDepth: 24,
            courtColumns: 12,
            wallHeight: 8,
            roomDepth: 6,
            columnDiameter: 0.7,
            poolWidth: 8,
          },
          at: [-40, 45],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -70, 0, 70, 8],
        [-60, 0, 60, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-45, 10, -35] },
    },
  },
  {
    id: "paestum-kenti",
    siteSlug: "paestum",
    structure: l("Kent planı", "The City Plan"),
    title: l("Paestum (Poseidonia)", "Paestum"),
    blurb: l(
      "Magna Graecia'nın en iyi korunmuş kutsal alanı: devasa Dorik Hera ve Poseidon tapınakları, Roma forumu ve amfitiyatrosu.",
      "The most intact sanctuary of Magna Graecia: colossal Doric temples of Hera and Poseidon, Roman forum and amphitheatre.",
    ),
    period: l("MÖ 6. yüzyıl – MS 3. yüzyıl", "6th century BC – 3rd century AD"),
    measures: [
      {
        value: 60,
        unit: "m",
        label: l(
          "II. Hera (Poseidon) Tapınağı: stilobat uzunluğu",
          "Second Temple of Hera (Temple of Poseidon): stylobate length",
        ),
        source: "wiki-paestum-poseidon",
      },
      {
        value: 24.5,
        unit: "m",
        label: l(
          "I. Hera Tapınağı (Bazilika): stilobat genişliği",
          "First Temple of Hera (The Basilica): stylobate width",
        ),
        source: "wiki-paestum-basilica",
      },
      {
        value: 14.5,
        unit: "m",
        label: l("Athena Tapınağı: cephe genişliği", "Temple of Athena: facade width"),
        source: "wiki-paestum-athena",
      },
    ],
    uncertainty: l(
      "Üç Dorik tapınağın kireçtaşı peristasis sütunları ve arşitravları neredeyse bütünüyle günümüze ulaşmıştır; tapınak ahşap tavanları ve forum binaları kazı verilerine göre modellenmiştir.",
      "The limestone colonnades and entablatures of all three Doric temples survive virtually complete; timber ceilings and forum porticoes are based on excavation records.",
    ),
    hotspots: [
      spot(
        [50, 12, 30],
        "II. Hera (Poseidon) Tapınağı",
        "Temple of Neptune / Hera II",
        "MÖ 460 civarında inşa edilen, çift katlı iç sütun dizisiyle antik dünyanın en kusursuz Dor tapınağı.",
        "Erected around 460 BC, the most complete Doric temple in the ancient Mediterranean, retaining its interior double colonnade.",
      ),
      spot(
        [50, 10, -45],
        "I. Hera Tapınağı (Bazilika)",
        "Temple of Hera I (The Basilica)",
        "MÖ 550 civarında inşa edilen 9x18 sütunlu arkaik tapınak; olağandışı tek sayılı ön sütun dizisine sahiptir.",
        "Archaic Doric temple built around 550 BC with an unusual 9x18 column layout and entasis profiles.",
      ),
      spot(
        [-55, 8, 0],
        "Athena Tapınağı",
        "Temple of Athena (Ceres)",
        "Kutsal alanın kuzey ucunda yükselen, Dorik gövde ve İonik iç sütunları birleştiren MÖ 500 yapımı tapınak.",
        "Built around 500 BC on the northern ridge, famously uniting Doric peristyle with Ionic porch columns.",
      ),
    ],
    sources: [
      {
        key: "wiki-paestum-poseidon",
        title: l("Paestum: Temple of Hera II (Neptune)", "Paestum: Temple of Hera II (Neptune)"),
        url: "https://en.wikipedia.org/wiki/Paestum",
      },
      {
        key: "wiki-paestum-basilica",
        title: l("Paestum: Temple of Hera I (Basilica)", "Paestum: Temple of Hera I (Basilica)"),
        url: "https://en.wikipedia.org/wiki/Paestum",
      },
      {
        key: "wiki-paestum-athena",
        title: l("Paestum: Temple of Athena", "Paestum: Temple of Athena"),
        url: "https://en.wikipedia.org/wiki/Paestum",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "ionic-dipteros",
            order: "doric",
            stylobateWidth: 24.3,
            stylobateLength: 60,
            crepidomaWidth: 28,
            crepidomaLength: 64,
            crepidomaSteps: 3,
            columnHeight: 8.9,
            columnDiameter: 2.1,
            outerColumnsShort: 6,
            outerColumnsLong: 14,
            pronaosRows: 1,
            pronaosPerRow: 2,
            totalColumns: 36,
            sekosWallHeight: 12,
            naiskosWidth: 6,
            naiskosLength: 12,
            interior: "cella",
            cultStatue: "zeus",
            courtWidth: 14,
            courtLength: 44,
            entablatureHeight: 3.2,
          },
          at: [50, 30],
        },
        {
          spec: {
            kind: "ionic-dipteros",
            order: "doric",
            stylobateWidth: 24.5,
            stylobateLength: 54,
            crepidomaWidth: 28,
            crepidomaLength: 58,
            crepidomaSteps: 3,
            columnHeight: 6.5,
            columnDiameter: 1.5,
            outerColumnsShort: 9,
            outerColumnsLong: 18,
            pronaosRows: 1,
            pronaosPerRow: 3,
            totalColumns: 50,
            sekosWallHeight: 10,
            naiskosWidth: 5,
            naiskosLength: 10,
            interior: "cella",
            cultStatue: "athena",
            courtWidth: 14,
            courtLength: 38,
            entablatureHeight: 2.4,
          },
          at: [50, -70],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 14.5,
            columnHeight: 7.5,
            columnDiameter: 1.2,
            porchDepth: 4.5,
            cellaDepth: 22,
            podiumHeight: 2,
            entablatureHeight: 2.2,
          },
          at: [-55, 0],
          rotate: 90,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -70, 0, 70, 8],
        [-30, 0, 30, 0, 8],
      ],
      viewpoint: { at: [0, -20], look: [50, 10, 30] },
    },
  },
  {
    id: "akropolis-atena-kenti",
    siteSlug: "akropolis-atena",
    structure: l("Kutsal alan planı", "The Sanctuary Plan"),
    title: l("Atina Akropolisi", "Acropolis of Athens"),
    blurb: l(
      "Klasik Yunan dünyasının zirvesi: Perikles çağının Parthenon tapınağı, Karyatidli Erechtheion ve Propylaia anıtsal kapısı.",
      "The crowning jewel of Classical Greece: the Parthenon of the Periclean Golden Age, the Caryatid porch of Erechtheion and Propylaia gate.",
    ),
    period: l("MÖ 5. yüzyıl", "5th century BC"),
    measures: [
      {
        value: 31,
        unit: "m",
        label: l(
          "Parthenon (Athena Parthenos): stilobat genişliği",
          "The Parthenon (Athena Parthenos): stylobate width",
        ),
        source: "wiki-akropolis-parthenon",
      },
      {
        value: 70,
        unit: "m",
        label: l(
          "Parthenon (Athena Parthenos): stilobat uzunluğu",
          "The Parthenon (Athena Parthenos): stylobate length",
        ),
        source: "wiki-akropolis-parthenon",
      },
      {
        value: 10.4,
        unit: "m",
        label: l("Parthenon Dor sütunları: yükseklik", "The Parthenon Doric columns: height"),
        source: "wiki-akropolis-parthenon",
      },
    ],
    uncertainty: l(
      "Parthenon ve Erechtheion'un Pentelikon mermeri kaideleri ve sütunları yerindedir; ahşap kasetli tavanlar ve heykeltıraşlık frizleri arkeolojik çizimlerden rekonstrükte edilmiştir.",
      "The Pentelic marble foundations and column bases of Parthenon and Erechtheion remain in situ; coffered timber ceilings and sculptural friezes follow archaeological surveys.",
    ),
    hotspots: [
      spot(
        [40, 14, 20],
        "Parthenon (Athena Parthenos Tapınağı)",
        "The Parthenon",
        "İktinos ve Kallikrates tarafından tasarlanan, Phidias'ın heykelleriyle donatılan 8x17 sütunlu Dor başyapıtı.",
        "Masterpiece of the Doric order designed by Iktinos and Kallikrates, housing Phidias' chryselephantine Athena.",
      ),
      spot(
        [-15, 10, -35],
        "Erechtheion ve Karyatidler Balkonu",
        "Erechtheion & Caryatid Porch",
        "Karyatid heykelli kadın sütunlarıyla ünlü, kutsal zeytin ağacını ve Poseidon pınarını barındıran İon tapınağı.",
        "Asymmetrical Ionic temple enshrining sacred olive and salt spring, immortalised by its Porch of the Maidens.",
      ),
      spot(
        [-65, 10, 0],
        "Propylaia Anıtsal Giriş Kapısı",
        "The Propylaea Gateway",
        "Mnesikles tarafından tasarlanan, akropolise çıkan Panathenaia bayramı alaylarını karşılayan anıtsal mermer kapı.",
        "Monumental marble gateway designed by Mnesikles, framing the Panathenaic procession entering the sacred rock.",
      ),
    ],
    sources: [
      {
        key: "wiki-akropolis-parthenon",
        title: l("Acropolis of Athens: Parthenon", "Acropolis of Athens: Parthenon"),
        url: "https://en.wikipedia.org/wiki/Parthenon",
      },
      {
        key: "wiki-akropolis-erechtheion",
        title: l("Acropolis of Athens: Erechtheion", "Acropolis of Athens: Erechtheion"),
        url: "https://en.wikipedia.org/wiki/Erechtheion",
        context: true,
      },
      {
        key: "wiki-akropolis-propylaea",
        title: l("Acropolis of Athens: Propylaea", "Acropolis of Athens: Propylaea"),
        url: "https://en.wikipedia.org/wiki/Propylaea",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "ionic-dipteros",
            order: "doric",
            stylobateWidth: 31,
            stylobateLength: 70,
            crepidomaWidth: 34,
            crepidomaLength: 74,
            crepidomaSteps: 3,
            columnHeight: 10.4,
            columnDiameter: 1.9,
            outerColumnsShort: 8,
            outerColumnsLong: 17,
            pronaosRows: 1,
            pronaosPerRow: 6,
            totalColumns: 46,
            sekosWallHeight: 14,
            naiskosWidth: 8,
            naiskosLength: 14,
            interior: "cella",
            cultStatue: "athena",
            courtWidth: 19,
            courtLength: 48,
            entablatureHeight: 3.4,
          },
          at: [40, 20],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 14,
            columnHeight: 6.8,
            columnDiameter: 1.1,
            porchDepth: 4,
            cellaDepth: 22,
            podiumHeight: 2,
            entablatureHeight: 2,
          },
          at: [-15, -35],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 8,
            archHeight: 10,
            totalHeight: 13,
            entablatureHeight: 3,
            columnHeight: 8,
            columnDiameter: 1.2,
            columnsPerFace: 4,
            pierWidth: 8,
            depth: 15,
          },
          at: [-65, 0],
          rotate: 90,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 10,
        thickness: 3.5,
        towers: 8,
        gates: 2,
        gateWidth: 12,
      },
      streets: [[-26, 0, 18, 0, 6]],
      viewpoint: { at: [-40, -10], look: [40, 12, 20] },
    },
  },
  {
    id: "epidavros-kenti",
    siteSlug: "epidavros",
    structure: l("Kutsal alan planı", "The Sanctuary Plan"),
    title: l("Epidavros (Epidaurus)", "Epidaurus"),
    blurb: l(
      "Kusursuz akustiğe sahip antik tiyatro: şifa tanrısı Asklepios kutsal alanı, Tholos dairesel tapınağı ve stadyum.",
      "The acoustics wonder of antiquity: the 14,000-seat theatre, the healing sanctuary of Asklepios, circular Tholos and stadium.",
    ),
    period: l("MÖ 4. yüzyıl – MS 2. yüzyıl", "4th century BC – 2nd century AD"),
    measures: [
      {
        value: 114,
        unit: "m",
        label: l(
          "Epidauros Antik Tiyatrosu: cavea çapı",
          "The Ancient Theatre of Epidaurus: cavea diameter",
        ),
        source: "wiki-epidavros-theatre",
      },
      {
        value: 20,
        unit: "m",
        label: l("Orkestra dairesi çapı", "Orchestra circle diameter"),
        source: "wiki-epidavros-theatre",
      },
      {
        value: 70,
        unit: "m",
        label: l("Abaton Şifa Stoası: revak uzunluğu", "Abaton Stoa of Incubation: portico length"),
        source: "wiki-epidavros-abaton",
      },
    ],
    uncertainty: l(
      "Tiyatronun kireçtaşı oturma sıraları ve dairesel orkestrası eksiksiz korunmuştur; ahşap sahne binası ve Abaton stoası kazı buluntularına göre canlandırılmıştır.",
      "The tiered limestone auditorium and circular orchestra survive intact; the timber stage building and Abaton stoa are reconstructed from ground plans.",
    ),
    hotspots: [
      spot(
        [80, 14, 50],
        "Epidauros Antik Tiyatrosu",
        "The Ancient Theatre of Epidaurus",
        "Genç Polykleitos tarafından tasarlanan, bir madeni para sesinin en üst sıradan bile duyulduğu 14.000 kişilik tiyatro.",
        "Acoustic marvel designed by Polykleitos the Younger, where a dropped coin is audible from the 55th seating tier.",
      ),
      spot(
        [-45, 8, -35],
        "Asklepios Dor Tapınağı",
        "Temple of Asclepius",
        "MÖ 380 civarında Theodotos tarafından yapılan, fildişi ve altın tanrı heykelini barındıran kutsal tapınak.",
        "Hexastyle Doric temple built around 380 BC by Theodotos, formerly housing Thrasymedes' chryselephantine god.",
      ),
      spot(
        [-40, 6, 35],
        "Abaton (Enkoimeterion) Şifa Stoası",
        "The Abaton (Incubation Hall)",
        "Hastaların şifa bulmak ve rüyalarında tanrıyı görmek için uyudukları 70 metrelik çift katlı İonik revak.",
        "The 70-metre dual-aisled stoa where pilgrims spent the night in ritual incubation awaiting healing dreams.",
      ),
    ],
    sources: [
      {
        key: "wiki-epidavros-theatre",
        title: l("Epidaurus: Ancient Theatre", "Epidaurus: Ancient Theatre"),
        url: "https://en.wikipedia.org/wiki/Ancient_Theatre_of_Epidaurus",
      },
      {
        key: "wiki-epidavros-temple",
        title: l("Epidaurus: Temple of Asclepius", "Epidaurus: Temple of Asclepius"),
        url: "https://en.wikipedia.org/wiki/Sanctuary_of_Asclepius,_Epidaurus",
        context: true,
      },
      {
        key: "wiki-epidavros-abaton",
        title: l("Epidaurus: The Abaton", "Epidaurus: The Abaton"),
        url: "https://en.wikipedia.org/wiki/Sanctuary_of_Asclepius,_Epidaurus",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 114,
            orchestraDiameter: 20,
            scaenaeHeight: 12,
            seatTread: 0.75,
            seatRise: 0.42,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 23,
            lowerRows: 34,
            upperRows: 21,
            character: {
              stone: "limestone",
              screen: "plain",
              storeys: 1,
              topGallery: true,
              ground: "plain",
              facade: "wall",
            },
          },
          at: [80, 50],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 14,
            columnHeight: 8,
            columnDiameter: 1.0,
            porchDepth: 4,
            cellaDepth: 24,
            podiumHeight: 2,
            entablatureHeight: 2.2,
          },
          at: [-45, -35],
          rotate: 180,
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 1,
            courtWidth: 70,
            courtDepth: 16,
            courtColumns: 14,
            wallHeight: 9,
            roomDepth: 6,
            columnDiameter: 0.8,
            poolWidth: 8,
          },
          at: [-65, 50],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 6,
        thickness: 2.5,
        towers: 8,
        gates: 4,
        gateWidth: 8,
      },
      streets: [
        [0, -26, 0, 40, 6],
        [-30, 0, 40, 0, 6],
      ],
      viewpoint: { at: [0, -20], look: [80, 10, 50] },
    },
  },
  {
    id: "luksor-kenti-kenti",
    siteSlug: "luksor-kenti",
    structure: l("Tapınak kompleksi planı", "The Temple Complex Plan"),
    title: l("Luksor (Waset)", "Luxor (Thebes)"),
    blurb: l(
      "Nil kıyısındaki görkemli Amun tapınağı: III. Amenhotep ve II. Ramses'in dev pilonları, devasa kral heykelleri ve sfenksli tören yolu.",
      "The monumental temple of Amun on the Nile: colossal pylon gates of Ramesses II, giant seated colossi and avenue of sphinxes.",
    ),
    period: l("MÖ 1400 – MÖ 1000", "1400 BC – 1000 BC"),
    measures: [
      {
        value: 65,
        unit: "m",
        label: l("II. Ramses Pilon Kapısı: genişlik", "First Pylon of Ramesses II: width"),
        source: "wiki-luksor-pylon",
      },
      {
        value: 24,
        unit: "m",
        label: l("Pilon kuleleri: yükseklik", "Pylon towers: height"),
        source: "wiki-luksor-pylon",
      },
      {
        value: 52,
        unit: "m",
        label: l(
          "III. Amenhotep Sütunlu Avlusu: uzunluk",
          "Peristyle Court of Amenhotep III: length",
        ),
        source: "wiki-luksor-court",
      },
    ],
    uncertainty: l(
      "Pilon kuleleri, granit koloslar ve papirüs başlıklı dev kolonatlar eksiksiz ayaktadır; ahşap tören çatıları ve nil rıhtımı kazı rölövelerine göre modellenmiştir.",
      "The pylon towers, seated granite colossi and colossal papyrus colonnades survive standing; timber ritual roofing and Nile quays follow excavation surveys.",
    ),
    hotspots: [
      spot(
        [0, 10, -42],
        "II. Ramses Pilon Kapısı ve Dikilitaş",
        "First Pylon & Obelisk of Ramesses II",
        "Kadeş Savaşı kabartmalarıyla süslü 65 metrelik devasa pilon, 25 metrelik pembe granit dikilitaş ve dev kral kolosları.",
        "Colossal 65-metre pylon carved with the Battle of Kadesh, fronted by pink granite obelisk and colossal enthroned pharaohs.",
      ),
      spot(
        [0, 10, -20],
        "III. Amenhotep Sütunlu Avlusu ve Kolonat",
        "Colonnade & Court of Amenhotep III",
        "16 metre boyundaki kapalı papirüs başlıklı devasa sütunlarla çevrili güneş avlusu ve Opet bayramı tören mekanı.",
        "Sun court enclosed by monumental papyrus-bundle columns, the ceremonial heart of the annual Opet festival.",
      ),
      spot(
        [0, 3, -90],
        "Sfenksler Yolu (Dromos)",
        "Avenue of Sphinxes (Dromos)",
        "Luksor'dan Karnak Tapınağı'na kadar uzanan, her iki yanı insan başlı koç sfenksleriyle donatılmış 2.7 kilometrelik kutsal yol.",
        "The 2.7-kilometre processional avenue flanked by human-headed sphinxes connecting Luxor to Karnak.",
      ),
    ],
    sources: [
      {
        key: "wiki-luksor-pylon",
        title: l("Luxor Temple: The First Pylon", "Luxor Temple: The First Pylon"),
        url: "https://en.wikipedia.org/wiki/Luxor_Temple",
      },
      {
        key: "wiki-luksor-court",
        title: l("Luxor Temple: Court of Amenhotep III", "Luxor Temple: Court of Amenhotep III"),
        url: "https://en.wikipedia.org/wiki/Luxor_Temple",
      },
      {
        key: "wiki-luksor-dromos",
        title: l("Luxor: Avenue of Sphinxes", "Luxor: Avenue of Sphinxes"),
        url: "https://en.wikipedia.org/wiki/Avenue_of_Sphinxes",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "egyptian-pylon",
            facadeWidth: 65,
            pylonHeight: 24,
            pylonDepth: 14,
            portalWidth: 10,
            portalHeight: 16,
            obeliskHeight: 25,
            colossiCount: 2,
            colossusHeight: 14,
            sphinxCount: 6,
            sphinxAvenueLength: 45,
          },
          at: [0, -55],
        },
        {
          spec: {
            kind: "egyptian-hypostyle",
            width: 46,
            depth: 52,
            totalColumns: 40,
            naveColumnHeight: 16,
            sideColumnHeight: 11,
            naveColumnDiameter: 3.0,
            sideColumnDiameter: 2.2,
            open: true,
          },
          at: [0, -20],
        },
      ],
      streets: [[0, -120, 0, -75, 6]],
      viewpoint: { at: [-15, -100], look: [0, 14, -55] },
    },
  },
  {
    id: "ebu-simbel-kenti",
    siteSlug: "ebu-simbel",
    structure: l("Kutsal kaya kompleksi planı", "The Rock-Cut Precinct Plan"),
    title: l("Abu Simbel", "Abu Simbel"),
    blurb: l(
      "Nubya sınırında kayaya oyulmuş şaheser: II. Ramses'in 20 metrelik dört devasa heykeli ve Kraliçe Nefertari Hathor Tapınağı.",
      "The cliff-hewn Nubian masterpiece: four colossal 20-metre statues of Ramesses II and the Hathor temple of Queen Nefertari.",
    ),
    period: l("MÖ 13. yüzyıl", "13th century BC"),
    measures: [
      {
        value: 35,
        unit: "m",
        label: l("Büyük Tapınak kaya cephesi: genişlik", "Great Temple cliff facade: width"),
        source: "wiki-ebu-simbel-great",
      },
      {
        value: 20,
        unit: "m",
        label: l("II. Ramses kolos heykelleri: yükseklik", "Colossi of Ramesses II: height"),
        source: "wiki-ebu-simbel-great",
      },
      {
        value: 28,
        unit: "m",
        label: l("Küçük Hathor Tapınağı: cephe genişliği", "Small Temple of Hathor: facade width"),
        source: "wiki-ebu-simbel-hathor",
      },
    ],
    uncertainty: l(
      "Kayaya oyulmuş tapınak cepheleri, 20 metrelik kolos heykeller ve hipostil salonlar UNESCO taşınma operasyonunda milimetrik olarak taranmış ve belgelenmiştir.",
      "The rock-cut facades, 20-metre colossi and Osirid hypostyle halls were laser-scanned and surveyed during the UNESCO relocation.",
    ),
    hotspots: [
      spot(
        [-45, 14, 10],
        "Büyük Ramses Tapınağı",
        "The Great Temple of Ramesses II",
        "Kumtaşı dağ yamacına oyulmuş, cephesinde firavunun 20 metrelik dört taht heykeli yükselen efsanevi tapınak.",
        "Hewn into the sandstone mountain, dominated by four colossal 20-metre seated figures of the pharaoh.",
      ),
      spot(
        [35, 8, -40],
        "Küçük Nefertari (Hathor) Tapınağı",
        "Small Temple of Hathor / Nefertari",
        "Kraliçe Nefertari için adanmış, firavun ve kraliçenin eşit boyutta 10 metrelik 6 heykeliyle süslü kaya cephesi.",
        "Dedicated to Queen Nefertari and goddess Hathor, fronted by six 10-metre statues of equal royal stature.",
      ),
      spot(
        [0, 1, 10],
        "Nil Tören Rıhtımı ve Giriş Terası",
        "Nile Quay & Processional Terrace",
        "Firavun gemilerinin yanaştığı kutsal nehir iskelesi ve kurban sunusu platformu.",
        "Sacred landing terrace on the Nile where royal barges docked during border inspections and religious festivals.",
      ),
    ],
    sources: [
      {
        key: "wiki-ebu-simbel-great",
        title: l("Abu Simbel: The Great Temple", "Abu Simbel: The Great Temple"),
        url: "https://en.wikipedia.org/wiki/Abu_Simbel_temples",
      },
      {
        key: "wiki-ebu-simbel-hathor",
        title: l("Abu Simbel: Small Temple of Hathor", "Abu Simbel: Small Temple of Hathor"),
        url: "https://en.wikipedia.org/wiki/Abu_Simbel_temples",
      },
      {
        key: "wiki-ebu-simbel-unesco",
        title: l("UNESCO: Nubian Monuments from Abu Simbel to Philae", "UNESCO: Nubian Monuments"),
        url: "https://whc.unesco.org/en/list/88",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "egyptian-pylon",
            facadeWidth: 35,
            pylonHeight: 30,
            pylonDepth: 14,
            portalWidth: 6,
            portalHeight: 10,
            colossiCount: 4,
            colossusHeight: 20,
            isRockCut: true,
          },
          at: [-45, 10],
        },
        {
          spec: {
            kind: "egyptian-pylon",
            facadeWidth: 28,
            pylonHeight: 12,
            pylonDepth: 8,
            portalWidth: 3,
            portalHeight: 6,
            colossiCount: 6,
            colossusHeight: 10,
            isRockCut: true,
          },
          at: [35, -40],
        },
      ],
      streets: [[0, -25, 0, 25, 6]],
      viewpoint: { at: [-45, -48], look: [-45, 14, 10] },
    },
  },
  {
    id: "umm-qais-kenti",
    siteSlug: "umm-qais",
    structure: l("Kent planı", "The City Plan"),
    title: l("Umm Qais (Gadara)", "Umm Qais (Gadara)"),
    blurb: l(
      "Celile Denizi'ne bakan siyah bazalt Roma kenti: batı tiyatrosu, bazalt sütunlu decumanus ve yeraltı su galerileri.",
      "The black basalt Greco-Roman Decapolis city overlooking the Sea of Galilee: western theatre, colonnaded decumanus and vaulted crypts.",
    ),
    period: l("MÖ 3. yüzyıl – MS 7. yüzyıl", "3rd century BC – 7th century AD"),
    measures: [
      {
        value: 52,
        unit: "m",
        label: l(
          "Siyah Bazalt Batı Tiyatrosu: cavea çapı",
          "Black Basalt Western Theatre: cavea diameter",
        ),
        source: "wiki-umm-qais-theatre",
      },
      {
        value: 44,
        unit: "m",
        label: l(
          "Sütunlu Decumanus Maximus: cadde genişliği",
          "Colonnaded Decumanus Maximus: street width",
        ),
        source: "wiki-umm-qais-decumanus",
      },
      {
        value: 16,
        unit: "m",
        label: l(
          "Oktagonal Bizans Bazilikası: dış çap",
          "Octagonal Byzantine Basilica: outer diameter",
        ),
        source: "wiki-umm-qais-basilica",
      },
    ],
    uncertainty: l(
      "Siyah bazalt tiyatro ve Decumanus taş döşemesi sağlam kalmıştır; sekizgen bazilikanın ahşap piramidal çatısı ve kentsel konutlar rölövelere dayalı rekonstrüksiyondur.",
      "The black basalt theatre and paved Decumanus survive in excellent condition; timber pyramid roofs of the octagonal church and domestic insulae are inferred.",
    ),
    hotspots: [
      spot(
        [60, 10, 40],
        "Siyah Bazalt Batı Tiyatrosu",
        "Black Basalt Western Theatre",
        "Celile Denizi ve Golan Tepeleri manzarasına bakan, tamamı yerel siyah bazalt taşından oyulmuş 3.000 kişilik tiyatro.",
        "A 3,000-seat theatre hewn from local dark volcanic basalt, commanding sweeping views of Lake Tiberias.",
      ),
      spot(
        [-40, 8, -35],
        "Sütunlu Decumanus Maximus",
        "Decumanus Maximus",
        "Korint başlıklı bazalt sütunlarla çevrili, kenti doğudan batıya kat eden ana ticaret ve tören aksı.",
        "The monumental east-west artery paved with basalt flags and bordered by Corinthian colonnades and shops.",
      ),
      spot(
        [-40, 8, 35],
        "Oktagonal Bizans Bazilikası",
        "Octagonal Church Terrace",
        "MS 6. yüzyılda eski bir Roma tapınağının podyumu üzerine inşa edilmiş, sekizgen planlı mermer sütunlu mabet.",
        "A 6th-century central-plan basilica raised over an earlier Roman temple podium with reused columns.",
      ),
    ],
    sources: [
      {
        key: "wiki-umm-qais-theatre",
        title: l("Gadara: Western Theatre", "Gadara: Western Theatre"),
        url: "https://en.wikipedia.org/wiki/Gadara",
      },
      {
        key: "wiki-umm-qais-decumanus",
        title: l("Gadara: Decumanus Maximus", "Gadara: Decumanus Maximus"),
        url: "https://en.wikipedia.org/wiki/Gadara",
      },
      {
        key: "wiki-umm-qais-basilica",
        title: l("Gadara: Octagonal Basilica", "Gadara: Octagonal Basilica"),
        url: "https://en.wikipedia.org/wiki/Gadara",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 52,
            orchestraDiameter: 16,
            scaenaeHeight: 11,
            seatTread: 0.7,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 6,
            lowerRows: 12,
            upperRows: 8,
            character: {
              stone: "limestone",
              storeys: 1,
              facade: "wall",
              screen: "plain",
              topGallery: false,
              ground: "plain",
            },
          },
          at: [60, 40],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 44,
            facadeHeight: 12,
            lowerColumns: 8,
            steps: 2,
            doors: 2,
            porchDepth: 4,
            hallWidth: 40,
            hallDepth: 8,
            apseWidth: 4,
            nicheHeight: 3,
            wallHeight: 9,
            lowerOrderHeight: 6,
            upperColumns: 8,
            columnDiameter: 0.8,
            inscribed: false,
          },
          at: [-40, -42],
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 1,
            courtWidth: 16,
            courtDepth: 16,
            courtColumns: 6,
            wallHeight: 8,
            roomDepth: 3,
            columnDiameter: 0.6,
            poolWidth: 4,
          },
          at: [-40, 35],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 8,
      },
      streets: [
        [0, -60, 0, 60, 6],
        [-50, 0, 50, 0, 6],
      ],
      viewpoint: { at: [0, -20], look: [60, 10, 40] },
    },
  },
  {
    id: "amman-kale-kenti",
    siteSlug: "amman-kale",
    structure: l("Kale terası planı", "The Citadel Terrace Plan"),
    title: l("Amman Kalesi (Philadelphia)", "Amman Citadel"),
    blurb: l(
      "Yedi tepe üzerine kurulu kadim akropol: devasa korint sütunlu Herakles Tapınağı, Bizans bazilikası ve kubbeli Emevi Sarayı.",
      "The acropolis commanding ancient Philadelphia: monumental Temple of Hercules, Byzantine basilica and domed Umayyad Palace.",
    ),
    period: l("MÖ 2. yüzyıl – MS 8. yüzyıl", "2nd century BC – 8th century AD"),
    measures: [
      {
        value: 26,
        unit: "m",
        label: l("Herkül Tapınağı: cephe genişliği", "Temple of Hercules: facade width"),
        source: "wiki-amman-hercules",
      },
      {
        value: 13.5,
        unit: "m",
        label: l(
          "Herkül Tapınağı Korint sütunları: yükseklik",
          "Temple of Hercules Corinthian columns: height",
        ),
        source: "wiki-amman-hercules",
      },
      {
        value: 17.5,
        unit: "m",
        label: l("Büyük Emevi Su Sarnıcı: genişlik", "Great Umayyad Cistern: width"),
        source: "wiki-amman-cistern",
      },
    ],
    uncertainty: l(
      "Herkül Tapınağı podyumu ve dev Korint sütun gövdeleri akropol tepesinde yerindedir; Emevi kabul salonunun ahşap kubbesi arkeolojik restorasyon verilerine göredir.",
      "The podium of the Hercules Temple and colossal Corinthian drums stand in situ; the Umayyad monumental dome follows archaeological reconstruction models.",
    ),
    hotspots: [
      spot(
        [45, 6, 54],
        "Herkül Roma Tapınağı",
        "Temple of Hercules",
        "Marcus Aurelius döneminde inşa edilmiş, devasa mermer el heykeli kalıntısıyla ünlü 30x26 metrelik tapınak.",
        "Monumental Roman temple erected under Marcus Aurelius, famed for colossal fragments of a giant marble hand.",
      ),
      spot(
        [-40, 10, -35],
        "Emevi Sarayı Giriş Köşkü",
        "Umayyad Palace Vestibule",
        "MS 730 civarında inşa edilen, haç planlı ve anıtsal kubbeli erken İslam saray kabul salonu.",
        "Cross-in-square monumental audience hall built around 730 AD with carved stucco rosettes and restored wooden dome.",
      ),
      spot(
        [-40, 6, 35],
        "Büyük Emevi Su Sarnıcı",
        "The Great Umayyad Cistern",
        "Akropol garnizonunun ve sarayın su ihtiyacını karşılayan, taş basamaklı 17.5 metre çapındaki dev dairesel sarnıç.",
        "Circular stone-lined reservoir descending 7 metres, designed to secure the citadel's water supply during siege.",
      ),
    ],
    sources: [
      {
        key: "wiki-amman-hercules",
        title: l("Amman Citadel: Temple of Hercules", "Amman Citadel: Temple of Hercules"),
        url: "https://en.wikipedia.org/wiki/Temple_of_Hercules_(Amman)",
      },
      {
        key: "wiki-amman-palace",
        title: l("Amman Citadel: Umayyad Palace", "Amman Citadel: Umayyad Palace"),
        url: "https://en.wikipedia.org/wiki/Umayyad_Palace",
        context: true,
      },
      {
        key: "wiki-amman-cistern",
        title: l("Amman Citadel: Umayyad Cistern", "Amman Citadel: Umayyad Cistern"),
        url: "https://en.wikipedia.org/wiki/Amman_Citadel",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 26,
            columnHeight: 13.5,
            columnDiameter: 1.5,
            porchDepth: 6,
            cellaDepth: 34,
            podiumHeight: 3,
            entablatureHeight: 3,
          },
          at: [45, 50],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 6,
            archHeight: 9,
            totalHeight: 12,
            entablatureHeight: 2,
            columnHeight: 7,
            columnDiameter: 0.9,
            columnsPerFace: 4,
            pierWidth: 3.5,
            depth: 8,
          },
          at: [-40, -55],
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 1,
            courtWidth: 17.5,
            courtDepth: 17.5,
            courtColumns: 6,
            wallHeight: 6,
            roomDepth: 3,
            columnDiameter: 0.6,
            poolWidth: 5,
          },
          at: [-40, 35],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 10,
        thickness: 3.5,
        towers: 10,
        gates: 2,
        gateWidth: 8,
      },
      streets: [
        [0, -26, 0, 50, 6],
        [-30, 0, 30, 0, 6],
      ],
      viewpoint: { at: [0, -20], look: [45, 12, 30] },
    },
  },
  {
    id: "anjar-kenti",
    siteSlug: "anjar",
    structure: l("Kent planı", "The City Plan"),
    title: l("Anjar (Ancer)", "Anjar"),
    blurb: l(
      "Bekaa Vadisi'nde kusursuz Roma ızgara planlı Emevi kenti: Cardo Maximus, Tetrapylon anıtı, Büyük Saray ve hamamlar.",
      "The planned Umayyad city in the Bekaa Valley: Cardo Maximus, Tetrapylon, Grand Palace and thermal baths.",
    ),
    period: l("MS 8. yüzyıl", "8th century AD"),
    measures: [
      {
        value: 59,
        unit: "m",
        label: l("Büyük Emevi Sarayı: avlu genişliği", "Grand Umayyad Palace: courtyard width"),
        source: "wiki-anjar-palace",
      },
      {
        value: 70,
        unit: "m",
        label: l("Büyük Emevi Sarayı: avlu derinliği", "Grand Umayyad Palace: courtyard depth"),
        source: "wiki-anjar-palace",
      },
      {
        value: 12,
        unit: "m",
        label: l("Dört Yollu Tetrapylon Anıtı: genişlik", "Monumental Tetrapylon: width"),
        source: "wiki-anjar-tetrapylon",
      },
    ],
    uncertainty: l(
      "Izgara planlı surlar, kentin dört çeyreği ve saray revakları kazılarla açığa çıkarılmıştır; saray üst kat galerileri ve çatı kiremitleri аналоjiyle tamamlanmıştır.",
      "The orthogonal fortification, quadripartite plan and palace arcades are excavated; upper residential galleries are reconstructed by regional analogy.",
    ),
    hotspots: [
      spot(
        [55, 10, 45],
        "Büyük Emevi Sarayı",
        "Grand Umayyad Palace",
        "Halife I. Velid döneminde inşa edilmiş, iki katlı kemerli revaklarla çevrili 59x70 metrelik anıtsal saray avlusu.",
        "Built under Caliph Walid I, a monumental 59x70-metre palace courtyard encircled by double-tiered arcades.",
      ),
      spot(
        [0, 8, 0],
        "Dört Yollu Tetrapylon Anıtı",
        "Central Monumental Tetrapylon",
        "Cardo Maximus ve Decumanus kesişiminde yükselen, kentin dört ana sektörünü birbirine bağlayan dört ayaklı zafer anıtı.",
        "Four-way triumphal tetrapylon raised at the intersection of the Cardo and Decumanus, the symbolic civic core.",
      ),
      spot(
        [-50, 8, -40],
        "Küçük Saray ve Bazilika Kompleksi",
        "Small Palace & Mosque Precinct",
        "Saray eşrafının ikametgahı, cami ve hamam yapılarından oluşan revaklı kamu yapıları kompleksi.",
        "Residential palace quarter integrating the grand mosque, public bathhouses and administrative porticoes.",
      ),
    ],
    sources: [
      {
        key: "wiki-anjar-palace",
        title: l("Anjar: Grand Palace", "Anjar: Grand Palace"),
        url: "https://en.wikipedia.org/wiki/Anjar,_Lebanon",
      },
      {
        key: "wiki-anjar-tetrapylon",
        title: l("Anjar: Tetrapylon", "Anjar: Tetrapylon"),
        url: "https://en.wikipedia.org/wiki/Anjar,_Lebanon",
      },
      {
        key: "wiki-anjar-unesco",
        title: l("UNESCO: Anjar World Heritage", "UNESCO: Anjar"),
        url: "https://whc.unesco.org/en/list/293",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-gate",
            variant: "tetrapylon",
            openings: 2,
            archSpan: 4.5,
            archHeight: 6.5,
            totalHeight: 11,
            entablatureHeight: 2.5,
            columnHeight: 6,
            columnDiameter: 0.8,
            columnsPerFace: 4,
            pierWidth: 3.5,
            depth: 12,
          },
          at: [0, 0],
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 2,
            courtWidth: 59,
            courtDepth: 70,
            courtColumns: 24,
            wallHeight: 12,
            roomDepth: 8,
            columnDiameter: 0.9,
            poolWidth: 10,
          },
          at: [55, 45],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 42,
            facadeHeight: 13,
            lowerColumns: 8,
            steps: 2,
            doors: 2,
            porchDepth: 4,
            hallWidth: 38,
            hallDepth: 8,
            apseWidth: 4,
            nicheHeight: 3,
            wallHeight: 10,
            lowerOrderHeight: 6.5,
            upperColumns: 8,
            columnDiameter: 0.85,
            inscribed: false,
          },
          at: [-50, -40],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -70, 0, -22, 8],
        [0, 22, 0, 70, 8],
        [-70, 0, -16, 0, 8],
        [16, 0, 70, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [0, 8, 0] },
    },
  },
  {
    id: "tyre-sur-kenti",
    siteSlug: "tyre-sur",
    structure: l("Kent planı", "The City Plan"),
    title: l("Sur (Tyre)", "Tyre"),
    blurb: l(
      "Akdeniz'in erguvan kenti: dünyanın en büyük Roma hipodromlarından biri, üç kemerli Zafer Takı ve anıtsal su kemeri.",
      "The Phoenician purple-dye metropolis: the colossal Al-Bass Roman hippodrome, monumental triple triumphal arch and aqueduct.",
    ),
    period: l("MÖ 2750 – MS 6. yüzyıl", "2750 BC – 6th century AD"),
    measures: [
      {
        value: 480,
        unit: "m",
        label: l(
          "El-Bass Roma Hipodromu: toplam uzunluk",
          "Al-Bass Roman Hippodrome: overall length",
        ),
        source: "wiki-tyre-hippodrome",
      },
      {
        value: 12,
        unit: "m",
        label: l(
          "Anıtsal Üç Kemerli Zafer Takı: yükseklik",
          "Monumental Triple Triumphal Arch: height",
        ),
        source: "wiki-tyre-arch",
      },
      {
        value: 25,
        unit: "count",
        label: l("Al-Bass Su Kemeri: kemer sayısı", "Al-Bass Aqueduct: arch count"),
        source: "wiki-tyre-aqueduct",
      },
    ],
    uncertainty: l(
      "Hipodromun taş sphendone tribünleri ve üç kemerli anıtsal zafer takı yerindedir; su kemerinin kente su ileten son ayakları kazı krokilerine göre tamamlanmıştır.",
      "The stone sphendone of the hippodrome and the triple triumphal arch survive; the final piers of the aqueduct are reconstructed from survey traces.",
    ),
    hotspots: [
      spot(
        [100, 14, 60],
        "El-Bass Roma Hipodromu",
        "Al-Bass Roman Hippodrome",
        "MS 2. yüzyılda inşa edilen, 480 metre uzunluğunda ve 30.000 seyirci kapasiteli dünyanın en görkemli hipodromlarından biri.",
        "One of the largest Roman hippodromes in the empire, seating 30,000 across a 480-metre spina course.",
      ),
      spot(
        [-40, 10, -40],
        "Anıtsal Üç Kemerli Zafer Takı",
        "Monumental Triple Triumphal Arch",
        "Hadrianus döneminde inşa edilen, kente deniz tarafından yaklaşan kervanları karşılayan 22 metre genişliğindeki zafer kapısı.",
        "Hadrianic triumphal arch spanning 22 metres with triple vaulted portals greeting visitors entering the necropolis way.",
      ),
      spot(
        [-60, 6, 30],
        "Al-Bass Su Kemeri",
        "Al-Bass Roman Aqueduct",
        "Ras el-Ain kaynaklarından kente ve limana tatlı su taşıyan, taş ayaklı kemerli su iletim hattı.",
        "Aqueduct arcade channelling mountain spring water from Ras el-Ain across the isthmus into the insular harbour.",
      ),
    ],
    sources: [
      {
        key: "wiki-tyre-hippodrome",
        title: l("Tyre: Al-Bass Hippodrome", "Tyre: Al-Bass Hippodrome"),
        url: "https://en.wikipedia.org/wiki/Tyre_Hippodrome",
      },
      {
        key: "wiki-tyre-arch",
        title: l("Tyre: Triumphal Arch", "Tyre: Triumphal Arch"),
        url: "https://en.wikipedia.org/wiki/Tyre,_Lebanon",
      },
      {
        key: "wiki-tyre-aqueduct",
        title: l("Tyre: Roman Aqueduct", "Tyre: Roman Aqueduct"),
        url: "https://en.wikipedia.org/wiki/Tyre,_Lebanon",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "stadium",
            overallLength: 480,
            overallWidth: 90,
            rows: 24,
            arenaWidth: 45,
            seatRise: 0.35,
            entrances: 8,
            openEnd: false,
          },
          at: [100, 60],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 3,
            archSpan: 6.5,
            archHeight: 8.5,
            totalHeight: 12,
            entablatureHeight: 2.8,
            columnHeight: 7,
            columnDiameter: 0.85,
            columnsPerFace: 4,
            pierWidth: 3.8,
            depth: 5.5,
          },
          at: [-46, -40],
          rotate: 90,
        },
        {
          spec: {
            kind: "aqueduct",
            arches: 25,
            archHeight: 10,
            span: 4.5,
            pier: 1.8,
            width: 2.2,
            towerSide: 3,
            towerHeight: 12,
          },
          at: [-60, 30],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -50, 0, 50, 8],
        [-35, 0, 50, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, -40] },
    },
  },
  {
    id: "tarraco-kenti",
    siteSlug: "tarraco",
    structure: l("Kent planı", "The City Plan"),
    title: l("Tarraco (Tarragona)", "Tarraco"),
    blurb: l(
      "Hispania Tarraconensis başkenti: Akdeniz kıyısındaki amfitiyatro, 30.000 kişilik Roma sirki ve Les Ferreres su kemeri.",
      "Capital of Hispania Tarraconensis: coastal Roman amphitheatre, 30,000-seat circus and Les Ferreres aqueduct.",
    ),
    period: l("MÖ 3. yüzyıl – MS 5. yüzyıl", "3rd century BC – 5th century AD"),
    measures: [
      {
        value: 109,
        unit: "m",
        label: l(
          "Deniz Kıyısı Roma Amfitiyatrosu: toplam uzunluk",
          "Seaside Roman Amphitheatre: overall length",
        ),
        source: "wiki-tarraco-amphitheatre",
      },
      {
        value: 325,
        unit: "m",
        label: l(
          "Tarraco Roma Sirki (Circus): toplam uzunluk",
          "Roman Circus of Tarraco: overall length",
        ),
        source: "wiki-tarraco-circus",
      },
      {
        value: 27,
        unit: "m",
        label: l(
          "Les Ferreres (Şeytan) Su Kemeri: kemer yüksekliği",
          "Les Ferreres (Devil's) Aqueduct: arch height",
        ),
        source: "wiki-tarraco-aqueduct",
      },
    ],
    uncertainty: l(
      "Deniz kıyısındaki amfitiyatro ve Roma sirki sphendone tonozları ayaktadır; Les Ferreres su kemeri iki katlı orijinal kemer sırasıyla korunmuştur.",
      "The coastal amphitheatre and circus vaults survive intact; the double-tiered Les Ferreres aqueduct bridge is preserved in situ.",
    ),
    hotspots: [
      spot(
        [-50, 15, 40],
        "Deniz Kıyısı Roma Amfitiyatrosu",
        "Seaside Roman Amphitheatre",
        "Akdeniz yamacına oyulmuş, gladyatör dövüşleri ve Hristiyan şehitliklerine sahne olmuş 109 metrelik kıyı amfitiyatrosu.",
        "A 109-metre coastal arena carved into the Mediterranean bedrock, overlooking the sea.",
      ),
      spot(
        [50, 14, -20],
        "Tarraco Roma Sirki (Circus)",
        "Roman Circus of Tarraco",
        "Eyalet forumunun hemen altında uzanan, dört atlı araba (quadriga) yarışlarına ev sahipliği yapan 325 metrelik dev sirk.",
        "The monumental 325-metre circus integrated into the provincial forum complex for chariot racing.",
      ),
      spot(
        [-40, 28, -60],
        "Les Ferreres (Şeytan) Su Kemeri",
        "Les Ferreres (Devil's) Aqueduct",
        "Francolí nehir vadisini aşarak kente tatlı su ulaştıran, 27 metre yüksekliğinde çift katlı granit kemerli köprü.",
        "The 27-metre double-tiered Roman aqueduct bridging the Francolí river gorge.",
      ),
    ],
    sources: [
      {
        key: "wiki-tarraco-amphitheatre",
        title: l("Tarraco: Roman Amphitheatre", "Tarraco: Roman Amphitheatre"),
        url: "https://en.wikipedia.org/wiki/Tarragona_Amphitheatre",
      },
      {
        key: "wiki-tarraco-circus",
        title: l("Tarraco: Roman Circus", "Tarraco: Roman Circus"),
        url: "https://en.wikipedia.org/wiki/Circus_of_Tarraco",
      },
      {
        key: "wiki-tarraco-aqueduct",
        title: l("Tarraco: Les Ferreres Aqueduct", "Tarraco: Les Ferreres Aqueduct"),
        url: "https://en.wikipedia.org/wiki/Les_Ferreres_Aqueduct",
      },
      {
        key: "wiki-tarraco",
        title: l(
          "UNESCO: Archaeological Ensemble of Tárraco",
          "UNESCO: Archaeological Ensemble of Tárraco",
        ),
        url: "https://whc.unesco.org/en/list/875",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 109,
            outerWidth: 86,
            arenaLength: 62,
            arenaWidth: 38,
            wallHeight: 14,
            rows: 20,
            tiers: 2,
            seatRise: 0.24,
            seatTread: 0.65,
            podiumHeight: 2.8,
            bays: 48,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [-80, 50],
        },
        {
          spec: {
            kind: "stadium",
            overallLength: 325,
            overallWidth: 100,
            rows: 18,
            arenaWidth: 50,
            seatRise: 0.36,
            entrances: 6,
            openEnd: false,
          },
          at: [90, 0],
        },
        {
          spec: {
            kind: "aqueduct",
            arches: 25,
            archHeight: 27,
            span: 6.5,
            pier: 2.2,
            width: 2.5,
            towerSide: 3.5,
            towerHeight: 27,
          },
          at: [-40, -100],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -70, 0, 0, 8],
        [-20, 0, 30, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-50, 10, 40] },
    },
  },
  {
    id: "segovia-kenti",
    siteSlug: "segovia",
    structure: l("Kent planı", "The City Plan"),
    title: l("Segovia Su Kemeri ve Kenti", "Segovia"),
    blurb: l(
      "Roma mühendisliğinin harikası: harçsız granit bloklarla inşa edilmiş 167 kemerli, 28.5 metre yüksekliğindeki anıtsal su kemeri.",
      "The wonder of Roman hydraulic engineering: 167 dry-joint granite arches soaring 28.5 metres above the historic city square.",
    ),
    period: l("MS 1. – 2. yüzyıl", "1st – 2nd century AD"),
    measures: [
      {
        value: 28.5,
        unit: "m",
        label: l(
          "Çift Katlı Granit Su Kemeri: kemer yüksekliği",
          "Double-Tiered Granite Aqueduct: arch height",
        ),
        source: "wiki-segovia-aqueduct",
      },
      {
        value: 16,
        unit: "m",
        label: l("Azálvaro Forum Tapınağı: cephe genişliği", "Azálvaro Forum Temple: facade width"),
        source: "wiki-segovia-temple",
      },
      {
        value: 12,
        unit: "m",
        label: l(
          "Segovia Roma Kalesi Şehir Kapısı: toplam yükseklik",
          "Segovia Roman Citadel Gate: total height",
        ),
        source: "wiki-segovia-gate",
      },
    ],
    uncertainty: l(
      "Granit su kemeri 167 kemeriyle harçsız olarak eksiksiz ayaktadır; forum tapınağı ve sur kapıları arkeolojik kazı temel izlerine göre modellenmiştir.",
      "The dry-joint granite aqueduct stands complete with 167 arches; the forum temple and gate follow excavated foundations.",
    ),
    hotspots: [
      spot(
        [-40, 29.5, 40],
        "Çift Katlı Granit Roma Su Kemeri",
        "Double-Tiered Monumental Roman Aqueduct",
        "Fuentefria kaynaklarından kente su taşıyan, harç kullanılmadan üst üste konmuş 20.400 granit bloktan oluşan 28.5 metrelik mühendislik şaheseri.",
        "A 28.5-metre double-tiered granite masterpiece channelling mountain water across Plaza del Azoguejo.",
      ),
      spot(
        [45, 10, -25],
        "Azálvaro Forum Tapınağı",
        "Azálvaro Forum Temple",
        "Segovia'nın antik forum meydanına bakan, podyum üzerinde yükselen 16 metrelik Korint düzeni tapınak.",
        "Corinthian hexastyle temple dominating the upper forum terrace on an elevated stone podium.",
      ),
      spot(
        [0, 8, -65],
        "Segovia Roma Kalesi Şehir Kapısı",
        "Roman Citadel Gate",
        "Granit surlar arasından akropol tepesine girişi denetleyen tonozlu anıtsal şehir kapısı.",
        "Vaulted gateway flanked by stone bastions controlling access up into the walled citadel ridge.",
      ),
    ],
    sources: [
      {
        key: "wiki-segovia-aqueduct",
        title: l("Aqueduct of Segovia", "Aqueduct of Segovia"),
        url: "https://en.wikipedia.org/wiki/Aqueduct_of_Segovia",
      },
      {
        key: "wiki-segovia-temple",
        title: l("Segovia: Roman Forum Temple", "Segovia: Roman Forum Temple"),
        url: "https://en.wikipedia.org/wiki/Segovia",
      },
      {
        key: "wiki-segovia-gate",
        title: l("Segovia: Roman Walls and Gates", "Segovia: Roman Walls and Gates"),
        url: "https://en.wikipedia.org/wiki/Segovia",
      },
      {
        key: "wiki-segovia",
        title: l("UNESCO: Old Town of Segovia and its Aqueduct", "UNESCO: Old Town of Segovia"),
        url: "https://whc.unesco.org/en/list/311",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "aqueduct",
            arches: 44,
            archHeight: 28.5,
            span: 5.5,
            pier: 2.4,
            width: 2.8,
            towerSide: 4,
            towerHeight: 28.5,
          },
          at: [-40, 40],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 16,
            columnHeight: 9.5,
            columnDiameter: 1.1,
            porchDepth: 5,
            cellaDepth: 24,
            podiumHeight: 2.5,
            entablatureHeight: 2.2,
          },
          at: [45, -25],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 6,
            archHeight: 8,
            totalHeight: 12,
            entablatureHeight: 2.5,
            columnHeight: 6.5,
            columnDiameter: 0.8,
            columnsPerFace: 2,
            pierWidth: 3.5,
            depth: 5,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 14, 40] },
    },
  },
  {
    id: "pont-du-gard-kenti",
    siteSlug: "pont-du-gard",
    structure: l("Köprü aksı planı", "The Aqueduct Axis Plan"),
    title: l("Pont du Gard ve Nemausus", "Pont du Gard"),
    blurb: l(
      "Gardon Nehri üzerinde üç katlı su köprüsü: 49 metre yüksekliğinde, Nîmes kentine günde 40.000 metreküp su taşıyan Roma mühendislik harikası.",
      "The three-tier Roman aqueduct bridge soaring 49 metres over the Gardon River to supply 40,000 cubic metres of fresh spring water daily.",
    ),
    period: l("MS 1. yüzyıl", "1st century AD"),
    measures: [
      {
        value: 49,
        unit: "m",
        label: l(
          "Üç Katlı Su Kemeri Köprüsü: toplam yükseklik",
          "Three-Tier Aqueduct Bridge: total height",
        ),
        source: "wiki-pont-du-gard-bridge",
      },
      {
        value: 16,
        unit: "m",
        label: l(
          "Castellum Divisorium Su Dağıtım Yapısı: genişlik",
          "Castellum Divisorium Water Distributor: width",
        ),
        source: "wiki-pont-du-gard-castellum",
      },
      {
        value: 12,
        unit: "m",
        label: l(
          "Gardon Vadisi Zafer Takı: toplam yükseklik",
          "Gardon Valley Triumphal Arch: total height",
        ),
        source: "wiki-pont-du-gard-arch",
      },
    ],
    uncertainty: l(
      "Üç katlı su köprüsü 35 üst kemeriyle nehir üzerinde bütünüyle ayaktadır; su dağıtım havuzu ve tören kapısı kazı planlarına göre tamamlanmıştır.",
      "The three-tier aqueduct bridge survives standing with its 35 upper arches; the castellum divisorium and gateway follow archaeological traces.",
    ),
    hotspots: [
      spot(
        [-40, 18, 40],
        "Pont du Gard Üç Katlı Su Kemeri",
        "Pont du Gard Three-Tier Aqueduct Bridge",
        "Gardon Nehri'ni aşan, en üst katında Nîmes'e su ileten kapalı specus kanalını taşıyan 49 metre yüksekliğinde 3 katlı anıt köprü.",
        "The colossal 49-metre three-tier limestone arcade spanning the Gardon river chasm.",
      ),
      spot(
        [45, 8, -25],
        "Castellum Divisorium Su Dağıtım Merkezi",
        "Castellum Divisorium Water Distribution Basin",
        "Kente ulaşan kaynak suyunu kurşun borularla mahallelere, hamamlara ve çeşmelere paylaştıran dairesel dağıtım merkezi.",
        "The circular distribution reservoir with bronze sluice gates dividing the aqueduct flow into city districts.",
      ),
      spot(
        [0, 8, -65],
        "Gardon Vadisi Zafer Takı",
        "Gardon Valley Triumphal Arch",
        "Su iletim hattı boyunca uzanan Roma yolunun vadi girişini taçlandıran tek kemerli anıtsal tak.",
        "Single-bay triumphal gateway marking the processional road alongside the aqueduct valley.",
      ),
    ],
    sources: [
      {
        key: "wiki-pont-du-gard-bridge",
        title: l("Pont du Gard Aqueduct Bridge", "Pont du Gard Aqueduct Bridge"),
        url: "https://en.wikipedia.org/wiki/Pont_du_Gard",
      },
      {
        key: "wiki-pont-du-gard-castellum",
        title: l("Castellum Divisorium of Nîmes", "Castellum Divisorium of Nîmes"),
        url: "https://en.wikipedia.org/wiki/N%C3%AEmes",
      },
      {
        key: "wiki-pont-du-gard-arch",
        title: l("Pont du Gard Roman Road and Monuments", "Pont du Gard Roman Road and Monuments"),
        url: "https://en.wikipedia.org/wiki/Pont_du_Gard",
      },
      {
        key: "wiki-pont-du-gard",
        title: l("UNESCO: Pont du Gard (Roman Aqueduct)", "UNESCO: Pont du Gard"),
        url: "https://whc.unesco.org/en/list/344",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "aqueduct",
            arches: 35,
            archHeight: 49,
            span: 6.5,
            pier: 2.2,
            width: 3.0,
            towerSide: 4.5,
            towerHeight: 49,
          },
          at: [-40, 40],
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 1,
            courtWidth: 16,
            courtDepth: 16,
            courtColumns: 6,
            wallHeight: 6,
            roomDepth: 3,
            columnDiameter: 0.6,
            poolWidth: 5,
          },
          at: [45, -25],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 6.5,
            archHeight: 8.5,
            totalHeight: 12,
            entablatureHeight: 2.5,
            columnHeight: 7,
            columnDiameter: 0.85,
            columnsPerFace: 2,
            pierWidth: 3.5,
            depth: 5,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 18, 40] },
    },
  },
  {
    id: "vaison-la-romaine-kenti",
    siteSlug: "vaison-la-romaine",
    structure: l("Kent planı", "The City Plan"),
    title: l("Vaison-la-Romaine", "Vaison-la-Romaine"),
    blurb: l(
      "Fransa'nın Pompeii'si: Ouvèze üzerindeki 17 metrelik tek kemerli Roma köprüsü, lüks peristilli Messii villası ve Puymin antik tiyatrosu.",
      "The Pompeii of Gaul: 17-metre single-arch Roman bridge over the Ouvèze, expansive Messii peristyle domus and Puymin theatre.",
    ),
    period: l("MÖ 1. – MS 3. yüzyıl", "1st century BC – 3rd century AD"),
    measures: [
      {
        value: 70,
        unit: "m",
        label: l(
          "Puymin Roma Tiyatrosu: cavea dış çapı",
          "Puymin Roman Theatre: cavea outer diameter",
        ),
        source: "wiki-vaison-theatre",
      },
      {
        value: 32,
        unit: "m",
        label: l(
          "Messii Peristilli Roma Villası: avlu genişliği",
          "Messii Peristyle Roman Villa: court width",
        ),
        source: "wiki-vaison-villa",
      },
      {
        value: 17,
        unit: "m",
        label: l(
          "Ouvèze Roma Köprüsü: tek kemer açıklığı",
          "Ouvèze Roman Bridge: single arch span",
        ),
        source: "wiki-vaison-bridge",
      },
    ],
    uncertainty: l(
      "Puymin yamacındaki antik tiyatro ve Ouvèze köprüsü orijinal taş kemeriyle ayaktadır; peristilli villaların mozaik zeminleri ve avlu sütunları yerinde korunmuştur.",
      "The Puymin hillside theatre and Ouvèze bridge survive intact; peristyle villa mosaic floors and portico bases are preserved in situ.",
    ),
    hotspots: [
      spot(
        [50, 10, 40],
        "Puymin Roma Tiyatrosu",
        "Puymin Roman Theatre",
        "Puymin tepesinin doğal yamacına yaslanmış, 6.000 seyirci kapasiteli 70 metre çapındaki kireçtaşı antik tiyatro.",
        "A 6,000-seat theatre hewn into the Puymin hillside with preserved orchestra and lower cavea tiers.",
      ),
      spot(
        [-40, 8, -25],
        "Messii Peristilli Roma Villası",
        "Messii Peristyle Domus",
        "Zengin Galya-Roma aristokrat ailelerinin ikamet ettiği, sütunlu bahçe avlusu ve geometrik mozaiklerle donatılmış kent villası.",
        "Sprawling aristocratic townhouse wrapped around an expansive peristyle courtyard with marble water basins.",
      ),
      spot(
        [0, 8, -65],
        "Ouvèze Tek Kemerli Roma Köprüsü",
        "Ouvèze Single-Arch Roman Bridge",
        "Ouvèze Nehri kanyonunu tek bir 17 metrelik anıtsal kemerle aşan, 2000 yıldır kesintisiz kullanılan antik taş köprü.",
        "Monumental single-arch bridge spanning 17 metres over the Ouvèze gorge, in continuous service for two millennia.",
      ),
    ],
    sources: [
      {
        key: "wiki-vaison-theatre",
        title: l("Vaison-la-Romaine: Roman Theatre", "Vaison-la-Romaine: Roman Theatre"),
        url: "https://en.wikipedia.org/wiki/Vaison-la-Romaine",
      },
      {
        key: "wiki-vaison-villa",
        title: l("Vaison-la-Romaine: Roman Domus and Peristyles", "Vaison-la-Romaine: Roman Domus"),
        url: "https://en.wikipedia.org/wiki/Vaison-la-Romaine",
      },
      {
        key: "wiki-vaison-bridge",
        title: l("Roman Bridge of Vaison-la-Romaine", "Roman Bridge of Vaison-la-Romaine"),
        url: "https://en.wikipedia.org/wiki/Roman_Bridge_(Vaison-la-Romaine)",
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 70,
            orchestraDiameter: 18,
            scaenaeHeight: 12,
            seatTread: 0.72,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 8,
            lowerRows: 16,
            upperRows: 10,
            character: {
              stone: "limestone",
              storeys: 1,
              facade: "wall",
              screen: "plain",
              topGallery: true,
              ground: "plain",
            },
          },
          at: [50, 40],
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 2,
            courtWidth: 32,
            courtDepth: 26,
            courtColumns: 12,
            wallHeight: 8,
            roomDepth: 6,
            columnDiameter: 0.7,
            poolWidth: 8,
          },
          at: [-40, -25],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 17,
            archHeight: 9,
            totalHeight: 12,
            entablatureHeight: 2.5,
            columnHeight: 7,
            columnDiameter: 0.9,
            columnsPerFace: 2,
            pierWidth: 4,
            depth: 6,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 70, 8],
        [-50, 0, 50, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [50, 10, 40] },
    },
  },
  {
    id: "xanten-kenti",
    siteSlug: "xanten",
    structure: l("Kent planı", "The City Plan"),
    title: l("Xanten (Colonia Ulpia Traiana)", "Xanten"),
    blurb: l(
      "Ren Nehri üzerindeki Roma garnizon metropolü: anıtsal Liman Tapınağı, amfitiyatro, termal hamamlar ve çift kuleli sur kapıları.",
      "The Roman frontier metropolis on the Rhine: monumental Harbour Temple, reconstructed amphitheatre, grand baths and twin-towered gates.",
    ),
    period: l("MS 1. – 4. yüzyıl", "1st – 4th century AD"),
    measures: [
      {
        value: 22,
        unit: "m",
        label: l(
          "Ulpia Traiana Liman Tapınağı: cephe genişliği",
          "The Harbour Temple of Ulpia Traiana: facade width",
        ),
        source: "wiki-xanten-temple",
      },
      {
        value: 99,
        unit: "m",
        label: l(
          "Xanten Roma Amfitiyatrosu: toplam uzunluk",
          "Xanten Roman Amphitheatre: overall length",
        ),
        source: "wiki-xanten-amphitheatre",
      },
      {
        value: 12,
        unit: "m",
        label: l(
          "Burginatium Şehir Kapısı Kuleleri: toplam yükseklik",
          "Burginatium City Gate Towers: total height",
        ),
        source: "wiki-xanten-gate",
      },
    ],
    uncertainty: l(
      "Liman Tapınağı sütunları ve amfitiyatro orijinal temelleri üzerinde rekonstrüksiyon olarak ayağa kaldırılmıştır; surlar ve kuleler kazı planlarına dayanır.",
      "The Harbour Temple colonnade and amphitheatre have been reconstructed on original Roman foundations; city walls follow excavated layouts.",
    ),
    hotspots: [
      spot(
        [-40, 21, 35],
        "Ulpia Traiana Liman Tapınağı (Hafentempel)",
        "The Harbour Temple (Hafentempel)",
        "Ren Nehri limanına hakim podyum üzerinde yükselen, 22 metre cepheli devasa Korint düzeni anıtsal tapınak.",
        "Monumental Corinthian temple commanding the ancient Rhine harbour terrace on an elevated podium.",
      ),
      spot(
        [50, 13, -20],
        "Xanten Roma Amfitiyatrosu",
        "Xanten Roman Amphitheatre",
        "Lejyonerlerin ve kent halkının gladyatör oyunlarını izlediği, 10.000 seyirci kapasiteli 99 metrelik amfitiyatro.",
        "A 10,000-seat amphitheatre erected in Colonia Ulpia Traiana for legionary and civic spectacles.",
      ),
      spot(
        [0, 6, -56],
        "Kuzey Şehir Kapısı (Burginatium Kapısı)",
        "Northern City Gate (Burginatium Gate)",
        "İki yanında çokgen taş kuleler yükselen, kentin kuzey askeri yolunu denetleyen çift kemerli anıtsal kapı.",
        "Double-arched fortress gateway flanked by defensive towers guarding the northern military road.",
      ),
    ],
    sources: [
      {
        key: "wiki-xanten-temple",
        title: l("Colonia Ulpia Traiana: Harbour Temple", "Colonia Ulpia Traiana: Harbour Temple"),
        url: "https://en.wikipedia.org/wiki/Colonia_Ulpia_Traiana",
      },
      {
        key: "wiki-xanten-amphitheatre",
        title: l("Xanten Roman Amphitheatre", "Xanten Roman Amphitheatre"),
        url: "https://en.wikipedia.org/wiki/Colonia_Ulpia_Traiana",
      },
      {
        key: "wiki-xanten-gate",
        title: l("Xanten: Roman City Walls and Gates", "Xanten: Roman City Walls and Gates"),
        url: "https://en.wikipedia.org/wiki/Colonia_Ulpia_Traiana",
      },
      {
        key: "wiki-xanten",
        title: l(
          "UNESCO: Frontiers of the Roman Empire – Lower German Limes",
          "UNESCO: Lower German Limes",
        ),
        url: "https://whc.unesco.org/en/list/1631",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 22,
            columnHeight: 14,
            columnDiameter: 1.5,
            porchDepth: 6,
            cellaDepth: 30,
            podiumHeight: 3,
            entablatureHeight: 3,
          },
          at: [-40, 35],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 99,
            outerWidth: 78,
            arenaLength: 56,
            arenaWidth: 35,
            wallHeight: 12,
            rows: 16,
            tiers: 2,
            seatRise: 0.24,
            seatTread: 0.65,
            podiumHeight: 2.5,
            bays: 40,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [65, -35],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 2,
            archSpan: 4.5,
            archHeight: 6.5,
            totalHeight: 12,
            entablatureHeight: 2.5,
            columnHeight: 6,
            columnDiameter: 0.8,
            columnsPerFace: 4,
            pierWidth: 3,
            depth: 8,
            towerSide: 6,
            towerHeight: 12,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 12, 35] },
    },
  },
  {
    id: "saalburg-kenti",
    siteSlug: "saalburg",
    structure: l("Garnizon planı", "The Castrum Plan"),
    title: l("Saalburg Roma Kalesi", "Saalburg Roman Fort"),
    blurb: l(
      "Yukarı Cermen Limes sınırındaki Roma kohort kalesi: Principia karargah binası, horreum tahıl ambarı ve hendekli taş surlar.",
      "The fully reconstructed Roman cohort castrum on the Upper Germanic Limes: Principia headquarters, horreum granaries and ditched stone ramparts.",
    ),
    period: l("MS 2. yüzyıl", "2nd century AD"),
    measures: [
      {
        value: 42,
        unit: "m",
        label: l(
          "Principia (Karargâh Binası): avlu genişliği",
          "Principia Headquarters: court width",
        ),
        source: "wiki-saalburg-principia",
      },
      {
        value: 34,
        unit: "m",
        label: l(
          "Horreum (Büyük Askeri Tahıl Ambarı): cephe genişliği",
          "Horreum Military Granary: facade width",
        ),
        source: "wiki-saalburg-horreum",
      },
      {
        value: 10,
        unit: "m",
        label: l(
          "Porta Praetoria (Ana Giriş Kapısı): kule yüksekliği",
          "Porta Praetoria Main Fortress Gate: tower height",
        ),
        source: "wiki-saalburg-gate",
      },
    ],
    uncertainty: l(
      "Karargâh binası, horreum ambarları ve savunma surları İmparator II. Wilhelm döneminde arkeolojik rölövelere göre eksiksiz ayağa kaldırılmıştır.",
      "The headquarters complex, horreum granaries and perimeter ramparts were fully reconstructed under Kaiser Wilhelm II on original Roman footprints.",
    ),
    hotspots: [
      spot(
        [-40, 10, 30],
        "Principia (Karargâh Binası ve Sancak Odası)",
        "Principia (Headquarters & Aedes)",
        "Kohort komutanlığının, sancak mabedinin (aedes) ve askeri kasanın bulunduğu 42 metre genişliğindeki anıtsal avlulu karargah binası.",
        "The monumental castrum headquarters enclosing an open colonnaded cross-hall and legionary standard shrine.",
      ),
      spot(
        [45, 8, -20],
        "Horreum (Büyük Askeri Tahıl Ambarı)",
        "Horreum Military Granary",
        "Garnizonun aylarca sürecek kuşatmalara dayanmasını sağlayan, ahşap tabanlı ve taş payandalarla güçlendirilmiş 34 metrelik tahıl ambarı.",
        "Expansive stone granary with raised timber floors and buttresses engineered to preserve grain reserves.",
      ),
      spot(
        [0, 8, -65],
        "Porta Praetoria (Ana Güney Kapısı)",
        "Porta Praetoria (South Fortress Gate)",
        "İki yanında çift katlı nöbet kuleleri ve önünde çifte savunma hendeği bulunan anıtsal garnizon kapısı.",
        "Twin-towered castrum gate fronted by defensive ditches, controlling the military road along the Limes.",
      ),
    ],
    sources: [
      {
        key: "wiki-saalburg-principia",
        title: l("Saalburg Roman Fort: Principia", "Saalburg Roman Fort: Principia"),
        url: "https://en.wikipedia.org/wiki/Saalburg",
      },
      {
        key: "wiki-saalburg-horreum",
        title: l("Saalburg Roman Fort: Horreum", "Saalburg Roman Fort: Horreum"),
        url: "https://en.wikipedia.org/wiki/Saalburg",
      },
      {
        key: "wiki-saalburg-gate",
        title: l("Saalburg Roman Fort: Porta Praetoria", "Saalburg Roman Fort: Porta Praetoria"),
        url: "https://en.wikipedia.org/wiki/Saalburg",
      },
      {
        key: "wiki-saalburg",
        title: l(
          "UNESCO: Frontiers of the Roman Empire – Saalburg",
          "UNESCO: Frontiers of the Roman Empire",
        ),
        url: "https://whc.unesco.org/en/list/430",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 2,
            courtWidth: 42,
            courtDepth: 36,
            courtColumns: 12,
            wallHeight: 9,
            roomDepth: 6,
            columnDiameter: 0.5,
            poolWidth: 8,
          },
          at: [-40, 30],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 34,
            facadeHeight: 16,
            lowerColumns: 8,
            steps: 2,
            doors: 2,
            porchDepth: 4,
            hallWidth: 30,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 8,
            lowerOrderHeight: 9.2,
            upperColumns: 8,
            columnDiameter: 0.62,
            inscribed: false,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 2,
            archSpan: 4.2,
            archHeight: 5.8,
            totalHeight: 10,
            entablatureHeight: 2,
            columnHeight: 5.5,
            columnDiameter: 0.7,
            columnsPerFace: 4,
            pierWidth: 2.8,
            depth: 7,
            towerSide: 5,
            towerHeight: 10,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 70, 8],
        [-50, 0, 50, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "conimbriga-kenti",
    siteSlug: "conimbriga",
    structure: l("Kent planı", "The City Plan"),
    title: l("Conímbriga", "Conímbriga"),
    blurb: l(
      "Portekiz'in en zengin Roma kazı alanı: 500 fıskiyeli Çeşmeler Evi mozaikleri, revaklı forum meydanı ve koruma surları.",
      "Portugal's grandest Roman archaeological site: Casa dos Repuxos with working water jets, colonnaded civic forum and defensive walls.",
    ),
    period: l("MÖ 2. – MS 5. yüzyıl", "2nd century BC – 5th century AD"),
    measures: [
      {
        value: 38,
        unit: "m",
        label: l(
          "Çeşmeler Evi (Casa dos Repuxos): avlu genişliği",
          "House of the Fountains: peristyle court width",
        ),
        source: "wiki-conimbriga-fountains",
      },
      {
        value: 40,
        unit: "m",
        label: l(
          "Augustus Forum Bazilikası ve Hamamlar: cephe genişliği",
          "Augustan Forum Basilica & Baths: facade width",
        ),
        source: "wiki-conimbriga-forum",
      },
      {
        value: 9,
        unit: "m",
        label: l(
          "Geç Roma Savunma Surları Kapısı: kule yüksekliği",
          "Late Roman Defensive Gate: tower height",
        ),
        source: "wiki-conimbriga-walls",
      },
    ],
    uncertainty: l(
      "Çeşmeler Evi'nin mozaik zeminleri ve su kanalları eksiksiz ayaktadır; forum bazilikası ve savunma surları kazı temellerine göre rekonstrüksiyondur.",
      "The peristyle mosaics and hydraulic water channels of Casa dos Repuxos are preserved in situ; forum and ramparts follow excavated layouts.",
    ),
    hotspots: [
      spot(
        [-40, 8, 30],
        "Çeşmeler Evi (Casa dos Repuxos)",
        "House of the Fountains (Casa dos Repuxos)",
        "Merkezinde mitolojik sahneli mozaikler ve 500 fıskiyeli hidrolik su bahçesi bulunan aristokrat Roma malikanesi.",
        "A lavish aristocratic domus built around a central peristyle garden with over 500 functioning hydraulic water jets.",
      ),
      spot(
        [45, 10, -20],
        "Augustus Forum Bazilikası ve Hamamlar",
        "Augustan Forum Basilica & Baths",
        "İmparator Augustus döneminde kurulan, revaklı adli bazilika ve anıtsal halk hamamları kompleksi.",
        "The civic judicial basilica and monumental public thermal baths anchoring the Flavian forum.",
      ),
      spot(
        [0, 8, -65],
        "Geç Roma Şehir Kapısı",
        "Late Roman Fortified City Gate",
        "Suevi ve Vizigot akınlarına karşı kentin merkezini korumak için MS 4. yüzyılda inşa edilen kuleli savunma kapısı.",
        "A fortified gate and bastion erected in the 4th century across the urban core against barbarian invasions.",
      ),
    ],
    sources: [
      {
        key: "wiki-conimbriga-fountains",
        title: l("Conímbriga: Casa dos Repuxos", "Conímbriga: Casa dos Repuxos"),
        url: "https://en.wikipedia.org/wiki/Con%C3%ADmbriga",
      },
      {
        key: "wiki-conimbriga-forum",
        title: l("Conímbriga: Forum and Basilica", "Conímbriga: Forum and Basilica"),
        url: "https://en.wikipedia.org/wiki/Con%C3%ADmbriga",
      },
      {
        key: "wiki-conimbriga-walls",
        title: l("Conímbriga: City Walls and Gates", "Conímbriga: City Walls and Gates"),
        url: "https://en.wikipedia.org/wiki/Con%C3%ADmbriga",
      },
      {
        key: "wiki-conimbriga",
        title: l("Wikipedia: Conímbriga", "Wikipedia: Conímbriga"),
        url: "https://en.wikipedia.org/wiki/Con%C3%ADmbriga",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 1,
            courtWidth: 38,
            courtDepth: 32,
            courtColumns: 14,
            wallHeight: 7,
            roomDepth: 5,
            columnDiameter: 0.5,
            poolWidth: 10,
          },
          at: [-45, 45],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 40,
            facadeHeight: 16,
            lowerColumns: 8,
            steps: 1,
            doors: 2,
            porchDepth: 4,
            hallWidth: 32,
            hallDepth: 12,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 8,
            lowerOrderHeight: 9.2,
            upperColumns: 8,
            columnDiameter: 0.5,
            inscribed: false,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 5,
            archHeight: 6.5,
            totalHeight: 9,
            entablatureHeight: 2,
            columnHeight: 6,
            columnDiameter: 0.8,
            columnsPerFace: 4,
            pierWidth: 3.5,
            depth: 6,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-5, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 8, 30] },
    },
  },
  {
    id: "evora-roma-kenti",
    siteSlug: "evora-roma",
    structure: l("Akropol planı", "The Acropolis Plan"),
    title: l("Évora Roma Tapınağı ve Kenti", "Évora (Liberalitas Iulia)"),
    blurb: l(
      "İberya'nın en iyi korunmuş Roma tapınağı: 14 adet korint granit sütunu, mermer başlıkları ve antik akropol meydanı.",
      "The best-preserved classical temple in Iberia: 14 standing Corinthian granite columns with Estremoz marble capitals in the civic forum.",
    ),
    period: l("MS 1. – 3. yüzyıl", "1st – 3rd century AD"),
    measures: [
      {
        value: 15,
        unit: "m",
        label: l(
          "Évora Roma Tapınağı: podyum cephe genişliği",
          "Roman Temple of Évora: podium facade width",
        ),
        source: "wiki-evora-temple",
      },
      {
        value: 7.7,
        unit: "m",
        label: l("Korint Düzeni Granit Sütunlar: yükseklik", "Corinthian Granite Columns: height"),
        source: "wiki-evora-temple",
      },
      {
        value: 18,
        unit: "m",
        label: l(
          "Água de Prata Su Kemeri: kemer yüksekliği",
          "Água de Prata Aqueduct: arch height",
        ),
        source: "wiki-evora-aqueduct",
      },
    ],
    uncertainty: l(
      "Diana Tapınağı'nın 14 granit sütunu ve arşitravı Orta Çağ kalesine dahil edildiği için eksiksiz günümüze kalmıştır; Água de Prata su kemeri orijinal güzergahında korunur.",
      "Fourteen granite columns and marble architraves of the temple survive complete having been walled into a medieval castle; the aqueduct follows its Roman line.",
    ),
    hotspots: [
      spot(
        [-40, 14, 30],
        "Évora Roma Tapınağı (Diana Tapınağı)",
        "Roman Temple of Évora",
        "İmparator Augustus kültüne adanmış, 3.5 metre yüksekliğindeki granit podyum üzerinde yükselen 14 Korint sütunlu anıt mabet.",
        "A hexastyle Corinthian temple erected on a 3.5-metre granite podium, preserving fourteen original monolith columns.",
      ),
      spot(
        [45, 19, -25],
        "Água de Prata (Gümüş Su) Kemeri",
        "Água de Prata Aqueduct",
        "Graça do Divor kaynaklarından akropole su getiren, 18 metre yüksekliğinde taş kemerli anıtsal su köprüsü.",
        "Monumental aqueduct arcade channelling spring water across the Alentejo plains into the summit cisterns.",
      ),
      spot(
        [0, 11, -65],
        "Roma Termal Hamamları ve Kapı",
        "Roman Public Baths & Portal",
        "Akropol tepesinde yer alan, lakonikum (sıcak hava odası) ve soğukluk havuzlarına sahip imparatorluk kamu hamamı kompleksi.",
        "Imperial bath complex complete with circular laconicum and natatio pools uncovered beneath the town hall.",
      ),
    ],
    sources: [
      {
        key: "wiki-evora-temple",
        title: l("Roman Temple of Évora", "Roman Temple of Évora"),
        url: "https://en.wikipedia.org/wiki/Roman_Temple_of_%C3%89vora",
      },
      {
        key: "wiki-evora-aqueduct",
        title: l("Aqueduto da Água de Prata", "Aqueduto da Água de Prata"),
        url: "https://en.wikipedia.org/wiki/Aqueduto_da_%C3%81gua_de_Prata",
      },
      {
        key: "wiki-evora-baths",
        title: l("Roman Baths of Évora", "Roman Baths of Évora"),
        url: "https://en.wikipedia.org/wiki/%C3%89vora",
        context: true,
      },
      {
        key: "wiki-evora-roma",
        title: l("UNESCO: Historic Centre of Évora", "UNESCO: Historic Centre of Évora"),
        url: "https://whc.unesco.org/en/list/361",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 15,
            columnHeight: 7.7,
            columnDiameter: 1.1,
            porchDepth: 4.5,
            cellaDepth: 25,
            podiumHeight: 3.5,
            entablatureHeight: 2.2,
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "aqueduct",
            arches: 28,
            archHeight: 18,
            span: 5.5,
            pier: 2.2,
            width: 2.4,
            towerSide: 3.5,
            towerHeight: 18,
          },
          at: [65, -25],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 5.5,
            archHeight: 7,
            totalHeight: 10,
            entablatureHeight: 2.2,
            columnHeight: 5.5,
            columnDiameter: 0.75,
            columnsPerFace: 2,
            pierWidth: 3,
            depth: 4.5,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -20, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "salona-kenti",
    siteSlug: "salona",
    structure: l("Kent planı", "The City Plan"),
    title: l("Salona (Solin)", "Salona"),
    blurb: l(
      "Dalmaçya eyaletinin 60.000 nüfuslu başkenti: 17.000 kişilik Roma amfitiyatrosu, Porta Caesarea kapısı ve Hıristiyan bazilikaları.",
      "The 60,000-citizen capital of Dalmatia: colossal 17,000-seat amphitheatre, monumental Porta Caesarea and early Christian episcopal basilicas.",
    ),
    period: l("MÖ 1. – MS 6. yüzyıl", "1st century BC – 6th century AD"),
    measures: [
      {
        value: 125,
        unit: "m",
        label: l(
          "Salona Roma Amfitiyatrosu: toplam uzunluk",
          "Salona Roman Amphitheatre: overall length",
        ),
        source: "wiki-salona-amphitheatre",
      },
      {
        value: 45,
        unit: "m",
        label: l(
          "Manastirine Piskoposluk Bazilikası: cephe genişliği",
          "Manastirine Episcopal Basilica: facade width",
        ),
        source: "wiki-salona-basilica",
      },
      {
        value: 11,
        unit: "m",
        label: l(
          "Porta Caesarea Anıtsal Giriş Kapısı: yükseklik",
          "Porta Caesarea Monumental City Gate: height",
        ),
        source: "wiki-salona-gate",
      },
    ],
    uncertainty: l(
      "Salona amfitiyatrosu taş alt yapısı ve Porta Caesarea üç kemerli geçidi yerindedir; Manastirine nekropol bazilikası rölöve izlerine dayanır.",
      "The stone foundations of the amphitheatre and triple-portal Porta Caesarea survive in situ; the Manastirine basilica follows excavation surveys.",
    ),
    hotspots: [
      spot(
        [-50, 16, 40],
        "Salona Roma Amfitiyatrosu",
        "Roman Amphitheatre of Salona",
        "MS 2. yüzyılda kentin kuzeybatı köşesine inşa edilen, 17.000 seyirci kapasiteli 125 metrelik devasa eliptik arena.",
        "A monumental 17,000-capacity amphitheatre built in the 2nd century AD on the northwestern city perimeter.",
      ),
      spot(
        [45, 14, -20],
        "Manastirine Piskoposluk Bazilikası",
        "Manastirine Episcopal Basilica",
        "Şehit Aziz Domnius'un mezarı üzerine inşa edilen, üç nefli erken Hıristiyan bazilikası ve vaftizhane kompleksi.",
        "Early Christian three-aisled cathedral and martyrium erected over the burial of Saint Domnius.",
      ),
      spot(
        [0, 6, -56],
        "Porta Caesarea Anıtsal Giriş Kapısı",
        "Porta Caesarea Monumental Gate",
        "İki yanında sekizgen savunma kuleleri bulunan, kente batıdan girişi sağlayan üç kemerli anıtsal imparatorluk kapısı.",
        "Monumental triple-arched gate with octagonal flanking towers controlling the Roman highway into Salona.",
      ),
    ],
    sources: [
      {
        key: "wiki-salona-amphitheatre",
        title: l("Salona: Roman Amphitheatre", "Salona: Roman Amphitheatre"),
        url: "https://en.wikipedia.org/wiki/Salona",
      },
      {
        key: "wiki-salona-basilica",
        title: l("Salona: Early Christian Basilicas", "Salona: Early Christian Basilicas"),
        url: "https://en.wikipedia.org/wiki/Salona",
      },
      {
        key: "wiki-salona-gate",
        title: l("Salona: Porta Caesarea", "Salona: Porta Caesarea"),
        url: "https://en.wikipedia.org/wiki/Salona",
      },
      {
        key: "wiki-salona",
        title: l("Wikipedia: Salona (Solin)", "Wikipedia: Salona"),
        url: "https://en.wikipedia.org/wiki/Salona",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 125,
            outerWidth: 100,
            arenaLength: 65,
            arenaWidth: 40,
            wallHeight: 15,
            rows: 22,
            tiers: 2,
            seatRise: 0.24,
            seatTread: 0.65,
            podiumHeight: 2.8,
            bays: 56,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [-80, 55],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 45,
            facadeHeight: 13,
            lowerColumns: 8,
            steps: 2,
            doors: 3,
            porchDepth: 4,
            hallWidth: 40,
            hallDepth: 16,
            apseWidth: 8,
            nicheHeight: 3,
            wallHeight: 9,
            lowerOrderHeight: 6.5,
            upperColumns: 8,
            columnDiameter: 0.85,
            inscribed: false,
          },
          at: [50, -35],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 3,
            archSpan: 5.5,
            archHeight: 7.5,
            totalHeight: 11,
            entablatureHeight: 2.4,
            columnHeight: 6,
            columnDiameter: 0.8,
            columnsPerFace: 4,
            pierWidth: 3.2,
            depth: 7,
            towerSide: 5,
            towerHeight: 11,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-50, 10, 40] },
    },
  },
  {
    id: "pula-kenti",
    siteSlug: "pula",
    structure: l("Kent planı", "The City Plan"),
    title: l("Pula (Pola)", "Pula"),
    blurb: l(
      "Adriyatik'in Colosseum'u: kireçtaşından dört kulesiyle ayakta duran 23.000 kişilik arena, Augustus Tapınağı ve Sergii Zafer Takı.",
      "The Colosseum of the Adriatic: perfectly preserved four-towered Roman Arena, pristine Temple of Augustus and Arch of the Sergii.",
    ),
    period: l("MÖ 1. – MS 2. yüzyıl", "1st century BC – 2nd century AD"),
    measures: [
      {
        value: 132,
        unit: "m",
        label: l("Pula Roma Arenası: dış eksen uzunluğu", "Pula Roman Arena: outer axis length"),
        source: "wiki-pula-arena",
      },
      {
        value: 12,
        unit: "m",
        label: l(
          "Augustus ve Roma Tapınağı: cephe genişliği",
          "Temple of Augustus and Roma: facade width",
        ),
        source: "wiki-pula-temple",
      },
      {
        value: 8,
        unit: "m",
        label: l(
          "Sergii Zafer Takı (Altın Kapı): toplam yükseklik",
          "Triumphal Arch of the Sergii: total height",
        ),
        source: "wiki-pula-arch",
      },
    ],
    uncertainty: l(
      "Pula Arenası 32 metrelik üç katlı kireçtaşı dış cephesiyle neredeyse bütünüyle ayaktadır; Augustus Tapınağı ve Sergii Takı eksiksiz korunmuştur.",
      "The three-storey 32-metre limestone exterior of Pula Arena survives intact; the Temple of Augustus and Arch of the Sergii stand in pristine condition.",
    ),
    hotspots: [
      spot(
        [-50, 33, 40],
        "Pula Roma Arenası (Amfitiyatro)",
        "Pula Roman Arena",
        "Vespasianus döneminde beyaz kireçtaşından inşa edilmiş, dört köşe kulesi ve 72 kemerli galerisiyle ayakta duran 132 metrelik dev amfitiyatro.",
        "One of the six largest surviving Roman amphitheatres, retaining its full three-tiered 32-metre outer facade.",
      ),
      spot(
        [45, 13, -25],
        "Augustus ve Roma Tapınağı",
        "Temple of Augustus and Roma",
        "Forum meydanında yer alan, monolit Korint sütunları ve süslemeli friziyle antik dünyanın en kusursuz korunmuş Roma tapınaklarından biri.",
        "A pristine prostyle tetrastyle temple fronted by 8-metre Corinthian columns on the ancient forum.",
      ),
      spot(
        [0, 9, -65],
        "Sergii Zafer Takı (Porta Aurea)",
        "Triumphal Arch of the Sergii",
        "Aktium Deniz Savaşı gazisi Lucius Sergius Lepidus onuruna MÖ 27'de dikilen, zengin akantus kabartmalı 8 metrelik anıtsal zafer takı.",
        "An elegant 8-metre private triumphal arch erected in 27 BC to commemorate the Sergii family's victory at Actium.",
      ),
    ],
    sources: [
      {
        key: "wiki-pula-arena",
        title: l("Pula Arena (Amphitheatre)", "Pula Arena (Amphitheatre)"),
        url: "https://en.wikipedia.org/wiki/Pula_Arena",
      },
      {
        key: "wiki-pula-temple",
        title: l("Temple of Augustus, Pula", "Temple of Augustus, Pula"),
        url: "https://en.wikipedia.org/wiki/Temple_of_Augustus,_Pula",
      },
      {
        key: "wiki-pula-arch",
        title: l("Arch of the Sergii, Pula", "Arch of the Sergii, Pula"),
        url: "https://en.wikipedia.org/wiki/Arch_of_the_Sergii",
      },
      {
        key: "wiki-pula",
        title: l("Wikipedia: Pula (Pola)", "Wikipedia: Pula"),
        url: "https://en.wikipedia.org/wiki/Pula",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 132,
            outerWidth: 105,
            arenaLength: 68,
            arenaWidth: 42,
            wallHeight: 32,
            rows: 28,
            tiers: 3,
            seatRise: 0.24,
            seatTread: 0.65,
            podiumHeight: 3.2,
            bays: 72,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [-85, 60],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 12,
            columnHeight: 8,
            columnDiameter: 1.1,
            porchDepth: 4,
            cellaDepth: 18,
            podiumHeight: 2,
            entablatureHeight: 2,
          },
          at: [45, -20],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 4,
            archHeight: 6,
            totalHeight: 10,
            entablatureHeight: 2,
            columnHeight: 6,
            columnDiameter: 0.7,
            columnsPerFace: 2,
            pierWidth: 2.5,
            depth: 4,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 10,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-50, 16, 40] },
    },
  },
  {
    id: "carnuntum-kenti",
    siteSlug: "carnuntum",
    structure: l("Metropol planı", "The Metropolis Plan"),
    title: l("Carnuntum", "Carnuntum"),
    blurb: l(
      "Tuna Limesi üzerindeki Pannonia başkenti: dört ayaklı anıtsal Heidentor Zafer Kapısı, sivil amfitiyatro ve gladyatör okulu.",
      "The Danube Limes capital of Pannonia: the monumental four-way Heidentor gate, legionary amphitheatre and gladiator school.",
    ),
    period: l("MS 1. – 4. yüzyıl", "1st – 4th century AD"),
    measures: [
      {
        value: 14.5,
        unit: "m",
        label: l(
          "Heidentor (Pagan Kapısı) Tetrapylon Anıtı: yükseklik",
          "Heidentor (Pagan Gate) Quadrifrons Monument: height",
        ),
        source: "wiki-carnuntum-heidentor",
      },
      {
        value: 98,
        unit: "m",
        label: l(
          "Carnuntum Askerî Amfitiyatrosu: toplam uzunluk",
          "Carnuntum Legionary Amphitheatre: overall length",
        ),
        source: "wiki-carnuntum-amphitheatre",
      },
      {
        value: 26,
        unit: "m",
        label: l(
          "Roma Şehir Mahallesi (Villa Urbana): avlu genişliği",
          "Roman Quarter (Villa Urbana): courtyard width",
        ),
        source: "wiki-carnuntum-villa",
      },
    ],
    uncertainty: l(
      "Heidentor dört ayaklı kemeri kısmen ayaktadır; askeri amfitiyatro ve tabandan ısıtmalı Villa Urbana arkeolojik parkta birebir rekonstrüksiyon olarak sergilenir.",
      "The Heidentor quadrifrons stands partially preserved; the amphitheatre and hypocaust-heated Villa Urbana are reconstructed on original Roman foundations.",
    ),
    hotspots: [
      spot(
        [-40, 15.5, 30],
        "Heidentor (Pagan Kapısı) Dört Yollu Zafer Takı",
        "Heidentor (Pagan Gate) Quadrifrons Monument",
        "İmparator II. Constantius onuruna MS 4. yüzyılda dikilen, 14.5 metre yüksekliğinde dört kemerli anıtsal tetrapylon.",
        "A monumental 14.5-metre four-way triumphal arch erected in the 4th century AD by Emperor Constantius II.",
      ),
      spot(
        [45, 13, -20],
        "Carnuntum Lejyoner Amfitiyatrosu",
        "Carnuntum Legionary Amphitheatre",
        "Pannonia lejyolarının talim ve gladyatör müsabakaları için kireçtaşından inşa edilen 98 metrelik eliptik askeri amfitiyatro.",
        "A 98-metre limestone amphitheatre erected for the Legio XIV Gemina military drills and gladiator games.",
      ),
      spot(
        [0, 8.5, -55],
        "Roma Şehir Mahallesi ve Villa Urbana (Lucius Evi)",
        "Roman Civilian Quarter & Villa Urbana",
        "Mermer zeminleri, çalışan hipokaust taban ısıtması ve revaklı avlusuyla zengin bir Roma soylusunun iki katlı şehir villası.",
        "An opulent reconstructed Roman town mansion with working hypocaust floor heating, frescoed rooms and colonnaded peristyle.",
      ),
    ],
    sources: [
      {
        key: "wiki-carnuntum-heidentor",
        title: l("Heidentor (Carnuntum)", "Heidentor (Carnuntum)"),
        url: "https://en.wikipedia.org/wiki/Heidentor_(Carnuntum)",
      },
      {
        key: "wiki-carnuntum-amphitheatre",
        title: l("Carnuntum: Amphitheatres", "Carnuntum: Amphitheatres"),
        url: "https://en.wikipedia.org/wiki/Carnuntum",
      },
      {
        key: "wiki-carnuntum-villa",
        title: l(
          "Archaeological Park Carnuntum: Roman Quarter",
          "Archaeological Park Carnuntum: Roman Quarter",
        ),
        url: "https://en.wikipedia.org/wiki/Carnuntum",
      },
      {
        key: "wiki-carnuntum",
        title: l(
          "UNESCO: Frontiers of the Roman Empire – Danube Limes (Carnuntum)",
          "UNESCO: Danube Limes (Carnuntum)",
        ),
        url: "https://whc.unesco.org/en/list/1608",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 6,
            archHeight: 9,
            totalHeight: 14.5,
            entablatureHeight: 3,
            columnHeight: 7.5,
            columnDiameter: 0.9,
            columnsPerFace: 2,
            pierWidth: 3.5,
            depth: 8,
          },
          at: [-40, 48],
        },
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 98,
            outerWidth: 76,
            arenaLength: 58,
            arenaWidth: 36,
            wallHeight: 12,
            rows: 18,
            tiers: 2,
            seatRise: 0.24,
            seatTread: 0.65,
            podiumHeight: 2.6,
            bays: 44,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [65, -35],
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 2,
            courtWidth: 26,
            courtDepth: 22,
            courtColumns: 6,
            wallHeight: 7.5,
            roomDepth: 4.5,
            columnDiameter: 0.55,
            poolWidth: 6,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "aguntum-kenti",
    siteSlug: "aguntum",
    structure: l("Alp kenti planı", "The Alpine Town Plan"),
    title: l("Aguntum", "Aguntum"),
    blurb: l(
      "Alp Dağları vadisindeki municipium: anıtsal mermer atrium villası, kapı kuleleri, termal hamamlar ve pazar bazilikası.",
      "The Alpine Roman trading municipium: grand atrium domus with marble fountain, circular city gate towers and extensive thermal baths.",
    ),
    period: l("MS 1. – 5. yüzyıl", "1st – 5th century AD"),
    measures: [
      {
        value: 28,
        unit: "m",
        label: l(
          "Haus des Atriums (Aristokrat Atrium Konutu): avlu genişliği",
          "Haus des Atriums (Aristocratic Atrium House): courtyard width",
        ),
        source: "wiki-aguntum-atrium",
      },
      {
        value: 36,
        unit: "m",
        label: l(
          "Aguntum Büyük Termal Hamam Kompleksi: cephe genişliği",
          "Aguntum Thermal Baths (Thermenanlage): facade width",
        ),
        source: "wiki-aguntum-baths",
      },
      {
        value: 10,
        unit: "m",
        label: l(
          "Aguntum Şehir Savunma Kapısı ve Kuleleri: yükseklik",
          "Aguntum City Defense Gate and Towers: height",
        ),
        source: "wiki-aguntum-gate",
      },
    ],
    uncertainty: l(
      "Atrium Evi'nin mozaikli havuzu ve hamamın hipokaust zeminleri korunmuştur; şehir kapısı ve kuleleri kazı planlarına göre modellenmiştir.",
      "The mosaic pool of the Atrium House and bath hypocausts are preserved in situ; the city gate towers follow archaeological surveys.",
    ),
    hotspots: [
      spot(
        [-40, 7.5, 30],
        "Haus des Atriums (Mermer Havuzlu Atrium Konutu)",
        "Haus des Atriums (Peristyle Mansion)",
        "Alp bölgesinin en büyük Roma konutlarından biri: mermer havuzlu 28 metrelik peristil avlu ve taban mozaikli salonlar.",
        "The premier Alpine Roman town mansion spanning 60x30 metres around a grand marble courtyard fountain.",
      ),
      spot(
        [45, 12, -20],
        "Aguntum Büyük Termal Hamam Kompleksi",
        "Great Thermal Baths (Thermenanlage)",
        "Frigidarium, caldarium ve palaestra revaklarıyla dağ tüccarları ve vatandaşların yıkandığı kamusal hamam.",
        "Civic thermal bath complex complete with monumental porticoed halls, heated pools and hypocaust chambers.",
      ),
      spot(
        [0, 6, -58],
        "Çift Kuleli Şehir Kapısı ve Alp Surları",
        "Double-Towered Gate and Alpine Walls",
        "Drava vadisinden kente girişi denetleyen, 138 metrelik savunma suru üzerindeki kuleli anıtsal kapı.",
        "Monumental gatehouse with defensive bastions guarding the Roman trade highway through the Drava valley.",
      ),
    ],
    sources: [
      {
        key: "wiki-aguntum-atrium",
        title: l("Aguntum: Haus des Atriums", "Aguntum: Haus des Atriums"),
        url: "https://en.wikipedia.org/wiki/Aguntum",
      },
      {
        key: "wiki-aguntum-baths",
        title: l("Aguntum: Thermal Baths (Thermen)", "Aguntum: Thermal Baths"),
        url: "https://en.wikipedia.org/wiki/Aguntum",
      },
      {
        key: "wiki-aguntum-gate",
        title: l("Aguntum: City Wall and Gate", "Aguntum: City Wall and Gate"),
        url: "https://en.wikipedia.org/wiki/Aguntum",
      },
      {
        key: "wiki-aguntum",
        title: l("Wikipedia: Aguntum", "Wikipedia: Aguntum"),
        url: "https://en.wikipedia.org/wiki/Aguntum",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 1,
            courtWidth: 28,
            courtDepth: 24,
            courtColumns: 8,
            wallHeight: 6,
            roomDepth: 5,
            columnDiameter: 0.6,
            poolWidth: 8,
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 36,
            facadeHeight: 11,
            lowerColumns: 6,
            steps: 2,
            doors: 2,
            porchDepth: 4,
            hallWidth: 30,
            hallDepth: 14,
            apseWidth: 6,
            nicheHeight: 3,
            wallHeight: 6.5,
            lowerOrderHeight: 6,
            upperColumns: 6,
            columnDiameter: 0.75,
            inscribed: false,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 4.5,
            archHeight: 6,
            totalHeight: 10,
            entablatureHeight: 2,
            columnHeight: 5,
            columnDiameter: 0.7,
            columnsPerFace: 2,
            pierWidth: 2.8,
            depth: 6,
            towerSide: 5,
            towerHeight: 10,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "philippopolis-kenti",
    siteSlug: "philippopolis",
    structure: l("Kent planı", "The City Plan"),
    title: l("Philippopolis (Filibe)", "Philippopolis (Plovdiv)"),
    blurb: l(
      "Trakya'nın en büyük antik metropolü: iki katlı mermer scaenae frons cepheli antik tiyatro, 30.000 kişilik Roma Stadyumu ve Forum Odeonu.",
      "The ancient metropolis of Thrace: 2nd-century marble theatre overlooking the plain, 30,000-seat Roman Stadium and Forum Odeon.",
    ),
    period: l("MÖ 4. yüzyıl – MS 4. yüzyıl", "4th century BC – 4th century AD"),
    measures: [
      {
        value: 82,
        unit: "m",
        label: l(
          "Philippopolis Antik Roma Tiyatrosu: cavea çapı",
          "Ancient Roman Theatre of Philippopolis: cavea diameter",
        ),
        source: "wiki-philippopolis-theatre",
      },
      {
        value: 240,
        unit: "m",
        label: l(
          "Filibe Roma Stadyumu (Trimontium): toplam uzunluk",
          "Roman Stadium of Trimontium: overall length",
        ),
        source: "wiki-philippopolis-stadium",
      },
      {
        value: 11,
        unit: "m",
        label: l(
          "Hisar Kapia Anıtsal Akropol Şehir Kapısı: toplam yükseklik",
          "Hisar Kapia Monumental Acropolis Gate: total height",
        ),
        source: "wiki-philippopolis-gate",
      },
    ],
    uncertainty: l(
      "Mermer tiyatro ve Roma stadyumunun kuzey sphendone kemeri günümüzde Plovdiv merkezinde korunmaktadır; Hisar Kapia ortaçağ onarımlarıyla Roma temellerinde yükselir.",
      "The marble theatre and the northern curved sphendone of the stadium survive in modern Plovdiv; Hisar Kapia stands on original Roman foundation stones.",
    ),
    hotspots: [
      spot(
        [-40, 16, 30],
        "Philippopolis Antik Roma Tiyatrosu",
        "Ancient Roman Theatre of Philippopolis",
        "Domitianus ve Trajan döneminde iki tepe arasındaki yamaca inşa edilen, iki katlı İon-Korint mermer scaenae frons cepheli 82 metrelik anıt tiyatro.",
        "One of the best-preserved ancient theatres in the world, fronted by an intact two-storey Ionic and Corinthian marble stage wall.",
      ),
      spot(
        [45, 12, -20],
        "Filibe Roma Stadyumu (Trimontium)",
        "Roman Stadium of Philippopolis",
        "Sahaba Dağı ile Taksim Tepe arasına yayılan, 30.000 seyirci kapasiteli ve 240 metre uzunluğunda beyaz mermer koltuklu dev hipodrom.",
        "A monumental 240-metre classical stadium accommodating 30,000 spectators for Pythian and Kendrisian games.",
      ),
      spot(
        [0, 6, -58],
        "Hisar Kapia Şehir Kapısı",
        "Hisar Kapia Acropolis Gate",
        "Üç Tepe (Trimontium) akropolünü çevreleyen antik surların doğu geçidini koruyan kemerli taş şehir kapısı.",
        "The ancient arched eastern gateway guarding the processional entrance to the Three Hills citadel.",
      ),
    ],
    sources: [
      {
        key: "wiki-philippopolis-theatre",
        title: l("Plovdiv Roman Theatre", "Plovdiv Roman Theatre"),
        url: "https://en.wikipedia.org/wiki/Plovdiv_Roman_theatre",
      },
      {
        key: "wiki-philippopolis-stadium",
        title: l("Plovdiv Roman Stadium", "Plovdiv Roman Stadium"),
        url: "https://en.wikipedia.org/wiki/Plovdiv_Roman_stadium",
      },
      {
        key: "wiki-philippopolis-gate",
        title: l("Hisar Kapia, Plovdiv", "Hisar Kapia, Plovdiv"),
        url: "https://en.wikipedia.org/wiki/Hisar_Kapia",
      },
      {
        key: "wiki-philippopolis",
        title: l("Wikipedia: Philippopolis (Plovdiv)", "Wikipedia: Philippopolis"),
        url: "https://en.wikipedia.org/wiki/Plovdiv",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 82,
            orchestraDiameter: 26,
            scaenaeHeight: 15,
            seatTread: 0.7,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 6,
            lowerRows: 16,
            upperRows: 12,
            character: {
              stone: "marble",
              storeys: 2,
              facade: "wall",
              screen: "plain",
              topGallery: false,
              ground: "plain",
            },
          },
          at: [-40, 30],
          rotate: 180,
        },
        {
          spec: {
            kind: "stadium",
            overallLength: 240,
            overallWidth: 50,
            rows: 14,
            arenaWidth: 28,
            seatRise: 0.35,
            entrances: 4,
            openEnd: false,
          },
          at: [55, 0],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 3,
            archSpan: 4.15,
            archHeight: 6.18,
            totalHeight: 11,
            entablatureHeight: 1.28,
            columnHeight: 4.94,
            columnDiameter: 0.51,
            columnsPerFace: 4,
            upperBay: 2.36,
            pierWidth: 1.9,
            depth: 4.4,
            upperHeight: 3.2,
            towerSide: 7,
            towerHeight: 14,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-5, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "serdica-kenti",
    siteSlug: "serdica",
    structure: l("Yeraltı kent planı", "The Underground City Plan"),
    title: l("Serdica (Sofya)", "Serdica (Sofia)"),
    blurb: l(
      "Büyük Konstantin'in gözde başkenti: Decumanus Maximus caddesi, Aziz George Rotundası, saray binaları ve doğu kapısı.",
      "Emperor Constantine's beloved city: the paved Decumanus Maximus, 4th-century St George Rotunda, imperial palace and eastern gate.",
    ),
    period: l("MS 2. – 6. yüzyıl", "2nd – 6th century AD"),
    measures: [
      {
        value: 38,
        unit: "m",
        label: l(
          "Aziz George Rotundası ve Saray Bazilikası: cephe genişliği",
          "Church of Saint George Rotunda Complex: facade width",
        ),
        source: "wiki-serdica-rotunda",
      },
      {
        value: 80,
        unit: "m",
        label: l(
          "Serdica Roma Amfitiyatrosu: toplam uzunluk",
          "Roman Amphitheatre of Serdica: overall length",
        ),
        source: "wiki-serdica-amphitheatre",
      },
      {
        value: 12,
        unit: "m",
        label: l(
          "Porta Orientalis (Doğu Şehir Kapısı): toplam yükseklik",
          "Porta Orientalis (Eastern City Gate): total height",
        ),
        source: "wiki-serdica-gate",
      },
    ],
    uncertainty: l(
      "Aziz George Rotundası tuğla kubbesiyle ayaktadır; Serdica amfitiyatrosu ve Decumanus Maximus taş döşemeleri modern Sofya metrosu altındaki arkeoloji kompleksinde sergilenir.",
      "The brick rotunda survives complete; the amphitheatre foundations and paved Roman streets are preserved beneath modern central Sofia.",
    ),
    hotspots: [
      spot(
        [-40, 15, 30],
        "Aziz George Rotundası ve İmparatorluk Bazilikası",
        "Church of Saint George Rotunda Complex",
        "MS 4. yüzyılda İmparator Konstantin tarafından kırmızı Roma tuğlasından inşa edilen kubbeli dairesel anıt yapı ve sütunlu saray bazilikası.",
        "An early Christian red-brick cylindrical rotunda domed hall erected within the 4th-century imperial palace quarter.",
      ),
      spot(
        [45, 13, -20],
        "Serdica Roma Amfitiyatrosu",
        "Roman Amphitheatre of Serdica",
        "Diocletianus döneminde inşa edilen, 80 metrelik arena uzunluğuyla Roma İmparatorluğu'nun doğusundaki en önemli gladyatör arenalarından biri.",
        "A monumental 80-metre provincial amphitheatre discovered beneath modern Sofia, combining theatre and arena functions.",
      ),
      spot(
        [0, 6, -58],
        "Porta Orientalis (Doğu Şehir Kapısı)",
        "Porta Orientalis (Eastern City Gate)",
        "Decumanus Maximus caddesini karşılayan, beyaz mermer kaplamalı ve iki yanında çokgen savunma kuleleri yükselen anıtsal giriş kapısı.",
        "The fortified eastern portal of Serdica fronted by polygonal bastions where the paved Decumanus entered the city.",
      ),
    ],
    sources: [
      {
        key: "wiki-serdica-rotunda",
        title: l("Church of St. George, Sofia", "Church of St. George, Sofia"),
        url: "https://en.wikipedia.org/wiki/Church_of_St_George,_Sofia",
      },
      {
        key: "wiki-serdica-amphitheatre",
        title: l("Amphitheatre of Serdica", "Amphitheatre of Serdica"),
        url: "https://en.wikipedia.org/wiki/Amphitheatre_of_Serdica",
      },
      {
        key: "wiki-serdica-gate",
        title: l("Eastern Gate of Serdica", "Eastern Gate of Serdica"),
        url: "https://en.wikipedia.org/wiki/Serdica",
      },
      {
        key: "wiki-serdica",
        title: l("Wikipedia: Serdica", "Wikipedia: Serdica"),
        url: "https://en.wikipedia.org/wiki/Serdica",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 38,
            facadeHeight: 14,
            lowerColumns: 6,
            steps: 3,
            doors: 3,
            porchDepth: 4.5,
            hallWidth: 32,
            hallDepth: 16,
            apseWidth: 8,
            nicheHeight: 3.5,
            wallHeight: 8,
            lowerOrderHeight: 7,
            upperColumns: 6,
            columnDiameter: 0.85,
            inscribed: false,
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-amphitheatre",
            outerLength: 80,
            outerWidth: 62,
            arenaLength: 50,
            arenaWidth: 34,
            wallHeight: 12,
            rows: 16,
            tiers: 2,
            seatRise: 0.24,
            seatTread: 0.65,
            podiumHeight: 2.5,
            bays: 40,
            outerWall: "arcade",
            stone: "limestone",
          },
          at: [55, -35],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 5.5,
            archHeight: 7.5,
            totalHeight: 12,
            entablatureHeight: 2.4,
            columnHeight: 6,
            columnDiameter: 0.8,
            columnsPerFace: 2,
            pierWidth: 3.2,
            depth: 6,
            towerSide: 5,
            towerHeight: 12,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "stobi-kenti",
    siteSlug: "stobi",
    structure: l("Kent planı", "The City Plan"),
    title: l("Stobi", "Stobi"),
    blurb: l(
      "Paeonia ve Makedonya'nın stratejik ticaret başkenti: 7.600 kişilik mermer tiyatro, mozaikli Piskopos Sarayı ve Via Sacra caddesi.",
      "The strategic capital at the confluence of the Vardar: 7,600-seat theatre, mosaic-adorned Episcopal Basilica and Via Sacra.",
    ),
    period: l("MÖ 3. yüzyıl – MS 6. yüzyıl", "3rd century BC – 6th century AD"),
    measures: [
      {
        value: 78,
        unit: "m",
        label: l(
          "Stobi Antik Roma Tiyatrosu: cavea çapı",
          "Roman Theatre of Stobi: cavea diameter",
        ),
        source: "wiki-stobi-theatre",
      },
      {
        value: 44,
        unit: "m",
        label: l(
          "Piskoposluk Bazilikası ve Mozaikli Vaftizhane: cephe genişliği",
          "Episcopal Basilica with Cloverleaf Baptistery: facade width",
        ),
        source: "wiki-stobi-basilica",
      },
      {
        value: 32,
        unit: "m",
        label: l(
          "Theodosius Sarayı (Parthenius Sarayı): peristil avlu genişliği",
          "Palace of Theodosius (Parthenius Palace): peristyle court width",
        ),
        source: "wiki-stobi-palace",
      },
    ],
    uncertainty: l(
      "Mermer tiyatro oturma basamakları ve piskoposluk vaftizhanesi mozaikleri yerinde korunmuştur; Theodosius sarayının peristil revakları kazı rölövelerine dayanır.",
      "The marble cavea tiers and episcopal baptistery peacocks mosaic survive in situ; the Palace of Theodosius follows excavation ground plans.",
    ),
    hotspots: [
      spot(
        [-40, 15, 30],
        "Stobi Antik Roma Tiyatrosu",
        "Roman Theatre of Stobi",
        "MS 2. ve 3. yüzyıllarda gladyatör oyunları ve tiyatro temsilleri için inşa edilen, 7.600 kişilik 78 metrelik beyaz mermer cavea.",
        "A monumental 78-metre marble theatre seating 7,600 spectators, later converted for venationes beast spectacles.",
      ),
      spot(
        [45, 13, -20],
        "Piskoposluk Bazilikası ve Vaftizhane",
        "Episcopal Basilica & Baptistery",
        "Tavus kuşu ve geyik mozaikleriyle ünlü yonca planlı vaftizhaneye sahip, kentin en büyük üç nefli Hıristiyan katedrali.",
        "The premier three-aisled cathedral of Stobi renowned for its cloverleaf baptistery paved with intricate bird and stag mosaics.",
      ),
      spot(
        [0, 8, -55],
        "Theodosius Sarayı (Parthenius Sarayı)",
        "Palace of Theodosius (Parthenius Mansion)",
        "İmparator I. Theodosius'un MS 388'de Stobi ziyaretinde ağırlandığı, ionik revaklı iç avluya ve mermer havuzlara sahip anıtsal aristokrat konutu.",
        "The grand aristocratic residence where Emperor Theodosius I stayed in 388 AD, arranged around a 32-metre colonnaded peristyle.",
      ),
    ],
    sources: [
      {
        key: "wiki-stobi-theatre",
        title: l("Stobi: Roman Theatre", "Stobi: Roman Theatre"),
        url: "https://en.wikipedia.org/wiki/Stobi",
      },
      {
        key: "wiki-stobi-basilica",
        title: l("Stobi: Episcopal Basilica", "Stobi: Episcopal Basilica"),
        url: "https://en.wikipedia.org/wiki/Stobi",
      },
      {
        key: "wiki-stobi-palace",
        title: l("Stobi: Palace of Theodosius", "Stobi: Palace of Theodosius"),
        url: "https://en.wikipedia.org/wiki/Stobi",
      },
      {
        key: "wiki-stobi",
        title: l("Wikipedia: Stobi", "Wikipedia: Stobi"),
        url: "https://en.wikipedia.org/wiki/Stobi",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 78,
            orchestraDiameter: 24,
            scaenaeHeight: 14,
            seatTread: 0.7,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 6,
            lowerRows: 14,
            upperRows: 10,
            character: {
              stone: "marble",
              storeys: 2,
              facade: "wall",
              screen: "plain",
              topGallery: false,
              ground: "plain",
            },
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 44,
            facadeHeight: 16,
            lowerColumns: 8,
            steps: 1,
            doors: 3,
            porchDepth: 4,
            hallWidth: 36,
            hallDepth: 18,
            apseWidth: 8,
            nicheHeight: 3,
            wallHeight: 7,
            lowerOrderHeight: 9.2,
            upperColumns: 8,
            columnDiameter: 0.62,
            inscribed: false,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 2,
            courtWidth: 32,
            courtDepth: 24,
            courtColumns: 8,
            wallHeight: 7,
            roomDepth: 4.5,
            columnDiameter: 0.6,
            poolWidth: 8,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "heraclea-lyncestis-kenti",
    siteSlug: "heraclea-lyncestis",
    structure: l("Kent planı", "The City Plan"),
    title: l("Heraclea Lyncestis (Manastır)", "Heraclea Lyncestis"),
    blurb: l(
      "Via Egnatia üzerindeki anıtsal Makedon durağı: hayvan dövüşleri için modifiye edilmiş Roma tiyatrosu, erken Hıristiyan mozaikli bazilikaları ve stoa.",
      "The Via Egnatia imperial station: Roman theatre with beast-fighting cages, world-renowned basilica animal mosaics and porticoed street.",
    ),
    period: l("MÖ 4. yüzyıl – MS 6. yüzyıl", "4th century BC – 6th century AD"),
    measures: [
      {
        value: 55,
        unit: "m",
        label: l(
          "Heraclea Akropol Roma Tiyatrosu: cavea çapı",
          "Roman Theatre of Heraclea Lyncestis: cavea diameter",
        ),
        source: "wiki-heraclea-theatre",
      },
      {
        value: 36,
        unit: "m",
        label: l(
          "Büyük Bazilika ve Narteks Mozaikleri: cephe genişliği",
          "Great Basilica and Narthex Wildlife Mosaics: facade width",
        ),
        source: "wiki-heraclea-basilica",
      },
      {
        value: 9.5,
        unit: "m",
        label: l(
          "Porta Heraclea ve Şehir Giriş Kapısı: yükseklik",
          "Porta Heraclea and City Entrance Gate: height",
        ),
        source: "wiki-heraclea-gate",
      },
    ],
    uncertainty: l(
      "Akropol tiyatrosu ve Büyük Bazilika zemin mozaikleri çok iyi korunmuştur; şehir kapısı ve stoa sütunları arkeolojik temel verilerine göre ayağa kaldırılmıştır.",
      "The hillside theatre and stunning polychrome basilica mosaics survive in excellent condition; the gateway follows architectural excavation records.",
    ),
    hotspots: [
      spot(
        [-40, 12, 30],
        "Heraclea Lyncestis Roma Tiyatrosu",
        "Roman Theatre of Heraclea Lyncestis",
        "Hadrianus döneminde inşa edilen, gladyatör dövüşleri için orkestrası kafeslerle çevrili 55 metrelik yamaca yaslı antik tiyatro.",
        "A 55-metre hillside theatre built under Hadrian, featuring protective iron barrier holes for gladiatorial animal shows.",
      ),
      spot(
        [45, 12, -20],
        "Büyük Mozaikli Erken Hıristiyan Bazilikası",
        "Great Basilica & Polychrome Mosaics",
        "Dünyaca ünlü cennet tasvirleri, aslanlar, leoparlar ve nar ağacı motifli taban mozaikleriyle donatılmış anıtsal piskoposluk katedrali.",
        "A monumental 5th-century basilica paved with world-famous naturalistic floor mosaics illustrating the Garden of Eden and allegorical beasts.",
      ),
      spot(
        [0, 6, -58],
        "Porta Heraclea ve Via Egnatia Kapısı",
        "Porta Heraclea & Via Egnatia Portal",
        "Roma'yı Konstantinopolis'e bağlayan ünlü askeri ticaret yolu Via Egnatia'nın kente girişini karşılayan anıtsal kemerli kapı.",
        "The Roman vaulted entrance gateway welcoming travellers along the primary imperial military highway connecting Rome with Constantinople.",
      ),
    ],
    sources: [
      {
        key: "wiki-heraclea-theatre",
        title: l("Theatre of Heraclea Lyncestis", "Theatre of Heraclea Lyncestis"),
        url: "https://en.wikipedia.org/wiki/Heraclea_Lyncestis",
      },
      {
        key: "wiki-heraclea-basilica",
        title: l("Great Basilica of Heraclea Lyncestis", "Great Basilica of Heraclea Lyncestis"),
        url: "https://en.wikipedia.org/wiki/Heraclea_Lyncestis",
      },
      {
        key: "wiki-heraclea-gate",
        title: l("Heraclea Lyncestis: City Gate", "Heraclea Lyncestis: City Gate"),
        url: "https://en.wikipedia.org/wiki/Heraclea_Lyncestis",
      },
      {
        key: "wiki-heraclea-lyncestis",
        title: l("Wikipedia: Heraclea Lyncestis", "Wikipedia: Heraclea Lyncestis"),
        url: "https://en.wikipedia.org/wiki/Heraclea_Lyncestis",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 55,
            orchestraDiameter: 18,
            scaenaeHeight: 11,
            seatTread: 0.7,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 5,
            lowerRows: 12,
            upperRows: 8,
            character: {
              stone: "limestone",
              storeys: 1,
              facade: "wall",
              screen: "plain",
              topGallery: false,
              ground: "plain",
            },
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 36,
            facadeHeight: 11,
            lowerColumns: 6,
            steps: 2,
            doors: 3,
            porchDepth: 3.5,
            hallWidth: 28,
            hallDepth: 14,
            apseWidth: 7,
            nicheHeight: 2.8,
            wallHeight: 6.5,
            lowerOrderHeight: 5.5,
            upperColumns: 6,
            columnDiameter: 0.7,
            inscribed: false,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "roman-gate",
            variant: "arch",
            openings: 1,
            archSpan: 4.5,
            archHeight: 6,
            totalHeight: 9.5,
            entablatureHeight: 2,
            columnHeight: 4.8,
            columnDiameter: 0.65,
            columnsPerFace: 2,
            pierWidth: 2.6,
            depth: 5,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "kourion-kenti",
    siteSlug: "kourion",
    structure: l("Uçurum kenti planı", "The Cliffside City Plan"),
    title: l("Kourion (Kurion)", "Kourion"),
    blurb: l(
      "Akdeniz falezleri üzerindeki krallık kenti: Episkopi Körfezi manzaralı Greko-Romen tiyatro, Eustolios Evi mozaikleri ve Apollon Hylates Kutsal Alanı.",
      "The clifftop city-kingdom overlooking Episkopi Bay: spectacular Greco-Roman theatre, mosaic baths of Eustolios and Apollo Hylates sanctuary.",
    ),
    period: l("MÖ 12. yüzyıl – MS 7. yüzyıl", "12th century BC – 7th century AD"),
    measures: [
      {
        value: 62,
        unit: "m",
        label: l(
          "Deniz Manzaralı Kourion Antik Tiyatrosu: cavea çapı",
          "Seaside Ancient Theatre of Kourion: cavea diameter",
        ),
        source: "wiki-kourion-theatre",
      },
      {
        value: 30,
        unit: "m",
        label: l(
          "Eustolios Evi ve Mozaikli Termal Kompleks: avlu genişliği",
          "House of Eustolios & Thermal Suite: court width",
        ),
        source: "wiki-kourion-eustolios",
      },
      {
        value: 34,
        unit: "m",
        label: l(
          "Kourion Erken Hıristiyanlık Piskoposluk Bazilikası: cephe genişliği",
          "Kourion Early Christian Episcopal Basilica: facade width",
        ),
        source: "wiki-kourion-basilica",
      },
    ],
    uncertainty: l(
      "Uçurum tiyatrosu ve Eustolios Evi geometrik mozaikleri yerinde korunmuştur; piskoposluk katedrali mermer korint sütun sıraları kazı verilerine göre tamamlanmıştır.",
      "The cliffside theatre and Eustolios figural mosaics survive in situ; the cathedral colonnade follows archaeological excavation ground plans.",
    ),
    hotspots: [
      spot(
        [-40, 13, 30],
        "Deniz Manzaralı Kourion Roma Tiyatrosu",
        "Seaside Roman Theatre of Kourion",
        "Akdeniz falezlerinin zirvesine oyulan, masmavi Episkopi Körfezi manzarasına açılan 3.500 kişilik 62 metrelik anıt Greko-Romen tiyatro.",
        "A magnificent 62-metre semicircular theatre cut into the cliff edge, framing breathtaking panoramic views of the Mediterranean Sea.",
      ),
      spot(
        [45, 7.5, -20],
        "Eustolios Evi ve Termal Kompleks",
        "House & Baths of Eustolios",
        "30'dan fazla mozaikli odaya, mermer sütunlu revaklı avluya ve özel hamamlara sahip 4. yüzyıl lüks aristokrat konutu.",
        "A sprawling 4th-century palatial residence with thirty rooms paved with polychrome figural mosaics and private balneum baths.",
      ),
      spot(
        [0, 12, -65],
        "Kourion Piskoposluk Katedrali",
        "Kourion Episcopal Basilica",
        "Mermer Korint sütun dizileriyle ayrılan üç nefli 34 metrelik anıtsal katedral ve vaftizhane avlusu.",
        "The monumental 5th-century three-aisled cathedral of Kourion featuring monolithic marble Corinthian columns and atrium.",
      ),
    ],
    sources: [
      {
        key: "wiki-kourion-theatre",
        title: l("Kourion Roman Theatre", "Kourion Roman Theatre"),
        url: "https://en.wikipedia.org/wiki/Kourion",
      },
      {
        key: "wiki-kourion-eustolios",
        title: l("House of Eustolios, Kourion", "House of Eustolios, Kourion"),
        url: "https://en.wikipedia.org/wiki/Kourion",
      },
      {
        key: "wiki-kourion-basilica",
        title: l("Episcopal Basilica of Kourion", "Episcopal Basilica of Kourion"),
        url: "https://en.wikipedia.org/wiki/Kourion",
      },
      {
        key: "wiki-kourion",
        title: l("Wikipedia: Kourion", "Wikipedia: Kourion"),
        url: "https://en.wikipedia.org/wiki/Kourion",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 62,
            orchestraDiameter: 20,
            scaenaeHeight: 12,
            seatTread: 0.7,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 5,
            lowerRows: 14,
            upperRows: 8,
            character: {
              stone: "limestone",
              storeys: 2,
              facade: "arcade",
              screen: "plain",
              topGallery: false,
              ground: "plain",
            },
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 1,
            courtWidth: 30,
            courtDepth: 22,
            courtColumns: 6,
            wallHeight: 5.5,
            roomDepth: 4.5,
            columnDiameter: 0.55,
            poolWidth: 6,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 34,
            facadeHeight: 11,
            lowerColumns: 6,
            steps: 2,
            doors: 3,
            porchDepth: 3.5,
            hallWidth: 28,
            hallDepth: 15,
            apseWidth: 7,
            nicheHeight: 3,
            wallHeight: 6.5,
            lowerOrderHeight: 5.8,
            upperColumns: 6,
            columnDiameter: 0.75,
            inscribed: false,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "salamis-kibris-kenti",
    siteSlug: "salamis-kibris",
    structure: l("Kent planı", "The City Plan"),
    title: l("Salamis (Gazimağusa)", "Salamis"),
    blurb: l(
      "Kıbrıs'ın kadim deniz başkenti: 50 mermer sütunlu anıtsal Gymnasium, 15.000 seyirci kapasiteli tiyatro, termal havuzlar ve sarnıçlar.",
      "The great maritime capital of ancient Cyprus: grand marble palaestra and gymnasium, 15,000-seat theatre and extensive Roman thermae.",
    ),
    period: l("MÖ 11. yüzyıl – MS 7. yüzyıl", "11th century BC – 7th century AD"),
    measures: [
      {
        value: 104,
        unit: "m",
        label: l(
          "Büyük Salamis Roma Tiyatrosu: cavea çapı",
          "Great Roman Theatre of Salamis: cavea diameter",
        ),
        source: "wiki-salamis-theatre",
      },
      {
        value: 52,
        unit: "m",
        label: l(
          "Salamis Gymnasion ve Mermer Palaestra: avlu genişliği",
          "Salamis Gymnasium and Palaestra: courtyard width",
        ),
        source: "wiki-salamis-gymnasium",
      },
      {
        value: 18,
        unit: "m",
        label: l(
          "Zeus Olympios Anıtsal Tapınağı: cephe genişliği",
          "Temple of Zeus Olympios: facade width",
        ),
        source: "wiki-salamis-temple",
      },
    ],
    uncertainty: l(
      "Gymnasion palaestrasının 50'yi aşkın beyaz mermer sütunu ve antik tiyatronun alt oturma sıraları ayaktadır; Zeus tapınağı podyumu arkeolojik kazı izlerine dayanır.",
      "Over fifty monolithic marble columns of the palaestra and the theatre lower rows survive in situ; the Zeus temple follows podium excavations.",
    ),
    hotspots: [
      spot(
        [-40, 18, 30],
        "Büyük Salamis Roma Tiyatrosu",
        "Great Roman Theatre of Salamis",
        "Augustus döneminde inşa edilen, 15.000 seyirci kapasitesi ve 104 metrelik cavea çapıyla Doğu Akdeniz'in en heybetli tiyatrolarından biri.",
        "One of the largest theatres in the ancient Mediterranean, accommodating 15,000 spectators across fifty tiers of seating.",
      ),
      spot(
        [45, 10, -20],
        "Salamis Gymnasion'u ve Palaestra",
        "Salamis Gymnasium & Colonnaded Palaestra",
        "Ortasında havuzlar ve mermer heykeller bulunan, dört tarafı Korint başlıklı monolit sütun dizileriyle çevrili 52 metrelik görkemli palaestra avlusu.",
        "A magnificent 52-metre open-air exercise palaestra framed by soaring marble Corinthian colonnades and imperial statuary.",
      ),
      spot(
        [0, 17, -65],
        "Salamis Zeus Olympios Tapınağı",
        "Temple of Zeus Olympios, Salamis",
        "Kentin koruyucu tanrısı Zeus'a adanmış, yüksek kireçtaşı podyum üzerinde yükselen 18 metre cepheli devasa Korint düzeni tapınak.",
        "The monumental civic sanctuary of ancient Salamis erected atop an elevated podium commanding the city agora.",
      ),
    ],
    sources: [
      {
        key: "wiki-salamis-theatre",
        title: l("Roman Theatre of Salamis", "Roman Theatre of Salamis"),
        url: "https://en.wikipedia.org/wiki/Salamis,_Cyprus",
      },
      {
        key: "wiki-salamis-gymnasium",
        title: l("Gymnasium of Salamis, Cyprus", "Gymnasium of Salamis, Cyprus"),
        url: "https://en.wikipedia.org/wiki/Salamis,_Cyprus",
      },
      {
        key: "wiki-salamis-temple",
        title: l("Temple of Zeus Olympios, Salamis", "Temple of Zeus Olympios, Salamis"),
        url: "https://en.wikipedia.org/wiki/Salamis,_Cyprus",
      },
      {
        key: "wiki-salamis-kibris",
        title: l("Wikipedia: Salamis (Cyprus)", "Wikipedia: Salamis"),
        url: "https://en.wikipedia.org/wiki/Salamis,_Cyprus",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 104,
            orchestraDiameter: 32,
            scaenaeHeight: 17,
            seatTread: 0.7,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 8.0,
            stairways: 8,
            lowerRows: 18,
            upperRows: 14,
            character: {
              stone: "marble",
              storeys: 2,
              facade: "wall",
              screen: "plain",
              topGallery: false,
              ground: "plain",
            },
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 1,
            courtWidth: 52,
            courtDepth: 28,
            courtColumns: 10,
            wallHeight: 8,
            roomDepth: 5,
            columnDiameter: 0.85,
            poolWidth: 10,
          },
          at: [65, -30],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 18,
            columnHeight: 11,
            columnDiameter: 1.1,
            porchDepth: 5,
            cellaDepth: 24,
            podiumHeight: 2.8,
            entablatureHeight: 2.6,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-5, 0, 25, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "caesarea-maritima-kenti",
    siteSlug: "caesarea-maritima",
    structure: l("Liman ve sahil kenti planı", "The Harbour and Coastal Plan"),
    title: l("Caesarea Maritima", "Caesarea Maritima"),
    blurb: l(
      "Kral Hirodes'in anıtsal yapay liman kenti: deniz kenarındaki Roma tiyatrosu, sahil hipodromu ve kilometrelerce uzanan yüksek su kemeri.",
      "King Herod's colossal all-weather harbour city: sea-facing Roman theatre, chariot hippodrome on the dunes and high-level aqueduct.",
    ),
    period: l("MÖ 1. – MS 7. yüzyıl", "1st century BC – 7th century AD"),
    measures: [
      {
        value: 300,
        unit: "m",
        label: l(
          "Hirodes Sahil Hipodromu ve Sirki: toplam uzunluk",
          "Herodian Coastal Chariot Hippodrome: overall length",
        ),
        source: "wiki-caesarea-hippodrome",
      },
      {
        value: 85,
        unit: "m",
        label: l(
          "Caesarea Deniz Manzaralı Roma Tiyatrosu: cavea çapı",
          "Seaside Roman Theatre of Caesarea: cavea diameter",
        ),
        source: "wiki-caesarea-theatre",
      },
      {
        value: 38,
        unit: "m",
        label: l(
          "Kral Hirodes Liman Sarayı (Promontory Palace): avlu genişliği",
          "King Herod Promontory Palace: courtyard width",
        ),
        source: "wiki-caesarea-palace",
      },
    ],
    uncertainty: l(
      "Deniz kıyısındaki tiyatro ve hipodromun taş oturma kademeleri korunmuştur; Pontius Pilatus yazıtının bulunduğu tiyatro sahnesi ve deniz sarayı kazı verilerine dayanır.",
      "The seafront theatre and curved sphendone of the hippodrome survive in situ; the Promontory Palace rock-cut pool follows archaeological records.",
    ),
    hotspots: [
      spot(
        [-40, 12, 30],
        "Hirodes Sahil Hipodromu ve Sirki",
        "Herodian Coastal Hippodrome",
        "Akdeniz kıyısındaki kumullar boyunca uzanan, 300 metre uzunluğunda 9.000 seyirci kapasiteli dört atlı araba yarışı hipodromu.",
        "A monumental 300-metre seaside circus erected by Herod the Great for quad-chariot racing alongside the waves.",
      ),
      spot(
        [45, 16, -20],
        "Deniz Kıyısı Roma Tiyatrosu",
        "Seaside Roman Theatre of Caesarea",
        "Arkası açık tiyatro sahnesi arkasında Akdeniz gün batımının parıldadığı, Pontius Pilatus yazıtının keşfedildiği 85 metrelik görkemli tiyatro.",
        "The premier Roman theatre of Judea, commanding sweeping coastal vistas where the famous Pontius Pilate dedicatory stone was discovered.",
      ),
      spot(
        [0, 8.5, -55],
        "Kral Hirodes Liman Sarayı (Promontory Palace)",
        "King Herod's Promontory Palace",
        "Denize doğru uzanan kayalık burun üzerine kurulan, ortasında devasa bir tatlı su yüzme havuzu bulunan iki katlı imparatorluk sarayı kompleksi.",
        "A lavish palace projecting out into the Mediterranean surf, centred on a grand rock-cut freshwater swimming pool and peristyle.",
      ),
    ],
    sources: [
      {
        key: "wiki-caesarea-hippodrome",
        title: l("Caesarea Maritima Hippodrome", "Caesarea Maritima Hippodrome"),
        url: "https://en.wikipedia.org/wiki/Caesarea_Maritima",
      },
      {
        key: "wiki-caesarea-theatre",
        title: l("Roman Theatre of Caesarea", "Roman Theatre of Caesarea"),
        url: "https://en.wikipedia.org/wiki/Caesarea_Maritima",
      },
      {
        key: "wiki-caesarea-palace",
        title: l("Promontory Palace, Caesarea", "Promontory Palace, Caesarea"),
        url: "https://en.wikipedia.org/wiki/Caesarea_Maritima",
      },
      {
        key: "wiki-caesarea-maritima",
        title: l("Wikipedia: Caesarea Maritima", "Wikipedia: Caesarea Maritima"),
        url: "https://en.wikipedia.org/wiki/Caesarea_Maritima",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "stadium",
            overallLength: 300,
            overallWidth: 60,
            rows: 12,
            arenaWidth: 32,
            seatRise: 0.35,
            entrances: 4,
            openEnd: false,
          },
          at: [-70, 0],
        },
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 85,
            orchestraDiameter: 28,
            scaenaeHeight: 15,
            seatTread: 0.7,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 7.5,
            stairways: 6,
            lowerRows: 16,
            upperRows: 12,
            character: {
              stone: "limestone",
              storeys: 2,
              facade: "arcade",
              screen: "plain",
              topGallery: true,
              ground: "plain",
            },
          },
          at: [55, 35],
          rotate: 180,
        },
        {
          spec: {
            kind: "peristyle-house",
            residences: 1,
            storeys: 2,
            courtWidth: 38,
            courtDepth: 28,
            courtColumns: 8,
            wallHeight: 7.5,
            roomDepth: 5,
            columnDiameter: 0.7,
            poolWidth: 10,
          },
          at: [50, -35],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "beit-shean-kenti",
    siteSlug: "beit-shean",
    structure: l("Kent ve höyük planı", "The City and Mound Plan"),
    title: l("Beit Shean (Scythopolis)", "Bet She'an (Scythopolis)"),
    blurb: l(
      "Decapolis birliğinin baş kenti: korint sütunlu Palladius ve Silvanus caddeleri, 7.000 kişilik tiyatro, bazilika ve devasa halk hamamı.",
      "The premier city of the Decapolis: the monumental colonnaded Palladius Street, 7,000-seat basalt theatre, civic basilica and public baths.",
    ),
    period: l("MÖ 3. yüzyıl – MS 8. yüzyıl", "3rd century BC – 8th century AD"),
    measures: [
      {
        value: 110,
        unit: "m",
        label: l(
          "Scythopolis Antik Roma Tiyatrosu: cavea çapı",
          "Roman Theatre of Scythopolis: cavea diameter",
        ),
        source: "wiki-beit-shean-theatre",
      },
      {
        value: 55,
        unit: "m",
        label: l(
          "Sütunlu Palladius Caddesi ve Stoası: cephe genişliği",
          "Colonnaded Palladius Street Stoa: facade width",
        ),
        source: "wiki-beit-shean-palladius",
      },
      {
        value: 18,
        unit: "m",
        label: l("Dionysos Akropol Tapınağı: cephe genişliği", "Temple of Dionysos: facade width"),
        source: "wiki-beit-shean-temple",
      },
    ],
    uncertainty: l(
      "Bazalt ve beyaz kireçtaşından örülen tiyatro ile Palladius caddesi korint sütunları ayaktadır; tell höyüğü eteğindeki Dionysos tapınağı kazı podyumuna dayanır.",
      "The basalt and limestone theatre cavea and Corinthian colonnades of Palladius street stand in situ; the Dionysos temple follows podium excavations.",
    ),
    hotspots: [
      spot(
        [-40, 19, 30],
        "Scythopolis Roma Tiyatrosu",
        "Roman Theatre of Scythopolis",
        "MS 2. yüzyılda siyah bazalt ve beyaz kireçtaşından inşa edilen, 7.000 seyirci kapasitesi ve 110 metrelik caveasıyla Levant'ın en görkemli tiyatrosu.",
        "The best-preserved Roman theatre in the Levant, seating 7,000 across a 110-metre cavea fronted by a multi-tiered scaenae frons.",
      ),
      spot(
        [45, 14, -20],
        "Sütunlu Palladius Caddesi ve Stoası",
        "Colonnaded Palladius Street & Stoa",
        "Korint sütunları, mozaikli revakları ve dükkan sıralarıyla kentin ticari kalbini oluşturan 55 metre cepheli anıtsal stoa aksı.",
        "A monumental colonnaded boulevard flanked by soaring Corinthian columns and geometric mosaic sidewalks lined with civic shops.",
      ),
      spot(
        [0, 16.5, -65],
        "Dionysos Akropol Tapınağı",
        "Temple of Dionysos, Scythopolis",
        "Tell höyüğünün eteklerinde yükselen, kentin kurucu tanrısı Dionysos'a adanmış yüksek podyumlu ve anıtsal basamaklı Korint düzeni tapınak.",
        "The sacred sanctuary of the city's patron deity Dionysos, elevated on a massive stone podium looking over the civic valley.",
      ),
    ],
    sources: [
      {
        key: "wiki-beit-shean-theatre",
        title: l("Roman Theatre of Scythopolis", "Roman Theatre of Scythopolis"),
        url: "https://en.wikipedia.org/wiki/Bet_She%27an",
      },
      {
        key: "wiki-beit-shean-palladius",
        title: l("Palladius Street, Bet She'an", "Palladius Street, Bet She'an"),
        url: "https://en.wikipedia.org/wiki/Bet_She%27an",
      },
      {
        key: "wiki-beit-shean-temple",
        title: l("Temple of Dionysos, Scythopolis", "Temple of Dionysos, Scythopolis"),
        url: "https://en.wikipedia.org/wiki/Bet_She%27an",
      },
      {
        key: "wiki-beit-shean",
        title: l("Wikipedia: Bet She'an", "Wikipedia: Bet She'an"),
        url: "https://en.wikipedia.org/wiki/Bet_She%27an",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "roman-theatre",
            caveaDiameter: 110,
            orchestraDiameter: 34,
            scaenaeHeight: 18,
            seatTread: 0.7,
            seatRise: 0.4,
            podiumHeight: 1.2,
            stageDepth: 8.0,
            stairways: 8,
            lowerRows: 18,
            upperRows: 14,
            character: {
              stone: "limestone",
              storeys: 2,
              facade: "wall",
              screen: "plain",
              topGallery: false,
              ground: "plain",
            },
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "roman-facade",
            facadeWidth: 55,
            facadeHeight: 16,
            lowerColumns: 8,
            steps: 1,
            doors: 3,
            porchDepth: 4,
            hallWidth: 44,
            hallDepth: 16,
            apseWidth: 8,
            nicheHeight: 3.2,
            wallHeight: 7.5,
            lowerOrderHeight: 9.2,
            upperColumns: 8,
            columnDiameter: 0.62,
            inscribed: false,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "prostyle-temple",
            columns: 6,
            pillars: 2,
            statueBases: 2,
            facadeWidth: 18,
            columnHeight: 10.5,
            columnDiameter: 1.05,
            porchDepth: 5,
            cellaDepth: 25,
            podiumHeight: 2.8,
            entablatureHeight: 2.5,
          },
          at: [0, -65],
          rotate: 180,
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-5, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "xian-changan-kenti",
    siteSlug: "xian-changan",
    structure: l("İmparatorluk kent planı", "The Imperial City Plan"),
    title: l("Chang'an (Xi'an)", "Chang'an (Xi'an)"),
    blurb: l(
      "İpek Yolu'nun başlangıcı dünyanın ilk 1 milyonluk metropolü: ızgara planlı caddeler, dev şehir surları, Daming Sarayı ve Pagodalar.",
      "The starting point of the Silk Road and the world's first metropolis of one million: grid avenues, Daming Palace and defensive gates.",
    ),
    period: l("MÖ 202 – MS 904", "202 BC – 904 AD"),
    measures: [
      {
        value: 67,
        unit: "m",
        label: l(
          "Daming Sarayı (Hanyuan Taht Salonu): cephe genişliği",
          "Daming Palace (Hanyuan Audience Hall): facade width",
        ),
        source: "wiki-xian-hanyuan",
      },
      {
        value: 16,
        unit: "m",
        label: l(
          "Danfeng Anıtsal Saray Kapısı: toplam yükseklik",
          "Danfeng Monumental Palace Gate: total height",
        ),
        source: "wiki-xian-danfeng",
      },
      {
        value: 60,
        unit: "m",
        label: l(
          "Daming Saray Tören Avlusu ve Revakları: avlu genişliği",
          "Daming Palace Ceremonial Courtyard: courtyard width",
        ),
        source: "wiki-xian-court",
      },
    ],
    uncertainty: l(
      "Hanyuan Taht Salonu'nun devasa teras platformu ve Danfeng Kapısı temelleri arkeolojik kazılarda korunmuştur; ahşap üst yapı ve kiremit çatılar Tang mimari kılavuzlarına dayanır.",
      "The massive rammed-earth terrace of Hanyuan Hall and Danfeng Gate stone bases survive in situ; the timber bracket superstructures follow Tang Dynasty architectural treatises.",
    ),
    hotspots: [
      spot(
        [-40, 19, 30],
        "Daming Sarayı Hanyuan Taht Salonu",
        "Daming Palace Hanyuan Audience Hall",
        "Tang imparatorlarının yeni yıl törenleri ve yabancı elçileri kabul ettiği, 15 metre yükseltilmiş teras üzerinde 67 metre genişliğinde görkemli ahşap taht salonu.",
        "The primary audience hall of the Tang Empire, elevated on a multi-tiered platform commanding the grand imperial axis.",
      ),
      spot(
        [70, 11.3, -30],
        "Daming Saray Avlusu ve Tören Meydanı",
        "Daming Palace Ceremonial Courtyard",
        "Binlerce saray muhafızı ve bürokratın toplandığı, çift katlı kırmızı lakeli ahşap revaklarla çevrili 60 metrelik imparatorluk avlusu.",
        "The vast ceremonial courtyard flanked by double-tier vermilion-lacquered colonnades where imperial state functions took place.",
      ),
      spot(
        [0, 17.3, -75],
        "Danfeng Anıtsal Saray Kapısı",
        "Danfeng Monumental Palace Gate",
        "Daming Sarayı'nın güney ana girişi: beş kapı açıklığı ve çift katlı nöbet kuleleriyle kentin en görkemli imparatorluk kapı binası.",
        "The five-portal grand southern entrance gate of Daming Palace flanked by fortified watchtowers.",
      ),
    ],
    sources: [
      {
        key: "wiki-xian-hanyuan",
        title: l("Daming Palace: Hanyuan Hall", "Daming Palace: Hanyuan Hall"),
        url: "https://en.wikipedia.org/wiki/Daming_Palace",
      },
      {
        key: "wiki-xian-danfeng",
        title: l("Danfeng Gate, Xi'an", "Danfeng Gate, Xi'an"),
        url: "https://en.wikipedia.org/wiki/Daming_Palace",
      },
      {
        key: "wiki-xian-court",
        title: l("Daming Palace Imperial Courtyard", "Daming Palace Imperial Courtyard"),
        url: "https://en.wikipedia.org/wiki/Daming_Palace",
      },
      {
        key: "wiki-xian-changan",
        title: l(
          "UNESCO: Silk Roads: the Routes Network of Chang'an-Tianshan Corridor",
          "UNESCO: Silk Roads (Chang'an)",
        ),
        url: "https://whc.unesco.org/en/list/1442",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "asian-hall",
            width: 67,
            depth: 32,
            totalHeight: 19,
            podiumHeight: 3.5,
            columnsX: 11,
            columnsZ: 5,
            columnHeight: 6.5,
            storeys: 2,
            roofStyle: "hip-and-gable",
            finial: "chiwen",
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "asian-hall",
            width: 60,
            depth: 16,
            totalHeight: 11,
            podiumHeight: 1.5,
            columnsX: 11,
            columnsZ: 3,
            columnHeight: 4.5,
            storeys: 1,
            roofStyle: "hip-and-gable",
          },
          at: [70, -30],
        },
        {
          spec: {
            kind: "asian-hall",
            width: 40,
            depth: 14,
            totalHeight: 17,
            podiumHeight: 8,
            columnsX: 7,
            columnsZ: 3,
            columnHeight: 4.5,
            storeys: 1,
            roofStyle: "hip-and-gable",
            finial: "chiwen",
          },
          at: [0, -75],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-5, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "luoyang-kenti",
    siteSlug: "luoyang",
    structure: l("İmparatorluk kent planı", "The Imperial City Plan"),
    title: l("Luoyang (Doğu Han)", "Luoyang"),
    blurb: l(
      "13 hanedanın kadim imparatorluk başkenti: Sui-Tang saray ekseni, Luotianmen Kapısı, Beyaz At Tapınağı ve antik surlar.",
      "The ancient imperial capital of 13 dynasties: Sui-Tang central axis, monumental gate towers, White Horse Temple and rammed-earth walls.",
    ),
    period: l("MÖ 11. yüzyıl – MS 10. yüzyıl", "11th century BC – 10th century AD"),
    measures: [
      {
        value: 58,
        unit: "m",
        label: l(
          "Mingtang (Işık Salonu / Tören Sarayı): cephe genişliği",
          "Mingtang (Hall of Light / Ritual Palace): facade width",
        ),
        source: "wiki-luoyang-mingtang",
      },
      {
        value: 18,
        unit: "m",
        label: l(
          "Yingtianmen Saray Kapısı: toplam yükseklik",
          "Yingtian Gate Imperial Palace Entrance: total height",
        ),
        source: "wiki-luoyang-yingtian",
      },
      {
        value: 42,
        unit: "m",
        label: l(
          "Beyaz At Tapınağı (Baima Si): avlu genişliği",
          "White Horse Temple (Baima Si): courtyard width",
        ),
        source: "wiki-luoyang-baima",
      },
    ],
    uncertainty: l(
      "Mingtang ve Yingtianmen saray kapısının anıtsal temel kaideleri Luoyang arkeolojik sit alanında korunur; çok katlı ahşap kuleler Sui ve Tang dönemi rölövelerine dayanır.",
      "The massive rammed-earth base of the Mingtang and Yingtianmen gate survive in the Luoyang park; the wooden superstructures follow Sui-Tang Dynasty records.",
    ),
    hotspots: [
      spot(
        [-40, 23, 30],
        "Mingtang (Işık Salonu ve Tören Kulesi)",
        "Mingtang (Hall of Light)",
        "İmparatoriçe Wu Zetian tarafından inşa ettirilen, 58 metre genişliğinde podyum üzerinde yükselen devasa imparatorluk ritüel salonu.",
        "The monumental ritual hall of Empress Wu Zetian, erected on an immense octagonal stone base dominating the imperial palace complex.",
      ),
      spot(
        [60, 10.3, -25],
        "Beyaz At Tapınağı (Baima Si) Avlusu",
        "White Horse Temple (Baima Si) Courtyard",
        "MS 68 yılında Doğu Han Hanedanlığı döneminde kurulan, Çin'in ilk resmi Budist manastırının revaklı kutsal avlusu.",
        "The colonnaded sacred precinct of China's very first Buddhist monastery, founded in 68 AD under the Eastern Han Dynasty.",
      ),
      spot(
        [0, 18.3, -75],
        "Yingtianmen Anıtsal Saray Kapısı",
        "Yingtianmen Imperial Palace Gate",
        "Sui ve Tang imparatorluk sarayının güney girişi: çift kuleli, üç kemer geçitli ve kanat pavyonlu devasa şehir kapısı.",
        "The monumental gatehouse of the Sui-Tang Luoyang palace, featuring triple portals flanked by elevated ceremonial watchtowers.",
      ),
    ],
    sources: [
      {
        key: "wiki-luoyang-mingtang",
        title: l("Mingtang of Luoyang", "Mingtang of Luoyang"),
        url: "https://en.wikipedia.org/wiki/Luoyang",
      },
      {
        key: "wiki-luoyang-yingtian",
        title: l("Yingtian Gate, Luoyang", "Yingtian Gate, Luoyang"),
        url: "https://en.wikipedia.org/wiki/Luoyang",
      },
      {
        key: "wiki-luoyang-baima",
        title: l("White Horse Temple, Luoyang", "White Horse Temple, Luoyang"),
        url: "https://en.wikipedia.org/wiki/White_Horse_Temple",
      },
      {
        key: "wiki-luoyang",
        title: l(
          "UNESCO: Silk Roads: the Routes Network of Chang'an-Tianshan Corridor (Luoyang)",
          "UNESCO: Silk Roads (Luoyang)",
        ),
        url: "https://whc.unesco.org/en/list/1442",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "asian-hall",
            width: 58,
            depth: 42,
            totalHeight: 28,
            podiumHeight: 3.5,
            columnsX: 9,
            columnsZ: 7,
            columnHeight: 6.5,
            storeys: 3,
            roofStyle: "pagoda",
            finial: "gold-spire",
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "asian-hall",
            width: 30,
            depth: 14,
            totalHeight: 10,
            podiumHeight: 1.5,
            columnsX: 7,
            columnsZ: 3,
            columnHeight: 4.2,
            storeys: 1,
            roofStyle: "hip-and-gable",
          },
          at: [60, -25],
        },
        {
          spec: {
            kind: "asian-hall",
            width: 36,
            depth: 14,
            totalHeight: 18,
            podiumHeight: 7,
            columnsX: 7,
            columnsZ: 3,
            columnHeight: 4.5,
            storeys: 1,
            roofStyle: "hip-and-gable",
          },
          at: [0, -75],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "nara-heijo-kenti",
    siteSlug: "nara-heijo",
    structure: l("İmparatorluk başkent planı", "The Imperial Capital Plan"),
    title: l("Heijō-kyō (Nara)", "Heijō-kyō (Nara)"),
    blurb: l(
      "Japonya'nın ilk kalıcı imparatorluk başkenti: Suzakumon Güney Kapısı, Daigokuden Büyük Seyir Sarayı ve geniş caddeler.",
      "Japan's first permanent imperial capital: the grand Suzakumon Gate, Daigokuden audience hall and broad grid avenues.",
    ),
    period: l("MS 710 – MS 784", "710 AD – 784 AD"),
    measures: [
      {
        value: 44,
        unit: "m",
        label: l(
          "Daigokuden (Büyük Seyirci Taht Salonu): cephe genişliği",
          "Daigokuden (Great Audience Hall): facade width",
        ),
        source: "wiki-nara-daigokuden",
      },
      {
        value: 18,
        unit: "m",
        label: l(
          "Suzakumon (Heijō Sarayı Güney Kapısı): toplam yükseklik",
          "Suzakumon Monumental South Gate: total height",
        ),
        source: "wiki-nara-suzakumon",
      },
      {
        value: 36,
        unit: "m",
        label: l(
          "To-in Doğu Saray Bahçesi ve Köşkü: avlu genişliği",
          "To-in Imperial East Palace Garden: courtyard width",
        ),
        source: "wiki-nara-toin",
      },
    ],
    uncertainty: l(
      "Daigokuden Taht Salonu ve Suzakumon kapısı orijinal sütun kaideleri üzerinde titizlikle yeniden inşa edilmiştir; To-in bahçe köşkleri kazı planlarını izler.",
      "The Daigokuden hall and Suzakumon gate have been reconstructed on the excavated 8th-century stone bases; the To-in gardens follow archaeological landscape surveys.",
    ),
    hotspots: [
      spot(
        [-40, 21, 30],
        "Daigokuden (Büyük Seyirci Taht Salonu)",
        "Daigokuden (Great Audience Hall)",
        "İmparatorun tahta çıkma törenleri ve diplomatik kabullerin yapıldığı, 44 metre genişliğinde iki katlı görkemli ahşap imparatorluk salonu.",
        "The supreme imperial audience hall of ancient Japan, surmounted by soaring hipped-and-gabled ceramic roofs with golden shibi ornaments.",
      ),
      spot(
        [60, 9.3, -25],
        "To-in Doğu Saray Bahçesi ve Köşkü",
        "To-in Imperial East Palace Garden",
        "İmparatorluk ailesinin şiir dinletileri ve ziyafetler düzenlediği, gölet etrafında zarif ahşap revaklarla çevrili bahçe köşkü.",
        "The tranquil imperial garden pavilion featuring landscaped ponds, wooden verandahs and ceremonial banquet halls.",
      ),
      spot(
        [0, 18.3, -75],
        "Suzakumon (Heijō Sarayı Güney Kapısı)",
        "Suzakumon Main Gate of Heijō Palace",
        "84 metre genişliğindeki Suzaku Bulvarı'na bakan, iki katlı kırmızı sütunlu ve kiremit çatılı anıtsal imparatorluk saray kapısı.",
        "The monumental double-roofed gateway facing the grand 84-metre-wide Suzaku boulevard entering the palace precinct.",
      ),
    ],
    sources: [
      {
        key: "wiki-nara-daigokuden",
        title: l("Daigokuden, Heijō Palace", "Daigokuden, Heijō Palace"),
        url: "https://en.wikipedia.org/wiki/Heij%C5%8D_Palace",
      },
      {
        key: "wiki-nara-suzakumon",
        title: l("Suzakumon, Heijō Palace", "Suzakumon, Heijō Palace"),
        url: "https://en.wikipedia.org/wiki/Suzakumon",
      },
      {
        key: "wiki-nara-toin",
        title: l("To-in Imperial Garden, Nara", "To-in Imperial Garden, Nara"),
        url: "https://en.wikipedia.org/wiki/Heij%C5%8D_Palace",
      },
      {
        key: "wiki-nara-heijo",
        title: l("UNESCO: Historic Monuments of Ancient Nara", "UNESCO: Ancient Nara"),
        url: "https://whc.unesco.org/en/list/870",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "asian-hall",
            width: 44,
            depth: 20,
            totalHeight: 20,
            podiumHeight: 2.8,
            columnsX: 9,
            columnsZ: 5,
            columnHeight: 6.5,
            storeys: 2,
            roofStyle: "hip-and-gable",
            finial: "shibi",
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "asian-hall",
            width: 36,
            depth: 12,
            totalHeight: 9,
            podiumHeight: 1.2,
            columnsX: 9,
            columnsZ: 3,
            columnHeight: 3.8,
            storeys: 1,
            roofStyle: "hip-and-gable",
            finial: "shibi",
          },
          at: [60, -25],
        },
        {
          spec: {
            kind: "asian-hall",
            width: 25,
            depth: 10,
            totalHeight: 18,
            podiumHeight: 1.5,
            columnsX: 5,
            columnsZ: 2,
            columnHeight: 4.5,
            storeys: 2,
            roofStyle: "hip-and-gable",
            finial: "shibi",
          },
          at: [0, -75],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-20, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "kyoto-heian-kenti",
    siteSlug: "kyoto-heian",
    structure: l("Başkent ve tapınaklar planı", "The Imperial City Plan"),
    title: l("Heian-kyō (Kyoto)", "Heian-kyō (Kyoto)"),
    blurb: l(
      "Klasik Japon kültürünün altın çağı başkenti: 84 metre genişliğindeki Suzaku Bulvarı, Rashomon Kapısı ve Daidairi saray yerleşkesi.",
      "The golden age capital of classical Japanese civilization: the 84-metre-wide Suzaku Avenue, Rashomon Gate and Daidairi imperial precinct.",
    ),
    period: l("MS 794 – MS 1185", "794 AD – 1185 AD"),
    measures: [
      {
        value: 70,
        unit: "m",
        label: l(
          "Chodoin (Büyük Devlet Konseyi Kompleksi): avlu genişliği",
          "Chodoin (State Council Compound): courtyard width",
        ),
        source: "wiki-kyoto-chodoin",
      },
      {
        value: 20,
        unit: "m",
        label: l(
          "Rajomon (Büyük Güney Şehir Kapısı): toplam yükseklik",
          "Rajomon Monumental South City Gate: total height",
        ),
        source: "wiki-kyoto-rajomon",
      },
      {
        value: 33,
        unit: "m",
        label: l(
          "Shishinden (İmparatorluk Taht Sarayı): cephe genişliği",
          "Shishinden (Imperial Throne Hall): facade width",
        ),
        source: "wiki-kyoto-shishinden",
      },
    ],
    uncertainty: l(
      "Daidairi imparatorluk sarayı ve Rajomon kapısı günümüzde yer altında temel izleri olarak mevcuttur; modeller Heian dönemi saray parşömenlerine ve Heian Jingu rekonstrüksiyonuna dayanır.",
      "The original Daidairi halls and Rajomon survive as buried archaeological foundations; the reconstruction follows Heian court picture scrolls and the 1895 Heian Shrine replica.",
    ),
    hotspots: [
      spot(
        [-60, 11.3, 45],
        "Chodoin (Büyük Devlet Konseyi Kompleksi)",
        "Chodoin State Council Compound",
        "İmparatorluk bakanlıkları ve tören salonlarını barındıran, 70 metre genişliğinde iki katlı kırmızı sütunlu revaklarla çevrili tören avlusu.",
        "The great administrative quadrangle of Heian Japan, fronted by vermilion galleries where eight imperial ministries convened.",
      ),
      spot(
        [45, 17, -20],
        "Shishinden (İmparatorluk Taht Sarayı)",
        "Shishinden Throne Hall",
        "Klasik Shinden-zukuri tarzında selvi kabuğu çatıyla örtülü, imparatorluk tahtı Takamikura'yı barındıran 33 metre cepheli anıt saray.",
        "The premier ceremonial palace hall crowned with cypress-bark thatch, housing the sacred chrysantemum throne of Japan.",
      ),
      spot(
        [0, 20.3, -75],
        "Rajomon (Büyük Güney Şehir Kapısı)",
        "Rajomon Great South Gate",
        "Heian-kyō'nun güney sınırını belirleyen, Suzaku Bulvarı'nın başlangıcındaki efsanevi iki katlı anıtsal ahşap şehir kapısı.",
        "The legendary monumental southern bastion of Kyoto towering over the entrance to the imperial capital.",
      ),
    ],
    sources: [
      {
        key: "wiki-kyoto-chodoin",
        title: l("Chodoin of Heian-kyō", "Chodoin of Heian-kyō"),
        url: "https://en.wikipedia.org/wiki/Heian_Palace",
      },
      {
        key: "wiki-kyoto-rajomon",
        title: l("Rajomon Gate, Kyoto", "Rajomon Gate, Kyoto"),
        url: "https://en.wikipedia.org/wiki/Rashomon",
      },
      {
        key: "wiki-kyoto-shishinden",
        title: l("Shishinden, Kyoto Imperial Palace", "Shishinden, Kyoto Imperial Palace"),
        url: "https://en.wikipedia.org/wiki/Kyoto_Imperial_Palace",
      },
      {
        key: "wiki-kyoto-heian",
        title: l("UNESCO: Historic Monuments of Ancient Kyoto", "UNESCO: Ancient Kyoto"),
        url: "https://whc.unesco.org/en/list/688",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "asian-hall",
            width: 70,
            depth: 18,
            totalHeight: 11,
            podiumHeight: 1.5,
            columnsX: 15,
            columnsZ: 4,
            columnHeight: 4.5,
            storeys: 1,
            roofStyle: "hip-and-gable",
            finial: "shibi",
          },
          at: [-60, 45],
        },
        {
          spec: {
            kind: "asian-hall",
            width: 33,
            depth: 18,
            totalHeight: 16,
            podiumHeight: 2.2,
            columnsX: 7,
            columnsZ: 4,
            columnHeight: 6,
            storeys: 1,
            roofStyle: "hip-and-gable",
            finial: "shibi",
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "asian-hall",
            width: 32,
            depth: 8,
            totalHeight: 20,
            podiumHeight: 1.5,
            columnsX: 7,
            columnsZ: 2,
            columnHeight: 5,
            storeys: 2,
            roofStyle: "hip-and-gable",
            finial: "shibi",
          },
          at: [0, -75],
        },
      ],
      walls: {
        length: 800,
        width: 700,
        height: 8,
        thickness: 3.0,
        towers: 12,
        gates: 4,
        gateWidth: 10,
      },
      streets: [
        [0, -26, 0, 0, 8],
        [-5, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "tikal-kenti",
    siteSlug: "tikal",
    structure: l("Orman metropolü planı", "The Jungle Metropolis Plan"),
    title: l("Tikal", "Tikal"),
    blurb: l(
      "Yağmur ormanlarının kalbindeki en büyük Klasik Maya başkenti: 47 metrelik Büyük Jaguar Piramidi (I. Tapınak), Kuzey Akropolü ve top sahası.",
      "The supreme Classic Maya superpower in the jungle: 47-metre Temple of the Great Jaguar (Temple I), North Acropolis and ball courts.",
    ),
    period: l("MÖ 6. yüzyıl – MS 10. yüzyıl", "6th century BC – 10th century AD"),
    measures: [
      {
        value: 47,
        unit: "m",
        label: l(
          "I. Tapınak (Büyük Jaguar Piramidi): toplam yükseklik",
          "Temple I (Temple of the Great Jaguar): total height",
        ),
        source: "wiki-tikal-temple1",
      },
      {
        value: 38,
        unit: "m",
        label: l(
          "II. Tapınak (Maskeler Piramidi): toplam yükseklik",
          "Temple II (Temple of the Masks): total height",
        ),
        source: "wiki-tikal-temple2",
      },
      {
        value: 40,
        unit: "m",
        label: l(
          "Kuzey Akropolü ve Kral Mezarları: avlu genişliği",
          "North Acropolis Royal Tomb Complex: courtyard width",
        ),
        source: "wiki-tikal-acropolis",
      },
    ],
    uncertainty: l(
      "Büyük Meydan'daki I. ve II. tapınaklar ile Kuzey Akropolü basamaklı kireçtaşı piramitleri orijinal kireçtaşı taş işçiliğiyle eksiksiz ayaktadır.",
      "Temple I, Temple II and the North Acropolis stone terraced pyramids survive in extraordinary preservation amid the Petén jungle canopy.",
    ),
    hotspots: [
      spot(
        [-40, 48, 30],
        "I. Tapınak (Büyük Jaguar Piramidi)",
        "Temple I (Temple of the Great Jaguar)",
        "Kral Jasaw Chan K'awiil I'in anıt mezarı: dik basamakları ve tepesinde jaguar kabartmalı taş taraçasıyla 47 metre yükselen kireçtaşı piramit.",
        "The iconic 47-metre limestone funerary pyramid of Jasaw Chan K'awiil I towering over the eastern flank of the Great Plaza.",
      ),
      spot(
        [45, 39, -20],
        "II. Tapınak (Maskeler Piramidi)",
        "Temple II (Temple of the Masks)",
        "Büyük Meydan'ın batısında yükselen, basamaklı terasları ve devasa sıva mask kabartmalarıyla kraliçe onuruna adanmış 38 metrelik piramit tapınak.",
        "A 38-metre three-tiered stepped pyramid dominating the western axis of the Great Plaza, erected for Queen Lady Kalajuun Une' Mo'.",
      ),
      spot(
        [0, 12, -80],
        "Kuzey Akropolü ve Kral Mezarları",
        "North Acropolis Royal Tomb Complex",
        "Tikal krallarının yüzyıllar boyunca üst üste inşa ettiği tapınaklar, hanedan mezarları ve sütunlu saray terasları kompleksi.",
        "A colossal sacred acropolis complex layered with centuries of royal tombs, masked stucco shrines and ceremonial courtyards.",
      ),
    ],
    sources: [
      {
        key: "wiki-tikal-temple1",
        title: l("Tikal Temple I", "Tikal Temple I"),
        url: "https://en.wikipedia.org/wiki/Tikal_Temple_I",
      },
      {
        key: "wiki-tikal-temple2",
        title: l("Tikal Temple II", "Tikal Temple II"),
        url: "https://en.wikipedia.org/wiki/Tikal_Temple_II",
      },
      {
        key: "wiki-tikal-acropolis",
        title: l("North Acropolis, Tikal", "North Acropolis, Tikal"),
        url: "https://en.wikipedia.org/wiki/North_Acropolis,_Tikal",
      },
      {
        key: "wiki-tikal",
        title: l("UNESCO: Tikal National Park", "UNESCO: Tikal National Park"),
        url: "https://whc.unesco.org/en/list/64",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 34,
            baseDepth: 34,
            totalHeight: 47,
            tiers: 9,
            stairWidth: 8,
            templeWidth: 10,
            templeDepth: 8,
            roofCombHeight: 12,
            stelaeCount: 4,
          },
          at: [-40, 30],
          rotate: 180,
        },
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 28,
            baseDepth: 28,
            totalHeight: 38,
            tiers: 5,
            stairWidth: 7,
            templeWidth: 9,
            templeDepth: 7,
            roofCombHeight: 8,
            stelaeCount: 3,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 50,
            baseDepth: 40,
            totalHeight: 14,
            tiers: 3,
            stairWidth: 12,
            templeWidth: 14,
            templeDepth: 8,
            roofCombHeight: 3,
          },
          at: [0, -80],
        },
      ],
      streets: [
        [0, -26, 0, 70, 8],
        [-50, 0, 50, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "antigua-quirigua-kenti",
    siteSlug: "antigua-quirigua",
    structure: l("Tören alanı planı", "The Ceremonial Precinct Plan"),
    title: l("Quiriguá", "Quiriguá"),
    blurb: l(
      "Dünyanın en yüksek Maya dikilitaşlarının kenti: 10,6 metre yüksekliğindeki 65 tonluk Stela E monolit heykeli, zoomorf taşlar ve akropol.",
      "Home to the tallest monolithic stelae in the New World: 10.6-metre, 65-tonne Stela E, intricate zoomorphic altars and acropolis.",
    ),
    period: l("MS 200 – MS 900", "200 AD – 900 AD"),
    measures: [
      {
        value: 45,
        unit: "m",
        label: l(
          "Stela E ve Büyük Tören Meydanı Platformu: cephe genişliği",
          "Stela E & Great Ceremonial Plaza Platform: facade width",
        ),
        source: "wiki-quirigua-stelae",
      },
      {
        value: 35,
        unit: "m",
        label: l(
          "Quiriguá Akropol Saray Kompleksi: avlu genişliği",
          "Quiriguá Acropolis Palace Compound: courtyard width",
        ),
        source: "wiki-quirigua-acropolis",
      },
    ],
    uncertainty: l(
      "Stela E, Stela D ve dev zoomorf kaya sunakları orijinal yerlerinde ayaktadır; akropol saray odaları temel rölövelerine göre modellenmiştir.",
      "The colossal monolith stelae and zoomorphic boulder altars stand in their original plaza positions; palace chambers follow excavated platforms.",
    ),
    hotspots: [
      spot(
        [-40, 12, 30],
        "Stela E ve Büyük Tören Meydanı Platformu",
        "Stela E & Great Plaza Platform",
        "Yeni Dünya'da dikilmiş en yüksek tek parça taş anıt: Kral K'ak' Tiliw Chan Yopaat portresiyle donatılmış 10.6 metrelik 65 tonluk monolit stel ve tören platformu.",
        "The tallest monolithic stela in pre-Columbian America, rising 10.6 metres carved with elaborate portraits of the divine king.",
      ),
      spot(
        [60, 9, -30],
        "Quiriguá Akropol Saray Kompleksi",
        "Quiriguá Acropolis Palace Compound",
        "Motagua Nehri vadisine bakan, saray konsey odaları, elit konutlar ve basamaklı teraslardan oluşan kraliyet ikametgahı.",
        "The elevated administrative and residential heart of Quiriguá overlooking the Motagua river basin.",
      ),
    ],
    sources: [
      {
        key: "wiki-quirigua-stelae",
        title: l("Quiriguá Stelae and Great Plaza", "Quiriguá Stelae and Great Plaza"),
        url: "https://en.wikipedia.org/wiki/Quirigu%C3%A1",
      },
      {
        key: "wiki-quirigua-acropolis",
        title: l("Acropolis of Quiriguá", "Acropolis of Quiriguá"),
        url: "https://en.wikipedia.org/wiki/Quirigu%C3%A1",
      },
      {
        key: "wiki-antigua-quirigua",
        title: l("UNESCO: Archaeological Park and Ruins of Quiriguá", "UNESCO: Quiriguá"),
        url: "https://whc.unesco.org/en/list/149",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 45,
            baseDepth: 35,
            totalHeight: 16,
            tiers: 4,
            stairWidth: 10,
            templeWidth: 12,
            templeDepth: 8,
            roofCombHeight: 4,
            stelaeCount: 6,
            zoomorphs: 2,
          },
          at: [-40, 30],
          rotate: 180,
        },
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 40,
            baseDepth: 36,
            totalHeight: 10,
            tiers: 3,
            stairWidth: 10,
            templeWidth: 16,
            templeDepth: 8,
            roofCombHeight: 1,
          },
          at: [60, -30],
        },
      ],
      streets: [
        [0, -26, 0, 70, 8],
        [-50, 0, 50, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "copan-kenti",
    siteSlug: "copan",
    structure: l("Akropol planı", "The Acropolis Plan"),
    title: l("Copán", "Copán"),
    blurb: l(
      "Maya dünyasının Atinası: 63 basamakta 2.000 glif barındıran Hiyeroglifli Merdivenler Tapınağı, kusursuz heykelli steller ve tören meydanı.",
      "The Athens of the Maya world: the monumental Hieroglyphic Stairway with over 2,000 glyphs, high-relief portrait stelae and great court.",
    ),
    period: l("MS 400 – MS 800", "400 AD – 800 AD"),
    measures: [
      {
        value: 22,
        unit: "m",
        label: l(
          "Hiyeroglifli Basamaklar Piramidi (Tapınak 26): toplam yükseklik",
          "Hieroglyphic Stairway (Temple 26): total height",
        ),
        source: "wiki-copan-stairway",
      },
      {
        value: 36,
        unit: "m",
        label: l(
          "16 Numaralı Akropol Tapınağı ve Altar Q: cephe genişliği",
          "Temple 16 and Altar Q Dynasty Monument: facade width",
        ),
        source: "wiki-copan-temple16",
      },
      {
        value: 48,
        unit: "m",
        label: l(
          "Copán Kraliyet Top Oyunu Sahası (Ballcourt): toplam uzunluk",
          "Copán Royal Ballcourt: overall length",
        ),
        source: "wiki-copan-ballcourt",
      },
    ],
    uncertainty: l(
      "63 basamaklı Hiyeroglifli Merdiven ve Altar Q hanedan kabartmaları yerinde korunmuştur; 16. Tapınak Rosalila evresinin üzerine inşa edilen son Klasik evreyi yansıtır.",
      "The 63-step Hieroglyphic Stairway and 16-king Altar Q frieze survive in situ; Temple 16 represents the final Late Classic construction phase over Rosalila.",
    ),
    hotspots: [
      spot(
        [-45, 8, 65],
        "Hiyeroglifli Basamaklar Piramidi (Tapınak 26)",
        "Hieroglyphic Stairway (Temple 26)",
        "Yeni Dünya'nın en uzun taş yazıtı: 63 dik basamağına Copán hanedan tarihini anlatan 2.200 Maya glifi oyulmuş 22 metre yüksekliğinde kutsal piramit.",
        "The longest known pre-Columbian stone inscription, containing over 2,200 hieroglyphs recounting the royal lineage of Copán.",
      ),
      spot(
        [45, 12, -35],
        "16 Numaralı Akropol Piramidi ve Altar Q",
        "Temple 16 and Dynastic Altar Q",
        "Akropolün en yüksek zirvesi: 16 Copán kralının portrelerini taşıyan ünlü Altar Q sunağının yükseldiği 20 metrelik hanedan tapınağı.",
        "The focal temple of the Acropolis elevated atop earlier buried temples, fronted by the celebrated Altar Q monarch procession.",
      ),
      spot(
        [55, 3, 35],
        "Copán Kraliyet Top Oyunu Sahası",
        "Copán Royal Ballcourt",
        "Papağan başlı taş heykellerle ve eğimli seyir teraslarıyla çevrili, Maya dünyasının en anıtsal ve sanatsal ritüel top oyunu sahası.",
        "One of the grandest ballcourts of Mesoamerica, lined with sculpted macaw heads and sloped stone playing walls.",
      ),
    ],
    sources: [
      {
        key: "wiki-copan-stairway",
        title: l("Hieroglyphic Stairway of Copán", "Hieroglyphic Stairway of Copán"),
        url: "https://en.wikipedia.org/wiki/Cop%C3%A1n",
      },
      {
        key: "wiki-copan-temple16",
        title: l("Temple 16 and Altar Q, Copán", "Temple 16 and Altar Q, Copán"),
        url: "https://en.wikipedia.org/wiki/Cop%C3%A1n",
      },
      {
        key: "wiki-copan-ballcourt",
        title: l("Ballcourt of Copán", "Ballcourt of Copán"),
        url: "https://en.wikipedia.org/wiki/Cop%C3%A1n",
      },
      {
        key: "wiki-copan",
        title: l("UNESCO: Maya Site of Copán", "UNESCO: Maya Site of Copán"),
        url: "https://whc.unesco.org/en/list/129",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 32,
            baseDepth: 30,
            totalHeight: 22,
            tiers: 5,
            stairWidth: 10,
            templeWidth: 10,
            templeDepth: 8,
            roofCombHeight: 4.5,
            stelaeCount: 5,
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 36,
            baseDepth: 32,
            totalHeight: 20,
            tiers: 5,
            stairWidth: 8,
            templeWidth: 11,
            templeDepth: 9,
            roofCombHeight: 5,
            stelaeCount: 2,
            zoomorphs: 1,
          },
          at: [45, -20],
        },
        {
          spec: {
            kind: "stadium",
            overallLength: 48,
            overallWidth: 24,
            rows: 6,
            arenaWidth: 10,
            seatRise: 0.45,
            entrances: 2,
            openEnd: false,
          },
          at: [55, 35],
        },
      ],
      streets: [
        [0, -26, 0, 0, 8],
        [-5, 0, 20, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "el-puente-kenti",
    siteSlug: "el-puente",
    structure: l("Tören alanı planı", "The Ceremonial Precinct Plan"),
    title: l("El Puente", "El Puente"),
    blurb: l(
      "Copán Vadisi'nin ikinci büyük kenti: Chinamito Nehri kıyısında 12 metre yüksekliğindeki basamaklı piramit, tören avluları ve rampa terasları.",
      "The second largest site in the Copán Valley: 12-metre terraced stepped pyramid, stone ceremonial plazas and riverfront causeways.",
    ),
    period: l("MS 600 – MS 900", "600 AD – 900 AD"),
    measures: [
      {
        value: 12.5,
        unit: "m",
        label: l(
          "1 Numaralı Ana Basamaklı Piramit: toplam yükseklik",
          "Structure 1 (Main Stepped Pyramidal Temple): total height",
        ),
        source: "wiki-elpuente-pyramid",
      },
      {
        value: 26,
        unit: "m",
        label: l(
          "3 Numaralı Törensel Konut ve Avlu: avlu genişliği",
          "Structure 3 (Ceremonial Elite Platform): court width",
        ),
        source: "wiki-elpuente-court",
      },
    ],
    uncertainty: l(
      "1 Numaralı Ana Piramit kireçtaşı teraslarıyla ve drenaj kanallarıyla yerinde korunmuştur; 3 Numaralı saray konut odaları kazı planlarına göre modellenmiştir.",
      "Structure 1 stepped terraces and stone drainage systems are preserved in situ; the residential palace courts follow archaeological restorations.",
    ),
    hotspots: [
      spot(
        [-40, 13.5, 30],
        "1 Numaralı Ana Basamaklı Piramit",
        "Structure 1 (Main Stepped Pyramidal Temple)",
        "Chinamito Nehri terasında yükselen, 12.5 metre yüksekliğindeki basamaklı taş terasları ve törensel tapınak odasıyla kentin dini çekirdeği.",
        "The primary stepped pyramid of El Puente rising 12.5 metres across multiple stone terraces overlooking the river valley.",
      ),
      spot(
        [55, 6, -30],
        "3 Numaralı Törensel Konut ve Avlu",
        "Structure 3 Elite Residence & Court",
        "El Puente yöneticilerinin ikamet ettiği, tören meydanına bakan taş odalı ve revaklı avlulu elit konut yerleşkesi.",
        "The residential compound of the local Maya nobility, arranged around paved courtyards with vaulted stone rooms.",
      ),
    ],
    sources: [
      {
        key: "wiki-elpuente-pyramid",
        title: l("Structure 1, El Puente", "Structure 1, El Puente"),
        url: "https://en.wikipedia.org/wiki/El_Puente_(Maya_site)",
      },
      {
        key: "wiki-elpuente-court",
        title: l("Structure 3, El Puente", "Structure 3, El Puente"),
        url: "https://en.wikipedia.org/wiki/El_Puente_(Maya_site)",
      },
      {
        key: "wiki-el-puente",
        title: l("Wikipedia: El Puente (Maya site)", "Wikipedia: El Puente"),
        url: "https://en.wikipedia.org/wiki/El_Puente_(Maya_site)",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 25,
            baseDepth: 25,
            totalHeight: 12.5,
            tiers: 4,
            stairWidth: 6,
            templeWidth: 8,
            templeDepth: 6,
            roofCombHeight: 2.5,
            stelaeCount: 2,
          },
          at: [-40, 30],
          rotate: 180,
        },
        {
          spec: {
            kind: "stepped-pyramid",
            baseWidth: 26,
            baseDepth: 24,
            totalHeight: 7,
            tiers: 2,
            stairWidth: 8,
            templeWidth: 14,
            templeDepth: 8,
            roofCombHeight: 1,
          },
          at: [55, -30],
        },
      ],
      streets: [
        [0, -26, 0, 70, 8],
        [-50, 0, 50, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "tiwanaku-kenti",
    siteSlug: "tiwanaku",
    structure: l("Kutsal merkez planı", "The Sacred Precinct Plan"),
    title: l("Tiwanaku (Tiahuanaco)", "Tiwanaku"),
    blurb: l(
      "And Dağları'nın megalitik ruhani merkezi: tek andezit bloktan oyulmuş Güneş Kapısı (Puerta del Sol), Kalasasaya Tapınağı ve Akapana Piramidi.",
      "The spiritual megalithic capital of the high Andes: monolithic Gate of the Sun (Puerta del Sol), Kalasasaya courtyard and Akapana pyramid.",
    ),
    period: l("MÖ 300 – MS 1000", "300 BC – 1000 AD"),
    measures: [
      {
        value: 65,
        unit: "m",
        label: l(
          "Kalasasaya Megalit Tapınak Platformu: cephe genişliği",
          "Kalasasaya Megalithic Enclosure Platform: facade width",
        ),
        source: "wiki-tiwanaku-kalasasaya",
      },
      {
        value: 28,
        unit: "m",
        label: l(
          "Yarı Batık Yeraltı Avlusu (Templete): avlu genişliği",
          "Semi-Subterranean Sunken Temple: court width",
        ),
        source: "wiki-tiwanaku-templete",
      },
    ],
    uncertainty: l(
      "Kalasasaya çevre megalitleri, Güneş Kapısı monoliti ve yarı batık tapınaktaki 175 kireçtaşı kafa kabartması yerinde korunmuştur.",
      "The monolithic uprights of Kalasasaya, the Gate of the Sun and 175 tenoned limestone heads of the sunken temple survive in situ.",
    ),
    hotspots: [
      spot(
        [-40, 15, 30],
        "Kalasasaya Megalit Tapınak Platformu",
        "Kalasasaya Megalithic Enclosure",
        "Dev andezit sütunlarla çevrili, ekinoks ve gündönümlerini hesaplamak için inşa edilmiş anıtsal astronomik güneş tapınağı platformu.",
        "A monumental elevated stone terrace bounded by massive andesite pillars aligned with solar equinoxes and solstices.",
      ),
      spot(
        [70, 2, -35],
        "Yarı Batık Yeraltı Avlusu ve Taş Kafalar",
        "Semi-Subterranean Sunken Temple",
        "Zeminin 2 metre altına oyulmuş, duvarlarında 175 farklı insan ırkını simgeleyen taş kafa kabartmaları ve Bennett Monoliti yükselen kutsal avlu.",
        "A sacred sunken courtyard carved 2 metres into the earth, its walls studded with 175 enigmatic tenoned stone heads.",
      ),
      spot(
        [-40, 16, 45],
        "Güneş Kapısı (Puerta del Sol Monoliti)",
        "Gate of the Sun (Puerta del Sol)",
        "10 tonluk tek bir andezit bloktan oyulan, üzerinde Asa Tanrısı Viracocha ve kanatlı görevlilerin frizleri parıldayan dünyaca ünlü monolit kapı.",
        "Carved from a single ten-tonne andesite monolith, bearing intricate low-relief friezes of the Staff God Viracocha.",
      ),
    ],
    sources: [
      {
        key: "wiki-tiwanaku-kalasasaya",
        title: l("Kalasasaya Temple, Tiwanaku", "Kalasasaya Temple, Tiwanaku"),
        url: "https://en.wikipedia.org/wiki/Tiwanaku",
      },
      {
        key: "wiki-tiwanaku-templete",
        title: l("Semi-Subterranean Temple, Tiwanaku", "Semi-Subterranean Temple, Tiwanaku"),
        url: "https://en.wikipedia.org/wiki/Tiwanaku",
      },
      {
        key: "wiki-tiwanaku",
        title: l(
          "UNESCO: Tiwanaku: Spiritual and Political Centre of the Tiwanaku Culture",
          "UNESCO: Tiwanaku",
        ),
        url: "https://whc.unesco.org/en/list/567",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "megalithic-platform",
            platformWidth: 65,
            platformLength: 55,
            platformHeight: 14,
            tiers: 4,
            sunGateWidth: 4.5,
            sunGateHeight: 3.2,
            monolithHeight: 4.5,
            orthostats: 10,
          },
          at: [-40, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "megalithic-platform",
            platformWidth: 28,
            platformLength: 26,
            platformHeight: 2,
            tiers: 1,
            sunGateWidth: 2.4,
            sunGateHeight: 2.5,
          },
          at: [70, -35],
        },
      ],
      streets: [
        [0, -26, 0, 50, 8],
        [-35, 0, 35, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  {
    id: "pumapunku-kenti",
    siteSlug: "pumapunku",
    structure: l("Teras platform planı", "The Terrace Platform Plan"),
    title: l("Puma Punku", "Puma Punku"),
    blurb: l(
      "Antik dünyanın en kusursuz taş işçiliği: mikron hassasiyetinde oyulmuş H-blokları, 130 tonluk andezit megalitler ve döküm kilit kanalları.",
      "Precision stone engineering of antiquity: interlocking andesite H-blocks, 130-tonne monoliths and bronze clamp sockets.",
    ),
    period: l("MS 500 – MS 1000", "500 AD – 1000 AD"),
    measures: [
      {
        value: 75,
        unit: "m",
        label: l(
          "Andezit Megalit Teras Platformu: cephe genişliği",
          "Andesite Megalithic Terraced Platform: facade width",
        ),
        source: "wiki-pumapunku-platform",
      },
      {
        value: 40,
        unit: "m",
        label: l(
          "Doğu Esplanade Tören Avlusu: genişlik",
          "Eastern Ceremonial Esplanade Courtyard: width",
        ),
        source: "wiki-pumapunku-court",
      },
    ],
    uncertainty: l(
      "130 tonluk kırmızı kumtaşı platform döşemeleri ve milimetrik kanallı andezit H-blokları sit alanında dağılmış halde korunmuştur; platform rekonstrüksiyonu mimari kazı modellerine dayanır.",
      "The 130-tonne red sandstone platform slabs and precision-drilled H-blocks survive on the mound; the overall platform reconstruction follows archaeological field surveys.",
    ),
    hotspots: [
      spot(
        [-40, 16, 30],
        "Andezit Megalit Teras Platformu",
        "Andesite Megalithic Terraced Platform",
        "167 metre uzunluğundaki teraslı höyüğün zirvesinde yer alan, 130 tonluk tek parça kırmızı kumtaşı bloklarla kaplı devasa tören platformu.",
        "The colossal artificial terraced temple platform crowned by multi-ton red sandstone slabs fitted with interlocking bronze clamps.",
      ),
      spot(
        [70, 2, -35],
        "Doğu Esplanade Tören Meydanı",
        "Eastern Ceremonial Esplanade",
        "Megalit tapınağın doğusuna açılan, yüzlerce hacının toplandığı taş döşemeli tören meydanı ve revaklı geçitler.",
        "The paved ceremonial plaza where pilgrims gathered before ascending the megalithic terraces toward the inner sanctuary.",
      ),
    ],
    sources: [
      {
        key: "wiki-pumapunku-platform",
        title: l("Puma Punku Terraced Platform", "Puma Punku Terraced Platform"),
        url: "https://en.wikipedia.org/wiki/Pumapunku",
      },
      {
        key: "wiki-pumapunku-court",
        title: l("Puma Punku Ceremonial Esplanade", "Puma Punku Ceremonial Esplanade"),
        url: "https://en.wikipedia.org/wiki/Pumapunku",
      },
      {
        key: "wiki-pumapunku",
        title: l("Wikipedia: Pumapunku", "Wikipedia: Pumapunku"),
        url: "https://en.wikipedia.org/wiki/Pumapunku",
        context: true,
      },
    ],
    model: {
      kind: "city",
      radius: 360,
      places: [
        {
          spec: {
            kind: "megalithic-platform",
            platformWidth: 75,
            platformLength: 60,
            platformHeight: 15,
            tiers: 4,
            sunGateWidth: 4.8,
            sunGateHeight: 3.5,
            monolithHeight: 4.0,
            orthostats: 8,
            hBlocks: 6,
          },
          at: [-45, 45],
          rotate: 180,
        },
        {
          spec: {
            kind: "megalithic-platform",
            platformWidth: 40,
            platformLength: 30,
            platformHeight: 2,
            tiers: 1,
            sunGateWidth: 2.4,
            sunGateHeight: 2.5,
          },
          at: [70, -35],
        },
      ],
      streets: [
        [0, -26, 0, 50, 8],
        [-30, 0, 30, 0, 8],
      ],
      viewpoint: { at: [0, -30], look: [-40, 10, 30] },
    },
  },
  ...SAGALASSOS_ZEUGMA_SUMELA_PATARA,
  ...ON_YENI,
  ...ISTANBUL,
  ...EGE_ANADOLU,
  ...ANADOLU_YENI,
];

export function getReconstruction(id: string): Reconstruction | undefined {
  return reconstructions.find((item) => item.id === id);
}

/** The reconstructions available for one site, in data order. */
export function reconstructionsFor(slug: string): Reconstruction[] {
  return reconstructions.filter((item) => item.siteSlug === slug);
}

/**
 * The reconstruction a named structure on a city page links to, if any. Keyed
 * on the Turkish name because that is the name `siteDetails` orders its list
 * by, and the same key `structure-photos.ts` already uses.
 */
export function reconstructionForStructure(
  slug: string,
  structureTr: string,
): Reconstruction | undefined {
  return reconstructions.find(
    (item) => item.siteSlug === slug && item.structure.tr === structureTr,
  );
}

export function sourceFor(item: Reconstruction, key: string): Source | undefined {
  return item.sources.find((source) => source.key === key);
}
