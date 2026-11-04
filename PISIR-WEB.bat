@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Web icin gunduz isigiyla pismis modeller (ekran karti). Uzun surer; bilgisayar uyumasin.
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\glb\pisir-web.ps1" %*
pause
