# Staff Service API Documentation

This document outlines all the API endpoints provided by the Staff Service.

Base URL: `/api/v1`

## Staff

### Get All Staff

Returns a list of all staff members.

**Endpoint:** `GET /staff`

**Query Parameters:**
- `position` (optional): Filter by staff position
- `status` (optional): Filter by employment status (Active, Inactive)

**Response (200 OK):**
```json
[
  {
    "staff_id": 1,
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@fitness.com",
    "phone": "+1-555-1234",
    "address": "123 Main St, New York, NY",
    "position": "Manager",
    "hire_date": "2020-01-15T00:00:00Z",
    "salary": 65000.00,
    "status": "Active",
    "created_at": "2020-01-15T09:00:00Z",
    "updated_at": "2020-01-15T09:00:00Z"
  },
  {
    "staff_id": 2,
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@fitness.com",
    "phone": "+1-555-2345",
    "address": "456 Elm St, Los Angeles, CA",
    "position": "Trainer",
    "hire_date": "2020-03-20T00:00:00Z",
    "salary": 45000.00,
    "status": "Active",
    "created_at": "2020-03-20T09:00:00Z",
    "updated_at": "2020-03-20T09:00:00Z"
  }
]
```

### Get Staff by ID

Returns a specific staff member by their ID.

**Endpoint:** `GET /staff/{id}`

**Response (200 OK):**
```json
{
  "staff_id": 1,
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@fitness.com",
  "phone": "+1-555-1234",
  "address": "123 Main St, New York, NY",
  "position": "Manager",
  "hire_date": "2020-01-15T00:00:00Z",
  "salary": 65000.00,
  "status": "Active",
  "created_at": "2020-01-15T09:00:00Z",
  "updated_at": "2020-01-15T09:00:00Z"
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

### Update Staff

Updates an existing staff member.

**Endpoint:** `PUT /staff/{id}`

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

### Delete Staff

Deletes a staff member.

**Endpoint:** `DELETE /staff/{id}`

**Response (200 OK):**
```json
{
  "message": "Staff member deleted successfully"
}
```

### Get Staff Qualifications

Returns all qualifications for a specific staff member.

**Endpoint:** `GET /staff/{staffID}/qualifications`

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

## Trainers

### Get All Trainers

Returns a list of all trainers.

**Endpoint:** `GET /trainers`

**Query Parameters:**
- `specialization` (optional): Filter by specialization

**Response (200 OK):**
```json
[
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
    }
  },
  {
    "trainer_id": 2,
    "staff_id": 5,
    "specialization": "Yoga and Flexibility",
    "certification": "Registered Yoga Teacher 200",
    "experience": 4,
    "rating": 4.5,
    "created_at": "2021-02-15T10:00:00Z",
    "updated_at": "2021-02-15T10:00:00Z",
    "staff": {
      "staff_id": 5,
      "first_name": "David",
      "last_name": "Jones",
      "email": "david.jones@fitness.com",
      "phone": "+1-555-5678",
      "status": "Active"
    }
  }
]
```

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

## Qualifications

### Add Qualification

Adds a new qualification for a staff member.

**Endpoint:** `POST /qualifications`

**Request Body:**
```json
{
  "staff_id": 3,
  "qualification_name": "Nutritional Advisor",
  "issue_date": "2022-05-20T00:00:00Z",
  "expiry_date": "2026-05-20T00:00:00Z",
  "issuing_authority": "Nutrition Certification Board"
}
```

**Response (201 Created):**
```json
{
  "qualification_id": 3,
  "staff_id": 3,
  "qualification_name": "Nutritional Advisor",
  "issue_date": "2022-05-20T00:00:00Z",
  "expiry_date": "2026-05-20T00:00:00Z",
  "issuing_authority": "Nutrition Certification Board",
  "created_at": "2023-07-10T17:00:00Z",
  "updated_at": "2023-07-10T17:00:00Z"
}
```

### Update Qualification

Updates an existing qualification.

**Endpoint:** `PUT /qualifications/{id}`

**Request Body:**
```json
{
  "qualification_name": "Advanced Nutritional Advisor",
  "issue_date": "2022-05-20T00:00:00Z",
  "expiry_date": "2026-05-20T00:00:00Z",
  "issuing_authority": "Nutrition Certification Board"
}
```

**Response (200 OK):**
```json
{
  "qualification_id": 3,
  "staff_id": 3,
  "qualification_name": "Advanced Nutritional Advisor",
  "issue_date": "2022-05-20T00:00:00Z",
  "expiry_date": "2026-05-20T00:00:00Z",
  "issuing_authority": "Nutrition Certification Board",
  "created_at": "2023-07-10T17:00:00Z",
  "updated_at": "2023-07-10T17:30:00Z"
}
```

### Delete Qualification

Deletes a qualification.

**Endpoint:** `DELETE /qualifications/{id}`

**Response (200 OK):**
```json
{
  "message": "Qualification deleted successfully"
}
```

## Personal Training

### Get All Personal Training Sessions

Returns a list of all personal training sessions.

**Endpoint:** `GET /training-sessions`

**Query Parameters:**
- `status` (optional): Filter by status (Scheduled, Completed, Cancelled)
- `date` (optional): Filter by date (YYYY-MM-DD)
- `trainer_id` (optional): Filter by trainer
- `member_id` (optional): Filter by member

**Response (200 OK):**
```json
[
  {
    "session_id": 1,
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
      "trainer_id": 1,
      "staff_id": 2,
      "first_name": "Sarah",
      "last_name": "Johnson",
      "specialization": "Weight Loss"
    }
  },
  {
    "session_id": 2,
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
      "trainer_id": 2,
      "staff_id": 5,
      "first_name": "David",
      "last_name": "Jones",
      "specialization": "Yoga and Flexibility"
    }
  }
]
```

### Get Personal Training Session by ID

Returns a specific personal training session by its ID.

**Endpoint:** `GET /training-sessions/{id}`

**Response (200 OK):**
```json
{
  "session_id": 1,
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
    "trainer_id": 1,
    "staff_id": 2,
    "first_name": "Sarah",
    "last_name": "Johnson",
    "specialization": "Weight Loss"
  }
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

