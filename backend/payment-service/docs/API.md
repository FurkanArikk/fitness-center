# Payment Service API Documentation

This document outlines all the API endpoints provided by the Payment Service.

Base URL: `/api/v1`

## Payments

### Get All Payments

Returns a list of all payments, with optional pagination.

**Endpoint:** `GET /payments`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `pageSize` (optional): Number of items per page

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
      "payment_id": 2,
      "member_id": 102,
      "amount": 149.99,
      "payment_date": "2023-07-02T11:30:00Z",
      "payment_method": "debit_card",
      "payment_status": "completed",
      "invoice_number": "INV-2023-0002",
      "description": "Premium membership fee",
      "payment_type_id": 1,
      "created_at": "2023-07-02T11:30:00Z",
      "updated_at": "2023-07-02T11:30:00Z",
      "payment_type_name": "Membership Fee"
    }
  ],
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

## Payment Types

### Get All Payment Types

Returns a list of all payment types.

**Endpoint:** `GET /payment-types`

**Query Parameters:**
- `active` (optional): Filter by active status (true/false)

**Response (200 OK):**
```json
{
  "data": [
    {
      "payment_type_id": 1,
      "type_name": "Membership Fee",
      "description": "Regular membership subscription payment",
      "is_active": true,
      "created_at": "2023-06-01T10:00:00Z",
      "updated_at": "2023-06-01T10:00:00Z"
    },
    {
      "payment_type_id": 2,
      "type_name": "Personal Training",
      "description": "Payment for personal training sessions",
      "is_active": true,
      "created_at": "2023-06-01T10:00:00Z",
      "updated_at": "2023-06-01T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalItems": 5,
  "totalPages": 1
}
```

### Get Payment Type by ID

Returns a specific payment type by its ID.

**Endpoint:** `GET /payment-types/{id}`

**Response (200 OK):**
```json
{
  "payment_type_id": 1,
  "type_name": "Membership Fee",
  "description": "Regular membership subscription payment",
  "is_active": true,
  "created_at": "2023-06-01T10:00:00Z",
  "updated_at": "2023-06-01T10:00:00Z"
}
```

### Create Payment Type

Creates a new payment type.

**Endpoint:** `POST /payment-types`

**Request Body:**
```json
{
  "type_name": "Event Fee",
  "description": "Payment for special events and workshops",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "payment_type_id": 6,
  "type_name": "Event Fee",
  "description": "Payment for special events and workshops",
  "is_active": true,
  "created_at": "2023-07-15T10:00:00Z",
  "updated_at": "2023-07-15T10:00:00Z"
}
```

### Update Payment Type

Updates an existing payment type.

**Endpoint:** `PUT /payment-types/{id}`

**Request Body:**
```json
{
  "type_name": "Event Fee",
  "description": "Payment for special events, workshops, and seminars",
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "payment_type_id": 6,
  "type_name": "Event Fee",
  "description": "Payment for special events, workshops, and seminars",
  "is_active": true,
  "created_at": "2023-07-15T10:00:00Z",
  "updated_at": "2023-07-15T11:00:00Z"
}
```

### Delete Payment Type

Deletes a payment type.

**Endpoint:** `DELETE /payment-types/{id}`

**Response (200 OK):**
```json
{
  "message": "Payment type deleted successfully"
}
```

### Toggle Payment Type Status

Activates or deactivates a payment type.

**Endpoint:** `PUT /payment-types/{id}/status`

**Request Body:**
```json
{
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "message": "Payment type status updated successfully"
}
```

## Transactions

### Create Transaction

Creates a new payment transaction.

**Endpoint:** `POST /transactions`

**Request Body:**
```json
{
  "payment_id": 11,
  "transaction_status": "success",
  "transaction_reference": "TXN987654321",
  "gateway_response": "{\"processor\":\"Stripe\",\"status\":\"succeeded\",\"auth_code\":\"AUTH999\"}"
}
```

**Notes:**
- `transaction_date` is optional. If not provided, it will be automatically set to the current time
- `payment_id` and `transaction_status` are required fields

