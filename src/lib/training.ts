import { supabase } from '@/lib/supabase';

export type DeliveryFormat = 'classroom' | 'onsite' | 'online' | 'hybrid';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'cancelled';
export type CorporateRequestStatus = 'new' | 'under_review' | 'responded' | 'closed';

export interface TrainingCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

export interface VerifiedTrainingCertificate {
  verified: boolean;
  certificate_number: string;
  participant_name: string;
  course_title: string;
  completion_date: string;
  issuer_name: string;
  issuer_title: string;
  issuer_organisation: string;
  issued_at: string;
}

export interface TrainingCourse {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  learning_objectives: string[];
  target_audience: string;
  prerequisites: string;
  duration_minutes: number | null;
  delivery_formats: DeliveryFormat[];
  price_minor: number | null;
  currency: string;
  requires_assessment: boolean;
  passing_score: number;
  online_enabled: boolean;
  require_online_completion: boolean;
  published: boolean;
  archived_at: string | null;
  category?: TrainingCategory;
}

export async function fetchPublicTrainingSession(id: string): Promise<
  TrainingResult<{ session: TrainingSession | null; course: TrainingCourse | null }>
> {
  if (!supabase) return { data: { session: null, course: null }, error: unavailable };
  const { data: session, error: sessionError } = await supabase
    .from('training_sessions')
    .select('id, course_id, starts_at, ends_at, location, delivery_format, capacity, price_minor, status, published')
    .eq('id', id)
    .eq('published', true)
    .eq('status', 'open')
    .gt('starts_at', new Date().toISOString())
    .maybeSingle();
  if (sessionError) return { data: { session: null, course: null }, error: loadFailed };
  if (!session) return { data: { session: null, course: null }, error: null };
  const [courseResult, categoryResult] = await Promise.all([
    supabase
      .from('training_courses')
      .select('*')
      .eq('id', session.course_id)
      .eq('published', true)
      .is('archived_at', null)
      .maybeSingle(),
    supabase.from('training_categories').select('*'),
  ]);
  if (courseResult.error || categoryResult.error) {
    return { data: { session: null, course: null }, error: loadFailed };
  }
  const categories = (categoryResult.data ?? []) as TrainingCategory[];
  const course = courseResult.data as TrainingCourse | null;
  return {
    data: {
      session: session as TrainingSession,
      course: course
        ? { ...course, category: categories.find((item) => item.id === course.category_id) }
        : null,
    },
    error: null,
  };
}

export interface TrainingSession {
  id: string;
  course_id: string;
  trainer_id?: string | null;
  starts_at: string;
  ends_at: string;
  location: string;
  delivery_format: DeliveryFormat;
  capacity: number | null;
  price_minor: number | null;
  status: 'draft' | 'open' | 'cancelled' | 'completed';
  published: boolean;
}

export interface TrainingTrainer {
  id: string;
  full_name: string;
  job_title: string;
  email: string;
  phone: string;
  qualifications: string;
  expertise: string[];
  active: boolean;
}

export type TrainingPaymentStatus = 'not_set' | 'not_required' | 'unpaid' | 'partial' | 'paid' | 'waived';
export type TrainingPaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'other';

export interface TrainingPayment {
  id: string;
  registration_id: string;
  amount_due_minor: number | null;
  amount_paid_minor: number;
  currency: string;
  status: TrainingPaymentStatus;
  payment_method: TrainingPaymentMethod | null;
  transaction_reference: string;
  updated_at: string;
}

export async function deleteTrainingCategory(id: string): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.from('training_categories').delete().eq('id', id);
  return error ? message(error) : null;
}

export interface TrainingParticipant {
  id: string;
  registration_id: string;
  account_id: string | null;
  full_name: string;
  email: string;
}

export async function archiveTrainingCourse(id: string, archived: boolean): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase
    .from('training_courses')
    .update({ archived_at: archived ? new Date().toISOString() : null, published: false })
    .eq('id', id);
  return error ? message(error) : null;
}

export interface TrainingRegistration {
  id: string;
  session_id: string;
  owner_id: string;
  registration_type: 'individual' | 'group';
  organisation: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  participant_count: number;
  additional_requirements: string;
  status: RegistrationStatus;
  review_note: string;
  created_at: string;
  training_sessions?: TrainingSession & { training_courses?: TrainingCourse };
  training_participants?: TrainingParticipant[];
}

