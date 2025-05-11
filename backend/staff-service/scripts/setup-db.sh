#!/bin/bash

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="/home/furkan/work/fitness-center/backend/staff-service/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

echo "Setting up ${STAFF_SERVICE_DB_NAME:-fitness_staff_db} database..."

# Parameters for psql - loaded from environment with defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${STAFF_SERVICE_DB_PORT:-5433}"
DB_USER="${DB_USER:-fitness_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"
DB_NAME="${STAFF_SERVICE_DB_NAME:-fitness_staff_db}"

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

# Run migrations in order
echo "Running database schema migrations..."
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/000001_create_staff_table.up.sql
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/000002_create_qualifications_table.up.sql
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/000003_create_trainers_table.up.sql
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/000004_create_personal_training_table.up.sql

echo "Running sample data migration..."
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/002_sample_data.sql

echo "Database setup complete!"

# Unset PGPASSWORD for security
unset PGPASSWORD
