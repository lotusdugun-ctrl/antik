# Rehbere sor — yapay zekâ rehberi kurulumu

Kent sayfalarındaki **Rehbere sor** kutusu soruları Google Gemini ile cevaplar.
Model iki kaynağa dayanır:

1. **Uygulamanın kendi verisi** (kentin özeti, tarihi, yapıları, bilgi
   notları, 3D ölçüler, ilgili uygarlıklar ve kişiler) — birincil kaynak;
   cevaplar sayfadaki bilgilerle tutarlıdır.
2. **Google Arama ile temellendirme (Search grounding)** — uygulamada olmayan
   her şey için: güncel açılış saatleri ve ücretler, yeni kazılar/haberler,
   daha derin tarih, yakındaki yerler, ulaşım ve gezi ipuçları,
   karşılaştırmalar, genel Anadolu tarihi/arkeolojisi soruları. Bu durumda
   cevabın altında **Kaynaklar:** başlığıyla en fazla 4 bağlantı görünür
   (yeni sekmede açılır).

Rehber artık yalnızca bu kenti değil, genel tarih, kültür ve gezi sorularını da
cevaplar; zararlı ya da tamamen alakasız (ör. kod yazdırma) istekleri kibarca
geri çevirir. Varsayılan cevap 3–8 cümledir; ziyaretçi daha fazlasını isterse
uzar. Fiyat ve saatlerde değişebileceğini söyler ve kaynağını belirtir.

Anahtar yoksa, kota dolduysa, istek zaman aşımına uğradıysa ya da kullanıcı
çevrimdışıysa kutu yine çalışır: cevabı anında yerel eşleştirici
(`src/lib/ask.ts`) verir ve altında **Çevrimdışı yanıt** notu görünür.

## 1. Ücretsiz Gemini API anahtarı alın

1. <https://aistudio.google.com/apikey> adresine Google hesabınızla girin.
2. **Create API key** (API anahtarı oluştur) düğmesine basın; gerekirse yeni
   bir Google Cloud projesi seçin/oluşturun.
3. Oluşan anahtarı kopyalayın. Bu anahtar bir paroladır: kimseyle paylaşmayın,
   koda, ekran görüntüsüne ya da GitHub'a koymayın.

## 2. Vercel'e ortam değişkeni olarak ekleyin

1. Vercel'de projeyi açın → **Settings** → **Environment Variables**.
2. Şu değişkeni ekleyin:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** kopyaladığınız anahtar
   - **Environments:** `Production` ve `Preview` kutularını işaretleyin.
3. İsteğe bağlı: `GEMINI_MODEL` (varsayılan `gemini-3.5-flash-lite`). Başka bir
   Gemini modeli kullanmak isterseniz buraya adını yazın. Seçilen modelin
   kotası dolar, model meşgul olur ya da adı artık yoksa sunucu sırayla
   `gemini-flash-lite-latest` ve `gemini-flash-latest` modellerini dener
   (ücretsiz katmanda her modelin kendi günlük kotası vardır). Arama
   kotası dolduğunda da aynı model önce aramasız denenir. Vercel
   kayıtlarında (Logs) `[api/sor] gemini busy (429, RESOURCE_EXHAUSTED,
   ...FreeTier ...)` gibi satırlar hangi kotanın dolduğunu gösterir.
4. İsteğe bağlı: `GEMINI_SEARCH` — Google Arama temellendirmesi. Varsayılan
   **açık**; kapatmak için değeri `off` (ya da `0`, `false`, `no`) yapın ve
   yeniden dağıtın. Kapalıyken rehber yalnızca uygulama verisi ve genel
   bilgisiyle cevaplar, kaynak bağlantısı göstermez.
5. Değişkenler yalnızca yeni dağıtımlarda geçerli olur: **Deployments**
   sekmesinden son dağıtımın menüsünden **Redeploy** deyin.

