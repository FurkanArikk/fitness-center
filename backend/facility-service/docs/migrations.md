# Database Migrations Guide

This document explains the database migration files in the Facility Service.

## Migration Files

The Facility Service uses SQL migration files to create and maintain the database schema. These files are located in the `/migrations` directory:

### 1. Equipment Table
- `000001_create_equipment_table.up.sql`: Creates the equipment table
- `000001_create_equipment_table.down.sql`: Drops the equipment table

### 2. Facilities Table
- `000002_create_facilities_table.up.sql`: Creates the facilities table
- `000002_create_facilities_table.down.sql`: Drops the facilities table

### 3. Attendance Table
- `000003_create_attendance_table.up.sql`: Creates the attendance table
- `000003_create_attendance_table.down.sql`: Drops the attendance table

### 4. Sample Data
- `000004_sample_data.up.sql`: Inserts sample data into the tables
- `000_drop_tables.sql`: Utility script to drop all tables (for clean reset)

## Schema Details

### Equipment Table
```sql
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  manufacturer VARCHAR(100),
  model_number VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Facilities Table
```sql
CREATE TABLE IF NOT EXISTS facilities (
  facility_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  capacity INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  opening_hour TIME NOT NULL,
  closing_hour TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Attendance Table
```sql
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL,
  facility_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (facility_id) REFERENCES facilities (facility_id) ON DELETE RESTRICT
);
```

## Running Migrations Manually

You can run migrations manually using the scripts provided:

```bash
# Reset the database and run all migrations including sample data
./scripts/docker-db.sh reset
DB_HOST=localhost DB_PORT=5435 DB_USER=fitness_user DB_PASSWORD=admin DB_NAME=fitness_facility_db ./scripts/db-connect.sh -f ./migrations/000001_create_equipment_table.up.sql
DB_HOST=localhost DB_PORT=5435 DB_USER=fitness_user DB_PASSWORD=admin DB_NAME=fitness_facility_db ./scripts/db-connect.sh -f ./migrations/000002_create_facilities_table.up.sql
DB_HOST=localhost DB_PORT=5435 DB_USER=fitness_user DB_PASSWORD=admin DB_NAME=fitness_facility_db ./scripts/db-connect.sh -f ./migrations/000003_create_attendance_table.up.sql
DB_HOST=localhost DB_PORT=5435 DB_USER=fitness_user DB_PASSWORD=admin DB_NAME=fitness_facility_db ./scripts/db-connect.sh -f ./migrations/000004_sample_data.up.sql
```

## Verifying Migration

After running migrations, verify the database structure:

```bash
DB_HOST=localhost DB_PORT=5435 DB_USER=fitness_user DB_PASSWORD=admin DB_NAME=fitness_facility_db ./scripts/verify_db.sh
```
