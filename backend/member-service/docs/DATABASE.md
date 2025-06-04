# Member Service Database Schema

The Member Service uses PostgreSQL as its database with GORM as the ORM layer. Below is the detailed schema for the tables used in this service.

## Database Configuration

- **Database Name**: `fitness_member_db` (default)
- **Port**: 5437 (default for member service)
- **Schema**: Uses GORM auto-migration
- **Connection**: PostgreSQL with SSL disabled for development

## Architecture

The service uses GORM for database operations with the following benefits:
- **Type Safety**: Compile-time type checking for database operations
- **Auto Migration**: Automatic schema migration support
- **Relationship Management**: Built-in support for foreign key relationships
- **Transaction Support**: Automatic transaction handling
- **Query Building**: Intuitive query building with method chaining

## GORM Model Definitions

All database models are defined in the `internal/model` package with embedded repository interfaces following the microservice pattern.

## Tables

### members

This table stores information about fitness center members.

**GORM Model:** `internal/model/member.go`

| Column                  | Type                     | Description                                   | GORM Tags                           |
|-------------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| member_id               | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| first_name              | VARCHAR(100)             | Member's first name                           | `type:varchar(100);not null`        |
| last_name               | VARCHAR(100)             | Member's last name                            | `type:varchar(100);not null`        |
| email                   | VARCHAR(100)             | Contact email address                         | `type:varchar(100);unique;not null` |
| phone                   | VARCHAR(20)              | Contact phone number                          | `type:varchar(20)`                  |
| address                 | TEXT                     | Physical address                              | `type:text`                         |
| date_of_birth           | DATE                     | Member's birth date                           | `type:date`                         |
| emergency_contact_name  | VARCHAR(100)             | Name of emergency contact                     | `type:varchar(100)`                 |
| emergency_contact_phone | VARCHAR(20)              | Phone number of emergency contact             | `type:varchar(20)`                  |
| join_date               | DATE                     | Date when member joined                       | `type:date`                         |
| status                  | VARCHAR(20)              | Member status (active, de_active, hold_on)   | `type:varchar(20);default:'active'` |
| created_at              | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at              | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `member_id`
- UNIQUE constraint on `email`
- Index on `status` for status-based filtering
- Index on `join_date` for date-based queries
- Index on `first_name, last_name` for name searches

**GORM Features:**
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Email uniqueness enforced at database level
- Custom validation for status field

### memberships

This table stores information about different types of memberships offered.

| Column           | Type                     | Description                                   | GORM Tags                           |
|------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| membership_id    | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| membership_name  | VARCHAR(50)              | Name of the membership                        | `type:varchar(50);unique;not null`  |
| description      | VARCHAR(255)             | Description of features included              | `type:varchar(255)`                 |
| duration         | INTEGER                  | Duration in months                            | `not null`                          |
| price            | DECIMAL(10,2)            | Monthly price                                 | `type:decimal(10,2);not null`       |
| is_active        | BOOLEAN                  | Whether this membership is currently offered  | `default:true`                      |
| created_at       | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at       | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `membership_id`
- UNIQUE constraint on `membership_name`
- Index on `is_active` for filtering active memberships
- Index on `price` for price-based queries

### membership_benefits

This table stores information about benefits included in each membership type.

**GORM Model:** `internal/model/membership_benefit.go`

| Column              | Type                     | Description                                   | GORM Tags                           |
|---------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| benefit_id          | SERIAL                   | Primary key                                   | `primaryKey;autoIncrement`          |
| membership_id       | INTEGER                  | Reference to memberships table                | `not null;index`                    |
| benefit_name        | VARCHAR(50)              | Name of the benefit                           | `type:varchar(50);not null`         |
| benefit_description | VARCHAR(255)             | Detailed description of the benefit           | `type:varchar(255)`                 |
| created_at          | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at          | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `benefit_id`
- FOREIGN KEY on `membership_id` REFERENCES `memberships(membership_id)` ON DELETE CASCADE
- Index on `membership_id` for relationship queries
- Index on `benefit_name` for benefit searches

**GORM Features:**
- Foreign key constraint with CASCADE delete behavior
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Index on foreign key for optimized joins

### member_memberships

This table stores the relationship between members and their memberships.

**GORM Model:** `internal/model/member_membership.go`

