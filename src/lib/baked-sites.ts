/**
 * Pişmiş ışıklı modeli web'de hazır olan yerler (dosyalar: public/baked/<id>/).
 * Yeni bir yer eklemek: `bash scripts/glb/web_pack.sh <Unity Baked klasörü> <id>` ve buraya id.
 * Kalan pişmiş yerler (paketlendi, henüz gönderilmedi): bkz. DEVAM-NOTU.md.
 */
export const BAKED_SITES: readonly string[] = [
  "celsus-kutuphanesi",
  "aspendos-tiyatrosu",
  "gobeklitepe-d-yapisi",
  "ayasofya-ana-kubbe",
  "termessos-tiyatrosu",
  "hierapolis-tiyatrosu",
  "nemrut-dogu-terasi",
  "pergamon-zeus-sunagi",
  "side-tiyatrosu",
];
