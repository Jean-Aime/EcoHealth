import { ArrowRight, ArrowDown, Download } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { CTASection } from '@/components/CTASection';
import { SEO } from '@/components/SEO';
import { SmartImage } from '@/components/SmartImage';
import { company, services, servicePaths } from '@/data/content';
import { usePublishedContent, useSiteSettings } from '@/lib/cms';
import { organizationJsonLd } from '@/lib/site';

const heroImage =
  'https://images.pexels.com/photos/8487361/pexels-photo-8487361.jpeg?auto=compress&cs=tinysrgb&w=1800';
const introImage =
  'https://images.pexels.com/photos/31835038/pexels-photo-31835038.jpeg?auto=compress&cs=tinysrgb&w=1400';
const trainingImage =
  'https://images.pexels.com/photos/8761547/pexels-photo-8761547.jpeg?auto=compress&cs=tinysrgb&w=1400';

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

      {/* ——— A: HERO ——— */}
      <Hero />

      {/* ——— B: COMPANY INTRODUCTION ——— */}
      <CompanyIntro />

      {/* ——— C: SERVICE OVERVIEW ——— */}
      <ServiceOverview />

      {/* ——— D: WHY ECOHEALTH ——— */}
      <WhyEcoHealth />

      {/* ——— E: CAPABILITIES & EXPERIENCE ——— */}
      <Capabilities />

      {/* ——— F: TRAINING PREVIEW ——— */}
      <TrainingPreview />

      {/* ——— G: PROCUREMENT & PARTNERSHIPS ——— */}
      <ProcurementSection />

      {/* ——— H: RESOURCES & INSIGHTS ——— */}
      <InsightsPreview />

      {/* ——— I: FINAL CTA ——— */}
      <CTASection
        eyebrow="Get in touch"
        headline="Let's Make Your Next Project Safer and More Sustainable."
        body="Tell us about your operational needs, project requirements, or training objectives. Our team will discuss an appropriate scope of support."
        ctaLabel="Start a Conversation"
        ctaTo="/contact"
        variant="forest"
      />
    </>
  );
}

