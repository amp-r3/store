'use client';

import { PageLayout, HOME_CRUMB } from '@/shared/ui';
import { ControlPanelSkeleton } from '@/widgets/control-panel';
import { ProductCardSkeleton } from '@/entities/product';

// Shadows app/(shop)/loading.tsx's generic Loader for this segment. Catalog
// is force-dynamic, so every filter/sort/page change (a searchParams-only
// navigation) re-fetches server-side and would otherwise show that generic
// spinner instead of the grid skeleton CatalogPage used to show client-side.
const SKELETON_CARDS = 12;

export default function CatalogLoading() {
  return (
    <PageLayout breadcrumbs={[HOME_CRUMB, { label: 'Catalog' }]}>
      <ControlPanelSkeleton />
      <div className="content">
        {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </PageLayout>
  );
}
