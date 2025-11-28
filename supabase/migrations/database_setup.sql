-- =====================================================
-- GYM TRACKER - COMPLETE DATABASE SETUP
-- =====================================================
-- Run this entire file in Supabase SQL Editor to set up the database

-- =====================================================
-- 1. EXERCISES TABLE
-- =====================================================
-- Stores all exercises (public and private)
-- Public exercises have is_private = false
-- Private exercises have is_private = true and belong to a specific user

CREATE TABLE IF NOT EXISTS exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  sets integer not null,
  reps text not null,
  video_url text,
  muscle_groups text,
  rest_minutes integer default 1,
  rest_seconds integer default 30,
  is_private boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS exercises_user_id_idx ON exercises(user_id);
CREATE INDEX IF NOT EXISTS exercises_is_private_idx ON exercises(is_private);

-- =====================================================
-- 2. EXERCISE FAVORITES TABLE
-- =====================================================
-- Allows users to favorite exercises

CREATE TABLE IF NOT EXISTS exercise_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable Row Level Security
ALTER TABLE exercise_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites"
  ON exercise_favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON exercise_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON exercise_favorites FOR DELETE
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS exercise_favorites_user_id_idx ON exercise_favorites(user_id);
CREATE INDEX IF NOT EXISTS exercise_favorites_exercise_id_idx ON exercise_favorites(exercise_id);

-- =====================================================
-- 3. WORKOUT PLANS TABLE
-- =====================================================
-- Stores user workout plans

CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  goal text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_plans
CREATE POLICY "Users can view own workout plans"
  ON workout_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans"
  ON workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON workout_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON workout_plans FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS workout_plans_user_id_idx ON workout_plans(user_id);

-- =====================================================
-- 4. WORKOUT PLAN EXERCISES TABLE
-- =====================================================
-- Junction table linking workout plans to exercises

CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid references workout_plans(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  order_index integer not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
ALTER TABLE workout_plan_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_plan_exercises
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

-- Indexes
CREATE INDEX IF NOT EXISTS workout_plan_exercises_workout_plan_id_idx ON workout_plan_exercises(workout_plan_id);
CREATE INDEX IF NOT EXISTS workout_plan_exercises_exercise_id_idx ON workout_plan_exercises(exercise_id);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
