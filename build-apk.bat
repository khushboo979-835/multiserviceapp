@echo off
title Inisha City Service - EAS Android APK Builder
echo ========================================================
echo   Starting Standalone Android APK Build for Inisha City
echo ========================================================
echo.
cd /d "C:\Users\ECS\Desktop\mobile app\multi-service-app"
echo [1/2] Navigated to project root directory: %CD%
echo [2/2] Triggering EAS Cloud APK Builder...
echo.
set EAS_NO_VCS=
set EXPO_TOKEN=DeMGDLS8xnJHwMOAgpTHxWtYNnsr9PCfVVHbVljx
call npx.cmd eas-cli build -p android --profile preview
echo.
echo ========================================================
echo   Build command finished.
echo ========================================================
pause
