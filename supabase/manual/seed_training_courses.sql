-- Publish the eight proposed awareness courses requested by EcoHealth.
--
-- The course topics and category names come from the supplied brief. Course
-- copy, objectives, 90-180 minute durations and classroom/onsite formats are
-- proposed starter content: review and adjust them in Admin before delivery.
-- Durations are indicative. No prices, sessions, trainers, assessments,
-- credentials, certificates or participant records are invented.
--
-- Run after all migrations and after seed_website_content.sql has created the
-- five training categories. Re-running updates these courses only while they
-- are unpublished; once published, later admin edits are left untouched.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('workplace-health-safety'),
      ('work-at-height-electrical-safety'),
      ('transport-fleet-safety'),
      ('risk-emergency-preparedness'),
      ('environmental-awareness')
    ) AS required_categories(slug)
    LEFT JOIN public.training_categories AS category
      ON category.slug = required_categories.slug
    WHERE category.id IS NULL
  ) THEN
    RAISE EXCEPTION
      'Run seed_website_content.sql first so all five training categories exist.';
  END IF;
END;
$$;

BEGIN;

INSERT INTO public.training_courses AS existing (
  category_id,
  slug,
  title,
  summary,
  description,
  learning_objectives,
  target_audience,
  prerequisites,
  duration_minutes,
  delivery_formats,
  published
)
SELECT
  category.id,
  course_data.slug,
  course_data.title,
  course_data.summary,
  course_data.description,
  course_data.learning_objectives,
  course_data.target_audience,
  course_data.prerequisites,
  course_data.duration_minutes,
  course_data.delivery_formats,
  true
