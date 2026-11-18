/**
 * Supabase Edge Function — lead notification.
 *
 * Runs on Deno, outside the Vite build. It is intentionally optional: the site
 * writes every enquiry to the `enquiries` table first, so nothing is lost when
 * email delivery is not configured yet.
 *
 * Deploy:
 *   supabase functions deploy notify-enquiry --no-verify-jwt
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   RESEND_API_KEY   Resend API key
 *   NOTIFY_EMAIL     Where new enquiries are delivered (comma separated)
 *   NOTIFY_FROM      Verified sender, e.g. "EcoHealth Website <website@ecohealth.rw>"
 *   NOTIFY_SECRET    Optional shared secret checked against x-webhook-secret
 *
 * Then add a Database Webhook (Supabase → Database → Webhooks):
 *   table: enquiries, event: INSERT
 *   URL: https://<project-ref>.supabase.co/functions/v1/notify-enquiry
 *   HTTP header: x-webhook-secret: <NOTIFY_SECRET>
 */

interface EnquiryRecord {
  full_name?: string;
  organisation?: string | null;
  email?: string;
  telephone?: string | null;
  service_required?: string;
  project_location?: string | null;
  description?: string;
  preferred_contact?: string;
  enquiry_type?: string;
  created_at?: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Strips CR/LF so submitted values cannot inject extra mail headers. */
const singleLine = (value: string, max = 160) =>
  value.replace(/[\r\n\u0000]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

const MAX_BODY_BYTES = 16 * 1024;

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const secret = Deno.env.get('NOTIFY_SECRET');
  if (secret && request.headers.get('x-webhook-secret') !== secret) {
    return json({ error: 'Unauthorised' }, 401);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ error: 'Unreadable body' }, 400);
  }

  if (raw.length > MAX_BODY_BYTES) return json({ error: 'Payload too large' }, 413);

  let payload: { record?: EnquiryRecord } & EnquiryRecord;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const record = payload.record ?? payload;
  if (!record.email || !record.full_name || !record.description) {
    return json({ error: 'Not an enquiry record' }, 400);
  }

  if (String(record.email).length > 254 || String(record.description).length > 4000) {
    return json({ error: 'Enquiry record exceeds permitted length' }, 413);
  }

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const recipients = (Deno.env.get('NOTIFY_EMAIL') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const from = Deno.env.get('NOTIFY_FROM') ?? 'EcoHealth Website <onboarding@resend.dev>';

  if (!apiKey || recipients.length === 0) {
    return json({ skipped: true, reason: 'Email delivery is not configured yet.' });
  }

  const rows: [string, string][] = [
    ['Name', record.full_name],
    ['Organisation', record.organisation ?? '—'],
    ['Email', record.email],
    ['Telephone', record.telephone ?? '—'],
    ['Enquiry type', record.enquiry_type ?? 'quote'],
    ['Service / course', record.service_required ?? '—'],
    ['Location', record.project_location ?? '—'],
    ['Preferred contact', record.preferred_contact ?? 'email'],
    ['Received', record.created_at ?? new Date().toISOString()],
  ];

  const html = `
    <h2 style="font-family:sans-serif;color:#0B3522">New website enquiry</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#737B76">${escapeHtml(label)}</td><td style="padding:6px 0;color:#252B29">${escapeHtml(
              String(value),
            )}</td></tr>`,
        )
        .join('')}
    </table>
    <h3 style="font-family:sans-serif;color:#0B3522;margin-top:24px">Requirements</h3>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;color:#252B29">${escapeHtml(record.description)}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      reply_to: singleLine(record.email, 254),
      subject: `New enquiry: ${singleLine(record.service_required ?? 'Website', 120)} — ${singleLine(
        record.full_name,
        120,
      )}`,
      html,
    }),
  });

  if (!response.ok) {
    // Returning a non-2xx lets the webhook retry instead of silently dropping the lead.
    return json({ error: 'Email provider rejected the message', status: response.status }, 502);
  }

  return json({ sent: true });
});
