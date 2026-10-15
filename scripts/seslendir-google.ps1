# Records the audio guide with Google Cloud Text-to-Speech (Chirp 3 HD voices)
# and publishes the files. Run it from SESLENDIR-GOOGLE.bat. See docs/SESLENDIRME.md.
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$audioRepo = Join-Path (Split-Path -Parent $root) "antik-audio"
$owner = "lotusdugun-ctrl"
$keyFile = Join-Path $PSScriptRoot ".tts-key"
$voiceFile = Join-Path $PSScriptRoot ".tts-voice"
$samplesDir = Join-Path $PSScriptRoot "voice-samples"
$defaultVoice = "Sulafat"

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"

function Step($text) { Write-Host ""; Write-Host "=== $text ===" -ForegroundColor Cyan }

function Save-Text($path, $text) {
  # UTF-8 without BOM, no trailing newline.
  [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))
}

# 1. Python (only the standard library is needed: nothing to pip install)
Step "Python kontrol ediliyor"
$py = $null
foreach ($candidate in @("py", "python", "python3")) {
  try { & $candidate -3 --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { $py = @($candidate, "-3"); break } } catch {}
  try { & $candidate --version 2>$null | Out-Null; if ($LASTEXITCODE -eq 0) { $py = @($candidate); break } } catch {}
}
if (-not $py) {
  Write-Host "Python bulunamadi, kuruluyor (winget)..." -ForegroundColor Yellow
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  Write-Host "Python kuruldu. Lutfen bu pencereyi kapatip SESLENDIR-GOOGLE.bat'i yeniden calistirin." -ForegroundColor Yellow
  exit 1
}
$pyExe = $py[0]; $pyArgs = @(); if ($py.Count -gt 1) { $pyArgs = @($py[1]) }
$generator = Join-Path $PSScriptRoot "generate_audio_chirp.py"

# 2. The Google API key, asked for once and kept in scripts\.tts-key
function Ensure-Key([bool]$askAgain) {
  if ($askAgain -or -not (Test-Path $keyFile) -or -not (Get-Content $keyFile -Raw).Trim()) {
    Write-Host ""
    Write-Host "Google Cloud API anahtari gerekiyor (nasil alinir: docs\SESLENDIRME.md)." -ForegroundColor Yellow
    $key = (Read-Host "API anahtarini buraya yapistirip Enter'a basin").Trim()
    if (-not $key) { Write-Host "Anahtar girilmedi." -ForegroundColor Red; return $false }
    Save-Text $keyFile $key
    Write-Host "Anahtar kaydedildi: scripts\.tts-key (bu dosyayi kimseyle paylasmayin)." -ForegroundColor Green
  }
  return $true
}

function Current-Voice {
  if (Test-Path $voiceFile) {
    $v = (Get-Content $voiceFile -Raw).Trim()
    if ($v) { return $v }
  }
  return $defaultVoice
}

function Run-Generator([string[]]$extra) {
  # Out-Host: the output goes to the screen, not into the return value.
  & $pyExe @pyArgs $generator @extra | Out-Host
  return $LASTEXITCODE
}

# 3. The audio repository on GitHub Pages (as before)
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

function Publish([string]$voice) {
  Step "Ses dosyalari GitHub'a gonderiliyor"
  Set-Location $audioRepo
  git add -A
  git commit -m "Sesli rehber kayitlari (Google Chirp 3 HD, $voice)" 2>$null
  git push origin HEAD
  Set-Location $root
  git checkout main
  # Only the recordings and their list: never scripts\.tts-key or other local files.
  git add src/lib/audio-manifest.json public/audio
  git commit -m "Sesli rehber: Google Chirp 3 HD sesiyle yeniden kaydedildi ($voice)" 2>$null
  git pull --no-edit origin main
  git push origin main
  Write-Host ""
  Write-Host "Tamam! Seslendirmeler yayinlandi. Lovable birkac saniye icinde guncellenir." -ForegroundColor Green
}

# 4. Menu
while ($true) {
  $voice = Current-Voice
  Write-Host ""
  Write-Host "==================== SESLENDIRME ====================" -ForegroundColor Cyan
  Write-Host " Secili ses: $voice"
  Write-Host " 1) Ses ornekleri olustur ve dinle (yaklasik 3.000 karakter)"
  Write-Host " 2) Kac karakter tutar? (deneme, ucretsiz, Google'a bir sey gonderilmez)"
  Write-Host " 3) Seslendir ve yayinla"
  Write-Host " 4) Sesi degistir"
  Write-Host " 5) API anahtarini degistir"
  Write-Host " 0) Cikis"
  $choice = (Read-Host "Seciminiz").Trim()

  switch ($choice) {
    "1" {
      if (-not (Ensure-Key $false)) { break }
      Step "Ses ornekleri olusturuluyor"
      $code = Run-Generator @("--sample")
      if ($code -eq 0 -and (Test-Path $samplesDir)) {
        Write-Host "Ornekler: $samplesDir" -ForegroundColor Green
        Write-Host "Dosya adindaki ismi (or. tr-Algieba.mp3 -> Algieba) begendiyseniz 4 ile secin."
        Start-Process explorer.exe $samplesDir
      }
    }
    "2" {
      Step "Hesaplaniyor"
      $null = Run-Generator @("--dry-run", "--voice", $voice)
    }
    "3" {
      if (-not (Ensure-Key $false)) { break }
      Prepare-AudioRepo
      Step "Seslendirmeler kaydediliyor ($voice). Uzun surebilir; yarida kalirsa yeniden calistirin, kaldigi yerden devam eder"
      $code = Run-Generator @("--voice", $voice, "--jobs", "4", "--remote-dir", $audioRepo)
      if ($code -ne 0) {
        Write-Host "Bazi bolumler kaydedilemedi (yukaridaki mesajlara bakin). Kaydedilenler yine de gonderiliyor." -ForegroundColor Yellow
      }
      Publish $voice
    }
    "4" {
      Write-Host "Kadin sesleri: Sulafat, Aoede, Achernar, Vindemiatrix, Kore, Leda, Gacrux"
      Write-Host "Erkek sesleri: Algieba, Charon, Orus, Enceladus, Fenrir, Puck, Iapetus"
      $new = (Read-Host "Ses adi (Enter = $voice)").Trim()
      if ($new) {
        Save-Text $voiceFile $new
        Write-Host "Secili ses: $new. Daha once baska sesle kaydedilmis bolumler degismez;" -ForegroundColor Green
        Write-Host "hepsini yeni sesle kaydetmek icin docs\SESLENDIRME.md'deki --force notuna bakin."
      }
    }
    "5" { Ensure-Key $true | Out-Null }
    "0" { exit 0 }
    default { Write-Host "Gecersiz secim." -ForegroundColor Yellow }
  }
  Set-Location $root
}
