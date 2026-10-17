@echo off
rem 3D modellerin ortam seslerindeki Yunanca konusmalari (oyuncu, haberci,
rem ilahiler, saticilar, agit) ucretsiz Microsoft Edge sesleriyle kaydeder ve yayinlar.
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\ortam-sesleri.ps1"
echo.
pause
