@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem GONDER-54: Babil ve dunya kentlerindeki dev bulut kutlesi cozuldu (3D top bulutlar kaldirildi, gercekci gok kubbesi katmani baglandi); Angkor Wat hendek temizligi; Petra cadde baslangici
git checkout main
if errorlevel 1 goto hata
git add src/components/scene/cloud-dome.ts
git add src/components/Reconstruction3DInner.tsx
git add src/lib/baked-scene.ts
git add src/lib/models/dunya-modelleri.ts
git add src/lib/reconstructions.ts
git add DEVAM-NOTU.md
git add GONDER-54.bat
git commit -m "fix(3d): kentlerin uzerini kapatan dev poligon bulutlar kaldirildi; gok kubbesine gercekci katman bulut baglandi; Angkor cift hendek temizlendi"
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
