import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, BookOpen, Download, FileText, Loader2, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { AdminField, Notice, inputClass, slugify } from '@/components/admin/AdminUI';
import {
  archiveTrainingCourse,
  deleteTrainingCategory,
  fetchAdminTrainingData,
  formatTrainingMoney,
  issueTrainingCertificate,
  recordTrainingPayment,
  recordTrainingAssessment,
  recordTrainingAttendance,
  revokeTrainingCertificate,
  reviewTrainingRegistration,
  saveCorporateRequestReview,
  saveTrainingAssessment,
  saveTrainingCategory,
  saveTrainingCertificateSettings,
  saveTrainingCourse,
  saveTrainingSession,
  saveTrainingTrainer,
  setTrainingMaterialPublished,
  uploadTrainingMaterial,
  type CorporateRequestStatus,
  type DeliveryFormat,
  type RegistrationStatus,
  type TrainingPaymentMethod,
  type TrainingTrainer,
  type TrainingAdminData,
  type TrainingCategory,
  type TrainingCourse,
  type TrainingSession,
} from '@/lib/training';
import {
  fetchLearningCourse,
  fetchOnlineLearningReport,
  saveCourseChapters,
  setCourseOnlineSettings,
  type ChapterPayload,
  type OnlineLearningReportRow,
} from '@/lib/learning';
import { IMPORT_ACCEPT, importCourseDocument } from '@/lib/learningImport';

type Panel =
  | 'overview'
  | 'courses'
  | 'trainers'
  | 'online'
  | 'sessions'
  | 'registrations'
  | 'payments'
  | 'participants'
  | 'materials'
  | 'corporate'
  | 'certificates';

const PANELS: { id: Panel; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses & categories' },
  { id: 'trainers', label: 'Trainers' },
  { id: 'online', label: 'Online learning' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'registrations', label: 'Registrations' },
  { id: 'payments', label: 'Payments' },
  { id: 'participants', label: 'Attendance & assessment' },
  { id: 'materials', label: 'Materials' },
  { id: 'corporate', label: 'Corporate requests' },
  { id: 'certificates', label: 'Certificates' },
];

const FORMATS: DeliveryFormat[] = ['classroom', 'onsite', 'online', 'hybrid'];
const STATUS_OPTIONS: RegistrationStatus[] = ['approved', 'rejected', 'waitlisted', 'cancelled'];

