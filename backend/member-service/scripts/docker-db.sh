#!/bin/bash

# Script to manage the Docker-based PostgreSQL database for member-service
# Usage: ./scripts/docker-db.sh [start|stop|restart|status|logs|reset|shell|debug]

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="/home/furkan/work/fitness-center/backend/member-service/.env"

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
CONTAINER_NAME="${MEMBER_SERVICE_CONTAINER_NAME:-fitness-member-db}"
DB_PORT=${MEMBER_SERVICE_DB_PORT:-5432}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${MEMBER_SERVICE_DB_NAME:-fitness_member_db}
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
    if docker ps -a --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        docker start "$CONTAINER_NAME"
    else
        docker-compose up -d postgres
    fi
    
    echo "Waiting for database to be ready..."
    # Wait a bit longer for the container to initialize
    sleep 5
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Error: Failed to start PostgreSQL container.${NC}"
        exit 1
    fi
    
    # Try to connect to PostgreSQL up to 5 times
    for i in {1..5}; do
        if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
            echo -e "${GREEN}Success: PostgreSQL container is running and accepting connections.${NC}"
            return 0
        fi
        sleep 3
        echo "Waiting for PostgreSQL to initialize... (attempt $i/5)"
    done
    
    echo -e "${RED}Error: PostgreSQL container is running but PostgreSQL server failed to start or initialize properly.${NC}"
    echo "Displaying container logs:"
    docker logs "$CONTAINER_NAME"
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
    if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "\n${GREEN}Container is running.${NC}"
        
        # Check PostgreSQL status inside the container
        if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
            echo -e "${GREEN}PostgreSQL server is accepting connections.${NC}"
            
            # Show database size and stats
            echo -e "\n${YELLOW}Database Stats:${NC}"
            docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME')) AS db_size;"
            
            # Count tables
            echo -e "\n${YELLOW}Table Count:${NC}"
            docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT count(*) AS table_count FROM information_schema.tables WHERE table_schema='public';"
        else
            echo -e "${RED}PostgreSQL server is NOT accepting connections.${NC}"
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
    if ! docker ps -a --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Container $CONTAINER_NAME does not exist.${NC}"
        exit 1
    fi
    
    # Check container state
    echo -e "\n${YELLOW}Container State:${NC}"
    docker inspect --format='{{.State.Status}}' "$CONTAINER_NAME"
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "\n${RED}Container is not running.${NC}"
        echo -e "\nTry: ./scripts/docker-db.sh reset to recreate the container"
    else
        echo -e "\n${YELLOW}Container Logs:${NC}"
        docker logs --tail 50 "$CONTAINER_NAME"
        
        echo -e "\n${YELLOW}PostgreSQL Logs:${NC}"
        docker exec "$CONTAINER_NAME" bash -c "cat /var/log/postgresql/postgresql*.log 2>/dev/null || echo 'No PostgreSQL logs found'"
    fi
}

reset_db() {
    echo "WARNING: This will destroy and recreate the database, deleting all data."
    read -p "Are you sure you want to continue? (y/n): " confirm
    
    if [ "$confirm" != "y" ]; then
        echo "Operation cancelled."
        return 0
    fi
    
    echo "Stopping and removing existing container..."
    docker-compose down postgres
    
    echo "Removing PostgreSQL data volume..."
    docker volume rm ${PWD##*/}_postgres_data &> /dev/null || true
    
    echo "Starting fresh PostgreSQL container..."
    docker-compose up -d postgres
    
    echo "Waiting for database to be ready..."
    sleep 10
    
    if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "${GREEN}PostgreSQL container successfully reset.${NC}"
    else
        echo -e "${RED}Failed to reset PostgreSQL container.${NC}"
        exit 1
    fi
}

shell_db() {
    echo "Opening shell in PostgreSQL container..."
    docker exec -it "$CONTAINER_NAME" bash
}

psql_db() {
    echo "Opening PostgreSQL prompt..."
    docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
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
        echo "Usage: $0 {start|stop|restart|status|logs|reset|shell|psql|debug}"
        exit 1
        ;;
esac

exit 0
