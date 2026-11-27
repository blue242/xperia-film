@echo off
setlocal
set "ONLY=%~1"
if "%ONLY%"=="" set "ONLY=all"
set "DEVICE=%~2"
if "%DEVICE%"=="" set "DEVICE=auto"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\sync_and_deploy.ps1" -Only "%ONLY%" -Device "%DEVICE%"
exit /b %ERRORLEVEL%
