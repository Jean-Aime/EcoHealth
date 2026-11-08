/**
 * Analytics readiness.
 *
 * Nothing is loaded and no cookies are set unless an ID is configured:
 *  - VITE_GA_ID            e.g. G-XXXXXXXXXX  (Google Analytics 4)
 *  - VITE_PLAUSIBLE_DOMAIN e.g. ecohealth.rw  (Plausible, cookieless)
 *
 * Both are optional and can be added at deploy time without touching code.
 */

const GA_ID = import.meta.env.VITE_GA_ID;
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

let initialised = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { u?: string }) => void;
  }
}

function injectScript(src: string, async = true) {
  const script = document.createElement('script');
  script.src = src;
  script.async = async;
  script.defer = true;
  document.head.appendChild(script);
  return script;
}

export function initAnalytics() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;

  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`);
  }

  if (PLAUSIBLE_DOMAIN) {
    const script = injectScript('https://plausible.io/js/script.js');
    script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
  }
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;

  if (GA_ID && window.gtag) {
    window.gtag('event', 'page_view', { page_path: path });
  }

  if (PLAUSIBLE_DOMAIN && window.plausible) {
    window.plausible('pageview', { u: path });
  }
}

export const analyticsConfigured = Boolean(GA_ID || PLAUSIBLE_DOMAIN);
