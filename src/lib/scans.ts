import type { Localized } from "@/lib/i18n";

/**
 * Photogrammetric scans of the real carvings, set into the reconstructions.
 *
 * A procedural figure, however carefully posed, is an illustration of a
 * statue; a scan is the statue. Where a freely licensed scan of the surviving
 * piece exists, the model uses it in place of its own geometry — the Medusa
 * of Didyma, the sculptured drum of the Artemision, the Athena group of the
 * Pergamon altar, the Amazon frieze of the Mausoleum, two of the four virtues
 * of the Celsus front.
 *
 * The files in `public/scans/` are the authors' scans reduced for the web
 * (decimated, textures resized, meshopt-compressed) and re-centred: the
 * footprint is centred on the origin, the base sits at y = 0, and the carved
 * face looks along +z unless `facing` says otherwise. Every licence here
 * requires attribution, which the reconstruction page prints in full.
 */
export type ScanId =
  | "celsus-sophia"
  | "celsus-arete"
  | "didyma-medusa"
  | "artemision-drum"
  | "pergamon-athena"
  | "mausoleum-amazon-1"
  | "mausoleum-amazon-2"
  | "nemrut-head"
  | "athena-arezzo"
  | "neptune"
  | "arringatore"
  | "efebo"
  | "magdalensberg-youth"
  | "penelope"
  | "hermes-sandal"
  | "herakles-lansdowne"
  | "pan"
  | "hermanubis"
  | "centaur"
  | "glykon"
  | "herm-thucydides-herodotus"
  | "herm-epicurus-metrodorus"
  | "herm-socrates-seneca"
  | "herm-plato"
  | "lion-met"
  | "lion-delos"
  | "ephesus-portrait"
  | "caryatid"
  | "tiberius-velatus"
  | "hadrian-troy"
  | "augustus"
  | "antinous"
  | "amazon-wounded"
  | "nike"
  | "cybele"
  | "asklepios"
  | "apollo-kitharoidos"
  | "muse-thalia"
  | "muse-polyhymnia"
  | "muse-clio"
  | "eagle"
  | "asklepios-lod"
  | "tiberius-velatus-lod"
  | "ephesus-portrait-lod"
  | "caryatid-lod";

export type Scan = {
  url: string;
  title: Localized;
  author: string;
  source: string;
  /**
   * Three D Scans (Oliver Laric) publishes its scans of public-domain
   * sculpture as a free archive, with no licence terms attached; it is
   * credited all the same.
   */
  license: "CC BY 4.0" | "CC BY-NC-SA 4.0" | "Free archive";
  licenseUrl: string;
  /** Turn about y that makes the carved face look along +z. */
  facing?: number;
  /** What the scan is of, honestly: an original, a cast, or a copy in situ. */
  note: Localized;
};

const BY = "https://creativecommons.org/licenses/by/4.0/";
const BY_NC_SA = "https://creativecommons.org/licenses/by-nc-sa/4.0/";
const TDS = "https://threedscans.com/info/";
const l = (tr: string, en: string): Localized => ({ tr, en });

type FullScanId = Exclude<
  ScanId,
  "asklepios-lod" | "tiberius-velatus-lod" | "ephesus-portrait-lod" | "caryatid-lod"
>;

