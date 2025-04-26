CREATE TABLE IF NOT EXISTS facilities (
  facility_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  capacity INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  opening_hour TIME NOT NULL,
  closing_hour TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(name);

-- Add constraint to ensure facility names are unique
ALTER TABLE facilities ADD CONSTRAINT unique_facility_name UNIQUE (name);