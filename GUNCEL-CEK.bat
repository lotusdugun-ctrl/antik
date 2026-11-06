@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Arkadasin (agtt) son degisikliklerini GitHub'dan ceker
git checkout main
if errorlevel 1 goto hata
git pull --no-edit origin main
if errorlevel 1 goto hata
call bun install
git log -5 --oneline > guncel-durum.txt
git status --short >> guncel-durum.txt
echo Tamam! Claude'a "guncellendi" yaz.
pause
exit /b 0
:hata
echo Bir sorun cikti. Ekran goruntusunu yapay zekaya gonder.
pause
exit /b 1
