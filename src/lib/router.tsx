import { useEffect, useReducer } from 'react';

/**
 * Minimal history router.
 *
 * Real paths (`/services/ehs-consultancy`) instead of hash routes keep URLs
 * clean for SEO, sharing and analytics. Legacy `#/about` links are migrated to
 * `/about` on first load so nothing previously shared breaks.
 *
 * Static hosts need a single-page-app fallback to index.html. This project
 * ships `public/.htaccess` (Apache) and `public/_redirects` (Netlify/Cloudflare
 * Pages) for that; Vite's dev server handles it automatically.
 */

type Listener = () => void;
const listeners = new Set<Listener>();

export function currentPath(): string {
  const { pathname } = window.location;
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const target = `${window.location.pathname}${window.location.search}`;
  if (to === target) return;

  if (options.replace) window.history.replaceState({}, '', to);
  else window.history.pushState({}, '', to);

  notify();
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

export function useRouter() {
  const [, force] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const listener = () => force();
    listeners.add(listener);
    window.addEventListener('popstate', listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('popstate', listener);
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#/')) return;
    window.history.replaceState({}, '', hash.slice(1));
    force();
  }, []);

  return {
    path: currentPath(),
    query: new URLSearchParams(window.location.search),
  };
}

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function Link({ to, children, className, onClick, title }: LinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (/^(https?:|mailto:|tel:)/i.test(to)) return;

    event.preventDefault();
    navigate(to);
    onClick?.();
  };

  return (
    <a href={to} className={className} onClick={handleClick} title={title}>
      {children}
    </a>
  );
}
