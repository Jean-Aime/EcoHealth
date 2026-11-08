import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { emptySettings, loadSiteSettings, saveSiteSettings, type SiteSettings } from '@/lib/cms';
import { AdminField, Notice, inputClass } from '@/components/admin/AdminUI';
import { analyticsConfigured } from '@/lib/analytics';
import { SITE_URL } from '@/lib/site';

export function SettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadSiteSettings(true).then((value) => {
      if (!active) return;
      setSettings(value);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);

    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(settings.email)) {
      setSaving(false);
      setError('Please enter a valid email address, or leave the field empty.');
      return;
    }
    if (settings.phone && !/^\+?[0-9\s()-]{7,20}$/.test(settings.phone)) {
      setSaving(false);
      setError('Please enter a valid telephone number, or leave the field empty.');
      return;
    }

    const message = await saveSiteSettings(settings);
    setSaving(false);

    if (message) {
      setError(message);
      return;
    }
    setNotice('Company details saved. The site now shows these details wherever they are configured.');
  };

  const checks = [
    { label: 'Verified business email', done: Boolean(settings.email) },
    { label: 'Verified telephone number', done: Boolean(settings.phone) },
    { label: 'Office or service-area address', done: Boolean(settings.address) },
    { label: 'LinkedIn company page', done: Boolean(settings.linkedinUrl) },
    { label: 'Approved company profile PDF', done: Boolean(settings.companyProfileUrl) },
    { label: 'Analytics ID configured', done: analyticsConfigured },
    { label: 'Canonical domain configured', done: SITE_URL !== 'https://www.ecohealth.rw' },
  ];

  return (
    <div>
      <div className="border-b border-charcoal/10 pb-8">
        <p className="eyebrow">Site details</p>
        <h1 className="mt-4 font-display text-display-sm font-semibold text-charcoal">Company details &amp; launch</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Details entered here are published on the contact page, footer and structured data. Leave a field empty and it
          is simply not shown — the site never displays placeholder contact information.
        </p>
      </div>

      {error && (
        <div className="mt-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {notice && (
        <div className="mt-6">
          <Notice tone="success">{notice}</Notice>
        </div>
      )}

      {loading ? (
        <p className="mt-8 flex items-center gap-3 text-sm text-charcoal-light">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading company details
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="border border-charcoal/15 bg-white p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold text-charcoal">Contact</h2>
              <div className="mt-5 grid gap-5">
                <AdminField label="Business email" htmlFor="settings-email">
                  <input
                    id="settings-email"
                    type="email"
                    className={inputClass}
                    value={settings.email}
                    onChange={(event) => update('email', event.target.value)}
                    placeholder="enquiries@example.com"
                  />
                </AdminField>
                <AdminField label="Telephone" htmlFor="settings-phone">
                  <input
                    id="settings-phone"
                    type="tel"
                    className={inputClass}
                    value={settings.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    placeholder="+250 ..."
                  />
                </AdminField>
                <AdminField label="Office or service area" htmlFor="settings-address">
                  <input
                    id="settings-address"
                    className={inputClass}
                    value={settings.address}
                    onChange={(event) => update('address', event.target.value)}
                    placeholder="Kigali, Rwanda"
                  />
                </AdminField>
                <AdminField label="LinkedIn URL" htmlFor="settings-linkedin">
                  <input
                    id="settings-linkedin"
                    className={inputClass}
                    value={settings.linkedinUrl}
                    onChange={(event) => update('linkedinUrl', event.target.value)}
                    placeholder="https://www.linkedin.com/company/..."
                  />
                </AdminField>
              </div>

              <h2 className="mt-10 font-display text-lg font-semibold text-charcoal">Company profile</h2>
              <p className="mt-2 text-sm text-muted">
                The download button only appears once a link is set here — no broken or placeholder downloads.
              </p>
              <div className="mt-5 grid gap-5">
                <AdminField label="Profile document URL" htmlFor="settings-profile-url">
                  <input
                    id="settings-profile-url"
                    className={inputClass}
                    value={settings.companyProfileUrl}
                    onChange={(event) => update('companyProfileUrl', event.target.value)}
                    placeholder="https://.../ecohealth-company-profile.pdf"
                  />
                </AdminField>
                <AdminField label="Button label" htmlFor="settings-profile-label">
                  <input
                    id="settings-profile-label"
                    className={inputClass}
                    value={settings.companyProfileLabel}
                    onChange={(event) => update('companyProfileLabel', event.target.value)}
                    placeholder="Download company profile"
                  />
                </AdminField>
              </div>

              <div className="mt-8">
                <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Saving' : 'Save company details'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-charcoal/15 bg-white p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold text-charcoal">Launch checklist</h2>
              <ul className="mt-5 space-y-3">
                {checks.map((check) => (
                  <li key={check.label} className="flex items-start gap-3 text-sm text-charcoal-light">
                    {check.done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest-600" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted/50" />
                    )}
                    <span className={check.done ? 'text-charcoal' : ''}>{check.label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-charcoal/10 pt-6 text-sm text-muted">
                <p className="font-medium text-charcoal">Canonical site URL</p>
                <p className="mt-1 break-all text-xs">{SITE_URL}</p>
                <p className="mt-2 text-xs leading-relaxed">
                  Set <code className="bg-charcoal/5 px-1">VITE_SITE_URL</code> at build time to the live domain so
                  canonical links, Open Graph metadata and the sitemap all match.
                </p>
              </div>

              <div className="mt-6 border-t border-charcoal/10 pt-6 text-sm text-muted">
                <p className="font-medium text-charcoal">Analytics</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Configure <code className="bg-charcoal/5 px-1">VITE_GA_ID</code> or{' '}
                  <code className="bg-charcoal/5 px-1">VITE_PLAUSIBLE_DOMAIN</code> to enable page-view tracking. No
                  analytics script loads until one is set.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
