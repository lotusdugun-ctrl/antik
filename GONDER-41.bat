@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem 5 ulkede 10 yeni 3D antik kent eklendi (605/605 test gecildi)
git checkout main
if errorlevel 1 goto hata

git add src/lib/reconstructions.ts
git add src/lib/sites.ts
git add src/lib/site-details.ts
git add src/lib/site-facts.ts
git add src/lib/soundscapes.ts
git add src/lib/scans.ts
git add src/lib/scene-life.ts
git add src/lib/models/on-yeni-life.ts
git add src/lib/models/patara-deniz-feneri-life.ts
git add src/lib/__tests__/epigraphy.test.ts
git add src/lib/__tests__/soundscapes.test.ts
git add docs/yapi-kartlari/emerita-augusta.md
git add docs/yapi-kartlari/italica.md
git add docs/yapi-kartlari/delfi.md
git add docs/yapi-kartlari/olimpiya.md
git add docs/yapi-kartlari/iskenderiye.md
git add docs/yapi-kartlari/karnak.md
git add docs/yapi-kartlari/petra.md
git add docs/yapi-kartlari/ceras.md
git add docs/yapi-kartlari/baalbek.md
git add docs/yapi-kartlari/biblos.md
git add test-sonucu.txt
git add DEVAM-NOTU.md
git add GONDER-41.bat

git commit -m "5 ulkede 10 yeni 3D antik kent eklendi (Emerita Augusta, Italica, Delfi, Olimpiya, Iskenderiye, Karnak, Petra, Ceras, Baalbek, Biblos)"
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