function emptyData(): TrainingAdminData {
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

function toLocalDateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function dateLabel(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function currencyFractionDigits(currency: string): number {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

function parseMoney(value: string, currency: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number * 10 ** currencyFractionDigits(currency));
}

function moneyInput(minor: number | null, currency: string): string {
  if (minor === null) return '';
  return String(minor / 10 ** currencyFractionDigits(currency));
}

function csvCell(value: unknown): string {
  let text = String(value ?? '').replace(/[\r\n]+/g, ' ');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function TrainingManager() {
  const [data, setData] = useState<TrainingAdminData>(emptyData());
  const [panel, setPanel] = useState<Panel>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminTrainingData().then((result) => {
      if (!active) return;
      setData(result.data);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const run = async (action: () => Promise<string | null>, success: string) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await action();
    setSaving(false);
    if (result) {
      setError(result);
      return false;
    }
    setNotice(success);
    setReloadKey((key) => key + 1);
    return true;
  };

  const exportReport = () => {
    const rows = [
      ['registration_id', 'course', 'session_start', 'trainer', 'registration_status', 'organisation', 'contact_name', 'contact_email', 'participants', 'attendance', 'assessments', 'certificates', 'payment_status', 'amount_due_minor', 'amount_paid_minor', 'currency', 'payment_method', 'transaction_reference'],
      ...data.registrations.map((registration) => {
        const participants = registration.training_participants ?? [];
        const course = registration.training_sessions?.training_courses;
        const payment = data.payments.find((entry) => entry.registration_id === registration.id);
        const attendance = participants.map((participant) => {
          const record = data.attendance.find((item) => item.participant_id === participant.id);
          return `${participant.full_name}: ${record?.status ?? 'not recorded'}`;
        }).join('; ');
        const assessments = participants.map((participant) => data.results
          .filter((result) => result.participant_id === participant.id)
          .map((result) => `${participant.full_name}: ${result.score}% ${result.passed ? 'passed' : 'not passed'}`)
          .join('; ')).filter(Boolean).join('; ');
        const certificates = participants.map((participant) => data.certificates
          .find((certificate) => certificate.participant_id === participant.id)?.certificate_number)
          .filter(Boolean).join('; ');
        return [
          registration.id,
          course?.title ?? '',
          registration.training_sessions?.starts_at ?? '',
          data.trainers.find((trainer) => trainer.id === registration.training_sessions?.trainer_id)?.full_name ?? '',
          registration.status,
          registration.organisation ?? '',
          registration.contact_name,
          registration.contact_email,
          participants.map((participant) => `${participant.full_name} <${participant.email}>`).join('; '),
          attendance,
          assessments,
          certificates,
          payment?.status ?? 'not recorded',
          payment?.amount_due_minor ?? '',
          payment?.amount_paid_minor ?? '',
          payment?.currency ?? '',
          payment?.payment_method ?? '',
          payment?.transaction_reference ?? '',
        ];
      }),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ecohealth-training-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const publishedCourses = data.courses.filter((course) => course.published && !course.archived_at);
  const upcomingSessions = data.sessions.filter((session) => session.status === 'open' && session.starts_at > new Date().toISOString());
  const pendingRegistrations = data.registrations.filter((registration) => registration.status === 'pending');

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-charcoal/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Training management</p>
          <h1 className="mt-4 font-display text-display-sm font-semibold text-charcoal">Courses, learners &amp; delivery</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Publish only verified course details. Registrations reserve capacity when submitted and require staff review.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={exportReport} className="btn-secondary" disabled={!data.registrations.length}>
            <Download className="h-4 w-4" />
            Export report
          </button>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} disabled={loading} className="btn-secondary">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <nav aria-label="Training administration" className="mt-6 flex gap-2 overflow-x-auto border-b border-charcoal/10 pb-2">
        {PANELS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={panel === entry.id}
            onClick={() => setPanel(entry.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold uppercase tracking-wider ${
              panel === entry.id ? 'border-forest-700 text-forest-800' : 'border-transparent text-muted'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      {error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}
      {notice && <div className="mt-6"><Notice tone="success">{notice}</Notice></div>}
      {loading ? (
        <p role="status" className="mt-10 flex items-center gap-3 text-sm text-charcoal-light">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading training records
        </p>
      ) : (
        <div className="mt-8">
          {panel === 'overview' && (
            <Overview
              categories={data.categories.length}
              courses={data.courses.length}
              published={publishedCourses.length}
              sessions={upcomingSessions.length}
              pending={pendingRegistrations.length}
              approved={data.registrations.filter((entry) => entry.status === 'approved').length}
              certificates={data.certificates.filter((entry) => !entry.revoked_at).length}
              requests={data.corporateRequests.filter((entry) => entry.status === 'new').length}
              online={data.courses.filter((course) => course.online_enabled && !course.archived_at).length}
              trainers={data.trainers.filter((trainer) => trainer.active).length}
              paymentsToReview={data.payments.filter((payment) => ['not_set', 'unpaid', 'partial'].includes(payment.status)).length}
              onPanelChange={setPanel}
            />
          )}
          {panel === 'courses' && <CoursesPanel data={data} run={run} saving={saving} />}
          {panel === 'trainers' && <TrainersPanel data={data} run={run} saving={saving} />}
          {panel === 'online' && (
            <OnlineLearningPanel data={data} run={run} saving={saving} onOpenCourses={() => setPanel('courses')} />
          )}
          {panel === 'sessions' && <SessionsPanel data={data} run={run} saving={saving} />}
          {panel === 'registrations' && <RegistrationsPanel data={data} run={run} saving={saving} />}
          {panel === 'payments' && <PaymentsPanel data={data} run={run} saving={saving} />}
          {panel === 'participants' && <ParticipantsPanel data={data} run={run} saving={saving} />}
          {panel === 'materials' && <MaterialsPanel data={data} run={run} saving={saving} />}
          {panel === 'corporate' && <CorporatePanel data={data} run={run} saving={saving} />}
          {panel === 'certificates' && <CertificatesPanel data={data} run={run} saving={saving} />}
        </div>
      )}
    </div>
  );
}

function Overview({
  categories,
  courses,
  published,
  sessions,
  pending,
  approved,
  certificates,
  requests,
  online,
  trainers,
  paymentsToReview,
  onPanelChange,
}: {
  categories: number;
  courses: number;
  published: number;
  sessions: number;
  pending: number;
  approved: number;
  certificates: number;
  requests: number;
  online: number;
  trainers: number;
  paymentsToReview: number;
  onPanelChange: (panel: Panel) => void;
}) {
  const metrics = [
    { label: 'Categories', value: categories },
    { label: 'Courses', value: courses },
    { label: 'Published', value: published },
    { label: 'Upcoming sessions', value: sessions },
    { label: 'Pending registrations', value: pending },
    { label: 'Approved registrations', value: approved },
    { label: 'Issued certificates', value: certificates },
    { label: 'New corporate requests', value: requests },
    { label: 'Online programmes', value: online },
    { label: 'Active trainers', value: trainers },
    { label: 'Payments to review', value: paymentsToReview },
  ];
  return (
    <>
      <div className="grid gap-px bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">{metric.label}</p>
            <p className="mt-3 font-display text-3xl font-light text-forest-800">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="border border-charcoal/15 bg-white p-6">
          <h2 className="font-display text-xl font-medium text-charcoal">Operational controls</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <li>Pending registrations reserve requested capacity to prevent overbooking.</li>
            <li>Certificate issuance requires a completed session, attendance, and any configured passing assessment.</li>
            <li>Certificate issue remains disabled until issuer details are verified and authorized by an administrator.</li>
            <li>Only published courses and open, published future sessions appear in the public catalogue.</li>
          </ul>
        </div>
        <div className="border border-charcoal/15 bg-paper p-6">
          <h2 className="font-display text-xl font-medium text-charcoal">No published training yet?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Create verified categories, course information and dates before publishing. The public catalogue remains
            empty until real offerings are entered here.
          </p>
          <button type="button" onClick={() => onPanelChange('courses')} className="btn-primary mt-5">
            <Plus className="h-4 w-4" /> Manage courses
          </button>
        </div>
      </div>
    </>
  );
}

function CoursesPanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [categoryDraft, setCategoryDraft] = useState<TrainingCategory | null>(null);
  const [courseDraft, setCourseDraft] = useState<TrainingCourse | null>(null);
  const [objectives, setObjectives] = useState('');
  const [deliveryFormats, setDeliveryFormats] = useState<DeliveryFormat[]>([]);
  const [priceInput, setPriceInput] = useState('');
  const [courseError, setCourseError] = useState<string | null>(null);

  const startCourse = (course?: TrainingCourse) => {
    setCourseDraft(course ?? {
      id: '',
      category_id: data.categories[0]?.id ?? '',
      slug: '',
      title: '',
      summary: '',
      description: '',
      learning_objectives: [],
      target_audience: '',
      prerequisites: '',
      duration_minutes: null,
      delivery_formats: [],
      price_minor: null,
      currency: 'RWF',
      requires_assessment: false,
      passing_score: 70,
      online_enabled: false,
      require_online_completion: false,
      published: false,
      archived_at: null,
    });
    setObjectives(course?.learning_objectives.join('\n') ?? '');
    setDeliveryFormats(course?.delivery_formats ?? []);
    setPriceInput(moneyInput(course?.price_minor ?? null, course?.currency ?? 'RWF'));
    setCourseError(null);
  };

  const handleCourseSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courseDraft) return;
    const learningObjectives = objectives.split('\n').map((item) => item.trim()).filter(Boolean);
    if (courseDraft.published) {
      const missingDetails = [
        !courseDraft.summary.trim() && 'summary',
        !courseDraft.description.trim() && 'description',
        learningObjectives.length === 0 && 'at least one learning objective',
        !courseDraft.target_audience.trim() && 'target participants',
        !courseDraft.prerequisites.trim() && 'prerequisites (enter “None” if there are none)',
        courseDraft.duration_minutes === null && 'confirmed duration',
        deliveryFormats.length === 0 && 'confirmed delivery format',
      ].filter(Boolean);
      if (missingDetails.length > 0) {
        setCourseError(`Complete the following before publishing: ${missingDetails.join(', ')}.`);
        return;
      }
    }
    try {
      const price = parseMoney(priceInput, courseDraft.currency.toUpperCase());
      if (priceInput.trim() && price === null) {
        setCourseError('Enter a non-negative course price.');
        return;
      }
      const result = await run(() => saveTrainingCourse({
        ...courseDraft,
        slug: courseDraft.slug.trim() || slugify(courseDraft.title),
        learning_objectives: learningObjectives,
        delivery_formats: deliveryFormats,
        currency: courseDraft.currency.toUpperCase(),
        price_minor: price,
      }, courseDraft.id || undefined), 'Course saved.');
      if (result) setCourseDraft(null);
    } catch {
      setCourseError('Enter a valid ISO currency code and price.');
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-12">
      <section className="xl:col-span-4">
        <h2 className="font-display text-xl font-medium text-charcoal">Categories</h2>
        <form
          className="mt-4 border border-charcoal/15 bg-white p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!categoryDraft) return;
            const result = await run(() => saveTrainingCategory({
              name: categoryDraft.name.trim(),
              slug: categoryDraft.slug.trim() || slugify(categoryDraft.name),
              description: categoryDraft.description.trim(),
              sort_order: Number(categoryDraft.sort_order) || 0,
            }, categoryDraft.id || undefined), 'Category saved.');
            if (result) setCategoryDraft(null);
          }}
        >
          <AdminField label="Category name" htmlFor="training-category-name">
            <input id="training-category-name" required maxLength={100} className={inputClass} value={categoryDraft?.name ?? ''} onChange={(event) => setCategoryDraft((prev) => ({ id: prev?.id ?? '', name: event.target.value, slug: prev?.slug ?? '', description: prev?.description ?? '', sort_order: prev?.sort_order ?? 0 }))} />
          </AdminField>
          <AdminField label="Slug" htmlFor="training-category-slug">
            <input id="training-category-slug" className={inputClass} value={categoryDraft?.slug ?? ''} onChange={(event) => setCategoryDraft((prev) => prev ? { ...prev, slug: event.target.value } : null)} />
          </AdminField>
          <AdminField label="Description" htmlFor="training-category-description">
            <textarea id="training-category-description" maxLength={1000} rows={2} className={inputClass} value={categoryDraft?.description ?? ''} onChange={(event) => setCategoryDraft((prev) => prev ? { ...prev, description: event.target.value } : null)} />
          </AdminField>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving || !categoryDraft} className="btn-primary disabled:opacity-50">{categoryDraft?.id ? 'Save category' : 'Add category'}</button>
            {categoryDraft && <button type="button" onClick={() => setCategoryDraft(null)} className="btn-secondary">Cancel</button>}
          </div>
        </form>
        <ul className="mt-4 divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
          {data.categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 p-4">
              <span className="text-sm text-charcoal">{category.name}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setCategoryDraft(category)} className="text-xs text-forest-700 link-underline">Edit</button>
                <button type="button" onClick={() => {
                  if (window.confirm(`Delete category “${category.name}”?`)) void run(() => deleteTrainingCategory(category.id), 'Category deleted.');
                }} className="text-xs text-red-700 link-underline">Delete</button>
              </div>
            </li>
          ))}
          {data.categories.length === 0 && <li className="p-4 text-sm text-muted">Create a verified category to start.</li>}
        </ul>
      </section>

      <section className="xl:col-span-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-medium text-charcoal">Courses</h2>
            <p className="mt-1 text-sm text-muted">Draft topics must be verified and completed before publication.</p>
          </div>
          <button type="button" onClick={() => startCourse()} disabled={!data.categories.length} className="btn-primary disabled:opacity-50">
            <Plus className="h-4 w-4" /> New course
          </button>
        </div>
        {!data.categories.length && <p className="mt-4 text-sm text-muted">Create a category before adding a course.</p>}

        {courseDraft && (
          <form onSubmit={handleCourseSave} className="mt-5 grid gap-5 border border-charcoal/15 bg-white p-5 sm:grid-cols-2">
            <AdminField label="Course title" htmlFor="training-course-title" className="sm:col-span-2">
              <input id="training-course-title" required maxLength={160} className={inputClass} value={courseDraft.title} onChange={(event) => setCourseDraft({ ...courseDraft, title: event.target.value, slug: courseDraft.id ? courseDraft.slug : slugify(event.target.value) })} />
            </AdminField>
            <AdminField label="Category" htmlFor="training-course-category">
              <select id="training-course-category" required className={inputClass} value={courseDraft.category_id} onChange={(event) => setCourseDraft({ ...courseDraft, category_id: event.target.value })}>
                <option value="">Select category</option>
                {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </AdminField>
            <AdminField label="Slug" htmlFor="training-course-slug">
              <input id="training-course-slug" required className={inputClass} value={courseDraft.slug} onChange={(event) => setCourseDraft({ ...courseDraft, slug: event.target.value })} />
            </AdminField>
            <AdminField label="Summary" htmlFor="training-course-summary" className="sm:col-span-2">
              <textarea id="training-course-summary" required maxLength={500} rows={2} className={inputClass} value={courseDraft.summary} onChange={(event) => setCourseDraft({ ...courseDraft, summary: event.target.value })} />
            </AdminField>
            <AdminField label="Description" htmlFor="training-course-description" className="sm:col-span-2">
              <textarea id="training-course-description" required maxLength={8000} rows={5} className={inputClass} value={courseDraft.description} onChange={(event) => setCourseDraft({ ...courseDraft, description: event.target.value })} />
            </AdminField>
            <AdminField label={`Learning objectives${courseDraft.published ? ' *' : ''}`} htmlFor="training-course-objectives" hint={courseDraft.published ? 'Add at least one objective, one per line.' : 'Add verified objectives before publishing.'} className="sm:col-span-2">
              <textarea id="training-course-objectives" required={courseDraft.published} rows={4} className={inputClass} value={objectives} onChange={(event) => setObjectives(event.target.value)} />
            </AdminField>
            <AdminField label={`Target participants${courseDraft.published ? ' *' : ''}`} htmlFor="training-course-audience">
              <textarea id="training-course-audience" required={courseDraft.published} rows={3} className={inputClass} value={courseDraft.target_audience} onChange={(event) => setCourseDraft({ ...courseDraft, target_audience: event.target.value })} />
            </AdminField>
            <AdminField label={`Prerequisites${courseDraft.published ? ' *' : ''}`} htmlFor="training-course-prerequisites" hint='Enter “None” when no prerequisites apply.'>
              <textarea id="training-course-prerequisites" required={courseDraft.published} rows={3} className={inputClass} value={courseDraft.prerequisites} onChange={(event) => setCourseDraft({ ...courseDraft, prerequisites: event.target.value })} />
            </AdminField>
            <AdminField
              label={`Duration in minutes${courseDraft.published ? ' *' : ''}`}
              htmlFor="training-course-duration"
              hint={courseDraft.published ? 'Required for a published course.' : 'Leave blank until EcoHealth confirms the duration.'}
            >
              <input
                id="training-course-duration"
                required={courseDraft.published}
                type="number"
                min={1}
                max={100000}
                className={inputClass}
                value={courseDraft.duration_minutes ?? ''}
                onChange={(event) => setCourseDraft({
                  ...courseDraft,
                  duration_minutes: event.target.value ? Number(event.target.value) : null,
                })}
              />
            </AdminField>
            <AdminField label="Price (optional)" htmlFor="training-course-price">
              <input id="training-course-price" type="number" min={0} step="any" className={inputClass} value={priceInput} onChange={(event) => setPriceInput(event.target.value)} />
            </AdminField>
            <AdminField label="Currency" htmlFor="training-course-currency">
              <input id="training-course-currency" required minLength={3} maxLength={3} className={inputClass} value={courseDraft.currency} onChange={(event) => setCourseDraft({ ...courseDraft, currency: event.target.value.toUpperCase() })} />
            </AdminField>
            <fieldset className="sm:col-span-2">
              <legend className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                Delivery formats{courseDraft.published ? ' *' : ''}
              </legend>
              <div className="mt-3 flex flex-wrap gap-4">
                {FORMATS.map((format) => (
                  <label key={format} className="flex items-center gap-2 text-sm capitalize text-charcoal-light">
                    <input type="checkbox" checked={deliveryFormats.includes(format)} onChange={(event) => setDeliveryFormats((current) => event.target.checked ? [...current, format] : current.filter((value) => value !== format))} />
                    {format}
                  </label>
                ))}
              </div>
              {!courseDraft.published && <p className="mt-2 text-xs text-muted">Select only confirmed formats; at least one is required before publication.</p>}
            </fieldset>
            <label className="flex items-center gap-3 text-sm text-charcoal-light">
              <input type="checkbox" checked={courseDraft.requires_assessment} onChange={(event) => setCourseDraft({ ...courseDraft, requires_assessment: event.target.checked })} />
              Assessment required for certificate
            </label>
            {courseDraft.requires_assessment && (
              <AdminField label="Passing score (%)" htmlFor="training-course-pass-score">
                <input id="training-course-pass-score" type="number" min={0} max={100} step="0.01" className={inputClass} value={courseDraft.passing_score} onChange={(event) => setCourseDraft({ ...courseDraft, passing_score: Number(event.target.value) })} />
              </AdminField>
            )}
            <label className="flex items-center gap-3 text-sm text-charcoal-light">
              <input type="checkbox" checked={courseDraft.online_enabled} onChange={(event) => setCourseDraft({ ...courseDraft, online_enabled: event.target.checked, require_online_completion: event.target.checked ? courseDraft.require_online_completion : false })} />
              Online chapters enabled
            </label>
            <label className="flex items-center gap-3 text-sm text-charcoal-light">
              <input type="checkbox" disabled={!courseDraft.online_enabled} checked={courseDraft.require_online_completion} onChange={(event) => setCourseDraft({ ...courseDraft, require_online_completion: event.target.checked })} />
              Chapter completion required for a certificate
            </label>
            <label className="flex items-center gap-3 text-sm text-charcoal-light">
              <input type="checkbox" checked={courseDraft.published} onChange={(event) => setCourseDraft({ ...courseDraft, published: event.target.checked })} />
              Publish course
            </label>
            {courseError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{courseError}</p>}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save course'}</button>
              <button type="button" onClick={() => setCourseDraft(null)} className="btn-secondary"><X className="h-4 w-4" /> Cancel</button>
            </div>
          </form>
        )}

        <div className="mt-5 divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
          {data.courses.map((course) => (
            <div key={course.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-charcoal">{course.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {data.categories.find((category) => category.id === course.category_id)?.name ?? 'No category'}
                  {' · '}{course.published && !course.archived_at ? 'Published' : course.archived_at ? 'Archived' : 'Draft'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => startCourse(course)} className="text-xs font-semibold text-forest-700 link-underline">Edit</button>
                <button type="button" onClick={() => void run(() => archiveTrainingCourse(course.id, !course.archived_at), course.archived_at ? 'Course restored as a draft.' : 'Course archived.')} className="text-xs font-semibold text-charcoal-light link-underline">
                  {course.archived_at ? 'Restore' : 'Archive'}
                </button>
              </div>
            </div>
          ))}
          {data.courses.length === 0 && <p className="p-5 text-sm text-muted">No courses have been created.</p>}
        </div>
      </section>
    </div>
  );
}

function SessionsPanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<TrainingSession | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const start = (session?: TrainingSession) => {
    const initialSession = session ?? {
      id: '',
      course_id: data.courses.find((course) => course.published && !course.archived_at)?.id ?? '',
      trainer_id: null,
      starts_at: '',
      ends_at: '',
      location: '',
      delivery_format: 'classroom',
      capacity: null,
      price_minor: null,
      status: 'draft',
      published: false,
    };
    setDraft(initialSession);
    const currency = data.courses.find((course) => course.id === initialSession.course_id)?.currency ?? 'RWF';
    setPriceInput(moneyInput(initialSession.price_minor, currency));
    setFormError(null);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const startDate = new Date(draft.starts_at);
    const endDate = new Date(draft.ends_at);
    if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || endDate <= startDate) {
      setFormError('Choose a valid end time after the session start.');
      return;
    }
    const currency = data.courses.find((course) => course.id === draft.course_id)?.currency ?? 'RWF';
    let price: number | null;
    try {
      price = priceInput.trim() ? parseMoney(priceInput, currency) : null;
    } catch {
      setFormError('Enter a valid ISO currency code and price.');
      return;
    }
    if (priceInput.trim() && price === null) {
      setFormError('Enter a non-negative session price.');
      return;
    }
    const result = await run(() => saveTrainingSession({
      ...draft,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      price_minor: price,
    }, draft.id || undefined), 'Training session saved.');
    if (result) setDraft(null);
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-medium text-charcoal">Training sessions</h2>
          <p className="mt-1 text-sm text-muted">Only published sessions with status “open” appear publicly. Resolve pending and waitlisted registrations before marking a session completed.</p>
        </div>
        <button type="button" onClick={() => start()} disabled={!data.courses.some((course) => !course.archived_at)} className="btn-primary disabled:opacity-50">
          <Plus className="h-4 w-4" /> Schedule session
        </button>
      </div>

      {draft && (
        <form onSubmit={save} className="mt-5 grid gap-5 border border-charcoal/15 bg-white p-5 sm:grid-cols-2">
          <AdminField label="Course" htmlFor="training-session-course">
            <select id="training-session-course" required className={inputClass} value={draft.course_id} onChange={(event) => {
              const courseId = event.target.value;
              setDraft({ ...draft, course_id: courseId, price_minor: null });
              setPriceInput('');
            }}>
              <option value="">Select a course</option>
              {data.courses.filter((course) => !course.archived_at).map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </AdminField>
          <AdminField label="Delivery format" htmlFor="training-session-format">
            <select id="training-session-format" required className={inputClass} value={draft.delivery_format} onChange={(event) => setDraft({ ...draft, delivery_format: event.target.value as DeliveryFormat })}>
              {FORMATS.map((format) => <option key={format} value={format}>{format}</option>)}
            </select>
          </AdminField>
          <AdminField label="Assigned trainer" htmlFor="training-session-trainer">
            <select id="training-session-trainer" className={inputClass} value={draft.trainer_id ?? ''} onChange={(event) => setDraft({ ...draft, trainer_id: event.target.value || null })}>
              <option value="">Not assigned</option>
              {data.trainers.filter((trainer) => trainer.active || trainer.id === draft.trainer_id).map((trainer) => (
                <option key={trainer.id} value={trainer.id}>{trainer.full_name}{trainer.active ? '' : ' (inactive)'}</option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Starts" htmlFor="training-session-start">
            <input id="training-session-start" required type="datetime-local" className={inputClass} value={toLocalDateTime(draft.starts_at)} onChange={(event) => setDraft({ ...draft, starts_at: event.target.value })} />
          </AdminField>
          <AdminField label="Ends" htmlFor="training-session-end">
            <input id="training-session-end" required type="datetime-local" className={inputClass} value={toLocalDateTime(draft.ends_at)} onChange={(event) => setDraft({ ...draft, ends_at: event.target.value })} />
          </AdminField>
          <AdminField label="Location or access details" htmlFor="training-session-location">
            <input id="training-session-location" maxLength={300} className={inputClass} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </AdminField>
          <AdminField label="Capacity (blank = confirm manually)" htmlFor="training-session-capacity">
            <input id="training-session-capacity" type="number" min={1} max={10000} className={inputClass} value={draft.capacity ?? ''} onChange={(event) => setDraft({ ...draft, capacity: event.target.value ? Number(event.target.value) : null })} />
          </AdminField>
          <AdminField label={`Session price in ${data.courses.find((course) => course.id === draft.course_id)?.currency ?? 'RWF'} (optional)`} htmlFor="training-session-price">
            <input id="training-session-price" type="number" min={0} step="any" className={inputClass} value={priceInput} onChange={(event) => setPriceInput(event.target.value)} />
          </AdminField>
          <AdminField label="Session status" htmlFor="training-session-status">
            <select id="training-session-status" className={inputClass} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TrainingSession['status'] })}>
              {(['draft', 'open', 'cancelled', 'completed'] as const).map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </AdminField>
          <label className="flex items-center gap-3 text-sm text-charcoal-light">
            <input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} />
            Publish session
          </label>
          {formError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{formError}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">Save session</button>
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-5 overflow-x-auto border-y border-charcoal/10 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Course / session</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {data.sessions.map((session) => (
              <tr key={session.id}>
                <td className="px-4 py-4">
                  <p className="font-medium text-charcoal">{data.courses.find((course) => course.id === session.course_id)?.title ?? 'Unknown course'}</p>
                  <p className="mt-1 text-xs text-muted">
                    {dateLabel(session.starts_at)} · {session.location || session.delivery_format}
                    {session.trainer_id && ` · ${data.trainers.find((trainer) => trainer.id === session.trainer_id)?.full_name ?? 'Trainer unavailable'}`}
                  </p>
                </td>
                <td className="px-4 py-4 text-charcoal-light">{session.capacity ?? 'Manual confirmation'}</td>
                <td className="px-4 py-4 text-charcoal-light">{session.published ? 'Published' : 'Draft'} · {session.status}</td>
                <td className="px-4 py-4 text-right"><button type="button" onClick={() => start(session)} className="text-xs font-semibold text-forest-700 link-underline">Edit</button></td>
              </tr>
            ))}
            {!data.sessions.length && <tr><td className="px-4 py-6 text-muted" colSpan={4}>No sessions scheduled yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TrainersPanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<Omit<TrainingTrainer, 'id'> | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [expertiseText, setExpertiseText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const start = (trainer?: TrainingTrainer) => {
    setEditingId(trainer?.id);
    setDraft(trainer
      ? {
          full_name: trainer.full_name,
          job_title: trainer.job_title,
          email: trainer.email,
          phone: trainer.phone,
          qualifications: trainer.qualifications,
          expertise: trainer.expertise,
          active: trainer.active,
        }
      : { full_name: '', job_title: '', email: '', phone: '', qualifications: '', expertise: [], active: true });
    setExpertiseText(trainer?.expertise.join('\n') ?? '');
    setFormError(null);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const expertise = expertiseText.split('\n').map((item) => item.trim()).filter(Boolean);
    if (draft.full_name.trim().length < 2 || expertise.length > 30) {
      setFormError(expertise.length > 30
        ? 'Add no more than 30 areas of expertise.'
        : 'Enter a trainer name with at least two characters.');
      return;
    }
    const values = {
      ...draft,
      full_name: draft.full_name.trim(),
      job_title: draft.job_title.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      qualifications: draft.qualifications.trim(),
      expertise,
    };
    const saved = await run(() => saveTrainingTrainer(values, editingId), 'Trainer profile saved.');
    if (saved) {
      setDraft(null);
      setEditingId(undefined);
    }
  };

  const toggleActive = (trainer: TrainingTrainer) => {
    const { id, ...values } = trainer;
    void run(() => saveTrainingTrainer({ ...values, active: !trainer.active }, id), trainer.active ? 'Trainer deactivated.' : 'Trainer activated.');
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-medium text-charcoal">Trainer directory</h2>
          <p className="mt-1 text-sm text-muted">Contact and qualification details are visible only to authorized training administrators.</p>
        </div>
        <button type="button" onClick={() => start()} className="btn-primary"><Plus className="h-4 w-4" /> Add trainer</button>
      </div>

      {draft && (
        <form onSubmit={save} className="mt-5 grid gap-5 border border-charcoal/15 bg-white p-5 sm:grid-cols-2">
          <AdminField label="Full name" htmlFor="training-trainer-name">
            <input id="training-trainer-name" required minLength={2} maxLength={120} className={inputClass} value={draft.full_name} onChange={(event) => setDraft({ ...draft, full_name: event.target.value })} />
          </AdminField>
          <AdminField label="Job title" htmlFor="training-trainer-title">
            <input id="training-trainer-title" maxLength={120} className={inputClass} value={draft.job_title} onChange={(event) => setDraft({ ...draft, job_title: event.target.value })} />
          </AdminField>
          <AdminField label="Email" htmlFor="training-trainer-email">
            <input id="training-trainer-email" type="email" maxLength={254} className={inputClass} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          </AdminField>
          <AdminField label="Phone" htmlFor="training-trainer-phone">
            <input id="training-trainer-phone" type="tel" maxLength={30} className={inputClass} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
          </AdminField>
          <AdminField label="Qualifications" htmlFor="training-trainer-qualifications">
            <textarea id="training-trainer-qualifications" rows={3} maxLength={2000} className={inputClass} value={draft.qualifications} onChange={(event) => setDraft({ ...draft, qualifications: event.target.value })} />
          </AdminField>
          <AdminField label="Areas of expertise (one per line)" htmlFor="training-trainer-expertise">
            <textarea id="training-trainer-expertise" rows={3} maxLength={2000} className={inputClass} value={expertiseText} onChange={(event) => setExpertiseText(event.target.value)} />
          </AdminField>
          <label className="flex items-center gap-3 text-sm text-charcoal-light">
            <input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} />
            Available for session assignment
          </label>
          {formError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{formError}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">Save trainer</button>
            <button type="button" onClick={() => { setDraft(null); setEditingId(undefined); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-5 divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
        {data.trainers.map((trainer) => (
          <article key={trainer.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-medium text-charcoal">{trainer.full_name}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{trainer.active ? 'Active' : 'Inactive'}</span>
              </div>
              {trainer.job_title && <p className="mt-1 text-sm text-muted">{trainer.job_title}</p>}
              <p className="mt-2 text-sm text-charcoal-light">
                {[trainer.email, trainer.phone].filter(Boolean).join(' · ') || 'No contact details provided'}
              </p>
              {trainer.qualifications && <p className="mt-2 max-w-3xl whitespace-pre-line text-sm text-muted">{trainer.qualifications}</p>}
              {trainer.expertise.length > 0 && <p className="mt-2 text-xs text-muted">Expertise: {trainer.expertise.join(', ')}</p>}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => start(trainer)} className="text-xs font-semibold text-forest-700 link-underline">Edit</button>
              <button type="button" disabled={saving} onClick={() => toggleActive(trainer)} className="text-xs font-semibold text-charcoal-light link-underline disabled:opacity-50">
                {trainer.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </article>
        ))}
        {!data.trainers.length && <p className="p-6 text-sm text-muted">No trainers have been added.</p>}
      </div>
    </section>
  );
}

function PaymentsPanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<{
    registrationId: string;
    amountDue: string;
    amountPaid: string;
    paymentMethod: TrainingPaymentMethod | '';
    transactionReference: string;
    waived: boolean;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedRegistration = draft
    ? data.registrations.find((registration) => registration.id === draft.registrationId)
    : undefined;
  const selectedPayment = draft
    ? data.payments.find((payment) => payment.registration_id === draft.registrationId)
    : undefined;
  const selectedSession = selectedRegistration?.training_sessions;
  const selectedCourse = selectedSession?.training_courses;
  const selectedCurrency = selectedPayment?.currency ?? selectedCourse?.currency ?? 'RWF';

  const start = (registration: TrainingAdminData['registrations'][number]) => {
    const payment = data.payments.find((entry) => entry.registration_id === registration.id);
    const course = registration.training_sessions?.training_courses;
    const session = registration.training_sessions;
    const amountDue = payment
      ? payment.amount_due_minor
      : session?.price_minor ?? course?.price_minor ?? null;
    setDraft({
      registrationId: registration.id,
      amountDue: moneyInput(amountDue, payment?.currency ?? course?.currency ?? 'RWF'),
      amountPaid: moneyInput(payment?.amount_paid_minor ?? 0, payment?.currency ?? course?.currency ?? 'RWF'),
      paymentMethod: payment?.payment_method ?? 'cash',
      transactionReference: payment?.transaction_reference ?? '',
      waived: payment?.status === 'waived',
    });
    setFormError(null);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || !selectedRegistration) return;
    let amountDue: number | null;
    let amountPaid: number | null;
    try {
      amountDue = parseMoney(draft.amountDue, selectedCurrency);
      amountPaid = draft.amountPaid.trim() ? parseMoney(draft.amountPaid, selectedCurrency) : 0;
    } catch {
      setFormError('Enter a valid currency and payment amount.');
      return;
    }
    if ((draft.amountDue.trim() && amountDue === null) || amountPaid === null) {
      setFormError('Enter non-negative payment amounts.');
      return;
    }
    if (amountPaid > 0 && !draft.paymentMethod) {
      setFormError('Select the confirmed method used for the payment.');
      return;
    }
    if (draft.waived && (amountPaid !== 0 || amountDue === null || amountDue === 0)) {
      setFormError('A waived payment must have a positive due amount and no recorded payment.');
      return;
    }
    const result = await run(() => recordTrainingPayment({
      registration_id: draft.registrationId,
      amount_due_minor: amountDue,
      amount_paid_minor: amountPaid ?? 0,
      payment_method: amountPaid && amountPaid > 0 ? draft.paymentMethod || null : null,
      transaction_reference: draft.transactionReference.trim(),
      waived: draft.waived,
    }), 'Manual payment status saved.');
    if (result) setDraft(null);
  };

  return (
    <section>
      <div>
        <h2 className="font-display text-xl font-medium text-charcoal">Manual payment tracking</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Record amounts only after confirming payment outside this website. This is not online checkout; never enter card numbers or security codes.
        </p>
      </div>

      {draft && selectedRegistration && (
        <form onSubmit={save} className="mt-5 grid gap-5 border border-charcoal/15 bg-white p-5 sm:grid-cols-2">
          <p className="text-sm font-medium text-charcoal sm:col-span-2">
            {selectedCourse?.title ?? 'Training registration'} · {selectedRegistration.contact_name}
          </p>
          <AdminField label={`Amount due (${selectedCurrency}; blank if not set)`} htmlFor="training-payment-due">
            <input id="training-payment-due" type="number" min={0} step="any" className={inputClass} value={draft.amountDue} onChange={(event) => setDraft({ ...draft, amountDue: event.target.value })} />
          </AdminField>
          <AdminField label={`Amount received (${selectedCurrency})`} htmlFor="training-payment-paid">
            <input id="training-payment-paid" type="number" min={0} step="any" className={inputClass} value={draft.amountPaid} onChange={(event) => setDraft({ ...draft, amountPaid: event.target.value })} />
          </AdminField>
          <AdminField label="Confirmed payment method" htmlFor="training-payment-method">
            <select id="training-payment-method" className={inputClass} value={draft.paymentMethod} onChange={(event) => setDraft({ ...draft, paymentMethod: event.target.value as TrainingPaymentMethod | '' })}>
              <option value="">Not recorded</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="mobile_money">Mobile money</option>
              <option value="other">Other</option>
            </select>
          </AdminField>
          <AdminField label="Reference (optional; no sensitive payment data)" htmlFor="training-payment-reference">
            <input id="training-payment-reference" maxLength={160} className={inputClass} value={draft.transactionReference} onChange={(event) => setDraft({ ...draft, transactionReference: event.target.value })} />
          </AdminField>
          <label className="flex items-center gap-3 text-sm text-charcoal-light sm:col-span-2">
            <input type="checkbox" checked={draft.waived} onChange={(event) => setDraft({ ...draft, waived: event.target.checked, amountPaid: '0' })} />
            Waive the full outstanding amount
          </label>
          {formError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{formError}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">Save payment status</button>
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-5 overflow-x-auto border-y border-charcoal/10 bg-white">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Method / reference</th><th className="px-4 py-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {data.registrations.map((registration) => {
              const payment = data.payments.find((entry) => entry.registration_id === registration.id);
              const course = registration.training_sessions?.training_courses;
              const currency = payment?.currency ?? course?.currency ?? 'RWF';
              return (
                <tr key={registration.id}>
                  <td className="px-4 py-4">
                    <p className="font-medium text-charcoal">{course?.title ?? 'Training registration'}</p>
                    <p className="mt-1 text-xs text-muted">{registration.contact_name} · {registration.status}</p>
                  </td>
                  <td className="px-4 py-4 capitalize text-charcoal-light">{(payment?.status ?? 'not_set').replace('_', ' ')}</td>
                  <td className="px-4 py-4 text-charcoal-light">{formatTrainingMoney(payment?.amount_due_minor ?? null, currency)}</td>
                  <td className="px-4 py-4 text-charcoal-light">{formatTrainingMoney(payment?.amount_paid_minor ?? 0, currency)}</td>
                  <td className="px-4 py-4 text-xs text-charcoal-light">
                    {[payment?.payment_method?.replace('_', ' '), payment?.transaction_reference].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button type="button" onClick={() => start(registration)} className="text-xs font-semibold text-forest-700 link-underline">
                      {payment ? 'Update' : 'Record'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!data.registrations.length && <tr><td className="px-4 py-6 text-muted" colSpan={6}>No registrations to track.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RegistrationsPanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-charcoal">Registration review</h2>
      <p className="mt-1 text-sm text-muted">Pending requests already reserve session capacity; approval does not oversell.</p>
      <div className="mt-5 space-y-4">
        {data.registrations.map((registration) => {
          const session = registration.training_sessions;
          const course = session?.training_courses;
          return (
            <article key={registration.id} className="border border-charcoal/15 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-forest-700">{registration.registration_type} · {registration.participant_count} participants</p>
                  <h3 className="mt-2 font-display text-lg font-medium text-charcoal">{course?.title ?? 'Training course'}</h3>
                  <p className="mt-1 text-sm text-muted">{session?.starts_at ? dateLabel(session.starts_at) : 'Session unavailable'} · {session?.location}</p>
                  <p className="mt-3 text-sm text-charcoal">{registration.contact_name} · <a className="link-underline" href={`mailto:${registration.contact_email}`}>{registration.contact_email}</a></p>
                  {registration.organisation && <p className="mt-1 text-sm text-muted">{registration.organisation}</p>}
                  {registration.additional_requirements && <p className="mt-3 whitespace-pre-line text-sm text-muted">{registration.additional_requirements}</p>}
                </div>
                <span className="border border-charcoal/15 px-3 py-1 text-xs capitalize text-charcoal-light">{registration.status}</span>
              </div>
              <ul className="mt-4 grid gap-2 border-t border-charcoal/10 pt-4 sm:grid-cols-2">
                {(registration.training_participants ?? []).map((participant) => (
                  <li key={participant.id} className="text-sm text-charcoal-light">{participant.full_name} · {participant.email}</li>
                ))}
              </ul>
              <label className="mt-4 block text-xs font-medium uppercase tracking-widest text-charcoal-light">
                Review note
                <input value={notes[registration.id] ?? registration.review_note} maxLength={1000} onChange={(event) => setNotes({ ...notes, [registration.id]: event.target.value })} className={inputClass} />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={saving || registration.status === status}
                    onClick={() => void run(
                      () => reviewTrainingRegistration(registration.id, status, notes[registration.id] ?? registration.review_note),
                      `Registration ${status}.`,
                    )}
                    className="border border-charcoal/15 px-3 py-2 text-xs capitalize text-charcoal-light hover:border-forest-700 hover:text-forest-800 disabled:opacity-40"
                  >
                    Mark {status}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
        {!data.registrations.length && <p className="border border-dashed border-charcoal/20 p-7 text-sm text-muted">No registrations have been submitted.</p>}
      </div>
    </section>
  );
}

function ParticipantsPanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [participantId, setParticipantId] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'excused'>('present');
  const [assessmentId, setAssessmentId] = useState('');
  const [score, setScore] = useState('');
  const [note, setNote] = useState('');

  const participants = useMemo(() => data.registrations
    .filter((registration) => registration.status === 'approved')
    .flatMap((registration) => (registration.training_participants ?? []).map((participant) => ({
      ...participant,
      courseId: registration.training_sessions?.course_id ?? '',
      courseTitle: registration.training_sessions?.training_courses?.title ?? 'Training course',
      sessionLabel: registration.training_sessions?.starts_at ? dateLabel(registration.training_sessions.starts_at) : '',
    }))), [data.registrations]);
  const selected = participants.find((participant) => participant.id === participantId);
  const assessments = data.assessments.filter((assessment) => assessment.active && assessment.course_id === selected?.courseId);

  return (
    <section>
      <h2 className="font-display text-xl font-medium text-charcoal">Attendance &amp; assessment</h2>
      <p className="mt-1 text-sm text-muted">Only approved registrations are available for completion records.</p>
      {!participants.length ? (
        <p className="mt-5 border border-dashed border-charcoal/20 p-7 text-sm text-muted">Approve a registration to manage its participants.</p>
      ) : (
        <div className="mt-5 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
              Participant
              <select value={participantId} onChange={(event) => { setParticipantId(event.target.value); setAssessmentId(''); }} className={inputClass}>
                <option value="">Select participant</option>
                {participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.full_name} · {participant.courseTitle} · {participant.sessionLabel}</option>)}
              </select>
            </label>
            {selected && (
              <div className="mt-4 border border-charcoal/15 bg-white p-5">
                <p className="font-medium text-charcoal">{selected.full_name}</p>
                <p className="mt-1 text-sm text-muted">{selected.email}</p>
                <p className="mt-2 text-xs text-muted">{selected.courseTitle} · {selected.sessionLabel}</p>
              </div>
            )}
          </div>
          <div className="space-y-6 lg:col-span-7">
            <div className="border border-charcoal/15 bg-white p-5">
              <h3 className="font-display text-lg font-medium text-charcoal">Record attendance</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                  Attendance
                  <select value={attendanceStatus} onChange={(event) => setAttendanceStatus(event.target.value as typeof attendanceStatus)} className={inputClass}>
                    <option value="present">Present</option><option value="absent">Absent</option><option value="excused">Excused</option>
                  </select>
                </label>
                <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                  Note
                  <input value={note} maxLength={1000} onChange={(event) => setNote(event.target.value)} className={inputClass} />
                </label>
              </div>
              <button type="button" disabled={!selected || saving} onClick={() => selected && void run(() => recordTrainingAttendance(selected.id, attendanceStatus, note), 'Attendance saved.')} className="btn-primary mt-5 disabled:opacity-50">Save attendance</button>
            </div>

            <div className="border border-charcoal/15 bg-white p-5">
              <h3 className="font-display text-lg font-medium text-charcoal">Record assessment</h3>
              {selected && !assessments.length ? (
                <p className="mt-3 text-sm text-muted">No active assessment is configured for this course.</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                    Assessment
                    <select value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)} className={inputClass}>
                      <option value="">Select assessment</option>
                      {assessments.map((assessment) => <option key={assessment.id} value={assessment.id}>{assessment.title}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                    Score (%)
                    <input type="number" min={0} max={100} step="0.01" value={score} onChange={(event) => setScore(event.target.value)} className={inputClass} />
                  </label>
                </div>
              )}
              <button
                type="button"
                disabled={!selected || !assessmentId || score === '' || saving}
                onClick={() => selected && void run(
                  () => recordTrainingAssessment(selected.id, assessmentId, Number(score), note),
                  'Assessment result saved.',
                )}
                className="btn-primary mt-5 disabled:opacity-50"
              >
                Save assessment result
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-8 border-t border-charcoal/15 pt-5">
        <h3 className="font-display text-lg font-medium text-charcoal">Configure assessments by course</h3>
        <AssessmentEditor data={data} run={run} saving={saving} />
      </div>
    </section>
  );
}

function AssessmentEditor({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState('');
  return (
    <div className="mt-4 grid gap-4 border border-charcoal/15 bg-white p-5 sm:grid-cols-2">
      <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
        Course
        <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className={inputClass}>
          <option value="">Select course</option>
          {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </label>
      <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
        Assessment title
        <input value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
      </label>
      <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light sm:col-span-2">
        Instructions
        <textarea value={instructions} maxLength={4000} rows={3} onChange={(event) => setInstructions(event.target.value)} className={inputClass} />
      </label>
      <label className="flex items-center gap-3 text-sm text-charcoal-light">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Active assessment
      </label>
      <div>
        <button type="button" disabled={!courseId || !title.trim() || saving} onClick={() => void run(async () => {
          const result = await saveTrainingAssessment({ course_id: courseId, title, instructions, active }, editingId || undefined);
          if (!result) {
            setEditingId('');
            setTitle('');
            setInstructions('');
          }
          return result;
        }, 'Assessment saved.')} className="btn-primary disabled:opacity-50">{editingId ? 'Save assessment' : 'Add assessment'}</button>
      </div>
      <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10 sm:col-span-2">
        {data.assessments.map((assessment) => (
          <li key={assessment.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span className="text-sm text-charcoal">{data.courses.find((course) => course.id === assessment.course_id)?.title}: {assessment.title} · {assessment.active ? 'Active' : 'Inactive'}</span>
            <button type="button" onClick={() => {
              setEditingId(assessment.id);
              setCourseId(assessment.course_id);
              setTitle(assessment.title);
              setInstructions(assessment.instructions);
              setActive(assessment.active);
            }} className="text-xs text-forest-700 link-underline">Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MaterialsPanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [courseId, setCourseId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  return (
    <section>
      <h2 className="font-display text-xl font-medium text-charcoal">Learning materials</h2>
      <p className="mt-1 text-sm text-muted">Private storage, limited to approved registrants for the matching course or session.</p>
      <form onSubmit={async (event) => {
        event.preventDefault();
        if (!file) return;
        const result = await run(() => uploadTrainingMaterial({ courseId, sessionId, title, description, file }), 'Material uploaded as a draft.');
        if (result) {
          setTitle('');
          setDescription('');
          setFile(null);
        }
      }} className="mt-5 grid gap-4 border border-charcoal/15 bg-white p-5 sm:grid-cols-2">
        <AdminField label="Course" htmlFor="training-material-course">
          <select required id="training-material-course" value={courseId} onChange={(event) => setCourseId(event.target.value)} className={inputClass}>
            <option value="">Select course</option>
            {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </AdminField>
        <AdminField label="Session (optional)" htmlFor="training-material-session">
          <select id="training-material-session" value={sessionId} onChange={(event) => setSessionId(event.target.value)} className={inputClass}>
            <option value="">All sessions for course</option>
            {data.sessions.filter((session) => !courseId || session.course_id === courseId).map((session) => <option key={session.id} value={session.id}>{dateLabel(session.starts_at)}</option>)}
          </select>
        </AdminField>
        <AdminField label="Title" htmlFor="training-material-title">
          <input required maxLength={160} id="training-material-title" value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
        </AdminField>
        <AdminField label="Description" htmlFor="training-material-description">
          <input maxLength={1000} id="training-material-description" value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} />
        </AdminField>
        <AdminField label="File (max 20 MB)" htmlFor="training-material-file" className="sm:col-span-2">
          <input required id="training-material-file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className={inputClass} />
        </AdminField>
        <button type="submit" disabled={saving || !file} className="btn-primary disabled:opacity-50 sm:col-span-2">{saving ? 'Uploading…' : 'Upload material'}</button>
      </form>
      <ul className="mt-5 divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
        {data.materials.map((material) => (
          <li key={material.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-charcoal">{material.title}</p>
              <p className="mt-1 text-xs text-muted">{data.courses.find((course) => course.id === material.course_id)?.title} · {material.published ? 'Published' : 'Draft'}</p>
            </div>
            <button type="button" disabled={saving} onClick={() => void run(() => setTrainingMaterialPublished(material.id, !material.published), material.published ? 'Material unpublished.' : 'Material published.')} className="text-xs font-semibold text-forest-700 link-underline">
              {material.published ? 'Unpublish' : 'Publish'}
            </button>
          </li>
        ))}
        {!data.materials.length && <li className="p-5 text-sm text-muted">No materials uploaded.</li>}
      </ul>
    </section>
  );
}

function CorporatePanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <section>
      <h2 className="font-display text-xl font-medium text-charcoal">Corporate training requests</h2>
      <div className="mt-5 space-y-4">
        {data.corporateRequests.map((request) => (
          <article key={request.id} className="border border-charcoal/15 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-medium text-charcoal">{request.organisation}</p>
                <p className="mt-1 text-sm text-muted">{request.contact_name} · <a className="link-underline" href={`mailto:${request.email}`}>{request.email}</a> · {request.telephone || 'No telephone'}</p>
              </div>
              <span className="text-xs capitalize text-forest-800">{request.status.replace('_', ' ')}</span>
            </div>
            <dl className="mt-4 grid gap-3 border-t border-charcoal/10 pt-4 sm:grid-cols-3">
              <div><dt className="text-[9px] uppercase tracking-wider text-muted">Participants</dt><dd className="mt-1 text-sm text-charcoal">{request.participant_estimate}</dd></div>
              <div><dt className="text-[9px] uppercase tracking-wider text-muted">Preferred dates</dt><dd className="mt-1 text-sm text-charcoal">{request.preferred_dates || 'Not specified'}</dd></div>
              <div><dt className="text-[9px] uppercase tracking-wider text-muted">Location</dt><dd className="mt-1 text-sm text-charcoal">{request.location || 'Not specified'}</dd></div>
            </dl>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-charcoal-light">{request.requirements}</p>
            {request.additional_information && <p className="mt-3 whitespace-pre-line text-sm text-muted">{request.additional_information}</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                Internal note
                <input maxLength={1000} value={notes[request.id] ?? request.admin_note} onChange={(event) => setNotes({ ...notes, [request.id]: event.target.value })} className={inputClass} />
              </label>
              <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                Status
                <select value={request.status} onChange={(event) => void run(() => saveCorporateRequestReview(request.id, event.target.value as CorporateRequestStatus, notes[request.id] ?? request.admin_note), 'Corporate request updated.')} className={inputClass}>
                  {(['new', 'under_review', 'responded', 'closed'] as const).map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                </select>
              </label>
            </div>
            <button type="button" disabled={saving} onClick={() => void run(() => saveCorporateRequestReview(request.id, request.status, notes[request.id] ?? request.admin_note), 'Corporate request note saved.')} className="btn-secondary mt-4">Save note</button>
          </article>
        ))}
        {!data.corporateRequests.length && <p className="border border-dashed border-charcoal/20 p-7 text-sm text-muted">No corporate requests received.</p>}
      </div>
    </section>
  );
}

function CertificatesPanel({
  data,
  run,
  saving,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
}) {
  const current = data.certificateSettings;
  const [issuerName, setIssuerName] = useState(current?.issuer_name ?? '');
  const [issuerTitle, setIssuerTitle] = useState(current?.issuer_title ?? '');
  const [issuerOrganisation, setIssuerOrganisation] = useState(current?.issuer_organisation ?? '');
  const [authorized, setAuthorized] = useState(current?.issuer_authorized ?? false);
  const [revokeReason, setRevokeReason] = useState<Record<string, string>>({});
  const eligible = data.registrations
    .filter((registration) => registration.status === 'approved' && registration.training_sessions?.status === 'completed')
    .flatMap((registration) => (registration.training_participants ?? []).map((participant) => ({
      participant,
      course: registration.training_sessions?.training_courses,
    })))
    .filter(({ participant, course }) => {
      if (data.certificates.some((certificate) => certificate.participant_id === participant.id)) return false;
      const present = data.attendance.some((entry) => entry.participant_id === participant.id && entry.status === 'present');
      const activeAssessments = course
        ? data.assessments.filter((assessment) => assessment.course_id === course.id && assessment.active)
        : [];
      const passed = !course?.requires_assessment || (
        activeAssessments.length > 0 &&
        activeAssessments.every((assessment) => data.results.some(
          (result) => result.participant_id === participant.id && result.assessment_id === assessment.id && result.passed,
        ))
      );
      return present && passed;
    });

  useEffect(() => {
    setIssuerName(current?.issuer_name ?? '');
    setIssuerTitle(current?.issuer_title ?? '');
    setIssuerOrganisation(current?.issuer_organisation ?? '');
    setAuthorized(current?.issuer_authorized ?? false);
  }, [current]);

  return (
    <section>
      <h2 className="font-display text-xl font-medium text-charcoal">Certificate issuer</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Enter only issuer details that EcoHealth has verified. The database refuses certificate issuance unless the
        issuer is marked authorized and required course completion conditions are met.
      </p>
      <p className="mt-2 max-w-2xl text-xs text-muted">
        Where a course requires online completion, the participant must also have finished every published chapter
        before a certificate can be issued.
      </p>
      <div className="mt-5 grid gap-4 border border-charcoal/15 bg-white p-5 sm:grid-cols-2">
        <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
          Issuer name
          <input value={issuerName} maxLength={160} onChange={(event) => setIssuerName(event.target.value)} className={inputClass} />
        </label>
        <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
          Issuer title
          <input value={issuerTitle} maxLength={120} onChange={(event) => setIssuerTitle(event.target.value)} className={inputClass} />
        </label>
        <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
          Issuing organisation
          <input value={issuerOrganisation} maxLength={160} onChange={(event) => setIssuerOrganisation(event.target.value)} className={inputClass} />
        </label>
        <label className="flex items-center gap-3 text-sm text-charcoal-light">
          <input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} />
          I confirm this issuer is authorized to issue these certificates
        </label>
        <button type="button" disabled={saving} onClick={() => void run(() => saveTrainingCertificateSettings({
          id: true,
          issuer_name: issuerName,
          issuer_title: issuerTitle,
          issuer_organisation: issuerOrganisation,
          issuer_authorized: authorized,
        }), 'Certificate issuer settings saved.')} className="btn-primary sm:col-span-2">Save issuer settings</button>
      </div>

      <h3 className="mt-10 font-display text-lg font-medium text-charcoal">Eligible participants</h3>
      <ul className="mt-4 divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
        {eligible.map(({ participant, course }) => (
          <li key={participant.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-charcoal">{participant.full_name}</p>
              <p className="mt-1 text-xs text-muted">{course?.title} · {participant.email}</p>
            </div>
            <button type="button" disabled={!authorized || saving} onClick={() => void run(() => issueTrainingCertificate(participant.id), 'Certificate issued.')} className="btn-primary disabled:opacity-50">Issue certificate</button>
          </li>
        ))}
        {!eligible.length && <li className="p-5 text-sm text-muted">No participants currently meet the configured completion requirements.</li>}
      </ul>

      <h3 className="mt-10 font-display text-lg font-medium text-charcoal">Issued certificates</h3>
      <ul className="mt-4 divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
        {data.certificates.map((certificate) => (
          <li key={certificate.id} className="grid gap-4 p-4 sm:grid-cols-3 sm:items-center">
            <div>
              <p className="font-medium text-charcoal">{certificate.participant_name}</p>
              <p className="mt-1 text-xs text-muted">{certificate.course_title}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-charcoal">{certificate.certificate_number}</p>
              <p className={`mt-1 text-xs ${certificate.revoked_at ? 'text-red-700' : 'text-forest-700'}`}>{certificate.revoked_at ? 'Revoked' : 'Issued'}</p>
            </div>
            {!certificate.revoked_at && (
              <div className="flex gap-2">
                <input aria-label="Certificate revocation reason" maxLength={1000} placeholder="Reason to revoke" value={revokeReason[certificate.id] ?? ''} onChange={(event) => setRevokeReason({ ...revokeReason, [certificate.id]: event.target.value })} className={inputClass} />
                <button type="button" disabled={saving || (revokeReason[certificate.id] ?? '').trim().length < 3} onClick={() => void run(() => revokeTrainingCertificate(certificate.id, revokeReason[certificate.id]), 'Certificate revoked.')} className="text-xs font-semibold text-red-700 link-underline">Revoke</button>
              </div>
            )}
          </li>
        ))}
        {!data.certificates.length && <li className="p-5 text-sm text-muted">No certificates issued.</li>}
      </ul>
    </section>
  );
}

/* ——————————————————— Online learning builder ——————————————————— */

function OnlineLearningPanel({
  data,
  run,
  saving,
  onOpenCourses,
}: {
  data: TrainingAdminData;
  run: (action: () => Promise<string | null>, success: string) => Promise<boolean>;
  saving: boolean;
  onOpenCourses: () => void;
}) {
  const availableCourses = data.courses.filter((course) => !course.archived_at);
  const [courseId, setCourseId] = useState('');
  const [chapters, setChapters] = useState<ChapterPayload[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [report, setReport] = useState<OnlineLearningReportRow[]>([]);
  const [reportError, setReportError] = useState<string | null>(null);

  const course = availableCourses.find((entry) => entry.id === courseId) ?? null;
  const activeChapter = chapters[activeIndex];
  const totalWords = chapters.reduce((total, chapter) => total + chapter.body.trim().split(/\s+/).filter(Boolean).length, 0);

  useEffect(() => {
    let active = true;
    fetchOnlineLearningReport().then((result) => {
      if (!active) return;
      setReport(result.data);
      setReportError(result.data.length ? null : result.error);
    });
    return () => {
      active = false;
    };
  }, [data.courses, data.registrations]);

  const loadCourse = async (id: string) => {
    setLoading(true);
    setLoadError(null);
    const result = await fetchLearningCourse(id);
    setLoading(false);
    if (result.error || !result.data) {
      setChapters([]);
      setLoadError(result.error ?? 'Chapters could not be loaded.');
      return;
    }
    setChapters(result.data.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      summary: chapter.summary,
      body: chapter.body,
      estimated_minutes: chapter.estimated_minutes,
      published: chapter.published,
      source_document: '',
    })));
    setActiveIndex(0);
  };

  useEffect(() => {
    if (!courseId) {
      setChapters([]);
      setLoadError(null);
      return;
    }
    void loadCourse(courseId);
  }, [courseId]);

  const updateChapter = (index: number, patch: Partial<ChapterPayload>) => {
    setChapters((previous) => previous.map((chapter, position) => (position === index ? { ...chapter, ...patch } : chapter)));
  };

  const moveChapter = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= chapters.length) return;
    setChapters((previous) => {
      const next = [...previous];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
    setActiveIndex(target);
  };

  const removeChapter = (index: number) => {
    setChapters((previous) => previous.filter((_, position) => position !== index));
    setActiveIndex((current) => Math.max(0, Math.min(current, chapters.length - 2)));
  };

  const addChapter = () => {
    setChapters((previous) => [
      ...previous,
      { title: 'New chapter', summary: '', body: '', estimated_minutes: 5, published: true, source_document: sourceName },
    ]);
    setActiveIndex(chapters.length);
  };

  const handleImport = async (file: File | undefined) => {
    if (!file || !courseId) return;
    setImportError(null);
    setImportNote(null);
    if (chapters.length > 0 && !window.confirm(
      'Replace the current chapter list with the imported document? Unsaved edits will be lost, and saved chapters that no longer appear will have their learner progress removed.',
    )) {
      return;
    }
    setImporting(true);
    try {
      const imported = await importCourseDocument(file);
      setChapters(imported.chapters.map((chapter) => ({
        ...chapter,
        published: true,
        source_document: imported.fileName,
      })));
      setSourceName(imported.fileName);
      setActiveIndex(0);
      setImportNote(
        `${imported.chapters.length} chapter${imported.chapters.length === 1 ? '' : 's'} detected from ${imported.fileName} (${imported.wordCount.toLocaleString()} words). Review the text, then save the programme.`,
      );
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'The document could not be read.');
    } finally {
      setImporting(false);
      setFileInputKey((key) => key + 1);
    }
  };

  const handleSave = async () => {
    if (!courseId || !chapters.length) return;
    const saved = await run(() => saveCourseChapters(courseId, chapters), 'Online programme saved.');
    if (saved) await loadCourse(courseId);
  };

  return (
    <section>
      <div className="flex flex-col gap-4 border-b border-charcoal/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-xl font-medium text-charcoal">Online learning</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Import approved PDF or Word material to build a chapter-based programme. Headings become chapters and the
            text beneath each heading becomes that chapter&apos;s reading body. Learners with an approved registration
            read the chapters and mark their own progress.
          </p>
        </div>
        <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
          Course
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className={inputClass}>
            <option value="">Select a course</option>
            {availableCourses.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.title}{entry.online_enabled ? ' · online' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!availableCourses.length && (
        <div className="mt-6 border border-dashed border-charcoal/20 p-7">
          <p className="font-display text-xl font-light text-charcoal">Create a course first.</p>
          <p className="mt-2 text-sm text-muted">Online chapters belong to a course, so add the verified course details before importing material.</p>
          <button type="button" onClick={onOpenCourses} className="btn-primary mt-5">
            <Plus className="h-4 w-4" /> Manage courses
          </button>
        </div>
      )}

      {course && (
        <div className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-4">
            <div className="border border-charcoal/15 bg-white p-5">
              <h3 className="font-display text-lg font-medium text-charcoal">Delivery settings</h3>
              <p className="mt-1 text-xs text-muted">{course.title}</p>
              <label className="mt-4 flex items-start gap-3 text-sm text-charcoal-light">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={course.online_enabled}
                  disabled={saving}
                  onChange={(event) => void run(
                    () => setCourseOnlineSettings(course.id, event.target.checked, event.target.checked ? course.require_online_completion : false),
                    event.target.checked ? 'Online delivery enabled.' : 'Online delivery disabled.',
                  )}
                />
                <span>Online delivery enabled — the programme appears in the catalogue and the learner portal.</span>
              </label>
              <label className="mt-4 flex items-start gap-3 text-sm text-charcoal-light">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={course.require_online_completion}
                  disabled={saving || !course.online_enabled}
                  onChange={(event) => void run(
                    () => setCourseOnlineSettings(course.id, course.online_enabled, event.target.checked),
                    event.target.checked ? 'Chapter completion is now required for a certificate.' : 'Chapter completion is no longer required for a certificate.',
                  )}
                />
                <span>Require every published chapter to be complete before a certificate can be issued.</span>
              </label>
              <p className="mt-4 border-l border-forest-700/30 pl-3 text-[11px] leading-relaxed text-muted">
                {course.published ? 'Course is published.' : 'Course is a draft — learners cannot see it yet.'} Certificates
                still require a completed session, recorded attendance and any configured assessment.
              </p>
            </div>

            <div className="border border-charcoal/15 bg-white p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-medium text-charcoal">
                <FileText className="h-4 w-4 text-forest-700" /> Import from a document
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                PDF or DOCX up to 20 MB. Headings and numbered section titles become chapters; scanned image-only PDFs
                are not readable.
              </p>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-charcoal/25 bg-paper px-4 py-8 text-center transition hover:border-forest-700/50">
                <Upload className="h-5 w-5 text-forest-700" />
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light">
                  {importing ? 'Reading document…' : 'Choose a PDF or DOCX'}
                </span>
                <input
                  key={fileInputKey}
                  type="file"
                  accept={IMPORT_ACCEPT}
                  disabled={importing || saving}
                  className="sr-only"
                  onChange={(event) => void handleImport(event.target.files?.[0])}
                />
              </label>
              {importing && (
                <p role="status" className="mt-3 flex items-center gap-2 text-xs text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Splitting the document into chapters
                </p>
              )}
              {importError && <p role="alert" className="mt-3 text-xs text-red-700">{importError}</p>}
              {importNote && <p role="status" className="mt-3 text-xs leading-relaxed text-forest-800">{importNote}</p>}
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                The original file is not stored by this importer. Upload the source document in the Materials panel if
                learners should be able to download it.
              </p>
            </div>
          </div>

          <div className="xl:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-light">
                Chapters · {chapters.length} · {totalWords.toLocaleString()} words
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={addChapter} className="btn-secondary">
                  <Plus className="h-4 w-4" /> Add chapter
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || !chapters.length}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save programme'}
                </button>
              </div>
            </div>

            {loading ? (
              <p role="status" className="mt-6 flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading chapters
              </p>
            ) : loadError ? (
              <div className="mt-6"><Notice tone="error">{loadError}</Notice></div>
            ) : !chapters.length ? (
              <div className="mt-6 border border-dashed border-charcoal/20 p-8">
                <p className="flex items-center gap-2 font-display text-xl font-light text-charcoal">
                  <BookOpen className="h-5 w-5 text-forest-700" /> No chapters yet
                </p>
                <p className="mt-2 text-sm text-muted">
                  Import the approved course document to generate chapters, or add them manually. Nothing is visible to
                  learners until the course is published and online delivery is enabled.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-12">
                <ol className="divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white lg:col-span-5">
                  {chapters.map((chapter, index) => (
                    <li key={chapter.id ?? `new-${index}`}>
                      <div
                        className={`flex items-start gap-2 p-3 ${index === activeIndex ? 'bg-forest-50' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className="min-w-0 flex-1 text-left"
                          aria-current={index === activeIndex ? 'true' : undefined}
                        >
                          <span className="block text-[10px] uppercase tracking-wider text-muted">Chapter {index + 1}</span>
                          <span className={`mt-1 block text-sm ${index === activeIndex ? 'font-medium text-forest-900' : 'text-charcoal-light'}`}>
                            {chapter.title || 'Untitled chapter'}
                          </span>
                          <span className="mt-1 block text-[11px] text-muted">
                            {chapter.estimated_minutes} min · {chapter.published ? 'Published' : 'Hidden'}
                          </span>
                        </button>
                        <div className="flex shrink-0 flex-col gap-1">
                          <button type="button" aria-label={`Move ${chapter.title} up`} disabled={index === 0} onClick={() => moveChapter(index, -1)} className="rounded p-1 text-charcoal-light disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button type="button" aria-label={`Move ${chapter.title} down`} disabled={index === chapters.length - 1} onClick={() => moveChapter(index, 1)} className="rounded p-1 text-charcoal-light disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                          <button type="button" aria-label={`Remove ${chapter.title}`} onClick={() => removeChapter(index)} className="rounded p-1 text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="lg:col-span-7">
                  {activeChapter ? (
                    <div className="space-y-4 border border-charcoal/15 bg-white p-5">
                      <AdminField label={`Chapter ${activeIndex + 1} title`} htmlFor="online-chapter-title">
                        <input
                          id="online-chapter-title"
                          maxLength={200}
                          value={activeChapter.title}
                          onChange={(event) => updateChapter(activeIndex, { title: event.target.value })}
                          className={inputClass}
                        />
                      </AdminField>
                      <AdminField label="Summary" htmlFor="online-chapter-summary" hint="Shown under the chapter title and in search results.">
                        <textarea
                          id="online-chapter-summary"
                          rows={2}
                          maxLength={600}
                          value={activeChapter.summary}
                          onChange={(event) => updateChapter(activeIndex, { summary: event.target.value })}
                          className={inputClass}
                        />
                      </AdminField>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <AdminField label="Reading time (minutes)" htmlFor="online-chapter-minutes">
                          <input
                            id="online-chapter-minutes"
                            type="number"
                            min={1}
                            max={600}
                            value={activeChapter.estimated_minutes}
                            onChange={(event) => updateChapter(activeIndex, { estimated_minutes: Number(event.target.value) })}
                            className={inputClass}
                          />
                        </AdminField>
                        <label className="mt-7 flex items-center gap-3 text-sm text-charcoal-light">
                          <input
                            type="checkbox"
                            checked={activeChapter.published}
                            onChange={(event) => updateChapter(activeIndex, { published: event.target.checked })}
                          />
                          Visible to learners
                        </label>
                      </div>
                      <AdminField
                        label="Reading text"
                        htmlFor="online-chapter-body"
                        hint={`${activeChapter.body.length.toLocaleString()} of 60,000 characters. Leave a blank line between paragraphs; lines starting with “-” become bullet points.`}
                      >
                        <textarea
                          id="online-chapter-body"
                          rows={16}
                          maxLength={60000}
                          value={activeChapter.body}
                          onChange={(event) => updateChapter(activeIndex, { body: event.target.value })}
                          className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                        />
                      </AdminField>
                      {activeChapter.source_document && (
                        <p className="text-[11px] text-muted">Imported from {activeChapter.source_document}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Select a chapter to edit it.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 border-t border-charcoal/15 pt-6">
        <h3 className="font-display text-lg font-medium text-charcoal">Learner progress by programme</h3>
        <p className="mt-1 text-sm text-muted">Live figures from chapter progress records; no manual entry is involved.</p>
        {reportError && <div className="mt-4"><Notice tone="error">{reportError}</Notice></div>}
        <div className="mt-4 overflow-x-auto border-y border-charcoal/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Chapters</th>
                <th className="px-4 py-3">Learners active</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {report.map((row) => (
                <tr key={row.course_id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal">{row.course_title}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {row.online_enabled ? 'Online delivery on' : 'Online delivery off'} · {row.published ? 'Published' : 'Draft'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-charcoal-light">{row.chapter_count}</td>
                  <td className="px-4 py-3 text-charcoal-light">{row.learner_count}</td>
                  <td className="px-4 py-3 text-charcoal-light">{row.completed_count}</td>
                  <td className="px-4 py-3 text-charcoal-light">{row.last_activity_at ? dateLabel(row.last_activity_at) : '—'}</td>
                </tr>
              ))}
              {!report.length && (
                <tr><td className="px-4 py-6 text-muted" colSpan={5}>No online programmes have been created.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
