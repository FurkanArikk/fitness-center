-- Sample data for class service tables

-- First, clear existing data to prevent duplicates
TRUNCATE classes CASCADE;
TRUNCATE class_schedule CASCADE;
TRUNCATE class_bookings CASCADE;

-- Reset sequences
ALTER SEQUENCE classes_class_id_seq RESTART WITH 1;
ALTER SEQUENCE class_schedule_schedule_id_seq RESTART WITH 1;
ALTER SEQUENCE class_bookings_booking_id_seq RESTART WITH 1;

-- Add sample classes
INSERT INTO classes (class_name, description, duration, capacity, difficulty, is_active) 
VALUES
('Yoga Flow', 'A flowing sequence of poses that synchronizes breath with movement', 60, 20, 'Beginner', true),
('HIIT', 'High-intensity interval training for maximum calorie burn', 45, 15, 'Advanced', true),
('Spin Class', 'Indoor cycling workout set to energizing music', 45, 25, 'Intermediate', true),
('Pilates', 'Core strengthening exercises focusing on posture and balance', 50, 15, 'Intermediate', true),
('Zumba', 'Dance fitness program featuring Latin and international music', 60, 25, 'Beginner', true),
('Body Pump', 'Weight-based strength training class', 55, 20, 'Intermediate', true),
('CrossFit', 'High-intensity functional movements', 60, 12, 'Advanced', true),
('Meditation', 'Guided meditation for stress reduction', 30, 15, 'Beginner', true),
('Boxing', 'Cardio workout based on boxing techniques', 60, 15, 'Intermediate', true),
('Seniors Fitness', 'Low-impact exercises for seniors', 45, 20, 'Beginner', true);

-- Add sample schedules
INSERT INTO class_schedule (class_id, trainer_id, room_id, start_time, end_time, day_of_week, status) 
VALUES
(1, 5, 1, '08:00:00', '09:00:00', 'Monday', 'active'),
(2, 2, 2, '18:30:00', '19:15:00', 'Monday', 'active'),
(3, 3, 3, '06:30:00', '07:15:00', 'Tuesday', 'active'),
(4, 6, 1, '19:00:00', '19:50:00', 'Tuesday', 'active'),
(5, 8, 2, '17:00:00', '18:00:00', 'Wednesday', 'active'),
(6, 7, 3, '19:30:00', '20:25:00', 'Wednesday', 'active'),
(7, 2, 2, '18:00:00', '19:00:00', 'Thursday', 'active'),
(8, 10, 1, '12:00:00', '12:30:00', 'Thursday', 'active'),
(9, 3, 3, '19:00:00', '20:00:00', 'Friday', 'active'),
(10, 4, 1, '10:00:00', '10:45:00', 'Friday', 'active'),
(1, 5, 2, '09:00:00', '10:00:00', 'Saturday', 'active'),
(5, 8, 3, '10:30:00', '11:30:00', 'Saturday', 'active'),
(4, 6, 1, '11:00:00', '11:50:00', 'Sunday', 'active'),
(8, 10, 2, '17:00:00', '17:30:00', 'Sunday', 'active');

-- Add sample bookings
INSERT INTO class_bookings (schedule_id, member_id, booking_date, attendance_status, feedback_rating, feedback_comment) 
VALUES
(1, 1, '2023-07-10 08:00:00', 'attended', 5, 'Great class, very relaxing!'),
(2, 2, '2023-07-10 18:30:00', 'attended', 4, 'Intense workout, loved it!'),
(3, 3, '2023-07-11 06:30:00', 'attended', 5, 'Excellent way to start the day!'),
(4, 4, '2023-07-11 19:00:00', 'attended', 4, 'Good core workout'),
(5, 5, '2023-07-12 17:00:00', 'attended', 5, 'Fun class, great instructor!'),
(6, 1, '2023-07-12 19:30:00', 'no_show', NULL, NULL),
(7, 2, '2023-07-13 18:00:00', 'attended', 3, 'Too intense for me'),
(8, 3, '2023-07-13 12:00:00', 'attended', 5, 'Very peaceful session'),
(9, 4, '2023-07-14 19:00:00', 'cancelled', NULL, NULL),
(10, 5, '2023-07-14 10:00:00', 'attended', 4, 'Perfect for my age group'),
(11, 1, '2023-07-15 09:00:00', 'booked', NULL, NULL),
(12, 2, '2023-07-15 10:30:00', 'booked', NULL, NULL),
(13, 3, '2023-07-16 11:00:00', 'booked', NULL, NULL),
(14, 4, '2023-07-16 17:00:00', 'booked', NULL, NULL);

-- Add upcoming bookings for demo purposes
INSERT INTO class_bookings (schedule_id, member_id, booking_date, attendance_status)
VALUES
(1, 6, NOW() + interval '7 days', 'booked'),
(2, 7, NOW() + interval '7 days', 'booked'),
(3, 8, NOW() + interval '8 days', 'booked'),
(4, 9, NOW() + interval '8 days', 'booked'),
(5, 10, NOW() + interval '9 days', 'booked'),
(6, 6, NOW() + interval '9 days', 'booked'),
(7, 7, NOW() + interval '10 days', 'booked'),
(8, 8, NOW() + interval '10 days', 'booked');

-- Update sequences to reflect the highest ID values in each table
SELECT setval('classes_class_id_seq', (SELECT MAX(class_id) FROM classes));
SELECT setval('class_schedule_schedule_id_seq', (SELECT MAX(schedule_id) FROM class_schedule));
SELECT setval('class_bookings_booking_id_seq', (SELECT MAX(booking_id) FROM class_bookings));

-- Print success message
SELECT 'Sample data loaded successfully.' AS message;
