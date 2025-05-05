#!/bin/bash

# Colors - for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print headers
print_header() {
    echo -e "\n${MAGENTA}====================================================${NC}"
    echo -e "${MAGENTA}      $1${NC}"
    echo -e "${MAGENTA}====================================================${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${CYAN}⚠ $1${NC}"
}

# List of services
SERVICES=(
    "api-gateway"
    "member-service"
    "staff-service"
    "class-service"
    "facility-service"
    "payment-service"
)

# Array to store service states
declare -A service_selected

# All services selected by default
for service in "${SERVICES[@]}"; do
    service_selected["$service"]=true
done

# Check Docker installation
check_docker() {
    print_info "Checking Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        print_info "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        print_info "Please start the Docker service"
        exit 1
    fi
    
    print_success "Docker is ready"
}

# Check if Docker network exists, create if not
ensure_docker_network() {
    print_info "Checking Docker network..."
    
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

# Service selection menu
select_services() {
    clear
    print_header "FITNESS CENTER SERVICES SELECTION"
    
    echo -e "\nWhich services would you like to manage?"
    echo -e "(${GREEN}✓${NC} = Selected, ${RED}✗${NC} = Not selected)\n"
    
    local counter=1
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]]; then
            echo -e "$counter) [${GREEN}✓${NC}] $service"
        else
            echo -e "$counter) [${RED}✗${NC}] $service"
        fi
        counter=$((counter+1))
    done
    
    echo -e "\n${CYAN}Options:${NC}"
    echo -e "  ${YELLOW}Service number${NC} to toggle selection"
    echo -e "  ${YELLOW}a${NC} - Select all"
    echo -e "  ${YELLOW}n${NC} - Select none"
    echo -e "  ${YELLOW}c${NC} - Continue"
    echo -e "  ${YELLOW}q${NC} - Quit\n"
    
    read -p "Your choice: " choice
    
    case "$choice" in
        [1-9]*)
            # Set service index (0-based)
            local index=$((choice-1))
            if [ $index -lt ${#SERVICES[@]} ]; then
                local selected_service=${SERVICES[$index]}
                # Toggle selection
                if [[ ${service_selected["$selected_service"]} == true ]]; then
                    service_selected["$selected_service"]=false
                else
                    service_selected["$selected_service"]=true
                fi
                select_services  # Show menu again
            else
                print_error "Invalid selection"
                sleep 1
                select_services
            fi
            ;;
        a|A)
            # Select all
            for service in "${SERVICES[@]}"; do
                service_selected["$service"]=true
            done
            select_services
            ;;
        n|N)
            # Select none
            for service in "${SERVICES[@]}"; do
                service_selected["$service"]=false
            done
            select_services
            ;;
        c|C)
            # Continue - do nothing and exit
            ;;
        q|Q)
            echo -e "\n${YELLOW}Exiting program...${NC}"
            exit 0
            ;;
        *)
            print_error "Invalid selection"
            sleep 1
            select_services
            ;;
    esac
}

# Service start function
start_service() {
    local service=$1
    local with_sample_data=$2
    local start_process=$3
    
    print_info "Starting $service..."
    
    # Navigate to service directory
    cd "$service" || {
        print_error "Could not change directory to $service"
        return 1
    }
    
    if [ "$start_process" = true ]; then
        # Only start service process
        print_info "Starting $service process..."
        
        if [ "$service" = "api-gateway" ]; then
            # For API Gateway run terminal in background
            ./run.sh --start-only &
            sleep 2
        else
            # For other services run terminal in background
            ./run.sh --start-only &
            sleep 2
        fi
    else
        # Setup operations
        # Check sample data parameter
        if [ "$with_sample_data" = true ]; then
            ./run.sh --setup-with-data
        else
            ./run.sh --setup-only
        fi
    fi
    
    # Return to main directory
    cd ..
    
    print_success "$service started"
}

# Service stop function
stop_service() {
    local service=$1
    
    print_info "Stopping $service..."
    
    # Navigate to service directory
    cd "$service" || {
        print_error "Could not change directory to $service"
        return 1
    }
    
    # Determine Docker container name
    local container_name="fitness-${service%-service}-db"
    
    if [ "$service" = "api-gateway" ]; then
        # For API Gateway, no Docker container, just stop process
        pkill -f "$service"
    else
        # Stop Docker container
        if ./scripts/docker-db.sh stop; then
            print_success "Database for ${service} stopped"
        else
            print_warning "Could not stop database for ${service}"
        fi
        
        # Stop process
        pkill -f "$service"
    fi
    
    # Return to main directory
    cd ..
    
    print_success "$service stopped"
}

