export const siteImages = {
  siteTeam: '/images/image14.jpeg',
  fieldDiscussion: '/images/image15.jpeg',
  fieldCrew: '/images/image16.jpeg',
  siteSafety: '/images/image17.jpeg',
  constructionTeam: '/images/image18.jpeg',
  brandedHelmet: '/images/image13.jpeg',
  safetyTraining: '/images/image6.jpeg',
  safetyTypes: '/images/image2.jpeg',
  ppeEquipment: '/images/image1.jpeg',
  riskReporting: '/images/image5.jpeg',
  transportSafety: '/images/image11.jpeg',
} as const;

export const company = {
  name: 'EcoHealth & Transport Solutions Ltd',
  shortName: 'EcoHealth',
  tagline: 'Safe People. Healthy Environment. Sustainable Future.',
  country: 'Rwanda',
  hero: {
    eyebrow: 'EcoHealth & Transport Solutions Ltd',
    headline: 'Building Safer Operations. Protecting People. Moving Work Forward.',
    subheading:
      'Environment, Health & Safety (EHS) consultancy, transport and logistics, PPE supply, rigging and lifting services, and professional safety training for projects in Rwanda.',
    primaryCta: 'Request a Quote',
    secondaryCta: 'Explore Our Services',
  },
  intro: {
    headline: 'Safety expertise and practical support for every worksite.',
    body: [
      'EcoHealth & Transport Solutions Ltd helps organisations protect people and manage operational risk through EHS consultancy, transport and logistics support, PPE supply, rigging and lifting services, and professional safety training.',
      'We work with organisations in Rwanda to define practical scopes that fit their sites, teams, and project requirements. Product availability, technical requirements, and delivery arrangements are confirmed for each enquiry.',
    ],
  },
  whyEcoHealth: [
    { title: 'Practical, risk-based safety solutions', body: 'We focus on real-world risk reduction rather than paperwork-only compliance, helping teams identify and manage hazards that matter.' },
    { title: 'Services tailored to project requirements', body: 'No two projects are the same. We adapt scope, deliverables, and approach to each client’s operational context and risk profile.' },
    { title: 'Prevention and compliance', body: 'Our work prioritises prevention building systems and habits that reduce incidents and satisfy regulatory and contractual obligations.' },
    { title: 'Documentation and continuous improvement', body: 'Clear reporting, traceable records, and structured improvement cycles help clients demonstrate performance and learn from every project.' },
    { title: 'Flexible consultancy, training, and project support', body: 'Engagements range from short advisory visits to embedded project support and structured training programmes, scaled to your needs.' },
  ],
};

export type ServiceSlug =
  | 'ehs-consultancy'
  | 'environmental-management'
  | 'training-capacity-building'
  | 'telecommunications-field-support'
  | 'transport-fleet-safety'
  | 'waste-management'
  | 'ppe-supply'
  | 'rigging-and-lifting-services';

export interface Service {
  slug: ServiceSlug;
  index: string;
  title: string;
  shortTitle: string;
  summary: string;
  image: string;
  imageAlt: string;
  intro: string;
  problems: string[];
  offerings: string[];
  benefits: string[];
  deliverables: string[];
  related: ServiceSlug[];
}

