# Google Play'e yükleme (TWA)

Uygulama zaten bir PWA (manifest, simgeler, çevrimdışı service worker). Play Store'a
**Trusted Web Activity (TWA)** olarak paketlenir: Android uygulaması siteyi tam ekran
açar, kodu ayrıca yazmak gerekmez ve site güncellendikçe uygulama da güncellenir.

## 1. Paketi oluştur (PWABuilder)

1. https://www.pwabuilder.com adresine sitenin canlı adresini gir (ör. `https://antik.vercel.app`).
2. **Package for stores → Android** seç.
3. Ayarlar:
   - **Package ID:** kalıcıdır, sonradan değişmez. Ör. `app.antikturkiye.twa`
   - **App name:** Antik Türkiye
   - **Signing key:** "Create new" (PWABuilder bir imza anahtarı üretir)
4. İndirilen zip'te şunlar olur: `.aab` (Play'e yüklenecek), `.apk` (telefonda deneme),
   `signing.keystore` + `signing-key-info.txt` ve `assetlinks.json`.

> `signing.keystore` ve şifresini güvenli bir yerde sakla. Kaybedersen uygulamayı
> güncelleyemezsin. Depoya **koyma**.

## 2. Siteyi uygulamaya bağla (Digital Asset Links)

Uygulamanın adres çubuğu olmadan açılması için site, uygulamayı tanımalı.
`/.well-known/assetlinks.json` adresi bunu ortam değişkenlerinden üretir.
Vercel → Project → Settings → Environment Variables:

| Değişken           | Değer                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `TWA_PACKAGE_NAME` | 1. adımdaki Package ID                                                |
| `TWA_SHA256`       | zip'teki `assetlinks.json` içindeki `sha256_cert_fingerprints` değeri |

Kaydedip yeniden deploy et, sonra `https://SITE/.well-known/assetlinks.json` adresinin
JSON döndürdüğünü kontrol et.

## 3. Play Console

1. https://play.google.com/console → geliştirici hesabı (tek seferlik ücret).
2. **Uygulama oluştur** → `.aab` dosyasını **Dahili test** kanalına yükle.
3. **Play App Signing** açıksa Google kendi anahtarıyla yeniden imzalar:
   Console → _Kurulum → Uygulama bütünlüğü → Uygulama imzalama_ sayfasındaki
   **SHA-256** değerini kopyala ve `TWA_SHA256` değişkenine virgülle **ekle**:
   `AA:BB:...,CC:DD:...`
4. Mağaza kaydı: kısa/uzun açıklama, en az 2 ekran görüntüsü, 512×512 simge
   (`public/icons/icon-512.png`), gizlilik politikası adresi (aşağıdaki kontrol listesi).
5. İçerik derecelendirmesi ve hedef kitle formlarını doldur → incelemeye gönder.

## 4. Play Console kontrol listesi (Iova LTD)

Yanıtlar koddaki gerçek davranışa göre yazıldı; bir özellik yeni bir veri göndermeye
başlarsa hem `src/lib/legal.ts` hem bu liste güncellenmeli.

**Uygulama içeriği → Gizlilik politikası**

- [ ] URL: `https://SITE/gizlilik` (Türkçe; `?lang=en|de|ru` ile diğer diller). Koşullar: `https://SITE/kosullar`.
- [ ] Geliştirici iletişim e-postası: `info@passrank.app`; geliştirici adı: **Iova LTD**.

**Uygulama içeriği → Veri güvenliği (Data safety)**

