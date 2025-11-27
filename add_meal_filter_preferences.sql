-- Extend user_preferences with meal filter fields
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS meal_filter_cuisine TEXT,
ADD COLUMN IF NOT EXISTS meal_filter_show_mine BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meal_filter_search TEXT;
