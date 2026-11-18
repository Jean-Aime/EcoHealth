-- Sample training catalogue for demonstrating the EcoHealth training platform.
--
-- This is illustrative content, not verified company material. Review every
-- course, date, location and description before the catalogue goes public, and
-- edit or archive anything that does not match EcoHealth's approved offerings.
--
-- Deliberately NOT seeded: participants, registrations, attendance records,
-- assessment results or certificates. Those must reflect real people and real
-- completions only.
--
-- Run after 20261117154500_training_management_system.sql and
-- 20261118103000_online_learning.sql. The script is idempotent: re-running it
-- updates nothing that already exists.

-- ————————————————————————— Categories —————————————————————————

INSERT INTO public.training_categories (name, slug, description, sort_order) VALUES
  ('EHS & Occupational Safety', 'ehs-occupational-safety',
   'Hazard identification, risk control and day-to-day safety practice for operational teams.', 1),
  ('Environmental Management', 'environmental-management',
   'Environmental responsibility, impact control and compliance for projects and facilities.', 2),
  ('Transport & Fleet Safety', 'transport-fleet-safety',
   'Driver safety, journey management and fleet risk for organisations that operate vehicles.', 3),
  ('Waste & E-Waste Management', 'waste-e-waste',
   'Segregation, storage, handling and documented disposal of general, hazardous and electronic waste.', 4),
  ('Telecom Field Safety', 'telecom-field-safety',
   'Safe working practice for field teams installing and maintaining telecom infrastructure.', 5)
ON CONFLICT (slug) DO NOTHING;

-- ————————————————————————— Courses —————————————————————————

INSERT INTO public.training_courses (
  category_id, slug, title, summary, description, learning_objectives,
  target_audience, prerequisites, duration_minutes, delivery_formats,
  price_minor, currency, requires_assessment, passing_score, published
)
SELECT c.id, v.slug, v.title, v.summary, v.description, v.objectives, v.audience,
       v.prerequisites, v.duration, v.formats, NULL, 'RWF',
       v.requires_assessment, 70, true
FROM public.training_categories c
JOIN (VALUES
  (
    'ehs-occupational-safety',
    'risk-assessment-hazard-control',
    'Risk Assessment & Hazard Control',
    'A practical method for identifying hazards, rating risk and choosing controls that hold up in the field.',
    E'This course gives supervisors and safety officers a repeatable way to assess risk before work starts.\n\nParticipants work through a live scenario from their own operation: describing the task, identifying hazards, rating likelihood and severity, and selecting controls in the correct order of priority. The course closes with how to record, communicate and review the assessment so it stays useful after the toolbox talk.\n\nDelivery is workshop-based with guided exercises and a short practical assessment.',
    ARRAY[
      'Describe a task accurately enough to assess its risks',
      'Identify hazards across people, equipment, environment and procedures',
      'Rate risk using a simple likelihood and severity matrix',
      'Apply the hierarchy of control before relying on personal protective equipment',
      'Record and review assessments so controls remain effective'
    ],
    'Supervisors, safety officers, site managers and team leads.',
    'No prior formal safety qualification is required. Participants should be familiar with their own work area.',
    480,
    ARRAY['classroom', 'onsite', 'hybrid'],
    false
  ),
  (
    'ehs-occupational-safety',
    'incident-investigation-root-cause',
    'Incident Investigation & Root Cause Analysis',
    'Investigate what actually happened, separate cause from blame, and close the loop with owned corrective actions.',
    E'Incident investigations fail when they stop at the person closest to the event. This course builds a structured investigation process: securing the scene, gathering evidence, interviewing without blame, and tracing contributing factors through to root causes.\n\nParticipants practise on a case study and leave with a report template and an action-tracking method that can be applied the next working day.\n\nSuitable for teams that already record incidents and want the follow-up to produce lasting change.',
    ARRAY[
      'Secure an incident scene and preserve evidence',
      'Conduct witness interviews that gather facts rather than assign blame',
      'Separate immediate causes from underlying and root causes',
      'Write findings and recommendations that withstand scrutiny',
      'Assign, track and verify corrective actions'
    ],
    'Safety officers, operations managers, HR and anyone responsible for incident follow-up.',
    'Familiarity with your organisation''s incident reporting form is helpful but not required.',
    360,
    ARRAY['classroom', 'onsite'],
    false
  ),
  (
    'environmental-management',
    'environmental-management-site-practice',
    'Environmental Management in Site Operations',
    'Turn an environmental management plan into daily site practice: controls, monitoring and records.',
    E'An environmental management plan is only as good as the habits on site. This course translates commitments into workable routines for dust, noise, spills, water and protected areas.\n\nParticipants review monitoring records, practise responding to a spill scenario, and examine how to keep evidence that satisfies clients, regulators and tender requirements.\n\nIncludes a session on environmental awareness for subcontractors and site visitors.',
    ARRAY[
      'Identify the significant environmental aspects of a site activity',
      'Select and inspect practical control measures',
      'Keep monitoring and inspection records that stand up to audit',
      'Respond to spills and environmental incidents',
      'Brief subcontractors and visitors on site environmental rules'
    ],
    'Site managers, environmental officers, HSE coordinators and project engineers.',
    'None. Basic familiarity with construction or industrial operations is an advantage.',
    420,
    ARRAY['onsite', 'hybrid'],
    false
  ),
  (
    'transport-fleet-safety',
    'defensive-driving-fleet-safety',
    'Defensive Driving & Fleet Safety',
    'Reduce journey risk through planning, vehicle checks and defensive driving habits.',
    E'Most fleet incidents are preceded by decisions made before the vehicle moves: an unrealistic schedule, an unchecked vehicle, an unplanned route.\n\nThis course covers pre-trip inspection, journey management, fatigue and speed awareness, load security and defensive driving technique. It is designed for drivers who cover long distances on mixed road conditions.\n\nPractical exercises are adapted to the vehicles the organisation actually operates.',
    ARRAY[
      'Complete a documented pre-trip vehicle inspection',
      'Plan journeys with realistic timing, rest breaks and route risk in mind',
      'Recognise and manage driver fatigue',
      'Apply defensive driving principles in traffic and poor conditions',
      'Secure loads and report vehicle defects correctly'
    ],
    'Drivers, dispatch staff and fleet supervisors.',
    'A valid driving licence for the vehicle class used by the organisation.',
    300,
    ARRAY['classroom', 'onsite'],
    false
  ),
  (
    'ehs-occupational-safety',
    'foundations-occupational-health-safety',
    'Foundations of Occupational Health & Safety',
    'A self-paced online introduction to workplace health and safety, worked through chapter by chapter.',
    E'This online programme introduces the language and habits of occupational health and safety for people who are new to the topic or need a refresher.\n\nWork through four short chapters at your own pace. Each chapter explains a core idea, gives practical examples, and asks you to apply it to your own workplace. Mark a chapter complete to move on; your progress is saved to your learner account.\n\nThis is an awareness-level programme. It complements, rather than replaces, practical site training and supervision.',
    ARRAY[
      'Explain the difference between a hazard and a risk',
      'Apply the hierarchy of control to common workplace hazards',
      'Describe when personal protective equipment is appropriate',
      'Report incidents and near misses correctly'
    ],
    'Anyone who works on site or supervises operational teams.',
    'No prior safety training required.',
    180,
    ARRAY['online'],
    false
  )
) AS v(category_slug, slug, title, summary, description, objectives, audience,
       prerequisites, duration, formats, requires_assessment)
  ON c.slug = v.category_slug
