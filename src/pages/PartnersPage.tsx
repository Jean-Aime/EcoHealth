import { Download, Plus } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { PageHero, ServiceCTA } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { EnquiryForm } from '@/components/EnquiryForm';
import { partnersContent } from '@/data/content';
import { useSiteSettings } from '@/lib/cms';
import { ArtImage, ArrowLink, SectionMarker } from '@/components/motion';

const heroImage = 'https://images.pexels.com/photos/8487399/pexels-photo-8487399.jpeg?auto=compress&cs=tinysrgb&w=1800';
const partnershipImage = 'https://images.pexels.com/photos/8487361/pexels-photo-8487361.jpeg?auto=compress&cs=tinysrgb&w=1400';

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
        eyebrow="Partners & procurement"
        title="A capable local partner for contractors and procurement teams."
        titleLines={['A capable local', 'partner for contractors', 'and procurement teams.']}
        subtitle={partnersContent.intro}
        image={heroImage}
        imageAlt="Two engineers in helmets and safety vests on site"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Partners & procurement' }]}
        variant="split"
        index="06"
        meta={['Subcontracting', 'Procurement', 'Strategic partnership']}
      />

      {/* Subcontracting */}
      <section className="bg-ivory section-space">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="lg:sticky lg:top-28">
                  <SectionMarker index="01" label="Subcontracting" />
                  <h2 className="mt-6 max-w-sm font-display text-display-md text-charcoal">
                    Specialist scopes, delivered as part of your team.
                  </h2>
                  <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
                    We engage as a subcontractor on prime contractor projects — providing safety, environmental,
                    training, technical field, and transport safety support under your overall programme.
                  </p>
                  <div className="mt-8">
                    <ArtImage
                      src={partnershipImage}
                      alt="Two engineers reviewing a project on site"
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      width={1200}
                      height={900}
                      parallax={20}
                      className="aspect-[4/3]"
                    />
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <ol className="border-t border-charcoal/15">
                {partnersContent.subcontracting.map((item, index) => (
                  <Reveal key={item} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <li className="grid gap-4 border-b border-charcoal/15 py-6 sm:grid-cols-12 sm:gap-5">
                      <span className="font-serif text-2xl italic leading-none text-forest-700/35 sm:col-span-2">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-[14.5px] leading-relaxed text-charcoal-light sm:col-span-10">{item}</p>
                    </li>
                  </Reveal>
                ))}
              </ol>
              <div className="mt-8">
                <ArrowLink to="/projects">See our experience</ArrowLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procurement readiness */}
      <section className="grain-overlay relative overflow-hidden bg-charcoal text-ivory section-space">
        <div className="shell relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <SectionMarker index="02" label="Procurement readiness" tone="light" />
                <h2 className="mt-6 max-w-lg font-display text-display-md text-ivory">
                  Built for tender and procurement processes.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/60">
                  We understand what procurement teams and principals need from a specialist partner — clear scopes,
                  documented capabilities, and reliable delivery. We respond to enquiries with the information that
                  matters for your evaluation.
                </p>
              </Reveal>

              <div className="mt-9 grid border-t border-white/15 sm:grid-cols-2">
                {partnersContent.procurement.map((item, index) => (
                  <Reveal key={item} delay={((index % 2) + 1) as 1 | 2}>
                    <div className="flex gap-3 border-b border-white/15 py-5 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6">
                      <Plus className="mt-0.5 h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                      <p className="text-[13px] leading-relaxed text-ivory/65">{item}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={2}>
                <div className="border border-white/20 p-8 lg:p-10">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-sage-dark">Company profile</p>
                  <h3 className="mt-4 font-display text-2xl font-light text-ivory">
                    {settings.companyProfileUrl ? 'Our company profile' : 'Request our company profile'}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ivory/55">
                    {settings.companyProfileUrl
                      ? 'The approved company profile is available below for procurement teams and contractors.'
                      : 'Our approved company profile document is available to procurement teams and contractors on request, subject to approval.'}
                  </p>

                  {settings.companyProfileUrl ? (
                    <a
                      href={settings.companyProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex items-center gap-3 bg-ivory px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-950 transition-all duration-500 hover:gap-5 hover:bg-white"
                    >
                      <Download className="h-4 w-4" />
                      {settings.companyProfileLabel || 'Download company profile'}
                    </a>
                  ) : (
                    <>
                      <div className="mt-8 border-y border-white/15 py-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/40">
                          Document status
                        </p>
                        <p className="mt-1 text-[13px] text-ivory/60">Shared on request · Subject to approval</p>
                      </div>
                      <div className="mt-6">
                        <ArrowLink to="/contact?enquiry=partnership" tone="light">
                          Request company profile
                        </ArrowLink>
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
      <section id="partnership-enquiry" className="scroll-mt-24 bg-sage-light section-space">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionMarker index="03" label="Partnership enquiry" />
                <h2 className="mt-6 max-w-md font-display text-display-md text-charcoal">
                  Interested in working with EcoHealth?
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal-light">
                  Whether you are a prime contractor looking for a specialist subcontractor, a procurement team
                  evaluating suppliers, or an organisation exploring a strategic partnership — we would like to hear
                  from you.
                </p>
              </Reveal>

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
                    body: 'We welcome partnership enquiries that complement our capabilities in Rwanda; regional opportunities are considered individually against scope and capacity.',
                  },
                ].map((item) => (
                  <Reveal key={item.title}>
                    <div className="border-l border-forest-700/40 pl-5">
                      <h3 className="font-display text-[15px] font-medium text-charcoal">{item.title}</h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={1}>
                <div className="bg-paper p-7 sm:p-10">
                  <div className="flex items-center justify-between border-b border-charcoal/15 pb-4">
                    <h3 className="font-display text-xl font-light text-charcoal">Submit a partnership enquiry</h3>
                    <span className="text-[9px] uppercase tracking-[0.16em] text-muted">Step 01</span>
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-muted">
                    Tell us about the project or tender and the role you need us to play.
                  </p>
                  <div className="mt-8">
                    <EnquiryForm variant="partnership" />
                  </div>
                </div>
              </Reveal>
            </div>
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
