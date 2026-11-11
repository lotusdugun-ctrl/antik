@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Siyah sutunlu tapinaklari, Babil i ve yeni evleri olan 4 kenti duzeltilmis betikle yeniden pisirir.
rem Uzun surer (her yer 10-30 dk). Bilgisayar uyumasin.
set IDS=pompeii-kenti eboracum-kenti nimes-kenti trier-kenti aizanoi-zeus-tapinagi artemis-tapinagi assos-athena-tapinagi didyma-apollon-tapinagi efes-hadrianus-tapinagi letoon-leto-tapinagi magnesia-artemis-tapinagi pergamon-trajan-tapinagi priene-athena-tapinagi sardes-artemis-tapinagi side-apollon-tapinagi babil-kenti
for %%i in (%IDS%) do (
  if exist "hd-out\pisir\%%i" rmdir /s /q "hd-out\pisir\%%i"
  if exist "public\baked\%%i\%%i-bake.json" del "public\baked\%%i\%%i-bake.json"
)
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\glb\pisir-web.ps1" %IDS%
echo.
echo Bitince Claude a "pisirme bitti" yazin.
pause
