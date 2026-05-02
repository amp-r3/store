import { useEffect } from 'react'
// Common components
import { ErrorView, Loader, NoResults } from '@/components/common'
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

  if (productsLoading) {
    return <Loader />
  }

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
      />

      <div
        className='content'
        style={{ opacity: productsFetching ? 0.5 : 1, transition: 'opacity 0.2s' }}
      >
        {productsArray.map((product: Product, index) => {
          return (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 8}
            />
          )
        })}
      </div>

      {productsArray.length > 0 && (
        <Pagination
          totalItems={totalItems}
          currentPage={page}
          itemsPerPage={12}
          onPageChange={onPageChange}
        />
      )}

      {productsArray.length === 0 && !productsFetching && (
        <NoResults query={query} />
      )}
    </main>
  )
}