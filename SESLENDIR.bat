@echo off
rem Sesli rehberi ve 3D modellerin Yunanca seslerini acik kaynak Piper sesleriyle
rem bu bilgisayarda kaydeder ve yayinlar. Yalnizca lisansi ticari kullanima izin
rem veren sesler kullanilir; eski Edge kayitlari silinir. Bkz. docs\SESLER.md
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\seslendir.ps1"
echo.
pause
