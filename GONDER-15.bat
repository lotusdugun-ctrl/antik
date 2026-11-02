@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Karanlik Kilise 360 goruntulerini uygulamaya koy ve gonder
set "SRC=hd-out\karanlik"
set "DST=public\hd\goreme-kaya-kiliseleri"
if not exist "%SRC%\karanlik-360-naos.jpg" (
  echo Once KARANLIK-HD.bat calistirilmali: %SRC% icinde 360 goruntuler yok.
  pause
  exit /b 1
)
if not exist "%DST%" mkdir "%DST%"
copy /Y "%SRC%\karanlik-360-*.jpg" "%DST%\" >nul
copy /Y "%SRC%\karanlik-kiyas-*.jpg" "%DST%\" >nul
if exist "hd-out\celsus\celsus-360-meydan.jpg" (
  if not exist "public\hd\celsus-kutuphanesi" mkdir "public\hd\celsus-kutuphanesi"
  copy /Y "hd-out\celsus\celsus-360-*.jpg" "public\hd\celsus-kutuphanesi\" >nul
  copy /Y "hd-out\celsus\celsus-kiyas-*.jpg" "public\hd\celsus-kutuphanesi\" >nul
)
if exist "hd-out\aspendos\aspendos-360-orkestra.jpg" (
  if not exist "public\hd\aspendos-tiyatrosu" mkdir "public\hd\aspendos-tiyatrosu"
  copy /Y "hd-out\aspendos\aspendos-360-*.jpg" "public\hd\aspendos-tiyatrosu\" >nul
  copy /Y "hd-out\aspendos\aspendos-kiyas-*.jpg" "public\hd\aspendos-tiyatrosu\" >nul
)
rem hd-files.json: public\hd altindaki tum jpg dosyalarinin listesi
powershell -NoProfile -Command "$f = Get-ChildItem -Path 'public\hd' -Recurse -Filter *.jpg | ForEach-Object { '/hd/' + ($_.FullName.Substring((Resolve-Path 'public\hd').Path.Length + 1) -replace '\\','/') } | Sort-Object; $j = ConvertTo-Json @($f); [IO.File]::WriteAllText('src\lib\hd-files.json', $j + [Environment]::NewLine)"
type src\lib\hd-files.json
git checkout main
if errorlevel 1 goto hata
git add src scripts docs public\hd KARANLIK-HD.bat CELSUS-HD.bat ASPENDOS-HD.bat AYASOFYA-HD.bat GONDER-15.bat
git commit -m "Saglam donem HD: Karanlik Kilise, Celsus, Aspendos; 360 gorunumler ve bugun/saglamken kiyasi"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo Tamam!
pause
exit /b 0
:hata
echo Bir sorun cikti. Ekran goruntusunu Claudea gonder.
pause
exit /b 1
