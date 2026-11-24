import { Link } from '@/lib/router';
import { ArrowRight, Linkedin } from 'lucide-react';
import { company, footerNav } from '@/data/content';
import { useSiteSettings } from '@/lib/cms';
import { BrandLogo } from '@/components/Logo';

export function Footer({ overlapsPinnedCta = false }: { overlapsPinnedCta?: boolean }) {
  const settings = useSiteSettings();

  return (
    <footer
      className={`relative z-20 overflow-hidden bg-forest-950 text-ivory ${
        overlapsPinnedCta ? '-mt-[100svh]' : ''
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true">
        <div className="h-full w-full hairline-grid" />
      </div>

      <div className="shell relative">
        <div className="grid gap-14 pb-16 pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-24">
          <div className="lg:col-span-5">
            <BrandLogo
              alt="EcoHealth & Transport Solutions Ltd"
              onDarkBackground
              className="h-20 sm:h-24"
            />
            <p className="mt-8 max-w-sm font-serif text-2xl italic leading-snug text-sage-light lg:text-[1.75rem]">
              {company.tagline}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/55">
              EHS consultancy, transport and logistics, PPE supply, rigging and lifting services, and professional
              safety training for projects in {company.country}.
            </p>
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2.5 border border-white/15 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:border-ivory/50 hover:text-ivory"
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
          </div>

          <div className="lg:col-span-2 lg:col-start-7">
            <h2 className="text-[9.5px] font-semibold uppercase tracking-editorial text-sage-dark">Company</h2>
            <ul className="mt-5 space-y-3">
              {footerNav[0].links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="link-underline text-sm text-ivory/60 transition-colors hover:text-ivory">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-[9.5px] font-semibold uppercase tracking-editorial text-sage-dark">Services</h2>
            <ul className="mt-5 space-y-3">
              {footerNav[1].links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="link-underline text-sm text-ivory/60 transition-colors hover:text-ivory">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 py-8 lg:flex-row lg:items-center">
          <p className="max-w-lg font-display text-xl font-light leading-snug text-ivory">
            Ready to discuss your project requirements?
          </p>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-4 border border-white/25 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory transition-all duration-500 ease-editorial hover:gap-6 hover:border-ivory hover:bg-ivory hover:text-forest-950"
          >
            Start a conversation
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-7 text-[10.5px] uppercase tracking-[0.14em] text-ivory/40 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {company.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="link-underline hover:text-ivory">
              Privacy
            </Link>
            <span className="text-ivory/20">|</span>
            <span>Rwanda</span>
            <span className="text-ivory/20">|</span>
            <Link to="/admin" className="link-underline hover:text-ivory">
              Staff login
            </Link>
          </div>
        </div>

        <div className="select-none overflow-hidden pb-6" aria-hidden="true">
          <p className="whitespace-nowrap font-display text-[clamp(3.5rem,14vw,12rem)] font-light leading-[0.75] tracking-[-0.05em] text-white/[0.06]">
            EcoHealth
          </p>
        </div>
      </div>
    </footer>
  );
}
