ALTER TABLE workout_plan_exercises
ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_workout_plan_exercises_hidden
  ON workout_plan_exercises (workout_plan_id, is_hidden);
