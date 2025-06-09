-- Sample data for payment_types
-- Already exists in initial schema, so only insert if not exists
INSERT INTO payment_types (type_name, description, is_active, created_at, updated_at)
VALUES
    ('Additional Fee', 'Extra charges for special services', true, NOW(), NOW()),
    ('Late Payment Fee', 'Fees for overdue payments', true, NOW(), NOW())
ON CONFLICT (type_name) DO NOTHING;

-- Sample data for payments
INSERT INTO payments (
    member_id, amount, payment_date, payment_method, payment_status, 
    description, payment_type_id, created_at, updated_at
)
VALUES
    (1, 99.99, '2023-07-01T10:00:00Z', 'credit_card', 'completed', 'Monthly membership fee', 1, '2023-07-01T10:00:00Z', '2023-07-01T10:00:00Z'),
    (2, 149.99, '2023-07-02T11:30:00Z', 'debit_card', 'completed', 'Premium membership fee', 1, '2023-07-02T11:30:00Z', '2023-07-02T11:30:00Z'),
    (3, 50.00, '2023-07-03T09:15:00Z', 'cash', 'completed', 'Personal training session', 2, '2023-07-03T09:15:00Z', '2023-07-03T09:15:00Z'),
    (4, 25.99, '2023-07-04T14:45:00Z', 'credit_card', 'completed', 'Yoga class', 3, '2023-07-04T14:45:00Z', '2023-07-04T14:45:00Z'),
    (5, 35.50, '2023-07-05T16:30:00Z', 'credit_card', 'completed', 'Protein powder purchase', 4, '2023-07-05T16:30:00Z', '2023-07-05T16:30:00Z');

-- Sample data for payment_transactions (insert only after payments are created)
INSERT INTO payment_transactions (
    payment_id, transaction_date, transaction_status, transaction_reference, 
    gateway_response, created_at, updated_at
)
SELECT 
    p.payment_id,
    p.payment_date + interval '1 minute',
    'success',
    'TXN' || (p.payment_id * 123456789),
    '{"processor":"' || 
        CASE WHEN p.payment_method = 'credit_card' THEN 'Stripe' 
             WHEN p.payment_method = 'debit_card' THEN 'PayPal'
             ELSE 'Cash' END || 
    '","status":"succeeded","auth_code":"AUTH' || p.payment_id || '"}',
    p.created_at + interval '2 minutes',
    p.updated_at + interval '2 minutes'
FROM payments p
WHERE p.payment_status = 'completed';
