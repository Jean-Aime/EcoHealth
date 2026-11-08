/*
# Create enquiries table for contact form submissions

1. New Tables
- `enquiries`
  - `id` (uuid, primary key)
  - `full_name` (text, not null) — submitter's full name
  - `organisation` (text) — organisation or company name
  - `email` (text, not null) — business email address
  - `telephone` (text) — phone number
  - `service_required` (text) — which service they are enquiring about
  - `project_location` (text) — where the project/work is located
  - `description` (text, not null) — description of requirements
  - `preferred_contact` (text) — preferred contact method (email/phone)
  - `enquiry_type` (text) — type of enquiry (general/training/partnership)
  - `consent` (boolean, not null default false) — privacy consent checkbox
  - `status` (text, not null default 'new') — enquiry status for tracking
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `enquiries`.
- Grant INSERT to `anon, authenticated` so the public contact form can submit.
- Grant SELECT/UPDATE/DELETE to `authenticated` only (for staff to review enquiries).
- Allow anon + authenticated INSERT because the contact form is public (no sign-in).
- No SELECT policy for anon — visitors should not be able to read other people's enquiries.

3. Notes
- This is a single-tenant public contact form. No user accounts or auth required.
- Only INSERT is open to anon; all reads are restricted to authenticated (staff).
- A status column allows simple enquiry management once staff access is added.
*/

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  organisation text,
  email text NOT NULL,
  telephone text,
  service_required text,
  project_location text,
  description text NOT NULL,
  preferred_contact text DEFAULT 'email',
  enquiry_type text DEFAULT 'general',
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON enquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON enquiries TO authenticated;

DROP POLICY IF EXISTS "anon_insert_enquiries" ON enquiries;
CREATE POLICY "anon_insert_enquiries"
ON enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_enquiries" ON enquiries;
CREATE POLICY "auth_select_enquiries"
ON enquiries FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "auth_update_enquiries" ON enquiries;
CREATE POLICY "auth_update_enquiries"
ON enquiries FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_enquiries" ON enquiries;
CREATE POLICY "auth_delete_enquiries"
ON enquiries FOR DELETE
TO authenticated
USING (true);
