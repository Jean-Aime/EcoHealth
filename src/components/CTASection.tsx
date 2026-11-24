import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import { ArtImage, LineReveal, SectionMarker } from '@/components/motion';

/**
 * Closing statement. Deliberately asymmetric and, when photography is passed,
 * cinematic — never a generic centred call-to-action block.
 */
export function CTASection({
  eyebrow,
  headline,
  headlineLines,
  body,
  ctaLabel,
  ctaTo = '/contact',
  variant = 'dark',
  image,
  imageAlt,
  secondaryTo,
  secondaryLabel,
  compact = false,
  pinned = false,
}: {
  eyebrow?: string;
  headline: string;
  headlineLines?: string[];
  body: string;
  ctaLabel: string;
  ctaTo?: string;
  variant?: 'dark' | 'light' | 'forest';
  image?: string;
  imageAlt?: string;
  secondaryTo?: string;
  secondaryLabel?: string;
  compact?: boolean;
  pinned?: boolean;
}) {
  const dark = variant !== 'light';
  const bg = dark ? (variant === 'forest' ? 'bg-forest-900' : 'bg-charcoal') : 'bg-ivory';

  const section = (
    <section
      className={`relative isolate overflow-hidden ${
        pinned ? 'sticky top-0 z-10 h-[84svh] sm:h-[80svh] lg:h-[76svh]' : ''
      } ${bg} ${
        dark ? 'text-ivory' : 'text-charcoal'
      }`}
    >
      {image && (
        <>
          <ArtImage
            src={image}
            alt={imageAlt ?? ''}
            sizes="100vw"
            width={1920}
            height={1080}
            parallax={pinned ? 0 : 30}
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/85 to-forest-950/35" />
        </>
      )}

      {!image && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -right-24 -top-16 select-none font-display text-[22rem] leading-none ${
            dark ? 'text-white/[0.035]' : 'text-charcoal/[0.035]'
          }`}
        >
          EH
        </div>
      )}

      <div className={`shell relative z-10 ${pinned ? 'flex h-full items-center' : ''}`}>
        <div
          className={`grid gap-12 ${
            pinned ? 'py-4 sm:py-6 lg:py-8' : compact ? 'section-space' : 'py-24 lg:py-32'
          } lg:grid-cols-12 lg:items-end`}
        >
          <div className="lg:col-span-8">
            <SectionMarker label={eyebrow ?? 'Start a conversation'} tone={dark ? 'light' : 'dark'} index="—" />
            <h2 className={`mt-7 max-w-4xl font-display text-display-lg ${dark ? 'text-ivory' : 'text-charcoal'}`}>
              {headlineLines ? <LineReveal lines={headlineLines} /> : headline}
            </h2>
            <p className={`mt-6 max-w-xl text-base leading-relaxed ${dark ? 'text-ivory/65' : 'text-muted'}`}>{body}</p>
          </div>

          <div className="lg:col-span-4 lg:justify-self-end">
            <div className="flex flex-col items-start gap-5">
              <Link
                to={ctaTo}
                className={`group inline-flex items-center gap-4 px-8 py-5 text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 ease-editorial hover:gap-6 ${
                  dark
                    ? 'bg-ivory text-forest-950 hover:bg-white'
                    : 'bg-forest-700 text-ivory hover:bg-forest-950'
                }`}
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              {secondaryTo && secondaryLabel && (
                <Link
                  to={secondaryTo}
                  className={`link-underline text-[10.5px] font-semibold uppercase tracking-[0.18em] ${
                    dark ? 'text-ivory/70 hover:text-ivory' : 'text-muted hover:text-charcoal'
                  }`}
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return pinned ? <div className="relative h-[145svh] sm:h-[135svh] lg:h-[128svh]">{section}</div> : section;
}
