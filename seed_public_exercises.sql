-- =====================================================
-- SEED PUBLIC EXERCISES
-- =====================================================
-- Run this AFTER database_setup.sql to populate the public exercise library
-- These exercises will be visible to all users (is_private = false, user_id = NULL)

INSERT INTO exercises (name, sets, reps, video_url, muscle_groups, rest_minutes, rest_seconds, is_private) VALUES
-- Upper Body - Back/Chest/Shoulders
('Bent Over Dumbbell Row', 3, '8-10', 'https://www.youtube.com/watch?v=5PoEksoJNaw', 'Back, Biceps', 1, 30, false),
('Dumbbell Bench Press', 3, '8-10', 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk', 'Chest, Shoulders, Triceps', 1, 30, false),
('Dumbbell Lateral Raise', 3, '8-12', 'https://www.youtube.com/watch?v=XPPfnSEATJA', 'Shoulders', 1, 30, false),
('Dumbbell Pullover', 3, '8-12', 'https://www.youtube.com/watch?v=FK4rHfWKEac&pp=ygUMREIgUHVsbG92ZXJz', 'Chest, Lats', 1, 30, false),
('Dumbbell Bicep Curl', 2, '8-12', 'https://www.youtube.com/watch?v=HnHuhf4hEWY', 'Biceps', 1, 30, false),
('Dumbbell Tricep Extension', 3, '8-12', 'https://www.youtube.com/watch?v=a9oPnZReIRE', 'Triceps', 1, 30, false),
('Dumbbell Shrug', 2, '12-15', 'https://www.youtube.com/watch?v=xDt6qbKgLkY', 'Traps, Shoulders', 1, 30, false),
('One Arm Dumbbell Row', 3, '8-10', 'https://www.youtube.com/watch?v=xl1YiqQY2vA', 'Back, Biceps', 1, 30, false),
('Dumbbell Shoulder Press', 3, '8-10', 'https://www.youtube.com/watch?v=OM23fjJB3-0', 'Shoulders, Triceps', 1, 30, false),
('Incline Dumbbell Bench Press', 3, '8-12', 'https://www.youtube.com/watch?v=8bfJ3sfUTos', 'Upper Chest, Shoulders', 1, 30, false),
('Chest Supported Dumbbell Row', 3, '8-12', 'https://www.youtube.com/watch?v=DIS839guYUk', 'Back, Biceps', 1, 30, false),
('Dumbbell Hammer Curl', 2, '8-12', 'https://www.youtube.com/watch?v=P5sXHLmXmBM', 'Biceps', 1, 30, false),
('Dumbbell Floor Press', 2, '8-12', 'https://www.youtube.com/watch?v=fc7sLXRrQaU', 'Chest, Triceps', 1, 30, false),
('Seated Dumbbell Shrug', 2, '12-15', 'https://www.youtube.com/watch?v=zgToz5FiI-E', 'Traps', 1, 30, false),
('Dumbbell Flyes', 3, '8-12', 'https://www.youtube.com/watch?v=gasK_1fNVdk', 'Chest', 1, 30, false),

-- Core
('Russian Twists', 3, '10-15', 'https://www.youtube.com/watch?v=pz1H4uhLMJ0', 'Core, Obliques', 1, 0, false),
('Plank', 3, '30-60s', 'https://www.youtube.com/watch?v=pSHjTRCQxIw', 'Core Stability', 1, 0, false),
('Dumbbell Side Bend', 3, '10-15', 'https://www.youtube.com/watch?v=ARAWlmlgPbg&pp=ygUNREIgU2lkZSBCZW5kcw%3D%3D', 'Obliques', 1, 0, false),
('Mountain Climbers', 3, '30-60s', 'https://www.youtube.com/watch?v=kLh-uczlPLg', 'Core, Cardio', 1, 0, false),

-- Lower Body
('Goblet Squat', 3, '10-15', 'https://www.youtube.com/watch?v=Xjo_fY9Hl9w&pp=ygUPREIgR29ibGV0IFNxdWF0', 'Quads, Glutes', 1, 30, false),
('Dumbbell Bulgarian Split Squat', 3, '8-12', 'https://www.youtube.com/watch?v=vLuhN_glFZ8&pp=ygUYREIgQnVsZ2FyaWFuIFNwbGl0IFNxdWF0', 'Quads, Glutes, Inner Thighs', 1, 30, false),
('Dumbbell Hamstring Curl', 3, '8-12', 'https://www.youtube.com/watch?v=aPUtiouhcQQ', 'Hamstrings', 1, 30, false),
('Dumbbell Calf Raise', 3, '8-12', 'https://www.youtube.com/shorts/fOfPwmb5FXU', 'Calves', 1, 0, false),
('Dumbbell Lunges', 3, '8-10', 'https://www.youtube.com/watch?v=t7DBjlOTwAk', 'Quads, Glutes', 1, 30, false),
('Dumbbell Hip Thrust', 3, '8-10', 'https://www.youtube.com/watch?v=QPTcLlOWSl4', 'Glutes, Hamstrings', 1, 30, false),
('Dumbbell Split Squat', 3, '8-12', 'https://www.youtube.com/watch?v=fynqcP1g-vw', 'Quads, Glutes', 1, 30, false),
('Seated Dumbbell Calf Raise', 3, '8-12', 'https://www.youtube.com/watch?v=Xfe4ZqiKvnY&pp=ygUNREIgQ2FsZiBSYWlzZQ%3D%3D', 'Calves', 1, 0, false),
('Dumbbell Romanian Deadlift', 3, '8-12', 'https://www.youtube.com/watch?v=xAL7lHwj30E', 'Hamstrings, Glutes, Lower Back', 1, 30, false),
('Dumbbell Stiff Legged Deadlift', 3, '8-12', 'https://www.youtube.com/watch?v=KE2A7G_nDc8', 'Hamstrings, Glutes', 1, 30, false),
('Dumbbell Step-Ups', 3, '8-12', 'https://www.youtube.com/watch?v=9ZknEYboBOQ', 'Quads, Glutes', 1, 30, false),

-- Bodyweight & Barbell
('Push Ups', 4, '8-12', 'https://www.youtube.com/shorts/14D-2c9kvVw', 'Chest, Shoulders, Triceps', 1, 30, false),
('Barbell Deadlift', 3, '8-12', 'https://www.youtube.com/shorts/vfKwjT5-86k', 'Posterior Chain', 2, 0, false),
('Bent Over Barbell Row', 3, '8-12', 'https://www.youtube.com/watch?v=bm0_q9bR_HA', 'Upper and Middle Back', 1, 30, false),
('Barbell Shrug', 3, '8-12', 'https://www.youtube.com/shorts/MlqHEfydPpE', 'Upper and Mid Trapezius', 1, 30, false),
('Pull-Up (band assisted)', 4, '5-8', 'https://www.youtube.com/shorts/9rckBLbVe8c', 'Lats, Teres Major, Rhomboids', 1, 30, false),
('Chin-Up (band assisted)', 4, '5-8', 'https://www.youtube.com/shorts/VzBj5eQdPvM', 'Lats, Biceps', 1, 30, false);
