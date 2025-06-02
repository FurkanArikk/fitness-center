# Facility Service Database Schema

The Facility Service uses PostgreSQL as its database with three main tables handling facilities, equipment, and attendance data. The schema includes proper indexing, foreign key constraints, and automated triggers for optimal performance.

## Database Configuration

- **Database Name**: `fitness_facility_db`
- **User**: `facility_user`
- **Port**: `5432`
- **Character Set**: UTF-8
- **Timezone**: UTC

## Tables

### facilities

This table stores information about physical spaces in the fitness center.

| Column       | Type                     | Constraints              | Description                                   |
|--------------|--------------------------|--------------------------|-----------------------------------------------|
| facility_id  | SERIAL                   | PRIMARY KEY              | Auto-incrementing unique identifier           |
| name         | VARCHAR(50)              | NOT NULL, UNIQUE         | Facility name (must be unique)                |
| description  | VARCHAR(255)             | NULL                     | Description of the facility                   |
| capacity     | INTEGER                  | NOT NULL                 | Maximum capacity of the facility              |
| status       | VARCHAR(20)              | NOT NULL, DEFAULT 'active' | Current status (active, maintenance, closed)  |
| opening_hour | TIME                     | NOT NULL                 | Opening hour of the facility                  |
| closing_hour | TIME                     | NOT NULL                 | Closing hour of the facility                  |
| created_at   | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()            | Record creation timestamp                     |
| updated_at   | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()            | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `facility_id`
- UNIQUE constraint on `name` (unique_facility_name)
- Index on `status` (idx_facilities_status)
- Index on `name` (idx_facilities_name)

**Valid Status Values:**
- `active` - Facility is operational
- `maintenance` - Facility is under maintenance
- `closed` - Facility is temporarily closed

### equipment

This table stores information about fitness equipment available at the facility with complete lifecycle tracking.

| Column                | Type                     | Constraints              | Description                                   |
|-----------------------|--------------------------|--------------------------|-----------------------------------------------|
| equipment_id          | SERIAL                   | PRIMARY KEY              | Auto-incrementing unique identifier           |
| name                  | VARCHAR(100)             | NOT NULL                 | Equipment name                                |
| description           | VARCHAR(255)             | NULL                     | Description of the equipment                  |
| category              | VARCHAR(50)              | NOT NULL                 | Category of equipment                         |
| purchase_date         | DATE                     | NULL                     | Date of purchase                              |
| purchase_price        | DECIMAL(10,2)            | NULL                     | Purchase price in currency units             |
| manufacturer          | VARCHAR(100)             | NULL                     | Equipment manufacturer                        |
| model_number          | VARCHAR(50)              | NULL                     | Model number or identifier                    |
| status                | VARCHAR(20)              | NOT NULL, DEFAULT 'active' | Equipment status                              |
| last_maintenance_date | DATE                     | NULL                     | Date of last maintenance                      |
| next_maintenance_date | DATE                     | NULL                     | Scheduled date for next maintenance           |
| created_at            | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()            | Record creation timestamp                     |
| updated_at            | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()            | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `equipment_id`
- Index on `category` (idx_equipment_category)
- Index on `status` (idx_equipment_status)
- Index on `next_maintenance_date` (for maintenance queries)

**Valid Status Values:**
- `active` - Equipment is operational
- `maintenance` - Equipment is under maintenance
- `out-of-order` - Equipment is broken/non-functional

**Valid Categories:**
- `cardio` - Cardio equipment (treadmills, bikes, etc.)
- `strength` - Strength training equipment
- `free-weights` - Free weights and dumbbells
- `functional` - Functional training equipment
- `other` - Other equipment types

### attendance

This table records member visits and facility usage with detailed tracking capabilities.

| Column         | Type                     | Constraints              | Description                                   |
|----------------|--------------------------|--------------------------|-----------------------------------------------|
| attendance_id  | SERIAL                   | PRIMARY KEY              | Auto-incrementing unique identifier           |
| member_id      | INTEGER                  | NOT NULL                 | Member identifier (from member service)      |
| check_in_time  | TIMESTAMP WITH TIME ZONE | NOT NULL                 | Time when member checked in                   |
| check_out_time | TIMESTAMP WITH TIME ZONE | NULL                     | Time when member checked out (optional)       |
| date           | DATE                     | NOT NULL                 | Date of visit (auto-set from check_in_time)  |
| facility_id    | INTEGER                  | NOT NULL, FK             | Reference to facilities table                 |
| created_at     | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()            | Record creation timestamp                     |
| updated_at     | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()            | Record last update timestamp                  |

**Constraints:**
- FOREIGN KEY `facility_id` REFERENCES `facilities(facility_id)` ON DELETE RESTRICT
- Note: `member_id` is not enforced with FK as members are in a different service

**Indexes:**
- PRIMARY KEY on `attendance_id`
- Index on `member_id` (idx_attendance_member_id)
- Index on `facility_id` (idx_attendance_facility_id)
- Index on `date` (idx_attendance_date)
- Index on `check_in_time` (idx_attendance_check_in)

**Triggers:**
- `trg_set_attendance_date` - Automatically sets the `date` field based on `check_in_time` before insert

## Migration Files

The database schema is managed through migration files:

1. `000001_create_equipment_table.up.sql` - Creates equipment table
2. `000002_create_facilities_table.up.sql` - Creates facilities table
3. `000003_create_attendance_table.up.sql` - Creates attendance table with triggers
4. `000004_add_soft_delete_to_facilities.up.sql` - Adds soft delete functionality
5. `000004_sample_data.sql` - Loads sample data for testing

## Performance Considerations

- All timestamp fields use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- Strategic indexing on frequently queried fields (status, date, IDs)
- Foreign key constraints ensure data integrity
- Automatic date field population reduces application complexity
- Soft delete capability for facilities (if implemented)

## Data Relationships

```
facilities (1) ──── (N) attendance
    │
    └── facility_id (FK in attendance)

member_service.members (1) ──── (N) attendance
    │
    └── member_id (logical FK, not enforced)
```

Equipment table is independent and not directly related to other tables, allowing for flexible equipment management across all facilities.
- Index on `next_maintenance_date`

### attendance

This table stores records of member visits to facilities.

| Column         | Type                     | Description                                   |
|----------------|--------------------------|-----------------------------------------------|
| attendance_id  | SERIAL                   | Primary key                                   |
| member_id      | INTEGER                  | Reference to members table (in member service)|
| check_in_time  | TIMESTAMP WITH TIME ZONE | Time when member checked in                   |
| check_out_time | TIMESTAMP WITH TIME ZONE | Time when member checked out (can be null)    |
| date           | DATE                     | Date of the visit                             |
| facility_id    | INTEGER                  | Reference to facilities table                 |
| created_at     | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at     | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Constraints:**
- PRIMARY KEY on `attendance_id`
- FOREIGN KEY on `facility_id` REFERENCES `facilities(facility_id)` ON DELETE RESTRICT

**Indexes:**
- Index on `member_id`
- Index on `facility_id`
- Index on `date`
- Index on `check_in_time`

## Relationships

1. A **Facility** can have multiple **Attendance** records (one-to-many)
2. A **Member** (from member-service) can have multiple **Attendance** records (one-to-many)

## Entity-Relationship Diagram

```
+------------+       +------------------+
|            |       |                  |
| facilities |------>|    attendance    |
|            |       |                  |
+------------+       +------------------+
                              ^
                              |
                              |
                      +----------------+
                      |                |
                      |    members     |
                      |  (external)    |
                      |                |
                      +----------------+


+------------+
|            |
| equipment  |
|            |
+------------+
```
