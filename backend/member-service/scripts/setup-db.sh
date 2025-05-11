#!/bin/bash

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="$(pwd)/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} database...${NC}"

# Parameters for psql - loaded from environment with defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${MEMBER_SERVICE_DB_PORT:-5432}"
DB_USER="${DB_USER:-fitness_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"
DB_NAME="${MEMBER_SERVICE_DB_NAME:-fitness_member_db}"
CONTAINER_NAME="${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db}"
LOAD_SAMPLE_DATA="${LOAD_SAMPLE_DATA:-true}"

# Check if we're using Docker
if [ "$USE_DOCKER" = "true" ]; then
    echo -e "${YELLOW}Using Docker setup. Checking PostgreSQL container...${NC}"
    
    # Check if container exists and is running
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${YELLOW}PostgreSQL container not running. Starting it...${NC}"
        if ! docker-compose up -d postgres; then
            echo -e "${RED}Failed to start database container.${NC}"
            exit 1
        fi
        
        # Wait a bit for the container to fully start
        echo -e "${YELLOW}Waiting for PostgreSQL to start...${NC}"
        sleep 10
    fi
    
    echo -e "${GREEN}PostgreSQL container is running.${NC}"
    
    # Connect to the database and run schema migration
    echo -e "${BLUE}Running database schema migration inside Docker container...${NC}"
    
    # Apply each migration file in order
    for migration_file in ./migrations/0*.up.sql ./migrations/0*.sql; do
        if [[ -f "$migration_file" && "$migration_file" != *"sample_data.sql"* && "$migration_file" != *"drop_tables.sql"* ]]; then
            echo -e "${YELLOW}Applying migration: $(basename "$migration_file")${NC}"
            docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$migration_file"
            if [ $? -ne 0 ]; then
                echo -e "${RED}Error applying migration: $(basename "$migration_file")${NC}"
                exit 1
            fi
            echo -e "${GREEN}Successfully applied migration: $(basename "$migration_file")${NC}"
        fi
    done
    
    # Only load sample data if LOAD_SAMPLE_DATA is true
    if [ "$LOAD_SAMPLE_DATA" = "true" ]; then
        echo -e "${BLUE}Looking for sample data files...${NC}"
        SAMPLE_DATA_FILE=""
        
        # Check for different sample data file patterns
        if [ -f "./migrations/002_sample_data.sql" ]; then
            SAMPLE_DATA_FILE="./migrations/002_sample_data.sql"
        elif [ -f "./migrations/sample_data.sql" ]; then
            SAMPLE_DATA_FILE="./migrations/sample_data.sql"
        elif [ -f "./migrations/000004_sample_data.sql" ]; then
            SAMPLE_DATA_FILE="./migrations/000004_sample_data.sql"
        elif [ -f "./migrations/000004_sample_data.up.sql" ]; then
            SAMPLE_DATA_FILE="./migrations/000004_sample_data.up.sql"
        fi
        
        if [ -n "$SAMPLE_DATA_FILE" ]; then
            echo -e "${YELLOW}Loading sample data from $SAMPLE_DATA_FILE${NC}"
            docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$SAMPLE_DATA_FILE"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Sample data loaded successfully.${NC}"
            else
                echo -e "${RED}Error loading sample data.${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}No sample data file found. Skipping sample data loading.${NC}"
        fi
    else
        echo -e "${YELLOW}Skipping sample data migration as per configuration.${NC}"
    fi
else
    # Set PGPASSWORD environment variable to avoid password prompt for local mode
    export PGPASSWORD="${DB_PASSWORD}"
    
    # Check if database exists, create if it doesn't
    echo -e "${YELLOW}Checking if database exists locally...${NC}"
    # Connect to postgres database to check if our DB exists
    db_exists=$(psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error connecting to local PostgreSQL. Is it installed and running?${NC}"
        exit 1
    fi
    
    if [ -z "$db_exists" ]; then
        echo -e "${YELLOW}Database does not exist. Creating database...${NC}"
        # Need to connect to postgres database to create a new database
        psql -h ${DB_HOST} -p ${DB_PORT} -U postgres -c "CREATE DATABASE ${DB_NAME}"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Database created successfully.${NC}"
        else
            echo -e "${RED}Failed to create database.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}Database already exists.${NC}"
    fi
    
    # Connect to the database and run schema migration
    echo -e "${BLUE}Running database schema migration locally...${NC}"
    
    # Apply each migration file in order
    for migration_file in ./migrations/0*.up.sql ./migrations/0*.sql; do
        if [[ -f "$migration_file" && "$migration_file" != *"sample_data.sql"* && "$migration_file" != *"drop_tables.sql"* ]]; then
            echo -e "${YELLOW}Applying migration: $(basename "$migration_file")${NC}"
            psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "$migration_file"
            if [ $? -ne 0 ]; then
                echo -e "${RED}Error applying migration: $(basename "$migration_file")${NC}"
                exit 1
            fi
            echo -e "${GREEN}Successfully applied migration: $(basename "$migration_file")${NC}"
        fi
    done
    
    # Only load sample data if LOAD_SAMPLE_DATA is true
    if [ "$LOAD_SAMPLE_DATA" = "true" ]; then
        echo -e "${BLUE}Looking for sample data files...${NC}"
        SAMPLE_DATA_FILE=""
        
        # Check for different sample data file patterns
        if [ -f "./migrations/002_sample_data.sql" ]; then
            SAMPLE_DATA_FILE="./migrations/002_sample_data.sql"
        elif [ -f "./migrations/sample_data.sql" ]; then
            SAMPLE_DATA_FILE="./migrations/sample_data.sql"
        elif [ -f "./migrations/000004_sample_data.sql" ]; then
            SAMPLE_DATA_FILE="./migrations/000004_sample_data.sql"
        elif [ -f "./migrations/000004_sample_data.up.sql" ]; then
            SAMPLE_DATA_FILE="./migrations/000004_sample_data.up.sql"
        fi
        
        if [ -n "$SAMPLE_DATA_FILE" ]; then
            echo -e "${YELLOW}Loading sample data from $SAMPLE_DATA_FILE${NC}"
            psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "$SAMPLE_DATA_FILE"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Sample data loaded successfully.${NC}"
            else
                echo -e "${RED}Error loading sample data.${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}No sample data file found. Skipping sample data loading.${NC}"
        fi
    else
        echo -e "${YELLOW}Skipping sample data migration as per configuration.${NC}"
    fi
    
    # Unset PGPASSWORD for security
    unset PGPASSWORD
fi

echo -e "${GREEN}Database setup complete!${NC}"
