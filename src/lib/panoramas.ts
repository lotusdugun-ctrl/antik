import files from "./hd-files.json";
import type { Localized } from "./i18n";

/**
 * HD 360° views: panoramas rendered offline in Blender (Cycles) from a model
 * built for the purpose — real rock, carved fronts, painted interiors — far
 * past what the live 3D scene can draw on a phone. Each is an equirectangular
 * JPEG under /hd/<reconstruction>/, its centre the way to face first.
 *
 * Made by scripts/blender/<site>_hd.py --pano (KARANLIK-HD.bat on the PC).
 */
export type Panorama = {
  id: string;
  title: Localized;
  src: string;
  /** One line on what is seen from here. */
  note?: Localized;
  /** Credit for third-party works shown in the render (e.g. fresco photographs). */
  credit?: Localized;
};

const l = (tr: string, en: string): Localized => ({ tr, en });

export const PANORAMAS: Record<string, Panorama[]> = {};

// Karanlık Kilise manastırı, SAĞLAM DÖNEM (yaklaşık 1100), yapı kartı:
// docs/yapi-kartlari/karanlik-kilise.md; scripts/blender/karanlik_hd.py (KARANLIK-HD.bat).
const dir = "/hd/goreme-kaya-kiliseleri";
// The frescoes in the church are photographs from Wikimedia Commons, projected onto
// their walls (scripts/blender/karanlik-freskler.json lists each file and where it goes).
const FRESCO_CREDIT = l(
  "Fresk fotoğrafları: Jose Huwaidi, CC BY 4.0 (creativecommons.org/licenses/by/4.0), ve kamu malı fotoğraflar; Wikimedia Commons.",
  "Fresco photographs: Jose Huwaidi, CC BY 4.0 (creativecommons.org/licenses/by/4.0), and public-domain photographs; Wikimedia Commons.",
);
const GOREME: Panorama[] = [
  {
    id: "avlu",
    title: l("Manastır avlusu", "The monastery courtyard"),
    src: `${dir}/karanlik-360-avlu.jpg`,
    note: l(
      "Kayaya oyulmuş iki katlı cephe: kapılar, Malta haçlı 19 kör niş ve üstte revak, yapıldığı günkü gibi sağlam.",
      "The two-storey front cut in the rock: doors, 19 blind niches with Maltese crosses and the gallery above, whole as when it was made.",
    ),
  },
  {
    id: "ust-revak",
    title: l("Üst revak", "Upper gallery"),
    src: `${dir}/karanlik-360-ust-revak.jpg`,
    note: l(
      "Bugün ön duvarı çökmüş olan revak: sırayla kubbeli ve tonozlu bölmeler, kırmızı çizgili taş örgü taklidi.",
      "The gallery whose front wall has fallen today: domed and vaulted bays in turn, painted with red lines like masonry.",
    ),
  },
  {
    id: "narteks",
    title: l("Narteks", "Narthex"),
    src: `${dir}/karanlik-360-narteks.jpg`,
    note: l(
      "Beşik tonozlu giriş holü; kilisenin tek penceresi burada. Güneyde mezar odası, doğuda naosun kapısı.",
      "The barrel-vaulted entrance hall, with the church's only window; the tomb chamber to the south, the door to the nave to the east.",
    ),
    credit: FRESCO_CREDIT,
  },
  {
    id: "naos",
    title: l("Kilisenin içi", "Inside the church"),
    src: `${dir}/karanlik-360-naos.jpg`,
    note: l(
      "Dört sütun, beş kubbe, üç apsis; ışık yalnızca kandillerden. Apsiste Deesis, kuzeyde Doğum, güneyde Çarmıh.",
      "Four columns, five domes, three apses, lit only by oil lamps: the Deesis in the apse, the Nativity to the north, the Crucifixion to the south.",
    ),
    credit: FRESCO_CREDIT,
  },
  {
    id: "yemekhane",
    title: l("Yemekhane", "Refectory"),
    src: `${dir}/karanlik-360-yemekhane.jpg`,
    note: l(
      "Kayadan bırakılmış 15 metrelik taş masa ve sekiler; dipte apsis.",
      "The 15-metre table and benches left standing in the rock, with an apse at the far end.",
    ),
  },
];

