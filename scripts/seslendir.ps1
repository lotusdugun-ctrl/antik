# Records every chapter of the audio guide with Microsoft's free neural voices
# (edge-tts) and publishes the files. Run it from SESLENDIR.bat.
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$audioRepo = Join-Path (Split-Path -Parent $root) "antik-audio"
$owner = "lotusdugun-ctrl"

function Step($text) { Write-Host ""; Write-Host "=== $text ===" -ForegroundColor Cyan }

# 1. Python
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
& $pyExe @pyArgs -m pip install --quiet --upgrade edge-tts

# 2. The audio repository on GitHub Pages
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

# 3. Record
Step "Seslendirmeler kaydediliyor (bir-iki saat surebilir; yarida kalirsa yeniden calistirin, kaldigi yerden devam eder)"
& $pyExe @pyArgs scripts\generate_audio_edge.py --jobs 6 --remote-dir $audioRepo

# 4. Publish
Step "Ses dosyalari GitHub'a gonderiliyor"
Set-Location $audioRepo
git add -A
git commit -m "Sesli rehber kayitlari (edge-tts, Emel/Sonia)" 2>$null
git push origin HEAD
Set-Location $root
git checkout main
git add src public/audio scripts
git commit -m "Sesli rehber: tum bolumler yeniden kaydedildi, MO/MS okunusu duzeltildi" 2>$null
git pull --no-edit origin main
git push origin main
Write-Host ""
Write-Host "Tamam! Seslendirmeler yayinlandi. Lovable birkac saniye icinde guncellenir." -ForegroundColor Green