FROM (
  VALUES
    (
      'workplace-health-safety',
      'workplace-safety-ppe-awareness',
      'Workplace Safety & PPE Awareness',
      'Indicative 2-hour awareness course on recognizing workplace hazards, choosing controls and using personal protective equipment appropriately.',
      $course$
Participants review how to notice common hazards, consider risk using the process established by the employer, and select suitable controls before relying on personal protective equipment (PPE). Topics include workplace responsibilities, housekeeping, hazard communication, reporting concerns and knowing when to pause work.

Guided scenarios cover matching PPE to a task, fit and pre-use checks, equipment limitations, care, storage and replacement. Participants discuss what to do when equipment is damaged, the task changes or a control is unclear.

Indicative duration: 2 hours. Final schedule, venue and site-specific examples are confirmed by EcoHealth with the client. This awareness course does not replace workplace procedures or a practical competence assessment.
$course$,
      ARRAY[
        'Identify common workplace hazards and explain how to report them.',
        'Describe the difference between hazard elimination, other controls and reliance on PPE.',
        'Select PPE appropriate to a stated task and hazard using employer guidance.',
        'Recognize basic fit, condition and care checks and explain when equipment should not be used.',
        'Identify when to stop work and raise a concern with a supervisor.'
      ],
      'Employees, contractors, team leaders and supervisors working in offices, workshops, warehouses or project environments.',
      'No formal prerequisite. The employer should provide applicable site rules and reporting contacts before work begins.',
      120,
      ARRAY['classroom', 'onsite']
    ),
    (
      'work-at-height-electrical-safety',
      'electrical-safety-awareness',
      'Electrical Safety Awareness',
      'Indicative 2-hour awareness course on recognizing electrical hazards, maintaining safe boundaries and reporting unsafe conditions.',
      $course$
This awareness course helps participants recognize common electrical hazards in workplaces and project environments. It covers warning signs, damaged equipment, overhead and buried services, restricted areas, and the importance of following the employer's electrical safety arrangements.

Participants discuss how to keep clear of suspected hazards, report concerns promptly, and leave isolation, testing, repair and other electrical work to people who are formally authorized for those tasks. Scenarios focus on communication and safe escalation rather than electrical work instructions.

Indicative duration: 2 hours. Final schedule, venue and site-specific rules are confirmed by EcoHealth with the client. This course is not electrical training, a trade qualification, authorization to work on electrical systems or a substitute for approved isolation procedures.
$course$,
      ARRAY[
        'Recognize common signs of electrical danger and damaged equipment.',
        'Explain why only authorized personnel may isolate, test, repair or work on electrical systems.',
        'Describe how to maintain safe boundaries around suspected electrical hazards.',
        'Identify the appropriate reporting and escalation route for an electrical concern.',
        'Explain why site-specific service information and instructions must be followed.'
      ],
      'Workers, contractors, supervisors and support personnel who may work near electrical equipment or services.',
      'No formal prerequisite for awareness training. This course does not authorize electrical work; any technical task requires a separate competence and authorization process.',
      120,
      ARRAY['classroom', 'onsite']
    ),
    (
      'work-at-height-electrical-safety',
      'working-at-height-dropped-object-awareness',
      'Working at Height & Dropped-Object Prevention Awareness',
      'Indicative 3-hour awareness course on recognizing work-at-height hazards, preventing dropped objects and following site controls.',
      $course$
Participants examine common fall and dropped-object hazards associated with elevated work, access routes, openings and work areas below. The course emphasizes planning, avoiding work at height where practicable, using employer-approved controls, keeping people clear of exposed areas, and reporting changing conditions.

Scenarios help participants recognize when access equipment, protective systems, tools or work arrangements need review by a competent person. The course also covers communication between workers above and below, housekeeping and the importance of following site-specific emergency arrangements.

Indicative duration: 3 hours. Final schedule, venue and site-specific controls are confirmed by EcoHealth with the client. This awareness course is not a work-at-height qualification, rescue qualification or practical assessment, and does not authorize participants to perform specialist tasks.
$course$,
      ARRAY[
        'Recognize fall hazards, openings and conditions that can create dropped-object risk.',
        'Describe why work should be planned to avoid or reduce exposure to work at height.',
        'Identify the need for approved controls, exclusion arrangements and clear communication.',
        'Recognize conditions that require work to pause and be reviewed by a competent person.',
        'Explain how to report hazards and follow site-specific emergency arrangements.'
      ],
      'Workers, contractors, supervisors and ground personnel involved in or working near elevated activities.',
      'No formal prerequisite for awareness training. Specialist work, equipment use and rescue duties require separate competence, authorization and site-specific arrangements.',
      180,
      ARRAY['classroom', 'onsite']
    ),
    (
      'transport-fleet-safety',
      'fatigue-management-awareness',
      'Fatigue Management Awareness',
      'Indicative 90-minute awareness course on recognizing fatigue risk and using practical reporting and work-planning controls.',
      $course$
This course introduces fatigue as a risk that can affect attention, judgement, communication and safe performance. Participants consider how work patterns, travel, rest opportunities, health and individual circumstances can contribute to fatigue, and why early reporting matters.

The group reviews practical controls such as realistic planning, suitable rest breaks, supervisor check-ins and escalation when a person may not be fit for a task or journey. The course encourages shared responsibility: workers report concerns and supervisors respond using the organization's fatigue and fitness-for-work arrangements.

Indicative duration: 90 minutes. Final schedule, venue and workplace-specific escalation arrangements are confirmed by EcoHealth with the client. This awareness course is not medical advice and does not replace occupational health guidance or employer procedures.
$course$,
      ARRAY[
        'Describe how fatigue can affect attention, judgement and safe performance.',
        'Recognize common work and travel conditions that may increase fatigue risk.',
        'Identify practical planning and supervision controls that can reduce exposure.',
        'Explain how and when to report fatigue concerns using workplace arrangements.',
        'Recognize that a person who may be unfit for a task or journey should seek appropriate support before proceeding.'
      ],
      'Drivers, fleet and dispatch personnel, field teams, supervisors and managers who plan or perform safety-sensitive work.',
      'No formal prerequisite. Participants should be familiar with the applicable working-time, fitness-for-work and fatigue-reporting arrangements.',
      90,
      ARRAY['classroom', 'onsite']
    ),
    (
      'transport-fleet-safety',
      'road-safety-defensive-driving-awareness',
      'Road Safety & Defensive-Driving Awareness',
      'Indicative 3-hour road-safety awareness workshop on anticipating hazards, planning journeys and reducing avoidable driving risk.',
      $course$
Participants explore common road-journey risks and discuss how planning, attention, vehicle condition and decision-making affect safety. Topics include journey planning, speed choice within applicable limits, seat-belt use, distraction, fatigue awareness, weather and road conditions, and reporting vehicle or route concerns.

Facilitated scenarios focus on anticipating hazards, leaving appropriate time and space, and choosing to pause or escalate when conditions are unsafe. Any vehicle checks discussed are awareness-level and must follow the employer's approved checklist and manufacturer guidance.

Indicative duration: 3 hours. Final schedule, venue and fleet-specific procedures are confirmed by EcoHealth with the client. This is a classroom awareness workshop, not on-road instruction, a driving test, a driving licence or a professional driving qualification.
$course$,
      ARRAY[
        'Identify common journey-planning and road-environment risk factors.',
        'Explain how speed, distraction, fatigue and vehicle condition can affect road risk.',
        'Describe defensive awareness practices for anticipating hazards and maintaining attention.',
        'Recognize when a journey or vehicle concern should be reported or paused.',
        'Apply approved journey-management and incident-reporting arrangements to a scenario.'
      ],
      'Drivers, fleet operators, dispatchers, supervisors and managers involved in work-related road travel.',
      'No formal prerequisite for the awareness workshop. Participants must hold any legally required licence before driving; this course does not provide or replace one.',
      180,
      ARRAY['classroom', 'onsite']
    ),
    (
      'risk-emergency-preparedness',
      'emergency-awareness',
      'Emergency Preparedness Awareness',
      'Indicative 2-hour awareness course on understanding workplace emergency arrangements and responding to alarms and instructions.',
      $course$
Participants review why emergency arrangements must reflect the actual workplace, people present and foreseeable events. The course covers how to find local instructions, recognize alarms and notifications, raise an alert, follow designated routes and assembly arrangements, and account for people as directed.

Facilitated scenarios help participants understand communication, role boundaries and the importance of reporting hazards after an event. Any practical drill must be planned and supervised under the employer's site-specific emergency plan.

Indicative duration: 2 hours. Final schedule, venue, emergency contacts and site procedures are confirmed by EcoHealth with the client. This awareness course is not a first-aid, firefighting, rescue or incident-command qualification.
$course$,
      ARRAY[
        'Locate the workplace emergency instructions and identify how to raise an alert.',
        'Describe how to respond to alarms and follow designated instructions.',
        'Explain the importance of accounting for people and communicating status as directed.',
        'Recognize role boundaries and when to defer to designated emergency personnel.',
        'Identify how to report hazards and observations after an emergency or drill.'
      ],
      'Employees, contractors, visitors and supervisors who need an introduction to workplace emergency arrangements.',
      'No formal prerequisite. The employer must provide the current site emergency plan, alarm information and contacts for the location.',
      120,
      ARRAY['classroom', 'onsite']
    ),
    (
      'risk-emergency-preparedness',
      'risk-assessment-incident-reporting',
      'Risk Assessment & Incident Reporting',
      'Indicative 3-hour practical awareness course on recognizing hazards, applying workplace risk controls and reporting incidents clearly.',
      $course$
Participants learn a structured, awareness-level approach to observing a task, identifying hazards, considering who may be affected and checking that controls are in place. Examples emphasize using the employer's risk matrix and procedures rather than substituting a generic score for local requirements.

The reporting section covers prompt notification, factual descriptions, near misses, preserving relevant information and escalating urgent conditions. Participants practice reviewing a scenario and identifying questions to raise with a supervisor or competent person.

Indicative duration: 3 hours. Final schedule and workplace-specific forms, risk criteria and reporting routes are confirmed by EcoHealth with the client. This course does not certify participants as risk assessors or replace statutory, technical or specialist assessment.
$course$,
      ARRAY[
        'Identify hazards, affected people and changing conditions in a workplace scenario.',
        'Describe how to use the established risk-assessment method and control hierarchy.',
        'Recognize when specialist advice or a more detailed assessment is required.',
        'Explain how to report incidents, near misses and unsafe conditions promptly and factually.',
        'Identify follow-up information that can support learning while respecting workplace procedures.'
      ],
      'Workers, team leaders and supervisors who contribute to task planning, hazard reporting or incident learning.',
      'No formal prerequisite. Participants should be able to use or be introduced to the applicable risk-assessment and reporting procedures.',
      180,
      ARRAY['classroom', 'onsite']
    ),
    (
      'environmental-awareness',
      'environmental-awareness-for-workplaces',
      'Environmental Awareness for Workplaces & Projects',
      'Indicative 2-hour awareness course on recognizing routine workplace environmental impacts and following site controls.',
      $course$
Participants consider how day-to-day workplace and project activities can affect surrounding land, water, air, wildlife and communities. Topics include waste prevention and segregation, efficient use of resources, housekeeping, nuisance prevention, and recognizing conditions that may require prompt environmental reporting.

Workplace scenarios highlight the importance of following the site's environmental plan, permit conditions and supervisor instructions. Participants discuss how to prevent avoidable impacts within their role and when to stop and escalate a spill, release or other unexpected event.

Indicative duration: 2 hours. Final schedule, venue and site-specific environmental controls are confirmed by EcoHealth with the client. This awareness course does not replace environmental permits, technical advice or an approved incident-response plan.
$course$,
      ARRAY[
        'Identify routine activities that may affect the surrounding environment.',
        'Describe practical housekeeping, waste and resource-use controls relevant to a stated task.',
        'Recognize conditions that may cause environmental harm and require prompt reporting.',
        'Explain why site plans, permit conditions and supervisor instructions must be followed.',
        'Identify appropriate escalation steps for an unexpected release or environmental incident.'
      ],
      'Employees, contractors, supervisors and project teams working in offices, facilities, transport or infrastructure environments.',
      'No formal prerequisite. The employer should provide site-specific environmental requirements and incident-reporting contacts before work begins.',
      120,
      ARRAY['classroom', 'onsite']
    )
) AS course_data(
  category_slug,
  slug,
  title,
  summary,
  description,
  learning_objectives,
  target_audience,
  prerequisites,
  duration_minutes,
  delivery_formats
)
JOIN public.training_categories AS category
  ON category.slug = course_data.category_slug
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  learning_objectives = EXCLUDED.learning_objectives,
  target_audience = EXCLUDED.target_audience,
  prerequisites = EXCLUDED.prerequisites,
  duration_minutes = EXCLUDED.duration_minutes,
  delivery_formats = EXCLUDED.delivery_formats,
  archived_at = NULL,
  published = EXCLUDED.published
WHERE existing.published = false;

COMMIT;

SELECT
  course.slug,
  course.title,
  category.name AS category,
  course.published,
  course.duration_minutes,
  course.delivery_formats,
  course.price_minor
FROM public.training_courses AS course
JOIN public.training_categories AS category ON category.id = course.category_id
WHERE course.slug IN (
  'workplace-safety-ppe-awareness',
  'working-at-height-dropped-object-awareness',
  'electrical-safety-awareness',
  'road-safety-defensive-driving-awareness',
  'fatigue-management-awareness',
  'risk-assessment-incident-reporting',
  'emergency-awareness',
  'environmental-awareness-for-workplaces'
)
ORDER BY category.sort_order, course.title;
