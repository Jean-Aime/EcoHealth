import { Link } from '@/lib/router';
import { ArrowRight, Download, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { company, footerNav } from '@/data/content';
import { useSiteSettings } from '@/lib/cms';
import { Logo } from '@/components/Logo';

export function Footer() {
  const settings = useSiteSettings();
  const hasContact = Boolean(settings.email || settings.phone || settings.address);

  return (
    <footer className="bg-forest-800 text-ivory">
      <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Logo tone="light" size="md" />
            <p className="mt-8 max-w-md font-serif text-lg italic leading-relaxed text-sage-light">
              {company.tagline}
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/60">
              EHS consultancy, environmental management, workforce training, technical field support, and transport
              safety solutions for businesses and projects in {company.country}.
            </p>
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm text-ivory/70 transition-colors hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xs font-medium uppercase tracking-widest text-sage-dark">Company</h2>
            <ul className="mt-6 space-y-3">
              {footerNav[0].links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="link-underline text-sm text-ivory/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-medium uppercase tracking-widest text-sage-dark">Services</h2>
            <ul className="mt-6 space-y-3">
              {footerNav[1].links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="link-underline text-sm text-ivory/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-medium uppercase tracking-widest text-sage-dark">Contact</h2>
            <ul className="mt-6 space-y-4 text-sm text-ivory/70">
              {settings.email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest-400" />
                  <a href={`mailto:${settings.email}`} className="break-all link-underline hover:text-white">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest-400" />
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="link-underline hover:text-white"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest-400" />
                <span>{settings.address || 'Rwanda — serving projects regionally'}</span>
              </li>
            </ul>

            {settings.companyProfileUrl ? (
              <a
                href={settings.companyProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 border border-white/25 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white hover:text-forest-800"
              >
                <Download className="h-3.5 w-3.5" />
                {settings.companyProfileLabel || 'Company profile'}
              </a>
            ) : (
              <Link
                to="/partners"
                className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-sage-light hover:text-white"
              >
                <span className="link-underline">Request company profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            {!hasContact && (
              <p className="mt-6 text-xs leading-relaxed text-ivory/40">
                All enquiries are handled through the request form and answered directly by our team.
              </p>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 lg:flex-row lg:items-center">
          <p className="font-display text-xl text-white lg:text-2xl">Ready to discuss your project requirements?</p>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition-all duration-500 ease-elegant hover:border-white hover:bg-white hover:text-forest-800"
          >
            Start a Conversation
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-ivory/50 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="link-underline hover:text-white">
              Privacy Policy
            </Link>
            <span className="text-ivory/30">|</span>
            <span>Rwanda</span>
            <span className="text-ivory/30">|</span>
            <Link to="/admin" className="link-underline hover:text-white">
              Staff login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
