# Antik Türkiye: devam notu (7 Kasım 2026; güncellendi)

Yeni sohbette şunu yaz: "C:\Users\caner\antik\DEVAM-NOTU.md dosyasını oku ve devam et."

## ANTİK PASS ÖDEME AKIŞI + 4 YENİ KENT HİKÂYESİ & WEB PİŞİRME ALTYAPISI (575/575 PASS) (7 Kasım 2026, öğle) — EN GÜNCEL, BURADAN BAŞLA

- **Hedef:** Antik Pass satın alma/geri yükleme (TWA Google Play Billing + Stripe web) entegrasyonu, Pompeii, Eboracum, Nîmes, Trier için interaktif hikâyeler (CYOA) ve web GLB pişirme altyapısı.
- **Yapılanlar:**
  1. **Antik Pass Ödeme ve Restore Akışı (`src/lib/pass.tsx`):**
     - `useBuyPass`: Android TWA ortamında Google Play Digital Goods API (`window.getDigitalGoodsService`), web ortamında Stripe Checkout yönlendirmesi (`VITE_STRIPE_CHECKOUT_URL`) ve geri bildirim bildirimleri (toast) bağlandı.
     - `restorePass`: Hem Google Play `listPurchases()` hem de yerel depolama doğrulamasıyla satın alımı geri yükler duruma getirildi.
     - `Paywall` bileşeninde `pass_restore` metni tıklanabilir aktif bir butona dönüştürüldü.
  2. **İnteraktif Hikâyeler (`src/lib/stories-more.ts`):**
     - `pompeii-firinici`: Vezüv patlaması sırasında fırıncı çırağının kaçış hikâyesi (7 sahne; Nocera kapısı, marina teknesi, amfitiyatro sığınağı ve Stabiae sonları; Yaşlı/Genç Plinius dipnotları).
     - `eboracum-lejyoneer`: MS 122 Hadrianus ziyareti ve VI. Victrix nöbeti (6 sahne; Principia karargahı, Hadrian Duvarı inşası, nehir devriyesi ve lojistik sonları).
     - `nimes-su-muhendisi`: Pont du Gard su kemeri ve Castellum Divisorium su dağıtımı (6 sahne; kemer tıkanıklığı, amfitiyatro su kanalları, halk çeşmeleri sonları).
     - `trier-saray-katibi`: MS 310 Konstantin Bazilikası (Aula Palatina) ve Porta Nigra fermanı (6 sahne; imparatorluk mührü, amfitiyatro duyurusu, saray arşivi sonları).
     - Hikâyeler hem Türkçe hem İngilizce tam metin ve dallanma kurallarına tam uyumludur (49 hikâye testinin tamamı geçti).
  3. **Web GLB Pişirme Altyapısı (`scripts/glb/web-sites.txt`, `PISIR-YENI-KENTLER.bat`):**
     - `web-sites.txt` listesine 6. Grup olarak `pompeii-kenti`, `eboracum-kenti`, `nimes-kenti`, `trier-kenti` eklendi.
     - Kullanıcının tek tıkla yeni 4 kentin 3D sahnelerini Blender GPU ile web için pişirmesini sağlayan `PISIR-YENI-KENTLER.bat` hazırlandı.
  4. **Doğrulama ve Kalite:**
     - `bunx tsc --noEmit` → **0 hata** (Tip denetimi temiz).
     - `bun test` → **575 pass, 0 fail (343.390 expect() çağrısı, 31 dosya)** %100 YEŞİL!
     - `test-sonucu.txt` güncellendi.
  5. **Gönderim Bat:**
     - `GONDER-38.bat` hazırlandı (`git add` ile değişen kaynak dosyalar, test sonucu ve DEVAM-NOTU.md; push).

## 4 YENİ ANTİK KENT (POMPEİ, EBORACUM, NÎMES, TRİER) ENTEGRASYONU TAMAMLANDI, TÜM TESTLER %100 YEŞİL (559/559 PASS) (7 Kasım 2026, öğle)

- **Hedef:** İtalya (Pompeii), İngiltere (Eboracum), Fransa (Nîmes) ve Almanya (Trier) yeni 4 antik kentin 3D modelleme/rekonstrüksiyon entegrasyonu tamamlanarak tüm doğrulama testlerinin (%100, 559/559) yeşile çekilmesi, yapı kartları ve dokümantasyonun tamamlanması.
- **Yapılanlar:**
  1. **Geometri ve Z-Fighting Düzeltmeleri (`src/lib/reconstruction-parts.ts`):**
     - Celsus heykellerinin prosedürel olarak üretilmesi kütüphane dışındaki binalarda (Pompeii, Eboracum, Trier) kapatıldı (`if (spec.inscribed !== false)`), böylece `scans.test.ts` temizlendi.
     - Kornişlerde (`cornice`) duvara yaslanan aedicula kısımlarında duvara batan arka dişler opsiyonel yapıldı (`backDentils: false`).
     - Kaset tavan derinliği duvar sınırına çekildi (`const sz = Math.min(diameter * 1.4 - 0.16, -z - 0.08)`).
     - Kapı üstü panellerindeki `paintRed` ve `paintGold` çıtaları ayrıştırılarak Z-fighting sıfırlandı.
  2. **Yaşam ve İnsan/Hayvan Koordinatları (`src/lib/scene-life.ts`, `src/lib/models/on-yeni-life.ts`):**
     - Armarium papirüs etiketlerindeki `linen` kaldırıldı (pazar tentesi algılama çakışması çözüldü).
     - `facadeLife` içindeki basamak koruması (`if (step >= spec.steps) continue;`) eklendi; kütüphane okuyucuları ve Efes sokak hayatı bazilikalardan ayrıldı (`if (spec.inscribed !== false)`).
     - `amphitheatreLife` nöbetçileri ve yürüyüş rotaları cavea taş basamakları ve podyum duvarından arenanın kum tabanına çekildi (`arenaLength * 0.42` ve `arenaLength * 0.38`).
     - Porta Nigra dilencisi (`trades.beggar`) sütun ve kaide içine batmaktan kurtarılarak sütun önüne caddeye taşındı.
  3. **Kent Planı ve Cadde Çakışmaları (`src/lib/reconstructions.ts`):**
     - Eboracum Tapınağı (`eboracum-kenti` Place 1) konumu `at: [0, -85]` olarak ayarlandı. Böylece tapınağın sokak taşları ile kentin Z=-60 caddesi arasındaki derinlik tamponu sağlandı, Place 2 arkasıyla çakışma ortadan kalktı.
  4. **Doğrulama ve Kalite:**
     - `bunx tsc --noEmit` → **0 hata** (Tip denetimi tamamen temiz).
     - `bun test` → **559 pass, 0 fail (343.151 expect() doğrulaması, 31 dosya)** %100 YEŞİL!
     - `test-sonucu.txt` güncellendi.
     - Prettier biçimlendirmesi (`bunx prettier --write`) doğrulandı.
     - Geçici probe dosyaları (`tmp_probe*.ts`, `tmp_fight_probe.ts`) temizlendi.
  5. **Gönderim Bat:**
     - Kullanıcı için `GONDER-37.bat` hazırlandı (`git add` ile değişen kaynak dosyalar, yapı kartları, `DEVAM-NOTU.md`, `test-sonucu.txt` ve push).

## UKİYO-E ANİMASYONLU EXPLAINER: "NEDEN OYUN OYNUYORUZ?" (7 Kasım 2026, sabah)

