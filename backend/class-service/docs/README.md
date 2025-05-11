# Class Service Documentation

The Class Service is responsible for managing fitness classes, schedules, and bookings within the Fitness Center application. This service provides APIs for creating and managing classes, scheduling classes, and handling member bookings.

## Table of Contents

- [Overview](#overview)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)

## Overview

The Class Service handles three main entities:

1. **Classes** - Different types of fitness classes offered (Yoga, HIIT, Pilates, etc.)
2. **Schedules** - When and where classes are scheduled (time, day, room, trainer)
3. **Bookings** - Member registrations for specific class sessions

### Key Features

- Create, update, and delete fitness classes
- Schedule classes at specific times/days with assigned trainers
- Allow members to book classes
- Track attendance for class sessions
- Collect and store feedback for attended classes
- Provide reporting on class popularity and attendance rates

### Service Dependencies

The Class Service interacts with:

- **Member Service** - To verify member information
- **Staff Service** - To verify trainer information
- **Facility Service** - To verify room availability

### Technical Stack

- **Language**: Go
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **Containerization**: Docker

## Quick Start

The Class Service can be run using the included `run.sh` script:

```bash
# Run with default settings (keep data, use Docker)
./run.sh

# Reset and load sample data
./run.sh -s reset

# Start with clean database without sample data
./run.sh -s none

# Run service locally (database still in Docker)
./run.sh -l
```

For more details on deployment options, check the [Deployment Guide](DEPLOYMENT.md).
