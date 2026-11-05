/**
 * Renders of the 3D buildings, used as their cover image (`public/posters/<id>.jpg`).
 * Captured from the live 3D view at 1600×1000 with labels off; a building
 * without one falls back to its site's photograph.
 */
// prettier-ignore
const POSTERS: ReadonlySet<string> = new Set<string>([
  "aizanoi-zeus-tapinagi",
  "alacahoyuk-sfenksli-kapi",
  "ani-katedrali",
  "antalya-hadrianus-kapisi",
  "aphrodisias-stadyumu",
  "aphrodisias-tetrapylon",
  "arslantepe-saray",
  "artemis-tapinagi",
  "aspendos-sifon-koprusu",
  "aspendos-tiyatrosu",
  "assos-athena-tapinagi",
  "ayasofya-ana-kubbe",
  "catalhoyuk-dogu-hoyugu",
  "celsus-kutuphanesi",
  "derinkuyu-yeralti-sehri",
  "didyma-apollon-tapinagi",
  "divrigi-ulu-camii",
  "efes-buyuk-tiyatro",
  "efes-hadrianus-tapinagi",
  "efes-yamac-evler",
  "galata-kulesi",
  "gobeklitepe-d-yapisi",
  "goreme-kaya-kiliseleri",
  "halikarnas-mozolesi",
  "hattusa-aslanli-kapi",
  "hierapolis-tiyatrosu",
  "karahan-tepe-yapisi",
  "kaunos-kaya-mezarlari",
  "ksanthos-nereidler-aniti",
  "laodikeia-bati-tiyatrosu",
  "letoon-leto-tapinagi",
  "magnesia-artemis-tapinagi",
  "milet-buyuk-tiyatro",
  "myra-kaya-mezarlari",
  "nemrut-dogu-terasi",
  "patara-deniz-feneri",
  "pergamon-trajan-tapinagi",
  "pergamon-zeus-sunagi",
  "perge-stadyumu",
  "priene-athena-tapinagi",
  "sagalassos-antoninler-cesmesi",
  "sardes-artemis-tapinagi",
  "selimiye-camii",
  "side-apollon-tapinagi",
  "side-tiyatrosu",
  "suleymaniye-camii",
  "sumela-manastiri",
  "termessos-tiyatrosu",
  "troya-vi-surlari",
  "yerebatan-sarnici",
  "zeugma-villa",
]);

export function posterFor(id: string): string | undefined {
  return POSTERS.has(id) ? `/posters/${id}.jpg` : undefined;
}
