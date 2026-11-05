# Antik Turkiye: web icin pismis isikli modeller, BU BILGISAYARDA (ekran karti ile).
#   PISIR-WEB.bat                 -> scripts\glb\web-sites.txt icindeki yerler
#   PISIR-WEB.bat celsus-kutuphanesi aspendos-tiyatrosu   -> yalnizca bunlar
# Her yer icin: web sahnesi disa aktarilir (export-glb.mjs, gelistirme sunucusu) -> Blender "clear"
# (gunduz) isigiyla pisirir (antik_bake.py, gunes acilis gorunusunun omuz hizasindan) -> sikistirilir
# (web_pack.mjs) -> public\baked\<id>\. Sonunda src\lib\baked-sites.ts yeniden yazilir.
# Gunluk: hd-out\pisir\<id>.log. Biten yerler atlanir (yeniden icin klasoru silin).
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Ids)
# Continue: in PowerShell 5.1 a native tool writing to stderr would otherwise abort the run;
# every step is checked by its exit code and its output file instead.
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
function Step($t) { Write-Host ""; Write-Host "=== $t ===" -ForegroundColor Cyan }

# --- Blender
$bl = $null
foreach ($d in Get-ChildItem "$env:ProgramFiles\Blender Foundation" -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending) {
  if (Test-Path "$($d.FullName)\blender.exe") { $bl = "$($d.FullName)\blender.exe"; break }
}
if (-not $bl) { Write-Host "Blender bulunamadi." -ForegroundColor Red; exit 1 }

# --- araclar (bir kez): playwright + chromium, gltf-transform, gltfpack, sharp
Step "Araclar"
Push-Location "scripts\glb"
if (-not (Test-Path "node_modules\playwright")) { bun install; if ($LASTEXITCODE) { Write-Host "bun install (scripts\glb) basarisiz" -ForegroundColor Red; exit 1 } }
bunx playwright install chromium
if ($LASTEXITCODE) { Write-Host "playwright chromium kurulamadi" -ForegroundColor Red; exit 1 }
Pop-Location
if (-not (Test-Path "node_modules\vite")) { bun install; if ($LASTEXITCODE) { Write-Host "bun install basarisiz" -ForegroundColor Red; exit 1 } }

if (-not $Ids -or $Ids.Count -eq 0) {
  $Ids = Get-Content "scripts\glb\web-sites.txt" | Where-Object { $_ -and -not $_.StartsWith("#") } | ForEach-Object { $_.Trim() }
}
$work = Join-Path $root "hd-out\pisir"
New-Item -ItemType Directory -Force $work | Out-Null

