'use client';

import { ControlPanel } from "@/widgets/control-panel";
import { useEffect } from 'react'
// Common components
import { ErrorView, NoResults, PageLayout, HOME_CRUMB } from '@/shared/ui'
// Custom Components
// Custom Hooks
// Utils
// Types
import { ProductCardSkeleton } from '@/entities/product'
import { ControlPanelSkeleton } from '@/widgets/control-panel'
import { getErrorMessage, scrollToTop } from "@/shared/lib";
import { Product, ProductsResponse, Categories } from "@/entities/product";
import { useProductCatalog } from "../model/useProductCatalog";
import { Pagination } from "@/shared/ui";
import { ProductCard } from "@/entities/product";
import { WishlistToggleButton } from "@/features/wishlist-toggle";

interface CatalogPageProps {
  initialProducts?: ProductsResponse;
  initialCategories?: Categories;
}

export const CatalogPage = ({ initialProducts, initialCategories }: CatalogPageProps = {}) => {
  const { products, status, filters } = useProductCatalog(initialProducts, initialCategories);

  const onPageChange = (newPage: number) => {
    filters.setPage(newPage)
  }

  useEffect(() => {
    scrollToTop()
  }, [filters.page]);

  if (status.productsError) {
    const errorMessage = getErrorMessage(status.productsError);
    return <ErrorView error={errorMessage} />
  }

  return (
    <PageLayout breadcrumbs={[HOME_CRUMB, { label: 'Catalog' }]}>
      {
        status.productsLoading || status.categoriesLoading ? <ControlPanelSkeleton /> :
          <ControlPanel
            clearAll={filters.clearAllFilters}
            sortingOptions={filters.sortingOptions}
            changeSort={filters.changeSort}
            activeSortOption={filters.activeSortOption}
            categoryOptions={filters.categories}
            changeCategory={filters.changeCategory}
            activeCategoryOption={filters.activeCategoryOption || null}
            isFetching={!!(status.productsFetching || status.categoriesFetching)}
            isDealsActive={filters.isDealsActive}
            toggleDeals={filters.toggleDeals}
          />
      }

      <div
        className={`content ${status.productsFetching && !status.productsLoading ? 'fetching-state' : ''}`}
      >
        {products.items.map((product: Product | undefined, index: number) => {
          const isFakeItem = product === undefined || status.productsLoading;
          return (
            isFakeItem ? <ProductCardSkeleton key={`skeleton-${index}`} /> :
              <ProductCard
                key={product.id}
                product={product as Product}
                priority={index < 8}
                actionSlot={<WishlistToggleButton productId={product.id} price={(product as Product).price} />}
              />
          )
        })}
      </div>

      {
        !status.isEmpty && (
          <Pagination
            totalItems={products.total}
            currentPage={filters.page}
            itemsPerPage={12}
            onPageChange={onPageChange}
          />
        )
      }

      {
        status.isEmpty && (
          <NoResults
            query={products.query || undefined}
            description={
              filters.isDealsActive
                ? 'No discounted items right now — check back soon or browse the full catalog.'
                : undefined
            }
          />
        )
      }
    </PageLayout>
  )
}