-- =====================================================
-- CREATE FUNCTION TO GET USER EMAILS
-- =====================================================
-- This allows the admin dashboard to fetch user email addresses

-- Create a function that returns user information
CREATE OR REPLACE FUNCTION get_user_emails()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT
    id as user_id,
    email,
    created_at
  FROM auth.users;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails() TO authenticated;
