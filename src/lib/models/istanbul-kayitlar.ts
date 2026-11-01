import type { Localized } from "@/lib/i18n";
import type { Hotspot, Reconstruction, Source } from "@/lib/reconstructions";
import { domedLayout, type DomedSpec } from "@/lib/models/kubbeli";

/**
 * Istanbul and Edirne: the Galata Tower, the Basilica Cistern, Hagia Sophia,
 * and Sinan's Süleymaniye and Selimiye mosques. The same rules as everywhere:
 * a number shown as a measurement is one the model is built from, and
 * `uncertainty` says what is inference.
 */

const l = (tr: string, en: string): Localized => ({ tr, en });

const spot = (
  at: [number, number, number],
  labelTr: string,
  labelEn: string,
  noteTr: string,
  noteEn: string,
): Hotspot => ({ at, label: l(labelTr, labelEn), note: l(noteTr, noteEn) });

const wiki = (key: string, slug: string, tr: string, en: string): Source => ({
  key,
  title: l(tr, en),
  url: `https://en.wikipedia.org/wiki/${slug}`,
});

const AYASOFYA: DomedSpec = {
  kind: "domed-sanctuary",
  variant: "byzantine",
  domeDiameter: 32.7,
  domeHeight: 55.6,
  hallWidth: 73,
  hallLength: 82,
  courtWidth: 50,
  courtLength: 36,
  wallHeight: 30,
  rise: 0.45,
  windows: 40,
};
const SULEYMANIYE: DomedSpec = {
  kind: "domed-sanctuary",
  variant: "longitudinal",
  domeDiameter: 26.5,
  domeHeight: 53,
  hallWidth: 58.5,
  hallLength: 57.5,
  minarets: 4,
  minaretHeight: 76,
  serefe: 3,
  courtWidth: 57,
  courtLength: 47,
  wallHeight: 24,
  rise: 0.95,
  windows: 32,
};
const SELIMIYE: DomedSpec = {
  kind: "domed-sanctuary",
  variant: "octagonal",
  domeDiameter: 31.28,
  domeHeight: 42,
  hallWidth: 60,
  hallLength: 44,
  minarets: 4,
  minaretHeight: 70.89,
  serefe: 3,
  courtWidth: 60,
  courtLength: 44,
  wallHeight: 20,
  rise: 0.9,
  windows: 32,
};
const ay = domedLayout(AYASOFYA);
const su = domedLayout(SULEYMANIYE);
const se = domedLayout(SELIMIYE);

