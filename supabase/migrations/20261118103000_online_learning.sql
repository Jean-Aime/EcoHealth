-- Online learning delivery.
--
-- Adds chapter-based online programmes that staff build from approved PDF/DOCX
-- course material, learner chapter progress, completion records and the
-- certificate gate for online completion. Nothing is seeded: chapters exist
-- only for courses an administrator has enabled and published.
--
-- Access model
--   * Public visitors can read chapter titles/outline only (column grants omit body).
--   * Learners with an approved registration for the course read chapter bodies
--     through get_learning_course(), which runs as the definer and checks access.
--   * Administrators read the same RPC for preview and editing.
--   * All writes go through guarded RPCs; no client can insert a chapter,
--     a progress row, a completion row or a certificate directly.

-- ————————————————————————— 1 · Course flags —————————————————————————

ALTER TABLE public.training_courses
  ADD COLUMN IF NOT EXISTS online_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS require_online_completion boolean NOT NULL DEFAULT false;

-- ————————————————————————— 2 · Chapter content —————————————————————————

CREATE TABLE IF NOT EXISTS public.training_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  position integer NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  estimated_minutes integer NOT NULL DEFAULT 5,
  published boolean NOT NULL DEFAULT true,
  source_document text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT training_chapters_title_length CHECK (char_length(btrim(title)) BETWEEN 2 AND 200),
  CONSTRAINT training_chapters_summary_length CHECK (char_length(summary) <= 600),
  CONSTRAINT training_chapters_body_length CHECK (char_length(body) <= 60000),
  CONSTRAINT training_chapters_position CHECK (position BETWEEN 1 AND 500),
  CONSTRAINT training_chapters_minutes CHECK (estimated_minutes BETWEEN 1 AND 600),
  -- Deferred so a renumbering pass inside save_course_chapters() can swap positions.
  CONSTRAINT training_chapters_unique_position UNIQUE (course_id, position)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS public.training_lesson_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.training_chapters(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress',
  first_viewed_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, chapter_id),
  CONSTRAINT training_lesson_progress_status CHECK (status IN ('in_progress', 'completed')),
  CONSTRAINT training_lesson_progress_completed_at CHECK (
    (status = 'completed') = (completed_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.training_online_completions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS training_chapters_course_idx
  ON public.training_chapters (course_id, position);
CREATE INDEX IF NOT EXISTS training_lesson_progress_chapter_idx
  ON public.training_lesson_progress (chapter_id, status);
CREATE INDEX IF NOT EXISTS training_lesson_progress_user_idx
  ON public.training_lesson_progress (user_id, updated_at DESC);

CREATE OR REPLACE FUNCTION public.has_course_access(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.is_training_admin() OR EXISTS (
    SELECT 1
    FROM public.training_registrations r
    JOIN public.training_sessions s ON s.id = r.session_id
    WHERE s.course_id = p_course_id
      AND r.status = 'approved'
      AND (
        r.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.training_participants p
          WHERE p.registration_id = r.id AND p.account_id = auth.uid()
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.has_course_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_course_access(uuid) TO authenticated;

-- ————————————————————————— 3 · Row level security —————————————————————————

ALTER TABLE public.training_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_online_completions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.training_chapters, public.training_lesson_progress,
  public.training_online_completions FROM anon, authenticated;

-- The reading body is deliberately not granted: it is only returned by the
-- access-checked get_learning_course() function.
GRANT SELECT (id, course_id, position, title, summary, estimated_minutes, published, created_at)
  ON public.training_chapters TO anon, authenticated;
GRANT SELECT ON public.training_lesson_progress, public.training_online_completions TO authenticated;

DROP POLICY IF EXISTS training_chapters_read ON public.training_chapters;
CREATE POLICY training_chapters_read ON public.training_chapters
  FOR SELECT TO anon, authenticated USING (
    public.is_training_admin()
    OR (
      published
      AND EXISTS (
        SELECT 1 FROM public.training_courses c
        WHERE c.id = course_id
          AND c.published
          AND c.archived_at IS NULL
          AND c.online_enabled
      )
    )
  );

DROP POLICY IF EXISTS training_lesson_progress_read ON public.training_lesson_progress;
CREATE POLICY training_lesson_progress_read ON public.training_lesson_progress
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_training_admin()
  );

DROP POLICY IF EXISTS training_online_completions_read ON public.training_online_completions;
CREATE POLICY training_online_completions_read ON public.training_online_completions
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_training_admin()
  );

DROP TRIGGER IF EXISTS touch_training_updated_at_before ON public.training_chapters;
CREATE TRIGGER touch_training_updated_at_before
  BEFORE UPDATE ON public.training_chapters
  FOR EACH ROW EXECUTE FUNCTION public.touch_training_updated_at();

DROP TRIGGER IF EXISTS audit_training_change ON public.training_chapters;
CREATE TRIGGER audit_training_change
  AFTER INSERT OR UPDATE OR DELETE ON public.training_chapters
  FOR EACH ROW EXECUTE FUNCTION public.audit_training_change();

DROP TRIGGER IF EXISTS audit_training_change ON public.training_online_completions;
CREATE TRIGGER audit_training_change
  AFTER INSERT OR UPDATE OR DELETE ON public.training_online_completions
  FOR EACH ROW EXECUTE FUNCTION public.audit_training_change();

-- ————————————————————————— 4 · Admin: save chapters —————————————————————————

CREATE OR REPLACE FUNCTION public.save_course_chapters(
  p_course_id uuid,
  p_chapters jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  item jsonb;
  chapter_index integer := 0;
  chapter_id uuid;
  chapter_body text;
  chapter_summary text;
  chapter_title text;
  chapter_minutes integer;
  chapter_published boolean;
  kept_ids uuid[] := '{}';
  existing_ids uuid[];
  course_row public.training_courses%ROWTYPE;
BEGIN
  IF NOT public.is_training_admin() THEN
    RAISE EXCEPTION 'Administrator access is required';
  END IF;
  IF jsonb_typeof(p_chapters) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Chapters must be a list';
  END IF;
  IF jsonb_array_length(p_chapters) > 60 THEN
    RAISE EXCEPTION 'A course can have at most 60 online chapters';
  END IF;

  SELECT * INTO course_row FROM public.training_courses WHERE id = p_course_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Course not found'; END IF;
  IF course_row.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'Restore the course before editing its online chapters';
  END IF;

  SELECT coalesce(array_agg(id), '{}') INTO existing_ids
  FROM public.training_chapters WHERE course_id = p_course_id;

  FOR item IN SELECT * FROM jsonb_array_elements(p_chapters) LOOP
    chapter_index := chapter_index + 1;
    chapter_title := btrim(coalesce(item ->> 'title', ''));
    chapter_summary := btrim(coalesce(item ->> 'summary', ''));
    chapter_body := btrim(coalesce(item ->> 'body', ''));
    chapter_minutes := coalesce(nullif(item ->> 'estimated_minutes', '')::integer, 5);
    chapter_published := coalesce((item ->> 'published')::boolean, true);

    IF char_length(chapter_title) NOT BETWEEN 2 AND 200 THEN
      RAISE EXCEPTION 'Chapter % needs a title between 2 and 200 characters', chapter_index;
    END IF;
    IF char_length(chapter_summary) > 600 THEN
      RAISE EXCEPTION 'Chapter % has a summary that is too long', chapter_index;
    END IF;
    IF char_length(chapter_body) > 60000 THEN
      RAISE EXCEPTION 'Chapter % has too much text (60,000 characters maximum)', chapter_index;
    END IF;
    IF chapter_minutes NOT BETWEEN 1 AND 600 THEN
      RAISE EXCEPTION 'Chapter % needs an estimated time between 1 and 600 minutes', chapter_index;
    END IF;

    IF (item ->> 'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND (item ->> 'id')::uuid = ANY (existing_ids) THEN
      chapter_id := (item ->> 'id')::uuid;
      UPDATE public.training_chapters
      SET position = chapter_index,
          title = chapter_title,
          summary = chapter_summary,
          body = chapter_body,
          estimated_minutes = chapter_minutes,
          published = chapter_published,
          source_document = left(coalesce(item ->> 'source_document', ''), 200),
          updated_at = now()
      WHERE id = chapter_id AND course_id = p_course_id;
    ELSE
      INSERT INTO public.training_chapters (
        course_id, position, title, summary, body, estimated_minutes, published,
        source_document, created_by
      ) VALUES (
        p_course_id, chapter_index, chapter_title, chapter_summary, chapter_body,
        chapter_minutes, chapter_published,
        left(coalesce(item ->> 'source_document', ''), 200), auth.uid()
      )
      RETURNING id INTO chapter_id;
    END IF;

    kept_ids := kept_ids || chapter_id;
  END LOOP;

  DELETE FROM public.training_chapters
  WHERE course_id = p_course_id AND NOT (id = ANY (kept_ids));

  UPDATE public.training_courses
  SET online_enabled = true, updated_at = now()
  WHERE id = p_course_id;

  RETURN chapter_index;
END;
$$;

REVOKE ALL ON FUNCTION public.save_course_chapters(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_course_chapters(uuid, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_course_online_settings(
  p_course_id uuid,
  p_online_enabled boolean,
  p_require_completion boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  chapter_count integer;
BEGIN
  IF NOT public.is_training_admin() THEN
    RAISE EXCEPTION 'Administrator access is required';
  END IF;

  SELECT count(*) INTO chapter_count
  FROM public.training_chapters WHERE course_id = p_course_id AND published;

  IF p_online_enabled AND chapter_count = 0 THEN
    RAISE EXCEPTION 'Add at least one published chapter before enabling online delivery';
  END IF;
  IF p_require_completion AND NOT p_online_enabled THEN
    RAISE EXCEPTION 'Completion can only be required for an online course';
  END IF;

  UPDATE public.training_courses
  SET online_enabled = p_online_enabled,
      require_online_completion = p_require_completion AND p_online_enabled,
      updated_at = now()
  WHERE id = p_course_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Course not found'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_course_online_settings(uuid, boolean, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_course_online_settings(uuid, boolean, boolean) TO authenticated;

-- ————————————————————————— 5 · Learner: read and progress —————————————————————————

CREATE OR REPLACE FUNCTION public.get_learning_course(p_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  course_row public.training_courses%ROWTYPE;
  admin boolean := public.is_training_admin();
  chapter_total integer;
  chapter_done integer;
BEGIN
  SELECT * INTO course_row FROM public.training_courses WHERE id = p_course_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Training course not found'; END IF;
  IF NOT admin AND NOT (course_row.published AND course_row.archived_at IS NULL) THEN
    RAISE EXCEPTION 'This online course is not available';
  END IF;
  IF NOT public.has_course_access(p_course_id) THEN
    RAISE EXCEPTION 'Online learning requires an approved registration for this course';
  END IF;

  SELECT count(*) INTO chapter_total
  FROM public.training_chapters
  WHERE course_id = p_course_id AND (published OR admin);

  SELECT count(*) INTO chapter_done
  FROM public.training_chapters ch
  JOIN public.training_lesson_progress lp ON lp.chapter_id = ch.id
  WHERE ch.course_id = p_course_id
    AND (ch.published OR admin)
    AND lp.user_id = auth.uid()
    AND lp.status = 'completed';

  RETURN jsonb_build_object(
    'course', jsonb_build_object(
      'id', course_row.id,
      'slug', course_row.slug,
      'title', course_row.title,
      'summary', course_row.summary,
      'online_enabled', course_row.online_enabled,
      'require_online_completion', course_row.require_online_completion,
      'requires_assessment', course_row.requires_assessment,
      'passing_score', course_row.passing_score
    ),
    'chapters', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', ch.id,
          'position', ch.position,
          'title', ch.title,
          'summary', ch.summary,
          'body', ch.body,
          'estimated_minutes', ch.estimated_minutes,
          'published', ch.published,
          'completed_at', lp.completed_at
        ) ORDER BY ch.position
      )
      FROM public.training_chapters ch
      LEFT JOIN public.training_lesson_progress lp
        ON lp.chapter_id = ch.id AND lp.user_id = auth.uid()
      WHERE ch.course_id = p_course_id AND (ch.published OR admin)
    ), '[]'::jsonb),
    'completed_count', chapter_done,
    'chapter_count', chapter_total,
    'course_completed_at', (
      SELECT completed_at FROM public.training_online_completions
      WHERE user_id = auth.uid() AND course_id = p_course_id
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_learning_course(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_learning_course(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_chapter_complete(
  p_chapter_id uuid,
  p_completed boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  chapter_row public.training_chapters%ROWTYPE;
  course_completed_at timestamptz;
  chapter_total integer;
  chapter_done integer;
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Sign in is required'; END IF;
  IF p_completed IS NULL THEN RAISE EXCEPTION 'A completion state is required'; END IF;

  SELECT * INTO chapter_row FROM public.training_chapters WHERE id = p_chapter_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Chapter not found'; END IF;
  IF NOT public.has_course_access(chapter_row.course_id) THEN
    RAISE EXCEPTION 'Online learning requires an approved registration for this course';
  END IF;
  IF NOT chapter_row.published AND NOT public.is_training_admin() THEN
    RAISE EXCEPTION 'This chapter is not published';
  END IF;

  INSERT INTO public.training_lesson_progress (
    user_id, chapter_id, status, completed_at
  ) VALUES (
    current_user_id,
    p_chapter_id,
    CASE WHEN p_completed THEN 'completed' ELSE 'in_progress' END,
    CASE WHEN p_completed THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id, chapter_id) DO UPDATE
  SET status = excluded.status,
      completed_at = CASE
        WHEN excluded.status = 'completed' THEN coalesce(training_lesson_progress.completed_at, now())
        ELSE NULL
      END,
      updated_at = now();

  SELECT count(*) INTO chapter_total
  FROM public.training_chapters
  WHERE course_id = chapter_row.course_id AND published;

  SELECT count(*) INTO chapter_done
  FROM public.training_chapters ch
  JOIN public.training_lesson_progress lp ON lp.chapter_id = ch.id
  WHERE ch.course_id = chapter_row.course_id
    AND ch.published
    AND lp.user_id = current_user_id
    AND lp.status = 'completed';

  IF chapter_total > 0 AND chapter_done >= chapter_total THEN
    INSERT INTO public.training_online_completions (user_id, course_id)
    VALUES (current_user_id, chapter_row.course_id)
    ON CONFLICT (user_id, course_id) DO NOTHING;

    SELECT completed_at INTO course_completed_at
    FROM public.training_online_completions
    WHERE user_id = current_user_id AND course_id = chapter_row.course_id;
  ELSE
    DELETE FROM public.training_online_completions
    WHERE user_id = current_user_id AND course_id = chapter_row.course_id;
    course_completed_at := NULL;
  END IF;

  RETURN jsonb_build_object(
    'chapter_id', p_chapter_id,
    'completed', p_completed,
    'completed_count', chapter_done,
    'chapter_count', chapter_total,
    'course_completed_at', course_completed_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.mark_chapter_complete(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_chapter_complete(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_learning_courses()
RETURNS TABLE (
  course_id uuid,
  slug text,
  title text,
  summary text,
  chapter_count integer,
  completed_count integer,
  last_activity_at timestamptz,
  course_completed_at timestamptz,
  require_online_completion boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    c.id,
    c.slug,
    c.title,
    c.summary,
    (SELECT count(*)::integer FROM public.training_chapters ch
      WHERE ch.course_id = c.id AND ch.published),
    (SELECT count(*)::integer FROM public.training_chapters ch
      JOIN public.training_lesson_progress lp ON lp.chapter_id = ch.id
      WHERE ch.course_id = c.id AND ch.published
        AND lp.user_id = auth.uid() AND lp.status = 'completed'),
    (SELECT max(lp.updated_at) FROM public.training_lesson_progress lp
      JOIN public.training_chapters ch ON ch.id = lp.chapter_id
      WHERE ch.course_id = c.id AND lp.user_id = auth.uid()),
    (SELECT oc.completed_at FROM public.training_online_completions oc
      WHERE oc.course_id = c.id AND oc.user_id = auth.uid()),
    c.require_online_completion
  FROM public.training_courses c
  WHERE c.online_enabled
    AND c.published
    AND c.archived_at IS NULL
    AND public.has_course_access(c.id)
  ORDER BY c.title;
$$;

REVOKE ALL ON FUNCTION public.get_my_learning_courses() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_learning_courses() TO authenticated;

-- ————————————————————————— 6 · Admin reporting —————————————————————————

CREATE OR REPLACE FUNCTION public.get_online_learning_report()
RETURNS TABLE (
  course_id uuid,
  course_title text,
  published boolean,
  online_enabled boolean,
  chapter_count integer,
  learner_count integer,
  completed_count integer,
  last_activity_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_training_admin() THEN
    RAISE EXCEPTION 'Administrator access is required';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.published,
    c.online_enabled,
    (SELECT count(*)::integer FROM public.training_chapters ch WHERE ch.course_id = c.id),
    (SELECT count(DISTINCT lp.user_id)::integer
      FROM public.training_lesson_progress lp
      JOIN public.training_chapters ch ON ch.id = lp.chapter_id
      WHERE ch.course_id = c.id),
    (SELECT count(*)::integer FROM public.training_online_completions oc WHERE oc.course_id = c.id),
    (SELECT max(lp.updated_at)
      FROM public.training_lesson_progress lp
      JOIN public.training_chapters ch ON ch.id = lp.chapter_id
      WHERE ch.course_id = c.id)
  FROM public.training_courses c
  WHERE c.archived_at IS NULL
  ORDER BY c.title;
END;
$$;

REVOKE ALL ON FUNCTION public.get_online_learning_report() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_online_learning_report() TO authenticated;

-- ————————————————————————— 7 · Certificate gate —————————————————————————
-- Re-declares issue_training_certificate() with the online completion
-- requirement added. All previous checks are preserved.

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

  IF course_row.require_online_completion AND NOT EXISTS (
    SELECT 1
    FROM public.training_online_completions oc
    JOIN public.training_participants p ON p.account_id = oc.user_id
    WHERE p.id = p_participant_id AND oc.course_id = course_row.id
  ) THEN
    RAISE EXCEPTION 'Online chapter completion is required before certificate issuance';
  END IF;

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

COMMENT ON TABLE public.training_chapters IS
  'Ordered online programme chapters. Body text is readable only through get_learning_course().';
COMMENT ON TABLE public.training_lesson_progress IS
  'Per-account chapter progress. Written only by mark_chapter_complete().';
COMMENT ON TABLE public.training_online_completions IS
  'Course completion records derived from chapter progress; required for certificates when configured.';
