import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react';
import { Link } from '@/lib/router';
import { PageHero } from '@/components/PageHero';
import { Reveal } from '@/components/Reveal';
import { SEO } from '@/components/SEO';
import { SectionMarker } from '@/components/motion';
import {
  fetchPublicTrainingCourse,
  type TrainingCourse,
  type TrainingSession,
} from '@/lib/training';
import { fetchCourseOutline, type CourseChapterOutline } from '@/lib/learning';
import { formatDuration } from '@/lib/formatDuration';
import { siteImages } from '@/data/content';

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(amount: number | null, currency: string) {
  if (amount === null) return 'Price confirmed on enquiry';
  const fractionDigits =
    new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount / 10 ** fractionDigits);
}

export function TrainingCoursePage({ slug }: { slug: string }) {
  const [course, setCourse] = useState<TrainingCourse | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [outline, setOutline] = useState<CourseChapterOutline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublicTrainingCourse(slug).then(async (result) => {
      if (!active) return;
      setCourse(result.data.course);
      setSessions(result.data.sessions);
      setError(result.error);
      setLoading(false);
      if (result.data.course) {
        const outlineResult = await fetchCourseOutline(result.data.course.id);
        if (active) setOutline(outlineResult.data);
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <p role="status" className="shell py-40 text-sm text-muted">Loading course details…</p>;
  }
  if (error || !course) {
    return (
      <>
        <SEO title="Course Not Found | EcoHealth" description="This course is not available." path="/training" noIndex />
        <section className="bg-ivory pb-24 pt-40">
          <div className="shell">
            <p className="eyebrow">{error ? 'Training unavailable' : 'Course unavailable'}</p>
            <h1 className="mt-4 max-w-3xl font-display text-display-lg text-charcoal">
              {error ?? 'This course is not published or is no longer available.'}
            </h1>
            <Link to="/training" className="btn-primary mt-8">Browse training</Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${course.title} | EcoHealth Training`}
        description={course.summary}
        path={`/training/${course.slug}`}
      />
      <PageHero
        eyebrow={course.category?.name ?? 'Training'}
        title={course.title}
        subtitle={course.summary}
        image={siteImages.safetyTraining}
        imageAlt="Lifting and rigging safety training graphic"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Training', path: '/training' },
          { label: course.title },
        ]}
        index="03"
        meta={[formatDuration(course.duration_minutes), course.delivery_formats.join(' · ')]}
      />

      <section className="bg-ivory section-space">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionMarker index="01" label="Course overview" />
              <div className="mt-6 max-w-3xl space-y-5 text-base leading-relaxed text-charcoal-light">
                {course.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="mt-10 border-t border-charcoal/15 pt-7">
                <h2 className="font-display text-xl font-medium text-charcoal">Learning objectives</h2>
                {course.learning_objectives.length ? (
                  <ul className="mt-5 space-y-3">
                    {course.learning_objectives.map((objective) => (
                      <li key={objective} className="flex gap-3 text-sm leading-relaxed text-charcoal-light">
                        <span className="mt-2 h-px w-4 shrink-0 bg-forest-600" aria-hidden="true" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted">Objectives will be confirmed with the training team.</p>
                )}
              </div>
            </Reveal>

            {outline.length > 0 && (
              <Reveal delay={1}>
                <div className="mt-10 border-t border-charcoal/15 pt-7">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 className="font-display text-xl font-medium text-charcoal">Online programme</h2>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                      {outline.length} chapters · about{' '}
                      {outline.reduce((total, chapter) => total + chapter.estimated_minutes, 0)} minutes
                    </p>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                    Work through the chapters at your own pace, mark each one complete as you finish, and return to any
                    section later. Chapter text unlocks once your registration is approved.
                  </p>
                  <ol className="mt-5 divide-y divide-charcoal/10 border-y border-charcoal/10">
                    {outline.map((chapter) => (
                      <li key={chapter.id} className="flex items-baseline justify-between gap-4 py-3">
                        <span className="flex min-w-0 gap-3 text-sm text-charcoal-light">
                          <span className="font-mono text-[11px] text-muted">{String(chapter.position).padStart(2, '0')}</span>
                          <span className="min-w-0">{chapter.title}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-muted">{chapter.estimated_minutes} min</span>
                      </li>
                    ))}
                  </ol>
                  <Link to="/learner" className="btn-primary mt-6">
                    Start online training
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            )}

            <div className="mt-10 grid gap-8 border-t border-charcoal/15 pt-7 sm:grid-cols-2">
              <Reveal>
                <h2 className="font-display text-lg font-medium text-charcoal">Target participants</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {course.target_audience || 'Confirm suitability with the training team.'}
                </p>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="font-display text-lg font-medium text-charcoal">Prerequisites</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {course.prerequisites || 'No prerequisites have been specified.'}
                </p>
              </Reveal>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <Reveal>
              <div className="border border-charcoal/15 bg-paper p-6 sm:p-8">
                <SectionMarker index="02" label="Upcoming sessions" />
                <h2 className="mt-5 font-display text-2xl font-light text-charcoal">Choose a session</h2>
                {sessions.length === 0 ? (
                  <div className="mt-6 border-t border-charcoal/15 pt-5">
                    <p className="text-sm leading-relaxed text-muted">
                      No public dates are available right now. Ask about a future session or a corporate programme.
                    </p>
                    <Link to="/training/corporate" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-forest-700 link-underline">
                      Request training
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <ul className="mt-6 divide-y divide-charcoal/15 border-y border-charcoal/15">
                    {sessions.map((session) => (
                      <li key={session.id} className="py-5">
                        <p className="flex items-start gap-3 text-sm text-charcoal">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
                          <span>{formatDate(session.starts_at)} – {formatDate(session.ends_at)}</span>
                        </p>
                        <p className="mt-3 flex items-center gap-3 text-sm text-muted">
                          <MapPin className="h-4 w-4 shrink-0 text-forest-700" />
                          {session.location || 'Location confirmed on enquiry'}
                        </p>
                        <p className="mt-3 flex items-center gap-3 text-sm text-muted">
                          <Clock3 className="h-4 w-4 shrink-0 text-forest-700" />
                          {session.delivery_format}
                        </p>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <p className="text-sm font-medium text-charcoal">
                            {formatPrice(session.price_minor ?? course.price_minor, course.currency)}
                          </p>
                          <Link
                            to={`/learner?session=${session.id}`}
                            className="btn-primary"
                            aria-label={`Register for ${course.title}`}
                          >
                            Register for training
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-5 text-[11px] leading-relaxed text-muted">
                  Registration requests are subject to staff approval and available capacity. Any certificate is issued
                  only when the configured course completion requirements are met.
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-forest-700 link-underline"
                >
                  Contact our training team
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
