# Facility Service Deployment Guide

This document outlines the steps to deploy the Facility Service to various environments.

## Prerequisites

- Docker and Docker Compose installed
- Access to a PostgreSQL database (or Docker to run a containerized version)
- Go 1.20 or later (for local development)

## Environment Variables

The Facility Service uses the following environment variables:

| Variable                      | Description                                | Default Value         |
|-------------------------------|--------------------------------------------|---------------------- |
| FACILITY_SERVICE_PORT         | Port on which the service will listen      | 8004                  |
| FACILITY_SERVICE_DB_PORT      | Port for the PostgreSQL database           | 5435                  |
| FACILITY_SERVICE_DB_NAME      | Name of the database                       | fitness_facility_db   |
| FACILITY_SERVICE_HOST         | Host to bind the service                   | 0.0.0.0               |
| FACILITY_SERVICE_CONTAINER_NAME| Name of the container for the database    | fitness-facility-db   |
| FACILITY_SERVICE_READ_TIMEOUT | Read timeout for HTTP server               | 15s                   |
| FACILITY_SERVICE_WRITE_TIMEOUT| Write timeout for HTTP server              | 15s                   |
| FACILITY_SERVICE_IDLE_TIMEOUT | Idle timeout for HTTP server               | 60s                   |
| DB_HOST                       | Database hostname                          | localhost             |
| DB_USER                       | Database username                          | fitness_user          |
| DB_PASSWORD                   | Database password                          | admin                 |
| DB_SSLMODE                    | SSL mode for database connection           | disable               |
| DOCKER_NETWORK_NAME           | Docker network to use                      | fitness-network       |

## Deployment with Docker Compose

The easiest way to deploy the Facility Service is using Docker Compose.

1. Create a `.env` file in the root directory of the project with the necessary environment variables or use the default values.

2. Build and start the containers:

```bash
cd /path/to/fitness-center/backend/facility-service
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

## Docker Configuration Details

The Facility Service uses a multi-stage build process in its Dockerfile:

1. **Builder Stage**: Compiles the Go application
2. **Final Stage**: Creates a minimal Alpine-based container with only the necessary components

### Important Docker Configuration Notes

- The service automatically creates the `/app/configs` directory in the container
- Configuration files are properly handled with a safe approach that avoids shell redirection issues
- Any custom configuration files should be placed in the `configs` directory in your project
- The container uses a non-root user (appuser) for better security

### Using Custom Configuration

To use custom configuration files:

1. Add your configuration files to the `configs` directory in your project
2. When the container starts, these files will be copied to the container's `/app/configs` directory
3. The application is designed to look for configuration files in this location

## Manual Deployment

If you prefer to run the service without Docker, follow these steps:

1. Set up a PostgreSQL database and create the necessary tables using the migration files in the `/migrations` directory.

2. Build the service:

```bash
cd /path/to/fitness-center/backend/facility-service
go build -o facility-service ./cmd/main.go
```

3. Set the environment variables and run the service:

```bash
export FACILITY_SERVICE_PORT=8080
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=fitness_user
export DB_PASSWORD=admin
export FACILITY_SERVICE_DB_NAME=fitness_facility_db
export DB_SSLMODE=disable

./facility-service
```

## Database Migrations

The service includes database migration files in the `/migrations` directory. These are automatically applied when using Docker Compose, but for a manual deployment, you can use a tool like `migrate`:

```bash
# Install migrate
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations
migrate -path ./migrations -database "postgres://fitness_user:admin@localhost:5432/fitness_facility_db?sslmode=disable" up
```

## Running the Service with run.sh

The service includes a convenience script `run.sh` that makes it easy to start the service:

```bash
# Run with default settings (Docker mode)
./run.sh

# Run locally (database still in Docker)
./run.sh -l
```

## Troubleshooting Docker Issues

If you encounter issues with the Docker build:

1. **Configs Directory Handling**: The Dockerfile handles the configs directory with a proper approach. If you need to modify this, edit the Dockerfile's line:
   ```dockerfile
   RUN if [ -d /app/builder/configs ]; then cp -r /app/builder/configs/* /app/configs/ 2>/dev/null; fi || :
   ```

2. **Container Logs**: Check container logs for details about any failures:
   ```bash
   docker-compose logs facility-service
   ```

3. **Database Connection**: Ensure the PostgreSQL container is running and healthy:
   ```bash
   docker-compose logs postgres
   ```

## Health Check

Once the service is running, you can verify it's working by accessing the health check endpoint:

```bash
curl http://localhost:8004/health
```

You should receive a response like:

```json
{
  "status": "up",
  "service": "facility-service",
  "time": "2023-07-15T12:00:00Z"
}
```

## API Documentation

For details on the available API endpoints, refer to the [API documentation](API.md).
