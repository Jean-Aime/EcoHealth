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
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes* | Supabase publishable key (RLS protects data) |
| `VITE_SUPABASE_ANON_KEY` | legacy | Older public anon key; used only when no publishable key is set |
| `VITE_SITE_URL` | at deploy | Canonical origin, e.g. `https://www.ecohealth.rw` — used for canonical links, Open Graph, sitemap |
| `VITE_GA_ID` | no | Google Analytics 4 measurement ID |
| `VITE_PLAUSIBLE_DOMAIN` | no | Plausible domain (cookieless) |

*Set `VITE_SUPABASE_URL` and either the publishable key or legacy anon key. If Supabase is not configured the site still renders, but database-backed forms and training features are unavailable. No analytics script is loaded unless an ID is present.

---

## Supabase setup

1. Copy the project URL and publishable key (or legacy anon key) into `.env`.
2. Apply the migrations in `supabase/migrations/` **in filename order** (SQL editor or `supabase db push`):
   - `20261107204319_create_enquiries_table` — enquiries table and RLS
   - `20261107211137_admin_panel_access_control` — `admin_users` allowlist
   - `20261107211400_admin_panel_restrict_grants` — least-privilege grants
   - `20261108093000_cms_content_and_settings` — articles, case studies, site settings
   - `20261117120000_enquiry_hardening` — field length/format checks, stored-value normalisation, status pinning and per-email submission throttling (three per ten minutes)
   - `20261117154500_training_management_system` — training catalogue, learner records, registrations, attendance, assessments, certificates, private materials and corporate requests
   - `20261118103000_online_learning` — online programme chapters, learner chapter progress, course completion records, certificate gating and the chapter RPCs
   - `20261118170000_allow_incomplete_unpublished_training_drafts` — permits incomplete unpublished course drafts while requiring a confirmed duration and delivery format before publication
   - `20261118182000_require_course_details_before_publication` — requires published courses to include learning objectives, target participants, prerequisites, summary and description
   - `20261118190000_training_staff_and_payment_tracking` — private trainer profiles, session trainer assignment and learner/admin-scoped manual payment status
3. Create a staff account in Authentication, then grant it admin access by running `supabase/manual/authorize_admin.sql` in the Supabase SQL Editor after replacing the placeholder email. The script does not create accounts or passwords. Alternatively, add the existing Auth account manually:

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

### Training management system

The public training catalogue is at `/training`. It displays only database courses that an authorized staff member has published; each course links to its full description, objectives, target participants, prerequisites, duration, delivery formats and available sessions. Learners use `/learner`; staff manage offerings from **Admin → Training**. Migrations deliberately create no course offerings, sessions, learner records or certificates. Unpublished proposed-topic drafts can be added from `supabase/manual/seed_training_courses.sql` after all migrations.

`supabase/manual/seed_website_content.sql` imports the four existing built-in Insights articles into the CMS and ensures the five suggested training categories exist. Run it after all migrations. It is safe to rerun and will not overwrite existing article/category edits. It does not create case studies, courses, sessions, learner records, assessments, certificates, or contact details; add those only from confirmed company information.

The course seed publishes eight awareness-course outlines based on the topics supplied in the blueprint. It includes proposed copy, learning objectives, target participants, prerequisites, indicative durations, and classroom/on-site delivery formats so visitors can review the courses. Review and adjust this starter content in **Admin → Training → Courses & categories** before delivery. The seed does not invent prices, sessions, trainers, assessments, credentials, certificates, or participant records. Run it after the draft/publication-detail migrations and `seed_website_content.sql`; then add real dates and delivery details separately under **Admin → Training → Sessions**.

Learner registration requires an email-confirmed Supabase Auth account. In **Authentication → URL Configuration**, set the production Site URL and allow the deployed `/learner` URL as a redirect. Configure custom SMTP for Supabase Auth (Resend may be used) so confirmation messages are deliverable. Registration requests are held pending staff approval; they reserve session capacity until rejected, waitlisted or cancelled.

Training email notifications are optional; database records remain the source of truth if email has not been configured:

1. Deploy `supabase/functions/notify-training` with `supabase functions deploy notify-training --no-verify-jwt`.
2. Set the Edge Function secrets `RESEND_API_KEY`, `TRAINING_NOTIFY_EMAIL` (comma-separated staff recipients), `NOTIFY_FROM` (a verified Resend sender), and a strong random `TRAINING_NOTIFY_SECRET`. Set `SITE_URL` to the public site origin for certificate links. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions; keep the service-role key server-side.
3. Add database webhooks for `training_registrations` (INSERT and UPDATE), `training_corporate_requests` (INSERT and UPDATE), and `training_certificates` (INSERT). Point each to `https://<project-ref>.supabase.co/functions/v1/notify-training` and send the `x-training-notify-secret` header with the same secret.

The function emails registration receipt/status changes, corporate request receipt/status changes, and certificate links. The webhook is protected by the required shared secret; the function uses the server-only service-role key only to load session and certificate-recipient details.

Trainer contact and qualification details are restricted to training administrators; public sessions expose no trainer profile details. Payment tracking records the current due/received amounts and manually confirmed method/reference per registration. It is not an online payment gateway and does not store card data or provide payment-provider reconciliation or refunds.

### Online learning

Staff build chapter-based online programmes from approved material in **Admin → Training → Online learning**:

