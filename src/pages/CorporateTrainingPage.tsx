import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from '@/lib/router';
import { PageHero } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { Notice } from '@/components/admin/AdminUI';
import { submitCorporateTrainingRequest } from '@/lib/training';

const fieldClass =
  'mt-2 w-full border border-charcoal/20 bg-white px-3 py-3 text-sm text-charcoal focus:border-forest-600 focus:outline-none';

export function CorporateTrainingPage() {
  const [values, setValues] = useState({
    organisation: '',
    contact_name: '',
    email: '',
    telephone: '',
    requirements: '',
    participant_estimate: '1',
    preferred_dates: '',
    location: '',
    additional_information: '',
  });
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof typeof values, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (honeypot) {
      setSubmitted(true);
      return;
    }
    if (!consent) {
      setError('Please confirm the privacy notice before submitting.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await submitCorporateTrainingRequest({
      ...values,
      participant_estimate: Number(values.participant_estimate),
      consent,
    });
    setSaving(false);
    if (result) {
      setError(result);
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Corporate Training Request | EcoHealth & Transport Solutions Ltd"
        description="Request tailored workplace training for your organisation. Share participant numbers, requirements, preferred dates and location."
        path="/training/corporate"
      />
      <PageHero
        eyebrow="Corporate training"
        title="Build a programme around your team's work."
        titleLines={['Build a programme', 'around your team’s', 'work.']}
        subtitle="Share your training requirements and preferred arrangements. EcoHealth staff will review the request and follow up on scope, availability and pricing."
        image="https://images.pexels.com/photos/8761547/pexels-photo-8761547.jpeg?auto=compress&cs=tinysrgb&w=1400"
        imageAlt="Professionals attending a training session"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Training', path: '/training' },
          { label: 'Corporate request' },
        ]}
        index="03"
        meta={['Organisation request', 'Preferred dates', 'Scoped response']}
      />

      <section className="bg-ivory section-space">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow">Training requirements</p>
            <h2 className="mt-4 font-display text-display-sm text-charcoal">Tell us what your team needs.</h2>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              This request is an enquiry, not a confirmed booking. Session availability, trainer arrangements, course
              scope, credentials and price are confirmed by EcoHealth before anything is published or agreed.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Looking for an open session?{' '}
              <Link to="/training" className="text-forest-700 link-underline">Browse the course catalogue</Link>.
            </p>
          </div>

          <div className="lg:col-span-8">
            {submitted ? (
              <div className="border-t-2 border-forest-600 bg-sage-light p-8 sm:p-10" role="status">
                <CheckCircle2 className="h-8 w-8 text-forest-700" />
                <h2 className="mt-5 font-display text-2xl font-medium text-charcoal">Request received.</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal-light">
                  The training team will review your requirements and follow up using the contact details provided.
                </p>
                <Link to="/training" className="mt-6 inline-flex items-center gap-2 text-sm text-forest-700 link-underline">
                  Return to the training catalogue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-charcoal/15 bg-paper p-6 sm:p-10">
                {error && <div className="mb-6"><Notice tone="error">{error}</Notice></div>}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Organisation *">
                    <input required maxLength={160} value={values.organisation} onChange={(event) => update('organisation', event.target.value)} className={fieldClass} />
                  </Field>
                  <Field label="Contact person *">
                    <input required maxLength={120} autoComplete="name" value={values.contact_name} onChange={(event) => update('contact_name', event.target.value)} className={fieldClass} />
                  </Field>
                  <Field label="Email *">
                    <input required type="email" maxLength={254} autoComplete="email" value={values.email} onChange={(event) => update('email', event.target.value)} className={fieldClass} />
                  </Field>
                  <Field label="Telephone">
                    <input type="tel" maxLength={30} autoComplete="tel" value={values.telephone} onChange={(event) => update('telephone', event.target.value)} className={fieldClass} />
                  </Field>
                  <Field label="Estimated participants *">
                    <input required type="number" min={1} max={10000} step={1} value={values.participant_estimate} onChange={(event) => update('participant_estimate', event.target.value)} className={fieldClass} />
                  </Field>
                  <Field label="Preferred dates or period">
                    <input maxLength={500} placeholder="e.g. June or selected dates" value={values.preferred_dates} onChange={(event) => update('preferred_dates', event.target.value)} className={fieldClass} />
                  </Field>
                  <Field label="Preferred location">
                    <input maxLength={160} value={values.location} onChange={(event) => update('location', event.target.value)} className={fieldClass} />
                  </Field>
                  <Field label="Training requirements *" className="sm:col-span-2">
                    <textarea required minLength={20} maxLength={4000} rows={5} value={values.requirements} onChange={(event) => update('requirements', event.target.value)} className={fieldClass} />
                  </Field>
                  <Field label="Additional information" className="sm:col-span-2">
                    <textarea maxLength={2000} rows={3} value={values.additional_information} onChange={(event) => update('additional_information', event.target.value)} className={fieldClass} />
                  </Field>
                </div>

                <div className="hidden" aria-hidden="true">
                  <label>
                    Leave this field empty
                    <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
                  </label>
                </div>

                <label className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-charcoal-light">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />
                  <span>
                    I agree that EcoHealth may process these details to review and respond to this training request.
                    See the <Link to="/privacy" className="text-forest-700 link-underline">Privacy Policy</Link>.
                  </span>
                </label>

                <button type="submit" disabled={saving} className="btn-primary mt-7 disabled:opacity-60">
                  {saving ? 'Submitting…' : 'Submit corporate training request'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-xs font-medium uppercase tracking-widest text-charcoal-light ${className}`}>
      {label}
      {children}
    </label>
  );
}
