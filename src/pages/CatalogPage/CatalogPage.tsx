// Common components
import { ErrorView, Loader, NoResults } from '@/components/common'
// Custom Components
import { Pagination, ProductCard, ControlPanel } from '@/components/products'
// Custom Hooks
import { useFilters, useProductCatalog } from '@/hooks'
// Utils
import { getErrorMessage, scrollToTop } from '@/utils'
// Redux hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { addToCart } from '@/store/slices/cartSlice'
// Styles
import style from './catalogPage.module.scss'
// Types
import { Product } from '@/types/products'
import { selectCartItems } from '@/store'

export const CatalogPage = () => {
  const {
    productsArray,
    setPage,
    page,
    isLoading,
    isFetching,
    totalItems,
    query,
    error,
  } = useProductCatalog();

  const { 
    changeSort,
    sortingOptions,
    activeSortOption,
    changeCategory,
    categoryOptions,
    activeCategoryOption,
    clearAllFilters 
  } = useFilters();
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector(selectCartItems);

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
    return <ErrorView error={errorMessage} />
  }

  return (
    <main className='container'>
      <ControlPanel
        clearAll={clearAllFilters}
        searchQuery={query}
        sortingOptions={sortingOptions}
        changeSort={changeSort}
        activeSortOption={activeSortOption}
        categoryOptions={categoryOptions}
        changeCategory={changeCategory}
        activeCategoryOption={activeCategoryOption}
      />

      <div
        className={style.content}
        style={{ opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.2s' }}
      >
        {productsArray.map((product: Product) => {
          const itemInCart = cartItems.filter(item => item.id === product.id);
          
          return (
            <ProductCard
              key={product.id}
              product={product}
              itemInCart={itemInCart}
              handleAddToCart={handleAddToCart}
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

      {productsArray.length === 0 && !isFetching && (
        <NoResults query={query} />
      )}
    </main>
  )
}