export const ISTANBUL: Reconstruction[] = [
  /* ---------------- the Galata Tower ---------------- */
  {
    id: "galata-kulesi",
    siteSlug: "galata-kulesi",
    structure: l("Taş gövde", "Stone shaft"),
    title: l("Galata Kulesi", "The Galata Tower"),
    blurb: l(
      "Cenevizlilerin 1348'de Galata kolonisinin surlarının tepesine diktiği taş kule: duvarları neredeyse dört metre kalınlığında, tepesinde seyir terası ve konik külah. Haliç'in ve Boğaz'ın üstünden bütün İstanbul görünür.",
      "The stone tower the Genoese raised in 1348 at the top of the walls of their colony at Galata: walls nearly four metres thick, a viewing gallery round the top and a conical cap. All Istanbul is seen from it, over the Golden Horn and the Bosporus.",
    ),
    period: l("1348", "1348"),
    measures: [
      {
        value: 62.59,
        unit: "m",
        label: l("Yükseklik (tepe süsü hariç)", "Height (without the finial)"),
        source: "en",
      },
      {
        value: 16.45,
        unit: "m",
        label: l("Dış çap (tabanda)", "Outer diameter (at the base)"),
        source: "en",
      },
      { value: 8.95, unit: "m", label: l("İç çap", "Inner diameter"), source: "en" },
      {
        value: 3.75,
        unit: "m",
        label: l("Duvar kalınlığı", "Thickness of the walls"),
        source: "en",
      },
      {
        value: 51.65,
        unit: "m",
        label: l("Seyir terasının yüksekliği", "Height of the viewing gallery"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Yükseklik, dış ve iç çap, duvar kalınlığı ve seyir terasının yüksekliği İngilizce Wikipedia'dan alınmıştır. Gövdenin kat kat incelmesi, pencerelerin yeri ve sayısı, terasın konsolları ve korkuluğu, üst katların pencereleri ve külahın biçimi fotoğraflara göre verilmiştir. Bugünkü külah 1965-67'de yeniden yapılmıştır; ilk külahın biçimi kesin bilinmez. Çevredeki evler ve meydan yalnızca ortamı gösterir.",
      "The height, the outer and inner diameters, the thickness of the walls and the height of the viewing gallery come from the English Wikipedia. The stepping of the shaft, the number and places of the windows, the corbels and railing of the gallery, the windows of the upper floors and the form of the cap follow photographs. The present cap was rebuilt in 1965-67; the form of the first is not known for certain. The houses and the square round it only show the setting.",
    ),
    hotspots: [
      spot(
        [0, 2, -9.2],
        "Kapı",
        "The door",
        "Kulenin tek kapısı meydana bakar; içeride merdiven duvarın içinden yükselir.",
        "The tower's only door looks onto the square; inside, the stair rises within the wall.",
      ),
      spot(
        [0, 25, -8.8],
        "Taş gövde",
        "The stone shaft",
        "Duvarlar 3,75 m kalınlığındadır; iç çap yalnızca 8,95 m.",
        "The walls are 3.75 m thick; the inside is only 8.95 m across.",
      ),
      spot(
        [0, 52.5, -9.6],
        "Seyir terası",
        "The viewing gallery",
        "51,65 m yükseklikte, kulenin çevresini dolanan teras.",
        "The gallery running round the tower 51.65 m up.",
      ),
      spot(
        [0, 59, -5.5],
        "Konik külah",
        "The conical cap",
        "Kurşun kaplı külah; bugünkü 1960'larda yeniden yapıldı.",
        "The lead-covered cap; the present one was rebuilt in the 1960s.",
      ),
    ],
    sources: [
      wiki("en", "Galata_Tower", "Wikipedia (İngilizce): Galata Kulesi", "Wikipedia: Galata Tower"),
    ],
    model: {
      kind: "round-tower",
      height: 62.59,
      outerDiameter: 16.45,
      innerDiameter: 8.95,
      wallThickness: 3.75,
      galleryHeight: 51.65,
      capHeight: 7,
    },
  },

  /* ---------------- the Basilica Cistern ---------------- */
  {
    id: "yerebatan-sarnici",
    siteSlug: "yerebatan-sarnici",
    structure: l("336 sütun", "336 columns"),
    title: l("Yerebatan Sarnıcı", "The Basilica Cistern"),
    blurb: l(
      "Justinianus'un 6. yüzyılda büyük sarayın altına yaptırdığı yeraltı sarnıcı: on ikişer sıra halinde 336 mermer sütunun taşıdığı tuğla tonozlar, 80.000 metreküp su. Modelde tonozların çoğu kaldırılmış; sütun ormanı yukarıdan görünüyor.",
      "The underground cistern Justinian built under the great palace in the 6th century: brick vaults on 336 marble columns in twelve rows, 80,000 cubic metres of water. Most of the vaults are left off in the model, so the forest of columns can be seen from above.",
    ),
    period: l("6. yüzyıl", "6th century"),
    measures: [
      { value: 138, unit: "m", label: l("Uzunluk", "Length"), source: "en" },
      { value: 65, unit: "m", label: l("Genişlik", "Width"), source: "en" },
      { value: 12, unit: "count", label: l("Sütun sırası", "Rows of columns"), source: "en" },
      {
        value: 28,
        unit: "count",
        label: l("Her sıradaki sütun", "Columns in each row"),
        source: "en",
      },
      { value: 9, unit: "m", label: l("Sütun yüksekliği", "Height of the columns"), source: "en" },
      {
        value: 4,
        unit: "m",
        label: l("Tuğla duvarın kalınlığı", "Thickness of the brick wall"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Uzunluk, genişlik, 12 sıra 28 sütun (336), sütun yüksekliği (9 m) ve duvar kalınlığı (4 m) İngilizce Wikipedia'dan alınmıştır. Tonozlar, suyun derinliği ve yürüme yolları modelin oranıdır; bugünkü yollar modern olup sarnıç kullanımdayken yoktu. Sarnıcın içi görülebilsin diye tonozların yalnızca kuzey kenardaki üç sırası gösterilmiş, gerisi kesilmiştir. Sütunlar devşirmedir; başlıkları farklı düzenlerden rastgele seçilmiştir. Medusa başlarının ve Gözyaşı Sütunu'nun yeri yaklaşıktır.",
      "The length, the width, the twelve rows of 28 columns (336), the height of the columns (9 m) and the thickness of the wall (4 m) come from the English Wikipedia. The vaults, the depth of the water and the walkways are the model's proportion; today's walkways are modern and were not there while the cistern was in use. So that the inside can be seen, only three rows of vaults along the north side are shown and the rest are cut away. The columns are reused; their capitals are drawn from mixed orders at random. The places of the Medusa heads and the weeping column are approximate.",
    ),
    hotspots: [
      spot(
        [0, 5, -10],
        "Sütun ormanı",
        "The forest of columns",
        "On iki sıra halinde 336 sütun; çoğu eski yapılardan getirilmiştir.",
        "336 columns in twelve rows, most of them taken from older buildings.",
      ),
      spot(
        [0, 10.5, 28],
        "Tuğla tonozlar",
        "The brick vaults",
        "Sütunların taşıdığı tuğla çapraz tonozlar; burada üç sırası gösterilir.",
        "The brick cross-vaults the columns carry; three rows are shown here.",
      ),
      spot(
        [-66, 1.6, 30.5],
        "Medusa başları",
        "The Medusa heads",
        "İki sütun kaidesi, biri yan, biri ters konmuş Medusa başlarıdır.",
        "Two column bases are Medusa heads, one on its side, one upside down.",
      ),
      spot(
        [-54, 4, -16.5],
        "Gözyaşı sütunu",
        "The weeping column",
        "Göz motifleriyle bezeli, sürekli nemli duran sütun.",
        "The column carved with eyes, always wet.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "Basilica_Cistern",
        "Wikipedia (İngilizce): Yerebatan Sarnıcı",
        "Wikipedia: Basilica Cistern",
      ),
    ],
    model: {
      kind: "cistern",
      length: 138,
      width: 65,
      rows: 12,
      columnsPerRow: 28,
      columnHeight: 9,
      wallThickness: 4,
      waterDepth: 0.8,
      vaultRows: 3,
    },
  },

  /* ---------------- Hagia Sophia ---------------- */
  {
    id: "ayasofya-ana-kubbe",
    siteSlug: "ayasofya",
    structure: l("Ana kubbe", "Main dome"),
    title: l("Ayasofya", "Hagia Sophia"),
    blurb: l(
      "Justinianus'un 532-537 arasında Miletli İsidoros ve Trallesli Anthemios'a yaptırdığı büyük kilise: dört payenin üstünde yükselen, tabanındaki pencere halkası yüzünden havada asılıymış gibi görünen kubbe. Model yapıyı ilk hâliyle, minaresiz ve önündeki avlusuyla gösterir.",
      "The great church Justinian had Isidore of Miletus and Anthemius of Tralles build in 532-537: a dome on four piers that seems to hang in the air on the ring of windows at its foot. The model shows the building as first built, without minarets and with the atrium before it.",
    ),
    period: l("532 - 537", "532 - 537"),
    measures: [
      {
        value: 32.7,
        unit: "m",
        label: l("Kubbe çapı (32,7 - 33,5)", "Diameter of the dome (32.7 - 33.5)"),
        source: "en",
      },
      { value: 55.6, unit: "m", label: l("İç yükseklik", "Height inside"), source: "en" },
      { value: 82, unit: "m", label: l("Uzunluk", "Length"), source: "en" },
      { value: 73, unit: "m", label: l("Genişlik", "Width"), source: "en" },
    ],
    uncertainty: l(
      "Kubbe çapı (kaynakta 32,7 ile 33,5 m arası verilir; modelde 32,7 m), 55,6 m'lik iç yükseklik, uzunluk ve genişlik İngilizce Wikipedia'dan alınmıştır. Kubbenin basıklığı, tabanındaki pencere sayısı (40), duvar yükseklikleri, yarım kubbeler ve eksedralar, payandalar ve önündeki avlu (atrium) modelin oranıdır; atrium bugün yoktur. Yapı 537'deki ilk hâliyle, Osmanlı minareleri ve eklentileri olmadan gösterilir; ilk kubbe 558'de çökmüş, yerine daha yüksek bir kubbe yapılmıştır. İç süsleme (mozaikler, mermer kaplamalar) modelde yoktur.",
      "The diameter of the dome (given as between 32.7 and 33.5 m; 32.7 m in the model), the interior height of 55.6 m, the length and the width come from the English Wikipedia. How shallow the dome is, the number of windows at its foot (40), the heights of the walls, the half-domes and exedrae, the buttresses and the atrium before it are the model's proportion; the atrium no longer exists. The building is shown as first finished in 537, without the Ottoman minarets and additions; the first dome fell in 558 and was rebuilt higher. The interior decoration (mosaics, marble revetment) is not modelled.",
    ),
    hotspots: [
      spot(
        [0, ay.spring + 3, -18.5],
        "Ana kubbe",
        "The main dome",
        "Tabanındaki 40 pencere yüzünden kubbe havada asılıymış gibi görünür.",
        "The 40 windows at its foot make the dome seem to hang in the air.",
      ),
      spot(
        [0, ay.base - 6, -36.5],
        "Yarım kubbe",
        "The half-dome",
        "Ana kubbeyi batıdan ve doğudan destekleyen yarım kubbeler.",
        "The half-domes that buttress the main dome from west and east.",
      ),
      spot(
        [0, 6, ay.front - 1],
        "İmparator Kapısı",
        "The Imperial Door",
        "Narteksten naosa açılan en büyük kapı; yalnızca imparator geçerdi.",
        "The largest door from the narthex into the nave; only the emperor passed through it.",
      ),
      spot(
        [0, 2, ay.front - AYASOFYA.courtLength / 2 + 3.5],
        "Atrium",
        "The atrium",
        "Önündeki revaklı avlu ve ortasındaki çeşme; bugün yoktur.",
        "The colonnaded forecourt and its fountain; it no longer exists.",
      ),
    ],
    sources: [
      wiki("en", "Hagia_Sophia", "Wikipedia (İngilizce): Ayasofya", "Wikipedia: Hagia Sophia"),
    ],
    model: AYASOFYA,
  },

  /* ---------------- the Süleymaniye ---------------- */
  {
    id: "suleymaniye-camii",
    siteSlug: "suleymaniye",
    structure: l("Ana kubbe", "Main dome"),
    title: l("Süleymaniye Camii", "The Süleymaniye Mosque"),
    blurb: l(
      "Mimar Sinan'ın Kanuni Sultan Süleyman için yaptığı cami: yüksekliği çapının tam iki katı olan kubbe, önde ve arkada yarım kubbeler, avlunun köşelerinde dört minare ve on şerefe. Haliç'in üstündeki tepeden bütün şehre hâkimdir.",
      "The mosque Mimar Sinan built for Süleyman the Magnificent: a dome exactly twice as high as it is wide, half-domes before and behind, four minarets at the corners of the courtyard with ten balconies between them. From its hill over the Golden Horn it commands the whole city.",
    ),
    period: l("1550 - 1557", "1550 - 1557"),
    measures: [
      { value: 26.5, unit: "m", label: l("Kubbe çapı", "Diameter of the dome"), source: "en" },
      { value: 53, unit: "m", label: l("Kubbe yüksekliği", "Height of the dome"), source: "en" },
      {
        value: 58.5,
        unit: "m",
        label: l("Harim genişliği", "Width of the prayer hall"),
        source: "en",
      },
      {
        value: 57.5,
        unit: "m",
        label: l("Harim derinliği", "Depth of the prayer hall"),
        source: "en",
      },
      {
        value: 57,
        unit: "m",
        label: l("Avlu genişliği (yaklaşık)", "Width of the courtyard (about)"),
        source: "en",
      },
      {
        value: 47,
        unit: "m",
        label: l("Avlu derinliği (yaklaşık)", "Depth of the courtyard (about)"),
        source: "en",
      },
      { value: 4, unit: "count", label: l("Minare", "Minarets"), source: "en" },
      {
        value: 76,
        unit: "m",
        label: l(
          "Büyük minarelerin yüksekliği (külahla)",
          "Height of the tall minarets (with caps)",
        ),
        source: "en",
      },
      {
        value: 3,
        unit: "count",
        label: l("Büyük minarelerdeki şerefe", "Balconies on each tall minaret"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Kubbe çapı ve yüksekliği, harim ve avlunun ölçüleri, minare sayısı, büyük minarelerin yüksekliği ve şerefe sayıları İngilizce Wikipedia'dan alınmıştır. Duvar yükseklikleri, kubbe kasnağının pencereleri, payandalar, yan galerilerin küçük kubbeleri ve avlu revağı modelin oranıdır. Küçük minareler büyüklerin beşte dördü yüksekliğinde ve iki şerefeli çizilmiştir. Külliyenin medreseleri, darüşşifası ve türbeleri modelde yoktur.",
      "The diameter and height of the dome, the size of the prayer hall and the courtyard, the number of minarets, the height of the tall ones and their balconies come from the English Wikipedia. The heights of the walls, the windows of the drum, the buttresses, the small domes of the side galleries and the courtyard arcade are the model's proportion. The smaller minarets are drawn four-fifths the height of the tall ones, with two balconies. The colleges, hospital and tombs of the complex are not modelled.",
    ),
    hotspots: [
      spot(
        [0, su.spring + 2, -15],
        "Ana kubbe",
        "The main dome",
        "Kubbenin yüksekliği, çapının tam iki katıdır: 53 m.",
        "The dome is exactly twice as high as it is wide: 53 m.",
      ),
      spot(
        [0, 4, su.front - 1],
        "Taç kapı",
        "The portal",
        "Avludan harime açılan ana kapı.",
        "The main door from the courtyard into the prayer hall.",
      ),
      spot(
        [0, 2, su.front - SULEYMANIYE.courtLength / 2 + 6.5],
        "Şadırvan",
        "The fountain",
        "Avlunun ortasında abdest alınan şadırvan.",
        "The fountain for ablutions in the middle of the courtyard.",
      ),
      spot(
        [-SULEYMANIYE.courtWidth / 2 - 2.5, 50, su.courtFront - 4.2],
        "Minare",
        "A minaret",
        "Dört minarede toplam on şerefe vardır.",
        "The four minarets carry ten balconies between them.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "S%C3%BCleymaniye_Mosque",
        "Wikipedia (İngilizce): Süleymaniye Camii",
        "Wikipedia: Süleymaniye Mosque",
      ),
    ],
    model: SULEYMANIYE,
  },

  /* ---------------- the Selimiye ---------------- */
  {
    id: "selimiye-camii",
    siteSlug: "selimiye",
    structure: l("Ana kubbe", "Main dome"),
    title: l("Edirne Selimiye Camii", "The Selimiye Mosque at Edirne"),
    blurb: l(
      "Mimar Sinan'ın 'ustalık eserim' dediği cami: sekiz fil ayağının taşıdığı 31 metrelik tek kubbe ve harimin köşelerinde yükselen dört ince minare. Edirne'nin her yerinden görünür.",
      "The mosque Mimar Sinan called his masterpiece: a single 31-metre dome on eight great piers, and four slender minarets rising at the corners of the prayer hall. It is seen from everywhere in Edirne.",
    ),
    period: l("1568 - 1574", "1568 - 1574"),
    measures: [
      { value: 31.28, unit: "m", label: l("Kubbe çapı", "Diameter of the dome"), source: "en" },
      {
        value: 42,
        unit: "m",
        label: l("Kubbe yüksekliği (yaklaşık, tartışmalı)", "Height of the dome (about; disputed)"),
        source: "en",
      },
      {
        value: 60,
        unit: "m",
        label: l("Harim genişliği (yaklaşık)", "Width of the prayer hall (about)"),
        source: "en",
      },
      {
        value: 44,
        unit: "m",
        label: l("Harim derinliği (yaklaşık)", "Depth of the prayer hall (about)"),
        source: "en",
      },
      { value: 4, unit: "count", label: l("Minare", "Minarets"), source: "en" },
      {
        value: 70.89,
        unit: "m",
        label: l("Minare yüksekliği", "Height of the minarets"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Kubbe çapı, yaklaşık ve tartışmalı kubbe yüksekliği (42 m), harimin ve avlunun yaklaşık ölçüleri (60 × 44 m), dört minare ve yükseklikleri İngilizce Wikipedia'dan alınmıştır; kubbenin sekiz ayak üstünde durduğu da oradan alınmıştır. Duvar yükseklikleri, köşe yarım kubbeleri, ayakların üstündeki kuleler, kasnak pencereleri ve avlu revağı modelin oranıdır. Minarelerin şerefe sayısı (üç) kaynaktan değil, fotoğraflardan verilmiştir. İç süsleme ve arasta modelde yoktur.",
      "The diameter of the dome, its approximate and disputed height (42 m), the approximate size of the prayer hall and courtyard (60 × 44 m), the four minarets and their height come from the English Wikipedia, as does the dome's standing on eight piers. The heights of the walls, the corner half-domes, the turrets over the piers, the windows of the drum and the courtyard arcade are the model's proportion. The number of balconies on the minarets (three) is from photographs, not the source. The interior decoration and the arasta are not modelled.",
    ),
    hotspots: [
      spot(
        [0, se.spring + 3, -15],
        "Ana kubbe",
        "The main dome",
        "Sekiz fil ayağı üstünde 31,28 m çapında tek kubbe.",
        "A single dome 31.28 m across on eight great piers.",
      ),
      spot(
        [-SELIMIYE.hallWidth / 2 - 2.5, 45, se.front - 4.6],
        "Minare",
        "A minaret",
        "Harimin köşelerinde dört minare; her biri 70,89 m.",
        "Four minarets at the corners of the prayer hall, each 70.89 m.",
      ),
      spot(
        [0, 2, se.front - SELIMIYE.courtLength / 2 + 6.5],
        "Şadırvan",
        "The fountain",
        "Avlunun ortasındaki şadırvan.",
        "The fountain in the middle of the courtyard.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "Selimiye_Mosque,_Edirne",
        "Wikipedia (İngilizce): Selimiye Camii (Edirne)",
        "Wikipedia: Selimiye Mosque, Edirne",
      ),
    ],
    model: SELIMIYE,
  },
];
