@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Dunya antik kentleri ozgun mimari modelleri: Maya Piramitleri, Tang/Heian Saraylari, Misir Pilonlari, Tiwanaku Megalitleri (803/803 pass)
git checkout main
if errorlevel 1 goto hata

git add src/lib/models/dunya-modelleri.ts
git add src/lib/models/dunya-modelleri-life.ts
git add src/lib/reconstructions.ts
git add src/lib/reconstruction-parts.ts
git add src/lib/scene-life.ts
git add src/lib/scans.ts
git add src/lib/__tests__/epigraphy.test.ts
git add test-sonucu.txt
git add DEVAM-NOTU.md
git add GONDER-45.bat

git commit -m "feat(3d): Maya basamakli piramitleri, Uzak Dogu saraylari, Misir pilonlari ve Tiwanaku megalitleri ozgun mimari modelleri (803/803 pass)"
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
