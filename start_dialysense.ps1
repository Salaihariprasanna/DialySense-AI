# DialySense AI - All-in-One Launcher Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "               Launching DialySense AI                    " -ForegroundColor Cyan
Write-Host " Real-Time IoT Dialysis Monitoring & AI Risk System       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend in a background job
Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "backend\venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

# 2. Start Frontend
Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Set-Location frontend
npm run dev
