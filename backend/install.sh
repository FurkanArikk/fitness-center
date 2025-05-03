#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service information
declare -A SERVICE_DIRS=(
    ["member"]="member-service"
    ["staff"]="staff-service"
    ["facility"]="facility-service"
    ["payment"]="payment-service"
    ["class"]="class-service"
    ["gateway"]="api-gateway"
)

declare -A SERVICE_NAMES=(
    ["member"]="Member Management Service"
    ["staff"]="Staff Management Service"
    ["facility"]="Facility Management Service"
    ["payment"]="Payment Management Service"
    ["class"]="Class Management Service"
    ["gateway"]="API Gateway Service"
)

declare -A SERVICE_PORTS=(
    ["member"]="8001"
    ["staff"]="8002"
    ["payment"]="8003"
    ["facility"]="8004"
    ["class"]="8005"
    ["gateway"]="8000"
)

# Default all services selected
declare -A SELECTED_SERVICES=(
    ["member"]=true
    ["staff"]=true
    ["facility"]=true
    ["payment"]=true
    ["class"]=true
    ["gateway"]=true
)

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
    
    print_success "Docker is ready"
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

# Function to check if port is available
check_port_available() {
    local port=$1
    local service_name=$2

    print_info "Checking port $port..."
    if nc -z localhost $port > /dev/null 2>&1 || lsof -ti:$port &>/dev/null; then
        print_warning "Port $port is already in use! Cannot start $service_name."
        
        # List processes using this port
        local pid=$(lsof -ti:$port)
        if [ -n "$pid" ]; then
            print_info "Process using this port: PID=$pid ($(ps -p $pid -o comm=))"
            
            # Ask if user wants to kill the process and retry
            read -p "Do you want to terminate this process and try starting the service? (y/n): " kill_choice
            if [[ $kill_choice =~ ^[Yy]$ ]]; then
                print_info "Terminating process (PID=$pid)..."
                kill -9 $pid
                sleep 2
                
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

# Function to show service selection menu
select_services() {
    local mode=$1
    local menu_title="Fitness Center Service Selection"
    local menu_prompt="Which services would you like to select?"
    local confirm_option="Start Installation"
    
    # Set menu texts according to mode
    case "$mode" in
        "install")
            menu_title="Fitness Center Service Installation"
            menu_prompt="Which services would you like to install?"
            confirm_option="Start Installation"
            ;;
        "start")
            menu_title="Fitness Center Service Start"
            menu_prompt="Which services would you like to start?"
            confirm_option="Start Services"
            ;;
        "stop")
            menu_title="Fitness Center Service Stop"
            menu_prompt="Which services would you like to stop?"
            confirm_option="Stop Services"
            ;;
        "restart")
            menu_title="Fitness Center Service Restart"
            menu_prompt="Which services would you like to restart?"
            confirm_option="Restart Services"
            ;;
        "status")
            menu_title="Fitness Center Service Status"
            menu_prompt="Which services would you like to see the status of?"
            confirm_option="Show Status"
            ;;
    esac
    
    clear
    print_header "$menu_title"
    
    echo -e "${YELLOW}$menu_prompt${NC}"
    echo -e "${CYAN}0)${NC} Select all services (default)"
    local i=1
    for service in "${!SERVICE_NAMES[@]}"; do
        local status="[ ]"
        if [ "${SELECTED_SERVICES[$service]}" = true ]; then
            status="[${GREEN}✓${NC}]"
        fi
        echo -e "${CYAN}$i)${NC} $status ${SERVICE_NAMES[$service]} (port: ${SERVICE_PORTS[$service]})"
        i=$((i+1))
    done
    echo -e "${CYAN}7)${NC} $confirm_option"
    echo -e "${CYAN}8)${NC} Exit"
    
    read -p "Enter your choice (0-8): " choice
    
    case $choice in
        0)
            # Select all services
            for service in "${!SELECTED_SERVICES[@]}"; do
                SELECTED_SERVICES[$service]=true
            done
            select_services "$mode"
            ;;
        1|2|3|4|5|6)
            local selected_service=$(get_service_by_index $choice)
            if [ "${SELECTED_SERVICES[$selected_service]}" = true ]; then
                SELECTED_SERVICES[$selected_service]=false
            else
                SELECTED_SERVICES[$selected_service]=true
            fi
            select_services "$mode"
            ;;
        7)
            # Proceed with operation
            return 0
            ;;
        8)
            echo -e "${YELLOW}Operation cancelled.${NC}"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            select_services "$mode"
            ;;
    esac
}

