# Records the audio guide (tr/en/de/ru) and the Greek voices of the 3D models
# with open-source Piper voices ON THIS COMPUTER, and publishes them. Run it
# from SESLENDIR.bat. No card, no account, no key.
# Only voices whose model card states a licence that allows commercial use
# are used (see docs/SESLER.md); the old Microsoft Edge recordings are deleted.
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$audioRepo = Join-Path (Split-Path -Parent $root) "antik-audio"
$owner = "lotusdugun-ctrl"

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"

function Step($text) { Write-Host ""; Write-Host "=== $text ===" -ForegroundColor Cyan }

# 1. Python, Piper and the MP3 encoder
Step "Python kontrol ediliyor"
$py = $null
foreach ($candidate in @("py", "python", "python3")) {
  try { & $candidate -3 --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { $py = @($candidate, "-3"); break } } catch {}
  try { & $candidate --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { $py = @($candidate); break } } catch {}
}
if (-not $py) {
  Write-Host "Python bulunamadi, kuruluyor (winget)..." -ForegroundColor Yellow
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  Write-Host "Python kuruldu. Lutfen bu pencereyi kapatip SESLENDIR.bat'i yeniden calistirin." -ForegroundColor Yellow
  exit 1
}
$pyExe = $py[0]; $pyArgs = @(); if ($py.Count -gt 1) { $pyArgs = @($py[1]) }
& $pyExe @pyArgs -m pip uninstall -y edge-tts 2>$null | Out-Null
& $pyExe @pyArgs -m pip install --quiet --upgrade "piper-tts>=1.3,<2" lameenc | Out-Host

# 2. Latest code first, so the newest texts and manifest are used
Step "Proje guncelleniyor"
git checkout main
git pull --no-edit origin main

# 3. The audio repository on GitHub Pages
function Prepare-AudioRepo {
  Step "antik-audio deposu hazirlaniyor"
  git ls-remote "https://github.com/$owner/antik-audio.git" 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Depo yok, GitHub'da olusturuluyor..."
    $cred = "protocol=https`nhost=github.com`n`n" | git credential fill
    $token = ($cred | Where-Object { $_ -like "password=*" }) -replace "^password=", ""
    if (-not $token) { throw "GitHub kimligi bulunamadi. Once GITHUBA-GONDER.bat ile bir kez gonderim yapin." }
    $headers = @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" }
    Invoke-RestMethod -Method Post -Uri "https://api.github.com/user/repos" -Headers $headers `
      -Body (@{ name = "antik-audio"; description = "Antik Turkiye sesli rehber kayitlari"; auto_init = $true } | ConvertTo-Json) | Out-Null
    Start-Sleep -Seconds 5
    try {
      Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$owner/antik-audio/pages" -Headers $headers `
        -Body (@{ source = @{ branch = "main"; path = "/" } } | ConvertTo-Json) | Out-Null
    } catch { Write-Host "Pages zaten acik olabilir: $($_.Exception.Message)" }
  }
  if (-not (Test-Path $audioRepo)) { git clone "https://github.com/$owner/antik-audio.git" $audioRepo }
  Set-Location $audioRepo; git pull --no-edit 2>$null; Set-Location $root
  if (-not (Test-Path (Join-Path $audioRepo ".nojekyll"))) { New-Item -ItemType File (Join-Path $audioRepo ".nojekyll") | Out-Null }
}
Prepare-AudioRepo

# 4. Licence check, delete old recordings, record (resumes where it stopped)
Step "Sesli rehber kaydediliyor (Piper). Uzun surebilir; yarida kalirsa SESLENDIR.bat'i yeniden calistirin, kaldigi yerden devam eder"
& $pyExe @pyArgs (Join-Path $PSScriptRoot "generate_audio_piper.py") --remote-dir $audioRepo | Out-Host
$guideOk = ($LASTEXITCODE -eq 0)
Step "3D modellerin Yunanca sesleri kaydediliyor (Piper)"
& $pyExe @pyArgs (Join-Path $PSScriptRoot "generate_ambience_voices.py") | Out-Host
if (-not $guideOk) {
  Write-Host "Bazi bolumler kaydedilemedi (yukaridaki mesajlara bakin). Kaydedilenler yine de gonderiliyor." -ForegroundColor Yellow
}

# 5. Publish both repositories (deletions included)
Step "Ses dosyalari GitHub'a gonderiliyor"
Set-Location $audioRepo
git add -A
git commit -m "Sesli rehber: Piper kayitlari (lisans kontrollu); eski Edge kayitlari silindi" 2>$null
git push origin HEAD
Set-Location $root
# One path at a time: a folder that no longer exists must not stop the others.
foreach ($p in @("src/lib/audio-manifest.json", "src/lib/voice-credits.json", "public/audio", "public/ambience/voices")) { git add -A -- $p 2>$null }
git commit -m "Sesli rehber: Piper kayitlari (lisans kontrollu); eski Edge kayitlari silindi" 2>$null
git pull --no-edit origin main
git push origin main
Write-Host ""
Write-Host "Tamam! Seslendirmeler yayinlandi. Birkac dakika icinde sitede." -ForegroundColor Green
Write-Host "Lisansi uygun ses bulunamayan dillerde uygulama cihazin kendi sesini kullanir." -ForegroundColor Green
