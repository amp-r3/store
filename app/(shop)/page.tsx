import type { Metadata } from 'next';
import { createStaticSupabaseClient } from '@/shared/api/supabase/server';
import { fetchCategories, fetchDealsProducts, fetchProducts } from '@/entities/product/server';
import type { ProductsResponse } from '@/entities/product/server';
import { HomePage } from '@/views/home-page';
import { getSiteOrigin } from '@/shared/config';

// Single fixed path, public data only (same anon-client rationale as
// /product/[id] and /catalog) — eligible for the same ISR treatment as the
// product page.
export const revalidate = 3600;

const ROW_LIMIT = 12;
const DEALS_LIMIT = 12;

const supabase = createStaticSupabaseClient();

export const metadata: Metadata = {
  alternates: { canonical: `${getSiteOrigin()}/` },
};

export default async function HomeRoutePage() {
  const categories = await fetchCategories(supabase);
  const realCategories = categories.filter((category) => category.slug !== 'all');

  const [deals, categoryProductsList] = await Promise.all([
    fetchDealsProducts(supabase, { limit: DEALS_LIMIT }),
    Promise.all(
      realCategories.map((category) =>
        fetchProducts(supabase, { category: category.name, page: 1, limit: ROW_LIMIT })
      )
    ),
  ]);

  const categoryProducts: Record<string, ProductsResponse> = {};
  realCategories.forEach((category, index) => {
    categoryProducts[category.slug] = categoryProductsList[index];
  });

  return (
    <HomePage
      initialCategories={categories}
      initialDeals={deals}
      initialCategoryProducts={categoryProducts}
    />
  );
}
