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
echo ""
echo "=== Direct Access URLs ==="
echo "Auth Service URL: http://localhost:8085"
echo "Health Check: http://localhost:8085/health"
echo "Login Endpoint: http://localhost:8085/api/v1/login"
echo "ForwardAuth Endpoint: http://localhost:8085/api/v1/auth"
echo ""
echo "=== Gateway Access URLs (Recommended) ==="
echo "Gateway URL: http://localhost:80"
echo "Health Check: http://localhost:80/api/v1/health"
echo "Login Endpoint: http://localhost:80/api/v1/login"
echo "ForwardAuth Endpoint: http://localhost:80/api/v1/auth"
echo ""
echo "=== Admin Management Endpoints ==="
echo "Create Admin: POST http://localhost:80/api/v1/admin/create"
echo "List Admins: GET http://localhost:80/api/v1/admin/list"
echo "Update Password: PUT http://localhost:80/api/v1/admin/password"
echo "Deactivate Admin: DELETE http://localhost:80/api/v1/admin/{username}"
echo ""
echo "=== Default Admin Credentials ==="
echo "Username: admin"
echo "Password: admin"
echo ""
echo "=== Test Commands ==="
echo "# Login test:"
echo "curl -X POST http://localhost:80/api/v1/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"username\":\"admin\",\"password\":\"admin\"}'"
echo ""
echo "# Create new admin test:"
echo "curl -X POST http://localhost:80/api/v1/admin/create \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"username\":\"newadmin\",\"password\":\"password123\",\"email\":\"newadmin@example.com\"}'"
