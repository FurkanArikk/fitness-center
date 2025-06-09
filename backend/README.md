# Fitness Center Microservices Architecture - Backend

This project is developed using microservices architecture for a modern fitness center management system. It consists of 6 microservices written in Go (Golang), running in Docker containers, and managed by Traefik API Gateway.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 TRAEFIK API GATEWAY                         │
│                              (Port 80 - HTTP Router)                        │
│                            Dashboard: localhost:8080                        │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                          MICROSERVICES LAYER                                  │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│   Auth Service  │ Member Service  │ Staff Service   │   Payment Service       │
│   Port: 8085    │   Port: 8001    │   Port: 8002    │     Port: 8003          │
│   /api/v1/auth  │ /api/v1/members │ /api/v1/staff   │  /api/v1/payments       │
├─────────────────┼─────────────────┴─────────────────┴─────────────────────────┤
│ Facility Service│                Class Service                                │
│   Port: 8004    │                 Port: 8005                                  │
│/api/v1/facilities│               /api/v1/classes                              │
└─────────────────┴─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                      │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│  PostgreSQL     │   PostgreSQL    │   PostgreSQL    │     PostgreSQL          │
│fitness_auth_db  │fitness_member_db│fitness_staff_db │  fitness_payment_db     │
│   Port: 5437    │   Port: 5432    │   Port: 5433    │     Port: 5434          │
├─────────────────┼─────────────────┴─────────────────┴─────────────────────────┤
│   PostgreSQL    │                 PostgreSQL                                  │
│fitness_facility_db│              fitness_class_db                             │
│   Port: 5435    │                 Port: 5436                                  │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose must be installed
- Linux/macOS/Windows (WSL2) supported
- Minimum 4GB RAM recommended

### Start All Services
```bash
# Start all services automatically
./install.sh

# Optional parameters:
./install.sh -s reset     # Reset database and load sample data
./install.sh -s none      # Start without sample data
./install.sh -l           # Run locally instead of Docker
./install.sh -h           # Show help
```

### Stop All Services
```bash
# Stop all services and Traefik
./stop.sh
```

### Manual Service Management
```bash
# Start a single service
cd auth-service && ./run.sh

# Stop a single service
cd auth-service && docker-compose down
```

## 📋 Microservices Detailed Description

### 🔐 Auth Service (Authentication Service)
**Port:** 5434 | **Endpoint:** `/api/v1/auth`

**Functions:**
- User authentication and authorization
- JWT token management
- Admin user management
- Session management

**Technologies:**
- Node.js/Express
- PostgreSQL (fitness_auth_db)
- JWT (jsonwebtoken)
- bcrypt for password encryption

**Database Tables:**
- `users`: Admin users and authentication data

**API Examples:**
```bash
# Login
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Refresh token
curl -X POST http://localhost/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

### 👥 Member Service (Member Management Service)
**Port:** 5437 | **Endpoint:** `/api/v1/members`

**Functions:**
- Member registration and profile management
- Membership types and plans
- Fitness assessments
- Membership history and billing management

**Technologies:**
- Go/Gin Framework
- PostgreSQL (fitness_member_db)
- GORM ORM
- Multi-part form data support

**Database Tables:**
- `members`: Member information and contact details
- `memberships`: Membership types and pricing
- `member_memberships`: Member-membership relationships
- `membership_benefits`: Membership benefits
- `fitness_assessments`: Fitness assessment records

**API Examples:**
```bash
# List all members
curl -X GET http://localhost/api/v1/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add new member
curl -X POST http://localhost/api/v1/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com"}'
```

### 👨‍💼 Staff Service (Staff Management Service)
**Port:** 5433 | **Endpoint:** `/api/v1/staff`

**Functions:**
- Staff and trainer management
- Personal training session scheduling
- Staff qualifications and certifications tracking
- Trainer specializations and performance tracking

**Technologies:**
- Go/Gin Framework
- PostgreSQL (fitness_staff_db)
- GORM ORM
- Role-based access control

**Database Tables:**
- `staff`: Staff information and job details
- `staff_qualifications`: Staff certifications and qualifications
- `trainers`: Trainer-specific information and specializations
- `personal_training`: Personal training session records

**API Examples:**
```bash
# List all staff
curl -X GET http://localhost/api/v1/staff \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Staff shift schedule
curl -X GET http://localhost/api/v1/staff/schedules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🏃‍♀️ Class Service (Class Management Service)
**Port:** 5436 | **Endpoint:** `/api/v1/classes`

**Functions:**
- Group classes and programs
- Class reservations
- Instructor assignments
- Capacity management

**Technologies:**
- Go/Gin Framework
- PostgreSQL (fitness_class_db)
- GORM ORM
- Real-time booking management

**Database Tables:**
- `classes`: Class types and descriptions
- `class_schedule`: Class schedules and timing
- `class_bookings`: Class reservations

**API Examples:**
```bash
# Weekly class schedule
curl -X GET http://localhost/api/v1/classes/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Make class reservation
curl -X POST http://localhost/api/v1/classes/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"class_id":1,"member_id":1,"schedule_date":"2025-06-10"}'
```

