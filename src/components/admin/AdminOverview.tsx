import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  FileText,
  Inbox,
  RefreshCw,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AdminSection = 'enquiries' | 'articles' | 'case-studies' | 'training' | 'settings';
type MetricKey = 'newEnquiries' | 'publishedArticles' | 'publishedCaseStudies' | 'publishedCourses';

interface Metrics {
  newEnquiries: number | null;
  publishedArticles: number | null;
  publishedCaseStudies: number | null;
  publishedCourses: number | null;
}

const EMPTY_METRICS: Metrics = {
  newEnquiries: null,
  publishedArticles: null,
  publishedCaseStudies: null,
  publishedCourses: null,
};

const SECTIONS: {
  id: AdminSection;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'enquiries',
    title: 'Enquiries',
    description: 'Review incoming website enquiries, respond to prospective clients, and track follow-up status.',
    action: 'Manage enquiries',
    icon: Inbox,
  },
  {
    id: 'articles',
    title: 'Articles & insights',
    description: 'Create and publish practical resources for the website’s Insights section.',
    action: 'Manage articles',
    icon: FileText,
  },
  {
    id: 'case-studies',
    title: 'Projects & case studies',
    description: 'Maintain approved project examples and control what is shown publicly.',
    action: 'Manage case studies',
    icon: Briefcase,
  },
  {
    id: 'training',
    title: 'Training management',
    description: 'Manage proposed course categories, verified offerings, sessions, learner requests, and certificates.',
    action: 'Manage training',
    icon: BookOpen,
  },
  {
    id: 'settings',
    title: 'Company & site details',
    description: 'Maintain approved contact details, company profile links, and launch-readiness information.',
    action: 'Manage site details',
    icon: Settings,
  },
];

const METRICS: { id: MetricKey; label: string; section: AdminSection; hint: string }[] = [
  { id: 'newEnquiries', label: 'New enquiries', section: 'enquiries', hint: 'Awaiting follow-up' },
  { id: 'publishedArticles', label: 'Published articles', section: 'articles', hint: 'Live on Insights' },
  { id: 'publishedCaseStudies', label: 'Published case studies', section: 'case-studies', hint: 'Approved public projects' },
  { id: 'publishedCourses', label: 'Published courses', section: 'training', hint: 'Live in the training catalogue' },
];

export function AdminOverview({ onNavigate }: { onNavigate: (section: AdminSection) => void }) {
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadMetrics() {
      setLoading(true);
      if (!supabase) {
        if (active) {
          setMetrics(EMPTY_METRICS);
          setHasError(true);
          setLoading(false);
        }
        return;
      }

      const [enquiries, articles, caseStudies, courses] = await Promise.all([
        supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('case_studies').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase
          .from('training_courses')
          .select('id', { count: 'exact', head: true })
          .eq('published', true)
          .is('archived_at', null),
      ]);

      if (!active) return;
      setMetrics({
        newEnquiries: enquiries.error ? null : enquiries.count,
        publishedArticles: articles.error ? null : articles.count,
        publishedCaseStudies: caseStudies.error ? null : caseStudies.count,
        publishedCourses: courses.error ? null : courses.count,
      });
      setHasError(Boolean(enquiries.error || articles.error || caseStudies.error || courses.error));
      setLoading(false);
    }

    void loadMetrics();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <div>
      <section className="relative overflow-hidden border border-forest-800/10 bg-white">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-forest-50/80 lg:block" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end lg:p-11">
          <div>
            <p className="eyebrow">Admin overview</p>
            <h1 className="mt-4 max-w-3xl font-display text-display-md font-semibold text-charcoal">
              Your website, managed in one place.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Manage enquiries, published content, project stories, training operations, and company details from this
              workspace. Public content should be reviewed and verified before it is published.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('enquiries')} className="btn-primary">
              <Inbox className="h-4 w-4" />
              Review enquiries
            </button>
            <a href="/" target="_blank" rel="noreferrer" className="btn-secondary">
              View website
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="mt-9" aria-labelledby="admin-activity-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">At a glance</p>
            <h2 id="admin-activity-heading" className="mt-2 font-display text-xl font-semibold text-charcoal">
              Current website activity
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
            className="btn-secondary disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh activity
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {METRICS.map((metric) => (
            <button
              key={metric.id}
              type="button"
              onClick={() => onNavigate(metric.section)}
              className="group border border-charcoal/10 bg-white p-5 text-left transition hover:border-forest-700/30 hover:shadow-[0_12px_30px_rgba(11,53,34,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
            >
              <span className="text-xs font-medium text-muted">{metric.label}</span>
              <span className="mt-3 flex items-end justify-between">
                <span className="font-display text-3xl font-semibold tabular-nums text-charcoal">
                  {loading ? '…' : metrics[metric.id] ?? '—'}
                </span>
                <ArrowRight className="mb-1 h-4 w-4 text-forest-700 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="mt-2 block text-[11px] text-muted">
                {loading ? 'Loading from the database' : metrics[metric.id] === null ? 'Count unavailable' : metric.hint}
              </span>
            </button>
          ))}
        </div>
        {hasError && (
          <p role="status" className="mt-3 text-xs text-muted">
            Some counts could not be loaded. Open that section to check its connection and data.
          </p>
        )}
      </section>

      <section className="mt-11" aria-labelledby="admin-sections-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-charcoal/10 pb-4">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2 id="admin-sections-heading" className="mt-2 font-display text-xl font-semibold text-charcoal">
              Website management
            </h2>
          </div>
          <p className="text-xs text-muted">Choose an area to continue.</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <article key={section.id} className="flex flex-col border border-charcoal/10 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-forest-50 text-forest-800">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-charcoal">{section.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{section.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(section.id)}
                  className="mt-5 inline-flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.12em] text-forest-800 transition hover:text-forest-600"
                >
                  {section.action}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            );
          })}
          <aside className="flex items-start gap-4 border border-forest-700/15 bg-forest-50 p-5 sm:p-6">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest-700" />
            <div>
              <h3 className="font-display text-base font-semibold text-charcoal">Keep published information verified</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-light">
                Use drafts for review. Publish only approved company details, real project experience, confirmed
                training offerings, and accurate contact information.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
