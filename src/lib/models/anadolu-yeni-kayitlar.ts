import type { Localized } from "@/lib/i18n";
import type { Hotspot, Reconstruction, Source } from "@/lib/reconstructions";
import {
  aqueductLayout,
  undergroundLayout,
  type AqueductSpec,
  type MudbrickSpec,
  type RockChurchSpec,
  type SeljukSpec,
  type UndergroundSpec,
} from "@/lib/models/anadolu-yeni";

/**
 * Six more across Anatolia: the siphon bridge of the Aspendos aqueduct, the
 * underground city of Derinkuyu, the rock churches of Göreme, the portals of
 * Divriği, the temples on the mound of Arslantepe and the West Theatre of
 * Laodikeia. Where the sources that could be opened give no dimensions the
 * record shows none, and its source is marked `context`.
 */

const l = (tr: string, en: string): Localized => ({ tr, en });

const spot = (
  at: [number, number, number],
  labelTr: string,
  labelEn: string,
  noteTr: string,
  noteEn: string,
): Hotspot => ({ at, label: l(labelTr, labelEn), note: l(noteTr, noteEn) });

const wiki = (key: string, slug: string, tr: string, en: string, context = false): Source => ({
  key,
  title: l(tr, en),
  url: `https://en.wikipedia.org/wiki/${slug}`,
  ...(context ? { context: true as const } : {}),
});

const ASPENDOS: AqueductSpec = {
  kind: "aqueduct",
  arches: 46,
  archHeight: 15,
  towerSide: 5.5,
  towerHeight: 30,
  span: 5.5,
  pier: 2.2,
  width: 2.4,
};
const aspendos = aqueductLayout(ASPENDOS);

const DERINKUYU: UndergroundSpec = {
  kind: "underground-city",
  depth: 85,
  levels: 5,
  shaftDepth: 55,
  shaftWidth: 3,
  shaftLength: 2.8,
  width: 48,
  thickness: 30,
};
const derinkuyu = undergroundLayout(DERINKUYU);

const GOREME: RockChurchSpec = {
  kind: "rock-churches",
  chimneys: 14,
  churches: 3,
  height: 18,
  valleyWidth: 30,
};

const DIVRIGI: SeljukSpec = {
  kind: "seljuk-complex",
  portals: 4,
  length: 64,
  depth: 32,
  wallHeight: 12,
  portalHeight: 14,
};

const ARSLANTEPE: MudbrickSpec = {
  kind: "mudbrick-complex",
  buildings: 4,
  wallHeight: 3.2,
  terrace: 2.4,
};

