-- Add RLS policies for user_ingredient_status table

-- Enable RLS
ALTER TABLE user_ingredient_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view ingredient status" ON user_ingredient_status;
DROP POLICY IF EXISTS "Users can update ingredient status" ON user_ingredient_status;
DROP POLICY IF EXISTS "Users can insert ingredient status" ON user_ingredient_status;
DROP POLICY IF EXISTS "Users can delete ingredient status" ON user_ingredient_status;

-- Users can view ingredient status for plans they own or have access to
CREATE POLICY "Users can view ingredient status for accessible plans"
  ON user_ingredient_status
  FOR SELECT
  USING (
    plan_id IN (
      -- Plans they own
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
      UNION
      -- Plans shared with them
      SELECT plan_id FROM plan_shares WHERE shared_with_email = (auth.jwt() ->> 'email')
    )
  );

-- Users can insert ingredient status for plans they own or have edit access to
CREATE POLICY "Users can insert ingredient status for editable plans"
  ON user_ingredient_status
  FOR INSERT
  WITH CHECK (
    plan_id IN (
      -- Plans they own
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
      UNION
      -- Plans shared with them with edit permission
      SELECT plan_id FROM plan_shares
      WHERE shared_with_email = (auth.jwt() ->> 'email')
      AND permission = 'edit'
    )
  );

-- Users can update ingredient status for plans they own or have edit access to
CREATE POLICY "Users can update ingredient status for editable plans"
  ON user_ingredient_status
  FOR UPDATE
  USING (
    plan_id IN (
      -- Plans they own
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
      UNION
      -- Plans shared with them with edit permission
      SELECT plan_id FROM plan_shares
      WHERE shared_with_email = (auth.jwt() ->> 'email')
      AND permission = 'edit'
    )
  );

-- Users can delete ingredient status for plans they own or have edit access to
CREATE POLICY "Users can delete ingredient status for editable plans"
  ON user_ingredient_status
  FOR DELETE
  USING (
    plan_id IN (
      -- Plans they own
      SELECT id FROM meal_plans WHERE user_id = auth.uid()
      UNION
      -- Plans shared with them with edit permission
      SELECT plan_id FROM plan_shares
      WHERE shared_with_email = (auth.jwt() ->> 'email')
      AND permission = 'edit'
    )
  );
