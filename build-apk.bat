@echo off
title Inisha City Service - EAS Android APK Builder
echo ========================================================
echo   Starting Standalone Android APK Build for Inisha City
echo ========================================================
echo.
cd /d "%~dp0apps\mobile"
echo [1/2] Navigated to mobile project directory: %CD%
echo [2/2] Triggering EAS Cloud APK Builder...
echo.
set EAS_NO_VCS=1
npx eas-cli build -p android --profile preview
echo.
echo ========================================================
echo   Build command finished.
echo ========================================================
pause
