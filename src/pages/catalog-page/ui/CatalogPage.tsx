import { ControlPanel } from "@/widgets/control-panel";
import { useEffect } from 'react'
// Common components
import { Breadcrumbs, ErrorView, NoResults } from '@/shared/ui'
// Custom Components
// Custom Hooks
// Utils
// Types
import { ProductCardSkeleton } from '@/entities/product'
import { ControlPanelSkeleton } from '@/widgets/control-panel'
import { getErrorMessage, scrollToTop } from "@/shared/lib";
import { Product } from "@/entities/product";
import { useProductCatalog } from "@/entities/product";
import { Pagination } from "@/shared/ui";
import { ProductCard } from "@/entities/product";
import { WishlistToggleButton } from "@/features/wishlist-toggle";
import style from './catalog-page.module.scss';

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
      <div className={style.catalogPage__breadcrumbs}>
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Catalog' }]} />
      </div>

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
                actionSlot={<WishlistToggleButton productId={product.id} />}
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
          <NoResults query={products.query || undefined} />
        )
      }
    </main >
  )
}