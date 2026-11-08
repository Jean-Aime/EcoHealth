/*
# Content management and site settings

1. New Tables
- `articles`: Insights articles, editable from the staff admin panel.
  - `slug` unique public identifier; `body` stores paragraphs separated by blank lines.
  - `published` controls public visibility; drafts stay visible to admins only.
- `case_studies`: Projects & Experience entries, editable from the staff admin panel.
  - Structured scope/approach/outcome fields so approved case studies can be added without code changes.
  - `confidential` lets an entry hide its client identity in the public layout.
- `site_settings`: A single row of company details the owner can update without a developer.
  - Contact details, LinkedIn URL and the approved company profile document URL.

2. Security
- Row level security enabled on all three tables.
- Public (anonymous) visitors can read published articles and published case studies only.
- Public visitors can read site settings (contact details are published information).
- Only accounts listed in `admin_users` can create, edit or delete content, and they can read drafts.
- Anonymous role receives no write permission at all.

3. Notes
- Idempotent: safe to run again.
- The site continues to render its built-in seed content if these tables are empty or unreachable.
- Add an admin by inserting that account's id into `admin_users` (see earlier migration).
*/

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Risk Management',
  excerpt text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_url text,
  read_time text NOT NULL DEFAULT '4 min read',
  published boolean NOT NULL DEFAULT false,
  published_at date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  industry text,
  location text,
  scope text NOT NULL,
  responsibilities text NOT NULL DEFAULT '',
  approach text NOT NULL DEFAULT '',
  outcomes text NOT NULL DEFAULT '',
  image_url text,
  image_alt text,
  confidential boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  phone text,
  email text,
  address text,
  linkedin_url text,
  company_profile_url text,
  company_profile_label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.articles FROM anon, authenticated;
REVOKE ALL ON public.case_studies FROM anon, authenticated;
REVOKE ALL ON public.site_settings FROM anon, authenticated;

GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.case_studies TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;

DROP POLICY IF EXISTS "public_read_published_articles" ON public.articles;
CREATE POLICY "public_read_published_articles"
ON public.articles FOR SELECT
TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "admin_read_articles" ON public.articles;
CREATE POLICY "admin_read_articles"
ON public.articles FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_insert_articles" ON public.articles;
CREATE POLICY "admin_insert_articles"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_articles" ON public.articles;
CREATE POLICY "admin_update_articles"
ON public.articles FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_articles" ON public.articles;
CREATE POLICY "admin_delete_articles"
ON public.articles FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "public_read_published_case_studies" ON public.case_studies;
CREATE POLICY "public_read_published_case_studies"
ON public.case_studies FOR SELECT
TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "admin_read_case_studies" ON public.case_studies;
CREATE POLICY "admin_read_case_studies"
ON public.case_studies FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_insert_case_studies" ON public.case_studies;
CREATE POLICY "admin_insert_case_studies"
ON public.case_studies FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_case_studies" ON public.case_studies;
CREATE POLICY "admin_update_case_studies"
ON public.case_studies FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_case_studies" ON public.case_studies;
CREATE POLICY "admin_delete_case_studies"
ON public.case_studies FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_insert_site_settings" ON public.site_settings;
CREATE POLICY "admin_insert_site_settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_site_settings" ON public.site_settings;
CREATE POLICY "admin_update_site_settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS articles_published_idx ON public.articles (published, published_at DESC);
CREATE INDEX IF NOT EXISTS case_studies_published_idx ON public.case_studies (published, sort_order);