export async function deleteTrainingSession(id: string): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.from('training_sessions').delete().eq('id', id);
  return error ? message(error) : null;
}

export interface TrainingAssessment {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  active: boolean;
}

export interface TrainingAssessmentResult {
  id: string;
  participant_id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  notes: string;
  assessed_at: string;
}

export interface TrainingAttendance {
  participant_id: string;
  status: 'present' | 'absent' | 'excused';
  notes: string;
}

export interface TrainingMaterial {
  id: string;
  course_id: string;
  session_id: string | null;
  title: string;
  description: string;
  storage_path: string;
  published: boolean;
}

export interface TrainingCertificate {
  id: string;
  participant_id: string;
  certificate_number: string;
  verification_code: string;
  participant_name: string;
  course_title: string;
  completion_date: string;
  issuer_name: string;
  issuer_title: string;
  issuer_organisation: string;
  issued_at: string;
  revoked_at: string | null;
}

export interface CorporateTrainingRequest {
  id: string;
  organisation: string;
  contact_name: string;
  email: string;
  telephone: string;
  requirements: string;
  participant_estimate: number;
  preferred_dates: string;
  location: string;
  additional_information: string;
  status: CorporateRequestStatus;
  admin_note: string;
  created_at: string;
}

export interface TrainingProfile {
  user_id: string;
  full_name: string;
  phone: string;
  organisation: string;
}

export interface TrainingCertificateSettings {
  id: boolean;
  issuer_name: string;
  issuer_title: string;
  issuer_organisation: string;
  issuer_authorized: boolean;
}

export interface TrainingAdminData {
  categories: TrainingCategory[];
  courses: TrainingCourse[];
  sessions: TrainingSession[];
  trainers: TrainingTrainer[];
  registrations: TrainingRegistration[];
  payments: TrainingPayment[];
  assessments: TrainingAssessment[];
  results: TrainingAssessmentResult[];
  attendance: TrainingAttendance[];
  materials: TrainingMaterial[];
  certificates: TrainingCertificate[];
  corporateRequests: CorporateTrainingRequest[];
  certificateSettings: TrainingCertificateSettings | null;
}

export interface LearnerTrainingData {
  profile: TrainingProfile | null;
  registrations: TrainingRegistration[];
  payments: TrainingPayment[];
  participants: TrainingParticipant[];
  linkedParticipants: LinkedTrainingParticipant[];
  attendance: TrainingAttendance[];
  results: TrainingAssessmentResult[];
  materials: TrainingMaterial[];
  certificates: TrainingCertificate[];
}

export interface LinkedTrainingParticipant {
  participant_id: string;
  participant_name: string;
  course_title: string;
  session_starts_at: string;
  session_ends_at: string;
  session_location: string;
  registration_status: RegistrationStatus;
  attendance_status: TrainingAttendance['status'] | null;
}

export interface TrainingResult<T> {
  data: T;
  error: string | null;
}

export function formatTrainingMoney(amountMinor: number | null, currency: string): string {
  if (amountMinor === null) return 'Not set';
  const fractionDigits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amountMinor / 10 ** fractionDigits);
}

const unavailable = 'The training service is not connected for this website.';
const loadFailed = 'Training information could not be loaded. Please try again.';
const saveFailed = 'The change could not be saved. Check your connection and permissions, then try again.';

function message(error: { message: string } | null, fallback = saveFailed): string {
  if (!error) return fallback;
  const known = [
    'Training administrator access is required',
    'does not have enough places',
    'not open for registration',
    'Confirm your email',
    'approved registration',
    'authorized certificate issuer',
    'Attendance must be recorded',
    'passing assessment result',
    'every active course assessment',
    'capacity cannot be reduced',
    'Resolve pending and waitlisted',
    'cannot be completed before',
    'Payment amounts are invalid',
    'Select the method used for the recorded payment',
    'Only an unpaid amount can be waived',
    'Registration not found',
  ];
  return known.find((part) => error.message.includes(part))
    ? error.message
    : fallback;
}

function emptyAdminData(): TrainingAdminData {
  return {
    categories: [],
    courses: [],
    sessions: [],
    trainers: [],
    registrations: [],
    payments: [],
    assessments: [],
    results: [],
    attendance: [],
    materials: [],
    certificates: [],
    corporateRequests: [],
    certificateSettings: null,
  };
}

