@echo off
title DialySense AI - Smart IoT Dialysis Monitoring System
color 0b
echo ======================================================================
echo           DialySense AI - Smart IoT Dialysis System
echo ======================================================================
echo.
cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "DialySense AI Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting React + Vite Dashboard on http://localhost:5173 ...
start "DialySense AI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo Opening browser to http://localhost:5173 ...
start http://localhost:5173

echo.
echo ======================================================================
echo System successfully launched!
echo - React Dashboard: http://localhost:5173
echo - FastAPI Docs:    http://localhost:8000/docs
echo ======================================================================
pause
