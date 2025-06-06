# Payment Service Database Schema

The Payment Service uses PostgreSQL as its database with GORM as the ORM layer. Below is the detailed schema for the tables used in this service.

## Database Configuration

- **Database Name**: `fitness_payment_db` (default)
- **Port**: 5438 (default for payment service)
- **Schema**: Uses GORM auto-migration
- **Connection**: PostgreSQL with SSL disabled for development

## Architecture

The service uses GORM for database operations with the following benefits:
- **Type Safety**: Compile-time type checking for database operations
- **Auto Migration**: Automatic schema migration support
- **Relationship Management**: Built-in support for foreign key relationships
- **Transaction Support**: Automatic transaction handling for payment processing
- **Query Building**: Intuitive query building with method chaining

## GORM Model Definitions

All database models are defined in the `internal/model` package with embedded repository interfaces following the microservice pattern.

## Tables

### payments

This table stores information about payments made by members.

**GORM Model:** `internal/model/payment.go`

| Column           | Type                     | Description                                   | GORM Tags                           |
|------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| payment_id       | SERIAL                   | Primary key                                   | `primaryKey;autoIncrement`          |
| member_id        | INTEGER                  | Reference to member ID (in member-service)   | `not null;index`                    |
| amount           | DECIMAL(10,2)            | Payment amount                                | `type:decimal(10,2);not null;check:amount > 0` |
| payment_date     | TIMESTAMP WITH TIME ZONE | Date and time of payment                      | `not null;index`                    |
| payment_method   | VARCHAR(50)              | Method of payment (credit_card, cash, etc.)  | `type:varchar(50);not null;index`   |
| payment_status   | VARCHAR(20)              | Status of payment (pending, completed, failed)| `type:varchar(20);default:'pending';index` |
| invoice_number   | VARCHAR(50)              | Unique invoice number                         | `type:varchar(50);unique;not null`  |
| description      | TEXT                     | Payment description                           | `type:text`                         |
| payment_type_id  | INTEGER                  | Reference to payment_types table              | `not null;index`                    |
| created_at       | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at       | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `payment_id`
- UNIQUE constraint on `invoice_number`
- CHECK constraint `positive_payment_amount` on `amount > 0`
- Index on `member_id` for member-based queries
- Index on `payment_date` for date-based filtering
- Index on `payment_status` for status-based queries
- Index on `payment_method` for method-based filtering
- Index on `payment_type_id` for type-based queries

**GORM Features:**
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Check constraint for positive amounts
- Default status value of 'pending'
- Unique invoice number generation

### payment_types

This table stores information about different types of payments accepted.

**GORM Model:** `internal/model/payment_type.go`

| Column           | Type                     | Description                                   | GORM Tags                           |
|------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| payment_type_id  | SERIAL                   | Primary key                                   | `primaryKey;autoIncrement`          |
| type_name        | VARCHAR(50)              | Name of the payment type                      | `type:varchar(50);unique;not null`  |
| description      | VARCHAR(255)             | Description of the payment type               | `type:varchar(255)`                 |
| is_active        | BOOLEAN                  | Whether this payment type is currently active | `default:true;index`                |
| created_at       | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at       | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `payment_type_id`
- UNIQUE constraint on `type_name`
- Index on `is_active` for filtering active payment types

**GORM Features:**
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Default value of `true` for `is_active`
- Unique constraint on payment type names

### payment_transactions

This table stores information about payment processing transactions.

**GORM Model:** `internal/model/payment_transaction.go`

| Column                | Type                     | Description                                   | GORM Tags                           |
|-----------------------|--------------------------|-----------------------------------------------|-------------------------------------|
| transaction_id        | SERIAL                   | Primary key                                   | `primaryKey;autoIncrement`          |
| payment_id            | INTEGER                  | Reference to payments table                   | `not null;index`                    |
| transaction_date      | TIMESTAMP WITH TIME ZONE | Date and time of transaction                  | `not null;index`                    |
| transaction_status    | VARCHAR(50)              | Status of transaction (success, failed, etc.)| `type:varchar(50);not null;index`   |
| transaction_reference | VARCHAR(100)             | External reference number                     | `type:varchar(100);index`           |
| gateway_response      | TEXT                     | Complete response from payment gateway        | `type:text`                         |
| created_at            | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     | `autoCreateTime`                    |
| updated_at            | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  | `autoUpdateTime`                    |

