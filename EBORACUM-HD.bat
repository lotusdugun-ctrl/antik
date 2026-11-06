@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Eboracum (York), saglam donem (M.S. 2.; castellum): Blender'da kur ve ekran kartiyla isle
set "BL="
for /d %%D in ("%ProgramFiles%\Blender Foundation\Blender*") do if exist "%%D\blender.exe" set "BL=%%D\blender.exe"
if not defined BL ( where blender >nul 2>nul && set "BL=blender" )
if not defined BL (
  echo Blender bulunamadi.
  pause
  exit /b 1
)
rem Gercek dokular (Poly Haven, CC0): bir kez indirilir
echo Dokular indiriliyor...
powershell -NoProfile -Command "$cfg = Get-Content -Raw -Encoding UTF8 'scripts\blender\dokular.json' | ConvertFrom-Json; foreach ($id in $cfg.dokular.PSObject.Properties.Name) { $d = Join-Path 'gorseller-ai\dokular' $id; New-Item -ItemType Directory -Force $d | Out-Null; foreach ($s in 'diff','rough','nor_gl') { $f = Join-Path $d ($id + '_' + $s + '_2k.jpg'); for ($i = 0; $i -lt 3; $i++) { if ((Test-Path $f) -and ((Get-Item $f).Length -gt 20000)) { break }; Remove-Item $f -ErrorAction SilentlyContinue; curl.exe -sSL -A 'AntikTurkiye-HD/1.0' -o $f ('https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/' + $id + '/' + $id + '_' + $s + '_2k.jpg'); Start-Sleep -Seconds 1 } } }"
echo Eboracum HD isleniyor (5 gorunum + 3 adet 360 derece)...
"%BL%" -b --factory-startup --python scripts\blender\eboracum_hd.py -- --out hd-out\eboracum --dokular gorseller-ai\dokular --res 1920x1080 --samples 256 --gpu --pano --pano-samples 192 > hd-out-eboracum-log.txt 2>&1
findstr /C:"BITTI" hd-out-eboracum-log.txt >nul
if errorlevel 1 (
  echo Bir sorun cikti. hd-out-eboracum-log.txt dosyasinin son satirlarini Claude'a gonderin.
  pause
  exit /b 1
)
start "" "hd-out\eboracum"
echo.
echo Tamam! Claude'a "eboracum hd hazir" yazin.
pause
