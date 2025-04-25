-- This script drops all tables in the fitness_class_db database
DROP TABLE IF EXISTS class_bookings CASCADE;
DROP TABLE IF EXISTS class_schedule CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

-- Drop any indexes that might cause conflicts
DROP INDEX IF EXISTS idx_class_name;
DROP INDEX IF EXISTS idx_class_schedule_class_id;
DROP INDEX IF EXISTS idx_class_schedule_trainer_id;
DROP INDEX IF EXISTS idx_class_bookings_schedule_id;
DROP INDEX IF EXISTS idx_class_bookings_member_id;
DROP INDEX IF EXISTS idx_unique_booking;
DROP INDEX IF EXISTS idx_bookings_date;
