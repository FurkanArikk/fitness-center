# Member Service API Documentation

This document outlines all the API endpoints provided by the Member Service.

Base URL: `/api/v1`

## Members

### Get All Members

Returns a list of all members, with optional pagination.

**Endpoint:** `GET /members`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `size` (optional): Number of items per page

**Response (200 OK):**
```json
[
  {
    "member_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "address": "123 Main St",
    "date_of_birth": "1990-01-15T00:00:00Z",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "555-987-6543",
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z"
  },
  {
    "member_id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "555-234-5678",
    "address": "456 Oak St",
    "date_of_birth": "1985-05-20T00:00:00Z",
    "emergency_contact_name": "John Smith",
    "emergency_contact_phone": "555-876-5432",
    "created_at": "2023-07-02T11:00:00Z",
    "updated_at": "2023-07-02T11:00:00Z"
  }
]
```

### Get Member by ID

Returns a specific member by their ID.

**Endpoint:** `GET /members/{id}`

**Response (200 OK):**
```json
{
  "member_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "address": "123 Main St",
  "date_of_birth": "1990-01-15T00:00:00Z",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "555-987-6543",
  "created_at": "2023-07-01T10:00:00Z",
  "updated_at": "2023-07-01T10:00:00Z"
}
```

### Create Member

Creates a new member.

**Endpoint:** `POST /members`

**Request Body:**
```json
{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "555-345-6789",
  "address": "789 Pine St",
  "date_of_birth": "1992-08-10T00:00:00Z",
  "emergency_contact_name": "Michael Johnson",
  "emergency_contact_phone": "555-765-4321"
}
```

**Response (201 Created):**
```json
{
  "member_id": 3,
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "555-345-6789",
  "address": "789 Pine St",
  "date_of_birth": "1992-08-10T00:00:00Z",
  "emergency_contact_name": "Michael Johnson",
  "emergency_contact_phone": "555-765-4321",
  "created_at": "2023-07-15T10:00:00Z",
  "updated_at": "2023-07-15T10:00:00Z"
}
```

### Update Member

Updates an existing member.

**Endpoint:** `PUT /members/{id}`

**Request Body:**
```json
{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "555-999-8888",
  "address": "101 Cedar St",
  "emergency_contact_name": "Michael Johnson",
  "emergency_contact_phone": "555-777-6666"
}
```

**Response (200 OK):**
```json
{
  "member_id": 3,
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "555-999-8888",
  "address": "101 Cedar St",
  "date_of_birth": "1992-08-10T00:00:00Z",
  "emergency_contact_name": "Michael Johnson",
  "emergency_contact_phone": "555-777-6666",
  "created_at": "2023-07-15T10:00:00Z",
  "updated_at": "2023-07-15T11:30:00Z"
}
```

### Delete Member

Deletes a member. This will fail if the member has any active memberships.

**Endpoint:** `DELETE /members/{id}`

**Response (200 OK):**
```json
{
  "message": "Member deleted successfully"
}
```

### Get Member Memberships

Returns all memberships for a specific member.

**Endpoint:** `GET /members/{memberID}/memberships`

**Response (200 OK):**
```json
[
  {
    "member_membership_id": 1,
    "member_id": 1,
    "membership_id": 2,
    "start_date": "2023-07-01T00:00:00Z",
    "end_date": "2023-10-01T00:00:00Z",
    "payment_status": "paid",
    "contract_signed": true,
    "created_at": "2023-06-30T14:00:00Z",
    "updated_at": "2023-06-30T14:00:00Z",
    "membership_name": "Gold",
    "membership_description": "Full access with premium features"
  }
]
```

### Get Active Membership

Returns the active membership for a specific member.

**Endpoint:** `GET /members/{memberID}/active-membership`