// Celsus Kütüphanesi, SAĞLAM DÖNEM (yaklaşık MS 135): scripts/blender/celsus_hd.py (CELSUS-HD.bat).
const CELSUS: Panorama[] = [
  {
    id: "meydan",
    title: l("Kütüphanenin önünde", "Before the library"),
    src: "/hd/celsus-kutuphanesi/celsus-360-meydan.jpg",
    note: l(
      "Dokuz basamak, iki katlı mermer cephe, kapıların üstünde kafesli pencereler.",
      "Nine steps, the two-storey marble front, latticed windows over the doors.",
    ),
  },
  {
    id: "vestibul",
    title: l("Giriş holü", "The porch"),
    src: "/hd/celsus-kutuphanesi/celsus-360-vestibul.jpg",
  },
  {
    id: "salon",
    title: l("Okuma salonu", "The reading hall"),
    src: "/hd/celsus-kutuphanesi/celsus-360-salon.jpg",
    note: l(
      "16,7 × 10,9 m; duvarlarda kitap dolaplı nişler, iki kat galeri, karşıda apsis. Altında Celsus'un mezarı.",
      "16.7 × 10.9 m: book cupboards in the walls, two storeys of gallery, the apse ahead, and Celsus's tomb beneath it.",
    ),
  },
];

// Aspendos Tiyatrosu, SAĞLAM DÖNEM (yaklaşık MS 170–180): scripts/blender/aspendos_hd.py (ASPENDOS-HD.bat).
const ASPENDOS: Panorama[] = [
  {
    id: "orkestra",
    title: l("Orkestradan", "From the orchestra"),
    src: "/hd/aspendos-tiyatrosu/aspendos-360-orkestra.jpg",
  },
  {
    id: "ust-cavea",
    title: l("En üst sıralardan", "From the top rows"),
    src: "/hd/aspendos-tiyatrosu/aspendos-360-ust-cavea.jpg",
    note: l(
      "41 sıra, 59 kemerli galeri, gölgelik direkleri; karşıda iki katlı, kırk sütunlu sahne cephesi.",
      "41 rows, the gallery of 59 arches, the awning masts; opposite, the two-storey stage front of forty columns.",
    ),
  },
  {
    id: "sahne",
    title: l("Sahneden", "From the stage"),
    src: "/hd/aspendos-tiyatrosu/aspendos-360-sahne.jpg",
  },
];

// Pompeii, SAĞLAM DÖNEM (MS 79): scripts/blender/pompeii_hd.py (POMPEII-HD.bat).
const POMPEII: Panorama[] = [
  {
    id: "forum",
    title: l("Forum", "The forum"),
    src: "/hd/pompeii/pompeii-360-forum.jpg",
    note: l(
      "Kuzeyde Capitolium, batıda Basilika ve Apollo Tapınağı; forumun ortasında imparator kültünün sunağı.",
      "The Capitolium to the north, the Basilica and Temple of Apollo to the west, the imperial altar in the middle.",
    ),
  },
  {
    id: "tiyatro",
    title: l("Büyük tiyatro", "The Large Theatre"),
    src: "/hd/pompeii/pompeii-360-tiyatro.jpg",
    note: l(
      "Yamaca yaslanmış 5.000 kişilik cavea, önünde Yunan tarzı orkestra ve iki katlı sahne cephesi.",
      "A 5,000-seat cavea against the slope, its Greek orchestra below and a two-storey stage front beyond.",
    ),
  },
  {
    id: "amfi",
    title: l("Amfitiyatro", "The amphitheatre"),
    src: "/hd/pompeii/pompeii-360-amfi.jpg",
    note: l(
      "MS 70'te inşa edilen, bilinen en eski taş amfitiyatro: 135 × 104 m, arenası 67 × 35 m.",
      "The oldest known stone amphitheatre, built around AD 70: 135 × 104 m outside, an arena of 67 × 35 m.",
    ),
  },
];

// Eboracum (York), SAĞLAM DÖNEM (MS 3. yüzyıl): scripts/blender/eboracum_hd.py (EBORACUM-HD.bat).
const EBORACUM: Panorama[] = [
  {
    id: "kale",
    title: l("Lejyon kalesi", "The legionary fortress"),
    src: "/hd/eboracum/eboracum-360-kale.jpg",
    note: l(
      "VI. Victrix lejyonunun karargâhı: principia, komutan sarayı ve taş surlar; kuzeyde York Minster'ın bulunduğu yerde.",
      "The headquarters of Legio VI Victrix: the principia, the commander's house and stone walls, where York Minster now stands.",
    ),
  },
  {
    id: "baths",
    title: l("Lejyon hamamları", "The legionary baths"),
    src: "/hd/eboracum/eboracum-360-baths.jpg",
    note: l(
      "Frigidarium, tepidarium ve caldarium'un sıralandığı hamam; yerden ısıtma kanalları ve tonozlu salonlar.",
      "The bath suite through cold, warm and hot rooms, its hypocaust channels and vaulted halls.",
    ),
  },
  {
    id: "forum",
    title: l("Kent forumu", "The town forum"),
    src: "/hd/eboracum/eboracum-360-forum.jpg",
    note: l(
      "Kalenin güneyinde, Ouse kıyısında büyüyen sivil yerleşim; dükkânlar, tapınak ve liman.",
      "The civilian town that grew south of the fortress by the Ouse: shops, a temple and the river port.",
    ),
  },
];

