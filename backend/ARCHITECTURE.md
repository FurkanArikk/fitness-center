# Fitness Center Backend Architecture

## Project Structure

This microservices architecture is organized as follows:

### Services
- `member-service` - Member management
- `staff-service` - Staff management  
- `class-service` - Class and program management
- `facility-service` - Facility and equipment management
- `payment-service` - Payment processing

### API Gateway
**Traefik** is used as a reverse proxy. Each service is configured with Traefik labels in its own `docker-compose.yml` file.

## Docker Configuration

### Main docker-compose.yml
- Contains **only Traefik** service
- Defines the shared `fitness-network` used by all services
- Traefik dashboard: `http://localhost:8080/dashboard/#/`

### Service-Specific docker-compose.yml
Each service has its own directory containing:
- Service and database definitions
- Traefik routing rules (labels)
- Service-specific health checks
- Environment variables

## Deployment

### Start All Services
```bash
./install.sh
```

### Stop All Services  
```bash
./stop.sh
```

### Individual Service Management
```bash
cd <service-directory>
./run.sh  # Start service
docker-compose down  # Stop service
```

## API Endpoints

All APIs are accessible through Traefik:

- **Members API**: `http://localhost/api/v1/members`
- **Staff API**: `http://localhost/api/v1/staff`
- **Classes API**: `http://localhost/api/v1/classes`
- **Facilities API**: `http://localhost/api/v1/facilities`
- **Payments API**: `http://localhost/api/v1/payments`

## Network Structure

- **Network Name**: `fitness-network`
- **Type**: External bridge network
- **Purpose**: Communication between all services and Traefik

## Advantages

1. **Modular Structure**: Each service can be developed independently
2. **Easy Deployment**: Services can be deployed separately
3. **Centralized Routing**: Single entry point through Traefik
4. **Health Monitoring**: Each service has its own health checks
5. **Load Balancing**: Traefik provides automatic load balancing
