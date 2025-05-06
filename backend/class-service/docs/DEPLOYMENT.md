# Class Service Deployment Guide

This document outlines the steps to deploy the Class Service to various environments.

## Prerequisites

- Docker and Docker Compose installed
- Access to a PostgreSQL database (or Docker to run a containerized version)
- Go 1.20 or later (for local development)

## Environment Variables

The Class Service uses the following environment variables:

| Variable                     | Description                                | Default Value        |
|------------------------------|--------------------------------------------|----------------------|
| CLASS_SERVICE_PORT           | Port on which the service will listen      | 8005                 |
| CLASS_SERVICE_DB_PORT        | Port for the PostgreSQL database (host)    | 5436                 |
| CLASS_SERVICE_DB_NAME        | Name of the database                       | fitness_class_db     |
| CLASS_SERVICE_CONTAINER_NAME | Name of the container for the database     | fitness-class-db     |
| CLASS_SERVICE_HOST           | Host the service will bind to              | 0.0.0.0              |
| DB_HOST                      | Database hostname                          | localhost (or postgres in Docker) |
| DB_PORT                      | Database port (inside Docker network)      | 5432                 |
| DB_USER                      | Database username                          | fitness_user         |
| DB_PASSWORD                  | Database password                          | admin                |
| DB_SSLMODE                   | SSL mode for database connection           | disable              |
| DOCKER_NETWORK_NAME          | Docker network to use                      | fitness-network      |

## Environment Files

The service uses two environment files:

1. `.env` - Default environment variables for local development
2. `.env.docker` - Docker-specific environment variables (automatically created when needed)

## Deployment with Docker Compose

The easiest way to deploy the Class Service is using the provided run script:

```bash
cd /path/to/fitness-center/backend/class-service
./run.sh
```

This script provides several options:

```
Usage: ./run.sh [options]

Options:
  -s, --sample-data OPTION  Specify sample data option: reset (load fresh data), none (no sample data), keep (keep existing, default)
  -l, --local               Run service locally instead of in Docker
  -h, --help                Show this help message

Examples:
  ./run.sh                  Run with default settings (keep data, use Docker)
  ./run.sh -s reset         Reset and load sample data
  ./run.sh -s none          Start with clean database without sample data
  ./run.sh -l               Run service locally (database still in Docker)
```

### Using Docker Directly

If you prefer to use Docker Compose directly:

1. Create a `.env` file in the root directory of the project with the necessary environment variables.

2. Build and start the containers:

```bash
cd /path/to/fitness-center/backend/class-service
docker-compose up -d
```

3. Verify that the containers are running:

```bash
docker-compose ps
```

4. To stop the service:

```bash
docker-compose down
```

## Manual Deployment

If you prefer to run the service without Docker, follow these steps:

1. Set up a PostgreSQL database and create the necessary tables using the migration files in the `/migrations` directory.

2. Build the service:

```bash
cd /path/to/fitness-center/backend/class-service
go build -o class-service ./cmd/main.go
```

3. Set the environment variables and run the service:

```bash
export CLASS_SERVICE_PORT=8005
export DB_HOST=localhost
export CLASS_SERVICE_DB_PORT=5436
export DB_USER=fitness_user
export DB_PASSWORD=admin
export CLASS_SERVICE_DB_NAME=fitness_class_db
export DB_SSLMODE=disable

./class-service
```

Alternatively, use the run script with the `-l` flag:

```bash
./run.sh -l
```

## Database Migrations

The service includes database migration files in the `/migrations` directory. These are automatically applied when using the `run.sh` script with appropriate options.

For manual migrations, you can use the built-in `docker-compose` commands:

```bash
# Apply migrations
docker exec -i fitness-class-db psql -U fitness_user -d fitness_class_db < ./migrations/000001_create_tables.up.sql
```

## Health Check

Once the service is running, you can verify it's working by accessing the health check endpoint:

```bash
curl http://localhost:8005/health
```

You should receive a response like:

```json
{
  "status": "up",
  "service": "class-service",
  "time": "2023-07-15T12:00:00Z"
}
```

## API Documentation

For details on the available API endpoints, refer to the [API documentation](API.md).
