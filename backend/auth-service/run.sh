#!/bin/bash

# Script to run the Auth Service
# Usage: ./run.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Environment file path
ENV_FILE=".env"
DOCKER_NETWORK_NAME="fitness-network"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to ensure Docker network exists
ensure_docker_network() {
    if ! docker network ls | grep -q "$DOCKER_NETWORK_NAME"; then
        print_info "Creating Docker network: $DOCKER_NETWORK_NAME"
        docker network create "$DOCKER_NETWORK_NAME"
        print_success "Docker network created"
    else
        print_success "Docker network $DOCKER_NETWORK_NAME already exists"
    fi
}

# Function to load environment variables
load_env_vars() {
    if [ -f "$ENV_FILE" ]; then
        print_info "Loading environment variables from $ENV_FILE"
        source "$ENV_FILE"
        print_success "Environment variables loaded"
    else
        print_warning "No .env file found, using default values"
    fi
}

# Function to wait for database to be ready
wait_for_database() {
    print_info "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T auth-db pg_isready -U ${AUTH_SERVICE_DB_USER:-postgres} -d ${AUTH_SERVICE_DB_NAME:-fitness_auth} >/dev/null 2>&1; then
            print_success "Database is ready"
            return 0
        fi
        
        print_info "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Database failed to become ready after $max_attempts attempts"
    return 1
}

# Function to run database migrations
run_migrations() {
    print_info "Running database migrations..."
    if [ -f "scripts/db.sh" ]; then
        ./scripts/db.sh migrate
        print_success "Database migrations completed"
    else
        print_warning "No migration script found, skipping migrations"
    fi
}

# Function to start the service
start_service() {
    print_header "Starting Auth Service"
    
    print_info "Building and starting auth service containers..."
    if docker-compose up -d --build; then
        print_success "Auth service containers started successfully"
        
        # Wait for database to be ready
        if wait_for_database; then
            # Run migrations
            run_migrations
            
            # Wait a bit for the service to start
            print_info "Waiting for auth service to be ready..."
            sleep 5
            
            # Check service health
            if curl -f -s http://localhost:${AUTH_SERVICE_PORT:-8006}/health >/dev/null 2>&1; then
                print_success "Auth service is running and healthy"
            else
                print_warning "Auth service may still be starting up"
            fi
        else
            print_error "Failed to start database"
            return 1
        fi
        
        print_info "The service is running at http://${AUTH_SERVICE_HOST:-0.0.0.0}:${AUTH_SERVICE_PORT:-8006}"
        print_info "To view logs, run: docker-compose logs -f auth-service"
        
        # Show container status
        print_header "Container Status"
        docker-compose ps
    else
        print_error "Failed to start auth service containers"
        exit 1
    fi
}

# Function to display usage instructions
display_usage_instructions() {
    print_header "Auth Service Endpoints"
    echo -e "Health Check:"
    echo -e "   ${YELLOW}GET http://localhost:${AUTH_SERVICE_PORT:-8006}/health${NC}"
    echo -e ""
    echo -e "Login:"
    echo -e "   ${YELLOW}POST http://localhost:${AUTH_SERVICE_PORT:-8006}/api/v1/auth/login${NC}"
    echo -e "   Body: {\"username\": \"admin\", \"password\": \"fitness123\"}"
    echo -e ""
    echo -e "Validate Token:"
    echo -e "   ${YELLOW}POST http://localhost:${AUTH_SERVICE_PORT:-8006}/api/v1/auth/validate${NC}"
    echo -e "   Body: {\"token\": \"your_jwt_token\"}"
    echo -e ""
    echo -e "Get User Info:"
    echo -e "   ${YELLOW}GET http://localhost:${AUTH_SERVICE_PORT:-8006}/api/v1/auth/user${NC}"
    echo -e "   Header: Authorization: Bearer your_jwt_token"
    echo -e ""
}

# Main execution starts here
clear
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}      FITNESS CENTER AUTH SERVICE        ${NC}"
echo -e "${MAGENTA}==========================================${NC}"

# Load environment variables
load_env_vars

# Check docker is available
check_docker

# Ensure Docker network exists
ensure_docker_network

# Start the service
start_service

# Show usage instructions
display_usage_instructions

exit 0