const SCANS_FULL: Record<FullScanId, Scan> = {
  "celsus-sophia": {
    url: "/scans/celsus-sophia.glb",
    title: l("Sophia (Bilgelik) heykeli", "Sophia (Wisdom)"),
    author: "Miguel Bandera",
    source: "https://sketchfab.com/3d-models/1cc6ad6af508422398f60f902cb70e88",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Cephenin topluluk fotoğraflarından yapılmış taramasından ayrıldı. Nişteki heykel bir kopya; özgün heykel Viyana'daki Efes Müzesi'nde.",
      "Cut out of a crowdsourced photogrammetry scan of the façade. The statue in the niche is a copy; the original is in the Ephesos Museum, Vienna.",
    ),
  },
  "celsus-arete": {
    url: "/scans/celsus-arete.glb",
    title: l("Arete (Erdem) heykeli", "Arete (Virtue)"),
    author: "Miguel Bandera",
    source: "https://sketchfab.com/3d-models/1cc6ad6af508422398f60f902cb70e88",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Cephenin taramasından ayrıldı; nişteki kopya. Özgün heykel Viyana'da.",
      "Cut out of the façade scan; the copy in the niche. The original is in Vienna.",
    ),
  },
  "didyma-medusa": {
    url: "/scans/didyma-medusa.glb",
    title: l("Didyma'nın Medusa başı", "The Medusa of Didyma"),
    author: "3Deva",
    source: "https://sketchfab.com/3d-models/006795b2e9134dd68e2d8251819ad4b0",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Tapınağın frizinden düşmüş, bugün alanda sergilenen blok. Taramanın altındaki modern kaide çıkarıldı.",
      "The block from the temple's frieze, displayed on site today. The modern base under it has been cut away.",
    ),
  },
  "artemision-drum": {
    url: "/scans/artemision-drum.glb",
    title: l("Artemision'un kabartmalı sütun tamburu", "Sculptured column drum of the Artemision"),
    author: "Daniel Pett",
    source: "https://sketchfab.com/3d-models/b331680caa9d4024a02509e9198547f6",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "British Museum'daki özgün tambur (MÖ 340-320): Hermes, Thanatos ve bir kadın figürü. Yalnızca bir tambur ayakta kaldığı için modeldeki bütün kabartmalı sütunlarda bu tambur tekrarlanıyor; gerçekte her birinin sahnesi farklıydı.",
      "The original drum in the British Museum (340-320 BC): Hermes, Thanatos and a woman. Only this one survives whole, so every sculptured column in the model repeats it; in reality each carried a different scene.",
    ),
  },
  "pergamon-athena": {
    url: "/scans/pergamon-athena.glb",
    title: l("Athena ile dev Alkyoneus", "Athena and the giant Alkyoneus"),
    author: "Ancient World 3D",
    source: "https://sketchfab.com/3d-models/bfe43faf0179456090a880c28c33deec",
    license: "CC BY-NC-SA 4.0",
    licenseUrl: BY_NC_SA,
    note: l(
      "Doğu frizinin Athena grubunun Kopenhag'daki modern alçı kalıbı; özgün friz Berlin'deki Pergamon Müzesi'nde. Modelde doğu yüzüne bir kez yerleştirildi; frizin geri kalanı fotoğraftan oyulmuş kabartma olarak duruyor.",
      "A modern plaster cast in Copenhagen of the Athena group of the east frieze; the original is in the Pergamon Museum, Berlin. It is set once on the model's east face; the rest of the frieze is still cut from a photograph.",
    ),
  },
  "mausoleum-amazon-1": {
    url: "/scans/mausoleum-amazon-1.glb",
    title: l("Amazon frizi levhaları (BM 1857,1220.270)", "Amazon frieze slabs (BM 1857,1220.270)"),
    author: "Daniel Pett",
    source: "https://sketchfab.com/3d-models/088155d26d684b639873e2c756afea8c",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "British Museum'daki özgün levhalar, MÖ 350 civarı: Yunanlılar ile Amazonların savaşı.",
      "The original slabs in the British Museum, about 350 BC: Greeks fighting Amazons.",
    ),
  },
  "mausoleum-amazon-2": {
    url: "/scans/mausoleum-amazon-2.glb",
    title: l("Amazon frizi levhası (BM 1847,0424.5)", "Amazon frieze slab (BM 1847,0424.5)"),
    author: "Daniel Pett",
    source: "https://sketchfab.com/3d-models/3773418dc89f44a0bda31376260917c8",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "British Museum'daki özgün levha: üç Yunanlı, iki Amazon ve bir at. Modelde iki tarama frizin çevresinde sırayla tekrarlanıyor; gerçek frizde her levha farklıydı.",
      "The original slab in the British Museum: three Greeks, two Amazons and a horse. The model repeats the two scans in turn round the frieze; in reality every slab was different.",
    ),
  },
  "nemrut-head": {
    url: "/scans/nemrut-head.glb",
    title: l("Nemrut'ta tiaralı bir baş", "A tiara-crowned head from Nemrut"),
    author: "nahsangungoren",
    source: "https://sketchfab.com/3d-models/d66cdbc4b43048388789d7adf8d4a21e",
    license: "CC BY 4.0",
    licenseUrl: BY,
    facing: Math.PI,
    note: l(
      "Uzun tiaralı, sakallı bir Nemrut başının taraması. Heykellerin gövdeleri yıkık olduğu için modelde kullanılmadı; aşağıda ayrı olarak inceleyebilirsiniz.",
      "A scan of a bearded Nemrut head in a tall tiara. The colossi's bodies are ruined, so it is not set into the model; it can be turned on its own below.",
    ),
  },
  "athena-arezzo": {
    url: "/scans/athena-arezzo.glb",
    title: l("Arezzo Minerva'sı (Athena)", "The Minerva of Arezzo (Athena)"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/museo-archeologico-nazionale/athena/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Floransa Arkeoloji Müzesi'ndeki, Yunan özgününden yapılmış Roma dönemi bronz Athena'nın taraması. Bu yapıda Athena'nın gerçek heykeli kayıp; modelde onun yerine, dönemin bu tipteki bir Athena'sı duruyor.",
      "A scan of the Roman bronze Athena after a Greek original, in the Archaeological Museum of Florence. The Athena that stood here is lost; the model sets a real Athena of the type in her place.",
    ),
  },
  neptune: {
    url: "/scans/neptune.glb",
    title: l("Nîmes Neptün'ü (Zeus tipi)", "The Neptune of Nîmes (a Zeus type)"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/uncategorized/neptune/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Nîmes'taki Musée de la Romanité'de duran, sakallı, yarı çıplak, mantolu bir tanrının Roma heykeli. Zeus ile Poseidon aynı kalıptan yontulurdu; kült heykeli kayıp olduğu için modelde Zeus'un yerine bu tarama kullanıldı. Ayağının dibindeki yunus Poseidon'dan kalma.",
      "A Roman statue of a bearded, half-draped god in the Musée de la Romanité, Nîmes. Zeus and Poseidon were carved to the same type; the cult statue is lost, so this scan stands in for Zeus. The dolphin at his foot is Poseidon's.",
    ),
  },
  arringatore: {
    url: "/scans/arringatore.glb",
    title: l("Arringatore (Aule Meteli)", "The Arringatore (Aule Meteli)"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/museo-archeologico-nazionale/aule/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "MÖ 1. yüzyıldan, togalı, kolunu kaldırarak konuşan bir adamın bronz heykelinin taraması. Celsus ile oğlu Aquila'nın heykelleri ve imparator heykelleri kayıp; modelde onların yerine dönemin bu togalı portre heykeli duruyor.",
      "A scan of the 1st-century BC bronze of a man in a toga, raising his arm to speak. The statues of Celsus, his son Aquila and the emperors are lost; the model sets this real togate portrait of the period in their place.",
    ),
  },
  efebo: {
    url: "/scans/efebo.glb",
    title: l("Idolino (Pesaro Efebi)", "The Idolino (Ephebe of Pesaro)"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/museo-archeologico-nazionale/efebo/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Floransa Arkeoloji Müzesi'ndeki, MÖ 30 dolayına tarihlenen bronz genç heykeli. Modelde sahne cephelerindeki genç Apollon heykellerinin yerine duruyor; o heykellerin kendileri kayıp.",
      "The bronze youth of about 30 BC in the Archaeological Museum of Florence. In the model it stands in for the youthful Apollos of the stage fronts, which are lost.",
    ),
  },
  "magdalensberg-youth": {
    url: "/scans/magdalensberg-youth.glb",
    title: l("Magdalensberg Genci", "The Youth of the Magdalensberg"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/kunsthistorisches-museum-wien/jungling/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Viyana Sanat Tarihi Müzesi'ndeki bronz genç: 1502'de bulunan Roma heykelinin 16. yüzyılda yapılmış dökümü. Modelde genç Dionysos heykellerinin yerine kullanıldı.",
      "The bronze youth in the Kunsthistorisches Museum, Vienna: a 16th-century cast of the Roman statue found in 1502. In the model it stands in for the youthful Dionysos.",
    ),
  },
  penelope: {
    url: "/scans/penelope.glb",
    title: l("Penelope tipi oturan kadın", "The seated 'Penelope'"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/vienna/penelope/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "MÖ 5. yüzyıl Yunan tipinin Roma kopyasından alınmış, Viyana'daki alçı kalıp: elini çenesine dayamış, düşünceli oturan bir kadın. Modelde sahne cephelerindeki düşünceli Muse heykellerinin yerine duruyor.",
      "A plaster cast in Vienna from a Roman copy of a 5th-century BC Greek type: a woman seated in thought, hand to her chin. In the model it stands in for the thoughtful Muse of the stage fronts.",
    ),
  },
  "hermes-sandal": {
    url: "/scans/hermes-sandal.glb",
    title: l("Sandalını bağlayan Hermes", "Hermes fastening his sandal"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/vienna/hermes-fastening-his-sandals/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Lysippos'a atfedilen tipin Roma kopyasından alınmış, Viyana'daki alçı kalıp. Modelde sahne cephelerindeki Hermes heykellerinin yerine duruyor.",
      "A plaster cast in Vienna from a Roman copy of the type attributed to Lysippos. In the model it stands in for the Hermes of the stage fronts.",
    ),
  },
  "herakles-lansdowne": {
    url: "/scans/herakles-lansdowne.glb",
    title: l("Lansdowne Herakles'i", "The Lansdowne Herakles"),
    author: "Ancient World 3D",
    source: "https://sketchfab.com/3d-models/37474f59a3f04487900d8144548e4d69",
    license: "CC BY-NC-SA 4.0",
    licenseUrl: BY_NC_SA,
    note: l(
      "Getty Müzesi'ndeki, MS 125 dolayına tarihlenen Roma heykelinin Kopenhag'daki alçı kalıbı: postunu kolunda, sopasını omzunda taşıyan Herakles.",
      "A cast in Copenhagen of the Roman marble of about AD 125 in the Getty Museum: Herakles with his lion skin over one arm and his club on his shoulder.",
    ),
  },
  pan: {
    url: "/scans/pan.glb",
    title: l("Pan", "Pan"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/uncategorized/pan/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Kandiye (Heraklion) Arkeoloji Müzesi'ndeki mermer Pan heykeli; tarama, kırık yerleri dijital olarak tamamlanmış. Tiyatro Dionysos'un alanıydı; keçi ayaklı Pan da onun maiyetindendi.",
      "The marble Pan in the Heraklion Archaeological Museum, scanned and completed digitally where it is broken. The theatre was Dionysos' ground, and goat-legged Pan was of his company.",
    ),
  },
  hermanubis: {
    url: "/scans/hermanubis.glb",
    title: l("Hermanubis", "Hermanubis"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/vatican-museums/hermanubis/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Vatikan Müzeleri'ndeki MS 1.-2. yüzyıla ait heykel: Hermes ile Mısır tanrısı Anubis'in birleşimi. Efes'te büyük bir Serapis tapınağı vardı; Mısır tanrıları kentin tanrıları arasındaydı. Tiyatro cephesindeki yeri modelin yorumu.",
      "The statue of the 1st-2nd century AD in the Vatican Museums: Hermes merged with the Egyptian Anubis. Ephesus had a great temple of Serapis, and Egypt's gods were among the city's. Its place on the stage front is the model's reading.",
    ),
  },
  centaur: {
    url: "/scans/centaur.glb",
    title: l("Kentaur", "Centaur"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/uncategorized/centaur/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Oplontis'teki Poppaea Villası'nın bahçesinden MS 1. yüzyıla ait bir kentaur; tarama, eksik yerleri dijital olarak tamamlanmış. Modelde evin bahçesine, zengin Roma evlerinin bahçe heykellerine örnek olarak kondu.",
      "A centaur of the 1st century AD from the garden of the Villa of Poppaea at Oplontis, scanned and completed digitally. In the model it stands in the house's garden, as the garden sculpture of a wealthy Roman house.",
    ),
  },
  glykon: {
    url: "/scans/glykon.glb",
    title: l("Glykon", "Glykon"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/uncategorized/glycon/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Köstence Müzesi'ndeki MS 2. yüzyıla ait yılan tanrı Glykon. Kültü Paphlagonia'daki Abonuteichos'ta, bugünkü İnebolu'da doğdu ve Roma Anadolusu'na yayıldı. Ev sunağındaki yeri modelin yorumu.",
      "The 2nd-century AD snake god Glykon in the museum at Constan\u021ba. His cult was born at Abonoteichos in Paphlagonia, today's \u0130nebolu, and spread through Roman Asia Minor. His place in the house shrine is the model's reading.",
    ),
  },
  "herm-thucydides-herodotus": {
    url: "/scans/herm-thucydides-herodotus.glb",
    title: l("Thukydides ile Halikarnaslı Herodot", "Thucydides and Herodotus of Halicarnassus"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/institut-fur-klassische-archaologie/thucydides-and-herodotus/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "İki tarihçinin sırt sırta duran çift hermesi; Napoli'deki Roma eserinin Viyana'daki alçı kalıbı. Roma kütüphaneleri yazarların portreleriyle donatılırdı.",
      "The double herm of the two historians, back to back: a plaster cast in Vienna of the Roman piece in Naples. Roman libraries were furnished with portraits of their authors.",
    ),
  },
  "herm-epicurus-metrodorus": {
    url: "/scans/herm-epicurus-metrodorus.glb",
    title: l("Epikuros ile Metrodoros", "Epicurus and Metrodorus"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/vienna/epicurus-and-metrodorus/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Filozof Epikuros ile öğrencisi Metrodoros'un çift hermesi; Viyana'daki alçı kalıp.",
      "The double herm of the philosopher Epicurus and his pupil Metrodorus: a plaster cast in Vienna.",
    ),
  },
  "herm-socrates-seneca": {
    url: "/scans/herm-socrates-seneca.glb",
    title: l("Sokrates ile Seneca", "Socrates and Seneca"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/vienna/socrates-and-seneca/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Berlin'deki MS 3. yüzyıla ait Roma çift hermesinin alçı kalıbı: Sokrates ile Romalı filozof Seneca.",
      "A cast of the Roman double herm of the 3rd century AD in Berlin: Socrates and the Roman philosopher Seneca.",
    ),
  },
  "herm-plato": {
    url: "/scans/herm-plato.glb",
    title: l("Platon hermesi", "Herm of Plato"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/uncategorized/herm-of-plato/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Platon portresinin Viyana'daki alçı kalıbı.",
      "A plaster cast in Vienna of the portrait of Plato.",
    ),
  },
  "lion-met": {
    url: "/scans/lion-met.glb",
    title: l("Yunan mermer aslanı (MÖ 400 dolayı)", "Greek marble lion (about 400 BC)"),
    author: "cachgill",
    source: "https://sketchfab.com/3d-models/d5131a4f3cad4e2ea93be4d0231072da",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "New York Metropolitan Müzesi'ndeki, MÖ 400-390 dolayına tarihlenen mezar aslanı: Mozole aslanlarından yarım yüzyıl önceki, aynı Yunan geleneğinden bir aslan. Modelde Mozole'nin bütün aslanlarında tekrarlanıyor; gerçekte her biri ayrı yontulmuştu.",
      "The tomb lion of about 400-390 BC in the Metropolitan Museum, New York: half a century older than the Mausoleum's lions and of the same Greek tradition. The model repeats it for all the Mausoleum's lions; in reality each was carved separately.",
    ),
  },
  "lion-delos": {
    url: "/scans/lion-delos.glb",
    title: l("Delos aslanı", "A lion of Delos"),
    author: "iedu360.eu",
    source: "https://sketchfab.com/3d-models/8581d34e85be4d7ba4353c93bdd4036d",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Delos'taki kutsal yolu bekleyen arkaik mermer aslanlardan biri, karşılaştırma için. Nemrut'un aslanları Kommagene'nin kendi üslubundaydı; modeldeki aslanlar yanlarındaki tanrılarla aynı kireçtaşından, aynı üslupta yontulmuş olarak çizildi.",
      "One of the archaic marble lions that guarded the sacred way on Delos, for comparison. Nemrut's lions were in Commagene's own style; the model's lions are cut from the same limestone and in the same manner as the gods beside them.",
    ),
  },
  "ephesus-portrait": {
    url: "/scans/ephesus-portrait.glb",
    title: l("Efes'ten Roma dönemi portre heykeli", "Roman portrait statue from Ephesus"),
    author: "iedu360.eu",
    source: "https://sketchfab.com/3d-models/038788b721f240728814a6fa2cb8f152",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Efes'te bulunmuş, MS 105-108 yıllarına tarihlenen 184,5 cm boyunda mermer portre heykeli: kütüphanenin yapıldığı yıllardan, aynı kentten. Modelde kütüphanenin üst nişlerinden birinde, kayıp Celsus ve Aquila heykellerinin yerine duruyor.",
      "A marble portrait statue 184.5 cm tall found at Ephesus and dated AD 105-108: from the years the library was built, in the same city. In the model it stands in one of the library's upper niches, in place of the lost statues of Celsus and Aquila.",
    ),
  },
  caryatid: {
    url: "/scans/caryatid.glb",
    title: l("Erekhteion karyatidi", "Caryatid of the Erechtheion"),
    author: "Daniel Pett",
    source: "https://sketchfab.com/3d-models/7181dd88d9424838882a4629d886177e",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "British Museum'daki, Atina'daki Erekhteion'un güney sundurmasını taşıyan altı kadın figüründen biri. Başındaki taşıyıcı başlık modelde kesildi; kayıp Episteme (Bilgi) heykelinin yerinde duruyor.",
      "One of the six women who carried the south porch of the Erechtheion in Athens, in the British Museum. The capital on her head is cut away in the model; she stands where the lost Episteme (Knowledge) stood.",
    ),
  },
  "tiberius-velatus": {
    url: "/scans/tiberius-velatus.glb",
    title: l("Başı örtülü Tiberius", "Tiberius with veiled head"),
    author: "frandomazet",
    source: "https://sketchfab.com/3d-models/c02605acc13c492fb0c19931a7596c79",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "İmparator Tiberius'un (MS 14-37) togalı, başı kurban töreni için örtülü heykeli. Celsus'un ve oğlu Aquila'nın heykelleri kayıp; modelde yerlerinde dönemin gerçek togalı heykelleri duruyor.",
      "The emperor Tiberius (AD 14-37) in a toga, his head veiled for sacrifice. The statues of Celsus and his son Aquila are lost; real togate statues of the period stand in their places.",
    ),
  },
  "hadrian-troy": {
    url: "/scans/hadrian-troy.glb",
    title: l("Truva'dan İmparator Hadrianus", "The emperor Hadrian from Troy"),
    author: "alieser",
    source: "https://sketchfab.com/3d-models/47e5673827be4a2db2907b0894958346",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Truva kazılarında bulunan, MS 117-138'e ait zırhlı Hadrianus heykeli; bugün Çanakkale'deki Troya Müzesi'nde. Bacakları dizden aşağısı kayıp.",
      "The cuirassed Hadrian of AD 117-138 from the excavations at Troy, now in the Troy Museum at \u00c7anakkale. The legs are lost below the knee.",
    ),
  },
  augustus: {
    url: "/scans/augustus.glb",
    title: l("Prima Porta Augustus'u", "The Augustus of Prima Porta"),
    author: "juanbrualla",
    source: "https://sketchfab.com/3d-models/42b5fd63307b48cfb073370be3ff259b",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Vatikan Müzeleri'ndeki, zırhlı ve elini kaldırmış Augustus heykeli. Tiyatroların ve kütüphanenin imparator heykellerinin yerinde, dönemin bilinen bir imparator heykeli olarak kullanıldı.",
      "The cuirassed Augustus with raised arm in the Vatican Museums, used for the emperors' statues of the theatres and the library as a known imperial statue of the period.",
    ),
  },
  antinous: {
    url: "/scans/antinous.glb",
    title: l("Delfi Antinoos'u", "The Antinous of Delphi"),
    author: "iedu360.eu",
    source: "https://sketchfab.com/3d-models/6e8ee321e7164dc9b116cdf56eda3d5f",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Hadrianus'un gözdesi Bithynialı Antinoos'un MS 130'dan kısa süre sonra yapılmış, asma yaprağı taçlı heykeli (Delfi Müzesi). Antinoos Dionysos olarak da tapınım görürdü; modelde genç Dionysos heykellerinin bir kısmında duruyor.",
      "The statue of Antinous of Bithynia, Hadrian's favourite, made soon after AD 130 and crowned with vine leaves (Delphi Museum). Antinous was worshipped as Dionysos too; in the model he stands for some of the youthful Dionysos statues.",
    ),
  },
  "amazon-wounded": {
    url: "/scans/amazon-wounded.glb",
    title: l("Yaralı Amazon", "Wounded Amazon"),
    author: "rigsters",
    source: "https://sketchfab.com/3d-models/9cd1d80b84d04191b577217d5c2214c5",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "MS 150 dolayına ait Roma kopyası. Plinius'a göre Efes Artemis Tapınağı için dört büyük heykeltıraş yaralı Amazon heykelinde yarışmıştı; bu tip o yarışmadan gelir.",
      "A Roman copy of about AD 150. Pliny says four great sculptors competed with wounded Amazons for the temple of Artemis at Ephesus; this type comes from that contest.",
    ),
  },
  nike: {
    url: "/scans/nike.glb",
    title: l("Semadirek Nike'si", "The Nike of Samothrace"),
    author: "p_moraiti",
    source: "https://sketchfab.com/3d-models/0ba90c17bcc342b5bf6f08ea766662dd",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Louvre'daki MÖ 2. yüzyıl Helenistik Nike; başı ve kolları kayıp olduğu için öyle görünüyor. Modelde Nike heykellerinin yerinde duruyor.",
      "The Hellenistic Nike of the 2nd century BC in the Louvre, headless and armless as she survives. In the model she stands for the statues of Nike.",
    ),
  },
  cybele: {
    url: "/scans/cybele.glb",
    title: l("Bergama Kybele'si", "The Cybele of Pergamon"),
    author: "iedu360.eu",
    source: "https://sketchfab.com/3d-models/5c2bf78512324c8aa1205dfe66b44631",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Attalos krallığı döneminde Bergama'da tapınım gören, kentsur taçlı ana tanrıça Kybele'nin Neikephoros adağı yazıtlı heykelciği. Kentsur taçlı Tyche heykellerinin yerinde de kullanıldı.",
      "A statuette of the mother goddess Cybele in her mural crown, dedicated by Neikephoros, from Attalid Pergamon. It also stands for the statues of Tyche, who wore the same crown.",
    ),
  },
  asklepios: {
    url: "/scans/asklepios.glb",
    title: l("Asklepios", "Asklepios"),
    author: "Allard Pierson",
    source: "https://sketchfab.com/3d-models/902763811f3f4d8f93827549bd233d56",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "Amsterdam Allard Pierson Müzesi'ndeki sakallı, bukleli Roma Asklepios heykeli. Bergama'daki Asklepieion antik dünyanın en ünlü şifa yeriydi.",
      "The bearded, curled Roman Asklepios in the Allard Pierson Museum, Amsterdam. The Asklepieion at Pergamon was the most famous healing sanctuary of the ancient world.",
    ),
  },
  "apollo-kitharoidos": {
    url: "/scans/apollo-kitharoidos.glb",
    title: l("Kitharalı Apollon (kopya)", "Apollo with the kithara (a copy)"),
    author: "cachgill",
    source: "https://sketchfab.com/3d-models/ce179afe3e6b4a7594c478ff1282d88d",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "West Baden Springs Oteli'ndeki (ABD) heykel: antik kitharalı Apollon tipinin modern bir kopyası. Tiyatro sahnelerinde Apollon heykellerinin bir kısmında duruyor.",
      "The statue in the West Baden Springs Hotel (USA): a modern copy of the ancient type of Apollo with the kithara. It stands for some of the stage fronts' Apollos.",
    ),
  },
  "muse-thalia": {
    url: "/scans/muse-thalia.glb",
    title: l("Muse Thalia (kopya)", "The Muse Thalia (a copy)"),
    author: "cachgill",
    source: "https://sketchfab.com/3d-models/9177c8d844694aea801e609970fc18bb",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "West Baden Springs Oteli'ndeki oturan Thalia: Vatikan'daki antik Muse heykellerinin modern bir kopyası. Komedinin Musesi olduğu için tiyatro sahnelerine yakışır.",
      "The seated Thalia in the West Baden Springs Hotel: a modern copy of the ancient Muses in the Vatican. As the Muse of comedy she belongs on a stage front.",
    ),
  },
  "muse-polyhymnia": {
    url: "/scans/muse-polyhymnia.glb",
    title: l("Muse Polyhymnia (kopya)", "The Muse Polyhymnia (a copy)"),
    author: "cachgill",
    source: "https://sketchfab.com/3d-models/2c3c2082ee264eb6bffe99c41e7cafda",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "West Baden Springs Oteli'ndeki, mantosuna sarınıp dayanan Polyhymnia: Vatikan'daki antik heykelin modern bir kopyası. Celsus Kütüphanesi'nde kayıp Ennoia (Düşünce) heykelinin yerinde de duruyor.",
      "The Polyhymnia wrapped in her mantle and leaning, in the West Baden Springs Hotel: a modern copy of the ancient statue in the Vatican. At the Library of Celsus it also stands where the lost Ennoia (Thought) stood.",
    ),
  },
  "muse-clio": {
    url: "/scans/muse-clio.glb",
    title: l("Muse Klio (kopya)", "The Muse Clio (a copy)"),
    author: "cachgill",
    source: "https://sketchfab.com/3d-models/a02fa7d3e4554c908768093ab163b549",
    license: "CC BY 4.0",
    licenseUrl: BY,
    note: l(
      "West Baden Springs Oteli'ndeki oturan, tomar okuyan Klio: tarihin Musesi, Vatikan'daki antik heykelin modern bir kopyası.",
      "The seated Clio reading a scroll, in the West Baden Springs Hotel: the Muse of history, a modern copy of the ancient statue in the Vatican.",
    ),
  },
  eagle: {
    url: "/scans/eagle.glb",
    title: l("Mermer kartal", "Marble eagle"),
    author: "Three D Scans (Oliver Laric)",
    source: "https://threedscans.com/saint-louis-art-museum/striding-eagle/",
    license: "Free archive",
    licenseUrl: TDS,
    note: l(
      "Saint Louis Sanat Müzesi'ndeki 16. yüzyıla ait mermer kartal, karşılaştırma için. Nemrut'un kartalları Kommagene'nin kendi üslubundaydı ve kayıp parçaları çok; modeldeki kartallar tanrılarla aynı kireçtaşından, aynı üslupta yontulmuş olarak çizildi.",
      "A 16th-century marble eagle in the Saint Louis Art Museum, for comparison. Nemrut's eagles were in Commagene's own style and are badly broken; the model's eagles are cut from the same limestone and in the same manner as the gods.",
    ),
  },
};

