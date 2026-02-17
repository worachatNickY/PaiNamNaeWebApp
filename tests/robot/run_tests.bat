@echo off
REM Robot Framework Test Runner for PaiNamNae WebApp
REM ===================================================

echo.
echo ===================================
echo PaiNamNae WebApp - Robot Framework Tests
echo ===================================
echo.

REM Check if Robot Framework is installed
robot --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Robot Framework is not installed!
    echo Please run: pip install -r requirements.txt
    exit /b 1
)

REM Create results directory if it doesn't exist
if not exist "results" mkdir results

echo.
echo Running API Tests...
echo -----------------------------------
robot --outputdir results\api --name "API Tests" api_tests.robot

echo.
echo Running UI Tests (requires browser)...
echo -----------------------------------
robot --outputdir results\ui --name "UI Tests" ui_tests.robot

echo.
echo ===================================
echo Test execution completed!
echo Check results folder for reports.
echo ===================================
