-- Import existing built-in Insights articles and ensure proposed training
-- categories exist. This does not invent project, contact, learner, course,
-- session, assessment, or certificate records.
--
-- Run after all database migrations. Safe to rerun:
-- - category conflicts are left unchanged;
-- - existing articles (including any edits) are left unchanged.

BEGIN;

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

INSERT INTO public.articles (
  slug,
  title,
  category,
  excerpt,
  body,
  image_url,
  read_time,
  published,
  published_at
)
VALUES
  (
    'practical-risk-assessment-on-active-sites',
    'Practical Risk Assessment on Active Sites',
    'Risk Management',
    'A risk assessment is only useful if it reflects what actually happens on site. Here is how to keep it grounded.',
    'Risk assessment is the foundation of safe operations, but it loses value the moment it becomes a document produced for its own sake. The most useful assessments are built from direct observation of the work, conversations with the people doing it, and an honest accounting of what could go wrong.

Start with the actual tasks. Walk the site. Talk to supervisors and frontline workers. Identify the hazards that are present — not the hazards that are convenient to list — and assess the risk in the context of how the work is really performed.

Then focus on controls that are practical and verifiable. A control that cannot be checked is a control that will drift. Document who is responsible, how the control is maintained, and what happens when it fails.

Finally, treat the assessment as a living document. When the work changes, the assessment changes. When an incident occurs, the assessment is reviewed. The goal is not a perfect document — it is a safer operation.',
    NULL,
    '5 min read',
    true,
    '2025-09-18'
  ),
  (
    'environmental-responsibility-on-infrastructure-projects',
    'Environmental Responsibility on Infrastructure Projects',
    'Environmental Management',
    'Infrastructure projects carry environmental obligations that extend well beyond the construction footprint.',
    'Infrastructure projects shape the environment around them. Excavation, movement of materials, vehicle traffic, and the presence of a workforce all create impacts that need to be understood and managed.

An environmental management plan should be specific to the site and the activity. Generic plans copied between projects rarely capture the risks that matter. The plan should identify the likely impacts, set out controls, and define how performance will be monitored.

Monitoring does not need to be complex, but it does need to be consistent. Simple, regular checks — supported by clear records — are more valuable than occasional detailed studies that nobody acts on.

The objective is straightforward: reduce harm, meet obligations, and leave the site in a condition that respects the community and ecosystem around it.',
    NULL,
    '6 min read',
    true,
    '2025-08-02'
  ),
  (
    'building-a-safety-culture-that-lasts',
    'Building a Safety Culture That Lasts',
    'Occupational Health & Safety',
    'Safety culture is not built with posters. It is built with leadership, consistency, and honest reporting.',
    'A strong safety culture is the sum of many small decisions made over time. It is visible in how leaders respond to bad news, whether workers feel able to raise concerns, and what happens after an incident occurs.

Culture cannot be installed by a single training session or a new policy document. It is built through consistent leadership behaviour, clear expectations, and a genuine willingness to learn from events rather than punish them away.

Reporting is a leading indicator. When people report near-misses and concerns freely, the organisation has the information it needs to act before a serious incident occurs. When reporting drops, it usually means the culture has a problem.

The organisations with the strongest safety performance are rarely the ones with the most paperwork. They are the ones where safety is part of how decisions are made — not an additional layer applied afterwards.',
    NULL,
    '4 min read',
    true,
    '2025-07-15'
  ),
  (
    'managing-transport-risk-across-fleet-operations',
    'Managing Transport Risk Across Fleet Operations',
    'Transport Safety',
    'Transport is one of the highest-risk activities many organisations undertake. A structured approach makes the difference.',
    'For many organisations, the highest-risk activity is not on site — it is on the road. Moving people, equipment, and materials exposes a workforce to traffic, fatigue, and vehicle-related hazards every day.

A structured approach to transport risk starts with policy, but it lives in practice. Driver standards, vehicle condition, journey planning, and fatigue management each play a part. When any one of them is weak, the others compensate only so far.

Journey management is often overlooked. Planning the route, the timing, the rest breaks, and the communication points turns a risky trip into a managed activity. It does not eliminate risk, but it brings it within control.

Finally, incident reporting for transport should be treated with the same seriousness as site incidents. The patterns that lead to serious road events are usually visible in the minor events that came before them.',
    NULL,
    '5 min read',
    true,
    '2025-06-10'
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;

SELECT 'article' AS record_type, slug, title AS name, published
FROM public.articles
WHERE slug IN (
  'practical-risk-assessment-on-active-sites',
  'environmental-responsibility-on-infrastructure-projects',
  'building-a-safety-culture-that-lasts',
  'managing-transport-risk-across-fleet-operations'
)
UNION ALL
SELECT 'training_category' AS record_type, slug, name, NULL::boolean AS published
FROM public.training_categories
WHERE slug IN (
  'workplace-health-safety',
  'work-at-height-electrical-safety',
  'transport-fleet-safety',
  'risk-emergency-preparedness',
  'environmental-awareness'
)
ORDER BY record_type, slug;