export async function fetchPublicTrainingCatalog(): Promise<
  TrainingResult<{ categories: TrainingCategory[]; courses: TrainingCourse[] }>
> {
  if (!supabase) return { data: { categories: [], courses: [] }, error: unavailable };
  const [categoryResult, courseResult] = await Promise.all([
    supabase.from('training_categories').select('*').order('sort_order').order('name'),
    supabase
      .from('training_courses')
      .select('*')
      .eq('published', true)
      .is('archived_at', null)
      .order('title'),
  ]);
  if (categoryResult.error || courseResult.error) {
    return { data: { categories: [], courses: [] }, error: loadFailed };
  }
  const categories = (categoryResult.data ?? []) as TrainingCategory[];
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const courses = ((courseResult.data ?? []) as TrainingCourse[]).map((course) => ({
    ...course,
    category: categoryById.get(course.category_id),
  }));
  return { data: { categories, courses }, error: null };
}

export async function fetchPublicTrainingCourse(slug: string): Promise<
  TrainingResult<{ course: TrainingCourse | null; sessions: TrainingSession[] }>
> {
  if (!supabase) return { data: { course: null, sessions: [] }, error: unavailable };
  const { data: courseRow, error: courseError } = await supabase
    .from('training_courses')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .is('archived_at', null)
    .maybeSingle();
  if (courseError) return { data: { course: null, sessions: [] }, error: loadFailed };
  if (!courseRow) return { data: { course: null, sessions: [] }, error: null };

  const [categoryResult, sessionResult] = await Promise.all([
    supabase.from('training_categories').select('*').eq('id', courseRow.category_id).maybeSingle(),
    supabase
      .from('training_sessions')
      .select('id, course_id, starts_at, ends_at, location, delivery_format, capacity, price_minor, status, published')
      .eq('course_id', courseRow.id)
      .eq('published', true)
      .eq('status', 'open')
      .gt('starts_at', new Date().toISOString())
      .order('starts_at'),
  ]);
  if (categoryResult.error || sessionResult.error) {
    return { data: { course: null, sessions: [] }, error: loadFailed };
  }
  return {
    data: {
      course: {
        ...(courseRow as TrainingCourse),
        category: (categoryResult.data as TrainingCategory | null) ?? undefined,
      },
      sessions: (sessionResult.data ?? []) as TrainingSession[],
    },
    error: null,
  };
}

