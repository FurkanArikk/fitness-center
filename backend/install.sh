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

# Save start time
START_TIME=$(date +%s)

# Process command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -s|--sample-data)
            if [ "$2" == "reset" ] || [ "$2" == "none" ] || [ "$2" == "keep" ]; then
                SAMPLE_DATA_OPTION="$2"
                shift 2
            else
                echo -e "${RED}Error: Invalid sample data option. Use reset, none or keep.${NC}"
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
    echo -e "${CYAN}Usage:${NC} ./install.sh [options]"
    echo
    echo -e "${CYAN}Options:${NC}"
    echo -e "  ${YELLOW}-s, --sample-data OPTION${NC}  Specify sample data option: reset (load fresh data), none (no sample data), keep (keep existing, default)"
    echo -e "  ${YELLOW}-l, --local${NC}               Run services locally instead of in Docker"
    echo -e "  ${YELLOW}-h, --help${NC}                Show this help message"
    echo
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  ${YELLOW}./install.sh${NC}                  Run with default settings (keep data, use Docker)"
    echo -e "  ${YELLOW}./install.sh -s reset${NC}         Reset and load sample data"
    echo -e "  ${YELLOW}./install.sh -s none${NC}          Start with clean database without sample data"
    echo -e "  ${YELLOW}./install.sh -l${NC}               Run services locally (database still in Docker)"
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

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir="$(pwd)/$service_name"
    
    if [ -d "$service_dir" ] && [ -f "$service_dir/run.sh" ]; then
        print_header "Starting $service_name"
        
        if [ "$USE_DOCKER" = "true" ]; then
            print_info "Starting $service_name in Docker..."
            cd "$service_dir" && ./run.sh -s $SAMPLE_DATA_OPTION
        else
            print_info "Starting $service_name locally..."
            cd "$service_dir" && ./run.sh -s $SAMPLE_DATA_OPTION -l
        fi
        
        # Check exit code of run.sh script
        if [ $? -eq 0 ]; then
            print_success "$service_name started successfully"
        else
            print_error "Failed to start $service_name"
            cd "$(dirname "$service_dir")"
            return 1
        fi
        
        cd "$(dirname "$service_dir")"
    else
        print_warning "$service_name directory or run.sh script not found: $service_dir"
    fi
}

