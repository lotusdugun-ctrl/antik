@echo off
rem Sesli rehberi Google Chirp 3 HD sesleriyle kaydeder. Bkz. docs\SESLENDIRME.md
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\seslendir-google.ps1"
echo.
pause
