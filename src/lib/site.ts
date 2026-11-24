/**
 * Single source of truth for the public site origin and structured data.
 *
 * Set VITE_SITE_URL in the environment before deploying so canonical URLs,
 * Open Graph URLs and the generated sitemap all point at the live domain.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.ecohealth.rw').replace(/\/+$/, '');

export const SITE_NAME = 'EcoHealth & Transport Solutions Ltd';
export const SITE_TAGLINE = 'Safe People. Healthy Environment. Sustainable Future.';
export const SITE_DESCRIPTION =
  'EHS consultancy, transport and logistics, PPE supply, rigging and lifting services, and professional safety training for projects in Rwanda.';

export const DEFAULT_OG_IMAGE = '/og-image.png';

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

export function canonicalPath(path: string): string {
  const clean = path.split('?')[0].split('#')[0];
  if (clean === '' || clean === '/') return '/';
  return clean.replace(/\/+$/, '');
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function serviceJsonLd(service: { title: string; summary: string; slug: string; image?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    serviceType: service.title,
    areaServed: { '@type': 'Country', name: 'Rwanda' },
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    url: absoluteUrl(`/services/${service.slug}`),
    ...(service.image ? { image: absoluteUrl(service.image) } : {}),
  };
}

export function articleJsonLd(article: {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    mainEntityOfPage: absoluteUrl(`/insights/${article.slug}`),
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      ...(article.image ? { logo: { '@type': 'ImageObject', url: absoluteUrl(article.image) } } : {}),
    },
    ...(article.image ? { image: absoluteUrl(article.image) } : {}),
  };
}

export function organizationJsonLd(contact?: {
  phone?: string;
  email?: string;
  address?: string;
  linkedinUrl?: string;
}) {
  const hasContact = Boolean(contact?.phone || contact?.email);
  return {
    '@context': 'https://schema.org',
    '@type': hasContact ? ['Organization', 'LocalBusiness'] : 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    areaServed: { '@type': 'Country', name: 'Rwanda' },
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.phone ? { telephone: contact.phone } : {}),
    ...(contact?.address
      ? { address: { '@type': 'PostalAddress', streetAddress: contact.address, addressCountry: 'RW' } }
      : {}),
    ...(contact?.linkedinUrl ? { sameAs: [contact.linkedinUrl] } : {}),
  };
}
