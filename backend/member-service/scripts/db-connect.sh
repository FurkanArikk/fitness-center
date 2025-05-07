#!/bin/bash

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="/home/furkan/work/fitness-center/backend/member-service/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
fi

# Parameters for psql - loaded from environment with defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${MEMBER_SERVICE_DB_PORT:-5432}"
DB_USER="${DB_USER:-fitness_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"
DB_NAME="${MEMBER_SERVICE_DB_NAME:-fitness_member_db}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Set PGPASSWORD environment variable to avoid password prompt
export PGPASSWORD="${DB_PASSWORD}"

# Default psql options
PSQL_OPTS="-h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}"

# Function to check if PostgreSQL is available
check_postgres() {
  echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
  if psql $PSQL_OPTS -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}Connected to PostgreSQL successfully.${NC}"
    return 0
  else
    echo -e "${RED}Failed to connect to PostgreSQL.${NC}"
    echo "Ensure PostgreSQL is running and the following connection details are correct:"
    echo "  Host: ${DB_HOST}"
    echo "  Port: ${DB_PORT}"
    echo "  User: ${DB_USER}"
    echo "  Database: ${DB_NAME}"
    return 1
  fi
}

# Check connection first
check_postgres || exit 1

# Process command line arguments
if [ "$1" = "-f" ] || [ "$1" = "--file" ]; then
  if [ -z "$2" ]; then
    echo -e "${RED}Error: SQL file path not provided.${NC}"
    echo "Usage: $0 -f /path/to/sql/file.sql"
    exit 1
  fi
  
  if [ ! -f "$2" ]; then
    echo -e "${RED}Error: SQL file not found: $2${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}Executing SQL file: $2${NC}"
  psql $PSQL_OPTS -f "$2"
  exit_code=$?
  
  if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}SQL execution completed successfully.${NC}"
  else
    echo -e "${RED}SQL execution failed with exit code: $exit_code${NC}"
  fi
  
  exit $exit_code
else
  # Interactive mode if no arguments provided
  echo -e "${YELLOW}Starting interactive PostgreSQL session...${NC}"
  echo "Database: ${DB_NAME}"
  echo "Press Ctrl+D to exit"
  echo "----------------------------------"
  psql $PSQL_OPTS
fi

# Unset PGPASSWORD for security
unset PGPASSWORD
