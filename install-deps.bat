@echo off
setlocal enabledelayedexpansion

REM Install auth-service
echo ============================================
echo Installing auth-service...
echo ============================================
cd /d "d:\New folder\ACMDigitalProjectRepository\backend\services\auth-service"
npm install
if errorlevel 1 (
    echo First attempt failed, trying with --legacy-peer-deps...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo FAILED: auth-service
    ) else (
        echo SUCCESS: auth-service (with --legacy-peer-deps)
    )
) else (
    echo SUCCESS: auth-service
)

REM Install user-service
echo.
echo ============================================
echo Installing user-service...
echo ============================================
cd /d "d:\New folder\ACMDigitalProjectRepository\backend\services\user-service"
npm install
if errorlevel 1 (
    echo First attempt failed, trying with --legacy-peer-deps...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo FAILED: user-service
    ) else (
        echo SUCCESS: user-service (with --legacy-peer-deps)
    )
) else (
    echo SUCCESS: user-service
)

REM Install project-service
echo.
echo ============================================
echo Installing project-service...
echo ============================================
cd /d "d:\New folder\ACMDigitalProjectRepository\backend\services\project-service"
npm install
if errorlevel 1 (
    echo First attempt failed, trying with --legacy-peer-deps...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo FAILED: project-service
    ) else (
        echo SUCCESS: project-service (with --legacy-peer-deps)
    )
) else (
    echo SUCCESS: project-service
)

REM Install asset-service
echo.
echo ============================================
echo Installing asset-service...
echo ============================================
cd /d "d:\New folder\ACMDigitalProjectRepository\backend\services\asset-service"
npm install
if errorlevel 1 (
    echo First attempt failed, trying with --legacy-peer-deps...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo FAILED: asset-service
    ) else (
        echo SUCCESS: asset-service (with --legacy-peer-deps)
    )
) else (
    echo SUCCESS: asset-service
)

REM Install notification-service
echo.
echo ============================================
echo Installing notification-service...
echo ============================================
cd /d "d:\New folder\ACMDigitalProjectRepository\backend\services\notification-service"
npm install
if errorlevel 1 (
    echo First attempt failed, trying with --legacy-peer-deps...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo FAILED: notification-service
    ) else (
        echo SUCCESS: notification-service (with --legacy-peer-deps)
    )
) else (
    echo SUCCESS: notification-service
)

REM Install gateway
echo.
echo ============================================
echo Installing gateway...
echo ============================================
cd /d "d:\New folder\ACMDigitalProjectRepository\backend\gateway"
npm install
if errorlevel 1 (
    echo First attempt failed, trying with --legacy-peer-deps...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo FAILED: gateway
    ) else (
        echo SUCCESS: gateway (with --legacy-peer-deps)
    )
) else (
    echo SUCCESS: gateway
)

echo.
echo ============================================
echo Installation Summary Complete
echo ============================================
