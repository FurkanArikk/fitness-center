# Member Service Documentation

The Member Service is responsible for managing members, memberships, membership benefits, and fitness assessments within the Fitness Center application. This service provides APIs for managing member data, tracking memberships, and recording fitness assessments.

## Table of Contents

- [Overview](#overview)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)

## Overview

The Member Service handles four main entities:

1. **Members** - People who use the fitness center (personal details, contact information)
2. **Memberships** - Types of memberships offered (pricing, duration, features)
3. **Benefits** - Specific features included in each membership type
4. **Assessments** - Physical fitness evaluations of members

### Key Features

- Register new members and manage member information
- Create and manage membership plans
- Track member-membership relationships and payment status
- Record fitness assessments and track progress
- Manage membership benefits

### Service Dependencies

The Member Service interacts with:

- **Staff Service** - To verify trainer information for assessments
- **Class Service** - For class booking information
- **Notification Service** - To send membership renewal notifications

### Technical Stack

- **Language**: Go
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **ORM**: GORM (Object Relational Mapping)
- **Containerization**: Docker

### Architecture

The service follows a clean architecture pattern with:

- **Model Layer**: Domain entities with embedded repository interfaces
- **Repository Layer**: GORM-based data access implementations
- **Service Layer**: Business logic and validation
- **Handler Layer**: HTTP request/response handling

### Recent Updates

**GORM Integration (June 2025):**
- Migrated from raw SQL to GORM ORM for improved type safety
- Implemented repository pattern with interfaces defined in model packages
- Enhanced error handling and database transaction management
- Follows the same architectural pattern as class-service for consistency
