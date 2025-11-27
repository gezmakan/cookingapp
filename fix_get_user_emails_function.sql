-- Drop the old function if it exists
DROP FUNCTION IF EXISTS get_all_user_emails();

-- Create a simpler version that should work
CREATE OR REPLACE FUNCTION get_all_user_emails()
RETURNS TABLE (
  user_id UUID,
  email TEXT
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT
    id as user_id,
    email::text as email
  FROM auth.users;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_all_user_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_user_emails() TO anon;
