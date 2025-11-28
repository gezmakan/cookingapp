-- =====================================================
-- MIGRATION: Add is_private field to existing exercises table
-- =====================================================
-- Run this to update your existing exercises table

-- Drop old policies first
DROP POLICY IF EXISTS "Users can view own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;

-- Make user_id nullable (allow public exercises with no owner)
ALTER TABLE exercises ALTER COLUMN user_id DROP NOT NULL;

-- Add is_private column
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- Add index for is_private
CREATE INDEX IF NOT EXISTS exercises_is_private_idx ON exercises(is_private);

-- Create new RLS policies
-- Users can see public exercises + their own private ones
CREATE POLICY "Users can view public and own exercises"
  ON exercises FOR SELECT
  USING (is_private = false OR user_id = auth.uid());

-- Authenticated users can insert exercises
CREATE POLICY "Authenticated users can insert exercises"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own exercises
CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own exercises
CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- Now create the other tables
-- =====================================================

-- Exercise Favorites
CREATE TABLE IF NOT EXISTS exercise_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE exercise_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON exercise_favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON exercise_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON exercise_favorites FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS exercise_favorites_user_id_idx ON exercise_favorites(user_id);
CREATE INDEX IF NOT EXISTS exercise_favorites_exercise_id_idx ON exercise_favorites(exercise_id);

-- Workout Plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  goal text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout plans"
  ON workout_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans"
  ON workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON workout_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON workout_plans FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS workout_plans_user_id_idx ON workout_plans(user_id);

-- Workout Plan Exercises
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid references workout_plans(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  order_index integer not null,
  created_at timestamp with time zone default now()
);

ALTER TABLE workout_plan_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout plan exercises"
  ON workout_plan_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workout_plans
    WHERE workout_plans.id = workout_plan_exercises.workout_plan_id
    AND workout_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own workout plan exercises"
  ON workout_plan_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_plans
    WHERE workout_plans.id = workout_plan_exercises.workout_plan_id
    AND workout_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own workout plan exercises"
  ON workout_plan_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workout_plans
    WHERE workout_plans.id = workout_plan_exercises.workout_plan_id
    AND workout_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own workout plan exercises"
  ON workout_plan_exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workout_plans
    WHERE workout_plans.id = workout_plan_exercises.workout_plan_id
    AND workout_plans.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS workout_plan_exercises_workout_plan_id_idx ON workout_plan_exercises(workout_plan_id);
CREATE INDEX IF NOT EXISTS workout_plan_exercises_exercise_id_idx ON workout_plan_exercises(exercise_id);

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
