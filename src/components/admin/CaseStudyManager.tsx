import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  deleteCaseStudy,
  fetchAdminContent,
  saveCaseStudy,
  type CaseStudyInput,
  type CaseStudyRecord,
} from '@/lib/cms';
import { AdminField, Notice, inputClass, slugify } from '@/components/admin/AdminUI';

type Draft = CaseStudyInput & { id?: string };

function emptyDraft(): Draft {
  return {
    slug: '',
    title: '',
    industry: '',
    location: '',
    scope: '',
    responsibilities: [],
    approach: [],
    outcomes: [],
    image: '',
    imageAlt: '',
    confidential: false,
    published: false,
    sortOrder: 0,
  };
}

export function CaseStudyManager() {
  const [studies, setStudies] = useState<CaseStudyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [responsibilities, setResponsibilities] = useState('');
  const [approach, setApproach] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    const result = await fetchAdminContent();
    setStudies(result.caseStudies);
    setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  const startNew = () => {
    setDraft(emptyDraft());
    setResponsibilities('');
    setApproach('');
    setOutcomes('');
    setFormError(null);
    setNotice(null);
  };

  const startEdit = (study: CaseStudyRecord) => {
    setDraft({
      id: study.id,
      slug: study.slug,
      title: study.title,
      industry: study.industry,
      location: study.location,
      scope: study.scope,
      responsibilities: study.responsibilities,
      approach: study.approach,
      outcomes: study.outcomes,
      image: study.image ?? '',
      imageAlt: study.imageAlt ?? '',
      confidential: study.confidential,
      published: study.published,
      sortOrder: study.sortOrder,
    });
    setResponsibilities(study.responsibilities.join('\n\n'));
    setApproach(study.approach.join('\n\n'));
    setOutcomes(study.outcomes.join('\n\n'));
    setFormError(null);
    setNotice(null);
  };

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toList = (value: string) =>
    value
      .split(/\n\s*\n|\n/)
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.title.trim() || !draft.scope.trim()) {
      setFormError('A title and a scope summary are required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    const message = await saveCaseStudy(
      {
        ...draft,
        slug: draft.slug.trim() || slugify(draft.title),
        responsibilities: toList(responsibilities),
        approach: toList(approach),
        outcomes: toList(outcomes),
      },
      draft.id,
    );
    setSaving(false);

    if (message) {
      setFormError(message);
      return;
    }

    setNotice('Case study saved.');
    setDraft(null);
    await reload();
  };

  const handleDelete = async (study: CaseStudyRecord) => {
    if (!window.confirm(`Delete “${study.title}”? This cannot be undone.`)) return;
    const message = await deleteCaseStudy(study.id);
    if (message) {
      setError(message);
      return;
    }
    setNotice('Case study deleted.');
    if (draft?.id === study.id) setDraft(null);
    await reload();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-charcoal/10 pb-8">
        <div>
          <p className="eyebrow">Projects &amp; Experience</p>
          <h1 className="mt-4 font-display text-display-sm font-semibold text-charcoal">Case studies</h1>
          <p className="mt-2 text-sm text-muted">
            Only publish projects the company has approved for publication. Nothing is shown publicly until published.
          </p>
        </div>
        <button type="button" onClick={startNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          New case study
        </button>
      </div>

      {error && (
        <div className="mt-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {notice && !draft && (
        <div className="mt-6">
          <Notice tone="success">{notice}</Notice>
        </div>
      )}

      {draft && (
        <div className="mt-8 border border-charcoal/15 bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-charcoal">
              {draft.id ? 'Edit case study' : 'New case study'}
            </h2>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted hover:text-charcoal"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <AdminField label="Project title" htmlFor="study-title" className="sm:col-span-2">
              <input
                id="study-title"
                className={inputClass}
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setDraft((prev) => (prev ? { ...prev, title, slug: prev.id ? prev.slug : slugify(title) } : prev));
                }}
              />
            </AdminField>

            <AdminField label="Slug" htmlFor="study-slug">
              <input
                id="study-slug"
                className={inputClass}
                value={draft.slug}
                onChange={(event) => update('slug', event.target.value)}
              />
            </AdminField>

            <AdminField label="Industry" htmlFor="study-industry">
              <input
                id="study-industry"
                className={inputClass}
                value={draft.industry}
                onChange={(event) => update('industry', event.target.value)}
                placeholder="e.g. Telecommunications"
              />
            </AdminField>

            <AdminField label="Location" htmlFor="study-location">
              <input
                id="study-location"
                className={inputClass}
                value={draft.location}
                onChange={(event) => update('location', event.target.value)}
                placeholder="e.g. Kigali, Rwanda"
              />
            </AdminField>

            <AdminField label="Sort order" htmlFor="study-order" hint="Lower numbers appear first.">
              <input
                id="study-order"
                type="number"
                className={inputClass}
                value={draft.sortOrder}
                onChange={(event) => update('sortOrder', Number(event.target.value) || 0)}
              />
            </AdminField>

            <AdminField label="Scope summary" htmlFor="study-scope" className="sm:col-span-2">
              <textarea
                id="study-scope"
                rows={3}
                className={inputClass}
                value={draft.scope}
                onChange={(event) => update('scope', event.target.value)}
              />
            </AdminField>

            <AdminField
              label="Responsibilities"
              htmlFor="study-responsibilities"
              hint="One item per line."
              className="sm:col-span-2"
            >
              <textarea
                id="study-responsibilities"
                rows={4}
                className={inputClass}
                value={responsibilities}
                onChange={(event) => setResponsibilities(event.target.value)}
              />
            </AdminField>

            <AdminField label="Approach" htmlFor="study-approach" hint="One item per line." className="sm:col-span-2">
              <textarea
                id="study-approach"
                rows={4}
                className={inputClass}
                value={approach}
                onChange={(event) => setApproach(event.target.value)}
              />
            </AdminField>

            <AdminField label="Outcomes" htmlFor="study-outcomes" hint="One item per line." className="sm:col-span-2">
              <textarea
                id="study-outcomes"
                rows={4}
                className={inputClass}
                value={outcomes}
                onChange={(event) => setOutcomes(event.target.value)}
              />
            </AdminField>

            <AdminField label="Image URL" htmlFor="study-image">
              <input
                id="study-image"
                className={inputClass}
                value={draft.image ?? ''}
                onChange={(event) => update('image', event.target.value)}
              />
            </AdminField>

            <AdminField label="Image description" htmlFor="study-image-alt" hint="Describe the photo for screen readers.">
              <input
                id="study-image-alt"
                className={inputClass}
                value={draft.imageAlt ?? ''}
                onChange={(event) => update('imageAlt', event.target.value)}
              />
            </AdminField>

            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(event) => update('published', event.target.checked)}
                  className="h-4 w-4 accent-forest-600"
                />
                Publish this case study
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={draft.confidential}
                  onChange={(event) => update('confidential', event.target.checked)}
                  className="h-4 w-4 accent-forest-600"
                />
                Client is confidential
              </label>
            </div>
          </div>

          {formError && (
            <div className="mt-6">
              <Notice tone="error">{formError}</Notice>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving' : 'Save case study'}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="flex items-center gap-3 text-sm text-charcoal-light">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading case studies
          </p>
        ) : studies.length === 0 ? (
          <p className="border border-dashed border-charcoal/20 p-8 text-sm text-charcoal-light">
            No case studies yet. The public Projects page shows a capability-led introduction until the first approved
            case study is published.
          </p>
        ) : (
          <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
            {studies.map((study) => (
              <li key={study.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-charcoal">{study.title}</p>
                    <span
                      className={`border px-2 py-0.5 text-[11px] ${
                        study.published
                          ? 'border-forest-600/30 bg-forest-50 text-forest-800'
                          : 'border-charcoal/15 bg-charcoal/5 text-charcoal-light'
                      }`}
                    >
                      {study.published ? 'Published' : 'Draft'}
                    </span>
                    {study.confidential && (
                      <span className="border border-charcoal/15 px-2 py-0.5 text-[11px] text-muted">Confidential</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {[study.industry, study.location].filter(Boolean).join(' · ') || 'No industry or location set'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(study)}
                    className="flex items-center gap-1.5 border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-forest-600 hover:text-forest-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(study)}
                    className="flex items-center gap-1.5 border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal-light transition-colors hover:border-red-700 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
