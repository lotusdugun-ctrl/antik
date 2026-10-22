# Records only the Greek voices heard in the 3D models' ambient sound with an
# open-source Piper voice (if its licence allows commercial use; see
# docs/SESLER.md), and publishes them. Run it from ORTAM-SESLERI.bat.
# SESLENDIR.bat does this too. The site works without these files.
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"

function Step($text) { Write-Host ""; Write-Host "=== $text ===" -ForegroundColor Cyan }

Step "Python kontrol ediliyor"
# Piper needs a Python its speech engine (onnxruntime) is built for: 3.10-3.13.
# A newer one (3.14, 3.15) installs without it and every worker then fails, so
# a supported version is looked for first and installed if missing.
function Find-Python {
  foreach ($v in @("3.12", "3.11", "3.13", "3.10")) {
    try { & py "-$v" --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { return @("py", "-$v") } } catch {}
  }
  foreach ($candidate in @("python", "python3")) {
    try {
      $ver = & $candidate -c "import sys; print('%d.%d' % sys.version_info[:2])" 2>$null
      if ($LASTEXITCODE -eq 0 -and @("3.10", "3.11", "3.12", "3.13") -contains "$ver".Trim()) { return @($candidate) }
    } catch {}
  }
  return $null
}
$py = Find-Python
if (-not $py) {
  Write-Host "Piper icin uygun Python (3.12) bulunamadi, kuruluyor (winget)..." -ForegroundColor Yellow
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  $py = Find-Python
  if (-not $py) {
    Write-Host "Python 3.12 kuruldu. Lutfen bu pencereyi kapatip ORTAM-SESLERI.bat'i yeniden calistirin." -ForegroundColor Yellow
    exit 1
  }
}
$pyExe = $py[0]; $pyArgs = @(); if ($py.Count -gt 1) { $pyArgs = @($py[1]) }
Write-Host ("Kullanilan Python: " + (& $pyExe @pyArgs --version))
& $pyExe @pyArgs -m pip uninstall -y edge-tts 2>$null | Out-Null
& $pyExe @pyArgs -m pip install --quiet --upgrade "piper-tts>=1.3,<2" lameenc | Out-Host
& $pyExe @pyArgs -c "import piper, lameenc" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Piper kurulamadi (yukaridaki pip mesajlarina bakin). Bu pencerenin ekran goruntusunu Claude'a gonderin." -ForegroundColor Red
  exit 1
}


git checkout main
git pull --no-edit origin main

Step "Ortam sesleri kaydediliyor (27 kisa Yunanca kayit, Piper)"
& $pyExe @pyArgs (Join-Path $PSScriptRoot "generate_ambience_voices.py") | Out-Host
if ($LASTEXITCODE -ne 0) { Write-Host "Bazi kayitlar alinamadi; alinanlar yine de gonderiliyor. Sonra yeniden calistirin, eksikleri tamamlar." -ForegroundColor Yellow }

Step "GitHub'a gonderiliyor"
# One path at a time: a folder that no longer exists must not stop the others.
foreach ($p in @("public/ambience/voices", "src/lib/voice-credits.json")) { git add -A -- $p 2>$null }
git commit -m "Ortam sesleri: Yunanca konusmalar Piper ile kaydedildi (lisans kontrollu)" 2>$null
git pull --no-edit origin main
git push origin main
Write-Host ""
Write-Host "Tamam! Birkac dakika icinde sitede." -ForegroundColor Green
