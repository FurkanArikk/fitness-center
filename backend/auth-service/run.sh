#!/bin/bash

echo "Starting Auth Service..."

# Docker network check
NETWORK_NAME=${DOCKER_NETWORK_NAME:-fitness-network}
if ! docker network ls | grep -q $NETWORK_NAME; then
    echo "Creating Docker network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
fi

# Build and run auth service
echo "Starting Auth service Docker container..."
docker-compose up --build -d

echo "Auth service started successfully!"
echo "Auth Service URL: http://localhost:8085"
echo "Health Check: http://localhost:8085/health"
echo "Login Endpoint: http://localhost:8085/api/v1/login"
echo "ForwardAuth Endpoint: http://localhost:8085/api/v1/auth"
echo ""
echo "Admin credentials:"
echo "Username: admin"
echo "Password: admin"
