import ProductCard from '../../components/layout/ProductCard/ProductCard'
import Loader from '../../components/ui/Loader/Loader'
import { useSelector } from 'react-redux'
import ErrorView from '../ErrorView/ErrorView'
import BottomNav from '../../components/layout/BottomNav/BottomNav'
import style from './catalogPage.module.scss'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { getProducts } from '../../store/features/productsSlice'
import { useSearchParams } from 'react-router-dom'
const CatalogPage = () => {
  const { products, status, searchResults } = useSelector((state) => state.products)
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearchActive = searchResults !== null;
  const dispatch = useDispatch()

  const currentPage = Number(searchParams.get('page')) || 1;


  const setCurrentPage = (newPage) => {
    setSearchParams({ page: newPage });
  };


  useEffect(() => {
    if (!isSearchActive) {
      dispatch(getProducts(currentPage));
    }
  }, [dispatch, currentPage, isSearchActive]);

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
        <div className={style.content}>
          {
            productsToDisplay.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          }
          {
            isSearchActive && productsToDisplay.length === 0 && (
              <div>
                <h3>По вашему запросу ничего не найдено</h3>
                <p>Попробуйте изменить поисковый запрос.</p>
              </div>
            )
          }
        </div>
        {
          !isSearchActive && (
            <BottomNav
              totalItems={100}
              currentPage={currentPage}
              itemsPerPage={12}
              setCurrentPage={setCurrentPage}
            />
          )
        }
      </main>
    )
  }

  return <Loader />;
}

export default CatalogPage