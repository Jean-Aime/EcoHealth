import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  emptyEnquiry,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryValues,
} from '@/lib/enquiryValidation';
import { services, trainingCourses } from '@/data/content';

export type EnquiryVariant = 'quote' | 'training' | 'partnership';

interface VariantConfig {
  enquiryType: EnquiryVariant;
  selectLabel: string;
  selectPlaceholder: string;
  locationLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  options: string[];
}

const VARIANTS: Record<EnquiryVariant, VariantConfig> = {
  quote: {
    enquiryType: 'quote',
    selectLabel: 'Service required *',
    selectPlaceholder: 'Select a service',
    locationLabel: 'Project location',
    descriptionLabel: 'Description of requirements *',
    descriptionPlaceholder: 'Scope, site context, timeline, and anything already in place.',
    submitLabel: 'Send enquiry',
    successTitle: 'Thank you. Your enquiry has been received.',
    successBody:
      'A member of the EcoHealth team will review your requirements and respond using your preferred contact method.',
    options: [
      ...services.map((service) => service.title),
      'Training enquiry',
      'Partnership or procurement',
      'Not sure yet',
    ],
  },
  training: {
    enquiryType: 'training',
    selectLabel: 'Course or programme *',
    selectPlaceholder: 'Select a course',
    locationLabel: 'Delivery location',
    descriptionLabel: 'Training objectives *',
    descriptionPlaceholder: 'Team size, roles, current capability, and the outcomes you need.',
    submitLabel: 'Submit training enquiry',
    successTitle: 'Thank you. Your training enquiry has been received.',
    successBody:
      'We will review your team, the risks involved, and your objectives, then come back with a programme outline and the details needed to proceed.',
    options: [...trainingCourses.map((course) => course.title), 'Custom programme'],
  },
  partnership: {
    enquiryType: 'partnership',
    selectLabel: 'Partnership type *',
    selectPlaceholder: 'Select an option',
    locationLabel: 'Location',
    descriptionLabel: 'How would you like to work together? *',
    descriptionPlaceholder: 'The project, tender, or scope you have in mind, and the role you need us to play.',
    submitLabel: 'Submit partnership enquiry',
    successTitle: 'Thank you. Your partnership enquiry has been received.',
    successBody:
      'Our team will review your requirements and respond with relevant capabilities, documentation, and next steps.',
    options: ['Subcontracting', 'Procurement / tender', 'Strategic partnership', 'Something else'],
  },
};

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const fieldClass =
  'w-full border-0 border-b border-charcoal/25 bg-transparent px-0 py-3 text-base text-charcoal placeholder:text-muted/70 transition-colors duration-300 focus:border-forest-600 focus:outline-none focus-visible:ring-0 aria-[invalid=true]:border-red-700';

