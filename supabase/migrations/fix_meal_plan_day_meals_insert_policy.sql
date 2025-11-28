-- Allow users to insert meals to shared plans with edit permission

DROP POLICY IF EXISTS "Users can insert meals to their own plans" ON meal_plan_day_meals;

CREATE POLICY "Users can insert meals to their own plans or shared plans with edit permission"
  ON meal_plan_day_meals
  FOR INSERT
  WITH CHECK (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days
      WHERE plan_id IN (
        -- User owns the plan
        SELECT id FROM meal_plans WHERE user_id = auth.uid()
        UNION
        -- Plan is shared with user with edit permission
        SELECT plan_id FROM plan_shares
        WHERE shared_with_email = (auth.jwt() ->> 'email')
        AND permission = 'edit'
      )
    )
  );