**Response (200 OK):**
```json
{
  "member_membership_id": 1,
  "member_id": 1,
  "membership_id": 2,
  "start_date": "2023-07-01T00:00:00Z",
  "end_date": "2023-10-01T00:00:00Z",
  "payment_status": "paid",
  "contract_signed": true,
  "created_at": "2023-06-30T14:00:00Z",
  "updated_at": "2023-06-30T14:00:00Z",
  "membership_name": "Gold",
  "membership_description": "Full access with premium features"
}
```

## Memberships

### Get All Memberships

Returns a list of all membership types, optionally filtered by active status.

**Endpoint:** `GET /memberships`

**Query Parameters:**
- `active` (optional): Filter by active status (true/false)

**Response (200 OK):**
```json
[
  {
    "membership_id": 1,
    "membership_name": "Basic",
    "description": "Access to gym facilities during standard hours",
    "duration": 1,
    "price": 29.99,
    "is_active": true,
    "created_at": "2023-06-01T10:00:00Z",
    "updated_at": "2023-06-01T10:00:00Z"
  },
  {
    "membership_id": 2,
    "membership_name": "Gold",
    "description": "Full access with premium features",
    "duration": 3,
    "price": 49.99,
    "is_active": true,
    "created_at": "2023-06-01T11:00:00Z",
    "updated_at": "2023-06-01T11:00:00Z"
  }
]
```

### Get Membership by ID

Returns a specific membership type by its ID.

**Endpoint:** `GET /memberships/{id}`

**Response (200 OK):**
```json
{
  "membership_id": 1,
  "membership_name": "Basic",
  "description": "Access to gym facilities during standard hours",
  "duration": 1,
  "price": 29.99,
  "is_active": true,
  "created_at": "2023-06-01T10:00:00Z",
  "updated_at": "2023-06-01T10:00:00Z"
}
```

### Create Membership

Creates a new membership type.

**Endpoint:** `POST /memberships`

**Request Body:**
```json
{
  "membership_name": "Premium",
  "description": "Full access to gym facilities and group classes",
  "duration": 3,
  "price": 49.99,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "membership_id": 3,
  "membership_name": "Premium",
  "description": "Full access to gym facilities and group classes",
  "duration": 3,
  "price": 49.99,
  "is_active": true,
  "created_at": "2023-07-15T12:00:00Z",
  "updated_at": "2023-07-15T12:00:00Z"
}
```

### Update Membership

Updates an existing membership type.

**Endpoint:** `PUT /memberships/{id}`

**Request Body:**
```json
{
  "membership_name": "Premium Plus",
  "description": "Enhanced Premium membership with additional benefits",
  "duration": 3,
  "price": 59.99,
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "membership_id": 3,
  "membership_name": "Premium Plus",
  "description": "Enhanced Premium membership with additional benefits",
  "duration": 3,
  "price": 59.99,
  "is_active": true,
  "created_at": "2023-07-15T12:00:00Z",
  "updated_at": "2023-07-15T14:30:00Z"
}
```

### Delete Membership

Deletes a membership type. This will fail if the membership is used by any members.

**Endpoint:** `DELETE /memberships/{id}`

**Response (200 OK):**
```json
{
  "message": "Membership deleted successfully"
}
```

### Toggle Membership Status

Toggles the active status of a membership.

**Endpoint:** `PUT /memberships/{id}/status`

**Request Body:**
```json
{
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "membership_id": 3,
  "membership_name": "Premium Plus",
  "description": "Enhanced Premium membership with additional benefits",
  "duration": 3,
  "price": 59.99,
  "is_active": false,
  "created_at": "2023-07-15T12:00:00Z",
  "updated_at": "2023-07-15T15:00:00Z"
}
```

### Get Membership Benefits

Returns benefits for a specific membership type.

**Endpoint:** `GET /memberships/{membershipID}/benefits`

**Response (200 OK):**
```json
[
  {
    "benefit_id": 1,
    "membership_id": 2,
    "benefit_name": "Gym Access",
    "benefit_description": "Full access to gym equipment 24/7",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  },
  {
    "benefit_id": 2,
    "membership_id": 2,
    "benefit_name": "Group Classes",
    "benefit_description": "Access to all group fitness classes",
    "created_at": "2023-06-01T12:05:00Z",
    "updated_at": "2023-06-01T12:05:00Z"
  }
]
```

