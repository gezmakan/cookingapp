-- =====================================================
-- ADMIN PERMISSIONS - Allow admin to view user data
-- =====================================================
-- Run this to allow the admin dashboard to fetch user information

-- Create a function to get user details (requires service_role or admin privileges)
-- This is a workaround since auth.users is not directly accessible from the client

-- Create a view that shows user stats
CREATE OR REPLACE VIEW user_stats AS
SELECT
  e.user_id,
  COUNT(*) as exercise_count,
  MIN(e.created_at) as first_exercise_created
FROM exercises e
WHERE e.user_id IS NOT NULL
GROUP BY e.user_id;

-- Grant access to the view
GRANT SELECT ON user_stats TO authenticated;

-- Enable RLS on the view (optional, but good practice)
ALTER VIEW user_stats SET (security_invoker = true);
