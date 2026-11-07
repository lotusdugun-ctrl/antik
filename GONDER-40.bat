@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem 360 derece HD panoramalar rekonstruksiyon sayfasina baglandi (panoramas.ts ve rekonstruksiyon.$id.tsx)
git checkout main
if errorlevel 1 goto hata

git add src/lib/panoramas.ts
git add src/routes/rekonstruksiyon.$id.tsx
git add test-sonucu.txt
git add DEVAM-NOTU.md
git add GONDER-40.bat

git commit -m "360 derece HD panoramalar rekonstruksiyon sayfasina baglandi"
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
