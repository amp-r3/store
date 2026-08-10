import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticSupabaseClient } from '@/shared/api/supabase/server';
import {
  fetchProductById,
  fetchSizes,
  fetchCategories,
  fetchProducts,
} from '@/entities/product/server';
import type { Product } from '@/entities/product/server';
import { fetchReviews, fetchReviewStats, REVIEWS_PAGE_SIZE } from '@/entities/review/server';
import { ProductPage } from '@/views/product-page';
import { getSiteOrigin } from '@/shared/config';

// ISR: pages for ids outside generateStaticParams are still generated
// on-demand on first request (dynamicParams defaults to true) and then
// cached for `revalidate` seconds, same as the pre-generated ones.
export const revalidate = 3600;

// Product/review data here is public and must render identically for every
// visitor, since the output is a shared ISR cache entry, not a per-request
// response — the cookie-aware client (createServerSupabaseClient, which
// calls next/headers' cookies()) would both be semantically wrong here
// (baking one visitor's session into a page served to everyone) and force
// the whole route dynamic, since touching a Dynamic API during render opts
// a route out of static generation. Purchase status (genuinely per-user)
// stays a client-side query, same as before.
const supabase = createStaticSupabaseClient();

export async function generateStaticParams() {
  const { ids } = await fetchProducts(supabase, { limit: 100 });
  return ids.map((id) => ({ id: String(id) }));
}

interface ProductRouteProps {
  params: Promise<{ id: string }>;
}

// Deduped across generateMetadata + the page component for the same request.
const loadProduct = cache(async (id: string): Promise<Product | null> => {
  try {
    return await fetchProductById(supabase, Number(id));
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) return {};

  const url = `${getSiteOrigin()}/product/${id}`;
  const image = product.images[0];

  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: product.title,
      description: product.description,
      url,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductRoutePage({ params }: ProductRouteProps) {
  const { id } = await params;

  const product = await loadProduct(id);
  // For an id outside generateStaticParams, app/(shop)/loading.tsx's Suspense
  // boundary means the response has already started streaming as 200 by the
  // time this resolves — notFound() still renders the right UI and Next
  // injects <meta name="robots" content="noindex">, so it won't get indexed,
  // but the HTTP status itself can't retroactively become a real 404 (Next's
  // documented streaming trade-off). A true 404 status would need an
  // existence check in proxy.ts before every product request — not worth
  // paying that latency/DB-load cost on every real page view for this.
  if (!product) notFound();

  const numericId = product.id;

  const [sizes, categories, reviewStats, reviews] = await Promise.all([
    fetchSizes(supabase, numericId),
    fetchCategories(supabase),
    fetchReviewStats(supabase, numericId),
    fetchReviews(supabase, {
      productId: numericId,
      page: 1,
      limit: REVIEWS_PAGE_SIZE,
      sort: 'newest',
      rating: null,
    }),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      url: `${getSiteOrigin()}/product/${id}`,
      priceCurrency: 'USD',
      price: product.price,
      availability:
        product.availabilityStatus === 'Out of Stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
    ...(reviewStats.total > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: reviewStats.total,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Product fields are admin-authored, not raw user input; escaping
        // `<` is still cheap insurance against breaking out of the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductPage
        product={product}
        sizes={sizes}
        categories={categories}
        initialReviewStats={reviewStats}
        initialReviews={reviews}
      />
    </>
  );
}
