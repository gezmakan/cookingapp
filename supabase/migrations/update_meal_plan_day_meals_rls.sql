-- Update RLS policies on meal_plan_day_meals to support shared plans

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own meal plan day meals" ON meal_plan_day_meals;
DROP POLICY IF EXISTS "Users can insert their own meal plan day meals" ON meal_plan_day_meals;
DROP POLICY IF EXISTS "Users can update their own meal plan day meals" ON meal_plan_day_meals;
DROP POLICY IF EXISTS "Users can delete their own meal plan day meals" ON meal_plan_day_meals;

-- Policy: Users can view meals from days in their own plans
CREATE POLICY "Users can view meals from their own plans"
  ON meal_plan_day_meals
  FOR SELECT
  USING (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        SELECT id FROM meal_plans WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can view meals from days in plans shared with them
CREATE POLICY "Users can view meals from shared plans"
  ON meal_plan_day_meals
  FOR SELECT
  USING (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        SELECT plan_id FROM plan_shares WHERE shared_with_email = auth.jwt() ->> 'email'
      )
    )
  );

-- Policy: Users can view meals from days in public plans
CREATE POLICY "Users can view meals from public plans"
  ON meal_plan_day_meals
  FOR SELECT
  USING (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        SELECT id FROM meal_plans WHERE is_public = true
      )
    )
  );

-- Policy: Users can insert meals to days in their own plans
CREATE POLICY "Users can insert meals to their own plans"
  ON meal_plan_day_meals
  FOR INSERT
  WITH CHECK (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        SELECT id FROM meal_plans WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can update meals in days in their own plans
CREATE POLICY "Users can update meals in their own plans"
  ON meal_plan_day_meals
  FOR UPDATE
  USING (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        SELECT id FROM meal_plans WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can update meals in plans shared with them (if they have edit permission)
CREATE POLICY "Users can update meals in shared plans with edit permission"
  ON meal_plan_day_meals
  FOR UPDATE
  USING (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        SELECT plan_id FROM plan_shares
        WHERE shared_with_email = auth.jwt() ->> 'email'
        AND permission = 'edit'
      )
    )
  );

-- Policy: Users can delete meals from days in their own plans
CREATE POLICY "Users can delete meals from their own plans"
  ON meal_plan_day_meals
  FOR DELETE
  USING (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        SELECT id FROM meal_plans WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can delete meals from plans shared with them (if they have edit permission)
CREATE POLICY "Users can delete meals from shared plans with edit permission"
  ON meal_plan_day_meals
  FOR DELETE
  USING (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        SELECT plan_id FROM plan_shares
        WHERE shared_with_email = auth.jwt() ->> 'email'
        AND permission = 'edit'
      )
    )
  );
