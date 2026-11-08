@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem 40 yeni dunya kenti mimari model revizyonlari ve sahne yasami geometrisi (803/803 pass)
git checkout main
if errorlevel 1 goto hata

git add src/lib/reconstructions.ts
git add src/lib/reconstruction-parts.ts
git add src/lib/scene-life.ts
git add src/lib/scans.ts
git add src/lib/__tests__/epigraphy.test.ts
git add test-sonucu.txt
git add DEVAM-NOTU.md
git add GONDER-44.bat

git commit -m "fix(3d): 40 yeni antik kent mimari modelleri, sahne yasami ve geometri testleri 803/803 pass"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo Tamam!
pause
exit /b 0

:hata
echo Hata cikti!
pause
exit /b 1
