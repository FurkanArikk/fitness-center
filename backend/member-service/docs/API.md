# Member Service API Documentation

The Member Service manages fitness center members, memberships, benefits, and fitness assessments within the Fitness Center application. This service provides RESTful APIs for member management, membership tracking, and fitness assessment functionality.

## Base URL

```
http://localhost:8002/api/v1
```

## Table of Contents

- [Member Endpoints](#member-endpoints)
- [Membership Endpoints](#membership-endpoints)
- [Benefit Endpoints](#benefit-endpoints)
- [Fitness Assessment Endpoints](#fitness-assessment-endpoints)
- [Health Check Endpoint](#health-check-endpoint)

## Member Endpoints

### Get All Members

Returns a list of all members with optional filtering and pagination support.

**Endpoint:** `GET /members`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)
- `email` (optional): Filter by email address
- `status` (optional): Filter by member status

**Example Request:**
```
GET /api/v1/members?page=1&pageSize=20
```

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

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "Invalid page number"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Database connection error"
  }
  ```

### Get Member by ID

Returns a specific member by their ID.

**Endpoint:** `GET /members/{id}`

**Path Parameters:**
- `id`: Member ID (integer)

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

**Error Responses:**
- `400 Bad Request`: Invalid member ID
  ```json
  {
    "error": "Invalid member ID"
  }
  ```
- `404 Not Found`: Member not found
  ```json
  {
    "error": "Member not found"
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
  "emergency_contact_name": "Mike Johnson",
  "emergency_contact_phone": "555-765-4321"
}
```

**Field Validation:**
- `first_name`: Required, string (1-50 characters)
- `last_name`: Required, string (1-50 characters)
- `email`: Required, valid email format (must be unique)
- `phone`: Required, string (phone number format)
- `address`: Required, string (max 200 characters)
- `date_of_birth`: Required, ISO 8601 datetime format
- `emergency_contact_name`: Required, string (1-100 characters)
- `emergency_contact_phone`: Required, string (phone number format)

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
  "emergency_contact_name": "Mike Johnson",
  "emergency_contact_phone": "555-765-4321",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
  ```json
  {
    "error": "Email already exists"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Failed to create member"
  }
  ```

### Update Member

Updates an existing member.

**Endpoint:** `PUT /members/{id}`

**Path Parameters:**
- `id`: Member ID (integer)

**Request Body:**
```json
{
  "first_name": "Sarah",
  "last_name": "Johnson-Smith",
  "email": "sarah.johnson.smith@example.com",
  "phone": "555-345-6789",
  "address": "789 Pine St, Apt 2B",
  "emergency_contact_name": "Mike Johnson",
  "emergency_contact_phone": "555-765-4321"
}
```

**Field Validation:**
- All fields are optional for updates
- Same validation rules as Create Member apply to provided fields

**Response (200 OK):**
```json
{
  "member_id": 3,
  "first_name": "Sarah",
  "last_name": "Johnson-Smith",
  "email": "sarah.johnson.smith@example.com",
  "phone": "555-345-6789",
  "address": "789 Pine St, Apt 2B",
  "date_of_birth": "1992-08-10T00:00:00Z",
  "emergency_contact_name": "Mike Johnson",
  "emergency_contact_phone": "555-765-4321",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid member ID or request data
- `404 Not Found`: Member not found
- `500 Internal Server Error`: Server-side error

### Delete Member

Deletes a member.

**Endpoint:** `DELETE /members/{id}`

**Path Parameters:**
- `id`: Member ID (integer)

**Response (200 OK):**
```json
{
  "message": "Member deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid member ID
- `404 Not Found`: Member not found
- `409 Conflict`: Member has active memberships or bookings
  ```json
  {
    "error": "Cannot delete member with active memberships"
  }
  ```
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

**Response (400 Bad Request):**
```json
{
  "error": "Email already exists"
}
```

**Response (400 Bad Request - Validation Error):**
```json
{
  "error": "First name is required"
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

Returns a list of all memberships with optional filtering and pagination support.

**Endpoint:** `GET /memberships`

**Query Parameters:**
- `member_id` (optional): Filter by member ID
- `status` (optional): Filter by status (active/inactive/expired)
- `type` (optional): Filter by membership type
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Response (200 OK):**
```json
[
  {
    "membership_id": 1,
    "member_id": 1,
    "membership_type": "Premium",
    "start_date": "2023-07-01T00:00:00Z",
    "end_date": "2024-07-01T00:00:00Z",
    "status": "active",
    "price": 99.99,
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z"
  }
]
```

### Get Membership by ID

Returns a specific membership by its ID.

**Endpoint:** `GET /memberships/{id}`

**Path Parameters:**
- `id`: Membership ID (integer)

**Response (200 OK):**
```json
{
  "membership_id": 1,
  "member_id": 1,
  "membership_type": "Premium",
  "start_date": "2023-07-01T00:00:00Z",
  "end_date": "2024-07-01T00:00:00Z",
  "status": "active",
  "price": 99.99,
  "created_at": "2023-07-01T10:00:00Z",
  "updated_at": "2023-07-01T10:00:00Z"
}
```

### Create Membership

Creates a new membership for a member.

**Endpoint:** `POST /memberships`

**Request Body:**
```json
{
  "member_id": 1,
  "membership_type": "Premium",
  "start_date": "2025-06-04T00:00:00Z",
  "end_date": "2026-06-04T00:00:00Z",
  "status": "active",
  "price": 99.99
}
```

**Field Validation:**
- `member_id`: Required, integer (must exist)
- `membership_type`: Required, one of: "Basic", "Premium", "VIP"
- `start_date`: Required, ISO 8601 datetime format
- `end_date`: Required, ISO 8601 datetime format (must be after start_date)
- `status`: Required, one of: "active", "inactive", "expired"
- `price`: Required, decimal (positive value)

**Response (201 Created):**
```json
{
  "membership_id": 10,
  "member_id": 1,
  "membership_type": "Premium",
  "start_date": "2025-06-04T00:00:00Z",
  "end_date": "2026-06-04T00:00:00Z",
  "status": "active",
  "price": 99.99,
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

### Update Membership

Updates an existing membership.

**Endpoint:** `PUT /memberships/{id}`

**Path Parameters:**
- `id`: Membership ID (integer)

**Response (200 OK):**
```json
{
  "membership_id": 10,
  "member_id": 1,
  "membership_type": "Premium",
  "start_date": "2025-06-04T00:00:00Z",
  "end_date": "2026-06-04T00:00:00Z",
  "status": "active",
  "price": 109.99,
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T14:30:00Z"
}
```

### Delete Membership

Deletes a membership.

**Endpoint:** `DELETE /memberships/{id}`

**Response (200 OK):**
```json
{
  "message": "Membership deleted successfully"
}
```

## Benefit Endpoints

### Get All Benefits

Returns a list of all membership benefits.

**Endpoint:** `GET /benefits`

**Response (200 OK):**
```json
[
  {
    "benefit_id": 1,
    "name": "Personal Training Session",
    "description": "One-on-one training session with certified trainer",
    "membership_type": "Premium",
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z"
  }
]
```

### Create Benefit

Creates a new membership benefit.

**Endpoint:** `POST /benefits`

**Request Body:**
```json
{
  "name": "Nutrition Consultation",
  "description": "Professional nutrition guidance and meal planning",
  "membership_type": "VIP"
}
```

**Response (201 Created):**
```json
{
  "benefit_id": 5,
  "name": "Nutrition Consultation",
  "description": "Professional nutrition guidance and meal planning",
  "membership_type": "VIP",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

## Fitness Assessment Endpoints

### Get All Fitness Assessments

Returns a list of all fitness assessments with optional filtering.

**Endpoint:** `GET /fitness-assessments`

**Query Parameters:**
- `member_id` (optional): Filter by member ID
- `date` (optional): Filter by assessment date

**Response (200 OK):**
```json
[
  {
    "assessment_id": 1,
    "member_id": 1,
    "assessment_date": "2023-07-01T10:00:00Z",
    "weight": 75.5,
    "height": 175.0,
    "body_fat_percentage": 15.2,
    "muscle_mass": 32.1,
    "notes": "Good overall fitness level, focus on cardio improvement",
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z"
  }
]
```

### Create Fitness Assessment

Creates a new fitness assessment for a member.

**Endpoint:** `POST /fitness-assessments`

**Request Body:**
```json
{
  "member_id": 1,
  "assessment_date": "2025-06-04T10:00:00Z",
  "weight": 74.2,
  "height": 175.0,
  "body_fat_percentage": 14.8,
  "muscle_mass": 32.5,
  "notes": "Improved muscle mass, continue current program"
}
```

**Response (201 Created):**
```json
{
  "assessment_id": 15,
  "member_id": 1,
  "assessment_date": "2025-06-04T10:00:00Z",
  "weight": 74.2,
  "height": 175.0,
  "body_fat_percentage": 14.8,
  "muscle_mass": 32.5,
  "notes": "Improved muscle mass, continue current program",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

## Health Check Endpoint

### Health Check

Returns the health status of the Member Service.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "member-service",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2025-06-04T10:00:00Z"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "service": "member-service",
  "database": "disconnected",
  "error": "Database connection failed"
}
```