## Benefits

### Get All Benefits

Returns a list of all benefits.

**Endpoint:** `GET /benefits`

**Response (200 OK):**
```json
[
  {
    "benefit_id": 1,
    "membership_id": 2,
    "benefit_name": "Gym Access",
    "benefit_description": "Full access to gym equipment 24/7",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  },
  {
    "benefit_id": 2,
    "membership_id": 2,
    "benefit_name": "Group Classes",
    "benefit_description": "Access to all group fitness classes",
    "created_at": "2023-06-01T12:05:00Z",
    "updated_at": "2023-06-01T12:05:00Z"
  }
]
```

### Get Benefit by ID

Returns a specific benefit by its ID.

**Endpoint:** `GET /benefits/{id}`

**Response (200 OK):**
```json
{
  "benefit_id": 1,
  "membership_id": 2,
  "benefit_name": "Gym Access",
  "benefit_description": "Full access to gym equipment 24/7",
  "created_at": "2023-06-01T12:00:00Z",
  "updated_at": "2023-06-01T12:00:00Z"
}
```

### Create Benefit

Creates a new benefit.

**Endpoint:** `POST /benefits`

**Request Body:**
```json
{
  "membership_id": 3,
  "benefit_name": "Personal Training Session",
  "benefit_description": "One free personal training session per month"
}
```

**Response (201 Created):**
```json
{
  "benefit_id": 3,
  "membership_id": 3,
  "benefit_name": "Personal Training Session",
  "benefit_description": "One free personal training session per month",
  "created_at": "2023-07-15T14:00:00Z",
  "updated_at": "2023-07-15T14:00:00Z"
}
```

### Update Benefit

Updates an existing benefit.

**Endpoint:** `PUT /benefits/{id}`

**Request Body:**
```json
{
  "membership_id": 3,
  "benefit_name": "Personal Training Sessions",
  "benefit_description": "Two free personal training sessions per month"
}
```

**Response (200 OK):**
```json
{
  "benefit_id": 3,
  "membership_id": 3,
  "benefit_name": "Personal Training Sessions",
  "benefit_description": "Two free personal training sessions per month",
  "created_at": "2023-07-15T14:00:00Z",
  "updated_at": "2023-07-15T14:30:00Z"
}
```

### Delete Benefit

Deletes a benefit.

**Endpoint:** `DELETE /benefits/{id}`

**Response (200 OK):**
```json
{
  "message": "Benefit deleted successfully"
}
```

## Assessments

### Create Assessment

Creates a new fitness assessment.

**Endpoint:** `POST /assessments`

**Request Body:**
```json
{
  "member_id": 1,
  "trainer_id": 2,
  "assessment_date": "2023-07-15T10:00:00Z",
  "height": 175,
  "weight": 78.5,
  "body_fat_percentage": 17.0,
  "bmi": 25.6,
  "notes": "Monthly checkup",
  "goals_set": "Maintain current fitness level",
  "next_assessment_date": "2023-08-15T10:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "assessment_id": 1,
  "member_id": 1,
  "trainer_id": 2,
  "assessment_date": "2023-07-15T10:00:00Z",
  "height": 175,
  "weight": 78.5,
  "body_fat_percentage": 17.0,
  "bmi": 25.6,
  "notes": "Monthly checkup",
  "goals_set": "Maintain current fitness level",
  "next_assessment_date": "2023-08-15T10:00:00Z",
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z"
}
```

### Get Assessment by ID

Returns a specific assessment by its ID.

**Endpoint:** `GET /assessments/{id}`

