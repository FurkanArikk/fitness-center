CREATE TABLE IF NOT EXISTS membership_benefits (
  benefit_id SERIAL PRIMARY KEY,
  membership_id INTEGER NOT NULL,
  benefit_name VARCHAR(100) NOT NULL,
  benefit_description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (membership_id) REFERENCES memberships (membership_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_benefits_membership_id ON membership_benefits(membership_id);