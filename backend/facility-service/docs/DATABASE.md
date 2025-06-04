# Facility Service Database Schema

The Facility Service uses PostgreSQL as its database with GORM as the ORM layer. Below is the detailed schema for the tables used in this service.

## Database Configuration

- **Database Name**: `fitness_facility_db` (default)
- **Port**: 5436 (default for facility service)
- **Schema**: Uses GORM auto-migration
- **Connection**: PostgreSQL with SSL disabled for development

## Tables

### facilities

This table stores information about physical spaces in the fitness center.

| Column       | Type                     | Description                                   | GORM Tags                           |
|--------------|--------------------------|-----------------------------------------------|-------------------------------------|
| facility_id  | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| name         | VARCHAR(100)             | Facility name (must be unique)                | `type:varchar(100);unique;not null` |
| description  | VARCHAR(255)             | Description of the facility                   | `type:varchar(255)`                 |
| capacity     | INTEGER                  | Maximum capacity of the facility              | `not null`                          |
| status       | VARCHAR(20)              | Current status (active, maintenance, closed)  | `type:varchar(20);default:'active'` |
| opening_hour | TIME                     | Opening hour of the facility                  | `type:time;not null`                |
| closing_hour | TIME                     | Closing hour of the facility                  | `type:time;not null`                |
| is_deleted   | BOOLEAN                  | Soft delete flag                              | `default:false`                     |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `facility_id`
- UNIQUE constraint on `name` (unique_facility_name)
- Index on `status` for status-based filtering
- Index on `name` for name-based queries
- Index on `is_deleted` for soft delete filtering

**Valid Status Values:**
- `active` - Facility is operational
- `maintenance` - Facility is under maintenance
- `closed` - Facility is temporarily closed

### equipment

This table stores information about fitness equipment available at the facility with complete lifecycle tracking.

| Column                | Type                     | Description                                   | GORM Tags                           |
|-----------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| equipment_id          | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| name                  | VARCHAR(100)             | Equipment name                                | `type:varchar(100);not null`        |
| description           | VARCHAR(255)             | Description of the equipment                  | `type:varchar(255)`                 |
| category              | VARCHAR(50)              | Category of equipment                         | `type:varchar(50);not null`         |
| purchase_date         | DATE                     | Date of purchase                              | `type:date;not null`                |
| purchase_price        | DECIMAL(10,2)            | Purchase price in currency units             | `type:decimal(10,2);not null`       |
| manufacturer          | VARCHAR(100)             | Equipment manufacturer                        | `type:varchar(100)`                 |
| model_number          | VARCHAR(50)              | Model number or identifier                    | `type:varchar(50)`                  |
| status                | VARCHAR(20)              | Equipment status                              | `type:varchar(20);default:'active'` |
| last_maintenance_date | DATE                     | Date of last maintenance                      | `type:date`                         |
| next_maintenance_date | DATE                     | Scheduled date for next maintenance           | `type:date`                         |
| created_at            | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at            | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `equipment_id`
- Index on `category` for category-based filtering
- Index on `status` for status-based queries
- Index on `next_maintenance_date` for maintenance scheduling
- Index on `name` for name-based searches

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

| Column         | Type                     | Description                                   | GORM Tags                           |
|----------------|--------------------------|-----------------------------------------------|-------------------------------------|
| attendance_id  | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| member_id      | BIGINT                   | Member identifier (from member service)      | `not null`                          |
| check_in_time  | TIMESTAMP WITH TIME ZONE | Time when member checked in                   | `not null`                          |
| check_out_time | TIMESTAMP WITH TIME ZONE | Time when member checked out (optional)       | Optional field                      |
| date           | DATE                     | Date of visit (auto-set from check_in_time)  | `not null`                          |
| facility_id    | BIGINT                   | Reference to facilities table                 | `not null`                          |
| created_at     | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at     | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `attendance_id`
- FOREIGN KEY on `facility_id` REFERENCES `facilities(facility_id)` ON DELETE RESTRICT
- Index on `member_id` for member-based queries
- Index on `facility_id` for facility-based queries
- Index on `date` for date-based filtering
- Index on `check_in_time` for time-based queries

