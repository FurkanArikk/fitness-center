# Auth Service API Documentation

## Overview

The Auth Service provides authentication and authorization functionality for the Fitness Center microservices system. It handles user login, JWT token generation and validation, and serves as the central authentication point for all services.

## Base URL

```
http://localhost:8085
```

## Endpoints

### 1. Health Check

Check if the service is running and healthy.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2025-06-01T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

**Example:**
```bash
curl -X GET http://localhost:8085/health
```

### 2. Login

Authenticate user credentials and receive a JWT token.

**Endpoint:** `POST /api/v1/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

**Response (Error):**
```json
{
  "error": "invalid username or password"
}
```

**Status Codes:**
- `200 OK` - Authentication successful
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Invalid credentials

**Example:**
```bash
curl -X POST http://localhost:8085/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

### 3. Forward Auth (Traefik Integration)

Validate JWT token for Traefik ForwardAuth middleware. This endpoint is typically called by Traefik to validate requests to protected services.

**Endpoint:** `GET /api/v1/auth`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
- `200 OK` - Token is valid
- Headers returned to Traefik:
  - `X-User: <username>`
  - `X-Auth-Service: auth-service`

**Response (Error):**
```json
{
  "error": "unauthorized"
}
```

**Status Codes:**
- `200 OK` - Token is valid
- `401 Unauthorized` - Token is invalid, expired, or missing

**Example:**
```bash
curl -X GET http://localhost:8085/api/v1/auth \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Create Admin (Protected)

Create a new admin user. Requires authentication.

**Endpoint:** `POST /api/v1/admin/create`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "newadmin",
  "password": "securepassword123",
  "email": "newadmin@fitness-center.local"
}
```

**Response (Success):**
```json
{
  "message": "Admin user created successfully"
}
```

**Response (Error):**
```json
{
  "error": "Username, password, and email are required"
}
```

**Status Codes:**
- `201 Created` - Admin created successfully
- `400 Bad Request` - Invalid request body or missing fields
- `401 Unauthorized` - Invalid or missing authentication token
- `500 Internal Server Error` - Server error during creation

**Example:**
```bash
curl -X POST http://localhost:8085/api/v1/admin/create \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "password": "securepassword123",
    "email": "newadmin@fitness-center.local"
  }'
```

### 5. Update Admin Password (Protected)

Update an admin user's password. Requires authentication and current password.

**Endpoint:** `PUT /api/v1/admin/password`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "admin",
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

**Response (Success):**
```json
{
  "message": "Password updated successfully"
}
```

**Response (Error):**
```json
{
  "error": "current password is incorrect"
}
```

**Status Codes:**
- `200 OK` - Password updated successfully
- `400 Bad Request` - Invalid request body or missing fields
- `401 Unauthorized` - Invalid authentication token or incorrect current password
- `500 Internal Server Error` - Server error during update

**Example:**
```bash
curl -X PUT http://localhost:8085/api/v1/admin/password \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "current_password": "oldpassword",
    "new_password": "newpassword123"
  }'
```

### 6. List Admins (Protected)

Get list of all admin users. Requires authentication.

**Endpoint:** `GET /api/v1/admin/list`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "admins": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@fitness-center.local",
      "is_active": true,
      "created_at": "2025-06-01T10:00:00Z",
      "last_login_at": "2025-06-01T15:30:00Z"
    },
    {
      "id": 2,
      "username": "admin2",
      "email": "admin2@fitness-center.local",
      "is_active": true,
      "created_at": "2025-06-01T11:00:00Z",
      "last_login_at": ""
    }
  ]
}
```

**Status Codes:**
- `200 OK` - List retrieved successfully
- `401 Unauthorized` - Invalid or missing authentication token
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X GET http://localhost:8085/api/v1/admin/list \
  -H "Authorization: Bearer <your_token>"
```

### 7. Deactivate Admin (Protected)

Deactivate an admin user. Requires authentication.

**Endpoint:** `DELETE /api/v1/admin/{username}`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "message": "Admin user deactivated successfully"
}
```

**Response (Error):**
```json
{
  "error": "admin not found"
}
```

**Status Codes:**
- `200 OK` - Admin deactivated successfully
- `400 Bad Request` - Username is required
- `401 Unauthorized` - Invalid or missing authentication token
- `500 Internal Server Error` - Server error

**Example:**
```bash
curl -X DELETE http://localhost:8085/api/v1/admin/oldadmin \
  -H "Authorization: Bearer <your_token>"
```