# Helper function to get service name by index
get_service_by_index() {
    local idx=$1
    local count=1
    for service in "${!SERVICE_NAMES[@]}"; do
        if [ $count -eq $idx ]; then
            echo $service
            return 0
        fi
        count=$((count+1))
    done
    echo ""
}

# Function to install a service
install_service() {
    local service=$1
    local service_dir=${SERVICE_DIRS[$service]}
    
    print_header "Installing ${SERVICE_NAMES[$service]}"
    
    if [ ! -d "$service_dir" ]; then
        print_error "Service directory not found: $service_dir"
        return 1
    fi
    
    # Change directory to service directory
    cd "$service_dir" || return 1
    
    if [ ! -f "run.sh" ]; then
        print_error "run.sh file not found for this service"
        cd - > /dev/null
        return 1
    fi
    
    print_info "Executing service installation script..."
    
    # Make sure run.sh is executable
    chmod +x run.sh
    
    # Check if this is API Gateway (no need for sample data)
    if [ "$service" = "gateway" ]; then
        print_info "Setting up API Gateway..."
        ./run.sh --setup-only
    else
        # Ask if sample data should be loaded
        echo
        read -p "Do you want to load sample data for this service? (y/n): " load_sample_data
        
        if [[ $load_sample_data =~ ^[Yy]$ ]]; then
            # Run with sample data loading option
            print_info "Starting service setup and sample data loading..."
            ./run.sh --setup-with-data
        else
            # Run without sample data
            print_info "Starting service setup (without sample data)..."
            ./run.sh --setup-only
        fi
    fi
    
    local result=$?
    if [ $result -eq 0 ]; then
        print_success "${SERVICE_NAMES[$service]} installation completed successfully"
    else
        print_error "${SERVICE_NAMES[$service]} installation failed"
    fi
    
    cd - > /dev/null
    return $result
}

# Function to start a service in the background
start_service() {
    local service=$1
    local service_dir=${SERVICE_DIRS[$service]}
    local port=${SERVICE_PORTS[$service]}
    
    print_header "Starting ${SERVICE_NAMES[$service]}"
    
    if [ ! -d "$service_dir" ]; then
        print_error "Service directory not found: $service_dir"
        # Show full path for debugging
        local current_dir=$(pwd)
        print_info "Current directory: $current_dir"
        print_info "Looking for: $current_dir/$service_dir"
        return 1
    fi
    
    # Check if port is available
    if ! check_port_available "$port" "${SERVICE_NAMES[$service]}"; then
        return 1
    fi
    
    # Change directory to service directory
    cd "$service_dir" || return 1
    
    if [ ! -f "run.sh" ]; then
        print_error "run.sh file not found for this service"
        cd - > /dev/null
        return 1
    fi
    
    print_info "Starting service (in background)..."
    
    # Make sure run.sh is executable
    chmod +x run.sh
    
    # Start the service in background
    ./run.sh --start-only > /tmp/fitness-${service}.log 2>&1 &
    
    # Save PID for future reference
    echo $! > /tmp/fitness-${service}.pid
    
    # Check if service started successfully (wait a moment)
    sleep 2
    if kill -0 $(cat /tmp/fitness-${service}.pid) 2>/dev/null; then
        print_success "${SERVICE_NAMES[$service]} started successfully (PID: $(cat /tmp/fitness-${service}.pid))"
    else
        print_error "Failed to start ${SERVICE_NAMES[$service]}"
        print_info "Check error details in: /tmp/fitness-${service}.log"
        return 1
    fi
    
    cd - > /dev/null
    return 0
}

