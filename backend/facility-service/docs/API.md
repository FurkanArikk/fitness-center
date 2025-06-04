# Facility Service API Documentation

The Facility Service manages fitness center facilities, equipment, and attendance tracking within the Fitness Center application. This service provides RESTful APIs for facility management, equipment inventory, and member check-in/check-out functionality.

## Base URL

```
http://localhost:8004/api/v1
```

## Table of Contents

- [Facility Endpoints](#facility-endpoints)
- [Equipment Endpoints](#equipment-endpoints)
- [Attendance Endpoints](#attendance-endpoints)
- [Health Check Endpoint](#health-check-endpoint)

## Facility Endpoints

### Get All Facilities

Returns a list of all facilities with optional filtering and pagination support.

**Endpoint:** `GET /facilities`

**Query Parameters:**
- `status` (optional): Filter by status (active/maintenance/closed)
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Example Request:**
```
GET /api/v1/facilities?status=active&page=1&pageSize=20
```

**Response (200 OK):**
```json
[
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
  },
  {
    "facility_id": 2,
    "name": "Swimming Pool",
    "description": "25-meter indoor swimming pool with lane dividers",
    "capacity": 30,
    "status": "active",
    "opening_hour": "05:00:00",
    "closing_hour": "23:00:00",
    "created_at": "2025-06-02T11:00:00Z",
    "updated_at": "2025-06-02T11:00:00Z"
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

### Get Facility by ID

Returns a specific facility by its ID.

**Endpoint:** `GET /facilities/{id}`

**Path Parameters:**
- `id`: Facility ID (integer)

**Response (200 OK):**
```json
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
```

**Error Responses:**
- `400 Bad Request`: Invalid facility ID
  ```json
  {
    "error": "Invalid facility ID"
  }
  ```
- `404 Not Found`: Facility not found
  ```json
  {
    "error": "Facility not found"
  }
  ```

### Create Facility

Creates a new facility.

**Endpoint:** `POST /facilities`

**Request Body:**
```json
{
  "name": "Yoga Studio",
  "description": "Peaceful space for yoga and meditation classes",
  "capacity": 25,
  "status": "active",
  "opening_hour": "06:00:00",
  "closing_hour": "21:00:00"
}
```

**Field Validation:**
- `name`: Required, string (1-100 characters, must be unique)
- `description`: Optional, string (max 500 characters)
- `capacity`: Required, integer (1-1000)
- `status`: Required, one of: "active", "maintenance", "closed"
- `opening_hour`: Required, time format (HH:MM:SS)
- `closing_hour`: Required, time format (HH:MM:SS, must be after opening_hour)

**Response (201 Created):**
```json
{
  "facility_id": 3,
  "name": "Yoga Studio",
  "description": "Peaceful space for yoga and meditation classes",
  "capacity": 25,
  "status": "active",
  "opening_hour": "06:00:00",
  "closing_hour": "21:00:00",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
  ```json
  {
    "error": "Facility name already exists"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Failed to create facility"
  }
  ```

### Update Facility

Updates an existing facility.

**Endpoint:** `PUT /facilities/{id}`

**Path Parameters:**
- `id`: Facility ID (integer)

**Request Body:**
```json
{
  "name": "Updated Yoga Studio",
  "description": "Enhanced peaceful space for yoga and meditation classes",
  "capacity": 30,
  "status": "active",
  "opening_hour": "05:30:00",
  "closing_hour": "21:30:00"
}
```

**Field Validation:**
- All fields are optional for updates
- Same validation rules as Create Facility apply to provided fields

**Response (200 OK):**
```json
{
  "facility_id": 3,
  "name": "Updated Yoga Studio",
  "description": "Enhanced peaceful space for yoga and meditation classes",
  "capacity": 30,
  "status": "active",
  "opening_hour": "05:30:00",
  "closing_hour": "21:30:00",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid facility ID or request data
- `404 Not Found`: Facility not found
- `500 Internal Server Error`: Server-side error

### Delete Facility

Deletes a facility.

**Endpoint:** `DELETE /facilities/{id}`

**Path Parameters:**
- `id`: Facility ID (integer)

**Response (200 OK):**
```json
{
  "message": "Facility deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid facility ID
- `404 Not Found`: Facility not found
- `409 Conflict`: Facility has equipment or active sessions
  ```json
  {
    "error": "Cannot delete facility with existing equipment"
  }
  ```

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

## Equipment Endpoints

### Get All Equipment

Returns a list of all equipment with optional filtering and pagination support.

**Endpoint:** `GET /equipment`

**Query Parameters:**
- `facility_id` (optional): Filter by facility ID
- `status` (optional): Filter by status (available/maintenance/out_of_order)
- `type` (optional): Filter by equipment type
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Example Request:**
```
GET /api/v1/equipment?facility_id=1&status=available
```

**Response (200 OK):**
```json
[
  {
    "equipment_id": 1,
    "facility_id": 1,
    "name": "Treadmill #1",
    "type": "Cardio",
    "brand": "NordicTrack",
    "model": "Commercial 1750",
    "serial_number": "NT1750-001",
    "purchase_date": "2023-01-15",
    "warranty_expiry": "2026-01-15",
    "status": "available",
    "last_maintenance": "2024-12-01T10:00:00Z",
    "next_maintenance": "2025-06-01T10:00:00Z",
    "created_at": "2023-01-16T10:00:00Z",
    "updated_at": "2024-12-01T11:00:00Z"
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server-side error

### Get Equipment by ID

Returns a specific equipment item by its ID.

**Endpoint:** `GET /equipment/{id}`

**Path Parameters:**
- `id`: Equipment ID (integer)

**Response (200 OK):**
```json
{
  "equipment_id": 1,
  "facility_id": 1,
  "name": "Treadmill #1",
  "type": "Cardio",
  "brand": "NordicTrack",
  "model": "Commercial 1750",
  "serial_number": "NT1750-001",
  "purchase_date": "2023-01-15",
  "warranty_expiry": "2026-01-15",
  "status": "available",
  "last_maintenance": "2024-12-01T10:00:00Z",
  "next_maintenance": "2025-06-01T10:00:00Z",
  "created_at": "2023-01-16T10:00:00Z",
  "updated_at": "2024-12-01T11:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid equipment ID
- `404 Not Found`: Equipment not found

### Create Equipment

Creates a new equipment item.

**Endpoint:** `POST /equipment`

**Request Body:**
```json
{
  "facility_id": 1,
  "name": "Exercise Bike #5",
  "type": "Cardio",
  "brand": "Peloton",
  "model": "Bike+",
  "serial_number": "PB001-005",
  "purchase_date": "2025-06-01",
  "warranty_expiry": "2028-06-01",
  "status": "available"
}
```

**Field Validation:**
- `facility_id`: Required, integer (must exist)
- `name`: Required, string (1-100 characters)
- `type`: Required, string (max 50 characters)
- `brand`: Required, string (max 50 characters)
- `model`: Optional, string (max 50 characters)
- `serial_number`: Optional, string (max 100 characters, must be unique if provided)
- `purchase_date`: Optional, date format (YYYY-MM-DD)
- `warranty_expiry`: Optional, date format (YYYY-MM-DD)
- `status`: Required, one of: "available", "maintenance", "out_of_order"

**Response (201 Created):**
```json
{
  "equipment_id": 25,
  "facility_id": 1,
  "name": "Exercise Bike #5",
  "type": "Cardio",
  "brand": "Peloton",
  "model": "Bike+",
  "serial_number": "PB001-005",
  "purchase_date": "2025-06-01",
  "warranty_expiry": "2028-06-01",
  "status": "available",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
- `404 Not Found`: Facility not found
- `500 Internal Server Error`: Server-side error

### Update Equipment

Updates an existing equipment item.

**Endpoint:** `PUT /equipment/{id}`

**Path Parameters:**
- `id`: Equipment ID (integer)

**Request Body:**
```json
{
  "name": "Exercise Bike #5 - Updated",
  "status": "maintenance",
  "last_maintenance": "2025-06-04T10:00:00Z",
  "next_maintenance": "2025-12-04T10:00:00Z"
}
```

**Field Validation:**
- All fields are optional for updates
- Same validation rules as Create Equipment apply to provided fields

**Response (200 OK):**
```json
{
  "equipment_id": 25,
  "facility_id": 1,
  "name": "Exercise Bike #5 - Updated",
  "type": "Cardio",
  "brand": "Peloton",
  "model": "Bike+",
  "serial_number": "PB001-005",
  "purchase_date": "2025-06-01",
  "warranty_expiry": "2028-06-01",
  "status": "maintenance",
  "last_maintenance": "2025-06-04T10:00:00Z",
  "next_maintenance": "2025-12-04T10:00:00Z",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid equipment ID or request data
- `404 Not Found`: Equipment not found
- `500 Internal Server Error`: Server-side error

### Delete Equipment

Deletes an equipment item.

**Endpoint:** `DELETE /equipment/{id}`

**Path Parameters:**
- `id`: Equipment ID (integer)

**Response (200 OK):**
```json
{
  "message": "Equipment deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid equipment ID
- `404 Not Found`: Equipment not found
- `409 Conflict`: Equipment is currently in use
  ```json
  {
    "error": "Cannot delete equipment that is currently in use"
  }
  ```

---

## Attendance Endpoints

### Get All Attendance Records

Returns a list of all attendance records with optional filtering and pagination support.

**Endpoint:** `GET /attendance`

**Query Parameters:**
- `facility_id` (optional): Filter by facility ID
- `member_id` (optional): Filter by member ID
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `status` (optional): Filter by status (checked_in/checked_out)
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Example Request:**
```
GET /api/v1/attendance?facility_id=1&date=2025-06-04
```

**Response (200 OK):**
```json
[
  {
    "attendance_id": 1,
    "facility_id": 1,
    "member_id": 123,
    "check_in_time": "2025-06-04T08:30:00Z",
    "check_out_time": "2025-06-04T10:15:00Z",
    "duration_minutes": 105,
    "status": "checked_out",
    "created_at": "2025-06-04T08:30:00Z",
    "updated_at": "2025-06-04T10:15:00Z"
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server-side error

### Get Attendance by ID

Returns a specific attendance record by its ID.

**Endpoint:** `GET /attendance/{id}`

**Path Parameters:**
- `id`: Attendance ID (integer)

**Response (200 OK):**
```json
{
  "attendance_id": 1,
  "facility_id": 1,
  "member_id": 123,
  "check_in_time": "2025-06-04T08:30:00Z",
  "check_out_time": "2025-06-04T10:15:00Z",
  "duration_minutes": 105,
  "status": "checked_out",
  "created_at": "2025-06-04T08:30:00Z",
  "updated_at": "2025-06-04T10:15:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid attendance ID
- `404 Not Found`: Attendance record not found

### Member Check-In

Records a member's check-in to a facility.

**Endpoint:** `POST /attendance/checkin`

**Request Body:**
```json
{
  "facility_id": 1,
  "member_id": 123
}
```

**Field Validation:**
- `facility_id`: Required, integer (must exist and be active)
- `member_id`: Required, integer (must exist and have active membership)

**Response (201 Created):**
```json
{
  "attendance_id": 150,
  "facility_id": 1,
  "member_id": 123,
  "check_in_time": "2025-06-04T09:00:00Z",
  "status": "checked_in",
  "created_at": "2025-06-04T09:00:00Z",
  "updated_at": "2025-06-04T09:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
  ```json
  {
    "error": "Member is already checked in to this facility"
  }
  ```
- `404 Not Found`: Facility or member not found
- `409 Conflict`: Facility at capacity or member already checked in
  ```json
  {
    "error": "Facility is at maximum capacity"
  }
  ```

### Member Check-Out

Records a member's check-out from a facility.

**Endpoint:** `POST /attendance/checkout`

**Request Body:**
```json
{
  "member_id": 123,
  "facility_id": 1
}
```

**Field Validation:**
- `member_id`: Required, integer (must be currently checked in)
- `facility_id`: Required, integer (must match check-in facility)

**Response (200 OK):**
```json
{
  "attendance_id": 150,
  "facility_id": 1,
  "member_id": 123,
  "check_in_time": "2025-06-04T09:00:00Z",
  "check_out_time": "2025-06-04T11:30:00Z",
  "duration_minutes": 150,
  "status": "checked_out",
  "created_at": "2025-06-04T09:00:00Z",
  "updated_at": "2025-06-04T11:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or member not checked in
  ```json
  {
    "error": "Member is not currently checked in to this facility"
  }
  ```
- `404 Not Found`: Member or facility not found

### Get Current Facility Occupancy

Returns the current occupancy status of all facilities or a specific facility.

**Endpoint:** `GET /attendance/occupancy`

**Query Parameters:**
- `facility_id` (optional): Get occupancy for specific facility

**Example Request:**
```
GET /api/v1/attendance/occupancy?facility_id=1
```

**Response (200 OK):**
```json
[
  {
    "facility_id": 1,
    "facility_name": "Main Gym",
    "capacity": 100,
    "current_occupancy": 25,
    "occupancy_percentage": 25.0,
    "available_spots": 75,
    "status": "open"
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid facility ID
- `404 Not Found`: Facility not found

### Get Member Attendance History

Returns attendance history for a specific member.

**Endpoint:** `GET /attendance/member/{memberId}`

**Path Parameters:**
- `memberId`: Member ID (integer)

**Query Parameters:**
- `facility_id` (optional): Filter by facility
- `start_date` (optional): Start date filter (YYYY-MM-DD)
- `end_date` (optional): End date filter (YYYY-MM-DD)
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Response (200 OK):**
```json
[
  {
    "attendance_id": 150,
    "facility_id": 1,
    "facility_name": "Main Gym",
    "member_id": 123,
    "check_in_time": "2025-06-04T09:00:00Z",
    "check_out_time": "2025-06-04T11:30:00Z",
    "duration_minutes": 150,
    "status": "checked_out",
    "created_at": "2025-06-04T09:00:00Z",
    "updated_at": "2025-06-04T11:30:00Z"
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid member ID or date parameters
- `404 Not Found`: Member not found

## Health Check Endpoint

### Health Check

Returns the health status of the Facility Service.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "facility-service",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2025-06-04T10:00:00Z"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "service": "facility-service",
  "database": "disconnected",
  "error": "Database connection failed"
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
