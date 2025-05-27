# Auth Service Deployment Guide

This document outlines the steps to deploy the Auth Service to various environments.

## Prerequisites

- Docker and Docker Compose installed
- Access to a PostgreSQL database (or Docker to run a containerized version)
- Go 1.20 or later (for local development)

## Environment Variables

The Auth Service uses the following environment variables:

| Variable                     | Description                                | Default Value        |
|------------------------------|--------------------------------------------|----------------------|
| AUTH_SERVICE_PORT            | Port on which the service will listen      | 8006                 |
| AUTH_SERVICE_DB_PORT         | Port for the PostgreSQL database (host)    | 5437                 |
| AUTH_SERVICE_DB_NAME         | Name of the database                       | fitness_auth_db      |
| AUTH_SERVICE_CONTAINER_NAME  | Name of the container for the database     | fitness-auth-db      |
| AUTH_SERVICE_HOST            | Host the service will bind to              | 0.0.0.0              |
| AUTH_SERVICE_READ_TIMEOUT    | Read timeout for HTTP server               | 15s                  |
| AUTH_SERVICE_WRITE_TIMEOUT   | Write timeout for HTTP server              | 15s                  |
| AUTH_SERVICE_IDLE_TIMEOUT    | Idle timeout for HTTP server               | 60s                  |
| DB_HOST                      | Database hostname                          | localhost            |
| DB_PORT                      | Database port (inside Docker network)      | 5432                 |
| DB_USER                      | Database username                          | fitness_user         |
| DB_PASSWORD                  | Database password                          | admin                |
| DB_SSLMODE                   | SSL mode for database connection           | disable              |
| DOCKER_NETWORK_NAME          | Docker network to use                      | fitness-network      |
| JWT_SECRET                   | Secret key for JWT token generation        | (required)           |
| JWT_EXPIRATION               | JWT token expiration time                  | 24h                  |
| MAX_ADMIN_COUNT              | Maximum number of admin users allowed      | 3                    |
| LOG_LEVEL                    | Logging level                              | debug                |

## Environment Files

The service uses two environment files:

1. `.env` - Default environment variables for local development
2. `.env.example` - Example environment variables for reference

## Deployment with Docker Compose

The easiest way to deploy the Auth Service is using Docker Compose:

```bash
cd /path/to/fitness-center/backend/auth-service
docker-compose up -d
```

### Using run.sh Script

If available, you can use the run script:

```bash
./run.sh
```

## Manual Deployment

If you prefer to run the service without Docker:

1. Set up a PostgreSQL database and apply migrations from the `/migrations` directory.

2. Build the service:

```bash
cd /path/to/fitness-center/backend/auth-service
go build -o auth-service ./cmd/main.go
```

3. Set environment variables and run:

```bash
export AUTH_SERVICE_PORT=8006
export DB_HOST=localhost
export AUTH_SERVICE_DB_PORT=5437
export DB_USER=fitness_user
export DB_PASSWORD=admin
export AUTH_SERVICE_DB_NAME=fitness_auth_db
export DB_SSLMODE=disable
export JWT_SECRET=your_secret_key_here
export JWT_EXPIRATION=24h
export MAX_ADMIN_COUNT=3

./auth-service
```

## Database Migrations

The service includes database migration files in the `/migrations` directory. These are automatically applied when using Docker Compose.

## Admin User Configuration

The service supports a maximum of 3 admin users by default. This can be configured using the `MAX_ADMIN_COUNT` environment variable.

Default admin users are created during the initial migration if they don't already exist:
- Username: `admin` (Email: admin@fitness-center.com)
- Username: `superadmin` (Email: superadmin@fitness-center.com)

## Health Check

Once the service is running, verify it's working:

```bash
curl http://localhost:8006/health
```

Expected response:

```json
{
  "status": "up",
  "service": "auth-service",
  "time": "2023-07-15T12:00:00Z"
}
```

## API Documentation

For details on authentication endpoints and usage, refer to the API documentation in the project.
