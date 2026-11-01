# Rewrites the audio guide's chapters (tr, en) for the ear with Gemini, ON THIS
# COMPUTER, and pushes the result to the branch "hikaye-yeniden" for checking.
# Nothing reaches the site from here: Claude checks every chapter first.
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"
function Step($text) { Write-Host ""; Write-Host "=== $text ===" -ForegroundColor Cyan }
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
if (-not $py) { Write-Host "Python bulunamadi. Once SESLENDIR.bat'i bir kez calistirin." -ForegroundColor Red; exit 1 }
$pyExe = $py[0]; $pyArgs = @(); if ($py.Count -gt 1) { $pyArgs = @($py[1]) }

$keyFile = Join-Path $PSScriptRoot ".gemini-key"
if (-not $env:GEMINI_API_KEY -and -not (Test-Path $keyFile)) {
  Write-Host "Google AI Studio'daki Gemini API anahtarinizi yapistirin (https://aistudio.google.com/apikey):"
  $k = Read-Host "GEMINI_API_KEY"
  if (-not $k) { Write-Host "Anahtar girilmedi." -ForegroundColor Red; exit 1 }
  Set-Content -Path $keyFile -Value $k.Trim() -Encoding ASCII
}

Step "Proje guncelleniyor"
git checkout main
git pull --no-edit origin main

$gen = Join-Path $PSScriptRoot "rewrite_stories_gemini.py"
foreach ($lang in @("tr", "en")) {
  Step "Metinler yeniden yaziliyor: $lang (yarida kalirsa yeniden calistirin, kaldigi yerden devam eder)"
  & $pyExe @pyArgs $gen --lang $lang | Out-Host
}

Step "Kontrol icin GitHub'a gonderiliyor (hikaye-yeniden dali)"
git checkout -B hikaye-yeniden
git add -f scripts/rewrite-out
git commit -m "Sesli rehber metinleri: Gemini ile yeniden yazildi (kontrol bekliyor)" 2>$null
git push -f origin hikaye-yeniden
git checkout main
Write-Host ""
Write-Host "Tamam! Claude'a 'hikayeler gonderildi' yazin; kontrol edip siteye o koyacak." -ForegroundColor Green