export const services: Service[] = [
  {
    slug: 'ehs-consultancy',
    index: '01',
    title: 'Environmental Health & Safety (EHS) Consultancy',
    shortTitle: 'Environmental Health & Safety (EHS) Consultancy',
    summary:
      'Practical environment, health, and safety consultancy that helps organisations identify hazards, satisfy compliance obligations, and build a credible safety culture.',
    image: siteImages.fieldDiscussion,
    imageAlt: 'Field team members discussing work at an active project site',
    intro:
      'Our EHS consultancy supports organisations in managing workplace risks, meeting regulatory requirements, and demonstrating a genuine commitment to safe operations. We work with project teams, contractors, and institutions to put practical safety systems in place.',
    problems: [
      'Gaps between written safety policies and what happens on site',
      'Unclear regulatory obligations and documentation requirements',
      'Inconsistent hazard identification and risk assessment practices',
      'Limited internal capacity to manage EHS on complex projects',
    ],
    offerings: [
      'EHS risk assessments and method statement reviews',
      'Development and review of safety management systems',
      'Site safety inspections and compliance auditing',
      'Incident investigation support and root-cause analysis',
      'EHS documentation and reporting frameworks',
      'Contractor and subcontractor safety coordination',
    ],
    benefits: [
      'Clearer understanding of operational risks and obligations',
      'Strengthened compliance with applicable regulations and client requirements',
      'Improved hazard awareness across project teams',
      'A documented basis for demonstrating safety performance',
    ],
    deliverables: [
      'Risk assessment reports and action plans',
      'Safety management system documentation',
      'Site inspection findings and corrective recommendations',
      'Incident investigation reports with improvement actions',
    ],
    related: ['transport-fleet-safety', 'rigging-and-lifting-services', 'training-capacity-building'],
  },
  {
    slug: 'environmental-management',
    index: '06',
    title: 'Environmental Management & Sustainability',
    shortTitle: 'Environmental Management',
    summary:
      'Environmental management support that helps projects reduce their footprint, meet environmental obligations, and operate responsibly in sensitive contexts.',
    image: siteImages.fieldCrew,
    imageAlt: 'Field team wearing high-visibility clothing at a project site',
    intro:
      'We help organisations understand and manage their environmental responsibilities from site-level impacts to broader sustainability commitments. Our focus is practical: environmental management that fits the way your project actually runs.',
    problems: [
      'Environmental obligations that are unclear or poorly documented',
      'Site activities with potential impacts on land, water, or communities',
      'Lack of structured environmental monitoring or reporting',
      'Pressure from clients and regulators to demonstrate sustainability',
    ],
    offerings: [
      'Environmental impact screening and coordination with authorised specialists for formal assessments or approvals',
      'Environmental management plans for projects and sites',
      'Environmental monitoring and compliance reporting',
      'Waste and pollution control guidance',
      'Sustainability strategy advisory',
      'Environmental awareness training for site teams',
    ],
    benefits: [
      'A structured approach to managing environmental impacts',
      'Improved readiness for regulatory and client scrutiny',
      'Clearer reporting that supports accountability',
      'A stronger foundation for sustainability commitments',
    ],
    deliverables: [
      'Environmental management plans',
      'Monitoring reports and compliance summaries',
      'Impact assessment documentation',
      'Sustainability advisory notes',
    ],
    related: ['ehs-consultancy', 'waste-management', 'training-capacity-building'],
  },
  {
    slug: 'training-capacity-building',
    index: '05',
    title: 'Professional Safety Training',
    shortTitle: 'Professional Safety Training',
    summary:
      'Workplace safety, environmental, and operational training designed to build real capability across teams, from frontline workers to supervisors and managers.',
    image: siteImages.siteSafety,
    imageAlt: 'Workers wearing safety equipment during site work',
    intro:
      'We deliver structured training that builds practical capability in safety, environmental management, and operational discipline. Programmes are tailored to the roles and risks your teams actually face, with a focus on behaviour change rather than certificates alone.',
    problems: [
      'Workforce teams with limited formal safety training',
      'Supervisors needing stronger risk-awareness and reporting skills',
      'Inconsistent safety behaviour across sites and shifts',
      'Need for documented training records for compliance and tenders',
    ],
    offerings: [
      'Workplace safety and PPE awareness',
      'Working-at-height and dropped-object prevention awareness',
      'Electrical safety awareness',
      'Road safety and defensive driving awareness',
      'Fatigue management',
      'Risk assessment and incident reporting',
      'Emergency awareness',
      'Environmental training',
    ],
    benefits: [
      'Stronger hazard recognition and safer behaviour on site',
      'Supervisors better equipped to manage and report risk',
      'Documented training that supports compliance and procurement',
      'A culture of continuous improvement in safety performance',
    ],
    deliverables: [
      'Tailored training programmes scoped to your teams',
      'Facilitator competence and delivery arrangements agreed for each programme',
      'Attendance records where included in the agreed scope',
      'Post-training improvement recommendations where agreed',
    ],
    related: ['ehs-consultancy', 'transport-fleet-safety', 'rigging-and-lifting-services'],
  },
  {
    slug: 'telecommunications-field-support',
    index: '07',
    title: 'Telecommunications & Technical Field Support',
    shortTitle: 'Telecom Field Support',
    summary:
      'Technical field support for telecommunications and infrastructure projects, covering deployment, inspection, and safety supervision in the field.',
    image: siteImages.siteTeam,
    imageAlt: 'Field team in safety equipment at an infrastructure project site',
    intro:
      'We scope telecommunications and infrastructure field support to the agreed work, confirmed competence and authorisations, available resources, and project agreements. Tower, antenna, radio, and equipment-change work is undertaken only where those requirements are met.',
    problems: [
      'Field deployments needing trained, safety-aware technical teams',
      'Tower and site work with significant height and electrical risks',
      'Inconsistent quality and documentation across field activities',
      'Limited local capacity for reliable technical field execution',
    ],
    offerings: [
      'Field deployment and installation support within confirmed competence and project authorisations',
      'Site inspection and quality checks',
      'Technical supervision and coordination',
      'Safety supervision for tower and field work',
      'Field reporting and documentation',
      'Drive-test, network-optimisation, maintenance, or troubleshooting support where resources and agreements are in place',
    ],
    benefits: [
      'Reliable, safety-conscious field execution',
      'Better quality consistency across sites',
      'Clear documentation of field activities and findings',
      'Reduced operational risk during deployment',
    ],
    deliverables: [
      'Field activity and inspection reports',
      'Site documentation and handover records',
      'Safety supervision logs',
      'Quality check reports',
    ],
    related: ['ehs-consultancy', 'transport-fleet-safety', 'training-capacity-building'],
  },
  {
    slug: 'transport-fleet-safety',
    index: '02',
    title: 'Transport and Logistics',
    shortTitle: 'Transport and Logistics',
    summary:
      'Transport and logistics support for planning the movement of people and materials while managing journey, driver, and fleet risks.',
    image: siteImages.transportSafety,
    imageAlt: 'Road safety reminder graphic for drivers',
    intro:
      'We help organisations plan safer movement of people, equipment, and materials through transport risk assessment, journey planning, driver and fleet safety, and logistics coordination. The scope, resources, and delivery arrangements are agreed for each project.',
    problems: [
      'Transport-related incidents affecting people, assets, and schedules',
      'Inconsistent driver standards and journey management practices',
      'Fleet safety policies that exist on paper but not in practice',
      'Need for structured fleet safety reporting for clients and regulators',
    ],
    offerings: [
      'Transport planning and logistics coordination scoped to project requirements',
      'Fleet safety policy and procedure development',
      'Driver safety and defensive driving awareness training',
      'Journey management planning',
      'Transport risk assessments',
      'Vehicle and fleet inspection frameworks where included in scope',
      'Incident reporting and analysis for transport operations',
    ],
    benefits: [
      'Reduced transport-related risk to people and assets',
      'Consistent standards across drivers, vehicles, and routes',
      'Better visibility of transport safety performance',
      'Documentation that supports compliance and tender requirements',
    ],
    deliverables: [
      'Fleet safety manuals and procedures',
      'Driver training records',
      'Journey management templates',
      'Transport risk assessment reports',
    ],
    related: ['ehs-consultancy', 'training-capacity-building', 'rigging-and-lifting-services'],
  },
  {
    slug: 'waste-management',
    index: '08',
    title: 'Waste Management & E-Waste Solutions',
    shortTitle: 'Waste & E-Waste',
    summary:
      'Responsible waste management and electronic waste solutions that help organisations handle, segregate, and dispose of waste in compliance with good practice.',
    image: siteImages.constructionTeam,
    imageAlt: 'Project team wearing safety equipment at a construction site',
    intro:
      'We support organisations in planning responsible waste management, including e-waste segregation and disposal coordination. Collection and recycling are arranged through authorised partners where required; formal approvals and regulated work remain with appropriately authorised specialists.',
    problems: [
      'Unclear responsibilities for waste handling and disposal',
      'Electronic waste accumulating without a safe disposal route',
      'Environmental risks from improper waste handling',
      'Need for documented waste management practices for compliance',
    ],
    offerings: [
      'Waste management planning and advisory',
      'E-waste collection and recycling coordination through authorised partners',
      'Waste segregation guidance for sites and facilities',
      'Compliance documentation for waste streams',
      'Environmental awareness training for waste handling',
      'Waste reduction and recycling advisory',
    ],
    benefits: [
      'Responsible handling of waste and electronic waste',
      'Reduced environmental and reputational risk',
      'Clear documentation for compliance and reporting',
      'A practical path toward better waste performance',
    ],
    deliverables: [
      'Waste management plans',
      'E-waste handling and disposal documentation',
      'Segregation guidance materials',
      'Compliance and reporting summaries',
    ],
    related: ['environmental-management', 'ehs-consultancy', 'training-capacity-building'],
  },
  {
    slug: 'ppe-supply',
    index: '03',
    title: 'PPE Supply',
    shortTitle: 'PPE Supply',
    summary:
      'Personal protective equipment options selected around workplace hazards, applicable standards, fit, and project requirements.',
    image: siteImages.ppeEquipment,
    imageAlt: 'Full-body safety harness and personal protective equipment guidance',
    intro:
      'We help organisations identify and source personal protective equipment for their work activities. Product specifications, applicable standards, brands, certification documents, quantities, and availability are confirmed as part of each quotation.',
    problems: [
      'Unclear PPE requirements for different tasks and hazards',
      'Difficulty matching products to applicable specifications',
      'Inconsistent PPE selection across teams and work locations',
      'Need to confirm quantities, availability, and delivery before ordering',
    ],
    offerings: [
      'PPE selection support based on task and hazard requirements',
      'Safety helmets, eye and face protection, gloves, and safety footwear',
      'High-visibility clothing and hearing protection options',
      'Fall-protection equipment enquiries, subject to product specification and availability',
      'Product specifications and supporting documentation for quoted items',
      'Supply and delivery arrangements confirmed for each order',
    ],
    benefits: [
      'PPE choices aligned with identified work hazards',
      'Clear product specifications before an order is confirmed',
      'A consistent process for requesting and reviewing PPE requirements',
      'Availability and delivery expectations agreed up front',
    ],
    deliverables: [
      'Quotation for the requested PPE items and quantities',
      'Product specifications and supporting documentation where available',
      'Confirmed order and delivery details',
      'PPE selection guidance when included in the agreed scope',
    ],
    related: ['ehs-consultancy', 'rigging-and-lifting-services', 'training-capacity-building'],
  },
  {
    slug: 'rigging-and-lifting-services',
    index: '04',
    title: 'Rigging and Lifting Services',
    shortTitle: 'Rigging and Lifting Services',
    summary:
      'Project-scoped rigging and lifting support, planned around the load, equipment, worksite conditions, and confirmed personnel competence.',
    image: siteImages.safetyTraining,
    imageAlt: 'Lifting and rigging safety training graphic',
    intro:
      'We discuss rigging and lifting requirements with project teams and define a scope around the load, lift conditions, equipment, and site controls. Plans, equipment, personnel, authorisations, and any required inspection records are confirmed before work is agreed.',
    problems: [
      'Lifting tasks that need clearer planning and site coordination',
      'Uncertainty about equipment suitability and inspection records',
      'Worksite hazards that need to be considered before a lift',
      'Need to coordinate competent personnel and safe-work controls',
    ],
    offerings: [
      'Pre-lift task and worksite hazard reviews',
      'Lift-plan preparation or review where included in the agreed scope',
      'Rigging equipment requirements and inspection coordination',
      'Pre-lift briefings and work-team coordination',
      'On-site rigging or lifting support only where personnel, equipment, competence, and authorisations are confirmed',
    ],
    benefits: [
      'Lifting requirements considered before work begins',
      'Clearer coordination of people, equipment, and site controls',
      'Documented scope and responsibilities for the agreed work',
      'Better visibility of outstanding approvals or inspection requirements',
    ],
    deliverables: [
      'Agreed scope and lift-related documentation where applicable',
      'Task hazard review and control actions',
      'Equipment and personnel requirements for the agreed operation',
      'Site briefing or completion records where included in scope',
    ],
    related: ['ehs-consultancy', 'ppe-supply', 'training-capacity-building'],
  },
];

