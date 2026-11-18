import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { useReveal } from '@/lib/useReveal';
import { useParallax } from '@/lib/useParallax';
import { SmartImage } from '@/components/SmartImage';

/**
 * Editorial headline that rises line by line from behind a mask.
 *
 * Pass short, deliberately broken lines. The surrounding h1/h2 supplies the
 * semantic heading; this renders spans only.
 */
export function LineReveal({
  lines,
  className = '',
  delay = 0,
}: {
  lines: string[];
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLSpanElement>();

  return (
    <span ref={ref} className={`line-reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="line">
          <span style={{ transitionDelay: `${delay + index * 85}ms` }}>{line}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * Art-directed image: cropped reveal, gentle scroll depth and a slow hover
 * settle. The wrapper owns the aspect ratio; the photograph is always cropped,
 * never stretched.
 */
export function ArtImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
  sizes,
  width = 1600,
  height = 1000,
  parallax = 0,
  overlay,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  parallax?: number;
  overlay?: React.ReactNode;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const innerRef = useParallax<HTMLDivElement>(parallax);

  return (
    <div ref={ref} className={`art-image ${visible ? 'is-visible' : ''} ${className}`}>
      <div ref={innerRef} className="art-image__inner">
        <SmartImage
          src={src}
          alt={alt}
          priority={priority}
          sizes={sizes}
          width={width}
          height={height}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      </div>
      {overlay}
    </div>
  );
}

/** Small compositional label: 03 — CAPABILITIES */
export function SectionMarker({
  index,
  label,
  tone = 'dark',
  className = '',
}: {
  index?: string;
  label: string;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const color = tone === 'light' ? 'text-ivory/70' : 'text-forest-700';
  const line = tone === 'light' ? 'bg-ivory/30' : 'bg-forest-700/40';

  return (
    <span className={`inline-flex items-center gap-3 ${color} ${className}`}>
      {index && <span className="text-[10px] font-semibold tabular-nums tracking-[0.18em]">{index}</span>}
      <span className={`h-px w-6 ${line}`} aria-hidden="true" />
      <span className="text-[10px] font-semibold uppercase tracking-editorial">{label}</span>
    </span>
  );
}

/** Text link with a drawn underline and a travelling arrow. */
export function ArrowLink({
  to,
  children,
  tone = 'dark',
  className = '',
  external = false,
}: {
  to: string;
  children: React.ReactNode;
  tone?: 'dark' | 'light' | 'forest';
  className?: string;
  external?: boolean;
}) {
  const color = tone === 'light' ? 'text-ivory' : tone === 'forest' ? 'text-forest-700' : 'text-charcoal';
  const classes = `group link-arrow ${color} ${className}`;

  if (external) {
    return (
      <a href={to} className={classes} target="_blank" rel="noopener noreferrer">
        <span className="link-underline">{children}</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-1" />
      </a>
    );
  }

  return (
    <Link to={to} className={classes}>
      <span className="link-underline">{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * Scroll-linked figure counter. Purely presentational: no invented figures,
 * callers pass counts that already exist in the content.
 */
export function Figure({
  value,
  label,
  tone = 'dark',
}: {
  value: string;
  label: string;
  tone?: 'dark' | 'light';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { ref: revealRef, visible } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={tone === 'light' ? 'text-ivory' : 'text-charcoal'}>
      <div
        ref={revealRef}
        className={`font-display text-4xl font-light tabular-nums tracking-tight transition-all duration-700 ease-editorial sm:text-5xl ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        {value}
      </div>
      <p
        className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${
          tone === 'light' ? 'text-ivory/50' : 'text-muted'
        }`}
      >
        {label}
      </p>
    </div>
  );
}
