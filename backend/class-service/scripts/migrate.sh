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

# Load environment variables from the root .env file
ROOT_ENV_PATH=""
CURRENT_DIR=$(pwd)

# Find the root .env file by going up directories
while [ "$CURRENT_DIR" != "/" ]; do
    if [ -f "$CURRENT_DIR/.env" ]; then
        ROOT_ENV_PATH="$CURRENT_DIR/.env"
        break
    fi
    CURRENT_DIR=$(dirname "$CURRENT_DIR")
done

if [ -f "$ROOT_ENV_PATH" ]; then
    source "$ROOT_ENV_PATH"
    echo "Loaded environment from: $ROOT_ENV_PATH"
else
    echo "Warning: No .env file found in parent directories"
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

# Execute the migration command with the provided arguments
# Usage: ./scripts/migrate.sh [up|down|version|goto N]
COMMAND=${1:-up}

echo "Executing: migrate -path ${MIGRATIONS_DIR} -database \"${DB_URL}\" ${COMMAND} ${2}"
migrate -path ${MIGRATIONS_DIR} -database "${DB_URL}" ${COMMAND} ${2}

echo "Migration completed successfully."
