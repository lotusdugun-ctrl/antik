@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Kentlere kendi kulturlerine ozgu ev dokusu
git checkout main
if errorlevel 1 goto hata
git add src/lib/models/kent-dokusu.ts
git add src/lib/reconstruction-parts.ts
git add src/lib/reconstructions.ts
git add src/lib/scene-life.ts
git add DEVAM-NOTU.md
git add YENIDEN-PISIR.bat
git add GONDER-50.bat
git commit -m "feat(3d): her kente kendi kulturune ozgu ev ve mahalle dokusu (kent-dokusu.ts)"
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
