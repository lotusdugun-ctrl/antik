@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem GONDER-55: 17 pismis GLB dosyasinin icine gomulmus eski bulut parcalari temizlendi
git checkout main
if errorlevel 1 goto hata
git add public/baked/aizanoi-zeus-tapinagi/aizanoi-zeus-tapinagi-baked.glb
git add public/baked/artemis-tapinagi/artemis-tapinagi-baked.glb
git add public/baked/assos-athena-tapinagi/assos-athena-tapinagi-baked.glb
git add public/baked/babil-kenti/babil-kenti-baked.glb
git add public/baked/catalhoyuk-dogu-hoyugu/catalhoyuk-dogu-hoyugu-baked.glb
git add public/baked/didyma-apollon-tapinagi/didyma-apollon-tapinagi-baked.glb
git add public/baked/eboracum-kenti/eboracum-kenti-baked.glb
git add public/baked/efes-hadrianus-tapinagi/efes-hadrianus-tapinagi-baked.glb
git add public/baked/letoon-leto-tapinagi/letoon-leto-tapinagi-baked.glb
git add public/baked/magnesia-artemis-tapinagi/magnesia-artemis-tapinagi-baked.glb
git add public/baked/nimes-kenti/nimes-kenti-baked.glb
git add public/baked/pergamon-trajan-tapinagi/pergamon-trajan-tapinagi-baked.glb
git add public/baked/pompeii-kenti/pompeii-kenti-baked.glb
git add public/baked/priene-athena-tapinagi/priene-athena-tapinagi-baked.glb
git add public/baked/sardes-artemis-tapinagi/sardes-artemis-tapinagi-baked.glb
git add public/baked/side-apollon-tapinagi/side-apollon-tapinagi-baked.glb
git add public/baked/trier-kenti/trier-kenti-baked.glb
git add DEVAM-NOTU.md
git add GONDER-55.bat
git commit -m "fix(baked): 17 pismis GLB icindeki gomulu bulut parcalari kaldirildi"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo GONDERILDI! Vercel dagitimi basladi.
pause
exit /b 0
:hata
echo Bir hata olustu. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
