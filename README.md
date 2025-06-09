# Fitness Center Management System

A comprehensive fitness center management system built with microservices architecture using Go for backend services and Next.js for the frontend.

## Overview

This system provides a complete solution for managing fitness centers, including member management, class scheduling, facility bookings, payment processing, and staff management.

## Architecture

The system follows a microservices architecture with the following services:

- **Auth Service**: Authentication and authorization
- **Member Service**: Member management and profiles
- **Class Service**: Fitness class scheduling and bookings
- **Facility Service**: Facility and equipment management
- **Payment Service**: Payment processing and billing
- **Staff Service**: Staff management and scheduling

## Technology Stack

### Backend
- **Language**: Go (Golang)
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **API**: RESTful APIs

### Frontend
- **Framework**: Next.js
- **Language**: JavaScript/TypeScript
- **Styling**: Tailwind CSS (assumed)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for frontend development)
- Go 1.23+ (for backend development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fitness-center
```

2. Start the backend services:
```bash
cd backend
chmod +x install.sh
./install.sh
```

3. Start the frontend:
```bash
cd frontend
npm install
npm run dev
```

### Running Individual Services

Each service can be run independently using Docker Compose:

```bash
# Auth Service
cd backend/auth-service
docker-compose up

# Class Service
cd backend/class-service
docker-compose up

# And so on for other services...
```

## API Documentation

Each service has its own API documentation located in the `docs/API.md` file within each service directory:

- [Auth Service API](backend/auth-service/docs/API.md)
- [Class Service API](backend/class-service/docs/API.md)
- [Facility Service API](backend/facility-service/docs/API.md)
- [Member Service API](backend/member-service/docs/API.md)
- [Payment Service API](backend/payment-service/docs/API.md)
- [Staff Service API](backend/staff-service/docs/API.md)

## Database

Each service has its own database with migration files located in the `migrations/` directory. Database documentation can be found in `docs/DATABASE.md` for each service.

## Testing

Test endpoints are available for each service:

```bash
# Test auth service
cd backend/auth-service
./test-auth.sh

# Test other services
cd backend/class-service
./test_endpoints.sh
```

## Project Structure

```
fitness-center-1/
├── backend/           # Backend microservices
│   ├── auth-service/     # Authentication service
│   ├── class-service/    # Class management service
│   ├── facility-service/ # Facility management service
│   ├── member-service/   # Member management service
│   ├── payment-service/  # Payment processing service
│   └── staff-service/    # Staff management service
└── frontend/          # Next.js frontend application
```

## Features

- **Member Management**: Registration, profiles, membership plans
- **Class Scheduling**: Fitness class creation and booking system
- **Facility Management**: Equipment and facility booking
- **Payment Processing**: Membership fees and payment tracking
- **Staff Management**: Staff scheduling and role management
- **Authentication**: Secure login and authorization system

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.
