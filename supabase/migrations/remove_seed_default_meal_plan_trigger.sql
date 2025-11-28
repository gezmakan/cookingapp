-- Remove automatic seeding trigger/function (handled in app logic now)
DROP TRIGGER IF EXISTS trigger_seed_meal_plan_days ON auth.users;
DROP FUNCTION IF EXISTS public.seed_default_meal_plan_days();
