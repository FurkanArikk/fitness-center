#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default settings
SAMPLE_DATA_OPTION="keep"
USE_DOCKER="true"
SHOW_HELP=false

# Process command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -s|--sample-data) 
            if [ "$2" == "reset" ] || [ "$2" == "none" ] || [ "$2" == "keep" ]; then
                SAMPLE_DATA_OPTION="$2"
                shift 2
            else
                echo -e "${RED}Error: Invalid sample data option. Use reset, none, or keep.${NC}"
                exit 1
            fi
            ;;
        -l|--local) USE_DOCKER="false"; shift ;;
        -h|--help) SHOW_HELP=true; shift ;;
        *) echo -e "${RED}Unknown parameter: $1${NC}"; exit 1 ;;
    esac
done

# Function to display help
show_help() {
    echo -e "${CYAN}Usage:${NC} ./run.sh [options]"
    echo
    echo -e "${CYAN}Options:${NC}"
    echo -e "  ${YELLOW}-s, --sample-data OPTION${NC}  Specify sample data option: reset (load fresh data), none (no sample data), keep (keep existing, default)"
    echo -e "  ${YELLOW}-l, --local${NC}               Run service locally instead of in Docker"
    echo -e "  ${YELLOW}-h, --help${NC}                Show this help message"
    echo
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  ${YELLOW}./run.sh${NC}                  Run with default settings (keep data, use Docker)"
    echo -e "  ${YELLOW}./run.sh -s reset${NC}         Reset and load sample data"
    echo -e "  ${YELLOW}./run.sh -s none${NC}          Start with clean database without sample data"
    echo -e "  ${YELLOW}./run.sh -l${NC}               Run service locally (database still in Docker)"
    echo
}

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
    show_help
    exit 0
fi

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

# Load environment variables from the service-specific .env file
load_env_vars() {
    print_header "Loading Environment Variables"
    
    SERVICE_ENV_PATH="$(pwd)/.env"
    
    if [ -f "$SERVICE_ENV_PATH" ]; then
        source "$SERVICE_ENV_PATH"
        print_success "Loaded environment from: $SERVICE_ENV_PATH"
    else
        print_warning "No service-specific .env file found at $SERVICE_ENV_PATH"
        print_info "Using default environment variables"
    fi
}

# Function to check if Docker and Docker Compose are available
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
    
    # Check for Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is available"
    elif docker compose version &> /dev/null; then
        print_success "Docker Compose plugin is available"
    else
        print_error "Docker Compose is not installed. Please install it to continue."
        exit 1
    fi
}

# Function to ensure Docker network exists
ensure_docker_network() {
    print_header "Checking Docker Network"
    
    if docker network inspect ${DOCKER_NETWORK_NAME:-fitness-network} &> /dev/null; then
        print_success "Docker network '${DOCKER_NETWORK_NAME:-fitness-network}' already exists"
    else
        print_info "Creating Docker network '${DOCKER_NETWORK_NAME:-fitness-network}'..."
        if docker network create ${DOCKER_NETWORK_NAME:-fitness-network} &> /dev/null; then
            print_success "Docker network created successfully"
        else
            print_error "Failed to create Docker network"
            exit 1
        fi
    fi
}

# Function to handle database reset and sample data
handle_database_setup() {
    print_header "Database Setup"
    
    # Handle based on sample data option
    case "$SAMPLE_DATA_OPTION" in
        "reset")
            print_info "Resetting database and loading sample data"
            reset_database_with_sample_data
            ;;
        "none")
            print_info "Setting up clean database without sample data"
            reset_database_without_sample_data
            ;;
        "keep")
            print_info "Keeping existing database data"
            # Just ensure the database is running
            ensure_database_running
            ;;
    esac
}

# Function to ensure database is running
ensure_database_running() {
    if [ "$USE_DOCKER" = "true" ]; then
        # Check if postgres container is running
        if ! docker ps | grep -q "${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db}"; then
            print_info "Starting database container..."
            if ! docker-compose up -d postgres; then
                print_error "Failed to start database container"
                exit 1
            fi
            
            # Wait for database to be ready
            print_info "Waiting for database to be ready..."
            wait_for_database
        else
            print_success "Database container is already running"
        fi
    else
        # For local mode, still need Docker database
        if ! docker ps | grep -q "${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db}"; then
            print_info "Starting database container for local development..."
            if ! docker-compose up -d postgres; then
                print_error "Failed to start database container"
                exit 1
            fi
            
            # Wait for database to be ready
            print_info "Waiting for database to be ready..."
            wait_for_database
        else
            print_success "Database container is already running"
        fi
        
        # Remind about different port for local development
        print_info "Note: When running locally, connect to database using port ${FACILITY_SERVICE_DB_PORT:-5435}"
    fi
}

