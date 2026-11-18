export interface EnquiryValues {
  fullName: string;
  organisation: string;
  email: string;
  telephone: string;
  serviceRequired: string;
  projectLocation: string;
  description: string;
  preferredContact: 'email' | 'phone';
  consent: boolean;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryValues, string>>;

/**
 * Shared limits. The same maxima are enforced by CHECK constraints in the
 * database (supabase/migrations/20261117120000_enquiry_hardening.sql), so a
 * submission crafted outside this form is still rejected server-side.
 */
export const ENQUIRY_LIMITS = {
  fullName: 120,
  organisation: 160,
  email: 254,
  telephone: 30,
  serviceRequired: 120,
  projectLocation: 160,
  description: 4000,
} as const;

export const emptyEnquiry: EnquiryValues = {
  fullName: '',
  organisation: '',
  email: '',
  telephone: '',
  serviceRequired: '',
  projectLocation: '',
  description: '',
  preferredContact: 'email',
  consent: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;

/** Collapses whitespace and strips control characters from single-line input. */
export function normaliseLine(value: string): string {
  const withoutControls = Array.from(value)
    .map((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127 ? ' ' : character;
    })
    .join('');
  return withoutControls.replace(/\s+/g, ' ').trim();
}

/** Preserves paragraph breaks while removing control characters. */
export function normaliseBlock(value: string): string {
  const withoutNulls = Array.from(value)
    .filter((character) => character.charCodeAt(0) !== 0)
    .join('');

  return withoutNulls
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .trim();
}

export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const fullName = normaliseLine(values.fullName);
  const organisation = normaliseLine(values.organisation);
  const email = values.email.trim();
  const telephone = normaliseLine(values.telephone);
  const serviceRequired = normaliseLine(values.serviceRequired);
  const projectLocation = normaliseLine(values.projectLocation);
  const description = normaliseBlock(values.description);

  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  } else if (fullName.length > ENQUIRY_LIMITS.fullName) {
    errors.fullName = `Please keep your name under ${ENQUIRY_LIMITS.fullName} characters.`;
  }

  if (organisation.length > ENQUIRY_LIMITS.organisation) {
    errors.organisation = `Please keep the organisation name under ${ENQUIRY_LIMITS.organisation} characters.`;
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid business email address.';
  } else if (email.length > ENQUIRY_LIMITS.email) {
    errors.email = 'That email address is too long.';
  }

  if (telephone && (!PHONE_PATTERN.test(telephone) || telephone.length > ENQUIRY_LIMITS.telephone)) {
    errors.telephone = 'Please enter a valid telephone number.';
  }
  if (values.preferredContact === 'phone' && !telephone) {
    errors.telephone = 'Please add a telephone number so we can call you.';
  }

  if (!serviceRequired) {
    errors.serviceRequired = 'Please select the service you need.';
  } else if (serviceRequired.length > ENQUIRY_LIMITS.serviceRequired) {
    errors.serviceRequired = 'Please choose one of the listed options.';
  }

  if (projectLocation.length > ENQUIRY_LIMITS.projectLocation) {
    errors.projectLocation = `Please keep the location under ${ENQUIRY_LIMITS.projectLocation} characters.`;
  }

  if (description.length < 20) {
    errors.description = 'Please describe your requirements in at least 20 characters.';
  } else if (description.length > ENQUIRY_LIMITS.description) {
    errors.description = `Please keep your description under ${ENQUIRY_LIMITS.description} characters.`;
  }

  if (!values.consent) {
    errors.consent = 'Please confirm you agree to us contacting you about this enquiry.';
  }

  return errors;
}
