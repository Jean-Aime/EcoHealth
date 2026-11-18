import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { navItems } from '@/data/content';
import { Logo } from '@/components/Logo';

const serviceLinks = [
  { slug: 'ehs-consultancy', label: 'EHS Consultancy & Compliance', index: '01' },
  { slug: 'environmental-management', label: 'Environmental Management', index: '02' },
  { slug: 'training-capacity-building', label: 'Training & Capacity Building', index: '03' },
  { slug: 'telecommunications-field-support', label: 'Telecom & Field Support', index: '04' },
  { slug: 'transport-fleet-safety', label: 'Transport & Fleet Safety', index: '05' },
  { slug: 'waste-management', label: 'Waste & E-Waste Solutions', index: '06' },
];

export function Header({ currentPath, overDarkHero }: { currentPath: string; overDarkHero: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

      setScrolled(scrollTop > 24);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const solid = scrolled || !overDarkHero;
  const light = !solid && !menuOpen;
  // Below desktop the home hero is a framed card, so its nav sits inside the frame rather than on the page edge.
  const framedHero = light && currentPath === '/';
  const isActive = (path: string) => (path === '/' ? currentPath === '/' : currentPath.startsWith(path));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-editorial ${
          framedHero ? 'pt-4 sm:pt-6 lg:pt-0' : ''
        } ${
          solid
            ? 'border-b border-charcoal/10 bg-ivory/90 backdrop-blur-xl'
            : 'border-b border-white/10 bg-transparent'
        }`}
      >
        <div className="shell flex items-center justify-between gap-6 py-4 lg:py-5">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="EcoHealth & Transport Solutions Ltd — home">
            <Logo tone={light ? 'light' : 'dark'} size="sm" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.path);

              if (item.label === 'Services') {
                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                    onFocus={() => setServicesOpen(true)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) setServicesOpen(false);
                    }}
                  >
                    <Link
                      to={item.path}
                      className={`relative flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium tracking-tight transition-colors duration-300 ${
                        active || servicesOpen
                          ? light
                            ? 'text-white'
                            : 'text-forest-800'
                          : light
                            ? 'text-white/70 hover:text-white'
                            : 'text-charcoal-light hover:text-charcoal'
                      }`}
                    >
                      Services
                      <span
                        aria-hidden="true"
                        className={`h-1 w-1 rounded-full transition-all duration-300 ${
                          active ? 'bg-emerald-accent' : 'bg-transparent'
                        }`}
                      />
                    </Link>

                    <div
                      className={`absolute left-1/2 top-full w-[36rem] -translate-x-1/2 pt-4 transition-all duration-500 ease-editorial ${
                        servicesOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                      }`}
                    >
                      <div className="border border-charcoal/10 bg-ivory shadow-[0_40px_100px_-50px_rgba(11,53,34,0.55)]">
                        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-3.5">
                          <p className="text-[9.5px] font-semibold uppercase tracking-editorial text-forest-700">
                            Six integrated disciplines
                          </p>
                          <span className="text-[9.5px] uppercase tracking-[0.16em] text-muted">Rwanda</span>
                        </div>
                        <div className="grid grid-cols-2">
                          {serviceLinks.map((service) => (
                            <Link
                              key={service.slug}
                              to={`/services/${service.slug}`}
                              className="group flex items-start gap-3 border-b border-r border-charcoal/[0.07] px-5 py-4 transition-colors duration-300 hover:bg-sage-light"
                            >
                              <span className="mt-0.5 text-[9.5px] font-semibold tabular-nums text-forest-600/70">
                                {service.index}
                              </span>
                              <span className="text-[13px] leading-snug text-charcoal-light transition-colors group-hover:text-forest-800">
                                {service.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                          <p className="text-xs text-muted">Tailored to your project risk profile.</p>
                          <Link
                            to="/services"
                            className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800"
                          >
                            <span className="link-underline">All services</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium tracking-tight transition-colors duration-300 ${
                    active
                      ? light
                        ? 'text-white'
                        : 'text-forest-800'
                      : light
                        ? 'text-white/70 hover:text-white'
                        : 'text-charcoal-light hover:text-charcoal'
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`h-1 w-1 rounded-full transition-all duration-300 ${
                      active ? 'bg-emerald-accent' : 'bg-transparent'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link
              to="/contact"
              className={`group hidden items-center gap-3 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-500 ease-editorial xl:inline-flex ${
                light
                  ? 'border border-white/30 text-white hover:bg-white hover:text-forest-950'
                  : 'bg-forest-700 text-ivory hover:bg-forest-950'
              }`}
            >
              Request a quote
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            className={`flex h-10 w-10 items-center justify-center lg:hidden ${light ? 'text-white' : 'text-charcoal'}`}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className={`absolute inset-x-0 bottom-0 h-px ${light ? 'bg-white/15' : 'bg-charcoal/10'}`} aria-hidden="true">
          <div
            ref={progressRef}
            className={`h-px origin-left scale-x-0 ${light ? 'bg-ivory/70' : 'bg-forest-600'}`}
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-forest-950/50 backdrop-blur-sm transition-opacity duration-500 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className={`absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col bg-forest-950 text-ivory transition-transform duration-700 ease-editorial ${
            menuOpen ? 'visible translate-x-0' : 'invisible translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <Logo tone="light" size="sm" />
            <button
              ref={closeButtonRef}
              className="flex h-10 w-10 items-center justify-center text-ivory"
              onClick={() => {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex flex-1 flex-col overflow-y-auto px-6 pb-10 pt-4">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`group flex items-baseline justify-between border-b border-white/10 py-4 transition-colors ${
                  isActive(item.path) ? 'text-white' : 'text-ivory/75 hover:text-white'
                }`}
              >
                <span className="font-display text-2xl font-light tracking-tight">{item.label}</span>
                <span className="text-[9px] tabular-nums tracking-[0.2em] text-ivory/35">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </Link>
            ))}

            <p className="mt-8 text-[9.5px] font-semibold uppercase tracking-editorial text-sage-dark">Services</p>
            <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {serviceLinks.map((service) => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-start gap-2.5 border-b border-white/[0.07] py-2.5 text-[12.5px] text-ivory/65 transition-colors hover:text-white"
                >
                  <span className="mt-0.5 text-[9px] tabular-nums text-ivory/30">{service.index}</span>
                  {service.label}
                </Link>
              ))}
            </div>

            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-8 inline-flex items-center justify-between gap-3 bg-ivory px-6 py-4 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-forest-950"
            >
              Request a quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