**Constraints & Indexes:**
- PRIMARY KEY on `transaction_id`
- FOREIGN KEY on `payment_id` REFERENCES `payments(payment_id)` ON DELETE CASCADE
- Index on `payment_id` for payment-based queries
- Index on `transaction_date` for date-based filtering
- Index on `transaction_status` for status-based queries  
- Index on `transaction_reference` for reference lookups

**GORM Features:**
- Foreign key constraint with CASCADE delete behavior
- Automatic timestamping with `autoCreateTime` and `autoUpdateTime`
- Multiple indexes for optimized queries
- Text field for complete gateway responses

## Relationships

### Primary Relationships

1. **Payment Types → Payments** (One-to-Many)
   - Each payment type can be used for multiple payments
   - RESTRICT DELETE: Cannot delete a payment type that has been used

2. **Payments → Payment Transactions** (One-to-Many)
   - Each payment can have multiple transaction attempts
   - CASCADE DELETE: When a payment is deleted, all its transactions are removed

### Cross-Service Relationships

3. **Member Service → Payments** (One-to-Many)
   - Members from member service can make multiple payments
   - Foreign key reference only (no direct constraint)

## GORM Model Relationships

### Payment Model
```go
type Payment struct {
    PaymentID       uint                 `gorm:"primaryKey;autoIncrement" json:"payment_id"`
    MemberID        uint                 `gorm:"not null;index" json:"member_id"`
    Amount          float64              `gorm:"type:decimal(10,2);not null;check:amount > 0" json:"amount"`
    PaymentDate     time.Time            `gorm:"not null;index" json:"payment_date"`
    PaymentMethod   string               `gorm:"type:varchar(50);not null;index" json:"payment_method"`
    PaymentStatus   string               `gorm:"type:varchar(20);default:'pending';index" json:"payment_status"`
    InvoiceNumber   string               `gorm:"type:varchar(50);unique;not null" json:"invoice_number"`
    Description     *string              `gorm:"type:text" json:"description,omitempty"`
    PaymentTypeID   uint                 `gorm:"not null;index" json:"payment_type_id"`
    CreatedAt       time.Time            `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt       time.Time            `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    PaymentType         PaymentType         `gorm:"foreignKey:PaymentTypeID;constraint:OnDelete:RESTRICT" json:"payment_type,omitempty"`
    PaymentTransactions []PaymentTransaction `gorm:"foreignKey:PaymentID;constraint:OnDelete:CASCADE" json:"payment_transactions,omitempty"`
}
```

### PaymentType Model
```go
type PaymentType struct {
    PaymentTypeID uint      `gorm:"primaryKey;autoIncrement" json:"payment_type_id"`
    TypeName      string    `gorm:"type:varchar(50);unique;not null" json:"type_name"`
    Description   *string   `gorm:"type:varchar(255)" json:"description,omitempty"`
    IsActive      bool      `gorm:"default:true;index" json:"is_active"`
    CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    Payments []Payment `gorm:"foreignKey:PaymentTypeID;constraint:OnDelete:RESTRICT" json:"payments,omitempty"`
}
```

### PaymentTransaction Model
```go
type PaymentTransaction struct {
    TransactionID        uint      `gorm:"primaryKey;autoIncrement" json:"transaction_id"`
    PaymentID            uint      `gorm:"not null;index" json:"payment_id"`
    TransactionDate      time.Time `gorm:"not null;index" json:"transaction_date"`
    TransactionStatus    string    `gorm:"type:varchar(50);not null;index" json:"transaction_status"`
    TransactionReference *string   `gorm:"type:varchar(100);index" json:"transaction_reference,omitempty"`
    GatewayResponse      *string   `gorm:"type:text" json:"gateway_response,omitempty"`
    CreatedAt            time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt            time.Time `gorm:"autoUpdateTime" json:"updated_at"`
    
    // Relationships
    Payment Payment `gorm:"foreignKey:PaymentID;constraint:OnDelete:CASCADE" json:"payment,omitempty"`
}
```

## Entity-Relationship Diagram

