import { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero, ServiceCTA } from '@/components/PageHero';
import { SEO } from '@/components/SEO';
import { EnquiryForm } from '@/components/EnquiryForm';
import { trainingCourses } from '@/data/content';

const heroImage =
  'https://images.pexels.com/photos/4872019/pexels-photo-4872019.jpeg?auto=compress&cs=tinysrgb&w=1800';

export function TrainingPage() {
  const categories = Array.from(new Set(trainingCourses.map((c) => c.category)));
  const [selection, setSelection] = useState<{ course?: string; token: number }>({ token: 0 });

  const selectCourse = (course: string) => {
    setSelection((prev) => ({ course, token: prev.token + 1 }));
    document.getElementById('training-enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <SEO
        title="Training & Capacity Building | EcoHealth & Transport Solutions Ltd"
        description="Workplace safety, environmental, defensive driving, fatigue management, and risk assessment training tailored to the roles and risks your teams face."
        path="/training"
      />
      <PageHero
        eyebrow="Training & Capacity Building"
        title="Building real capability in your workforce."
        subtitle="Structured training that builds practical safety, environmental, and operational capability — tailored to the roles and risks your teams actually face."
        image={heroImage}
        imageAlt="A group of professionals engaged in a business meeting with a presentation in a modern office"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Training' }]}
      />

      {/* Course catalogue */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Sticky sidebar */}
            <div className="lg:col-span-3">
              <Reveal>
                <div className="lg:sticky lg:top-28">
                  <p className="eyebrow">Course categories</p>
                  <nav className="mt-6 space-y-2">
                    {categories.map((cat) => (
                      <a
                        key={cat}
                        href={`#cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .getElementById(`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="block border-l-2 border-charcoal/10 py-2 pl-4 text-sm text-charcoal-light transition-colors hover:border-forest-600 hover:text-forest-700"
                      >
                        {cat}
                      </a>
                    ))}
                  </nav>
                  <div className="mt-10 border-t border-charcoal/10 pt-8">
                    <p className="text-sm leading-relaxed text-muted">
                      Course durations, pricing, and accreditation details are confirmed on enquiry, based on your team's needs.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Courses */}
            <div className="lg:col-span-9">
              {categories.map((category) => {
                const courses = trainingCourses.filter((c) => c.category === category);
                return (
                  <div
                    key={category}
                    id={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="mb-16 scroll-mt-28"
                  >
                    <Reveal>
                      <div className="flex items-center gap-4">
                        <h2 className="font-display text-2xl font-semibold text-charcoal">
                          {category}
                        </h2>
                        <span className="h-px flex-1 bg-charcoal/10" />
                        <span className="text-xs uppercase tracking-widest text-muted">
                          {courses.length} course{courses.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </Reveal>

                    <div className="mt-8 border-t border-charcoal/10">
                      {courses.map((course, i) => (
                        <Reveal key={course.slug} delay={((i % 2) + 1) as 1 | 2}>
                          <div className="group grid gap-4 border-b border-charcoal/10 py-8 transition-colors hover:bg-sage-light/40 sm:grid-cols-12 sm:gap-6">
                            <div className="sm:col-span-1">
                              <span className="font-display text-sm font-bold text-forest-600">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <div className="sm:col-span-7">
                              <h3 className="font-display text-lg font-semibold text-charcoal">
                                {course.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                                {course.description}
                              </p>
                            </div>
                            <div className="flex items-center sm:col-span-4 sm:justify-end">
                              <button
                                type="button"
                                onClick={() => selectCourse(course.title)}
                                className="group/link inline-flex items-center gap-2 text-left text-xs font-medium uppercase tracking-wider text-forest-700"
                              >
                                <span className="link-underline">Enquire about this course</span>
                                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                              </button>
                            </div>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Training enquiry CTA */}
              <Reveal>
                <div className="mt-8 bg-forest-800 p-10 text-ivory">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    Need a training programme scoped to your project?
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-ivory/65 text-pretty">
                    Tell us about your team, the risks they face, and the outcomes you need. We will design a programme that fits — and provide clear details on duration, content, and delivery.
                  </p>
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => selectCourse('Custom programme')}
                      className="group inline-flex items-center gap-2 bg-white px-7 py-3.5 text-sm font-medium uppercase tracking-wider text-forest-800 transition-all duration-500 ease-elegant hover:gap-3"
                    >
                      Submit a Training Enquiry
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Training enquiry */}
      <section id="training-enquiry" className="bg-sage-light scroll-mt-24">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow">Training enquiry</p>
              <h2 className="mt-5 font-display text-display-md text-charcoal text-balance">
                Request a programme for your team.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted text-pretty">
                Tell us about the team, the risks they face, and the outcomes you need. We will respond with a
                programme outline, delivery approach, and the practical details needed to proceed.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                Durations, pricing, and accreditation are confirmed per programme — we do not publish figures that
                have not been approved.
              </p>
              <div className="mt-8 border-t border-charcoal/10 pt-6">
                <p className="text-sm text-muted">
                  Prefer a general enquiry?{' '}
                  <Link to="/contact" className="text-forest-700 link-underline">
                    Use the main enquiry form
                  </Link>
                  .
                </p>
              </div>
            </Reveal>

            <Reveal delay={1} className="lg:col-span-8">
              <div className="bg-white p-8 shadow-[0_1px_0_rgba(37,43,41,0.06)] sm:p-10">
                <EnquiryForm key={selection.token} variant="training" initialService={selection.course} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ServiceCTA
        title="Ready to build capability in your team?"
        body="Send us your training requirements and we will discuss a programme that fits your operational context."
        ctaTo="/contact?enquiry=training"
      />
    </>
  );
}
