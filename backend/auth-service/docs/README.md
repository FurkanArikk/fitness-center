# Auth Service Documentation

The Auth Service is responsible for user authentication and authorization within the Fitness Center application. This service provides JWT-based authentication with strict admin-only user management, supporting a maximum of 3 admin users.

## Table of Contents

- [Overview](#overview)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)

## Overview

The Auth Service handles authentication and user management with the following entities:

1. **Users** - Admin users with authentication credentials
2. **Sessions** - JWT token tracking and session management
3. **System Config** - Configuration settings like user limits

### Key Features

- JWT-based authentication and authorization
- Admin-only user system (maximum 3 users)
- Secure password hashing with bcrypt
- Session tracking and token validation
- Token expiration and revocation
- Health monitoring and status endpoints
- Database-backed user and session management

### Service Dependencies

The Auth Service provides authentication for:

- **API Gateway** - Token validation for route protection
- **All Microservices** - User authentication and authorization
- **Frontend Applications** - User login and session management

### Technical Stack

- **Language**: Go
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **Containerization**: Docker

## Quick Start

The Auth Service can be run using the included `run.sh` script:

```bash
# Run with default settings (keep data, use Docker)
./run.sh

# Or use docker-compose directly
docker-compose up -d

# Check service health
curl http://localhost:8006/health
```

For more details on deployment options, check the [Deployment Guide](DEPLOYMENT.md).

## Default Configuration

### Admin User Limits
- **Maximum**: 3 admin users
- **Default Admin**: Available via environment variables
- **Registration**: Limited to admin users only

### Default Environment
- **Port**: 8006
- **Database Port**: 5437
- **JWT Expiration**: 24 hours
- **Container Name**: fitness-auth-db

### Security Features
- bcrypt password hashing (cost: 12)
- JWT token signing with secret key
- Session tracking in database
- Automatic expired session cleanup
- Token revocation capabilities