function Field({
  label,
  error,
  id,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function EnquiryForm({
  variant = 'quote',
  initialService,
  className = '',
}: {
  variant?: EnquiryVariant;
  initialService?: string;
  className?: string;
}) {
  const config = VARIANTS[variant];
  const [values, setValues] = useState<EnquiryValues>({ ...emptyEnquiry });
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [state, setState] = useState<SubmitState>('idle');
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (!initialService) return;
    setValues((prev) => ({ ...prev, serviceRequired: initialService }));
    setErrors((prev) => ({ ...prev, serviceRequired: undefined }));
  }, [initialService]);

  const update = <K extends keyof EnquiryValues>(key: K, value: EnquiryValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Honeypot: real visitors never fill this hidden field.
    if (honeypot) {
      setState('success');
      return;
    }

    const found = validateEnquiry(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    if (!supabase) {
      setState('error');
      return;
    }

    setState('submitting');
    const { error } = await supabase.from('enquiries').insert({
      full_name: values.fullName.trim(),
      organisation: values.organisation.trim() || null,
      email: values.email.trim(),
      telephone: values.telephone.trim() || null,
      service_required: values.serviceRequired,
      project_location: values.projectLocation.trim() || null,
      description: values.description.trim(),
      preferred_contact: values.preferredContact,
      enquiry_type: config.enquiryType,
      consent: values.consent,
    });

    if (error) {
      setState('error');
      return;
    }

    setValues({ ...emptyEnquiry });
    setState('success');
  };

  if (state === 'success') {
    return (
      <div className={`flex flex-col items-start gap-5 border-t-2 border-forest-600 bg-sage-light p-10 ${className}`}>
        <CheckCircle2 className="h-8 w-8 text-forest-600" />
        <h3 className="font-display text-2xl font-semibold text-charcoal">{config.successTitle}</h3>
        <p className="text-base leading-relaxed text-charcoal-light text-pretty">{config.successBody}</p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="text-sm font-medium uppercase tracking-wider text-forest-700 link-underline"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  const submitting = state === 'submitting';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`space-y-10 ${className}`}
      aria-label={variant === 'training' ? 'Training enquiry' : variant === 'partnership' ? 'Partnership enquiry' : 'Request a quote'}
    >
      <div className="grid gap-10 sm:grid-cols-2">
        <Field label="Full name *" id="fullName" error={errors.fullName}>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            required
            className={fieldClass}
            value={values.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          />
        </Field>
        <Field label="Organisation" id="organisation">
          <input
            id="organisation"
            name="organisation"
            autoComplete="organization"
            className={fieldClass}
            value={values.organisation}
            onChange={(e) => update('organisation', e.target.value)}
          />
        </Field>
        <Field label="Business email *" id="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={fieldClass}
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>
        <Field label="Telephone" id="telephone" error={errors.telephone}>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            className={fieldClass}
            value={values.telephone}
            onChange={(e) => update('telephone', e.target.value)}
            aria-invalid={!!errors.telephone}
            aria-describedby={errors.telephone ? 'telephone-error' : undefined}
          />
        </Field>
        <Field
          label={config.selectLabel}
          id="serviceRequired"
          error={errors.serviceRequired}
          className="sm:col-span-2"
        >
          <select
            id="serviceRequired"
            name="serviceRequired"
            required
            className={`${fieldClass} appearance-none rounded-none`}
            value={values.serviceRequired}
            onChange={(e) => update('serviceRequired', e.target.value)}
            aria-invalid={!!errors.serviceRequired}
            aria-describedby={errors.serviceRequired ? 'serviceRequired-error' : undefined}
          >
            <option value="">{config.selectPlaceholder}</option>
            {config.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label={config.locationLabel} id="projectLocation" className="sm:col-span-2">
          <input
            id="projectLocation"
            name="projectLocation"
            className={fieldClass}
            placeholder="e.g. Kigali, Northern Province"
            value={values.projectLocation}
            onChange={(e) => update('projectLocation', e.target.value)}
          />
        </Field>
        <Field
          label={config.descriptionLabel}
          id="description"
          error={errors.description}
          className="sm:col-span-2"
        >
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            placeholder={config.descriptionPlaceholder}
            className={`${fieldClass} resize-y`}
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
          Preferred contact method
        </legend>
        <div className="mt-4 flex flex-wrap gap-6">
          {(['email', 'phone'] as const).map((method) => (
            <label key={method} className="flex cursor-pointer items-center gap-3 text-sm text-charcoal-light">
              <input
                type="radio"
                name="preferredContact"
                value={method}
                checked={values.preferredContact === method}
                onChange={() => update('preferredContact', method)}
                className="h-4 w-4 accent-forest-600"
              />
              {method === 'email' ? 'Email' : 'Telephone'}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Honeypot: hidden from people, attractive to bots */}
      <div className="hidden" aria-hidden="true">
        <label>
          Leave this field empty
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-charcoal-light">
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={(e) => update('consent', e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            className="mt-1 h-4 w-4 flex-shrink-0 accent-forest-600"
          />
          <span>
            I agree that EcoHealth & Transport Solutions Ltd may contact me about this enquiry and will process my details
            as described in the Privacy Policy. *
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="mt-2 text-sm text-red-700">
            {errors.consent}
          </p>
        )}
      </div>

      {state === 'error' && (
        <div role="alert" className="flex items-start gap-3 border border-red-700/30 bg-red-50 p-5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>
            Your enquiry could not be sent. Please check your connection and try again. If the problem continues, the
            enquiry service is not yet connected for this website.
          </p>
        </div>
      )}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Fields marked * are required.</p>
        <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              {config.submitLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
