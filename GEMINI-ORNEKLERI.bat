@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\seslendir-gemini.ps1" -Samples
pause
