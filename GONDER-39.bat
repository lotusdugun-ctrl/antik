@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Yeni 4 antik kentin (Pompeii, Eboracum, Nimes, Trier) pismis 3D modelleri eklendi (49/49 baked sites), tum testler 575/575 geciyor
git checkout main
if errorlevel 1 goto hata

git add public/baked/eboracum-kenti/
git add public/baked/nimes-kenti/
git add public/baked/pompeii-kenti/
git add public/baked/trier-kenti/
git add src/lib/baked-sites.ts
git add test-sonucu.txt
git add DEVAM-NOTU.md
git add GONDER-39.bat

git commit -m "Yeni 4 antik kent pismis 3D modelleri (Pompeii, Eboracum, Nimes, Trier), baked sites 49 oldu"
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
