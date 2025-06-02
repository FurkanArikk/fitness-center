# Facility Service Documentation

The Facility Service is responsible for managing facilities, equipment, and attendance within the Fitness Center application. This service provides comprehensive APIs for tracking facility usage, managing equipment inventory, and monitoring member attendance patterns.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Testing](#testing)
- [Service Configuration](#service-configuration)

## Overview

The Facility Service handles three main entities:

1. **Facilities** - Physical spaces in the fitness center (gyms, studios, pools, courts)
2. **Equipment** - Fitness equipment available in the facilities with maintenance tracking
3. **Attendance** - Records of member visits and facility usage with detailed analytics

### Key Features

- **Facility Management**: Create, update, and manage facility information with status tracking
- **Equipment Inventory**: Track equipment with maintenance schedules, purchase information, and status monitoring
- **Attendance Tracking**: Record member check-ins/check-outs with comprehensive querying capabilities
- **Status Management**: Monitor facility and equipment status (active, maintenance, out-of-order)
- **Reporting**: Generate facility usage reports and analytics
- **Comprehensive API**: 24 REST endpoints covering all CRUD operations

### API Endpoints Summary

- **Health Check**: 1 endpoint
- **Facilities**: 8 endpoints (CRUD + status filtering)
- **Equipment**: 8 endpoints (CRUD + category/status/maintenance filtering)
- **Attendance**: 7 endpoints (CRUD + member/facility/date filtering + checkout)

### Service Dependencies

The Facility Service interacts with:

- **Member Service** - References member IDs for attendance records
- **Class Service** - Provides facility availability for class scheduling
- **PostgreSQL Database** - Primary data storage with foreign key constraints

### Technical Stack

- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL 15+
- **Containerization**: Docker & Docker Compose
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
