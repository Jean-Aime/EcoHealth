import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { CTASection } from '@/components/CTASection';
import { SEO } from '@/components/SEO';
import { services, servicePaths } from '@/data/content';
import { SmartImage } from '@/components/SmartImage';

const heroImage =
  'https://images.pexels.com/photos/35861510/pexels-photo-35861510.jpeg?auto=compress&cs=tinysrgb&w=1800';

export function ServicesPage() {
  return (
    <>
      <SEO
        title="Services | EHS, Environmental, Training, Telecom, Transport & Waste | EcoHealth"
        description="Explore EcoHealth's six service lines: EHS consultancy, environmental management, training, telecommunications field support, transport safety, and waste management."
        path="/services"
      />
      <PageHero
        eyebrow="Our Services"
        title="Six disciplines. One standard of delivery."
        subtitle="Each service is delivered with the same practical, risk-based approach — tailored to your project, documented for compliance, and focused on real outcomes."
        image={heroImage}
        imageAlt="Two construction workers in safety gear by a waterfront during an overcast day"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services' }]}
      />

      {/* Large editorial service list */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="border-t border-charcoal/10">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={((i % 2) + 1) as 1 | 2}>
                <div className="group grid gap-8 border-b border-charcoal/10 py-10 lg:grid-cols-12 lg:gap-12 lg:py-14">
                  {/* Number */}
                  <div className="lg:col-span-1">
                    <span className="font-display text-3xl font-bold text-forest-600 lg:text-4xl">
                      {service.index}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="lg:col-span-4">
                    <Link to={servicePaths[service.slug]} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <SmartImage
                          src={service.image}
                          alt={service.imageAlt}
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          width={900}
                          height={675}
                          className="image-cover transition-transform duration-700 ease-elegant group-hover:scale-105"
                        />
                      </div>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center lg:col-span-7">
                    <h2 className="font-display text-2xl font-semibold text-charcoal lg:text-3xl">
                      {service.title}
                    </h2>
                    <p className="mt-4 max-w-prose text-base leading-relaxed text-muted text-pretty">
                      {service.summary}
                    </p>
                    <div className="mt-6">
                      <Link
                        to={servicePaths[service.slug]}
                        className="group/link inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-forest-700"
                      >
                        <span className="link-underline">Explore this service</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Get in touch"
        headline="Not sure which service you need?"
        body="Tell us about your project and we will help you identify the right scope of support — whether that is one service or several working together."
        ctaLabel="Start a Conversation"
        ctaTo="/contact"
        variant="forest"
      />
    </>
  );
}
