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

| Değişken | Değer |
| --- | --- |
| `TWA_PACKAGE_NAME` | 1. adımdaki Package ID |
| `TWA_SHA256` | zip'teki `assetlinks.json` içindeki `sha256_cert_fingerprints` değeri |

Kaydedip yeniden deploy et, sonra `https://SITE/.well-known/assetlinks.json` adresinin
JSON döndürdüğünü kontrol et.

## 3. Play Console

1. https://play.google.com/console → geliştirici hesabı (tek seferlik ücret).
2. **Uygulama oluştur** → `.aab` dosyasını **Dahili test** kanalına yükle.
3. **Play App Signing** açıksa Google kendi anahtarıyla yeniden imzalar:
   Console → *Kurulum → Uygulama bütünlüğü → Uygulama imzalama* sayfasındaki
   **SHA-256** değerini kopyala ve `TWA_SHA256` değişkenine virgülle **ekle**:
   `AA:BB:...,CC:DD:...`
4. Mağaza kaydı: kısa/uzun açıklama, en az 2 ekran görüntüsü, 512×512 simge
   (`public/icons/icon-512.png`), gizlilik politikası adresi.
   Gizlilik notu: uygulama hesap istemez, ilerleme cihazda kalır; analitik açıksa
   çerezsiz Plausible kullanılır.
5. İçerik derecelendirmesi ve hedef kitle formlarını doldur → incelemeye gönder.

## Sorun giderme

- Uygulama üstte adres çubuğuyla açılıyorsa `assetlinks.json` eksik ya da parmak izi
  yanlış. Play App Signing'in parmak izini eklemeyi unutmak en sık nedendir.
- Doğrulama aracı:
  `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://SITE&relation=delegate_permission/common.handle_all_urls`
