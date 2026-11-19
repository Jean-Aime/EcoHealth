import { useEffect, useState } from 'react';
import { Printer, ShieldCheck, ShieldX } from 'lucide-react';
import { navigate } from '@/lib/router';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/PageHero';
import { verifyTrainingCertificate, type VerifiedTrainingCertificate } from '@/lib/training';

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CertificateVerificationPage({ code }: { code: string }) {
  const [certificate, setCertificate] = useState<VerifiedTrainingCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState(code);

  useEffect(() => {
    let active = true;
    setReference(code);
    setError(null);
    if (!code) {
      setLoading(false);
      setCertificate(null);
      return () => {
        active = false;
      };
    }
    if (!/^[a-z0-9-]{5,80}$/i.test(code)) {
      setLoading(false);
      setCertificate(null);
      return () => {
        active = false;
      };
    }
    verifyTrainingCertificate(code).then((result) => {
      if (!active) return;
      setCertificate(result.data);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [code]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = reference.trim();
    if (!/^[a-z0-9-]{5,80}$/i.test(value)) {
      setError('Enter the certificate reference or verification code.');
      return;
    }
    navigate(`/certificates/verify/${encodeURIComponent(value)}`);
  };

  return (
    <>
      <SEO
        title="Verify a Training Certificate | EcoHealth"
        description="Check an EcoHealth training certificate against the official certificate verification record."
        path="/certificates/verify"
        noIndex
      />
      <main className="min-h-[70svh] bg-ivory pb-20 pt-36 lg:pb-28 lg:pt-44">
        <div className="shell max-w-4xl">
          <Breadcrumb
            breadcrumb={[
              { label: 'Home', path: '/' },
              { label: 'Training', path: '/training' },
              { label: 'Certificate verification' },
            ]}
            tone="dark"
          />
          <p className="eyebrow mt-10">Certificate verification</p>
          <h1 className="mt-4 font-display text-display-lg text-charcoal">Check this training record.</h1>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 border border-charcoal/15 bg-paper p-5 sm:flex-row">
            <label className="flex-1 text-xs font-medium uppercase tracking-widest text-charcoal-light">
              Certificate reference or verification code
              <input
                required
                maxLength={80}
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                className="mt-2 w-full border border-charcoal/20 bg-white px-3 py-3 text-sm text-charcoal focus:border-forest-600 focus:outline-none"
              />
            </label>
            <button type="submit" className="btn-primary self-end">
              Verify certificate
            </button>
          </form>

          {loading ? (
            <p role="status" className="mt-8 text-sm text-muted">Checking the certificate registry…</p>
          ) : error ? (
            <p role="alert" className="mt-8 border border-red-700/25 bg-red-50 p-5 text-sm text-red-800">{error}</p>
          ) : !code ? null : !certificate ? (
            <div className="mt-8 flex gap-4 border border-charcoal/15 bg-paper p-6">
              <ShieldX className="h-6 w-6 shrink-0 text-red-700" />
              <div>
                <h2 className="font-display text-xl font-medium text-charcoal">No matching record found.</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Check the verification reference and try again. This page does not confirm certificates that are not
                  present in the EcoHealth registry.
                </p>
              </div>
            </div>
          ) : (
            <article className={`mt-8 border bg-paper p-8 sm:p-12 ${certificate.verified ? 'border-forest-700/30' : 'border-red-700/30'}`}>
              <div className="flex flex-wrap items-center justify-between gap-5 border-b border-charcoal/15 pb-6">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-forest-700">{certificate.issuer_organisation}</p>
                  <h2 className="mt-3 font-display text-3xl font-light text-charcoal">Training certificate</h2>
                </div>
                {certificate.verified ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-forest-800">
                    <ShieldCheck className="h-5 w-5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-red-800">
                    <ShieldX className="h-5 w-5" /> Revoked
                  </span>
                )}
              </div>
              <p className="mt-8 text-sm text-muted">This confirms that</p>
              <p className="mt-2 font-display text-3xl font-medium text-charcoal">{certificate.participant_name}</p>
              <p className="mt-6 text-sm text-muted">has a training completion record for</p>
              <p className="mt-2 font-display text-2xl font-medium text-forest-800">{certificate.course_title}</p>

              <dl className="mt-8 grid gap-5 border-t border-charcoal/15 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Completion date</dt>
                  <dd className="mt-1 text-sm text-charcoal">{formatDate(certificate.completion_date)}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Certificate reference</dt>
                  <dd className="mt-1 break-all font-mono text-sm text-charcoal">{certificate.certificate_number}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Issued by</dt>
                  <dd className="mt-1 text-sm text-charcoal">{certificate.issuer_name}, {certificate.issuer_title}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Record issued</dt>
                  <dd className="mt-1 text-sm text-charcoal">{new Date(certificate.issued_at).toLocaleDateString('en-GB')}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Public verification link</dt>
                  <dd className="mt-1 break-all text-sm text-forest-700">
                    <a href={`${window.location.origin}/certificates/verify/${encodeURIComponent(code)}`}>
                      {`${window.location.origin}/certificates/verify/${code}`}
                    </a>
                  </dd>
                </div>
              </dl>
              {certificate.verified && (
                <button type="button" onClick={() => window.print()} className="btn-primary mt-8 print:hidden">
                  <Printer className="h-4 w-4" />
                  Print certificate
                </button>
              )}
            </article>
          )}
        </div>
      </main>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          article, article * { visibility: visible; }
          article { position: absolute; inset: 0; width: 100%; border: 0; }
        }
      `}</style>
    </>
  );
}
