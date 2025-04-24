# Class Service API Documentation

This document outlines all the API endpoints provided by the Class Service.

Base URL: `/api/v1`

## Classes

### Get All Classes

Returns a list of all classes, optionally filtered by active status.

**Endpoint:** `GET /classes`

**Query Parameters:**
- `active` (optional): Filter by active status (true/false)

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
    "description": "High-intensity interval training",
    "duration": 45,
    "capacity": 15,
    "difficulty": "Advanced",
    "is_active": true,
    "created_at": "2023-07-01T11:00:00Z",
    "updated_at": "2023-07-01T11:00:00Z"
  }
]
```

### Get Class by ID

Returns a specific class by its ID.

**Endpoint:** `GET /classes/{id}`

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

### Create Class

Creates a new class.

**Endpoint:** `POST /classes`

**Request Body:**
```json
{
  "class_name": "Pilates",
  "description": "A system of exercises designed to improve physical strength",
  "duration": 50,
  "capacity": 15,
  "difficulty": "Intermediate",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "class_id": 3,
  "class_name": "Pilates",
  "description": "A system of exercises designed to improve physical strength",
  "duration": 50,
  "capacity": 15,
  "difficulty": "Intermediate",
  "is_active": true,
  "created_at": "2023-07-15T10:00:00Z",
  "updated_at": "2023-07-15T10:00:00Z"
}
```

### Update Class

Updates an existing class.

**Endpoint:** `PUT /classes/{id}`

**Request Body:**
```json
{
  "class_name": "Pilates Plus",
  "description": "An advanced system of exercises designed to improve physical strength",
  "duration": 55,
  "capacity": 12,
  "difficulty": "Advanced",
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "class_id": 3,
  "class_name": "Pilates Plus",
  "description": "An advanced system of exercises designed to improve physical strength",
  "duration": 55,
  "capacity": 12,
  "difficulty": "Advanced",
  "is_active": true,
  "created_at": "2023-07-15T10:00:00Z",
  "updated_at": "2023-07-15T11:30:00Z"
}
```

### Delete Class

Deletes a class. This will fail if the class is used in any schedule.

**Endpoint:** `DELETE /classes/{id}`

**Response (200 OK):**
```json
{
  "message": "Class deleted successfully"
}
```

## Schedules

### Get All Schedules

Returns a list of all schedules, optionally filtered by status.

**Endpoint:** `GET /schedules`

**Query Parameters:**
- `status` (optional): Filter by status (active/cancelled)

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

### Get Schedule by ID

Returns a specific schedule by its ID.

**Endpoint:** `GET /schedules/{id}`

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

### Get Schedules by Class ID

Returns schedules for a specific class.

**Endpoint:** `GET /schedules/class/{classId}`

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

### Update Schedule

Updates an existing schedule.

**Endpoint:** `PUT /schedules/{id}`

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

### Delete Schedule

Deletes a schedule. This will fail if there are any bookings for this schedule.

**Endpoint:** `DELETE /schedules/{id}`

**Response (200 OK):**
```json
{
  "message": "Schedule deleted successfully"
}
```

## Bookings

### Get All Bookings

Returns a list of all bookings, optionally filtered by status and date.

**Endpoint:** `GET /bookings`

**Query Parameters:**
- `status` (optional): Filter by attendance status (booked/attended/cancelled/no_show)
- `date` (optional): Filter by booking date (YYYY-MM-DD)

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

### Get Booking by ID

Returns a specific booking by its ID.

**Endpoint:** `GET /bookings/{id}`

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
