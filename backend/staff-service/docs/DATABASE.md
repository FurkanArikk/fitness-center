# Staff Service Database Schema

The Staff Service uses PostgreSQL as its database. Below is the detailed schema for the tables used in this service.

## Tables

### staff

This table stores information about all staff members working at the fitness center.

| Column       | Type                     | Description                                   |
|--------------|--------------------------|-----------------------------------------------|
| staff_id     | SERIAL                   | Primary key                                   |
| first_name   | VARCHAR(50)              | Staff member's first name                     |
| last_name    | VARCHAR(50)              | Staff member's last name                      |
| email        | VARCHAR(100)             | Contact email address (unique)                |
| phone        | VARCHAR(20)              | Contact phone number                          |
| address      | VARCHAR(255)             | Physical address                              |
| position     | VARCHAR(50)              | Job position/title                            |
| hire_date    | DATE                     | Date when staff member was hired              |
| salary       | DECIMAL(10,2)            | Annual salary                                 |
| status       | VARCHAR(20)              | Employment status (Active, Inactive)          |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `staff_id`
- UNIQUE on `email`
- Index on `last_name, first_name`
- Index on `position`
- Index on `status`
- Index on `hire_date`

### staff_qualifications

This table stores qualifications and certifications held by staff members.

| Column             | Type                     | Description                                   |
|--------------------|--------------------------|-----------------------------------------------|
| qualification_id   | SERIAL                   | Primary key                                   |
| staff_id           | INTEGER                  | Reference to staff table                      |
| qualification_name | VARCHAR(100)             | Name of the qualification                     |
| issue_date         | DATE                     | Date when qualification was issued            |
| expiry_date        | DATE                     | Date when qualification expires               |
| issuing_authority  | VARCHAR(100)             | Name of the issuing organization              |
| created_at         | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at         | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Constraints:**
- PRIMARY KEY on `qualification_id`
- FOREIGN KEY on `staff_id` REFERENCES `staff(staff_id)` ON DELETE CASCADE

**Indexes:**
- Index on `staff_id`
- Index on `qualification_name`
- Index on `expiry_date`

### trainers

This table stores information specific to staff members who are trainers.

| Column         | Type                     | Description                                   |
|----------------|--------------------------|-----------------------------------------------|
| trainer_id     | SERIAL                   | Primary key                                   |
| staff_id       | INTEGER                  | Reference to staff table                      |
| specialization | VARCHAR(100)             | Area of expertise                             |
| certification  | VARCHAR(255)             | Main certification details                    |
| experience     | INTEGER                  | Years of experience                           |
| rating         | DECIMAL(3,1)             | Average trainer rating (1.0-5.0)              |
| created_at     | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at     | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Constraints:**
- PRIMARY KEY on `trainer_id`
- FOREIGN KEY on `staff_id` REFERENCES `staff(staff_id)` ON DELETE CASCADE
- UNIQUE on `staff_id` (a staff member can be a trainer only once)

**Indexes:**
- Index on `specialization`
- Index on `rating`

### personal_training

This table stores information about personal training sessions.

| Column       | Type                     | Description                                   |
|--------------|--------------------------|-----------------------------------------------|
| session_id   | SERIAL                   | Primary key                                   |
| member_id    | INTEGER                  | ID of the member (from member service)        |
| trainer_id   | INTEGER                  | Reference to trainers table                   |
| session_date | DATE                     | Date of the training session                  |
| start_time   | TIME                     | Start time of the session                     |
| end_time     | TIME                     | End time of the session                       |
| notes        | TEXT                     | Session details or focus                      |
| status       | VARCHAR(20)              | Status (Scheduled, Completed, Cancelled)      |
| price        | DECIMAL(10,2)            | Price charged for the session                 |
| created_at   | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at   | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Constraints:**
- PRIMARY KEY on `session_id`
- FOREIGN KEY on `trainer_id` REFERENCES `trainers(trainer_id)` ON DELETE RESTRICT

**Indexes:**
- Index on `trainer_id`
- Index on `member_id`
- Index on `session_date`
- Index on `status`

## Relationships

1. A **Staff** can have multiple **Qualifications** (one-to-many)
2. A **Staff** can be a **Trainer** (one-to-one)
3. A **Trainer** can have multiple **Personal Training** sessions (one-to-many)
4. A **Member** can have multiple **Personal Training** sessions (one-to-many)

## Entity-Relationship Diagram

```
+------------+       +----------------------+
|            |       |                      |
|   staff    |------>| staff_qualifications |
|            |       |                      |
+------------+       +----------------------+
      |
      |
      v
+------------+       +--------------------+
|            |       |                    |
|  trainers  |------>| personal_training  |
|            |       |                    |
+------------+       +--------------------+
                            ^
                            |
                            |
                     +------------+
                     |            |
                     |  members   |
                     | (external) |
                     |            |
                     +------------+
```
