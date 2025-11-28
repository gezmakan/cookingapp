-- Create a table to store application-wide settings (currently the featured public meal plan)
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  public_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure a singleton row exists
INSERT INTO app_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon visitors) to read the settings
DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
CREATE POLICY "Anyone can read app settings"
  ON app_settings
  FOR SELECT
  USING (true);

-- Only the configured admin can update the settings
DROP POLICY IF EXISTS "Only admin can update app settings" ON app_settings;
CREATE POLICY "Only admin can update app settings"
  ON app_settings
  FOR UPDATE
  USING (lower(auth.jwt() ->> 'email') = 'slmxyz@gmail.com')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'slmxyz@gmail.com');
