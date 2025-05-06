#!/bin/bash

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="/home/furkan/work/fitness-center/backend/staff-service/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

# Verify database structure for ${STAFF_SERVICE_DB_NAME:-fitness_staff_db}
echo "Verifying database structure for ${STAFF_SERVICE_DB_NAME:-fitness_staff_db}..."

# Get DB_HOST from environment or use default
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${STAFF_SERVICE_DB_PORT:-5433}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${STAFF_SERVICE_DB_NAME:-fitness_staff_db}

# Export PGPASSWORD to avoid password prompt
export PGPASSWORD=$DB_PASSWORD

# Connect to the database and list tables
echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

# Show table counts
echo -e "\nCounting records in tables:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 'staff' as table_name, COUNT(*) FROM staff UNION ALL
SELECT 'staff_qualifications', COUNT(*) FROM staff_qualifications UNION ALL
SELECT 'trainers', COUNT(*) FROM trainers UNION ALL
SELECT 'personal_training', COUNT(*) FROM personal_training
ORDER BY table_name;
"

# Unset PGPASSWORD for security
unset PGPASSWORD
