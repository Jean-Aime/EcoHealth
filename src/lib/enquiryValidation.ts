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

export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};

  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid business email address.';
  }
  if (values.telephone.trim() && !PHONE_PATTERN.test(values.telephone.trim())) {
    errors.telephone = 'Please enter a valid telephone number.';
  }
  if (values.preferredContact === 'phone' && !values.telephone.trim()) {
    errors.telephone = 'Please add a telephone number so we can call you.';
  }
  if (!values.serviceRequired) {
    errors.serviceRequired = 'Please select the service you need.';
  }
  if (values.description.trim().length < 20) {
    errors.description = 'Please describe your requirements in at least 20 characters.';
  }
  if (!values.consent) {
    errors.consent = 'Please confirm you agree to us contacting you about this enquiry.';
  }

  return errors;
}
