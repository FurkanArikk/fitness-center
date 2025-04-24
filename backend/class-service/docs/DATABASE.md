# Class Service Database Schema

The Class Service uses PostgreSQL as its database. Below is the detailed schema for the tables used in this service.

## Tables

### classes

This table stores information about different types of fitness classes offered.

| Column       | Type                     | Description                                   |
|--------------|--------------------------|-----------------------------------------------|
| class_id     | SERIAL                   | Primary key                                   |
| class_name   | VARCHAR(50)              | Name of the class                             |
| description  | VARCHAR(255)             | Description of the class                      |
| duration     | INTEGER                  | Duration of the class in minutes              |
| capacity     | INTEGER                  | Maximum number of participants                |
| difficulty   | VARCHAR(20)              | Difficulty level (Beginner, Intermediate, etc.)|
| is_active    | BOOLEAN                  | Whether the class is currently offered        |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `class_id`
- Index on `class_name`
- Index on `is_active`
- Index on `difficulty`

### class_schedule

This table stores information about when and where classes are scheduled.

| Column       | Type                     | Description                                   |
|--------------|--------------------------|-----------------------------------------------|
| schedule_id  | SERIAL                   | Primary key                                   |
| class_id     | INTEGER                  | Reference to classes table                    |
| trainer_id   | INTEGER                  | ID of the trainer (from staff service)        |
| room_id      | INTEGER                  | ID of the room (from facility service)        |
| start_time   | TIME                     | Start time of the class                       |
| end_time     | TIME                     | End time of the class                         |
| day_of_week  | VARCHAR(10)              | Day of the week (Monday, Tuesday, etc.)       |
| status       | VARCHAR(20)              | Status of the schedule (active, cancelled)    |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Constraints:**
- PRIMARY KEY on `schedule_id`
- FOREIGN KEY on `class_id` REFERENCES `classes(class_id)` ON DELETE RESTRICT

**Indexes:**
- Index on `class_id`
- Index on `trainer_id`
- Index on `room_id`
- Composite index on `day_of_week, start_time`
- Index on `status`

### class_bookings

This table stores information about member bookings for scheduled classes.

| Column             | Type                     | Description                                    |
|--------------------|--------------------------|------------------------------------------------|
| booking_id         | SERIAL                   | Primary key                                    |
| schedule_id        | INTEGER                  | Reference to class_schedule table              |
| member_id          | INTEGER                  | ID of the member (from member service)         |
| booking_date       | TIMESTAMP WITH TIME ZONE | Date and time of the booked class              |
| attendance_status  | VARCHAR(20)              | Status (booked, attended, cancelled, no_show)  |
| feedback_rating    | INTEGER                  | Rating given by member (1-5)                   |
| feedback_comment   | VARCHAR(255)             | Feedback comment                               |
| created_at         | TIMESTAMP WITH TIME ZONE | Record creation timestamp                      |
| updated_at         | TIMESTAMP WITH TIME ZONE | Record last update timestamp                   |

**Constraints:**
- PRIMARY KEY on `booking_id`
- FOREIGN KEY on `schedule_id` REFERENCES `class_schedule(schedule_id)` ON DELETE CASCADE
- UNIQUE constraint on `(schedule_id, member_id)` to prevent duplicate bookings

**Indexes:**
- Index on `schedule_id`
- Index on `member_id`
- Index on `booking_date`
- Index on `attendance_status`
- Unique index on `(schedule_id, member_id)`

## Relationships

1. A **Class** can have multiple **Schedules** (one-to-many)
2. A **Schedule** can have multiple **Bookings** (one-to-many)
3. A **Member** can have multiple **Bookings** (one-to-many)
4. A **Trainer** can have multiple **Schedules** (one-to-many)
5. A **Room** can have multiple **Schedules** (one-to-many)

## Entity-Relationship Diagram

```
+------------+       +-----------------+       +----------------+
|            |       |                 |       |                |
|  classes   |------>| class_schedule  |------>| class_bookings |
|            |       |                 |       |                |
+------------+       +-----------------+       +----------------+
                            ^                         ^
                            |                         |
                     +------+------+           +------+------+
                     |             |           |             |
                     |   trainers  |           |   members   |
                     | (external)  |           | (external)  |
                     +-------------+           +-------------+
                     
                     +-------------+
                     |             |
                     |    rooms    |
                     | (external)  |
                     +-------------+
```
