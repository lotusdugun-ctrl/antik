@echo off
rem Sesli rehberi ucretsiz Microsoft Edge sesiyle (Emel) kaydeder ve yayinlar.
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\seslendir.ps1"
echo.
pause
