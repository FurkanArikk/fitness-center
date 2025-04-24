#!/bin/bash

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

# Verify database structure for fitness_class_db
echo "Verifying database structure for ${CLASS_SERVICE_DB_NAME:-fitness_class_db}..."

# Get DB_HOST from environment or use default
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${CLASS_SERVICE_DB_PORT:-5436}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db}

# Export PGPASSWORD to avoid password prompt
export PGPASSWORD=$DB_PASSWORD

# Connect to the database and list tables
echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

# Show table counts
echo -e "\nCounting records in tables:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 'classes' as table_name, COUNT(*) FROM classes UNION ALL
SELECT 'class_schedule', COUNT(*) FROM class_schedule UNION ALL
SELECT 'class_bookings', COUNT(*) FROM class_bookings
ORDER BY table_name;
"

# Unset PGPASSWORD for security
unset PGPASSWORD
