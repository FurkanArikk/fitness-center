#!/bin/bash

# Script to setup the facility service environment

set -e

echo "Setting up facility service environment..."

# Create necessary directories
mkdir -p ../bin ../logs

# Install dependencies
echo "Installing dependencies..."
cd ..
go mod tidy

# Create .env file if it doesn't exist
SERVICE_ENV_PATH="$(pwd)/.env"
if [ ! -f "$SERVICE_ENV_PATH" ]; then
    echo "Creating default .env file at $SERVICE_ENV_PATH..."
    cat > "$SERVICE_ENV_PATH" << EOF
# Facility Service Configuration
FACILITY_SERVICE_PORT=8004
FACILITY_SERVICE_DB_PORT=5435
FACILITY_SERVICE_DB_NAME=fitness_facility_db
FACILITY_SERVICE_CONTAINER_NAME=fitness-facility-db
FACILITY_SERVICE_HOST=0.0.0.0
FACILITY_SERVICE_READ_TIMEOUT=15s
FACILITY_SERVICE_WRITE_TIMEOUT=15s
FACILITY_SERVICE_IDLE_TIMEOUT=60s

# Database Configuration
DB_HOST=localhost
DB_USER=fitness_user
DB_PASSWORD=admin
DB_SSLMODE=disable

# Docker Configuration
DOCKER_NETWORK_NAME=fitness-network

# Authentication Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# Logging Configuration
LOG_LEVEL=debug
EOF
fi

# Start the database
echo "Setting up the database..."
./scripts/docker-db.sh start

# Wait for the database to be ready
echo "Waiting for the database to be ready..."
sleep 5

# Run migrations
echo "Running migrations..."
./scripts/migrate.sh up

# Load sample data
echo "Loading sample data..."
./scripts/migrate.sh sample

echo "Environment setup completed successfully."