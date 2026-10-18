# Sesli rehber ve Yunanca konuşmalar: Piper ve lisans kontrolü

## Neden değişti

Eski kayıtlar Microsoft Edge'in "Sesli oku" seslerinden (edge-tts) alınmıştı. Microsoft o
hizmetin çıktısını bir uygulamada yeniden dağıtmaya izin vermiyor; Google Play'de ticari
bir uygulama için bu bir risk. Bu yüzden **bütün Edge kayıtları silindi**. Yeni kayıtlar
yapılana kadar uygulama her dilde **cihazın kendi sesiyle** okur (Web Speech API); bu
her zaman çalışan yedek yoldur.

## Yeni yol: Piper, sizin bilgisayarınızda

[Piper](https://github.com/OHF-Voice/piper1-gpl) açık kaynak bir konuşma motorudur; kart,
hesap ya da anahtar gerekmez, kayıtlar sizin bilgisayarınızda yapılır. Motorun kendi
lisansı (GPL) yalnızca programı kapsar; ürettiği ses dosyaları uygulamaya kod olarak
girmez.

Asıl soru **sesin** lisansıdır: her Piper sesi birinin kayıtlarıyla eğitilmiş bir
modeldir ve o kayıtların (veri setinin) lisansı neye izin veriyorsa o kadarı serbesttir.
Her sesin Hugging Face'te bir `MODEL_CARD` dosyası vardır; veri setini ve lisansını yazar.

## Lisans kontrolü (otomatik)

`scripts/piper_voices.py` her aday ses için MODEL_CARD'ı indirir, lisans satırını okur
ve sesi **yalnızca** lisans şu listedeyse kullanır:

- Kamu malı / CC0, CC BY 4.0, CC BY 3.0, MIT, Apache-2.0

Şunlar **reddedilir**: NonCommercial (NC), NoDerivatives (ND), ShareAlike (SA/GPL),
"araştırma amaçlı", okunamayan ya da hiç yazılmamış lisans. Bir ses başka bir sesten
"fine-tune" edildiyse o sesin lisansı da kontrol edilir (ör. lessac veri seti ticari
kullanıma kapalı olduğu için ondan türeyen sesler de reddedilir).

Program her adayı bir tabloda gösterir: **SECILDI / uygun / RED** ve nedeni. Seçilen
sesin adı, veri seti ve lisansı `src/lib/voice-credits.json` dosyasına yazılır;
uygulamanın "Görsel ve ses künyeleri" sayfası (`/gorseller`) bunu gösterir.

Bir dil için uygun ses yoksa o dilde kayıt yapılmaz; uygulama o dili cihazın sesiyle okur.

## Ne çalıştırılır

| Dosya                 | Ne yapar                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SES-ORNEKLERI.bat** | Lisansı uygun her sesle aynı kısa metni okutur, `scripts\ses-ornekleri\` klasörünü açar. Dinleyip seçmek için.                                                                                                                       |
| **SESLENDIR.bat**     | Python + Piper'ı kurar, lisans kontrolünü yapar, eski (Edge) kayıtları `public/audio`, `..\antik-audio` ve `public/ambience/voices`'tan siler, tr/en/de/ru rehberi ve Yunanca konuşmaları kaydeder, iki depoyu da GitHub'a gönderir. |
| **ORTAM-SESLERI.bat** | Yalnızca 3D modellerin Yunanca konuşmalarını (aynı kontrolle) kaydeder ve gönderir.                                                                                                                                                  |

Uzun sürer (binlerce bölüm); yarıda kalırsa SESLENDIR.bat'ı yeniden çalıştırın, kaldığı
yerden devam eder. Belirli bir sesi tercih etmek için (kontrolden geçmesi şartıyla):
`python scripts\generate_audio_piper.py --voice-tr fahrettin`.

## Güvenceler

- Uygulama yalnızca `engine: "piper"` yazan ve `voice-credits.json`'daki sesle yapılmış
  kayıtları çalar; eski bir liste yeniden gelse bile Edge kayıtları çalınmaz.
- Telaffuz için metinler `scripts/export-audio-script.ts`'in "speech" alanından gelir:
  kısaltmalar (MÖ, MS, km…) açık yazılır; düz metindir, Edge'e özgü işaretleme yoktur.
