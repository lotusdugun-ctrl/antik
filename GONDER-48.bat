@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Yeni kentlerin kontrolu: kamera anitlara odakli, geometri ve kultur duzeltmeleri
git checkout main
if errorlevel 1 goto hata
git add src/components/Reconstruction3DInner.tsx
git add src/lib/models/dunya-modelleri.ts
git add src/lib/models/dunya-modelleri-life.ts
git add src/lib/reconstruction-parts.ts
git add src/lib/reconstructions.ts
git add src/lib/scene-life.ts
git add src/lib/baked-sites.ts
git add DEVAM-NOTU.md
git add GONDER-47.bat
git add GONDER-48.bat
git commit -m "fix(3d): kent kamerasi ana aniti cerceveler; Misir hipostil salonu; merdiven, korkuluk ve kultur duzeltmeleri"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo.
echo GONDERILDI! Vercel dagitimi basladi.
pause
exit /b 0
:hata
echo Bir hata olustu, gonderim tamamlanamadi. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
