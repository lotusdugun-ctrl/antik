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

- Kayıtlar `public/ambience/` içinde (MP3). Hepsi ya kamu malı (CC0: ESC-50/freesound,
  Minetest, Sonic Pi) ya da bu uygulama için sentezlendi (kalabalık uğultusu, pazar
  konuşmaları, nal sesleri, kişnemeler, örs, keski, aulos ve lir). Ayrıntı:
  `public/ambience/CREDITS.txt`; nasıl üretildikleri: `scripts/build_ambience.py`.
  (Eskiden kullanılan 0 A.D. kayıtları CC BY-SA olduğu için kaldırıldı.)
- Rüzgâr, ağustos böcekleri, kıvılcımlar, araba tekerleri, kuş çağrıları, salpinx,
  çıngırak ve yankı tarayıcıda üretilir (`src/lib/ambience.ts`).
- Hangi modelin neyi çaldığı: `src/lib/soundscapes.ts`.

## Yunanca konuşmaları kaydetmek

Oyuncu, haberci, ilahiler, satıcılar ve ağıt açık kaynak **Piper** sesiyle, sizin
bilgisayarınızda kaydedilir — ama yalnızca Yunanca sesin lisansı ticari kullanıma izin
veriyorsa (bkz. `docs/SESLER.md`). **SESLENDIR.bat** bunu da yapar; yalnızca bunlar için
**ORTAM-SESLERI.bat** çalıştırılabilir. Kayıtlar yokken de sesler çalışır; yalnızca
konuşmalar duyulmaz.