ON CONFLICT (slug) DO NOTHING;

-- ————————————————————————— Upcoming sessions —————————————————————————
-- Dates are examples. Adjust them to the real delivery calendar before publishing.

INSERT INTO public.training_sessions (
  course_id, starts_at, ends_at, location, delivery_format, capacity, price_minor, status, published
)
SELECT c.id, v.starts_at, v.ends_at, v.location, v.format, v.capacity, NULL, 'open', true
FROM public.training_courses c
JOIN (VALUES
  ('risk-assessment-hazard-control', timestamptz '2026-12-08 09:00+02', timestamptz '2026-12-09 16:00+02',
   'Kigali — venue confirmed on approval', 'classroom', 20),
  ('incident-investigation-root-cause', timestamptz '2027-01-19 09:00+02', timestamptz '2027-01-20 16:00+02',
   'Kigali — venue confirmed on approval', 'classroom', 16),
  ('environmental-management-site-practice', timestamptz '2027-02-02 09:00+02', timestamptz '2027-02-03 16:00+02',
   'On site — arranged with the client', 'onsite', 18),
  ('defensive-driving-fleet-safety', timestamptz '2026-12-15 08:30+02', timestamptz '2026-12-15 16:30+02',
   'Kigali — venue confirmed on approval', 'classroom', 12),
  ('foundations-occupational-health-safety', timestamptz '2026-12-01 00:00+02', timestamptz '2027-01-31 23:59+02',
   'Online — self-paced', 'online', 200)
) AS v(course_slug, starts_at, ends_at, location, format, capacity)
  ON c.slug = v.course_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.training_sessions s WHERE s.course_id = c.id
);

-- ————————————————————————— Online chapters —————————————————————————