# Function to start services in sequence
start_services() {
    # Start main services with database dependencies
    local services=("auth-service" "member-service" "staff-service" "payment-service" "facility-service" "class-service")
    
    # Collect any failures during service startup
    local failures=()
    
    for service in "${services[@]}"; do
        start_service "$service"
        if [ $? -ne 0 ]; then
            failures+=("$service")
        fi
        sleep 2  # Short delay to prevent services from interfering with each other
    done
    
    # Report any services that failed to start
    if [ ${#failures[@]} -gt 0 ]; then
        print_header "Failed Services"
        for failure in "${failures[@]}"; do
            print_error "$failure - Failed to start"
        done
        return 1
    fi
    
    return 0
}

# Function to display container status
show_container_status() {
    print_header "Container Status"
    
    if [ "$USE_DOCKER" = "true" ]; then
        docker ps --filter "network=${DOCKER_NETWORK_NAME:-fitness-network}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_info "Running in local mode, container status not shown"
    fi
}

# Function to display access instructions
show_access_instructions() {
    print_header "Access Information"

    echo -e "${GREEN}All services started!${NC}"
    echo
    echo -e "${CYAN}API Gateway (Traefik):${NC}"
    echo -e "  ${YELLOW}Traefik Dashboard: http://localhost:8080/dashboard/#/${NC}"
    echo
    echo -e "${CYAN}Authentication:${NC}"
    echo -e "  ${YELLOW}Login: http://localhost/api/v1/login${NC}"
    echo -e "  ${YELLOW}Admin credentials: username=admin, password=admin${NC}"
    echo
    echo -e "${CYAN}Protected APIs (requires JWT token):${NC}"
    echo -e "  ${YELLOW}Members API: http://localhost/api/v1/members${NC}"
    echo -e "  ${YELLOW}Staff API: http://localhost/api/v1/staff${NC}"
    echo -e "  ${YELLOW}Payment API: http://localhost/api/v1/payments${NC}"
    echo -e "  ${YELLOW}Facility API: http://localhost/api/v1/facilities${NC}"
    echo -e "  ${YELLOW}Class API: http://localhost/api/v1/classes${NC}"
    echo
    echo -e "${CYAN}To stop services:${NC}"
    echo -e "  ${YELLOW}Run ./stop.sh script${NC}"
    echo
    echo -e "${CYAN}To stop individual service (if needed):${NC}"
    echo -e "  ${YELLOW}cd <service-directory> && docker-compose down${NC}"
}

# Function to calculate and display elapsed time
show_elapsed_time() {
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    
    print_header "Setup Complete"
    echo -e "${GREEN}All services started in ${ELAPSED} seconds${NC}"
}

# Function to create stop script
create_stop_script() {
    cat > "$(pwd)/stop.sh" << EOF
#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "\${MAGENTA}==========================================${NC}"
echo -e "\${MAGENTA}      STOPPING ALL SERVICES & TRAEFIK      ${NC}"
echo -e "\${MAGENTA}==========================================${NC}"

# Stop Traefik (assuming it's in the main docker-compose.yml)
echo -e "\${BLUE}===${NC} \${CYAN}Stopping Traefik API Gateway${NC} \${BLUE}===${NC}"
if docker-compose -f docker-compose.yml down &> /dev/null; then
    echo -e "\${GREEN}✓ Traefik API Gateway stopped successfully${NC}"
else
    echo -e "\${YELLOW}→ Traefik API Gateway might already be stopped or not found in the main docker-compose.yml${NC}"
fi

services=("member-service" "staff-service" "payment-service" "facility-service" "class-service")

for service in "\${services[@]}"; do
    echo -e "\${BLUE}===${NC} \${CYAN}Stopping \$service${NC} \${BLUE}===${NC}"
    if [ -d "\$service" ]; then
        cd "\$service"
        if docker-compose down &> /dev/null; then
            echo -e "\${GREEN}✓ \$service stopped successfully${NC}"
        else
            echo -e "\${YELLOW}→ \$service might already be stopped${NC}"
        fi
        cd ..
    else
        echo -e "\${YELLOW}→ \$service directory not found${NC}"
    fi
done

echo -e "\${GREEN}All services and Traefik stopped${NC}"
EOF

    chmod +x "$(pwd)/stop.sh"
    print_success "stop.sh script updated for Traefik"
}

# MAIN PROGRAM STARTS HERE
clear
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}   FITNESS CENTER - START ALL SERVICES   ${NC}"
echo -e "${MAGENTA}==========================================${NC}"

# Show current settings
print_header "Settings"
echo -e "Sample data option: ${YELLOW}${SAMPLE_DATA_OPTION}${NC}"
echo -e "Run mode: ${YELLOW}$([ "$USE_DOCKER" = "true" ] && echo "Docker" || echo "Local")${NC}"

# Check Docker is available
check_docker

# Check Docker network
ensure_docker_network

# Start services
if start_services; then
    # Start Traefik separately
    print_header "Starting Traefik API Gateway"
    if docker-compose -f docker-compose.yml up -d traefik &> /dev/null; then
        print_success "Traefik API Gateway started successfully"
    else
        print_error "Failed to start Traefik API Gateway. Check docker-compose.yml in the main directory."
        # Optionally, decide if you want to exit if Traefik fails
        # exit 1 
    fi

    # Show container status
    show_container_status
    
    # Create stop.sh script
    create_stop_script
    
    # Show access instructions
    show_access_instructions
    
    # Show elapsed time
    show_elapsed_time
    
    exit 0
else
    print_error "Some services failed to start. Please check the errors."
    exit 1
fi
