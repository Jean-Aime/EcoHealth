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
        eyebrow="Resources & Insights"
        title="Practical perspectives on safety, environment, and operations."
        subtitle="Articles on occupational health and safety, environmental management, transport safety, infrastructure, and risk management — written for people who manage real projects."
        image={heroImage}
        imageAlt="A diverse group actively collaborating in a bright, modern conference room setting"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Insights' }]}
      />

      {showFeatured && featured && (
        <section className="bg-ivory">
          <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
            <Reveal>
              <Link to={`/insights/${featured.slug}`} className="group block">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-center">
                  <div className="lg:col-span-7">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <SmartImage
                        src={articleImage(featured)}
                        alt={featured.title}
                        priority
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        width={1200}
                        height={750}
                        className="image-cover transition-transform duration-700 ease-elegant group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
                      <span className="bg-forest-600 px-3 py-1 text-white">Featured</span>
                      <span className="text-forest-700">{featured.category}</span>
                    </div>
                    <h2 className="mt-5 font-display text-display-sm text-charcoal text-balance transition-colors group-hover:text-forest-700">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">{featured.excerpt}</p>
                    <div className="mt-6 flex items-center gap-3 text-sm text-muted">
                      <span>{formatDate(featured.date)}</span>
                      <span className="h-1 w-1 bg-muted/40" />
                      <span>{featured.readTime}</span>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-forest-700">
                      <span className="link-underline">Read article</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section className="bg-sage-light">
        <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-32">
          <Reveal>
            <div className="flex flex-col gap-6 border-b border-charcoal/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">All articles</p>
                <h2 className="mt-4 font-display text-display-sm text-charcoal">Latest insights</h2>
              </div>
              <div role="group" aria-label="Filter articles by category" className="flex flex-wrap gap-2">
                {categories.map((entry) => {
                  const active = category === entry;
                  return (
                    <button
                      key={entry}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategory(entry)}
                      className={`border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors duration-300 ${
                        active
                          ? 'border-forest-700 bg-forest-700 text-white'
                          : 'border-charcoal/15 text-muted hover:border-forest-600 hover:text-forest-800'
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
            <p className="mt-12 border border-dashed border-charcoal/20 p-8 text-sm text-muted">
              No articles have been published in this category yet.
            </p>
          ) : (
            <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {gridArticles.map((article, i) => (
                <Reveal key={article.slug} delay={((i % 3) + 1) as 1 | 2 | 3}>
                  <Link to={`/insights/${article.slug}`} className="group flex h-full flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SmartImage
                        src={articleImage(article)}
                        alt={article.title}
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        width={900}
                        height={675}
                        className="image-cover transition-transform duration-700 ease-elegant group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-5 flex-1">
                      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
                        <span className="text-forest-700">{article.category}</span>
                        <span className="h-1 w-1 bg-muted/40" />
                        <span>{formatDate(article.date)}</span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-semibold text-charcoal transition-colors group-hover:text-forest-700">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{article.excerpt}</p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-forest-700">
                      <span className="link-underline">Read</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
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
        body="Our team is available to discuss your project requirements and how we can help."
        ctaLabel="Contact EcoHealth"
        ctaTo="/contact"
        variant="forest"
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
          <p className="text-sm text-muted">Loading article…</p>
        </section>
      );
    }

    return (
      <>
        <SEO title="Article Not Found | EcoHealth" description="The requested article could not be found." path="/insights" noIndex />
        <section className="flex min-h-screen items-center justify-center bg-ivory px-6">
          <div className="text-center">
            <p className="eyebrow">404</p>
            <h1 className="mt-4 font-display text-display-md text-charcoal">Article not found</h1>
            <p className="mt-4 text-muted">The article you are looking for does not exist or has been unpublished.</p>
            <Link to="/insights" className="btn-primary mt-8">
              <ArrowRight className="h-4 w-4" />
              All Articles
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

      <section className="bg-ivory border-b border-charcoal/10">
        <div className="mx-auto max-w-3xl px-6 pt-36 pb-16 lg:pt-44 lg:pb-20">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted">
            <Link to="/" className="hover:text-forest-700">
              Home
            </Link>
            <span className="text-muted/40">/</span>
            <Link to="/insights" className="hover:text-forest-700">
              Insights
            </Link>
          </nav>
          <Reveal>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
              <span className="text-forest-700">{article.category}</span>
              <span className="h-1 w-1 bg-muted/40" />
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span className="h-1 w-1 bg-muted/40" />
              <span>{article.readTime}</span>
            </div>
            <h1 className="mt-6 font-display text-display-md text-charcoal text-balance">{article.title}</h1>
            <p className="mt-6 text-xl leading-relaxed text-muted text-pretty">{article.excerpt}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
          <Reveal>
            <div className="relative aspect-[21/9] overflow-hidden">
              <SmartImage
                src={image}
                alt={article.title}
                priority
                sizes="(min-width: 1024px) 70vw, 100vw"
                width={1600}
                height={686}
                className="image-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <Reveal>
            <div className="space-y-6">
              {article.body.map((paragraph, i) => (
                <p
                  key={i}
                  className={`text-lg leading-relaxed text-charcoal-light text-pretty ${
                    i === 0 ? 'font-display text-xl font-medium text-charcoal' : ''
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 border-t border-charcoal/10 pt-8">
            <Link
              to="/insights"
              className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-forest-700"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="link-underline">All articles</span>
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-sage-light border-t border-charcoal/10">
          <div className="mx-auto max-w-8xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="eyebrow">Keep reading</p>
            <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:gap-12">
              {related.map((entry) => (
                <Reveal key={entry.slug}>
                  <Link to={`/insights/${entry.slug}`} className="group flex flex-col">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
                      <span className="text-forest-700">{entry.category}</span>
                      <span className="h-1 w-1 bg-muted/40" />
                      <span>{formatDate(entry.date)}</span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-charcoal transition-colors group-hover:text-forest-700">
                      {entry.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">{entry.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-forest-700">
                      <span className="link-underline">Read</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
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
