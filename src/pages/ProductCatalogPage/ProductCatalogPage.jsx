import '../../styles/main.scss'
import ProductCard from '../../components/layout/ProductCard/ProductCard'
import Loader from '../../components/ui/Loader/Loader'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import ErrorView from '../ErrorView/ErrorView'
import BottomNav from '../../components/layout/BottomNav/BottomNav'
const ProductCatalogPage = () => {
  const { status } = useSelector((state) => state.products)
  const [currentPage, setCurrentPage] = useState(1)
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
          <ProductCard />
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

export default ProductCatalogPage