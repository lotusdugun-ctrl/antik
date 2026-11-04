@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Hep gunduz: gun/aksam/gece secimi kalkti; Celsus gunduz isigiyla yeniden pisti; PISIR-WEB araclari
git checkout main
if errorlevel 1 goto hata
git rm -q --ignore-unmatch public\baked\celsus-kutuphanesi\celsus-kutuphanesi-ground-golden.jpg public\baked\celsus-kutuphanesi\celsus-kutuphanesi-near-golden.jpg public\baked\celsus-kutuphanesi\celsus-kutuphanesi-terrain-golden.jpg
git add src\components\Reconstruction3D.tsx src\components\Reconstruction3DInner.tsx src\lib\baked-sites.ts public\baked\celsus-kutuphanesi scripts\glb\antik_bake.py scripts\glb\export-glb.mjs scripts\glb\package.json scripts\glb\web_pack.mjs scripts\glb\pisir-web.ps1 scripts\glb\web-sites.txt PISIR-WEB.bat GONDER-26.bat
git commit -m "Hep gunduz; Celsus gunduz isigiyla pisti; PISIR-WEB (ekran kartiyla web pisirme)"
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
