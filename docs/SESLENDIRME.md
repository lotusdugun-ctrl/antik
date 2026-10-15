# Sesli rehberi seslendirme (Google Chirp 3 HD)

> **Varsayılan yol artık ücretsiz Microsoft Edge sesi (Emel).** `SESLENDIR.bat`'a çift tıklamak yeter; kart, hesap ya da anahtar gerekmez. Değişen bölümleri kaydeder ve yayınlar.
> Aşağıdaki Google Chirp 3 HD yolu isteğe bağlıdır ve `SESLENDIR-GOOGLE.bat` ile çalışır (faturalandırma hesabı ister).


Sesli rehber artık Google'ın **Chirp 3 HD** sesleriyle kaydediliyor. Bu sesler
eski seslerden çok daha doğal ve duygulu konuşur. Google her ay **1.000.000
karakteri ücretsiz** seslendirir; bizim bütün rehberimiz (Türkçe, İngilizce,
Almanca, Rusça) yaklaşık **840.000 karakter**, yani bir ayın ücretsiz hakkına
sığar. Program, ayda **950.000 karakteri asla geçmeyecek** şekilde kendini
durdurur; bu yüzden para ödemezsiniz.

Aşağıdaki adımları **bir kez** yapmanız yeterli (yaklaşık 15 dakika).

## 1. Google Cloud hesabı ve proje

1. <https://console.cloud.google.com> adresine Google hesabınızla girin.
2. Üstteki proje seçiciden **Yeni Proje**'ye tıklayın, adını örneğin
   `antik-seslendirme` koyun ve **Oluştur**'a basın.
3. Üstten bu projenin seçili olduğundan emin olun.

## 2. Faturalandırmayı açın (ücretsiz kullanım için de gerekli)

Google, ücretsiz kotayı kullanmak için bile bir kredi kartı ister. Ayda 1 milyon
karakterin altında kaldığınız sürece **hiçbir ücret alınmaz**.

1. Sol menüden **Faturalandırma (Billing)**'e girin ve projeye bir
   faturalandırma hesabı bağlayın (kart bilgilerini girin).
2. Güvenlik için bir **bütçe uyarısı** kurun: Faturalandırma → **Bütçeler ve
   uyarılar (Budgets & alerts)** → **Bütçe oluştur** → tutar: **1 USD**. Böylece
   bir kuruş bile harcanırsa e-posta gelir.

## 3. Text-to-Speech API'yi açın

1. Üstteki arama kutusuna **Cloud Text-to-Speech API** yazın.
2. Açılan sayfada **Etkinleştir (Enable)**'e tıklayın.

## 4. API anahtarı oluşturun

1. Sol menü → **API'ler ve Hizmetler → Kimlik Bilgileri (Credentials)**.
2. **Kimlik bilgisi oluştur → API anahtarı**'na tıklayın. Bir anahtar çıkar
   (`AIza...` ile başlayan uzun bir yazı).
3. **Anahtarı düzenle**'ye tıklayın; **API kısıtlamaları** bölümünde
   **Anahtarı kısıtla**'yı seçip listeden yalnızca **Cloud Text-to-Speech API**'yi
   işaretleyin ve kaydedin. (Anahtar çalınsa bile başka bir işe yaramaz.)
4. Anahtarı kopyalayın. **Kimseyle paylaşmayın, hiçbir yere yapıştırmayın.**

## 5. SESLENDIR-GOOGLE.bat'i çalıştırın

Proje klasöründeki **SESLENDIR-GOOGLE.bat**'e çift tıklayın. İlk seferde anahtarı
sorar: yapıştırın (sağ tık) ve Enter'a basın. Anahtar bilgisayarınızda
`scripts\.tts-key` dosyasında saklanır ve bir daha sorulmaz.

Karşınıza şu menü çıkar:

| Seçim | Ne yapar |
|---|---|
| **1** Ses örnekleri | Aynı kısa Türkçe paragrafı 8 farklı sesle okutur ve klasörü açar. Yaklaşık 3.000 karakter harcar. |
| **2** Kaç karakter tutar? | Hiçbir şey göndermeden, kaç bölümün ve kaç karakterin seslendirileceğini, bu ayın ücretsiz hakkına sığıp sığmadığını gösterir. |
| **3** Seslendir ve yayınla | Bütün rehberi seçili sesle kaydeder ve GitHub'a gönderir. |
| **4** Sesi değiştir | Ses adını seçersiniz (örn. `Algieba`). |
| **5** API anahtarını değiştir | Yeni anahtar yapıştırırsınız. |

## 6. Sesi seçin

Önce **1**'i seçin. `scripts\voice-samples` klasöründe şu dosyalar oluşur:

- Kadın: `tr-Sulafat` (sıcak, varsayılan), `tr-Aoede`, `tr-Achernar` (yumuşak),
  `tr-Vindemiatrix` (nazik)
- Erkek: `tr-Algieba` (akıcı), `tr-Charon` (bilgilendirici), `tr-Orus` (tok),
  `tr-Enceladus` (fısıltılı)
- Ayrıca seçili sesle birer İngilizce, Almanca, Rusça cümle.

Dinleyin, beğendiğinizin adını **4** ile seçin. Seçilen ses her dilde aynı
kişinin sesi olarak kullanılır.

## 7. Seslendirin

**3**'ü seçin. Önce Türkçe, sonra İngilizce, Almanca ve Rusça kaydedilir.
Birkaç saat sürebilir.

- Pencere kapanır ya da internet kesilirse sorun değil: **SESLENDIR-GOOGLE.bat**'i
  yeniden çalıştırıp **3**'ü seçin, kaldığı yerden devam eder.
- Aylık sınıra gelinirse program kendiliğinden durur ve
  "AYLIK SINIR" yazar. Kaydedilenler yayınlanır; kalanlar ay dönünce **3** ile
  tamamlanır. Eski kayıtlar o zamana kadar çalmaya devam eder.
- Bitince dosyalar otomatik olarak GitHub'a gönderilir ve uygulama güncellenir.

## Sık sorulanlar

**Bir isim hâlâ yanlış okunuyor.** `scripts\pronunciations.json` dosyasına
okunuşunu (IPA yazımıyla) ekleyin ya da geliştiriciye kelimeyi söyleyin.
Örnek: `{"phrase": "Afrodisias", "ipa": "afɾoˈdisias"}`. Sonra o yeri yeniden
kaydetmek için komut satırında:

```
py scripts\generate_audio_chirp.py --only site:aphrodisias --force
```

**Sonradan başka bir ses seçtim, hepsi yeni sesle mi olacak?** Hayır, yalnızca
henüz kaydedilmemiş ya da metni değişmiş bölümler. Hepsini yeni sesle baştan
kaydetmek için (yaklaşık 840.000 karakter, yani bir aylık hak):

```
py scripts\generate_audio_chirp.py --voice Algieba --force
```

**Ne kadar kullandım?** Program her çalışmada "Bu ay kullanılan" satırını
yazar. Kesin rakam Google Cloud'da **Faturalandırma → Raporlar** bölümündedir.
Aynı Google projesini başka bir iş için de kullanıyorsanız program onu bilemez;
bu projeyi yalnızca seslendirme için kullanın.

**Hata: HTTP 403.** Anahtar yanlış, Text-to-Speech API açık değil ya da
faturalandırma bağlı değil. 2–4. adımları kontrol edin, gerekirse menüden **5**
ile anahtarı yeniden girin.
