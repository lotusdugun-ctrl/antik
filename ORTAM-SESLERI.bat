@echo off
rem 3D modellerin ortam seslerindeki Yunanca konusmalari acik kaynak Piper sesiyle
rem kaydeder ve yayinlar (lisans uygunsa). Bkz. docs\SESLER.md
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\ortam-sesleri.ps1"
echo.
pause
