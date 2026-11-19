import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileCheck2,
  GraduationCap,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';
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
    image: capabilityImage,
    imageAlt: 'Workers in safety vests operating machinery on a construction site at night',
  },
  {
    title: 'Field-oriented delivery',
    body: 'Our work happens on site and in the room, not only in documents. We engage with the real conditions of each project.',
    image: services[3].image,
    imageAlt: services[3].imageAlt,
  },
  {
    title: 'Risk-based methodology',
    body: 'We focus attention and resources on the risks that actually matter, rather than spreading effort evenly across everything.',
    image: services[0].image,
    imageAlt: services[0].imageAlt,
  },
  {
    title: 'Documentation that holds up',
    body: 'Clear, traceable records that support compliance, tenders, and continuous improvement — built to be useful, not decorative.',
    image: services[2].image,
    imageAlt: services[2].imageAlt,
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
      <ServiceIndex />
      <CompanyIntro />
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
        compact
        pinned
      />
    </>
  );
}

/* —————————————————— 01 · HERO —————————————————— */

function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-forest-950 text-ivory">
      <ArtImage
        src={heroImage}
        alt="Workers in high-visibility clothing beside water infrastructure on an overcast day"
        priority
        parallax={12}
        sizes="100vw"
        width={1920}
        height={1200}
        className="absolute inset-0 h-full w-full"
        imgClassName="opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/30 to-forest-950/45 lg:bg-gradient-to-r lg:from-forest-950/85 lg:via-forest-950/35 lg:to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-forest-950/70 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[94rem] items-center px-7 pb-36 pt-36 sm:px-12 sm:pb-40 sm:pt-40 lg:px-14 lg:pb-32 lg:pt-40 xl:px-20">
        <div className="max-w-[35rem]">
          <Reveal>
            <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/75">
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
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/80">
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

      <div className="absolute inset-x-5 bottom-5 z-10 border border-white/15 bg-forest-950/80 p-4 backdrop-blur-md sm:inset-x-auto sm:bottom-8 sm:right-8 sm:p-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ivory/60">EcoHealth &amp; Transport Solutions Ltd</p>
        <p className="mt-2 font-serif text-xl italic text-ivory sm:text-2xl">{company.tagline}</p>
      </div>
    </section>
  );
}

/* —————————————————— 03 · COMPANY INTRODUCTION —————————————————— */

