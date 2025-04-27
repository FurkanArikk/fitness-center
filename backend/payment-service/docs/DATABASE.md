# Payment Service Database Schema

The Payment Service uses PostgreSQL as its database. Below is the detailed schema for the tables used in this service.

## Tables

### payments

This table stores information about payments made by members.

| Column          | Type                     | Description                                   |
|-----------------|--------------------------|-----------------------------------------------|
| payment_id      | SERIAL                   | Primary key                                   |
| member_id       | INTEGER                  | Reference to member ID (in member-service)    |
| amount          | DECIMAL(10,2)            | Payment amount                                |
| payment_date    | TIMESTAMP WITH TIME ZONE | Date and time of payment                      |
| payment_method  | VARCHAR(50)              | Method of payment (credit_card, cash, etc.)   |
| payment_status  | VARCHAR(20)              | Status of payment (pending, completed, failed)|
| invoice_number  | VARCHAR(50)              | Unique invoice number                         |
| description     | TEXT                     | Payment description                           |
| payment_type_id | INTEGER                  | Reference to payment_types table              |
| created_at      | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at      | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `payment_id`
- UNIQUE on `invoice_number`
- Index on `member_id`
- Index on `payment_date`
- Index on `payment_status`
- Index on `payment_method`
- Index on `payment_type_id`

**Constraints:**
- CHECK `positive_payment_amount` on `amount > 0`

### payment_types

This table stores information about different types of payments accepted.

| Column          | Type                     | Description                                   |
|-----------------|--------------------------|-----------------------------------------------|
| payment_type_id | SERIAL                   | Primary key                                   |
| type_name       | VARCHAR(50)              | Name of the payment type                      |
| description     | VARCHAR(255)             | Description of the payment type               |
| is_active       | BOOLEAN                  | Whether this payment type is currently active |
| created_at      | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at      | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Indexes:**
- PRIMARY KEY on `payment_type_id`
- UNIQUE on `type_name`
- Index on `is_active`

### payment_transactions

This table stores information about payment processing transactions.

| Column                | Type                     | Description                                   |
|-----------------------|--------------------------|-----------------------------------------------|
| transaction_id        | SERIAL                   | Primary key                                   |
| payment_id            | INTEGER                  | Reference to payments table                   |
| transaction_date      | TIMESTAMP WITH TIME ZONE | Date and time of transaction                  |
| transaction_status    | VARCHAR(50)              | Status of transaction (success, failed, etc.) |
| transaction_reference | VARCHAR(100)             | External reference number                     |
| gateway_response      | TEXT                     | Complete response from payment gateway        |
| created_at            | TIMESTAMP WITH TIME ZONE | Record creation timestamp                     |
| updated_at            | TIMESTAMP WITH TIME ZONE | Record last update timestamp                  |

**Constraints:**
- PRIMARY KEY on `transaction_id`
- FOREIGN KEY on `payment_id` REFERENCES `payments(payment_id)` ON DELETE CASCADE

**Indexes:**
- Index on `payment_id`
- Index on `transaction_date`
- Index on `transaction_status`
- Index on `transaction_reference`

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
```

## Relationships

1. A **Payment** can have multiple **Transactions** (one-to-many)
2. A **Payment Type** can be associated with multiple **Payments** (one-to-many)
3. A **Member** (external) can have multiple **Payments** (one-to-many)

## Entity-Relationship Diagram

