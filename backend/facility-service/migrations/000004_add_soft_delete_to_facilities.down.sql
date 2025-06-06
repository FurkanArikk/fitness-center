-- Revert the is_deleted column addition
DROP INDEX IF EXISTS idx_facilities_is_deleted;
ALTER TABLE facilities DROP COLUMN IF EXISTS is_deleted;
