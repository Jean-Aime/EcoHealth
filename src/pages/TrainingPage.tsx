import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { CTASection } from '@/components/CTASection';
import { SEO } from '@/components/SEO';
import { ArtImage, SectionMarker } from '@/components/motion';
import { fetchPublicTrainingCatalog, type TrainingCategory, type TrainingCourse } from '@/lib/training';
import { formatDuration } from '@/lib/formatDuration';

const heroImage = 'https://images.pexels.com/photos/4872019/pexels-photo-4872019.jpeg?auto=compress&cs=tinysrgb&w=1800';

export function TrainingPage() {
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublicTrainingCatalog().then((result) => {
      if (!active) return;
      setCategories(result.data.categories);
      setCourses(result.data.courses);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const visibleCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter((course) => {
      const inCategory = category === 'all' || course.category_id === category;
      const matches =
        !query ||
        [course.title, course.summary, course.description, course.target_audience, course.category?.name]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));
      return inCategory && matches;
    });
  }, [category, courses, search]);

  return (
    <>
      <SEO
        title="Training & Capacity Building | EcoHealth & Transport Solutions Ltd"
        description="Browse EcoHealth training course outlines, objectives, delivery formats and available sessions, or request corporate training."
        path="/training"
      />

      <PageHero
        eyebrow="Training & capacity building"
        title="Training shaped around the work people do."
        titleLines={['Training shaped', 'around the work', 'people do.']}
        subtitle="Explore courses and upcoming sessions published by EcoHealth. Course details, availability and any applicable credentials are confirmed before registration."
        image={heroImage}
        imageAlt="Professionals taking part in a training session"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Training' }]}
        index="03"
        meta={['Course outlines', 'Upcoming sessions', 'Individual & corporate enquiries']}
      />

      <section className="bg-ivory py-16 lg:py-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <SectionMarker index="01" label="Training catalogue" />
                <h2 className="mt-6 max-w-sm font-display text-display-md text-charcoal">
                  Find the right course and session.
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
                  Only courses and dates explicitly published by EcoHealth appear here. For a tailored team programme,
                  send a corporate training request.
                </p>
                <Link to="/training/corporate" className="btn-primary mt-8">
                  Request corporate training
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/learner" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-forest-700 link-underline">
                  Open learner portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/certificates/verify" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest-700 link-underline">
                  Verify a certificate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>

              <Reveal delay={1}>
                <div className="mt-10">
                  <ArtImage
                    src="https://images.pexels.com/photos/8761547/pexels-photo-8761547.jpeg?auto=compress&cs=tinysrgb&w=1400"
                    alt="Professionals attending a facilitated training session"
                    sizes="(min-width: 1024px) 32vw, 100vw"
                    width={1000}
                    height={1200}
                    className="aspect-[4/5]"
                  />
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              {(loading || courses.length > 0) && (
                <div className="grid gap-4 border-b border-charcoal/15 pb-6 sm:grid-cols-2">
                  <label className="relative block">
                    <span className="sr-only">Search courses</span>
                    <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search courses"
                      className="w-full border-0 border-b border-charcoal/25 bg-transparent py-3 pl-7 text-sm text-charcoal placeholder:text-muted focus:border-forest-700 focus:outline-none"
                    />
                  </label>
                  <label>
                    <span className="sr-only">Filter by category</span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="w-full border-0 border-b border-charcoal/25 bg-transparent py-3 text-sm text-charcoal focus:border-forest-700 focus:outline-none"
                    >
                      <option value="all">All categories</option>
                      {categories.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {error && (
                <p role="alert" className="mt-8 border border-red-700/25 bg-red-50 p-5 text-sm text-red-800">
                  {error}
                </p>
              )}
              {loading ? (
                <p role="status" className="mt-8 text-sm text-muted">Loading the course catalogue…</p>
              ) : visibleCourses.length === 0 ? (
                <div className="mt-8 border border-dashed border-charcoal/20 p-8 sm:p-10">
                  <p className="font-display text-xl font-light text-charcoal">
                    {courses.length === 0 ? 'No courses are published yet.' : 'No courses match your search.'}
                  </p>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
                    {courses.length === 0
                      ? 'Courses created and published by the EcoHealth training team will appear here. Select a course to review its objectives, audience, prerequisites, duration, delivery and available sessions.'
                      : 'Try a different search term or category, or ask about a tailored programme.'}
                  </p>
                  <Link to="/training/corporate" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest-700 link-underline">
                    Request corporate training
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="mt-2 border-t border-charcoal/15">
                  {visibleCourses.map((course, index) => (
                    <Reveal key={course.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
                      <article className="grid gap-4 border-b border-charcoal/15 py-7 sm:grid-cols-12 sm:gap-6">
                        <div className="sm:col-span-1">
                          <span className="font-serif text-2xl italic text-forest-700/40">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="sm:col-span-8">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                            {course.category?.name ?? 'Training'}
                          </p>
                          <h3 className="mt-2 font-display text-xl font-medium text-charcoal">{course.title}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{course.summary}</p>
                          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-charcoal-light">
                            {formatDuration(course.duration_minutes)} · {course.delivery_formats.join(' · ')}
                          </p>
                        </div>
                        <div className="sm:col-span-3 sm:flex sm:justify-end">
                          <Link
                            to={`/training/${course.slug}`}
                            className="inline-flex items-center gap-2 self-start text-[10px] font-semibold uppercase tracking-[0.14em] text-forest-700"
                          >
                            Course details
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Corporate training"
        headline="Need a course scoped to your workplace?"
        headlineLines={['Need a course scoped', 'to your workplace?']}
        body="Tell us about your organisation, the participants and the outcomes you need. The training team will review your request and follow up."
        ctaLabel="Request corporate training"
        ctaTo="/training/corporate"
        variant="forest"
        secondaryTo="/contact?enquiry=training"
        secondaryLabel="Contact the training team"
      />
    </>
  );
}
