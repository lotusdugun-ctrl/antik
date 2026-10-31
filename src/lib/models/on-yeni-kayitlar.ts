import type { Localized } from "@/lib/i18n";
import type { Hotspot, Reconstruction, Source } from "@/lib/reconstructions";
import { tombsLayout, type RockTombsSpec } from "@/lib/models/kaunos-kaya-mezarlari";

/**
 * The ten reconstructions added at the end of October 2026: the Temple of
 * Athena at Priene, the theatre of Termessos, Hadrian's Gate at Antalya, the
 * Tetrapylon of Aphrodisias, the Temple of Hadrian at Ephesus, the Trajaneum
 * at Pergamon, the Temple of Apollo at Side, the Nereid Monument of Xanthos,
 * the rock tombs of Kaunos and the Temple of Artemis at Sardis.
 *
 * The rules are the same as everywhere else: a number shown as a
 * measurement is one the model is built from, and `uncertainty` says what is
 * inference. Where no source that could be opened gives a building's
 * dimensions, the record shows none, and its source is marked `context`.
 */

const l = (tr: string, en: string): Localized => ({ tr, en });

const spot = (
  at: [number, number, number],
  labelTr: string,
  labelEn: string,
  noteTr: string,
  noteEn: string,
): Hotspot => ({ at, label: l(labelTr, labelEn), note: l(noteTr, noteEn) });

const wiki = (
  key: string,
  host: string,
  slug: string,
  tr: string,
  en: string,
  context = false,
): Source => ({
  key,
  title: l(tr, en),
  url: `https://${host}.wikipedia.org/wiki/${slug}`,
  ...(context ? { context: true as const } : {}),
});

const KAUNOS: RockTombsSpec = {
  kind: "rock-tombs",
  tombs: 6,
  columnsPerTomb: 2,
  cliffHeight: 42,
  facadeWidth: 8.5,
  facadeHeight: 11,
  bankDistance: 12,
  riverWidth: 60,
};
const kaunos = tombsLayout(KAUNOS);
const greatTomb = kaunos.tombs[Math.floor(KAUNOS.tombs / 2)]!;
const smallTomb = kaunos.tombs[1]!;

