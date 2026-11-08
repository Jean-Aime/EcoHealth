import { useEffect, useState } from 'react';
import { Clock, Mail, MapPin, Phone, Linkedin } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { EnquiryForm, type EnquiryVariant } from '@/components/EnquiryForm';
import { SEO } from '@/components/SEO';
import { Link, useRouter } from '@/lib/router';
import { useSiteSettings } from '@/lib/cms';
import { services } from '@/data/content';
import { organizationJsonLd } from '@/lib/site';

const heroImage =
  'https://images.pexels.com/photos/10363550/pexels-photo-10363550.jpeg?auto=compress&cs=tinysrgb&w=1800';

const TABS: { id: EnquiryVariant; label: string }[] = [
  { id: 'quote', label: 'Request a quote' },
  { id: 'training', label: 'Training enquiry' },
  { id: 'partnership', label: 'Partnership' },
];

function parseVariant(value: string | null): EnquiryVariant {
  return value === 'training' || value === 'partnership' ? value : 'quote';
}

export function ContactPage() {
  const { query } = useRouter();
  const settings = useSiteSettings();
  const [variant, setVariant] = useState<EnquiryVariant>(parseVariant(query.get('enquiry')));

  const requestedVariant = parseVariant(query.get('enquiry'));
  const serviceSlug = query.get('service');
  const course = query.get('course');
  const serviceTitle = services.find((service) => service.slug === serviceSlug)?.title;

  useEffect(() => {
    setVariant(requestedVariant);
  }, [requestedVariant]);

  const hasContact = Boolean(settings.phone || settings.email || settings.address || settings.linkedinUrl);

  const jsonLd = organizationJsonLd({
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    linkedinUrl: settings.linkedinUrl,
  });

  return (
    <>
      <SEO
        title="Request a Quote | EcoHealth & Transport Solutions Ltd"
        description="Request a quote for EHS consultancy, environmental management, training, telecommunications field support, transport safety, or waste management in Rwanda."
        path="/contact"
        jsonLd={jsonLd}
      />
      <PageHero
        eyebrow="Contact & Request a Quote"
        title="Tell us about your project."
        subtitle="Share your operational needs, project requirements, or training objectives. Our team will discuss an appropriate scope of support."
        image={heroImage}
        imageAlt="Two workers in safety gear discussing work in the field"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Contact' }]}
      />

      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <p className="eyebrow">How it works</p>
                <ol className="mt-8 space-y-8">
                  {[
                    'Describe your project, risks, or training needs.',
                    'Our team reviews your requirements and the scope involved.',
                    'We respond with a proposed approach and next steps.',
                  ].map((step, i) => (
                    <li key={step} className="flex gap-5">
                      <span className="font-display text-sm font-bold text-forest-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-base leading-relaxed text-charcoal-light text-pretty">{step}</p>
                    </li>
                  ))}
                </ol>

                <div className="mt-12 space-y-6 border-t border-charcoal/10 pt-10">
                  {settings.email && (
                    <div className="flex gap-4">
                      <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest-600" />
                      <div>
                        <p className="text-sm font-medium text-charcoal">Email</p>
                        <a
                          href={`mailto:${settings.email}`}
                          className="mt-1 block break-all text-sm leading-relaxed text-muted link-underline hover:text-forest-700"
                        >
                          {settings.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {settings.phone && (
                    <div className="flex gap-4">
                      <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest-600" />
                      <div>
                        <p className="text-sm font-medium text-charcoal">Telephone</p>
                        <a
                          href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                          className="mt-1 block text-sm leading-relaxed text-muted link-underline hover:text-forest-700"
                        >
                          {settings.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest-600" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        {settings.address ? 'Office' : 'Based in Rwanda'}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {settings.address || 'Serving projects in Rwanda, with potential regional engagement.'}
                      </p>
                    </div>
                  </div>

                  {settings.linkedinUrl && (
                    <div className="flex gap-4">
                      <Linkedin className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest-600" />
                      <div>
                        <p className="text-sm font-medium text-charcoal">LinkedIn</p>
                        <a
                          href={settings.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block break-all text-sm leading-relaxed text-muted link-underline hover:text-forest-700"
                        >
                          Company profile
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest-600" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">Response</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        Enquiries are reviewed by our team and answered using your preferred contact method.
                      </p>
                    </div>
                  </div>
                </div>

                {!hasContact && (
                  <p className="mt-10 text-xs leading-relaxed text-muted">
                    Our team responds to every enquiry submitted here — please use the form and we will reply directly.
                  </p>
                )}

                <p className="mt-10 text-sm text-muted">
                  Looking for a training programme?{' '}
                  <Link to="/training" className="text-forest-700 link-underline">
                    View our training catalogue
                  </Link>
                  .
                </p>
              </div>
            </Reveal>

            <Reveal delay={1} className="lg:col-span-8">
              <div className="bg-white p-8 shadow-[0_1px_0_rgba(37,43,41,0.06)] sm:p-12">
                <div role="tablist" aria-label="Enquiry type" className="flex flex-wrap gap-2 border-b border-charcoal/10">
                  {TABS.map((tab) => {
                    const active = variant === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        role="tab"
                        type="button"
                        aria-selected={active}
                        aria-controls="enquiry-panel"
                        tabIndex={active ? 0 : -1}
                        onClick={() => setVariant(tab.id)}
                        onKeyDown={(event) => {
                          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                          event.preventDefault();
                          const index = TABS.findIndex((entry) => entry.id === tab.id);
                          const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
                          setVariant(next.id);
                          document.getElementById(`tab-${next.id}`)?.focus();
                        }}
                        className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                          active
                            ? 'border-forest-600 text-forest-800'
                            : 'border-transparent text-muted hover:text-charcoal'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div
                  role="tabpanel"
                  id="enquiry-panel"
                  aria-labelledby={`tab-${variant}`}
                  className="mt-10"
                >
                  {variant === 'quote' && (
                    <EnquiryForm variant="quote" initialService={serviceTitle ?? undefined} />
                  )}
                  {variant === 'training' && <EnquiryForm variant="training" initialService={course ?? undefined} />}
                  {variant === 'partnership' && <EnquiryForm variant="partnership" />}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
