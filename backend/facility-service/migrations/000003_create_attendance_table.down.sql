DROP TRIGGER IF EXISTS trg_set_attendance_date ON attendance;
DROP FUNCTION IF EXISTS set_attendance_date();
DROP INDEX IF EXISTS idx_attendance_check_in;
DROP INDEX IF EXISTS idx_attendance_date;
DROP INDEX IF EXISTS idx_attendance_facility_id;
DROP INDEX IF EXISTS idx_attendance_member_id;
DROP TABLE IF EXISTS attendance;