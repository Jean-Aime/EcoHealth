-- Training management schema. No course, session, learner, or certificate seed
-- records are created; EcoHealth must publish verified offerings itself.

CREATE OR REPLACE FUNCTION public.is_training_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_training_admin() TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.training_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  organisation text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_profiles_name_length CHECK (char_length(full_name) <= 120),
  CONSTRAINT training_profiles_phone_length CHECK (char_length(phone) <= 30),
  CONSTRAINT training_profiles_organisation_length CHECK (char_length(organisation) <= 160)
);

CREATE OR REPLACE FUNCTION public.create_training_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.training_profiles (user_id, full_name)
  VALUES (
    NEW.id,
    left(btrim(coalesce(NEW.raw_user_meta_data ->> 'full_name', '')), 120)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_training_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_training_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_training_profile();

INSERT INTO public.training_profiles (user_id, full_name)
SELECT id, left(btrim(coalesce(raw_user_meta_data ->> 'full_name', '')), 120)
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.training_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_categories_name_length CHECK (char_length(btrim(name)) BETWEEN 2 AND 100),
  CONSTRAINT training_categories_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE IF NOT EXISTS public.training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.training_categories(id) ON DELETE RESTRICT,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  learning_objectives text[] NOT NULL DEFAULT '{}',
  target_audience text NOT NULL DEFAULT '',
  prerequisites text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL,
  delivery_formats text[] NOT NULL DEFAULT '{}',
  price_minor integer,
  currency text NOT NULL DEFAULT 'RWF',
  requires_assessment boolean NOT NULL DEFAULT false,
  passing_score numeric(5,2) NOT NULL DEFAULT 70,
  published boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_courses_title_length CHECK (char_length(btrim(title)) BETWEEN 2 AND 160),
  CONSTRAINT training_courses_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT training_courses_duration CHECK (duration_minutes BETWEEN 1 AND 100000),
  CONSTRAINT training_courses_price CHECK (price_minor IS NULL OR price_minor >= 0),
  CONSTRAINT training_courses_currency CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT training_courses_passing_score CHECK (passing_score BETWEEN 0 AND 100),
  CONSTRAINT training_courses_delivery_formats CHECK (
    delivery_formats <@ ARRAY['classroom', 'onsite', 'online', 'hybrid']::text[]
  )
);

CREATE TABLE IF NOT EXISTS public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  location text NOT NULL DEFAULT '',
  delivery_format text NOT NULL,
  capacity integer,
  price_minor integer,
  status text NOT NULL DEFAULT 'draft',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_sessions_time CHECK (ends_at > starts_at),
  CONSTRAINT training_sessions_capacity CHECK (capacity IS NULL OR capacity BETWEEN 1 AND 10000),
  CONSTRAINT training_sessions_price CHECK (price_minor IS NULL OR price_minor >= 0),
  CONSTRAINT training_sessions_status CHECK (status IN ('draft', 'open', 'cancelled', 'completed')),
  CONSTRAINT training_sessions_delivery_format CHECK (delivery_format IN ('classroom', 'onsite', 'online', 'hybrid'))
);

CREATE TABLE IF NOT EXISTS public.training_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.training_sessions(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  idempotency_key uuid NOT NULL UNIQUE,
  registration_type text NOT NULL,
  organisation text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  participant_count integer NOT NULL,
  additional_requirements text NOT NULL DEFAULT '',
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  review_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_registrations_type CHECK (registration_type IN ('individual', 'group')),
  CONSTRAINT training_registrations_count CHECK (participant_count BETWEEN 1 AND 100),
  CONSTRAINT training_registrations_status CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted', 'cancelled')),
  CONSTRAINT training_registrations_contact_name CHECK (char_length(btrim(contact_name)) BETWEEN 2 AND 120),
  CONSTRAINT training_registrations_contact_email CHECK (
    char_length(btrim(contact_email)) BETWEEN 5 AND 254
    AND contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
  ),
  CONSTRAINT training_registrations_organisation_length CHECK (organisation IS NULL OR char_length(organisation) <= 160),
  CONSTRAINT training_registrations_phone_length CHECK (contact_phone IS NULL OR char_length(contact_phone) <= 30),
  CONSTRAINT training_registrations_requirements_length CHECK (char_length(additional_requirements) <= 2000),
  CONSTRAINT training_registrations_consent_required CHECK (consent),
  CONSTRAINT training_registrations_review_note_length CHECK (char_length(review_note) <= 1000)
);

CREATE UNIQUE INDEX IF NOT EXISTS training_registrations_one_active_per_owner
  ON public.training_registrations (session_id, owner_id)
  WHERE status IN ('pending', 'approved', 'waitlisted');

CREATE TABLE IF NOT EXISTS public.training_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.training_registrations(id) ON DELETE RESTRICT,
  account_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_participants_name_length CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  CONSTRAINT training_participants_email_length CHECK (
    char_length(btrim(email)) BETWEEN 5 AND 254
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS training_participants_one_account_per_registration
  ON public.training_participants (registration_id, account_id)
  WHERE account_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS training_participants_one_email_per_registration
  ON public.training_participants (registration_id, lower(email));

CREATE TABLE IF NOT EXISTS public.training_attendance (
  participant_id uuid PRIMARY KEY REFERENCES public.training_participants(id) ON DELETE RESTRICT,
  status text NOT NULL,
  notes text NOT NULL DEFAULT '',
  marked_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_attendance_status CHECK (status IN ('present', 'absent', 'excused')),
  CONSTRAINT training_attendance_notes_length CHECK (char_length(notes) <= 1000)
);

CREATE TABLE IF NOT EXISTS public.training_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE RESTRICT,
  title text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_assessments_title_length CHECK (char_length(btrim(title)) BETWEEN 2 AND 160),
  CONSTRAINT training_assessments_instructions_length CHECK (char_length(instructions) <= 4000)
);

