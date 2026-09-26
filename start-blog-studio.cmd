@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required to run Blog Studio. Install it from https://nodejs.org/
  pause
  exit /b 1
)
node tools\studio-server.js
if errorlevel 1 pause
