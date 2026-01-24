// UI components
import { Loader, Pagination, ErrorView, NoResults } from '@/components/ui'

// Product Feature Components
import { ProductCard, SortPanel } from '@/features/products/components'

// Custom Hooks
import { useProductCatalog } from '@/hooks'

// Utils
import { scrollToTop } from '@/utils'

// Styles
import style from './catalogPage.module.scss'

// Types
import { Product } from '@/types/products'

const CatalogPage = () => {
  const { productsToDisplay, setPage, page, status, totalItems } = useProductCatalog();


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
        <SortPanel />
        <div className={style.content}>
          {
            productsToDisplay.map((product: Product) => (
              <ProductCard key={product.id} {...product} />
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
            <NoResults />
          )
        }
      </main>
    )
  }

  return <Loader />;
}

export default CatalogPage