function CompanyIntro() {
  return (
    <section className="relative bg-ivory pb-14 pt-4 sm:pb-16 sm:pt-6 lg:pb-20 lg:pt-8">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-forest-700/35 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                <span className="h-1.5 w-1.5 rounded-full bg-forest-700" aria-hidden="true" />
                About EcoHealth
              </span>
              <h2 className="mt-6 max-w-2xl font-display text-display-lg text-charcoal">
                <LineReveal lines={['Where operational safety', 'meets environmental', 'responsibility.']} />
              </h2>
              <div className="mt-6 max-w-xl space-y-4 text-sm leading-relaxed text-muted sm:text-base">
                {company.intro.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <Link to="/about" className="btn-primary mt-8">
                Learn about EcoHealth
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={1}>
            <div>
              <ArtImage
                src={introImage}
                alt="Aerial view of green hills and terraced farmland"
                sizes="(min-width: 1024px) 48vw, 100vw"
                width={1600}
                height={1000}
                parallax={20}
                className="aspect-[1.65] rounded-[1.4rem]"
              />
              <div className="mt-4 grid min-h-[9rem] grid-cols-2 items-center gap-5 rounded-[1.4rem] bg-forest-900 px-6 py-6 text-ivory sm:px-8 sm:py-7">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ivory/55">Based in</p>
                  <p className="mt-2 font-display text-2xl font-semibold">Rwanda</p>
                  <p className="mt-1 text-xs leading-relaxed text-ivory/65">
                    Regional engagements scoped individually
                  </p>
                </div>
                <div className="border-l border-white/15 pl-5 sm:pl-7">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ivory/55">Our commitment</p>
                  <p className="mt-2 font-serif text-lg italic leading-snug text-sage-light sm:text-xl">
                    {company.tagline}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 02 · SERVICE INDEX —————————————————— */

function ServiceIndex() {
  const serviceTrackRef = useRef<HTMLDivElement>(null);

  const scrollServices = (direction: -1 | 1) => {
    const track = serviceTrackRef.current;
    if (track) {
      track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const track = serviceTrackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const carousel = track.parentElement;
      if (document.hidden || carousel?.matches(':hover') || carousel?.contains(document.activeElement)) {
        return;
      }

      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
      }
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="bg-sage-light pb-4 pt-12 sm:pb-5 sm:pt-14 lg:pb-6 lg:pt-16">
      <div className="shell">
        <div className="text-center">
          <Reveal>
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-forest-700/35 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-700" aria-hidden="true" />
              What we do
            </div>
            <h2 className="mx-auto mt-5 max-w-3xl font-display text-display-lg text-charcoal">
              Six disciplines. <span className="font-serif italic text-forest-700">One standard.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              Each service is delivered with the same practical, risk-based approach — adapted to your project, never
              copied from a template.
            </p>
          </Reveal>
        </div>

        <div
          className="mt-8 sm:mt-10"
          data-services-carousel
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => scrollServices(-1)}
              aria-label="Show previous services"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-700/25 text-forest-800 transition-colors hover:bg-forest-700 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollServices(1)}
              aria-label="Show more services"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-700/25 text-forest-800 transition-colors hover:bg-forest-700 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={serviceTrackRef}
            aria-label="EcoHealth services"
            className="mt-4 flex flex-nowrap snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {services.map((service, index) => (
              <Reveal
                key={service.slug}
                delay={((index % 3) + 1) as 1 | 2 | 3}
                className="w-[82vw] max-w-[21rem] shrink-0 snap-start sm:max-w-none sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <Link
                  to={servicePaths[service.slug]}
                  className="group relative block h-full overflow-hidden rounded-[1.25rem] border border-charcoal/10 bg-white p-3.5 transition duration-300 hover:-translate-y-1 hover:border-forest-700 hover:bg-forest-700 hover:shadow-[0_24px_70px_-38px_rgba(4,22,15,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 sm:p-4"
                >
                  <h3 className="min-h-[3.5rem] px-1 pt-1 font-display text-lg font-medium leading-snug text-charcoal transition-colors duration-300 group-hover:text-ivory sm:text-xl">
                    {service.shortTitle}
                  </h3>
                  <div className="relative mt-3 aspect-[1.35] overflow-hidden rounded-xl bg-forest-900">
                    <SmartImage
                      src={service.image}
                      alt={service.imageAlt}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 82vw"
                      width={1000}
                      height={740}
                      className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
                    />
                  </div>
                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest-800 transition-colors duration-300 group-hover:bg-sage-light">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-3 px-1 pb-1 text-[12px] leading-relaxed text-muted transition-colors duration-300 group-hover:text-ivory/80">
                    {service.summary}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={2}>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-5 border-t border-charcoal/15 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Scoped per project</p>
            <ArrowLink to="/services">View all services</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* —————————————————— 04 · WHY ECOHEALTH —————————————————— */

function WhyEcoHealth() {
  const reasonIcons = [CheckCheck, SlidersHorizontal, ClipboardCheck, FileCheck2, GraduationCap];

  return (
    <section className="bg-forest-950 text-ivory section-space">
      <div className="shell">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-sage-light/35 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-light">
            <span className="h-1.5 w-1.5 rounded-full bg-sage-light" aria-hidden="true" />
            04 · Why EcoHealth
          </span>
          <h2 className="mt-5 font-display text-display-md text-ivory">
            An approach built on practical outcomes.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ivory/65">
              We do not sell generic systems. We help you build the safety, environmental, and operational practices
              that fit your project and stand up to scrutiny.
          </p>
        </Reveal>

        <div className="mt-10 grid items-center gap-10 lg:mt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="relative aspect-[0.95] overflow-hidden rounded-[1.4rem] bg-forest-900">
              <ArtImage
                src={services[0].image}
                alt={services[0].imageAlt}
                sizes="(min-width: 1024px) 42vw, 100vw"
                width={1200}
                height={1400}
                parallax={22}
                className="absolute inset-0 h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ivory/60">
                  EcoHealth &amp; Transport Solutions Ltd
                </p>
                <p className="mt-2 max-w-sm font-serif text-2xl italic leading-snug text-ivory sm:text-3xl">
                  {company.tagline}
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <div className="divide-y divide-white/15 border-y border-white/15">
              {company.whyEcoHealth.map((item, index) => {
                const ReasonIcon = reasonIcons[index];
                return (
                  <Reveal key={item.title} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <article className="grid gap-4 py-5 sm:grid-cols-[3.75rem_1fr] sm:items-center sm:gap-5">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light text-forest-900">
                        <ReasonIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-semibold leading-snug text-ivory sm:text-lg">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-ivory/60">{item.body}</p>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
            <Reveal delay={1}>
              <div className="mt-7">
                <ArrowLink to="/contact" tone="light">Discuss your project</ArrowLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* —————————————————— 05 · CAPABILITY BAND —————————————————— */

function CapabilityBand() {
  return (
    <section className="bg-ivory section-space">
      <div className="shell">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-forest-700/30 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-700" aria-hidden="true" />
            05 · Capabilities &amp; experience
          </span>
          <h2 className="mt-5 font-display text-display-md text-charcoal">
            Clear service capabilities, scoped to each project.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            EcoHealth offers EHS, environmental, training, technical field, and transport safety services. Each
            engagement is scoped to the project requirements, available resources, and any applicable authorisations.
          </p>
        </Reveal>

        <div className="mt-9 space-y-5 sm:mt-12 sm:space-y-7">
          {capabilities.map((capability, index) => (
            <div
              key={capability.title}
              className="sticky top-20 sm:top-24"
              style={{ zIndex: index + 1 }}
            >
              <Reveal
                delay={((index % 3) + 1) as 1 | 2 | 3}
                className="capability-panel group relative min-h-[27rem] overflow-hidden rounded-[1.4rem] bg-forest-900 sm:aspect-[1.7] sm:min-h-0 lg:aspect-[2.15]"
              >
                <div className="capability-panel__image absolute inset-0">
                  <SmartImage
                    src={capability.image}
                    alt={capability.imageAlt}
                    sizes="(min-width: 1024px) 90vw, 100vw"
                    width={1920}
                    height={1000}
                    className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/55 via-transparent to-forest-950/10" />
                <article
                  className={`absolute bottom-5 left-5 w-[calc(100%-2.5rem)] max-w-[30rem] rounded-[1.2rem] bg-ivory/95 p-5 text-charcoal shadow-[0_24px_70px_-38px_rgba(4,22,15,0.55)] backdrop-blur-md sm:bottom-7 sm:p-7 ${
                    index % 2 === 0 ? 'sm:left-7' : 'sm:left-auto sm:right-7'
                  }`}
                >
                  <span className="inline-flex rounded-full border border-forest-700/20 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                    Capability {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-forest-900 sm:text-2xl">
                    {capability.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted sm:text-sm">{capability.body}</p>
                </article>
              </Reveal>
            </div>
          ))}
        </div>

        <Reveal delay={1}>
          <div className="mt-8">
            <ArrowLink to="/projects">Explore our capabilities</ArrowLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* —————————————————— 06 · TRAINING —————————————————— */

function TrainingPreview() {
  return (
    <section className="bg-sage-light section-space">
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
                className="aspect-[4/5] rounded-2xl"
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
  const steps = [
    {
      title: 'Local presence & specialist scopes',
      body: `${partnershipPoints[2].body} ${partnershipPoints[3].body}`,
      Icon: MapPin,
    },
    {
      title: partnershipPoints[0].title,
      body: partnershipPoints[0].body,
      Icon: Building2,
    },
    {
      title: partnershipPoints[1].title,
      body: partnershipPoints[1].body,
      Icon: ClipboardCheck,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-sage-light section-space">
      <div
        className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full bg-white/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-forest-700/5 blur-3xl"
        aria-hidden="true"
      />
      <div className="shell relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-forest-700/30 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-700" aria-hidden="true" />
            07 · Partners &amp; procurement
          </span>
          <h2 className="mt-5 font-display text-display-md text-charcoal">
            A capable local partner for contractors, principals, and procurement teams.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            We work with prime contractors, institutional clients, and organisations seeking a specialist partner for
            safety, environmental, and field operations in Rwanda — from subcontracted scopes to full programme support.
          </p>
        </Reveal>

        <div className="relative mt-12 grid gap-9 sm:grid-cols-2 sm:gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-10">
          <div
            className="absolute left-[16.7%] right-[16.7%] top-10 hidden h-px bg-forest-700/15 lg:block"
            aria-hidden="true"
          />
          {steps.map(({ title, body, Icon }, index) => (
            <Reveal key={title} delay={((index % 3) + 1) as 1 | 2 | 3}>
              <article className="relative flex h-full flex-col items-center px-4 text-center">
                <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-sage-light bg-white/80 text-forest-700 shadow-[0_12px_35px_-24px_rgba(4,22,15,0.5)]">
                  <Icon className="h-8 w-8" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="mt-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-forest-700/65">
                  Step {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 max-w-xs font-display text-xl font-semibold leading-snug text-forest-900">
                  {title}
                </h3>
                <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={2}>
          <div className="mt-12 flex flex-col gap-6 rounded-[1.4rem] border border-forest-700/10 bg-white/75 p-6 shadow-[0_24px_70px_-52px_rgba(4,22,15,0.35)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-2xl">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-forest-700">For procurement teams</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-charcoal sm:text-2xl">
                Company profile &amp; capability statement
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Share your procurement or partnership requirements and we will respond with the relevant capabilities
                and documentation.
              </p>
            </div>
            <div className="shrink-0">
              {settings.companyProfileUrl ? (
                <a
                  href={settings.companyProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Download className="h-4 w-4" />
                  {settings.companyProfileLabel || 'Download company profile'}
                </a>
              ) : (
                <Link to="/partners" className="btn-primary">
                  Partner with EcoHealth
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
            {settings.companyProfileUrl
              ? 'Approved for issue to procurement teams and contractors.'
              : 'Company profile document available on request, subject to approval.'}
          </p>
        </Reveal>
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
    <section className="border-t border-charcoal/10 bg-paper section-space">
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
