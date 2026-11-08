import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { articles as seedArticles, caseStudySeeds } from '@/data/content';

/**
 * Content layer.
 *
 * Published articles, case studies and company settings come from Supabase when
 * it is connected. The site never depends on that: if the database is empty or
 * unreachable the built-in seed content is rendered, so the marketing site
 * always has something to show.
 *
 * Everything is cached in memory for a minute so navigating between pages does
 * not refetch, and the admin panel invalidates the cache after every write.
 */

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string[];
  image?: string;
  readTime: string;
  date: string;
  published: boolean;
}

export interface CaseStudyRecord {
  id: string;
  slug: string;
  title: string;
  industry: string;
  location: string;
  scope: string;
  responsibilities: string[];
  approach: string[];
  outcomes: string[];
  image?: string;
  imageAlt?: string;
  confidential: boolean;
  published: boolean;
  sortOrder: number;
}

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  linkedinUrl: string;
  companyProfileUrl: string;
  companyProfileLabel: string;
}

export const emptySettings: SiteSettings = {
  phone: '',
  email: '',
  address: '',
  linkedinUrl: '',
  companyProfileUrl: '',
  companyProfileLabel: '',
};

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  image_url: string | null;
  read_time: string;
  published: boolean;
  published_at: string;
}

interface CaseStudyRow {
  id: string;
  slug: string;
  title: string;
  industry: string | null;
  location: string | null;
  scope: string;
  responsibilities: string;
  approach: string;
  outcomes: string;
  image_url: string | null;
  image_alt: string | null;
  confidential: boolean;
  published: boolean;
  sort_order: number;
}

interface SettingsRow {
  phone: string | null;
  email: string | null;
  address: string | null;
  linkedin_url: string | null;
  company_profile_url: string | null;
  company_profile_label: string | null;
}

const LOAD_ERROR = 'Content could not be loaded from the CMS. Built-in content is shown instead.';
const SAVE_ERROR = 'The changes could not be saved. Please check your connection and try again.';
const NOT_CONNECTED = 'The content service is not connected for this website.';

const PARAGRAPH_BREAK = /\n\s*\n/;

function toParagraphs(value: string): string[] {
  return value
    .split(PARAGRAPH_BREAK)
    .map((part) => part.trim())
    .filter(Boolean);
}

function fromParagraphs(paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

function toArticle(row: ArticleRow): ArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    body: toParagraphs(row.body),
    image: row.image_url ?? undefined,
    readTime: row.read_time,
    date: row.published_at,
    published: row.published,
  };
}

function toCaseStudy(row: CaseStudyRow): CaseStudyRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    industry: row.industry ?? '',
    location: row.location ?? '',
    scope: row.scope,
    responsibilities: toParagraphs(row.responsibilities),
    approach: toParagraphs(row.approach),
    outcomes: toParagraphs(row.outcomes),
    image: row.image_url ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    confidential: row.confidential,
    published: row.published,
    sortOrder: row.sort_order,
  };
}

function toSettings(row: SettingsRow | null): SiteSettings {
  if (!row) return emptySettings;
  return {
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    linkedinUrl: row.linkedin_url ?? '',
    companyProfileUrl: row.company_profile_url ?? '',
    companyProfileLabel: row.company_profile_label ?? '',
  };
}

const seedArticleRecords: ArticleRecord[] = seedArticles.map((article) => ({
  ...article,
  id: `seed-${article.slug}`,
  published: true,
}));

const seedCaseStudies: CaseStudyRecord[] = caseStudySeeds.map((study, index) => ({
  id: `seed-${study.slug}`,
  slug: study.slug,
  title: study.title,
  industry: study.industry,
  location: study.location,
  scope: study.scope,
  responsibilities: study.responsibilities,
  approach: study.approach,
  outcomes: study.outcomes,
  image: study.image,
  imageAlt: study.imageAlt,
  confidential: study.confidential ?? false,
  published: true,
  sortOrder: index,
}));

export interface ContentBundle {
  articles: ArticleRecord[];
  caseStudies: CaseStudyRecord[];
  source: 'cms' | 'seed' | 'mixed';
}

const CACHE_TTL = 60_000;

let contentCache: { at: number; value: ContentBundle } | null = null;
let settingsCache: { at: number; value: SiteSettings } | null = null;
let settingsLoaded = false;

export function invalidateContentCache() {
  contentCache = null;
  settingsCache = null;
  settingsLoaded = false;
}

export async function loadContent(force = false): Promise<ContentBundle> {
  if (!force && contentCache && Date.now() - contentCache.at < CACHE_TTL) return contentCache.value;

  const fallback: ContentBundle = {
    articles: seedArticleRecords,
    caseStudies: seedCaseStudies,
    source: 'seed',
  };

  if (!supabase) return fallback;

  const [articlesResult, caseStudiesResult] = await Promise.all([
    supabase.from('articles').select('*').eq('published', true).order('published_at', { ascending: false }),
    supabase.from('case_studies').select('*').eq('published', true).order('sort_order', { ascending: true }),
  ]);

  const articleRows = (articlesResult.data ?? []) as unknown as ArticleRow[];
  const caseStudyRows = (caseStudiesResult.data ?? []) as unknown as CaseStudyRow[];

  const hasCmsContent = articleRows.length > 0 || caseStudyRows.length > 0;

  // CMS entries override seed entries with the same slug, so publishing an
  // article never hides the rest of the editorial library.
  const articlesBySlug = new Map<string, ArticleRecord>();
  seedArticleRecords.forEach((article) => articlesBySlug.set(article.slug, article));
  articleRows.map(toArticle).forEach((article) => articlesBySlug.set(article.slug, article));

  const studiesBySlug = new Map<string, CaseStudyRecord>();
  seedCaseStudies.forEach((study) => studiesBySlug.set(study.slug, study));
  caseStudyRows.map(toCaseStudy).forEach((study) => studiesBySlug.set(study.slug, study));

  const value: ContentBundle = {
    articles: [...articlesBySlug.values()].sort((a, b) => b.date.localeCompare(a.date)),
    caseStudies: [...studiesBySlug.values()],
    source: hasCmsContent ? 'cms' : 'seed',
  };

  contentCache = { at: Date.now(), value };
  return value;
}

