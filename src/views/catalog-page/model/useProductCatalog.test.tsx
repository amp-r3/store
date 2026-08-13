import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { SupabaseStub } from '@test/supabaseStub';
import { createTestStore, AppStore } from '@test/renderWithProviders';
import { makeProduct, makeCategory } from '@test/fixtures';
import { supabase } from '@/shared/api/supabase/client';
import { ProductsResponse, Categories } from '@/entities/product';
import { useProductCatalog } from './useProductCatalog';

// catalogDerivation.test.ts already covers buildProductParams/
// computeShouldSkip/deriveCatalogStatus in isolation — this file covers the
// composition: the SSR-fallback -> live-data handoff, the ?q= URL param,
// and the out-of-bounds-page skip wired through to usePaginationBounds.

vi.mock('@/shared/api/supabase/client', async () => {
  const { createSupabaseStub } = await import('@test/supabaseStub');
  return { supabase: createSupabaseStub() };
});

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}));

let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/catalog',
  useSearchParams: () => searchParams,
}));

const supabaseStub = supabase as unknown as SupabaseStub;

const wrapperFor = (store: AppStore) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

const toResponse = (products: ReturnType<typeof makeProduct>[]): ProductsResponse => ({
  items: Object.fromEntries(products.map((p) => [p.id, p])),
  ids: products.map((p) => p.id),
  total: products.length,
});

beforeEach(() => {
  supabaseStub.__reset();
  searchParams = new URLSearchParams();
  // A stateful push/replace, not a no-op: usePaginationBounds corrects an
  // out-of-bounds page by calling filters.setPage, which flows through
  // useTransitionRouter's startTransition. If the mocked router never
  // actually updates the URL, currentPage never changes and that effect
  // refires forever (the same class of infinite-loop bug 0b7f8ee fixed in
  // production) — so the mock must behave like real navigation here.
  router.push.mockReset().mockImplementation((href: string) => {
    searchParams = new URLSearchParams(href.split('?')[1] ?? '');
  });
  router.replace.mockReset().mockImplementation((href: string) => {
    searchParams = new URLSearchParams(href.split('?')[1] ?? '');
  });
});

describe('useProductCatalog — SSR fallback', () => {
  it('shows the server-provided initial products/categories before the client query resolves, then the live result', async () => {
    const initialProduct = makeProduct({ id: 1, title: 'Server Product' });
    const initialProducts = toResponse([initialProduct]);
    const initialCategories: Categories = [makeCategory({ slug: 'apparel', name: 'Apparel' })];

    const liveProduct = makeProduct({ id: 2, title: 'Live Product' });
    supabaseStub.__setTable('products_view', { data: [liveProduct], count: 1 });
    supabaseStub.__setTable('categories', { data: [{ slug: 'shoes', name: 'Shoes' }] });

    const { result } = renderHook(() => useProductCatalog(initialProducts, initialCategories), {
      wrapper: wrapperFor(createTestStore()),
    });

    // Synchronously, before the async queryFn's promise settles: the SSR
    // fallback is what's shown.
    expect(result.current.products.items).toEqual([initialProduct]);

    await waitFor(() =>
      expect(result.current.products.items.map((p) => p.title)).toEqual(['Live Product']),
    );
  });
});

describe('useProductCatalog — URL-driven query', () => {
  it('forwards ?q= as the products.query', () => {
    searchParams = new URLSearchParams('q=sneakers');
    supabaseStub.__setTable('products_view', { data: [], count: 0 });

    const { result } = renderHook(() => useProductCatalog(), {
      wrapper: wrapperFor(createTestStore()),
    });

    expect(result.current.products.query).toBe('sneakers');
  });
});

describe('useProductCatalog — out-of-bounds page', () => {
  it('self-corrects an out-of-bounds URL page via usePaginationBounds and queries the corrected page, never the stale one', async () => {
    searchParams = new URLSearchParams('page=5');
    const initialProducts = toResponse([makeProduct({ id: 1 })]); // total: 1 -> 1 page at 12/page
    supabaseStub.__setTable('products_view', { data: [], count: 1 });

    const { result } = renderHook(() => useProductCatalog(initialProducts), {
      wrapper: wrapperFor(createTestStore()),
    });

    // usePaginationBounds corrects page 5 (past the single known page) back
    // to page 1 — computeShouldSkip keeps the products query from ever
    // being requested for the stale, out-of-bounds page in the meantime.
    await waitFor(() => expect(result.current.filters.page).toBe(1));

    const rangeCalls = supabaseStub
      .__getCalls('products_view')
      .filter((call) => call.method === 'range');
    // range(0, 11) is page 1 at 12/page; range(48, 59) would be the stale page 5.
    expect(rangeCalls).toEqual([{ table: 'products_view', method: 'range', args: [0, 11] }]);
  });
});
