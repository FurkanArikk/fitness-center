# Member Service Deployment Guide

This document outlines the steps to deploy the Member Service to various environments.

## Prerequisites

- Docker and Docker Compose installed
- Access to a PostgreSQL database (or Docker to run a containerized version)
- Go 1.20 or later (for local development)

## Environment Variables

The Member Service uses the following environment variables:

| Variable                     | Description                                | Default Value        |
|------------------------------|--------------------------------------------|----------------------|
| MEMBER_SERVICE_PORT          | Port on which the service will listen      | 8001                 |
| MEMBER_SERVICE_DB_PORT       | Port for the PostgreSQL database           | 5432                 |
| MEMBER_SERVICE_DB_NAME       | Name of the database                       | fitness_member_db    |
| MEMBER_SERVICE_CONTAINER_NAME| Name of the container for the database     | fitness-member-db    |
| DB_HOST                      | Database hostname                          | localhost            |
| DB_USER                      | Database username                          | fitness_user         |
| DB_PASSWORD                  | Database password                          | admin                |
| DB_SSLMODE                   | SSL mode for database connection           | disable              |
| DOCKER_NETWORK_NAME          | Docker network to use                      | fitness-network      |

## Deployment with Docker Compose

The easiest way to deploy the Member Service is using Docker Compose.

1. Create a `.env` file in the root directory of the project with the necessary environment variables or use the default values.

2. Build and start the containers:

```bash
cd /path/to/fitness-center/backend/member-service
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
cd /path/to/fitness-center/backend/member-service
go build -o member-service ./cmd/main.go
```

3. Set the environment variables and run the service:

```bash
export MEMBER_SERVICE_PORT=8001
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=fitness_user
export DB_PASSWORD=admin
export MEMBER_SERVICE_DB_NAME=fitness_member_db
export DB_SSLMODE=disable

./member-service
```

## Database Migrations

The service includes database migration files in the `/migrations` directory. These are automatically applied when using Docker Compose, but for a manual deployment, you can use a tool like `migrate`:

```bash
# Install migrate
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations
migrate -path ./migrations -database "postgres://fitness_user:admin@localhost:5432/fitness_member_db?sslmode=disable" up
```

## Health Check

Once the service is running, you can verify it's working by accessing the health check endpoint:

```bash
curl http://localhost:8001/health
```

You should receive a response like:

```json
{
  "status": "up",
  "service": "member-service",
  "time": "2023-07-15T12:00:00Z"
}
```

## API Documentation

For details on the available API endpoints, refer to the [API documentation](API.md).
