@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Babil (Firat ve 15 m Istar Kapisi ile) yeniden pisirilir. Once GONDER-52 calistirilmis olmali.
if exist "hd-out\pisir\babil-kenti" rmdir /s /q "hd-out\pisir\babil-kenti"
if exist "public\baked\babil-kenti\babil-kenti-bake.json" del "public\baked\babil-kenti\babil-kenti-bake.json"
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\glb\pisir-web.ps1" babil-kenti
echo.
echo Bitince GONDER-53.bat calistirin.
pause
