-- =====================================================
-- ASSIGN PUBLIC EXERCISES TO ADMIN
-- =====================================================
-- This will assign all public exercises (user_id = NULL) to slmxyz@gmail.com

-- First, get the user_id for slmxyz@gmail.com
-- Then update all exercises with NULL user_id to that user_id

UPDATE exercises
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'slmxyz@gmail.com'
)
WHERE user_id IS NULL;
