# scripts/glb — Unity uygulaması için dışa aktarma araçları

Web sahnesindeki modelleri ve canlı insanları Unity'ye (unity/AntikViewer) taşır.

| Dosya | Ne yapar |
|---|---|
| `export-glb.mjs` | Sahneyi `building` / `landscape` / `people` GLB dosyalarına böler. |
| `export-life.mjs` | Yürüyen insanları sabit saatle oynatıp kaydeder → `<id>-life.bytes` (Unity: `Assets/Antik/Life/`). |
| `antik_bake.py` | Blender'da ışık pişirme (`BLENDER-ISIK.bat` ile çalışır). |
| `recon-dev-patch.diff` | Sadece yerelde: `window.__recon`'a `lifeHandle` ve `life` ekler. **Commit etme.** |

Çalıştırma (geliştirici):

```
git apply scripts/glb/recon-dev-patch.diff
bunx vite dev --port 5180 --strictPort --host 127.0.0.1
node scripts/glb/export-life.mjs celsus-kutuphanesi out
git checkout src/components/Reconstruction3DInner.tsx
```

Not: betikler Playwright'ı `/opt/npm-tools/node_modules/playwright` yolundan yükler (bulut ortamı).
