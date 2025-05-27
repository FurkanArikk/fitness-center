# Auth Service

A microservice for user authentication and authorization in the Fitness Center application.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Start the service with database
./run.sh

# Or use docker-compose directly
docker-compose up -d
```

### Local Development

```bash
# Install dependencies
go mod download

# Set up environment
cp .env.example .env

# Start database (if using Docker for DB only)
docker-compose up -d auth-db

# Run migrations
./scripts/db.sh migrate

# Start the service
go run cmd/main.go
```

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Development Guide](docs/DEVELOPMENT.md) - Setup and development workflow
- [README](docs/README.md) - Detailed service documentation

## 🔧 Features

- **JWT Authentication**: Secure token-based authentication
- **Admin-Only System**: Maximum 3 admin users (environment + database)
- **Password Security**: bcrypt hashing
- **Session Management**: Token tracking and revocation
- **Database Integration**: PostgreSQL with migrations
- **Pre-configured Admin**: Default admin account from environment
- **Docker Support**: Full containerization
- **Health Checks**: Service monitoring endpoints
- **User Registration**: New user signup with validation
- **User Management**: Admin capabilities to manage users
- **Database Cleanup**: Scripts to remove sample data and reset database
- **User Statistics**: Endpoints to monitor user registration and activity

## 🏗️ Architecture

```
auth-service/
├── cmd/                    # Application entry point
├── internal/
│   ├── config/            # Configuration management
│   ├── handler/           # HTTP request handlers
│   ├── service/           # Business logic
│   ├── repository/        # Data access layer
│   ├── model/             # Data models
│   ├── db/                # Database connection
│   └── server/            # HTTP server setup
├── migrations/            # Database migrations
├── docs/                  # Documentation
├── scripts/               # Management scripts
└── docker-compose.yml     # Container orchestration
```

## 🔑 Default Users

The service includes pre-configured users:

| Username | Password   | Role  |
|----------|------------|-------|
| furkan   | furkan123  | admin |
| admin    | admin      | admin |

## 🌐 API Endpoints

| Method | Endpoint      | Description           |
|--------|---------------|-----------------------|
| POST   | `/login`      | Authenticate user     |
| POST   | `/validate-token` | Validate JWT token |
| GET    | `/user-info`  | Get user information  |
| GET    | `/health`     | Health check          |
| POST   | `/api/v1/auth/register` | Register new users |
| GET    | `/api/v1/admin/user-stats` | Get user statistics |
| PUT    | `/api/v1/admin/max-users` | Update maximum user limit |

## ⚙️ Configuration

Key environment variables:

```env
AUTH_SERVICE_PORT=8006
JWT_SECRET=your_secret_key
AUTH_SERVICE_DB_HOST=localhost
AUTH_SERVICE_DB_PORT=5437
AUTH_SERVICE_DB_NAME=fitness_auth
```

See `.env.example` for complete configuration options.

## 🛠️ Management Scripts

### Database Management
```bash
./scripts/db.sh migrate     # Run migrations
./scripts/db.sh reset       # Reset database
./scripts/db.sh backup      # Create backup
./scripts/db.sh status      # Show status
```

### Deployment
```bash
./scripts/deploy.sh deploy  # Full deployment
./scripts/deploy.sh logs    # View logs
./scripts/deploy.sh health  # Health check
./scripts/deploy.sh stop    # Stop service
```

### Database Cleanup
```bash
./scripts/cleanup_database.sh  # Clean database and remove sample data
```

## 🧪 Testing

```bash
# Run all tests
go test ./...

# Test with coverage
go test -cover ./...

# Test API endpoints
curl http://localhost:8006/health
```

## 📦 Docker Services

- **auth-service**: Main application container
- **auth-db**: PostgreSQL database container

## 🔒 Security Features

- bcrypt password hashing
- JWT token authentication
- Session tracking and revocation
- Configurable token expiration
- IP address and user agent logging

## 🚦 Health Monitoring

The service provides health endpoints for monitoring:

```bash
# Check service health
curl http://localhost:8006/health

