import { useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Building2, Download } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { CTASection } from '@/components/CTASection';
import { SEO } from '@/components/SEO';
import { SmartImage } from '@/components/SmartImage';
import { ArtImage, ArrowLink, LineReveal, SectionMarker } from '@/components/motion';
import { company, services, servicePaths } from '@/data/content';
import { usePublishedContent, useSiteSettings } from '@/lib/cms';
import { organizationJsonLd } from '@/lib/site';

const heroImage = 'https://images.pexels.com/photos/35861510/pexels-photo-35861510.jpeg?auto=compress&cs=tinysrgb&w=1800';
const introImage = 'https://images.pexels.com/photos/31835038/pexels-photo-31835038.jpeg?auto=compress&cs=tinysrgb&w=1400';
const trainingImage = 'https://images.pexels.com/photos/8761547/pexels-photo-8761547.jpeg?auto=compress&cs=tinysrgb&w=1400';
const capabilityImage = 'https://images.pexels.com/photos/14053428/pexels-photo-14053428.jpeg?auto=compress&cs=tinysrgb&w=1600';
const closingImage = 'https://images.pexels.com/photos/8487361/pexels-photo-8487361.jpeg?auto=compress&cs=tinysrgb&w=1800';

const capabilities = [
  {
    title: 'Integrated service lines',
    body: 'EHS, environmental, training, telecom field, transport, and waste — coordinated through one accountable partner.',
  },
  {
    title: 'Field-oriented delivery',
    body: 'Our work happens on site and in the room, not only in documents. We engage with the real conditions of each project.',
  },
  {
    title: 'Risk-based methodology',
    body: 'We focus attention and resources on the risks that actually matter, rather than spreading effort evenly across everything.',
  },
  {
    title: 'Documentation that holds up',
    body: 'Clear, traceable records that support compliance, tenders, and continuous improvement — built to be useful, not decorative.',
  },
];

const partnershipPoints = [
  { title: 'Subcontracting', body: 'Safety supervision, environmental management, field support, and training delivered as part of your project team.' },
  { title: 'Procurement readiness', body: 'Clear scopes, documented deliverables, and credentials aligned to client requirements.' },
  { title: 'Local presence', body: 'Based in Rwanda; regional engagements are considered individually against scope and capacity.' },
  { title: 'Specialist scopes', body: 'Engaged for specific disciplines or embedded across a programme — scaled to what the project needs.' },
];

export function HomePage() {
  const settings = useSiteSettings();
  const jsonLd = organizationJsonLd({
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    linkedinUrl: settings.linkedinUrl,
  });

  return (
    <>
      <SEO
        title="EcoHealth & Transport Solutions Ltd | EHS, Environmental & Transport Consultancy, Rwanda"
        description="Practical EHS consultancy, environmental management, workforce training, technical field support, and transport safety solutions for businesses and projects in Rwanda."
        path="/"
        jsonLd={jsonLd}
      />

      <Hero />
      <CompanyIntro />
      <ServiceIndex />
      <WhyEcoHealth />
      <CapabilityBand />
      <TrainingPreview />
      <ProcurementSection />
      <InsightsPreview />

      <CTASection
        eyebrow="Get in touch"
        headline="Let's make your next project safer and more sustainable."
        headlineLines={["Let's make your next", 'project safer and', 'more sustainable.']}
        body="Tell us about your operational needs, project requirements, or training objectives. Our team will discuss an appropriate scope of support."
        ctaLabel="Start a conversation"
        ctaTo="/contact"
        variant="forest"
        image={closingImage}
        imageAlt="Two engineers in protective equipment discussing a project inside a building under construction"
        secondaryTo="/services"
        secondaryLabel="Explore our services"
      />
    </>
  );
}

/* —————————————————— 01 · HERO —————————————————— */

