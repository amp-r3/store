import type { MetadataRoute } from 'next';
import { createStaticSupabaseClient } from '@/shared/api/supabase/server';
import { fetchProducts } from '@/entities/product/server';
import { getSiteOrigin } from '@/shared/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const supabase = createStaticSupabaseClient();
  // Catalog is small enough for now that one page covers every product;
  // revisit with real pagination if it grows past this.
  const { ids } = await fetchProducts(supabase, { limit: 1000 });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${origin}/catalog`, changeFrequency: 'daily', priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${origin}/product/${id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
