# Payment Service Deployment Guide

This document outlines the steps to deploy the Payment Service to various environments.

## Prerequisites

- Docker and Docker Compose installed
- Access to a PostgreSQL database (or Docker to run a containerized version)
- Go 1.20 or later (for local development)

## Environment Variables

The Payment Service uses the following environment variables:

| Variable                     | Description                                | Default Value        |
|------------------------------|--------------------------------------------|----------------------|
| PAYMENT_SERVICE_PORT         | Port on which the service will listen      | 8003                 |
| PAYMENT_SERVICE_DB_PORT      | Port for the PostgreSQL database           | 5434                 |
| PAYMENT_SERVICE_DB_NAME      | Name of the database                       | fitness_payment_db   |
| PAYMENT_SERVICE_CONTAINER_NAME| Name of the container for the database     | fitness-payment-db   |
| DB_HOST                      | Database hostname                          | localhost            |
| DB_USER                      | Database username                          | fitness_user         |
| DB_PASSWORD                  | Database password                          | admin                |
| DB_SSLMODE                   | SSL mode for database connection           | disable              |
| DOCKER_NETWORK_NAME          | Docker network to use                      | fitness-network      |

## Deployment with Docker Compose

The easiest way to deploy the Payment Service is using Docker Compose.

1. Create a `.env` file in the root directory of the project with the necessary environment variables or use the default values.

2. Build and start the containers:

```bash
cd /path/to/fitness-center/backend/payment-service
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
cd /path/to/fitness-center/backend/payment-service
go build -o payment-service ./cmd/main.go
```

3. Set the environment variables and run the service:

```bash
export PAYMENT_SERVICE_PORT=8003
export DB_HOST=localhost
export DB_PORT=5434
export DB_USER=fitness_user
export DB_PASSWORD=admin
export PAYMENT_SERVICE_DB_NAME=fitness_payment_db
export DB_SSLMODE=disable

./payment-service
```

## Database Migrations

The service includes database migration files in the `/migrations` directory. These are automatically applied when using Docker Compose, but for a manual deployment, you need to apply them yourself:

```bash
# Connect to the database and execute migration files
./scripts/db-connect.sh -f ./migrations/000001_create_payments_table.up.sql
./scripts/db-connect.sh -f ./migrations/000002_create_payment_types_table.up.sql
./scripts/db-connect.sh -f ./migrations/000003_create_payment_transactions_table.up.sql
```

Or you can use the included setup script:

```bash
USE_DOCKER=true LOAD_SAMPLE_DATA=true ./scripts/setup-db.sh
```

## Database Reset

To reset the database and reload the schema:

```bash
# Reset the Docker database container
./scripts/docker-db.sh reset

# Wait for the database to initialize, then run the setup script
USE_DOCKER=true ./scripts/setup-db.sh
```

## Health Check

Once the service is running, you can verify it's working by accessing the health check endpoint:

```bash
curl http://localhost:8003/health
```

You should receive a response like:

```json
{
  "status": "up",
  "service": "payment-service",
  "time": "2023-07-15T12:00:00Z"
}
```

## API Documentation

For details on the available API endpoints, refer to the [API documentation](API.md).

## Troubleshooting

### Database Connection Issues

If the service cannot connect to the database:

1. Verify that the database container is running:
   ```bash
   ./scripts/docker-db.sh status
   ```

2. Check the database logs:
   ```bash
   ./scripts/docker-db.sh logs
   ```

3. Try restarting the database:
   ```bash
   ./scripts/docker-db.sh restart
   ```

4. Run database diagnostics:
   ```bash
   ./scripts/docker-db.sh debug
   ```

### Service Issues

If the service is not starting or responding correctly:

1. Check the service logs for error messages.

2. Verify that the correct environment variables are set.

3. Ensure that the database schema is correctly applied:
   ```bash
   ./scripts/verify_db.sh
   ```

4. Rebuild and restart the service:
   ```bash
   go build -o payment-service ./cmd/main.go
   ./payment-service
   ```
