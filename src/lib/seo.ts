/**
 * SEO config and helpers for the Build Wealth Through Property seminar site.
 */

export const SITE_NAME = 'Build Wealth Through Property';
export const DEFAULT_DESCRIPTION =
  'Join property investor and author Chris Ifonlaja for a 3-hour seminar exploring how real estate builds wealth, security, and long-term stability. Book your seat — £25. Belfast, March 2026.';
export const BASE_PATH = typeof window !== 'undefined' ? window.location.origin : '';
export const SITE_URL = import.meta.env.VITE_SITE_URL || BASE_PATH;

/** Get absolute URL for og:image and similar. */
export function absUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = SITE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Event details for JSON-LD structured data. */
export const EVENT = {
  name: 'Build Wealth Through Property Seminar',
  description:
    'Join property investor and author Chris Ifonlaja, alongside a panel of experienced property professionals, for a powerful and practical seminar exploring how people can use property to build long-term financial security.',
  startDate: '2026-03-14T14:00:00+00:00',
  endDate: '2026-03-14T17:00:00+00:00',
  location: {
    name: 'Europa Hotel',
    address: {
      streetAddress: 'Great Victoria Street',
      addressLocality: 'Belfast',
      postalCode: 'BT2 7AP',
      addressCountry: 'GB',
    },
  },
  offers: {
    price: '25',
    priceCurrency: 'GBP',
  },
};

/** Generate JSON-LD for Event schema. URLs are computed at call time for correct origin. */
export function eventJsonLd() {
  const base = SITE_URL.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: EVENT.name,
    description: EVENT.description,
    startDate: EVENT.startDate,
    endDate: EVENT.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: EVENT.location.name,
      address: {
        '@type': 'PostalAddress',
        ...EVENT.location.address,
      },
    },
    offers: {
      '@type': 'Offer',
      price: EVENT.offers.price,
      priceCurrency: EVENT.offers.priceCurrency,
      url: `${base}/booking`,
    },
    image: absUrl('/marketing.jpg'),
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}
