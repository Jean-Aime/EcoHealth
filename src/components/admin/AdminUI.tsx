import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const inputClass =
  'mt-2 w-full border border-charcoal/20 bg-white px-3 py-2.5 text-sm text-charcoal transition-colors focus:border-forest-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-forest-600/40';

export function AdminField({
  label,
  hint,
  htmlFor,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Notice({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const error = tone === 'error';
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={`flex items-start gap-3 border p-4 text-sm ${
        error ? 'border-red-700/30 bg-red-50 text-red-800' : 'border-forest-600/30 bg-forest-50 text-forest-800'
      }`}
    >
      {error ? (
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <p>{children}</p>
    </div>
  );
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
