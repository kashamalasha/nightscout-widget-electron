@echo off
echo ========================================
echo    Owlet Code Signing Build Script
echo ========================================
echo.

REM Check if certificate path is set
if "%CSC_LINK%"=="" (
    echo ERROR: CSC_LINK environment variable not set!
    echo Please set the path to your certificate file.
    echo Example: set CSC_LINK=C:\path\to\certificate.p12
    echo.
    pause
    exit /b 1
)

REM Check if certificate password is set
if "%CSC_KEY_PASSWORD%"=="" (
    echo ERROR: CSC_KEY_PASSWORD environment variable not set!
    echo Please set your certificate password.
    echo Example: set CSC_KEY_PASSWORD=your_password
    echo.
    pause
    exit /b 1
)

REM Check if certificate file exists
if not exist "%CSC_LINK%" (
    echo ERROR: Certificate file not found at: %CSC_LINK%
    echo Please check the path and try again.
    echo.
    pause
    exit /b 1
)

echo Certificate file: %CSC_LINK%
echo Building signed application...
echo.

REM Build the signed application
npm run dist

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    Build completed successfully!
    echo ========================================
    echo.
    echo Signed files are available in the 'dist' folder.
    echo.
) else (
    echo.
    echo ========================================
    echo    Build failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
