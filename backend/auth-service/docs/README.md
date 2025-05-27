# Auth Service

The Auth Service is a microservice that handles user authentication and authorization for the Fitness Center application. It provides JWT-based authentication with strict admin-only user management.

## Features

- JWT token generation and validation
- User authentication with bcrypt password hashing
- Session management and token tracking
- **Admin-only user system** (maximum 3 admin users)
- Environment variable fallback for default admin
- Session cleanup and security features
- Docker containerization with PostgreSQL

## User Management Policy

⚠️ **Important**: This auth service is designed for **admin-only access**:
- Only **3 admin users maximum** can be created
- No regular users are allowed
- All registrations create admin users (limited to 3)
- Use the default admin or register new admin users for access

## Quick Start

1. **Start the service**:
   ```bash
   ./run.sh
   ```

2. **Login with default admin**:
   ```bash
   curl -X POST http://localhost:8006/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "fitness123"}'
   ```

3. **Create additional admin users** (max 3 total):
   ```bash
   curl -X POST http://localhost:8006/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "newadmin",
       "password": "newpass123",
       "email": "admin@fitness.com",
       "firstName": "Admin",
       "lastName": "User"
     }'
   ```

## Admin User Limits

- **Maximum 3 admin users** can exist in the system
- Registration endpoint **only creates admin users**
- No regular user registration is supported
- Use admin tokens for accessing other microservices

## Environment Variables

```env
# Server Configuration
AUTH_SERVICE_HOST=0.0.0.0
AUTH_SERVICE_PORT=8006

# JWT Configuration
JWT_SECRET=fitness_center_super_secret_jwt_key_2025
JWT_EXPIRATION_HOURS=24

# Fallback Authentication (for backward compatibility)
AUTH_USERNAME=admin
AUTH_PASSWORD=fitness123

# Database Configuration
AUTH_SERVICE_DB_HOST=localhost
AUTH_SERVICE_DB_PORT=5437
AUTH_SERVICE_DB_NAME=fitness_auth
AUTH_SERVICE_DB_USER=postgres
AUTH_SERVICE_DB_PASSWORD=postgres
AUTH_SERVICE_DB_SSLMODE=disable

# Other
API_GATEWAY_URL=http://localhost:8000
LOG_LEVEL=info
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    email VARCHAR(100),
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false,
    user_agent TEXT,
    ip_address INET
);
```

## API Endpoints

### POST /login
Authenticate user and receive JWT token

**Request:**
```json
{
    "username": "furkan",
    "password": "furkan123"
}
```

**Response:**
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
        "is_active": true
    }
}
```

### POST /validate-token
Validate JWT token

**Request:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
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

### GET /user-info
Get user information from Authorization header

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "username": "furkan",
        "role": "admin",
        "email": "furkan@example.com",
        "full_name": "Furkan Arık"
    }
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
    "status": "healthy",
    "service": "auth-service"
}
```

## Default Users

The service initializes with default users:
- **furkan/furkan123** (admin role)
- **admin/admin** (admin role)

## Getting Started

### Using Docker Compose
```bash
# Start the service with database
docker-compose up -d

# Check logs
docker-compose logs -f auth-service

# Stop the service
docker-compose down
```

### Local Development
```bash
# Install dependencies
go mod download

# Run database migrations (PostgreSQL required)
# Update .env with your database configuration

# Run the service
go run cmd/main.go
```

## Security Features

- bcrypt password hashing
- JWT token with configurable expiration
- Session tracking and management
- Token hash storage for revocation
- Automatic expired session cleanup
- IP address and user agent tracking

## Development

### Project Structure
```
auth-service/
├── cmd/                    # Application entry point
├── internal/
│   ├── config/            # Configuration management
│   ├── handler/           # HTTP handlers
│   ├── service/           # Business logic
│   ├── repository/        # Data access layer
│   ├── model/             # Data models
│   ├── db/                # Database connection
│   └── server/            # HTTP server setup
├── migrations/            # Database migration files
├── docs/                  # Documentation
├── scripts/               # Database and deployment scripts
├── Dockerfile             # Container definition
├── docker-compose.yml     # Service orchestration
├── .env                   # Environment variables
└── run.sh                 # Startup script
```

### Testing
```bash
# Run tests
go test ./...

# Run with coverage
go test -cover ./...
```

## Monitoring and Logs

The service provides health check endpoints and structured logging for monitoring and debugging purposes.
