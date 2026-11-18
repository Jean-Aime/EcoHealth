/**
 * Motion capability check.
 *
 * `motion-ready` is added before React renders, which is what allows the
 * stylesheet to hide reveal elements without ever hiding content for visitors
 * whose browser blocks or fails JavaScript.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initMotion(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (prefersReducedMotion()) {
    root.classList.add('reduced-motion');
    return;
  }
  root.classList.add('motion-ready');
}
