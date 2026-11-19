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
import { TrainingCoursePage } from '@/pages/TrainingCoursePage';
import { CorporateTrainingPage } from '@/pages/CorporateTrainingPage';
import { LearnerPortalPage } from '@/pages/LearnerPortalPage';
import { LearningCoursePage } from '@/pages/LearningCoursePage';
import { CertificateVerificationPage } from '@/pages/CertificateVerificationPage';
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
      learner: <LearnerPortalPage />,
      projects: <ProjectsPage />,
      insights: <InsightsPage />,
      partners: <PartnersPage />,
      contact: <ContactPage />,
      privacy: <PrivacyPage />,
    };
    if (first in pages) return { page: pages[first], overDarkHero: false };
  }

  if (segments.length === 2 && first === 'services') {
    return { page: <ServiceDetailPage slug={second} />, overDarkHero: false };
  }
  if (segments.length === 2 && first === 'training') {
    if (second === 'corporate') return { page: <CorporateTrainingPage />, overDarkHero: false };
    return { page: <TrainingCoursePage slug={second} />, overDarkHero: false };
  }
  if (segments.length === 2 && first === 'certificates' && second === 'verify') {
    return { page: <CertificateVerificationPage code="" />, overDarkHero: false };
  }
  if (segments.length === 3 && first === 'learner' && second === 'courses') {
    return { page: <LearningCoursePage courseId={segments[2]} />, overDarkHero: true };
  }
  if (segments.length === 3 && first === 'certificates' && second === 'verify') {
    return { page: <CertificateVerificationPage code={segments[2]} />, overDarkHero: false };
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
    // Move keyboard and screen-reader focus to the new page's main landmark.
    const main = document.getElementById('main');
    if (main) main.focus({ preventScroll: true });
  }, [path]);

  if (path === '/admin') return <AdminPage />;

  const { page, overDarkHero } = resolveRoute(path);

  return (
    <div className="min-h-screen bg-ivory">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-forest-800 focus:px-5 focus:py-3 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-widest focus:text-ivory"
      >
        Skip to content
      </a>
      <Header currentPath={path} overDarkHero={overDarkHero} />
      <main id="main" tabIndex={-1} key={path} className="animate-page-in">
        {page}
      </main>
      <Footer overlapsPinnedCta={path === '/'} />
    </div>
  );
}

export default App;
