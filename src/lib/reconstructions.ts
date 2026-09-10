import type { Localized } from "@/lib/i18n";

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
  velariumMasts: number;
  /** Modelled: seat geometry, and therefore the row count. See `uncertainty`. */
  seatTread: number;
  seatRise: number;
  podiumHeight: number;
  stageDepth: number;
  stairways: number;
  lowerRows: number;
  upperRows: number;
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

export type ModelSpec =
  | RomanFacadeSpec
  | RomanTheatreSpec
  | IonicDipterosSpec
  | NeolithicEnclosureSpec
  | GreatAltarSpec
  | StadiumSpec
  | PeristyleHouseSpec;

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
      "Cephenin genişliği ve yüksekliği ölçülmüştür. Aralıkların düzeni — dört sütun çifti, aralarındaki üç kapı, üst kattaki üç pencere ve onların üzerindeki üçgen/yay alınlıklar — 1970-78'de yeniden dikilmiş cephenin fotoğraflarından çıkarılmıştır; iki katın 16 metreyi nasıl paylaştığı, sütun çapları ve heykellerin duruşu ise orantıdır, ölçü değil. Nişlerdeki heykeller çizilmemiş, cephedeki Episteme heykelinin — kaidesinde adı yazılı olanın — fotoğrafı dört nişe de kaplanmıştır; dördü de aynı görünür, oysa yerlerinde Sophia, Ennoia ve Arete duruyordu. Başlıkların akant yaprakları ve volütleri modellenmiştir ama taştaki işçiliğin kopyası değildir; frizlerdeki yazıtlar ve bezeme modelde yoktur. **Renkler de ölçü değil, yorumdur:** Roma mermer cepheleri boyalıydı ve bugün Efes'te boya izi kalmamıştır — modeldeki kırmızı panolar, mavi-altın silmeler, ahşap kapılar, altın kafes pencereler ve merdivenin iki yanındaki bronz atlı heykeller yayımlanmış bir rekonstrüksiyon resminden alınmıştır, kazıdan değil. Salonun tavanı da yoktur: yapının iki katlı mı üç katlı mı olduğu tartışmalıdır.",
      "The façade's width and height are measured. The rhythm of the front — four pairs of columns, three doorways between them, three windows above and the triangular and segmental pediments over those — is read off photographs of the front re-erected in 1970-78; how the two orders divide the 16 metres, the column diameters and the poses of the statues are proportion rather than measurement. The statues in the niches are not drawn but photographed: a picture of Episteme, who still stands on this front with her name cut beneath her, fills all four niches — where Sophia, Ennoia and Arete stood beside her. The acanthus and volutes of the capitals are modelled but are not a copy of the carving on the stone, and the inscriptions and the ornament of the friezes are absent. **The colour is interpretation, not measurement:** Roman marble fronts were painted, and no pigment survives at Ephesus — the red panels, the blue and gilded mouldings, the timber doors, the gilded window lattices and the bronze horsemen flanking the stairs are taken from a published reconstruction painting, not from the excavation. So is the hall's ceiling absent: whether the building had two storeys or three is disputed.",
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
        [0, 9, 29.5],
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
      "Dünyanın Yedi Harikası'ndan biri ve bugün ayakta tek bir sütunu bile kalmayan tek yapı: bataklık bir arazide, 137 metre uzunluğunda bir mermer orman. Plinius'a göre 36 sütunun kaidesi kabartmalıydı. Model, MÖ 4. yüzyılda yeniden inşa edilen üçüncü tapınağı gösterir.",
      "One of the Seven Wonders, and the only one with not a single column left standing: a marble forest 137 metres long, raised on marshy ground. Pliny says 36 of the columns were carved in relief at the base. The model shows the third temple, rebuilt in the 4th century BC.",
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
        [0, 30, 45],
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
        [0, 4.6, -19],
        "Gigantomakhia frizi",
        "The Gigantomachy frieze",
        "113 metrelik yüksek kabartma: tanrılarla devlerin savaşı, yapının çevresini dolaşır.",
        "113 metres of high relief: the gods against the giants, wrapping the whole building.",
      ),
      spot(
        [0, 3.4, -21],
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
        "Yirmi metre çapında yarım daire.",
        "A half circle twenty metres across.",
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