# Function to stop a running service
stop_service() {
    local service=$1
    local port=${SERVICE_PORTS[$service]}
    
    print_header "Stopping ${SERVICE_NAMES[$service]}"
    
    # First try with PID file
    if [ -f "/tmp/fitness-${service}.pid" ]; then
        local pid=$(cat "/tmp/fitness-${service}.pid")
        
        if kill -0 $pid 2>/dev/null; then
            print_info "Stopping service by PID (PID: $pid)..."
            
            # First try graceful termination with SIGTERM
            kill $pid
            
            # Wait for service to terminate
            for i in {1..5}; do
                if ! kill -0 $pid 2>/dev/null; then
                    print_success "Service stopped successfully (PID: $pid)"
                    break
                fi
                sleep 1
            done
            
            # If still running, force termination
            if kill -0 $pid 2>/dev/null; then
                print_warning "Service not responding, force terminating..."
                kill -9 $pid 2>/dev/null
                sleep 1
            fi
        else
            print_warning "Process ($pid) from PID file is no longer running"
        fi
    else
        print_info "PID file not found, checking port usage..."
    fi
    
    # Port-based check - independent of PID file
    if [ -n "$port" ]; then
        # Find all processes using this port
        local port_pids=$(lsof -ti:$port 2>/dev/null)
        
        if [ -n "$port_pids" ]; then
            print_info "Port $port is still in use. Process(es): $port_pids"
            print_info "Terminating processes..."
            
            # Terminate each process
            for port_pid in $port_pids; do
                print_info "Terminating process: $port_pid"
                kill -15 $port_pid 2>/dev/null
                sleep 1
                
                # If still running, force terminate
                if kill -0 $port_pid 2>/dev/null; then
                    print_warning "Process not responding, force terminating: $port_pid"
                    kill -9 $port_pid 2>/dev/null
                fi
            done
            
            # Final check
            if lsof -ti:$port &>/dev/null; then
                print_error "Port $port is still in use! Could not fully stop service."
                print_info "Try manually: sudo lsof -ti:$port | xargs kill -9"
            else
                print_success "Port $port is now free"
            fi
        else
            print_info "Port $port is not in use"
        fi
    else
        print_warning "No port information for service, cannot check port"
    fi
    
    # Clean up PID file
    rm -f "/tmp/fitness-${service}.pid"
    
    # Give final status about service
    if ! lsof -ti:$port &>/dev/null; then
        print_success "${SERVICE_NAMES[$service]} stopped successfully"
    else
        print_warning "${SERVICE_NAMES[$service]} status uncertain (port $port still in use)"
    fi
}

# Function to display a summary of services
display_service_summary() {
    local mode=$1
    local action="install"
    
    case "$mode" in
        "install")
            action="install"
            ;;
        "start")
            action="start"
            ;;
        "stop")
            action="stop"
            ;;
        "restart")
            action="restart"
            ;;
        "status")
            action="check the status of"
            ;;
    esac
    
    print_header "Selected Services"
    
    local selected_count=0
    for service in "${!SELECTED_SERVICES[@]}"; do
        if [ "${SELECTED_SERVICES[$service]}" = true ]; then
            selected_count=$((selected_count+1))
            print_info "${SERVICE_NAMES[$service]} (${SERVICE_DIRS[$service]})"
        fi
    done
    
    if [ $selected_count -eq 0 ]; then
        print_warning "No services selected! Nothing to do."
        exit 0
    fi
    
    echo
    read -p "Do you want to $action the selected services? (y/n): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Operation cancelled.${NC}"
        exit 0
    fi
}

