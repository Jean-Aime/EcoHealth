import { useEffect, useState } from 'react';
import { Clock, Mail, MapPin, Phone, Linkedin, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { EnquiryForm, type EnquiryVariant } from '@/components/EnquiryForm';
import { SEO } from '@/components/SEO';
import { Link, useRouter } from '@/lib/router';
import { useSiteSettings } from '@/lib/cms';
import { services } from '@/data/content';
import { organizationJsonLd } from '@/lib/site';
import { SectionMarker } from '@/components/motion';

const heroImage = 'https://images.pexels.com/photos/10363550/pexels-photo-10363550.jpeg?auto=compress&cs=tinysrgb&w=1800';

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
        eyebrow="Contact & request a quote"
        title="Tell us about your project."
        titleLines={['Tell us about', 'your project.']}
        subtitle="Share your operational needs, project requirements, or training objectives. Our team will discuss an appropriate scope of support."
        image={heroImage}
        imageAlt="Two workers in safety equipment discussing work in the field"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Contact' }]}
        index="07"
        meta={['Quote', 'Training', 'Partnership']}
      />

      <section className="bg-ivory py-16 lg:py-24">
        <div className="shell">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-7">
              <Reveal>
                <div className="bg-paper p-7 sm:p-10">
                  <div
                    role="tablist"
                    aria-label="Enquiry type"
                    className="flex flex-wrap gap-x-6 gap-y-2 border-b border-charcoal/15"
                  >
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
                          className={`-mb-px border-b-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
                            active
                              ? 'border-forest-700 text-forest-800'
                              : 'border-transparent text-muted hover:text-charcoal'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div role="tabpanel" id="enquiry-panel" aria-labelledby={`tab-${variant}`} className="mt-9">
                    {variant === 'quote' && (
                      <EnquiryForm variant="quote" initialService={serviceTitle ?? undefined} />
                    )}
                    {variant === 'training' && <EnquiryForm variant="training" initialService={course ?? undefined} />}
                    {variant === 'partnership' && <EnquiryForm variant="partnership" />}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Information rail */}
            <div className="lg:col-span-5">
              <Reveal delay={1}>
                <div className="bg-forest-950 p-8 text-ivory sm:p-10">
                  <SectionMarker index="—" label="How it works" tone="light" />
                  <ol className="mt-8 border-t border-white/15">
                    {[
                      'Describe your project, risks, or training needs.',
                      'Our team reviews your requirements and the scope involved.',
                      'We respond with a proposed approach and next steps.',
                    ].map((step, index) => (
                      <li key={step} className="flex gap-5 border-b border-white/15 py-5">
                        <span className="font-serif text-2xl italic leading-none text-sage-dark/60">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="text-[13.5px] leading-relaxed text-ivory/65">{step}</p>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-8 space-y-5">
                    {settings.email && (
                      <div className="flex gap-3.5">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" />
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/40">Email</p>
                          <a href={`mailto:${settings.email}`} className="mt-1 block break-all text-[13px] text-ivory/75 link-underline hover:text-ivory">
                            {settings.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {settings.phone && (
                      <div className="flex gap-3.5">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" />
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/40">Telephone</p>
                          <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="mt-1 block text-[13px] text-ivory/75 link-underline hover:text-ivory">
                            {settings.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" />
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/40">
                          {settings.address ? 'Office' : 'Based in Rwanda'}
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-ivory/70">
                          {settings.address || 'Based in Rwanda; regional enquiries are considered individually against scope and capacity.'}
                        </p>
                      </div>
                    </div>

                    {settings.linkedinUrl && (
                      <div className="flex gap-3.5">
                        <Linkedin className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" />
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/40">LinkedIn</p>
                          <a
                            href={settings.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-[13px] text-ivory/75 link-underline hover:text-ivory"
                          >
                            Company profile
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3.5">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" />
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/40">Response</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-ivory/70">
                          Enquiries are reviewed by our team and answered using your preferred contact method.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-start gap-3 border-t border-white/15 pt-6">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" />
                    <p className="text-[11px] leading-relaxed text-ivory/45">
                      Your details are used only to respond to this enquiry. Read our{' '}
                      <Link to="/privacy" className="text-sage-light link-underline">
                        privacy policy
                      </Link>
                      .
                    </p>
                  </div>

                  {!hasContact && (
                    <p className="mt-6 text-[11px] leading-relaxed text-ivory/35">
                      Our team responds to every enquiry submitted here — please use the form and we will reply directly.
                    </p>
                  )}
                </div>
              </Reveal>

              <Reveal delay={2}>
                <div className="mt-6 border border-charcoal/15 p-6">
                  <p className="text-[13px] leading-relaxed text-muted">
                    Looking for a training programme?{' '}
                    <Link to="/training" className="text-forest-700 link-underline">
                      View our training catalogue
                    </Link>
                    .
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
