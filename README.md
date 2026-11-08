# EcoHealth & Transport Solutions Ltd — corporate website

Premium corporate site for a Rwanda-based EHS, environmental, training, telecom field, transport safety and waste management consultancy.

**Stack:** Vite 7 · React 18 · TypeScript · Tailwind CSS 3 · Supabase (enquiries, CMS, auth)

---

## Local development

```bash
npm install
cp .env.example .env   # then fill in Supabase keys
npm run dev            # http://localhost:5173
```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Generates the sitemap, then builds to `dist/` |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | ESLint |
| `npm run sitemap` | Regenerate `public/sitemap.xml` and `public/robots.txt` |

Requires the Node versions Vite 7 supports (Node 20.19+ or 22.12+). The sitemap script compiles the shared content module through Vite's own esbuild transform, so it does not depend on Node's experimental TypeScript stripping.

---

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Public anon key (Row Level Security protects data) |
| `VITE_SITE_URL` | at deploy | Canonical origin, e.g. `https://www.ecohealth.rw` — used for canonical links, Open Graph, sitemap |
| `VITE_GA_ID` | no | Google Analytics 4 measurement ID |
| `VITE_PLAUSIBLE_DOMAIN` | no | Plausible domain (cookieless) |

If Supabase is not configured the site still renders: the enquiry form reports that it is not connected and the built-in seed content is used. No analytics script is loaded unless an ID is present.

---

## Supabase setup

1. Create a project and copy the URL and anon key into `.env`.
2. Apply the migrations in `supabase/migrations/` **in filename order** (SQL editor or `supabase db push`):
   - `20261107204319_create_enquiries_table` — enquiries table and RLS
   - `20261107211137_admin_panel_access_control` — `admin_users` allowlist
   - `20261107211400_admin_panel_restrict_grants` — least-privilege grants
   - `20261108093000_cms_content_and_settings` — articles, case studies, site settings
3. Create a staff account in Authentication, then add it to the admin list:

   ```sql
   INSERT INTO admin_users (user_id)
   SELECT id FROM auth.users WHERE email = 'you@example.com'
   ON CONFLICT DO NOTHING;
   ```

4. Sign in at `/admin`.

### Lead notifications (optional)

Enquiries are always stored in Postgres first. To also receive email:

1. Deploy `supabase/functions/notify-enquiry` (see the header comment in that file).
2. Set the `RESEND_API_KEY`, `NOTIFY_EMAIL`, `NOTIFY_FROM` and optional `NOTIFY_SECRET` secrets.
3. Add a Database Webhook on `enquiries` for `INSERT` pointing at the function URL.

Until that is configured the admin panel remains the source of truth for new leads.

---

## Admin panel (`/admin`)

- **Enquiries** — read submissions, filter by status, mark new → contacted → closed.
- **Articles** — create/edit/publish Insights articles. Paragraphs are separated by a blank line. New categories become public filters automatically.
- **Case studies** — create/edit/publish Projects entries with structured scope, responsibilities, approach, outcomes and a confidential-client flag.
- **Site details** — publish verified contact details, LinkedIn and the approved company profile PDF link, plus a launch checklist.

Published content is cached in memory for 60 seconds; saving in the admin panel invalidates the cache. If the CMS has no published articles, the site falls back to the seed articles in `src/data/content.ts`.

---

## Deployment

```bash
npm run build
```

Upload the contents of `dist/`. The build is a single-page app with clean URLs, so the host must rewrite unknown paths to `index.html`:

- **Apache / XAMPP** — `public/.htaccess` is copied into the build.
- **Netlify / Cloudflare Pages** — `public/_redirects` is copied into the build.
- **Vercel** — import the GitHub repository and use the Vite preset, `npm run build` as the build command, and `dist` as the output directory. `vercel.json` configures the SPA fallback. Set the `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` environment variables in the Vercel project before deploying.
- **Other hosts** — configure an equivalent SPA fallback.

Set `VITE_SITE_URL` before building so the sitemap, canonical URLs and Open Graph tags use the live domain (the fallback is `https://www.ecohealth.rw`).

---

## Content integrity

The site deliberately does not invent company history, staff, clients, testimonials, statistics, certifications, phone numbers, emails or addresses. Anything unverified is either omitted or shown as an honest placeholder:

- case studies render only when published in the CMS;
- contact details render only when set in **Admin → Site details**;
- the company profile download appears only when a URL is set;
- mission, vision and the privacy summary are marked as pending approval.

---

## Brand assets

- `src/components/Logo.tsx` holds the scalable lockup used by the header, footer and admin. Replace the SVG paths with the official artwork when approved.
- `public/favicon.svg` mirrors the same mark.
- `public/og-image.png` is the 1200×630 social card. Regenerate it if the wordmark or tagline changes.
- Photography is loaded from a remote CDN with responsive `srcset` and lazy loading. Swap the URLs for owned photography when available.