export const ANADOLU_YENI: Reconstruction[] = [
  /* ---------------- Aspendos: the siphon bridge ---------------- */
  {
    id: "aspendos-sifon-koprusu",
    siteSlug: "aspendos-su-kemeri",
    structure: l("Ters sifon hattı", "The siphon line"),
    title: l("Aspendos Su Kemeri", "The Aspendos Aqueduct"),
    blurb: l(
      "Aspendos'a suyu getiren 19 km'lik Roma su yolunun son kısmı: ovayı geçen bir ters sifon. Su, taş bloklardan oyulmuş bir boruyla kemerlerin üstünden akar; iki uçtaki basınç kulelerinde yükselip yeniden iner, borudaki havayı ve basıncı boşaltır.",
      "The last stretch of the 19 km Roman aqueduct that brought water to Aspendos: an inverted siphon across the plain. The water ran in a pipe of bored stone blocks along the top of the arcade, and in the pressure towers at either end rose and fell again, venting the air and the pressure in the pipe.",
    ),
    period: l("MS 2. yüzyıl", "2nd century AD"),
    measures: [
      {
        value: 46,
        unit: "count",
        label: l("Orta bölümdeki kemer", "Arches in the central section"),
        source: "en",
      },
      {
        value: 15,
        unit: "m",
        label: l("Kemerlerin yüksekliği (en çok)", "Height of the arches (up to)"),
        source: "en",
      },
      {
        value: 5.5,
        unit: "m",
        label: l("Basınç kulesinin kenarı", "Side of a pressure tower"),
        source: "en",
      },
      {
        value: 30,
        unit: "m",
        label: l("Basınç kulesinin yüksekliği", "Height of a pressure tower"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Kemer sayısı (46), kemerlerin yüksekliği (15 m'ye kadar), kulelerin kenarı (5,5 m) ve yüksekliği (30 m) İngilizce Wikipedia'nın Aspendos maddesinden alınmıştır. Kemer açıklığı, ayakların genişliği ve köprünün eni ölçülmüş değil, oranla verilmiştir; bu yüzden modeldeki orta bölüm (yaklaşık 356 m) kaynağın verdiği 924 m'den kısadır. Sifonun öteki iki bölümü, kulelerin arasındaki dirsekler ve borunun kulelere çıkışı basitleştirilmiştir.",
      "The number of arches (46), their height (up to 15 m), the side (5.5 m) and height (30 m) of the towers come from the English Wikipedia's article on Aspendos. The span of the arches, the width of the piers and of the bridge are not measured but proportioned; so the central section in the model (about 356 m) is shorter than the 924 m the source gives. The two other sections of the siphon, the bends at the towers and the way the pipe climbs them are simplified.",
    ),
    hotspots: [
      spot(
        [aspendos.x1 + ASPENDOS.towerSide / 2, ASPENDOS.towerHeight + 0.5, 0],
        "Basınç kulesi",
        "A pressure tower",
        "Su burada yükselir, havası boşalır ve yeniden iner.",
        "Here the water rose, let out its air and fell again.",
      ),
      spot(
        [aspendos.road + 20, ASPENDOS.archHeight + 0.6, 0],
        "Taş boru",
        "The stone pipe",
        "Ortası delinmiş, uç uca eklenmiş taş bloklar.",
        "Stone blocks bored through and joined end to end.",
      ),
      spot(
        [aspendos.road, 6, 0],
        "Kemerler",
        "The arches",
        "Ovayı geçen kırk altı kemer; yirmi dokuzu ayaktadır.",
        "Forty-six arches across the plain; twenty-nine still stand.",
      ),
    ],
    sources: [wiki("en", "Aspendos", "Wikipedia (İngilizce): Aspendos", "Wikipedia: Aspendos")],
    model: ASPENDOS,
  },

  /* ---------------- Derinkuyu: the underground city ---------------- */
  {
    id: "derinkuyu-yeralti-sehri",
    siteSlug: "derinkuyu",
    structure: l("Havalandırma bacası", "Ventilation shaft"),
    title: l("Derinkuyu Yeraltı Şehri", "The Underground City of Derinkuyu"),
    blurb: l(
      "Yumuşak tüfe oyulmuş, 85 metre derine inen bir yeraltı şehri: ahırlar, şaraphaneler, ambarlar, evler ve en alt katta bir kilise; katları içeriden yuvarlanan taş kapılarla kapanır. 20.000 kişiyi hayvanları ve yiyecekleriyle barındırabiliyordu. Model, tepeyi önden kesilmiş gibi gösterir.",
      "An underground city cut down 85 metres into the soft tuff: stables, wine presses, store rooms, dwellings and a church on the lowest level, its levels closed from inside by rolling stone doors. It could shelter 20,000 people with their animals and food. The model shows the hill as if cut away in front.",
    ),
    period: l("MÖ 8. yüzyıl - MS 12. yüzyıl", "8th century BC - 12th century AD"),
    measures: [
      { value: 85, unit: "m", label: l("Derinlik (yaklaşık)", "Depth (about)"), source: "en" },
      { value: 5, unit: "count", label: l("Kat", "Levels"), source: "en" },
      {
        value: 55,
        unit: "m",
        label: l("Kuyu olarak kullanılan baca", "Shaft used as a well"),
        source: "en",
      },
      {
        value: 3,
        unit: "m",
        label: l("Ana bacanın genişliği", "Width of the main shaft"),
        source: "en",
      },
      {
        value: 2.8,
        unit: "m",
        label: l("Ana bacanın derinliği", "Depth of the main shaft"),
        source: "en",
      },
      {
        value: 20000,
        unit: "people",
        label: l("Barınabilen kişi", "People it could shelter"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Derinlik (yaklaşık 85 m), kat sayısı (beş; en altta kilise), 55 m'lik baca, ana bacanın 3 × 2,8 m'lik kesiti ve 20.000 kişi İngilizce Wikipedia'dan alınmıştır; bazı kaynaklar gezilebilen kat sayısını sekiz olarak verir. Odaların planı, sayısı ve büyüklüğü, katlar arasındaki kaya kalınlığı ve yeraltı şehrinin genişliği modelin oranıdır: gerçek şehir düz katlar halinde değil, birbirine merdiven ve eğimli tünellerle bağlanan düzensiz odalar halinde oyulmuştur. Model bir müze maketi gibi tepeyi önden keserek gösterir; tepenin üstündeki köy temsilîdir.",
      "The depth (about 85 m), the number of levels (five; the church on the lowest), the 55 m shaft, the 3 × 2.8 m section of the main shaft and the 20,000 people come from the English Wikipedia; some sources give eight walkable levels. The plan, number and size of the rooms, the rock left between the levels and the width of the city are the model's proportion: the real city is not cut in flat storeys but in irregular rooms joined by stairs and sloping tunnels. The model shows the hill cut away in front like a museum model; the village on top is representative.",
    ),
    hotspots: [
      spot(
        [derinkuyu.shaftX, DERINKUYU.depth - 20, derinkuyu.face + 2],
        "Havalandırma bacası",
        "The ventilation shaft",
        "Bütün katlara hava indiren, aynı zamanda kuyu olan 55 metrelik baca.",
        "The 55-metre shaft that brought air down to every level and served as a well.",
      ),
      spot(
        [-DERINKUYU.width / 2 + 13, derinkuyu.levels[4]!.y + 3, derinkuyu.face + 2],
        "Kilise",
        "The church",
        "En alt katta, haç planlı kilise.",
        "The cross-shaped church on the lowest level.",
      ),
      spot(
        [-DERINKUYU.width / 2 + 9, derinkuyu.levels[0]!.y + 1.2, derinkuyu.face + 5.2],
        "Yuvarlak taş kapı",
        "A rolling stone door",
        "Kat içeriden bu taşla kapatılırdı.",
        "The level was closed from inside with this stone.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "Derinkuyu_underground_city",
        "Wikipedia (İngilizce): Derinkuyu yeraltı şehri",
        "Wikipedia: Derinkuyu underground city",
      ),
    ],
    model: DERINKUYU,
  },

  /* ---------------- Göreme: the rock churches ---------------- */
  {
    id: "goreme-kaya-kiliseleri",
    siteSlug: "goreme",
    structure: l("Karanlık Kilise", "Dark Church"),
    title: l("Göreme Kaya Kiliseleri", "The Rock Churches of Göreme"),
    blurb: l(
      "Peribacalarının içine oyulmuş kiliseler: sert bir kaya şapkasının koruduğu yumuşak tüf konilerinde kapı, pencere ve kör kemerlerle oyulmuş cepheler; içeride freskli nefler. Kapadokya'nın en çok boyalı kilisesi Göreme'dedir; fresklerin çoğu 10. ve 11. yüzyıldandır.",
      "Churches cut into the fairy chimneys: cones of soft tuff under caps of harder rock, carved fronts with doors, windows and blind arcades, and inside them frescoed naves. Göreme has more painted churches than anywhere else in Cappadocia; most of the frescoes are of the 10th and 11th centuries.",
    ),
    period: l("MS 6. - 12. yüzyıl", "6th - 12th century AD"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Göreme maddesi) kayaya oyulmuş kiliseleri, manastırları, peribacalarını ve tarihleri (basit kiliseler 6.-7., freskli olanlar çoğunlukla 10.-11. yüzyıl) anlatır; ölçü vermez. Bu yüzden modelde ölçü gösterilmez: peribacalarının sayısı, yüksekliği, vadinin genişliği, kilise cephelerinin biçimi ve yeri temsilîdir. Kiliselerin içi ve freskleri modellenmemiştir.",
      "The source that could be opened (the English Wikipedia's article on Göreme) describes the rock-cut churches, the monasteries, the fairy chimneys and the dates (the simpler churches of the 6th-7th, most of the frescoed ones of the 10th-11th century); it gives no dimensions. So the model shows none: the number and height of the chimneys, the width of the valley, the form and place of the church fronts are representative. The insides of the churches and their frescoes are not modelled.",
    ),
    hotspots: [
      spot(
        [0, 19, 18],
        "Peribacası",
        "A fairy chimney",
        "Sert kaya şapkası altındaki tüfü yağmurdan korur.",
        "The hard cap shields the tuff beneath it from the rain.",
      ),
      spot(
        [-30, 4, -8],
        "Kilise cephesi",
        "A church front",
        "Kayaya oyulmuş kapı, pencereler ve kör kemerler.",
        "Door, windows and blind arcade cut in the rock.",
      ),
    ],
    sources: [wiki("en", "Göreme", "Wikipedia (İngilizce): Göreme", "Wikipedia: Göreme", true)],
    model: GOREME,
  },

  /* ---------------- Divriği: the Great Mosque and Hospital ---------------- */
  {
    id: "divrigi-ulu-camii",
    siteSlug: "divrigi",
    structure: l("Cennet Kapısı", "Paradise Portal"),
    title: l("Divriği Ulu Camii ve Darüşşifası", "The Great Mosque and Hospital of Divriği"),
    blurb: l(
      "Mengücekli Ahmet Şah ile eşi Turan Melek'in 1228-29'da yan yana yaptırdığı cami ve darüşşifa. Taş kapıları, İslam mimarisinde eşi olmayan derinlikte bitkisel ve geometrik kabartmalarla örülüdür; en gösterişlisi caminin kuzey kapısıdır.",
      "The mosque and hospital that the Mengücekid Ahmet Şah and his wife Turan Melek built side by side in 1228-29. Its stone portals are carved with plant and geometric ornament of a depth unmatched in Islamic architecture, the north portal of the mosque the richest of them.",
    ),
    period: l("1228 - 1229", "1228 - 1229"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Divriği maddesi) yapının 13. yüzyılda Mengücekliler tarafından yapıldığını ve oymaları nedeniyle UNESCO listesinde olduğunu söyler; kapıları ve ölçüleri vermez. Yaptıranların adları ve kapıların adları sitenin kendi sayfasındandır. Bu yüzden modelde ölçü gösterilmez: yapının boyu, eni, duvar ve kapı yükseklikleri, kapıların yeri ve süslemenin biçimi temsilîdir. Kabartmalar kaba bloklar ve halkalarla yalnızca derinliklerini göstermek için çizilmiştir; caminin içi, minberi ve darüşşifanın avlusu modellenmemiştir.",
      "The source that could be opened (the English Wikipedia's article on Divriği) says the building was put up by the Mengüjeks in the 13th century and is on UNESCO's list for its carving; it describes neither the portals nor any dimensions. The founders' names and the names of the portals come from the site's own page. So the model shows none: the length and depth of the building, the height of its walls and portals, the place of the portals and the form of their carving are representative. The carving is drawn with rough blocks and rings only to show its depth; the inside of the mosque, its minbar and the hospital's court are not modelled.",
    ),
    hotspots: [
      spot(
        [DIVRIGI.length * 0.18, DIVRIGI.portalHeight * 0.6, -DIVRIGI.depth / 2 - 2],
        "Cennet Kapısı",
        "The Paradise Portal",
        "Caminin kuzey kapısı: kabartmalar duvardan metrelerce taşar.",
        "The north portal of the mosque: its carving stands far out of the wall.",
      ),
      spot(
        [-DIVRIGI.length * 0.3, DIVRIGI.portalHeight * 0.5, -DIVRIGI.depth / 2 - 2],
        "Darüşşifa Kapısı",
        "The Hospital Portal",
        "Hastanenin kapısı; içeride müzikle tedavi yapıldığı kabul edilir.",
        "The hospital's door; patients inside are held to have been treated with music.",
      ),
    ],
    sources: [wiki("en", "Divriği", "Wikipedia (İngilizce): Divriği", "Wikipedia: Divriği", true)],
    model: DIVRIGI,
  },

  /* ---------------- Arslantepe: the temples on the mound ---------------- */
  {
    id: "arslantepe-saray",
    siteSlug: "arslantepe",
    structure: l("MÖ 4. binyıl sarayı", "4th-millennium palace"),
    title: l("Arslantepe Saray Yapıları", "The Palace Buildings of Arslantepe"),
    blurb: l(
      "Malatya ovasındaki höyüğün tepesinde, MÖ 4. binyılın sonunda sekiler üzerine kurulmuş, birbirine bağlı dört anıtsal yapı; ikisi tapınaktır. Devletin doğuşunun en eski izlerinden: tapınaklarda bulunan mühür baskıları yazıdan önceki bürokrasiyi gösterir.",
      "On top of the mound in the Malatya plain, four linked monumental buildings on terraces from the end of the 4th millennium BC, two of them temples: among the earliest traces of the birth of the state. The sealings found in the temples show bureaucracy before writing.",
    ),
    period: l("MÖ 3350 - 3000", "3350 - 3000 BC"),
    measures: [
      {
        value: 4,
        unit: "count",
        label: l("Anıtsal yapı (ikisi tapınak)", "Monumental buildings (two of them temples)"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Dört anıtsal yapı (A ve B tapınakları, III. ve IV. yapılar), birbirine bağlı sekilerde durmaları, tapınaklarda bulunan mühür baskıları ve tarih (MÖ 3350-3000, VI A katı) İngilizce Wikipedia'nın Arslantepe maddesinden alınmıştır; kaynak yapıların ölçülerini vermez. Yapıların planı, duvar yükseklikleri ve sekilerin yüksekliği modelin oranıdır. Kerpiç duvarlar ve taş temeller höyüğün öteki katlarındaki yapılara göre çizilmiştir; resimli koridor sitenin sayfasındaki duvar resimlerini gösterir, yeri ve biçimi temsilîdir.",
      "The four monumental buildings (Temples A and B, Buildings III and IV), their standing on linked terraces, the sealings found in the temples and the date (3350-3000 BC, level VI A) come from the English Wikipedia's article on Arslantepe; the source gives no dimensions of the buildings. Their plans, the height of their walls and of the terraces are the model's proportion. The mud-brick walls on stone footings follow the buildings of the mound's other levels; the painted corridor stands for the wall paintings on the site's page, its place and form representative.",
    ),
    hotspots: [
      spot(
        [12, ARSLANTEPE.terrace + ARSLANTEPE.wallHeight + 1, 12],
        "Tapınak",
        "A temple",
        "Kerpiç duvarlı, sıvalı ve beyaz badanalı tapınak.",
        "A temple of mud brick, plastered and whitewashed.",
      ),
      spot(
        [-6, ARSLANTEPE.terrace + 2, 1],
        "Resimli koridor",
        "The painted corridor",
        "Duvarlarında kırmızı ve siyahla boyanmış figürler.",
        "Figures painted in red and black on its walls.",
      ),
      spot(
        [-16, ARSLANTEPE.terrace + 2.5, -5.8],
        "III. ve IV. yapılar",
        "Buildings III and IV",
        "İşlevi bilinmeyen iki yapı; III. yapıda mızrak uçları bulundu.",
        "Two buildings of unknown use; spearheads were found in Building III.",
      ),
    ],
    sources: [
      wiki("en", "Arslantepe", "Wikipedia (İngilizce): Arslantepe", "Wikipedia: Arslantepe"),
    ],
    model: ARSLANTEPE,
  },

  /* ---------------- Laodikeia: the West Theatre ---------------- */
  {
    id: "laodikeia-bati-tiyatrosu",
    siteSlug: "laodikeia",
    structure: l("Batı Tiyatrosu", "West Theatre"),
    title: l("Laodikeia Batı Tiyatrosu", "The West Theatre of Laodikeia"),
    blurb: l(
      "Laodikeia'nın iki tiyatrosundan biri: Hellenistik dönemde yamaca yaslanarak yapılmış, Roma döneminde yenilenmiş, 8.000 seyirci alan tiyatro. MS 7. yüzyıla kadar kullanıldı.",
      "One of the two theatres of Laodikeia: built against the hillside in the Hellenistic period, renewed under Rome, it held 8,000 spectators and was used until the 7th century AD.",
    ),
    period: l("Hellenistik dönem - MS 7. yüzyıl", "Hellenistic period - 7th century AD"),
    measures: [{ value: 8000, unit: "people", label: l("Seyirci", "Spectators"), source: "en" }],
    uncertainty: l(
      "Seyirci sayısı (8.000) ve kullanım dönemi İngilizce Wikipedia'dan alınmıştır; kaynak tiyatronun ölçülerini vermez. Cavea ve orkestra çapı, sıra sayısı, sahne binasının yüksekliği ve kat sayısı ölçülmüş değil, seyirci sayısına göre verilmiştir; sahne cephesi sade, iki katlı bir cephe olarak çizilmiştir.",
      "The audience (8,000) and the period of use come from the English Wikipedia; the source gives no dimensions of the theatre. The diameters of the cavea and orchestra, the row count, the height of the stage building and its storeys are not measured but set from the audience; the stage front is drawn as a plain two-storey front.",
    ),
    hotspots: [
      spot(
        [0, 0.8, 4],
        "Orkestra",
        "The orchestra",
        "Hellenistik tiyatronun yuvarlak dans alanı.",
        "The round dancing floor of the Hellenistic theatre.",
      ),
      spot(
        [0, 9.5, 24],
        "Diazoma",
        "The diazoma",
        "Alt ve üst sıraları ayıran geçit.",
        "The walkway between the lower and upper rows.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "Laodicea_on_the_Lycus",
        "Wikipedia (İngilizce): Laodikeia",
        "Wikipedia: Laodicea on the Lycus",
      ),
    ],
    model: {
      kind: "roman-theatre",
      caveaDiameter: 82,
      orchestraDiameter: 22,
      scaenaeHeight: 12,
      seatTread: 0.75,
      seatRise: 0.4,
      podiumHeight: 1.2,
      stageDepth: 6,
      stairways: 9,
      lowerRows: 20,
      upperRows: 12,
      character: {
        stone: "marble",
        ground: "hillside",
        facade: "none",
        screen: "plain",
        storeys: 2,
        topGallery: false,
      },
    },
  },
];
