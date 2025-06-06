# Class Service API Documentation

The Class Service manages fitness classes, schedules, and bookings within the Fitness Center application. This service provides RESTful APIs for creating and managing classes, scheduling sessions, and handling member bookings.

## Base URL

```
http://localhost:8001/api/v1
```

## Table of Contents

- [Class Endpoints](#class-endpoints)
- [Schedule Endpoints](#schedule-endpoints)
- [Booking Endpoints](#booking-endpoints)
- [Health Check Endpoint](#health-check-endpoint)

## Class Endpoints

### Get All Classes

Returns a list of all fitness classes with optional filtering and pagination support.

**Endpoint:** `GET /classes`

**Query Parameters:**
- `active` (optional): Filter by active status (true/false)
- `difficulty` (optional): Filter by difficulty level (Beginner, Intermediate, Advanced)
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Example Request:**
```
GET /api/v1/classes?active=true&difficulty=Beginner&page=1&pageSize=20
```

**Response (200 OK):**
```json
[
  {
    "class_id": 1,
    "class_name": "Yoga Flow",
    "description": "A flowing sequence of poses that synchronizes breath with movement",
    "duration": 60,
    "capacity": 20,
    "difficulty": "Beginner",
    "is_active": true,
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z"
  },
  {
    "class_id": 2,
    "class_name": "HIIT",
    "description": "High-intensity interval training for maximum calorie burn",
    "duration": 45,
    "capacity": 15,
    "difficulty": "Advanced",
    "is_active": true,
    "created_at": "2023-07-01T11:00:00Z",
    "updated_at": "2023-07-01T11:00:00Z"
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "Invalid difficulty level"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Database connection error"
  }
  ```

### Get Class by ID

Returns a specific fitness class by its ID.

**Endpoint:** `GET /classes/{id}`

**Path Parameters:**
- `id`: Class ID (integer)

**Response (200 OK):**
```json
{
  "class_id": 1,
  "class_name": "Yoga Flow",
  "description": "A flowing sequence of poses that synchronizes breath with movement",
  "duration": 60,
  "capacity": 20,
  "difficulty": "Beginner",
  "is_active": true,
  "created_at": "2023-07-01T10:00:00Z",
  "updated_at": "2023-07-01T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid class ID
  ```json
  {
    "error": "Invalid class ID"
  }
  ```
- `404 Not Found`: Class not found
  ```json
  {
    "error": "Class not found"
  }
  ```

### Create Class

Creates a new fitness class.

**Endpoint:** `POST /classes`

**Request Body:**
```json
{
  "class_name": "Pilates",
  "description": "A system of exercises designed to improve physical strength and flexibility",
  "duration": 50,
  "capacity": 15,
  "difficulty": "Intermediate",
  "is_active": true
}
```

**Field Validation:**
- `class_name`: Required, string (1-100 characters)
- `description`: Optional, string (max 500 characters)
- `duration`: Required, integer (15-180 minutes)
- `capacity`: Required, integer (1-100 people)
- `difficulty`: Required, one of: "Beginner", "Intermediate", "Advanced"
- `is_active`: Required, boolean

**Response (201 Created):**
```json
{
  "class_id": 3,
  "class_name": "Pilates",
  "description": "A system of exercises designed to improve physical strength and flexibility",
  "duration": 50,
  "capacity": 15,
  "difficulty": "Intermediate",
  "is_active": true,
  "created_at": "2023-07-15T10:00:00Z",
  "updated_at": "2023-07-15T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
  ```json
  {
    "error": "Class name is required"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Failed to create class"
  }
  ```

### Update Class

Updates an existing fitness class.

**Endpoint:** `PUT /classes/{id}`

**Path Parameters:**
- `id`: Class ID (integer)

**Request Body:**
```json
{
  "class_name": "Advanced Pilates",
  "description": "An advanced system of exercises for experienced practitioners",
  "duration": 60,
  "capacity": 12,
  "difficulty": "Advanced",
  "is_active": true
}
```

**Field Validation:**
- All fields are optional for updates
- Same validation rules as Create Class apply to provided fields

**Response (200 OK):**
```json
{
  "class_id": 3,
  "class_name": "Advanced Pilates",
  "description": "An advanced system of exercises for experienced practitioners",
  "duration": 60,
  "capacity": 12,
  "difficulty": "Advanced",
  "is_active": true,
  "created_at": "2023-07-15T10:00:00Z",
  "updated_at": "2023-07-16T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid class ID or request data
- `404 Not Found`: Class not found
- `500 Internal Server Error`: Server-side error

### Delete Class

Deletes a fitness class.

**Endpoint:** `DELETE /classes/{id}`

**Path Parameters:**
- `id`: Class ID (integer)

**Response (200 OK):**
```json
{
  "message": "Class deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid class ID
- `404 Not Found`: Class not found
- `409 Conflict`: Class has existing schedules or bookings
  ```json
  {
    "error": "Cannot delete class with existing schedules"
  }
  ```

## Schedule Endpoints

### Get All Schedules

Returns a list of all schedules with optional filtering by status, class, or trainer.

**Endpoint:** `GET /schedules`

**Query Parameters:**
- `status` (optional): Filter by status (active/cancelled)
- `class_id` (optional): Filter by class ID
- `trainer_id` (optional): Filter by trainer ID
- `day_of_week` (optional): Filter by day (Monday, Tuesday, etc.)

**Example Request:**
```
GET /api/v1/schedules?status=active&class_id=1
```

**Response (200 OK):**
```json
[
  {
    "schedule_id": 1,
    "class_id": 1,
    "trainer_id": 5,
    "room_id": 1,
    "start_time": "08:00:00",
    "end_time": "09:00:00",
    "day_of_week": "Monday",
    "status": "active",
    "created_at": "2023-07-02T10:00:00Z",
    "updated_at": "2023-07-02T10:00:00Z",
    "class_name": "Yoga Flow",
    "class_duration": 60
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

### Get Schedule by ID

Returns a specific schedule by its ID.

**Endpoint:** `GET /schedules/{id}`

**Path Parameters:**
- `id`: Schedule ID (integer)

**Response (200 OK):**
```json
{
  "schedule_id": 1,
  "class_id": 1,
  "trainer_id": 5,
  "room_id": 1,
  "start_time": "08:00:00",
  "end_time": "09:00:00",
  "day_of_week": "Monday",
  "status": "active",
  "created_at": "2023-07-02T10:00:00Z",
  "updated_at": "2023-07-02T10:00:00Z",
  "class_name": "Yoga Flow",
  "class_duration": 60
}
```

**Error Responses:**
- `400 Bad Request`: Invalid schedule ID
  ```json
  {
    "error": "Invalid schedule ID"
  }
  ```
- `404 Not Found`: Schedule not found
  ```json
  {
    "error": "Schedule not found"
  }
  ```

### Get Schedules by Class ID

Returns all schedules for a specific class.

**Endpoint:** `GET /schedules/class/{classId}`

**Path Parameters:**
- `classId`: Class ID (integer)

**Response (200 OK):**
```json
[
  {
    "schedule_id": 1,
    "class_id": 1,
    "trainer_id": 5,
    "room_id": 1,
    "start_time": "08:00:00",
    "end_time": "09:00:00",
    "day_of_week": "Monday",
    "status": "active",
    "created_at": "2023-07-02T10:00:00Z",
    "updated_at": "2023-07-02T10:00:00Z",
    "class_name": "Yoga Flow",
    "class_duration": 60
  },
  {
    "schedule_id": 10,
    "class_id": 1,
    "trainer_id": 8,
    "room_id": 2,
    "start_time": "10:00:00",
    "end_time": "11:00:00",
    "day_of_week": "Wednesday",
    "status": "active",
    "created_at": "2023-07-02T11:00:00Z",
    "updated_at": "2023-07-02T11:00:00Z",
    "class_name": "Yoga Flow",
    "class_duration": 60
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid class ID
- `404 Not Found`: Class not found

### Create Schedule

Creates a new schedule.

**Endpoint:** `POST /schedules`

**Request Body:**
```json
{
  "class_id": 2,
  "trainer_id": 7,
  "room_id": 3,
  "start_time": "18:30:00",
  "end_time": "19:15:00",
  "day_of_week": "Tuesday",
  "status": "active"
}
```

**Field Validation:**
- `class_id`: Required, integer (must exist)
- `trainer_id`: Required, integer (must exist)
- `room_id`: Required, integer (must exist)
- `start_time`: Required, time format (HH:MM:SS)
- `end_time`: Required, time format (HH:MM:SS, must be after start_time)
- `day_of_week`: Required, one of: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
- `status`: Required, one of: "active", "cancelled"

**Response (201 Created):**
```json
{
  "schedule_id": 11,
  "class_id": 2,
  "trainer_id": 7,
  "room_id": 3,
  "start_time": "18:30:00",
  "end_time": "19:15:00",
  "day_of_week": "Tuesday",
  "status": "active",
  "created_at": "2023-07-15T12:00:00Z",
  "updated_at": "2023-07-15T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
  ```json
  {
    "error": "Start time must be before end time"
  }
  ```
- `404 Not Found`: Class, trainer, or room not found
- `409 Conflict`: Schedule conflict (trainer/room already booked)
  ```json
  {
    "error": "Room is already booked at this time"
  }
  ```

### Update Schedule

Updates an existing schedule.

**Endpoint:** `PUT /schedules/{id}`

**Path Parameters:**
- `id`: Schedule ID (integer)

**Request Body:**
```json
{
  "class_id": 2,
  "trainer_id": 7,
  "room_id": 4,
  "start_time": "19:00:00",
  "end_time": "19:45:00",
  "day_of_week": "Tuesday",
  "status": "active"
}
```

**Field Validation:**
- All fields are optional for updates
- Same validation rules as Create Schedule apply to provided fields

**Response (200 OK):**
```json
{
  "schedule_id": 11,
  "class_id": 2,
  "trainer_id": 7,
  "room_id": 4,
  "start_time": "19:00:00",
  "end_time": "19:45:00",
  "day_of_week": "Tuesday",
  "status": "active",
  "created_at": "2023-07-15T12:00:00Z",
  "updated_at": "2023-07-15T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid schedule ID or request data
- `404 Not Found`: Schedule not found
- `409 Conflict`: Schedule conflict or bookings exist
- `500 Internal Server Error`: Server-side error

### Delete Schedule

Deletes a schedule. This will fail if there are any bookings for this schedule.

**Endpoint:** `DELETE /schedules/{id}`

**Path Parameters:**
- `id`: Schedule ID (integer)

**Response (200 OK):**
```json
{
  "message": "Schedule deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid schedule ID
- `404 Not Found`: Schedule not found
- `409 Conflict`: Schedule has existing bookings
  ```json
  {
    "error": "Cannot delete schedule with existing bookings"
  }
  ```

## Booking Endpoints

### Get All Bookings

Returns a list of all bookings with optional filtering and pagination support.

**Endpoint:** `GET /bookings`

**Query Parameters:**
- `status` (optional): Filter by attendance status (booked/attended/cancelled/no_show)
- `date` (optional): Filter by booking date (YYYY-MM-DD)
- `member_id` (optional): Filter by member ID
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Example Request:**
```
GET /api/v1/bookings?status=attended&date=2023-07-10
```

**Response (200 OK):**
```json
[
  {
    "booking_id": 1,
    "schedule_id": 1,
    "member_id": 3,
    "booking_date": "2023-07-10T08:00:00Z",
    "attendance_status": "attended",
    "feedback_rating": 5,
    "feedback_comment": "Great yoga session, very relaxing!",
    "created_at": "2023-07-03T10:00:00Z",
    "updated_at": "2023-07-10T09:15:00Z",
    "class_name": "Yoga Flow",
    "day_of_week": "Monday",
    "start_time": "08:00:00",
    "trainer_id": 5
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "Invalid date format"
  }
  ```
- `500 Internal Server Error`: Server-side error

### Get Booking by ID

Returns a specific booking by its ID.

**Endpoint:** `GET /bookings/{id}`

**Path Parameters:**
- `id`: Booking ID (integer)

**Response (200 OK):**
```json
{
  "booking_id": 1,
  "schedule_id": 1,
  "member_id": 3,
  "booking_date": "2023-07-10T08:00:00Z",
  "attendance_status": "attended",
  "feedback_rating": 5,
  "feedback_comment": "Great yoga session, very relaxing!",
  "created_at": "2023-07-03T10:00:00Z",
  "updated_at": "2023-07-10T09:15:00Z",
  "class_name": "Yoga Flow",
  "day_of_week": "Monday",
  "start_time": "08:00:00",
  "trainer_id": 5
}
```

### Get Bookings by Member ID

Returns bookings for a specific member.

**Endpoint:** `GET /bookings/member/{memberId}`

**Response (200 OK):**
```json
[
  {
    "booking_id": 1,
    "schedule_id": 1,
    "member_id": 3,
    "booking_date": "2023-07-10T08:00:00Z",
    "attendance_status": "attended",
    "feedback_rating": 5,
    "feedback_comment": "Great yoga session, very relaxing!",
    "created_at": "2023-07-03T10:00:00Z",
    "updated_at": "2023-07-10T09:15:00Z",
    "class_name": "Yoga Flow",
    "day_of_week": "Monday",
    "start_time": "08:00:00",
    "trainer_id": 5
  },
  {
    "booking_id": 12,
    "schedule_id": 4,
    "member_id": 3,
    "booking_date": "2023-07-17T19:00:00Z",
    "attendance_status": "booked",
    "created_at": "2023-07-10T15:00:00Z",
    "updated_at": "2023-07-10T15:00:00Z",
    "class_name": "Zumba",
    "day_of_week": "Tuesday",
    "start_time": "19:00:00",
    "trainer_id": 2
  }
]
```

### Create Booking

Creates a new booking.

**Endpoint:** `POST /bookings`

**Request Body:**
```json
{
  "schedule_id": 2,
  "member_id": 5,
  "booking_date": "2023-07-24T18:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "booking_id": 21,
  "schedule_id": 2,
  "member_id": 5,
  "booking_date": "2023-07-24T18:30:00Z",
  "attendance_status": "booked",
  "created_at": "2023-07-15T14:00:00Z",
  "updated_at": "2023-07-15T14:00:00Z"
}
```

### Update Booking Status

Updates a booking's attendance status.

**Endpoint:** `PUT /bookings/{id}/status`

**Request Body:**
```json
{
  "attendance_status": "attended"
}
```

**Response (200 OK):**
```json
{
  "booking_id": 21,
  "schedule_id": 2,
  "member_id": 5,
  "booking_date": "2023-07-24T18:30:00Z",
  "attendance_status": "attended",
  "created_at": "2023-07-15T14:00:00Z",
  "updated_at": "2023-07-24T19:45:00Z"
}
```

### Add Booking Feedback

Adds feedback to a booking. This can only be done for attended classes.

**Endpoint:** `POST /bookings/{id}/feedback`

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Great workout, but a bit crowded today"
}
```

**Response (200 OK):**
```json
{
  "booking_id": 21,
  "schedule_id": 2,
  "member_id": 5,
  "booking_date": "2023-07-24T18:30:00Z",
  "attendance_status": "attended",
  "feedback_rating": 4,
  "feedback_comment": "Great workout, but a bit crowded today",
  "created_at": "2023-07-15T14:00:00Z",
  "updated_at": "2023-07-24T20:00:00Z"
}
```

### Cancel Booking

Cancels a booking. Only bookings with 'booked' status can be cancelled.

**Endpoint:** `DELETE /bookings/{id}`

**Response (200 OK):**
```json
{
  "booking_id": 21,
  "schedule_id": 2,
  "member_id": 5,
  "booking_date": "2023-07-24T18:30:00Z",
  "attendance_status": "cancelled",
  "created_at": "2023-07-15T14:00:00Z",
  "updated_at": "2023-07-16T09:30:00Z"
}
```

## Health Check Endpoint

### Health Check

Returns the health status of the Class Service.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "class-service",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2023-07-15T10:00:00Z"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "service": "class-service",
  "database": "disconnected",
  "error": "Database connection failed"
}
```
