CREATE TABLE IF NOT EXISTS trainers (
  trainer_id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL UNIQUE,
  specialization VARCHAR(100),
  certification VARCHAR(100),
  experience INTEGER, -- in years
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trainers_specialization ON trainers(specialization);
CREATE INDEX IF NOT EXISTS idx_trainers_rating ON trainers(rating);

COMMENT ON COLUMN trainers.experience IS 'in years';