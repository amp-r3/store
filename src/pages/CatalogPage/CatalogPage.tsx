import { useEffect } from 'react'
// Common components
import { ErrorView, NoResults } from '@/components/common'
// Custom Components
import { Pagination, ProductCard, ControlPanel } from '@/components/products'
// Custom Hooks
import { useFilters, useProductCatalog } from '@/hooks'
// Utils
import { getErrorMessage, scrollToTop } from '@/utils'
// Types
import { Product } from '@/types/products'

export const CatalogPage = () => {
  const {
    productsArray,
    setPage,
    page,
    productsLoading,
    productsFetching,
    categoriesLoading,
    categoriesFetching,
    totalItems,
    query,
    productsError,
    categories,
  } = useProductCatalog();

  const {
    changeSort,
    sortingOptions,
    activeSortOption,
    changeCategory,
    activeCategoryOption,
    clearAllFilters
  } = useFilters();

  const onPageChange = (newPage: number) => {
    setPage(newPage)
  }

  useEffect(() => {
    scrollToTop()
  }, [page]);

  if (productsError) {
    const errorMessage = getErrorMessage(productsError);
    return <ErrorView error={errorMessage} />
  }

  return (
    <main className='container'>
      <ControlPanel
        clearAll={clearAllFilters}
        sortingOptions={sortingOptions}
        changeSort={changeSort}
        activeSortOption={activeSortOption}
        categoryOptions={categories}
        changeCategory={changeCategory}
        activeCategoryOption={activeCategoryOption}
        isLoading={productsLoading || categoriesLoading}
        isFetching={productsFetching || categoriesFetching}
      />

      <div
        className={`content ${productsFetching && !productsLoading ? 'fetching-state' : ''}`}
      >
        {productsArray.map((product: Product | undefined, index) => {
          const isFakeItem = product === undefined;
          return (
            <ProductCard
              key={isFakeItem ? `skeleton-${index}` : product.id}
              product={isFakeItem ? null : product}
              priority={index < 8}
              isLoading={productsLoading}
            />
          )
        })}
      </div>

      {
        productsArray.length > 0 && (
          <Pagination
            totalItems={totalItems}
            currentPage={page}
            itemsPerPage={12}
            onPageChange={onPageChange}
          />
        )
      }

      {
        productsArray.length === 0 && !productsFetching && (
          <NoResults query={query} />
        )
      }
    </main >
  )
}