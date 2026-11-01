# Records the audio guide (tr, then en) with Google's Gemini speech model ON
# THIS COMPUTER, and publishes it. Run it from SESLENDIR-GEMINI.bat, or from
# GEMINI-ORNEKLERI.bat (-Samples) to hear a few voices first.
# The Gemini key is asked for once and kept in scripts\.gemini-key (not committed).
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
param([switch]$Samples, [string]$Voice = "", [string]$Langs = "tr,en")
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$audioRepo = Join-Path (Split-Path -Parent $root) "antik-audio"
$owner = "lotusdugun-ctrl"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"
function Step($text) { Write-Host ""; Write-Host "=== $text ===" -ForegroundColor Cyan }

Step "Python kontrol ediliyor"
function Find-Python {
  foreach ($v in @("3.12", "3.13", "3.11", "3.10", "3.14")) {
    try { & py "-$v" --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { return @("py", "-$v") } } catch {}
  }
  foreach ($candidate in @("python", "python3")) {
    try { & $candidate --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { return @($candidate) } } catch {}
  }
  return $null
}
$py = Find-Python
if (-not $py) {
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  Write-Host "Python kuruldu. Bu pencereyi kapatip yeniden calistirin." -ForegroundColor Yellow
  exit 1
}
$pyExe = $py[0]; $pyArgs = @(); if ($py.Count -gt 1) { $pyArgs = @($py[1]) }
& $pyExe @pyArgs -m pip install --quiet --upgrade lameenc | Out-Host

Step "Gemini anahtari"
$keyFile = Join-Path $PSScriptRoot ".gemini-key"
if (-not $env:GEMINI_API_KEY -and -not (Test-Path $keyFile)) {
  Write-Host "Google AI Studio'daki Gemini API anahtarinizi yapistirin (https://aistudio.google.com/apikey):"
  $k = Read-Host "GEMINI_API_KEY"
  if (-not $k) { Write-Host "Anahtar girilmedi." -ForegroundColor Red; exit 1 }
  Set-Content -Path $keyFile -Value $k.Trim() -Encoding ASCII
}
Write-Host "Anahtar hazir."

$gen = Join-Path $PSScriptRoot "generate_audio_gemini.py"
if ($Samples) {
  Step "Ses ornekleri kaydediliyor (birkac kurus)"
  & $pyExe @pyArgs $gen --samples | Out-Host
  $dir = Join-Path $PSScriptRoot "ses-ornekleri"
  if (Test-Path $dir) { Invoke-Item $dir; Write-Host "Ornekler: $dir" }
  Write-Host ""
  Write-Host "Orneklerden begendiginiz sesin adini Claude'a yazin (or. Sulafat)." -ForegroundColor Green
  exit 0
}

Step "Proje guncelleniyor"
git checkout main
git pull --no-edit origin main

Step "antik-audio deposu hazirlaniyor"
if (-not (Test-Path $audioRepo)) { git clone "https://github.com/$owner/antik-audio.git" $audioRepo }
Set-Location $audioRepo; git pull --no-edit 2>$null; Set-Location $root
if (-not (Test-Path (Join-Path $audioRepo ".nojekyll"))) { New-Item -ItemType File (Join-Path $audioRepo ".nojekyll") | Out-Null }

if (-not $Voice) { $Voice = "Sulafat" }
$ok = $true
foreach ($lang in $Langs.Split(",")) {
  Step "Sesli rehber kaydediliyor: $lang ($Voice). Uzun surebilir; yarida kalirsa yeniden calistirin, kaldigi yerden devam eder"
  & $pyExe @pyArgs $gen --lang $lang.Trim() --voice $Voice --remote-dir $audioRepo | Out-Host
  if ($LASTEXITCODE -eq 3) {
    Write-Host "Bugunluk kota doldu. Kaydedilenler simdi yayinlaniyor; yarin yeniden calistirin." -ForegroundColor Yellow
    break
  }
  if ($LASTEXITCODE -ne 0) { $ok = $false }
}
if (-not $ok) { Write-Host "Bazi bolumler kaydedilemedi. Kaydedilenler yine de gonderiliyor; sonra yeniden calistirin." -ForegroundColor Yellow }

Step "Ses dosyalari GitHub'a gonderiliyor"
Set-Location $audioRepo
git add -A
git commit -m "Sesli rehber: Gemini kayitlari" 2>$null
git push origin HEAD
Set-Location $root
foreach ($p in @("src/lib/audio-manifest.json", "src/lib/voice-credits.json", "public/audio")) { git add -A -- $p 2>$null }
git commit -m "Sesli rehber: Gemini kayitlari (tr, en)" 2>$null
git pull --no-edit origin main
git push origin main
Write-Host ""
Write-Host "Tamam! Yeni seslendirmeler yayinlandi." -ForegroundColor Green
