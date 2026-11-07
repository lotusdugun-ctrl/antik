@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Yeni 4 antik kent entegrasyonu (Pompeii, Eboracum, Nimes, Trier), tum testler 559/559 geciyor
git checkout main
if errorlevel 1 goto hata

git add src/components/Reconstruction3DInner.tsx
git add src/lib/__tests__/epigraphy.test.ts
git add src/lib/__tests__/reconstructions.test.ts
git add src/lib/__tests__/sites.test.ts
git add src/lib/__tests__/soundscapes.test.ts
git add src/lib/hd-files.json
git add src/lib/models/hadrian-tapinagi.ts
git add src/lib/models/on-yeni-life.ts
git add src/lib/panoramas.ts
git add src/lib/pass.tsx
git add src/lib/reconstruction-parts.ts
git add src/lib/reconstructions.ts
git add src/lib/scans.ts
git add src/lib/scene-life.ts
git add src/lib/site-details.ts
git add src/lib/site-facts.ts
git add src/lib/sites.ts
git add src/lib/soundscapes.ts
git add src/routeTree.gen.ts
git add docs/yapi-kartlari/eboracum.md
git add docs/yapi-kartlari/nimes.md
git add docs/yapi-kartlari/pompeii.md
git add docs/yapi-kartlari/trier.md
git add public/hd/
git add test-sonucu.txt
git add DEVAM-NOTU.md
git add GONDER-37.bat

git commit -m "Yeni 4 antik kent entegrasyonu: Pompeii, Eboracum, Nimes, Trier ve tum testler 559/559 yesil"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
echo Tamam!
pause
exit /b 0
:hata
echo Bir sorun cikti. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
