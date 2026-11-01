import type { Localized } from "@/lib/i18n";
import type { Hotspot, Reconstruction, Source } from "@/lib/reconstructions";
import { tombsLayout, type RockTombsSpec } from "@/lib/models/kaunos-kaya-mezarlari";

/**
 * Six more, built with the kinds already made: the temples of Artemis at
 * Magnesia, Athena at Assos and Leto at the Letoon, the rock tombs of Myra,
 * the enclosure of Karahan Tepe and the Sphinx Gate of Alacahöyük. Where the
 * sources that could be opened give no dimensions the record shows none, and
 * its source is marked `context`.
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

const MYRA: RockTombsSpec = {
  kind: "rock-tombs",
  tombs: 9,
  columnsPerTomb: 2,
  cliffHeight: 45,
  facadeWidth: 6,
  facadeHeight: 7.5,
  bankDistance: 26,
  riverWidth: 18,
  river: false,
  style: "lycian",
};
const myra = tombsLayout(MYRA);

export const EGE_ANADOLU: Reconstruction[] = [
  /* ---------------- Magnesia: the Temple of Artemis Leukophryene ---------------- */
  {
    id: "magnesia-artemis-tapinagi",
    siteSlug: "magnesia",
    structure: l("Artemis Leukophryene Tapınağı", "Temple of Artemis Leukophryene"),
    title: l(
      "Magnesia Artemis Leukophryene Tapınağı",
      "The Temple of Artemis Leukophryene at Magnesia",
    ),
    blurb: l(
      "Vitruvius'un övdüğü mimar Hermogenes'in İon tapınağı: sütun halkasıyla cella arasında geniş bir geçit bırakan pseudodipteros planın örneği. Strabon onu, büyüklükte Efes'tekinden geri ama uyumda ondan üstün bulur.",
      "The Ionic temple of Hermogenes, the architect Vitruvius praised: the model of the pseudodipteral plan, a wide walk left between the colonnade and the cella. Strabo found it smaller than the temple at Ephesus but finer in its harmony.",
    ),
    period: l("MÖ 3. - 2. yüzyıl", "3rd - 2nd century BC"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Magnesia maddesi) yalnızca mimarın Hermogenes olduğunu, tapınağın İon düzeninde yapıldığını ve Strabon'un karşılaştırmasını verir; ölçü vermez. Bu yüzden modelde ölçü gösterilmez: sekize on beş sütunlu pseudodipteros plan, stylobat (41 × 67 m), sütun yüksekliği (12 m), krepis, cella ve saçaklık Hermogenes'in yayımlanmış planlarına göre verilmiştir. Amazon frizi tek tek modellenmemiştir.",
      "The source that could be opened (the English Wikipedia's article on Magnesia) gives only that the architect was Hermogenes, that the temple was Ionic, and Strabo's comparison; it gives no dimensions. So the model shows none: the pseudodipteral plan of eight by fifteen columns, the stylobate (41 × 67 m), the height of the columns (12 m), the crepis, the cella and the entablature follow published plans of Hermogenes' temple. The Amazon frieze is not modelled figure by figure.",
    ),
    hotspots: [
      spot(
        [-19, 7, -33.4],
        "Köşe sütunu",
        "The corner column",
        "Sekize on beş sütun; ikinci halkanın yeri boş bırakılmıştır.",
        "Eight by fifteen columns; the place of a second ring is left empty.",
      ),
      spot(
        [12, 5, 0],
        "Pseudodipteros geçidi",
        "The pseudodipteral walk",
        "Hermogenes'in buluşu: sütunlarla cella arasında iki sıra genişliğinde geçit.",
        "Hermogenes' invention: a walk two rows wide between the columns and the cella.",
      ),
      spot(
        [0, 9, -1],
        "Cella",
        "The cella",
        "Artemis Leukophryene'nin kült heykelinin durduğu oda.",
        "The room of the cult statue of Artemis Leukophryene.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "Magnesia_on_the_Maeander",
        "Wikipedia (İngilizce): Menderes Magnesiası",
        "Wikipedia: Magnesia on the Maeander",
        true,
      ),
    ],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 41,
      stylobateLength: 67,
      crepidomaWidth: 44,
      crepidomaLength: 70,
      crepidomaSteps: 3,
      columnHeight: 12,
      outerColumnsShort: 8,
      outerColumnsLong: 15,
      pronaosRows: 2,
      pronaosPerRow: 2,
      totalColumns: 46,
      sekosWallHeight: 12.5,
      naiskosWidth: 6,
      naiskosLength: 8,
      interior: "cella",
      cultStatue: "artemis",
      rings: 1,
      courtWidth: 14,
      courtLength: 30,
      columnDiameter: 1.3,
      entablatureHeight: 2.6,
      dedication: "none",
    },
  },

  /* ---------------- Assos: the Temple of Athena ---------------- */
  {
    id: "assos-athena-tapinagi",
    siteSlug: "assos",
    structure: l("Athena Tapınağı", "Temple of Athena"),
    title: l("Assos Athena Tapınağı", "The Temple of Athena at Assos"),
    blurb: l(
      "Küçük Asya'nın tek Dor düzenindeki arkaik tapınağı: Assos akropolünün tepesinde, Midilli'ye ve denize bakan otuz sekiz sütunlu yapı. Arşitravında Herakles'in ziyafetini gösteren kabartma bugün Louvre'dadır.",
      "The only Doric temple of the archaic age in Asia Minor: a building of thirty-eight columns on the summit of the acropolis of Assos, looking over the sea to Lesbos. A relief of Herakles at a banquet from its architrave is in the Louvre.",
    ),
    period: l("MÖ 530", "530 BC"),
    measures: [{ value: 38, unit: "count", label: l("Sütun", "Columns"), source: "en" }],
    uncertainty: l(
      "Tapınağın Dor düzeninde olduğu, otuz sekiz sütunu, tarihi (MÖ 530) ve akropolün 238 m yüksekliği İngilizce Wikipedia'dan alınmıştır. Altıya on üç sütunlu plan (çevresinde otuz dört, pronaos ve opisthodomosta ikişer), stylobatın ölçüleri (14 × 30 m), sütun yüksekliği (4,8 m), saçaklık ve çatı yayımlanmış rekonstrüksiyonlara göre verilmiştir; opisthodomosun iki sütunu modelde pronaosun ikinci sırası olarak durur. Dor sütunları yivli düz sütunlar, başlıkları basit yastıklar olarak çizilmiştir. Arşitrav kabartmaları ve triglif-metop frizi modelde yoktur. Tapınak, tepenin kendi koyu gri andezitiyle çizilmiş, akropol çevreye göre yükseltilmiştir; arazinin biçimi temsilîdir.",
      "That the temple was Doric, its thirty-eight columns, its date (530 BC) and the 238 m height of the acropolis come from the English Wikipedia. The plan of six by thirteen columns (thirty-four round it, two each in the pronaos and opisthodomos), the stylobate (14 × 30 m), the height of the columns (4.8 m), the entablature and the roof follow published reconstructions; the two columns of the opisthodomos stand in the model as a second row of the pronaos. The Doric columns are drawn as fluted shafts with plain cushion capitals. The architrave reliefs and the triglyph frieze are not modelled. The temple is drawn in the dark grey andesite of its own hill, the acropolis raised over the land round it; the form of the ground is representative.",
    ),
    hotspots: [
      spot(
        [-5.5, 3, -14.4],
        "Dor sütunları",
        "The Doric columns",
        "Küçük Asya'da Dor düzeninde yapılmış tek arkaik tapınak.",
        "The only archaic temple in Asia Minor built in the Doric order.",
      ),
      spot(
        [0, 3.5, -1],
        "Cella",
        "The cella",
        "Athena'nın kült heykelinin durduğu oda.",
        "The room of Athena's cult statue.",
      ),
    ],
    sources: [wiki("en", "Assos", "Wikipedia (İngilizce): Assos", "Wikipedia: Assos")],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 14,
      stylobateLength: 30,
      crepidomaWidth: 15.6,
      crepidomaLength: 31.6,
      crepidomaSteps: 2,
      columnHeight: 4.8,
      outerColumnsShort: 6,
      outerColumnsLong: 13,
      pronaosRows: 2,
      pronaosPerRow: 2,
      totalColumns: 38,
      sekosWallHeight: 5.5,
      naiskosWidth: 6,
      naiskosLength: 8,
      interior: "cella",
      cultStatue: "athena",
      order: "doric",
      stone: "andesite",
      hill: { drop: 160, edge: 36, run: 260 },
      rings: 1,
      courtWidth: 5.2,
      courtLength: 9,
      columnDiameter: 0.85,
      entablatureHeight: 1.5,
      dedication: "none",
    },
  },

  /* ---------------- the Letoon: the Temple of Leto ---------------- */
  {
    id: "letoon-leto-tapinagi",
    siteSlug: "letoon",
    structure: l("Leto Tapınağı", "Temple of Leto"),
    title: l("Letoon Leto Tapınağı", "The Temple of Leto at the Letoon"),
    blurb: l(
      "Likya'nın ortak kutsal alanında, Apollon ve Artemis'in annesi Leto'ya adanmış İon tapınağı. 2000-2007 arasında kendi taşlarıyla yeniden ayağa kaldırıldı; yanında Artemis ve Apollon'un tapınakları durur.",
      "The Ionic temple of Leto, mother of Apollo and Artemis, in the common sanctuary of the Lycians. It was raised again from its own stones in 2000-2007; the temples of Artemis and Apollo stand beside it.",
    ),
    period: l("MÖ 4. - 2. yüzyıl", "4th - 2nd century BC"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Letoon maddesi) kutsal alanın üç tapınaktan oluştuğunu ve Leto tapınağının 2000-2007 arasında yeniden kurulduğunu söyler; ölçü vermez. Bu yüzden modelde ölçü gösterilmez: altıya on bir sütunlu İon peripteros planı, stylobat (15,8 × 30,3 m), sütun yüksekliği (8 m), cella ve saçaklık yeniden kurulmuş yapının fotoğraflarına göre verilmiştir. Komşu Artemis ve Apollon tapınakları, nymphaeum ve tiyatro modelde yoktur.",
      "The source that could be opened (the English Wikipedia's article on the Letoon) says the sanctuary had three temples and that the temple of Leto was raised again in 2000-2007; it gives no dimensions. So the model shows none: the Ionic peripteral plan of six by eleven columns, the stylobate (15.8 × 30.3 m), the height of the columns (8 m), the cella and the entablature follow photographs of the rebuilt temple. The neighbouring temples of Artemis and Apollo, the nymphaeum and the theatre are not modelled.",
    ),
    hotspots: [
      spot(
        [-6.4, 4.5, -14.7],
        "İon sütunları",
        "The Ionic columns",
        "Yeniden kurulan tapınağın sütunları kendi taşlarındandır.",
        "The columns of the rebuilt temple are its own stones.",
      ),
      spot(
        [0, 6, -1],
        "Cella",
        "The cella",
        "Leto'nun kült heykelinin durduğu oda.",
        "The room of Leto's cult statue.",
      ),
    ],
    sources: [wiki("en", "Letoon", "Wikipedia (İngilizce): Letoon", "Wikipedia: Letoon", true)],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 15.8,
      stylobateLength: 30.3,
      crepidomaWidth: 17.8,
      crepidomaLength: 32.3,
      crepidomaSteps: 3,
      columnHeight: 8,
      outerColumnsShort: 6,
      outerColumnsLong: 11,
      pronaosRows: 1,
      pronaosPerRow: 2,
      totalColumns: 32,
      sekosWallHeight: 8.5,
      naiskosWidth: 6,
      naiskosLength: 8,
      interior: "cella",
      cultStatue: "artemis",
      rings: 1,
      courtWidth: 6.5,
      courtLength: 11,
      columnDiameter: 0.85,
      entablatureHeight: 1.7,
      dedication: "none",
    },
  },

  /* ---------------- Myra: the rock tombs ---------------- */
  {
    id: "myra-kaya-mezarlari",
    siteSlug: "myra",
    structure: l("Kaya mezarları", "Rock-cut tombs"),
    title: l("Myra Kaya Mezarları", "The Rock Tombs of Myra"),
    blurb: l(
      "Myra'nın deniz nekropolü: tiyatronun hemen kuzeybatısındaki kayalığa üst üste oyulmuş Likya mezarları; çoğu ahşap bir evin cephesini, bazıları bir tapınağın önünü taklit eder. Charles Fellows 1840'ta onları hâlâ kırmızı, sarı ve maviye boyalı görmüştü.",
      "The sea necropolis of Myra: Lycian tombs cut one above another in the cliff just north-west of the theatre, most of them copying the front of a timber house, some the front of a temple. Charles Fellows saw them in 1840 still painted red, yellow and blue.",
    ),
    period: l("MÖ 4. yüzyıl", "4th century BC"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Myra maddesi) iki nekropolü, mezarların kayalığa tapınak cephesi gibi oyulduğunu, deniz nekropolünün tiyatronun kuzeybatısında olduğunu ve Fellows'un gördüğü boyaları anlatır; mezar sayısı ya da ölçü vermez. Bu yüzden modelde ölçü gösterilmez: dokuz mezar, ölçüleri, kayalıktaki yerleri, ev ve tapınak tipinin karışımı ve kayalığın yüksekliği modelin oranıdır; mezarlar boyasız çizilmiştir. Önündeki ova genel görünümü gösterir; tiyatro ve öteki nekropol modelde yoktur.",
      "The source that could be opened (the English Wikipedia's article on Myra) describes the two necropoleis, the tombs cut into the cliff as temple fronts, the sea necropolis north-west of the theatre and the paint Fellows saw; it gives no count of the tombs and no dimensions. So the model shows none: the nine tombs, their size, their places on the cliff, the mixture of house and temple fronts and the height of the cliff are the model's proportion; the tombs are drawn unpainted. The plain before them shows the general setting; the theatre and the other necropolis are not modelled.",
    ),
    hotspots: [
      spot(
        [myra.tombs[4]!.x, myra.tombs[4]!.y + 6.2, -1.1],
        "Ev tipi mezar",
        "A house tomb",
        "Ahşap bir evin kirişleri ve dam kütükleri taşa oyulmuştur.",
        "The beams and roof logs of a timber house, cut in the stone.",
      ),
      spot(
        [myra.tombs[1]!.x, myra.tombs[1]!.y + 5.5, -1.1],
        "Tapınak cepheli mezar",
        "A temple-front tomb",
        "İki sütunlu ve alınlıklı bir tapınak cephesi.",
        "A temple front with two columns and a pediment.",
      ),
    ],
    sources: [wiki("en", "Myra", "Wikipedia (İngilizce): Myra", "Wikipedia: Myra", true)],
    model: MYRA,
  },

  /* ---------------- Karahan Tepe ---------------- */
  {
    id: "karahan-tepe-yapisi",
    siteSlug: "karahan-tepe",
    structure: l("dairesel kutsal yapılar", "circular enclosures"),
    title: l("Karahan Tepe", "Karahan Tepe"),
    blurb: l(
      "Göbeklitepe'nin kardeşi: Taş Tepeler'de, T biçimli dikilitaşlarla çevrili, ana kayaya kısmen oyulmuş yuvarlak bir kutsal yapı. Sitede 266'dan fazla dikilitaş görülmüş; kazılan alan henüz yüzde beş kadardır.",
      "Göbeklitepe's sister: a round enclosure in the Stone Hills, part cut into the bedrock and ringed by T-shaped pillars. More than 266 pillars have been seen at the site; only about five per cent of it has been dug.",
    ),
    period: l("MÖ 9750 - 9400", "9750 - 9400 BC"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Karahan Tepe maddesi) tarihi, 266'dan fazla dikilitaşı, alanın büyüklüğünü ve kazılan payı verir; tek bir yapının ölçülerini vermez. Bu yüzden modelde ölçü gösterilmez: yapının çapı (28 m), dikilitaşların sayısı ve yüksekliği, merkezdeki iki dikilitaş ve sekiler Göbeklitepe'deki benzer yapıların oranlarıyla verilmiştir. Karahan Tepe'nin dikilitaşlarının çoğu süslemesizdir; modelde birkaçına yılan kabartması konmuştur. Kayaya oyulmuş odadaki insan başı ve fallik dikilitaşlar modelde yoktur.",
      "The source that could be opened (the English Wikipedia's article on Karahan Tepe) gives the date, the more than 266 pillars, the size of the site and how much of it has been dug; it gives no dimensions of a single building. So the model shows none: the diameter of the enclosure (28 m), the number and height of the pillars, the two at the centre and the benches are proportioned from the similar buildings at Göbeklitepe. Most of Karahan Tepe's pillars are undecorated; in the model a few carry snakes. The human head and the phallic pillars of the rock-cut room are not modelled.",
    ),
    hotspots: [
      spot(
        [0, 4.6, 0],
        "Merkez dikilitaşlar",
        "The central pillars",
        "Yapının ortasında karşılıklı duran iki büyük T taşı.",
        "The two great T-shaped stones facing each other in the middle.",
      ),
      spot(
        [9.4, 3.2, 3],
        "Çevre dikilitaşları",
        "The ring of pillars",
        "Duvara gömülü dikilitaşlar; çoğu süslemesizdir.",
        "Pillars set into the wall, most of them plain.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "Karahan_Tepe",
        "Wikipedia (İngilizce): Karahan Tepe",
        "Wikipedia: Karahan Tepe",
        true,
      ),
    ],
    model: {
      kind: "neolithic-enclosure",
      enclosureDiameter: 28,
      centralPillarHeight: 4.2,
      ringPillarHeight: 2.6,
      ringPillars: 11,
      pedestalSocket: 0.15,
      wallThickness: 1.1,
      benchHeight: 0.5,
      pillarWidth: 1.0,
      pillarThickness: 0.38,
      plain: true,
    },
  },

  /* ---------------- Alacahöyük: the Sphinx Gate ---------------- */
  {
    id: "alacahoyuk-sfenksli-kapi",
    siteSlug: "alacahoyuk",
    structure: l("Sfenksli Kapı", "Sphinx Gate"),
    title: l("Alacahöyük Sfenksli Kapı", "The Sphinx Gate of Alacahöyük"),
    blurb: l(
      "Hitit kentinin girişi: kapı payelerinden öne çıkan iki sfenks, iki yanda kabartmalı ortostatlar. MÖ 14. yüzyıldan; kentin altında ise MÖ 3. binyıldan on dört kral mezarı yatar.",
      "The entrance of the Hittite town: two sphinxes standing out of the gate jambs, carved orthostats either side. It dates from the 14th century BC; under the town lie fourteen royal tombs of the 3rd millennium BC.",
    ),
    period: l("MÖ 14. yüzyıl", "14th century BC"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Alacahöyük maddesi) kapının sfenkslerini ve çevresindeki taş kabartmaları, tarihini ve on dört kral mezarını anlatır; ölçü vermez. Bu yüzden modelde ölçü gösterilmez: geçidin genişliği, sfenkslerin boyu, ortostat sayısı, surun yüksekliği ve höyüğün yüksekliği modelin oranıdır. Kapı, Hattuşa'nın kuleli kapıları gibi değil, höyüğün tepesinde iki yekpare payeli alçak bir geçit olarak çizilmiştir; üstünün nasıl kapandığı bilinmediği için çizilmemiştir. Ortostatlardaki kabartmalar (kral ve kraliçe boğa önünde, müzisyenler, akrobatlar, av) yalnızca kaba figürlerle gösterilmiştir; sfenkslerin başı basitçe yontulmuştur.",
      "The source that could be opened (the English Wikipedia's article on Alacahöyük) describes the gate's sphinxes and the stone reliefs round them, its date and the fourteen royal tombs; it gives no dimensions. So the model shows none: the width of the passage, the height of the sphinxes, the number of orthostats, the height of the wall and of the mound are the model's proportion. The gate is drawn not as a towered gate like Hattusa's but as a low passage between two monolithic jambs on top of the mound; how it was closed above is not known and is not drawn. The reliefs of the orthostats (the king and queen before the bull, musicians, acrobats, a hunt) are shown only as rough figures; the sphinxes' heads are carved simply.",
    ),
    hotspots: [
      spot(
        [-2.7, 2.2, -1.6],
        "Sfenks",
        "A sphinx",
        "Kapı payesinden öne çıkan sfenks; aslan gövdeli, insan başlı.",
        "A sphinx standing out of the jamb: a lion's body, a human head.",
      ),
      spot(
        [0, 2.5, 2],
        "Geçit",
        "The passage",
        "Kente giren yol bu kapıdan geçerdi.",
        "The road into the town passed through this gate.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "Alaca_H%C3%B6y%C3%BCk",
        "Wikipedia (İngilizce): Alacahöyük",
        "Wikipedia: Alaca Höyük",
        true,
      ),
    ],
    model: {
      kind: "sphinx-gate",
      gateWidth: 3.2,
      sphinxHeight: 2.2,
      orthostats: 7,
      wallLength: 46,
      wallHeight: 4.5,
      mound: 12,
    },
  },
];
