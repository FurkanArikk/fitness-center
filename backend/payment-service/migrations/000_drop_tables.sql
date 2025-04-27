-- This script drops all tables in the payment service database
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_types CASCADE;

-- Drop any indexes that might cause conflicts
DROP INDEX IF EXISTS idx_transactions_payment_id;
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_status;
DROP INDEX IF EXISTS idx_transactions_reference;
DROP INDEX IF EXISTS idx_payments_member_id;
DROP INDEX IF EXISTS idx_payments_payment_date;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_invoice;
DROP INDEX IF EXISTS idx_payments_method;
DROP INDEX IF EXISTS idx_payments_type;
DROP INDEX IF EXISTS idx_payment_types_name;
DROP INDEX IF EXISTS idx_payment_types_active;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS trg_generate_invoice_number ON payments;
DROP FUNCTION IF EXISTS generate_invoice_number();
DROP TRIGGER IF EXISTS trg_update_payment_status ON payment_transactions;
DROP FUNCTION IF EXISTS update_payment_status();
