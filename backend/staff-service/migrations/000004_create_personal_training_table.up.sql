CREATE TABLE IF NOT EXISTS personal_training (
  session_id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  trainer_id INTEGER NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes VARCHAR(255),
  status VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (trainer_id) REFERENCES trainers (trainer_id) ON DELETE RESTRICT,
  -- member_id Foreign Key is not enforced as it's in a different service
  CONSTRAINT unique_training_session UNIQUE (trainer_id, session_date, start_time),
  CONSTRAINT check_time_valid CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_personal_training_trainer_id ON personal_training(trainer_id);
CREATE INDEX IF NOT EXISTS idx_personal_training_member_id ON personal_training(member_id);
CREATE INDEX IF NOT EXISTS idx_personal_training_date ON personal_training(session_date);
CREATE INDEX IF NOT EXISTS idx_personal_training_status ON personal_training(status);