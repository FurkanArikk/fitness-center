-- Remove any default admin users that might have been created
-- This migration removes users that were created through the registration system
DELETE FROM users WHERE role = 'admin';

-- Reset the auto-increment sequence if needed
-- SELECT setval('users_id_seq', 1, false);
