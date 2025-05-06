#!/bin/bash

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="/home/furkan/work/fitness-center/backend/class-service/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

# Connection script for fitness class database
# Usage: ./scripts/db-connect.sh [-f file.sql] [-c "SQL command"]

# Default connection parameters from environment variables with defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${CLASS_SERVICE_DB_PORT:-5436}"
DB_USER="${DB_USER:-fitness_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"
DB_NAME="${CLASS_SERVICE_DB_NAME:-fitness_class_db}"

# Check if password is provided as environment variable
if [ -z "$PGPASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

echo "Connecting to the class service database..."

# Process command line options
if [ "$1" = "-f" ] && [ -n "$2" ]; then
    # Execute SQL file
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$2"
elif [ "$1" = "-c" ] && [ -n "$2" ]; then
    # Execute SQL command
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$2"
else
    # Interactive mode
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
fi

# Unset password for security
unset PGPASSWORD
