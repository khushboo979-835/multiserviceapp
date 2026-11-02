@echo off
title Inisha City Service - Google Play Production AAB Builder
echo ========================================================
echo   Starting Production AAB Build for Google Play Console
echo ========================================================
echo.
cd /d "C:\Users\ECS\Desktop\mobile app\multi-service-app"
echo [1/2] Navigated to project root directory: %CD%
echo [2/2] Triggering EAS Cloud Production AAB Builder...
echo.
set EAS_NO_VCS=
set EXPO_TOKEN=DeMGDLS8xnJHwMOAgpTHxWtYNnsr9PCfVVHbVljx
call npx.cmd eas-cli build -p android --profile production
echo.
echo ========================================================
echo   Build command finished.
echo ========================================================
pause
