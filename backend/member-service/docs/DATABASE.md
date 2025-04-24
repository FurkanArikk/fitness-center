# Member Service Database Schema

The Member Service uses PostgreSQL as its database. Below is the detailed schema for the tables used in this service.

## Tables

### members

This table stores information about fitness center members.

| Column                  | Type                     | Description                                   |
|-------------------------|--------------------------|-----------------------------------------------|
| member_id               | SERIAL                   | Primary key                                   |
| first_name              | VARCHAR(50)              | Member's first name                           |
| last_name               | VARCHAR(50)              | Member's last name                            |
| email                   | VARCHAR(100)             | Contact email address                         |
| phone                   | VARCHAR(20)              | Contact phone number                          |
| address                 | VARCHAR(255)             | Physical address                              |
| date_of_birth           | TIMESTAMP WITH TIME ZONE | Member's birth date                           |
| emergency_contact_name  | VARCHAR(100)             | Name of emergency contact                     |
| emergency_contact_phone | VARCHAR(20)              | Phone number of emergency contact             |
| created_at              | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at              | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `member_id`
- UNIQUE on `email`
- Index on `last_name, first_name`
- Index on `date_of_birth`

### memberships

This table stores information about different types of memberships offered.

| Column           | Type                     | Description                                   |
|------------------|--------------------------|-----------------------------------------------|
| membership_id    | SERIAL                   | Primary key                                   |
| membership_name  | VARCHAR(50)              | Name of the membership                        |
| description      | VARCHAR(255)             | Description of features included              |
| duration         | INTEGER                  | Duration in months                            |
| price            | DECIMAL(10,2)            | Monthly price                                 |
| is_active        | BOOLEAN                  | Whether this membership is currently offered  |
| created_at       | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at       | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `membership_id`
- UNIQUE on `membership_name`
- Index on `is_active`
- Index on `price`

### membership_benefits

This table stores information about benefits included in each membership type.

| Column             | Type                     | Description                                   |
|--------------------|--------------------------|-----------------------------------------------|
| benefit_id         | SERIAL                   | Primary key                                   |
| membership_id      | INTEGER                  | Reference to memberships table                |
| benefit_name       | VARCHAR(50)              | Name of the benefit                           |
| benefit_description| VARCHAR(255)             | Detailed description of the benefit           |
| created_at         | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at         | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Constraints:**
- PRIMARY KEY on `benefit_id`
- FOREIGN KEY on `membership_id` REFERENCES `memberships(membership_id)` ON DELETE CASCADE

**Indexes:**
- Index on `membership_id`
- Index on `benefit_name`

### member_memberships

This table stores the relationship between members and their memberships.

| Column               | Type                     | Description                                   |
|----------------------|--------------------------|-----------------------------------------------|
| member_membership_id | SERIAL                   | Primary key                                   |
| member_id            | INTEGER                  | Reference to members table                    |
| membership_id        | INTEGER                  | Reference to memberships table                |
| start_date           | TIMESTAMP WITH TIME ZONE | Start date of the membership                  |
| end_date             | TIMESTAMP WITH TIME ZONE | End date of the membership                    |
| payment_status       | VARCHAR(20)              | Status of payment (paid, pending, overdue)    |
| contract_signed      | BOOLEAN                  | Whether the contract has been signed          |
| created_at           | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at           | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Constraints:**
- PRIMARY KEY on `member_membership_id`
- FOREIGN KEY on `member_id` REFERENCES `members(member_id)` ON DELETE CASCADE
- FOREIGN KEY on `membership_id` REFERENCES `memberships(membership_id)` ON DELETE RESTRICT

**Indexes:**
- Index on `member_id`
- Index on `membership_id`
- Index on `start_date`
- Index on `end_date`
- Index on `payment_status`

### fitness_assessments

This table stores fitness assessment data for members.

| Column              | Type                     | Description                                    |
|---------------------|--------------------------|------------------------------------------------|
| assessment_id       | SERIAL                   | Primary key                                    |
| member_id           | INTEGER                  | Reference to members table                     |
| trainer_id          | INTEGER                  | ID of the trainer (from staff service)         |
| assessment_date     | TIMESTAMP WITH TIME ZONE | Date and time of assessment                    |
| height              | DECIMAL(5,2)             | Height in centimeters                          |
| weight              | DECIMAL(5,2)             | Weight in kilograms                            |
| body_fat_percentage | DECIMAL(5,2)             | Body fat percentage                            |
| bmi                 | DECIMAL(5,2)             | Body Mass Index                                |
| notes               | TEXT                     | Additional notes from the trainer              |
| goals_set           | TEXT                     | Fitness goals established during assessment    |
| next_assessment_date| TIMESTAMP WITH TIME ZONE | Scheduled date for next assessment             |
| created_at          | TIMESTAMP WITH TIME ZONE | Record creation timestamp                      |
| updated_at          | TIMESTAMP WITH TIME ZONE | Record last update timestamp                   |

**Constraints:**
- PRIMARY KEY on `assessment_id`
- FOREIGN KEY on `member_id` REFERENCES `members(member_id)` ON DELETE CASCADE

**Indexes:**
- Index on `member_id`
- Index on `trainer_id`
- Index on `assessment_date`
- Index on `next_assessment_date`

## Relationships

1. A **Member** can have multiple **Member-Memberships** (one-to-many)
2. A **Membership** can have multiple **Member-Memberships** (one-to-many)
3. A **Membership** can have multiple **Benefits** (one-to-many)
4. A **Member** can have multiple **Assessments** (one-to-many)
5. A **Trainer** can conduct multiple **Assessments** (one-to-many)

## Entity-Relationship Diagram

```
+------------+       +---------------------+       +------------------+
|            |       |                     |       |                  |
|  members   |------>| member_memberships  |<------| memberships      |
|            |       |                     |       |                  |
+------------+       +---------------------+       +------------------+
      |                                                    |
      |                                                    |
      v                                                    v
+---------------------+                          +---------------------+
|                     |                          |                     |
| fitness_assessments |                          | membership_benefits |
|                     |                          |                     |
+---------------------+                          +---------------------+
      ^
      |
      |
+------------+
|            |
|  trainers  |
| (external) |
|            |
+------------+
```
