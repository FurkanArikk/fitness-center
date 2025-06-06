# Auth Service Documentation

The Auth Service is responsible for managing authentication and authorization within the Fitness Center application. This service provides RESTful APIs for user authentication, JWT token management, and access control across all microservices.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Service Configuration](#service-configuration)
- [Technical Stack](#technical-stack)
- [API Documentation](API.md)
- [Getting Started](#getting-started)

## Overview

The Auth Service handles authentication and authorization for the entire fitness center system:

1. **Authentication** - User login and credential validation
2. **Token Management** - JWT token generation, validation, and refresh
3. **Authorization** - Role-based access control and permission management
4. **Session Management** - User session tracking and security

## Features

### Authentication Management
- Secure user login with credential validation
- JWT token generation and management
- Multi-factor authentication support (future enhancement)
- Password encryption and security compliance

### Authorization Control
- Role-based access control (RBAC)
- Permission management for different user types
- Resource-level access control
- API endpoint protection and validation

### Security Features
- JWT token validation and refresh mechanisms
- Secure password hashing using bcrypt
- Rate limiting for authentication attempts
- Session management and logout functionality

### Integration Support
- Central authentication point for all microservices
- Token validation middleware for other services
- Cross-service user context propagation
- Standardized authentication responses

## Service Configuration

- **Default Port**: 8085 (configurable via `AUTH_SERVICE_PORT`)
- **Database Port**: 5434 (configurable via `AUTH_SERVICE_DB_PORT`)
- **Database**: `fitness_auth_db` (configurable via `AUTH_SERVICE_DB_NAME`)
- **Base URL**: `http://localhost:8085/api/v1`
- **Health Check**: `http://localhost:8085/health`

### Environment Variables

```bash
AUTH_SERVICE_PORT=8085
AUTH_SERVICE_DB_PORT=5434
AUTH_SERVICE_DB_NAME=fitness_auth_db
DB_HOST=localhost
DB_USER=fitness_user
DB_PASSWORD=admin
DB_SSLMODE=disable
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY_HOURS=24
```

## Technical Stack

- **Language**: Go (v1.20+)
- **Framework**: Gin Web Framework v1.9+
- **Database**: PostgreSQL 14+
- **ORM**: GORM v1.25+
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Configuration**: Environment-based with `.env` support
- **Logging**: Structured logging with request/response middleware
- **CORS**: Cross-origin resource sharing enabled

## Architecture

The service follows a clean architecture pattern:

```
cmd/main.go                 # Application entry point
├── internal/
│   ├── config/            # Configuration management
│   ├── database/          # Database connection and models
│   ├── handler/           # HTTP handlers (controllers)
│   ├── middleware/        # Authentication middleware
│   ├── model/             # Data models and interfaces
│   ├── repository/        # Data access layer
│   ├── service/           # Business logic layer
│   └── server/            # HTTP server and routing
└── pkg/dto/               # Data transfer objects
```

## Getting Started

1. **Prerequisites**
   - Go 1.20 or higher
   - PostgreSQL 14 or higher
   - Git

2. **Environment Setup**
   ```bash
   # Clone the repository (if needed)
   cd backend/auth-service
   
   # Copy environment file
   cp .env.example .env
   
   # Update configuration in .env
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb fitness_auth_db
   
   # The service will auto-migrate tables on startup
   ```

4. **Run the Service**
   ```bash
   # From the auth-service directory
   go run cmd/main.go
   
   # Or build and run
   go build -o auth-service cmd/main.go
   ./auth-service
   ```

5. **Verify Installation**
   ```bash
   # Check health endpoint
   curl http://localhost:8085/health
   
   # Test login endpoint
   curl -X POST http://localhost:8085/api/v1/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password"}'
   ```

For detailed API documentation, see [API.md](API.md).
