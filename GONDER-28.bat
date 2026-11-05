@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Gercekci insan figurleri, Aspendos/Nemrut duzeltmeleri ve 45 yerin gunduz pisirmesi
git checkout main
if errorlevel 1 goto hata
git add -A public\baked
git add .gitignore
git add src\lib\baked-sites.ts
git add src\lib\baked-scene.ts
git add src\lib\reconstruction-parts.ts
git add src\components\Reconstruction3DInner.tsx
git add src\components\scene\figure.ts
git add src\components\scene\life.ts
git add src\components\scene\landscape.ts
git add scripts\glb\antik_bake.py
git add scripts\glb\pisir-web.ps1
git add scripts\glb\web_pack.mjs
git add scripts\glb\web-sites.txt
git add DEVAM-NOTU.md
git add GONDER-28.bat
git commit -m "Gercekci insanlar, Aspendos/Nemrut duzeltmeleri ve 45 yerin gunduz pisirmesi"
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
