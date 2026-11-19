export const company = {
  name: 'EcoHealth & Transport Solutions Ltd',
  shortName: 'EcoHealth',
  tagline: 'Safe People. Healthy Environment. Sustainable Future.',
  country: 'Rwanda',
  hero: {
    eyebrow: 'EcoHealth & Transport Solutions Ltd',
    headline: 'Building Safer Operations. Protecting People. Sustaining Our Future.',
    subheading:
      'Practical EHS consultancy, environmental management, workforce training, technical field support, and transport safety solutions for businesses and projects in Rwanda.',
    primaryCta: 'Request a Quote',
    secondaryCta: 'Explore Our Services',
  },
  intro: {
    headline: 'Where operational safety meets environmental responsibility.',
    body: [
      'EcoHealth & Transport Solutions Ltd supports organisations in strengthening workplace safety, managing environmental responsibilities, and delivering field operations responsibly.',
      'From EHS compliance and environmental management to workforce training and transport safety, we provide practical, risk-based solutions for projects in Rwanda. Regional engagements are considered individually, subject to scope and capacity.',
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
  | 'waste-management';

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
    title: 'EHS / HSE Consultancy & Compliance',
    shortTitle: 'EHS Consultancy',
    summary:
      'Practical environment, health, and safety consultancy that helps organisations identify hazards, satisfy compliance obligations, and build a credible safety culture.',
    image: 'https://images.pexels.com/photos/8487361/pexels-photo-8487361.jpeg?auto=compress&cs=tinysrgb&w=1400',
    imageAlt: 'Two engineers in protective gear and hardhats discussing a project inside a building under construction',
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
    related: ['environmental-management', 'training-capacity-building', 'transport-fleet-safety'],
  },
  {
    slug: 'environmental-management',
    index: '02',
    title: 'Environmental Management & Sustainability',
    shortTitle: 'Environmental Management',
    summary:
      'Environmental management support that helps projects reduce their footprint, meet environmental obligations, and operate responsibly in sensitive contexts.',
    image: 'https://images.pexels.com/photos/10365944/pexels-photo-10365944.jpeg?auto=compress&cs=tinysrgb&w=1400',
    imageAlt: 'Group of workers in orange safety vests walking through a lush forest',
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
    index: '03',
    title: 'Training & Capacity Building',
    shortTitle: 'Training',
    summary:
      'Workplace safety, environmental, and operational training designed to build real capability across teams, from frontline workers to supervisors and managers.',
    image: 'https://images.pexels.com/photos/8761547/pexels-photo-8761547.jpeg?auto=compress&cs=tinysrgb&w=1400',
    imageAlt: 'Diverse group of business professionals attentively attending a conference session',
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
    related: ['ehs-consultancy', 'environmental-management', 'transport-fleet-safety'],
  },
  {
    slug: 'telecommunications-field-support',
    index: '04',
    title: 'Telecommunications & Technical Field Support',
    shortTitle: 'Telecom Field Support',
    summary:
      'Technical field support for telecommunications and infrastructure projects, covering deployment, inspection, and safety supervision in the field.',
    image: 'https://images.pexels.com/photos/19728112/pexels-photo-19728112.jpeg?auto=compress&cs=tinysrgb&w=1400',
    imageAlt: 'Two workers repairing a cellular tower against a cloudy sky',
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
    index: '05',
    title: 'Transport, Fleet Safety & Logistics',
    shortTitle: 'Transport & Fleet Safety',
    summary:
      'Transport safety and fleet management support that helps organisations move people and materials more safely on site and across the road network.',
    image: 'https://images.pexels.com/photos/1606957/pexels-photo-1606957.jpeg?auto=compress&cs=tinysrgb&w=1400',
    imageAlt: 'A row of trucks and car transporters parked at sunset in an open parking lot',
    intro:
      'We help organisations manage transport risk from fleet safety policies to driver behaviour and journey planning. Our support is practical and field-oriented, focused on operations in Rwanda; regional engagements are considered individually against scope and capacity.',
    problems: [
      'Transport-related incidents affecting people, assets, and schedules',
      'Inconsistent driver standards and journey management practices',
      'Fleet safety policies that exist on paper but not in practice',
      'Need for structured fleet safety reporting for clients and regulators',
    ],
    offerings: [
      'Fleet safety policy and procedure development',
      'Driver safety and defensive driving awareness training',
      'Journey management planning',
      'Transport risk assessments',
      'Vehicle and fleet inspection frameworks',
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
    related: ['ehs-consultancy', 'training-capacity-building', 'telecommunications-field-support'],
  },
  {
    slug: 'waste-management',
    index: '06',
    title: 'Waste Management & E-Waste Solutions',
    shortTitle: 'Waste & E-Waste',
    summary:
      'Responsible waste management and electronic waste solutions that help organisations handle, segregate, and dispose of waste in compliance with good practice.',
    image: 'https://images.pexels.com/photos/36751332/pexels-photo-36751332.jpeg?auto=compress&cs=tinysrgb&w=1400',
    imageAlt: 'Workers sorting waste in a recycling facility, showcasing environmental sustainability efforts',
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
];

export const about = {
  mission:
    'To support organisations in Rwanda with practical safety, environmental, and operational solutions that protect people, reduce harm, and strengthen performance, while considering regional engagements individually.',
  vision:
    'To be a trusted partner for businesses and institutions seeking safer operations, responsible environmental management, and sustainable growth.',
  description:
    'EcoHealth & Transport Solutions Ltd is a Rwanda-based company offering environment, health, and safety consultancy, environmental management, training, telecommunications field support, transport safety, and waste management support. The scope of each engagement is agreed to match project needs, available resources, and any required professional authorisations.',
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
    'EcoHealth & Transport Solutions Ltd welcomes enquiries from contractors, principals, procurement teams, and organisations seeking a potential local partner for safety, environmental, and field operations in Rwanda.',
  subcontracting: [
    'EHS and safety supervision support for active projects',
    'Environmental management and monitoring on site',
    'Technical field support for telecommunications and infrastructure work',
    'Workforce training scoped to project-specific risks',
    'Transport and fleet safety support for logistics operations',
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
  { label: 'Services', path: '/services' },
  { label: 'Training', path: '/training' },
  { label: 'Projects', path: '/projects' },
  { label: 'Insights', path: '/insights' },
  { label: 'Partners', path: '/partners' },
  { label: 'Contact', path: '/contact' },
];

export const footerNav = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Projects & Experience', path: '/projects' },
      { label: 'Partners & Procurement', path: '/partners' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'EHS Consultancy', path: '/services/ehs-consultancy' },
      { label: 'Environmental Management', path: '/services/environmental-management' },
      { label: 'Training & Capacity Building', path: '/services/training-capacity-building' },
      { label: 'Telecom Field Support', path: '/services/telecommunications-field-support' },
      { label: 'Transport & Fleet Safety', path: '/services/transport-fleet-safety' },
      { label: 'Waste & E-Waste', path: '/services/waste-management' },
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
};