| Column               | Type                     | Description                                   | GORM Tags                           |
|----------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| member_membership_id | SERIAL                   | Primary key                                   | `primaryKey;autoIncrement`          |
| member_id            | INTEGER                  | Reference to members table                    | `not null;index`                    |
| membership_id        | INTEGER                  | Reference to memberships table                | `not null;index`                    |
| start_date           | TIMESTAMP WITH TIME ZONE | Start date of the membership                  | `not null;index`                    |
| end_date             | TIMESTAMP WITH TIME ZONE | End date of the membership                    | `not null;index`                    |
| payment_status       | VARCHAR(20)              | Status of payment (paid, pending, overdue)   | `type:varchar(20);default:'pending';index` |
| contract_signed      | BOOLEAN                  | Whether the contract has been signed          | `default:false`                     |
| created_at           | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at           | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `member_membership_id`
- FOREIGN KEY on `member_id` REFERENCES `members(member_id)` ON DELETE CASCADE
- FOREIGN KEY on `membership_id` REFERENCES `memberships(membership_id)` ON DELETE RESTRICT
- Index on `member_id` for member-based queries
- Index on `membership_id` for membership-based queries
- Index on `start_date` for date range queries
- Index on `end_date` for expiration queries
- Index on `payment_status` for payment tracking

**GORM Features:**
- Foreign key constraints with different cascade behaviors
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Default values for `payment_status` and `contract_signed`
- Multiple indexes for optimized queries

### fitness_assessments

This table stores fitness assessment data for members.

**GORM Model:** `internal/model/fitness_assessment.go`

| Column               | Type                     | Description                                   | GORM Tags                           |
|----------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| assessment_id        | SERIAL                   | Primary key                                   | `primaryKey;autoIncrement`          |
| member_id            | INTEGER                  | Reference to members table                    | `not null;index`                    |
| trainer_id           | INTEGER                  | ID of the trainer (from staff service)       | `not null;index`                    |
| assessment_date      | TIMESTAMP WITH TIME ZONE | Date and time of assessment                   | `not null;index`                    |
| height               | DECIMAL(5,2)             | Height in centimeters                         | `type:decimal(5,2)`                 |
| weight               | DECIMAL(5,2)             | Weight in kilograms                           | `type:decimal(5,2)`                 |
| body_fat_percentage  | DECIMAL(5,2)             | Body fat percentage                           | `type:decimal(5,2)`                 |
| bmi                  | DECIMAL(5,2)             | Body Mass Index                               | `type:decimal(5,2)`                 |
| notes                | TEXT                     | Additional notes from the trainer             | `type:text`                         |
| goals_set            | TEXT                     | Fitness goals established during assessment   | `type:text`                         |
| next_assessment_date | TIMESTAMP WITH TIME ZONE | Scheduled date for next assessment            | `index`                             |
| created_at           | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at           | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `assessment_id`
- FOREIGN KEY on `member_id` REFERENCES `members(member_id)` ON DELETE CASCADE
- Index on `member_id` for member-based queries
- Index on `trainer_id` for trainer-based queries
- Index on `assessment_date` for date-based filtering
- Index on `next_assessment_date` for scheduling queries

**GORM Features:**
- Foreign key constraint with CASCADE delete behavior
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Multiple indexes for optimized queries
- Text fields for detailed notes and goals

## Relationships

### Primary Relationships

1. **Members → Member Memberships** (One-to-Many)
   - A member can have multiple membership periods over time
   - CASCADE DELETE: When a member is deleted, all their membership records are removed

2. **Memberships → Member Memberships** (One-to-Many)
   - A membership type can be purchased by multiple members
   - RESTRICT DELETE: Cannot delete a membership type that has active subscriptions

3. **Memberships → Membership Benefits** (One-to-Many)
   - Each membership type can have multiple benefits
   - CASCADE DELETE: When a membership type is deleted, all its benefits are removed

4. **Members → Fitness Assessments** (One-to-Many)
   - A member can have multiple fitness assessments over time
   - CASCADE DELETE: When a member is deleted, all their assessments are removed

### Cross-Service Relationships

5. **Staff Service → Fitness Assessments** (One-to-Many)
   - Trainers from staff service conduct fitness assessments
   - Foreign key reference only (no direct constraint)

## GORM Model Relationships

