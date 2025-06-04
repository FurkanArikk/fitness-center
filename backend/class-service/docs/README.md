# Class Service Documentation

The Class Service is responsible for managing fitness classes, schedules, and bookings within the Fitness Center application. This service provides RESTful APIs for creating and managing classes, scheduling sessions, and handling member bookings.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Service Configuration](#service-configuration)
- [Technical Stack](#technical-stack)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Getting Started](#getting-started)

## Overview

The Class Service handles three main entities:

1. **Classes** - Different types of fitness classes offered (Yoga, HIIT, Pilates, etc.)
2. **Schedules** - When and where classes are scheduled (time, day, room, trainer)
3. **Bookings** - Member registrations for specific class sessions

## Features

### Class Management
- Create, update, and manage fitness class types
- Track class details including description, duration, and difficulty level
- Support for various class categories and specializations
- Comprehensive class information with capacity management

### Schedule Management
- Schedule classes at specific times and days with assigned trainers
- Manage room assignments and facility allocations
- Track recurring class schedules and one-time sessions
- Handle schedule conflicts and availability checking

### Booking System
- Allow members to book and cancel class reservations
- Track attendance for class sessions
- Manage waitlists for fully booked classes
- Support for advance booking and same-day reservations

### Feedback and Analytics
- Collect and store member feedback for attended classes
- Provide reporting on class popularity and attendance rates
- Track trainer performance and class success metrics
- Generate insights for class scheduling optimization

## Service Configuration

- **Default Port**: 8001 (configurable via `CLASS_SERVICE_PORT`)
- **Database Port**: 5432 (configurable via `CLASS_SERVICE_DB_PORT`)
- **Database**: `fitness_class_db` (configurable via `CLASS_SERVICE_DB_NAME`)
- **Base URL**: `http://localhost:8001/api/v1`
- **Health Check**: `http://localhost:8001/health`

### Environment Variables

```bash
CLASS_SERVICE_PORT=8001
CLASS_SERVICE_DB_PORT=5432
CLASS_SERVICE_DB_NAME=fitness_class_db
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
- **Configuration**: YAML-based configuration with environment override
- **Logging**: Structured logging with request/response middleware
- **CORS**: Cross-origin resource sharing enabled
- **Containerization**: Docker and Docker Compose

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
   cd backend/class-service
   
   # Copy configuration file
   cp configs/config.yaml.example configs/config.yaml
   
   # Update database configuration in config.yaml
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb fitness_class_db
   
   # Run migrations
   migrate -path migrations -database "postgres://fitness_user:admin@localhost/fitness_class_db?sslmode=disable" up
   ```

4. **Run the Service**
   ```bash
   # Using the run script (recommended)
   ./run.sh
   
   # Or manually
   go run cmd/main.go
   
   # Or build and run
   go build -o class-service cmd/main.go
   ./class-service
   ```

5. **Verify Installation**
   ```bash
   # Check health endpoint
   curl http://localhost:8001/health
   
   # Check API endpoints
   curl http://localhost:8001/api/v1/classes
   ```

6. **Load Sample Data**
   ```bash
   # Reset and load sample data
   ./run.sh --reset --sample-data
   ```

For detailed API documentation, see [API.md](API.md).  
For database schema details, see [DATABASE.md](DATABASE.md).
./run.sh -s reset

# Start with clean database without sample data
./run.sh -s none

# Run service locally (database still in Docker)
./run.sh -l
```
