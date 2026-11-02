import type { Localized } from "./i18n";

/**
 * "How do we know?": for each HD reconstruction, what rests on a source (K), what is
 * seen in the building today (F) and what is our reasoned guess (T), with the sources.
 * Kept in step with the build cards in docs/yapi-kartlari/<site>.md.
 */
export type Basis = "kaynak" | "fotograf" | "tahmin";
export type Claim = { basis: Basis; text: Localized };
export type Evidence = { claims: Claim[]; sources: string[] };

const l = (tr: string, en: string): Localized => ({ tr, en });
const K = (tr: string, en: string): Claim => ({ basis: "kaynak", text: l(tr, en) });
const F = (tr: string, en: string): Claim => ({ basis: "fotograf", text: l(tr, en) });
const T = (tr: string, en: string): Claim => ({ basis: "tahmin", text: l(tr, en) });

export const EVIDENCE: Record<string, Evidence> = {
  "goreme-kaya-kiliseleri": {
    claims: [
      K("Kilise, 5 × 14 m'lik bir avlusu olan, kayaya oyulmuş bir manastırın parçası; kuzeyden kavisli bir merdivenle narteksine çıkılır.", "The church belongs to a rock-cut monastery with a courtyard of about 5 × 14 m; a curving stair on the north leads up to its narthex."),
      K("Avlu cephesinde Malta haçlı 19 kör niş; alt revakın tavanı ve üst revakın ön duvarı sonradan çöktü.", "The courtyard front has 19 blind niches with Maltese crosses; the lower porch roof and the upper gallery's front fell later."),
      K("Naos: dört sütun, beş kubbe, üç apsis; yemekhanede 15 m'lik taş masa.", "Nave: four columns, five domes, three apses; in the refectory, a 15 m stone table."),
      F("Fresk sahneleri gerçek fotoğraflardan, bugünkü yerlerine konuldu.", "The fresco scenes are photographs of the real paintings, placed where they are today."),
      T("Ölçüler fotoğraflardan insan boyuna göre çıkarıldı (±%25); yayımlanmış ölçekli plana henüz ulaşılamadı.", "Measurements were scaled from photographs against people (±25%); the published plan has not yet been consulted."),
      T("Çöken revakların pencere yerleri ve kandil ışığı canlandırma.", "Window positions in the fallen galleries and the oil-lamp lighting are reconstructions."),
    ],
    sources: [
      "T.C. Kültür ve Turizm Bakanlığı, muze.gov.tr: Karanlık Kilise",
      "cappadociahistory.com: Dark Church (Karanlık Kilise)",
      "L. Rodley, Cave Monasteries of Byzantine Cappadocia (1985)",
    ],
  },
  "celsus-kutuphanesi": {
    claims: [
      K("Cephe 21 m geniş, 16 m'den yüksek; dokuz basamak, 2,4 m derin giriş holü, üç kapı (ortadaki en geniş).", "The front is 21 m wide and over 16 m high: nine steps, a porch 2.4 m deep, three doors with the middle one widest."),
      K("Alt katta dört çift kompozit sütun ve erdem heykelleri için dört niş; üst katta kapıların üstünde üç çift sütun.", "Below, four pairs of composite columns and four niches for the Virtues; above, three pairs of columns over the doors."),
      K("Okuma salonu 16,7 × 10,9 m; 0,94 m'lik kürsü, 2,55 m yüksek kitap nişleri, apsis ve altında Celsus'un mezarı.", "The reading hall is 16.7 × 10.9 m: a 0.94 m podium, book niches 2.55 m high, the apse, and Celsus's tomb beneath it."),
      T("Kat yükseklikleri, sütun aralıkları ve tavandaki göz canlandırma.", "Storey heights, column spacing and the ceiling's opening are reconstructions."),
      T("Heykeller lisansı uygun tarama bulunamadığı için gösterilmiyor.", "The statues are not shown: no scan with a suitable licence was found."),
    ],
    sources: [
      "W. Wilberg vd., Forschungen in Ephesos V.1: Die Bibliothek (1953)",
      "Avusturya Bilimler Akademisi (ÖAW/ÖAI)",
      "F. Hueber, V. M. Strocka, Antike Welt 6 (1975)",
    ],
  },
  "aspendos-tiyatrosu": {
    claims: [
      K("Çap 96 m, orkestra 23,9 m; 41 sıra, tek ara koridor, altta 10 ve üstte 21 merdiven.", "96 m across, the orchestra 23.9 m; 41 rows, one gangway, 10 stairs below and 21 above."),
      K("Sahne cephesi 15,7 m: iki kat, katta 20 sütun (altta İon, üstte Korint), beş kapı, ortada Dionysos kabartmalı alınlık.", "The stage front, 15.7 m: two storeys of 20 columns (Ionic, then Corinthian), five doors, and a pediment with Dionysus at the centre."),
      K("Sahnenin üstünde eğimli ahşap çatı; en üstte 59 kemerli galeri ve gölgelik için direkler.", "A sloping wooden roof over the stage; at the top, the gallery of 59 arches and masts for the awning."),
      T("Sütun aralıkları, kat oranları ve gölgeliğin açıklığı canlandırma.", "Column spacing, storey proportions and how far the awning is drawn are reconstructions."),
    ],
    sources: [
      "F. Sear, Roman Theatres: An Architectural Study (2006)",
      "Whitman College, Ancient Theatre Archive: Aspendus (Heffernan 2003)",
      "M. Bieber, The History of the Greek and Roman Theater (1939)",
    ],
  },
};

export function evidenceFor(id: string): Evidence | undefined {
  return EVIDENCE[id];
}
