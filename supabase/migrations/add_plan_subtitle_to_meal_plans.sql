-- Add subtitle support directly on meal_plans so it can be saved and shared
ALTER TABLE meal_plans
ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Ensure we always have a friendly default moving forward
ALTER TABLE meal_plans
ALTER COLUMN subtitle SET DEFAULT 'Plan your weekly meals';

-- Backfill existing rows that don't have a subtitle yet
UPDATE meal_plans
SET subtitle = 'Plan your weekly meals'
WHERE subtitle IS NULL;
