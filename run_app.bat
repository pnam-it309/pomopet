@echo off
title PomoPet Mobile - Pomodoro & Thu Ao
echo ==================================================================
echo    📱 POMOPET MOBILE - QUAN LY THOI GIAN & NUOI THU AO
echo ==================================================================
echo Dang khoi dong may chu PomoPet Mobile...
echo - Tren may tinh : http://localhost:8080 (hien thi khung Smartphone)
echo - Tren dien thoai: Mo trinh duyet tren dien thoai ket noi cung Wi-Fi!
echo Nhan Ctrl+C de dung ung dung.
echo ==================================================================

set "PATH=C:\Users\nickh\go\bin;%PATH%"
if exist "pomopet.exe" (
    pomopet.exe
) else (
    go run main.go
)
pause
