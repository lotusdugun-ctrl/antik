@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem 9 yer gunduz isigiyla yeniden pisti (PISIR-WEB); eski aksam dosyalari silinir
git checkout main
if errorlevel 1 goto hata
git add -A public\baked
git add src\lib\baked-sites.ts scripts\glb\web_pack.mjs scripts\glb\pisir-web.ps1 scripts\glb\antik_bake.py GONDER-27.bat
git commit -m "9 yer gunduz isigiyla yeniden pisti (?pilot=1)"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo Tamam!
pause
exit /b 0
:hata
echo Bir sorun cikti. Ekran goruntusunu Claudea gonder.
pause
exit /b 1
