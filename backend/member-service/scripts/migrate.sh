#!/bin/bash

# Script to manage database migrations for member-service
# Usage: ./scripts/migrate.sh [up|down|reset|status|sample]

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

# Set DB parameters from environment variables with defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${MEMBER_SERVICE_DB_PORT:-5432}"
DB_USER="${DB_USER:-fitness_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"
DB_NAME="${MEMBER_SERVICE_DB_NAME:-fitness_member_db}"

# Function to apply all migrations (up migrations only)
apply_migrations() {
    echo -e "${BLUE}Applying migrations...${NC}"
    
    for migration in ./migrations/*.up.sql; do
        # Skip sample data migration, handle separately
        if [[ "$migration" != *"sample_data"* && "$migration" != *"drop_tables"* ]]; then
            echo -e "${YELLOW}Applying: $(basename "$migration")${NC}"
            if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$migration"; then
                echo -e "${RED}Failed to apply migration: $(basename "$migration")${NC}"
                return 1
            fi
            echo -e "${GREEN}Successfully applied: $(basename "$migration")${NC}"
        fi
    done
    
    echo -e "${GREEN}All migrations applied successfully!${NC}"
    return 0
}

# Function to revert all migrations
revert_migrations() {
    echo -e "${BLUE}Reverting migrations...${NC}"
    
    # Apply down migrations in reverse order
    for migration in $(ls -r ./migrations/*.down.sql); do
        echo -e "${YELLOW}Reverting: $(basename "$migration")${NC}"
        if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$migration"; then
            echo -e "${RED}Failed to revert migration: $(basename "$migration")${NC}"
            return 1
        fi
        echo -e "${GREEN}Successfully reverted: $(basename "$migration")${NC}"
    done
    
    echo -e "${GREEN}All migrations reverted successfully!${NC}"
    return 0
}

# Function to reset database (drop everything and reapply)
reset_database() {
    echo -e "${BLUE}Resetting database...${NC}"
    
    # Apply drop tables migration to ensure clean slate
    if [ -f "./migrations/000_drop_tables.sql" ]; then
        echo -e "${YELLOW}Dropping all existing tables...${NC}"
        if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "./migrations/000_drop_tables.sql"; then
            echo -e "${RED}Failed to drop tables${NC}"
            return 1
        fi
    fi
    
    # Apply all migrations
    if ! apply_migrations; then
        echo -e "${RED}Failed to apply migrations during reset${NC}"
        return 1
    fi
    
    echo -e "${GREEN}Database reset successfully! Tables have been recreated.${NC}"
    echo -e "To load sample data, run: ${YELLOW}./scripts/migrate.sh sample${NC}"
    
    return 0
}

# Function to check migration status
check_status() {
    echo -e "${BLUE}Checking migration status...${NC}"
    
    # Check for each required table
    required_tables=("members" "memberships" "membership_benefits" "member_memberships" "fitness_assessments")
    missing_tables=0
    
    echo -e "${YELLOW}Required tables:${NC}"
    for table in "${required_tables[@]}"; do
        exists=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = '$table')" | xargs)
        
        if [ "$exists" == "t" ]; then
            # Count rows in the table
            row_count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table" | xargs)
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
    
    # Apply sample data migration
    if [ -f "./migrations/002_sample_data.sql" ]; then
        echo -e "${YELLOW}Loading sample data...${NC}"
        if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "./migrations/002_sample_data.sql"; then
            echo -e "${RED}Failed to load sample data${NC}"
            return 1
        fi
        echo -e "${GREEN}Sample data loaded successfully!${NC}"
    else
        echo -e "${RED}Sample data file not found at ./migrations/002_sample_data.sql${NC}"
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