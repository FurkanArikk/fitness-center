# Member Service Documentation

The Member Service is responsible for managing members, memberships, membership benefits, and fitness assessments within the Fitness Center application. This service provides RESTful APIs for managing member data, tracking memberships, and recording fitness assessments.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Service Configuration](#service-configuration)
- [Technical Stack](#technical-stack)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Getting Started](#getting-started)

## Overview

The Member Service handles four main entities:

1. **Members** - People who use the fitness center (personal details, contact information)
2. **Memberships** - Types of memberships offered (pricing, duration, features)
3. **Benefits** - Specific features included in each membership type
4. **Assessments** - Physical fitness evaluations of members

## Features

### Member Management
- Register new members and manage comprehensive member profiles
- Track member personal details, contact information, and emergency contacts
- Support member status management (active, inactive, suspended)
- Handle member registration and profile updates

### Membership Management
- Create and manage various membership plans and pricing structures
- Track member-membership relationships and subscription status
- Monitor membership expiration dates and renewal processes
- Support different membership types (monthly, yearly, premium, basic)

### Benefits Administration
- Define and manage membership benefits and features
- Associate specific benefits with different membership types
- Track benefit usage and member entitlements
- Flexible benefit configuration system

### Fitness Assessment Tracking
- Record comprehensive physical fitness evaluations of members
- Track member progress over time with historical assessments
- Support various assessment types (body composition, strength, cardio)
- Generate fitness progress reports and recommendations

## Service Configuration

- **Default Port**: 8004 (configurable via `MEMBER_SERVICE_PORT`)
- **Database Port**: 5436 (configurable via `MEMBER_SERVICE_DB_PORT`)
- **Database**: `fitness_member_db` (configurable via `MEMBER_SERVICE_DB_NAME`)
- **Base URL**: `http://localhost:8004/api/v1`
- **Health Check**: `http://localhost:8004/health`

### Environment Variables

```bash
MEMBER_SERVICE_PORT=8004
MEMBER_SERVICE_DB_PORT=5436
MEMBER_SERVICE_DB_NAME=fitness_member_db
DB_HOST=localhost
DB_USER=fitness_user
DB_PASSWORD=admin
DB_SSLMODE=disable
```

## Technical Stack

- **Language**: Go (v1.20+)
- **Framework**: Gin Web Framework v1.9+
- **Database**: PostgreSQL 14+
- **ORM**: GORM v1.25+ (Object Relational Mapping)
- **Configuration**: Environment-based with `.env` support
- **Logging**: Structured logging with request/response middleware
- **CORS**: Cross-origin resource sharing enabled
- **Containerization**: Docker and Docker Compose

## Architecture

The service follows a clean architecture pattern:

```
cmd/main.go                 # Application entry point
├── internal/
│   ├── config/            # Configuration management
│   ├── handler/           # HTTP handlers (controllers)
│   ├── model/             # Data models and interfaces
│   ├── repository/        # Data access layer
│   ├── server/            # HTTP server and routing
│   └── service/           # Business logic layer
├── migrations/            # Database migration files
└── pkg/dto/               # Data transfer objects
```

## Getting Started

1. **Prerequisites**
   - Go 1.20 or higher
   - PostgreSQL 14 or higher
   - Docker (optional)
   - Git

2. **Environment Setup**
   ```bash
   # Clone the repository (if needed)
   cd backend/member-service
   
   # Copy environment file
   cp .env.example .env
   
   # Update database configuration in .env
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb fitness_member_db
   
   # The service will auto-migrate tables on startup
   ```

4. **Run the Service**
   ```bash
   # Using the run script (recommended)
   ./run.sh
   
   # Or manually
   go run cmd/main.go
   
   # Or build and run
   go build -o member-service cmd/main.go
   ./member-service
   ```

5. **Verify Installation**
   ```bash
   # Check health endpoint
   curl http://localhost:8004/health
   
   # Check API endpoints
   curl http://localhost:8004/api/v1/members
   ```

6. **Test Endpoints**
   ```bash
   # Run comprehensive endpoint tests
   ./test_endpoints.sh
   ```

For detailed API documentation, see [API.md](API.md).  
For database schema details, see [DATABASE.md](DATABASE.md).
- **Handler Layer**: HTTP request/response handling

### Recent Updates

**GORM Integration (June 2025):**
- Migrated from raw SQL to GORM ORM for improved type safety
- Implemented repository pattern with interfaces defined in model packages
- Enhanced error handling and database transaction management
- Follows the same architectural pattern as class-service for consistency
