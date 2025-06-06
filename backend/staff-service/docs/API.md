# Staff Service API Documentation

The Staff Service manages fitness center staff, trainers, qualifications, and personal training sessions within the Fitness Center application. This service provides RESTful APIs for staff management, trainer scheduling, and personal training coordination.

## Base URL

```
http://localhost:8002/api/v1
```

## Table of Contents

- [Staff Endpoints](#staff-endpoints)
- [Trainer Endpoints](#trainer-endpoints)
- [Qualification Endpoints](#qualification-endpoints)
- [Personal Training Endpoints](#personal-training-endpoints)
- [Health Check Endpoint](#health-check-endpoint)

## Staff Endpoints

### Get All Staff

Returns a list of all staff members with optional filtering and pagination support.

**Endpoint:** `GET /staff`

**Query Parameters:**
- `position` (optional): Filter by staff position (e.g., "Manager", "Trainer", "Receptionist")
- `status` (optional): Filter by employment status ("Active", "Inactive", "Leave", "Terminated")
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10, max: 100)

**Example Request:**
```
GET /api/v1/staff?position=Trainer&status=Active&page=1&pageSize=20
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@fitness.com",
    "phone": "+1-555-1234",
    "address": "123 Main St, New York, NY",
    "position": "Manager",
    "hire_date": "2020-01-15",
    "salary": 65000.00,
    "status": "Active",
    "created_at": "2020-01-15T09:00:00Z",
    "updated_at": "2020-01-15T09:00:00Z"
  },
  {
    "id": 2,
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@fitness.com",
    "phone": "+1-555-2345",
    "address": "456 Elm St, Los Angeles, CA",
    "position": "Trainer",
    "hire_date": "2020-03-20",
    "salary": 45000.00,
    "status": "Active",
    "created_at": "2020-03-20T09:00:00Z",
    "updated_at": "2020-03-20T09:00:00Z"
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "Invalid status value"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Database connection error"
  }
  ```

### Get Staff by ID

Returns a specific staff member by their ID.

**Endpoint:** `GET /staff/{id}`

**Path Parameters:**
- `id`: Staff ID (integer)

**Example Request:**
```
GET /api/v1/staff/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@fitness.com",
  "phone": "+1-555-1234",
  "address": "123 Main St, New York, NY",
  "position": "Manager",
  "hire_date": "2020-01-15",
  "salary": 65000.00,
  "status": "Active",
  "created_at": "2020-01-15T09:00:00Z",
  "updated_at": "2020-01-15T09:00:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Staff member not found"
}
```

### Create Staff

Creates a new staff member.

**Endpoint:** `POST /staff`

**Request Body:**
```json
{
  "first_name": "Michael",
  "last_name": "Brown",
  "email": "michael.brown@fitness.com",
  "phone": "+1-555-3456",
  "address": "789 Oak Ave, Chicago, IL",
  "position": "Trainer",
  "hire_date": "2024-01-10",
  "salary": 48000.00,
  "status": "Active"
}
```

**Field Validation:**
- `first_name`: Required, string
- `last_name`: Required, string  
- `email`: Required, valid email format, must be unique
- `phone`: Required, string
- `address`: Required, string
- `position`: Required, string
- `hire_date`: Required, date format "YYYY-MM-DD"
- `salary`: Required, must be greater than 0
- `status`: Required, one of: "Active", "Inactive", "Leave", "Terminated"

**Response (201 Created):**
```json
{
  "id": 3,
  "first_name": "Michael",
  "last_name": "Brown",
  "email": "michael.brown@fitness.com",
  "phone": "+1-555-3456",
  "address": "789 Oak Ave, Chicago, IL",
  "position": "Trainer",
  "hire_date": "2024-01-10",
  "salary": 48000.00,
  "status": "Active",
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-10T09:00:00Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid date format: parsing time \"2024-13-01\" as \"2006-01-02\": month out of range"
}
```

### Update Staff

Updates an existing staff member.

**Endpoint:** `PUT /staff/{id}`

**Path Parameters:**
- `id`: Staff ID (integer)

**Request Body:** Same as Create Staff

**Response (200 OK):** Same format as Get Staff by ID

**Response (404 Not Found):**
```json
{
  "error": "Staff member not found"
}
```

### Delete Staff

Deletes a staff member. This will also delete any associated qualifications and trainer records.

**Endpoint:** `DELETE /staff/{id}`

**Path Parameters:**
- `id`: Staff ID (integer)

**Response (200 OK):**
```json
{
  "message": "Staff member deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Staff member not found"
}
```

### Get Staff Qualifications

Returns all qualifications for a specific staff member.

**Endpoint:** `GET /staff/{id}/qualifications`

**Path Parameters:**
- `id`: Staff ID (integer)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "staff_id": 1,
    "qualification_name": "Personal Training Certification",
    "issue_date": "2020-01-01",
    "expiry_date": "2025-01-01",
    "issuing_authority": "National Academy of Sports Medicine",
    "created_at": "2020-01-01T09:00:00Z",
    "updated_at": "2020-01-01T09:00:00Z"
  }
]
```
  "address": "789 Oak St, Chicago, IL",
  "position": "Receptionist",
  "hire_date": "2023-07-10T00:00:00Z",
  "salary": 38000.00,
  "status": "Active"
}
```

**Response (201 Created):**
```json
{
  "staff_id": 3,
  "first_name": "Michael",
  "last_name": "Brown",
  "email": "michael.brown@fitness.com",
  "phone": "+1-555-3456",
  "address": "789 Oak St, Chicago, IL",
  "position": "Receptionist",
  "hire_date": "2023-07-10T00:00:00Z",
  "salary": 38000.00,
  "status": "Active",
  "created_at": "2023-07-10T10:00:00Z",
  "updated_at": "2023-07-10T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or validation error
- `409 Conflict`: Email already in use
- `500 Internal Server Error`: Server-side error

### Update Staff

Updates an existing staff member.

**Endpoint:** `PUT /staff/{id}`

**Path Parameters:**
- `id`: Staff ID (integer)

**Request Body:**
```json
{
  "first_name": "Michael",
  "last_name": "Brown",
  "email": "michael.brown@fitness.com",
  "phone": "+1-555-3456",
  "address": "321 Pine St, Chicago, IL",
  "position": "Senior Receptionist",
  "salary": 40000.00,
  "status": "Active"
}
```

**Response (200 OK):**
```json
{
  "staff_id": 3,
  "first_name": "Michael",
  "last_name": "Brown",
  "email": "michael.brown@fitness.com",
  "phone": "+1-555-3456",
  "address": "321 Pine St, Chicago, IL",
  "position": "Senior Receptionist",
  "hire_date": "2023-07-10T00:00:00Z",
  "salary": 40000.00,
  "status": "Active",
  "created_at": "2023-07-10T10:00:00Z",
  "updated_at": "2023-07-10T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid staff ID or request body
- `404 Not Found`: Staff member not found
- `409 Conflict`: Email already in use by another staff member
- `500 Internal Server Error`: Server-side error

### Delete Staff

Deletes a staff member.

**Endpoint:** `DELETE /staff/{id}`

**Path Parameters:**
- `id`: Staff ID (integer)

**Response (200 OK):**
```json
{
  "message": "Staff member deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid staff ID
- `404 Not Found`: Staff member not found
- `500 Internal Server Error`: Server-side error

### Get Staff Qualifications

Returns all qualifications for a specific staff member.

**Endpoint:** `GET /staff/{staffID}/qualifications`

**Path Parameters:**
- `staffID`: Staff ID (integer)

**Response (200 OK):**
```json
[
  {
    "qualification_id": 1,
    "staff_id": 2,
    "qualification_name": "Personal Trainer Certification",
    "issue_date": "2019-05-15T00:00:00Z",
    "expiry_date": "2023-05-15T00:00:00Z",
    "issuing_authority": "National Academy of Sports Medicine",
    "created_at": "2020-03-20T09:15:00Z",
    "updated_at": "2020-03-20T09:15:00Z"
  },
  {
    "qualification_id": 2,
    "staff_id": 2,
    "qualification_name": "First Aid & CPR",
    "issue_date": "2020-01-10T00:00:00Z",
    "expiry_date": "2022-01-10T00:00:00Z",
    "issuing_authority": "American Red Cross",
    "created_at": "2020-03-20T09:18:00Z",
    "updated_at": "2020-03-20T09:18:00Z"
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid staff ID
- `404 Not Found`: Staff member not found
- `500 Internal Server Error`: Server-side error

## Trainer Endpoints

### Get All Trainers

Returns a list of all trainers with optional filtering by specialization.

**Endpoint:** `GET /trainers`

**Query Parameters:**
- `specialization` (optional): Filter by trainer specialization
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Example Request:**
```
GET /api/v1/trainers?specialization=Weight%20Loss&page=1&pageSize=20
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "staff_id": 2,
      "specialization": "Weight Loss",
      "certification": "NASM Certified Personal Trainer",
      "experience": 5,
      "rating": 4.7,
      "is_active": true,
      "created_at": "2020-03-20T09:30:00Z",
      "updated_at": "2020-03-20T09:30:00Z",
      "staff": {
        "id": 2,
        "first_name": "Sarah",
        "last_name": "Johnson",
        "email": "sarah.johnson@fitness.com",
        "phone": "+1-555-2345",
        "position": "Trainer",
        "status": "Active"
      }
    },
    {
      "id": 2,
      "staff_id": 5,
      "specialization": "Yoga and Flexibility",
      "certification": "Registered Yoga Teacher 200",
      "experience": 4,
      "rating": 4.5,
      "is_active": true,
      "created_at": "2021-02-15T10:00:00Z",
      "updated_at": "2021-02-15T10:00:00Z",
      "staff": {
        "id": 5,
        "first_name": "David",
        "last_name": "Jones",
        "email": "david.jones@fitness.com",
        "phone": "+1-555-5678",
        "position": "Trainer",
        "status": "Active"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

### Get Trainer by ID

Returns a specific trainer by their ID.

**Endpoint:** `GET /trainers/{id}`

**Path Parameters:**
- `id`: Trainer ID (integer)

**Response (200 OK):**
```json
{
  "id": 1,
  "staff_id": 2,
  "specialization": "Weight Loss",
  "certification": "NASM Certified Personal Trainer",
  "experience": 5,
  "rating": 4.7,
  "is_active": true,
  "created_at": "2020-03-20T09:30:00Z",
  "updated_at": "2020-03-20T09:30:00Z",
  "staff": {
    "id": 2,
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@fitness.com",
    "phone": "+1-555-2345",
    "position": "Trainer",
    "status": "Active"
  }
}
```

### Create Trainer

Creates a new trainer record for an existing staff member.

**Endpoint:** `POST /trainers`

**Request Body:**
```json
{
  "staff_id": 3,
  "specialization": "Strength Training",
  "certification": "ACSM Certified Personal Trainer",
  "experience": 3,
  "rating": 0.0,
  "is_active": true
}
```

**Field Validation:**
- `staff_id`: Required, must reference existing staff member
- `specialization`: Required, string
- `certification`: Required, string
- `experience`: Required, integer >= 0 (years)
- `rating`: Required, float 0.0-5.0
- `is_active`: Boolean (default: true)

**Response (201 Created):**
```json
{
  "id": 3,
  "staff_id": 3,
  "specialization": "Strength Training",
  "certification": "ACSM Certified Personal Trainer",
  "experience": 3,
  "rating": 0.0,
  "is_active": true,
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-10T09:00:00Z"
}
```

### Update Trainer

Updates an existing trainer record.

**Endpoint:** `PUT /trainers/{id}`

**Path Parameters:**
- `id`: Trainer ID (integer)

**Request Body:** Same format as Create Trainer

**Response (200 OK):** Same format as Get Trainer by ID

### Delete Trainer

Deletes a trainer record. Cannot delete if trainer has active training sessions.

**Endpoint:** `DELETE /trainers/{id}`

**Path Parameters:**
- `id`: Trainer ID (integer)

**Response (200 OK):**
```json
{
  "message": "Trainer deleted successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Cannot delete trainer with active training sessions"
}
```

### Get Top Rated Trainers

Returns the highest-rated trainers.

**Endpoint:** `GET /trainers/top-rated`

**Query Parameters:**
- `limit` (optional): Number of trainers to return (default: 10)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "staff_id": 2,
    "specialization": "Weight Loss",
    "certification": "NASM Certified Personal Trainer",
    "experience": 5,
    "rating": 4.9,
    "is_active": true,
    "staff": {
      "id": 2,
      "first_name": "Sarah",
      "last_name": "Johnson"
    }
  }
]
```

### Get Trainers by Specialization

Returns trainers filtered by specialization.

**Endpoint:** `GET /trainers/specialization/{spec}`

**Path Parameters:**
- `spec`: Specialization name (URL encoded)

**Example:**
```
GET /api/v1/trainers/specialization/Weight%20Loss
```

**Response (200 OK):** Same format as Get All Trainers

### Get Trainer by ID

Returns a specific trainer by their ID.

**Endpoint:** `GET /trainers/{id}`

**Response (200 OK):**
```json
{
  "trainer_id": 1,
  "staff_id": 2,
  "specialization": "Weight Loss",
  "certification": "NASM Certified Personal Trainer",
  "experience": 5,
  "rating": 4.7,
  "created_at": "2020-03-20T09:30:00Z",
  "updated_at": "2020-03-20T09:30:00Z",
  "staff": {
    "staff_id": 2,
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@fitness.com",
    "phone": "+1-555-2345",
    "status": "Active"
  },
  "qualifications": [
    {
      "qualification_id": 1,
      "qualification_name": "Personal Trainer Certification",
      "issue_date": "2019-05-15T00:00:00Z",
      "expiry_date": "2023-05-15T00:00:00Z",
      "issuing_authority": "National Academy of Sports Medicine"
    },
    {
      "qualification_id": 2,
      "qualification_name": "First Aid & CPR",
      "issue_date": "2020-01-10T00:00:00Z",
      "expiry_date": "2022-01-10T00:00:00Z",
      "issuing_authority": "American Red Cross"
    }
  ]
}
```

### Create Trainer

Creates a new trainer record for an existing staff member.

**Endpoint:** `POST /trainers`

**Request Body:**
```json
{
  "staff_id": 3,
  "specialization": "Senior Fitness",
  "certification": "ACE Senior Fitness Specialist",
  "experience": 2,
  "rating": 4.2
}
```

**Response (201 Created):**
```json
{
  "trainer_id": 3,
  "staff_id": 3,
  "specialization": "Senior Fitness",
  "certification": "ACE Senior Fitness Specialist",
  "experience": 2,
  "rating": 4.2,
  "created_at": "2023-07-10T15:00:00Z",
  "updated_at": "2023-07-10T15:00:00Z"
}
```

### Update Trainer

Updates an existing trainer record.

**Endpoint:** `PUT /trainers/{id}`

**Request Body:**
```json
{
  "specialization": "Senior Fitness and Rehabilitation",
  "certification": "ACE Senior Fitness Specialist, NASM Corrective Exercise Specialist",
  "experience": 3,
  "rating": 4.3
}
```

**Response (200 OK):**
```json
{
  "trainer_id": 3,
  "staff_id": 3,
  "specialization": "Senior Fitness and Rehabilitation",
  "certification": "ACE Senior Fitness Specialist, NASM Corrective Exercise Specialist",
  "experience": 3,
  "rating": 4.3,
  "created_at": "2023-07-10T15:00:00Z",
  "updated_at": "2023-07-10T16:30:00Z"
}
```

### Delete Trainer

Deletes a trainer record. This does not delete the associated staff record.

**Endpoint:** `DELETE /trainers/{id}`

**Response (200 OK):**
```json
{
  "message": "Trainer record deleted successfully"
}
```

## Qualification Endpoints

### Get All Qualifications

Returns a list of all qualifications with optional pagination.

**Endpoint:** `GET /qualifications`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 20)

**Response (200 OK) - Paginated:**
```json
{
  "data": [
    {
      "id": 1,
      "staff_id": 2,
      "qualification_name": "Personal Trainer Certification",
      "issue_date": "2019-05-15",
      "expiry_date": "2023-05-15",
      "issuing_authority": "National Academy of Sports Medicine",
      "created_at": "2020-03-20T09:15:00Z",
      "updated_at": "2020-03-20T09:15:00Z"
    },
    {
      "id": 2,
      "staff_id": 2,
      "qualification_name": "First Aid & CPR",
      "issue_date": "2020-01-10",
      "expiry_date": "2022-01-10",
      "issuing_authority": "American Red Cross",
      "created_at": "2020-03-20T09:18:00Z",
      "updated_at": "2020-03-20T09:18:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

**Response (200 OK) - Non-paginated:**
```json
[
  {
    "id": 1,
    "staff_id": 2,
    "qualification_name": "Personal Trainer Certification",
    "issue_date": "2019-05-15",
    "expiry_date": "2023-05-15",
    "issuing_authority": "National Academy of Sports Medicine",
    "created_at": "2020-03-20T09:15:00Z",
    "updated_at": "2020-03-20T09:15:00Z"
  }
]
```

### Get Qualification by ID

Returns a specific qualification.

**Endpoint:** `GET /qualifications/{id}`

**Path Parameters:**
- `id`: Qualification ID (integer)

**Response (200 OK):**
```json
{
  "id": 1,
  "staff_id": 2,
  "qualification_name": "Personal Trainer Certification",
  "issue_date": "2019-05-15",
  "expiry_date": "2023-05-15",
  "issuing_authority": "National Academy of Sports Medicine",
  "created_at": "2020-03-20T09:15:00Z",
  "updated_at": "2020-03-20T09:15:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Qualification not found"
}
```

### Create Qualification

Creates a new qualification for a staff member.

**Endpoint:** `POST /qualifications`

**Request Body:**
```json
{
  "staff_id": 3,
  "qualification_name": "Nutritional Advisor",
  "issue_date": "2022-05-20",
  "expiry_date": "2026-05-20",
  "issuing_authority": "Nutrition Certification Board"
}
```

**Field Validation:**
- `staff_id`: Required, must reference existing staff member
- `qualification_name`: Required, string
- `issue_date`: Required, date format (YYYY-MM-DD)
- `expiry_date`: Required, date format (YYYY-MM-DD)
- `issuing_authority`: Required, string

**Response (201 Created):**
```json
{
  "id": 3,
  "staff_id": 3,
  "qualification_name": "Nutritional Advisor",
  "issue_date": "2022-05-20",
  "expiry_date": "2026-05-20",
  "issuing_authority": "Nutrition Certification Board",
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-10T09:00:00Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid date format: parsing time \"2024-13-01\" as \"2006-01-02\": month out of range"
}
```

### Update Qualification

Updates an existing qualification. All fields are optional for partial updates.

**Endpoint:** `PUT /qualifications/{id}`

**Path Parameters:**
- `id`: Qualification ID (integer)

**Request Body:**
```json
{
  "qualification_name": "Advanced Nutritional Advisor",
  "issue_date": "2022-05-20",
  "expiry_date": "2026-05-20",
  "issuing_authority": "Advanced Nutrition Certification Board"
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "staff_id": 3,
  "qualification_name": "Advanced Nutritional Advisor",
  "issue_date": "2022-05-20",
  "expiry_date": "2026-05-20",
  "issuing_authority": "Advanced Nutrition Certification Board",
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-10T09:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Qualification not found"
}
```

### Delete Qualification

Deletes a qualification.

**Endpoint:** `DELETE /qualifications/{id}`

**Path Parameters:**
- `id`: Qualification ID (integer)

**Response (200 OK):**
```json
{
  "message": "Qualification deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Qualification not found"
}
```

## Personal Training Endpoints

### Get All Personal Training Sessions

Returns a list of all personal training sessions with optional filtering and pagination support.

**Endpoint:** `GET /training-sessions`

**Query Parameters:**
- `status` (optional): Filter by status (Scheduled, Completed, Cancelled)
- `date` (optional): Filter by date (YYYY-MM-DD format)
- `trainer_id` (optional): Filter by trainer ID
- `member_id` (optional): Filter by member ID
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Example Request:**
```
GET /api/v1/training-sessions?status=Scheduled&page=1&pageSize=20
```

**Response (200 OK) - Without Pagination:**
```json
[
  {
    "id": 1,
    "member_id": 1,
    "trainer_id": 1,
    "session_date": "2023-07-10",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "notes": "Focus on cardio and core strength",
    "status": "Completed",
    "price": 75.00,
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-10T10:15:00Z",
    "trainer": {
      "id": 1,
      "staff_id": 2,
      "specialization": "Weight Loss",
      "certification": "NASM Certified Personal Trainer",
      "experience": 5,
      "rating": 4.7,
      "is_active": true,
      "staff": {
        "id": 2,
        "first_name": "Sarah",
        "last_name": "Johnson",
        "email": "sarah.johnson@fitness.com",
        "phone": "+1-555-2345",
        "position": "Trainer",
        "status": "Active"
      }
    }
  },
  {
    "id": 2,
    "member_id": 2,
    "trainer_id": 2,
    "session_date": "2023-07-15",
    "start_time": "16:30:00",
    "end_time": "17:30:00",
    "notes": "CrossFit introduction",
    "status": "Scheduled",
    "price": 75.00,
    "created_at": "2023-07-05T14:00:00Z",
    "updated_at": "2023-07-05T14:00:00Z",
    "trainer": {
      "id": 2,
      "staff_id": 5,
      "specialization": "Yoga and Flexibility",
      "certification": "Registered Yoga Teacher 200",
      "experience": 4,
      "rating": 4.5,
      "is_active": true,
      "staff": {
        "id": 5,
        "first_name": "David",
        "last_name": "Jones",
        "email": "david.jones@fitness.com",
        "phone": "+1-555-5678",
        "position": "Trainer",
        "status": "Active"
      }
    }
  }
]
```

**Response (200 OK) - With Pagination:**
```json
{
  "data": [
    {
      "id": 1,
      "member_id": 1,
      "trainer_id": 1,
      "session_date": "2023-07-10",
      "start_time": "09:00:00",
      "end_time": "10:00:00",
      "notes": "Focus on cardio and core strength",
      "status": "Completed",
      "price": 75.00,
      "created_at": "2023-07-01T10:00:00Z",
      "updated_at": "2023-07-10T10:15:00Z",
      "trainer": {
        "id": 1,
        "staff_id": 2,
        "specialization": "Weight Loss",
        "certification": "NASM Certified Personal Trainer",
        "experience": 5,
        "rating": 4.7,
        "is_active": true,
        "staff": {
          "id": 2,
          "first_name": "Sarah",
          "last_name": "Johnson",
          "email": "sarah.johnson@fitness.com",
          "phone": "+1-555-2345",
          "position": "Trainer",
          "status": "Active"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "Invalid date format. Use YYYY-MM-DD"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Database connection error"
  }
  ```

### Get Personal Training Session by ID

Returns a specific personal training session by its ID.

**Endpoint:** `GET /training-sessions/{id}`

**Path Parameters:**
- `id`: Training session ID (integer)

**Response (200 OK):**
```json
{
  "id": 1,
  "member_id": 1,
  "trainer_id": 1,
  "session_date": "2023-07-10",
  "start_time": "09:00:00",
  "end_time": "10:00:00",
  "notes": "Focus on cardio and core strength",
  "status": "Completed",
  "price": 75.00,
  "created_at": "2023-07-01T10:00:00Z",
  "updated_at": "2023-07-10T10:15:00Z",
  "trainer": {
    "id": 1,
    "staff_id": 2,
    "specialization": "Weight Loss",
    "certification": "NASM Certified Personal Trainer",
    "experience": 5,
    "rating": 4.7,
    "is_active": true,
    "staff": {
      "id": 2,
      "first_name": "Sarah",
      "last_name": "Johnson",
      "email": "sarah.johnson@fitness.com",
      "phone": "+1-555-2345",
      "position": "Trainer",
      "status": "Active"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid training session ID
  ```json
  {
    "error": "Invalid training session ID"
  }
  ```
- `404 Not Found`: Training session not found
  ```json
  {
    "error": "Training session not found"
  }
  ```

### Create Personal Training Session

Creates a new personal training session.

**Endpoint:** `POST /training-sessions`

**Request Body:**
```json
{
  "member_id": 3,
  "trainer_id": 2,
  "session_date": "2023-07-20",
  "start_time": "15:00:00",
  "end_time": "16:00:00",
  "notes": "Flexibility and balance focus",
  "status": "Scheduled",
  "price": 70.00
}
```

**Field Validation:**
- `member_id`: Required, integer
- `trainer_id`: Required, integer
- `session_date`: Required, date in YYYY-MM-DD format
- `start_time`: Required, time in HH:MM:SS format
- `end_time`: Required, time in HH:MM:SS format
- `notes`: Optional, string
- `status`: Required, one of: "Scheduled", "Completed", "Cancelled"
- `price`: Required, number >= 0

**Response (201 Created):**
```json
{
  "id": 3,
  "member_id": 3,
  "trainer_id": 2,
  "session_date": "2023-07-20",
  "start_time": "15:00:00",
  "end_time": "16:00:00",
  "notes": "Flexibility and balance focus",
  "status": "Scheduled",
  "price": 70.00,
  "created_at": "2023-07-10T18:00:00Z",
  "updated_at": "2023-07-10T18:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
  ```json
  {
    "error": "Invalid date format. Use YYYY-MM-DD"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Failed to create training session"
  }
  ```

### Update Personal Training Session

Updates an existing personal training session. Member ID and Trainer ID are preserved from the existing session.

**Endpoint:** `PUT /training-sessions/{id}`

**Path Parameters:**
- `id`: Training session ID (integer)

**Request Body:**
```json
{
  "session_date": "2023-07-21",
  "start_time": "16:00:00",
  "end_time": "17:00:00",
  "notes": "Flexibility and balance focus, plus core work",
  "status": "Scheduled",
  "price": 70.00
}
```

**Field Validation:**
- `session_date`: Optional, date in YYYY-MM-DD format
- `start_time`: Optional, time in HH:MM:SS format
- `end_time`: Optional, time in HH:MM:SS format
- `notes`: Optional, string
- `status`: Optional, one of: "Scheduled", "Completed", "Cancelled"
- `price`: Optional, number >= 0

**Note:** When updating a training session, you don't need to include `member_id` and `trainer_id`. These values will be preserved from the existing session.

**Response (200 OK):**
```json
{
  "id": 3,
  "member_id": 3,
  "trainer_id": 2,
  "session_date": "2023-07-21",
  "start_time": "16:00:00",
  "end_time": "17:00:00",
  "notes": "Flexibility and balance focus, plus core work",
  "status": "Scheduled",
  "price": 70.00,
  "created_at": "2023-07-10T18:00:00Z",
  "updated_at": "2023-07-10T18:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid training session ID or request data
  ```json
  {
    "error": "Invalid training session ID"
  }
  ```
- `404 Not Found`: Training session not found
  ```json
  {
    "error": "Training session not found"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Failed to update training session"
  }
  ```

### Cancel Personal Training Session

Cancels a personal training session by setting its status to "Cancelled".

**Endpoint:** `PUT /training-sessions/{id}/cancel`

**Path Parameters:**
- `id`: Training session ID (integer)

**Response (200 OK):**
```json
{
  "message": "Training session cancelled successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid training session ID
  ```json
  {
    "error": "Invalid training session ID"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Failed to cancel training session"
  }
  ```

### Complete Personal Training Session

Marks a personal training session as completed by setting its status to "Completed".

**Endpoint:** `PUT /training-sessions/{id}/complete`

**Path Parameters:**
- `id`: Training session ID (integer)

**Response (200 OK):**
```json
{
  "message": "Training session marked as completed"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid training session ID
  ```json
  {
    "error": "Invalid training session ID"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Failed to complete training session"
  }
  ```

### Delete Personal Training Session

Permanently deletes a personal training session.

**Endpoint:** `DELETE /training-sessions/{id}`

**Path Parameters:**
- `id`: Training session ID (integer)

**Response (200 OK):**
```json
{
  "message": "Training session deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid training session ID
  ```json
  {
    "error": "Invalid training session ID"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Failed to delete training session"
  }
  ```

## Health Check Endpoint

### Health Check

Returns the health status of the Staff Service.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "staff-service",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2025-06-04T10:00:00Z"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "service": "staff-service",
  "database": "disconnected",
  "error": "Database connection failed"
}
```