### Member Model
```go
type Member struct {
    MemberID             uint                `gorm:"primaryKey;autoIncrement" json:"member_id"`
    FirstName            string              `gorm:"type:varchar(100);not null" json:"first_name"`
    LastName             string              `gorm:"type:varchar(100);not null" json:"last_name"`
    Email                string              `gorm:"type:varchar(100);unique;not null" json:"email"`
    Phone                *string             `gorm:"type:varchar(20)" json:"phone,omitempty"`
    Address              *string             `gorm:"type:text" json:"address,omitempty"`
    DateOfBirth          *time.Time          `gorm:"type:date" json:"date_of_birth,omitempty"`
    EmergencyContactName *string             `gorm:"type:varchar(100)" json:"emergency_contact_name,omitempty"`
    EmergencyContactPhone *string            `gorm:"type:varchar(20)" json:"emergency_contact_phone,omitempty"`
    JoinDate             *time.Time          `gorm:"type:date" json:"join_date,omitempty"`
    Status               string              `gorm:"type:varchar(20);default:'active'" json:"status"`
    CreatedAt            time.Time           `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt            time.Time           `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    MemberMemberships    []MemberMembership  `gorm:"foreignKey:MemberID;constraint:OnDelete:CASCADE" json:"member_memberships,omitempty"`
    FitnessAssessments   []FitnessAssessment `gorm:"foreignKey:MemberID;constraint:OnDelete:CASCADE" json:"fitness_assessments,omitempty"`
}
```

### Membership Model
```go
type Membership struct {
    MembershipID   uint                `gorm:"primaryKey;autoIncrement" json:"membership_id"`
    MembershipName string              `gorm:"type:varchar(50);unique;not null" json:"membership_name"`
    Description    *string             `gorm:"type:varchar(255)" json:"description,omitempty"`
    Duration       int                 `gorm:"not null" json:"duration"`
    Price          float64             `gorm:"type:decimal(10,2);not null" json:"price"`
    IsActive       bool                `gorm:"default:true" json:"is_active"`
    CreatedAt      time.Time           `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt      time.Time           `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    MemberMemberships   []MemberMembership   `gorm:"foreignKey:MembershipID;constraint:OnDelete:RESTRICT" json:"member_memberships,omitempty"`
    MembershipBenefits  []MembershipBenefit  `gorm:"foreignKey:MembershipID;constraint:OnDelete:CASCADE" json:"membership_benefits,omitempty"`
}
```

