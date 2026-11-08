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
      <section className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <div className="text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-4 font-display text-display-md text-charcoal">This page could not be found.</h1>
          <Link to="/" className="btn-primary mt-10">
            Back to home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