> Önemli: Değişkenin adı `VITE_` ile **başlamamalı**. `VITE_` önekli
> değişkenler tarayıcıya gönderilen koda gömülür; anahtar herkese açık olur.
> Anahtar yalnızca sunucudaki `/api/sor` uç noktasında okunur.

## 3. Yerelde çalıştırma

```bash
cp .env.example .env      # .env git'e girmez (.gitignore)
# .env içine GEMINI_API_KEY=... yazın
bun run dev
```

## 4. Test etme

- Bir kent sayfasını açın (ör. `/kent/efes`), kutuya bir soru yazıp Enter'a
  basın. Cevabın altında **Yapay zekâ rehber** yazıyorsa model cevaplamıştır;
  **Çevrimdışı yanıt** yazıyorsa yerel yedek devrededir.
- Uç noktayı doğrudan denemek için:

```bash
curl -X POST https://ALAN-ADINIZ/api/sor \
  -H 'content-type: application/json' \
  -d '{"question":"Efes ne zaman kuruldu?","slug":"efes","lang":"tr"}'
```

| Cevap                                                                      | Anlamı                                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `200 {"answer": "...", "source": "ai", "sources": [...], "search": "..."}` | Her şey yolunda (aşağıya bakın).                                                    |
| `503 {"error": "not_configured"}`                                          | `GEMINI_API_KEY` tanımlı değil ya da yeniden dağıtım yapılmadı.                     |
| `503 {"error": "busy"}`                                                    | Gemini kotası/dakikalık sınır doldu ya da model meşgul; biraz sonra tekrar deneyin. |
| `502 {"error": "failed"}`                                                  | Anahtar geçersiz, model adı yanlış, zaman aşımı veya güvenlik engeli.               |
| `429 {"error": "rate_limited"}`                                            | Aynı IP'den çok fazla soru (aşağıya bakın).                                         |
| `400 {"error": "bad_request"}`                                             | Geçersiz istek (boş/500 karakterden uzun soru, bilinmeyen dil veya kent).           |
| `403 {"error": "forbidden"}`                                               | İstek başka bir siteden geldi.                                                      |

Hiçbir hata cevabı anahtarı ya da Google'ın ham hata metnini içermez.

Başarılı cevaptaki alanlar:

- `searchEntryPoint` (isteğe bağlı): Google'ın arama önerisi HTML'i;
  yalnızca `search` `"used"` iken ve Google gönderdiyse vardır.
- `sources`: `{ "title", "url" }` listesi; Google Arama'nın dayandığı sayfalar
  (yalnızca `https`, tekrarsız, en fazla 4). Arama kullanılmadıysa boş.
- `search`: `"used"` — arama açıktı ve istek araç ile gitti; `"off"` —
  `GEMINI_SEARCH` ile kapalı; `"fallback"` — model ya da hesap katmanı arama
  aracını reddetti (400/403), istek bir kez **araçsız** tekrarlandı ve cevap
  yalnızca uygulama verisinden geldi. `fallback` sürekli görünüyorsa seçili
  model/katman aramayı desteklemiyor demektir; başka bir model seçin ya da
  `GEMINI_SEARCH=off` yapın.

Sunucu günlüğünde (Vercel → **Logs**) `[api/sor]` önekli satırlar neyin
olduğunu söyler: arama reddedildi mi, Gemini hangi durum koduyla döndü,
güvenlik engeli/boş cevap mı, zaman aşımı mı. Anahtar ve Google'ın hata metni
günlüğe yazılmaz.

Ziyaretçi tarafında: 429 (`rate_limited`) ve `busy` durumlarında kutu sessizce
yerel cevaba geçmez; "kısa sürede çok soru" / "rehber çok yoğun" notunu ve
**Tekrar sor** bağlantısını gösterir, yerel eşleştirici bir şey biliyorsa onu
da altında verir. Diğer hatalarda yine **Çevrimdışı yanıt** görünür.

## 5. Ücretsiz katman notları