CREATE TABLE IF NOT EXISTS public.training_assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.training_participants(id) ON DELETE RESTRICT,
  assessment_id uuid NOT NULL REFERENCES public.training_assessments(id) ON DELETE RESTRICT,
  score numeric(5,2) NOT NULL,
  passed boolean NOT NULL,
  notes text NOT NULL DEFAULT '',
  assessed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_assessment_results_score CHECK (score BETWEEN 0 AND 100),
  CONSTRAINT training_assessment_results_notes_length CHECK (char_length(notes) <= 1000),
  CONSTRAINT training_assessment_results_unique UNIQUE (participant_id, assessment_id)
);

CREATE TABLE IF NOT EXISTS public.training_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE RESTRICT,
  session_id uuid REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  storage_path text NOT NULL UNIQUE,
  published boolean NOT NULL DEFAULT false,
  uploaded_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_materials_title_length CHECK (char_length(btrim(title)) BETWEEN 2 AND 160),
  CONSTRAINT training_materials_description_length CHECK (char_length(description) <= 1000)
);

CREATE TABLE IF NOT EXISTS public.training_certificate_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  issuer_name text NOT NULL DEFAULT '',
  issuer_title text NOT NULL DEFAULT '',
  issuer_organisation text NOT NULL DEFAULT '',
  issuer_authorized boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_certificate_issuer_name_length CHECK (char_length(issuer_name) <= 160),
  CONSTRAINT training_certificate_issuer_title_length CHECK (char_length(issuer_title) <= 120),
  CONSTRAINT training_certificate_issuer_org_length CHECK (char_length(issuer_organisation) <= 160)
);

INSERT INTO public.training_certificate_settings (id) VALUES (true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.training_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL UNIQUE REFERENCES public.training_participants(id) ON DELETE RESTRICT,
  certificate_number text NOT NULL UNIQUE,
  verification_code uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  participant_name text NOT NULL,
  course_title text NOT NULL,
  completion_date date NOT NULL,
  issuer_name text NOT NULL,
  issuer_title text NOT NULL,
  issuer_organisation text NOT NULL,
  issued_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revocation_reason text NOT NULL DEFAULT '',
  CONSTRAINT training_certificates_reason_length CHECK (char_length(revocation_reason) <= 1000)
);

CREATE TABLE IF NOT EXISTS public.training_corporate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  requester_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organisation text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL DEFAULT '',
  requirements text NOT NULL,
  participant_estimate integer NOT NULL,
  preferred_dates text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  additional_information text NOT NULL DEFAULT '',
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new',
  admin_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_corporate_org_length CHECK (char_length(btrim(organisation)) BETWEEN 2 AND 160),
  CONSTRAINT training_corporate_contact_name_length CHECK (char_length(btrim(contact_name)) BETWEEN 2 AND 120),
  CONSTRAINT training_corporate_email_format CHECK (
    char_length(btrim(email)) BETWEEN 5 AND 254
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
  ),
  CONSTRAINT training_corporate_phone_length CHECK (char_length(telephone) <= 30),
  CONSTRAINT training_corporate_requirements_length CHECK (char_length(btrim(requirements)) BETWEEN 20 AND 4000),
  CONSTRAINT training_corporate_participants CHECK (participant_estimate BETWEEN 1 AND 10000),
  CONSTRAINT training_corporate_dates_length CHECK (char_length(preferred_dates) <= 500),
  CONSTRAINT training_corporate_location_length CHECK (char_length(location) <= 160),
  CONSTRAINT training_corporate_additional_length CHECK (char_length(additional_information) <= 2000),
  CONSTRAINT training_corporate_consent_required CHECK (consent),
  CONSTRAINT training_corporate_status CHECK (status IN ('new', 'under_review', 'responded', 'closed')),
  CONSTRAINT training_corporate_admin_note_length CHECK (char_length(admin_note) <= 1000)
);

CREATE TABLE IF NOT EXISTS public.training_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name text NOT NULL,
  record_id uuid,
  operation text NOT NULL,
  before_data jsonb,
  after_data jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS training_courses_public_idx
  ON public.training_courses (published, archived_at, category_id);
CREATE INDEX IF NOT EXISTS training_sessions_public_idx
  ON public.training_sessions (course_id, published, status, starts_at);
