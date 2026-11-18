import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Subtle scroll depth for large imagery.
 *
 * All registered elements share one passive scroll listener and one animation
 * frame, so a page with six photographs costs the same as a page with one.
 * Parallax is desktop-only and disabled entirely for reduced-motion visitors.
 */
const registered = new Set<HTMLElement>();
let frame = 0;
const strengthByElement = new WeakMap<HTMLElement, number>();

function updateAll() {
  frame = 0;
  if (registered.size === 0) return;
  const viewport = window.innerHeight;

  registered.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > viewport + 200) return;

    const strength = strengthByElement.get(element) ?? 0;
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const offset = Math.max(-1, Math.min(1, progress)) * -strength;
    element.style.setProperty('--py', `${offset.toFixed(1)}px`);
  });
}

function schedule() {
  if (frame) return;
  frame = window.requestAnimationFrame(updateAll);
}

function start() {
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  schedule();
}

function stop() {
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  if (frame) {
    window.cancelAnimationFrame(frame);
    frame = 0;
  }
}

export function useParallax<T extends HTMLElement>(strength = 24) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || strength === 0) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    strengthByElement.set(element, strength);
    registered.add(element);
    if (registered.size === 1) start();
    schedule();

    return () => {
      registered.delete(element);
      strengthByElement.delete(element);
      element.style.removeProperty('--py');
      if (registered.size === 0) stop();
    };
  }, [strength]);

  return ref;
}
