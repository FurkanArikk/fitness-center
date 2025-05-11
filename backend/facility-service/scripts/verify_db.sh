#!/bin/bash

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="$(pwd)/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

# Get DB_HOST from environment or use default
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${FACILITY_SERVICE_DB_PORT:-5435}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${FACILITY_SERVICE_DB_NAME:-fitness_facility_db}

# Export PGPASSWORD to avoid password prompt
export PGPASSWORD=$DB_PASSWORD

# First, check if we can connect to PostgreSQL at all - this is the basic check
if ! docker exec ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} psql -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
    echo "ERROR: Cannot connect to PostgreSQL database at $DB_HOST:$DB_PORT"
    unset PGPASSWORD
    exit 1
fi

# If no arguments, only check for basic connectivity
if [ "$1" == "--connect-only" ]; then
    echo "Database connection successful! PostgreSQL is accepting connections."
    unset PGPASSWORD
    exit 0
fi

# Verify database structure for fitness_facility_db
echo "Verifying database structure for ${FACILITY_SERVICE_DB_NAME:-fitness_facility_db}..."

# Connect to the database and list tables
echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."

# Check if critical tables exist
echo "Checking if required tables exist..."
required_tables=("equipment" "facilities" "attendance")
missing_tables=0

for table in "${required_tables[@]}"; do
    if ! docker exec ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} psql -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = '$table')" | grep -q "t"; then
        echo "WARNING: Required table '$table' is missing"
        missing_tables=$((missing_tables + 1))
    else
        echo "✓ Table '$table' exists"
    fi
done

if [ $missing_tables -gt 0 ]; then
    echo "WARNING: $missing_tables required tables are missing. This might be normal for a fresh database."
else
    echo "✓ All required tables exist"
fi

# Show all tables in the database
echo -e "\nAll tables in database:"
docker exec ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} psql -U $DB_USER -d $DB_NAME -c "\dt"

# Show table counts if tables exist
if [ $missing_tables -lt 3 ]; then
    echo -e "\nCounting records in tables:"
    docker exec ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} psql -U $DB_USER -d $DB_NAME -c "
    SELECT 'equipment' as table_name, COUNT(*) FROM equipment UNION ALL
    SELECT 'facilities', COUNT(*) FROM facilities UNION ALL
    SELECT 'attendance', COUNT(*) FROM attendance
    ORDER BY table_name;
    " 2>/dev/null || echo "Some tables don't exist yet, skipping count"
fi

# Unset PGPASSWORD for security
unset PGPASSWORD

# For schema verification mode, return error if tables are missing
if [ "$1" == "--require-schema" ] && [ $missing_tables -gt 0 ]; then
    exit 1
fi

# Otherwise, connection success is enough
exit 0
