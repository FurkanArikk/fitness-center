CREATE TABLE IF NOT EXISTS classes (
  class_id SERIAL PRIMARY KEY,
  class_name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  duration INTEGER NOT NULL, -- in minutes
  capacity INTEGER NOT NULL,
  difficulty VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(class_name);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);
CREATE INDEX IF NOT EXISTS idx_classes_difficulty ON classes(difficulty);

COMMENT ON COLUMN classes.duration IS 'in minutes';