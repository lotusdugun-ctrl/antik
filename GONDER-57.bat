@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Bulutsuz yeniden pisirilen 5 dunya kenti ve sw v5 gonderiliyor ===
git add ^
  DEVAM-NOTU.md ^
  GONDER-57.bat ^
  public/sw.js ^
  public/baked/babil-kenti ^
  public/baked/pompeii-kenti ^
  public/baked/eboracum-kenti ^
  public/baked/nimes-kenti ^
  public/baked/trier-kenti
git commit -m "fix(baked): Babil ve 4 dunya kenti bulutsuz yeniden pisirildi; sw cache v5"
git pull --no-edit origin main
git push origin main
echo === Tamamlandi ===
