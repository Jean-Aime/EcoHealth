import { ArrowRight, Target, Eye, Compass } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero, SectionHeader, ServiceCTA } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { about, company } from '@/data/content';
import { SmartImage } from '@/components/SmartImage';

const heroImage =
  'https://images.pexels.com/photos/8487399/pexels-photo-8487399.jpeg?auto=compress&cs=tinysrgb&w=1800';
const approachImage =
  'https://images.pexels.com/photos/8487361/pexels-photo-8487361.jpeg?auto=compress&cs=tinysrgb&w=1400';

export function AboutPage() {
  return (
    <>
      <SEO
        title="About Us | EcoHealth & Transport Solutions Ltd"
        description="EcoHealth & Transport Solutions Ltd is a Rwanda-based company providing EHS consultancy, environmental management, training, and transport safety solutions."
        path="/about"
      />
      <PageHero
        eyebrow="About Us"
        title="A practical partner for safer, more responsible operations."
        subtitle="We help organisations in Rwanda and the wider region manage workplace safety, environmental responsibilities, and field operations with discipline and honesty."
        image={heroImage}
        imageAlt="Two engineers wearing helmets and safety vests, embodying strength and professionalism"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'About Us' }]}
      />

      {/* Company overview */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow">Company overview</p>
              <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                Who we are.
              </h2>
            </Reveal>
            <div className="lg:col-span-7">
              <Reveal delay={1}>
                <p className="text-lg leading-relaxed text-charcoal-light text-pretty">
                  {about.description}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-sage-light">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="border-t-2 border-forest-600 pt-8">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-forest-600" />
                  <p className="eyebrow">Mission</p>
                </div>
                <p className="mt-5 font-display text-2xl font-medium leading-snug text-charcoal text-balance">
                  {about.mission}
                </p>
                <p className="mt-4 text-xs italic text-muted">Subject to director approval before publication.</p>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="border-t-2 border-forest-600 pt-8">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-forest-600" />
                  <p className="eyebrow">Vision</p>
                </div>
                <p className="mt-5 font-display text-2xl font-medium leading-snug text-charcoal text-balance">
                  {about.vision}
                </p>
                <p className="mt-4 text-xs italic text-muted">Subject to director approval before publication.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <SectionHeader
            eyebrow="Core values"
            title="The principles that guide our work."
            body="Every engagement is shaped by the same set of values — they define what we will and will not do, and how we work alongside our clients."
          />
          <div className="mt-14 grid gap-px bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-3">
            {about.coreValues.map((value, i) => (
              <Reveal
                key={value.title}
                delay={((i % 3) + 1) as 1 | 2 | 3}
                className="bg-ivory p-8"
              >
                <span className="font-display text-sm font-bold text-forest-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-charcoal">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted text-pretty">
                  {value.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Professional approach */}
      <section className="bg-charcoal text-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow text-sage-dark">Our approach</p>
              <h2 className="mt-5 font-display text-display-md text-white text-balance">
                How we work.
              </h2>
              <div className="mt-8 relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  src={approachImage}
                  alt="Two engineers in protective gear discussing a project inside a building under construction"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  width={1200}
                  height={900}
                  className="image-cover"
                />
              </div>
            </Reveal>
            <div className="lg:col-span-7">
              <div className="border-t border-white/15">
                {about.approach.map((step, i) => (
                  <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
                    <div className="border-b border-white/15 py-8">
                      <div className="flex items-start gap-6">
                        <Compass className="mt-1 h-5 w-5 flex-shrink-0 text-forest-400" />
                        <div>
                          <span className="text-xs uppercase tracking-widest text-sage-dark">
                            Step {String(i + 1).padStart(2, '0')}
                          </span>
                          <p className="mt-2 text-lg leading-relaxed text-ivory/80 text-pretty">
                            {step}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership placeholder */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <SectionHeader
            eyebrow="Leadership"
            title="Led by experienced practitioners."
            body="Our leadership profile will be published following director approval. We are committed to presenting verified, accurate information about the people responsible for our work."
          />
          <Reveal delay={1}>
            <div className="mt-12 border border-dashed border-charcoal/20 bg-sage-light/50 p-12 text-center">
              <p className="text-sm text-muted">
                Leadership profiles and professional biographies will appear here once approved for publication.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Commitment */}
      <section className="bg-sage-light">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="eyebrow">Our commitment</p>
                <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                  Committed to health, safety, and environmental responsibility.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-charcoal-light text-pretty">
                  We believe operational safety and environmental responsibility are not optional. They are the conditions under which good work gets done. Every engagement we take on is shaped by that belief — and by the obligation to leave our clients better equipped than we found them.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-5">
              <Reveal delay={1}>
                <div className="bg-forest-800 p-10 text-ivory">
                  <p className="font-serif text-xl italic leading-relaxed text-sage-light">
                    {company.tagline}
                  </p>
                  <div className="mt-8">
                    <Link
                      to="/services"
                      className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-white"
                    >
                      <span className="link-underline">Explore our services</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <ServiceCTA
        title="Want to know if EcoHealth is the right partner for your project?"
        body="Tell us about your operational needs and we will discuss how we can help."
      />
    </>
  );
}
