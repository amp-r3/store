'use client';

import { ProductPageSkeleton } from '@/views/product-page';

// Shadows app/(shop)/loading.tsx's generic Loader for this segment — only
// shown for a product id outside generateStaticParams (on-demand ISR
// generation blocks on the fetch); pre-generated ids navigate instantly.
export default function ProductLoading() {
  return <ProductPageSkeleton />;
}
