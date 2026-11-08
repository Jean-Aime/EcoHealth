import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUSES,
  fetchEnquiries,
  type Enquiry,
  type EnquiryStatus,
} from '@/lib/enquiries';
import { EnquiryDetail } from '@/components/admin/EnquiryDetail';

type Filter = 'all' | EnquiryStatus;

const FILTERS: Filter[] = ['all', ...ENQUIRY_STATUSES];

const statusStyles: Record<EnquiryStatus, string> = {
  new: 'bg-forest-50 text-forest-800 ring-forest-600/20',
  contacted: 'bg-sage-light text-charcoal ring-charcoal/15',
  closed: 'bg-charcoal/5 text-charcoal-light ring-charcoal/10',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function EnquiryManager() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchEnquiries();
      if (cancelled) return;
      setEnquiries(result.data);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const counts = useMemo(() => {
    const base: Record<Filter, number> = { all: enquiries.length, new: 0, contacted: 0, closed: 0 };
    enquiries.forEach((e) => {
      base[e.status] += 1;
    });
    return base;
  }, [enquiries]);

  const visible = useMemo(
    () => (filter === 'all' ? enquiries : enquiries.filter((e) => e.status === filter)),
    [enquiries, filter],
  );

  const selected = enquiries.find((e) => e.id === selectedId) ?? null;

  const handleStatusSaved = (id: string, status: EnquiryStatus) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-charcoal/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Enquiries</p>
          <h1 className="mt-4 font-display text-display-sm font-semibold text-charcoal">Website enquiries</h1>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          disabled={loading}
          className="btn-secondary self-start disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div role="tablist" aria-label="Filter enquiries by status" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((value) => {
          const active = filter === value;
          const label = value === 'all' ? 'All' : ENQUIRY_STATUS_LABELS[value];
          return (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-2 border px-4 py-2 text-sm transition-colors duration-300 ${
                active
                  ? 'border-forest-700 bg-forest-700 text-white'
                  : 'border-charcoal/15 bg-white text-charcoal-light hover:border-forest-600 hover:text-forest-800'
              }`}
            >
              {label}
              <span className={active ? 'text-white/75' : 'text-muted'}>{counts[value]}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="mt-8 flex items-start gap-3 border border-red-700/30 bg-red-50 p-5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex items-center gap-3 text-sm text-charcoal-light">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading enquiries
        </div>
      ) : (
        !error && (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              {visible.length === 0 ? (
                <p className="border border-dashed border-charcoal/20 p-8 text-sm text-charcoal-light">
                  {enquiries.length === 0
                    ? 'No enquiries have been received yet.'
                    : 'No enquiries match this status.'}
                </p>
              ) : (
                <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
                  {visible.map((enquiry) => {
                    const active = enquiry.id === selectedId;
                    return (
                      <li key={enquiry.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(enquiry.id)}
                          aria-current={active ? 'true' : undefined}
                          className={`group flex w-full flex-col gap-2 px-5 py-5 text-left transition-colors duration-300 ${
                            active ? 'bg-forest-50' : 'hover:bg-ivory-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-medium text-charcoal">{enquiry.full_name}</span>
                            <span
                              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[enquiry.status]}`}
                            >
                              {ENQUIRY_STATUS_LABELS[enquiry.status]}
                            </span>
                          </div>
                          <span className="text-sm text-charcoal-light">
                            {enquiry.organisation || 'Individual enquiry'}
                          </span>
                          <span className="text-xs text-muted">
                            {enquiry.service_required} · {formatDate(enquiry.created_at)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="lg:col-span-7">
              {selected ? (
                <EnquiryDetail key={selected.id} enquiry={selected} onStatusSaved={handleStatusSaved} />
              ) : (
                <div className="flex h-full min-h-64 items-center justify-center border border-dashed border-charcoal/20 p-8 text-center text-sm text-charcoal-light">
                  Select an enquiry to read the full details and update its status.
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