export const primaryServiceSlugs: ServiceSlug[] = [
  'ehs-consultancy',
  'transport-fleet-safety',
  'ppe-supply',
  'rigging-and-lifting-services',
  'training-capacity-building',
];

export const primaryServices: Service[] = primaryServiceSlugs
  .map((slug) => services.find((service) => service.slug === slug))
  .filter((service): service is Service => Boolean(service));

export const about = {
  mission:
    'To support organisations in Rwanda with practical safety consultancy, PPE, lifting and logistics support, and professional training that protect people and strengthen operations.',
  vision:
    'To be a trusted partner for organisations seeking safer worksites and dependable operational support.',
  description:
    'EcoHealth & Transport Solutions Ltd is a Rwanda-based company offering Environment, Health & Safety (EHS) consultancy, transport and logistics, PPE supply, rigging and lifting services, and professional safety training. Each engagement is scoped to project needs, available resources, and applicable competence and authorisation requirements.',
  coreValues: [
    { title: 'Safety first', body: 'The protection of people guides every decision we make and every recommendation we give.' },
    { title: 'Integrity', body: 'We give honest, evidence-based advice even when it is not the easiest message to deliver.' },
    { title: 'Client focus', body: 'We tailor our work to the realities of each project and the priorities of the people we work with.' },
    { title: 'Accountability', body: 'We stand behind our deliverables and are clear about what we know, what we recommend, and why.' },
    { title: 'Environmental responsibility', body: 'We help clients reduce environmental harm and operate in ways that respect communities and ecosystems.' },
    { title: 'Continuous improvement', body: 'We learn from every engagement and help clients build the same habit into their own operations.' },
  ],
  approach: [
    'We begin by understanding the operational context, including the site, the team, the risks, and the obligations that matter.',
    'We then define a scope of support that is proportionate to the risk and useful to the people who will act on it.',
    'We deliver practical work on the ground and clear documentation behind it, so improvements are visible and traceable.',
    'We finish with recommendations that help clients keep improving long after the engagement ends.',
  ],
};

