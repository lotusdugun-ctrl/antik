@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Piper ses ornekleri hazirlaniyor (ucretsiz, kart gerekmez) ===
echo Yalnizca lisansi ticari kullanima izin veren sesler kaydedilir.
echo.
set PY=
where py >nul 2>nul && set PY=py -3
if not defined PY where python >nul 2>nul && set PY=python
if not defined PY (
  echo Python bulunamadi. SESLENDIR.bat'i bir kez calistirin ^(Python'u kurar^) ve tekrar deneyin.
  pause
  exit /b 1
)
set PYTHONUTF8=1
%PY% -m pip install --quiet --upgrade "piper-tts>=1.3,<2" lameenc
%PY% scripts\piper_ornekleri.py
if errorlevel 1 (
  echo.
  echo Bir sorun cikti. Yukaridaki mesajin ekran goruntusunu Claude'a gonder.
  pause
  exit /b 1
)
start "" "scripts\ses-ornekleri"
echo.
pause