CREATE INDEX IF NOT EXISTS training_registrations_owner_idx
  ON public.training_registrations (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS training_registrations_session_status_idx
  ON public.training_registrations (session_id, status);
CREATE INDEX IF NOT EXISTS training_participants_account_idx
  ON public.training_participants (account_id);
CREATE INDEX IF NOT EXISTS training_corporate_requests_created_idx
  ON public.training_corporate_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS training_corporate_requests_email_recent_idx
  ON public.training_corporate_requests (lower(email), created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_training_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'training_profiles', 'training_categories', 'training_courses', 'training_sessions',
    'training_registrations', 'training_assessments', 'training_certificate_settings',
    'training_corporate_requests'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS touch_training_updated_at_before ON public.%I', table_name);
    EXECUTE format(
      'CREATE TRIGGER touch_training_updated_at_before BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_training_updated_at()',
      table_name
    );
  END LOOP;
END;
$$;

ALTER TABLE public.training_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_certificate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_corporate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.training_profiles, public.training_categories, public.training_courses,
  public.training_sessions, public.training_registrations, public.training_participants,
  public.training_attendance, public.training_assessments, public.training_assessment_results,
  public.training_materials, public.training_certificate_settings, public.training_certificates,
  public.training_corporate_requests, public.training_audit_log FROM anon, authenticated;

GRANT SELECT ON public.training_categories, public.training_courses, public.training_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.training_profiles TO authenticated;
GRANT INSERT ON public.training_corporate_requests TO anon, authenticated;
GRANT SELECT ON public.training_registrations, public.training_participants,
  public.training_attendance, public.training_assessment_results,
  public.training_materials, public.training_certificates TO authenticated;
GRANT SELECT ON public.training_assessments, public.training_certificate_settings,
  public.training_audit_log TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.training_categories, public.training_courses,
  public.training_sessions, public.training_assessments, public.training_materials TO authenticated;
GRANT SELECT, UPDATE ON public.training_corporate_requests TO authenticated;

DROP POLICY IF EXISTS training_profiles_self_read ON public.training_profiles;
CREATE POLICY training_profiles_self_read ON public.training_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_training_admin());
DROP POLICY IF EXISTS training_profiles_self_update ON public.training_profiles;
CREATE POLICY training_profiles_self_update ON public.training_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_training_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_training_admin());
DROP POLICY IF EXISTS training_profiles_admin_insert ON public.training_profiles;
CREATE POLICY training_profiles_admin_insert ON public.training_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_training_admin());

DROP POLICY IF EXISTS training_categories_read ON public.training_categories;
CREATE POLICY training_categories_read ON public.training_categories
  FOR SELECT TO anon, authenticated USING (
    public.is_training_admin()
    OR EXISTS (
      SELECT 1 FROM public.training_courses c
      WHERE c.category_id = id AND c.published AND c.archived_at IS NULL
    )
  );
DROP POLICY IF EXISTS training_categories_admin_write ON public.training_categories;
CREATE POLICY training_categories_admin_write ON public.training_categories
  FOR ALL TO authenticated USING (public.is_training_admin())
  WITH CHECK (public.is_training_admin());

DROP POLICY IF EXISTS training_courses_read ON public.training_courses;
CREATE POLICY training_courses_read ON public.training_courses
  FOR SELECT TO anon, authenticated USING (
    public.is_training_admin() OR (published AND archived_at IS NULL)
  );
DROP POLICY IF EXISTS training_courses_admin_write ON public.training_courses;
CREATE POLICY training_courses_admin_write ON public.training_courses
  FOR ALL TO authenticated USING (public.is_training_admin())
  WITH CHECK (public.is_training_admin());

DROP POLICY IF EXISTS training_sessions_read ON public.training_sessions;
CREATE POLICY training_sessions_read ON public.training_sessions
  FOR SELECT TO anon, authenticated USING (
    public.is_training_admin()
    OR (
      published AND status = 'open'
      AND EXISTS (
        SELECT 1 FROM public.training_courses c
        WHERE c.id = course_id AND c.published AND c.archived_at IS NULL
      )
    )
  );
DROP POLICY IF EXISTS training_sessions_admin_write ON public.training_sessions;
CREATE POLICY training_sessions_admin_write ON public.training_sessions
  FOR ALL TO authenticated USING (public.is_training_admin())
  WITH CHECK (public.is_training_admin());

DROP POLICY IF EXISTS training_registrations_read ON public.training_registrations;
CREATE POLICY training_registrations_read ON public.training_registrations
  FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.is_training_admin());

