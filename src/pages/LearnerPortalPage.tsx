import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Download, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { SEO } from '@/components/SEO';
import { Notice } from '@/components/admin/AdminUI';
import {
  createTrainingMaterialUrl,
  fetchLearnerTrainingData,
  formatTrainingMoney,
  fetchPublicTrainingSession,
  getLearnerSession,
  linkTrainingParticipant,
  registerForTraining,
  saveTrainingProfile,
  signInLearner,
  signOutLearner,
  signUpLearner,
  subscribeToLearnerSession,
  type LearnerTrainingData,
  type TrainingSession,
} from '@/lib/training';
import { getMyLearningCourses, type MyLearningCourse } from '@/lib/learning';

type AuthMode = 'sign-in' | 'sign-up';
type RosterEntry = { full_name: string; email: string };

function emptyDashboard(): LearnerTrainingData {
  return { profile: null, registrations: [], payments: [], participants: [], linkedParticipants: [], attendance: [], results: [], materials: [], certificates: [] };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LearnerPortalPage() {
  const { query } = useRouter();
  const [session, setSession] = useState<Awaited<ReturnType<typeof getLearnerSession>>>(null);
  const [dashboard, setDashboard] = useState<LearnerTrainingData>(emptyDashboard());
  const [learningCourses, setLearningCourses] = useState<MyLearningCourse[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [registrationType, setRegistrationType] = useState<'individual' | 'group'>('individual');
  const [roster, setRoster] = useState<RosterEntry[]>([{ full_name: '', email: '' }]);
  const [registrationPhone, setRegistrationPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestedSessionId = query.get('session');

  useEffect(() => {
    let active = true;
    getLearnerSession().then((current) => {
      if (active) setSession(current);
    });
    const unsubscribe = subscribeToLearnerSession((current) => {
      if (active) setSession(current);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!requestedSessionId) {
      setSelectedSession(null);
      setSelectedCourseTitle('');
      return () => {
        active = false;
      };
    }
    fetchPublicTrainingSession(requestedSessionId).then((result) => {
      if (!active) return;
      setSelectedSession(result.data.session);
      setSelectedCourseTitle(result.data.course?.title ?? '');
      if (result.error) setError(result.error);
    });
    return () => {
      active = false;
    };
  }, [requestedSessionId]);

  useEffect(() => {
    if (!session?.user.id) {
      setDashboard(emptyDashboard());
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchLearnerTrainingData(session.user.id).then((result) => {
      if (!active) return;
      setDashboard(result.data);
      setError(result.error);
      setFullName(result.data.profile?.full_name ?? String(session.user.user_metadata.full_name ?? ''));
      setPhone(result.data.profile?.phone ?? '');
      setOrganisation(result.data.profile?.organisation ?? '');
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshKey, session]);

  useEffect(() => {
    if (!session?.user.id) {
      setLearningCourses([]);
      return;
    }
    let active = true;
    getMyLearningCourses().then((result) => {
      if (active) setLearningCourses(result.data);
    });
    return () => {
      active = false;
    };
  }, [session, refreshKey]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    const authError =
      authMode === 'sign-up'
        ? await signUpLearner(email, password, fullName)
        : await signInLearner(email, password);
    setSaving(false);
    if (authError) {
      setError(authError);
      return;
    }
    if (authMode === 'sign-up') {
      setNotice('Account created. Check your email to confirm your address, then sign in to continue.');
      setAuthMode('sign-in');
    }
  };

  const handleProfileSave = async () => {
    if (!session?.user.id) return;
    setSaving(true);
    setError(null);
    const result = await saveTrainingProfile({
      user_id: session.user.id,
      full_name: fullName,
      phone,
      organisation,
    });
    setSaving(false);
    if (result) setError(result);
    else setNotice('Profile details saved.');
  };

  const handleRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user.id || !selectedSession) return;
    setError(null);
    setNotice(null);
    if (!consent) {
      setError('Please confirm the privacy notice before submitting.');
      return;
    }
    const participants = registrationType === 'individual'
      ? [{ full_name: fullName.trim(), email: session.user.email ?? '' }]
      : roster.map((participant) => ({
          full_name: participant.full_name.trim(),
          email: participant.email.trim().toLowerCase(),
        }));
    if (!fullName.trim() || participants.some((participant) => !participant.full_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email))) {
      setError('Enter your name and valid contact emails for all participants.');
      return;
    }
    if (registrationType === 'group' && !organisation.trim()) {
      setError('Enter the organisation name for a group registration.');
      return;
    }

    setSaving(true);
    const profileError = await saveTrainingProfile({
      user_id: session.user.id,
      full_name: fullName,
      phone,
      organisation,
    });
    if (profileError) {
      setSaving(false);
      setError(profileError);
      return;
    }
    const result = await registerForTraining({
      sessionId: selectedSession.id,
      type: registrationType,
      organisation,
      participants,
      phone: registrationPhone || phone,
      additionalRequirements: requirements,
      consent,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNotice('Registration request received. It is pending staff approval; you can track its status in this portal.');
    setRefreshKey((key) => key + 1);
  };

  const handleLinkParticipant = async () => {
    setError(null);
    const result = await linkTrainingParticipant();
    if (result) setError(result);
    else {
      setNotice('Participant record linked to your verified account.');
      setRefreshKey((key) => key + 1);
    }
  };

  const handleMaterial = async (path: string) => {
    setError(null);
    const result = await createTrainingMaterialUrl(path);
    if (result.error || !result.data) {
      setError(result.error ?? 'This material is not available.');
      return;
    }
    window.open(result.data, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SEO
        title="Learner Portal | EcoHealth & Transport Solutions Ltd"
        description="Securely manage EcoHealth training registrations, schedules, learning materials, results, and issued certificates."
        path="/learner"
        noIndex
      />
      <section className="bg-ivory pb-20 pt-36 lg:pb-28 lg:pt-44">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 border-b border-charcoal/15 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Training portal</p>
              <h1 className="mt-4 font-display text-display-lg text-charcoal">Your learning, in one place.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
                Sign in to manage registrations and access training records. New registrations remain pending until
                reviewed by EcoHealth staff.
              </p>
            </div>
            {session && (
              <button
                type="button"
                onClick={() => void signOutLearner()}
                className="btn-secondary self-start"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            )}
          </div>

          {error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}
          {notice && <div className="mt-6"><Notice tone="success">{notice}</Notice></div>}

          {!session ? (
            <div className="mt-10 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <div className="max-w-xl border border-charcoal/15 bg-paper p-6 sm:p-9">
                  <div className="flex gap-6 border-b border-charcoal/15 pb-4">
                    {(['sign-in', 'sign-up'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        aria-pressed={authMode === mode}
                        onClick={() => {
                          setAuthMode(mode);
                          setError(null);
                        }}
                        className={`border-b-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          authMode === mode ? 'border-forest-700 text-forest-800' : 'border-transparent text-muted'
                        }`}
                      >
                        {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleAuth} className="mt-7 space-y-5">
                    {authMode === 'sign-up' && (
                      <label className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
                        Full name
                        <input
                          required
                          maxLength={120}
                          autoComplete="name"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          className="mt-2 w-full border border-charcoal/20 bg-white px-3 py-3 text-sm text-charcoal focus:border-forest-600 focus:outline-none"
                        />
                      </label>
                    )}
                    <label className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
                      Email
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-2 w-full border border-charcoal/20 bg-white px-3 py-3 text-sm text-charcoal focus:border-forest-600 focus:outline-none"
                      />
                    </label>
                    <label className="block text-xs font-medium uppercase tracking-widest text-charcoal-light">
                      Password
                      <input
                        required
                        type="password"
                        autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
                        minLength={10}
                        maxLength={200}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="mt-2 w-full border border-charcoal/20 bg-white px-3 py-3 text-sm text-charcoal focus:border-forest-600 focus:outline-none"
                      />
                      {authMode === 'sign-up' && <span className="mt-1 block text-xs text-muted">Use at least 10 characters.</span>}
                    </label>
                    <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                      {saving ? 'Please wait…' : authMode === 'sign-up' ? 'Create learner account' : 'Sign in'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <Reveal>
                  <div className="border-l border-forest-700/40 pl-6">
                    <ShieldCheck className="h-6 w-6 text-forest-700" />
                    <h2 className="mt-4 font-display text-2xl font-light text-charcoal">Private training records</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      Your registrations, assessment results and certificates are available only to your verified
                      account and authorized EcoHealth administrators.
                    </p>
                    {requestedSessionId && (
                      <p className="mt-5 text-sm text-charcoal-light">
                        Sign in or create an account to continue with the selected session registration.
                      </p>
                    )}
                  </div>
                </Reveal>
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="border border-charcoal/15 bg-paper p-6 sm:p-8">
                    <SectionTitle title="Learner profile" />
                    <label className="mt-5 block text-xs font-medium uppercase tracking-widest text-charcoal-light">
                      Full name
                      <input value={fullName} maxLength={120} onChange={(event) => setFullName(event.target.value)} className={inputClass} />
                    </label>
                    <label className="mt-5 block text-xs font-medium uppercase tracking-widest text-charcoal-light">
                      Email
                      <input readOnly value={session.user.email ?? ''} className={`${inputClass} bg-charcoal/5`} />
                    </label>
                    <label className="mt-5 block text-xs font-medium uppercase tracking-widest text-charcoal-light">
                      Telephone
                      <input value={phone} maxLength={30} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
                    </label>
                    <label className="mt-5 block text-xs font-medium uppercase tracking-widest text-charcoal-light">
                      Organisation
                      <input value={organisation} maxLength={160} onChange={(event) => setOrganisation(event.target.value)} className={inputClass} />
                    </label>
                    <button type="button" onClick={handleProfileSave} disabled={saving} className="btn-primary mt-6 disabled:opacity-60">
                      Save profile
                    </button>
                    <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="btn-secondary mt-3 w-full">
                      <RefreshCw className="h-4 w-4" />
                      Refresh records
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  {selectedSession && (
                    <RegistrationForm
                      courseTitle={selectedCourseTitle}
                      session={selectedSession}
                      fullName={fullName}
                      email={session.user.email ?? ''}
                      organisation={organisation}
                      phone={phone}
                      registrationPhone={registrationPhone}
                      registrationType={registrationType}
                      roster={roster}
                      requirements={requirements}
                      consent={consent}
                      saving={saving}
                      onTypeChange={setRegistrationType}
                      onRosterChange={setRoster}
                      onPhoneChange={setRegistrationPhone}
                      onRequirementsChange={setRequirements}
                      onConsentChange={setConsent}
                      onSubmit={handleRegistration}
                    />
                  )}

                  <div className="border-b border-charcoal/15 pb-5">
                    <SectionTitle title="My training" />
                    <p className="mt-2 text-sm text-muted">
                      {session.user.email}
                    </p>
                  </div>
                  {loading ? (
                    <p role="status" className="mt-8 text-sm text-muted">Loading your training records…</p>
                  ) : dashboard.registrations.length === 0 && dashboard.linkedParticipants.length === 0 ? (
                    <div className="mt-6 border border-dashed border-charcoal/20 p-7">
                      <p className="font-display text-xl font-light text-charcoal">No registrations yet.</p>
                      <p className="mt-2 text-sm text-muted">Browse published courses and sessions to register.</p>
                      <Link to="/training" className="mt-4 inline-flex items-center gap-2 text-sm text-forest-700 link-underline">
                        Browse training
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-5">
                      {dashboard.registrations.map((registration) => (
                        <RegistrationSummary
                          key={registration.id}
                          registration={registration}
                          payments={dashboard.payments}
                          attendance={dashboard.attendance}
                          results={dashboard.results}
                          certificates={dashboard.certificates}
                        />
                      ))}
                      {dashboard.linkedParticipants.length > 0 && (
                        <div className="border border-charcoal/15 bg-white p-6">
                          <h3 className="font-display text-lg font-medium text-charcoal">Linked group registrations</h3>
                          <ul className="mt-4 space-y-3">
                            {dashboard.linkedParticipants.map((participant) => {
                              const certificate = dashboard.certificates.find((entry) => entry.participant_id === participant.participant_id);
                              const participantResults = dashboard.results.filter((entry) => entry.participant_id === participant.participant_id);
                              return (
                                <li key={participant.participant_id} className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-3 text-sm">
                                  <span className="min-w-[220px]">
                                    <span className="block font-medium text-charcoal">{participant.course_title}</span>
                                    <span className="mt-1 block text-xs text-muted">
                                      {formatDate(participant.session_starts_at)} · {participant.session_location || 'Location to be confirmed'}
                                    </span>
                                    <span className="mt-1 block text-xs capitalize text-muted">
                                      {participant.registration_status.replace('_', ' ')} · {participant.attendance_status ? `Attendance: ${participant.attendance_status}` : 'Attendance not recorded'}
                                      {participantResults.length > 0 && ` · Assessment: ${participantResults.map((item) => `${item.score}% (${item.passed ? 'passed' : 'not passed'})`).join(', ')}`}
                                    </span>
                                  </span>
                                  <span className="text-xs text-muted">{participant.participant_name}</span>
                                  {certificate && (
                                    <Link to={`/certificates/verify/${certificate.verification_code}`} className="text-forest-700 link-underline">
                                      Certificate {certificate.certificate_number}
                                    </Link>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                          <button type="button" onClick={handleLinkParticipant} className="btn-secondary mt-5">
                            Link a participant record
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {learningCourses.length > 0 && (
                    <section className="mt-10">
                      <SectionTitle title="Online programmes" />
                      <p className="mt-2 text-sm text-muted">
                        Chapter-based courses you can work through at your own pace. Progress is saved to your account.
                      </p>
                      <ul className="mt-4 space-y-3">
                        {learningCourses.map((learningCourse) => {
                          const percent = learningCourse.chapter_count
                            ? Math.round((learningCourse.completed_count / learningCourse.chapter_count) * 100)
                            : 0;
                          return (
                            <li key={learningCourse.course_id} className="border border-charcoal/15 bg-white p-5">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="flex items-center gap-2 font-display text-lg font-medium text-charcoal">
                                    <BookOpen className="h-4 w-4 shrink-0 text-forest-700" />
                                    {learningCourse.title}
                                  </p>
                                  <p className="mt-1 text-xs text-muted">
                                    {learningCourse.completed_count} of {learningCourse.chapter_count} chapters complete
                                    {learningCourse.course_completed_at ? ' · Programme complete' : ' · In progress'}
                                  </p>
                                </div>
                                <Link to={`/learner/courses/${learningCourse.course_id}`} className="btn-secondary shrink-0">
                                  {learningCourse.course_completed_at ? 'Review programme' : 'Continue learning'}
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </div>
                              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-charcoal/10">
                                <div className="h-full rounded-full bg-forest-700 transition-[width] duration-700" style={{ width: `${percent}%` }} />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}

                  {dashboard.materials.length > 0 && (
                    <section className="mt-10">
                      <SectionTitle title="Course materials" />
                      <ul className="mt-4 divide-y divide-charcoal/10 border-y border-charcoal/10 bg-white">
                        {dashboard.materials.map((material) => (
                          <li key={material.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                            <div>
                              <p className="font-medium text-charcoal">{material.title}</p>
                              <p className="mt-1 text-xs text-muted">{material.description}</p>
                            </div>
                            <button type="button" onClick={() => void handleMaterial(material.storage_path)} className="btn-secondary">
                              <Download className="h-4 w-4" />
                              Open material
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const inputClass =
  'mt-2 w-full border border-charcoal/20 bg-white px-3 py-2.5 text-sm text-charcoal focus:border-forest-600 focus:outline-none';

function SectionTitle({ title }: { title: string }) {
  return <h2 className="font-display text-xl font-medium text-charcoal">{title}</h2>;
}

function RegistrationForm({
  courseTitle,
  session,
  fullName,
  email,
  organisation,
  phone,
  registrationPhone,
  registrationType,
  roster,
  requirements,
  consent,
  saving,
  onTypeChange,
  onRosterChange,
  onPhoneChange,
  onRequirementsChange,
  onConsentChange,
  onSubmit,
}: {
  courseTitle: string;
  session: TrainingSession;
  fullName: string;
  email: string;
  organisation: string;
  phone: string;
  registrationPhone: string;
  registrationType: 'individual' | 'group';
  roster: RosterEntry[];
  requirements: string;
  consent: boolean;
  saving: boolean;
  onTypeChange: (value: 'individual' | 'group') => void;
  onRosterChange: (value: RosterEntry[]) => void;
  onPhoneChange: (value: string) => void;
  onRequirementsChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Reveal>
      <form onSubmit={onSubmit} className="mb-10 border border-forest-700/30 bg-sage-light p-6 sm:p-8">
        <p className="eyebrow">Registration request</p>
        <h2 className="mt-3 font-display text-2xl font-light text-charcoal">{courseTitle}</h2>
        <p className="mt-2 text-sm text-muted">{formatDate(session.starts_at)} · {session.location || session.delivery_format}</p>
        <p className="mt-1 text-xs text-muted">
          {session.capacity ? `${session.capacity} total places` : 'Capacity confirmed by the training team'}
          {' · '}Requests require staff approval
        </p>

        <fieldset className="mt-6">
          <legend className="text-xs font-semibold uppercase tracking-widest text-charcoal-light">Registration type</legend>
          <div className="mt-3 flex flex-wrap gap-5">
            {(['individual', 'group'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-charcoal-light">
                <input type="radio" checked={registrationType === type} onChange={() => onTypeChange(type)} />
                {type === 'individual' ? 'Individual' : 'Corporate / group'}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
            Contact name
            <input required value={fullName} readOnly className={inputClass} />
          </label>
          <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
            Contact telephone
            <input value={registrationPhone || phone} maxLength={30} onChange={(event) => onPhoneChange(event.target.value)} className={inputClass} />
          </label>
          {registrationType === 'group' && (
            <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light sm:col-span-2">
              Organisation
              <input required value={organisation} readOnly className={inputClass} />
              <span className="mt-1 block text-xs font-normal normal-case text-muted">Update this in your learner profile before submitting.</span>
            </label>
          )}
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-charcoal-light">
              Participants ({registrationType === 'individual' ? 1 : roster.length})
            </h3>
            {registrationType === 'group' && roster.length < 100 && (
              <button type="button" onClick={() => onRosterChange([...roster, { full_name: '', email: '' }])} className="text-xs font-semibold uppercase tracking-wider text-forest-700 link-underline">
                Add participant
              </button>
            )}
          </div>
          <div className="mt-3 space-y-3">
            {(registrationType === 'individual' ? [roster[0]] : roster).map((participant, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                  Participant name
                  <input
                    required
                    readOnly={registrationType === 'individual'}
                    maxLength={120}
                    value={registrationType === 'individual' ? fullName : participant.full_name}
                    onChange={(event) => {
                      const next = [...roster];
                      next[index] = { ...next[index], full_name: event.target.value };
                      onRosterChange(next);
                    }}
                    className={inputClass}
                  />
                </label>
                <label className="text-xs font-medium uppercase tracking-widest text-charcoal-light">
                  Participant email
                  <input
                    required
                    type="email"
                    maxLength={254}
                    readOnly={registrationType === 'individual'}
                    value={registrationType === 'individual' ? email : participant.email}
                    onChange={(event) => {
                      const next = [...roster];
                      next[index] = { ...next[index], email: event.target.value };
                      onRosterChange(next);
                    }}
                    className={`${inputClass} ${registrationType === 'individual' ? 'bg-charcoal/5' : ''}`}
                  />
                </label>
                {registrationType === 'group' && roster.length > 1 && (
                  <button type="button" onClick={() => onRosterChange(roster.filter((_, rosterIndex) => rosterIndex !== index))} className="text-left text-xs text-red-700 link-underline sm:col-span-2">
                    Remove participant
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <label className="mt-6 block text-xs font-medium uppercase tracking-widest text-charcoal-light">
          Additional requirements
          <textarea
            rows={3}
            maxLength={2000}
            value={requirements}
            onChange={(event) => onRequirementsChange(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-charcoal-light">
          <input type="checkbox" checked={consent} onChange={(event) => onConsentChange(event.target.checked)} className="mt-1" />
          <span>
            I agree that EcoHealth may process the registration details to respond and administer this request. For group
            registrations, I confirm I am authorized to submit participant details. See the{' '}
            <Link to="/privacy" className="text-forest-700 link-underline">Privacy Policy</Link>.
          </span>
        </label>

        <button type="submit" disabled={saving} className="btn-primary mt-6 disabled:opacity-60">
          {saving ? 'Submitting…' : 'Submit registration request'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </Reveal>
  );
}

function RegistrationSummary({
  registration,
  payments,
  attendance,
  results,
  certificates,
}: {
  registration: LearnerTrainingData['registrations'][number];
  payments: LearnerTrainingData['payments'];
  attendance: LearnerTrainingData['attendance'];
  results: LearnerTrainingData['results'];
  certificates: LearnerTrainingData['certificates'];
}) {
  const course = registration.training_sessions?.training_courses;
  const participants = registration.training_participants ?? [];
  const payment = payments.find((entry) => entry.registration_id === registration.id);
  return (
    <article className="border border-charcoal/15 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-forest-700">
            {registration.registration_type === 'group' ? registration.organisation : 'Individual registration'}
          </p>
          <h3 className="mt-2 font-display text-xl font-medium text-charcoal">
            {course?.title ?? 'Training session'}
          </h3>
          {registration.training_sessions?.starts_at && (
            <p className="mt-2 text-sm text-muted">{formatDate(registration.training_sessions.starts_at)}</p>
          )}
        </div>
        <span className="border border-forest-700/20 bg-forest-50 px-3 py-1 text-xs font-medium capitalize text-forest-800">
          {registration.status.replace('_', ' ')}
        </span>
      </div>
      {payment && (
        <div className="mt-4 border-t border-charcoal/10 pt-4 text-sm">
          <p className="font-medium capitalize text-charcoal">Payment: {payment.status.replace('_', ' ')}</p>
          <p className="mt-1 text-muted">
            Amount due: {formatTrainingMoney(payment.amount_due_minor, payment.currency)} · Received: {formatTrainingMoney(payment.amount_paid_minor, payment.currency)}
          </p>
        </div>
      )}
      {registration.review_note && (
        <p className="mt-4 border-l border-forest-700/30 pl-4 text-sm text-muted">{registration.review_note}</p>
      )}
      {participants.length > 0 && (
        <ul className="mt-5 border-t border-charcoal/10 pt-4">
          {participants.map((participant) => {
            const mark = attendance.find((entry) => entry.participant_id === participant.id);
            const participantResults = results.filter((entry) => entry.participant_id === participant.id);
            const certificate = certificates.find((entry) => entry.participant_id === participant.id);
            return (
              <li key={participant.id} className="grid gap-2 border-b border-charcoal/10 py-3 text-sm sm:grid-cols-3">
                <span className="font-medium text-charcoal">{participant.full_name}</span>
                <span className="text-muted">
                  {mark ? `Attendance: ${mark.status}` : 'Attendance not recorded'}
                  {participantResults.length > 0 && ` · Assessment: ${participantResults.map((item) => `${item.score}% (${item.passed ? 'passed' : 'not passed'})`).join(', ')}`}
                </span>
                {certificate ? (
                  <Link to={`/certificates/verify/${certificate.verification_code}`} className="text-forest-700 link-underline">
                    Certificate {certificate.certificate_number}
                  </Link>
                ) : (
                  <span className="text-muted">No certificate issued</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
