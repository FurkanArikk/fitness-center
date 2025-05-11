#!/bin/bash

# Script to manage the Docker-based PostgreSQL database for class-service
# Usage: ./scripts/docker-db.sh [start|stop|restart|status|logs|reset|shell|debug]

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="$(pwd)/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

# Exit on error
set -e

# Move to the project root directory (where docker-compose.yml is located)
cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Set container and DB parameters from environment variables with defaults
# This is critical - make sure it matches docker-compose.yml!
CONTAINER_NAME="class-service-fitness_class_db"
DB_PORT=${CLASS_SERVICE_DB_PORT:-5436}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db}
DOCKER_NETWORK=${DOCKER_NETWORK_NAME:-fitness-network}

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Display configuration
echo "Using configuration:"
echo "  Container name: $CONTAINER_NAME"
echo "  Database port: $DB_PORT"
echo "  Database name: $DB_NAME"
echo "  Network: $DOCKER_NETWORK"

# Command functions
start_db() {
    echo "Starting PostgreSQL container..."
    
    # First check if container already exists but is stopped
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${YELLOW}Container exists but is not running. Starting existing container...${NC}"
        if ! docker start $CONTAINER_NAME 2>/dev/null; then
            echo -e "${RED}Error starting existing container. The container might be corrupted.${NC}"
            echo -e "${YELLOW}Removing corrupted container and creating a new one...${NC}"
            docker rm $CONTAINER_NAME 2>/dev/null || true
            docker-compose up -d postgres
        fi
    else
        echo "Creating and starting new container..."
        docker-compose up -d postgres
    fi
    
    echo "Waiting for database to be ready..."
    # Wait a bit longer for the container to initialize
    sleep 5
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Error: Container failed to start. Checking logs...${NC}"
        docker logs $CONTAINER_NAME 2>/dev/null || echo "Cannot fetch logs: Container may not exist"
        echo -e "${RED}Container might have failed during initialization. See logs above.${NC}"
        exit 1
    fi
    
    # Try to connect to PostgreSQL up to 30 times (increased from 10)
    for i in {1..30}; do
        echo "Attempt $i: Checking if PostgreSQL is ready..."
        if docker exec $CONTAINER_NAME pg_isready -U $DB_USER -d $DB_NAME 2>/dev/null; then
            echo -e "${GREEN}PostgreSQL is running and ready!${NC}"
            echo "You can connect with:"
            echo "  ./scripts/db-connect.sh"
            echo "Or using the environment host:"
            echo "  DB_HOST=localhost DB_PORT=$DB_PORT ./scripts/db-connect.sh"
            return 0
        fi
        echo "PostgreSQL not ready yet, waiting 3 seconds..."
        sleep 3
    done
    
    echo -e "${RED}Error: PostgreSQL container is running but PostgreSQL server failed to start or initialize properly.${NC}"
    echo "Displaying container logs:"
    docker logs $CONTAINER_NAME 2>/dev/null || echo "Cannot fetch logs: Container may not exist"
    echo -e "${YELLOW}Try running: ./scripts/docker-db.sh reset to completely rebuild the container${NC}"
    exit 1
}

stop_db() {
    echo "Stopping PostgreSQL container..."
    docker stop $CONTAINER_NAME 2>/dev/null || echo "Container is not running"
    echo "PostgreSQL container stopped."
}

restart_db() {
    stop_db
    start_db
}

status_db() {
    echo "PostgreSQL container status:"
    if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "\n${GREEN}Container is running.${NC}"
        echo "Container ID: $(docker ps -q -f "name=$CONTAINER_NAME")"
        echo "Container Status: $(docker inspect -f '{{.State.Status}}' $CONTAINER_NAME)"
        echo "Checking PostgreSQL server status inside container..."
        if docker exec $CONTAINER_NAME pg_isready -U $DB_USER -d $DB_NAME 2>/dev/null; then
            echo -e "${GREEN}PostgreSQL server is running properly.${NC}"
        else
            echo -e "${RED}PostgreSQL server is not responding inside the container.${NC}"
        fi
    else
        echo -e "\n${RED}Container is not running.${NC}"
        # Check if it exists but is stopped
        if docker ps -a --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
            echo "Container exists but is stopped."
        else
            echo "Container does not exist."
        fi
    fi
}

logs_db() {
    echo "PostgreSQL container logs:"
    docker logs $CONTAINER_NAME 2>/dev/null || echo "Cannot fetch logs: Container may not exist"
}

