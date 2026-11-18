-- Grant admin-panel access to an account that already exists in Supabase Auth.
-- Grants admin access to admin@ecohealth.com.
-- Run this in the Supabase SQL Editor as a project owner/admin.
--
-- This does not create an account or set a password. Create the account first
-- in Supabase Dashboard > Authentication > Users, and set its password there.

DO $$
DECLARE
  admin_email text := lower(btrim('admin@ecohealth.com'));
  admin_user_id uuid;
BEGIN
  SELECT id
  INTO admin_user_id
  FROM auth.users
  WHERE lower(email) = admin_email;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No Supabase Auth account found for %. Create the account first.', admin_email;
  END IF;

  INSERT INTO public.admin_users (user_id)
  VALUES (admin_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Admin access granted to % (user id %).', admin_email, admin_user_id;
END
$$;