// Nemausus (Nimes), SAĞLAM DÖNEM (MS 2. yüzyıl): scripts/blender/nimes_hd.py (NIMES-HD.bat).
const NIMES: Panorama[] = [
  {
    id: "arena",
    title: l("Arena", "The arena"),
    src: "/hd/nimes/nimes-360-arena.jpg",
    note: l(
      "133 × 101 m'lik oval, 21 m yüksekliğinde iki katlı kemerli dış duvar ve 24.000 seyirci.",
      "The 133 × 101 m oval, its two-storey arcade 21 m high, and 24,000 spectators.",
    ),
  },
  {
    id: "maison",
    title: l("Maison Carrée", "The Maison Carrée"),
    src: "/hd/nimes/nimes-360-maison.jpg",
    note: l(
      "MS 2'de Augustus'un torunları için yapılan Korint düzeninde tapınak; 26 × 13 m, altı sütunlu cephe.",
      "The Corinthian temple built about AD 2 for Augustus' grandsons: 26 × 13 m, a six-column front.",
    ),
  },
  {
    id: "temple",
    title: l("Diana Tapınağı", "The Temple of Diana"),
    src: "/hd/nimes/nimes-360-temple.jpg",
    note: l(
      "Fontaine d'Eure kaynağının yanındaki tonozlu salon ve nişler; kentin su sisteminin bir parçası.",
      "The vaulted hall and niches beside the Fontaine d'Eure, part of the city's water system.",
    ),
  },
];

// Augusta Treverorum (Trier), SAĞLAM DÖNEM (MS 4. yüzyıl): scripts/blender/trier_hd.py (TRIER-HD.bat).
const TRIER: Panorama[] = [
  {
    id: "porta",
    title: l("Porta Nigra", "The Porta Nigra"),
    src: "/hd/trier/trier-360-porta.jpg",
    note: l(
      "Kuzey kapısı: iki kemerli geçit, dört kule ve gri kumtaşından 30 m'lik cephe.",
      "The north gate: two arched passages, four towers, a 30 m front of grey sandstone.",
    ),
  },
  {
    id: "amfi",
    title: l("Amfitiyatro", "The amphitheatre"),
    src: "/hd/trier/trier-360-amfi.jpg",
    note: l(
      "Tepenin içine oyulmuş cavea, 145 × 120 m; arena tabanının altında hücreler ve asansör kuyusu.",
      "A cavea cut into the hill, 145 × 120 m, with cells and a lift shaft beneath the arena floor.",
    ),
  },
  {
    id: "forum",
    title: l("Konstantin Bazilikası", "The Basilica of Constantine"),
    src: "/hd/trier/trier-360-forum.jpg",
    note: l(
      "67 × 33 m'lik tek nefli tören salonu; 30 m'lik duvarlar, büyük pencereler ve ahşap kirişli tavan.",
      "The 67 × 33 m single-nave audience hall: 30 m walls, great windows and a timber-coffered ceiling.",
    ),
  },
];

// Listed only once the renders are in public/hd: hd-files.json names the files there.
const ALL: Record<string, Panorama[]> = {
  "goreme-kaya-kiliseleri": GOREME,
  "celsus-kutuphanesi": CELSUS,
  "aspendos-tiyatrosu": ASPENDOS,
  pompeii: POMPEII,
  "pompeii-kenti": POMPEII,
  eboracum: EBORACUM,
  "eboracum-kenti": EBORACUM,
  nimes: NIMES,
  "nimes-kenti": NIMES,
  trier: TRIER,
  "trier-kenti": TRIER,
};
const present = new Set<string>(files as string[]);
for (const [id, list] of Object.entries(ALL)) {
  const ready = list.filter((p) => present.has(p.src));
  if (ready.length) PANORAMAS[id] = ready;
}

export function panoramasFor(id: string): Panorama[] {
  return PANORAMAS[id] ?? [];
}
