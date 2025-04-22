#!/bin/bash

# Script to manage the Docker-based PostgreSQL database for member-service
# Usage: ./scripts/docker-db.sh [start|stop|restart|status|logs|reset|shell|debug]

# Exit on error
set -e

# Move to the project root directory (where docker-compose.yml is located)
cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Command functions
start_db() {
    echo "Starting PostgreSQL container..."
    
    # First check if container already exists but is stopped
    if docker ps -a --format '{{.Names}}' | grep -q "fitness-member-db"; then
        echo -e "${YELLOW}Container exists but is not running. Starting existing container...${NC}"
        docker start fitness-member-db
    else
        echo "Creating and starting new container..."
        docker-compose up -d postgres
    fi
    
    echo "Waiting for database to be ready..."
    # Wait a bit longer for the container to initialize
    sleep 5
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "fitness-member-db"; then
        echo -e "${RED}Error: Container failed to start. Checking logs...${NC}"
        docker logs fitness-member-db
        echo -e "${RED}Container might have failed during initialization. See logs above.${NC}"
        exit 1
    fi
    
    # Try to connect to PostgreSQL up to 5 times
    for i in {1..5}; do
        echo "Attempt $i: Checking if PostgreSQL is ready..."
        if docker exec fitness-member-db pg_isready -U fitness_user -d fitness_member_db; then
            echo -e "${GREEN}PostgreSQL is running and ready!${NC}"
            echo "You can connect with:"
            echo "  ./scripts/db-connect.sh"
            echo "Or using the environment host:"
            echo "  DB_HOST=localhost DB_PORT=5432 ./scripts/db-connect.sh"
            return 0
        fi
        echo "PostgreSQL not ready yet, waiting 3 seconds..."
        sleep 3
    done
    
    echo -e "${RED}Error: PostgreSQL container is running but PostgreSQL server failed to start or initialize properly.${NC}"
    echo "Displaying container logs:"
    docker logs fitness-member-db
    exit 1
}

stop_db() {
    echo "Stopping PostgreSQL container..."
    docker-compose stop postgres
    echo "PostgreSQL container stopped."
}

restart_db() {
    stop_db
    start_db
}

status_db() {
    echo "PostgreSQL container status:"
    docker-compose ps postgres
    
    # Add more detailed status info
    if docker ps --format '{{.Names}}' | grep -q "fitness-member-db"; then
        echo -e "\n${GREEN}Container is running.${NC}"
        echo "Checking PostgreSQL server status inside container..."
        if docker exec fitness-member-db pg_isready -U fitness_user -d fitness_member_db; then
            echo -e "${GREEN}PostgreSQL server is running properly.${NC}"
        else
            echo -e "${RED}PostgreSQL server is not responding inside the container.${NC}"
        fi
    else
        echo -e "\n${RED}Container is not running.${NC}"
    fi
}

logs_db() {
    echo "PostgreSQL container logs:"
    docker-compose logs postgres
}

debug_db() {
    echo "Running diagnostic checks on PostgreSQL container..."
    
    # Check if the container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "fitness-member-db"; then
        echo -e "${RED}Container does not exist. Try starting it first.${NC}"
        exit 1
    fi
    
    # Check container state
    echo -e "\n${YELLOW}Container State:${NC}"
    docker inspect --format='{{.State.Status}}' fitness-member-db
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "fitness-member-db"; then
        echo -e "${RED}Container exists but is not running.${NC}"
        echo -e "\n${YELLOW}Container Exit Code:${NC}"
        docker inspect --format='{{.State.ExitCode}}' fitness-member-db
        
        echo -e "\n${YELLOW}Container Error:${NC}"
        docker inspect --format='{{.State.Error}}' fitness-member-db
        
        echo -e "\n${YELLOW}Last 50 lines of container logs:${NC}"
        docker logs --tail 50 fitness-member-db
        
        echo -e "\n${YELLOW}Possible issues:${NC}"
        echo "1. Permission problems with mounted volumes"
        echo "2. PostgreSQL configuration issues"
        echo "3. Port conflicts (is port 5432 already in use?)"
        echo "4. Insufficient system resources"
        echo -e "\nTry: ./scripts/docker-db.sh reset to recreate the container"
    else
        echo -e "${GREEN}Container is running.${NC}"
        
        # Check PostgreSQL server status
        echo -e "\n${YELLOW}PostgreSQL Server Status:${NC}"
        if docker exec fitness-member-db pg_isready -U fitness_user -d fitness_member_db; then
            echo -e "${GREEN}PostgreSQL server is running and accepting connections.${NC}"
        else
            echo -e "${RED}PostgreSQL server is not responding properly.${NC}"
        fi
        
        # Show PostgreSQL logs from inside container
        echo -e "\n${YELLOW}PostgreSQL Server Logs:${NC}"
        docker exec fitness-member-db bash -c "cat /var/log/postgresql/postgresql*.log 2>/dev/null || echo 'No PostgreSQL logs found'"
    fi
}

reset_db() {
    echo "WARNING: This will destroy and recreate the database, deleting all data."
    read -p "Are you sure you want to continue? (y/n): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        echo "Stopping and removing PostgreSQL container and volume..."
        docker-compose down -v --remove-orphans
        echo "Starting fresh PostgreSQL container..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        echo "Waiting for database to initialize..."
        sleep 5
        
        # Check if container is running
        if ! docker ps --format '{{.Names}}' | grep -q "fitness-member-db"; then
            echo -e "${RED}Error: Container failed to start after reset. Checking logs...${NC}"
            docker logs fitness-member-db
            exit 1
        fi
        
        # Try to connect to PostgreSQL up to 5 times
        for i in {1..5}; do
            echo "Attempt $i: Checking if PostgreSQL is ready..."
            if docker exec fitness-member-db pg_isready -U fitness_user -d fitness_member_db; then
                echo -e "${GREEN}Database reset complete and PostgreSQL is ready!${NC}"
                return 0
            fi
            echo "PostgreSQL not ready yet, waiting 3 seconds..."
            sleep 3
        done
        
        echo -e "${RED}Error: Container started but PostgreSQL failed to initialize properly.${NC}"
        docker logs fitness-member-db
    else
        echo "Database reset cancelled."
    fi
}

shell_db() {
    echo "Opening a shell in the PostgreSQL container..."
    if ! docker ps --format '{{.Names}}' | grep -q "fitness-member-db"; then
        echo -e "${RED}Error: Container is not running. Start it first.${NC}"
        exit 1
    fi
    docker-compose exec postgres bash
}

psql_db() {
    echo "Opening psql in the PostgreSQL container..."
    if ! docker ps --format '{{.Names}}' | grep -q "fitness-member-db"; then
        echo -e "${RED}Error: Container is not running. Start it first.${NC}"
        exit 1
    fi
    docker-compose exec postgres psql -U fitness_user -d fitness_member_db
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
    shell)
        shell_db
        ;;
    psql)
        psql_db
        ;;
    *)
        echo "Usage: $0 [start|stop|restart|status|logs|debug|reset|shell|psql]"
        echo ""
        echo "Commands:"
        echo "  start   - Start the PostgreSQL container"
        echo "  stop    - Stop the PostgreSQL container"
        echo "  restart - Restart the PostgreSQL container"
        echo "  status  - Show the container status"
        echo "  logs    - Show the container logs"
        echo "  debug   - Run diagnostic checks on the container"
        echo "  reset   - Reset the database (destroy and recreate)"
        echo "  shell   - Open a bash shell in the container"
        echo "  psql    - Open a PostgreSQL shell in the container"
        echo ""
        exit 1
        ;;
esac

exit 0
