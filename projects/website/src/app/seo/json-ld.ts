import { APPS, appId } from '../data/apps';
import { SOCIAL_LINKS } from '../data/social-links';
import { LOCALES, SITE } from './site.config';

export type JsonLd = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE.origin}/#organization`;

export const organizationJsonLd = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE.name,
  url: `${SITE.origin}/`,
  logo: `${SITE.origin}/icons/icon-512.png`,
  foundingLocation: {
    '@type': 'Place',
    address: { '@type': 'PostalAddress', addressCountry: 'DE' },
  },
  // The same array that renders /socials/, so a channel exists in the knowledge graph only if a
  // visitor can reach it from the page.
  sameAs: SOCIAL_LINKS.map(link => link.href),
});

export const webSiteJsonLd = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.origin}/#website`,
  name: SITE.name,
  url: `${SITE.origin}/`,
  publisher: { '@id': ORGANIZATION_ID },
  inLanguage: LOCALES.map(locale => locale.code),
});

export const appsItemListJsonLd = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: APPS.map((entry, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': entry.type,
      '@id': appId(entry.slug),
      name: entry.name,
      description: entry.description,
      url: entry.url,
      applicationCategory: entry.applicationCategory,
      operatingSystem: entry.operatingSystem,
      author: { '@id': ORGANIZATION_ID },
      ...(entry.codeRepository ? { codeRepository: entry.codeRepository } : {}),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
  })),
});
