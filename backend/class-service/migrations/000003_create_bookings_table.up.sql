CREATE TABLE IF NOT EXISTS class_bookings (
  booking_id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  attendance_status VARCHAR(20) DEFAULT 'booked',
  feedback_rating INTEGER,
  feedback_comment VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_schedule FOREIGN KEY (schedule_id) REFERENCES class_schedule (schedule_id) ON DELETE CASCADE,
  CONSTRAINT unique_booking UNIQUE (schedule_id, member_id)
  -- member_id Foreign Key is not enforced as it's in a different service
);

CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id ON class_bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_member_id ON class_bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON class_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON class_bookings(attendance_status);