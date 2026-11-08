import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { navItems } from '@/data/content';
import { Logo } from '@/components/Logo';

const serviceLinks = [
  { slug: 'ehs-consultancy', label: 'EHS Consultancy & Compliance' },
  { slug: 'environmental-management', label: 'Environmental Management' },
  { slug: 'training-capacity-building', label: 'Training & Capacity Building' },
  { slug: 'telecommunications-field-support', label: 'Telecom & Field Support' },
  { slug: 'transport-fleet-safety', label: 'Transport & Fleet Safety' },
  { slug: 'waste-management', label: 'Waste & E-Waste Solutions' },
];

export function Header({ currentPath, overDarkHero }: { currentPath: string; overDarkHero: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  const light = overDarkHero && !scrolled && !menuOpen;

  const isActive = (path: string) => (path === '/' ? currentPath === '/' : currentPath.startsWith(path));

  const linkTone = (active: boolean) =>
    active
      ? light
        ? 'text-white'
        : 'text-forest-700'
      : light
        ? 'text-white/80 hover:text-white'
        : 'text-charcoal hover:text-forest-700';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-elegant ${
          scrolled ? 'border-b border-charcoal/10 bg-ivory/95 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-8xl items-center justify-between px-6 py-4 lg:px-10 lg:py-5">
          <Link to="/" className="flex items-center gap-3">
            <Logo tone={light ? 'light' : 'dark'} size="sm" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) =>
              item.label === 'Services' ? (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                  onFocus={() => setServicesOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false);
                  }}
                >
                  <Link
                    to={item.path}
                    className={`block px-4 py-2 text-sm font-medium transition-colors duration-300 ${linkTone(
                      isActive(item.path),
                    )}`}
                  >
                    {item.label}
                  </Link>
                  <div
                    className={`absolute left-0 top-full pt-3 transition-all duration-300 ease-elegant ${
                      servicesOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                    }`}
                  >
                    <div className="w-80 border border-charcoal/10 bg-ivory p-2 shadow-xl shadow-charcoal/5">
                      {serviceLinks.map((service) => (
                        <Link
                          key={service.slug}
                          to={`/services/${service.slug}`}
                          className="block border-l-2 border-transparent px-4 py-3 text-sm text-charcoal transition-all duration-300 hover:border-forest-600 hover:bg-sage-light hover:text-forest-700"
                        >
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-300 ${linkTone(
                    isActive(item.path),
                  )}`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden lg:flex">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 bg-forest-600 px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-white transition-all duration-500 ease-elegant hover:gap-3 hover:bg-forest-800"
            >
              Request a Quote
              <ArrowRight className="h-4 w-4" />
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
      </header>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-charcoal/40 transition-opacity duration-500 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="mobile-menu"
          aria-label="Site menu"
          className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-ivory transition-transform duration-500 ease-elegant ${
            menuOpen ? 'visible translate-x-0' : 'invisible translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5">
            <Logo size="sm" />
            <button
              ref={closeButtonRef}
              className="flex h-10 w-10 items-center justify-center text-charcoal"
              onClick={() => {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-charcoal/5 py-3.5 text-base font-medium transition-colors ${
                  isActive(item.path) ? 'text-forest-700' : 'text-charcoal hover:text-forest-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <p className="mt-6 text-xs font-medium uppercase tracking-widest text-muted">Services</p>
            <div className="mt-2 flex flex-col">
              {serviceLinks.map((service) => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-sm text-charcoal-light transition-colors hover:text-forest-700"
                >
                  {service.label}
                </Link>
              ))}
            </div>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-8 inline-flex items-center justify-center gap-2 bg-forest-600 px-6 py-3.5 text-sm font-medium uppercase tracking-wider text-white"
            >
              Request a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
