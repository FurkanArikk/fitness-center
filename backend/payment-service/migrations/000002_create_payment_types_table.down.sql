ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payment_type;
DROP INDEX IF EXISTS idx_payment_types_active;
DROP INDEX IF EXISTS idx_payment_types_name;
DROP TABLE IF EXISTS payment_types;