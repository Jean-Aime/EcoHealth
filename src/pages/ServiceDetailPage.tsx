import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero, ServiceCTA } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { services, servicePaths, type Service } from '@/data/content';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/site';
import { ArtImage, ArrowLink, SectionMarker } from '@/components/motion';

export function ServiceDetailPage({ slug }: { slug: string }) {
  const service = services.find((entry) => entry.slug === slug);

  if (!service) {
    return (
      <>
        <SEO title="Service Not Found | EcoHealth" description="The requested service could not be found." path="/services" noIndex />
        <section className="relative flex min-h-[80svh] items-end overflow-hidden bg-forest-950 pb-16 pt-32 text-ivory">
          <div className="shell relative z-10">
            <p className="font-display text-[9rem] font-light leading-none text-white/10 sm:text-[14rem]">404</p>
            <h1 className="mt-4 font-display text-display-lg text-ivory">This service could not be found.</h1>
            <p className="mt-4 max-w-md text-base text-ivory/60">
              The service you are looking for does not exist. Explore our six consultancy disciplines instead.
            </p>
            <Link to="/services" className="btn-solid-light mt-8">
              All services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </>
    );
  }

  const relatedServices = service.related
    .map((related) => services.find((entry) => entry.slug === related))
    .filter(Boolean) as Service[];

  return (
    <>
      <SEO
        title={`${service.title} | EcoHealth & Transport Solutions Ltd`}
        description={service.summary}
        path={`/services/${service.slug}`}
        image={service.image}
        jsonLd={[
          serviceJsonLd(service),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.shortTitle, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      <PageHero
        eyebrow={`Service ${service.index}`}
        title={service.title}
        subtitle={service.summary}
        image={service.image}
        imageAlt={service.imageAlt}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: service.shortTitle },
        ]}
        index={service.index}
        meta={['Rwanda', 'Project-based', 'Documented delivery']}
      />

      {/* Overview — editorial statement with a service dossier */}
      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-8">
              <Reveal>
                <SectionMarker index="01" label="Overview" />
                <p className="mt-8 max-w-3xl font-display text-2xl font-light leading-[1.35] text-charcoal sm:text-3xl lg:text-[2.35rem]">
                  {service.intro}
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-4">
              <Reveal delay={1}>
                <dl className="border-t border-charcoal/15">
                  {[
                    ['Service', service.shortTitle],
                    ['Index', service.index],
                    ['Coverage', 'Rwanda; regional work subject to scope and capacity'],
                    ['Format', 'Advisory, field support, documented reporting'],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-charcoal/15 py-4">
                      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</dt>
                      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-charcoal-light">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* The challenge */}
      <section className="bg-sage-light py-20 lg:py-28">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="lg:sticky lg:top-28">
                  <SectionMarker index="02" label="The challenge" />
                  <h2 className="mt-6 max-w-xs font-display text-display-md text-charcoal">
                    Problems we help you address.
                  </h2>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-x-10 border-t border-charcoal/15 sm:grid-cols-2">
                {service.problems.map((problem, index) => (
                  <Reveal key={problem} delay={((index % 2) + 1) as 1 | 2}>
                    <div className="flex gap-5 border-b border-charcoal/15 py-7">
                      <span className="font-serif text-3xl italic leading-none text-forest-700/30">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-[14.5px] leading-relaxed text-charcoal-light">{problem}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings — dark ledger */}
      <section className="grain-overlay relative overflow-hidden bg-forest-950 py-20 text-ivory lg:py-28">
        <div className="shell relative z-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <SectionMarker index="03" label="What we deliver" tone="light" />
                <h2 className="mt-6 max-w-xs font-display text-display-md text-ivory">Service offerings.</h2>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/55">
                  Delivered as a focused advisory engagement, embedded project support, or a structured programme.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <ul className="border-t border-white/15">
                {service.offerings.map((offering, index) => (
                  <Reveal key={offering} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <li className="group flex items-baseline gap-5 border-b border-white/15 py-5 transition-colors duration-500 hover:bg-white/[0.03]">
                      <span className="text-[9.5px] font-semibold tabular-nums tracking-[0.16em] text-ivory/30">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[15px] leading-relaxed text-ivory/75 transition-colors group-hover:text-ivory">
                        {offering}
                      </span>
                      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-ivory/20 transition-all duration-500 group-hover:translate-x-1 group-hover:text-ivory/60" />
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & deliverables */}
      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Reveal>
                <SectionMarker index="04" label="Benefits" />
                <h2 className="mt-6 max-w-md font-display text-display-sm text-charcoal">
                  What this means for your operation.
                </h2>
              </Reveal>
              <ul className="mt-8 border-t border-charcoal/15">
                {service.benefits.map((benefit, index) => (
                  <Reveal key={benefit} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <li className="flex items-start gap-4 border-b border-charcoal/15 py-4">
                      <span className="mt-2 h-px w-5 shrink-0 bg-forest-600" aria-hidden="true" />
                      <p className="text-[14.5px] leading-relaxed text-charcoal-light">{benefit}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <Reveal delay={1}>
                <div className="border border-charcoal/20 bg-paper p-8">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted">Deliverables</p>
                  <h2 className="mt-3 font-display text-xl font-light text-charcoal">What you receive.</h2>
                  <ul className="mt-6 space-y-4">
                    {service.deliverables.map((deliverable) => (
                      <li key={deliverable} className="flex items-start gap-3 text-[13.5px] leading-relaxed text-charcoal-light">
                        <span className="mt-[0.55rem] h-1 w-1 shrink-0 bg-forest-600" aria-hidden="true" />
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-5 text-[11px] leading-relaxed text-muted">
                  Deliverables are tailored to each engagement. Outcomes depend on project scope and context — we do not
                  offer unsupported guarantees.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="border-t border-charcoal/10 bg-paper py-16 lg:py-20">
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <Reveal>
              <SectionMarker index="05" label="Related services" />
            </Reveal>
            <ArrowLink to="/services">All six disciplines</ArrowLink>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {relatedServices.map((related) => (
              <Reveal key={related.slug}>
                <Link to={servicePaths[related.slug]} className="group block">
                  <div className="relative">
                    <ArtImage
                      src={related.image}
                      alt={related.imageAlt}
                      sizes="(min-width: 640px) 30vw, 100vw"
                      width={900}
                      height={675}
                      className="aspect-[4/3]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ivory/60">{related.index}</p>
                      <h3 className="mt-1.5 font-display text-lg font-light text-ivory">{related.shortTitle}</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{related.summary}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ServiceCTA ctaTo={`/contact?service=${service.slug}`} />
    </>
  );
}
