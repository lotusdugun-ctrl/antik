# Records the Greek voices heard in the 3D models' ambient sound (the actor on
# the stage, the herald at the races, hymns, vendors, a lament) with Microsoft's
# free Edge voices, and publishes them. Run it from ORTAM-SESLERI.bat.
# The site works without these files; once they are pushed, the models use them.
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"

function Step($text) { Write-Host ""; Write-Host "=== $text ===" -ForegroundColor Cyan }

Step "Python kontrol ediliyor"
$py = $null
foreach ($candidate in @("py", "python", "python3")) {
  try { & $candidate -3 --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { $py = @($candidate, "-3"); break } } catch {}
  try { & $candidate --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { $py = @($candidate); break } } catch {}
}
if (-not $py) {
  Write-Host "Python bulunamadi, kuruluyor (winget)..." -ForegroundColor Yellow
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  Write-Host "Python kuruldu. Lutfen bu pencereyi kapatip ORTAM-SESLERI.bat'i yeniden calistirin." -ForegroundColor Yellow
  exit 1
}
$pyExe = $py[0]; $pyArgs = @(); if ($py.Count -gt 1) { $pyArgs = @($py[1]) }
& $pyExe @pyArgs -m pip install --quiet --upgrade edge-tts | Out-Host

Step "Ortam sesleri kaydediliyor (27 kisa Yunanca kayit)"
& $pyExe @pyArgs (Join-Path $PSScriptRoot "generate_ambience_voices.py") | Out-Host
if ($LASTEXITCODE -ne 0) { Write-Host "Bazi kayitlar alinamadi; alinanlar yine de gonderiliyor. Sonra yeniden calistirin, eksikleri tamamlar." -ForegroundColor Yellow }

Step "GitHub'a gonderiliyor"
git checkout main
git add public/ambience/voices
git commit -m "Ortam sesleri: Yunanca konusmalar kaydedildi (Edge sesleri)" 2>$null
git pull --no-edit origin main
git push origin main
Write-Host ""
Write-Host "Tamam! Birkac dakika icinde sitede." -ForegroundColor Green
