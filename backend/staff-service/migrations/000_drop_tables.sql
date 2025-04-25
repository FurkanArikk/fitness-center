-- This script drops all tables in the fitness_staff_db database
DROP TABLE IF EXISTS personal_training CASCADE;
DROP TABLE IF EXISTS trainers CASCADE;
DROP TABLE IF EXISTS staff_qualifications CASCADE;
DROP TABLE IF EXISTS staff CASCADE;

-- Drop any indexes that might cause conflicts
DROP INDEX IF EXISTS idx_staff_email;
DROP INDEX IF EXISTS idx_qualification_staff;
DROP INDEX IF EXISTS idx_trainer_staff;
DROP INDEX IF EXISTS idx_training_trainer;
DROP INDEX IF EXISTS idx_training_member;
DROP INDEX IF EXISTS idx_training_date;
DROP INDEX IF EXISTS idx_trainer_rating;
