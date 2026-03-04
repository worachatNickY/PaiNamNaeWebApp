@echo off
REM บังคับให้สคริปต์ทำงานในโฟลเดอร์ที่ไฟล์ .bat วางอยู่
cd /d %~dp0

REM ===================================================
REM Robot Framework Test Runner for PaiNamNae WebApp
REM ===================================================

echo.
echo ===================================
echo PaiNamNae WebApp - Robot Framework Tests
echo ===================================
echo.

REM เปิดใช้งาน Virtual Environment
echo Activating virtual environment...
set "PYTHON_PATH=..\..\..\.venv\Scripts\python.exe"
echo Using python: "%PYTHON_PATH%"

REM ติดตั้ง dependencies เสมอ (เผื่อยังไม่ลง)
echo Installing requirements (if not already)...
"%PYTHON_PATH%" -m pip install -r requirements.txt

echo Checking robot availability...
for /f "usebackq delims=" %%a in (`"%PYTHON_PATH%" -m robot --version 2^>^&1`) do set "RF_VER=%%a"
echo Version output: %RF_VER%

echo %RF_VER% | findstr /i "Robot Framework" >nul
if errorlevel 1 (
    echo ERROR: Robot Framework still not installed or output unexpected!
    pause
    exit /b 1
)

REM สร้างโฟลเดอร์ผลลัพธ์ (ถ้าไม่มี)
if not exist "results\feature" mkdir results\feature
if not exist "results\ui" mkdir results\ui

echo.
echo Running Feature (API) Tests...
echo -----------------------------------
REM รันและเก็บผลใน results\feature
"%PYTHON_PATH%" -m robot --outputdir results\feature --name "Feature API Tests" pbi_feature_tests.robot

echo.
echo Running UI Tests...
echo -----------------------------------
"%PYTHON_PATH%" -m robot --outputdir results\ui --name "UI Tests" pbi_ui_tests.robot

echo.
echo ===================================
echo Test execution completed!
echo ===================================
pause

