CREATE TABLE IF NOT EXISTS payment_types (
  payment_type_id SERIAL PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_types_name ON payment_types(type_name);
CREATE INDEX IF NOT EXISTS idx_payment_types_active ON payment_types(is_active);

-- Add foreign key reference from payments table
ALTER TABLE payments 
  ADD CONSTRAINT fk_payment_type 
  FOREIGN KEY (payment_type_id) 
  REFERENCES payment_types(payment_type_id) 
  ON DELETE SET NULL;

-- Insert default payment types
INSERT INTO payment_types (type_name, description, is_active) VALUES
('Membership Fee', 'Regular membership subscription payment', TRUE),
('Personal Training', 'Payment for personal training sessions', TRUE),
('Class Registration', 'Payment for fitness classes', TRUE),
('Merchandise', 'Payment for gym merchandise and products', TRUE),
('Facility Rental', 'Payment for facility or equipment rental', TRUE);