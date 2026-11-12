@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Yeniden pisirilen 16 yer + Machu Picchu ve Chichen Itza yeniden + bekleyen zemin dosyalari
git checkout main
if errorlevel 1 goto hata
git add public/baked/pompeii-kenti
git add public/baked/eboracum-kenti
git add public/baked/nimes-kenti
git add public/baked/trier-kenti
git add public/baked/aizanoi-zeus-tapinagi
git add public/baked/artemis-tapinagi
git add public/baked/assos-athena-tapinagi
git add public/baked/didyma-apollon-tapinagi
git add public/baked/efes-hadrianus-tapinagi
git add public/baked/letoon-leto-tapinagi
git add public/baked/magnesia-artemis-tapinagi
git add public/baked/pergamon-trajan-tapinagi
git add public/baked/priene-athena-tapinagi
git add public/baked/sardes-artemis-tapinagi
git add public/baked/side-apollon-tapinagi
git add public/baked/babil-kenti
git add src/lib/baked-sites.ts
git add src/lib/reconstructions.ts
git add src/lib/reconstruction-parts.ts
git add src/lib/scene-life.ts
git add src/lib/models/dunya-modelleri.ts
git add src/lib/models/inka.ts
git add src/lib/models/maya.ts
git add src/lib/landscape-plan.ts
git add src/components/scene/landscape.ts
git add src/components/Reconstruction3DInner.tsx
git add DEVAM-NOTU.md
git add GONDER-51.bat
git commit -m "feat(3d): 16 yer yeniden pisti (siyah sutun duzeldi); Machu Picchu inka kenti, Chichen Itza dort merdivenli El Castillo ve Maya top sahasi; kultur zeminleri"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo GONDERILDI! Vercel dagitimi basladi.
pause
exit /b 0
:hata
echo Bir hata olustu. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
