-- Fix RLS so users can see plans shared with them

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own plans" ON meal_plans;

-- Recreate with shared plans support
CREATE POLICY "Users can view their own plans or shared plans"
  ON meal_plans
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_public = true
    OR id IN (
      SELECT plan_id
      FROM plan_shares
      WHERE shared_with_email = (auth.jwt() ->> 'email')
    )
  );
