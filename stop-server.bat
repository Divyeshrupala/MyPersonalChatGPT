@echo off
echo 🛑 Stopping AI Content Studio...
echo.

REM Kill any existing process on port 3000
echo 🔍 Finding processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo ⚡ Killing process %%a...
        taskkill /PID %%a /F
    )
)

echo ✅ Server stopped successfully!
pause