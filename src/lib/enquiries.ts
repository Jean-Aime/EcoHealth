import { supabase } from '@/lib/supabase';

export const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

export interface Enquiry {
  id: string;
  full_name: string;
  organisation: string | null;
  email: string;
  telephone: string | null;
  service_required: string;
  project_location: string | null;
  description: string;
  preferred_contact: 'email' | 'phone';
  enquiry_type: string;
  consent: boolean;
  status: EnquiryStatus;
  created_at: string;
}

const LOAD_ERROR = 'Enquiries could not be loaded. Please refresh the page and try again.';
const SAVE_ERROR = 'The status could not be saved. Please try again.';
const NOT_CONNECTED = 'The enquiry service is not connected for this website.';

export async function fetchEnquiries(): Promise<{ data: Enquiry[]; error: string | null }> {
  if (!supabase) return { data: [], error: NOT_CONNECTED };

  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !Array.isArray(data)) return { data: [], error: LOAD_ERROR };
  return { data: data as Enquiry[], error: null };
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<string | null> {
  if (!supabase) return NOT_CONNECTED;

  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
  return error ? SAVE_ERROR : null;
}
