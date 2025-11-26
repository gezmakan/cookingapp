-- This script will delete all workout sessions and their sets
-- Run this in your Supabase SQL editor if you want to start fresh

-- Delete all workout session sets first (due to foreign key constraint)
DELETE FROM workout_session_sets;

-- Delete all workout sessions
DELETE FROM workout_sessions;

-- Verify deletion
SELECT COUNT(*) as remaining_sessions FROM workout_sessions;
SELECT COUNT(*) as remaining_sets FROM workout_session_sets;