export async function fetchAdminTrainingData(): Promise<TrainingResult<TrainingAdminData>> {
  if (!supabase) return { data: emptyAdminData(), error: unavailable };
  const [
    categories,
    courses,
    sessions,
    trainers,
    registrations,
    payments,
    assessments,
    results,
    attendance,
    materials,
    certificates,
    corporateRequests,
    settings,
  ] = await Promise.all([
    supabase.from('training_categories').select('*').order('sort_order').order('name'),
    supabase.from('training_courses').select('*').order('created_at', { ascending: false }),
    supabase.from('training_sessions').select('*').order('starts_at', { ascending: false }),
    supabase.from('training_trainers').select('*').order('full_name'),
    supabase
      .from('training_registrations')
      .select('*, training_sessions(*, training_courses(*)), training_participants(*)')
      .order('created_at', { ascending: false }),
    supabase.from('training_payments').select('*').order('updated_at', { ascending: false }),
    supabase.from('training_assessments').select('*').order('created_at', { ascending: false }),
    supabase.from('training_assessment_results').select('*').order('assessed_at', { ascending: false }),
    supabase.from('training_attendance').select('*'),
    supabase.from('training_materials').select('*').order('created_at', { ascending: false }),
    supabase.from('training_certificates').select('*').order('issued_at', { ascending: false }),
    supabase.from('training_corporate_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('training_certificate_settings').select('*').eq('id', true).maybeSingle(),
  ]);
  const errors = [
    categories.error,
    courses.error,
    sessions.error,
    trainers.error,
    registrations.error,
    payments.error,
    assessments.error,
    results.error,
    attendance.error,
    materials.error,
    certificates.error,
    corporateRequests.error,
    settings.error,
  ];
  if (errors.some(Boolean)) return { data: emptyAdminData(), error: loadFailed };
  return {
    data: {
      categories: (categories.data ?? []) as TrainingCategory[],
      courses: (courses.data ?? []) as TrainingCourse[],
      sessions: (sessions.data ?? []) as TrainingSession[],
      trainers: (trainers.data ?? []) as TrainingTrainer[],
      registrations: (registrations.data ?? []) as TrainingRegistration[],
      payments: (payments.data ?? []) as TrainingPayment[],
      assessments: (assessments.data ?? []) as TrainingAssessment[],
      results: (results.data ?? []) as TrainingAssessmentResult[],
      attendance: (attendance.data ?? []) as TrainingAttendance[],
      materials: (materials.data ?? []) as TrainingMaterial[],
      certificates: (certificates.data ?? []) as TrainingCertificate[],
      corporateRequests: (corporateRequests.data ?? []) as CorporateTrainingRequest[],
      certificateSettings: (settings.data as TrainingCertificateSettings | null) ?? null,
    },
    error: null,
  };
}

export async function fetchLearnerTrainingData(userId: string): Promise<TrainingResult<LearnerTrainingData>> {
  if (!supabase) {
    return {
      data: { profile: null, registrations: [], payments: [], participants: [], linkedParticipants: [], attendance: [], results: [], materials: [], certificates: [] },
      error: unavailable,
    };
  }
  const [profile, registrations, payments, participants, linkedParticipants, attendance, results, materials, certificates] = await Promise.all([
    supabase.from('training_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('training_registrations')
      .select('*, training_sessions(*, training_courses(*)), training_participants(*)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false }),
    supabase.from('training_payments').select('*').order('updated_at', { ascending: false }),
    supabase.from('training_participants').select('*').eq('account_id', userId),
    supabase.rpc('get_my_training_participants'),
    supabase.from('training_attendance').select('*'),
    supabase.from('training_assessment_results').select('*'),
    supabase.from('training_materials').select('*').eq('published', true),
    supabase.from('training_certificates').select('*'),
  ]);
  if (
    profile.error ||
    registrations.error ||
    payments.error ||
    participants.error ||
    linkedParticipants.error ||
    attendance.error ||
    results.error ||
    materials.error ||
    certificates.error
  ) {
    return {
      data: { profile: null, registrations: [], payments: [], participants: [], linkedParticipants: [], attendance: [], results: [], materials: [], certificates: [] },
      error: loadFailed,
    };
  }
  return {
    data: {
      profile: (profile.data as TrainingProfile | null) ?? null,
      registrations: (registrations.data ?? []) as TrainingRegistration[],
      payments: (payments.data ?? []) as TrainingPayment[],
      participants: (participants.data ?? []) as TrainingParticipant[],
      linkedParticipants: (linkedParticipants.data ?? []) as LinkedTrainingParticipant[],
      attendance: (attendance.data ?? []) as TrainingAttendance[],
      results: (results.data ?? []) as TrainingAssessmentResult[],
      materials: (materials.data ?? []) as TrainingMaterial[],
      certificates: (certificates.data ?? []) as TrainingCertificate[],
    },
    error: null,
  };
}

export async function saveTrainingProfile(profile: TrainingProfile): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase
    .from('training_profiles')
    .upsert({
      user_id: profile.user_id,
      full_name: profile.full_name.trim(),
      phone: profile.phone.trim(),
      organisation: profile.organisation.trim(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  return error ? message(error) : null;
}

export async function registerForTraining(input: {
  sessionId: string;
  type: 'individual' | 'group';
  organisation: string;
  participants: { full_name: string; email: string }[];
  phone: string;
  additionalRequirements: string;
  consent: boolean;
}): Promise<TrainingResult<string | null>> {
  if (!supabase) return { data: null, error: unavailable };
  const { data, error } = await supabase.rpc('register_for_training', {
    p_session_id: input.sessionId,
    p_registration_type: input.type,
    p_organisation: input.organisation,
    p_participants: input.participants,
    p_contact_phone: input.phone,
    p_additional_requirements: input.additionalRequirements,
    p_consent: input.consent,
    p_idempotency_key: crypto.randomUUID(),
  });
  return error
    ? { data: null, error: message(error, error.message) }
    : { data: data as string, error: null };
}

export async function linkTrainingParticipant(): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('link_training_participant');
  return error ? message(error, error.message) : null;
}

export async function submitCorporateTrainingRequest(input: {
  organisation: string;
  contact_name: string;
  email: string;
  telephone: string;
  requirements: string;
  participant_estimate: number;
  preferred_dates: string;
  location: string;
  additional_information: string;
  consent: boolean;
}): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.from('training_corporate_requests').insert({
    ...input,
    idempotency_key: crypto.randomUUID(),
  });
  return error ? message(error) : null;
}

export async function saveTrainingCategory(
  input: Omit<TrainingCategory, 'id'>,
  id?: string,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const result = id
    ? await supabase.from('training_categories').update(input).eq('id', id).select('id').maybeSingle()
    : await supabase.from('training_categories').insert(input).select('id').maybeSingle();
  if (result.error) return message(result.error);
  return result.data ? null : 'Category was not saved. Confirm your administrator access and try again.';
}

export async function saveTrainingCourse(
  input: Omit<TrainingCourse, 'id' | 'category'>,
  id?: string,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const values: Omit<TrainingCourse, 'id' | 'category'> = {
    category_id: input.category_id,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    description: input.description,
    learning_objectives: input.learning_objectives,
    target_audience: input.target_audience,
    prerequisites: input.prerequisites,
    duration_minutes: input.duration_minutes,
    delivery_formats: input.delivery_formats,
    price_minor: input.price_minor,
    currency: input.currency,
    requires_assessment: input.requires_assessment,
    passing_score: input.passing_score,
    online_enabled: input.online_enabled,
    require_online_completion: input.require_online_completion,
    published: input.published,
    archived_at: input.archived_at,
  };
  const result = id
    ? await supabase.from('training_courses').update(values).eq('id', id).select('id').maybeSingle()
    : await supabase.from('training_courses').insert(values).select('id').maybeSingle();
  if (result.error) return message(result.error);
  return result.data ? null : 'Course was not saved. Confirm your administrator access and try again.';
}

export async function saveTrainingTrainer(input: Omit<TrainingTrainer, 'id'>, id?: string): Promise<string | null> {
  if (!supabase) return unavailable;
  const result = id
    ? await supabase.from('training_trainers').update(input).eq('id', id).select('id').maybeSingle()
    : await supabase.from('training_trainers').insert(input).select('id').maybeSingle();
  if (result.error) return message(result.error);
  return result.data ? null : 'Trainer was not saved. Confirm your administrator access and try again.';
}

export async function saveTrainingSession(input: Omit<TrainingSession, 'id'>, id?: string): Promise<string | null> {
  if (!supabase) return unavailable;
  const values: Omit<TrainingSession, 'id'> = {
    course_id: input.course_id,
    trainer_id: input.trainer_id,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    location: input.location,
    delivery_format: input.delivery_format,
    capacity: input.capacity,
    price_minor: input.price_minor,
    status: input.status,
    published: input.published,
  };
  const result = id
    ? await supabase.from('training_sessions').update(values).eq('id', id).select('id').maybeSingle()
    : await supabase.from('training_sessions').insert(values).select('id').maybeSingle();
  if (result.error) return message(result.error);
  return result.data ? null : 'Session was not saved. Confirm your administrator access and try again.';
}

export async function saveTrainingAssessment(
  input: Omit<TrainingAssessment, 'id'>,
  id?: string,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const result = id
    ? await supabase.from('training_assessments').update(input).eq('id', id)
    : await supabase.from('training_assessments').insert(input);
  return result.error ? message(result.error) : null;
}

export async function reviewTrainingRegistration(
  id: string,
  status: RegistrationStatus,
  note: string,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('review_training_registration', {
    p_registration_id: id,
    p_status: status,
    p_review_note: note,
  });
  return error ? message(error, error.message) : null;
}

export async function recordTrainingPayment(input: {
  registration_id: string;
  amount_due_minor: number | null;
  amount_paid_minor: number;
  payment_method: TrainingPaymentMethod | null;
  transaction_reference: string;
  waived: boolean;
}): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('record_training_payment', {
    p_registration_id: input.registration_id,
    p_amount_due_minor: input.amount_due_minor,
    p_amount_paid_minor: input.amount_paid_minor,
    p_payment_method: input.payment_method,
    p_transaction_reference: input.transaction_reference,
    p_waived: input.waived,
  });
  return error ? message(error, error.message) : null;
}

export async function recordTrainingAttendance(
  participantId: string,
  status: TrainingAttendance['status'],
  notes: string,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('record_training_attendance', {
    p_participant_id: participantId,
    p_status: status,
    p_notes: notes,
  });
  return error ? message(error, error.message) : null;
}

export async function recordTrainingAssessment(
  participantId: string,
  assessmentId: string,
  score: number,
  notes: string,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('record_training_assessment', {
    p_participant_id: participantId,
    p_assessment_id: assessmentId,
    p_score: score,
    p_notes: notes,
  });
  return error ? message(error, error.message) : null;
}

export async function issueTrainingCertificate(participantId: string): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('issue_training_certificate', { p_participant_id: participantId });
  return error ? message(error, error.message) : null;
}

export async function revokeTrainingCertificate(id: string, reason: string): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('revoke_training_certificate', {
    p_certificate_id: id,
    p_reason: reason,
  });
  return error ? message(error, error.message) : null;
}

