@echo off
echo 🚀 Starting AI Content Studio...
echo.

REM Kill any existing process on port 3000
echo 🔍 Checking for existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo ⚡ Killing process %%a on port 3000...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo 🎯 Starting server...
echo.
npm start

pause