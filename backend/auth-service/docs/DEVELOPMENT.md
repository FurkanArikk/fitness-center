# Development Setup Guide

This guide will help you set up the auth-service for local development.

## Prerequisites

- Go 1.23 or later
- PostgreSQL 16 or later
- Docker and Docker Compose (for containerized development)
- Git

## Local Development Setup

### 1. Clone and Navigate to Project

```bash
cd /path/to/fitness-center/backend/auth-service
```

### 2. Install Dependencies

```bash
go mod download
```

### 3. Environment Configuration

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` file with your local configuration:

```env
# Server Configuration
AUTH_SERVICE_HOST=localhost
AUTH_SERVICE_PORT=8006

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_for_development
JWT_EXPIRATION_HOURS=24

# Fallback Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=fitness123

# Database Configuration
AUTH_SERVICE_DB_HOST=localhost
AUTH_SERVICE_DB_PORT=5437
AUTH_SERVICE_DB_NAME=fitness_auth_dev
AUTH_SERVICE_DB_USER=postgres
AUTH_SERVICE_DB_PASSWORD=postgres
AUTH_SERVICE_DB_SSLMODE=disable

# Other
API_GATEWAY_URL=http://localhost:8000
LOG_LEVEL=debug
```

### 4. Database Setup

#### Option A: Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create the database:
   ```bash
   createdb fitness_auth_dev
   ```
3. Run migrations:
   ```bash
   ./scripts/db.sh migrate
   ```

#### Option B: Using Docker for Database Only

1. Start only the database:
   ```bash
   docker-compose up -d auth-db
   ```
2. Run migrations:
   ```bash
   ./scripts/db.sh migrate
   ```

### 5. Run the Service

#### Option A: Run Locally

```bash
go run cmd/main.go
```

#### Option B: Run with Docker

```bash
./run.sh
```

## Development Workflow

### Running Tests

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests in verbose mode
go test -v ./...
```

### Code Formatting

```bash
# Format code
go fmt ./...

# Run linter (if installed)
golangci-lint run
```

### Database Management

```bash
# Check database status
./scripts/db.sh status

# Run migrations
./scripts/db.sh migrate

# Reset database (drop and recreate)
./scripts/db.sh reset

# Create backup
./scripts/db.sh backup

# Restore from backup
./scripts/db.sh restore backup_file.sql
```

### Service Management

```bash
# Deploy (build, start, migrate)
./scripts/deploy.sh deploy

# Check service health
./scripts/deploy.sh health

# View logs
./scripts/deploy.sh logs

# Follow logs
./scripts/deploy.sh logs -f

# Stop service
./scripts/deploy.sh stop

# Restart service
./scripts/deploy.sh restart
```

## API Testing

### Using curl

#### Login
```bash
curl -X POST http://localhost:8006/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "furkan",
    "password": "furkan123"
  }'
```

#### Validate Token
```bash
curl -X POST http://localhost:8006/validate-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your_jwt_token_here"
  }'
```

#### Get User Info
```bash
curl -X GET http://localhost:8006/user-info \
  -H "Authorization: Bearer your_jwt_token_here"
```

#### Health Check
```bash
curl -X GET http://localhost:8006/health
```

### Using Postman

Import the following collection:

```json
{
  "info": {
    "name": "Auth Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8006"
    }
  ],
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"furkan\",\n  \"password\": \"furkan123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/login",
          "host": ["{{baseUrl}}"],
          "path": ["login"]
        }
      }
    },
    {
      "name": "Validate Token",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"token\": \"{{authToken}}\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/validate-token",
          "host": ["{{baseUrl}}"],
          "path": ["validate-token"]
        }
      }
    },
    {
      "name": "Get User Info",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/user-info",
          "host": ["{{baseUrl}}"],
          "path": ["user-info"]
        }
      }
    },
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    }
  ]
}
```

## Debugging

### Common Issues

1. **Database Connection Errors**
   - Check if PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists: `./scripts/db.sh create`

2. **Migration Errors**
   - Check migration files in `migrations/` directory
   - Ensure database user has proper permissions
   - Try resetting database: `./scripts/db.sh reset`

3. **JWT Token Issues**
   - Verify JWT_SECRET in `.env`
   - Check token expiration time
   - Ensure proper token format in requests

4. **Port Conflicts**
   - Check if port 8006 is already in use
   - Modify AUTH_SERVICE_PORT in `.env` if needed

### Log Levels

Set LOG_LEVEL in `.env` for different verbosity:
- `debug`: Detailed debugging information
- `info`: General information (default)
- `warn`: Warning messages
- `error`: Error messages only

### Hot Reload Development

For faster development, you can use tools like `air` for hot reloading:

1. Install air:
   ```bash
   go install github.com/cosmtrek/air@latest
   ```

2. Create `.air.toml` configuration file:
   ```toml
   root = "."
   testdata_dir = "testdata"
   tmp_dir = "tmp"

   [build]
     cmd = "go build -o ./tmp/main ./cmd/main.go"
     bin = "tmp/main"
     full_bin = "./tmp/main"
     include_ext = ["go", "tpl", "tmpl", "html"]
     include_dir = ["cmd", "internal"]
     exclude_dir = ["tmp", "vendor", "migrations"]
     include_file = []
     exclude_file = []
     exclude_regex = ["_test.go"]
     exclude_unchanged = false
     follow_symlink = false
     log = "build-errors.log"
     delay = 1000
     stop_on_error = true

   [log]
     time = false

   [color]
     main = "magenta"
     watcher = "cyan"
     build = "yellow"
     runner = "green"

   [misc]
     clean_on_exit = false
   ```

3. Run with hot reload:
   ```bash
   air
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Run tests and ensure they pass
5. Format code with `go fmt`
6. Submit a pull request

## Useful Commands

```bash
# View service status
docker-compose ps

# View service logs
docker-compose logs -f auth-service

# View database logs
docker-compose logs -f auth-db

# Connect to database
docker-compose exec auth-db psql -U postgres -d fitness_auth

# Stop all services
docker-compose down

# Remove volumes (careful - this deletes data)
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Update dependencies
go mod tidy
```
