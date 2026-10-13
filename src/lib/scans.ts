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
  | "arringatore";

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

export const SCANS: Record<ScanId, Scan> = {
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
};

/**
 * Which scans each reconstruction shows: those set into the model, and those
 * that are only shown alongside it.
 */
export const SCANS_BY_RECONSTRUCTION: Partial<Record<string, ScanId[]>> = {
  "celsus-kutuphanesi": ["celsus-sophia", "celsus-arete", "arringatore", "athena-arezzo"],
  "aspendos-tiyatrosu": ["arringatore"],
  "didyma-apollon-tapinagi": ["didyma-medusa"],
  "artemis-tapinagi": ["artemision-drum", "arringatore"],
  "pergamon-zeus-sunagi": ["pergamon-athena", "athena-arezzo", "neptune", "arringatore"],
  "hierapolis-tiyatrosu": ["neptune", "arringatore"],
  "milet-buyuk-tiyatro": ["neptune", "arringatore"],
  "efes-buyuk-tiyatro": ["arringatore", "neptune"],
  "side-tiyatrosu": ["arringatore", "neptune"],
  "aizanoi-zeus-tapinagi": ["neptune", "arringatore"],
  "halikarnas-mozolesi": ["mausoleum-amazon-1", "mausoleum-amazon-2"],
  "nemrut-dogu-terasi": ["nemrut-head"],
};

export function scansFor(reconstructionId: string): ScanId[] {
  return SCANS_BY_RECONSTRUCTION[reconstructionId] ?? [];
}
