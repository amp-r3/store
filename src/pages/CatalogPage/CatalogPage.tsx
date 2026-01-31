// Common components
import { ErrorView, Loader, NoResults } from '@/components/common'
// Custom Components
import { Pagination, ProductCard, SortPanel } from '@/components/products'
// Custom Hooks
import { useProductCatalog, useSort } from '@/hooks'
// Utils
import { getErrorMessage, scrollToTop } from '@/utils'
// Redux hooks
import { useAppDispatch } from '@/hooks/redux'
import { addToCart } from '@/store/slices/cartSlice'
// Styles
import style from './catalogPage.module.scss'
// Types
import { Product } from '@/types/products'

export const CatalogPage = () => {
  const {
    productsArray,
    setPage,
    page,
    isLoading,
    isFetching,
    totalItems,
    query,
    error
  } = useProductCatalog();

  const { changeSort, sortingOptions, activeSortOption } = useSort()
  const dispatch = useAppDispatch()

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product))
  }

  const onPageChange = (newPage: number) => {
    setPage(newPage)
    scrollToTop()
  }

  if (isLoading) {
    return <Loader />
  }

  if (error) {
    const errorMessage = getErrorMessage(error);
    return <ErrorView error={errorMessage}/>
  }

  return (
    <main className='container'>
      <SortPanel
        sortingOptions={sortingOptions}
        changeSort={changeSort}
        activeSortOption={activeSortOption}
      />

      {/* Ux Fix*/}
      <div
        className={style.content}
        style={{ opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.2s' }}
      >
        {productsArray.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            handleAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {productsArray.length > 0 && (
        <Pagination
          totalItems={totalItems}
          currentPage={page}
          itemsPerPage={12}
          onPageChange={onPageChange}
        />
      )}

      {productsArray.length === 0 && !isFetching && (
        <NoResults query={query} />
      )}
    </main>
  )
}