# Payment Service API Documentation

The Payment Service manages payment processing, invoicing, and financial transactions within the Fitness Center application. This service provides RESTful APIs for payment processing, subscription management, and financial reporting with Stripe integration.

## Base URL

```
http://localhost:8003/api/v1
```

## Table of Contents

- [Payment Endpoints](#payment-endpoints)
- [Payment Type Endpoints](#payment-type-endpoints)
- [Invoice Endpoints](#invoice-endpoints)
- [Subscription Endpoints](#subscription-endpoints)
- [Health Check Endpoint](#health-check-endpoint)

## Payment Endpoints

### Get All Payments

Returns a list of all payments with optional filtering and pagination support.

**Endpoint:** `GET /payments`

**Query Parameters:**
- `member_id` (optional): Filter by member ID
- `payment_status` (optional): Filter by status (pending/completed/failed/refunded)
- `payment_method` (optional): Filter by payment method (credit_card/debit_card/bank_transfer/cash)
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of items per page (default: 10)

**Example Request:**
```
GET /api/v1/payments?member_id=101&payment_status=completed&page=1
```

**Response (200 OK):**
```json
[
  {
    "payment_id": 1,
    "member_id": 101,
    "amount": 99.99,
    "payment_date": "2023-07-01T10:00:00Z",
    "payment_method": "credit_card",
    "payment_status": "completed",
    "invoice_number": "INV-2023-0001",
    "description": "Monthly membership fee",
    "payment_type_id": 1,
    "stripe_payment_intent_id": "pi_1234567890",
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z",
    "payment_type_name": "Membership Fee"
  },
  {
    "payment_id": 2,
    "member_id": 102,
    "amount": 149.99,
    "payment_date": "2023-07-02T11:30:00Z",
    "payment_method": "debit_card",
    "payment_status": "completed",
    "invoice_number": "INV-2023-0002",
    "description": "Premium membership fee",
    "payment_type_id": 1,
    "stripe_payment_intent_id": "pi_0987654321",
    "created_at": "2023-07-02T11:30:00Z",
    "updated_at": "2023-07-02T11:30:00Z",
    "payment_type_name": "Membership Fee"
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "Invalid date format"
  }
  ```
- `500 Internal Server Error`: Server-side error
  ```json
  {
    "error": "Database connection error"
  }
  ```

### Get Payment by ID

Returns a specific payment by its ID.

**Endpoint:** `GET /payments/{id}`

**Path Parameters:**
- `id`: Payment ID (integer)

**Response (200 OK):**
```json
{
  "payment_id": 1,
  "member_id": 101,
  "amount": 99.99,
  "payment_date": "2023-07-01T10:00:00Z",
  "payment_method": "credit_card",
  "payment_status": "completed",
  "invoice_number": "INV-2023-0001",
  "description": "Monthly membership fee",
  "payment_type_id": 1,
  "stripe_payment_intent_id": "pi_1234567890",
  "created_at": "2023-07-01T10:00:00Z",
  "updated_at": "2023-07-01T10:00:00Z",
  "payment_type_name": "Membership Fee"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid payment ID
- `404 Not Found`: Payment not found

### Create Payment

Creates a new payment record and processes payment through Stripe.

**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "member_id": 103,
  "amount": 79.99,
  "payment_method": "credit_card",
  "description": "Basic membership fee",
  "payment_type_id": 1,
  "stripe_payment_method_id": "pm_1234567890"
}
```

**Field Validation:**
- `member_id`: Required, integer (must exist)
- `amount`: Required, decimal (positive value, max 2 decimal places)
- `payment_method`: Required, one of: "credit_card", "debit_card", "bank_transfer", "cash"
- `description`: Optional, string (max 255 characters)
- `payment_type_id`: Required, integer (must exist)
- `stripe_payment_method_id`: Required for card payments, string

**Response (201 Created):**
```json
{
  "payment_id": 25,
  "member_id": 103,
  "amount": 79.99,
  "payment_date": "2025-06-04T10:00:00Z",
  "payment_method": "credit_card",
  "payment_status": "completed",
  "invoice_number": "INV-2025-0025",
  "description": "Basic membership fee",
  "payment_type_id": 1,
  "stripe_payment_intent_id": "pi_2025060401",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data or validation errors
  ```json
  {
    "error": "Payment processing failed: Card declined"
  }
  ```
- `404 Not Found`: Member or payment type not found
- `500 Internal Server Error`: Server-side error

### Update Payment Status

Updates the status of an existing payment.

**Endpoint:** `PUT /payments/{id}/status`

**Path Parameters:**
- `id`: Payment ID (integer)

**Request Body:**
```json
{
  "payment_status": "refunded",
  "refund_reason": "Member cancellation within 24 hours"
}
```

**Field Validation:**
- `payment_status`: Required, one of: "pending", "completed", "failed", "refunded"
- `refund_reason`: Optional, string (required for refunded status)

**Response (200 OK):**
```json
{
  "payment_id": 25,
  "member_id": 103,
  "amount": 79.99,
  "payment_date": "2025-06-04T10:00:00Z",
  "payment_method": "credit_card",
  "payment_status": "refunded",
  "invoice_number": "INV-2025-0025",
  "description": "Basic membership fee",
  "refund_reason": "Member cancellation within 24 hours",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid payment ID or status
- `404 Not Found`: Payment not found
- `409 Conflict`: Payment cannot be refunded in current state
  "page": 1,
  "pageSize": 10,
  "totalItems": 10,
  "totalPages": 1
}
```

### Get Payment by ID

Returns a specific payment by its ID.

**Endpoint:** `GET /payments/{id}`

**Response (200 OK):**
```json
{
  "payment_id": 1,
  "member_id": 101,
  "amount": 99.99,
  "payment_date": "2023-07-01T10:00:00Z",
  "payment_method": "credit_card",
  "payment_status": "completed",
  "invoice_number": "INV-2023-0001",
  "description": "Monthly membership fee",
  "payment_type_id": 1,
  "created_at": "2023-07-01T10:00:00Z",
  "updated_at": "2023-07-01T10:00:00Z",
  "payment_type_name": "Membership Fee"
}
```

### Create Payment

Creates a new payment record.

**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "member_id": 103,
  "amount": 50.00,
  "payment_date": "2023-07-15T14:30:00Z",
  "payment_method": "cash",
  "payment_status": "completed",
  "description": "Personal training session",
  "payment_type_id": 2
}
```

**Response (201 Created):**
```json
{
  "payment_id": 11,
  "member_id": 103,
  "amount": 50.00,
  "payment_date": "2023-07-15T14:30:00Z",
  "payment_method": "cash",
  "payment_status": "completed",
  "invoice_number": "INV-2023-00011",
  "description": "Personal training session",
  "payment_type_id": 2,
  "created_at": "2023-07-15T14:30:00Z",
  "updated_at": "2023-07-15T14:30:00Z"
}
```

### Update Payment

Updates an existing payment.

**Endpoint:** `PUT /payments/{id}`

**Request Body:**
```json
{
  "member_id": 103,
  "amount": 55.00,
  "payment_date": "2023-07-15T14:30:00Z",
  "payment_method": "credit_card",
  "payment_status": "completed",
  "description": "Updated: Personal training session plus equipment rental",
  "payment_type_id": 2
}
```

**Response (200 OK):**
```json
{
  "payment_id": 11,
  "member_id": 103,
  "amount": 55.00,
  "payment_date": "2023-07-15T14:30:00Z",
  "payment_method": "credit_card",
  "payment_status": "completed",
  "invoice_number": "INV-2023-00011",
  "description": "Updated: Personal training session plus equipment rental",
  "payment_type_id": 2,
  "created_at": "2023-07-15T14:30:00Z",
  "updated_at": "2023-07-15T15:00:00Z"
}
```

### Delete Payment

Deletes a payment.

**Endpoint:** `DELETE /payments/{id}`

**Response (200 OK):**
```json
{
  "message": "Payment deleted successfully"
}
```

### Get Payments by Member

Returns all payments for a specific member.

**Endpoint:** `GET /payments/member/{memberID}`

**Response (200 OK):**
```json
{
  "data": [
    {
      "payment_id": 1,
      "member_id": 101,
      "amount": 99.99,
      "payment_date": "2023-07-01T10:00:00Z",
      "payment_method": "credit_card",
      "payment_status": "completed",
      "invoice_number": "INV-2023-0001",
      "description": "Monthly membership fee",
      "payment_type_id": 1,
      "created_at": "2023-07-01T10:00:00Z",
      "updated_at": "2023-07-01T10:00:00Z",
      "payment_type_name": "Membership Fee"
    },
    {
      "payment_id": 6,
      "member_id": 101,
      "amount": 99.99,
      "payment_date": "2023-08-01T10:30:00Z",
      "payment_method": "credit_card",
      "payment_status": "completed",
      "invoice_number": "INV-2023-0006",
      "description": "Monthly membership fee",
      "payment_type_id": 1,
      "created_at": "2023-08-01T10:30:00Z",
      "updated_at": "2023-08-01T10:30:00Z",
      "payment_type_name": "Membership Fee"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalItems": 2,
  "totalPages": 1
}
```

### Get Payment Statistics

Returns statistics about payments.

**Endpoint:** `GET /payments/statistics`

**Query Parameters:**
- `memberID` (optional): Filter by member ID
- `typeID` (optional): Filter by payment type ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response (200 OK):**
```json
{
  "total_payments": 10,
  "total_amount": 945.96,
  "average_amount": 94.60,
  "pending_payments": 1,
  "completed_payments": 8,
  "failed_payments": 1
}
```

## Payment Type Endpoints

### Get All Payment Types

Returns a list of all payment types.

**Endpoint:** `GET /payment-types`

**Response (200 OK):**
```json
[
  {
    "payment_type_id": 1,
    "type_name": "Membership Fee",
    "description": "Monthly or annual membership subscription fee",
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z"
  },
  {
    "payment_type_id": 2,
    "type_name": "Personal Training",
    "description": "One-on-one personal training session fee",
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z"
  }
]
```

### Create Payment Type

Creates a new payment type.

**Endpoint:** `POST /payment-types`

**Request Body:**
```json
{
  "type_name": "Equipment Rental",
  "description": "Fee for renting gym equipment for home use"
}
```

**Response (201 Created):**
```json
{
  "payment_type_id": 5,
  "type_name": "Equipment Rental",
  "description": "Fee for renting gym equipment for home use",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

## Invoice Endpoints

### Get All Invoices

Returns a list of all invoices with optional filtering.

**Endpoint:** `GET /invoices`

**Query Parameters:**
- `member_id` (optional): Filter by member ID
- `status` (optional): Filter by status (paid/unpaid/overdue)
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)

**Response (200 OK):**
```json
[
  {
    "invoice_id": 1,
    "member_id": 101,
    "invoice_number": "INV-2023-0001",
    "amount": 99.99,
    "issue_date": "2023-07-01T00:00:00Z",
    "due_date": "2023-07-15T00:00:00Z",
    "status": "paid",
    "description": "Monthly membership fee - July 2023",
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2023-07-01T10:00:00Z"
  }
]
```

### Create Invoice

Creates a new invoice for a member.

**Endpoint:** `POST /invoices`

**Request Body:**
```json
{
  "member_id": 104,
  "amount": 119.99,
  "due_date": "2025-06-18T00:00:00Z",
  "description": "Premium membership fee - June 2025"
}
```

**Response (201 Created):**
```json
{
  "invoice_id": 50,
  "member_id": 104,
  "invoice_number": "INV-2025-0050",
  "amount": 119.99,
  "issue_date": "2025-06-04T00:00:00Z",
  "due_date": "2025-06-18T00:00:00Z",
  "status": "unpaid",
  "description": "Premium membership fee - June 2025",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

## Subscription Endpoints

### Get All Subscriptions

Returns a list of all recurring subscriptions.

**Endpoint:** `GET /subscriptions`

**Query Parameters:**
- `member_id` (optional): Filter by member ID
- `status` (optional): Filter by status (active/canceled/paused)

**Response (200 OK):**
```json
[
  {
    "subscription_id": 1,
    "member_id": 101,
    "stripe_subscription_id": "sub_1234567890",
    "plan_name": "Premium Monthly",
    "amount": 99.99,
    "billing_cycle": "monthly",
    "status": "active",
    "current_period_start": "2025-06-01T00:00:00Z",
    "current_period_end": "2025-07-01T00:00:00Z",
    "next_billing_date": "2025-07-01T00:00:00Z",
    "created_at": "2023-07-01T10:00:00Z",
    "updated_at": "2025-06-01T00:00:00Z"
  }
]
```

### Create Subscription

Creates a new recurring subscription.

**Endpoint:** `POST /subscriptions`

**Request Body:**
```json
{
  "member_id": 105,
  "plan_name": "Basic Monthly",
  "amount": 49.99,
  "billing_cycle": "monthly",
  "stripe_price_id": "price_1234567890"
}
```

**Response (201 Created):**
```json
{
  "subscription_id": 25,
  "member_id": 105,
  "stripe_subscription_id": "sub_2025060401",
  "plan_name": "Basic Monthly",
  "amount": 49.99,
  "billing_cycle": "monthly",
  "status": "active",
  "current_period_start": "2025-06-04T00:00:00Z",
  "current_period_end": "2025-07-04T00:00:00Z",
  "next_billing_date": "2025-07-04T00:00:00Z",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T10:00:00Z"
}
```

### Cancel Subscription

Cancels an active subscription.

**Endpoint:** `DELETE /subscriptions/{id}`

**Path Parameters:**
- `id`: Subscription ID (integer)

**Response (200 OK):**
```json
{
  "subscription_id": 25,
  "member_id": 105,
  "stripe_subscription_id": "sub_2025060401",
  "plan_name": "Basic Monthly",
  "amount": 49.99,
  "billing_cycle": "monthly",
  "status": "canceled",
  "canceled_at": "2025-06-04T14:30:00Z",
  "current_period_start": "2025-06-04T00:00:00Z",
  "current_period_end": "2025-07-04T00:00:00Z",
  "created_at": "2025-06-04T10:00:00Z",
  "updated_at": "2025-06-04T14:30:00Z"
}
```

## Health Check Endpoint

### Health Check

Returns the health status of the Payment Service.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "payment-service",
  "version": "1.0.0",
  "database": "connected",
  "stripe_api": "connected",
  "timestamp": "2025-06-04T10:00:00Z"
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "service": "payment-service",
  "database": "disconnected",
  "stripe_api": "error",
  "error": "Database connection failed"
}
```