```
                            PAYMENT SERVICE DATABASE SCHEMA
    
    ┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
    │           PAYMENT_TYPES             │         │             PAYMENTS                │
    │─────────────────────────────────────│         │─────────────────────────────────────│
    │ PK payment_type_id (SERIAL)         │         │ PK payment_id (SERIAL)              │
    │    type_name (VARCHAR(50)) [UNIQUE] │         │    member_id (INTEGER) [EXTERNAL]   │
    │    description (VARCHAR(255))       │         │ FK payment_type_id → payment_types  │
    │    is_active (BOOLEAN)              │         │    amount (DECIMAL(10,2))           │
    │    created_at (TIMESTAMPTZ)         │         │    payment_date (TIMESTAMPTZ)       │
    │    updated_at (TIMESTAMPTZ)         │         │    payment_method (VARCHAR(50))     │
    └─────────────────────────────────────┘         │    payment_status (VARCHAR(20))     │
                       │                            │    invoice_number (VARCHAR(50))     │
                       │ 1:N                        │    description (TEXT)               │
                       │                            │    created_at (TIMESTAMPTZ)         │
                       ▼                            │    updated_at (TIMESTAMPTZ)         │
    ┌─────────────────────────────────────┐         └─────────────────────────────────────┘
    │         MEMBER SERVICE              │                            │
    │─────────────────────────────────────│                            │ 1:N
    │        MEMBERS (EXTERNAL)           │                            │
    │─────────────────────────────────────│                            ▼
    │ member_id                           │         ┌─────────────────────────────────────┐
    │ first_name                          │◄────────┤        PAYMENT_TRANSACTIONS         │
    │ last_name                           │         │─────────────────────────────────────│
    │ email                               │         │ PK transaction_id (SERIAL)          │
    │ ...                                 │         │ FK payment_id → payments            │
    └─────────────────────────────────────┘         │    transaction_date (TIMESTAMPTZ)   │
                                                    │    transaction_status (VARCHAR(50)) │
                                                    │    transaction_reference (VARCHAR)  │
                                                    │    gateway_response (TEXT)          │
                                                    │    created_at (TIMESTAMPTZ)         │
                                                    │    updated_at (TIMESTAMPTZ)         │
                                                    └─────────────────────────────────────┘

    RELATIONSHIPS:
    • payment_types 1:N payments (RESTRICT DELETE)  
    • payments 1:N payment_transactions (CASCADE DELETE)
    • members 1:N payments (EXTERNAL REFERENCE)
```

## Triggers and Functions

### 1. Invoice Number Generator

The function `generate_invoice_number()` automatically creates a unique invoice number in the format `INV-YYYY-NNNNN` for new payments:

```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  next_invoice_num INTEGER;
  invoice_prefix TEXT := 'INV';
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Find the highest invoice number for the current year
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 9) AS INTEGER)), 0)
  INTO next_invoice_num
  FROM payments
  WHERE invoice_number LIKE invoice_prefix || '-' || year_prefix || '-%';
  
  -- Increment and format
  next_invoice_num := next_invoice_num + 1;
  
  -- Set the invoice number in the format INV-YYYY-NNNNN
  NEW.invoice_number := invoice_prefix || '-' || year_prefix || '-' || LPAD(next_invoice_num::TEXT, 5, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON payments
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();
```

### 2. Payment Status Updater

The function `update_payment_status()` updates the payment status based on transaction status changes:

```sql
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If the transaction is successful, update the payment status to 'completed'
  IF NEW.transaction_status = 'success' THEN
    UPDATE payments
    SET payment_status = 'completed', updated_at = NOW()
    WHERE payment_id = NEW.payment_id;
  -- If the transaction failed, update the payment status to 'failed'
  ELSIF NEW.transaction_status = 'failed' THEN
    UPDATE payments
    SET payment_status = 'failed', updated_at = NOW()
    WHERE payment_id = NEW.payment_id;
  -- If transaction is pending, ensure payment status is 'pending'
  ELSIF NEW.transaction_status = 'pending' THEN
    UPDATE payments
    SET payment_status = 'pending', updated_at = NOW()
    WHERE payment_id = NEW.payment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_payment_status
  AFTER INSERT OR UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_status();
```

