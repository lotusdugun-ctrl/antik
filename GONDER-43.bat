@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem 40 adet daha yeni antik kent ve 3D modelleri eklendi (toplam 131 model, 803/803 pass)
git checkout main
if errorlevel 1 goto hata

git add src/lib/sites.ts
git add src/lib/site-details.ts
git add src/lib/site-facts.ts
git add src/lib/soundscapes.ts
git add src/lib/reconstructions.ts
git add src/lib/scans.ts
git add src/lib/__tests__/epigraphy.test.ts
git add src/lib/__tests__/soundscapes.test.ts
git add src/lib/__tests__/scene-life.test.ts
git add docs/yapi-kartlari/
git add test-sonucu.txt
git add DEVAM-NOTU.md
git add GONDER-43.bat

git commit -m "feat: 40 yeni dunya antik kenti 3D modelleri ve detaylari (toplam 131 model, 803 pass)"
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