# Function to wait for database to be ready
wait_for_database() {
    attempts=0
    max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        # Check if database accepts connections
        if docker exec ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} pg_isready -U ${DB_USER:-fitness_user} -d ${FACILITY_SERVICE_DB_NAME:-fitness_facility_db} &> /dev/null; then
            print_success "Database is accepting connections"
            # Give it a little more time to fully initialize
            sleep 2
            return 0
        fi
        
        attempts=$((attempts + 1))
        if [ $attempts -eq $max_attempts ]; then
            print_error "Database did not become ready in time"
            print_info "Try running: docker-compose logs postgres"
            exit 1
        fi
        
        echo -n "."
        sleep 3
    done
    echo ""
    return 1
}

# Function to reset database and load sample data
reset_database_with_sample_data() {
    print_info "Resetting database and loading sample data..."
    
    # Stop containers if running
    docker-compose down postgres &> /dev/null || true
    
    # Remove volume to ensure clean slate
    docker volume rm ${PWD##*/}_postgres_data &> /dev/null || true
    
    # Start postgres container
    print_info "Starting fresh database container..."
    if ! docker-compose up -d postgres; then
        print_error "Failed to start database container"
        exit 1
    fi
    
    # Wait for database to be ready
    print_info "Waiting for database to initialize..."
    wait_for_database
    
    # Apply migrations
    print_info "Applying database schema..."
    if ! docker exec ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} bash -c "cd /docker-entrypoint-initdb.d && for f in *.up.sql; do [ -f \"\$f\" ] && psql -U ${DB_USER:-fitness_user} -d ${FACILITY_SERVICE_DB_NAME:-fitness_facility_db} -f \"\$f\" || true; done" &> /dev/null; then
        print_warning "Could not apply migrations automatically. Trying direct method..."
        
        # Apply migrations via direct connection
        for migration in ./migrations/*.up.sql; do
            if [[ "$migration" != *"sample_data.sql"* && "$migration" != *"reset_schema_migrations.sql"* ]]; then
                print_info "Applying migration: $(basename "$migration")"
                if ! docker exec -i ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} psql -U ${DB_USER:-fitness_user} -d ${FACILITY_SERVICE_DB_NAME:-fitness_facility_db} < "$migration"; then
                    print_error "Failed to apply migration: $(basename "$migration")"
                    exit 1
                fi
            fi
        done
    fi
    
    # Apply sample data
    print_info "Loading sample data..."
    if ! docker exec -i ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} psql -U ${DB_USER:-fitness_user} -d ${FACILITY_SERVICE_DB_NAME:-fitness_facility_db} < ./migrations/000004_sample_data.up.sql; then
        print_error "Failed to load sample data"
        exit 1
    fi
    
    print_success "Database reset and sample data loaded successfully"
}

# Function to reset database without sample data
reset_database_without_sample_data() {
    print_info "Resetting database without sample data..."
    
    # Stop containers if running
    docker-compose down postgres &> /dev/null || true
    
    # Remove volume to ensure clean slate
    docker volume rm ${PWD##*/}_postgres_data &> /dev/null || true
    
    # Start postgres container
    print_info "Starting fresh database container..."
    if ! docker-compose up -d postgres; then
        print_error "Failed to start database container"
        exit 1
    fi
    
    # Wait for database to be ready
    print_info "Waiting for database to initialize..."
    wait_for_database
    
    # Apply migrations
    print_info "Applying database schema..."
    if ! docker exec ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} bash -c "cd /docker-entrypoint-initdb.d && for f in *.up.sql; do [ -f \"\$f\" ] && psql -U ${DB_USER:-fitness_user} -d ${FACILITY_SERVICE_DB_NAME:-fitness_facility_db} -f \"\$f\" || true; done" &> /dev/null; then
        print_warning "Could not apply migrations automatically. Trying direct method..."
        
        # Apply migrations via direct connection
        for migration in ./migrations/*.up.sql; do
            if [[ "$migration" != *"sample_data.sql"* && "$migration" != *"reset_schema_migrations.sql"* ]]; then
                print_info "Applying migration: $(basename "$migration")"
                if ! docker exec -i ${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db} psql -U ${DB_USER:-fitness_user} -d ${FACILITY_SERVICE_DB_NAME:-fitness_facility_db} < "$migration"; then
                    print_error "Failed to apply migration: $(basename "$migration")"
                    exit 1
                fi
            fi
        done
    fi
    
    print_success "Database reset successfully without sample data"
}

# Function to start the service
start_service() {
    print_header "Starting Facility Service"
    
    if [ "$USE_DOCKER" = "true" ]; then
        # Update dependencies before building Docker image
        print_info "Updating Go dependencies..."
        if ! ./scripts/update-deps.sh; then
            print_error "Failed to update dependencies"
            exit 1
        fi
        
        # Create Docker-specific environment file if it doesn't exist
        if [ ! -f ".env.docker" ]; then
            print_info "Creating Docker-specific environment file (.env.docker)..."
            cat > ".env.docker" << EOF
# Facility Service Configuration
FACILITY_SERVICE_DB_NAME=${FACILITY_SERVICE_DB_NAME:-fitness_facility_db}
FACILITY_SERVICE_DB_PORT=5432
FACILITY_SERVICE_PORT=${FACILITY_SERVICE_PORT:-8004}
FACILITY_SERVICE_HOST=${FACILITY_SERVICE_HOST:-0.0.0.0}
FACILITY_SERVICE_CONTAINER_NAME=${FACILITY_SERVICE_CONTAINER_NAME:-fitness-facility-db}
FACILITY_SERVICE_READ_TIMEOUT=15s
FACILITY_SERVICE_WRITE_TIMEOUT=15s
FACILITY_SERVICE_IDLE_TIMEOUT=60s

# Common Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_SSLMODE=${DB_SSLMODE:-disable}

# Docker Configuration
DOCKER_NETWORK_NAME=${DOCKER_NETWORK_NAME:-fitness-network}

# Authentication Configuration
JWT_SECRET=${JWT_SECRET:-your_jwt_secret_key}
JWT_EXPIRATION=24h

# Logging Configuration
LOG_LEVEL=${LOG_LEVEL:-debug}
EOF
            print_success "Created .env.docker file"
        fi

        # Start the service using docker-compose
        print_info "Starting facility service in Docker container..."
        print_info "Note: Inside Docker, the service will connect to postgres using internal port 5432"
        if docker-compose up -d facility-service; then
            print_success "Facility service container started successfully"
            print_info "The service is running at http://${FACILITY_SERVICE_HOST:-0.0.0.0}:${FACILITY_SERVICE_PORT:-8004}"
            print_info "To view logs, run: docker-compose logs -f facility-service"
            
            # Show container status
            print_header "Container Status"
            docker-compose ps
        else
            print_error "Failed to start facility service container"
            exit 1
        fi
    else
        # Update dependencies before building locally
        print_info "Updating Go dependencies..."
        if ! ./scripts/update-deps.sh; then
            print_error "Failed to update dependencies"
            exit 1
        fi
        
        # Build and run locally
        print_info "Building Go application for local execution..."
        if go build -o facility-service cmd/main.go; then
            print_success "Build successful!"
            print_info "Starting facility service locally..."
            print_info "The service is starting on http://${FACILITY_SERVICE_HOST:-0.0.0.0}:${FACILITY_SERVICE_PORT:-8004}"
            print_info "Press Ctrl+C to stop the service"
            
            # Start the service
            ./facility-service
        else
            print_error "Build failed. Please fix the errors before running the service."
            exit 1
        fi
    fi
}

# Function to display usage instructions
display_usage_instructions() {
    print_header "Usage Instructions"
    
    if [ "$USE_DOCKER" = "true" ]; then
        echo -e "${YELLOW}Your service is running in Docker. Here are some helpful commands:${NC}"
        echo -e ""
        echo -e "${CYAN}View service logs:${NC}"
        echo -e "   ${YELLOW}docker-compose logs -f facility-service${NC}"
        echo -e ""
        echo -e "${CYAN}Stop the service:${NC}"
        echo -e "   ${YELLOW}docker-compose down${NC}"
        echo -e ""
        echo -e "${CYAN}Restart the service:${NC}"
        echo -e "   ${YELLOW}docker-compose restart facility-service${NC}"
        echo -e ""
        echo -e "${CYAN}Access the API at:${NC}"
        echo -e "   ${YELLOW}http://localhost:${FACILITY_SERVICE_PORT:-8004}/health${NC}"
        echo -e "   ${YELLOW}http://localhost:${FACILITY_SERVICE_PORT:-8004}/api/v1/facilities${NC}"
        echo -e ""
    else
        echo -e "${YELLOW}The service is running locally. The database is running in Docker.${NC}"
        echo -e ""
        echo -e "${CYAN}To stop the service:${NC}"
        echo -e "   ${YELLOW}Press Ctrl+C${NC}"
        echo -e ""
        echo -e "${CYAN}To stop the database:${NC}"
        echo -e "   ${YELLOW}docker-compose stop postgres${NC}"
        echo -e ""
    fi
}

# Main execution starts here
clear
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}      FITNESS CENTER FACILITY SERVICE     ${NC}"
echo -e "${MAGENTA}==========================================${NC}"

# Show current settings
print_header "Settings"
echo -e "Sample data option: ${YELLOW}${SAMPLE_DATA_OPTION}${NC}"
echo -e "Run mode: ${YELLOW}$([ "$USE_DOCKER" = "true" ] && echo "Docker" || echo "Local")${NC}"

# Load environment variables
load_env_vars

# Check docker is available
check_docker

# Ensure Docker network exists
ensure_docker_network

# Set up the database
handle_database_setup

# Start the service
start_service

# Show usage instructions
display_usage_instructions

# Exit if running in Docker (since it runs in background)
if [ "$USE_DOCKER" = "true" ]; then
    exit 0
fi
