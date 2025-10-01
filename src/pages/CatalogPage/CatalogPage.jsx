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
  const { products, status } = useSelector((state) => state.products)
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;

  const setCurrentPage = (newPage) => {
    setSearchParams({ page: newPage });
  };


  const dispatch = useDispatch()
  useEffect(
    () => {
      dispatch(getProducts(currentPage))
    },
    [dispatch, currentPage])
  if (status === 'loading') {
    return (
      <Loader />
    )
  }
  if (status === 'failed') {
    return (<ErrorView />)
  }
  if (status === 'succeeded') {
    const productsArr = Object.values(products);
    return (
      <main className='container'>
        <div className={style.content}>
          {
            productsArr.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          }
        </div>
        <BottomNav
          totalItems={100}
          currentPage={currentPage}
          itemsPerPage={12}
          setCurrentPage={setCurrentPage} />
      </main>
    )
  }

  return <Loader />;
}

export default CatalogPage