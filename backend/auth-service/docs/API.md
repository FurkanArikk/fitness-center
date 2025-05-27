# Auth Service API Documentation

## Overview

The Auth Service provides authentication and authorization functionality for the Fitness Center application. It uses JWT tokens for secure communication and supports both database-backed and environment variable authentication.

## Base URL

```
Local Development: http://localhost:8006
Docker: http://localhost:8006
Production: http://your-domain/api/v1/auth
```

## Authentication

The service provides JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. User Login

**Endpoint:** `POST /login`

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
        "username": "furkan",
        "role": "admin",
        "email": "furkan@example.com",
        "full_name": "Furkan Arık",
        "is_active": true,
        "created_at": "2025-01-10T10:30:00Z",
        "updated_at": "2025-01-10T10:30:00Z",
        "last_login_at": "2025-01-10T10:30:00Z"
    }
}
```

**Error Responses:**

- **400 Bad Request:** Invalid request format
```json
{
    "error": "Geçersiz istek formatı",
    "details": "validation error details"
}
```

- **401 Unauthorized:** Invalid credentials
```json
{
    "error": "Geçersiz kullanıcı adı veya şifre"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8006/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "furkan",
    "password": "furkan123"
  }'
```

### 2. Token Validation

**Endpoint:** `POST /validate-token`

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
        "username": "furkan",
        "role": "admin"
    },
    "expires_at": "2025-01-11T10:30:00Z"
}
```

**Invalid Token Response:**
```json
{
    "valid": false,
    "user": null,
    "expires_at": null
}
```

**Error Responses:**

- **400 Bad Request:** Invalid request format
```json
{
    "error": "Geçersiz istek formatı",
    "details": "validation error details"
}
```

- **500 Internal Server Error:** Token validation error
```json
{
    "error": "Token doğrulama hatası"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8006/validate-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 3. Get User Information

**Endpoint:** `GET /user-info`

**Description:** Extract user information from the Authorization header

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
    "user": {
        "id": 1,
        "username": "furkan",
        "role": "admin",
        "email": "furkan@example.com",
        "full_name": "Furkan Arık",
        "is_active": true,
        "created_at": "2025-01-10T10:30:00Z",
        "updated_at": "2025-01-10T10:30:00Z",
        "last_login_at": "2025-01-10T10:30:00Z"
    }
}
```

**Error Responses:**

- **401 Unauthorized:** Missing or invalid Authorization header
```json
{
    "error": "Authorization header gerekli"
}
```

```json
{
    "error": "Geçersiz Authorization header formatı"
}
```

```json
{
    "error": "Geçersiz token"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8006/user-info \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Health Check

**Endpoint:** `GET /health`

**Description:** Check the health status of the service

**Response (200 OK):**
```json
{
    "status": "healthy",
    "service": "auth-service"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8006/health
```

## Data Models

### User Model
```json
{
    "id": "integer",
    "username": "string",
    "password_hash": "string (not exposed in responses)",
    "role": "string (user|admin|trainer)",
    "email": "string",
    "full_name": "string",
    "is_active": "boolean",
    "created_at": "string (ISO 8601)",
    "updated_at": "string (ISO 8601)",
    "last_login_at": "string (ISO 8601)"
}
```

### Login Request
```json
{
    "username": "string (required)",
    "password": "string (required)"
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

### Token Validation Request
```json
{
    "token": "string (required)"
}
```

### Token Validation Response
```json
{
    "valid": "boolean",
    "user": "User object or null",
    "expires_at": "string (ISO 8601) or null"
}
```

## Error Handling

All error responses follow this format:
```json
{
    "error": "Error message in Turkish",
    "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- **200 OK:** Request successful
- **400 Bad Request:** Invalid request format or parameters
- **401 Unauthorized:** Authentication failed or invalid token
- **500 Internal Server Error:** Server-side error

## Rate Limiting

Currently, there are no rate limiting restrictions, but it's recommended to implement rate limiting in production environments.

## CORS

The service should be configured to handle CORS appropriately for your frontend domain.

## Security Considerations

1. **JWT Tokens:** 
   - Tokens expire after the configured time (default: 24 hours)
   - Tokens are signed with a secret key
   - Store tokens securely on the client side

2. **Password Security:**
   - Passwords are hashed using bcrypt
   - Never expose password hashes in API responses

3. **Session Management:**
   - Sessions are tracked in the database
   - Expired sessions are automatically cleaned up
   - Sessions can be revoked for security

4. **HTTPS:**
   - Always use HTTPS in production
   - Tokens should never be transmitted over HTTP

## Integration Examples

### JavaScript/Frontend Integration

```javascript
// Login
const login = async (username, password) => {
    const response = await fetch('http://localhost:8006/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        return data;
    } else {
        throw new Error('Login failed');
    }
};

// Get user info
const getUserInfo = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:8006/user-info', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Failed to get user info');
    }
};

// Validate token
const validateToken = async (token) => {
    const response = await fetch('http://localhost:8006/validate-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });
    
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Token validation failed');
    }
};
```

### Go Service Integration

```go
import (
    "bytes"
    "encoding/json"
    "net/http"
)

type AuthClient struct {
    baseURL string
}

func (c *AuthClient) ValidateToken(token string) (*ValidateTokenResponse, error) {
    reqBody := map[string]string{"token": token}
    jsonBody, _ := json.Marshal(reqBody)
    
    resp, err := http.Post(c.baseURL+"/validate-token", 
        "application/json", bytes.NewBuffer(jsonBody))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var result ValidateTokenResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}
```
