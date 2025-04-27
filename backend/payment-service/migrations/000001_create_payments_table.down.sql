-- Drop the trigger first
DROP TRIGGER IF EXISTS trg_generate_invoice_number ON payments;

-- Drop the function
DROP FUNCTION IF EXISTS generate_invoice_number();

-- Drop constraints
ALTER TABLE payments DROP CONSTRAINT IF EXISTS positive_payment_amount;

-- Drop indexes
DROP INDEX IF EXISTS idx_payments_method;
DROP INDEX IF EXISTS idx_payments_invoice;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_payment_type_id;
DROP INDEX IF EXISTS idx_payments_payment_status;
DROP INDEX IF EXISTS idx_payments_payment_date;
DROP INDEX IF EXISTS idx_payments_member_id;
DROP TABLE IF EXISTS payments;