export async function loadSiteSettings(force = false): Promise<SiteSettings> {
  if (!force && settingsLoaded && settingsCache && Date.now() - settingsCache.at < CACHE_TTL) {
    return settingsCache.value;
  }
  if (!supabase) return emptySettings;

  const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();
  const value = error ? emptySettings : toSettings((data ?? null) as unknown as SettingsRow | null);

  settingsCache = { at: Date.now(), value };
  settingsLoaded = true;
  return value;
}

/* ——————————————— Admin operations ——————————————— */

export interface ArticleInput {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string[];
  image?: string;
  readTime: string;
  date: string;
  published: boolean;
}

export interface CaseStudyInput {
  slug: string;
  title: string;
  industry: string;
  location: string;
  scope: string;
  responsibilities: string[];
  approach: string[];
  outcomes: string[];
  image?: string;
  imageAlt?: string;
  confidential: boolean;
  published: boolean;
  sortOrder: number;
}

export async function fetchAdminContent(): Promise<{
  articles: ArticleRecord[];
  caseStudies: CaseStudyRecord[];
  error: string | null;
}> {
  if (!supabase) return { articles: [], caseStudies: [], error: NOT_CONNECTED };

  const [articlesResult, caseStudiesResult] = await Promise.all([
    supabase.from('articles').select('*').order('published_at', { ascending: false }),
    supabase.from('case_studies').select('*').order('sort_order', { ascending: true }),
  ]);

  if (articlesResult.error || caseStudiesResult.error) {
    return { articles: [], caseStudies: [], error: LOAD_ERROR };
  }

  return {
    articles: ((articlesResult.data ?? []) as unknown as ArticleRow[]).map(toArticle),
    caseStudies: ((caseStudiesResult.data ?? []) as unknown as CaseStudyRow[]).map(toCaseStudy),
    error: null,
  };
}

export async function saveArticle(input: ArticleInput, id?: string): Promise<string | null> {
  if (!supabase) return NOT_CONNECTED;

  const payload = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    category: input.category.trim(),
    excerpt: input.excerpt.trim(),
    body: fromParagraphs(input.body),
    image_url: input.image?.trim() || null,
    read_time: input.readTime.trim(),
    published: input.published,
    published_at: input.date,
    updated_at: new Date().toISOString(),
  };

  const result = id
    ? await supabase.from('articles').update(payload).eq('id', id)
    : await supabase.from('articles').insert(payload);

  if (result.error) {
    if (result.error.code === '23505') return 'That slug is already used by another article.';
    return SAVE_ERROR;
  }

  invalidateContentCache();
  return null;
}

export async function deleteArticle(id: string): Promise<string | null> {
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) return 'The article could not be deleted.';
  invalidateContentCache();
  return null;
}

export async function saveCaseStudy(input: CaseStudyInput, id?: string): Promise<string | null> {
  if (!supabase) return NOT_CONNECTED;

  const payload = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    industry: input.industry.trim() || null,
    location: input.location.trim() || null,
    scope: input.scope.trim(),
    responsibilities: fromParagraphs(input.responsibilities),
    approach: fromParagraphs(input.approach),
    outcomes: fromParagraphs(input.outcomes),
    image_url: input.image?.trim() || null,
    image_alt: input.imageAlt?.trim() || null,
    confidential: input.confidential,
    published: input.published,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  };

  const result = id
    ? await supabase.from('case_studies').update(payload).eq('id', id)
    : await supabase.from('case_studies').insert(payload);

  if (result.error) {
    if (result.error.code === '23505') return 'That slug is already used by another case study.';
    return SAVE_ERROR;
  }

  invalidateContentCache();
  return null;
}

export async function deleteCaseStudy(id: string): Promise<string | null> {
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase.from('case_studies').delete().eq('id', id);
  if (error) return 'The case study could not be deleted.';
  invalidateContentCache();
  return null;
}

export async function saveSiteSettings(next: SiteSettings): Promise<string | null> {
  if (!supabase) return NOT_CONNECTED;

  const { error } = await supabase.from('site_settings').upsert(
    {
      id: true,
      phone: next.phone.trim() || null,
      email: next.email.trim() || null,
      address: next.address.trim() || null,
      linkedin_url: next.linkedinUrl.trim() || null,
      company_profile_url: next.companyProfileUrl.trim() || null,
      company_profile_label: next.companyProfileLabel.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) return SAVE_ERROR;
  invalidateContentCache();
  return null;
}

/* ——————————————— Hooks ——————————————— */

export function usePublishedContent() {
  const [state, setState] = useState<ContentBundle>({
    articles: seedArticleRecords,
    caseStudies: seedCaseStudies,
    source: 'seed',
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadContent().then((value) => {
      if (!active) return;
      setState(value);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...state, loaded };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);

  useEffect(() => {
    let active = true;
    loadSiteSettings().then((value) => {
      if (active) setSettings(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
