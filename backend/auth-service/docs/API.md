# Auth Service API Documentation

## Overview

The Auth Service provides authentication and authorization functionality for the Fitness Center application with JWT-based session management and admin user registration.

## Base URL

```
Local Development: http://localhost:8006
Docker: http://localhost:8006
```

## Authentication

The service provides JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check the health status of the service

**Response (200 OK):**
```json
{
    "status": "healthy",
    "service": "auth-service"
}
```

### 2. User Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate a user and receive a JWT token

**Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Response (200 OK):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2025-01-11T10:30:00Z",
    "user": {
        "id": 1,
        "username": "admin",
        "role": "admin",
        "email": "admin@fitness.com",
        "full_name": "Admin User",
        "is_active": true
    }
}
```

**Error Response (401):**
```json
{
    "error": "Geçersiz kullanıcı adı veya şifre"
}
```

### 3. Token Validation

**Endpoint:** `POST /api/v1/auth/validate`

**Description:** Validate a JWT token and get user information

**Request Body:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
    "valid": true,
    "user": {
        "id": 1,
        "username": "admin",
        "role": "admin"
    }
}
```

### 4. Get User Information

**Endpoint:** `GET /api/v1/auth/user`

**Description:** Get user information from Authorization header

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
    "user": {
        "id": 1,
        "username": "admin",
        "role": "admin",
        "email": "admin@fitness.com",
        "full_name": "Admin User",
        "is_active": true
    }
}
```

### 5. User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Register a new admin user (limited to 3 total)

**Request Body:**
```json
{
    "username": "string",
    "password": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "message": "Admin kullanıcısı başarıyla oluşturuldu (2/3)",
    "user": {
        "id": 2,
        "username": "admin1",
        "role": "admin",
        "email": "admin1@fitness.com",
        "full_name": "Admin One",
        "is_active": true
    }
}
```

**Error Response (403):**
```json
{
    "success": false,
    "message": "Maksimum admin kullanıcı sayısına ulaşıldı (3/3)"
}
```

## Data Models

### User Model
```json
{
    "id": "integer",
    "username": "string",
    "role": "string",
    "email": "string", 
    "full_name": "string",
    "is_active": "boolean",
    "created_at": "string (ISO 8601)",
    "updated_at": "string (ISO 8601)",
    "last_login_at": "string (ISO 8601)"
}
```

### Login Response
```json
{
    "token": "string (JWT token)",
    "expires_at": "string (ISO 8601)",
    "user": "User object"
}
```

### Registration Response
```json
{
    "success": "boolean",
    "message": "string",
    "user": "User object"
}
```

## Error Handling

All error responses follow this format:
```json
{
    "error": "Error message",
    "details": "Additional details (optional)"
}
```

Common HTTP status codes:
- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request format
- **401 Unauthorized:** Authentication failed
- **403 Forbidden:** Action not allowed
- **500 Internal Server Error:** Server error

## Security Features

- bcrypt password hashing
- JWT token authentication
- Session tracking and revocation
- Configurable token expiration
- Admin user limitation (max 3)
- Database-backed session management

## Admin User Management

- **Maximum Users:** 3 admin users
- **Registration:** Only admin users can be created
- **Authentication:** JWT-based with database sessions
- **Default Users:** Configurable via environment variables
