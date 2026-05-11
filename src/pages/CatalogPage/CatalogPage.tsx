import { useEffect } from 'react'
// Common components
import { ErrorView, NoResults } from '@/components/common'
// Custom Components
import { Pagination, ProductCard, ControlPanel } from '@/components/products'
// Custom Hooks
import { useProductCatalog } from '@/hooks'
// Utils
import { getErrorMessage, scrollToTop } from '@/utils'
// Types
import { Product } from '@/types/products'
import { ProductCardSkeleton } from '@/components/products/ProductCard/ProductCardSkeleton'
import { ControlPanelSkeleton } from '@/components/products/ControlPanel/ControlPanelSkeleton'

export const CatalogPage = () => {
  const { products, status, filters } = useProductCatalog();

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
    <main className='container'>
      {
        status.productsLoading || status.categoriesLoading ? <ControlPanelSkeleton /> :
          <ControlPanel
            clearAll={filters.clearAllFilters}
            sortingOptions={filters.sortingOptions}
            changeSort={filters.changeSort}
            activeSortOption={filters.activeSortOption}
            categoryOptions={filters.categories}
            changeCategory={filters.changeCategory}
            activeCategoryOption={filters.activeCategoryOption}
            isFetching={status.productsFetching || status.categoriesFetching}
          />
      }

      <div
        className={`content ${status.productsFetching && !status.productsLoading ? 'fetching-state' : ''}`}
      >
        {products.items.map((product: Product | undefined, index) => {
          const isFakeItem = product === undefined || status.productsLoading;
          return (
            isFakeItem ? <ProductCardSkeleton key={`skeleton-${index}`} /> :
              <ProductCard
                key={product.id}
                product={isFakeItem ? null : product}
                priority={index < 8}
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
          <NoResults query={products.query} />
        )
      }
    </main >
  )
}