debug_db() {
    echo "Running diagnostic checks on PostgreSQL container..."
    
    # Check if the container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Container does not exist. Try starting it first.${NC}"
        exit 1
    fi
    
    # Check container state
    echo -e "\n${YELLOW}Container State:${NC}"
    docker inspect --format='{{.State.Status}}' $CONTAINER_NAME
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Container exists but is not running.${NC}"
        echo -e "\n${YELLOW}Container Exit Code:${NC}"
        docker inspect --format='{{.State.ExitCode}}' $CONTAINER_NAME
        
        echo -e "\n${YELLOW}Container Error:${NC}"
        docker inspect --format='{{.State.Error}}' $CONTAINER_NAME
        
        echo -e "\n${YELLOW}Last 50 lines of container logs:${NC}"
        docker logs --tail 50 $CONTAINER_NAME 2>/dev/null || echo "Cannot fetch logs: Container may not exist"
        
        echo -e "\n${YELLOW}Possible issues:${NC}"
        echo "1. Permission problems with mounted volumes"
        echo "2. PostgreSQL configuration issues"
        echo "3. Port conflicts (is port $DB_PORT already in use?)"
        echo "4. Insufficient system resources"
        echo -e "\nTry: ./scripts/docker-db.sh reset to recreate the container"
    else
        echo -e "${GREEN}Container is running.${NC}"
        
        # Check PostgreSQL server status
        echo -e "\n${YELLOW}PostgreSQL Server Status:${NC}"
        if docker exec $CONTAINER_NAME pg_isready -U $DB_USER -d $DB_NAME 2>/dev/null; then
            echo -e "${GREEN}PostgreSQL server is running and accepting connections.${NC}"
        else
            echo -e "${RED}PostgreSQL server is not responding properly.${NC}"
        fi
        
        # Show PostgreSQL logs from inside container
        echo -e "\n${YELLOW}PostgreSQL Server Logs:${NC}"
        docker exec $CONTAINER_NAME bash -c "cat /var/lib/postgresql/data/logs/* 2>/dev/null || echo 'No PostgreSQL logs found'"
        
        # Check port binding
        echo -e "\n${YELLOW}Port Binding:${NC}"
        docker port $CONTAINER_NAME
        
        # Check if the port is actually in use
        echo -e "\n${YELLOW}Port Usage on Host:${NC}"
        if command -v ss &> /dev/null; then
            ss -tulpn | grep ":$DB_PORT" || echo "Port $DB_PORT doesn't appear to be in use"
        elif command -v netstat &> /dev/null; then
            netstat -tulpn | grep ":$DB_PORT" || echo "Port $DB_PORT doesn't appear to be in use"
        else
            echo "Cannot check port usage: neither ss nor netstat command is available"
        fi
    fi
}

reset_db() {
    echo "WARNING: This will destroy and recreate the database, deleting all data."
    read -p "Are you sure you want to continue? (y/n): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        echo "Stopping and removing PostgreSQL container and volume..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        docker volume rm ${CONTAINER_NAME}_data 2>/dev/null || true
        
        echo "Starting fresh PostgreSQL container..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        echo "Waiting for database to initialize..."
        sleep 5
        
        # Check if container is running
        if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
            echo -e "${RED}Error: Container failed to start after reset. Checking logs...${NC}"
            docker logs $CONTAINER_NAME 2>/dev/null || echo "Cannot fetch logs: Container may not exist"
            exit 1
        fi
        
        # Try to connect to PostgreSQL up to 20 times
        for i in {1..20}; do
            echo "Attempt $i: Checking if PostgreSQL is ready..."
            if docker exec $CONTAINER_NAME pg_isready -U $DB_USER -d $DB_NAME 2>/dev/null; then
                echo -e "${GREEN}Database reset complete and PostgreSQL is ready!${NC}"
                return 0
            fi
            echo "PostgreSQL not ready yet, waiting 3 seconds..."
            sleep 3
        done
        
        echo -e "${RED}Error: Container started but PostgreSQL failed to initialize properly.${NC}"
        docker logs $CONTAINER_NAME 2>/dev/null || echo "Cannot fetch logs: Container may not exist"
    else
        echo "Database reset cancelled."
    fi
}

# Process command
case "$1" in
    start)
        start_db
        ;;
    stop)
        stop_db
        ;;
    restart)
        restart_db
        ;;
    status)
        status_db
        ;;
    logs)
        logs_db
        ;;
    debug)
        debug_db
        ;;
    reset)
        reset_db
        ;;
    *)
        echo "Usage: $0 [start|stop|restart|status|logs|debug|reset]"
        echo ""
        echo "Commands:"
        echo "  start   - Start the PostgreSQL container"
        echo "  stop    - Stop the PostgreSQL container"
        echo "  restart - Restart the PostgreSQL container"
        echo "  status  - Show the container status"
        echo "  logs    - Show the container logs"
        echo "  debug   - Run diagnostic checks on the container"
        echo "  reset   - Reset the database (destroy and recreate)"
        echo ""
        exit 1
        ;;
esac

exit 0