INSERT INTO public.training_chapters (
  course_id, position, title, summary, body, estimated_minutes, published
)
SELECT c.id, v.position, v.title, v.summary, v.body, v.minutes, true
FROM public.training_courses c
JOIN (VALUES
  (1,
   'Hazards, risk and the hierarchy of control',
   'What we mean by hazard and risk, and why the order of controls matters.',
   E'A hazard is anything with the potential to cause harm: a raised edge, a chemical, an unguarded machine, a long driving shift, a confined space. Risk is the chance that harm actually happens, combined with how serious it would be. The distinction matters because we manage them differently. A hazard may be present every day without anyone being harmed; the risk is what changes with conditions, behaviour and controls.\n\nWhen we assess risk we usually combine two judgements: how likely is the harm, and how severe would it be. A simple matrix is enough for most workplaces. What matters is that the judgement is honest and recorded, not that the matrix is sophisticated.\n\nControls must be chosen in order. First, can the hazard be eliminated — do we need to do this task at all, or can it be done a different way? Second, can it be substituted with something less dangerous? Third, can we engineer the risk out with guards, ventilation, barriers or interlocks? Fourth, can we reduce exposure through administration: procedures, rotation, permits, training and supervision? Personal protective equipment comes last. It protects the individual, but only if it fits, is worn correctly and is maintained, and it does nothing about the hazard itself.\n\nA useful test before closing an assessment: if the control fails, how bad is the outcome? Controls that people depend on every minute of the day deserve inspection, not just a signature on a form.',
   6),
  (2,
   'Personal protective equipment and safe systems of work',
   'When PPE is the right answer, and how to make a safe system of work usable.',
   E'Personal protective equipment is the last line of defence, not the first. It is still essential where a residual risk remains after other controls: eye protection when cutting, hearing protection near machinery, respiratory protection during dusty work, and high-visibility clothing where vehicles move.\n\nPPE only works when it is the right type for the hazard, fits the person, and is looked after. That means selecting by standard rather than by price, training people to check and wear it properly, replacing damaged items without argument, and recording issue so the organisation knows who has what.\n\nA safe system of work describes how a task is done safely in practice: who does what, what must be checked first, what stops the job, and who can authorise a change. Written procedures fail when they describe an ideal task nobody performs. The most useful systems are short, specific and built with the people who do the work.\n\nPermits to work are a form of safe system for high-risk activity. They only add value when the isolations, gas tests and signatures are genuinely verified on site, and when the person authorising the work has seen the conditions for themselves.',
   5),
  (3,
   'Emergency preparedness and incident reporting',
   'Prepare for the event, and learn from it afterwards.',
   E'Emergency preparedness answers four questions: what could happen here, who is in charge, how do people get out, and how do we know it worked? The answers belong in a plan that is briefed to everyone on site, including visitors and contractors, and tested through drills.\n\nDrills should be recorded and reviewed honestly. A drill where everyone walks calmly to a familiar assembly point on a sunny morning does not test the difficult parts: blocked routes, missing wardens, a roll call that cannot be completed, or communication that fails.\n\nIncident reporting exists so the organisation learns. Report near misses as well as injuries; the near miss is often the free lesson. A good report is factual and timely: what happened, where, who was involved, what the immediate response was, and what evidence exists.\n\nInvestigation should reach beyond the person closest to the event. Ask what made the unsafe act seem reasonable at the time: the schedule, the equipment, the procedure, the supervision, or the absence of a barrier. Corrective actions need an owner and a date, and someone must verify that the action actually reduced the risk before the case is closed.',
   6),
  (4,
   'Environmental responsibility in daily operations',
   'Practical habits that keep environmental commitments true on site.',
   E'Environmental commitments are kept or broken in small decisions: where a drum is stored, whether a drip tray is used, whether a vehicle is washed near a drain, whether a subcontractor knows where to put spoil.\n\nStart with the significant aspects of what you actually do. Dust, noise, fuel and oil storage, wastewater, spoil and waste segregation are common ones on construction and industrial sites. For each, decide the control, inspect it, and record that you did.\n\nWaste is a useful test of whether a system works. Segregate at the point of generation, label containers, keep hazardous and general waste apart, use licensed transport, and reconcile disposal certificates against the volumes you recorded. When the numbers do not match, something left the site without a record.\n\nSpill response needs to be physical, not theoretical: absorbent material available and known, a drain cover within reach, a clear reporting route. Afterwards, record what happened, what was affected, and what changed so it is less likely next time.\n\nFinally, brief the people who are not employees. Contractors, drivers and visitors follow the site rules they are told about, and the environmental plan should be part of that briefing.',
   6)
) AS v(position, title, summary, body, minutes)
  ON c.slug = 'foundations-occupational-health-safety'
WHERE NOT EXISTS (
  SELECT 1 FROM public.training_chapters ch WHERE ch.course_id = c.id
);

-- Enable the online programme and require completion before a certificate.

UPDATE public.training_courses
SET online_enabled = true,
    require_online_completion = true,
    updated_at = now()
WHERE slug = 'foundations-occupational-health-safety';

-- Summary for the administrator who runs this script.
SELECT
  (SELECT count(*) FROM public.training_categories) AS categories,
  (SELECT count(*) FROM public.training_courses) AS courses,
  (SELECT count(*) FROM public.training_sessions) AS sessions,
  (SELECT count(*) FROM public.training_chapters) AS chapters;
