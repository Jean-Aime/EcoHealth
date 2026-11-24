import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero, ServiceCTA } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { primaryServices, servicePaths, siteImages } from '@/data/content';
import { usePublishedContent, type CaseStudyRecord } from '@/lib/cms';
import { ArtImage, ArrowLink, SectionMarker } from '@/components/motion';

const heroImage = siteImages.constructionTeam;
const fieldImage = siteImages.siteTeam;

const capabilityAreas = [
  {
    title: 'EHS & safety supervision',
    body: 'Site safety inspections, risk assessments, compliance auditing, and embedded safety supervision for active projects.',
  },
  {
    title: 'Transport and logistics',
    body: 'Transport risk assessment, journey planning, driver safety awareness, and fleet procedures scoped to project needs.',
  },
  {
    title: 'PPE supply',
    body: 'Personal protective equipment options with product specifications, availability, and delivery confirmed for each quotation.',
  },
  {
    title: 'Rigging and lifting services',
    body: 'Project-scoped planning and site support with equipment, competent personnel, and authorisations confirmed before work is agreed.',
  },
  {
    title: 'Professional safety training',
    body: 'Workplace safety training shaped around participant roles, site hazards, and agreed learning objectives.',
  },
];

export function ProjectsPage() {
  const { caseStudies } = usePublishedContent();

  return (
    <>
      <SEO
        title="Projects & Experience | EcoHealth & Transport Solutions Ltd"
        description="Explore EcoHealth's EHS consultancy, transport and logistics, PPE supply, rigging and lifting services, and professional safety training."
        path="/projects"
      />

      <PageHero
        eyebrow="Projects & experience"
        title="Practical support for safer project delivery."
        titleLines={['Practical support', 'for safer project', 'delivery.']}
        subtitle="Explore our EHS consultancy, transport and logistics, PPE supply, rigging and lifting services, and professional safety training. Approved case studies appear here once verified for publication."
        image={heroImage}
        imageAlt="Project team wearing safety equipment at a construction site"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Projects' }]}
        index="04"
        meta={['EHS', 'Environment', 'Field support', 'Transport', 'Waste']}
      />

      {/* Capability dossier */}
      <section className="bg-ivory section-space">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="lg:sticky lg:top-28">
                  <SectionMarker index="01" label="Capabilities" />
                  <h2 className="mt-6 max-w-xs font-display text-display-md text-charcoal">
                    Where we bring value to projects.
                  </h2>
                  <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
                    These are the disciplines we deliver across the project lifecycle, as standalone scopes or
                    integrated programme support.
                  </p>
                  <div className="mt-8">
                    <ArrowLink to="/services">See our five core services</ArrowLink>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <div className="border-t border-charcoal/15">
                {capabilityAreas.map((area, index) => (
                  <Reveal key={area.title} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <div className="group grid gap-4 border-b border-charcoal/15 py-7 sm:grid-cols-12 sm:gap-6 sm:py-8">
                      <div className="sm:col-span-2">
                        <span className="font-serif text-3xl italic leading-none text-forest-700/30 transition-colors duration-500 group-hover:text-forest-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-medium leading-snug text-charcoal sm:col-span-4">
                        {area.title}
                      </h3>
                      <p className="text-[13.5px] leading-relaxed text-muted sm:col-span-6">{area.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {caseStudies.length > 0 ? (
        <section className="border-t border-charcoal/10 bg-paper section-space">
          <div className="shell">
            <div className="flex flex-col justify-between gap-6 border-b border-charcoal/15 pb-8 sm:flex-row sm:items-end">
              <Reveal>
                <div>
                  <SectionMarker index="02" label="Selected experience" />
                  <h2 className="mt-6 max-w-xl font-display text-display-md text-charcoal">
                    Verified case studies, published with integrity.
                  </h2>
                </div>
              </Reveal>
              <p className="max-w-xs text-[11px] leading-relaxed text-muted">
                Each entry has been approved for publication. Where a client cannot be named, the case study is
                published on an anonymised basis.
              </p>
            </div>

            <div className="mt-14 space-y-16 lg:space-y-24">
              {caseStudies.map((study, index) => (
                <CaseStudy key={study.id} study={study} reversed={index % 2 === 1} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="grain-overlay relative overflow-hidden bg-forest-950 text-ivory">
          <div className="grid lg:grid-cols-12">
            <div className="relative min-h-[24rem] lg:col-span-5 lg:min-h-[40rem]">
              <ArtImage
                src={fieldImage}
                alt="Field team wearing high-visibility clothing at a project site"
                sizes="(min-width: 1024px) 42vw, 100vw"
                width={1200}
                height={1500}
                parallax={28}
                className="absolute inset-0 h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
              <p className="absolute bottom-6 left-6 right-6 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ivory/55">
                Illustrative field operations
              </p>
            </div>

            <div className="px-5 sm:px-8 section-space lg:col-span-7 lg:px-14">
              <Reveal>
                <SectionMarker index="02" label="Case studies" tone="light" />
                <h2 className="mt-6 max-w-lg font-display text-display-md text-ivory">
                  Verified case studies, published with integrity.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/60">
                  We present approved project case studies with verified scope, responsibilities, and outcomes once
                  they have been reviewed for publication. We do not publish invented projects, client names, or
                  statistics.
                </p>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/45">
                  If you are a procurement team or contractor evaluating EcoHealth for a specific scope, contact us
                  directly. We will share relevant experience and capabilities under appropriate confidentiality.
                </p>

                <div className="mt-9 border-t border-white/15 pt-6">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    <Link
                      to="/contact?enquiry=partnership"
                      className="group inline-flex items-center gap-3 bg-ivory px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-950 transition-all duration-500 hover:gap-5 hover:bg-white"
                    >
                      Request experience details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <ArrowLink to="/partners" tone="light">
                      Procurement information
                    </ArrowLink>
                  </div>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-ivory/35">
                    Publication status · Awaiting approved case studies
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* Cross-links by service */}
      <section className="bg-ivory section-space">
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <Reveal>
              <SectionMarker index="03" label="Explore by service" />
            </Reveal>
            <ArrowLink to="/services">All services</ArrowLink>
          </div>

          <div className="mt-8 grid border-t border-charcoal/15 sm:grid-cols-2 lg:grid-cols-3">
            {primaryServices.map((service) => (
              <Reveal key={service.slug}>
                <Link
                  to={servicePaths[service.slug]}
                  className="group flex items-center justify-between gap-4 border-b border-charcoal/15 py-4 pr-4 transition-colors hover:text-forest-800 sm:even:pl-5"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-[9px] font-semibold tabular-nums text-muted">{service.index}</span>
                    <span className="font-display text-[15px] font-medium text-charcoal transition-colors group-hover:text-forest-800">
                      {service.shortTitle}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted transition-transform duration-500 group-hover:translate-x-1 group-hover:text-forest-700" />
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

function CaseStudy({
  study,
  reversed,
  index,
}: {
  study: CaseStudyRecord;
  reversed: boolean;
  index: number;
}) {
  const meta = [study.industry, study.location].filter(Boolean);

  return (
    <Reveal>
      <article className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-14">
        {study.image && (
          <div className={`lg:col-span-6 ${reversed ? 'lg:order-2' : ''}`}>
            <div className="relative">
              <ArtImage
                src={study.image}
                alt={study.imageAlt || study.title}
                sizes="(min-width: 1024px) 45vw, 100vw"
                width={1200}
                height={900}
                className="aspect-[4/3]"
              />
              <span className="absolute left-0 top-0 z-10 flex h-14 w-14 items-center justify-center bg-forest-800 font-display text-sm tabular-nums text-ivory">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        <div className={`${study.image ? 'lg:col-span-6' : 'lg:col-span-12'} ${reversed ? 'lg:order-1' : ''}`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted">
            {meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
            {study.confidential && <span className="text-forest-700">Client confidential</span>}
          </div>

          <h3 className="mt-4 max-w-xl font-display text-display-sm text-charcoal">{study.title}</h3>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-charcoal-light">{study.scope}</p>

          <div className="mt-8 grid gap-8 border-t border-charcoal/15 pt-7 sm:grid-cols-3">
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
      <h4 className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-charcoal">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-muted">
            <span className="mt-[0.5rem] h-px w-3 shrink-0 bg-forest-600" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
