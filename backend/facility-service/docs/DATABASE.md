# Facility Service Database Schema

The Facility Service uses PostgreSQL as its database. Below is the detailed schema for the tables used in this service.

## Tables

### facilities

This table stores information about physical spaces in the fitness center.

| Column       | Type                     | Description                                   |
|--------------|--------------------------|-----------------------------------------------|
| facility_id  | SERIAL                   | Primary key                                   |
| name         | VARCHAR(50)              | Facility name                                 |
| description  | VARCHAR(255)             | Description of the facility                   |
| capacity     | INTEGER                  | Maximum capacity of the facility              |
| status       | VARCHAR(20)              | Current status (active, maintenance, closed)  |
| opening_hour | TIME                     | Opening hour of the facility                  |
| closing_hour | TIME                     | Closing hour of the facility                  |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `facility_id`
- UNIQUE on `name`
- Index on `status`

### equipment

This table stores information about fitness equipment available at the facility.

| Column                | Type                     | Description                                   |
|-----------------------|--------------------------|-----------------------------------------------|
| equipment_id          | SERIAL                   | Primary key                                   |
| name                  | VARCHAR(100)             | Equipment name                                |
| description           | VARCHAR(255)             | Description of the equipment                  |
| category              | VARCHAR(50)              | Category of equipment                         |
| purchase_date         | DATE                     | Date of purchase                              |
| purchase_price        | DECIMAL(10,2)            | Purchase price                                |
| manufacturer          | VARCHAR(100)             | Equipment manufacturer                        |
| model_number          | VARCHAR(50)              | Model number or identifier                    |
| status                | VARCHAR(20)              | Status (active, maintenance, out-of-order)    |
| last_maintenance_date | DATE                     | Date of last maintenance                      |
| next_maintenance_date | DATE                     | Scheduled date for next maintenance           |
| created_at            | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at            | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `equipment_id`
- Index on `category`
- Index on `status`
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