1. Choose a course and import a **PDF or DOCX** (20 MB limit). The importer runs in the administrator's browser, so no service key is used. Document headings (Word heading styles, PDF large/bold headings, “Chapter/Module/Section/Unit” titles and numbered headings) become chapters; the text beneath each heading becomes that chapter's reading body. Documents without detectable headings are split into readable parts. Scanned, image-only PDFs are rejected with a message — convert them to text first.
2. Review and edit the generated chapters: title, summary, reading time, body text, order and visibility. Saving replaces the stored chapter set; chapters that were removed lose their progress rows.
3. Enable online delivery. Only then does the programme appear on the public course page and in learner portals, and only for learners with an **approved registration**. Optionally require every published chapter to be complete before a certificate can be issued.

Learners read at `/learner/courses/<course-id>`, mark each chapter complete to continue, and can reopen a chapter. Progress and completion are stored per account (`training_lesson_progress`, `training_online_completions`). Chapter bodies are not readable directly from the API: `get_learning_course()` checks course access first, and the public catalogue only sees titles, summaries and timings. Administrators see live learner counts in the Online learning panel.

Assessments in this release are configured and scored by authorized staff (for example, for an in-person or separately delivered assessment); there is no online question bank or self-marking exam flow. Course prices are informational only—no payment processor or checkout is connected.

Before launch, test the full journey in a non-production Supabase project: learner email confirmation, capacity and duplicate handling, approval, attendance, each active required assessment, certificate issuance and revocation/verification, private material access, group participant linking, and corporate requests. Configure the authorized certificate issuer only after EcoHealth has confirmed the issuer details. A certificate can be issued only after its session is marked completed, attendance is present, and each active assessment required for that course has a passing result.

---

## Admin panel (`/admin`)

- **Enquiries** — read submissions, filter by status, mark new → contacted → closed.
- **Articles** — create/edit/publish Insights articles. Paragraphs are separated by a blank line. New categories become public filters automatically.
- **Case studies** — create/edit/publish Projects entries with structured scope, responsibilities, approach, outcomes and a confidential-client flag.
- **Training** — create verified categories, courses and sessions; review registrations and corporate requests; record attendance and assessments; manage private materials; build online programmes from imported PDF/DOCX chapters and enable online delivery; review live learner progress; configure issuers; issue and revoke certificates; export participant reports.
- **Site details** — publish verified contact details, LinkedIn and the approved company profile PDF link, plus a launch checklist.

Published content is cached in memory for 60 seconds; saving in the admin panel invalidates the cache. If the CMS has no published articles, the site falls back to the seed articles in `src/data/content.ts`.

---

## Security hardening

Controls that ship with the application:

- **Security headers** are configured for every supported host: `public/.htaccess` (Apache/XAMPP), `public/_headers` (Netlify/Cloudflare Pages) and `vercel.json` (Vercel). They set a Content-Security-Policy with `frame-ancestors 'none'`, HSTS on HTTPS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and cross-origin isolation headers. If you add a third-party script, image host, font host or API, add its origin to the matching directive in **all three** files — otherwise the browser blocks it.
- **Enquiry validation** is enforced twice: in the form (`src/lib/enquiryValidation.ts`) and in Postgres (`20261117120000_enquiry_hardening.sql`). Client-side limits are never trusted on their own.
- **Access control** is enforced by Supabase Row Level Security and column grants, not by hiding buttons. Public visitors can only insert enquiries; only accounts listed in `admin_users` can read them or change a status. Re-run `20261107211400_admin_panel_restrict_grants` if you recreate the project.
- **Secrets** stay server-side. Only the Supabase URL and anon key are exposed to the browser; the anon key is designed to be public and is constrained by RLS. Never add a service-role key to a `VITE_` variable. `.env`, `.env.*` and `.dev.vars` are ignored by Git; `.env.example` is the template.
- **Submission throttling** in the migration limits repeated enquiries from one email address. For sustained automated abuse, also apply rate limiting at your host, CDN or WAF — the database trigger is defence in depth, not an edge rate limiter.
- **Training records** are protected by Supabase RLS and server-side RPC checks. Registration, attendance, assessment, chapter progress and certificate writes use guarded database functions. Training materials are stored in a private bucket with a MIME allowlist, size limit and eligibility-based access. Do not expose a service-role key to the browser.
- **Online chapter text** is not granted to any client role. Readers receive it only from `get_learning_course()`, which requires an approved registration; chapter writes are confined to `save_course_chapters()` and `set_course_online_settings()` for administrators. Certificate issuance additionally refuses to run when a course requires online completion and the participant has not finished every published chapter.

After applying the migrations, verify the headers on the deployed origin (`curl -I https://your-domain`) and submit a test enquiry before considering the deployment complete.

## Deployment

```bash
npm run build
```

Upload the contents of `dist/`. The build is a single-page app with clean URLs, so the host must rewrite unknown paths to `index.html`:

- **Apache / XAMPP** — `public/.htaccess` is copied into the build.
- **Netlify / Cloudflare Pages** — `public/_redirects` is copied into the build.
- **Vercel** — import the GitHub repository and use the Vite preset, `npm run build` as the build command, and `dist` as the output directory. `vercel.json` configures the SPA fallback. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (or legacy `VITE_SUPABASE_ANON_KEY`), and `VITE_SITE_URL` in the Vercel project before deploying.
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