# --- gelistirme sunucusu (yalniz bu bilgisayarda; window.__recon icin yama, sonunda geri alinir)
Step "Gelistirme sunucusu"
git apply --check -R scripts\glb\recon-dev-patch.diff 2>$null
if ($LASTEXITCODE) {
  git apply scripts\glb\recon-dev-patch.diff
  if ($LASTEXITCODE) { Write-Host "recon-dev-patch uygulanamadi" -ForegroundColor Red; exit 1 }
}
function Server-Up { try { Invoke-WebRequest "http://127.0.0.1:5180/" -UseBasicParsing -TimeoutSec 10 | Out-Null; return $true } catch { return $false } }
function Start-Server {
  $p = Start-Process -FilePath "bunx" -ArgumentList "vite","dev","--port","5180","--strictPort","--host","127.0.0.1" -PassThru -RedirectStandardOutput "$work\vite.log" -RedirectStandardError "$work\vite-err.log"
  for ($i = 0; $i -lt 90; $i++) { Start-Sleep -Seconds 2; if (Server-Up) { break } }
  return $p
}
$vite = Start-Server
$done = @(); $failed = @()
try {
  if (-not (Server-Up)) { throw "sunucu acilmadi (hd-out\pisir\vite-err.log)" }
  foreach ($id in $Ids) {
    $dst = "public\baked\$id\$id-bake.json"
    if ((Test-Path $dst) -and ((Get-Content -Raw $dst) -match '"preset": "clear"')) { Write-Host "$id zaten pismis, atlaniyor"; $done += $id; continue }
    Step $id
    $out = Join-Path $work $id
    $log = Join-Path $work "$id.log"
    New-Item -ItemType Directory -Force $out | Out-Null
    try {
      if (-not (Server-Up)) {
        Write-Host "  sunucu yeniden aciliyor..."
        if ($vite -and -not $vite.HasExited) { taskkill /PID $vite.Id /T /F | Out-Null }
        $vite = Start-Server
      }
      Write-Host "  disa aktariliyor..."
      node scripts\glb\export-glb.mjs $id $out *> $log
      if ($LASTEXITCODE -or -not (Test-Path "$out\$id-building.glb")) { throw "disa aktarma" }
      $env:ANTIK_VIEW = "$out\$id-view.json"
      # 1) ekran karti; 2) cokerse daha az bitkiyle; 3) yine cokerse islemciyle (yavas ama saglam)
      $tries = @(@{ cpu = "0"; plants = "650"; note = "ekran karti" }, @{ cpu = "0"; plants = "150"; note = "ekran karti, az bitki" }, @{ cpu = "1"; plants = "150"; note = "islemci" })
      foreach ($t in $tries) {
        if (Test-Path "$out\$id-baked.glb") { break }
        $env:ANTIK_CPU = $t.cpu; $env:ANTIK_MAX_PLANTS = $t.plants
        Write-Host "  pisiriliyor ($($t.note))..."
        Remove-Item "$env:TEMP\blender.crash.txt" -ErrorAction SilentlyContinue
        "=== blender: $($t.note) ===" | Out-File -Append -Encoding utf8 $log
        & $bl -b --factory-startup --python scripts\glb\antik_bake.py -- "$out\$id-building.glb" "$out\$id-landscape.glb" $out clear 2048 160 *>> $log
        "=== blender cikis kodu: $LASTEXITCODE ===" | Out-File -Append -Encoding utf8 $log
        if (Test-Path "$env:TEMP\blender.crash.txt") { Get-Content "$env:TEMP\blender.crash.txt" | Out-File -Append -Encoding utf8 $log }
      }
      Remove-Item Env:\ANTIK_VIEW, Env:\ANTIK_CPU, Env:\ANTIK_MAX_PLANTS -ErrorAction SilentlyContinue
      if (-not (Test-Path "$out\$id-baked.glb")) { throw "pisirme" }
      Write-Host "  sikistiriliyor..."
      node scripts\glb\web_pack.mjs $out $id *>> $log
      if ($LASTEXITCODE) { throw "sikistirma" }
      $done += $id
      Write-Host "  tamam" -ForegroundColor Green
    } catch {
      $failed += $id
      Write-Host "  HATA ($($_.Exception.Message)): $log" -ForegroundColor Red
    }
  }
} finally {
  if ($vite -and -not $vite.HasExited) { taskkill /PID $vite.Id /T /F | Out-Null }
  git apply -R scripts\glb\recon-dev-patch.diff
}

# --- uygulamanin listesi: gunduz isigiyla pismis yerler
$ready = Get-ChildItem "public\baked" -Directory | Where-Object {
  $j = Join-Path $_.FullName "$($_.Name)-bake.json"; (Test-Path $j) -and ((Get-Content -Raw $j) -match '"preset": "clear"')
} | ForEach-Object { $_.Name } | Sort-Object
$lines = @("/**", " * Pismis isikli modeli web'de hazir olan yerler (dosyalar: public/baked/<id>/).", " * PISIR-WEB.bat yazar; elle degistirmeyin.", " */", "// prettier-ignore", "export const BAKED_SITES: readonly string[] = [")
foreach ($r in $ready) { $lines += "  `"$r`"," }
$lines += "];"
[IO.File]::WriteAllText("src\lib\baked-sites.ts", ($lines -join "`n") + "`n")

Write-Host ""
Write-Host "Biten: $($done.Count)  Hatali: $($failed.Count) $($failed -join ', ')"
Write-Host "Tamam! Claude'a 'pisirme bitti' yazin." -ForegroundColor Green
