-- Members table
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Memberships table
CREATE TABLE memberships (
    membership_id SERIAL PRIMARY KEY,
    membership_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in months
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Member-Membership relationships
CREATE TABLE member_memberships (
    member_membership_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id),
    membership_id INTEGER NOT NULL REFERENCES memberships(membership_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    contract_signed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Membership benefits
CREATE TABLE membership_benefits (
    benefit_id SERIAL PRIMARY KEY,
    membership_id INTEGER NOT NULL REFERENCES memberships(membership_id),
    benefit_name VARCHAR(100) NOT NULL,
    benefit_description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Fitness assessments
CREATE TABLE fitness_assessments (
    assessment_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id),
    trainer_id INTEGER NOT NULL,
    assessment_date DATE NOT NULL,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    bmi DECIMAL(5,2),
    notes TEXT,
    goals_set TEXT,
    next_assessment_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_member_memberships_member_id ON member_memberships(member_id);
CREATE INDEX idx_member_memberships_membership_id ON member_memberships(membership_id);
CREATE INDEX idx_membership_benefits_membership_id ON membership_benefits(membership_id);
CREATE INDEX idx_fitness_assessments_member_id ON fitness_assessments(member_id);
