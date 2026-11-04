@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Kaynak kodu ve taramalari tek dosyada toplar (Claude buluta alip uygulamayi orada calistirir)
rem Ses dosyalari, node_modules ve .git dahil edilmez.
echo Paketleniyor...
if exist "buluta-paket.tar" del "buluta-paket.tar"
tar -cf buluta-paket.tar src public\scans public\icons public\manifest.webmanifest public\sw.js package.json bun.lock bunfig.toml tsconfig.json vite.config.ts components.json eslint.config.js scripts\glb unity\araclar
if errorlevel 1 (
  echo Bir sorun cikti.
  pause
  exit /b 1
)
echo Tamam! Claude'a "paket hazir" yazin.
pause
