@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Yeni heykel taramalarini scans-raw klasorune indirir (siteye gitmez; Claude hazirlar).
if not exist "scripts\.sketchfab-token" (
  echo Sketchfab modelleri icin ucretsiz bir Sketchfab hesabinin API anahtari gerekir:
  echo sketchfab.com - Settings - Password ^& API - API Token
  echo Anahtar yoksa bos birakip Enter'a basin; yalnizca SMK heykelleri iner.
  set /p SFTOKEN=Sketchfab API Token: 
)
if defined SFTOKEN echo %SFTOKEN%> "scripts\.sketchfab-token"
where py >nul 2>nul
if %errorlevel%==0 (py -3 scripts\heykel_indir.py) else (python scripts\heykel_indir.py)
echo.
echo Bitti. Claude'a "heykeller indi" yazin.
pause
