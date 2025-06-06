# Payment Service Documentation

The Payment Service is responsible for managing payments, payment types, and payment transactions within the Fitness Center application. This service provides RESTful APIs for processing and tracking all financial transactions.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Service Configuration](#service-configuration)
- [Technical Stack](#technical-stack)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Getting Started](#getting-started)

## Overview

The Payment Service handles three main entities:

1. **Payments** - Records of financial transactions (amount, method, status)
2. **Payment Types** - Categories of payments (membership fees, personal training, etc.)
3. **Transactions** - Detailed processing records of payments through payment gateways

## Features

### Payment Processing
- Process and track member payments with comprehensive transaction records
- Support multiple payment methods (credit card, cash, bank transfer)
- Generate unique invoice numbers for each payment
- Handle payment status tracking (pending, completed, failed, refunded)

### Payment Type Management
- Manage various payment categories and types
- Associate payments with specific services (membership, training, equipment rental)
- Support flexible pricing and payment structure configuration
- Track payment type statistics and usage patterns

### Transaction Management
- Record detailed processing information for each payment
- Track payment gateway interactions and responses
- Support transaction history and audit trails
- Handle payment confirmations and receipts

### Financial Reporting
- Generate payment statistics and financial reports
- Track revenue by service type and payment method
- Monitor payment trends and member spending patterns
- Provide insights for business decision making

## Service Configuration

- **Default Port**: 8005 (configurable via `PAYMENT_SERVICE_PORT`)
- **Database Port**: 5437 (configurable via `PAYMENT_SERVICE_DB_PORT`)
- **Database**: `fitness_payment_db` (configurable via `PAYMENT_SERVICE_DB_NAME`)
- **Base URL**: `http://localhost:8005/api/v1`
- **Health Check**: `http://localhost:8005/health`

### Environment Variables

```bash
PAYMENT_SERVICE_PORT=8005
PAYMENT_SERVICE_DB_PORT=5437
PAYMENT_SERVICE_DB_NAME=fitness_payment_db
DB_HOST=localhost
DB_USER=fitness_user
DB_PASSWORD=admin
DB_SSLMODE=disable
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Technical Stack

- **Language**: Go (v1.20+)
- **Framework**: Gin Web Framework v1.9+
- **Database**: PostgreSQL 14+
- **ORM**: GORM v1.25+
- **Payment Gateway**: Stripe API integration
- **Configuration**: Environment-based with `.env` support
- **Logging**: Structured logging with request/response middleware
- **CORS**: Cross-origin resource sharing enabled
- **Containerization**: Docker and Docker Compose

## Architecture

The service follows a clean architecture pattern:

```
cmd/main.go                 # Application entry point
├── internal/
│   ├── config/            # Configuration management
│   ├── handler/           # HTTP handlers (controllers)
│   ├── model/             # Data models and interfaces
│   ├── repository/        # Data access layer
│   ├── server/            # HTTP server and routing
│   └── service/           # Business logic layer
├── migrations/            # Database migration files
└── pkg/dto/               # Data transfer objects
```

## Getting Started

1. **Prerequisites**
   - Go 1.20 or higher
   - PostgreSQL 14 or higher
   - Stripe account (for payment processing)
   - Docker (optional)
   - Git

2. **Environment Setup**
   ```bash
   # Clone the repository (if needed)
   cd backend/payment-service
   
   # Copy environment file
   cp .env.example .env
   
   # Update configuration in .env (including Stripe keys)
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb fitness_payment_db
   
   # The service will auto-migrate tables on startup
   ```

4. **Run the Service**
   ```bash
   # Using the run script (recommended)
   ./run.sh
   
   # Or manually
   go run cmd/main.go
   
   # Or build and run
   go build -o payment-service cmd/main.go
   ./payment-service
   ```

5. **Verify Installation**
   ```bash
   # Check health endpoint
   curl http://localhost:8005/health
   
   # Check API endpoints
   curl http://localhost:8005/api/v1/payments
   ```

6. **Test Endpoints**
   ```bash
   # Run comprehensive endpoint tests
   ./test_endpoints.sh
   ```

For detailed API documentation, see [API.md](API.md).  
For database schema details, see [DATABASE.md](DATABASE.md).
