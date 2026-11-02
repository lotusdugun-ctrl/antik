@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Celsus fotogrametri taramasini scans-raw klasorune indirir (siteye gitmez; Claude hazirlar)
where py >nul 2>nul
if %errorlevel%==0 (py -3 scripts\tarama_indir.py) else (python scripts\tarama_indir.py)
echo.
echo Bitti. Claude a "tarama indi" yazin.
pause