### MemberMembership Model
```go
type MemberMembership struct {
    MemberMembershipID uint      `gorm:"primaryKey;autoIncrement" json:"member_membership_id"`
    MemberID           uint      `gorm:"not null;index" json:"member_id"`
    MembershipID       uint      `gorm:"not null;index" json:"membership_id"`
    StartDate          time.Time `gorm:"not null;index" json:"start_date"`
    EndDate            time.Time `gorm:"not null;index" json:"end_date"`
    PaymentStatus      string    `gorm:"type:varchar(20);default:'pending';index" json:"payment_status"`
    ContractSigned     bool      `gorm:"default:false" json:"contract_signed"`
    CreatedAt          time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt          time.Time `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    Member     Member     `gorm:"foreignKey:MemberID;constraint:OnDelete:CASCADE" json:"member,omitempty"`
    Membership Membership `gorm:"foreignKey:MembershipID;constraint:OnDelete:RESTRICT" json:"membership,omitempty"`
}
```

### MembershipBenefit Model
```go
type MembershipBenefit struct {
    BenefitID          uint      `gorm:"primaryKey;autoIncrement" json:"benefit_id"`
    MembershipID       uint      `gorm:"not null;index" json:"membership_id"`
    BenefitName        string    `gorm:"type:varchar(50);not null" json:"benefit_name"`
    BenefitDescription *string   `gorm:"type:varchar(255)" json:"benefit_description,omitempty"`
    CreatedAt          time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt          time.Time `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    Membership Membership `gorm:"foreignKey:MembershipID;constraint:OnDelete:CASCADE" json:"membership,omitempty"`
}
```

### FitnessAssessment Model
```go
type FitnessAssessment struct {
    AssessmentID        uint       `gorm:"primaryKey;autoIncrement" json:"assessment_id"`
    MemberID            uint       `gorm:"not null;index" json:"member_id"`
    TrainerID           uint       `gorm:"not null;index" json:"trainer_id"`
    AssessmentDate      time.Time  `gorm:"not null;index" json:"assessment_date"`
    Height              *float64   `gorm:"type:decimal(5,2)" json:"height,omitempty"`
    Weight              *float64   `gorm:"type:decimal(5,2)" json:"weight,omitempty"`
    BodyFatPercentage   *float64   `gorm:"type:decimal(5,2)" json:"body_fat_percentage,omitempty"`
    BMI                 *float64   `gorm:"type:decimal(5,2)" json:"bmi,omitempty"`
    Notes               *string    `gorm:"type:text" json:"notes,omitempty"`
    GoalsSet            *string    `gorm:"type:text" json:"goals_set,omitempty"`
    NextAssessmentDate  *time.Time `gorm:"index" json:"next_assessment_date,omitempty"`
    CreatedAt           time.Time  `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt           time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    Member Member `gorm:"foreignKey:MemberID;constraint:OnDelete:CASCADE" json:"member,omitempty"`
    // Note: TrainerID references staff-service, no direct GORM relationship
}
```

## Entity-Relationship Diagram

```
                             MEMBER SERVICE DATABASE SCHEMA
    
    ┌─────────────────────────────────────┐                  ┌─────────────────────────────────────┐
    │              MEMBERS                │                  │           MEMBERSHIPS               │
    │─────────────────────────────────────│                  │─────────────────────────────────────│
    │ PK member_id (BIGSERIAL)            │                  │ PK membership_id (BIGSERIAL)        │
    │    first_name (VARCHAR(100))        │                  │    membership_name (VARCHAR(50))    │
    │    last_name (VARCHAR(100))         │                  │    description (VARCHAR(255))       │
    │    email (VARCHAR(100)) [UNIQUE]    │                  │    duration (INTEGER)               │
    │    phone (VARCHAR(20))              │                  │    price (DECIMAL(10,2))            │
    │    address (TEXT)                   │                  │    is_active (BOOLEAN)              │
    │    date_of_birth (DATE)             │                  │    created_at (TIMESTAMPTZ)         │
    │    emergency_contact_name (VARCHAR) │                  │    updated_at (TIMESTAMPTZ)         │
    │    emergency_contact_phone (VARCHAR)│                  └─────────────────────────────────────┘
    │    join_date (DATE)                 │                                     │
    │    status (VARCHAR(20))             │                                     │ 1:N
    │    created_at (TIMESTAMPTZ)         │                                     │
    │    updated_at (TIMESTAMPTZ)         │                                     ▼
    └─────────────────────────────────────┘                  ┌─────────────────────────────────────┐
                       │                                     │        MEMBERSHIP_BENEFITS          │
                       │ 1:N                                 │─────────────────────────────────────│
                       │                                     │ PK benefit_id (SERIAL)              │
                       │                                     │ FK membership_id → memberships      │
                       │                                     │    benefit_name (VARCHAR(50))       │
                       │                                     │    benefit_description (VARCHAR)    │
                       │                                     │    created_at (TIMESTAMPTZ)         │
                       │                                     │    updated_at (TIMESTAMPTZ)         │
                       │                                     └─────────────────────────────────────┘
                       │             
    ┌─────────────────────────────────────┐                  ┌──────────────────────────────────────┐
    │         MEMBER_MEMBERSHIPS          │                  │        FITNESS_ASSESSMENTS           │
    │─────────────────────────────────────│                  │──────────────────────────────────────│
    │ PK member_membership_id (SERIAL)    │                  │ PK assessment_id (SERIAL)            │
    │ FK member_id → members              │                  │ FK member_id → members               │
    │ FK membership_id → memberships      │                  │    trainer_id (INTEGER) [EXTERNAL]   │
    │    start_date (TIMESTAMPTZ)         │                  │    assessment_date (TIMESTAMPTZ)     │
    │    end_date (TIMESTAMPTZ)           │                  │    height (DECIMAL(5,2))             │
    │    payment_status (VARCHAR(20))     │                  │    weight (DECIMAL(5,2))             │
    │    contract_signed (BOOLEAN)        │                  │    body_fat_percentage (DECIMAL)     │
    │    created_at (TIMESTAMPTZ)         │                  │    bmi (DECIMAL(5,2))                │
    │    updated_at (TIMESTAMPTZ)         │◄─────────────────┤    notes (TEXT)                      │
    └─────────────────────────────────────┘                  │    goals_set (TEXT)                  │
                                                             │    next_assessment_date (TIMESTAMPTZ)│
         ┌─────────────────────────────────────┐             │    created_at (TIMESTAMPTZ)          │
         │           STAFF SERVICE             │             │    updated_at (TIMESTAMPTZ)          │
         │─────────────────────────────────────│             └──────────────────────────────────────┘
         │        TRAINERS (EXTERNAL)          │
         │─────────────────────────────────────│
         │ trainer_id                          │
         │ first_name                          │
         │ last_name                           │
         │ ...                                 │
         └─────────────────────────────────────┘

    RELATIONSHIPS:
    • members 1:N member_memberships (CASCADE DELETE)
    • memberships 1:N member_memberships (RESTRICT DELETE)
    • memberships 1:N membership_benefits (CASCADE DELETE)
    • members 1:N fitness_assessments (CASCADE DELETE)
    • trainers 1:N fitness_assessments (EXTERNAL REFERENCE)
