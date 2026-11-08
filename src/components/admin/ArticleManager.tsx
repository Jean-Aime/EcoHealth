import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  deleteArticle,
  fetchAdminContent,
  saveArticle,
  type ArticleInput,
  type ArticleRecord,
} from '@/lib/cms';
import { AdminField, Notice, inputClass, slugify } from '@/components/admin/AdminUI';

type Draft = ArticleInput & { id?: string };

function emptyDraft(): Draft {
  return {
    slug: '',
    title: '',
    category: 'Risk Management',
    excerpt: '',
    body: [],
    image: '',
    readTime: '5 min read',
    date: new Date().toISOString().slice(0, 10),
    published: false,
  };
}

const CATEGORY_SUGGESTIONS = [
  'Risk Management',
  'Environmental Management',
  'Occupational Health & Safety',
  'Transport Safety',
];

export function ArticleManager() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [bodyText, setBodyText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    const result = await fetchAdminContent();
    setArticles(result.articles);
    setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  const startNew = () => {
    setDraft(emptyDraft());
    setBodyText('');
    setFormError(null);
    setNotice(null);
  };

  const startEdit = (article: ArticleRecord) => {
    setDraft({
      id: article.id,
      slug: article.slug,
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      body: article.body,
      image: article.image ?? '',
      readTime: article.readTime,
      date: article.date.slice(0, 10),
      published: article.published,
    });
    setBodyText(article.body.join('\n\n'));
    setFormError(null);
    setNotice(null);
  };

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!draft) return;
    const body = bodyText
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (!draft.title.trim() || !draft.excerpt.trim() || body.length === 0) {
      setFormError('A title, excerpt, and at least one paragraph of body text are required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    const message = await saveArticle(
      {
        ...draft,
        slug: draft.slug.trim() || slugify(draft.title),
        body,
        date: draft.date || new Date().toISOString().slice(0, 10),
      },
      draft.id,
    );
    setSaving(false);

    if (message) {
      setFormError(message);
      return;
    }

    setNotice('Article saved.');
    setDraft(null);
    await reload();
  };

  const handleDelete = async (article: ArticleRecord) => {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    const message = await deleteArticle(article.id);
    if (message) {
      setError(message);
      return;
    }
    setNotice('Article deleted.');
    if (draft?.id === article.id) setDraft(null);
    await reload();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-charcoal/10 pb-8">
        <div>
          <p className="eyebrow">Insights</p>
          <h1 className="mt-4 font-display text-display-sm font-semibold text-charcoal">Articles</h1>
          <p className="mt-2 text-sm text-muted">
            Published articles appear on Resources &amp; Insights. Drafts stay private.
          </p>
        </div>
        <button type="button" onClick={startNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          New article
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
              {draft.id ? 'Edit article' : 'New article'}
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
            <AdminField label="Title" htmlFor="article-title" className="sm:col-span-2">
              <input
                id="article-title"
                className={inputClass}
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          title,
                          slug: prev.id || prev.slug ? prev.slug : slugify(title),
                        }
                      : prev,
                  );
                }}
              />
            </AdminField>

            <AdminField label="Slug" htmlFor="article-slug" hint="Used in the URL: /insights/your-slug">
              <input
                id="article-slug"
                className={inputClass}
                value={draft.slug}
                onChange={(event) => update('slug', event.target.value)}
              />
            </AdminField>

            <AdminField label="Category" htmlFor="article-category" hint="New categories appear as filters automatically.">
              <input
                id="article-category"
                className={inputClass}
                list="article-categories"
                value={draft.category}
                onChange={(event) => update('category', event.target.value)}
              />
              <datalist id="article-categories">
                {CATEGORY_SUGGESTIONS.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </AdminField>

            <AdminField label="Excerpt" htmlFor="article-excerpt" className="sm:col-span-2">
              <textarea
                id="article-excerpt"
                rows={2}
                className={inputClass}
                value={draft.excerpt}
                onChange={(event) => update('excerpt', event.target.value)}
              />
            </AdminField>

            <AdminField
              label="Body"
              htmlFor="article-body"
              hint="Separate paragraphs with a blank line."
              className="sm:col-span-2"
            >
              <textarea
                id="article-body"
                rows={10}
                className={inputClass}
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
              />
            </AdminField>

            <AdminField label="Header image URL" htmlFor="article-image" hint="Leave empty to use the category image.">
              <input
                id="article-image"
                className={inputClass}
                value={draft.image ?? ''}
                onChange={(event) => update('image', event.target.value)}
              />
            </AdminField>

            <AdminField label="Read time" htmlFor="article-read-time">
              <input
                id="article-read-time"
                className={inputClass}
                value={draft.readTime}
                onChange={(event) => update('readTime', event.target.value)}
              />
            </AdminField>

            <AdminField label="Publication date" htmlFor="article-date">
              <input
                id="article-date"
                type="date"
                className={inputClass}
                value={draft.date}
                onChange={(event) => update('date', event.target.value)}
              />
            </AdminField>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(event) => update('published', event.target.checked)}
                  className="h-4 w-4 accent-forest-600"
                />
                Publish this article
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
              {saving ? 'Saving' : 'Save article'}
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
            Loading articles
          </p>
        ) : articles.length === 0 ? (
          <p className="border border-dashed border-charcoal/20 p-8 text-sm text-charcoal-light">
            No articles yet. The public site is showing its built-in seed articles until you publish one here.
          </p>
        ) : (
          <div className="overflow-x-auto border-y border-charcoal/10 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-charcoal">{article.title}</p>
                      <p className="text-xs text-muted">/insights/{article.slug}</p>
                    </td>
                    <td className="px-5 py-4 text-charcoal-light">{article.category}</td>
                    <td className="px-5 py-4 text-charcoal-light">{article.date.slice(0, 10)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block border px-2.5 py-1 text-xs ${
                          article.published
                            ? 'border-forest-600/30 bg-forest-50 text-forest-800'
                            : 'border-charcoal/15 bg-charcoal/5 text-charcoal-light'
                        }`}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(article)}
                          className="flex items-center gap-1.5 border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-forest-600 hover:text-forest-800"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(article)}
                          className="flex items-center gap-1.5 border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal-light transition-colors hover:border-red-700 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
