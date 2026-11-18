import { useState, type FormEvent } from 'react';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onSignIn: (email: string, password: string) => Promise<string | null>;
}

const fieldClass =
  'w-full border-0 border-b border-charcoal/25 bg-transparent px-0 py-3 text-base text-charcoal placeholder:text-muted/70 transition-colors duration-300 focus:border-forest-600 focus:outline-none';

export function AdminLogin({ onSignIn }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const message = await onSignIn(email.trim(), password);
    setSubmitting(false);
    if (message) setError(message);
  };

  return (
    <div className="mx-auto max-w-md">
      <p className="eyebrow">Staff access</p>
      <h1 className="mt-4 font-display text-display-sm font-semibold text-charcoal">Sign in to manage the website</h1>
      <p className="mt-4 text-base leading-relaxed text-charcoal-light">
        This area is for EcoHealth & Transport Solutions staff. Accounts are created by the site administrator.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-8" aria-label="Staff sign in">
        <div>
          <label htmlFor="admin-email" className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            maxLength={200}
            required
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-3 border border-red-700/30 bg-red-50 p-5 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
