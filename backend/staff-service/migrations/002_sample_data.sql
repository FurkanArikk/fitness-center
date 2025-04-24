-- Sample data for staff service tables

-- First, clear existing data to prevent duplicates
TRUNCATE personal_training CASCADE;
TRUNCATE trainers CASCADE;
TRUNCATE staff_qualifications CASCADE;
TRUNCATE staff CASCADE;

-- Reset sequences
ALTER SEQUENCE staff_staff_id_seq RESTART WITH 1;
ALTER SEQUENCE staff_qualifications_qualification_id_seq RESTART WITH 1;
ALTER SEQUENCE trainers_trainer_id_seq RESTART WITH 1;
ALTER SEQUENCE personal_training_session_id_seq RESTART WITH 1;

-- Add sample staff records
INSERT INTO staff (first_name, last_name, email, phone, address, position, hire_date, salary, status) 
VALUES
('John', 'Smith', 'john.smith@fitness.com', '+1-555-1234', '123 Main St, New York, NY', 'Manager', '2020-01-15', 65000.00, 'Active'),
('Sarah', 'Johnson', 'sarah.johnson@fitness.com', '+1-555-2345', '456 Elm St, Los Angeles, CA', 'Trainer', '2020-03-20', 45000.00, 'Active'),
('Michael', 'Williams', 'michael.williams@fitness.com', '+1-555-3456', '789 Oak St, Chicago, IL', 'Trainer', '2020-05-10', 42000.00, 'Active'),
('Emily', 'Brown', 'emily.brown@fitness.com', '+1-555-4567', '321 Pine St, Miami, FL', 'Receptionist', '2021-01-05', 35000.00, 'Active'),
('David', 'Jones', 'david.jones@fitness.com', '+1-555-5678', '654 Maple St, Seattle, WA', 'Trainer', '2021-02-15', 43000.00, 'Active'),
('Jessica', 'Miller', 'jessica.miller@fitness.com', '+1-555-6789', '987 Cedar St, Boston, MA', 'Nutritionist', '2021-04-20', 48000.00, 'Active'),
('Robert', 'Davis', 'robert.davis@fitness.com', '+1-555-7890', '741 Birch St, Austin, TX', 'Trainer', '2021-07-12', 44000.00, 'Active'),
('Jennifer', 'Garcia', 'jennifer.garcia@fitness.com', '+1-555-8901', '852 Walnut St, Denver, CO', 'Trainer', '2022-01-10', 41000.00, 'Active'),
('William', 'Rodriguez', 'william.rodriguez@fitness.com', '+1-555-9012', '963 Spruce St, Portland, OR', 'Maintenance', '2022-03-05', 38000.00, 'Active'),
('Lisa', 'Martinez', 'lisa.martinez@fitness.com', '+1-555-0123', '159 Redwood St, San Diego, CA', 'Assistant Manager', '2022-05-18', 52000.00, 'Active')
ON CONFLICT (email) DO NOTHING;

-- Add sample staff qualifications
INSERT INTO staff_qualifications (staff_id, qualification_name, issue_date, expiry_date, issuing_authority) 
VALUES
(1, 'Business Management Certificate', '2018-05-10', '2024-05-10', 'Business Management Institute'),
(2, 'Personal Trainer Certification', '2019-05-15', '2023-05-15', 'National Academy of Sports Medicine'),
(2, 'First Aid & CPR', '2020-01-10', '2022-01-10', 'American Red Cross'),
(3, 'Certified Strength and Conditioning Specialist', '2019-08-22', '2023-08-22', 'National Strength and Conditioning Association'),
(4, 'Office Administration Certificate', '2020-11-15', '2024-11-15', 'Administrative Professionals Association'),
(5, 'Yoga Instructor Certification', '2020-06-30', '2024-06-30', 'Yoga Alliance'),
(6, 'Registered Dietitian', '2018-06-20', '2023-06-20', 'Commission on Dietetic Registration'),
(7, 'CrossFit Level 1 Trainer', '2020-04-18', '2024-04-18', 'CrossFit Inc.'),
(8, 'Group Exercise Instructor', '2021-09-12', '2025-09-12', 'American Council on Exercise'),
(10, 'Facility Management Certificate', '2021-02-25', '2025-02-25', 'Facility Management Association');

-- Add sample trainers
INSERT INTO trainers (staff_id, specialization, certification, experience, rating) 
VALUES
(2, 'Weight Loss', 'NASM Certified Personal Trainer', 5, 4.7),
(3, 'Strength Training', 'NSCA Strength and Conditioning', 7, 4.8),
(5, 'Yoga and Flexibility', 'Registered Yoga Teacher 200', 4, 4.5),
(6, 'Nutrition', 'Registered Dietitian Nutritionist', 8, 4.9),
(7, 'CrossFit', 'CrossFit Level 1 Trainer', 6, 4.6),
(8, 'Group Fitness', 'ACE Group Fitness Instructor', 3, 4.4),
(1, 'Executive Training', 'NASM Master Trainer', 10, 4.9),
(4, 'Senior Fitness', 'ACE Senior Fitness Specialist', 2, 4.2),
(9, 'Rehabilitation', 'NASM Corrective Exercise Specialist', 4, 4.4),
(10, 'Pilates', 'Pilates Method Alliance Certification', 5, 4.5)
ON CONFLICT (staff_id) DO NOTHING;

-- Add sample personal training sessions
INSERT INTO personal_training (member_id, trainer_id, session_date, start_time, end_time, notes, status, price) 
VALUES
(1, 1, '2023-07-10', '09:00:00', '10:00:00', 'Focus on cardio and core strength', 'Completed', 75.00),
(2, 2, '2023-07-10', '10:30:00', '11:30:00', 'Upper body workout', 'Completed', 80.00),
(3, 3, '2023-07-11', '14:00:00', '15:00:00', 'Yoga and flexibility session', 'Completed', 70.00),
(4, 4, '2023-07-12', '11:00:00', '12:00:00', 'Nutrition consultation', 'Completed', 85.00),
(5, 5, '2023-07-15', '16:30:00', '17:30:00', 'CrossFit introduction', 'Scheduled', 75.00),
(1, 6, '2023-07-17', '13:00:00', '14:00:00', 'Group HIIT session', 'Scheduled', 60.00),
(3, 7, '2023-07-18', '08:00:00', '09:00:00', 'Executive fitness program', 'Scheduled', 90.00),
(2, 8, '2023-07-18', '18:00:00', '19:00:00', 'Senior-focused mobility training', 'Scheduled', 65.00),
(4, 9, '2023-07-19', '10:00:00', '11:00:00', 'Post-injury assessment', 'Scheduled', 70.00),
(5, 10, '2023-07-20', '15:00:00', '16:00:00', 'Pilates core workout', 'Scheduled', 80.00);
