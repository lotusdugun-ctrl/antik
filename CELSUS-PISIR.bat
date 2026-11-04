@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Celsus: isigi ve golgeyi dokuya pisirilmis, telefona uygun GLB (Mozaik3D tarzi gorunum, pilot)
set "BL="
for /d %%D in ("%ProgramFiles%\Blender Foundation\Blender*") do if exist "%%D\blender.exe" set "BL=%%D\blender.exe"
if not defined BL ( where blender >nul 2>nul && set "BL=blender" )
if not defined BL (
  echo Blender bulunamadi.
  pause
  exit /b 1
)
echo Dokular kontrol ediliyor...
powershell -NoProfile -Command "$cfg = Get-Content -Raw -Encoding UTF8 'scripts\blender\dokular.json' | ConvertFrom-Json; foreach ($id in $cfg.dokular.PSObject.Properties.Name) { $d = Join-Path 'gorseller-ai\dokular' $id; New-Item -ItemType Directory -Force $d | Out-Null; foreach ($s in 'diff','rough','nor_gl') { $f = Join-Path $d ($id + '_' + $s + '_2k.jpg'); for ($i = 0; $i -lt 3; $i++) { if ((Test-Path $f) -and ((Get-Item $f).Length -gt 20000)) { break }; Remove-Item $f -ErrorAction SilentlyContinue; curl.exe -sSL -A 'AntikTurkiye-HD/1.0' -o $f ('https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/' + $id + '/' + $id + '_' + $s + '_2k.jpg'); Start-Sleep -Seconds 1 } } }"
echo Celsus pisiriliyor (ekran karti, 10-20 dakika surebilir)...
"%BL%" -b --factory-startup --python scripts\blender\bake_glb.py -- --scene scripts\blender\celsus_hd.py --name celsus --out hd-out\celsus-glb --dokular gorseller-ai\dokular --res 4096 --ground-res 2048 --samples 256 --split-y 1.0 --gpu > hd-out-celsus-pisir-log.txt 2>&1
findstr /C:"GLB:" hd-out-celsus-pisir-log.txt >nul
if errorlevel 1 (
  echo Bir sorun cikti. Claude'a "pisirme bitti" yazin, log dosyasini o okur.
  pause
  exit /b 1
)
echo.
echo Tamam! Claude'a "pisirme bitti" yazin.
pause