**Response (201 Created):**
```json
{
  "session_id": 3,
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

### Update Personal Training Session

Updates an existing personal training session.

**Endpoint:** `PUT /training-sessions/{id}`

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

**Response (200 OK):**
```json
{
  "session_id": 3,
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

### Cancel Personal Training Session

Cancels a personal training session.

**Endpoint:** `PUT /training-sessions/{id}/cancel`

**Response (200 OK):**
```json
{
  "session_id": 3,
  "member_id": 3,
  "trainer_id": 2,
  "session_date": "2023-07-21",
  "start_time": "16:00:00",
  "end_time": "17:00:00",
  "notes": "Flexibility and balance focus, plus core work",
  "status": "Cancelled",
  "price": 70.00,
  "created_at": "2023-07-10T18:00:00Z",
  "updated_at": "2023-07-10T19:00:00Z"
}
```

### Complete Personal Training Session

Marks a personal training session as completed.

**Endpoint:** `PUT /training-sessions/{id}/complete`

**Request Body:**
```json
{
  "notes": "Session completed successfully. Client made good progress on flexibility."
}
```

**Response (200 OK):**
```json
{
  "session_id": 2,
  "member_id": 2,
  "trainer_id": 2,
  "session_date": "2023-07-15",
  "start_time": "16:30:00",
  "end_time": "17:30:00",
  "notes": "Session completed successfully. Client made good progress on flexibility.",
  "status": "Completed",
  "price": 75.00,
  "created_at": "2023-07-05T14:00:00Z",
  "updated_at": "2023-07-15T17:45:00Z"
}
```

### Delete Personal Training Session

Deletes a personal training session.

**Endpoint:** `DELETE /training-sessions/{id}`

**Response (200 OK):**
```json
{
  "message": "Training session deleted successfully"
}
```
