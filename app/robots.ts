import type { MetadataRoute } from 'next';
import { getSiteOrigin } from '@/shared/config';

// /wishlist, /user/*, /checkout/*, /admin/* are handled via per-route
// `robots: { index: false }` metadata, not a disallow rule here — blocking
// them in robots.txt would stop crawlers from ever fetching the page, so
// they'd never see that noindex tag either. Letting them crawl-but-not-index
// is the documented-safe combination of the two mechanisms.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}
