@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "BL="
for /d %%D in ("%ProgramFiles%\Blender Foundation\Blender*") do if exist "%%D\blender.exe" set "BL=%%D\blender.exe"
if not defined BL for /d %%D in ("%ProgramFiles(x86)%\Steam\steamapps\common\Blender") do if exist "%%D\blender.exe" set "BL=%%D\blender.exe"
if not defined BL (
  where blender >nul 2>nul && set "BL=blender"
)
if not defined BL (
  echo Blender bulunamadi. https://www.blender.org/download/ adresinden son surumu kurun.
  echo Blender bulunamadi.> blender-durum.txt
  pause
  exit /b 1
)
echo Blender: %BL%
"%BL%" -b --factory-startup --python scripts\blender_kontrol.py -- "%~dp0blender-durum.txt"
echo.
echo Bitti. Claude'a "blender tamam" yazin.
pause