export async function saveTrainingCertificateSettings(
  settings: TrainingCertificateSettings,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('save_training_certificate_settings', {
    p_issuer_name: settings.issuer_name,
    p_issuer_title: settings.issuer_title,
    p_issuer_organisation: settings.issuer_organisation,
    p_authorized: settings.issuer_authorized,
  });
  return error ? message(error, error.message) : null;
}

export async function saveCorporateRequestReview(
  id: string,
  status: CorporateRequestStatus,
  note: string,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase
    .from('training_corporate_requests')
    .update({ status, admin_note: note.trim(), updated_at: new Date().toISOString() })
    .eq('id', id);
  return error ? message(error) : null;
}

export async function uploadTrainingMaterial(input: {
  courseId: string;
  sessionId: string;
  title: string;
  description: string;
  file: File;
}): Promise<string | null> {
  if (!supabase) return unavailable;
  const storagePath = `${input.courseId}/${crypto.randomUUID()}-${input.file.name.replace(/[^\w.-]/g, '_')}`;
  const upload = await supabase.storage.from('training-materials').upload(storagePath, input.file, {
    contentType: input.file.type,
    upsert: false,
  });
  if (upload.error) return message(upload.error);

  const { error } = await supabase.from('training_materials').insert({
    course_id: input.courseId,
    session_id: input.sessionId || null,
    title: input.title.trim(),
    description: input.description.trim(),
    storage_path: storagePath,
    published: false,
  });
  if (error) {
    const cleanup = await supabase.storage.from('training-materials').remove([storagePath]);
    if (cleanup.error) return 'Material metadata could not be saved, and the uploaded file could not be removed. Contact the site administrator.';
    return message(error);
  }
  return null;
}

