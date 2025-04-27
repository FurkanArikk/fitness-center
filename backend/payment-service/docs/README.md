# Payment Service Documentation

The Payment Service is responsible for managing payments, payment types, and payment transactions within the Fitness Center application. This service provides APIs for processing and tracking all financial transactions.

## Table of Contents

- [Overview](#overview)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)

## Overview

The Payment Service handles three main entities:

1. **Payments** - Records of financial transactions (amount, method, status)
2. **Payment Types** - Categories of payments (membership fees, personal training, etc.)
3. **Transactions** - Detailed processing records of payments through payment gateways

### Key Features

- Process and track member payments
- Manage various payment types
- Record transaction details for each payment
- Generate unique invoice numbers
- Provide payment statistics

### Service Dependencies

The Payment Service interacts with:

- **Member Service** - To verify member information
- **Notification Service** - To send payment receipts and confirmations

### Technical Stack

- **Language**: Go
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **Containerization**: Docker
