CREATE TABLE IF NOT EXISTS fitness_assessments (
  assessment_id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  trainer_id INTEGER NOT NULL,
  assessment_date DATE NOT NULL,
  height DECIMAL(5,2), -- in cm
  weight DECIMAL(5,2), -- in kg
  body_fat_percentage DECIMAL(5,2),
  bmi DECIMAL(4,2),
  notes VARCHAR(255),
  goals_set VARCHAR(255),
  next_assessment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (member_id) REFERENCES members (member_id) ON DELETE CASCADE
  -- Trainer FK not enforced here as it's in a different service
);

CREATE INDEX IF NOT EXISTS idx_assessments_member_id ON fitness_assessments(member_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON fitness_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_assessments_trainer_id ON fitness_assessments(trainer_id);