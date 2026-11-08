import { useEffect } from 'react';
import { absoluteUrl, canonicalPath, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/site';

interface SEOProps {
  title: string;
  description: string;
  /** Route path, e.g. `/services/ehs-consultancy`. Query strings are ignored. */
  path?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  image?: string;
  publishedTime?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const JSON_LD_ID = 'page-structured-data';

export function SEO({
  title,
  description,
  path = '/',
  ogType = 'website',
  noIndex = false,
  image = DEFAULT_OG_IMAGE,
  publishedTime,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const canonical = absoluteUrl(canonicalPath(path));
    const ogImage = absoluteUrl(image);

    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', 'en_RW');
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:image:alt', title);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    if (publishedTime) setMeta('property', 'article:published_time', publishedTime);

    if (noIndex) {
      removeLink('canonical');
      removeMeta('property', 'og:url');
    } else {
      setMeta('property', 'og:url', canonical);
      setLink('canonical', canonical);
    }

    if (jsonLd) setJsonLd(jsonLd);
    else removeJsonLd();
  }, [title, description, path, ogType, noIndex, image, publishedTime, jsonLd]);

  return null;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function removeLink(rel: string) {
  document.querySelector(`link[rel="${rel}"]`)?.remove();
}

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = JSON_LD_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  document.getElementById(JSON_LD_ID)?.remove();
}
