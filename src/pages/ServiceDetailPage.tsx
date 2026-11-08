import { ArrowRight, Check } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero, ServiceCTA } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { services, servicePaths, type Service } from '@/data/content';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/site';

export function ServiceDetailPage({ slug }: { slug: string }) {
  const service = services.find((s) => s.slug === slug);

  if (!service) {
  return (
      <>
        <SEO title="Service Not Found | EcoHealth" description="The requested service could not be found." path="/services" />
        <section className="flex min-h-screen items-center justify-center bg-ivory px-6">
          <div className="text-center">
            <p className="eyebrow">404</p>
            <h1 className="mt-4 font-display text-display-md text-charcoal">Service not found</h1>
            <p className="mt-4 text-muted">The service you are looking for does not exist.</p>
            <Link to="/services" className="btn-primary mt-8">
              <ArrowRight className="h-4 w-4" />
              All Services
            </Link>
          </div>
        </section>
      </>
    );
  }

  const relatedServices = service.related
    .map((r) => services.find((s) => s.slug === r))
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
      />

      {/* Introduction */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow">Overview</p>
            </Reveal>
            <div className="lg:col-span-8">
              <Reveal delay={1}>
                <p className="font-display text-2xl font-medium leading-snug text-charcoal text-balance lg:text-3xl">
                  {service.intro}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Problems addressed */}
      <section className="bg-sage-light">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow">The challenge</p>
              <h2 className="mt-5 font-display text-display-sm text-charcoal text-balance">
                Problems we help you address.
              </h2>
            </Reveal>
            <div className="lg:col-span-8">
              <div className="border-t border-charcoal/10">
                {service.problems.map((problem, i) => (
                  <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                    <div className="flex items-start gap-5 border-b border-charcoal/10 py-6">
                      <span className="mt-1 font-display text-sm font-bold text-forest-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-lg leading-relaxed text-charcoal-light text-pretty">
                        {problem}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow">What we deliver</p>
              <h2 className="mt-5 font-display text-display-sm text-charcoal text-balance">
                Service offerings.
              </h2>
            </Reveal>
            <div className="lg:col-span-8">
              <Reveal delay={1}>
                <div className="grid gap-px bg-charcoal/10 sm:grid-cols-2">
                  {service.offerings.map((offering) => (
                    <div key={offering} className="flex items-start gap-4 bg-ivory p-7">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest-600" />
                      <p className="text-base leading-relaxed text-charcoal-light text-pretty">
                        {offering}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & Deliverables — split */}
      <section className="bg-sage-light">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="eyebrow">Benefits</p>
              <h2 className="mt-5 font-display text-display-sm text-charcoal text-balance">
                What this means for your operation.
              </h2>
              <ul className="mt-8 space-y-4">
                {service.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-4 border-l-2 border-forest-600 pl-5">
                    <p className="text-base leading-relaxed text-charcoal-light text-pretty">{benefit}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={1}>
              <p className="eyebrow">Deliverables</p>
              <h2 className="mt-5 font-display text-display-sm text-charcoal text-balance">
                What you receive.
              </h2>
              <ul className="mt-8 space-y-4">
                {service.deliverables.map((deliverable) => (
                  <li key={deliverable} className="flex items-start gap-4 border-l-2 border-charcoal/20 pl-5">
                    <p className="text-base leading-relaxed text-charcoal-light text-pretty">{deliverable}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <p className="mt-10 text-xs italic text-muted">
            Deliverables are tailored to each engagement. Outcomes depend on project scope and context — we do not offer unsupported guarantees.
          </p>
        </div>
      </section>

      {/* Related services */}
      <section className="bg-ivory border-t border-charcoal/10">
        <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="eyebrow">Related services</p>
          <div className="mt-8 grid gap-px bg-charcoal/10 sm:grid-cols-3">
            {relatedServices.map((rel, i) => (
              <Reveal key={rel.slug} delay={((i % 3) + 1) as 1 | 2 | 3} className="bg-ivory">
                <Link
                  to={servicePaths[rel.slug]}
                  className="group flex h-full flex-col p-7"
                >
                  <span className="font-display text-sm font-bold text-forest-600">
                    {rel.index}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-charcoal">
                    {rel.shortTitle}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted text-pretty">
                    {rel.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-forest-700">
                    <span className="link-underline">View service</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
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
