@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Yeni 4 antik kent icin pismis isikli modeller (ekran karti gerektirir)
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\glb\pisir-web.ps1" pompeii-kenti eboracum-kenti nimes-kenti trier-kenti
pause