# Main function
main() {
    local mode="install"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --start)
                mode="start"
                shift
                ;;
            --stop)
                mode="stop"
                shift
                ;;
            --restart)
                mode="restart"
                shift
                ;;
            --status)
                mode="status"
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
    
    clear
    echo -e "${MAGENTA}==========================================${NC}"
    echo -e "${MAGENTA}      FITNESS CENTER SETUP SYSTEM         ${NC}"
    echo -e "${MAGENTA}==========================================${NC}"
    
    # Check if services exist
    local missing_services=()
    for service in "${!SERVICE_DIRS[@]}"; do
        # Check full paths and display them
        if [ ! -d "${SERVICE_DIRS[$service]}" ]; then
            local current_dir=$(pwd)
            print_warning "Directory check: $current_dir/${SERVICE_DIRS[$service]}"
            missing_services+=("${SERVICE_NAMES[$service]}")
            SELECTED_SERVICES[$service]=false
        fi
    done
    
    if [ ${#missing_services[@]} -gt 0 ]; then
        print_warning "Some service directories were not found:"
        for missing in "${missing_services[@]}"; do
            print_warning "  - $missing"
        done
        echo
    fi
    
    # Basic Docker checks
    check_docker
    ensure_docker_network
    
    # Handle different modes
    case "$mode" in
        "install")
            # Ask for service selection
            select_services "$mode"
            
            # Show summary and confirmation
            display_service_summary "$mode"
            
            # Install each selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    install_service "$service"
                fi
            done
            
            print_header "Installation Complete"
            
            echo -e "${GREEN}Fitness Center services installation completed.${NC}"
            echo -e "${YELLOW}To start services:${NC} $0 --start"
            echo -e "${YELLOW}To check running services:${NC} $0 --status"
            ;;
            
        "start")
            # Ask for service selection
            select_services "$mode"
            
            # Show summary and confirmation
            display_service_summary "$mode"
            
            # Determine startup order (API Gateway should start last)
            # First start all services except API Gateway
            local gateway_selected=false
            if [ "${SELECTED_SERVICES[gateway]}" = true ]; then
                gateway_selected=true
                SELECTED_SERVICES[gateway]=false
            fi
            
            # Start each selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    start_service "$service"
                fi
            done
            
            # If API Gateway was selected, start it last
            if [ "$gateway_selected" = true ]; then
                print_info "Starting API Gateway after other services..."
                SELECTED_SERVICES[gateway]=true
                start_service "gateway"
            fi
            
            print_header "Service Start Complete"
            
            echo -e "${GREEN}Selected services have been started.${NC}"
            echo -e "${YELLOW}To see active services:${NC} $0 --status"
            echo -e "${YELLOW}To stop services:${NC} $0 --stop"
            echo
            echo -e "${CYAN}Active Services:${NC}"
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    if [ -f "/tmp/fitness-${service}.pid" ] && kill -0 $(cat "/tmp/fitness-${service}.pid") 2>/dev/null; then
                        echo -e "${GREEN}- ${SERVICE_NAMES[$service]}:${NC} http://localhost:${SERVICE_PORTS[$service]} (PID: $(cat "/tmp/fitness-${service}.pid"))"
                    fi
                fi
            done
            ;;
            
        "stop")
            # Ask for service selection
            select_services "$mode"
            
            # Show summary and confirmation
            display_service_summary "$mode"
            
            # Determine shutdown order (API Gateway should stop first)
            # First stop API Gateway if selected
            if [ "${SELECTED_SERVICES[gateway]}" = true ]; then
                stop_service "gateway"
                SELECTED_SERVICES[gateway]=false
            fi
            
            # Stop each remaining selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    stop_service "$service"
                fi
            done
            
            print_header "Service Stop Complete"
            ;;
            
        "restart")
            # Ask for service selection
            select_services "$mode"
            
            # Show summary and confirmation
            display_service_summary "$mode"
            
            # Determine restart order (stop API Gateway first, then start it last)
            # First stop API Gateway if selected
            local gateway_selected=false
            if [ "${SELECTED_SERVICES[gateway]}" = true ]; then
                gateway_selected=true
                stop_service "gateway"
                SELECTED_SERVICES[gateway]=false
            fi
            
            # Restart each remaining selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    stop_service "$service"
                    start_service "$service"
                fi
            done
            
            # If API Gateway was selected, restart it last
            if [ "$gateway_selected" = true ]; then
                print_info "Starting API Gateway after other services..."
                SELECTED_SERVICES[gateway]=true
                start_service "gateway"
            fi
            
            print_header "Service Restart Complete"
            ;;
            
        "status")
            print_header "Service Status"
            
            for service in "${!SERVICE_NAMES[@]}"; do
                if [ -f "/tmp/fitness-${service}.pid" ] && kill -0 $(cat "/tmp/fitness-${service}.pid") 2>/dev/null; then
                    echo -e "${GREEN}● ${SERVICE_NAMES[$service]}${NC} - Running (PID: $(cat "/tmp/fitness-${service}.pid")) - http://localhost:${SERVICE_PORTS[$service]}"
                else
                    echo -e "${RED}○ ${SERVICE_NAMES[$service]}${NC} - Not running"
                fi
            done
            ;;
    esac
    
    echo
}

# Parse command line arguments and run main function
main "$@"
