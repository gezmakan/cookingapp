-- Create workout_sessions table to track each workout session
CREATE TABLE workout_sessions (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid references workout_plans(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_number integer not null,
  session_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create workout_session_sets table to track individual sets
CREATE TABLE workout_session_sets (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid references workout_sessions(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number integer not null,
  reps integer,
  weight numeric(6,2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workout_session_sets
CREATE POLICY "Users can view their own workout session sets"
  ON workout_session_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_sets.workout_session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own workout session sets"
  ON workout_session_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_sets.workout_session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout session sets"
  ON workout_session_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_sets.workout_session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout session sets"
  ON workout_session_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = workout_session_sets.workout_session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_plan_id ON workout_sessions(workout_plan_id);
CREATE INDEX idx_workout_session_sets_session_id ON workout_session_sets(workout_session_id);
CREATE INDEX idx_workout_session_sets_exercise_id ON workout_session_sets(exercise_id);
