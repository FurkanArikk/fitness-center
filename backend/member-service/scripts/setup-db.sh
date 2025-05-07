#!/bin/bash

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="/home/furkan/work/fitness-center/backend/member-service/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

echo "Setting up ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} database..."

# Parameters for psql - loaded from environment with defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${MEMBER_SERVICE_DB_PORT:-5432}"
DB_USER="${DB_USER:-fitness_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"
DB_NAME="${MEMBER_SERVICE_DB_NAME:-fitness_member_db}"
LOAD_SAMPLE_DATA="${LOAD_SAMPLE_DATA:-true}"

# Set PGPASSWORD environment variable to avoid password prompt
export PGPASSWORD="${DB_PASSWORD}"

# Check if we're using Docker
if [ "$USE_DOCKER" = "true" ]; then
    echo "Using Docker setup. Make sure the PostgreSQL container is running."
    echo "To start it: ./scripts/docker-db.sh start"
    
    # When using Docker, the database is already created by docker-compose
    echo "Database should already exist in Docker container."
else
    # Check if database exists, create if it doesn't
    echo "Checking if database exists..."
    # Connect to postgres database to check if our DB exists
    db_exists=$(psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
    if [ -z "$db_exists" ]; then
        echo "Database does not exist. Creating database..."
        # Need to connect to postgres database to create a new database
        psql -h ${DB_HOST} -p ${DB_PORT} -U postgres -c "CREATE DATABASE ${DB_NAME}"
        echo "Database created."
    else
        echo "Database already exists."
    fi
fi

# Connect to the database and run schema migration
echo "Running database schema migration..."

# Apply each migration file in order
for migration_file in ./migrations/0*.up.sql ./migrations/0*.sql; do
    if [[ -f "$migration_file" && "$migration_file" != *"sample_data.sql"* ]]; then
        echo "Applying migration: $(basename "$migration_file")"
        psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "$migration_file"
        if [ $? -ne 0 ]; then
            echo "Error applying migration: $(basename "$migration_file")"
            exit 1
        fi
    fi
done

# Only load sample data if LOAD_SAMPLE_DATA is true
if [ "$LOAD_SAMPLE_DATA" = "true" ]; then
    echo "Running sample data migration..."
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
        echo "Loading sample data from $SAMPLE_DATA_FILE"
        psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "$SAMPLE_DATA_FILE"
    else
        echo "No sample data file found. Skipping sample data loading."
    fi
else
    echo "Skipping sample data migration as per configuration."
fi

echo "Database setup complete!"

# Unset PGPASSWORD for security
unset PGPASSWORD
