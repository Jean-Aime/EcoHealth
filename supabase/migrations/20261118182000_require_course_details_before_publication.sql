DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.training_courses
    WHERE published
      AND (
        char_length(btrim(summary)) = 0
        OR char_length(btrim(description)) = 0
        OR cardinality(learning_objectives) = 0
        OR char_length(btrim(array_to_string(learning_objectives, ' '))) = 0
        OR char_length(btrim(target_audience)) = 0
        OR char_length(btrim(prerequisites)) = 0
      )
  ) THEN
    RAISE EXCEPTION
      'Unpublish or complete existing published courses before applying this migration. Courses need a summary, description, learning objective, target audience, and prerequisites.';
  END IF;
END
$$;

ALTER TABLE public.training_courses
  ADD CONSTRAINT training_courses_published_content
  CHECK (
    NOT published
    OR (
      char_length(btrim(summary)) > 0
      AND char_length(btrim(description)) > 0
      AND cardinality(learning_objectives) > 0
      AND char_length(btrim(array_to_string(learning_objectives, ' '))) > 0
      AND char_length(btrim(target_audience)) > 0
      AND char_length(btrim(prerequisites)) > 0
    )
  );
