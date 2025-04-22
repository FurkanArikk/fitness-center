#!/bin/bash

# Connection script for fitness member database
# Usage: ./scripts/db-connect.sh [-f file.sql] [-c "SQL command"]

# Default connection parameters - can be overridden with environment variables
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-fitness_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"
DB_NAME="${DB_NAME:-fitness_member_db}"

# Check if password is provided as environment variable
if [ -z "$PGPASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

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