export const partnersContent = {
  intro:
    'EcoHealth & Transport Solutions Ltd welcomes enquiries from contractors, principals, procurement teams, and organisations seeking a local partner for EHS, transport and logistics, PPE, rigging and lifting, or safety training in Rwanda.',
  subcontracting: [
    'EHS consultancy and safety supervision',
    'Transport and logistics support scoped to project requirements',
    'PPE sourcing and supply enquiries',
    'Rigging and lifting support, subject to confirmed scope and competence',
    'Professional safety training for project teams',
  ],
  procurement: [
    'Clear, documented scope and deliverables for tender responses',
    'Safety and environmental credentials aligned to client requirements',
    'Flexibility to support prime contractors as a specialist subcontractor',
    'Rwanda-based engagement, scoped to project requirements and capacity',
  ],
};

export interface Article {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  body: string[];
  image?: string;
}

export const articles: Article[] = [
  {
    slug: 'practical-risk-assessment-on-active-sites',
    title: 'Practical Risk Assessment on Active Sites',
    category: 'Risk Management',
    excerpt: 'A risk assessment is only useful if it reflects what actually happens on site. Here is how to keep it grounded.',
    date: '2025-09-18',
    readTime: '5 min read',
    body: [
      'Risk assessment is the foundation of safe operations, but it loses value the moment it becomes a document produced for its own sake. The most useful assessments are built from direct observation of the work, conversations with the people doing it, and an honest accounting of what could go wrong.',
      'Start with the actual tasks. Walk the site. Talk to supervisors and frontline workers. Identify the hazards that are present, not the hazards that are convenient to list, and assess the risk in the context of how the work is really performed.',
      'Then focus on controls that are practical and verifiable. A control that cannot be checked is a control that will drift. Document who is responsible, how the control is maintained, and what happens when it fails.',
      'Finally, treat the assessment as a living document. When the work changes, the assessment changes. When an incident occurs, the assessment is reviewed. The goal is not a perfect document. It is a safer operation.',
    ],
  },
  {
    slug: 'environmental-responsibility-on-infrastructure-projects',
    title: 'Environmental Responsibility on Infrastructure Projects',
    category: 'Environmental Management',
    excerpt: 'Infrastructure projects carry environmental obligations that extend well beyond the construction footprint.',
    date: '2025-08-02',
    readTime: '6 min read',
    body: [
      'Infrastructure projects shape the environment around them. Excavation, movement of materials, vehicle traffic, and the presence of a workforce all create impacts that need to be understood and managed.',
      'An environmental management plan should be specific to the site and the activity. Generic plans copied between projects rarely capture the risks that matter. The plan should identify the likely impacts, set out controls, and define how performance will be monitored.',
      'Monitoring does not need to be complex, but it does need to be consistent. Simple, regular checks supported by clear records are more valuable than occasional detailed studies that nobody acts on.',
      'The objective is straightforward: reduce harm, meet obligations, and leave the site in a condition that respects the community and ecosystem around it.',
    ],
  },
  {
    slug: 'building-a-safety-culture-that-lasts',
    title: 'Building a Safety Culture That Lasts',
    category: 'Occupational Health & Safety',
    excerpt: 'Safety culture is not built with posters. It is built with leadership, consistency, and honest reporting.',
    date: '2025-07-15',
    readTime: '4 min read',
    body: [
      'A strong safety culture is the sum of many small decisions made over time. It is visible in how leaders respond to bad news, whether workers feel able to raise concerns, and what happens after an incident occurs.',
      'Culture cannot be installed by a single training session or a new policy document. It is built through consistent leadership behaviour, clear expectations, and a genuine willingness to learn from events rather than punish them away.',
      'Reporting is a leading indicator. When people report near-misses and concerns freely, the organisation has the information it needs to act before a serious incident occurs. When reporting drops, it usually means the culture has a problem.',
      'The organisations with the strongest safety performance are rarely the ones with the most paperwork. They are the ones where safety is part of how decisions are made, not an additional layer applied afterwards.',
    ],
  },
  {
    slug: 'managing-transport-risk-across-fleet-operations',
    title: 'Managing Transport Risk Across Fleet Operations',
    category: 'Transport Safety',
    excerpt: 'Transport is one of the highest-risk activities many organisations undertake. A structured approach makes the difference.',
    date: '2025-06-10',
    readTime: '5 min read',
    body: [
      'For many organisations, the highest-risk activity is on the road rather than on site. Moving people, equipment, and materials exposes a workforce to traffic, fatigue, and vehicle-related hazards every day.',
      'A structured approach to transport risk starts with policy, but it lives in practice. Driver standards, vehicle condition, journey planning, and fatigue management each play a part. When any one of them is weak, the others compensate only so far.',
      'Journey management is often overlooked. Planning the route, the timing, the rest breaks, and the communication points turns a risky trip into a managed activity. It does not eliminate risk, but it brings it within control.',
      'Finally, incident reporting for transport should be treated with the same seriousness as site incidents. The patterns that lead to serious road events are usually visible in the minor events that came before them.',
    ],
  },
];

