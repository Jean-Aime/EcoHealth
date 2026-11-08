import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { SmartImage } from '@/components/SmartImage';

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
  breadcrumb?: { label: string; path?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-forest-800">
      <div className="absolute inset-0">
        <SmartImage
          src={image}
          alt={imageAlt}
          priority
          sizes="100vw"
          width={1920}
          height={1080}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-800 via-forest-800/80 to-forest-800/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-800/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-8xl px-6 pt-36 pb-20 lg:px-10 lg:pt-44 lg:pb-28">
        <div className="max-w-3xl">
          {breadcrumb && (
            <nav className="mb-6 flex items-center gap-2 text-xs text-ivory/50">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-ivory transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ivory/70">{crumb.label}</span>
                  )}
                  {i < breadcrumb.length - 1 && <span className="text-ivory/30">/</span>}
                </span>
              ))}
            </nav>
          )}
          <Reveal>
            <p className="eyebrow text-sage-light">{eyebrow}</p>
            <h1 className="mt-5 font-display text-display-lg text-white text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/75 text-pretty">
                {subtitle}
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: 'left' | 'center';
}) {
  return (
    <Reveal>
      <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">{title}</h2>
        {body && (
          <p className="mt-5 text-lg leading-relaxed text-muted text-pretty">{body}</p>
        )}
      </div>
    </Reveal>
  );
}

export function ServiceCTA({
  title = 'Request a quote for this service',
  body = 'Tell us about your project requirements and our team will discuss an appropriate scope of support.',
  ctaTo = '/contact',
}: {
  title?: string;
  body?: string;
  ctaTo?: string;
}) {
  return (
    <section className="bg-forest-800 text-ivory">
      <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-display-sm text-white text-balance">{title}</h2>
            <p className="mt-4 text-base leading-relaxed text-ivory/65 text-pretty">{body}</p>
          </div>
          <Link
            to={ctaTo}
            className="group inline-flex flex-shrink-0 items-center gap-2 bg-white px-7 py-3.5 text-sm font-medium uppercase tracking-wider text-forest-800 transition-all duration-500 ease-elegant hover:gap-3"
          >
            Request a Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
