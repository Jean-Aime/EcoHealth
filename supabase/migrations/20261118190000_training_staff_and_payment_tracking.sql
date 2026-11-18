BEGIN;

CREATE TABLE public.training_trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  job_title text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  qualifications text NOT NULL DEFAULT '',
  expertise text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_trainers_name_length CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  CONSTRAINT training_trainers_title_length CHECK (char_length(job_title) <= 120),
  CONSTRAINT training_trainers_email_length CHECK (char_length(email) <= 254),
  CONSTRAINT training_trainers_phone_length CHECK (char_length(phone) <= 30),
  CONSTRAINT training_trainers_qualifications_length CHECK (char_length(qualifications) <= 2000),
  CONSTRAINT training_trainers_expertise_count CHECK (cardinality(expertise) <= 30)
);

ALTER TABLE public.training_sessions
  ADD COLUMN trainer_id uuid REFERENCES public.training_trainers(id) ON DELETE SET NULL;

CREATE TABLE public.training_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL UNIQUE REFERENCES public.training_registrations(id) ON DELETE RESTRICT,
  amount_due_minor integer,
  amount_paid_minor integer NOT NULL DEFAULT 0,
  currency text NOT NULL,
  status text NOT NULL,
  payment_method text,
  transaction_reference text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_payments_due_nonnegative CHECK (amount_due_minor IS NULL OR amount_due_minor >= 0),
  CONSTRAINT training_payments_paid_nonnegative CHECK (amount_paid_minor >= 0),
  CONSTRAINT training_payments_currency CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT training_payments_method CHECK (
    payment_method IS NULL OR payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'other')
  ),
  CONSTRAINT training_payments_reference_length CHECK (char_length(transaction_reference) <= 160),
  CONSTRAINT training_payments_status CHECK (
    (status = 'not_set' AND amount_due_minor IS NULL AND amount_paid_minor = 0 AND payment_method IS NULL)
    OR (status = 'not_required' AND amount_due_minor = 0 AND amount_paid_minor = 0 AND payment_method IS NULL)
    OR (status = 'unpaid' AND amount_due_minor > 0 AND amount_paid_minor = 0 AND payment_method IS NULL)
    OR (status = 'partial' AND amount_due_minor > amount_paid_minor AND amount_paid_minor > 0 AND payment_method IS NOT NULL)
    OR (status = 'paid' AND amount_due_minor > 0 AND amount_paid_minor = amount_due_minor AND payment_method IS NOT NULL)
    OR (status = 'waived' AND amount_due_minor > 0 AND amount_paid_minor = 0 AND payment_method IS NULL)
  )
);

CREATE INDEX training_payments_status_idx ON public.training_payments (status, updated_at DESC);
CREATE INDEX training_sessions_trainer_idx ON public.training_sessions (trainer_id, starts_at);

DROP TRIGGER IF EXISTS touch_training_trainers_updated_at_before ON public.training_trainers;
CREATE TRIGGER touch_training_trainers_updated_at_before
  BEFORE UPDATE ON public.training_trainers
  FOR EACH ROW EXECUTE FUNCTION public.touch_training_updated_at();

ALTER TABLE public.training_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_payments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.training_trainers, public.training_payments FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_trainers TO authenticated;
GRANT SELECT ON public.training_payments TO authenticated;

CREATE POLICY training_trainers_admin_access ON public.training_trainers
  FOR ALL TO authenticated
  USING (public.is_training_admin())
  WITH CHECK (public.is_training_admin());

CREATE POLICY training_payments_owner_read ON public.training_payments
  FOR SELECT TO authenticated
  USING (
    public.is_training_admin()
    OR EXISTS (
      SELECT 1
      FROM public.training_registrations r
      WHERE r.id = training_payments.registration_id AND r.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.training_participants p
      WHERE p.registration_id = training_payments.registration_id
        AND p.account_id = auth.uid()
    )
  );

INSERT INTO public.training_payments (
  registration_id,
  amount_due_minor,
  amount_paid_minor,
  currency,
  status
)
SELECT
  r.id,
  coalesce(s.price_minor, c.price_minor),
  0,
  c.currency,
  CASE
    WHEN coalesce(s.price_minor, c.price_minor) IS NULL THEN 'not_set'
    WHEN coalesce(s.price_minor, c.price_minor) = 0 THEN 'not_required'
    ELSE 'unpaid'
  END