## Data Types and Constraints

### String Types
- **VARCHAR(20-255)**: Used for constrained text fields with length validation
- **TEXT**: Used for unlimited text content (descriptions, gateway responses)

### Numeric Types
- **SERIAL**: Auto-incrementing 32-bit integers for primary keys
- **INTEGER**: Standard 32-bit integers for foreign keys
- **DECIMAL(10,2)**: Fixed-point decimal for monetary values (amount)

### Date and Time Types
- **TIMESTAMPTZ**: For full timestamp with timezone (all timestamp fields)

### Boolean Types
- **BOOLEAN**: For binary flags (is_active)

### Constraints Summary
- **Primary Keys**: All tables have auto-incrementing primary keys
- **Foreign Keys**: Properly defined with appropriate cascade behaviors
- **Unique Constraints**: Invoice numbers, payment type names
- **NOT NULL**: Applied to essential fields
- **CHECK Constraints**: Positive payment amounts
- **Default Values**: Status fields, boolean flags, timestamps

## Field Validation Rules

### Payment Validation
- **member_id**: Required, must reference existing member
- **amount**: Required, must be positive (> 0)
- **payment_date**: Required, cannot be in the future
- **payment_method**: Required, must be one of: 'credit_card', 'debit_card', 'cash', 'bank_transfer', 'online'
- **payment_status**: Must be one of: 'pending', 'completed', 'failed', 'refunded'
- **invoice_number**: Auto-generated, unique format INV-YYYY-NNNNN
- **payment_type_id**: Required, must reference existing payment type

### Payment Type Validation
- **type_name**: Required, unique, 1-50 characters
- **description**: Optional, maximum 255 characters
- **is_active**: Boolean flag for availability

### Payment Transaction Validation
- **payment_id**: Required, must reference existing payment
- **transaction_date**: Required, should be close to current time
- **transaction_status**: Required, must be one of: 'pending', 'success', 'failed', 'timeout'
- **transaction_reference**: Optional, external gateway reference
- **gateway_response**: Optional, complete response from payment gateway

## Auto-Generated Fields

### Timestamps
- **created_at**: Automatically set on record creation using `autoCreateTime`
- **updated_at**: Automatically updated on record modification using `autoUpdateTime`

### Primary Keys
- **payment_id**: Auto-incrementing SERIAL starting from 1
- **payment_type_id**: Auto-incrementing SERIAL starting from 1
- **transaction_id**: Auto-incrementing SERIAL starting from 1

### Generated Values
- **invoice_number**: Auto-generated using trigger function in format INV-YYYY-NNNNN
- **payment_status**: Automatically updated based on transaction status changes

### Default Values
- **payment_types.is_active**: Defaults to true
- **payments.payment_status**: Defaults to 'pending'

## Migration Strategy

### Database Initialization
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create custom functions
\i functions/generate_invoice_number.sql
\i functions/update_payment_status.sql
```

### Migration Order
1. **payment_types** (independent table)
2. **payments** (depends on payment_types)
3. **payment_transactions** (depends on payments)
4. **Create triggers and functions**

### Index Creation Strategy
```sql
-- Performance indexes created after data migration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_date_status ON payments(payment_date, payment_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_method_type ON payments(payment_method, payment_type_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_date_status ON payment_transactions(transaction_date, transaction_status);
```

### Data Migration Considerations
- **Payment Type Setup**: Initialize common payment types (cash, credit_card, etc.)
- **Historical Data**: Preserve existing payment records with correct timestamps
- **Invoice Numbers**: Generate invoice numbers for existing payments
- **Transaction Data**: Import gateway transaction data with proper status mapping
- **Foreign Key Validation**: Ensure member_id references exist in member service

### Rollback Strategy
- Maintain migration version tracking through GORM
- Keep backup copies of financial data before major schema changes
- Test rollback procedures in staging environment with transaction data
- Document trigger and function dependencies for proper rollback order

### Performance Optimization
- Regular `ANALYZE` on high-traffic tables (payments, payment_transactions)
- Monitor query performance with `EXPLAIN ANALYZE`
- Consider partitioning for payments by date if volume grows significantly
- Implement connection pooling for high-concurrency payment processing
- Index optimization for payment reporting queries

