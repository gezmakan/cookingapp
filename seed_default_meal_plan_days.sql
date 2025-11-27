-- Function to seed default meal plan days for a new user
CREATE OR REPLACE FUNCTION public.seed_default_meal_plan_days()
RETURNS TRIGGER AS $$
DECLARE
  day_names TEXT[] := ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  day_name TEXT;
  i INTEGER := 1;
BEGIN
  FOREACH day_name IN ARRAY day_names LOOP
    INSERT INTO meal_plan_days (user_id, day_name, order_index, is_active)
    VALUES (NEW.id, day_name, i - 1, TRUE);
    i := i + 1;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_seed_meal_plan_days ON auth.users;

CREATE TRIGGER trigger_seed_meal_plan_days
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.seed_default_meal_plan_days();