### 🏢 Facility Service (Facility Management Service)
**Port:** 5435 | **Endpoint:** `/api/v1/facilities`

**Functions:**
- Facility and equipment management
- Maintenance scheduling
- Member attendance tracking
- Facility usage reports

**Technologies:**
- Go/Gin Framework
- PostgreSQL (fitness_facility_db)
- GORM ORM
- Equipment tracking system

**Database Tables:**
- `facilities`: Facility areas and features
- `equipment`: Equipment inventory and maintenance
- `attendance`: Member check-in/check-out records

**API Examples:**
```bash
# List all facilities
curl -X GET http://localhost/api/v1/facilities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Equipment maintenance history
curl -X GET http://localhost/api/v1/facilities/equipment/1/maintenance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 💳 Payment Service (Payment Management Service)
**Port:** 5438 | **Endpoint:** `/api/v1/payments`

**Functions:**
- Payment processing and tracking
- Invoice generation
- Payment history
- Multiple payment method support

**Technologies:**
- Go/Gin Framework
- PostgreSQL (fitness_payment_db)
- GORM ORM
- Payment gateway integration ready

**Database Tables:**
- `payments`: Payment records and details
- `payment_types`: Payment types (membership, products, etc.)
- `payment_transactions`: Transaction details and gateway responses

**Special Features:**
- Automatic invoice number generation (INV-YYYY-NNNNN)
- Automatic payment status update triggers
- Payment gateway response records

**API Examples:**
```bash
# Payment history
curl -X GET http://localhost/api/v1/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Record new payment
curl -X POST http://localhost/api/v1/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"member_id":1,"amount":100.00,"payment_method":"credit_card"}'
```

## 🌐 Traefik API Gateway

### What is Traefik?
Traefik is a modern HTTP reverse proxy and load balancer. It serves as a central entry point (API Gateway) in microservices architecture.

### Why Traefik?
- **Automatic Service Discovery**: Automatically detects Docker containers
- **Dynamic Configuration**: No restart required
- **Load Balancing**: Distributes traffic evenly to services
- **HTTPS/SSL Termination**: Let's Encrypt integration
- **Web Dashboard**: Graphical interface management

### Traefik Configuration
```yaml
# docker-compose.yml
services:
  traefik:
    image: "traefik:v3.4.0"
    container_name: "traefik_api_gateway"
    command:
      - "--api.insecure=true"                    # Dashboard open
      - "--providers.docker=true"               # Docker provider
      - "--providers.docker.exposedbydefault=false"  # Security
      - "--entrypoints.web.address=:80"         # HTTP entry point
    ports:
      - "80:80"      # HTTP traffic
      - "8080:8080"  # Dashboard
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    networks:
      - fitness-network
```

### Service Routing Structure
Each microservice registers with Traefik using Docker labels:

```yaml
# Example: auth-service docker-compose.yml
services:
  auth-service:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.auth.rule=Host(`localhost`) && PathPrefix(`/api/v1/auth`)"
      - "traefik.http.services.auth.loadbalancer.server.port=8080"
      - "traefik.docker.network=fitness-network"
```

### Request Flow
1. **Client** → Sends request to `http://localhost/api/v1/members`
2. **Traefik** → Analyzes URL and finds appropriate service
3. **Traefik** → Routes request to `member-service:8080`
4. **Member Service** → Processes request and returns response
5. **Traefik** → Forwards response to client

## 🐳 Docker Compose Structure

### Main Docker Compose (backend/docker-compose.yml)
Only runs Traefik API Gateway:
```yaml
services:
  traefik:
    image: "traefik:v3.4.0"
    # ... Traefik configuration
    networks:
      - fitness-network

networks:
  fitness-network:
    name: ${DOCKER_NETWORK_NAME:-fitness-network}
    external: true
```

### Service Docker Composes
Each service has its own `docker-compose.yml` file:
```yaml
# Example: auth-service/docker-compose.yml
services:
  auth-db:
    image: postgres:15
    environment:
      POSTGRES_DB: fitness_auth_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"
    volumes:
      - auth_postgres_data:/var/lib/postgresql/data
    networks:
      - fitness-network

  auth-service:
    build: .
    environment:
      DB_HOST: auth-db
      DB_PORT: 5432
      # ... other env variables
    depends_on:
      - auth-db
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.auth.rule=Host(`localhost`) && PathPrefix(`/api/v1/auth`)"
      # ... Traefik labels
    networks:
      - fitness-network

networks:
  fitness-network:
    name: fitness-network
    external: true

volumes:
  auth_postgres_data:
```

## 📜 Automated Installation and Management Scripts

### install.sh Script
**Features:**
- Starts all services sequentially
- Docker and Docker Compose checks
- Network creation
- Colorful output and progress tracking
- Flexible parameter support

**Usage:**
```bash
./install.sh                 # Run with default settings
./install.sh -s reset        # Reset database
./install.sh -s none         # Without sample data
./install.sh -l              # Local mode (only DB in Docker)
./install.sh -h              # Help
```

