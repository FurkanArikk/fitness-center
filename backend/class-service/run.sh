#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored section headers
print_header() {
    echo -e "\n${BLUE}===${NC} ${CYAN}$1${NC} ${BLUE}===${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print errors
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Function to print warnings
print_warning() {
    echo -e "${MAGENTA}⚠ $1${NC}"
}

# Function to check if Docker is available
check_docker() {
    print_header "Checking Docker"
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    print_success "Docker is available"
}

# Function to start the database
start_database() {
    print_header "Starting PostgreSQL Database (Docker)"
    
    if docker ps | grep -q ${CLASS_SERVICE_CONTAINER_NAME:-fitness_class_db}; then
        print_info "Database container is already running"
    else
        print_info "Starting database container..."
        if ./scripts/docker-db.sh start; then
            print_success "Database container started successfully"
        else
            print_error "Failed to start database container"
            print_info "Check logs with: ./scripts/docker-db.sh logs"
            exit 1
        fi
    fi
    
    # Wait for the database to be ready
    print_info "Waiting for database to be ready..."
    attempts=0
    max_attempts=10
    
    while [ $attempts -lt $max_attempts ]; do
        if DB_HOST=${DB_HOST:-localhost} DB_PORT=${CLASS_SERVICE_DB_PORT:-5436} DB_USER=${DB_USER:-fitness_user} DB_PASSWORD=${DB_PASSWORD:-admin} DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db} ./scripts/verify_db.sh &> /dev/null; then
            print_success "Database is ready"
            break
        fi
        
        attempts=$((attempts + 1))
        if [ $attempts -eq $max_attempts ]; then
            print_error "Database did not become ready in time"
            print_info "Try running: ./scripts/docker-db.sh debug"
            exit 1
        fi
        
        echo -n "."
        sleep 2
    done
    echo ""
}

# Function to check and initialize database schema
initialize_database() {
    print_header "Checking Database Schema"

    # Check if tables exist
    if DB_HOST=${DB_HOST:-localhost} DB_PORT=${CLASS_SERVICE_DB_PORT:-5436} DB_USER=${DB_USER:-fitness_user} DB_PASSWORD=${DB_PASSWORD:-admin} DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db} ./scripts/verify_db.sh &> /dev/null; then
        print_success "Database schema already exists"
    else
        print_info "Database schema does not exist, initializing..."
        if USE_DOCKER=true ./scripts/migrate.sh up; then
            print_success "Database schema initialized"
        else
            print_error "Failed to initialize database schema"
            exit 1
        fi
    fi
}

# Function to ask about loading sample data
ask_load_sample_data() {
    print_header "Sample Data"
    
    echo -e "${YELLOW}Would you like to load sample data?${NC}"
    echo -e "${CYAN}1)${NC} Yes - Reset the database and load fresh sample data"
    echo -e "${CYAN}2)${NC} No - Keep existing data (default)"
    
    read -p "Enter your choice [2]: " choice
    choice=${choice:-2}
    
    if [ "$choice" = "1" ]; then
        print_info "Loading sample data..."
        if DB_HOST=${DB_HOST:-localhost} DB_PORT=${CLASS_SERVICE_DB_PORT:-5436} DB_USER=${DB_USER:-fitness_user} DB_PASSWORD=${DB_PASSWORD:-admin} DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db} ./scripts/db-connect.sh -f ./migrations/000004_sample_data.sql; then
            print_success "Sample data loaded successfully"
        else
            print_error "Failed to load sample data"
        fi
    else
        print_info "Skipping sample data loading"
    fi
}

# Function to build and start the service
build_and_start_service() {
    print_header "Building Class Service"
    
    print_info "Building Go application..."
    if go build -o class-service cmd/main.go; then
        print_success "Build successful!"
    else
        print_error "Build failed. Please fix the errors before running the service."
        exit 1
    fi
    
    print_header "Starting Class Service"
    print_info "The service is starting on http://${CLASS_SERVICE_HOST:-localhost}:${CLASS_SERVICE_PORT:-8005}"
    print_info "Press Ctrl+C to stop the service"
    
    # Start the service
    ./class-service
}

# Function to display manual sample data loading instructions
display_sample_data_instructions() {
    print_header "How to Load Sample Data Manually"
    
    echo -e "${MAGENTA}If you want to load sample data later, follow these steps:${NC}"
    echo -e ""
    echo -e "${CYAN}1. Make sure the database is running:${NC}"
    echo -e "   ${YELLOW}./scripts/docker-db.sh status${NC}"
    echo -e ""
    echo -e "${CYAN}2. Connect to the database and execute the sample data SQL file:${NC}"
    echo -e "   ${YELLOW}./scripts/db-connect.sh -f ./migrations/000004_sample_data.sql${NC}"
    echo -e ""
    echo -e "${CYAN}3. Or reset the database completely and start fresh:${NC}"
    echo -e "   ${YELLOW}./scripts/docker-db.sh reset${NC}"
    echo -e "   ${YELLOW}USE_DOCKER=true ./scripts/migrate.sh up${NC}"
    echo -e ""
    echo -e "${CYAN}4. Verify the data was loaded:${NC}"
    echo -e "   ${YELLOW}./scripts/verify_db.sh${NC}"
    echo -e ""
}

# Main execution starts here
clear
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}      FITNESS CENTER CLASS SERVICE       ${NC}"
echo -e "${MAGENTA}==========================================${NC}"

# Check docker is available
check_docker

# Start the database
start_database

# Check and initialize database schema if needed
initialize_database

# Ask about loading sample data
ask_load_sample_data

# Show instructions for manually loading sample data
display_sample_data_instructions

# Build and start the service
build_and_start_service
