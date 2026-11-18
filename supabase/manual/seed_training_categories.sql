-- Seed category labels based on the proposed topic areas in the supplied
-- EcoHealth website blueprint. These are not published course offerings.
-- Run after the training management migration has been applied.
-- Safe to run again: existing categories with the same slug are left unchanged.

INSERT INTO public.training_categories (name, slug, description, sort_order)
VALUES
  (
    'Workplace Health & Safety',
    'workplace-health-safety',
    'Suggested topic area: workplace safety and PPE awareness. Confirm course scope and availability before publishing.',
    10
  ),
  (
    'Work at Height & Electrical Safety',
    'work-at-height-electrical-safety',
    'Suggested topics: working-at-height, dropped-object prevention, and electrical safety awareness. Confirm course scope and authorizations before publishing.',
    20
  ),
  (
    'Transport & Fleet Safety',
    'transport-fleet-safety',
    'Suggested topics: road safety, defensive-driving awareness, and fatigue management. Confirm course scope and availability before publishing.',
    30
  ),
  (
    'Risk & Emergency Preparedness',
    'risk-emergency-preparedness',
    'Suggested topics: risk assessment, incident reporting, and emergency awareness. Confirm course scope and availability before publishing.',
    40
  ),
  (
    'Environmental Awareness',
    'environmental-awareness',
    'Suggested topic area: environmental awareness and practical environmental management. Confirm course scope and availability before publishing.',
    50
  )
ON CONFLICT (slug) DO NOTHING;

SELECT id, name, slug, sort_order
FROM public.training_categories
WHERE slug IN (
  'workplace-health-safety',
  'work-at-height-electrical-safety',
  'transport-fleet-safety',
  'risk-emergency-preparedness',
  'environmental-awareness'
)
ORDER BY sort_order, name;
