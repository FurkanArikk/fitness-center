#!/bin/bash

# Script to setup the class service environment

set -e

echo "Setting up class service environment..."

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
# Class Service Configuration
CLASS_SERVICE_PORT=8005
CLASS_SERVICE_DB_PORT=5436
CLASS_SERVICE_DB_NAME=fitness_class_db
CLASS_SERVICE_CONTAINER_NAME=fitness-class-db
CLASS_SERVICE_HOST=0.0.0.0
CLASS_SERVICE_READ_TIMEOUT=15s
CLASS_SERVICE_WRITE_TIMEOUT=15s
CLASS_SERVICE_IDLE_TIMEOUT=60s

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
