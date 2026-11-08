import { imageSrcSet, sizedImage } from '@/lib/images';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Hero/above-the-fold images load eagerly; everything else is deferred. */
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

/**
 * Responsive image with explicit dimensions.
 *
 * Remote photography is requested at the size the layout actually needs, which
 * avoids shipping a 1920px JPEG into a 400px card. Width and height are always
 * emitted so the browser reserves space and the page does not shift while
 * images decode.
 */
export function SmartImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes,
  width = 1600,
  height = 900,
}: SmartImageProps) {
  const fallbackWidth = priority ? 1600 : 1080;
  const srcSet = imageSrcSet(src, priority ? [640, 960, 1280, 1600, 1920] : [400, 640, 900, 1200]);

  return (
    <img
      src={sizedImage(src, fallbackWidth)}
      srcSet={srcSet}
      sizes={sizes ?? (priority ? '100vw' : '(min-width: 1024px) 50vw, 100vw')}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  );
}
