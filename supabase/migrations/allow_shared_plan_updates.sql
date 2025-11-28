-- Allow users to update plans shared with them (if they have edit permission)

DROP POLICY IF EXISTS "Users can update their own plans" ON meal_plans;

CREATE POLICY "Users can update their own plans or shared plans with edit permission"
  ON meal_plans
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR id IN (
      SELECT plan_id
      FROM plan_shares
      WHERE shared_with_email = (auth.jwt() ->> 'email')
      AND permission = 'edit'
    )
  );
