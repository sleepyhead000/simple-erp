@echo off
setlocal EnableExtensions
title ERP System Launcher
color 0A
cd /d "%~dp0"

echo ========================================
echo         ERP System Launcher
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js was not found on PATH. Install Node.js 20+ first.
    goto :abort
)
where curl >nul 2>&1
if errorlevel 1 (
    echo [ERROR] curl was not found. It ships with Windows 10 build 1803+.
    goto :abort
)

echo Checking ports...
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [ERROR] Port 3000 is already in use:
    netstat -ano | findstr ":3000 " | findstr "LISTENING"
    echo         Close the program using port 3000, then run this again.
    goto :abort
)
netstat -ano | findstr ":3001 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [ERROR] Port 3001 is already in use:
    netstat -ano | findstr ":3001 " | findstr "LISTENING"
    echo         Close the program using port 3001, then run this again.
    goto :abort
)
echo [OK] Ports 3000 and 3001 are free.
echo.

docker info >nul 2>&1
if errorlevel 1 goto :sqlite_mode

echo [OK] Docker detected - using PostgreSQL.
echo.
echo Starting PostgreSQL and Redis containers...
docker compose up -d postgres redis
if errorlevel 1 (
    echo [ERROR] "docker compose up" failed. Is Docker Desktop running?
    goto :abort
)
echo Waiting for containers to be ready...
ping -n 6 127.0.0.1 >nul
echo [OK] Containers started.
echo.

echo Setting up backend (PostgreSQL)...
cd /d "%~dp0backend"
set "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erp"
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 goto :install_failed
)
call npx prisma generate
if errorlevel 1 goto :prisma_failed
call npx prisma migrate deploy
if errorlevel 1 (
    echo [ERROR] Database migration failed.
    echo         PostgreSQL mode needs its own migrations. If this project was
    echo         previously started in SQLite mode, stop Docker and use SQLite
    echo         mode instead (run this launcher with Docker stopped).
    goto :abort
)
echo [OK] Backend ready to start.
echo.
echo Starting backend server (http://localhost:3001)...
start "ERP Backend - port 3001" cmd /k "set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erp&& set REDIS_URL=redis://localhost:6379&& set JWT_SECRET=dev-secret-change-in-production&& set JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production&& set NODE_ENV=development&& set PORT=3001&& set CORS_ORIGIN=http://localhost:3000&& npm run start:dev"
goto :start_frontend

:sqlite_mode
echo [!] Docker not running - using SQLite.
echo.
echo Setting up backend (SQLite)...
cd /d "%~dp0backend"
set "DATABASE_URL=file:./dev.db"
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 goto :install_failed
)
call npx prisma generate --schema=prisma/schema.sqlite
if errorlevel 1 goto :prisma_failed
if exist "prisma\migrations" (
    call npx prisma migrate deploy --schema=prisma/schema.sqlite
) else (
    echo First run detected - creating initial migration...
    call npx prisma migrate dev --schema=prisma/schema.sqlite --name init
)
if errorlevel 1 goto :prisma_failed
echo [OK] Backend ready to start.
echo.
echo Starting backend server (http://localhost:3001)...
start "ERP Backend - port 3001" cmd /k "set DATABASE_URL=file:./dev.db&& set JWT_SECRET=dev-secret-change-in-production&& set JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production&& set NODE_ENV=development&& set PORT=3001&& set CORS_ORIGIN=http://localhost:3000&& npm run start:dev"

:start_frontend
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 goto :install_failed
)
echo.
echo Starting frontend server (http://localhost:3000)...
start "ERP Frontend - port 3000" cmd /k "set PORT=3000&& npm run dev"

rem ============================================================
rem  Wait for the backend health check, then warm up the
rem  frontend first page, and only then open the browser.
rem ============================================================
cd /d "%~dp0"

echo.
echo Waiting for the backend on http://localhost:3001 ...
set attempts=0
:wait_backend
set /a attempts+=1
if %attempts% gtr 120 (
    echo [ERROR] The backend did not become ready in time.
    echo         Look at the "ERP Backend - port 3001" window for errors.
    goto :abort
)
curl -s -f -o nul -m 2 http://localhost:3001/api/health
if errorlevel 1 (
    ping -n 2 127.0.0.1 >nul
    goto :wait_backend
)
echo [OK] Backend is up - health check passed.

echo.
echo Waiting for the frontend on http://localhost:3000 ...
set attempts=0
:wait_frontend
set /a attempts+=1
if %attempts% gtr 60 (
    echo [ERROR] The frontend did not start in time.
    echo         Look at the "ERP Frontend - port 3000" window for errors.
    goto :abort
)
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    ping -n 2 127.0.0.1 >nul
    goto :wait_frontend
)
echo [OK] Frontend is listening on port 3000.
echo Compiling the home page (first run can take up to a minute)...
curl -s -f -o nul -m 180 http://localhost:3000/
if errorlevel 1 (
    echo [ERROR] The frontend could not compile the home page.
    echo         Look at the "ERP Frontend - port 3000" window for errors.
    goto :abort
)

echo.
echo ========================================
echo   All services are running!
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001/api/health
echo ========================================
echo.
start "" http://localhost:3000
echo To stop the app, close the two service windows
echo (or run "docker compose down" if Docker was used).
echo.
echo You can close this window now.
pause >nul
exit /b 0

:install_failed
echo.
echo [ERROR] npm install failed. Check your internet connection and try again.
goto :abort

:prisma_failed
echo.
echo [ERROR] Prisma setup failed. See the message above.
goto :abort

:abort
echo.
echo [ERROR] Launch aborted. Fix the problem above and run launch.bat again.
echo.
pause >nul
exit /b 1