/*
 * Reduced copies, for statues set far up and many times over — the twenty
 * dynasts between the Mausoleum's columns — where the full scan would be
 * spent on pixels no one sees. Same scans, same authors and licences, cut to
 * about 4,400 triangles each with gltfpack (meshoptimizer).
 */
const reduced = (of: FullScanId, url: string): Scan => ({
  ...SCANS_FULL[of],
  url,
  title: l(
    `${SCANS_FULL[of].title.tr} (azaltılmış kopya)`,
    `${SCANS_FULL[of].title.en} (reduced copy)`,
  ),
  note: l(
    `${SCANS_FULL[of].note.tr} Uzaktan görülen heykeller için taramanın azaltılmış bir kopyası.`,
    `${SCANS_FULL[of].note.en} A reduced copy of the scan, for statues seen from afar.`,
  ),
});

export const SCANS: Record<ScanId, Scan> = {
  ...SCANS_FULL,
  "asklepios-lod": reduced("asklepios", "/scans/asklepios-lod.glb"),
  "tiberius-velatus-lod": reduced("tiberius-velatus", "/scans/tiberius-velatus-lod.glb"),
  "ephesus-portrait-lod": reduced("ephesus-portrait", "/scans/ephesus-portrait-lod.glb"),
  "caryatid-lod": reduced("caryatid", "/scans/caryatid-lod.glb"),
};

