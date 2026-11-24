import { useEffect, useState } from 'react';

/**
 * Image delivery helpers.
 *
 * CMS-managed photography may come from a remote CDN that accepts a `w`
 * parameter. Local assets and other URLs are passed through untouched.
 */

const DEFAULT_WIDTHS = [480, 768, 1080, 1440, 1920];

function isRemoteCdn(src: string): boolean {
  return /^https?:\/\/images\.pexels\.com\//i.test(src);
}

export function sizedImage(src: string, width: number): string {
  if (!isRemoteCdn(src)) return src;
  try {
    const url = new URL(src);
    url.searchParams.set('auto', 'compress');
    url.searchParams.set('cs', 'tinysrgb');
    url.searchParams.set('w', String(width));
    return url.toString();
  } catch {
    return src;
  }
}

export function imageSrcSet(src: string, widths: number[] = DEFAULT_WIDTHS): string | undefined {
  if (!isRemoteCdn(src)) return undefined;
  return widths.map((width) => `${sizedImage(src, width)} ${width}w`).join(', ');
}

/** Fades an image in once it has decoded, so lazy-loaded photography never pops. */
export function useImageLoaded(src: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return {
    loaded,
    onLoad: () => setLoaded(true),
  };
}