export async function setTrainingMaterialPublished(id: string, published: boolean): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.from('training_materials').update({ published }).eq('id', id);
  return error ? message(error) : null;
}

export async function createTrainingMaterialUrl(path: string): Promise<TrainingResult<string | null>> {
  if (!supabase) return { data: null, error: unavailable };
  const { data, error } = await supabase.storage.from('training-materials').createSignedUrl(path, 300);
  return error
    ? { data: null, error: message(error, 'This material is not available for your account.') }
    : { data: data.signedUrl, error: null };
}

export async function verifyTrainingCertificate(reference: string): Promise<
  TrainingResult<VerifiedTrainingCertificate | null>
> {
  if (!supabase) {
    return {
      data: null,
      error: unavailable,
    };
  }
  const { data, error } = await supabase.rpc('verify_training_certificate', { p_reference: reference });
  if (error) return { data: null, error: loadFailed };
  const rows = data as VerifiedTrainingCertificate[] | null;
  return { data: rows?.[0] ?? null, error: null };
}

export async function signUpLearner(email: string, password: string, fullName: string): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { full_name: fullName.trim() } },
  });
  return error ? message(error, error.message) : null;
}

export async function signInLearner(email: string, password: string): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  return error ? message(error, 'We could not sign you in. Check your details and try again.') : null;
}

export async function signOutLearner(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

export async function getLearnerSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function subscribeToLearnerSession(callback: (session: Awaited<ReturnType<typeof getLearnerSession>>) => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