export const ON_YENI: Reconstruction[] = [
  /* ---------------- Priene: the Temple of Athena Polias ---------------- */
  {
    id: "priene-athena-tapinagi",
    siteSlug: "priene",
    structure: l("Athena Tapınağı", "Temple of Athena"),
    title: l("Priene Athena Polias Tapınağı", "The Temple of Athena Polias at Priene"),
    blurb: l(
      "İon düzeninin örnek tapınağı: Halikarnas Mozolesi'nin mimarı Pytheos'un altıya on bir sütunlu peripterosu. Büyük İskender MÖ 334'te tapınağı Athena'ya adadı; adak yazıtı bugün British Museum'dadır.",
      "The model Ionic temple: a peripteros of six by eleven columns by Pytheos, the architect of the Mausoleum. Alexander the Great dedicated it to Athena in 334 BC; his dedication is now in the British Museum.",
    ),
    period: l("MÖ 350 - 330", "350 - 330 BC"),
    measures: [
      {
        value: 6,
        unit: "count",
        label: l("Kısa kenardaki sütun", "Columns on the short sides"),
        source: "en",
      },
      {
        value: 11,
        unit: "count",
        label: l("Uzun kenardaki sütun", "Columns on the long sides"),
        source: "en",
      },
      {
        value: 11.5,
        unit: "m",
        label: l("Sütun yüksekliği", "Height of the columns"),
        source: "en",
      },
      {
        value: 9.43,
        unit: "m",
        label: l(
          "Cella duvarları arası (32 Attika ayağı)",
          "Between the cella walls (32 Attic feet)",
        ),
        source: "en",
      },
      {
        value: 2,
        unit: "count",
        label: l("Pronaos cephesindeki sütun", "Columns in the pronaos front"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Sütun sayıları, sütun yüksekliği (11,5 m), pronaostaki iki sütun ve cella duvarlarının arasındaki 32 Attika ayağı (29,46 cm'lik ayakla 9,43 m) İngilizce Wikipedia'dan alınmıştır. Aynı kaynağın verdiği 100 ayaklık duvar uzunluğu pronaos ve opisthodomosu da kapsar; modelde yalnızca kapalı cella gösterilir, opisthodomos ve onun iki sütunu yoktur. Stylobatın ölçüleri (19,55 × 37,2 m), sütun çapı, saçaklık, çatı ve krepisin basamakları ölçülmüş değil, İon düzeninin oranlarından verilmiştir. İskender'in adak yazıtı duvar bloğundaydı; mimarideki yeri modelde gösterilmez. Kült heykeli (6,5 m) miğferli, kalkanlı ve mızraklı bir Athena olarak çizilmiştir.",
      "The column counts, the height of the columns (11.5 m), the two columns of the pronaos and the 32 Attic feet between the cella walls (9.43 m at 29.46 cm to the foot) come from the English Wikipedia. The 100-foot length of the walls the same source gives includes the pronaos and the opisthodomos; only the closed cella is shown, and the opisthodomos and its two columns are not modelled. The stylobate (19.55 × 37.2 m), the column diameter, the entablature, the roof and the steps of the crepis are proportioned from the Ionic order, not measured. Alexander's dedication was cut on a wall block; it is not shown. The cult statue (6.5 m) is drawn as a helmeted Athena with spear and shield.",
    ),
    hotspots: [
      spot(
        [-8.3, 6, -18.2],
        "Köşe sütunu",
        "The corner column",
        "Altıya on bir sütun: Pytheos'un oranlarla kurduğu İon düzeni.",
        "Six by eleven columns: the Ionic order Pytheos built by proportion.",
      ),
      spot(
        [0, 5, -13.9],
        "Pronaos",
        "The pronaos",
        "İki sütunlu giriş sundurması; İskender'in adak yazıtı buradaki duvar bloğundaydı.",
        "The porch with its two columns; Alexander's dedication was cut on a wall block here.",
      ),
      spot(
        [0, 8, -1],
        "Cella",
        "The cella",
        "Athena Polias'ın 6,5 m'lik kült heykelinin durduğu oda.",
        "The room of the 6.5 m cult statue of Athena Polias.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Temple_of_Athena_Polias_(Priene)",
        "Wikipedia (İngilizce): Priene Athena Polias Tapınağı",
        "Wikipedia: Temple of Athena Polias (Priene)",
      ),
    ],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 19.55,
      stylobateLength: 37.2,
      crepidomaWidth: 21.55,
      crepidomaLength: 39.2,
      crepidomaSteps: 2,
      columnHeight: 11.5,
      outerColumnsShort: 6,
      outerColumnsLong: 11,
      pronaosRows: 1,
      pronaosPerRow: 2,
      totalColumns: 32,
      sekosWallHeight: 12,
      naiskosWidth: 6,
      naiskosLength: 8,
      interior: "cella",
      cultStatue: "athena",
      rings: 1,
      courtWidth: 9.43,
      courtLength: 17,
      columnDiameter: 1.29,
      entablatureHeight: 2.3,
      dedication: "none",
    },
  },

  /* ---------------- Termessos: the theatre ---------------- */
  {
    id: "termessos-tiyatrosu",
    siteSlug: "termessos",
    structure: l("Tiyatro", "Theatre"),
    title: l("Termessos Tiyatrosu", "The Theatre of Termessos"),
    blurb: l(
      "Toros'larda bin metre yükseklikte, Pamfilya ovasına bakan bir Hellenistik tiyatro; Roma döneminde sahne binası büyütülüp beş kapılı bir cephe kazandı. Arkasında Güllük Dağı, önünde uçurum.",
      "A Hellenistic theatre a thousand metres up in the Taurus, looking out over the Pamphylian plain; under Rome its stage building grew and took a front of five doors. Mount Güllük behind it, the drop before it.",
    ),
    period: l("MÖ 2. yüzyıl - MS 2. yüzyıl", "2nd century BC - 2nd century AD"),
    measures: [
      {
        value: 16,
        unit: "count",
        label: l("Diazomanın altındaki sıra", "Rows below the diazoma"),
        source: "en",
      },
      {
        value: 8,
        unit: "count",
        label: l("Diazomanın üstündeki sıra", "Rows above the diazoma"),
        source: "en",
      },
      {
        value: 4000,
        unit: "people",
        label: l("Seyirci (4.000 - 5.000)", "Spectators (4,000 - 5,000)"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Sıra sayıları (16 + 8) ve seyirci sayısı İngilizce Wikipedia'dan alınmıştır. Cavea çapı (64 m), orkestra çapı, oturma basamaklarının ölçüleri, sahne binasının yüksekliği ve kat sayısı ölçülmüş değil, sıra sayısına ve fotoğraflara göre verilmiştir. Oturma yeri yarım daire olarak çizilmiştir (Hellenistik tiyatronun kanatları biraz daha sarmış olabilir); sahne binasının beş kapısı ve altındaki hayvan odaları ayrıca modellenmemiş, sahne cephesi bu sitenin öteki tiyatrolarının şemasıyla çizilmiştir. Kuzey parodosun açık, güney parodosun tonozlu olduğu modelde gösterilmez.",
      "The row counts (16 + 8) and the audience come from the English Wikipedia. The diameter of the cavea (64 m), of the orchestra, the seat steps, the height of the stage building and its storeys are not measured but set from the row count and photographs. The seating is drawn as a semicircle (the Hellenistic wings may have wrapped a little further); the five doors of the stage building and the animal rooms under it are not modelled separately, and the stage front follows the scheme the site's other theatres use. That the north parodos was open and the south one vaulted is not shown.",
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
        [0, 8.4, 22],
        "Diazoma",
        "The diazoma",
        "Alttaki on altı sırayı üstteki sekiz sıradan ayıran geçit.",
        "The walkway between the sixteen rows below and the eight above.",
      ),
      spot(
        [0, 11.5, 27],
        "Üst sıralar",
        "The upper rows",
        "En üstten Pamfilya ovası ve deniz görünür.",
        "From the top rows the Pamphylian plain and the sea are in view.",
      ),
    ],
    sources: [
      wiki("en", "en", "Termessos", "Wikipedia (İngilizce): Termessos", "Wikipedia: Termessos"),
    ],
    model: {
      kind: "roman-theatre",
      caveaDiameter: 64,
      orchestraDiameter: 18,
      scaenaeHeight: 9,
      seatTread: 0.72,
      seatRise: 0.4,
      podiumHeight: 1.2,
      stageDepth: 5,
      stairways: 7,
      lowerRows: 16,
      upperRows: 8,
      character: {
        stone: "limestone",
        ground: "hillside",
        facade: "none",
        screen: "miletus",
        storeys: 2,
        topGallery: false,
      },
    },
  },

  /* ---------------- Antalya: Hadrian's Gate ---------------- */
  {
    id: "antalya-hadrianus-kapisi",
    siteSlug: "antalya-kaleici",
    structure: l("Hadrianus Kapısı", "Hadrian's Gate"),
    title: l("Antalya Hadrianus Kapısı", "Hadrian's Gate at Antalya"),
    blurb: l(
      "İmparator Hadrianus'un Attaleia'ya gelişi için yapılan üç kemerli şehir kapısı: dört payenin önünde granit gövdeli, kompozit başlıklı sütunlar, iki yanında kuleler. Üst katı kaybolmuştur.",
      "The three-arched city gate built for the emperor Hadrian's visit to Attaleia: columns of grey granite with composite capitals before its four piers, a tower either side. Its upper storey is lost.",
    ),
    period: l("MS 121 - 130", "AD 121 - 130"),
    measures: [
      {
        value: 8.03,
        unit: "m",
        label: l("Saçaklığın üstüne kadar yükseklik", "Height to the top of the entablature"),
        source: "de",
      },
      {
        value: 1.28,
        unit: "m",
        label: l("Saçaklığın yüksekliği", "Height of the entablature"),
        source: "de",
      },
      {
        value: 6.18,
        unit: "m",
        label: l("Kemerin tepesine kadar yükseklik", "Height to the crown of the arch"),
        source: "de",
      },
      {
        value: 4.15,
        unit: "m",
        label: l("Kemer açıklığı (üçü de)", "Span of each arch (all three)"),
        source: "de",
      },
      {
        value: 4.94,
        unit: "m",
        label: l("Sütun yüksekliği", "Height of the columns"),
        source: "de",
      },
      {
        value: 0.51,
        unit: "m",
        label: l("Sütunun alt çapı", "Lower diameter of the columns"),
        source: "de",
      },
      {
        value: 4,
        unit: "count",
        label: l("Her cephedeki sütun", "Columns on each face"),
        source: "de",
      },
      {
        value: 2.36,
        unit: "m",
        label: l("Üst katın paye aralığı", "Bay of the upper storey's piers"),
        source: "de",
      },
      { value: 3, unit: "count", label: l("Kemerli geçit", "Arched passages"), source: "de" },
    ],
    uncertainty: l(
      "Bütün ölçüler Almanca Wikipedia'dan alınmıştır: saçaklığın üstüne kadar 8,03 m, saçaklık 1,28 m, kemer tepesi antik döşemeden 6,18 m, üç kemerin açıklığı 4,15 m, sütunlar 4,94 m ve alt çapları 0,51 m, üst katın paye aralığı 2,36 m. Sütunların kaidelerinin yüksekliği bunlardan çıkar. Payelerin genişliği (1,9 m), kapının derinliği, kaybolmuş üst katın yüksekliği ve biçimi, tonozların kaset düzeni, kulelerin ölçüleri (7 × 7 × 14 m) ve sur duvarı modelin oranıdır. Güney kule (Julia Sancta) Roma dönemindendir; kuzeydeki bugünkü kule 13. yüzyılda yapılmıştır, modelde ikisi de aynı biçimde gösterilir. Orta kemerin iki yanındaki sütun aralığının 22 cm geniş olması gösterilmez.",
      "All the measurements come from the German Wikipedia: 8.03 m to the top of the entablature, the entablature 1.28 m, the crown of the arches 6.18 m above the ancient paving, each of the three arches 4.15 m across, the columns 4.94 m with a lower diameter of 0.51 m, and a bay of 2.36 m between the pier bases of the upper storey. The height of the column pedestals follows from them. The width of the piers (1.9 m), the depth of the gate, the height and form of the lost upper storey, the coffering of the vaults, the towers (7 × 7 × 14 m) and the city wall are the model's proportion. The south tower (Julia Sancta) is Roman; the present north tower was built in the 13th century, and both are drawn alike. The 22 cm by which the intercolumniations beside the middle arch are wider is not shown.",
    ),
    hotspots: [
      spot(
        [0, 6.0, -2.6],
        "Orta kemer",
        "The middle arch",
        "Üç kemerin açıklığı da aynıdır: 4,15 m.",
        "All three arches span the same 4.15 m.",
      ),
      spot(
        [-9.1, 4.5, -3.4],
        "Granit sütun",
        "A granite column",
        "Yüksek bir kaide üstünde gri granit gövde ve kompozit başlık.",
        "A grey granite shaft with a composite capital, on a tall pedestal.",
      ),
      spot(
        [0, 9.6, -2.4],
        "Kayıp üst kat",
        "The lost upper storey",
        "Paye kaideleri 2,36 m aralıklıdır; katın biçimi tahmindir.",
        "Its pier bases stand 2.36 m apart; the storey's form is conjecture.",
      ),
      spot(
        [-13.5, 10, -3.1],
        "Kule",
        "The tower",
        "Güneydeki kule Hadrianus'un kız kardeşi Julia Sancta'ya adanmıştı.",
        "The south tower was dedicated to Julia Sancta, Hadrian's sister.",
      ),
    ],
    sources: [
      wiki(
        "de",
        "de",
        "Hadrianstor_(Antalya)",
        "Wikipedia (Almanca): Hadrianus Kapısı (Antalya)",
        "Wikipedia (German): Hadrian's Gate (Antalya)",
      ),
    ],
    model: {
      kind: "roman-gate",
      variant: "arch",
      openings: 3,
      archSpan: 4.15,
      archHeight: 6.18,
      totalHeight: 8.03,
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
  },

  /* ---------------- Aphrodisias: the Tetrapylon ---------------- */
  {
    id: "aphrodisias-tetrapylon",
    siteSlug: "aphrodisias",
    structure: l("Tetrapylon", "Tetrapylon"),
    title: l("Aphrodisias Tetrapylonu", "The Tetrapylon of Aphrodisias"),
    blurb: l(
      "Ana caddeden Aphrodite kutsal alanının ön avlusuna açılan anıtsal kapı: dörde dört sütun, iki cephede ortası kemerle yükselen alınlıklar. Heykeltıraşlarıyla ünlü kentin en çok fotoğraflanan yapısı.",
      "The monumental gateway from the main street into the forecourt of the sanctuary of Aphrodite: four rows of four columns, and on both fronts a pediment rising in an arch over the middle. The most photographed building of a city famous for its sculptors.",
    ),
    period: l("MS 200 civarı", "c. AD 200"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynaklarda (İngilizce ve Almanca Wikipedia'nın Aphrodisias maddeleri) kapının yalnızca tarihi (MS 200 civarı) ve yeri — ana caddeden kutsal alanın ön avlusuna giden yolun sonu — verilir; ölçüsü yoktur. Bu yüzden modelde ölçü gösterilmez: dört sıra dört sütunluk plan, orta geçidin genişliği (4,6 m), sütun yüksekliği (6,2 m), kaideler, kasetli tavanlar, ortası kemerle yükselen 'Suriye alınlığı' ve alınlıklardaki Eros figürleri yayımlanmış rekonstrüksiyon çizimlerine ve fotoğraflara göre verilmiş, ölçülmemiştir. Cadde cephesindeki sütunların spiral yivleri düz yiv olarak çizilmiştir.",
      "The sources that could be opened (the English and German Wikipedia articles on Aphrodisias) give only the gateway's date (c. AD 200) and its place — the end of the road from the main street into the sanctuary's forecourt — and no dimensions. So the model shows none: the plan of four rows of four columns, the width of the middle passage (4.6 m), the height of the columns (6.2 m), the pedestals, the coffered ceilings, the 'Syrian' pediment rising in an arch over the middle and the Erotes in its fields are set from published reconstruction drawings and photographs, not measured. The spiral fluting of the columns on the street side is drawn as straight fluting.",
    ),
    hotspots: [
      spot(
        [0, 10.6, -6.4],
        "Kemerli alınlık",
        "The arched pediment",
        "Alınlığın ortası orta geçidin üstünde kemer olup yükselir.",
        "The middle of the pediment rises as an arch over the middle passage.",
      ),
      spot(
        [-5.3, 4.5, -6.6],
        "Cephe sütunları",
        "The front columns",
        "Cadde cephesindeki sütunların yivleri spiral biçimindeydi.",
        "The columns of the street front were fluted in a spiral.",
      ),
      spot(
        [0, 7.5, 0],
        "Geçit",
        "The passage",
        "Kutsal alana giden hacılar bu üç geçitten girerdi.",
        "Pilgrims to the sanctuary came in through these three passages.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Aphrodisias",
        "Wikipedia (İngilizce): Aphrodisias",
        "Wikipedia: Aphrodisias",
        true,
      ),
    ],
    model: {
      kind: "roman-gate",
      variant: "tetrapylon",
      openings: 3,
      archSpan: 4.6,
      archHeight: 7,
      totalHeight: 9.6,
      entablatureHeight: 1.3,
      columnHeight: 6.2,
      columnDiameter: 0.65,
      columnsPerFace: 4,
      rows: 4,
      pierWidth: 3,
      depth: 11.5,
    },
  },

  /* ---------------- Ephesus: the Temple of Hadrian ---------------- */
  {
    id: "efes-hadrianus-tapinagi",
    siteSlug: "efes",
    structure: l("Hadrianus Tapınağı", "Temple of Hadrian"),
    title: l("Efes Hadrianus Tapınağı", "The Temple of Hadrian at Ephesus"),
    blurb: l(
      "Kuretler Caddesi'nde küçük bir tapınak: iki sütun ile iki payenin üstünde ortası Suriye kemeriyle yükselen bir cephe, kilit taşında Tykhe büstü; içeride Efes'in kuruluş efsanesini anlatan friz. P. Quintilius Valens Varius, Artemis'e, Hadrianus'a ve Efes halkına adadı.",
      "A small temple on Curetes Street: a front of two columns between two pillars rising in a Syrian arch, a bust of Tyche on its keystone; inside, a frieze of the founding of Ephesus. P. Quintilius Valens Varius dedicated it to Artemis, to Hadrian and to the people of Ephesus.",
    ),
    period: l("MS 117 - 118", "AD 117 - 118"),
    measures: [
      {
        value: 2,
        unit: "count",
        label: l("Cephedeki sütun", "Columns in the front"),
        source: "de",
      },
      { value: 2, unit: "count", label: l("Köşe payesi", "Corner pillars"), source: "de" },
      {
        value: 4,
        unit: "count",
        label: l("Önündeki heykel kaidesi (Tetrarklar)", "Statue bases before it (the Tetrarchs)"),
        source: "de",
      },
    ],
    uncertainty: l(
      "Cephenin iki sütun ile iki payeden oluştuğu, Suriye kemeri, kilit taşındaki Tykhe büstü, kapı lünetindeki akantüslü kadın figürü, kuruluş frizi, enine dikdörtgen küçük cella ve önündeki dört heykel kaidesi Almanca Wikipedia'dan alınmıştır. Kaynak ölçü vermez: cephe genişliği (8,6 m), sütun yüksekliği (6,1 m), podyum, sundurma ve cella derinliği, saçaklık ve alınlık modelin oranıdır. Friz ve lünetteki figürler tek tek modellenmemiş, figür dizileri olarak çizilmiştir. Kaidelerdeki dört heykel, kaidelere sonradan dikilen Tetrark heykellerini temsil eder; modelin geri kalanıyla aynı dönemden değildir. Cadde, karşıdaki sütunlu galeri ve komşu yapılar yalnızca çevreyi gösterir.",
      "That the front is two columns between two pillars, the Syrian arch, the bust of Tyche on its keystone, the woman rising from acanthus in the lunette over the door, the founding frieze, the small cella wider than deep and the four statue bases before it come from the German Wikipedia. It gives no dimensions: the width of the front (8.6 m), the columns (6.1 m), the podium, the depth of the porch and cella, the entablature and the pediment are the model's proportion. The figures of the frieze and lunette are drawn as rows of figures, not carved one by one. The four statues on the bases stand for the Tetrarchs set up on them later, not at the time of the rest of the model. The street, the colonnade opposite and the neighbouring buildings only show the setting.",
    ),
    hotspots: [
      spot(
        [0, 7.9, -3.9],
        "Suriye kemeri",
        "The Syrian arch",
        "Saçaklık iki orta sütunun üstünde kemer olup yükselir; kilit taşında Tykhe büstü.",
        "The entablature rises as an arch over the middle columns; Tyche's bust on the keystone.",
      ),
      spot(
        [0, 5.2, -0.5],
        "Kapı lüneti",
        "The door lunette",
        "Kapının üstünde akantüsten yükselen bir kadın figürü.",
        "Over the door, a woman rising out of acanthus.",
      ),
      spot(
        [2.5, 6.2, -0.5],
        "Kuruluş frizi",
        "The founding frieze",
        "Androklos ve Efes'in kuruluşu; aslı Selçuk Müzesi'ndedir.",
        "Androklos and the founding of Ephesus; the original is in the Selçuk museum.",
      ),
      spot(
        [-3.7, 3.0, -6.3],
        "Heykel kaideleri",
        "The statue bases",
        "Dört kaide sonradan Tetrarkların heykellerini taşıdı.",
        "Four bases that later carried statues of the Tetrarchs.",
      ),
    ],
    sources: [
      wiki(
        "de",
        "de",
        "Hadrianstempel_(Ephesos)",
        "Wikipedia (Almanca): Hadrianus Tapınağı (Efes)",
        "Wikipedia (German): Temple of Hadrian (Ephesus)",
      ),
    ],
    model: {
      kind: "prostyle-temple",
      columns: 2,
      pillars: 2,
      statueBases: 4,
      facadeWidth: 8.6,
      columnHeight: 6.1,
      columnDiameter: 0.62,
      porchDepth: 3.6,
      cellaDepth: 4.6,
      podiumHeight: 0.75,
      entablatureHeight: 1.15,
    },
  },

  /* ---------------- Pergamon: the Trajaneum ---------------- */
  {
    id: "pergamon-trajan-tapinagi",
    siteSlug: "pergamon",
    structure: l("Trajan Tapınağı", "Temple of Trajan"),
    title: l("Pergamon Trajan Tapınağı", "The Trajaneum at Pergamon"),
    blurb: l(
      "Akropolün en yüksek noktasında, tonozlu bir terasın üstünde yüksek bir podyumda duran Korint düzeninde tapınak: Zeus Philios ile İmparator Trajan'ın ortak tapınağı. Beyaz mermer sütunları ovadan görünür.",
      "A Corinthian temple on a tall podium over a vaulted terrace at the highest point of the acropolis: the shared temple of Zeus Philios and the emperor Trajan. Its white marble columns are seen from the plain.",
    ),
    period: l("MS 114 - 129", "AD 114 - 129"),
    measures: [
      {
        value: 6,
        unit: "count",
        label: l("Kısa kenardaki sütun", "Columns on the short sides"),
        source: "en",
      },
      {
        value: 9,
        unit: "count",
        label: l("Uzun kenardaki sütun", "Columns on the long sides"),
        source: "en",
      },
      { value: 18, unit: "m", label: l("Genişlik (yaklaşık)", "Width (about)"), source: "en" },
      {
        value: 2.9,
        unit: "m",
        label: l("Podyumun yüksekliği", "Height of the podium"),
        source: "en",
      },
      {
        value: 2,
        unit: "count",
        label: l("Antae arasındaki sütun sırası", "Rows of columns in antis"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Sütun sayıları, yaklaşık 18 m'lik genişlik (modelde stylobatın genişliği alınmıştır), 2,9 m'lik podyum ve antae arasındaki iki sıra sütun İngilizce Wikipedia'nın Pergamon maddesinden alınmıştır. Uzunluk (27 m), sütun yüksekliği (9,6 m) ve çapı, saçaklık ve cella ölçüleri verilmez; Korint düzeninin oranlarıyla çizilmiştir. Korint başlıkları kompozit başlığın akantüs çanağıyla gösterilir. Tonozlu teras ve kutsal alanı üç yandan çeviren stoalar modelde yoktur; yalnızca podyum ve önündeki merdiven gösterilir. Mimari yazıt bilinmediğinden saçaklığa yazı konmamıştır.",
      "The column counts, the width of about 18 m (taken as the width of the stylobate), the 2.9 m podium and the two rows of columns in antis come from the English Wikipedia's article on Pergamon. The length (27 m), the height (9.6 m) and diameter of the columns, the entablature and the cella are not given and are drawn from the proportions of the Corinthian order. The Corinthian capitals are drawn with the acanthus bell of the composite. The vaulted terrace and the stoas round three sides of the precinct are not modelled; only the podium and its front stair are. No architrave text is known, so none is cut.",
    ),
    hotspots: [
      spot(
        [0, 2.4, -16],
        "Podyum merdiveni",
        "The podium stair",
        "2,9 m'lik podyuma yalnızca ön cepheden çıkılırdı.",
        "The 2.9 m podium was climbed only from the front.",
      ),
      spot(
        [-7.5, 7, -12.9],
        "Korint sütunu",
        "A Corinthian column",
        "Altıya dokuz sütun; başlıklar akantüs yapraklı.",
        "Six by nine columns, the capitals in acanthus.",
      ),
      spot(
        [0, 8, -1],
        "Cella",
        "The cella",
        "Zeus Philios ile Trajan'ın heykelleri birlikte dururdu; ikisinin de parçaları bulunmuştur.",
        "Statues of Zeus Philios and Trajan stood together; pieces of both were found.",
      ),
    ],
    sources: [
      wiki("en", "en", "Pergamon", "Wikipedia (İngilizce): Pergamon", "Wikipedia: Pergamon"),
    ],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 18,
      stylobateLength: 27,
      crepidomaWidth: 20,
      crepidomaLength: 29,
      crepidomaSteps: 1,
      columnHeight: 9.6,
      outerColumnsShort: 6,
      outerColumnsLong: 9,
      pronaosRows: 2,
      pronaosPerRow: 2,
      totalColumns: 30,
      sekosWallHeight: 10,
      naiskosWidth: 6,
      naiskosLength: 8,
      interior: "cella",
      cultStatue: "zeus",
      order: "corinthian",
      podium: 2.9,
      rings: 1,
      courtWidth: 8,
      courtLength: 6,
      columnDiameter: 0.95,
      entablatureHeight: 2,
      dedication: "none",
    },
  },

  /* ---------------- Side: the Temple of Apollo ---------------- */
  {
    id: "side-apollon-tapinagi",
    siteSlug: "side",
    structure: l("Apollon Tapınağı", "Temple of Apollo"),
    title: l("Side Apollon Tapınağı", "The Temple of Apollo at Side"),
    blurb: l(
      "Yarımadanın ucunda, denizin kıyısında Korint düzeninde bir tapınak; Antoninus Pius döneminde yapıldı. Ayağa kaldırılan beş sütunu gün batımında Side'nin simgesidir.",
      "A Corinthian temple at the tip of the peninsula, on the edge of the sea, built under Antoninus Pius. Its five re-erected columns at sunset are the emblem of Side.",
    ),
    period: l("MS 150 civarı", "c. AD 150"),
    measures: [],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Side Apollon Tapınağı maddesi) tapınağın Korint düzeninde olduğunu, MS 150 civarında Antoninus Pius döneminde yapıldığını ve ayakta kalan beş sütunun 1984-1990 arasında onarıldığını söyler; ölçü vermez. Bu yüzden modelde ölçü gösterilmez: altıya on bir sütunlu peripteros planı, stylobat (16,4 × 29,2 m), sütun yüksekliği (8,9 m), krepis, cella ve saçaklık yayımlanmış planlara ve fotoğraflara göre verilmiştir. Saçaklık frizindeki Medusa başları tek tek modellenmemiştir. Yanındaki Athena tapınağı ve deniz kıyısı gösterilmez.",
      "The source that could be opened (the English Wikipedia's article on the Temple of Apollo at Side) says it is Corinthian, built around AD 150 under Antoninus Pius, and that its five standing columns were restored in 1984-1990; it gives no dimensions. So the model shows none: the plan of a peripteros of six by eleven columns, the stylobate (16.4 × 29.2 m), the height of the columns (8.9 m), the crepis, the cella and the entablature follow published plans and photographs. The Medusa heads of the frieze are not modelled one by one. The neighbouring temple of Athena and the shore are not shown.",
    ),
    hotspots: [
      spot(
        [-6.7, 5, -13.8],
        "Korint sütunları",
        "The Corinthian columns",
        "Bugün ayakta duran beş sütun ön cephenin köşesindendir.",
        "The five columns standing today are from the corner of the front.",
      ),
      spot(
        [0, 11.6, -14.2],
        "Friz",
        "The frieze",
        "Saçaklık frizinde Medusa başları sıralanırdı.",
        "Medusa heads ran along the frieze of the entablature.",
      ),
      spot(
        [0, 7, -1],
        "Cella",
        "The cella",
        "Apollon'un kült heykelinin durduğu oda.",
        "The room of Apollo's cult statue.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Temple_of_Apollo_(Side)",
        "Wikipedia (İngilizce): Side Apollon Tapınağı",
        "Wikipedia: Temple of Apollo (Side)",
        true,
      ),
    ],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 16.4,
      stylobateLength: 29.2,
      crepidomaWidth: 18.4,
      crepidomaLength: 31.2,
      crepidomaSteps: 3,
      columnHeight: 8.9,
      outerColumnsShort: 6,
      outerColumnsLong: 11,
      pronaosRows: 1,
      pronaosPerRow: 2,
      totalColumns: 32,
      sekosWallHeight: 9.5,
      naiskosWidth: 6,
      naiskosLength: 8,
      interior: "cella",
      cultStatue: "apollo",
      order: "corinthian",
      rings: 1,
      courtWidth: 7.5,
      courtLength: 10,
      columnDiameter: 0.9,
      entablatureHeight: 1.9,
      dedication: "none",
    },
  },

  /* ---------------- Xanthos: the Nereid Monument ---------------- */
  {
    id: "ksanthos-nereidler-aniti",
    siteSlug: "xanthos",
    structure: l("Nereidler Anıtı", "Nereid Monument"),
    title: l("Ksanthos Nereidler Anıtı", "The Nereid Monument of Xanthos"),
    blurb: l(
      "Likya hanedanı Arbinas'ın mezarı: yüksek bir podyumun üstünde dörde altı sütunlu küçük bir İon tapınağı, sütunlarının arasında denizin üstünden koşan Nereidler. Kalıntıları bugün British Museum'dadır.",
      "The tomb of the Lycian dynast Arbinas: a small Ionic temple of four by six columns on a tall podium, the Nereids running over the sea between its columns. Its remains are in the British Museum.",
    ),
    period: l("MÖ 390 - 380", "390 - 380 BC"),
    measures: [
      {
        value: 4,
        unit: "count",
        label: l("Kısa kenardaki sütun", "Columns on the short sides"),
        source: "en",
      },
      {
        value: 6,
        unit: "count",
        label: l("Uzun kenardaki sütun", "Columns on the long sides"),
        source: "en",
      },
      {
        value: 22,
        unit: "count",
        label: l("Podyum frizlerinin her birindeki blok", "Blocks in each podium frieze"),
        source: "en",
      },
      {
        value: 11,
        unit: "count",
        label: l("Günümüze kalan Nereid heykeli", "Nereid statues that survive"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Sütun sayıları, podyumdaki iki frizin yirmi ikişer bloğu, günümüze kalan on bir Nereid, tarih ve mezar sahibi İngilizce Wikipedia'dan alınmıştır. Kaynak ölçü vermez: podyumun ölçüleri (6,8 × 10,2 × 5,1 m), sütun yüksekliği (3,3 m), saçaklık ve çatı British Museum'daki rekonstrüksiyonun oranlarına göre verilmiştir. Nereidlerden yalnızca günümüze kalan on biri gösterilmiş, aralıklardan beşi boş bırakılmıştır. Friz ve alınlıklardaki sahneler tek tek oyulmamış, figür dizileri olarak çizilmiştir.",
      "The column counts, the twenty-two blocks of each of the two podium friezes, the eleven surviving Nereids, the date and the owner of the tomb come from the English Wikipedia. It gives no dimensions: the podium (6.8 × 10.2 × 5.1 m), the columns (3.3 m), the entablature and the roof follow the proportions of the reconstruction in the British Museum. Only the eleven surviving Nereids are shown, and five intercolumniations are left empty. The scenes of the friezes and pediments are drawn as rows of figures, not carved one by one.",
    ),
    hotspots: [
      spot(
        [0, 3.6, -5.3],
        "Savaş frizi",
        "The battle frieze",
        "Podyumun alt frizinde kahramanca savaş sahneleri.",
        "Heroic battles on the lower frieze of the podium.",
      ),
      spot(
        [0, 4.8, -5.3],
        "Kuşatma frizi",
        "The siege frieze",
        "Üst frizin her yüzünde bir kentin kuşatılması.",
        "On each side of the upper frieze, a city under siege.",
      ),
      spot(
        [-1.87, 6.1, -4.95],
        "Nereidler",
        "The Nereids",
        "Sütunların arasında denizin üstünden koşan deniz perileri.",
        "Sea nymphs running over the waves between the columns.",
      ),
      spot(
        [0, 9.6, -5.5],
        "Alınlık",
        "The pediment",
        "Ön alınlıkta hanedan ile eşi, arkada bir savaş.",
        "The dynast and his wife in the front pediment, a battle at the back.",
      ),
    ],
    sources: [
      wiki(
        "en",
        "en",
        "Nereid_Monument",
        "Wikipedia (İngilizce): Nereidler Anıtı",
        "Wikipedia: Nereid Monument",
      ),
    ],
    model: {
      kind: "lycian-heroon",
      columnsShort: 4,
      columnsLong: 6,
      friezeBlocks: 22,
      nereids: 11,
      podiumWidth: 6.8,
      podiumLength: 10.2,
      podiumHeight: 5.1,
      columnHeight: 3.3,
      columnDiameter: 0.5,
      entablatureHeight: 0.95,
    },
  },

  /* ---------------- Kaunos: the rock tombs ---------------- */
  {
    id: "kaunos-kaya-mezarlari",
    siteSlug: "kaunos",
    structure: l("Kaya Mezarları", "Rock-cut Tombs"),
    title: l("Kaunos Kral Mezarları", "The Royal Tombs of Kaunos"),
    blurb: l(
      "Dalyan çayının üstündeki kayalığa oyulmuş altı mezar: her birinin cephesi iki İon sütunlu, alınlıklı bir Hellenistik tapınak gibidir. Karia ile Likya'nın sınırındaki ırmaktan, kayıklardan seyredilirdi.",
      "Six tombs cut into the cliff over the Dalyan river, each front carved as a Hellenistic temple with two Ionic columns and a pediment. They were seen from the river on the border of Caria and Lycia, and from the boats on it.",
    ),
    period: l("MÖ 4. - 2. yüzyıl", "4th - 2nd century BC"),
    measures: [
      { value: 6, unit: "count", label: l("Mezar", "Tombs"), source: "en" },
      {
        value: 2,
        unit: "count",
        label: l("Her cephedeki İon sütunu", "Ionic columns on each front"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Mezar sayısı, cephelerin iki İon sütunlu, alınlıklı ve dişli frizli tapınak cepheleri olması, palmet biçimli akroterler ve tarih İngilizce Wikipedia'dan alınmıştır. Kaynak yükseklik ya da genişlik vermez: en büyük cephe 8,5 × 11 m alınmış, ötekiler daha küçük ve kayalıkta farklı yüksekliklerde çizilmiştir; yerleri gerçek dizilişi değil, genel görünümü yansıtır. Kayalığın yüksekliği (42 m), ırmağın genişliği ve kıyı modelin oranıdır.",
      "The number of tombs, their fronts as temple fronts with two Ionic columns, a pediment and a dentil frieze, the palmette acroteria and the date come from the English Wikipedia. It gives no heights or widths: the largest front is taken as 8.5 × 11 m, the others drawn smaller and at different heights on the cliff; their places show the general look, not the real arrangement. The height of the cliff (42 m), the width of the river and the bank are the model's proportion.",
    ),
    hotspots: [
      spot(
        [greatTomb.x, greatTomb.y + 9.2, -1.2],
        "Büyük mezar",
        "The great tomb",
        "Cephesi iki İon sütunlu ve alınlıklı bir tapınak gibi oyulmuştur.",
        "Its front is cut as a temple with two Ionic columns and a pediment.",
      ),
      spot(
        [greatTomb.x, greatTomb.y + 2, 0.4],
        "Mezar odasının kapısı",
        "The door of the chamber",
        "Sütunların arkasında, kayanın içindeki mezar odasına açılan kapı.",
        "Behind the columns, the door into the burial chamber in the rock.",
      ),
      spot(
        [smallTomb.x, smallTomb.y + 4, -0.9],
        "Küçük mezar",
        "A smaller tomb",
        "Altı mezar kayalığın farklı yüksekliklerine oyulmuştur.",
        "The six tombs were cut at different heights on the cliff.",
      ),
    ],
    sources: [wiki("en", "en", "Kaunos", "Wikipedia (İngilizce): Kaunos", "Wikipedia: Kaunos")],
    model: KAUNOS,
  },

  /* ---------------- Sardis: the Temple of Artemis ---------------- */
  {
    id: "sardes-artemis-tapinagi",
    siteSlug: "sardes",
    structure: l("Artemis Tapınağı", "Temple of Artemis"),
    title: l("Sardes Artemis Tapınağı", "The Temple of Artemis at Sardis"),
    blurb: l(
      "Efes ve Didyma'nınkilerle yarışmak için başlanan ama hiç bitirilemeyen dev bir İon tapınağı. Roma döneminde cellası ikiye bölündü; batı yarısı imparator kültüne verildi ve buraya Faustina'nın dev heykeli kondu.",
      "A colossal Ionic temple begun to rival those of Ephesus and Didyma and never finished. Under Rome its cella was split in two; the west half was given to the cult of the emperors, and Faustina's colossal statue set up in it.",
    ),
    period: l("MÖ 4. yüzyıl - MS 2. yüzyıl", "4th century BC - 2nd century AD"),
    measures: [
      {
        value: 1.76,
        unit: "m",
        label: l("Faustina'nın dev heykelinin başı", "Head of Faustina's colossal statue"),
        source: "en",
      },
    ],
    uncertainty: l(
      "Açılabilen kaynak (İngilizce Wikipedia'nın Sardes maddesi) tapınağın Hellenistik dönemde başladığını, bitirilmediğini ve kutsal alanda bulunan 1,76 m'lik Faustina başının imparator çiftinin dev heykellerinden birine ait olduğunu söyler; tapınağın ölçüsünü vermez. Bu yüzden yalnızca bu baş gösterilir: Faustina'nın heykeli ondan sekiz baş boyunda çizilmiştir. Sekize yirmi sütunlu pseudodipteros plan, stylobat (44,5 × 97,5 m), sütun yüksekliği (17,8 m), pronaosun altı sütunu ve cella yayımlanmış planlara göre verilmiş, ölçülmemiştir. Bitmemişliği, doğu sundurmasının arkasındaki sütunların yivsiz bırakılmasıyla gösterilir; gerçekte birçok sütun hiç dikilmemişti.",
      "The source that could be opened (the English Wikipedia's article on Sardis) says the temple was begun in the Hellenistic period and never finished, and that the 1.76 m head of Faustina found in the precinct belonged to one of the colossal statues of the imperial couple; it gives no dimensions of the temple. So only that head is shown: Faustina's statue is drawn eight heads tall from it. The pseudodipteral plan of eight by twenty columns, the stylobate (44.5 × 97.5 m), the height of the columns (17.8 m), the six columns of the pronaos and the cella follow published plans and are not measured. That it was unfinished is shown by leaving the shafts behind the east porch unfluted; in fact many columns were never raised at all.",
    ),
    hotspots: [
      spot(
        [-20.8, 10, -48.3],
        "Köşe sütunu",
        "The corner column",
        "Ayakta kalan iki sütun tapınağın doğu ucundandır.",
        "The two columns still standing are from the east end.",
      ),
      spot(
        [0, 10, -14.5],
        "Pronaos",
        "The pronaos",
        "Derin giriş sundurması: iki sıra halinde altı sütun.",
        "The deep porch: six columns in two rows.",
      ),
      spot(
        [0, 12, 32],
        "Faustina",
        "Faustina",
        "Cellanın batı yarısında imparatoriçenin dev heykeli; başı British Museum'dadır.",
        "The empress's colossal statue in the west half of the cella; her head is in the British Museum.",
      ),
      spot(
        [17.5, 8, 20],
        "Yivsiz sütunlar",
        "The unfluted columns",
        "Tapınak bitirilmedi: sütunların çoğu yivlenmeden kaldı.",
        "The temple was never finished: most of its shafts were never fluted.",
      ),
    ],
    sources: [wiki("en", "en", "Sardis", "Wikipedia (İngilizce): Sardes", "Wikipedia: Sardis")],
    model: {
      kind: "ionic-dipteros",
      stylobateWidth: 44.5,
      stylobateLength: 97.5,
      crepidomaWidth: 47.5,
      crepidomaLength: 100.5,
      crepidomaSteps: 3,
      columnHeight: 17.8,
      outerColumnsShort: 8,
      outerColumnsLong: 20,
      pronaosRows: 2,
      pronaosPerRow: 3,
      totalColumns: 58,
      sekosWallHeight: 18,
      naiskosWidth: 6,
      naiskosLength: 8,
      interior: "cella",
      cultStatue: "artemis",
      rings: 1,
      unfinished: true,
      colossusHead: 1.76,
      courtWidth: 16,
      courtLength: 46,
      columnDiameter: 2,
      entablatureHeight: 3.4,
      dedication: "none",
    },
  },
];