# Start all selected services
start_all_services() {
    local with_sample_data=$1
    
    print_header "START SELECTED SERVICES"
    
    # Check Docker
    check_docker
    
    # Check Docker network
    ensure_docker_network
    
    # Start databases first
    print_info "Preparing databases..."
    
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]] && [[ "$service" != "api-gateway" ]]; then
            # Database setup first
            start_service "$service" "$with_sample_data" false
            
            # Then start service
            start_service "$service" false true
        fi
    done
    
    # Finally start API Gateway
    if [[ ${service_selected["api-gateway"]} == true ]]; then
        # API Gateway setup
        start_service "api-gateway" false false
        
        # Start API Gateway process
        start_service "api-gateway" false true
    fi
    
    print_success "All selected services started"
}

# Stop all selected services
stop_all_services() {
    print_header "STOP SELECTED SERVICES"
    
    # Stop API Gateway first
    if [[ ${service_selected["api-gateway"]} == true ]]; then
        stop_service "api-gateway"
    fi
    
    # Then stop other services
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]] && [[ "$service" != "api-gateway" ]]; then
            stop_service "$service"
        fi
    done
    
    print_success "All selected services stopped"
}

# Check status of selected services
check_services_status() {
    print_header "SERVICE STATUS"
    
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]]; then
            echo -e "\n${CYAN}${service}${NC} status:"
            
            # Process check
            if pgrep -f "$service" > /dev/null; then
                echo -e "  Process: ${GREEN}Running${NC}"
            else
                echo -e "  Process: ${RED}Not running${NC}"
            fi
            
            # Database check (except API Gateway)
            if [[ "$service" != "api-gateway" ]]; then
                local container_name="fitness-${service%-service}-db"
                if docker ps | grep -q "$container_name"; then
                    echo -e "  Database: ${GREEN}Running${NC}"
                else
                    echo -e "  Database: ${RED}Not running${NC}"
                fi
            fi
        fi
    done
}

# Show main menu
show_main_menu() {
    clear
    print_header "FITNESS CENTER SERVICE MANAGER"
    
    local selected_count=0
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]]; then
            selected_count=$((selected_count+1))
        fi
    done
    
    echo -e "\n${CYAN}Selected services:${NC} $selected_count/${#SERVICES[@]}"
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]]; then
            echo -e "  ${GREEN}✓${NC} $service"
        fi
    done
    
    echo -e "\n${CYAN}Actions:${NC}"
    echo -e "  ${YELLOW}1)${NC} Select services"
    echo -e "  ${YELLOW}2)${NC} Start selected services"
    echo -e "  ${YELLOW}3)${NC} Start selected services with sample data"
    echo -e "  ${YELLOW}4)${NC} Stop selected services"
    echo -e "  ${YELLOW}5)${NC} Restart selected services"
    echo -e "  ${YELLOW}6)${NC} Check status of selected services"
    echo -e "  ${YELLOW}q)${NC} Quit\n"
    
    read -p "Your choice: " choice
    
    case "$choice" in
        1)
            select_services
            show_main_menu
            ;;
        2)
            start_all_services false
            read -p "Press Enter to return to main menu..." 
            show_main_menu
            ;;
        3)
            start_all_services true
            read -p "Press Enter to return to main menu..." 
            show_main_menu
            ;;
        4)
            stop_all_services
            read -p "Press Enter to return to main menu..." 
            show_main_menu
            ;;
        5)
            print_info "Restarting services..."
            stop_all_services
            start_all_services false
            read -p "Press Enter to return to main menu..." 
            show_main_menu
            ;;
        6)
            check_services_status
            read -p "Press Enter to return to main menu..." 
            show_main_menu
            ;;
        q|Q)
            echo -e "\n${YELLOW}Exiting program...${NC}"
            exit 0
            ;;
        *)
            print_error "Invalid selection"
            sleep 1
            show_main_menu
            ;;
    esac
}

# Main program start
main() {
    clear
    show_main_menu
}

# Start script
main "$@"