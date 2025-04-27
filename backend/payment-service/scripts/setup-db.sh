#!/bin/bash

echo "Setting up fitness_payment_db database..."

# Parameters for psql - can be overridden with environment variables
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${PAYMENT_SERVICE_DB_PORT:-5434}"
DB_USER="${DB_USER:-fitness_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"
DB_NAME="${PAYMENT_SERVICE_DB_NAME:-fitness_payment_db}"
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
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/000001_create_payments_table.up.sql
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/000002_create_payment_types_table.up.sql
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/000003_create_payment_transactions_table.up.sql

# Only load sample data if LOAD_SAMPLE_DATA is true
if [ "$LOAD_SAMPLE_DATA" = "true" ]; then
    echo "Running sample data migration..."
    psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ./migrations/000004_sample_data.up.sql
else
    echo "Skipping sample data migration as per configuration."
fi

echo "Database setup complete!"

# Unset PGPASSWORD for security
unset PGPASSWORD
