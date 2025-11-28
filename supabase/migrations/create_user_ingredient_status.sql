-- Table to store ingredient checklist state per user
CREATE TABLE IF NOT EXISTS user_ingredient_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ingredient TEXT NOT NULL,
  has_item BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ingredient)
);

CREATE INDEX IF NOT EXISTS idx_user_ingredient_status_user ON user_ingredient_status(user_id);

ALTER TABLE user_ingredient_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their ingredient status"
  ON user_ingredient_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert ingredient status"
  ON user_ingredient_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update ingredient status"
  ON user_ingredient_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete ingredient status"
  ON user_ingredient_status FOR DELETE
  USING (auth.uid() = user_id);
