CREATE TABLE IF NOT EXISTS equipment (
  equipment_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  manufacturer VARCHAR(100),
  model_number VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance ON equipment(next_maintenance_date);