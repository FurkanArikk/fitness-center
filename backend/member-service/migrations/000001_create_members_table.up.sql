CREATE TABLE IF NOT EXISTS members (
  member_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(200),
  date_of_birth DATE,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  join_date DATE,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);