@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Karanlik Kilise manastiri, saglam donem: Blender'da kur ve ekran kartiyla isle
set "BL="
for /d %%D in ("%ProgramFiles%\Blender Foundation\Blender*") do if exist "%%D\blender.exe" set "BL=%%D\blender.exe"
if not defined BL ( where blender >nul 2>nul && set "BL=blender" )
if not defined BL (
  echo Blender bulunamadi.
  pause
  exit /b 1
)
rem 1) Fresk fotograflari (CC BY 4.0 / kamu mali, Wikimedia Commons): bir kez indirilir
echo Fresk fotograflari indiriliyor...
powershell -NoProfile -Command "$d='gorseller-ai\karanlik-fresk'; New-Item -ItemType Directory -Force $d | Out-Null; (Get-Content -Raw -Encoding UTF8 'scripts\blender\karanlik-freskler.json' | ConvertFrom-Json) | ForEach-Object { $f = Join-Path $d ($_.key + '.jpg'); for ($i = 0; $i -lt 4; $i++) { if ((Test-Path $f) -and ((Get-Item $f).Length -gt 20000)) { break }; Remove-Item $f -ErrorAction SilentlyContinue; Start-Sleep -Seconds (3 + 5 * $i); curl.exe -sSL -A 'AntikTurkiye-HD/1.0 (Blender reconstruction)' -o $f $_.url }; if ((Test-Path $f) -and ((Get-Item $f).Length -lt 20000)) { Remove-Item $f; Write-Host ('inemedi: ' + $_.key) } }"
dir /b gorseller-ai\karanlik-fresk
rem Gercek dokular (Poly Haven, CC0): bir kez indirilir
echo Dokular indiriliyor...
powershell -NoProfile -Command "$cfg = Get-Content -Raw -Encoding UTF8 'scripts\blender\dokular.json' | ConvertFrom-Json; foreach ($id in $cfg.dokular.PSObject.Properties.Name) { $d = Join-Path 'gorseller-ai\dokular' $id; New-Item -ItemType Directory -Force $d | Out-Null; foreach ($s in 'diff','rough','nor_gl') { $f = Join-Path $d ($id + '_' + $s + '_2k.jpg'); for ($i = 0; $i -lt 3; $i++) { if ((Test-Path $f) -and ((Get-Item $f).Length -gt 20000)) { break }; Remove-Item $f -ErrorAction SilentlyContinue; curl.exe -sSL -A 'AntikTurkiye-HD/1.0' -o $f ('https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/' + $id + '/' + $id + '_' + $s + '_2k.jpg'); Start-Sleep -Seconds 1 } } }"
rem 2) Model ve isleme
echo Karanlik Kilise HD isleniyor (8 gorunum + 5 adet 360 derece; ekran kartiyla yaklasik 20-40 dakika)...
"%BL%" -b --factory-startup --python scripts\blender\karanlik_hd.py -- --out hd-out\karanlik --frescoes gorseller-ai\karanlik-fresk --dokular gorseller-ai\dokular --res 1920x1080 --samples 256 --gpu --pano --pano-samples 192 > hd-out-karanlik-log.txt 2>&1
findstr /C:"BITTI" hd-out-karanlik-log.txt >nul
if errorlevel 1 (
  echo Bir sorun cikti. hd-out-karanlik-log.txt dosyasinin son satirlarini Claude'a gonderin.
  pause
  exit /b 1
)
start "" "hd-out\karanlik"
echo.
echo Tamam! Claude'a "karanlik hd hazir" yazin.
pause
