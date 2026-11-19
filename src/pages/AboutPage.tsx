import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { CTASection } from '@/components/CTASection';
import { SEO } from '@/components/SEO';
import { about, company } from '@/data/content';
import { ArtImage, ArrowLink, LineReveal, SectionMarker } from '@/components/motion';

const heroImage = 'https://images.pexels.com/photos/8487399/pexels-photo-8487399.jpeg?auto=compress&cs=tinysrgb&w=1800';
const approachImage = 'https://images.pexels.com/photos/8487361/pexels-photo-8487361.jpeg?auto=compress&cs=tinysrgb&w=1400';

export function AboutPage() {
  return (
    <>
      <SEO
        title="About Us | EcoHealth & Transport Solutions Ltd"
        description="EcoHealth & Transport Solutions Ltd is a Rwanda-based company providing EHS consultancy, environmental management, training, and transport safety solutions."
        path="/about"
      />

      <PageHero
        eyebrow="About us"
        title="A practical partner for safer, more responsible operations."
        titleLines={['A practical', 'partner for safer,', 'more responsible', 'operations.']}
        subtitle="We focus on supporting organisations in Rwanda. Regional engagements are considered individually, subject to the agreed scope and available capacity."
        image={heroImage}
        imageAlt="Two engineers in helmets and safety vests standing on site"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'About us' }]}
        variant="split"
        index="01"
        meta={['Rwanda-based', 'EHS · Environment · Transport', 'Advisory & field delivery']}
      />

      {/* Company statement */}
      <section className="bg-ivory section-space">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <Reveal>
                <SectionMarker index="02" label="Company overview" />
                <p className="mt-7 max-w-[14rem] text-sm leading-relaxed text-muted">
                  A single partner across EHS, environmental management, training, transport safety, and field
                  operations.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-9">
              <Reveal>
                <p className="max-w-4xl font-display text-[1.6rem] font-light leading-[1.35] text-charcoal sm:text-3xl lg:text-[2.4rem]">
                  {about.description}
                </p>
              </Reveal>

              <div className="mt-12 grid gap-8 border-t border-charcoal/15 pt-8 sm:grid-cols-3">
                {[
                  { label: 'Based in', value: company.country, note: 'Regional work scoped individually' },
                  { label: 'Disciplines', value: 'Six', note: 'Integrated service lines' },
                  { label: 'Engagement', value: 'Scoped', note: 'Advisory to embedded support' },
                ].map((item, index) => (
                  <Reveal key={item.label} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">{item.label}</p>
                    <p className="mt-2 font-display text-2xl font-light text-forest-800">{item.value}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{item.note}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="grain-overlay relative overflow-hidden bg-forest-950 text-ivory section-space">
        <div className="shell relative z-10">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <Reveal>
                <SectionMarker index="03" label="Mission" tone="light" />
                <p className="mt-8 font-serif text-[2rem] italic leading-[1.25] text-ivory sm:text-[2.6rem]">
                  {about.mission}
                </p>
                <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-ivory/35">
                  Subject to director approval before publication
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-5 lg:col-start-8 lg:pt-24">
              <Reveal delay={1}>
                <SectionMarker index="04" label="Vision" tone="light" />
                <p className="mt-8 font-serif text-[2rem] italic leading-[1.25] text-sage-light sm:text-[2.6rem]">
                  {about.vision}
                </p>
                <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-ivory/35">
                  Subject to director approval before publication
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Core values — staggered editorial columns */}
      <section className="bg-ivory section-space">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="lg:sticky lg:top-28">
                  <SectionMarker index="05" label="Core values" />
                  <h2 className="mt-6 max-w-xs font-display text-display-md text-charcoal">
                    The principles that guide our work.
                  </h2>
                  <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
                    Every engagement is shaped by the same set of values — they define what we will and will not do,
                    and how we work alongside our clients.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <div className="gap-10 sm:columns-2 [&>*]:break-inside-avoid">
                {about.coreValues.map((value, index) => (
                  <Reveal key={value.title} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <div className="mb-9 border-t border-charcoal/15 pt-5">
                      <div className="flex items-baseline gap-4">
                        <span className="font-serif text-2xl italic text-forest-700/40">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-display text-base font-medium text-charcoal">{value.title}</h3>
                      </div>
                      <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{value.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="bg-sage-light section-space">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="lg:sticky lg:top-28">
                  <SectionMarker index="06" label="Our approach" />
                  <h2 className="mt-6 max-w-sm font-display text-display-md text-charcoal">How we work.</h2>
                  <p className="mt-5 max-w-sm text-sm leading-relaxed text-charcoal-light">
                    Practical work on the ground, clear documentation behind it, and recommendations that outlast the
                    engagement.
                  </p>
                  <div className="mt-8">
                    <ArtImage
                      src={approachImage}
                      alt="Two engineers in protective equipment discussing a project inside a building under construction"
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      width={1200}
                      height={900}
                      parallax={22}
                      className="aspect-[4/3]"
                    />
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <ol className="border-t border-charcoal/15">
                {about.approach.map((step, index) => (
                  <Reveal key={index} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <li className="group grid gap-4 border-b border-charcoal/15 py-7 sm:grid-cols-12 sm:gap-5">
                      <div className="sm:col-span-2">
                        <span className="font-serif text-3xl italic leading-none text-forest-700/35 transition-colors duration-500 group-hover:text-forest-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-charcoal-light sm:col-span-10">{step}</p>
                    </li>
                  </Reveal>
                ))}
              </ol>
              <p className="mt-6 text-[11px] leading-relaxed text-muted">
                Engagements range from short advisory visits to embedded project support and structured training
                programmes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership — designed as an intentional publication status, not a placeholder grid */}
      <section className="bg-ivory section-space">
        <div className="shell">
          <div className="grid gap-10 border border-charcoal/20 lg:grid-cols-12">
            <div className="flex items-center justify-center border-b border-charcoal/15 bg-paper p-10 lg:col-span-5 lg:border-b-0 lg:border-r">
              <p className="font-serif text-5xl italic leading-none text-forest-700/25" aria-hidden="true">
                EH
              </p>
            </div>
            <div className="p-8 lg:col-span-7 lg:p-12">
              <Reveal>
                <SectionMarker index="07" label="Leadership" />
                <h2 className="mt-6 max-w-lg font-display text-display-sm text-charcoal">
                  Leadership profile in preparation.
                </h2>
                <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-muted">
                  Our leadership profile will be published following director approval. We are committed to presenting
                  verified, accurate information about the people responsible for our work.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-charcoal/15 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  <span>Publication pending approval</span>
                  <Link to="/contact" className="text-forest-700 link-underline">
                    Contact the team
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment note */}
      <section className="border-t border-charcoal/10 bg-paper section-space">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Reveal>
                <h2 className="max-w-2xl font-display text-[1.65rem] font-light leading-snug text-charcoal sm:text-3xl">
                  <LineReveal
                    lines={[
                      'Committed to health, safety, and',
                      'environmental responsibility —',
                      'in how we work and what we deliver.',
                    ]}
                  />
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end">
              <Reveal delay={1}>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  Operational safety and environmental responsibility are not optional. They are the conditions under
                  which good work gets done.
                </p>
                <div className="mt-5">
                  <ArrowLink to="/services">Explore our services</ArrowLink>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        compact
        eyebrow="Our commitment"
        headline="Want to know if EcoHealth is the right partner for your project?"
        headlineLines={['Want to know if', 'EcoHealth is the right', 'partner for your project?']}
        body="Tell us about your operational needs and we will discuss how we can help."
        ctaLabel="Start a conversation"
        ctaTo="/contact"
        variant="forest"
        secondaryTo="/projects"
        secondaryLabel="See our capabilities"
      />
    </>
  );
}
