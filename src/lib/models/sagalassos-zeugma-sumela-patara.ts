import type { Localized } from "@/lib/i18n";
import type { Hotspot, Reconstruction, Source } from "@/lib/reconstructions";

/**
 * The records for four reconstructions added in October 2026 — the Antonine
 * Nymphaeum at Sagalassos, a villa at Zeugma, Sümela Monastery and the
 * lighthouse of Patara — kept beside their geometry in `src/lib/models/` and
 * listed in `reconstructions.ts` after the others. The rules are the same:
 * every number shown as a measurement is one the model is built from, and
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

const wiki = (key: string, host: string, slug: string, tr: string, en: string): Source => ({
  key,
  title: l(tr, en),
  url: `https://${host}.wikipedia.org/wiki/${slug}`,
});

export const SAGALASSOS_ZEUGMA_SUMELA_PATARA: Reconstruction[] = [
  {
    id: "sagalassos-antoninler-cesmesi",
    siteSlug: "sagalassos",
    structure: l("Antoninler Çeşmesi", "Antonine Nymphaeum"),
    title: l("Sagalassos, Antoninler Çeşmesi", "The Antonine Nymphaeum at Sagalassos"),
    blurb: l(
      "Yukarı Agora'nın kuzey kenarındaki anıtsal çeşme: önünde uzun bir havuz, arkasında sütunlu nişlerle bölünmüş bir duvar, ortada yarım kubbeli bir apsis ve nişlerde heykeller. Yıkıntıları bulunduğu yerde yeniden dikildi ve yaklaşık 1.700 yıl sonra yeniden su akıtıyor. Model, çeşmeyi suyu ve heykelleriyle, agoranın gündelik hayatı içinde gösterir.",
      "The monumental fountain on the north side of the Upper Agora: a long basin in front, a wall divided by columned niches behind it, a half-domed apse in the middle and statues in the niches. Its fallen blocks were set up again where they lay, and after some 1,700 years it runs with water once more. The model shows it with its water and its statues, in the everyday life of the square.",
    ),
    period: l("MS 160 - 180", "AD 160 - 180"),
    measures: [
      {
        value: 28,
        unit: "m",
        label: l("Çeşme cephesinin uzunluğu", "Length of the fountain front"),
        source: "en",
      },
      {
        value: 9,
        unit: "m",
        label: l("Cephenin yüksekliği", "Height of the front"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Cephenin uzunluğu ve yüksekliği İngilizce Wikipedia'dan alınmıştır. Cephenin nasıl bölündüğü — dört yan aedicula ile ortadaki apsis, sütunların kalınlığı ve boyu, kaidelerin yüksekliği, havuzun derinliği — yeniden dikilmiş yapının fotoğraflarından ve Roma çeşmelerinin bilinen oranlarından modellenmiştir; sütunların renkli taşı da bir tahmindir. Ortadaki nişte, çeşmenin heykel grubundan Dionysos durur; yan nişlerdeki heykellerin kimliği modelde bilinmiyor gibi ele alınmış, yerlerine başka antik heykellerin taramaları konmuştur — hiçbiri buradaki heykellerin kendisi değildir. Su akmaz, durgun gösterilir; agoranın döşemesi, onur sütunları ve tezgâhlar sahnenin bir parçasıdır, ölçülmemiştir.",
      "The length and height of the front are from the English Wikipedia. How the front divides — four side aediculae and the apse between them, the girth and height of the columns, the height of their pedestals, the depth of the basin — is modelled from photographs of the re-erected fountain and the known proportions of Roman fountain houses, and the coloured stone of the shafts is a guess. Dionysos, of the fountain's statue group, stands in the middle niche; who stood in the side niches is treated as unknown, and they hold scans of other ancient statues — none of them is a statue from here. The water stands still rather than flowing; the paving of the agora, the honorific columns and the stalls are scenery, not measurement.",
    ),
    hotspots: [
      spot(
        [0, 0.8, -2],
        "Havuz",
        "The basin",
        "Çeşmenin önündeki uzun havuz; kentliler testilerini korkuluğun üstünden doldururdu.",
        "The long basin before the fountain; people filled their jars over the parapet.",
      ),
      spot(
        [0, 4.5, 1.2],
        "Apsis ve Dionysos",
        "The apse and Dionysos",
        "Ortadaki yarım kubbeli niş; suyun tanrısı değil, şarabın ve şenliğin tanrısı Dionysos burada dururdu.",
        "The half-domed niche in the middle, where Dionysos stood — the god of wine and feasting, not of water.",
      ),
      spot(
        [6.1, 5.5, -0.9],
        "Aedicula",
        "An aedicula",
        "İki sütunun taşıdığı alınlıklı çerçeve: içindeki nişte bir heykel dururdu.",
        "A pedimented frame carried on two columns, with a statue in the niche inside it.",
      ),
      spot(
        [-8.75, 1.0, -0.6],
        "Su ağızları",
        "The spouts",
        "Su, kaidenin önündeki ağızlardan havuza dökülürdü; bugün yeniden dökülüyor.",
        "Water poured into the basin from spouts in the podium, and does so again today.",
      ),
      spot(
        [-10, 0.9, -3.6],
        "Korkuluk",
        "The parapet",
        "Havuzu agoradan ayıran alçak mermer duvar, dışı çerçeveli panolarla bezeli.",
        "The low marble wall between the basin and the square, its outer face set with framed panels.",
      ),
      spot(
        [19, 6, -9.8],
        "Onur sütunu",
        "An honorific column",
        "Agoranın köşelerinde, tepelerinde heykellerle yüksek sütunlar yükselirdi.",
        "Tall columns with statues on top stood at the corners of the agora.",
      ),
    ],
    sources: [
      wiki("en", "en", "Sagalassos", "Wikipedia (İngilizce): Sagalassos", "Wikipedia: Sagalassos"),
    ],
    model: {
      kind: "nymphaeum",
      facadeLength: 28,
      facadeHeight: 9,
      aediculae: 4,
      basinDepth: 3.4,
      podiumHeight: 1.7,
      columnDiameter: 0.56,
      columnHeight: 4.9,
      apseWidth: 4.6,
    },
  },
  {
    id: "zeugma-villa",
    siteSlug: "zeugma",
    structure: l("Roma evleri", "Roman houses"),
    title: l("Zeugma'da peristilli bir villa", "A peristyle villa at Zeugma"),
    blurb: l(
      "Fırat'ın üstündeki teraslara kurulmuş zengin bir Roma evi: sütunlu avlusu ve havuzu, avlunun başındaki kabul salonu, çevresindeki odalar ve her odada başka bir mozaik. Zeugma'nın Poseidon ve Dionysos evleri gibi, Birecik Barajı suları basmadan önce kazılan villaların tipidir; tek birinin kopyası değildir. Model, evi 252-253'teki Sasani yağmasından önceki bir akşamda gösterir.",
      "A rich Roman house on the terraces above the Euphrates: its colonnaded court and pool, the reception room at the head of the court, the rooms round it and a different mosaic in each. It is the type of the villas excavated before the Birecik dam flooded them — the Houses of Poseidon and of Dionysos — not a copy of any one. The model shows it on an evening before the Sasanian sack of 252-253.",
    ),
    period: l("MS 2. yüzyıl - 253", "2nd century AD - 253"),
    measures: [
      {
        value: 80000,
        unit: "people",
        label: l("Kentin en kalabalık dönemindeki nüfusu", "The city's population at its height"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Bu modelde ölçülmüş bir sayı yoktur: kaynak kentin nüfusunu verir, tek bir evin boyutlarını değil. Avlunun ölçüsü, sütun sayısı, odaların derinliği, terasın yüksekliği ve havuz Roma peristilli evlerinin bilinen oranlarından modellenmiştir; odaların çatıları zemindeki mozaikler görünsün diye gösterilmemiştir. Mozaikler bu uygulamanın kendi çizimleridir — Roma döşemelerinin kullandığı çerçeve, meander, eşkenar dörtgen ve rozet desenleriyle — Zeugma'dan çıkan hiçbir mozaiğin, Çingene Kızı'nın da, kopyası değildir. Duvar resimleri de aynı şekilde genel Roma üslubundadır. Avludaki Poseidon heykeli, tipteki başka bir antik heykelin taramasıdır.",
      "Nothing in this model is measured: the source gives the city's population, not the size of any one house. The court, the number of its columns, the depth of the rooms, the height of the terrace and the pool are modelled from the known proportions of Roman peristyle houses, and the roofs of the rooms are left off so that their floors can be seen. The mosaics are this app's own drawings — in the frames, meanders, lozenges and rosettes Roman floors used — and copy no mosaic found at Zeugma, the Gypsy Girl included. The wall paintings are likewise in the general Roman manner. The Poseidon in the court is a scan of another ancient statue of the type.",
    ),
    hotspots: [
      spot(
        [0, 3.6, 0],
        "Peristil avlu ve havuz",
        "The peristyle court and pool",
        "Evin ortası: sütunlarla çevrili avlu, yağmur suyunu ve ışığı toplar; ortasında havuz.",
        "The heart of the house: the colonnaded court that gathered rain and light, with the pool in the middle.",
      ),
      spot(
        [0, 3.1, 11.5],
        "Kabul salonu mozaiği",
        "The reception room mosaic",
        "Yemek sedirlerinin çevrelediği salonun ortasında, girişten bakınca görülen resimli pano.",
        "The picture panel in the middle of the dining room, framed by the couches and seen from the door.",
      ),
      spot(
        [0, 3.1, -6.5],
        "Revaktaki meander",
        "The meander in the portico",
        "Avluyu çeviren yürüme yollarının zemininde bitmeyen bir meander uzanır.",
        "An endless meander runs along the floor of the walks round the court.",
      ),
      spot(
        [0, 5.2, 14.8],
        "Boyalı duvarlar",
        "The painted walls",
        "Duvarlar sıva üstüne boyanırdı: koyu bir süpürgelik, çerçeveli kırmızı panolar, üstte bir friz.",
        "The walls were painted on plaster: a dark dado, red panels in frames, a frieze above.",
      ),
      spot(
        [0, 1.5, -19.6],
        "Fırat'a bakan teras",
        "The terrace over the Euphrates",
        "Villalar yamaçtaki teraslara kurulmuştu; kentin adı, buradaki kayıklardan köprüden gelir.",
        "The villas stood on terraces on the slope; the city was named for the bridge of boats here.",
      ),
      spot(
        [0, 4.8, 1.9],
        "Poseidon",
        "Poseidon",
        "Havuzun başında denizlerin tanrısı; evlerden birine adını veren mozaik de onu gösterir.",
        "The god of the sea at the head of the pool; the mosaic that named one of the houses shows him too.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Zeugma,_Commagene",
        "Wikipedia (İngilizce): Zeugma, Commagene",
        "Wikipedia: Zeugma, Commagene",
      ),
    ],
    model: {
      kind: "terrace-villa",
      courtWidth: 12,
      courtDepth: 10,
      courtColumns: 5,
      porticoWidth: 3,
      wallHeight: 4.4,
      roomDepth: 6,
      terraceHeight: 3,
      poolWidth: 4.6,
    },
  },
  {
    id: "sumela-manastiri",
    siteSlug: "sumela",
    structure: l("Kaya Kilisesi", "Rock Church"),
    title: l("Sümela Manastırı", "Sümela Monastery"),
    blurb: l(
      "Altındere Vadisi'nin üstünde, dik bir kayalığa yaslanmış manastır: bir mağaradan dönüştürülmüş, dış duvarı baştan sona boyalı kaya kilisesi, şapeller ve kutsal kaynak, kayanın kenarına dizilmiş balkonlu çok katlı odalar, kayalık boyunca su getiren kemerli su yolu ve vadiden tırmanan uzun merdiven. Model, manastırı 1923'te boşaltılmadan önce, 19. yüzyıldaki hâliyle gösterir.",
      "The monastery pressed against a cliff above the Altındere valley: a cave turned into a church with its outer wall painted all over, chapels and a holy spring, a range of rooms storeys high with balconies along the cliff edge, an arched aqueduct bringing water along the rock and the long stair climbing up from the valley. The model shows it as it stood in the nineteenth century, before it was emptied in 1923.",
    ),
    period: l("4. yüzyıl - 1923 (model: 19. yüzyıl)", "4th century - 1923 (model: 19th century)"),
    measures: [
      {
        value: 1200,
        unit: "m",
        label: l("Manastırın denizden yüksekliği", "Height of the monastery above the sea"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Denizden yükseklik İngilizce Wikipedia'dan alınmıştır; model onu yalnızca çevredeki ormanın karışımında kullanır. Yapıların ölçüleri ölçülmüş değildir: mağaranın genişliği, avlunun düzeyi, odalar dizisinin uzunluğu ve kat yükseklikleri, su kemerinin kemer sayısı fotoğraflardan ve manastırın bilinen planından modellenmiştir; kat sayısı da fotoğraflardan sayılmıştır. Manastır gerçekte vadi tabanından yaklaşık 300 m yüksekte durur; modelde bu düşüş, yapı ve altındaki uçurum aynı görüntüye sığsın diye yaklaşık 80 m'ye kısaltılmıştır. Basamaklı kaya yüzleri, raflarındaki ağaçlar, alt yapı duvarlarının ve payandaların yüksekliği, yamaçtaki patikanın gidişi, vadideki dere ve sis temsilîdir. Kaya kilisesinin ve şapelin dış duvarlarındaki resimler bu uygulamanın kendi çizimleridir — geç Bizans resminin yolunda, ayakta duran haleli azizler — Sümela'daki hiçbir freskin kopyası değildir; asıl duvarlarda farklı dönemlerden üç kat resim vardır.",
      "The height above the sea is from the English Wikipedia; the model uses it only for the mix of the forest round it. The buildings are not measured: the width of the cave, the level of the court, the length of the range and the height of its storeys, and the number of arches of the aqueduct are modelled from photographs and the known plan of the monastery, and the storeys are counted from photographs. The monastery really stands about 300 m above the floor of the valley; in the model the drop is shortened to about 80 m, so that the building and the cliff under it fit one view. The stepped rock faces and the trees on their ledges, the height of the substructure walls and buttresses, the line of the path along the slope, the stream in the valley and the mist are representative. The paintings on the outer walls of the rock church and the chapel are this app's own drawings — standing, haloed saints after the manner of late Byzantine painting — and copy no fresco at Sümela; the real walls carry three layers of painting from different centuries.",
    ),
    hotspots: [
      spot(
        [-10, 13, 8.5],
        "Kaya Kilisesi",
        "The Rock Church",
        "Mağaraya kurulmuş kilise; dış duvarı da resimlidir, içeri sığmayanlar ayini dışarıdan izlesin diye.",
        "The church built into the cave; its outer wall is painted too, so that those who could not fit in could follow the service outside.",
      ),
      spot(
        [9, 18.6, -8.6],
        "Balkonlu odalar",
        "The range with its balconies",
        "Kayanın kenarına dizilmiş çok katlı yapı: keşişlerin hücreleri, misafirhane ve kütüphane.",
        "The range of storeys along the cliff edge: the monks' cells, the guesthouse and the library.",
      ),
      spot(
        [-48, 17, 2.2],
        "Su kemeri",
        "The aqueduct",
        "Kayalık boyunca uzanan kemerli su yolu, manastıra dağdan su getirirdi.",
        "The arched channel along the cliff that brought water to the monastery from the mountain.",
      ),
      spot(
        [-28, 12, -4],
        "Merdiven ve kapı",
        "The stair and the gate",
        "Patika batıdan, yamaca oyularak gelir; uzun merdiven onu kapıya çıkarır, kapıdan da avluya inilir.",
        "The path comes in from the west, cut along the mountainside; the long stair climbs from it to the gate, and from the gate steps lead down into the court.",
      ),
      spot(
        [-19.4, 12.5, 5],
        "Şapel",
        "A chapel",
        "Avlunun batı ucundaki küçük şapel; onun da dış duvarı resimlidir.",
        "The small chapel at the west end of the court, its outer wall painted as well.",
      ),
      spot(
        [0.5, 9.8, 11.2],
        "Kutsal kaynak",
        "The holy spring",
        "Mağaranın dibinden sızan su; hacılar şifa için buradan su alırdı.",
        "Water seeping from the back of the cave, which pilgrims took away for healing.",
      ),
      spot(
        [6, -6, -8.6],
        "Kayaya oturan duvarlar",
        "The walls on the rock",
        "Odalar dizisinin ve avlunun duvarları kayanın kenarında bitmez: yüksek alt yapı duvarları ve payandalarla aşağıdaki kayaya kadar iner; altında uçurum vadiye düşer.",
        "The walls of the range and the court do not stop at the edge of the ledge: they go on down as tall substructure walls and buttresses to the rock below, and under them the cliff drops to the valley.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Sümela_Monastery",
        "Wikipedia (İngilizce): Sümela Monastery",
        "Wikipedia: Sümela Monastery",
      ),
    ],
    model: {
      kind: "cliff-monastery",
      altitude: 1200,
      storeys: 5,
      storeyHeight: 3.2,
      rangeLength: 30,
      courtLevel: 9,
      caveWidth: 22,
      caveHeight: 16,
      aqueductArches: 5,
    },
  },
  {
    id: "patara-deniz-feneri",
    siteSlug: "patara",
    structure: l("Deniz Feneri", "Lighthouse"),
    title: l("Patara Deniz Feneri", "The Lighthouse of Patara"),
    blurb: l(
      "Likya'nın en büyük limanının girişinde, mendireğin ucunda yükselen fener: kare bir kaide üstünde silindirik bir kule, tepesinde ateşin yandığı fener odası. İmparator Nero döneminde dikildi; ayakta kalabilmiş en eski fenerlerden biridir. Kumların altında bulunan blokları yeniden yerine kondu. Model, feneri limanın gündelik işleri arasında, akşam ateşi yakılırken gösterir.",
      "The lighthouse at the end of the mole at the mouth of Lycia's greatest harbour: a cylindrical tower on a square base, the fire burning in the lantern on its top. It was raised under the emperor Nero and is among the oldest lighthouses to survive; its blocks, found under the sand, were set back in place. The model shows it among the harbour's daily work, as the evening fire is lit.",
    ),
    period: l("MS 64 - 65", "AD 64 - 65"),
    measures: [],
    uncertainty: l(
      "Bu modelde gösterilen hiçbir boyut ölçülmüş olarak sunulmaz: kaidenin genişliği ve yüksekliği, kulenin çapı ve boyu, mendireğin uzunluğu bu yapının fotoğraflarından ve Roma fenerlerinin bilinen biçiminden modellenmiştir. Kaidenin denize bakan yüzündeki adak yazısı bronz harflerle yazılmıştı; harfler kayıptır, yalnızca çivi delikleri kalmıştır. Metni burada doğrulanmış bir kaynaktan okuyamadığımız için yazı çizilmemiş, pano boş bırakılmıştır. Fener odasının biçimi, ambar, gemi ve limandaki yaşam sahnenin parçasıdır.",
      "No dimension in this model is presented as measured: the width and height of the base, the girth and height of the tower and the length of the mole are modelled from photographs of the building and the known form of Roman lighthouses. The dedication on the seaward face of the base was set in bronze letters; the letters are lost and only their dowel holes remain. Since the text could not be read here from a checked source, it is not drawn, and the panel is left empty. The form of the lantern, the warehouse, the ship and the life of the harbour are scenery.",
    ),
    hotspots: [
      spot(
        [-3, 11, 0],
        "Kule",
        "The tower",
        "Kare kaidenin üstünde, üç bölümde daralarak yükselen taş kule; içinde fener odasına çıkan merdiven.",
        "The stone tower rising in three narrowing stages from the square base, a stair inside it to the lantern.",
      ),
      spot(
        [0, 21.5, 0],
        "Fener odası",
        "The lantern",
        "Tepedeki ocakta yakılan ateş, geceleri gemilere limanın ağzını gösterirdi.",
        "The fire on the hearth at the top showed ships the harbour mouth by night.",
      ),
      spot(
        [-3.9, 2.1, 0],
        "Yazıt panosu",
        "The inscription panel",
        "Denize bakan yüzde, fenerin Nero adına dikildiğini söyleyen bronz harfli yazı vardı.",
        "On the seaward face, a text in bronze letters said the lighthouse was raised in Nero's name.",
      ),
      spot(
        [4.4, 3.6, -0.5],
        "Kapı ve merdiven",
        "The door and the stair",
        "Kaidenin kara tarafındaki merdivenden kulenin kapısına çıkılır.",
        "A stair against the landward side of the base climbs to the tower door.",
      ),
      spot(
        [17, 0.4, 0],
        "Mendirek",
        "The mole",
        "Limanı denizden koruyan taş set; gemiler iç yanına yanaşırdı.",
        "The stone mole that sheltered the harbour from the sea; ships moored along its inner side.",
      ),
      spot(
        [39, 2.2, -0.6],
        "Ambar",
        "The warehouse",
        "Gemilerden indirilen yük, rıhtımın kara ucundaki ambarlara taşınırdı.",
        "Cargo taken off the ships was carried to storehouses at the landward end of the quay.",
      ),
    ],
    sources: [],
    model: {
      kind: "lighthouse",
      baseSide: 7.6,
      baseHeight: 3.2,
      towerDiameter: 5.6,
      towerHeight: 16,
      moleLength: 50,
      moleWidth: 10,
    },
  },
];
