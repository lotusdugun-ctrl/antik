@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem 45 pismis model tum ziyaretciler icin varsayilan yapildi (?pilot=1 sarti kaldirildi)
git checkout main
if errorlevel 1 goto hata
git add src\lib\baked-scene.ts DEVAM-NOTU.md GONDER-29.bat
git commit -m "45 pismis model sitede varsayilan olarak yayina alindi"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo Tamam!
pause
exit /b 0
:hata
echo Bir sorun cikti. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