- [ ] "Uygulamanız kullanıcı verisi topluyor ya da paylaşıyor mu?" → **Evet** (yapay zekâ rehberine yazılan sorular sunucudan geçip Google'a gider).
- [ ] Toplanan veri türü: **Uygulama etkinliği → Diğer kullanıcı tarafından oluşturulan içerik** (AI rehbere sorulan sorular; "Bildir" notları).
  - Toplanıyor: Evet · Paylaşılıyor: **Evet** (Google LLC, Gemini API — cevabı üretmek için hizmet sağlayıcı) · İşlenme: geçici değil (Gemini ücretsiz katmanı içerikleri ürün geliştirmede kullanabilir) · İsteğe bağlı: **Evet** (özellik kullanılmazsa hiçbir şey gönderilmez) · Amaç: **Uygulama işlevselliği**; bildirimler için ayrıca **Güvenlik/kötüye kullanımı önleme**.
- [ ] Konum: **Toplanmıyor** (yalnızca cihazda kullanılır, sunucuya gitmez).
- [ ] Fotoğraflar: **Toplanmıyor** (ziyaret fotoğrafları yalnızca cihazda).
- [ ] Ses/mikrofon: **Toplanmıyor** (konuşma tanıma tarayıcının/OS'un hizmeti).
- [ ] Kişisel bilgiler, finans, sağlık, kişiler, takvim, dosyalar, tarama geçmişi: **Toplanmıyor**.
- [ ] Cihaz veya diğer kimlikler: **Toplanmıyor** (IP yalnızca 24 saatlik bellek sayacında, kaydedilmez; Plausible açıksa çerezsiz, kimliksiz sayım — Google'ın tanımına göre "toplanmıyor").
- [ ] Veriler aktarım sırasında şifreleniyor mu? **Evet** (HTTPS). Kullanıcı veri silme isteyebilir mi? **Evet** (e-posta ile; hesap yok).

**Uygulama içeriği → Yapay zekâ (AI-generated content)**

- [ ] Uygulama üretken yapay zekâ içeriyor: "Rehbere sor" (Google Gemini).
- [ ] Kullanıcılar uygulama içinden bildirebiliyor: her AI cevabının yanındaki **bayrak (Bildir)** düğmesi → neden (rahatsız edici / yanlış bilgi / başka) + not → `POST /api/rapor` → sunucu günlüğünde `[ai-report]` satırı. Bu satırları düzenli olarak (ör. haftada bir Vercel → Logs → `ai-report` araması) inceleyin; sorunlu konuları `src/lib/ask-ai.ts` sistem talimatına ekleyin.
- [ ] Gemini'nin kendi güvenlik filtreleri açık (SAFETY engeli olan cevaplar gösterilmez, yerel cevap verilir).

**İçerik derecelendirmesi (IARC anketi)**

- [ ] Kategori: Referans/Eğitim/Seyahat. Şiddet: tarihî bilgi düzeyinde (savaşlar, mitoloji) — grafik değil. Cinsellik, kumar, uyuşturucu: yok.
- [ ] Kullanıcı etkileşimi: kullanıcılar arası iletişim **yok**; kullanıcı içerik paylaşımı **yok**; **AI sohbet var** (yukarıdaki bildirme ile).
- [ ] Konum paylaşımı: yok.

**Hedef kitle ve içerik**

- [ ] Hedef yaş: 13+ (genel kitle; AI özelliği nedeniyle "çocuklar için tasarlandı" seçmeyin). Reklam: **yok**.

**Telif / lisans**

- [ ] Künye sayfası: `https://SITE/gorseller` — her fotoğrafın yazarı ve lisansı, 3D taramalar, ses kaynakları, yazı tipleri, harita, açık kaynak yazılım lisansları (`/third-party-notices.txt`). Her sayfanın altında "Bu sayfadaki fotoğrafların künyeleri" de var.
- [ ] Sesli rehber yalnızca lisansı ticari kullanıma izin veren Piper sesleriyle kaydedilir (`docs/SESLER.md`); yoksa cihaz sesi kullanılır.
- [ ] Mağaza ekran görüntülerinde görünen fotoğraflar uygulamadakilerle aynı lisanslı fotoğraflar olmalı; künyesi olmayan görsel kullanmayın.

## Sorun giderme

- Uygulama üstte adres çubuğuyla açılıyorsa `assetlinks.json` eksik ya da parmak izi
  yanlış. Play App Signing'in parmak izini eklemeyi unutmak en sık nedendir.
- Doğrulama aracı:
  `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://SITE&relation=delegate_permission/common.handle_all_urls`
