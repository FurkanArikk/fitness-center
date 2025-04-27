#!/bin/bash

# Verify database structure for fitness_payment_db
echo "Verifying database structure for fitness_payment_db..."

# Get DB_HOST from environment or use default
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${PAYMENT_SERVICE_DB_PORT:-5434}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${PAYMENT_SERVICE_DB_NAME:-fitness_payment_db}

# Export PGPASSWORD to avoid password prompt
export PGPASSWORD=$DB_PASSWORD

# Connect to the database and list tables
echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

# Show table counts
echo -e "\nCounting records in tables:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 'payments' as table_name, COUNT(*) FROM payments UNION ALL
SELECT 'payment_types', COUNT(*) FROM payment_types UNION ALL
SELECT 'payment_transactions', COUNT(*) FROM payment_transactions
ORDER BY table_name;
"

# Unset PGPASSWORD for security
unset PGPASSWORD
