-- Function to create first meal plan for new users
CREATE OR REPLACE FUNCTION create_first_meal_plan_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_plan_id UUID;
  day_names TEXT[] := ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  day_name TEXT;
  day_idx INTEGER := 0;
BEGIN
  -- Create a default meal plan container for the new user
  INSERT INTO meal_plans (user_id, name)
  VALUES (NEW.id, 'My Meal Plan')
  RETURNING id INTO new_plan_id;

  -- Create default days (Monday-Sunday) for the plan
  FOREACH day_name IN ARRAY day_names
  LOOP
    INSERT INTO meal_plan_days (user_id, plan_id, day_name, order_index, is_active)
    VALUES (NEW.id, new_plan_id, day_name, day_idx, true);
    day_idx := day_idx + 1;
  END LOOP;

  -- Set it as the default plan in preferences
  INSERT INTO user_preferences (user_id, default_plan_id)
  VALUES (NEW.id, new_plan_id)
  ON CONFLICT (user_id)
  DO UPDATE SET default_plan_id = new_plan_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_create_plan ON auth.users;
CREATE TRIGGER on_auth_user_created_create_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_first_meal_plan_for_user();
