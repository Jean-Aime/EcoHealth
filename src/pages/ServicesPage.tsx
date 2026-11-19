import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { CTASection } from '@/components/CTASection';
import { SEO } from '@/components/SEO';
import { services, servicePaths } from '@/data/content';
import { ArtImage, ArrowLink, SectionMarker } from '@/components/motion';

const heroImage =
  'https://images.pexels.com/photos/35861510/pexels-photo-35861510.jpeg?auto=compress&cs=tinysrgb&w=1800';

const deliveryModel = [
  {
    title: 'Scoped to the risk',
    body: 'Every engagement starts with the operational context — the site, the team, the obligations, and the risks that actually matter.',
  },
  {
    title: 'Delivered in the field',
    body: 'Our work happens where the operation happens. Documentation follows observation, not the other way round.',
  },
  {
    title: 'Documented for scrutiny',
    body: 'Clear scopes, traceable records, and reporting that stands up to client, regulator, and tender review.',
  },
];

export function ServicesPage() {
  return (
    <>
      <SEO
        title="Services | EHS, Environmental, Training, Telecom, Transport & Waste | EcoHealth"
        description="Explore EcoHealth's six service lines: EHS consultancy, environmental management, training, telecommunications field support, transport safety, and waste management."
        path="/services"
      />
      <PageHero
        eyebrow="Our services"
        title="Six disciplines. One standard of delivery."
        titleLines={['Six disciplines.', 'One standard', 'of delivery.']}
        subtitle="Each service is delivered with the same practical, risk-based approach — tailored to your project, documented for compliance, and focused on real outcomes."
        image={heroImage}
        imageAlt="Two construction workers in safety equipment beside a waterfront on an overcast day"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services' }]}
        index="02"
        meta={['EHS', 'Environment', 'Training', 'Field support', 'Transport', 'Waste']}
      />

      <section className="bg-ivory section-space">
        <div className="shell">
          <div className="flex flex-col justify-between gap-4 border-t border-charcoal/15 pt-6 sm:flex-row sm:items-center">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted">Service index</p>
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted">
              01 — 06 · Rwanda · regional work scoped individually
            </p>
          </div>

          <div>
            {services.map((service, index) => {
              const reversed = index % 2 === 1;
              return (
                <article
                  key={service.slug}
                  className="grid items-center gap-8 border-b border-charcoal/15 py-12 lg:grid-cols-12 lg:gap-14 lg:py-16"
                >
                  <div className={`relative lg:col-span-6 ${reversed ? 'lg:order-2' : ''}`}>
                    <Link to={servicePaths[service.slug]} className="group block" aria-label={`Explore ${service.title}`}>
                      <ArtImage
                        src={service.image}
                        alt={service.imageAlt}
                        sizes="(min-width: 1024px) 45vw, 100vw"
                        width={1200}
                        height={900}
                        parallax={20}
                        className="aspect-[4/3]"
                      />
                    </Link>
                    <span className="absolute left-0 top-0 z-10 flex h-14 w-14 items-center justify-center bg-forest-800 font-display text-sm font-medium tabular-nums text-ivory">
                      {service.index}
                    </span>
                  </div>

                  <div className={`lg:col-span-6 ${reversed ? 'lg:order-1 lg:pr-10' : 'lg:pl-10'}`}>
                    <Reveal>
                      <SectionMarker label={service.shortTitle} />
                      <h2 className="mt-4 max-w-lg font-display text-display-sm text-charcoal">
                        {service.title}
                      </h2>
                      <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-muted">{service.summary}</p>

                      <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        {service.offerings.slice(0, 4).map((offering) => (
                          <li key={offering} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-charcoal-light">
                            <span className="mt-[0.55rem] h-px w-3 shrink-0 bg-forest-600" aria-hidden="true" />
                            {offering}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-8">
                        <ArrowLink to={servicePaths[service.slug]}>Explore this service</ArrowLink>
                      </div>
                    </Reveal>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grain-overlay relative overflow-hidden bg-forest-950 text-ivory section-space">
        <div className="shell relative z-10">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <SectionMarker index="—" label="The delivery model" tone="light" />
                <h2 className="mt-6 max-w-xs font-display text-display-md text-ivory">
                  One method,
                  <span className="font-serif italic text-sage-light"> applied with judgement.</span>
                </h2>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-px bg-white/10 sm:grid-cols-3">
                {deliveryModel.map((principle, index) => (
                  <Reveal key={principle.title} delay={((index % 3) + 1) as 1 | 2 | 3} className="bg-forest-950 p-6 lg:p-8">
                    <span className="font-serif text-3xl italic text-sage-dark/60">0{index + 1}</span>
                    <h3 className="mt-6 font-display text-lg font-medium text-ivory">{principle.title}</h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-ivory/55">{principle.body}</p>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={2}>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <Link to="/contact" className="group inline-flex items-center gap-3 bg-ivory px-7 py-4 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-forest-950 transition-all duration-500 hover:gap-5 hover:bg-white">
                    Discuss a scope
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <ArrowLink to="/projects" tone="light">
                    See where we apply it
                  </ArrowLink>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        compact
        eyebrow="Get in touch"
        headline="Not sure which service you need?"
        headlineLines={['Not sure which', 'service you need?']}
        body="Tell us about your project and we will help you identify the right scope of support — whether that is one service or several working together."
        ctaLabel="Start a conversation"
        ctaTo="/contact"
        variant="light"
        secondaryTo="/training"
        secondaryLabel="Explore training programmes"
      />
    </>
  );
}
