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
USE_DOCKER="true" # Sadece Docker modu destekleniyor
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
    echo -e "  ${YELLOW}-h, --help${NC}                Show this help message"
    echo
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  ${YELLOW}./run.sh${NC}                  Run with default settings (keep data, use Docker)"
    echo -e "  ${YELLOW}./run.sh -s reset${NC}         Reset and load sample data"
    echo -e "  ${YELLOW}./run.sh -s none${NC}          Start with clean database without sample data"
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

# Function to verify if migrations have been properly applied
verify_migrations() {
    print_header "Verifying Database Migrations"
    
    # Check if the members table exists - do a complete check
    print_info "Checking if database tables exist..."
    
    # Get a list of all tables
    tables_output=$(docker exec ${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db} psql -U ${DB_USER:-fitness_user} -d ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public'")
    
    print_info "Current tables in database:"
    if [ -z "$tables_output" ]; then
        print_warning "No tables found in database. Will apply migrations."
        need_migrations=true
    else
        # Show tables for debugging
        echo "$tables_output" | while read -r table; do
            if [ ! -z "$table" ]; then
                echo -e "${GREEN}✓${NC} Found table: $table"
            fi
        done
        
        # Check specifically for required tables
        if ! docker exec ${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db} psql -U ${DB_USER:-fitness_user} -d ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'members')" | grep -q "t"; then
            print_warning "Critical table 'members' is missing. Will apply migrations."
            need_migrations=true
        else
            # Check if we have all required tables
            required_tables=("members" "memberships" "membership_benefits" "member_memberships" "fitness_assessments")
            missing_tables=0
            
            for table in "${required_tables[@]}"; do
                if ! docker exec ${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db} psql -U ${DB_USER:-fitness_user} -d ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = '$table')" | grep -q "t"; then
                    print_warning "Required table '$table' is missing"
                    missing_tables=$((missing_tables + 1))
                fi
            done
            
            if [ $missing_tables -gt 0 ]; then
                print_warning "$missing_tables required tables are missing. Will apply migrations."
                need_migrations=true
            else
                print_success "All required tables exist. No migration needed."
                need_migrations=false
            fi
        fi
    fi
    
    # Apply migrations if needed
    if [ "$need_migrations" = true ]; then
        print_info "Applying migrations to create required tables..."
        
        # First attempt to reset the database to ensure a clean state
        print_info "Resetting database schema to ensure clean state..."
        if [ -f "./migrations/000_drop_tables.sql" ]; then
            if ! docker exec -i ${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db} psql -U ${DB_USER:-fitness_user} -d ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} < "./migrations/000_drop_tables.sql"; then
                print_warning "Could not drop tables, attempting to create them anyway."
            else
                print_success "Tables dropped successfully."
            fi
        fi
        
        # Apply each migration file in order
        for migration_file in ./migrations/0*.up.sql; do
            if [[ -f "$migration_file" && "$migration_file" != *"sample_data.sql"* ]]; then
                print_info "Applying migration: $(basename "$migration_file")"
                if ! docker exec -i ${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db} psql -U ${DB_USER:-fitness_user} -d ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} < "$migration_file"; then
                    print_error "Failed to apply migration: $(basename "$migration_file")"
                    # Continue with other migrations
                    continue
                fi
                print_success "Successfully applied: $(basename "$migration_file")"
            fi
        done
        
        # Verify tables were created
        print_info "Verifying tables were created..."
        missing_tables=0
        for table in "${required_tables[@]}"; do
            if ! docker exec ${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db} psql -U ${DB_USER:-fitness_user} -d ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = '$table')" | grep -q "t"; then
                print_error "Table '$table' still missing after migrations"
                missing_tables=$((missing_tables + 1))
            else
                print_success "Table '$table' created successfully"
            fi
        done
        
        if [ $missing_tables -gt 0 ]; then
            print_error "Some tables are still missing. Please check migration files for errors."
        else
            print_success "All required tables created successfully"
        fi
        
        # Ask if sample data should be loaded
        print_info "Do you want to load sample data? (y/n)"
        read -r load_sample_data
        if [[ "$load_sample_data" =~ ^[Yy]$ ]]; then
            print_info "Loading sample data..."
            if [ -f "./migrations/002_sample_data.sql" ]; then
                if ! docker exec -i ${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db} psql -U ${DB_USER:-fitness_user} -d ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} < "./migrations/002_sample_data.sql"; then
                    print_error "Failed to load sample data"
                else
                    print_success "Sample data loaded successfully"
                fi
            else
                print_warning "Sample data file not found at ./migrations/002_sample_data.sql"
            fi
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
    # Check if postgres container is running
    if ! docker ps | grep -q "${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db}"; then
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
}

