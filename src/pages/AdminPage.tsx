import { useState } from 'react';
import { FileText, Inbox, LogOut, Settings, Briefcase } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { EnquiryManager } from '@/components/admin/EnquiryManager';
import { ArticleManager } from '@/components/admin/ArticleManager';
import { CaseStudyManager } from '@/components/admin/CaseStudyManager';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { useAdminSession, type AdminState } from '@/lib/useAdminSession';
import { company } from '@/data/content';

type Tab = 'enquiries' | 'articles' | 'case-studies' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof Inbox }[] = [
  { id: 'enquiries', label: 'Enquiries', icon: Inbox },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'case-studies', label: 'Case studies', icon: Briefcase },
  { id: 'settings', label: 'Site details', icon: Settings },
];

function AdminBar({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <header className="border-b border-charcoal/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10">
        <a href="/" className="font-display text-base font-semibold text-forest-800 link-underline">
          {company.name}
        </a>
        <div className="flex items-center gap-6">
          <span className="hidden truncate text-sm text-charcoal-light sm:block">{email}</span>
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 text-sm font-medium text-forest-700 transition-colors hover:text-forest-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

function AccessMessage({ title, body, onSignOut }: { title: string; body: string; onSignOut: () => void }) {
  return (
    <div className="mx-auto max-w-md border-t-2 border-forest-600 bg-white p-10">
      <h1 className="font-display text-2xl font-semibold text-charcoal">{title}</h1>
      <p className="mt-4 text-base leading-relaxed text-charcoal-light">{body}</p>
      <button type="button" onClick={onSignOut} className="btn-secondary mt-8">
        Sign out
      </button>
    </div>
  );
}

function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('enquiries');

  return (
    <div className="min-h-screen bg-ivory">
      <AdminBar email={email} onSignOut={onSignOut} />

      <div className="border-b border-charcoal/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div role="tablist" aria-label="Admin sections" className="flex flex-wrap gap-1">
            {TABS.map((entry) => {
              const Icon = entry.icon;
              const active = tab === entry.id;
              return (
                <button
                  key={entry.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setTab(entry.id)}
                  className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                    active
                      ? 'border-forest-600 text-forest-800'
                      : 'border-transparent text-muted hover:text-charcoal'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {entry.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        {tab === 'enquiries' && <EnquiryManager />}
        {tab === 'articles' && <ArticleManager />}
        {tab === 'case-studies' && <CaseStudyManager />}
        {tab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}

function AdminContent({
  state,
  onSignIn,
  onSignOut,
}: {
  state: AdminState;
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignOut: () => void;
}) {
  switch (state.status) {
    case 'loading':
      return <p className="text-sm text-charcoal-light">Checking your access</p>;
    case 'unavailable':
      return (
        <AccessMessage
          title="Admin area unavailable"
          body="The content service is not connected for this website, so the admin area cannot be opened right now."
          onSignOut={onSignOut}
        />
      );
    case 'signed-out':
      return <AdminLogin onSignIn={onSignIn} />;
    case 'no-access':
      return (
        <AccessMessage
          title="No admin access"
          body="This account is signed in but is not approved to manage this website. Ask the site administrator to grant access."
          onSignOut={onSignOut}
        />
      );
    case 'ready':
      return <Dashboard email={state.email} onSignOut={onSignOut} />;
  }
}

export function AdminPage() {
  const { state, signIn, signOut } = useAdminSession();

  return (
    <>
      <SEO title="Staff admin | EcoHealth" description="Staff access to website enquiries and content." path="/admin" noIndex />
      {state.status === 'ready' ? (
        <AdminContent state={state} onSignIn={signIn} onSignOut={signOut} />
      ) : (
        <div className="min-h-screen bg-ivory">
          <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
            <AdminContent state={state} onSignIn={signIn} onSignOut={signOut} />
          </main>
        </div>
      )}
    </>
  );
}
