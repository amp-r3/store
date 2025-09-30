import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { getProducts } from "./store/features/productsSlice"
import { Route, Routes } from 'react-router-dom'
import ProductPage from './pages/ProductPage/ProductPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import Layout from './components/layout/Layout'
import ProductCatalogPage from './pages/ProductCatalogPage/ProductCatalogPage'
const App = () => {
  const dispatch = useDispatch()
  useEffect(
    () => {
      dispatch(getProducts(100))
    },
    [dispatch])
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProductCatalogPage />} />
        </Route>
          <Route path='*' element={<NotFoundPage />}></Route>
          <Route path='/404' element={<NotFoundPage />}></Route>
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </>
  )
}
export default App