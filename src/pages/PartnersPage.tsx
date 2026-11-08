import { ArrowRight, Check, Download } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero, ServiceCTA } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { EnquiryForm } from '@/components/EnquiryForm';
import { partnersContent } from '@/data/content';
import { useSiteSettings } from '@/lib/cms';

const heroImage = 'https://images.pexels.com/photos/8487399/pexels-photo-8487399.jpeg?auto=compress&cs=tinysrgb&w=1800';

export function PartnersPage() {
  const settings = useSiteSettings();

  return (
    <>
      <SEO
        title="Partners & Procurement | EcoHealth & Transport Solutions Ltd"
        description="EcoHealth works with contractors, principals, and procurement teams as a specialist partner for safety, environmental, and field operations in Rwanda."
        path="/partners"
      />
      <PageHero
        eyebrow="Partners & Procurement"
        title="A capable local partner for contractors and procurement teams."
        subtitle={partnersContent.intro}
        image={heroImage}
        imageAlt="Two engineers wearing helmets and safety vests, embodying strength and professionalism"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Partners & Procurement' }]}
      />

      {/* Subcontracting capabilities */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow">Subcontracting</p>
              <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                Specialist scopes, delivered as part of your team.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted text-pretty">
                We engage as a subcontractor on prime contractor projects — providing safety, environmental, training,
                technical field, and transport safety support under your overall programme.
              </p>
            </Reveal>
            <div className="lg:col-span-8">
              <Reveal delay={1}>
                <div className="border-t border-charcoal/10">
                  {partnersContent.subcontracting.map((item, i) => (
                    <div key={i} className="flex items-start gap-5 border-b border-charcoal/10 py-6">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest-600" />
                      <p className="text-lg leading-relaxed text-charcoal-light text-pretty">{item}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Procurement readiness */}
      <section className="bg-charcoal text-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="eyebrow text-sage-dark">Procurement readiness</p>
                <h2 className="mt-5 font-display text-display-md text-white text-balance">
                  Built for tender and procurement processes.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-ivory/65 text-pretty">
                  We understand what procurement teams and principals need from a specialist partner — clear scopes,
                  documented capabilities, and reliable delivery. We respond to enquiries with the information that
                  matters for your evaluation.
                </p>
              </Reveal>
              <Reveal delay={1}>
                <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2">
                  {partnersContent.procurement.map((item) => (
                    <div key={item} className="bg-charcoal p-7">
                      <Check className="h-5 w-5 text-forest-400" />
                      <p className="mt-3 text-sm leading-relaxed text-ivory/70 text-pretty">{item}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-5">
              <Reveal delay={2}>
                <div className="border border-white/15 p-10">
                  <p className="text-xs uppercase tracking-widest text-sage-dark">Company profile</p>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-white">
                    {settings.companyProfileUrl ? 'Our company profile' : 'Request our company profile'}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ivory/60 text-pretty">
                    {settings.companyProfileUrl
                      ? 'The approved company profile is available below for procurement teams and contractors.'
                      : 'Our approved company profile document is available to procurement teams and contractors on request, subject to approval.'}
                  </p>

                  {settings.companyProfileUrl ? (
                    <a
                      href={settings.companyProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-medium uppercase tracking-wider text-forest-800 transition-all duration-500 ease-elegant hover:gap-3"
                    >
                      <Download className="h-4 w-4" />
                      {settings.companyProfileLabel || 'Download company profile'}
                    </a>
                  ) : (
                    <>
                      <div className="mt-8 border border-dashed border-white/20 p-6 text-center">
                        <p className="text-sm text-ivory/50">
                          Company profile PDF
                          <br />
                          <span className="text-xs text-ivory/30">Shared on request</span>
                        </p>
                      </div>
                      <div className="mt-6">
                        <Link
                          to="/contact?enquiry=partnership"
                          className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-white"
                        >
                          <span className="link-underline">Request company profile</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership enquiry */}
      <section id="partnership-enquiry" className="bg-sage-light scroll-mt-24">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow">Partnership enquiry</p>
              <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                Interested in working with EcoHealth?
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-charcoal-light text-pretty">
                Whether you are a prime contractor looking for a specialist subcontractor, a procurement team evaluating
                suppliers, or an organisation exploring a strategic partnership — we would like to hear from you.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    title: 'For prime contractors',
                    body: 'We provide subcontracted safety, environmental, field, and training scopes — integrated into your project team and reporting structure.',
                  },
                  {
                    title: 'For procurement teams',
                    body: 'We respond to tender and procurement enquiries with clear scopes, documented capabilities, and the information needed for evaluation.',
                  },
                  {
                    title: 'For strategic partners',
                    body: 'We are open to partnerships that extend our reach or complement our capabilities — in Rwanda and the wider region.',
                  },
                ].map((item) => (
                  <div key={item.title} className="border-l-2 border-forest-600 pl-6">
                    <h3 className="font-display text-lg font-semibold text-charcoal">{item.title}</h3>
                    <p className="mt-2 text-base leading-relaxed text-muted text-pretty">{item.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={1} className="lg:col-span-7">
              <div className="bg-white p-8 shadow-[0_1px_0_rgba(37,43,41,0.06)] sm:p-10">
                <h3 className="font-display text-xl font-semibold text-charcoal">Submit a partnership enquiry</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Tell us about the project or tender and the role you need us to play.
                </p>
                <div className="mt-8">
                  <EnquiryForm variant="partnership" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ServiceCTA
        title="Let's discuss how we can work together."
        body="Share your partnership or procurement requirements and our team will respond with relevant capabilities."
        ctaTo="/contact?enquiry=partnership"
      />
    </>
  );
}
