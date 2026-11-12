@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === 10 onemli dunya kenti pismis modelleri gonderiliyor ===
git add ^
  DEVAM-NOTU.md ^
  GONDER-56.bat ^
  src/lib/baked-sites.ts ^
  public/baked/akropolis-atena-kenti ^
  public/baked/petra-kenti ^
  public/baked/karnak-kenti ^
  public/baked/persepolis-kenti ^
  public/baked/angkor-vat-kenti ^
  public/baked/macu-picu-kenti ^
  public/baked/cisen-itza-kenti ^
  public/baked/teotihuacan-kenti ^
  public/baked/ebu-simbel-kenti ^
  public/baked/iskenderiye-kenti
git commit -m "feat(baked): en onemli 10 dunya kenti pisirildi (60 pismis model)"
git pull --no-edit origin main
git push origin main
echo === Tamamlandi ===
