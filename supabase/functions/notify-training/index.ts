interface WebhookRecord {
  id?: string;
  session_id?: string;
  participant_id?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string | null;
  registration_type?: string;
  organisation?: string | null;
  participant_count?: number;
  status?: string;
  review_note?: string;
  email?: string;
  telephone?: string;
  requirements?: string;
  participant_estimate?: number;
  preferred_dates?: string;
  location?: string;
  additional_information?: string;
  admin_note?: string;
  certificate_number?: string;
  participant_name?: string;
  course_title?: string;
  completion_date?: string;
  verification_code?: string;
  created_at?: string;
  updated_at?: string;
}

interface WebhookPayload {
  type?: string;
  table?: string;
  record?: WebhookRecord;
  old_record?: WebhookRecord;
}

interface SessionDetails {
  starts_at: string;
  ends_at: string;
  location: string;
  training_courses?: { title: string } | null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const singleLine = (value: string, max = 160) =>
  value.split('\r').join(' ').split('\n').join(' ').split(String.fromCharCode(0)).join(' ').replace(/\s+/g, ' ').trim().slice(0, max);

const validEmail = (value: string | undefined): value is string =>
  Boolean(value && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value));

const MAX_BODY_BYTES = 16 * 1024;
const RESEND_URL = 'https://api.resend.com/emails';

async function loadSession(sessionId: string): Promise<SessionDetails | null> {
  const projectUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!projectUrl || !serviceKey) throw new Error('Training notification database access is not configured.');

  const url = new URL('/rest/v1/training_sessions', projectUrl);
  url.searchParams.set('id', `eq.${sessionId}`);
  url.searchParams.set('select', 'starts_at,ends_at,location,training_courses(title)');
  const response = await fetch(url, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok) throw new Error('Training session details could not be loaded.');
  const rows = (await response.json()) as SessionDetails[];
  return rows[0] ?? null;
}

async function loadParticipantEmail(participantId: string): Promise<string | null> {
  const projectUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!projectUrl || !serviceKey) throw new Error('Training notification database access is not configured.');

  const url = new URL('/rest/v1/training_participants', projectUrl);
  url.searchParams.set('id', `eq.${participantId}`);
  url.searchParams.set('select', 'email');
  const response = await fetch(url, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok) throw new Error('Certificate recipient details could not be loaded.');
  const rows = (await response.json()) as { email: string }[];
  return rows[0]?.email ?? null;
}

async function sendEmail(input: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('NOTIFY_FROM');
  if (!apiKey || !from) throw new Error('Resend email delivery is not configured.');

  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: singleLine(input.subject, 180),
      html: input.html,
      ...(input.replyTo ? { reply_to: singleLine(input.replyTo, 254) } : {}),
    }),
  });
  if (!response.ok) throw new Error(`Resend rejected the message (status ${response.status}).`);
}

const emailShell = (heading: string, body: string) => `
  <div style="font-family:Arial,sans-serif;color:#252B29;line-height:1.6;max-width:640px">
    <h2 style="color:#0B3522">${escapeHtml(heading)}</h2>
    ${body}
    <p style="color:#737B76;font-size:12px;margin-top:28px">EcoHealth &amp; Transport Solutions Ltd</p>
  </div>
`;

async function notifyRegistration(record: WebhookRecord, oldRecord?: WebhookRecord): Promise<boolean> {
  if (!validEmail(record.contact_email) || !record.id) return false;
  const isNew = !oldRecord;
  if (!isNew && oldRecord.status === record.status) return false;
  const session = record.session_id ? await loadSession(record.session_id) : null;
  const courseTitle = session?.training_courses?.title ?? 'Training session';
  const date = session?.starts_at
    ? new Date(session.starts_at).toLocaleString('en-GB', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Africa/Kigali',
      })
    : 'To be confirmed';
  const location = session?.location || 'To be confirmed';

  if (isNew) {
    const adminRecipients = (Deno.env.get('TRAINING_NOTIFY_EMAIL') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(validEmail);
    if (!adminRecipients.length) throw new Error('Training notification recipients are not configured.');
    await sendEmail({
      to: adminRecipients,
      replyTo: validEmail(record.contact_email) ? record.contact_email : undefined,
      subject: `New training registration: ${courseTitle}`,
      html: emailShell('New training registration', `
        <p>A training registration has been submitted and is waiting for staff review.</p>
        <ul>
          <li>Course: ${escapeHtml(courseTitle)}</li>
          <li>Session: ${escapeHtml(date)}</li>
          <li>Location: ${escapeHtml(location)}</li>
          <li>Contact: ${escapeHtml(record.contact_name ?? 'Not provided')}</li>
          <li>Email: ${escapeHtml(record.contact_email)}</li>
          <li>Organisation: ${escapeHtml(record.organisation ?? 'Individual')}</li>
          <li>Participants: ${record.participant_count ?? 1}</li>
        </ul>
      `),
    });
    await sendEmail({
      to: [record.contact_email],
      subject: 'Training registration received',
      html: emailShell('We received your registration request', `
        <p>Hello ${escapeHtml(record.contact_name ?? '')},</p>
        <p>Your request for <strong>${escapeHtml(courseTitle)}</strong> has been received and is pending staff approval.</p>
        <p>Session: ${escapeHtml(date)}<br>Location: ${escapeHtml(location)}</p>
        <p>You can sign in to the learner portal to check its status.</p>
      `),
    });
    return true;
  }

  if (!validEmail(record.contact_email)) return false;
  await sendEmail({
    to: [record.contact_email],
    subject: `Training registration update: ${record.status ?? 'updated'}`,
    html: emailShell('Your registration has been updated', `
      <p>Hello ${escapeHtml(record.contact_name ?? '')},</p>
      <p>Your request for <strong>${escapeHtml(courseTitle)}</strong> is now <strong>${escapeHtml(record.status ?? 'updated')}</strong>.</p>
      ${record.review_note ? `<p>${escapeHtml(record.review_note)}</p>` : ''}
      <p>Session: ${escapeHtml(date)}<br>Location: ${escapeHtml(location)}</p>
    `),
  });
  return true;
}

