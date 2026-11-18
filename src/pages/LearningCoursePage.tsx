import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { SEO } from '@/components/SEO';
import { Reveal } from '@/components/Reveal';
import { Notice } from '@/components/admin/AdminUI';
import { bodyBlocks } from '@/lib/learningImport';
import {
  fetchLearningCourse,
  markChapterComplete,
  type LearningChapter,
  type LearningCourse,
} from '@/lib/learning';
import { getLearnerSession, subscribeToLearnerSession } from '@/lib/training';

function formatDay(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function LearningCoursePage({ courseId }: { courseId: string }) {
  const { query } = useRouter();
  const [session, setSession] = useState<Awaited<ReturnType<typeof getLearnerSession>>>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [payload, setPayload] = useState<LearningCourse | null>(null);
  const [activeId, setActiveId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getLearnerSession().then((current) => {
      if (!active) return;
      setSession(current);
      setCheckingSession(false);
    });
    const unsubscribe = subscribeToLearnerSession((current) => {
      if (!active) return;
      setSession(current);
      setCheckingSession(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (checkingSession) return;
    if (!session?.user.id) {
      setLoading(false);
      setPayload(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    fetchLearningCourse(courseId).then((result) => {
      if (!active) return;
      setPayload(result.data);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [courseId, session, checkingSession]);

  const chapters = useMemo(() => payload?.chapters ?? [], [payload]);
  const requestedChapterId = query.get('chapter');

  useEffect(() => {
    if (!chapters.length) return;
    const fromQuery = requestedChapterId
      ? chapters.find((chapter) => chapter.id === requestedChapterId)
      : undefined;
    const firstOpen = chapters.find((chapter) => !chapter.completed_at);
    setActiveId((current) => {
      if (current && chapters.some((chapter) => chapter.id === current)) return current;
      return fromQuery?.id ?? firstOpen?.id ?? chapters[0].id;
    });
  }, [chapters, requestedChapterId]);

  const activeIndex = useMemo(
    () => Math.max(0, chapters.findIndex((chapter) => chapter.id === activeId)),
    [chapters, activeId],
  );
  const activeChapter = chapters[activeIndex];
  const totalMinutes = chapters.reduce((total, chapter) => total + chapter.estimated_minutes, 0);

  const openChapter = (chapter: LearningChapter) => {
    setActiveId(chapter.id);
    setNotice(null);
    const url = `/learner/courses/${courseId}?chapter=${chapter.id}`;
    window.history.replaceState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setCompleted = async (chapter: LearningChapter, completed: boolean, advance: boolean) => {
    if (!payload) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await markChapterComplete(chapter.id, completed);
    setSaving(false);
    if (result.error || !result.data) {
      setError(result.error ?? 'Your progress could not be saved.');
      return;
    }
    const updated: LearningCourse = {
      ...payload,
      completed_count: result.data.completed_count,
      chapter_count: result.data.chapter_count,
      course_completed_at: result.data.course_completed_at,
      chapters: payload.chapters.map((entry) =>
        entry.id === chapter.id ? { ...entry, completed_at: completed ? new Date().toISOString() : null } : entry,
      ),
    };
    setPayload(updated);
    setNotice(completed ? `Chapter ${chapter.position} marked complete.` : `Chapter ${chapter.position} reopened.`);

    if (advance) {
      const next = updated.chapters[activeIndex + 1];
      if (next) openChapter(next);
      else if (result.data.course_completed_at) {
        setNotice('Programme complete. Every chapter is marked complete.');
      }
    }
  };

  const progressPercent = payload && payload.chapter_count > 0
    ? Math.round((payload.completed_count / payload.chapter_count) * 100)
    : 0;

  if (checkingSession) {
    return (
      <p role="status" className="shell flex items-center gap-3 py-40 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Preparing your learning space
      </p>
    );
  }

  if (!session?.user.id) {
    return (
      <LearningShell title="Online learning">
        <div className="mx-auto max-w-xl border border-charcoal/15 bg-white p-8 text-center">
          <Lock className="mx-auto h-6 w-6 text-forest-700" />
          <h2 className="mt-4 font-display text-3xl font-light text-charcoal">Sign in to start this programme.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Online chapters are available to learners with an approved registration. Sign in with the email address
            used for your training registration.
          </p>
          <Link to="/learner" className="btn-primary mt-6">
            Go to the learner portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </LearningShell>
    );
  }

  if (loading) {
    return (
      <p role="status" className="shell flex items-center gap-3 py-40 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading the programme
      </p>
    );
  }

  if (!payload) {
    return (
      <LearningShell title="Online learning">
        <div className="mx-auto max-w-2xl">
          <Notice tone="error">{error ?? 'This programme is not available.'}</Notice>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Online learning unlocks once EcoHealth approves your registration for this course. Pending, cancelled and
            rejected registrations do not grant access.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/learner" className="btn-primary">
              Learner portal
            </Link>
            <Link to="/training" className="btn-secondary">
              Browse training
            </Link>
          </div>
        </div>
      </LearningShell>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <SEO
        title={`${payload.course.title} · Online programme | EcoHealth`}
        description={`Work through the online chapters for ${payload.course.title}.`}
        path={`/learner/courses/${courseId}`}
        noIndex
      />

      <header className="border-b border-white/10 bg-forest-950 pb-10 pt-32 text-ivory lg:pb-12 lg:pt-40">
        <div className="shell">
          <Link to="/learner" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/70 transition hover:text-ivory">
            <ArrowLeft className="h-3.5 w-3.5" />
            Learner portal
          </Link>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage-light">Online programme</p>
              <h1 className="mt-3 font-display text-[clamp(1.9rem,3.4vw,3rem)] font-medium leading-[1.08] tracking-[-0.03em]">
                {payload.course.title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/70">
                {payload.chapter_count} chapter{payload.chapter_count === 1 ? '' : 's'} · about {totalMinutes} minutes of
                reading · progress is saved to your account
              </p>
            </div>
            <div className="w-full max-w-sm">
              <div className="flex items-end justify-between text-[11px] uppercase tracking-[0.16em] text-ivory/60">
                <span>Progress</span>
                <span className="font-display text-2xl font-light tracking-normal text-ivory">{progressPercent}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-sage-light transition-[width] duration-700 ease-editorial"
                  style={{ width: `${progressPercent}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Programme progress"
                />
              </div>
              <p className="mt-3 text-xs text-ivory/55">
                {payload.completed_count} of {payload.chapter_count} chapters complete
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="shell py-10 lg:py-16">
        {error && <div className="mb-8"><Notice tone="error">{error}</Notice></div>}
        {notice && <div className="mb-8"><Notice tone="success">{notice}</Notice></div>}

        {payload.course_completed_at && (
          <div className="mb-8 flex flex-col gap-3 border border-forest-700/25 bg-forest-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-display text-lg text-forest-800">
                <CheckCircle2 className="h-5 w-5" /> Programme complete
              </p>
              <p className="mt-1 text-sm text-forest-800/80">
                Completed {formatDay(payload.course_completed_at)}. Your certificate is issued by EcoHealth staff once
                all configured completion requirements are met.
              </p>
            </div>
            <Link to="/learner" className="btn-secondary shrink-0">
              View records
            </Link>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal-light">Chapters</p>

              <label className="mt-3 block text-xs text-muted lg:hidden">
                <span className="sr-only">Jump to chapter</span>
                <select
                  value={activeId}
                  onChange={(event) => {
                    const chapter = chapters.find((entry) => entry.id === event.target.value);
                    if (chapter) openChapter(chapter);
                  }}
                  className="mt-1 w-full border border-charcoal/20 bg-white px-3 py-3 text-sm text-charcoal focus:border-forest-600 focus:outline-none"
                >
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.position}. {chapter.title}
                      {chapter.completed_at ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <ol className="mt-4 hidden border-y border-charcoal/10 lg:block">
                {chapters.map((chapter) => {
                  const active = chapter.id === activeId;
                  return (
                    <li key={chapter.id}>
                      <button
                        type="button"
                        onClick={() => openChapter(chapter)}
                        aria-current={active ? 'step' : undefined}
                        className={`flex w-full items-start gap-3 border-b border-charcoal/10 px-3 py-4 text-left transition-colors duration-300 ${
                          active ? 'bg-forest-50' : 'hover:bg-charcoal/[0.03]'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                            chapter.completed_at
                              ? 'border-forest-700 bg-forest-700 text-white'
                              : active
                                ? 'border-forest-700 text-forest-800'
                                : 'border-charcoal/20 text-muted'
                          }`}
                        >
                          {chapter.completed_at ? <Check className="h-3 w-3" /> : chapter.position}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm leading-snug ${active ? 'font-medium text-forest-900' : 'text-charcoal-light'}`}>
                            {chapter.title}
                          </span>
                          <span className="mt-1 block text-[11px] text-muted">{chapter.estimated_minutes} min</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <p className="mt-5 text-[11px] leading-relaxed text-muted">
                Chapters are built from EcoHealth&apos;s approved course material. Contact the training team if a
                section will not open.
              </p>
            </div>
          </aside>

          <main className="lg:col-span-8 xl:col-span-9">
            {activeChapter ? (
              <Reveal key={activeChapter.id}>
                <article className="border border-charcoal/10 bg-white p-6 sm:p-10 lg:p-12">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal/10 pb-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                      Chapter {activeChapter.position} of {payload.chapter_count}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted">
                      <Clock3 className="h-3.5 w-3.5" />
                      {activeChapter.estimated_minutes} minute read
                    </p>
                  </div>

                  <h2 className="mt-7 max-w-3xl font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-light leading-tight text-charcoal">
                    {activeChapter.title}
                  </h2>
                  {activeChapter.summary && (
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{activeChapter.summary}</p>
                  )}

                  <div className="mt-9 max-w-3xl space-y-6 text-[15px] leading-[1.85] text-charcoal-light">
                    {bodyBlocks(activeChapter.body).map((block, index) =>
                      block.type === 'list' ? (
                        <ul key={index} className="space-y-3">
                          {block.lines.map((line, lineIndex) => (
                            <li key={lineIndex} className="flex gap-3">
                              <span className="mt-2.5 h-px w-4 shrink-0 bg-forest-600" aria-hidden="true" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p key={index} className="whitespace-pre-line">
                          {block.lines.join('\n')}
                        </p>
                      ),
                    )}
                  </div>

                  <div className="mt-12 flex flex-col gap-4 border-t border-charcoal/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      {activeChapter.completed_at ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-forest-700" />
                          Completed {formatDay(activeChapter.completed_at)}
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-sage-dark" aria-hidden="true" />
                          Not yet marked complete
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {activeIndex > 0 && (
                        <button type="button" onClick={() => openChapter(chapters[activeIndex - 1])} className="btn-secondary">
                          <ArrowLeft className="h-4 w-4" /> Previous
                        </button>
                      )}
                      {activeChapter.completed_at ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void setCompleted(activeChapter, false, false)}
                          className="btn-secondary disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" /> Reopen chapter
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void setCompleted(activeChapter, true, true)}
                          className="btn-primary disabled:opacity-60"
                        >
                          {saving ? 'Saving…' : activeIndex === chapters.length - 1 ? 'Mark complete & finish' : 'Mark complete & continue'}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                      {activeChapter.completed_at && activeIndex < chapters.length - 1 && (
                        <button
                          type="button"
                          onClick={() => openChapter(chapters[activeIndex + 1])}
                          className="btn-primary"
                        >
                          Next chapter
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>

                <p className="mt-6 text-[11px] leading-relaxed text-muted">
                  Progress is recorded against your learner account. Completing every chapter does not replace
                  attendance or assessment requirements configured for this course.
                </p>
              </Reveal>
            ) : (
              <div className="border border-dashed border-charcoal/20 p-10 text-center">
                <p className="font-display text-xl font-light text-charcoal">This programme has no published chapters yet.</p>
                <p className="mt-2 text-sm text-muted">The training team is preparing the material. Check back shortly.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function LearningShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <SEO title={`${title} | EcoHealth`} description="EcoHealth online training." path="/learner" noIndex />
      <div className="bg-forest-950 pb-10 pt-32 text-ivory lg:pb-12 lg:pt-40">
        <div className="shell">
          <Link
            to="/learner"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/70 transition hover:text-ivory"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Learner portal
          </Link>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-sage-light">Online learning</p>
          <h1 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-light leading-tight tracking-[-0.02em]">
            {title}
          </h1>
        </div>
      </div>
      <section className="shell pb-24 pt-12">{children}</section>
    </div>
  );
}