export interface CaseStudySeed {
  slug: string;
  title: string;
  industry: string;
  location: string;
  scope: string;
  responsibilities: string[];
  approach: string[];
  outcomes: string[];
  image?: string;
  imageAlt?: string;
  confidential?: boolean;
}

/**
 * Approved case studies are published through the CMS, not this file.
 * Nothing is invented here: until the company confirms a project for publication
 * the Projects page shows a capability-led introduction instead.
 */
export const caseStudySeeds: CaseStudySeed[] = [];

export interface NavItem {
  label: string;
  path: string;
}

export const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  ...primaryServices.map((service) => ({
    label: service.title,
    path: `/services/${service.slug}`,
  })),
  { label: 'Contact Us', path: '/contact' },
];

export const footerNav = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Projects & Experience', path: '/projects' },
      { label: 'Partners & Procurement', path: '/partners' },
      { label: 'Contact Us', path: '/contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Environmental Health & Safety (EHS) Consultancy', path: '/services/ehs-consultancy' },
      { label: 'Transport and Logistics', path: '/services/transport-fleet-safety' },
      { label: 'PPE Supply', path: '/services/ppe-supply' },
      { label: 'Rigging and Lifting Services', path: '/services/rigging-and-lifting-services' },
      { label: 'Professional Safety Training', path: '/services/training-capacity-building' },
    ],
  },
];

export const servicePaths: Record<string, string> = {
  'ehs-consultancy': '/services/ehs-consultancy',
  'environmental-management': '/services/environmental-management',
  'training-capacity-building': '/services/training-capacity-building',
  'telecommunications-field-support': '/services/telecommunications-field-support',
  'transport-fleet-safety': '/services/transport-fleet-safety',
  'waste-management': '/services/waste-management',
  'ppe-supply': '/services/ppe-supply',
  'rigging-and-lifting-services': '/services/rigging-and-lifting-services',
};
