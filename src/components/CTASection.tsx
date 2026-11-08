import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';

export function CTASection({
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaTo = '/contact',
  variant = 'dark',
}: {
  eyebrow?: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaTo?: string;
  variant?: 'dark' | 'light' | 'forest';
}) {
  const bg =
    variant === 'dark'
      ? 'bg-charcoal text-ivory'
      : variant === 'forest'
        ? 'bg-forest-800 text-ivory'
        : 'bg-ivory text-charcoal border-t border-charcoal/10';

  const ctaClass =
    variant === 'light'
      ? 'inline-flex items-center gap-2 bg-forest-600 px-7 py-3.5 text-sm font-medium uppercase tracking-wider text-white transition-all duration-500 ease-elegant hover:bg-forest-800 hover:gap-3'
      : 'inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 text-sm font-medium uppercase tracking-wider text-white transition-all duration-500 ease-elegant hover:border-white hover:bg-white hover:text-charcoal hover:gap-3';

  return (
    <section className={`${bg} grain-overlay`}>
      <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <p className={`eyebrow ${variant === 'light' ? 'text-forest-600' : 'text-sage-dark'}`}>
              {eyebrow}
            </p>
          )}
          <h2 className="mt-5 font-display text-display-md text-balance">
            {headline}
          </h2>
          <p className={`mt-6 text-lg leading-relaxed ${variant === 'light' ? 'text-muted' : 'text-ivory/70'}`}>
            {body}
          </p>
          <div className="mt-10">
            <Link to={ctaTo} className={ctaClass}>
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
