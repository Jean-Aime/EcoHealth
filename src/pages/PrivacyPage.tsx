import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { SectionMarker } from '@/components/motion';
import { siteImages } from '@/data/content';

const heroImage = siteImages.brandedHelmet;

const sections = [
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: 'When you use an enquiry or training form, we collect the details you provide, including your name, organisation, email address, telephone number, service or course, location, dates, participant details, participant count, requirements, preferred contact method, and consent. If you create a learner account, we also process your account profile, registrations, attendance, assessment results, learning-material access, and any certificate record issued to you.',
  },
  {
    id: 'how-we-use-it',
    title: 'How we use it',
    body: 'We use these details to respond to enquiries, administer registrations and training, communicate status changes, provide authorized course materials, record attendance and assessments, and issue or verify certificates when completion requirements are met. We do not sell your information or use it for unrelated marketing.',
  },
  {
    id: 'your-consent',
    title: 'Your consent',
    body: 'You confirm consent when you submit an enquiry, registration or corporate training request. For group registrations, the submitting contact confirms they are authorized to provide participant details. You may ask us to correct or delete information, subject to records that must be retained for operational, legal or certificate-verification purposes.',
  },
  {
    id: 'retention-security',
    title: 'Retention and security',
    body: 'Enquiry and training data is stored in a managed database with row-level access controls. Learners can access only records linked to their account; authorized staff can manage training records. Learning materials are stored privately and made available only to eligible learners. Submitted data is length-limited and validated. Retention periods and applicable record-keeping obligations require final company review.',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    body: 'Analytics is optional on this website and is only loaded when a measurement configuration is enabled for the deployment. Where enabled, it is used to understand aggregate site usage. Enquiry details are never included in analytics events.',
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: 'You may ask what information we hold about you, request a correction, or ask us to delete an enquiry or learner information, subject to records that must be retained for operational, legal or certificate-verification purposes. Use the contact form and select the general enquiry option, and our team will respond.',
  },
  {
    id: 'contact',
    title: 'Contact',
    body: 'Questions about this notice can be sent through the website enquiry form. We will respond using your preferred contact method.',
  },
];

export function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy | EcoHealth & Transport Solutions Ltd"
        description="How EcoHealth & Transport Solutions Ltd collects, uses, and protects information shared through enquiries and training services."
        path="/privacy"
      />

      <PageHero
        eyebrow="Privacy policy"
        title="How we handle the information you share."
        titleLines={['How we handle', 'the information you share.']}
        subtitle="A summary of how EcoHealth & Transport Solutions Ltd collects, uses, and protects information shared through this website and its training services."
        image={heroImage}
        imageAlt="EcoHealth branding on a safety helmet"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Privacy policy' }]}
        index="08"
        meta={['Enquiries and training', 'No advertising profiles', 'Access restricted']}
      />

      <section className="bg-ivory section-space">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <SectionMarker index="—" label="Contents" />
                <nav aria-label="Privacy policy contents" className="mt-6 border-t border-charcoal/15">
                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="group flex items-baseline justify-between gap-3 border-b border-charcoal/15 py-3 text-[12.5px] text-charcoal-light transition-colors hover:text-forest-800"
                    >
                      <span>{section.title}</span>
                      <span className="text-[9px] tabular-nums text-muted">{String(index + 1).padStart(2, '0')}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="lg:col-span-8 lg:col-start-5">
              <div>
                {sections.map((section, index) => (
                  <Reveal key={section.id}>
                    <section
                      id={section.id}
                      className="scroll-mt-28 border-t border-charcoal/15 py-8 first:border-t-0 first:pt-0 lg:py-10"
                    >
                      <div className="grid gap-4 sm:grid-cols-12 sm:gap-8">
                        <div className="sm:col-span-4">
                          <span className="font-serif text-xl italic text-forest-700/40">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h2 className="mt-2 font-display text-lg font-medium text-charcoal">{section.title}</h2>
                        </div>
                        <p className="text-[14.5px] leading-[1.75] text-charcoal-light sm:col-span-8">{section.body}</p>
                      </div>
                    </section>
                  </Reveal>
                ))}
              </div>

              <div className="mt-8 border border-charcoal/15 bg-paper p-6">
                <p className="text-[11px] leading-relaxed text-muted">
                  This summary is pending review and final approval by EcoHealth &amp; Transport Solutions Ltd before
                  publication. For any question about how your details are handled, please{' '}
                  <Link to="/contact" className="text-forest-700 link-underline">
                    contact the team
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