- **İstek:** "Neden oyun oynuyoruz" konulu, Ukiyo-e Woodblock (Hokusai/Hiroshige ahşap baskı) üslubunda görsel storyboard ve tam animasyonlu anlatıcı.
- **Yapıldı:**
  1. **Görsel Storyboard:** `storyboard.html` (1280x720, 6 beat: Giriş/Kanca, Güvenli Simülasyon, Dopamin Döngüsü, Sosyal Bağ & 3.4B Oyuncu, Akış Boyutu & Büyülü Halka, Sonuç). Kullanıcı tarafından onaylandı.
  2. **Tam Animasyon (HTML + Web Audio):** `index.html` ve `explainer.html` (21.0 saniye, 1280x720 responsive canvas, letterbox, oynat/duraklat, seek slider, ses/döngü butonları, In-sen makamı koto + taiko + klaket ses tasarımı, Noto Serif JP tipografisi, `window.seek`, `window.DURATION`, `window.scoreSound` API'leri).
  3. **MP4 Video Render:** Headless Playwright + FFmpeg ile 630 kare ve 48 kHz stereo ses sentezlenerek `neden-oyun-oynuyoruz.mp4` (~8.0 MB) ve `explainer-sound.wav` üretildi.
- **Konum:** `C:\Users\caner\.gemini\antigravity\brain\7efeab97-dcc2-4438-8ba6-67c3ecf5efaa\`

## YENİ ANTIK KENTLER: POMPEİ, EBORACUM, NIMES, TRIER (6 Kasım 2026, akşam)

- **İstek:** İtalya, İngiltere, Fransa ve Almanya'dan antik kentler; Türkiye'dekiler gibi 3D modeller.
- **Yapıldı (bu batarya):**
  - Blender betikleri: `scripts/blender/pompeii_hd.py` (+`POMPEII-HD.bat`), `scripts/blender/eboracum_hd.py` (+`EBORACUM-HD.bat`), `scripts/blender/nimes_hd.py` (+`NIMES-HD.bat`), `scripts/blender/trier_hd.py` (+`TRIER-HD.bat`).
  - Mimari `antik_mimari` yardımcıları + argümanlarla aynı akış (sky/sun, 3 render `--views`, 360° `--pano`, kiya, `BITTI`).
- **Blender 5.2.3 headless doğrulaması (Claude çalıştı):** 4 betikte syntax → `py_compile` OK; `blender -b --factory-startup` çalıştırılarak geometry + sky + render + `BITTI` doğrulandı; `--no-render` çalıştırınca render yoktu (guard eklendi), `--views 0,1,2` ile gerçek render çıktı (1920x1080, 64 örnek): `<id>-hd-0/1/2.png` + `<id>-kiyas-*.jpg` `hd-out\<id>\` altında.
- **Blender API düzeltmeleri:** `column()` imzası `column(x, y, z, height, d, order)` (isim argümanı yok) — 4 betikteki çağrılar düzeltildi; `_AM.apply_dokular` → `AM.apply_dokular` (import alias); nimes `temple()` çağrısı isim eksikti (`temple("temp", ...)`); KIYAS render blokları `if not args.no_render` ile korundu; docstring `\e`/`\n`/`\t` kaçışları `/` ile düzeltildi.
- **Yapılmadı:** 4 yapı kartı (`docs/yapi-kartlari/{pompeii,eboracum,nimes,trier}.md`); pano (360°) render'ları; bake (`antik_bake.py`/`bake_glb.py` + web_pack); `public/baked/<id>`; `baked-sites.ts` yenileme; push.
- **Bake denemesi (6 Kasım akşam):** `PISIR-WEB.bat pompeii` → `disa aktariliyor...` → `HATA (disa aktarma)` (`hd-out\pisir\pompeii.log`: `page.waitForFunction: Timeout 300000ms exceeded` @ export-glb.mjs:24). Neden: hedef rota `/rekonstruksiyon/pompeii` → `getReconstruction("pompeii")` → `notFound()`. Yeni kent için web GLB bake'i, `src/lib/reconstructions` kayıtları + `public/baked/<id>` + `baked-sites.ts` + `hd-files.json`/`panoramas` girmeden önce yapılamaz. (Vite/hydration uyarısı marjinaldi; zaman aşımı ana neden.)

## CI KIRMIZISI ÇÖZÜLDÜ (6 Kasım 2026, akşam) — EN GÜNCEL, BURADAN BAŞLA

- **GitHub CI'nın 30 Ekim'den (#39) beri kırmızı olmasının nedeni bulundu:** kırmızı olan adım `Lint` (`bunx eslint . --quiet`). Kod tabanının bir kısmı `.prettierrc` (printWidth 100) ile uyumlu değildi: 7 dosyada 140 biçim hatası. Type-check, test, build ve audit bu yüzden hiç çalışmamıştı (atlanmıştı).
  - Dosyalar: `src/components/Reconstruction3DInner.tsx`, `src/lib/baked-scene.ts`, `src/lib/panoramas.ts`, `scripts/glb/export-life.mjs`, `scripts/glb/export-glb.mjs`, `scripts/glb/export-fx.mjs`, `scripts/glb/web_pack.mjs`.
  - **Yapıldı:** bu 7 dosya `bunx prettier --write` ile biçimlendirildi; yalnızca boşluk/satır düzeni değişti, davranış aynı.
- **İkinci kırmızı neden (lint düzelince ortaya çıkacaktı):** `bun audit --audit-level=high` → `seroval` 1.6.3 / 1.6.9 sürümlerinde 3 yüksek güvenlik açığı. `bun audit fix` ile `seroval` 1.6.11'e çıkarıldı, `bun.lock` güncellendi. Kalan tek açık (minimatch) "high" değil; audit artık `--audit-level=high` eşiğinde temiz.
- **vite.config.ts:** Yereldeki `cloudflare-pages` varsayılanı geri alındı; dosya commit'teki `nitro: { preset: "vercel" }` hâline döndü. Nedeni: (a) yayın yeri kararı verilmeden değiştirilmemeli (GONDER-30 hâlâ çalıştırılmamalı), (b) `process.env.NITRO_PRESET` yazımı `tsc` hatası veriyordu (TS4111; doğrusu `process.env["NITRO_PRESET"]`). Cloudflare'e geçilecekse bu düzeltmeyle birlikte yeni bir bat hazırlanmalı.
- **Doğrulama (yerel, CI sırasıyla):** `bun install --frozen-lockfile` temiz; `tsc --noEmit` 0 hata; eslint (Linux gibi LF kopyada) 0 hata; `bun test` 547/547 ve 324.040 doğrulama; `bun run build` 0 hata; `bun audit --audit-level=high` temiz.
- **GONDER-32 çalıştırıldı ve CI YEŞİL:** commit `bf90a71` GitHub `main`'e gitti; Actions çalıştırması **#64 başarılı** (Install, Type-check, Lint, Test, Build, Audit — hepsi success). 30 Ekim'den beri süren kırmızı seri bitti.
- **GONDER-32.bat:** yalnızca CI düzeltmelerini (7 dosya + `bun.lock` + bu not) gönderdi. `vite.config.ts` ve `public/baked` dâhil değildi.
- **Sıradaki:** (1) Antik Pass ödemesi (Play Billing + Stripe), (2) Celsus erdem heykelleri, (3) hikâye metinleri. Yayın yeri (Vercel/Cloudflare) kararı hâlâ açık; Cloudflare'e geçilecekse `preset` değişikliği `process.env["NITRO_PRESET"]` yazımıyla ve ayrı bir bat ile yapılmalı.

## YENİ ANTIK KENT: POMPEİ (İtalya) — 6 Kasım 2026, akşam

- **İstek:** İtalya, İngiltere, Fransa ve Almanya'dan antik kentler; Türkiye'dekiler gibi 3D modeller.
- **Yapıldı (İtalya — ilk): Pompeii HD betiği.**
  - `scripts/blender/pompeii_hd.py`: forum, basilika, Capitolium, Apollo tapınağı, büyük tiyatro, amfitasar, evler, duvar, Vesuvius yamacı; sky/sun, 3 adet render (`--views`), 360° pano (`--pano`), karşılaştırma (kiyas) görünümü, `BITTI`.
  - `POMPEII-HD.bat`: ekran kartıyla çalışır (`blender -b --factory-startup --python scripts\blender\pompeii_hd.py -- --out hd-out\pompeii --dokular gorseller-ai\dokular --res 1920x1080 --samples 256 --gpu --pano --pano-samples 192`).
  - `scripts/blender/pompeii_hd.py` Python syntax'i geçti (`python -m py_compile` temiz).
- **Yapılmadı:** `docs/yapi-kartlari/pompeii.md` (yapı kartı — [K]/[F]/[T] etiketli). **Kullanıcı el kontrolü şartı:** kart olmadan gerçek ölçüler/satırlar [T] kalmalı.
- **Kullanıcı yapacak:** `POMPEII-HD.bat` çalıştır (ekran kartı) → `hd-out-pompeii-log.txt` → "pompeii hd hazir" → Claude çıktıları/açıları doğrular → 360°'leri `public/hd/pompeii/` + `hd-files.json` + `GONDER-35.bat` (Türkiye'deki GONDER-15 akışına göre).

## YENİ ANTIK KENTLER: EBORACUM, NIMES, TRIER (6 Kasım 2026, akşam)

- **İstek:** İtalya, İngiltere, Fransa ve Almanya'dan antik kentler; Türkiye'dekiler gibi 3D modeller.
- **Yapıldı (bu batarya):**
  - `scripts/blender/eboracum_hd.py` + `EBORACUM-HD.bat`: castellum (York), basilika, hamamlar, koloniyalı cadde, tapınak; 5 render + 360° + kiya.
  - `scripts/blender/nimes_hd.py` + `NIMES-HD.bat`: Arena, Maison Carrée, tapınak; aynı akış.
  - `scripts/blender/trier_hd.py` + `TRIER-HD.bat`: Porta Nigra, amfitasar, hamamlar, basilika; aynı akış.
- **Tüm üçü Python syntax kontrolünden geçti** (`python -m py_compile` temiz).
- **Yapılmadı:** 3 yapı kartı (`docs/yapi-kartlari/{eboracum,nimes,trier}.md`).

## SON DURUM (6 Kasım akşam) — önceki

- Kullanıcı projeye **OpenAI (Codex)** üzerinden devam edecek. Kurallar artık `AGENTS.md`'de (her araç okur).
- `GUNCEL-CEK.bat` ile agtt'nin `4481eda` "Antik v3" tasarımı çekildi (fast-forward, sorunsuz). Yerel `main` = GitHub `main` + aşağıdaki gönderilmemiş değişiklikler.
- v3 özeti: yalnızca koyu tema (`src/styles.css`, `src/lib/theme.tsx`), İznik mercanı vurgu rengi, yeni yazı tipleri; **Antik Pass** (`src/lib/pass.tsx`): ücretsiz 3D = Aspendos + Celsus, kalanı Pass; fiyatlar ₺399/yıl, ₺59/ay, ₺999 ömür boyu; ödeme bağlı değil, kilit `VITE_PAYWALL=1` ile açılır. Pişmiş modeller v3'te de çalışıyor.
- **GitHub CI 30 Ekim'den (#39) beri her gönderimde kırmızı** (v3'ten önce de). Nedeni incelenmedi; ilk iş bu olabilir (Actions → son çalıştırmanın günlüğü).
- **GONDER-30 ÇALIŞTIRILMASIN** (vite.config.ts'deki cloudflare-pages varsayılanı): site Vercel'deyse bozar. Önce yayın yerine karar verilmeli. `vite.config.ts` değişikliği yerelde commit edilmeden duruyor.
- GONDER-31 hazır: yalnızca AGENTS.md, DEVAM-NOTU.md ve bat'ları gönderir (vite.config.ts hariç).
- Sıradaki seçenekler: (1) CI hatası, (2) Antik Pass ödemesi (Play Billing + Stripe), (3) Celsus erdem heykelleri, (4) hikâye metinleri.

## CLAUDE NOTU (6 Kasım, 2. sohbet) — DOĞRULANDI

- `agtt` yetkisi: GEREK YOK, arkadaş zaten yetkili. `agtt` 5 Kasım'da `4481eda` "feat: Antik v3 redesign with dark theme, İznik coral and Antik Pass" commit'ini attı. Yerel depo bu commit'in GERİSİNDE; GONDER-30 içindeki `git pull` onu alır.
- Antigravity işi doğrulandı: `public/baked/` içinde 45 klasör var, `baked-sites.ts` 45 yeri listeliyor, `baked-scene.ts` varsayılan açık (`?baked=0` / `?pilot=0` ile kapanıyor). Yerel son commit'ler 3fcfaf8 ve 05c56f1, GitHub'da da var (push edilmiş).
- GONDER-30 HENÜZ ÇALIŞTIRILMADI. `vite.config.ts` dosyasına agtt dokunmamış, çakışma beklenmez.
- DİKKAT: Site Vercel'de yayındaysa `preset: "cloudflare-pages"` varsayılanı Vercel derlemesini bozabilir. GONDER-30'dan önce Vercel'de `NITRO_PRESET=vercel` ortam değişkeni eklenmeli ya da Cloudflare'e geçiş tamamlanmalı.

## ANTIGRAVITY OTURUMU (6 Kasım 2026) — EN GÜNCEL & CLAUDE DEVİR NOTU

- **Özet:**
  1. **Tüm 45 yerin pişirilmesi ve varsayılan yapılması tamamlandı:**
     - 45 antik yerin tamamı Blender Cycles GPU ile gündüz ışığı (`clear`) ön ayarında pişirildi, meshopt (`-cc`) ile sıkıştırıldı ve `public/baked/` altına yerleştirildi (513.3 MB).
     - `src/lib/baked-scene.ts` içinde `?pilot=1` şartı kaldırıldı; siteye giren tüm ziyaretçiler için Mozaik3D kalitesindeki pişmiş modeller varsayılan yapıldı (`GONDER-28.bat` ve `GONDER-29.bat` ile GitHub `main` dalına yollandı).
  2. **Cloudflare Pages Dağıtım Yapılandırması Yapıldı:**
     - `vite.config.ts`: Nitro dağıtım hedefi `preset: process.env.NITRO_PRESET || "cloudflare-pages"` olarak ayarlandı.
     - `bun run build` ile yerel derleme test edildi ve 0 hata ile tamamlandı. Nitro, `dist/` klasörü altında Cloudflare Pages formatında (`dist/_worker.js`, `dist/_routes.json`, `dist/_headers`, statik varlıklar) kusursuz çıktı üretiyor.
     - Cloudflare Pages Dashboard ayarları:
       - **Framework preset**: `None`
       - **Build command**: `bun run build` (veya `npm run build`)
       - **Build output directory**: `dist`
       - **Compatibility flags**: `nodejs_compat`
       - **Environment variables**: `NODE_VERSION=20`
     - Boyut sınırları doğrulandı: En büyük tekil dosya `artemis-tapinagi-baked.glb` (23.8 MB) olup Cloudflare Pages Free planındaki dosya başı 25 MB sınırının altındadır. Toplam 513 MB, 1.5 GB genel sınırın oldukça altındadır.
  3. **Hazırlanan Bat:**
     - `GONDER-30.bat`: `vite.config.ts` ve `DEVAM-NOTU.md` dosyalarını GitHub `main` dalına göndermek üzere hazırlandı.
- **Kullanıcının Yapacağı:**
  - `GONDER-30.bat` dosyasını çalıştırıp GitHub `main` dalına göndermek.
  - Cloudflare Pages üzerinde projeyi bağlayıp yayınlamak.
- **Claude İçin Sıradaki Adımlar:**
  - Celsus erdem heykelleri (Viyana Sanat Tarihi Müzesi'ndeki CC0/kamu malı referanslar) ve taş ayrıntıları.
  - Hikâye metinleri (`HIKAYELERI-YENILE.bat`, el kontrolü).

## ANTIGRAVITY OTURUMU (5 Kasım 2026)

- **Yapılanlar:**
  1. **Aspendos & Nemrut görsel kusurları giderildi ve yeniden pişirildi:**
     - Aspendos tiyatrosu arkasındaki toprak set (`bank`) düz gri görünüyordu; `Reconstruction3DInner.tsx` ve `landscape.ts` üzerinden çok ölçekli gürbüz toprak/çimen dokusu (`groundDetail`), tepe dalgalanması (`slopeY` noise) ve dünya koordinatı UV eşlemesi bağlandı. `baked-scene.ts` içinde pişmiş modeller için `_DETAIL` zemin doku geçişi eklendi.
     - Nemrut tümülüsündeki beyaz leke hatası giderildi: `reconstruction-parts.ts` içindeki iç içe geçmiş koniler kaldırılıp tek parça aşınmış kaya konisine dönüştürüldü. `antik_bake.py` içinde tepe apeksinin ve büyük sürekli zemin yükseltilerinin parçalanması engellendi.
     - Aspendos ve Nemrut Blender Cycles (GPU) ile yeniden pişirilip `public/baked/` altına yerleştirildi ve görsel önizlemeleri doğrulandı.
  2. **İnsan figürleri Mozaik3D tarzına yükseltildi:**
     - `src/components/scene/figure.ts` ve `life.ts`: Yüz hatları (burun kemeri, burun kanatları, göz kapakları/kirpik kıvrımı, iris/göz bebeği, kaşlar, dudak ayrımı, çene hattı, kulak içi), 4 eklemli parmak + başparmak (5 parmaklı detaylı el), kumaş döküm ve kıvrım dalgalanmaları eklendi.
     - `life.ts`: Yakın mesafe görünürlük eşiği (`NEAR_IN = 80`) artırıldı, `antik-life-cloth-v2` özel kumaş shader'ı ile dokuma desen tanesi ve otlatma açılı Fresnel parıltısı eklendi.
     - Tip kontrolü (`tsc --noEmit`) 0 hata, birim testler (`bun test`) 547 test / 324.040 doğrulama ile %100 geçti.
  3. **Tüm 45 yer gündüz ışığıyla pişirildi ve paketlendi (Biten: 45, Hatalı: 0):**
     - `scripts/glb/web-sites.txt`: Vitrin yerlerinin ardından kalan 35 yer mantıksal gruplarla listelendi (Sümela çok büyük olduğu için hariç tutuldu).
     - `scripts/glb/web_pack.mjs`: Yeni pişirilen yerlerde Unity skirt modellerini (`<id>-skirt.glb`) otomatik olarak koruyan/kopyalayan geri dönüş eklendi.
     - Toplam 45 yerin tamamı (Didyma, Artemis, Afrodisyas Stadyumu, Milet, Efes Büyük Tiyatro, Halikarnas, Patara, Perge, Sagalassos, Priene, Assos, Trajan, Aizanoi, Sardes, Magnesia, Ksanthos, Kaunos, Myra, Antalya Hadrianus Kapısı, Side Apollon, Letoon, Laodikeia, Afrodisyas Tetrapylon, Efes Hadrianus, Efes Yamaç Evler, Zeugma, Hattuşa, Alacahöyük, Troya, Çatalhöyük, Karahan Tepe, Ani, Yerebatan, Galata Kulesi, Süleymaniye, Selimiye vb.) Blender Cycles (AMD HIP GPU) ile `clear` gündüz ön ayarında pişirildi, meshopt (`-cc`) ile sıkıştırıldı ve `public/baked/` altına yerleştirildi.
     - Toplam `public/baked/` boyutu: **513.3 MB** (ortalama ~11.4 MB/site).
     - `baked-sites.ts`: 45 yerin tamamını içerecek şekilde güncellendi.
  4. **Tüm 45 Pişmiş Model Canlı Sitede Varsayılan Yapıldı:**
     - `src/lib/baked-scene.ts` içinde `?pilot=1` şartı kaldırıldı. Artık siteye giren tüm kullanıcılar doğrudan pişmiş gündüz ışıklı Mozaik3D modellerini görür (isteyen `?baked=0` ile kapatabilir).
- **Kullanıcının Yapacağı:**
  - `GONDER-29.bat` çalıştırılarak canlı sitede varsayılan yapma değişikliği GitHub `main` dalına gönderilmeli.
- **Sıradaki Adımlar:**
  - Celsus erdem heykelleri (Viyana Sanat Tarihi Müzesi'ndeki CC0/kamu malı referanslar) ve taş ayrıntıları.
  - Hikâye metinleri (`HIKAYELERI-YENILE.bat`, el kontrolü).

## Kurallar

- Türkçe yaz. Kullanıcıya gereksiz soru sorma; kullanıcı çoğu zaman bilgisayar başında değil.
- Gönderme işini kullanıcı GONDER-N.bat ile yapar. Buluttan push yapılmaz, gönderilmiş geçmiş yeniden yazılmaz (AGENTS.md).
- `scripts/glb/recon-dev-patch.diff` (Reconstruction3DInner.tsx'teki 2 satır) asla commit edilmez.
- Gizli anahtarlar commit edilmez: `scripts/.gemini-key`, `scripts/.sketchfab-token`. E-posta adresi hiçbir yere gönderilmez.
- Lisans: uygulama ücretli satılacak. Yalnızca CC0, PDM ya da atıflı CC BY. NC, ND ve SA yasak. Heykel taramalarında orijinali İtalya, Vatikan, Yunanistan ve Türkiye dışındaki müzelerde olan eserler.
- Uygulama Google Play'de TWA (web uygulaması) olarak ücretli satılacak.

## YENİ YÖN (kullanıcı kararı, 2 Kasım)

- **Öncelik yapının kendisi**: gerçekçi ve olabildiğince doğru. Arazi ve ağaçlar ikinci planda, "inandırıcı zemin" yeter.
- **Hedef her zaman SAĞLAM DÖNEM**: yapıların bugünkü yıkık hâli değil, kullanıldıkları dönemdeki hâli. Bugünkü fotoğraflar yalnızca kanıt.
- Yöntem: her yapı için önce **yapı kartı** (`docs/yapi-kartlari/<yer>.md`). Her ölçü/öğe kaynaklı ve [K] kaynak / [F] fotoğraf / [T] tahmin etiketli. Sonra model bu karttan kurulur, sonra fotoğraflarla karşılaştırılır.
- Fotoğraflar (Wikimedia vb.) yalnızca modelleme referansı; uygulamaya konmaz (lisans kuralı geçerli).
- Bulut ortamında web araması kapalı ve upload.wikimedia.org'a erişim yok. Araştırma, kullanıcının bilgisayarındaki yerleşik tarayıcıyla yapılıyor (DuckDuckGo html, Commons API). ResearchGate bot doğrulaması istiyor; aşılmaz.
- Bulutta Blender yok; `pip install bpy==5.2.3 --break-system-packages` ile kuruluyor. 2 çekirdek: 960x540 / 24 örnek ≈ 4–5 dk/görünüm.

## Karanlık Kilise (ilk pilot yapı)

- Önemli bulgu: kilise peribacasına değil, **büyük kaya kütlesine oyulmuş manastır avlusunun** (5 × 14 m) içinde. Avlu cephesi iki katlı: alt katta kapılar + 19 kör niş + Malta haçları, üst katta revak (kubbeli/tonozlu bölmeler). Kilise üst seviyede, kuzeydeki kavisli merdivenle çıkılıyor. Fresk zeminleri koyu lacivert değil, **mavi-gri**.
- `docs/yapi-kartlari/karanlik-kilise.md`: yapı kartı (kaynaklar, sağlam dönem tamamlamaları, açık sorular).
- `scripts/blender/karanlik_hd.py` (**v2**, iç mekân dahil). Narteks, mezar odası, naos (4 sütun, 5 kubbe, 3 apsis), yemekhane, alt kat odaları ve kandiller eklendi. `--pano` ile 5 adet 360° görüntü üretiyor. **KARANLIK-HD.bat** bunları ekran kartıyla işler, çıktı `hd-out\karanlik`; kullanıcı "karanlik hd hazir" yazınca 360°'leri `public/hd/goreme-kaya-kiliseleri/`'ne koy, `hd-files.json`'u güncelle, GONDER-15'i hazırla. Önizleme: `Claude outputs\karanlik-v2-onizleme.jpg`. Freskler şimdilik yer tutucu (figür uydurulmadı).
- v1 açıklaması: kaya kütlesi, avlu, alt kat cephesi, sağlam alt revak tavanı, sağlam üst revak (ön duvar + pencereler, kubbe/tonoz bölmeleri), narteks penceresi, merdiven girişi, aşı boyası madalyon ve şeritler. 4 görünüm. Önizleme: `Claude outputs\karanlik-v1-onizleme.jpg`.
  - Çalıştırma: `blender -b --factory-startup --python scripts\blender\karanlik_hd.py -- --out hd-out\karanlik --res 1920x1080 --samples 256 --gpu`
  - Boolean: kesiciler tek tek uygulanıyor, çökerse kaydırıp yeniden deneniyor. Kaya kütlesi tek parça yumuşak deformasyonla yapılıyor (yüz yüz oynatma kendini kesiyordu).
- **Sıradaki (Karanlık):**
  1. Gerçek fresk görüntüleri: Commons'taki CC0 / CC BY fotoğraflar (SA olanlar olmaz), karttaki yerlerine.
  2. Kubbe ve tonoz geçişlerini (pandantif, kemerler) inceltmek.
  3. Malzeme gerçekçiliği: CC0 taranmış tüf/sıva dokuları (Poly Haven / ambientCG), keski izleri.
  4. Ölçüler: Rodley 1985 planını ya da bir rölöveyi bul; [T] ölçüleri düzelt.
- `goreme_hd.py`: vadi düzeltmeleri (basamaklı tüf katmanları, peribacası çeşitleri, renk farkı, yıpranmış cephe, kesim güvenliği) yazıldı. **Ancak peribacasına oyulmuş kilise yanlış**; Karanlık modeli hazır olunca vadiye o yerleştirilecek. GOREME-HD.bat şimdilik çalıştırılmasın.

## HEP GÜNDÜZ + PISIR-WEB (4 Kasım gece) — EN GÜNCEL

- **Kullanıcı kararı:** gün/akşam/gece ayrımı kalktı; her yer gündüz, Mozaik3D gibi temiz ve net. Reconstruction3D'de ışık düğmeleri, "zaman akışı" anahtarı ve foto modundaki ışık düğmesi kaldırıldı (atmos sabit "day").
- **Unity bake'leri web için kusurlu:** akşam ışığı (cepheler gölgede) ve ağır yerlerde (Hierapolis, Side, Pergamon, Halikarnas) bake öncesi `gltfpack -si` sadeleştirmesi oturma sıralarını parçalamış (Hierapolis'te "kırık cam" görünümü; ham Unity dosyasında da var). Bu yüzden web için hepsi YENİDEN pişirilecek.
- **Yeni ön ayar `clear`** (antik_bake.py): güneş 42°, güneş yönü uygulamanın açılış görünüşünden (`<id>-view.json`, export-glb yazar; `ANTIK_VIEW`): izleyicinin omzunun üstünden, 35° yandan. Celsus bulutta pişti (2048/96, ~35 dk CPU), web'de temiz ve parlak (`Claude outputs\celsus-gunduz.png`). baked-sites.ts artık yalnızca bunları listeler: `celsus-kutuphanesi`.
- **PISIR-WEB.bat** (scripts/glb/pisir-web.ps1): kullanıcının bilgisayarında, ekran kartıyla: araçları kurar (scripts/glb/package.json: playwright 1.48.2, gltf-transform 4.1.1, gltfpack 0.24.0, sharp 0.33.5), dev yamasını uygular, vite 5180'i açar, her yer için export-glb → Blender `clear 2048 160` → web_pack.mjs → public/baked; sonunda dev yamasını geri alır ve baked-sites.ts'yi yeniden yazar. Liste: scripts/glb/web-sites.txt (şimdilik 9 vitrin yeri). Günlük: hd-out\pisir\<id>.log. Windows'ta HENÜZ DENENMEDİ (bulutta PowerShell yok). Skirt (ufuk halkası) üretmez; eski Unity skirt'leri kalır.
- **PISIR-WEB 1. deneme:** Aspendos ekran kartıyla ~2,5 dk'da pişti (HIP çalışıyor), ama web_pack.mjs düştü: bun Windows'ta node_modules/.bin/*.cmd yapmıyor → araçlar artık `node <paket>/cli.js` ile çağrılıyor. Sonra vite kapanmış, kalan 7 yer 'connection refused'. Düzeltmeler: her yer öncesi sunucu kontrolü/yeniden açma; Blender çökerse az bitkiyle, sonra işlemciyle (ANTIK_CPU=1) yeniden dener; blender.crash.txt loga eklenir.
- **PISIR-WEB 2. deneme: 9 yerin hepsi pişti** (yer başına ~2-5 dk, ekran kartı). Bulutta kontrol edildi: gündüz, temiz; Hierapolis sıraları düzgün. GONDER-27 hazır (git add -A public\baked). Kalan görsel sorunlar: Aspendos'ta tiyatronun arkasındaki toprak set düz gri (dokusuz), Nemrut tümülüsünde beyaz leke biçimli doku/ışık hatası. Sonraki: kalan 36 yeri web-sites.txt'ye ekleyip PISIR-WEB (repo boyutu ~350 MB artar; Vercel sınırı izlenmeli), sonra insanlar.
- (eski) Sırada: kullanıcı GONDER-26 → PISIR-WEB.bat → "pisirme bitti" → logları oku, sorun yoksa GONDER (public\baked + baked-sites.ts). Sonra insanlar.

## PİŞMİŞ IŞIK YAYGINLAŞTIRMA (4 Kasım gece)

- **Güncelleme (GONDER-25):** Kamera durunca görüntü kararıyordu: kalite modu (GTAO + OutputPass, bilgisayarda varsayılan açık) pişmiş modeli ikinci kez tonluyor ve gölgeliyordu. Pişmiş model varken kalite modu atlanır.
- **Güncelleme (GONDER-24):** Kullanıcı akşam açılışını çok koyu buldu, gündüz görünümünü beğendi → sahne yine **Gündüz** açılır. Ton: ışık oranının çoğu parlaklık, %35'i renk; en fazla %15 parlaklaşır (tam renk oranı gündüzde maviye/çok açığa kaçıyordu).
- Kullanıcı: "Mozaik3D estetiği; kalanları yap". Sıra: (1) ışık/gök + yayma [YAPILDI, bu bölüm], (2) insanlar, (3) taş ayrıntısı, (4) heykeller.
- **Düzeltilen hata:** ışık haritaları sRGB PNG'dir (antik_bake.py "ışığın yarısı, sRGB") → web'de `SRGBColorSpace` (önce doğrusal okunuyordu; soluk/yıkanmış görünüyordu).
- Pişmiş model akşam ("golden", güneş 16°) ışığıyla pişti → `?pilot=1` açılınca sahne **akşam** ışığında başlar (Reconstruction3D useEffect). Gün/gece seçilirse pişmiş renkler arazi oranıyla boyanır (`setLight`, preset bake.json'dan).
- Gök: `baked-scene.ts` içinde katman bulut kubbesi (fbm gölgelendirici), web'in top bulutları gizlenir.
- **Paketleme:** `scripts/glb/web_pack.sh <Unity Baked klasörü> <id>`: bölünmüş Unity dosyaları birleşir (gltf-transform merge+dedup), JPEG, gltfpack `-cc` (meshopt; yükleyici MeshoptDecoder kullanır), ışık haritaları JPEG. Celsus 25 MB → 8,5 MB. Bulutta gereken: `npm i -g gltfpack@0.24.0 @gltf-transform/cli@4.1.1`.
- **Yayın (GONDER-23, henüz çalıştırılmadı):** 9 yer `src/lib/baked-sites.ts`: celsus, aspendos, göbeklitepe, ayasofya, termessos, hierapolis, nemrut, pergamon-zeus, side-tiyatrosu (toplam ~98 MB). Hepsi hâlâ yalnızca `?pilot=1` ile.
- **Kalan 36 yer** bulutta paketlendi ama gönderilmedi (toplam 45 yer = 452 MB; repo/Vercel boyutu için önce 9 yerle deneniyor). Yeniden üretmek için: Unity Baked dosyalarını stage et → web_pack.sh. Sümela (7 parça, ~150 MB) web için fazla büyük, paketlenmedi. Artemis 28 MB, en ağırı.
- Bilinen sorunlar: (a) Unity bake'leri 30 Ekim–1 Kasım tarihli; web modeli o tarihten sonra değiştiyse pişmiş model eski kalır. (b) Akşam ışığında yamaçlar (Aspendos tepesi, Nemrut tümülüsü) koyu; Unity'deki zemin ayrıntı gölgelendiricisi (_DETAIL, _STONE) web'e taşınmadı. (c) "day" ön ayarıyla bulutta deneme: Celsus cephesi gri/donuk çıktı (güneş 55°, azim -140 ya da 40); Mozaik parlaklığı için ara bir ön ayar (≈35°) denenmeli. (d) Celsus salonunun tavanı yok (modelin bilinçli tercihi: 2 mi 3 kat mı tartışmalı).
- Cloud dışa aktarma: `git apply scripts/glb/recon-dev-patch.diff` (yalnız bulutta, commit ETME) + `bunx vite dev --port 5180` + `node scripts/glb/export-glb.mjs <id> <out>`; Celsus building.glb 137 MB.

## PİLOT DURUMU (4 Kasım akşam) — EN GÜNCEL

- **Bulgu:** Unity için 24 yerin Blender'da pişirilmiş modelleri zaten var (`unity/AntikViewer/Assets/Antik/Baked/<id>-baked.glb` + `-near/-ground/-terrain-golden.png` ışık haritaları + `-bake.json`, `-skirt.glb`). Bunlar web'in kendi modelinden (heykeller, yazıtlar, kapı, ağaçlar dahil) üretilmiş. Bu yüzden HD Blender modelinden pişirme (`bake_glb.py`, `CELSUS-PISIR.bat`) gereksiz kaldı; CELSUS-PISIR.bat çalıştırılmasın.
- **Yapıldı:** `src/lib/baked-scene.ts` + Reconstruction3D(Inner) değişikliği: `?pilot=1` ile pişmiş Celsus web'de gösterilir (`public/baked/celsus-kutuphanesi/`, ~25 MB). Unity gölgelendiricisinin hesabı: doku × renk × köşe rengi × ışık haritası(uv1) × 2, MeshBasicMaterial, toneMapped false. Web'in binası/arazisi/taramaları/sabit eşyası gizlenir; insanlar, yazıtlar, ateş, kuş, gök kalır. tsc temiz; bulutta testler (ses dosyaları hariç tutulduğu için düşen 9'u dışında) geçti. Karşılaştırma: `Claude outputs\celsus-pilot-karsilastirma.jpg`.
- **GONDER-22.bat** hazır (henüz çalıştırılmadı): pilotu ve araçları gönderir.
- Bulutta çalışma: kullanıcı BULUTA-PAKETLE.bat → `buluta-paket.tar` (src, public/scans, ayarlar) → bulutta `/home/claude/app`, `bun install`, `bunx vite dev --port 5173`. Ekran görüntüsü: Playwright + `window.__recon` (yalnız dev), canvas toDataURL (swiftshader yavaş; screenshot zaman aşımına düşüyor).
- **Mozaik'e kalan farklar (sıradaki):** (1) gök: bulutlu, daha parlak öğle ışığı (bake "golden" 16° güneş → "day" ön ayarı denenmeli), (2) insanlar: şu an küçük, basit figürler → gerçekçi (CC0 MakeHuman + dönem kıyafeti + hareket), (3) heykellerin ayrıntısı, (4) yükleme boyutu (20 MB GLB telefonda ağır: meshopt/KTX2 ya da karolu yükleme), (5) diğer 23 yer için aynı geçiş.

## YENİ HEDEF (4 Kasım, kullanıcı kararı): Mozaik3D estetiği

- Kullanıcı Mozaik3D "Akropolis" ekran görüntüleri gönderdi: hedef bu seviyeye "çok yakın" bir sahne; **yapı + gerçekçi insanlar + heykeller + dolu çevre**. (Mozaik'ten hiçbir şey kopyalanmaz; yalnızca yöntem.)
- Yöntem: HD Blender modeli → ışık/gölge/AO dokuya pişirilir → uygulamada ışıksız (MeshBasicMaterial) gösterilir.
- **Yapıldı:** `scripts/blender/bake_glb.py` (bulutta yazıldı, bilgisayar çevrimdışıydı; `Claude outputs`/pilot'tan repoya kopyalanmalı) ve `CELSUS-PISIR.bat`. Yöntem: renk (COLOR) ve ışık (DIRECT+INDIRECT) ayrı pişirilir, ışık OIDN ile temizlenir (yardımcı sahnede birleştirici), çarpılır, AgX ile tonlanıp JPEG. Gruplar: önü / arkası (`--split-y 1.0`, iç mekân ayrı pozlama `--exposure-arka 0.4`) / zemin (meydan). Arazi atılır (uygulamanın kendi arazisi var). Celsus: ~61 bin yüz, GLB ~4 MB + dokular. Bulut denemesi (1024 px, 32 örnek, gerçek doku yok) iyi; önizleme `celsus-pismis-ilk-deneme.jpg`.
- **Sırada:** (1) Bilgisayar bağlanınca bake_glb.py + bat'ı repoya koy; kullanıcı CELSUS-PISIR.bat çalıştırır → "pisirme bitti". (2) Reconstruction3DInner.tsx'in Celsus'u nasıl kurduğunu incele; pişmiş GLB'yi önce `?pilot=1` ile göster, eskiyle karşılaştır. (3) İnsanlar: CC0 MakeHuman/MPFB gövdeleri + dönem kıyafeti + hareket; uygulamadaki mevcut insanlardan (scene-life, people-batch) yola çık. (4) Heykeller: Celsus'un 4 erdemi (asılları Viyana'da → lisans kuralına uygun), gerçek eserlere dayanarak.
- Bulut ağı yalnızca paket kayıtlarına açık (pypi/npm); Poly Haven, MakeHuman vb. indirmeler kullanıcının bilgisayarında bat ile yapılmalı. Bulut önizleme: three.js + Playwright (swiftshader).

## EN SON DURUM (2 Kasım gece, sonraki oturum)

- **Kullanıcı kararı: HD/Blender işi şimdilik DURUYOR.** GONDER-16 ile 360°, kaynak ("nereden biliyoruz") bölümleri siteden kaldırıldı; GONDER-17 eski "bugün ve antik çağda" kaydırıcısını (CompareSlider) geri getirdi. GONDER-18/19 Celsus cephe taraması önizlemesi denendi, GONDER-20/21 ile tamamen geri alındı. `Reconstruction3D.tsx` artık yalnızca CompareSlider'ı kullanıyor (HdPanoramas/EvidencePanel bağlı değil).
- Celsus HD (CELSUS-HD.bat) 3 dış görünümü işledi, 4. görünümde (salon içi) log uyarısız kesildi; BITTI yok, 360° ve kıyas üretilmedi. HD'ye dönülürse: kaldığı yerden süren bir bat yapılmalı (`--views 3` + `--pano`), gerekirse iç görünüm CPU ile.
- Test (TEST-CALISTIR.bat, paket kurulumuyla): tsc hatasız, **547 test geçti, 0 hata**.
- Hikâye yeniden yazımı (2 Kasım akşam ilk deneme): Gemini kotası dolmadan yalnızca 4 TR dosyası çıktı (`scripts\rewrite-out2\tr`: aphrodisias-stadyumu [hiç değişmedi, yarın yeniden denenir], artemis, aspendos, celsus). Claude kontrol etti ve rewrite-out2'deki dosyalarda düzeltti: Aspendos "en bütün yapı" → "en bütün tiyatro", "duvardaki oyuklar" kaldırıldı; Celsus "Binlerce rulo", "gizli oda", "kurucusu" (Celsus kurucu değil, oğlu Aquila yaptırdı), "döneme ait heykel", "simgesi" kaldırıldı. Betik değişmiş bölümleri atladığı için düzeltmeler korunur. **Ders:** Gemini süslerken yeni olgu ekliyor (sayı/özel ad olmayanlar check-stories'den kaçar); her dosya elle okunmalı.
- Unity: buluttaki zincir (/tmp/claude-0/chain17.sh, pipe/…) yeni bulut ortamında YOK; yeniden kurulması gerekir.
- **Sıradaki:** (1) ~~Testler~~ tamam. (2) HIKAYELERI-YENILE.bat → "hikayeler gonderildi" → check-stories, aktar, audio-script, SESLENDIR-GEMINI. (3) Unity'ye dönülecekse zinciri yeniden kur.

## SON DURUM (2 Kasım gece) — eski

- KARANLIK-HD.bat ekran kartıyla işlendi. İlk denemede fresk yolu göreliydi ve Wikimedia 7 fotoğrafı vermedi; ikisi de düzeltildi.
- GONDER-15 çalıştı: commit 109588e push edildi, hd-files.json'da Karanlık'ın 5 adet 360° görüntüsü ve kıyas görüntüsü var. Testlerin çalıştığına dair çıktı bulunamadı; **TEST-CALISTIR.bat** ile `test-sonucu.txt` okunmalı.
- Sırada: CELSUS-HD.bat → kontrol → ASPENDOS-HD.bat → AYASOFYA-HD.bat → yeni bir GONDER. GONDER-15 tekrar çalıştırılabilir, varsa yeni çıktıları da kopyalar.
- Karanlık için yapılacaklar:
  - Orta kubbe boş: Pantokrator için yalnızca SA fotoğraflar var.
  - Sütunlardaki kırmızı çizgiler inceltilecek.
  - Kandiller zincirli ve daha küçük yapılacak.
  - Fresklerdeki kazıma izlerine sağlam dönem rötuşu yapılacak.

## Bu oturumun önceki durumu (kullanıcı dışarıdayken yapılanlar)

- **Bekleyen (kullanıcı evde):** önce **KARANLIK-HD.bat** çalıştırılacak. Bu bat önce 13 fresk fotoğrafını Commons'tan `gorseller-ai\karanlik-fresk`'e indirir (curl), sonra ekran kartıyla işler. Kullanıcı "karanlik hd hazir" yazınca → çıktılara bak → **GONDER-15.bat**. GONDER-15, 360°leri `public\hd\goreme-kaya-kiliseleri`'ne kopyalar, `hd-files.json`'u PowerShell ile üretir ve gönderir. Gerekirse **CELSUS-HD.bat** de çalıştırılabilir.
- Uygulama: `src/lib/panoramas.ts` Karanlık'ın 5 adet 360° görüntüsünü (avlu, üst revak, narteks, naos, yemekhane) TR/EN başlık ve notlarla tanımlıyor; `credit` alanı eklendi. `HdPanoramas.tsx` atfı gösteriyor (CC BY 4.0, Jose Huwaidi). Göreme'nin eski 4 girişi kaldırıldı. tsc/test bulutta çalıştırılamadı; GONDER-15'ten önce yerelde `bun test` iyi olur.
- Freskler: `scripts/blender/karanlik-freskler.json` (13 fotoğraf, yalnızca CC BY ve kamu malı; yer, yazar, lisans). `karanlik_hd.py --frescoes <klasör>` fotoğrafları karttaki yerlerine düzlemsel izdüşümle koyuyor. Yönler sahte görsellerle denendi; gerçek fotoğraflarla sonuç henüz görülmedi.
- Ölçü: Karanlık için ölçekli plan açık kaynakta bulunamadı (Rodley 1985, Kostof 1972 kütüphane/ödünç). Açık soru olarak kalıyor.
- **Celsus Kütüphanesi (ikinci yapı):** `docs/yapi-kartlari/celsus-kutuphanesi.md` (ana kaynak FE V.1; cephe 21 m × >16 m, salon 16,7 × 10,9 m, kürsü 0,94 m, nişler 2,55 × 0,57 m) ve `scripts/blender/celsus_hd.py` v1 yazıldı. Model: 9 basamak; alt kat 4 çift kompozit sütun, 3 kapı, kafesli pencereler, 4 erdem nişi; üst kat 3 çift Korint sütunu, üçgen ve segmental alınlıklar; salon iki katlı galeri, nişler, apsis, oculus. **CELSUS-HD.bat** var. Önizleme: `Claude outputs\celsus-v1-onizleme.jpg`. Eksik: heykeller (lisanslı tarama yok), cephe kabartmaları ve yazıtlar, mermer kaplama çeşitliliği, ölçü doğrulaması (kat yükseklikleri [T]).
- Celsus v1b: frize kabartma dokusu, saçaklık altlarına kaset eklendi (`Claude outputs\celsus-v1b-detay.png`).
- Heykel araştırması (Celsus): Sketchfab'da Viyana Ephesos Müzesi'nden CC BY "Roman Portrait Statue from Ephesus" (iedu360.eu, uid 038788b721f240728814a6fa2cb8f152) var. Erdem heykelleri için uygun lisanslı kadın heykeli taraması bulunamadı. SMK Polyhymnia'nın (KAS252) orijinalinin bulunduğu müze belirsiz; Pudicitia (KAS199) Vatikan'da olduğu için olmaz. Temsili heykel koymak doğruluğu bozacağından nişler boş bırakıldı.
- **Aspendos Tiyatrosu yapı kartı** yazıldı: `docs/yapi-kartlari/aspendos-tiyatrosu.md` (çap 96 m, orkestra 23,9 m, sahne cephesi 15,7 m, 41 sıra, katta 20 sütun, 5 kapı, Dionysos alınlığı, eğimli ahşap sahne çatısı, velarium). **Model v1 yazıldı**: `scripts/blender/aspendos_hd.py` (+ ortak yardımcılar `scripts/blender/antik_mimari.py`; İon başlık eklendi). Model şunları içeriyor:
  - 41 sıralı cavea: diazoma, 10+21 merdiven, proedria.
  - 59 kemerli galeri ve 58 velarium direği, keten şeritler.
  - 5 aediculalı iki katlı sahne cephesi: 20+20 sütun, 5 kapı, alınlıklar, ortada kabartmalı timpanon.
  - Eğimli ahşap sahne çatısı, yan kanatlar, parodoslar, tribunaller.
  - Dış cephe pencereleri.
  - **ASPENDOS-HD.bat** var. Önizleme: `Claude outputs\aspendos-v1-onizleme.jpg`.
  - Eksik: heykeller, Dionysos kabartmasının gerçek modeli, ölçü doğrulaması (Sear / De Bernardi planları).
- **"Bugün / sağlamken" kaydırıcısı** eklendi:
  - Dosyalar: `src/lib/compare-views.ts` ve `src/components/CompareSlider.tsx`. Rekonstrüksiyon sayfasında HdPanoramas'ın üstünde duruyor.
  - Bugünkü fotoğraflar (atıfları `photo-credits.ts`'de):
    - Karanlık: Cobija, CC0
    - Celsus: lensnmatter, CC BY 2.0
    - Aspendos: Nicola Feola, CC BY 3.0
  - Sağlam hâl görüntüsünü her betiğin KIYAS görünümü üretiyor: `<yer>-kiyas-<ad>.jpg`, 1920×1280.
  - Kaydırıcı, `hd-files.json`'da görüntü varsa görünür. GONDER-15 kıyas görüntülerini de kopyalıyor.
  - `panoramas.ts`'e Celsus (3) ve Aspendos (3) adet 360° görüntüsü eklendi.
- **Gerçek dokular:** `scripts/blender/dokular.json` (8 Poly Haven CC0 doku + yapı başına malzeme eşleşmesi) ve `antik_mimari.apply_dokular`. Her *-HD.bat dokuları `gorseller-ai\dokular`'a indirip `--dokular` ile veriyor. Yapay dokularla denendi, hata yok; gerçek dokularla görünüm, kullanıcı işleyince görülecek.
- **Ayasofya yapı kartı:** `docs/yapi-kartlari/ayasofya.md`. Hedef 562 hâli; payandalar, minareler ve Osmanlı eklemeleri çıkarılacak. Ölçekli plan gerekiyor (Mainstone 1988).
- **Anlatım düzeltildi:** `narration-stories/{tr,en}/site-goreme.json`. "structure-1": Karanlık bir manastırda, peribacasında değil. "facts": "on yıl" ve "eşsiz mavi" kaldırıldı, "altından pahalı" yumuşatıldı. Yeni sayı ya da özel ad eklenmedi, uzunluk ≤1,6×. `check-stories` yerelde doğrulanmalı. Göreme sesleri bu iki bölüm için yeniden üretilmeli (SESLENDIR-GEMINI).
- **"Bunu nereden biliyoruz?" bölümü:** `src/lib/evidence.ts` ve `src/components/EvidencePanel.tsx`. Karanlık, Celsus ve Aspendos için kaynak / bugünkü yapı / canlandırma etiketli maddeler ve kaynak listesi. Yalnızca HD görüntüler varken görünür.
- **Ayasofya v1:** `scripts/blender/ayasofya_hd.py` ve **AYASOFYA-HD.bat**. Model, 562 hâli:
  - Pandantifli kubbe ve 40 pencere, iki yarım kubbe, dört eksedra, apsis.
  - Galeriler ve yeşil mermer sütunlar, timpan pencereleri.
  - Narteks ve imparator kapısı, altın mozaik ve mermer kaplama.
  - Önizleme: `Claude outputs\ayasofya-v1-onizleme.jpg`.
  - Eksik: atriyum, dış narteks ayrıntısı, ambon/templon, sepet başlıklar (şimdilik Korint), ölçekli plan.
  - `antik_mimari.apply_cuts` artık `use_hole_tolerant` kullanıyor; Ayasofya'da kesim sırasında içeride hayalet katı kalıyordu.
- Anlatım kontrolü: `docs\anlatim-kontrol-goreme.md`. Göreme hikâyesinde Karanlık'ı peribacasında gösteren cümle, "10 yıl" restorasyon ve "eşsiz mavi" ifadeleri düzeltilmeli.

## Durum

- **Kalite modu takılması:** Düzeltildi (yarım çözünürlüklü ambient occlusion, yalnızca kamera dururken). GONDER-13 ile gönderildi.
- **Blender:** Kullanıcının bilgisayarında Blender 5.2.3 var ve RX 7700 XT'yi HIP ile kullanabiliyor.
- **Görseller:** Nano Banana, AI Studio'da artık ücretli. gemini.google.com'da ücretsiz; Claude bunu Chrome eklentisiyle kullandı. Göreme için 14 görsel indirildi (`İndirilenler\goreme-*.png`):
  - konsept: dis-genel, dis-cephe, ic-nef, ic-apsis
  - dokular: doku-tuf, doku-asinmis, doku-bazalt, doku-fresk, doku-asi-boyama, doku-zemin
  - freskler: fresk-azizler, fresk-kubbe, fresk-sahne, fresk-apsis

  GOREME-HD.bat bunları `gorseller-ai\goreme` klasörüne taşır.

- **Göreme HD (pilot):**
  - `scripts/blender/goreme_hd.py` (+ `goreme-layout.json`) Blender'da gerçek kaya peribacaları kurar: yağmur olukları, tüf katmanları, bazalt şapkalar, boolean ile kayaya oyulmuş kilise cephesi.
  - Karanlık Kilise'nin içi de var: çapraz plan, 4 sütun, kubbe, 3 apsis, fresk malzemesi, kandiller.
  - Ağaçlar `scripts/glb/antik_trees.py` ile üretiliyor.
  - Çıktı: 5 sabit görünüm ve `--pano` ile 4 adet 360° görüntü (vadi, kilise-onu, kilise-ici, sirt).
  - Önizleme kullanıcıya gönderildi ve **onay bekleniyor**.
  - Bilinen zayıflıklar: zemin ve sırtlar düz kum gibi, peribacaları birbirine benziyor, cephe fazla temiz.
- **Uygulamada 360°:** `src/lib/panoramas.ts`, `src/lib/hd-files.json` (şimdilik `[]`), `src/components/PanoramaViewer.tsx` ve `HdPanoramas.tsx` eklendi; bölüm rekonstrüksiyon sayfasında, ScanGallery'den önce. Görüntüler `public/hd/<id>/` klasörüne konup `hd-files.json`'a yazılınca görünür. tsc, eslint ve 547 testin hepsi geçti.
- **Bekleyen bat dosyaları:**
  - **GONDER-14.bat** (henüz çalıştırılmadı): Göreme HD aracını, 360° bölümünü ve GLB malzeme adlarını gönderir.
  - **GOREME-HD.bat**: Görselleri taşır ve Blender'ı ekran kartıyla çalıştırır (1920x1080, 256 örnek, ayrıca 4096'lık 360° görüntüler). Çıktısı `hd-out\goreme`. Kullanıcı bitince "goreme hd hazir" yazacak. Sonra Claude 360° JPG'leri `public/hd/goreme-kaya-kiliseleri/` klasörüne koyup `hd-files.json`'u günceller ve yeni bir GONDER-15 hazırlar.
- **Hikâye yeniden yazımı:** Gemini'nin günlük ücretsiz kotası dolduğu için duruyor. Kullanıcı öğleden sonra HIKAYELERI-YENILE.bat'ı yeniden çalıştıracak. Çıktı `scripts\rewrite-out2`'ye düşer. Sonra sırasıyla:
  1. check-stories ile doğrula.
  2. `src/lib/narration-stories` içine aktar.
  3. audio-script'i yeniden dışa aktar.
  4. SESLENDIR-GEMINI.bat (ses: Sulafat) her gün çalıştırılır.
- **Unity:**
  - Bulutta çalışan zincir: `/tmp/claude-0/chain17.sh` → `pipe/driver11.sh`; günlük dosyası `/tmp/claude-0/driver13.log`.
  - Ortam yeniden başlayınca şunlar yeniden çalıştırılır: `pipe/vitekeep.sh`, `/tmp/claude-0/httpkeep.sh`, `chain17`.
  - Aktarılanlar `unity\AntikViewer\Assets\Antik\{Baked,Life}` klasöründe: Termessos, Laodikeia, Magnesia, İstanbul ×5, Assos, Letoon, Myra, Karahan Tepe, Alacahöyük.
  - Bitti ama **aktarılmadı**: Aspendos Su Kemeri, Derinkuyu. Aktarma: `pipe/stage10.sh <id>` → `commitlist.py` → `device_commit_files`.
  - Kalanlar: Göreme, Divriği, Arslantepe, Hierapolis, Efes tiyatrosu, Side tiyatrosu, Pergamon Trajaneum, Nemrut, Aspendos tiyatrosu.

## Sıradaki işler

1. Kullanıcı KARANLIK-HD.bat çalıştıracak. Sonra 360°leri uygulamaya ekle (GONDER-15). Ardından freskler, malzemeler, ölçü doğrulaması.
2. Karanlık bitince Göreme vadisine yerleştir, 360° görüntüleri üret, uygulamaya ekle, GONDER-15.
3. Aynı yöntemle (önce yapı kartı, sonra model; hep sağlam dönem) diğer vitrin yerlerine geç (yer başına `scripts/blender/<yer>_hd.py`): Efes Celsus, Aspendos, Göbeklitepe, Ayasofya, Termessos, Hierapolis, Nemrut, Pergamon, Side. Her yer için önce Gemini'de konsept görselleri ve dokular üret.
4. Hikâye yeniden yazımı ve seslendirme (yukarıdaki adımlar).
5. Unity'de kalan yerleri işlet ve aktar.
6. İsteğe bağlı: eksik inen SMK heykel taramalarını (aphrodite-urania, pergamon-dionysos) yeniden indir.
