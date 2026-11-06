@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Yeni antik kentler HD betikleri: Pompeii, Eboracum, Nimes, Trier
git checkout main
if errorlevel 1 goto hata
git add scripts/blender/pompeii_hd.py scripts/blender/eboracum_hd.py scripts/blender/nimes_hd.py scripts/blender/trier_hd.py POMPEII-HD.bat EBORACUM-HD.bat NIMES-HD.bat TRIER-HD.bat DEVAM-NOTU.md GONDER-36.bat
git commit -m "Yeni antik kentler HD betikleri eklendi: Pompeii, Eboracum, Nimes, Trier"
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
