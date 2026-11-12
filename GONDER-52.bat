@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Dunya kentlerinde kultur temizligi + olcu dogrulama + Angkor hendegi + Babil Firat
git checkout main
if errorlevel 1 goto hata
git add src/components/scene/figure.ts
git add src/components/scene/life.ts
git add src/lib/baked-sites.ts
git add src/lib/models/inka.ts
git add src/lib/models/kent-dokusu.ts
git add src/lib/person-stories.ts
git add src/lib/reconstruction-parts.ts
git add src/lib/reconstructions.ts
git add src/lib/scans.ts
git add src/lib/scene-life.ts
git add src/lib/soundscapes.ts
git add src/lib/models/nabataean.ts
git add src/lib/models/pagoda.ts
git add src/lib/models/propylaia.ts
git add src/lib/world-stories.ts
git add DEVAM-NOTU.md
git add GONDER-52.bat
git add GONDER-53.bat
git add BABIL-PISIR.bat
git commit -m "feat(3d): dunya kentlerine kendi giysi, konusma ve hayvanlari (lama); pagodalar, Petra, Propylaia, Angkor hendegi, Babil'de Firat; kaynaksiz olculer duzeltildi"
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
