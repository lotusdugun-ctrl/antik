<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Antik Türkiye: proje kuralları (her yapay zekâ aracı için)

Bu dosyayı Codex, Claude, Antigravity vb. hepsi okur. İşe başlamadan önce
**`DEVAM-NOTU.md`** dosyasını baştan sona oku; en güncel durum en üstteki
bölümlerdedir. Oturum sonunda yaptıklarını ve sıradaki adımları DEVAM-NOTU.md'nin
en üstüne tarihli yeni bir bölüm olarak ekle.

## Çalışma düzeni
- Türkçe yaz. Kullanıcı çoğu zaman bilgisayar başında değil; gereksiz soru sorma.
- Kullanıcı Windows'ta; GitHub'a gönderme işini kendisi `GONDER-N.bat` dosyalarıyla
  yapar. Yeni bir gönderim gerekiyorsa bir sonraki numarayla bat hazırla
  (`git add <dosyalar>` → commit → `git pull --no-edit origin main` → `git push`).
- Gönderilmiş geçmiş asla yeniden yazılmaz (force push, rebase, amend yok; yukarıdaki Lovable notu).
- Repo ortaktır: `agtt` (kullanıcının arkadaşı) da `main` dalına gönderiyor. Çalışmaya
  başlamadan önce `git pull` ile güncel hâli al.
- Doğrulama: `bunx tsc --noEmit` ve `bun test` (TEST-CALISTIR.bat sonucu `test-sonucu.txt`'e yazar).

## Asla commit edilmeyecekler
- `scripts/glb/recon-dev-patch.diff` (yalnızca dışa aktarım için geçici yama).
- Gizli anahtarlar: `scripts/.gemini-key`, `scripts/.sketchfab-token`, `.env`.
- Kullanıcının e-posta adresi hiçbir yere yazılmaz/gönderilmez.

## Lisans (uygulama ücretli satılacak: Google Play TWA + web)
- Yalnızca CC0, kamu malı (PDM) ya da atıflı CC BY. NC, ND ve SA yasak.
- Heykel taramaları: orijinali İtalya, Vatikan, Yunanistan ve Türkiye dışındaki
  müzelerde olan eserler.
- Fotoğraflar yalnızca modelleme referansıdır; lisansı uygun değilse uygulamaya konmaz.

## İçerik ilkeleri
- 3D yapılar her zaman **sağlam dönem** hâliyle (yıkık bugünkü hâl değil), her zaman gündüz ışığında.
- Yapı kartları `docs/yapi-kartlari/<yer>.md`: her bilgi [K] kaynak / [F] fotoğraf / [T] tahmin etiketli.
- Hikâye metinlerine kaynaksız yeni olgu, sayı ya da özel ad eklenmez; her dosya elle kontrol edilir.

## Önemli yerler
- Pişmiş 3D modeller: `public/baked/<id>/`, liste `src/lib/baked-sites.ts` (PISIR-WEB.bat yazar).
- Antik Pass (ödeme henüz bağlı değil): `src/lib/pass.tsx`, `VITE_PAYWALL=1` ile açılır.
- Blender/pişirme betikleri: `scripts/blender/`, `scripts/glb/` (ekran kartı gerektirir, kullanıcının bilgisayarında bat ile çalışır).
