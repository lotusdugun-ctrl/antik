# Rehbere sor — yapay zekâ rehberi kurulumu

Kent sayfalarındaki **Rehbere sor** kutusu soruları Google Gemini ile cevaplar.
Model, uygulamanın kendi verisiyle (kentin özeti, tarihi, yapıları, bilgi
notları, 3D ölçüler, ilgili uygarlıklar ve kişiler) beslenir; bu yüzden
cevaplar sayfadaki bilgilerle tutarlıdır.

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
   Gemini modeli kullanmak isterseniz buraya adını yazın.
4. Değişkenler yalnızca yeni dağıtımlarda geçerli olur: **Deployments**
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

| Cevap                                   | Anlamı                                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| `200 {"answer": "...", "source": "ai"}` | Her şey yolunda.                                                                    |
| `503 {"error": "not_configured"}`       | `GEMINI_API_KEY` tanımlı değil ya da yeniden dağıtım yapılmadı.                     |
| `503 {"error": "busy"}`                 | Gemini kotası/dakikalık sınır doldu ya da model meşgul; biraz sonra tekrar deneyin. |
| `502 {"error": "failed"}`               | Anahtar geçersiz, model adı yanlış, zaman aşımı veya güvenlik engeli.               |
| `429 {"error": "rate_limited"}`         | Aynı IP'den çok fazla soru (aşağıya bakın).                                         |
| `400 {"error": "bad_request"}`          | Geçersiz istek (boş/500 karakterden uzun soru, bilinmeyen dil veya kent).           |
| `403 {"error": "forbidden"}`            | İstek başka bir siteden geldi.                                                      |

Hiçbir hata cevabı anahtarı ya da Google'ın ham hata metnini içermez.

## 5. Ücretsiz katman notları

- Gemini'nin ücretsiz katmanında dakikalık (RPM) ve günlük istek sınırları
  vardır; güncel değerler <https://ai.google.dev/gemini-api/docs/rate-limits>
  sayfasındadır. Sınır aşılınca kullanıcı yerel cevabı görür, site bozulmaz.
- Ücretsiz katmanda Google, gönderilen istekleri ürünlerini geliştirmek için
  kullanabilir. Ziyaretçilerin sorularına kişisel bilgi yazmaması gerekir;
  bu durum gizlilik politikasında belirtilmelidir.
- Kotayı korumak için sunucuda basit sınırlar vardır: IP başına dakikada 8,
  günde 60 soru; sunucu örneği başına dakikada toplam 30 soru. Bu sınırlar
  bellekte tutulur, yani her Vercel sunucusuz örneği için ayrı ayrı ve en iyi
  çaba esaslıdır (soğuk başlangıçta sıfırlanır). Değerler
  `src/lib/ask-ai.ts` içindeki `DEFAULT_LIMITS` ile değiştirilebilir.
- Uç nokta yalnızca sitenin kendi sayfalarından gelen istekleri kabul eder
  (Origin/Referer kontrolü).
- Anahtarı iptal etmek ya da yenilemek için yine
  <https://aistudio.google.com/apikey> sayfasını kullanın; ardından Vercel'deki
  değeri güncelleyip yeniden dağıtın.

## İlgili dosyalar

- `src/routes/api/sor.ts` — sunucu uç noktası (doğrulama, sınırlar, yanıt kodları)
- `src/lib/ask-ai.ts` — bağlam oluşturma, sistem talimatı, Gemini çağrısı
- `src/lib/ask.ts` — çevrimdışı/yerel yedek cevaplayıcı
- `src/components/AskGuide.tsx` — kutunun arayüzü
