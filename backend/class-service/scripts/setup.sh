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
if [ ! -f ./.env ]; then
    echo "Creating default .env file..."
    cat > ./.env << EOF
# Class Service Configuration
CLASS_SERVICE_PORT=8003
CLASS_SERVICE_DB_PORT=5434
CLASS_SERVICE_DB_NAME=fitness_class_db
CLASS_SERVICE_CONTAINER_NAME=fitness-class-db

# Database Configuration
DB_HOST=localhost
DB_USER=fitness_user
DB_PASSWORD=admin
DB_SSLMODE=disable

# Docker Configuration
DOCKER_NETWORK_NAME=fitness-network
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

echo "Environment setup completed successfully."
