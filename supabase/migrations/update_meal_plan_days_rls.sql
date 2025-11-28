-- Update RLS policies on meal_plan_days to support shared plans

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own meal plan days" ON meal_plan_days;
DROP POLICY IF EXISTS "Users can insert their own meal plan days" ON meal_plan_days;
DROP POLICY IF EXISTS "Users can update their own meal plan days" ON meal_plan_days;
DROP POLICY IF EXISTS "Users can delete their own meal plan days" ON meal_plan_days;

-- Policy: Users can view days from their own plans
CREATE POLICY "Users can view days from their own plans"
  ON meal_plan_days
  FOR SELECT
  USING (
    plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can view days from plans shared with them
CREATE POLICY "Users can view days from shared plans"
  ON meal_plan_days
  FOR SELECT
  USING (
    plan_id IN (
      SELECT plan_id FROM plan_shares WHERE shared_with_email = auth.jwt() ->> 'email'
    )
  );

-- Policy: Users can view days from public plans
CREATE POLICY "Users can view days from public plans"
  ON meal_plan_days
  FOR SELECT
  USING (
    plan_id IN (
      SELECT id FROM meal_plans WHERE is_public = true
    )
  );

-- Policy: Users can insert days to their own plans
CREATE POLICY "Users can insert days to their own plans"
  ON meal_plan_days
  FOR INSERT
  WITH CHECK (
    plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update days in their own plans
CREATE POLICY "Users can update days in their own plans"
  ON meal_plan_days
  FOR UPDATE
  USING (
    plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update days in plans shared with them (if they have edit permission)
CREATE POLICY "Users can update days in shared plans with edit permission"
  ON meal_plan_days
  FOR UPDATE
  USING (
    plan_id IN (
      SELECT plan_id FROM plan_shares
      WHERE shared_with_email = auth.jwt() ->> 'email'
      AND permission = 'edit'
    )
  );

-- Policy: Users can delete days from their own plans
CREATE POLICY "Users can delete days from their own plans"
  ON meal_plan_days
  FOR DELETE
  USING (
    plan_id IN (
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete days from plans shared with them (if they have edit permission)
CREATE POLICY "Users can delete days from shared plans with edit permission"
  ON meal_plan_days
  FOR DELETE
  USING (
    plan_id IN (
      SELECT plan_id FROM plan_shares
      WHERE shared_with_email = auth.jwt() ->> 'email'
      AND permission = 'edit'
    )
  );
