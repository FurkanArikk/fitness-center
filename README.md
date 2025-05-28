# Fitness Center Management System

A comprehensive microservices-based fitness center management system built with Go backend services and modern web technologies.

## 🏗️ Architecture

This fitness center system follows a microservices architecture with the following services:

- **Auth Service** - JWT-based authentication and admin user management
- **Member Service** - Member registration and profile management  
- **Staff Service** - Staff management and role assignments
- **Class Service** - Fitness class scheduling and management
- **Facility Service** - Facility and equipment management
- **Payment Service** - Payment processing and billing

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Go 1.21+ (for development)
- PostgreSQL (handled via Docker)

### Running the System

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fitness-center
   ```

2. **Start all services**:
   ```bash
   # Start individual services
   cd backend/auth-service && ./run.sh
   cd backend/member-service && ./run.sh
   # ... repeat for other services
   ```

3. **Access the services**:
   - Auth Service: http://localhost:8006
   - Member Service: http://localhost:8001  
   - Staff Service: http://localhost:8002
   - Class Service: http://localhost:8003
   - Facility Service: http://localhost:8004
   - Payment Service: http://localhost:8005

## 🔐 Authentication

The system uses JWT-based authentication managed by the Auth Service:

### Default Admin Credentials
- Username: `admin`
- Password: `fitness123`

### Admin User Management
- Maximum 3 admin users allowed
- Registration endpoint creates admin users only
- All services require valid JWT tokens

### Quick Authentication Test
```bash
# Login and get token
curl -X POST http://localhost:8006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "fitness123"}'

# Use token for other services
curl -X GET http://localhost:8001/api/v1/members \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 📊 Service Status

| Service | Status | Port | Health Check |
|---------|--------|------|--------------|
| Auth Service | ✅ Fully Functional | 8006 | GET /health |
| Member Service | 🚧 In Development | 8001 | GET /health |
| Staff Service | 🚧 In Development | 8002 | GET /health |
| Class Service | 🚧 In Development | 8003 | GET /health |
| Facility Service | 🚧 In Development | 8004 | GET /health |
| Payment Service | 🚧 In Development | 8005 | GET /health |

## 📚 Documentation

### Auth Service (Fully Functional)
- [API Documentation](backend/auth-service/docs/API.md)
- [Endpoint Information](backend/auth-service/docs/endpoint_information.txt)
- [Detailed Endpoints](backend/auth-service/docs/endpoints.txt)
- [Postman Collection](backend/auth-service/docs/Fitness-Center-Auth-Service.postman_collection.json)

### Other Services
Each service has its own documentation in the respective `docs/` directories.

## 🔧 Development

### Project Structure
```
fitness-center/
├── backend/                    # Backend microservices
│   ├── auth-service/          # ✅ Authentication & authorization
│   ├── member-service/        # 🚧 Member management  
│   ├── staff-service/         # 🚧 Staff management
│   ├── class-service/         # 🚧 Class scheduling
│   ├── facility-service/      # 🚧 Facility management
│   └── payment-service/       # 🚧 Payment processing
├── frontend/                  # Frontend applications
│   └── fitness-center-app/    # React/Next.js web app
└── docs/                      # Project documentation
```

### Running Individual Services
Each service can be run independently:

```bash
cd backend/auth-service
./run.sh  # Starts service with Docker Compose
```

### Testing
Use the provided test scripts and Postman collections:

```bash
# Test auth endpoints
./test_auth_endpoints.sh

# Import Postman collection
# File: backend/auth-service/docs/Fitness-Center-Auth-Service.postman_collection.json
```

## 🛠️ Tech Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin HTTP framework
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose
- **Architecture**: Microservices

### Frontend  
- **Framework**: React/Next.js
- **Styling**: Tailwind CSS
- **State Management**: Context API / Redux

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL containers
- **Reverse Proxy**: Nginx (planned)

## 🔍 Recent Updates

### Auth Service Fixes (May 28, 2025)
- ✅ Fixed session creation issues with PostgreSQL inet type
- ✅ Implemented proper NULL handling for IP addresses
- ✅ All endpoints now fully functional (login, register, validate, user info)
- ✅ Comprehensive endpoint documentation created
- ✅ Postman collection with test cases added

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or issues:
- Check the service-specific documentation in `docs/` directories
- Review the API endpoints and examples
- Use the provided Postman collections for testing