```

## Data Types and Constraints

### String Types
- **VARCHAR(20-255)**: Used for constrained text fields with length validation
- **TEXT**: Used for unlimited text content (notes, descriptions)
- **Email Validation**: Enforced through GORM tags and application-level validation

### Numeric Types
- **BIGSERIAL**: Auto-incrementing 64-bit integers for primary keys
- **SERIAL**: Auto-incrementing 32-bit integers for secondary keys
- **INTEGER**: Standard 32-bit integers for foreign keys and counts
- **DECIMAL(10,2)**: Fixed-point decimal for monetary values (price)
- **DECIMAL(5,2)**: Fixed-point decimal for measurements (height, weight, BMI)

### Date and Time Types
- **DATE**: For date-only fields (birth date, join date)
- **TIMESTAMPTZ**: For full timestamp with timezone (created_at, updated_at, assessment dates)

### Boolean Types
- **BOOLEAN**: For binary flags (is_active, contract_signed)

### Constraints Summary
- **Primary Keys**: All tables have auto-incrementing primary keys
- **Foreign Keys**: Properly defined with appropriate cascade behaviors
- **Unique Constraints**: Email addresses, membership names
- **NOT NULL**: Applied to essential fields
- **Default Values**: Status fields, boolean flags, timestamps

## Field Validation Rules

### Member Validation
- **first_name, last_name**: Required, 1-100 characters
- **email**: Required, unique, valid email format
- **phone**: Optional, valid phone format if provided
- **status**: Must be one of: 'active', 'inactive', 'hold_on'
- **date_of_birth**: Must be in the past if provided

### Membership Validation
- **membership_name**: Required, unique, 1-50 characters
- **duration**: Required, positive integer (months)
- **price**: Required, positive decimal value
- **is_active**: Boolean flag for availability

### Member Membership Validation
- **start_date, end_date**: Required, end_date must be after start_date
- **payment_status**: Must be one of: 'paid', 'pending', 'overdue'
- **member_id, membership_id**: Must reference existing records

### Fitness Assessment Validation
- **height**: If provided, must be between 50-300 cm
- **weight**: If provided, must be between 20-500 kg
- **body_fat_percentage**: If provided, must be between 0-100%
- **bmi**: Auto-calculated if height and weight provided
- **assessment_date**: Required, cannot be in the future
- **next_assessment_date**: Must be after assessment_date if provided

## Auto-Generated Fields

### Timestamps
- **created_at**: Automatically set on record creation using `autoCreateTime`
- **updated_at**: Automatically updated on record modification using `autoUpdateTime`

### Primary Keys
- **member_id**: Auto-incrementing BIGSERIAL starting from 1
- **membership_id**: Auto-incrementing BIGSERIAL starting from 1
- **benefit_id**: Auto-incrementing SERIAL starting from 1
- **member_membership_id**: Auto-incrementing SERIAL starting from 1
- **assessment_id**: Auto-incrementing SERIAL starting from 1

### Default Values
- **members.status**: Defaults to 'active'
- **memberships.is_active**: Defaults to true
- **member_memberships.payment_status**: Defaults to 'pending'
- **member_memberships.contract_signed**: Defaults to false

### Calculated Fields
- **BMI**: Can be calculated from height and weight in fitness assessments
- **Age**: Can be calculated from date_of_birth (application level)
- **Membership Duration**: Calculated from start_date and end_date

## Migration Strategy

### Database Initialization
```sql
-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';
```

### Migration Order
1. **memberships** (independent table)
2. **members** (independent table)
3. **membership_benefits** (depends on memberships)
4. **member_memberships** (depends on members and memberships)
5. **fitness_assessments** (depends on members)

### Index Creation Strategy
```sql
-- Performance indexes created after data migration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_join_date ON members(join_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_name ON members(first_name, last_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_member_memberships_dates ON member_memberships(start_date, end_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fitness_assessments_dates ON fitness_assessments(assessment_date, next_assessment_date);
```

### Data Migration Considerations
- **Member Import**: Validate email uniqueness during bulk import
- **Membership Setup**: Ensure all membership types are active by default
- **Historical Data**: Preserve existing member_membership records with correct dates
- **Assessment Data**: Validate measurement ranges during import
- **Foreign Key Validation**: Ensure trainer_id references exist in staff service

### Rollback Strategy
- Maintain migration version tracking through GORM
- Keep backup copies of data before major schema changes
- Test rollback procedures in staging environment
- Document data transformation steps for reversibility

### Performance Optimization
- Regular `ANALYZE` on high-traffic tables
- Monitor query performance with `EXPLAIN ANALYZE`
- Consider partitioning for fitness_assessments by date if volume grows
- Implement connection pooling for high-concurrency scenarios
