# Staff Service Database Schema

The Staff Service uses PostgreSQL as its database with GORM as the ORM layer. Below is the detailed schema for the tables used in this service.

## Database Configuration

- **Database Name**: `fitness_staff_db` (default)
- **Port**: 5433 (default for staff service)
- **Schema**: Uses GORM auto-migration
- **Connection**: PostgreSQL with SSL disabled for development

## Tables

### staff

This table stores information about all staff members working at the fitness center.

| Column       | Type                     | Description                                   | GORM Tags                           |
|--------------|--------------------------|-----------------------------------------------|-------------------------------------|
| staff_id     | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| first_name   | VARCHAR(50)              | Staff member's first name                     | `type:varchar(50);not null`         |
| last_name    | VARCHAR(50)              | Staff member's last name                      | `type:varchar(50);not null`         |
| email        | VARCHAR(100)             | Contact email address (unique)                | `type:varchar(100);unique;not null` |
| phone        | VARCHAR(20)              | Contact phone number                          | `type:varchar(20)`                  |
| address      | TEXT                     | Physical address                              | `type:text`                         |
| position     | VARCHAR(50)              | Job position/title                            | `type:varchar(50);not null`         |
| hire_date    | DATE                     | Date when staff member was hired              | `not null`                          |
| salary       | DECIMAL(10,2)            | Annual salary                                 | `type:decimal(10,2)`                |
| status       | VARCHAR(20)              | Employment status (Active, Inactive)          | `type:varchar(20);default:'active'` |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `staff_id`
- UNIQUE constraint on `email`
- Index on `position` for filtering
- Index on `status` for status-based queries
- Index on `hire_date` for date range queries

### staff_qualifications

This table stores qualifications and certifications held by staff members.

| Column             | Type                     | Description                                   | GORM Tags                           |
|--------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| qualification_id   | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| staff_id           | BIGINT                   | Reference to staff table                      | `not null`                          |
| qualification_name | VARCHAR(100)             | Name of the qualification                     | `type:varchar(100);not null`        |
| issue_date         | DATE                     | Date when qualification was issued            | `not null`                          |
| expiry_date        | DATE                     | Date when qualification expires               | Optional field                      |
| issuing_authority  | VARCHAR(100)             | Name of the issuing organization              | `type:varchar(100)`                 |
| created_at         | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at         | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `qualification_id`
- FOREIGN KEY on `staff_id` REFERENCES `staff(staff_id)` ON DELETE CASCADE
- Index on `staff_id` for staff-based queries
- Index on `qualification_name` for qualification filtering
- Index on `expiry_date` for expiration monitoring

### trainers

This table stores information specific to staff members who are trainers.

| Column         | Type                     | Description                                   | GORM Tags                           |
|----------------|--------------------------|-----------------------------------------------|-------------------------------------|
| trainer_id     | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| staff_id       | BIGINT                   | Reference to staff table                      | `not null`                          |
| specialization | VARCHAR(100)             | Area of expertise                             | `type:varchar(100)`                 |
| certification  | VARCHAR(255)             | Main certification details                    | `type:varchar(255)`                 |
| experience     | INTEGER                  | Years of experience                           | `default:0`                         |
| rating         | DECIMAL(3,2)             | Average trainer rating (0.0-5.0)              | `type:decimal(3,2);default:0.0`     |
| is_active      | BOOLEAN                  | Whether trainer is currently active           | `default:true`                      |
| created_at     | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at     | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `trainer_id`
- FOREIGN KEY on `staff_id` REFERENCES `staff(staff_id)` ON DELETE CASCADE
- UNIQUE constraint on `staff_id` (one trainer record per staff member)
- Index on `specialization` for filtering by expertise
- Index on `rating` for top-rated trainer queries
- Index on `is_active` for active trainer filtering

### personal_training

This table stores information about personal training sessions.

| Column       | Type                     | Description                                   | GORM Tags                           |
|--------------|--------------------------|-----------------------------------------------|-------------------------------------|
| session_id   | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| member_id    | BIGINT                   | ID of the member (from member service)        | `not null`                          |
| trainer_id   | BIGINT                   | Reference to trainers table                   | `not null`                          |
| session_date | DATE                     | Date of the training session                  | `not null`                          |
| start_time   | TIME                     | Start time of the session                     | `type:time;not null`                |
| end_time     | TIME                     | End time of the session                       | `type:time;not null`                |
| notes        | TEXT                     | Session details or focus                      | `type:text`                         |
| status       | VARCHAR(20)              | Status (scheduled, completed, cancelled)       | `type:varchar(20);default:'scheduled'` |
| price        | DECIMAL(10,2)            | Price charged for the session                 | `type:decimal(10,2)`                |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `session_id`
- FOREIGN KEY on `trainer_id` REFERENCES `trainers(trainer_id)` ON DELETE RESTRICT
- Index on `trainer_id` for trainer-specific session queries
- Index on `member_id` for member-specific session queries
- Index on `session_date` for date-based filtering
- Index on `status` for status-based queries

