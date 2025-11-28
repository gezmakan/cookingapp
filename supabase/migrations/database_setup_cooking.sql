-- Cooking App Database Setup
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLE: meals (like exercises in gym tracker)
-- ============================================
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  ingredients TEXT,           -- Optional: List of ingredients
  instructions TEXT,          -- Optional: Cooking instructions
  video_url TEXT,             -- Optional: YouTube link
  cuisine_type TEXT,          -- Optional: Italian, Mexican, Thai, etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- TABLE: meal_plan_days (day cards in meal plan)
-- ============================================
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_name TEXT NOT NULL,     -- "Monday", "Anniversary Dinner", etc.
  order_index INTEGER NOT NULL DEFAULT 0,  -- For drag & drop ordering
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- TABLE: meal_plan_day_meals (junction table)
-- Links days to meals with ordering
-- ============================================
CREATE TABLE IF NOT EXISTS meal_plan_day_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_day_id UUID REFERENCES meal_plan_days(id) ON DELETE CASCADE NOT NULL,
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,  -- Order of meals within the day
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_user_id ON meal_plan_days(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_order ON meal_plan_days(user_id, order_index);
CREATE INDEX IF NOT EXISTS idx_meal_plan_day_meals_day ON meal_plan_day_meals(meal_plan_day_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_day_meals_order ON meal_plan_day_meals(meal_plan_day_id, order_index);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_day_meals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: meals
-- ============================================
CREATE POLICY "Users can view their own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES: meal_plan_days
-- ============================================
CREATE POLICY "Users can view their own meal plan days"
  ON meal_plan_days FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plan days"
  ON meal_plan_days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plan days"
  ON meal_plan_days FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plan days"
  ON meal_plan_days FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES: meal_plan_day_meals
-- (No user_id - relies on parent table)
-- ============================================
CREATE POLICY "Users can view meal plan day meals"
  ON meal_plan_day_meals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_days
      WHERE meal_plan_days.id = meal_plan_day_meals.meal_plan_day_id
      AND meal_plan_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert meal plan day meals"
  ON meal_plan_day_meals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plan_days
      WHERE meal_plan_days.id = meal_plan_day_meals.meal_plan_day_id
      AND meal_plan_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update meal plan day meals"
  ON meal_plan_day_meals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_days
      WHERE meal_plan_days.id = meal_plan_day_meals.meal_plan_day_id
      AND meal_plan_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete meal plan day meals"
  ON meal_plan_day_meals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_days
      WHERE meal_plan_days.id = meal_plan_day_meals.meal_plan_day_id
      AND meal_plan_days.user_id = auth.uid()
    )
  );

-- ============================================
-- DONE!
-- ============================================
-- Your cooking app database is ready!
-- Next steps:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste and run this entire script
-- 3. Verify tables are created in Table Editor
