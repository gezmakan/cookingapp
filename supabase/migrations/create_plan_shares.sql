-- Create meal_plans table for plan containers
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Meal Plan',
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add plan_id to existing meal_plan_days table
ALTER TABLE meal_plan_days
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_plan_id ON meal_plan_days(plan_id);

-- Create plan_shares table for managing meal plan sharing between users
CREATE TABLE IF NOT EXISTS plan_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, shared_with_email)
);

-- Create index for faster lookups
CREATE INDEX idx_plan_shares_email ON plan_shares(shared_with_email);
CREATE INDEX idx_plan_shares_plan_id ON plan_shares(plan_id);

-- Function to create default days for a meal plan
CREATE OR REPLACE FUNCTION create_default_days_for_plan()
RETURNS TRIGGER AS $$
DECLARE
  day_names TEXT[] := ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  day_name TEXT;
  day_idx INTEGER := 0;
BEGIN
  -- Create default days (Monday-Sunday) for the new plan
  FOREACH day_name IN ARRAY day_names
  LOOP
    INSERT INTO meal_plan_days (user_id, plan_id, day_name, order_index, is_active)
    VALUES (NEW.user_id, NEW.id, day_name, day_idx, true);
    day_idx := day_idx + 1;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run when a new plan is created
DROP TRIGGER IF EXISTS on_meal_plan_created_create_days ON meal_plans;
CREATE TRIGGER on_meal_plan_created_create_days
  AFTER INSERT ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION create_default_days_for_plan();

-- Enable RLS on meal_plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own plans
CREATE POLICY "Users can view their own plans"
  ON meal_plans
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can view plans shared with them
CREATE POLICY "Users can view plans shared with them"
  ON meal_plans
  FOR SELECT
  USING (
    id IN (
      SELECT plan_id FROM plan_shares WHERE shared_with_email = auth.jwt() ->> 'email'
    )
  );

-- Policy: Users can view public plans
CREATE POLICY "Anyone can view public plans"
  ON meal_plans
  FOR SELECT
  USING (is_public = true);

-- Policy: Users can create their own plans
CREATE POLICY "Users can create their own plans"
  ON meal_plans
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own plans
CREATE POLICY "Users can update their own plans"
  ON meal_plans
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own plans
CREATE POLICY "Users can delete their own plans"
  ON meal_plans
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable RLS on plan_shares
ALTER TABLE plan_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see shares for plans they own
CREATE POLICY "Users can view shares for their own plans"
  ON plan_shares
  FOR SELECT
  USING (
    plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can see shares where they are the recipient
CREATE POLICY "Users can view plans shared with them"
  ON plan_shares
  FOR SELECT
  USING (shared_with_email = auth.jwt() ->> 'email');

-- Policy: Users can create shares for plans they own
CREATE POLICY "Users can create shares for their own plans"
  ON plan_shares
  FOR INSERT
  WITH CHECK (
    plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete shares for plans they own
CREATE POLICY "Users can delete shares for their own plans"
  ON plan_shares
  FOR DELETE
  USING (
    plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );
