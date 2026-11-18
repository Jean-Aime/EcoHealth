import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { SEO } from '@/components/SEO';

export function NotFoundPage() {
  return (
    <>
      <SEO
        title="Page Not Found | EcoHealth & Transport Solutions Ltd"
        description="The page you are looking for could not be found."
        path="/404"
        noIndex
      />

      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest-950 pb-16 pt-32 text-ivory">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-24 select-none font-display text-[34vw] font-light leading-none text-white/[0.04] sm:top-10"
        >
          404
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <div className="h-full w-full hairline-grid" />
        </div>

        <div className="shell relative z-10">
          <div className="flex items-center gap-4 text-[9.5px] font-semibold uppercase tracking-editorial text-ivory/45">
            <span className="text-emerald-accent">404</span>
            <span className="h-px w-8 bg-white/25" aria-hidden="true" />
            <span>Page not found</span>
          </div>

          <h1 className="mt-8 max-w-3xl font-display text-display-xl text-ivory">
            This page could not
            <br />
            be <span className="font-serif italic text-sage-light">found.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-ivory/60">
            The address may have changed, or the link may be incomplete. These are the best places to continue.
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link to="/" className="btn-solid-light">
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services" className="btn-light">
              Explore services
            </Link>
            <Link to="/contact" className="btn-light">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
