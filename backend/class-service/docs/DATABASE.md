# Class Service Database Schema

The Class Service uses PostgreSQL as its database with GORM as the ORM layer. Below is the detailed schema for the tables used in this service.

## Database Configuration

- **Database Name**: `fitness_class_db` (default)
- **Port**: 5435 (default for class service)
- **Schema**: Uses GORM auto-migration
- **Connection**: PostgreSQL with SSL disabled for development

## Tables

### classes

This table stores information about different types of fitness classes offered.

| Column       | Type                     | Description                                   | GORM Tags                           |
|--------------|--------------------------|-----------------------------------------------|-------------------------------------|
| class_id     | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| class_name   | VARCHAR(50)              | Name of the class                             | `type:varchar(50);not null`         |
| description  | VARCHAR(255)             | Description of the class                      | `type:varchar(255)`                 |
| duration     | INTEGER                  | Duration of the class in minutes              | `not null`                          |
| capacity     | INTEGER                  | Maximum number of participants                | `not null`                          |
| difficulty   | VARCHAR(20)              | Difficulty level (Beginner, Intermediate, etc.)| `type:varchar(20)`                  |
| is_active    | BOOLEAN                  | Whether the class is currently offered        | `default:true`                      |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `class_id`
- Index on `class_name` for name-based queries
- Index on `is_active` for filtering active classes
- Index on `difficulty` for difficulty-based filtering
- Index on `duration` for duration-based queries

### class_schedule

This table stores information about when and where classes are scheduled.

| Column       | Type                     | Description                                   | GORM Tags                           |
|--------------|--------------------------|-----------------------------------------------|-------------------------------------|
| schedule_id  | BIGSERIAL                | Primary key                                   | `primaryKey;autoIncrement`          |
| class_id     | BIGINT                   | Reference to classes table                    | `not null`                          |
| trainer_id   | BIGINT                   | ID of the trainer (from staff service)        | `not null`                          |
| room_id      | BIGINT                   | ID of the room (from facility service)        | `not null`                          |
| start_time   | TIME                     | Start time of the class                       | `type:time;not null`                |
| end_time     | TIME                     | End time of the class                         | `type:time;not null`                |
| day_of_week  | VARCHAR(10)              | Day of the week (Monday, Tuesday, etc.)       | `type:varchar(10);not null`         |
| status       | VARCHAR(20)              | Status of the schedule (active, cancelled)    | `type:varchar(20);default:'active'` |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `schedule_id`
- FOREIGN KEY on `class_id` REFERENCES `classes(class_id)` ON DELETE RESTRICT
- Index on `class_id` for class-based queries
- Index on `trainer_id` for trainer-based queries
- Index on `room_id` for room-based queries
- Composite index on `day_of_week, start_time` for scheduling queries
- Index on `status` for status-based filtering

### class_bookings

This table stores information about member bookings for scheduled classes.

| Column             | Type                     | Description                                    | GORM Tags                           |
|--------------------|--------------------------|------------------------------------------------|-------------------------------------|
| booking_id         | BIGSERIAL                | Primary key                                    | `primaryKey;autoIncrement`          |
| schedule_id        | BIGINT                   | Reference to class_schedule table              | `not null`                          |
| member_id          | BIGINT                   | ID of the member (from member service)         | `not null`                          |
| booking_date       | TIMESTAMP WITH TIME ZONE | Date and time of the booked class              | `not null`                          |
| attendance_status  | VARCHAR(20)              | Status (booked, attended, cancelled, no_show)  | `type:varchar(20);default:'booked'` |
| feedback_rating    | INTEGER                  | Rating given by member (1-5)                   | Optional field                      |
| feedback_comment   | VARCHAR(255)             | Feedback comment                               | `type:varchar(255)`                 |
| created_at         | TIMESTAMP WITH TIME ZONE | Record creation timestamp                      | `autoCreateTime`                    |
| updated_at         | TIMESTAMP WITH TIME ZONE | Record last update timestamp                   | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `booking_id`
- FOREIGN KEY on `schedule_id` REFERENCES `class_schedule(schedule_id)` ON DELETE CASCADE
- UNIQUE constraint on `(schedule_id, member_id)` to prevent duplicate bookings
- Index on `schedule_id` for schedule-based queries
- Index on `member_id` for member-based queries
- Index on `booking_date` for date-based filtering
- Index on `attendance_status` for status-based queries
- Unique index on `(schedule_id, member_id)` for booking uniqueness

## Relationships

The database follows a normalized relational structure with the following relationships:

1. **Classes → Schedules** (One-to-Many)
   - Each class can have multiple scheduled sessions
   - Schedules are linked via `class_id` foreign key
   - RESTRICT delete: cannot remove class with active schedules