async function notifyCorporateRequest(record: WebhookRecord, oldRecord?: WebhookRecord): Promise<boolean> {
  if (oldRecord && oldRecord.status === record.status) return false;
  if (!validEmail(record.email)) return false;

  if (!oldRecord) {
    const recipients = (Deno.env.get('TRAINING_NOTIFY_EMAIL') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(validEmail);
    if (!recipients.length) throw new Error('Training notification recipients are not configured.');
    await sendEmail({
      to: recipients,
      replyTo: record.email,
      subject: `Corporate training request: ${record.organisation ?? 'New organisation'}`,
      html: emailShell('New corporate training request', `
        <ul>
          <li>Organisation: ${escapeHtml(record.organisation ?? '')}</li>
          <li>Contact: ${escapeHtml(record.contact_name ?? '')}</li>
          <li>Email: ${escapeHtml(record.email)}</li>
          <li>Telephone: ${escapeHtml(record.telephone ?? '')}</li>
          <li>Estimated participants: ${record.participant_estimate ?? ''}</li>
          <li>Preferred dates: ${escapeHtml(record.preferred_dates ?? 'Not specified')}</li>
          <li>Location: ${escapeHtml(record.location ?? 'Not specified')}</li>
        </ul>
        <h3>Requirements</h3>
        <p style="white-space:pre-wrap">${escapeHtml(record.requirements ?? '')}</p>
        ${record.additional_information ? `<h3>Additional information</h3><p style="white-space:pre-wrap">${escapeHtml(record.additional_information)}</p>` : ''}
      `),
    });
    await sendEmail({
      to: [record.email],
      subject: 'Corporate training request received',
      html: emailShell('Thank you for contacting our training team', `
        <p>Hello ${escapeHtml(record.contact_name ?? '')},</p>
        <p>Your request for corporate training has been received. Our team will review your requirements and respond.</p>
      `),
    });
    return true;
  }

  await sendEmail({
    to: [record.email],
    subject: `Corporate training request update: ${record.status ?? 'updated'}`,
    html: emailShell('Your corporate training request has been updated', `
      <p>Hello ${escapeHtml(record.contact_name ?? '')},</p>
      <p>Your request is now <strong>${escapeHtml(record.status ?? 'updated')}</strong>.</p>
      ${record.admin_note ? `<p>${escapeHtml(record.admin_note)}</p>` : ''}
    `),
  });
  return true;
}

async function notifyCertificate(record: WebhookRecord): Promise<boolean> {
  if (!record.participant_id || !record.certificate_number || !record.verification_code) return false;
  const recipient = await loadParticipantEmail(record.participant_id);
  if (!validEmail(recipient)) return false;

  const siteUrl = (Deno.env.get('VITE_SITE_URL') ?? Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
  const verificationUrl = siteUrl
    ? `${siteUrl}/certificates/verify/${encodeURIComponent(record.verification_code)}`
    : '';
  await sendEmail({
    to: [recipient],
    subject: 'Your EcoHealth training certificate',
    html: emailShell('Your training certificate is ready', `
      <p>Hello ${escapeHtml(record.participant_name ?? '')},</p>
      <p>A certificate has been issued for <strong>${escapeHtml(record.course_title ?? 'your training course')}</strong>.</p>
      <p>Certificate reference: <strong>${escapeHtml(record.certificate_number)}</strong><br>
      Completion date: ${escapeHtml(record.completion_date ?? '')}</p>
      ${verificationUrl ? `<p><a href="${escapeHtml(verificationUrl)}">Verify certificate</a></p>` : '<p>Use the certificate reference on the public verification page.</p>'}
    `),
  });
  return true;
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const secret = Deno.env.get('TRAINING_NOTIFY_SECRET');
  if (!secret || request.headers.get('x-training-notify-secret') !== secret) {
    return json({ error: 'Unauthorised' }, 401);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json({ error: 'Payload too large' }, 413);
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const record = payload.record;
    if (!record) return json({ error: 'Webhook record is missing' }, 400);
    let sent = false;
    if (payload.table === 'training_registrations' && ['INSERT', 'UPDATE'].includes(payload.type ?? '')) {
      sent = await notifyRegistration(record, payload.type === 'UPDATE' ? payload.old_record : undefined);
    } else if (payload.table === 'training_corporate_requests' && ['INSERT', 'UPDATE'].includes(payload.type ?? '')) {
      sent = await notifyCorporateRequest(record, payload.type === 'UPDATE' ? payload.old_record : undefined);
    } else if (payload.table === 'training_certificates' && payload.type === 'INSERT') {
      sent = await notifyCertificate(record);
    } else {
      return json({ skipped: true, reason: 'Unsupported training notification event.' });
    }
    return json({ sent });
  } catch (error) {
    console.error('Training notification delivery failed', error);
    return json({ error: 'Training notification delivery failed.' }, 502);
  }
});
