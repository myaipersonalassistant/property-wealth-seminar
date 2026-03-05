import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  SITE_URL,
  absUrl,
  eventJsonLd,
} from '@/lib/seo';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
  /** Include Event JSON-LD (homepage, booking, etc.) */
  jsonLdEvent?: boolean;
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = '/marketing.jpg',
  noindex = false,
  jsonLdEvent = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical
    ? canonical.startsWith('http')
      ? canonical
      : `${SITE_URL.replace(/\/$/, '')}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : undefined;
  const imageUrl = absUrl(image);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {/* JSON-LD */}
      {jsonLdEvent && (
        <script type="application/ld+json">
          {JSON.stringify(eventJsonLd())}
        </script>
      )}
    </Helmet>
  );
}
