-- Remove is_active column from trainers table
DROP INDEX IF EXISTS idx_trainers_is_active;
ALTER TABLE trainers DROP COLUMN IF EXISTS is_active;
