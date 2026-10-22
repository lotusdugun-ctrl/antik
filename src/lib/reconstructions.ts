import type { Localized } from "@/lib/i18n";
import type { HittiteGateSpec } from "@/lib/models/hattusa-aslanli-kapi";
import type { TroyCitadelSpec } from "@/lib/models/troya-vi-surlari";
import type { NeolithicTownSpec } from "@/lib/models/catalhoyuk-dogu-hoyugu";
import type { CathedralSpec } from "@/lib/models/ani-katedrali";
import type { NymphaeumSpec } from "@/lib/models/sagalassos-antoninler-cesmesi";
import type { TerraceVillaSpec } from "@/lib/models/zeugma-villa";
import type { CliffMonasterySpec } from "@/lib/models/sumela-manastiri";
import type { LighthouseSpec } from "@/lib/models/patara-deniz-feneri";
import { SAGALASSOS_ZEUGMA_SUMELA_PATARA } from "@/lib/models/sagalassos-zeugma-sumela-patara";

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
  ground: "hillside" | "plain" | "mound";
  /** The outer face: arcades, a tall pierced wall, or none (the hill runs on). */
  facade: "arcade" | "wall" | "none";
  /** Whose stage front this is. */
  screen: "aspendos" | "hierapolis" | "ephesus" | "side" | "miletus";
  storeys: 2 | 3;
  bays?: number;
  /** Height of the stage platform, where it is known. */
  stageHeight?: number;
  /** A colonnaded gallery round the top of the seating. */
  topGallery: boolean;
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
  cultStatue?: "apollo" | "artemis" | "zeus";
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
  | LighthouseSpec;

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
      "Cephenin genişliği ve yüksekliği ölçülmüştür. Aralıkların düzeni — dört sütun çifti, aralarındaki üç kapı, üst kattaki üç pencere ve onların üzerindeki üçgen/yay alınlıklar — 1970-78'de yeniden dikilmiş cephenin fotoğraflarından çıkarılmıştır; iki katın 16 metreyi nasıl paylaştığı, sütun çapları ve heykellerin duruşu ise orantıdır, ölçü değil. Nişlerdeki dört erdem ve üst kattaki iki erkek figür kumaş kıvrımlarına kadar modellenmiştir ama Viyana'daki özgün heykellerin kopyası değildir; duruşları ve giysileri yorumdur. Merdivenin iki yanındaki kaidelerin bronz heykelleri kayıptır; yerlerinde dönemin iki gerçek togalı Roma heykelinin, Arringatore'nin ve başı örtülü Tiberius'un taramaları durur. Başlıkların akant yaprakları ve volütleri modellenmiştir ama taştaki işçiliğin kopyası değildir; arşitravlardaki ve kaidelerdeki yazıtlar gerçek Yunanca ve Latince metinleriyle gösterilmiştir, ama satır bölünmeleri ve harf boyları modelindir ve Ennoia kaidesi öteki üçünün örneğine göre yazılmıştır; frizlerin bezemesi modelde yoktur. **Renkler de ölçü değil, yorumdur:** Roma mermer cepheleri boyalıydı ve bugün Efes'te boya izi kalmamıştır — modeldeki kırmızı panolar, mavi-altın silmeler, ahşap kapılar ve altın kafes pencereler yayımlanmış bir rekonstrüksiyon resminden alınmıştır, kazıdan değil. Salonun tavanı da yoktur: yapının iki katlı mı üç katlı mı olduğu tartışmalıdır.",
      "The façade's width and height are measured. The rhythm of the front — four pairs of columns, three doorways between them, three windows above and the triangular and segmental pediments over those — is read off photographs of the front re-erected in 1970-78; how the two orders divide the 16 metres, the column diameters and the poses of the statues are proportion rather than measurement. The four virtues in the niches and the two male figures above are modelled down to the folds of their dress, but they are not copies of the originals in Vienna; their poses and clothing are interpretation. The bronze statues on the two bases by the stair are lost; they stand in scans of two real Roman togate statues of the period, the Arringatore and the veiled Tiberius. The acanthus and volutes of the capitals are modelled but are not a copy of the carving on the stone, the inscriptions on the architraves and bases carry their real Greek and Latin texts, though their line breaks and letter sizes are the model's and the Ennoia base is lettered on the pattern of the other three, and the ornament of the friezes is absent. **The colour is interpretation, not measurement:** Roman marble fronts were painted, and no pigment survives at Ephesus — the red panels, the blue and gilded mouldings, the timber doors and the gilded window lattices are taken from a published reconstruction painting, not from the excavation. So is the hall's ceiling absent: whether the building had two storeys or three is disputed.",
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
        topGallery: true,
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
  ...SAGALASSOS_ZEUGMA_SUMELA_PATARA,
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