**Response (200 OK):**
```json
{
  "assessment_id": 1,
  "member_id": 1,
  "trainer_id": 2,
  "assessment_date": "2023-07-15T10:00:00Z",
  "height": 175,
  "weight": 78.5,
  "body_fat_percentage": 17.0,
  "bmi": 25.6,
  "notes": "Monthly checkup",
  "goals_set": "Maintain current fitness level",
  "next_assessment_date": "2023-08-15T10:00:00Z",
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T10:30:00Z"
}
```

### Update Assessment

Updates an existing assessment.

**Endpoint:** `PUT /assessments/{id}`

**Request Body:**
```json
{
  "member_id": 1,
  "trainer_id": 2,
  "assessment_date": "2023-07-15T10:00:00Z",
  "height": 175,
  "weight": 77.0,
  "body_fat_percentage": 16.5,
  "bmi": 25.1,
  "notes": "Great progress",
  "goals_set": "Continue strength training",
  "next_assessment_date": "2023-08-15T10:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "assessment_id": 1,
  "member_id": 1,
  "trainer_id": 2,
  "assessment_date": "2023-07-15T10:00:00Z",
  "height": 175,
  "weight": 77.0,
  "body_fat_percentage": 16.5,
  "bmi": 25.1,
  "notes": "Great progress",
  "goals_set": "Continue strength training",
  "next_assessment_date": "2023-08-15T10:00:00Z",
  "created_at": "2023-07-15T10:30:00Z",
  "updated_at": "2023-07-15T15:00:00Z"
}
```

### Delete Assessment

Deletes an assessment.

**Endpoint:** `DELETE /assessments/{id}`

**Response (200 OK):**
```json
{
  "message": "Assessment deleted successfully"
}
```

## Member-Membership

### Create Member-Membership

Creates a new relationship between a member and a membership.

**Endpoint:** `POST /member-memberships`

**Request Body:**
```json
{
  "member_id": 1,
  "membership_id": 2,
  "start_date": "2023-07-01T00:00:00Z",
  "end_date": "2023-10-01T00:00:00Z",
  "payment_status": "paid",
  "contract_signed": true
}
```

**Response (201 Created):**
```json
{
  "member_membership_id": 1,
  "member_id": 1,
  "membership_id": 2,
  "start_date": "2023-07-01T00:00:00Z",
  "end_date": "2023-10-01T00:00:00Z",
  "payment_status": "paid",
  "contract_signed": true,
  "created_at": "2023-06-30T14:00:00Z",
  "updated_at": "2023-06-30T14:00:00Z"
}
```

### Get Member-Membership by ID

Returns a specific member-membership relationship by its ID.

**Endpoint:** `GET /member-memberships/{id}`

**Response (200 OK):**
```json
{
  "member_membership_id": 1,
  "member_id": 1,
  "membership_id": 2,
  "start_date": "2023-07-01T00:00:00Z",
  "end_date": "2023-10-01T00:00:00Z",
  "payment_status": "paid",
  "contract_signed": true,
  "created_at": "2023-06-30T14:00:00Z",
  "updated_at": "2023-06-30T14:00:00Z"
}
```

### Update Member-Membership

Updates an existing member-membership relationship.

**Endpoint:** `PUT /member-memberships/{id}`

**Request Body:**
```json
{
  "member_id": 1,
  "membership_id": 2,
  "start_date": "2023-07-01T00:00:00Z",
  "end_date": "2023-12-01T00:00:00Z",
  "payment_status": "paid",
  "contract_signed": true
}
```

**Response (200 OK):**
```json
{
  "member_membership_id": 1,
  "member_id": 1,
  "membership_id": 2,
  "start_date": "2023-07-01T00:00:00Z",
  "end_date": "2023-12-01T00:00:00Z",
  "payment_status": "paid",
  "contract_signed": true,
  "created_at": "2023-06-30T14:00:00Z",
  "updated_at": "2023-07-15T15:30:00Z"
}
```

### Delete Member-Membership

Deletes a member-membership relationship.

**Endpoint:** `DELETE /member-memberships/{id}`

**Response (200 OK):**
```json
{
  "message": "Member-membership relationship deleted successfully"
}
```
