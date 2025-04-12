#!/bin/bash

# Load environment variables from .env file
if [ -f ../.env ]; then
  source ../.env
else
  echo "Error: .env file not found in parent directory"
  exit 1
fi

# Default values if not set in .env
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-your_password}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Database names
MEMBER_SERVICE_DB=${MEMBER_SERVICE_DB_NAME:-fitness_member_db}
PAYMENT_SERVICE_DB=${PAYMENT_SERVICE_DB_NAME:-fitness_payment_db}
FACILITY_SERVICE_DB=${FACILITY_SERVICE_DB_NAME:-fitness_facility_db}
CLASS_SERVICE_DB=${CLASS_SERVICE_DB_NAME:-fitness_class_db}
STAFF_SERVICE_DB=${STAFF_SERVICE_DB_NAME:-fitness_staff_db}

echo "Creating databases for Fitness Center microservices..."

# Function to create a PostgreSQL database
create_database() {
  local db_name=$1
  
  echo "Creating database: $db_name"
  
  # Check if database exists
  if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$db_name'" | grep -q 1; then
    echo "Database $db_name already exists"
  else
    sudo -u postgres psql -c "CREATE DATABASE $db_name;"
    echo "Database $db_name created successfully"
  fi
  
  # Grant permissions to the user
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $db_name TO $DB_USER;"
}

# Check if the database user exists, create if it doesn't
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  echo "Creating database user: $DB_USER"
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
  sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;"
else
  echo "Database user $DB_USER already exists"
fi

# Create each database
create_database "$MEMBER_SERVICE_DB"
create_database "$PAYMENT_SERVICE_DB"
create_database "$FACILITY_SERVICE_DB"
create_database "$CLASS_SERVICE_DB"
create_database "$STAFF_SERVICE_DB"

echo "Database setup completed successfully!"
