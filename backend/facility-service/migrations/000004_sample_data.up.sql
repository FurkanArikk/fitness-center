-- Sample data for fitness_facility_db

-- Equipment data
INSERT INTO equipment (name, description, category, purchase_date, purchase_price, manufacturer, model_number, status, last_maintenance_date, next_maintenance_date)
VALUES 
('Treadmill 1', 'Commercial grade treadmill with incline', 'cardio', '2023-01-15', 2999.99, 'LifeFitness', 'LF-TR1000', 'active', '2023-06-15', '2023-10-15'),
('Treadmill 2', 'Commercial grade treadmill with incline', 'cardio', '2023-01-15', 2999.99, 'LifeFitness', 'LF-TR1000', 'active', '2023-06-18', '2023-10-18'),
('Elliptical 1', 'Low impact cardio machine', 'cardio', '2023-02-10', 2499.99, 'Precor', 'EFX-835', 'active', '2023-07-01', '2023-11-01'),
('Elliptical 2', 'Low impact cardio machine', 'cardio', '2023-02-10', 2499.99, 'Precor', 'EFX-835', 'maintenance', '2023-07-20', '2023-08-10'),
('Rowing Machine', 'Full body workout rowing machine', 'cardio', '2023-03-05', 1799.99, 'Concept2', 'Model D', 'active', '2023-07-05', '2023-11-05'),
('Leg Press', 'Plate loaded leg press machine', 'strength', '2023-01-20', 2850.00, 'Hammer Strength', 'HS-LP', 'active', '2023-06-20', '2023-10-20'),
('Chest Press', 'Plate loaded chest press machine', 'strength', '2023-01-22', 2750.00, 'Hammer Strength', 'HS-CP', 'active', '2023-06-22', '2023-10-22'),
('Lat Pulldown', 'Cable lat pulldown machine', 'strength', '2023-01-25', 2550.00, 'Cybex', 'CX-LP100', 'out-of-order', '2023-07-15', '2023-08-01'),
('Squat Rack 1', 'Power rack with adjustable safety bars', 'free-weights', '2023-02-15', 1500.00, 'Rogue Fitness', 'R-4', 'active', '2023-07-10', '2023-11-10'),
('Squat Rack 2', 'Power rack with adjustable safety bars', 'free-weights', '2023-02-15', 1500.00, 'Rogue Fitness', 'R-4', 'active', '2023-07-12', '2023-11-12'),
('Dumbbell Set', '5-50lb dumbbells (pairs)', 'free-weights', '2023-02-20', 4000.00, 'Troy Barbell', 'VTX', 'active', '2023-06-30', '2023-10-30'),
('Olympic Barbell Set', '7ft Olympic bars and plates', 'free-weights', '2023-02-25', 2200.00, 'Eleiko', 'IWF', 'active', '2023-07-15', '2023-11-15'),
('Stationary Bike 1', 'Upright stationary bike', 'cardio', '2023-03-10', 1699.99, 'Keiser', 'M3i', 'active', '2023-07-10', '2023-11-10'),
('Stationary Bike 2', 'Recumbent stationary bike', 'cardio', '2023-03-15', 1899.99, 'Lifecycle', 'RS3', 'maintenance', '2023-07-25', '2023-08-15'),
('Cable Crossover', 'Dual pulley cable machine', 'strength', '2023-02-01', 3500.00, 'Life Fitness', 'LF-CC', 'active', '2023-06-25', '2023-10-25');

