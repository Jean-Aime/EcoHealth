/**
 * Generates public/sitemap.xml and public/robots.txt at build time.
 *
 * Static routes and service pages come from the same content module the site
 * renders. Published article slugs are read from Supabase when credentials are
 * present, so CMS content is included without a second source of truth.
 *
 * Usage: npm run sitemap   (also runs automatically before npm run build)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformWithEsbuild } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = resolve(root, 'public');

/**
 * Loads the shared content module through Vite's esbuild transform so this
 * script runs on every Node version Vite supports (including Node 20), not
 * only on versions with unflagged TypeScript stripping.
 */
async function loadContent() {
  const contentPath = resolve(root, 'src/data/content.ts');
  const { code } = await transformWithEsbuild(readFileSync(contentPath, 'utf8'), contentPath, {
    format: 'esm',
    target: 'esnext',
    sourcemap: false,
  });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  return import(dataUrl);
}

const { articles, primaryServices } = await loadContent();

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        if (index === -1) return [line.trim(), ''];
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, '');
        return [line.slice(0, index).trim(), value];
      }),
  );
}

const env = readEnvFile(resolve(root, '.env'));
const siteUrl = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || 'https://www.ecohealth.rw').replace(/\/+$/, '');

async function fetchCmsArticleSlugs() {
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return [];

  try {
    const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/articles?select=slug,published_at&published=eq.true`;
    const response = await fetch(endpoint, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    if (!response.ok) return [];
    const rows = await response.json();
    return Array.isArray(rows) ? rows.filter((row) => row?.slug) : [];
  } catch {
    return [];
  }
}

const today = new Date().toISOString().slice(0, 10);
const entries = new Map();

function add(path, { lastmod = today, priority = '0.7', changefreq = 'monthly' } = {}) {
  if (entries.has(path)) return;
  entries.set(path, { path, lastmod, priority, changefreq });
}

add('/', { priority: '1.0', changefreq: 'weekly' });
add('/about', { priority: '0.8' });
add('/services', { priority: '0.9' });
add('/training', { priority: '0.8' });
add('/projects', { priority: '0.7' });
add('/insights', { priority: '0.8', changefreq: 'weekly' });
add('/partners', { priority: '0.8' });
add('/contact', { priority: '0.9' });
add('/privacy', { priority: '0.3', changefreq: 'yearly' });

for (const service of primaryServices) {
  add(`/services/${service.slug}`, { priority: '0.9' });
}

const cmsArticles = await fetchCmsArticleSlugs();
const articleSlugs = new Map();

for (const article of articles) {
  articleSlugs.set(article.slug, article.date);
}
for (const row of cmsArticles) {
  articleSlugs.set(row.slug, (row.published_at || today).slice(0, 10));
}

for (const [slug, lastmod] of articleSlugs) {
  add(`/insights/${slug}`, { lastmod, priority: '0.6' });
}

const urlEntries = [...entries.values()]
  .map(
    (entry) => `  <url>
    <loc>${siteUrl}${entry.path === '/' ? '/' : entry.path}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`;

writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(resolve(publicDir, 'robots.txt'), robots, 'utf8');

console.log(
  `Sitemap: ${entries.size} URLs written for ${siteUrl} (${articleSlugs.size} articles, ${primaryServices.length} services).`,
);
