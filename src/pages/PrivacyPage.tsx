import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { SEO } from '@/components/SEO';

const heroImage =
  'https://images.pexels.com/photos/8487773/pexels-photo-8487773.jpeg?auto=compress&cs=tinysrgb&w=1800';

const sections = [
  {
    title: 'What we collect',
    body: 'When you send an enquiry, we collect the details you provide: your name, organisation, business email, telephone number, the service you need, project location, and your description of requirements.',
  },
  {
    title: 'How we use it',
    body: 'We use these details only to respond to your enquiry, discuss a proposed scope of support, and follow up on that conversation. We do not sell your information or use it for unrelated marketing.',
  },
  {
    title: 'Your consent',
    body: 'You confirm consent when you submit an enquiry. You may withdraw consent or ask us to delete your enquiry at any time by contacting us.',
  },
  {
    title: 'Retention and security',
    body: 'Enquiries are kept only as long as needed to handle your request and our record-keeping obligations. Access is restricted to authorised EcoHealth team members.',
  },
];

export function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy | EcoHealth & Transport Solutions Ltd"
        description="How EcoHealth & Transport Solutions Ltd collects and uses the details you provide through enquiries on this website."
        path="/privacy"
      />
      <PageHero
        eyebrow="Privacy Policy"
        title="How we handle your enquiry details."
        subtitle="A summary of how EcoHealth & Transport Solutions Ltd collects, uses, and protects the information you share with us through this website."
        image={heroImage}
        imageAlt="Professional workers reviewing documents on a site"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Privacy Policy' }]}
      />

      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-6 py-24 lg:py-32">
          <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            {sections.map((section, i) => (
              <Reveal key={section.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="grid gap-4 py-10 sm:grid-cols-12 sm:gap-8">
                  <h2 className="font-display text-lg font-semibold text-charcoal sm:col-span-4">
                    {section.title}
                  </h2>
                  <p className="text-base leading-relaxed text-charcoal-light text-pretty sm:col-span-8">
                    {section.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted">
            This summary is pending review and final approval by EcoHealth & Transport Solutions Ltd before publication.
          </p>
        </div>
      </section>
    </>
  );
}