## Relationships

The database follows a normalized relational structure with the following relationships:

1. **Staff → Qualifications** (One-to-Many)
   - Each staff member can have multiple qualifications
   - Qualifications are linked via `staff_id` foreign key
   - CASCADE delete: removing staff removes their qualifications

2. **Staff → Trainer** (One-to-One)
   - Each staff member can optionally be a trainer
   - Enforced by UNIQUE constraint on `staff_id` in trainers table
   - CASCADE delete: removing staff removes trainer record

3. **Trainer → Personal Training Sessions** (One-to-Many)
   - Each trainer can conduct multiple training sessions
   - Sessions are linked via `trainer_id` foreign key
   - RESTRICT delete: cannot remove trainer with active sessions

4. **Member → Personal Training Sessions** (One-to-Many)
   - Each member can book multiple training sessions
   - Sessions reference external member service via `member_id`
   - No foreign key constraint (cross-service reference)

## GORM Model Relationships

The Go models use GORM associations to represent relationships:

```go
// Staff can have multiple qualifications
type Staff struct {
    // ... fields
    Qualifications []Qualification `gorm:"foreignKey:StaffID"`
}

// Trainer belongs to a staff member
type Trainer struct {
    // ... fields
    Staff *Staff `gorm:"foreignKey:StaffID"`
}

// PersonalTraining belongs to a trainer
type PersonalTraining struct {
    // ... fields  
    Trainer *Trainer `gorm:"foreignKey:TrainerID"`
}
```

## Entity-Relationship Diagram

```
                    ┌─────────────────┐
                    │      staff      │
                    │                 │
                    │ staff_id (PK)   │◄─────────┐
                    │ first_name      │          │
                    │ last_name       │          │
                    │ email (UQ)      │          │
                    │ position        │          │
                    │ status          │          │
                    │ ...             │          │
                    └─────────────────┘          │
                            │                    │
                            │ 1:N                │ 1:1
                            ▼                    │
                ┌─────────────────────────┐      │
                │  staff_qualifications   │      │
                │                         │      │
                │ qualification_id (PK)   │      │
                │ staff_id (FK)           │      │
                │ qualification_name      │      │
                │ issue_date              │      │
                │ expiry_date             │      │
                │ ...                     │      │
                └─────────────────────────┘      │
                                                 │
                                                 ▼
                                    ┌─────────────────┐
                                    │    trainers     │
                                    │                 │
                                    │ trainer_id (PK) │◄────────┐
                                    │ staff_id (FK)   │         │
                                    │ specialization  │         │
                                    │ rating          │         │
                                    │ is_active       │         │
                                    │ ...             │         │
                                    └─────────────────┘         │
                                            │                   │ 1:N
                                            │ 1:N               │
                                            ▼                   │
                                ┌─────────────────────────┐     │
                                │   personal_training     │     │
                                │                         │     │
                                │ session_id (PK)         │     │
                                │ member_id               │─────┘
                                │ trainer_id (FK)         │
                                │ session_date            │
                                │ start_time              │
                                │ end_time                │
                                │ status                  │
                                │ ...                     │
                                └─────────────────────────┘
                                            │
                                            │ N:1 (external)
                                            ▼
                                ┌─────────────────────────┐
                                │   members (external)    │
                                │                         │
                                │ member_id               │
                                │ (from member service)   │
                                └─────────────────────────┘
```

## Data Types and Constraints

### Field Validation Rules

- **Email fields**: Must be valid email format and unique
- **Phone fields**: VARCHAR(20) format, no specific validation
- **Date fields**: Standard DATE type, ISO 8601 format
- **Time fields**: PostgreSQL TIME type, HH:MM:SS format
- **Rating fields**: DECIMAL(3,2) with range 0.0-5.0
- **Status fields**: Enumerated values (active/inactive, scheduled/completed/cancelled)
- **Price fields**: DECIMAL(10,2) for monetary values

### Auto-Generated Fields

- **Primary Keys**: Auto-incrementing BIGSERIAL
- **Timestamps**: Automatically managed by GORM
- **Default Values**: Set via GORM tags where applicable

## Migration Strategy

The service uses GORM's AutoMigrate functionality:

1. **Development**: Automatic schema updates on startup
2. **Production**: Manual migration scripts recommended
3. **Rollback**: Manual SQL scripts for schema downgrades
4. **Data Seeding**: Handled separately via service initialization
