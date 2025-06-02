# Facility Service API Documentation

This document provides comprehensive documentation for all 24 API endpoints provided by the Facility Service. The service manages facilities, equipment, and attendance tracking for the fitness center.

**Base URL:** `http://localhost:8004`  
**API Base:** `http://localhost:8004/api/v1`  
**Version:** v1  
**Content-Type:** `application/json`

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Health Check](#health-check) (1 endpoint)
4. [Facilities](#facilities) (8 endpoints)
5. [Equipment](#equipment) (8 endpoints)
6. [Attendance](#attendance) (7 endpoints)
7. [Error Responses](#error-responses)
8. [Pagination](#pagination)
9. [Testing](#testing)

**Total Endpoints: 24**

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All responses follow a consistent JSON format:

**Success Response:**
```json
{
  "data": {}, // or []
  "message": "Success message",
  "status": "success"
}
```

**Error Response:**
```json
{
  "error": "Error description",
  "message": "Human readable error message", 
  "status": "error"
}
```

---

## Health Check

### Check Service Health

Check if the service is running and healthy.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "OK",
  "service": "facility-service",
  "timestamp": "2025-06-02T10:00:00Z"
}
```

---

## Facilities (8 Endpoints)

### 1. Create Facility

Create a new facility in the system.

**Endpoint:** `POST /api/v1/facilities`

**Request Body:**
```json
{
  "name": "Main Gym",
  "description": "Primary workout area with cardio and strength equipment",
  "capacity": 100,
  "status": "active",
  "opening_hour": "06:00:00",
  "closing_hour": "22:00:00"
}
```

**Field Descriptions:**
- `name`: Unique facility name (required, max 50 chars)
- `description`: Facility description (optional, max 255 chars)
- `capacity`: Maximum capacity (required, positive integer)
- `status`: Facility status (required: "active", "maintenance", "closed")
- `opening_hour`: Opening time in HH:MM:SS format (required)
- `closing_hour`: Closing time in HH:MM:SS format (required)

**Response (201 Created):**
```json
{
  "data": {
    "facility_id": 1,
    "name": "Main Gym",
    "description": "Primary workout area with cardio and strength equipment",
    "capacity": 100,
    "status": "active",
    "opening_hour": "06:00:00",
    "closing_hour": "22:00:00",
    "created_at": "2025-06-02T10:00:00Z",
    "updated_at": "2025-06-02T10:00:00Z"
  }
}
```

### 2. Get All Facilities

Retrieve a list of all facilities with optional pagination.

**Endpoint:** `GET /api/v1/facilities`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Response (200 OK):**
```json
{
  "data": [
    {
      "facility_id": 1,
      "name": "Main Gym",
      "description": "Primary workout area with cardio and strength equipment",
      "capacity": 100,
      "status": "active",
      "opening_hour": "06:00:00",
      "closing_hour": "22:00:00",
      "created_at": "2025-06-02T10:00:00Z",
      "updated_at": "2025-06-02T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalItems": 1,
  "totalPages": 1
}
```

### 3. Get Facility by ID

Returns a specific facility by its ID.

**Endpoint:** `GET /api/v1/facilities/{id}`

**Path Parameters:**
- `id`: Facility ID (integer, required)

**Response (200 OK):**
```json
{
  "data": {
    "facility_id": 1,
    "name": "Main Gym",
    "description": "Primary workout area with cardio and strength equipment",
    "capacity": 100,
    "status": "active",
    "opening_hour": "06:00:00",
    "closing_hour": "22:00:00",
    "created_at": "2025-06-02T10:00:00Z",
    "updated_at": "2025-06-02T10:00:00Z"
  }
}
```

### 4. Update Facility

Updates an existing facility.

**Endpoint:** `PUT /api/v1/facilities/{id}`

**Path Parameters:**
- `id`: Facility ID (integer, required)

**Request Body:**
```json
{
  "name": "Updated Gym",
  "description": "Updated description",
  "capacity": 120,
  "status": "active",
  "opening_hour": "05:30:00",
  "closing_hour": "23:00:00"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "facility_id": 1,
    "name": "Updated Gym",
    "description": "Updated description",
    "capacity": 120,
    "status": "active",
    "opening_hour": "05:30:00",
    "closing_hour": "23:00:00",
    "created_at": "2025-06-02T10:00:00Z",
    "updated_at": "2025-06-02T11:30:00Z"
  }
}
```

### 5. Delete Facility

Deletes a facility. This will fail if there are active attendance records for the facility.

**Endpoint:** `DELETE /api/v1/facilities/{id}`

**Path Parameters:**
- `id`: Facility ID (integer, required)

**Response (200 OK):**
```json
{
  "message": "Facility deleted successfully"
}
```

### 6. List Facilities by Status

Returns facilities filtered by status.

**Endpoint:** `GET /api/v1/facilities/status/{status}`

**Path Parameters:**
- `status`: Facility status (required: "active", "maintenance", "closed")

**Response (200 OK):**
```json
{
  "data": [
    {
      "facility_id": 1,
      "name": "Main Gym",
      "description": "Primary workout area with cardio and strength equipment",
      "capacity": 100,
      "status": "active",
      "opening_hour": "06:00:00",
      "closing_hour": "22:00:00",
      "created_at": "2025-06-02T10:00:00Z",
      "updated_at": "2025-06-02T10:00:00Z"
    }
  ]
}
```

---

## Equipment (8 Endpoints)

### 1. Create Equipment

Creates new equipment in the system.

**Endpoint:** `POST /api/v1/equipment`

**Request Body:**
```json
{
  "name": "Treadmill",
  "description": "Commercial grade treadmill",
  "category": "cardio",
  "purchase_date": "2025-01-01",
  "purchase_price": 2999.99,
  "manufacturer": "LifeFitness",
  "model_number": "LF-TR1000",
  "status": "active",
  "last_maintenance_date": "2025-01-01",
  "next_maintenance_date": "2025-04-01"
}
```

**Field Descriptions:**
- `name`: Equipment name (required, max 100 chars)
- `description`: Equipment description (optional, max 255 chars)
- `category`: Equipment category (required: "cardio", "strength", "free-weights", "functional", "other")
- `purchase_date`: Purchase date in YYYY-MM-DD format (optional)
- `purchase_price`: Purchase price (optional, decimal)
- `manufacturer`: Manufacturer name (optional, max 100 chars)
- `model_number`: Model number (optional, max 50 chars)
- `status`: Equipment status (required: "active", "maintenance", "out-of-order")
- `last_maintenance_date`: Last maintenance date (optional)
- `next_maintenance_date`: Next maintenance date (optional)

**Response (201 Created):**
```json
{
  "data": {
    "equipment_id": 1,
    "name": "Treadmill",
    "description": "Commercial grade treadmill",
    "category": "cardio",
    "purchase_date": "2025-01-01",
    "purchase_price": 2999.99,
    "manufacturer": "LifeFitness",
    "model_number": "LF-TR1000",
    "status": "active",
    "last_maintenance_date": "2025-01-01",
    "next_maintenance_date": "2025-04-01",
    "created_at": "2025-06-02T10:00:00Z",
    "updated_at": "2025-06-02T10:00:00Z"
  }
}
```

### 2. Get All Equipment

Returns a list of all equipment with optional pagination.

**Endpoint:** `GET /api/v1/equipment`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Response (200 OK):**
```json
{
  "data": [
    {
      "equipment_id": 1,
      "name": "Treadmill",
      "description": "Commercial grade treadmill",
      "category": "cardio",
      "purchase_date": "2025-01-01",
      "purchase_price": 2999.99,
      "manufacturer": "LifeFitness",
      "model_number": "LF-TR1000",
      "status": "active",
      "last_maintenance_date": "2025-01-01",
      "next_maintenance_date": "2025-04-01",
      "created_at": "2025-06-02T10:00:00Z",
      "updated_at": "2025-06-02T10:00:00Z"
    }
  ]
}
```

### 3. Get Equipment by ID

Returns specific equipment by its ID.

**Endpoint:** `GET /api/v1/equipment/{id}`

**Path Parameters:**
- `id`: Equipment ID (integer, required)

**Response (200 OK):**
```json
{
  "data": {
    "equipment_id": 1,
    "name": "Treadmill",
    "description": "Commercial grade treadmill",
    "category": "cardio",
    "purchase_date": "2025-01-01",
    "purchase_price": 2999.99,
    "manufacturer": "LifeFitness",
    "model_number": "LF-TR1000",
    "status": "active",
    "last_maintenance_date": "2025-01-01",
    "next_maintenance_date": "2025-04-01",
    "created_at": "2025-06-02T10:00:00Z",
    "updated_at": "2025-06-02T10:00:00Z"
  }
}
```

### 4. Update Equipment

Updates existing equipment.

**Endpoint:** `PUT /api/v1/equipment/{id}`

**Path Parameters:**
- `id`: Equipment ID (integer, required)

**Request Body:**
```json
{
  "name": "Updated Treadmill",
  "description": "Updated description",
  "category": "cardio",
  "purchase_date": "2025-01-01",
  "purchase_price": 3299.99,
  "manufacturer": "LifeFitness",
  "model_number": "LF-TR2000",
  "status": "maintenance",
  "last_maintenance_date": "2025-06-01",
  "next_maintenance_date": "2025-09-01"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "equipment_id": 1,
    "name": "Updated Treadmill",
    "description": "Updated description",
    "category": "cardio",
    "purchase_date": "2025-01-01",
    "purchase_price": 3299.99,
    "manufacturer": "LifeFitness",
    "model_number": "LF-TR2000",
    "status": "maintenance",
    "last_maintenance_date": "2025-06-01",
    "next_maintenance_date": "2025-09-01",
    "created_at": "2025-06-02T10:00:00Z",
    "updated_at": "2025-06-02T12:00:00Z"
  }
}
```

### 5. Delete Equipment

Deletes equipment.

**Endpoint:** `DELETE /api/v1/equipment/{id}`

**Path Parameters:**
- `id`: Equipment ID (integer, required)

**Response (200 OK):**
```json
{
  "message": "Equipment deleted successfully"
}
```

### 6. List Equipment by Category

Returns equipment filtered by category.

**Endpoint:** `GET /api/v1/equipment/category/{category}`

**Path Parameters:**
- `category`: Equipment category (required: "cardio", "strength", "free-weights", "functional", "other")

**Response (200 OK):**
```json
{
  "data": [
    {
      "equipment_id": 1,
      "name": "Treadmill",
      "description": "Commercial grade treadmill",
      "category": "cardio",
      "purchase_date": "2025-01-01",
      "purchase_price": 2999.99,
      "manufacturer": "LifeFitness",
      "model_number": "LF-TR1000",
      "status": "active",
      "last_maintenance_date": "2025-01-01",
      "next_maintenance_date": "2025-04-01",
      "created_at": "2025-06-02T10:00:00Z",
      "updated_at": "2025-06-02T10:00:00Z"
    }
  ]
}
```

### 7. List Equipment by Status

Returns equipment filtered by status.

**Endpoint:** `GET /api/v1/equipment/status/{status}`

**Path Parameters:**
- `status`: Equipment status (required: "active", "maintenance", "out-of-order")

**Response (200 OK):**
```json
{
  "data": [
    {
      "equipment_id": 1,
      "name": "Treadmill",
      "description": "Commercial grade treadmill",
      "category": "cardio",
      "purchase_date": "2025-01-01",
      "purchase_price": 2999.99,
      "manufacturer": "LifeFitness",
      "model_number": "LF-TR1000",
      "status": "active",
      "last_maintenance_date": "2025-01-01",
      "next_maintenance_date": "2025-04-01",
      "created_at": "2025-06-02T10:00:00Z",
      "updated_at": "2025-06-02T10:00:00Z"
    }
  ]
}
```

### 8. List Equipment Due for Maintenance

Returns equipment that needs maintenance based on next_maintenance_date.

**Endpoint:** `GET /api/v1/equipment/maintenance`

**Query Parameters:**
- `date` (optional): Reference date for maintenance check (defaults to current date, format: YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "data": [
    {
      "equipment_id": 1,
      "name": "Treadmill",
      "description": "Commercial grade treadmill",
      "category": "cardio",
      "purchase_date": "2025-01-01",
      "purchase_price": 2999.99,
      "manufacturer": "LifeFitness",
      "model_number": "LF-TR1000",
      "status": "active",
      "last_maintenance_date": "2025-01-01",
      "next_maintenance_date": "2025-04-01",
      "created_at": "2025-06-02T10:00:00Z",
      "updated_at": "2025-06-02T10:00:00Z"
    }
  ]
}
```

---

## Attendance (7 Endpoints)

### 1. Create Attendance Record

Creates a new attendance record (member check-in).

**Endpoint:** `POST /api/v1/attendance`

**Request Body:**
```json
{
  "member_id": 123,
  "facility_id": 1,
  "check_in_time": "2025-06-02T08:00:00Z"
}
```

**Field Descriptions:**
- `member_id`: Member identifier (required, integer)
- `facility_id`: Facility ID (required, integer, must exist)
- `check_in_time`: Check-in timestamp in ISO 8601 format (required)

**Response (201 Created):**
```json
{
  "data": {
    "attendance_id": 1,
    "member_id": 123,
    "check_in_time": "2025-06-02T08:00:00Z",
    "check_out_time": null,
    "date": "2025-06-02",
    "facility_id": 1,
    "created_at": "2025-06-02T08:00:00Z",
    "updated_at": "2025-06-02T08:00:00Z"
  }
}
```

### 2. Get All Attendance

Lists all attendance records with pagination.

**Endpoint:** `GET /api/v1/attendance`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Response (200 OK):**
```json
{
  "data": [
    {
      "attendance_id": 1,
      "member_id": 123,
      "check_in_time": "2025-06-02T08:00:00Z",
      "check_out_time": "2025-06-02T10:30:00Z",
      "date": "2025-06-02",
      "facility_id": 1,
      "created_at": "2025-06-02T08:00:00Z",
      "updated_at": "2025-06-02T10:30:00Z"
    }
  ]
}
```

### 3. Get Attendance by ID

Returns a specific attendance record.

**Endpoint:** `GET /api/v1/attendance/{id}`

**Path Parameters:**
- `id`: Attendance ID (integer, required)

**Response (200 OK):**
```json
{
  "data": {
    "attendance_id": 1,
    "member_id": 123,
    "check_in_time": "2025-06-02T08:00:00Z",
    "check_out_time": "2025-06-02T10:30:00Z",
    "date": "2025-06-02",
    "facility_id": 1,
    "created_at": "2025-06-02T08:00:00Z",
    "updated_at": "2025-06-02T10:30:00Z"
  }
}
```

### 4. Update Attendance

Updates an existing attendance record.

**Endpoint:** `PUT /api/v1/attendance/{id}`

**Path Parameters:**
- `id`: Attendance ID (integer, required)

**Request Body:**
```json
{
  "member_id": 123,
  "check_in_time": "2025-06-02T08:15:00Z",
  "check_out_time": "2025-06-02T10:45:00Z",
  "facility_id": 1
}
```

**Response (200 OK):**
```json
{
  "data": {
    "attendance_id": 1,
    "member_id": 123,
    "check_in_time": "2025-06-02T08:15:00Z",
    "check_out_time": "2025-06-02T10:45:00Z",
    "date": "2025-06-02",
    "facility_id": 1,
    "created_at": "2025-06-02T08:00:00Z",
    "updated_at": "2025-06-02T11:00:00Z"
  }
}
```

### 5. Delete Attendance

Deletes an attendance record.

**Endpoint:** `DELETE /api/v1/attendance/{id}`

**Path Parameters:**
- `id`: Attendance ID (integer, required)

**Response (200 OK):**
```json
{
  "message": "Attendance record deleted successfully"
}
```

### 6. Check Out Member

Records a check-out time for an attendance record.

**Endpoint:** `POST /api/v1/attendance/{id}/checkout`

**Path Parameters:**
- `id`: Attendance ID (integer, required)

**Response (200 OK):**
```json
{
  "data": {
    "message": "Member checked out successfully",
    "check_out_time": "2025-06-02T10:30:00Z",
    "attendance_id": 1
  }
}
```

### 7. List Attendance by Member

Returns attendance records for a specific member.

**Endpoint:** `GET /api/v1/attendance/member/{memberID}`

**Path Parameters:**
- `memberID`: Member ID (integer, required)

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Response (200 OK):**
```json
{
  "data": [
    {
      "attendance_id": 1,
      "member_id": 123,
      "check_in_time": "2025-06-02T08:00:00Z",
      "check_out_time": "2025-06-02T10:30:00Z",
      "date": "2025-06-02",
      "facility_id": 1,
      "created_at": "2025-06-02T08:00:00Z",
      "updated_at": "2025-06-02T10:30:00Z"
    }
  ]
}
```

### 8. List Attendance by Facility

Returns attendance records for a specific facility.

**Endpoint:** `GET /api/v1/attendance/facility/{facilityID}`

**Path Parameters:**
- `facilityID`: Facility ID (integer, required)

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Response (200 OK):**
```json
{
  "data": [
    {
      "attendance_id": 1,
      "member_id": 123,
      "check_in_time": "2025-06-02T08:00:00Z",
      "check_out_time": "2025-06-02T10:30:00Z",
      "date": "2025-06-02",
      "facility_id": 1,
      "created_at": "2025-06-02T08:00:00Z",
      "updated_at": "2025-06-02T10:30:00Z"
    }
  ]
}
```

### 9. List Attendance by Date

Returns attendance records for a specific date.

**Endpoint:** `GET /api/v1/attendance/date/{date}`

**Path Parameters:**
- `date`: Date in YYYY-MM-DD format (required)

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Response (200 OK):**
```json
{
  "data": [
    {
      "attendance_id": 1,
      "member_id": 123,
      "check_in_time": "2025-06-02T08:00:00Z",
      "check_out_time": "2025-06-02T10:30:00Z",
      "date": "2025-06-02",
      "facility_id": 1,
      "created_at": "2025-06-02T08:00:00Z",
      "updated_at": "2025-06-02T10:30:00Z"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following errors:

### 400 Bad Request

Returned when the request contains invalid parameters or malformed JSON.

```json
{
  "error": "Invalid request: field X is required",
  "message": "The request body is missing required fields",
  "status": "error"
}
```

### 404 Not Found

Returned when the requested resource doesn't exist.

```json
{
  "error": "Resource not found",
  "message": "The requested facility was not found",
  "status": "error"
}
```

### 409 Conflict

Returned when there's a conflict with existing data (e.g., duplicate facility name).

```json
{
  "error": "Facility name already exists",
  "message": "A facility with this name already exists",
  "status": "error"
}
```

### 500 Internal Server Error

Returned when an unexpected error occurs on the server.

```json
{
  "error": "An internal server error occurred",
  "message": "Please try again later",
  "status": "error"
}
```

---

## Pagination

Most list endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1, minimum: 1)
- `pageSize`: Number of items per page (default: 10, maximum: 100)

Pagination responses include metadata:

```json
{
  "data": [...],
  "page": 1,
  "pageSize": 10,
  "totalItems": 100,
  "totalPages": 10
}
```

---

## Testing

You can test all endpoints using the provided test script:

```bash
cd backend/facility-service
./test_endpoints.sh
```

This script will:
1. Test all 24 endpoints
2. Show comprehensive results
3. Display coverage statistics
4. Validate all CRUD operations

---

## Rate Limiting

Currently, there are no rate limits applied to the API endpoints.

## Data Validation

- All timestamp fields use ISO 8601 format with UTC timezone
- Date fields use YYYY-MM-DD format
- Time fields use HH:MM:SS format
- Numeric fields are validated for proper ranges
- String fields are validated for maximum length constraints
- Foreign key constraints are enforced for facility_id references

## Notes

- The `date` field in attendance records is automatically set based on the `check_in_time`
- Equipment maintenance dates are used for scheduling and filtering
- Facility status affects operational hours and availability
- All timestamps are stored and returned in UTC
- Equipment date formats should use simple date format (YYYY-MM-DD) not ISO datetime format
