# Staff Service Documentation

The Staff Service is responsible for managing staff members, trainers, qualifications, and personal training sessions within the Fitness Center application. This service provides RESTful APIs for managing all staff-related operations and training scheduling.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Service Dependencies](#service-dependencies)
- [Technical Stack](#technical-stack)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Endpoints Reference](endpoints.txt)

## Overview

The Staff Service handles four main entities:

1. **Staff** - Employees of the fitness center (personal details, position, salary)
2. **Trainers** - Staff members who are certified trainers (specializations, certifications)
3. **Qualifications** - Certifications and qualifications held by staff members
4. **Personal Training** - Sessions scheduled between trainers and members

## Features

- **Staff Management**
  - Create, update, and manage staff records
  - Track employment status, position, and compensation
  - Manage reporting structure and departmental organization

- **Trainer Profiles**
  - Maintain trainer certifications and specializations
  - Track trainer experience and client ratings
  - Manage trainer availability for sessions

- **Qualification Tracking**
  - Record and update staff qualifications and certifications
  - Track qualification expiration dates
  - Ensure compliance with certification requirements

- **Personal Training Management**
  - Schedule and modify personal training sessions
  - Process training session completion and feedback
  - Generate reports on trainer utilization and performance

## Service Dependencies

The Staff Service interacts with:

- **Member Service** - To verify member information for personal training sessions
- **Class Service** - To check trainer availability against class schedules
- **Payment Service** - To process payments for personal training sessions
- **Notification Service** - To send session reminders to trainers and members

## Technical Stack

- **Language**: Go (v1.20+)
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **ORM**: GORM
- **Authentication**: JWT
- **Containerization**: Docker
- **API Documentation**: Swagger/OpenAPI

## Getting Started

Refer to the [Deployment Guide](DEPLOYMENT.md) for instructions on setting up and running the Staff Service.