- Gemini'nin ücretsiz katmanında dakikalık (RPM) ve günlük (RPD) istek
  sınırları vardır — Flash-Lite modelleri için tipik olarak dakikada ~15 ve
  günde birkaç yüz ile bin arası istek; güncel değerler
  <https://ai.google.dev/gemini-api/docs/rate-limits> sayfasındadır. Google
  Arama temellendirmesinin ayrıca kendi günlük kotası vardır (ücretsiz
  katmanda sınırlı sayıda ücretsiz temellendirilmiş istek, ücretli katmanda
  belirli bir sayıdan sonra istek başına ücret): güncel bilgi için
  <https://ai.google.dev/gemini-api/docs/pricing> sayfasındaki "Grounding with
  Google Search" satırına bakın. Sınır aşılınca kullanıcı "rehber yoğun"
  notunu ve varsa yerel cevabı görür, site bozulmaz. Gerçek kullanım
  büyürse Google AI Studio'da faturalandırmayı açmak (ücretli katman)
  sınırları büyük ölçüde yükseltir.
- Google'ın kuralları, Arama ile temellendirilmiş cevaplarda "Google Search
  Suggestions" (arama önerisi) öğesinin gösterilmesini ister
  (<https://ai.google.dev/gemini-api/docs/grounding/search-suggestions>).
  Bu yapılıyor: Gemini'nin döndürdüğü
  `groundingMetadata.searchEntryPoint.renderedContent` HTML'i, arama
  kullanıldıysa `/api/sor` cevabında `searchEntryPoint` alanıyla (en fazla
  20 KB; daha büyükse hiç gönderilmez) iletilir ve cevabın altında Google'ın
  verdiği haliyle gösterilir. Güvenlik için yalıtılmış bir iframe'de
  (`srcdoc`, `sandbox="allow-popups allow-popups-to-escape-sandbox"`: betik
  çalışmaz, sayfaya/çerezlere erişemez) durur; bağlantılar yeni sekmede
  açılır. Uygulamanın açık/koyu temasına uyar. Yüksekliği sabittir (72 px).
- Kotayı korumak için sunucuda basit sınırlar vardır: IP başına dakikada 15,
  günde 150 soru; sunucu örneği başına dakikada toplam 60 soru. (Eski 8/60/30
  değerleri, aynı mobil operatör ya da müze Wi-Fi'si arkasındaki — yani aynı
  IP'yi paylaşan — ziyaretçiler için çabuk doluyordu.) Bu sınırlar
  bellekte tutulur, yani her Vercel sunucusuz örneği için ayrı ayrı ve en iyi
  çaba esaslıdır (soğuk başlangıçta sıfırlanır). Değerler
  `src/lib/ask-ai.ts` içindeki `DEFAULT_LIMITS` ile değiştirilebilir.
- Zaman aşımı: sunucu Gemini'yi (tekrar dahil) en fazla 25 sn bekler, tarayıcı
  30 sn. Arama ile temellendirilmiş cevaplar birkaç saniye daha uzun sürer.
- Uç nokta yalnızca sitenin kendi sayfalarından gelen istekleri kabul eder
  (Origin/Referer kontrolü).
- Anahtarı iptal etmek ya da yenilemek için yine
  <https://aistudio.google.com/apikey> sayfasını kullanın; ardından Vercel'deki
  değeri güncelleyip yeniden dağıtın.

## İlgili dosyalar

- `src/routes/api/sor.ts` — sunucu uç noktası (doğrulama, sınırlar, yanıt kodları)
- `src/lib/ask-ai.ts` — bağlam oluşturma, sistem talimatı, Gemini çağrısı,
  Google Arama aracı ve kaynak ayrıştırma, sınır değerleri (`DEFAULT_LIMITS`)
- `src/lib/ask.ts` — çevrimdışı/yerel yedek cevaplayıcı
- `src/components/AskGuide.tsx` — kutunun arayüzü
