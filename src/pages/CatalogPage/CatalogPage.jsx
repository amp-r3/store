import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

// UI components
import { Loader, Pagination, ErrorView, NoResults } from '@/components/ui'

// Product Feature Components
import { ProductCard, SortPanel } from '@/features/products/components'

// Redux actions
import { getProducts } from '@/features/products/store/productsSlice'

// Utilities features
import { sortingOptions } from '@/features/products/utils/sortingOptions'

// Styles
import style from './catalogPage.module.scss'

const CatalogPage = () => {
  const { products, status, searchResults } = useSelector((state) => state.products)
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearchActive = searchResults !== null;
  const dispatch = useDispatch()

  const [currentSortId, setCurrentSortId] = useState('default');

  const currentPage = Number(searchParams.get('page')) || 1;


  const setCurrentPage = (newPage) => {
    setSearchParams({ page: newPage });
  };


  useEffect(() => {
    if (!isSearchActive) {
      const activeSortOption = sortingOptions.find(opt => opt.id === currentSortId);

      const params = {
        page: currentPage,
        sortBy: activeSortOption.sortBy,
        order: activeSortOption.order
      };

      dispatch(getProducts(params));
    }
  }, [dispatch, currentPage, isSearchActive, currentSortId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  if (status === 'loading') {
    return (
      <Loader />
    )
  }
  if (status === 'failed') {
    return (<ErrorView />)
  }
  if (status === 'succeeded') {
    const productsToDisplay = isSearchActive ? searchResults : products
    return (
      <main className='container'>
        {!isSearchActive && (
          <SortPanel
            options={sortingOptions}
            currentSort={currentSortId}
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
              onPageChange={setCurrentPage}
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