@echo off
echo.
echo ========================================
echo   IMS PROJECT - REGRESSION CHECKER
echo ========================================
echo.
py check_regressions.py
if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo ALL TESTS PASSED!
) else (
    color 0C
    echo.
    echo TESTS FAILED - PLEASE FIX REGRESSIONS.
)
pause
color 07
