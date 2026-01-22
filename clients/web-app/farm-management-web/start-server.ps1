# Start Farm Management Web Server
Write-Host "Starting Farm Management Web Server..." -ForegroundColor Green
Set-Location $PSScriptRoot
node src/authentication.js
