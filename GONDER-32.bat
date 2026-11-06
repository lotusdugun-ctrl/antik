@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem CI duzeltmesi: prettier bicimlendirmesi (7 dosya) + seroval guvenlik guncellemesi (bun.lock)
git checkout main
if errorlevel 1 goto hata
git add bun.lock GONDER-32.bat DEVAM-NOTU.md
git add src/components/Reconstruction3DInner.tsx src/lib/baked-scene.ts src/lib/panoramas.ts
git add scripts/glb/export-life.mjs scripts/glb/export-glb.mjs scripts/glb/export-fx.mjs scripts/glb/web_pack.mjs
git commit -m "CI duzeltmesi: prettier bicimlendirmesi ve seroval guvenlik guncellemesi"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
if errorlevel 1 goto hata
echo Tamam!
pause
exit /b 0
:hata
echo Bir sorun cikti. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
