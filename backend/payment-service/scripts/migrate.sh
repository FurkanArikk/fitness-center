#!/bin/bash

# Script to manage database migrations for payment-service
# Usage: ./scripts/migrate.sh [sample]

# Load environment variables from the service-specific .env file
SERVICE_ENV_PATH="$(pwd)/.env"

if [ -f "$SERVICE_ENV_PATH" ]; then
    source "$SERVICE_ENV_PATH"
    echo "Loaded environment from: $SERVICE_ENV_PATH"
else
    echo "Warning: No service-specific .env file found at $SERVICE_ENV_PATH"
fi

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set container and DB parameters from environment variables with defaults
CONTAINER_NAME=${PAYMENT_SERVICE_CONTAINER_NAME:-fitness-payment-db}
DB_USER=${DB_USER:-fitness_user}
DB_NAME=${PAYMENT_SERVICE_DB_NAME:-fitness_payment_db}

# Function to load sample data
load_sample_data() {
    echo -e "${BLUE}Loading sample data...${NC}"
    
    # First check if container is running
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Container $CONTAINER_NAME is not running. Please start it first.${NC}"
        return 1
    fi
    
    # Apply sample data migration
    if [ -f "./migrations/000004_sample_data.up.sql" ]; then
        echo -e "${YELLOW}Loading sample data...${NC}"
        if ! docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "./migrations/000004_sample_data.up.sql"; then
            echo -e "${RED}Failed to load sample data${NC}"
            return 1
        fi
        echo -e "${GREEN}Sample data loaded successfully!${NC}"
    else
        echo -e "${RED}Sample data file not found at ./migrations/000004_sample_data.up.sql${NC}"
        return 1
    fi
    
    return 0
}

# Main script logic
case "$1" in
    "sample")
        load_sample_data
        ;;
    *)
        echo "Usage: $0 [sample]"
        echo ""
        echo "Commands:"
        echo "  sample    Load sample data into the database"
        exit 1
        ;;
esac

exit $?
    echo -e "${BLUE}Checking migration status...${NC}"
    
    # First check if container is running
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Container $CONTAINER_NAME is not running. Please start it first.${NC}"
        echo -e "You can use: ${YELLOW}./scripts/docker-db.sh start${NC}"
        return 1
    fi
    
    # Check for each required table
    required_tables=("payments" "payment_types" "payment_transactions")
    missing_tables=0
    
    echo -e "${YELLOW}Required tables:${NC}"
    for table in "${required_tables[@]}"; do
        exists=$(docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = '$table')" | xargs)
        
        if [ "$exists" == "t" ]; then
            # Count rows in the table
            row_count=$(docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table" | xargs)
            echo -e "${GREEN}✓ $table${NC} (rows: $row_count)"
        else
            echo -e "${RED}✗ $table${NC} (missing)"
            missing_tables=$((missing_tables + 1))
        fi
    done
    
    # Overall status
    if [ $missing_tables -eq 0 ]; then
        echo -e "\n${GREEN}Database schema is complete!${NC}"
    else
        echo -e "\n${RED}Database schema is incomplete! $missing_tables tables are missing.${NC}"
        echo -e "To apply migrations, run: ${YELLOW}./scripts/migrate.sh up${NC}"
        return 1
    fi
    
    return 0
}

# Function to load sample data
load_sample_data() {
    echo -e "${BLUE}Loading sample data...${NC}"
    
    # First check if container is running
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Container $CONTAINER_NAME is not running. Please start it first.${NC}"
        echo -e "You can use: ${YELLOW}./scripts/docker-db.sh start${NC}"
        return 1
    fi
    
    # Apply sample data migration
    if [ -f "./migrations/000004_sample_data.up.sql" ]; then
        echo -e "${YELLOW}Loading sample data...${NC}"
        if ! docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "./migrations/000004_sample_data.up.sql"; then
            echo -e "${RED}Failed to load sample data${NC}"
            return 1
        fi
        echo -e "${GREEN}Sample data loaded successfully!${NC}"
    else
        echo -e "${RED}Sample data file not found at ./migrations/000004_sample_data.up.sql${NC}"
        return 1
    fi
    
    return 0
}

# Main script logic
case "$1" in
    "up")
        apply_migrations
        ;;
    "down")
        revert_migrations
        ;;
    "reset")
        reset_database
        ;;
    "status")
        check_status
        ;;
    "sample")
        load_sample_data
        ;;
    *)
        echo "Usage: $0 [up|down|reset|status|sample]"
        echo ""
        echo "Commands:"
        echo "  up     - Apply all migrations"
        echo "  down   - Revert all migrations"
        echo "  reset  - Reset database (drop everything and reapply migrations)"
        echo "  status - Check migration status"
        echo "  sample - Load sample data"
        exit 1
        ;;
esac

exit $?
