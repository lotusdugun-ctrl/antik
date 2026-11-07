@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Antik Pass odeme akisi ve yeni 4 antik kent hikayeleri, tum testler 575/575 geciyor
git checkout main
if errorlevel 1 goto hata

git add src/lib/pass.tsx
git add src/lib/stories-more.ts
git add scripts/glb/web-sites.txt
git add PISIR-YENI-KENTLER.bat
git add test-sonucu.txt
git add DEVAM-NOTU.md
git add GONDER-38.bat

git commit -m "Antik Pass odeme akisi, 4 yeni antik kent hikayesi ve web pisirme altyapisi (575/575 test yesil)"
git pull --no-edit origin main
if errorlevel 1 goto hata
git push origin main
echo Tamam!
pause
exit /b 0
:hata
echo Bir sorun cikti. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
