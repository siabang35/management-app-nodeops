#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
else
  echo -e "${RED}Error: .env file not found${NC}"
  exit 1
fi

# Validate required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo -e "${RED}Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env${NC}"
  exit 1
fi

# Extract project ID from SUPABASE_URL
PROJECT_ID=$(echo $SUPABASE_URL | grep -oP '(?<=https://)[^.]+')

if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: Could not extract project ID from SUPABASE_URL${NC}"
  exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}NodeOps Project Management - Database Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Project ID: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Supabase URL: ${SUPABASE_URL}${NC}"
echo ""

# Function to execute SQL file
execute_sql() {
  local sql_file=$1
  local script_name=$2
  
  if [ ! -f "$sql_file" ]; then
    echo -e "${RED}✗ Error: SQL file not found: $sql_file${NC}"
    return 1
  fi
  
  echo -e "${YELLOW}Running: $script_name${NC}"
  
  # Read SQL file and execute via Supabase API
  local sql_content=$(cat "$sql_file")
  
  # Execute SQL using curl
  local response=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": $(echo "$sql_content" | jq -Rs .)}" 2>&1)
  
  # Alternative method using psql if available
  if command -v psql &> /dev/null; then
    echo -e "${BLUE}Using psql to execute SQL...${NC}"
    
    # Extract connection string from SUPABASE_URL
    PGPASSWORD=$SUPABASE_SERVICE_KEY psql \
      -h "${PROJECT_ID}.supabase.co" \
      -U postgres \
      -d postgres \
      -f "$sql_file" 2>&1
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Successfully executed: $script_name${NC}"
      return 0
    else
      echo -e "${RED}✗ Error executing: $script_name${NC}"
      return 1
    fi
  else
    # Fallback: Use Supabase CLI if available
    if command -v supabase &> /dev/null; then
      echo -e "${BLUE}Using Supabase CLI to execute SQL...${NC}"
      
      supabase db push --db-url "postgresql://postgres:${SUPABASE_SERVICE_KEY}@${PROJECT_ID}.supabase.co:5432/postgres" \
        < "$sql_file" 2>&1
      
      if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully executed: $script_name${NC}"
        return 0
      else
        echo -e "${RED}✗ Error executing: $script_name${NC}"
        return 1
      fi
    else
      echo -e "${RED}✗ Error: Neither psql nor supabase CLI found${NC}"
      echo -e "${YELLOW}Please install one of the following:${NC}"
      echo -e "${YELLOW}  - PostgreSQL (psql): https://www.postgresql.org/download/${NC}"
      echo -e "${YELLOW}  - Supabase CLI: npm install -g supabase${NC}"
      return 1
    fi
  fi
}

# Track success/failure
FAILED=0
TOTAL=0

# Array of SQL scripts to execute in order
declare -a SQL_SCRIPTS=(
  "scripts/01-init-schema.sql:Initialize Schema"
  "scripts/02-create-indexes.sql:Create Indexes"
  "scripts/03-enable-rls.sql:Enable Row Level Security"
  "scripts/04-create-triggers.sql:Create Triggers"
  "scripts/05-seed-data.sql:Seed Sample Data"
  "scripts/06-utility-functions.sql:Create Utility Functions"
)

echo -e "${BLUE}Starting database setup...${NC}"
echo ""

# Execute each SQL script
for script in "${SQL_SCRIPTS[@]}"; do
  IFS=':' read -r sql_file script_name <<< "$script"
  TOTAL=$((TOTAL + 1))
  
  execute_sql "$sql_file" "$script_name"
  
  if [ $? -ne 0 ]; then
    FAILED=$((FAILED + 1))
  fi
  
  echo ""
done

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Setup Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total scripts: ${TOTAL}"
echo -e "Successful: ${GREEN}$((TOTAL - FAILED))${NC}"

if [ $FAILED -gt 0 ]; then
  echo -e "Failed: ${RED}${FAILED}${NC}"
  echo ""
  echo -e "${YELLOW}Troubleshooting:${NC}"
  echo -e "1. Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"
  echo -e "2. Ensure you have psql installed: https://www.postgresql.org/download/"
  echo -e "3. Or install Supabase CLI: npm install -g supabase"
  echo -e "4. Check SQL files exist in scripts/ directory"
  exit 1
else
  echo -e "${GREEN}All scripts executed successfully!${NC}"
  echo ""
  echo -e "${BLUE}Next steps:${NC}"
  echo -e "1. Verify tables in Supabase dashboard"
  echo -e "2. Update your application configuration"
  echo -e "3. Start your backend server: npm run start"
  exit 0
fi
