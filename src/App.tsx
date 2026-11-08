import { useEffect } from 'react';
import { useRouter } from '@/lib/router';
import { initAnalytics, trackPageView } from '@/lib/analytics';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { TrainingPage } from '@/pages/TrainingPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { InsightsPage, ArticlePage } from '@/pages/InsightsPage';
import { PartnersPage } from '@/pages/PartnersPage';
import { ContactPage } from '@/pages/ContactPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AdminPage } from '@/pages/AdminPage';

interface ResolvedRoute {
  page: React.ReactNode;
  overDarkHero: boolean;
}

function resolveRoute(path: string): ResolvedRoute {
  const segments = path.split('/').filter(Boolean);
  const [first, second] = segments;

  if (segments.length === 0) return { page: <HomePage />, overDarkHero: true };

  if (segments.length === 1) {
    const pages: Record<string, React.ReactNode> = {
      about: <AboutPage />,
      services: <ServicesPage />,
      training: <TrainingPage />,
      projects: <ProjectsPage />,
      insights: <InsightsPage />,
      partners: <PartnersPage />,
      contact: <ContactPage />,
      privacy: <PrivacyPage />,
    };
    if (first in pages) return { page: pages[first], overDarkHero: true };
  }

  if (segments.length === 2 && first === 'services') {
    return { page: <ServiceDetailPage slug={second} />, overDarkHero: true };
  }
  if (segments.length === 2 && first === 'insights') {
    return { page: <ArticlePage slug={second} />, overDarkHero: false };
  }

  return { page: <NotFoundPage />, overDarkHero: false };
}

function App() {
  const { path } = useRouter();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(`${window.location.pathname}${window.location.search}`);
  }, [path]);

  if (path === '/admin') return <AdminPage />;

  const { page, overDarkHero } = resolveRoute(path);

  return (
    <div className="min-h-screen bg-ivory">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-forest-700 focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <Header currentPath={path} overDarkHero={overDarkHero} />
      <main id="main" tabIndex={-1}>
        {page}
      </main>
      <Footer />
    </div>
  );
}

export default App;
