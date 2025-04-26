ALTER TABLE facilities DROP CONSTRAINT IF EXISTS unique_facility_name;
DROP INDEX IF EXISTS idx_facilities_name;
DROP INDEX IF EXISTS idx_facilities_status;
DROP TABLE IF EXISTS facilities;