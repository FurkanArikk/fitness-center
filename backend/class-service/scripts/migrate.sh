#!/bin/bash

# Script to handle database migrations for the class service

set -e

echo "Running database migrations for class service..."

# Check if migrate command is available
if ! command -v migrate &> /dev/null; then
    echo "Error: migrate command not found. Please install golang-migrate."
    echo "Installation instructions: https://github.com/golang-migrate/migrate/tree/master/cmd/migrate"
    exit 1
fi

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="/home/furkan/work/fitness-center/backend/class-service/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

# Set default values if not provided in environment
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${CLASS_SERVICE_DB_PORT:-5436}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db}
DB_SSL_MODE=${DB_SSLMODE:-disable}

# Set up migration database URL
DB_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSL_MODE}"

# Set migrations directory
MIGRATIONS_DIR="./migrations"

# Create the database if it doesn't exist
echo "Ensuring database exists..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "Creating database: $DB_NAME"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME"
fi

# Check if schema_migrations table exists but is inconsistent
if [[ "$1" == "force" || "$1" == "reset" ]]; then
    echo "Forcing migration reset..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS schema_migrations;" 2>/dev/null
    echo "Migration history reset. Will apply all migrations from scratch."
    
    # Drop all existing tables to ensure clean slate
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./migrations/000_drop_tables.sql 2>/dev/null
    
    # Set command to "up" after force reset
    COMMAND="up"
else
    # Execute the migration command with the provided arguments
    # Usage: ./scripts/migrate.sh [up|down|version|goto N]
    COMMAND=${1:-up}
fi

echo "Executing: migrate -path ${MIGRATIONS_DIR} -database \"${DB_URL}\" ${COMMAND} ${2}"
migrate -path ${MIGRATIONS_DIR} -database "${DB_URL}" ${COMMAND} ${2}
RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo "Migration failed with error code $RESULT"
    
    if [ $RESULT -eq 1 ]; then
        echo "This usually means there's no change needed."
    elif [ $RESULT -eq 2 ]; then
        echo "Migration error encountered. Try './scripts/migrate.sh force' to reset migration history."
    fi
    
    exit $RESULT
fi

echo "Migration completed successfully."
