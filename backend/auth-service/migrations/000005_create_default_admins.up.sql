-- Create default admin users table structure is already available
-- This migration ensures we have a clean starting point for admin user creation
-- No users are pre-created, all admins must register via API

-- Ensure system_config table has default max admin count
INSERT INTO system_config (config_key, config_value, created_at, updated_at) 
VALUES ('max_admin_count', '3', NOW(), NOW())
ON CONFLICT (config_key) DO UPDATE SET 
    config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- Ensure clean state - no pre-created users
-- All admin users must be created through registration endpoint
