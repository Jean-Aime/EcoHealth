import { useState } from 'react';
import {
  Briefcase,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Logo } from '@/components/Logo';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { EnquiryManager } from '@/components/admin/EnquiryManager';
import { ArticleManager } from '@/components/admin/ArticleManager';
import { CaseStudyManager } from '@/components/admin/CaseStudyManager';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { TrainingManager } from '@/components/admin/TrainingManager';
import { useAdminSession, type AdminState } from '@/lib/useAdminSession';
import { company } from '@/data/content';

type Tab = 'overview' | 'enquiries' | 'articles' | 'case-studies' | 'training' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof Inbox; description: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Website activity and quick access' },
  { id: 'enquiries', label: 'Enquiries', icon: Inbox, description: 'Manage incoming enquiries' },
  { id: 'articles', label: 'Articles', icon: FileText, description: 'Publish insights and updates' },
  { id: 'case-studies', label: 'Case studies', icon: Briefcase, description: 'Manage project stories' },
  { id: 'training', label: 'Training', icon: GraduationCap, description: 'Courses, learners and delivery' },
  { id: 'settings', label: 'Site details', icon: Settings, description: 'Company profile and settings' },
];

function initials(email: string): string {
  const name = email.split('@')[0] ?? '';
  const parts = name.split(/[._-]+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2)).toUpperCase();
}

function AdminSidebar({
  tab,
  onTabChange,
  onClose,
}: {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onClose: () => void;
}) {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col bg-forest-900 text-white">
      <div className="flex h-[88px] items-center justify-between border-b border-white/10 px-6">
        <a href="/" aria-label={`${company.name} home`} className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-light">
          <Logo tone="light" size="sm" />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close admin navigation"
          className="rounded-md p-2 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5 pt-7">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Workspace</p>
        <nav aria-label="Admin sections" className="mt-3 space-y-1">
          {TABS.map((entry) => {
            const Icon = entry.icon;
            const active = tab === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  onTabChange(entry.id);
                  onClose();
                }}
                className={`group flex min-h-12 w-full items-center gap-3 rounded-md border-l-2 px-3 text-left text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-light ${
                  active
                    ? 'border-sage-light bg-white/10 font-medium text-white'
                    : 'border-transparent text-white/65 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-sage-light' : 'text-white/50 group-hover:text-white/80'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block">{entry.label}</span>
                  <span className={`mt-0.5 block text-[11px] ${active ? 'text-white/60' : 'text-white/40'}`}>
                    {entry.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 px-6 py-5">
        <a
          href="/"
          className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
        >
          <span>Back to website</span>
          <span aria-hidden="true">↗</span>
        </a>
        <p className="mt-4 px-3 text-[10px] uppercase tracking-[0.16em] text-white/35">
          EcoHealth administration
        </p>
      </div>
    </aside>
  );
}

function AdminTopbar({
  email,
  tab,
  mobileNavOpen,
  onSignOut,
  onMenu,
}: {
  email: string;
  tab: Tab;
  mobileNavOpen: boolean;
  onSignOut: () => void;
  onMenu: () => void;
}) {
  const currentTab = TABS.find((entry) => entry.id === tab) ?? TABS[0];
  return (
    <header className="sticky top-0 z-30 border-b border-charcoal/10 bg-white/95 backdrop-blur">
      <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            aria-label={mobileNavOpen ? 'Close admin navigation' : 'Open admin navigation'}
            aria-expanded={mobileNavOpen}
            className="rounded-md border border-charcoal/10 p-2 text-charcoal-light transition hover:border-forest-700/30 hover:text-forest-800 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-muted sm:block">
              Admin workspace <span className="mx-1.5 text-charcoal/25">/</span> {currentTab.label}
            </p>
            <p className="truncate text-sm font-semibold text-charcoal sm:mt-1">{currentTab.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-light text-xs font-semibold text-forest-800">
              {initials(email)}
            </span>
            <div className="max-w-[220px]">
              <p className="truncate text-xs font-medium text-charcoal">{email}</p>
              <p className="mt-0.5 text-[10px] text-muted">Authorized administrator</p>
            </div>
          </div>
          <span className="h-8 w-px bg-charcoal/10" aria-hidden="true" />
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-charcoal-light transition hover:bg-charcoal/[0.04] hover:text-forest-800 sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
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
  const [tab, setTab] = useState<Tab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6f3] md:flex">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-charcoal/45 backdrop-blur-[2px] md:hidden"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar tab={tab} onTabChange={setTab} onClose={() => setMobileNavOpen(false)} />
      </div>
      <div className="min-w-0 flex-1">
        <AdminTopbar
          email={email}
          tab={tab}
          mobileNavOpen={mobileNavOpen}
          onSignOut={onSignOut}
          onMenu={() => setMobileNavOpen((open) => !open)}
        />
        <main className="mx-auto w-full max-w-[1680px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-11">
          <div className="mx-auto max-w-7xl">
            {tab === 'overview' && <AdminOverview onNavigate={setTab} />}
            {tab === 'enquiries' && <EnquiryManager />}
            {tab === 'articles' && <ArticleManager />}
            {tab === 'case-studies' && <CaseStudyManager />}
            {tab === 'training' && <TrainingManager />}
            {tab === 'settings' && <SettingsPanel />}
          </div>
        </main>
      </div>
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
      <SEO title="Admin Workspace | EcoHealth" description="Manage EcoHealth website enquiries, content, training, and company details." path="/admin" noIndex />
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
