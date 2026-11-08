import { ArrowRight, FileText, Shield, Leaf, Truck, Wifi, Recycle } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero, ServiceCTA } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { SmartImage } from '@/components/SmartImage';
import { services, servicePaths } from '@/data/content';
import { usePublishedContent, type CaseStudyRecord } from '@/lib/cms';

const heroImage = 'https://images.pexels.com/photos/14053428/pexels-photo-14053428.jpeg?auto=compress&cs=tinysrgb&w=1800';

const capabilityAreas = [
  {
    icon: Shield,
    title: 'EHS & Safety Supervision',
    body: 'Site safety inspections, risk assessments, compliance auditing, and embedded safety supervision for active projects.',
  },
  {
    icon: Leaf,
    title: 'Environmental Management',
    body: 'Environmental impact assessments, management plans, monitoring, and reporting for projects in sensitive contexts.',
  },
  {
    icon: Wifi,
    title: 'Technical Field Support',
    body: 'Deployment, inspection, and safety supervision for telecommunications and infrastructure field work.',
  },
  {
    icon: Truck,
    title: 'Transport & Fleet Safety',
    body: 'Fleet safety policies, driver training, journey management, and transport risk assessment.',
  },
  {
    icon: Recycle,
    title: 'Waste & E-Waste Solutions',
    body: 'Waste management planning, e-waste responsible disposal, and segregation guidance for sites and facilities.',
  },
  {
    icon: FileText,
    title: 'Documentation & Reporting',
    body: 'Clear, traceable records that support compliance, tender responses, and continuous improvement.',
  },
];

export function ProjectsPage() {
  const { caseStudies } = usePublishedContent();

  return (
    <>
      <SEO
        title="Projects & Experience | EcoHealth & Transport Solutions Ltd"
        description="Explore EcoHealth's capabilities across EHS, environmental management, training, telecommunications field support, transport safety, and waste management."
        path="/projects"
      />
      <PageHero
        eyebrow="Projects & Experience"
        title="A foundation of practical, field-tested capability."
        subtitle="Our experience spans EHS consultancy, environmental management, training, technical field support, transport safety, and waste solutions. Approved case studies appear here as they are verified for publication."
        image={heroImage}
        imageAlt="Workers in safety vests operating heavy machinery at a night construction site"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Projects' }]}
      />

      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow">Capabilities</p>
              <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                Where we bring value to projects.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted text-pretty">
                These are the disciplines we deliver across the project lifecycle — as standalone scopes or integrated
                programme support.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-px bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-3">
            {capabilityAreas.map((area, i) => {
              const Icon = area.icon;
              return (
                <Reveal key={area.title} delay={((i % 3) + 1) as 1 | 2 | 3} className="bg-ivory p-8">
                  <Icon className="h-7 w-7 text-forest-600" strokeWidth={1.5} />
                  <h3 className="mt-5 font-display text-lg font-semibold text-charcoal">{area.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">{area.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {caseStudies.length > 0 ? (
        <section className="bg-sage-light border-t border-charcoal/10">
          <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
            <Reveal>
              <div className="max-w-2xl">
                <p className="eyebrow">Selected experience</p>
                <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                  Verified case studies, published with integrity.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted text-pretty">
                  Each entry below has been approved for publication. Where a client cannot be named, the case study is
                  published on an anonymised basis.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 space-y-16 lg:space-y-24">
              {caseStudies.map((study, index) => (
                <CaseStudy key={study.id} study={study} reversed={index % 2 === 1} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-sage-light">
          <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
            <Reveal>
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                  <p className="eyebrow">Case studies</p>
                  <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                    Verified case studies, published with integrity.
                  </h2>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-lg leading-relaxed text-charcoal-light text-pretty">
                    We present approved project case studies — with verified scope, responsibilities, and outcomes —
                    once they have been reviewed for publication. We do not publish invented projects, client names, or
                    statistics.
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-muted text-pretty">
                    If you are a procurement team or contractor evaluating EcoHealth for a specific scope, please contact
                    us directly. We will share relevant experience and capabilities under appropriate confidentiality.
                  </p>
                  <div className="mt-8">
                    <Link
                      to="/contact?enquiry=partnership"
                      className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-forest-700"
                    >
                      <span className="link-underline">Request experience details</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="mt-14 grid gap-px bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex aspect-[4/3] items-center justify-center border border-dashed border-charcoal/15 bg-ivory/50 p-8 text-center"
                  >
                    <p className="text-sm text-muted">
                      Case study {String(n).padStart(2, '0')}
                      <br />
                      <span className="text-xs">Pending approval</span>
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="bg-ivory border-t border-charcoal/10">
        <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="eyebrow">Explore by service</p>
          <div className="mt-8 grid gap-px bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={((i % 3) + 1) as 1 | 2 | 3} className="bg-ivory">
                <Link to={servicePaths[service.slug]} className="group flex h-full flex-col p-7">
                  <span className="font-display text-sm font-bold text-forest-600">{service.index}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-charcoal">{service.shortTitle}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted text-pretty">{service.summary}</p>
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

      <ServiceCTA
        title="Want to discuss a specific project scope?"
        body="Tell us about your requirements and we will respond with relevant experience and capabilities."
        ctaTo="/contact?enquiry=partnership"
      />
    </>
  );
}

function CaseStudy({ study, reversed }: { study: CaseStudyRecord; reversed: boolean }) {
  const meta = [study.industry, study.location].filter(Boolean);

  return (
    <Reveal>
      <article className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
        {study.image && (
          <div className={`lg:col-span-6 ${reversed ? 'lg:order-2' : ''}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-charcoal/5">
              <SmartImage
                src={study.image}
                alt={study.imageAlt || study.title}
                sizes="(min-width: 1024px) 45vw, 100vw"
                width={1200}
                height={900}
                className="image-cover"
              />
            </div>
          </div>
        )}

        <div className={`${study.image ? 'lg:col-span-6' : 'lg:col-span-12'} ${reversed ? 'lg:order-1' : ''}`}>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted">
            {meta.map((item) => (
              <span key={item} className="border border-charcoal/15 px-3 py-1">
                {item}
              </span>
            ))}
            {study.confidential && (
              <span className="border border-forest-600/30 bg-forest-50 px-3 py-1 text-forest-800">
                Client confidential
              </span>
            )}
          </div>

          <h3 className="mt-5 font-display text-display-sm text-charcoal text-balance">{study.title}</h3>
          <p className="mt-4 text-lg leading-relaxed text-charcoal-light text-pretty">{study.scope}</p>

          <div className="mt-8 grid gap-8 border-t border-charcoal/10 pt-8 sm:grid-cols-3">
            <CaseStudyList title="Responsibilities" items={study.responsibilities} />
            <CaseStudyList title="Approach" items={study.approach} />
            <CaseStudyList title="Outcomes" items={study.outcomes} />
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function CaseStudyList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-medium uppercase tracking-widest text-charcoal">{title}</h4>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
            <span className="mt-2 h-1 w-1 flex-shrink-0 bg-forest-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