# Response
{
  "status": "healthy",
  "service": "auth-service"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running
2. **Port Conflicts**: Check if port 8006 is available
3. **Environment Variables**: Verify .env configuration
4. **Migrations**: Run `./scripts/db.sh migrate`

### Debug Commands

```bash
# View logs
docker-compose logs -f auth-service

# Check container status
docker-compose ps

# Connect to database
docker-compose exec auth-db psql -U postgres -d fitness_auth
```

## 📈 Monitoring

The service includes:
- Health check endpoints
- Structured logging
- Container health checks
- Database connection monitoring

## 🔄 Integration

This service integrates with:
- **API Gateway**: Route authentication requests
- **Other Services**: Validate user tokens
- **Frontend**: User authentication flow

## 📄 License

Part of the Fitness Center application.

---

For detailed documentation, see the [docs](docs/) directory.

## Recent Updates

### User Registration System
- Added user registration endpoint with validation
- Implemented maximum user count limitations (default: 50 users)
- Added admin endpoints for user management
- Created database cleanup scripts to remove sample data
- Fixed character encoding issues in sample data

### New Endpoints
- `POST /api/v1/auth/register` - Register new users
- `GET /api/v1/admin/user-stats` - Get user statistics
- `PUT /api/v1/admin/max-users` - Update maximum user limit

### Database Cleanup
- New script: `./scripts/cleanup_database.sh` - Removes sample data and resets database
- New migration: `000005_clean_sample_data.up.sql` - Production-ready database state
- New table: `system_config` - Stores configuration like user limits

## Quick Start

### 1. Database Setup and Cleanup

To start with a clean database without sample data issues:

```bash
# Clean database and remove sample data
./scripts/cleanup_database.sh
```

### 2. Start the Service

```bash
# Using Docker
docker-compose up -d

# Or build and run locally
go build ./cmd/main.go
./main
```

### 3. Test the New Features

```bash
# Run comprehensive tests
./scripts/test_registration.sh
```

## API Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword123",
    "email": "john@example.com",
    "full_name": "John Doe"
  }'
```

### Check User Statistics

```bash
curl -X GET http://localhost:8000/api/v1/admin/user-stats
```

### Update User Limit

```bash
curl -X PUT http://localhost:8000/api/v1/admin/max-users \
  -H "Content-Type: application/json" \
  -d '{"max_users": 100}'
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_admin_password"
  }'
```

## Problem Resolution

### Original Issues Fixed
- ✅ **Sample data character encoding issues** - Fixed by database cleanup
- ✅ **No user registration system** - Added comprehensive registration API
- ✅ **No user count limitations** - Added configurable user limits
- ✅ **Database starts with sample data** - Added cleanup scripts for production

### User Count Management
- Default maximum: 50 users
- Configurable via admin API
- Prevents registration when limit reached
- Cannot set limit below current user count
- Real-time statistics available

### Clean Database Setup
- Run `./scripts/cleanup_database.sh` to remove sample data
- Keeps only essential admin user
- Resets all user sessions
- Fixes character encoding issues
- Sets proper production defaults

## Environment Variables

```bash
# Database Configuration
AUTH_SERVICE_DB_HOST=localhost
AUTH_SERVICE_DB_PORT=5437
AUTH_SERVICE_DB_NAME=fitness_auth
AUTH_SERVICE_DB_USER=postgres
AUTH_SERVICE_DB_PASSWORD=postgres

# Auth Configuration
AUTH_SERVICE_JWT_SECRET=your-secret-key
AUTH_SERVICE_JWT_EXPIRATION=24h
AUTH_SERVICE_DEFAULT_USERNAME=admin
AUTH_SERVICE_DEFAULT_PASSWORD=your-admin-password

# Server Configuration
AUTH_SERVICE_HOST=0.0.0.0
AUTH_SERVICE_PORT=8000
```

## Scripts

- `./scripts/cleanup_database.sh` - Clean database and remove sample data
- `./scripts/test_registration.sh` - Test all registration functionality
- `./scripts/db.sh` - Database management utilities
- `./scripts/deploy.sh` - Deployment script

## Migration Files

- `000001_create_users_table.up.sql` - User table creation
- `000002_create_user_sessions_table.up.sql` - Session table creation
- `000003_insert_default_users.sql` - Default users (for development)
- `000004_create_system_config_table.up.sql` - System configuration table
- `000005_clean_sample_data.up.sql` - Production database cleanup

## Next Steps

1. Run database cleanup: `./scripts/cleanup_database.sh`
2. Start the service: `docker-compose up -d`
3. Test registration: `./scripts/test_registration.sh`
4. Configure user limits via admin API
5. Integrate with other microservices

## Contributing

When adding new features:
1. Update API documentation
2. Add appropriate tests
3. Update migration files if needed
4. Test with cleanup scripts
5. Update this README
