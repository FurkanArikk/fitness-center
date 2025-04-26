-- This script drops all tables in the fitness_facility_db database
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;

-- Drop any indexes that might cause conflicts
DROP INDEX IF EXISTS idx_equipment_category;
DROP INDEX IF EXISTS idx_equipment_status;
DROP INDEX IF EXISTS idx_equipment_maintenance;
DROP INDEX IF EXISTS idx_facilities_status;
DROP INDEX IF EXISTS idx_facilities_name;
DROP INDEX IF EXISTS idx_attendance_member_id;
DROP INDEX IF EXISTS idx_attendance_facility_id;
DROP INDEX IF EXISTS idx_attendance_date;
DROP INDEX IF EXISTS idx_attendance_check_in;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS trg_set_attendance_date ON attendance;
DROP FUNCTION IF EXISTS set_attendance_date();