/* —————————————————— HERO —————————————————— */
function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-forest-800">
      {/* Background image — right-weighted */}
      <div className="absolute inset-0">
        <SmartImage
          src={heroImage}
          alt="Two engineers in protective gear and hardhats discussing a project inside a building under construction"
          priority
          sizes="100vw"
          width={1920}
          height={1080}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-800 via-forest-800/85 to-forest-800/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-800/60 via-transparent to-forest-800/20" />
      </div>

      {/* Content — asymmetric, left-weighted */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-8xl flex-col justify-center px-6 pt-28 pb-20 lg:px-10">
        <div className="max-w-2xl">
          <div className="reveal is-visible flex items-center gap-3">
            <span className="h-px w-12 bg-emerald-accent" />
            <p className="text-xs font-medium uppercase tracking-widest text-sage-light">
              {company.hero.eyebrow}
            </p>
          </div>

          <h1 className="mt-8 font-display text-display-xl text-white text-balance">
            {company.hero.headline}
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ivory/75 text-pretty">
            {company.hero.subheading}
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link to="/contact" className="btn-primary">
              {company.hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services" className="btn-ghost-light">
              {company.hero.secondaryCta}
            </Link>
          </div>

          <p className="mt-12 font-serif text-lg italic text-sage-light">
            {company.tagline}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 lg:block">
        <div className="flex flex-col items-center gap-2 text-ivory/40">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

/* —————————————————— COMPANY INTRO —————————————————— */
function CompanyIntro() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          {/* Left: image */}
          <Reveal className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden">
              <SmartImage
                src={introImage}
                alt="Aerial landscape of vibrant green hills and terraced fields in Rwanda's countryside"
                sizes="(min-width: 1024px) 45vw, 100vw"
                width={1200}
                height={1500}
                className="image-cover"
              />
            </div>
            <div className="mt-6 flex items-start gap-4 border-l-2 border-forest-600 pl-5">
              <p className="text-sm italic leading-relaxed text-muted">
                Based in Rwanda, working with organisations that take safety and environmental responsibility seriously.
              </p>
            </div>
          </Reveal>

          {/* Right: text */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <Reveal>
              <p className="eyebrow">Who we are</p>
              <h2 className="mt-5 font-display text-display-lg text-charcoal text-balance">
                {company.intro.headline}
              </h2>
            </Reveal>
            <Reveal delay={1}>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-charcoal-light text-pretty">
                {company.intro.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div className="mt-10">
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-forest-700"
                >
                  <span className="link-underline">Learn about EcoHealth</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— SERVICE OVERVIEW —————————————————— */
function ServiceOverview() {
  return (
    <section className="bg-sage-light">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
        {/* Section header */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8">
            <p className="eyebrow">What we do</p>
            <h2 className="mt-5 font-display text-display-lg text-charcoal text-balance">
              Six service lines, one standard of operational discipline.
            </h2>
          </Reveal>
          <Reveal delay={1} className="lg:col-span-4">
            <p className="text-base leading-relaxed text-muted text-pretty">
              From EHS compliance to waste management, each service is delivered with the same practical, risk-based approach — adapted to your project, not copied from a template.
            </p>
          </Reveal>
        </div>

        {/* Editorial service grid */}
        <div className="mt-16 grid gap-px bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal
              key={service.slug}
              delay={((i % 3) + 1) as 1 | 2 | 3}
              className="group relative bg-sage-light"
            >
              <Link
                to={servicePaths[service.slug]}
                className="flex h-full flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[3/2] overflow-hidden">
                  <SmartImage
                    src={service.image}
                    alt={service.imageAlt}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    width={900}
                    height={600}
                    className="image-cover transition-transform duration-700 ease-elegant group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-forest-800/10 transition-opacity duration-500 group-hover:bg-forest-800/25" />
                  <span className="absolute left-5 top-5 font-display text-sm font-bold text-white">
                    {service.index}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-xl font-semibold text-charcoal">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted text-pretty">
                    {service.summary}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-forest-700">
                    <span className="link-underline">Learn more</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={2}>
          <div className="mt-14 flex justify-center">
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-forest-700"
            >
              <span className="link-underline">View all services</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* —————————————————— WHY ECOHEALTH —————————————————— */
function WhyEcoHealth() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          {/* Sticky heading */}
          <div className="lg:col-span-4">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow">Why EcoHealth</p>
                <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                  An approach built on practical outcomes.
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted text-pretty">
                  We do not sell generic systems. We help you build the safety, environmental, and operational practices that fit your project and stand up to scrutiny.
                </p>
                <div className="mt-8">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-forest-700"
                  >
                    <span className="link-underline">Discuss your project</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Value list */}
          <div className="lg:col-span-8">
            <div className="border-t border-charcoal/10">
              {company.whyEcoHealth.map((item, i) => (
                <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                  <div className="group grid gap-4 border-b border-charcoal/10 py-8 transition-colors duration-500 hover:bg-sage-light/50 sm:grid-cols-12 sm:gap-8 sm:py-10">
                    <div className="sm:col-span-1">
                      <span className="font-display text-sm font-bold text-forest-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="sm:col-span-4">
                      <h3 className="font-display text-lg font-semibold text-charcoal">
                        {item.title}
                      </h3>
                    </div>
                    <div className="sm:col-span-7">
                      <p className="text-base leading-relaxed text-muted text-pretty">
                        {item.body}
                      </p>
                    </div>
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

/* —————————————————— CAPABILITIES & EXPERIENCE —————————————————— */
function Capabilities() {
  return (
    <section className="relative overflow-hidden bg-charcoal text-ivory">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-sage-dark">Capabilities &amp; experience</p>
            <h2 className="mt-5 font-display text-display-md text-white text-balance">
              A foundation of practical, field-tested capability.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ivory/65 text-pretty">
              EcoHealth brings together EHS, environmental, training, technical field, and transport safety disciplines — giving clients a single, capable partner across the project lifecycle.
            </p>
            <div className="mt-10">
              <Link
                to="/projects"
                className="group inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition-all duration-500 ease-elegant hover:border-white hover:bg-white hover:text-charcoal hover:gap-3"
              >
                Explore our experience
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          {/* Capability columns */}
          <div className="lg:col-span-7">
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {capabilities.map((cap, i) => (
                <Reveal
                  key={i}
                  delay={((i % 2) + 1) as 1 | 2}
                  className="bg-charcoal p-8"
                >
                  <span className="font-display text-3xl font-bold text-forest-400">
                    {cap.number}
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-white">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/55 text-pretty">
                    {cap.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const capabilities = [
  { number: '06', title: 'Integrated service lines', body: 'EHS, environmental, training, telecom field, transport, and waste — coordinated through one accountable partner.' },
  { number: '01', title: 'Field-oriented delivery', body: 'Our work happens on site and in the room — not only in documents. We engage with the real conditions of each project.' },
  { number: '02', title: 'Risk-based methodology', body: 'We focus attention and resources on the risks that actually matter, rather than spreading effort evenly across everything.' },
  { number: '03', title: 'Documentation that holds up', body: 'Clear, traceable records that support compliance, tenders, and continuous improvement — built to be useful, not decorative.' },
];

/* —————————————————— TRAINING PREVIEW —————————————————— */
function TrainingPreview() {
  return (
    <section className="bg-sage">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-20">
          {/* Image */}
          <Reveal className="lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden">
              <SmartImage
                src={trainingImage}
                alt="Diverse group of business professionals attentively attending a conference session"
                sizes="(min-width: 1024px) 45vw, 100vw"
                width={1200}
                height={900}
                className="image-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
            </div>
          </Reveal>

          {/* Text */}
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow">Training &amp; capacity building</p>
              <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                Building real capability in your workforce.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-charcoal-light text-pretty">
                From workplace safety and PPE awareness to defensive driving, fatigue management, and environmental training — our programmes are tailored to the roles and risks your teams face.
              </p>
            </Reveal>

            <Reveal delay={1}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {['Workplace safety & PPE', 'Working-at-height awareness', 'Defensive driving', 'Fatigue management', 'Risk assessment & reporting', 'Environmental training'].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-charcoal-light"
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0 bg-forest-600" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>

            <Reveal delay={2}>
              <div className="mt-10">
                <Link to="/training" className="btn-primary">
                  Explore training programmes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— PROCUREMENT & PARTNERSHIPS —————————————————— */
function ProcurementSection() {
  const settings = useSiteSettings();

  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">Partners &amp; procurement</p>
              <h2 className="mt-5 font-display text-display-lg text-charcoal text-balance">
                A capable local partner for contractors, principals, and procurement teams.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-charcoal-light text-pretty">
                We work with prime contractors, institutional clients, and organisations seeking a specialist partner for safety, environmental, and field operations in Rwanda — from subcontracted scopes to full programme support.
              </p>
            </Reveal>

            <Reveal delay={1}>
              <div className="mt-10 grid gap-px bg-charcoal/10 sm:grid-cols-2">
                {partnershipPoints.map((point) => (
                  <div key={point.title} className="bg-ivory p-6">
                    <h3 className="font-display text-sm font-semibold text-forest-700">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                      {point.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: CTA card */}
          <div className="lg:col-span-5">
            <Reveal delay={2}>
              <div className="bg-forest-800 p-10 text-ivory">
                <p className="text-xs uppercase tracking-widest text-sage-dark">
                  For procurement teams
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold text-white">
                  Request our company profile
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ivory/65 text-pretty">
                  Share your procurement or partnership requirements and we will respond with the relevant capabilities and documentation.
                </p>
                <div className="mt-8">
                  {settings.companyProfileUrl ? (
                    <a
                      href={settings.companyProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition-all duration-500 ease-elegant hover:border-white hover:bg-white hover:text-forest-800 hover:gap-3"
                    >
                      <Download className="h-4 w-4" />
                      {settings.companyProfileLabel || 'Download company profile'}
                    </a>
                  ) : (
                    <Link
                      to="/partners"
                      className="group inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition-all duration-500 ease-elegant hover:border-white hover:bg-white hover:text-forest-800 hover:gap-3"
                    >
                      Partner with EcoHealth
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                <p className="mt-6 text-xs text-ivory/40">
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

const partnershipPoints = [
  { title: 'Subcontracting', body: 'Safety supervision, environmental management, field support, and training delivered as part of your project team.' },
  { title: 'Procurement readiness', body: 'Clear scopes, documented deliverables, and safety and environmental credentials aligned to client requirements.' },
  { title: 'Local presence', body: 'Based in Rwanda with response capacity for local projects and regional engagements.' },
  { title: 'Specialist scopes', body: 'Engaged for specific disciplines or embedded across a programme — scaled to what the project needs.' },
];

/* —————————————————— INSIGHTS PREVIEW —————————————————— */
function InsightsPreview() {
  const { articles } = usePublishedContent();
  const featured = articles[0];
  const rest = articles.slice(1, 3);

  if (!featured) return null;

  return (
    <section className="bg-ivory-50 border-t border-charcoal/10">
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <div>
              <p className="eyebrow">Resources &amp; insights</p>
              <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                Practical perspectives on safety, environment, and operations.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <Link
              to="/insights"
              className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-forest-700"
            >
              <span className="link-underline">All articles</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Featured */}
          <Reveal className="lg:col-span-7">
            <Link to={`/insights/${featured.slug}`} className="group block">
              <div className="relative aspect-[16/9] overflow-hidden bg-sage">
                <SmartImage
                  src={featured.image ?? featuredImage(featured.category)}
                  alt={featured.title}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  width={1200}
                  height={675}
                  className="image-cover transition-transform duration-700 ease-elegant group-hover:scale-105"
                />
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
                  <span className="text-forest-700">{featured.category}</span>
                  <span className="h-1 w-1 bg-muted/40" />
                  <span>{formatDate(featured.date)}</span>
                  <span className="h-1 w-1 bg-muted/40" />
                  <span>{featured.readTime}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-charcoal transition-colors group-hover:text-forest-700 lg:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-3 max-w-prose text-base leading-relaxed text-muted text-pretty">
                  {featured.excerpt}
                </p>
              </div>
            </Link>
          </Reveal>

          {/* Side list */}
          <div className="lg:col-span-5">
            <div className="border-t border-charcoal/10">
              {rest.map((article) => (
                <Reveal key={article.slug} delay={1}>
                  <Link
                    to={`/insights/${article.slug}`}
                    className="group block border-b border-charcoal/10 py-7"
                  >
                    <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
                      <span className="text-forest-700">{article.category}</span>
                      <span className="h-1 w-1 bg-muted/40" />
                      <span>{formatDate(article.date)}</span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold text-charcoal transition-colors group-hover:text-forest-700">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                      {article.excerpt}
                    </p>
                  </Link>
                </Reveal>
              ))}
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
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
