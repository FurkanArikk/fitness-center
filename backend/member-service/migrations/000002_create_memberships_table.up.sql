CREATE TABLE IF NOT EXISTS memberships (
  membership_id SERIAL PRIMARY KEY,
  membership_name VARCHAR(50) UNIQUE,
  description VARCHAR(200),
  duration INTEGER, -- in months
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memberships_active ON memberships(is_active);
COMMENT ON COLUMN memberships.duration IS 'in months';