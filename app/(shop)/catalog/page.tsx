import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticSupabaseClient } from '@/shared/api/supabase/server';
import { fetchProducts, fetchCategories, sortingOptions } from '@/entities/product/server';
import type { ProductParams, ProductsResponse, Categories } from '@/entities/product/server';
import { catalogParamsSchema } from '@/features/product-filter/server';
import { CatalogPage } from '@/views/catalog-page';
import { getSiteOrigin } from '@/shared/config';

// Combinatorial filter/sort/page URL space, not a fixed set of ids — no
// generateStaticParams/revalidate here, unlike /product/[id]. Always
// server-rendered fresh per request.
export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 12;

type CatalogSearchParams = Record<string, string | string[] | undefined>;

// Same public data, same anon client rationale as /product/[id] — see that
// page's comment.
const supabase = createStaticSupabaseClient();

function readParam(searchParams: CatalogSearchParams, key: string): string | null {
  const value = searchParams[key];
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

// Mirrors views/catalog-page/model/useProductCatalog.ts + features/product-filter's
// useFilters param resolution (schema parse -> sort-pair match -> category-slug
// validation), kept as a separate small function rather than a shared import so
// this Server Component doesn't reach into those hooks' client-only module graph
// (see entities/product/server.ts for why that breaks the RSC boundary).
function resolveParams(searchParams: CatalogSearchParams, categories: Categories) {
  const parsed = catalogParamsSchema.parse({
    page: readParam(searchParams, 'page'),
    sortBy: readParam(searchParams, 'sortBy'),
    order: readParam(searchParams, 'order'),
    category: readParam(searchParams, 'category'),
    deals: readParam(searchParams, 'deals'),
  });

  const activeSortOption = sortingOptions.find(
    (option) => option.sortBy === parsed.sortBy && option.order === parsed.order
  ) ?? sortingOptions[0];

  const categoryExists = parsed.category === 'all' || categories.some((c) => c.slug === parsed.category);
  const finalCategorySlug = categoryExists ? parsed.category : 'all';
  const categoryName = categories.find((c) => c.slug === finalCategorySlug)?.name;

  const search = readParam(searchParams, 'q');

  const params: ProductParams = { page: parsed.page };
  if (search) params.search = search;
  if (activeSortOption.sortBy) {
    params.sortBy = activeSortOption.sortBy;
    params.order = activeSortOption.order;
  }
  if (finalCategorySlug !== 'all' && categoryName) params.category = categoryName;
  if (parsed.deals) params.deals = true;

  return { params, page: parsed.page };
}

interface CatalogRouteProps {
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ searchParams }: CatalogRouteProps): Promise<Metadata> {
  const sp = await searchParams;
  const search = readParam(sp, 'q');
  const categorySlug = readParam(sp, 'category');

  let title = 'Catalog';
  if (search) {
    title = `Search results for "${search}" — Catalog`;
  } else if (categorySlug && categorySlug !== 'all') {
    const categories = await fetchCategories(supabase);
    const categoryName = categories.find((c) => c.slug === categorySlug)?.name;
    if (categoryName) title = `${categoryName} — Catalog`;
  }

  return {
    title,
    // Canonicalize every filter/sort/page combination to the base listing —
    // they're all views over the same underlying data, so this avoids
    // duplicate-content signals from the combinatorial URL space.
    alternates: { canonical: `${getSiteOrigin()}/catalog` },
  };
}

export default async function CatalogRoutePage({ searchParams }: CatalogRouteProps) {
  const sp = await searchParams;
  const categories = await fetchCategories(supabase);
  const { params, page } = resolveParams(sp, categories);

  let initialProducts: ProductsResponse;
  try {
    initialProducts = await fetchProducts(supabase, params);
  } catch (err) {
    // Postgrest errors (rather than returning an empty page) when the
    // requested .range() offset exceeds the actual row count — the same
    // PGRST103 the client side already treats as "out of bounds" in
    // useProductCatalog.ts. Server-side there's no page to auto-correct to,
    // so this is exactly the "page > totalPages" case the plan calls for.
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'PGRST103') {
      notFound();
    }
    throw err;
  }

  const totalPages = Math.ceil(initialProducts.total / ITEMS_PER_PAGE);
  if (initialProducts.total > 0 && page > totalPages) notFound();

  return <CatalogPage initialProducts={initialProducts} initialCategories={categories} />;
}
