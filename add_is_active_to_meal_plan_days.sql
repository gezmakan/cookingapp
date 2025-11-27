-- Add is_active column to meal_plan_days table
ALTER TABLE meal_plan_days
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
