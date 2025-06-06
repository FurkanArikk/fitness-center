# Facility Service Documentation

The Facility Service is responsible for managing facilities, equipment, and attendance within the Fitness Center application. This service provides RESTful APIs for tracking facility usage, managing equipment inventory, and monitoring member attendance patterns.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Service Configuration](#service-configuration)
- [Technical Stack](#technical-stack)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Getting Started](#getting-started)

## Overview

The Facility Service handles three main entities:

1. **Facilities** - Physical spaces in the fitness center (gyms, studios, pools, courts)
2. **Equipment** - Fitness equipment available in the facilities with maintenance tracking
3. **Attendance** - Records of member visits and facility usage with detailed analytics

## Features

### Facility Management
- Create, update, and manage facility information with status tracking
- Monitor facility capacity and availability
- Track facility maintenance schedules and status updates
- Support for various facility types (gym, studio, pool, court, etc.)

### Equipment Inventory
- Track equipment with maintenance schedules and purchase information
- Monitor equipment status (active, maintenance, out-of-order)
- Manage equipment categories and specifications
- Record equipment purchase dates and warranty information

### Attendance Tracking
- Record member check-ins and check-outs with comprehensive querying
- Generate facility usage reports and analytics
- Track peak hours and usage patterns
- Support for member visit history and statistics

### Status Management
- Monitor facility and equipment operational status
- Schedule and track maintenance activities
- Generate reports for facility utilization and equipment health
- Alert system for maintenance requirements

## Service Configuration

- **Default Port**: 8003 (configurable via `FACILITY_SERVICE_PORT`)
- **Database Port**: 5435 (configurable via `FACILITY_SERVICE_DB_PORT`)
- **Database**: `fitness_facility_db` (configurable via `FACILITY_SERVICE_DB_NAME`)
- **Base URL**: `http://localhost:8003/api/v1`
- **Health Check**: `http://localhost:8003/health`

### Environment Variables

```bash
FACILITY_SERVICE_PORT=8003
FACILITY_SERVICE_DB_PORT=5435
FACILITY_SERVICE_DB_NAME=fitness_facility_db
DB_HOST=localhost
DB_USER=fitness_user
DB_PASSWORD=admin
DB_SSLMODE=disable
```

## Technical Stack

- **Language**: Go (v1.21+)
- **Framework**: Gin Web Framework v1.9+
- **Database**: PostgreSQL 15+
- **ORM**: GORM v1.25+
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
   - Go 1.21 or higher
   - PostgreSQL 15 or higher
   - Docker (optional)
   - Git

2. **Environment Setup**
   ```bash
   # Clone the repository (if needed)
   cd backend/facility-service
   
   # Copy environment file
   cp .env.example .env
   
   # Update database configuration in .env
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb fitness_facility_db
   
   # The service will auto-migrate tables on startup
   ```

4. **Run the Service**
   ```bash
   # Using the run script (recommended)
   ./run.sh
   
   # Or manually
   go run cmd/main.go
   
   # Or build and run
   go build -o facility-service cmd/main.go
   ./facility-service
   ```

5. **Verify Installation**
   ```bash
   # Check health endpoint
   curl http://localhost:8003/health
   
   # Check API endpoints
   curl http://localhost:8003/api/v1/facilities
   ```

6. **Test Endpoints**
   ```bash
   # Run comprehensive endpoint tests
   ./test_endpoints.sh
   ```

For detailed API documentation, see [API.md](API.md).  
For database schema details, see [DATABASE.md](DATABASE.md).
- **Port**: 8004
- **API Version**: v1

## Quick Start

### Running the Service

```bash
# Start the service with Docker Compose
cd backend/facility-service
docker-compose up -d

# Or run locally
go run cmd/main.go
```

### Health Check

```bash
curl http://localhost:8004/health
```

### Running Tests

```bash
# Run comprehensive endpoint tests
./test_endpoints.sh
```

## Service Configuration

- **Base URL**: `http://localhost:8004`
- **API Base**: `http://localhost:8004/api/v1`
- **Database**: PostgreSQL on port 5432
- **Health Endpoint**: `/health`
