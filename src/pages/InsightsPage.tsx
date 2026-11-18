import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router';
import { Reveal } from '@/components/Reveal';
import { PageHero } from '@/components/PageHero';
import { CTASection } from '@/components/CTASection';
import { SEO } from '@/components/SEO';
import { SmartImage } from '@/components/SmartImage';
import { usePublishedContent, type ArticleRecord } from '@/lib/cms';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/site';
import { ArtImage, ArrowLink, SectionMarker } from '@/components/motion';

const heroImage = 'https://images.pexels.com/photos/1181394/pexels-photo-1181394.jpeg?auto=compress&cs=tinysrgb&w=1800';

const categoryImages: Record<string, string> = {
  'Risk Management': 'https://images.pexels.com/photos/9258892/pexels-photo-9258892.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Environmental Management':
    'https://images.pexels.com/photos/28463991/pexels-photo-28463991.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Occupational Health & Safety':
    'https://images.pexels.com/photos/8487773/pexels-photo-8487773.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Transport Safety': 'https://images.pexels.com/photos/1606957/pexels-photo-1606957.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

function articleImage(article: ArticleRecord): string {
  return article.image ?? categoryImages[article.category] ?? categoryImages['Risk Management'];
}

export function InsightsPage() {
  const { articles } = usePublishedContent();
  const [category, setCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(articles.map((article) => article.category)))];
  const featured = articles[0];
  const showFeatured = category === 'All' && Boolean(featured);
  const gridArticles =
    category === 'All' ? articles.slice(1) : articles.filter((article) => article.category === category);

  return (
    <>
      <SEO
        title="Resources & Insights | EcoHealth & Transport Solutions Ltd"
        description="Practical perspectives on occupational health and safety, environmental management, transport safety, infrastructure, and risk management."
        path="/insights"
      />

      <PageHero
        eyebrow="Resources & insights"
        title="Practical perspectives on safety, environment, and operations."
        titleLines={['Practical perspectives', 'on safety, environment,', 'and operations.']}
        subtitle="Articles on occupational health and safety, environmental management, transport safety, infrastructure, and risk management — written for people who manage real projects."
        image={heroImage}
        imageAlt="A group collaborating in a bright conference room"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Insights' }]}
        index="05"
        meta={['Field notes', 'Practical guidance', 'No filler']}
      />

      {showFeatured && featured && (
        <section className="bg-ivory py-16 lg:py-24">
          <div className="shell">
            <Reveal>
              <Link to={`/insights/${featured.slug}`} className="group grid gap-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-7">
                  <ArtImage
                    src={articleImage(featured)}
                    alt={featured.title}
                    priority
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    width={1200}
                    height={900}
                    parallax={20}
                    className="aspect-[16/10]"
                  />
                </div>

                <div className="flex flex-col justify-center lg:col-span-5">
                  <div className="flex flex-wrap items-center gap-3 text-[9.5px] font-semibold uppercase tracking-[0.18em]">
                    <span className="bg-forest-700 px-2.5 py-1 text-ivory">Featured</span>
                    <span className="text-forest-700">{featured.category}</span>
                  </div>
                  <h2 className="mt-5 font-display text-display-sm text-charcoal transition-colors duration-500 group-hover:text-forest-700">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{featured.excerpt}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    <span>{formatDate(featured.date)}</span>
                    <span className="h-px w-4 bg-charcoal/20" aria-hidden="true" />
                    <span>{featured.readTime}</span>
                  </div>
                  <span className="mt-7 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                    <span className="link-underline">Read the article</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section className="border-t border-charcoal/10 bg-paper py-16 lg:py-24">
        <div className="shell">
          <Reveal>
            <div className="flex flex-col gap-6 border-b border-charcoal/20 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <SectionMarker index="02" label="The archive" />
                <h2 className="mt-4 font-display text-display-md text-charcoal">Latest insights</h2>
              </div>

              <div role="group" aria-label="Filter articles by category" className="flex flex-wrap gap-x-5 gap-y-2">
                {categories.map((entry) => {
                  const active = category === entry;
                  return (
                    <button
                      key={entry}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategory(entry)}
                      className={`border-b pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                        active
                          ? 'border-forest-700 text-forest-800'
                          : 'border-transparent text-muted hover:border-charcoal/30 hover:text-charcoal'
                      }`}
                    >
                      {entry}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {gridArticles.length === 0 ? (
            <p className="mt-10 border border-charcoal/20 p-7 text-sm text-muted">
              No articles have been published in this category yet.
            </p>
          ) : (
            <div className="mt-4">
              {gridArticles.map((article) => (
                <Reveal key={article.slug}>
                  <Link
                    to={`/insights/${article.slug}`}
                    className="group grid gap-4 border-b border-charcoal/15 py-6 sm:gap-6 lg:grid-cols-12 lg:items-center"
                  >
                    <div className="lg:col-span-2">
                      <div className="aspect-[16/9] overflow-hidden bg-sage lg:aspect-[4/3]">
                        <SmartImage
                          src={articleImage(article)}
                          alt=""
                          sizes="(min-width: 1024px) 16vw, 100vw"
                          width={480}
                          height={360}
                          className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-2 lg:pl-2">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                        {article.category}
                      </p>
                      <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-muted">{formatDate(article.date)}</p>
                    </div>

                    <div className="lg:col-span-5">
                      <h3 className="font-display text-lg font-medium leading-snug text-charcoal transition-colors duration-500 group-hover:text-forest-700 lg:text-xl">
                        {article.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{article.excerpt}</p>
                    </div>

                    <div className="flex items-center justify-between gap-4 lg:col-span-3">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted">{article.readTime}</span>
                      <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700">
                        Read
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection
        eyebrow="Get in touch"
        headline="Have a question about safety, environment, or operations?"
        headlineLines={['Have a question about', 'safety, environment,', 'or operations?']}
        body="Our team is available to discuss your project requirements and how we can help."
        ctaLabel="Contact EcoHealth"
        ctaTo="/contact"
        variant="light"
        secondaryTo="/training"
        secondaryLabel="Explore training"
      />
    </>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const { articles, loaded } = usePublishedContent();
  const article = articles.find((entry) => entry.slug === slug);

  if (!article) {
    if (!loaded) {
      return (
        <section className="flex min-h-screen items-center justify-center bg-ivory px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted" role="status">
            Loading article…
          </p>
        </section>
      );
    }

    return (
      <>
        <SEO title="Article Not Found | EcoHealth" description="The requested article could not be found." path="/insights" noIndex />
        <section className="relative bg-ivory pb-24 pt-36 lg:pt-44">
          <div className="shell">
            <p className="font-display text-[8rem] font-light leading-none text-charcoal/10 sm:text-[12rem]">404</p>
            <h1 className="mt-2 font-display text-display-lg text-charcoal">This article could not be found.</h1>
            <p className="mt-4 max-w-md text-base text-muted">
              The article you are looking for does not exist or has been unpublished.
            </p>
            <Link to="/insights" className="btn-primary mt-8">
              All articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </>
    );
  }

  const related = articles.filter((entry) => entry.slug !== slug).slice(0, 2);
  const image = articleImage(article);

  return (
    <>
      <SEO
        title={`${article.title} | EcoHealth Insights`}
        description={article.excerpt}
        path={`/insights/${article.slug}`}
        ogType="article"
        image={image}
        publishedTime={article.date}
        jsonLd={[
          articleJsonLd({ ...article, image }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Insights', path: '/insights' },
            { name: article.title, path: `/insights/${article.slug}` },
          ]),
        ]}
      />

      <article>
        <header className="bg-ivory pb-10 pt-32 lg:pb-14 lg:pt-40">
          <div className="shell">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              <Link to="/" className="hover:text-forest-700">
                Home
              </Link>
              <span className="opacity-40">/</span>
              <Link to="/insights" className="hover:text-forest-700">
                Insights
              </Link>
              <span className="opacity-40">/</span>
              <span className="text-forest-700">{article.category}</span>
            </nav>

            <Reveal>
              <div className="mt-10 grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-9">
                  <div className="flex flex-wrap items-center gap-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                    <span className="h-px w-4 bg-charcoal/20" aria-hidden="true" />
                    <span>{article.readTime}</span>
                  </div>
                  <h1 className="mt-5 max-w-4xl font-display text-display-lg text-charcoal">{article.title}</h1>
                  <p className="mt-6 max-w-2xl text-lede text-muted">{article.excerpt}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </header>

        <div className="shell">
          <ArtImage
            src={image}
            alt={article.title}
            priority
            sizes="(min-width: 1024px) 92vw, 100vw"
            width={1600}
            height={800}
            parallax={18}
            className="aspect-[16/10] sm:aspect-[21/9]"
          />
        </div>

        <div className="bg-ivory py-14 lg:py-20">
          <div className="shell">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <aside className="lg:col-span-3">
                <div className="lg:sticky lg:top-28">
                  <dl className="border-t border-charcoal/15">
                    <div className="border-b border-charcoal/15 py-4">
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">Category</dt>
                      <dd className="mt-1.5 text-[12.5px] text-charcoal-light">{article.category}</dd>
                    </div>
                    <div className="border-b border-charcoal/15 py-4">
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">Published</dt>
                      <dd className="mt-1.5 text-[12.5px] text-charcoal-light">{formatDate(article.date)}</dd>
                    </div>
                    <div className="border-b border-charcoal/15 py-4">
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">Reading time</dt>
                      <dd className="mt-1.5 text-[12.5px] text-charcoal-light">{article.readTime}</dd>
                    </div>
                  </dl>
                  <div className="mt-6">
                    <Link
                      to="/insights"
                      className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-700"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
                      <span className="link-underline">All articles</span>
                    </Link>
                  </div>
                </div>
              </aside>

              <div className="lg:col-span-7">
                <div className="space-y-6">
                  {article.body.map((paragraph, index) => (
                    <p
                      key={index}
                      className={`text-[16.5px] leading-[1.8] text-charcoal-light ${
                        index === 0 ? 'editorial-drop text-[17.5px] text-charcoal' : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-charcoal/15 pt-6">
                  <p className="max-w-sm text-[11px] leading-relaxed text-muted">
                    General information for people involved in projects in Rwanda and the wider region; it is not a substitute for project-specific or professional advice.
                  </p>
                  <ArrowLink to="/contact">Discuss this topic</ArrowLink>
                </div>
              </div>

              <div className="hidden lg:col-span-2 lg:block">
                <p className="vertical-label text-[9px] font-semibold uppercase tracking-[0.24em] text-muted">
                  EcoHealth Insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-charcoal/10 bg-paper py-16 lg:py-20">
          <div className="shell">
            <SectionMarker index="—" label="Keep reading" />
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:gap-12">
              {related.map((entry) => (
                <Reveal key={entry.slug}>
                  <Link to={`/insights/${entry.slug}`} className="group grid gap-5 sm:grid-cols-12">
                    <div className="sm:col-span-4">
                      <div className="aspect-[4/3] overflow-hidden bg-sage">
                        <SmartImage
                          src={articleImage(entry)}
                          alt=""
                          sizes="(min-width: 640px) 14vw, 100vw"
                          width={480}
                          height={360}
                          className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-8">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-forest-700">{entry.category}</p>
                      <h3 className="mt-2 font-display text-lg font-medium leading-snug text-charcoal transition-colors duration-500 group-hover:text-forest-700">
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-[12px] uppercase tracking-[0.12em] text-muted">{formatDate(entry.date)}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
