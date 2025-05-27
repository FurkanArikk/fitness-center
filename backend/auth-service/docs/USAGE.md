# Auth Service Usage Guide

This document provides practical examples of how to use the Auth Service API. **This service only supports admin users with a maximum limit of 3 admin accounts.**

## Admin User System

⚠️ **Important Notes**:
- Only **3 admin users maximum** are allowed
- No regular users can be created
- All registrations create admin users
- Use admin tokens to access all other microservices

## API Endpoints

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
The default admin user is available via environment variables:
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
  "expires_at": "2025-05-28T11:27:02Z",
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

### 3. Register New Admin User (Max 3 Total)
```bash
curl -X POST http://localhost:8006/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin2",
    "password": "securepass123",
    "email": "admin2@fitness.com",
    "firstName": "Second",
    "lastName": "Admin"
  }'
```

Expected Success Response:
```json
{
  "success": true,
  "message": "Admin kullanıcısı başarıyla oluşturuldu",
  "user": {
    "id": 2,
    "username": "admin2",
    "role": "admin",
    "email": "admin2@fitness.com",
    "full_name": "Second Admin",
    "is_active": true,
    "created_at": "2025-05-27T12:00:00Z",
    "updated_at": "2025-05-27T12:00:00Z"
  }
}
```

Expected Error (When 3 admins already exist):
```json
{
  "success": false,
  "message": "Maksimum admin kullanıcı sayısına ulaşıldı (3/3). Yeni admin kullanıcı kaydı yapılamaz."
}
```

## Complete Workflow Example

