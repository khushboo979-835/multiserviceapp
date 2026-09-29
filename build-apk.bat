@echo off
title Inisha City Service - EAS Android APK Builder
echo ========================================================
echo   Starting Standalone Android APK Build for Inisha City
echo ========================================================
echo.
cd /d "C:\Users\ECS\Desktop\mobile app\multi-service-app\apps\mobile"
echo [1/2] Navigated to mobile project directory: %CD%
echo [2/2] Triggering EAS Cloud APK Builder...
echo.
set EAS_NO_VCS=
set EXPO_TOKEN=XgR7sLFGnNKNw8Xl9f6y0G0Elcp9oHvczPRnGY9N
call npx.cmd eas-cli build -p android --profile preview
echo.
echo ========================================================
echo   Build command finished.
echo ========================================================
pause

