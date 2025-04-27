-- Clean sample data
TRUNCATE TABLE payment_transactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;

-- Reset payment_types to defaults only
DELETE FROM payment_types WHERE payment_type_id > 5;
