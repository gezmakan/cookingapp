-- Add default_plan_id to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS default_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_default_plan
ON user_preferences(default_plan_id);
