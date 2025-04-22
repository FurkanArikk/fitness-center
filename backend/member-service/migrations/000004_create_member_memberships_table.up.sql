CREATE TABLE IF NOT EXISTS member_memberships (
  member_membership_id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  membership_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_status VARCHAR(20),
  contract_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (member_id) REFERENCES members (member_id) ON DELETE CASCADE,
  FOREIGN KEY (membership_id) REFERENCES memberships (membership_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_member_memberships_member_id ON member_memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_member_memberships_membership_id ON member_memberships(membership_id);
CREATE INDEX IF NOT EXISTS idx_member_memberships_dates ON member_memberships(start_date, end_date);