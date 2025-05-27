#!/bin/bash

# Database management script for auth-service
# This script provides database operations for the auth service

set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Set default values
AUTH_SERVICE_DB_HOST=${AUTH_SERVICE_DB_HOST:-localhost}
AUTH_SERVICE_DB_PORT=${AUTH_SERVICE_DB_PORT:-5437}
AUTH_SERVICE_DB_NAME=${AUTH_SERVICE_DB_NAME:-fitness_auth}
AUTH_SERVICE_DB_USER=${AUTH_SERVICE_DB_USER:-postgres}
AUTH_SERVICE_DB_PASSWORD=${AUTH_SERVICE_DB_PASSWORD:-postgres}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if PostgreSQL is running
check_postgres() {
    print_info "Checking PostgreSQL connection..."
    if ! PGPASSWORD=$AUTH_SERVICE_DB_PASSWORD psql -h $AUTH_SERVICE_DB_HOST -p $AUTH_SERVICE_DB_PORT -U $AUTH_SERVICE_DB_USER -d postgres -c '\q' 2>/dev/null; then
        print_error "Cannot connect to PostgreSQL. Make sure it's running and accessible."
        return 1
    fi
    print_info "PostgreSQL connection successful"
}

# Function to create database
create_database() {
    print_info "Creating database '$AUTH_SERVICE_DB_NAME'..."
    PGPASSWORD=$AUTH_SERVICE_DB_PASSWORD psql -h $AUTH_SERVICE_DB_HOST -p $AUTH_SERVICE_DB_PORT -U $AUTH_SERVICE_DB_USER -d postgres -c "CREATE DATABASE $AUTH_SERVICE_DB_NAME;" 2>/dev/null || {
        print_warning "Database '$AUTH_SERVICE_DB_NAME' may already exist"
    }
}

# Function to drop database
drop_database() {
    print_warning "Dropping database '$AUTH_SERVICE_DB_NAME'..."
    read -p "Are you sure you want to drop the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PGPASSWORD=$AUTH_SERVICE_DB_PASSWORD psql -h $AUTH_SERVICE_DB_HOST -p $AUTH_SERVICE_DB_PORT -U $AUTH_SERVICE_DB_USER -d postgres -c "DROP DATABASE IF EXISTS $AUTH_SERVICE_DB_NAME;"
        print_info "Database '$AUTH_SERVICE_DB_NAME' dropped"
    else
        print_info "Database drop cancelled"
    fi
}

# Function to run migrations
run_migrations() {
    print_info "Running database migrations..."
    
    if [ ! -d "migrations" ]; then
        print_error "Migrations directory not found. Please run from auth-service root directory."
        return 1
    fi
    
    # Run only .up.sql migration files in order
    for migration_file in migrations/*up.sql; do
        if [ -f "$migration_file" ]; then
            print_info "Running migration: $(basename $migration_file)"
            PGPASSWORD=$AUTH_SERVICE_DB_PASSWORD psql -h $AUTH_SERVICE_DB_HOST -p $AUTH_SERVICE_DB_PORT -U $AUTH_SERVICE_DB_USER -d $AUTH_SERVICE_DB_NAME -f "$migration_file"
            if [ $? -ne 0 ]; then
                print_error "Migration failed: $(basename $migration_file)"
                return 1
            fi
        fi
    done
    
    print_info "Migrations completed successfully"
}

# Function to reset database
reset_database() {
    print_warning "This will drop and recreate the database with fresh migrations"
    read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        drop_database
        create_database
        run_migrations
        print_info "Database reset completed"
    else
        print_info "Database reset cancelled"
    fi
}

# Function to backup database
backup_database() {
    backup_file="auth-service-backup-$(date +%Y%m%d_%H%M%S).sql"
    print_info "Creating backup: $backup_file"
    
    PGPASSWORD=$AUTH_SERVICE_DB_PASSWORD pg_dump -h $AUTH_SERVICE_DB_HOST -p $AUTH_SERVICE_DB_PORT -U $AUTH_SERVICE_DB_USER -d $AUTH_SERVICE_DB_NAME > "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_info "Backup created successfully: $backup_file"
    else
        print_error "Backup failed"
        return 1
    fi
}

# Function to restore database from backup
restore_database() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file path"
        echo "Usage: $0 restore <backup_file>"
        return 1
    fi
    
    backup_file="$1"
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_warning "This will restore the database from backup. Current data will be lost."
    read -p "Are you sure you want to restore from backup? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        drop_database
        create_database
        print_info "Restoring from backup: $backup_file"
        PGPASSWORD=$AUTH_SERVICE_DB_PASSWORD psql -h $AUTH_SERVICE_DB_HOST -p $AUTH_SERVICE_DB_PORT -U $AUTH_SERVICE_DB_USER -d $AUTH_SERVICE_DB_NAME < "$backup_file"
        print_info "Database restore completed"
    else
        print_info "Database restore cancelled"
    fi
}

# Function to show database status
show_status() {
    print_info "Database Status:"
    echo "Host: $AUTH_SERVICE_DB_HOST"
    echo "Port: $AUTH_SERVICE_DB_PORT"
    echo "Database: $AUTH_SERVICE_DB_NAME"
    echo "User: $AUTH_SERVICE_DB_USER"
    echo ""
    
    print_info "Tables in database:"
    PGPASSWORD=$AUTH_SERVICE_DB_PASSWORD psql -h $AUTH_SERVICE_DB_HOST -p $AUTH_SERVICE_DB_PORT -U $AUTH_SERVICE_DB_USER -d $AUTH_SERVICE_DB_NAME -c "\dt" 2>/dev/null || {
        print_warning "Could not list tables. Database may not exist or be accessible."
    }
}

# Function to show help
show_help() {
    echo "Auth Service Database Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check       Check PostgreSQL connection"
    echo "  create      Create the database"
    echo "  drop        Drop the database"
    echo "  migrate     Run database migrations"
    echo "  reset       Drop, create, and run migrations"
    echo "  backup      Create a database backup"
    echo "  restore     Restore database from backup"
    echo "  status      Show database status and tables"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 migrate              # Run migrations"
    echo "  $0 reset               # Reset database"
    echo "  $0 backup              # Create backup"
    echo "  $0 restore backup.sql  # Restore from backup"
}

# Main script logic
case "${1:-help}" in
    check)
        check_postgres
        ;;
    create)
        check_postgres && create_database
        ;;
    drop)
        check_postgres && drop_database
        ;;
    migrate)
        check_postgres && create_database && run_migrations
        ;;
    reset)
        check_postgres && reset_database
        ;;
    backup)
        check_postgres && backup_database
        ;;
    restore)
        check_postgres && restore_database "$2"
        ;;
    status)
        check_postgres && show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
