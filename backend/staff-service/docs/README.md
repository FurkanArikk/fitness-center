# Staff Service Documentation

The Staff Service is responsible for managing staff members, trainers, qualifications, and personal training sessions within the Fitness Center application. This service provides RESTful APIs for managing all staff-related operations and training scheduling.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Service Configuration](#service-configuration)
- [Technical Stack](#technical-stack)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Getting Started](#getting-started)

## Overview

The Staff Service handles four main entities:

1. **Staff** - Employees of the fitness center (personal details, position, salary, employment status)
2. **Trainers** - Staff members who are certified trainers (specializations, certifications, ratings)
3. **Qualifications** - Certifications and qualifications held by staff members (with expiry tracking)
4. **Personal Training Sessions** - Scheduled training sessions between trainers and members

## Features

### Staff Management
- Create, update, and manage staff records with full employee details
- Track employment status, position, hire dates, and compensation
- Support pagination and filtering by position and status
- Unique email validation and comprehensive staff profiles

### Trainer Profiles
- Maintain trainer certifications and specializations
- Track trainer experience levels and average ratings
- Link trainers to staff records for comprehensive profiles
- Filter trainers by specialization and retrieve top-rated trainers

### Qualification Tracking
- Record and update staff qualifications and certifications
- Track qualification issue dates and expiration dates
- Associate qualifications with issuing authorities
- Monitor expiring qualifications for compliance management

### Personal Training Management
- Schedule and modify personal training sessions with detailed timing
- Track session status (Scheduled, Completed, Cancelled)
- Store session notes and pricing information
- Link sessions to specific trainers and members

## Service Configuration

- **Default Port**: 8002 (configurable via `STAFF_SERVICE_PORT`)
- **Database Port**: 5433 (configurable via `STAFF_SERVICE_DB_PORT`)
- **Database**: `fitness_staff_db` (configurable via `STAFF_SERVICE_DB_NAME`)
- **Base URL**: `http://localhost:8002/api/v1`
- **Health Check**: `http://localhost:8002/health`

### Environment Variables

```bash
STAFF_SERVICE_PORT=8002
STAFF_SERVICE_DB_PORT=5433
STAFF_SERVICE_DB_NAME=fitness_staff_db
DB_HOST=localhost
DB_USER=fitness_user
DB_PASSWORD=admin
DB_SSLMODE=disable
```

## Technical Stack

- **Language**: Go (v1.20+)
- **Framework**: Gin Web Framework v1.9+
- **Database**: PostgreSQL 14+
- **ORM**: GORM v1.25+
- **Configuration**: Environment-based with `.env` support
- **Logging**: Structured logging with request/response middleware
- **CORS**: Cross-origin resource sharing enabled

## Architecture

The service follows a clean architecture pattern:

```
cmd/main.go                 # Application entry point
├── internal/
│   ├── config/            # Configuration management
│   ├── db/                # Database connection
│   ├── handler/           # HTTP handlers (controllers)
│   ├── model/             # Data models and interfaces
│   ├── repository/        # Data access layer
│   ├── server/            # HTTP server and routing
│   └── service/           # Business logic layer
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
   cd backend/staff-service
   
   # Copy environment file
   cp .env.example .env
   
   # Update database configuration in .env
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb fitness_staff_db
   
   # The service will auto-migrate tables on startup
   ```

4. **Run the Service**
   ```bash
   # From the staff-service directory
   go run cmd/main.go
   
   # Or build and run
   go build -o staff-service cmd/main.go
   ./staff-service
   ```

5. **Verify Installation**
   ```bash
   # Check health endpoint
   curl http://localhost:8002/health
   
   # Check API endpoints
   curl http://localhost:8002/api/v1/staff
   ```

For detailed API documentation, see [API.md](API.md).  
For database schema details, see [DATABASE.md](DATABASE.md).
