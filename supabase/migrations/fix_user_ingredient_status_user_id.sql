-- Make user_id nullable or remove it from user_ingredient_status
-- Since we're using plan_id now, user_id is redundant

-- Option 1: Make it nullable (safer, preserves existing data)
ALTER TABLE user_ingredient_status
ALTER COLUMN user_id DROP NOT NULL;

-- Option 2: Drop it entirely (cleaner, but requires clearing existing data first)
-- Uncomment if you want to remove the column completely:
-- ALTER TABLE user_ingredient_status DROP COLUMN IF EXISTS user_id;
