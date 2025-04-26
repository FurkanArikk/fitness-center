# Facility Service Documentation

The Facility Service is responsible for managing facilities, equipment, and attendance within the Fitness Center application. This service provides APIs for tracking facility usage, managing equipment, and monitoring member attendance.

## Table of Contents

- [Overview](#overview)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)

## Overview

The Facility Service handles three main entities:

1. **Facilities** - Physical spaces in the fitness center (gyms, studios, pools)
2. **Equipment** - Fitness equipment available in the facilities
3. **Attendance** - Records of member visits and facility usage

### Key Features

- Manage facilities and their operational details
- Track equipment inventory, maintenance schedules, and status
- Record and query member attendance data
- Generate facility usage reports and analytics

### Service Dependencies

The Facility Service interacts with:

- **Member Service** - To verify member information for attendance records
- **Class Service** - For facility booking and scheduling
- **Maintenance Service** - For equipment maintenance scheduling

### Technical Stack

- **Language**: Go
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **Containerization**: Docker
