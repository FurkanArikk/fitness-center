CREATE TABLE IF NOT EXISTS class_schedule (
  schedule_id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL,
  trainer_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_class FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE RESTRICT,
  CONSTRAINT unique_schedule UNIQUE (class_id, trainer_id, room_id, start_time, day_of_week)
  -- trainer_id and room_id Foreign Keys are not enforced as they're in different services
);

CREATE INDEX IF NOT EXISTS idx_schedule_class_id ON class_schedule(class_id);
CREATE INDEX IF NOT EXISTS idx_schedule_trainer_id ON class_schedule(trainer_id);
CREATE INDEX IF NOT EXISTS idx_schedule_room_id ON class_schedule(room_id);
CREATE INDEX IF NOT EXISTS idx_schedule_day_time ON class_schedule(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_status ON class_schedule(status);