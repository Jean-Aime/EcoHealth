/*
# Admin access for enquiries

1. New Tables
- `admin_users`: a list of signed-in accounts allowed to use the admin area.
  - `user_id` (uuid, primary key) links to the account in the authentication system.
  - `created_at` (timestamp).

2. Modified Tables
- `enquiries`: access tightened so only listed admins can read or change enquiries.
  - Admins can read all enquiries.
  - Admins can change only the `status` of an enquiry.
  - Nobody can delete enquiries through the website.
  - The public contact form can only create new enquiries that include consent, so visitors cannot mark enquiries as handled or read others.

3. Security
- Row level security enabled on `admin_users`.
- Each signed-in account can read only its own row in `admin_users`, which lets the admin area check access.
- Accounts are NOT added here. The site owner adds an admin by inserting that account's id into `admin_users`.
- Any signed-in account that is not listed sees nothing.

4. Notes
- Public sign-up is not offered; staff accounts are created by the site owner.
- Idempotent: safe to run again.
*/

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON admin_users TO authenticated;

DROP POLICY IF EXISTS "select_own_admin_row" ON admin_users;
CREATE POLICY "select_own_admin_row"
ON admin_users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

REVOKE UPDATE, DELETE ON enquiries FROM authenticated;
GRANT UPDATE (status) ON enquiries TO authenticated;

DROP POLICY IF EXISTS "auth_select_enquiries" ON enquiries;
DROP POLICY IF EXISTS "auth_update_enquiries" ON enquiries;
DROP POLICY IF EXISTS "auth_delete_enquiries" ON enquiries;
DROP POLICY IF EXISTS "anon_insert_enquiries" ON enquiries;

CREATE POLICY "anon_insert_enquiries"
ON enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (consent = true AND status = 'new');

CREATE POLICY "admin_select_enquiries"
ON enquiries FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "admin_update_enquiries"
ON enquiries FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
