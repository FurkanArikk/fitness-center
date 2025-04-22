-- Add sample memberships
INSERT INTO memberships (membership_name, description, duration, price, is_active) VALUES
('Basic', 'Access to gym facilities during standard hours', 1, 29.99, true),
('Premium', 'Full access to gym facilities and group classes', 3, 49.99, true),
('Gold', 'All facilities, classes, and personal trainer sessions', 6, 89.99, true),
('Platinum', 'VIP access to all facilities and services', 12, 149.99, true);

-- Add membership benefits
INSERT INTO membership_benefits (membership_id, benefit_name, benefit_description) VALUES
(1, 'Gym Access', 'Basic access to gym equipment during standard hours'),
(2, 'Gym Access', 'Full access to gym equipment 24/7'),
(2, 'Group Classes', 'Access to all group fitness classes'),
(3, 'Gym Access', 'Full access to gym equipment 24/7'),
(3, 'Group Classes', 'Access to all group fitness classes'),
(3, 'Personal Training', '2 personal training sessions per month'),
(4, 'Gym Access', 'VIP access to gym equipment 24/7'),
(4, 'Group Classes', 'Priority booking for all fitness classes'),
(4, 'Personal Training', '4 personal training sessions per month'),
(4, 'Spa Access', 'Complimentary access to spa facilities');

-- Add sample members
INSERT INTO members (first_name, last_name, email, phone, address, date_of_birth, emergency_contact_name, emergency_contact_phone, join_date, status)
VALUES
('John', 'Doe', 'john.doe@example.com', '555-123-4567', '123 Main St, Anytown, AN 12345', '1985-06-15', 'Jane Doe', '555-123-7890', '2023-01-10', 'active'),
('Jane', 'Smith', 'jane.smith@example.com', '555-234-5678', '456 Oak Ave, Someville, SV 67890', '1990-03-22', 'John Smith', '555-234-8901', '2023-02-15', 'active'),
('Michael', 'Johnson', 'michael.j@example.com', '555-345-6789', '789 Pine Rd, Othertown, OT 45678', '1982-11-08', 'Sarah Johnson', '555-345-9012', '2023-03-20', 'active'),
('Emily', 'Davis', 'emily.davis@example.com', '555-456-7890', '101 Cedar Ln, Newcity, NC 23456', '1995-09-17', 'Robert Davis', '555-456-0123', '2023-04-05', 'active'),
('David', 'Wilson', 'david.wilson@example.com', '555-567-8901', '202 Elm St, Oldtown, OT 34567', '1988-07-30', 'Maria Wilson', '555-567-1234', '2023-05-12', 'on_hold');

-- Add member-membership relationships
INSERT INTO member_memberships (member_id, membership_id, start_date, end_date, payment_status, contract_signed)
VALUES
(1, 3, '2023-01-10', '2023-07-10', 'paid', true),       -- John Doe with Gold (6 months)
(2, 2, '2023-02-15', '2023-05-15', 'paid', true),       -- Jane Smith with Premium (3 months)
(3, 4, '2023-03-20', '2024-03-20', 'paid', true),       -- Michael Johnson with Platinum (12 months)
(4, 2, '2023-04-05', '2023-07-05', 'paid', true),       -- Emily Davis with Premium (3 months)
(5, 1, '2023-05-12', '2023-06-12', 'unpaid', true),     -- David Wilson with Basic (1 month)
(2, 3, '2023-05-20', '2023-11-20', 'paid', true);       -- Jane Smith renewed with Gold (6 months)

-- Add fitness assessments
INSERT INTO fitness_assessments (member_id, trainer_id, assessment_date, height, weight, body_fat_percentage, bmi, notes, goals_set, next_assessment_date)
VALUES
(1, 101, '2023-01-15', 180.5, 85.2, 22.5, 26.2, 'Initial assessment. Good overall fitness but needs work on flexibility.', 'Improve flexibility and lose 5kg', '2023-02-15'),
(1, 101, '2023-02-15', 180.5, 83.7, 21.8, 25.7, 'Progress made on weight loss goal.', 'Continue weight loss, start strength training', '2023-03-15'),
(1, 101, '2023-03-15', 180.5, 81.9, 20.9, 25.1, 'Consistent improvement in all areas.', 'Maintain progress, increase cardio', '2023-04-15'),
(2, 102, '2023-02-20', 165.0, 62.5, 24.0, 23.0, 'Good cardiovascular fitness, needs strength work.', 'Build upper body strength, maintain weight', '2023-03-20'),
(2, 102, '2023-03-20', 165.0, 63.0, 23.5, 23.1, 'Improvement in strength metrics.', 'Continue strength training, add HIIT workouts', '2023-04-20'),
(3, 103, '2023-03-25', 190.0, 95.6, 18.5, 26.5, 'Strong but needs cardio improvement.', 'Improve endurance, maintain muscle mass', '2023-04-25'),
(4, 102, '2023-04-10', 170.0, 65.8, 26.0, 22.8, 'Good overall balance but needs more consistency.', 'Establish consistent workout routine, improve core strength', '2023-05-10'),
(5, 101, '2023-05-15', 175.0, 89.4, 28.5, 29.2, 'Needs significant improvement in all areas.', 'Focus on weight loss and basic fitness foundation', '2023-06-15');
