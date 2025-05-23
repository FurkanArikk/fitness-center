-- Add is_deleted column to facilities table
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for faster queries on is_deleted
CREATE INDEX IF NOT EXISTS idx_facilities_is_deleted ON facilities(is_deleted);

-- Update all existing facilities to set is_deleted = false
UPDATE facilities SET is_deleted = FALSE WHERE is_deleted IS NULL;