DROP POLICY IF EXISTS training_participants_read ON public.training_participants;
CREATE POLICY training_participants_read ON public.training_participants
  FOR SELECT TO authenticated USING (
    account_id = auth.uid()
    OR public.is_training_admin()
    OR EXISTS (
      SELECT 1 FROM public.training_registrations r
      WHERE r.id = registration_id AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS training_attendance_read ON public.training_attendance;
CREATE POLICY training_attendance_read ON public.training_attendance
  FOR SELECT TO authenticated USING (
    public.is_training_admin()
    OR EXISTS (
      SELECT 1 FROM public.training_participants p
      WHERE p.id = participant_id AND p.account_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.training_participants p
      JOIN public.training_registrations r ON r.id = p.registration_id
      WHERE p.id = participant_id AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS training_assessments_read ON public.training_assessments;
CREATE POLICY training_assessments_read ON public.training_assessments
  FOR SELECT TO authenticated USING (
    public.is_training_admin()
    OR (active AND EXISTS (
      SELECT 1 FROM public.training_registrations r
      JOIN public.training_sessions s ON s.id = r.session_id
      WHERE s.course_id = training_assessments.course_id
        AND r.owner_id = auth.uid() AND r.status = 'approved'
    ))
  );
DROP POLICY IF EXISTS training_assessments_admin_write ON public.training_assessments;
CREATE POLICY training_assessments_admin_write ON public.training_assessments
  FOR ALL TO authenticated USING (public.is_training_admin())
  WITH CHECK (public.is_training_admin());

DROP POLICY IF EXISTS training_assessment_results_read ON public.training_assessment_results;
CREATE POLICY training_assessment_results_read ON public.training_assessment_results
  FOR SELECT TO authenticated USING (
    public.is_training_admin()
    OR EXISTS (
      SELECT 1 FROM public.training_participants p
      WHERE p.id = participant_id AND p.account_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.training_participants p
      JOIN public.training_registrations r ON r.id = p.registration_id
      WHERE p.id = participant_id AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS training_materials_read ON public.training_materials;
CREATE POLICY training_materials_read ON public.training_materials
  FOR SELECT TO authenticated USING (
    public.is_training_admin()
    OR (
      published AND EXISTS (
        SELECT 1 FROM public.training_registrations r
        JOIN public.training_sessions s ON s.id = r.session_id
        WHERE s.course_id = training_materials.course_id
          AND (training_materials.session_id IS NULL OR s.id = training_materials.session_id)
          AND r.status = 'approved'
          AND (
            r.owner_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.training_participants p
              WHERE p.registration_id = r.id AND p.account_id = auth.uid()
            )
          )
      )
    )
  );
DROP POLICY IF EXISTS training_materials_admin_write ON public.training_materials;
CREATE POLICY training_materials_admin_write ON public.training_materials
  FOR ALL TO authenticated USING (public.is_training_admin())
  WITH CHECK (public.is_training_admin());

DROP POLICY IF EXISTS training_certificate_settings_admin ON public.training_certificate_settings;
CREATE POLICY training_certificate_settings_admin ON public.training_certificate_settings
  FOR ALL TO authenticated USING (public.is_training_admin())
  WITH CHECK (public.is_training_admin());

DROP POLICY IF EXISTS training_certificates_read ON public.training_certificates;
CREATE POLICY training_certificates_read ON public.training_certificates
  FOR SELECT TO authenticated USING (
    public.is_training_admin()
    OR EXISTS (
      SELECT 1 FROM public.training_participants p
      WHERE p.id = participant_id AND p.account_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.training_participants p
      JOIN public.training_registrations r ON r.id = p.registration_id
      WHERE p.id = participant_id AND r.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS training_corporate_requests_insert ON public.training_corporate_requests;
CREATE POLICY training_corporate_requests_insert ON public.training_corporate_requests
  FOR INSERT TO anon, authenticated WITH CHECK (
    requester_id IS NULL OR requester_id = auth.uid()
  );
DROP POLICY IF EXISTS training_corporate_requests_admin_read ON public.training_corporate_requests;
CREATE POLICY training_corporate_requests_admin_read ON public.training_corporate_requests
  FOR SELECT TO authenticated USING (public.is_training_admin());
DROP POLICY IF EXISTS training_corporate_requests_admin_update ON public.training_corporate_requests;
CREATE POLICY training_corporate_requests_admin_update ON public.training_corporate_requests
  FOR UPDATE TO authenticated USING (public.is_training_admin())
  WITH CHECK (public.is_training_admin());

DROP POLICY IF EXISTS training_audit_admin_read ON public.training_audit_log;
CREATE POLICY training_audit_admin_read ON public.training_audit_log
  FOR SELECT TO authenticated USING (public.is_training_admin());

CREATE OR REPLACE FUNCTION public.audit_training_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  before_row jsonb;
  after_row jsonb;
  changed_id uuid;
BEGIN
  IF TG_OP <> 'INSERT' THEN before_row := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN after_row := to_jsonb(NEW); END IF;
  changed_id := coalesce(
    (after_row ->> 'id')::uuid,
    (after_row ->> 'participant_id')::uuid,
    (after_row ->> 'user_id')::uuid,
    (before_row ->> 'id')::uuid,
    (before_row ->> 'participant_id')::uuid,
    (before_row ->> 'user_id')::uuid
  );
  INSERT INTO public.training_audit_log (actor_id, table_name, record_id, operation, before_data, after_data)
  VALUES (auth.uid(), TG_TABLE_NAME, changed_id, TG_OP, before_row, after_row);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'training_categories', 'training_courses', 'training_sessions', 'training_registrations',
    'training_participants',
    'training_attendance', 'training_assessments', 'training_assessment_results',
    'training_materials', 'training_certificates', 'training_corporate_requests'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_training_change ON public.%I', table_name);
    EXECUTE format(
      'CREATE TRIGGER audit_training_change AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_training_change()',
      table_name
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.harden_training_corporate_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_count integer;
BEGIN
  NEW.organisation := btrim(regexp_replace(NEW.organisation, '\s+', ' ', 'g'));
  NEW.contact_name := btrim(regexp_replace(NEW.contact_name, '\s+', ' ', 'g'));
  NEW.email := lower(btrim(NEW.email));
  NEW.telephone := btrim(regexp_replace(coalesce(NEW.telephone, ''), '\s+', ' ', 'g'));
  NEW.requester_id := auth.uid();
  NEW.status := 'new';
  NEW.admin_note := '';

  PERFORM pg_advisory_xact_lock(hashtext(NEW.email));
  SELECT count(*) INTO recent_count
  FROM public.training_corporate_requests
  WHERE lower(email) = NEW.email
    AND created_at > now() - interval '10 minutes';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many training enquiries from this email address'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS harden_training_corporate_request_before_insert ON public.training_corporate_requests;
CREATE TRIGGER harden_training_corporate_request_before_insert
  BEFORE INSERT ON public.training_corporate_requests
  FOR EACH ROW EXECUTE FUNCTION public.harden_training_corporate_request();

CREATE OR REPLACE FUNCTION public.validate_training_session_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  reserved_count integer;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.course_id <> OLD.course_id AND EXISTS (
      SELECT 1 FROM public.training_registrations WHERE session_id = OLD.id
    ) THEN
      RAISE EXCEPTION 'A session with registrations cannot be moved to another course';
    END IF;
  END IF;

  SELECT coalesce(sum(participant_count), 0) INTO reserved_count
  FROM public.training_registrations
  WHERE session_id = NEW.id AND status IN ('pending', 'approved');
  IF NEW.capacity IS NOT NULL AND reserved_count > NEW.capacity THEN
    RAISE EXCEPTION 'Session capacity cannot be reduced below reserved places';
  END IF;
  IF NEW.status = 'completed' AND NEW.ends_at > now() THEN
    RAISE EXCEPTION 'A session cannot be completed before its scheduled end';
  END IF;
  IF NEW.status = 'completed' AND EXISTS (
    SELECT 1 FROM public.training_registrations
    WHERE session_id = NEW.id AND status IN ('pending', 'waitlisted')
  ) THEN
    RAISE EXCEPTION 'Resolve pending and waitlisted registrations before completing the session';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_training_session_update_before ON public.training_sessions;
CREATE TRIGGER validate_training_session_update_before
  BEFORE INSERT OR UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_training_session_update();

CREATE OR REPLACE FUNCTION public.validate_training_material_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.session_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.training_sessions
    WHERE id = NEW.session_id AND course_id = NEW.course_id
  ) THEN
    RAISE EXCEPTION 'The selected session does not belong to this course';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_training_material_course_before_insert ON public.training_materials;
CREATE TRIGGER validate_training_material_course_before_insert
  BEFORE INSERT ON public.training_materials
  FOR EACH ROW EXECUTE FUNCTION public.validate_training_material_course();
DROP TRIGGER IF EXISTS validate_training_material_course_before_update ON public.training_materials;
CREATE TRIGGER validate_training_material_course_before_update
  BEFORE UPDATE ON public.training_materials
  FOR EACH ROW EXECUTE FUNCTION public.validate_training_material_course();

CREATE OR REPLACE FUNCTION public.register_for_training(
  p_session_id uuid,
  p_registration_type text,
  p_organisation text,
  p_participants jsonb,
  p_contact_phone text,
  p_additional_requirements text,
  p_consent boolean,
  p_idempotency_key uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_email text;
  current_name text;
  session_row public.training_sessions%ROWTYPE;
  registration_id uuid;
  participant_count integer;
  reserved_count integer;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign in is required'; END IF;
  SELECT email INTO current_email FROM auth.users
  WHERE id = current_user_id AND email_confirmed_at IS NOT NULL;
  IF current_email IS NULL THEN RAISE EXCEPTION 'Confirm your email before registering'; END IF;
  IF p_registration_type NOT IN ('individual', 'group') THEN RAISE EXCEPTION 'Invalid registration type'; END IF;
  IF p_idempotency_key IS NULL THEN RAISE EXCEPTION 'A request key is required'; END IF;
  IF p_consent IS DISTINCT FROM true THEN RAISE EXCEPTION 'Consent is required'; END IF;
  IF jsonb_typeof(p_participants) <> 'array' THEN RAISE EXCEPTION 'Participants must be a list'; END IF;
  participant_count := jsonb_array_length(p_participants);
  IF participant_count < 1 OR participant_count > 100 THEN RAISE EXCEPTION 'Participant count is outside the permitted range'; END IF;
  IF p_registration_type = 'individual' AND participant_count <> 1 THEN
    RAISE EXCEPTION 'Individual registration requires exactly one participant';
  END IF;
  IF p_registration_type = 'group' AND nullif(btrim(coalesce(p_organisation, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Organisation is required for group registration';
  END IF;
  IF length(coalesce(p_contact_phone, '')) > 30 OR length(coalesce(p_additional_requirements, '')) > 2000 THEN
    RAISE EXCEPTION 'Registration details exceed the permitted length';
  END IF;

  SELECT * INTO session_row FROM public.training_sessions
  WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR NOT session_row.published OR session_row.status <> 'open' THEN
    RAISE EXCEPTION 'This training session is not open for registration';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.training_courses
    WHERE id = session_row.course_id AND published AND archived_at IS NULL
  ) THEN RAISE EXCEPTION 'This course is not available'; END IF;
  IF session_row.starts_at <= now() THEN RAISE EXCEPTION 'Registration for this session has closed'; END IF;

  SELECT id INTO registration_id FROM public.training_registrations
  WHERE idempotency_key = p_idempotency_key AND owner_id = current_user_id;
  IF registration_id IS NOT NULL THEN RETURN registration_id; END IF;

  SELECT id INTO registration_id FROM public.training_registrations
  WHERE session_id = p_session_id AND owner_id = current_user_id
    AND status IN ('pending', 'approved', 'waitlisted');
  IF registration_id IS NOT NULL THEN RETURN registration_id; END IF;

  IF EXISTS (
    SELECT 1 FROM public.training_registrations
    WHERE idempotency_key = p_idempotency_key AND owner_id <> current_user_id
  ) THEN RAISE EXCEPTION 'Invalid registration request key'; END IF;

  SELECT coalesce(sum(participant_count), 0) INTO reserved_count
  FROM public.training_registrations
  WHERE session_id = p_session_id AND status IN ('pending', 'approved');
  IF session_row.capacity IS NOT NULL AND reserved_count + participant_count > session_row.capacity THEN
    RAISE EXCEPTION 'This session does not have enough places available';
  END IF;

  SELECT full_name INTO current_name FROM public.training_profiles WHERE user_id = current_user_id;
  current_name := coalesce(nullif(btrim(current_name), ''), current_email);

  INSERT INTO public.training_registrations (
    session_id, owner_id, idempotency_key, registration_type, organisation,
    contact_name, contact_email, contact_phone, participant_count, additional_requirements, consent
  ) VALUES (
    p_session_id, current_user_id, p_idempotency_key, p_registration_type,
    nullif(btrim(coalesce(p_organisation, '')), ''), current_name, lower(current_email),
    nullif(btrim(coalesce(p_contact_phone, '')), ''), participant_count,
    btrim(coalesce(p_additional_requirements, '')), true
  ) RETURNING id INTO registration_id;

  IF p_registration_type = 'individual' THEN
    INSERT INTO public.training_participants (registration_id, account_id, full_name, email)
    SELECT registration_id, current_user_id,
      left(btrim(coalesce(item ->> 'full_name', current_name)), 120), lower(current_email)
    FROM jsonb_array_elements(p_participants) AS item;
  ELSE
    INSERT INTO public.training_participants (registration_id, full_name, email)
    SELECT registration_id, btrim(item ->> 'full_name'), lower(btrim(item ->> 'email'))
    FROM jsonb_array_elements(p_participants) AS item;
  END IF;

  RETURN registration_id;
END;
$$;

REVOKE ALL ON FUNCTION public.register_for_training(uuid, text, text, jsonb, text, text, boolean, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_for_training(uuid, text, text, jsonb, text, text, boolean, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_training_registration(
  p_registration_id uuid,
  p_status text,
  p_review_note text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  registration_row public.training_registrations%ROWTYPE;
  session_row public.training_sessions%ROWTYPE;
  reserved_count integer;
  session_id uuid;
BEGIN
  IF NOT public.is_training_admin() THEN RAISE EXCEPTION 'Administrator access is required'; END IF;
  IF p_status NOT IN ('approved', 'rejected', 'waitlisted', 'cancelled') THEN RAISE EXCEPTION 'Invalid registration status'; END IF;
  IF length(coalesce(p_review_note, '')) > 1000 THEN RAISE EXCEPTION 'Review note is too long'; END IF;

  SELECT r.session_id INTO session_id FROM public.training_registrations r
  WHERE r.id = p_registration_id;
  IF session_id IS NULL THEN RAISE EXCEPTION 'Registration not found'; END IF;
  SELECT * INTO session_row FROM public.training_sessions
  WHERE id = session_id FOR UPDATE;
  SELECT * INTO registration_row FROM public.training_registrations
  WHERE id = p_registration_id FOR UPDATE;

  IF p_status = 'approved' AND registration_row.status NOT IN ('pending', 'waitlisted') THEN
    RAISE EXCEPTION 'Only pending or waitlisted registrations can be approved';
  END IF;
  IF p_status = 'approved' AND (session_row.status <> 'open' OR session_row.starts_at <= now()) THEN
    RAISE EXCEPTION 'Only future open sessions can be approved';
  END IF;
  IF p_status = 'approved' AND session_row.capacity IS NOT NULL THEN
    SELECT coalesce(sum(participant_count), 0) INTO reserved_count
    FROM public.training_registrations
    WHERE session_id = registration_row.session_id
      AND status IN ('pending', 'approved')
      AND id <> registration_row.id;
    IF reserved_count + registration_row.participant_count > session_row.capacity THEN
      RAISE EXCEPTION 'There are not enough places to approve this registration';
    END IF;
  END IF;

  UPDATE public.training_registrations
  SET status = p_status, review_note = btrim(coalesce(p_review_note, '')), updated_at = now()
  WHERE id = p_registration_id;
END;
$$;

REVOKE ALL ON FUNCTION public.review_training_registration(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_training_registration(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.link_training_participant()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_email text;
  participant_id uuid;
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign in is required'; END IF;
  SELECT lower(email) INTO current_email FROM auth.users
  WHERE id = current_user_id AND email_confirmed_at IS NOT NULL;
  IF current_email IS NULL THEN RAISE EXCEPTION 'Confirm your email before linking a participant record'; END IF;

  UPDATE public.training_participants
  SET account_id = current_user_id
  WHERE id = (
    SELECT p.id
    FROM public.training_participants p
    JOIN public.training_registrations r ON r.id = p.registration_id
    WHERE lower(p.email) = current_email
      AND p.account_id IS NULL
      AND r.status = 'approved'
    ORDER BY p.created_at
    LIMIT 1
    FOR UPDATE
  )
  RETURNING id INTO participant_id;
  IF participant_id IS NULL THEN RAISE EXCEPTION 'No approved participant record matches this account'; END IF;
  RETURN participant_id;
END;
$$;

REVOKE ALL ON FUNCTION public.link_training_participant() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_training_participant() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_training_participants()
RETURNS TABLE (
  participant_id uuid,
  participant_name text,
  course_title text,
  session_starts_at timestamptz,
  session_ends_at timestamptz,
  session_location text,
  registration_status text,
  attendance_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT p.id, p.full_name, c.title, s.starts_at, s.ends_at, s.location, r.status, a.status
  FROM public.training_participants p
  JOIN public.training_registrations r ON r.id = p.registration_id
  JOIN public.training_sessions s ON s.id = r.session_id
  JOIN public.training_courses c ON c.id = s.course_id
  LEFT JOIN public.training_attendance a ON a.participant_id = p.id
  WHERE p.account_id = auth.uid()
  ORDER BY s.starts_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_my_training_participants() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_training_participants() TO authenticated;

CREATE OR REPLACE FUNCTION public.record_training_attendance(
  p_participant_id uuid,
  p_status text,
  p_notes text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_training_admin() THEN RAISE EXCEPTION 'Administrator access is required'; END IF;
  IF p_status NOT IN ('present', 'absent', 'excused') THEN RAISE EXCEPTION 'Invalid attendance status'; END IF;
  IF length(coalesce(p_notes, '')) > 1000 THEN RAISE EXCEPTION 'Attendance note is too long'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.training_participants p
    JOIN public.training_registrations r ON r.id = p.registration_id
    WHERE p.id = p_participant_id AND r.status = 'approved'
  ) THEN RAISE EXCEPTION 'Participant is not on an approved registration'; END IF;
  INSERT INTO public.training_attendance (participant_id, status, notes, marked_by, updated_at)
  VALUES (p_participant_id, p_status, btrim(coalesce(p_notes, '')), auth.uid(), now())
  ON CONFLICT (participant_id) DO UPDATE
  SET status = excluded.status, notes = excluded.notes, marked_by = excluded.marked_by, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.record_training_attendance(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_training_attendance(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_training_assessment(
  p_participant_id uuid,
  p_assessment_id uuid,
  p_score numeric,
  p_notes text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  course_row public.training_courses%ROWTYPE;
  result_id uuid;
BEGIN
  IF NOT public.is_training_admin() THEN RAISE EXCEPTION 'Administrator access is required'; END IF;
  IF p_score < 0 OR p_score > 100 OR length(coalesce(p_notes, '')) > 1000 THEN
    RAISE EXCEPTION 'Assessment result is outside the permitted range';
  END IF;
  SELECT c.* INTO course_row
  FROM public.training_courses c
  JOIN public.training_sessions s ON s.course_id = c.id
  JOIN public.training_registrations r ON r.session_id = s.id
  JOIN public.training_participants p ON p.registration_id = r.id
  JOIN public.training_assessments a ON a.course_id = c.id
  WHERE p.id = p_participant_id AND a.id = p_assessment_id AND a.active
    AND r.status = 'approved'
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Assessment does not match an approved participant course'; END IF;

  INSERT INTO public.training_assessment_results (
    participant_id, assessment_id, score, passed, notes, assessed_by, assessed_at
  ) VALUES (
    p_participant_id, p_assessment_id, p_score, p_score >= course_row.passing_score,
    btrim(coalesce(p_notes, '')), auth.uid(), now()
  )
  ON CONFLICT (participant_id, assessment_id) DO UPDATE
  SET score = excluded.score, passed = excluded.passed, notes = excluded.notes,
      assessed_by = excluded.assessed_by, assessed_at = now()
  RETURNING id INTO result_id;
  RETURN result_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_training_assessment(uuid, uuid, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_training_assessment(uuid, uuid, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.issue_training_certificate(p_participant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  certificate_id uuid;
  participant_row public.training_participants%ROWTYPE;
  course_row public.training_courses%ROWTYPE;
  issuer public.training_certificate_settings%ROWTYPE;
BEGIN
  IF NOT public.is_training_admin() THEN RAISE EXCEPTION 'Administrator access is required'; END IF;

  SELECT p.* INTO participant_row
  FROM public.training_participants p
  JOIN public.training_registrations r ON r.id = p.registration_id
  WHERE p.id = p_participant_id AND r.status = 'approved';
  IF NOT FOUND THEN RAISE EXCEPTION 'Participant does not have an approved registration'; END IF;

  SELECT c.* INTO course_row
  FROM public.training_courses c
  JOIN public.training_sessions s ON s.course_id = c.id
  JOIN public.training_registrations r ON r.session_id = s.id
  WHERE r.id = participant_row.registration_id AND s.status = 'completed';
  IF NOT FOUND THEN RAISE EXCEPTION 'Training session has not been marked completed'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.training_attendance a
    WHERE a.participant_id = p_participant_id AND a.status = 'present'
  ) THEN RAISE EXCEPTION 'Attendance must be recorded as present before certificate issuance'; END IF;

  IF course_row.requires_assessment AND (
    NOT EXISTS (
      SELECT 1 FROM public.training_assessments a
      WHERE a.course_id = course_row.id AND a.active
    )
    OR EXISTS (
      SELECT 1 FROM public.training_assessments a
      WHERE a.course_id = course_row.id AND a.active
        AND NOT EXISTS (
          SELECT 1 FROM public.training_assessment_results ar
          WHERE ar.participant_id = p_participant_id
            AND ar.assessment_id = a.id AND ar.passed
        )
    )
  ) THEN RAISE EXCEPTION 'Passing results for every active course assessment are required'; END IF;

  SELECT * INTO issuer FROM public.training_certificate_settings WHERE id = true;
  IF NOT FOUND OR NOT issuer.issuer_authorized OR issuer.issuer_name = ''
    OR issuer.issuer_title = '' OR issuer.issuer_organisation = '' THEN
    RAISE EXCEPTION 'An authorized certificate issuer must be configured first';
  END IF;

  INSERT INTO public.training_certificates (
    participant_id, certificate_number, participant_name, course_title,
    completion_date, issuer_name, issuer_title, issuer_organisation, issued_by
  ) VALUES (
    p_participant_id,
    'EH-' || to_char(current_date, 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)),
    participant_row.full_name, course_row.title,
    (SELECT s.ends_at::date FROM public.training_sessions s
      JOIN public.training_registrations r ON r.session_id = s.id
      WHERE r.id = participant_row.registration_id AND s.status = 'completed'),
    issuer.issuer_name, issuer.issuer_title, issuer.issuer_organisation, auth.uid()
  ) RETURNING id INTO certificate_id;
  RETURN certificate_id;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_training_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_training_certificate(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.revoke_training_certificate(p_certificate_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_training_admin() THEN RAISE EXCEPTION 'Administrator access is required'; END IF;
  IF length(btrim(coalesce(p_reason, ''))) < 3 OR length(p_reason) > 1000 THEN
    RAISE EXCEPTION 'A revocation reason is required';
  END IF;
  UPDATE public.training_certificates
  SET revoked_at = coalesce(revoked_at, now()), revocation_reason = btrim(p_reason)
  WHERE id = p_certificate_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Certificate not found'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_training_certificate(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_training_certificate(uuid, text) TO authenticated;

DROP FUNCTION IF EXISTS public.verify_training_certificate(uuid);

CREATE OR REPLACE FUNCTION public.verify_training_certificate(p_reference text)
RETURNS TABLE (
  verified boolean,
  certificate_number text,
  participant_name text,
  course_title text,
  completion_date date,
  issuer_name text,
  issuer_title text,
  issuer_organisation text,
  issued_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    c.revoked_at IS NULL,
    c.certificate_number,
    c.participant_name,
    c.course_title,
    c.completion_date,
    c.issuer_name,
    c.issuer_title,
    c.issuer_organisation,
    c.issued_at
  FROM public.training_certificates c
  WHERE length(btrim(p_reference)) BETWEEN 5 AND 80
    AND (
      c.verification_code::text = btrim(p_reference)
      OR upper(c.certificate_number) = upper(btrim(p_reference))
    );
$$;

GRANT EXECUTE ON FUNCTION public.verify_training_certificate(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.save_training_certificate_settings(
  p_issuer_name text,
  p_issuer_title text,
  p_issuer_organisation text,
  p_authorized boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  before_settings jsonb;
  after_settings jsonb;
BEGIN
  IF NOT public.is_training_admin() THEN RAISE EXCEPTION 'Administrator access is required'; END IF;
  IF length(p_issuer_name) > 160 OR length(p_issuer_title) > 120 OR length(p_issuer_organisation) > 160 THEN
    RAISE EXCEPTION 'Issuer information exceeds the permitted length';
  END IF;
  IF p_authorized AND (
    length(btrim(p_issuer_name)) = 0 OR length(btrim(p_issuer_title)) = 0
    OR length(btrim(p_issuer_organisation)) = 0
  ) THEN RAISE EXCEPTION 'Complete issuer details are required'; END IF;
  SELECT to_jsonb(s) INTO before_settings
  FROM public.training_certificate_settings s
  WHERE id = true
  FOR UPDATE;
  UPDATE public.training_certificate_settings
  SET issuer_name = btrim(p_issuer_name), issuer_title = btrim(p_issuer_title),
      issuer_organisation = btrim(p_issuer_organisation), issuer_authorized = p_authorized,
      updated_by = auth.uid(), updated_at = now()
  WHERE id = true;
  SELECT to_jsonb(s) INTO after_settings
  FROM public.training_certificate_settings s
  WHERE id = true;
  INSERT INTO public.training_audit_log (
    actor_id, table_name, operation, before_data, after_data
  ) VALUES (
    auth.uid(), 'training_certificate_settings', 'UPDATE', before_settings, after_settings
  );
END;
$$;

REVOKE ALL ON FUNCTION public.save_training_certificate_settings(text, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_training_certificate_settings(text, text, text, boolean) TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-materials',
  'training-materials',
  false,
  20971520,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg', 'image/png', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE
SET public = false, file_size_limit = 20971520,
    allowed_mime_types = excluded.allowed_mime_types;

DROP POLICY IF EXISTS training_materials_storage_admin_insert ON storage.objects;
CREATE POLICY training_materials_storage_admin_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'training-materials' AND public.is_training_admin()
  );
DROP POLICY IF EXISTS training_materials_storage_admin_update ON storage.objects;
CREATE POLICY training_materials_storage_admin_update ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'training-materials' AND public.is_training_admin()
  ) WITH CHECK (
    bucket_id = 'training-materials' AND public.is_training_admin()
  );
DROP POLICY IF EXISTS training_materials_storage_admin_delete ON storage.objects;
CREATE POLICY training_materials_storage_admin_delete ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'training-materials' AND public.is_training_admin()
  );
DROP POLICY IF EXISTS training_materials_storage_read ON storage.objects;
CREATE POLICY training_materials_storage_read ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'training-materials'
    AND EXISTS (
      SELECT 1 FROM public.training_materials m
      WHERE m.storage_path = name AND m.published
    )
  );
