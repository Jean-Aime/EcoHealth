/*
# Enquiry input hardening

1. Modified Tables
- `enquiries`: adds database-level length, format and enumerated-value checks.
- Adds a supporting index for per-email throttling and recent-enquiry lookups.

2. New Functions / Triggers
- `public.harden_enquiry_before_insert()` normalises whitespace and casing,
  forces public submissions to start with status 'new', and rejects more than
  three submissions from the same email address in a ten-minute window.

3. Security
- Constraints are added as NOT VALID so existing rows are preserved while every
  new INSERT/UPDATE is checked. Validate them later with
  `ALTER TABLE ... VALIDATE CONSTRAINT ...` once existing data is reviewed.
- The trigger is SECURITY DEFINER with an explicit search_path so the throttle
  count is not filtered by row-level security.
- This is defence in depth, not a substitute for rate limiting at a proxy or
  edge if the site is exposed to sustained automated abuse.

4. Notes
- Idempotent: safe to run again.
- Run after 20261107204319_create_enquiries_table.
*/

ALTER TABLE public.enquiries
  DROP CONSTRAINT IF EXISTS enquiries_full_name_length,
  DROP CONSTRAINT IF EXISTS enquiries_organisation_length,
  DROP CONSTRAINT IF EXISTS enquiries_email_format,
  DROP CONSTRAINT IF EXISTS enquiries_telephone_length,
  DROP CONSTRAINT IF EXISTS enquiries_service_length,
  DROP CONSTRAINT IF EXISTS enquiries_location_length,
  DROP CONSTRAINT IF EXISTS enquiries_description_length,
  DROP CONSTRAINT IF EXISTS enquiries_preferred_contact_values,
  DROP CONSTRAINT IF EXISTS enquiries_type_values,
  DROP CONSTRAINT IF EXISTS enquiries_status_values,
  DROP CONSTRAINT IF EXISTS enquiries_consent_required;

ALTER TABLE public.enquiries
  ADD CONSTRAINT enquiries_full_name_length
    CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120) NOT VALID,
  ADD CONSTRAINT enquiries_organisation_length
    CHECK (organisation IS NULL OR char_length(btrim(organisation)) <= 160) NOT VALID,
  ADD CONSTRAINT enquiries_email_format
    CHECK (
      char_length(btrim(email)) BETWEEN 5 AND 254
      AND btrim(email) ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
    ) NOT VALID,
  ADD CONSTRAINT enquiries_telephone_length
    CHECK (telephone IS NULL OR char_length(btrim(telephone)) <= 30) NOT VALID,
  ADD CONSTRAINT enquiries_service_length
    CHECK (service_required IS NULL OR char_length(btrim(service_required)) BETWEEN 1 AND 120) NOT VALID,
  ADD CONSTRAINT enquiries_location_length
    CHECK (project_location IS NULL OR char_length(btrim(project_location)) <= 160) NOT VALID,
  ADD CONSTRAINT enquiries_description_length
    CHECK (char_length(btrim(description)) BETWEEN 20 AND 4000) NOT VALID,
  ADD CONSTRAINT enquiries_preferred_contact_values
    CHECK (preferred_contact IN ('email', 'phone')) NOT VALID,
  ADD CONSTRAINT enquiries_type_values
    CHECK (enquiry_type IN ('quote', 'training', 'partnership', 'general')) NOT VALID,
  ADD CONSTRAINT enquiries_status_values
    CHECK (status IN ('new', 'contacted', 'closed')) NOT VALID,
  ADD CONSTRAINT enquiries_consent_required
    CHECK (consent = true) NOT VALID;

CREATE INDEX IF NOT EXISTS enquiries_email_recent_idx
  ON public.enquiries (lower(email), created_at DESC);

CREATE INDEX IF NOT EXISTS enquiries_created_at_idx
  ON public.enquiries (created_at DESC);

CREATE OR REPLACE FUNCTION public.harden_enquiry_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Normalise user input before it is stored.
  NEW.full_name := btrim(regexp_replace(NEW.full_name, '\s+', ' ', 'g'));
  NEW.organisation := NULLIF(btrim(regexp_replace(coalesce(NEW.organisation, ''), '\s+', ' ', 'g')), '');
  NEW.email := lower(btrim(NEW.email));
  NEW.telephone := NULLIF(btrim(regexp_replace(coalesce(NEW.telephone, ''), '\s+', ' ', 'g')), '');
  NEW.service_required := NULLIF(btrim(regexp_replace(coalesce(NEW.service_required, ''), '\s+', ' ', 'g')), '');
  NEW.project_location := NULLIF(btrim(regexp_replace(coalesce(NEW.project_location, ''), '\s+', ' ', 'g')), '');
  NEW.description := btrim(NEW.description);
  NEW.preferred_contact := coalesce(NEW.preferred_contact, 'email');
  NEW.enquiry_type := coalesce(NEW.enquiry_type, 'general');
  NEW.consent := true;

  -- Public submissions always begin unhandled, regardless of supplied values.
  NEW.status := 'new';

  -- Basic per-address throttle: three submissions per ten minutes.
  SELECT count(*)
    INTO recent_count
    FROM public.enquiries
   WHERE lower(email) = NEW.email
     AND created_at > now() - interval '10 minutes';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many enquiries from this email address'
      USING ERRCODE = 'P0001',
            HINT = 'Please wait a few minutes before submitting another enquiry.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enquiries_harden_before_insert ON public.enquiries;
CREATE TRIGGER enquiries_harden_before_insert
  BEFORE INSERT ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.harden_enquiry_before_insert();

-- The public role still only holds INSERT. Reads and status changes remain
-- restricted to listed admins by the existing RLS policies and column grants.
REVOKE ALL ON public.enquiries FROM anon;
GRANT INSERT ON public.enquiries TO anon, authenticated;
