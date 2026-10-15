@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Ucretsiz ses ornekleri hazirlaniyor (kart gerekmez) ===
echo.
set PY=
where py >nul 2>nul && set PY=py -3
if not defined PY where python >nul 2>nul && set PY=python
if not defined PY (
  echo Python bulunamadi. python.org adresinden Python kurun ve tekrar deneyin.
  pause
  exit /b 1
)
%PY% -m pip install --quiet --upgrade edge-tts
%PY% scripts\ses_ornekleri.py
if errorlevel 1 (
  echo.
  echo Bir sorun cikti. Yukaridaki mesajin ekran goruntusunu Claude'a gonder.
  pause
  exit /b 1
)
start "" "scripts\ses-ornekleri"
echo.
pause
