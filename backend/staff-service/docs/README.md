# Staff Service Documentation

The Staff Service is responsible for managing staff members, trainers, and personal training sessions within the Fitness Center application. This service provides APIs for managing staff information, trainer specializations, and scheduling personal training.

## Table of Contents

- [Overview](#overview)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)

## Overview

The Staff Service handles three main entities:

1. **Staff** - Employees of the fitness center (personal details, position, salary)
2. **Trainers** - Staff members who are certified trainers (specializations, certifications)
3. **Personal Training** - Sessions scheduled between trainers and members

### Key Features

- Manage staff information and employment details
- Track trainer qualifications and specializations
- Schedule and track personal training sessions
- Monitor trainer performance through session feedback

### Service Dependencies

The Staff Service interacts with:

- **Member Service** - To verify member information for personal training
- **Class Service** - To check trainer availability for class schedules
- **Notification Service** - To send session reminders to trainers and members

### Technical Stack

- **Language**: Go
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **Containerization**: Docker