**Response (201 Created):**
```json
{
  "transaction_id": 11,
  "payment_id": 11,
  "transaction_date": "2025-06-04T15:48:42Z",
  "transaction_status": "success",
  "transaction_reference": "TXN987654321",
  "gateway_response": "{\"processor\":\"Stripe\",\"status\":\"succeeded\",\"auth_code\":\"AUTH999\"}",
  "created_at": "2025-06-04T15:48:42Z",
  "updated_at": "2025-06-04T15:48:42Z"
}
```

### Get Transaction by ID

Returns a specific transaction by its ID.

**Endpoint:** `GET /transactions/{id}`

**Response (200 OK):**
```json
{
  "transaction_id": 1,
  "payment_id": 1,
  "transaction_date": "2023-07-01T10:01:15Z",
  "transaction_status": "success",
  "transaction_reference": "TXN123456789",
  "gateway_response": "{\"processor\":\"Stripe\",\"status\":\"succeeded\",\"auth_code\":\"AUTH123\"}",
  "created_at": "2023-07-01T10:01:15Z",
  "updated_at": "2023-07-01T10:01:15Z"
}
```

### Update Transaction

Updates an existing transaction. This endpoint supports partial updates - you only need to provide the fields you want to change.

**Endpoint:** `PUT /transactions/{id}`

**Request Body (Partial Update Supported):**
```json
{
  "payment_id": 1,
  "transaction_status": "success",
  "transaction_reference": "TXN123456789-A",
  "gateway_response": "{\"processor\":\"Stripe\",\"status\":\"succeeded\",\"auth_code\":\"AUTH123-A\"}"
}
```

**Notes:**
- `transaction_date` is optional. If not provided, it will be automatically set to the current time
- All other fields are optional and will only update if provided
- The `payment_id` field is required to maintain referential integrity

**Response (200 OK):**
```json
{
  "transaction_id": 1,
  "payment_id": 1,
  "transaction_date": "2025-06-04T15:48:42Z",
  "transaction_status": "success",
  "transaction_reference": "TXN123456789-A",
  "gateway_response": "{\"processor\":\"Stripe\",\"status\":\"succeeded\",\"auth_code\":\"AUTH123-A\"}",
  "created_at": "2023-07-01T10:01:15Z",
  "updated_at": "2025-06-04T15:48:42Z"
}
```

### Delete Transaction

Deletes a transaction.

**Endpoint:** `DELETE /transactions/{id}`

**Response (200 OK):**
```json
{
  "message": "Transaction deleted successfully"
}
```

### Get Transactions by Payment

Returns all transactions for a specific payment.

**Endpoint:** `GET /transactions/payment/{paymentID}`

**Response (200 OK):**
```json
{
  "data": [
    {
      "transaction_id": 1,
      "payment_id": 1,
      "transaction_date": "2023-07-01T10:01:15Z",
      "transaction_status": "success",
      "transaction_reference": "TXN123456789",
      "gateway_response": "{\"processor\":\"Stripe\",\"status\":\"succeeded\",\"auth_code\":\"AUTH123\"}",
      "created_at": "2023-07-01T10:01:15Z",
      "updated_at": "2023-07-01T10:01:15Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalItems": 1,
  "totalPages": 1
}
```

### Process Payment

Processes a payment and creates a transaction.

**Endpoint:** `POST /transactions/process`

**Request Body:**
```json
{
  "payment_id": 12,
  "transaction_status": "success",
  "transaction_reference": "TXN-PROCESS-001",
  "gateway_response": "{\"processor\":\"Stripe\",\"status\":\"succeeded\",\"auth_code\":\"AUTH-PROC-001\"}"
}
```

**Response (201 Created):**
```json
{
  "transaction_id": 12,
  "payment_id": 12,
  "transaction_date": "2023-07-15T16:30:00Z",
  "transaction_status": "success",
  "transaction_reference": "TXN-PROCESS-001",
  "gateway_response": "{\"processor\":\"Stripe\",\"status\":\"succeeded\",\"auth_code\":\"AUTH-PROC-001\"}",
  "created_at": "2023-07-15T16:30:00Z",
  "updated_at": "2023-07-15T16:30:00Z"
}
```
