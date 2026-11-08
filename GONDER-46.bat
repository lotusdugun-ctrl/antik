@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Ozgun dunya antik kenti modelleri: Ziggurat, Apadana, Khmer Lotus ve Indic anitlari, geometri ve yasam duzeltmeleri
git checkout main
if errorlevel 1 goto hata

git add src/lib/models/dunya-modelleri.ts
git add src/lib/models/dunya-modelleri-life.ts
git add src/lib/reconstructions.ts
git add src/lib/reconstruction-parts.ts
git add src/lib/scene-life.ts
git add DEVAM-NOTU.md
git add GONDER-46.bat

git commit -m "feat(3d): Mezopotamya, Pers, Khmer, Indus ve Mezoamerika ozgun modelleri ve geometri/yasam duzeltmeleri"
git pull --no-edit origin main
if errorlevel 1 goto hata

git push origin main
if errorlevel 1 goto hata

echo.
echo ============================================================
echo   GONDERILDI! Vercel dagitimi basladi.
echo   Canli site: https://antik-kentler-tawny.vercel.app/
echo ============================================================
goto son

:hata
echo.
echo Bir hata olustu, gonderim tamamlanamadi.
pause

:son
