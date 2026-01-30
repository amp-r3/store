// Common components
import { ErrorView, Loader, NoResults } from '@/components/common'
// Custom Components
import { Pagination, ProductCard, SortPanel } from '@/components/products'
// Custom Hooks
import { useProductCatalog, useSort } from '@/hooks'
// Utils
import { scrollToTop } from '@/utils'
// Redux hooks
import { useAppDispatch } from '@/hooks/redux'
// Redux slice
import { addToCart } from '@/store/slices/cartSlice'
// Styles
import style from './catalogPage.module.scss'
// Types
import { Product } from '@/types/products'

export const CatalogPage = () => {
  const { productsToDisplay, setPage, page, status, totalItems, query, error } = useProductCatalog();
  const { changeSort, sortingOptions, activeSortOption } = useSort()
  const dispatch = useAppDispatch()

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product))
  }


  const onPageChange = (page) => {
    setPage(page)
    if (productsToDisplay) {
      setTimeout(() => {
        scrollToTop()
      }, 150);
    }
  }

  if (status === 'loading') {
    return (
      <Loader />
    )
  }
  if (status === 'failed') {
    return (<ErrorView />)
  }
  if (status === 'succeeded') {
    return (
      <main className='container'>
        <SortPanel
          sortingOptions={sortingOptions}
          changeSort={changeSort}
          activeSortOption={activeSortOption}
        />
        <div className={style.content}>
          {
            productsToDisplay.map((product: Product) => (
              <ProductCard key={product.id} product={product} handleAddToCart={handleAddToCart} />
            ))
          }
        </div>
        <Pagination
          totalItems={totalItems}
          currentPage={page}
          itemsPerPage={12}
          onPageChange={onPageChange}
        />
        {
          productsToDisplay.length === 0 && (
            <NoResults query={query} />
          )
        }
      </main>
    )
  }

  return <Loader />;
}