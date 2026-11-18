import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { ArtImage, LineReveal, SectionMarker } from '@/components/motion';

type HeroVariant = 'masthead' | 'split' | 'cinematic';

function Breadcrumb({ breadcrumb, tone }: { breadcrumb?: { label: string; path?: string }[]; tone: 'dark' | 'light' }) {
  if (!breadcrumb) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] ${
        tone === 'light' ? 'text-ivory/55' : 'text-muted'
      }`}
    >
      {breadcrumb.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
          {crumb.path ? (
            <Link to={crumb.path} className="transition-colors hover:text-forest-700">
              {crumb.label}
            </Link>
          ) : (
            <span className={tone === 'light' ? 'text-ivory/85' : 'text-charcoal'}>{crumb.label}</span>
          )}
          {index < breadcrumb.length - 1 && <span className="opacity-40">/</span>}
        </span>
      ))}
    </nav>
  );
}

/**
 * Three deliberately different hero compositions so no two page families open
 * the same way:
 *  - masthead: editorial title page with a framed photographic band
 *  - split: type on warm ivory beside a full-height photograph
 *  - cinematic: full-bleed photography for immersive moments
 */
export function PageHero({
  eyebrow,
  title,
  titleLines,
  subtitle,
  image,
  imageAlt,
  breadcrumb,
  variant = 'masthead',
  index,
  meta,
}: {
  eyebrow: string;
  title: string;
  titleLines?: string[];
  subtitle?: string;
  image: string;
  imageAlt: string;
  breadcrumb?: { label: string; path?: string }[];
  variant?: HeroVariant;
  index?: string;
  meta?: string[];
}) {
  if (variant === 'split') {
    return (
      <section className="relative overflow-hidden bg-ivory">
        <div className="shell">
          <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="flex flex-col justify-between pt-32 lg:col-span-7 lg:py-40">
              <div>
                <Breadcrumb breadcrumb={breadcrumb} tone="dark" />
                <div className="mt-10">
                  <SectionMarker index={index} label={eyebrow} />
                </div>
                <h1 className="mt-7 max-w-2xl font-display text-display-xl text-charcoal">
                  {titleLines ? <LineReveal lines={titleLines} /> : title}
                </h1>
                {subtitle && (
                  <Reveal delay={2}>
                    <p className="mt-8 max-w-lg text-lede text-charcoal-light">{subtitle}</p>
                  </Reveal>
                )}
              </div>
              {meta && meta.length > 0 && (
                <Reveal delay={3}>
                  <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-charcoal/10 pt-6">
                    {meta.map((item) => (
                      <li key={item} className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>

            <div className="relative lg:col-span-5">
              <ArtImage
                src={image}
                alt={imageAlt}
                priority
                parallax={26}
                sizes="(min-width: 1024px) 42vw, 100vw"
                width={1200}
                height={1500}
                className="aspect-[4/5] sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[46rem]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-forest-950/60 to-transparent p-8 lg:block">
                <p className="font-serif text-lg italic text-ivory/85">Safe People. Healthy Environment. Sustainable Future.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'cinematic') {
    return (
      <section className="relative isolate flex min-h-[82svh] items-end overflow-hidden bg-forest-950 text-ivory">
        <ArtImage
          src={image}
          alt={imageAlt}
          priority
          parallax={34}
          sizes="100vw"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full"
          imgClassName="opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/55 to-forest-950/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/70 via-transparent to-transparent" />
        <div className="shell relative z-10 py-16 lg:py-24">
          <Breadcrumb breadcrumb={breadcrumb} tone="light" />
          <div className="mt-10 max-w-4xl">
            <SectionMarker index={index} label={eyebrow} tone="light" />
            <h1 className="mt-6 font-display text-display-2xl text-ivory">
              {titleLines ? <LineReveal lines={titleLines} /> : title}
            </h1>
            {subtitle && (
              <Reveal delay={2}>
                <p className="mt-7 max-w-xl text-lede text-ivory/75">{subtitle}</p>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-ivory pt-32 lg:pt-40">
      <div className="shell">
        <Breadcrumb breadcrumb={breadcrumb} tone="dark" />

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-8">
            <SectionMarker index={index} label={eyebrow} />
            <h1 className="mt-6 font-display text-display-xl text-charcoal">
              {titleLines ? <LineReveal lines={titleLines} /> : title}
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-2">
            {subtitle && (
              <Reveal delay={1}>
                <p className="max-w-md text-base leading-relaxed text-charcoal-light lg:text-[1.05rem]">{subtitle}</p>
              </Reveal>
            )}
            {meta && meta.length > 0 && (
              <Reveal delay={2}>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-charcoal/10 pt-5">
                  {meta.map((item) => (
                    <li key={item} className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <ArtImage
            src={image}
            alt={imageAlt}
            priority
            parallax={22}
            sizes="(min-width: 1024px) 92vw, 100vw"
            width={1920}
            height={900}
            className="aspect-[16/10] sm:aspect-[16/7]"
          />
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
  index,
  tone = 'dark',
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: 'left' | 'center';
  index?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <Reveal>
      <div
        className={
          align === 'center'
            ? 'mx-auto max-w-2xl text-center'
            : 'grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12'
        }
      >
        <div className={align === 'center' ? '' : 'lg:col-span-8'}>
          <SectionMarker index={index} label={eyebrow} tone={tone} className={align === 'center' ? 'justify-center' : ''} />
          <h2
            className={`mt-5 font-display text-display-md ${tone === 'light' ? 'text-ivory' : 'text-charcoal'}`}
          >
            {title}
          </h2>
        </div>
        {body && (
          <div className={align === 'center' ? 'mt-5' : 'lg:col-span-4'}>
            <p
              className={`text-base leading-relaxed ${
                tone === 'light' ? 'text-ivory/65' : 'text-muted'
              } ${align === 'center' ? '' : 'lg:pb-1'}`}
            >
              {body}
            </p>
          </div>
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
    <section className="bg-forest-900 text-ivory">
      <div className="shell">
        <div className="grid items-end gap-10 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-8">
            <SectionMarker label="Next step" tone="light" index="—" />
            <h2 className="mt-6 max-w-3xl font-display text-display-md text-ivory">{title}</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/60">{body}</p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Link to={ctaTo} className="group inline-flex items-center gap-4 bg-ivory px-8 py-5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-forest-950 transition-all duration-500 ease-editorial hover:gap-6 hover:bg-white">
              Request a Quote
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
