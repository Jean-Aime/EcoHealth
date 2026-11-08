import { useState, type ChangeEvent } from 'react';
import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUSES,
  updateEnquiryStatus,
  type Enquiry,
  type EnquiryStatus,
} from '@/lib/enquiries';
import { AlertCircle, Loader2, Save } from 'lucide-react';

interface EnquiryDetailProps {
  enquiry: Enquiry;
  onStatusSaved: (id: string, status: EnquiryStatus) => void;
}

const fieldClass =
  'w-full border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal focus:border-forest-600 focus:outline-none';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export function EnquiryDetail({ enquiry, onStatusSaved }: EnquiryDetailProps) {
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = status !== enquiry.status;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const message = await updateEnquiryStatus(enquiry.id, status);
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    onStatusSaved(enquiry.id, status);
    setSaved(true);
  };

  const rows: { label: string; value: string | null }[] = [
    { label: 'Received', value: formatDateTime(enquiry.created_at) },
    { label: 'Organisation', value: enquiry.organisation },
    { label: 'Email', value: enquiry.email },
    { label: 'Telephone', value: enquiry.telephone },
    { label: 'Service required', value: enquiry.service_required },
    { label: 'Project location', value: enquiry.project_location },
    { label: 'Preferred contact', value: enquiry.preferred_contact === 'phone' ? 'Telephone' : 'Email' },
  ];

  return (
    <article className="border border-charcoal/10 bg-white p-8 lg:p-10">
      <header className="border-b border-charcoal/10 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-forest-700">Enquiry</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-charcoal">{enquiry.full_name}</h2>
      </header>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-medium uppercase tracking-widest text-charcoal-light">{row.label}</dt>
            <dd className="mt-2 break-words text-sm text-charcoal">{row.value || 'Not provided'}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <h3 className="text-xs font-medium uppercase tracking-widest text-charcoal-light">Requirements</h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-charcoal">{enquiry.description}</p>
      </div>

      <div className="mt-10 border-t border-charcoal/10 pt-8">
        <label htmlFor="enquiry-status" className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
          Status
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <select
            id="enquiry-status"
            className={`${fieldClass} sm:max-w-xs`}
            value={status}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setStatus(e.target.value as EnquiryStatus);
              setSaved(false);
            }}
          >
            {ENQUIRY_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ENQUIRY_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving' : 'Save status'}
          </button>
        </div>
        {saved && !dirty && (
          <p role="status" className="mt-3 text-sm text-forest-700">
            Status saved.
          </p>
        )}
        {error && (
          <div role="alert" className="mt-4 flex items-start gap-3 border border-red-700/30 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </article>
  );
}