FROM public.training_registrations r
JOIN public.training_sessions s ON s.id = r.session_id
JOIN public.training_courses c ON c.id = s.course_id
ON CONFLICT (registration_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.initialize_training_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  due_minor integer;
  course_currency text;
BEGIN
  SELECT coalesce(s.price_minor, c.price_minor), c.currency
  INTO due_minor, course_currency
  FROM public.training_sessions s
  JOIN public.training_courses c ON c.id = s.course_id
  WHERE s.id = NEW.session_id;

  INSERT INTO public.training_payments (
    registration_id, amount_due_minor, currency, status
  ) VALUES (
    NEW.id,
    due_minor,
    course_currency,
    CASE
      WHEN due_minor IS NULL THEN 'not_set'
      WHEN due_minor = 0 THEN 'not_required'
      ELSE 'unpaid'
    END
  )
  ON CONFLICT (registration_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_training_payment() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER initialize_training_payment_after_registration
  AFTER INSERT ON public.training_registrations
  FOR EACH ROW EXECUTE FUNCTION public.initialize_training_payment();

CREATE OR REPLACE FUNCTION public.record_training_payment(
  p_registration_id uuid,
  p_amount_due_minor integer,
  p_amount_paid_minor integer,
  p_payment_method text,
  p_transaction_reference text,
  p_waived boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  payment_currency text;
  payment_status text;
  normalized_method text := nullif(btrim(coalesce(p_payment_method, '')), '');
  normalized_reference text := btrim(coalesce(p_transaction_reference, ''));
BEGIN
  IF NOT public.is_training_admin() THEN
    RAISE EXCEPTION 'Training administrator access is required';
  END IF;
  IF p_amount_paid_minor IS NULL OR p_amount_paid_minor < 0
    OR (p_amount_due_minor IS NOT NULL AND p_amount_due_minor < 0)
    OR (p_amount_due_minor IS NULL AND p_amount_paid_minor <> 0)
    OR (p_amount_due_minor IS NOT NULL AND p_amount_paid_minor > p_amount_due_minor)
  THEN
    RAISE EXCEPTION 'Payment amounts are invalid';
  END IF;
  IF char_length(normalized_reference) > 160 THEN
    RAISE EXCEPTION 'Transaction reference is too long';
  END IF;
  IF normalized_method IS NOT NULL
    AND normalized_method NOT IN ('cash', 'bank_transfer', 'mobile_money', 'other')
  THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;
  IF p_amount_paid_minor > 0 AND normalized_method IS NULL THEN
    RAISE EXCEPTION 'Select the method used for the recorded payment';
  END IF;
  IF p_waived AND (p_amount_due_minor IS NULL OR p_amount_due_minor = 0 OR p_amount_paid_minor <> 0) THEN
    RAISE EXCEPTION 'Only an unpaid amount can be waived';
  END IF;

  SELECT c.currency INTO payment_currency
  FROM public.training_registrations r
  JOIN public.training_sessions s ON s.id = r.session_id
  JOIN public.training_courses c ON c.id = s.course_id
  WHERE r.id = p_registration_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;

  payment_status := CASE
    WHEN p_amount_due_minor IS NULL THEN 'not_set'
    WHEN p_amount_due_minor = 0 THEN 'not_required'
    WHEN p_waived THEN 'waived'
    WHEN p_amount_paid_minor = 0 THEN 'unpaid'
    WHEN p_amount_paid_minor = p_amount_due_minor THEN 'paid'
    ELSE 'partial'
  END;

  INSERT INTO public.training_payments (
    registration_id,
    amount_due_minor,
    amount_paid_minor,
    currency,
    status,
    payment_method,
    transaction_reference,
    updated_by,
    updated_at
  ) VALUES (
    p_registration_id,
    p_amount_due_minor,
    p_amount_paid_minor,
    payment_currency,
    payment_status,
    CASE WHEN p_amount_paid_minor > 0 THEN normalized_method ELSE NULL END,
    normalized_reference,
    auth.uid(),
    now()
  )
  ON CONFLICT (registration_id) DO UPDATE SET
    amount_due_minor = EXCLUDED.amount_due_minor,
    amount_paid_minor = EXCLUDED.amount_paid_minor,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    payment_method = EXCLUDED.payment_method,
    transaction_reference = EXCLUDED.transaction_reference,
    updated_by = EXCLUDED.updated_by,
    updated_at = EXCLUDED.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.record_training_payment(uuid, integer, integer, text, text, boolean)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_training_payment(uuid, integer, integer, text, text, boolean)
  TO authenticated;

DROP TRIGGER IF EXISTS audit_training_change ON public.training_trainers;
CREATE TRIGGER audit_training_change
  AFTER INSERT OR UPDATE OR DELETE ON public.training_trainers
  FOR EACH ROW EXECUTE FUNCTION public.audit_training_change();

DROP TRIGGER IF EXISTS audit_training_change ON public.training_payments;
CREATE TRIGGER audit_training_change
  AFTER INSERT OR UPDATE OR DELETE ON public.training_payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_training_change();

COMMIT;
