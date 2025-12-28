// UI components
import { Loader, Pagination, ErrorView, NoResults } from '@/components/ui'

// Product Feature Components
import { ProductCard, SortPanel } from '@/features/products/components'

// Custom Hooks
import { useProductCatalog } from '@/hooks'

// Styles
import style from './catalogPage.module.scss'
import { scrollToTop } from '@/features/products/utils'

const CatalogPage = () => {
  const { productsToDisplay, setCurrentSortId, currentSortId, setCurrentPage, currentPage, isSearchActive, status, sortingOptions, activeSortOption } = useProductCatalog();

  const onPageChange = (page) => {
    setCurrentPage(page)
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
        {!isSearchActive && (
          <SortPanel
            options={sortingOptions}
            currentSort={currentSortId}
            activeSortOption={activeSortOption.label}
            onSortChange={setCurrentSortId}
          />
        )}
        <div className={style.content}>
          {
            productsToDisplay.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          }
        </div>
        {
          !isSearchActive && (
            <Pagination
              totalItems={200}
              currentPage={currentPage}
              itemsPerPage={12}
              onPageChange={onPageChange}
            />
          )
        }
        {
          isSearchActive && productsToDisplay.length === 0 && (
            <NoResults />
          )
        }
      </main>
    )
  }

  return <Loader />;
}

export default CatalogPage