-- Facilities data
INSERT INTO facilities (name, description, capacity, status, opening_hour, closing_hour)
VALUES 
('Main Gym', 'Primary workout area with cardio and strength equipment', 100, 'active', '06:00:00', '22:00:00'),
('Yoga Studio', 'Dedicated space for yoga and pilates classes', 30, 'active', '07:00:00', '21:00:00'),
('Spin Room', 'Indoor cycling studio with 20 bikes', 20, 'active', '06:00:00', '21:00:00'),
('Pool', 'Indoor swimming pool with 6 lanes', 40, 'active', '07:00:00', '20:00:00'),
('Basketball Court', 'Full-size indoor basketball court', 30, 'active', '08:00:00', '22:00:00'),
('Sauna', 'Dry sauna room', 10, 'maintenance', '08:00:00', '21:00:00'),
('Functional Training Area', 'Open space with functional training equipment', 25, 'active', '06:00:00', '22:00:00'),
('Recovery Area', 'Stretching area with foam rollers and yoga mats', 15, 'active', '06:00:00', '22:00:00');

-- Attendance data (with fictional member IDs)
INSERT INTO attendance (member_id, check_in_time, check_out_time, facility_id, date)
VALUES 
(101, '2023-07-15 08:30:00', '2023-07-15 10:15:00', 1, '2023-07-15'),
(102, '2023-07-15 09:00:00', '2023-07-15 10:30:00', 1, '2023-07-15'),
(103, '2023-07-15 10:00:00', '2023-07-15 11:45:00', 2, '2023-07-15'),
(104, '2023-07-15 12:30:00', '2023-07-15 14:00:00', 1, '2023-07-15'),
(105, '2023-07-15 16:00:00', '2023-07-15 17:30:00', 3, '2023-07-15'),
(106, '2023-07-15 18:00:00', '2023-07-15 19:45:00', 1, '2023-07-15'),
(101, '2023-07-16 07:30:00', '2023-07-16 09:00:00', 4, '2023-07-16'),
(103, '2023-07-16 08:15:00', '2023-07-16 10:30:00', 1, '2023-07-16'),
(105, '2023-07-16 12:00:00', '2023-07-16 13:30:00', 2, '2023-07-16'),
(107, '2023-07-16 17:00:00', '2023-07-16 19:00:00', 1, '2023-07-16'),
(108, '2023-07-16 18:30:00', '2023-07-16 20:00:00', 5, '2023-07-16'),
(102, '2023-07-17 06:45:00', '2023-07-17 08:15:00', 1, '2023-07-17'),
(104, '2023-07-17 10:00:00', '2023-07-17 11:30:00', 7, '2023-07-17'),
(106, '2023-07-17 12:30:00', '2023-07-17 14:00:00', 1, '2023-07-17'),
(108, '2023-07-17 16:00:00', '2023-07-17 18:15:00', 1, '2023-07-17'),
(109, '2023-07-17 17:30:00', '2023-07-17 19:00:00', 4, '2023-07-17'),
(110, '2023-07-17 19:00:00', '2023-07-17 21:00:00', 1, '2023-07-17'),
(101, '2023-07-18 07:00:00', '2023-07-18 08:30:00', 1, '2023-07-18'),
(105, '2023-07-18 08:30:00', '2023-07-18 10:15:00', 1, '2023-07-18'),
(103, '2023-07-18 16:45:00', '2023-07-18 18:30:00', 2, '2023-07-18'),
(107, '2023-07-18 18:00:00', '2023-07-18 20:00:00', 5, '2023-07-18'),
(111, '2023-07-18 19:30:00', '2023-07-18 21:15:00', 1, '2023-07-18'),
(112, '2023-07-18 07:15:00', '2023-07-18 09:30:00', 7, '2023-07-18'),
(113, '2023-07-19 08:00:00', '2023-07-19 09:45:00', 1, '2023-07-19'),
(114, '2023-07-19 10:30:00', '2023-07-19 12:15:00', 4, '2023-07-19'),
(115, '2023-07-19 17:00:00', '2023-07-19 19:00:00', 1, '2023-07-19'),
(116, '2023-07-19 19:15:00', NULL, 1, '2023-07-19'), -- Member still working out
(101, '2023-07-20 06:30:00', NULL, 1, '2023-07-20'), -- Member still working out
(105, '2023-07-20 07:45:00', NULL, 3, '2023-07-20'); -- Member still working out