**What the Script Does:**
1. Docker checks
2. Network creation (`fitness-network`)
3. Start services sequentially (dependency order)
4. Health checks
5. Status report
6. Access information

### stop.sh Script
**Features:**
- Safely stops all services
- Includes Traefik
- Cleans containers
- Preserves network (optional)

**Usage:**
```bash
./stop.sh                    # Stop all services
```

**What the Script Does:**
1. Stop Traefik API Gateway
2. Stop all microservices
3. Clean containers
4. Preserve volumes (data loss prevention)

### Service run.sh Scripts
Each service has a `run.sh` script:
```bash
#!/bin/bash
# auth-service/run.sh

echo "Starting Auth Service..."

# Check if Docker network exists
if ! docker network inspect fitness-network &> /dev/null; then
    echo "Creating fitness-network..."
    docker network create fitness-network
fi

# Start the service
docker-compose up -d --build

echo "Auth Service started!"
echo "Health check: http://localhost:5434/health"
```

## 🔧 Development and Testing

### API Test Scripts
Each service contains `test_endpoints.sh` file:
```bash
# Example: member-service/test_endpoints.sh
#!/bin/bash

BASE_URL="http://localhost/api/v1"
TOKEN=""

# Login first
echo "=== AUTH LOGIN ==="
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

TOKEN=$(echo $RESPONSE | jq -r '.access_token')

# Test members endpoint
echo "=== GET MEMBERS ==="
curl -X GET "$BASE_URL/members" \
  -H "Authorization: Bearer $TOKEN"
```

### Log Management
Each service has a `logs/` folder:
- `app.log`: Application logs
- `error.log`: Error logs
- `database.log`: Database operation logs

### Migrations
Each service has a `migrations/` folder:
```
migrations/
├── 000001_create_users_table.up.sql
├── 000001_create_users_table.down.sql
├── 000002_add_indexes.up.sql
├── 000002_add_indexes.down.sql
└── 000003_sample_data.sql
```

## 📊 Monitoring and Dashboard

### Traefik Dashboard
- **URL:** http://localhost:8080/dashboard/
- **Features:**
  - Active routers and services
  - Real-time traffic monitoring
  - Health status indicators
  - Request/response metrics

### Health Check Endpoints
Each service provides health check endpoints:
```bash
# Health check for all services
curl http://localhost/api/v1/auth/health
curl http://localhost/api/v1/members/health
curl http://localhost/api/v1/staff/health
curl http://localhost/api/v1/classes/health
curl http://localhost/api/v1/facilities/health
curl http://localhost/api/v1/payments/health
```

## 🔐 Security

### Authentication Flow
1. Client logs in with `/api/v1/auth/login`
2. Auth Service returns JWT access token and refresh token
3. Client sends `Authorization: Bearer <token>` header with each request
4. Each microservice validates JWT token
5. Access token is renewed with refresh token

### CORS Policy
All services support CORS:
```go
// CORS middleware example
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
}))
```

## 🚀 Production Deployment

### Environment Variables
Each service uses `.env` file:
```env
# auth-service/.env
DB_HOST=auth-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fitness_auth_db
JWT_SECRET=your-super-secret-key
SERVER_PORT=8080
```

### SSL/HTTPS Configuration
SSL certificate with Traefik:
```yaml
# Production docker-compose.yml
command:
  - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
  - "--certificatesresolvers.myresolver.acme.email=your-email@example.com"
  - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
```

## 📚 API Documentation

Each service provides Swagger UI:

- **Auth Service:** http://localhost/api/v1/auth/swagger/index.html
- **Member Service:** http://localhost/api/v1/members/swagger/index.html
- **Staff Service:** http://localhost/api/v1/staff/swagger/index.html
- **Class Service:** http://localhost/api/v1/classes/swagger/index.html
- **Facility Service:** http://localhost/api/v1/facilities/swagger/index.html
- **Payment Service:** http://localhost/api/v1/payments/swagger/index.html

### Postman Collection
Each service contains Postman collection file:
```
docs/
├── API.md
├── DATABASE.md
├── README.md
└── postman_collection.json
```

## 🔍 Troubleshooting

### Common Issues

1. **"Network fitness-network not found"**
   ```bash
   docker network create fitness-network
   ```

2. **"Port already in use"**
   ```bash
   docker-compose down
   docker system prune -f
   ```

3. **"Service not responding"**
   ```bash
   docker-compose logs [service-name]
   docker-compose restart [service-name]
   ```

4. **"Database connection failed"**
   ```bash
   # Restart database container
   docker-compose restart [service-name]-db
   ```

### Log Analysis
```bash
# View logs for all services
docker-compose logs -f

# Logs for specific service
docker-compose logs -f auth-service

# Last 100 lines
docker-compose logs --tail=100 auth-service
```

## 📈 Performance and Scaling

### Resource Requirements
- **Minimum:** 4GB RAM, 2 CPU cores
- **Recommended:** 8GB RAM, 4 CPU cores
- **Disk:** 10GB (for logs and database)

### Horizontal Scaling
Service replication with Docker Compose:
```yaml
services:
  auth-service:
    # ... configuration
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push your branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
