-- Fix infinite recursion in meal_plans RLS policies
-- Drop all existing policies first

DROP POLICY IF EXISTS "Users can view their own plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can view plans shared with them" ON meal_plans;
DROP POLICY IF EXISTS "Anyone can view public plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can create their own plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON meal_plans;

-- Recreate policies without recursion
-- Policy: Users can view their own plans
CREATE POLICY "Users can view their own plans"
  ON meal_plans
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can view plans shared with them (no subquery)
CREATE POLICY "Users can view plans shared with them"
  ON meal_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plan_shares
      WHERE plan_shares.plan_id = meal_plans.id
      AND plan_shares.shared_with_email = (auth.jwt() ->> 'email')
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
