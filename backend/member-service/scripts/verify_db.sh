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
DB_PORT=${MEMBER_SERVICE_DB_PORT:-5432}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${MEMBER_SERVICE_DB_NAME:-fitness_member_db}

# Export PGPASSWORD to avoid password prompt
export PGPASSWORD=$DB_PASSWORD

# First, check if we can connect to PostgreSQL at all - this is the basic check
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
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

# Now verify database structure if requested
echo "Verifying database structure for ${MEMBER_SERVICE_DB_NAME:-fitness_member_db}..."

# Connect to the database and list tables
echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."

# Check if critical tables exist
echo "Checking if required tables exist..."
required_tables=("members" "memberships" "membership_benefits")
missing_tables=0

for table in "${required_tables[@]}"; do
    if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = '$table')" | grep -q "t"; then
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
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

# Show table counts if tables exist
if [ $missing_tables -lt 3 ]; then
    echo -e "\nCounting records in tables:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
    SELECT 'members' as table_name, COUNT(*) FROM members UNION ALL
    SELECT 'memberships', COUNT(*) FROM memberships UNION ALL
    SELECT 'membership_benefits', COUNT(*) FROM membership_benefits
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