```bash
#!/bin/bash

# 1. Check if service is running
echo "Checking service health..."
curl -s http://localhost:8006/health | jq

# 2. Login and extract token
echo -e "\nLogging in..."
RESPONSE=$(curl -s -X POST http://localhost:8006/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "furkan",
    "password": "furkan123"
  }')

echo "$RESPONSE" | jq

# Extract token
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
echo -e "\nExtracted token: $TOKEN"

# 3. Validate the token
echo -e "\nValidating token..."
curl -s -X POST http://localhost:8006/validate-token \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\"
  }" | jq

# 4. Get user info
echo -e "\nGetting user info..."
curl -s -X GET http://localhost:8006/user-info \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

class AuthClient {
  constructor(baseURL = 'http://localhost:8006') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${this.baseURL}/login`, {
        username,
        password
      });
      
      this.token = response.data.token;
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async validateToken(token = this.token) {
    try {
      const response = await axios.post(`${this.baseURL}/validate-token`, {
        token
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Token validation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async getUserInfo() {
    if (!this.token) {
      throw new Error('No token available. Please login first.');
    }

    try {
      const response = await axios.get(`${this.baseURL}/user-info`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Get user info failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
}

// Usage example
(async () => {
  const auth = new AuthClient();
  
  try {
    // Check health
    const health = await auth.checkHealth();
    console.log('Health:', health);
    
    // Login
    const loginResult = await auth.login('furkan', 'furkan123');
    console.log('Login successful:', loginResult.user);
    
    // Validate token
    const validation = await auth.validateToken();
    console.log('Token valid:', validation.valid);
    
    // Get user info
    const userInfo = await auth.getUserInfo();
    console.log('User info:', userInfo.user);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### Python

```python
import requests
import json

class AuthClient:
    def __init__(self, base_url='http://localhost:8006'):
        self.base_url = base_url
        self.token = None
    
    def login(self, username, password):
        """Login and store the token"""
        response = requests.post(f'{self.base_url}/login', json={
            'username': username,
            'password': password
        })
        
        if response.status_code == 200:
            data = response.json()
            self.token = data['token']
            return data
        else:
            raise Exception(f"Login failed: {response.json().get('error', 'Unknown error')}")
    
    def validate_token(self, token=None):
        """Validate a JWT token"""
        token_to_validate = token or self.token
        if not token_to_validate:
            raise Exception("No token available")
        
        response = requests.post(f'{self.base_url}/validate-token', json={
            'token': token_to_validate
        })
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Token validation failed: {response.json().get('error', 'Unknown error')}")
    
    def get_user_info(self):
        """Get user information using stored token"""
        if not self.token:
            raise Exception("No token available. Please login first.")
        
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f'{self.base_url}/user-info', headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Get user info failed: {response.json().get('error', 'Unknown error')}")
    
    def check_health(self):
        """Check service health"""
        response = requests.get(f'{self.base_url}/health')
        return response.json()

# Usage example
if __name__ == "__main__":
    auth = AuthClient()
    
    try:
        # Check health
        health = auth.check_health()
        print("Health:", health)
        
        # Login
        login_result = auth.login('furkan', 'furkan123')
        print("Login successful:", login_result['user'])
        
        # Validate token
        validation = auth.validate_token()
        print("Token valid:", validation['valid'])
        
        # Get user info
        user_info = auth.get_user_info()
        print("User info:", user_info['user'])
        
    except Exception as e:
        print("Error:", str(e))
```

### Go (Other Microservices)

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type AuthClient struct {
    BaseURL string
    Token   string
}

type LoginRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

type LoginResponse struct {
    Token     string    `json:"token"`
    ExpiresAt time.Time `json:"expires_at"`
    User      User      `json:"user"`
}

type ValidateTokenRequest struct {
    Token string `json:"token"`
}

type ValidateTokenResponse struct {
    Valid     bool      `json:"valid"`
    User      *User     `json:"user"`
    ExpiresAt *time.Time `json:"expires_at"`
}

type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Role     string `json:"role"`
    Email    string `json:"email"`
    FullName string `json:"full_name"`
    IsActive bool   `json:"is_active"`
}

func NewAuthClient(baseURL string) *AuthClient {
    return &AuthClient{BaseURL: baseURL}
}

func (c *AuthClient) Login(username, password string) (*LoginResponse, error) {
    reqBody := LoginRequest{
        Username: username,
        Password: password,
    }
    
    jsonBody, _ := json.Marshal(reqBody)
    resp, err := http.Post(c.BaseURL+"/login", "application/json", bytes.NewBuffer(jsonBody))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("login failed with status: %d", resp.StatusCode)
    }
    
    var result LoginResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }
    
    c.Token = result.Token
    return &result, nil
}

func (c *AuthClient) ValidateToken(token string) (*ValidateTokenResponse, error) {
    reqBody := ValidateTokenRequest{Token: token}
    jsonBody, _ := json.Marshal(reqBody)
    
    resp, err := http.Post(c.BaseURL+"/validate-token", "application/json", bytes.NewBuffer(jsonBody))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var result ValidateTokenResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }
    
    return &result, nil
}

func (c *AuthClient) GetUserInfo() (*User, error) {
    if c.Token == "" {
        return nil, fmt.Errorf("no token available")
    }
    
    req, err := http.NewRequest("GET", c.BaseURL+"/user-info", nil)
    if err != nil {
        return nil, err
    }
    
    req.Header.Set("Authorization", "Bearer "+c.Token)
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("get user info failed with status: %d", resp.StatusCode)
    }
    
    var result struct {
        User User `json:"user"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }
    
    return &result.User, nil
}

// Usage example
func main() {
    client := NewAuthClient("http://localhost:8006")
    
    // Login
    loginResp, err := client.Login("furkan", "furkan123")
    if err != nil {
        fmt.Printf("Login error: %v\n", err)
        return
    }
    fmt.Printf("Login successful: %s\n", loginResp.User.Username)
    
    // Validate token
    validation, err := client.ValidateToken(client.Token)
    if err != nil {
        fmt.Printf("Validation error: %v\n", err)
        return
    }
    fmt.Printf("Token valid: %t\n", validation.Valid)
    
    // Get user info
    user, err := client.GetUserInfo()
    if err != nil {
        fmt.Printf("Get user info error: %v\n", err)
        return
    }
    fmt.Printf("User: %s (%s)\n", user.Username, user.Role)
}
```

## Error Handling Examples

### Invalid Credentials
```bash
curl -X POST http://localhost:8006/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "invalid",
    "password": "wrong"
  }'
```

Response:
```json
{
  "error": "Geçersiz kullanıcı adı veya şifre"
}
```

### Invalid Token
```bash
curl -X POST http://localhost:8006/validate-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid.jwt.token"
  }'
```

Response:
```json
{
  "valid": false,
  "user": null,
  "expires_at": null
}
```

### Missing Authorization Header
```bash
curl -X GET http://localhost:8006/user-info
```

Response:
```json
{
  "error": "Authorization header gerekli"
}
```

## Performance Testing

### Load Testing with wrk
```bash
# Install wrk first
# sudo apt-get install wrk

# Test login endpoint
wrk -t12 -c400 -d30s -s login.lua http://localhost:8006/login

# Create login.lua script:
wrk.method = "POST"
wrk.body = '{"username":"furkan","password":"furkan123"}'
wrk.headers["Content-Type"] = "application/json"
```

### Simple Benchmark
```bash
# Time multiple requests
time for i in {1..100}; do
  curl -s http://localhost:8006/health > /dev/null
done
```

This completes the usage examples for the Auth Service!
