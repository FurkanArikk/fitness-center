CREATE TABLE IF NOT EXISTS staff_qualifications (
  qualification_id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL,
  qualification_name VARCHAR(100) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE CASCADE,
  CONSTRAINT unique_staff_qualification UNIQUE (staff_id, qualification_name, issuing_authority)
);

CREATE INDEX IF NOT EXISTS idx_qualifications_staff_id ON staff_qualifications(staff_id);
CREATE INDEX IF NOT EXISTS idx_qualifications_expiry ON staff_qualifications(expiry_date);