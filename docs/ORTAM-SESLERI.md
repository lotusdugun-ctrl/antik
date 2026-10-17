# 3D modellerde ortam sesleri

Her 3D model açıldığında o yerin sesi çalar: varsayılan olarak **açık**. Tarayıcılar,
ziyaretçi sayfaya dokunmadan ses çalınmasına izin vermez; bu yüzden ses ilk dokunuş,
tıklama ya da tuşla başlar. "Ortam sesini kapat" düğmesiyle kapatılır ve bu tercih
tarayıcıda hatırlanır. Anlatım başlayınca ses kısılır; sekme arka plana geçince durur.

## Hangi modelde ne duyulur

| Model                                                | Ses                                                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Tiyatrolar (Aspendos, Efes, Hierapolis, Milet, Side) | Seyirci uğultusu, oyun başlarken susma, sahneden aulos/lir ya da oyuncunun sesi (Sofokles, Aristophanes), ardından alkış, kahkaha, "Εὖγε!" |
| Stadyumlar (Aphrodisias, Perge)                      | Kalabalık, haberci ("Ἀκούετε, λεῴ!"), salpinx borusu, dörtnala geçen arabalar ya da koşucular, tezahürat, alkış, "Νίκα!", Pindaros         |
| Artemis, Didyma, Aizanoi, Pergamon                   | Kuşlar, sunak ateşi, kurbanlık sığır ve koyun, alay geçerken aulos ve davul, tanrının ilahisi; Didyma'da taş ustaları                      |
| Celsus meydanı                                       | Pazar, çeşme, ayak sesleri, satıcılar, demirci ve testere, güvercinler                                                                     |
| Yamaç Evler                                          | Avlu çeşmesi, duvarın ardında sokak, ev içinde sesler, akşam lir                                                                           |
| Mozole                                               | Deniz, liman, martılar, tersane, ağıt (İlyada 24) ve uzaktan cenaze aulosu                                                                 |
| Nemrut                                               | Sert dağ rüzgârı, kuzgunlar, ateş, ağır davul, Antiokhos'un yazıtı                                                                         |
| Göbeklitepe                                          | Bozkır rüzgârı, tarlakuşları, taş yontma, uzak sesler, ateş; yalnızca davul ve çıngırak — Yunanca yok                                      |

Gün batımında kalabalık azalır; gece pazar ve seyirci susar, cırcır böcekleri ve
baykuş (Otus scops) duyulur.

## Seslerin kaynağı

- Kayıtlar `public/ambience/` içinde (≈2,1 MB, MP3). Kaynaklar ve lisanslar:
  `public/ambience/CREDITS.txt` (0 A.D. – CC BY-SA 3.0; ESC-50/freesound, Minetest,
  Sonic Pi – CC0). Nasıl üretildikleri: `scripts/build_ambience.py`.
- Rüzgâr, ağustos böcekleri, kıvılcımlar, araba tekerleri, kuş çağrıları, salpinx,
  çıngırak ve yankı tarayıcıda üretilir (`src/lib/ambience.ts`).
- Hangi modelin neyi çaldığı: `src/lib/soundscapes.ts`.

## Yunanca konuşmaları kaydetmek

Oyuncu, haberci, ilahiler, satıcılar ve ağıt Microsoft Edge'in ücretsiz Yunanca
sesleriyle kaydedilir. Proje klasöründe **ORTAM-SESLERI.bat** dosyasını çift tıklayın:
Python ve edge-tts'i kurar, 27 kısa kaydı `public/ambience/voices/` klasörüne yazar ve
GitHub'a gönderir. Kayıtlar yokken de sesler çalışır; yalnızca konuşmalar duyulmaz.
