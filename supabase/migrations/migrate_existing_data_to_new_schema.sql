-- Migration to convert existing meal_plan_days data to new schema
-- This creates a meal_plans container for existing days that don't have a plan_id

DO $$
DECLARE
  user_record RECORD;
  new_plan_id UUID;
BEGIN
  -- For each user that has meal_plan_days without a plan_id
  FOR user_record IN
    SELECT DISTINCT user_id
    FROM meal_plan_days
    WHERE plan_id IS NULL
  LOOP
    -- Create a new meal plan container for this user
    INSERT INTO meal_plans (user_id, name)
    VALUES (user_record.user_id, 'My Meal Plan')
    RETURNING id INTO new_plan_id;

    -- Update all their existing days to point to this new plan
    UPDATE meal_plan_days
    SET plan_id = new_plan_id
    WHERE user_id = user_record.user_id
    AND plan_id IS NULL;

    -- Set this as their default plan
    INSERT INTO user_preferences (user_id, default_plan_id)
    VALUES (user_record.user_id, new_plan_id)
    ON CONFLICT (user_id)
    DO UPDATE SET default_plan_id = new_plan_id;

    RAISE NOTICE 'Created plan % for user %', new_plan_id, user_record.user_id;
  END LOOP;
END $$;
