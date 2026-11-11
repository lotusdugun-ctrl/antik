@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Pisirme betigi duzeltmesi; siyah sutunlu 11 tapinak gecici olarak pismis listeden cikar
git checkout main
if errorlevel 1 goto hata
git add scripts/glb/antik_bake.py
git add src/lib/baked-sites.ts
git add YENIDEN-PISIR.bat
git add GONDER-49.bat
git commit -m "fix(bake): bos atlas dokulerini doldur (siyah sutun hatasi); 11 tapinak yeniden pisirilene kadar pismis listeden cikti"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo GONDERILDI!
pause
exit /b 0
:hata
echo Bir hata olustu. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
