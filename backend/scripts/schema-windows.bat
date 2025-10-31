@echo off
REM Windows batch script for running SQL schema setup

setlocal enabledelayedexpansion

REM Color codes (Windows 10+)
set "RESET=[0m"
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"

echo.
echo %BLUE%========================================%RESET%
echo %BLUE%NodeOps Project Management - Database Setup%RESET%
echo %BLUE%========================================%RESET%
echo.

REM Load environment variables from .env file
if not exist .env (
  echo %RED%Error: .env file not found%RESET%
  exit /b 1
)

REM Parse .env file
for /f "tokens=1,2 delims==" %%a in (.env) do (
  if "%%a"=="SUPABASE_URL" set "SUPABASE_URL=%%b"
  if "%%a"=="SUPABASE_SERVICE_KEY" set "SUPABASE_SERVICE_KEY=%%b"
)

if "!SUPABASE_URL!"=="" (
  echo %RED%Error: SUPABASE_URL not set in .env%RESET%
  exit /b 1
)

if "!SUPABASE_SERVICE_KEY!"=="" (
  echo %RED%Error: SUPABASE_SERVICE_KEY not set in .env%RESET%
  exit /b 1
)

REM Extract project ID safely (Windows-compatible)
set "TEMP_URL=!SUPABASE_URL:https://=!"
set "TEMP_URL=!TEMP_URL:http://=!"
for /f "delims=/ tokens=1" %%a in ("!TEMP_URL!") do set "HOST_PART=%%a"
for /f "delims=. tokens=1" %%b in ("!HOST_PART!") do set "PROJECT_ID=%%b"



echo %YELLOW%Project ID: !PROJECT_ID!%RESET%
echo %YELLOW%Supabase URL: !SUPABASE_URL!%RESET%
echo.

REM Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo %BLUE%Using psql to execute SQL...%RESET%
  
  set "PGPASSWORD=!SUPABASE_SERVICE_KEY!"
  
  echo %YELLOW%Running: Initialize Schema%RESET%
  psql -h !PROJECT_ID!.supabase.co -U postgres -d postgres -f scripts\01-init-schema.sql
  if %ERRORLEVEL% NEQ 0 goto error
  echo %GREEN%✓ Successfully executed: Initialize Schema%RESET%
  echo.
  
  echo %YELLOW%Running: Create Indexes%RESET%
  psql -h !PROJECT_ID!.supabase.co -U postgres -d postgres -f scripts\02-create-indexes.sql
  if %ERRORLEVEL% NEQ 0 goto error
  echo %GREEN%✓ Successfully executed: Create Indexes%RESET%
  echo.
  
  echo %YELLOW%Running: Enable Row Level Security%RESET%
  psql -h !PROJECT_ID!.supabase.co -U postgres -d postgres -f scripts\03-enable-rls.sql
  if %ERRORLEVEL% NEQ 0 goto error
  echo %GREEN%✓ Successfully executed: Enable Row Level Security%RESET%
  echo.
  
  echo %YELLOW%Running: Create Triggers%RESET%
  psql -h !PROJECT_ID!.supabase.co -U postgres -d postgres -f scripts\04-create-triggers.sql
  if %ERRORLEVEL% NEQ 0 goto error
  echo %GREEN%✓ Successfully executed: Create Triggers%RESET%
  echo.
  
  echo %YELLOW%Running: Seed Sample Data%RESET%
  psql -h !PROJECT_ID!.supabase.co -U postgres -d postgres -f scripts\05-seed-data.sql
  if %ERRORLEVEL% NEQ 0 goto error
  echo %GREEN%✓ Successfully executed: Seed Sample Data%RESET%
  echo.
  
  echo %YELLOW%Running: Create Utility Functions%RESET%
  psql -h !PROJECT_ID!.supabase.co -U postgres -d postgres -f scripts\06-utility-functions.sql
  if %ERRORLEVEL% NEQ 0 goto error
  echo %GREEN%✓ Successfully executed: Create Utility Functions%RESET%
  echo.
  
  goto success
) else (
  echo %RED%Error: psql not found%RESET%
  echo %YELLOW%Please install PostgreSQL: https://www.postgresql.org/download/%RESET%
  exit /b 1
)

:error
echo %RED%✗ Error executing SQL scripts%RESET%
echo %YELLOW%Troubleshooting:%RESET%
echo 1. Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
echo 2. Ensure PostgreSQL is installed and psql is in PATH
echo 3. Check SQL files exist in scripts\ directory
exit /b 1

:success
echo %BLUE%========================================%RESET%
echo %BLUE%Setup Summary%RESET%
echo %BLUE%========================================%RESET%
echo %GREEN%All scripts executed successfully!%RESET%
echo.
echo %BLUE%Next steps:%RESET%
echo 1. Verify tables in Supabase dashboard
echo 2. Update your application configuration
echo 3. Start your backend server: npm run start
exit /b 0
