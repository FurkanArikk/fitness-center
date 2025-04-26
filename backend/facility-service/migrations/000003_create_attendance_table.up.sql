CREATE TABLE IF NOT EXISTS attendance (
  attendance_id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL,
  facility_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (facility_id) REFERENCES facilities (facility_id) ON DELETE RESTRICT
  -- member_id Foreign Key is not enforced as it's in a different service
);

CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_facility_id ON attendance(facility_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance(check_in_time);

-- Add a trigger to automatically set date based on check_in_time
CREATE OR REPLACE FUNCTION set_attendance_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date := DATE(NEW.check_in_time);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_attendance_date
BEFORE INSERT ON attendance
FOR EACH ROW
EXECUTE FUNCTION set_attendance_date();