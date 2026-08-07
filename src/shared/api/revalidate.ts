'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from './supabase/authz';

// / and /product/[id] are ISR (revalidate = 3600) — RTK Query's own
// invalidatesTags only flushes the browser tab's cache, never Next's Full
// Route Cache, so without these a price/stock/archive change from the admin
// (or a new review, or an order that consumes stock) stays stale in the
// server-rendered HTML — and to crawlers — for up to an hour. Call these
// from onQueryStarted after the mutation that changed the underlying row.
//
// Framework CSRF/body-size checks are not a substitute for checking the
// caller here: a Server Action is a public POST endpoint regardless of
// whether any UI actually calls it.

const MAX_BATCH = 100;

function assertProductId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('productId must be a positive integer');
  }
}

/** Any signed-in user — reachable from review/order mutations, not just admin. */
async function assertSignedIn(): Promise<void> {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
}

async function assertAdmin(): Promise<void> {
  const session = await getServerSession();
  if (!session?.isAdmin) {
    throw new Error('Forbidden');
  }
}

export async function revalidateProduct(productId: number): Promise<void> {
  await assertSignedIn();
  assertProductId(productId);

  revalidatePath(`/product/${productId}`);
  revalidatePath('/');
}

/** Server Actions dispatch sequentially per client (see Next's docs), so a
 * multi-item order revalidates in one call rather than one per line item. */
export async function revalidateProducts(productIds: number[]): Promise<void> {
  await assertSignedIn();

  if (!Array.isArray(productIds) || productIds.length === 0 || productIds.length > MAX_BATCH) {
    throw new Error(`productIds must be a non-empty array of at most ${MAX_BATCH} ids`);
  }
  productIds.forEach(assertProductId);

  for (const productId of productIds) {
    revalidatePath(`/product/${productId}`);
  }
  revalidatePath('/');
}

/** Admin-only fan-out: category changes and new/archived products affect
 * which products the home page and sitemap show, not just one product page. */
export async function revalidateStorefront(): Promise<void> {
  await assertAdmin();

  revalidatePath('/');
  revalidatePath('/product/[id]', 'page');
  revalidatePath('/sitemap.xml');
}
