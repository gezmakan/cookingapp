-- Add is_private column to meals table
-- Run this in your Supabase SQL Editor

-- Add the column with default value false (public)
ALTER TABLE meals
ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

-- Add index for filtering private/public meals
CREATE INDEX IF NOT EXISTS idx_meals_is_private ON meals(is_private);

-- Update RLS policy to allow viewing public meals from other users
DROP POLICY IF EXISTS "Users can view their own meals" ON meals;

CREATE POLICY "Users can view their own meals and public meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id OR is_private = false);

-- Keep other policies the same (users can only modify their own meals)
