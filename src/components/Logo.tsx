interface LogoProps {
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface BrandLogoProps {
  alt: string;
  onDarkBackground?: boolean;
  className?: string;
}

export function BrandLogo({ alt, onDarkBackground = false, className = '' }: BrandLogoProps) {
  return (
    <img
      src="/logp.png"
      alt={alt}
      className={`block w-auto object-contain ${className} ${onDarkBackground ? 'brightness-0 invert' : ''}`}
    />
  );
}

/** Legacy mark retained for admin branding; public pages use the supplied horizontal logo asset. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="20" cy="20" r="13.4" stroke="currentColor" strokeOpacity="0.32" strokeWidth="0.9" />
      <path
        d="M28.8 11.2c.6 7.2-3.9 13.4-11.3 14.9-1.9.4-3.8.4-5.1.1-.6-7.9 5.4-15.3 16.4-15Z"
        fill="currentColor"
      />
      <path
        d="M12.2 29c2.4-6 6.3-10.9 11.6-14.2"
        stroke="#176B32"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
    </svg>
  );
}

export function Logo({ tone = 'dark', size = 'md', className = '' }: LogoProps) {
  const tile = size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const mark = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const word = size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base';
  const sub = size === 'lg' ? 'text-[10px]' : 'text-[9px]';

  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className={`flex ${tile} flex-shrink-0 items-center justify-center bg-forest-600 text-white`}>
        <LogoMark className={mark} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display ${word} font-bold tracking-tight ${
            tone === 'light' ? 'text-white' : 'text-charcoal'
          }`}
        >
          EcoHealth
        </span>
        <span
          className={`mt-1 ${sub} uppercase tracking-[0.18em] ${
            tone === 'light' ? 'text-sage-dark' : 'text-muted'
          }`}
        >
          Transport Solutions
        </span>
      </span>
    </span>
  );
}
