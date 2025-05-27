# Auth Service Usage Guide

This document provides practical examples of how to use the Auth Service API. **Currently only supports the default admin user.**

## Current Limitations

⚠️ **Important Notes**:
- Only **default admin user** is available: `admin/fitness123`
- User registration endpoint is **not implemented** 
- Maximum 3 admin limit is configured but registration is unavailable
- All functionality works with the default admin user

## Available API Endpoints

### 1. Health Check
```bash
curl -X GET http://localhost:8006/health
```

Expected Response:
```json
{
  "status": "healthy",
  "service": "auth-service"
}
```

### 2. Login with Default Admin
```bash
curl -X POST http://localhost:8006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "fitness123"
  }'
```

Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-05-28T12:55:50Z",
  "user": {
    "id": 0,
    "username": "admin",
    "role": "admin",
    "email": "",
    "full_name": "Default Admin",
    "is_active": false,
    "created_at": "0001-01-01T00:00:00Z",
    "updated_at": "0001-01-01T00:00:00Z",
    "last_login_at": null
  }
}
```

### 3. Validate Token
```bash
# Use the token from login response
curl -X POST http://localhost:8006/api/v1/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 4. Get User Information
```bash
# Use the token from login response
curl -X GET http://localhost:8006/api/v1/auth/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Working Example Workflow

```bash
#!/bin/bash

echo "=== Auth Service Test ==="

# 1. Check health
echo "1. Health check..."
curl -s http://localhost:8006/health | jq

# 2. Login with default admin
echo -e "\n2. Login..."
RESPONSE=$(curl -s -X POST http://localhost:8006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "fitness123"
  }')

echo "$RESPONSE" | jq

# 3. Extract token
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
echo -e "\nToken: $TOKEN"

# 4. Validate token
echo -e "\n3. Validate token..."
curl -s -X POST http://localhost:8006/api/v1/auth/validate \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" | jq

# 5. Get user info
echo -e "\n4. Get user info..."
curl -s -X GET http://localhost:8006/api/v1/auth/user \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Next Steps

To create the "furkan" admin user you wanted, the registration endpoint needs to be implemented in the auth service code. Currently, you can:

1. **Use the default admin**: `admin/fitness123`
2. **Manually insert into database** (not recommended)
3. **Wait for registration endpoint implementation**

For now, use the default admin for testing other services and functionality.
