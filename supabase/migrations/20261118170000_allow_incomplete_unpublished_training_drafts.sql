-- Unpublished training drafts may omit details that have not yet been
-- confirmed. Published courses must have a real duration and delivery format.

ALTER TABLE public.training_courses
  ALTER COLUMN duration_minutes DROP NOT NULL;

ALTER TABLE public.training_courses
  DROP CONSTRAINT IF EXISTS training_courses_duration;

ALTER TABLE public.training_courses
  ADD CONSTRAINT training_courses_duration
  CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 1 AND 100000);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'training_courses_published_details'
      AND conrelid = 'public.training_courses'::regclass
  ) THEN
    ALTER TABLE public.training_courses
      ADD CONSTRAINT training_courses_published_details
      CHECK (
        NOT published
        OR (
          duration_minutes IS NOT NULL
          AND cardinality(delivery_formats) > 0
        )
      );
  END IF;
END;
$$;
