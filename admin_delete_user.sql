-- Function to delete a user and all associated data (cascade)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  requester_email TEXT;
  target_email TEXT;
  super_admin_email CONSTANT TEXT := 'slmxyz@gmail.com';
BEGIN
  -- Ensure the caller is authenticated and is the super admin
  SELECT email INTO requester_email FROM auth.users WHERE id = auth.uid();
  IF requester_email IS NULL OR requester_email <> super_admin_email THEN
    RAISE EXCEPTION 'Not authorized to delete users.';
  END IF;

  -- Get target email
  SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;
  IF target_email IS NULL THEN
    RAISE EXCEPTION 'User not found.';
  END IF;
  IF target_email = super_admin_email THEN
    RAISE EXCEPTION 'Cannot delete the primary admin account.';
  END IF;

  -- Delete user (cascade removes dependent rows)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
