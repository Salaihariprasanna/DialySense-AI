# DialySense AI - All-in-One Launcher Script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "               Launching DialySense AI                    " -ForegroundColor Cyan
Write-Host " Real-Time IoT Dialysis Monitoring & AI Risk System       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend in a background process
Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "$scriptDir\backend\venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000" -WorkingDirectory "$scriptDir\backend" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

# 2. Start Frontend
Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Set-Location "$scriptDir\frontend"
Start-Process "http://localhost:5173"
npm run dev
