@echo off
REM KVC Production Deployment Script for Windows
REM Usage: deploy-production.bat [staging|production]

setlocal enabledelayedexpansion

REM Colors
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

REM Configuration
set "DEPLOY_ENV=%1"
if "!DEPLOY_ENV!"=="" set "DEPLOY_ENV=production"

set "PROJECT_DIR=C:\opt\kvc-fullstack"
set "BACKUP_DIR=C:\backups\kvc"
set "LOG_FILE=!BACKUP_DIR!\deployment-%date:~-10,2%%date:~-7,2%%date:~-4,4%-%time:~0,2%%time:~3,2%%time:~6,2%.log"

REM Ensure log directory exists
if not exist "!BACKUP_DIR!" (
    mkdir "!BACKUP_DIR!"
)

cls
echo.
echo %BLUE%╔════════════════════════════════════════════════════════╗%NC%
echo %BLUE%║      KVC PRODUCTION DEPLOYMENT - !DEPLOY_ENV!         ║%NC%
echo %BLUE%╚════════════════════════════════════════════════════════╝%NC%
echo.
echo Project: !PROJECT_DIR!
echo Log File: !LOG_FILE!
echo.

(
    echo [%date% %time%] ========== DEPLOYMENT START ==========
    echo Environment: !DEPLOY_ENV!
) >> "!LOG_FILE!"

REM Pre-flight checks
echo %YELLOW%► Pre-flight checks...%NC%
echo [%date% %time%] Running pre-flight checks >> "!LOG_FILE!"

if not exist "!PROJECT_DIR!" (
    echo %RED%✗ Project directory not found: !PROJECT_DIR!%NC%
    echo [%date% %time%] ERROR: Project directory not found >> "!LOG_FILE!"
    pause
    exit /b 1
)
echo %GREEN%✓ Project directory found%NC%

if not exist "!PROJECT_DIR!\backend\.env" (
    echo %RED%✗ Backend .env not found!%NC%
    echo [%date% %time%] ERROR: Backend .env not found >> "!LOG_FILE!"
    pause
    exit /b 1
)
echo %GREEN%✓ Backend .env found%NC%

if not exist "!PROJECT_DIR!\frontend\.env" (
    echo %RED%✗ Frontend .env not found!%NC%
    echo [%date% %time%] ERROR: Frontend .env not found >> "!LOG_FILE!"
    pause
    exit /b 1
)
echo %GREEN%✓ Frontend .env found%NC%

REM Check Docker
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%✗ Docker not installed!%NC%
    echo [%date% %time%] ERROR: Docker not installed >> "!LOG_FILE!"
    pause
    exit /b 1
)
echo %GREEN%✓ Docker installed%NC%

REM Create backup
echo.
echo %YELLOW%► Creating backup...%NC%
echo [%date% %time%] Creating database backup >> "!LOG_FILE!"

cd /d "!PROJECT_DIR!"
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP_FILE=!BACKUP_DIR!\backup-!mydate!-!mytime!.sql.gz

docker-compose exec -T postgres pg_dump -U postgres kvcdb 2> nul | gzip > "!BACKUP_FILE!"
if %errorlevel% equ 0 (
    echo %GREEN%✓ Database backed up%NC%
    echo [%date% %time%] Database backup created: !BACKUP_FILE! >> "!LOG_FILE!"
) else (
    echo %YELLOW%⚠ Backup failed (services may not be running)%NC%
    echo [%date% %time%] WARNING: Backup failed - services may not be running >> "!LOG_FILE!"
)

REM Stop services
echo.
echo %YELLOW%► Stopping services...%NC%
echo [%date% %time%] Stopping Docker services >> "!LOG_FILE!"

docker-compose down >> "!LOG_FILE!" 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✓ Services stopped%NC%
) else (
    echo %YELLOW%⚠ Services were not running or stop failed%NC%
)

REM Build images
echo.
echo %YELLOW%► Building Docker images...%NC%
echo [%date% %time%] Building Docker images >> "!LOG_FILE!"

docker-compose build --no-cache >> "!LOG_FILE!" 2>&1
if %errorlevel% neq 0 (
    echo %RED%✗ Docker build failed!%NC%
    echo [%date% %time%] ERROR: Docker build failed >> "!LOG_FILE!"
    type "!LOG_FILE!" | tail -20
    pause
    exit /b 1
)
echo %GREEN%✓ Docker images built successfully%NC%

REM Start services
echo.
echo %YELLOW%► Starting services...%NC%
echo [%date% %time%] Starting Docker services >> "!LOG_FILE!"

docker-compose up -d >> "!LOG_FILE!" 2>&1
if %errorlevel% neq 0 (
    echo %RED%✗ Failed to start services!%NC%
    echo [%date% %time%] ERROR: Failed to start services >> "!LOG_FILE!"
    pause
    exit /b 1
)
echo %GREEN%✓ Services started%NC%

echo.
echo %YELLOW%► Waiting for services to stabilize...%NC%
timeout /t 10 /nobreak

REM Run migrations
echo.
echo %YELLOW%► Running database migrations...%NC%
echo [%date% %time%] Running database migrations >> "!LOG_FILE!"

docker-compose exec -T backend npx prisma migrate deploy >> "!LOG_FILE!" 2>&1
if %errorlevel% neq 0 (
    echo %RED%✗ Migrations failed!%NC%
    echo [%date% %time%] ERROR: Migrations failed >> "!LOG_FILE!"
    pause
    exit /b 1
)
echo %GREEN%✓ Migrations completed successfully%NC%

REM Verify deployment
echo.
echo %YELLOW%► Verifying deployment...%NC%
echo [%date% %time%] Verifying deployment >> "!LOG_FILE!"

echo.
echo %YELLOW%  Checking container status...%NC%
docker-compose ps >> "!LOG_FILE!" 2>&1

timeout /t 5 /nobreak

echo.
echo %YELLOW%  Checking backend health...%NC%
curl -s -f http://localhost:4001/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✓ Backend is healthy%NC%
) else (
    echo %YELLOW%⚠ Backend health check failed (may still be starting)%NC%
)

echo.
echo %YELLOW%  Checking frontend...%NC%
curl -s -f http://localhost:3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✓ Frontend is accessible%NC%
) else (
    echo %YELLOW%⚠ Frontend not yet ready%NC%
)

REM Show summary
echo.
echo.
echo %BLUE%╔════════════════════════════════════════════════════════╗%NC%
echo %BLUE%║        DEPLOYMENT COMPLETED SUCCESSFULLY!               ║%NC%
echo %BLUE%╚════════════════════════════════════════════════════════╝%NC%
echo.
echo %GREEN%Services:%NC%
echo   Backend:   http://localhost:4001
echo   Frontend:  http://localhost:3000
echo   Database:  localhost:5432
echo.
echo %GREEN%Useful commands:%NC%
echo   View logs:        docker-compose logs -f
echo   Stop services:    docker-compose down
echo   Restart services: docker-compose restart
echo.
echo %GREEN%Log file: !LOG_FILE!%NC%
echo.

echo [%date% %time%] ========== DEPLOYMENT COMPLETE ========== >> "!LOG_FILE!"

pause
exit /b 0