function Hero() {
  return (
    <section className="bg-ivory px-4 pt-4 sm:px-6 sm:pt-6 lg:p-0">
      <div className="relative isolate overflow-hidden rounded-[1.5rem] bg-forest-950 text-ivory sm:rounded-[2rem] lg:rounded-none">
        <ArtImage
          src={heroImage}
          alt="Workers in high-visibility clothing beside water infrastructure on an overcast day"
          priority
          parallax={18}
          sizes="100vw"
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full"
          imgClassName="opacity-95"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/60 to-forest-950/0"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-forest-950/25"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[94rem] flex-col px-7 pb-12 pt-36 sm:px-12 sm:pb-14 sm:pt-40 lg:min-h-[78svh] lg:px-20 lg:pb-16 lg:pt-40">
          <div className="max-w-[34rem] lg:max-w-[38rem]">
            <Reveal>
              <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/65">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-dark" aria-hidden="true" />
                Rwanda-based EHS, environmental &amp; transport consultancy
              </p>
            </Reveal>

            <h1 className="mt-6 font-display text-[clamp(2.1rem,3.9vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.036em] text-ivory">
              <LineReveal lines={['Building safer', 'operations.']} />
              <span className="mt-2 block font-serif text-[0.75em] font-normal italic leading-[1.1] tracking-[-0.015em] text-sage-light">
                <LineReveal lines={['Protecting people.', 'Sustaining our future.']} delay={240} />
              </span>
            </h1>

            <Reveal delay={3}>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/70">
                {company.hero.subheading}
              </p>
            </Reveal>

            <Reveal delay={4}>
              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
                <Link to="/contact" className="btn-solid-light">
                  Request a quote
                </Link>
                <Link to="/services" className="group link-arrow text-ivory">
                  <span className="link-underline">Explore our services</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 02 · COMPANY INTRODUCTION —————————————————— */

function CompanyIntro() {
  return (
    <section className="relative bg-ivory py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <Reveal>
              <SectionMarker index="02" label="Who we are" />
              <p className="mt-8 max-w-[15rem] text-sm leading-relaxed text-muted">
                Based in Rwanda, working with organisations that take safety and environmental responsibility seriously.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-9">
            <Reveal>
              <h2 className="max-w-4xl font-display text-display-lg text-charcoal">
                <LineReveal
                  lines={['Where operational safety', 'meets environmental', 'responsibility.']}
                />
              </h2>
            </Reveal>

            <div className="mt-12 grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
              <Reveal className="lg:col-span-5">
                <ArtImage
                  src={introImage}
                  alt="Aerial view of green hills and terraced farmland"
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  width={1200}
                  height={1500}
                  parallax={20}
                  className="aspect-[4/5]"
                />
                <p className="mt-4 flex items-center gap-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                  <span className="h-px w-6 bg-forest-600/50" aria-hidden="true" />
                  Rwanda-based · Regional work scoped individually
                </p>
              </Reveal>

              <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
                <Reveal delay={1}>
                  <div className="space-y-5 text-base leading-relaxed text-charcoal-light sm:text-[1.05rem]">
                    {company.intro.body.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={2}>
                  <div className="mt-9 border-l border-forest-700/30 pl-6">
                    <p className="font-serif text-2xl italic leading-snug text-forest-800">
                      A single, accountable partner across the project lifecycle.
                    </p>
                  </div>
                  <div className="mt-9">
                    <ArrowLink to="/about">Learn about EcoHealth</ArrowLink>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 03 · SERVICE INDEX —————————————————— */

function ServiceIndex() {
  const [active, setActive] = useState(0);

  return (
    <section className="grain-overlay relative overflow-hidden bg-forest-950 py-24 text-ivory lg:py-32">
      <div className="shell relative z-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <Reveal>
              <SectionMarker index="03" label="What we do" tone="light" />
              <h2 className="mt-6 max-w-3xl font-display text-display-lg text-ivory">
                Six disciplines.
                <br />
                <span className="font-serif italic text-sage-light">One standard.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4">
            <Reveal delay={1}>
              <p className="max-w-sm text-sm leading-relaxed text-ivory/55">
                Each service is delivered with the same practical, risk-based approach — adapted to your project, never
                copied from a template.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ul className="border-t border-white/15">
              {services.map((service, index) => {
                const isActive = active === index;
                return (
                  <li key={service.slug}>
                    <Link
                      to={servicePaths[service.slug]}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      className="group block border-b border-white/15 py-6 lg:py-7"
                    >
                      <div className="flex items-start gap-4 sm:gap-6">
                        <span className="mt-1.5 text-[9.5px] font-semibold tabular-nums tracking-[0.18em] text-ivory/35">
                          {service.index}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-4">
                            <h3
                              className={`font-display text-2xl font-light leading-tight transition-colors duration-500 lg:text-[1.9rem] ${
                                isActive ? 'text-ivory' : 'text-ivory/65 group-hover:text-ivory'
                              }`}
                            >
                              {service.shortTitle}
                            </h3>
                            <ArrowUpRight
                              className={`h-5 w-5 shrink-0 transition-all duration-500 ${
                                isActive ? 'translate-x-0 text-sage-light' : '-translate-x-1 text-ivory/25'
                              }`}
                            />
                          </div>
                          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ivory/45">{service.summary}</p>

                          <div className="mt-4 aspect-[16/9] overflow-hidden lg:hidden">
                            <SmartImage
                              src={service.image}
                              alt={service.imageAlt}
                              sizes="(min-width: 640px) 80vw, 100vw"
                              width={900}
                              height={506}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <ArrowLink to="/services" tone="light">
                View all services
              </ArrowLink>
              <span className="text-[9.5px] uppercase tracking-[0.18em] text-ivory/30">Scoped per project</span>
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden bg-forest-900">
                {services.map((service, index) => (
                  <div
                    key={service.slug}
                    aria-hidden="true"
                    className={`absolute inset-0 transition-opacity duration-700 ease-editorial ${
                      active === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <SmartImage
                      src={service.image}
                      alt=""
                      sizes="(min-width: 1024px) 38vw, 100vw"
                      width={900}
                      height={1125}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ivory/55">
                    Service {services[active].index}
                  </p>
                  <p className="mt-2 font-display text-xl font-light text-ivory">{services[active].shortTitle}</p>
                </div>
              </div>
              <p className="mt-4 text-[9.5px] uppercase tracking-[0.18em] text-ivory/30">
                Hover or focus a discipline to preview
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 04 · WHY ECOHEALTH —————————————————— */

function WhyEcoHealth() {
  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <SectionMarker index="04" label="Why EcoHealth" />
                <h2 className="mt-6 font-display text-display-md text-charcoal">
                  An approach built on practical outcomes.
                </h2>
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
                  We do not sell generic systems. We help you build the safety, environmental, and operational practices
                  that fit your project and stand up to scrutiny.
                </p>
                <div className="mt-8">
                  <ArrowLink to="/contact">Discuss your project</ArrowLink>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <div className="border-t border-charcoal/15">
              {company.whyEcoHealth.map((item, index) => (
                <Reveal key={item.title} delay={((index % 3) + 1) as 1 | 2 | 3}>
                  <div className="group grid gap-4 border-b border-charcoal/15 py-7 transition-colors duration-500 sm:grid-cols-12 sm:gap-6 sm:py-9">
                    <div className="sm:col-span-2">
                      <span className="font-serif text-4xl italic leading-none text-forest-700/30 transition-colors duration-500 group-hover:text-forest-700">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-medium leading-snug text-charcoal sm:col-span-4">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted sm:col-span-6">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 05 · CAPABILITY BAND —————————————————— */

function CapabilityBand() {
  return (
    <section className="relative overflow-hidden bg-charcoal text-ivory">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[26rem] lg:min-h-[42rem]">
          <ArtImage
            src={capabilityImage}
            alt="Workers in safety vests operating machinery on a construction site at night"
            sizes="(min-width: 1024px) 50vw, 100vw"
            width={1400}
            height={1600}
            parallax={28}
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 lg:p-10">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ivory/55">In the field</p>
            <p className="mt-2 max-w-sm font-serif text-2xl italic leading-snug text-ivory">
              Field-oriented. Documented. Accountable.
            </p>
          </div>
        </div>

        <div className="px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
          <Reveal>
            <SectionMarker index="05" label="Capabilities & experience" tone="light" />
            <h2 className="mt-6 max-w-lg font-display text-display-md text-ivory">
              Clear service capabilities, scoped to each project.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/60">
              EcoHealth offers EHS, environmental, training, technical field, and transport safety services. Each
              engagement is scoped to the project requirements, available resources, and any applicable authorisations.
            </p>
          </Reveal>

          <ol className="mt-10 border-y border-white/10">
            {capabilities.map((capability, index) => (
              <Reveal key={capability.title} delay={((index % 3) + 1) as 1 | 2 | 3}>
                <li className="flex gap-5 border-b border-white/10 py-5 last:border-b-0">
                  <span className="mt-1 font-display text-[11px] tabular-nums text-ivory/30">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-medium text-ivory">{capability.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ivory/50">{capability.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <div className="mt-8">
            <ArrowLink to="/projects" tone="light">
              Explore our capabilities
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 06 · TRAINING —————————————————— */

function TrainingPreview() {
  return (
    <section className="bg-sage-light py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionMarker index="06" label="Training & capacity building" />
              <h2 className="mt-6 max-w-xl font-display text-display-md text-charcoal">
                Training details you can verify before you register.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-charcoal-light">
                Published courses show their objectives, audience, prerequisites, duration, delivery format, and
                available sessions. No course dates or credentials are displayed until EcoHealth has confirmed them.
              </p>
            </Reveal>

            <Reveal delay={1}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/training" className="btn-primary">
                  <BookOpen className="h-4 w-4" />
                  Browse training
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/training/corporate" className="btn-secondary">
                  <Building2 className="h-4 w-4" />
                  Request corporate training
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={1}>
              <ArtImage
                src={trainingImage}
                alt="Professionals attending a training session in a bright meeting room"
                sizes="(min-width: 1024px) 36vw, 100vw"
                width={1200}
                height={1500}
                parallax={22}
                className="aspect-[4/5]"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 07 · PROCUREMENT —————————————————— */

function ProcurementSection() {
  const settings = useSiteSettings();

  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionMarker index="07" label="Partners & procurement" />
              <h2 className="mt-6 max-w-2xl font-display text-display-md text-charcoal">
                A capable local partner for contractors, principals, and procurement teams.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-charcoal-light">
                We work with prime contractors, institutional clients, and organisations seeking a specialist partner
                for safety, environmental, and field operations in Rwanda — from subcontracted scopes to full programme
                support.
              </p>
            </Reveal>

            <div className="mt-10 grid border-t border-charcoal/15 sm:grid-cols-2">
              {partnershipPoints.map((point, index) => (
                <Reveal key={point.title} delay={((index % 2) + 1) as 1 | 2}>
                  <div className="border-b border-charcoal/15 py-6 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6">
                    <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-forest-800">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{point.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={2}>
              <div className="relative border border-charcoal/20 bg-paper p-8 sm:p-10">
                <span className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-forest-700" aria-hidden="true" />
                <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-forest-700" aria-hidden="true" />
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted">For procurement teams</p>
                <h3 className="mt-4 font-display text-2xl font-light text-charcoal">Company profile & capability statement</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Share your procurement or partnership requirements and we will respond with the relevant
                  capabilities and documentation.
                </p>
                <div className="mt-8">
                  {settings.companyProfileUrl ? (
                    <a
                      href={settings.companyProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full"
                    >
                      <Download className="h-4 w-4" />
                      {settings.companyProfileLabel || 'Download company profile'}
                    </a>
                  ) : (
                    <Link to="/partners" className="btn-primary w-full">
                      Partner with EcoHealth
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                <p className="mt-5 border-t border-charcoal/10 pt-4 text-[11px] leading-relaxed text-muted">
                  {settings.companyProfileUrl
                    ? 'Approved for issue to procurement teams and contractors.'
                    : 'Company profile document available on request, subject to approval.'}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 08 · INSIGHTS —————————————————— */

function InsightsPreview() {
  const { articles } = usePublishedContent();
  const featured = articles[0];
  const rest = articles.slice(1, 4);

  if (!featured) return null;

  return (
    <section className="border-t border-charcoal/10 bg-paper py-24 lg:py-32">
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <div>
              <SectionMarker index="08" label="Resources & insights" />
              <h2 className="mt-6 max-w-xl font-display text-display-md text-charcoal">
                Practical perspectives on safety, environment, and operations.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <ArrowLink to="/insights">All articles</ArrowLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <Link to={`/insights/${featured.slug}`} className="group block">
              <ArtImage
                src={featured.image ?? featuredImage(featured.category)}
                alt={featured.title}
                sizes="(min-width: 1024px) 55vw, 100vw"
                width={1200}
                height={900}
                className="aspect-[4/3]"
              />
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                  <span className="text-forest-700">{featured.category}</span>
                  <span className="h-px w-4 bg-charcoal/20" aria-hidden="true" />
                  <span>{formatDate(featured.date)}</span>
                  <span className="h-px w-4 bg-charcoal/20" aria-hidden="true" />
                  <span>{featured.readTime}</span>
                </div>
                <h3 className="mt-4 max-w-xl font-display text-display-sm text-charcoal transition-colors duration-500 group-hover:text-forest-700">
                  {featured.title}
                </h3>
                <p className="mt-3 max-w-prose text-[13.5px] leading-relaxed text-muted">{featured.excerpt}</p>
              </div>
            </Link>
          </Reveal>

          <div className="lg:col-span-5">
            <div className="border-t border-charcoal/15">
              {rest.map((article, index) => (
                <Reveal key={article.slug} delay={((index % 3) + 1) as 1 | 2 | 3}>
                  <Link
                    to={`/insights/${article.slug}`}
                    className="group block border-b border-charcoal/15 py-6 first:pt-6"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-serif text-2xl italic text-forest-700/35 transition-colors group-hover:text-forest-700">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
                          <span className="text-forest-700">{article.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDate(article.date)}</span>
                        </div>
                        <h3 className="mt-2 font-display text-lg font-medium leading-snug text-charcoal transition-colors duration-500 group-hover:text-forest-700">
                          {article.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{article.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="mt-7">
              <p className="text-[11px] leading-relaxed text-muted">
                Written for the people who manage real projects — not for search engines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function featuredImage(category: string): string {
  const map: Record<string, string> = {
    'Risk Management': 'https://images.pexels.com/photos/9258892/pexels-photo-9258892.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Environmental Management': 'https://images.pexels.com/photos/28463991/pexels-photo-28463991.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Occupational Health & Safety': 'https://images.pexels.com/photos/8487773/pexels-photo-8487773.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Transport Safety': 'https://images.pexels.com/photos/1606957/pexels-photo-1606957.jpeg?auto=compress&cs=tinysrgb&w=1200',
  };
  return map[category] ?? map['Risk Management'];
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
