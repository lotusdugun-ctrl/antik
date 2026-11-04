@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Tip denetimi ve testler; sonuc test-sonucu.txt dosyasina yazilir (Claude okur)
rem Once paketler kurulur (node_modules yoksa testler react/three bulamayip dusuyor)
echo Paketler kuruluyor, sonra testler calisiyor (birkac dakika)...
(echo === install ===& call bun install --frozen-lockfile & echo === tsc ===& call bunx tsc --noEmit & echo === test ===& call bun test) > test-sonucu.txt 2>&1
echo Bitti. Claude a "test bitti" yazin.
pause