# Function to wait for database to be ready
wait_for_database() {
    attempts=0
    max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        # Check if database accepts connections
        if docker exec ${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db} pg_isready -U ${DB_USER:-fitness_user} -d ${MEMBER_SERVICE_DB_NAME:-fitness_member_db} &> /dev/null; then
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
    
    # Run the setup script with Docker flag explicitly set
    print_info "Setting up database schema..."
    USE_DOCKER=true LOAD_SAMPLE_DATA=true ./scripts/setup-db.sh
    
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
    
    # Run the setup script with Docker flag explicitly set and no sample data
    print_info "Setting up database schema without sample data..."
    USE_DOCKER=true LOAD_SAMPLE_DATA=false ./scripts/setup-db.sh
    
    print_success "Database reset successfully without sample data"
}

# Function to start the service
start_service() {
    print_header "Starting Member Service"
    
    # Dependencies will be managed during Docker build process
    print_info "Preparing Docker build..."
    print_success "Dependencies will be managed by Docker build process"
    
    # Create Docker-specific environment file if it doesn't exist
    if [ ! -f ".env.docker" ]; then
        print_info "Creating Docker-specific environment file (.env.docker)..."
        cat > ".env.docker" << EOF
# Member Service Configuration
MEMBER_SERVICE_DB_NAME=${MEMBER_SERVICE_DB_NAME:-fitness_member_db}
MEMBER_SERVICE_DB_PORT=5432
MEMBER_SERVICE_PORT=${MEMBER_SERVICE_PORT:-8001}
MEMBER_SERVICE_HOST=${MEMBER_SERVICE_HOST:-0.0.0.0}
MEMBER_SERVICE_CONTAINER_NAME=${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db}
MEMBER_SERVICE_READ_TIMEOUT=15s
MEMBER_SERVICE_WRITE_TIMEOUT=15s
MEMBER_SERVICE_IDLE_TIMEOUT=60s

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
    print_info "Starting member service in Docker container..."
    print_info "Note: Inside Docker, the service will connect to postgres using internal port 5432"
    if docker-compose up -d member-service; then
        print_success "Member service container started successfully"
        print_info "The service is running at http://${MEMBER_SERVICE_HOST:-0.0.0.0}:${MEMBER_SERVICE_PORT:-8001}"
        print_info "To view logs, run: docker-compose logs -f member-service"
        
        # Show container status
        print_header "Container Status"
        docker-compose ps
    else
        print_error "Failed to start member service container"
        exit 1
    fi
}

# Function to display usage instructions
display_usage_instructions() {
    print_header "Usage Instructions"
    
    echo -e "${YELLOW}Your service is running in Docker. Here are some helpful commands:${NC}"
    echo -e ""
    echo -e "${CYAN}View service logs:${NC}"
    echo -e "   ${YELLOW}docker-compose logs -f member-service${NC}"
    echo -e ""
    echo -e "${CYAN}Stop the service:${NC}"
    echo -e "   ${YELLOW}docker-compose down${NC}"
    echo -e ""
    echo -e "${CYAN}Restart the service:${NC}"
    echo -e "   ${YELLOW}docker-compose restart member-service${NC}"
    echo -e ""
    echo -e "${CYAN}Access the API at:${NC}"
    echo -e "   ${YELLOW}http://localhost:${MEMBER_SERVICE_PORT:-8001}/health${NC}"
    echo -e "   ${YELLOW}http://localhost:${MEMBER_SERVICE_PORT:-8001}/api/v1/members${NC}"
    echo -e ""
}

# Main execution starts here
clear
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}      FITNESS CENTER MEMBER SERVICE      ${NC}"
echo -e "${MAGENTA}==========================================${NC}"

# Show current settings
print_header "Settings"
echo -e "Sample data option: ${YELLOW}${SAMPLE_DATA_OPTION}${NC}"
echo -e "Run mode: ${YELLOW}Docker${NC}" # Artık sadece Docker modu destekleniyor

# Load environment variables
load_env_vars

# Check docker is available
check_docker

# Ensure Docker network exists
ensure_docker_network

# Set up the database
ensure_database_running

# Verify migrations
verify_migrations

# Handle sample data if required
if [ "$SAMPLE_DATA_OPTION" != "keep" ]; then
    handle_database_setup
fi

# Display sample data instructions
display_sample_data_instructions

# Start the service
start_service

# Show usage instructions
display_usage_instructions

# Artık sadece Docker modu olduğu için bu kontrol gerekli değil
exit 0
