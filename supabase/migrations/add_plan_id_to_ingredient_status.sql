-- Add plan_id to user_ingredient_status table to tie shopping lists to specific plans

-- First, drop the existing unique constraint
ALTER TABLE user_ingredient_status
DROP CONSTRAINT IF EXISTS user_ingredient_status_user_id_ingredient_key;

-- Add plan_id column
ALTER TABLE user_ingredient_status
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE;

-- Create new unique constraint including plan_id
ALTER TABLE user_ingredient_status
ADD CONSTRAINT user_ingredient_status_plan_ingredient_unique
UNIQUE (plan_id, ingredient);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_ingredient_status_plan_id
ON user_ingredient_status(plan_id);
