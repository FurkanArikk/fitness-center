#!/bin/bash

# Verify database structure for fitness_member_db
echo "Verifying database structure for fitness_member_db..."

# Get DB_HOST from environment or use default
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-fitness_user}
DB_PASSWORD=${DB_PASSWORD:-admin}
DB_NAME=${DB_NAME:-fitness_member_db}

# Export PGPASSWORD to avoid password prompt
export PGPASSWORD=$DB_PASSWORD

# Connect to the database and list tables
echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

# Show table counts
echo -e "\nCounting records in tables:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 'members' as table_name, COUNT(*) FROM members UNION ALL
SELECT 'memberships', COUNT(*) FROM memberships UNION ALL
SELECT 'member_memberships', COUNT(*) FROM member_memberships UNION ALL
SELECT 'membership_benefits', COUNT(*) FROM membership_benefits UNION ALL
SELECT 'fitness_assessments', COUNT(*) FROM fitness_assessments
ORDER BY table_name;
"

# Unset PGPASSWORD for security
unset PGPASSWORD
