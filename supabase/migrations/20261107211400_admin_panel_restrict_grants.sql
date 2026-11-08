/*
# Restrict table permissions for admin access

1. Modified Tables
- `enquiries`: visitors (anonymous role) lose every permission except submitting a new enquiry. Signed-in accounts can submit, and read or change only the status of enquiries when they are on the admin list.
- `admin_users`: the anonymous role loses all permissions. Signed-in accounts can only read the admin list through the row rule that limits them to their own entry.

2. Security
- Removes default permissions that the platform granted to the anonymous and signed-in roles on these tables.
- Keeps the least permissions needed for the public form and admin area.

3. Notes
- Idempotent: safe to run again.
- No data is changed or deleted.
*/

REVOKE ALL ON enquiries FROM anon;
REVOKE ALL ON enquiries FROM authenticated;
GRANT INSERT ON enquiries TO anon, authenticated;
GRANT SELECT ON enquiries TO authenticated;
GRANT UPDATE (status) ON enquiries TO authenticated;

REVOKE ALL ON admin_users FROM anon;
REVOKE ALL ON admin_users FROM authenticated;
GRANT SELECT ON admin_users TO authenticated;