/**
 * Which scans each reconstruction shows: those set into the model, and those
 * that are only shown alongside it.
 */
export const SCANS_BY_RECONSTRUCTION: Partial<Record<string, ScanId[]>> = {
  "celsus-kutuphanesi": [
    "celsus-sophia",
    "celsus-arete",
    "muse-polyhymnia",
    "caryatid",
    "tiberius-velatus",
    "arringatore",
    "ephesus-portrait",
    "augustus",
    "athena-arezzo",
    "herm-thucydides-herodotus",
    "herm-plato",
    "herm-socrates-seneca",
    "herm-epicurus-metrodorus",
  ],
  "aspendos-tiyatrosu": [
    "augustus",
    "asklepios",
    "cybele",
    "amazon-wounded",
    "apollo-kitharoidos",
    "muse-thalia",
    "muse-clio",
    "neptune",
    "antinous",
    "nike",
    "pan",
    "herakles-lansdowne",
    "hermes-sandal",
    "muse-polyhymnia",
    "arringatore",
    "tiberius-velatus",
    "caryatid",
  ],
  "didyma-apollon-tapinagi": ["didyma-medusa", "tiberius-velatus", "arringatore"],
  "artemis-tapinagi": [
    "artemision-drum",
    "antinous",
    "cybele",
    "herakles-lansdowne",
    "muse-thalia",
    "magdalensberg-youth",
    "muse-clio",
    "tiberius-velatus",
    "nike",
    "amazon-wounded",
    "hermes-sandal",
    "penelope",
    "hadrian-troy",
    "caryatid",
    "arringatore",
  ],
  "pergamon-zeus-sunagi": [
    "pergamon-athena",
    "magdalensberg-youth",
    "penelope",
    "cybele",
    "augustus",
    "herakles-lansdowne",
    "nike",
    "muse-thalia",
    "amazon-wounded",
    "hermes-sandal",
    "antinous",
    "arringatore",
    "neptune",
    "athena-arezzo",
    "caryatid",
    "ephesus-portrait",
  ],
  "hierapolis-tiyatrosu": [
    "muse-polyhymnia",
    "augustus",
    "asklepios",
    "cybele",
    "amazon-wounded",
    "apollo-kitharoidos",
    "muse-thalia",
    "muse-clio",
    "neptune",
    "magdalensberg-youth",
    "nike",
    "pan",
    "herakles-lansdowne",
    "hermes-sandal",
    "antinous",
    "arringatore",
    "tiberius-velatus",
    "caryatid",
  ],
  "milet-buyuk-tiyatro": [
    "hadrian-troy",
    "asklepios",
    "cybele",
    "amazon-wounded",
    "apollo-kitharoidos",
    "muse-thalia",
    "penelope",
    "neptune",
    "magdalensberg-youth",
    "arringatore",
    "tiberius-velatus",
    "caryatid",
  ],
  "efes-yamac-evler": [
    "centaur",
    "glykon",
    "magdalensberg-youth",
    "efebo",
    "antinous",
    "tiberius-velatus",
  ],
  "efes-buyuk-tiyatro": [
    "amazon-wounded",
    "efebo",
    "muse-thalia",
    "penelope",
    "neptune",
    "magdalensberg-youth",
    "nike",
    "pan",
    "herakles-lansdowne",
    "hermes-sandal",
    "muse-polyhymnia",
    "hadrian-troy",
    "asklepios",
    "hermanubis",
    "apollo-kitharoidos",
    "arringatore",
    "tiberius-velatus",
    "caryatid",
    "ephesus-portrait",
  ],
  "side-tiyatrosu": [
    "neptune",
    "magdalensberg-youth",
    "nike",
    "pan",
    "herakles-lansdowne",
    "hermes-sandal",
    "muse-polyhymnia",
    "hadrian-troy",
    "asklepios",
    "cybele",
    "amazon-wounded",
    "apollo-kitharoidos",
    "muse-thalia",
    "penelope",
    "antinous",
    "arringatore",
    "tiberius-velatus",
    "ephesus-portrait",
    "caryatid",
  ],
  "aizanoi-zeus-tapinagi": [
    "neptune",
    "cybele",
    "herakles-lansdowne",
    "muse-thalia",
    "antinous",
    "hadrian-troy",
    "nike",
    "amazon-wounded",
    "hermes-sandal",
    "penelope",
    "arringatore",
    "caryatid",
    "tiberius-velatus",
  ],
  "halikarnas-mozolesi": [
    "mausoleum-amazon-1",
    "mausoleum-amazon-2",
    "lion-met",
    "asklepios-lod",
    "ephesus-portrait-lod",
    "tiberius-velatus-lod",
    "caryatid-lod",
    "tiberius-velatus",
    "arringatore",
  ],
  "aphrodisias-stadyumu": ["caryatid", "ephesus-portrait"],
  "perge-stadyumu": ["tiberius-velatus", "arringatore"],
  "nemrut-dogu-terasi": ["eagle", "lion-delos", "nemrut-head"],
};

export function scansFor(reconstructionId: string): ScanId[] {
  return SCANS_BY_RECONSTRUCTION[reconstructionId] ?? [];
}
