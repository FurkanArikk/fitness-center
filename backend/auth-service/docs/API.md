# Auth Service API Documentation

The Auth Service provides authentication and authorization functionality for the Fitness Center microservices system. It handles user login, JWT token generation and validation, and serves as the central authentication point for all services.

## Base URL

```
http://localhost:8085/api/v1
```

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Health Check Endpoint](#health-check-endpoint)

## Authentication Endpoints

### Login

Authenticate user credentials and receive a JWT token.

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Field Validation:**
- `username`: Required, string (3-50 characters)
- `password`: Required, string (minimum 6 characters)

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@fitness.com",
    "role": "admin",
    "status": "active",
    "last_login": "2025-06-04T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or missing fields
  ```json
  {
    "error": "Username and password are required"
  }
  ```
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "error": "Invalid username or password"
  }
  ```
- `403 Forbidden`: Account is inactive or suspended
  ```json
  {
    "error": "Account is suspended"
  }
  ```

### Refresh Token

Get a new access token using a refresh token.

**Endpoint:** `POST /refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**Error Responses:**
- `400 Bad Request`: Missing refresh token
  ```json
  {
    "error": "Refresh token is required"
  }
  ```
- `401 Unauthorized`: Invalid or expired refresh token
  ```json
  {
    "error": "Invalid or expired refresh token"
  }
  ```

### Logout

Invalidate the current session and refresh token.

**Endpoint:** `POST /logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing access token
  ```json
  {
    "error": "Invalid or missing access token"
  }
  ```

### Validate Token

Validate an access token and return user information.

**Endpoint:** `POST /validate`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@fitness.com",
    "role": "admin",
    "status": "active"
  },
  "expires_at": "2025-06-04T11:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
  ```json
  {
    "valid": false,
    "error": "Token is invalid or expired"
  }
  ```

## User Management Endpoints

### Register User

Create a new user account (admin only).

**Endpoint:** `POST /users`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@fitness.com",
  "password": "securepassword",
  "role": "staff"
}
```

**Field Validation:**
- `username`: Required, string (3-50 characters), unique
- `email`: Required, valid email format, unique
- `password`: Required, string (minimum 8 characters)
- `role`: Required, one of: "admin", "staff", "member"

**Response (201 Created):**
```json
{
  "id": 2,
  "username": "newuser",
  "email": "newuser@fitness.com",
  "role": "staff",
  "status": "active",
  "created_at": "2025-06-04T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
  ```json
  {
    "error": "Username already exists"
  }
  ```
- `401 Unauthorized`: Invalid or missing access token
- `403 Forbidden`: Insufficient permissions (not admin)
  ```json
  {
    "error": "Admin access required"
  }
  ```

### Get User Profile

Get the current user's profile information.

**Endpoint:** `GET /profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@fitness.com",
  "role": "admin",
  "status": "active",
  "last_login": "2025-06-04T10:30:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-06-04T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing access token

### Update User Profile

Update the current user's profile information.

**Endpoint:** `PUT /profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "email": "newemail@fitness.com",
  "password": "newpassword"
}
```

**Field Validation:**
- `email`: Optional, valid email format, unique
- `password`: Optional, string (minimum 8 characters)

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "newemail@fitness.com",
  "role": "admin",
  "status": "active",
  "updated_at": "2025-06-04T10:35:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing access token

### Change Password

Change the current user's password.

**Endpoint:** `PUT /change-password`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

**Field Validation:**
- `current_password`: Required, string
- `new_password`: Required, string (minimum 8 characters)

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or weak password
- `401 Unauthorized`: Invalid current password or missing access token

## Health Check Endpoint

### Check Service Health

Verifies that the authentication service is running properly.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2025-06-04T10:30:00Z"
}
```

**Error Responses:**
- `500 Internal Server Error`: Service is unhealthy or database connection issues
