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

# Function to check if the port is available
check_port_available() {
    local port=${API_GATEWAY_PORT:-8000}
    print_info "Checking port $port..."
    if nc -z localhost $port > /dev/null 2>&1 || lsof -ti:$port &>/dev/null; then
        print_warning "Port $port is already in use! Cannot start API Gateway."
        
        # List processes using this port
        local pid=$(lsof -ti:$port)
        if [ -n "$pid" ]; then
            print_info "Process using this port: PID=$pid ($(ps -p $pid -o comm=))"
            
            # Ask if user wants to kill the process and retry
            read -p "Do you want to terminate this process and try starting the service? (y/n): " kill_choice
            if [[ $kill_choice =~ ^[Yy]$ ]]; then
                print_info "Terminating process (PID=$pid) with SIGTERM..."
                kill $pid
                sleep 5
                if ps -p $pid > /dev/null 2>&1; then
                    print_warning "Process did not terminate with SIGTERM. Sending SIGKILL..."
                    kill -9 $pid
                    sleep 2
                fi
                
                # Check port again
                if nc -z localhost $port > /dev/null 2>&1 || lsof -ti:$port &>/dev/null; then
                    print_error "Process terminated but port $port is still in use!"
                    return 1
                else
                    print_success "Process terminated, port $port is now available"
                    return 0
                fi
            fi
        fi
        return 1
    fi
    
    print_success "Port $port is available"
    return 0
}

# Function to check Docker is available
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

# Function to ensure Docker network exists
ensure_docker_network() {
    print_header "Checking Docker Network"
    
    if docker network inspect fitness-network &> /dev/null; then
        print_success "Docker network 'fitness-network' already exists"
    else
        print_info "Creating Docker network 'fitness-network'..."
        if docker network create fitness-network &> /dev/null; then
            print_success "Docker network created successfully"
        else
            print_error "Failed to create Docker network"
            exit 1
        fi
    fi
}

# Function to build and start the API Gateway
build_and_start_api_gateway() {
    print_header "Building API Gateway"
    
    print_info "Building Go application..."
    if go build -o api-gateway cmd/main.go; then
        print_success "Build successful!"
    else
        print_error "Build failed. Please fix the errors before running the API Gateway."
        exit 1
    fi
    
    print_header "Starting API Gateway"
    print_info "The API Gateway is starting on http://${API_GATEWAY_HOST:-localhost}:${API_GATEWAY_PORT:-8000}"
    print_info "Press Ctrl+C to stop the service"
    
    # Start the API Gateway
    ./api-gateway
}

# Function to display environment setup instructions
display_environment_instructions() {
    print_header "Environment Setup for API Gateway"
    
    echo -e "${MAGENTA}API Gateway Service Environment Variables:${NC}"
    echo -e ""
    echo -e "${CYAN}Required variables for service configuration:${NC}"
    echo -e "   ${YELLOW}API_GATEWAY_PORT${NC} - Port for API Gateway (default: 8000)"
    echo -e "   ${YELLOW}API_GATEWAY_CONFIG${NC} - Path to configuration file (default: ./configs/config.yaml)"
    echo -e ""
    echo -e "${CYAN}Optional microservice connection variables:${NC}"
    echo -e "   ${YELLOW}MEMBER_SERVICE_URL${NC} - URL for Member Service (default: http://localhost:8001)"
    echo -e "   ${YELLOW}STAFF_SERVICE_URL${NC} - URL for Staff Service (default: http://localhost:8002)"
    echo -e "   ${YELLOW}CLASS_SERVICE_URL${NC} - URL for Class Service (default: http://localhost:8003)"
    echo -e "   ${YELLOW}FACILITY_SERVICE_URL${NC} - URL for Facility Service (default: http://localhost:8004)"
    echo -e "   ${YELLOW}PAYMENT_SERVICE_URL${NC} - URL for Payment Service (default: http://localhost:8005)"
    echo -e ""
}

# Main execution starts here
main() {
    # Check for special execution modes
    local SETUP_ONLY=false
    local START_ONLY=false
    local SETUP_WITH_DATA=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --setup-only)
                SETUP_ONLY=true
                shift
                ;;
            --setup-with-data)
                SETUP_ONLY=true
                SETUP_WITH_DATA=true
                shift
                ;;
            --start-only)
                START_ONLY=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    if [ "$START_ONLY" = false ]; then
        clear
        echo -e "${MAGENTA}==========================================${NC}"
        echo -e "${MAGENTA}      FITNESS CENTER API GATEWAY         ${NC}"
        echo -e "${MAGENTA}==========================================${NC}"

        # Check if port is available
        if ! check_port_available; then
            exit 1
        fi

        # Check docker is available
        check_docker

        # Ensure Docker network exists
        ensure_docker_network

        # Display environment setup instructions
        display_environment_instructions
        
        # If in setup-only mode, exit after setup
        if [ "$SETUP_ONLY" = true ]; then
            print_success "Setup completed successfully"
            exit 0
        fi
    fi

    # Build and start the API Gateway
    build_and_start_api_gateway
}

# Run the main function with all arguments passed to the script
main "$@"