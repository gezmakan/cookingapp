-- Function to get all user emails for admin panel
-- This allows admins to see which user created each meal

CREATE OR REPLACE FUNCTION get_all_user_emails()
RETURNS TABLE (
  user_id UUID,
  email TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow if current user is an admin (you'll need to implement admin check)
  -- For now, this returns all emails
  RETURN QUERY
  SELECT
    au.id as user_id,
    au.email as email
  FROM auth.users au;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_user_emails() TO authenticated;
