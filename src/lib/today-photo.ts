import { creditFor } from "@/lib/photo-credits";
import type { Reconstruction } from "@/lib/reconstructions";
import { coverImage, getSite, hasOwnPhoto } from "@/lib/sites";
import { structurePhotoFor } from "@/lib/structure-photos";

/**
 * The photograph of what stands there today, for the "today and in
 * antiquity" slider — only ever a photo the app already shows with its
 * licence and author (`photo-credits`), never a new one.
 *
 * First the photo of the structure itself. Where there is none, the site's
 * own cover photo, but only when its file name names the place (the site or
 * the structure) and not a museum, a find or a model — the ruins as they
 * are, not a necklace in a case. Where neither will do there is no slider,
 * rather than the wrong picture.
 */

const NOT_THE_RUINS =
  /museum|müze|muze|model|reconstruct|rekonstr|engraving|mosaic|mozaik|statue|heykel|relief|necklace|coin|sikke|vase|ivory|fildişi|drawing|plan|map|harita|stele|sarcophag|lahit|inscription|yazıt|tablet|bust/i;

/** Lower-case letters and digits only, Turkish letters folded to Latin. */
export function fold(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function fileName(url: string): string {
  const last = url.split("/").pop() ?? "";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/** Whether a photo's file name says it shows this place as it stands. */
export function namesThePlace(url: string, words: string[]): boolean {
  const name = fileName(url);
  if (NOT_THE_RUINS.test(name)) return false;
  const folded = fold(name);
  return words.some((word) => word.length >= 5 && folded.includes(word));
}

/** Kinds of building a photo's file name can name; a different one is another building. */
const BUILDINGS = [
  "theatre",
  "theater",
  "tiyatro",
  "library",
  "temple",
  "tapinak",
  "agora",
  "stadium",
  "stadyum",
  "bath",
  "hamam",
  "gate",
  "kapi",
  "aqueduct",
  "basilica",
  "church",
  "kilise",
  "altar",
  "sunak",
  "odeon",
  "bouleuterion",
  "nymphaeum",
  "tomb",
  "mausoleum",
  "castle",
  "kale",
];

/** Whether a photo's name points at a different building from the one modelled. */
function namesAnotherBuilding(url: string, item: Reconstruction): boolean {
  const name = fold(fileName(url));
  const own = fold(`${item.structure.en} ${item.structure.tr} ${item.title.en}`);
  return BUILDINGS.some((word) => name.includes(word) && !own.includes(word));
}

export function todayPhotoFor(item: Reconstruction): string | undefined {
  const own = structurePhotoFor(item.siteSlug, item.structure.tr);
  // A curated structure photo may still be of a museum model of it.
  if (own && creditFor(own) && !NOT_THE_RUINS.test(fileName(own))) return own;
  const site = getSite(item.siteSlug);
  if (!site || !hasOwnPhoto(site)) return undefined;
  const cover = coverImage(site);
  if (!creditFor(cover)) return undefined;
  const words = [
    fold(item.siteSlug),
    fold(item.structure.en),
    fold(item.structure.tr),
    fold(site.name.en),
    fold(site.name.tr),
  ];
  return namesThePlace(cover, words) && !namesAnotherBuilding(cover, item) ? cover : undefined;
}