**Note:** `member_id` is not enforced with FK as members are in a different service

## Relationships

The database follows a normalized relational structure with the following relationships:

1. **Facilities → Attendance** (One-to-Many)
   - Each facility can have multiple attendance records
   - Attendance records are linked via `facility_id` foreign key
   - RESTRICT delete: cannot remove facility with attendance records

2. **Member → Attendance** (One-to-Many)
   - Each member can have multiple attendance records
   - Attendance records reference external member service via `member_id`
   - No foreign key constraint (cross-service reference)

3. **Equipment** (Independent)
   - Equipment table is independent and not directly related to other tables
   - Allows for flexible equipment management across all facilities

## GORM Model Relationships

The Go models use GORM associations to represent relationships:

```go
// Facility can have multiple attendance records
type Facility struct {
    // ... fields
    AttendanceRecords []Attendance `gorm:"foreignKey:FacilityID"`
}

// Attendance belongs to a facility
type Attendance struct {
    // ... fields
    Facility *Facility `gorm:"foreignKey:FacilityID"`
}

// Equipment is independent (no direct relationships)
type Equipment struct {
    // ... fields only
}
```

## Entity-Relationship Diagram

```
                    ┌─────────────────┐
                    │   facilities    │
                    │                 │
                    │ facility_id (PK)│◄─────────┐
                    │ name (UQ)       │          │
                    │ description     │          │
                    │ capacity        │          │
                    │ status          │          │
                    │ opening_hour    │          │
                    │ closing_hour    │          │
                    │ is_deleted      │          │
                    │ ...             │          │
                    └─────────────────┘          │
                            │                    │
                            │ 1:N                │
                            ▼                    │
                ┌─────────────────────────┐      │
                │      attendance         │      │
                │                         │      │
                │ attendance_id (PK)      │      │
                │ member_id               │──────┼─────┐
                │ check_in_time           │      │     │
                │ check_out_time          │      │     │
                │ date                    │      │     │
                │ facility_id (FK)        │──────┘     │
                │ ...                     │            │
                └─────────────────────────┘            │
                                                       │
                ┌─────────────────────────┐            │
                │     equipment           │            │ N:1 (external)
                │                         │            │
                │ equipment_id (PK)       │            │
                │ name                    │            ▼
                │ category                │  ┌─────────────────────────┐
                │ status                  │  │   members (external)    │
                │ purchase_date           │  │                         │
                │ last_maintenance_date   │  │ member_id               │
                │ next_maintenance_date   │  │ (from member service)   │
                │ ...                     │  └─────────────────────────┘
                └─────────────────────────┘
```

## Data Types and Constraints

### Field Validation Rules

- **Facility Name**: VARCHAR(100), unique, required
- **Status Fields**: Enumerated values (active/maintenance/closed, active/maintenance/out-of-order)
- **Capacity**: INTEGER, required, must be positive
- **Time Fields**: TIME type, HH:MM format for facility hours
- **Date Fields**: DATE type for maintenance scheduling
- **Price Fields**: DECIMAL(10,2) for monetary values
- **Category**: Enum values for equipment categorization

### Auto-Generated Fields

- **Primary Keys**: Auto-incrementing BIGSERIAL
- **Timestamps**: Automatically managed by GORM
- **Date Fields**: Attendance date auto-set from check-in time
- **Default Values**: Set via GORM tags where applicable

### Triggers and Automation

- **Attendance Date**: Automatically set from check_in_time timestamp
- **Soft Delete**: Facilities use is_deleted flag for soft deletion
- **Maintenance Scheduling**: Equipment tracks maintenance dates

## Migration Strategy

The service uses GORM's AutoMigrate functionality:

1. **Development**: Automatic schema updates on startup
2. **Production**: Manual migration scripts recommended
3. **Rollback**: Manual SQL scripts for schema downgrades
4. **Data Seeding**: Sample data loaded via migration files

## Performance Considerations

- All timestamp fields use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- Strategic indexing on frequently queried fields (status, date, IDs)
- Foreign key constraints ensure data integrity
- Automatic date field population reduces application complexity
- Soft delete capability for facilities maintains data history
