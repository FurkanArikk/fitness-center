-- Create system configuration table for user limits and other settings
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default max user limit (set to 50 users as default)
INSERT INTO system_config (config_key, config_value, description) VALUES
('max_users', '50', 'Maximum number of users allowed in the system'),
('max_admins', '3', 'Maximum number of admin users allowed in the system')
ON CONFLICT (config_key) DO NOTHING;

-- Create index for faster config lookups
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
