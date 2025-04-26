-- This script drops all tables in the fitness_member_db database
DROP TABLE IF EXISTS fitness_assessments CASCADE;
DROP TABLE IF EXISTS membership_benefits CASCADE;
DROP TABLE IF EXISTS member_memberships CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Drop any indexes that might cause conflicts
DROP INDEX IF EXISTS idx_members_email;
DROP INDEX IF EXISTS idx_member_memberships_member_id;
DROP INDEX IF EXISTS idx_member_memberships_membership_id;
DROP INDEX IF EXISTS idx_membership_benefits_membership_id;
DROP INDEX IF EXISTS idx_fitness_assessments_member_id;
DROP INDEX IF EXISTS idx_member_memberships_dates;
DROP INDEX IF EXISTS idx_assessments_date;
DROP INDEX IF EXISTS idx_assessments_trainer_id;
DROP INDEX IF EXISTS idx_benefits_membership_id;
DROP INDEX IF EXISTS idx_memberships_active;
