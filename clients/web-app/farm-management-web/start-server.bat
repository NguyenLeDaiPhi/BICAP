@echo off
echo Starting Farm Management Web Server...
cd /d "%~dp0"
node src/authentication.js
pause
