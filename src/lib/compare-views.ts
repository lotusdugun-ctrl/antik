import files from "./hd-files.json";
import type { Localized } from "./i18n";

/**
 * "Today / when it stood": the same view twice, a photograph of the ruin as it is
 * and our render of the building whole (scripts/blender/<site>_hd.py, view named
 * `kiyas`, rendered from about where the photographer stood). The photographs are
 * Commons files with a credit in photo-credits.ts; a pair is listed only once its
 * render is in public/hd (hd-files.json).
 */
export type CompareView = {
  id: string;
  title: Localized;
  /** Commons photograph of the site today. */
  today: string;
  /** Our render of the same view, the building intact. */
  intact: string;
  note?: Localized;
};

const l = (tr: string, en: string): Localized => ({ tr, en });

const ALL: Record<string, CompareView[]> = {
  "goreme-kaya-kiliseleri": [
    {
      id: "karanlik-dis",
      title: l("Karanlık Kilise manastırı", "The Dark Church monastery"),
      today: "https://upload.wikimedia.org/wikipedia/commons/8/86/Karanl%C4%B1k_Kilise.JPG",
      intact: "/hd/goreme-kaya-kiliseleri/karanlik-kiyas-dis.jpg",
      note: l(
        "Bugün alt revakın tavanı ve üst revakın ön duvarı çökmüş; sağlamken avlu iki katlı, kapalı bir cepheyle çevriliydi.",
        "Today the lower porch roof and the upper gallery's front wall have fallen; whole, the courtyard was closed by a two-storey front.",
      ),
    },
  ],
  "celsus-kutuphanesi": [
    {
      id: "celsus-cephe",
      title: l("Celsus Kütüphanesi cephesi", "The front of the Library of Celsus"),
      today: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Library_of_Celsus_%2820017181915%29.jpg",
      intact: "/hd/celsus-kutuphanesi/celsus-kiyas-cephe.jpg",
      note: l(
        "Bugünkü cephe 1970–78'de yeniden dikildi; arkasındaki okuma salonu yıkık. Sağlamken salonun çatısı, kapıları ve pencereleri yerindeydi.",
        "The front standing today was re-erected in 1970–78; the reading hall behind it is a ruin. Whole, the hall had its roof, doors and windows.",
      ),
    },
  ],
  "aspendos-tiyatrosu": [
    {
      id: "aspendos-sahne",
      title: l("Aspendos'un sahnesi", "The stage at Aspendos"),
      today: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Aspendos_teatro_romano_-_panoramio.jpg",
      intact: "/hd/aspendos-tiyatrosu/aspendos-kiyas-sahne.jpg",
      note: l(
        "Bugün sahne cephesinin yalnızca duvarı ayakta; sağlamken önünde iki katta kırk sütun ve üstünde eğimli ahşap bir çatı vardı.",
        "Today only the wall of the stage front stands; whole, forty columns rose before it in two storeys, under a sloping wooden roof.",
      ),
    },
  ],
};

const present = new Set<string>(files as string[]);

export function compareViewsFor(id: string): CompareView[] {
  return (ALL[id] ?? []).filter((v) => present.has(v.intact));
}
