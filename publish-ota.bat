@echo off
title Inisha City Service - Live OTA Publisher
echo ========================================================
echo   Publishing Live OTA Updates to Preview and Production
echo ========================================================
echo.
cd /d "C:\Users\ECS\Desktop\mobile app\multi-service-app"
echo [1/3] Navigated to project root directory: %CD%
echo [2/3] Publishing to preview channel...
call npx.cmd eas-cli update --channel preview --platform android -m "fix: booking spinner, Page Not Found routes, View All and Android navigation bar insets" --non-interactive
echo.
echo [3/3] Publishing to production channel...
call npx.cmd eas-cli update --channel production --platform android -m "fix: booking spinner, Page Not Found routes, View All and Android navigation bar insets" --non-interactive
echo.
echo ========================================================
echo   OTA Live Update Completed Successfully!
echo ========================================================
