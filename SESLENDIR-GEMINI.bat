@echo off
cd /d "%~dp0"
set /p SES=Ses adi (bos birakirsaniz Sulafat): 
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\seslendir-gemini.ps1" -Voice "%SES%"
pause
