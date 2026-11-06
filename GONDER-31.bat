@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Yapay zeka araclari icin proje kurallari (AGENTS.md) ve devam notu
git checkout main
if errorlevel 1 goto hata
git add AGENTS.md DEVAM-NOTU.md GONDER-31.bat GUNCEL-CEK.bat
git commit -m "Yapay zeka araclari icin proje kurallari ve devam notu"
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