2. **Schedules → Bookings** (One-to-Many)
   - Each schedule can have multiple member bookings
   - Bookings are linked via `schedule_id` foreign key
   - CASCADE delete: removing schedule removes its bookings

3. **Member → Bookings** (One-to-Many)
   - Each member can book multiple class sessions
   - Bookings reference external member service via `member_id`
   - No foreign key constraint (cross-service reference)

4. **Trainer → Schedules** (One-to-Many)
   - Each trainer can be assigned to multiple schedules
   - Schedules reference external staff service via `trainer_id`
   - No foreign key constraint (cross-service reference)

5. **Room → Schedules** (One-to-Many)
   - Each room can host multiple scheduled classes
   - Schedules reference external facility service via `room_id`
   - No foreign key constraint (cross-service reference)

## GORM Model Relationships

The Go models use GORM associations to represent relationships:

```go
// Class can have multiple schedules
type Class struct {
    // ... fields
    Schedules []Schedule `gorm:"foreignKey:ClassID"`
}

// Schedule belongs to a class and can have multiple bookings
type Schedule struct {
    // ... fields
    Class    *Class    `gorm:"foreignKey:ClassID"`
    Bookings []Booking `gorm:"foreignKey:ScheduleID"`
}

// Booking belongs to a schedule
type Booking struct {
    // ... fields
    Schedule *Schedule `gorm:"foreignKey:ScheduleID"`
}
```

## Entity-Relationship Diagram

```
                    ┌─────────────────┐
                    │     classes     │
                    │                 │
                    │ class_id (PK)   │◄─────────┐
                    │ class_name      │          │
                    │ description     │          │
                    │ duration        │          │
                    │ capacity        │          │
                    │ difficulty      │          │
                    │ is_active       │          │
                    │ ...             │          │
                    └─────────────────┘          │
                            │                    │ 1:N
                            │ 1:N                │
                            ▼                    │
                ┌─────────────────────────┐      │
                │   class_schedule        │      │
                │                         │      │
                │ schedule_id (PK)        │◄─────┘
                │ class_id (FK)           │
                │ trainer_id              │◄─────────────┐
                │ room_id                 │◄─────────┐   │
                │ start_time              │          │   │
                │ end_time                │          │   │
                │ day_of_week             │          │   │
                │ status                  │          │   │
                │ ...                     │          │   │
                └─────────────────────────┘          │   │
                            │                        │   │
                            │ 1:N                    │   │
                            ▼                        │   │
                ┌─────────────────────────┐          │   │
                │   class_bookings        │          │   │
                │                         │          │   │
                │ booking_id (PK)         │          │   │
                │ schedule_id (FK)        │          │   │
                │ member_id               │─────┐    │   │
                │ booking_date            │     │    │   │
                │ attendance_status       │     │    │   │
                │ feedback_rating         │     │    │   │
                │ feedback_comment        │     │    │   │
                │ ...                     │     │    │   │
                └─────────────────────────┘     │    │   │
                                                │    │   │
        ┌─────────────────────────┐             │    │   │
        │   members (external)    │◄────────────┘    │   │
        │                         │                  │   │
        │ member_id               │                  │   │
        │ (from member service)   │                  │   │
        └─────────────────────────┘                  │   │
                                                     │   │
        ┌─────────────────────────┐                  │   │
        │   rooms (external)      │◄─────────────────┘   │
        │                         │                      │
        │ room_id                 │                      │
        │ (from facility service) │                      │
        └─────────────────────────┘                      │
                                                         │
        ┌─────────────────────────┐                      │
        │   trainers (external)   │◄─────────────────────┘
        │                         │
        │ trainer_id              │
        │ (from staff service)    │
        └─────────────────────────┘
```

## Data Types and Constraints

### Field Validation Rules

- **Class Name**: VARCHAR(50), required, class identifier
- **Description**: VARCHAR(255), optional, class details
- **Duration**: INTEGER, required, class duration in minutes (5-300)
- **Capacity**: INTEGER, required, maximum participants (1-100)
- **Difficulty**: VARCHAR(20), optional, enum values (beginner, intermediate, advanced)
- **Day of Week**: VARCHAR(10), enum values (Monday-Sunday)
- **Time Fields**: TIME type, HH:MM format
- **Status Fields**: Enumerated values (active/cancelled, booked/attended/cancelled/no_show)
- **Rating**: INTEGER, range 1-5 for feedback

### Auto-Generated Fields

- **Primary Keys**: Auto-incrementing BIGSERIAL
- **Timestamps**: Automatically managed by GORM
- **Default Values**: Set via GORM tags where applicable

## Migration Strategy

The service uses GORM's AutoMigrate functionality:

1. **Development**: Automatic schema updates on startup
2. **Production**: Manual migration scripts recommended
3. **Rollback**: Manual SQL scripts for schema downgrades
4. **Data Seeding**: Sample data loaded via migration files
