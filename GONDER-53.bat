@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem BABIL-PISIR bittikten sonra: yeni pismis Babil
git checkout main
if errorlevel 1 goto hata
git add public/baked/babil-kenti
git add src/lib/baked-sites.ts
git add GONDER-53.bat
git commit -m "feat(bake): Babil yeni geometriyle (Firat, 15 m Istar Kapisi) yeniden pisti"
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
