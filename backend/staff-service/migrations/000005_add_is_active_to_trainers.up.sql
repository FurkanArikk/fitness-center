-- Add is_active column to trainers table
ALTER TABLE trainers ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_trainers_is_active ON trainers(is_active);

-- Update existing records to set is_active to true
UPDATE trainers SET is_active = TRUE WHERE is_active IS NULL;
