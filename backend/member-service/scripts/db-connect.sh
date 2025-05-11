#!/bin/bash

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="$(pwd)/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

# Connection script for fitness member database
# Usage: ./scripts/db-connect.sh [-f file.sql] [-c "SQL command"]

# Default connection parameters from environment variables with defaults
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

# Check if password is provided as environment variable
if [ -z "$PGPASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

echo "Connecting to the member service database..."

# Function to check if PostgreSQL is available
check_postgres() {
  echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
  if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
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

# Process command line options
if [ "$1" = "-f" ] && [ -n "$2" ]; then
    # Execute SQL file
    echo -e "${YELLOW}Executing SQL file: $2${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$2"
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}SQL execution completed successfully.${NC}"
    else
        echo -e "${RED}SQL execution failed with exit code: $exit_code${NC}"
    fi
    
    exit $exit_code
elif [ "$1" = "-c" ] && [ -n "$2" ]; then
    # Execute SQL command
    echo -e "${YELLOW}Executing SQL command: $2${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$2"
else
    # Interactive mode
    echo -e "${YELLOW}Starting interactive PostgreSQL session...${NC}"
    echo "Database: ${DB_NAME}"
    echo "Press Ctrl+D to exit"
    echo "----------------------------------"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
fi

# Unset password for security
unset PGPASSWORD
